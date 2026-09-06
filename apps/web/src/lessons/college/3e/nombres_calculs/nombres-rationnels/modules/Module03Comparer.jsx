import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  expandTo, formatDec, formatFrac, rat, roundTo, toDecimal,
} from '../components/rationalUtils';

/**
 * Module 3 — DÉCOUVERTE : « Comparer ».
 *
 * Activity: placer 3/4 et 2/3 sur la même droite graduée en douzièmes, puis
 *   lire lequel est à droite.
 * Mathematical objective: comparer deux rationnels, c'est regarder qui est le
 *   plus à DROITE sur la droite ; la découpe commune rend la lecture immédiate.
 * Student action: pousser −/+ ou taper une puce de position (tap-first), puis
 *   valider ; le curseur est aussi déplaçable au doigt.
 * Controlled variable: la position du curseur, au pas 1/12.
 * Mathematical state: la position en douzièmes (un entier) ; la fraction
 *   affichée, la distance à la cible et la validation en dérivent.
 * Visual consequence: le repère de la cible apparaît après validation ; la
 *   droite montre les deux points côte à côte.
 * Expected observation: 9/12 est à droite de 8/12, donc 3/4 > 2/3 — alors que
 *   3 < 2 est faux et que 4 > 3 aurait fait croire l'inverse.
 * Misconception targeted: « 1/4 > 1/2 car 4 > 2 » (plus le dénominateur est
 *   grand, plus la part est PETITE) et « −3/4 > −1/2 car 3 > 1 ».
 * Feedback: l'écart au point cible est donné en douzièmes ET en décimal.
 * Formalization: la stratégie de la découpe commune et le piège du grand
 *   dénominateur vivent dans `knowledge.jsx` ; des <KnowledgeBrick> les posent
 *   après le placement du curseur (étape 1) et après le verdict de l'étape 2.
 *   Le mot PPCM n'est PAS prononcé ici : il est posé au module 4
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: puces de positions remarquables + stepper ; après 3 essais,
 *   « montre-moi » place le curseur.
 * Transfer: étape 4, ranger quatre rationnels dont deux négatifs.
 */
const A = rat(3, 4);
const B = rat(2, 3);
const DEN = 12;
const TARGET_TWELFTHS = expandTo(A, DEN).num; // 9
const STEP = roundTo(1 / DEN, 6);

const fmt = (x) => formatDec(x, { maxDecimals: 2 });

