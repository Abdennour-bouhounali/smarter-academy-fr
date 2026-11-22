import { useTranslation } from 'react-i18next';
import { RotateCcw, Lightbulb, BookOpen, CheckCircle2 } from 'lucide-react';
import { Btn } from './ManipulationTeacherMode';
import ManipulationAutoComplete from './ManipulationAutoComplete';

/**
 * Les contrôles de l'ÉLÈVE : « إعادة », « تلميح » (tous les indices en entier,
 * affichés par défaut, masquables), « تحقّق » quand le type propose une vérification explicite, et
 * « الشرح » — qui n'apparaît qu'APRÈS la découverte (ou en mode classe) :
 * il redit la règle, il ne doit jamais la donner avant le geste (audit du
 * 2026-09-29 : il l'imprimait dès l'ouverture). L'élève AVANCE en manipulant, jamais avec un bouton « suivant » :
 * celui-là n'existe qu'en mode classe (ManipulationTeacherMode).
 *
 * « Compléter automatiquement » (`ManipulationAutoComplete`) s'ajoute à la
 * rangée seulement si le registre l'accorde au type (`controls.autoComplete`)
 * et que le type en fournit la mécanique (`controller.autoComplete`). Ce n'est
 * pas un « suivant » : il finit un geste RÉPÉTITIF, l'élève garde la main.
 */
export default function ManipulationControls({ state, controls = {}, hints = [], onCheck, checkDisabled = false, autoComplete, game = false }) {
  const { t } = useTranslation('lesson');
  if (game && autoComplete) {
    // LECTEUR, colonne mince (conseil + propriétaire, 2026-11-07) : l'action principale en GRAND, « إعادة » petite et à
    // l'écart (un clic de travers ne doit pas effacer le travail), le reste des commandes inchangé dessous.
    return (
      <div className="space-y-4" data-manipulation-controls data-controls-layout="game">
        <div className="[&_button]:min-h-[60px] [&_button]:w-full [&_button]:justify-center [&_button]:border-indigo-600 [&_button]:bg-indigo-600 [&_button]:text-lg [&_button]:text-white [&_button]:shadow-[0_4px_0_0_#3730A3] [&_button:disabled]:border-slate-200 [&_button:disabled]:bg-slate-100 [&_button:disabled]:text-slate-400 [&_button:disabled]:shadow-none [&_span]:w-full" data-controls-primary>
          <ManipulationAutoComplete capability={controls.autoComplete} auto={autoComplete} resetKey={state.epoch} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {hints.length > 0 && (
            <Btn onClick={state.toggleHints} pressed={state.hintsOpen}>
              <Lightbulb className="h-4 w-4" aria-hidden="true" /> {state.hintsOpen ? t('manipulation.hint.hide') : t('manipulation.hint.show')}
            </Btn>
          )}
          {onCheck && <Btn tone="blue" onClick={onCheck} disabled={checkDisabled} data-manipulation-check><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t('manipulation.check')}</Btn>}
          {controls.toggleExplanation !== false && (state.isDiscovered || state.isClass) && (
            <Btn onClick={state.toggleExplanation} pressed={state.showExplanation}>
              <BookOpen className="h-4 w-4" aria-hidden="true" /> {state.showExplanation ? t('manipulation.hideExplanation') : t('manipulation.showExplanation')}
            </Btn>
          )}
          {controls.reset !== false && (
            <span className="ms-auto"><Btn onClick={state.reset} ariaLabel={t('manipulation.reset')}><RotateCcw className="h-4 w-4" aria-hidden="true" /> {t('manipulation.reset')}</Btn></span>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2" data-manipulation-controls>
      {controls.reset !== false && (
        <Btn onClick={state.reset} ariaLabel={t('manipulation.reset')}><RotateCcw className="h-4 w-4" aria-hidden="true" /> {t('manipulation.reset')}</Btn>
      )}
      {hints.length > 0 && (
        <Btn onClick={state.toggleHints} pressed={state.hintsOpen}>
          <Lightbulb className="h-4 w-4" aria-hidden="true" /> {state.hintsOpen ? t('manipulation.hint.hide') : t('manipulation.hint.show')}
        </Btn>
      )}
      <ManipulationAutoComplete capability={controls.autoComplete} auto={autoComplete} resetKey={state.epoch} />
      {onCheck && (
        <Btn tone="blue" onClick={onCheck} disabled={checkDisabled} data-manipulation-check><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {t('manipulation.check')}</Btn>
      )}
      {controls.toggleExplanation !== false && (state.isDiscovered || state.isClass) && (
        <Btn onClick={state.toggleExplanation} pressed={state.showExplanation}>
          <BookOpen className="h-4 w-4" aria-hidden="true" /> {state.showExplanation ? t('manipulation.hideExplanation') : t('manipulation.showExplanation')}
        </Btn>
      )}
    </div>
  );
}
