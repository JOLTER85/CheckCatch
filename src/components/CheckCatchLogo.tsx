import React from 'react';

interface CheckCatchLogoProps {
  className?: string;
  size?: number | string;
}

export const CheckCatchLogo: React.FC<CheckCatchLogoProps> = ({
  className = 'w-9 h-9',
  size,
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      style={style}
      aria-label="CheckCatch Logo"
    >
      <defs>
        {/* Main Emerald to Cyan Gradient */}
        <linearGradient id="cc-main-grad" x1="20" y1="20" x2="160" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>

        {/* Checkmark Probe Gradient */}
        <linearGradient id="cc-check-grad" x1="60" y1="120" x2="170" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="40%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Catch Hook Blue Gradient */}
        <linearGradient id="cc-hook-grad" x1="100" y1="110" x2="180" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="60%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Soft Glow */}
        <filter id="cc-glow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#cc-glow)">
        {/* Main Circular Loop */}
        <circle
          cx="90"
          cy="105"
          r="48"
          stroke="url(#cc-main-grad)"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Checkmark and Extended Probe Arm */}
        <path
          d="M 68 100 L 92 125 L 158 55"
          stroke="url(#cc-check-grad)"
          strokeWidth="18"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Antenna / Probe Tip Node (Hollow Circle Head) */}
        <circle
          cx="160"
          cy="53"
          r="10.5"
          fill="url(#cc-hook-grad)"
        />
        <circle
          cx="160"
          cy="53"
          r="4.5"
          fill="#ffffff"
        />

        {/* Catch Hook Loop at the Bottom Right */}
        <path
          d="M 125 125 C 125 155, 145 168, 168 152 C 182 140, 185 118, 184 102"
          stroke="url(#cc-hook-grad)"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Hook Barb / Arrow Point */}
        <path
          d="M 184 100 L 163 125 L 180 125 Z"
          fill="url(#cc-hook-grad)"
        />
      </g>
    </svg>
  );
};
