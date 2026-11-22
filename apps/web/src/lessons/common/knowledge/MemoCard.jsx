import { useState } from 'react';
import FitLine from '../components/FitLine';
import { useTranslation } from 'react-i18next';
import { BookOpen, Timer, Lightbulb, TriangleAlert, Target, Sparkles } from 'lucide-react';
import MathText from '../components/MathText';
import MathLabel from '../components/MathLabel';
import MemoQuiz from './MemoQuiz';
import { buildQuiz } from './memoQuiz';
import { MoreToggle } from '../components/StudentFocus';

/**
 * MemoCard — « 🔑 للتذكّر » en FICHE DE MÉMOIRE (PROTOTYPE 2026-10-28 sur `maqlub-qismat-kasrayn`, propriétaire : « la carte de fin de module
 * doit être claire — la règle se VOIT et se retient au premier regard —, professionnelle et faite pour la génération Z ; c'est le cœur de ce
 * que l'élève doit comprendre, mémoriser et utiliser à l'examen »). Rendu par `KnowledgeSnapshot variant="memo"`.
 *
 * L'ordre d'une TUILE (une connaissance NOUVELLE du module) est celui du regard :
 *   1. la RÈGLE en grand (`memo.rule`, une formule KaTeX ; la partie qui CHANGE est colorée par l'auteur avec `\textcolor{#e11d48}{…}`) ;
 *   2. le SLOGAN de 2 à 5 mots (`memo.hook`) — ce qu'on se répète ;
 *   3. trois lignes courtes, une icône chacune : مثال (`memo.example`, formule) · فخّ (`memo.trap`) · في الامتحان (`memo.exam`).
 * Les acquis des modules précédents sont des PUCES (titre + `memo.chip`, une mini-formule) ; un module sans apport (exercices) montre tout en tuiles.
 * « اختبر ذاكرتك » (facultatif) ouvre le DÉFI CHRONOMÉTRÉ `MemoQuiz` au centre de l'écran : ses questions sont les `memo.quiz` des items
 * de la carte (`memoQuiz.js › buildQuiz`) ; le bouton n'apparaît que si la carte en porte.
 * Sans `memo`, une tuile montre le `summary` : toute leçon peut passer à cette variante, la fiche s'enrichit quand l'auteur écrit `memo`.
 *
 * CONTRAT DOM (celui de KnowledgeSnapshot, inchangé) : [data-knowledge-item] et [data-knowledge-module] une fois par item, « جديد » sur les
 * seuls items du module ; en plus [data-memo-card], [data-memo-tile=<id>], [data-memo-rule], [data-memo-chip=<id>], [data-memo-quiz-open] (le défi : MemoQuiz).
 */

const ACCENT = {
  regles: { bar: 'from-indigo-500 to-violet-500', badge: 'bg-indigo-600', soft: 'bg-indigo-50 ring-indigo-100', text: 'text-indigo-700' },
  concepts: { bar: 'from-sky-500 to-blue-500', badge: 'bg-sky-600', soft: 'bg-sky-50 ring-sky-100', text: 'text-sky-700' },
  methodes: { bar: 'from-emerald-500 to-teal-500', badge: 'bg-emerald-600', soft: 'bg-emerald-50 ring-emerald-100', text: 'text-emerald-700' },
  vocabulaire: { bar: 'from-fuchsia-500 to-purple-500', badge: 'bg-purple-600', soft: 'bg-purple-50 ring-purple-100', text: 'text-purple-700' },
  memoriser: { bar: 'from-rose-500 to-orange-500', badge: 'bg-rose-600', soft: 'bg-rose-50 ring-rose-100', text: 'text-rose-700' },
  formules: { bar: 'from-indigo-500 to-blue-500', badge: 'bg-indigo-600', soft: 'bg-indigo-50 ring-indigo-100', text: 'text-indigo-700' },
};
const accentOf = (type) => ACCENT[type] ?? ACCENT.regles;
const two = (n) => String(n).padStart(2, '0');

