from fastapi import APIRouter, Depends
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/profile")
async def profile(user=Depends(get_current_user)):
    return user
