# Memory Match

A card-matching memory game built with **React 18 + Vite 5** (vibe-coded, frontend only, no backend).

**Live demo:** https://memory-match-psi-dun.vercel.app

## Features

- **Classic mode** – pick a theme (Animals, Fruits, Colors) and a level (Low 4 pairs, Medium 6, High 9). Moves, wrong flips and time are tracked.
- **Timer mode** – 20 mixed pairs against a 4-minute countdown. Not available on narrow (phone-width) screens.
- **Power-up cards** – earned in Classic mode, spent in Timer mode (up to 3 per game):
  - **Peek** (win Low in under 8 moves): reveals all unmatched cards for 3 s.
  - **Auto-Match** (win Medium with 3 or fewer wrong flips): matches one pair for you.
  - **Freeze** (win High with 6 or fewer wrong flips): pauses the timer for 10 s.
- **Player profiles and History Hub** – progress and the last 50 games per mode are saved in the browser (`localStorage`). Backups can be exported and imported as a JSON file.
- **Idle protection** – a warning appears after 3 minutes without activity, then the game times out 30 s later.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm test         # run the automated test suite once
npm run test:watch
```

## Project structure

```
src/
  App.jsx            screen routing and game flow
  screens/           Home, Mode, Theme, Loadout, Game, Result, History, HowToPlay
  components/        reusable UI (Card, Board, Panel, dialogs, ...)
  hooks/             useMemoryGame (core rules), usePlayer (profiles), useInactivity
  data/              levels, themes, power-ups, reward rules, idle settings
  storage.js         localStorage load/save, input sanitising, backup import/export
  __tests__/         automated tests (Vitest)
QA.md                test strategy, manual test cases, results, bug log
```

## Testing and QA

See **[QA.md](QA.md)** for the full test strategy, manual test cases, results and the bug log.

Automated tests use **Vitest**, **jsdom** and **React Testing Library** with fake timers, so countdowns and delays are tested without waiting. They cover:

| Area | File | What is checked |
| --- | --- | --- |
| Game rules | `useMemoryGame.test.js` | dealing, match and mismatch, win, restart, countdown, pause, loss, all three power-ups |
| Player data | `usePlayer.test.js` | sign-in, reward awards, spending cards, history cap, per-player data, backup round trip |
| Storage and validation | `storage.test.js` | name sanitising, corrupt data, quota failure, invalid backups, prototype-pollution keys |
| Reward rules and data | `rewards.test.js` | boundary values for every reward, theme data integrity |
| Idle timeout | `useInactivity.test.js` | warning, timeout, reset, disabled |
| Helpers | `utils.test.js` | time format, shuffle |

## How to test

### Automated tests

```bash
npm install      # first time only
npm test         # run all tests once (about 5 seconds)
npm run test:watch   # re-run automatically when you save a file
```

A passing run ends with `Test Files 6 passed` and `Tests 73 passed`. These tests check the game logic, not the screens.

### Manual tests

1. Start the app with `npm run dev`, or open the live demo.
2. Reset the saved data: press F12, go to Application, then Local Storage, and delete the `memorymatch:v1` key. Or use a new private window.
3. Go through the test cases in [QA.md](QA.md) section 4. Follow each step and compare the result with the Expected column.
4. Mark each case Pass or Fail, and log any bug in the bug log in `QA.md`.

Tips:
- The "win" and "lose" links in Timer mode end a game instantly, so you do not have to wait 4 minutes.
- The "inactive for 3 mins" link in Classic mode triggers the idle warning right away.
- For a phone-width screen, press F12, then Ctrl+Shift+M (device mode).
- For storage-blocked behaviour, use a private window.

## Deployment

Deployed on Vercel. Vercel detects Vite automatically (build command `npm run build`, output directory `dist`).

## Improvements over the first version

See the "Improvements" section of [QA.md](QA.md).
