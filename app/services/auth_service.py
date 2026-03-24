from app.core.security import hash_password, verify_password, create_access_token

async def register_user(db, email: str, password: str):
    existing = await db.users.find_one({"email": email})
    if existing:
        return {"error": "User exists"}

    user = {
        "email": email,
        "password_hash": hash_password(password)
    }

    result = await db.users.insert_one(user)
    return {"id": str(result.inserted_id), "email": email}

async def login_user(db, email: str, password: str):
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user["password_hash"]):
        return None

    token = create_access_token({"user_id": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}
