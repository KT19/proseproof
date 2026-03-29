import os
import yaml
from pathlib import Path
from typing import Any

CONFIG_PATH = Path(__file__).parent.parent / "config" / "app.yaml"


def load_config() -> dict[str, Any]:
    """Load configuration from YAML file."""
    with open(CONFIG_PATH, "r") as f:
        return yaml.safe_load(f)


_config = load_config()


# Application config (ENV takes precedence over YAML)
APP_NAME = os.getenv("APP_NAME", _config["app"]["name"])
DEBUG = os.getenv("DEBUG", "true").lower() == "true"
HOST = os.getenv("BACKEND_HOST", _config["app"]["host"])
PORT = int(os.getenv("BACKEND_PORT", _config["app"]["port"]))

# Database config
DATABASE_URL = _config["database"]["url"]
DATABASE_ECHO = _config["database"]["echo"]

# Ollama config (ENV takes precedence over YAML)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", _config["ollama"]["base_url"])
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", _config["ollama"]["model"])
OLLAMA_TIMEOUT = _config["ollama"]["timeout"]
OLLAMA_TEMPERATURE = _config["ollama"]["temperature"]
OLLAMA_MAX_RETRIES = _config["ollama"]["max_retries"]

# Analysis config
MAX_TEXT_LENGTH = _config["analysis"]["max_text_length"]
DEFAULT_SCORE = _config["analysis"]["default_score"]
