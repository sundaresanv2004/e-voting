from fastapi import FastAPI
from app.database import create_db_and_tables
from app.api import api_routes  # assuming routes contains a router named api_router
import uvicorn

app = FastAPI(title="FastAPI Org System")


@app.on_event("startup")
def startup_event():
    create_db_and_tables()


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}


# Include API routes
app.include_router(api_routes, prefix="/api")


# Run the application directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
