import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Minus, Plus, ArrowLeft, ArrowRight, Check, X, CornerDownLeft, Save } from 'lucide-react';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import { useLessonViewport } from '../../knowledge/useLessonViewport';
import ManipulationShell from '../ManipulationShell';
import ManipulationStage from '../ManipulationStage';
import ManipulationDiscovery from '../ManipulationDiscovery';
import { useManipulation } from '../useManipulation';
import LabFold from '../primitives/LabFold';
import MathText from '../../components/MathText';
import { useLabCheckpoint } from '../primitives/LabCheckpoint';
import { useLabCheckpointSettings } from '../primitives/labCheckpointSettings';
import { LabStepper, useStepCelebration } from '../primitives/LabSteps';
import { playSfx } from '../../utils/playEffect';
import * as L from '../logic/sheetLab';

/**
 * sheet-lab — LE MAJDOUL (unité 8 « الإحصاء », leçon « استعمال المجدولات (Excel) لمعالجة وتلخيص معطيات
 * إحصائية وتمثيلها بيانيًا »). Pas une image d'Excel : une feuille qui CALCULE, sur l'écran de la salle
 * d'informatique (thème `sheet`).
 *
 * LES CINQ QUESTIONS (MANIPULATION_CONTRACT §1)
 * A. L'élève SAISIT la série dans la ligne 1 (متقدم : 4, 10, 8, 4, 3, 2, 4 dans A1:G1, cellule par cellule),
 *    SÉLECTIONNE une plage en glissant sur les cellules (tap-tap : première puis dernière ; clavier :
 *    Maj + flèches), COMPOSE un دستور (cartes de fonctions + la plage, ou la barre au clavier), le valide
 *    par ENTER dans B de la ligne de l'indicateur, après avoir tapé son calcul À LA MAIN dans C. Ensuite il
 *    CHANGE une valeur de la ligne 1 (−/+ ou la barre) et regarde la feuille se recalculer.
 * B. Idée : un دستور (=…) est un calcul SUR DES CELLULES : la plage A1:G1 dit sur quoi, la fonction dit
 *    quoi (=MAX()-MIN() المدى, =MEDIANE() الوسيط, =MOYENNE() المتوسط, =MODE() المنوال) ; le résultat suit
 *    les cellules, un nombre tapé ne suit rien. Puis : le graphique se choisit selon la nature des données.
 * C. La cellule B prend la valeur ; un pli « تمّوج » la parcourt à chaque recalcul ; la colonne C reste.
 * D. La ligne « B = valeur » face à « C = mon calcul » : confirmé (✓) ou contredit (les deux nombres) ;
 *    les دساتير validés s'écrivent tels que le manuel les imprime.
 * E. À découvrir : une plage qui oublie G1 donne un AUTRE nombre ; une fonction mal choisie (=MAX seul)
 *    aussi ; et quand une valeur aberrante entre, MOYENNE bouge, MEDIANE reste — sans rien retaper.
 *
 * FICHE (MANIPULATION_DNA §7)
 *   CONCEPT        une formule de tableur : fonction + plage de cellules, recalculée à partir des cellules
 *   OBJECT         la feuille : ligne 1 (données), lignes 2… (A nom, B دستور, C calcul à la main) ; la barre
 *   VARIABLE       les valeurs des cellules, la PLAGE sélectionnée, la fonction composée
 *   INVARIANT      le résultat d'un دستور est toujours celui de ses cellules (jamais un nombre stocké) ; la
 *                  médiane de la série du manuel ne bouge pas quand UNE valeur change (trois 4 au centre)
 *   TRANSFORMATION B se recalcule ; le pli de recalcul ; « كان … » à côté
 *   CONSTRAINT     un دستور commence par « = » ; la plage reste dans la ligne 1 ; le calcul à la main d'abord
 *   RESISTANCE     sans « = », un nombre tapé, une fonction inconnue (#NOM?), une plage hors ligne 1 :
 *                  REFUSÉS dans la barre avec la raison du tableur ; une plage courte ou une mauvaise
 *                  fonction : CALCULÉES, et le nombre contredit le calcul de l'élève écrit à côté ;
 *                  graphique : un type qui ne convient pas est refusé avec sa raison ; une plage incomplète
 *                  dessine un graphique faux (216° au lieu de 144°)
 *   EVIDENCE       B face à C ; le pli ; l'historique des دساتير (LabFold)
 *   CONTRAST       ligne vérifiée, puis une valeur changée : MOYENNE bouge, MEDIANE reste (متقدم) ; le
 *                  دستور bouge, le nombre tapé en C non (مبتدئ)
 *   PREDICTION     le calcul à la main AVANT le دستور (ce que demande le تمرين 7 : « تأكّد »)
 *   DISCOVERY      « الدستور يُعاد حسابه من الخلايا : المتوسط تأثّر بالقيمة الكبيرة والوسيط لم يتأثّر »
 *   FORMALIZATION  les quatre دساتير du manuel, écrits B2…B5 (=MAX(A1:G1)-MIN(A1:G1) …)
 *   TRANSFER       l'étape graphique (ex-15 الدائري, ex-16 المدرّج, la série en أعمدة), ex-24 =ALEA()
 * Manuel (§6bis) : chaque دستور est un choix, chaque valeur une donnée — pas d'auto-complétion.
 *
 * Niveaux : مبتدئ = `cells: '5|8|6|9|7'` déjà saisies, `ask: 'MAX-MIN|MOYENNE'` (plateforme) ; متقدم =
 * تمرين 7 corrigé, `entry: 'type'` (la série à saisir), les quatre دساتير, puis l'étape graphique ouverte PAR
 * L'ÉLÈVE (carte « التالي » + retour, §7quater) — jeux `bars` (la série, valeurs / تكرارات), `pie` (ex-15),
 * `histogram` (ex-16).
 *
 * NOMS DES FONCTIONS : le manuel imprime les noms de l'Excel FRANÇAIS (MEDIANE, MOYENNE) ; le catalogue
 * écrit MEDIAN ; le lab accepte les deux (MEDIAN, AVERAGE = mêmes calculs) et ses cartes montrent ceux du
 * manuel.
 *
 * RTL : la feuille, la barre, les cartes et chaque دستور sont du CODE LATIN LTR (`dir="ltr"`, police mono),
 * jamais KaTeX ; les noms arabes (A2…) et les verdicts sont du DOM arabe ; un دستور cité dans une phrase est
 * isolé (LRI … PDI).
 *
 * DÉCOR (exigence du propriétaire) : l'écran de la salle d'informatique (cadre, barre de titre « ورقة 1 »,
 * trois voyants), un curseur de souris sur la cellule active, un pli de recalcul sur une cellule B qui
 * change. `aria-hidden`, `[data-deco]`, hors du clavier, immobile sous `prefers-reduced-motion`.
 *
 * D'UN SEUL REGARD (§8bis) : `[data-sh-glance]` = barre + cartes (ou −/+) + ligne 1 + lignes d'indicateurs
 * + verdict (étape graphique : jeux + petit tableau + types + graphique + verdict). La ligne 1 se REPLIE en
 * rangées de cellules ≥ 44 px (`L.perRow`) : 7 cellules en une rangée sur ordinateur, en rangées de 3 ou 4
 * sur un téléphone, chaque cellule portant son adresse. L'historique est dans un `LabFold` sous le bloc.
 *
 * QUESTIONS PENDANT LE LABO (2026-10-28, lot 5 ; `primitives/LabCheckpoint`) : `checkpoints` (défaut true). Une étape par geste réussi (`LabStepper`) : la saisie
 * de la série (`entry`, متقدم) → `ENTRY_CHAIN` ; chaque ligne d'indicateur vérifiée (`row0…`) → `ROW_CHAIN` (une plage incomplète · qui suit les cellules) ; la
 * première cellule changée qui a fait bouger un دستور (`edit`) → `EDIT_CHAIN` (combien de دساتير ont bougé · la règle, qui remplace la découverte et formalise).
 * L'étape suivante ne s'ouvre qu'une fois la précédente répondue. L'étape graphique n'a pas de questions. Les événements `{ tk: 'checkpoint' | 'checkpoint-done', … }`
 * partent vers `onCheckpoint` (jamais `onTrial`). OBLIGATOIRES pour tout élève ; l'ENSEIGNANT les coupe pour SON compte (interrupteur en en-tête).
 * Props : `cells`, `ask`, `entry` ('type' | 'given'), `chart` ('bars|pie|histogram'), `pie`
 * ('البلاستيك:60|…'), `classes` ('7-8:6|…'), `seriesLabel`, `fileName`, `theme` ('sheet'), `title`, `lead`,
 * `mission`, `level`, `levels`, `onTrial(t)` ({ kind: 'commit', row, indicator, formula, what, value, hand,
 * handOk, status, missing } | { kind: 'edit', cell, value, moved } | { kind: 'typed', i, ok, done } |
 * { kind: 'chart', id, chart, ok, reason }), `onFinished({ ask })` à la règle formelle — tous par
 * `state.report`.
 *
 * CONTRAT DOM : [data-sheet-lab][data-stage=formulas|charts][data-entered][data-verified][data-layout]
 * [data-per-row], [data-sh-glance], [data-sh-bar] (input), [data-sh-namebox], [data-sh-enter], [data-sh-save],
 * [data-sh-card=<carte>], [data-sh-less|more], [data-sh-grid] (role=grid), [data-sh-cell=<i>][data-value]
 * [aria-selected][data-wrong], [data-sh-row=<r>][data-kind][data-status], [data-sh-b=<r>][data-value],
 * [data-sh-hand=<r>], [data-sh-verdict=<kind>], [data-sh-next], [data-sh-back],
 * [data-sh-dataset=<id>][aria-pressed][data-done], [data-sh-mgrid], [data-sh-mcell=<r>-<c>],
 * [data-sh-chart=<type>], [data-sh-drawn=<type>][data-ok], [data-sh-angle], [data-sh-formal], [data-deco],
 * [data-lab-fold=sheet-lab.trials].
 */
