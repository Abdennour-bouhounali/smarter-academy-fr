import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, ArrowLeft, Compass, FileText, Expand, ChevronUp, ChevronDown, Columns2 } from 'lucide-react';
import { useLessonViewport } from './useLessonViewport';
import { useWorkspaceLayout } from '../../../context/WorkspaceLayoutContext';
import { buildStructure, progressionByModule, HIGHLIGHT_CAT } from './knowledgeStructure';
import ConceptVisual from './ConceptVisual';

/* ─────────────────────────────────────────────────────────────────────────
   PRINT STYLES
   Injected once into <head>. Panel is portalled to body, so:
   body > *:not(#km-root) { display:none } isolates the panel perfectly.
   ───────────────────────────────────────────────────────────────────────── */
const PRINT_CSS = `
@media print {
  @page { 
    size: A4 portrait; 
    margin: 12mm 14mm; 
  }

  /* Force color printing if possible */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Base typography */
  html, body {
    font-family: "Avenir Next", "Inter", "Segoe UI", system-ui, sans-serif !important;
    background: #fff !important;
    color: #172033 !important;
  }

  /* Hide everything except the knowledge-map panel */
  body > *:not(#km-root) { display: none !important; }

  /* Reset the panel to a static document */
  #km-root {
    display: block !important;
    position: static !important;
    inset: unset !important;
    width: 100% !important;
    max-width: 100% !important;
    max-height: none !important;
    height: auto !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    overflow: visible !important;
    transform: none !important;
    opacity: 1 !important;
    background: #fff !important;
  }

  /* Hide all interactive chrome */
  [data-km-noprint] { display: none !important; }

  /* Show PrintView, hide screen views */
  .sa-screen-view { display: none !important; }
  .sa-print-view { display: block !important; }

  /* Logical print breaks */
  .print-section, .print-card, .print-example, .print-equation-group {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  
  h1, h2, h3, .print-avoid-break-after {
    break-after: avoid;
    page-break-after: avoid;
  }

  /* Remove scrollbars and padding overrides */
  .sa-print-view {
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
    padding: 0 !important;
  }

  /* Clean up pre-styled interactive components inside print view */
  .sa-print-body div[class*="bg-"],
  .sa-print-hero-body div[class*="bg-"] {
    background-color: transparent !important;
    border: none !important;
    padding: 0 0 4px 0 !important;
    text-align: left !important;
    box-shadow: none !important;
  }
  .sa-print-hero-body div[class*="text-center"] {
    text-align: left !important;
  }
  .sa-print-body p, .sa-print-body div, .sa-print-body span {
    font-size: 9pt !important;
  }
  .sa-print-hero-body p, .sa-print-hero-body div, .sa-print-hero-body span {
    font-size: 10pt !important;
  }
  .sa-print-view .text-xs { font-size: 8pt !important; }
  .sa-print-view .text-sm { font-size: 9pt !important; }
  .sa-print-view .text-lg { font-size: 11pt !important; }
  .sa-print-view .text-xl { font-size: 12pt !important; }
}
`;

/* ─────────────────────────────────────────────────────────────────────────
   CATEGORIES & THEME
   ───────────────────────────────────────────────────────────────────────── */

export const CATEGORIES = [
  { id: 'concepts',    emoji: '🔵', label: 'CONCEPTS',    color: 'blue' },
  { id: 'regles',      emoji: '🟠', label: 'RÈGLES',      color: 'orange' },
  { id: 'methodes',    emoji: '🟢', label: 'MÉTHODES',    color: 'green' },
  { id: 'vocabulaire', emoji: '🟣', label: 'VOCABULAIRE', color: 'purple' },
  { id: 'memoriser',   emoji: '🔴', label: 'À MÉMORISER', color: 'red' },
  { id: 'formules',    emoji: '🧮', label: 'FORMULES',    color: 'indigo' },
];

export const CAT_THEME = {
  blue:   { hdr: 'bg-blue-50 text-blue-700 border-blue-200',     card: 'border-blue-100 bg-blue-50/40',     badge: 'bg-blue-100 text-blue-700' },
  orange: { hdr: 'bg-orange-50 text-orange-700 border-orange-200', card: 'border-orange-100 bg-orange-50/40', badge: 'bg-orange-100 text-orange-700' },
  green:  { hdr: 'bg-emerald-50 text-emerald-700 border-emerald-200', card: 'border-emerald-100 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700' },
  purple: { hdr: 'bg-violet-50 text-violet-700 border-violet-200', card: 'border-violet-100 bg-violet-50/40', badge: 'bg-violet-100 text-violet-700' },
  red:    { hdr: 'bg-rose-50 text-rose-700 border-rose-200',     card: 'border-rose-100 bg-rose-50/40',     badge: 'bg-rose-100 text-rose-700' },
  indigo: { hdr: 'bg-indigo-50 text-indigo-700 border-indigo-200', card: 'border-indigo-100 bg-indigo-50/40', badge: 'bg-indigo-100 text-indigo-700' },
};

