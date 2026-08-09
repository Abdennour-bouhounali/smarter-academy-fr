import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowUp, ArrowDown, CornerDownLeft, X, Download, Calendar, BookOpen, Briefcase, HelpCircle, Mail, Phone, FileText } from 'lucide-react';

const commands = [
  { id: 'contact', label: 'Réserver un cours d\'essai', path: '/contact', icon: Calendar, group: 'Actions Principales' },
  { id: 'home', label: 'Accueil', path: '/', icon: BookOpen, group: 'Navigation' },
  { id: 'about', label: 'Présentation & Parcours', path: '/about', icon: BookOpen, group: 'Navigation' },
  { id: 'courses', label: 'Cours de Maths', path: '/courses', icon: Briefcase, group: 'Navigation' },
  { id: 'resources', label: 'Ressources Gratuites', path: '/resources', icon: FileText, group: 'Navigation' },
  { id: 'faq', label: 'Foire Aux Questions (FAQ)', path: '/faq', icon: HelpCircle, group: 'Navigation' },
  { id: 'download-cv', label: 'Télécharger le CV Enseignant (PDF)', href: '/CV.pdf', download: true, icon: Download, group: 'Actions Principales' },
  { id: 'email', label: 'Envoyer un Email', href: 'mailto:abdennour.bouhounali@gmail.com', external: true, icon: Mail, group: 'Contact Direct' },
  { id: 'phone', label: 'Appeler (+33 7 58 10 30 86)', href: 'tel:+33758103086', external: true, icon: Phone, group: 'Contact Direct' },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Filter commands by query
  const filtered = query.trim()
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Focus input when open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selected when filtered changes
  useEffect(() => {
    setSelected(0);
  }, [query]);

  const executeCommand = useCallback((cmd) => {
    setOpen(false);
    setQuery('');

    if (cmd.path) {
      navigate(cmd.path);
    } else if (cmd.download) {
      const a = document.createElement('a');
      a.href = cmd.href;
      a.download = 'CV_Abdennour_BOUHOUNALI_Prof_Maths.pdf';
      a.click();
    } else if (cmd.external) {
      window.open(cmd.href, cmd.href.startsWith('mailto:') || cmd.href.startsWith('tel:') ? '_self' : '_blank');
    }
  }, [navigate]);

  const handleKeyNavigation = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      if (filtered[selected]) {
        executeCommand(filtered[selected]);
      }
    }
  };

  // Group filtered commands
  const groups = filtered.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {});

  let globalIdx = 0;

  return (
    <>
      {/* Trigger hint (bottom-right fixed) */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-mono-jetbrains shadow-xl border border-slate-700 hover:border-slate-500 transition-all"
        id="command-palette-trigger"
      >
        <Search size={13} />
        <span>Ctrl+K</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                  <Search size={17} className="text-slate-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyNavigation}
                    placeholder="Rechercher une section ou une action..."
                    className="flex-1 bg-transparent font-inter text-sm text-slate-800 placeholder-slate-400 outline-none"
                    id="command-palette-input"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Commands list */}
                <div className="max-h-80 overflow-y-auto py-2">
                  {filtered.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 font-inter text-sm">
                      Aucun résultat trouvé
                    </div>
                  ) : (
                    Object.entries(groups).map(([group, cmds]) => (
                      <div key={group}>
                        <p className="px-4 py-1.5 font-inter text-xs font-semibold text-slate-400 uppercase tracking-widest">
                          {group}
                        </p>
                        {cmds.map((cmd) => {
                          const idx = globalIdx++;
                          return (
                            <button
                              key={cmd.id}
                              onClick={() => executeCommand(cmd)}
                              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-100 ${
                                selected === idx
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                selected === idx ? 'bg-blue-100' : 'bg-slate-100'
                              }`}>
                                <cmd.icon size={14} />
                              </div>
                              <span className="font-inter text-sm font-medium">{cmd.label}</span>
                              {selected === idx && (
                                <span className="ml-auto">
                                  <CornerDownLeft size={13} className="text-blue-400" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-2.5 border-t border-slate-100 flex items-center gap-4 text-slate-400 text-xs font-mono-jetbrains">
                  <span className="flex items-center gap-1.5">
                    <ArrowUp size={11} />
                    <ArrowDown size={11} />
                    Naviguer
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CornerDownLeft size={11} />
                    Sélectionner
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold">Esc</span>
                    Fermer
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
