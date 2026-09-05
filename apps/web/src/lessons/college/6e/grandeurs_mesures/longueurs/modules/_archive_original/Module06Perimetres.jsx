import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonPerimeter from '../components/PolygonPerimeter';
import { perimeter, formatLength, parseDec, roundTo } from '../components/lengthUtils';

function TraceRound({ shape, sideLengths, unit, done, onSolved }) {
  const [tapped, setTapped] = useState([]);
  const total = tapped.reduce((s, i) => s + sideLengths[i], 0);
  const allTapped = tapped.length === sideLengths.length;

  const handleTap = (i) => {
    if (done || tapped.includes(i)) return;
    const next = [...tapped, i];
    setTapped(next);
    if (next.length === sideLengths.length) onSolved?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Tape chaque côté, dans l’ordre du contour, pour construire le périmètre.</p>
      <PolygonPerimeter shape={shape} sideLengths={sideLengths} unit={unit} tappedIndices={tapped} onTapSide={handleTap} disabled={done} />
      <div className="text-center font-mono text-lg text-slate-800">
        Périmètre parcouru : <strong>{total} {unit}</strong> {tapped.length > 0 && `(${tapped.length}/${sideLengths.length} côtés)`}
      </div>
      {(allTapped || done) && (
        <Feedback tone="ok">
          Tu as fait le tour complet : périmètre = {sideLengths.join(' + ')} = <strong>{perimeter(sideLengths)} {unit}</strong>.
          Le périmètre, c’est la longueur totale du contour.
        </Feedback>
      )}
    </div>
  );
}

const FORMULE_Q = {
  q: 'Un rectangle a deux côtés de 6 m et deux côtés de 4 m. Pourquoi peut-on écrire 2 × (6 + 4) plutôt que 6 + 4 + 6 + 4 ?',
  options: [
    "Parce que c'est plus court à écrire, peu importe pourquoi",
    'Parce que les côtés opposés sont égaux deux à deux, donc on peut compter chaque longueur deux fois',
  ],
  correct: 1,
  explain:
    "2 × (6 + 4), c'est juste une autre façon d'écrire 6 + 4 + 6 + 4 : comme les côtés opposés d'un rectangle sont égaux, on additionne une fois chaque longueur puis on double.",
};

const COTE_Q = {
  q: 'Un rectangle a un côté de 6 cm. Son périmètre est donc 6 cm.',
  options: ['Vrai', 'Faux : le périmètre additionne TOUS les côtés, pas un seul'],
  correct: 1,
  explain: 'Un seul côté ne représente pas le contour entier. Il faut connaître (ou déduire) la longueur de chaque côté pour calculer le périmètre.',
};

const UNITE_Q = {
  q: 'Le périmètre d’un terrain se mesure en m² (mètres carrés).',
  options: ['Vrai', 'Faux : le périmètre est une longueur, il se mesure en m (ou km, cm…), jamais en m²'],
  correct: 1,
  explain: 'Le périmètre est une longueur (le tour de la figure) : il se mesure toujours avec une unité de longueur simple, jamais au carré.',
};

