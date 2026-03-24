from fastapi import APIRouter, Depends, HTTPException
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import register_user, login_user
from app.core.mongodb import get_db

router = APIRouter()

@router.post("/register")
async def register(data: UserCreate, db=Depends(get_db)):
    return await register_user(db, data.email, data.password)

@router.post("/login")
async def login(data: UserLogin, db=Depends(get_db)):
    result = await login_user(db, data.email, data.password)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return result
