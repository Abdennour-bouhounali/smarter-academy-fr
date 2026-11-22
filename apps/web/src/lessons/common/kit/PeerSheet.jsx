import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../components/MathText';
import KidFigure from '../manipulations/primitives/KidFigure';
import { KitContext } from './kitContext';
import { useSavedAnswer } from '../answers/useSavedAnswer';
import SavedAnswerChip from '../answers/SavedAnswerChip';
import { startSheet, tapLine, pickFix, rightFix, peerFixOrder } from './peerSheet';

/**
 * « ورقة زميل » — l'élève corrige la copie d'un camarade (conseil + propriétaire, 2026-11-08, d'abord sur la leçon pilote).
 *
 *   <PeerSheet sheet={{ id, task, lines, errorLine, fixes: [{ text, ok?, why? }], fixedLines?, why }}
 *              kid={{ name, hairStyle?, outfit?, scarf? }} onDone={(foundFirst) => …} />
 *
 * Il touche la ligne où l'erreur COMMENCE (2 essais, puis elle est montrée), choisit la correction (une mauvaise option dit
 * l'idée fausse qu'elle trahit — jamais la réponse), puis voit la copie CORRIGÉE : la ligne fautive barrée, la bonne en vert,
 * et pourquoi cette erreur arrive. Le camarade est INVENTÉ et dessiné par KidFigure (jamais la copie d'un vrai élève). Logique
 * pure : peerSheet.js. La réponse est gardée et restaurée comme les autres (answers/useSavedAnswer).
 */
