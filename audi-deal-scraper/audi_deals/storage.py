"""Persistent per-VIN price history.

History is a small JSON file committed back to the repo by the daily workflow,
so "what did this car cost yesterday?" survives across runs (GitHub Actions
runners are ephemeral). Structure::

    {
      "vins": {
        "WAU...": {
          "label": "2024 Audi e-tron GT",
          "msrp": 106500.0,
          "url": "...",
          "last_seen": "2026-06-27",
          "prices": [{"date": "2026-06-26", "price": 99900.0}, ...]
        }
      }
    }
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Optional

from .models import Listing

log = logging.getLogger(__name__)

MAX_POINTS_PER_VIN = 90        # keep ~3 months of daily points
PRUNE_UNSEEN_AFTER = 60        # forget VINs not seen for this many runs/days


class History:
    def __init__(self, data: dict | None = None) -> None:
        self.data = data or {"vins": {}}
        self.data.setdefault("vins", {})

    @classmethod
    def load(cls, path: Path) -> "History":
        if path.exists():
            try:
                return cls(json.loads(path.read_text()))
            except (json.JSONDecodeError, OSError) as exc:
                log.warning("could not read history %s: %s; starting fresh",
                            path, exc)
        return cls()

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.data, indent=2, sort_keys=True))

    def last_price(self, vin: str) -> Optional[float]:
        rec = self.data["vins"].get(vin.upper())
        if not rec or not rec.get("prices"):
            return None
        return rec["prices"][-1]["price"]

    def record(self, listing: Listing, today: str) -> None:
        """Append today's price for a VIN (idempotent per day)."""
        if not listing.vin or listing.price is None:
            return
        rec = self.data["vins"].setdefault(listing.vin, {"prices": []})
        rec["label"] = listing.label
        rec["msrp"] = listing.msrp
        rec["url"] = listing.url
        rec["last_seen"] = today

        prices = rec["prices"]
        if prices and prices[-1]["date"] == today:
            prices[-1]["price"] = listing.price        # overwrite same-day
        else:
            prices.append({"date": today, "price": listing.price})
        if len(prices) > MAX_POINTS_PER_VIN:
            del prices[:-MAX_POINTS_PER_VIN]

    def prune(self, today: str) -> None:
        """Drop VINs we haven't seen in a long time to keep the file small."""
        def days_between(a: str, b: str) -> int:
            from datetime import date
            try:
                ya, ma, da = map(int, a.split("-"))
                yb, mb, db = map(int, b.split("-"))
                return abs((date(yb, mb, db) - date(ya, ma, da)).days)
            except ValueError:
                return 0

        stale = [
            vin for vin, rec in self.data["vins"].items()
            if rec.get("last_seen") and days_between(rec["last_seen"], today) > PRUNE_UNSEEN_AFTER
        ]
        for vin in stale:
            del self.data["vins"][vin]
        if stale:
            log.info("pruned %d stale VIN(s) from history", len(stale))
