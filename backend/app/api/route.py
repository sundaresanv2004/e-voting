from fastapi import APIRouter
from app.api.endpoints.v1 import organization, health
from app.core.config import settings

api_router = APIRouter()

# Health router
api_router.include_router(health.router, prefix="/health", tags=["health"])

# Organization router
api_router.include_router(organization.router, prefix="/organizations", tags=["organizations"])
