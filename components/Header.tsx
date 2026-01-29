import React from 'react';
import { FaBolt } from 'react-icons/fa6';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex-none z-30 shadow-sm px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-orange-500 flex items-center justify-center text-white shadow-lg">
            <FaBolt className="text-xl" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-none">iServices Task</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Outil Interne de Transaction</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Système Prêt
        </div>
      </div>
    </header>
  );
};

export default Header;