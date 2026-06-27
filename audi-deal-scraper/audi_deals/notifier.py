"""Email delivery over SMTP (standard library only)."""

from __future__ import annotations

import logging
import smtplib
import ssl
from email.message import EmailMessage

from .config import EmailCreds

log = logging.getLogger(__name__)


def send_email(creds: EmailCreds, to_addr: str, subject: str,
               html_body: str, text_body: str) -> bool:
    if not creds.configured:
        log.warning("SMTP not configured (need SMTP_HOST/SMTP_USER/SMTP_PASSWORD); "
                    "skipping email")
        return False
    if not to_addr:
        log.warning("no recipient (notify.email_to / EMAIL_TO); skipping email")
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = creds.sender or creds.user
    msg["To"] = to_addr
    msg.set_content(text_body)
    msg.add_alternative(html_body, subtype="html")

    try:
        if creds.port == 465:
            ctx = ssl.create_default_context()
            with smtplib.SMTP_SSL(creds.host, creds.port, context=ctx, timeout=30) as s:
                s.login(creds.user, creds.password)
                s.send_message(msg)
        else:
            with smtplib.SMTP(creds.host, creds.port, timeout=30) as s:
                if creds.use_tls:
                    s.starttls(context=ssl.create_default_context())
                s.login(creds.user, creds.password)
                s.send_message(msg)
        log.info("email sent to %s", to_addr)
        return True
    except (smtplib.SMTPException, OSError) as exc:
        log.error("email send failed: %s", exc)
        return False
