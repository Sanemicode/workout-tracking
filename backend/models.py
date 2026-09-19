from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True) # Виправлено тут
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    # Зв'язок: один користувач може мати багато тренувань
    workouts = relationship("Workout", back_populates="owner")

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True) # Виправлено тут
    workout_type = Column(String, index=True)
    duration = Column(Integer)
    distance = Column(Float)
    
    # Прив'язуємо тренування до конкретного користувача
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="workouts")