#!/usr/bin/env python3
"""
Haalt de tegels van de Leonida-kaart op en zet ze in public/map/tiles.

Meestal roep je dit niet zelf aan maar via `npm run map:update`, dat ook de
oude tegels opruimt en het versienummer in src/data/map.ts bijwerkt.

De basiskaart is de gemeenschapskaart YANIS, die op map.stateofleonida.net
staat. Nutri heeft daar op 10 september 2026 toestemming voor gekregen van de
mensen achter die site.

Waarom zelf hosten en niet naar hun server linken:

  * hun pad bevat het versienummer (v15), dus bij v16 breekt een link;
  * elke bezoeker van megamundo zou anders hun bandbreedte kosten;
  * onze kaart blijft werken als hun site offline gaat.

Bij een nieuwe versie: --version v16 meegeven, de map met de oude versie
weggooien en de versie in src/data/map.ts bijwerken.

Rechtstreeks draaien kan ook, vanuit deze map:
  python3 scripts/fetch_map_tiles.py                 # v15, zoom 0 tot 6
  python3 scripts/fetch_map_tiles.py --max-zoom 5    # lichter, minder scherp
  python3 scripts/fetch_map_tiles.py --version v16
"""

import argparse
import concurrent.futures as futures
import pathlib
import sys
import time
import urllib.error
import urllib.request

SOURCE = "https://map.stateofleonida.net/tiles/YANIS/{version}/normal/{z}/{x}/{y}.png"

# Zonder een gewone browser-header en een Referer weigert de server de tegels.
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/140.0 Safari/537.36"
    ),
    "Referer": "https://map.stateofleonida.net/",
}

# Hoeveel tegels er per zoomniveau in de breedte en de hoogte staan. Uitgemeten
# op 10 september 2026; het bronbeeld is 20000 bij 20000 pixels.
GRID = {0: 2, 1: 3, 2: 5, 3: 10, 4: 20, 5: 40, 6: 79}


def fetch(url: str, dest: pathlib.Path, tries: int = 3) -> str:
    """Haalt één tegel op. Geeft terug wat er gebeurd is."""
    if dest.exists() and dest.stat().st_size > 0:
        return "over"

    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as response:
                data = response.read()
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            return "ok"
        except urllib.error.HTTPError as error:
            # 404 betekent: die tegel bestaat niet. Dat is geen fout.
            if error.code == 404:
                return "leeg"
            time.sleep(1 + attempt)
        except Exception:
            time.sleep(1 + attempt)

    return "fout"


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", default="v15")
    parser.add_argument("--max-zoom", type=int, default=6)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument(
        "--out",
        default=str(pathlib.Path(__file__).resolve().parent.parent / "public/map/tiles"),
    )
    args = parser.parse_args()

    root = pathlib.Path(args.out)
    jobs = []
    for z in range(0, args.max_zoom + 1):
        n = GRID.get(z)
        if n is None:
            print(f"Onbekend zoomniveau {z}; meet het eerst uit.", file=sys.stderr)
            return 1
        for x in range(n):
            for y in range(n):
                url = SOURCE.format(version=args.version, z=z, x=x, y=y)
                jobs.append((url, root / str(z) / str(x) / f"{y}.png"))

    print(f"{len(jobs)} tegels, zoom 0 tot {args.max_zoom}, versie {args.version}")

    tally = {"ok": 0, "over": 0, "leeg": 0, "fout": 0}
    # Acht tegelijk. Genoeg om het binnen een paar minuten te doen, en niet
    # zoveel dat we hun server platleggen.
    with futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        pending = {pool.submit(fetch, url, dest): dest for url, dest in jobs}
        for i, done in enumerate(futures.as_completed(pending), 1):
            tally[done.result()] += 1
            if i % 500 == 0 or i == len(jobs):
                print(f"  {i}/{len(jobs)}  {tally}")

    print(f"Klaar: {tally}")
    return 1 if tally["fout"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
