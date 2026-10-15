/** Concentric hairline rings, the motif from the app's onboarding screen. Flat strokes only. */
export function Rings({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 800"
      fill="none"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="400" cy="400" r="150" stroke="#10B7BE" strokeOpacity="0.55" strokeWidth="1.5" />
      <circle cx="400" cy="400" r="230" stroke="#10B7BE" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="400" cy="400" r="315" stroke="#10B7BE" strokeOpacity="0.22" strokeWidth="1.5" />
      <circle cx="400" cy="400" r="395" stroke="#10B7BE" strokeOpacity="0.14" strokeWidth="1.5" />
      <circle cx="586" cy="248" r="9" fill="#10B7BE" />
      <circle cx="640" cy="662" r="6" fill="#FFFFFF" fillOpacity="0.85" />
      <circle cx="652" cy="560" r="4" fill="#FFFFFF" fillOpacity="0.5" />
    </svg>
  );
}
