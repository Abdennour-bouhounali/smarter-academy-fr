import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle } from 'lucide-react';
import useDragInteraction from '../manipulations/useDragInteraction';
import DraggableObject from '../manipulations/primitives/DraggableObject';
import DragGhost from '../manipulations/primitives/DragGhost';
import { playSfx } from '../utils/playEffect';

/**
 * InfoSorter — tri des informations utiles / inutiles d'un énoncé.
 *
 * GLISSER-DÉPOSER, avec le tap en secours (demande utilisateur du 2026-09-07 :
 * « make them a drag and drop »). On attrape la carte et on la lâche dans un
 * bac ; le bac visé s'allume.
 *
 * LE GESTE EST CELUI DU KIT (2026-09-30) : `useDragInteraction` — le moteur
 * unique du contrat (MANIPULATION_CONTRACT §4.1) : seuil de tap, aimant,
 * défilement au bord de l'écran sur un téléphone, carte rendue si on la
 * lâche hors d'un bac, tap-tap et clavier. Il remplace l'ancien
 * `manip6e/useDragDrop`, dernier survivant d'un second moteur, et les cartes
 * ne sont plus des `motion.button layout` : une animation de disposition
 * démonte le nœud pendant le geste, la capture du pointeur se perd et le
 * glisser s'arrête sans bruit.
 *
 * @param {{id, text, useful}[]} items
 * @param {boolean} [formative] quand true (modules de contenu, politique
 *   formative) : `onSolved` est appelé dès la première vérification, même si
 *   le tri est faux — la correction reste affichée (icônes + liste des
 *   données utiles), jamais de boucle « réessaie ». Défaut false : l'ancien
 *   comportement (onSolved seulement sur un tri juste) est conservé.
 * @param {(allRight:boolean)=>void} [onCheck] appelé à chaque vérification
 *   (ex. pour brancher le son/la série du lesson kit : `onCheck={kit.react}`).
 */
