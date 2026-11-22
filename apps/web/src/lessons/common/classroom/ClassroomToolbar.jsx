import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Presentation, Minimize2, Minus, Plus, Flashlight } from 'lucide-react';
import { ChevronBack, ChevronForward, ChevronsBack, ChevronsForward } from '../../../components/common/DirectionalIcons';
import { SCALE_STEPS, scalePercent } from './classroomFit';
import { POINTER_SIZES } from './classroomPointer';

/**
 * Un bouton de la barre de présentation : ≥ 44 px, bordure épaisse, focus
 * visible — le langage des boutons de manipulation (ManipulationTeacherMode),
 * en un peu plus grand parce qu'on le vise depuis le tableau.
 */
function ToolbarButton({ onClick, disabled, children, tone = 'slate', ariaLabel, title, pressed, className = '', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-pressed={pressed}
      title={title}
      // Les `data-*` du contrat DOM (e2e) passent par ici : sans ce
      // rest, un bouton nommé `data-classroom-nav-unit` sortait anonyme.
      {...rest}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-40 ${
        tone === 'primary'
          ? 'border-indigo-700 bg-indigo-600 text-white hover:bg-indigo-700'
          : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-400 hover:text-indigo-800'
      } ${className}`}
    >
      {children}
    </button>
  );
}

/**
 * La BARRE D'OUTILS du mode classe (brief §8) — une barre de bord, pas un
 * bandeau flottant : elle réserve sa hauteur, le contenu ne passe jamais
 * dessous.
 *
 *   [🎓 Mode classe · titre]                [−  Taille de l’affichage 110 %  +]
 *
 * LA SORTIE N'EST PAS ICI. « Quitter » vit au BAS de l'écran, sous « Suivant »,
 * dans la barre de navigation (ClassroomNav) : la main de l'enseignant y est
 * déjà pour avancer, et rien ne l'oblige à remonter en haut de l'écran
 * devant une classe. Échap reste le raccourci clavier.
 *
 * Elle ne connaît ni le plein écran ni le contenu : ClassroomPresentation
 * lui passe l'état et les gestes. `slot` accueille les commandes futures
 * d'un contenu (étapes de révélation, §15) sans qu'on touche à la barre.
 */
const ClassroomToolbar = forwardRef(function ClassroomToolbar({ title, scope, scale, onScaleStep, slot, onExit, pointer }, ref) {
  const { t } = useTranslation('lesson');
  const atMin = scale <= SCALE_STEPS[0];
  const atMax = scale >= SCALE_STEPS[SCALE_STEPS.length - 1];
  // Le badge dit CE QU'ON PRÉSENTE (« Étape », « Exercice », « Manipulation »),
  // pas le geste pour y entrer : depuis que le déclencheur du module dit
  // « Projeter » tout court, réutiliser son libellé aurait donné un badge muet.
  const badge = scope && scope !== 'lesson' ? t(`classroom.scopeLabel.${scope}`) : t('classroom.title');

  return (
    <div ref={ref} className="sa-classroom-toolbar" data-classroom-toolbar role="toolbar" aria-label={t('classroom.title')}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-indigo-200 bg-white px-3 py-1.5 text-sm font-extrabold text-indigo-800">
          <Presentation className="h-4 w-4" aria-hidden="true" />
          {badge}
        </span>
        {title && (
          <span className="truncate text-base font-bold text-slate-800 sm:text-lg" data-classroom-title data-classroom-scope-label={scope}>
            {title}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {slot}

        {pointer && <PointerControls pointer={pointer} />}

        <div className="inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white/80 p-1" role="group" aria-label={t('classroom.scale')}>
          <ToolbarButton onClick={() => onScaleStep(-1)} disabled={atMin} ariaLabel={t('classroom.scaleDown')} title={t('classroom.scaleDown')} className="border-transparent">
            <Minus className="h-5 w-5" aria-hidden="true" />
          </ToolbarButton>
          <span className="hidden min-w-[6.5rem] select-none text-center text-xs font-bold text-slate-600 sm:inline" aria-live="polite">
            {t('classroom.scale')} <span className="font-mono text-slate-900">{scalePercent(scale)} %</span>
          </span>
          <span className="min-w-[3rem] select-none text-center font-mono text-xs font-bold text-slate-900 sm:hidden" aria-live="polite">
            {scalePercent(scale)} %
          </span>
          <ToolbarButton onClick={() => onScaleStep(+1)} disabled={atMax} ariaLabel={t('classroom.scaleUp')} title={t('classroom.scaleUp')} className="border-transparent">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </ToolbarButton>
        </div>

        {/* « Quitter » — EN HAUT, au bout de la barre d'outils. Il était sous
            « Suivant », au bas de l'écran : la main y était déjà pour
            naviguer, mais il fallait la descendre pour SORTIR, et sur un
            tableau interactif le bas de l'écran est le plus bas atteignable.
            Ici il est avec les autres commandes de la SÉANCE (l'échelle),
            et jamais mêlé aux pas du contenu. Échap reste le raccourci. */}
        {onExit && (
          <ToolbarButton
            onClick={onExit}
            tone="primary"
            ariaLabel={t('classroom.exitAria')}
            title={t('classroom.exitHint')}
            data-classroom-exit
          >
            <Minimize2 className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">{t('classroom.exit')}</span>
          </ToolbarButton>
        )}
      </div>
    </div>
  );
});

export default ClassroomToolbar;

/**
 * « 🔴 Pointeur » — le pointeur de classe (ClassroomPointer.jsx). Éteint, un
 * seul bouton ; allumé, il dit « Pointeur activé » et offre la taille
 * (Petit · Moyen · Grand, grande par défaut) et l'éclairage. P / Maj+P au
 * clavier. Absent sous 640 px : un pointeur de projecteur n'a pas de sens
 * sur un téléphone, et la barre y garde toute sa place pour le contenu.
 */
function PointerControls({ pointer }) {
  const { t } = useTranslation('lesson');
  const { on, size, spotlight, onToggle, onSize, onSpotlight } = pointer;
  return (
    <div className="hidden sm:inline-flex items-center gap-1 rounded-2xl border-2 border-slate-200 bg-white/80 p-1" role="group" aria-label={t('classroom.pointer.label')} data-classroom-pointer-controls>
      <ToolbarButton
        onClick={onToggle}
        pressed={on}
        ariaLabel={on ? t('classroom.pointer.toggleOff') : t('classroom.pointer.toggleOn')}
        title={t('classroom.pointer.hint')}
        className="sa-classroom-pointer-toggle border-transparent"
        data-classroom-pointer-toggle
      >
        <span className="sa-classroom-pointer-dot" aria-hidden="true" />
        <span className="hidden md:inline">{on ? t('classroom.pointer.active') : t('classroom.pointer.label')}</span>
      </ToolbarButton>
      {on && (
        <>
          <span className="hidden items-center gap-0.5 sm:inline-flex" role="radiogroup" aria-label={t('classroom.pointer.size')}>
            {POINTER_SIZES.map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={size === key}
                onClick={() => onSize(key)}
                aria-label={t('classroom.pointer.sizeAria', { size: t(`classroom.pointer.sizes.${key}`) })}
                title={t('classroom.pointer.sizeAria', { size: t(`classroom.pointer.sizes.${key}`) })}
                className={`inline-flex min-h-[44px] min-w-[40px] items-center justify-center rounded-xl text-xs font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${size === key ? 'bg-red-600 text-white' : 'text-slate-700 hover:bg-red-50'}`}
                data-classroom-pointer-size={key}
              >
                {t(`classroom.pointer.sizes.${key}`)}
              </button>
            ))}
          </span>
          <ToolbarButton
            onClick={onSpotlight}
            pressed={spotlight}
            ariaLabel={spotlight ? t('classroom.pointer.spotlightOff') : t('classroom.pointer.spotlightOn')}
            title={`${t('classroom.pointer.spotlightOn')} (Shift+P)`}
            className={`border-transparent ${spotlight ? 'bg-amber-100 text-amber-900 hover:bg-amber-100' : ''}`}
            data-classroom-spotlight-toggle
          >
            <Flashlight className="h-5 w-5" aria-hidden="true" />
            <span className="hidden xl:inline">{t('classroom.pointer.spotlight')}</span>
          </ToolbarButton>
        </>
      )}
    </div>
  );
}

/**
 * La navigation du bas de présentation (brief §16). Deux ÉCHELLES de pas,
 * côte à côte, parce qu'un enseignant a les deux besoins :
 *
 *   [◀◀ Étape précédente] [◀ Précédent]      [Suivant ▶] [Étape suivante ▶▶]
 *          saut d'étape     pas d'unité          pas d'unité  saut d'étape
 *
 * `onPrevious`/`onNext` avancent d'une UNITÉ (la mission, le laboratoire,
 * une étape…) et franchissent le bord du module quand il n'y a plus d'unité.
 * `onPreviousModule`/`onNextModule` sautent AU MODULE voisin sans traverser
 * ses unités — « on a assez travaillé l’activité, passons aux connaissances ».
 *
 * Chaque geste absent ne rend AUCUN bouton (jamais de bouton mort) ; les
 * doubles chevrons distinguent d'un coup d'œil le saut du pas. Les sauts de
 * module portent en plus le numéro de l'étape visée (« Étape 3 ») : on sait où
 * l'on va avant de cliquer.
 *
 * « Quitter » n'est PLUS ici : il est remonté dans la BARRE D'OUTILS DU HAUT,
 * avec les commandes de la séance (l'échelle). Cette barre-ci ne porte donc
 * que les pas du CONTENU — on ne ferme plus la séance en visant « Suivant ».
 *
 * Conséquence : la barre du bas peut maintenant être VIDE (une unité seule,
 * sans voisin). Elle ne porte plus la sortie, donc plus rien n'oblige à la
 * rendre coûte que coûte.
 */
export const ClassroomNav = forwardRef(function ClassroomNav({
  onPrevious, onNext, previousLabel, nextLabel,
  onPreviousModule, onNextModule, previousModuleLabel, nextModuleLabel,
}, ref) {
  const { t } = useTranslation('lesson');
  return (
    <div ref={ref} className="sa-classroom-nav" data-classroom-nav>
      <div className="sa-classroom-nav__side">
        {onPreviousModule && (
          <ToolbarButton
            onClick={onPreviousModule}
            ariaLabel={t('classroom.previousModuleAria')}
            title={t('classroom.previousModuleAria')}
            className="sa-classroom-nav__module"
            data-classroom-nav-module="previous"
          >
            <ChevronsBack className="h-5 w-5" aria-hidden="true" />
            <span className="sa-classroom-nav__label">{previousModuleLabel || t('classroom.previousModule')}</span>
          </ToolbarButton>
        )}
        {onPrevious && (
          <ToolbarButton onClick={onPrevious} ariaLabel={previousLabel || t('classroom.previous')} data-classroom-nav-unit="previous">
            <ChevronBack className="h-5 w-5" aria-hidden="true" />
            <span className="sa-classroom-nav__label">{previousLabel || t('classroom.previous')}</span>
          </ToolbarButton>
        )}
      </div>
      <div className="sa-classroom-nav__side sa-classroom-nav__side--end">
        {onNext && (
          <ToolbarButton onClick={onNext} tone="primary" ariaLabel={nextLabel || t('classroom.next')} data-classroom-nav-unit="next">
            <span className="sa-classroom-nav__label">{nextLabel || t('classroom.next')}</span>
            <ChevronForward className="h-5 w-5" aria-hidden="true" />
          </ToolbarButton>
        )}
        {onNextModule && (
          <ToolbarButton
            onClick={onNextModule}
            ariaLabel={t('classroom.nextModuleAria')}
            title={t('classroom.nextModuleAria')}
            className="sa-classroom-nav__module"
            data-classroom-nav-module="next"
          >
            <span className="sa-classroom-nav__label">{nextModuleLabel || t('classroom.nextModule')}</span>
            <ChevronsForward className="h-5 w-5" aria-hidden="true" />
          </ToolbarButton>
        )}
      </div>

    </div>
  );
});
