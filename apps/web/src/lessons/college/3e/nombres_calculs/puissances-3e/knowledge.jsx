import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Puissances » (3e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * exact où le geste vient de lui donner un sens, puis il reste disponible dans
 * la carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte.
 *
 * ORDRE. Un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *   M1 la puissance, la base, l'exposant  →  M2 calculer, exposant nul,
 *   exposant négatif                      →  M3 les trois règles de calcul  →
 *   M4 les puissances de 10 et l'ordre de grandeur  →  M5 l'écriture
 *   scientifique                          →  M6 comparer et rapporter.
 * Le mot « écriture scientifique » n'apparaît donc dans aucun item des modules
 * 1 à 4, et « ordre de grandeur » dans aucun item des modules 1 à 3.
 */

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

/** La tour de blocs, figure fil rouge : un bloc = un facteur. */
const TowerFig = ({ blocks = 3, caption }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 120 110" width={120} height={110} role="img" aria-label={caption}>
      <line x1="10" y1="92" x2="110" y2="92" stroke="#94a3b8" strokeWidth="2" />
      {Array.from({ length: blocks }).map((_, i) => (
        <g key={i}>
          <rect
            x="38" y={86 - (i + 1) * 22} width="44" height="20" rx="4"
            fill="#e0f2fe" stroke="#0284c7" strokeWidth="2"
          />
          <text x="60" y={86 - (i + 1) * 22 + 14} textAnchor="middle" fontSize="11" fill="#0c4a6e">×3</text>
        </g>
      ))}
    </svg>
    <p className="text-[11px] text-slate-500 text-center">{caption}</p>
  </div>
);

/** La bande des rangs : la virgule glisse, les chiffres ne bougent pas. */
const ShiftFig = ({ caption }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 240 78" width={240} height={78} role="img" aria-label={caption}>
      <text x="120" y="24" textAnchor="middle" fontSize="16" fill="#334155" fontFamily="monospace">3 , 4 5</text>
      <path d="M120 32 L200 32" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#kmArrow)" />
      <defs>
        <marker id="kmArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 z" fill="#7c3aed" />
        </marker>
      </defs>
      <text x="160" y="26" textAnchor="middle" fontSize="10" fill="#7c3aed">4 rangs</text>
      <text x="120" y="62" textAnchor="middle" fontSize="16" fill="#334155" fontFamily="monospace">3 4 5 0 0</text>
    </svg>
    <p className="text-[11px] text-slate-500 text-center">{caption}</p>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'objet de la leçon : une écriture courte pour une multiplication
       répétée, et les deux nombres qui la composent. */
    1: [
      {
        id: 'puissance',
        type: 'concepts',
        title: 'Puissance : une multiplication répétée, écrite court',
        summary: 'Écrire le même facteur plusieurs fois de suite se note en deux nombres : celui qui se répète, et combien de fois.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\underbrace{2 \\times 2 \\times 2 \\times 2 \\times 2}_{5\\text{ facteurs}} = 2^{5} = 32$'}</MathText>
            </div>
            <p>Le gros nombre du bas est la <strong>base</strong> : celui qui se répète. Le petit
            nombre du haut est l’<strong>exposant</strong> : combien de fois il apparaît dans la
            multiplication. On lit « 2 puissance 5 ».</p>
            <p className="text-xs text-slate-500">Cinq facteurs à écrire, c’est déjà long ; dix
            plis en demanderaient dix. L’écriture courte n’est pas un caprice, c’est ce qui rend le
            calcul écrivable.</p>
            <Souvenir>la feuille pliée cinq fois, et ses 32 épaisseurs.</Souvenir>
          </div>
        ),
      },
      {
        id: 'exposant-compte',
        type: 'regles',
        title: 'L’exposant COMPTE les facteurs, il n’en est pas un',
        summary: 'a^n n’est pas a × n : l’exposant dit combien de fois multiplier, il n’entre jamais dans le calcul comme facteur.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <div><MathText>{'$2^{5} = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32$'}</MathText></div>
              <div className="text-rose-700"><MathText>{'$2 \\times 5 = 10$'}</MathText> ← ce n’est pas la même chose</div>
            </div>
            <p>Et l’ordre compte : <MathText>{'$5^{2} = 25$'}</MathText> tandis que{' '}
            <MathText>{'$2^{5} = 32$'}</MathText>. Échanger la base et l’exposant change le
            résultat.</p>
            <Souvenir>les 32 bandes dessinées sur la feuille, quand l’élève annonçait 10.</Souvenir>
          </div>
        ),
      },
    ],

    /* M2 — Ce que devient le compte quand on le fait descendre : à zéro, puis
       en dessous. Rien sur les règles de calcul, qui viennent au M3. */
    2: [
      {
        id: 'calculer-puissance',
        type: 'methodes',
        title: 'Calculer une puissance',
        summary: 'On écrit la base autant de fois que l’exposant l’indique, puis on multiplie de proche en proche.',
        body: (
          <div className="space-y-3">
            <TowerFig blocks={3} caption="3³ : trois blocs, donc trois facteurs" />
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$3^{3} = 3 \\times 3 \\times 3 = 27$'}</MathText>
            </div>
            <p>Un cran d’exposant en plus <strong>multiplie</strong> la valeur par la base — il ne
            l’augmente pas de la base. C’est pour cela que la valeur explose si vite :{' '}
            <MathText>{'$2^{10} = 1\\,024$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Cas utile : <MathText>{'$10^{4} = 10\\,000$'}</MathText>{' '}
            — quatre facteurs 10, donc quatre zéros.</p>
            <Souvenir>les puces de base et le curseur d’exposant qu’on poussait cran par cran.</Souvenir>
          </div>
        ),
      },
      {
        id: 'exposant-nul',
        type: 'regles',
        title: 'La tour vide vaut 1',
        summary: 'Pour tout nombre a non nul, a⁰ = 1 : ce n’est pas une convention gratuite, c’est la suite de la descente.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono text-sm">
              1000 → 100 → 10 → <strong>1</strong>
            </div>
            <p>Retirer un bloc <strong>divise par la base</strong>. En partant de{' '}
            <MathText>{'$10^{3} = 1000$'}</MathText>, on passe à 100, puis 10, puis 1 : la tour
            vide vaut donc <MathText>{'$10^{0} = 1$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Zéro serait absurde : une multiplication sans
            aucun facteur vaut 1, comme une addition sans aucun terme vaut 0.</p>
            <Souvenir>le dernier bloc retiré, et la tour vide qui affichait 1.</Souvenir>
          </div>
        ),
      },
      {
        id: 'exposant-negatif',
        type: 'regles',
        title: 'Un exposant négatif rend le nombre petit, pas négatif',
        summary: 'Continuer à descendre sous la tour vide, c’est continuer à diviser : a⁻ⁿ = 1 / aⁿ.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$a^{-n} = \\dfrac{1}{a^{n}} \\qquad (a \\neq 0)$'}</MathText>
            </div>
            <p>Sous le sol, deux blocs de moins veulent dire « divisé deux fois par 10 » : de 1 on
            passe à 0,1 puis à 0,01. Donc{' '}
            <MathText>{'$10^{-2} = \\frac{1}{100} = 0{,}01$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Le signe « − » vit sur l’exposant, jamais sur le
            nombre : <MathText>{'$10^{-2}$'}</MathText> est positif et petit, ce n’est pas −100.</p>
            <Souvenir>les blocs passés sous la ligne du sol, et la valeur qui devenait une fraction.</Souvenir>
          </div>
        ),
      },
    ],

    /* M3 — Les trois règles, lues sur le compte des blocs. */
    3: [
      {
        id: 'regle-produit',
        type: 'formules',
        title: 'Produit de même base : on AJOUTE les exposants',
        summary: 'Verser une tour dans une autre, c’est empiler leurs blocs — donc additionner les comptes.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$a^{m} \\times a^{n} = a^{m+n}$'}</MathText>
            </div>
            <p>2 blocs plus 3 blocs font 5 blocs, tous de base 3 :{' '}
            <MathText>{'$3^{2} \\times 3^{3} = 3^{5} = 243$'}</MathText>.</p>
            <p className="text-xs text-slate-500">La <strong>base ne bouge jamais</strong> : aucun
            bloc ne change de nature quand on fusionne. Écrire <MathText>{'$9^{5}$'}</MathText>{' '}
            reviendrait à multiplier aussi les bases.</p>
            <Souvenir>les blocs de B qui viennent se poser sur A.</Souvenir>
          </div>
        ),
      },
      {
        id: 'regle-quotient',
        type: 'formules',
        title: 'Quotient de même base : on SOUSTRAIT les exposants',
        summary: 'Diviser, c’est retirer du sommet autant de blocs que l’autre tour en contient.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$a^{m} \\div a^{n} = a^{m-n}$'}</MathText>
            </div>
            <p><MathText>{'$7^{6} \\div 7^{4} = 7^{2} = 49$'}</MathText> : six blocs moins quatre
            blocs en laissent deux.</p>
            <p className="text-xs text-slate-500">Si on enlève plus de blocs qu’il n’y en a, on
            passe sous le sol — et le résultat s’écrit avec un exposant négatif, exactement comme au
            module 2.</p>
            <Souvenir>le sommet de la tour A qui disparaissait bloc par bloc.</Souvenir>
          </div>
        ),
      },
      {
        id: 'regle-puissance-de-puissance',
        type: 'formules',
        title: 'Puissance d’une puissance : on MULTIPLIE les exposants',
        summary: 'Recopier k fois une tour de m blocs donne m × k blocs.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\left(a^{m}\\right)^{k} = a^{m \\times k}$'}</MathText>
            </div>
            <p>Deux paquets de 2 blocs font 4 blocs :{' '}
            <MathText>{'$\\left(3^{2}\\right)^{2} = 3^{4} = 81$'}</MathText>.</p>
            <p className="text-xs text-slate-500">C’est LA règle qui multiplie les exposants — pas
            celle du produit. Confondre les deux donne{' '}
            <MathText>{'$3^{2} \\times 3^{3} = 3^{6}$'}</MathText>, qui est faux.</p>
            <Souvenir>la tour recopiée une seconde fois par-dessus elle-même.</Souvenir>
          </div>
        ),
      },
    ],

    /* M4 — Les puissances de 10 : le déplacement de la virgule, puis le nom
       de l'échelle. Rien encore sur la forme normalisée (M5). */
    4: [
      {
        id: 'puissance-de-dix',
        type: 'regles',
        title: 'Multiplier par 10ⁿ fait glisser la virgule de n rangs',
        summary: 'Les chiffres ne changent pas : seule leur place par rapport à la virgule change.',
        body: (
          <div className="space-y-3">
            <ShiftFig caption="3,45 × 10⁴ = 34 500 : quatre rangs vers la droite" />
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <div><MathText>{'$3{,}45 \\times 10^{4} = 34\\,500$'}</MathText></div>
              <div><MathText>{'$3{,}45 \\times 10^{-3} = 0{,}00345$'}</MathText></div>
            </div>
            <p><strong>n &gt; 0</strong> : vers la droite, le nombre grandit.{' '}
            <strong>n &lt; 0</strong> : vers la gauche, le nombre rapetisse — mais reste positif.</p>
            <Souvenir>les chiffres 3, 4 et 5 immobiles, et la virgule qui se déplaçait sous eux.</Souvenir>
          </div>
        ),
      },
      {
        id: 'ordre-de-grandeur',
        type: 'vocabulaire',
        title: 'Ordre de grandeur',
        summary: 'L’ordre de grandeur d’un nombre est la puissance de 10 juste en dessous de lui : elle dit son échelle.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$0{,}000042 \\quad\\rightarrow\\quad 10^{-5}$'}</MathText>
            </div>
            <p>Sur la bande, chaque graduation est une puissance de 10 ; l’ordre de grandeur est la
            graduation immédiatement à gauche du nombre.</p>
            <p className="text-xs text-slate-500">C’est lui qu’on regarde EN PREMIER pour comparer
            deux nombres : <MathText>{'$2 \\times 10^{5}$'}</MathText> dépasse{' '}
            <MathText>{'$9 \\times 10^{3}$'}</MathText> bien que 9 &gt; 2, parce que deux rangs de
            virgule valent un facteur 100.</p>
            <Souvenir>la graduation tapée sur la bande, et l’écart en rangs annoncé.</Souvenir>
          </div>
        ),
      },
    ],

    /* M5 — L'écriture normalisée. */
    5: [
      {
        id: 'ecriture-scientifique',
        type: 'memoriser',
        title: '⭐ Écriture scientifique',
        summary: 'Un nombre s’écrit a × 10ⁿ avec 1 ≤ a < 10 : un seul chiffre non nul devant la virgule.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$x = a \\times 10^{n} \\quad \\text{avec} \\quad 1 \\leq a < 10$'}</MathText>
            </div>
            <p>On déplace la virgule jusqu’à n’avoir qu’un seul chiffre non nul devant elle, et
            l’exposant compte les rangs parcourus : positif si le nombre est grand, négatif s’il est
            plus petit que 1.</p>
            <div className="rounded-lg bg-white border border-slate-200 p-3 text-sm space-y-1">
              <div className="text-emerald-700">✅ <MathText>{'$3{,}8 \\times 10^{-4}$'}</MathText></div>
              <div className="text-rose-700">❌ <MathText>{'$38 \\times 10^{-5}$'}</MathText> — le coefficient dépasse 10</div>
              <div className="text-rose-700">❌ <MathText>{'$0{,}38 \\times 10^{-3}$'}</MathText> — le coefficient est plus petit que 1</div>
            </div>
            <p className="text-xs text-slate-500">Les trois valent pourtant 0,00038 : elles sont
            justes en valeur, mais une seule est l’écriture officielle. La borne 1 est incluse,
            la borne 10 ne l’est pas.</p>
            <Souvenir>le cadre qui passait de l’ambre au vert dès que le coefficient rentrait.</Souvenir>
          </div>
        ),
      },
    ],

    /* M6 — Utiliser tout cela sur des grandeurs réelles. */
    6: [
      {
        id: 'comparer-par-exposant',
        type: 'methodes',
        title: 'Comparer : l’exposant décide en premier',
        summary: 'Entre deux écritures a × 10ⁿ, on compare les exposants ; le coefficient ne départage que des exposants égaux.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$8 \\times 10^{-6} \\; < \\; 1{,}7 \\times 10^{0}$'}</MathText>
            </div>
            <p>Un globule rouge (huit millionièmes de mètre) est bien plus petit qu’un être humain,
            même si 8 &gt; 1,7 : −6 est plus petit que 0, et cela suffit à conclure.</p>
            <p className="text-xs text-slate-500">Le piège est de regarder les coefficients
            d’abord. Un rang de virgule, c’est un facteur 10 — aucun coefficient entre 1 et 10 ne
            peut le rattraper.</p>
            <Souvenir>les six objets de l’échelle, du globule à la galaxie.</Souvenir>
          </div>
        ),
      },
      {
        id: 'rapport-echelle',
        type: 'methodes',
        title: 'Combien de fois plus grand ?',
        summary: 'Le rapport de deux grandeurs est une puissance de 10 dont l’exposant est la DIFFÉRENCE des exposants.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\dfrac{10^{21}}{10^{7}} = 10^{21-7} = 10^{14}$'}</MathText>
            </div>
            <p>La Voie lactée est environ <MathText>{'$10^{14}$'}</MathText> fois plus large que la
            Terre : on divise, donc on soustrait — c’est la règle du quotient appliquée à des
            tailles réelles.</p>
            <p className="text-xs text-slate-500">Additionner les exposants donnerait{' '}
            <MathText>{'$10^{28}$'}</MathText> : c’est la règle du produit, celle qu’on emploie
            quand on multiplie deux grandeurs (aligner des bactéries, par exemple).</p>
            <Souvenir>la Terre et la galaxie mises côte à côte, exposant contre exposant.</Souvenir>
          </div>
        ),
      },
    ],
  },
};
