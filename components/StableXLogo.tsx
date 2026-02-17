"use client";

interface CoinScopeLogoProps {
  className?: string;
  size?: number;
}

export function CoinScopeLogo({ className, size = 28 }: CoinScopeLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rounded square */}
      <rect width="40" height="40" rx="8" fill="currentColor" />
      {/* Magnifying glass circle — the "scope" */}
      <circle cx="17" cy="17" r="8" stroke="white" strokeWidth="2.5" fill="none" />
      {/* Handle */}
      <line x1="23" y1="23" x2="31" y2="31" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Coin symbol inside the glass — $ */}
      <path
        d="M17 11v2m0 8v2m-3-9.5a3 3 0 0 1 3-2.5 3 3 0 0 1 0 5h-1a3 3 0 0 0 0 5 3 3 0 0 0 3-2.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
