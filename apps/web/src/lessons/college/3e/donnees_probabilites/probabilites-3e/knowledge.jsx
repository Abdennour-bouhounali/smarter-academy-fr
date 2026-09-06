import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Probabilités » (3e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md, docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner son sens, puis il reste disponible dans la
 * carte. Rien n'est réécrit dans les modules : la brique et la carte montrent
 * le même texte, et l'enrichir se fait à un seul endroit.
 *
 * CE QUE CETTE CARTE RÉPARE. Presque tout le vocabulaire probabiliste arrivait
 * dans des `explain`, donc APRÈS la réponse :
 *   M1 étape 2  « effectif »                     → dans l'explain, alors que
 *               l'étape 3 demandait déjà d'en calculer la part
 *   M1 étape 3  « fréquence observée »           → dans l'explain, puis exigée
 *               par les étapes 5 et 8
 *   M1 étape 7  « probabilité »                  → dans l'explain de la question
 *               qui la faisait déjà calculer
 *   M1 étape 9  « dé équilibré / équiprobable »  → jamais posé, seulement cité
 *               dans un prompt et un explain
 *   M2 étapes 1–4 « issue », « événement », « impossible / certain » → tous en
 *               `Feedback` de fin d'étape ou en explain
 *   M3 étape 1  P = favorables ÷ possibles       → en Feedback après réussite,
 *               alors que les étapes 3 et 5 l'exigent
 *   M5 étape 2  un bloc « À retenir » recopié à la main, qui redéfinissait tout
 *   M7          la synthèse recopiait une quatrième fois les quatre définitions
 * Ici chaque mot est posé par une brique, après le geste et avant la demande.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare — la brique rend ce texte à sa position, donc un exemple qui
 * anticiperait un module ultérieur serait un spoiler visible à l'écran. Le mot
 * « événement » n'apparaît donc nulle part avant M2, la formule P = k/n nulle
 * part avant M3, les 36 couples nulle part avant M4, l'événement contraire
 * nulle part avant M5.
 *
 * PRÉREQUIS (lesson.config.js `priorKnowledge`) : simplifier et comparer des
 * fractions, lire un pourcentage, soustraire à 1 — années antérieures. Le
 * module 0 les diagnostique, et rien d'autre : ni issue, ni événement, ni
 * fréquence, ni probabilité.
 */

/* ── Mini-visuels, dérivés des mêmes objets que les modules ───────────────── */

const PIP = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

/** Une face de dé, la même géométrie que DiceLab — six pastilles au plus. */
function Die({ face, size = 34, x = 0, y = 0, tone = '#0f172a', bg = '#ffffff', stroke = '#cbd5e1' }) {
  const s = size;
  const c = s / 2;
  const off = s * 0.26;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={s} height={s} rx={s * 0.22} fill={bg} stroke={stroke} strokeWidth="1.5" />
      {(PIP[face] ?? []).map(([dx, dy], i) => (
        <circle key={i} cx={c + dx * off} cy={c + dy * off} r={s * 0.085} fill={tone} />
      ))}
    </g>
  );
}

/** Les six issues d'un lancer, alignées ; celles d'un événement en indigo. */
function SixFaces({ highlight = [], width = 232 }) {
  const s = 32;
  const gap = 6;
  return (
    <svg width={width} height={44} viewBox={`0 0 ${width} 44`} role="img"
      aria-label={highlight.length > 0
        ? `Les six faces d'un dé ; les faces ${highlight.join(', ')} sont retenues`
        : "Les six faces d'un dé"}>
      {[1, 2, 3, 4, 5, 6].map((f, i) => {
        const on = highlight.includes(f);
        return (
          <Die key={f} face={f} size={s} x={6 + i * (s + gap)} y={6}
            tone={on ? '#ffffff' : '#0f172a'}
            bg={on ? '#4f46e5' : '#ffffff'}
            stroke={on ? '#4338ca' : '#cbd5e1'} />
        );
      })}
    </svg>
  );
}

