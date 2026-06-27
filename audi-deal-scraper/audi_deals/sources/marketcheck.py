"""MarketCheck source adapter (recommended).

MarketCheck indexes active inventory from dealer websites across the US,
including MSRP and the dealer's asking price, and exposes it as clean JSON.
Get a key (free trial tier available) at https://www.marketcheck.com/apis and
set it as the ``MARKETCHECK_API_KEY`` environment variable / GitHub secret.

API reference: https://apidocs.marketcheck.com/  (endpoint: active car search)
"""

from __future__ import annotations

import logging

import requests

from ..models import Listing
from .base import Source

log = logging.getLogger(__name__)

BASE_URL = "https://mc-api.marketcheck.com/v2/search/car/active"
PAGE_SIZE = 50


def _num(value) -> float | None:
    try:
        if value in (None, "", "0", 0):
            return None if value in (None, "") else float(value)
        return float(value)
    except (TypeError, ValueError):
        return None


def _int(value) -> int | None:
    n = _num(value)
    return int(n) if n is not None else None


class MarketCheckSource(Source):
    name = "marketcheck"

    def fetch(self) -> list[Listing]:
        if not self.config.marketcheck_api_key:
            log.warning("MARKETCHECK_API_KEY not set; skipping marketcheck source")
            return []

        search = self.config.search
        listings: list[Listing] = []

        for model in search.models:
            listings.extend(self._fetch_model(model))

        log.info("marketcheck: %d listings across %d model(s)",
                 len(listings), len(search.models))
        return listings

    def _fetch_model(self, model: str) -> list[Listing]:
        search = self.config.search
        params = {
            "api_key": self.config.marketcheck_api_key,
            "make": search.make,
            "model": model,
            "rows": PAGE_SIZE,
            "start": 0,
            "sort_by": "price",
            "sort_order": "asc",
            "include_relevant_links": "false",
        }
        if search.condition in ("new", "used"):
            params["car_type"] = search.condition
        if search.year_min:
            params["year_min"] = search.year_min
        if search.year_max:
            params["year_max"] = search.year_max
        if search.zip and search.radius_miles > 0:
            params["zip"] = search.zip
            params["radius"] = search.radius_miles
        # No zip/radius => nationwide.

        out: list[Listing] = []
        start = 0
        while len(out) < search.max_listings:
            params["start"] = start
            try:
                resp = requests.get(BASE_URL, params=params, timeout=30)
                resp.raise_for_status()
                data = resp.json()
            except (requests.RequestException, ValueError) as exc:
                log.error("marketcheck request failed (model=%s start=%d): %s",
                          model, start, exc)
                break

            rows = data.get("listings") or []
            if not rows:
                break

            for row in rows:
                parsed = self._parse_row(row)
                if parsed:
                    out.append(parsed)

            start += PAGE_SIZE
            if start >= int(data.get("num_found", 0)):
                break

        return out

    def _parse_row(self, row: dict) -> Listing | None:
        build = row.get("build") or {}
        dealer = row.get("dealer") or {}
        vin = row.get("vin")
        if not vin:
            return None
        return Listing(
            vin=vin,
            year=_int(build.get("year")),
            make=build.get("make") or self.config.search.make,
            model=build.get("model") or "",
            trim=build.get("trim"),
            price=_num(row.get("price")),
            msrp=_num(row.get("msrp")),
            condition=(row.get("inventory_type") or "unknown"),
            miles=_num(row.get("miles")),
            dealer_name=dealer.get("name"),
            dealer_city=dealer.get("city"),
            dealer_state=dealer.get("state"),
            url=row.get("vdp_url"),
            source=self.name,
        )