export default function PeerSheet({ sheet, kid = {}, onDone }) {
  const { t } = useTranslation('lesson');
  const kit = useContext(KitContext);
  const [s, setS] = useState(startSheet);
  const [ko, setKo] = useState(null); // la dernière mauvaise option (son `why`)
  const memory = useSavedAnswer([], { key: `peer:${sheet.id}` });
  const [restoredAt, setRestoredAt] = useState(null);
  const restored = React.useRef(false);
  React.useEffect(() => {
    const m = memory.saved;
    if (restored.current || !m || s.phase !== 'find' || m.v?.phase !== 'done') return;
    restored.current = true;
    setS({ ...startSheet(), phase: 'done', foundFirst: Boolean(m.v.foundFirst), fixedWith: rightFix(sheet) });
    setRestoredAt(m.at);
    onDone?.(Boolean(m.v.foundFirst));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memory.saved]);

  const onLine = (i) => {
    const next = tapLine(s, i, sheet);
    if (next === s) return;
    kit?.react?.(next.phase === 'fix' && !next.shown);
    setS(next);
  };
  const onFix = (k) => {
    const next = pickFix(s, k, sheet);
    if (next === s) return;
    const ok = next.phase === 'done';
    kit?.react?.(ok);
    setKo(ok ? null : k);
    setS(next);
    if (ok) { restored.current = true; memory.save({ phase: 'done', foundFirst: next.foundFirst }); onDone?.(next.foundFirst); }
  };

  const done = s.phase === 'done';
  const name = kid.name ?? t('peer.defaultName');
  const lineTone = (i) => {
    if (i === sheet.errorLine && (done || s.phase === 'fix')) return done ? 'text-rose-700 line-through decoration-2' : 'bg-amber-100 ring-2 ring-amber-400';
    // une ligne qui DÉCOULE de l'erreur est barrée elle aussi une fois la copie corrigée (sa bonne version suit en vert)
    if (done && sheet.fixedLines?.[i] != null) return 'text-rose-700 line-through decoration-2';
    // une ligne touchée à tort est grisée pendant la recherche seulement : corrigée, la copie redevient lisible
    if (s.phase === 'find' && s.wrongLines.includes(i)) return 'bg-slate-100 text-slate-400';
    return s.phase === 'find' ? 'hover:bg-indigo-50' : '';
  };

  return (
    // une seule unité à l'écran dans le lecteur : la consigne, la copie et ses corrections ne sont jamais séparées (ClassroomPaged)
    <div className="space-y-3" data-peer-sheet={sheet.id} data-peer-phase={s.phase} data-paging-keep>
      <div className="flex items-start gap-3">
        <svg viewBox="0 0 80 112" className="h-24 w-16 shrink-0" aria-hidden="true">
          <KidFigure cx={40} top={6} foot={106} mood={done ? 'proud' : 'wonder'} {...kid.figure} />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-600">{t('peer.sheetOf', { name })}</p>
          <p className="text-base font-black text-indigo-950"><MathText>{sheet.task}</MathText></p>
          <p className="mt-1 text-sm font-semibold text-amber-800" role="status">
            {s.phase === 'find' ? (s.wrongLines.length ? t('peer.notThis') : t('peer.findLine')) : s.phase === 'fix' ? (s.shown ? t('peer.lineShown') : t('peer.lineFound')) : null}
          </p>
        </div>
      </div>

      {/* la copie : papier quadrillé, une ligne = un bouton tant que l'élève cherche */}
      <ol className="space-y-1 rounded-2xl border-2 border-slate-200 bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[length:18px_18px] bg-white p-3">
        {sheet.lines.map((line, i) => (
          <li key={i}>
            <button type="button" disabled={s.phase !== 'find' || s.wrongLines.includes(i)} onClick={() => onLine(i)}
              data-peer-line={i} data-peer-wrong={s.wrongLines.includes(i) ? 'true' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-lg transition-colors ${lineTone(i)}`}>
              <span className="w-6 shrink-0 text-sm font-bold text-slate-400">{i + 1}</span>
              <span className="min-w-0"><MathText>{line}</MathText></span>
            </button>
            {done && i === sheet.errorLine && (
              <p className="ms-12 rounded-xl bg-emerald-50 px-3 py-1 text-lg font-bold text-emerald-800" data-peer-fixed>
                ✓ <MathText>{sheet.fixes[s.fixedWith ?? rightFix(sheet)].text}</MathText>
              </p>
            )}
            {done && sheet.fixedLines?.[i] != null && i !== sheet.errorLine && (
              <p className="ms-12 rounded-xl bg-emerald-50 px-3 py-1 text-lg font-bold text-emerald-800">✓ <MathText>{sheet.fixedLines[i]}</MathText></p>
            )}
          </li>
        ))}
      </ol>

      {s.phase === 'fix' && (
        <div className="space-y-2" data-peer-fixes>
          <p className="text-base font-black text-indigo-950">{t('peer.pickFix')}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {peerFixOrder(sheet).map((k) => {
              const f = sheet.fixes[k];
              const wrong = s.wrongFixes.includes(k);
              return (
                <button key={k} type="button" disabled={wrong} onClick={() => onFix(k)} data-peer-fix={k}
                  className={`min-h-[52px] rounded-2xl border-2 px-3 py-2 text-start text-base font-bold ${wrong ? 'border-rose-200 bg-rose-50 text-rose-400' : 'border-indigo-200 bg-white text-indigo-950 hover:bg-indigo-50'}`}>
                  <MathText>{f.text}</MathText>
                </button>
              );
            })}
          </div>
          {ko != null && sheet.fixes[ko]?.why && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-800" role="status" data-peer-why-wrong><MathText>{sheet.fixes[ko].why}</MathText></p>
          )}
        </div>
      )}

      {done && (
        <div className="space-y-1 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3" data-peer-done={s.foundFirst ? 'first' : 'helped'}>
          <p className="text-xl font-black text-emerald-800">{s.foundFirst ? t('peer.caught') : t('peer.corrected', { name })}</p>
          <p className="text-base text-slate-700"><strong>{t('peer.whyTitle')}</strong> <MathText>{sheet.why}</MathText></p>
        </div>
      )}
      {restoredAt && <SavedAnswerChip at={restoredAt} />}
    </div>
  );
}
