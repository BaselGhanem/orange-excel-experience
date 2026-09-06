# Formula Motion

A cinematic, data-driven Excel formula learning experience built with semantic HTML, modular CSS, and vanilla JavaScript.

## Included formula modules

1. SUMIFS — aggregation / matching / value-combination motion
2. XLOOKUP — search / locate / retrieve motion
3. COUNTIFS — criteria scan / match / count motion
4. IF — binary decision / TRUE-FALSE branching motion
5. IFS — ordered thresholds / first-TRUE routing motion
6. FILTER — Boolean filtering / dynamic-array spill motion

Every formula contains a complete Basic Mode and Hard Mode sequence, its own dataset, syntax anatomy, formula assembly, result reveal, visual identity, and automatic Basic → Hard transition.

## Run locally

Because the site uses native ES modules, serve the folder through any static web server instead of opening `index.html` directly.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Formula modules can also be opened directly with query parameters, for example:

```text
?formula=sumifs
?formula=xlookup
?formula=countifs
?formula=if
?formula=ifs
?formula=filter
```

## Architecture

- `index.html` — semantic application shell
- `css/design-system.css` — shared design tokens and global foundations
- `css/app.css` — motion system, formula identities, tables, controls, and responsive behavior
- `js/core/engine.js` — reusable cinematic rendering/sequencing engine and visual primitives
- `js/formulas/*.js` — independent formula configuration/modules
- `js/formulas/index.js` — formula registry
- `js/app.js` — navigation, initialization, deep-link state

## Adding another formula

1. Create a module under `js/formulas/` using the same configuration structure.
2. Register it in `js/formulas/index.js`.
3. Reuse an existing visual primitive (`aggregate`, `lookup`, `count`, `logic`, `threshold`, `filter`) or add a genuinely new primitive to the engine when the teaching behavior requires it.

The shared engine already handles scene transitions, syntax anatomy, visible table headers, highlighting, formula assembly, Basic/Hard switching, result reveals, navigation, responsive layout, and reduced-motion behavior.

## Accessibility & performance

- Semantic tables with persistent visible column headers.
- `aria-live` for scene and mode captions.
- Keyboard-focus states for user-facing controls.
- `prefers-reduced-motion` support.
- Transform/opacity-led animations for smooth rendering.
- No external JavaScript libraries or runtime dependencies.
