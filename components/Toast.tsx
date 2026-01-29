import React, { useEffect } from 'react';
import { FaCircleCheck } from 'react-icons/fa6';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <div
      className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900 text-slate-50 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-500 z-50 min-w-[320px] ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
        <FaCircleCheck />
      </div>
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-auto text-orange-400 text-xs font-bold uppercase tracking-widest px-2 hover:text-orange-300">
        Fermer
      </button>
    </div>
  );
};

export default Toast;