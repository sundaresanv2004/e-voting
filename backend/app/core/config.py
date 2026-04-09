from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", case_sensitive=True
    )
    
    PROJECT_NAME: str = "E-Voting"
    VERSION: str = "26.0.1"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = "secret" # Change this in production
    
    # Database defaults (will be overridden by .env if present)
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "evoting"
    SQLALCHEMY_DATABASE_URI: str | None = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Build the URI from components if not provided in .env
        if not self.SQLALCHEMY_DATABASE_URI:
            self.SQLALCHEMY_DATABASE_URI = f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

settings = Settings()
