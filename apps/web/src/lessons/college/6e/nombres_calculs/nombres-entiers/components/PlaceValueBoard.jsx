import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useDragDrop from '../../../../../common/manip6e/useDragDrop';
import {
  PIECES, PIECE_BY_KEY, boardValue, pieceCount, place, removeOne,
  canExchangeUp, exchangeUp, canBreakDown, breakDown, isTidy, pendingExchanges,
} from './boardUtils';
import { formatFr } from './numberUtils';

/**
 * PlaceValueBoard — l'atelier où le nombre est FABRIQUÉ en déplaçant des objets.
 *
 * Activity: PRENDRE un cube / une barre / une plaque / un bloc dans la réserve
 *   et le GLISSER dans sa colonne ; puis, quand dix objets se sont accumulés,
 *   attraper LA PILE DE DIX elle-même et la porter dans la colonne de gauche.
 * Mathematical objective: la valeur d'un objet dépend de la colonne où il est
 *   posé, et dix objets d'une colonne valent exactement un objet de la
 *   colonne de gauche.
 * Student action: un vrai glisser-déposer (pointeur et doigt), doublé du
 *   chemin prendre-puis-poser au clic et au clavier. Aucun bouton `+` / `−` :
 *   le nombre change parce que l'objet a bougé (règle projet du 2026-09-06).
 * Mathematical state: `board` = { UM, C, D, U }, le compte des objets
 *   réellement posés. Le nombre, l'écriture, la taille des piles, la pile
 *   échangeable et le compte d'objets : tout en dérive (CLAUDE.md §8).
 * Visual consequence: l'objet suit le doigt, la colonne survolée s'allume, la
 *   pile grandit et le nombre se réécrit immédiatement — sans clic de
 *   validation entre le geste et son effet.
 * Expected observation: la pile de dix disparaît et un seul objet la remplace
 *   à gauche — et LE NOMBRE N'A PAS BOUGÉ. Le plateau maigrit de neuf objets,
 *   la quantité reste la même.
 * Misconception targeted: « un chiffre vaut ce qu'il montre » — ici le même
 *   objet posé une colonne plus à gauche vaut dix fois plus, et l'élève le
 *   voit parce qu'il l'a déplacé lui-même.
 * Formalization: aucune. Les mots « position », « groupement par dix », « zéro
 *   qui tient une place » sont posés par les briques des modules 1 et 2, après
 *   le geste (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: le plateau ne se fige jamais (aucune prop `disabled`) ; on peut
 *   retirer un objet, casser un objet en dix, ou vider le plateau à volonté.
 *
 * Accessibilité : le glisser n'est jamais le SEUL chemin (§17). Chaque objet
 * de la réserve est un bouton — l'activer le prend (`aria-pressed`), activer
 * « Poser ici » sur une colonne l'y dépose ; la pile de dix et le geste
 * inverse sont eux aussi des boutons nommés. Tout le laboratoire est donc
 * atteignable au clavier seul.
 *
 * Sécurité d'affichage (§17bis) : les nombres vivent dans le DOM, jamais dans
 * un <text> SVG ; les piles sont plafonnées à `maxRender` objets rendus et le
 * surplus est annoncé par un badge « +N », donc une colonne à 40 objets a la
 * même largeur qu'une colonne à 3 ; les quatre colonnes sont une grille de
 * fractions, donc elles tiennent à 375 px sans défilement horizontal.
 */

