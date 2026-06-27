import json
from pathlib import Path

from audi_deals.config import Thresholds
from audi_deals.dealfinder import dedupe, find_deals
from audi_deals.models import Listing
from audi_deals.sources.marketcheck import MarketCheckSource
from audi_deals.storage import History

FIXTURE = Path(__file__).parent / "fixtures" / "marketcheck_sample.json"


def _listings():
    raw = json.loads(FIXTURE.read_text())

    class _Cfg:
        class search:
            make = "Audi"
    src = MarketCheckSource.__new__(MarketCheckSource)
    src.config = _Cfg()
    return [src._parse_row(r) for r in raw["listings"]]


def test_discount_math():
    l = Listing(vin="x", year=2024, make="Audi", model="e-tron GT", trim=None,
                price=79900, msrp=106500, condition="new")
    assert l.discount_usd == 26600
    assert round(l.discount_pct, 1) == 25.0


def test_discount_none_without_msrp():
    l = Listing(vin="x", year=2024, make="Audi", model="e-tron GT", trim=None,
                price=79900, msrp=None, condition="new")
    assert l.discount_pct is None


def test_finds_big_discounts():
    listings = _listings()
    th = Thresholds(min_discount_pct=8.0, min_day_drop_pct=2.0, min_day_drop_usd=1500)
    deals = find_deals(listings, History(), th)
    # $79,900 (25% off) and the RS at $129,500 (12.5% off) clear 8%. The
    # $98,000 car is 7.98% off (just under) and the $104k one (2.3%) don't.
    flagged_vins = {d.listing.vin for d in deals}
    assert "WAUZZZF87NA111111" in flagged_vins
    assert "WUAZZZF1XPA333333" in flagged_vins
    assert "WAUZZZF87NA444444" not in flagged_vins
    assert "WAUZZZF87NA222222" not in flagged_vins
    # Sorted best-first: deepest discount leads.
    assert deals[0].listing.vin == "WAUZZZF87NA111111"


def test_day_over_day_drop_triggers():
    listings = _listings()
    history = History()
    # Pretend the $104k car was $108k yesterday -> a $4k drop should flag it
    # even though it's barely under MSRP.
    history.record(
        Listing(vin="WAUZZZF87NA222222", year=2024, make="Audi",
                model="e-tron GT", trim=None, price=108000, msrp=106500,
                condition="new"),
        today="2026-06-26",
    )
    th = Thresholds(min_discount_pct=99.0,  # disable discount trigger
                    min_day_drop_pct=2.0, min_day_drop_usd=1500)
    deals = find_deals(listings, history, th)
    drop = next(d for d in deals if d.listing.vin == "WAUZZZF87NA222222")
    assert drop.day_drop_usd == 4000
    assert any("dropped" in r for r in drop.reasons)


def test_no_false_positive_on_price_increase():
    listings = _listings()
    history = History()
    history.record(
        Listing(vin="WAUZZZF87NA222222", year=2024, make="Audi",
                model="e-tron GT", trim=None, price=100000, msrp=106500,
                condition="new"),
        today="2026-06-26",
    )
    th = Thresholds(min_discount_pct=99.0, min_day_drop_pct=2.0, min_day_drop_usd=1500)
    deals = find_deals(listings, history, th)
    assert all(d.listing.vin != "WAUZZZF87NA222222" for d in deals)


def test_dedupe_keeps_cheaper_with_msrp():
    a = Listing(vin="DUP", year=2024, make="Audi", model="e-tron GT", trim=None,
                price=90000, msrp=106500, condition="new", source="marketcheck")
    b = Listing(vin="DUP", year=2024, make="Audi", model="e-tron GT", trim=None,
                price=88000, msrp=106500, condition="new", source="cars_com")
    out = dedupe([a, b])
    assert len(out) == 1
    assert out[0].price == 88000
