import React, { useCallback, useRef, useState } from 'react';
import { Feedback } from '../../../../../common/components/LessonUI';
import { placeFact, withCell, isComplete, formatCell, cellAriaLabel } from './tableUtils';

/**
 * DropGrid — le rangement se FABRIQUE : on prend une donnée en vrac et on la
 * POSE au croisement.
 *
 * Activity: l'élève saisit une étiquette (« Tom · Relais · 15 pts ») dans la
 *   réserve et la fait glisser jusqu'à une case de la grille vide.
 * Mathematical objective: un tableau à double entrée n'est pas une grille à
 *   lire, c'est un RANGEMENT à construire — et la case n'a de sens que par
 *   le croisement d'UNE ligne et d'UNE colonne.
 * Student action: un glisser-déposer (pointeur) ou prendre/poser (clavier),
 *   sur l'objet lui-même. Le nombre n'apparaît dans la grille que parce que
 *   l'élève l'y a mis.
 * Mathematical state: le `TableModel` seul. La grille, le compteur de
 *   restantes, l'état « terminé » en dérivent tous.
 * Expected observation: pendant qu'on tient une étiquette, la ligne ET la
 *   colonne qu'elle désigne s'allument — elles ne se croisent qu'en UN point.
 *   Poser au mauvais croisement est refusé, et le refus dit lequel des deux
 *   repères est faux (« bonne ligne, mauvaise colonne »).
 * Misconception targeted: « la position d'un nombre dans un tableau est un
 *   détail de mise en page ». Ici la position EST la donnée : la même valeur
 *   posée ailleurs raconte autre chose.
 * Formalization: aucune. Les mots ligne / colonne / en-tête / cellule
 *   appartiennent au module 2 — cette grille les fait vivre sans les nommer.
 *
 * POURQUOI PAS `SortingBoard` : SortingBoard fait choisir une case au doigt,
 * ce qui est un tap — l'information ne se DÉPLACE pas, elle apparaît. Ici
 * l'étiquette part d'un vrac visible et atterrit dans la grille : c'est le
 * trajet du désordre vers le rangement que l'élève doit voir, et c'est
 * exactement ce que la leçon enseigne (INTERACTION_PEDAGOGY §4-F, §16).
 *
 * ACCESSIBILITÉ : chaque étiquette est un bouton ; l'activer la met « en
 * main », activer ensuite une case l'y dépose. La séquence prendre → poser
 * est donc intégralement faisable au clavier, et annoncée.
 *
 * SÉCURITÉ VISUELLE (§17bis) : la grille est un vrai <table> qui défile dans
 * son propre conteneur ; les cellules font 44 px de haut au minimum et les
 * étiquettes s'enroulent (`flex-wrap`), si bien qu'aucun nombre de données ne
 * peut faire déborder la colonne.
 */

