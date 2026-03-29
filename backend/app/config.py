import os
import yaml
from pathlib import Path
from typing import Any
from dotenv import load_dotenv

CONFIG_PATH = Path(__file__).parent.parent / "config" / "app.yaml"
PROJECT_ROOT = CONFIG_PATH.parent.parent.parent
ENV_PATH = PROJECT_ROOT / ".env"


def _load_env() -> None:
    """Load environment variables from the project root .env file."""
    load_dotenv(ENV_PATH, override=False)


def _normalize_base_url(url: str) -> str:
    """Accept host:port values by defaulting to HTTP."""
    cleaned = url.strip().rstrip("/")
    if "://" not in cleaned:
        return f"http://{cleaned}"
    return cleaned


def load_config() -> dict[str, Any]:
    """Load configuration from YAML file."""
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


_config = load_config()
_load_env()


# Application config (ENV takes precedence over YAML)
APP_NAME = os.getenv("APP_NAME", _config["app"]["name"])
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
HOST = os.getenv("BACKEND_HOST", _config["app"]["host"])
PORT = int(os.getenv("BACKEND_PORT", _config["app"]["port"]))

# Database config
DATABASE_URL = _config["database"]["url"]
DATABASE_ECHO = _config["database"]["echo"]

# Ollama config (ENV takes precedence over YAML)
OLLAMA_BASE_URL = _normalize_base_url(
    os.getenv("OLLAMA_BASE_URL", _config["ollama"]["base_url"])
)
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", _config["ollama"]["model"])
OLLAMA_TIMEOUT = _config["ollama"]["timeout"]
OLLAMA_TEMPERATURE = _config["ollama"]["temperature"]
OLLAMA_MAX_RETRIES = _config["ollama"]["max_retries"]

# Analysis config
MAX_TEXT_LENGTH = _config["analysis"]["max_text_length"]
DEFAULT_SCORE = _config["analysis"]["default_score"]
