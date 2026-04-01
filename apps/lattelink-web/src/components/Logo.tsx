import type { CSSProperties } from "react";

export function LogoIcon({ size = 34 }: { size?: number }) {
  const radius = Math.round(size * 0.265);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "linear-gradient(145deg, #1535e8, #2a5fff, #6aa0ff)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 20px rgba(74,126,255,0.35)",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 54 54"
        fill="none"
      >
        <path
          d="M14 8 L14 36 Q14 45 23 45 L45 45"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M23 23 A13 13 0 0 1 36 36"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        <circle cx="14" cy="8" r="5.5" fill="white" />
        <circle cx="45" cy="45" r="5.5" fill="white" />
      </svg>
    </div>
  );
}

export function Wordmark({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        letterSpacing: "-0.025em",
        lineHeight: 1,
        ...style,
      }}
    >
      Latte<span style={{ color: "var(--color-blue-500)" }}>Link</span>
    </span>
  );
}
