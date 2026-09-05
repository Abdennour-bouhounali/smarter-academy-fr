import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DiceLab, { FaceChips, DieIcon, PredictionChips, theoryFor } from '../components/DiceLab';
import FrequencyStrip from '../components/FrequencyStrip';
import { makeRng, parseDec, formatDec } from '@smarter-academy/core';
import {
  ZERO, ROLL_MS, fairWeights, loadedWeights, rollMany, afterStreak, totalOf, frequencies, pct,
  formatPct, leaders, laggards, spreadPoints, faceList, sessionSeed, appendTail,
} from '../components/probaUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Le laboratoire du dé » (manipulation signature).
 *
 * Activity: prédire une face, lancer le dé 1, 10, 100, 1 000 fois ; lancer
 *   l'expérience « après trois 6 de suite » ; alourdir une face.
 * Mathematical objective: faire ÉPROUVER, dans cet ordre, que UN lancer est
 *   imprévisible (expérience aléatoire, issues), que les fréquences observées
 *   se resserrent quand le nombre de lancers grandit (stabilisation), que le
 *   lancer suivant trois 6 est un lancer comme les autres, et que le nombre
 *   vers lequel les fréquences tendent — 1/6 — vient du MODÈLE du dé
 *   équilibré : c'est la probabilité.
 * Student action: toucher une face (prédiction), « Lancer », « ×10 »,
 *   séries de 100 et 1 000, l'expérience programmée, la face à alourdir.
 * Controlled variable: le nombre de lancers ; puis les poids du dé.
 * Mathematical state: { counts[6] } — six effectifs, la seule vérité. Total,
 *   fréquences, face en tête, écart, repère 1/6 en sont dérivés (probaUtils).
 *   Les séries passées sont FIGÉES en instantanés pour être comparées.
 * Visual consequence: le dé roule puis se pose ; la barre de la face obtenue
 *   grandit ; sur 1 000 lancers, six barres presque de même hauteur ; après
 *   300 « trois 6 de suite », six barres presque égales aussi.
 * Expected observation: « je ne peux pas prévoir UN lancer, mais je sais à
 *   peu près ce que donnent 1 000 lancers » et « le dé n'a pas de mémoire ».
 * Misconception targeted: « le 6 est plus dur » ; « après trois 6, le 6 est
 *   plus probable » (ou moins) ; « les fréquences deviennent exactement
 *   égales » ; « fréquence = probabilité ».
 * Feedback: chaque correction cite LES nombres de l'élève (ses effectifs, ses
 *   écarts, sa face en tête, sa prédiction) — jamais des valeurs inventées.
 * Formalization: « expérience aléatoire », « issues » à l'étape 1 (après le
 *   geste) ; « fréquence » à l'étape 3 ; « probabilité » et 1/6 à l'étape 7 ;
 *   « événement » et P = favorables ÷ possibles sont laissés aux modules 2–3.
 * Scaffolding: un bouton (Lancer) → ×10 → séries → pari → expérience
 *   programmée → dé truqué → labo libre.
 * Transfer: le dé truqué ; les modules suivants (événement, sac, deux dés).
 *
 * LE HASARD EST INJECTÉ, PAS TIRÉ AU HASARD DANS LE RENDU : le générateur est
 * semé une fois par session (`sessionSeed` — un littéral mêlé à l'horloge, ou
 * une graine fixée par un test), si bien que le premier lancer change d'une
 * visite à l'autre. La face est TIRÉE au moment du clic, mais RÉVÉLÉE après
 * le roulement du dé — le nombre n'apparaît jamais avant que le dé se pose
 * (settle-then-number).
 */

const SEED = 20260905;
const GUESSES_NEEDED = 3;
const RUNS_NEEDED = 3;
const STREAK_FACE = 6;
const STREAK_LEN = 3;
const STREAK_TRIALS = 300;

const MEMORY_OPTIONS = [
  { id: 'plus', label: 'Le 6 est maintenant PLUS probable' },
  { id: 'moins', label: 'Le 6 est maintenant MOINS probable' },
  { id: 'pareil', label: 'Rien ne change : 1 chance sur 6, comme toujours' },
];

const snapshotOf = (r, loaded = null, recent = []) => ({ counts: r.counts, last: r.last, loaded, recent });

