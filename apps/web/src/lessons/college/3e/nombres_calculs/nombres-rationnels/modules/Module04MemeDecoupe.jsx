import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RationalBar from '../components/RationalBar';
import CommonDenominatorPicker from '../components/CommonDenominatorPicker';
import {
  add, commonDenominator, expandTo, formatDec, formatFrac, parseDec, rat, sub, toDecimal,
} from '../components/rationalUtils';

/**
 * Module 4 — MANIPULATION SIGNATURE : « La même découpe ».
 *
 * Activity: deux barres, 1/2 et 1/3, qu'on ne peut PAS additionner tant que
 *   leurs parts n'ont pas la même taille ; l'élève re-découpe chaque barre
 *   jusqu'à ce que les deux dénominateurs coïncident.
 * Mathematical objective: additionner deux rationnels, c'est additionner des
 *   parts de MÊME taille — le dénominateur commun n'est pas une recette,
 *   c'est la condition pour que les morceaux s'emboîtent.
 * Student action: taper « ×2 » / « ×3 » / « ÷k » sous chaque barre, puis
 *   choisir la découpe commune dans le CommonDenominatorPicker.
 * Controlled variable: les deux dénominateurs (via les facteurs de coupe).
 * Mathematical state: deux rationnels `{num, den}` ; la somme, l'écart de
 *   découpe et les marqueurs sur la droite en sont dérivés.
 * Visual consequence: les deux marqueurs ne bougent JAMAIS ; seuls les traits
 *   de coupe changent — jusqu'au moment où les deux barres ont le même
 *   nombre de parts et où les morceaux s'emboîtent.
 * Expected observation: en sixièmes, 1/2 devient 3/6 et 1/3 devient 2/6 ; la
 *   somme se lit alors 5/6, pas 2/5.
 * Misconception targeted: « 1/2 + 1/3 = 2/5 » (on additionne les
 *   dénominateurs) et « il faut multiplier les dénominateurs entre eux »
 *   comme unique méthode.
 * Feedback: tant que les découpes diffèrent, l'écart est nommé (« une barre
 *   est en 2 parts, l'autre en 3 : les morceaux n'ont pas la même taille »).
 * Formalization: « même découpe », le PPCM et la règle de la somme vivent
 *   dans `knowledge.jsx` ; des <KnowledgeBrick> les posent au moment exact —
 *   la condition dès que les deux barres coïncident (étape 1), le PPCM après
 *   le sélecteur (étape 2), la formule après le verdict de l'étape 3. Aucune
 *   règle n'est recopiée ici (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: après 3 essais, « Je ne trouve pas — montre-moi » recoupe les
 *   deux barres en sixièmes.
 * Transfer: étape 4, une soustraction qui passe sous zéro (1/3 − 3/4).
 */
const A0 = rat(1, 2);
const B0 = rat(1, 3);
const TARGET_DEN = commonDenominator(A0, B0); // 6
const SUM = add(A0, B0); // 5/6

