import React from 'react';

/**
 * Connaissances de la leçon « Parallélisme et perpendicularité » (6e) —
 * SOURCE UNIQUE (docs/architecture/KNOWLEDGE_MAP.md, KNOWLEDGE_DEPENDENCY.md).
 *
 * ORDRE — chaque item est posé par un <KnowledgeBrick> au module qui le
 * déclare, à l'instant où le geste vient de lui donner son sens :
 *
 *   M1  deux droites parallèles : elles ne se coupent jamais
 *   M2  l'écart constant, le critère vérifiable — et la distance à une droite
 *   M3  deux droites perpendiculaires : l'angle droit, exactement
 *   M4  la relation lie DEUX droites ; deux ⊥ à une même droite sont //
 *   M5  le rituel de l'équerre (deux conditions)
 *   M6  sécantes, et la perpendicularité comme cas particulier
 *   M7  construire une parallèle par deux perpendiculaires ; unicité
 *   M8  la distance d'un point à une droite est le plus court chemin
 *
 * ⚠️ LES DEUX RELATIONS SE DÉFINISSENT SÉPARÉMENT, chacune après son geste :
 * « parallèles » par l'écart constant (M1-M2), « perpendiculaires » par
 * l'angle droit (M3). Ce sont deux briques distinctes, jamais posées ensemble.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => <p className="text-xs text-rose-600">⚠️ {children}</p>;

/**
 * Deux droites, avec le codage de la relation.
 *
 * LA FIGURE EST CALCULÉE, PAS DESSINÉE À L'ŒIL. Les coordonnées étaient
 * saisies à la main : agrandie, la figure « perpendiculaire » montrait un
 * angle qui n'était pas droit (produit scalaire ≈ 1388 au lieu de 0), et
 * l'équerre flottait à côté du croisement. Sur la carte qui ENSEIGNE l'angle
 * droit, c'est le dessin qui contredisait la leçon.
 *
 * Tout part maintenant d'un vecteur directeur u : la seconde droite suit son
 * normal (-uy, ux) — perpendiculaire par construction, à n'importe quelle
 * taille — et l'équerre est bâtie sur ces deux mêmes vecteurs, donc posée
 * exactement dans l'angle.
 */
