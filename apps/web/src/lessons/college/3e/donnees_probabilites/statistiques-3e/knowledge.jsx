import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Statistiques » (3e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md, docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner son sens, puis il reste disponible dans la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte montrent
 * le même texte, et l'enrichir se fait à un seul endroit.
 *
 * CE QUE CETTE CARTE RÉPARE. Le vocabulaire statistique arrivait presque
 * entièrement dans des `explain`, donc APRÈS la réponse :
 *   M1 étape 2  « série statistique », « valeur », « effectif »  → dans l'explain
 *   M1 étape 3  « fréquence »                                    → dans l'explain,
 *               puis exigée par le prompt de l'étape 5
 *   M1 étape 7  « probabilité »                                  → dans l'explain,
 *               puis exigée par le prompt de l'étape 8
 *   M2 étape 3  « médiane » et « mode » dans un explainWrong     → un module trop tôt
 *   M3 étape 3  « Quelle est l'ÉTENDUE ? »                       → première apparition
 *               du mot, dans la demande elle-même
 *   M5          un « 🔑 À retenir » recopié à la main, qui redéfinissait les
 *               trois indicateurs déjà éprouvés
 * Ici chaque mot est posé par une brique, après le geste et avant la demande.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare — la brique rend ce texte à sa position, donc un exemple qui
 * anticiperait le module suivant serait un spoiler visible à l'écran. La
 * médiane n'apparaît donc nulle part avant M3, l'étendue nulle part avant M3
 * étape 3, la moyenne pondérée nulle part avant M5.
 *
 * PRÉREQUIS (lesson.config.js `priorKnowledge`) : additionner, diviser, ranger
 * des nombres, lire une proportion et un pourcentage viennent des années
 * antérieures. Le module 0 les diagnostique — et rien d'autre.
 */

/* ── Deux mini-visuels, dérivés des mêmes données que les modules ─────────── */

/** Une pile de points sur un axe : la représentation de toute la leçon. */
function MiniDots({ values, mark = null, markColor = '#0284c7', markLabel = '', width = 230, height = 92 }) {
  const min = 0;
  const max = 40;
  const x = (v) => 14 + ((v - min) / (max - min)) * (width - 28);
  const counts = new Map();
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Série de ${values.length} valeurs sur un axe`}>
      <line x1={10} y1={height - 22} x2={width - 10} y2={height - 22} stroke="#94a3b8" strokeWidth="1.5" />
      {[0, 10, 20, 30, 40].map((g) => (
        <g key={g}>
          <line x1={x(g)} y1={height - 26} x2={x(g)} y2={height - 18} stroke="#94a3b8" strokeWidth="1.5" />
          <text x={x(g)} y={height - 6} textAnchor="middle" fontSize="9" fill="#64748b">{g}</text>
        </g>
      ))}
      {values.map((v, i) => {
        const k = counts.get(v) ?? 0;
        counts.set(v, k + 1);
        return <circle key={i} cx={x(v)} cy={height - 28 - k * 11} r={4.5} fill="#6366f1" opacity="0.85" />;
      })}
      {mark !== null && (
        <g>
          <line x1={x(mark)} y1={6} x2={x(mark)} y2={height - 18} stroke={markColor} strokeWidth="2" strokeDasharray="4 3" />
          <text x={x(mark)} y={5} textAnchor="middle" fontSize="9" fontWeight="700" fill={markColor}>{markLabel}</text>
        </g>
      )}
    </svg>
  );
}

/** Six barres d'effectifs : le graphique du dé, en petit. */
function MiniBars({ counts, width = 220, height = 84 }) {
  const top = Math.max(...counts, 1);
  const bw = (width - 20) / counts.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label="Effectifs des six faces d’un dé">
      {counts.map((c, i) => {
        const h = (c / top) * (height - 30);
        return (
          <g key={i}>
            <rect x={10 + i * bw + 3} y={height - 18 - h} width={bw - 6} height={h} rx="2" fill="#6366f1" opacity="0.85" />
            <text x={10 + i * bw + bw / 2} y={height - 20 - h} textAnchor="middle" fontSize="9" fill="#4338ca" fontWeight="700">{c}</text>
            <text x={10 + i * bw + bw / 2} y={height - 5} textAnchor="middle" fontSize="9" fill="#64748b">{i + 1}</text>
          </g>
        );
      })}
      <line x1={6} y1={height - 18} x2={width - 6} y2={height - 18} stroke="#94a3b8" strokeWidth="1.5" />
    </svg>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ───────────────────────────────────────────────────────────────────────
       M1 — LE LABORATOIRE DU DÉ. Ce que le hasard laisse derrière lui : une
       série. Les mots qui la décrivent naissent ici, chacun après son geste.
       ─────────────────────────────────────────────────────────────────────── */
    1: [
      {
        id: 'experience-aleatoire',
        type: 'vocabulaire',
        title: 'Expérience aléatoire',
        summary: 'Une expérience dont on connaît les résultats possibles, mais jamais celui qui va sortir.',
        body: (
          <div className="space-y-2">
            <p>Lancer un dé, c’est une <strong>expérience aléatoire</strong> : les six résultats
            possibles sont connus d’avance, mais aucun calcul ne dit lequel va tomber.</p>
            <p className="text-xs text-slate-500">Deviner juste ne prouve rien : la prochaine fois,
            le dé recommence de zéro. Il n’a pas de mémoire.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu avais annoncé une face,
            et le dé n’en a fait qu’à sa tête.</div>
          </div>
        ),
      },
      {
        id: 'serie-statistique',
        type: 'concepts',
        title: 'Série statistique, valeurs et effectifs',
        summary: 'Une série est un paquet de données. Les VALEURS sont ce qu’on relève, les EFFECTIFS le nombre de fois où chacune revient.',
        visual: <MiniBars counts={[2, 1, 3, 1, 2, 1]} />,
        body: (
          <div className="space-y-2">
            <p>Sur ce graphique, les faces 1 à 6 sont les <strong>valeurs</strong> — on les lit
            en bas, sur l’axe. Les hauteurs de barres sont les <strong>effectifs</strong> — le
            nombre de lancers qui ont donné cette face.</p>
            <p>Ici la face 3 a pour effectif 3 : trois lancers l’ont donnée. Additionner les six
            effectifs redonne toujours le nombre total de données, ici 10.</p>
            <p className="text-xs text-slate-500">Ne pas confondre les deux nombres : 3 est une
            valeur quand on la lit sur l’axe, un effectif quand on la lit sur la hauteur.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : chaque lancer faisait
            monter une barre d’un cran.</div>
          </div>
        ),
      },
      {
        id: 'frequence',
        type: 'formules',
        title: 'La fréquence d’une valeur',
        summary: 'La part du total qui revient à une valeur : son effectif divisé par l’effectif total.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\text{fréquence} = \\dfrac{\\text{effectif de la valeur}}{\\text{effectif total}}$'}</MathText>
            </div>
            <p>Sur 100 lancers, une face sortie 19 fois a pour fréquence 19 ÷ 100 = 0,19, soit
            <strong> 19 %</strong>. Une fréquence s’écrit indifféremment en fraction, en écriture
            décimale ou en pourcentage.</p>
            <p className="text-xs text-slate-500">Pourquoi diviser ? Parce que 19 fois sur 100 et
            190 fois sur 1 000, c’est la même part. La fréquence permet de comparer des séries de
            <strong> tailles différentes</strong> ; les effectifs seuls ne le permettent pas.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as transformé un
            effectif sur 100 en pourcentage.</div>
          </div>
        ),
      },
      {
        id: 'stabilisation',
        type: 'regles',
        title: 'Les fréquences se stabilisent',
        summary: 'Plus on répète l’expérience, plus les fréquences se resserrent autour d’une valeur — sans jamais devenir exactement égales.',
        body: (
          <div className="space-y-2">
            <p>Sur 10 lancers, les six fréquences sont très écartées. Sur 100, elles se
            rapprochent. Sur 1 000, l’écart entre la plus grande et la plus petite devient
            petit.</p>
            <p className="text-xs text-slate-500">Attention à deux pièges symétriques : les
            fréquences ne deviennent <strong>pas</strong> exactement égales, et une face en
            retard n’a <strong>aucune</strong> raison de « rattraper ». Elles se resserrent, voilà
            tout.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tes trois séries de
            1 000 lancers n’avaient jamais la même face en tête.</div>
          </div>
        ),
      },
      {
        id: 'probabilite',
        type: 'concepts',
        title: 'Probabilité',
        summary: 'La part qu’on attend d’un modèle : pour un dé équilibré, une face sur six.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$P(\\text{une face}) = \\dfrac{1}{6} \\approx 16{,}7\\ \\%$'}</MathText>
            </div>
            <p>Un dé <strong>équilibré</strong> donne la même chance à ses six faces : 1 cas
            favorable sur 6 cas possibles. Ce nombre-là ne dépend d’aucune expérience — c’est le
            <strong> modèle</strong> du dé, pas un relevé.</p>
            <p className="text-xs text-slate-500">Il s’écrit P(6) = 1/6, et il n’est vrai que si
            les faces sont équiprobables : un dé alourdi a d’autres probabilités.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le repère 1/6 est apparu
            sur ta série, et les six barres le serraient toutes.</div>
          </div>
        ),
      },
      {
        id: 'mem-frequence-vs-probabilite',
        type: 'memoriser',
        title: '⭐ Fréquence ≠ probabilité',
        summary: 'La fréquence dit ce qui s’est passé. La probabilité dit ce qu’on attend. Elles se rapprochent, elles ne se confondent pas.',
        body: (
          <div className="space-y-2">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900">
                <strong>Fréquence</strong> — mesurée. Elle vient d’une série de lancers, et elle
                change d’une série à l’autre.
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>Probabilité</strong> — attendue. Elle vient du modèle, et elle ne bouge
                pas.
              </div>
            </div>
            <p className="text-xs text-slate-500">Obtenir 22 fois le 4 sur 100 lancers ne fait pas
            passer sa probabilité à 22 % : cela donne une fréquence de 22 %, pendant que la
            probabilité reste 1/6.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux cases côte à côte,
            deux nombres proches, deux natures différentes.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M2 — LE POINT D'ÉQUILIBRE. La moyenne d'abord comme un lieu, ensuite
       comme un calcul. Ni médiane ni étendue ici : elles n'existent pas encore.
       ─────────────────────────────────────────────────────────────────────── */
    2: [
      {
        id: 'moyenne',
        type: 'concepts',
        title: 'La moyenne, point d’équilibre',
        summary: 'La moyenne est l’endroit où la série tient en équilibre : les écarts d’un côté compensent exactement ceux de l’autre.',
        visual: <MiniDots values={[5, 10, 15, 15, 20, 25]} mark={15} markLabel="moyenne" />,
        body: (
          <div className="space-y-2">
            <p>Imagine la série posée sur une planche. Le <strong>pivot</strong> ne tient qu’à un
            seul endroit : celui où les distances à gauche et à droite se compensent. C’est la
            <strong> moyenne</strong>.</p>
            <p>Ici : 5 et 10 sont à 10 et 5 minutes à gauche de 15 ; 20 et 25 sont à 5 et 10 à
            droite. Total à gauche 15, total à droite 15 : équilibre.</p>
            <p className="text-xs text-slate-500">Autrement dit, la moyenne <strong>répartit
            équitablement</strong> : c’est ce que chacun aurait si le total était partagé
            également entre tous.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le triangle ambre que tu
            as glissé jusqu’à ce que plus rien ne penche.</div>
          </div>
        ),
      },
      {
        id: 'calcul-moyenne',
        type: 'formules',
        title: 'Calculer la moyenne',
        summary: 'Somme de toutes les valeurs, divisée par leur effectif total.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\text{moyenne} = \\dfrac{\\text{somme des valeurs}}{\\text{effectif total}}$'}</MathText>
            </div>
            <p>Pour 5, 10, 15, 15, 20, 25 : la somme vaut 90, l’effectif 6, donc
            90 ÷ 6 = <strong>15</strong> — exactement le pivot trouvé à la main.</p>
            <p className="text-xs text-slate-500">La division n’invente rien : elle
            <strong> calcule</strong> le point d’équilibre. Deux erreurs à éviter — s’arrêter à la
            somme, ou donner l’effectif à la place du résultat.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 90 ÷ 6 = 15, le même
            nombre que le pivot.</div>
          </div>
        ),
      },
      {
        id: 'mem-ce-que-la-moyenne-ne-dit-pas',
        type: 'memoriser',
        title: '⭐ Ce que la moyenne ne dit pas',
        summary: 'La moyenne égalise. Elle ne dit pas combien de données sont en dessous, ni laquelle revient le plus souvent.',
        body: (
          <div className="space-y-2">
            <p>« Moyenne 15 min » signifie : si tous mettaient le même temps, ce serait 15 min.
            Cela ne signifie <strong>pas</strong> que la moitié de la classe met moins de 15 min,
            ni que 15 min est le temps le plus courant.</p>
            <p className="text-xs text-slate-500">La moyenne peut même ne correspondre à
            <strong> aucune</strong> donnée réelle : une classe où la moitié met 5 min et l’autre
            25 min a pour moyenne 15 — sans qu’un seul élève mette 15 min.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le pivot tombait entre
            les points, pas forcément sur l’un d’eux.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M3 — LA VALEUR DU MILIEU. Médiane, puis étendue. Chacune posée juste
       avant la demande qui l'exige.
       ─────────────────────────────────────────────────────────────────────── */
    3: [
      {
        id: 'mediane',
        type: 'concepts',
        title: 'La médiane',
        summary: 'La valeur qui partage la série RANGÉE en deux moitiés de même effectif : autant de données en dessous qu’au-dessus.',
        visual: <MiniDots values={[5, 8, 10, 10, 12, 15, 15, 15, 20, 25, 30, 35]} mark={15} markColor="#059669" markLabel="médiane" />,
        body: (
          <div className="space-y-2">
            <p>On range d’abord les valeurs dans l’ordre, puis on cherche celle qui coupe
            l’effectif en deux. Sur ces douze trajets : six élèves en dessous, six au-dessus.</p>
            <p className="text-xs text-slate-500">Deux pièges : ranger la série est
            <strong> obligatoire</strong> — prendre le nombre du milieu d’une liste non triée
            donne n’importe quoi ; et la médiane partage l’<strong>effectif</strong>, pas
            l’intervalle des valeurs.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le trait vert laissait
            six points de chaque côté.</div>
          </div>
        ),
      },
      {
        id: 'mediane-effectif-pair',
        type: 'methodes',
        title: 'La médiane d’un effectif pair',
        summary: 'Avec un effectif pair, aucune donnée n’est au milieu : la médiane est la moyenne des deux valeurs centrales.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono text-sm">
              4 &nbsp; <strong className="text-emerald-700">6</strong> &nbsp;|&nbsp;{' '}
              <strong className="text-emerald-700">9</strong> &nbsp; 11
              <div className="mt-1"><MathText>{'$(6 + 9) \\div 2 = 7{,}5$'}</MathText></div>
            </div>
            <p>Quatre valeurs rangées : la coupure tombe <strong>entre</strong> la 2<sup>e</sup> et
            la 3<sup>e</sup>. On prend la moyenne de ces deux valeurs centrales.</p>
            <p className="text-xs text-slate-500">Conséquence importante : la médiane n’est alors
            <strong> pas</strong> une donnée de la série. 7,5 n’a été relevé chez personne — et
            c’est parfaitement normal.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux valeurs au milieu,
            une médiane entre les deux.</div>
          </div>
        ),
      },
      {
        id: 'etendue',
        type: 'formules',
        title: 'L’étendue',
        summary: 'L’écart entre la plus grande et la plus petite valeur : elle mesure la DISPERSION de la série.',
        visual: <MiniDots values={[5, 8, 10, 10, 12, 15, 15, 15, 20, 25, 30, 35]} />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\text{étendue} = \\text{plus grande valeur} - \\text{plus petite valeur}$'}</MathText>
            </div>
            <p>Sur ces douze trajets, le plus long dure 35 min et le plus court 5 min :
            l’étendue vaut 35 − 5 = <strong>30 min</strong>.</p>
            <p className="text-xs text-slate-500">L’étendue est un <strong>écart</strong>, pas une
            valeur typique : elle ne dit ni où se situent les données, ni combien il y en a. Une
            grande étendue signale des données très <strong>dispersées</strong> ; une petite, des
            données resserrées.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le crochet violet allait
            d’un bout à l’autre de l’axe.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M4 — LA SÉRIE ÉLASTIQUE. La règle sort de la manipulation : elle est
       posée APRÈS que l'élève a vu la moyenne bouger sans la médiane.
       ─────────────────────────────────────────────────────────────────────── */
    4: [
      {
        id: 'influence-valeur',
        type: 'regles',
        title: 'Ce qu’une seule valeur déplace',
        summary: 'Déplacer une valeur de Δ décale TOUJOURS la moyenne de Δ ÷ effectif. La médiane ne bouge que si l’ordre change ; l’étendue, que si on touche un extrême.',
        body: (
          <div className="space-y-2">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Moyenne</strong> — elle additionne tout : chaque valeur pèse. Un trajet
                allongé de 40 min dans une classe de 20 élèves la fait monter de
                40 ÷ 20 = 2 min.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Médiane</strong> — elle ne regarde que le <strong>rang</strong> des
                valeurs. Éloigner le maximum ne change pas son rang : elle reste immobile.
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>Étendue</strong> — elle ne connaît que les deux extrêmes. Bouger une
                valeur centrale ne la change pas.
              </div>
            </div>
            <p className="text-xs text-slate-500">La plus grande valeur n’est jamais « ignorée »
            par la médiane : elle occupe toujours la dernière place. C’est seulement sa
            <strong> place</strong> qui compte, pas sa taille.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as tiré une pastille,
            le triangle bleu a glissé et le trait vert n’a pas bougé.</div>
          </div>
        ),
      },
      {
        id: 'valeur-extreme',
        type: 'vocabulaire',
        title: 'Valeur extrême',
        summary: 'Une donnée très éloignée des autres. Ce n’est pas une erreur : c’est une donnée qui pèse lourd dans la moyenne.',
        body: (
          <div className="space-y-2">
            <p>Un élève qui met 35 min quand les autres en mettent 10 est une <strong>valeur
            extrême</strong> de la série. Elle est vraie, et elle compte — dans la moyenne comme
            dans l’étendue.</p>
            <p className="text-xs text-slate-500">Quand une série a des valeurs extrêmes d’un
            seul côté, la moyenne se déplace de ce côté, alors que la médiane reste au milieu de
            l’effectif. C’est ce qui explique qu’elles ne tombent presque jamais au même
            endroit.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : un seul déménagement
            déplaçait la moyenne de toute la classe.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M5 — TROIS INDICATEURS. Le mot qui les rassemble, la moyenne pondérée,
       et le choix. Remplace l'ancien « 🔑 À retenir » recopié à la main.
       ─────────────────────────────────────────────────────────────────────── */
    5: [
      {
        id: 'indicateur',
        type: 'vocabulaire',
        title: 'Indicateur statistique',
        summary: 'Un nombre qui résume une série. Moyenne, médiane et étendue sont trois indicateurs : ils ne répondent pas à la même question.',
        body: (
          <div className="space-y-2">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Moyenne</strong> — partage équitablement le total. Toute valeur pèse.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Médiane</strong> — partage l’effectif en deux. Seul l’ordre compte.
              </div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900">
                <strong>Étendue</strong> — mesure la dispersion, du minimum au maximum.
              </div>
            </div>
            <p className="text-xs text-slate-500">Un indicateur <strong>résume</strong>, donc il
            perd de l’information. Aucun n’est « le bon » dans l’absolu.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois repères sur le
            même axe, à trois endroits différents.</div>
          </div>
        ),
      },
      {
        id: 'moyenne-ponderee',
        type: 'methodes',
        title: 'La moyenne pondérée',
        summary: 'À partir d’un tableau d’effectifs : chaque valeur × son effectif, on additionne, on divise par l’effectif TOTAL.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\dfrac{10 \\times 2 + 15 \\times 3 + 20 \\times 5}{2 + 3 + 5} = \\dfrac{165}{10} = 16{,}5$'}</MathText>
            </div>
            <p>Chaque valeur doit compter <strong>autant de fois qu’il y a de données</strong> :
            si trois élèves mettent 15 min, 15 compte trois fois, pas une.</p>
            <p className="text-xs text-slate-500">L’erreur classique : diviser par le nombre de
            valeurs <em>différentes</em> du tableau au lieu de l’effectif total. Cela reviendrait à
            faire voter chaque valeur une seule fois, quel que soit le nombre d’élèves
            derrière.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne « effectif » du
            tableau, juste sous la ligne des temps.</div>
          </div>
        ),
      },
      {
        id: 'choisir-indicateur',
        type: 'methodes',
        title: 'Choisir son indicateur',
        summary: 'C’est la question posée qui décide de l’indicateur, jamais l’inverse.',
        body: (
          <div className="space-y-2">
            <ul className="text-sm space-y-1 list-disc list-inside text-slate-700">
              <li>Un <strong>total à répartir</strong> → la moyenne (× l’effectif, elle le
              redonne).</li>
              <li>Un <strong>cas typique</strong>, sans se laisser tirer par les extrêmes → la
              médiane.</li>
              <li>Un <strong>écart</strong>, une dispersion → l’étendue.</li>
              <li>Une <strong>comparaison</strong> sérieuse en regarde plusieurs, jamais un
              seul.</li>
            </ul>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : quatre questions, quatre
            indicateurs différents.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M6 — DEUX CLASSES. Ce qu'un indicateur seul ne peut pas dire.
       ─────────────────────────────────────────────────────────────────────── */
    6: [
      {
        id: 'comparer-series',
        type: 'regles',
        title: 'Comparer deux séries',
        summary: 'Deux séries peuvent partager moyenne ET médiane et décrire des réalités opposées : c’est la dispersion qui les sépare.',
        visual: (
          <div className="space-y-1">
            <MiniDots values={[13, 14, 15, 15, 16, 17]} mark={15} markLabel="15" />
            <MiniDots values={[5, 8, 15, 15, 22, 25]} mark={15} markLabel="15" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>Ces deux séries ont la même <strong>moyenne</strong> (15) et la même
            <strong> médiane</strong> (15). Leurs étendues, elles, valent 4 et 20 : la seconde est
            cinq fois plus dispersée.</p>
            <p className="text-xs text-slate-500">Comparer, c’est donc regarder
            <strong> plusieurs</strong> indicateurs. Un chiffre unique ne décrit jamais une
            situation à lui seul — et deux chiffres identiques ne prouvent pas deux situations
            identiques.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux axes empilés, les
            mêmes repères, deux nuages qui n’avaient rien à voir.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M7 — LE LABO DES DONNÉES. Retourner la moyenne, et lire un chiffre
       publié d'un œil critique.
       ─────────────────────────────────────────────────────────────────────── */
    7: [
      {
        id: 'viser-une-moyenne',
        type: 'methodes',
        title: 'Viser une moyenne',
        summary: 'Pour atteindre une moyenne visée, on raisonne sur la SOMME : somme visée = moyenne visée × effectif final.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\text{valeur manquante} = \\text{moyenne visée} \\times \\text{effectif} - \\text{somme actuelle}$'}</MathText>
            </div>
            <p>Cinq notes valant 70 au total, une sixième à venir, cible 15 de moyenne : la somme
            visée est 6 × 15 = 90, donc il manque 90 − 70 = <strong>20</strong>.</p>
            <p className="text-xs text-slate-500">Ajouter une valeur égale à la cible ne suffit
            <strong> pas</strong> : tant que les autres valeurs sont en dessous, il faut compenser
            tout le retard accumulé.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : avec 15, la moyenne
            montait — mais pas jusqu’à 15.</div>
          </div>
        ),
      },
      {
        id: 'mem-lire-un-chiffre-publie',
        type: 'memoriser',
        title: '⭐ Une moyenne citée seule peut tromper',
        summary: 'Un chiffre juste peut induire en erreur : la moyenne ne dit rien du nombre de données proches d’elle.',
        body: (
          <div className="space-y-2">
            <p>« La moyenne est de 16 min, donc la plupart des élèves mettent environ 16 min » est
            une phrase <strong>trompeuse</strong>. Si la moitié met 5 min et l’autre 27 min, la
            moyenne vaut bien 16 — et personne ne met 16 min.</p>
            <p className="text-xs text-slate-500">Le réflexe à garder : devant une moyenne
            publiée, demander la <strong>dispersion</strong>. Sans elle, on ne sait pas si le
            chiffre décrit tout le monde ou personne.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’affirmation du journal,
            juste et fausse à la fois.</div>
          </div>
        ),
      },
    ],
  },
};