export default function Module04MemeDecoupe() {
  const [a, setA] = useState(A0);
  const [b, setB] = useState(B0);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [picked, setPicked] = useState(null);
  const [pickDone, setPickDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);
  // Étape 3 : après avoir NOMMÉ l'erreur, l'élève la RÉPARE sur les barres.
  const [ra, setRA] = useState(A0);
  const [rb, setRB] = useState(B0);
  const [sumNum, setSumNum] = useState(false);
  const [subDone, setSubDone] = useState(false);
  const [negDone, setNegDone] = useState(false);

  const sameCut = a.den === b.den;
  const cutDone = sameCut && a.den % A0.den === 0;
  const repaired = ra.den === rb.den && ra.den % A0.den === 0 && ra.den % B0.den === 0;

  const changeA = (next) => {
    setA(next);
    if (next.den !== b.den) setTries((t) => t + 1);
  };
  const changeB = (next) => {
    setB(next);
    if (next.den !== a.den) setTries((t) => t + 1);
  };

  const showMe = (kitReact) => {
    setA(rat(3, 6));
    setB(rat(2, 6));
    setRevealed(true);
    kitReact?.(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La même découpe"
      moduleSubtitle="Un demi et un tiers ne s’emboîtent pas — jusqu’à ce que tu recoupes tout pareil."
      estimatedTime="11 min"
      brief={{
        tag: '🧩 Mission 04',
        title: 'Deux parts de tailles différentes ne s’additionnent pas.',
        body: (
          <p>
            Une barre est coupée en 2, l’autre en 3. Impossible de dire combien de parts ça fait en
            tout : elles n’ont pas la même taille. Recoupe-les jusqu’à ce qu’elles aient{' '}
            <strong>le même nombre de parts</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Recoupe les deux barres à l’identique',
          subtitle: 'Les marqueurs ne doivent pas bouger — seuls les traits changent.',
          done: cutDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Tape « ×2 » ou « ×3 » sous chaque barre pour couper ses parts plus fin. Ta cible : les
                deux barres découpées <strong>en un même nombre de parts</strong>.
              </p>
              <RationalBar
                value={a}
                onValue={changeA}
                second={b}
                onSecond={changeB}
                min={0}
                max={1}
                showDecimal
              />
              {!cutDone && (
                <Feedback tone="info">
                  Pour l’instant, la barre 1 est en <strong className="font-mono">{a.den}</strong>{' '}
                  part{a.den > 1 ? 's' : ''} et la barre 2 en{' '}
                  <strong className="font-mono">{b.den}</strong> part{b.den > 1 ? 's' : ''} : les
                  morceaux n’ont pas la même taille, on ne peut pas les compter ensemble.
                  {a.den !== b.den && (
                    <>
                      {' '}Cherche un nombre de parts qui convient <strong>aux deux</strong> — par exemple un
                      multiple de {A0.den} et de {B0.den}.
                    </>
                  )}
                </Feedback>
              )}
              {!cutDone && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {cutDone && (
                <Feedback tone="ok">
                  Même découpe : <strong className="font-mono">{a.den}</strong> parts de chaque côté.
                  <MathText>{` $${formatFrac(a)}$`}</MathText> et{' '}
                  <MathText>{`$${formatFrac(b)}$`}</MathText> — et les deux marqueurs n’ont pas bougé
                  d’un millimètre. Maintenant, les parts s’emboîtent : {Math.abs(a.num)} +{' '}
                  {Math.abs(b.num)} = {Math.abs(a.num) + Math.abs(b.num)} parts sur {a.den}.
                  {revealed && ' (La découpe t’a été montrée — refais-la à la main pour la sentir.)'}
                </Feedback>
              )}
              {cutDone && (
                <KnowledgeBrick
                  id="meme-decoupe"
                  variant="new"
                  lead="Tant que les traits ne coïncidaient pas, il n’y avait rien à compter. Voilà la condition, et ce qu’elle interdit."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Choisir la découpe commune sans tâtonner',
          subtitle: 'Tous les nombres de parts ne conviennent pas.',
          done: pickDone,
          content: (kit) => (
            <div className="space-y-3">
              <CommonDenominatorPicker
                a={a}
                b={b}
                candidates={[5, 6, 7, 12, 24]}
                picked={picked}
                onPick={(d, ok) => {
                  setPicked(d);
                  kit.react(ok);
                  if (ok) {
                    // Le choix AGIT sur les barres : elles se re-découpent sous
                    // les yeux de l'élève, marqueurs immobiles. On repart des
                    // fractions d'ORIGINE, donc la valeur ne peut pas dériver.
                    setA(expandTo(A0, d));
                    setB(expandTo(B0, d));
                    setPickDone(true);
                  }
                }}
              />
              <RationalBar
                value={a}
                second={b}
                min={0}
                max={1}
                showDecimal
                showLine={false}
              />
              {pickDone && (
                <>
                  <Feedback tone="ok">
                    Les deux barres viennent de se re-découper en{' '}
                    <strong className="font-mono">{a.den}</strong> parts — et les marqueurs n’ont pas
                    bougé. 6, 12 et 24 conviennent tous les trois ;{' '}
                    <strong className="font-mono">{TARGET_DEN}</strong> est le plus petit. Avec 5 ou 7,
                    on ne peut couper ni les demis ni les tiers en parts égales.
                  </Feedback>
                  <KnowledgeBrick
                    id="ppcm-denominateur"
                    variant="new"
                    lead="Trois candidats acceptés, deux refusés : ce n’est pas au hasard. Le plus petit des trois porte même un nom."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'La règle, maintenant qu’elle est vue',
          subtitle: 'Nomme l’erreur, puis répare-la sur les barres.',
          done: ruleDone && repaired && sumNum,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Un élève écrit 1/2 + 1/3 = 2/5. Qu’est-ce qui ne va pas ?"
                options={[
                  'Il a additionné aussi les dénominateurs, ce qui change la taille des parts',
                  'Il a oublié de simplifier le résultat',
                  'Rien : 2/5 est une autre écriture de 5/6',
                ]}
                cols={1}
                correct={0}
                explain={
                  <>
                    Additionner les dénominateurs invente une nouvelle taille de part. Sur la droite,{' '}
                    <MathText>{'$\\frac{2}{5}$'}</MathText> vaut {formatDec(toDecimal(rat(2, 5), 3)) } alors
                    que <MathText>{'$\\frac{5}{6}$'}</MathText> vaut{' '}
                    {formatDec(toDecimal(SUM, 3))} : ce ne sont pas du tout les mêmes points. Le
                    dénominateur dit la TAILLE des parts ; il ne se cumule pas.
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$\\frac{2}{5}$'}</MathText> vaut environ{' '}
                    {formatDec(toDecimal(rat(2, 5), 3))} et <MathText>{'$\\frac{5}{6}$'}</MathText>{' '}
                    environ {formatDec(toDecimal(SUM, 3))} — deux points différents. L’erreur est bien
                    d’avoir additionné les dénominateurs : 2 demis + 3 tiers ne font pas 5 cinquièmes.
                  </>
                }
                requires={['meme-decoupe', 'ppcm-denominateur']}
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />
              {ruleDone && (
                <KnowledgeBrick
                  id="somme-difference"
                  variant="new"
                  lead="Une fois les parts à la même taille, il ne reste plus qu’à les compter. Voilà l’écriture du geste."
                />
              )}
              {ruleDone && (
                <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-3 space-y-3">
                  <p className="text-sm font-semibold text-slate-700">
                    À toi de réparer sa copie : re-découpe les deux barres pour que la somme devienne
                    lisible.
                  </p>
                  <RationalBar
                    value={ra}
                    onValue={setRA}
                    second={rb}
                    onSecond={setRB}
                    drag
                    min={0}
                    max={1}
                    showDecimal={false}
                    showLine={false}
                  />
                  {!repaired ? (
                    <Feedback tone="info">
                      Les parts n’ont pas encore la même taille :{' '}
                      <MathText>{`$\\frac{${ra.num}}{${ra.den}}$`}</MathText> et{' '}
                      <MathText>{`$\\frac{${rb.num}}{${rb.den}}$`}</MathText>. Tant qu’elles diffèrent,
                      il n’y a rien à compter.
                    </Feedback>
                  ) : (
                    <NumericQuestion
                      prompt={
                        <span>
                          Les deux barres sont en {ra.den}
                          èmes. Combien de parts en tout ?
                        </span>
                      }
                      expected={ra.num + rb.num}
                      parse={parseDec}
                      display={`${ra.num + rb.num}`}
                      suffix={`/ ${ra.den}`}
                      explain={
                        <>
                          <MathText>{`$\\frac{${ra.num}}{${ra.den}} + \\frac{${rb.num}}{${ra.den}} = \\frac{${ra.num + rb.num}}{${ra.den}}$`}</MathText>{' '}
                          — on compte les parts, on garde leur taille. Soit{' '}
                          {formatDec(toDecimal(SUM, 4))}, et non {formatDec(toDecimal(rat(2, 5), 3))}.
                        </>
                      }
                      explainFor={(n) => (n === ra.den + rb.den
                        ? 'Tu as additionné les dénominateurs : c’est justement l’erreur qu’on répare.'
                        : `Compte les parts coloriées des deux barres : ${ra.num} + ${rb.num}.`)}
                      requires={['somme-difference', 'meme-decoupe']}
                      solved={sumNum}
                      onAnswered={() => setSumNum(true)}
                    />
                  )}
                </div>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Soustraire, et passer sous zéro',
          subtitle: 'Même méthode, et le résultat peut être négatif.',
          done: subDone && negDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-2">
                <p className="text-center font-semibold text-slate-700">
                  <MathText>{'$\\frac{3}{4} - \\frac{1}{2} = ?$'}</MathText> — donne le NUMÉRATEUR une fois
                  la découpe commune faite en quarts.
                </p>
                <NumericQuestion
                  prompt="Numérateur du résultat, en quarts :"
                  expected={sub(rat(3, 4), rat(1, 2)).num}
                  parse={parseDec}
                  display={`${sub(rat(3, 4), rat(1, 2)).num}`}
                  suffix="/ 4"
                  explain="On recoupe 1/2 en 2/4, puis 3 − 2 = 1 : le résultat est 1/4."
                  explainFor={(n) =>
                    n === 2
                      ? 'Ce serait 3 − 1 sans recouper 1/2 en 2/4. Une fois recoupée, la deuxième barre vaut 2 quarts, donc 3 − 2 = 1.'
                      : 'On recoupe 1/2 en 2/4, puis 3 − 2 = 1 : le résultat est 1/4.'
                  }
                  requires={['somme-difference', 'meme-decoupe']}
                  solved={subDone}
                  onAnswered={() => setSubDone(true)}
                />
              </div>
              <TapQuestion
                prompt={
                  <>
                    Combien vaut <MathText>{'$\\frac{1}{3} - \\frac{3}{4}$'}</MathText> ?
                  </>
                }
                options={['$-\\frac{5}{12}$', '$\\frac{5}{12}$', '$-\\frac{2}{1}$']}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['−5/12', '5/12', '−2'][i]}
                correctionLabel="−5/12"
                cols={3}
                correct={0}
                explain={
                  <>
                    En douzièmes : <MathText>{'$\\frac{4}{12} - \\frac{9}{12} = -\\frac{5}{12}$'}</MathText>.
                    On enlève plus qu’on n’avait : on passe à gauche de 0. C’est un rationnel comme un
                    autre, un point à gauche du zéro.
                  </>
                }
                explainWrong={
                  <>
                    Attention à l’ordre : on enlève <MathText>{'$\\frac{3}{4}$'}</MathText> (soit 9
                    douzièmes) à <MathText>{'$\\frac{1}{3}$'}</MathText> (soit 4 douzièmes). 4 − 9 = −5,
                    donc <MathText>{'$-\\frac{5}{12}$'}</MathText>. Le résultat est négatif parce qu’on
                    retire plus grand que ce qu’on avait.
                  </>
                }
                requires={['somme-difference', 'ppcm-denominateur', 'nombres-relatifs']}
                solved={negDone}
                onAnswered={() => setNegDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Retiens le geste, pas la recette : on ne compte des parts
          ensemble que si elles ont la même taille. Au module suivant, on ne compte plus — on prend
          une part <em>d’une part</em>.
        </KnowledgeSnapshot>
      )}
    />
  );
}
