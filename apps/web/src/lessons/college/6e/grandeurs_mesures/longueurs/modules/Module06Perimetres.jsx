import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonPerimeter from '../components/PolygonPerimeter';
import { perimeter, formatLength } from '../components/lengthUtils';

/**
 * Module 6 — practice lab, reconstruit sur le lesson kit.
 *
 * Le périmètre, c'est la longueur du contour : on en fait le tour côté par
 * côté (manipulation, jamais d'état faux) avant de voir apparaître une
 * formule.
 */
function TraceRound({ react, shape, sideLengths, unit, solved, onSolved }) {
  const [tapped, setTapped] = useState(solved ? sideLengths.map((_, i) => i) : []);
  const total = tapped.reduce((s, i) => s + sideLengths[i], 0);
  const isDone = solved || tapped.length === sideLengths.length;

  const handleTap = (i) => {
    if (solved || tapped.includes(i)) return;
    const next = [...tapped, i];
    setTapped(next);
    if (next.length === sideLengths.length) {
      react(true);
      onSolved?.();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">Tape chaque côté, dans l'ordre du contour, pour construire le périmètre.</p>
      <PolygonPerimeter shape={shape} sideLengths={sideLengths} unit={unit} tappedIndices={tapped} onTapSide={handleTap} disabled={solved} showRunningTotal />
      <div className="text-center font-mono text-lg text-slate-800">
        Périmètre parcouru : <strong>{total} {unit}</strong> {tapped.length > 0 && `(${tapped.length}/${sideLengths.length} côtés)`}
      </div>
      {isDone && (
        <Feedback tone="ok">
          Tu as fait le tour complet : périmètre = {sideLengths.join(' + ')} ={' '}
          <strong>{perimeter(sideLengths)} {unit}</strong>. Le périmètre, c'est la longueur totale du contour.
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
  explain: "2 × (6 + 4), c'est juste une autre façon d'écrire 6 + 4 + 6 + 4 : comme les côtés opposés d'un rectangle sont égaux, on additionne une fois chaque longueur puis on double.",
};

const COTE_Q = {
  q: 'Un rectangle a un côté de 6 cm. Son périmètre est donc 6 cm.',
  options: ['Vrai', 'Faux : le périmètre additionne TOUS les côtés, pas un seul'],
  correct: 1,
  explain: "Un seul côté ne représente pas le contour entier. Il faut connaître (ou déduire) la longueur de chaque côté pour calculer le périmètre.",
};

const UNITE_Q = {
  q: 'Le périmètre d’un terrain se mesure en m² (mètres carrés).',
  options: ['Vrai', 'Faux : le périmètre est une longueur, il se mesure en m (ou km, cm…), jamais en m²'],
  correct: 1,
  explain: 'Le périmètre est une longueur (le tour de la figure) : il se mesure toujours avec une unité de longueur simple, jamais au carré.',
};

const CALC_SIDES = [7, 5, 9, 4];
const CALC_UNIT = 'm';

export default function Module06Perimetres() {
  const [triDone, setTriDone] = useState(false);
  const [rectDone, setRectDone] = useState(false);
  const s1 = triDone && rectDone;

  const [formuleDone, setFormuleDone] = useState(false);
  const [coteDone, setCoteDone] = useState(false);
  const [uniteDone, setUniteDone] = useState(false);
  const s3 = coteDone && uniteDone;

  const [calcDone, setCalcDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Périmètres"
      moduleSubtitle="Le périmètre, c’est la longueur du contour : en faire le tour, puis calculer."
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Fais le tour de la figure, un côté à la fois.',
        body: <p>Avant toute formule, le périmètre, c'est simplement la longueur totale du contour.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le tour du triangle, puis du rectangle',
          done: s1,
          content: (kit) => (
            <div className="space-y-8">
              <TraceRound react={kit.react} shape="triangle" sideLengths={[4, 5, 3]} unit="m" solved={triDone} onSolved={() => setTriDone(true)} />
              {triDone && <TraceRound react={kit.react} shape="rectangle" sideLengths={[6, 4, 6, 4]} unit="m" solved={rectDone} onSolved={() => setRectDone(true)} />}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Une formule pour aller plus vite',
          done: formuleDone,
          content: (
            <TapQuestion
              prompt={FORMULE_Q.q}
              options={FORMULE_Q.options}
              correct={FORMULE_Q.correct}
              cols={1}
              explain={FORMULE_Q.explain}
              solved={formuleDone}
              onAnswered={() => setFormuleDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Deux pièges à éviter',
          done: s3,
          content: (
            <div className="space-y-6">
              <TapQuestion
                prompt={COTE_Q.q}
                options={COTE_Q.options}
                correct={COTE_Q.correct}
                cols={1}
                explain={COTE_Q.explain}
                solved={coteDone}
                onAnswered={() => setCoteDone(true)}
              />
              {coteDone && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    prompt={UNITE_Q.q}
                    options={UNITE_Q.options}
                    correct={UNITE_Q.correct}
                    cols={1}
                    explain={UNITE_Q.explain}
                    solved={uniteDone}
                    onAnswered={() => setUniteDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'À toi de calculer',
          done: calcDone,
          content: (
            <div className="space-y-4">
              <PolygonPerimeter shape="quad" sideLengths={CALC_SIDES} unit={CALC_UNIT} tappedIndices={[0, 1, 2, 3]} disabled />
              <NumericQuestion
                prompt="Quel est le périmètre de ce terrain ?"
                suffix={CALC_UNIT}
                expected={perimeter(CALC_SIDES)}
                explain={<>{CALC_SIDES.join(' + ')} = <strong>{formatLength(perimeter(CALC_SIDES), CALC_UNIT)}</strong>.</>}
                explainFor={() => `Additionne les 4 côtés : ${CALC_SIDES.join(' + ')}.`}
                solved={calcDone}
                onAnswered={() => setCalcDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Route className="w-6 h-6 mx-auto text-rose-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Périmètre = somme de tous les côtés = longueur du contour. La formule 2 × (L + l) n'est qu'un
            raccourci pour le rectangle.
          </p>
        </motion.div>
      }
    />
  );
}
