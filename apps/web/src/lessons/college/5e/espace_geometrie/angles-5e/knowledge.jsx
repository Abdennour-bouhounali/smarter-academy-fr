import React from 'react';
import GeoScene, { Seg, dotObstacles, segObstacles } from '../../../../common/geo5e/GeoScene';
import AngleArc, { ParallelMark } from '../../../../common/geo5e/AngleArc';
import { clipLine } from '../../../../common/geo5e/geo5e';
import { droite, configuration, pointsDe, angleParId } from './components/angles';

/**
 * Connaissances de la leçon « Angles et parallélisme » (5e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules, et
 * c'est exactement la chaîne demandée : angles → relations d'angles →
 * parallélisme.
 *
 *     la configuration : deux droites, une sécante  (M2)
 *              ↓                       ↓
 *     correspondants (M2)      alternes-internes (M2)
 *              ↘                       ↙
 *        parallèles ⟹ angles égaux  (M3)
 *                       ↓
 *        calculer les huit angles  (M4)
 *                       ↓
 *        angles égaux ⟹ parallèles — la réciproque  (M5)
 *                       ↓
 *        enchaîner deux relations  (M6)
 *
 * Rien n'est arbitraire : on ne peut pas énoncer « les alternes-internes sont
 * égaux » (M3) avant de savoir LESQUELS le sont (M2), ni s'en servir pour
 * prouver un parallélisme (M5) avant d'avoir établi le sens direct (M3).
 */

/* ── Les visuels de la carte : fixes, non interactifs, grands ────────────── */

const VW = 440;
const VH = 280;

const D1 = droite({ x: 220, y: 100 }, 8);
const D2 = droite({ x: 220, y: 210 }, 8);
const SEC = droite({ x: 220, y: 155 }, 62);
const CFG = configuration(D1, D2, SEC);

const NON_D2 = droite({ x: 220, y: 210 }, 30);
const CFG_NON = configuration(D1, NON_D2, SEC);

/**
 * La figure de référence de la leçon, avec une paire d'angles mise en avant.
 * Le même composant sert partout : la carte ne peut pas montrer une figure
 * différente de celle du laboratoire.
 */
function Figure({ config = CFG, paire, couleur = '#7c3aed', marques = true, toutes = false }) {
  const t = (d) => {
    const [a, b] = pointsDe(d, 700);
    return clipLine(a, b, VW, VH, 8);
  };
  const [a1, b1] = t(config.d1);
  const [a2, b2] = t(config.d2);
  const [as, bs] = t(config.s);
  const montres = toutes
    ? config.angles
    : config.angles.filter((x) => paire?.includes(x.id));

  return (
    <GeoScene
      width={VW} height={VH}
      labels={[
        { id: 'A', text: 'A', anchor: config.A, color: '#0f172a', priority: true, size: 17 },
        { id: 'B', text: 'B', anchor: config.B, color: '#0f172a', priority: true, size: 17 },
      ]}
      obstacles={[
        ...dotObstacles([config.A, config.B], 16),
        ...segObstacles(a1, b1), ...segObstacles(a2, b2), ...segObstacles(as, bs),
      ]}
      ariaLabel="Deux droites coupées par une sécante"
    >
      <rect x={0} y={0} width={VW} height={VH} fill="#ffffff" data-visual-role="decor" />
      <Seg a={as} b={bs} color="#f59e0b" w={3} />
      <Seg a={a1} b={b1} color="#334155" w={3.5} />
      <Seg a={a2} b={b2} color="#334155" w={3.5} />
      {marques && (
        <>
          <ParallelMark a={a1} b={b1} n={2} color="#0284c7" t={0.2} />
          <ParallelMark a={a2} b={b2} n={2} color="#0284c7" t={0.2} />
        </>
      )}
      {montres.map((x) => (
        <AngleArc
          key={x.id} a={x.a} b={x.P} c={x.c}
          r={toutes ? 30 : 40} color={couleur} width={3.5}
          labelOffset={toutes ? 18 : 24}
        />
      ))}
      <circle cx={config.A.x} cy={config.A.y} r={6} fill="#0f172a" stroke="#fff" strokeWidth={2} />
      <circle cx={config.B.x} cy={config.B.y} r={6} fill="#0f172a" stroke="#fff" strokeWidth={2} />
    </GeoScene>
  );
}

/* Les paires canoniques, LUES sur la configuration réelle — jamais choisies
   au jugé. Si les prédicats changeaient, ces visuels suivraient. */
const PAIRE_ALT = (() => {
  const x = CFG.angles.find((a) => a.sommet === 'A' && a.interieur);
  const y = CFG.angles.find((a) => a.sommet === 'B' && a.interieur && a.cote !== x.cote);
  return [x.id, y.id];
})();

