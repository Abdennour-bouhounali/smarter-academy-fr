import React from 'react';
import { longueursDe, patronPyramide, arrondi, fr } from './components/espace4e';

/**
 * Connaissances de la leçon « Représentation de l'espace » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     le tiers, COMPTÉ (M1)
 *          ↓
 *     la base et la hauteur, nommées (M2)  ← sans elles, « ⅓ × B × h » est
 *          ↓                                 une suite de lettres
 *     la hauteur n'est pas l'arête (M2)
 *          ↓
 *     l'apothème et le patron (M3)         ← une TROISIÈME longueur, qui
 *          ↓                                 n'existe que pour déplier
 *     le cône de révolution (M4)           ← même pointe, base ronde
 *          ↓
 *     les deux formules écrites (M5)       ← seulement maintenant
 *          ↓
 *     la méthode de résolution (M6)
 *
 * Rien n'y est arbitraire : les formules (M5) ne peuvent pas précéder le nom
 * des grandeurs qu'elles emploient (M2), et le cône (M4) ne prend son sens
 * qu'une fois le tiers établi sur une base carrée (M1).
 *
 * Ce que cette carte NE contient PAS : la perspective cavalière, les trois
 * vues, le patron du prisme, le vocabulaire face / arête / sommet, l'aire —
 * ce sont les acquis listés dans `priorKnowledge` et diagnostiqués au module
 * 0. Elle ne contient pas non plus la boule, ni ce qu'un agrandissement fait
 * aux volumes : ce sont des objets de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/**
 * Une pyramide et le prisme jumeau, en miniature — l'image du tiers.
 * Le prisme est partagé en trois bandes : c'est le geste des trois
 * versements, figé.
 */
const TroisVersements = () => (
  <div className="rounded-xl border border-indigo-100 bg-white p-2">
    <svg viewBox="0 0 160 100" className="w-full" role="img"
         aria-label="Une pyramide et un prisme de même base et même hauteur, le prisme partagé en trois">
      {/* la pyramide */}
      <polygon points="12,84 60,84 36,20" fill="#6366f1" fillOpacity="0.18" stroke="#4338ca" strokeWidth="1.6" />
      <polygon points="12,84 60,84 70,74 22,74" fill="#6366f1" fillOpacity="0.10" stroke="#4338ca" strokeWidth="1.2" />
      <line x1="36" y1="20" x2="70" y2="74" stroke="#4338ca" strokeWidth="1.2" />
      {/* le prisme jumeau, en trois bandes */}
      <rect x="96" y="20" width="48" height="64" fill="#f8fafc" stroke="#0f172a" strokeWidth="1.6" />
      <line x1="96" y1="41.3" x2="144" y2="41.3" stroke="#4338ca" strokeWidth="1.2" strokeDasharray="4 3" />
      <line x1="96" y1="62.7" x2="144" y2="62.7" stroke="#4338ca" strokeWidth="1.2" strokeDasharray="4 3" />
      <polygon points="96,20 144,20 154,10 106,10" fill="#f1f5f9" stroke="#0f172a" strokeWidth="1.2" />
      <line x1="144" y1="20" x2="144" y2="84" stroke="#0f172a" strokeWidth="1.2" />
      {/* la flèche : trois fois la pyramide */}
      <text x="80" y="58" fontSize="12" fontWeight="700" fill="#4338ca" textAnchor="middle">×3</text>
    </svg>
    <p className="text-center text-xs text-slate-500">trois pyramides remplissent le prisme jumeau</p>
  </div>
);

/**
 * Les trois longueurs de la pyramide de la leçon (8 cm de côté, 6 cm de
 * haut), CALCULÉES : le schéma ne peut pas contredire le texte.
 */
