import KidFigure from './KidFigure';
import { BUNDLE_OFF } from './mosaicLayout';

/**
 * LE MONDE « MOSAÏQUE » (labo `decimal-comma`, 1AM) — l'atelier de zellige, dessiné en code : les pièces à l'échelle, la table du
 * client, le plateau de l'atelier, l'artisane (`KidFigure`, une fille en hijab) et « آلة العشرة ». Rien n'est une image.
 *
 * LES PIÈCES SONT HONNÊTES (MANIPULATION_CONTRACT §2tervicies) : un panneau (1) est 10 × 10 carreaux ; une bande (1/10) est une
 * colonne de 10 carreaux, aussi haute que le panneau ; un carreau (1/100) est UN carreau ; un éclat (1/1000) est UNE lamelle d'un
 * carreau coupé en dix — trop fin pour l'échelle, il est donc montré dans une LOUPE (le carreau agrandi, dix lamelles, autant de
 * pleines que le chiffre des millièmes). Les paquets de 10 / 100 panneaux et les grands totaux sont un SYMBOLE (pile + « ×N »).
 *
 * Une couleur par rang, la même partout : le chiffre, sa pastille de rang et ses pièces (`PIECE`, `rankHue`).
 *
 * DOM : [data-dc-block=panel|strip|tile|shard] (+ [data-count] sur un paquet), [data-dc-lens], [data-dc-op], [data-dc-link].
 */

export const PIECE = Object.freeze({
  panel: { a: '#0F766E', b: '#0D9488', glint: '#99F6E4', edge: '#134E4A', soft: '#CCFBF1' },
  strip: { a: '#B45309', b: '#D97706', glint: '#FDE68A', edge: '#78350F', soft: '#FEF3C7' },
  tile: { a: '#BE123C', b: '#E11D48', glint: '#FECDD3', edge: '#881337', soft: '#FFE4E6' },
  shard: { a: '#6D28D9', b: '#7C3AED', glint: '#DDD6FE', edge: '#4C1D95', soft: '#EDE9FE' },
  bundle: { a: '#3730A3', b: '#4F46E5', glint: '#C7D2FE', edge: '#1E1B4B', soft: '#E0E7FF' },
});

/** La couleur d'un rang (exposant e) : unités, dixièmes, centièmes, millièmes ; au-dessus (indigo/bleu) et en dessous (ardoise). */
export function rankHue(exp) {
  if (exp === 0) return PIECE.panel;
  if (exp === -1) return PIECE.strip;
  if (exp === -2) return PIECE.tile;
  if (exp === -3) return PIECE.shard;
  if (exp > 0) return { a: exp === 1 ? '#0369A1' : exp === 2 ? '#1D4ED8' : '#4338CA', soft: '#E0F2FE', edge: '#1E3A8A', glint: '#BAE6FD' };
  return { a: '#475569', soft: '#F1F5F9', edge: '#1E293B', glint: '#E2E8F0' };
}

