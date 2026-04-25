from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from app.core.config import settings
from app.api.route import api_router
from app.db.session import engine
import app.models

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "tauri://localhost",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include main API router
app.include_router(api_router, prefix=settings.API_V1_STR)


def validate_required_schema() -> None:
    inspector = inspect(engine)
    required_tables = {
        "Organization": {"id", "code", "name", "ownerId"},
        "OrganizationSettings": {"organizationId", "allowSystemConnection", "maxSystems"},
        "AuthorizedSystem": {
            "id",
            "organizationId",
            "status",
            "macAddress",
            "claimTokenHash",
            "secretTokenHash",
            "tokenExpiresAt",
        },
    }

    existing_tables = set(inspector.get_table_names())
    missing_tables = sorted(set(required_tables.keys()) - existing_tables)
    if missing_tables:
        raise RuntimeError(
            f"Database schema is missing required tables for terminal security flow: {', '.join(missing_tables)}"
        )

    for table_name, required_columns in required_tables.items():
        existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
        missing_columns = sorted(required_columns - existing_columns)
        if missing_columns:
            raise RuntimeError(
                f"Database schema is missing required columns on {table_name}: {', '.join(missing_columns)}"
            )


@app.on_event("startup")
def validate_backend_schema() -> None:
    validate_required_schema()

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "description": settings.PROJECT_DESCRIPTION,
        "version": settings.PROJECT_VERSION
    }
