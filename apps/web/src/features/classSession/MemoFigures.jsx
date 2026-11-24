/**
 * The DRAWINGS of the opening situations of a lesson memo (`lessonMemos.js › openings`). Drawn in code, never generated:
 * each figure is computed from the numbers of its situation (`openingFacts`) — the planks laid, the players left, the
 * books that do not fit, the gap no tile fills — so the drawing IS the argument and can never show a wrong count.
 * No person is drawn (people are the platform's one shared character, kept for the lessons). Calm palette; amber marks
 * what is LEFT, green what fits exactly.
 */
import { openingFacts } from './lessonMemos';
import StatementFigure from '../../lessons/common/components/StatementFigure';
import { sheetFigure } from '../../lessons/common/gameworld/kit/sheetFigure';
import { approx } from '../../lessons/common/gameworld/rootCourts/logic';
import { tiles, tileWord } from '../../lessons/common/gameworld/rootCourts/strings';
import { cellsOf } from './lessonScripts';

/** A count bound to its noun (U+00A0); French plural: 0 and 1 take the singular. */
const counted = (n, one, many) => `${n}\u00a0${n <= 1 ? one : many}`;

const INK = '#0f172a';
const LINE = '#94a3b8';
const FILL = '#e2e8f0';
const OK = '#34d399';
const LEFT = '#fbbf24';
const W = 420;
const H = 190;
const Cap = ({ x, y, children, tone = INK, size = 17, anchor = 'middle' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight="800" fill={tone}>
    {children}
  </text>
);
const Svg = ({ children, label, id }) => (
  <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="mf" data-memo-figure={id}>
    {children}
  </svg>
);

/** A gap of `a` cells, planks of `b` laid from the left; the cells nothing covers stay open at the right end. */
function Bridge({ o }) {
  const { a, first: f } = openingFacts(o);
  const cell = 300 / a;
  const x0 = 60;
  const xR = x0 + 300;
  return (
    <Svg id="bridge" label={o.title}>
      <rect x="0" y="150" width={W} height="40" fill="#bae6fd" />
      <rect x="0" y="92" width={x0} height="98" fill="#cbd5e1" />
      <rect x={xR} y="92" width={W - xR} height="98" fill="#cbd5e1" />
      {Array.from({ length: a }, (_, i) => (
        <rect
          key={i}
          x={x0 + i * cell + 0.7}
          y="92"
          width={cell - 1.4}
          height="20"
          rx="3"
          fill={i >= a - f.r ? LEFT : '#fff'}
          stroke={i >= a - f.r ? '#d97706' : LINE}
          strokeDasharray={i >= a - f.r ? '0' : '3 2'}
        />
      ))}
      {Array.from({ length: f.q }, (_, k) => (
        <rect
          key={k}
          x={x0 + k * f.b * cell + 1.5}
          y="89"
          width={f.b * cell - 3}
          height="26"
          rx="5"
          fill="#f59e0b"
          stroke="#78350f"
          strokeWidth="1.5"
        />
      ))}
      <Cap x={W / 2} y="34">
        {cellsOf(a)} · planches de {f.b}
      </Cap>
      <Cap x={W / 2} y="64" tone={f.exact ? '#047857' : '#b45309'}>
        {counted(f.q, 'planche', 'planches')}
        {f.exact ? ' — le pont tient' : ` — il reste ${cellsOf(f.r)}`}
      </Cap>
    </Svg>
  );
}

/** `a` players as dots; `b` equal teams; those no team can take stay outside. */
function Teams({ o }) {
  const { first: f } = openingFacts(o);
  const gap = W / (f.b + 1);
  return (
    <Svg id="teams" label={o.title}>
      <rect x="6" y="52" width={W - 12} height="92" rx="14" fill="#ecfdf5" stroke="#6ee7b7" />
      {Array.from({ length: f.b }, (_, t) => {
        const cx = gap * (t + 1);
        return (
          <g key={t}>
            <circle cx={cx} cy="98" r="34" fill="#fff" stroke={LINE} strokeWidth="1.5" />
            {Array.from({ length: f.q }, (_, k) => {
              const ang = (2 * Math.PI * k) / f.q - Math.PI / 2;
              const r = f.q === 1 ? 0 : 17;
              return <circle key={k} cx={cx + r * Math.cos(ang)} cy={98 + r * Math.sin(ang)} r="7" fill={INK} />;
            })}
          </g>
        );
      })}
      {Array.from({ length: f.r }, (_, k) => (
        <circle key={k} cx={W / 2 + (k - (f.r - 1) / 2) * 22} cy="166" r="7" fill={LEFT} stroke="#d97706" />
      ))}
      <Cap x={W / 2} y="20">
        {counted(o.a, 'joueur', 'joueurs')} · {counted(f.b, 'équipe', 'équipes')}
      </Cap>
      <Cap x={W / 2} y="44" tone={f.exact ? '#047857' : '#b45309'}>
        {f.q} par équipe{f.exact ? '' : ` — ${f.r} hors des équipes`}
      </Cap>
    </Svg>
  );
}

/** Two kinds of shelves for the same books: one kind is filled exactly, the other leaves books on the floor. */
function Shelves({ o }) {
  const { a, first: f, second: s } = openingFacts(o);
  const Row = ({ y, fit }) => {
    const n = 12;
    const filled = fit.exact ? n : Math.max(1, Math.round((fit.r / fit.b) * n));
    return (
      <g>
        <rect x="150" y={y} width="250" height="46" rx="6" fill="#fff" stroke={LINE} strokeWidth="1.5" />
        <rect x="150" y={y + 42} width="250" height="5" fill={LINE} />
        {Array.from(
          { length: n },
          (_, k) =>
            (fit.exact || k < filled) && (
              <rect
                key={k}
                x={156 + k * 20}
                y={y + 8}
                width="15"
                height="34"
                rx="2"
                fill={fit.exact ? OK : LEFT}
                stroke={fit.exact ? '#047857' : '#d97706'}
              />
            ),
        )}
        <Cap x="76" y={y + 20} size={14}>
          Étagères de {fit.b}
        </Cap>
        <Cap x="76" y={y + 40} size={13} tone={fit.exact ? '#047857' : '#b45309'}>
          {fit.exact
            ? counted(fit.q, 'étagère pleine', 'étagères pleines')
            : `${counted(fit.q, 'étagère', 'étagères')}, reste ${fit.r}`}
        </Cap>
      </g>
    );
  };
  return (
    <Svg id="shelves" label={o.title}>
      <Cap x={W / 2} y="22">
        {counted(a, 'livre', 'livres')}
      </Cap>
      <Row y={38} fit={s} />
      <Row y={112} fit={f} />
    </Svg>
  );
}

/** A strip of `a` cm covered by square tiles: one size leaves a gap smaller than a tile, the other fits exactly. */
function Tiles({ o }) {
  const { a, first: f, second: s } = openingFacts(o);
  const k = 320 / a;
  const x0 = 80;
  const Row = ({ y, fit }) => (
    <g>
      <rect x={x0} y={y} width="320" height="40" fill="#fff" stroke={LINE} strokeDasharray="4 3" />
      {Array.from({ length: fit.q }, (_, i) => (
        <rect
          key={i}
          x={x0 + i * fit.b * k + 1}
          y={y + 1}
          width={fit.b * k - 2}
          height="38"
          rx="3"
          fill={fit.exact ? OK : FILL}
          stroke={fit.exact ? '#047857' : '#64748b'}
        />
      ))}
      {!fit.exact && (
        <rect x={x0 + fit.q * fit.b * k + 1} y={y + 1} width={fit.r * k - 2} height="38" fill={LEFT} stroke="#d97706" />
      )}
      <Cap x="40" y={y + 18} size={15}>
        {fit.b} cm
      </Cap>
      <Cap x="40" y={y + 36} size={13} tone={fit.exact ? '#047857' : '#b45309'}>
        {fit.exact ? counted(fit.q, 'carreau', 'carreaux') : `vide de ${fit.r}\u00a0cm`}
      </Cap>
    </g>
  );
  return (
    <Svg id="tiles" label={o.title}>
      <Cap x={W / 2} y="24">
        Bande de {a} cm
      </Cap>
      <Row y={44} fit={f} />
      <Row y={112} fit={s} />
    </Svg>
  );
}

/**
 * A square court of « Le palais des dalles » (area `a`) and two rods tried on it (`b`, `alt`): in each panel the court's walls, and
 * the square platform built on the rod from the corner post — the BAND it leaves in amber, what STICKS OUT in violet, or
 * green when it rides. Every size comes from the exact numbers (`openingFacts`); a sliver too thin to see is drawn 2 px.
 */
const BLUE = '#3b5bdb';
const KIND_TONE = { ride: '#047857', band: '#b45309', jam: '#6d28d9' };
const isFrac = (x) => String(x).includes('/');
/**
 * A caption that holds ONE number after its words (`lead`): plain text — or, when the number is a fraction (« 88/49 »,
 * lesson 2 of « Le palais des dalles »), the words, the fraction drawn with a REAL bar, then its noun « de dalle »
 * (`noun`, the world's `tileWord`) — a fraction is never written with a slash. Left to right: the words, the fraction,
 * the noun. The fraction sits at `x`, moved by half the difference of the two texts' widths (estimated) so the caption
 * stays about centred.
 */
function NumCap({ x, y, lead, num, noun = 'tiles', tone = INK, size = 17 }) {
  const s = String(num);
  if (!isFrac(s))
    return (
      <Cap x={x} y={y} tone={tone} size={size}>
        {`${lead} ${noun === 'tiles' ? tiles(s) : s}`}
      </Cap>
    );
  const [n, d] = s.split('/');
  const g = Math.round(size * 0.8);
  const w = Math.max(n.length, d.length) * g * 0.62 + 6;
  const after = noun === 'tiles' ? tileWord(s) : '';
  const fx = x + (lead.length - after.length) * size * 0.22;
  const mid = y - size * 0.34;
  return (
    <g data-memo-frac={s}>
      <Cap x={fx - w / 2 - 5} y={y} tone={tone} size={size} anchor="end">
        {lead}
      </Cap>
      <g fill={tone} fontWeight="800" fontSize={g}>
        <text x={fx} y={mid - 3} textAnchor="middle">
          {n}
        </text>
        <line x1={fx - w / 2} x2={fx + w / 2} y1={mid} y2={mid} stroke={tone} strokeWidth="1.6" />
        <text x={fx} y={mid + g + 1} textAnchor="middle">
          {d}
        </text>
      </g>
      {after && (
        <Cap x={fx + w / 2 + 5} y={y} tone={tone} size={size} anchor="start">
          {after}
        </Cap>
      )}
    </g>
  );
}
function CourtPanel({ cx, area, fit, tall }) {
  // a figure that writes a fraction (its bar takes two lines) lays its captions lower and its court smaller
  const S = tall ? 84 : 104; // the longest side drawn in a panel
  const L = Math.sqrt(approx(area));
  const l = Math.sqrt(approx(fit.covers));
  const u = S / Math.max(L, l);
  const post = { x: cx + S / 2, y: 182 };
  const side = L * u;
  // a band or an overhang thinner than 2 px is still drawn 2 px: the figure says « a band », the caption says how much
  const p = fit.kind === 'band' ? Math.min(l * u, side - 2) : fit.kind === 'jam' ? Math.max(l * u, side + 2) : side;
  const lead = fit.kind === 'band' ? 'Une bande de' : 'Elle coince\u00a0: elle dépasse de';
  return (
    <g data-memo-court={fit.kind}>
      {fit.kind === 'jam' && (
        <rect x={post.x - p} y={post.y - p} width={p} height={p} fill="#ddd6fe" stroke="#7c3aed" />
      )}
      <rect
        x={post.x - side}
        y={post.y - side}
        width={side}
        height={side}
        fill={fit.kind === 'band' ? LEFT : '#e0e7ff'}
        stroke={BLUE}
        strokeWidth="2.5"
      />
      <rect
        x={post.x - Math.min(p, side)}
        y={post.y - Math.min(p, side)}
        width={Math.min(p, side)}
        height={Math.min(p, side)}
        fill={fit.kind === 'ride' ? OK : '#c7d2fe'}
        stroke={fit.kind === 'ride' ? '#047857' : BLUE}
        strokeWidth="1.5"
      />
      <rect x={post.x - 4} y={post.y - 4} width="8" height="8" rx="2" fill="#fff" stroke={BLUE} strokeWidth="2" />
      <NumCap x={cx} y={tall ? 56 : 48} size={15} lead="Toise" num={fit.b} noun={null} />
      {fit.kind === 'ride' ? (
        <Cap x={cx} y={tall ? 84 : 68} size={14} tone={KIND_TONE.ride}>
          Elle monte
        </Cap>
      ) : (
        <NumCap x={cx} y={tall ? 84 : 68} size={14} tone={KIND_TONE[fit.kind]} lead={lead} num={fit.diff} />
      )}
    </g>
  );
}
function CourtFig({ o }) {
  const { a, first, second } = openingFacts(o);
  const tall = [a, first.b, first.diff, second?.b, second?.diff].some((x) => x != null && isFrac(x));
  return (
    <Svg id="court" label={o.title}>
      <NumCap x={W / 2} y={tall ? 28 : 22} lead="Une salle carrée de" num={a} />
      <CourtPanel cx={second ? 105 : W / 2} area={a} fit={first} tall={tall} />
      {second && <CourtPanel cx={315} area={a} fit={second} tall={tall} />}
    </Svg>
  );
}

/**
 * A GEOMETRY opening: its `figure` is a bank sheet's `statement.figure` (plane: points, segments, parallels, lengths),
 * drawn by the practice space's own StatementFigure — never a second renderer — at its practice width, never narrower
 * than the width where its smallest label reads 12 px (`kit/sheetFigure.js`, the exam sitting's rule).
 */
function Geo({ o }) {
  const f = sheetFigure(o.figure);
  if (!f) return null;
  return (
    <div
      className="mf mf--geo"
      data-memo-figure={f.kind}
      style={{ maxWidth: f.natural, minWidth: `calc(var(--di-min-font, 12px) * ${f.k})`, marginInline: 'auto' }}
    >
      <StatementFigure {...o.figure} maxWidth="100%" />
    </div>
  );
}

const KINDS = { bridge: Bridge, teams: Teams, shelves: Shelves, tiles: Tiles, court: CourtFig };
/** The drawing of an opening: its own `figure` when it carries one (geometry), else the figure of its `kind`. */
export default function MemoFigure({ opening }) {
  if (opening.figure) return <Geo o={opening} />;
  const Figure = KINDS[opening.kind];
  return Figure ? <Figure o={opening} /> : null;
}
