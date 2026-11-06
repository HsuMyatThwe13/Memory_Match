import { PEEK_UNDER_MOVES, AUTO_MAX_WRONG, FREEZE_MAX_WRONG } from "./rewards";

export const TIMER_SECONDS = 240;
export const TIMER_LABEL = `${TIMER_SECONDS / 60} minutes`;
export const TIMER_PAIRS = 20;
export const MAX_LOADOUT = 3;
export const PEEK_MS = 3000;
export const FREEZE_SECONDS = 10;

export const POWERUP_IDS = ["peek", "autoMatch", "freeze"];

export const POWERUPS = {
  peek: {
    label: "Peek", rarity: "Common",
    effect: `Shows every unmatched card for ${PEEK_MS / 1000} seconds`,
    earn: `Win Low in under ${PEEK_UNDER_MOVES} moves`,
  },
  autoMatch: {
    label: "Auto-Match", rarity: "Uncommon",
    effect: "Finds and matches 1 pair for you",
    earn: `Win Medium with ${AUTO_MAX_WRONG} or fewer wrong flips`,
  },
  freeze: {
    label: "Freeze", rarity: "Rare",
    effect: `Pauses the timer for ${FREEZE_SECONDS} seconds`,
    earn: `Win High with ${FREEZE_MAX_WRONG} or fewer wrong flips`,
  },
};
