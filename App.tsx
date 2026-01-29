import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProcedureCard from './components/ProcedureCard';
import ContactCard from './components/ContactCard';
import Modal from './components/Modal';
import Toast from './components/Toast';
import { procedures } from './data/procedures';
import { contacts } from './data/contacts';
import { pdfContext } from './data/pdfContext';
import { Procedure, ProcedureCategory } from './types';
import { FaMagnifyingGlass, FaAddressBook, FaBookOpen, FaRobot, FaPaperPlane } from 'react-icons/fa6';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProcedureCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Gemini State
  const [guideQuery, setGuideQuery] = useState('');
  const [guideResponse, setGuideResponse] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const filteredProcedures = useMemo(() => {
    if (activeCategory === 'contacts' || activeCategory === 'guide') return [];
    return procedures.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const filteredContacts = useMemo(() => {
    if (activeCategory !== 'contacts') return [];
    return contacts.filter(c => 
        c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeCategory, searchQuery]);

  const handleShowToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const handleAskGemini = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guideQuery.trim()) return;

    setIsThinking(true);
    setGuideResponse(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const systemInstruction = `Tu es un assistant virtuel expert pour les employés d'iServices. 
        Ta mission est de répondre aux questions en te basant UNIQUEMENT sur le contexte fourni ci-dessous issu du "Guide des Procédures".
        
        RÈGLES STRICTES :
        1. Si la réponse est dans le contexte, réponds de manière claire, précise et professionnelle.
        2. Si la réponse ne se trouve PAS dans le contexte, tu dois répondre exactement : "Aucune réponse ne peut être donnée sur la base du guide de procédure actuel."
        3. N'invente jamais d'information.
        4. Ne mentionne pas que tu es une IA, sois direct.
        
        CONTEXTE DU GUIDE :
        ${pdfContext}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Question de l'employé : ${guideQuery}`,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        setGuideResponse(response.text || "Erreur de génération.");

    } catch (error) {
        console.error("Gemini Error:", error);
        setGuideResponse("Une erreur est survenue lors de la consultation du guide. Veuillez vérifier votre clé API ou réessayer plus tard.");
    } finally {
        setIsThinking(false);
    }
  };

  const renderContent = () => {
    if (activeCategory === 'guide') {
        return (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
                 <div className="flex items-center gap-3 mb-6 opacity-80">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg"><FaBookOpen /></div>
                        <h2 className="text-xl font-bold text-slate-800">Guide de Procédure Intelligent</h2>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
                        <p className="flex gap-2 items-start">
                            <FaRobot className="text-lg text-orange-500 shrink-0 mt-0.5" />
                            <span>Posez votre question concernant les procédures internes. L'assistant vous répondra exclusivement sur la base du PDF officiel des procédures iServices.</span>
                        </p>
                    </div>

                    <form onSubmit={handleAskGemini} className="relative">
                        <textarea
                            value={guideQuery}
                            onChange={(e) => setGuideQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAskGemini();
                                }
                            }}
                            placeholder="Ex: Comment faire un remboursement ? Que faire en cas de vol ?"
                            className="w-full p-4 pr-14 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none resize-none h-32 text-slate-800"
                        />
                        <button 
                            type="submit"
                            disabled={isThinking || !guideQuery.trim()}
                            className="absolute bottom-4 right-4 w-10 h-10 bg-orange-600 text-white rounded-lg flex items-center justify-center hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                        >
                            {isThinking ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <FaPaperPlane />
                            )}
                        </button>
                    </form>

                    {guideResponse && (
                        <div className="animate-[fadeIn_0.5s_ease-out]">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Réponse du Guide</h3>
                            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-slate-800 leading-relaxed whitespace-pre-line">
                                {guideResponse}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (activeCategory === 'contacts') {
        return (
            <>
                <div className="flex items-center gap-3 mb-2 opacity-80">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><FaAddressBook /></div>
                        <h2 className="text-xl font-bold text-slate-800">Contacts pour la résolution de problèmes</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                    {filteredContacts.map(c => (
                        <ContactCard key={c.id} contact={c} />
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-400">
                            Aucun contact trouvé.
                        </div>
                    )}
                </div>
            </>
        );
    }

    // Default Procedures View
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
            {filteredProcedures.map(p => (
                <ProcedureCard 
                key={p.id} 
                procedure={p} 
                onClick={setSelectedProcedure} 
                />
            ))}
            {filteredProcedures.length === 0 && (
                <div className="col-span-full text-center py-10 text-slate-400">
                    Aucune procédure trouvée.
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

        <main className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="max-w-5xl mx-auto space-y-8 h-full flex flex-col">
            {/* Search (Only for non-guide categories) */}
            {activeCategory !== 'guide' && (
                <div className="relative group shrink-0">
                <FaMagnifyingGlass className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none text-lg font-medium"
                    placeholder={activeCategory === 'contacts' ? "Rechercher un contact..." : "Rechercher une procédure..."}
                />
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1">
                {renderContent()}
            </div>
            
          </div>
        </main>
      </div>

      {selectedProcedure && (
        <Modal 
          procedure={selectedProcedure} 
          onClose={() => setSelectedProcedure(null)} 
          onShowToast={handleShowToast}
        />
      )}

      <Toast 
        message={toastMessage} 
        isVisible={showToast} 
        onClose={() => setShowToast(false)} 
      />
    </div>
  );
};

export default App;