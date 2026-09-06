import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import BarModel from '../../../../../common/components/BarModel';
import CalcChain from '../../../../../common/components/CalcChain';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  add, div, formatDec, formatFrac, mul, parseDec, rat, sub, toDecimal,
} from '../components/rationalUtils';

/**
 * Module 7 — LABORATOIRE : « Le budget du club ».
 *
 * (Scénario repris de l'ancien module 06 « Mission : Le Budget » de la leçon
 * pré-kit — le club de robotique et ses parts de budget — mais rejoué comme
 * un vrai laboratoire : les parts sont des BARRES, chaque étape est nommée,
 * et le calcul final tombe sur un décimal qu'il faut interpréter.)
 *
 * Activity: lire des parts de budget sur des barres, les combiner, puis
 *   convertir une part en euros et en nombre de maillots.
 * Mathematical objective: choisir l'opération qui convient à la situation, et
 *   l'enchaîner correctement — modéliser avant de calculer.
 * Student action: répondre à des questions dont chacune fait avancer la
 *   chaîne de calcul (BarModel + CalcChain à l'appui).
 * Controlled variable: la part interrogée à chaque étape.
 * Mathematical state: les fractions du scénario ; les barres, les euros et
 *   le nombre de maillots en sont dérivés.
 * Visual consequence: la barre du budget se remplit part après part, et la
 *   part « tournoi » apparaît comme le trou restant.
 * Expected observation: le tout vaut 1 = 12/12 ; ce qui reste se lit comme
 *   une soustraction à 1, pas comme une addition de plus.
 * Misconception targeted: « la part restante est la somme des parts »,
 *   « 1 − 7/12 = 1/5 » (soustraction terme à terme), et l'oubli des
 *   priorités dans le calcul final.
 * Feedback: chaque réponse fausse est rapportée à la barre (« 7/12 du budget
 *   est déjà dépensé, il en reste donc 5/12, pas 5/24 »).
 * Formalization: « choisir l'opération que raconte l'énoncé » vit dans
 *   `knowledge.jsx` ; une <KnowledgeBrick> la pose après la première décision
 *   de l'élève, et la chaîne de calcul complète reste affichée à la fin
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: les fractions du scénario sont rappelées en permanence.
 * Transfer: la dernière question demande un nombre ENTIER de maillots à
 *   partir d'un quotient décimal — il faut interpréter, pas seulement calculer.
 */
const BUDGET = 720; // €
const MOTEURS = rat(1, 3);
const CAPTEURS = rat(1, 4);
const MATERIEL = add(MOTEURS, CAPTEURS); // 7/12
const TOURNOI = sub(rat(1, 1), MATERIEL); // 5/12
const TOURNOI_EUROS = toDecimal(mul(TOURNOI, rat(BUDGET, 1))); // 300
const PRIX_MAILLOT = rat(25, 2); // 12,50 €
const MAILLOTS = toDecimal(div(mul(TOURNOI, rat(BUDGET, 1)), PRIX_MAILLOT)); // 24