export default function InfoSorter({ items, onSolved, solved, formative = false, onCheck }) {
  const { t } = useTranslation('lesson');
  const [assign, setAssign] = useState({}); // id -> 'utile' | 'inutile'
  const [checked, setChecked] = useState(false);

  // Le geste (pointeur, tap, clavier) est celui du kit ; ce composant ne
  // garde que le tri.
  const drag = useDragInteraction({
    onDrop: (source, bin) => {
      setChecked(false);
      const id = source.replace(/^card:/, '');
      setAssign((a) => ({ ...a, [id]: bin }));
    },
  });
  const selected = drag.held;

  const allAssigned = items.every((it) => assign[it.id]);
  const allRight = items.every((it) => assign[it.id] === (it.useful ? 'utile' : 'inutile'));

  // Reposer une carte déjà rangée : on la remet dans la réserve.
  const unassign = (id) => {
    setAssign((a) => { const n = { ...a }; delete n[id]; return n; });
    setChecked(false);
  };

  const pool = items.filter((it) => !assign[it.id]);
  const utiles = items.filter((it) => assign[it.id] === 'utile');
  const inutiles = items.filter((it) => assign[it.id] === 'inutile');

  const cardTone = (it) => {
    if (!checked) return 'bg-white border-slate-200 text-slate-700 hover:border-blue-400';
    // La couleur dit si la carte est BIEN RANGÉE (comme l'icône ✓ / ✗) — pas si la donnée est utile : une donnée inutile
    // bien rangée était rouge, et l'élève croyait s'être trompé (propriétaire, 2026-11-04).
    const right = assign[it.id] === (it.useful ? 'utile' : 'inutile');
    return right ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800';
  };

  const heldItem = items.find((it) => `card:${it.id}` === drag.held);
  const binClass = (bin, tone) => {
    const z = drag.zoneProps(bin);
    return z['data-drop-active'] === 'true'
      ? (tone === 'emerald' ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300' : 'border-slate-500 bg-slate-100 ring-2 ring-slate-300')
      : selected !== null
        ? (tone === 'emerald' ? 'border-emerald-400 bg-emerald-50/50 cursor-pointer' : 'border-slate-400 bg-slate-50 cursor-pointer')
        : 'border-slate-200 bg-slate-50';
  };

  return (
    <div className="space-y-4">
      {/* La carte transportée suit le pointeur (portail du kit, `pointer-events: none`). */}
      <DragGhost ghost={drag.ghost}>
        {heldItem && <span className="block max-w-[260px] rounded-xl border-2 border-blue-500 bg-blue-50 px-3 py-2.5 text-sm font-medium text-blue-900">{heldItem.text}</span>}
      </DragGhost>

      {/* Réserve de cartes */}
      {pool.length > 0 && (
        <div>
          <div className="text-xs font-bold text-slate-500 mb-2">
            {t('infoSorter.pool')}
          </div>
          <div className="flex flex-wrap gap-2">
            {pool.map((it) => (
              <DraggableObject
                key={it.id}
                drag={drag}
                id={`card:${it.id}`}
                label={it.text}
                heldClassName="bg-blue-50 border-blue-500 ring-2 ring-blue-300 text-blue-900"
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium text-start max-w-[260px] min-h-[44px] ${
                  selected === `card:${it.id}` ? '' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                {it.text}
              </DraggableObject>
            ))}
          </div>
        </div>
      )}

      {/* Bacs de tri */}
      <div className="grid gap-3 grid-cols-2">
        <div
          {...drag.zoneProps('utile')}
          role="button"
          tabIndex={0}
          aria-label={t('infoSorter.useful')}
          className={`rounded-2xl border-2 border-dashed p-3 min-h-[100px] space-y-1.5 transition-colors ${binClass('utile', 'emerald')}`}
        >
          <div className="text-xs font-bold text-emerald-700">
            {t('infoSorter.useful')}
          </div>
          {utiles.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); unassign(it.id); }}
              className={`w-full text-start px-3 py-2 rounded-lg border-2 text-sm transition-colors ${cardTone(it)} ${solved ? '' : 'hover:opacity-80'}`}
            >
              {checked && (it.useful ? <CheckCircle2 className="inline w-3.5 h-3.5 me-1.5" aria-hidden="true" /> : <XCircle className="inline w-3.5 h-3.5 me-1.5" aria-hidden="true" />)}
              {it.text}
            </button>
          ))}
        </div>

        <div
          {...drag.zoneProps('inutile')}
          role="button"
          tabIndex={0}
          aria-label={t('infoSorter.useless')}
          className={`rounded-2xl border-2 border-dashed p-3 min-h-[100px] space-y-1.5 transition-colors ${binClass('inutile', 'slate')}`}
        >
          <div className="text-xs font-bold text-slate-500">
            {t('infoSorter.useless')}
          </div>
          {inutiles.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); unassign(it.id); }}
              className={`w-full text-start px-3 py-2 rounded-lg border-2 text-sm transition-colors ${cardTone(it)} ${solved ? '' : 'hover:opacity-80'}`}
            >
              {checked && (!it.useful ? <CheckCircle2 className="inline w-3.5 h-3.5 me-1.5" aria-hidden="true" /> : <XCircle className="inline w-3.5 h-3.5 me-1.5" aria-hidden="true" />)}
              {it.text}
            </button>
          ))}
        </div>
      </div>

      {!solved && allAssigned && !checked && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setChecked(true);
              // le son de la vérification : celui du parent s'il en branche un (kit.react), sinon le nôtre — jamais deux fois
              if (onCheck) onCheck(allRight); else playSfx(allRight ? 'correct' : 'wrong');
              if (allRight || formative) onSolved?.();
            }}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {t('infoSorter.check')}
          </button>
        </div>
      )}

      {checked && !allRight && !formative && !solved && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {t('infoSorter.retry')}
        </p>
      )}

      {/* Mode formatif : on ne bloque pas, on montre le bon tri. (Pas de
          `!solved` ici : onSolved vient d'être appelé, solved est déjà vrai.) */}
      {checked && !allRight && formative && (
        <p className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {t('infoSorter.formativeLead')}{' '}
          {/* « ؛ » entre les données : jointes par une espace, des données longues
              (les مسائل) se lisaient comme une seule phrase. */}
          <strong>{items.filter((it) => it.useful).map((it) => it.text).join(' ؛ ')}</strong>.{' '}
          {t('infoSorter.formativeRest')}
        </p>
      )}
    </div>
  );
}
