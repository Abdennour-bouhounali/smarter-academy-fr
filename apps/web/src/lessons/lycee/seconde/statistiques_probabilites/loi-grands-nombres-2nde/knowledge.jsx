import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Loi des grands nombres » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/**
 * L'entonnoir : la figure de la leçon. L'enveloppe des fréquences possibles
 * se resserre autour de p quand n grandit — sans jamais se refermer tout à
 * fait, ce que le tracé montre en gardant une épaisseur à droite.
 */
const MiniFunnel = () => {
  const W = 214; const H = 92; const x0 = 26; const y0 = 12; const w = W - x0 - 10; const h = 58;
  const yP = y0 + h / 2;
  // demi-largeur ∝ 1/√n : la forme, pas une valeur numérique à lire
  const env = (t) => (h / 2) * 0.92 * (1 - Math.sqrt(t) * 0.88);
  const pts = Array.from({ length: 41 }, (_, i) => i / 40);
  const up = pts.map((t) => `${(x0 + t * w).toFixed(1)},${(yP - env(t)).toFixed(1)}`).join(' ');
  const dn = [...pts].reverse().map((t) => `${(x0 + t * w).toFixed(1)},${(yP + env(t)).toFixed(1)}`).join(' ');
  // une trajectoire qui serpente à l'intérieur de l'entonnoir
  const wig = [0, 0.62, -0.5, 0.44, -0.3, 0.26, -0.18, 0.12, -0.07, 0.05, 0];
  const traj = pts.map((t) => {
    const k = t * (wig.length - 1);
    const i = Math.min(wig.length - 2, Math.floor(k));
    const f = k - i;
    const v = wig[i] * (1 - f) + wig[i + 1] * f;
    return `${(x0 + t * w).toFixed(1)},${(yP + v * env(t)).toFixed(1)}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: W }}>
      <polygon points={`${up} ${dn}`} fill="#c7d2fe" fillOpacity="0.5" />
      <line x1={x0} y1={yP} x2={x0 + w} y2={yP} stroke="#dc2626" strokeWidth="1.6" strokeDasharray="4 3" />
      <polyline points={traj} fill="none" stroke="#4338ca" strokeWidth="1.6" />
      <text x={4} y={yP + 3} fontSize="9" fontWeight="700" fill="#dc2626">p</text>
      <text x={x0} y={H - 6} fontSize="9" fill="#64748b">n petit</text>
      <text x={x0 + w} y={H - 6} fontSize="9" fill="#64748b" textAnchor="end">n grand</text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'experience-simulation',
        type: 'vocabulaire',
        title: 'Expérience aléatoire, répétition, simulation',
        summary: 'Une expérience aléatoire a plusieurs issues possibles ; la simuler, c’est la répéter à l’identique un grand nombre de fois.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Une <strong>expérience aléatoire</strong> (lancer un dé, tirer une boule) a plusieurs
              <strong> issues</strong> possibles dont on ne peut pas prévoir laquelle sortira.
            </p>
            <p>
              La <strong>simuler</strong>, c’est demander à une machine de la répéter des milliers de fois —
              chaque répétition étant <strong>indépendante</strong> des précédentes.
            </p>
          </div>
        ),
      },
      {
        id: 'frequence-observee',
        type: 'formules',
        title: 'La fréquence observée',
        summary: 'f = nombre de succès ÷ nombre de répétitions : un résultat d’expérience, qui change d’une série à l’autre.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-indigo-100 p-3 text-center">
              <MathText>{'$$f = \\frac{\\text{nombre de succès}}{\\text{nombre de répétitions}}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Sur 500 lancers d’une pièce, 265 Pile donnent f = 265/500 = <strong>53 %</strong>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              À ne pas confondre avec la <strong>probabilité</strong> : celle-ci est fixée par le modèle et ne
              dépend d’aucune série.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : 10 lancers, puis 10 000 — le chiffre qui se calme.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'fluctuation',
        type: 'concepts',
        title: 'La fluctuation d’échantillonnage',
        summary: 'Deux séries de même taille donnent des fréquences différentes ; l’écart diminue quand la taille augmente.',
        visual: <MiniFunnel />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Vingt séries de 10 lancers s’étalent sur une large plage ; vingt séries de 1 000 lancers se
              resserrent autour de p. Le <strong>centre</strong> ne bouge pas — c’est la <strong>dispersion</strong>
              {' '}qui diminue.
            </p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              Une série courte ne prouve rien : 13 Pile sur 20 lancers est parfaitement ordinaire.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le nuage large, puis le nuage étroit.</div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'loi-grands-nombres',
        type: 'regles',
        title: 'La loi des grands nombres',
        summary: 'Quand n devient grand, la fréquence observée se rapproche de la probabilité du modèle.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-center">
              <MathText>{'$$f_n \\xrightarrow[\\ n \\text{ grand}\\ ]{} p$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              En répétant un grand nombre de fois, de façon indépendante, une expérience aléatoire, la fréquence
              observée d’un événement se rapproche de sa probabilité <em>p</em>.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              Elle ne garantit ni une valeur exacte, ni un rattrapage des écarts passés.
            </div>
          </div>
        ),
      },
      {
        id: 'deux-ecarts',
        type: 'regles',
        title: 'L’écart en fréquence ≠ l’écart en nombre',
        summary: 'La fréquence se rapproche de p, mais l’écart en nombre de succès a tendance à grandir.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Sur 10 lancers, on s’écarte typiquement d’une unité de la moitié ; sur 10 000, d’une centaine.
              Pourtant 100/10 000 = 1 % est bien plus petit que 1/10 = 10 %.
            </p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
              La loi ne dit rien du nombre de Pile moins le nombre de Face : elle ne parle que du{' '}
              <strong>quotient</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-independance',
        type: 'memoriser',
        title: '⭐ Le hasard n’a pas de mémoire',
        summary: 'Après cinq Piles, P(Face) vaut toujours 1/2 : les répétitions sont indépendantes.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">La « loi des séries » n’existe pas</div>
            <p className="text-xs text-rose-700">
              La stabilisation vient de la <strong>dilution</strong> des premiers résultats, jamais d’une
              compensation.
            </p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'modele-realite',
        type: 'concepts',
        title: 'Modèle probabiliste et situation réelle',
        summary: 'L’équiprobabilité est une hypothèse posée sur un objet réel — les données peuvent la contredire.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Dire « ce dé est équilibré » n’est pas un théorème : c’est une <strong>hypothèse</strong>, faite en
              général par symétrie. Un dé pipé la met en défaut.
            </p>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              Les mathématiques calculent les conséquences du modèle ; c’est l’expérience qui juge si le modèle
              décrit bien l’objet.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-tester-modele',
        type: 'methodes',
        title: 'Mettre un modèle à l’épreuve',
        summary: 'Comparer la fréquence observée sur une LONGUE série à la probabilité annoncée par le modèle.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire la probabilité prévue par le modèle (ex. 1/6 ≈ 16,7 %).</li>
              <li>Répéter l’expérience un grand nombre de fois — des milliers, pas des dizaines.</li>
              <li>Calculer la fréquence observée.</li>
              <li>Un écart qui persiste sur une longue série met le modèle en cause ; sur une série courte, il ne prouve rien.</li>
            </ol>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le dé B, invisible sur 30 lancers, évident sur 3 000.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'lire-simulation',
        type: 'methodes',
        title: 'Lire un programme de simulation',
        summary: 'Y repérer trois objets : la boucle (répétitions), le test (succès) et la division finale (fréquence).',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">for i in range(n)</code> répète,
              {' '}<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">if de == 6</code> compte les succès,
              {' '}<code className="text-xs bg-slate-100 px-1 py-0.5 rounded">succes / n</code> donne la fréquence.
            </p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
              <code>succes</code> est un effectif (1 702), <code>succes / n</code> une fréquence (0,17).
            </div>
          </div>
        ),
      },
    ],
  },
};
