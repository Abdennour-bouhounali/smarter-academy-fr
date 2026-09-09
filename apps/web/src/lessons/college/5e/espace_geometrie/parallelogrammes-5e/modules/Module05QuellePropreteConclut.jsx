import React, { useState } from 'react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PreuveChoix from '../components/PreuveChoix';
import { quatriemeSommet } from '../components/paral';

/**
 * Module 5 — RAISONNEMENT : quelle propriété permet de conclure ?
 *
 * C'est la demande explicite du cahier des charges : « créer des tâches où
 * l'élève doit choisir — quelle propriété me permet de conclure ? Pas
 * uniquement calculer. »
 *
 * L'élève ne calcule rien. Il reçoit une figure CODÉE (les marques y sont,
 * les mesures n'y sont pas) plus ce que l'énoncé donne, et il désigne la
 * propriété qui autorise la conclusion — ou constate qu'aucune ne l'autorise.
 *
 * DEUX CONFIGURATIONS SUR SIX NE CONCLUENT PAS. C'est ce qui sépare
 * « je reconnais un dessin » de « j'invoque une propriété » : sans elles,
 * l'élève apprendrait qu'il y a toujours une réponse, et il la trouverait au
 * hasard. Le cerf-volant (côtés CONSÉCUTIFS égaux) et le trapèze (UNE seule
 * paire parallèle) sont exactement les deux figures qu'on confond.
 *
 * Expected observation : « ce n'est pas le dessin qui décide, c'est ce que
 * l'énoncé me donne — et parfois il ne me donne pas assez ».
 * Misconception targeted : (d) de la spec — conclure d'un dessin qui
 * ressemble. Les figures 3 et 5 RESSEMBLENT à des parallélogrammes sans en
 * être, et la figure 6 en est un sans en avoir l'air.
 *
 * Progression non bloquante : PreuveChoix appelle `onAnswered`
 * inconditionnellement et révèle toujours la bonne réponse.
 */

/* Les figures sont CONSTRUITES : celles qui doivent être des
   parallélogrammes le sont par `quatriemeSommet`, jamais par des coordonnées
   tapées à l'œil (§28bis — la figure ne ment jamais). */
const pA = { x: 80, y: 230 };
const pB = { x: 250, y: 230 };
const pC = { x: 300, y: 90 };
const PARA = [pA, pB, pC, quatriemeSommet(pA, pB, pC)];

const pA2 = { x: 95, y: 215 };
const pB2 = { x: 290, y: 240 };
const pC2 = { x: 330, y: 95 };
const PARA2 = [pA2, pB2, pC2, quatriemeSommet(pA2, pB2, pC2)];

