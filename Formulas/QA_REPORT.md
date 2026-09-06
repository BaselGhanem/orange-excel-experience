# Formula Motion v6 — QA Report

## Scope
Verified modules: SUMIFS, XLOOKUP, COUNTIFS, IF, IFS, FILTER. Each module was checked in Basic and Hard mode (12 worked examples total).

## Automated formula/data assertions
- Exact top-level argument parsing for every worked formula.
- Syntax argument-beat count matches each formula definition.
- Excel range letters map to the intended dataset columns.
- SUMIFS matched rows, matched values, and totals recomputed from source data.
- COUNTIFS matches and counts recomputed from source data.
- XLOOKUP lookup/return ranges, matched row, and returned value recomputed.
- IF selected branch verified against configured result.
- IFS selected threshold and result recomputed from dataset values.
- FILTER matched rows and spilled row counts recomputed.

Result: **42 / 42 assertions passed**.

## Automated interaction assertions
For every Basic/Hard worked example:
- Number of worked actions = number of top-level formula arguments + one final solve beat.
- Every argument action reveals exactly one argument index.
- No argument action reveals the next argument automatically.
- Range arguments highlight only their mapped dataset column.
- SUMIFS `sum_range D2:D7` maps to `sales / column D`, never Area / A.
- SUMIFS/COUNTIFS criteria-range and criteria-value beats map to their correct columns.
- XLOOKUP lookup_array and return_array map to their correct columns.
- FILTER include argument maps to all columns participating in its Boolean include expression.

Result: **12 / 12 worked-example interaction plans passed**.

## Code integrity
- `node --check` passed for all JavaScript modules.
- CSS brace integrity checked: balanced blocks in both stylesheets.
- Native formula `<select>` is not present in the UI; the custom Formula Library remains in use.

## Layout corrections in v6
- Formula assembly no longer shows blurred/ghosted future arguments.
- Future arguments are invisible until their beat is triggered.
- Right worked panel uses explicit CSS grid rows instead of flex `space-between`, preventing sections from visually colliding.
- Formula assembly uses controlled wrapping and fixed maximum vertical allocation.
- Desktop short-height breakpoints were tightened for 820px and 700px viewport heights.
- Task, formula, micro-visual, and result areas have isolated layout bounds.

## Browser-render limitation of this environment
The installed Chromium instance is organization-policy blocked from opening localhost, container IPs, file URLs, and data URLs. Therefore a new automated Chromium screenshot pass cannot truthfully be claimed from this environment. The final build includes the static/data/interaction QA above, and the collision fixes were made directly against the supplied failure screenshot and the affected layout rules.
