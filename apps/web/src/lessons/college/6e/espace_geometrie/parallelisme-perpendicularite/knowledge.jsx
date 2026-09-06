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

/** Deux droites, avec le codage de la relation. */
function DeuxDroites({ kind = 'paralleles', color = '#0284c7' }) {
  const W = 140, H = 74;
  if (kind === 'paralleles') {
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="select-none">
        {[26, 54].map((y) => (
          <line key={y} x1="8" y1={y + 6} x2={W - 8} y2={y - 6} stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        ))}
        {/* L'écart, mesuré perpendiculairement, est le même aux deux endroits. */}
        {[42, 104].map((x) => (
          <line key={x} x1={x} y1={30 - (x - 8) * 12 / 124 + 2} x2={x + 5.5} y2={58 - (x - 8) * 12 / 124 - 1}
            stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="3 2" />
        ))}
        <text x={W / 2} y={H - 4} fontSize="9.5" fill="#64748b" textAnchor="middle" fontFamily="ui-monospace, monospace">
          même écart partout
        </text>
      </svg>
    );
  }
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="select-none">
      <line x1="12" y1="52" x2={W - 12} y2="24" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="58" y1="8" x2="82" y2="68" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* Le petit carré de l'angle droit, au point de croisement. */}
      <path d="M 70 38 L 79 36 L 82 46 L 73 48 Z" fill="none" stroke={color} strokeWidth="1.4" />
      <text x={W / 2} y={H - 3} fontSize="9.5" fill="#64748b" textAnchor="middle" fontFamily="ui-monospace, monospace">
        angle droit : 90°
      </text>
    </svg>
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
