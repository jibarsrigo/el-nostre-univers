#!/usr/bin/env python3
"""Captures Cartes board/celebration at tablet landscape for UX review."""
import json, os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
import time

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(os.environ.get("CARTES_UX_OUT", "/opt/cursor/artifacts"))
OUT.mkdir(parents=True, exist_ok=True)
PERSONATGES = json.loads((ROOT / "data/personatges.json").read_text())
VIEW = {"width": 1024, "height": 768}
NEED = [4, 5, 6, 8]


def win_all_pairs(page):
    page.evaluate(
        """() => {
      const f = typeof f2 !== 'undefined' ? f2 : null;
      if (!f?.match?.length) throw new Error('no f2.match');
      const seen = new Set();
      for (let i = 0; i < f.match.length; i++) {
        const v = f.match[i];
        if (f.matched?.includes(i)) continue;
        const j = f.match.indexOf(v, i + 1);
        if (j < 0) continue;
        const key = v + ':' + Math.min(i, j);
        if (seen.has(key)) continue;
        seen.add(key);
        clickCard(i);
        clickCard(j);
      }
    }"""
    )
    page.wait_for_selector(".f2-pairs-party", timeout=20000)


def main():
    server = ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    )
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{server.server_port}/index.html"
    pjson = json.dumps(PERSONATGES)
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        page = browser.new_page(viewport=VIEW)
        page.goto(url, wait_until="networkidle")
        page.locator('[data-action="start"]').click()
        page.locator('[data-hotspot="tower"]').click(force=True)
        page.locator('[data-hotspot="pairs"]').click(force=True)
        page.wait_for_selector("[data-card]")
        for lv, need in enumerate(NEED):
            page.evaluate(
                f"""() => {{
              jocs.personatges = {pjson};
              if (!f2.cartesAventura) jocsCartesEnsureAdventure();
              const roster = f2.cartesAventura.roster;
              const pool = personatgeList().filter(p => p.enabled !== false);
              while (roster.length < {need}) {{
                const p = pool.find(x => !roster.includes(x.id));
                if (!p) break;
                roster.push(p.id);
              }}
              const prior = [0, 4, 5, 6][{lv}];
              f2.cartesAventura.levelUnlocked = Math.max(3, {lv});
              f2.cartesAventura.levelsCompleted = [0, 1, 2, 3].filter((x) => x < {lv});
              f2.cartesAventura.discoveredIds = roster.slice(0, prior);
              f2.cartesAventura.nouIds = [];
              f2.pairsLevel = {lv};
              setupPairs();
              f2.matched = [];
              f2.flipped = [];
              render();
            }}"""
            )
            page.wait_for_selector("[data-card]")
            page.locator(".f2-pairs-board").screenshot(
                path=str(OUT / f"cartes-n{lv + 1}-tauler.png")
            )
            win_all_pairs(page)
            page.wait_for_selector(".f2-pairs-party")
            page.locator(".f2-pairs-party").screenshot(
                path=str(OUT / f"cartes-n{lv + 1}-celebracio.png")
            )
            html = page.content()
            if "VOLS PROVAR" in html:
                raise AssertionError(f"level {lv+1}: redundant prompt")
            if "f2-btn--cartes-primary" not in html:
                raise AssertionError(f"level {lv+1}: missing primary button")
        browser.close()
    server.shutdown()
    print("OK:", OUT)


if __name__ == "__main__":
    main()