import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  formatDec, parseDec, approxRoot, formatRoot, formatSqrt, simplifyRoot, roundTo,
} from '../components/rootUtils';

/**
 * Module 6 — LABORATOIRE : « Pythagore et compagnie ».
 *
 * Activity: calculer des longueurs qui SORTENT en racine — la diagonale d'un
 *   carré, une hypoténuse — puis comparer et arrondir.
 * Mathematical objective: mobiliser √ dans un calcul complet (Pythagore),
 *   donner la valeur exacte ET l'arrondi, et comparer sans calculatrice.
 * Student action: QCM sur les formes exactes, saisie NUMÉRIQUE pour les
 *   arrondis (aucune saisie symbolique nulle part).
 * Controlled variable: —, ce module est un laboratoire d'application.
 * Mathematical state: les longueurs, dérivées de rootUtils (jamais un
 *   nombre recopié à la main dans le JSX).
 * Visual consequence: chaque figure (carré + diagonale, triangle rectangle)
 *   porte ses mesures.
 * Expected observation: la diagonale d'un carré de côté 5 vaut 5√2, pas 10 ;
 *   une hypoténuse peut ne pas être entière et rester exacte sous forme √.
 * Misconception targeted: « la diagonale, c'est deux côtés » (5 + 5), et
 *   « √50 ≈ 7 donc la valeur exacte est 7 » (arrondi pris pour l'exact).
 * Feedback: chaque erreur numérique reçoit la valeur attendue formatée à la
 *   française (parseDec / display).
 * Formalization: la valeur exacte s'écrit avec √ ; l'arrondi ne sert qu'à
 *   se représenter la taille.
 * Scaffolding: Pythagore rappelé en encadré avant l'application.
 * Transfer: les épreuves 9 et 10 du boss.
 */
const DIAG_SIDE = 5;                                   // carré de côté 5
const DIAG = simplifyRoot(DIAG_SIDE * DIAG_SIDE * 2);  // 5√2
const HYP = simplifyRoot(3 * 3 + 6 * 6);               // √45 = 3√5

