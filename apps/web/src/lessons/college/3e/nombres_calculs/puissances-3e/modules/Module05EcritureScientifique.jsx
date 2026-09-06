import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SciNotationBuilder from '../components/SciNotationBuilder';
import { formatDec, formatScientific, isValidMantissa, shiftDecimal, toScientific } from '../components/powerUtils';

/**
 * Module 5 — FORMALISATION : « Écriture scientifique ».
 *
 * Activity: déplacer la virgule d'un nombre jusqu'à ce que le coefficient
 *   tombe entre 1 et 10, l'exposant se corrigeant tout seul.
 * Mathematical objective: écrire un nombre sous la forme a × 10^n avec
 *   1 ≤ a < 10, et savoir passer d'une écriture décimale à celle-là.
 * Student action: taper « ◀ » / « ▶ » pour bouger la virgule d'un rang.
 * Controlled variable: la position de la virgule (donc a et n ensemble).
 * Mathematical state: `shift` ; a et n en sont dérivés, et le produit a × 10^n
 *   affiché reste égal au nombre de départ — l'invariant est visible.
 * Visual consequence: le cadre passe de l'ambre au vert dès que le coefficient
 *   entre dans [1 ; 10[ ; la valeur affichée dessous ne bouge jamais.
 * Expected observation: une seule position de virgule est acceptée. Bouger
 *   la virgule d'un rang et changer l'exposant d'un cran se compensent.
 * Misconception targeted: « 38 × 10^{-5} » (coefficient ≥ 10) et
 *   « 0,38 × 10^{-3} » (coefficient < 1) — deux écritures justes en valeur,
 *   mais pas scientifiques.
 * Feedback: le composant dit pourquoi le coefficient courant est refusé, et
 *   le module chiffre le nombre de rangs restants.
 * Formalization: le « À retenir » vient APRÈS les deux constructions.
 * Scaffolding: deux boutons ; le grand nombre d'abord, le petit ensuite.
 * Transfer: le module 6 lit des tailles réelles dans cette écriture.
 */
const BIG = 34500;
const SMALL = 0.00038;

