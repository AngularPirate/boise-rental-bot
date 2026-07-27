"""Sends the daily digest via Gmail SMTP + app password (no paid email service)."""

import html
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timezone

import config

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 465


def _esc(text):
    return html.escape(text or "")


def _plain_line(listing):
    beds = listing.get("beds")
    bb = f"{beds:g}bd" if beds is not None else "beds unlisted"
    flags = f" [{'; '.join(listing['flags'])}]" if listing.get("flags") else ""
    return f"- ${listing['price']:,}/mo, {bb} — {listing['title']} — {listing['url']}{flags}"


def _html_card(listing):
    beds = listing.get("beds")
    bb = f"{beds:g} bd" if beds is not None else "beds unlisted"
    flags = "".join(
        f'<span style="display:inline-block;background:#fbeee2;color:#9a5a1f;'
        f'font-size:12px;padding:2px 8px;border-radius:999px;margin:4px 4px 0 0;">{_esc(f)}</span>'
        for f in listing.get("flags", [])
    )
    return f"""
    <div style="background:#ffffff;border:1px solid #ece3d8;border-radius:12px;padding:14px 16px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;font-weight:600;font-size:15px;">
        <a href="{_esc(listing['url'])}" style="color:#2b2420;text-decoration:none;">{_esc(listing['title'])}</a>
      </div>
      <div style="color:#c96a3c;font-weight:700;margin-top:2px;">${listing['price']:,}/mo</div>
      <div style="color:#6b6058;font-size:13px;margin-top:4px;">{_esc(listing['address'])} &middot; {bb} &middot; {_esc(listing['source'])}</div>
      {f'<div style="margin-top:6px;">{flags}</div>' if flags else ''}
    </div>
    """


def build_email_bodies(ranked_listings, scanned_count, now=None):
    now = now or datetime.now(timezone.utc)
    contact_today = [listing for listing in ranked_listings if listing["contact_today"]]
    still_live = [listing for listing in ranked_listings if not listing["contact_today"]]
    contact_today_preview = contact_today[: config.EMAIL_CONTACT_TODAY_PREVIEW]
    contact_today_rest = len(contact_today) - len(contact_today_preview)
    still_live_preview = still_live[: config.EMAIL_STILL_LIVE_PREVIEW]
    still_live_rest = len(still_live) - len(still_live_preview)
    updated_str = now.strftime("%b %-d, %Y at %-I:%M %p UTC")

    plain_lines = [f"Boise Rental Watch — {updated_str}", ""]
    plain_lines.append(f"CONTACT TODAY ({len(contact_today)}) — top {len(contact_today_preview)} shown")
    plain_lines += [_plain_line(listing) for listing in contact_today_preview] or ["  (none)"]
    plain_lines.append("")
    plain_lines.append(f"STILL LIVE ({len(still_live)}) — top {len(still_live_preview)} shown, rest on the dashboard")
    plain_lines += [_plain_line(listing) for listing in still_live_preview] or ["  (none)"]
    plain_lines.append("")
    plain_lines.append(f"{scanned_count} listings scanned. Full dashboard: {config.DASHBOARD_URL}")
    plain_body = "\n".join(plain_lines)

    def _rest_html(rest_count):
        if rest_count <= 0:
            return ""
        return (
            f'<p style="color:#6b6058;font-size:13px;">+ {rest_count} more on the '
            f'<a href="{config.DASHBOARD_URL}" style="color:#c96a3c;">dashboard</a>.</p>'
        )

    html_body = f"""
    <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;color:#2b2420;max-width:640px;">
      <h2 style="margin-bottom:2px;">Boise Rental Watch</h2>
      <div style="color:#6b6058;font-size:13px;margin-bottom:20px;">{updated_str} &middot; <a href="{config.DASHBOARD_URL}" style="color:#c96a3c;">full dashboard</a></div>
      <h3 style="text-transform:uppercase;font-size:13px;letter-spacing:0.06em;color:#6b6058;">Contact Today ({len(contact_today)})</h3>
      {''.join(_html_card(listing) for listing in contact_today_preview) or '<p style="color:#6b6058;font-style:italic;">Nothing here right now.</p>'}
      {_rest_html(contact_today_rest)}
      <h3 style="text-transform:uppercase;font-size:13px;letter-spacing:0.06em;color:#6b6058;margin-top:24px;">Still Live ({len(still_live)})</h3>
      {''.join(_html_card(listing) for listing in still_live_preview) or '<p style="color:#6b6058;font-style:italic;">Nothing here right now.</p>'}
      {_rest_html(still_live_rest)}
      <p style="color:#6b6058;font-size:12px;margin-top:24px;">{scanned_count} listings scanned.</p>
    </div>
    """
    return plain_body, html_body


def send_digest(ranked_listings, scanned_count, now=None):
    gmail_address = os.environ["GMAIL_ADDRESS"].strip()
    # Gmail displays app passwords as 4 space-separated groups for readability;
    # those spaces (sometimes pasted in as non-breaking spaces, \xa0) aren't part
    # of the actual credential, so strip all whitespace before using it.
    gmail_app_password = "".join(os.environ["GMAIL_APP_PASSWORD"].split())

    plain_body, html_body = build_email_bodies(ranked_listings, scanned_count, now=now)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Boise Rental Watch — {len(ranked_listings)} matches"
    msg["From"] = gmail_address
    msg["To"] = ", ".join(config.RECIPIENTS)
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
        server.login(gmail_address, gmail_app_password)
        server.sendmail(gmail_address, config.RECIPIENTS, msg.as_string())
