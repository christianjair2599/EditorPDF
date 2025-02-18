from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal, init_db
from models import User
from schemas import UserCreate, UserResponse


router = APIRouter()

# Inicializar la base de datos
init_db()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(email=user.email, password=user.password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/increment-usage/{user_id}")
def increment_usage(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.usage_count += 1
    db.commit()

    return {"message": "Usage incremented", "usage_count": user.usage_count}

@router.get("/hello")
def hello():
    return {"message": "Hola desde routes.py"}