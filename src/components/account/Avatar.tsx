export function Avatar({
  src,
  name,
  size = 64,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const box = { width: size, height: size } as const;
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={box} className="shrink-0 rounded-full border-2 border-turquoise object-cover" />;
  }
  return (
    <span
      aria-hidden
      style={{ ...box, fontSize: size * 0.4 }}
      className="flex shrink-0 items-center justify-center rounded-full bg-turquoise/15 font-semibold text-turquoise ring-2 ring-turquoise"
    >
      {initial}
    </span>
  );
}
