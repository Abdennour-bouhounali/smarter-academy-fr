import React, { useState } from 'react';
import { Move } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { useModuleEffects } from '../../../../../common/hooks/useModuleEffects';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLine from '../../../../../common/components/NumberLine';
import {
  Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField,
  XPBurst, StepProgressBar, StreakChip, EffectsToggle,
} from '../../../../../common/components/LessonUI';
import { formatFr, parseFr } from '../components/numberUtils';
import { isStepLocked } from '../../../../../common/utils/stepUnlock';

/* ─── Étape 1 : lire une position ────────────────────────────────── */
const LECTURES = [
  {
    min: 0,
    max: 50,
    step: 10,
    labelEvery: 1,
    target: 30,
    explain: "Les graduations vont de 10 en 10 : 0, 10, 20, 30… Le point est sur la 3e graduation après 0.",
  },
  {
    min: 0,
    max: 100000,
    step: 10000,
    labelEvery: 2,
    target: 70000,
    explain:
      'Ici chaque graduation vaut 10 000. Le point est sur la 7e graduation après 0 : 7 × 10 000 = 70 000.',
  },
];

function LirePosition({ item, solved, onSolved, react }) {
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const check = () => {
    const n = parseFr(val);
    const isCorrect = n === item.target;
    react(isCorrect);
    setFb(isCorrect ? 'ok' : 'ko');
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={item.min}
          max={item.max}
          step={item.step}
          labelEvery={item.labelEvery}
          markers={[{ value: item.target, label: solved ? formatFr(item.target) : '?', color: '#dc2626' }]}
          ariaLabel={`Demi-droite graduée de ${formatFr(item.min)} à ${formatFr(item.max)} avec un point à identifier`}
        />
      </div>

      {solved ? (
        <Feedback tone={fb === 'ko' ? 'ko' : 'ok'}>
          {fb === 'ko' && (
            <>
              Ta réponse : <strong className="font-mono">{val || '—'}</strong>. {' '}
            </>
          )}
          Le point repère <strong className="font-mono">{formatFr(item.target)}</strong>. {item.explain}
        </Feedback>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-700">Quel nombre est repéré par le point rouge ?</span>
          <NumberField
            value={val}
            onChange={(v) => {
              setVal(v);
              setFb(null);
            }}
            onEnter={check}
            ariaLabel="Nombre repéré par le point"
            width="w-32"
            size="sm"
          />
          <ValidateButton onClick={check} disabled={!val}>
            OK
          </ValidateButton>
        </div>
      )}
    </div>
  );
}

/* ─── Étape 2 : trouver le pas ───────────────────────────────────── */
const PAS = [
  {
    min: 0,
    max: 1000,
    step: 100,
    labelEvery: 10,
    options: ['1', '10', '100', '1 000'],
    correct: 2,
    explain:
      "Entre 0 et 1 000, il y a 10 intervalles égaux. Chaque intervalle vaut donc 1 000 ÷ 10 = 100. C'est le pas de la graduation.",
  },
  {
    min: 2000,
    max: 2500,
    step: 50,
    labelEvery: 10,
    options: ['5', '50', '100', '500'],
    correct: 1,
    explain: 'Entre 2 000 et 2 500, il y a 10 intervalles : chacun vaut 500 ÷ 10 = 50.',
  },
];

