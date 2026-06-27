"""Configuration loading.

Config comes from a YAML file (defaults to ``config.yaml`` next to the project
root), with secrets and a few overridable values pulled from environment
variables so they never get committed.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

import yaml


@dataclass
class SearchConfig:
    make: str = "Audi"
    models: list[str] = field(default_factory=lambda: ["e-tron GT"])
    condition: str = "new"               # new | used | all
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    zip: Optional[str] = None            # center point; None => nationwide
    radius_miles: int = 0                # 0 => nationwide
    max_listings: int = 500


@dataclass
class Thresholds:
    # Alert when asking price is at least this far below MSRP.
    min_discount_pct: float = 8.0
    min_discount_usd: float = 0.0
    # Alert when a VIN's price falls at least this much vs. the last run.
    min_day_drop_pct: float = 2.0
    min_day_drop_usd: float = 1500.0


@dataclass
class NotifyConfig:
    email_to: Optional[str] = None
    # Send the daily email even when nothing crossed a threshold.
    always_send_digest: bool = False
    # Cap how many deals are listed in the email body.
    max_deals_in_email: int = 40


@dataclass
class EmailCreds:
    host: Optional[str] = None
    port: int = 587
    user: Optional[str] = None
    password: Optional[str] = None
    sender: Optional[str] = None
    use_tls: bool = True

    @property
    def configured(self) -> bool:
        return bool(self.host and self.user and self.password)


@dataclass
class Config:
    search: SearchConfig = field(default_factory=SearchConfig)
    thresholds: Thresholds = field(default_factory=Thresholds)
    notify: NotifyConfig = field(default_factory=NotifyConfig)
    sources: list[str] = field(default_factory=lambda: ["marketcheck"])
    marketcheck_api_key: Optional[str] = None
    email: EmailCreds = field(default_factory=EmailCreds)
    data_dir: Path = field(default_factory=lambda: Path("data"))


def _merge(dataclass_obj: Any, raw: Optional[dict]) -> Any:
    """Overlay known keys from ``raw`` onto a dataclass instance."""
    if not raw:
        return dataclass_obj
    for key, value in raw.items():
        if hasattr(dataclass_obj, key) and value is not None:
            setattr(dataclass_obj, key, value)
    return dataclass_obj


def load_config(path: str | os.PathLike | None = None) -> Config:
    """Load YAML config and overlay environment-provided secrets/overrides."""
    cfg = Config()

    cfg_path = Path(path) if path else Path("config.yaml")
    if cfg_path.exists():
        raw = yaml.safe_load(cfg_path.read_text()) or {}
        _merge(cfg.search, raw.get("search"))
        _merge(cfg.thresholds, raw.get("thresholds"))
        _merge(cfg.notify, raw.get("notify"))
        if raw.get("sources"):
            cfg.sources = list(raw["sources"])
        if raw.get("data_dir"):
            cfg.data_dir = Path(raw["data_dir"])

    # Secrets / CI overrides — always from the environment.
    cfg.marketcheck_api_key = os.getenv("MARKETCHECK_API_KEY") or cfg.marketcheck_api_key
    cfg.email.host = os.getenv("SMTP_HOST", cfg.email.host)
    cfg.email.port = int(os.getenv("SMTP_PORT", cfg.email.port))
    cfg.email.user = os.getenv("SMTP_USER", cfg.email.user)
    cfg.email.password = os.getenv("SMTP_PASSWORD", cfg.email.password)
    cfg.email.sender = os.getenv("EMAIL_FROM", cfg.email.sender or cfg.email.user)

    env_to = os.getenv("EMAIL_TO")
    if env_to:
        cfg.notify.email_to = env_to

    return cfg
