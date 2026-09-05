import React, { useState, useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoDiceLab from '../components/TwoDiceLab';
import OutcomeGrid from '../components/OutcomeGrid';
import { makeRng, formatDec } from '@smarter-academy/core';
import {
  ZERO_SUMS, SUMS, ROLL_MS, rollTwoMany, sumCells, sumProbabilities, cellsWhere, cellKey, leaders,
  frequencies, formatPct, totalOf, fracLatex,
  sessionSeed,
} from '../components/probaUtils';

/**
 * Module 4 — MANIPULATION : « Deux dés ».
 *
 * Activity: parier sur une somme, lancer deux dés 1 000 fois, puis cocher
 *   dans la grille 6 × 6 les cases qui donnent 7, puis « au moins 10 ».
 * Mathematical objective: une expérience à DEUX épreuves a 36 issues
 *   équiprobables (les couples), pas 11 (les sommes) ; la probabilité d'une
 *   somme est son nombre de cases sur 36 — et c'est ce que les barres de
 *   1 000 lancers montraient déjà.
 * Student action: chips de somme ; lancer ; cocher des cases ; vérifier.
 * Controlled variable: le nombre de lancers ; l'ensemble des cases cochées.
 * Mathematical state: `counts[11]` (index = somme − 2) ; `cells` (Set de
 *   clés « a-b ») ; tout le reste dérivé (sumCells, sumProbabilities).
 * Visual consequence: une bosse sur 7 ; les cases cochées en indigo ; à la
 *   révélation, les cases attendues en vert.
 * Expected observation: « 7 gagne parce qu'il y a 6 façons de le faire ».
 * Misconception targeted: « 11 sommes ⇒ chacune 1/11 » ; « 6+1 et 1+6, c'est
 *   la même case ».
 * Feedback: cases manquantes / en trop comptées ; révélation après 3 essais.
 * Formalization: P(somme 7) = 6/36 = 1/6, après la grille.
 * Scaffolding: pari → observation → grille guidée → grille libre → sans grille.
 */

const SEED = 20260905 + 4;
const MAX_ATTEMPTS = 3;
const TARGET7 = new Set(sumCells(7).map(([a, b]) => cellKey(a, b)));
const TARGET10 = new Set(cellsWhere((a, b) => a + b >= 10).map(([a, b]) => cellKey(a, b)));
const THEORY = sumProbabilities();

function useGridTask(target) {
  const [cells, setCells] = useState(() => new Set());
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState(null);
  const toggle = (a, b) => {
    if (done) return;
    const k = cellKey(a, b);
    setCells((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
    setMsg(null);
  };
  const check = (react) => {
    if (done) return;
    const missing = [...target].filter((k) => !cells.has(k)).length;
    const extra = [...cells].filter((k) => !target.has(k)).length;
    const ok = missing === 0 && extra === 0;
    const n = attempts + 1;
    react?.(ok);
    if (ok) { setDone(true); setMsg({ tone: 'ok' }); return; }
    if (n >= MAX_ATTEMPTS) { setCells(new Set(target)); setDone(true); setMsg({ tone: 'info', revealed: true, missing, extra }); return; }
    setAttempts(n);
    setMsg({ tone: 'ko', missing, extra, left: MAX_ATTEMPTS - n });
  };
  return { cells, toggle, check, done, msg };
}

export default function Module04DeuxDes() {
  const reduce = useReducedMotion();
  const rngRef = useRef(null);
  if (!rngRef.current) rngRef.current = makeRng(sessionSeed(SEED));
  const countsRef = useRef(ZERO_SUMS);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const reactRef = useRef(null);

  const [counts, setCounts] = useState(ZERO_SUMS);
  const [lastPair, setLastPair] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [bet, setBet] = useState(null);
  const [snap, setSnap] = useState(null);
  const g7 = useGridTask(TARGET7);
  const g10 = useGridTask(TARGET10);
  const [cmpDone, setCmpDone] = useState(false);
  const [gameDone, setGameDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);

  const launch = (n, after) => {
    if (rolling) return;
    const r = rollTwoMany(countsRef.current, n, rngRef.current);
    const finish = () => {
      countsRef.current = r.counts; setCounts(r.counts); setLastPair(r.last); setRolling(false);
      reactRef.current?.(true); after?.(r);
    };
    if (reduce) { finish(); return; }
    setRolling(true);
    timer.current = setTimeout(finish, ROLL_MS);
  };
  const throwN = (n) => launch(n, (r) => { if (totalOf(r.counts) >= 1000 && !snap) setSnap({ counts: r.counts, last: r.last }); });

  const total = totalOf(counts);
  const lead = snap ? leaders(snap.counts, SUMS) : [];
  const freq7 = snap ? formatPct(frequencies(snap.counts)[5], 1000) : '—';
  const freq2 = snap ? formatPct(frequencies(snap.counts)[0], 1000) : '—';
  const betFreq = snap && bet !== null ? formatPct(frequencies(snap.counts)[bet - 2], 1000) : null;

  const gridTask = (task, kit, caption) => (
    <div className="space-y-3">
      <OutcomeGrid selected={task.cells} onToggle={task.toggle} disabled={task.done} reveal={task.done ? (task === g7 ? TARGET7 : TARGET10) : null} caption={caption} />
      {!task.done && (
        <ValidateButton onClick={() => task.check(kit.react)} disabled={task.cells.size === 0} tone="indigo">Vérifier mes cases</ValidateButton>
      )}
      {task.msg?.tone === 'ko' && (
        <Feedback tone="ko">
          {task.msg.missing > 0 && <>Il manque <strong>{task.msg.missing}</strong> case{task.msg.missing > 1 ? 's' : ''}. </>}
          {task.msg.extra > 0 && <><strong>{task.msg.extra}</strong> case{task.msg.extra > 1 ? 's' : ''} cochée{task.msg.extra > 1 ? 's' : ''} ne convien{task.msg.extra > 1 ? 'nent' : 't'} pas. </>}
          Encore {task.msg.left} essai{task.msg.left > 1 ? 's' : ''}. Pense que (1 ; 6) et (6 ; 1) sont deux cases différentes.
        </Feedback>
      )}
      {task.msg?.revealed && (
        <Feedback tone="info">Pas grave, on te les montre : les cases attendues sont maintenant cochées (en vert).</Feedback>
      )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Deux dés"
      moduleSubtitle="Parie sur une somme, lance mille fois, puis coche les 36 cas."
      estimatedTime="11 min"
      brief={{
        tag: '🎲🎲 Mission 04',
        title: 'Le dernier défi du jeu',
        tone: 'emerald',
        body: (
          <p>
            Pour gagner, il faut annoncer la somme de deux dés avant de lancer. Quelle somme choisirais-tu ?
            Parie, puis lance — beaucoup.
          </p>
        ),
      }}
      intro={(kit) => { reactRef.current = kit.react; return null; }}
      steps={[
        {
          num: 1,
          title: 'Parie sur une somme',
          subtitle: 'Choisis une somme, puis lance : 1 fois, 100 fois, 1 000 fois.',
          done: snap !== null,
          content: (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5 justify-center" role="group" aria-label="Parier sur la somme">
                {SUMS.map((s) => (
                  <button key={s} type="button" disabled={snap !== null} onClick={() => setBet(s)} aria-pressed={bet === s}
                    aria-label={`Parier sur la somme ${s}`}
                    className={`min-w-[44px] min-h-[44px] px-2 rounded-xl border-2 font-mono font-bold transition focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60
                      ${bet === s ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400'}`}
                    style={{ touchAction: 'manipulation' }}>{s}</button>
                ))}
              </div>
              {bet === null && <Feedback tone="info">Parie d’abord sur une somme entre 2 et 12.</Feedback>}
              {bet !== null && (
                <TwoDiceLab
                  counts={snap ? snap.counts : counts}
                  lastPair={snap ? snap.last : lastPair}
                  rolling={!snap && rolling}
                  frozen={snap !== null}
                  predictedSum={bet}
                  controls={snap ? {} : { single: true, hundred: true, thousand: true }}
                  onThrow={throwN}
                  caption={snap ? `Ta série de ${formatDec(totalOf(snap.counts))} lancers` : 'Lance les deux dés'}
                />
              )}
              {bet !== null && !snap && total > 0 && (
                <Feedback tone="info">{formatDec(total)} lancer{total > 1 ? 's' : ''} — continue jusqu’à 1 000 au moins pour voir la forme des barres.</Feedback>
              )}
              {snap && (
                <Feedback tone="ok">
                  En tête : la somme <strong>{lead.join(' et ')}</strong>. Le 7 est sorti à {freq7}, le 2 à {freq2}. Tu avais parié sur {bet} ({betFreq}).
                  Ce n’est pas plat comme avec un seul dé : certaines sommes sortent bien plus que d’autres. Pourquoi ? Cherchons.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Les 36 cas',
          subtitle: 'Coche toutes les cases où la somme vaut 7, puis vérifie.',
          done: g7.done,
          content: (kit) => (
            <div className="space-y-3">
              {gridTask(g7, kit, 'Dé 1 en lignes, dé 2 en colonnes — chaque case est une issue')}
              {g7.done && (
                <Feedback tone="ok">
                  <strong>6 cases sur 36</strong> donnent 7 : (1 ; 6), (2 ; 5), (3 ; 4), (4 ; 3), (5 ; 2), (6 ; 1). Les 36 cases ont
                  la même chance ; donc <MathText>{`$P(\\text{somme } 7) = \\frac{6}{36} = ${fracLatex(6, 36)}$`}</MathText> ≈ 16,7 % — exactement ce que ta série
                  montrait ({freq7}). Pour la somme 2, une seule case : 1/36 ≈ 2,8 %.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le modèle sur tes barres',
          subtitle: 'Le repère de chaque somme : son nombre de cases sur 36.',
          done: cmpDone,
          content: (
            <TapQuestion
              prompt="Quelle est la probabilité d’obtenir une somme de 12 ?"
              above={snap && <TwoDiceLab counts={snap.counts} lastPair={snap.last} frozen theory={THEORY} showFreq caption="Ta série de 1 000 lancers, avec le modèle" />}
              options={['$\\frac{1}{36}$', '$\\frac{1}{11}$', '$\\frac{1}{12}$', '$\\frac{1}{6}$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              correctionLabel="1/36"
              correct={0}
              cols={2}
              explain="Une seule case donne 12 : (6 ; 6). P(12) = 1/36 ≈ 2,8 %. Les repères pointillés suivent la bosse de tes barres : le modèle explique l’expérience."
              solved={cmpDone}
              onAnswered={() => setCmpDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Le jeu : « au moins 10 »',
          subtitle: 'Tu gagnes si la somme vaut 10, 11 ou 12. Coche les cases, puis calcule.',
          done: g10.done && gameDone,
          content: (kit) => (
            <div className="space-y-3">
              {gridTask(g10, kit, 'Événement : « somme au moins 10 »')}
              {g10.done && (
                <TapQuestion
                  prompt="Quelle est la probabilité de gagner ?"
                  options={['$\\frac{6}{36} = \\frac{1}{6}$', '$\\frac{3}{11}$', '$\\frac{3}{36}$', '$\\frac{10}{36}$']}
                  renderOption={(o) => <MathText>{o}</MathText>}
                  correctionLabel="6/36 = 1/6"
                  correct={0}
                  cols={2}
                  explain="Six cases : (4 ; 6), (5 ; 5), (6 ; 4), (5 ; 6), (6 ; 5), (6 ; 6). P = 6/36 = 1/6. Compter 3 sommes sur 11 oublierait que les sommes n’ont pas la même chance."
                  solved={gameDone}
                  onAnswered={() => setGameDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Le piège du 1/11',
          subtitle: 'Sans grille, cette fois.',
          done: trapDone,
          content: (
            <TapQuestion
              prompt="Un joueur dit : « Il y a 11 sommes possibles, donc chaque somme a une probabilité de 1/11. » Qu’en penses-tu ?"
              options={[
                'Faux : les 11 sommes n’ont pas la même chance ; ce sont les 36 couples qui l’ont',
                'Vrai : 11 issues, donc 1/11 chacune',
                'Vrai pour le 7, faux pour les autres',
              ]}
              correct={0}
              cols={1}
              explain={
                <>
                  Les <strong>issues</strong> de l’expérience sont les 36 couples (dé 1 ; dé 2), tous équiprobables. Une somme est un{' '}
                  <strong>événement</strong>, réalisé par 1 à 6 de ces couples. Ta série le confirmait : le 7 sortait à {freq7}, loin de 1/11 ≈ 9,1 %.
                </>
              }
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Pour une expérience à deux épreuves, on compte les <strong>couples</strong> : la grille 6 × 6 est le tableau
          des 36 issues. P(événement) = nombre de cases favorables ÷ 36. Il reste à mettre des mots précis sur tout
          ce que tu as vu — c’est le module suivant.
        </Feedback>
      }
    />
  );
}
