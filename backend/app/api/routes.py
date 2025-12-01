from fastapi import APIRouter
from . import auth_router, users, organizations

api_routes = APIRouter()

api_routes.include_router(auth_router.router)
api_routes.include_router(users.router)
api_routes.include_router(organizations.router)


@api_routes.get("/", summary="API Route")
async def api_route():
    return {
        "message": "E-Voting"
    }
