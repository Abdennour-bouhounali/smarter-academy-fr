import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { rectanglePerimeter, formatDec, parseDec } from '../components/perimUtils';

/**
 * Module 5 — formalisation : les deux réflexes AVANT le calcul.
 *
 * 1. Choisir l'unité (et unifier les unités mélangées avant d'additionner).
 * 2. Estimer l'ordre de grandeur — l'estimation est le détecteur d'erreurs.
 * Rituel formalisé en fin de module : estimer → calculer → écrire avec
 * l'unité.
 */
const UNIT_TRAP_Q = {
  q: 'Lina additionne les côtés d’un terrain : « 1 m + 40 cm = 41 ». Que penses-tu de son calcul ?',
  options: [
    'C’est juste : 1 + 40 = 41',
    'On ne peut pas additionner des m et des cm directement : 1 m = 100 cm, donc 100 + 40 = 140 cm',
  ],
  correct: 1,
  explain:
    'Avant d’additionner des longueurs, on les met dans la MÊME unité : 1 m + 40 cm = 100 cm + 40 cm = 140 cm (= 1,40 m). Le « 41 » de Lina ne compte rien de réel.',
};

const ESTIM_ITEMS = [
  {
    q: 'Le tour d’un terrain de basket : quel ordre de grandeur ?',
    options: ['≈ 9 m', '≈ 90 m', '≈ 900 m'],
    correct: 1,
    explain: 'Un terrain de basket fait environ 28 m sur 15 m : son tour vaut à peu près 2 × (30 + 15) ≈ 90 m.',
  },
  {
    q: 'Le tour d’une pièce de 2 € : quel ordre de grandeur ?',
    options: ['≈ 8 mm', '≈ 8 cm', '≈ 8 dm'],
    correct: 1,
    explain: 'La pièce a un diamètre d’environ 2,5 cm : son tour vaut π × D ≈ 3 × 2,5 ≈ 8 cm.',
  },
];

// Rituel : estimer d'abord (8,7 ≈ 9 ; 6,2 ≈ 6 → ≈ 30 m), calculer ensuite.
const RITUEL = { L: 8.7, l: 6.2 };
const RITUEL_EXACT = rectanglePerimeter(RITUEL.L, RITUEL.l); // 29,8
const RITUEL_ESTIM_OPTIONS = ['≈ 15 m', '≈ 30 m', '≈ 60 m'];

const UNIT_ROWS = [
  { id: 'piece', emoji: '🪙', label: 'Le tour d’une pièce de monnaie', correct: 'cm' },
  { id: 'cahier', emoji: '📓', label: 'Le tour d’un cahier', correct: 'cm' },
  { id: 'terrain', emoji: '⚽', label: 'Le tour d’un terrain de foot', correct: 'm' },
  { id: 'lac', emoji: '🏞️', label: 'Le tour d’un lac', correct: 'km' },
];
const UNIT_OPTIONS = ['mm', 'cm', 'm', 'km'];

export default function Module05BonsReflexes() {
  const [sortDone, setSortDone] = useState(false);
  const [unitTrapDone, setUnitTrapDone] = useState(false);
  const [estimDone, setEstimDone] = useState([]);
  const allEstimDone = estimDone.length === ESTIM_ITEMS.length;
  const [ritEstimDone, setRitEstimDone] = useState(false);
  const [ritCalcDone, setRitCalcDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Estimer et choisir son unité"
      moduleSubtitle="Avant de calculer : quel ordre de grandeur, et quelle unité ?"
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Les pros du chantier vérifient AVANT de calculer.',
        body: <p>Deux réflexes qui évitent presque toutes les erreurs : la bonne unité, et un ordre de grandeur en tête.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'À chaque tour, son unité',
          done: sortDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque tour à mesurer, choisis l'unité la plus adaptée — celle qui donne un nombre
                  raisonnable à lire.
                </p>
              }
              rows={UNIT_ROWS.map((it) => ({
                id: it.id,
                label: (
                  <>
                    <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                    <span>{it.label}</span>
                  </>
                ),
                options: UNIT_OPTIONS,
                correct: UNIT_OPTIONS.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Un périmètre s'écrit avec l'unité qui rend le nombre lisible : cm pour une pièce ou un cahier,
                  m pour un terrain, km pour un lac.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 2,
          title: 'Le piège des unités mélangées',
          done: unitTrapDone,
          content: (
            <TapQuestion
              prompt={UNIT_TRAP_Q.q}
              options={UNIT_TRAP_Q.options}
              correct={UNIT_TRAP_Q.correct}
              cols={1}
              explain={UNIT_TRAP_Q.explain}
              solved={unitTrapDone}
              onAnswered={() => setUnitTrapDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'L’ordre de grandeur',
          done: allEstimDone,
          content: (
            <div className="space-y-6">
              {ESTIM_ITEMS.map((item, i) =>
                i === 0 || estimDone.includes(i - 1) ? (
                  <div key={item.q} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                    <TapQuestion
                      prompt={item.q}
                      options={item.options}
                      correct={item.correct}
                      cols={3}
                      explain={item.explain}
                      solved={estimDone.includes(i)}
                      onAnswered={() => setEstimDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le rituel : estimer, puis calculer',
          done: ritEstimDone && ritCalcDone,
          content: (
            <div className="space-y-5">
              <TapQuestion
                prompt={`Un potager rectangulaire de ${formatDec(RITUEL.L)} m sur ${formatDec(RITUEL.l)} m. AVANT de calculer : estime son périmètre de tête (arrondis les côtés).`}
                options={RITUEL_ESTIM_OPTIONS}
                correct={1}
                cols={3}
                explain="8,7 ≈ 9 et 6,2 ≈ 6 : P ≈ 2 × (9 + 6) = 30 m. Cette estimation va nous servir de garde-fou."
                solved={ritEstimDone}
                onAnswered={() => setRitEstimDone(true)}
              />
              {ritEstimDone && (
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <NumericQuestion
                    prompt="Maintenant, le calcul exact : P = 2 × (8,7 + 6,2) = ? m"
                    suffix="m"
                    expected={RITUEL_EXACT}
                    parse={parseDec}
                    display={formatDec(RITUEL_EXACT)}
                    explain={<>P = 2 × 14,9 = <strong>{formatDec(RITUEL_EXACT)} m</strong> — tout proche de l'estimation (30 m) : le calcul est cohérent ✓.</>}
                    explainFor={() => 'P = 2 × (L + l). Additionne 8,7 + 6,2, puis double.'}
                    solved={ritCalcDone}
                    onAnswered={() => setRitCalcDone(true)}
                  />
                  {ritCalcDone && (
                    <Feedback tone="info">
                      Le rituel du géomètre : <strong>estimer → calculer → écrire avec l'unité</strong>. Si le
                      calcul s'éloigne beaucoup de l'estimation, c'est qu'une erreur s'est glissée quelque part.
                    </Feedback>
                  )}
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Compass className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Polygone : somme des côtés · Rectangle : 2 × (L + l) · Carré : 4 × c · Cercle : ≈ π × D. Et toujours :
            même unité partout, estimation en tête.
          </p>
        </motion.div>
      }
    />
  );
}
