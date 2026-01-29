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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
          <Icon />
        </div>
        <h3 className="font-bold text-slate-900 text-lg leading-tight">{contact.role}</h3>
      </div>

      <div className="space-y-4 flex-1">
        {contact.email && (
            <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Email Principal</span>
                <a href={`mailto:${contact.email}`} className="text-sm font-medium text-blue-600 hover:underline break-all block">
                    {contact.email}
                </a>
            </div>
        )}

        {contact.cc && (
             <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">En copie (CC)</span>
                <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 leading-relaxed">
                    {contact.cc.split('+').map((email, idx) => (
                        <div key={idx} className="mb-0.5 last:mb-0">{email.trim()}</div>
                    ))}
                </div>
            </div>
        )}

        {contact.phones && contact.phones.length > 0 && (
             <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Téléphone</span>
                <div className="space-y-2">
                    {contact.phones.map((phone, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-1 last:pb-0">
                            <span className="text-slate-500">{phone.label}:</span>
                            <span className="font-bold text-slate-700 font-mono">{phone.number}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {contact.desc && (
            <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-400 italic whitespace-pre-line">
                {contact.desc}
            </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;