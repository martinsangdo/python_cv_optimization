from fastapi import FastAPI
from app.api.public import auth
from app.api.core import dashboard, cv, job, report
from app.api.account import profile, billing

app = FastAPI(title="CV Optimizer SaaS (MongoDB)")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(cv.router, prefix="/cv", tags=["CV"])
app.include_router(job.router, prefix="/jobs", tags=["Jobs"])
app.include_router(report.router, prefix="/reports", tags=["Reports"])
app.include_router(profile.router, prefix="/account", tags=["Account"])
app.include_router(billing.router, prefix="/account", tags=["Billing"])

@app.get("/")
async def root():
    return {"message": "API is running"}
