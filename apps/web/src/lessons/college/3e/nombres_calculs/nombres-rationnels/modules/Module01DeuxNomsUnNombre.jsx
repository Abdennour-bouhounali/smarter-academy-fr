import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RationalBar from '../components/RationalBar';
import {
  equivalent, formatDec, formatFrac, formatRaw, rat, toDecimal,
} from '../components/rationalUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Deux noms, un seul nombre ».
 *
 * Activity: re-découper la barre qui marque 3/4 et regarder ce qui bouge.
 * Mathematical objective: un rationnel est un POINT ; ses écritures (3/4,
 *   6/8, 12/16, 0,75) sont des façons de découper le chemin qui y mène.
 * Student action: taper « ×2 », « ×3 » ou « ÷k » sous la barre.
 * Controlled variable: le nombre de parts (le dénominateur).
 * Mathematical state: UN rationnel `{num, den}` ; les traits, la longueur
 *   coloriée, le marqueur et la valeur décimale en sont dérivés.
 * Visual consequence: les chiffres changent, le marqueur ne bouge pas.
 * Expected observation: « c'est toujours le même point » — l'équivalence est
 *   une invariance de position, pas une manipulation de chiffres.
 * Misconception targeted: « 6/8 > 3/4 puisque 6 > 3 » et « −3/4 et 3/(−4)
 *   sont deux nombres différents ».
 * Feedback: l'écart au point cible est quantifié en valeur décimale.
 * Formalization: « rationnel = quotient de deux entiers, dénominateur non
 *   nul », NOMMÉ à l'étape 3, après le geste — jamais avant.
 * Scaffolding: après 3 découpes sans atteindre 3 écritures, le module offre
 *   « montre-moi » qui pose 6/8.
 * Transfer: étape 4, la même barre à gauche de 0 pour les négatifs.
 */
const TARGET = rat(3, 4);
const WRITINGS = ['3/4', '6/8', '12/16'];

