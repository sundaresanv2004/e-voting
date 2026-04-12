from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-Voting API"
    PROJECT_DESCRIPTION: str = "FastAPI Backend for E-Voting System"
    PROJECT_VERSION: str = "26.0.1"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "postgresql+psycopg://myuser:mypassword@localhost:5432/e_voting"
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
