# Memory Match

A card-matching memory game built with **React 18 + Vite 5** (vibe-coded) with a small serverless API for player accounts.

**Live demo:** https://memory-match-psi-dun.vercel.app

## Features

- **Classic mode** – pick a theme (Animals, Fruits, Colors) and a level (Low 4 pairs, Medium 6, High 9). Moves, wrong flips and time are tracked.
- **Timer mode** – 20 mixed pairs against a 4-minute countdown.
- **Power-up cards** – earned in Classic mode, spent in Timer mode (up to 3 per game):
  - **Peek** (win Low in under 8 moves): reveals all unmatched cards for 3 s.
  - **Auto-Match** (win Medium with 3 or fewer wrong flips): matches one pair for you.
  - **Freeze** (win High with 6 or fewer wrong flips): pauses the timer for 10 s.
- **Accounts and History Hub** – the game first asks for your nickname, then for a 4-digit PIN. A new nickname is created with the PIN you choose; an existing nickname opens only with its own PIN. Nicknames are case sensitive (`ann` and `Ann` are different players). Your cards and the last 50 games per mode show on any device where you sign in with the matching nickname and PIN. In the History Hub you can reset your progress, sign out, or permanently delete your account (the nickname can then be used again).
- **Idle protection** – a warning appears after 3 minutes without activity, then the game times out 30 s later.
- **Responsive layout** – works on phones (portrait and landscape), iPad, laptop and desktop. The card board picks the grid shape and card size that fit the screen, so no scrolling is needed during a game.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm test         # run the automated test suite once
npm run test:watch
```

## Accounts and the database

Accounts are stored on the server, so the same nickname and PIN show the same data on every device.

- **Server code** is in `api/`: `check` (does this nickname exist?), `login` (create or open an account), `save` (store progress) and `delete` (remove an account). PINs are never stored; only a salted `scrypt` hash is kept. After 8 wrong PINs an account is locked for 15 minutes. Progress is validated and size-limited before it is stored.
- **Browser code** keeps a copy in `localStorage` so the History Hub loads quickly. The PIN is kept only for the current browser tab, so closing the tab signs you out.
- **Local development:** `npm run dev` serves the same API from memory, so accounts reset when the dev server restarts. No setup is needed.
- **Offline:** you need a connection to sign in. If a save fails during a game, the History Hub shows a warning and the next game retries.
- **If two devices play at the same time,** the last save wins.

### Setting up the database on Vercel (one time)

1. Open your project on vercel.com, then **Storage** (or the **Marketplace**) and create an **Upstash Redis** database (the free plan is enough).
2. Connect the database to this project. Vercel adds the connection settings (`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or the `KV_REST_API_*` names) as environment variables.
3. **Redeploy** the project, because new environment variables only apply to new deployments.

Until this is done, signing in on the deployed site shows "The database is not set up yet." Accounts are never kept in memory in production.

## Project structure

```
src/
  App.jsx            screen routing and game flow
  screens/           Home, Mode, Theme, Loadout, Game, Result, History, HowToPlay
  components/        reusable UI (Card, Board, Panel, dialogs, ...)
  hooks/             useMemoryGame (core rules), usePlayer (profiles), useInactivity, useViewport
  layout.js          picks the board grid and card size for the screen
  data/              levels, themes, power-ups, reward rules, idle settings
  storage.js         localStorage cache and input sanitising
  api.js             browser calls to the server (login, save)
  __tests__/         automated tests (Vitest)
api/                 serverless functions: check, login, save, delete (PIN hashing, validation, database)
QA.md                test strategy, manual test cases, results, bug log
```

## Testing and QA

See **[QA.md](QA.md)** for the full test strategy, manual test cases, results and the bug log.

Automated tests use **Vitest**, **jsdom** and **React Testing Library** with fake timers, so countdowns and delays are tested without waiting. They cover:

| Area | File | What is checked |
| --- | --- | --- |
| Game rules | `useMemoryGame.test.js` | dealing, match and mismatch, win, restart, countdown, pause, loss, all three power-ups |
| Player accounts (browser) | `usePlayer.test.js` | nickname check, PIN sign-in, case-sensitive nicknames, same data on a new device, reload refresh, saving, offline errors, delete account, reward awards, history cap |
| Server API | `api.test.js` | nickname check, account creation, case-sensitive nicknames, PIN checks and hashing, lockout, open-only requests, save and sanitising, delete account, routing and errors |
| Storage and validation | `storage.test.js` | name sanitising, corrupt data, quota failure, prototype-pollution keys |
| Reward rules and data | `rewards.test.js` | boundary values for every reward, theme data integrity |
| Idle timeout | `useInactivity.test.js` | warning, timeout, reset, disabled |
| Responsive layout | `layout.test.js` | board grid fits phone, iPad, laptop and desktop sizes at every card count; size limits |
| Helpers | `utils.test.js` | time format, shuffle |

## How to test

### Automated tests

```bash
npm install      # first time only
npm test         # run all tests once (about 5 seconds)
npm run test:watch   # re-run automatically when you save a file
```

A passing run ends with `Test Files 8 passed` and `Tests 167 passed`. These tests check the game logic, not the screens.

### Manual tests

1. Start the app with `npm run dev`, or open the live demo.
2. Reset the saved data: press F12, go to Application, then Local Storage, and delete the `memorymatch:v1` key. Or use a new private window.
3. Go through the test cases in [QA.md](QA.md) section 4. Follow each step and compare the result with the Expected column.
4. Mark each case Pass or Fail, and log any bug in the bug log in `QA.md`.

Tips:
- The "win" and "lose" links in Timer mode end a game instantly, so you do not have to wait 4 minutes.
- The "inactive for 3 mins" link in Classic mode triggers the idle warning right away.
- For phone, iPad and laptop sizes, press F12, then Ctrl+Shift+M (device mode) and pick a device.
- For storage-blocked behaviour, use a private window.

## Deployment

Deployed on Vercel. Vercel detects Vite automatically (build command `npm run build`, output directory `dist`).

## Improvements over the first version

See the "Improvements" section of [QA.md](QA.md).
