
/**
 * UN OBJET DÉNOMBRABLE — dessiné, jamais un rond ni un emoji.
 *
 * La bibliothèque a son livre (`BookFigure`), le terrain a son joueur
 * (`PlayerFigure`). Les autres leçons de l'unité répartissent elles aussi des
 * objets en groupes identiques : des fleurs en bouquets, des ballons et des
 * maillots en équipes, des stylos et des cahiers en trousses, des cuillères
 * et des tasses en parts d'une recette. Ce fichier dessine ces objets, en SVG
 * paramétré, pour la même raison que le livre et le joueur (root CLAUDE.md) :
 *
 *   • l'objet RÉAGIT — il se grise quand il reste en dehors des groupes ;
 *   • 90 fleurs sont 90 nœuds SVG identiques, sans un octet de réseau ;
 *   • le compte que l'élève lit est le compte qu'il voit : quand le dessin
 *     EST l'argument (le reste), une image générée qui montre 9 objets au
 *     lieu de 10 serait une leçon fausse.
 *
 * `kind` choisit l'objet ; `tone` sa teinte quand le thème en a deux (les
 * fleurs rouges et blanches) ; `muted` le grise (objet resté en dehors).
 * `width` en px (nombre) ou longueur CSS (chaîne : `var(--sa-item)`, la taille
 * fluide de `GroupingScene`) ; la hauteur suit le viewBox carré.
 *
 * Aucun texte arabe ici : les mots viennent de `itemThemes.js` + lesson.json.
 */

const MUTED = { fill: '#CBD5E1', dark: '#94A3B8', light: '#F1F5F9' };

export default function ItemFigure({ kind = 'flower', tone = 'a', width = 18, muted = false, title, className = '' }) {
  // Une longueur CSS (var(), clamp()) n'est pas un attribut SVG valide : elle
  // passe par `style`, qui fixe aussi la boîte cliquable / mesurée.
  const fluid = typeof width === 'string';
  const common = {
    ...(fluid ? { style: { width, height: width, flex: 'none' } } : { width, height: width }),
    viewBox: '0 0 40 40',
    className: `sa-item sa-item--${kind} ${muted ? 'sa-item--muted' : ''} ${className}`,
    role: title ? 'img' : undefined,
    'aria-hidden': title ? undefined : 'true',
    'aria-label': title,
    focusable: 'false',
  };
  const Draw = DRAWINGS[kind] ?? DRAWINGS.flower;
  return (
    <svg {...common}>
      {title && <title>{title}</title>}
      <Draw tone={tone} muted={muted} />
    </svg>
  );
}

/* ── Les dessins ─────────────────────────────────────────────────────────── */

function Flower({ tone, muted }) {
  const red = tone === 'a' || tone === 'red';
  const petal = muted ? MUTED.fill : red ? '#E11D48' : '#FFFFFF';
  // Le bord de la fleur blanche est ardoise, pas gris perle : sur un cadre
  // pâle et au projecteur, un bord #CBD5E1 la faisait disparaître.
  const petalEdge = muted ? MUTED.dark : red ? '#9F1239' : '#64748B';
  const heart = muted ? MUTED.dark : '#FBBF24';
  const stem = muted ? MUTED.dark : '#15803D';
  return (
    <>
      <path d="M20 22 L20 37" stroke={stem} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M20 31 Q13 30 12 25 Q18 25 20 31 Z" fill={stem} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="20" cy="9.5" rx="4.2" ry="6.5" fill={petal} stroke={petalEdge} strokeWidth="1.3" transform={`rotate(${deg} 20 16)`} />
      ))}
      <circle cx="20" cy="16" r="4" fill={heart} stroke={muted ? MUTED.dark : '#B45309'} strokeWidth="1" />
    </>
  );
}