const TONES = {
  emerald: { head: 'bg-emerald-600', soft: 'bg-emerald-50', ring: 'ring-emerald-400', chip: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
  sky: { head: 'bg-sky-600', soft: 'bg-sky-50', ring: 'ring-sky-400', chip: 'border-sky-300 bg-sky-50 text-sky-900' },
  indigo: { head: 'bg-indigo-600', soft: 'bg-indigo-50', ring: 'ring-indigo-400', chip: 'border-indigo-300 bg-indigo-50 text-indigo-900' },
};

export default function DropGrid({
  initialTable,          // TableModel dont les cellules à remplir valent null
  facts,                 // [{ id, row, col, value, label }]
  react,                 // kit.react
  solved = false,
  onSolved,
  tone = 'emerald',
  caption = 'Tableau à construire',
  /** Consigne courte affichée au-dessus de la réserve. */
  trayLabel = 'Les données, en vrac',
}) {
  const t = TONES[tone] ?? TONES.emerald;

  const [table, setTable] = useState(initialTable);
  const [placed, setPlaced] = useState([]);
  const [held, setHeld] = useState(null);      // id de l'étiquette en main
  const [hover, setHover] = useState(null);    // `${r},${c}` survolé pendant le geste
  const [miss, setMiss] = useState(null);      // { r, c, diagnosis } — dernier dépôt refusé
  const pointerActive = useRef(false);
  const justDragged = useRef(false);

  const done = solved || isComplete(table);
  const remaining = facts.filter((f) => !placed.includes(f.id));
  const heldFact = facts.find((f) => f.id === held) ?? null;
  // La ligne et la colonne visées par l'étiquette en main : elles s'allument
  // toutes les deux, et l'élève voit qu'elles ne se croisent qu'une fois.
  const aim = heldFact ? placeFact(table, heldFact) : null;

  const drop = useCallback((r, c) => {
    if (done || !heldFact) return;
    const target = placeFact(table, heldFact);
    if (target && target.r === r && target.c === c) {
      const next = withCell(table, r, c, heldFact.value);
      setTable(next);
      setPlaced((p) => [...p, heldFact.id]);
      setMiss(null);
      setHeld(null);
      react?.(true);
      if (isComplete(next)) onSolved?.();
      return;
    }
    // Le refus ENSEIGNE : il nomme lequel des deux repères est faux, sans
    // jamais révéler la bonne case (§12).
    const rowOk = target && target.r === r;
    const colOk = target && target.c === c;
    setMiss({
      r,
      c,
      diagnosis: rowOk
        ? `Bonne ligne (${heldFact.row}), mais ce n’est pas la colonne « ${heldFact.col} ».`
        : colOk
        ? `Bonne colonne (${heldFact.col}), mais ce n’est pas la ligne « ${heldFact.row} ».`
        : `Ni la ligne « ${heldFact.row} », ni la colonne « ${heldFact.col} ».`,
    });
    react?.(false);
  }, [done, heldFact, table, react, onSolved]);

  /* ── Pointeur : on prend l'étiquette, on la traîne, on la lâche sur une
        case. `elementFromPoint` évite un gestionnaire par cellule et marche
        au doigt comme à la souris. ─────────────────────────────────────── */
  const zoneUnder = (e) => {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    return el?.closest?.('[data-cell]')?.getAttribute('data-cell') ?? null;
  };
  const beginPointer = (id) => (e) => {
    if (done) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointerActive.current = true;
    setHeld(id);
    setMiss(null);
  };
  const movePointer = (e) => {
    if (!pointerActive.current || done) return;
    setHover(zoneUnder(e));
  };
  const endPointer = (e) => {
    if (!pointerActive.current || done) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    pointerActive.current = false;
    const z = zoneUnder(e);
    setHover(null);
    // Le `click` synthétique qui suit un pointerup ne doit PAS re-basculer
    // l'étiquette : sans ce drapeau, un simple tap la prend puis la relâche
    // aussitôt et rien n'est jamais en main.
    justDragged.current = true;
    if (z) { const [r, c] = z.split(',').map(Number); drop(r, c); }
    // Sans zone sous le doigt, l'étiquette RESTE en main : le clavier et le
    // simple tap reprennent la main sans qu'on ait à recommencer le geste.
  };

  /** Bascule au clavier / au tap, quand aucun geste de pointeur ne l'a déjà fait. */
  const toggleHeld = (id) => {
    if (justDragged.current) { justDragged.current = false; return; }
    setHeld((h) => (h === id ? null : id));
    setMiss(null);
  };

  return (
    <div className="space-y-3" role="group" aria-label="Ranger les données dans le tableau">
      {/* ── La réserve : le désordre, visible et saisissable ───────── */}
      {!done && (
        <div>
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              {trayLabel}
            </p>
            <p className="text-xs text-slate-500 tabular-nums">
              {remaining.length} à ranger
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {remaining.map((f) => {
              const isHeld = held === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={isHeld}
                  aria-label={`${f.label}${isHeld ? ' — en main, choisis une case du tableau' : ''}`}
                  onPointerDown={beginPointer(f.id)}
                  onPointerMove={movePointer}
                  onPointerUp={endPointer}
                  onPointerCancel={endPointer}
                  onClick={() => toggleHeld(f.id)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all select-none
                    focus:outline-none focus-visible:ring-2 ${t.ring}
                    ${isHeld ? 'border-slate-800 bg-white shadow-lg scale-105' : t.chip}`}
                  style={{ touchAction: 'none', cursor: 'grab' }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          {heldFact && (
            <p className="text-xs font-semibold text-slate-700 mt-1.5" role="status">
              En main : <strong>{heldFact.label}</strong>. Pose-la au croisement de sa ligne et de sa
              colonne.
            </p>
          )}
        </div>
      )}

      {/* ── La grille : chaque case est une zone d'accueil ─────────── */}
      <div className="w-full overflow-x-auto flex justify-center">
        <table className="border-collapse mx-auto text-sm">
          <caption className="caption-top text-xs text-slate-500 mb-2 font-medium">{caption}</caption>
          <thead>
            <tr>
              <th scope="col" className={`${t.head} text-white font-semibold px-3 py-2 border border-slate-300 text-left rounded-tl-lg`}>
                {initialTable.rowHeader}
              </th>
              {initialTable.colHeaders.map((h, c) => (
                <th
                  key={h}
                  scope="col"
                  className={`${t.head} text-white font-semibold px-3 py-2 border border-slate-300 text-center whitespace-nowrap transition-all
                    ${aim && aim.c === c ? 'ring-4 ring-inset ring-white/70' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialTable.rowLabels.map((label, r) => (
              <tr key={label}>
                <th
                  scope="row"
                  className={`bg-slate-100 font-semibold px-3 py-2 border border-slate-300 text-left whitespace-nowrap transition-all
                    ${aim && aim.r === r ? 'bg-slate-800 text-white' : 'text-slate-700'}`}
                >
                  {label}
                </th>
                {initialTable.colHeaders.map((_, c) => {
                  const v = table.values[r][c];
                  const key = `${r},${c}`;
                  const filled = v !== null && v !== undefined;
                  const isAim = !!aim && aim.r === r && aim.c === c;
                  const inCross = !!aim && (aim.r === r || aim.c === c);
                  const isHover = hover === key;
                  const isMiss = !!miss && miss.r === r && miss.c === c;

                  const cls = `w-full h-11 min-w-[68px] px-2 text-center font-mono font-bold transition-colors ${
                    isMiss ? 'bg-rose-100 text-rose-700'
                      : filled ? 'bg-emerald-100 text-emerald-800'
                      : isHover || isAim ? `${t.soft} ring-2 ring-inset ${t.ring.replace('ring-', 'ring-')}`
                      : inCross ? t.soft
                      : 'bg-white text-slate-400'
                  }`;

                  return (
                    <td key={key} data-cell={key} className="p-0 border border-slate-300">
                      {filled || done ? (
                        <div className={cls} aria-label={cellAriaLabel(table, r, c)}>
                          {formatCell(table, v)}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => drop(r, c)}
                          disabled={!heldFact}
                          aria-label={`Poser ici : ligne ${label}, colonne ${initialTable.colHeaders[c]}`}
                          className={`${cls} disabled:cursor-default focus:outline-none focus-visible:ring-2 ${t.ring}`}
                        >
                          {isAim ? '·' : ''}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {miss && !done && (
        <Feedback tone="ko">
          {miss.diagnosis} Une donnée ne va qu’à <strong>un seul</strong> endroit : là où sa ligne et
          sa colonne se rencontrent.
        </Feedback>
      )}

      {done && (
        <Feedback tone="ok">
          Le tableau est construit — et c’est toi qui l’as bâti, donnée par donnée. Chaque nombre est
          désormais à un endroit où on peut le <strong>retrouver</strong> : il suffit de partir de son
          nom à gauche et de glisser jusqu’à la bonne bande du haut.
        </Feedback>
      )}
    </div>
  );
}
