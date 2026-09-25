"""Web fetch for PERMITTED pages only (feature: Playwright + BeautifulSoup).

Hard rules enforced here:
  * robots.txt is fetched and honored (config: web_fetch.respect_robots)
  * no auth bypass, no CAPTCHA solving, no paywall circumvention
  * if a page requires login/payment, the fetcher stops and says so
  * every save records the URL + fetch date for the registry
"""

from __future__ import annotations

import urllib.robotparser
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

from .paths import load_settings, logs_dir


class FetchRefused(Exception):
    pass


def _robots_ok(url: str, ua: str, timeout: int) -> bool:
    """Fail-closed robots check: honors robots.txt; refuses when status unknown.

    Standard crawler practice: robots.txt 404 → crawling allowed;
    robots.txt unreachable/5xx → be conservative and refuse.
    """
    import urllib.request

    parsed = urlparse(url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    try:
        req = urllib.request.Request(robots_url, headers={"User-Agent": ua})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.status
            body = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return True  # no robots.txt → allowed by convention
        return False     # 4xx/5xx other than 404 → refuse
    except Exception:
        return False     # unreachable → refuse (fail closed)

    rp = urllib.robotparser.RobotFileParser()
    rp.parse(body.splitlines())
    return rp.can_fetch(ua, url)


def fetch_page(url: str, out_dir: Path | None = None, settings: dict | None = None) -> dict:
    """Fetch one permitted page → saved HTML + registry metadata."""
    s = settings or load_settings()
    cfg = s["web_fetch"]
    ua = cfg["user_agent"]

    if not url.lower().startswith(("http://", "https://")):
        raise FetchRefused(f"only http(s) URLs are supported: {url}")

    if cfg.get("respect_robots", True) and not _robots_ok(url, ua, int(cfg["timeout_seconds"])):
        raise FetchRefused(f"robots.txt disallows fetching {url} — not bypassing")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise RuntimeError(
            "playwright not installed (pip install playwright && playwright install chromium)"
        )

    fetched_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent=ua)
        page.goto(url, timeout=int(cfg["timeout_seconds"]) * 1000, wait_until="domcontentloaded")
        # If the site responded with a login/paywall interstitial, stop.
        content = page.content()
        title = page.title()
        browser.close()

    low = content.lower()
    for marker in ("sign in to continue", "log in to continue", "subscribe to read",
                   "create an account to continue", "access denied"):
        if marker in low:
            raise FetchRefused(
                f"page appears to require authentication/payment ({marker!r}) — refused"
            )

    out_dir = out_dir or logs_dir()  # default: logs (caller should pass sources dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    fname = f"web_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{abs(hash(url)) % 10**8}.html"
    out_path = out_dir / fname
    out_path.write_text(content, encoding="utf-8")

    return {
        "url": url,
        "title": title,
        "saved_to": str(out_path),
        "fetched_at": fetched_at,
        "suggested_source_type": "html",
        "suggested_license": "permitted_web",
    }
