"""Decide which listings are noteworthy.

Two independent triggers, matching the goal of "find the cheapest possible
deal and catch crazy price drops":

1. Big discount off MSRP        -> ``min_discount_pct`` / ``min_discount_usd``
2. Sharp day-over-day price drop -> ``min_day_drop_pct`` / ``min_day_drop_usd``

A listing only needs to satisfy one trigger to be flagged. The reasons are
recorded so the email can explain *why* each car surfaced.
"""

from __future__ import annotations

from .config import Thresholds
from .models import Deal, Listing
from .storage import History


def dedupe(listings: list[Listing]) -> list[Listing]:
    """Collapse duplicate VINs (same car listed via multiple sources).

    Keep the cheapest price seen, preferring a row that actually has an MSRP.
    """
    best: dict[str, Listing] = {}
    for lst in listings:
        if not lst.vin:
            continue
        cur = best.get(lst.vin)
        if cur is None:
            best[lst.vin] = lst
            continue
        # Prefer the one with MSRP; among those, prefer the lower price.
        cur_key = (cur.msrp is not None, -(cur.price or float("inf")))
        new_key = (lst.msrp is not None, -(lst.price or float("inf")))
        if new_key > cur_key:
            best[lst.vin] = lst
    return list(best.values())


def find_deals(
    listings: list[Listing],
    history: History,
    thresholds: Thresholds,
) -> list[Deal]:
    deals: list[Deal] = []

    for lst in listings:
        if lst.price is None:
            continue

        reasons: list[str] = []

        # Trigger 1: discount off MSRP.
        pct = lst.discount_pct
        usd = lst.discount_usd
        if pct is not None and pct >= thresholds.min_discount_pct and (
            thresholds.min_discount_usd <= 0 or (usd or 0) >= thresholds.min_discount_usd
        ):
            reasons.append(
                f"{pct:.1f}% off MSRP (${usd:,.0f} below ${lst.msrp:,.0f})"
            )

        # Trigger 2: day-over-day drop.
        prev = history.last_price(lst.vin)
        day_drop_usd = day_drop_pct = None
        if prev is not None and prev > lst.price:
            day_drop_usd = round(prev - lst.price, 2)
            day_drop_pct = round((prev - lst.price) / prev * 100, 2)
            if (
                day_drop_pct >= thresholds.min_day_drop_pct
                or day_drop_usd >= thresholds.min_day_drop_usd
            ):
                reasons.append(
                    f"price dropped ${day_drop_usd:,.0f} "
                    f"({day_drop_pct:.1f}%) since last seen"
                )

        if reasons:
            deals.append(
                Deal(
                    listing=lst,
                    reasons=reasons,
                    previous_price=prev,
                    day_drop_usd=day_drop_usd,
                    day_drop_pct=day_drop_pct,
                )
            )

    # Best deals first: largest discount %, then largest day-over-day drop.
    deals.sort(
        key=lambda d: (
            d.listing.discount_pct or 0,
            d.day_drop_pct or 0,
        ),
        reverse=True,
    )
    return deals