export default function Module07BudgetDuClub() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Le budget du club"
      moduleSubtitle="Des parts de budget en barres : combien reste-t-il, et pour combien de maillots ?"
      estimatedTime="10 min"
      brief={{
        tag: '🤖 Mission 07',
        title: 'Le club de robotique a reçu son budget de l’année.',
        body: (
          <p>
            Il dépense <MathText>{`$${formatFrac(MOTEURS)}$`}</MathText> du budget en moteurs et{' '}
            <MathText>{`$${formatFrac(CAPTEURS)}$`}</MathText> en capteurs. Le reste part dans
            l’inscription au tournoi. À toi de démêler tout ça — en choisissant la bonne opération à
            chaque étape.
          </p>
        ),
      }}
      intro={
        <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-4 space-y-3">
          <p className="text-sm font-semibold text-rose-900">Le budget, en barres</p>
          <BarModel
            bars={[
              {
                label: 'Budget total (12 douzièmes)',
                segments: [
                  { value: 4, tone: 'sky', text: 'moteurs 4/12' },
                  { value: 3, tone: 'amber', text: 'capteurs 3/12' },
                  { value: 5, tone: 'slate', unknown: true },
                ],
              },
            ]}
            maxValue={12}
          />
          <p className="text-xs text-slate-600">
            Les douzièmes sont la découpe commune de <MathText>{`$${formatFrac(MOTEURS)}$`}</MathText>{' '}
            et <MathText>{`$${formatFrac(CAPTEURS)}$`}</MathText>. Le bloc « ? » est la part du tournoi.
          </p>
        </div>
      }
      steps={[
        {
          num: 1,
          title: 'Quelle opération pour le matériel ?',
          subtitle: 'Décider avant de calculer.',
          done: q1,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Quelle opération donne la part du budget dépensée en MATÉRIEL (moteurs et capteurs) ?"
              options={[
                '$\\frac{1}{3} + \\frac{1}{4}$',
                '$\\frac{1}{3} \\times \\frac{1}{4}$',
                '$\\frac{1}{3} - \\frac{1}{4}$',
              ]}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['1/3 + 1/4', '1/3 × 1/4', '1/3 − 1/4'][i]}
              correctionLabel="1/3 + 1/4"
              cols={3}
              correct={0}
              explain={
                <>
                  Deux dépenses qui s’ajoutent : on additionne. En douzièmes,{' '}
                  <MathText>{`$\\frac{4}{12} + \\frac{3}{12} = ${formatFrac(MATERIEL)}$`}</MathText> — soit
                  les 7 blocs colorés de la barre.
                </>
              }
              explainWrong={
                <>
                  Multiplier donnerait « un tiers DES un quart », soit{' '}
                  <MathText>{`$${formatFrac(mul(MOTEURS, CAPTEURS))}$`}</MathText> — une part de part, ce
                  qui n’est pas la situation. Soustraire donnerait l’écart entre les deux dépenses. Ici
                  elles s’ajoutent : <MathText>{`$${formatFrac(MATERIEL)}$`}</MathText>.
                </>
              }
              requires={['meme-decoupe', 'somme-difference', 'produit-rationnels']}
              solved={q1}
              onAnswered={() => setQ1(true)}
            />
            {q1 && (
              <KnowledgeBrick
                id="choisir-operation"
                variant="new"
                lead="Tu n’as rien calculé : tu as DÉCIDÉ. C’est là qu’un problème se gagne ou se perd."
              />
            )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Ce qui reste pour le tournoi',
          done: q2,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={
                  <>
                    Le budget entier vaut <MathText>{'$1 = \\frac{12}{12}$'}</MathText>. Combien de
                    DOUZIÈMES reste-t-il pour le tournoi ?
                  </>
                }
                expected={5}
                parse={parseDec}
                display="5"
                suffix="/ 12"
                explain="12 douzièmes en tout, 7 dépensés en matériel : 12 − 7 = 5. Le tournoi représente 5/12 du budget."
                explainFor={(n) =>
                  n === 7
                    ? 'C’est la part déjà dépensée, pas ce qui reste. Le tout vaut 12 douzièmes : 12 − 7 = 5.'
                    : '12 douzièmes en tout, 7 dépensés en matériel : 12 − 7 = 5. Le tournoi représente 5/12 du budget.'
                }
                requires={['choisir-operation', 'somme-difference', 'meme-decoupe']}
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <Feedback tone="ok">
                  <MathText>{`$1 - ${formatFrac(MATERIEL)} = ${formatFrac(TOURNOI)}$`}</MathText>. On
                  soustrait à <strong>1</strong>, pas à autre chose : le budget entier est l’unité.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'De la part aux euros',
          subtitle: `Le budget total est de ${formatDec(BUDGET)} €.`,
          done: q3,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={
                  <>
                    Combien d’euros le club consacre-t-il au tournoi, c’est-à-dire{' '}
                    <MathText>{`$${formatFrac(TOURNOI)}$`}</MathText> de {formatDec(BUDGET)} € ?
                  </>
                }
                expected={TOURNOI_EUROS}
                parse={parseDec}
                display={formatDec(TOURNOI_EUROS)}
                suffix="€"
                explain={`« Les 5/12 de 720 € » se calcule 720 ÷ 12 × 5 = 60 × 5 = ${formatDec(TOURNOI_EUROS)} €.`}
                explainFor={(n) =>
                  n === 60
                    ? `60 €, c’est UN douzième du budget. Il en faut cinq : 60 × 5 = ${formatDec(TOURNOI_EUROS)} €.`
                    : `« Les 5/12 de 720 € » se calcule 720 ÷ 12 × 5 = 60 × 5 = ${formatDec(TOURNOI_EUROS)} €.`
                }
                requires={['choisir-operation', 'produit-rationnels']}
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <Feedback tone="ok">
                  Prendre une fraction d’une quantité, c’est <strong>multiplier</strong> :{' '}
                  <MathText>{`$${formatFrac(TOURNOI)} \\times ${BUDGET} = ${formatDec(TOURNOI_EUROS)}$`}</MathText>{' '}
                  €.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Combien de maillots ?',
          subtitle: 'Un maillot coûte 12,50 € — et on ne coupe pas un maillot en deux.',
          done: q4,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt={
                  <>
                    Avec les {formatDec(TOURNOI_EUROS)} € du tournoi, combien de maillots à{' '}
                    {formatDec(12.5)} € le club peut-il acheter ?
                  </>
                }
                expected={MAILLOTS}
                parse={parseDec}
                display={formatDec(MAILLOTS)}
                suffix="maillots"
                explain={`${formatDec(TOURNOI_EUROS)} ÷ ${formatDec(12.5)} = ${formatDec(MAILLOTS)}. Diviser par 12,50, c'est multiplier par 2/25 — et le résultat tombe juste.`}
                explainFor={(n) =>
                  n > MAILLOTS
                    ? `Attention : chaque maillot coûte ${formatDec(12.5)} €, pas 1 €. ${formatDec(TOURNOI_EUROS)} ÷ ${formatDec(12.5)} = ${formatDec(MAILLOTS)}.`
                    : `${formatDec(TOURNOI_EUROS)} ÷ ${formatDec(12.5)} = ${formatDec(MAILLOTS)} maillots exactement.`
                }
                requires={['choisir-operation', 'quotient-rationnels']}
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <div className="space-y-3">
                  <CalcChain
                    steps={[
                      { label: 'Matériel', expr: '1/3 + 1/4', value: '7/12 du budget' },
                      { label: 'Tournoi', expr: '1 − 7/12', value: '5/12 du budget' },
                      { label: 'En euros', expr: `5/12 × ${formatDec(BUDGET)}`, value: `${formatDec(TOURNOI_EUROS)} €` },
                      { label: 'En maillots', expr: `${formatDec(TOURNOI_EUROS)} ÷ ${formatDec(12.5)}`, value: `${formatDec(MAILLOTS)} maillots` },
                    ]}
                  />
                  <Feedback tone="ok">
                    Quatre étapes, quatre opérations différentes — et chacune choisie pour ce qu’elle
                    veut dire dans l’histoire : additionner des dépenses, retirer du tout, prendre une
                    part d’une somme, faire des paquets.
                  </Feedback>
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Le vrai travail d’un problème n’est pas le calcul : c’est de
          choisir l’opération à chaque étape, puis de les enchaîner dans le bon ordre. Ta carte est
          complète — il ne reste qu’à la mettre à l’épreuve.
        </KnowledgeSnapshot>
      )}
    />
  );
}
