import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Calcul littéral et algébrique » (3e) — SOURCE
 * UNIQUE de vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * exact où le geste vient de lui donner un sens, puis il reste disponible dans
 * la carte. Rien n'est réécrit dans les modules : la brique et la carte
 * montrent le même texte.
 *
 * ORDRE. Un item n'utilise QUE ce qui est déjà établi au module qui le
 * déclare, puisque la brique rend ce texte à sa position dans le flux :
 *   M1 l'expression et l'équivalence  →  M2 termes, facteurs, semblables  →
 *   M3 réduire et le testeur          →  M4 développer (simple puis double) →
 *   M5 les trois identités            →  M6 factoriser (facteur commun, puis
 *   identités lues à l'envers)        →  M7 choisir la forme.
 * Le mot « développer » n'apparaît donc dans aucun item des modules 1 à 3, et
 * « factoriser » dans aucun item des modules 1 à 5.
 */

/** Petit rectangle d'aire, la figure fil rouge de la leçon. */
const RectFig = ({ caption, children, width = 200, height = 120 }) => (
  <div className="space-y-1">
    <svg viewBox="0 0 200 120" role="img" aria-label={caption} style={{ maxWidth: width }} className="w-full h-auto">
      {children}
    </svg>
    <p className="text-xs text-slate-500 text-center">{caption}</p>
  </div>
);

const Souvenir = ({ children }) => (
  <div className="text-xs text-slate-400 italic">📍 Souvenir : {children}</div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — L'objet de la leçon : une écriture avec une lettre, et ce que veut
       dire « c'est la même ». Rien d'autre n'est encore nommé. */
    1: [
      {
        id: 'expression-litterale',
        type: 'concepts',
        title: 'Expression littérale',
        summary: 'Une écriture qui contient une lettre et qui calcule un nombre dès qu’on donne une valeur à cette lettre.',
        body: (
          <div className="space-y-3">
            <p>Une <strong>expression littérale</strong> est une machine à calculer : donne-lui une
            valeur de la lettre, elle rend un nombre.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono">
              n = 2 &nbsp;→&nbsp; <MathText>{'$4n + 4$'}</MathText> &nbsp;→&nbsp; 12
            </div>
            <p className="text-xs text-slate-500">Le signe × est sous-entendu :{' '}
            <MathText>{'$4n$'}</MathText> se lit « 4 multiplié par n », jamais « quarante-quatre ».
            Et on multiplie avant d’ajouter.</p>
            <Souvenir>la bordure de dalles autour du jardin de Maya.</Souvenir>
          </div>
        ),
      },
      {
        id: 'meme-expression',
        type: 'concepts',
        title: 'Deux écritures, une seule expression',
        summary: 'Deux écritures sont la même expression quand elles donnent le même nombre pour TOUTE valeur de la lettre.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$4n + 4 = 4(n + 1) = (n+2)^{2} - n^{2}$'}</MathText>
            </div>
            <p>Trois façons de compter les mêmes dalles, un seul nombre de dalles. Ces écritures ne
            se ressemblent pas, mais elles décrivent la <strong>même quantité</strong>.</p>
            <p className="text-xs text-slate-500">« Pour toute valeur » est le mot important : on
            n’a pas le droit de conclure après une seule valeur essayée.</p>
            <Souvenir>le tableau où les trois colonnes tombaient ligne après ligne.</Souvenir>
          </div>
        ),
      },
    ],

    /* M2 — Le vocabulaire du geste : ce qu'on additionne, ce qu'on multiplie,
       ce qui s'empile. */
    2: [
      {
        id: 'terme',
        type: 'vocabulaire',
        title: 'Terme',
        summary: 'Les termes d’une expression sont les morceaux qu’on ADDITIONNE — chacun emporte son signe.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$3x^{2} + 5x - 2x + 7$'}</MathText>
            </div>
            <p>Quatre <strong>termes</strong> : <MathText>{'$3x^{2}$'}</MathText>,{' '}
            <MathText>{'$5x$'}</MathText>, <MathText>{'$-2x$'}</MathText> et{' '}
            <MathText>{'$7$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Le signe fait partie du terme :{' '}
            <MathText>{'$-2x$'}</MathText> est un terme, pas <MathText>{'$2x$'}</MathText>. Un
            signe tout seul n’est jamais un terme.</p>
            <Souvenir>les quatre cartes touchées une par une.</Souvenir>
          </div>
        ),
      },
      {
        id: 'facteur',
        type: 'vocabulaire',
        title: 'Facteur',
        summary: 'Les facteurs sont les morceaux qu’on MULTIPLIE à l’intérieur d’un terme.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$5x = 5 \\times x$'}</MathText>
            </div>
            <p><MathText>{'$5$'}</MathText> et <MathText>{'$x$'}</MathText> sont les{' '}
            <strong>facteurs</strong> de <MathText>{'$5x$'}</MathText>. Le nombre placé devant la
            lettre s’appelle le <strong>coefficient</strong>.</p>
            <p className="text-xs text-slate-500">Deux mots à ne jamais confondir : on additionne
            des <strong>termes</strong>, on multiplie des <strong>facteurs</strong>.</p>
            <Souvenir>les petites cases ouvertes sous la carte 5x.</Souvenir>
          </div>
        ),
      },
      {
        id: 'termes-semblables',
        type: 'regles',
        title: 'Termes semblables',
        summary: 'Deux termes sont semblables quand ils portent la même partie littérale — la même forme de tuile.',
        visual: (
          <RectFig caption="Une tuile x et une tuile 1 ne s’empilent pas">
            <rect x="14" y="26" width="60" height="20" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" rx="3" />
            <rect x="14" y="52" width="60" height="20" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" rx="3" />
            <text x="44" y="92" textAnchor="middle" fontSize="12" fill="#0c4a6e">deux tuiles x</text>
            <text x="100" y="58" textAnchor="middle" fontSize="16" fill="#64748b">vs</text>
            <rect x="132" y="26" width="20" height="20" fill="#fde68a" stroke="#d97706" strokeWidth="2" rx="3" />
            <rect x="132" y="52" width="60" height="20" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" rx="3" />
            <text x="160" y="92" textAnchor="middle" fontSize="12" fill="#78350f">formes différentes</text>
          </RectFig>
        ),
        body: (
          <div className="space-y-3">
            <p>Seuls des <strong>termes semblables</strong> se regroupent en un seul terme : on
            ajoute alors leurs coefficients, et la lettre ne change pas.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$5x - 2x = 3x$'}</MathText>
              <span className="text-slate-400 mx-3">mais</span>
              <MathText>{'$3x + 2$'}</MathText> ne se regroupe pas
            </div>
            <p className="text-xs text-slate-500"><MathText>{'$x^{2}$'}</MathText> et{' '}
            <MathText>{'$x$'}</MathText> ne sont pas semblables non plus : un carré n’est pas un
            bâton.</p>
            <Souvenir>l’empilement refusé, les tuiles restées côte à côte.</Souvenir>
          </div>
        ),
      },
    ],

    /* M3 — Le geste de rangement, et l'outil qui juge une écriture. */
    3: [
      {
        id: 'reduire',
        type: 'methodes',
        title: 'Réduire une expression',
        summary: 'Réduire, c’est regrouper tous les termes semblables jusqu’à n’en garder qu’un par forme.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$5x - 8 - 2x + 3 = 3x - 5$'}</MathText>
            </div>
            <p>On fait une pile par forme de tuile : les <MathText>{'$x$'}</MathText> ensemble
            (<MathText>{'$5x - 2x = 3x$'}</MathText>), les nombres ensemble
            (<MathText>{'$-8 + 3 = -5$'}</MathText>).</p>
            <p className="text-xs text-slate-500">Réduire est un <strong>rangement</strong>, pas un
            calcul : la quantité est la même pour toute valeur de x. Le piège classique est de
            perdre un signe en route.</p>
            <Souvenir>les quatre cartes ramenées à deux piles.</Souvenir>
          </div>
        ),
      },
      {
        id: 'regle-testeur',
        type: 'memoriser',
        title: '⭐ Une valeur ne prouve rien',
        summary: 'Une valeur qui s’accorde ne démontre pas l’égalité ; une seule valeur qui diffère la réfute pour de bon.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2">
            <div className="text-center font-black text-rose-700">
              une valeur d’accord → rien &nbsp;·&nbsp; une valeur qui diffère → c’est faux
            </div>
            <p className="text-xs text-rose-800">
              <MathText>{'$3x + 2$'}</MathText> et <MathText>{'$5x$'}</MathText> valent tous les
              deux 5 pour <MathText>{'$x = 1$'}</MathText>… et 8 contre 10 pour{' '}
              <MathText>{'$x = 2$'}</MathText>. Le tableau de valeurs ne sert donc pas à confirmer
              une écriture : il sert à attraper les fausses.
            </p>
            <p className="text-xs text-rose-700">Deux valeurs au minimum, toujours.</p>
          </div>
        ),
      },
      {
        id: 'signe-parenthese',
        type: 'regles',
        title: 'Le moins devant une parenthèse',
        summary: 'Un signe − devant une parenthèse change le signe de CHACUN des termes qu’elle contient.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$-(x - 4) = -x + 4$'}</MathText>
            </div>
            <p>Ce signe − est un facteur <MathText>{'$-1$'}</MathText> qui touche{' '}
            <strong>les deux</strong> termes : <MathText>{'$-1 \\times x = -x$'}</MathText> et{' '}
            <MathText>{'$-1 \\times (-4) = +4$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Le piège <MathText>{'$-x - 4$'}</MathText> se
            démasque avec <MathText>{'$x = 0$'}</MathText> : à gauche{' '}
            <MathText>{'$-(0-4) = 4$'}</MathText>, à droite <MathText>{'$-4$'}</MathText>.</p>
            <Souvenir>le testeur appliqué à une parenthèse, pas seulement à une somme.</Souvenir>
          </div>
        ),
      },
    ],

    /* M4 — Le geste signature : découper le rectangle. */
    4: [
      {
        id: 'developper',
        type: 'concepts',
        title: 'Développer',
        summary: 'Développer, c’est passer d’un produit à la somme des morceaux du rectangle.',
        visual: (
          <RectFig caption="3(x + 2) : deux morceaux, 3x et 6">
            <rect x="20" y="30" width="110" height="55" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <rect x="130" y="30" width="45" height="55" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <text x="75" y="63" textAnchor="middle" fontSize="15" fill="#065f46">3x</text>
            <text x="152" y="63" textAnchor="middle" fontSize="15" fill="#78350f">6</text>
            <text x="75" y="22" textAnchor="middle" fontSize="12" fill="#475569">x</text>
            <text x="152" y="22" textAnchor="middle" fontSize="12" fill="#475569">2</text>
            <text x="10" y="62" textAnchor="middle" fontSize="12" fill="#475569">3</text>
          </RectFig>
        ),
        body: (
          <div className="space-y-3">
            <p>L’aire d’un rectangle vaut le <strong>produit</strong> de ses côtés — et aussi la{' '}
            <strong>somme</strong> des aires de ses morceaux. C’est la même aire, donc la même
            expression.</p>
            <p className="text-xs text-slate-500">Un morceau oublié se voit : il reste gris dans
            l’image, et le tableau de valeurs le trahit.</p>
            <Souvenir>le parterre coupé le long de x + 2.</Souvenir>
          </div>
        ),
      },
      {
        id: 'distributivite-simple',
        type: 'formules',
        title: 'Distributivité simple',
        summary: 'Le facteur devant la parenthèse multiplie chaque terme de la parenthèse.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$k(a + b) = ka + kb$'}</MathText>
            </div>
            <p>Exemple : <MathText>{'$4(2x - 3) = 8x - 12$'}</MathText> — le 4 touche{' '}
            <strong>chaque</strong> terme, signe compris.</p>
            <p className="text-xs text-slate-500">L’erreur <MathText>{'$8x - 3$'}</MathText> laisse
            un morceau du rectangle non compté.</p>
            <Souvenir>le morceau hachuré qu’il fallait compter lui aussi.</Souvenir>
          </div>
        ),
      },
      {
        id: 'double-distributivite',
        type: 'formules',
        title: 'Double distributivité',
        summary: 'Quand les deux côtés sont des sommes, le rectangle a quatre morceaux — donc quatre produits.',
        visual: (
          <RectFig caption="(x + 3)(x + 2) : quatre cases">
            <rect x="30" y="20" width="90" height="45" fill="#c7d2fe" stroke="#4338ca" strokeWidth="2" />
            <rect x="120" y="20" width="55" height="45" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <rect x="30" y="65" width="90" height="35" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <rect x="120" y="65" width="55" height="35" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <text x="75" y="47" textAnchor="middle" fontSize="13" fill="#312e81">x²</text>
            <text x="147" y="47" textAnchor="middle" fontSize="13" fill="#065f46">2x</text>
            <text x="75" y="88" textAnchor="middle" fontSize="13" fill="#065f46">3x</text>
            <text x="147" y="88" textAnchor="middle" fontSize="13" fill="#78350f">6</text>
          </RectFig>
        ),
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$(a + b)(c + d) = ac + ad + bc + bd$'}</MathText>
            </div>
            <p>Chaque terme d’un côté rencontre chaque terme de l’autre :{' '}
            <MathText>{'$(x + 3)(x + 2) = x^{2} + 2x + 3x + 6 = x^{2} + 5x + 6$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Deux cases sur quatre, et l’on obtient l’erreur{' '}
            <MathText>{'$x^{2} + 6$'}</MathText> : les deux bandes de x dorment encore.</p>
            <Souvenir>les deux côtés séparés, les quatre morceaux comptés.</Souvenir>
          </div>
        ),
      },
    ],

    /* M5 — Les trois identités, comme trois découpages. */
    5: [
      {
        id: 'identite-remarquable',
        type: 'concepts',
        title: 'Identité remarquable',
        summary: 'Un développement si fréquent qu’on le reconnaît d’un coup d’œil, dans les deux sens.',
        body: (
          <div className="space-y-3">
            <p>Une <strong>identité remarquable</strong> n’est pas une règle de plus : c’est une
            double distributivité qu’on rencontre partout, et qu’on finit par lire sans la
            recalculer.</p>
            <p className="text-xs text-slate-500">Elle se lit aussi bien du produit vers la somme
            que dans l’autre sens — c’est ce qui la rend si utile.</p>
            <Souvenir>le carré découpé en quatre morceaux.</Souvenir>
          </div>
        ),
      },
      {
        id: 'carre-somme',
        type: 'formules',
        title: 'Le carré d’une somme',
        summary: '(a + b)² = a² + 2ab + b² — quatre morceaux, jamais deux.',
        visual: (
          <RectFig caption="Le carré de côté a + b : a², deux fois ab, b²">
            <rect x="35" y="15" width="80" height="55" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="2" />
            <rect x="115" y="15" width="45" height="55" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
            <rect x="35" y="70" width="80" height="35" fill="#fbcfe8" stroke="#db2777" strokeWidth="2" />
            <rect x="115" y="70" width="45" height="35" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
            <text x="75" y="47" textAnchor="middle" fontSize="14" fill="#4c1d95">a²</text>
            <text x="137" y="47" textAnchor="middle" fontSize="13" fill="#831843">ab</text>
            <text x="75" y="92" textAnchor="middle" fontSize="13" fill="#831843">ab</text>
            <text x="137" y="92" textAnchor="middle" fontSize="13" fill="#78350f">b²</text>
          </RectFig>
        ),
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$(a + b)^{2} = a^{2} + 2ab + b^{2}$'}</MathText>
            </div>
            <p>Les deux rectangles <MathText>{'$ab$'}</MathText> sont exactement ce qui manque à
            l’erreur <MathText>{'$a^{2} + b^{2}$'}</MathText> — l’erreur la plus répandue du
            collège.</p>
            <p className="text-xs text-slate-500">Pour a = 3 et b = 2 : 25 contre 13, il manque
            12, soit <MathText>{'$2ab$'}</MathText>.</p>
            <Souvenir>les deux coins restés gris tant qu’on ne les comptait pas.</Souvenir>
          </div>
        ),
      },
      {
        id: 'difference-carres',
        type: 'formules',
        title: 'La différence de deux carrés',
        summary: 'a² − b² = (a + b)(a − b) : on retire un carré, et le reste se recolle en rectangle.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$a^{2} - b^{2} = (a + b)(a - b)$'}</MathText>
            </div>
            <p>Le morceau qui glisse ne change ni l’aire ni la quantité : seule la forme change.
            Le résultat est un <strong>rectangle</strong> de côtés{' '}
            <MathText>{'$a + b$'}</MathText> et <MathText>{'$a - b$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Ce n’est donc <strong>pas</strong>{' '}
            <MathText>{'$(a - b)^{2}$'}</MathText> : ce rectangle n’est pas un carré.</p>
            <Souvenir>le glissement du morceau découpé.</Souvenir>
          </div>
        ),
      },
      {
        id: 'carre-difference',
        type: 'formules',
        title: 'Le carré d’une différence',
        summary: '(a − b)² = a² − 2ab + b² — le même découpage, avec −b à la place de b.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$(a - b)^{2} = a^{2} - 2ab + b^{2}$'}</MathText>
            </div>
            <p>C’est <MathText>{'$(a + (-b))^{2}$'}</MathText> : les deux rectangles deviennent{' '}
            <MathText>{'$-ab$'}</MathText> chacun, et{' '}
            <MathText>{'$(-b)^{2} = +b^{2}$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Test avec a = 5 et b = 2 :{' '}
            <MathText>{'$3^{2} = 9$'}</MathText> et{' '}
            <MathText>{'$25 - 20 + 4 = 9$'}</MathText>.</p>
            <Souvenir>le même carré, un signe changé.</Souvenir>
          </div>
        ),
      },
      {
        id: 'mem-trois-identites',
        type: 'memoriser',
        title: '⭐ Les trois identités',
        summary: 'Trois découpages à reconnaître d’un coup d’œil, dans les deux sens.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-1.5 text-center">
            <p><MathText>{'$(a + b)^{2} = a^{2} + 2ab + b^{2}$'}</MathText></p>
            <p><MathText>{'$(a - b)^{2} = a^{2} - 2ab + b^{2}$'}</MathText></p>
            <p><MathText>{'$(a + b)(a - b) = a^{2} - b^{2}$'}</MathText></p>
            <p className="text-xs text-rose-700 pt-1">Le terme du milieu vaut toujours{' '}
            <MathText>{'$2 \\times a \\times b$'}</MathText> : c’est lui qui décide.</p>
          </div>
        ),
      },
    ],

    /* M6 — Le chemin inverse. */
    6: [
      {
        id: 'factoriser',
        type: 'concepts',
        title: 'Factoriser',
        summary: 'Factoriser, c’est écrire une somme sous forme de produit — retrouver les côtés du rectangle à partir de ses morceaux.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$6x + 9 = 3(2x + 3)$'}</MathText>
            </div>
            <p>C’est exactement le geste du module 4, lu à l’envers : on part des morceaux, on
            retrouve les côtés.</p>
            <p className="text-xs text-slate-500">La vérification est gratuite : redéveloppe le
            produit obtenu, tu dois retomber sur la somme de départ.</p>
            <Souvenir>le rectangle reconstruit à partir de 6x et 9.</Souvenir>
          </div>
        ),
      },
      {
        id: 'facteur-commun',
        type: 'methodes',
        title: 'Le facteur commun',
        summary: 'Un facteur présent dans TOUS les termes sort de la somme et devient un côté du rectangle.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono text-sm">
              6x = 2 × <strong>3</strong> × x &nbsp;·&nbsp; 9 = <strong>3</strong> × 3
            </div>
            <p>Le 3 est dans les deux termes : il devient la hauteur, et ce qui reste —{' '}
            <MathText>{'$2x + 3$'}</MathText> — devient la largeur.</p>
            <p className="text-xs text-slate-500">Le piège <MathText>{'$3(2x + 9)$'}</MathText> n’a
            divisé qu’un terme sur deux : deux valeurs testées suffisent à le démasquer.</p>
            <Souvenir>le 3 touché dans chacune des deux cartes.</Souvenir>
          </div>
        ),
      },
      {
        id: 'factoriser-par-identite',
        type: 'methodes',
        title: 'Factoriser en reconnaissant une identité',
        summary: 'Sans facteur commun, on cherche la forme d’une identité — et on la lit de droite à gauche.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center space-y-1">
              <p><MathText>{'$x^{2} - 25 = (x + 5)(x - 5)$'}</MathText></p>
              <p><MathText>{'$x^{2} + 6x + 9 = (x + 3)^{2}$'}</MathText></p>
            </div>
            <p>Deux carrés séparés par un moins : c’est une différence de deux carrés. Trois
            termes dont deux sont des carrés : on vérifie le terme du milieu —{' '}
            <MathText>{'$2 \\times x \\times 3 = 6x$'}</MathText> ✓.</p>
            <p className="text-xs text-slate-500">C’est le test du terme central qui tranche entre{' '}
            <MathText>{'$(x + 3)^{2}$'}</MathText> et <MathText>{'$(x + 9)^{2}$'}</MathText>.</p>
            <Souvenir>le carré de côté x + 3, reconstitué à partir de ses quatre morceaux.</Souvenir>
          </div>
        ),
      },
    ],

    /* M7 — Le choix, qui suppose les trois gestes connus. */
    7: [
      {
        id: 'produit-nul-forme',
        type: 'regles',
        title: 'Un produit nul',
        summary: 'Un produit vaut 0 dès que l’un de ses facteurs vaut 0 — c’est la forme factorisée qui le montre.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$A \\times B = 0 \\Longrightarrow A = 0 \\text{ ou } B = 0$'}</MathText>
            </div>
            <p>Devant <MathText>{'$(x + 3)(x - 5)$'}</MathText>, la forme factorisée met les
            facteurs sous les yeux ; la développer les casserait.</p>
            <p className="text-xs text-slate-500">Cette leçon donne la bonne <strong>écriture</strong> ;
            trouver les valeurs de x et rédiger la résolution est le sujet d’une autre leçon.</p>
            <Souvenir>la forme qu’il fallait garder, pas transformer.</Souvenir>
          </div>
        ),
      },
      {
        id: 'choisir-la-forme',
        type: 'memoriser',
        title: '⭐ La question décide de l’écriture',
        summary: 'Développée pour calculer, factorisée pour annuler, réduite pour comparer.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2">
            <ul className="text-sm text-rose-900 space-y-1">
              <li><strong>Calculer une valeur</strong> → la forme la plus simple à évaluer, souvent
              la développée (surtout si un nombre rond apparaît).</li>
              <li><strong>Annuler l’expression</strong> → la factorisée : un produit est nul dès
              qu’un facteur l’est.</li>
              <li><strong>Comparer ou lire une aire</strong> → la réduite.</li>
            </ul>
            <p className="text-xs text-rose-700">Aucune écriture n’est « la bonne » dans l’absolu :
            c’est la question qui tranche, pas l’habitude.</p>
          </div>
        ),
      },
    ],
  },
};
