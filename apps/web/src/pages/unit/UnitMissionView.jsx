import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getLessonProgress } from '../../lessons/common/utils/progress/getLessonProgress';
import { getTotalModules } from '../../lessons/registry';
import { useLessonConfig } from '../../lessons/useLessonConfig';
import { useContentAvailability } from '../../context/ContentAvailabilityContext';
import { scopedStorage } from '../../utils/storage';
import { readStars, totalStars } from '../../lessons/common/manipulations/rounds/roundsModel';
import MathLabel from '../../lessons/common/components/MathLabel';
import MissionDialog from '../../lessons/common/mission/MissionDialog';
import PrerequisiteLessonChips from '../../lessons/common/components/PrerequisiteLessonChips';
import ReviseFirst from '../../lessons/common/mission/ReviseFirst';
import { unitState, unmetPrerequisites } from './unitMissions';

/**
 * LA PAGE D'UNE UNITÉ, REGARD ÉLÈVE (propriétaire, 2026-11-09 — maquette validée docs/experiments/unit-home-mockup-2026-11-09.html, puis
 * fenêtre centrée décidée par le conseil). UN ÉCRAN, aucun défilement (règle du lecteur de mission) :
 *   1. « درسك الآن » — UNE chose à faire : la leçon en cours, son nom de mission, sa progression, UN grand « واصل الدرس » ;
 *   2. le défi de l'unité, reformulé par la plateforme (unitMissions.js), et ses « مفاتيح الحلّ » gagnés leçon après leçon ;
 *   3. le chemin de l'unité : une station par leçon (✓ + étoiles, « أنت هنا », ⏱), puis le drapeau du défi ;
 *   4. le reste de l'ancienne page, REPLIÉ (jamais supprimé) : des pastilles qui ouvrent la même fenêtre.
 * La fenêtre (MissionDialog `card`, 760 px, titre centré) : une ligne d'infos, 3 objectifs, « المزيد » pour le reste (objectifs, outils, prérequis), un
 * prérequis NON fait montré d'emblée (« راجع أولًا »), un seul grand bouton. Elle est pensée pour ne pas défiler (e2e/unit-mission-view.mjs).
 * La page s’AGRANDIT pour remplir l’écran (jamais au-delà de ×1,6), ou se réduit un peu (jamais sous ×0,72) : `useFitZoom`.
 * Aucune référence au manuel n'est montrée à l'élève (indépendance du manuel).
 */
const MIN_ZOOM = 0.72;
const MAX_ZOOM = 1.6;
/** La largeur de dessin de la page, et jusqu'où elle s'élargit quand c'est la hauteur qui limite. */
const BASE_WIDTH = 1000;
const MAX_WIDTH = 1500;
const MIN_WIDTH = 720;

