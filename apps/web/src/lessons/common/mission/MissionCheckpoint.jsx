import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KitContext } from '../kit/kitContext';
import { TapQuestion } from '../kit/questions';
import MathText from '../components/MathText';
import MissionScene from './MissionScene';
import { checkpointOrder } from './missionModel';

// Un point d'étape n'est PAS un module : pas d'XP ni d'effets (react → 0 : aucune bulle « +XP »), aucune preuve.
const CHECKPOINT_KIT = { react: () => 0, alreadyCompleted: false, effectsEnabled: false };

/**
 * Le POINT D'ÉTAPE de la mission, posé en arrivant sur un module : une question qui RAPPROCHE de la mission avec
 * l'outil qu'on vient de gagner — sans jamais la résoudre à la place de l'élève. Formatif : la correction s'affiche,
 * rien ne bloque (« لاحقًا » le passe). `onDone(answer)` : l'indice choisi, ou 'skipped'.
 */
export default function MissionCheckpoint({ checkpoint, fill, scene, onDone }) {
  const { t } = useTranslation('lesson');
  const [answer, setAnswer] = useState(null);
  // les choix dans un ordre propre à CE point d'étape (stable d'un rechargement à l'autre) : la bonne réponse n'est pas toujours la première
  const order = checkpointOrder(checkpoint.id, checkpoint.options.length);
  const shown = order.map((i) => checkpoint.options[i]);
  const correctShown = order.indexOf(checkpoint.correct);
  return (
    <div className="space-y-4" data-mission-checkpoint={checkpoint.id}>
      <div className="flex items-center gap-4">
        <MissionScene scene={scene} fill={fill} className="w-40 shrink-0" />
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">{t('mission.checkpointTag')}</p>
          <p className="mt-1 text-sm font-bold text-slate-600">{t('mission.checkpointLead')}</p>
        </div>
      </div>
      <KitContext.Provider value={CHECKPOINT_KIT}>
        <TapQuestion
          prompt={<span className="text-lg font-bold"><MathText>{checkpoint.prompt}</MathText></span>}
          options={shown.map((o) => <MathText key={o}>{o}</MathText>)}
          correctionLabel={<MathText>{checkpoint.options[checkpoint.correct]}</MathText>}
          correct={correctShown}
          cols={1}
          xp={0}
          explain={<MathText>{checkpoint.explain}</MathText>}
          onAnswered={(_ok, i) => setAnswer(order[i])}
        />
      </KitContext.Provider>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {answer == null && (
          <button type="button" onClick={() => onDone('skipped')} className="min-h-[44px] rounded-xl px-4 font-bold text-slate-500 hover:bg-slate-100" data-mission-checkpoint-later>
            {t('mission.later')}
          </button>
        )}
        <button type="button" disabled={answer == null} onClick={() => onDone(answer)} data-mission-checkpoint-next
          className="min-h-[44px] rounded-xl bg-indigo-600 px-6 font-black text-white shadow-sm enabled:hover:bg-indigo-700 disabled:opacity-40">
          {t('mission.next')} <span aria-hidden="true">←</span>
        </button>
      </div>
    </div>
  );
}
