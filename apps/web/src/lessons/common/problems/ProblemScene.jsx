import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { problemTone } from './problemTone';
import { divide, clampStep, equalityLine, fenceFits, fenceEdges, tileGrid } from './problemScene';

/**
 * ProblemScene — le dessin INTERACTIF d'une مسألة (`problem.scene`, 2026-10-13) : un contrôle (un nombre),
 * un dessin qui réagit, une égalité recalculée. Logique : ./problemScene.js ; contrat : MASAIL_GENERATION_GUIDE.md.
 *
 * La scène laisse l'élève ESSAYER (« est-ce que 7 groupes tombent juste ? ») sans jamais donner la réponse : elle
 * dit « sans reste » ou « il reste r », jamais « c'est le plus grand » ni le nombre de poteaux / de carreaux.
 * Dessinée en SVG (direction LTR, chiffres seulement) ; tout texte arabe est du DOM vivant.
 */
const HATCH_ROSE = 'fill-rose-400';

function Stepper({ value, max, onChange, tone, label }) {
  const { t } = useTranslation('lesson');
  const T = problemTone(tone);
  const set = (v) => onChange(clampStep(v, max));
  return (
    <div className="flex flex-wrap items-center gap-2" data-scene-controls>
      <span className={`text-sm font-bold ${T.accentText}`}>{label}</span>
      <button type="button" onClick={() => set(value - 1)} disabled={value <= 1} aria-label={t('problem.scene.decrease')}
        className={`h-9 w-9 rounded-full text-lg font-bold text-white disabled:opacity-40 ${T.button}`}>−</button>
      <input type="range" min={1} max={max} step={1} value={value} onChange={(e) => set(e.target.value)} aria-label={t('problem.scene.slider')}
        dir="ltr" className={`h-2 min-w-[8rem] flex-1 cursor-pointer ${T.range}`} data-scene-range />
      <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label={t('problem.scene.increase')}
        className={`h-9 w-9 rounded-full text-lg font-bold text-white disabled:opacity-40 ${T.button}`}>+</button>
      <input type="number" min={1} max={max} value={value} onChange={(e) => set(e.target.value)} aria-label={t('problem.scene.slider')}
        dir="ltr" inputMode="numeric" className="h-9 w-20 rounded-lg border-2 border-slate-300 bg-white px-2 text-center font-mono text-sm font-bold" data-scene-number />
    </div>
  );
}

function Equation({ total, d, unit }) {
  const { t } = useTranslation('lesson');
  const { r, exact } = divide(total, d);
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm" data-scene-line data-exact={exact ? 'true' : 'false'}>
      <bdi dir="ltr" className="font-mono font-bold text-slate-800">{equalityLine(total, d)}{unit ? ` ${unit}` : ''}</bdi>
      <span className={exact ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>{exact ? t('problem.scene.fits') : t('problem.scene.rest', { r })}</span>
    </li>
  );
}

function Hatch({ id }) {
  return (
    <pattern id={id} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="3" height="6" className={HATCH_ROSE} />
    </pattern>
  );
}

/* ── share : des objets répartis en n groupes égaux ─────────────────────── */
function ShareScene({ scene, d }) {
  const T = problemTone(scene.tone);
  const hid = useId().replace(/:/g, '');
  const W = 320;
  return (
    <div className="space-y-3">
      {scene.items.map((it, idx) => {
        const { q, r } = divide(it.count, d);
        const wDone = ((q * d) / it.count) * W;
        const wGroup = (q / it.count) * W;
        return (
          <div key={it.label} className="space-y-1">
            <p className="text-xs font-bold text-slate-700">{it.label}</p>
            <svg viewBox={`0 0 ${W} 26`} className="block h-7 w-full max-w-md" style={{ direction: 'ltr' }} role="img" aria-label={it.label} data-scene-bar>
              <defs><Hatch id={`${hid}-${idx}`} /></defs>
              <rect x="0" y="2" width={W} height="22" rx="4" className="fill-white stroke-slate-300" />
              {r > 0 && <rect x={wDone} y="2" width={W - wDone} height="22" fill={`url(#${hid}-${idx})`} className="stroke-rose-500" />}
              {q > 0 && <rect x="0" y="2" width={wDone} height="22" rx="4" className={T.fillSoft} />}
              {q > 0 && d <= 40 && Array.from({ length: d }, (_, k) => (
                <rect key={k} x={k * wGroup + 1} y="4" width={Math.max(wGroup - 2, 0.5)} height="18" rx="2" className={T.fill} />
              ))}
              {q > 0 && d > 40 && <rect x="0" y="4" width={wDone} height="18" className={T.fill} />}
            </svg>
          </div>
        );
      })}
      <ul className="space-y-1">
        {scene.items.map((it) => <Equation key={it.label} total={it.count} d={d} />)}
      </ul>
    </div>
  );
}

