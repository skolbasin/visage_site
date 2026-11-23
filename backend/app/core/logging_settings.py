import logging
import re
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from app.core.config import settings


class ThreeDayFileHandler(logging.Handler):
    def __init__(
        self,
        log_dir: Path,
        filename: str,
        retention_days: int = 183,
    ):
        super().__init__()
        self.log_dir = log_dir
        self.filename = filename
        self.retention_days = retention_days
        self.stream = None
        self.current_path = None
        self.last_cleanup_date = None
        self._file_pattern = re.compile(
            rf"^{re.escape(filename.removesuffix('.log'))}-(\d{{4}}-\d{{2}}-\d{{2}})\.log$"
        )
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.last_cleanup_date = datetime.now(timezone.utc).date()
        self._cleanup_old_files(self.last_cleanup_date)

    def _path_for(self, current_date: date) -> Path:
        period_start_day = ((current_date.day - 1) // 3) * 3 + 1
        period_start = current_date.replace(day=period_start_day)
        return (
            self.log_dir
            / f"{current_date.year:04d}"
            / f"{current_date.month:02d}"
            / f"{self.filename.removesuffix('.log')}-{period_start.isoformat()}.log"
        )

    def _cleanup_old_files(self, current_date: date) -> None:
        cutoff_date = current_date - timedelta(days=self.retention_days)
        for path in self.log_dir.glob("*/*/*.log"):
            match = self._file_pattern.match(path.name)
            if not match:
                continue
            try:
                period_start = date.fromisoformat(match.group(1))
            except ValueError:
                continue
            if (
                path.parent.name != f"{period_start.month:02d}"
                or path.parent.parent.name != f"{period_start.year:04d}"
            ):
                continue
            if period_start + timedelta(days=2) < cutoff_date:
                path.unlink(missing_ok=True)
                try:
                    path.parent.rmdir()
                    path.parent.parent.rmdir()
                except OSError:
                    pass

    def emit(self, record: logging.LogRecord) -> None:
        try:
            current_date = datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).date()
            path = self._path_for(current_date)
            with self.lock:
                if path != self.current_path:
                    if self.stream is not None:
                        self.stream.close()
                    path.parent.mkdir(parents=True, exist_ok=True)
                    self.stream = path.open("a", encoding="utf-8")
                    self.current_path = path

                self.stream.write(f"{self.format(record)}{self.terminator}")
                self.stream.flush()

                if self.last_cleanup_date != current_date:
                    self._cleanup_old_files(current_date)
                    self.last_cleanup_date = current_date
        except Exception:
            self.handleError(record)

    @property
    def terminator(self) -> str:
        return "\n"

    def close(self) -> None:
        with self.lock:
            if self.stream is not None:
                self.stream.close()
                self.stream = None
                self.current_path = None
        super().close()


def setup_logging():
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S UTC"
    formatter = logging.Formatter(log_format, date_format)
    formatter.converter = time.gmtime

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
        handler.close()

    if settings.DEBUG:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        sys.stdout.reconfigure(line_buffering=True)
    else:
        log_dir = Path("logs")
        for filename, level in (("access.log", logging.INFO), ("error.log", logging.ERROR)):
            handler = ThreeDayFileHandler(log_dir, filename)
            handler.setLevel(level)
            handler.setFormatter(formatter)
            root_logger.addHandler(handler)

    _attach_mail_stdout(formatter)

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
