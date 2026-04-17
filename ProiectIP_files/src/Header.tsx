import React from 'react';

export default function Header() {
  return (
    // Containerul principal: 49px înălțime, border jos, padding stânga/dreapta 24px (px-6)
    <header className="w-full h-[49px] bg-[#F2EAE0] border-b border-[#E5DDD4] flex items-center justify-between px-6 shrink-0">
      
      {/* Logo-ul din stânga */}
      <div className="font-bold text-[16px] text-[#9B8EC7]">
        FIISmart
      </div>

      {/* Link-urile de navigare din dreapta */}
      <div className="flex items-center gap-6">
        <a href="#" className="text-[14px] font-medium text-[#5A4A3A] hover:text-[#9B8EC7] transition-colors">
          Home
        </a>
        <a href="#" className="text-[14px] font-medium text-[#9B8EC7]">
          Quiz
        </a>
      </div>
      
    </header>
  );
}