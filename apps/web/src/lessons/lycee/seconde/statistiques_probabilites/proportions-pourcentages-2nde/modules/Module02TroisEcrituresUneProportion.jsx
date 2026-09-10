import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';

import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ThreeWritings from '../components/ThreeWritings';

/**
 * Module 2 — DÉCOUVERTE : la proportion s'écrit de trois façons, et c'est le
 * MÊME nombre. La manipulation (ThreeWritings) affiche les trois écritures
 * côte à côte et les fait bouger ensemble : l'élève ne les convertit pas, il
 * les voit être une seule quantité.
 *
 * Puis les deux sens de lecture : appliquer une proportion (partie = p × tout)
 * et remonter au tout (tout = partie / p) — le second est celui qu'on rate.
 */
export default function Module02TroisEcrituresUneProportion() {
  const [tested, setTested] = useState(() => new Set());
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [q3c, setQ3c] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = tested.size >= 3;

  const test = (key, react) => {
    const next = new Set(tested); next.add(key); setTested(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Le même nombre, trois habits',
      subtitle: 'Choisis une part et regarde les trois écritures changer ensemble. Essaie-en trois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <ThreeWritings
            total={800}
            options={[200, 240, 400, 480, 600]}
            tested={tested}
            onTest={(v) => test(v, kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              Une seule quantité, trois écritures : <strong>la fraction</strong> garde la trace du calcul,
              {' '}<strong>le décimal</strong> permet de multiplier, <strong>le pourcentage</strong> se compare d’un coup d’œil.
              Passer de l’un à l’autre ne change pas la valeur : 0,6 = 60/100 = 60 %.
            </Feedback>
          ) : null}
          {/* Les trois cases viennent de bouger ENSEMBLE : c'est l'instant où
              « changer d'écriture » se voit ne rien changer à la valeur, avant
              que l'étape 4 ne demande de le faire à la main. */}
          {done1 && (
            <KnowledgeBrick
              id="trois-ecritures"
              variant="new"
              lead={<>Tu n’as réglé qu’<strong>une</strong> part, et les trois cases se sont mises d’accord toutes seules. Voici les deux gestes qui font passer de l’une à l’autre.</>}
            />
          )}
          {done1 && (
            <KnowledgeBrick
              id="vocab-pourcentage"
              variant="new"
              compact
              lead={<>Et le mot lui-même dit l’opération : « pour cent », c’est « sur cent ».</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">Parts testées : {tested.size} sur 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'De la proportion à l’effectif',
      done: q2,
      content: (
        <div className="space-y-3">
        {/* L'étape 1 a montré que la proportion est UN nombre à trois habits.
            Avant de le faire travailler dans les deux sens (étapes 2 et 3),
            on pose la relation qui le relie à la part et au tout. */}
        <KnowledgeBrick
          id="formule-proportion"
          variant="new"
          lead={<>Ce nombre unique se lit dans les <strong>deux sens</strong> : il donne la part quand on connaît le tout, et le tout quand on connaît la part.</>}
        />
        <NumericQuestion
          prompt="Dans un lycée de 1 250 élèves, 36 % font une langue ancienne. Combien d’élèves cela représente-t-il ?"
          expected={450} suffix="élèves"
          requires={['formule-proportion', 'trois-ecritures', 'vocab-part-tout', 'pourcentage', 'effectif']}
          explain="36 % = 0,36 et 0,36 × 1 250 = 450. Appliquer une proportion, c’est MULTIPLIER le tout par le nombre décimal."
          explainFor={(n) => (n === 36
            ? '36 est le pourcentage, pas l’effectif : il faut encore le multiplier par le tout, 0,36 × 1 250 = 450.'
            : n === 3472 || n === 3472.22
              ? 'Tu as divisé au lieu de multiplier. Une part est plus petite que le tout : 0,36 × 1 250 = 450.'
              : 'partie = proportion × tout, soit 0,36 × 1 250 = 450.')}
          solved={q2} onAnswered={() => setQ2(true)}
        />
        </div>
      ),
    },
    {
      num: 3,
      title: 'De l’effectif au tout',
      subtitle: 'Le sens qu’on oublie.',
      done: q3,
      content: (
        <NumericQuestion
          prompt="Dans un autre lycée, 189 élèves sont demi-pensionnaires, et cela représente 42 % des élèves. Combien y a-t-il d’élèves en tout ?"
          expected={450} suffix="élèves"
          requires={['formule-proportion', 'proportion-reference', 'vocab-part-tout', 'quotient', 'effectif']}
          above={(revealed) => (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3 text-center">
              <MathText>{'$$\\text{partie} = p \\times \\text{tout} \\quad\\Longrightarrow\\quad \\text{tout} = \\frac{\\text{partie}}{p}$$'}</MathText>
              {revealed && <p className="text-xs text-violet-700 mt-1">189 ÷ 0,42 = 450</p>}
            </div>
          )}
          explain="tout = partie ÷ p = 189 ÷ 0,42 = 450. On DIVISE, parce qu’on remonte à la référence."
          explainFor={(n) => (n === 79 || n === 79.38
            ? 'Tu as multiplié : 189 × 0,42 donne une part de la part. Ici c’est le TOUT qu’on cherche, donc on divise : 189 ÷ 0,42 = 450.'
            : n === 231
              ? '189 n’est pas 42 % de plus que quelque chose : c’est 42 % DE quelque chose. 189 ÷ 0,42 = 450.'
              : 'Le tout est toujours plus grand que la part : 189 ÷ 0,42 = 450.')}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      // La fraction était toujours LUE (3/8 → 37,5 %), jamais PRODUITE : la
      // simplification était faite par le gcd du composant. Ici l'élève écrit
      // lui-même le numérateur et le dénominateur de la forme irréductible.
      num: 4,
      title: 'À toi d’écrire la fraction',
      subtitle: '18 élèves sur 24 sont externes. Écris cette proportion en fraction, simplifiée autant que tu peux.',
      done: q3b && q3c,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Numérateur de la fraction simplifiée :"
            expected={3} suffix=""
            requires={['trois-ecritures', 'numerateur', 'denominateur', 'quotient']}
            explain="18/24 : on divise les deux nombres par 6, le plus grand nombre qui divise à la fois 18 et 24. Cela donne 3/4 — la fraction irréductible. Le numérateur est 3."
            explainFor={(n) => (n === 18
              ? '18/24 est bien la proportion, mais elle se simplifie encore : 6 divise à la fois 18 et 24.'
              : n === 6
                ? 'Tu as divisé par 3 seulement : 6/8 se simplifie encore par 2. Va jusqu’à 3/4.'
                : n === 4
                  ? 'Attention au sens : la part (18) est au NUMÉRATEUR, le tout (24) au dénominateur.'
                  : 'Cherche par quel nombre diviser 18 ET 24 : c’est 6, et 18 ÷ 6 = 3.')}
            solved={q3b} onAnswered={() => setQ3b(true)}
          />
          {q3b && (
            <NumericQuestion
              prompt="Dénominateur de la fraction simplifiée :"
              expected={4} suffix=""
              requires={['trois-ecritures', 'numerateur', 'denominateur']}
              explain="24 ÷ 6 = 4. La proportion s’écrit donc 3/4, soit 0,75, soit 75 % — trois écritures du même nombre."
              explainFor={(n) => (n === 24
                ? 'Le dénominateur doit être divisé par 6 lui aussi : 24 ÷ 6 = 4.'
                : n === 8
                  ? 'Tu as divisé par 3 : 6/8 se simplifie encore par 2, ce qui donne 3/4.'
                  : 'On divise le tout par le même nombre que la part : 24 ÷ 6 = 4.')}
              solved={q3c} onAnswered={() => setQ3c(true)}
            />
          )}
          {q3b && q3c && (
            <Feedback tone="ok">
              <span className="font-mono font-bold">18/24 = 3/4 = 0,75 = 75 %</span>. Tu n’as pas
              choisi cette fraction dans une liste : tu l’as <strong>écrite</strong>, en cherchant
              toi-même par quoi diviser. C’est le même nombre sous quatre habits.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'Trois écritures à relier',
      done: q4,
      content: (
        <BatchChoiceQuestion
          requires={['trois-ecritures', 'vocab-pourcentage', 'fraction-decimale', 'numerateur', 'denominateur', 'quotient']}
          intro={<p className="text-sm font-semibold text-slate-700">Pour chaque proportion, quelle est l’écriture en pourcentage ?</p>}
          rows={[
            { id: 'r1', label: <span className="font-mono">0,08</span>, options: ['0,8 %', '8 %', '80 %'], correct: 1, correction: '0,08 = 8/100 = 8 %' },
            { id: 'r2', label: <span className="font-mono">3/8</span>, options: ['37,5 %', '3,8 %', '38 %'], correct: 0, correction: '3 ÷ 8 = 0,375 = 37,5 %' },
            { id: 'r3', label: <span className="font-mono">1,25</span>, options: ['12,5 %', '1,25 %', '125 %'], correct: 2, correction: '1,25 = 125/100 = 125 % — une proportion peut dépasser 100 % quand la « part » est plus grande que la référence' },
            { id: 'r4', label: <span className="font-mono">7/20</span>, options: ['35 %', '7,20 %', '3,5 %'], correct: 0, correction: '7/20 = 35/100 = 35 %' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Pour passer au pourcentage on multiplie le décimal par 100 —
              {' '}<strong>on ne déplace pas la virgule au hasard</strong> : 0,08 vaut 8 %, pas 0,8 %.
            </Feedback>
          )}
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Trois écritures, une proportion" moduleSubtitle="Décimale, fraction, pourcentage" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'p = partie / tout', tone: 'violet',
        body: <p>Une proportion est un quotient : la part divisée par le tout. Ce nombre s’écrit de trois façons, et se lit dans les deux sens — pour trouver la part, ou pour remonter au tout.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et maintenant ?</strong> Tu sais lire une part d’un tout. Module suivant : une part <em>d’une part</em> —
          et le piège qui fait additionner deux pourcentages alors qu’il faut les multiplier.
        </KnowledgeSnapshot>
      )}
    />
  );
}
