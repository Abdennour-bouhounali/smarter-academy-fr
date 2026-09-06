import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import BudgetBar from '../components/BudgetBar';
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
const PRIX_MAILLOT = rat(65, 2); // 32,50 €
// Le quotient exact — 9,23… — n'est PAS la réponse : on n'achète pas 0,23
// maillot, et on ne peut pas dépasser le budget. Tout est calculé, jamais écrit
// en dur, et un test unitaire vérifie que ce quotient n'est pas entier : sans
// quoi l'énoncé « on ne coupe pas un maillot en deux » redeviendrait un mensonge.
const MAILLOTS_EXACT = toDecimal(div(mul(TOURNOI, rat(BUDGET, 1)), PRIX_MAILLOT)); // 9,2307…
const MAILLOTS = Math.floor(MAILLOTS_EXACT); // 9
const RESTE_EUROS = TOURNOI_EUROS - MAILLOTS * toDecimal(PRIX_MAILLOT); // 7,50 €

export default function Module07BudgetDuClub() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q4b, setQ4b] = useState(false);
  // Étape 1 : le budget se COMPOSE, il ne se lit pas.
  const [seg, setSeg] = useState([
    { id: 'moteurs', label: 'moteurs', tone: 'sky', parts: 0 },
    { id: 'capteurs', label: 'capteurs', tone: 'amber', parts: 0 },
  ]);
  const composed = seg[0].parts === 4 && seg[1].parts === 3;

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
      steps={[
        {
          num: 1,
          title: 'Compose le budget du club',
          subtitle: 'Tire les frontières : un tiers pour les moteurs, un quart pour les capteurs.',
          done: composed,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le budget est découpé en <strong>douzièmes</strong> — la découpe commune de{' '}
                <MathText>{`$${formatFrac(MOTEURS)}$`}</MathText> et{' '}
                <MathText>{`$${formatFrac(CAPTEURS)}$`}</MathText>. Donne à chaque poste sa part, et
                regarde ce qu’il reste.
              </p>
              <BudgetBar
                den={12}
                segments={seg}
                onResize={(id, parts) => setSeg((cur) => cur.map((x) => (x.id === id ? { ...x, parts } : x)))}
                total={BUDGET}
                unknownLabel="? (tournoi)"
              />
              {!composed ? (
                <Feedback tone="info">
                  Un tiers de 12 parts, c’est <strong>4</strong> douzièmes ; un quart, c’est{' '}
                  <strong>3</strong> douzièmes. Tu es à {seg[0].parts} et {seg[1].parts}.
                </Feedback>
              ) : (
                <Feedback tone="ok">
                  4 douzièmes + 3 douzièmes = <strong>7 douzièmes</strong> de matériel, et il reste{' '}
                  <strong>5 douzièmes</strong> pour le tournoi. Tu viens de faire l’addition sans
                  l’écrire — reste à savoir la nommer.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
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
          num: 3,
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
          num: 4,
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
          num: 5,
          title: 'Combien de maillots ?',
          subtitle: `Un maillot coûte ${formatDec(toDecimal(PRIX_MAILLOT))} € — et on ne coupe pas un maillot en deux.`,
          done: q4 && q4b,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="interpreter-le-quotient"
                variant="new"
                lead="Cette fois la division ne va pas tomber juste. Ce que la calculatrice affiche n’est pas encore une réponse."
              />
              <NumericQuestion
                prompt={
                  <>
                    Avec les {formatDec(TOURNOI_EUROS)} € du tournoi, combien de maillots à{' '}
                    {formatDec(toDecimal(PRIX_MAILLOT))} € le club peut-il acheter ?
                  </>
                }
                expected={MAILLOTS}
                parse={parseDec}
                display={formatDec(MAILLOTS)}
                suffix="maillots"
                explain={
                  <>
                    {formatDec(TOURNOI_EUROS)} ÷ {formatDec(toDecimal(PRIX_MAILLOT))} ={' '}
                    <strong>{formatDec(MAILLOTS_EXACT, 2)}</strong> — et ça, ce n’est pas une réponse :
                    on n’achète pas {formatDec(MAILLOTS_EXACT - MAILLOTS, 2)} maillot. Le club peut en
                    prendre <strong>{formatDec(MAILLOTS)}</strong>, et il lui restera{' '}
                    {formatDec(RESTE_EUROS)} €.
                  </>
                }
                explainFor={(n) =>
                  (n === MAILLOTS + 1
                    ? `${formatDec(MAILLOTS + 1)} maillots coûteraient ${formatDec((MAILLOTS + 1) * toDecimal(PRIX_MAILLOT))} € — plus que les ${formatDec(TOURNOI_EUROS)} € disponibles. Le club ne peut pas dépasser son budget.`
                    : Math.abs(n - MAILLOTS_EXACT) < 0.5 && n !== MAILLOTS
                      ? `${formatDec(n)} est le résultat du calcul, pas la réponse : on n'achète pas de fraction de maillot. Il faut arrondir — et ici, vers le bas.`
                      : `${formatDec(TOURNOI_EUROS)} ÷ ${formatDec(toDecimal(PRIX_MAILLOT))} = ${formatDec(MAILLOTS_EXACT, 2)}, donc ${formatDec(MAILLOTS)} maillots.`)
                }
                requires={['choisir-operation', 'quotient-rationnels', 'interpreter-le-quotient']}
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
              {q4 && (
                <TapQuestion
                  prompt="Pourquoi arrondit-on VERS LE BAS ici, alors qu’on arrondirait vers le haut pour savoir combien de cars réserver ?"
                  options={[
                    'Parce qu’on ne peut pas dépasser le budget : un maillot de plus coûterait trop cher',
                    'Parce qu’on arrondit toujours un quotient vers le bas',
                    'Parce que 9,23 est plus proche de 9 que de 10',
                  ]}
                  cols={1}
                  correct={0}
                  explain={
                    <>
                      C’est la SITUATION qui tranche, jamais le calcul. Ici dépasser est interdit — le
                      club n’a que {formatDec(TOURNOI_EUROS)} € — donc on descend. Pour des cars, il
                      faut transporter tout le monde : rester en dessous laisserait des élèves à
                      quai, donc on monte. Même quotient, conclusion opposée.
                    </>
                  }
                  explainWrong={
                    <>
                      Ce n’est ni une règle d’arrondi automatique, ni une question de proximité :
                      9,9 maillots se serait quand même arrondi à 9, parce que 10 maillots coûteraient
                      plus que le budget. C’est la contrainte de l’énoncé qui décide du sens.
                    </>
                  }
                  requires={['interpreter-le-quotient', 'choisir-operation']}
                  solved={q4b}
                  onAnswered={() => setQ4b(true)}
                />
              )}
              {q4 && q4b && (
                <div className="space-y-3">
                  <CalcChain
                    steps={[
                      { label: 'Matériel', expr: '1/3 + 1/4', value: `${formatFrac(MATERIEL)} du budget` },
                      { label: 'Tournoi', expr: '1 − 7/12', value: `${formatFrac(TOURNOI)} du budget` },
                      { label: 'En euros', expr: `5/12 × ${formatDec(BUDGET)}`, value: `${formatDec(TOURNOI_EUROS)} €` },
                      { label: 'Le calcul', expr: `${formatDec(TOURNOI_EUROS)} ÷ ${formatDec(toDecimal(PRIX_MAILLOT))}`, value: `${formatDec(MAILLOTS_EXACT, 2)}` },
                      { label: 'La réponse', expr: 'on ne dépasse pas le budget', value: `${formatDec(MAILLOTS)} maillots` },
                    ]}
                  />
                  <Feedback tone="ok">
                    Cinq étapes, cinq gestes différents — additionner des dépenses, retirer du tout,
                    prendre une part d’une somme, faire des paquets, puis <strong>interpréter</strong>.
                    Et il reste {formatDec(RESTE_EUROS)} € dans la caisse.
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