const ISO = (s) => `⁦${s}⁩`;
const DEFAULT_PIE = 'البلاستيك:60|الزجاج:40|الورق:50';
const DEFAULT_CLASSES = '7-8:6|8-9:1|9-10:4';

export default function SheetLab({
  cells: cells0 = '5|8|6|9|7', ask: ask0 = 'MAX-MIN|MOYENNE', chart: chart0, entry, pie, classes, seriesLabel, fileName,
  theme = 'sheet', title, lead, mission, level, levels: withLevels = true, initialMode = 'student', allowModeSwitch = false,
  onTrial, onFinished, checkpoints: cpOn = true, onCheckpoint,
}) {
  const { t } = useTranslation('lesson');
  const reduce = useReducedMotion();
  const initialNumbers = chart0 ? { cells: cells0, ask: ask0, chart: chart0 } : { cells: cells0, ask: ask0 };
  const state = useManipulation({ type: 'sheet-lab', initialNumbers, initialMode, initialLevel: level, withLevels, hintCount: 3 });
  const { cells, ask, chart } = state.numbers;
  const own = cells === cells0;
  const k = useCallback((key, o) => t(`manipulation.sheetLab.${key}`, o), [t]);

  const make = () => L.init({
    cells, ask, chart, entry: own ? entry : (chart ? 'type' : 'given'),
    pie: chart ? (own && pie ? pie : DEFAULT_PIE) : undefined,
    classes: chart ? (own && classes ? classes : DEFAULT_CLASSES) : undefined,
  });
  const [lab, setLab] = useState(make);
  const sceneKey = `${cells}:${ask}:${chart}:${state.epoch}`;
  const [scene, setScene] = useState(sceneKey);
  const [inits, setInits] = useState(0);
  const [doneIds, setDoneIds] = useState(() => new Set());
  if (scene !== sceneKey) { setScene(sceneKey); setLab(make()); setInits((n) => n + 1); setDoneIds(new Set()); }

  // les questions pendant le labo : obligatoires pour tout élève, l'enseignant seul les coupe pour SON compte
  const cpSettings = useLabCheckpointSettings('sheet-lab');
  const cpActive = cpOn && cpSettings.enabled;
  const steps = [
    ...(lab.typing ? [{ id: 'entry', reached: L.entered(lab) }] : []),
    ...lab.rows.map((row, r) => ({ id: `row${r}`, reached: row.status === 'ok' })),
    { id: 'edit', reached: L.discoveryReady(lab) },
  ];
  const cur = cpActive && lab.stage === 'formulas' ? steps.find((st) => !doneIds.has(st.id) && st.reached) : null;
  const cp = useLabCheckpoint({
    id: cur ? cur.id : null,
    questions: cur ? chainOf(cur.id).map((q) => QUESTIONS[q](lab, k, { r: Number(cur.id.slice(3)) })) : null,
    reached: !!cur,
    resetKey: inits,
    // « أعِد التجربة » : l'étape recommence (la saisie, la ligne ou les modifications de cellules sont remises)
    onRetry: () => setLab((x) => retryStep(x, cur.id, make)),
    onEvent: (ev) => state.report(onCheckpoint, ev),
    onDone: (id) => { setDoneIds((d) => new Set(d).add(id)); if (id === 'edit') { state.discover(); state.formalize(); } },
  });
  const ready = L.discoveryReady(lab) && !cpActive;
  useEffect(() => { if (ready) state.discover(); }, [ready, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (state.isFormal) state.report(onFinished, { ask }); }, [state.isFormal]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const last = lab.last;
    if (!last || last.kind === 'refuse' || last.kind === 'saved') return;
    const { kind, ...rest } = last;
    state.report(onTrial, { kind, ...rest });
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  // les sons : un cran = un pas ; le دستور confirmé ou la série saisie = juste (flag) ; refusé / faux = over
  useEffect(() => {
    const l = lab.last;
    if (!l) return;
    if (l.kind === 'typed') playSfx(l.done ? 'flag' : l.ok ? 'tooth' : 'over');
    else if (l.kind === 'commit') playSfx(l.status === 'ok' ? 'flag' : 'over');
    else if (l.kind === 'edit') playSfx('tooth');
    else if (l.kind === 'refuse') playSfx('over');
    else if (l.kind === 'saved') playSfx('bell');
  }, [lab.last]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── mesure ── */
  const boxRef = useRef(null);
  const [width, setWidth] = useState(640);
  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const measure = () => setWidth(Math.max(150, Math.floor(el.clientWidth)));
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const vp = useLessonViewport(true);
  const screenH = vp.ready && vp.height > 0 ? vp.height : 640;
  const narrow = width < 360;
  const wide = width >= 640;
  const ROWHEAD = narrow ? 0 : 22;
  const per = L.perRow(lab.n, width - ROWHEAD - 12, 40);
  const cellW = Math.min(wide ? 76 : 64, Math.floor((width - ROWHEAD - 12 - per * 3) / per));
  const compact = screenH < 700;

  /* ── la ligne 1 : glisser, tap-tap, clavier ── */
  const tapAnchor = useRef(null);
  const drag = useRef(null);
  const [cursor, setCursor] = useState(0);
  const selectRange = useCallback((a, b) => { setCursor(b); setLab((s) => L.select(s, a, b)); }, []);
  const cellAt = (x, y) => {
    const el = typeof document !== 'undefined' ? document.elementFromPoint(x, y)?.closest?.('[data-sh-cell]') : null;
    return el && boxRef.current?.contains(el) ? Number(el.getAttribute('data-sh-cell')) : null;
  };
  const onGridDown = (e) => {
    const i = Number(e.target.closest?.('[data-sh-cell]')?.getAttribute('data-sh-cell'));
    if (!Number.isInteger(i)) return;
    e.preventDefault();
    drag.current = { a: i, b: i, moved: false };
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* capture facultative */ }
    selectRange(i, i);
  };
  const onGridMove = (e) => {
    if (!drag.current) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i == null || i === drag.current.b) return;
    drag.current = { ...drag.current, b: i, moved: true };
    selectRange(drag.current.a, i);
  };
  const onGridUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) { tapAnchor.current = null; return; }
    // tap-tap : la première cellule touchée, puis la dernière
    if (tapAnchor.current != null && tapAnchor.current !== d.a && !L.editMode(lab) && !(lab.typing && !L.entered(lab))) {
      selectRange(tapAnchor.current, d.a);
      tapAnchor.current = null;
    } else tapAnchor.current = d.a;
  };
  const anchorKey = useRef(0);
  const onGridKey = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1, Home: -99, End: 99 }[e.key];
    if (step == null && e.key !== ' ') return;
    e.preventDefault();
    if (e.key === ' ') { anchorKey.current = cursor; selectRange(cursor, cursor); return; }
    const next = Math.max(0, Math.min(lab.n - 1, cursor + step));
    if (e.shiftKey) selectRange(anchorKey.current, next);
    else { anchorKey.current = next; selectRange(next, next); }
  };

  /* ── barre, cartes, ENTER ── */
  const barRef = useRef(null);
  const onEnter = () => setLab((s) => L.enter(s));
  const tgt = lab.barTarget;
  const nameBox = tgt.kind === 'cell' ? L.addr(tgt.i) : tgt.kind === 'row' ? `B${tgt.r + 2}` : '';
  const isEdit = L.editMode(lab);
  const inEntry = lab.typing && !L.entered(lab);
  const selSingle = lab.sel && lab.sel.a === lab.sel.b ? lab.sel.a : null;

  const rowsNow = lab.rows.map((_, r) => L.rowValue(lab, r));
  const bump = useBumps(rowsNow.map(L.cellText).join('|'));

  /* ── verdict ── */
  const indicator = (kind) => k(`kind_${kind}`);
  const verdict = (() => {
    const last = lab.last;
    if (!last) {
      if (inEntry) return { tone: 'muted', text: k('vStartEntry', { range: ISO(`A1:${L.addr(lab.n - 1)}`) }) };
      if (!isEdit) return { tone: 'muted', text: k('vStartRow', { cell: ISO(`C${lab.active + 2}`), b: ISO(`B${lab.active + 2}`), name: indicator(lab.rows[lab.active].kind) }) };
      return { tone: 'muted', text: k('vEditNow') };
    }
    switch (last.kind) {
      case 'refuse': return { tone: 'ko', text: k(`r_${last.reason}`, { name: ISO(last.name ?? ''), cell: ISO(`C${(last.row ?? lab.active) + 2}`) }) };
      case 'typed':
        if (last.done) return { tone: 'ok', text: k('vEntered', { range: ISO(`A1:${L.addr(lab.n - 1)}`) }) };
        return last.ok ? { tone: 'ok', text: k('vTyped', { cell: ISO(L.addr(last.i)), v: ISO(L.cellText(lab.values[last.i])) }) }
          : { tone: 'ko', text: k('vTypedWrong', { cell: ISO(L.addr(last.i)), k: last.i + 1 }) };
      case 'commit': {
        const o = { cell: ISO(`B${last.row + 2}`), v: ISO(last.value), h: ISO(last.hand), name: indicator(last.indicator), what: indicator(last.what), missing: ISO(last.missing.join(' ، ')) };
        if (last.status === 'ok') return { tone: 'ok', text: k(last.handOk ? 'vOk' : 'vOkHandWrong', o) };
        return { tone: 'ko', text: k(`v_${last.status}${last.handOk ? 'Same' : ''}`, o) };
      }
      case 'edit': return { tone: 'info', text: k('vEdit', { cell: ISO(last.cell), v: ISO(last.value) }) };
      case 'saved': return { tone: 'ok', text: k('vSaved', { file: ISO(fileName ?? k('defaultFile')) }) };
      case 'chart': return null;
      default: return null;
    }
  })();

  /* ── découverte ── */
  const hasMedian = lab.rows.some((r) => r.kind === 'median');
  const meanRow = lab.rows.findIndex((r) => r.kind === 'mean');
  const medRow = lab.rows.findIndex((r) => r.kind === 'median');
  const lastEdit = lab.edits[lab.edits.length - 1];
  const discoveryOptions = useMemo(() => {
    const now = (r) => L.cellText(L.rowValue(lab, r));
    const was = (r) => (lab.snapshot ? L.cellText(lab.snapshot[r]) : '');
    const opts = [{ text: k(hasMedian ? 'dRight' : 'dRightBeginner'), correct: true }];
    opts.push({ text: k('dHand'), why: k('dWhyHand', { c: ISO(`C${(meanRow >= 0 ? meanRow : 0) + 2}`), h: ISO(L.cellText(lab.rows[meanRow >= 0 ? meanRow : 0].hand)) }) });
    if (hasMedian && medRow >= 0) opts.push({ text: k('dMedianMoves'), why: k('dWhyMedian', { b: ISO(`B${medRow + 2}`), v: ISO(now(medRow)) }) });
    if (meanRow >= 0) opts.push({ text: k('dRetype'), why: k('dWhyRetype', { b: ISO(`B${meanRow + 2}`), was: ISO(was(meanRow)), v: ISO(now(meanRow)) }) });
    return opts;
  }, [lab, k, hasMedian, meanRow, medRow]);

  const chartsOpen = lab.stage === 'charts';
  const canCharts = lab.charts.length > 0 && L.allVerified(lab);

  /* ── rendu ── */
  const toneCls = { ok: 'text-emerald-800', ko: 'text-rose-800', info: 'text-sky-900', muted: 'text-slate-600' };
  const verdictLine = (
    <p role="status" className={`min-h-[2.25rem] font-bold leading-snug ${narrow ? 'text-xs' : 'text-sm'} ${toneCls[verdict?.tone] ?? ''}`} data-sh-verdict={lab.last?.kind === 'refuse' ? `refuse:${lab.last.reason}` : (lab.last?.status ?? lab.last?.kind ?? '')}>
      {verdict && <MathText>{verdict.text}</MathText>}
    </p>
  );

  const saveBtn = lab.typing && (
<button type="button" onClick={() => setLab((s) => L.save(s))} data-sh-save aria-label={k('saveAria')} disabled={!L.entered(lab)}
          className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:opacity-40 ${lab.saved ? 'border-sky-600 bg-sky-50 text-sky-700' : 'border-slate-300 bg-white text-slate-700'}`}>
          <Save className="h-4 w-4" aria-hidden="true" />
        </button>
  );

  const barRow = (
    <div className="flex items-center gap-1" dir="ltr">
      {!narrow && (
        <span className="inline-flex h-11 min-w-[2.6rem] items-center justify-center rounded-lg border border-slate-300 bg-slate-50 px-1 font-mono text-xs font-bold text-slate-700" data-sh-namebox>{nameBox || '—'}</span>
      )}
      {!narrow && <span className="font-mono text-sm italic text-slate-500" aria-hidden="true">fx</span>}
      <input ref={barRef} dir="ltr" type="text" spellCheck={false} autoComplete="off" autoCapitalize="characters"
        value={lab.bar} onChange={(e) => setLab((s) => L.setBar(s, e.target.value))}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } }}
        aria-label={k('barAria', { cell: nameBox || k('noCell') })} placeholder={tgt.kind === 'row' ? '=MOYENNE(A1:G1)' : ''}
        disabled={tgt.kind === 'none' && !isEdit}
        className="h-11 min-w-0 flex-1 rounded-lg border-2 border-slate-300 bg-white px-2 font-mono text-sm text-slate-900 focus:border-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:bg-slate-100"
        data-sh-bar />
      <button type="button" onClick={onEnter} data-sh-enter aria-label={k('enterAria')}
        className="inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-lg border-2 border-emerald-700 bg-emerald-700 px-2 font-mono text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
        <CornerDownLeft className="h-4 w-4" aria-hidden="true" />{!narrow && 'ENTER'}
      </button>
      {!narrow && saveBtn}
    </div>
  );

  const cards = narrow && lab.typing && !lab.saved ? (
    <div className="flex items-center gap-2" data-sh-saverow>
      {saveBtn}
      <span className="text-xs text-slate-600">{k('saveHelp')}</span>
    </div>
  ) : isEdit ? (
    <div className="flex flex-wrap items-center gap-2" data-sh-editrow>
      <div dir="ltr" className="flex items-center gap-1">
        <button type="button" onClick={() => selSingle != null && setLab((s) => L.nudge(s, selSingle, -1))} disabled={selSingle == null} aria-label={k('lessAria', { cell: selSingle != null ? L.addr(selSingle) : '' })} data-sh-less
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Minus className="h-5 w-5" aria-hidden="true" /></button>
        <span className="min-w-[4.5rem] rounded-lg bg-slate-900 px-2 py-2 text-center font-mono text-sm font-bold text-emerald-300">{selSingle != null ? `${L.addr(selSingle)} = ${L.cellText(lab.values[selSingle])}` : '—'}</span>
        <button type="button" onClick={() => selSingle != null && setLab((s) => L.nudge(s, selSingle, 1))} disabled={selSingle == null} aria-label={k('moreAria', { cell: selSingle != null ? L.addr(selSingle) : '' })} data-sh-more
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-300 bg-white disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Plus className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      {!narrow && <span className="text-xs text-slate-600">{k('editHelp')}</span>}
    </div>
  ) : (
    <div className={narrow ? 'grid grid-cols-2 gap-1' : 'flex flex-wrap gap-1'} dir="ltr" role="group" aria-label={k('cardsAria')} data-sh-cards>
      {lab.rows.map((row) => L.CARD_OF[row.kind]).map((card) => (
        <button key={card} type="button" onClick={() => setLab((s) => L.insertCard(s, card))} disabled={inEntry} data-sh-card={card}
          className="inline-flex h-11 items-center rounded-lg border-2 border-indigo-300 bg-white px-2 font-mono text-xs font-bold text-indigo-900 hover:border-indigo-600 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
          {narrow ? card : (card === 'MAX-MIN' ? '=MAX()-MIN()' : `=${card}()`)}
        </button>
      ))}
    </div>
  );

  const rowOne = (
    <div className="space-y-0.5">
      {!narrow && <p className="text-[11px] font-bold text-slate-600">{seriesLabel ?? k('seriesDefault')}</p>}
      <div role="grid" tabIndex={0} aria-label={k('gridAria', { range: `A1:${L.addr(lab.n - 1)}` })}
        aria-activedescendant={`sh-cell-${cursor}`} onKeyDown={onGridKey}
        onPointerDown={onGridDown} onPointerMove={onGridMove} onPointerUp={onGridUp} onPointerCancel={() => { drag.current = null; }}
        dir="ltr" className="grid gap-0.5 rounded-lg border border-slate-300 bg-slate-200 p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        style={{ gridTemplateColumns: `${narrow ? '' : `${ROWHEAD}px `}repeat(${per}, ${cellW}px)`, touchAction: 'none', width: 'max-content', maxWidth: '100%' }}
        data-sh-grid>
        {Array.from({ length: lab.n }, (_, i) => {
          const sel = lab.sel && i >= Math.min(lab.sel.a, lab.sel.b) && i <= Math.max(lab.sel.a, lab.sel.b);
          const wrong = L.mismatched(lab).includes(i);
          const v = lab.values[i];
          return (
            <React.Fragment key={i}>
              {i % per === 0 && !narrow && <span className="flex items-center justify-center font-mono text-[10px] text-slate-500" aria-hidden="true">1</span>}
              <div id={`sh-cell-${i}`} role="gridcell" aria-selected={sel ? 'true' : 'false'} aria-label={`${L.addr(i)} ${v == null ? k('empty') : L.cellText(v)}`}
                data-sh-cell={i} data-value={v == null ? '' : L.cellText(v)} data-wrong={wrong ? 'true' : undefined}
                className={`relative flex h-11 select-none flex-col items-center justify-center rounded-sm font-mono text-sm font-bold ${sel ? 'bg-emerald-100 ring-2 ring-inset ring-emerald-600' : 'bg-white'} ${wrong ? 'text-rose-700 ring-2 ring-inset ring-rose-500' : 'text-slate-900'} ${cursor === i ? 'outline outline-1 outline-slate-500' : ''}`}>
                <span className="absolute start-0.5 top-0 text-[9px] font-normal text-slate-400" aria-hidden="true">{L.addr(i)}</span>
                <span>{v == null ? '' : L.cellText(v)}</span>
                {cursor === i && <CursorDeco />}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  const indicatorTable = (
    <div role="table" dir="ltr" aria-label={k('rowsAria')} className="overflow-hidden rounded-lg border border-slate-300" data-sh-rows>
      <div role="row" className="grid bg-slate-100 text-[10px] font-bold text-slate-600" style={{ gridTemplateColumns: `${ROWHEAD}px 1.1fr 1fr 1fr` }}>
        <span role="columnheader" aria-hidden="true" />
        <span role="columnheader" className="px-1 py-0.5" dir="ltr">A</span>
        <span role="columnheader" className="px-1 py-0.5" dir="rtl"><span dir="ltr">B</span> {narrow ? '' : k('colB')}</span>
        <span role="columnheader" className="px-1 py-0.5" dir="rtl"><span dir="ltr">C</span> {k(narrow ? 'colCShort' : 'colC')}</span>
      </div>
      {lab.rows.map((row, r) => {
        const v = rowsNow[r];
        const active = tgt.kind === 'row' && tgt.r === r;
        const handBad = row.formula && row.status === 'ok' && !L.handMatches(row.hand, v);
        return (
          <div role="row" key={row.kind} className={`grid items-stretch border-t border-slate-200 ${active ? 'bg-emerald-50' : 'bg-white'}`} style={{ gridTemplateColumns: `${ROWHEAD}px 1.1fr 1fr 1fr` }}
            data-sh-row={r} data-kind={row.kind} data-status={row.status ?? ''}>
            <span role="cell" className="flex items-center justify-center font-mono text-[10px] text-slate-500">{r + 2}</span>
            <span role="cell" className="flex">
              <button type="button" onClick={() => setLab((s) => L.pickRow(s, r))} aria-pressed={active} disabled={isEdit}
                dir="rtl" className={`h-11 w-full px-1 text-start text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${active ? 'text-emerald-900' : 'text-slate-800'}`}>
                {indicator(row.kind)}
              </button>
            </span>
            <span role="cell" className="relative flex">
              <button type="button" onClick={() => setLab((s) => L.pickRow(s, r))} disabled={isEdit} data-sh-b={r} data-value={v == null ? '' : L.cellText(v)}
                aria-label={k('bAria', { cell: `B${r + 2}`, v: v == null ? k('empty') : L.cellText(v) })}
                className={`relative h-11 w-full px-1 font-mono text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${row.status === 'ok' ? 'text-emerald-800' : row.status ? 'text-rose-700' : 'text-slate-400'}`} dir="ltr">
                {v == null ? '' : L.cellText(v)}
                {row.status === 'ok' && <Check className="absolute end-0.5 top-0.5 h-3 w-3" aria-hidden="true" />}
                {row.status && row.status !== 'ok' && <X className="absolute end-0.5 top-0.5 h-3 w-3" aria-hidden="true" />}
                {isEdit && lab.snapshot && !sameText(lab.snapshot[r], v) && (
                  <span dir="rtl" className="absolute bottom-0 end-0.5 text-[9px] font-normal text-slate-500">{k('was', { v: L.cellText(lab.snapshot[r]) })}</span>
                )}
                {bump[r] > 0 && !reduce && <span key={bump[r]} className="pointer-events-none absolute inset-0 animate-ping rounded bg-emerald-300/40" aria-hidden="true" data-deco="ripple" />}
              </button>
            </span>
            <span role="cell" className="flex">
              <input dir="ltr" inputMode="decimal" value={row.handText} onChange={(e) => setLab((s) => L.setHand(s, r, e.target.value))}
                aria-label={k('handAria', { cell: `C${r + 2}`, name: indicator(row.kind) })} data-sh-hand={r} readOnly={isEdit}
                className={`h-11 w-full min-w-0 border-0 px-1 text-center font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 ${handBad ? 'bg-rose-50 text-rose-700' : 'bg-sky-50/60 text-slate-900'}`} />
            </span>
          </div>
        );
      })}
    </div>
  );

  const nextCard = canCharts && !chartsOpen && (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2 py-1" data-sh-next>
      <span className={narrow ? 'sr-only' : 'text-xs font-bold text-emerald-900'}>{k('nextText')}</span>
      <button type="button" onClick={() => setLab((s) => L.openCharts(s))}
        className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border-2 border-emerald-700 bg-emerald-700 px-2 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
        {k('toCharts')} <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );

  // les étapes lisibles : chacune est FAITE quand ses questions sont répondues ; on fête chacune une fois (réarmées après « إعادة »)
  const stepDone = steps.map((st) => (cpActive ? doneIds.has(st.id) : st.reached));
  const stepper = <LabStepper count={steps.length} current={stepDone.includes(false) ? stepDone.indexOf(false) : steps.length - 1} done={stepDone} stepAttr="data-sh-step" />;
  const party = useStepCelebration();
  const celebrated = useRef({ inits, set: new Set() });
  if (celebrated.current.inits !== inits) celebrated.current = { inits, set: new Set() };
  const doneKey = stepDone.join('');
  useEffect(() => {
    stepDone.forEach((d, i) => {
      if (!d || celebrated.current.set.has(i)) return;
      celebrated.current.set.add(i);
      party.celebrate({ n: i + 1, total: steps.length });
    });
  }, [doneKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sheetGlance = (
    <div className="space-y-2" data-sh-glance>
      {stepper}
      <ScreenFrame file={lab.saved ? (fileName ?? k('defaultFile')) : null} sheetName={k('sheetName')}>
        <div className={compact ? 'space-y-1 p-1.5' : 'space-y-2 p-1.5'}>
          {barRow}
          {cards}
          {rowOne}
          {indicatorTable}
        </div>
      </ScreenFrame>
      {verdictLine}
    </div>
  );

  return (
    <ManipulationShell
      type="sheet-lab"
      title={title ?? k(chart ? 'titleAdvanced' : 'title')}
      mission={mission ?? k(chartsOpen ? 'missionCharts' : (inEntry ? 'missionEntry' : 'mission'))}
      lead={lead}
      state={state}
      allowModeSwitch={allowModeSwitch}
      allowFreeLab={false}
      headerAction={cpOn ? cpSettings.control : null}
      guided={cpActive}
      hints={[k(inEntry ? 'hint1Entry' : 'hint1'), k('hint2'), k(hasMedian ? 'hint3' : 'hint3Beginner')].map((h) => <MathText key={h}>{h}</MathText>)}
      controller={{ autoStep: () => false, canAutoStep: () => false }}
      discovery={!chartsOpen && (
        <ManipulationDiscovery
          state={state}
          prompt={k('dPrompt', { cell: ISO(lastEdit?.cell ?? '') })}
          options={discoveryOptions}
          formal={(state.isFormal || state.isDiscovered) && (
            <div className="space-y-2" data-sh-formal>
              <ul className="space-y-1">
                {lab.rows.map((row, r) => (
                  <li key={row.kind} className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-sm">
                    <span className="font-bold text-emerald-900">{indicator(row.kind)}</span>
                    <code dir="ltr" className="font-mono text-slate-900">{`B${r + 2}  ${row.formula?.text ?? ''}`}</code>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-emerald-900"><MathText>{k(hasMedian ? 'fRule' : 'fRuleBeginner')}</MathText></p>
            </div>
          )}
        />
      )}
      explanation={<MathText>{k('explanation')}</MathText>}
    >
      <ManipulationStage className="bg-gradient-to-b from-slate-50 to-white">
        <div ref={boxRef} className="space-y-2" data-sheet-lab data-stage={lab.stage} data-entered={L.entered(lab) ? 'true' : 'false'}
          data-verified={L.verifiedCount(lab)} data-layout={wide ? 'wide' : narrow ? 'narrow' : 'stack'} data-per-row={per} data-world={theme}>
          {chartsOpen
            ? <ChartStage lab={lab} setLab={setLab} k={k} narrow={narrow} width={width} screenH={screenH} />
            : <>
              <div className="relative">{party.node}{cp.node}{sheetGlance}</div>
              {nextCard}
            </>}
          {!chartsOpen && (
            <LabFold id="sheet-lab.trials" title={k('trialsTitle')}>
              <Trials lab={lab} k={k} indicator={indicator} />
            </LabFold>
          )}
        </div>
      </ManipulationStage>
    </ManipulationShell>
  );
}

const sameText = (a, b) => L.cellText(a) === L.cellText(b);

/** Un compteur par ligne B qui monte quand sa valeur affichée change (le pli de recalcul, visible 700 ms). */
function useBumps(signature) {
  const prev = useRef(signature);
  const [bumps, setBumps] = useState([]);
  useEffect(() => {
    if (prev.current === signature) return undefined;
    const a = prev.current.split('|'); const b = signature.split('|');
    prev.current = signature;
    setBumps(b.map((v, i) => (a[i] !== v && a[i] !== '' ? Date.now() + i : 0)));
    const id = setTimeout(() => setBumps([]), 700);
    return () => clearTimeout(id);
  }, [signature]);
  return bumps;
}

/** Le décor : l'écran de la salle d'informatique (cadre, barre de titre, voyants). */
function ScreenFrame({ children, file, sheetName }) {
  return (
    <div className="overflow-hidden rounded-xl border-4 border-slate-700 bg-white shadow-sm">
      <div className="flex items-center gap-1 bg-emerald-700 px-2 py-0.5 text-[10px] text-white" aria-hidden="true" data-deco="screen">
        <span className="h-2 w-2 rounded-full bg-rose-300" /><span className="h-2 w-2 rounded-full bg-amber-300" /><span className="h-2 w-2 rounded-full bg-emerald-200" />
        <span className="ms-2 truncate font-bold">{sheetName}</span>
        {file && <span className="ms-auto truncate font-mono" dir="ltr">{file}</span>}
      </div>
      {children}
    </div>
  );
}

/** Le curseur de souris sur la cellule active (décor). */
function CursorDeco() {
  return (
    <svg className="pointer-events-none absolute -bottom-1 end-0 h-3.5 w-3.5" viewBox="0 0 12 12" aria-hidden="true" focusable="false" data-deco="cursor">
      <path d="M1 1 L1 10 L3.6 7.6 L5.4 11 L7 10.2 L5.3 6.9 L8.8 6.9 Z" fill="#fff" stroke="#0f172a" strokeWidth="0.9" strokeLinejoin="round" />
    </svg>
  );
}

/** L'historique des دساتير validés (LabFold). */
function Trials({ lab, k, indicator }) {
  if (!lab.trials.length) return <p className="text-xs text-slate-500">{k('noTrials')}</p>;
  return (
    <ul className="space-y-1 text-xs" data-sh-trials>
      {lab.trials.slice(-8).map((tr, i) => (
        <li key={i} className="flex flex-wrap items-center gap-2">
          <span className={tr.status === 'ok' ? 'text-emerald-700' : 'text-rose-700'}>{tr.status === 'ok' ? '✓' : '✗'}</span>
          <span className="font-bold">{indicator(tr.indicator)}</span>
          <code dir="ltr" className="font-mono">{tr.formula}</code>
          <span>→ <bdi dir="ltr" className="font-mono">{tr.value}</bdi></span>
          <span className="text-slate-500">{k('handShort')} <bdi dir="ltr" className="font-mono">{tr.hand}</bdi></span>
        </li>
      ))}
    </ul>
  );
}

/* ── l'étape « graphique » ─────────────────────────────────────────────── */
function ChartStage({ lab, setLab, k, narrow, width, screenH }) {
  const c = lab.charts[lab.chartAt];
  const ds = L.datasetOf(lab, c.id);
  const kCount = ds.values.length;
  const drawn = L.drawnData(lab);
  const drag = useRef(null);
  const [cur, setCur] = useState({ r: 0, c: 0 });
  const anchor = useRef({ r: 0, c: 0 });
  const tapA = useRef(null);
  const sel = (a, b) => { setCur(b); setLab((s) => L.chartSelect(s, { r0: a.r, r1: b.r, c0: a.c, c1: b.c })); };
  const at = (el) => {
    const v = el?.closest?.('[data-sh-mcell]')?.getAttribute('data-sh-mcell');
    if (!v) return null;
    const [r, cc] = v.split('-').map(Number);
    return { r, c: cc };
  };
  const down = (e) => {
    const p = at(e.target);
    if (!p) return;
    e.preventDefault();
    drag.current = { a: p, b: p, moved: false };
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* facultatif */ }
    sel(p, p);
  };
  const move = (e) => {
    if (!drag.current) return;
    const p = at(typeof document !== 'undefined' ? document.elementFromPoint(e.clientX, e.clientY) : null);
    if (!p || (p.r === drag.current.b.r && p.c === drag.current.b.c)) return;
    drag.current = { ...drag.current, b: p, moved: true };
    sel(drag.current.a, p);
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.moved) { tapA.current = null; return; }
    if (tapA.current && (tapA.current.r !== d.a.r || tapA.current.c !== d.a.c)) { sel(tapA.current, d.a); tapA.current = null; } else tapA.current = d.a;
  };
  const key = (e) => {
    const mv = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
    if (!mv) return;
    e.preventDefault();
    const n = { r: Math.max(0, Math.min(1, cur.r + mv[0])), c: Math.max(0, Math.min(kCount - 1, cur.c + mv[1])) };
    if (e.shiftKey) sel(anchor.current, n); else { anchor.current = n; sel(n, n); }
  };
  const colW = Math.max(44, Math.min(120, Math.floor((width - (narrow ? 12 : 34) - kCount * 3) / kCount)));
  const v = c.verdict;
  const reasonText = v && (v.ok
    ? k(`ok_${c.id}`)
    : v.reason === 'partial'
      ? k(`partial_${c.id === 'pie' ? 'pie' : 'cols'}`, { missing: v.missing.join(' ، '), total: drawn ? L.cellText(drawn.total) : '', whole: L.cellText(ds.values.reduce((a, x) => Lin.add(a, x), Lin.frac(0))) })
      : k(`c_${v.reason}`));
  const chartH = narrow ? 100 : Math.max(120, Math.min(190, screenH - 420));

  return (
    <div className="space-y-2" data-sh-glance>
      <div className={`flex items-center ${narrow ? 'gap-0.5' : 'flex-wrap gap-1'}`}>
        <button type="button" onClick={() => setLab((s) => L.backToSheet(s))} data-sh-back aria-label={k('backAria')}
          className="inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2 text-xs font-bold text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
          <ArrowRight className="h-4 w-4" aria-hidden="true" />{!narrow && k('back')}
        </button>
        {lab.charts.map((ch, i) => (
          <button key={ch.id} type="button" onClick={() => setLab((s) => L.pickDataset(s, i))} aria-pressed={i === lab.chartAt} data-sh-dataset={ch.id} data-done={ch.done ? 'true' : 'false'}
            title={k(`ds_${ch.id}`)} aria-label={narrow ? k(`ds_${ch.id}`) : undefined}
            className={`inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 px-2 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${i === lab.chartAt ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
            <span aria-hidden={narrow ? 'true' : undefined}>{i + 1}{narrow ? '' : '.'}</span>{!narrow && <> {k(`dsShort_${ch.id}`)}</>}
            {ch.done && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        ))}
      </div>
      <p className={`${narrow ? 'text-[11px] leading-tight' : 'text-sm'} font-semibold text-slate-800`}><MathText>{k(`ds_${c.id}`)}</MathText></p>
      <ScreenFrame sheetName={k('sheetName')}>
        <div className="p-1.5">
          <div role="grid" tabIndex={0} aria-label={k('mgridAria')} onKeyDown={key} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { drag.current = null; }}
            dir="ltr" className="grid gap-0.5 rounded-lg border border-slate-300 bg-slate-200 p-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            style={{ gridTemplateColumns: `${narrow ? '' : '22px '}repeat(${kCount}, ${colW}px)`, touchAction: 'none', width: 'max-content', maxWidth: '100%' }} data-sh-mgrid>
            {[0, 1].map((r) => (
              <React.Fragment key={r}>
                {!narrow && <span className="flex items-center justify-center font-mono text-[10px] text-slate-500" aria-hidden="true">{r + 1}</span>}
                {ds.values.map((val, cc) => {
                  const s = c.sel;
                  const on = s && r >= s.r0 && r <= s.r1 && cc >= s.c0 && cc <= s.c1;
                  const text = r === 0 ? ds.labels[cc] : L.cellText(val);
                  return (
                    <div key={cc} role="gridcell" aria-selected={on ? 'true' : 'false'} data-sh-mcell={`${r}-${cc}`} aria-label={`${L.COLS[cc]}${r + 1} ${text}`}
                      className={`relative flex h-11 select-none items-center justify-center rounded-sm px-0.5 text-center ${narrow ? "text-[11px]" : "text-xs"} font-bold ${r === 0 ? '' : 'font-mono'} ${on ? 'bg-emerald-100 ring-2 ring-inset ring-emerald-600' : 'bg-white'} ${cur.r === r && cur.c === cc ? 'outline outline-1 outline-slate-500' : ''}`}>
                      <span className="absolute start-0.5 top-0 font-mono text-[9px] font-normal text-slate-400" aria-hidden="true">{`${L.COLS[cc]}${r + 1}`}</span>
                      <span dir={r === 0 ? 'rtl' : 'ltr'} className="leading-tight">{text}</span>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </ScreenFrame>
      <div className="flex flex-wrap gap-1" role="group" aria-label={k('chartsAria')}>
        {['bars', 'pie', 'histogram'].map((kind) => (
          <button key={kind} type="button" onClick={() => setLab((s) => L.chooseChart(s, kind))} aria-pressed={c.choice === kind} data-sh-chart={kind} aria-label={k(`chart_${kind}`)} title={k(`chart_${kind}`)}
            className={`inline-flex h-11 min-w-[44px] items-center justify-center gap-1 rounded-xl border-2 px-2 text-xs font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${c.choice === kind ? (v?.ok ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-rose-400 bg-rose-50 text-rose-800') : 'border-slate-300 bg-white text-slate-800'}`}>
            <ChartIcon kind={kind} />{!narrow && <> {k(`chart_${kind}`)}</>}
          </button>
        ))}
      </div>
      {drawn && <DrawnChart data={drawn} ok={!!v?.ok} height={chartH} width={Math.min(width, 520)} k={k} />}
      <p role="status" className={`min-h-[2.25rem] font-bold leading-snug ${narrow ? 'text-xs' : 'text-sm'} ${v ? (v.ok ? 'text-emerald-800' : 'text-rose-800') : 'text-slate-600'}`} data-sh-verdict={v ? (v.ok ? 'chart-ok' : `chart:${v.reason}`) : ''}>
        <MathText>{reasonText ?? k('chartStart')}</MathText>
      </p>
      {L.chartsDone(lab) && <p className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-2 py-1 text-sm font-bold text-emerald-900" data-sh-charts-done>{k('chartsDone')}</p>}
    </div>
  );
}

function ChartIcon({ kind }) {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true" focusable="false">
      {kind === 'bars' && <><rect x="2" y="7" width="2.5" height="7" fill="currentColor" /><rect x="7" y="3" width="2.5" height="11" fill="currentColor" /><rect x="12" y="9" width="2.5" height="5" fill="currentColor" /></>}
      {kind === 'pie' && <><circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="M8 8 L8 2 A6 6 0 0 1 13.2 11 Z" fill="currentColor" /></>}
      {kind === 'histogram' && <><rect x="1.5" y="5" width="4.3" height="9" fill="currentColor" /><rect x="5.8" y="10" width="4.3" height="4" fill="currentColor" opacity="0.7" /><rect x="10.1" y="7" width="4.3" height="7" fill="currentColor" /></>}
    </svg>
  );
}

const PIE_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6'];

/** Le graphique que le tableur dessine À PARTIR DE LA SÉLECTION (juste ou faux). */
function DrawnChart({ data, ok, height, width, k }) {
  const W = Math.max(180, width - 8);
  const H = height;
  const stroke = ok ? '#047857' : '#e11d48';
  if (data.id === 'pie') {
    const r = Math.max(28, Math.min(H / 2 - 6, 70, Math.floor((W - 100) / 2) - 8));
    const cx = r + 8; const cy = H / 2;
    let acc = -90;
    return (
      <div className="flex items-center gap-2" data-sh-drawn="pie" data-ok={ok ? 'true' : 'false'}>
        <svg width={2 * r + 16} height={H} role="img" aria-label={k('pieAria')}>
          {data.angles.map((a, i) => {
            const deg = Lin.toNumber(a);
            const s = acc; acc += deg;
            const p = (d) => [cx + r * Math.cos((d * Math.PI) / 180), cy + r * Math.sin((d * Math.PI) / 180)];
            const [x1, y1] = p(s); const [x2, y2] = p(acc);
            const large = deg > 180 ? 1 : 0;
            return deg >= 359.999
              ? <circle key={i} cx={cx} cy={cy} r={r} fill={PIE_COLORS[i]} stroke="#fff" />
              : <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth="1.5" />;
          })}
          {!ok && <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth="2" strokeDasharray="4 3" />}
        </svg>
        <ul className="space-y-0.5 text-[11px] leading-tight">
          {data.labels.map((lab, i) => (
            <li key={i} className="flex items-center gap-1" data-sh-angle={L.cellText(data.angles[i])}>
              <span className="inline-block h-3 w-3 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} aria-hidden="true" />
              <span>{lab}</span> <bdi dir="ltr" className="font-mono font-bold">{`${L.cellText(data.angles[i])}°`}</bdi>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  const max = L.niceMax(data.values);
  const padL = 26; const padB = 30; const top = 8;
  const innerW = W - padL - 6; const innerH = H - padB - top;
  const n = data.values.length;
  const hist = data.id === 'histogram';
  const slot = innerW / Math.max(1, n);
  const barW = hist ? slot : Math.min(34, slot * 0.5);
  const y = (v) => top + innerH - (Lin.toNumber(v) / max) * innerH;
  const ticks = [0, max / 2, max];
  return (
    <svg width={W} height={H} role="img" aria-label={k(hist ? 'histAria' : 'barsAria')} data-sh-drawn={data.id} data-ok={ok ? 'true' : 'false'} dir="ltr">
      {ticks.map((tv) => (
        <g key={tv}>
          <line x1={padL} x2={W - 4} y1={y(Lin.frac(tv))} y2={y(Lin.frac(tv))} stroke="#e2e8f0" />
          <text x={padL - 4} y={y(Lin.frac(tv)) + 3} fontSize="9" textAnchor="end" fill="#64748b">{tv}</text>
        </g>
      ))}
      <line x1={padL} x2={W - 4} y1={top + innerH} y2={top + innerH} stroke="#334155" />
      {data.values.map((v, i) => {
        const x = padL + i * slot + (slot - barW) / 2;
        return (
          <g key={i}>
            <rect x={x} y={y(v)} width={barW} height={top + innerH - y(v)} fill={ok ? '#10b981' : '#fda4af'} stroke={stroke} strokeWidth="1" />
            <text x={x + barW / 2} y={y(v) - 2} fontSize="9" textAnchor="middle" fill="#0f172a">{L.cellText(v)}</text>
            {!hist && <text x={x + barW / 2} y={top + innerH + 12} fontSize="9" textAnchor="middle" fill="#334155">{data.labels[i]}</text>}
          </g>
        );
      })}
      {hist && data.classes && [...data.classes.map((cl) => cl.lo), data.classes[data.classes.length - 1].hi].map((b, i) => (
        <text key={i} x={padL + i * slot} y={top + innerH + 12} fontSize="9" textAnchor="middle" fill="#334155">{L.cellText(b)}</text>
      ))}
    </svg>
  );
}

/* ══════════════ Les questions pendant le labo (primitives/LabCheckpoint) ══════════════ */

export const ENTRY_CHAIN = Object.freeze(['cells', 'range']);
export const ROW_CHAIN = Object.freeze(['miss', 'follow']);
export const EDIT_CHAIN = Object.freeze(['howMany', 'rule']);
/** La suite de questions d'une étape (`entry` · `row<r>` · `edit`). */
export const chainOf = (id) => (id === 'entry' ? ENTRY_CHAIN : id === 'edit' ? EDIT_CHAIN : ROW_CHAIN);

/** « أعِد التجربة » : l'étape `id` recommence. */
function retryStep(s, id, make) {
  if (id === 'entry') return make();
  if (id === 'edit') {
    const base = { ...s, values: s.target.slice(), edits: [], contrast: false, recalc: false, last: null };
    return { ...base, snapshot: s.rows.map((_, r) => L.rowValue(base, r)), bar: '', barTarget: { kind: 'none' } };
  }
  const r = Number(id.slice(3));
  return {
    ...s, last: null, active: r, barTarget: { kind: 'row', r }, bar: '',
    rows: s.rows.map((row, i) => (i === r ? { ...row, formula: null, status: null, hand: null, handText: '' } : row)),
  };
}

const code = (t) => <code dir="ltr" className="font-mono">{t}</code>;
const Mx = (k, key, o) => <MathText>{k(`cp.${key}`, o)}</MathText>;

/** Chaque question est construite sur LES cellules et LES دساتير de l'élève (rien en dur) ; `k` : les textes de `sheetLab`. */
export const QUESTIONS = {
  cells: (lab, k) => {
    const o = { n: lab.n, range: ISO(`A1:${L.addr(lab.n - 1)}`) };
    return {
      id: 'cells', kind: 'number', expected: String(lab.n), answer: <MathText>{`$${lab.n}$`}</MathText>,
      prompt: Mx(k, 'cells.prompt', o), hints: [Mx(k, 'cells.hint1', o), Mx(k, 'cells.hint2', o)],
      explain: Mx(k, 'cells.explain', o),
    };
  },
  range: (lab, k) => {
    const last = L.addr(lab.n - 1);
    const o = { first: 'A1', last, dash: ISO(`A1-${last}`), slash: ISO(`A1/${last}`), good: ISO(`A1:${last}`) };
    return {
      id: 'range', kind: 'choice',
      prompt: Mx(k, 'range.prompt', o),
      options: [
        { text: code(`A1-${last}`), why: Mx(k, 'range.whyDash', o) },
        { text: code(`A1:${last}`), correct: true },
        { text: code(`A1/${last}`), why: Mx(k, 'range.whySlash', o) },
      ],
      hints: [Mx(k, 'range.hint1', o), Mx(k, 'range.hint2', o)],
      explain: Mx(k, 'range.explain', o),
    };
  },
  miss: (lab, k, { r }) => {
    const row = lab.rows[r];
    const full = L.truth(row.kind, lab.values);
    const same = (x, y) => (x?.error || y?.error ? x?.error === y?.error : L.cellText(x) === L.cellText(y));
    // la cellule oubliée : la dernière, sinon la première — celle qui fait changer le résultat quand l'une des deux le fait
    const lastI = lab.n - 1;
    const cands = [
      { i: lastI, vals: lab.values.slice(0, -1), range: `A1:${L.addr(lab.n - 2)}` },
      { i: 0, vals: lab.values.slice(1), range: `B1:${L.addr(lastI)}` },
    ];
    const pick = cands.find((c) => !same(full, L.truth(row.kind, c.vals))) ?? cands[0];
    const cut = L.truth(row.kind, pick.vals);
    const changes = !same(full, cut);
    const o = { name: k(`kind_${row.kind}`), last: L.addr(pick.i), v: ISO(L.cellText(lab.values[pick.i])), a: ISO(L.cellText(full)), b: ISO(L.cellText(cut)), range: ISO(pick.range) };
    return {
      id: 'miss', kind: 'choice',
      prompt: Mx(k, 'miss.prompt', o),
      options: [
        { text: Mx(k, 'miss.changes', o), ...(changes ? { correct: true } : { why: Mx(k, 'miss.whyChanges', o) }) },
        { text: Mx(k, 'miss.same', o), ...(changes ? { why: Mx(k, 'miss.whySame', o) } : { correct: true }) },
        { text: Mx(k, 'miss.error', o), why: Mx(k, 'miss.whyError', o) },
      ],
      hints: [Mx(k, 'miss.hint1', o), Mx(k, 'miss.hint2', o)],
      explain: Mx(k, changes ? 'miss.explainChanges' : 'miss.explainSame', o),
    };
  },
  follow: (lab, k, { r }) => {
    const o = { b: ISO(`B${r + 2}`), c: ISO(`C${r + 2}`), name: k(`kind_${lab.rows[r].kind}`) };
    return {
      id: 'follow', kind: 'choice',
      prompt: Mx(k, 'follow.prompt', o),
      options: [
        { text: Mx(k, 'follow.c', o), why: Mx(k, 'follow.whyC', o) },
        { text: Mx(k, 'follow.b', o), correct: true },
        { text: Mx(k, 'follow.both', o), why: Mx(k, 'follow.whyBoth', o) },
      ],
      hints: [Mx(k, 'follow.hint1', o), Mx(k, 'follow.hint2', o)],
      explain: Mx(k, 'follow.explain', o),
    };
  },
  howMany: (lab, k) => {
    const same = (x, y) => (x?.error || y?.error ? x?.error === y?.error : L.cellText(x) === L.cellText(y));
    const movers = lab.rows.filter((_, r) => !same(L.rowValue(lab, r), lab.snapshot[r])).length;
    const ed = lab.edits[lab.edits.length - 1];
    const o = { cell: ISO(ed?.cell ?? ''), v: ISO(ed?.value ?? ''), n: lab.rows.length, movers };
    return {
      id: 'howMany', kind: 'number', expected: String(movers), answer: <MathText>{`$${movers}$`}</MathText>,
      prompt: Mx(k, 'howMany.prompt', o), hints: [Mx(k, 'howMany.hint1', o), Mx(k, 'howMany.hint2', o)],
      explain: Mx(k, 'howMany.explain', o),
    };
  },
  rule: (lab, k) => {
    const hasMedian = lab.rows.some((r) => r.kind === 'median');
    const meanRow = lab.rows.findIndex((r) => r.kind === 'mean');
    const medRow = lab.rows.findIndex((r) => r.kind === 'median');
    const lastEdit = lab.edits[lab.edits.length - 1];
    const now = (r) => L.cellText(L.rowValue(lab, r));
    const was = (r) => (lab.snapshot ? L.cellText(lab.snapshot[r]) : '');
    const opts = [{ text: k(hasMedian ? 'dRight' : 'dRightBeginner'), correct: true }];
    opts.push({ text: k('dHand'), why: k('dWhyHand', { c: ISO(`C${(meanRow >= 0 ? meanRow : 0) + 2}`), h: ISO(L.cellText(lab.rows[meanRow >= 0 ? meanRow : 0].hand)) }) });
    if (hasMedian && medRow >= 0) opts.push({ text: k('dMedianMoves'), why: k('dWhyMedian', { b: ISO(`B${medRow + 2}`), v: ISO(now(medRow)) }) });
    if (meanRow >= 0) opts.push({ text: k('dRetype'), why: k('dWhyRetype', { b: ISO(`B${meanRow + 2}`), was: ISO(was(meanRow)), v: ISO(now(meanRow)) }) });
    return {
      id: 'rule', kind: 'choice',
      prompt: <MathText>{k('dPrompt', { cell: ISO(lastEdit?.cell ?? '') })}</MathText>,
      options: opts.map((o) => ({ ...o, text: <MathText>{o.text}</MathText>, ...(o.why ? { why: <MathText>{o.why}</MathText> } : {}) })),
      hints: [Mx(k, 'rule.hint1', {}), Mx(k, 'rule.hint2', {})],
      explain: <MathText>{k(hasMedian ? 'fRule' : 'fRuleBeginner')}</MathText>,
    };
  },
};