/** Six barres presque égales autour d'un repère : ce que 1 000 lancers donnent. */
function MiniBars({ counts, mark = null, width = 232, height = 96 }) {
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  const fr = counts.map((c) => c / total);
  const top = Math.max(...fr, mark ?? 0) * 1.35 || 1;
  const bw = 26;
  const gap = 8;
  const base = height - 16;
  const h = (v) => (v / top) * (base - 10);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Six barres de fréquences${mark ? ', avec un repère théorique' : ''}`}>
      {fr.map((v, i) => (
        <g key={i}>
          <rect x={8 + i * (bw + gap)} y={base - h(v)} width={bw} height={h(v)} rx="3" fill="#6366f1" opacity="0.85" />
          <text x={8 + i * (bw + gap) + bw / 2} y={height - 4} textAnchor="middle" fontSize="9" fill="#64748b">{i + 1}</text>
        </g>
      ))}
      {mark !== null && (
        <g>
          <line x1={4} y1={base - h(mark)} x2={width - 4} y2={base - h(mark)}
            stroke="#f59e0b" strokeWidth="1.8" strokeDasharray="5 3" />
          <text x={width - 6} y={base - h(mark) - 4} textAnchor="end" fontSize="9" fill="#b45309">1/6</text>
        </g>
      )}
    </svg>
  );
}

/** L'échelle de 0 à 1, avec quelques repères posés. */
function MiniScale({ marks = [], width = 240 }) {
  const x = (p) => 18 + p * (width - 36);
  return (
    <svg width={width} height={62} viewBox={`0 0 ${width} 62`} role="img"
      aria-label="Échelle des probabilités de 0 à 1">
      <line x1={x(0)} y1={38} x2={x(1)} y2={38} stroke="#94a3b8" strokeWidth="2" />
      {[0, 0.5, 1].map((g) => (
        <g key={g}>
          <line x1={x(g)} y1={33} x2={x(g)} y2={43} stroke="#94a3b8" strokeWidth="2" />
          <text x={x(g)} y={56} textAnchor="middle" fontSize="9" fill="#64748b">
            {g === 0.5 ? '0,5' : g}
          </text>
        </g>
      ))}
      <text x={x(0)} y={22} textAnchor="start" fontSize="8.5" fill="#be123c">impossible</text>
      <text x={x(1)} y={22} textAnchor="end" fontSize="8.5" fill="#047857">certain</text>
      {marks.map((m) => (
        <g key={m.label}>
          <circle cx={x(m.p)} cy={38} r={4.5} fill={m.color ?? '#7c3aed'} />
          <text x={x(m.p)} y={12} textAnchor="middle" fontSize="9" fill={m.color ?? '#6d28d9'} fontWeight="bold">{m.label}</text>
        </g>
      ))}
    </svg>
  );
}

/** La grille 6 × 6 des couples de deux dés ; la diagonale « somme 7 » en vert. */
function MiniGrid({ highlight = () => false, width = 168 }) {
  const cell = width / 7;
  return (
    <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`} role="img"
      aria-label="Grille des 36 couples de deux dés">
      {[1, 2, 3, 4, 5, 6].map((a) => (
        <text key={`r${a}`} x={cell * 0.5} y={cell * (a + 0.65)} textAnchor="middle" fontSize="9" fill="#64748b">{a}</text>
      ))}
      {[1, 2, 3, 4, 5, 6].map((b) => (
        <text key={`c${b}`} x={cell * (b + 0.5)} y={cell * 0.72} textAnchor="middle" fontSize="9" fill="#64748b">{b}</text>
      ))}
      {[1, 2, 3, 4, 5, 6].map((a) => [1, 2, 3, 4, 5, 6].map((b) => (
        <rect key={`${a}-${b}`} x={cell * b + 1} y={cell * a + 1} width={cell - 2} height={cell - 2} rx="2"
          fill={highlight(a, b) ? '#10b981' : '#f1f5f9'} stroke="#cbd5e1" strokeWidth="0.8" />
      )))}
    </svg>
  );
}

