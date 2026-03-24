from fastapi import APIRouter

router = APIRouter()

@router.get("/billing")
async def billing():
    return {"plan": "free"}
