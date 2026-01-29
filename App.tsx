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
            <div className="max-w-4xl mx-auto h-full flex flex-col">
                 <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 flex items-center justify-center bg-orange-600 text-black rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.4)] border border-orange-500"><FaBookOpen className="text-2xl"/></div>
                        <div>
                            <h2 className="text-4xl font-tech font-bold text-white tracking-tighter uppercase">AI Guide</h2>
                            <p className="text-neutral-500 font-mono text-xs uppercase tracking-widest mt-2 border-l-2 border-orange-600 pl-3">Neural Knowledge Base</p>
                        </div>
                </div>

                <div className="bg-[#0f0f0f] rounded-[32px] border border-[#262626] p-10 flex flex-col gap-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent"></div>

                    <div className="flex gap-6 items-start text-sm text-neutral-400 font-mono bg-black p-6 rounded-2xl border border-[#222]">
                        <FaRobot className="text-2xl text-orange-600 shrink-0 mt-1" />
                        <span className="leading-7">Enter your query. The system will analyze the official protocol PDF to generate a compliant response.</span>
                    </div>

                    <form onSubmit={handleAskGemini} className="relative group">
                        <div className="absolute inset-0 bg-orange-600/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700"></div>
                        <textarea
                            value={guideQuery}
                            onChange={(e) => setGuideQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAskGemini();
                                }
                            }}
                            placeholder="Input command..."
                            className="w-full p-8 pr-24 bg-black border border-[#333] rounded-3xl focus:border-orange-600 outline-none resize-none h-48 text-white font-mono placeholder:text-[#333] transition-all relative z-10 text-lg"
                        />
                        <button 
                            type="submit"
                            disabled={isThinking || !guideQuery.trim()}
                            className="absolute bottom-6 right-6 w-14 h-14 bg-orange-600 text-black rounded-xl flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] z-20"
                        >
                            {isThinking ? (
                                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <FaPaperPlane className="text-xl" />
                            )}
                        </button>
                    </form>

                    {guideResponse && (
                        <div className="animate-[fadeIn_0.5s_ease-out] border-t border-[#262626] pt-8">
                            <h3 className="text-xs font-bold text-orange-600 uppercase tracking-[0.2em] mb-6 font-tech">Analysis Result</h3>
                            <div className="bg-[#111] p-8 rounded-2xl border-l-4 border-orange-600 text-neutral-300 leading-8 whitespace-pre-line font-mono text-sm shadow-inner">
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
                <div className="flex items-center gap-5 mb-10 pl-2">
                        <div className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full"><FaAddressBook className="text-lg"/></div>
                        <h2 className="text-3xl font-tech font-bold text-white tracking-tighter uppercase">Directory</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredContacts.map(c => (
                        <ContactCard key={c.id} contact={c} />
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="col-span-full text-center py-32 text-neutral-700 font-tech text-xl uppercase tracking-widest">
                            // NO_CONTACTS_FOUND //
                        </div>
                    )}
                </div>
            </>
        );
    }

    // Default Procedures View
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {filteredProcedures.map(p => (
                <ProcedureCard 
                key={p.id} 
                procedure={p} 
                onClick={setSelectedProcedure} 
                />
            ))}
            {filteredProcedures.length === 0 && (
                <div className="col-span-full text-center py-32 text-neutral-700 font-tech text-xl uppercase tracking-widest">
                    // NO_PROCEDURES_FOUND //
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-black text-white">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative scrollbar-thin">
          {/* Background decoration */}
          <div className="fixed top-0 left-0 w-full h-full bg-dots pointer-events-none opacity-40 z-0"></div>

          <div className="max-w-7xl mx-auto space-y-10 h-full flex flex-col relative z-10">
            {/* Search (Only for non-guide categories) */}
            {activeCategory !== 'guide' && (
                <div className="relative group shrink-0">
                    <FaMagnifyingGlass className="absolute left-8 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-600 transition-colors z-20 text-lg" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-20 pr-8 py-7 bg-[#0f0f0f] border border-[#262626] rounded-full focus:border-orange-600 focus:bg-[#141414] transition-all outline-none text-xl text-white font-tech tracking-wide placeholder:text-[#333] shadow-lg"
                        placeholder={activeCategory === 'contacts' ? "SEARCH_CONTACT_DB..." : "SEARCH_PROTOCOL..."}
                    />
                    {/* Search glow */}
                    <div className="absolute inset-0 rounded-full bg-orange-600/5 blur-2xl opacity-0 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-500"></div>
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