/** La page garde sa taille naturelle puis remplit la place qui reste sous la barre de l'application (le même principe que FitToArea). */
function useFitZoom(deps) {
  const area = useRef(null);
  const box = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(1000);
  const fit = useCallback(() => {
    const a = area.current; const b = box.current;
    if (!a || !b) return;
    b.style.zoom = '1';
    // la page est TOUJOURS dessinée à BASE_WIDTH au moins (un texte se coupe de la même façon partout), puis mise à l'échelle de l'écran
    const top = a.getBoundingClientRect().top;
    const h = window.innerHeight - Math.max(0, top) - 28;
    const w = a.clientWidth;
    // une place trop étroite (tablette, barre latérale ouverte) : la page se dessine plus étroite pour tenir à MIN_ZOOM, jamais coupée
    b.style.width = `${Math.min(BASE_WIDTH, Math.floor(w / MIN_ZOOM))}px`;
    let z = Math.min(w / b.offsetWidth, h / b.offsetHeight);
    // la HAUTEUR limite (écran large et bas) : la page s'ÉLARGIT pour remplir aussi la largeur — pas de grandes marges vides à gauche et à
    // droite (propriétaire, 2026-11-09) ; deux passes suffisent (un texte plus large raccourcit un peu la page)
    for (let i = 0; i < 2 && w / z > b.offsetWidth + 24 && b.offsetWidth < MAX_WIDTH; i += 1) {
      b.style.width = `${Math.min(MAX_WIDTH, Math.floor(w / z))}px`;
      z = Math.min(w / b.offsetWidth, h / b.offsetHeight);
    }
    // la LARGEUR limite et la hauteur a de la place (tablette, barre latérale ouverte) : la page se dessine plus ÉTROITE (jusqu'à
    // MIN_WIDTH) tant que cela la grandit — le texte reste lisible au lieu d'une page minuscule avec du vide dessous
    for (let i = 0; i < 6 && h / b.offsetHeight > w / b.offsetWidth + 0.04 && b.offsetWidth > MIN_WIDTH; i += 1) {
      b.style.width = `${Math.max(MIN_WIDTH, Math.floor(b.offsetWidth * 0.92))}px`;
      z = Math.min(w / b.offsetWidth, h / b.offsetHeight);
    }
    z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z));
    const next = Math.floor(z * 100) / 100;
    b.style.zoom = String(next);
    setZoom(next);
    setWidth(b.offsetWidth);
  }, []);
  useLayoutEffect(() => {
    fit();
    window.addEventListener('resize', fit);
    // les polices arabes et les configs des leçons (outils de la mission) arrivent APRÈS le premier rendu : on refait la mesure quand le
    // contenu change de taille naturelle (un seul passage par image ; la même taille ne relance rien)
    document.fonts?.ready?.then(fit).catch(() => {});
    let raf = 0; let last = '';
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const b = box.current; if (!b) return;
        const z = Number(b.style.zoom) || 1;
        const key = `${Math.round(b.offsetHeight * z)}|${window.innerHeight}`;
        if (key !== last) { last = key; fit(); }
      });
    });
    if (ro && box.current) ro.observe(box.current);
    return () => { window.removeEventListener('resize', fit); ro?.disconnect(); cancelAnimationFrame(raf); };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { area, box, zoom, width };
}

const nb = (a, b) => `${a} / ${b}`;

/**
 * Un objectif du catalogue écrit ses formules en clair (« PGCD (a ; b) = b », « a = b × q ») au milieu d'une phrase arabe : sans
 * isolement, l'algorithme bidi retourne les parenthèses. Chaque passage latin devient un îlot LTR insécable ; un texte avec `$…$` garde MathLabel.
 */
const LATIN_RUN = /([A-Za-z(][A-Za-z0-9 ;()=×−+.]*[A-Za-z0-9)])/g;
function Bidi({ text }) {
  const s = String(text ?? '');
  if (s.includes('$')) return <MathLabel>{s}</MathLabel>;
  return s.split(LATIN_RUN).map((part, i) => (i % 2 === 1
    ? <bdi key={i} dir="ltr" className="whitespace-nowrap">{part}</bdi>
    : <React.Fragment key={i}>{part}</React.Fragment>));
}

/** Le nombre de la phrase en pastille ambre ; le reste reste du texte (MathLabel lit les formules). */
function Highlighted({ text, numbers }) {
  if (!numbers?.length) return <MathLabel>{text}</MathLabel>;
  const re = new RegExp(`(${numbers.map(String).join('|')})`, 'g');
  return text.split(re).map((part, i) => (numbers.map(String).includes(part)
    ? <bdi key={i} dir="ltr" className="mx-0.5 rounded-lg bg-amber-200 px-2 font-black text-amber-900">{part}</bdi>
    : <React.Fragment key={i}>{part}</React.Fragment>));
}

