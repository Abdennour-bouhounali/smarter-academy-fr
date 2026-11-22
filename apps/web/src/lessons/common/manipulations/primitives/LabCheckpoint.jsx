import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MessageCircleQuestion, Lightbulb, CheckCircle2, Eye, RotateCcw, ChevronLeft, Send } from 'lucide-react';
import * as C from './labCheckpoint';
import { playSfx } from '../../utils/playEffect';
import { useInMissionPlayer } from '../../mission/missionPlayerContext';

/**
 * LabCheckpoint — les QUESTIONS PENDANT LE LABO (2026-10-28, PROTOTYPE sur `gear-crank` ; à étendre à tous les labos, propriétaire).
 *
 * Quand l'élève termine une étape du labo (une tâche), une carte de questions se pose PAR-DESSUS le labo (et non sous lui, où
 * il ne la voyait pas) : une suite de questions sur CE qu'il vient de faire, qui mène à l'idée de l'étape, puis à la règle.
 *  - BLOQUANTE : `blocking` vaut true tant que la suite n'est pas finie ; le labo cache son « التالي » tant qu'elle bloque.
 *  - REFAIRE : « انظر إلى المختبر » plie la carte (le labo reste figé, on lit les compteurs) ; « أعِد التجربة » plie la carte ET
 *    appelle `onRetry` (le labo remet la même tâche au départ). La carte revient seule quand l'étape est de nouveau atteinte, ou
 *    par « عُد إلى السؤال » sur la bande qui la remplace.
 *  - GUIDÉE : jamais la réponse au premier essai — indice 1 (ou le `why` de l'option), puis indice 2, puis la réponse et son
 *    explication au 3e essai (`labCheckpoint.js › MAX_TRIES`). Une option fausse déjà choisie reste barrée.
 *
 * Usage (dans le labo) :
 *   const cp = useLabCheckpoint({ id: task.id, questions, reached: taskDone, resetKey, onRetry, onEvent, onDone });
 *   … `canNext && !cp.blocking` … et `{cp.node}` en tête du conteneur `relative` qui enveloppe la consigne, la scène et les commandes.
 * Une question : `{ id, prompt, kind: 'choice' | 'number', options?: [{ text, correct?, why? }], cols?, expected?, answer?, hints: [h1, h2],
 * explain }` (nœuds React ; `answer` : la réponse montrée au 3e essai d'une question `number`).
 * `onEvent` reçoit `{ tk: 'checkpoint', id, q, ok, tries, revealed }` à chaque réponse, puis `{ tk: 'checkpoint-done', id, log }`.
 *
 * Contrat DOM : [data-lab-checkpoint][data-checkpoint=<id>][data-q=<qid>][data-status], [data-lab-checkpoint-option=<i>][data-state],
 * [data-lab-checkpoint-input], [data-lab-checkpoint-check], [data-lab-checkpoint-feedback=hint|reveal|right], [data-lab-checkpoint-next],
 * [data-lab-checkpoint-look], [data-lab-checkpoint-retry], [data-lab-checkpoint-pill], [data-lab-checkpoint-back].
 */
export function useLabCheckpoint({ id, questions, reached, resetKey, onRetry, onEvent, onDone }) {
  const [book, setBook] = useState({});
  const [folded, setFolded] = useState({});
  const [key, setKey] = useState(resetKey);
  if (key !== resetKey) { setKey(resetKey); setBook({}); setFolded({}); }
  const has = !!id && Array.isArray(questions) && questions.length > 0;
  const p = has ? book[id] : null;

  // l'étape est atteinte : la carte s'ouvre (et se rouvre après « أعِد التجربة »)
  useEffect(() => {
    if (!has || !reached) return;
    setBook((b) => (b[id] ? b : { ...b, [id]: C.fresh() }));
    setFolded((f) => (f[id] ? { ...f, [id]: false } : f));
  }, [has, reached, id]);

  const blocking = has && !p?.done;
  const open = has && !!p && !p.done && !folded[id];
  const fold = useCallback(() => setFolded((f) => ({ ...f, [id]: true })), [id]);
  const unfold = useCallback(() => setFolded((f) => ({ ...f, [id]: false })), [id]);

  const answer = (value) => {
    const q = questions[p.qi];
    const next = C.submit(p, q, value);
    if (next === p) return;
    setBook((b) => ({ ...b, [id]: next }));
    playSfx(next.status === 'right' ? 'correct' : 'wrong');
    onEvent?.({ tk: 'checkpoint', id, q: q.id, ok: next.status === 'right', tries: next.tries, revealed: next.status === 'revealed' });
  };
  const go = () => {
    const next = C.advance(p, questions.length);
    if (next === p) return;
    setBook((b) => ({ ...b, [id]: next }));
    if (next.done) { onEvent?.({ tk: 'checkpoint-done', id, log: next.log }); onDone?.(id, next.log); }
  };
  const retry = () => { fold(); onRetry?.(); };

  const node = has && p && !p.done ? (
    open
      ? <CheckpointCard key={`${id}:${p.qi}`} id={id} questions={questions} p={p} onAnswer={answer} onNext={go} onLook={fold} onRetry={retry} />
      : <CheckpointPill onBack={unfold} />
  ) : null;
  // `qid` : la question à l'écran (un labo peut montrer la scène dont elle parle — common-divisors, lecteur)
  return { blocking, open, done: has && !!p?.done, node, qid: open ? questions[p.qi]?.id ?? null : null };
}

