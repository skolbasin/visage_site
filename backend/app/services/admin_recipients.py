import enum
from dataclasses import dataclass
from typing import List

from app.core.config import settings


class AdminKey(str, enum.Enum):
    sereja = "sereja"
    nastya = "nastya"


@dataclass(frozen=True)
class AdminContact:
    key: AdminKey
    name: str
    email: str


def admin_contacts() -> List[AdminContact]:
    """Сергей и Анастасия, у кого задан адрес."""
    raw = (
        (AdminKey.sereja, "Сергей", settings.ADMIN_EMAIL),
        (AdminKey.nastya, "Анастасия", settings.ANASTASIA_EMAIL),
    )
    contacts: List[AdminContact] = []
    for key, name, email in raw:
        cleaned = (email or "").strip()
        if not cleaned:
            continue
        contacts.append(AdminContact(key=key, name=name, email=cleaned))
    return contacts


def notification_emails() -> List[str]:
    """Адреса для общих писем: запись, сертификат, вопрос."""
    seen = set()
    emails: List[str] = []
    for contact in admin_contacts():
        folded = contact.email.casefold()
        if folded in seen:
            continue
        seen.add(folded)
        emails.append(contact.email)
    return emails
