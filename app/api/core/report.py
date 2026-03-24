from fastapi import APIRouter

router = APIRouter()

@router.get("/{id}")
async def report(id: str):
    return {"id": id, "score": 80}
