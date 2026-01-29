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

  // Initialize form when procedure changes
  useEffect(() => {
    if (procedure) {
      const initialStatic: Record<string, string> = {};
      procedure.staticFields.forEach(f => {
        initialStatic[f.id] = f.default || '';
      });
      setStaticData(initialStatic);
      setRows([{}]); // Start with one row
      setUsageMagasin(false);
      setErrors([]);
      setShowValidationAlert(false);
    }
  }, [procedure]);

  const handleStaticChange = (id: string, value: string) => {
    setStaticData(prev => ({ ...prev, [id]: value }));
    // Clear error for this field if it exists
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
    
    // Check static fields for 'reason' or 'justification'
    Object.keys(staticData).forEach(key => {
        if ((key.includes('reason') || key.includes('justification')) && !staticData[key]) {
            newErrors.push(key);
        }
    });

    // Specific check if 'reason' exists in procedure definitions but not filled
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
                // Find label
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
    // Override logic for Usage Magasin
    if (usageMagasin) subject = "SAI";
    else if (procedure.id === 'sort') subject = "SORT";

    const body = generateBody();
    const mailto = `mailto:${procedure.to}?cc=${procedure.cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');
    onShowToast("Gmail ouvert !");
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
        onShowToast("Tableau copié !");
    } catch (err) {
        console.error(err);
        onShowToast("Erreur de copie");
    }
  };

  if (!procedure) return null;

  const displayedCode = (usageMagasin && procedure.id === 'sort') ? 'SAI' : (procedure.id === 'sort' ? 'SORT' : procedure.code);
  const codeColor = (usageMagasin && procedure.id === 'sort') ? 'bg-orange-600' : 'bg-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl relative z-10 flex flex-col max-h-[90vh] animate-[fadeIn_0.3s_ease-out] overflow-hidden">
        
        {showValidationAlert && (
             <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between animate-bounce mt-2 mx-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                    <FaCircleExclamation />
                    <span className="text-sm font-bold">Champ obligatoire : Veuillez remplir la justification avant de continuer.</span>
                </div>
                <button onClick={() => setShowValidationAlert(false)} className="text-white/80 hover:text-white"><FaXmark /></button>
            </div>
        )}

        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-4">
                <div>
                    <span className={`${codeColor} text-white text-[10px] font-black px-2 py-0.5 rounded uppercase mb-1 inline-block tracking-tighter transition-colors duration-300`}>{displayedCode}</span>
                    <h2 className="text-xl font-extrabold text-slate-900">{procedure.title}</h2>
                </div>
                
                {procedure.id === 'sort' && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={usageMagasin} onChange={(e) => handleUsageMagasinToggle(e.target.checked)} className="sr-only peer" />
                            <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                        </label>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight">Usage Magasin</span>
                    </div>
                )}
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors">
                <FaXmark className="text-lg" />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
            {/* Static Fields */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-6">
                {procedure.staticFields.map(f => (
                    <div key={f.id} className="col-span-2 md:col-span-1">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
                        {f.options ? (
                             <div className="relative">
                                <select 
                                    value={staticData[f.id] || ''}
                                    onChange={(e) => handleStaticChange(f.id, e.target.value)}
                                    className={`w-full p-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all appearance-none cursor-pointer ${errors.includes(f.id) ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-200'}`}
                                >
                                    <option value="" disabled>{f.placeholder || 'Sélectionner...'}</option>
                                    {f.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <FaChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs" />
                            </div>
                        ) : (
                            <input 
                                type="text" 
                                value={staticData[f.id] || ''} 
                                onChange={(e) => handleStaticChange(f.id, e.target.value)}
                                className={`w-full p-3 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all ${errors.includes(f.id) ? 'border-red-500 bg-red-50 animate-shake' : 'border-slate-200'}`}
                                placeholder={f.placeholder || ''}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Dynamic Rows */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Détails de l'opération</h3>
                    <button onClick={addRow} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-2">
                        <FaPlus /> Ajouter une ligne
                    </button>
                </div>
                <div className="space-y-3">
                    {rows.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex gap-2 items-end bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200 animate-[fadeIn_0.3s_ease-out]">
                            {procedure.dynamicFields.map(f => (
                                <div key={f.id} className={f.width === 'flex-1' ? 'flex-1' : f.width}>
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 whitespace-nowrap overflow-hidden text-ellipsis">{f.label}</label>
                                    <input 
                                        type={f.type || 'text'}
                                        value={row[f.id] || ''}
                                        onChange={(e) => handleRowChange(rowIndex, f.id, e.target.value)}
                                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-orange-500 transition-colors"
                                        placeholder={f.placeholder || ''}
                                    />
                                </div>
                            ))}
                             <button onClick={() => removeRow(rowIndex)} className="w-9 h-9 flex-none flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors">
                                <FaTrashCan />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Destinataire iServices</p>
                <div className="text-sm font-bold text-slate-700">À: {procedure.to}</div>
                <div className="text-[11px] text-slate-400 italic">Cc: {procedure.cc}</div>
            </div>
        </div>

        <div className="p-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 mt-auto bg-white">
            <button onClick={handleSendEmail} className="w-full py-4 bg-gradient-to-br from-orange-600 to-orange-500 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg flex items-center justify-center gap-3 text-lg">
                <FaPaperPlane /> OUVRIR GMAIL
            </button>
            <button onClick={handleCopyTable} className="w-full py-4 bg-blue-50 text-blue-700 font-bold rounded-2xl hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg">
                <FaCopy /> COPIER TABLEAU
            </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;