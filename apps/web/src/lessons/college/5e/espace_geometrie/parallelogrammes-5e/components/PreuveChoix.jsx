import React, { useState } from 'react';
import GeoScene, { Dot, Poly, Seg, dotObstacles, polyObstacles } from '../../../../../common/geo5e/GeoScene';
import { Feedback } from '../../../../../common/components/LessonUI';
import { midpoint } from '../../../../../common/geo5e/geo5e';

const W = 420;
const H = 300;

/**
 * PreuveChoix — « quelle propriété me permet de conclure ? »
 *
 * C'est la demande explicite du cahier des charges : des tâches où l'élève
 * CHOISIT le raisonnement, au lieu de calculer. On lui donne une figure
 * CODÉE — les marques sont là, les mesures n'y sont pas — et trois
 * propriétés candidates. Il désigne celle qui permet de conclure.
 *
 * Deux configurations sur six n'en admettent AUCUNE : c'est ce qui sépare
 * « je reconnais un dessin » de « j'invoque une propriété ». Sans elles,
 * l'élève apprendrait qu'il y a toujours une réponse à trouver — et il la
 * trouverait au hasard.
 *
 * Non bloquant par construction : une seule tape répond, la bonne réponse
 * est toujours révélée, et `onAnswered` est appelé quoi qu'il arrive
 * (LESSON_CONTRACT § progression non bloquante).
 */
export default function PreuveChoix({ config, solved, onAnswered }) {
  const [pick, setPick] = useState(null);
  const repondu = pick !== null || solved;

  const choisir = (i) => {
    if (repondu) return;
    setPick(i);
    onAnswered?.(i === config.correct);
  };

  const juste = pick === config.correct;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-indigo-200 bg-white overflow-hidden">
        <FigureCodee config={config} />
        <div className="p-3 bg-indigo-50 border-t-2 border-indigo-100 space-y-1.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-indigo-800">Ce que l’énoncé donne</div>
          <ul className="text-sm text-slate-700 space-y-0.5">
            {config.donnees.map((d) => <li key={d}>• {d}</li>)}
          </ul>
        </div>
      </div>

      <p className="text-sm font-semibold text-slate-700">
        {config.question ?? 'Quelle propriété permet de conclure que ABCD est un parallélogramme ?'}
      </p>

      <div className="grid gap-2">
        {config.options.map((opt, i) => {
          const estBonne = i === config.correct;
          const choisie = pick === i;
          let cls = 'border-slate-200 bg-white hover:border-indigo-300';
          if (repondu && estBonne) cls = 'border-emerald-400 bg-emerald-50';
          else if (repondu && choisie) cls = 'border-rose-400 bg-rose-50';
          else if (repondu) cls = 'border-slate-200 bg-white opacity-60';
          return (
            <button
              key={opt}
              type="button"
              disabled={repondu}
              onClick={() => choisir(i)}
              className={`min-h-[48px] rounded-xl border-2 px-3.5 py-2.5 text-left text-sm font-semibold text-slate-700 transition ${cls}`}
            >
              {repondu && estBonne && <span className="sr-only">Bonne réponse : </span>}
              {repondu && choisie && !estBonne && <span className="sr-only">Ta réponse : </span>}
              {opt}
            </button>
          );
        })}
      </div>

      {repondu && (
        <Feedback tone={juste ? 'ok' : 'ko'}>
          {juste ? config.explain : (config.explainWrong?.[pick] ?? config.explain)}
        </Feedback>
      )}
    </div>
  );
}

/* ── La figure codée ───────────────────────────────────────────────────── */

/**
 * Une figure qui porte ses CODAGES et rien d'autre : pas une mesure.
 *
 * Le codage est calculé à partir des points dessinés (position du milieu,
 * direction du côté), jamais posé à un décalage fixe — un chevron qui glisse
 * sur un sommet ferait mentir la figure (§28bis).
 */
function FigureCodee({ config }) {
  const { pts, codes = [], diagonales = false } = config;
  const noms = ['A', 'B', 'C', 'D'];
  const O = midpoint(pts[0], pts[2]);

  const marque = (i, j, n, forme, color) => {
    const m = midpoint(pts[i], pts[j]);
    const t = (Math.atan2(pts[j].y - pts[i].y, pts[j].x - pts[i].x) * 180) / Math.PI;
    const items = [];
    for (let k = 0; k < n; k += 1) {
      const dx = (k - (n - 1) / 2) * 8;
      items.push(forme === 'chevron'
        ? <path key={k} d={`M ${dx - 3.5} -6 L ${dx + 3.5} 0 L ${dx - 3.5} 6`} fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
        : <line key={k} x1={dx} y1={-7} x2={dx} y2={7} stroke={color} strokeWidth={2.6} strokeLinecap="round" />);
    }
    return <g key={`${i}${j}${forme}${n}`} transform={`translate(${m.x} ${m.y}) rotate(${t})`}>{items}</g>;
  };

  return (
    <GeoScene
      width={W} height={H}
      labels={[
        ...pts.map((p, i) => ({ id: `p${i}`, text: noms[i], anchor: p, color: '#334155', size: 16, priority: true })),
        ...(diagonales ? [{ id: 'O', text: 'O', anchor: O, color: '#dc2626', size: 16, priority: true }] : []),
      ]}
      obstacles={[...dotObstacles(pts, 14), ...polyObstacles(pts), ...(diagonales ? dotObstacles([O], 13) : [])]}
      ariaLabel={config.aria}
    >
      <rect x={0} y={0} width={W} height={H} fill="#ffffff" data-visual-role="decor" />
      {diagonales && (
        <>
          <Seg a={pts[0]} b={pts[2]} color="#c4b5fd" w={2} dash="6 5" />
          <Seg a={pts[1]} b={pts[3]} color="#c4b5fd" w={2} dash="6 5" />
        </>
      )}
      <Poly pts={pts} fill="#6366f1" stroke="#4338ca" fillOpacity={0.1} w={2.8} />
      {codes.map((c) => marque(c.i, c.j, c.n ?? 1, c.forme, c.forme === 'chevron' ? '#0ea5e9' : '#059669'))}
      {diagonales && <Dot p={O} color="#dc2626" r={5} />}
      {pts.map((p, i) => <Dot key={i} p={p} color="#334155" r={5} />)}
    </GeoScene>
  );
}
