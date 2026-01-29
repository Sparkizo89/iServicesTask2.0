import React from 'react';
import { FaBolt } from 'react-icons/fa6';

const Header: React.FC = () => {
  return (
    <header className="h-24 flex-none z-30 px-6 flex items-end pb-4 border-b border-[#262626] bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="relative">
             <div className="w-12 h-12 border border-[#333] bg-[#0a0a0a] flex items-center justify-center text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-black transition-colors duration-300">
                <FaBolt className="text-xl" />
             </div>
             {/* Dot decoration */}
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-black"></div>
          </div>
          
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-3xl font-tech text-white tracking-tighter uppercase leading-none">
              iServices<span className="text-neutral-600">.task</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-neutral-500 font-tech uppercase tracking-[0.2em]">OS v2.0</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-[#111] px-4 py-2 rounded-full border border-[#222]">
          <div className="w-2 h-2 bg-orange-600 rounded-full"></div> 
          <span className="text-xs font-tech text-neutral-400 uppercase tracking-widest">System Operational</span>
        </div>
      </div>
    </header>
  );
};

export default Header;