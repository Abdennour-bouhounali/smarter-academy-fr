import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
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
              requires={['perimetre', 'perimetre-est-longueur']}
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
            <div className="space-y-5">
              <TapQuestion
                prompt={UNIT_TRAP_Q.q}
                options={UNIT_TRAP_Q.options}
                correct={UNIT_TRAP_Q.correct}
                cols={1}
                explain={UNIT_TRAP_Q.explain}
                requires={['perimetre', 'perimetre-est-longueur', 'tour-complet']}
                solved={unitTrapDone}
                onAnswered={() => setUnitTrapDone(true)}
              />
              {/* Le calcul de Lina vient d'être démonté : la règle se pose
                  sur ce constat, et servira à chaque atelier du module 6. */}
              {unitTrapDone && (
                <KnowledgeBrick
                  id="meme-unite"
                  variant="new"
                  lead="Ce que Lina a manqué vaut pour toutes les additions de longueurs."
                />
              )}
            </div>
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
                      requires={['perimetre', 'perimetre-est-longueur', 'formules-polygones', 'perimetre-cercle']}
                      solved={estimDone.includes(i)}
                      onAnswered={() => setEstimDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
              {/* Deux estimations viennent d'être faites de tête. La brique
                  nomme ce geste — y compris l'arrondi des côtés — AVANT
                  l'étape 4, dont la consigne l'emploie. */}
              {allEstimDone && (
                <KnowledgeBrick
                  id="estimer-avant"
                  variant="new"
                  lead="Tu viens de deviner deux tours sans poser une seule opération. Voilà à quoi cela sert."
                />
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
                requires={['perimetre', 'formules-polygones', 'estimer-avant']}
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
                    requires={['perimetre', 'formules-polygones', 'estimer-avant']}
                    solved={ritCalcDone}
                    onAnswered={() => setRitCalcDone(true)}
                  />
                  {ritCalcDone && (
                    <>
                      <Feedback tone="info">
                        Le rituel du géomètre : <strong>estimer → calculer → écrire avec l'unité</strong>. Si le
                        calcul s'éloigne beaucoup de l'estimation, c'est qu'une erreur s'est glissée quelque part.
                      </Feedback>
                      {/* Les quatre tours ont tous été construits par un
                          geste : le repère de mémorisation les rassemble. */}
                      <KnowledgeBrick
                        id="mem-perimetres"
                        variant="new"
                        lead="Ta carte contient maintenant les quatre façons de faire un tour. Les voici en une seule vue."
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Ta carte est complète. Le module suivant n'ajoute rien : il
          fait travailler tout cela sur trois vrais bons de commande.
        </KnowledgeSnapshot>
      }
    />
  );
}