/** La carte « درسك الآن » : elle lit la config de la leçon (nom de mission, outils) quand elle est chargée. */
function NowCard({ lesson, n, total, icon, progress, first, compact, t, onDetails }) {
  const config = useLessonConfig(lesson.id);
  const tools = config?.mission?.tools ?? [];
  return (
    <article className={`relative grid ${compact ? 'grid-cols-1' : 'grid-cols-[minmax(0,1fr)_8.5rem]'} gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm`} data-unit-now={lesson.id}>
      <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-violet-600 to-indigo-600" aria-hidden="true" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-sm font-black text-nav-accent">
          {first ? t('unit.mission.startTag') : t('unit.mission.nowTag')}
          <span className="rounded-full bg-amber-50 px-2.5 text-amber-800">{t('unit.mission.lessonOf', { n, total })} · {t('unit.mission.minutes', { n: lesson.durationMinutes })}</span>
        </div>
        <h2 className="mt-1.5 text-2xl font-black leading-snug text-slate-900"><MathLabel>{lesson.title}</MathLabel></h2>
        {config?.mission?.title && <p className="font-bold text-slate-600">{t('unit.mission.missionName', { title: config.mission.title })}</p>}
        {tools.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5" data-unit-now-tools>
            {tools.map((tool) => <span key={tool.id} className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-0.5 text-sm font-bold text-amber-900">{tool.icon} {tool.label}</span>)}
          </div>
        )}
        {progress > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-600" data-unit-now-progress={progress}>
            <span className="h-2 w-40 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }} /></span>
            {t('unit.mission.progress', { p: progress })}
          </div>
        )}
        <div className="mt-4 flex gap-2.5">
          <Link to={lesson.path} data-unit-continue
            className="inline-flex min-h-[58px] flex-1 items-center justify-center whitespace-nowrap rounded-2xl bg-nav-accent px-4 text-xl font-black text-white shadow-[0_5px_0_0_#3730A3] hover:bg-[#3350c4] active:translate-y-0.5">
            {first ? t('unit.mission.startUnit') : progress > 0 ? t('unit.mission.continue') : t('unit.mission.startLesson')} <span aria-hidden="true" className="ms-2">←</span>
          </Link>
          <button type="button" onClick={onDetails} data-unit-whats-in
            className="min-h-[58px] whitespace-nowrap rounded-2xl border-2 border-violet-200 bg-violet-50 px-3 text-[15px] font-black text-violet-800 hover:border-violet-400">
            {t('unit.mission.whatsIn')}
          </button>
        </div>
      </div>
      {!compact && <div className="relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-pink-50 to-pink-100 text-6xl" aria-hidden="true">{icon}</div>}
    </article>
  );
}

