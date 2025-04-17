import React from 'react';
import Link from 'next/link';
// Import the SVG as a Component
import LogoSvg from '@/assets/logo.svg';

interface LogoProps {
  size?: number;
  color?: string;
}

export const Logo = ({ size = 40, color = 'currentColor' }: LogoProps) => {
  return (
    <Link href="/" className="flex items-center">
      <div className="mr-2" style={{ width: size, height: size }}>
        <LogoSvg 
          width={size} 
          height={size} 
          className="logo-svg" 
          style={{ 
            stroke: color === 'gradient' ? 'url(#logo-gradient)' : color,
            filter: 'drop-shadow(0px 0px 3px rgba(217, 203, 185, 0.3))'
          }} 
        />
        {color === 'gradient' && (
          <svg width="0" height="0">
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop stopColor="#5065D8" offset="0%" />
              <stop stopColor="#00F2FE" offset="100%" />
            </linearGradient>
          </svg>
        )}
      </div>
      <span className="text-xl font-bold gradient-text">Sand Dollar</span>
    </Link>
  );
}; 