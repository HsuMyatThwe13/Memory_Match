# QA and Testing – Memory Match

Product: https://memory-match-psi-dun.vercel.app
Stack: React 18 + Vite 5 frontend, Vercel serverless API (`api/`) with an Upstash Redis database for accounts. The browser keeps a cache in `localStorage`.

## 1. Test strategy

| Perspective | Approach | Status |
| --- | --- | --- |
| Unit testing | Vitest on pure logic (rewards, storage, utils, data, responsive layout) | Done, automated |
| Component/hook testing | React Testing Library `renderHook` with fake timers for game rules, player profile and idle timeout | Done, automated |
| Functional (manual) | 10 test cases in the browser (section 4) | TC-03 to TC-09 pass; TC-01, TC-02 and TC-10 changed (two-step sign-in, case-sensitive nicknames, account menu) and need to be run again |
| Boundary value testing | Reward thresholds, 12-character names, 4-digit PIN lengths, 50-entry history cap, 999 card cap, PIN lockout after 8 tries | Done, automated |
| Negative/security testing | Wrong and malformed PINs, taken nicknames, case-sensitive nicknames, PIN lockout, PIN hashing, tampered progress, refresh that must not create accounts, corrupt `localStorage`, markup in names, `__proto__` keys, storage and server failures | Done, automated |
| Regression | `npm test` runs all 167 tests in about 5 seconds | Done |

Out of scope: load/performance testing, the real Upstash database (tests use an in-memory copy with the same behaviour), and end-to-end browser automation (not set up).

## 2. Automated test results

Run with `npm test`. Last run: **8 files, 167 tests, all passing**.

| File | Tests |
| --- | --- |
| `utils.test.js` | 9 |
| `rewards.test.js` | 8 |
| `storage.test.js` | 15 |
| `useInactivity.test.js` | 3 |
| `usePlayer.test.js` | 30 |
| `api.test.js` | 49 |
| `useMemoryGame.test.js` | 21 |
| `layout.test.js` | 32 |

Output of `npm test` (Vitest v2.1.9):

```
 ✓ src/__tests__/layout.test.js (32 tests)
 ✓ src/__tests__/utils.test.js (9 tests)
 ✓ src/__tests__/storage.test.js (15 tests)
 ✓ src/__tests__/rewards.test.js (8 tests)
 ✓ src/__tests__/api.test.js (49 tests)
 ✓ src/__tests__/useInactivity.test.js (3 tests)
 ✓ src/__tests__/useMemoryGame.test.js (21 tests)
 ✓ src/__tests__/usePlayer.test.js (30 tests)

 Test Files  8 passed (8)
      Tests  167 passed (167)
   Duration  5.57s
```

Notable behaviours verified:
- A third card cannot be flipped while two are open; the same card cannot match itself; matched cards cannot be flipped again.
- The countdown does not start until the first flip, stops when paused or frozen, and a won board is never reported as lost.
- A power-up cannot be used after the game ends, and Freeze cannot be stacked.
- A corrupt or tampered save never crashes the app and falls back to an empty profile.
- Nicknames are case sensitive: `ann` and `Ann` are separate accounts with separate data. A page refresh can open an account but never creates one.

## 3. Test data

Clear site data (`localStorage` key `memorymatch:v1`) or use a private window before each pass. Player names used: `Ann`, `Bob`, a 20-character name.

## 4. Manual test cases

| ID | Area | Steps | Expected | Result |
| --- | --- | --- | --- | --- |
| TC-01 | Two-step sign-in | The game asks for the nickname only. Enter a new nickname, press Next, then enter a 4-digit PIN; try an empty nickname and a PIN shorter than 4 digits | Nickname step comes first; Next is disabled for an empty nickname; the PIN step says the nickname is new; Create is disabled until 4 digits; the account opens Home | Not run (changed) |
| TC-02 | Same data on another device | Play a game, then on another device or browser enter the same nickname, then the same PIN; try again with a wrong PIN; try the nickname with different capital letters | Cards and history appear; a wrong PIN shows "Wrong PIN for this nickname." and does not open; `ann` and `Ann` are different players | Not run (changed) |
| TC-03 | Classic game | Play Animals at Low, Medium and High | 8, 12 and 18 cards; matched pairs stay up, mismatches flip back; result screen shows moves and time | Pass |
| TC-04 | Rapid clicking | Click many cards quickly | No more than two cards open, no stuck cards | Pass |
| TC-05 | Reward cards | Win Low in under 8 moves, then in 8 or more | Peek card awarded only for the fast win | Pass |
| TC-06 | Timer mode | Start Timer mode, wait, then flip a card; let it run out | Clock starts on the first flip; losing shows the lose screen with pairs found | Pass |
| TC-07 | Benefit cards in Timer mode | Use Peek, Auto-Match and Freeze | Peek shows cards about 3 s; Auto-Match matches one pair; Freeze holds the clock 10 s; each card count drops by 1 | Pass |
| TC-08 | Idle protection | Leave a game untouched for 3 minutes, then respond or ignore | Warning dialog with 30 s countdown; responding continues the game; ignoring ends it | Pass |
| TC-09 | History Hub | Play several games, open History Hub | Newest games first, with card counts | Pass |
| TC-10 | Account menu | In History Hub: press Reset progress and confirm; press Sign out and cancel, then confirm; sign in again and press Delete account, cancel, then confirm; then use the same nickname again | Reset clears cards and history; Sign out returns to the nickname step and needs the PIN again; Delete removes the account and its data on every device, and the nickname can be created again with a new PIN and starts empty | Not run (changed) |

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
| OBS-04 | A 4-digit PIN has only 10,000 combinations. The 8-try lockout (15 minutes) makes guessing slow, but it is not strong security. Fine for a game, not for sensitive data. | Low | Accepted |
| OBS-05 | If two devices play at the same time, the last save wins and the other device's newest game can be lost. | Low | Accepted, documented in the README |
| OBS-06 | Signing in needs an internet connection, because the PIN is checked on the server. | Low | Accepted |
| OBS-07 | Because the form asks for the nickname first, anyone can find out whether a nickname exists. This is needed to show "create a PIN" or "enter your PIN", and no data is shown without the PIN. | Low | Accepted |
| OBS-08 | Deleting an account is permanent and works only with the right PIN (a wrong PIN counts toward the lockout). There is no undo and no recovery if the PIN is forgotten. | Low | Accepted |

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
- **Accounts with nickname and PIN:** the game asks for the nickname first, then the PIN. Nicknames are case sensitive, and a nickname opens only with its own PIN. The same nickname and PIN show the same cards and history on every device (phone, iPad, laptop). Players can sign out or delete their account from the History Hub. The server stores a salted hash of the PIN, locks an account after 8 wrong PINs, and validates all saved data.
- **Responsive design:** the game now works on phones, iPad, laptop and desktop. Card size and grid shape adapt to the screen, and Timer mode is available on phones.
- **Automated tests:** 167 tests and an `npm test` script. They cover the new features above, since timers, rewards and saved data are the riskiest parts.
- **README and this QA document.**
- **Deployed to Vercel.**