const CONFIGS = [
  {
    id: 'c1',
    titre: 'Deux paires de chevrons',
    pts: PARA,
    codes: [
      { i: 0, j: 1, n: 1, forme: 'chevron' }, { i: 3, j: 2, n: 1, forme: 'chevron' },
      { i: 0, j: 3, n: 2, forme: 'chevron' }, { i: 1, j: 2, n: 2, forme: 'chevron' },
    ],
    aria: 'Un quadrilatère ABCD dont les deux paires de côtés opposés portent des chevrons',
    donnees: ['(AB) ∥ (DC)', '(AD) ∥ (BC)'],
    options: [
      'La définition : les côtés opposés sont parallèles deux à deux',
      'Les côtés opposés sont égaux deux à deux',
      'Les diagonales se coupent en leur milieu',
      'On ne peut pas conclure',
    ],
    correct: 0,
    explain: 'C’est la définition elle-même : deux paires de côtés opposés parallèles suffisent, et rien d’autre n’est à vérifier. Les longueurs et les diagonales suivront — mais on n’a pas eu besoin d’elles.',
    explainWrong: {
      1: 'L’énoncé ne donne aucune longueur : on ne peut pas invoquer l’égalité des côtés, qui n’est écrite nulle part. Ce qui est donné, ce sont les deux parallélismes — c’est-à-dire la définition.',
      2: 'Aucune diagonale n’est tracée ni codée ici. On conclut avec ce que l’énoncé donne : les deux parallélismes, donc la définition.',
      3: 'Si, on peut : deux paires de côtés opposés parallèles, c’est exactement la définition du parallélogramme.',
    },
  },
  {
    id: 'c2',
    titre: 'Deux paires de marques',
    pts: PARA2,
    codes: [
      { i: 0, j: 1, n: 1, forme: 'tick' }, { i: 3, j: 2, n: 1, forme: 'tick' },
      { i: 0, j: 3, n: 2, forme: 'tick' }, { i: 1, j: 2, n: 2, forme: 'tick' },
    ],
    aria: 'Un quadrilatère dont les côtés opposés portent des marques d’égalité',
    donnees: ['AB = DC', 'AD = BC'],
    options: [
      'Les côtés opposés sont égaux deux à deux',
      'La définition : les côtés opposés sont parallèles deux à deux',
      'Les diagonales se coupent en leur milieu',
      'On ne peut pas conclure',
    ],
    correct: 0,
    explain: 'Cette propriété marche aussi dans l’autre sens : si les côtés opposés sont égaux DEUX À DEUX, alors le quadrilatère est un parallélogramme. C’est une caractérisation.',
    explainWrong: {
      1: 'Le parallélisme n’est pas donné ici — aucun chevron sur la figure, rien dans l’énoncé. On ne peut invoquer que ce qui est écrit : les deux égalités de longueurs.',
      3: 'Si : l’égalité des côtés opposés deux à deux suffit à conclure. C’est l’une des trois caractérisations.',
    },
  },
  {
    id: 'c3',
    titre: 'Le cerf-volant',
    /* Un VRAI cerf-volant, symétrique par rapport à la diagonale (AC) :
       AB = AD et CB = CD au millième près, vérifié par le test. Un dessin
       « à peu près » ferait mentir les marques d'égalité (§28bis). */
    pts: [{ x: 200, y: 55 }, { x: 310, y: 150 }, { x: 200, y: 265 }, { x: 90, y: 150 }],
    codes: [
      { i: 0, j: 1, n: 1, forme: 'tick' }, { i: 0, j: 3, n: 1, forme: 'tick' },
      { i: 1, j: 2, n: 2, forme: 'tick' }, { i: 2, j: 3, n: 2, forme: 'tick' },
    ],
    aria: 'Un cerf-volant : les côtés qui se touchent sont égaux deux à deux',
    donnees: ['AB = AD', 'CB = CD'],
    options: [
      'On ne peut pas conclure : ce sont des côtés CONSÉCUTIFS',
      'Les côtés opposés sont égaux deux à deux',
      'La définition : les côtés opposés sont parallèles deux à deux',
      'Les diagonales se coupent en leur milieu',
    ],
    correct: 0,
    explain: 'Les égalités données concernent des côtés qui SE TOUCHENT ([AB] et [AD] partagent A). La caractérisation exige les côtés OPPOSÉS. Cette figure est un cerf-volant, et ce n’est pas un parallélogramme.',
    explainWrong: {
      1: 'Regarde quels côtés portent la même marque : [AB] et [AD] se touchent en A. Ce sont des côtés consécutifs, pas opposés. La caractérisation ne s’applique donc pas.',
      2: 'Aucun parallélisme n’est donné — et il n’y en a pas : les côtés opposés de cette figure ne sont pas parallèles.',
      3: 'Rien dans l’énoncé ne parle des diagonales. Et ici elles ne se coupent pas en leur milieu : une seule des deux est partagée en deux parts égales.',
    },
  },
  {
    id: 'c4',
    titre: 'Le croisement marqué',
    pts: PARA,
    diagonales: true,
    codes: [],
    aria: 'Un quadrilatère dont les diagonales se coupent en un point marqué O',
    donnees: ['O est le point d’intersection des diagonales', 'OA = OC', 'OB = OD'],
    options: [
      'Les diagonales se coupent en leur milieu',
      'Les côtés opposés sont égaux deux à deux',
      'La définition : les côtés opposés sont parallèles deux à deux',
      'On ne peut pas conclure',
    ],
    correct: 0,
    explain: 'OA = OC dit que O est le milieu de [AC] ; OB = OD dit qu’il est le milieu de [BD]. Les deux diagonales ont donc le même milieu — et cela suffit à conclure.',
    explainWrong: {
      1: 'L’énoncé ne donne aucune longueur de côté : il ne parle que des quatre demi-diagonales. C’est la caractérisation par les diagonales qu’il faut invoquer.',
      3: 'Si : deux diagonales qui ont le même milieu, c’est exactement la troisième caractérisation.',
    },
  },
  {
    id: 'c5',
    titre: 'Une seule paire de chevrons',
    pts: [{ x: 70, y: 245 }, { x: 330, y: 245 }, { x: 275, y: 100 }, { x: 140, y: 100 }],
    codes: [
      { i: 0, j: 1, n: 1, forme: 'chevron' }, { i: 3, j: 2, n: 1, forme: 'chevron' },
    ],
    aria: 'Un trapèze : une seule paire de côtés opposés est parallèle',
    donnees: ['(AB) ∥ (DC)', 'rien n’est dit sur (AD) et (BC)'],
    options: [
      'On ne peut pas conclure : il manque la seconde paire',
      'La définition : les côtés opposés sont parallèles deux à deux',
      'Les côtés opposés sont égaux deux à deux',
      'Les diagonales se coupent en leur milieu',
    ],
    correct: 0,
    explain: 'Une seule paire de côtés parallèles fait un TRAPÈZE, pas un parallélogramme. Il en faut deux. Ici (AD) et (BC) se rapprochent en montant : elles finiraient par se couper.',
    explainWrong: {
      1: 'La définition demande les côtés opposés parallèles DEUX À DEUX, c’est-à-dire les deux paires. L’énoncé n’en donne qu’une — et l’autre paire n’est pas parallèle : regarde les côtés obliques se rapprocher.',
      2: 'Aucune longueur n’est donnée. Et les deux côtés obliques de cette figure ne sont pas égaux.',
      3: 'Rien n’est dit sur les diagonales — et ici elles ne se coupent pas en leur milieu.',
    },
  },
  {
    id: 'c6',
    titre: 'Le très aplati',
    pts: (() => {
      const a = { x: 60, y: 200 };
      const b = { x: 300, y: 235 };
      const c = { x: 355, y: 160 };
      return [a, b, c, quatriemeSommet(a, b, c)];
    })(),
    codes: [
      { i: 0, j: 1, n: 1, forme: 'chevron' }, { i: 3, j: 2, n: 1, forme: 'chevron' },
      { i: 0, j: 3, n: 2, forme: 'chevron' }, { i: 1, j: 2, n: 2, forme: 'chevron' },
    ],
    aria: 'Un parallélogramme très aplati, dont les deux paires de côtés opposés sont parallèles',
    donnees: ['(AB) ∥ (DC)', '(AD) ∥ (BC)'],
    question: 'Cette figure est très aplatie et ne « ressemble » pas à un parallélogramme. Que conclure ?',
    options: [
      'C’est un parallélogramme : les deux paires sont parallèles',
      'Ce n’en est pas un : il est trop aplati',
      'Ce n’en est pas un : il n’a pas d’angle droit',
      'On ne peut pas conclure sans mesurer les côtés',
    ],
    correct: 0,
    explain: 'L’allure ne compte pas. Les deux paires de côtés opposés sont parallèles : la définition est vérifiée, donc c’est un parallélogramme — aplati, penché, mais parallélogramme.',
    explainWrong: {
      1: 'Aucune condition ne parle de la forme ni de l’allure. Un parallélogramme peut être aussi aplati qu’on veut : ce qui décide, ce sont les deux parallélismes, et ils sont donnés.',
      2: 'Les angles droits n’ont jamais fait partie de la définition. Un parallélogramme qui en a s’appelle un rectangle — mais un parallélogramme n’a pas besoin d’en avoir.',
      3: 'On n’a pas besoin des longueurs : les deux parallélismes suffisent, et ils sont écrits dans l’énoncé.',
    },
  },
];

