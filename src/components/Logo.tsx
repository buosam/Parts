/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * IQAutoMarket - Official Brand Logo Component
 */

import React from 'react';

export interface LogoProps {
  /**
   * Presentation variant:
   * - 'full': The original full brand logo with gear mark + "IQAutoMarket"
   * - 'dark': High-contrast dark header version (orange IQ + white AutoMarket)
   * - 'mark': Just the gear mark emblem (crescent blue gear + orange circle)
   * - 'white': Monochrome white gear mark
   * - 'badge': Icon mark inside an illuminated glassmorphic container with custom typography
   */
  variant?: 'full' | 'dark' | 'mark' | 'white' | 'badge';
  /**
   * Predefined or custom size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Show "IRAQ" / "العراق" localized badge
   */
  showBadge?: boolean;
  /**
   * Show subtitle description below brand name
   */
  showSubtitle?: boolean;
  /**
   * Arabic locale mode
   */
  isArabic?: boolean;
  /**
   * Custom wrapper CSS classes
   */
  className?: string;
  /**
   * Click handler
   */
  onClick?: () => void;
}

/**
 * Pure Vector SVG of the Official IQAutoMarket Gear & Circle Emblem
 */
export const LogoMarkSvg: React.FC<{
  className?: string;
  fillGear?: string;
  fillCircle?: string;
}> = ({ className = 'w-8 h-8', fillGear = '#335aff', fillCircle = '#fd660e' }) => (
  <svg
    viewBox="0 0 114 150"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Blue Outer Gear Crescent */}
    <path
      d="M 0.0,53.0 L 3.0,48.0 L 3.0,46.0 L 5.0,43.0 L 5.0,41.0 L 7.0,37.0 L 10.0,34.0 L 15.0,35.0 L 16.0,36.0 L 22.0,36.0 L 27.0,34.0 L 34.0,27.0 L 36.0,22.0 L 36.0,16.0 L 35.0,15.0 L 35.0,11.0 L 34.0,10.0 L 37.0,7.0 L 41.0,6.0 L 44.0,4.0 L 46.0,4.0 L 49.0,2.0 L 51.0,2.0 L 54.0,0.0 L 57.0,0.0 L 59.0,2.0 L 60.0,5.0 L 65.0,10.0 L 69.0,12.0 L 71.0,12.0 L 74.0,14.0 L 74.0,25.0 L 70.0,27.0 L 61.0,28.0 L 58.0,30.0 L 56.0,30.0 L 50.0,33.0 L 42.0,40.0 L 41.0,40.0 L 33.0,50.0 L 30.0,56.0 L 30.0,58.0 L 28.0,62.0 L 28.0,65.0 L 27.0,66.0 L 27.0,74.0 L 26.0,75.0 L 27.0,76.0 L 27.0,84.0 L 29.0,88.0 L 29.0,91.0 L 33.0,99.0 L 39.0,107.0 L 47.0,114.0 L 56.0,119.0 L 58.0,119.0 L 61.0,121.0 L 70.0,122.0 L 74.0,124.0 L 74.0,135.0 L 71.0,137.0 L 69.0,137.0 L 65.0,139.0 L 61.0,143.0 L 57.0,149.0 L 51.0,148.0 L 46.0,145.0 L 44.0,145.0 L 41.0,143.0 L 39.0,143.0 L 35.0,141.0 L 35.0,139.0 L 34.0,138.0 L 36.0,133.0 L 36.0,127.0 L 34.0,122.0 L 27.0,115.0 L 22.0,113.0 L 16.0,113.0 L 11.0,115.0 L 8.0,114.0 L 6.0,110.0 L 6.0,108.0 L 3.0,103.0 L 3.0,101.0 L 1.0,98.0 L 0.0,92.0 L 2.0,90.0 L 5.0,89.0 L 10.0,84.0 L 12.0,80.0 L 13.0,73.0 L 10.0,65.0 L 5.0,60.0 L 2.0,59.0 L 0.0,57.0 L 0.0,54.0 Z"
      fill={fillGear}
    />
    {/* Inner Orange Circle */}
    <circle cx="80.5" cy="74.5" r="32.5" fill={fillCircle} />
  </svg>
);

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  showBadge = true,
  showSubtitle = true,
  isArabic = false,
  className = '',
  onClick,
}) => {
  // Height map for different size presets
  const sizeMap = {
    xs: { h: 'h-6', markH: 'h-6 w-auto', text: 'text-sm', badge: 'text-[9px]' },
    sm: { h: 'h-7 sm:h-8', markH: 'h-7 sm:h-8 w-auto', text: 'text-base', badge: 'text-[9px]' },
    md: { h: 'h-8 sm:h-9', markH: 'h-9 sm:h-10 w-auto', text: 'text-base sm:text-lg', badge: 'text-[10px]' },
    lg: { h: 'h-10 sm:h-12', markH: 'h-12 sm:h-14 w-auto', text: 'text-xl sm:text-2xl', badge: 'text-xs' },
    xl: { h: 'h-14 sm:h-16', markH: 'h-16 sm:h-20 w-auto', text: 'text-2xl sm:text-3xl', badge: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  // 1. Mark only variant
  if (variant === 'mark') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${className}`}
        title="IQAutoMarket"
      >
        <img
          src="/logo-mark.png"
          srcSet="/logo-mark.png 1x, /logo-mark@2x.png 2x, /logo-mark@4x.png 4x"
          alt="IQAutoMarket Mark"
          className={`${currentSize.markH} object-contain drop-shadow-[0_2px_8px_rgba(51,90,255,0.35)]`}
        />
      </div>
    );
  }

  // 2. White monochrome mark variant
  if (variant === 'white') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${className}`}
        title="IQAutoMarket"
      >
        <img
          src="/logo-white.png"
          srcSet="/logo-white.png 1x, /logo-white@2x.png 2x"
          alt="IQAutoMarket Mark White"
          className={`${currentSize.markH} object-contain brightness-100 opacity-90 hover:opacity-100 transition-opacity`}
        />
      </div>
    );
  }

  // 3. Badge variant (illuminated card with the vector emblem and custom styled typography)
  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      >
        <div className="relative p-1.5 sm:p-2 rounded-2xl bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-indigo-950/80 border border-blue-500/25 shadow-lg shadow-blue-900/30 group-hover:border-blue-400/50 group-hover:scale-105 transition-all">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#335aff]/20 via-transparent to-[#fd660e]/20 opacity-70 group-hover:opacity-100 transition-opacity" />
          <LogoMarkSvg className="w-7 h-7 sm:w-8 sm:h-8 relative z-10 drop-shadow-[0_2px_6px_rgba(51,90,255,0.4)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={`font-black tracking-tight text-white ${currentSize.text}`}>
              <span className="text-[#fd660e]">IQ</span>Auto<span className="text-[#335aff]">Market</span>
            </span>
            {showBadge && (
              <span className={`${currentSize.badge} font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/25`}>
                {isArabic ? 'العراق' : 'IRAQ'}
              </span>
            )}
          </div>
          {showSubtitle && (
            <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
              {isArabic
                ? 'سوق قطع الغيار المعتمد وتكامل أنظمة الوكلاء'
                : 'Genuine Parts & Integrated Dealer Network'}
            </p>
          )}
        </div>
      </div>
    );
  }

  // 4. Full or Dark variants: High-resolution official image logo with optional badge & subtitle
  const imgSrc = variant === 'dark' ? '/logo-dark.png' : '/logo.png';
  const srcSet =
    variant === 'dark'
      ? '/logo-dark.png 1x, /logo-dark@2x.png 2x'
      : '/logo.png 1x, /logo@2x.png 2x, /logo@4x.png 4x';

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <div className="relative flex items-center shrink-0">
        <img
          src={imgSrc}
          srcSet={srcSet}
          alt="IQAutoMarket"
          className={`${currentSize.h} w-auto object-contain transition-transform duration-200 group-hover:scale-102 drop-shadow-[0_2px_10px_rgba(51,90,255,0.25)]`}
        />
      </div>

      {(showBadge || showSubtitle) && (
        <div className="flex flex-col justify-center">
          {showBadge && (
            <div className="flex items-center gap-1.5">
              <span className={`${currentSize.badge} font-bold uppercase tracking-wider text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/25`}>
                {isArabic ? 'العراق' : 'IRAQ'}
              </span>
            </div>
          )}
          {showSubtitle && (
            <p className="text-[11px] text-slate-400 hidden lg:block font-medium mt-0.5 whitespace-nowrap">
              {isArabic
                ? 'سوق قطع الغيار وتكامل الوكلاء'
                : 'Genuine Spare Parts Marketplace'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
