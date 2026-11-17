const MAX_CARD = 150;
const MIN_CARD = 28;
const MAX_COLS = 10;

// Pick the column count that gives the biggest cards inside width x height.
// Only column counts that divide the card count evenly are used, so the grid is always full.
// Cards keep the same size on every level: the size of the High level (18 cards) board on this screen.
// Boards with fewer cards use that size too and only choose their own column count.
const HIGH_COUNT = 18;

export function fitBoard(count, width, height) {
  const ref = fitSize(Math.max(count, HIGH_COUNT), width, height);
  if (count <= HIGH_COUNT) {
    let best = null;
    for (let cols = 2; cols <= count / 2; cols++) {
      if (count % cols) continue;
      const rows = count / cols;
      if (cols * ref.size + (cols - 1) * ref.gap > width + 1) continue;
      if (rows * ref.size + (rows - 1) * ref.gap > height + 1) continue;
      const mismatch = Math.abs(Math.log(cols / rows / (width / height)));
      if (!best || mismatch < best.mismatch) best = { cols, mismatch };
    }
    if (best) return { cols: best.cols, size: ref.size, gap: ref.gap };
  }
  return count > HIGH_COUNT ? ref : fitSize(count, width, height);
}

function fitSize(count, width, height) {
  const ratio = count <= 12 ? 0.22 : 0.16;
  let best = null;
  for (let cols = 2; cols <= Math.min(MAX_COLS, count / 2); cols++) {
    if (count % cols) continue;
    const rows = count / cols;
    const byWidth = width / (cols + (cols - 1) * ratio);
    const byHeight = height / (rows + (rows - 1) * ratio);
    const size = Math.max(MIN_CARD, Math.min(MAX_CARD, byWidth, byHeight));
    // when card sizes tie (e.g. both hit the maximum), prefer the grid shape closest to the screen shape
    const mismatch = Math.abs(Math.log(cols / rows / (width / height)));
    if (!best || size > best.size + 0.5 || (size > best.size - 0.5 && mismatch < best.mismatch)) {
      best = { cols, size, mismatch };
    }
  }
  const size = Math.floor(best ? best.size : MIN_CARD);
  return { cols: best ? best.cols : 2, size, gap: Math.max(6, Math.round(size * ratio)) };
}
