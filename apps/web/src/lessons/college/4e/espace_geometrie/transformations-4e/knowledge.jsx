import React from 'react';
import {
  fr, enCarreaux, glissement, translater, demiTour,
  DRAPEAU, CENTRE_DEMI_TOUR, GLISSEMENTS, QUAD_M4, invariants,
} from './components/translation4e';

/**
 * Connaissances de la leçon « Transformations — la translation » (4e) —
 * SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     le glissement, et ses trois caractères (M1)
 *              ↓
 *     l'image d'un POINT (M2)
 *              ↓
 *     l'image d'une FIGURE (M3)
 *          ↓            ↘
 *   ce qui est       le parallélogramme
 *   conservé (M4)    M M' N' N (M5)
 *          ↘            ↙
 *      reconnaître le geste (M6)
 *
 * Le parallélogramme dépend de M3 et non de M4 : il ne se déduit pas des
 * invariants, il se déduit du fait que [M M'] et [N N'] sont parallèles et de
 * même longueur — c'est-à-dire de la définition même du glissement. Il est
 * placé après M4 parce qu'il CONCLUT la leçon en refermant sur un objet connu
 * depuis la 6e, pas parce qu'il en dépendrait.
 *
 * Ce que cette carte NE contient PAS : la symétrie centrale, le centre comme
 * milieu de [M M'], la construction d'une image par symétrie, les invariants
 * de la symétrie. Ce sont les acquis de 5e, listés dans `priorKnowledge` et
 * diagnostiqués au module 0. Elle ne contient pas non plus l'objet formel qui
 * porte une translation, sa notation, ses coordonnées, la loi qui compose deux
 * glissements ni l'agrandissement-réduction : ce sont des objets de 3e.
 */

/* ══ Petits visuels partagés ═══════════════════════════════════════════════
 *
 * Tous sont dessinés à partir du NOYAU : ce sont les mêmes points que ceux
 * des laboratoires, à l'échelle de la vignette. Une vignette redessinée « à la
 * main » finirait par montrer autre chose que la leçon.
 */

/** Une vignette générique : figure, copie, trajets. */
const Vignette = ({ figure, image, trajets = true, couleurTrajet = '#f59e0b', centre = null, ariaLabel }) => {
  const tous = [...figure, ...image, ...(centre ? [centre] : [])];
  const minX = Math.min(...tous.map((p) => p.x)) - 20;
  const minY = Math.min(...tous.map((p) => p.y)) - 20;
  const maxX = Math.max(...tous.map((p) => p.x)) + 20;
  const maxY = Math.max(...tous.map((p) => p.y)) + 20;
  const pts = (ps) => ps.map((p) => `${p.x},${p.y}`).join(' ');
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-2">
      <svg
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        className="w-full"
        role="img"
        aria-label={ariaLabel}
      >
        {trajets && figure.map((p, i) => (
          <line
            key={`t${i}`} x1={p.x} y1={p.y} x2={image[i].x} y2={image[i].y}
            stroke={couleurTrajet} strokeWidth={5} strokeDasharray="14 10" strokeLinecap="round"
          />
        ))}
        <polygon points={pts(figure)} fill="#64748b" fillOpacity={0.12} stroke="#475569" strokeWidth={6} strokeLinejoin="round" />
        <polygon points={pts(image)} fill="#7c3aed" fillOpacity={0.16} stroke="#6d28d9" strokeWidth={6} strokeLinejoin="round" />
        {centre && <circle cx={centre.x} cy={centre.y} r={12} fill="#dc2626" />}
      </svg>
    </div>
  );
};

/** M1 — le glissement : les traits ne se croisent jamais. */
const VGlissement = () => (
  <Vignette
    figure={DRAPEAU}
    image={translater(DRAPEAU, GLISSEMENTS.m1)}
    ariaLabel="Une figure et sa copie glissée ; les traits qui relient chaque sommet à sa copie sont parallèles"
  />
);

/** M1 (contraste) — le demi-tour : les traits se croisent tous. */
const VDemiTour = () => (
  <Vignette
    figure={DRAPEAU}
    image={demiTour(DRAPEAU, CENTRE_DEMI_TOUR)}
    couleurTrajet="#e11d48"
    centre={CENTRE_DEMI_TOUR}
    ariaLabel="La même figure après un demi-tour ; les traits se croisent tous au centre"
  />
);

