import React from 'react';

/**
 * Connaissances de la leçon « Durées » (6e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à
 * l'instant où le geste vient de lui donner un sens, puis il reste sur la
 * carte. Rien n'est réécrit dans les modules.
 *
 * ⚠️ PAS D'ESCALIER D'UNITÉS ICI. `UnitLadder` (km → hm → dam → m …) dit
 * « chaque marche vaut ×10 » : c'est vrai des longueurs, des masses et des
 * contenances, et FAUX des durées. Le temps est la seule grandeur de la
 * famille en base SOIXANTE, et les marches n'y sont même pas régulières
 * (×60, ×60, ×24). Représenter les durées avec cet escalier installerait
 * précisément l'erreur que la leçon combat.
 *
 * ORDRE — un item n'emploie QUE ce qui est déjà posé à son module ou avant :
 *
 *   M1  les quatre unités du temps, et l'ordre de grandeur qui les choisit
 *   M2  lire un INSTANT sur le cadran (deux aiguilles) et la notation 24 h
 *   M3  LE concept de la leçon : la base 60 — 1 h = 60 min, 1 min = 60 s,
 *       1 j = 24 h — et le piège décimal qui en découle
 *   M4  convertir pour comparer : même unité partout
 *   M5  la méthode des sauts, dans les deux sens
 *   M6  la mise au travail : rien de neuf
 *
 * Le module 0 (diagnostic) et le module 7 (évaluation) ne contribuent RIEN.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => (
  <p className="text-xs text-rose-600">⚠️ {children}</p>
);

/**
 * L'escalier du temps — VOLONTAIREMENT différent de `UnitLadder` : les
 * marches y portent leur propre facteur (×24, ×60, ×60), parce qu'elles ne
 * sont pas égales. C'est la figure qui dit d'un coup d'œil pourquoi les
 * durées ne se convertissent pas comme des mètres.
 */
