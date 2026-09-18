from sqlalchemy import Column, Integer, String, Float
from database import Base

class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    workout_type = Column(String, index=True)  # Наприклад: 'Біг', 'Велосипед'
    duration = Column(Integer)                 # Час у хвилинах
    distance = Column(Float)                   # Відстань у кілометрах