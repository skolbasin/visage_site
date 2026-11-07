import logging
import sys
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path
from app.core.config import settings


def setup_logging():
    """
    Настройка логирования в зависимости от режима DEBUG.
    - DEBUG=True: логи выводятся в stdout (консоль).
    - DEBUG=False: логи пишутся в файлы logs/access.log и logs/error.log с ежедневной ротацией.
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"
    formatter = logging.Formatter(log_format, date_format)

    # Создаём корневой логгер
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Удаляем существующие обработчики, чтобы не дублировать
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    if settings.DEBUG:
        # Разработка: выводим в stdout
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)

        # Принудительный сброс буфера
        sys.stdout.reconfigure(line_buffering=True)
    else:
        # Продакшн: пишем в файлы с ротацией по дням
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)

        # Файл для всех логов (уровень INFO и выше)
        info_handler = TimedRotatingFileHandler(
            filename=log_dir / "access.log",
            when="midnight",
            interval=1,
            backupCount=30,
            encoding="utf-8",
        )
        info_handler.setLevel(logging.INFO)
        info_handler.setFormatter(formatter)
        root_logger.addHandler(info_handler)

        # Файл для ошибок (только ERROR и CRITICAL)
        error_handler = TimedRotatingFileHandler(
            filename=log_dir / "error.log",
            when="midnight",
            interval=1,
            backupCount=30,
            encoding="utf-8",
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        root_logger.addHandler(error_handler)

    # Почта и утренний отчёт всегда в stdout: docker logs их показывает,
    # даже когда остальные логи приложения пишутся только в файл.
    _attach_mail_stdout(formatter)

    # Отдельные настройки для библиотек (меньше шума)
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


_MAIL_LOGGERS = (
    "app.services.email_service",
    "app.services.digest_service",
    "app.services.digest_scheduler",
)


def _attach_mail_stdout(formatter: logging.Formatter) -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    handler.setFormatter(formatter)
    for name in _MAIL_LOGGERS:
        mail_logger = logging.getLogger(name)
        mail_logger.setLevel(logging.INFO)
        mail_logger.handlers = [
            item
            for item in mail_logger.handlers
            if not getattr(item, "mail_stdout", False)
        ]
        handler.mail_stdout = True
        mail_logger.addHandler(handler)
        mail_logger.propagate = False
