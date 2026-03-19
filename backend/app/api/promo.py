import string
from random import random
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin_user, get_db
from app.models.promo import PromoCode
from app.schemas.promo import PromoCodeOut

router = APIRouter(prefix="/promo", tags=["promo"])


@router.get(
    "/",
    response_model=List[PromoCodeOut],
    dependencies=[Depends(get_current_admin_user)],
)
def get_all_promocodes(db: Session = Depends(get_db)):
    return db.query(PromoCode).all()


# Возможность создать промокод вручную (для акций)
@router.post(
    "/", response_model=PromoCodeOut, dependencies=[Depends(get_current_admin_user)]
)
def create_promocode(user_id: int, discount: int, db: Session = Depends(get_db)):
    # генерация кода
    code = "PROMO" + "".join(
        random.choices(string.ascii_uppercase + string.digits, k=8)
    )
    promo = PromoCode(code=code, discount_percent=discount, owner_id=user_id)
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo
