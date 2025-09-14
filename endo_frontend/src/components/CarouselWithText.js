// src/components/CarouselWithText.js
import { useEffect, useMemo, useRef, useState } from "react";

const loop = (i, n) => (i + n) % n;

function Arrow({ dir = "left", onClick }) {
  const isLeft = dir === "left";
  return (
    <button
      type="button"
      aria-label={isLeft ? "Previous" : "Next"}
      onClick={onClick}
      className={[
        "absolute top-1/2 -translate-y-1/2",
        isLeft ? "left-4" : "right-4",
        "h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/40 text-white",
        "backdrop-blur flex items-center justify-center hover:bg-black/60",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        {isLeft ? (
          <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        ) : (
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        )}
      </svg>
    </button>
  );
}

export default function CarouselWithText({ cards = [] }) {
  const n = cards.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const stageRef = useRef(null);

  const next = () => setIndex((i) => loop(i + 1, n));
  const prev = () => setIndex((i) => loop(i - 1, n));

  // autoplay
  useEffect(() => {
    if (!n || paused) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [paused, n]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // swipe
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let startX = 0;
    const start = (e) => (startX = e.touches[0].clientX);
    const move = (e) => {
      const dx = e.touches[0].clientX - startX;
      if (Math.abs(dx) > 60) {
        dx > 0 ? prev() : next();
        startX = e.touches[0].clientX;
      }
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchmove", move, { passive: true });
    return () => {
      el.removeEventListener("touchstart", start);
      el.removeEventListener("touchmove", move);
    };
  }, []);

  // visible slide
  const states = useMemo(
    () => cards.map((_, i) => (i === index ? "center" : "hidden")),
    [cards, index]
  );

  if (!n) return null;

  return (
    <div
      className="w-full max-w-6xl mx-auto select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* stage */}
      <div
        ref={stageRef}
        className="relative overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-black/5 h-[400px] md:h-[480px]"
      >
        {cards.map((c, i) => (
          <img
            key={c.id ?? i}
            src={c.src}
            alt={c.text}
            className={[
              "absolute inset-0 w-full h-full object-contain transition-all duration-700 ease-out",
              states[i] === "center"
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95"
            ].join(" ")}
          />
        ))}

        <Arrow dir="left" onClick={prev} />
        <Arrow dir="right" onClick={next} />
      </div>

      {/* caption */}
      <div className="mt-5 flex flex-col items-center">
        <p className="text-center text-egypt-blue text-lg md:text-xl font-semibold px-4">
          {cards[index].text}
        </p>
      </div>

      {/* dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={[
              "h-3 w-3 rounded-full transition-all",
              i === index
                ? "bg-egypt-blue scale-110"
                : "bg-gray-300 hover:bg-gray-400"
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
