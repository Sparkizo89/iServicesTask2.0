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
      className="relative bg-[#0f0f0f] rounded-[32px] p-7 cursor-pointer transition-all duration-300 group overflow-hidden border border-[#262626] hover:border-orange-600/50 hover:bg-[#141414] active:scale-[0.98] glow-hover"
    >
      {/* Nothing Glitch Texture on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] transition-opacity duration-500 pointer-events-none"></div>

      {/* Header with Icon and Code */}
      <div className="flex justify-between items-start mb-10">
        <div className="w-16 h-16 rounded-2xl bg-black border border-[#333] text-white flex items-center justify-center text-3xl group-hover:bg-orange-600 group-hover:text-black group-hover:border-orange-600 transition-all duration-300 shadow-inner">
          <Icon />
        </div>
        <div className="flex flex-col items-end">
            <span className="text-4xl text-[#222] group-hover:text-[#333] transition-colors font-tech font-bold leading-none select-none">
                0{Math.floor(Math.random() * 9)}
            </span>
             <span className="text-[10px] font-tech text-orange-600 border border-orange-600/30 px-2 py-0.5 rounded uppercase tracking-wider bg-orange-600/5 mt-1">
              {procedure.code}
            </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="font-tech text-2xl text-white mb-3 uppercase tracking-tight leading-none group-hover:text-orange-500 transition-colors">
          {procedure.title}
        </h3>
        <p className="text-sm font-sans text-neutral-500 leading-relaxed border-l-2 border-[#262626] pl-3 group-hover:border-orange-600/50 transition-colors">
          {procedure.desc}
        </p>
      </div>

      {/* Footer Dots */}
      <div className="absolute bottom-6 right-6 flex gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
         <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
         <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
         <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
      </div>
    </div>
  );
};

export default ProcedureCard;