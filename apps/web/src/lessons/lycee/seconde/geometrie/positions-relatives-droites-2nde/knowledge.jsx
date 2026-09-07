import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniPlane } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Positions relatives de deux droites » — SOURCE
 * UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque module déclare ce qu'il APPORTE ; la carte que voit l'élève est la
 * réduction cumulative des modules validés (common/knowledge/knowledgeState).
 * Règle d'or : un item n'utilise que des notions déjà rencontrées au module
 * qui le déclare — le déterminant n'est réactivé qu'au module 2, les
 * équations au module 3, le système au module 4.
 */
const IND = '#4f46e5'; const ROSE = '#e11d48'; const AMB = '#d97706';

const secantes = (
  <MiniPlane width={210} height={150} xMin={-1} xMax={6} yMin={-1} yMax={5} showAxes={false}
    segments={[{ from: { x: 0, y: 0 }, to: { x: 6, y: 4 }, color: IND, label: '(d₁)', labelPos: 'above', labelT: 0.85 }, { from: { x: 0, y: 4 }, to: { x: 6, y: 1 }, color: ROSE, label: '(d₂)', labelPos: 'below', labelT: 0.85 }]}
    points={[{ x: 2.4, y: 1.6, label: 'I', color: AMB, labelPos: 'br' }]} />
);
const paralleles = (
  <MiniPlane width={210} height={150} xMin={-1} xMax={6} yMin={-1} yMax={5} showAxes={false}
    segments={[{ from: { x: 0, y: 0 }, to: { x: 6, y: 3 }, color: IND, label: '(d₁)', labelPos: 'below', labelT: 0.85 }, { from: { x: 0, y: 2 }, to: { x: 6, y: 5 }, color: ROSE, label: '(d₂)', labelPos: 'above', labelT: 0.85 }]} />
);
const confondues = (
  <MiniPlane width={210} height={150} xMin={-1} xMax={6} yMin={-1} yMax={5} showAxes={false}
    segments={[{ from: { x: 0, y: 0.5 }, to: { x: 6, y: 3.5 }, color: ROSE, width: 8, labelT: 0.85 }, { from: { x: 0, y: 0.5 }, to: { x: 6, y: 3.5 }, color: IND, label: '(d₁) = (d₂)', labelPos: 'above', labelT: 0.6 }]} />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le laboratoire : trois positions, trois comptes ; direction vs position. */
    1: [
      {
        id: 'positions-trois-cas',
        type: 'concepts',
        title: 'Les trois positions relatives',
        summary: 'Deux droites du plan sont sécantes (1 point commun), strictement parallèles (0) ou confondues (une infinité).',
        visual: secantes,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Deux droites du plan ne peuvent être que dans <strong>trois</strong> situations, que l’on reconnaît au nombre de points communs :</p>
            <ul className="space-y-1.5 text-sm text-slate-700">
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-amber-500 shrink-0" /><strong>Sécantes</strong> — exactement un point commun, le point d’intersection I.</li>
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-sky-500 shrink-0" /><strong>Strictement parallèles</strong> — aucun point commun.</li>
              <li className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-violet-500 shrink-0" /><strong>Confondues</strong> — tous leurs points en commun : c’est la même droite.</li>
            </ul>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">Jamais exactement deux points communs : deux points définissent une droite, donc deux droites qui en partagent deux sont confondues.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le point I qui disparaît d’un coup, partout, quand v prend la direction de u.</div>
          </div>
        ),
      },
      {
        id: 'regle-direction-position',
        type: 'regles',
        title: 'La direction décide, la position départage',
        summary: 'Directions différentes ⟹ sécantes. Même direction ⟹ parallèles, et confondues si en plus un point est commun.',
        visual: paralleles,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Deux questions, dans l’ordre :</p>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
              <li><strong>Même direction ?</strong> Non → sécantes. Oui → parallèles (au sens large).</li>
              <li><strong>Un point de l’une est-il sur l’autre ?</strong> Non → strictement parallèles. Oui → confondues.</li>
            </ol>
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-sm text-slate-700">Déplacer une droite parallèlement à elle-même ne change jamais le nombre de points communs — sauf quand elle tombe exactement sur l’autre.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : B déplacé dix fois, toujours « aucun point commun » — puis B sur (d₁), et toute la droite devient commune.</div>
          </div>
        ),
      },
      {
        id: 'vocab-secantes-paralleles-confondues',
        type: 'vocabulaire',
        title: 'Sécantes, parallèles, confondues',
        summary: 'Sécantes : se coupent en un point. Parallèles : même direction. Confondues : la même droite.',
        visual: confondues,
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>Sécantes</strong> : les droites se coupent ; leur point commun est le <strong>point d’intersection</strong>.</p>
            <p><strong>Parallèles</strong> : même direction. On dit <strong>strictement parallèles</strong> quand elles sont distinctes.</p>
            <p><strong>Confondues</strong> : une seule droite, décrite deux fois. Elles sont parallèles au sens large.</p>
            <p className="text-xs text-slate-500">Notation : (d₁) ∥ (d₂) pour « parallèles ».</p>
          </div>
        ),
      },
      {
        id: 'mem-trois-comptes',
        type: 'memoriser',
        title: '⭐ 1, 0 ou une infinité',
        summary: 'Sécantes : 1 point commun · strictement parallèles : 0 · confondues : une infinité.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">1 · 0 · ∞</div>
            <div className="flex justify-center gap-3 flex-wrap">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">sécantes : 1</span>
              <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full">parallèles : 0</span>
              <span className="bg-violet-100 text-violet-800 text-xs font-bold px-3 py-1 rounded-full">confondues : ∞</span>
            </div>
          </div>
        ),
      },
    ],

    /* M2 — La direction en nombres : déterminant des vecteurs directeurs, pentes, verticale. */
    2: [
      {
        id: 'critere-vecteurs-directeurs',
        type: 'regles',
        title: 'Critère de direction : le déterminant',
        summary: 'u et v vecteurs directeurs : det(u, v) = 0 ⟺ même direction ⟺ droites parallèles ou confondues.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center">
              <MathText>{'$$\\det(\\vec u, \\vec v) = u_x\\,v_y - u_y\\,v_x$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700"><strong>det = 0</strong> : u et v colinéaires, les droites ont la même direction — parallèles ou confondues. <strong>det ≠ 0</strong> : sécantes.</p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-sm text-slate-700 space-y-1">
              <div className="text-slate-400 text-xs">Exemple</div>
              <div>u(2 ; 1) et v(−4 ; −2) : 2 × (−2) − 1 × (−4) = 0 → même direction.</div>
              <div>u(2 ; 1) et v(0 ; 3) : 2 × 3 − 1 × 0 = 6 → sécantes.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le nombre qui tombe à 0 exactement quand I disparaît.</div>
          </div>
        ),
      },
      {
        id: 'critere-pentes',
        type: 'regles',
        title: 'Critère des pentes',
        summary: 'Deux droites non verticales sont parallèles (ou confondues) si et seulement si elles ont la même pente.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">La pente d’une droite dirigée par u(u_x ; u_y) est <MathText>{'$m = \\dfrac{u_y}{u_x}$'}</MathText>. Deux droites qui ont une pente sont parallèles exactement quand <strong>m₁ = m₂</strong>.</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700"><strong>Piège :</strong> une droite verticale (u_x = 0) n’a pas de pente. Pour elle, seul le déterminant (ou « les deux sont verticales ») permet de conclure.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : v = (0 ; 3), « pente : aucune », et pourtant det = 6 tranche.</div>
          </div>
        ),
      },
      {
        id: 'methode-comparer-directions',
        type: 'methodes',
        title: 'Décider avec les vecteurs directeurs',
        summary: 'Calculer det(u, v) ; si ≠ 0 : sécantes ; si = 0 : tester si un point de l’une est sur l’autre.',
        body: (
          <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
            <li>Lire un vecteur directeur de chaque droite (u et v).</li>
            <li>Calculer det(u, v) = u_x·v_y − u_y·v_x.</li>
            <li>det ≠ 0 → <strong>sécantes</strong>. Fin.</li>
            <li>det = 0 → même direction : prendre un point de (d₂) ; s’il est sur (d₁), <strong>confondues</strong>, sinon <strong>strictement parallèles</strong>.</li>
          </ol>
        ),
      },
      {
        id: 'formule-det-directions',
        type: 'formules',
        title: 'det(u, v)',
        summary: 'u_x·v_y − u_y·v_x — nul ⟺ même direction.',
        body: (
          <div className="bg-white rounded-xl border border-indigo-100 p-3 text-center space-y-1">
            <MathText>{'$$\\det(\\vec u, \\vec v) = u_x\\,v_y - u_y\\,v_x = 0 \\iff (d_1) \\parallel (d_2)$$'}</MathText>
            <div className="text-xs text-slate-500">(parallèles au sens large : strictement parallèles ou confondues)</div>
          </div>
        ),
      },
    ],

    /* M3 — Les équations : m décide, p départage ; cartésienne ⟺ réduite. */
    3: [
      {
        id: 'critere-equations-reduites',
        type: 'regles',
        title: 'Critère sur les équations réduites',
        summary: 'y = m₁x + p₁ et y = m₂x + p₂ : m₁ ≠ m₂ ⟹ sécantes ; m₁ = m₂ ⟹ parallèles, confondues si de plus p₁ = p₂.',
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>m₁ ≠ m₂</strong> → sécantes (un point commun)</div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900"><strong>m₁ = m₂ et p₁ ≠ p₂</strong> → strictement parallèles</div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900"><strong>m₁ = m₂ et p₁ = p₂</strong> → confondues (même équation)</div>
            </div>
            <p className="text-xs text-slate-500">Le coefficient directeur m EST la direction : (1 ; m) est un vecteur directeur. Les droites verticales x = k ne sont pas concernées : deux verticales sont parallèles, une verticale et une non-verticale sont sécantes.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : m₂ = 0,5 fait disparaître I quel que soit p₂ ; p₂ = 2 fait fusionner les droites.</div>
          </div>
        ),
      },
      {
        id: 'critere-equations-cartesiennes',
        type: 'regles',
        title: 'Critère sur les équations cartésiennes',
        summary: 'a₁x + b₁y + c₁ = 0 et a₂x + b₂y + c₂ = 0 : parallèles ⟺ a₁b₂ − a₂b₁ = 0.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">Un vecteur directeur de ax + by + c = 0 est (−b ; a). Le déterminant des deux vecteurs directeurs vaut <MathText>{'$a_1 b_2 - a_2 b_1$'}</MathText> :</p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$a_1 b_2 - a_2 b_1 = 0 \\iff (d_1) \\parallel (d_2)$$'}</MathText></div>
            <p className="text-sm text-slate-700">Si les <strong>trois</strong> coefficients sont proportionnels, les droites sont confondues : 2x − 4y + 8 = 0 et −x + 2y − 4 = 0 sont la même droite.</p>
          </div>
        ),
      },
      {
        id: 'methode-ramener-meme-ecriture',
        type: 'methodes',
        title: 'Comparer deux équations',
        summary: 'Ramener les deux droites à la même écriture (réduite ou cartésienne) avant de comparer m et p.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Une équation cartésienne avec b ≠ 0 se ramène à la forme réduite en isolant y :</p>
            <div className="bg-white rounded-xl border border-emerald-100 p-3"><MathText>{'$2x - 4y + 8 = 0 \\iff y = 0{,}5x + 2$'}</MathText></div>
            <p>Ensuite seulement, comparer les coefficients directeurs, puis les ordonnées à l’origine.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : deux écritures aux coefficients « différents », une seule droite.</div>
          </div>
        ),
      },
      {
        id: 'mem-m-decide-p-departage',
        type: 'memoriser',
        title: '⭐ m décide, p départage',
        summary: 'Même m : parallèles. Même m et même p : confondues. m différents : sécantes.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">m décide, p départage</div>
            <p className="text-xs text-rose-700">m₁ ≠ m₂ → sécantes · m₁ = m₂ → parallèles · et p₁ = p₂ → confondues</p>
          </div>
        ),
      },
    ],

    /* M4 — Le point d'intersection : solution du système ; 0 / 1 / ∞ solutions. */
    4: [
      {
        id: 'point-intersection-systeme',
        type: 'concepts',
        title: 'Point d’intersection et système',
        summary: 'Le point commun de deux droites sécantes est LA solution du système formé par leurs deux équations.',
        visual: secantes,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">I appartient aux deux droites : ses coordonnées vérifient <strong>les deux équations à la fois</strong>. Chercher I, c’est résoudre le système :</p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-center">
              <MathText>{'$$\\begin{cases} y = 0{,}5x + 2 \\\\ y = -x - 1 \\end{cases}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">Le dessin a des bords, les équations n’en ont pas : I existe même quand il est hors du cadre.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : I sorti du cadre ±6, ses coordonnées toujours affichées, retrouvé au dézoom.</div>
          </div>
        ),
      },
      {
        id: 'methode-resoudre-systeme',
        type: 'methodes',
        title: 'Trouver le point d’intersection',
        summary: 'Égaler les deux expressions de y, résoudre en x, puis calculer y dans l’une des équations et vérifier dans l’autre.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire m₁x + p₁ = m₂x + p₂ (les deux ordonnées sont égales en I).</li>
              <li>Rassembler les x d’un côté, les nombres de l’autre, diviser : x.</li>
              <li>Remplacer x dans une équation : y. Vérifier dans l’autre.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">Exemple</div>
              <MathText>{'$0{,}5x + 2 = -x - 1 \\iff 1{,}5x = -3 \\iff x = -2$'}</MathText>
              <div>puis y = 0,5 × (−2) + 2 = 1 ; contrôle : −(−2) − 1 = 1. I(−2 ; 1).</div>
            </div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Erreurs classiques : oublier de déplacer le terme en x (2x = … au lieu de 3x = …), oublier de diviser (1,5x = −3 n’est pas x = −3).</div>
          </div>
        ),
      },
      {
        id: 'regle-nombre-solutions',
        type: 'regles',
        title: 'Nombre de solutions et position relative',
        summary: '1 solution ⟺ sécantes ; aucune (égalité fausse) ⟺ strictement parallèles ; une infinité (égalité toujours vraie) ⟺ confondues.',
        body: (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>Une solution</strong> (x = −2) → sécantes.</div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900"><strong>Aucune solution</strong> (on aboutit à 2 = −1, faux) → strictement parallèles.</div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900"><strong>Une infinité</strong> (on aboutit à 0 = 0, toujours vrai) → confondues.</div>
            <p className="text-xs text-slate-500">Une égalité fausse n’est pas une erreur de calcul : c’est la réponse.</p>
          </div>
        ),
      },
      {
        id: 'methode-interpretation-graphique',
        type: 'methodes',
        title: 'Lire graphiquement une intersection',
        summary: 'Le point où les deux courbes se coupent a pour abscisse la solution de f(x) = g(x) ; on le lit, puis on le vérifie par le calcul.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Sur un graphique, l’abscisse du point commun est la solution de l’équation m₁x + p₁ = m₂x + p₂ ; son ordonnée est la valeur commune.</p>
            <p>Une lecture est approchée ; si le point n’est pas dans le cadre, seul le calcul le donne. Et « pas de croisement visible » ne veut pas dire « parallèles ».</p>
          </div>
        ),
      },
      {
        id: 'formule-abscisse-intersection',
        type: 'formules',
        title: 'Abscisse du point d’intersection',
        summary: 'x = (p₂ − p₁) ÷ (m₁ − m₂) quand m₁ ≠ m₂.',
        body: (
          <div className="bg-white rounded-xl border border-indigo-100 p-3 text-center space-y-1">
            <MathText>{'$$m_1 x + p_1 = m_2 x + p_2 \\iff x = \\frac{p_2 - p_1}{m_1 - m_2}\\quad (m_1 \\neq m_2)$$'}</MathText>
            <div className="text-xs text-slate-500">puis y = m₁x + p₁</div>
          </div>
        ),
      },
      {
        id: 'mem-intersection-systeme',
        type: 'memoriser',
        title: '⭐ Intersection = système',
        summary: 'Le point commun vérifie les deux équations : on égale les y, on résout, on vérifie.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">Point commun = solution du système</div>
            <p className="text-xs text-rose-700">1 solution : sécantes · 0 : parallèles · ∞ : confondues</p>
          </div>
        ),
      },
    ],

    /* M5 — Problèmes : parallèle par un point, (AB) ∥ (CD), trajectoires. */
    5: [
      {
        id: 'methode-parallele-par-un-point',
        type: 'methodes',
        title: 'Parallèle passant par un point',
        summary: 'Garder le coefficient directeur m, puis trouver p avec les coordonnées du point : y_C = m·x_C + p.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Parallèle ⟹ même m que la droite donnée.</li>
              <li>Le point C est sur la nouvelle droite : y_C = m·x_C + p, d’où p.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3"><MathText>{'$y = 2x - 3$'}</MathText>, C(1 ; 5) : 5 = 2 × 1 + p, p = 3 → <MathText>{'$y = 2x + 3$'}</MathText>.</div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">p n’est ni l’ordonnée de C, ni le p de la droite de départ.</div>
          </div>
        ),
      },
      {
        id: 'methode-ab-cd',
        type: 'methodes',
        title: 'Position de (AB) et (CD)',
        summary: 'Calculer det(AB, CD) ; s’il est nul, tester si C est sur (AB) pour départager parallèles et confondues.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Vecteurs AB et CD (arrivée − départ).</li>
              <li>det(AB, CD) ≠ 0 → sécantes.</li>
              <li>det = 0 → une équation de (AB), puis C dessus ? oui : confondues ; non : strictement parallèles.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3">A(0 ; 1), B(2 ; 4), C(−1 ; −2), D(3 ; 4) : AB(2 ; 3), CD(4 ; 6), det = 0 ; (AB) : y = 1,5x + 1 et 1,5 × (−1) + 1 ≠ −2 → strictement parallèles.</div>
          </div>
        ),
      },
      {
        id: 'methode-trajectoires',
        type: 'methodes',
        title: 'Deux trajectoires qui se croisent',
        summary: 'Modéliser chaque trajectoire par une équation de droite ; le croisement est la solution du système.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Deux mobiles qui vont tout droit ont des trajectoires rectilignes : deux équations. Leur croisement (s’il existe) est le point commun — résoudre le système donne ses coordonnées exactes, là où le dessin ne donne qu’une estimation.</p>
            <div className="bg-white rounded-xl border border-emerald-100 p-3">y = 2x − 3 et y = −x + 6 : 3x = 9, x = 3, y = 3. Croisement en (3 ; 3).</div>
          </div>
        ),
      },
    ],
  },
};