export default function Module06PythagoreEtCie() {
  const [diagDone, setDiagDone] = useState(false);
  const [roundDone, setRoundDone] = useState(false);
  const [hypDone, setHypDone] = useState(false);
  const [compareDone, setCompareDone] = useState(false);
  const [calcDone, setCalcDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Pythagore et compagnie"
      moduleSubtitle="Les racines au travail : diagonales, hypoténuses, comparaisons."
      estimatedTime="11 min"
      brief={{
        tag: '📐 Mission 06',
        title: 'Là où les racines apparaissent vraiment.',
        body: (
          <p>
            Dès qu’on mesure en diagonale, les longueurs cessent d’être entières. Tu vas calculer la
            diagonale d’un carré, une hypoténuse, puis comparer des longueurs qui contiennent des racines
            — <strong>sans jamais confondre la valeur exacte et son arrondi</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La diagonale d’un carré',
          subtitle: 'Un carré de 5 cm de côté. Combien mesure sa diagonale ?',
          done: diagDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 flex justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-auto max-w-[200px]" role="img" aria-label="Carré de 5 cm de côté avec sa diagonale">
                  <g pointerEvents="none">
                    <rect x="30" y="30" width="130" height="130" fill="#ffe4e6" stroke="#e11d48" strokeWidth="2.5" />
                    <line x1="30" y1="160" x2="160" y2="30" stroke="#be123c" strokeWidth="3" />
                    <text x="95" y="178" textAnchor="middle" fontSize="13" fill="#9f1239" fontFamily="monospace">5 cm</text>
                    <text x="20" y="100" textAnchor="middle" fontSize="13" fill="#9f1239" fontFamily="monospace">5</text>
                    <text x="105" y="88" fontSize="13" fill="#be123c" fontFamily="monospace" fontWeight="bold">d = ?</text>
                    <rect x="30" y="140" width="20" height="20" fill="none" stroke="#e11d48" strokeWidth="1.5" />
                  </g>
                </svg>
              </div>

              <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 p-3 text-center">
                <p className="text-xs uppercase font-mono font-bold text-rose-700">Pythagore</p>
                <MathText className="text-slate-800">{'$d^{2} = 5^{2} + 5^{2} = 25 + 25 = 50$'}</MathText>
              </div>

              <KnowledgeBrick
                id="racines-en-geometrie"
                variant="new"
                lead="Pythagore te donne le CARRÉ de la diagonale. Il reste un pas — celui que tu fais depuis le module 1."
              >
              <TapQuestion
                prompt="Quelle est la valeur EXACTE de la diagonale ?"
                options={['$10 \\text{ cm}$', '$\\sqrt{50} = 5\\sqrt{2} \\text{ cm}$', '$50 \\text{ cm}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['10 cm', '√50 = 5√2 cm', '50 cm'][i]}
                correctionLabel="√50 = 5√2 cm"
                cols={1}
                correct={1}
                explain={
                  <>
                    <MathText>{'$d^{2} = 50$'}</MathText>, donc <MathText>{'$d = \\sqrt{50}$'}</MathText>,
                    qui se simplifie en <MathText>{`$${formatRoot(DIAG)}$`}</MathText> (car 50 = 25 × 2).
                    C’est une longueur bien réelle, ≈ {formatDec(approxRoot(50, 2))} cm.
                  </>
                }
                explainWrong={
                  <>
                    10 cm, ce serait deux côtés mis bout à bout — la diagonale est plus courte que ça (elle
                    coupe au plus court !). 50 cm, c’est <MathText>{'$d^{2}$'}</MathText>, une AIRE, pas une
                    longueur : il reste à prendre la racine. Réponse :{' '}
                    <MathText>{`$\\sqrt{50} = ${formatRoot(DIAG)}$`}</MathText> cm.
                  </>
                }
                requires={['racines-en-geometrie', 'racine-carree', 'simplifier-racine']}
                solved={diagDone}
                onAnswered={() => setDiagDone(true)}
              />
              </KnowledgeBrick>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Exact ou arrondi ?',
          subtitle: 'Les deux servent, mais pas au même moment.',
          done: roundDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Pour commander une planche, il faut un nombre lisible. Mais lequel des deux nombres
                écrit-on sur le bon de commande ?
              </p>
              <KnowledgeBrick
                id="exact-vs-approche"
                variant="new"
                lead="Tu viens d’écrire la diagonale sous deux formes : 5√2, et « environ 7,07 ». Elles n’ont pas le même rôle."
              >
              <NumericQuestion
                prompt="Diagonale arrondie au dixième (en cm) :"
                expected={approxRoot(50, 1)}
                parse={parseDec}
                display={formatDec(approxRoot(50, 1))}
                suffix="cm"
                explain={
                  <>
                    <MathText>{'$\\sqrt{50} \\approx 7{,}07$'}</MathText>, donc environ{' '}
                    <strong className="font-mono">{formatDec(approxRoot(50, 1))} cm</strong>. La valeur
                    EXACTE reste <MathText>{`$${formatRoot(DIAG)}$`}</MathText> — l’arrondi ne la remplace
                    pas, il l’approche.
                  </>
                }
                explainFor={(n) =>
                  n === 7 ? (
                    <>
                      7, c’est <MathText>{'$\\sqrt{49}$'}</MathText>, pas{' '}
                      <MathText>{'$\\sqrt{50}$'}</MathText> : il manque un dixième. Au dixième près, √50 ≈{' '}
                      {formatDec(approxRoot(50, 1))}.
                    </>
                  ) : n === 25 ? (
                    <>
                      25, c’est la moitié de 50 : la racine n’est pas la moitié. √50 ≈{' '}
                      {formatDec(approxRoot(50, 1))}.
                    </>
                  ) : (
                    <>
                      On cherche le nombre dont le carré vaut 50 : entre 7 (49) et 8 (64), tout près de 7.
                      Arrondi au dixième : {formatDec(approxRoot(50, 1))}.
                    </>
                  )
                }
                requires={['exact-vs-approche', 'racines-en-geometrie']}
                solved={roundDone}
                onAnswered={() => setRoundDone(true)}
              />
              </KnowledgeBrick>
            </div>
          ),
        },
        {
          num: 3,
          title: 'Une hypoténuse qui n’est pas entière',
          subtitle: 'Triangle rectangle de côtés 3 et 6.',
          done: hypDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 flex justify-center">
                <svg viewBox="0 0 220 160" className="w-full h-auto max-w-[240px]" role="img" aria-label="Triangle rectangle de côtés 6 et 3">
                  <g pointerEvents="none">
                    <polygon points="30,130 180,130 30,60" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                    <rect x="30" y="112" width="18" height="18" fill="none" stroke="#0284c7" strokeWidth="1.5" />
                    <text x="105" y="148" textAnchor="middle" fontSize="13" fill="#0369a1" fontFamily="monospace">6 cm</text>
                    <text x="18" y="98" textAnchor="middle" fontSize="13" fill="#0369a1" fontFamily="monospace">3</text>
                    <text x="115" y="85" fontSize="13" fill="#0c4a6e" fontFamily="monospace" fontWeight="bold">h = ?</text>
                  </g>
                </svg>
              </div>

              <TapQuestion
                prompt={
                  <>
                    <MathText>{'$h^{2} = 3^{2} + 6^{2} = 9 + 36 = 45$'}</MathText>. Quelle est la forme
                    simplifiée de <MathText>{'$h$'}</MathText> ?
                  </>
                }
                options={['$3\\sqrt{5}$', '$9\\sqrt{5}$', '$5\\sqrt{3}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['3√5', '9√5', '5√3'][i]}
                correctionLabel="3√5"
                cols={3}
                correct={0}
                explain={
                  <>
                    45 = 9 × 5, et 9 est le plus grand carré parfait qui divise 45 :{' '}
                    <MathText>{`$\\sqrt{45} = ${formatRoot(HYP)}$`}</MathText> ≈{' '}
                    {formatDec(approxRoot(45, 2))} cm.
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$9\\sqrt{5}$'}</MathText> sort le 9 <em>sans</em> lui prendre sa racine ; il
                    faut sortir <MathText>{'$\\sqrt{9} = 3$'}</MathText>.{' '}
                    <MathText>{'$5\\sqrt{3}$'}</MathText> intervertit les deux nombres — son carré vaut
                    25 × 3 = 75, pas 45. Réponse : <MathText>{`$${formatRoot(HYP)}$`}</MathText>.
                  </>
                }
                requires={['racines-en-geometrie', 'simplifier-racine', 'carre-parfait']}
                solved={hypDone}
                onAnswered={() => setHypDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Ranger trois longueurs',
          subtitle: 'On compare par les carrés, jamais à l’œil.',
          done: compareDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque paire, quel signe convient ? Astuce : compare les carrés (
                  <MathText>{'$(2\\sqrt{3})^{2} = 4 \\times 3 = 12$'}</MathText>).
                </p>
              }
              rows={[
                {
                  id: 'c1',
                  label: <MathText>{'$\\sqrt{30} \\;?\\; 5$'}</MathText>,
                  options: ['<', '>', '='],
                  correct: 1,
                  correction: '30 > 25',
                },
                {
                  id: 'c2',
                  label: <MathText>{'$2\\sqrt{3} \\;?\\; 3\\sqrt{2}$'}</MathText>,
                  options: ['<', '>', '='],
                  correct: 0,
                  correction: '12 < 18',
                },
                {
                  id: 'c3',
                  label: <MathText>{'$\\sqrt{18} \\;?\\; 3\\sqrt{2}$'}</MathText>,
                  options: ['<', '>', '='],
                  correct: 2,
                  correction: '18 = 18',
                },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? (
                    <>
                      {total} / {total}. Chaque fois, on a comparé les <strong>carrés</strong> : 30 contre
                      25 ; 12 contre 18 ; 18 contre 18 — et{' '}
                      <MathText>{'$\\sqrt{18} = 3\\sqrt{2}$'}</MathText>, ce sont deux écritures du même
                      nombre.
                    </>
                  ) : (
                    <>
                      {nCorrect} / {total}. Méthode : élever les deux au carré.{' '}
                      <MathText>{'$(\\sqrt{30})^{2} = 30 > 25 = 5^{2}$'}</MathText> ;{' '}
                      <MathText>{'$(2\\sqrt{3})^{2} = 12 < 18 = (3\\sqrt{2})^{2}$'}</MathText> ; et{' '}
                      <MathText>{'$\\sqrt{18} = \\sqrt{9 \\times 2} = 3\\sqrt{2}$'}</MathText>, donc
                      égalité.
                    </>
                  )}
                </Feedback>
              )}
              requires={['comparer-par-carres', 'coefficient-sous-racine', 'simplifier-racine']}
              solved={compareDone}
              onAnswered={() => setCompareDone(true)}
            />
          ),
        },
        {
          num: 5,
          title: 'Un calcul complet',
          subtitle: 'Aire d’un carré dont on connaît la diagonale.',
          done: calcDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Un carreau carré a une diagonale de <MathText>{'$\\sqrt{72}$'}</MathText> cm. Comme{' '}
                <MathText>{'$d^{2} = c^{2} + c^{2} = 2c^{2}$'}</MathText>, on a{' '}
                <MathText>{'$2c^{2} = 72$'}</MathText>, donc <MathText>{'$c^{2} = 36$'}</MathText>.
              </p>
              <NumericQuestion
                prompt="Quelle est l'AIRE du carreau, en cm² ?"
                expected={36}
                parse={parseDec}
                display={formatDec(36)}
                suffix="cm²"
                explain={
                  <>
                    L’aire d’un carré, c’est <MathText>{'$c^{2}$'}</MathText> — et on l’a déjà :{' '}
                    <strong className="font-mono">36 cm²</strong>. Inutile de calculer le côté (qui vaut
                    6 cm) pour le remettre au carré ensuite.
                  </>
                }
                explainFor={(n) =>
                  n === 6 ? (
                    <>
                      6, c’est le CÔTÉ (<MathText>{'$\\sqrt{36} = 6$'}</MathText>). L’aire, c’est son carré :{' '}
                      <strong className="font-mono">36 cm²</strong>.
                    </>
                  ) : n === 72 ? (
                    <>
                      72, c’est <MathText>{'$d^{2}$'}</MathText>, le carré de la DIAGONALE — soit le double
                      de l’aire. L’aire vaut 72 ÷ 2 = <strong className="font-mono">36 cm²</strong>.
                    </>
                  ) : (
                    <>
                      De <MathText>{'$2c^{2} = 72$'}</MathText> on tire{' '}
                      <MathText>{'$c^{2} = 36$'}</MathText>, et <MathText>{'$c^{2}$'}</MathText> est
                      justement l’aire : <strong className="font-mono">36 cm²</strong>.
                    </>
                  )
                }
                requires={['carre-de-la-racine', 'racines-en-geometrie']}
                solved={calcDone}
                onAnswered={() => setCalcDone(true)}
              />
              {calcDone && (
                <Feedback tone="info">
                  Vérification : côté <MathText>{'$\\sqrt{36} = 6$'}</MathText> cm, diagonale{' '}
                  <MathText>{`$6\\sqrt{2} = \\sqrt{72}$`}</MathText> ≈{' '}
                  {formatDec(roundTo(approxRoot(72, 2), 2))} cm. Tout se recolle.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={6}>
          La carte est complète. Il ne reste qu’à la mettre à l’épreuve, du jardin de 49 m² à
          l’hypoténuse.
        </KnowledgeSnapshot>
      )}
    />
  );
}