const TONE = {
  UM: { fill: '#f59e0b', soft: 'bg-amber-50',   border: 'border-amber-400',   text: 'text-amber-800',   ring: 'ring-amber-400' },
  C:  { fill: '#8b5cf6', soft: 'bg-violet-50',  border: 'border-violet-400',  text: 'text-violet-800',  ring: 'ring-violet-400' },
  D:  { fill: '#0ea5e9', soft: 'bg-sky-50',     border: 'border-sky-400',     text: 'text-sky-800',     ring: 'ring-sky-400' },
  U:  { fill: '#10b981', soft: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-800', ring: 'ring-emerald-400' },
};

/* ── Les quatre formes. Chacune MONTRE de quoi elle est faite : une barre est
      dix cubes, une plaque dix barres. Le groupement se voit avant d'être dit. ── */

const cell = (fill, s) => ({ width: s, height: s, background: fill, borderRadius: 1 });

export function PieceShape({ k, size = 'md' }) {
  const t = TONE[k];
  const u = size === 'sm' ? 2.5 : 3.5;
  const gap = size === 'sm' ? 0.5 : 1;
  if (k === 'U') return <span style={cell(t.fill, u * 3)} className="inline-block" aria-hidden="true" />;
  if (k === 'D') {
    return (
      <span className="inline-flex flex-col" style={{ gap }} aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => <span key={i} style={cell(t.fill, u)} />)}
      </span>
    );
  }
  const stacked = k === 'UM';
  const grid = (
    <span className="grid grid-cols-10" style={{ gap }} aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => <span key={i} style={cell(t.fill, u)} />)}
    </span>
  );
  if (!stacked) return grid;
  return (
    <span className="relative inline-block" aria-hidden="true">
      <span className="absolute -top-1 -right-1 w-full h-full rounded-sm bg-amber-200 border border-amber-300" />
      <span className="relative inline-block bg-white/70 rounded-sm">{grid}</span>
    </span>
  );
}

/**
 * @param {object}   board       { UM, C, D, U } — l'état mathématique, tenu par le module
 * @param {function} onBoard     (nextBoard, event) => void ; `event` décrit le geste
 * @param {string[]} [available] colonnes ouvertes (déf. : les quatre)
 * @param {boolean}  [allowBreak] autorise le geste inverse (casser en dix)
 * @param {number}   [maxRender] objets rendus par colonne avant le badge « +N »
 * @param {string}   [note]      phrase courte sous le compteur (le module décide)
 */
