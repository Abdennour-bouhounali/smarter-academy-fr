import React, { useState } from 'react';
import { ScrollText, GitCompareArrows } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProofStrip from '../components/ProofStrip';
import { PROOF_STEPS, checkProof, kindFromSides } from '../components/pythagoreUtils';

/**
 * Module 6 — FORMALISATION : le théorème et sa réciproque.
 *
 * Activity              assembler une démonstration de la réciproque.
 * Mathematical objective distinguer les deux sens du théorème — ce qu'on
 *                       SUPPOSE et ce qu'on CONCLUT.
 * Student action        taper les étapes dans l'ordre.
 * Misconception ciblée   écrire « d'après le théorème de Pythagore… » alors
 *                       qu'on cherche justement à prouver que le triangle est
 *                       rectangle : c'est supposer ce qu'on veut démontrer.
 *                       C'est le distracteur `piege-direct`.
 * Feedback              on situe la ligne où le raisonnement dévie.
 * Escape hatch          après 3 essais, la rédaction est révélée et l'étape
 *                       est validée.
 */
export default function Module06DirectEtReciproque() {
  const KEY = 'reciproque';
  const { steps: cards, enonce } = PROOF_STEPS[KEY];

  const [chosen, setChosen] = useState([]);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const result = checkProof(chosen, KEY);
  const complete = chosen.length === PROOF_STEPS[KEY].correct.length;
  const done1 = (complete && result.ok) || revealed;

  const [q2, setQ2] = useState(false);

  const pick = (id, react) => {
    const next = [...chosen, id];
    setChosen(next);
    if (next.length === PROOF_STEPS[KEY].correct.length) {
      setTries((t) => t + 1);
      react(checkProof(next, KEY).ok);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Démontrer qu’un triangle est rectangle',
      subtitle: 'Quatre étapes, dans l’ordre.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="reciproque-pythagore"
            variant="new"
            lead="Cette fois l’angle droit n’est pas donné : c’est lui qu’il faut prouver. Voici la marche à suivre."
          />
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-800">{enonce}</p>
          </div>
          <ProofStrip
            steps={cards}
            chosen={chosen}
            onPick={(id) => pick(id, kit.react)}
            onUndo={() => setChosen((c) => c.slice(0, -1))}
            firstWrong={complete && !result.ok ? result.firstWrong : -1}
            locked={done1}
            revealed={done1}
          />
          {done1 && (
            <Feedback tone="ok">
              {revealed
                ? 'Rédaction révélée. Note bien : on calcule les DEUX membres séparément, avant de les comparer.'
                : 'Rédaction correcte. On ne suppose jamais que le triangle est rectangle : on calcule les deux membres, on les compare, et c’est la comparaison qui permet de conclure.'}
            </Feedback>
          )}
          {complete && !result.ok && !done1 && (
            <div className="space-y-2">
              <Feedback tone="ko">
                Le raisonnement dévie à la ligne {result.firstWrong + 1}. Attention au piège :
                commencer par « d’après le théorème de Pythagore » revient à supposer que le
                triangle est rectangle — ce qu’on cherche justement à établir.
              </Feedback>
              <button
                type="button"
                onClick={() => setChosen([])}
                className="text-sm px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 min-h-[44px]"
              >
                Recommencer la rédaction
              </button>
            </div>
          )}
          {tries >= 3 && !done1 && (
            <button
              type="button"
              onClick={() => { setChosen(PROOF_STEPS[KEY].correct); setRevealed(true); }}
              className="text-sm px-4 py-2 rounded-lg bg-amber-100 hover:bg-amber-200
                         text-amber-900 font-semibold min-h-[44px]"
            >
              Je ne trouve pas — montre-moi
            </button>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux sens à ne pas confondre',
      done: q2,
      content: (
        <div className="space-y-3">
        <TapQuestion
          prompt="Dans quel cas utilise-t-on la RÉCIPROQUE du théorème de Pythagore ?"
          options={[
            'Quand on connaît les trois longueurs et qu’on veut savoir si le triangle est rectangle',
            'Quand on sait que le triangle est rectangle et qu’on cherche une longueur',
            'Quand on veut calculer une aire',
            'Quand le triangle est isocèle',
          ]}
          correct={0}
          cols={1}
          explain="Le théorème DIRECT part de l’angle droit pour calculer une longueur. La RÉCIPROQUE part des trois longueurs pour établir l’angle droit. Le sens de la déduction est inversé : ce qu’on suppose et ce qu’on conclut s’échangent."
          explainWrong="Attention : si tu SAIS déjà que le triangle est rectangle, c’est le théorème direct qui s’applique. La réciproque sert quand l’angle droit est justement la chose à prouver."
          requires={['reciproque-pythagore', 'theoreme-pythagore']}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
        {q2 && (
          <KnowledgeBrick
            id="choisir-direct-ou-reciproque"
            variant="new"
            compact
            lead="Retiens le critère qui tranche à chaque fois."
          />
        )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Direct et réciproque"
      moduleSubtitle="Deux sens, deux usages"
      estimatedTime="10 min"
      brief={{
        tag: 'Formalisation',
        title: 'Écrire une démonstration',
        tone: 'blue',
        body: (
          <p>
            Tu as vu au module 3 que l’égalité des aires et l’angle droit vont toujours ensemble.
            Cette équivalence se rédige de deux façons, selon ce qu’on connaît.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 space-y-2">
          <div className="flex gap-2 items-center">
            <GitCompareArrows className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <p className="font-bold text-blue-900">Les deux sens</p>
          </div>
          <ul className="text-sm text-blue-900 space-y-1.5 list-disc pl-5">
            <li>
              <strong>Théorème direct</strong> — je SAIS que le triangle est rectangle, donc{' '}
              <MathText>{'$BC^{2} = AB^{2} + AC^{2}$'}</MathText>. Sert à calculer une longueur.
            </li>
            <li>
              <strong>Réciproque</strong> — je constate que{' '}
              <MathText>{'$BC^{2} = AB^{2} + AC^{2}$'}</MathText>, donc le triangle EST rectangle.
              Sert à démontrer un angle droit.
            </li>
            <li>
              Si les deux membres sont <strong>différents</strong>, le triangle n’est pas
              rectangle : c’est la contraposée.
            </li>
          </ul>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Direct ou réciproque, tu sais trancher. Voyons cela sur de
          vraies situations.
        </KnowledgeSnapshot>
      )}
    />
  );
}
