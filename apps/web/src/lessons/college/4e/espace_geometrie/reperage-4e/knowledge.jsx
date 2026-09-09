import React from 'react';
import { graduationPour, TEMPERATURES_VALEURS } from './components/reperage4e';

/**
 * Connaissances de la leçon « Repérage dans le plan » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     le repère est un CHOIX (M1)
 *          ↓
 *     les trois défauts d'une graduation (M1)
 *          ↓                        ↘
 *     lire entre deux graduations (M2)  choisir un pas, méthode (M3)
 *          ↓                        ↙
 *     placer quand le pas n'est pas 1 (M4)
 *          ↓
 *     fermer un parallélogramme par les milieux (M5)
 *          ↓
 *     comparer des distances par les coordonnées (M6)
 *
 * Rien n'y est arbitraire : on ne peut pas POSER un point dans une grille
 * dont on ne sait pas LIRE le pas (M4 après M2), et on ne peut pas se servir
 * des coordonnées pour prouver (M5, M6) avant de savoir les lire et les poser.
 *
 * CE QUE CETTE CARTE NE CONTIENT PAS. Ni le repère, ni les axes, ni le couple
 * ordonné, ni les quadrants, ni « lire un point », ni « placer un point » :
 * ce sont les ACQUIS de `reperage-5e`, listés dans `priorKnowledge` et
 * diagnostiqués au module 0. La 4e ne les re-enseigne pas — elle s'appuie
 * dessus. Elle ne contient pas non plus la sphère terrestre, les coordonnées
 * dans l'espace, ni la formule du milieu comme objet formel : objets de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/**
 * Les mêmes douze relevés, à deux graduations — la comparaison qui résume
 * toute la leçon. Les deux miniatures sont CALCULÉES sur les données réelles,
 * de sorte que la carte ne puisse pas montrer autre chose que ce que le labo
 * a fait vivre.
 */
const DeuxGraduations = () => {
  const etude = graduationPour(TEMPERATURES_VALEURS, { budget: 26 });
  const bon = etude.candidats.find((c) => c.pas === 0.5);
  const mauvais = etude.candidats.find((c) => c.pas === 2);

  // Deux mini-nuages : on ne dessine que les ordonnées, l'axe des heures est
  // implicite et régulier.
  const nuage = (pas, cadre) => {
    const min = cadre.min;
    const max = cadre.max;
    return TEMPERATURES_VALEURS.map((t, i) => {
      const aimante = Math.round(t / pas) * pas;
      return {
        x: 6 + i * 8.5,
        y: 54 - ((aimante - min) / (max - min)) * 44,
      };
    });
  };

  const Mini = ({ titre, pas, cadre, ton, note }) => (
    <div className="rounded-xl border bg-white p-1.5" style={{ borderColor: ton }}>
      <svg viewBox="0 0 112 66" className="w-full" role="img" aria-label={titre}>
        {/* les graduations, à l'échelle réelle du pas */}
        {Array.from({ length: Math.round((cadre.max - cadre.min) / pas) + 1 }, (_, k) => {
          const y = 54 - (k / Math.round((cadre.max - cadre.min) / pas)) * 44;
          return <line key={k} x1="4" y1={y} x2="108" y2={y} stroke="#e2e8f0" strokeWidth="0.6" />;
        })}
        <line x1="4" y1="10" x2="4" y2="58" stroke="#94a3b8" strokeWidth="1" />
        {nuage(pas, cadre).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.4" fill={ton} fillOpacity="0.85" />
        ))}
      </svg>
      <p className="text-center text-xs font-semibold" style={{ color: ton }}>{titre}</p>
      <p className="text-center text-xs text-slate-500">{note}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-2">
      <Mini
        titre="pas 2"
        pas={2}
        cadre={{ min: mauvais.min, max: mauvais.max }}
        ton="#e11d48"
        note={`${mauvais.confondus.length} paires écrasées`}
      />
      <Mini
        titre="pas 0,5"
        pas={0.5}
        cadre={{ min: bon.min, max: bon.max }}
        ton="#059669"
        note={`${bon.graduations} graduations`}
      />
    </div>
  );
};

/** Un point posé entre deux graduations, et les deux lectures. */
const EntreDeuxTraits = () => (
  <div className="rounded-xl border border-violet-100 bg-white p-2">
    <svg viewBox="0 0 150 74" className="w-full" role="img"
         aria-label="Un point posé à trois graduations de l’origine, sur un axe de pas 0,5">
      <line x1="14" y1="46" x2="140" y2="46" stroke="#0f172a" strokeWidth="1.4" />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <g key={k}>
          <line x1={20 + k * 18} y1="41" x2={20 + k * 18} y2="51" stroke="#94a3b8" strokeWidth="1.2" />
          <text x={20 + k * 18} y="64" textAnchor="middle" fontSize="8" fill="#64748b" className="font-mono">
            {String(k * 0.5).replace('.', ',')}
          </text>
        </g>
      ))}
      <circle cx="74" cy="46" r="4.5" fill="#7c3aed" stroke="#fff" strokeWidth="1.6" />
      <text x="74" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7c3aed" className="font-mono">1,5</text>
    </svg>
    <p className="text-center text-xs text-slate-500">3 graduations · mais 1,5</p>
  </div>
);

