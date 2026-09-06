import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RationalBar from '../components/RationalBar';
import {
  formatDec, formatFrac, formatRaw, plainFrac, rat, toDecimal,
} from '../components/rationalUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Deux noms, un seul nombre ».
 *
 * Activity: empoigner la barre qui marque 3/4 — d'abord son peigne de coupe,
 *   ensuite son bord colorié — et regarder ce qui bouge dans chaque cas.
 * Mathematical objective: un rationnel est un POINT ; ses écritures (3/4, 6/8,
 *   12/16, 0,75) sont des façons de découper le chemin qui y mène.
 * Student action: GLISSER sur la figure elle-même. Le peigne re-découpe (le
 *   dénominateur), le bord prend plus ou moins de parts (le numérateur). Les
 *   puces ×k / ÷k restent comme chemin tap-first et clavier.
 * Controlled variable: les deux nombres du rationnel, par deux prises
 *   DISTINCTES — c'est tout le propos du module.
 * Mathematical state: UN rationnel `{num, den}` ; les traits, la longueur
 *   coloriée, le marqueur et la valeur décimale en sont dérivés.
 * Visual consequence: au peigne, les chiffres changent et le marqueur ne bouge
 *   pas ; au bord, le marqueur se déplace. Le CONTRASTE est la découverte.
 * Expected observation: « le bas change le nom, le haut change le nombre ».
 * Misconception targeted: « 6/8 > 3/4 puisque 6 > 3 » ; « −3/4 et 3/(−4) sont
 *   deux nombres différents » ; et l'idée qu'on pourrait « simplifier » en ne
 *   touchant qu'au numérateur.
 * Feedback: l'écart au point cible est quantifié en valeur décimale ; la
 *   prédiction de l'élève lui est renvoyée sans verdict au moment où la
 *   manipulation, elle, a répondu.
 * Formalization: les mots vivent dans `knowledge.jsx`. « Écritures
 *   équivalentes » est posé dès la troisième découpe (étape 1) ; l'asymétrie
 *   haut/bas à l'étape 2, juste après le geste qui la montre ; « nombre
 *   rationnel » à l'étape 3 ; le placement du signe à l'étape 4
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: après 3 gestes sans atteindre 3 écritures, « montre-moi » pose
 *   6/8. Aucune étape ne se bloque jamais.
 * Transfer: étape 4, la même barre à gauche de 0 — et vivante, pas figée.
 */
const TARGET = rat(3, 4);