export default function Module05EcritureScientifique() {
  const [shiftBig, setShiftBig] = useState(0);
  const [bigDone, setBigDone] = useState(false);
  const [shiftSmall, setShiftSmall] = useState(0);
  const [smallDone, setSmallDone] = useState(false);
  const [sortDone, setSortDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  const aBig = shiftDecimal(BIG, -shiftBig);
  const aSmall = shiftDecimal(SMALL, -shiftSmall);
  const targetBig = toScientific(BIG);
  const targetSmall = toScientific(SMALL);

  const handleBig = (s, kitReact) => {
    setShiftBig(s);
    if (isValidMantissa(shiftDecimal(BIG, -s)) && !bigDone) {
      setBigDone(true);
      kitReact?.(true);
    }
  };
  const handleSmall = (s, kitReact) => {
    setShiftSmall(s);
    if (isValidMantissa(shiftDecimal(SMALL, -s)) && !smallDone) {
      setSmallDone(true);
      kitReact?.(true);
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Écriture scientifique"
      moduleSubtitle="Une seule écriture est acceptée : le coefficient entre 1 et 10."
      estimatedTime="9 min"
      brief={{
        tag: '🔬 Mission 05',
        title: 'Le même nombre, une seule écriture officielle.',
        body: (
          <p>
            Un nombre peut s’écrire de mille façons avec des puissances de 10. Les scientifiques n’en
            gardent qu’une : celle dont le coefficient est compris entre 1 et 10. Trouve-la.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Réécris ${formatDec(BIG)} sous la forme a × 10ⁿ`,
          subtitle: 'Déplace la virgule jusqu’à ce que le cadre passe au vert.',
          done: bigDone,
          content: (kit) => (
            <div className="space-y-3">
              <SciNotationBuilder
                value={BIG}
                shift={shiftBig}
                onChange={bigDone ? undefined : (s) => handleBig(s, kit.react)}
              />
              {!bigDone && (
                <Feedback tone="info">
                  Coefficient actuel : <strong className="font-mono">{formatDec(aBig, { maxDecimals: 12 })}</strong>. Il
                  reste <strong className="font-mono">{formatDec(Math.abs(targetBig.n - shiftBig))}</strong>{' '}
                  rang{Math.abs(targetBig.n - shiftBig) > 1 ? 's' : ''} à parcourir pour le ramener entre 1
                  et 10.
                </Feedback>
              )}
              {bigDone && (
                <Feedback tone="ok">
                  <MathText>{`$${formatDec(BIG)} = ${formatScientific(targetBig)}$`}</MathText> — la virgule a
                  reculé de {formatDec(targetBig.n)} rangs, donc l’exposant a gagné {formatDec(targetBig.n)}{' '}
                  crans. Les deux mouvements se compensent : la valeur n’a pas changé.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: `Même travail avec ${formatDec(SMALL, { maxDecimals: 12 })}`,
          subtitle: 'Cette fois, la virgule doit avancer — l’exposant devient négatif.',
          done: smallDone,
          content: (kit) => (
            <div className="space-y-3">
              <SciNotationBuilder
                value={SMALL}
                shift={shiftSmall}
                onChange={smallDone ? undefined : (s) => handleSmall(s, kit.react)}
              />
              {!smallDone && (
                <Feedback tone="info">
                  Coefficient actuel :{' '}
                  <strong className="font-mono">{formatDec(aSmall, { maxDecimals: 12 })}</strong>. Il est
                  trop {Math.abs(aSmall) < 1 ? 'petit' : 'grand'} : encore{' '}
                  <strong className="font-mono">{formatDec(Math.abs(targetSmall.n - shiftSmall))}</strong>{' '}
                  rang{Math.abs(targetSmall.n - shiftSmall) > 1 ? 's' : ''}.
                </Feedback>
              )}
              {smallDone && (
                <Feedback tone="ok">
                  <MathText>{`$${formatDec(SMALL, { maxDecimals: 12 })} = ${formatScientific(targetSmall)}$`}</MathText> —
                  l’exposant est négatif parce que le nombre est plus petit que 1, mais le coefficient,{' '}
                  <strong className="font-mono">{formatDec(targetSmall.a)}</strong>, est bien entre 1 et 10.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Laquelle de ces écritures est scientifique ?',
          subtitle: 'Elles valent toutes le même nombre. Une seule est acceptée.',
          done: sortDone,
          content: (
            <div className="space-y-3">
            <KnowledgeBrick
              id="ecriture-scientifique"
              variant="new"
              compact
              lead="La forme normalisée que tout le monde utilise."
            />
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque écriture, dis si c’est une écriture scientifique (coefficient entre 1 et 10)
                  ou non.
                </p>
              }
              rows={[
                {
                  id: 'e1',
                  label: <MathText>{'$3{,}8 \\times 10^{-4}$'}</MathText>,
                  options: ['Oui', 'Non'],
                  correct: 0,
                  correction: '3,8 est bien entre 1 et 10 : c’est la bonne écriture.',
                },
                {
                  id: 'e2',
                  label: <MathText>{'$38 \\times 10^{-5}$'}</MathText>,
                  options: ['Oui', 'Non'],
                  correct: 1,
                  correction: '38 ≥ 10 : coefficient trop grand (la valeur est juste, l’écriture non).',
                },
                {
                  id: 'e3',
                  label: <MathText>{'$0{,}38 \\times 10^{-3}$'}</MathText>,
                  options: ['Oui', 'Non'],
                  correct: 1,
                  correction: '0,38 < 1 : coefficient trop petit.',
                },
                {
                  id: 'e4',
                  label: <MathText>{'$1 \\times 10^{21}$'}</MathText>,
                  options: ['Oui', 'Non'],
                  correct: 0,
                  correction: '1 est accepté (1 ≤ a < 10), la borne basse est incluse.',
                },
              ]}
              feedback={({ allRight, nCorrect, total }) =>
                allRight ? (
                  <Feedback tone="ok">
                    Exact. Les trois premières valent toutes 0,00038 — mais une seule respecte la règle{' '}
                    <MathText>{'$1 \\leq a < 10$'}</MathText>.
                  </Feedback>
                ) : (
                  <Feedback tone="ko">
                    <strong className="font-mono">
                      {formatDec(nCorrect)} / {formatDec(total)}
                    </strong>{' '}
                    — les bonnes réponses sont en vert. Le test est toujours le même : le coefficient
                    est-il au moins 1 et strictement plus petit que 10 ? 38 est trop grand, 0,38 trop petit.
                  </Feedback>
                )
              }
              requires={['ecriture-scientifique', 'puissance-de-dix']}
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
            />
            </div>
          ),
        },
        {
          num: 4,
          title: 'La règle, écrite',
          done: ruleDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 text-center space-y-2">
                <p className="text-sm font-semibold text-blue-900">À retenir</p>
                <MathText className="text-lg text-slate-800">
                  {'$x = a \\times 10^{n} \\quad \\text{avec} \\quad 1 \\leq a < 10$'}
                </MathText>
                <p className="text-xs text-blue-800">
                  On décale la virgule jusqu’à n’avoir qu’un seul chiffre non nul devant, et l’exposant
                  compte les rangs parcourus : positif si le nombre est grand, négatif s’il est petit.
                </p>
              </div>
              <TapQuestion
                prompt={
                  <>
                    Quelle est l’écriture scientifique de{' '}
                    <strong className="font-mono">{formatDec(0.00072, { maxDecimals: 12 })}</strong> ?
                  </>
                }
                options={['$7{,}2 \\times 10^{-4}$', '$7{,}2 \\times 10^{4}$', '$72 \\times 10^{-5}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['7,2 × 10⁻⁴', '7,2 × 10⁴', '72 × 10⁻⁵'][i]}
                correctionLabel="7,2 × 10⁻⁴"
                cols={1}
                correct={0}
                explain={
                  <>
                    La virgule doit avancer de 4 rangs pour donner 7,2 ; le nombre étant plus petit que 1,
                    l’exposant est négatif :{' '}
                    <MathText>{'$0{,}00072 = 7{,}2 \\times 10^{-4}$'}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$7{,}2 \\times 10^{4} = 72\\,000$'}</MathText> : le signe de l’exposant est
                    inversé — le nombre de départ est PLUS PETIT que 1, donc l’exposant est négatif.{' '}
                    <MathText>{'$72 \\times 10^{-5}$'}</MathText> vaut bien 0,00072, mais 72 n’est pas entre
                    1 et 10 : ce n’est pas l’écriture scientifique.
                  </>
                }
                requires={['ecriture-scientifique']}
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Une seule écriture pour tous les ordres de grandeur. Voyons
          ce qu’elle permet à l’échelle de l’univers.
        </KnowledgeSnapshot>
      )}
    />
  );
}
