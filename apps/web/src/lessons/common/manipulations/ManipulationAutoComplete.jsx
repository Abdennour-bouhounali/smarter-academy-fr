import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Wand2 } from 'lucide-react';
import { Btn } from './ManipulationTeacherMode';
import { autoCompleteStatus, autoCompletePlan } from './autoComplete';

/**
 * Jouer la complétion automatique : `remaining` gestes canoniques, espacés
 * selon `autoCompletePlan`, puis `finish()` pour garantir l'état final.
 *
 * `step` et `finish` sont des mises à jour FONCTIONNELLES de l'état réel du
 * type (`setLab((s) => …)`), sans effet quand il n'y a plus rien à faire :
 * appelées depuis un minuteur, elles lisent toujours l'état courant — y
 * compris un joueur que l'élève vient de déplacer pendant l'animation.
 *
 * `resetKey` (l'`epoch` de la manipulation) change quand la configuration
 * change ou que l'élève appuie sur « إعادة » : l'animation s'arrête, et
 * aucun geste de l'ancienne configuration n'est appliqué à la nouvelle.
 */
function useAutoComplete(auto, resetKey) {
  const reducedMotion = useReducedMotion();
  const [running, setRunning] = useState(false);
  const timer = useRef(null);
  const autoRef = useRef(auto);
  autoRef.current = auto;
  const keyRef = useRef(resetKey);
  keyRef.current = resetKey;

  const stop = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    setRunning(false);
  }, []);

  useEffect(() => stop, [resetKey, stop]);

  const run = useCallback(() => {
    const a = autoRef.current;
    if (!a || timer.current) return;
    const plan = autoCompletePlan(a.remaining, { reducedMotion, canStep: typeof a.step === 'function', maxTicks: a.maxTicks, intervalMs: a.intervalMs });
    if (plan.ticks === 0) { a.finish(); return; }
    const startKey = keyRef.current;
    let ticked = 0;
    setRunning(true);
    timer.current = setInterval(() => {
      if (keyRef.current !== startKey) { stop(); return; }
      const cur = autoRef.current;
      for (let i = 0; i < plan.perTick; i += 1) cur.step();
      ticked += 1;
      if (ticked >= plan.ticks) { cur.finish(); stop(); }
    }, plan.intervalMs);
  }, [reducedMotion, stop]);

  return { run, running };
}

/**
 * Le bouton élève « compléter automatiquement » (MANIPULATION_CONTRACT §6bis).
 *
 * Secondaire par construction : bordure fine, même taille que « إعادة » et
 * « تلميح », jamais la couleur pleine réservée à « تحقّق ». La manipulation
 * reste le centre de l'écran ; le bouton est une option, pas une consigne.
 *
 * Rendu seulement si le registre accorde la capacité ET si le type fournit
 * la mécanique. Verrouillé (`first-gesture`), il le dit en une ligne : le
 * premier exemple se fait à la main.
 *
 * CONTRAT DOM : [data-manipulation-autocomplete=<status>]
 */
export default function ManipulationAutoComplete({ capability, auto, resetKey }) {
  const { t } = useTranslation('lesson');
  const { run, running } = useAutoComplete(auto, resetKey);
  const status = autoCompleteStatus({ capability, auto, running });
  if (status === 'hidden') return null;
  const label = auto.label || t('manipulation.autoComplete.button');
  // Ce que « la première fois à la main » veut dire pour CE type (« كوّن الفرق
  // الأولى بيدك… ») ; la phrase générique sinon.
  const lockedText = auto.lockedLabel || t('manipulation.autoComplete.locked');
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5" data-manipulation-autocomplete={status}>
      <Btn
        onClick={run}
        disabled={status !== 'ready'}
        title={status === 'locked' ? lockedText : t('manipulation.autoComplete.hint')}
      >
        <Wand2 className="h-4 w-4" aria-hidden="true" /> {label}
      </Btn>
      {status === 'locked' && (
        <span className="text-[11px] font-bold text-slate-600">{lockedText}</span>
      )}
    </span>
  );
}
