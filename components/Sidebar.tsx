import React from 'react';
import { FaLayerGroup, FaAddressBook, FaBookOpen } from 'react-icons/fa6';
import { ProcedureCategory } from '../types';

interface SidebarProps {
  activeCategory: ProcedureCategory;
  onSelectCategory: (category: ProcedureCategory) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const getButtonClass = (category: ProcedureCategory, isActive: boolean) => {
    // Mobile/Tablet: flex-col center, Desktop (LG): flex-row
    const baseClass = "flex lg:w-full flex-col lg:flex-row items-center gap-1 lg:gap-4 px-2 lg:px-5 py-2 lg:py-4 rounded-2xl lg:rounded-full transition-all duration-300 font-tech text-[10px] lg:text-sm tracking-widest uppercase relative overflow-hidden group justify-center lg:justify-start";
    
    if (isActive) {
        return `${baseClass} bg-orange-600 text-black font-bold shadow-[0_0_20px_rgba(234,88,12,0.4)] scale-105`;
    }

    return `${baseClass} text-neutral-500 dark:hover:text-white hover:text-black dark:hover:bg-[#1a1a1a] hover:bg-neutral-200 border border-transparent dark:hover:border-[#333] hover:border-neutral-300`;
  };

  return (
    <aside className="fixed bottom-0 left-0 w-full h-20 lg:static lg:h-auto lg:w-80 dark:bg-black/80 bg-white/80 backdrop-blur-xl lg:backdrop-blur-sm border-t lg:border-t-0 lg:border-r dark:border-[#262626] border-neutral-300 flex flex-row lg:flex-col z-40 lg:pt-8 transition-colors justify-between shadow-[0_-5px_20px_rgba(0,0,0,0.1)] lg:shadow-none">
      <div className="flex-1 flex flex-row lg:flex-col justify-around lg:justify-start items-center lg:items-stretch px-2 lg:px-6 lg:space-y-4 w-full">
          <button 
            onClick={() => onSelectCategory('all')} 
            className={getButtonClass('all', activeCategory === 'all')}
          >
            <FaLayerGroup className="text-xl lg:text-lg mb-1 lg:mb-0" /> 
            <span className="lg:hidden xl:inline">Procédures</span>
            {activeCategory === 'all' && <div className="hidden lg:block absolute right-4 w-2 h-2 dark:bg-black bg-white rounded-full animate-pulse"></div>}
          </button>

          <button 
            onClick={() => onSelectCategory('contacts')} 
            className={getButtonClass('contacts', activeCategory === 'contacts')}
          >
            <FaAddressBook className="text-xl lg:text-lg mb-1 lg:mb-0" /> 
            <span className="lg:hidden xl:inline">Contacts</span>
             {activeCategory === 'contacts' && <div className="hidden lg:block absolute right-4 w-2 h-2 dark:bg-black bg-white rounded-full animate-pulse"></div>}
          </button>

          <div className="hidden lg:block h-px w-full bg-gradient-to-r from-transparent dark:via-[#333] via-neutral-300 to-transparent my-4 transition-colors"></div>

          <button 
            onClick={() => onSelectCategory('guide')} 
            className={getButtonClass('guide', activeCategory === 'guide')}
          >
            <FaBookOpen className="text-xl lg:text-lg mb-1 lg:mb-0" /> 
            <span className="lg:hidden xl:inline">Guide IA</span>
             {activeCategory === 'guide' && <div className="hidden lg:block absolute right-4 w-2 h-2 dark:bg-black bg-white rounded-full animate-pulse"></div>}
          </button>
      </div>
      
      <div className="hidden lg:block p-8 border-t dark:border-[#262626] border-neutral-300 transition-colors">
        <div className="flex flex-col gap-1 items-center lg:items-start opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-tech text-neutral-500 uppercase tracking-widest">iServices Corp</span>
            <div className="text-[8px] font-mono text-neutral-500">Powered by Mathieu Geneste</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;