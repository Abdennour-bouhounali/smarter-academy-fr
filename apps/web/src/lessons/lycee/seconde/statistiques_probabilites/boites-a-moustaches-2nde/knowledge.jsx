import React from 'react';
import MathText from '../../../../common/components/MathText';

/** Connaissances de « Boîtes à moustaches » — SOURCE UNIQUE (KNOWLEDGE_MAP.md). */

/** Une boîte à moustaches schématique, figure récurrente de la leçon. */
const MiniBox = ({ five = [14, 17, 19, 21, 24], width = 230, lo = 12, hi = 26, color = '#0284c7', zones = false }) => {
  const x = (v) => 10 + ((v - lo) / (hi - lo)) * (width - 20);
  const [mn, q1, med, q3, mx] = five;
  const y = 34; const h = 26;
  return (
    <svg viewBox={`0 0 ${width} 72`} aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: width }}>
      {zones && [[mn, q1], [q1, med], [med, q3], [q3, mx]].map(([a, b], i) => (
        <g key={i}>
          <rect x={x(a)} y={y - h / 2 - 8} width={Math.max(1, x(b) - x(a))} height={h + 16}
            fill={i % 2 ? '#e0f2fe' : '#f1f5f9'} />
          <text x={(x(a) + x(b)) / 2} y={y + h / 2 + 18} textAnchor="middle" fontSize="8" fill="#64748b">25 %</text>
        </g>
      ))}
      <line x1={x(mn)} y1={y} x2={x(q1)} y2={y} stroke={color} strokeWidth="1.4" strokeDasharray="3 2" />
      <line x1={x(q3)} y1={y} x2={x(mx)} y2={y} stroke={color} strokeWidth="1.4" strokeDasharray="3 2" />
      <line x1={x(mn)} y1={y - 8} x2={x(mn)} y2={y + 8} stroke={color} strokeWidth="2" />
      <line x1={x(mx)} y1={y - 8} x2={x(mx)} y2={y + 8} stroke={color} strokeWidth="2" />
      <rect x={x(q1)} y={y - h / 2} width={Math.max(2, x(q3) - x(q1))} height={h}
        fill={color} fillOpacity="0.16" stroke={color} strokeWidth="1.8" rx="2" />
      <line x1={x(med)} y1={y - h / 2} x2={x(med)} y2={y + h / 2} stroke="#059669" strokeWidth="2.6" />
      <line x1={10} y1={62} x2={width - 10} y2={62} stroke="#475569" strokeWidth="1.2" />
      <text x={x(mn)} y={16} textAnchor="middle" fontSize="8" fill="#64748b">min</text>
      <text x={x(med)} y={16} textAnchor="middle" fontSize="8" fontWeight="700" fill="#059669">méd</text>
      <text x={x(mx)} y={16} textAnchor="middle" fontSize="8" fill="#64748b">max</text>
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        // TROU VERTICAL : `quartile` est déclaré en priorKnowledge et
        // diagnostiqué au module 0, mais AUCUNE leçon de collège ne l'enseigne
        // (le programme de 3e l'inclut, statistiques-3e s'en exclut). Sans
        // cette brique, l'élève sort en sachant OÙ est Q1 sur une figure sans
        // savoir CE QU'IL EST. Elle est en « rappel » : la 2de ne fait que
        // réactiver ce que le collège aurait dû poser — la réparation côté 3e
        // reste à faire (Tier C de l'audit).
        id: 'quartile-rang',
        type: 'regles',
        title: 'Ce que Q1 et Q3 veulent dire',
        summary: 'Q1 est la plus petite valeur telle qu’au moins 25 % de la série lui soit inférieure ou égale ; Q3, celle qui atteint 75 %. Ce sont des seuils de RANG, pas des moyennes.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              On range les valeurs par ordre croissant, puis on compte : le quartile est la valeur
              qui occupe le rang <strong>⌈n/4⌉</strong> pour Q1, <strong>⌈3n/4⌉</strong> pour Q3.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              Brest, <strong>30</strong> relevés : 30 ÷ 4 = 7,5, donc Q1 est la <strong>8ᵉ</strong> valeur
              — la première qui atteint le quart. Q3 est la <strong>23ᵉ</strong> (3 × 30 ÷ 4 = 22,5).
            </div>
            <p className="text-xs text-slate-500">
              C’est pourquoi un quartile est toujours une valeur de la série, et pourquoi il ne bouge
              pas quand une valeur extrême change : il compte des effectifs, pas des grandeurs.
            </p>
          </div>
        ),
      },
      {
        id: 'resume-cinq-nombres',
        type: 'concepts',
        title: 'Le résumé des cinq nombres',
        summary: 'Minimum, Q1, médiane, Q3, maximum : cinq nombres suffisent à dessiner la silhouette d’une série.',
        visual: <MiniBox />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Brest, 30 relevés : minimum <strong>14</strong>, Q1 <strong>17</strong>, médiane <strong>19</strong>,
              Q3 <strong>21</strong>, maximum <strong>24</strong> °C. La figure correspondante est une
              <strong> boîte à moustaches</strong>.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Ni la moyenne ni l’écart type n’en font partie : le résumé des cinq nombres repose uniquement sur des rangs.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les cinq repères révélés un par un, jusqu’à ce que le rectangle apparaisse.</div>
          </div>
        ),
      },
      {
        id: 'construire-boite',
        type: 'methodes',
        title: 'Construire une boîte à moustaches',
        summary: 'Rectangle de Q1 à Q3, trait vertical à la médiane, moustaches jusqu’au minimum et au maximum.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Ranger la série, calculer les cinq nombres.</li>
              <li>Tracer un axe gradué (il portera toutes les boîtes à comparer).</li>
              <li>Dessiner le rectangle de Q1 à Q3, y placer le trait de la médiane.</li>
              <li>Tracer les moustaches jusqu’aux valeurs extrêmes.</li>
            </ol>
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
              En 2nde, les moustaches vont jusqu’au minimum et au maximum — pas de convention de valeurs aberrantes.
            </div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'zones-quart',
        type: 'regles',
        title: 'Chaque zone contient un quart de l’effectif',
        summary: 'Les quatre zones découpées par min, Q1, médiane, Q3, max contiennent chacune environ 25 % des individus — quelle que soit leur longueur.',
        visual: <MiniBox five={[6, 13, 17.5, 25, 35]} lo={4} hi={37} color="#059669" zones />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une zone <strong>large</strong> ne contient pas plus de monde : elle contient des valeurs plus
              <strong> étalées</strong>. C’est le piège de lecture le plus fréquent.
            </p>
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              « La moustache droite est longue, donc il y a beaucoup de grandes valeurs » est <strong>faux</strong> :
              il y en a un quart, comme partout ailleurs.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les pastilles d’Embrun au-dessus de 25 °C — peu nombreuses, très écartées.</div>
          </div>
        ),
      },
      {
        id: 'lire-dispersion',
        type: 'formules',
        title: 'Étendue et écart interquartile sur la boîte',
        summary: 'Étendue = max − min (d’une pointe de moustache à l’autre). Écart interquartile = Q3 − Q1 (largeur du rectangle).',
        body: (
          <div className="space-y-2">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center">
              <MathText>{'$$\\text{étendue} = \\max - \\min \\qquad \\text{écart interquartile} = Q_3 - Q_1$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">Embrun : étendue 35 − 6 = <strong>29 °C</strong>, écart interquartile 25 − 13 = <strong>12 °C</strong>.</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Ne pas confondre : la première se lit sur toute la figure, la seconde sur le rectangle seul.</div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'axe-commun',
        type: 'regles',
        title: 'Comparer exige un axe commun',
        summary: 'Des boîtes tracées à des échelles différentes ne se comparent pas : chacune occuperait toute la largeur.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Sur un axe commun, Brest est un rectangle étroit et Embrun s’étale d’un bout à l’autre. À échelles séparées, les deux se ressemblent — et la figure ment.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le bouton qui bascule entre « axe commun » et « chacune à son échelle ».</div>
          </div>
        ),
      },
      {
        id: 'mediane-ne-dit-pas-tout',
        type: 'regles',
        title: 'Une médiane ne dit rien des extrêmes',
        summary: 'Une série peut avoir la médiane la plus basse ET le maximum le plus haut.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Embrun : médiane 17,5 °C (la plus basse des trois villes) et maximum 35 °C (le plus haut). La médiane résume la position centrale, pas l’ensemble des valeurs.</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">
              « Médiane plus basse » n’implique jamais « toutes les valeurs plus basses ».
            </div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'choisir-indicateur',
        type: 'methodes',
        title: 'Choisir l’indicateur adapté à la question',
        summary: 'Position (médiane, quartiles) pour « où ? » ; dispersion (étendue, écart interquartile) pour « à quel point est-ce régulier ? ».',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="grid gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><strong>« Où en général ? »</strong> → la médiane</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><strong>« Est-ce régulier ? »</strong> → l’écart interquartile</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><strong>« Le cas le plus extrême ? »</strong> → le maximum (ou le minimum)</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"><strong>« Quel écart total ? »</strong> → l’étendue</div>
            </div>
            <p>Une comparaison sérieuse croise toujours <strong>un indicateur de chaque famille</strong>.</p>
          </div>
        ),
      },
      {
        id: 'mem-boite',
        type: 'memoriser',
        title: '⭐ Rectangle = moitié centrale, chaque zone = un quart',
        summary: 'De Q1 à Q3 vit la moitié centrale de l’effectif ; chacune des quatre zones en contient environ 25 %.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">min · Q1 · méd · Q3 · max</div>
            <p className="text-xs text-rose-700">Large = étalé, jamais « plus nombreux »</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'interpreter-contexte',
        type: 'methodes',
        title: 'Interpréter une boîte dans son contexte',
        summary: 'Vérifier si les médianes se distinguent vraiment, puis regarder la dispersion et les moustaches — souvent le vrai sujet.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Deux serveurs de médianes 200 et 210 ms : l’écart est négligeable. Mais l’un monte à 900 ms et l’autre plafonne à 320 ms — c’est cela qui décide.</p>
            <p>Deux classes de même médiane 12 : l’une s’étale de 4 à 20, l’autre de 8 à 16. Même centre, réalités différentes.</p>
          </div>
        ),
      },
    ],
  },
};