const TroisLongueurs = () => {
  const L = longueursDe(8, 6);
  return (
    <div className="rounded-xl border border-violet-100 bg-white p-2">
      <svg viewBox="0 0 170 110" className="w-full" role="img"
           aria-label="Une pyramide, avec sa hauteur, son apothème et son arête latérale distingués">
        {/* base en fuite */}
        <polygon points="26,86 106,86 144,64 64,64" fill="#f1f5f9" stroke="#0f172a" strokeWidth="1.4" />
        {/* arêtes latérales */}
        <line x1="26" y1="86" x2="85" y2="14" stroke="#0f172a" strokeWidth="1.4" />
        <line x1="106" y1="86" x2="85" y2="14" stroke="#e11d48" strokeWidth="2.2" />
        <line x1="144" y1="64" x2="85" y2="14" stroke="#0f172a" strokeWidth="1.4" />
        <line x1="64" y1="64" x2="85" y2="14" stroke="#0f172a" strokeWidth="1.2" strokeDasharray="5 3" />
        {/* la hauteur, du sommet au plancher */}
        <line x1="85" y1="14" x2="85" y2="75" stroke="#7c3aed" strokeWidth="2.4" />
        <polyline points="85,68 92,68 92,75" fill="none" stroke="#7c3aed" strokeWidth="1.3" />
        {/* l'apothème : du sommet au milieu d'un côté de la base */}
        <line x1="85" y1="14" x2="66" y2="86" stroke="#0891b2" strokeWidth="2.2" strokeDasharray="4 3" />
        <circle cx="66" cy="86" r="2.4" fill="#0891b2" />
      </svg>
      <div className="mt-1 space-y-0.5 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-violet-700">— hauteur</span>
          <span className="font-mono tabular-nums text-slate-700">{fr(L.hauteur, 2)} cm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-cyan-700">— apothème</span>
          <span className="font-mono tabular-nums text-slate-700">{fr(arrondi(L.apotheme, 2), 2)} cm</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-rose-700">— arête latérale</span>
          <span className="font-mono tabular-nums text-slate-700">{fr(arrondi(L.arete, 2), 2)} cm</span>
        </div>
      </div>
    </div>
  );
};

/** Le patron d'une pyramide, dessiné à partir du noyau — cadre compris. */
const PatronMini = () => {
  const p = patronPyramide(8, 6);
  const { minX, maxX, minY, maxY } = p.cadre;
  const M = 0.6;
  const vb = `${minX - M} ${-(maxY + M)} ${maxX - minX + 2 * M} ${maxY - minY + 2 * M}`;
  const pt = (q) => `${q.x},${-q.y}`;
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-2">
      <svg viewBox={vb} className="mx-auto w-full max-w-[140px]" role="img"
           aria-label="Le patron d’une pyramide : un carré et quatre triangles rabattus autour">
        <polygon points={p.base.map(pt).join(' ')} fill="#e0f2fe" stroke="#0369a1" strokeWidth="0.28" />
        {p.triangles.map((t) => (
          <polygon key={t.id} points={t.sommets.map(pt).join(' ')}
                   fill="#38bdf8" fillOpacity="0.24" stroke="#0369a1" strokeWidth="0.28" />
        ))}
      </svg>
      <p className="text-center text-xs text-slate-500">
        chaque triangle a pour hauteur l’apothème, {fr(arrondi(p.apotheme, 2), 2)} cm
      </p>
    </div>
  );
};

