from pydantic import BaseModel
from datetime import datetime

class QuestionCreate(BaseModel):
    message: str
    contact_type: str  # 'telegram', 'phone', 'email'
    contact_value: str

class QuestionOut(BaseModel):
    id: int
    message: str
    contact_type: str
    contact_value: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionUpdateStatus(BaseModel):
    status: str  # 'new', 'in_progress', 'completed'