/* ─────────────────────────────────────────────────────────────────────────
   KNOWLEDGE DATA
   ─────────────────────────────────────────────────────────────────────────
   Les items ne vivent plus ici : ../knowledge.jsx déclare l'apport de CHAQUE
   module, knowledgeState.js les cumule selon la progression, et le tiroir
   reçoit le résultat par la prop `items` (cf. KnowledgeProvider.jsx).
   Forme attendue : { id, type, title, summary, visual?, body, module?, isNew? }.
   ───────────────────────────────────────────────────────────────────────── */

/* ─────────────────────────────────────────────────────────────────────────
   NAVIGATION VIEW
   Always-visible category grid → click item → detail slide-in
   ───────────────────────────────────────────────────────────────────────── */

const STRATUM_ACCENT = {
  blue:   { rule: 'bg-blue-400',    label: 'text-blue-700' },
  orange: { rule: 'bg-orange-400',  label: 'text-orange-700' },
  green:  { rule: 'bg-emerald-400', label: 'text-emerald-700' },
};

/** Une connaissance = une LIGNE compacte, pas une carte. */
function KnowledgeRow({ item, onSelect, dotClass }) {
  return (
    <button
      onClick={() => onSelect(item)}
      data-km-item={item.id}
      data-km-new={item.isNew ? 'true' : undefined}
      className="group w-full text-left flex items-baseline gap-2.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors"
    >
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="text-sm text-slate-800 font-medium group-hover:text-slate-950">{item.title}</span>
        {item.summary && (
          <span className="block text-xs text-slate-500 leading-snug truncate">{item.summary}</span>
        )}
      </span>
      {item.isNew && (
        <>
          <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" aria-hidden="true" />
          <span className="sr-only">(nouveau)</span>
        </>
      )}
    </button>
  );
}

/** Bandeau « À retenir » — mise en avant transversale, en tête de la carte. */
function HighlightBand({ items, onSelect }) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-2.5" data-km-highlight="true">
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[10px] font-bold tracking-[0.14em] text-rose-700">À RETENIR</span>
        <span className="text-[10px] text-rose-400 font-mono">{items.length}</span>
      </div>
      <div className="flex flex-col divide-y divide-rose-100/70">
        {items.map((item) => (
          <KnowledgeRow key={item.id} item={item} onSelect={onSelect} dotClass="bg-rose-400" />
        ))}
      </div>
    </section>
  );
}

/**
 * Vue NAVIGATION — hiérarchie : strate → catégorie → connaissance.
 * Peu de conteneurs, beaucoup de typographie : un cahier structuré, pas un
 * tableau de bord.
 */
