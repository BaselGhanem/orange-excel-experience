# Formula Motion v8 QA Report

## Automated checks

- Formula/range/result validation: **42/42 passed**
- Argument-beat interaction validation: **12/12 passed**
- Visible-output integrity validation: **24/24 passed**

## Verified visible results

### SUMIFS
- Basic — Area = Amman
  - Matching rows: 1, 3, 5 of the dataset body
  - Sales values: 1,250 + 940 + 660
  - Result: **2,850**
- Hard — Area = Amman AND Product = 5G
  - Matching rows: 3, 5
  - Sales values: 940 + 660
  - Result: **1,600**

### XLOOKUP
- Basic — P103 → Price **115**
- Hard — P105 → Price **140**

### COUNTIFS
- Basic — Area = Amman → **3** matching rows
- Hard — Area = Amman AND Product = 5G → **2** matching rows

### IF
- Basic — C104: 27 <= 24 is FALSE → **Late**
- Hard — C104: Open AND (3 >= 3 OR 27 > 24) is TRUE → **Escalate**

### IFS
- Basic — C202 = 90% → **Within SLA**
- Hard — C203 = 112% → **Watch**

### FILTER
- Basic — Area = Amman → **3 spilled rows**, verified payloads:
  1. Amman | Fiber | Ali | 1,250
  2. Amman | 5G | Omar | 940
  3. Amman | 5G | Ali | 660
- Hard — Area = Amman AND Product = 5G → **2 spilled rows**:
  1. Amman | 5G | Omar | 940
  2. Amman | 5G | Ali | 660

## v8 display fix

FILTER no longer uses the generic short micro-visual height. The spill panel now reserves enough vertical space for the complete dynamic-array result, including all matching rows, on normal and short desktop viewports.
