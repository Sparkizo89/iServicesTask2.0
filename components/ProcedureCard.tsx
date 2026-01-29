import React from 'react';
import * as Fa6Icons from 'react-icons/fa6';
import { Procedure } from '../types';

interface ProcedureCardProps {
  procedure: Procedure;
  onClick: (procedure: Procedure) => void;
}

const ProcedureCard: React.FC<ProcedureCardProps> = ({ procedure, onClick }) => {
  // Dynamically get icon component
  // @ts-ignore
  const IconComponent = Fa6Icons[procedure.icon.replace('fa-', '')] 
    // @ts-ignore
    || Fa6Icons[Object.keys(Fa6Icons).find(k => k.toLowerCase() === procedure.icon.replace('fa-', '').replace(/-/g, ''))] 
    || Fa6Icons.FaBolt;

    // Mapping manually for the known ones to be safe if dynamic fails or names differ
    let Icon = Fa6Icons.FaBolt;
    switch(procedure.icon) {
        case 'fa-mobile-retro': Icon = Fa6Icons.FaMobileRetro; break;
        case 'fa-box-tissue': Icon = Fa6Icons.FaBoxTissue; break;
        case 'fa-truck-fast': Icon = Fa6Icons.FaTruckFast; break;
        case 'fa-circle-plus': Icon = Fa6Icons.FaCirclePlus; break;
        case 'fa-circle-minus': Icon = Fa6Icons.FaCircleMinus; break;
    }

  return (
    <div 
      onClick={() => onClick(procedure)} 
      className="bg-white rounded-2xl p-5 border border-slate-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 cursor-pointer transition-all group flex flex-col gap-4 h-full"
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 rounded-xl bg-slate-50 text-orange-600 flex items-center justify-center text-xl group-hover:bg-orange-600 group-hover:text-white transition-all">
          <Icon />
        </div>
        <span className="text-[9px] font-black px-2 py-1 bg-slate-100 rounded text-slate-500 uppercase tracking-tighter">
          {procedure.code}
        </span>
      </div>
      <div>
        <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
          {procedure.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
          {procedure.desc}
        </p>
      </div>
    </div>
  );
};

export default ProcedureCard;