import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EstimateInput from '../components/EstimateInput';

/* ─── Étape 1 : deux stratégies pour la même somme ───────────────── */
const STRATEGIES_Q = {
  q: 'Pour estimer 347 + 251, deux élèves arrondissent différemment : 350 + 250 = 600, et 300 + 300 = 600. Que penses-tu de leurs deux réponses ?',
  options: [
    'Une seule est correcte, il faut toujours arrondir à la dizaine',
    'Les deux sont acceptables : elles donnent le même ordre de grandeur par des chemins différents',
  ],
  correct: 1,
  explain: "Il n'y a pas UNE seule bonne façon d'arrondir. Les deux stratégies donnent un résultat proche du vrai calcul (598) : les deux sont de bonnes estimations.",
};

/* ─── Étape 2 : à toi de jouer ────────────────────────────────────── */
const SOMMES = [
  { a: 347, b: 251, exact: 598, min: 550, max: 650 },
  { a: 512, b: 289, exact: 801, min: 750, max: 850 },
];

/* ─── Étape 3 : reconnaissance rapide ────────────────────────────── */
const RECO = [
  { q: '523 + 468 ≈ ?', options: ['100', '1 000', '10 000'], correct: 1, explain: '523 ≈ 500 et 468 ≈ 500 : 500 + 500 = 1 000.' },
  { q: '89 + 76 ≈ ?', options: ['17', '170', '1 700'], correct: 1, explain: '89 ≈ 90 et 76 ≈ 80 : 90 + 80 = 170.' },
];

export default function Module04Somme() {
  const navLinks = getNavLinks(4);
  const [stratPick, setStratPick] = useState(null);
  const [stratRevealed, setStratRevealed] = useState(false);
  const [sommesDone, setSommesDone] = useState([]);
  const [recoDone, setRecoDone] = useState([]);

  const s1 = stratRevealed && stratPick === STRATEGIES_Q.correct;
  const s2 = sommesDone.length === SOMMES.length;
  const s3 = recoDone.length === RECO.length;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Ordre de grandeur d'une somme"
      moduleSubtitle="347 + 251 : plusieurs façons d'arrondir, un seul bon ordre de grandeur."
      moduleNumber={4}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="➕ Somme" title="Il existe plusieurs bonnes façons d'estimer.">
          <p>Ce qui compte, c'est d'arriver à un ordre de grandeur cohérent — pas de suivre une seule méthode imposée.</p>
        </MissionBrief>

        <StepCard num={1} title="Deux stratégies, un même résultat" done={s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{STRATEGIES_Q.q}</p>
            <ChoiceGrid options={STRATEGIES_Q.options} selected={stratPick} onSelect={setStratPick} revealed={stratRevealed} correctIndex={STRATEGIES_Q.correct} cols={1} />
            {!stratRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setStratRevealed(true)} disabled={stratPick === null}>Valider</ValidateButton>
              </div>
            )}
            {stratRevealed && (
              <Feedback tone={stratPick === STRATEGIES_Q.correct ? 'ok' : 'ko'}>
                {STRATEGIES_Q.explain}
                {stratPick !== STRATEGIES_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setStratRevealed(false); setStratPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="À toi d'estimer" done={s2} locked={!s1}>
          <div className="space-y-8">
            {SOMMES.map((s, i) =>
              i === 0 || sommesDone.includes(i - 1) ? (
                <div key={`${s.a}-${s.b}`} className="space-y-2 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <div className="text-center font-mono text-2xl font-extrabold text-slate-800">{s.a} + {s.b}</div>
                  <EstimateInput
                    prompt="Sans calculer exactement, donne un ordre de grandeur."
                    acceptMin={s.min}
                    acceptMax={s.max}
                    exact={s.exact}
                    solved={sommesDone.includes(i)}
                    onSolved={() => setSommesDone((d) => (d.includes(i) ? d : [...d, i]))}
                    hint={`Arrondis chaque nombre à la dizaine ou à la centaine, puis additionne mentalement.`}
                  />
                </div>
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard num={3} title="Reconnaissance rapide" done={s3} locked={!s2}>
          <div className="space-y-6">
            {RECO.map((item, i) => (
              <RecoItem key={item.q} item={item} solved={recoDone.includes(i)} onSolved={() => setRecoDone((d) => (d.includes(i) ? d : [...d, i]))} />
            ))}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}

function RecoItem({ item, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
      <p className="text-sm font-semibold text-slate-700 font-mono">{item.q}</p>
      <ChoiceGrid options={item.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={item.correct} cols={3} />
      {!revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === item.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
          {item.explain}
          {!solved && pick !== item.correct && (
            <>
              {' '}
              <button type="button" onClick={() => { setRevealed(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}