/** M1 — les trois caractères, lus sur le glissement de la leçon. */
const TroisCaracteres = () => {
  const g = GLISSEMENTS.m1;
  return (
    <div className="space-y-1 rounded-xl border border-indigo-100 bg-white p-2.5 text-[13px]">
      {[
        ['direction', `${fr(g.direction, 0)}° — l’inclinaison du trajet`],
        ['sens', g.sens],
        ['longueur', `${fr(enCarreaux(g.longueur), 2)} carreaux`],
      ].map(([nom, valeur]) => (
        <div key={nom} className="flex items-baseline justify-between gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">{nom}</span>
          <span className="font-mono text-slate-700">{valeur}</span>
        </div>
      ))}
    </div>
  );
};

/** M4 — les quatre grandeurs, mesurées des deux côtés. */
const TableInvariants = () => {
  const image = translater(QUAD_M4, GLISSEMENTS.m4);
  const inv = invariants(QUAD_M4, image);
  const car = (px) => fr(enCarreaux(px), 2);
  const lignes = [
    ['le plus grand côté', `${car(Math.max(...inv.longueurs.figure))} car.`, `${car(Math.max(...inv.longueurs.image))} car.`],
    ['le plus grand angle', `${fr(Math.max(...inv.angles.figure), 0)}°`, `${fr(Math.max(...inv.angles.image), 0)}°`],
    ['l’aire', `${fr(inv.aire.figure / 1600, 0)} car.`, `${fr(inv.aire.image / 1600, 0)} car.`],
  ];
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-2.5">
      <table className="w-full text-[13px]">
        <tbody>
          {lignes.map(([nom, a, b]) => (
            <tr key={nom} className="border-b border-emerald-50 last:border-0">
              <td className="py-1 pr-2 text-slate-600">{nom}</td>
              <td className="py-1 text-right font-mono text-slate-800">{a}</td>
              <td className="py-1 pl-2 text-right font-mono text-emerald-800">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-center text-xs text-slate-400">figure · copie</p>
    </div>
  );
};

/** M5 — le parallélogramme M M’ N’ N. */
const VParallelogramme = () => {
  const g = glissement({ dx: 280, dy: 40 });
  const M = { x: 120, y: 360 };
  const N = { x: 280, y: 280 };
  const Mp = { x: M.x + g.dx, y: M.y + g.dy };
  const Np = { x: N.x + g.dx, y: N.y + g.dy };
  const q = [M, Mp, Np, N];
  return (
    <div className="rounded-xl border border-purple-100 bg-white p-2">
      <svg viewBox="90 250 350 180" className="w-full" role="img"
           aria-label="Le quadrilatère M M prime N prime N est un parallélogramme">
        <polygon
          points={q.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="#a855f7" fillOpacity={0.15} stroke="#7e22ce" strokeWidth={5} strokeLinejoin="round"
        />
        <line x1={M.x} y1={M.y} x2={Mp.x} y2={Mp.y} stroke="#f59e0b" strokeWidth={5} />
        <line x1={N.x} y1={N.y} x2={Np.x} y2={Np.y} stroke="#f59e0b" strokeWidth={5} />
        {q.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={8} fill={i === 1 || i === 2 ? '#7c3aed' : '#334155'} />)}
      </svg>
      <p className="text-center font-mono text-xs text-slate-600">M · M’ · N’ · N</p>
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — ce qu'on vient de VOIR : une figure qui glisse, et des traits qui
       ne se croisent jamais. Le mot est posé ici, après le geste. */
    1: [
      {
        id: 'translation',
        type: 'concepts',
        title: 'La translation : un glissement du plan',
        summary:
          'Une translation fait GLISSER toute la figure : chaque point part et arrive en suivant exactement le même trajet. Rien ne tourne, rien ne se retourne.',
        visual: <VGlissement />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Le geste est celui du tapis roulant : la caisse avance, mais elle ne pivote pas.
              La copie reste <strong>orientée comme l’originale</strong> — on pourrait la faire
              coïncider en la faisant simplement glisser sur la table, sans la soulever.
            </p>
            <p className="text-sm text-slate-700">
              Ce qui se voit à l’écran : les traits qui relient chaque sommet à sa copie sont{' '}
              <strong>parallèles</strong> et <strong>de même longueur</strong>. Ils ne se coupent
              jamais.
            </p>
            <div className="rounded-xl bg-rose-50 p-2.5 text-sm text-rose-900">
              Le demi-tour de 5e, lui, fait tout l’inverse : ses traits se croisent tous au centre.
              C’est à ces traits qu’on distingue les deux gestes du premier coup d’œil.
            </div>
            <VDemiTour />
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la flèche qu’on tirait, et les cinq traits qui restaient parallèles.
            </div>
          </div>
        ),
      },
      {
        id: 'trois-caracteres',
        type: 'regles',
        title: 'Un glissement se décrit par trois choses',
        summary:
          'Une direction, un sens, une longueur. Il en manque une et le glissement n’est plus déterminé : deux figures différentes répondraient à la description.',
        visual: <TroisCaracteres />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-indigo-200 bg-white p-3 text-center">
              <span className="text-base font-black text-indigo-700">
                direction · sens · longueur
              </span>
            </div>
            <p className="text-sm text-slate-700">
              La <strong>direction</strong> dit l’inclinaison du trajet. Le <strong>sens</strong>{' '}
              dit dans lequel des deux on part : deux trajets opposés ont la même direction, et
              pourtant ils n’emmènent pas au même endroit. La <strong>longueur</strong> dit de
              combien on avance.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur fréquente : ne retenir que la longueur. « 5 carreaux » ne suffit pas —
              5 carreaux vers la droite et 5 carreaux vers le haut donnent deux copies très
              différentes.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les trois cases sous la figure, qui changeaient toutes les trois d’un
              seul geste.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — le mot « image », et la règle de placement d'UN point. */
    2: [
      {
        id: 'image',
        type: 'vocabulaire',
        title: 'L’image d’un point',
        summary:
          'Le point d’arrivée s’appelle l’IMAGE du point de départ, et on le note en ajoutant une apostrophe : M donne M’.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-center">
              <span className="font-mono text-lg font-black text-violet-700">M → M’</span>
              <p className="mt-1 text-sm text-slate-600">« M prime », l’image de M</p>
            </div>
            <p className="text-sm text-slate-700">
              Chaque point de la figure a <strong>une seule</strong> image, et chaque image vient
              d’<strong>un seul</strong> point. Le point de départ, lui, s’appelle l’antécédent —
              mais en 4e on dit simplement « le point de départ ».
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la pastille violette qu’on posait sur le quadrillage.
            </div>
          </div>
        ),
      },
      {
        id: 'construire-image-point',
        type: 'methodes',
        title: 'Placer l’image d’un point',
        summary:
          'Depuis le point, on refait EXACTEMENT le trajet donné : même direction, même sens, même longueur. Les trois à la fois, jamais deux sur trois.',
        body: (
          <div className="space-y-3">
            <ol className="ml-4 list-decimal space-y-1.5 text-sm text-slate-700">
              <li>Compter le trajet en carreaux : combien horizontalement, combien verticalement.</li>
              <li>Repartir du point et compter les <strong>mêmes</strong> carreaux, dans le
                <strong> même sens</strong>.</li>
              <li>Marquer l’arrivée : c’est l’image.</li>
            </ol>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Vérifier ensuite : le trait qu’on vient de tracer doit être <strong>parallèle</strong>{' '}
              au trajet donné et de <strong>même longueur</strong>. S’il est parallèle mais que la
              copie est du mauvais côté, c’est le sens qui a été inversé.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les trois cases « même direction ? même sens ? même longueur ? ».
            </div>
          </div>
        ),
      },
    ],

    /* M3 — la figure entière, qui n'est rien d'autre que N fois M2. */
    3: [
      {
        id: 'construire-image-figure',
        type: 'methodes',
        title: 'Construire l’image d’une figure',
        summary:
          'On construit l’image de chacun de ses sommets, puis on relie les images dans le MÊME ordre. Rien de neuf : c’est le geste du point, répété.',
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center text-sm font-bold text-sky-800">
              image d’une figure = images de tous ses sommets
            </div>
            <p className="text-sm text-slate-700">
              Comme les côtés sont des segments, il suffit des <strong>sommets</strong> : une fois
              qu’ils sont placés, on trace les côtés entre eux. Inutile de faire glisser les points
              du milieu — ils suivent.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’ordre compte : si on relie A’ à C’ là où la figure reliait A à B, on obtient une
              figure croisée qui n’est pas l’image.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le triangle dont l’image n’apparaissait qu’au troisième sommet posé.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — ce qui ne bouge pas, mesuré. */
    4: [
      {
        id: 'invariants-translation',
        type: 'regles',
        title: 'Ce qu’une translation conserve',
        summary:
          'Les longueurs, les angles, le parallélisme et les aires : rien de tout cela ne change. La copie est superposable à l’originale.',
        visual: <TableInvariants />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une translation ne fait que <strong>déplacer</strong>. Elle ne grandit pas la figure,
              ne l’aplatit pas, ne la déforme pas : tout ce qu’on peut mesurer <em>à l’intérieur</em>{' '}
              de la figure reste identique.
            </p>
            <p className="text-sm text-slate-700">
              Une conséquence utile en exercice : si on connaît une longueur ou un angle sur la
              figure de départ, on la connaît aussi sur l’image, <strong>sans la mesurer</strong>.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Attention : le demi-tour de 5e conserve exactement les mêmes choses. Ces propriétés
              ne suffisent donc <strong>pas</strong> à reconnaître une translation — il faut
              regarder les trajets.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le tableau à deux colonnes qui refusait de bouger.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-invariants-translation',
        type: 'memoriser',
        title: '⭐ Même forme, même taille, ailleurs',
        summary:
          'Longueurs · angles · parallélisme · aires — les quatre sont conservés. Seule la POSITION change.',
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {['les longueurs', 'les angles', 'le parallélisme', 'les aires'].map((m) => (
                <div key={m} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center font-semibold text-emerald-800">
                  {m}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Le réflexe : « la figure a bougé, elle n’a pas changé. »
            </p>
          </div>
        ),
      },
    ],

    /* M5 — le quadrilatère que le glissement fabrique. */
    5: [
      {
        id: 'translation-parallelogramme',
        type: 'regles',
        title: 'Translation et parallélogramme',
        summary:
          'Si M’ et N’ sont les images de M et N, alors M M’ N’ N est un parallélogramme — dans cet ordre. Les côtés [M M’] et [N N’] sont les deux trajets.',
        visual: <VParallelogramme />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-purple-200 bg-white p-3 text-center">
              <span className="font-mono text-base font-black text-purple-700">
                M · M’ · N’ · N
              </span>
            </div>
            <p className="text-sm text-slate-700">
              Pourquoi ? Parce que les deux trajets [M M’] et [N N’] ont, par définition du
              glissement, la <strong>même direction</strong> et la <strong>même longueur</strong>.
              Or un quadrilatère dont deux côtés opposés sont parallèles et de même longueur est
              un parallélogramme — c’est la propriété apprise en 6e.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’ordre est <strong>M M’ N’ N</strong>, pas M N M’ N’. En reliant les deux points
              puis leurs deux images, on traverse le quadrilatère au lieu d’en faire le tour, et
              on obtient une figure croisée.
            </div>
            <p className="text-sm text-slate-700">
              Cela marche dans les deux sens : si on sait que M M’ N’ N est un parallélogramme,
              alors le glissement qui mène de M à M’ mène aussi de N à N’.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le bouton qui basculait entre les deux ordres, et la figure croisée.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — reconnaître le geste : la synthèse pratique. */
    6: [
      {
        id: 'reconnaitre-le-geste',
        type: 'methodes',
        title: 'Reconnaître le geste sur un dessin',
        summary:
          'On trace les trajets. Parallèles et de même longueur → une translation. Se coupant tous au même point → un demi-tour. Ni l’un ni l’autre → la figure a changé de taille.',
        body: (
          <div className="space-y-3">
            <div className="space-y-2 text-sm">
              {[
                ['Les traits sont parallèles et de même longueur', 'une translation', 'text-emerald-800 bg-emerald-50 border-emerald-200'],
                ['Les traits se croisent tous au même point', 'un demi-tour (5e)', 'text-rose-800 bg-rose-50 border-rose-200'],
                ['La copie n’a pas la même taille', 'ni l’un ni l’autre', 'text-amber-800 bg-amber-50 border-amber-200'],
              ].map(([quoi, verdict, cls]) => (
                <div key={verdict} className={`rounded-xl border p-2.5 ${cls}`}>
                  <div className="font-semibold">{quoi}</div>
                  <div className="text-xs opacity-80">→ {verdict}</div>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-700">
              Le premier réflexe est toujours le même : <strong>relier chaque point à sa copie</strong>.
              Les mesures de longueurs et d’angles, elles, ne trancheront pas — les deux
              transformations les conservent.
            </p>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les trois figures de l’atelier, et les traits qu’il fallait regarder.
            </div>
          </div>
        ),
      },
    ],
  },
};
