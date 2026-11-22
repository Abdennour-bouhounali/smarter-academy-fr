import { useTranslation } from 'react-i18next';
import { Lock, PencilRuler, Users } from 'lucide-react';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { LAB_SCOPES, commonTools, isCommonTool, toolCapabilities, toolsForScope } from '../labScope';
import { LAB_META } from '../home/labMeta';
import '../mathlab.css';

/**
 * LE SÉLECTEUR : choisir l'instrument, sans quitter la leçon.
 *
 * C'est l'ACCUEIL DU مختبر (`home/MathLabHome.jsx`), rendu dans le calque :
 * même sur-titre (PencilRuler + « eyebrow »), même titre, même sous-titre,
 * même grille `.sa-ml-cards` (1 colonne, 2 dès 640 px, 3 dès 1280 px) et des
 * cartes copiées sur `home/ToolCard.jsx` — pastille d'icône bleue, nom,
 * description, et l'appel à l'action « … جديد » avec sa flèche.
 *
 * Une seule différence, et elle est nécessaire : ce sont des BOUTONS, pas
 * des `<Link>`. Choisir ici ne navigue pas — cela change ce que le calque
 * affiche. Un lien quitterait la leçon, ce que tout ce dispositif existe
 * pour éviter. Le reste doit être indiscernable de la vraie page : l'élève
 * qui connaît le مختبر doit le reconnaître.
 *
 * La COQUILLE est celle de la vraie page, elle aussi : `.sa-page`
 * (20 / 40 / 60 px de marge latérale selon l'écran — index.css) et
 * `py-8 sm:py-10`, comme `home/MathLabHome.jsx`. Le calque n'ajoute AUCUN
 * rembourrage par-dessus : deux systèmes de marges superposés donnaient des
 * cartes plus étroites ici que dans le مختبر, pour le même contenu.
 *
 * Les instruments viennent du REGISTRE (`MATH_LAB_TOOLS`), la seule liste :
 * un instrument de plus apparaît ici sans que ce fichier change. Les
 * instruments seulement ANNONCÉS n'y sont pas — on ne propose pas dans une
 * leçon une porte qui n'ouvre sur rien.
 *
 * ── Les مخابر (MATH_LAB.md §2.1) ─────────────────────────────────────────
 * Comme l'accueil : la سبّورة d'abord, commune à tous, puis les instruments
 * du مخبر choisi — celui de la leçon à l'ouverture (`scope`), et deux
 * onglets pour passer à l'autre sans quitter le calque (`onScope`).
 */
export default function MathLabToolPicker({ tools, onPick, lockedIds = [], scope = 'moyen', onScope = null }) {
  const { t } = useTranslation('mathlab');
  const { t: ta } = useTranslation('access');
  const shown = [...commonTools(tools), ...toolsForScope(tools, scope)];

  return (
    <div className="sa-page py-8 sm:py-10" data-ml-overlay-picker>
      <div className="mb-6">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <PencilRuler size={13} aria-hidden="true" /> {t('eyebrow')}
        </p>
        <h3 className="font-space font-bold text-2xl text-slate-900">{t('title')}</h3>
        <p className="font-inter text-slate-500 text-sm mt-1">{t('overlay.pickHint')}</p>
      </div>

      {onScope && (
        <div className="sa-ml-picker-labs" role="group" aria-label={t('labs.pickLabel')} data-ml-overlay-labs>
          {LAB_SCOPES.map((lab) => {
            const Icon = LAB_META[lab].icon;

            return (
              <button
                key={lab}
                type="button"
                className={`sa-ml-labswitch__item sa-ml-labswitch__item--${lab} sa-ml-picker-labs__item`}
                aria-pressed={lab === scope}
                onClick={() => onScope(lab)}
                data-ml-overlay-lab={lab}
              >
                <Icon size={15} aria-hidden="true" />
                {t(`labs.${lab}.name`)}
              </button>
            );
          })}
        </div>
      )}

      <div className="sa-ml-cards">
        {shown.map((tool) => {
          const Icon = tool.icon;
          const common = isCommonTool(tool);
          const descriptionKey = toolCapabilities(tool, scope)?.descriptionKey ?? tool.descriptionKey;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onPick(tool.id)}
              data-ml-overlay-tool={tool.id}
              data-ml-overlay-tool-scope={common ? 'common' : scope}
              data-ml-tool-locked={lockedIds.includes(tool.id) ? 'true' : undefined}
              className="group flex flex-col gap-3 rounded-2xl border-2 border-slate-200 bg-white p-5 text-start transition-colors hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-nav-accent-soft text-nav-accent">
                  <Icon size={24} aria-hidden="true" />
                </span>
                {lockedIds.includes(tool.id) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-inter text-[11px] font-bold text-amber-800">
                    <Lock size={11} aria-hidden="true" /> {ta('feature.badgePremium')}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-space font-bold text-lg text-slate-900">{t(tool.labelKey)}</span>
                  {common && (
                    <span className="sa-ml-common-badge"><Users size={12} aria-hidden="true" /> {t('labs.commonBadge')}</span>
                  )}
                </span>
                <span className="block font-inter text-sm text-slate-500 mt-1">{t(descriptionKey)}</span>
              </span>
              <span className="mt-auto inline-flex items-center gap-1.5 font-mono-jetbrains text-xs font-bold text-nav-accent group-hover:text-nav-accent">
                {t(tool.newLabelKey)}
                <ArrowForward size={14} aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
