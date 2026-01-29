import React, { useState, useEffect } from 'react';
import { FaXmark, FaPlus, FaTrashCan, FaPaperPlane, FaCopy, FaCircleExclamation, FaChevronDown } from 'react-icons/fa6';
import { Procedure } from '../types';

interface ModalProps {
  procedure: Procedure | null;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const Modal: React.FC<ModalProps> = ({ procedure, onClose, onShowToast }) => {
  const [staticData, setStaticData] = useState<Record<string, string>>({});
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [usageMagasin, setUsageMagasin] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  useEffect(() => {
    if (procedure) {
      const initialStatic: Record<string, string> = {};
      procedure.staticFields.forEach(f => {
        initialStatic[f.id] = f.default || '';
      });
      setStaticData(initialStatic);
      setRows([{}]); 
      setUsageMagasin(false);
      setErrors([]);
      setShowValidationAlert(false);
    }
  }, [procedure]);

  const handleStaticChange = (id: string, value: string) => {
    setStaticData(prev => ({ ...prev, [id]: value }));
    if (errors.includes(id)) {
      setErrors(prev => prev.filter(e => e !== id));
    }
  };

  const handleRowChange = (index: number, fieldId: string, value: string) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [fieldId]: value };
    setRows(newRows);
  };

  const addRow = () => {
    setRows([...rows, {}]);
  };

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const handleUsageMagasinToggle = (checked: boolean) => {
    setUsageMagasin(checked);
    if (checked) {
      handleStaticChange('reason', 'UTILISATION EN MAGASIN');
    } else {
      handleStaticChange('reason', '');
    }
  };

  const validate = (): boolean => {
    const newErrors: string[] = [];
    Object.keys(staticData).forEach(key => {
        if ((key.includes('reason') || key.includes('justification')) && !staticData[key]) {
            newErrors.push(key);
        }
    });

    const reasonField = procedure?.staticFields.find(f => f.id === 'reason' || f.id === 'justification');
    if (reasonField && !staticData[reasonField.id]) {
         if(!newErrors.includes(reasonField.id)) newErrors.push(reasonField.id);
    }

    setErrors(newErrors);
    setShowValidationAlert(newErrors.length > 0);
    return newErrors.length === 0;
  };

  const generateBody = () => {
    if (!procedure) return '';
    let bodyText = "";

    if (procedure.id === 'reprise') {
        bodyText = `Bonjour,\n\nJe demande l'entrée de l'équipement suivant :\n\n`;
        rows.forEach(item => {
            bodyText += `iPhone : ${item.model || "-"}\n`;
            bodyText += `Stockage : ${item.storage || "-"}\n`;
            bodyText += `Couleur : ${item.color || "-"}\n`;
            bodyText += `Grade : ${item.grade || "-"}\n`;
            bodyText += `IMEI : ${item.imei || "-"}\n`;
            bodyText += `Valeur de Reprise : € ${item.val || "-"}\n`;
            if (item.info) bodyText += `Informations complémentaires : ${item.info}\n`;
            bodyText += `\n`;
        });
        bodyText += `Facture : [ ${staticData.facture || "N/A"} ]\n\n`;
        bodyText += `Merci,\n\n${staticData.magasin}`;
    } else if (procedure.id === 'conso') {
        bodyText = `Bonjour,\n\nDemande de consommables pour le magasin ${staticData.magasin} :\n\n`;
        rows.forEach(item => {
            const qtyStr = item.qty ? ` (Qté: ${item.qty})` : "";
            bodyText += `- ${item.article || "-"}${qtyStr}\n`;
        });
        bodyText += `\nMerci d'avance.\nCordialement.`;
    } else if (procedure.id === 'trf') {
        bodyText = `Bonjour,\n\nVous pouvez effectuer le transfert :\n\n`;
        rows.forEach(item => {
            const qtyPart = item.qty ? ` (Qté: ${item.qty})` : "";
            const imeiPart = item.imei ? ` (IMEI: ${item.imei})` : "";
            bodyText += `- ${item.ref || "-"}${qtyPart}${imeiPart}\n`;
        });
        bodyText += `\nDu magasin ${staticData.exp || "?"} ----> ${staticData.dest || "?"}.\n\nMerci`;
    } else {
        const actionTitle = (procedure.id === 'sort' && usageMagasin) ? 'USAGE INTERNE' : procedure.title;
        bodyText = `Bonjour,\n\nAction : ${actionTitle}\n\n`;
        rows.forEach(item => {
            Object.entries(item).forEach(([k, v]) => {
                const label = procedure.dynamicFields.find(f => f.id === k)?.label || k;
                if (v) bodyText += `${label.toUpperCase()} : ${v}\n`;
            });
            bodyText += `\n`;
        });
        bodyText += `Justification : ${staticData.reason || "N/A"}\n\n`;
        bodyText += `Merci,\n\n${staticData.magasin}`;
    }
    return bodyText;
  };

  const handleSendEmail = () => {
    if (!validate() || !procedure) return;

    let subject = procedure.customSubject || `${procedure.code} - ${procedure.title}`;
    if (usageMagasin) subject = "SAI";
    else if (procedure.id === 'sort') subject = "SORT";

    const body = generateBody();
    const mailto = `mailto:${procedure.to}?cc=${procedure.cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    onShowToast("App launched");
  };

  const handleCopyTable = async () => {
    if (!validate() || !procedure) return;

    const tableHeaders = procedure.dynamicFields.map(f => `<th style="color: white; padding: 12px; text-align: left; border: 1px solid #e2e8f0; font-size: 12px; background-color: #ea580c;">${f.label}</th>`).join('');
    const tableRows = rows.map(item => `<tr>${procedure.dynamicFields.map(f => `<td style="padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; background-color: white;">${item[f.id] || "-"}</td>`).join('')}</tr>`).join('');
    const content = `<div style="font-family: Arial, sans-serif;"><h2 style="color: #ea580c;">${procedure.title}</h2><p><b>Magasin:</b> ${staticData.magasin || staticData.exp || ''}</p><table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;"><thead><tr>${tableHeaders}</tr></thead><tbody>${tableRows}</tbody></table></div>`;

    try {
        const blob = new Blob([content], { type: 'text/html' });
        const dataItem = new ClipboardItem({ 'text/html': blob });
        await navigator.clipboard.write([dataItem]);
        onShowToast("Data Copied");
    } catch (err) {
        console.error(err);
        onShowToast("Error");
    }
  };

  if (!procedure) return null;

  const displayedCode = (usageMagasin && procedure.id === 'sort') ? 'SAI' : (procedure.id === 'sort' ? 'SORT' : procedure.code);
  const codeColor = (usageMagasin && procedure.id === 'sort') ? 'text-orange-500 border-orange-500' : 'text-neutral-400 border-neutral-700';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#000]/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-[#050505] rounded-[32px] border border-[#262626] w-full max-w-6xl relative z-10 flex flex-col max-h-[90vh] animate-[fadeIn_0.3s_ease-out] overflow-hidden shadow-2xl">
        
        {/* Error Banner */}
        {showValidationAlert && (
             <div className="bg-red-900/10 border-b border-red-500 text-red-500 px-8 py-3 flex items-center justify-between font-tech tracking-wider uppercase animate-shake">
                <div className="flex items-center gap-3">
                    <FaCircleExclamation />
                    <span className="text-sm">Error: Missing Required Field</span>
                </div>
                <button onClick={() => setShowValidationAlert(false)} className="hover:text-white"><FaXmark /></button>
            </div>
        )}

        {/* Header */}
        <div className="p-8 border-b border-[#262626] flex justify-between items-center bg-[#0a0a0a]">
            <div className="flex items-center gap-6">
                <div>
                    <span className={`${codeColor} text-[10px] font-tech font-bold px-3 py-1 border rounded-full bg-transparent uppercase mb-2 inline-block tracking-[0.2em]`}>{displayedCode}</span>
                    <h2 className="text-3xl font-tech font-bold text-white tracking-tighter uppercase">{procedure.title}</h2>
                </div>
                
                {procedure.id === 'sort' && (
                    <div className="flex items-center gap-3 bg-[#111] px-5 py-2 rounded-full border border-[#262626]">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={usageMagasin} onChange={(e) => handleUsageMagasinToggle(e.target.checked)} className="sr-only peer" />
                            <div className="w-10 h-5 bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                        <span className="text-[10px] font-tech font-bold uppercase text-neutral-400 tracking-wider">Internal Use</span>
                    </div>
                )}
            </div>
            <button onClick={onClose} className="w-12 h-12 rounded-full bg-[#111] border border-[#262626] flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300">
                <FaXmark className="text-xl" />
            </button>
        </div>
        
        {/* Content */}
        <div className="p-8 overflow-y-auto space-y-10 bg-dots scrollbar-thin">
            {/* Static Fields */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {procedure.staticFields.map(f => (
                    <div key={f.id} className="col-span-2 md:col-span-1 group">
                        <label className="block text-[10px] font-tech font-bold text-neutral-500 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-orange-500 transition-colors">{f.label}</label>
                        {f.options ? (
                             <div className="relative">
                                <select 
                                    value={staticData[f.id] || ''}
                                    onChange={(e) => handleStaticChange(f.id, e.target.value)}
                                    className={`w-full px-5 py-4 bg-[#0a0a0a] border ${errors.includes(f.id) ? 'border-red-500' : 'border-[#262626]'} rounded-xl text-sm text-white focus:border-orange-600 focus:bg-black outline-none transition-all appearance-none cursor-pointer font-mono shadow-inner`}
                                >
                                    <option value="" disabled>{f.placeholder || 'SELECT_OPTION'}</option>
                                    {f.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none text-xs" />
                            </div>
                        ) : (
                            <input 
                                type="text" 
                                value={staticData[f.id] || ''} 
                                onChange={(e) => handleStaticChange(f.id, e.target.value)}
                                className={`w-full px-5 py-4 bg-[#0a0a0a] border ${errors.includes(f.id) ? 'border-red-500' : 'border-[#262626]'} rounded-xl text-sm text-white focus:border-orange-600 focus:bg-black outline-none transition-all font-mono placeholder:text-neutral-800 shadow-inner`}
                                placeholder={f.placeholder || 'INPUT_DATA'}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Dynamic Rows */}
            <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-[#262626] relative overflow-hidden">
                <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-xs font-tech font-bold text-white uppercase tracking-widest flex items-center gap-3">
                        <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></span>
                        Operations_List
                    </h3>
                    <button onClick={addRow} className="bg-white hover:bg-neutral-200 text-black text-xs font-tech font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-2 uppercase tracking-wider">
                        <FaPlus /> Add Line
                    </button>
                </div>
                <div className="space-y-4 relative z-10">
                    {rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-4 items-end bg-[#050505] p-5 rounded-2xl border border-[#222] animate-[fadeIn_0.3s_ease-out] hover:border-[#444] transition-colors">
                            {procedure.dynamicFields.map(f => (
                                <div key={f.id} className={f.width === 'flex-1' ? 'flex-1' : f.width}>
                                    <label className="block text-[9px] font-mono font-bold text-neutral-600 uppercase mb-2 whitespace-nowrap">{f.label}</label>
                                    <input 
                                        type={f.type || 'text'}
                                        value={row[f.id] || ''}
                                        onChange={(e) => handleRowChange(rowIndex, f.id, e.target.value)}
                                        className="w-full p-2 bg-transparent border-b border-[#333] focus:border-orange-600 rounded-none text-sm text-white outline-none transition-colors font-mono placeholder:text-[#222]"
                                        placeholder={f.placeholder || '...'}
                                    />
                                </div>
                            ))}
                             <button onClick={() => removeRow(rowIndex)} className="w-8 h-8 flex-none flex items-center justify-center text-neutral-600 hover:text-red-500 transition-colors">
                                <FaTrashCan />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-[#0f0f0f] rounded-2xl border border-[#262626]">
                <div className="flex-1">
                    <p className="text-[10px] font-tech font-bold uppercase text-neutral-500 mb-2 tracking-widest">Recipient</p>
                    <div className="text-sm font-bold text-white font-mono bg-black p-3 rounded border border-[#222]">{procedure.to}</div>
                </div>
                 <div className="flex-1">
                    <p className="text-[10px] font-tech font-bold uppercase text-neutral-500 mb-2 tracking-widest">Carbon Copy (CC)</p>
                    <div className="text-[11px] text-neutral-400 font-mono bg-black p-3 rounded border border-[#222] break-all">{procedure.cc}</div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-[#262626] grid grid-cols-1 md:grid-cols-2 gap-4 mt-auto bg-[#0a0a0a]">
            <button onClick={handleSendEmail} className="w-full py-5 bg-orange-600 hover:bg-orange-500 text-black font-bold font-tech text-base rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-[0_0_25px_rgba(234,88,12,0.4)] flex items-center justify-center gap-3 uppercase tracking-widest group">
                <FaPaperPlane className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> Launch Mail Protocol
            </button>
            <button onClick={handleCopyTable} className="w-full py-5 bg-black hover:bg-[#111] text-white font-bold font-tech text-base rounded-2xl hover:scale-[1.01] active:scale-95 transition-all border border-[#333] hover:border-white flex items-center justify-center gap-3 uppercase tracking-widest">
                <FaCopy /> Copy Data
            </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;