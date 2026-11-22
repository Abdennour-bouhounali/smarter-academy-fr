import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Rocket } from 'lucide-react';

// Une couleur PAR niveau : l'actif se reconnaît sans lire (vert = مبتدئ,
// bleu = متقدم), et les deux restent lisibles en contraste AA sur blanc.
const LOOK = {
  beginner: { Icon: Sprout, active: 'bg-emerald-600 text-white shadow', idle: 'text-emerald-800 hover:bg-emerald-50', dot: 'text-emerald-600' },
  advanced: { Icon: Rocket, active: 'bg-blue-600 text-white shadow', idle: 'text-blue-800 hover:bg-blue-50', dot: 'text-blue-600' },
};

/**
 * Le SÉLECTEUR DE NIVEAU — « مستوى المناولة : [ مبتدئ ] [ متقدم ] ».
 *
 * Deux boutons, jamais plus, jamais deux pages. Il est posé à UN endroit par
 * manipulation : par `ManipulationWorkspace` (où il change de panneau), ou
 * par `ManipulationShell` / `DivisorExplorerBooks` quand la manipulation est
 * seule (où il change de nombres). Jamais les deux à la fois.
 *
 * ACCESSIBILITÉ. `role="tablist"` et ses `role="tab"` : un lecteur d'écran
 * annonce « onglet 1 sur 2, sélectionné », et les flèches ← → passent d'un
 * niveau à l'autre — en RTL, la flèche GAUCHE va au suivant, parce que le
 * suivant est dessiné à gauche. Cibles ≥ 44 px (contrat mobile). Les ids
 * sont préfixés par instance (`idPrefix`) : plusieurs sélecteurs sur une
 * page ne se marchent pas dessus. `aria-controls` n'est posé que si le
 * sélecteur commande de vrais panneaux (`controlsPanels`).
 *
 * Aucun texte en dur : les libellés viennent de `manipulation.level.*`.
 *
 * CONTRAT DOM (e2e) :
 *   [data-manipulation-levels-selector] [role=tab][data-level=beginner|advanced]
 *   [aria-selected] sur l'onglet actif
 */
export default function ManipulationLevelSelector({ levels, value, onChange, labelledBy, idPrefix, controlsPanels = false, className = '' }) {
  const { t } = useTranslation('lesson');
  const ownId = useId();
  const prefix = idPrefix ?? ownId;
  const labelId = labelledBy ?? `${prefix}-label`;

  // Motif « tabs » de l'APG : la flèche change d'onglet ET y porte le focus.
  // Sans le focus, il restait sur l'ancien onglet, passé à tabIndex −1.
  const move = (dir) => {
    const i = levels.indexOf(value);
    const next = levels[(i + dir + levels.length) % levels.length];
    if (!next) return;
    onChange(next);
    document.getElementById(`${prefix}-tab-${next}`)?.focus();
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`} data-manipulation-levels-selector>
      <span id={labelId} className="text-sm font-bold text-slate-700">{t('manipulation.level.label')}</span>
      <div
        role="tablist"
        aria-labelledby={labelId}
        className="inline-flex overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-0.5"
        onKeyDown={(e) => {
          // RTL : la flèche gauche va vers l'onglet dessiné à gauche, donc le SUIVANT.
          if (e.key === 'ArrowLeft') { e.preventDefault(); move(1); }
          if (e.key === 'ArrowRight') { e.preventDefault(); move(-1); }
        }}
      >
        {levels.map((id) => {
          const active = id === value;
          const look = LOOK[id] ?? LOOK.beginner;
          const { Icon } = look;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${prefix}-tab-${id}`}
              aria-selected={active}
              aria-controls={controlsPanels ? `${prefix}-panel-${id}` : undefined}
              tabIndex={active ? 0 : -1}
              data-level={id}
              onClick={() => onChange(id)}
              className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active ? look.active : `bg-transparent ${look.idle}`
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? '' : look.dot}`} aria-hidden="true" />
              {t(`manipulation.level.${id}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
