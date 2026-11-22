import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import MathText from '../components/MathText';
import MissionDialog from '../mission/MissionDialog';
import ProblemSupport from './ProblemSupport';

/**
 * « نصّ المسألة » — dans le lecteur de mission, la مسألة est jouée écran par écran ; l'énoncé n'est que sur le premier.
 * Ce bouton, à TOUS les écrans de la مسألة, ouvre l'énoncé entier (texte, support, toutes les questions) dans une fenêtre
 * (propriétaire, 2026-11-04). Il est posé hors de la zone mise à l'échelle (portail) : il ne grandit ni ne bouge avec l'écran.
 */
export default function ProblemSheet({ problem }) {
  const { t } = useTranslation('lesson');
  const [open, setOpen] = useState(false);
  if (typeof document === 'undefined') return null;
  return createPortal(
    <>
      <button type="button" onClick={() => setOpen(true)} data-problem-sheet-open
        className="fixed end-6 top-[86px] z-[36] inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-amber-100 px-4 text-sm font-black text-amber-900 shadow-sm ring-1 ring-amber-300 hover:bg-amber-200">
        <span aria-hidden="true">📜</span> {t('problem.sheetOpen')}
      </button>
      {open && (
        // large, en DEUX colonnes (le texte et les questions | le support) : tout tient sans défilement (règle du lecteur)
        <MissionDialog label={t('problem.sheetOpen')} onClose={() => setOpen(false)} wide>
          <div className="grid items-start gap-6 pt-6 text-start lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]" data-problem-sheet>
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900"><MathText>{problem.context ?? problem.title}</MathText></h2>
              <p className="text-lg leading-relaxed text-slate-800"><MathText>{problem.statement}</MathText></p>
              <ol className="list-none space-y-1.5 border-t border-slate-200 pt-3 text-lg font-semibold text-slate-900">
                {problem.parts.map((part) => <li key={part.label}><MathText>{`${part.label} ${part.question}`}</MathText></li>)}
              </ol>
            </div>
            <ProblemSupport figure={problem.figure} visual={problem.visual} table={problem.table} scene={problem.scene} illustration={problem.illustration} />
          </div>
        </MissionDialog>
      )}
    </>,
    document.body,
  );
}
