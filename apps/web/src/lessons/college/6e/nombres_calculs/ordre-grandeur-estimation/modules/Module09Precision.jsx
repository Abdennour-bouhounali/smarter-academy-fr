import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Étape 1 : choisir le bon ordre de grandeur ─────────────────── */
const ORDRE_Q = {
  q: 'Combien coûteront environ 98 objets à 2 € chacun ?',
  options: ['≈ 20 €', '≈ 200 €', '≈ 2 000 €'],
  correct: 1,
  explain: '98 ≈ 100, donc 100 × 2 = 200 €. Les deux autres réponses se trompent d\'un facteur 10 : ce sont des erreurs d\'ordre de grandeur, faciles à repérer en comparant les échelles.',
};

/* ─── Étape 2 : quand l'estimation suffit-elle ? ─────────────────── */
const SITUATIONS = [
  { text: 'Combien de personnes, à peu près, dans ce stade de 40 000 places ?', options: ['Un ordre de grandeur suffit', 'Il faut une valeur exacte'], correct: 0,
    explain: 'Pour une foule, personne ne compte une par une : un ordre de grandeur (« environ 35 000 ») est suffisant et utile.' },
  { text: 'Combien dois-tu payer exactement à la caisse du magasin ?', options: ['Un ordre de grandeur suffit', 'Il faut une valeur exacte'], correct: 1,
    explain: 'Pour payer, il faut le prix exact au centime près : une estimation ne suffit pas, même si elle aide à vérifier que le total affiché est cohérent.' },
  { text: "Combien de temps dure approximativement le trajet en bus jusqu'à l'école ?", options: ['Un ordre de grandeur suffit', 'Il faut une valeur exacte'], correct: 0,
    explain: 'Pour s\'organiser, « environ 20 minutes » suffit largement.' },
  { text: 'Quelle dose de médicament donner à un patient ?', options: ['Un ordre de grandeur suffit', 'Il faut une valeur exacte'], correct: 1,
    explain: 'Une dose de médicament doit être exacte : une approximation peut être dangereuse.' },
];

function SituationsQuiz({ solved, onSolved }) {
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const allAnswered = Object.keys(answers).length === SITUATIONS.length;
  const allRight = SITUATIONS.every((s, i) => answers[i] === s.correct);

  return (
    <div className="space-y-4">
      {SITUATIONS.map((s, i) => (
        <div key={s.text} className="space-y-2 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
          <p className="text-sm font-semibold text-slate-700">{s.text}</p>
          <ChoiceGrid
            options={s.options}
            selected={answers[i] ?? null}
            onSelect={(idx) => { setChecked(false); setAnswers((a) => ({ ...a, [i]: idx })); }}
            revealed={checked}
            correctIndex={s.correct}
            cols={2}
          />
          {checked && <p className="text-xs text-slate-500">{s.explain}</p>}
        </div>
      ))}
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (allRight) onSolved?.(); }} disabled={!allAnswered}>
            Vérifier
          </ValidateButton>
        </div>
      )}
      {solved && (
        <Feedback tone="info">
          La règle : <strong>demande-toi toujours « quelle précision est nécessaire ici ? »</strong> avant de
          décider si une estimation suffit ou si un calcul exact est indispensable.
        </Feedback>
      )}
    </div>
  );
}

export default function Module09Precision() {
  const navLinks = getNavLinks(9);
  const [ordrePick, setOrdrePick] = useState(null);
  const [ordreRevealed, setOrdreRevealed] = useState(false);
  const [sitDone, setSitDone] = useState(false);

  const s1 = ordreRevealed && ordrePick === ORDRE_Q.correct;
  const s2 = sitDone;
  const allDone = s1 && s2;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Choisir le bon niveau de précision"
      moduleSubtitle="Un ordre de grandeur suffit-il, ou faut-il une valeur exacte ?"
      moduleNumber={9}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="🎯 Précision" title="Toutes les situations n'exigent pas la même précision.">
          <p>Parfois « à peu près » suffit. Parfois, seule la valeur exacte convient. Apprends à faire la différence.</p>
        </MissionBrief>

        <StepCard num={1} title="Le bon ordre de grandeur" done={s1}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{ORDRE_Q.q}</p>
            <ChoiceGrid options={ORDRE_Q.options} selected={ordrePick} onSelect={setOrdrePick} revealed={ordreRevealed} correctIndex={ORDRE_Q.correct} cols={3} />
            {!ordreRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setOrdreRevealed(true)} disabled={ordrePick === null}>Valider</ValidateButton>
              </div>
            )}
            {ordreRevealed && (
              <Feedback tone={ordrePick === ORDRE_Q.correct ? 'ok' : 'ko'}>
                {ORDRE_Q.explain}
                {ordrePick !== ORDRE_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setOrdreRevealed(false); setOrdrePick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        <StepCard num={2} title="Estimation ou valeur exacte ?" done={s2} locked={!s1}>
          <SituationsQuiz solved={sitDone} onSolved={() => setSitDone(true)} />
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
