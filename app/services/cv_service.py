from datetime import datetime

async def create_cv(db, user_id: str, text: str):
    cv = {
        "user_id": user_id,
        "original_text": text,
        "optimized_text": None,
        "created_at": datetime.utcnow()
    }
    result = await db.cvs.insert_one(cv)
    return str(result.inserted_id)

async def analyze_cv(cv_text: str, job_desc: str):
    return {
        "score": 85,
        "suggestions": ["Add metrics", "Use keywords"]
    }
