from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def jobs():
    return []
