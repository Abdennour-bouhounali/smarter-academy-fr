import React, { useState, useEffect, useRef } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MarbleBag from '../components/MarbleBag';
import { makeRng, formatDec, parseDec } from '@smarter-academy/core';
import { bagProbability, bagTotal, scaleBag, drawMany, fracLatex, simplify, formatPct, sessionSeed } from '../components/probaUtils';

/**
 * Module 3 — DÉCOUVERTE : « Le sac de billes ».
 *
 * Activity: composer un sac pour atteindre une part visée ; le doubler ; y
 *   tirer 200 fois ; composer un sac à deux contraintes.
 * Mathematical objective: P(couleur) = nb de billes de la couleur ÷ nb total —
 *   la fraction DÉCRIT le sac ; deux sacs proportionnels (2/8 et 4/16) ont la
 *   même probabilité (fractions égales) ; sur n tirages on attend P × n.
 * Student action: − / + par couleur ; « Doubler » ; « Tirer 200 fois ».
 * Controlled variable: la composition du sac.
 * Mathematical state: `bag` {rouge, bleu, vert} ; probabilités et fractions
 *   dérivées par bagProbability / fracLatex ; les tirages sont un instantané.
 * Visual consequence: les billes apparaissent ; la fraction se réduit ; les
 *   effectifs tirés se comparent à l'attendu.
 * Expected observation: « 2 sur 8 et 4 sur 16, c'est la même chance ».
 * Misconception targeted: « plus de rouges ⇒ plus probable » sans le total ;
 *   « doubler le sac change la chance ».
 * Feedback: l'écart avec la part visée est écrit (« pour l'instant 3/8 ») ;
 *   « montre-moi » après plusieurs réglages.
 * Formalization: chaque notion est posée par une <KnowledgeBrick> (texte
 *   unique dans knowledge.jsx) : la formule P = favorables ÷ possibles dès que
 *   le sac visé est composé, « deux fractions égales, la même probabilité »
 *   après le doublement, « toutes les probabilités font 1 » après le sac à
 *   deux contraintes, et « prévoir P × n » avant la prédiction de tirages.
 * Scaffolding: une contrainte → prédiction → tirage → deux contraintes →
 *   sans sac.
 */

const SEED = 20260905 + 3;
const START = { rouge: 1, bleu: 1, vert: 1 };
const HINT_AFTER = 6;
const TARGET1 = { num: 1, den: 4 };
const SOLUTION1 = { rouge: 2, bleu: 4, vert: 2 };
const SOLUTION4 = { rouge: 4, bleu: 6, vert: 2 };
const N = 200;

const hits = (p, target) => p !== null && Math.abs(p - target) < 1e-9;

