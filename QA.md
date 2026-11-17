# QA and Testing – Memory Match

Product: https://memory-match-psi-dun.vercel.app
Stack: React 18 + Vite 5, frontend only, data kept in browser `localStorage`.

## 1. Test strategy

| Perspective | Approach | Status |
| --- | --- | --- |
| Unit testing | Vitest on pure logic (rewards, storage, utils, data, responsive layout) | Done, automated |
| Component/hook testing | React Testing Library `renderHook` with fake timers for game rules, player profile and idle timeout | Done, automated |
| Functional (manual) | 10 test cases in the browser (section 4) | Done, all pass |
| Boundary value testing | Reward thresholds, 12-character names, 50-entry history cap, 999 card cap, 200 KB backup limit | Done, automated |
| Negative/security testing | Corrupt `localStorage`, invalid backup files, markup in names, `__proto__` keys, storage quota errors | Done, automated |
| Regression | `npm test` runs all 105 tests in about 5 seconds | Done |

Out of scope: load/performance testing (there is no server), and end-to-end browser automation (not set up).

## 2. Automated test results

Run with `npm test`. Last run: **7 files, 105 tests, all passing**.

| File | Tests |
| --- | --- |
| `utils.test.js` | 9 |
| `rewards.test.js` | 8 |
| `storage.test.js` | 22 |
| `useInactivity.test.js` | 3 |
| `usePlayer.test.js` | 10 |
| `useMemoryGame.test.js` | 21 |
| `layout.test.js` | 32 |

Output of `npm test` (Vitest v2.1.9):

```
 ✓ src/__tests__/rewards.test.js (8)
 ✓ src/__tests__/layout.test.js (32)
 ✓ src/__tests__/storage.test.js (22)
 ✓ src/__tests__/useInactivity.test.js (3)
 ✓ src/__tests__/useMemoryGame.test.js (21)
 ✓ src/__tests__/usePlayer.test.js (10)
 ✓ src/__tests__/utils.test.js (9)

 Test Files  7 passed (7)
      Tests  105 passed (105)
   Duration  4.36s
```

Notable behaviours verified:
- A third card cannot be flipped while two are open; the same card cannot match itself; matched cards cannot be flipped again.
- The countdown does not start until the first flip, stops when paused or frozen, and a won board is never reported as lost.
- A power-up cannot be used after the game ends, and Freeze cannot be stacked.
- A corrupt or tampered save never crashes the app and falls back to an empty profile.
- Imported backups are sanitised, and wrong-app, oversized or non-JSON files are rejected.

## 3. Test data

Clear site data (`localStorage` key `memorymatch:v1`) or use a private window before each pass. Player names used: `Ann`, `Bob`, a 20-character name.

## 4. Manual test cases

| ID | Area | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| TC-01 | Sign in | Enter a name and continue; try an empty name and a 20-character name | Valid name opens Home; empty name is rejected; long name is trimmed to 12 characters | Pass |
| TC-02 | Persistence and players | Reload the page; switch player to a new name | Same player stays signed in after reload; the new player has separate empty progress | Pass |
| TC-03 | Classic game | Play Animals at Low, Medium and High | 8, 12 and 18 cards; matched pairs stay up, mismatches flip back; result screen shows moves and time | Pass |
| TC-04 | Rapid clicking | Click many cards quickly | No more than two cards open, no stuck cards | Pass |
| TC-05 | Reward cards | Win Low in under 8 moves, then in 8 or more | Peek card awarded only for the fast win | Pass |
| TC-06 | Timer mode | Start Timer mode, wait, then flip a card; let it run out | Clock starts on the first flip; losing shows the lose screen with pairs found | Pass |
| TC-07 | Benefit cards in Timer mode | Use Peek, Auto-Match and Freeze | Peek shows cards about 3 s; Auto-Match matches one pair; Freeze holds the clock 10 s; each card count drops by 1 | Pass |
| TC-08 | Idle protection | Leave a game untouched for 3 minutes, then respond or ignore | Warning dialog with 30 s countdown; responding continues the game; ignoring ends it | Pass |
| TC-09 | History Hub | Play several games, open History Hub | Newest games first, with card counts | Pass |
| TC-10 | Backup and reset | Export, reset progress, import the file; try importing a non-backup file | Progress restored from a valid file; invalid file shows an error and changes nothing | Pass |