// un anneau de focus VISIBLE (≥ 3:1) et détaché du bord — revue a11y 2026-11-10
const ring = 'outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2';
const pill = `inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border-2 px-4 text-sm font-black transition-all duration-150 active:translate-y-0.5 motion-reduce:transition-none ${ring}`;

function CheckpointCard({ id, questions, p, onAnswer, onNext, onLook, onRetry }) {
  const { t } = useTranslation('lesson');
  const k = (s, o) => t(`manipulation.checkpoint.${s}`, o);
  const reduce = useReducedMotion();
  const q = questions[p.qi];
  const fb = C.feedbackOf(p, q);
  const settled = p.status === 'right' || p.status === 'revealed';
  const last = p.qi === questions.length - 1;
  const [draft, setDraft] = useState('');
  const [bad, setBad] = useState(false);
  const cardRef = useRef(null);
  const inputRef = useRef(null);
  // Lecteur de mission (propriétaire, 2026-11-04) : la question est centrée sur l'ÉCRAN, l'ombre couvre TOUT l'écran (portée
  // dans <body>, hors du zoom du lecteur) — le résultat écrit à côté du labo ne se lit plus pendant qu'on répond.
  const inPlayer = useInMissionPlayer();

  useEffect(() => {
    const el = cardRef.current;
    if (p.qi === 0 && p.tries === 0) playSfx('pop');
    el?.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    (inputRef.current ?? el)?.focus?.({ preventScroll: true });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const check = () => {
    if (C.readNumber(draft) == null) { setBad(true); return; }
    setBad(false);
    onAnswer(draft);
  };
  const onKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); onLook(); return; }
    // 1 2 3 choisissent une option (hors du champ de saisie), comme dans le défi « اختبر ذاكرتك »
    const n = '123456'.indexOf(e.key);
    if (q.kind === 'choice' && !settled && n >= 0 && n < q.options.length && e.target.tagName !== 'INPUT' && !p.wrong.includes(n)) { e.preventDefault(); onAnswer(n); }
  };

  // l'option que l'élève a CHOISIE (une fausse, ou la juste s'il l'a trouvée) — `aria-pressed` ne vaut que pour elle
  const chosen = (i) => p.wrong.includes(i) || (settled && p.status === 'right' && !!q.options[i]?.correct);
  const optionState = (i) => {
    if (p.wrong.includes(i)) return 'wrong';
    if (settled && q.options[i]?.correct) return 'right';
    return 'idle';
  };
  const optionClass = {
    idle: 'border-indigo-200 bg-white text-indigo-950 hover:border-indigo-500 hover:bg-indigo-50 shadow-[0_3px_0_0_#C7D2FE]',
    wrong: 'border-rose-200 bg-rose-50 text-rose-800 line-through decoration-rose-400 opacity-80',
    right: 'border-emerald-700 bg-emerald-700 text-white shadow-[0_3px_0_0_#065F46]',
  };

  const card = (
    <motion.div
      // Lecteur (conseil + propriétaire, 2026-11-07) : une COLONNE à côté du terrain, SANS voile — le terrain reste net, entier et
      // visible, la question porte sur ce qu'il montre (l'ombre plein écran du 2026-11-04 cachait la preuve). Le labo la place.
      className={inPlayer
        ? 'w-full'
        : 'absolute inset-0 z-40 flex items-center justify-center rounded-2xl bg-slate-900/55 p-3 backdrop-blur-[3px] md:p-5'}
      initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: p.qi === 0 && p.tries === 0 ? 0.6 : 0 }}
      data-lab-checkpoint data-checkpoint={id} data-q={q.id} data-status={p.status} onKeyDown={onKey}
    >
      {/* sur la page la carte RECOUVRE le labo (dialogue modal) ; dans le lecteur elle est À CÔTÉ du labo, qu'on regarde encore : un groupe */}
      <div ref={cardRef} tabIndex={-1} role={inPlayer ? 'group' : 'dialog'} aria-modal={inPlayer ? undefined : 'true'} aria-labelledby={`lab-cp-${id}-${q.id}`}
        className={`flex max-h-full w-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl outline-none ${inPlayer ? 'ring-4 ring-indigo-200' : 'max-w-4xl'}`}>
        <div className="flex items-center justify-between gap-4 bg-gradient-to-l from-indigo-700 via-violet-700 to-fuchsia-700 px-5 py-3 text-white">
          <p className="flex items-center gap-2 text-base font-black">
            <MessageCircleQuestion className="h-6 w-6" aria-hidden="true" /> {k('title', { i: p.qi + 1, n: questions.length })}
          </p>
          <ol className="flex items-center gap-1.5" aria-hidden="true">
            {questions.map((qq, i) => (
              <li key={qq.id} className={`h-2.5 rounded-full transition-all ${i < p.qi ? 'w-8 bg-emerald-400' : i === p.qi ? 'w-12 animate-pulse bg-white' : 'w-8 bg-white/25'}`} />
            ))}
          </ol>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 md:px-8">
          <h4 id={`lab-cp-${id}-${q.id}`} className="text-center text-xl font-black leading-relaxed text-slate-900 md:text-2xl">{q.prompt}</h4>

          {q.kind === 'fill' ? (
            <FillAnswer q={q} settled={settled} revealed={p.status === 'revealed'} onAnswer={onAnswer} k={k} />
          ) : q.kind === 'build' ? (
            <BuildAnswer q={q} settled={settled} revealed={p.status === 'revealed'} onAnswer={onAnswer} k={k} />
          ) : q.kind === 'choice' ? (
            <div className={`grid gap-3 ${q.cols === 3 ? 'md:grid-cols-3' : q.cols === 2 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {q.options.map((o, i) => {
                const st = optionState(i);
                const big = q.cols === 3;
                return (
                  <button key={i} type="button" onClick={() => onAnswer(i)} disabled={settled || st === 'wrong'}
                    data-lab-checkpoint-option={i} data-state={st} aria-pressed={chosen(i)}
                    className={`relative flex items-center gap-3 rounded-2xl border-2 font-black transition-all duration-150 active:translate-y-0.5 disabled:cursor-default motion-reduce:transition-none ${
                      big ? 'min-h-[7.5rem] justify-center px-4 pb-3 pt-8 text-2xl md:text-3xl' : 'min-h-[4rem] px-4 py-3 text-start text-lg'} ${optionClass[st]} ${ring}`}>
                    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black ${st === 'right' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'} ${big ? 'absolute start-3 top-3' : ''}`}>{i + 1}</span>
                    {/* `pointer-events-none` : une formule KaTeX (√…) déborde, invisible, AU-DESSUS de son bouton — sans cela un toucher sur le
                        choix du dessus choisissait celui du dessous (marche Playwright, leçon amaliyat-judhur, 2026-11-10) */}
                    <span className={`pointer-events-none ${big ? 'text-center' : 'min-w-0 flex-1'}`}>{o.text}</span>
                    {st !== 'idle' && <span className="sr-only">{k(st === 'right' ? 'srRight' : 'srWrong')}</span>}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3" dir="ltr">
              <input ref={inputRef} type="text" inputMode="text" autoComplete="off" dir="ltr" value={settled ? (p.status === 'right' ? draft : '') : draft}
                disabled={settled} maxLength={9} placeholder={k('placeholder')}
                onChange={(e) => { setDraft(e.target.value); setBad(false); }} onKeyDown={(e) => { if (e.key === 'Enter' && !settled) check(); }}
                aria-label={k('inputAria')} aria-invalid={bad} data-lab-checkpoint-input
                className={`h-16 w-52 rounded-2xl border-2 ${bad ? 'border-rose-400' : 'border-indigo-500'} bg-white px-4 text-center text-4xl font-black tabular-nums text-indigo-950 placeholder:text-base placeholder:font-bold placeholder:text-slate-400 disabled:bg-slate-50 ${ring}`} />
              {!settled && (
                <button type="button" onClick={check} disabled={!draft.trim()} data-lab-checkpoint-check
                  className={`inline-flex min-h-[64px] items-center gap-2 rounded-2xl border-2 border-sky-700 bg-sky-700 px-8 text-xl font-black text-white shadow-[0_4px_0_0_#0369A1] transition-all active:translate-y-0.5 disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none ${ring}`}>
                  <Send className="h-5 w-5 -scale-x-100" aria-hidden="true" /> <span dir="rtl">{k('check')}</span>
                </button>
              )}
              {bad && <p role="alert" dir="rtl" className="w-full text-center text-base font-bold text-rose-700">{k('badInput')}</p>}
            </div>
          )}

          <div aria-live="polite">
            {fb?.kind === 'hint' && (
              <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-base font-bold text-amber-950" data-lab-checkpoint-feedback="hint">
                <Lightbulb className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden="true" />
                <div className="space-y-1">
                  <p>{k('notYet')} {fb.node}</p>
                  <p className="text-sm font-extrabold text-amber-700">{k(C.MAX_TRIES - p.tries === 1 ? 'triesOne' : 'triesTwo')}</p>
                </div>
              </div>
            )}
            {fb?.kind === 'reveal' && (
              <div className="space-y-1 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-base font-bold text-indigo-950" data-lab-checkpoint-feedback="reveal">
                <p>{k('reveal')} {q.kind === 'number' ? <strong className="text-xl">{q.answer ?? <bdi dir="ltr">{q.expected}</bdi>}</strong> : null}</p>
                {q.explain && <div>{q.explain}</div>}
              </div>
            )}
            {p.status === 'right' && (
              <div className="flex items-start gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-base font-bold text-emerald-950" data-lab-checkpoint-feedback="right">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>{k('right')} {q.explain}</div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-3">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onLook} data-lab-checkpoint-look className={`${pill} border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50`}>
              <Eye className="h-4 w-4" aria-hidden="true" /> {k('look')}
            </button>
            <button type="button" onClick={onRetry} data-lab-checkpoint-retry className={`${pill} border-indigo-200 bg-white text-indigo-900 hover:bg-indigo-50`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> {k('retry')}
            </button>
          </div>
          {settled && (
            <button type="button" onClick={onNext} data-lab-checkpoint-next autoFocus
              className={`inline-flex min-h-[52px] items-center gap-2 rounded-full border-2 border-emerald-700 bg-emerald-700 px-8 text-lg font-black text-white shadow-[0_4px_0_0_#065F46] active:translate-y-0.5 ${ring}`}>
              {last ? k('finish') : k('next')} <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
  // lecteur : une colonne DANS le labo (le labo la pose à côté du terrain) — plus de portail plein écran
  return card;
}

/**
 * `fill` : une case par grandeur (« في كل فريق ▢ · على المقاعد ▢ »), remplie d'un TOUCHER sur une pastille — pas de clavier
 * sur la tablette. « تحقّق » quand toutes les cases sont remplies. Révélée : les bonnes valeurs s'allument.
 */
function FillAnswer({ q, settled, revealed, onAnswer, k }) {
  const [pick, setPick] = useState(() => q.fields.map(() => null));
  const shown = revealed ? q.fields.map((f) => f.expected) : pick;
  const uid = useId();
  return (
    <div className="space-y-4" data-lab-checkpoint-fill>
      {q.fields.map((f, i) => (
        <div key={i} className="space-y-2">
          <p id={`${uid}-f${i}`} className="text-center text-base font-black text-slate-700">{f.label}</p>
          {/* le groupe porte le nom de sa case : une pastille dessinée (`f.render`, « 1/3 ») ne dit pas seule de quelle grandeur elle parle */}
          <div className="flex flex-wrap justify-center gap-2" dir="ltr" role="group" aria-labelledby={`${uid}-f${i}`}>
            {f.options.map((o) => {
              const on = String(shown[i]) === String(o);
              return (
                <button key={o} type="button" disabled={settled} onClick={() => setPick((x) => x.map((v, j) => (j === i ? o : v)))}
                  data-lab-checkpoint-chip={`${i}:${o}`} aria-pressed={on}
                  className={`h-14 min-w-[3.5rem] rounded-2xl border-2 px-3 text-2xl font-black tabular-nums transition-colors ${on ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-200 bg-white text-indigo-950 hover:border-indigo-500'} ${ring}`}>
                  {/* `f.render` (2026-11-10) : une pastille écrite dans SA forme (une vraie barre de fraction) ; la valeur comparée reste `o` */}
                  {f.render ? <span className="pointer-events-none">{f.render(o)}</span> : o}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!settled && (
        <div className="flex justify-center">
          <button type="button" disabled={pick.some((v) => v == null)} onClick={() => onAnswer(pick)} data-lab-checkpoint-check
            className={`inline-flex min-h-[56px] items-center gap-2 rounded-2xl border-2 border-sky-700 bg-sky-700 px-8 text-xl font-black text-white shadow-[0_4px_0_0_#0369A1] disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none ${ring}`}>
            {k('check')}
          </button>
        </div>
      )}
    </div>
  );
}

/** Une tuile de texte brut (opt-in) : `{ text }`. */
const isTextTile = (t) => t != null && typeof t === 'object' && typeof t.text === 'string';

/**
 * `build` : l'élève BÂTIT l'égalité — chaque emplacement porte le SENS de son nombre (« اللاعبون = الفرق × في كل فريق + خارج
 * الفرق ») ; un toucher sur une tuile la pose dans le premier emplacement vide, un toucher sur un emplacement la rend.
 */
export function BuildAnswer({ q, settled, revealed, onAnswer, k }) {
  // `{ text: 'أو' }` (2026-11-11, jidaa-maadum — verdict L2.3) : une tuile de TEXTE brut (un mot arabe, le connecteur « أو ») ; sa valeur
  // comparée est la chaîne `text`. Une tuile nombre ou chaîne garde le chemin d'avant (valeur = la tuile, rendue en maths).
  const tileValue = (t) => (isTextTile(t) ? t.text : t);
  const textValues = new Set(q.tiles.filter(isTextTile).map((t) => t.text));
  const isText = (v) => textValues.has(v);
  // index de tuile par emplacement ; `q.preset` (2026-11-10) : des tuiles déjà posées au départ (« AB′/AB » fixé à gauche) — l'élève peut les reprendre
  const [placed, setPlaced] = useState(() => q.slots.map((_, i) => { const v = q.preset?.[i]; const ti = v == null ? -1 : q.tiles.findIndex((t) => tileValue(t) === v); return ti >= 0 ? ti : null; }));
  const used = new Set(placed.filter((x) => x != null));
  const values = revealed ? q.expected : placed.map((ti) => (ti == null ? null : tileValue(q.tiles[ti])));
  const put = (ti) => setPlaced((pl) => { const i = pl.indexOf(null); return i < 0 ? pl : pl.map((v, j) => (j === i ? ti : v)); });
  const take = (si) => setPlaced((pl) => pl.map((v, j) => (j === si ? null : v)));
  // `q.ops` : les signes entre les emplacements (défaut « n = g × q + r ») — p. ex. ['=', '+'] pour « grand = petit + reste » (pgcd-differences)
  const ops = q.ops ?? ['=', '×', '+'];
  // `q.wideText` (opt-in, 2026-11-11, unité 5 — verdict X10 / L3.11) : `true` (tous les emplacements) ou une liste d'indices — l'emplacement
  // s'élargit pour un MOT arabe (« الكرّاس ») et la rangée se lit de droite à gauche et passe à la ligne (une phrase arabe à trous dans une
  // colonne latérale de ≈ 388 px à 1024 × 768). Sans `wideText`, le rendu d'avant, octet pour octet.
  const wideAt = (si) => (Array.isArray(q.wideText) ? q.wideText.includes(si) : q.wideText === true);
  const sentence = q.wideText != null && q.wideText !== false;
  return (
    <div className="space-y-5" data-lab-checkpoint-build>
      <div className={sentence ? 'flex flex-wrap items-start justify-center gap-x-2 gap-y-1' : 'flex items-start justify-center gap-2'} dir={sentence ? 'rtl' : 'ltr'}
        {...(sentence ? { 'data-lab-checkpoint-sentence': true } : {})}>
        {/* `q.wrap` (2026-11-11, turf-factoring) : un signe AVANT le premier emplacement et APRÈS le dernier — « ▢(▢ + ▢) », « (▢ + ▢)² » */}
        {q.wrap?.[0] ? <span className="pt-3 text-2xl font-black text-slate-600" aria-hidden="true" data-lab-checkpoint-wrap="before">{q.wrap[0]}</span> : null}
        {q.slots.map((label, si) => (
          <React.Fragment key={si}>
            {si > 0 && <span className="pt-3 text-2xl font-black text-slate-400" aria-hidden="true">{ops[si - 1]}</span>}
            <button type="button" disabled={settled || values[si] == null} onClick={() => take(si)} data-lab-checkpoint-slot={si}
              className={`flex ${wideAt(si) ? 'w-[7rem]' : 'w-[4.5rem]'} flex-col items-center gap-1 ${ring} rounded-xl`} {...(wideAt(si) ? { 'data-lab-checkpoint-wide': true } : {})}>
              <span className={`flex h-14 w-full items-center justify-center rounded-2xl border-2 border-dashed text-2xl font-black tabular-nums ${values[si] == null ? 'border-slate-300 bg-slate-50 text-slate-300' : 'border-indigo-500 bg-indigo-50 text-indigo-950'}`}>
                {/* `q.render` (2026-11-10, shadow-meet) : une tuile écrite dans SA forme (« BC/BE » en vraie fraction) ; la valeur comparée reste la tuile */}
                {values[si] == null ? '▢' : isText(values[si]) ? <span className={`pointer-events-none text-xl${wideAt(si) ? ' whitespace-nowrap' : ''}`} dir="rtl" lang="ar" data-lab-checkpoint-text>{values[si]}</span> : q.render ? <span className="pointer-events-none">{q.render(values[si])}</span> : values[si]}
              </span>
              <span className="text-center text-xs font-bold leading-tight text-slate-600" dir="rtl">{label}</span>
            </button>
          </React.Fragment>
        ))}
        {q.wrap?.[1] ? <span className="pt-3 text-2xl font-black text-slate-600" aria-hidden="true" data-lab-checkpoint-wrap="after">{q.wrap[1]}</span> : null}
      </div>
      {!settled && (
        <>
          <div className="flex flex-wrap justify-center gap-2" dir="ltr">
            {q.tiles.map((n, ti) => (
              <button key={ti} type="button" disabled={used.has(ti)} onClick={() => put(ti)} data-lab-checkpoint-tile={ti}
                className={`h-14 min-w-[3.5rem] rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 text-2xl font-black tabular-nums text-amber-950 shadow-[0_3px_0_0_#FCD34D] disabled:opacity-25 ${ring}`}>
                {isTextTile(n) ? <span className="pointer-events-none text-xl" dir="rtl" lang="ar" data-lab-checkpoint-text>{n.text}</span> : q.render ? <span className="pointer-events-none">{q.render(n)}</span> : n}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <button type="button" disabled={placed.some((v) => v == null)} onClick={() => onAnswer(placed.map((ti) => tileValue(q.tiles[ti])))} data-lab-checkpoint-check
              className={`inline-flex min-h-[56px] items-center gap-2 rounded-2xl border-2 border-sky-700 bg-sky-700 px-8 text-xl font-black text-white shadow-[0_4px_0_0_#0369A1] disabled:border-slate-300 disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none ${ring}`}>
              {k('check')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CheckpointPill({ onBack }) {
  const { t } = useTranslation('lesson');
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-amber-300 bg-amber-50 px-3 py-1.5" data-lab-checkpoint-pill role="status">
      <p className="flex items-center gap-2 text-sm font-black text-amber-950">
        <MessageCircleQuestion className="h-5 w-5 text-amber-600" aria-hidden="true" /> {t('manipulation.checkpoint.waiting')}
      </p>
      <button type="button" onClick={onBack} data-lab-checkpoint-back
        className={`${pill} border-amber-700 bg-amber-700 text-white shadow-[0_3px_0_0_#78350F]`}>
        {t('manipulation.checkpoint.back')} <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
