import React from 'react';

export default function PixelBanner({ className = '' }) {
  const pixelColors = [
    '#2da44e', '#57ab5a', '#bf4b8a', '#ff7b72', 
    '#d4a72c', '#e3b341', '#1f6feb', '#388bfd', 
    '#2da44e', '#a371f7', '#bf4b8a', '#238636'
  ];

  return (
    <div className={`w-full overflow-hidden flex border-y border-[#d0d7de] bg-[#f6f8fa] select-none ${className}`}>
      <div className="grid grid-flow-col auto-cols-[16px] md:auto-cols-[20px] h-4 md:h-5 opacity-90 w-full">
        {Array.from({ length: 80 }).map((_, i) => (
          <div
            key={i}
            className="h-full border-r border-[#d0d7de]/30 transition-colors duration-300 hover:opacity-100"
            style={{
              backgroundColor: i % 3 === 0 ? pixelColors[i % pixelColors.length] : 'transparent'
            }}
          />
        ))}
      </div>
    </div>
  );
}
