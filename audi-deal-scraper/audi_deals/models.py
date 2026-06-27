"""Core data structures shared across sources and the deal finder."""

from __future__ import annotations

from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class Listing:
    """A single vehicle listing from a dealership, normalized across sources.

    Every source adapter must convert its raw response into ``Listing`` objects
    so the rest of the pipeline (dedup, deal detection, history) is
    source-agnostic. ``vin`` is the stable identity used for day-over-day
    tracking, so it must be present and uppercased.
    """

    vin: str
    year: Optional[int]
    make: str
    model: str
    trim: Optional[str]
    price: Optional[float]          # dealer asking / selling price (USD)
    msrp: Optional[float]           # manufacturer suggested retail price (USD)
    condition: str                  # "new" | "used" | "unknown"
    miles: Optional[float] = None
    dealer_name: Optional[str] = None
    dealer_city: Optional[str] = None
    dealer_state: Optional[str] = None
    url: Optional[str] = None
    source: str = "unknown"

    def __post_init__(self) -> None:
        if self.vin:
            self.vin = self.vin.strip().upper()

    @property
    def discount_usd(self) -> Optional[float]:
        """Absolute dollars off MSRP (positive == below MSRP)."""
        if self.price is None or self.msrp is None or self.msrp <= 0:
            return None
        return round(self.msrp - self.price, 2)

    @property
    def discount_pct(self) -> Optional[float]:
        """Percent off MSRP (positive == below MSRP)."""
        if self.price is None or self.msrp is None or self.msrp <= 0:
            return None
        return round((self.msrp - self.price) / self.msrp * 100, 2)

    @property
    def label(self) -> str:
        bits = [str(self.year or ""), self.make, self.model, self.trim or ""]
        return " ".join(b for b in bits if b).strip()

    def location(self) -> str:
        loc = ", ".join(b for b in [self.dealer_city, self.dealer_state] if b)
        if self.dealer_name and loc:
            return f"{self.dealer_name} ({loc})"
        return self.dealer_name or loc or "Unknown dealer"

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Deal:
    """A listing flagged as noteworthy, with the reasons it was flagged."""

    listing: Listing
    reasons: list[str] = field(default_factory=list)
    previous_price: Optional[float] = None   # last price we saw for this VIN
    day_drop_usd: Optional[float] = None      # price fall since last seen
    day_drop_pct: Optional[float] = None

    def to_dict(self) -> dict:
        return {
            "listing": self.listing.to_dict(),
            "reasons": self.reasons,
            "previous_price": self.previous_price,
            "day_drop_usd": self.day_drop_usd,
            "day_drop_pct": self.day_drop_pct,
        }