const LRI = '⁦';
const PDI = '⁩';
const spacedNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Les motifs (damier de carreaux avec un losange émaillé) : `uid` rend les identifiants uniques dans la page. */
export function MosaicDefs({ uid, c }) {
  const cell = (x, y, tone, hue) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={c} height={c} fill={tone} />
      <path d={`M${x + c / 2} ${y + c * 0.17} L${x + c * 0.83} ${y + c / 2} L${x + c / 2} ${y + c * 0.83} L${x + c * 0.17} ${y + c / 2}Z`} fill={hue.glint} opacity={0.2} />
      <rect x={x + 0.25} y={y + 0.25} width={c - 0.5} height={c - 0.5} fill="none" stroke="#FFFFFF" strokeOpacity={0.38} strokeWidth={0.6} />
    </g>
  );
  return (
    <defs>
      {['panel', 'strip', 'tile', 'bundle'].map((k) => (
        <pattern key={k} id={`dcp-${k}-${uid}`} width={2 * c} height={2 * c} patternUnits="userSpaceOnUse">
          {cell(0, 0, PIECE[k].a, PIECE[k])}{cell(c, 0, PIECE[k].b, PIECE[k])}{cell(0, c, PIECE[k].b, PIECE[k])}{cell(c, c, PIECE[k].a, PIECE[k])}
        </pattern>
      ))}
      <linearGradient id={`dcg-${uid}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.4} />
        <stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0} />
      </linearGradient>
    </defs>
  );
}

/** Un carré de carreaux (panneau, bande, carreau) : l'ombre, le damier, le reflet, le liseré. */
function Slab({ w, h, kind, uid, rx = 1.5, shadow = true }) {
  const P = PIECE[kind];
  return (
    <g>
      {shadow && <rect x={1.2} y={2} width={w} height={h} rx={rx} fill="#1E1B4B" opacity={0.2} />}
      <rect width={w} height={h} rx={rx} fill={`url(#dcp-${kind}-${uid})`} />
      <rect width={w} height={h} rx={rx} fill={`url(#dcg-${uid})`} />
      <rect width={w} height={h} rx={rx} fill="none" stroke={P.edge} strokeWidth={0.9} />
    </g>
  );
}

/** Un paquet de 10 / 100 panneaux (ou un grand total) : une pile, et le compte exact. Un symbole, pas à l'échelle. */
function Bundle({ w, h, mult, uid }) {
  const s = w - 2 * BUNDLE_OFF;
  const P = PIECE.bundle;
  return (
    <g>
      {[2, 1, 0].map((k) => (
        <g key={k} transform={`translate(${k * BUNDLE_OFF} ${(2 - k) * BUNDLE_OFF})`} opacity={k === 0 ? 1 : 0.9}>
          <Slab w={s} h={s} kind="panel" uid={uid} shadow={k === 0} />
        </g>
      ))}
      <rect x={w / 2 - Math.max(22, String(mult).length * 6 + 12)} y={h / 2 - 10} width={2 * Math.max(22, String(mult).length * 6 + 12)} height={20} rx={10} fill="#FFFFFF" stroke={P.edge} strokeWidth={1.4} />
      <text x={w / 2} y={h / 2 + 5} textAnchor="middle" fontSize={13} fontWeight={900} fill={P.edge} style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{`${LRI}×${spacedNum(mult)}${PDI}`}</text>
    </g>
  );
}

/** La loupe : un carreau agrandi, coupé en dix lamelles (les éclats, 1/10 de carreau chacune) — `icons` pleines. */
function Lens({ w, icons }) {
  const P = PIECE.shard;
  const r = w / 2;
  const L = w * 0.56;
  const sliver = L / 10;
  return (
    <g data-dc-lens={icons}>
      <circle cx={r} cy={r} r={r - 2} fill="#FFFFFF" stroke="#B45309" strokeWidth={3.2} />
      <circle cx={r} cy={r} r={r - 5} fill="#F5F3FF" />
      <g transform={`translate(${r - L / 2} ${r - L / 2})`}>
        <rect x={0} y={0} width={L} height={L} rx={1.5} fill="#FFFFFF" stroke={P.edge} strokeWidth={1} />
        {Array.from({ length: 10 }, (_, i) => (
          i < icons
            ? <rect key={i} data-dc-block="shard" x={i * sliver + 0.3} y={0.3} width={sliver - 0.6} height={L - 0.6} fill={i % 2 ? P.b : P.a} />
            : <rect key={i} x={i * sliver + 0.3} y={0.3} width={sliver - 0.6} height={L - 0.6} fill="none" stroke={P.a} strokeOpacity={0.35} strokeWidth={0.6} strokeDasharray="2 2" />
        ))}
      </g>
    </g>
  );
}

/** Toutes les pièces d'une mise en page (`mosaicLayout.layoutBlocks`). `popKey` change quand la virgule bouge : les pièces « tombent » en place. */
export function MosaicBlocks({ layout, uid, popKey = '', pop = true }) {
  const c = layout.s / 10;
  return (
    <g>
      {layout.items.map((it) => {
        const key = `${popKey}-${it.id}`;
        // la position (attribut transform) et l'animation (CSS transform) sont sur DEUX groupes : le CSS écraserait l'attribut
        const wrap = (children, extra = {}) => (
          <g key={key} transform={`translate(${it.x} ${it.y})`} {...extra}>
            <g className={pop ? 'dc-pop' : undefined}>{children}</g>
          </g>
        );
        if (it.kind === 'panel') return wrap(<Slab w={it.w} h={it.h} kind="panel" uid={uid} rx={2} />, { 'data-dc-block': 'panel' });
        if (it.kind === 'bundle') return wrap(<Bundle w={it.w} h={it.h} mult={it.mult} uid={uid} />, { 'data-dc-block': 'panel', 'data-count': it.mult });
        if (it.kind === 'strips') {
          return wrap(Array.from({ length: it.icons }, (_, i) => (
            <g key={i} transform={`translate(${i * (c + 2)} 0)`} data-dc-block="strip"><Slab w={c} h={layout.s} kind="strip" uid={uid} rx={1} /></g>
          )));
        }
        if (it.kind === 'tiles') {
          return wrap(Array.from({ length: it.icons }, (_, i) => (
            <g key={i} transform={`translate(${(i % 3) * (c + 2)} ${Math.floor(i / 3) * (c + 2)})`} data-dc-block="tile"><Slab w={c} h={c} kind="tile" uid={uid} rx={0.8} /></g>
          )));
        }
        return wrap(<Lens w={it.w} icons={it.icons} uid={uid} />);
      })}
    </g>
  );
}

/** La table du client : une nappe crème à liseré laiton (le fond d'une zone `w × h`). */
export function ClientTable({ w, h }) {
  return (
    <g aria-hidden="true">
      <rect x={1} y={1} width={w - 2} height={h - 2} rx={16} fill="#FFFBEB" stroke="#D6A44A" strokeWidth={2} />
      <rect x={7} y={7} width={w - 14} height={h - 14} rx={11} fill="none" stroke="#E7C98A" strokeWidth={1.2} strokeDasharray="1 5" strokeLinecap="round" />
    </g>
  );
}

/** Le plateau de l'atelier : un plateau de bois (rebord, fond clair). */
export function WoodTray({ w, h }) {
  return (
    <g aria-hidden="true">
      <rect x={0} y={3} width={w} height={h - 2} rx={16} fill="#7C4A21" />
      <rect x={1} y={1} width={w - 2} height={h - 4} rx={15} fill="#B7773D" stroke="#7C4A21" strokeWidth={1} />
      <rect x={8} y={8} width={w - 16} height={h - 18} rx={10} fill="#F4E4C8" stroke="#8A5A2B" strokeWidth={1.2} />
      <rect x={8} y={8} width={w - 16} height={7} rx={4} fill="#8A5A2B" opacity={0.14} />
    </g>
  );
}

/** Le mur de l'atelier : un semis d'étoiles à huit branches (deux carrés), très discret, pour le fond d'un cadre. */
export function StarWall({ uid }) {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" data-dc-wall>
      <defs>
        <pattern id={`dcw-${uid}`} width={44} height={44} patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#6366F1" strokeOpacity={0.13} strokeWidth={1}>
            <rect x={12} y={12} width={20} height={20} />
            <rect x={12} y={12} width={20} height={20} transform="rotate(45 22 22)" />
            <circle cx={22} cy={22} r={3} fill="#6366F1" fillOpacity={0.06} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dcw-${uid})`} />
    </svg>
  );
}

/** L'artisane : une fille en hijab devant son établi (large seulement). `mood` réagit au verdict. */
export function Craftswoman({ mood = 'neutral', width = 232, height = 118, world = 'mosaic' }) {
  const uid = 'kid';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true" data-dc-kid={mood}>
      <rect width={width} height={height} fill="#FFF8EC" />
      <rect width={width} height={14} fill="#FDE7C2" />
      <MosaicDefs uid={uid} c={2.4} />
      {/* le mur : quelques carreaux accrochés */}
      <g opacity={0.9}>
        <g transform="translate(14 20)"><Slab w={26} h={26} kind="panel" uid={uid} rx={2} /></g>
        <g transform="translate(46 28)"><Slab w={18} h={18} kind="tile" uid={uid} rx={2} /></g>
        <g transform={`translate(${width - 44} 22)`}><Slab w={24} h={24} kind="strip" uid={uid} rx={2} /></g>
      </g>
      <KidFigure cx={width / 2} top={8} foot={174} hairStyle="hijab" scarf="sky" outfit="orange" skin="wheat" mood={mood} shadow={false} />
      {/* l'établi, avec un panneau et une règle */}
      <rect x={6} y={86} width={width - 12} height={10} rx={3} fill="#C08A4E" />
      <rect x={6} y={95} width={width - 12} height={23} fill="#A9743F" />
      <g transform="translate(24 62)"><Slab w={22} h={22} kind="panel" uid={uid} rx={2} /></g>
      <g transform={`translate(${width - 64} 70)`}>
        {world === 'machine'
          ? <g><rect width={40} height={16} rx={4} fill="#4F46E5" /><circle cx={12} cy={8} r={4.5} fill="#C7D2FE" /><circle cx={28} cy={8} r={4.5} fill="#C7D2FE" /></g>
          : <g><Slab w={4} h={22} kind="strip" uid={uid} rx={1} /><g transform="translate(9 0)"><Slab w={4} h={22} kind="strip" uid={uid} rx={1} /></g><g transform="translate(20 12)"><Slab w={8} h={8} kind="tile" uid={uid} rx={1} /></g></g>}
      </g>
    </svg>
  );
}

/** Le visage de l'artisane dans une pastille ronde (la colonne étroite : c'est elle qui « parle » dans le bandeau de verdict). */
export function CraftswomanAvatar({ mood = 'neutral', size = 44 }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-hidden="true" data-dc-kid={mood} className="shrink-0">
      <defs><clipPath id="dc-avatar-clip"><circle cx={r} cy={r} r={r - 1} /></clipPath></defs>
      <g clipPath="url(#dc-avatar-clip)">
        <rect width={size} height={size} fill="#FDE7C2" />
        <KidFigure cx={r} top={size * 0.14} foot={size * 0.14 + size * 2.3} hairStyle="hijab" scarf="sky" outfit="orange" skin="wheat" mood={mood} shadow={false} />
      </g>
      <circle cx={r} cy={r} r={r - 1} fill="none" stroke="#D6A44A" strokeWidth={2} />
    </svg>
  );
}

/**
 * « آلة العشرة » : un coffret de verre (on voit les liens à travers) où l'on lit l'opération. `links` : pour chaque chiffre,
 * `{ x1, x2, delta }` (le nombre de rangs est écrit sur la pastille du chiffre de sortie, pas ici) — x1 au-dessus (chiffre d'entrée), x2 au-dessous (même chiffre en sortie), `delta` le nombre de rangs que ce chiffre a
 * parcourus dans SA planche (0 : il n'a pas bougé). Les liens sont l'évidence : jamais une règle.
 */
export function TenMachine({ width, height = 78, op, links = [], spin = true }) {
  const inset = 4;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-hidden="true" style={{ overflow: 'visible' }} data-dc-machine>
      <rect x={inset} y={inset} width={width - 2 * inset} height={height - 2 * inset} rx={14} fill="#EEF2FF" fillOpacity={0.55} stroke="#4338CA" strokeWidth={4} />
      <rect x={inset + 2} y={inset + 2} width={width - 2 * inset - 4} height={9} rx={4} fill="#4338CA" opacity={0.9} />
      <rect x={inset + 2} y={height - inset - 11} width={width - 2 * inset - 4} height={9} rx={4} fill="#4338CA" opacity={0.9} />
      {[inset + 10, width - inset - 10].map((x) => [inset + 6.5, height - inset - 6.5].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r={2.4} fill="#C7D2FE" />))}
      {links.map((l, i) => {
        const moved = l.delta !== 0;
        return (
          <g key={i} data-dc-link={i} data-delta={l.delta}>
            <line x1={l.x1} y1={0} x2={l.x2} y2={height} stroke={moved ? '#D97706' : '#94A3B8'} strokeWidth={moved ? 2.2 : 1.4} strokeDasharray={moved ? undefined : '3 3'} strokeLinecap="round" />
          </g>
        );
      })}
      {[inset + 22, width - inset - 22].map((x, k) => (
        <g key={x} transform={`translate(${x} ${height / 2})`} opacity={0.85}>
          <g className={spin ? (k ? 'dc-spin-rev' : 'dc-spin') : undefined} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle r={9} fill="#A5B4FC" stroke="#4338CA" strokeWidth={1.4} />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-1.8} y={-13} width={3.6} height={5} rx={1} fill="#4338CA" transform={`rotate(${i * 45})`} />)}
            <circle r={3} fill="#EEF2FF" />
          </g>
        </g>
      ))}
      <g data-dc-op={op}>
        <rect x={width / 2 - 52} y={height / 2 - 18} width={104} height={36} rx={18} fill="#FBBF24" stroke="#92400E" strokeWidth={2.4} />
        <rect x={width / 2 - 48} y={height / 2 - 15} width={96} height={12} rx={6} fill="#FFFFFF" opacity={0.28} />
        <text x={width / 2} y={height / 2 + 8.5} textAnchor="middle" fontSize={25} fontWeight={900} fill="#451A03" style={{ direction: 'ltr', unicodeBidi: 'isolate' }}>{`${LRI}${op}${PDI}`}</text>
      </g>
    </svg>
  );
}

/** Les keyframes du monde (arrêtées par `prefers-reduced-motion`). */
export const MOSAIC_CSS = '@keyframes dc-pop{from{transform:translateY(-6px);opacity:.2}to{transform:translateY(0);opacity:1}}'
  + '@keyframes dc-spin{to{transform:rotate(360deg)}}'
  + '@keyframes dc-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}'
  + '@keyframes dc-stamp{0%{scale:1.6;rotate:-8deg;opacity:0}60%{scale:.94;rotate:-3deg;opacity:1}100%{scale:1;rotate:-2deg;opacity:1}}'
  + '.dc-pop{animation:dc-pop .26s ease-out both}'
  + '.dc-spin{animation:dc-spin 9s linear infinite}.dc-spin-rev{animation:dc-spin 9s linear infinite reverse}'
  + '.dc-shake{animation:dc-shake .3s ease-in-out 1}'
  + '.dc-stamp{animation:dc-stamp .4s cubic-bezier(.34,1.56,.64,1) both}'
  + '@media (prefers-reduced-motion: reduce){.dc-pop,.dc-spin,.dc-spin-rev,.dc-shake,.dc-stamp{animation:none}}';