function StructuredView({ items, onSelect, columns = 1 }) {
  const { highlight, strata } = buildStructure(items);
  const steps = progressionByModule(items);

  return (
    <div className="space-y-5" data-km-structured="true">
      <HighlightBand items={highlight} onSelect={onSelect} />

      <div
        className={columns > 1 ? 'gap-x-8' : ''}
        style={columns > 1 ? { columnCount: columns, columnGap: '2rem' } : undefined}
      >
        {strata.map((stratum) => {
          const accent = STRATUM_ACCENT[stratum.accent] ?? STRATUM_ACCENT.blue;
          return (
            <section
              key={stratum.id}
              className="mb-5 break-inside-avoid"
              data-km-stratum={stratum.id}
              style={{ breakInside: 'avoid' }}
            >
              {/* Titre de strate : filet + libellé, aucun encadré */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className={`h-3 w-1 rounded-full ${accent.rule}`} aria-hidden="true" />
                <h3 className={`text-[11px] font-bold tracking-[0.14em] ${accent.label}`}>{stratum.label}</h3>
                <span className="text-[10px] text-slate-400">{stratum.caption}</span>
                <span className="ml-auto text-[10px] font-mono text-slate-300">{stratum.count}</span>
              </div>

              <div className="pl-3 border-l border-slate-100 space-y-3">
                {stratum.groups.map((g) => (
                  <div key={g.category.id} data-km-group={g.category.id}>
                    {/* Sous-titre de catégorie — seulement si la strate en compte plusieurs */}
                    {stratum.groups.length > 1 && (
                      <div className="text-[10px] font-semibold tracking-widest text-slate-400 mb-0.5">
                        {g.category.label}
                      </div>
                    )}
                    <div className="flex flex-col">
                      {g.items.map((item) => (
                        <KnowledgeRow
                          key={item.id}
                          item={item}
                          onSelect={onSelect}
                          dotClass={accent.rule}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Fil cumulatif — la carte s'enrichit module après module */}
      {steps.length > 0 && (
        <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap" data-km-progression="true">
          <span className="text-[10px] text-slate-400 mr-1">Ta carte&nbsp;:</span>
          {steps.map((s, i) => (
            <React.Fragment key={s.module}>
              {i > 0 && <span className="text-slate-200 text-[10px]" aria-hidden="true">→</span>}
              <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                M{s.module}<span className="text-slate-300"> +{s.count}</span>
              </span>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function ItemDetailView({ item, onBack, catColor }) {
  const theme = CAT_THEME[catColor];
  return (
    <motion.div
      key="detail"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour à la carte
      </button>

      {/* Title badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${theme.badge}`}>
        <span>{item.title}</span>
      </div>

      {/* Summary */}
      {item.summary && (
        <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
      )}

      {/* Visual */}
      {item.visual && (
        <div className="bg-white rounded-xl border border-slate-100 px-3 py-3">
          <ConceptVisual size={item.visualSize} context="drawer">
            {item.visual}
          </ConceptVisual>
        </div>
      )}

      {/* Body */}
      {item.body}

      {/* Manipulation reference — future-ready */}
      {item.manipulationRef && (
        <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-3">
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">
            🔗 Tu l'as découvert avec
          </div>
          <div className="text-sm font-semibold text-indigo-900">{item.manipulationRef.title}</div>
          {item.manipulationRef.href && (
            <a
              href={item.manipulationRef.href}
              className="mt-2 inline-block text-xs text-indigo-600 underline hover:text-indigo-800"
            >
              Revoir la manipulation →
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

function CategoryDetailView({ category, items, onBack }) {
  const theme = CAT_THEME[category.color];
  return (
    <motion.div
      key="cat-detail"
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 24, opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="space-y-4 pb-4"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Retour à la carte
      </button>

      {/* Category header */}
      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold ${theme.hdr} border`}>
        <span aria-hidden="true">{category.emoji}</span>
        <span className="font-mono tracking-wider">{category.label}</span>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${theme.badge}`}>{items.length}</span>
      </div>

      {/* CompleteCards for this category */}
      <div className="space-y-4">
        {items.map(item => (
          <CompleteCard key={item.id} item={item} catColor={category.color} />
        ))}
      </div>
    </motion.div>
  );
}

function NavigationView({ items, selectedItem, onSelectItem, columns = 1 }) {
  return (
    <div data-km-navview="true">
      <AnimatePresence mode="wait" initial={false}>
        {selectedItem ? (
          selectedItem.isCategory ? (
            <CategoryDetailView
              key="cat-detail"
              category={selectedItem.category}
              items={selectedItem.items}
              onBack={() => onSelectItem(null)}
            />
          ) : (
            <ItemDetailView
              key="detail"
              item={selectedItem}
              catColor={CATEGORIES.find(c => c.id === selectedItem.type)?.color ?? 'blue'}
              onBack={() => onSelectItem(null)}
            />
          )
        ) : (
          <motion.div
            key="structure"
            initial={{ x: -16, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -16, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <StructuredView items={items} onSelect={onSelectItem} columns={columns} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PRINT VIEW
   Dedicated A4 revision document.
   ───────────────────────────────────────────────────────────────────────── */

const PRINT_PALETTE = {
  blue:   { border: 'border-[#1687D9]', text: 'text-[#1687D9]', line: 'border-[#D9DEE8]' },
  orange: { border: 'border-[#E94F9B]', text: 'text-[#E94F9B]', line: 'border-[#D9DEE8]' },
  green:  { border: 'border-[#168F7A]', text: 'text-[#168F7A]', line: 'border-[#D9DEE8]' },
  purple: { border: 'border-[#6D3FE7]', text: 'text-[#6D3FE7]', line: 'border-[#D9DEE8]' },
  red:    { border: 'border-[#E94F9B]', text: 'text-[#172554]', line: 'border-[#D9DEE8]' },
  indigo: { border: 'border-[#6D3FE7]', text: 'text-[#6D3FE7]', line: 'border-[#D9DEE8]' },
};

function PrintCard({ item, catColor }) {
  const theme = PRINT_PALETTE[catColor] || PRINT_PALETTE.blue;
  return (
    <div className={`print-card mb-3 pb-3 border-b ${theme.line} last:border-b-0 last:pb-0`}>
      <div className={`font-bold text-[9.5pt] mb-1.5 flex items-baseline gap-1.5 ${theme.text}`}>
        <span className="text-[7pt]">●</span> {item.title}
      </div>
      {item.visual && (
        <ConceptVisual size={item.visualSize} context="print">
          {item.visual}
        </ConceptVisual>
      )}
      <div className="text-[9pt] text-[#172033] leading-snug space-y-2 sa-print-body">
        {item.body}
      </div>
    </div>
  );
}

function PrintHero({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="print-section mb-6 break-inside-avoid">
      <div className="border border-[#E94F9B] bg-[#E94F9B]/[0.04] rounded-lg p-5">
        <div className="inline-block px-3 py-1 bg-[#E94F9B] text-white text-[8pt] font-bold tracking-widest rounded-sm uppercase mb-4">
          ⭐ À Retenir
        </div>
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="print-card">
              {item.visual && (
                <ConceptVisual size={item.visualSize} context="print">
                  {item.visual}
                </ConceptVisual>
              )}
              <div className="text-[#172554] text-[10pt] font-medium sa-print-hero-body space-y-3">
                {item.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const PRINT_STRATUM = {
  blue:   'border-[#1687D9] text-[#1687D9]',
  orange: 'border-[#E94F9B] text-[#E94F9B]',
  green:  'border-[#168F7A] text-[#168F7A]',
};

function PrintView({ items, printTitle = 'MA CARTE', printSubject = 'Mathématiques' }) {
  // Même hiérarchie qu'à l'écran (strate → catégorie → connaissance) : la
  // feuille imprimée est la MÊME structure mathématique, pas une capture du tiroir.
  const { highlight, strata } = buildStructure(items);

  return (
    <div className="font-sans text-[#172033] mx-auto w-full max-w-[210mm]">

      {/* Header */}
      <div className="flex justify-between items-end border-b border-[#DCE3EF] pb-2 mb-6">
        <div>
          <div className="text-[20pt] font-black text-[#172554] tracking-tight leading-none mb-1">
            {printTitle}
          </div>
          <div className="text-[10pt] font-bold text-[#6D3FE7] uppercase tracking-widest">
            Ma carte de connaissances
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9pt] font-bold text-[#172033]">SMARTER ACADEMY</div>
          <div className="text-[8pt] text-[#667085]">{printSubject}</div>
        </div>
      </div>

      {/* Hero: À Retenir */}
      <PrintHero items={highlight} />

      {/* Strates en deux colonnes A4 */}
      <div className="columns-1 md:columns-2 gap-6">
        {strata.map(stratum => (
          <div key={stratum.id} className="print-section mb-6 break-inside-avoid">
            <div className={`text-[11pt] font-bold uppercase tracking-widest mb-1 pb-1 border-b-2 ${PRINT_STRATUM[stratum.accent] ?? PRINT_STRATUM.blue}`}>
              {stratum.label}
              <span className="ml-2 text-[7.5pt] font-normal normal-case tracking-normal text-[#667085]">
                {stratum.caption}
              </span>
            </div>
            {stratum.groups.map(g => (
              <div key={g.category.id} className="mb-3">
                {stratum.groups.length > 1 && (
                  <div className="text-[8pt] font-bold uppercase tracking-widest text-[#667085] mt-2 mb-1">
                    {g.category.label}
                  </div>
                )}
                <div className="space-y-1">
                  {g.items.map(item => (
                    <PrintCard key={item.id} item={item} catColor={g.category.color} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 pt-3 border-t border-[#DCE3EF] flex justify-between text-[7pt] text-[#667085] uppercase tracking-widest print-avoid-break-after">
        <span>Smarter Academy</span>
        <span>01</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPLETE VIEW
   Flat, always-visible revision document. Optimised for A4 print.
   ───────────────────────────────────────────────────────────────────────── */

function CompleteCard({ item, catColor }) {
  const theme = CAT_THEME[catColor];
  // Volontairement SANS encadré coloré ni ombre : la hiérarchie vient du filet
  // de gauche et de la typographie. Les cartes ne doivent pas dominer la carte.
  return (
    <div className="km-card break-inside-avoid" data-km-item={item.id} data-km-new={item.isNew ? 'true' : undefined} style={{ breakInside: 'avoid' }}>
      <div className="km-card-title font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
        <span>{item.title}</span>
        {item.isNew && <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${theme.badge}`} data-km-noprint="true">nouveau</span>}
      </div>
      {item.summary && <p className="text-xs text-slate-500 mb-2 leading-snug">{item.summary}</p>}
      {item.visual && (
        <ConceptVisual size={item.visualSize} context="drawer">
          {item.visual}
        </ConceptVisual>
      )}
      {item.body}
    </div>
  );
}

export function CompleteView({ items, printable = true, columns = 1 }) {
  const { highlight, strata } = buildStructure(items);

  return (
    <div data-km-completeview="true" className="space-y-6">

      {/* Print button — hidden in print (and when embedded in a page: print from the drawer) */}
      {printable && <div className="flex justify-end" data-km-noprint="true">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors shadow"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimer ma carte
        </button>
      </div>}

      {/* Strates → catégories → connaissances ; « À retenir » ouvre la colonne */}
      <div style={columns > 1 ? { columnCount: columns, columnGap: '2rem' } : undefined}>
      {highlight.length > 0 && (
        <section className="km-cat-section space-y-2 mb-6 break-inside-avoid" data-km-highlight="true" style={{ breakInside: 'avoid' }}>
          <div className="flex items-baseline gap-2">
            <span className="h-3 w-1 rounded-full bg-rose-400" aria-hidden="true" />
            <h3 className="text-[11px] font-bold tracking-[0.14em] text-rose-700">À RETENIR</h3>
            <span className="ml-auto text-[10px] font-mono text-slate-300">{highlight.length}</span>
          </div>
          <div className="pl-3 border-l border-rose-100 space-y-2">
            {highlight.map(item => (
              <CompleteCard key={item.id} item={item} catColor="red" />
            ))}
          </div>
        </section>
      )}

        {strata.map(stratum => {
          const accent = STRATUM_ACCENT[stratum.accent] ?? STRATUM_ACCENT.blue;
          return (
            <section
              key={stratum.id}
              className="km-cat-section mb-6 break-inside-avoid"
              data-km-stratum={stratum.id}
              style={{ breakInside: 'avoid' }}
            >
              <div className="km-cat-title flex items-baseline gap-2 mb-2">
                <span className={`h-3 w-1 rounded-full ${accent.rule}`} aria-hidden="true" />
                <h3 className={`text-[11px] font-bold tracking-[0.14em] ${accent.label}`}>{stratum.label}</h3>
                <span className="text-[10px] text-slate-400">{stratum.caption}</span>
                <span className="ml-auto text-[10px] font-mono text-slate-300">{stratum.count}</span>
              </div>

              <div className="pl-3 border-l border-slate-100 space-y-3">
                {stratum.groups.map(g => (
                  <div key={g.category.id} data-km-group={g.category.id} className="space-y-2">
                    {stratum.groups.length > 1 && (
                      <div className="text-[10px] font-semibold tracking-widest text-slate-400">
                        {g.category.label}
                      </div>
                    )}
                    {g.items.map(item => (
                      <CompleteCard key={item.id} item={item} catColor={g.category.color} />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {printable && <div className="pt-2 text-center text-[10px] text-slate-300 font-mono" data-km-noprint="true">
        Smarter Academy · Prototype
      </div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   MAIN PANEL
   Receives mode + onModeChange from KnowledgeMapTrigger.
   ───────────────────────────────────────────────────────────────────────── */

export default function KnowledgeMap({ items = [], isOpen, onClose, mode, onModeChange, printTitle, printSubject, expanded = false, onExpandedChange }) {
  // Mode colonne : la coquille a DÉJÀ rétréci le contenu et réservé une
  // gouttière à droite. La carte n'a donc rien à pousser — elle se pose dans
  // la place qu'on lui a faite (cf. WorkspaceLayoutContext).
  const { isPrior, priorAvailable, setPrior, maCarteWidth,
          setPriorWidth, priorWidthBounds, setMapExpanded } = useWorkspaceLayout();

  // La coquille doit savoir que le plein écran est actif pour LIBÉRER la
  // gouttière de la colonne : sans cela le rectangle de la leçon reste amputé
  // et la carte s'arrête avant le bord droit de l'écran.
  useEffect(() => {
    setMapExpanded(isOpen && expanded);
    return () => setMapExpanded(false);
  }, [isOpen, expanded, setMapExpanded]);
  const [minimized, setMinimized] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Resize State
  const [width, setWidth] = useState(() => {
    try {
      const stored = localStorage.getItem('knowledgeMapWidth');
      if (stored) return parseInt(stored, 10);
    } catch { /* noop */ }
    return 400; // default width
  });
  const [isDragging, setIsDragging] = useState(false);

  // Vrai le temps de la première image après l'ouverture (cf. `style` plus bas).
  const [justOpened, setJustOpened] = useState(true);

  // Géométrie du viewport de la leçon (header + sidebar + barre basse mesurés).
  // En mode plein, la carte occupe EXACTEMENT ce rectangle.
  const viewport = useLessonViewport(isOpen);
  const { top: vpTop, left: vpLeft, right: vpRight, width: vpWidth, height: vpHeight,
          viewportWidth: vpOuter, ready: vpReady } = viewport;

  // En mode plein sur large écran, la carte se lit en colonnes — sinon la
  // hiérarchie s'étire en une bande étroite au milieu du vide.
  // En mode colonne la largeur est celle que la coquille a réservée : les deux
  // valeurs doivent être la MÊME, sinon la carte flotte dans sa gouttière ou
  // la déborde.
  const panelWidth = expanded ? vpWidth : isPrior ? maCarteWidth : width;
  const contentColumns = expanded && panelWidth >= 1100 ? 3 : expanded && panelWidth >= 720 ? 2 : 1;

  // Les deux géométries, en valeurs NUMÉRIQUES pour que framer-motion puisse
  // interpoler entre elles (d'où `left` plutôt que `right` : une seule origine).
  const drawerW = Math.min(width, vpWidth || width);
  const drawerGeom = {
    top: vpTop,
    left: Math.max(vpLeft, (vpOuter || 0) - vpRight - drawerW),
    width: drawerW,
    height: minimized ? 56 : vpHeight,
  };
  // COLONNE — le <main> réserve `maCarteWidth` à sa droite ; `vpRight` vaut
  // donc cette largeur, et la colonne est exactement l'espace entre le bord
  // droit du contenu et celui de la fenêtre. Aucune constante en double : la
  // même valeur sert à réserver et à occuper.
  const priorGeom = {
    top: vpTop,
    left: Math.max(0, (vpOuter || 0) - maCarteWidth),
    width: maCarteWidth,
    height: vpHeight,
  };
  // PLEIN ÉCRAN — la géométrie ne peut PAS être lue sur <main> pendant la
  // bascule depuis la colonne : la coquille ne libère sa gouttière qu'au
  // rendu SUIVANT, si bien que `vpWidth` vaut encore la largeur amputée et que
  // le panneau partait vers la gauche avant de se corriger vers la droite (le
  // « à-coup » visible). On la calcule donc directement : du bord droit de la
  // barre latérale au bord de la fenêtre — deux valeurs qui, elles, sont
  // justes dès la première image.
  const expandedGeom = {
    top: vpTop,
    left: vpLeft,
    width: Math.max(0, (vpOuter || 0) - vpLeft),
    height: vpHeight,
  };

  const geom = expanded ? expandedGeom : isPrior ? priorGeom : drawerGeom;

  // Items déjà réduits par la progression (KnowledgeProvider) ; le drapeau
  // `discovered` reste honoré pour un masquage ponctuel.
  const visibleItems = items.filter(item => item.discovered !== false);

  // Reset minimized state when opened
  useEffect(() => {
    if (isOpen) {
      setMinimized(false);
    }
  }, [isOpen]);

  // La carte vient de s'ouvrir : on pose sa géométrie sans transition, puis on
  // rend la main aux transitions dès l'image suivante.
  useEffect(() => {
    if (!isOpen) { setJustOpened(true); return undefined; }
    const id = requestAnimationFrame(() => setJustOpened(false));
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // « Réduit » n'a de sens que pour le tiroir flottant : en mode plein comme
  // en mode colonne, la carte occupe une place RÉSERVÉE — la replier y
  // laisserait un trou dans la mise en page au lieu de rendre de l'espace.
  useEffect(() => {
    if (expanded || isPrior) setMinimized(false);
  }, [expanded, isPrior]);

  // Filet de sécurité : si la carte se démonte au milieu d'un geste (une
  // navigation pendant le glissement), le drapeau resterait sur <html> et la
  // gouttière ne s'animerait plus jamais.
  useEffect(() => () => document.documentElement.removeAttribute('data-sa-resizing'), []);

  // Persist Width
  useEffect(() => {
    try {
      localStorage.setItem('knowledgeMapWidth', width.toString());
    } catch { /* noop */ }
  }, [width]);

  // Keyboard shortcut
  useEffect(() => {
    if (!isOpen) { setSelectedItem(null); return; }
    const handler = (e) => {
      if (e.key !== 'Escape') return;
      // On revient d'un cran à la fois : détail → plein écran → fermeture.
      if (selectedItem) setSelectedItem(null);
      else if (expanded) onExpandedChange?.(false);
      else onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, selectedItem, expanded, onExpandedChange]);

  const handleModeChange = useCallback((m) => {
    setSelectedItem(null);
    onModeChange(m);
  }, [onModeChange]);

  // Dragging logic
  const handlePointerDown = useCallback((e) => {
    e.target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    // La coquille coupe l'animation de sa gouttière le temps du geste, sinon
    // le contenu traîne de 300ms derrière la poignée (cf. index.css).
    document.documentElement.setAttribute('data-sa-resizing', '');
  }, []);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();

    // MODE COLONNE — la carte est collée au bord de la FENÊTRE (c'est la
    // coquille qui lui réserve la place), et la largeur qu'on ajuste est celle
    // de la gouttière. Les bornes viennent du contexte : elles garantissent
    // qu'il reste toujours MIN_CONTENT_WIDTH à la leçon, donc que le contenu
    // ne peut jamais finir caché derrière la carte.
    if (isPrior) {
      const next = window.innerWidth - e.clientX;
      setPriorWidth(Math.min(Math.max(next, priorWidthBounds.min), priorWidthBounds.max));
      return;
    }

    // Le bord droit du tiroir est celui du viewport de la leçon : la largeur
    // est la distance du pointeur à CE bord, pas au bord de la fenêtre.
    const rightEdge = window.innerWidth - vpRight;
    let newWidth = rightEdge - e.clientX;

    // Sur écran étroit, on ne préserve pas une largeur de bureau qui rendrait
    // la leçon inutilisable : la borne haute suit la place réellement offerte.
    const available = vpWidth || window.innerWidth;
    const minWidth = Math.min(320, available);
    // Sur mobile la place disponible est déjà < 800 : on autorise toute la
    // largeur (le tiroir s'ouvre ainsi de toute façon), sinon on garde une
    // bande de leçon visible à gauche.
    const maxWidth = available <= 640 ? available : Math.min(available * 0.95, 800);

    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;

    setWidth(newWidth);
  }, [isDragging, vpRight, vpWidth, isPrior, setPriorWidth, priorWidthBounds.min, priorWidthBounds.max]);

  const handlePointerUp = useCallback((e) => {
    setIsDragging(false);
    document.documentElement.removeAttribute('data-sa-resizing');
    e.target.releasePointerCapture(e.pointerId);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && vpReady && (
        <>
          {/* Mobile backdrop (optional based on user preference, but let's keep it subtle for very small screens if needed, actually the user wanted it to be a companion that doesn't block the lesson entirely. So we might remove the backdrop completely to let them interact with the lesson). */}
          
          <motion.div
            id="km-root"
            key="panel"
            // Ouverture / fermeture / bascule — TOUT est animé par framer-motion
            // sur `top/left/width/height`, jamais par des styles inline qui
            // changeraient d'un coup (le mode plein sautait de 400px à 1280px).
            //
            //   ouverture tiroir : glissé depuis le bord droit
            //   ouverture plein  : fondu + très léger zoom (il ne vient d'aucun bord)
            //   tiroir ⇄ plein   : les quatre bords se déplacent de façon continue
            // OUVERTURE / FERMETURE — la carte ENTRE PAR LA DROITE : elle
            // glisse de droite à gauche jusqu'à sa colonne, et ressort par la
            // droite en partant. Pendant ce temps la coquille rétrécit le
            // contenu (gouttière de `--sa-gutter-w`, même durée) : les deux
            // mouvements se répondent, la leçon fait de la place pendant que
            // la carte arrive.
            //
            // Seul `x` est animé — un DÉCALAGE relatif à la géométrie posée,
            // jamais la géométrie elle-même. C'est ce qui distingue cette
            // entrée du bug corrigé juste avant : en animant `left`,
            // framer-motion partait de son propre état zéro (left:0) et la
            // carte traversait tout l'écran depuis le bord GAUCHE. Ici elle
            // part de `x: 100%`, c'est-à-dire d'exactement une largeur de
            // panneau à DROITE de sa place — hors écran, quel que soit le mode.
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              maxWidth: '100vw',
              ...geom,
              // Pendant le glissement de la poignée, la carte doit suivre le
              // pointeur à l'image près : aucune transition.
              // `justOpened` : à la toute première image il n'existe aucun état
              // précédent d'où venir. Toute transition n'y ferait donc que
              // RATTRAPER une valeur initiale approximative (la largeur de
              // tiroir par défaut avant la première mesure) — ce rattrapage se
              // voit comme un glissement. On ne transitionne qu'ensuite, pour
              // les vrais changements de mode.
              transition: isDragging || justOpened
                ? 'none'
                : 'top 300ms cubic-bezier(0.22,1,0.36,1), left 300ms cubic-bezier(0.22,1,0.36,1), width 300ms cubic-bezier(0.22,1,0.36,1), height 300ms cubic-bezier(0.22,1,0.36,1)',
            }}
            className={[
              'z-40 flex flex-col bg-white border-slate-200 overflow-hidden',
              expanded
                ? 'border-l border-r border-b shadow-xl shadow-slate-900/10'
                // COLONNE — une simple bordure, un fond très légèrement plus
                // froid : une séparation, pas un objet posé sur la leçon. Ni
                // ombre portée ni coin arrondi, qui la feraient à nouveau
                // flotter au-dessus du contenu.
                : isPrior
                  ? 'border-l bg-slate-50/60'
                  : 'border-l border-b shadow-2xl shadow-slate-900/15 rounded-bl-2xl',
            ].join(' ')}
            role="dialog"
            aria-label="Ma carte des connaissances"
            aria-modal="false" // It's a companion, not a blocking modal
          >
            {/* ── Resize Handle (Left Edge) ── */}
            {!expanded && <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute left-0 top-0 bottom-0 w-6 -translate-x-1/2 cursor-col-resize z-50 flex items-center justify-center group touch-none"
              aria-hidden="true"
              data-km-noprint="true"
            >
              {/* Subtle visible grip */}
              <div className="w-1 h-12 bg-slate-200 rounded-full group-hover:bg-blue-400 transition-colors" />
            </div>}

            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0 bg-white rounded-tl-2xl"
              data-km-noprint="true"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0" aria-hidden="true">🧠</span>
                <div className="min-w-0">
                  <div className="font-bold text-slate-900 text-sm leading-tight truncate">
                    MA CARTE
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    {visibleItems.length} {visibleItems.length > 1 ? 'découvertes' : 'découverte'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* ── Sélecteur de PRÉSENTATION ──────────────────────────────
                    Deux états explicites et étiquetés :

                      Colonne     → la leçon FAIT DE LA PLACE à la carte
                      Plein écran → la carte occupe tout l'espace de la leçon

                    Le tiroir flottant n'est plus proposé : il posait la carte
                    PAR-DESSUS la leçon, ce que la colonne fait mieux et sans
                    rien recouvrir. Il reste la présentation de repli là où la
                    colonne n'a pas de sens (< 1024px), mais ce n'est alors plus
                    un choix : c'est la seule mise en page tenable, et un bouton
                    l'affichant serait un bouton sans alternative.

                    L'état courant est mis en évidence ; c'est un vrai groupe
                    radio pour les lecteurs d'écran. */}
                <div
                  className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100/80"
                  role="radiogroup"
                  aria-label="Affichage de la carte"
                >
                  {/* ── COLONNE ────────────────────────────────────────────
                      La troisième présentation, et la seule qui change la
                      COQUILLE : la barre latérale se comprime, la leçon
                      rétrécit, la carte prend la place ainsi libérée. Elle
                      n'apparaît qu'au-dessus de 1024px — en dessous, deux
                      zones utiles côte à côte n'en font plus aucune. */}
                  {priorAvailable && (
                    <button
                      onClick={() => { onExpandedChange?.(false); setPrior(true); }}
                      role="radio"
                      aria-checked={isPrior}
                      title="Colonne — la leçon fait de la place à la carte"
                      data-km-view="prior"
                      className={[
                        'flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[11px] font-bold transition-colors',
                        isPrior ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                      ].join(' ')}
                    >
                      <Columns2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="hidden sm:inline">Colonne</span>
                    </button>
                  )}
                  <button
                    onClick={() => onExpandedChange?.(true)}
                    role="radio"
                    aria-checked={expanded}
                    title="Plein écran — la carte occupe toute la zone de la leçon"
                    data-km-view="expanded"
                    data-km-expand="true"
                    className={[
                      'flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded-md text-[11px] font-bold transition-colors',
                      expanded ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800',
                    ].join(' ')}
                  >
                    <Expand className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Plein écran</span>
                  </button>
                </div>

                {/* Replier — n'existe qu'en mode tiroir, et son icône (chevron)
                    ne ressemble plus à celle du plein écran. */}
                {!expanded && !isPrior && <button
                  onClick={() => setMinimized(m => !m)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                  aria-label={minimized ? 'Déplier la carte' : 'Replier la carte'}
                  aria-expanded={!minimized}
                  data-km-minimize="true"
                  title={minimized ? 'Déplier' : 'Replier'}
                >
                  {minimized ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-rose-500"
                  aria-label="Fermer la carte"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* ── Mode switcher ── */}
                <div
                  className="flex gap-1 px-4 py-2.5 border-b border-slate-100 shrink-0 bg-slate-50/60"
                  data-km-noprint="true"
                >
                  <button
                    onClick={() => handleModeChange('navigation')}
                    className={[
                      'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all truncate',
                      mode === 'navigation'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                    ].join(' ')}
                  >
                    <Compass className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Navigation</span>
                  </button>
                  <button
                    onClick={() => handleModeChange('complete')}
                    className={[
                      'flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-bold transition-all truncate',
                      mode === 'complete'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
                    ].join(' ')}
                  >
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Vue complète</span>
                  </button>
                </div>

                {/* ── Content ── */}
                <div
                  className={[
                    'flex-1 overflow-y-auto overscroll-contain sa-screen-view',
                    // Le mode plein respire : marges plus larges, contenu borné
                    // pour ne pas étirer une ligne de texte sur 1400px.
                    expanded ? 'px-6 sm:px-10 py-6' : 'px-4 py-4',
                  ].join(' ')}
                  data-km-scroll="true"
                >
                  <div className={expanded ? 'mx-auto w-full max-w-[1400px]' : ''}>
                  {visibleItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2 py-10" data-km-empty="true">
                      <span className="text-3xl" aria-hidden="true">🧭</span>
                      <p className="text-sm font-bold text-slate-800">Ta carte est encore vide.</p>
                      <p className="text-xs text-slate-500 max-w-[26ch]">Elle se remplit à chaque module terminé : commence par le module 1.</p>
                    </div>
                  ) : mode === 'navigation' ? (
                    <NavigationView
                      items={visibleItems}
                      selectedItem={selectedItem}
                      onSelectItem={setSelectedItem}
                      columns={contentColumns}
                    />
                  ) : (
                    <CompleteView items={visibleItems} columns={Math.min(contentColumns, 2)} />
                  )}
                  </div>
                </div>

                {/* ── Print View ── */}
                <div className="hidden sa-print-view w-full bg-white">
                  <PrintView items={visibleItems} printTitle={printTitle} printSubject={printSubject} />
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   TRIGGER — self-contained, portals the panel to <body>
   ───────────────────────────────────────────────────────────────────────── */

export function KnowledgeMapTrigger({ items = [], open: openProp, onOpenChange, printTitle, printSubject }) {
  const [openState, setOpenState] = useState(false);
  const controlled = typeof openProp === 'boolean';
  const open = controlled ? openProp : openState;
  const setOpen = useCallback((next) => {
    const value = typeof next === 'function' ? next(open) : next;
    if (!controlled) setOpenState(value);
    onOpenChange?.(value);
  }, [controlled, open, onOpenChange]);
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('knowledgeMapViewMode') || 'navigation'; }
    catch { return 'navigation'; }
  });
  // Présentation : 'drawer' | 'expanded'. La largeur du tiroir est stockée
  // séparément (knowledgeMapWidth) et n'est jamais écrasée par le mode plein,
  // donc le retour au tiroir retrouve le choix de l'élève.
  const [expanded, setExpanded] = useState(() => {
    try { return localStorage.getItem('knowledgeMapExpanded') === 'true'; }
    catch { return false; }
  });
  const handleExpandedChange = useCallback((next) => {
    setExpanded(next);
    try { localStorage.setItem('knowledgeMapExpanded', String(next)); } catch { /* noop */ }
  }, []);

  // Inject print styles once
  useEffect(() => {
    if (document.getElementById('km-print-styles')) return;
    const style = document.createElement('style');
    style.id = 'km-print-styles';
    style.textContent = PRINT_CSS;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const handleModeChange = useCallback((m) => {
    setMode(m);
    try { localStorage.setItem('knowledgeMapViewMode', m); } catch { /* noop */ }
  }, []);

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        className={[
          // bottom-20 : au-dessus du bouton Ctrl+K du site visiteur (bottom-6,
          // même coin, même z-index) et de la barre basse mobile de l'espace
          // élève (h-16) — sinon le déclencheur est recouvert.
          'fixed bottom-20 right-6 z-40',
          'flex items-center gap-2 px-4 py-3 rounded-2xl',
          'font-bold text-sm shadow-lg shadow-slate-900/20',
          'transition-colors duration-200',
          open
            ? 'bg-slate-900 text-white'
            : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-400 hover:shadow-xl',
        ].join(' ')}
        aria-label={open ? 'Fermer la carte' : 'Ouvrir ma carte des connaissances'}
        data-km-trigger="true"
        aria-pressed={open}
        data-km-noprint="true"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="text-lg" aria-hidden="true">🧠</span>
        <span>Ma carte</span>
      </motion.button>

      {/* Panel — portalled to body so print CSS can isolate it */}
      {ReactDOM.createPortal(
        <KnowledgeMap
          items={items}
          isOpen={open}
          onClose={() => setOpen(false)}
          mode={mode}
          onModeChange={handleModeChange}
          printTitle={printTitle}
          printSubject={printSubject}
          expanded={expanded}
          onExpandedChange={handleExpandedChange}
        />,
        document.body
      )}
    </>
  );
}