/** Le triangle rectangle qui, en tournant, engendre le cône. */
const RevolutionMini = () => (
  <div className="rounded-xl border border-emerald-100 bg-white p-2">
    <svg viewBox="0 0 160 96" className="w-full" role="img"
         aria-label="Un triangle rectangle qui tourne autour d’un côté et engendre un cône">
      {/* le triangle, à gauche */}
      <polygon points="36,80 36,16 74,80" fill="#10b981" fillOpacity="0.2" stroke="#047857" strokeWidth="1.6" />
      <polyline points="36,72 44,72 44,80" fill="none" stroke="#047857" strokeWidth="1.3" />
      <line x1="36" y1="16" x2="36" y2="80" stroke="#047857" strokeWidth="2.4" strokeDasharray="5 3" />
      {/* le cône engendré, à droite */}
      <ellipse cx="122" cy="80" rx="26" ry="8" fill="#a7f3d0" fillOpacity="0.5" stroke="#047857" strokeWidth="1.4" />
      <path d="M 96 80 L 122 16 L 148 80" fill="#10b981" fillOpacity="0.16" stroke="#047857" strokeWidth="1.6" />
      <line x1="122" y1="16" x2="122" y2="80" stroke="#047857" strokeWidth="1.6" strokeDasharray="4 3" />
    </svg>
    <p className="text-center text-xs text-slate-500">
      l’axe devient la hauteur, l’autre côté devient le rayon
    </p>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le tiers, compté avant d'être écrit. */
    1: [
      {
        id: 'tiers-pyramide',
        type: 'regles',
        title: 'Une pyramide, c’est le tiers du prisme jumeau',
        summary:
          'Une pyramide et un prisme droit qui ont la MÊME base et la MÊME hauteur ne contiennent pas la même chose : il faut exactement trois pyramides pour remplir le prisme.',
        visual: <TroisVersements />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Ce nombre 3 ne dépend de rien : ni de la taille de la base, ni de la hauteur. On
              peut changer les deux et recompter, il ne bouge pas.
            </p>
            <p className="text-sm text-slate-700">
              Il ne dépend pas non plus de la FORME de la base. Un solide qui monte en pointe,
              carré ou rond, contient toujours le tiers du solide droit de même base et de même
              hauteur.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur fréquente : croire que la pointe enlève « la moitié ». Le remplissage la
              contredit — deux versements ne suffisent jamais.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la jauge qui montait d’un tiers à chaque versement.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Les deux grandeurs qui portent tout le reste. */
    2: [
      {
        id: 'base-et-hauteur',
        type: 'concepts',
        title: 'La base et la hauteur d’une pyramide',
        summary:
          'La base est la face sur laquelle le solide repose ; la hauteur est le segment qui va du sommet au plan de la base, en formant avec lui un angle droit.',
        visual: <TroisLongueurs />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une pyramide a un <strong>sommet</strong> — la pointe — et une <strong>base</strong>{' '}
              qui est un polygone. La hauteur relie l’un à l’autre par le plus court chemin :
              elle est <strong>perpendiculaire</strong> au plan de la base.
            </p>
            <p className="text-sm text-slate-700">
              Ce sont les deux seules grandeurs dont dépend le volume. Deux pyramides très
              différentes, mais de même base et de même hauteur, contiennent la même chose.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
              Pour le cône, c’est la même chose : la base est un disque, et la hauteur va du
              sommet au centre de ce disque.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la pointe déplacée au-dessus du plancher — la hauteur ne changeait
              pas.
            </div>
          </div>
        ),
      },
      {
        id: 'hauteur-nest-pas-arete',
        type: 'vocabulaire',
        title: 'La hauteur n’est pas l’arête latérale',
        summary:
          'L’arête latérale relie le sommet à un COIN de la base ; elle est toujours plus longue que la hauteur. C’est celle qu’on voit, pas celle qu’on calcule.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Sur un dessin en perspective, la hauteur est souvent invisible : elle passe à
              l’intérieur du solide. Ce qu’on voit, ce sont les arêtes latérales — et c’est
              pourquoi on les prend pour la hauteur.
            </p>
            <div className="space-y-1 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div><strong>hauteur</strong> → du sommet au plan de la base, à angle droit</div>
              <div><strong>arête latérale</strong> → du sommet à un coin de la base</div>
              <div><strong>apothème</strong> → du sommet au milieu d’un côté de la base</div>
            </div>
            <p className="text-sm text-slate-600">
              Les trois se rangent toujours dans cet ordre : hauteur &lt; apothème &lt; arête
              latérale. Une « hauteur » plus longue qu’une arête est donc forcément une erreur.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les trois nombres affichés côte à côte, jamais égaux.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Déplier : une longueur de plus, et une seule bonne. */
    3: [
      {
        id: 'patron-pyramide',
        type: 'methodes',
        title: 'Déplier une pyramide',
        summary:
          'Le patron d’une pyramide à base carrée : le carré de base, et quatre triangles isocèles rabattus sur ses quatre côtés. La hauteur de chaque triangle est l’apothème.',
        visual: <PatronMini />,
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700">
              <li><strong>1.</strong> tracer le carré de base ;</li>
              <li><strong>2.</strong> sur chacun de ses côtés, poser un triangle isocèle ;</li>
              <li><strong>3.</strong> donner à ces triangles la hauteur qui convient — l’apothème.</li>
            </ol>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Le piège : prendre la hauteur de la pyramide. Le patron ne se referme alors pas —
              les quatre pointes se rejoignent trop bas, et il reste un trou.
            </div>
            <p className="text-sm text-slate-600">
              L’apothème est plus grand que la hauteur, parce qu’il descend en biais : il va du
              sommet jusqu’au bord, pas jusqu’au centre.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les quatre triangles rabattus, et le patron qui refusait de se
              refermer.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Le même solide pointu, sur une base ronde. */
    4: [
      {
        id: 'cone-de-revolution',
        type: 'concepts',
        title: 'Le cône de révolution',
        summary:
          'Un cône de révolution est le solide engendré par un triangle rectangle qui tourne autour d’un des côtés de son angle droit : ce côté devient la hauteur, l’autre le rayon de la base.',
        visual: <RevolutionMini />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Sa base est un <strong>disque</strong>, et sa hauteur va du sommet au centre de ce
              disque en formant un angle droit avec lui — exactement comme pour la pyramide.
            </p>
            <p className="text-sm text-slate-700">
              Le troisième côté du triangle, celui qui est en biais, balaie la surface arrondie :
              on l’appelle la <strong>génératrice</strong>. Elle n’intervient pas dans le volume.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
              Le mot « révolution » dit d’où vient le solide : d’un tour complet. C’est ce qui
              garantit que sa base est un disque parfait.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le triangle qui tourne et laisse derrière lui un cornet.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Les deux écritures, une fois les grandeurs nommées. */
    5: [
      {
        id: 'volume-pyramide',
        type: 'formules',
        title: 'Le volume d’une pyramide',
        summary:
          'V = (aire de la base × hauteur) ÷ 3. On calcule d’abord l’aire de la base, on multiplie par la hauteur, et on divise par 3.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-center">
              <div className="font-mono text-xl font-black text-purple-700">V = B × h ÷ 3</div>
              <div className="mt-1 text-xs text-slate-500">
                B : aire de la base · h : hauteur
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Pour une base carrée de côté c, l’aire de la base vaut c × c, donc
              <span className="ml-1 font-mono">V = c × c × h ÷ 3</span>.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Deux erreurs à surveiller : oublier de diviser par 3 (on obtient alors le prisme
              entier), et prendre l’arête latérale à la place de la hauteur.
            </div>
            <p className="text-sm text-slate-600">
              Un volume s’exprime toujours dans une unité au cube : cm³, m³…
            </p>
          </div>
        ),
      },
      {
        id: 'volume-cone',
        type: 'formules',
        title: 'Le volume d’un cône de révolution',
        summary:
          'V = (π × r × r × h) ÷ 3 : la même écriture que pour la pyramide, avec l’aire du disque comme aire de base.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-center">
              <div className="font-mono text-xl font-black text-purple-700">V = π × r × r × h ÷ 3</div>
              <div className="mt-1 text-xs text-slate-500">r : rayon de la base · h : hauteur</div>
            </div>
            <p className="text-sm text-slate-700">
              Ce n’est pas une deuxième formule à apprendre : c’est la première, dans laquelle on
              a remplacé B par l’aire du disque, π × r × r.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Le rayon est au carré, pas le diamètre : si l’énoncé donne un diamètre, on le
              divise d’abord par deux.
            </div>
          </div>
        ),
      },
      {
        id: 'le-tiers-a-retenir',
        type: 'memoriser',
        title: 'Pointu ⇒ divisé par trois',
        summary:
          'Droit (prisme, cylindre) : B × h. Pointu (pyramide, cône) : B × h ÷ 3. Une seule idée pour quatre solides.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-rose-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-600">prisme droit · cylindre</span>
                <span className="font-mono font-black text-slate-900">B × h</span>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-slate-600">pyramide · cône</span>
                <span className="font-mono font-black text-rose-700">B × h ÷ 3</span>
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Le réflexe de contrôle : un solide pointu contient forcément MOINS que le solide
              droit de même base et de même hauteur. Trouver plus, ou même autant, c’est avoir
              oublié le tiers.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — Ce qui transforme un énoncé en calcul. */
    6: [
      {
        id: 'methode-probleme-volume',
        type: 'methodes',
        title: 'Résoudre un problème de volume',
        summary:
          'Quatre temps : reconnaître le solide, repérer sa base et sa hauteur, calculer l’aire de la base, puis appliquer la formule sans oublier le tiers.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700">
              <li><strong>1. Reconnaître</strong> : le solide est-il droit, ou pointu ?</li>
              <li><strong>2. Repérer</strong> la base et la hauteur — et vérifier que la longueur donnée est bien la hauteur.</li>
              <li><strong>3. Calculer l’aire de la base</strong> : c × c pour un carré, π × r × r pour un disque.</li>
              <li><strong>4. Appliquer</strong> la formule, et donner l’unité au cube.</li>
            </ol>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Quand une seule dimension change, le volume ne suit pas toujours de la même façon :
              doubler la hauteur double le volume, mais doubler le côté de la base le multiplie
              par quatre — car ce côté intervient deux fois.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la tente, le cornet, et le toit dont on doublait la hauteur.
            </div>
          </div>
        ),
      },
    ],
  },
};
