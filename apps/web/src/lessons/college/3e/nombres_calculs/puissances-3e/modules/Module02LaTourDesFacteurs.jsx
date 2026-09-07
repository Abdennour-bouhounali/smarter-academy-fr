import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PowerExplorer from '../components/PowerExplorer';
import { Tower } from '../components/FactorTower';
import { makeTower, removeFactor, addFactor } from '../components/factorTowerUtils';
import { formatDec, formatPower, pow } from '../components/powerUtils';

/**
 * Module 2 — DÉCOUVERTE : « La tour des facteurs ».
 *
 * Activity: régler librement une base et un exposant, puis dépiler une tour
 *   jusqu'à zéro et en dessous.
 * Mathematical objective: calculer des puissances, et comprendre que
 *   l'exposant est un COMPTE — d'où a^0 = 1 et a^{-n} = 1/a^n.
 * Student action: taper une puce de base, pousser −/+ sur l'exposant, puis
 *   taper les blocs de la tour pour les retirer un à un.
 * Controlled variable: (base, n) puis n seul.
 * Mathematical state: `{ base, n }` ; la valeur et les facteurs viennent de
 *   pow / expand.
 * Visual consequence: chaque cran retiré divise la valeur par la base ; à
 *   n = 0 la tour est vide et la valeur affiche 1 ; en dessous, les blocs
 *   passent sous le sol et l'écriture devient une fraction.
 * Expected observation: en descendant d'un cran, on divise par la base. Le
 *   cran juste avant 1/a est donc 1 : a^0 = 1 n'est pas une convention
 *   gratuite, c'est la suite du mouvement.
 * Misconception targeted: « a^0 = 0 » et « 10^{-2} = −100 » (un exposant
 *   négatif rendrait le nombre négatif).
 * Feedback: la valeur courante est comparée à la précédente (« divisée par
 *   la base »), l'écart au but est chiffré.
 * Formalization: étape 3, a^0 = 1 et a^{-n} = 1/a^n, après la descente.
 * Scaffolding: puces + stepper ; la descente se fait bloc par bloc.
 * Transfer: le module 3 réutilise la même tour pour les trois règles.
 */
const EXPLORE_BASE = 2;
const EXPLORE_TARGET = 5;

