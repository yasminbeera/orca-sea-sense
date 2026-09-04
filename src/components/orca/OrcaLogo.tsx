export function OrcaLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="ORCA logo">
      <circle cx="24" cy="24" r="23" fill="oklch(0.52 0.14 245)" />
      <path
        d="M10 30c6-1 9-4 12-9 2.5-4.2 6-6.5 11-7-1 6-3.5 10.5-7.5 13.5C21.8 30.4 16.5 31.6 10 30Z"
        fill="white"
      />
      <path d="M25 14c2-3 5-4.5 8-4.8-.6 2.8-2.2 5-4.8 6.6L25 14Z" fill="oklch(0.86 0.09 190)" />
      <path
        d="M9 35c3.5-2 6.5-2 9.5 0s6 2 9.5 0 6.5-2 10 0"
        fill="none"
        stroke="oklch(0.86 0.09 190)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="30" cy="19" r="1.4" fill="oklch(0.3 0.06 250)" />
    </svg>
  );
}
