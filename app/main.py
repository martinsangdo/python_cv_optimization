from fastapi import FastAPI
from app.api.public import auth
from app.api.core import dashboard, cv, job, report
from app.api.account import profile, billing
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi.requests import Request

app = FastAPI(title="CV Optimizer")

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(cv.router, prefix="/cv", tags=["CV"])
app.include_router(job.router, prefix="/jobs", tags=["Jobs"])
app.include_router(report.router, prefix="/reports", tags=["Reports"])
app.include_router(profile.router, prefix="/account", tags=["Account"])
app.include_router(billing.router, prefix="/account", tags=["Billing"])
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

#homepage
@app.get("/", response_class=HTMLResponse)
async def homepage(request: Request):
    return templates.TemplateResponse(request, "index.html", {"request": request})
