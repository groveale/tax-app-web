# UK Tax Optimizer PoC

Educational prototype to illustrate UK income tax, NI, personal allowance taper, and updated (60k–80k) Child Benefit withdrawal, plus pension optimisation effects.

## Features
- Salary + bonus inputs (pension + salary sacrifice)
- Child count & Child Benefit High Income Charge modelling (60–80k range)
- Personal Allowance taper (100k–125,140)
- Income Tax + Employee NI
- Simple scenario: +£5k pension contribution delta
- Unit tests for key cliffs (Vitest)

## Disclaimer
Not financial advice. Thresholds are provisional for 2025/26. Verify before using for decisions.

## Quick Start

```powershell
npm install
npm run dev
```
Then open the printed local URL (typically http://localhost:5173).

## Tests

```powershell
npm test
```

## Next Ideas
- Add marginal rate visual curve
- Add Gift Aid and charity impact on Adjusted Net Income
- Model EV salary sacrifice & employer NI savings
- Add partner income interplay for shared planning suggestions

## Structure
- `src/domain/tax` core pure functions & config
- `src/components` UI building blocks
- `tests` vitest specs

## License
Unlicensed prototype (all rights reserved for now). Update as needed.