export default function Module02LaTourDesFacteurs() {
  const [base, setBase] = useState(EXPLORE_BASE);
  const [exp, setExp] = useState(1);
  const [tested, setTested] = useState([]);
  const [descN, setDescN] = useState(3);
  const [descVisited, setDescVisited] = useState([3]);
  const [zeroDone, setZeroDone] = useState(false);
  const [negDone, setNegDone] = useState(false);

  // But de l'étape 1 : avoir affiché au moins trois puissances différentes,
  // dont une d'exposant ≥ 4 (là où la valeur explose).
  const exploreDone = tested.length >= 3 && tested.some((t) => t.n >= EXPLORE_TARGET - 1);

  const record = (b, n, kitReact) => {
    const key = `${b}^${n}`;
    setTested((prev) => (prev.some((t) => t.key === key) ? prev : [...prev, { key, base: b, n }]));
    if (n >= EXPLORE_TARGET - 1) kitReact?.(true);
  };

  const descDone = descVisited.includes(0) && descVisited.some((v) => v < 0);

  /* L'exposant reste l'état du module ; la tour n'en est qu'une lecture.
     Négatif, il se traduit par des facteurs SOUS le sol (module 3). */
  const towerFor = (n) => {
    let t = makeTower(10, 0, 'a');
    for (let i = 0; i < Math.abs(n); i += 1) t = n > 0 ? addFactor(t, 'a') : removeFactor(t);
    return t;
  };

  const stepDown = (next) => {
    setDescN(next);
    setDescVisited((prev) => (prev.includes(next) ? prev : [...prev, next]));
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La tour des facteurs"
      moduleSubtitle="Choisis une base, empile des facteurs, dépile-les — jusqu’en dessous de zéro."
      estimatedTime="10 min"
      brief={{
        tag: '🧮 Mission 02',
        title: 'Deux réglages, et tous les nombres du monde.',
        body: (
          <p>
            La base dit quel nombre se répète, l’exposant dit combien de fois. Règle-les librement, observe
            la valeur — puis dépile une tour jusqu’au sol, et même en dessous.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Explore : change la base, change l’exposant',
          subtitle: `Affiche au moins trois puissances, dont une d’exposant ${EXPLORE_TARGET - 1} ou plus.`,
          done: exploreDone,
          content: (kit) => (
            <div className="space-y-3">
              <PowerExplorer
                base={base}
                n={exp}
                onBaseChange={(b) => {
                  setBase(b);
                  record(b, exp, kit.react);
                }}
                onExpChange={(n) => {
                  setExp(n);
                  record(base, n, kit.react);
                }}
                minN={0}
                maxN={6}
              />
              {!exploreDone && (
                <Feedback tone="info">
                  Tu as affiché <strong className="font-mono">{formatDec(tested.length)}</strong> puissance
                  {tested.length > 1 ? 's' : ''} différente{tested.length > 1 ? 's' : ''}. Il en faut{' '}
                  <strong className="font-mono">{formatDec(Math.max(0, 3 - tested.length))}</strong> de plus
                  {!tested.some((t) => t.n >= EXPLORE_TARGET - 1)
                    ? `, dont une avec un exposant d’au moins ${EXPLORE_TARGET - 1}`
                    : ''}
                  .
                </Feedback>
              )}
              {exploreDone && (
                <>
                  <Feedback tone="ok">
                    Un cran d’exposant en plus, et la valeur est <strong>multipliée par la base</strong> —
                    pas augmentée de la base. C’est pour ça que{' '}
                    <MathText>{`$${formatPower(2, 10)} = ${formatDec(pow(2, 10))}$`}</MathText> alors que{' '}
                    <MathText>{'$2 \\times 10 = 20$'}</MathText>.
                  </Feedback>
                  <KnowledgeBrick
                    id="calculer-puissance"
                    variant="new"
                    lead="Tu as réglé la base et l’exposant toi-même, et vu la valeur bondir d’un cran à l’autre."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Calcule quelques puissances',
          subtitle: 'Une ligne par puissance, la correction arrive au dernier choix.',
          done: zeroDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque écriture, choisis la bonne valeur. Un seul piège se répète : confondre
                  l’exposant avec un facteur.
                </p>
              }
              rows={[
                { id: 'r1', label: <MathText>{'$3^{2}$'}</MathText>, options: ['6', '9', '5'], correct: 1, correction: '3 × 3 = 9 (6, c’est 3 × 2)' },
                { id: 'r2', label: <MathText>{'$2^{4}$'}</MathText>, options: ['8', '16', '6'], correct: 1, correction: '2 × 2 × 2 × 2 = 16' },
                { id: 'r3', label: <MathText>{'$5^{3}$'}</MathText>, options: ['15', '125', '25'], correct: 1, correction: '5 × 5 × 5 = 125 (25, c’est 5²)' },
                { id: 'r4', label: <MathText>{'$10^{4}$'}</MathText>, options: ['40', '1 000', '10 000'], correct: 2, correction: '10 × 10 × 10 × 10 = 10 000 : quatre zéros' },
              ]}
              feedback={({ allRight, nCorrect, total }) =>
                allRight ? (
                  <Feedback tone="ok">
                    Quatre sur quatre. L’exposant compte les facteurs : pour{' '}
                    <MathText>{'$10^{4}$'}</MathText> on écrit quatre 10, donc quatre zéros.
                  </Feedback>
                ) : (
                  <Feedback tone="ko">
                    <strong className="font-mono">
                      {formatDec(nCorrect)} / {formatDec(total)}
                    </strong>{' '}
                    — les bonnes valeurs sont maintenant en vert. Le piège commun :{' '}
                    <MathText>{'$3^{2}$'}</MathText> vaut 9 (3 × 3), pas 6 (3 × 2). L’exposant n’est pas un
                    facteur, c’est un COMPTE de facteurs.
                  </Feedback>
                )
              }
              requires={['calculer-puissance', 'exposant-compte']}
              solved={zeroDone}
              onAnswered={() => setZeroDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Descends la tour jusqu’au sol, puis en dessous',
          subtitle: 'Tape les blocs pour les retirer un par un.',
          done: descDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                La tour est en base <strong>10</strong>. Chaque bloc retiré divise la valeur par 10.
                Descends jusqu’à la tour vide, puis continue.
              </p>
              {/* La tour est DÉRIVÉE de `descN` : le module garde son état
                  (descN, descVisited) et la figure n'en est que la lecture.
                  Un bloc porte « 10 », pas « × 10 » — c'est un facteur, et
                  le × vit entre les blocs. */}
              {/* §16bis — les commandes sont À CÔTÉ de la tour, pas dessous.
                  La tour monte et descend sous son sol : des boutons placés
                  après elle se déroberaient sous le doigt à chaque geste.
                  Une colonne latérale est insensible à la hauteur, donc le
                  curseur ne bouge plus. Sous 640 px il n'y a pas la largeur
                  pour une colonne : on repasse en ligne, et c'est là qu'on
                  réserve la hauteur maximale de la figure. */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-6">
                <div
                  className="flex justify-center order-1 sm:order-none"
                  style={{ minHeight: 4 * 44 + 3 * 18 + 96 }}
                >
                  <Tower
                    tower={towerFor(descN)}
                    title="Tour de base 10"
                    onRemoveTop={() => {
                      const v = descN - 1;
                      if (v < -2) return;
                      stepDown(v);
                      if (v <= -1 && !descDone) kit.react(true);
                    }}
                  />
                </div>
                <div className="flex sm:flex-col justify-center gap-2 order-2 sm:order-none shrink-0">
                  <button
                    type="button"
                    onClick={() => { if (descN < 4) stepDown(descN + 1); }}
                    aria-label="Ajouter un facteur 10 à la tour"
                    className="min-h-[44px] px-4 rounded-xl border-2 bg-sky-600 border-sky-700 text-white text-sm font-bold hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Ajouter un facteur
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (descN > -2) { const v = descN - 1; stepDown(v); if (v <= -1 && !descDone) kit.react(true); } }}
                    aria-label="Retirer un facteur 10 de la tour"
                    className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    Retirer un facteur
                  </button>
                </div>
              </div>
              {!descDone && (
                <Feedback tone="info">
                  Valeur actuelle : <strong className="font-mono">{formatDec(pow(10, descN), { maxDecimals: 6 })}</strong>.{' '}
                  {!descVisited.includes(0)
                    ? `Encore ${formatDec(descN)} bloc${descN > 1 ? 's' : ''} à retirer pour vider la tour.`
                    : 'La tour est vide — que se passe-t-il si on retire encore un bloc ?'}
                </Feedback>
              )}
              {descDone && (
                <>
                  <Feedback tone="ok">
                    Chaque cran divise par 10 : 1 000 → 100 → 10 → <strong className="font-mono">1</strong> →{' '}
                    <strong className="font-mono">0,1</strong>. Le mouvement ne s’arrête pas à la tour vide.
                  </Feedback>
                  <KnowledgeBrick
                    id="exposant-nul"
                    variant="new"
                    compact
                    lead="Tu as retiré le dernier bloc, et l’affichage n’est pas tombé à zéro."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Ce que veut dire un exposant négatif',
          done: negDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick
                id="exposant-negatif"
                variant="new"
                lead="Sous le sol, la tour a continué à se diviser par 10 — et la valeur est restée positive."
              >
              <TapQuestion
                prompt={
                  <>
                    Combien vaut <MathText>{'$10^{-2}$'}</MathText> ?
                  </>
                }
                options={['$-100$', '$0{,}01$', '$-0{,}01$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['−100', '0,01', '−0,01'][i]}
                correctionLabel="0,01"
                cols={3}
                correct={1}
                explain={
                  <>
                    <MathText>{'$10^{-2} = \\frac{1}{10^{2}} = \\frac{1}{100} = 0{,}01$'}</MathText> — un
                    nombre positif, mais petit.
                  </>
                }
                explainWrong={
                  <>
                    Le signe « − » de l’exposant ne descend pas sur le nombre. Sur la tour, deux blocs sous
                    le sol veulent dire « divisé deux fois par 10 » : de 1 on passe à 0,1 puis à 0,01. Jamais
                    de valeur négative.
                  </>
                }
                requires={['exposant-negatif']}
                solved={negDone}
                onAnswered={() => setNegDone(true)}
              />
              </KnowledgeBrick>
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          Au module suivant, deux tours vont fusionner — et c’est encore le compte des blocs qui décidera
          du résultat.
        </KnowledgeSnapshot>
      )}
    />
  );
}
