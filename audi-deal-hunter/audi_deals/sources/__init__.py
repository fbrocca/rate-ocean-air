"""Source registry."""

from __future__ import annotations

from ..config import Config
from .base import Source
from .cars_com import CarsComSource
from .marketcheck import MarketCheckSource

_REGISTRY = {
    MarketCheckSource.name: MarketCheckSource,
    CarsComSource.name: CarsComSource,
}


def build_sources(config: Config) -> list[Source]:
    sources: list[Source] = []
    for name in config.sources:
        cls = _REGISTRY.get(name)
        if cls is None:
            raise ValueError(
                f"Unknown source '{name}'. Known: {sorted(_REGISTRY)}"
            )
        sources.append(cls(config))
    return sources