export default function Module03Comparer() {
  const [pos, setPos] = useState(roundTo(6 / DEN));
  const [tries, setTries] = useState(0);
  const [placed, setPlaced] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [sortDone, setSortDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);
  const [negDone, setNegDone] = useState(false);

  const twelfths = Math.round(pos * DEN);
  const onTarget = twelfths === TARGET_TWELFTHS;

  const move = (d) => {
    const next = roundTo(Math.min(1, Math.max(0, pos + d * STEP)));
    setPos(next);
    if (Math.round(next * DEN) !== TARGET_TWELFTHS) setTries((t) => t + 1);
  };

  const validate = (kitReact) => {
    setPlaced(true);
    kitReact?.(onTarget);
  };

  const showMe = (kitReact) => {
    setPos(roundTo(TARGET_TWELFTHS / DEN));
    setRevealed(true);
    setPlaced(true);
    kitReact?.(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Comparer"
      moduleSubtitle="Place deux rationnels sur la droite — celui de droite est le plus grand."
      estimatedTime="9 min"
      brief={{
        tag: '📏 Mission 03',
        title: 'Le plus grand, c’est celui qui est le plus à droite.',
        body: (
          <p>
            Un repère marque déjà <MathText>{`$${formatFrac(B)}$`}</MathText>. À toi de placer{' '}
            <MathText>{`$${formatFrac(A)}$`}</MathText> sur la même droite, découpée en douzièmes.
            Ensuite, il n’y aura plus qu’à regarder.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Place ${'3/4'} sur la droite`,
          subtitle: 'La droite est graduée en douzièmes — pousse − ou +.',
          done: placed && (onTarget || revealed),
          content: (kit) => (
            <div className="space-y-3">
              <NumberLine
                min={0}
                max={1}
                step={STEP}
                labelEvery={3}
                mode="place"
                value={pos}
                onChange={(v) => {
                  setPos(roundTo(v));
                  if (Math.round(v * DEN) !== TARGET_TWELFTHS) setTries((t) => t + 1);
                }}
                snap={STEP}
                revealValue={false}
                format={fmt}
                markers={[{ value: toDecimal(B, 6), label: '2/3', color: '#7c3aed' }]}
                ghost={placed ? { value: toDecimal(A, 6), label: '3/4' } : null}
                ariaLabel="Droite graduée en douzièmes, de 0 à 1"
                height={190}
              />
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => move(-1)}
                  disabled={twelfths <= 0}
                  aria-label="Reculer d’un douzième"
                  className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-cyan-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  −
                </button>
                <span className="font-mono text-base font-extrabold text-slate-800 tabular-nums w-28 text-center">
                  {twelfths} / {DEN}
                </span>
                <button
                  type="button"
                  onClick={() => move(1)}
                  disabled={twelfths >= DEN}
                  aria-label="Avancer d’un douzième"
                  className="min-w-[52px] min-h-[44px] rounded-xl border-2 border-slate-300 bg-white text-xl font-bold text-slate-700 hover:border-cyan-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => validate(kit.react)}
                  aria-label="Valider la position du curseur"
                  className="min-h-[44px] px-4 rounded-xl border-2 border-cyan-600 bg-cyan-600 text-sm font-bold text-white hover:bg-cyan-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                >
                  Valider ma position
                </button>
              </div>

              {!placed && (
                <Feedback tone="info">
                  Le curseur est sur <strong className="font-mono">{twelfths}/{DEN}</strong>. Combien de
                  douzièmes font <MathText>{`$${formatFrac(A)}$`}</MathText> ? Chaque quart vaut 3
                  douzièmes.
                </Feedback>
              )}
              {placed && !onTarget && !revealed && (
                <Feedback tone="ko">
                  Ta position : <strong className="font-mono">{twelfths}/{DEN}</strong> (
                  {fmt(pos)}). Bonne réponse : <strong className="font-mono">{TARGET_TWELFTHS}/{DEN}</strong> (
                  {fmt(toDecimal(A, 4))}) — tu es à{' '}
                  <strong className="font-mono">{Math.abs(TARGET_TWELFTHS - twelfths)}</strong> douzième
                  {Math.abs(TARGET_TWELFTHS - twelfths) > 1 ? 's' : ''} de la cible. Un quart, c’est 3
                  douzièmes, donc trois quarts font 3 × 3 = 9 douzièmes.
                </Feedback>
              )}
              {placed && (onTarget || revealed) && (
                <Feedback tone="ok">
                  <MathText>{`$${formatFrac(A)} = \\frac{${TARGET_TWELFTHS}}{${DEN}}$`}</MathText> et{' '}
                  <MathText>{`$${formatFrac(B)} = \\frac{${expandTo(B, DEN).num}}{${DEN}}$`}</MathText>.
                  Sur la droite, 9 douzièmes est à DROITE de 8 douzièmes : donc{' '}
                  <MathText>{`$${formatFrac(A)} > ${formatFrac(B)}$`}</MathText>.
                  {revealed && ' (La position t’a été montrée — refais-la à la main.)'}
                </Feedback>
              )}
              {placed && (onTarget || revealed) && (
                <KnowledgeBrick
                  id="comparer-rationnels"
                  variant="new"
                  lead="Une fois les deux nombres sur la même droite, en douzièmes, il n’y a plus rien à calculer : il suffit de regarder."
                />
              )}
              {!placed && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le piège du grand dénominateur',
          done: ruleDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt={
                <>
                  Un élève affirme : « <MathText>{'$\\frac{1}{4} > \\frac{1}{2}$'}</MathText> puisque
                  4 &gt; 2 ». Qu’en penses-tu ?
                </>
              }
              options={[
                'C’est faux : plus on coupe en parts nombreuses, plus chaque part est PETITE',
                'C’est vrai : un plus grand dénominateur donne un plus grand nombre',
                'On ne peut pas comparer deux fractions de dénominateurs différents',
              ]}
              cols={1}
              correct={0}
              explain={
                <>
                  Le dénominateur dit en combien de parts on découpe le MÊME gâteau : en 4 parts, chaque
                  part est plus petite qu’en 2 parts.{' '}
                  <MathText>{'$\\frac{1}{4} = 0{,}25$'}</MathText> et{' '}
                  <MathText>{'$\\frac{1}{2} = 0{,}5$'}</MathText> : le quart est bien à GAUCHE sur la
                  droite.
                </>
              }
              explainWrong={
                <>
                  Comparer est toujours possible : il suffit d’une découpe commune —{' '}
                  <MathText>{'$\\frac{1}{4}$'}</MathText> contre{' '}
                  <MathText>{'$\\frac{2}{4}$'}</MathText>, et 1 &lt; 2. Le grand dénominateur ne rend
                  pas grand : il rend les parts plus fines. Un quart de pizza est plus petit qu’une
                  demi-pizza.
                </>
              }
              requires={['comparer-rationnels', 'ecritures-equivalentes']}
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
            {ruleDone && (
              <KnowledgeBrick
                id="piege-denominateur"
                variant="new"
                compact
                lead="C’est l’erreur la plus tenace de tout le collège. Voilà comment ne plus jamais y tomber."
              />
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La stratégie sûre : même découpe',
          done: sortDone,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Trois duels, à toi de trancher. Cherche à chaque fois une découpe qui convient aux
                deux nombres.
              </p>
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Dans chaque duel, quel nombre est le plus grand ?</p>}
                rows={[
                  { id: 'd1', label: <MathText>{'$\\frac{3}{5}$'}</MathText>, options: ['$\\frac{3}{5}$', '$\\frac{2}{3}$'].map((o) => <MathText key={o}>{o}</MathText>), correct: 1, correction: '9/15 contre 10/15 : 2/3 gagne.' },
                  { id: 'd2', label: <MathText>{'$\\frac{7}{8}$'}</MathText>, options: ['$\\frac{7}{8}$', '$\\frac{5}{6}$'].map((o) => <MathText key={o}>{o}</MathText>), correct: 0, correction: '21/24 contre 20/24 : 7/8 gagne.' },
                  { id: 'd3', label: <MathText>{'$\\frac{1}{3}$'}</MathText>, options: ['$\\frac{1}{3}$', '$\\frac{1}{5}$'].map((o) => <MathText key={o}>{o}</MathText>), correct: 0, correction: '5/15 contre 3/15 : 1/3 gagne — le plus petit dénominateur donne la plus grosse part.' },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'info'}>
                    {allRight
                      ? 'Trois duels, trois découpes communes : 15es, 24es, 15es. Le numérateur tranche à chaque fois.'
                      : `${nCorrect} / ${total}. Le réflexe : une découpe qui convient aux deux dénominateurs, puis on compare les numérateurs. Ne jamais comparer les dénominateurs entre eux.`}
                  </Feedback>
                )}
                requires={['comparer-rationnels', 'piege-denominateur', 'ecritures-equivalentes']}
                solved={sortDone}
                onAnswered={() => setSortDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Et à gauche de zéro ?',
          done: negDone,
          content: (
            <div className="space-y-4">
              <NumberLine
                min={-1}
                max={0}
                step={0.25}
                labelEvery={1}
                mode="static"
                format={fmt}
                markers={[
                  { value: -0.75, label: '−3/4', color: '#e11d48' },
                  { value: -0.5, label: '−1/2', color: '#0891b2' },
                ]}
                ariaLabel="Droite graduée de −1 à 0"
                height={170}
              />
              <TapQuestion
                prompt={
                  <>
                    Lequel est le plus grand : <MathText>{'$-\\frac{3}{4}$'}</MathText> ou{' '}
                    <MathText>{'$-\\frac{1}{2}$'}</MathText> ?
                  </>
                }
                options={['$-\\frac{1}{2}$', '$-\\frac{3}{4}$', 'Ils sont égaux']}
                renderOption={(o) => (o.startsWith('$') ? <MathText>{o}</MathText> : o)}
                optionLabel={(i) => ['−1/2', '−3/4', 'égaux'][i]}
                correctionLabel="−1/2"
                cols={3}
                correct={0}
                explain={
                  <>
                    Sur la droite, <MathText>{'$-\\frac{1}{2}$'}</MathText> (
                    {fmt(-0.5)}) est à DROITE de <MathText>{'$-\\frac{3}{4}$'}</MathText> (
                    {fmt(-0.75)}). Chez les négatifs, la plus grosse part est la PLUS PETITE : on
                    s’enfonce plus loin à gauche.
                  </>
                }
                explainWrong={
                  <>
                    Le piège des négatifs : 3/4 est plus grand que 1/2, mais avec le signe moins tout
                    s’inverse. Regarde la droite : <MathText>{'$-\\frac{3}{4}$'}</MathText> est plus à
                    GAUCHE, donc plus petit. La règle « le plus à droite est le plus grand » ne se
                    trompe jamais, elle.
                  </>
                }
                requires={['comparer-rationnels', 'piege-denominateur', 'signe-fraction']}
                solved={negDone}
                onAnswered={() => setNegDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Comparer, c’est positionner — et la découpe commune fait tout le
          travail. Au module suivant, cette même découpe devient la <em>condition</em> pour pouvoir
          additionner.
        </KnowledgeSnapshot>
      )}
    />
  );
}
