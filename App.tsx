import React, { useState, useMemo, useEffect } from 'react';
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
import { FaMagnifyingGlass, FaAddressBook, FaBookOpen, FaRobot, FaPaperPlane, FaSquare } from 'react-icons/fa6';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ProcedureCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  // Theme State (Default to Light)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply theme to HTML tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
        Ta mission est de répondre aux questions en te basant UNIQUEMENT sur le contexte fourni.
        
        TOLÉRANCE ORTHOGRAPHIQUE MAXIMALE :
        L'utilisateur peut faire des fautes d'orthographe, de frappe ou utiliser du langage SMS (ex: "ecran kasser", "stok", "coment fair").
        Tu dois AUTOMATIQUEMENT corriger l'intention de l'utilisateur sans jamais mentionner ses fautes. Comprends le sens phonétique.

        RÈGLES DE FORMATAGE (OBLIGATOIRES) :
        1. Utilise le format Markdown.
        2. Titres niveau 3 (###) pour les étapes.
        3. Listes à puces (-) pour les actions.
        4. GRAS (**) pour les éléments importants.

        CONTEXTE DU GUIDE :
        ${pdfContext}`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Question utilisateur (analyse phonétiquement si nécessaire) : ${guideQuery}`,
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

  // Helper to render formatted markdown-like text
  const renderFormattedResponse = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    let delayCounter = 0;

    return (
        <div className="space-y-3">
            {lines.map((line, index) => {
                if (!line.trim()) return <div key={index} className="h-2"></div>;

                // Animation delay calculation
                const style = { animationDelay: `${delayCounter * 0.05}s` };
                delayCounter++;

                // Headers (###)
                if (line.startsWith('###')) {
                    return (
                        <h3 key={index} className="text-orange-600 font-tech font-bold text-lg uppercase tracking-wide mt-4 mb-2 flex items-center gap-2 animate-[slideUp_0.4s_ease-out_forwards] opacity-0 translate-y-2" style={style}>
                            <FaSquare className="text-[8px]" />
                            {line.replace(/^###\s*/, '')}
                        </h3>
                    );
                }

                // List Items (- )
                if (line.trim().startsWith('-')) {
                     // Process bold text inside list items
                     const content = line.replace(/^\s*-\s*/, '').split(/(\*\*.*?\*\*)/g).map((part, i) => 
                        part.startsWith('**') && part.endsWith('**') 
                            ? <strong key={i} className="text-orange-600 dark:text-orange-500 font-bold">{part.slice(2, -2)}</strong> 
                            : part
                    );

                    return (
                        <div key={index} className="flex gap-3 items-start pl-2 animate-[slideUp_0.4s_ease-out_forwards] opacity-0 translate-y-2" style={style}>
                            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-600 rounded-full mt-2 shrink-0"></span>
                            <p className="dark:text-neutral-300 text-neutral-700 leading-relaxed text-sm md:text-base">{content}</p>
                        </div>
                    );
                }

                // Standard Paragraphs
                const content = line.split(/(\*\*.*?\*\*)/g).map((part, i) => 
                    part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={i} className="text-black dark:text-white font-bold">{part.slice(2, -2)}</strong> 
                        : part
                );

                return (
                    <p key={index} className="dark:text-neutral-400 text-neutral-600 leading-relaxed text-sm md:text-base animate-[slideUp_0.4s_ease-out_forwards] opacity-0 translate-y-2" style={style}>
                        {content}
                    </p>
                );
            })}
        </div>
    );
  };

  const renderContent = () => {
    if (activeCategory === 'guide') {
        return (
            <div className="max-w-4xl mx-auto h-full flex flex-col pb-10">
                 <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center bg-orange-600 text-black rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.4)] border border-orange-500 shrink-0"><FaBookOpen className="text-xl md:text-2xl"/></div>
                        <div>
                            <h2 className="text-2xl md:text-4xl font-tech font-bold dark:text-white text-black tracking-tighter uppercase transition-colors">Guide IA</h2>
                            <p className="text-neutral-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mt-1 md:mt-2 border-l-2 border-orange-600 pl-3">Base de Connaissances Neurale</p>
                        </div>
                </div>

                <div className="dark:bg-[#0f0f0f] bg-white rounded-[24px] md:rounded-[32px] border dark:border-[#262626] border-neutral-300 p-6 md:p-10 flex flex-col gap-6 relative overflow-hidden shadow-2xl transition-colors">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-600 to-transparent"></div>

                    <div className="flex gap-4 md:gap-6 items-start text-xs md:text-sm dark:text-neutral-400 text-neutral-600 font-mono dark:bg-black bg-neutral-100 p-4 md:p-6 rounded-2xl border dark:border-[#222] border-neutral-200 transition-colors">
                        <FaRobot className="text-lg md:text-2xl text-orange-600 shrink-0 mt-1" />
                        <span className="leading-relaxed">Entrez votre demande. Le système tolère les fautes d'orthographe et analyse le PDF officiel pour générer une réponse structurée.</span>
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
                            placeholder="Ex: Comment faire une reprise iPhone ? / Je ne comprends pas le stock Gestix..."
                            className="w-full p-6 md:p-8 pr-20 md:pr-24 dark:bg-black bg-neutral-50 border dark:border-[#333] border-neutral-300 rounded-3xl focus:border-orange-600 dark:focus:bg-[#141414] focus:bg-neutral-50 transition-all outline-none resize-none h-32 md:h-36 dark:text-white text-black font-mono dark:placeholder:text-[#333] placeholder:text-neutral-400 relative z-10 text-base md:text-lg"
                        />
                        <button 
                            type="submit"
                            disabled={isThinking || !guideQuery.trim()}
                            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-12 h-12 md:w-14 md:h-14 bg-orange-600 text-black rounded-xl flex items-center justify-center hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(234,88,12,0.4)] z-20"
                        >
                            {isThinking ? (
                                <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <FaPaperPlane className="text-lg md:text-xl" />
                            )}
                        </button>
                    </form>

                    {guideResponse && (
                        <div className="border-t dark:border-[#262626] border-neutral-200 pt-6 md:pt-8 transition-colors">
                            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-[0.2em] mb-6 font-tech text-center">Résultat de l'Analyse</h3>
                            <div className="dark:bg-[#111] bg-neutral-50 p-6 md:p-8 rounded-2xl border dark:border-[#222] border-neutral-200 shadow-inner transition-colors font-sans">
                                {renderFormattedResponse(guideResponse)}
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
                <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-10 pl-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center dark:bg-white bg-black dark:text-black text-white rounded-full transition-colors"><FaAddressBook className="text-base md:text-lg"/></div>
                        <h2 className="text-2xl md:text-3xl font-tech font-bold dark:text-white text-black tracking-tighter uppercase transition-colors">Répertoire</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-24 lg:pb-20">
                    {filteredContacts.map(c => (
                        <ContactCard key={c.id} contact={c} />
                    ))}
                    {filteredContacts.length === 0 && (
                        <div className="col-span-full text-center py-32 dark:text-neutral-700 text-neutral-400 font-tech text-xl uppercase tracking-widest">
                            // AUCUN_CONTACT_TROUVE //
                        </div>
                    )}
                </div>
            </>
        );
    }

    // Default Procedures View
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-24 lg:pb-20">
            {filteredProcedures.map(p => (
                <ProcedureCard 
                key={p.id} 
                procedure={p} 
                onClick={setSelectedProcedure} 
                />
            ))}
            {filteredProcedures.length === 0 && (
                <div className="col-span-full text-center py-32 dark:text-neutral-700 text-neutral-400 font-tech text-xl uppercase tracking-widest">
                    // AUCUNE_PROCEDURE_TROUVEE //
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden dark:bg-black bg-[#f5f5f5] dark:text-white text-black transition-colors duration-300">
      <Header isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 relative scrollbar-thin">
          {/* Background decoration */}
          <div className="fixed top-0 left-0 w-full h-full bg-dots pointer-events-none opacity-40 z-0"></div>

          <div className="max-w-7xl mx-auto space-y-6 md:space-y-10 h-full flex flex-col relative z-10">
            {/* Search (Only for non-guide categories) */}
            {activeCategory !== 'guide' && (
                <div className="relative group shrink-0">
                    <FaMagnifyingGlass className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-600 transition-colors z-20 text-base md:text-lg" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 md:pl-20 pr-6 md:pr-8 py-5 md:py-7 dark:bg-[#0f0f0f] bg-white border dark:border-[#262626] border-neutral-300 rounded-full focus:border-orange-600 dark:focus:bg-[#141414] focus:bg-neutral-50 transition-all outline-none text-base md:text-xl dark:text-white text-black font-tech tracking-wide dark:placeholder:text-[#333] placeholder:text-neutral-400 shadow-lg"
                        placeholder={activeCategory === 'contacts' ? "RECHERCHE_CONTACT..." : "RECHERCHE_PROTOCOLE..."}
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
      
      {/* Inject animation styles locally for the staggered effect */}
      <style>{`
        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;