import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EstimateInput from '../components/EstimateInput';
import { formatFr } from '../components/estimationUtils';

/* ─── Étape 1 : la distance sur la droite ────────────────────────── */
function DistanceVisuelle({ solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correct = 1;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        798 − 302, c'est la <strong>distance</strong> entre 302 et 798 sur la droite graduée.
      </p>
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={0}
          max={800}
          step={100}
          labelEvery={1}
          height={150}
          format={formatFr}
          markers={[
            { value: 302, label: '≈ 300', color: '#dc2626' },
            { value: 798, label: '≈ 800', color: '#059669' },
          ]}
          ariaLabel="Distance entre 300 et 800"
        />
      </div>
      <p className="text-sm font-semibold text-slate-700">Quelle est, à vue d'œil, cette distance ?</p>
      <ChoiceGrid options={['≈ 100', '≈ 500', '≈ 1 000']} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={3} />
      {!revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === correct ? 'ok' : 'ko'}>
          De 300 à 800, il y a 500 : 800 − 300 = 500. C'est l'ordre de grandeur attendu pour 798 − 302.
          {pick !== correct && (
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

/* ─── Étape 2 : à toi d'estimer ───────────────────────────────────── */
const DIFFS = [
  { a: 803, b: 297, exact: 506, min: 450, max: 550, hint: '800 − 300 = 500.' },
  { a: 651, b: 189, exact: 462, min: 400, max: 500, hint: '650 − 190 ≈ 460, ou 650 − 200 = 450.' },
];

/* ─── Étape 3 : proche de 500 ou de 1000 ? ───────────────────────── */
const CHOIX_Q = {
  q: 'Pour 803 − 297, le résultat exact devrait-il être proche de 500 ou de 1 000 ?',
  options: ['Proche de 500', 'Proche de 1 000'],
  correct: 0,
  explain: '800 − 300 = 500 : le résultat exact (506) est bien proche de 500, pas de 1 000.',
};

export default function Module05Difference() {
  const navLinks = getNavLinks(5);
  const [distDone, setDistDone] = useState(false);
  const [diffsDone, setDiffsDone] = useState([]);
  const [choixPick, setChoixPick] = useState(null);
  const [choixRevealed, setChoixRevealed] = useState(false);

  const s1 = distDone;
  const s2 = diffsDone.length === DIFFS.length;
  const s3 = choixRevealed && choixPick === CHOIX_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Ordre de grandeur d'une différence"
      moduleSubtitle="798 − 302 : la distance entre deux nombres arrondis."
      moduleNumber={5}
      estimatedTime="9 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="➖ Différence" title="Soustraire, c'est mesurer un écart.">
          <p>La droite graduée rend cet écart visible avant même de calculer.</p>
        </MissionBrief>

        <StepCard num={1} title="Vois la distance" done={s1}>
          <DistanceVisuelle solved={distDone} onSolved={() => setDistDone(true)} />
        </StepCard>

        <StepCard num={2} title="À toi d'estimer" done={s2} locked={!s1}>
          <div className="space-y-8">
            {DIFFS.map((d, i) =>
              i === 0 || diffsDone.includes(i - 1) ? (
                <div key={`${d.a}-${d.b}`} className="space-y-2 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <div className="text-center font-mono text-2xl font-extrabold text-slate-800">{d.a} − {d.b}</div>
                  <EstimateInput
                    prompt="Sans calculer exactement, donne un ordre de grandeur."
                    acceptMin={d.min}
                    acceptMax={d.max}
                    exact={d.exact}
                    solved={diffsDone.includes(i)}
                    onSolved={() => setDiffsDone((x) => (x.includes(i) ? x : [...x, i]))}
                    hint={d.hint}
                  />
                </div>
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard num={3} title="Prévoir avant de calculer" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{CHOIX_Q.q}</p>
            <ChoiceGrid options={CHOIX_Q.options} selected={choixPick} onSelect={setChoixPick} revealed={choixRevealed} correctIndex={CHOIX_Q.correct} cols={2} />
            {!choixRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setChoixRevealed(true)} disabled={choixPick === null}>Valider</ValidateButton>
              </div>
            )}
            {choixRevealed && (
              <Feedback tone={choixPick === CHOIX_Q.correct ? 'ok' : 'ko'}>
                {CHOIX_Q.explain}
                {choixPick !== CHOIX_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setChoixRevealed(false); setChoixPick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
