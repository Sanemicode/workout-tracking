from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
from database import engine, SessionLocal

# Ця команда фізично створює таблиці в PostgreSQL на основі models.py
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Workout Tracker API")

# Налаштування CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"], # Дозволяємо запити від Angular
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Функція для відкриття та закриття сесії бази даних при кожному запиті
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ендпоінт для ДОДАВАННЯ нового тренування (POST)
@app.post("/api/workouts")
def create_workout(workout_type: str, duration: int, distance: float, db: Session = Depends(get_db)):
    new_workout = models.Workout(workout_type=workout_type, duration=duration, distance=distance)
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    return new_workout

# Ендпоінт для ОТРИМАННЯ всіх тренувань (GET)
@app.get("/api/workouts")
def get_workouts(db: Session = Depends(get_db)):
    workouts = db.query(models.Workout).all()
    return workouts

# Ендпоінт для ВИДАЛЕННЯ тренування (DELETE)
@app.delete("/api/workouts/{workout_id}")
def delete_workout(workout_id: int, db: Session = Depends(get_db)):
    # Шукаємо тренування за його ID
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id).first()
    if workout:
        db.delete(workout)
        db.commit()
        return {"message": "Тренування видалено"}
    return {"error": "Не знайдено"}