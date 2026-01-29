import React from 'react';
import * as Fa6Icons from 'react-icons/fa6';
import { ContactItem } from '../types';

interface ContactCardProps {
  contact: ContactItem;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  // Dynamically get icon
  // @ts-ignore
  const IconComponent = Fa6Icons[contact.icon.replace('fa-', '')] 
    // @ts-ignore
    || Fa6Icons[Object.keys(Fa6Icons).find(k => k.toLowerCase() === contact.icon.replace('fa-', '').replace(/-/g, ''))] 
    || Fa6Icons.FaAddressCard;

  let Icon = Fa6Icons.FaAddressCard;
    switch(contact.icon) {
        case 'fa-shield-halved': Icon = Fa6Icons.FaShieldHalved; break;
        case 'fa-mobile-screen': Icon = Fa6Icons.FaMobileScreen; break;
        case 'fa-truck-ramp-box': Icon = Fa6Icons.FaTruckRampBox; break;
        case 'fa-users': Icon = Fa6Icons.FaUsers; break;
        case 'fa-rotate': Icon = Fa6Icons.FaRotate; break;
        case 'fa-box-open': Icon = Fa6Icons.FaBoxOpen; break;
        case 'fa-microchip': Icon = Fa6Icons.FaMicrochip; break;
        case 'fa-shapes': Icon = Fa6Icons.FaShapes; break;
        case 'fa-triangle-exclamation': Icon = Fa6Icons.FaTriangleExclamation; break;
    }

  return (
    <div className="bg-[#0f0f0f] rounded-[32px] p-6 border border-[#262626] flex flex-col h-full group hover:bg-[#141414] hover:border-neutral-700 transition-all duration-300 relative overflow-hidden">
      
      {/* Decorative large icon in background */}
      <div className="absolute -right-6 -bottom-6 text-9xl text-[#1a1a1a] group-hover:text-[#222] transition-colors rotate-12 pointer-events-none opacity-50">
        <Icon />
      </div>

      <div className="flex items-center gap-5 mb-8 relative z-10">
        <div className="w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all duration-300 shadow-lg">
          <Icon />
        </div>
        <div className="flex-1 min-w-0">
             <h3 className="font-tech text-xl text-white uppercase tracking-wider truncate">{contact.role}</h3>
             <div className="h-0.5 w-8 bg-orange-600 mt-2 group-hover:w-full transition-all duration-500"></div>
        </div>
      </div>

      <div className="space-y-6 flex-1 relative z-10">
        {contact.email && (
            <div className="group/item">
                <span className="text-[9px] font-tech text-neutral-500 uppercase tracking-widest block mb-1">Email_Address</span>
                <a href={`mailto:${contact.email}`} className="text-sm font-mono text-neutral-300 hover:text-orange-500 break-all transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full group-hover/item:bg-orange-500 transition-colors"></span>
                    {contact.email}
                </a>
            </div>
        )}

        {contact.phones && contact.phones.length > 0 && (
             <div className="space-y-3">
                <span className="text-[9px] font-tech text-neutral-500 uppercase tracking-widest block">Communications</span>
                {contact.phones.map((phone, idx) => (
                    <div key={idx} className="flex flex-col bg-[#000] p-3 rounded-xl border border-[#222]">
                        <span className="text-[10px] text-neutral-500 uppercase">{phone.label}</span>
                        <span className="font-tech text-lg text-white tracking-wider">{phone.number}</span>
                    </div>
                ))}
            </div>
        )}

        {contact.cc && (
             <div>
                <span className="text-[9px] font-tech text-neutral-500 uppercase tracking-widest block mb-1">CC_List</span>
                <div className="text-[10px] font-mono text-neutral-500 bg-[#1a1a1a] p-2 rounded border border-[#333] truncate">
                    {contact.cc}
                </div>
            </div>
        )}
        
        {contact.desc && (
            <div className="pt-4 border-t border-dashed border-[#333] text-xs font-mono text-neutral-400">
                // {contact.desc}
            </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;