export default function Module05QuellePropreteConclut() {
  const [faits, setFaits] = useState([]);
  const [idx, setIdx] = useState(0);
  const conf = CONFIGS[idx];
  const tousFaits = faits.length >= CONFIGS.length;

  const repondu = (react) => {
    if (faits.includes(conf.id)) return;
    const next = [...faits, conf.id];
    setFaits(next);
    if (next.length === CONFIGS.length) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Les trois outils de conclusion',
      done: faits.length >= 1,
      content: (
        <div className="space-y-3">
          {/* Les trois caractérisations sont posées AVANT les six figures :
              on ne peut pas demander « quelle propriété conclut ? » à un élève
              qui n'a pas la liste des propriétés disponibles (§6quinquies).
              Elles ne sont pas neuves : ce sont les propriétés des modules 1,
              3 et 4, retournées dans l'autre sens. */}
          <KnowledgeBrick
            id="caracterisations"
            variant="new"
            lead={<>Tu as trois propriétés en poche. Jusqu’ici elles servaient à décrire un parallélogramme ; elles servent aussi à en reconnaître un.</>}
          />
          <Feedback tone="info">
            Sur chaque figure, la question n’est pas « à quoi ça ressemble ? » mais{' '}
            <strong>« qu’est-ce que l’énoncé me donne, et quelle propriété s’applique ? »</strong>{' '}
            Parfois, aucune ne s’applique — et c’est une réponse.
          </Feedback>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Six figures, six décisions',
      subtitle: 'Pour chacune : quelle propriété permet de conclure — ou pourquoi on ne peut pas.',
      done: tousFaits,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="text-sm font-bold text-slate-700">
              Figure {idx + 1} sur {CONFIGS.length} — {conf.titre}
            </div>
            <div className="flex gap-1.5">
              {CONFIGS.map((c) => (
                <span
                  key={c.id}
                  className={`inline-block w-5 h-2.5 rounded-full ${faits.includes(c.id) ? 'bg-purple-500' : 'bg-slate-200'}`}
                  aria-label={faits.includes(c.id) ? 'faite' : 'à faire'}
                />
              ))}
            </div>
          </div>

          <PreuveChoix
            key={conf.id}
            config={conf}
            solved={faits.includes(conf.id)}
            onAnswered={() => repondu(kit.react)}
          />

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-slate-300 disabled:opacity-40 transition min-h-[44px]"
            >
              ← Figure précédente
            </button>
            <button
              type="button"
              disabled={idx === CONFIGS.length - 1}
              onClick={() => setIdx((i) => Math.min(CONFIGS.length - 1, i + 1))}
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-40 transition min-h-[44px]"
            >
              Figure suivante →
            </button>
          </div>

          {tousFaits && (
            <Feedback tone="ok">
              Six figures, six décisions. Deux d’entre elles ne se concluaient pas — le cerf-volant
              et le trapèze — et l’une ressemblait si peu à un parallélogramme qu’elle en était
              pourtant un. <strong>C’est la propriété qui décide, jamais le dessin.</strong>
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Quelle propriété permet de conclure ?"
      moduleSubtitle="Choisir un raisonnement, pas calculer"
      estimatedTime="10 min"
      brief={{
        tag: 'Raisonnement',
        title: 'Ce n’est pas le dessin qui décide',
        tone: 'indigo',
        body: (
          <p>
            Six figures, chacune avec ce que l’énoncé donne — et rien de plus. À toi de dire{' '}
            <strong>quelle propriété autorise la conclusion</strong>. Attention : deux de ces
            figures ne permettent de conclure à rien du tout.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
