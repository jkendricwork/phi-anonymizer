"""Application configuration."""

from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""

    PROJECT_NAME: str = "Anonymizer"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"

    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080"
    ]

    # Add your configuration here
    DEBUG: bool = True

    # LLM Provider Settings
    LLM_PROVIDER: str = "anthropic"  # anthropic|openai|local
    ANTHROPIC_API_KEY: str = ""
    OPENAI_API_KEY: str = ""

    # Ollama / Local Model Settings
    OLLAMA_BASE_URL: str = "http://localhost:11434"  # Ollama default
    OLLAMA_MODEL: str = "llama2"  # Default local model

    # Default LLM Parameters
    DEFAULT_TEMPERATURE: float = 0.3
    DEFAULT_MAX_TOKENS: int = 8000
    DEFAULT_TOP_P: float = 1.0
    DEFAULT_CONTEXT_LENGTH: int = 4096  # For Ollama models

    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    TEMP_FILE_TTL: int = 3600  # 1 hour in seconds
    TEMP_DIR: str = "/tmp/anonymizer"
    ALLOWED_FILE_TYPES: List[str] = [".docx", ".pdf"]

    # OCR Settings
    TESSERACT_PATH: str = "/usr/bin/tesseract"
    TESSERACT_LANG: str = "eng"  # Default language

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
