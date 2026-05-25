from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://chatuser:chatpass@localhost:5432/chatdb"
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080

    MINIMAX_API_KEY: str
    MINIMAX_GROUP_ID: str
    MINIMAX_MODEL: str = "abab6.5s-chat"

    REDIS_URL: str = "redis://localhost:6379"

    class Config:
        env_file = ".env"


settings = Settings()
