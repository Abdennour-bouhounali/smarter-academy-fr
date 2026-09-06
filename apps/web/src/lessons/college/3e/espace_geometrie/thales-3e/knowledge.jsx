import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Théorème de Thalès » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste sur sa carte.
 *
 * ORDRE. La configuration (M2) avant l'égalité des rapports (M3), l'égalité
 * avant le calcul (M4), et le théorème avant sa réciproque (M5) — c'est elle
 * qui n'a de sens qu'une fois le sens direct connu.
 */

const Fig = ({ children, caption }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 200 130" width="200" height="130" role="img" aria-label={caption}>
      {children}
    </svg>
    <p className="text-[11px] text-slate-500 text-center">{caption}</p>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le déclencheur : l'agrandissement conserve les rapports. */
    1: [
      {
        id: 'agrandissement-rapports',
        type: 'concepts',
        title: 'Agrandir conserve les rapports',
        summary: 'Un agrandissement multiplie toutes les longueurs par le même nombre : les rapports entre longueurs, eux, ne changent pas.',
        body: (
          <div className="space-y-3">
            <p>L’ombre d’un bâton et celle d’un immeuble, au même instant, forment deux figures
            de <strong>même forme</strong> mais de tailles très différentes.</p>
            <p>Toutes les longueurs de la grande sont celles de la petite multipliées par un même
            nombre. Un <strong>quotient</strong> de deux longueurs est donc identique dans les deux.</p>
            <p className="text-xs text-slate-500">C’est ce qui permet de mesurer l’inaccessible :
            on lit sur la petite figure ce qu’on ne peut pas atteindre sur la grande.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’ombre au soleil — le
            bâton et l’immeuble donnaient le même rapport.</div>
          </div>
        ),
      },
    ],

    /* M2 — La configuration : deux conditions, deux formes. */
    2: [
      {
        id: 'droites-secantes',
        type: 'vocabulaire',
        title: 'Droites sécantes',
        summary: 'Deux droites sont sécantes quand elles se coupent en un point.',
        visual: (
          <Fig caption="Deux droites sécantes en A">
            <line x1="20" y1="110" x2="180" y2="30" stroke="#4f46e5" strokeWidth="2" />
            <line x1="20" y1="30" x2="180" y2="110" stroke="#059669" strokeWidth="2" />
            <circle cx="100" cy="70" r="4" fill="#0f172a" />
            <text x="106" y="64" fontSize="12" fill="#0f172a">A</text>
          </Fig>
        ),
        body: (
          <div className="space-y-2">
            <p>Deux droites <strong>sécantes</strong> sont deux droites qui
            <strong> se coupent</strong> — elles ont un point commun, et un seul.</p>
            <p className="text-xs text-slate-500">C’est le contraire de parallèles, qui ne se
            rencontrent jamais.</p>
          </div>
        ),
      },
      {
        id: 'configuration-thales',
        type: 'concepts',
        title: 'La configuration de Thalès',
        summary: 'Deux droites sécantes en un point, coupées par deux droites parallèles : les deux conditions sont nécessaires.',
        body: (
          <div className="space-y-3">
            <p>Une configuration de Thalès demande <strong>deux</strong> choses ensemble :</p>
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-900">
                deux droites <strong>sécantes</strong> en un même point
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                deux droites <strong>parallèles</strong> qui les coupent
              </div>
            </div>
            <p className="text-xs text-slate-500">L’une sans l’autre ne suffit pas : un petit
            triangle dans un grand n’est pas forcément une configuration de Thalès.</p>
          </div>
        ),
      },
      {
        id: 'triangle-papillon',
        type: 'vocabulaire',
        title: 'Triangle et papillon',
        summary: 'Les deux formes que prend la configuration selon le côté du sommet où se trouvent les points ; elles se traitent de la même façon.',
        body: (
          <div className="space-y-2">
            <p>Si les points sont <strong>du même côté</strong> du sommet, la figure ressemble à un
            triangle dans un triangle : c’est la configuration dite « <strong>triangle</strong> ».</p>
            <p>S’ils sont <strong>de part et d’autre</strong> du sommet, les deux triangles sont
            opposés par ce sommet : c’est le « <strong>papillon</strong> ».</p>
            <p className="text-xs text-slate-500">Ces deux formes se traitent exactement de la même
            manière — le papillon n’est pas une exception.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le tri des figures, où
            deux « petits triangles dans un grand » n’étaient pourtant pas des configurations.</div>
          </div>
        ),
      },
    ],

    /* M3 — Le théorème lui-même. */
    3: [
      {
        id: 'theoreme-thales',
        type: 'formules',
        title: 'Le théorème de Thalès',
        summary: 'Dans une configuration de Thalès, les trois rapports de longueurs correspondantes sont égaux.',
        body: (
          <div className="space-y-3">
            <p>Si <MathText>{'$(MN)$'}</MathText> est parallèle à
            <MathText>{' $(BC)$'}</MathText>, alors :</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\dfrac{AM}{AB} = \\dfrac{AN}{AC} = \\dfrac{MN}{BC}$'}</MathText>
            </div>
            <p className="text-xs text-slate-500">Les longueurs changent quand on déplace la
            parallèle ; ces trois rapports, eux, restent égaux entre eux.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : tu as fait glisser la
            parallèle et les trois quotients bougeaient ensemble.</div>
          </div>
        ),
      },
    ],

    /* M4 — Calculer, et se relire. */
    4: [
      {
        id: 'methode-calculer-longueur',
        type: 'methodes',
        title: 'Calculer une longueur avec Thalès',
        summary: 'On écrit l’égalité des deux rapports qui contiennent la longueur cherchée, puis on fait un produit en croix.',
        body: (
          <div className="space-y-3">
            <ol className="list-decimal list-inside space-y-1">
              <li>Vérifier que la configuration est bien celle de Thalès.</li>
              <li>Écrire l’égalité des <strong>deux</strong> rapports qui contiennent la longueur
              cherchée et trois longueurs connues.</li>
              <li>Produit en croix, puis division.</li>
            </ol>
          </div>
        ),
      },
      {
        id: 'mem-controle-rapport',
        type: 'memoriser',
        title: '⭐ Le contrôle qui sauve',
        summary: 'Si le rapport est inférieur à 1, la longueur cherchée doit être plus courte que sa correspondante.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">rapport &lt; 1 ⇒ résultat plus court</div>
            <p className="text-xs text-rose-700">Un résultat plus grand que sa correspondante
            signale un produit en croix inversé. Ce coup d’œil prend une seconde.</p>
          </div>
        ),
      },
    ],

    /* M5 — Le sens inverse. */
    5: [
      {
        id: 'reciproque-thales',
        type: 'regles',
        title: 'La réciproque',
        summary: 'Si les points sont alignés dans le même ordre et que les rapports sont égaux, alors les droites sont parallèles.',
        body: (
          <div className="space-y-3">
            <p>Le théorème part du parallélisme pour donner des rapports. La
            <strong> réciproque</strong> fait l’inverse : elle part des rapports pour
            <strong> prouver</strong> le parallélisme.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
              Points alignés dans le même ordre <strong>et</strong>{' '}
              <MathText>{'$\\dfrac{AM}{AB} = \\dfrac{AN}{AC}$'}</MathText> ⇒{' '}
              <MathText>{'$(MN)$'}</MathText> ∥ <MathText>{'$(BC)$'}</MathText>
            </div>
            <p className="text-xs text-slate-500">L’ordre des points compte : sans lui, l’égalité
            des rapports ne suffit pas.</p>
          </div>
        ),
      },
      {
        id: 'contraposee-thales',
        type: 'regles',
        title: 'La contraposée',
        summary: 'Si les rapports sont différents, alors les droites ne sont pas parallèles.',
        body: (
          <div className="space-y-2">
            <p>C’est la réciproque lue à l’envers : des rapports <strong>différents</strong>
            interdisent le parallélisme.</p>
            <p className="text-xs text-slate-500">C’est l’outil quand la question est
            « ces droites sont-elles parallèles ? » et que la réponse est non.</p>
          </div>
        ),
      },
    ],

    /* M6 — Choisir l'énoncé selon la question posée. */
    6: [
      {
        id: 'choisir-enonce',
        type: 'methodes',
        title: 'Théorème ou réciproque ?',
        summary: 'Le parallélisme est-il une donnée, ou la question ? La réponse décide de l’énoncé à utiliser.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                Parallélisme <strong>donné</strong> → le <strong>théorème</strong> : on calcule une
                longueur.
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                Parallélisme <strong>demandé</strong> → la <strong>réciproque</strong> (ou la
                contraposée) : on compare deux rapports.
              </div>
            </div>
            <p className="text-xs text-slate-500">Se poser cette question avant d’écrire évite
            l’erreur la plus fréquente d’une rédaction.</p>
          </div>
        ),
      },
    ],

    /* M7 — Mesurer l'inaccessible. */
    7: [
      {
        id: 'mesurer-inaccessible',
        type: 'methodes',
        title: 'Mesurer l’inaccessible',
        summary: 'On fabrique une configuration de Thalès avec une longueur mesurable, et le théorème donne celle qu’on ne peut pas atteindre.',
        body: (
          <div className="space-y-2">
            <p>La hauteur d’une pyramide, la largeur d’une rivière, la taille d’un arbre : dans
            chaque cas on construit une figure semblable, à portée de main.</p>
            <p className="text-xs text-slate-500">C’est l’usage historique du théorème — et il n’a
            pas changé.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : Khéops et le parking.</div>
          </div>
        ),
      },
    ],
  },
};
