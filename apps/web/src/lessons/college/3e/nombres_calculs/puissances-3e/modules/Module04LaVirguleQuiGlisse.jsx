import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DecimalShifter from '../components/DecimalShifter';
import MagnitudeStrip from '../components/MagnitudeStrip';
import { formatDec, formatShift, orderOfMagnitude, shiftDecimal } from '../components/powerUtils';

/**
 * Module 4 — MANIPULATION : « La virgule qui glisse ».
 *
 * Activity: régler l'exposant de 10 pour transformer 3,45 en 34 500, puis en
 *   0,00345, en regardant la virgule se déplacer d'un rang par cran.
 * Mathematical objective: multiplier par 10^n décale la virgule de n rangs ;
 *   l'exposant donne l'ORDRE DE GRANDEUR.
 * Student action: pousser −/+ sur n, puis taper une graduation de la bande
 *   logarithmique.
 * Controlled variable: n (puis l'ordre de grandeur choisi).
 * Mathematical state: n ; le nombre affiché vient de shiftDecimal, l'ordre
 *   de grandeur de orderOfMagnitude.
 * Visual consequence: la virgule glisse le long des chiffres ; le nombre
 *   final n'apparaît qu'une fois la virgule posée.
 * Expected observation: les chiffres ne changent jamais — seule leur place
 *   par rapport à la virgule change.
 * Misconception targeted: se tromper de sens (n > 0 ferait aller à gauche) ;
 *   croire que 10^{-2} est négatif ; comparer les mantisses avant les
 *   exposants.
 * Feedback: à chaque cran, le nombre de rangs et le sens sont annoncés ; en
 *   cas d'erreur sur la bande, l'écart en rangs est chiffré.
 * Formalization: étape 3, l'ordre de grandeur nommé après le glissement.
 * Scaffolding: stepper principal, curseur secondaire, cible chiffrée.
 * Transfer: l'écriture scientifique du module 5 réutilise exactement ce
 *   glissement, mais contraint la mantisse entre 1 et 10.
 */
const MANTISSA = 3.45;
const TARGET_BIG = 4; // 34 500
const TARGET_SMALL = -3; // 0,00345

