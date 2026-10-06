/**
 * Whistleblowing System Logo
 * A shield with a whistle/blow icon inside — modern, clean, scalable.
 */

export function Logo({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Whistleblowing System"
    >
      {/* Shield shape */}
      <path
        d="M20 2L4 9v11c0 8.5 6.8 16.4 16 18 9.2-1.6 16-9.5 16-18V9L20 2z"
        fill="url(#shield-gradient)"
      />
      <path
        d="M20 2L4 9v11c0 8.5 6.8 16.4 16 18 9.2-1.6 16-9.5 16-18V9L20 2z"
        stroke="#1e40af"
        strokeWidth="0.5"
        strokeOpacity="0.2"
      />

      {/* Whistle icon inside */}
      <g transform="translate(12 12)">
        {/* Whistle body — rounded rectangle */}
        <path
          d="M2 7.5C2 6.67 2.67 6 3.5 6h8c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5h-8C2.67 11 2 10.33 2 9.5v-2z"
          fill="white"
        />
        {/* Whistle mouthpiece (small knob) */}
        <circle cx="13.5" cy="8.5" r="2" fill="white" />
        {/* Whistle hole */}
        <circle cx="5" cy="8.5" r="0.9" fill="#1e40af" />
        {/* Sound waves */}
        <path
          d="M17 6.5c1.2.6 1.2 3.4 0 4"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M18.5 5.5c1.8.9 1.8 5.1 0 6"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          strokeOpacity="0.7"
        />
      </g>

      <defs>
        <linearGradient
          id="shield-gradient"
          x1="0"
          y1="0"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1e40af" />
        </linearGradient>
      </defs>
    </svg>
  );
}