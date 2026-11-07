from datetime import datetime, timedelta, timezone

# Москва без перехода на летнее время, UTC+3. В slim-образе нет tzdata,
# поэтому фиксированный сдвиг надёжнее, чем ZoneInfo("Europe/Moscow").
MOSCOW_TZ = timezone(timedelta(hours=3))


def moscow_now() -> datetime:
    return datetime.now(MOSCOW_TZ)