export default function Module01LaboratoireDuDe() {
  const reduce = useReducedMotion();

  /* ── L'état mathématique vivant ── */
  const [counts, setCounts] = useState(ZERO);
  const [last, setLast] = useState(null);
  const [recent, setRecent] = useState([]);
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
  const [memoryPred, setMemoryPred] = useState(null);
  const [snapStreak, setSnapStreak] = useState(null);
  const [snapLoaded, setSnapLoaded] = useState(null);

  /* ── Les réponses ── */
  const [fewDone, setFewDone] = useState(false);
  const [freqDone, setFreqDone] = useState(false);
  const [leadDone, setLeadDone] = useState(false);
  const [stabDone, setStabDone] = useState(false);
  const [memoryDone, setMemoryDone] = useState(false);
  const [probDone, setProbDone] = useState(false);
  const [contrastDone, setContrastDone] = useState(false);
  const [loadedDone, setLoadedDone] = useState(false);

  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = makeRng(sessionSeed(SEED));
  const countsRef = useRef(ZERO);
  const recentRef = useRef([]);
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
      recentRef.current = result.fresh ? (result.tail ?? []) : appendTail(recentRef.current, result.tail ?? []);
      setCounts(result.counts);
      setLast(result.last);
      setRecent(recentRef.current);
      setRolling(false);
      reactRef.current?.(true);
      after?.({ ...result, recent: recentRef.current });
    };
    if (reduce) { finish(); return; }
    setRolling(true);
    timer.current = setTimeout(finish, ROLL_MS);
  };
  const rng = () => rngRef.current;

  const throwGuess = () => {
    const p = predicted;
    launch(() => rollMany(countsRef.current, 1, rng(), fairWeights()), (r) => {
      const next = [...guessesRef.current, { pred: p, got: r.last }];
      guessesRef.current = next;
      setGuesses(next);
      if (next.length === GUESSES_NEEDED) setSnap3(snapshotOf(r, null, r.recent));
    });
  };
  const throwLive = (n) => {
    launch(() => rollMany(countsRef.current, n, rng(), fairWeights()), (r) => {
      if (!snap10Ref.current && totalOf(r.counts) >= 10) {
        const s = snapshotOf(r, null, r.recent);
        snap10Ref.current = s;
        setSnap10(s);
      }
    });
  };
  const series100 = () => launch(() => ({ ...rollMany(ZERO, 100, rng(), fairWeights()), fresh: true }), (r) => setSnap100(snapshotOf(r, null, r.recent)));
  const series1000 = () => launch(() => ({ ...rollMany(ZERO, 1000, rng(), fairWeights()), fresh: true }), (r) => {
    const s = snapshotOf(r, null, r.recent);
    setRuns((rs) => [...rs, s]);
  });
  /* L'expérience de la mémoire : 300 fois « trois 6 de suite, puis on note le suivant ». */
  const runStreak = () => launch(() => {
    const r = afterStreak(rng(), STREAK_FACE, STREAK_LEN, STREAK_TRIALS);
    return { counts: r.counts, last: null, rolls: r.rolls, tail: [], fresh: true };
  }, (r) => setSnapStreak({ counts: r.counts, last: null, loaded: null, rolls: r.rolls, recent: [] }));
  const seriesLoaded = () => {
    const face = loadedFace;
    launch(() => ({ ...rollMany(ZERO, 1000, rng(), loadedWeights(face)), fresh: true }), (r) => setSnapLoaded(snapshotOf(r, face, r.recent)));
  };
  const throwFree = (n) => launch(() => rollMany(countsRef.current, n, rng(), loadedWeights(loadedFace)));
  const seriesFree = (n) => launch(() => ({ ...rollMany(ZERO, n, rng(), loadedWeights(loadedFace)), fresh: true }));
  const resetFree = () => { countsRef.current = ZERO; recentRef.current = []; setCounts(ZERO); setLast(null); setRecent([]); };

  /** Une vue du laboratoire : vivante, ou figée sur un instantané. */
  const lab = (snapshot, opts = {}) => {
    const { theory = false, ...rest } = opts;
    const loaded = snapshot ? snapshot.loaded : loadedFace;
    return (
      <DiceLab
        counts={snapshot ? snapshot.counts : counts}
        lastFace={snapshot ? snapshot.last : last}
        recent={snapshot ? snapshot.recent : recent}
        rolling={!snapshot && rolling}
        frozen={!!snapshot}
        loadedFace={loaded}
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

  const streakStats = snapStreak && (() => {
    const fr = frequencies(snapStreak.counts);
    return {
      six: formatPct(fr[5], STREAK_TRIALS),
      min: formatDec(pct(Math.min(...fr))),
      max: formatDec(pct(Math.max(...fr))),
      rolls: snapStreak.rolls,
    };
  })();
  const memoryLabel = MEMORY_OPTIONS.find((o) => o.id === memoryPred)?.label ?? '';

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
      moduleTitle="Le laboratoire du dé"
      moduleSubtitle="Prédis, lance, relance mille fois : que cache le hasard ?"
      estimatedTime="12 min"
      brief={{
        tag: '🎲 Mission 01',
        title: 'Peux-tu prévoir le dé ?',
        tone: 'indigo',
        body: (
          <p>
            Dans le jeu, tu lances un dé pour savoir de combien de cases avancer — et il te faut
            un 6 pour passer le pont. Avant de lancer, dis quelle face va sortir. Puis lance.
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
              {guesses.length > 0 && (
                <Feedback tone={done1 ? 'ok' : 'info'}>
                  {done1 ? (
                    <>
                      Sur {GUESSES_NEEDED} lancers, tu as deviné <strong>{hits} fois</strong>.
                      {hits >= 2 ? ' Bien joué — mais aurais-tu pu en être sûr ? Non.' : ''}{' '}
                      Tu connais toutes les <strong>issues</strong> possibles (1, 2, 3, 4, 5, 6), mais personne ne
                      peut prévoir laquelle va sortir : c’est une <strong>expérience aléatoire</strong>.
                    </>
                  ) : (
                    <>
                      Tu avais dit <strong>{guesses[guesses.length - 1].pred}</strong>, le dé a donné{' '}
                      <strong>{guesses[guesses.length - 1].got}</strong>
                      {guesses[guesses.length - 1].pred === guesses[guesses.length - 1].got ? ' — deviné !' : '.'}{' '}
                      Encore {GUESSES_NEEDED - guesses.length} lancer{GUESSES_NEEDED - guesses.length > 1 ? 's' : ''}.
                    </>
                  )}
                </Feedback>
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
                <TapQuestion
                  prompt={`Après ${formatDec(few.t)} lancers, la face ${few.k} ${few.c === 0 ? 'n’est jamais sortie' : `n’est sortie que ${few.c} fois`}. Que peut-on en conclure ?`}
                  options={[
                    `Le dé désavantage la face ${few.k}`,
                    `La face ${few.k} va sortir plus souvent ensuite, pour rattraper son retard`,
                    `Rien de sûr : ${formatDec(few.t)} lancers, c’est trop peu pour juger`,
                  ]}
                  correct={2}
                  cols={1}
                  explain={
                    <>
                      Avec si peu de lancers, les écarts entre faces sont énormes et changent d’une série à
                      l’autre : ni « dé truqué » ni « rattrapage » ne se lisent sur {formatDec(few.t)} lancers.
                      Chaque hauteur de barre est un <strong>effectif</strong> — le nombre de lancers qui ont
                      donné cette face. Pour juger, il en faut beaucoup plus : c’est l’étape suivante.
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
          title: 'Cent lancers',
          subtitle: 'Une série neuve de 100 lancers, d’un coup.',
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
                <NumericQuestion
                  prompt={`Sur 100 lancers, la face ${hundred.top} est sortie ${hundred.c} fois. Quelle part de tes lancers cela représente-t-il, en pourcentage ?`}
                  suffix="%"
                  expected={hundred.c}
                  parse={parseDec}
                  display={`${hundred.c} %`}
                  explain={
                    <>
                      {hundred.c} sur 100, c’est {hundred.c}/100 = <strong>{hundred.c} %</strong>. Cette part s’appelle la{' '}
                      <strong>fréquence observée</strong> de la face {hundred.top} : effectif ÷ nombre total de lancers.
                      Les six fréquences apparaissent maintenant sous le graphique.
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
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Mille lancers',
          subtitle: 'Parie sur la face qui sera en tête, puis lance 1 000 fois. Trois séries.',
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
                      1 000 lancers, la face « en tête » l’est de peu, et par hasard — ce n’est pas une propriété du dé.
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
              <TapQuestion
                prompt="Quand le nombre de lancers augmente, les fréquences des six faces…"
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
            </div>
          ),
        },
        {
          num: 6,
          title: 'Le dé a-t-il une mémoire ?',
          subtitle: 'Le 6 vient de sortir trois fois de suite. Prédis, puis fais l’expérience.',
          done: memoryDone,
          content: (
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center" aria-hidden="true">
                <DieIcon face={6} size={40} tone="indigo" /><DieIcon face={6} size={40} tone="indigo" /><DieIcon face={6} size={40} tone="indigo" />
                <span className="text-2xl font-bold text-slate-400">→ ?</span>
              </div>
              <PredictionChips options={MEMORY_OPTIONS} value={memoryPred} onChange={setMemoryPred}
                label="Après trois 6 de suite, le lancer suivant" disabled={snapStreak !== null} />
              {memoryPred === null && (
                <Feedback tone="info">Engage-toi d’abord : c’est l’expérience qui répondra, pas nous.</Feedback>
              )}
              {memoryPred !== null && lab(snapStreak, {
                hideDie: !snapStreak,
                predictedFace: 6,
                controls: { experiment: snapStreak ? null : `Faire l’expérience : ${STREAK_TRIALS} fois « trois 6, puis on note le suivant »` },
                onExperiment: runStreak,
                caption: snapStreak ? `Le lancer qui SUIT trois 6 de suite — ${STREAK_TRIALS} fois` : 'L’expérience de la mémoire',
              })}
              {memoryPred !== null && !snapStreak && (
                <Feedback tone="info">
                  La machine va lancer le dé jusqu’à obtenir trois 6 d’affilée, noter le lancer suivant, et recommencer{' '}
                  {STREAK_TRIALS} fois. Les barres montreront ce que donne ce « lancer d’après ».
                </Feedback>
              )}
              {streakStats && (
                <TapQuestion
                  prompt={`Il a fallu ${formatDec(streakStats.rolls)} lancers pour obtenir ${STREAK_TRIALS} fois trois 6 de suite. Le lancer suivant a donné un 6 à ${streakStats.six} — les six faces vont de ${streakStats.min} % à ${streakStats.max} %. Que montre l’expérience ?`}
                  options={[
                    'Après trois 6, le lancer suivant se répartit comme n’importe quel lancer : le dé n’a pas de mémoire',
                    'Le 6 est sorti plus souvent : le dé « continue sur sa lancée »',
                    'Le 6 est sorti moins souvent : le dé « compense »',
                  ]}
                  correct={0}
                  cols={1}
                  explain={
                    <>
                      Ta prédiction : « {memoryLabel} ». {memoryPred === 'pareil' ? 'Tu avais vu juste.' : 'L’expérience te contredit.'}{' '}
                      Le dé ne sait pas ce qu’il vient de faire : chaque lancer repart de zéro, avec les mêmes chances.
                      Trois 6 de suite, c’est rare (une fois sur 216 en moyenne — d’où les {formatDec(streakStats.rolls)} lancers
                      nécessaires), mais une fois arrivé, le lancer suivant est un lancer comme les autres.
                    </>
                  }
                  solved={memoryDone}
                  onAnswered={() => setMemoryDone(true)}
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
            <TapQuestion
              prompt="Si le dé est équilibré, chaque face a exactement la même chance. Quelle part revient alors à chaque face ?"
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
                  1 face favorable sur 6 faces possibles : <strong>1/6 ≈ 16,7 %</strong>. Ce nombre s’appelle la{' '}
                  <strong>probabilité</strong> d’obtenir cette face — on écrit P(6) = 1/6. Regarde le repère apparu
                  sur ta série de 1 000 lancers : les six barres le serrent toutes. Tes fréquences tournaient autour
                  de ce nombre-là.
                </>
              }
              solved={probDone}
              onAnswered={() => setProbDone(true)}
            />
          ),
        },
        {
          num: 8,
          title: 'Fréquence ou probabilité ?',
          subtitle: 'Deux nombres proches, deux natures différentes.',
          done: contrastDone,
          content: (
            <TapQuestion
              prompt="Pourquoi ces deux nombres ne sont-ils pas identiques ?"
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
                  <strong>Fréquence observée ≠ probabilité.</strong> La fréquence dit ce qui s’est passé ; la
                  probabilité dit ce qu’on attend d’un dé équilibré. Plus on lance, plus la fréquence se rapproche
                  de 16,7 % — sans jamais être obligée de l’atteindre exactement.
                </>
              }
              solved={contrastDone}
              onAnswered={() => setContrastDone(true)}
            />
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
                      n’est vrai que pour un dé <strong>équilibré</strong> : la probabilité dépend du <strong>modèle</strong>{' '}
                      de l’expérience. Modèle de ce dé truqué : P({loadedStats.k}) = 3/8 = 37,5 %, et 1/8 = 12,5 % pour chacune
                      des autres.
                    </>
                  }
                  solved={loadedDone}
                  onAnswered={() => setLoadedDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <div className="space-y-4">
          <Feedback tone="info">
            Un lancer est imprévisible ; mille lancers ne le sont presque plus. Le nombre que les fréquences
            cherchent, <strong>1/6</strong>, ne vient pas des lancers mais du <strong>modèle</strong> : un dé
            équilibré, six faces qui ont la même chance. Et « obtenir un nombre pair » — quelle part ? C’est
            la question du module suivant.
          </Feedback>
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
