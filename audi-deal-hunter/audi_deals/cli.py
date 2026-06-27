"""Entrypoint: scrape -> dedupe -> detect deals -> report -> email -> persist.

Usage:
    python -m audi_deals.cli                 # normal daily run
    python -m audi_deals.cli --config my.yaml
    python -m audi_deals.cli --date 2026-06-27
    python -m audi_deals.cli --sample tests/fixtures/marketcheck_sample.json
    python -m audi_deals.cli --dry-run       # don't send email, just write report
"""

from __future__ import annotations

import argparse
import datetime
import json
import logging
import sys
from pathlib import Path

from .config import load_config
from .dealfinder import dedupe, find_deals
from .models import Listing
from .report import html_email, markdown_report
from .sources import build_sources
from .sources.marketcheck import MarketCheckSource
from .storage import History


def _today(args) -> str:
    if args.date:
        return args.date
    return datetime.date.today().isoformat()


def _gather(config, args, log) -> list[Listing]:
    if args.sample:
        # Reuse MarketCheck's row parser against a saved JSON payload so the
        # whole pipeline can be exercised offline (no network / API key).
        raw = json.loads(Path(args.sample).read_text())
        src = MarketCheckSource(config)
        listings = [l for l in (src._parse_row(r) for r in raw.get("listings", [])) if l]
        log.info("loaded %d listings from sample %s", len(listings), args.sample)
        return listings

    listings: list[Listing] = []
    for source in build_sources(config):
        try:
            listings.extend(source.fetch())
        except Exception as exc:  # one bad source shouldn't kill the run
            log.error("source %s failed: %s", source.name, exc)
    return listings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Find great Audi deals daily.")
    parser.add_argument("--config", default="config.yaml")
    parser.add_argument("--date", help="override run date (YYYY-MM-DD)")
    parser.add_argument("--sample", help="load listings from a JSON file instead of the network")
    parser.add_argument("--dry-run", action="store_true", help="don't send email")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    log = logging.getLogger("audi_deals")

    config = load_config(args.config)
    today = _today(args)
    query = (f"{config.search.make} {', '.join(config.search.models)} "
             f"({config.search.condition})"
             + (f", within {config.search.radius_miles}mi of {config.search.zip}"
                if config.search.zip and config.search.radius_miles else ", nationwide"))

    listings = dedupe(_gather(config, args, log))
    log.info("%d unique listings after dedupe", len(listings))

    history = History.load(config.data_dir / "history.json")
    deals = find_deals(listings, history, config.thresholds)
    log.info("%d deal(s) crossed thresholds", len(deals))

    # Trim email body but keep the full set in the markdown report.
    email_deals = deals[: config.notify.max_deals_in_email]

    md = markdown_report(deals, listings, today, query)
    report_path = config.data_dir / "report-latest.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(md)
    log.info("wrote %s", report_path)

    # Email (unless suppressed or nothing to say).
    if not args.dry_run and (deals or config.notify.always_send_digest):
        from .notifier import send_email
        n = len(deals)
        subject = (f"🔥 {n} Audi deal{'s' if n != 1 else ''} today"
                   if n else "Audi deals — daily digest (no new alerts)")
        send_email(
            config.email,
            to_addr=config.notify.email_to or "",
            subject=subject,
            html_body=html_email(email_deals, listings, today, query),
            text_body=md,
        )
    elif args.dry_run:
        log.info("dry-run: skipping email")
    else:
        log.info("no deals and always_send_digest is off; skipping email")

    # Update + persist history last, so today's prices become tomorrow's baseline.
    for lst in listings:
        history.record(lst, today)
    history.prune(today)
    history.save(config.data_dir / "history.json")
    log.info("history saved (%d VINs tracked)", len(history.data["vins"]))

    return 0


if __name__ == "__main__":
    sys.exit(main())