/** Un sac : les billes d'une couleur sur le total. */
function MiniBag({ rouge = 2, bleu = 4, vert = 2, width = 200 }) {
  const all = [
    ...Array.from({ length: rouge }, () => '#dc2626'),
    ...Array.from({ length: bleu }, () => '#2563eb'),
    ...Array.from({ length: vert }, () => '#16a34a'),
  ];
  const per = 8;
  const r = 8;
  const rows = Math.ceil(all.length / per);
  const height = 18 + rows * (r * 2 + 5);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img"
      aria-label={`Sac de ${all.length} billes : ${rouge} rouges, ${bleu} bleues, ${vert} vertes`}>
      {all.map((fill, i) => (
        <circle key={i} cx={14 + (i % per) * (r * 2 + 4)} cy={12 + Math.floor(i / per) * (r * 2 + 5) + r}
          r={r} fill={fill} opacity="0.9" />
      ))}
    </svg>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ───────────────────────────────────────────────────────────────────────
       M1 — LE LABORATOIRE DU DÉ. Ce qu'un lancer ne dit pas, ce que mille
       lancers disent. Chaque mot naît après le geste qui lui donne son sens :
       l'imprévisibilité d'abord, les barres ensuite, la part enfin, et pour
       finir le nombre que la part cherchait. Ni « événement », ni la formule
       P = k/n : ils n'existent pas encore.
       ─────────────────────────────────────────────────────────────────────── */
    1: [
      {
        id: 'experience-aleatoire',
        type: 'vocabulaire',
        title: 'Expérience aléatoire et issues',
        summary: 'Une expérience dont on connaît tous les résultats possibles — les ISSUES — sans jamais savoir lequel va sortir.',
        visual: <SixFaces />,
        body: (
          <div className="space-y-2">
            <p>Lancer un dé, c’est une <strong>expérience aléatoire</strong> : les six résultats
            possibles sont connus d’avance, mais aucun calcul ne dit lequel va tomber.</p>
            <p>Chacun de ces résultats possibles s’appelle une <strong>issue</strong>. Le lancer
            d’un dé a six issues : 1, 2, 3, 4, 5, 6. Le lancer d’une pièce en a deux : pile et
            face.</p>
            <p className="text-xs text-slate-500">Deviner juste ne prouve rien : la prochaine
            fois, le dé recommence de zéro.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu avais annoncé une face,
            et le dé n’en a fait qu’à sa tête.</div>
          </div>
        ),
      },
      {
        id: 'effectif',
        type: 'vocabulaire',
        title: 'Effectif d’une issue',
        summary: 'Le nombre de fois où une issue est sortie : c’est la hauteur de sa barre.',
        visual: <MiniBars counts={[2, 1, 3, 1, 2, 1]} />,
        body: (
          <div className="space-y-2">
            <p>Les faces 1 à 6 se lisent en bas, sur l’axe. La hauteur de chaque barre est
            l’<strong>effectif</strong> de cette face : le nombre de lancers qui l’ont donnée.</p>
            <p>Ici la face 3 a pour effectif 3. Additionner les six effectifs redonne toujours le
            nombre total de lancers, ici 10.</p>
            <p className="text-xs text-slate-500">Ne pas confondre les deux nombres : 3 est une
            face quand on la lit sur l’axe, un effectif quand on la lit sur la hauteur.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : chaque lancer faisait
            monter une barre d’un cran.</div>
          </div>
        ),
      },
      {
        id: 'frequence',
        type: 'formules',
        title: 'La fréquence observée',
        summary: 'La part du total qui revient à une issue : son effectif divisé par le nombre total de lancers.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\text{fréquence} = \\dfrac{\\text{effectif de l\'issue}}{\\text{nombre total de lancers}}$'}</MathText>
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
        summary: 'Plus on répète l’expérience, plus les fréquences se resserrent autour d’une même valeur — sans jamais devenir exactement égales.',
        body: (
          <div className="space-y-2">
            <p>Sur 10 lancers, les six fréquences sont très écartées. Sur 100, elles se
            rapprochent. Sur 1 000, l’écart entre la plus grande et la plus petite devient
            petit.</p>
            <p className="text-xs text-slate-500">Attention à deux pièges symétriques : les
            fréquences ne deviennent <strong>pas</strong> exactement égales, et une face en
            retard n’a <strong>aucune</strong> raison de « rattraper ». Elles se resserrent,
            voilà tout.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tes trois séries de
            1 000 lancers n’avaient jamais la même face en tête.</div>
          </div>
        ),
      },
      {
        id: 'mem-sans-memoire',
        type: 'memoriser',
        title: '⭐ Le hasard n’a pas de mémoire',
        summary: 'Ce qui vient de sortir ne change rien au lancer suivant : il repart avec les mêmes chances.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-3 text-center space-y-1">
              <div className="text-base font-black text-rose-700">6 · 6 · 6 → le suivant est un lancer comme les autres</div>
            </div>
            <p>Le dé ne sait pas ce qu’il vient de faire. Ni « il continue sur sa lancée », ni
            « il doit compenser » : les deux idées sont fausses, et symétriques.</p>
            <p className="text-xs text-slate-500">Trois 6 d’affilée sont rares — environ une série
            sur 216 — mais une fois arrivés, ils ne pèsent sur rien.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : après 300 fois « trois 6,
            puis on note le suivant », les six barres étaient presque de même hauteur.</div>
          </div>
        ),
      },
      {
        id: 'probabilite',
        type: 'concepts',
        title: 'Probabilité',
        summary: 'La part qu’on attend du modèle de l’expérience : pour un dé équilibré, une face sur six.',
        visual: <MiniBars counts={[168, 161, 174, 165, 170, 162]} mark={1 / 6} />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$P(\\text{une face}) = \\dfrac{1}{6} \\approx 16{,}7\\ \\%$'}</MathText>
            </div>
            <p>1 cas favorable sur 6 cas possibles. Ce nombre ne dépend d’<strong>aucune</strong>
            expérience : il vient du <strong>modèle</strong> du dé, pas d’un relevé. On l’écrit
            P(6) = 1/6.</p>
            <p className="text-xs text-slate-500">Le repère orange sur le dessin est cette
            probabilité ; les barres, elles, sont des fréquences mesurées.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le repère 1/6 est apparu
            sur ta série de 1 000 lancers, et les six barres le serraient toutes.</div>
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
            <p className="text-xs text-slate-500">Obtenir 22 fois le 4 sur 100 lancers ne fait
            pas passer sa probabilité à 22 % : cela donne une fréquence de 22 %, pendant que la
            probabilité reste 1/6.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux cases côte à côte,
            deux nombres proches, deux natures différentes.</div>
          </div>
        ),
      },
      {
        id: 'equiprobable',
        type: 'concepts',
        title: 'Issues équiprobables, dé équilibré',
        summary: 'Des issues sont équiprobables quand elles ont exactement la même chance. Sans cette hypothèse, 1/6 est faux.',
        body: (
          <div className="space-y-2">
            <p>Un dé <strong>équilibré</strong> donne la même chance à ses six faces : ses issues
            sont <strong>équiprobables</strong>. C’est cette hypothèse — et elle seule — qui
            permet d’écrire P = 1/6.</p>
            <p>Alourdir une face casse l’hypothèse. Le dé a toujours six issues, mais elles n’ont
            plus la même chance : la probabilité de la face alourdie passe à 3/8 = 37,5 %, et
            celle de chacune des autres à 1/8 = 12,5 %.</p>
            <p className="text-xs text-slate-500">Une probabilité se lit donc toujours sur un
            modèle : dire « P = 1/6 » sans dire « dé équilibré » n’a pas de sens.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la barre de ta face
            alourdie dépassait nettement les cinq autres, sur 1 000 lancers.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M2 — ISSUES ET ÉVÉNEMENTS. On regroupe des issues et l'on nomme le
       paquet. La formule P = k/n n'apparaît pas ici : le module 3 la construit
       sur le sac. Ici on ne fait que compter des issues favorables.
       ─────────────────────────────────────────────────────────────────────── */
    2: [
      {
        id: 'evenement',
        type: 'concepts',
        title: 'Événement',
        summary: 'Un événement n’est pas une issue : c’est un ENSEMBLE d’issues, celles qui le réalisent.',
        visual: <SixFaces highlight={[2, 4, 6]} />,
        body: (
          <div className="space-y-2">
            <p>« Obtenir un nombre pair » n’est pas une face : c’est <strong>trois</strong> faces
            à la fois — 2, 4 et 6. On dit que ces trois issues <strong>réalisent</strong>
            l’événement.</p>
            <p>On compte alors les issues <strong>favorables</strong> (celles qui réalisent
            l’événement) parmi les issues <strong>possibles</strong> : ici 3 favorables sur 6
            possibles.</p>
            <p className="text-xs text-slate-500">Plus un événement est réalisé par d’issues, plus
            il a de chances : « pair » (3 faces) l’emporte sur « plus de 4 » (5 et 6, donc 2
            faces), qui l’emporte sur « obtenir un 3 » (1 face).</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as touché les faces
            une à une, et la part de l’événement grandissait avec elles.</div>
          </div>
        ),
      },
      {
        id: 'evenement-impossible-certain',
        type: 'vocabulaire',
        title: 'Événement impossible, événement certain',
        summary: 'Aucune issue favorable : impossible, chance 0. Toutes les issues favorables : certain, chance 1.',
        visual: <MiniScale marks={[]} />,
        body: (
          <div className="space-y-2">
            <p>Un événement qu’<strong>aucune</strong> issue ne réalise est <strong>impossible</strong> :
            sa chance vaut <strong>0</strong>. Avec un dé à six faces, « obtenir 7 » est
            impossible.</p>
            <p>Un événement que <strong>toutes</strong> les issues réalisent est
            <strong> certain</strong> : sa chance vaut <strong>1</strong>. « Obtenir 6 ou
            moins » est certain.</p>
            <p className="text-xs text-slate-500">Tous les autres événements sont entre les deux :
            leur chance est un nombre strictement compris entre 0 et 1.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as trié quatre
            événements en trois colonnes — 0, entre les deux, 1.</div>
          </div>
        ),
      },
      {
        id: 'probabilite-mesure-chance',
        type: 'concepts',
        title: 'La probabilité mesure la chance d’un événement',
        summary: 'Le nombre entre 0 et 1 attaché à un événement : plus il est proche de 1, plus l’événement est probable.',
        body: (
          <div className="space-y-2">
            <p>Tu as vu la probabilité pour une face d’un dé équilibré. Elle vaut aussi pour un
            événement : c’est un nombre entre <strong>0</strong> (impossible) et <strong>1</strong>
            (certain) qui mesure la <strong>possibilité</strong> qu’il se réalise.</p>
            <p>Ce nombre ne dit jamais ce qui va arriver <em>une</em> fois. Il dit ce qu’on attend
            quand on répète l’expérience beaucoup de fois.</p>
            <p className="text-xs text-slate-500">« Probable » n’est pas « certain » : une
            probabilité de 0,9 laisse encore une journée sur dix à l’autre issue.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : « plus de 4 » se réalisait
            environ une fois sur trois sur ta série de 1 000 lancers.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M3 — LE SAC DE BILLES. La formule enfin, parce que le sac la rend
       évidente : compter les billes favorables, compter toutes les billes.
       Deux sacs proportionnels ont la même probabilité ; sur n tirages on
       attend P × n. Rien sur deux dés : le module 4 s'en charge.
       ─────────────────────────────────────────────────────────────────────── */
    3: [
      {
        id: 'formule-probabilite',
        type: 'formules',
        title: 'Calculer une probabilité',
        summary: 'Quand toutes les issues ont la même chance : P(A) = nombre d’issues favorables ÷ nombre d’issues possibles.',
        visual: <MiniBag rouge={2} bleu={4} vert={2} />,
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$P(A) = \\dfrac{\\text{nombre d\'issues favorables}}{\\text{nombre d\'issues possibles}}$'}</MathText>
            </div>
            <p>Dans ce sac de 8 billes, 2 sont rouges :{' '}
            <MathText>{'$P(\\text{rouge}) = \\dfrac{2}{8} = \\dfrac{1}{4}$'}</MathText>. Le
            dénominateur est le nombre <strong>total</strong> de billes — jamais celles des autres
            couleurs.</p>
            <p className="text-xs text-slate-500">La formule n’est valable qu’à une condition :
            chaque bille doit avoir la même chance d’être tirée. C’est l’hypothèse
            d’équiprobabilité, celle du dé équilibré.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as ajouté et retiré
            des billes jusqu’à ce que la fraction affiche une chance sur quatre.</div>
          </div>
        ),
      },
      {
        id: 'fractions-egales-meme-probabilite',
        type: 'regles',
        title: 'Deux fractions égales, la même probabilité',
        summary: 'Doubler tout le sac ne change rien : 2/8 et 4/16 décrivent la même chance.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\dfrac{2}{8} = \\dfrac{4}{16} = \\dfrac{1}{4}$'}</MathText>
            </div>
            <p>Deux fois plus de rouges, mais aussi deux fois plus de billes en tout : la
            <strong> part</strong> ne bouge pas. Une probabilité est une <strong>fraction du
            sac</strong>, pas un nombre de billes.</p>
            <p className="text-xs text-slate-500">Le piège inverse est le même : « il y a plus de
            rouges dans ce sac-ci » ne dit rien tant qu’on n’a pas comparé les totaux.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as doublé le sac et la
            fraction réduite est restée la même.</div>
          </div>
        ),
      },
      {
        id: 'somme-des-probabilites',
        type: 'regles',
        title: 'Toutes les probabilités font 1',
        summary: 'En additionnant les probabilités de toutes les issues d’une expérience, on obtient toujours 1.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\dfrac{1}{2} + \\dfrac{1}{6} + \\dfrac{1}{3} = 1$'}</MathText>
            </div>
            <p>Une bille tirée est forcément d’une des couleurs du sac : les couleurs se partagent
            la totalité, donc leurs probabilités se partagent le nombre 1.</p>
            <p className="text-xs text-slate-500">C’est commode : si deux couleurs sur trois sont
            connues, la troisième s’obtient par soustraction, sans recompter les billes.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : bleues 1/2, vertes 1/6 —
            les rouges faisaient exactement le reste.</div>
          </div>
        ),
      },
      {
        id: 'effectif-attendu',
        type: 'methodes',
        title: 'Prévoir un nombre de résultats',
        summary: 'Sur n répétitions, on attend ENVIRON P × n réalisations — jamais exactement.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\text{nombre attendu} \\approx P \\times n$'}</MathText>
            </div>
            <p>Avec un dé équilibré, P(6) = 1/6 : sur 300 lancers on attend 300 ÷ 6 =
            <strong> 50</strong> six environ. Le nombre observé s’en écarte presque toujours un
            peu : c’est une expérience aléatoire.</p>
            <p className="text-xs text-slate-500">Le mot <strong>environ</strong> n’est pas une
            précaution de style : annoncer « exactement 50 » serait faux.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu avais prévu 50, le
            tirage en a donné un nombre voisin.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M4 — DEUX DÉS. Une expérience à deux épreuves : ce sont les COUPLES qui
       sont équiprobables, pas les sommes. C'est là que la grille 6 × 6 devient
       l'outil de comptage. Rien sur l'événement contraire : module 5.
       ─────────────────────────────────────────────────────────────────────── */
    4: [
      {
        id: 'deux-epreuves-couples',
        type: 'concepts',
        title: 'Deux dés : 36 couples équiprobables',
        summary: 'Les issues d’un lancer de deux dés sont les 36 couples (dé 1 ; dé 2), pas les 11 sommes.',
        visual: <MiniGrid highlight={(a, b) => a + b === 7} />,
        body: (
          <div className="space-y-2">
            <p>La grille croise les 6 résultats du premier dé avec les 6 du second : chaque case
            est une <strong>issue</strong>, et il y en a 6 × 6 = <strong>36</strong>. Toutes ont la
            même chance.</p>
            <p>(1 ; 6) et (6 ; 1) sont <strong>deux cases différentes</strong> : les dés sont
            distincts, même s’ils se ressemblent.</p>
            <p className="text-xs text-slate-500">Les sommes, elles, ne sont <strong>pas</strong>
            équiprobables : 6 cases donnent 7 (la diagonale en vert), une seule donne 12.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la bosse de tes barres sur
            le 7, sur 1 000 lancers.</div>
          </div>
        ),
      },
      {
        id: 'evenement-sur-la-grille',
        type: 'methodes',
        title: 'Compter un événement sur la grille',
        summary: 'Un événement de deux dés se compte en cases : P(événement) = nombre de cases favorables ÷ 36.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$P(\\text{somme } 7) = \\dfrac{6}{36} = \\dfrac{1}{6}$'}</MathText>
            </div>
            <p>« Somme 7 » est réalisé par 6 couples : (1 ; 6), (2 ; 5), (3 ; 4), (4 ; 3),
            (5 ; 2), (6 ; 1). « Somme 12 » par un seul : (6 ; 6), donc P = 1/36 ≈ 2,8 %.</p>
            <p className="text-xs text-slate-500">C’est la même formule qu’avec le sac — favorables
            sur possibles — appliquée aux 36 cases plutôt qu’aux billes.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as coché les cases
            une à une, puis compté celles qui restaient en trop ou en moins.</div>
          </div>
        ),
      },
      {
        id: 'mem-piege-des-sommes',
        type: 'memoriser',
        title: '⭐ 11 sommes ≠ 1/11 chacune',
        summary: 'Compter les résultats visibles ne suffit pas : il faut compter les issues équiprobables qui les produisent.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-3 space-y-1 text-sm">
              <p className="text-rose-700">❌ « 11 sommes possibles, donc 1/11 chacune »</p>
              <p className="text-emerald-700">✅ 36 couples équiprobables ; une somme en regroupe
              de 1 à 6</p>
            </div>
            <p className="text-xs text-slate-500">Le même piège revient partout : deux catégories
            (fille / garçon, pile / face truqué) ne donnent pas 1/2 chacune. Ce qui compte, c’est
            ce qui a la même chance.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : sur ta série, le 7 sortait
            près de 16 %, très loin des 9,1 % qu’aurait donnés 1/11.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M5 — LE LANGAGE. Tout est éprouvé ; on range. L'échelle, la règle du
       contraire, et ce qu'une probabilité veut dire dans une phrase.
       ─────────────────────────────────────────────────────────────────────── */
    5: [
      {
        id: 'echelle-probabilites',
        type: 'regles',
        title: 'Toute probabilité est entre 0 et 1',
        summary: 'Une probabilité se place sur une échelle de 0 à 1 : jamais négative, jamais au-delà de 1.',
        visual: (
          <MiniScale marks={[
            { p: 1 / 6, label: '1/6', color: '#7c3aed' },
            { p: 1 / 4, label: '1/4', color: '#0891b2' },
            { p: 1 / 2, label: '1/2', color: '#d97706' },
          ]} />
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$0 \\leqslant P(A) \\leqslant 1$'}</MathText>
            </div>
            <p>Toutes les probabilités de la leçon tiennent sur cette échelle : 1/6 ≈ 0,17 à
            gauche, 1/4 = 0,25 un peu plus loin, 1/2 au milieu, 0 et 1 aux extrémités.</p>
            <p className="text-xs text-slate-500">Une valeur comme 1,2 n’est donc pas une
            probabilité — et une probabilité de 0,9 reste inférieure à 1, donc non certaine.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as posé cinq
            événements de trois expériences différentes sur une seule règle graduée.</div>
          </div>
        ),
      },
      {
        id: 'evenement-contraire',
        type: 'formules',
        title: 'Événement contraire',
        summary: 'L’événement « non A » se réalise exactement quand A ne se réalise pas : P(non A) = 1 − P(A).',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$P(\\text{non } A) = 1 - P(A)$'}</MathText>
            </div>
            <p>Les issues favorables à A et celles favorables à « non A » se partagent toutes les
            issues possibles : leurs probabilités se partagent donc le nombre 1.</p>
            <p>Exemple : P(obtenir 6) = 1/6, donc{' '}
            <MathText>{'$P(\\text{ne pas obtenir } 6) = 1 - \\dfrac{1}{6} = \\dfrac{5}{6}$'}</MathText>.</p>
            <p className="text-xs text-slate-500">C’est souvent le chemin le plus court : compter
            les 5 faces qui ne sont pas le 6 revient au même, mais soustraire va plus vite.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le complément à 1 que tu
            avais déjà utilisé pour retrouver la part des billes rouges.</div>
          </div>
        ),
      },
      {
        id: 'interpreter-une-probabilite',
        type: 'methodes',
        title: 'Interpréter une probabilité',
        summary: 'P = 0,7 se lit « environ 7 fois sur 10, si l’on répète » — jamais « ça va arriver ».',
        body: (
          <div className="space-y-2">
            <p>Une probabilité annoncée dans la vie courante (« probabilité de pluie 0,7 »,
            « 2 % de gagner ») se traduit toujours en <strong>proportion sur beaucoup de
            répétitions</strong> : 0,7 = 7/10, donc environ 7 journées semblables sur 10.</p>
            <p>Deux lectures fausses reviennent sans cesse : la confondre avec une durée
            (« il pleuvra 70 % de la journée ») ou avec une certitude (« 0,9, donc c’est
            sûr »).</p>
            <p className="text-xs text-slate-500">Et pour prévoir un nombre, on retrouve P × n :
            0,02 par ticket sur 1 000 tickets, c’est environ 20 gagnants.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la météo, puis la
            loterie — deux phrases ordinaires traduites en nombres.</div>
          </div>
        ),
      },
    ],

    /* ───────────────────────────────────────────────────────────────────────
       M6 — LE LABO DES SITUATIONS. Deux idées neuves seulement : estimer une
       probabilité inconnue par une fréquence, et voir le modèle changer quand
       la situation change (tirage sans remise).
       ─────────────────────────────────────────────────────────────────────── */
    6: [
      {
        id: 'estimer-par-la-frequence',
        type: 'methodes',
        title: 'Estimer une probabilité par une fréquence',
        summary: 'Quand le modèle est inconnu, on prend la fréquence observée sur un grand nombre d’essais comme estimation de P.',
        body: (
          <div className="space-y-2">
            <p>Pour un dé équilibré, on connaît le modèle et P se calcule. Pour une pièce sortie
            d’une usine, personne ne le connaît : on contrôle alors un grand nombre de pièces et
            l’on prend la fréquence obtenue comme <strong>estimation</strong> de la
            probabilité.</p>
            <p>15 pièces défectueuses sur 500 contrôlées donnent une fréquence de 3 % : on écrit
            P ≈ 0,03, puis on s’en sert pour prévoir — environ 90 pièces sur 3 000.</p>
            <p className="text-xs text-slate-500">Une estimation vaut ce que vaut sa série : 6
            piles sur 10 lancers ne prouvent rien du tout ; il faut beaucoup d’essais pour que la
            fréquence se stabilise.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le contrôle qualité —
            une fréquence mesurée, puis une prévision.</div>
          </div>
        ),
      },
      {
        id: 'le-modele-suit-la-situation',
        type: 'regles',
        title: 'Le modèle suit la situation',
        summary: 'Si la situation change — une bille retirée, une roue modifiée — le décompte des issues change, donc la probabilité aussi.',
        body: (
          <div className="space-y-2">
            <p>Dans une classe de 25 élèves dont 10 filles, P(fille) = 10/25 = 2/5. Si une fille
            est tirée et ne rejoue pas, il reste 9 filles sur 24 élèves : la probabilité devient
            9/24 = 3/8.</p>
            <p>Le dé, lui, repart identique à chaque lancer. Un tirage <strong>sans
            remise</strong> non : chaque tirage modifie le décompte du suivant.</p>
            <p className="text-xs text-slate-500">Avant de calculer, se demander toujours :
            quelles sont les issues <em>maintenant</em>, et ont-elles la même chance ?</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la roue de 12 secteurs
            que tu as réglée jusqu’à 4 rouges — la part suit toujours le décompte.</div>
          </div>
        ),
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