function MisconceptionMCQ({ item, done, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">{item.q}</p>
      <ChoiceGrid options={item.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={item.correct} cols={1} disabled={done} />
      {!done && !revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === item.correct) onSolved?.(); }} disabled={pick === null}>Valider</ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
          {item.explain}
          {pick !== item.correct && (
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

const CALC_SIDES = [7, 5, 9, 4];
const CALC_UNIT = 'm';

function CalcRound({ done, onSolved }) {
  const [val, setVal] = useState('');
  const [checked, setChecked] = useState(false);
  const expected = perimeter(CALC_SIDES);
  const parsed = parseDec(val);
  const isRight = checked && !Number.isNaN(parsed) && roundTo(parsed, 3) === roundTo(expected, 3);

  return (
    <div className="space-y-3">
      <PolygonPerimeter shape="quad" sideLengths={CALC_SIDES} unit={CALC_UNIT} tappedIndices={[0, 1, 2, 3]} disabled />
      <p className="text-sm font-semibold text-slate-700">Quel est le périmètre de ce terrain ?</p>
      <div className="flex items-center justify-center gap-2">
        <NumberField value={val} onChange={(v) => { setChecked(false); setVal(v); }} ariaLabel="Périmètre en mètres" width="w-32" />
        <span className="font-mono text-sm text-slate-500">{CALC_UNIT}</span>
      </div>
      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); if (!Number.isNaN(parsed) && roundTo(parsed, 3) === roundTo(expected, 3)) onSolved?.(); }} disabled={val === ''}>
            Valider
          </ValidateButton>
        </div>
      )}
      {checked && !isRight && (
        <Feedback tone="hint">Additionne les 4 côtés : {CALC_SIDES.join(' + ')}.{' '}
          <button type="button" onClick={() => { setChecked(false); setVal(''); }} className="underline font-semibold">Réessayer</button>
        </Feedback>
      )}
      {(isRight || done) && (
        <Feedback tone="ok">{CALC_SIDES.join(' + ')} = <strong>{formatLength(expected, CALC_UNIT)}</strong>.</Feedback>
      )}
    </div>
  );
}

export default function Module06Perimetres() {
  const navLinks = getNavLinks(6);
  const [triDone, setTriDone] = useState(false);
  const [rectDone, setRectDone] = useState(false);
  const [formuleDone, setFormuleDone] = useState(false);
  const [coteDone, setCoteDone] = useState(false);
  const [uniteDone, setUniteDone] = useState(false);
  const [calcDone, setCalcDone] = useState(false);

  const s1 = triDone && rectDone;
  const s2 = formuleDone;
  const s3 = coteDone && uniteDone;
  const s4 = calcDone;
  const allDone = s1 && s2 && s3 && s4;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Périmètres"
      moduleSubtitle="Le périmètre, c’est la longueur du contour : en faire le tour, puis calculer."
      moduleNumber={6}
      estimatedTime="11 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        <MissionBrief tag="📋 Mission 06" title="Fais le tour de la figure, un côté à la fois.">
          <p>Avant toute formule, le périmètre, c’est simplement la longueur totale du contour.</p>
        </MissionBrief>

        <StepCard num={1} title="Le tour du triangle, puis du rectangle" done={s1}>
          <div className="space-y-8">
            <TraceRound shape="triangle" sideLengths={[4, 5, 3]} unit="m" done={triDone} onSolved={() => setTriDone(true)} />
            {triDone && <TraceRound shape="rectangle" sideLengths={[6, 4, 6, 4]} unit="m" done={rectDone} onSolved={() => setRectDone(true)} />}
          </div>
        </StepCard>

        <StepCard num={2} title="Une formule pour aller plus vite" done={s2} locked={!s1}>
          <MisconceptionMCQ item={FORMULE_Q} done={formuleDone} onSolved={() => setFormuleDone(true)} />
        </StepCard>

        <StepCard num={3} title="Deux pièges à éviter" done={s3} locked={!s2}>
          <div className="space-y-6">
            <MisconceptionMCQ item={COTE_Q} done={coteDone} onSolved={() => setCoteDone(true)} />
            {coteDone && <MisconceptionMCQ item={UNITE_Q} done={uniteDone} onSolved={() => setUniteDone(true)} />}
          </div>
        </StepCard>

        <StepCard num={4} title="À toi de calculer" done={s4} locked={!s3}>
          <CalcRound done={calcDone} onSolved={() => setCalcDone(true)} />
        </StepCard>

        {allDone && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Route className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Périmètre = somme de tous les côtés = longueur du contour. La formule 2 × (L + l) n’est qu’un
              raccourci pour le rectangle.
            </p>
          </motion.div>
        )}
      </div>
    </ModuleLayout>
  );
}
