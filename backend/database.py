import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Обов'язково замініть 'ваш_пароль' на той, що ви придумали при встановленні PostgreSQL
SQLALCHEMY_DATABASE_URL = os.getenv(
    "postgresql://workout_db_qjw8_user:Yx4pWEsUyCslWaGwhWpzqgt4QWlOoVHQ@dpg-daogoaid0e5s7387656g-a/workout_db_qjw8", 
    "postgresql://postgres:SilverSmith@localhost/workout_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()