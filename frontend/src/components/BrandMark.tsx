interface BrandMarkProps {
  size?: "small" | "large";
  light?: boolean;
}

export default function BrandMark({ size = "small", light = false }: BrandMarkProps) {
  return (
    <span className={`brand-lockup ${size === "large" ? "brand-lockup-large" : ""} ${light ? "brand-lockup-light" : ""}`}>
      <svg className="brand-symbol" viewBox="0 0 48 48" role="img" aria-label="GlucoMind molecular path logo">
        <defs>
          <linearGradient id="brand-flow" x1="7" y1="35" x2="39" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="#66DCC1" />
            <stop offset="1" stopColor="#B3F3DF" />
          </linearGradient>
        </defs>
        <path d="M9 34.5 18.5 24 27 29l12-15" fill="none" stroke="url(#brand-flow)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m8 15 8.5 6M31 36l7-7" fill="none" stroke="currentColor" strokeOpacity=".38" strokeWidth="2" strokeLinecap="round" />
        <circle cx="9" cy="35" r="4" fill="#72DFC5" />
        <circle cx="18.5" cy="24" r="4.3" fill="#B3F3DF" />
        <circle cx="27" cy="29" r="3.5" fill="#4DC7A8" />
        <circle cx="39" cy="14" r="4.5" fill="#D3F7E9" />
        <circle cx="8" cy="15" r="2" fill="currentColor" fillOpacity=".58" />
        <circle cx="38" cy="29" r="2" fill="currentColor" fillOpacity=".58" />
      </svg>
      <span className="brand-name">Gluco<span>Mind</span></span>
    </span>
  );
}