function EscalierDuTemps({ width = 258, height = 62 }) {
  const cells = ['j', 'h', 'min', 's'];
  const factors = ['×24', '×60', '×60'];
  const cellW = width / cells.length;
  const y = 14;
  const h = 24;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="select-none">
      {cells.map((c, i) => (
        <g key={c}>
          <rect x={i * cellW + 2} y={y} width={cellW - 4} height={h} fill="#eef2ff" stroke="#6366f1" strokeWidth="1.4" />
          <text x={i * cellW + cellW / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="800" fill="#4338ca" fontFamily="ui-monospace, monospace">
            {c}
          </text>
        </g>
      ))}
      {factors.map((f, i) => (
        <text key={f + i} x={(i + 1) * cellW} y={height - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="#e11d48" fontFamily="ui-monospace, monospace">
          {f}
        </text>
      ))}
      <text x={width / 2} y={9} textAnchor="middle" fontSize="8" fill="#94a3b8" fontFamily="ui-monospace, monospace">
        des marches INÉGALES — jamais ×10
      </text>
    </svg>
  );
}

/** Cadran minimal : deux aiguilles, pour les items de la carte. */
function MiniCadran({ h = 9, min = 15, size = 84 }) {
  const r = size / 2 - 3;
  const cx = size / 2;
  const cy = size / 2;
  const hAngle = ((h % 12) + min / 60) * 30 - 90;
  const mAngle = min * 6 - 90;
  const pt = (ang, len) => [cx + len * Math.cos((ang * Math.PI) / 180), cy + len * Math.sin((ang * Math.PI) / 180)];
  const [hx, hy] = pt(hAngle, r * 0.5);
  const [mx, my] = pt(mAngle, r * 0.8);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="select-none">
      <circle cx={cx} cy={cy} r={r} fill="#fff" stroke="#334155" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = pt(i * 30 - 90, r * 0.84);
        const [x2, y2] = pt(i * 30 - 90, r * 0.95);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.2" />;
      })}
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke="#334155" strokeWidth="3.2" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={mx} y2={my} stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="2.4" fill="#334155" />
    </svg>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Quatre unités, et le geste qui les choisit. ── */
    1: [
      {
        id: 'unites-temps',
        type: 'vocabulaire',
        title: 'Les quatre unités du temps',
        summary: 'La seconde (s), la minute (min), l’heure (h) et le jour (j) — de la plus courte à la plus longue.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
              <div><strong>s</strong> — un sprint, un clignement d’yeux</div>
              <div><strong>min</strong> — un cours, un brossage de dents</div>
              <div><strong>h</strong> — une nuit de sommeil, un film</div>
              <div><strong>j</strong> — des vacances, un voyage</div>
            </div>
            <p>
              Une durée s’écrit toujours avec son unité : « 3 » ne veut rien dire, « 3 min » oui.
            </p>
            <Souvenir>le sprint, le cours, la nuit et les vacances que tu as rangés.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ordre-de-grandeur',
        type: 'methodes',
        title: 'Se donner un ordre de grandeur',
        summary: 'Avant de répondre, se demander « à peu près combien ? » : cela élimine tout de suite les durées absurdes.',
        body: (
          <div className="space-y-2">
            <p>
              Un clignement d’yeux dure environ 1 seconde, pas 1 heure. Se brosser les dents prend
              quelques minutes, pas quelques jours. Ce jugement rapide s’appelle un{' '}
              <strong>ordre de grandeur</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Il ne remplace jamais le calcul : il sert de garde-fou. Un résultat très loin de
              l’ordre de grandeur attendu signale une erreur.
            </p>
            <Souvenir>les trois estimations où une seule proposition était réaliste.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Lire un instant. ── */
    2: [
      {
        id: 'lire-cadran',
        type: 'methodes',
        title: 'Lire l’heure sur un cadran',
        summary: 'La petite aiguille donne les heures, la grande les minutes — et chaque chiffre du cadran vaut 5 minutes pour elle.',
        visual: <MiniCadran h={9} min={15} />,
        body: (
          <div className="space-y-2">
            <p>
              La <strong>grande</strong> aiguille pointe le 3 : cela ne fait pas 3 minutes mais{' '}
              <strong>15</strong>, car chaque chiffre du cadran compte 5 minutes pour elle (3 × 5).
              Entre deux graduations chiffrées, des traits plus fins comptent les minutes une à une :
              c’est là que se lisent les 9 h 47 d’un horaire de train.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-sm text-slate-600">
              La <strong>petite</strong> aiguille se lit sur le chiffre qu’elle a DÉPASSÉ : entre le
              9 et le 10, il est encore 9 h — 9 h 15.
            </div>
            <Piege>
              Un horaire est un <strong>instant</strong> (« le train part à 9 h 47 »), pas une durée
              (« le trajet dure 2 h 28 »). Ce sont deux choses différentes.
            </Piege>
            <Souvenir>les deux cadrans lus, dont un où l’aiguille tombait entre deux traits.</Souvenir>
          </div>
        ),
      },
      {
        id: 'notation-24h',
        type: 'vocabulaire',
        title: 'La notation 24 h',
        summary: 'Après midi, on ajoute 12 : 4 h 30 de l’après-midi s’écrit 16 h 30 sur les tableaux de départ.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1 text-slate-600">
              <div>2 h de l’après-midi → <strong>14 h</strong> (2 + 12)</div>
              <div>17 h 05 → <strong>5 h 05 de l’après-midi</strong> (17 − 12)</div>
            </div>
            <p>
              Le cadran ne fait qu’un demi-tour de journée : il affiche deux fois chaque chiffre. La
              notation 24 h lève l’ambiguïté — indispensable pour un horaire de train.
            </p>
            <Souvenir>l’horloge de la gare que tu as réglée sur 16 h 30.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — LE concept de la leçon. Une RÈGLE, pas du vocabulaire. ── */
    3: [
      {
        id: 'base-60',
        type: 'regles',
        title: '⏱️ Le secret du 60 : le temps ne compte pas par 10',
        summary: '1 jour = 24 h · 1 h = 60 min · 1 min = 60 s. Vers l’unité plus petite on multiplie, vers la plus grande on divise.',
        visual: <EscalierDuTemps />,
        body: (
          <div className="space-y-2">
            <p>
              Un tour complet de la grande aiguille vaut <strong>60 minutes</strong>, et pendant ce
              tour la petite avance d’exactement <strong>une heure</strong>. La relation n’est pas
              une convention à apprendre : elle est inscrite dans le mécanisme.
            </p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1 text-slate-600">
              <div>2 h = 2 × 60 = <strong>120 min</strong></div>
              <div>180 s = 180 ÷ 60 = <strong>3 min</strong></div>
            </div>
            <Piege>
              Les longueurs, les masses et les contenances comptent par 10 : 1 m = 100 cm, 1 kg =
              1 000 g. Le temps, lui, compte par 60 — et les marches ne sont même pas toutes
              pareilles (×24 entre le jour et l’heure).
            </Piege>
            <Souvenir>le tour complet de la grande aiguille, de 9 h à 10 h, minute par minute.</Souvenir>
          </div>
        ),
      },
      {
        id: 'piege-decimal',
        type: 'regles',
        title: 'La virgule ne sépare pas les heures des minutes',
        summary: '1 h 30 min = 1,5 h (la moitié de 60), jamais « 1,30 h ». En 6e, on garde l’écriture h et min.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div className="text-emerald-700">✅ 1 h 30 min = 1,5 h — 30 est la MOITIÉ de 60</div>
              <div className="text-rose-700">❌ 1 h 30 min = « 1,30 h » — on a recopié les chiffres</div>
              <div className="text-rose-700">❌ 1,5 min = « 1 min 50 s » — la moitié de 60 s vaut 30 s</div>
            </div>
            <p>
              C’est la conséquence directe du 60 : ce qui suit la virgule est une fraction de l’unité,
              et une demi-heure vaut 30 minutes, pas 50.
            </p>
            <p className="text-xs text-slate-500">
              L’écriture la plus sûre en 6e reste « 1 h 30 min » : elle ne se prête à aucune confusion.
            </p>
            <Souvenir>les 1,5 minute de course de Léa, qui faisaient 1 min 30 s.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Convertir pour comparer. ── */
    4: [
      {
        id: 'convertir-durees',
        type: 'methodes',
        title: 'Convertir une durée composée',
        summary: 'h + min → min : on convertit les heures (× 60) puis on ajoute les minutes. Dans l’autre sens, on fait des paquets de 60.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
              <div>2 h 15 min → 2 × 60 = 120, puis 120 + 15 = <strong>135 min</strong></div>
              <div>200 s → 3 paquets entiers de 60 s, reste 20 : <strong>3 min 20 s</strong></div>
            </div>
            <Piege>
              « 2 h 15 min = 215 min » recopie les chiffres côte à côte sans rien convertir. Le 15
              n’est pas le chiffre des unités de 2 : c’est une quantité de minutes à part.
            </Piege>
            <Souvenir>les 200 secondes que tu as rangées en paquets de 60.</Souvenir>
          </div>
        ),
      },
      {
        id: 'comparer-durees',
        type: 'regles',
        title: 'Comparer des durées : la même unité partout',
        summary: 'Deux durées écrites différemment ne se comparent qu’une fois ramenées à la même unité — souvent la plus petite.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-center text-sm text-slate-600">
              1 h 05 min = 65 min : deux <strong>écritures</strong> de la même durée
            </div>
            <p>
              « 90 min » paraît plus grand que « 1 h 20 min » à cause du nombre affiché — jusqu’à ce
              qu’on convertisse : 1 h 20 min = 80 min, donc 90 min l’emporte bien. Le nombre seul ne
              tranche jamais.
            </p>
            <Piege>
              Dans un trajet, l’attente compte : 110 min de route + 10 min d’attente font 120 min, et
              non 110.
            </Piege>
            <Souvenir>les quatre chronos rangés du plus court au plus long.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — La méthode des sauts, jamais la soustraction posée. ── */
    5: [
      {
        id: 'methode-sauts',
        type: 'methodes',
        title: 'La durée entre deux instants : la méthode des sauts',
        summary: 'On avance jusqu’à l’heure ronde, puis par heures entières, puis on ajoute le reste — et on additionne les sauts.',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600 space-y-1">
              <div>De <strong>9 h 47</strong> à <strong>12 h 15</strong> :</div>
              <div>① + 13 min → 10 h 00 &nbsp;(l’heure ronde d’abord)</div>
              <div>② + 2 h → 12 h 00 &nbsp;(les heures entières)</div>
              <div>③ + 15 min → 12 h 15 &nbsp;(le reste)</div>
              <div className="pt-1">Total : 2 h + (13 + 15) min = <strong>2 h 28 min</strong></div>
            </div>
            <Piege>
              Poser « 12 h 15 − 9 h 47 » en colonnes donne des retenues fausses, parce que la retenue
              s’y fait à 60 et non à 10. Les sauts, eux, ne trahissent jamais.
            </Piege>
            <p className="text-xs text-slate-500">
              La méthode marche aussi en marche arrière : pour retrouver une heure de départ, on
              recule par les mêmes sauts.
            </p>
            <Souvenir>les trois sauts que tu as posés toi-même sur la ligne du temps.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-retenue-60',
        type: 'memoriser',
        title: '⭐ La retenue se fait à 60, jamais à 100',
        summary: 'Si un total dépasse 60 minutes, on échange 60 min contre 1 h : 7 h 78 min = 8 h 18 min.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">78 min = 60 min + 18 min = 1 h 18 min</div>
              <div className="text-sm font-black text-rose-700">donc 7 h 78 min = 8 h 18 min</div>
            </div>
            <p className="text-xs text-slate-500">
              Une réponse en minutes qui dépasse 59 n’est jamais une réponse finie : il reste une
              heure à sortir du tas.
            </p>
          </div>
        ),
      },
    ],
  },
};
