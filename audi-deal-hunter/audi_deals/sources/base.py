"""Source adapter interface."""

from __future__ import annotations

from abc import ABC, abstractmethod

from ..config import Config
from ..models import Listing


class Source(ABC):
    """A place to fetch listings from.

    Implementations turn a search config into a flat list of normalized
    ``Listing`` objects. They should be defensive: a parsing hiccup on one
    listing must not abort the whole run.
    """

    name: str = "base"

    def __init__(self, config: Config) -> None:
        self.config = config

    @abstractmethod
    def fetch(self) -> list[Listing]:
        ...
