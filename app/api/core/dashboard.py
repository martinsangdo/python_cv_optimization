from fastapi import APIRouter, Depends
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/")
async def dashboard(user=Depends(get_current_user)):
    return {"message": "Welcome", "user": user}