/** La fenêtre d'une leçon : une ligne d'infos, 3 objectifs, « المزيد » pour le reste, un prérequis non fait d'emblée, un seul bouton. */
function LessonWindow({ lesson, n, total, icon, status, unmet, onOpenLesson, available, t }) {
  const config = useLessonConfig(lesson.id);
  const [more, setMore] = useState(false);
  const goals = lesson.learningPoints ?? [];
  const shown = more ? goals : goals.slice(0, 3);
  // une synthèse (`toolsOwned`) n'apporte aucun outil nouveau : ses clés sont celles de l'unité, déjà sur la page (et la fenêtre défilait)
  const tools = config?.mission?.toolsOwned ? [] : (config?.mission?.tools ?? []);
  const statusText = status === 'done' ? t('unit.mission.statusDone') : status === 'now' ? t('unit.mission.statusNow') : t('unit.mission.statusLater');
  const button = status === 'done' ? t('unit.mission.redo') : status === 'now' ? t('unit.mission.continue') : t('unit.mission.open');
  return (
    <div className="space-y-3" data-unit-window={lesson.id} data-more={more ? 'true' : 'false'}>
      {/* le titre tient sur une ligne ; s'il en faut deux, elles sont CENTRÉES (propriétaire, 2026-11-09) */}
      <div className="flex items-center justify-center gap-3.5 px-12 text-center" data-unit-window-head>
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-nav-accent-soft text-3xl" aria-hidden="true">{icon}</span>
        <div className="min-w-0">
          <h3 className="text-balance text-[22px] font-black leading-snug text-slate-900"><Bidi text={lesson.title} /></h3>
          <p className="text-sm font-bold text-slate-500">{t('unit.mission.lessonOf', { n, total })} · {t('unit.mission.minutes', { n: lesson.durationMinutes })} · {statusText}</p>
        </div>
      </div>
      <h4 className="text-sm font-black text-slate-700">{t('unit.mission.learn')}</h4>
      <ul className="space-y-1.5">
        {shown.map((lp) => (
          <li key={lp.id} className={`flex items-start gap-2.5 font-bold text-slate-800 ${more ? 'text-sm leading-snug' : 'text-[15px] leading-relaxed'}`}>
            <span className={`mt-1 inline-block h-5 w-5 shrink-0 rounded-md border-[2.5px] ${status === 'done' ? 'border-emerald-500 bg-emerald-500' : 'border-indigo-300'}`} aria-hidden="true" />
            <span className="min-w-0"><Bidi text={lp.title} /></span>
          </li>
        ))}
      </ul>
      {more && (
        <div className={`grid gap-3 ${tools.length ? 'grid-cols-2' : ''}`} data-unit-more-body>
          {tools.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-sm font-black text-slate-700">{t('unit.mission.tools')}</h4>
              <div className="flex flex-wrap gap-1">{tools.map((tool) => <span key={tool.id} className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[13px] font-bold text-amber-900">{tool.icon} {tool.label}</span>)}</div>
            </div>
          )}
          <div className="space-y-1.5">
            <h4 className="text-sm font-black text-slate-700" title={t('unit.mission.needsNote')}>{t('unit.mission.needs')}</h4>
            <ul className="flex flex-wrap gap-1">
              <PrerequisiteLessonChips lessonId={lesson.id} />
              {/* the catalogue's free-text prerequisites only when the lesson names no prerequisite LESSON: the chips say the same skills as links
                  (LEARNING_NET.md « Sixth » removed such text for unit 3), and both together made the window scroll at 1366 / 1024 (units 4, 5) */}
              {((lesson.prerequisiteLessonCodes ?? []).length ? [] : (lesson.prerequisites ?? [])).map((txt) => <li key={txt} className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[13px] font-bold text-teal-900"><Bidi text={txt} /></li>)}
            </ul>
            <p className="text-xs font-semibold text-slate-500">{t('unit.mission.needsNote')}</p>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setMore((m) => !m)} data-unit-more className="min-h-[36px] text-sm font-black text-nav-accent">
        {more ? t('unit.mission.less') : t('unit.mission.more')}
      </button>
      {!more && unmet.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border-[1.5px] border-orange-300 bg-orange-50 px-3 py-2 text-sm font-black text-orange-900" data-unit-revise-first={unmet[0].id}>
          {t('unit.mission.reviseFirst', { title: unmet[0].short })}
          <button type="button" onClick={() => onOpenLesson(unmet[0].id)} className="ms-auto rounded-xl bg-orange-400 px-3 py-1.5 text-white">{t('unit.mission.openIt')}</button>
        </div>
      )}
      {available ? (
        <Link to={lesson.path} data-unit-open
          className="flex min-h-[58px] w-full items-center justify-center rounded-2xl bg-nav-accent text-xl font-black text-white shadow-[0_5px_0_0_#3730A3] hover:bg-[#3350c4]">
          {button} <span aria-hidden="true" className="ms-2">←</span>
        </Link>
      ) : (
        <span aria-disabled="true" className="flex min-h-[58px] w-full items-center justify-center rounded-2xl bg-slate-200 text-lg font-black text-slate-500">{t('unit.comingSoon')}</span>
      )}
    </div>
  );
}

export default function UnitMissionView({ unit, mission }) {
  const { t } = useTranslation('student');
  const { isLessonClosed, isLessonHiddenByClass } = useContentAvailability();
  const all = useMemo(() => [...unit.lessons, ...(unit.synthesis ? [unit.synthesis] : [])], [unit]);
  const rows = all.map((l) => {
    const available = l.status === 'available' && !isLessonClosed(l.id) && !isLessonHiddenByClass(l.id);
    const { progressPercent } = available ? getLessonProgress(l.id, getTotalModules(l.id)) : { progressPercent: 0 };
    const stars = totalStars(readStars(scopedStorage, l.id));
    return { lesson: l, id: l.id, available, progress: progressPercent, done: progressPercent >= 100, stars, short: mission.short[l.id] ?? l.title };
  });
  const state = unitState(rows, mission);
  const doneIds = new Set(rows.filter((r) => r.done).map((r) => r.id));
  const unitIds = new Set(all.map((l) => l.id));
  const starsTotal = rows.reduce((s, r) => s + r.stars, 0);
  const current = rows.find((r) => r.id === state.current) ?? null;
  const total = rows.length;
  const [win, setWin] = useState(null); // { kind: 'lesson', id } | { kind: 'goals' | 'challenge' | 'history' | 'review' }
  const { area, box, width } = useFitZoom([state.done, state.current]);
  // une page dessinée étroite (tablette, barre latérale ouverte) : la carte « درسك الآن » laisse tomber sa vignette
  const compact = width < 860;
  const solvedAfter = all.find((l) => l.id === mission.challenge.solvedAfter);
  const statusOf = (r) => (r.done ? 'done' : r.id === state.current ? 'now' : 'later');
  const openLesson = (id) => setWin({ kind: 'lesson', id });
  const winRow = win?.kind === 'lesson' ? rows.find((r) => r.id === win.id) : null;

  return (
    <div ref={area} className="flex w-full justify-center" data-unit-mission-view={unit.id}>
      <div ref={box} className="flex shrink-0 flex-col gap-3.5" style={{ width: BASE_WIDTH }} data-unit-fit>
        {/* l'en-tête : l'unité, et ce que l'élève a déjà fait */}
        <header className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="whitespace-nowrap rounded-full bg-nav-accent-soft px-3 py-0.5 text-sm font-black text-nav-accent">{t('unit.unitNumber', { n: unit.number })}</span>
              <h1 className="text-[28px] font-black leading-tight text-slate-900"><MathLabel>{unit.title}</MathLabel></h1>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2" data-unit-done={state.done}>
            <svg viewBox="0 0 46 46" className="h-11 w-11" aria-hidden="true">
              <circle cx="23" cy="23" r="19" fill="none" stroke="#E2E8F0" strokeWidth="6" />
              <circle cx="23" cy="23" r="19" fill="none" stroke="#10B981" strokeWidth="6" strokeLinecap="round" transform="rotate(-90 23 23)"
                strokeDasharray="119.4" strokeDashoffset={String(119.4 * (1 - state.done / total))} />
            </svg>
            <div><b className="block text-xl font-black" dir="ltr">{nb(state.done, total)}</b><small className="text-xs font-bold text-slate-500">{t('unit.mission.lessonsDone')}</small></div>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2" data-unit-stars={starsTotal}>
            <span className="text-2xl" aria-hidden="true">⭐</span>
            <div><b className="block text-xl font-black">{starsTotal}</b><small className="text-xs font-bold text-slate-500">{t('unit.mission.starsLabel')}</small></div>
          </div>
        </header>

        <section className="grid grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] gap-4">
          {current ? (
            <NowCard lesson={current.lesson} n={rows.indexOf(current) + 1} total={total} icon={mission.icons[current.id] ?? '📘'} progress={current.progress}
              first={state.done === 0 && current.progress === 0} compact={compact} t={t} onDetails={() => openLesson(current.id)} />
          ) : (
            <article className="relative grid grid-cols-[minmax(0,1fr)_8.5rem] gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-unit-finished>
              <span className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l from-violet-600 to-indigo-600" aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-sm font-black text-nav-accent">{t('unit.mission.finishedTag')} <span className="rounded-full bg-amber-50 px-2.5 text-amber-800">⭐ {starsTotal}</span></div>
                <h2 className="mt-1.5 text-2xl font-black text-slate-900">{t('unit.mission.finishedTitle')}</h2>
                <p className="font-bold text-slate-600">{t('unit.mission.finishedLine')}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">{mission.keys.map((k) => <span key={k.label} className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-bold text-amber-900">{k.icon} {k.label}</span>)}</div>
                <button type="button" onClick={() => setWin({ kind: 'challenge' })} data-unit-solve
                  className="mt-4 min-h-[58px] w-full rounded-2xl bg-nav-accent text-xl font-black text-white shadow-[0_5px_0_0_#3730A3]">{t('unit.mission.solve')} ←</button>
              </div>
              <div className="flex items-center justify-center rounded-2xl bg-gradient-to-b from-amber-100 to-amber-200 text-7xl" aria-hidden="true">🏆</div>
            </article>
          )}
          {/* le défi de l'unité : POURQUOI l'unité existe */}
          <article className="flex flex-col gap-2.5 rounded-3xl border border-slate-200 bg-gradient-to-b from-amber-50 to-white p-5 shadow-sm" data-unit-challenge-card>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[15px] font-black text-amber-800">{t('unit.mission.challengeTitle')}</h3>
              <button type="button" onClick={() => setWin({ kind: 'challenge' })} className="whitespace-nowrap text-sm font-black text-nav-accent">{t('unit.mission.readChallenge')} ←</button>
            </div>
            <p className="text-[17px] font-bold leading-relaxed text-slate-900"><Highlighted text={mission.challenge.lead} numbers={mission.challenge.numbers} /></p>
            <div className="mt-auto flex items-center gap-2" data-unit-keys={state.keysEarned}>
              {mission.keys.map((k) => {
                const on = doneIds.has(k.after);
                return <span key={k.label} title={k.label} className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${on ? 'bg-amber-100 ring-2 ring-amber-300' : 'bg-slate-100 opacity-50 grayscale'}`}>{k.icon}</span>;
              })}
              <small className="ms-1 whitespace-nowrap text-sm font-bold text-slate-500">{t('unit.mission.keys', { got: state.keysEarned, total: mission.keys.length })}</small>
            </div>
          </article>
        </section>

        {/* le chemin de l'unité : toutes les leçons d'un coup d'œil */}
        <section className="rounded-3xl border border-slate-200 bg-white px-5 pb-4 pt-4 shadow-sm" aria-label={t('unit.mission.path')} data-unit-path>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">{t('unit.mission.path')}</h3>
            <span className="rounded-full bg-emerald-50 px-3 py-0.5 text-sm font-black text-emerald-700">{t('unit.mission.doneOf', { done: state.done, total })}</span>
          </div>
          <div className="relative grid pt-1.5" style={{ gridTemplateColumns: `repeat(${total + 1}, minmax(0, 1fr))` }}>
            <div className="absolute inset-x-[5%] top-[62px] h-1.5 rounded-full bg-slate-200" aria-hidden="true">
              <i className="absolute inset-y-0 start-0 rounded-full bg-emerald-500" style={{ width: `${(state.done / total) * 100}%` }} />
            </div>
            {rows.map((r, i) => {
              const st = statusOf(r);
              return (
                <button key={r.id} type="button" onClick={() => openLesson(r.id)} data-unit-station={r.id} data-status={st}
                  aria-label={`${t('unit.mission.lessonOf', { n: i + 1, total })}: ${r.lesson.title}`}
                  className="group relative flex flex-col items-center gap-1.5 px-0.5 pt-6 text-center">
                  {st === 'now' && <span className="absolute top-0 z-10 whitespace-nowrap rounded-full bg-nav-accent px-2.5 text-[11px] font-black text-white">{t('unit.mission.here')}</span>}
                  <span className={`relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] text-[28px] transition-transform group-hover:-translate-y-0.5 ${
                    st === 'done' ? 'border-emerald-500 bg-emerald-50' : st === 'now' ? 'border-nav-accent bg-nav-accent-soft shadow-[0_0_0_7px_rgba(79,70,229,0.14)]' : 'border-slate-200 bg-white opacity-60 grayscale'}`} aria-hidden="true">
                    {mission.icons[r.id] ?? '📘'}
                    {st === 'done' && <span className="absolute -end-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white">✓</span>}
                  </span>
                  <b className={`line-clamp-3 min-h-[36px] text-[13.5px] font-extrabold leading-snug ${st === 'later' ? 'text-slate-400' : 'text-slate-900'}`}><MathLabel>{r.short}</MathLabel></b>
                  <span className="min-h-[16px] text-xs text-amber-500">{r.done ? (r.stars > 0 ? '★'.repeat(Math.min(3, Math.max(1, Math.round(r.stars / 3)))) : '') : t('unit.mission.minutes', { n: r.lesson.durationMinutes })}</span>
                </button>
              );
            })}
            <button type="button" onClick={() => setWin({ kind: 'challenge' })} data-unit-station="challenge" className="flex flex-col items-center gap-1.5 px-0.5 pt-6 text-center">
              <span className={`flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-dashed border-amber-300 bg-amber-50 text-[28px] ${state.finished ? '' : 'opacity-70'}`} aria-hidden="true">🏁</span>
              <b className="text-[13.5px] font-extrabold text-slate-500">{t('unit.mission.flag')}</b>
            </button>
          </div>
        </section>

        {/* ce que l'ancienne page montrait d'un coup : replié, à un toucher (jamais supprimé) */}
        <nav className="flex flex-wrap gap-2" aria-label="المزيد" data-unit-chips>
          {[['goals', 'chipGoals'], ['challenge', 'chipChallenge'], ['history', 'chipHistory'], ['review', 'chipReview']].map(([kind, key]) => (
            <button key={kind} type="button" onClick={() => setWin({ kind })} data-unit-chip={kind}
              className="min-h-[40px] rounded-full border border-slate-200 bg-white px-3.5 text-sm font-extrabold text-slate-700 hover:border-indigo-300 hover:text-nav-accent">{t(`unit.mission.${key}`)}</button>
          ))}
        </nav>
      </div>

      {win && (
        <MissionDialog card label={t('unit.mission.windowLabel')} onClose={() => setWin(null)}>
          {winRow && (
            <LessonWindow key={winRow.id} lesson={winRow.lesson} n={rows.indexOf(winRow) + 1} total={total} icon={mission.icons[winRow.id] ?? '📘'}
              status={statusOf(winRow)} available={winRow.available} t={t} onOpenLesson={openLesson}
              unmet={unmetPrerequisites(winRow.lesson, doneIds, unitIds).map((id) => rows.find((r) => r.id === id)).filter(Boolean)} />
          )}
          {win.kind === 'goals' && (
            <div className="space-y-3 pe-12" data-unit-window="goals">
              <h3 className="text-center text-xl font-black text-slate-900">{t('unit.mission.chipGoals')}</h3>
              <ul className="space-y-1.5 text-[15px] font-bold text-slate-800">{unit.objectives.map((o) => <li key={o}>• <Bidi text={o} /></li>)}</ul>
            </div>
          )}
          {win.kind === 'challenge' && (
            <div className="space-y-3" data-unit-window="challenge">
              <h3 className="px-12 text-center text-xl font-black text-slate-900">{t('unit.mission.challengeTitle')}</h3>
              <p className="text-[17px] font-bold leading-loose text-slate-900"><Highlighted text={mission.challenge.full} numbers={mission.challenge.numbers} /></p>
              <p className="font-black text-slate-800">{mission.challenge.question}</p>
              {solvedAfter && <p className="text-sm font-bold text-slate-500">{t('unit.mission.challengeHint', { title: mission.short[solvedAfter.id] ?? solvedAfter.title })}</p>}
            </div>
          )}
          {win.kind === 'history' && (
            <div className="space-y-3 pe-12" data-unit-window="history">
              <h3 className="text-center text-xl font-black text-slate-900">📜 {mission.history.title}</h3>
              <p className="text-base font-semibold leading-loose text-slate-800">{mission.history.text}</p>
            </div>
          )}
          {win.kind === 'review' && (
            <div className="space-y-3 pe-12" data-unit-window="review">
              <h3 className="text-center text-xl font-black text-slate-900">{t('unit.mission.chipReview')}</h3>
              <p className="text-sm font-bold text-slate-600">{t('unit.mission.reviewLead')}</p>
              <ReviseFirst lessonId={all[0].id} title={unit.title} basePath={unit.path} variant="slim" />
            </div>
          )}
        </MissionDialog>
      )}
    </div>
  );
}