/* ── fence : des poteaux tous les d, un poteau à chaque coin ────────────── */
function FenceScene({ scene, d }) {
  const { t } = useTranslation('lesson');
  const T = problemTone(scene.tone);
  const W = 360;
  const pad = 26;
  const edges = fenceEdges(scene.shape, scene.sides);
  const xs = edges.flatMap(([p]) => [p[0]]);
  const ys = edges.flatMap(([p]) => [p[1]]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = Math.min((W - 2 * pad) / (maxX - minX || 1), (230 - 2 * pad) / (maxY - minY || 1));
  // La hauteur suit la figure : un rectangle plat n'est pas posé dans un grand vide.
  const H = Math.round((maxY - minY) * k + 2 * pad);
  const P = ([x, y]) => [pad + (x - minX) * k, H - pad - (y - minY) * k];
  const fits = fenceFits(scene.sides, d);
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-w-md" style={{ direction: 'ltr' }} role="img" aria-label={scene.ariaLabel} data-scene-fence>
        {edges.map(([p, q, len], i) => {
          const [x1, y1] = P(p);
          const [x2, y2] = P(q);
          const lastT = Math.floor(len / d) * d;
          const exact = lastT === len;
          const at = (tt) => [x1 + ((x2 - x1) * tt) / len, y1 + ((y2 - y1) * tt) / len];
          const [lx, ly] = at(lastT);
          const dots = len / d <= 120 ? Array.from({ length: Math.floor(len / d) + 1 }, (_, n) => at(n * d)) : [];
          const mid = at(len / 2);
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-slate-300" strokeWidth="2" />
              <line x1={x1} y1={y1} x2={lx} y2={ly} className={T.stroke} strokeWidth="3" strokeLinecap="round" />
              {!exact && <line x1={lx} y1={ly} x2={x2} y2={y2} className="stroke-rose-500" strokeWidth="3" strokeDasharray="5 4" />}
              {dots.map(([cx, cy], n) => <circle key={n} cx={cx} cy={cy} r="3.2" className={T.fill} />)}
              {!exact && (
                <g data-scene-missing>
                  <circle cx={x2} cy={y2} r="6" className="fill-white stroke-rose-600" strokeWidth="2" />
                  <path d={`M${x2 - 3} ${y2 - 3} L${x2 + 3} ${y2 + 3} M${x2 + 3} ${y2 - 3} L${x2 - 3} ${y2 + 3}`} className="stroke-rose-600" strokeWidth="2" />
                </g>
              )}
              <text x={mid[0]} y={mid[1]} dx={(y2 - y1) === 0 ? 0 : (x2 - x1) === 0 ? 14 : 8} dy={(y2 - y1) === 0 ? (i === 0 ? 16 : -8) : 4}
                textAnchor="middle" className="fill-slate-600 text-[11px] font-bold" style={{ direction: 'ltr' }}>{len}</text>
            </g>
          );
        })}
      </svg>
      <ul className="space-y-1">
        {Array.from(new Set(scene.sides)).map((s) => <Equation key={s} total={s} d={d} unit={scene.unit} />)}
      </ul>
      {!fits && <p className="text-xs font-bold text-rose-700">{t('problem.scene.cornerMissing')}</p>}
    </div>
  );
}

