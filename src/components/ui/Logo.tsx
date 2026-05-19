import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className = "", iconOnly = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Friendly Classic App Icon 'j' */}
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md rounded-[10px]"
      >
        <defs>
          <linearGradient id="goldAppBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9E29C" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
        </defs>

        {/* Glossy Squircle Background */}
        <rect width="100" height="100" rx="28" fill="url(#goldAppBg)" />
        
        {/* Soft, friendly white 'j' */}
        <path
          d="M 62 38 L 62 65 C 62 76 38 76 38 65"
          stroke="#FFFFFF"
          strokeWidth="14"
          strokeLinecap="round"
        />
        
        {/* The dot of the 'j' */}
        <circle cx="62" cy="22" r="8" fill="#FFFFFF" />
      </svg>

      {/* Brand Text - Softer & Friendlier */}
      {!iconOnly && (
        <span 
          className="text-2xl font-bold tracking-tight text-foreground select-none" 
          style={{ fontFamily: "'Assistant', sans-serif" }}
        >
          jonjon<span className="text-primary text-[28px] leading-none">.</span>
        </span>
      )}
    </div>
  );
}
