import React from 'react';
import { FaLayerGroup, FaAddressBook, FaBookOpen } from 'react-icons/fa6';
import { ProcedureCategory } from '../types';

interface SidebarProps {
  activeCategory: ProcedureCategory;
  onSelectCategory: (category: ProcedureCategory) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const getButtonClass = (category: ProcedureCategory, isActive: boolean) => {
    const baseClass = "w-full flex items-center gap-4 px-5 py-4 rounded-full transition-all duration-300 font-tech text-sm tracking-widest uppercase relative overflow-hidden group";
    
    if (isActive) {
        return `${baseClass} bg-orange-600 text-black font-bold shadow-[0_0_20px_rgba(234,88,12,0.4)] scale-105`;
    }

    return `${baseClass} text-neutral-500 hover:text-white hover:bg-[#1a1a1a] border border-transparent hover:border-[#333]`;
  };

  return (
    <aside className="w-20 lg:w-80 bg-black/50 backdrop-blur-sm border-r border-[#262626] flex flex-col z-20 pt-8">
      <div className="px-6 flex-1 overflow-y-auto space-y-4">
          <button 
            onClick={() => onSelectCategory('all')} 
            className={getButtonClass('all', activeCategory === 'all')}
          >
            <FaLayerGroup className="text-lg" /> 
            <span className="hidden lg:inline">Procédures</span>
            {activeCategory === 'all' && <div className="absolute right-4 w-2 h-2 bg-black rounded-full animate-pulse"></div>}
          </button>

          <button 
            onClick={() => onSelectCategory('contacts')} 
            className={getButtonClass('contacts', activeCategory === 'contacts')}
          >
            <FaAddressBook className="text-lg" /> 
            <span className="hidden lg:inline">Contacts</span>
             {activeCategory === 'contacts' && <div className="absolute right-4 w-2 h-2 bg-black rounded-full animate-pulse"></div>}
          </button>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#333] to-transparent my-4"></div>

          <button 
            onClick={() => onSelectCategory('guide')} 
            className={getButtonClass('guide', activeCategory === 'guide')}
          >
            <FaBookOpen className="text-lg" /> 
            <span className="hidden lg:inline">AI Guide</span>
             {activeCategory === 'guide' && <div className="absolute right-4 w-2 h-2 bg-black rounded-full animate-pulse"></div>}
          </button>
      </div>
      
      <div className="p-8 border-t border-[#262626]">
        <div className="flex flex-col gap-1 items-center lg:items-start opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-[10px] font-tech text-neutral-400 uppercase tracking-widest">iServices Corp</span>
            <div className="text-[8px] font-mono text-neutral-600">Encoded by GenAI</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;