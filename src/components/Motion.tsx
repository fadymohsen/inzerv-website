import type { CSSProperties } from "react";

/** Headline whose words slide up out of a mask on load. */
export function HeroWords({
  text,
  accent = false,
  startDelay = 0,
}: {
  text: string;
  accent?: boolean;
  startDelay?: number;
}) {
  const words = text.split(" ");
  const content = words.map((w, i) => (
    <span key={`${w}-${i}`}>
      <span className="-my-[0.14em] inline-block overflow-hidden py-[0.14em] align-bottom">
        <span
          className="hero-word inline-block"
          style={{ ["--d" as string]: `${startDelay + i * 80}ms` } as CSSProperties}
        >
          {w}
        </span>
      </span>
      {i < words.length - 1 ? " " : ""}
    </span>
  ));
  return accent ? <span className="text-turquoise">{content}</span> : <>{content}</>;
}

/** Words that brighten as they scroll into view. */
export function ScrollWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className="scroll-word">{w}</span>{" "}
        </span>
      ))}
    </>
  );
}
