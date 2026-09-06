import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DiceLab, { FaceChips, DieIcon, theoryFor } from '../components/DiceLab';
import FrequencyStrip from '../components/FrequencyStrip';
import { makeRng, parseDec, formatDec } from '@smarter-academy/core';
import {
  ZERO, ROLL_MS, fairWeights, loadedWeights, rollMany, totalOf, frequencies, pct, formatPct,
  leaders, laggards, spreadPoints, faceList,
} from '../components/diceUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Lancer le dé ».
 *
 * Activity: un laboratoire du dé. L'élève prédit, lance, relance (1, 10, 100,
 *   1 000 fois), et regarde une série statistique se construire sous ses yeux
 *   — puis se stabiliser.
 * Mathematical objective: faire naître, dans cet ordre, les idées de HASARD
 *   (un lancer est imprévisible), de SÉRIE (les faces sont les valeurs, les
 *   nombres d'apparitions les effectifs), de FRÉQUENCE (effectif ÷ total), de
 *   STABILISATION (les fréquences se resserrent quand le nombre de lancers
 *   grandit), et enfin de PROBABILITÉ : pour un dé équilibré, 1 face sur 6.
 * Student action: toucher une face pour prédire ; toucher « Lancer » ; lancer
 *   des séries de 100 et de 1 000 ; alourdir une face du dé.
 * Controlled variable: le nombre de lancers — puis les poids du dé.
 * Mathematical state: { counts[6] } — six effectifs, la seule vérité. Total,
 *   fréquences, face en tête, écart, repère 1/6 en sont dérivés (diceUtils).
 *   Les séries passées sont FIGÉES en instantanés pour être comparées.
 * Visual consequence: le dé roule puis se pose ; la barre de la face obtenue
 *   grandit ; sur 1 000 lancers, six barres presque de même hauteur.
 * Expected observation: « je ne peux pas prévoir UN lancer, mais sur 1 000
 *   lancers je sais à peu près ce qui va se passer ».
 * Misconception targeted: « le 6 est plus dur à obtenir » ; « il vient de
 *   sortir trois fois, donc il est plus probable » ; « les fréquences finissent
 *   par être exactement égales » ; « fréquence = probabilité ».
 * Feedback: chaque correction cite LES nombres de l'élève (ses effectifs, ses
 *   écarts, sa face en tête) — jamais des valeurs inventées.
 * Formalization: chaque mot est posé par une <KnowledgeBrick> APRÈS le geste
 *   qui lui donne son sens et AVANT la première demande qui l'exige —
 *   « expérience aléatoire » et « série / valeurs / effectifs » à l'étape 2,
 *   « fréquence » à l'étape 3, « stabilisation » à l'étape 5, « probabilité »
 *   à l'étape 7, « fréquence ≠ probabilité » à l'étape 8. Les définitions
 *   vivent dans knowledge.jsx, pas ici (docs/architecture/KNOWLEDGE_MAP.md).
 * Scaffolding: un seul bouton (Lancer) → ×10 → séries de 100 → séries de
 *   1 000 avec pari → dé truqué → questions sans manipulation.
 * Transfer: retour au jeu de plateau (étape 6) ; dé truqué (étape 9) ; la
 *   leçon Probabilités reprend P(événement) = favorables ÷ possibles.
 *
 * LE HASARD EST REJOUABLE : le générateur est semé d'un littéral (SEED). La
 * face est TIRÉE au moment du clic, mais RÉVÉLÉE après le roulement du dé —
 * le nombre n'apparaît jamais avant que le dé se pose (settle-then-number).
 */

const SEED = 20260904;
const GUESSES_NEEDED = 3;
const RUNS_NEEDED = 3;

const snapshotOf = (r, loaded = null) => ({ counts: r.counts, last: r.last, loaded });

