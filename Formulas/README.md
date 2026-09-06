# Formula Motion

A cinematic, data-driven Excel formula learning experience built with semantic HTML, modular CSS, and vanilla JavaScript.

## Included formula modules

1. SUMIFS — aggregation / matching / value-combination motion
2. XLOOKUP — search / locate / retrieve motion
3. COUNTIFS — criteria scan / match / count motion
4. IF — binary decision / TRUE-FALSE branching motion
5. IFS — ordered thresholds / first-TRUE routing motion
6. FILTER — Boolean filtering / dynamic-array spill motion

Every formula contains a complete Basic Mode and Hard Mode sequence, its own dataset, syntax anatomy, formula assembly, result reveal, and visual identity.

## Interaction model

Formula Motion v3 is fully trainer-directed:

- No teaching beat advances automatically.
- `Next Motion` triggers exactly one teaching beat.
- `Back` reconstructs the previous motion state.
- `Restart` returns the active formula to its first untouched scene.
- Hard Mode waits for the trainer to trigger the switch.
- Formula changes happen only after the trainer selects a formula or uses Previous/Next Formula.
- Buttons use click ripple / press choreography.
- Fine-pointer devices get a custom cursor, spotlight, subtle stage tilt, ambient parallax, and magnetic controls.
- The only autonomous animation is the initial loading screen; entering the experience still requires an explicit click.

## Premium formula library

The browser-native select control has been replaced with a custom formula library. Each formula shows its sequence number, motion identity, formula name, formula-specific accent, active state, and animated selection feedback.

## Layout resilience

Scenes now participate in the Stage layout instead of depending on a fixed-height absolute canvas. The Stage grows with scene content while preserving crossfades, preventing titles, syntax cards, tables, and worked-example panels from collapsing into one another on shorter or narrower viewports.

## Loader

The opening loader uses the concept `هكرنا الإكسل`, a geek-terminal treatment (`⌐■_■ / hehe.exe`), formula traces, scan energy, and a user-triggered `ENTER THE LAB` transition.

## Run locally

Because the site uses native ES modules, serve the folder through any static web server instead of opening `index.html` directly.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

Formula modules can also be opened directly with query parameters:

```text
?formula=sumifs
?formula=xlookup
?formula=countifs
?formula=if
?formula=ifs
?formula=filter
```

## Architecture

- `index.html` — semantic application shell, loader, formula library, motion controls
- `css/design-system.css` — shared design tokens and global foundations
- `css/app.css` — motion system, formula identities, tables, pointer system, loader, controls, responsive behavior
- `js/core/engine.js` — reusable click-directed rendering/sequencing engine and visual primitives
- `js/formulas/*.js` — independent formula configuration/modules
- `js/formulas/index.js` — formula registry
- `js/app.js` — navigation, formula picker, pointer choreography, loader, deep-link state

## Adding another formula

1. Create a module under `js/formulas/` using the same configuration structure.
2. Register it in `js/formulas/index.js`.
3. Reuse an existing visual primitive (`aggregate`, `lookup`, `count`, `logic`, `threshold`, `filter`) or add a new primitive when the teaching behavior genuinely requires it.

## Accessibility & performance

- Semantic tables with persistent visible column headers.
- `aria-live` for scene and mode captions.
- Keyboard-focus states for user-facing controls.
- Escape closes the custom formula library.
- `prefers-reduced-motion` support.
- Transform/opacity-led animations for smooth rendering.
- No external JavaScript libraries or runtime dependencies.
