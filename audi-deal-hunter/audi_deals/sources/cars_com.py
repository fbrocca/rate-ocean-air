"""cars.com source adapter (experimental, no API key required).

cars.com aggregates new and used inventory from dealers nationwide. This
adapter parses the public search-results pages. It needs no API key, but HTML
scraping is inherently brittle: if cars.com changes their markup, the selectors
here are the single place to update. Prefer the MarketCheck source when you can.

Be a good citizen: this runs once a day with a normal User-Agent and a small
delay between pages. Review cars.com's Terms of Use before relying on it.
"""

from __future__ import annotations

import json
import logging
import re
import time

import requests
from bs4 import BeautifulSoup

from ..models import Listing
from .base import Source

log = logging.getLogger(__name__)

SEARCH_URL = "https://www.cars.com/shopping/results/"
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml",
}
PAGE_SIZE = 100


def _slug(model: str) -> str:
    # cars.com model slugs look like "audi-e_tron_gt".
    return "audi-" + model.lower().replace(" ", "_").replace("-", "_")


def _num(text) -> float | None:
    if text is None:
        return None
    m = re.search(r"[\d,]+(?:\.\d+)?", str(text))
    if not m:
        return None
    try:
        return float(m.group(0).replace(",", ""))
    except ValueError:
        return None


class CarsComSource(Source):
    name = "cars_com"

    def fetch(self) -> list[Listing]:
        search = self.config.search
        out: list[Listing] = []
        for model in search.models:
            out.extend(self._fetch_model(model))
            time.sleep(1.5)
        log.info("cars_com: %d listings", len(out))
        return out

    def _fetch_model(self, model: str) -> list[Listing]:
        search = self.config.search
        stock_type = {"new": "new", "used": "used"}.get(search.condition, "all")
        out: list[Listing] = []
        page = 1
        while len(out) < search.max_listings:
            params = {
                "stock_type": stock_type,
                "makes[]": "audi",
                "models[]": _slug(model),
                "page_size": PAGE_SIZE,
                "page": page,
                "sort": "list_price",
            }
            if search.zip:
                params["zip"] = search.zip
                params["maximum_distance"] = (
                    search.radius_miles if search.radius_miles > 0 else "all"
                )
            else:
                params["maximum_distance"] = "all"
            if search.year_min:
                params["year_min"] = search.year_min

            try:
                resp = requests.get(SEARCH_URL, params=params,
                                    headers=HEADERS, timeout=30)
                resp.raise_for_status()
            except requests.RequestException as exc:
                log.error("cars_com request failed (model=%s page=%d): %s",
                          model, page, exc)
                break

            page_listings = self._parse_page(resp.text, model)
            if not page_listings:
                break
            out.extend(page_listings)
            if len(page_listings) < PAGE_SIZE:
                break
            page += 1
            time.sleep(1.5)

        return out

    def _parse_page(self, html: str, model: str) -> list[Listing]:
        soup = BeautifulSoup(html, "html.parser")
        out: list[Listing] = []
        # Each result card carries its key fields as data-* attributes.
        for card in soup.select("div.vehicle-card[data-listing-id]"):
            try:
                listing = self._parse_card(card, model)
            except Exception as exc:  # never let one card kill the page
                log.debug("cars_com: skipped a card: %s", exc)
                continue
            if listing:
                out.append(listing)
        return out

    def _parse_card(self, card, model: str) -> Listing | None:
        # Most listing metadata is stored as JSON in a data attribute on the
        # card; fall back to visible text where it isn't.
        raw = card.get("data-tracking") or card.get("data-listing")
        meta: dict = {}
        if raw:
            try:
                meta = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                meta = {}

        vin = meta.get("vin") or card.get("data-vin")
        if not vin:
            return None

        title_el = card.select_one(".title, h2")
        title = title_el.get_text(strip=True) if title_el else ""
        year = None
        m = re.match(r"\s*(\d{4})", title)
        if m:
            year = int(m.group(1))

        price_el = card.select_one(".primary-price")
        price = _num(price_el.get_text()) if price_el else _num(meta.get("price"))
        msrp_el = card.select_one(".msrp, .secondary-price")
        msrp = _num(msrp_el.get_text()) if msrp_el else _num(meta.get("msrp"))

        miles_el = card.select_one(".mileage")
        miles = _num(miles_el.get_text()) if miles_el else None

        dealer_el = card.select_one(".dealer-name, .vehicle-dealer")
        dealer = dealer_el.get_text(strip=True) if dealer_el else meta.get("seller_name")

        link_el = card.select_one("a[href*='/vehicledetail/']")
        url = None
        if link_el and link_el.get("href"):
            href = link_el["href"]
            url = href if href.startswith("http") else f"https://www.cars.com{href}"

        condition = meta.get("stock_type") or (
            "new" if self.config.search.condition == "new" else "unknown"
        )

        return Listing(
            vin=vin,
            year=year,
            make="Audi",
            model=model,
            trim=meta.get("trim"),
            price=price,
            msrp=msrp,
            condition=condition,
            miles=miles,
            dealer_name=dealer,
            dealer_city=meta.get("seller_city"),
            dealer_state=meta.get("seller_state"),
            url=url,
            source=self.name,
        )
