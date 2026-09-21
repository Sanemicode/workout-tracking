import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Обов'язково замініть 'ваш_пароль' на той, що ви придумали при встановленні PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv(
    "https://dashboard.render.com/d/dpg-daogoaid0e5s7387656g-a?utm_source=gemini", 
    "postgresql://postgres:SilverSmith@localhost/workout_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()