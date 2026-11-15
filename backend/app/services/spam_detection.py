import re
import unicodedata


_SPAM_TERMS = {
    "blyad",
    "debil",
    "govno",
    "hueta",
    "mudak",
    "pidor",
    "suka",
    "блядь",
    "бля",
    "говно",
    "дебил",
    "мудак",
    "пидор",
    "сука",
    "хуета",
}


def contains_spam_language(*values: str | None) -> bool:
    for value in values:
        if not value:
            continue
        normalized = unicodedata.normalize("NFKC", value).casefold().replace("ё", "е")
        words = re.findall(r"[a-zа-я0-9]+", normalized)
        if _SPAM_TERMS.intersection(words):
            return True
    return False