export default function Module01LancerLeDe() {
  const reduce = useReducedMotion();

  /* ── L'état mathématique vivant ── */
  const [counts, setCounts] = useState(ZERO);
  const [last, setLast] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [loadedFace, setLoadedFace] = useState(null);

  /* ── Les instantanés figés, un par étape ── */
  const [predicted, setPredicted] = useState(null);
  const [guesses, setGuesses] = useState([]);
  const [snap3, setSnap3] = useState(null);
  const [snap10, setSnap10] = useState(null);
  const [snap100, setSnap100] = useState(null);
  const [pred1000, setPred1000] = useState(null);
  const [runs, setRuns] = useState([]);
  const [snapLoaded, setSnapLoaded] = useState(null);

  /* ── Les réponses ── */
  const [fewDone, setFewDone] = useState(false);
  const [freqDone, setFreqDone] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [stabDone, setStabDone] = useState(false);
  const [gameA, setGameA] = useState(false);
  const [gameB, setGameB] = useState(false);
  const [probDone, setProbDone] = useState(false);
  const [contrastDone, setContrastDone] = useState(false);
  const [loadedDone, setLoadedDone] = useState(false);
  const [finalA, setFinalA] = useState(false);
  const [finalB, setFinalB] = useState(false);

  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = makeRng(SEED);
  const countsRef = useRef(ZERO);
  const guessesRef = useRef([]);
  const snap10Ref = useRef(null);
  const reactRef = useRef(null);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  /**
   * Un lancer : la mathématique est décidée tout de suite (le rng avance), le
   * résultat n'est montré qu'après le roulement. Aucun effet dans un updater.
   */
  const launch = (compute, after) => {
    if (rolling) return;
    const result = compute();
    const finish = () => {
      countsRef.current = result.counts;
      setCounts(result.counts);
      setLast(result.last);
      setRolling(false);
      reactRef.current?.(true);
      after?.(result);
    };
    if (reduce) { finish(); return; }
    setRolling(true);
    timer.current = setTimeout(finish, ROLL_MS);
  };
  const rng = () => rngRef.current;

  /* Étape 1 : un lancer, une prédiction. */
  const throwGuess = () => {
    const p = predicted;
    launch(() => rollMany(countsRef.current, 1, rng(), fairWeights()), (r) => {
      const next = [...guessesRef.current, { pred: p, got: r.last }];
      guessesRef.current = next;
      setGuesses(next);
      if (next.length === GUESSES_NEEDED) setSnap3(snapshotOf(r));
    });
  };
  /* Étape 2 : on continue la même série jusqu'à 10 lancers au moins. */
  const throwLive = (n) => {
    launch(() => rollMany(countsRef.current, n, rng(), fairWeights()), (r) => {
      if (!snap10Ref.current && totalOf(r.counts) >= 10) {
        const s = snapshotOf(r);
        snap10Ref.current = s;
        setSnap10(s);
      }
    });
  };
  /* Étapes 3 et 4 : des séries neuves, à partir de zéro. */
  const series100 = () => launch(() => rollMany(ZERO, 100, rng(), fairWeights()), (r) => setSnap100(snapshotOf(r)));
  const series1000 = () => launch(() => rollMany(ZERO, 1000, rng(), fairWeights()), (r) => {
    const s = snapshotOf(r);
    setRuns((rs) => [...rs, s]);
  });
  /* Étape 9 : la même série de 1 000, avec une face alourdie. */
  const seriesLoaded = () => {
    const face = loadedFace;
    launch(() => rollMany(ZERO, 1000, rng(), loadedWeights(face)), (r) => setSnapLoaded(snapshotOf(r, face)));
  };
  /* Labo libre : tout est permis. */
  const throwFree = (n) => launch(() => rollMany(countsRef.current, n, rng(), loadedWeights(loadedFace)));
  const seriesFree = (n) => launch(() => rollMany(ZERO, n, rng(), loadedWeights(loadedFace)));
  const resetFree = () => { countsRef.current = ZERO; setCounts(ZERO); setLast(null); };

  /** Une vue du laboratoire : vivante, ou figée sur un instantané. */
  const lab = (snapshot, opts = {}) => {
    const { theory = false, ...rest } = opts;
    const loaded = snapshot ? snapshot.loaded : loadedFace;
    return (
      <DiceLab
        counts={snapshot ? snapshot.counts : counts}
        lastFace={snapshot ? snapshot.last : last}
        rolling={!snapshot && rolling}
        frozen={!!snapshot}
        loadedFace={loaded}
        showVocab={fewDone}
        showFreq={freqDone}
        theory={theory ? theoryFor(loaded) : null}
        {...rest}
      />
    );
  };

  /* ── Lectures dérivées pour les corrections ── */
  const hits = guesses.filter((g) => g.pred === g.got).length;
  const done1 = snap3 !== null;

  const few = snap10 && (() => {
    const k = laggards(snap10.counts)[0];
    return { t: totalOf(snap10.counts), k, c: snap10.counts[k - 1] };
  })();

  const hundred = snap100 && (() => {
    const top = leaders(snap100.counts)[0];
    return { top, c: snap100.counts[top - 1] };
  })();

  const run1 = runs[0] ?? null;
  const runStats = (s) => {
    const fr = frequencies(s.counts);
    const L = leaders(s.counts);
    return {
      leaders: L,
      leadPct: formatPct(fr[L[0] - 1], 1000),
      min: formatDec(pct(Math.min(...fr))),
      max: formatDec(pct(Math.max(...fr))),
      spread: spreadPoints(s.counts),
      pct6: formatPct(fr[5], 1000),
    };
  };
  const r1 = run1 && runStats(run1);

  const s10 = snap10 && spreadPoints(snap10.counts);
  const s100 = snap100 && spreadPoints(snap100.counts);
  const s1000 = run1 && spreadPoints(run1.counts);
  const monotone = s10 !== null && s100 !== null && s1000 !== null && s10 >= s100 && s100 >= s1000;

  const obs100 = snap100 ? formatPct(frequencies(snap100.counts)[5], 100) : '19,0 %';

  const loadedStats = snapLoaded && (() => {
    const fr = frequencies(snapLoaded.counts);
    const k = snapLoaded.loaded;
    const others = fr.filter((_, i) => i !== k - 1);
    return {
      k,
      kPct: formatPct(fr[k - 1], 1000),
      othersMin: formatDec(pct(Math.min(...others))),
      othersMax: formatDec(pct(Math.max(...others))),
    };
  })();

  const frac = (o) => <MathText>{o}</MathText>;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Lancer le dé"
      moduleSubtitle="Prédis, lance, relance : regarde le hasard se ranger en série."
      estimatedTime="12 min"
      brief={{
        tag: '🎲 Mission 01',
        title: 'Le 6 est-il plus difficile à obtenir ?',
        tone: 'indigo',
        body: (
          <p>
            Aux petits chevaux, il faut un 6 pour sortir un pion — et tout le monde jure que
            le 6 est la face la plus difficile. Vrai ? Tu as un dé : tu vas le tester.
          </p>
        ),
      }}
      intro={(kit) => { reactRef.current = kit.react; return null; }}
      steps={[
        {
          num: 1,
          title: 'Quelle face va sortir ?',
          subtitle: 'Choisis une face, puis lance. Trois fois.',
          done: done1,
          content: (
            <div className="space-y-3">
              <FaceChips value={predicted} onChange={setPredicted} label="Prédire la face" disabled={done1} />
              {lab(snap3, {
                predictedFace: predicted,
                controls: { single: predicted !== null && !done1 },
                onThrow: throwGuess,
                caption: 'Tes premiers lancers',
              })}
              {predicted === null && !done1 && (
                <Feedback tone="info">Commence par annoncer une face : c’est ta prédiction.</Feedback>
              )}
              {guesses.length > 0 && !done1 && (
                <Feedback tone="info">
                  Tu avais dit <strong>{guesses[guesses.length - 1].pred}</strong>, le dé a donné{' '}
                  <strong>{guesses[guesses.length - 1].got}</strong>
                  {guesses[guesses.length - 1].pred === guesses[guesses.length - 1].got ? ' — deviné !' : '.'}{' '}
                  Encore {GUESSES_NEEDED - guesses.length} lancer{GUESSES_NEEDED - guesses.length > 1 ? 's' : ''}.
                </Feedback>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="experience-aleatoire"
                  variant="new"
                  lead={(
                    <>
                      Sur {GUESSES_NEEDED} lancers, tu as deviné <strong>{hits} fois</strong>.
                      {hits >= 2 ? ' Bien joué — mais aurais-tu pu en être sûr ? Non.' : ''}{' '}
                      Ce que tu viens de faire porte un nom.
                    </>
                  )}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Dix lancers',
          subtitle: 'Continue jusqu’à 10 lancers au moins. Regarde les barres.',
          done: fewDone,
          content: (
            <div className="space-y-3">
              {lab(snap10, {
                controls: { single: !snap10, ten: !snap10 },
                onThrow: throwLive,
                caption: snap10 ? `Ta série après ${formatDec(totalOf(snap10.counts))} lancers` : 'La série continue',
              })}
              {!snap10 && (
                <Feedback tone="info">
                  <strong>{formatDec(totalOf(counts))}</strong> lancer{totalOf(counts) > 1 ? 's' : ''} pour l’instant —
                  encore {Math.max(0, 10 - totalOf(counts))} pour atteindre 10.
                </Feedback>
              )}
              {few && (
                <KnowledgeBrick
                  id="serie-statistique"
                  variant="new"
                  lead={(
                    <>
                      Tes {formatDec(few.t)} lancers ne sont plus un tas de résultats : ils se
                      rangent en six barres. Ce dessin a un nom, et ses deux nombres aussi.
                    </>
                  )}
                />
              )}
              {few && (
                <TapQuestion
                  prompt={`Après ${formatDec(few.t)} lancers, la face ${few.k} ${few.c === 0 ? 'n’est jamais sortie' : `n’est sortie que ${few.c} fois`}. Que peut-on en conclure ?`}
                  requires={['serie-statistique', 'experience-aleatoire']}
                  options={[
                    `Le dé désavantage la face ${few.k}`,
                    `La face ${few.k} va sortir plus souvent ensuite, pour rattraper son retard`,
                    `Rien de sûr : ${formatDec(few.t)} lancers, c’est trop peu pour juger`,
                  ]}
                  correct={2}
                  cols={1}
                  explain={
                    <>
                      Avec si peu de lancers, les écarts entre effectifs sont énormes et changent
                      d’une série à l’autre : ni « dé truqué » ni « rattrapage » ne se lisent sur{' '}
                      {formatDec(few.t)} lancers. Pour juger, il en faut beaucoup plus — c’est l’étape
                      suivante. Vérifie au passage que tes six effectifs additionnés redonnent bien
                      le total : {formatDec(few.t)}.
                    </>
                  }
                  solved={fewDone}
                  onAnswered={() => setFewDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Est-ce beaucoup ?',
          subtitle: 'Une série neuve de 100 lancers.',
          done: freqDone,
          content: (
            <div className="space-y-3">
              {lab(snap100, {
                controls: { series: snap100 ? 0 : 100 },
                onSeries: series100,
                caption: snap100 ? 'Ta série de 100 lancers' : 'Série de 100 lancers',
              })}
              {!snap100 && (
                <Feedback tone="info">Repars de zéro : lance une série de 100 d’un coup et observe les six effectifs.</Feedback>
              )}
              {hundred && (
                <KnowledgeBrick
                  id="frequence"
                  variant="new"
                  lead={(
                    <>
                      La face {hundred.top} a pour effectif <strong>{hundred.c}</strong> sur 100 lancers.
                      Pour dire si c’est beaucoup, il faut rapporter cet effectif au total.
                    </>
                  )}
                >
                  <NumericQuestion
                    prompt={`Exprime en pourcentage la fréquence de la face ${hundred.top} sur ces 100 lancers.`}
                    suffix="%"
                    expected={hundred.c}
                    parse={parseDec}
                    display={`${hundred.c} %`}
                    requires={['frequence', 'serie-statistique', 'pourcentage']}
                    explain={
                      <>
                        {hundred.c} sur 100, c’est {hundred.c}/100 = <strong>{hundred.c} %</strong>. Les six
                        fréquences apparaissent maintenant sous le graphique : c’est avec elles qu’on pourra
                        comparer une série de 10 lancers à une série de 1 000.
                      </>
                    }
                    explainFor={(n) => {
                      if (n === hundred.c / 100) return `Tu as calculé ${hundred.c}/100 = ${formatDec(n)} : c’est la fréquence en écriture décimale. En pourcentage, c’est ${hundred.c} %.`;
                      if (n === 100 - hundred.c) return `Tu as compté les lancers où le ${hundred.top} n’est PAS sorti. Sa fréquence, c’est ${hundred.c} sur 100 = ${hundred.c} %.`;
                      if (n === 6) return `6 est le nombre de faces, pas la part de la face ${hundred.top}. Sa fréquence : ${hundred.c} sur 100 = ${hundred.c} %.`;
                      return null;
                    }}
                    solved={freqDone}
                    onAnswered={() => setFreqDone(true)}
                  />
                </KnowledgeBrick>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Parie, puis lance 1 000 fois',
          subtitle: 'Quelle face sera la plus fréquente ?',
          done: leadDone,
          content: (
            <div className="space-y-3">
              <FaceChips value={pred1000} onChange={setPred1000} label="Parier sur la face" disabled={runs.length > 0} />
              {pred1000 === null && (
                <Feedback tone="info">À ton avis, après 1 000 lancers, quelle face sera en tête ? Parie d’abord.</Feedback>
              )}
              {pred1000 !== null && lab(runs.length >= RUNS_NEEDED ? runs[runs.length - 1] : null, {
                predictedFace: pred1000,
                controls: { series: runs.length < RUNS_NEEDED ? 1000 : 0 },
                onSeries: series1000,
                caption: runs.length === 0 ? 'Série de 1 000 lancers' : `Série ${runs.length} de 1 000 lancers`,
              })}
              {r1 && (
                <Feedback tone="info">
                  Série 1 — en tête : <strong>face {faceList(r1.leaders)}</strong> ({r1.leadPct}).
                  Tu avais parié sur {pred1000} :{' '}
                  {r1.leaders.includes(pred1000) ? <strong>gagné !</strong> : <strong>raté.</strong>}{' '}
                  Mais regarde l’écart : toutes les faces sont entre {r1.min} % et {r1.max} %.
                  {runs.length < RUNS_NEEDED && (
                    <> Est-ce qu’une face reste <em>toujours</em> en tête ? Relance une série de 1 000 pour voir.</>
                  )}
                </Feedback>
              )}
              {runs.length > 1 && (
                <ul className="text-xs font-mono text-slate-600 space-y-0.5" aria-label="Face en tête de chaque série">
                  {runs.map((s, i) => {
                    const st = runStats(s);
                    return (
                      <li key={i}>
                        Série {i + 1} : face <strong>{faceList(st.leaders)}</strong> en tête ({st.leadPct}) ·
                        écart {formatDec(st.spread)} pts
                      </li>
                    );
                  })}
                </ul>
              )}
              {runs.length >= RUNS_NEEDED && (
                <TapQuestion
                  prompt={`Sur tes ${runs.length} séries de 1 000 lancers, que remarques-tu ?`}
                  requires={['frequence', 'serie-statistique']}
                  options={[
                    'Une face domine nettement les autres à chaque série',
                    'Aucune face ne domine vraiment : toutes restent proches de la même fréquence',
                    'Le 6 sort toujours moins que les autres faces',
                  ]}
                  correct={1}
                  cols={1}
                  explain={
                    <>
                      Faces en tête : {runs.map((s) => faceList(runStats(s).leaders)).join(', ')}. Écarts entre la plus
                      et la moins fréquente : {runs.map((s) => formatDec(runStats(s).spread)).join(' ; ')} points. Sur
                      1 000 lancers, la face « la plus fréquente » l’est de peu, et par hasard — ce n’est pas une
                      propriété du dé.
                    </>
                  }
                  solved={leadDone}
                  onAnswered={() => setLeadDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: '10, 100, 1 000',
          subtitle: 'Tes trois séries côte à côte, en fréquences.',
          done: stabDone,
          content: (
            <div className="space-y-3">
              <FrequencyStrip
                series={[
                  snap10 && { label: '10', counts: snap10.counts },
                  snap100 && { label: '100', counts: snap100.counts },
                  run1 && { label: '1000', counts: run1.counts },
                ]}
              />
              {(!snap10 || !snap100 || !run1) && (
                <Feedback tone="info">Refais les séries des étapes 2, 3 et 4 pour comparer tes propres lancers.</Feedback>
              )}
              <TapQuestion
                prompt="Quand le nombre de lancers augmente, les fréquences des six faces…"
                requires={['frequence']}
                options={[
                  'deviennent exactement égales : 16,7 % chacune',
                  'se rapprochent les unes des autres, sans devenir exactement égales',
                  's’éloignent de plus en plus les unes des autres',
                ]}
                correct={1}
                cols={1}
                explain={
                  <>
                    {s10 !== null && s100 !== null && s1000 !== null ? (
                      <>
                        Écart entre la face la plus fréquente et la moins fréquente : <strong>{formatDec(s10)} points</strong> sur{' '}
                        {formatDec(totalOf(snap10.counts))} lancers, <strong>{formatDec(s100)}</strong> sur 100,{' '}
                        <strong>{formatDec(s1000)}</strong> sur 1 000.{' '}
                        {!monotone && 'Sur 100 lancers, le hasard peut encore donner un écart aussi grand qu’avec 10 — c’est à 1 000 que le resserrement se voit nettement. '}
                      </>
                    ) : null}
                    Les fréquences se <strong>stabilisent</strong> autour d’une valeur commune quand on lance beaucoup — sans
                    jamais être obligées d’être exactement égales.
                  </>
                }
                solved={stabDone}
                onAnswered={() => setStabDone(true)}
              />
              {stabDone && (
                <KnowledgeBrick
                  id="stabilisation"
                  variant="new"
                  lead="Tes trois séries viennent de le montrer : ce resserrement porte un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 6,
          title: 'Retour au jeu',
          subtitle: 'Que réponds-tu aux joueurs ?',
          done: gameA && gameB,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Un joueur attend un 6 pour sortir son pion et se plaint : « le 6 est plus difficile à obtenir ». Que montrent tes lancers ?"
                requires={['frequence', 'stabilisation']}
                above={r1 && (
                  <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 flex items-center gap-3">
                    <DieIcon face={6} size={32} />
                    <span>Sur ta première série de 1 000 lancers, le 6 est sorti à <strong>{r1.pct6}</strong> ; les six faces vont de {r1.min} % à {r1.max} %.</span>
                  </div>
                )}
                options={[
                  'Vrai : le 6 est sorti moins souvent que les autres',
                  'Faux : sur 1 000 lancers, le 6 sort à peu près aussi souvent que chaque autre face',
                  'Ça dépend de la façon de lancer le dé',
                ]}
                correct={1}
                cols={1}
                explain={
                  <>
                    Le 6 n’est pas une face à part : sur beaucoup de lancers, sa fréquence est du même ordre que celle
                    des autres. Ce qui rend le 6 « difficile » au jeu, c’est qu’on <em>l’attend</em> — pas le dé.
                  </>
                }
                solved={gameA}
                onAnswered={() => setGameA(true)}
              />
              {gameA && (
                <TapQuestion
                  prompt="Un autre joueur affirme : « Le 6 vient de sortir trois fois de suite, il est plus probable que les autres maintenant. » Que lui réponds-tu ?"
                  requires={['experience-aleatoire', 'stabilisation']}
                  options={[
                    'Il a raison : trois 6 de suite prouvent que le dé favorise le 6',
                    'Trois lancers ne prouvent rien : sur 1 000 lancers, le 6 sort comme les autres',
                    'Au contraire : après trois 6, le 6 est devenu moins probable',
                  ]}
                  correct={1}
                  cols={1}
                  explain={
                    <>
                      Trois 6 de suite, c’est rare mais ça arrive : environ une série de trois lancers sur 216. Le
                      dé n’a pas de mémoire : chaque lancer repart de zéro. Tu l’as vu à l’étape 2 — sur quelques
                      lancers, n’importe quelle face peut prendre de l’avance, et cette avance ne dure pas.
                    </>
                  }
                  solved={gameB}
                  onAnswered={() => setGameB(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 7,
          title: 'Une face sur six',
          subtitle: 'Le nombre que tes barres cherchaient.',
          done: probDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Si le dé est équilibré, chaque face a exactement la même chance. Quelle part du total revient alors à chaque face ?"
              requires={['frequence', 'serie-statistique']}
              options={['$\\frac{1}{6}$', '$\\frac{1}{2}$', '$\\frac{6}{100}$', '$\\frac{1}{1000}$']}
              renderOption={frac}
              correctionLabel="1/6"
              correct={0}
              cols={2}
              above={(revealed) => (revealed && run1 ? (
                <div className="space-y-2">
                  {lab(run1, { theory: true, caption: 'Ta série de 1 000 lancers, avec le repère 1/6' })}
                </div>
              ) : null)}
              explain={
                <>
                  1 face favorable sur 6 faces possibles : <strong>1/6 ≈ 16,7 %</strong>. Regarde le repère
                  apparu sur ta série de 1 000 lancers : les six barres le serrent toutes. Tes fréquences
                  tournaient autour de ce nombre-là.
                </>
              }
              solved={probDone}
              onAnswered={() => setProbDone(true)}
            />
            {probDone && (
              <KnowledgeBrick
                id="probabilite"
                variant="new"
                lead="Ce nombre 1/6, que tes barres cherchaient sans jamais l’atteindre exactement, porte un nom."
              />
            )}
            </div>
          ),
        },
        {
          num: 8,
          title: 'Fréquence ou probabilité ?',
          subtitle: 'Deux nombres proches, deux natures différentes.',
          done: contrastDone,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Pourquoi ces deux nombres ne sont-ils pas identiques ?"
              requires={['frequence', 'probabilite']}
              above={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2">
                    <p className="text-xs font-mono uppercase tracking-wide text-indigo-700">Dans ton expérience (100 lancers)</p>
                    <p className="text-lg font-space font-bold text-slate-800">Face 6 → {obs100}</p>
                    {!snap100 && <p className="text-xs text-slate-500">(exemple — refais la série de l’étape 3 pour tes propres nombres)</p>}
                  </div>
                  <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2">
                    <p className="text-xs font-mono uppercase tracking-wide text-amber-700">Dans le modèle (dé équilibré)</p>
                    <p className="text-lg font-space font-bold text-slate-800">P(6) = 1/6 ≈ 16,7 %</p>
                  </div>
                </div>
              }
              options={[
                'La fréquence vient de l’expérience et varie d’une série à l’autre ; la probabilité vient du modèle et ne change pas',
                'Le dé a été mal lancé pendant l’expérience',
                `La probabilité est fausse : la vraie valeur est ${obs100}`,
                'Ils devraient être identiques : il y a une erreur de calcul',
              ]}
              correct={0}
              cols={1}
              explain={
                <>
                  Plus on lance, plus la fréquence se rapproche de 16,7 % — sans jamais être obligée de
                  l’atteindre exactement. C’est ce que tes trois séries de 1 000 lancers ont montré.
                </>
              }
              solved={contrastDone}
              onAnswered={() => setContrastDone(true)}
            />
            {contrastDone && (
              <KnowledgeBrick
                id="mem-frequence-vs-probabilite"
                variant="new"
                lead="Deux nombres proches, deux natures différentes — à ne plus jamais confondre."
              />
            )}
            </div>
          ),
        },
        {
          num: 9,
          title: 'Et si le dé était truqué ?',
          subtitle: 'Alourdis une face, puis lance 1 000 fois.',
          done: loadedDone,
          content: (
            <div className="space-y-3">
              <FaceChips value={snapLoaded ? snapLoaded.loaded : loadedFace} onChange={setLoadedFace}
                label="Alourdir la face" tone="amber" disabled={snapLoaded !== null} />
              {loadedFace === null && !snapLoaded && (
                <Feedback tone="info">Choisis la face à alourdir : elle pèsera trois fois plus que chacune des autres.</Feedback>
              )}
              {(loadedFace !== null || snapLoaded) && lab(snapLoaded, {
                theory: probDone,
                controls: { series: snapLoaded ? 0 : 1000 },
                onSeries: seriesLoaded,
                caption: snapLoaded ? 'Ta série de 1 000 lancers, dé truqué' : 'Série de 1 000 lancers, dé truqué',
              })}
              {loadedStats && (
                <TapQuestion
                  prompt={`Avec ce dé truqué, la probabilité d’obtenir ${loadedStats.k} est-elle encore 1/6 ?`}
                  requires={['probabilite', 'frequence']}
                  options={[
                    'Oui : 1/6 est vrai pour tous les dés à six faces',
                    'Non : 1/6 suppose que les six faces ont la même chance, ce qui n’est plus le cas',
                    'Oui, il suffit de lancer plus longtemps pour retrouver 16,7 %',
                  ]}
                  correct={1}
                  cols={1}
                  explain={
                    <>
                      Sur 1 000 lancers, la face {loadedStats.k} est sortie à <strong>{loadedStats.kPct}</strong>, les autres
                      entre {loadedStats.othersMin} % et {loadedStats.othersMax} %. « Chaque face a une chance sur six »
                      n’est vrai que pour un dé <strong>équilibré</strong>. Modèle de ce dé truqué :
                      P({loadedStats.k}) = 3/8 = 37,5 %, et 1/8 = 12,5 % pour chacune des autres — les repères
                      pointillés ne sont plus alignés.
                    </>
                  }
                  solved={loadedDone}
                  onAnswered={() => setLoadedDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 10,
          title: 'Défi final',
          subtitle: 'Sans lancer, cette fois.',
          done: finalA && finalB,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Tu lances un dé équilibré. Quelle est la probabilité d’obtenir un 4 ?"
                requires={['probabilite']}
                options={['$\\frac{1}{6}$', '$\\frac{1}{4}$', '$\\frac{4}{6}$', '$\\frac{1}{2}$']}
                renderOption={frac}
                correctionLabel="1/6"
                correct={0}
                cols={2}
                explain="1 face favorable (le 4) sur 6 faces possibles : P(4) = 1/6 ≈ 16,7 %. Le numéro écrit sur la face ne change rien à sa chance."
                solved={finalA}
                onAnswered={() => setFinalA(true)}
              />
              {finalA && (
                <TapQuestion
                  prompt="Après 100 lancers, tu obtiens 22 fois le 4. Que peut-on dire ?"
                  requires={['mem-frequence-vs-probabilite', 'frequence', 'probabilite']}
                  options={[
                    'La probabilité d’obtenir 4 est 22 %',
                    '22 % est la fréquence observée ; la probabilité reste 1/6 ≈ 16,7 %',
                    'Le dé est forcément truqué',
                    'Après 1 000 lancers, la fréquence sera exactement 16,7 %',
                  ]}
                  correct={1}
                  cols={1}
                  explain={
                    <>
                      22 sur 100 = 22 % : c’est une <strong>fréquence</strong>, le résultat d’une expérience. La{' '}
                      <strong>probabilité</strong>, 1/6, vient du modèle du dé équilibré. Avec 100 lancers, un écart
                      de 5 points est ordinaire ; avec 1 000, il serait surprenant — sans être impossible.
                    </>
                  }
                  solved={finalB}
                  onAnswered={() => setFinalB(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <div className="space-y-4">
          <KnowledgeSnapshot moduleNumber={1}>
            Tu sais lire une série et ses effectifs. Dans la suite de la leçon, d’autres séries —
            des temps de trajet — et des façons de les <strong>résumer en un seul nombre</strong>.
            La probabilité, elle, t’attend dans la leçon Probabilités.
          </KnowledgeSnapshot>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700">Labo libre — tout est permis.</p>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setLoadedFace(null)} aria-pressed={loadedFace === null}
                className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-blue-500
                  ${loadedFace === null ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
                style={{ touchAction: 'manipulation' }}>
                Dé équilibré
              </button>
              <FaceChips value={loadedFace} onChange={setLoadedFace} label="Alourdir la face" tone="amber" />
            </div>
            {lab(null, {
              theory: true,
              controls: { single: true, ten: true, hundred: true, thousand: true, reset: true },
              onThrow: throwFree,
              onSeries: seriesFree,
              onReset: resetFree,
              caption: 'Labo libre',
            })}
          </div>
        </div>
      }
    />
  );
}
