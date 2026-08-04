import { useState, type CSSProperties } from "react";

const STAR_FIELD = Array.from({ length: 42 }, (_, index) => ({
  id: `star-${index}`,
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 23 + 17) % 96}%`,
  size: 2 + (index % 3),
  delay: `${(index % 9) * -1.7}s`,
  duration: `${8 + (index % 7)}s`
}));

export function InteractiveStarField() {
  const [fallingStars, setFallingStars] = useState<Record<string, number>>({});

  function dropStar(id: string) {
    setFallingStars((current) => ({ ...current, [id]: Date.now() }));
    window.setTimeout(() => {
      setFallingStars((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }, 950);
  }

  return (
    <div className="interactive-starfield" aria-hidden="true">
      {STAR_FIELD.map((star) => {
        const isFalling = star.id in fallingStars;
        const style = {
          "--star-left": star.left,
          "--star-top": star.top,
          "--star-size": `${star.size}px`,
          "--star-delay": star.delay,
          "--star-duration": star.duration
        } as CSSProperties;

        return (
          <button
            key={`${star.id}-${fallingStars[star.id] ?? "idle"}`}
            className={`interactive-star ${isFalling ? "is-falling" : ""}`}
            style={style}
            type="button"
            tabIndex={-1}
            onClick={() => dropStar(star.id)}
          />
        );
      })}
    </div>
  );
}