function TrouverLePas({ item, solved, onSolved, react }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState(0);

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={item.min}
          max={item.max}
          step={item.step}
          labelEvery={item.labelEvery}
          height={140}
          ariaLabel={`Demi-droite graduée de ${formatFr(item.min)} à ${formatFr(item.max)}`}
        />
      </div>
      <p className="text-sm font-semibold text-slate-700">Combien vaut une graduation (le « pas ») ?</p>
      <div className="relative">
        <ChoiceGrid
          options={item.options}
          selected={pick}
          onSelect={(i) => {
            setPick(i);
            setRevealed(true);
            const isCorrect = i === item.correct;
            const id = react(isCorrect);
            if (isCorrect) setBurst(id);
            onSolved?.();
          }}
          revealed={revealed}
          correctIndex={item.correct}
          cols={2}
        />
        <XPBurst amount={10} tick={burst} />
      </div>
      {revealed && (
        <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
          {pick !== item.correct && (
            <>
              Bonne réponse : <strong>{item.options[item.correct]}</strong>. {' '}
            </>
          )}
          {item.explain}
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : placer un nombre ─────────────────────────────────── */
const PLACEMENTS = [
  {
    min: 300,
    max: 400,
    step: 10,
    labelEvery: 5,
    target: 370,
    explain:
      "370 = 300 + 70. À partir de 300, il faut avancer de 70, soit 7 graduations de 10 : c'est nettement après la moitié de l'intervalle.",
  },
  {
    min: 4500,
    max: 4600,
    step: 10,
    labelEvery: 5,
    target: 4580,
    explain:
      "4 580 = 4 500 + 80. Il faut avancer de 8 graduations de 10 à partir de 4 500 : le point est tout près de 4 600.",
  },
];

function PlacerNombre({ item, solved, onSolved, react }) {
  const [pos, setPos] = useState(Math.round((item.min + item.max) / 2 / item.step) * item.step);
  const [checked, setChecked] = useState(false);

  const ecart = Math.abs(pos - item.target);
  const isRight = ecart === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-sm text-slate-700 bg-cyan-50 border border-cyan-200 rounded-xl px-4 py-3">
        <Move className="w-4 h-4 mt-0.5 shrink-0 text-cyan-600" aria-hidden="true" />
        <span>
          Fais glisser le curseur pour placer <strong className="font-mono">{formatFr(item.target)}</strong>. Au
          clavier : flèches gauche/droite. La valeur du curseur reste cachée — à toi d'estimer !
        </span>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={item.min}
          max={item.max}
          step={item.step}
          labelEvery={item.labelEvery}
          height={190}
          mode="place"
          value={pos}
          onChange={(v) => {
            if (solved) return;
            setPos(v);
            setChecked(false);
          }}
          snap={item.step}
          revealValue={solved || checked}
          disabled={solved}
          ghost={solved || (checked && !isRight) ? { value: item.target, label: formatFr(item.target) } : null}
          ariaLabel={`Place ${formatFr(item.target)} entre ${formatFr(item.min)} et ${formatFr(item.max)}`}
        />
      </div>

      {!solved && (
        <ValidateButton
          onClick={() => {
            setChecked(true);
            react(isRight);
            onSolved?.();
          }}
          tone="indigo"
        >
          Valider ma position
        </ValidateButton>
      )}

      {(checked || solved) && !isRight && (
        <Feedback tone="ko">
          Tu as placé le curseur sur <strong className="font-mono">{formatFr(pos)}</strong>, soit un écart de{' '}
          <strong className="font-mono">{formatFr(ecart)}</strong> avec la cible (repère vert). {item.explain}
        </Feedback>
      )}

      {(checked || solved) && isRight && (
        <Feedback tone="ok">
          Position exacte ! {item.explain}
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 4 : l'écart entre deux points ────────────────────────── */
const ECART = {
  min: 0,
  max: 5000,
  step: 500,
  labelEvery: 2,
  a: 1500,
  b: 4000,
  options: ['5 graduations, soit 2 500', '5 graduations, soit 500', '2 graduations, soit 1 000', '3 graduations, soit 1 500'],
  correct: 0,
  explain:
    'Le pas vaut 500. Entre 1 500 et 4 000, il y a 5 graduations : 5 × 500 = 2 500. Sur une demi-droite graduée, une distance se lit en comptant les graduations.',
};

export default function Module08DroiteGraduee() {
  const navLinks = getNavLinks(8);
  const { isModuleCompleted } = useProgress(MODULE_CTX.lessonId);
  const alreadyCompleted = isModuleCompleted('8');
  const { effectsEnabled, toggleEffects, streak, react } = useModuleEffects();

  const [lecturesDone, setLecturesDone] = useState([]);
  const [pasDone, setPasDone] = useState([]);
  const [placementsDone, setPlacementsDone] = useState([]);
  const [ecartPick, setEcartPick] = useState(null);
  const [ecartRevealed, setEcartRevealed] = useState(false);
  const [ecartBurst, setEcartBurst] = useState(0);

  const s1 = lecturesDone.length === LECTURES.length;
  const s2 = pasDone.length === PAS.length;
  const s3 = placementsDone.length === PLACEMENTS.length;
  const s4 = ecartRevealed;
  const allDone = alreadyCompleted || (s1 && s2 && s3 && s4);
  const doneCount = [s1, s2, s3, s4].filter(Boolean).length;

  const mark = (setter, i) => setter((d) => (d.includes(i) ? d : [...d, i]));

  const incompleteSteps = [
    !s1 && { num: 1, title: "Lire la position d'un point" },
    !s2 && { num: 2, title: 'Trouver le pas de la graduation' },
    !s3 && { num: 3, title: 'Place le nombre au bon endroit' },
    !s4 && { num: 4, title: 'Quel écart sépare les deux points ?' },
  ].filter(Boolean);

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="La demi-droite graduée"
      moduleSubtitle="Chaque nombre a UNE place sur la droite. Plus on va à droite, plus le nombre est grand."
      moduleNumber={8}
      estimatedTime="12 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
      incompleteSteps={incompleteSteps}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {!allDone && <StepProgressBar doneCount={doneCount} total={4} />}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <StreakChip count={streak} />
          <EffectsToggle enabled={effectsEnabled} onToggle={toggleEffects} />
        </div>

        <MissionBrief tag="📏 Repérage" title="Un nombre, une position. Une position, un nombre.">
          <p>
            Sur une demi-droite graduée, on part de 0 et on avance toujours du même pas. Savoir lire ce pas, c'est
            savoir lire n'importe quelle position.
          </p>
        </MissionBrief>

        <StepCard num={1} title="Lire la position d'un point" done={s1}>
          <div className="space-y-8">
            {LECTURES.map((item, i) =>
              i === 0 || lecturesDone.includes(i - 1) ? (
                <LirePosition
                  key={item.target}
                  item={item}
                  solved={lecturesDone.includes(i)}
                  onSolved={() => mark(setLecturesDone, i)}
                  react={react}
                />
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard
          num={2}
          title="Trouver le pas de la graduation"
          subtitle="Le pas, c'est la valeur d'un intervalle entre deux graduations voisines."
          done={s2}
          locked={isStepLocked(alreadyCompleted, !s1)}
        >
          <div className="space-y-8">
            {PAS.map((item, i) =>
              i === 0 || pasDone.includes(i - 1) ? (
                <TrouverLePas
                  key={`${item.min}-${item.max}`}
                  item={item}
                  solved={pasDone.includes(i)}
                  onSolved={() => mark(setPasDone, i)}
                  react={react}
                />
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard
          num={3}
          title="Place le nombre au bon endroit"
          subtitle="Ici, il ne s'agit plus de lire : il faut estimer une grandeur."
          done={s3}
          locked={isStepLocked(alreadyCompleted, !s2)}
        >
          <div className="space-y-8">
            {PLACEMENTS.map((item, i) =>
              i === 0 || placementsDone.includes(i - 1) ? (
                <PlacerNombre
                  key={item.target}
                  item={item}
                  solved={placementsDone.includes(i)}
                  onSolved={() => mark(setPlacementsDone, i)}
                  react={react}
                />
              ) : null
            )}
          </div>
        </StepCard>

        <StepCard num={4} title="Quel écart sépare les deux points ?" done={s4} locked={isStepLocked(alreadyCompleted, !s3)}>
          <div className="space-y-3">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
              <NumberLine
                min={ECART.min}
                max={ECART.max}
                step={ECART.step}
                labelEvery={ECART.labelEvery}
                markers={[
                  { value: ECART.a, label: 'A', color: '#dc2626' },
                  { value: ECART.b, label: 'B', color: '#2563eb' },
                ]}
                ariaLabel="Deux points A et B sur une demi-droite graduée"
              />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Combien de graduations séparent A et B, et quel écart cela représente-t-il ?
            </p>
            <div className="relative">
              <ChoiceGrid
                options={ECART.options}
                selected={ecartPick}
                onSelect={(i) => {
                  setEcartPick(i);
                  setEcartRevealed(true);
                  const isCorrect = i === ECART.correct;
                  const id = react(isCorrect);
                  if (isCorrect) setEcartBurst(id);
                }}
                revealed={ecartRevealed}
                correctIndex={ECART.correct}
                cols={2}
              />
              <XPBurst amount={10} tick={ecartBurst} />
            </div>
            {ecartRevealed && (
              <Feedback tone={ecartPick === ECART.correct ? 'ok' : 'ko'}>
                {ecartPick !== ECART.correct && (
                  <>
                    Bonne réponse : <strong>{ECART.options[ECART.correct]}</strong>. {' '}
                  </>
                )}
                {ECART.explain}
              </Feedback>
            )}
            {s4 && (
              <Feedback tone="info">
                Retiens : sur la droite graduée, <strong>plus on va vers la droite, plus le nombre est grand</strong>.
                Comparer deux nombres, c'est regarder lequel est le plus à droite.
              </Feedback>
            )}
          </div>
        </StepCard>

      </div>
    </ModuleLayout>
  );
}
