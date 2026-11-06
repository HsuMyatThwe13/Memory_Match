export const PEEK_UNDER_MOVES = 8;
export const AUTO_MAX_WRONG = 3;
export const FREEZE_MAX_WRONG = 6;

const RULES = {
  low: { card: "peek", earned: ({ moves }) => moves < PEEK_UNDER_MOVES },
  medium: { card: "autoMatch", earned: ({ wrong }) => wrong <= AUTO_MAX_WRONG },
  high: { card: "freeze", earned: ({ wrong }) => wrong <= FREEZE_MAX_WRONG },
};

export const cardForLevel = (levelId) => RULES[levelId]?.card;

export const awardsFor = ({ levelId, moves, wrong }) => {
  const rule = RULES[levelId];
  return rule && rule.earned({ moves, wrong }) ? [rule.card] : [];
};