const PAIRE_CORR = (() => {
  const x = CFG.angles.find((a) => a.sommet === 'A');
  const y = CFG.angles.find((a) => a.sommet === 'B' && a.cote === x.cote && a.sens === x.sens);
  return [x.id, y.id];
})();

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — l'instrument, avant tout vocabulaire d'angles. Ce module n'apporte
       pas de relation : il apporte l'IDÉE qu'une sécante rend la question du
       parallélisme décidable. */
    1: [
      {
        id: 'secante',
        type: 'vocabulaire',
        title: 'Une sécante rend la question décidable',
        summary: 'Une sécante est une droite qui coupe deux autres droites. Elle transforme « ces droites se rencontrent-elles ? » en une comparaison d’angles.',
        visual: <Figure config={CFG_NON} marques={false} />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Deux droites presque parallèles se coupent peut-être… à trois mètres de la feuille.
              On ne peut ni le voir, ni prolonger assez loin pour vérifier.
            </p>
            <div className="bg-white rounded-xl border-2 border-violet-200 p-3 text-sm text-slate-700">
              Une <strong>sécante</strong> coupe les deux droites en deux points,{' '}
              <strong>A</strong> et <strong>B</strong>. Autour de ces points naissent des angles —
              et un angle, ça se mesure au rapporteur, <strong>ici, sur la feuille</strong>.
            </div>
            <p className="text-sm text-slate-500">
              C’est tout l’intérêt : une question inaccessible (que font ces droites très loin ?)
              devient une question locale (ces deux angles sont-ils égaux ?).
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux droites qu’on n’arrivait pas à départager à l’œil.</div>
          </div>
        ),
      },
    ],

    /* M2 — les deux relations de position. Elles se DÉFINISSENT ici, sans
       qu'aucune égalité ne soit encore affirmée : c'est le module 3 qui
       établira l'égalité, et il aurait perdu sa découverte si on l'annonçait. */
    2: [
      {
        id: 'angles-correspondants',
        type: 'vocabulaire',
        title: 'Les angles correspondants',
        summary: 'Deux angles correspondants occupent la même position aux deux croisements : même côté de la sécante, et même côté de leur droite.',
        visual: <Figure paire={PAIRE_CORR} couleur="#0ea5e9" marques={false} />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Imagine que tu fasses <strong>glisser</strong> le croisement du bas jusqu’à celui du
              haut, le long de la sécante. Les angles qui se superposent sont les angles{' '}
              <strong>correspondants</strong>.
            </p>
            <div className="bg-white rounded-xl border border-sky-100 p-3 text-sm text-slate-700">
              Ils forment une figure en <strong>F</strong> — droit, retourné ou penché, peu importe.
            </div>
            <p className="text-sm text-slate-500">
              Attention : cette définition ne dit <strong>rien</strong> sur leurs mesures. Deux
              angles correspondants existent toujours, que les droites soient parallèles ou non.
            </p>
          </div>
        ),
      },
      {
        id: 'angles-alternes-internes',
        type: 'vocabulaire',
        title: 'Les angles alternes-internes',
        summary: 'Deux angles alternes-internes sont tous deux entre les droites, et de part et d’autre de la sécante.',
        visual: <Figure paire={PAIRE_ALT} couleur="#7c3aed" marques={false} />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li>• <strong>internes</strong> : tous deux dans la bande, entre les deux droites ;</li>
              <li>• <strong>alternes</strong> : l’un à gauche de la sécante, l’autre à droite ;</li>
              <li>• et ils sont à des croisements <strong>différents</strong>.</li>
            </ul>
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-sm text-slate-700">
              Ils forment une figure en <strong>Z</strong> — ou en N, si la figure est penchée.
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">À ne pas confondre :</strong> deux angles du{' '}
              <em>même</em> croisement ne sont jamais alternes-internes. Il en faut un à chaque
              croisement.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — LA propriété. Elle arrive après l'observation des huit mesures. */
    3: [
      {
        id: 'paralleles-angles-egaux',
        type: 'regles',
        title: 'Deux parallèles donnent des angles égaux',
        summary: 'Si deux droites parallèles sont coupées par une sécante, alors les angles alternes-internes sont égaux, et les angles correspondants aussi.',
        visual: <Figure paire={PAIRE_ALT} couleur="#0284c7" />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-sky-200 p-4 space-y-2">
              <div className="text-sm text-slate-700">
                <strong>Si</strong> d₁ ∥ d₂ et qu’une sécante les coupe,
              </div>
              <div className="text-sm text-slate-700">
                <strong>alors</strong> les alternes-internes sont égaux, et les correspondants
                aussi.
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Ce n’est pas un hasard de figure : en faisant pivoter la sécante, les huit mesures
              changent toutes — mais les paires restent égales, à chaque instant.
            </p>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Sans le parallélisme, c’est faux.</strong> Deux
              droites qui font 6° d’écart donnent des alternes-internes qui diffèrent de… 6°
              exactement. L’hypothèse « parallèles » n’est pas décorative.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-angles-paralleles',
        type: 'memoriser',
        title: '⭐ Parallèles : le Z et le F disent l’égalité',
        summary: 'Alternes-internes égaux, correspondants égaux — à condition que les droites soient parallèles.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg sm:text-xl font-black text-rose-700">
              d₁ ∥ d₂ &nbsp;⟹&nbsp; angles en Z égaux, angles en F égaux
            </div>
            <div className="text-sm text-slate-600 font-semibold">
              Sans parallèles, aucune égalité garantie.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — la méthode de calcul, qui s'appuie sur M3 plus deux relations
       élémentaires (supplémentaires, opposés par le sommet). */
    4: [
      {
        id: 'calculer-les-angles',
        type: 'methodes',
        title: 'Déduire les huit angles d’un seul',
        summary: 'Avec deux parallèles, un seul angle connu suffit : les sept autres valent soit le même nombre, soit son supplémentaire.',
        visual: <Figure toutes couleur="#059669" />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <ol className="space-y-1.5 text-sm text-slate-700 list-decimal list-inside">
              <li>l’angle <strong>opposé par le sommet</strong> a la même mesure ;</li>
              <li>l’angle <strong>adjacent</strong> vaut 180° moins cette mesure ;</li>
              <li>au second croisement, les <strong>correspondants</strong> répètent les mêmes
                valeurs — parce que les droites sont parallèles.</li>
            </ol>
            <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 text-sm text-slate-700">
              Avec un angle de <strong>62°</strong>, les huit angles ne prennent que{' '}
              <strong>deux valeurs</strong> : 62° et 118°, en alternance autour de chaque point.
            </div>
            <p className="text-sm text-slate-500">
              Aucun rapporteur n’est nécessaire : tout se déduit du seul angle donné.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — LA RÉCIPROQUE, l'outil de preuve. */
    5: [
      {
        id: 'reciproque-parallelisme',
        type: 'regles',
        title: 'Des angles égaux prouvent le parallélisme',
        summary: 'Si deux angles alternes-internes (ou correspondants) sont égaux, alors les deux droites sont parallèles.',
        visual: <Figure paire={PAIRE_ALT} couleur="#a855f7" />,
        visualSize: 'lg',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border-2 border-purple-200 p-4 space-y-2 text-sm text-slate-700">
              <div><strong>Si</strong> deux alternes-internes sont égaux,</div>
              <div><strong>alors</strong> les deux droites sont parallèles.</div>
            </div>
            <p className="text-sm text-slate-600">
              C’est la <strong>même propriété lue à l’envers</strong> — et c’est elle qui sert à{' '}
              <em>prouver</em>. Le sens direct calcule des angles quand on sait déjà que les droites
              sont parallèles ; la réciproque, elle, <strong>établit</strong> le parallélisme.
            </p>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 text-sm">
              <strong className="text-orange-800">Ce qui ne suffit pas :</strong> deux angles égaux
              pris <em>n’importe où</em>. Il faut qu’ils soient alternes-internes ou correspondants
              — donc bien placés, un à chaque croisement.
            </div>
            <p className="text-sm text-slate-500">
              Avec elle, on peut affirmer un parallélisme <strong>sans jamais prolonger les
              droites</strong>. C’est ce qu’on cherchait au tout premier module.
            </p>
          </div>
        ),
      },
    ],

    /* M6 — l'enchaînement, le raisonnement en plusieurs pas. */
    6: [
      {
        id: 'enchainer-relations',
        type: 'methodes',
        title: 'Enchaîner deux relations',
        summary: 'Dans une figure, on passe d’un angle à un autre par une suite de relations, chacune justifiée.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un angle éloigné se rejoint rarement d’un coup. On avance par étapes, et{' '}
              <strong>chaque étape se nomme</strong> :
            </p>
            <div className="bg-white rounded-xl border-2 border-rose-200 p-3 space-y-1.5 text-sm text-slate-700">
              <div>1. « ces deux angles sont <strong>opposés par le sommet</strong>, donc égaux » ;</div>
              <div>2. « ceux-ci sont <strong>alternes-internes</strong> et les droites sont
                parallèles, donc égaux » ;</div>
              <div>3. « ces deux-là sont <strong>adjacents</strong>, donc leur somme fait 180° ».</div>
            </div>
            <div className="bg-white rounded-xl border border-rose-100 p-3 text-sm text-slate-600">
              Une réponse juste sans justification ne vaut pas grand-chose en géométrie : ce qu’on
              demande, c’est <strong>par quel chemin</strong> on y est arrivé.
            </div>
          </div>
        ),
      },
    ],
  },
};

export { angleParId };
