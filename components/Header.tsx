import React, { useState, useEffect } from 'react';
import { FaBolt, FaMoon, FaSun } from 'react-icons/fa6';
import ScrambleText from './ScrambleText';

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme }) => {
  const [scrambleTitle, setScrambleTitle] = useState(false);

  useEffect(() => {
    // Randomly trigger the scramble effect
    const scheduleScramble = () => {
        const randomDelay = Math.random() * 5000 + 3000; // Between 3s and 8s
        return setTimeout(() => {
            setScrambleTitle(true);
            // Duration of the scramble
            setTimeout(() => {
                setScrambleTitle(false);
                timerRef.current = scheduleScramble();
            }, 1000); 
        }, randomDelay);
    };

    let timerRef = { current: scheduleScramble() };

    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <header className="h-20 md:h-24 flex-none z-30 px-4 md:px-6 flex items-end pb-3 md:pb-4 border-b dark:border-[#262626] border-neutral-300 dark:bg-black/80 bg-white/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-3 md:gap-4 group cursor-default">
          <div className="relative">
             <div className="w-10 h-10 md:w-12 md:h-12 border dark:border-[#333] border-neutral-300 dark:bg-[#0a0a0a] bg-neutral-100 flex items-center justify-center text-orange-600 rounded-full group-hover:bg-orange-600 group-hover:text-black transition-colors duration-300">
                <FaBolt className="text-lg md:text-xl" />
             </div>
             {/* Dot decoration */}
             <div className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 dark:bg-white bg-black rounded-full border-2 dark:border-black border-white"></div>
          </div>
          
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-xl md:text-3xl font-tech dark:text-white text-black tracking-tighter uppercase leading-none transition-colors">
              <ScrambleText text="iServices" trigger={scrambleTitle} />
              <span className="text-neutral-500">
                  <ScrambleText text=".task" trigger={scrambleTitle} />
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5 md:mt-1">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></span>
                <p className="text-[9px] md:text-[10px] text-neutral-500 font-tech uppercase tracking-[0.2em]">OS v2.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
             {/* Theme Toggle - Nothing Style */}
            <button 
                onClick={toggleTheme}
                className="relative w-12 h-7 md:w-16 md:h-8 rounded-full border dark:border-[#333] border-neutral-400 dark:bg-black bg-neutral-100 flex items-center px-0.5 md:px-1 transition-all duration-300 group"
                aria-label="Toggle Dark Mode"
            >
                <div className={`absolute w-5 h-5 md:w-6 md:h-6 rounded-full transition-all duration-300 flex items-center justify-center text-[10px] ${
                    isDarkMode 
                    ? 'left-[calc(100%-1.4rem)] md:left-[calc(100%-1.75rem)] bg-white text-black' 
                    : 'left-0.5 md:left-1 bg-black text-white'
                }`}>
                    {isDarkMode ? <FaMoon /> : <FaSun />}
                </div>
            </button>

            <div className="hidden md:flex items-center gap-2 dark:bg-[#111] bg-neutral-100 px-4 py-2 rounded-full border dark:border-[#222] border-neutral-300 transition-colors">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div> 
                <span className="text-xs font-tech text-neutral-500 uppercase tracking-widest">Système Opérationnel</span>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;