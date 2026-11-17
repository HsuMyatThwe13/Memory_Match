import { useRef, useState, useLayoutEffect } from "react";
import Card from "./Card";
import useViewport from "../hooks/useViewport";
import { fitBoard } from "../layout";

const px = (value) => parseFloat(value) || 0;

// Space the board may use: the screen width, and the height left under everything above it and over everything below it.
function available(el, vw, vh) {
  const parent = el.parentElement;
  const style = getComputedStyle(parent);
  let below = 0;
  let side = 0;
  for (let s = el.nextElementSibling; s; s = s.nextElementSibling) {
    if (getComputedStyle(s).position !== "fixed") below += s.offsetHeight + px(style.rowGap);
    else if (s.classList.contains("dock")) side = s.offsetWidth + 24;
  }
  const top = el.getBoundingClientRect().top + window.scrollY;
  return {
    width: Math.min(vw - px(style.paddingLeft) - px(style.paddingRight) - 2 * side, 1100),
    height: vh - top - below - px(style.paddingBottom) - 8,
  };
}

export default function Board({ cards, flipped, matched, peeking, onFlip }) {
  const n = cards.length;
  const ref = useRef(null);
  const { w, h } = useViewport();
  const [fit, setFit] = useState({ cols: n > 12 ? 6 : 4, size: 40, gap: 8 });

  useLayoutEffect(() => {
    const space = available(ref.current, w, h);
    const next = fitBoard(n, space.width, space.height);
    setFit((old) => (old.cols === next.cols && old.size === next.size && old.gap === next.gap ? old : next));
  }, [w, h, n]);

  const style = { "--cols": fit.cols, "--size": `${fit.size}px`, "--gap": `${fit.gap}px` };
  return (
    <div ref={ref} className="board" style={style} role="group" aria-label={`Memory cards, ${fit.cols} columns by ${n / fit.cols} rows`}>
      {cards.map((card, i) => {
        const isMatched = matched.includes(card.id);
        return <Card key={card.id} card={card} index={i} matched={isMatched}
          up={isMatched || peeking || flipped.includes(card.id)} onFlip={onFlip} />;
      })}
    </div>
  );
}