/* ── tiles : un rectangle pavé de carrés de côté s ──────────────────────── */
function TilesScene({ scene, d }) {
  const T = problemTone(scene.tone);
  const hid = useId().replace(/:/g, '');
  const W = 340;
  const H = 210;
  const k = Math.min(W / scene.length, H / scene.width);
  const w = scene.length * k;
  const h = scene.width * k;
  const g = tileGrid(scene.length, scene.width, d);
  const cell = d * k;
  const w1 = g.cols * cell;
  const h1 = g.rows * cell;
  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${W + 4} ${H + 4}`} className="block h-auto w-full max-w-md" style={{ direction: 'ltr' }} role="img" aria-label={scene.ariaLabel} data-scene-tiles>
        <defs>
          <Hatch id={`${hid}-h`} />
          {cell >= 3 && (
            <pattern id={`${hid}-g`} width={cell} height={cell} patternUnits="userSpaceOnUse">
              <rect width={cell} height={cell} className={T.fillSoft} />
              <rect width={cell} height={cell} fill="none" className="stroke-white" strokeWidth="1.5" />
            </pattern>
          )}
        </defs>
        <g transform="translate(2 2)">
          <rect x="0" y="0" width={w} height={h} fill={`url(#${hid}-h)`} className="stroke-rose-500" />
          {g.cols > 0 && g.rows > 0 && (
            <rect x="0" y="0" width={w1} height={h1} fill={cell >= 3 ? `url(#${hid}-g)` : undefined} className={cell >= 3 ? 'stroke-slate-400' : `${T.fillSoft} stroke-slate-400`} />
          )}
          <rect x="0" y="0" width={w} height={h} fill="none" className="stroke-slate-500" strokeWidth="1.5" />
          <text x={w / 2} y={h + 0} dy={-3} textAnchor="middle" className="fill-slate-700 text-[11px] font-bold" style={{ direction: 'ltr' }}>{scene.length}</text>
        </g>
      </svg>
      <ul className="space-y-1">
        <Equation total={scene.length} d={d} unit={scene.unit} />
        <Equation total={scene.width} d={d} unit={scene.unit} />
      </ul>
    </div>
  );
}

export default function ProblemScene({ scene }) {
  const { t } = useTranslation('lesson');
  const T = problemTone(scene.tone);
  const [d, setD] = useState(() => clampStep(scene.start ?? 2, scene.max));
  const allFit = scene.kind === 'share'
    ? scene.items.every((it) => divide(it.count, d).exact)
    : scene.kind === 'fence' ? fenceFits(scene.sides, d) : tileGrid(scene.length, scene.width, d).exact;
  const label = scene.kind === 'share' ? scene.groupLabel : scene.stepLabel;
  return (
    <section className={`space-y-3 rounded-xl border-2 px-3 py-3 ${T.panel}`} data-problem-scene={scene.kind} data-scene-fits={allFit ? 'true' : 'false'} aria-label={scene.ariaLabel}>
      <p className={`text-sm font-extrabold ${T.accentText}`}><span aria-hidden="true">🎛️ </span>{t('problem.scene.title')}</p>
      <p className="text-xs text-slate-600">{t('problem.scene.lead')}</p>
      <Stepper value={d} max={scene.max} onChange={setD} tone={scene.tone} label={`${label} ${scene.unit && scene.kind !== 'share' ? `(${scene.unit})` : ''}`} />
      {scene.kind === 'share' && <ShareScene scene={scene} d={d} />}
      {scene.kind === 'fence' && <FenceScene scene={scene} d={d} />}
      {scene.kind === 'tiles' && <TilesScene scene={scene} d={d} />}
      <p role="status" aria-live="polite" className={`rounded-lg px-3 py-2 text-sm font-bold ${allFit ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-50 text-rose-800'}`} data-scene-verdict>
        {allFit ? t('problem.scene.allFit') : t('problem.scene.notFit')}
      </p>
    </section>
  );
}
