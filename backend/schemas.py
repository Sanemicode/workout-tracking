from pydantic import BaseModel
from typing import Optional

class WorkoutCreate(BaseModel):
    workout_type: str
    duration: int
    distance: float
    workout_date: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str