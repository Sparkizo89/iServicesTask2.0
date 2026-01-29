import React from 'react';
import { FaLayerGroup, FaAddressBook, FaBookOpen } from 'react-icons/fa6';
import { ProcedureCategory } from '../types';

interface SidebarProps {
  activeCategory: ProcedureCategory;
  onSelectCategory: (category: ProcedureCategory) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeCategory, onSelectCategory }) => {
  const getButtonClass = (category: ProcedureCategory, isActive: boolean) => {
    const baseClass = "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-medium";
    
    // Special styling for specific tabs
    if (category === 'contacts' || category === 'guide') {
        return isActive
            ? `${baseClass} bg-blue-50 text-blue-700 font-bold`
            : `${baseClass} text-slate-500 hover:bg-blue-50 hover:text-blue-600`;
    }

    if (isActive) {
        return `${baseClass} bg-orange-50 text-orange-700 font-bold`;
    }

    return `${baseClass} text-slate-500 hover:bg-slate-50`;
  };

  return (
    <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col z-20">
      <div className="p-4 flex-1 overflow-y-auto">
        <nav className="space-y-1">
          <button 
            onClick={() => onSelectCategory('all')} 
            className={getButtonClass('all', activeCategory === 'all')}
          >
            <FaLayerGroup className="text-lg" /> <span className="hidden lg:inline">Toutes les fiches</span>
          </button>

          <div className="my-4 border-t border-slate-100"></div>

          <button 
            onClick={() => onSelectCategory('contacts')} 
            className={getButtonClass('contacts', activeCategory === 'contacts')}
          >
            <FaAddressBook className="text-lg" /> <span className="hidden lg:inline">Contacts Utiles</span>
          </button>

          <button 
            onClick={() => onSelectCategory('guide')} 
            className={getButtonClass('guide', activeCategory === 'guide')}
          >
            <FaBookOpen className="text-lg" /> <span className="hidden lg:inline">Guide Procédure</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;