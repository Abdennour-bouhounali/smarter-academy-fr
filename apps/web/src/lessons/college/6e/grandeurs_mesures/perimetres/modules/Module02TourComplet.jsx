import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ListChecks } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonPerimeter from '../components/PolygonPerimeter';
import { perimeter, formatDec, parseDec } from '../components/perimUtils';

/**
 * Module 2 — découverte : mesurer chaque côté, tout additionner.
 *
 * Courte réactivation (le tour du triangle, déjà vu en Longueurs), puis
 * terrain nouveau : la figure QUELCONQUE via la prop `vertices`, et le
 * grand classique du côté oublié / compté deux fois — corrigé par la
 * conséquence (on voit le côté manquant), jamais par un simple « faux ».
 */
const TRI = { sideLengths: [4, 5, 3], unit: 'm' };

// Pentagone quelconque : l'enclos réel du parc, aucun côté pareil.
const PENTA_VERTICES = [
  { x: 40, y: 165 }, { x: 250, y: 175 }, { x: 275, y: 70 }, { x: 150, y: 20 }, { x: 55, y: 60 },
];
const PENTA_SIDES = [10.5, 6, 7.5, 6.5, 9]; // m
const PENTA_TOTAL = perimeter(PENTA_SIDES); // 39,5

const SAMI_Q = {
  q: 'Sami calcule le périmètre du massif : « 10,5 + 6 + 7,5 + 9 = 33 m ». Que penses-tu de son calcul ?',
  options: [
    'Le calcul est juste : 33 m',
    'Il a oublié un côté — le tour n’est pas complet',
  ],
  correct: 1,
  explain:
    'Le massif a CINQ côtés, Sami n’en a additionné que quatre : le côté de 6,5 m manque. Un périmètre juste passe par TOUS les côtés, une seule fois chacun.',
};

function TraceRound({ react, shape, vertices, sideLengths, unit, intro, solved, onSolved }) {
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
      {intro && <p className="text-sm text-slate-600">{intro}</p>}
      <PolygonPerimeter
        shape={shape}
        vertices={vertices}
        sideLengths={sideLengths}
        unit={unit}
        tappedIndices={tapped}
        onTapSide={handleTap}
        disabled={solved}
        showRunningTotal
      />
      <div className="text-center font-mono text-lg text-slate-800">
        Périmètre parcouru : <strong>{formatDec(total)} {unit}</strong>{' '}
        {tapped.length > 0 && !isDone && `(${tapped.length}/${sideLengths.length} côtés)`}
      </div>
      {isDone && (
        <Feedback tone="ok">
          Tour complet : {sideLengths.map((v) => formatDec(v)).join(' + ')} ={' '}
          <strong>{formatDec(perimeter(sideLengths))} {unit}</strong>.
        </Feedback>
      )}
    </div>
  );
}

export default function Module02TourComplet() {
  const [triDone, setTriDone] = useState(false);
  const [pentaDone, setPentaDone] = useState(false);
  const [samiDone, setSamiDone] = useState(false);
  const [calcDone, setCalcDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le tour complet"
      moduleSubtitle="Mesurer chaque côté, n’en oublier aucun, tout additionner."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'Une figure quelconque n’a aucune formule — mais elle a une méthode.',
        body: <p>Relever chaque côté une seule fois, puis tout additionner. Simple… tant qu'on n'oublie personne.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Échauffement : le triangle',
          subtitle: 'Tu l’as déjà fait dans la leçon Longueurs — un tour pour te remettre en jambes.',
          done: triDone,
          content: (kit) => (
            <TraceRound
              react={kit.react}
              shape="triangle"
              sideLengths={TRI.sideLengths}
              unit={TRI.unit}
              solved={triDone}
              onSolved={() => setTriDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'La figure quelconque',
          subtitle: 'Cinq côtés, tous différents : seule la méthode compte.',
          done: pentaDone,
          content: (kit) => (
            <TraceRound
              react={kit.react}
              vertices={PENTA_VERTICES}
              sideLengths={PENTA_SIDES}
              unit="m"
              intro="L'enclos réel du parc n'est ni un carré ni un rectangle. Fais le tour en tapant les cinq côtés."
              solved={pentaDone}
              onSolved={() => setPentaDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Détective : le côté oublié',
          done: samiDone,
          content: (
            <TapQuestion
              above={
                <PolygonPerimeter
                  vertices={PENTA_VERTICES}
                  sideLengths={PENTA_SIDES}
                  unit="m"
                  tappedIndices={[0, 1, 2, 4]}
                  disabled
                />
              }
              prompt={SAMI_Q.q}
              options={SAMI_Q.options}
              correct={SAMI_Q.correct}
              cols={1}
              explain={SAMI_Q.explain}
              solved={samiDone}
              onAnswered={() => setSamiDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'À toi de calculer',
          done: calcDone,
          content: (
            <NumericQuestion
              prompt="Quel est le vrai périmètre du massif, en mètres ?"
              suffix="m"
              expected={PENTA_TOTAL}
              parse={parseDec}
              display={formatDec(PENTA_TOTAL)}
              explain={<>{PENTA_SIDES.map((v) => formatDec(v)).join(' + ')} = <strong>{formatDec(PENTA_TOTAL)} m</strong>.</>}
              explainFor={(n) =>
                n === 33
                  ? 'C’est le calcul de Sami — il manque le côté de 6,5 m. Reprends la liste : chaque côté, une seule fois.'
                  : 'Liste les cinq côtés (10,5 ; 6 ; 7,5 ; 6,5 ; 9) puis additionne-les tous.'
              }
              solved={calcDone}
              onAnswered={() => setCalcDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <ListChecks className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Pour une figure quelconque : relever chaque côté UNE fois, puis tout additionner. La check-list vaut
            mieux que la mémoire.
          </p>
        </motion.div>
      }
    />
  );
}
