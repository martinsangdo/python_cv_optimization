from fastapi import APIRouter, Depends
from app.services.cv_service import create_cv
from app.core.mongodb import get_db
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/")
async def upload_cv(text: str, db=Depends(get_db), user=Depends(get_current_user)):
    cv_id = await create_cv(db, user["user_id"], text)
    return {"cv_id": cv_id}