export default function Module01DeuxNomsUnNombre() {
  const [v, setV] = useState(TARGET);
  const [seen, setSeen] = useState(['3/4']);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [decDone, setDecDone] = useState(false);
  const [nameDone, setNameDone] = useState(false);
  const [negDone, setNegDone] = useState(false);

  const explored = seen.length >= 3;

  const change = (next) => {
    setV(next);
    const key = `${next.num}/${next.den}`;
    setSeen((s) => (s.includes(key) ? s : [...s, key]));
    setTries((t) => t + 1);
  };

  const showMe = (kitReact) => {
    setV(rat(6, 8));
    setSeen((s) => (s.includes('6/8') ? s : [...s, '6/8']));
    setRevealed(true);
    kitReact?.(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Deux noms, un seul nombre"
      moduleSubtitle="Re-découpe la barre : les chiffres changent, le point ne bouge pas."
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Un même point, écrit de mille façons.',
        body: (
          <p>
            Cette barre marque un point sur la droite. Coupe ses parts plus fin, regroupe-les, et
            surveille le marqueur : ce qui change, ce qui ne change pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Re-découpe la barre trois fois',
          subtitle: 'Ne quitte pas le marqueur des yeux.',
          done: explored,
          content: (kit) => (
            <div className="space-y-3">
              <RationalBar value={v} onValue={change} min={0} max={1} showDecimal />
              {!explored && (
                <Feedback tone="info">
                  Tu as trouvé <strong className="font-mono">{seen.length}</strong> écriture
                  {seen.length > 1 ? 's' : ''} sur 3 : {seen.join(' · ')}. Le marqueur est toujours à{' '}
                  <strong className="font-mono">{formatDec(toDecimal(v, 4))}</strong> — regarde bien, il
                  n’a pas bougé.
                </Feedback>
              )}
              {!explored && tries >= 3 && (
                <button
                  type="button"
                  onClick={() => showMe(kit.react)}
                  className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {explored && (
                <Feedback tone="ok">
                  {seen.length} écritures différentes : <strong className="font-mono">{seen.join(' = ')}</strong>{' '}
                  — et un seul point, toujours à {formatDec(toDecimal(TARGET, 4))}. Multiplier le haut ET
                  le bas par le même nombre, c’est juste couper chaque part en morceaux plus petits :
                  la longueur ne change pas.
                  {revealed && ' (Une écriture t’a été montrée — refais-en une à la main.)'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le même point porte aussi un nom décimal',
          done: decDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chacune de ces écritures, dis si elle désigne <strong>le même point</strong> que{' '}
                  <MathText>{'$\\frac{3}{4}$'}</MathText>.
                </p>
              }
              rows={[
                { id: 'r68', label: <MathText>{'$\\frac{6}{8}$'}</MathText>, options: ['même point', 'autre point'], correct: 0, correction: '6/8 : chaque quart coupé en deux → même longueur.' },
                { id: 'r075', label: <MathText>{'$0{,}75$'}</MathText>, options: ['même point', 'autre point'], correct: 0, correction: '3 ÷ 4 = 0,75 : c’est la valeur décimale du même point.' },
                { id: 'r34i', label: <MathText>{'$\\frac{4}{3}$'}</MathText>, options: ['même point', 'autre point'], correct: 1, correction: '4/3 ≈ 1,33 : c’est à droite de 1, un autre point.' },
                { id: 'r1216', label: <MathText>{'$\\frac{12}{16}$'}</MathText>, options: ['même point', 'autre point'], correct: 0, correction: '12/16 = 3/4 : chaque quart coupé en quatre.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'info'}>
                  {allRight ? (
                    <>
                      Toutes justes. <MathText>{'$\\frac{6}{8}$'}</MathText>,{' '}
                      <MathText>{'$\\frac{12}{16}$'}</MathText> et{' '}
                      <MathText>{'$0{,}75$'}</MathText> sont trois noms du même point.{' '}
                      <MathText>{'$\\frac{4}{3}$'}</MathText> vaut{' '}
                      {formatDec(toDecimal(rat(4, 3), 3))} : il est ailleurs.
                    </>
                  ) : (
                    <>
                      {nCorrect} / {total}. Le test sûr : la valeur décimale.{' '}
                      <MathText>{'$\\frac{3}{4} = 0{,}75$'}</MathText>,{' '}
                      <MathText>{'$\\frac{6}{8} = 0{,}75$'}</MathText>,{' '}
                      <MathText>{'$\\frac{12}{16} = 0{,}75$'}</MathText>, mais{' '}
                      <MathText>{'$\\frac{4}{3} \\approx 1{,}33$'}</MathText> — un autre point.
                    </>
                  )}
                </Feedback>
              )}
              solved={decDone}
              onAnswered={() => setDecDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Maintenant on peut le nommer',
          done: nameDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-2">
                <p className="text-[11px] font-mono uppercase tracking-wide text-indigo-700">Le mot</p>
                <p className="text-sm text-slate-700">
                  Un <strong>nombre rationnel</strong> est un nombre qui peut s’écrire{' '}
                  <MathText>{'$\\frac{a}{b}$'}</MathText> avec <MathText>{'$a$'}</MathText> et{' '}
                  <MathText>{'$b$'}</MathText> <strong>entiers</strong> et{' '}
                  <MathText>{'$b \\neq 0$'}</MathText>. Chacune de ses écritures marque le même point :
                  ce sont des <strong>écritures équivalentes</strong>.
                </p>
              </div>
              <TapQuestion
                prompt="Pourquoi exige-t-on que le dénominateur soit différent de zéro ?"
                options={[
                  'Parce que couper une barre en 0 part ne définit aucune longueur',
                  'Parce que le résultat serait négatif',
                  'Parce que 0 n’est pas un nombre entier',
                ]}
                cols={1}
                correct={0}
                explain={
                  <>
                    Le dénominateur dit <strong>en combien de parts</strong> on découpe. En 0 part, il
                    n’y a rien à prendre : aucun nombre ne convient. C’est pour ça que{' '}
                    <MathText>{'$b \\neq 0$'}</MathText> fait partie de la définition.
                  </>
                }
                explainWrong={
                  <>
                    Le signe n’a rien à voir : <MathText>{'$\\frac{-3}{4}$'}</MathText> est un rationnel
                    parfaitement valable. Et 0 est bien un entier. Le problème est ailleurs : découper
                    en 0 part ne veut rien dire, donc aucun nombre ne peut être le résultat.
                  </>
                }
                solved={nameDone}
                onAnswered={() => setNameDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'À gauche de zéro aussi',
          subtitle: 'Trois écritures, un seul point négatif.',
          done: negDone,
          content: (
            <div className="space-y-4">
              <RationalBar value={rat(-3, 4)} min={-1} max={1} showDecimal frozen />
              <TapQuestion
                prompt={
                  <>
                    Parmi <MathText>{`$${formatRaw(-3, 4)}$`}</MathText>,{' '}
                    <MathText>{`$${formatRaw(3, -4)}$`}</MathText> et{' '}
                    <MathText>{'$-\\frac{3}{4}$'}</MathText>, combien de points différents ?
                  </>
                }
                options={['Un seul point', 'Deux points', 'Trois points']}
                cols={3}
                correct={0}
                explain={
                  <>
                    Un seul. Prendre 3 parts sur 4 « à l’envers », découper en −4, ou prendre l’opposé
                    de <MathText>{'$\\frac{3}{4}$'}</MathText> : les trois arrivent au même endroit,{' '}
                    {formatDec(toDecimal(rat(-3, 4), 4))}. On l’écrit d’habitude avec le signe devant et
                    un dénominateur positif :{' '}
                    <MathText>{`$${formatFrac(rat(3, -4))}$`}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    Regarde la barre : elle part de 0 vers la gauche et s’arrête à{' '}
                    {formatDec(toDecimal(rat(-3, 4), 4))}. Déplacer le signe du bas vers le haut, ou
                    devant la fraction, ne déplace pas le point —{' '}
                    {equivalent(rat(-3, 4), rat(3, -4)) ? 'les trois écritures sont équivalentes' : ''}.
                  </>
                }
                solved={negDone}
                onAnswered={() => setNegDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="ok">
          Un rationnel est un point. Toutes ses écritures — {WRITINGS.join(', ')}, 0,75 — ne sont que
          des découpes différentes du même chemin. C’est ce qui rend possible tout le reste de la leçon.
        </Feedback>
      }
    />
  );
}