export default function Module01DeuxNomsUnNombre() {
  const [v, setV] = useState(TARGET);
  const [seen, setSeen] = useState(['3/4']);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [refusal, setRefusal] = useState('');
  const [pred, setPred] = useState(null);

  const [f, setF] = useState(TARGET);
  const [reachedOne, setReachedOne] = useState(false);

  const [decDone, setDecDone] = useState(false);
  const [nameDone, setNameDone] = useState(false);

  const [neg, setNeg] = useState(rat(-3, 4));
  const [negCut, setNegCut] = useState(false);
  const [negDone, setNegDone] = useState(false);

  const explored = seen.length >= 3;
  // Étape 2 : il faut avoir poussé le bord jusqu'à 1 PUIS être revenu à 3/4 —
  // aller-retour, pour que le déplacement du marqueur soit vu deux fois.
  const backToTarget = toDecimal(f, 6) === toDecimal(TARGET, 6);
  const fillDone = reachedOne && backToTarget;
  const negReached = toDecimal(neg, 6) === toDecimal(rat(-3, 4), 6);

  const change = (next) => {
    setRefusal('');
    setV(next);
    const key = plainFrac(next);
    setSeen((s) => (s.includes(key) ? s : [...s, key]));
    setTries((t) => t + 1);
  };

  const changeFill = (next) => {
    setF(next);
    if (toDecimal(next, 6) === 1) setReachedOne(true);
  };

  const changeNeg = (next) => {
    setNeg(next);
    if (next.den !== 4 && toDecimal(next, 6) === toDecimal(rat(-3, 4), 6)) setNegCut(true);
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
      moduleSubtitle="Empoigne la barre : selon l’endroit où tu tires, le point bouge — ou pas."
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Un même point, écrit de mille façons.',
        body: (
          <p>
            Cette barre marque un point sur la droite. Tu peux la prendre à deux endroits : ses
            traits de coupe, ou son bord colorié. Essaie les deux, et surveille le marqueur.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Tire sur les traits de coupe',
          subtitle: 'Glisse sur la barre pour la couper plus fin ou regrouper ses parts.',
          done: explored,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips
                prompt="si tu coupes chaque part en deux, que fait le marqueur ?"
                options={[
                  { id: 'droite', label: 'Il va vers la droite' },
                  { id: 'immobile', label: 'Il ne bouge pas' },
                  { id: 'gauche', label: 'Il va vers la gauche' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={explored}
              />
              <RationalBar
                value={v}
                onValue={change}
                onRefuse={setRefusal}
                drag
                min={0}
                max={1}
                showDecimal
              />
              {refusal && <Feedback tone="ko">{refusal}</Feedback>}
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
                  {pred === 'immobile'
                    ? 'Ta prédiction tenait : '
                    : pred
                      ? 'Ta prédiction disait le contraire, et pourtant : '
                      : ''}
                  {seen.length} écritures différentes — <strong className="font-mono">{seen.join(' = ')}</strong>{' '}
                  — et un seul point, toujours à {formatDec(toDecimal(TARGET, 4))}. Multiplier le haut ET
                  le bas par le même nombre, c’est juste couper chaque part en morceaux plus petits :
                  la longueur ne change pas.
                  {revealed && ' (Une écriture t’a été montrée — refais-en une à la main.)'}
                </Feedback>
              )}
              {explored && (
                <KnowledgeBrick
                  id="ecritures-equivalentes"
                  variant="new"
                  lead="Trois écritures, un seul marqueur : ce que tu viens de constater porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Maintenant tire sur le bord colorié',
          subtitle: 'Pousse-le jusqu’à 1, puis ramène-le exactement sur 3/4.',
          done: fillDone,
          content: (
            <div className="space-y-3">
              <RationalBar
                value={f}
                onValue={changeFill}
                drag
                min={0}
                max={1}
                showDecimal
              />
              {!fillDone && (
                <Feedback tone="info">
                  {!reachedOne ? (
                    <>
                      Prends le <strong>bord colorié</strong> (les deux petits traits) et pousse-le
                      jusqu’au bout de la barre, sur <strong className="font-mono">1</strong>. Tu es à{' '}
                      <strong className="font-mono">{formatDec(toDecimal(f, 4))}</strong>.
                    </>
                  ) : (
                    <>
                      Le marqueur, lui, a bougé. Ramène-le maintenant sur{' '}
                      <MathText>{'$\\frac{3}{4}$'}</MathText> — tu es à{' '}
                      <strong className="font-mono">{formatDec(toDecimal(f, 4))}</strong>.
                    </>
                  )}
                </Feedback>
              )}
              {fillDone && (
                <Feedback tone="ok">
                  Cette fois le marqueur <strong>s’est déplacé</strong>. Les deux prises ne font donc
                  pas la même chose : les traits de coupe changent le <em>nom</em> du point, le bord
                  colorié change le <em>point</em> lui-même.
                </Feedback>
              )}
              {fillDone && (
                <KnowledgeBrick
                  id="mem-numerateur-denominateur"
                  variant="new"
                  lead="Deux prises, deux effets — voilà ce qu’il faut retenir de ce contraste."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
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
                { id: 'r32', label: <MathText>{'$\\frac{3}{2}$'}</MathText>, options: ['même point', 'autre point'], correct: 1, correction: '3/2 = 1,5 : on n’a touché qu’au BAS sans toucher au haut — le point a bougé.' },
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
                      {formatDec(toDecimal(rat(4, 3), 3))} et{' '}
                      <MathText>{'$\\frac{3}{2}$'}</MathText> vaut{' '}
                      {formatDec(toDecimal(rat(3, 2), 3))} : ils sont ailleurs.
                    </>
                  ) : (
                    <>
                      {nCorrect} / {total}. Le test sûr : la valeur décimale.{' '}
                      <MathText>{'$\\frac{3}{4} = 0{,}75$'}</MathText>,{' '}
                      <MathText>{'$\\frac{6}{8} = 0{,}75$'}</MathText>,{' '}
                      <MathText>{'$\\frac{12}{16} = 0{,}75$'}</MathText>, mais{' '}
                      <MathText>{'$\\frac{4}{3} \\approx 1{,}33$'}</MathText> et{' '}
                      <MathText>{'$\\frac{3}{2} = 1{,}5$'}</MathText> — deux autres points.
                    </>
                  )}
                </Feedback>
              )}
              requires={['ecritures-equivalentes', 'mem-numerateur-denominateur', 'quotient']}
              solved={decDone}
              onAnswered={() => setDecDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Maintenant on peut le nommer',
          done: nameDone,
          content: (
            <div className="space-y-4">
              <KnowledgeBrick
                id="nombre-rationnel"
                variant="new"
                lead="Ce point que tu as écrit de mille façons appartient à une grande famille de nombres. La voici, avec sa condition."
              />
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  🔍 La copie de Léa
                </p>
                <p className="text-sm text-slate-700">
                  Léa écrit : «{' '}
                  <MathText>{'$\\frac{3}{0} = 0$'}</MathText>, parce qu’on ne prend aucune part. »
                </p>
              </div>
              <TapQuestion
                prompt="Où est la faute dans le raisonnement de Léa ?"
                options={[
                  'Le 0 est en bas : il dit le nombre de PARTS, et découper en 0 part ne définit aucune longueur',
                  'Elle a confondu avec 0/3, qui vaut bien 0',
                  'Il n’y a pas de faute : 3/0 vaut bien 0',
                ]}
                cols={1}
                correct={0}
                explain={
                  <>
                    Le dénominateur dit <strong>en combien de parts</strong> on découpe. En 0 part, il
                    n’y a rien à prendre : aucun nombre ne convient — l’écriture elle-même n’a pas de
                    sens. C’est pour ça que <MathText>{'$b \\neq 0$'}</MathText> fait partie de la
                    définition. (Léa pensait à <MathText>{'$\\frac{0}{3}$'}</MathText>, qui vaut bien 0 :
                    là, on découpe en 3 parts et on n’en prend aucune.)
                  </>
                }
                explainWrong={
                  <>
                    Attention à ne pas confondre les deux étages.{' '}
                    <MathText>{'$\\frac{0}{3}$'}</MathText> vaut 0 : on découpe en 3 et on ne prend
                    rien. Mais <MathText>{'$\\frac{3}{0}$'}</MathText> demanderait de découper en{' '}
                    <strong>0 part</strong> — il n’y a alors rien à prendre, et aucun nombre ne peut
                    être le résultat.
                  </>
                }
                requires={['nombre-rationnel', 'mem-numerateur-denominateur', 'quotient']}
                solved={nameDone}
                onAnswered={() => setNameDone(true)}
              />
            </div>
          ),
        },
        {
          num: 5,
          title: 'À gauche de zéro aussi',
          subtitle: 'Amène le bord sur −3/4, puis re-découpe sans déplacer le point.',
          done: negCut && negDone,
          content: (
            <div className="space-y-4">
              <RationalBar
                value={neg}
                onValue={changeNeg}
                drag
                min={-1}
                max={0}
                showDecimal
              />
              {!negCut && (
                <Feedback tone="info">
                  Tu es à <strong className="font-mono">{formatDec(toDecimal(neg, 4))}</strong>
                  {negReached
                    ? ' — bien. Maintenant tire sur les traits de coupe : le point doit rester exactement là.'
                    : ' — ramène d’abord le bord colorié sur −0,75.'}
                </Feedback>
              )}
              {negCut && (
                <Feedback tone="ok">
                  <MathText>{`$${formatFrac(neg)}$`}</MathText> en {neg.den}
                  èmes, et le point n’a pas bougé : à gauche de zéro, la re-découpe marche
                  exactement pareil.
                </Feedback>
              )}
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
                    devant la fraction, ne déplace pas le point : les trois écritures sont
                    équivalentes.
                  </>
                }
                requires={['nombre-rationnel', 'ecritures-equivalentes', 'nombres-relatifs']}
                solved={negDone}
                onAnswered={() => setNegDone(true)}
              />
              {negDone && (
                <KnowledgeBrick
                  id="signe-fraction"
                  variant="new"
                  compact
                  lead="Trois écritures, un seul point à gauche de zéro. Reste à savoir laquelle on écrit d’habitude."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Mille écritures pour un point — mais une seule est la plus
          courte. Au module suivant, on la cherche : c’est elle qui sert de carte d’identité.
        </KnowledgeSnapshot>
      )}
    />
  );
}
