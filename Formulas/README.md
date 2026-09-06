# Formula Motion v6 — Verified Build

Premium cinematic Excel formula learning experience built with HTML, CSS, and vanilla JavaScript.

## Included formulas
- SUMIFS
- XLOOKUP
- COUNTIFS
- IF
- IFS
- FILTER

## v6 interaction model
- Formula identity and syntax shell enter cinematically.
- **One click / arrow press = one formula argument.**
- The comma and punctuation attached to that argument appear inside the same beat.
- Syntax Anatomy is a short automatic recap after the user has already revealed the arguments.
- Dataset and task enter automatically as context.
- During the worked example, each top-level formula argument receives exactly one controlled beat.
- Final matching/calculation/result is one solve beat.
- Click anywhere inside the stage or use Arrow Right/Down to advance.
- Arrow Left/Up goes back.

## v6 fixes
- Corrected SUMIFS range/highlight sequencing: `D2:D7` now maps only to Sales / column D.
- Rebuilt worked-example sequencing around parsed top-level formula arguments instead of fragile step slicing.
- Removed blurred future formula text that visually collided with active arguments.
- Reworked worked-scene layout to prevent Task / Formula / Micro Visual / Result collisions.
- Added additional compact desktop-height rules.
- Retained custom cursor, pointer spotlight, click ripple, Formula Library, loader, and Web Audio sound design.

## QA
See `QA_REPORT.md` and the scripts under `qa/`.

Run locally with any static server, e.g.:

```bash
python -m http.server 8000
```
