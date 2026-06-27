from audi_deals.models import Listing
from audi_deals.storage import History


def _l(vin, price, msrp=106500):
    return Listing(vin=vin, year=2024, make="Audi", model="e-tron GT",
                   trim=None, price=price, msrp=msrp, condition="new")


def test_record_and_last_price():
    h = History()
    h.record(_l("AAA", 100000), "2026-06-26")
    h.record(_l("AAA", 98000), "2026-06-27")
    assert h.last_price("AAA") == 98000
    assert len(h.data["vins"]["AAA"]["prices"]) == 2


def test_same_day_overwrites():
    h = History()
    h.record(_l("AAA", 100000), "2026-06-27")
    h.record(_l("AAA", 99000), "2026-06-27")
    assert len(h.data["vins"]["AAA"]["prices"]) == 1
    assert h.last_price("AAA") == 99000


def test_vin_normalized_uppercase():
    h = History()
    h.record(_l("abc123", 100000), "2026-06-27")
    assert h.last_price("ABC123") == 100000


def test_roundtrip(tmp_path):
    h = History()
    h.record(_l("AAA", 100000), "2026-06-27")
    p = tmp_path / "history.json"
    h.save(p)
    h2 = History.load(p)
    assert h2.last_price("AAA") == 100000


def test_prune_drops_stale(tmp_path):
    h = History()
    h.record(_l("OLD", 100000), "2026-01-01")
    h.record(_l("NEW", 100000), "2026-06-27")
    h.prune("2026-06-27")
    assert "OLD" not in h.data["vins"]
    assert "NEW" in h.data["vins"]