export default function Module04LaVirguleQuiGlisse() {
  const [n, setN] = useState(0);
  const [hitBig, setHitBig] = useState(false);
  const [hitSmall, setHitSmall] = useState(false);
  const [pick, setPick] = useState(null);
  const [stripDone, setStripDone] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [signDone, setSignDone] = useState(false);

  const bothHit = hitBig && hitSmall;
  const STRIP_VALUE = 0.000042;

  const handleShift = (next, kitReact) => {
    setN(next);
    if (next === TARGET_BIG && !hitBig) {
      setHitBig(true);
      kitReact?.(true);
    }
    if (next === TARGET_SMALL && !hitSmall) {
      setHitSmall(true);
      kitReact?.(true);
    }
  };

  const handlePick = (e, kitReact) => {
    if (stripDone) return;
    setPick(e);
    setStripDone(true);
    kitReact?.(e === orderOfMagnitude(STRIP_VALUE));
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La virgule qui glisse"
      moduleSubtitle="Change l’exposant de 10 : la virgule se déplace, le nombre change d’échelle."
      estimatedTime="10 min"
      brief={{
        tag: '📏 Mission 04',
        title: 'Les chiffres ne changent pas. Seule leur place change.',
        body: (
          <p>
            Tu pars de <strong>{formatDec(MANTISSA)}</strong> et tu règles l’exposant de 10. Trouve les deux
            réglages qui donnent <strong>{formatShift(MANTISSA, TARGET_BIG)}</strong>, puis{' '}
            <strong>{formatShift(MANTISSA, TARGET_SMALL)}</strong>.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Fais glisser la virgule vers les deux cibles',
          subtitle: 'Un cran d’exposant = un rang de virgule.',
          done: bothHit,
          content: (kit) => (
            <div className="space-y-3">
              <DecimalShifter
                mantissa={MANTISSA}
                n={n}
                onChange={(v) => handleShift(v, kit.react)}
                minN={-4}
                maxN={6}
              />
              <div className="grid grid-cols-2 gap-2 text-center text-sm">
                <div className={`rounded-xl border-2 p-2 ${hitBig ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>
                  {hitBig ? '✓ ' : ''}
                  <span className="font-mono font-bold">{formatShift(MANTISSA, TARGET_BIG)}</span>
                </div>
                <div className={`rounded-xl border-2 p-2 ${hitSmall ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-600'}`}>
                  {hitSmall ? '✓ ' : ''}
                  <span className="font-mono font-bold">{formatShift(MANTISSA, TARGET_SMALL)}</span>
                </div>
              </div>
              {!bothHit && (
                <Feedback tone="info">
                  Pour l’instant tu affiches{' '}
                  <strong className="font-mono">{formatShift(MANTISSA, n)}</strong>. Il te reste{' '}
                  {!hitBig && (
                    <>
                      <strong className="font-mono">{formatDec(Math.abs(TARGET_BIG - n))}</strong> cran
                      {Math.abs(TARGET_BIG - n) > 1 ? 's' : ''} vers le haut pour {formatShift(MANTISSA, TARGET_BIG)}
                    </>
                  )}
                  {!hitBig && !hitSmall && ', et '}
                  {!hitSmall && (
                    <>
                      <strong className="font-mono">{formatDec(Math.abs(n - TARGET_SMALL))}</strong> cran
                      {Math.abs(n - TARGET_SMALL) > 1 ? 's' : ''} vers le bas pour {formatShift(MANTISSA, TARGET_SMALL)}
                    </>
                  )}
                  .
                </Feedback>
              )}
              {bothHit && (
                <Feedback tone="ok">
                  Les deux cibles sont atteintes.{' '}
                  <MathText>{'$3{,}45 \\times 10^{4} = 34\\,500$'}</MathText> (4 rangs à droite) et{' '}
                  <MathText>{'$3{,}45 \\times 10^{-3} = 0{,}00345$'}</MathText> (3 rangs à gauche). Les
                  chiffres 3, 4 et 5 n’ont pas bougé — seule la virgule s’est déplacée.
                </Feedback>
              )}
              {bothHit && (
                <KnowledgeBrick
                  id="puissance-de-dix"
                  variant="new"
                  lead="Ce que la virgule vient de faire, l’exposant le compte."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Un exposant négatif ne rend pas le nombre négatif',
          done: signDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt={
                <>
                  Que vaut <MathText>{'$5 \\times 10^{-2}$'}</MathText> ?
                </>
              }
              options={['$-500$', '$0{,}05$', '$-0{,}05$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['−500', '0,05', '−0,05'][i]}
              correctionLabel="0,05"
              cols={3}
              correct={1}
              explain={
                <>
                  Deux rangs vers la gauche à partir de 5 : 0,5 puis{' '}
                  <strong className="font-mono">0,05</strong>. Le nombre devient petit, jamais négatif.
                </>
              }
              explainWrong={
                <>
                  Le « − » porte sur l’EXPOSANT, pas sur le nombre :{' '}
                  <MathText>{'$10^{-2} = \\frac{1}{100}$'}</MathText>, un nombre positif. Multiplier 5 par
                  un centième donne 0,05. Pour obtenir −500, il faudrait{' '}
                  <MathText>{'$-5 \\times 10^{2}$'}</MathText>.
                </>
              }
              requires={['exposant-negatif', 'puissance-de-dix']}
              solved={signDone}
              onAnswered={() => setSignDone(true)}
            />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Situe un nombre sur la bande des puissances de dix',
          subtitle: `Où se place ${formatDec(STRIP_VALUE, { maxDecimals: 12 })} ?`,
          done: stripDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Chaque graduation est une puissance de 10. Tape celle qui donne l’<strong>ordre de
                grandeur</strong> de{' '}
                <strong className="font-mono">{formatDec(STRIP_VALUE, { maxDecimals: 12 })}</strong> —
                c’est-à-dire la puissance de 10 juste en dessous.
              </p>
              <MagnitudeStrip
                value={STRIP_VALUE}
                picked={pick}
                onPick={stripDone ? undefined : (e) => handlePick(e, kit.react)}
                minExp={-6}
                maxExp={6}
                revealed={stripDone}
                label="Bande des ordres de grandeur"
              />
              {stripDone && (
                <Feedback tone={pick === orderOfMagnitude(STRIP_VALUE) ? 'ok' : 'ko'}>
                  {pick !== orderOfMagnitude(STRIP_VALUE) && (
                    <>
                      Ta réponse : <strong className="font-mono">10^{formatDec(pick)}</strong>. Bonne
                      réponse : <strong className="font-mono">10^{formatDec(orderOfMagnitude(STRIP_VALUE))}</strong>{' '}
                      — soit {formatDec(Math.abs(pick - orderOfMagnitude(STRIP_VALUE)))} rang
                      {Math.abs(pick - orderOfMagnitude(STRIP_VALUE)) > 1 ? 's' : ''} d’écart.{' '}
                    </>
                  )}
                  <MathText>{'$0{,}000042 = 4{,}2 \\times 10^{-5}$'}</MathText> : la virgule doit glisser de
                  5 rangs vers la droite pour donner un nombre entre 1 et 10. L’ordre de grandeur est donc{' '}
                  <MathText>{'$10^{-5}$'}</MathText>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Comparer, c’est d’abord comparer les exposants',
          done: orderDone,
          content: (
            <div className="space-y-4">
            <KnowledgeBrick
              id="ordre-de-grandeur"
              variant="new"
              compact
              lead="Ce que tu viens de comparer porte un nom."
            />
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-center space-y-2">
                <p className="text-sm font-semibold text-violet-900">À retenir</p>
                <MathText className="text-lg text-slate-800">
                  {'$a \\times 10^{n} : \\text{la virgule glisse de } n \\text{ rangs}$'}
                </MathText>
                <p className="text-xs text-violet-800">
                  n &gt; 0 : vers la droite, le nombre grandit. n &lt; 0 : vers la gauche, le nombre
                  rapetisse. L’<strong>ordre de grandeur</strong>, c’est cette puissance de 10.
                </p>
              </div>
              <TapQuestion
                prompt={
                  <>
                    Lequel est le plus grand :{' '}
                    <MathText>{'$9 \\times 10^{3}$'}</MathText> ou{' '}
                    <MathText>{'$2 \\times 10^{5}$'}</MathText> ?
                  </>
                }
                options={['$9 \\times 10^{3}$', '$2 \\times 10^{5}$', 'Ils sont égaux']}
                renderOption={(o) => (o.startsWith('$') ? <MathText>{o}</MathText> : o)}
                optionLabel={(i) => ['9 × 10³', '2 × 10⁵', 'égaux'][i]}
                correctionLabel="2 × 10⁵"
                cols={3}
                correct={1}
                explain={
                  <>
                    <MathText>{'$9 \\times 10^{3} = 9\\,000$'}</MathText> et{' '}
                    <MathText>{'$2 \\times 10^{5} = 200\\,000$'}</MathText>. L’exposant décide en premier :
                    5 &gt; 3, donc le second est plus grand — même si 9 &gt; 2.
                  </>
                }
                explainWrong={
                  <>
                    Le piège : comparer 9 et 2 avant les exposants. Deux rangs de virgule en plus, c’est un
                    facteur 100 — bien plus que le rapport entre 9 et 2. En chiffres :{' '}
                    <strong className="font-mono">{formatDec(shiftDecimal(9, 3))}</strong> contre{' '}
                    <strong className="font-mono">{formatDec(shiftDecimal(2, 5))}</strong>.
                  </>
                }
                requires={['ordre-de-grandeur', 'puissance-de-dix']}
                solved={orderDone}
                onAnswered={() => setOrderDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> La virgule glisse au rythme de l’exposant. Reste à en faire
          une écriture normalisée.
        </KnowledgeSnapshot>
      )}
    />
  );
}
