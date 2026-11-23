import json
import logging
import time
from urllib.parse import urlsplit

from fastapi import Request

logger = logging.getLogger(__name__)


def _booking_request_metadata(request: Request) -> dict:
    client_ip = request.client.host if request.client else None
    cookie_header = request.headers.get("cookie", "")
    cookie_names = sorted(
        {
            item.split("=", maxsplit=1)[0].strip()
            for item in cookie_header.split(";")
            if "=" in item and item.split("=", maxsplit=1)[0].strip()
        }
    )[:20]
    referer = request.headers.get("referer")
    if referer:
        try:
            parsed_referer = urlsplit(referer)
            safe_netloc = parsed_referer.netloc.rsplit("@", maxsplit=1)[-1]
            referer = (
                f"{parsed_referer.scheme}://{safe_netloc}{parsed_referer.path}"[:512]
            )
        except ValueError:
            referer = "[invalid]"

    return {
        "client_ip_as_seen_by_proxy": client_ip,
        "user_agent": request.headers.get("user-agent", "")[:512],
        "accept_language": request.headers.get("accept-language", "")[:256],
        "referer": referer,
        "cookie_names": cookie_names,
        "booking_id": getattr(request.state, "booking_id", None),
        "rejection_reason": getattr(request.state, "booking_rejection_reason", None),
    }


async def log_requests(request: Request, call_next):
    start_time = time.monotonic()
    is_booking_submission = (
        request.method == "POST"
        and request.url.path.rstrip("/").endswith("/booking")
    )
    try:
        response = await call_next(request)
    except Exception:
        process_time = (time.monotonic() - start_time) * 1000
        if is_booking_submission:
            details = _booking_request_metadata(request)
            details.update(
                status_code=500,
                duration_ms=round(process_time, 2),
                outcome="server_error",
            )
            logger.exception(
                "booking_request %s",
                json.dumps(details, ensure_ascii=False, separators=(",", ":")),
            )
        raise

    process_time = (time.monotonic() - start_time) * 1000
    if is_booking_submission:
        details = _booking_request_metadata(request)
        if response.status_code == 422:
            details["rejection_reason"] = (
                details["rejection_reason"] or "validation_error"
            )
        elif response.status_code == 429:
            details["rejection_reason"] = (
                details["rejection_reason"] or "rate_limit_exceeded"
            )
        details.update(
            status_code=response.status_code,
            duration_ms=round(process_time, 2),
            outcome="accepted" if response.status_code < 300 else "rejected",
        )
        logger.info(
            "booking_request %s",
            json.dumps(details, ensure_ascii=False, separators=(",", ":")),
        )

    logger.info(
        f"{request.method} {request.url.path} - {response.status_code} - {process_time:.2f}ms"
    )
    return response