/** Les diagonales d'un parallélogramme, qui se coupent en leur milieu. */
const Diagonales = () => (
  <div className="rounded-xl border border-purple-100 bg-white p-2">
    <svg viewBox="0 0 140 100" className="w-full" role="img"
         aria-label="Un parallélogramme et ses deux diagonales, qui se coupent en leur milieu">
      <polygon points="18,78 62,88 122,30 78,20" fill="#a855f7" fillOpacity="0.12" stroke="#7e22ce" strokeWidth="1.6" />
      <line x1="18" y1="78" x2="122" y2="30" stroke="#0891b2" strokeWidth="1.3" strokeDasharray="4 3" />
      <line x1="62" y1="88" x2="78" y2="20" stroke="#e11d48" strokeWidth="1.3" strokeDasharray="4 3" />
      <circle cx="70" cy="54" r="4" fill="#0f172a" />
      <text x="70" y="48" textAnchor="middle" fontSize="9" fill="#0f172a" fontWeight="700">le même</text>
    </svg>
    <p className="text-center text-xs text-slate-500">un seul milieu pour les deux diagonales</p>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le repère n'est pas donné, et un mauvais pas détruit les données. */
    1: [
      {
        id: 'repere-choisi',
        type: 'concepts',
        title: 'Le repère se choisit',
        summary:
          'Un repère n’est pas donné avec les données : c’est celui qui représente qui décide de l’étendue des axes et de ce que vaut une graduation.',
        visual: <DeuxGraduations />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Jusqu’ici, le quadrillage était fourni et une graduation valait 1. Dès qu’on
              représente de vraies données, ce n’est plus vrai : des températures au demi-degré,
              des altitudes par centaines de mètres, des durées en minutes n’ont aucune raison
              d’entrer dans une grille de 1 en 1.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Conséquence : un graphique illisible n’est pas forcément mal tracé. C’est souvent
              la <strong>graduation</strong> qui a été mal choisie.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les douze relevés de la journée, écrasés puis rendus lisibles.
            </div>
          </div>
        ),
      },
      {
        id: 'trois-defauts',
        type: 'regles',
        title: 'Les trois défauts d’une graduation',
        summary:
          'Un pas peut échouer de trois façons : trop de graduations, des relevés confondus, ou des valeurs entre les traits. Les remèdes sont opposés.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <div className="flex gap-2">
                <span className="inline-block h-2.5 w-2.5 shrink-0 translate-y-1.5 rounded-full bg-amber-600" aria-hidden="true" />
                <div>
                  <strong>Trop de graduations</strong> — l’axe en porte tellement qu’on ne peut plus
                  les compter. <span className="text-slate-500">Remède : grossir le pas.</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="inline-block h-2.5 w-2.5 shrink-0 translate-y-1.5 rounded-full bg-rose-600" aria-hidden="true" />
                <div>
                  <strong>Relevés confondus</strong> — deux valeurs différentes tombent sur le même
                  point : la donnée est <em>perdue</em>, pas seulement mal affichée.{' '}
                  <span className="text-slate-500">Remède : affiner le pas.</span>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="inline-block h-2.5 w-2.5 shrink-0 translate-y-1.5 rounded-full bg-violet-600" aria-hidden="true" />
                <div>
                  <strong>Valeurs entre les traits</strong> — aucune graduation ne les porte, on ne
                  peut ni les poser ni les lire exactement.{' '}
                  <span className="text-slate-500">Remède : changer de famille (0,5 au lieu de 2).</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Le bon pas est le <strong>plus grand</strong> qui n’a aucun de ces trois défauts :
              le moins de graduations possible, sans rien perdre.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le pas 2 qui écrasait sept paires, et le pas 0,25 illisible.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Lire ce qui tombe entre deux traits. */
    2: [
      {
        id: 'coordonnee-decimale',
        type: 'regles',
        title: 'Compter n’est pas lire',
        summary:
          'Une coordonnée n’est pas le nombre de graduations : c’est ce nombre MULTIPLIÉ par ce que vaut une graduation.',
        visual: <EntreDeuxTraits />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Tant qu’une graduation valait 1, compter les carreaux donnait directement la
              coordonnée. Les deux nombres se confondaient — et c’est ce qui rend l’erreur si
              tenace.
            </p>
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-center">
              <div className="font-mono text-base font-bold text-violet-700">
                coordonnée = nombre de graduations × pas
              </div>
              <div className="mt-1 text-xs text-slate-500">
                3 graduations de 0,5 → 3 × 0,5 = 1,5
              </div>
            </div>
            <p className="text-sm text-slate-700">
              Un point peut aussi se poser <strong>entre deux graduations</strong> : sa
              coordonnée est alors décimale, et l’écrire à l’entier le plus proche serait une
              erreur — pas un arrondi.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le point à trois graduations qui valait 1,5.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — La méthode, indépendante de l'ordre de grandeur. */
    3: [
      {
        id: 'methode-graduation',
        type: 'methodes',
        title: 'Choisir une graduation',
        summary:
          'Quatre temps : repérer l’étendue, essayer un pas de la famille 1 · 2 · 5, compter les graduations, vérifier qu’aucun relevé n’est perdu.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700">
              <li>
                <strong>1. Repérer</strong> la plus petite et la plus grande valeur : c’est
                l’étendue à couvrir.
              </li>
              <li>
                <strong>2. Essayer</strong> un pas de la famille <span className="font-mono">1 · 2 · 5</span>{' '}
                (× 10, × 100, ÷ 10…) : ce sont les seuls qu’on compte de tête.
              </li>
              <li>
                <strong>3. Compter</strong> les graduations obtenues : au-delà d’une vingtaine,
                l’axe devient illisible.
              </li>
              <li>
                <strong>4. Vérifier</strong> qu’aucune valeur ne se confond avec une autre, et que
                toutes tombent sur un trait.
              </li>
            </ol>
            <div className="rounded-xl bg-sky-50 p-2.5 text-sm text-sky-900">
              La méthode ne dépend pas de l’ordre de grandeur : pour des demi-degrés on hésite
              entre 0,5 et 2, pour des altitudes entre 50 et 500 — et on tranche exactement de la
              même façon.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les altitudes de la randonnée, mille fois plus grandes, même méthode.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Poser un point dans une grille non unitaire. */
    4: [
      {
        id: 'placer-pas-non-unitaire',
        type: 'methodes',
        title: 'Poser un point quand le pas n’est pas 1',
        summary:
          'Placer, c’est l’opération inverse de lire : on divise la coordonnée par le pas pour savoir combien de graduations compter.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-center">
              <div className="font-mono text-base font-bold text-emerald-700">
                nombre de graduations = coordonnée ÷ pas
              </div>
              <div className="mt-1 text-xs text-slate-500">
                aller à 1,5 avec un pas de 0,5 → 1,5 ÷ 0,5 = 3 graduations
              </div>
            </div>
            <p className="text-sm text-slate-700">
              L’erreur classique est de compter <strong>autant de graduations que d’unités</strong> :
              on avance d’une graduation et demie au lieu de trois, et le point tombe à 0,75.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Réflexe : avant de poser quoi que ce soit, lire ce que vaut UNE graduation sur
              chaque axe — les deux axes n’ont pas forcément le même pas.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Les coordonnées comme moyen de FERMER une figure. */
    5: [
      {
        id: 'parallelogramme-milieux',
        type: 'regles',
        title: 'Le parallélogramme et ses diagonales',
        summary:
          'Un quadrilatère est un parallélogramme exactement quand ses deux diagonales ont le même milieu — ce qui se vérifie sur les coordonnées.',
        visual: <Diagonales />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Les diagonales d’un parallélogramme se coupent en leur milieu. Sur des coordonnées,
              cela devient un test : on calcule le milieu de chaque diagonale, et on regarde s’ils
              coïncident.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
              <p className="font-semibold text-slate-700">Pour ABCD, en trois lignes :</p>
              <ol className="mt-1 space-y-0.5 text-slate-600">
                <li>1. le milieu de [AC] ;</li>
                <li>2. le milieu de [BD] ;</li>
                <li>3. comparer les deux couples.</li>
              </ol>
            </div>
            <p className="text-sm text-slate-700">
              Et pour <strong>fermer</strong> la figure : le quatrième sommet est celui qui donne
              aux deux diagonales le même milieu. On le trouve en cherchant, pas en récitant une
              formule.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le sommet D qu’il fallait poser pour que les deux milieux se
              rejoignent.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Les coordonnées comme moyen de DÉCIDER. */
    6: [
      {
        id: 'decider-par-coordonnees',
        type: 'methodes',
        title: 'Trancher par les coordonnées',
        summary:
          'Deux écarts suffisent à comparer des éloignements : on compare les carrés, sans jamais mesurer sur le dessin.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Pour savoir lequel de deux points est le plus proche d’un troisième, on calcule pour
              chacun l’écart horizontal et l’écart vertical, puis on compare{' '}
              <span className="font-mono">écart_x² + écart_y²</span>.
            </p>
            <div className="rounded-xl bg-rose-50 p-2.5 text-sm text-rose-900">
              Le point qui <em>paraît</em> le plus proche ne l’est pas toujours : l’œil se laisse
              tromper par un axe plus étiré que l’autre. Le calcul, lui, ne se trompe pas.
            </div>
            <p className="text-sm text-slate-600">
              Comparer les carrés suffit : celui qui a le plus petit carré a le plus petit
              éloignement. Inutile d’aller plus loin.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le refuge du Lac, qui semblait le plus proche et arrivait deuxième.
            </div>
          </div>
        ),
      },
    ],
  },
};
