import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Calcul littéral » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. Réduire arrive au module 2, les identités au
 * module 3, la factorisation au module 4, le choix de la forme au module 5.
 *
 * Les modules gardent leur numérotation : le module 5 « Trois formes, trois
 * usages » est une vraie manipulation (choisir la forme adaptée), pas un
 * module de synthèse — seul son encadré « À retenir » recopié a disparu.
 */
export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le tour de magie : l'expression littérale, et l'égalité vraie
       pour tout x. */
    1: [
      {
        id: 'expression-litterale',
        type: 'concepts',
        title: 'Expression littérale',
        summary: 'Un programme de calcul écrit avec une lettre : il donne un nombre pour chaque valeur de la lettre.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              La lettre x représente <strong>n’importe quel nombre</strong>. Suivre le calcul avec x, c’est le suivre
              pour tous les nombres à la fois.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">Le tour de magie, en x</div>
              <div className="font-mono text-sm text-slate-800">x → 3x → 3x + 9 → x + 3 → 3</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le magicien qui annonce 3 sans connaître le nombre choisi.</div>
          </div>
        ),
      },
      {
        id: 'egalite-pour-tout-x',
        type: 'concepts',
        title: 'Deux écritures de la même expression',
        summary: 'Deux expressions sont égales quand elles donnent le même nombre pour TOUTE valeur de x.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <MathText>{'$(3x + 9) \\div 3 - x = 3$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">vraie pour tout x — ce n’est pas une équation à résoudre.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Toute la leçon consiste à passer d’une écriture à l’autre sans changer la valeur : réduire, développer,
              factoriser.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-tester-ne-prouve-pas',
        type: 'regles',
        title: 'Tester constate, le calcul littéral prouve',
        summary: 'Quelques essais ne couvrent jamais tous les nombres ; une lettre, si.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Trois essais réussis ne disent rien des milliards d’autres nombres. La chaîne en x montre <em>pourquoi</em>
              le résultat vaut 3 : le x réapparaît, puis on le retire.
            </p>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Réciproquement, un seul contre-exemple suffit à réfuter une égalité supposée.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Réduire : termes semblables, et le tableau de valeurs comme
       détecteur d'erreur. */
    2: [
      {
        id: 'vocab-terme-coefficient',
        type: 'vocabulaire',
        title: 'Terme, coefficient, forme',
        summary: 'Dans 3x², 3 est le coefficient et x² la forme ; seuls les termes de même forme s’empilent.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="font-mono text-slate-800">3x²</span><span className="text-xs text-slate-500">coefficient 3, forme x²</span></div>
              <div className="flex justify-between gap-3"><span className="font-mono text-slate-800">−5x</span><span className="text-xs text-slate-500">coefficient −5, forme x</span></div>
              <div className="flex justify-between gap-3"><span className="font-mono text-slate-800">2</span><span className="text-xs text-slate-500">un terme constant</span></div>
            </div>
            <p className="text-sm text-slate-600">
              Deux termes sont <strong>semblables</strong> quand ils ont la même forme.
            </p>
          </div>
        ),
      },
      {
        id: 'methode-reduire',
        type: 'methodes',
        title: 'Réduire une expression',
        summary: 'Regrouper les termes de même forme en additionnant leurs coefficients, signes compris.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <MathText>{'$3x^{2} - 5x + 2 - x^{2} + 7x - 9 = 2x^{2} + 2x - 7$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">trois piles : les x², les x, les nombres.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Un terme peut rester seul s’il n’a pas de semblable. Les coefficients peuvent être décimaux :
              −3 + 0,5 = −2,5.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les termes empilés deux à deux, et la valeur en x = 2 qui ne bougeait jamais.</div>
          </div>
        ),
      },
      {
        id: 'regle-exposants-pas-additionnes',
        type: 'regles',
        title: 'Les exposants ne s’additionnent pas',
        summary: '3x² + 2x ne se réduit pas : x² et x sont deux formes différentes.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div className="font-mono text-sm text-rose-600">3x² + 2x ≠ 5x³</div>
              <div className="text-xs text-slate-500">En x = 1 les deux valent 5, mais dès x = 2 : 16 contre 40.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Une seule valeur commune ne prouve rien. Le <strong>tableau de valeurs</strong> reste le détecteur
              d’erreur de toute la leçon : il faut un accord pour <em>toutes</em> les valeurs testées.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-reduire',
        type: 'memoriser',
        title: '⭐ On additionne les coefficients, jamais les exposants',
        summary: 'Réduire ne change que l’écriture, jamais la valeur.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <MathText>{'$3x^{2} - x^{2} = 2x^{2}$'}</MathText>
              <div className="font-mono text-sm text-rose-600">mais x² + x reste x² + x</div>
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Développer : la distributivité et les trois identités, lues sur
       des aires. */
    3: [
      {
        id: 'developper',
        type: 'concepts',
        title: 'Développer',
        summary: 'Transformer un produit en somme, en distribuant chaque terme sur chaque terme.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <MathText>{'$(x + 2)(3x - 1) = 3x^{2} - x + 6x - 2 = 3x^{2} + 5x - 2$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">deux binômes : quatre produits, puis on réduit.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le carré de côté a + b, découpé en quatre morceaux.</div>
          </div>
        ),
      },
      {
        id: 'identites-remarquables',
        type: 'formules',
        title: 'Les trois identités remarquables',
        summary: 'Les raccourcis du développement, lisibles sur des aires.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-indigo-100 p-3 space-y-2">
              <MathText>{'$$(a + b)^{2} = a^{2} + 2ab + b^{2}$$'}</MathText>
              <MathText>{'$$(a - b)^{2} = a^{2} - 2ab + b^{2}$$'}</MathText>
              <MathText>{'$$(a + b)(a - b) = a^{2} - b^{2}$$'}</MathText>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3 text-xs text-indigo-700">
              Sur le dessin : le grand carré a², les <strong>deux</strong> rectangles ab, le petit carré b². C’est le
              double produit qu’on oublie.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-carre-somme',
        type: 'memoriser',
        title: '⭐ (a + b)² n’est pas a² + b²',
        summary: 'Il manque le double produit 2ab — les deux rectangles du découpage.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <MathText>{'$(x + 3)^{2} = x^{2} + 6x + 9$'}</MathText>
              <div className="font-mono text-sm text-rose-600">et non x² + 9</div>
            </div>
            <p className="text-xs text-slate-500 text-center">x² + 9 ne s’accorde qu’en x = 0 ; dès x = 1, 16 ≠ 10.</p>
          </div>
        ),
      },
    ],

    /* M4 — Factoriser : facteur commun (nombre, monôme, binôme) et identités
       lues à l'envers. */
    4: [
      {
        id: 'factoriser',
        type: 'concepts',
        title: 'Factoriser',
        summary: 'Transformer une somme en produit — le chemin inverse du développement.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <MathText>{'$4x^{2} + 12x = 4x(x + 3)$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">le résultat est un <strong>produit</strong>.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Une écriture qui contient encore un « … + 9 » qui traîne n’est <strong>pas</strong> factorisée.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les quatre sommes, et le facteur commun à faire sortir devant.</div>
          </div>
        ),
      },
      {
        id: 'methode-facteur-commun',
        type: 'methodes',
        title: 'Chercher le facteur commun',
        summary: 'Le plus grand possible : un nombre, un monôme comme 4x, ou tout un binôme comme (x + 1).',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <MathText>{'$4x^{2} + 12x = 4x(x + 3)$'}</MathText>
              <div className="text-xs text-slate-500">4 est commun, x aussi : on sort 4x, pas seulement 4.</div>
              <div className="pt-1"><MathText>{'$(x+1)(2x-3) + (x+1)(x+4) = (x+1)(3x+1)$'}</MathText></div>
              <div className="text-xs text-slate-500">le binôme entier (x + 1) est le facteur commun.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Une factorisation se <strong>vérifie</strong> : en développant, ou au tableau de valeurs sur au moins
              trois nombres.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-identite-inverse',
        type: 'methodes',
        title: 'Reconnaître une identité à factoriser',
        summary: 'Une différence de carrés, ou un carré caché derrière trois termes.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <MathText>{'$x^{2} - 25 = (x - 5)(x + 5)$'}</MathText>
              <div className="text-xs text-slate-500">a² − b² avec a = x et b = 5.</div>
              <div className="pt-1"><MathText>{'$4x^{2} + 12x + 9 = (2x + 3)^{2}$'}</MathText></div>
              <div className="text-xs text-slate-500">4x² = (2x)², 9 = 3², et 12x = 2 × 2x × 3 : le double produit colle.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Vérifier le terme du milieu est décisif : (4x + 3)² donnerait 16x², et (2x + 9)(2x + 1) donnerait 20x.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Trois formes, trois usages : chaque forme répond à une question. */
    5: [
      {
        id: 'regle-choisir-la-forme',
        type: 'regles',
        title: 'À chaque question sa forme',
        summary: 'Développée pour A(0), factorisée pour « = 0 », carré + constante pour un extremum.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-2">
              <div className="text-slate-400 text-xs">La même expression, trois costumes</div>
              <MathText>{'$x^{2} + 2x - 3 = (x - 1)(x + 3) = (x + 1)^{2} - 4$'}</MathText>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="rounded-xl bg-white border border-orange-200 p-2.5">
                <strong>Développée</strong> — donne A(0) d’un coup : −3.
              </div>
              <div className="rounded-xl bg-white border border-orange-200 p-2.5">
                <strong>Factorisée</strong> — donne les valeurs qui annulent : 1 et −3.
              </div>
              <div className="rounded-xl bg-white border border-orange-200 p-2.5">
                <strong>Carré + constante</strong> — donne le minimum : −4, atteint en x = −1.
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la même expression, et la forme qui répondait sans calcul.</div>
          </div>
        ),
      },
      {
        id: 'regle-carre-positif',
        type: 'regles',
        title: 'Un carré n’est jamais négatif',
        summary: 'C’est ce qui fait lire un minimum sur la forme « carré + constante ».',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <MathText>{'$(x + 1)^{2} \\geq 0 \\ \\Rightarrow \\ (x + 1)^{2} - 4 \\geq -4$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">avec égalité pour x = −1 : le minimum vaut −4.</div>
            </div>
          </div>
        ),
      },
      {
        id: 'methode-prouver-egalite-formes',
        type: 'methodes',
        title: 'Vérifier que deux écritures sont la même expression',
        summary: 'Les développer toutes les deux et comparer — une valeur commune ne suffit pas.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 text-sm">
              <div className="text-emerald-700">✓ développer les deux et comparer les formes réduites</div>
              <div className="text-rose-600">✗ les tester en x = 1 seulement</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Deux formes développées identiques prouvent l’égalité pour tout x.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Démontrer et résoudre : le calcul littéral comme outil de preuve,
       et la simplification de fractions. */
    6: [
      {
        id: 'methode-demontrer-litteral',
        type: 'methodes',
        title: 'Démontrer avec le calcul littéral',
        summary: 'Écrire avec une lettre ce qui vaut pour tous les nombres, transformer, puis conclure sur la forme obtenue.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">n(n + 2) + 1 est-il toujours un carré ?</div>
              <MathText>{'$n(n+2) + 1 = n^{2} + 2n + 1 = (n + 1)^{2}$'}</MathText>
              <div className="text-xs text-slate-500">une identité reconnue : c’est un carré, pour tout n.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Le tableau de valeurs fait <strong>deviner</strong> ; le calcul littéral <strong>démontre</strong>.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les cinq lignes du tour de magie, remises dans l’ordre.</div>
          </div>
        ),
      },
      {
        id: 'methode-modeliser-aire',
        type: 'methodes',
        title: 'Modéliser une situation par une expression',
        summary: 'Nommer les dimensions par des lettres, écrire l’aire, développer pour obtenir une formule réutilisable.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">L’aire d’un cadre de 2 cm autour d’une photo L × l</div>
              <MathText>{'$(L + 4)(l + 4) - L\\ell = 4L + 4\\ell + 16$'}</MathText>
              <div className="text-xs text-slate-500">le 16, ce sont les quatre coins de 2 × 2.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Une forme développée donne une formule valable pour <strong>toutes</strong> les photos, pas une seule.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-simplifier-facteurs',
        type: 'regles',
        title: 'On simplifie des facteurs, jamais des termes',
        summary: 'Il faut d’abord factoriser — et vérifier que le dénominateur n’est pas nul.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <MathText>{'$\\dfrac{2x + 4}{x + 2} = \\dfrac{2(x + 2)}{x + 2} = 2 \\quad (x \\neq -2)$'}</MathText>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Sans factoriser d’abord, il n’y a rien à simplifier : 2x + 4 est une somme, pas un produit.
            </div>
          </div>
        ),
      },
    ],
  },
};
