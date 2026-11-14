from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_PROJECT_ROOT = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    """Project-scoped runtime settings.

    Defaults deliberately resolve from this file, so an extracted ZIP works from any
    folder on D: without retaining the developer's original absolute path.
    """

    model_config = SettingsConfigDict(
        env_prefix="ROBOT_NAV_", env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    project_root: Path = DEFAULT_PROJECT_ROOT
    data_dir: Path = DEFAULT_PROJECT_ROOT / "backend" / "data"
    results_dir: Path = DEFAULT_PROJECT_ROOT / "experiments" / "results"
    report_dir: Path = DEFAULT_PROJECT_ROOT / "reports" / "generated"
    offline_mode: bool = True
    log_level: str = "INFO"
    api_prefix: str = "/api/v1"
    ollama_host: str = "http://127.0.0.1:11434"
    ollama_timeout_seconds: float = 90.0
    cors_origins: list[str] = Field(default_factory=lambda: ["http://127.0.0.1:5173", "http://localhost:5173"])

    def ensure_directories(self) -> None:
        for directory in (self.data_dir, self.results_dir, self.report_dir):
            directory.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.ensure_directories()
    return settings

