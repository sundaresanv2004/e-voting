from fastapi import APIRouter
from app.api.api_v1.endpoints import health, organizations

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["organizations"])
