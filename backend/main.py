from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
from database import engine, SessionLocal
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError
from datetime import datetime, timedelta, date
import models
import schemas

# Налаштування для безпечного хешування паролів
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_password_hash(password):
    return pwd_context.hash(password)

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

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Не вдалося перевірити облікові дані",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Розшифровуємо токен
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    # Шукаємо юзера в базі
    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

# Ендпоінт для ДОДАВАННЯ нового тренування (POST)
@app.post("/api/workouts")
def create_workout(workout_type: str, duration: int, distance: float, workout_date: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Якщо дату не передали, ставимо поточну
    final_date = workout_date if workout_date else date.today().isoformat()
    
    new_workout = models.Workout(
        workout_type=workout_type, 
        duration=duration, 
        distance=distance,
        date=final_date,
        owner_id=current_user.id  
    )
    db.add(new_workout)
    db.commit()
    db.refresh(new_workout)
    return new_workout

# Ендпоінт для ОТРИМАННЯ всіх тренувань (GET)
@app.get("/api/workouts")
def get_workouts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Віддаємо тренування ТІЛЬКИ цього користувача
    workouts = db.query(models.Workout).filter(models.Workout.owner_id == current_user.id).all()
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

# Ендпоінт для реєстрації
@app.post("/api/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Перевіряємо, чи немає вже такого email у базі
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Користувач з таким email вже існує")
    
    # Створюємо нового користувача з захешованим паролем
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

# Налаштування для JWT-токенів
SECRET_KEY = "super_secret_key_for_workout_app" # Секретний ключ для підпису
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # Токен діє 1 годину

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Ендпоінт для ЛОГІНУ
@app.post("/api/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Зверни увагу: OAuth2PasswordRequestForm очікує поле 'username', 
    # тому ми передаватимемо наш email саме в це поле
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # Перевіряємо, чи є юзер і чи збігається пароль
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Неправильний email або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Якщо все ок - генеруємо токен
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

    # Ендпоінт для ОНОВЛЕННЯ тренування (PUT)
@app.put("/api/workouts/{workout_id}")
def update_workout(workout_id: int, workout_type: str, duration: int, distance: float, workout_date: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Шукаємо запис, який належить саме цьому юзеру
    workout = db.query(models.Workout).filter(models.Workout.id == workout_id, models.Workout.owner_id == current_user.id).first()
    
    if not workout:
        raise HTTPException(status_code=404, detail="Тренування не знайдено або немає доступу")
    
    workout.workout_type = workout_type
    workout.duration = duration
    workout.distance = distance
    if workout_date:
        workout.date = workout_date
        
    db.commit()
    db.refresh(workout)
    return workout