function Ball({ muted }) {
  const ink = muted ? MUTED.dark : '#1E293B';
  return (
    <>
      <ellipse cx="20" cy="36" rx="10" ry="2.2" fill="#0F172A" opacity=".14" />
      <circle cx="20" cy="20" r="14" fill={muted ? MUTED.light : '#FFFFFF'} stroke={ink} strokeWidth="1.6" />
      <path d="M20 12.4 L25 16.1 L23.1 22 L16.9 22 L15 16.1 Z" fill={ink} />
      <path d="M20 6 L20 12.4 M33.6 16.4 L25 16.1 M28.4 31.4 L23.1 22 M11.6 31.4 L16.9 22 M6.4 16.4 L15 16.1" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
    </>
  );
}

function Shirt({ muted }) {
  const fill = muted ? MUTED.fill : '#4F46E5';
  const trim = muted ? MUTED.light : '#C7D2FE';
  const edge = muted ? MUTED.dark : '#312E81';
  return (
    <>
      <path d="M13 6 Q20 3 27 6 L36 12 L32 19 L28 17 L28 35 L12 35 L12 17 L8 19 L4 12 Z" fill={fill} stroke={edge} strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M15.5 6.5 L20 12 L24.5 6.5" stroke={trim} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M12 33 L28 33" stroke={trim} strokeWidth="1.6" />
    </>
  );
}

function Pen({ muted }) {
  const body = muted ? MUTED.fill : '#F59E0B';
  const edge = muted ? MUTED.dark : '#B45309';
  const wood = muted ? MUTED.light : '#FDE68A';
  return (
    <g transform="rotate(-40 20 20)">
      <rect x="16" y="4" width="8" height="24" rx="1.5" fill={body} stroke={edge} strokeWidth="1.2" />
      <rect x="16" y="4" width="8" height="4" rx="1.5" fill={muted ? MUTED.dark : '#F43F5E'} stroke={edge} strokeWidth="1.2" />
      <path d="M16 28 L20 36 L24 28 Z" fill={wood} stroke={edge} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M18.6 33.2 L20 36 L21.4 33.2 Z" fill={muted ? MUTED.dark : '#1E293B'} />
    </g>
  );
}

function Notebook({ muted }) {
  const cover = muted ? MUTED.fill : '#0EA5E9';
  const edge = muted ? MUTED.dark : '#075985';
  const ring = muted ? MUTED.dark : '#334155';
  return (
    <>
      <rect x="9" y="6" width="23" height="29" rx="2.5" fill={cover} stroke={edge} strokeWidth="1.4" />
      <rect x="13" y="13" width="15" height="14" rx="1.5" fill={muted ? MUTED.light : '#FFFFFF'} opacity=".9" />
      {[10, 16, 22, 28].map((y) => <rect key={y} x="6.5" y={y} width="6" height="2.6" rx="1.3" fill={ring} />)}
    </>
  );
}

function Spoon({ muted }) {
  const metal = muted ? MUTED.fill : '#CBD5E1';
  const edge = muted ? MUTED.dark : '#64748B';
  const sugar = muted ? MUTED.light : '#FFFFFF';
  return (
    <g transform="rotate(-35 20 20)">
      <rect x="18.4" y="17" width="3.2" height="19" rx="1.6" fill={metal} stroke={edge} strokeWidth="1" />
      <ellipse cx="20" cy="12" rx="7" ry="8.5" fill={metal} stroke={edge} strokeWidth="1.2" />
      <ellipse cx="20" cy="11" rx="5" ry="5.5" fill={sugar} stroke={muted ? MUTED.dark : '#E2E8F0'} strokeWidth="1" />
    </g>
  );
}

function Cup({ muted }) {
  const glass = muted ? MUTED.fill : '#E0F2FE';
  const edge = muted ? MUTED.dark : '#0369A1';
  const flour = muted ? MUTED.light : '#FEF3C7';
  return (
    <>
      <path d="M9 9 L31 9 L28 35 L12 35 Z" fill={glass} stroke={edge} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M11.4 22 L28.6 22 L27.2 34 L12.8 34 Z" fill={flour} />
      <path d="M31 13 Q37 15 35 21 Q34 25 30 25" stroke={edge} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M13 15 L27 15" stroke={edge} strokeWidth="1" opacity=".5" />
    </>
  );
}

const DRAWINGS = { flower: Flower, ball: Ball, shirt: Shirt, pen: Pen, notebook: Notebook, spoon: Spoon, cup: Cup };