export default function Module03SacDeBilles() {
  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = makeRng(sessionSeed(SEED));

  const [bag, setBag] = useState(START);
  const [changes, setChanges] = useState(0);
  const [done1, setDone1] = useState(false);
  const [snap1, setSnap1] = useState(null);
  const [predDone, setPredDone] = useState(false);
  const [doubled, setDoubled] = useState(false);
  const [expectDone, setExpectDone] = useState(false);
  const [draws, setDraws] = useState(null);
  const [bag4, setBag4] = useState({ rouge: 3, bleu: 3, vert: 3 });
  const [changes4, setChanges4] = useState(0);
  const [done4, setDone4] = useState(false);
  const [noBagDone, setNoBagDone] = useState(false);
  const reactRef = useRef(null);

  const pR = bagProbability(bag, 'rouge');
  const total = bagTotal(bag);

  /* Étape 1 : complète sur l'objectif réel — aucune validation à cliquer. */
  useEffect(() => {
    if (done1 || !hits(pR, 0.25)) return;
    setDone1(true);
    setSnap1(bag);
    reactRef.current?.(true);
  }, [pR, done1, bag]);

  const pB4 = bagProbability(bag4, 'bleu');
  const pV4 = bagProbability(bag4, 'vert');
  useEffect(() => {
    if (done4 || !hits(pB4, 0.5) || !hits(pV4, 1 / 6)) return;
    setDone4(true);
    reactRef.current?.(true);
  }, [pB4, pV4, done4]);

  const change1 = (b) => { setBag(b); setChanges((c) => c + 1); };
  const reveal1 = () => { setBag(SOLUTION1); setChanges((c) => c + 1); };
  const change4 = (b) => { setBag4(b); setChanges4((c) => c + 1); };
  const reveal4 = () => { setBag4(SOLUTION4); setChanges4((c) => c + 1); };

  const doubleBag = () => { const nb = scaleBag(bag, 2); setBag(nb); setDoubled(true); reactRef.current?.(true); };
  const draw = (n) => {
    const r = drawMany(bag, n, rngRef.current);
    setDraws({ counts: r.counts, n, last: r.last });
    reactRef.current?.(true);
  };

  const expected = pR !== null ? pR * N : 0;
  const fracNow = (p, b, c) => (p === null ? '—' : `${b[c]}/${bagTotal(b)}`);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le sac de billes"
      moduleSubtitle="Compose le sac, double-le, tire 200 fois : la fraction décrit le sac."
      estimatedTime="10 min"
      brief={{
        tag: '🎒 Mission 03',
        title: 'Une chance sur quatre',
        tone: 'cyan',
        body: (
          <p>
            Pour le tirage au sort du jeu, il faut un sac où tirer une bille rouge ait{' '}
            <strong>une chance sur quatre</strong>. Compose-le : ajoute ou retire des billes.
          </p>
        ),
      }}
      intro={(kit) => { reactRef.current = kit.react; return null; }}
      steps={[
        {
          num: 1,
          title: 'Compose le sac',
          subtitle: 'Objectif : tirer une rouge a une chance sur quatre.',
          done: done1,
          content: (
            <div className="space-y-3">
              <MarbleBag bag={bag} onChange={change1} disabled={done1} showProbability={done1} highlight="rouge" caption="Ton sac" />
              {!done1 && (
                <Feedback tone="info">
                  Pour l’instant : <strong>{fracNow(pR, bag, 'rouge')}</strong> {total === 0 ? '— le sac est vide.' : `des billes sont rouges (${formatPct(pR ?? 0, total)}).`}{' '}
                  Une chance sur quatre, c’est 25 %.
                  {changes >= HINT_AFTER && (
                    <> <button type="button" onClick={reveal1} className="underline font-semibold text-sky-700 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Je ne trouve pas — montre-moi</button></>
                  )}
                </Feedback>
              )}
              {done1 && snap1 && (
                <KnowledgeBrick
                  id="formule-probabilite"
                  variant="new"
                  lead={(
                    <>
                      {snap1.rouge} rouge{snap1.rouge > 1 ? 's' : ''} sur {bagTotal(snap1)} billes :{' '}
                      <MathText>{`$P(\\text{rouge}) = \\frac{${snap1.rouge}}{${bagTotal(snap1)}} = ${fracLatex(1, 4)}$`}</MathText>.
                      Ce que tu viens de faire à la main, une formule le dit pour toutes les situations.
                    </>
                  )}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Prédis : on double tout',
          subtitle: 'Deux fois plus de rouges, de bleues, de vertes.',
          done: predDone && doubled,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Si on double chaque couleur du sac, la probabilité de tirer une rouge…"
                requires={['formule-probabilite', 'probabilite']}
                options={['reste la même', 'double', 'est divisée par deux']}
                correct={0}
                cols={1}
                explain="Deux fois plus de rouges, mais aussi deux fois plus de billes : la part ne change pas. Vérifie-le en doublant le sac."
                explainWrong="Deux fois plus de rouges — et deux fois plus de billes en tout. Double le sac et regarde la fraction."
                solved={predDone}
                onAnswered={() => setPredDone(true)}
              />
              {predDone && !doubled && (
                <button type="button" onClick={doubleBag}
                  className="w-full min-h-[48px] rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ touchAction: 'manipulation' }} aria-label="Doubler le sac">
                  ×2 Doubler le sac
                </button>
              )}
              {doubled && (
                <>
                  <MarbleBag bag={bag} onChange={() => {}} disabled showProbability highlight="rouge" caption="Le sac doublé" />
                  <KnowledgeBrick
                    id="fractions-egales-meme-probabilite"
                    variant="new"
                    lead={(
                      <>
                        <MathText>{`$\\frac{${bag.rouge}}{${total}} = \\frac{${simplify(bag.rouge, total).num}}{${simplify(bag.rouge, total).den}}$`}</MathText> : le sac
                        a doublé, la fraction réduite n’a pas bougé.
                      </>
                    )}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Tire 200 fois',
          subtitle: 'Prédis le nombre de rouges, puis tire.',
          done: expectDone && draws !== null,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="effectif-attendu"
                variant="new"
                lead="Tu sais calculer la probabilité d’une couleur. Elle sert aussi à prévoir — approximativement — ce que donnera une longue série de tirages."
              >
              <NumericQuestion
                prompt={`Avec P(rouge) = 1/4, combien de billes rouges attends-tu sur ${N} tirages (avec remise) ?`}
                requires={['effectif-attendu', 'formule-probabilite']}
                expected={expected}
                parse={parseDec}
                display={formatDec(expected)}
                explain={`1/4 de ${N}, c’est ${N} ÷ 4 = ${formatDec(expected)}. On attend ENVIRON ce nombre — pas exactement : c’est une expérience aléatoire.`}
                explainFor={(n) => {
                  if (n === 4) return `4 est le dénominateur, pas un nombre de billes. Un quart de ${N} tirages : ${formatDec(expected)}.`;
                  if (n === N / 2) return `La moitié, ce serait pour P = 1/2. Ici P = 1/4 : ${N} ÷ 4 = ${formatDec(expected)}.`;
                  return null;
                }}
                solved={expectDone}
                onAnswered={() => setExpectDone(true)}
              />
              </KnowledgeBrick>
              {expectDone && (
                <MarbleBag bag={bag} onChange={() => {}} disabled showProbability highlight="rouge" draws={draws} onDraw={draws ? null : draw} drawN={N} caption="Tirages avec remise" />
              )}
              {draws && (
                <Feedback tone="info">
                  Observé : <strong>{formatDec(draws.counts.rouge)} rouges</strong> sur {N} ({formatPct(draws.counts.rouge / N, N)}) ; attendu :
                  environ {formatDec(expected)} (25 %). L’écart est normal — la fréquence observée n’est pas la probabilité, elle
                  s’en approche.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Deux contraintes',
          subtitle: 'Objectif : P(bleue) = 1/2 ET P(verte) = 1/6 en même temps.',
          done: done4,
          content: (
            <div className="space-y-3">
              <MarbleBag bag={bag4} onChange={change4} disabled={done4} showProbability caption="Le second sac" />
              {!done4 && (
                <Feedback tone="info">
                  Pour l’instant : P(bleue) = <strong>{fracNow(pB4, bag4, 'bleu')}</strong>{hits(pB4, 0.5) ? ' ✓' : ''}, P(verte) ={' '}
                  <strong>{fracNow(pV4, bag4, 'vert')}</strong>{hits(pV4, 1 / 6) ? ' ✓' : ''}. Pense au total : un sixième
                  demande un total multiple de 6.
                  {changes4 >= HINT_AFTER + 2 && (
                    <> <button type="button" onClick={reveal4} className="underline font-semibold text-sky-700 focus-visible:ring-2 focus-visible:ring-blue-500 rounded">Je ne trouve pas — montre-moi</button></>
                  )}
                </Feedback>
              )}
              {done4 && (
                <KnowledgeBrick
                  id="somme-des-probabilites"
                  variant="new"
                  lead={(
                    <>
                      {bag4.bleu} bleues sur {bagTotal(bag4)} = 1/2, {bag4.vert} verte{bag4.vert > 1 ? 's' : ''} sur{' '}
                      {bagTotal(bag4)} = 1/6 — et les {bag4.rouge} rouges ont pris exactement le reste. Ce
                      « reste » n’est pas un hasard.
                    </>
                  )}
                />
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Sans le sac',
          subtitle: 'Calcule de tête.',
          done: noBagDone,
          content: (
            <TapQuestion
              prompt="Un sac contient 5 billes rouges, 3 bleues et 2 vertes. On tire une bille au hasard. Quelle est la probabilité qu’elle soit verte ?"
              requires={['formule-probabilite', 'fractions-egales-meme-probabilite']}
              options={['$\\frac{1}{5}$', '$\\frac{2}{8}$', '$\\frac{2}{5}$', '$\\frac{1}{2}$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              correctionLabel="1/5"
              correct={0}
              cols={2}
              explain="2 vertes sur 5 + 3 + 2 = 10 billes : P(verte) = 2/10 = 1/5. Le dénominateur est le nombre TOTAL de billes — pas seulement celles des autres couleurs."
              solved={noBagDone}
              onAnswered={() => setNoBagDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          Tu sais calculer une probabilité et prévoir un nombre de tirages. Et si on lance <strong>deux</strong>
          {' '}dés d’un coup ? Les onze sommes ont-elles toutes la même chance ? C’est le module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