function DeuxDroites({ kind = 'paralleles', color = '#0284c7' }) {
  // Le viewBox fixe la GÉOMÉTRIE, pas la taille : la largeur affichée est
  // décidée par ConceptVisual (`visualSize` de l'item).
  //
  // La légende est en HTML, PAS en <text> : un <text> vit dans le viewBox et
  // grandirait avec le dessin, au point de dépasser le titre de la carte.
  const W = 160, H = 62;
  const cx = W / 2, cy = H / 2;

  // Direction commune, normalisée : la pente douce se lit sans effort.
  const dx = 8, dy = -2.2;
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  // Le normal — c'est LUI qui garantit les 90°.
  const nx = -uy, ny = ux;

  const seg = (px, py, half) =>
    [px - ux * half, py - uy * half, px + ux * half, py + uy * half].map((v) => +v.toFixed(2));
  const segN = (px, py, half) =>
    [px - nx * half, py - ny * half, px + nx * half, py + ny * half].map((v) => +v.toFixed(2));

  const stroke = { stroke: color, strokeWidth: 2.6, strokeLinecap: 'round' };
  const legend = kind === 'paralleles' ? 'même écart partout' : 'angle droit : 90°';

  let figure;
  if (kind === 'paralleles') {
    const gap = 17;                       // écart mesuré perpendiculairement
    const half = W / 2 - 12;
    const [ax1, ay1, ax2, ay2] = seg(cx + nx * gap / 2, cy + ny * gap / 2, half);
    const [bx1, by1, bx2, by2] = seg(cx - nx * gap / 2, cy - ny * gap / 2, half);
    figure = (
      <>
        <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} {...stroke} />
        <line x1={bx1} y1={by1} x2={bx2} y2={by2} {...stroke} />
        {/* Les deux mesures de l'écart : même longueur, portées par le normal. */}
        {[-0.42, 0.42].map((t) => {
          const px = cx + ux * (half * t), py = cy + uy * (half * t);
          // D'une droite à l'autre, exactement : c'est CE segment qui montre
          // que l'écart ne change pas.
          return (
            <line key={t} x1={+(px + nx * gap / 2).toFixed(2)} y1={+(py + ny * gap / 2).toFixed(2)}
              x2={+(px - nx * gap / 2).toFixed(2)} y2={+(py - ny * gap / 2).toFixed(2)}
              stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="3.5 2.5" strokeLinecap="round" />
          );
        })}
      </>
    );
  } else {
    const half = W / 2 - 12;
    const [ax1, ay1, ax2, ay2] = seg(cx, cy, half);
    const [bx1, by1, bx2, by2] = segN(cx, cy, H / 2 - 10);
    const m = 11;                         // côté de l'équerre
    figure = (
      <>
        <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} {...stroke} />
        <line x1={bx1} y1={by1} x2={bx2} y2={by2} {...stroke} />
        {/* L'équerre, bâtie sur u et n : elle épouse l'angle au lieu de le longer. */}
        <path
          d={`M ${(cx + ux * m).toFixed(2)} ${(cy + uy * m).toFixed(2)}
              L ${(cx + ux * m + nx * m).toFixed(2)} ${(cy + uy * m + ny * m).toFixed(2)}
              L ${(cx + nx * m).toFixed(2)} ${(cy + ny * m).toFixed(2)}`}
          fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" opacity="0.75" />
        <circle cx={cx} cy={cy} r="2.4" fill={color} />
      </>
    );
  }

  return (
    <figure className="w-full m-0">
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="select-none w-full h-auto">
        {figure}
      </svg>
      <figcaption className="mt-1 text-center font-mono text-xs text-slate-500">{legend}</figcaption>
    </figure>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Parallèles : jamais de point commun. ── */
    1: [
      {
        id: 'droites-paralleles',
        type: 'concepts',
        title: 'Deux droites parallèles',
        summary: 'Deux droites qui ne se coupent en aucun point, même prolongées sans fin.',
        visual: <DeuxDroites kind="paralleles" color="#4f46e5" />,
        visualSize: 'lg',
        body: (
          <div className="space-y-2">
            <p>
              Le critère est absolu : <strong>aucun point commun</strong>, aussi loin qu’on prolonge.
              On note <span className="font-mono font-bold">d₁ // d₂</span>.
            </p>
            <Piege>
              « Elles ont l’air de ne pas se toucher sur le dessin » ne prouve rien : la feuille ne
              montre qu’un morceau, et deux droites d’inclinaisons très proches s’y ressemblent.
            </Piege>
            <Souvenir>la paire B, qui s’est coupée dès que tu as reculé la vue.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le critère qu'on peut vraiment vérifier. ── */
    2: [
      {
        id: 'ecart-constant',
        type: 'regles',
        title: 'L’écart constant',
        summary: 'Deux droites sont parallèles exactement quand leur écart est le même partout.',
        visual: <DeuxDroites kind="paralleles" color="#0284c7" />,
        visualSize: 'lg',
        body: (
          <div className="space-y-2">
            <p>
              Prolonger à l’infini est impossible sur une feuille. Mais on peut{' '}
              <strong>mesurer l’écart en plusieurs endroits</strong> : s’il ne change jamais, les
              droites ne se rencontreront jamais.
            </p>
            <p className="text-xs text-slate-500">
              Si l’écart se resserre d’un côté, les droites finiront par se toucher : elles ne sont
              pas parallèles.
            </p>
            <Souvenir>les trois mesures identiques sur la première paire, et les trois différentes sur la seconde.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mesurer-ecart',
        type: 'methodes',
        title: 'Mesurer un écart, c’est mesurer à angle droit',
        summary: 'Le trait de mesure part du point et arrive perpendiculairement sur l’autre droite.',
        body: (
          <div className="space-y-2">
            <p>
              L’écart d’un point à une droite ne se mesure pas « droit devant » : le trait de mesure
              rejoint la droite en formant un coin parfait — le même que le coin d’une feuille.
            </p>
            <Piege>
              Une mesure prise en biais donne toujours un nombre trop grand : ce n’est pas l’écart.
            </Piege>
            <Souvenir>le trait de mesure qui restait toujours perpendiculaire quand tu glissais P.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — Perpendiculaires : l'angle droit, exactement. ── */
    3: [
      {
        id: 'droites-perpendiculaires',
        type: 'concepts',
        title: 'Deux droites perpendiculaires',
        summary: 'Deux droites qui se coupent en formant un angle droit — 90° exactement.',
        visual: <DeuxDroites kind="perp" color="#059669" />,
        body: (
          <div className="space-y-2">
            <p>
              L’angle droit mesure exactement 90°. Deux droites qui se croisent en le formant sont
              perpendiculaires : on note <span className="font-mono font-bold">d₁ ⊥ d₂</span>, et on
              le code par un petit carré au point de croisement.
            </p>
            <Piege>
              89° ou 91° ne suffisent pas : il n’existe pas de « presque perpendiculaire ». C’est
              pour cela que la marque refusait d’apparaître avant le bon angle.
            </Piege>
            <Souvenir>le petit carré qui a surgi tout seul au déclic, et pas avant.</Souvenir>
          </div>
        ),
      },
      {
        id: 'orientation-sans-importance',
        type: 'regles',
        title: 'L’inclinaison sur la page ne compte pas',
        summary: 'Perpendiculaire ne veut pas dire « une verticale et une horizontale ».',
        body: (
          <div className="space-y-2">
            <p>
              Ce qui compte est l’angle <strong>entre</strong> les deux droites, pas leur position par
              rapport au bord de la feuille. Deux droites toutes deux penchées peuvent parfaitement
              être perpendiculaires.
            </p>
            <Souvenir>les deux droites obliques dont le petit carré était pourtant bien là.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Une relation lie deux droites. ── */
    4: [
      {
        id: 'relation-binaire',
        type: 'regles',
        title: 'Parallèle et perpendiculaire relient DEUX droites',
        summary: 'Une droite seule n’est ni parallèle ni perpendiculaire : il faut dire à quoi.',
        body: (
          <div className="space-y-2">
            <p>
              « Cette rue est parallèle » ne veut rien dire. Parallèle à quoi ? Une même droite peut
              être parallèle à l’une et perpendiculaire à une autre.
            </p>
            <Souvenir>la rue A, parallèle à la rue B et perpendiculaire à la rue C.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-deux-perp',
        type: 'memoriser',
        title: '⭐ Deux perpendiculaires à une même droite sont parallèles',
        summary: 'Si d₁ ⊥ c et d₂ ⊥ c, alors d₁ // d₂.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
              <div className="text-sm font-black text-rose-700 font-mono">d₁ ⊥ c &nbsp;et&nbsp; d₂ ⊥ c</div>
              <div className="text-sm font-black text-rose-700">donc</div>
              <div className="text-sm font-black text-rose-700 font-mono">d₁ // d₂</div>
            </div>
            <p className="text-xs text-slate-500">
              Deux angles droits sur la même droite forcent la même inclinaison. C’est cette
              propriété qui permettra de <strong>tracer</strong> une parallèle sans la deviner.
            </p>
            <Souvenir>les rues A et B, toutes deux à angle droit avec la rue C.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Le geste, pas seulement la propriété. ── */
    5: [
      {
        id: 'rituel-equerre',
        type: 'methodes',
        title: 'Poser l’équerre : deux conditions',
        summary: 'Un côté de l’angle droit le long de la droite, ET le sommet exactement sur le point.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1">
              <div>① un côté de l’angle droit posé <strong>le long de la droite</strong></div>
              <div>② le <strong>sommet</strong> de l’angle droit posé <strong>sur le point</strong></div>
            </div>
            <p>
              Le second côté indique alors la perpendiculaire. Les deux conditions sont
              indispensables : l’équerre matérialise un angle droit <em>en son sommet</em>.
            </p>
            <Piege>
              Bien orientée mais posée à côté du point, l’équerre ne prouve rien pour ce point : le
              coin contrôlé est ailleurs.
            </Piege>
            <Souvenir>les deux voyants qu’il fallait allumer ensemble.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Ranger les trois cas. ── */
    6: [
      {
        id: 'secantes',
        type: 'vocabulaire',
        title: 'Deux droites sécantes',
        summary: 'Deux droites qui se coupent en un point — quel que soit l’angle formé.',
        body: (
          <div className="space-y-2">
            <p>
              Deux droites qui ne sont pas parallèles se coupent : elles sont sécantes. Si en plus
              l’angle qu’elles forment vaut exactement 90°, elles sont perpendiculaires.
            </p>
            <p className="text-xs text-slate-500">
              La perpendicularité est donc un <strong>cas particulier</strong> de sécance, pas une
              troisième catégorie séparée.
            </p>
            <Souvenir>les trois figures que tu as rangées, dont une seule portait le petit carré.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — Construire : l'instrument garantit la propriété. ── */
    7: [
      {
        id: 'construire-parallele',
        type: 'methodes',
        title: 'Tracer une parallèle avec l’équerre',
        summary: 'On trace deux perpendiculaires successives — l’angle droit garantit le résultat.',
        body: (
          <div className="space-y-2">
            <p>
              Tracer à l’œil « en gardant la même pente » ne garantit rien. En revanche, si d′ et d
              sont toutes deux perpendiculaires à une même droite, elles sont parallèles : c’est
              certain, sans rien mesurer.
            </p>
            <Souvenir>l’équerre bien posée, et le bouton Tracer qui ne s’activait qu’à ce moment-là.</Souvenir>
          </div>
        ),
      },
      {
        id: 'unicite-perpendiculaire',
        type: 'regles',
        title: 'Par un point, une seule perpendiculaire',
        summary: 'À une droite donnée et par un point donné, il ne passe qu’une perpendiculaire.',
        body: (
          <div className="space-y-2">
            <p>
              C’est ce qui rend la construction à l’équerre sans ambiguïté : une fois l’instrument
              bien posé, il n’y a qu’un seul trait possible.
            </p>
          </div>
        ),
      },
    ],

    /* ── M8 — La perpendiculaire a une raison d'être. ── */
    8: [
      {
        id: 'distance-point-droite',
        type: 'concepts',
        title: 'La distance d’un point à une droite',
        summary: 'C’est la longueur du plus court chemin — et il arrive perpendiculairement.',
        body: (
          <div className="space-y-2">
            <p>
              Parmi tous les trajets possibles d’un point à une droite, le plus court est celui qui
              arrive à angle droit. Sa longueur est la <strong>distance du point à la droite</strong>.
            </p>
            <p className="text-xs text-slate-500">
              C’est aussi ainsi qu’on mesure la largeur entre deux parallèles : perpendiculairement,
              d’une droite à l’autre.
            </p>
            <Piege>
              Un trajet en diagonale donne toujours un nombre plus grand : ce n’est pas la distance.
            </Piege>
            <Souvenir>le nombre qui descendait jusqu’à son minimum, pile quand le carré est apparu.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
