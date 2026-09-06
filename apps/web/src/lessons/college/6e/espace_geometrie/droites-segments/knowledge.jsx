import React from 'react';
import { MiniFigure } from '../../../../common/knowledge6e';

/**
 * Connaissances de la leçon « Droites et segments » (6e) — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md, KNOWLEDGE_DEPENDENCY.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> à l'instant
 * où le geste vient de lui donner un sens. Rien n'est réécrit dans les
 * modules : la brique et la carte montrent le même texte.
 *
 * ORDRE — un item n'emploie QUE ce qui est déjà posé à son module ou avant :
 *
 *   M1  l'étendue (jusqu'où ça va), le segment, la droite
 *   M2  la demi-droite et son origine
 *   M3  compter les extrémités : la seule chose qui décide du type
 *   M4  la notation ([AB], (AB), [AB), AB), l'appartenance, le milieu
 *   M5  la LECTURE de la notation : crochet = ça s'arrête, parenthèse = ça continue
 *   M6  l'ordre des points dans une demi-droite
 *   M7  décrire une figure : le type et les points
 *
 * ⚠️ RÉPARATION PÉDAGOGIQUE MAJEURE. Les modules 1 à 4 employaient déjà
 * « la droite (AB) », « le milieu de [AB] » dans des titres d'étape et des
 * questions, alors que le module 5 (« Crochets et parenthèses ») était censé
 * les enseigner. Le module 5 reste l'approfondissement (POURQUOI ce symbole
 * plutôt qu'un autre), mais la notation est désormais POSÉE au module 4, au
 * premier endroit où elle devient nécessaire pour parler du milieu.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

const Piege = ({ children }) => <p className="text-xs text-rose-600">⚠️ {children}</p>;

/** Un petit dessin de trait, avec ses bouts : rond plein = extrémité. */
function TraitVisuel({ left = 'stop', right = 'stop', nameA = 'A', nameB = 'B', color = '#4f46e5' }) {
  const W = 132, H = 44, y = 26;
  const xa = 34, xb = 98;
  const end = (side, x) => {
    if (side === 'stop') return <circle cx={x} cy={y} r="4" fill={color} />;
    const dir = x === xa ? -1 : 1;
    return (
      <path
        d={`M ${x + dir * 12} ${y - 4.5} L ${x + dir * 19} ${y} L ${x + dir * 12} ${y + 4.5}`}
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    );
  };
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="select-none">
      <line
        x1={left === 'stop' ? xa : 8} y1={y} x2={right === 'stop' ? xb : W - 8} y2={y}
        stroke={color} strokeWidth="2.2" strokeLinecap="round"
      />
      {end(left, xa)}
      {end(right, xb)}
      <text x={xa} y={y - 9} fontSize="10.5" fontWeight="700" fill="#334155" textAnchor="middle"
        fontFamily="ui-monospace, monospace">{nameA}</text>
      <text x={xb} y={y - 9} fontSize="10.5" fontWeight="700" fill="#334155" textAnchor="middle"
        fontFamily="ui-monospace, monospace">{nameB}</text>
    </svg>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {

    /* ── M1 — Ce qui distingue deux traits : jusqu'où ils vont. ── */
    1: [
      {
        id: 'etendue',
        type: 'concepts',
        title: 'L’étendue : jusqu’où ça va',
        summary: 'Deux traits peuvent se ressembler et ne pas aller aussi loin l’un que l’autre.',
        visual: (
          <div className="space-y-1">
            <TraitVisuel left="stop" right="stop" color="#4f46e5" />
            <TraitVisuel left="go" right="go" color="#0891b2" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Ce qui différencie deux traits en géométrie, ce n’est ni leur longueur dessinée, ni
              leur inclinaison : c’est <strong>jusqu’où ils vont</strong>. On appelle cela leur
              étendue.
            </p>
            <p className="text-xs text-slate-500">
              Sur un dessin, un <strong>rond plein</strong> dit « ça s’arrête ici » et une{' '}
              <strong>flèche</strong> dit « ça continue sans fin ».
            </p>
            <Souvenir>les deux traits que tu as tirés : l’un a buté, l’autre non.</Souvenir>
          </div>
        ),
      },
      {
        id: 'segment',
        type: 'vocabulaire',
        title: 'Un segment',
        summary: 'Un trait qui s’arrête des deux côtés : il a deux bouts, appelés extrémités.',
        visual: <TraitVisuel left="stop" right="stop" color="#4f46e5" />,
        body: (
          <div className="space-y-2">
            <p>
              Un segment relie deux points et <strong>s’arrête</strong> sur eux. Ces deux bouts
              portent un nom : les <strong>extrémités</strong> du segment.
            </p>
            <Piege>
              Un segment peut être immense : il garde quand même deux extrémités. C’est le nombre de
              bouts qui compte, jamais la longueur.
            </Piege>
            <Souvenir>le premier trait, qui a refusé d’aller plus loin quand tu as tiré.</Souvenir>
          </div>
        ),
      },
      {
        id: 'droite',
        type: 'vocabulaire',
        title: 'Une droite',
        summary: 'Un trait qui ne s’arrête nulle part : aucune extrémité, des deux côtés.',
        visual: <TraitVisuel left="go" right="go" color="#0891b2" />,
        body: (
          <div className="space-y-2">
            <p>
              Une droite continue sans fin des <strong>deux côtés</strong>. Elle n’a{' '}
              <strong>aucune extrémité</strong>.
            </p>
            <Piege>
              « Une droite est un segment très long » est faux. Sur la feuille on n’en voit qu’un
              morceau — le bord du papier n’est pas un bout de la droite.
            </Piege>
            <Souvenir>le second trait : plus tu reculais la vue, plus il continuait.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M2 — Le troisième cas : un seul bout. ── */
    2: [
      {
        id: 'demi-droite',
        type: 'vocabulaire',
        title: 'Une demi-droite',
        summary: 'Un trait qui s’arrête d’un côté et continue sans fin de l’autre.',
        visual: <TraitVisuel left="stop" right="go" color="#0284c7" />,
        body: (
          <div className="space-y-2">
            <p>
              Entre « deux bouts » et « aucun bout », il restait un cas : <strong>un seul bout</strong>.
              C’est la demi-droite.
            </p>
            <Piege>
              Ce n’est pas « la moitié d’une droite » : elle est aussi infinie qu’une droite, mais
              d’un seul côté seulement.
            </Piege>
            <Souvenir>le trait dont le point A était bloqué pendant que tu tirais l’autre bout.</Souvenir>
          </div>
        ),
      },
      {
        id: 'origine',
        type: 'vocabulaire',
        title: 'L’origine d’une demi-droite',
        summary: 'Son unique extrémité : le point où elle commence.',
        visual: <TraitVisuel left="stop" right="go" nameA="A" nameB="B" color="#0284c7" />,
        body: (
          <div className="space-y-2">
            <p>
              L’origine est le seul point où la demi-droite s’arrête. Au-delà, du côté de l’origine,
              elle n’existe pas ; de l’autre côté, elle continue sans fin.
            </p>
            <p className="text-xs text-slate-500">
              L’origine fait partie de la définition : deux demi-droites sur le même trait mais
              d’origines différentes ne sont pas le même objet.
            </p>
            <Souvenir>le point A, qui ne bougeait pas quand tu tirais sur B.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M3 — La règle de tri : compter les extrémités. ── */
    3: [
      {
        id: 'mem-compter-bouts',
        type: 'memoriser',
        title: '⭐ Compte les bouts, tu auras le type',
        summary: '2 extrémités → segment · 1 → demi-droite · 0 → droite.',
        body: (
          <div className="space-y-2">
            <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
              <div className="text-sm font-black text-rose-700">2 bouts → SEGMENT</div>
              <div className="text-sm font-black text-rose-700">1 bout → DEMI-DROITE</div>
              <div className="text-sm font-black text-rose-700">0 bout → DROITE</div>
            </div>
            <p className="text-xs text-slate-500">
              Ni la longueur du dessin, ni l’inclinaison ne servent à trancher : on compte les ronds
              pleins, et c’est tout.
            </p>
            <Souvenir>les trois figures que tu as triées sans que A ni B ne bougent.</Souvenir>
          </div>
        ),
      },
      {
        id: 'deux-points-ne-suffisent-pas',
        type: 'regles',
        title: 'Deux points ne suffisent pas',
        summary: 'Pour désigner un objet, il faut ses deux points ET son étendue.',
        body: (
          <div className="space-y-2">
            <p>
              A et B ne changeaient jamais, et pourtant tu obtenais trois objets différents. Donner
              deux points ne dit donc pas de quel objet on parle : il faut aussi préciser jusqu’où il
              va.
            </p>
            <Souvenir>les pastilles de type que tu changeais, A et B restant fixes.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M4 — Écrire les objets, puis les points qui y vivent. ── */
    4: [
      {
        id: 'notation-objets',
        type: 'vocabulaire',
        title: 'Écrire un objet : [AB], (AB), [AB)',
        summary: 'Une écriture courte pour dire par où ça passe et jusqu’où ça va.',
        visual: (
          <div className="space-y-1">
            <TraitVisuel left="stop" right="stop" color="#4f46e5" />
            <TraitVisuel left="go" right="go" color="#0891b2" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-1.5 text-sm">
              <div>
                <span className="font-mono font-bold text-base">[AB]</span>{' '}
                <span className="text-slate-500">le segment d’extrémités A et B</span>
              </div>
              <div>
                <span className="font-mono font-bold text-base">(AB)</span>{' '}
                <span className="text-slate-500">la droite qui passe par A et par B</span>
              </div>
              <div>
                <span className="font-mono font-bold text-base">[AB)</span>{' '}
                <span className="text-slate-500">la demi-droite d’origine A passant par B</span>
              </div>
              <div>
                <span className="font-mono font-bold text-base">AB</span>{' '}
                <span className="text-slate-500">sans signe : la longueur du segment, un nombre</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Tu sauras au module suivant <em>pourquoi</em> ces signes-là. Pour l’instant, retiens
              qu’ils permettent d’écrire en trois caractères ce que tu dis en une phrase.
            </p>
            <Piege>
              <span className="font-mono">AB</span> sans crochet ni parenthèse n’est pas un trait :
              c’est un nombre, une longueur qui se mesure.
            </Piege>
          </div>
        ),
      },
      {
        id: 'appartenance',
        type: 'concepts',
        title: 'Un point appartient, ou il n’appartient pas',
        summary: 'Être sur une droite est exact : la distance à la droite doit valoir 0.',
        body: (
          <div className="space-y-2">
            <p>
              En géométrie, il n’y a pas d’« à peu près sur le trait ». Ou bien le point est dessus —
              sa distance à la droite vaut <strong>0</strong> — ou bien il n’y est pas.
            </p>
            <p className="text-xs text-slate-500">
              Trois points posés sur une même droite sont dits <strong>alignés</strong>.
            </p>
            <Piege>
              « Ça a l’air aligné » ne prouve rien : à quelques millimètres près, l’œil ne fait pas
              la différence, et pourtant la réponse change.
            </Piege>
            <Souvenir>la jauge qui devait tomber exactement à 0 pour que M soit sur le trait.</Souvenir>
          </div>
        ),
      },
      {
        id: 'milieu',
        type: 'regles',
        title: 'Le milieu d’un segment',
        summary: 'Le point M de [AB] tel que AM = MB — deux conditions, pas une.',
        visual: (
          <svg width="132" height="40" viewBox="0 0 132 40" aria-hidden="true" className="select-none">
            <line x1="20" y1="24" x2="112" y2="24" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" />
            {[20, 66, 112].map((x, i) => (
              <circle key={x} cx={x} cy="24" r="4" fill={i === 1 ? '#e11d48' : '#7c3aed'} />
            ))}
            {[['A', 20], ['M', 66], ['B', 112]].map(([t, x]) => (
              <text key={t} x={x} y="15" fontSize="10.5" fontWeight="700" fill="#334155"
                textAnchor="middle" fontFamily="ui-monospace, monospace">{t}</text>
            ))}
            <text x="43" y="37" fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="ui-monospace, monospace">AM</text>
            <text x="89" y="37" fontSize="9" fill="#64748b" textAnchor="middle" fontFamily="ui-monospace, monospace">MB</text>
          </svg>
        ),
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm space-y-1">
              <div>① M appartient au segment <span className="font-mono font-bold">[AB]</span></div>
              <div>② les deux longueurs sont égales : <span className="font-mono font-bold">AM = MB</span></div>
            </div>
            <Piege>
              L’égalité seule ne suffit pas. Un point placé au-dessus du trait peut être à égale
              distance de A et de B sans être le milieu de <span className="font-mono">[AB]</span>.
            </Piege>
            <Souvenir>les deux jauges AM et MB que tu as fait afficher le même nombre.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M5 — Pourquoi CES signes : le symbole dessine l'étendue. ── */
    5: [
      {
        id: 'lire-la-notation',
        type: 'methodes',
        title: 'Lire une écriture symbole par symbole',
        summary: 'Un crochet ferme (il y a un bout), une parenthèse ouvre (ça continue).',
        body: (
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm space-y-1.5">
              <div>
                <span className="font-mono font-bold">[</span> ou{' '}
                <span className="font-mono font-bold">]</span> → de ce côté, ça{' '}
                <strong>s’arrête</strong> : il y a une extrémité.
              </div>
              <div>
                <span className="font-mono font-bold">(</span> ou{' '}
                <span className="font-mono font-bold">)</span> → de ce côté, ça{' '}
                <strong>continue</strong> sans fin.
              </div>
            </div>
            <p>
              L’écriture n’est donc pas une convention à apprendre par cœur : elle{' '}
              <strong>dessine</strong> l’étendue. Compte les crochets et tu as le nombre
              d’extrémités — donc le type.
            </p>
            <Souvenir>les symboles qui changeaient en même temps que les bouts du trait.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M6 — Construire oblige à choisir l'origine. ── */
    6: [
      {
        id: 'ordre-des-points',
        type: 'regles',
        title: 'Dans [AB), l’ordre des points compte',
        summary: '[AB) part de A vers B ; [BA) part de B vers A. Deux objets différents.',
        visual: (
          <div className="space-y-1">
            <TraitVisuel left="stop" right="go" nameA="A" nameB="B" color="#7c3aed" />
            <TraitVisuel left="go" right="stop" nameA="A" nameB="B" color="#c026d3" />
          </div>
        ),
        body: (
          <div className="space-y-2">
            <p>
              Le point écrit contre le crochet est l’origine. Les deux demi-droites reposent sur le
              même trait, mais elles partent dans des sens opposés.
            </p>
            <p className="text-xs text-slate-500">
              Pour <span className="font-mono">[AB]</span> et <span className="font-mono">(AB)</span>,
              en revanche, l’ordre est sans importance : les deux bouts jouent le même rôle.
            </p>
            <Souvenir>la construction où il fallait poser l’origine avant l’autre point.</Souvenir>
          </div>
        ),
      },
    ],

    /* ── M7 — Décrire, c'est nommer type + points. ── */
    7: [
      {
        id: 'decrire-figure',
        type: 'methodes',
        title: 'Décrire une figure sans ambiguïté',
        summary: 'Pour chaque trait : son type, et les points par lesquels il passe.',
        visual: (
          <MiniFigure
            points={[{ x: 6, y: 92 }, { x: 50, y: 8 }, { x: 94, y: 92 }]}
            labels={[
              { x: -2, y: 100, text: 'A' },
              { x: 50, y: 0, text: 'B' },
              { x: 102, y: 100, text: 'C' },
            ]}
            fill="#eef2ff"
            stroke="#4f46e5"
          />
        ),
        body: (
          <div className="space-y-2">
            <p>
              « Un trait entre A et B » ne suffit pas : ce peut être{' '}
              <span className="font-mono">[AB]</span>, <span className="font-mono">[AB)</span> ou{' '}
              <span className="font-mono">(AB)</span>. Il faut dire jusqu’où ça va.
            </p>
            <p className="text-xs text-slate-500">
              Une description est bonne quand quelqu’un qui ne voit pas la figure peut la redessiner
              à l’identique.
            </p>
            <Souvenir>la figure que tu as décrite pour qu’un camarade la retrouve.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
