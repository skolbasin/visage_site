import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings
from app.db.session import SessionLocal
from app.services.admin_recipients import notification_emails
from app.services.digest_service import run_daily_digest
from app.services.moscow_time import moscow_now

logger = logging.getLogger(__name__)

DIGEST_HOUR = 10
_task: Optional[asyncio.Task] = None


def start_digest_scheduler() -> None:
    global _task
    if not settings.DIGEST_ENABLED:
        logger.warning("утренний отчёт выключен: DIGEST_ENABLED=false")
        return
    if _task is not None and not _task.done():
        return
    _task = asyncio.create_task(_digest_loop())
    key_state = "есть" if settings.RESEND_API_KEY else "нет"
    logger.info(
        "утренний отчёт включён, час %s МСК, ключ Resend: %s, адресатов: %s",
        DIGEST_HOUR,
        key_state,
        len(notification_emails()),
    )


async def stop_digest_scheduler() -> None:
    global _task
    if _task is None:
        return
    _task.cancel()
    try:
        await _task
    except asyncio.CancelledError:
        pass
    _task = None


def run_digest_job() -> None:
    db = SessionLocal()
    try:
        sent = run_daily_digest(db)
        logger.info("утренний отчёт завершён, писем: %s", len(sent))
    except Exception:
        logger.exception("утренний отчёт упал с ошибкой")
        db.rollback()
    finally:
        db.close()


async def _digest_loop() -> None:
    while True:
        now = moscow_now()
        if _is_due(now):
            logger.info("утренний отчёт: проверка %s", now.strftime("%Y-%m-%d %H:%M"))
            await asyncio.get_running_loop().run_in_executor(None, run_digest_job)
        next_at = _next_slot(moscow_now())
        logger.info("утренний отчёт: следующий запуск %s", next_at.strftime("%Y-%m-%d %H:%M"))
        await asyncio.sleep(max((next_at - moscow_now()).total_seconds(), 1.0))


def _is_due(now: datetime) -> bool:
    return now >= _slot(now)


def _next_slot(now: datetime) -> datetime:
    slot = _slot(now)
    if now >= slot:
        return slot + timedelta(days=1)
    return slot


def _seconds_until_next(now: datetime) -> float:
    return max((_next_slot(now) - now).total_seconds(), 1.0)


def _slot(now: datetime) -> datetime:
    return now.replace(hour=DIGEST_HOUR, minute=0, second=0, microsecond=0)