export default function PlaceValueBoard({
  board,
  onBoard,
  available = ['UM', 'C', 'D', 'U'],
  allowBreak = true,
  maxRender = 12,
  note = null,
  showTidyHint = true,
}) {
  const [flash, setFlash] = useState(null);   // colonne qui vient de changer
  const pieces = PIECES.filter((p) => available.includes(p.key));
  const total = boardValue(board);
  const exchangeable = pendingExchanges(board).filter(
    (k) => available.includes(PIECES.find((q) => q.upFrom === k)?.key),
  );

  const emit = (next, event) => {
    setFlash(event.key);
    onBoard(next, event);
    window.setTimeout(() => setFlash(null), 420);
  };

  /* Le dépôt. `accepts` refuse une pièce dans la mauvaise colonne — et ce
     refus ENSEIGNE : on ne pose pas une centaine chez les unités. Un paquet
     de dix (`pack:U`) n'est accepté que par la colonne de gauche. */
  const accepts = (sourceId, zoneId) => {
    if (sourceId.startsWith('pack:')) {
      const from = sourceId.slice(5);
      return PIECES.find((p) => p.upFrom === from)?.key === zoneId && canExchangeUp(board, from);
    }
    return sourceId === zoneId;
  };

  const handleDrop = (sourceId, zoneId) => {
    if (sourceId.startsWith('pack:')) {
      const from = sourceId.slice(5);
      if (!canExchangeUp(board, from)) return;
      emit(exchangeUp(board, from), { type: 'exchange', key: from, to: zoneId });
      return;
    }
    emit(place(board, zoneId), { type: 'place', key: zoneId });
  };

  const dd = useDragDrop({ onDrop: handleDrop, accepts });

  const pull = (zoneId) => {
    if ((board[zoneId] || 0) === 0) return;
    emit(removeOne(board, zoneId), { type: 'remove', key: zoneId });
  };

  const doBreak = (from) => {
    if (!canBreakDown(board, from)) return;
    emit(breakDown(board, from), { type: 'break', key: from, to: PIECE_BY_KEY[from].upFrom });
  };

  const heldPiece = dd.held?.startsWith('pack:') ? dd.held.slice(5) : dd.held;

  return (
    <div className="space-y-3">
      {/* ── LA RÉSERVE — on prend un objet ici ───────────────────────── */}
      <div>
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Prends un objet et fais-le glisser dans sa colonne
        </p>
        <div className="flex flex-wrap gap-2">
          {pieces.map((p) => {
            const t = TONE[p.key];
            const isHeld = dd.held === p.key;
            return (
              <button
                key={p.key}
                type="button"
                aria-label={`${p.article} ${p.singular}${isHeld ? ' — en main, choisis une colonne' : ''}`}
                {...dd.sourceProps(p.key)}
                className={`min-h-[52px] px-3 py-2 rounded-xl border-2 transition-all select-none
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                  ${isHeld ? `${t.border} ${t.soft} shadow-md scale-105` : 'border-slate-200 bg-white hover:border-blue-300'}`}
              >
                <span className="flex flex-col items-center gap-1">
                  <PieceShape k={p.key} size="sm" />
                  <span className={`text-[11px] font-mono font-bold ${t.text}`}>{p.singular}</span>
                </span>
              </button>
            );
          })}
        </div>
        {dd.held && (
          <p className="text-xs text-blue-700 mt-1.5 font-semibold" role="status">
            {dd.held.startsWith('pack:')
              ? 'Paquet de dix en main. Dépose-le dans la colonne de gauche.'
              : 'En main. Dépose-le dans sa colonne ci-dessous.'}
          </p>
        )}
      </div>

      {/* ── LES COLONNES — on dépose ici ─────────────────────────────── */}
      <div>
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
          Le plateau
        </p>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${pieces.length}, minmax(0, 1fr))` }}
        >
          {pieces.map((p) => {
            const n = board[p.key] || 0;
            const shown = Math.min(n, maxRender);
            const t = TONE[p.key];
            const refused = dd.held && !accepts(dd.held, p.key);
            const active = dd.hoverZone === p.key && !refused;
            // La pile est prête à partir quand elle atteint dix ET que la
            // colonne de gauche existe.
            const ready = exchangeable.includes(p.key);

            return (
              <div
                key={p.key}
                {...dd.zoneProps(p.key)}
                className={`rounded-xl border-2 border-dashed p-1.5 min-h-[112px] flex flex-col items-center gap-1 transition-colors
                  ${active ? `${t.border} ${t.soft}`
                    : refused ? 'border-rose-200 bg-rose-50/40'
                    : flash === p.key ? `${t.border} ${t.soft}`
                    : 'border-slate-200 bg-slate-50/60'}`}
              >
                <span className="text-[11px] font-mono font-bold text-slate-500">{p.plural}</span>

                {/* LA PILE. Dès qu'elle atteint dix, elle devient elle-même
                    saisissable : c'est le geste d'échange, et non un bouton
                    « Échanger » posé à côté du plateau. */}
                {ready ? (
                  <button
                    type="button"
                    aria-label={`Prendre la pile de dix ${p.plural} et la porter dans la colonne des ${PIECES.find((q) => q.upFrom === p.key).plural}`}
                    {...dd.sourceProps(`pack:${p.key}`)}
                    className={`w-full min-h-[44px] rounded-lg ring-2 ${t.ring} ${t.soft} px-0.5 py-1
                      flex flex-wrap justify-center items-end gap-[3px] animate-pulse
                      focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500`}
                  >
                    {Array.from({ length: shown }, (_, i) => (
                      <span key={i} className="inline-flex"><PieceShape k={p.key} size="sm" /></span>
                    ))}
                    {n > shown && <span className={`text-[11px] font-mono font-bold self-center ${t.text}`}>+{n - shown}</span>}
                  </button>
                ) : (
                  <span className="flex flex-wrap justify-center items-end gap-[3px] min-h-[44px] w-full px-0.5">
                    <AnimatePresence initial={false}>
                      {Array.from({ length: shown }, (_, i) => (
                        <motion.span
                          key={i}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ duration: 0.16 }}
                          className="inline-flex"
                        >
                          <PieceShape k={p.key} size="sm" />
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {n > shown && <span className={`text-[11px] font-mono font-bold self-center ${t.text}`}>+{n - shown}</span>}
                  </span>
                )}

                <span className={`text-sm font-mono font-black tabular-nums ${n ? t.text : 'text-slate-300'}`}>{n}</span>

                {/* Le chemin clavier / clic : prendre puis poser, exactement
                    équivalent au glisser (§17 : jamais de geste sans jumeau). */}
                <div className="flex gap-1 w-full">
                  <button
                    type="button"
                    onClick={() => dd.dropHere(p.key)}
                    disabled={!dd.held || refused}
                    className="flex-1 min-h-[44px] px-1 rounded-lg text-[10px] font-bold border border-slate-200 bg-white text-slate-600 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Poser ici
                  </button>
                  <button
                    type="button"
                    onClick={() => pull(p.key)}
                    disabled={n === 0}
                    aria-label={`Retirer ${p.article} ${p.singular} de la colonne des ${p.plural}`}
                    className="min-h-[44px] px-2 rounded-lg text-[10px] font-bold border border-slate-200 bg-white text-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quand une pile de dix s'est formée, on le dit — sans dire quoi faire
          à sa place : c'est la pile elle-même qui est devenue saisissable. */}
      <AnimatePresence>
        {exchangeable.length > 0 && (
          <motion.p
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/70 px-3 py-2 text-xs font-semibold text-indigo-900"
          >
            Une pile de dix s'est formée. Prends-la et porte-la dans la colonne de gauche.
          </motion.p>
        )}
      </AnimatePresence>

      {/* Le geste inverse : reprendre un objet et le rendre à sa colonne de
          droite en dix morceaux. Même statut, même absence de verdict. */}
      {allowBreak && (
        <div className="flex flex-wrap gap-2">
          {pieces.filter((p) => canBreakDown(board, p.key) && available.includes(p.upFrom)).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => doBreak(p.key)}
              aria-label={`Rendre ${p.article} ${p.singular} en dix ${PIECE_BY_KEY[p.upFrom].plural}`}
              className="min-h-[44px] px-3 rounded-xl bg-white border-2 border-slate-200 text-slate-600 text-[11px] font-bold hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span className="flex items-center gap-1.5">
                <PieceShape k={p.key} size="sm" />
                <span aria-hidden="true">→</span>
                <span className="flex gap-[2px]" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, i) => <PieceShape key={i} k={p.upFrom} size="sm" />)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ── Le miroir numérique. DOM, pas SVG : il ne peut rien chevaucher. ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Ton nombre
          </div>
          <div
            className="font-mono font-black text-3xl text-slate-800 tabular-nums"
            role="status"
            aria-live="polite"
          >
            {formatFr(total)}
          </div>
        </div>
        <div className="text-right text-[11px] font-mono text-slate-400 leading-relaxed">
          <div>{pieceCount(board)} objet{pieceCount(board) > 1 ? 's' : ''} sur le plateau</div>
          {showTidyHint && (
            <div className={isTidy(board) ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold'}>
              {isTidy(board) ? 'rangé au plus court' : 'une pile de dix attend'}
            </div>
          )}
        </div>
      </div>

      {note && <p className="text-xs text-slate-500">{note}</p>}

      {/* L'objet suit le doigt pendant le glissement — la conséquence du geste
          est visible avant même le dépôt. `pointer-events-none` pour que
          `elementFromPoint` continue de voir la colonne dessous. */}
      {dd.ghost && heldPiece && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-80"
          style={{ left: dd.ghost.x, top: dd.ghost.y }}
          aria-hidden="true"
        >
          <PieceShape k={heldPiece} size="sm" />
        </div>
      )}
    </div>
  );
}