export default function MemoCard({ items, moduleNumber, openMap, children }) {
  const { t } = useTranslation('lesson');
  const k = (s, o) => t(`map.memo.${s}`, o);
  const fresh = items.filter((i) => i.module === moduleNumber);
  const tiles = fresh.length > 0 ? fresh : items;
  const earlier = fresh.length > 0 ? items.filter((i) => i.module !== moduleNumber) : [];
  const [quiz, setQuiz] = useState(false);
  const hasQuiz = items.some((i) => i.memo?.quiz?.length);
  const where = typeof window !== 'undefined' ? window.location.pathname : '';

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      data-knowledge-snapshot={moduleNumber ?? 'all'} data-memo-card aria-labelledby="km-memo-title">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-l from-slate-900 via-indigo-950 to-violet-900 px-5 py-4 text-white">
        <div className="min-w-0">
          <h3 id="km-memo-title" className="flex items-center gap-2 text-xl font-black text-white">
            <span aria-hidden="true">🔑</span> {k('title')}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-indigo-200">
            <span>{k('promise')}</span>
            {fresh.length > 0 && (
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-white">{k('newCount', { count: fresh.length })}</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasQuiz && (
            <button type="button" onClick={() => setQuiz(true)} data-memo-quiz-open
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-gradient-to-l from-amber-400 to-orange-500 px-4 text-sm font-black text-slate-950 shadow-[0_3px_0_0_#9A3412] outline-none hover:brightness-105 active:translate-y-0.5 focus-visible:ring-4 focus-visible:ring-white/40">
              <Timer className="h-4 w-4" aria-hidden="true" /> {k('quiz.open')}
            </button>
          )}
          <button type="button" onClick={openMap}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-indigo-950 outline-none hover:bg-indigo-50 focus-visible:ring-4 focus-visible:ring-white/40">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> {t('map.openMap')}
          </button>
        </div>
      </header>

      <div className="space-y-3 bg-slate-50/70 p-4">
        <ol className="space-y-3">
          {tiles.map((item, i) => (
            <MemoTile key={item.id} item={item} n={i + 1} isNew={item.module === moduleNumber} />
          ))}
        </ol>

        {earlier.length > 0 && (
          <MoreToggle label={t('focus.known')}>
          <div className="space-y-2 pt-1">
            <p className="text-xs font-black text-slate-500">{k('earlier')}</p>
            <div className="flex flex-wrap gap-2">
              {earlier.map((item) => (
                <span key={item.id} data-knowledge-item={item.id} data-knowledge-module={item.module} data-memo-chip={item.id}
                  className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">
                  <span className={`h-2 w-2 shrink-0 rounded-full bg-gradient-to-l ${accentOf(item.type).bar}`} aria-hidden="true" />
                  <span className="truncate">{item.title}</span>
                  {item.memo?.chip && <span className="text-slate-900" dir="ltr"><MathText>{`$${item.memo.chip}$`}</MathText></span>}
                </span>
              ))}
            </div>
          </div>
          </MoreToggle>
        )}
      </div>

      {children && <div className="border-t border-slate-200 px-5 py-3 text-sm text-indigo-900">{children}</div>}
      {hasQuiz && <MemoQuiz open={quiz} onClose={() => setQuiz(false)} build={() => buildQuiz(items, moduleNumber)} storageKey={`memoQuiz:${where}:${moduleNumber}`} />}
    </section>
  );
}

function MemoTile({ item, n, isNew }) {
  const { t } = useTranslation('lesson');
  const k = (s, o) => t(`map.memo.${s}`, o);
  const a = accentOf(item.type);
  const memo = item.memo ?? {};
  return (
    <li data-knowledge-item={item.id} data-knowledge-module={item.module} data-memo-tile={item.id}
      className="relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <span className={`absolute inset-y-0 start-0 w-1.5 bg-gradient-to-b ${a.bar}`} aria-hidden="true" />
      <div className="grid gap-3 p-4 ps-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex h-7 min-w-[34px] items-center justify-center rounded-lg px-1.5 text-xs font-black text-white tabular-nums ${a.badge}`} dir="ltr">{two(n)}</span>
            <h4 className="text-base font-black text-slate-900">{item.title}</h4>
            {isNew && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-black text-amber-800">{t('map.new')}</span>}
          </div>
          {memo.hook && (
            <p className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-base font-black ring-1 ${a.soft} ${a.text}`}>
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" /> <MathLabel>{memo.hook}</MathLabel>
            </p>
          )}
          <MoreToggle>
          <ul className="space-y-1 text-sm font-bold text-slate-700">
            {memo.example && (
              <li className="flex items-start gap-2"><Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
                <span className="w-[5.75rem] shrink-0 whitespace-nowrap text-slate-500">{k('example')}</span>
                <FitLine className="flex-1" dir="ltr"><MathText>{`$${memo.example}$`}</MathText></FitLine>
              </li>
            )}
            {memo.trap && (
              <li className="flex items-start gap-2"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" aria-hidden="true" />
                <span className="w-[5.75rem] shrink-0 whitespace-nowrap text-slate-500">{k('trap')}</span> <span className="text-rose-800"><MathLabel>{memo.trap}</MathLabel></span>
              </li>
            )}
            {memo.exam && (
              <li className="flex items-start gap-2"><Target className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" />
                <span className="w-[5.75rem] shrink-0 whitespace-nowrap text-slate-500">{k('exam')}</span> <span><MathLabel>{memo.exam}</MathLabel></span>
              </li>
            )}
            {!item.memo && item.summary && <li className="text-slate-600"><MathLabel>{item.summary}</MathLabel></li>}
          </ul>
          </MoreToggle>
        </div>
        {memo.rule && (
          // la règle TIENT dans son cadre (FitLine, 2026-11-09) : avant, centrée dans un cadre trop étroit, elle était coupée des deux côtés
          <div data-memo-rule className={`order-first flex min-h-[96px] min-w-0 items-center justify-center rounded-2xl px-3 py-4 ring-1 xl:order-none ${a.soft}`}>
            <FitLine className="text-center text-2xl text-slate-900" dir="ltr"><MathText>{`$${memo.rule}$`}</MathText></FitLine>
          </div>
        )}
      </div>
    </li>
  );
}