### Responsive checks

Checked in the browser with device-size emulation, on Home, Mode, Theme, Loadout, Classic (Low, Medium, High), Timer and Result screens. "No scroll" means the game board and card dock fit on one screen.

| Device size | Result |
| --- | --- |
| Small phone 320x568 | Pass: no horizontal overflow, game fits without scrolling (cards are small in Timer mode) |
| Phone portrait 375x812 | Pass: no overflow, no scroll during a game |
| Phone landscape 812x375 | Pass: no overflow, Timer card dock moves to the side |
| iPad portrait 768x1024 | Pass |
| iPad landscape 1024x768 | Pass |
| Laptop 1366x768 | Pass |
| Desktop 1920x1080 | Pass |

Not tested on real devices or real Safari. Menu, history and how-to screens scroll vertically on short screens by design.

## 5. Observations from code review

| ID | Observation | Severity | Status |
| --- | --- | --- | --- |
| OBS-01 | Test links (`TestLinks.jsx`) are shown on purpose for demos and QA: `win` and `lose` in Timer mode, and `inactive for 3 mins` in Classic mode. They let a tester reach the end states and the idle dialog without waiting. Players could use them to cheat, so they should be hidden in a real release. | Low | Accepted, kept for the demo |
| OBS-02 | `useInactivity` has an effect that depends only on `idle`, so ESLint's exhaustive-deps rule would flag it. It works today. | Low | Open |
| OBS-03 | No end-to-end browser tests. Screens are only covered by the manual cases above. | Low | Open |

## 6. Bug log

| ID | Description | Steps | Severity | Status |
| --- | --- | --- | --- | --- |
| BUG-01 | Cards were tiny on phones and left most of the screen empty (fixed card size limits) | Open a game on a 375x812 screen | Medium | Fixed: board now picks grid and card size from the available space |
| BUG-02 | Timer mode was blocked on screens under 600px wide ("Needs a bigger screen") | Open Mode screen on a phone | Medium | Fixed: Timer mode works on phones (5x8 grid) |
| BUG-03 | Background pictures were stretched on phone and tablet shapes, and used a fixed attachment that iOS handles badly | Open any screen on a phone-shaped window | Low | Fixed: backgrounds fill tall screens without stretching, and show the whole picture on landscape screens |
| BUG-05 | After BUG-03's first fix, wide and short browser windows (for example 1536x650) cut off the bottom of the background (grass and animals) | Open the game in a laptop window shorter than 16:9 | Medium | Fixed: landscape screens show the whole picture again; only tall screens use fill mode |
| BUG-04 | On a phone in landscape, the Timer card dock squeezed the board to 34px cards | Start Timer mode at 812x375 | Medium | Fixed: dock moves to the side, cards are 51px |

## 7. Improvements over the first version

- **Benefit cards (power-ups):** Peek, Auto-Match and Freeze are earned by playing well in Classic mode and spent in Timer mode. This adds rewards, strategy and a reason to replay.
- **Timer mode:** a 4-minute challenge with 20 mixed pairs, so the game has a timed challenge as well as a relaxed mode.
- **Player profiles and History Hub:** saved progress per player, with backup export and import.
- **Responsive design:** the game now works on phones, iPad, laptop and desktop. Card size and grid shape adapt to the screen, and Timer mode is available on phones.
- **Automated tests:** 105 tests and an `npm test` script. They cover the new features above, since timers, rewards and saved data are the riskiest parts.
- **README and this QA document.**
- **Deployed to Vercel.**
