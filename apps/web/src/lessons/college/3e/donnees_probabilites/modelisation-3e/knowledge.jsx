import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Modélisation » (3e) — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où le geste vient de lui donner du sens, puis il reste dans la carte. Rien
 * n'est réécrit dans les modules : la brique et la carte montrent le même
 * texte.
 *
 * ORDRE. Un item n'utilise que ce qui est déjà établi au module qui le
 * déclare : « modèle » (M1) avant « variable » nommée (M2), la variable avant
 * le tableau et le graphique (M3), les représentations avant les familles de
 * modèles (M3), les familles avant « les données choisissent » (M4), tout cela
 * avant l'expression littérale (M5), et l'expression avant le domaine de
 * validité (M6). Un exemple qui anticiperait un module ultérieur serait un
 * spoiler visible à l'écran, puisque la brique rend ce texte à sa position.
 *
 * CE QUI EST SUPPOSÉ ACQUIS (lesson.config.js → priorKnowledge, diagnostiqué
 * par le module 0) : proportionnalité, fonction et notation f(x), image,
 * fonction linéaire, calcul littéral, équation du premier degré. Le mot
 * « affine » n'est PAS supposé : cette leçon en fait une famille de MODÈLES,
 * et il est posé par une brique au module 3, avant toute question qui l'exige.
 */

/** Trois nuages : par l'origine, avec une part fixe, en carré. */
const familiesVisual = (
  <div className="flex flex-wrap justify-center gap-2">
    <MiniGraph
      width={130} height={110} xMin={0} xMax={5} yMin={0} yMax={12}
      functions={[{ fn: (x) => 2 * x, color: '#0891b2' }]}
      points={[{ x: 0, y: 0 }, { x: 2, y: 4 }, { x: 4, y: 8 }]}
    />
    <MiniGraph
      width={130} height={110} xMin={0} xMax={5} yMin={0} yMax={12}
      functions={[{ fn: (x) => 1.5 * x + 4, color: '#4f46e5' }]}
      points={[{ x: 0, y: 4 }, { x: 2, y: 7 }, { x: 4, y: 10 }]}
    />
    <MiniGraph
      width={130} height={110} xMin={0} xMax={4} yMin={0} yMax={12}
      functions={[{ fn: (x) => x * x, color: '#be123c' }]}
      points={[{ x: 1, y: 1 }, { x: 2, y: 4 }, { x: 3, y: 9 }]}
    />
  </div>
);

/** La droite du modèle, puis le plafond : au-delà, le modèle ne dit plus rien. */
const domainVisual = (
  <MiniGraph
    width={230} height={150} xMin={0} xMax={70} yMin={0} yMax={12}
    functions={[
      { fn: (t) => 0.15 * t + 1, color: '#4f46e5', dashed: true },
      { fn: () => 8, color: '#be123c', domain: [46.7, 70] },
    ]}
    bands={[{ from: 0, to: 46.7, color: '#10b981', opacity: 0.12 }]}
    guides={[{ x: 46.7, color: '#be123c' }]}
  />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le laboratoire : modéliser, et ce qu'un modèle doit à SES données. */
    1: [
      {
        id: 'modeliser',
        type: 'concepts',
        title: 'Modéliser',
        summary: 'Modéliser, c’est traduire une situation réelle en une règle mathématique pour pouvoir raisonner dessus — puis revenir au réel.',
        body: (
          <div className="space-y-3">
            <p>Un <strong>modèle</strong> est une règle qui raconte les données d’une
            situation : la même règle vaut pour toutes, y compris pour des cas qu’on n’a
            jamais observés.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono text-sm">
              situation réelle &nbsp;→&nbsp; [ règle ] &nbsp;→&nbsp; prévision
            </div>
            <p className="text-xs text-slate-500">Un modèle n’est pas la réalité : c’est une
            traduction. On s’en sert pour prévoir, puis on revient à la situation pour vérifier
            que la prévision a un sens.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois tickets de
            trottinette — une seule règle les racontait tous les trois.</div>
          </div>
        ),
      },
      {
        id: 'informations-utiles',
        type: 'methodes',
        title: 'Trier les informations',
        summary: 'Une information est utile si elle intervient dans la question posée ; tout le reste est du décor.',
        body: (
          <div className="space-y-2">
            <p>Une situation réelle est toujours encombrée. Avant de calculer, on écarte ce qui
            <strong> ne change rien à la question</strong>.</p>
            <p className="text-xs text-slate-500">Une même information peut être utile pour une
            question et inutile pour une autre : c’est la question qui décide, pas l’énoncé.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la couleur, l’autonomie,
            l’heure de départ et le poids sont partis au bac « inutile ».</div>
          </div>
        ),
      },
      {
        id: 'mem-toutes-les-donnees',
        type: 'memoriser',
        title: '⭐ Un modèle doit être d’accord avec TOUTES les données',
        summary: 'Une règle qui tombe juste sur une donnée mais rate les autres n’est pas un modèle.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">Toutes les données, pas une</div>
            <p className="text-xs text-rose-700">On teste une règle candidate sur chaque donnée.
            Un seul désaccord suffit à l’éliminer.</p>
          </div>
        ),
      },
    ],

    /* M2 — Ce qu'on choisit, ce qui en dépend, et l'écriture qui répond. */
    2: [
      {
        id: 'variable-modele',
        type: 'vocabulaire',
        title: 'Variable et grandeur qui en dépend',
        summary: 'La variable est la grandeur qu’on choisit ; l’autre grandeur en dépend et se calcule à partir d’elle.',
        body: (
          <div className="space-y-3">
            <p>Dans une situation, une <strong>grandeur</strong> est ce qui se mesure : une
            durée, un prix, un volume, une longueur.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center font-mono text-sm">
              <span className="text-indigo-800 font-bold">durée</span>
              <span className="text-slate-400"> (je choisis) → </span>
              <span className="text-emerald-700 font-bold">prix</span>
              <span className="text-slate-400"> (j’en déduis)</span>
            </div>
            <p>La <strong>variable</strong> est celle qu’on fait varier librement ; l’autre en
            <strong> dépend</strong>. Une grandeur qui ne change pas d’un cas à l’autre est un
            nombre fixe de la situation, pas une variable.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le poids de la trottinette
            ne bouge jamais — il n’entre pas dans la relation.</div>
          </div>
        ),
      },
      {
        id: 'choisir-representation',
        type: 'methodes',
        title: 'Choisir la représentation',
        summary: 'La question décide de l’écriture : une valeur précise → la formule ; plusieurs valeurs → le tableau ; une allure ou un croisement → le graphique.',
        body: (
          <div className="space-y-2">
            <ul className="space-y-1 text-sm">
              <li><strong>Formule</strong> : « combien pour 37 ? » — un calcul direct.</li>
              <li><strong>Tableau</strong> : « pour 0, 1, 2, 3, 4 ? » — plusieurs valeurs alignées.</li>
              <li><strong>Graphique</strong> : « comment ça évolue ? », « où les deux se
              croisent-elles ? » — une forme se voit d’un coup d’œil.</li>
            </ul>
            <p className="text-xs text-slate-500">Les trois écritures restent vraies en même
            temps : aucune n’est « la bonne » dans l’absolu, seulement la plus utile ici.</p>
          </div>
        ),
      },
    ],

    /* M3 — Le modèle, écrit trois fois ; et les familles reconnues à leur forme. */
    3: [
      {
        id: 'tableau-de-valeurs',
        type: 'methodes',
        title: 'Le tableau de valeurs',
        summary: 'Chaque colonne d’un tableau de valeurs est un calcul complet de la règle, pour une valeur de la variable.',
        body: (
          <div className="space-y-2">
            <p>On choisit des valeurs de la variable, et on applique la règle à chacune : le
            <strong> tableau de valeurs</strong> range les résultats côte à côte.</p>
            <p className="text-xs text-slate-500">Un tableau ne remplace pas la règle : il en
            montre quelques cas. La règle, elle, répond pour n’importe quelle valeur.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : t = 0, 4, 8, 12 pour le
            réservoir — 60, 40, 20, 0 litres.</div>
          </div>
        ),
      },
      {
        id: 'representation-graphique',
        type: 'methodes',
        title: 'La représentation graphique',
        summary: 'Chaque ligne du tableau devient un point du repère : le graphique est le tableau, dessiné.',
        body: (
          <div className="space-y-2">
            <p>Une valeur de la variable en <strong>abscisse</strong>, le résultat en
            <strong> ordonnée</strong> : chaque couple donne un point. La
            <strong> représentation graphique</strong> du modèle est l’ensemble de ces points.</p>
            <p className="text-xs text-slate-500">On y lit sans calculer : un résultat pour une
            valeur donnée, ou la valeur qui donne un résultat voulu — par exemple l’instant où la
            courbe touche l’axe horizontal.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : quatre points posés, et
            la droite descendait jusqu’à t = 12.</div>
          </div>
        ),
      },
      {
        id: 'familles-modeles',
        type: 'regles',
        title: 'Trois familles de modèles',
        summary: 'La forme du nuage dit la famille : droite par l’origine → proportionnel ; droite avec une part fixe → affine ; croissance en carré → modèle en x².',
        visual: familiesVisual,
        body: (
          <div className="space-y-3">
            <ul className="space-y-1 text-sm">
              <li><strong>Proportionnel</strong> : <MathText>{'$y = k \\times x$'}</MathText> —
              points alignés <em>et</em> passant par l’origine (pour 0, on obtient 0).</li>
              <li><strong>Affine</strong> : <MathText>{'$y = a \\times x + b$'}</MathText> —
              points alignés, mais la droite coupe l’axe vertical en <MathText>{'$b$'}</MathText>,
              la <strong>part fixe</strong> : ce qu’on a déjà pour 0.</li>
              <li><strong>En carré</strong> : <MathText>{'$y = c \\times x^2$'}</MathText> — pas
              de droite possible ; la courbe monte de plus en plus vite.</li>
            </ul>
            <p className="text-xs text-slate-500">Un modèle proportionnel est un modèle affine
            dont la part fixe est nulle : c’est le cas particulier <MathText>{'$b = 0$'}</MathText>.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la droite du réservoir
            partait de 60 L, pas de l’origine.</div>
          </div>
        ),
      },
      {
        id: 'sens-de-variation',
        type: 'vocabulaire',
        title: 'Croissant ou décroissant',
        summary: 'Un modèle est croissant si le résultat augmente quand la variable augmente, décroissant s’il diminue.',
        body: (
          <div className="space-y-2">
            <p>Sur le graphique, cela se voit d’un coup d’œil : la courbe <strong>monte</strong>
            (croissante) ou <strong>descend</strong> (décroissante) quand on va vers la droite.</p>
            <p className="text-xs text-slate-500">Pour un modèle affine
            <MathText>{' $y = a \\times x + b$'}</MathText>, c’est le signe de
            <MathText>{' $a$'}</MathText> qui décide : positif, ça monte ; négatif, ça descend.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : −5 L par minute — le
            réservoir se vide, la droite descend.</div>
          </div>
        ),
      },
    ],

    /* M4 — Ce sont les données qui choisissent, et « aucun » est une réponse. */
    4: [
      {
        id: 'modele-choisi-par-donnees',
        type: 'regles',
        title: 'Les données choisissent le modèle',
        summary: 'On ne choisit pas une famille par goût : on la choisit parce que ses paramètres peuvent être réglés pour toucher tous les points.',
        body: (
          <div className="space-y-2">
            <p>Une famille de modèles a des <strong>paramètres</strong> —
            <MathText>{' $k$'}</MathText>, <MathText>{'$a$'}</MathText>,
            <MathText>{' $b$'}</MathText>, <MathText>{'$c$'}</MathText> — qu’on règle. Le bon
            modèle est celui dont un réglage annule l’écart à <strong>tous</strong> les points.</p>
            <p className="text-xs text-slate-500">Un seul point suffit parfois à trancher : une
            donnée non nulle pour 0 exclut d’emblée toute la famille proportionnelle.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : (0 Go ; 5 €) — aucune
            droite par l’origine ne pouvait passer là.</div>
          </div>
        ),
      },
      {
        id: 'aucun-modele-simple',
        type: 'concepts',
        title: '« Aucun modèle simple » est une réponse',
        summary: 'Quand aucune famille ne colle aux données, le dire est une conclusion honnête — pas un échec.',
        body: (
          <div className="space-y-2">
            <p>Certaines données ne suivent aucune règle simple : elles montent puis
            redescendent, ou varient sans régularité.</p>
            <p className="text-xs text-slate-500">Un modèle « à peu près », qui rate trois points
            sur quatre, n’est pas un modèle : il donnerait des prévisions fausses avec l’aplomb
            d’un calcul juste.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la température de la
            journée — ni droite, ni parabole.</div>
          </div>
        ),
      },
    ],

    /* M5 — L'écriture la plus compacte, ses paramètres, et le cycle nommé. */
    5: [
      {
        id: 'expression-du-modele',
        type: 'formules',
        title: 'L’expression littérale d’un modèle',
        summary: 'L’expression littérale écrit la règle en une ligne, valable pour n’importe quelle valeur de la variable.',
        body: (
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center">
              <MathText>{'$\\text{prix} = 0{,}15 \\times t + 1$'}</MathText>
            </div>
            <p>Le tarif <strong>multiplie</strong> la variable ; la part fixe
            <strong> s’ajoute</strong>. Écrite comme fonction, la même règle se note
            <MathText>{' $f(t) = 0{,}15\\,t + 1$'}</MathText>.</p>
            <p className="text-xs text-slate-500">Deux écritures qui donnent les mêmes résultats
            pour toutes les valeurs sont le même modèle :
            <MathText>{' $1 + 0{,}15 \\times t$'}</MathText> et
            <MathText>{' $0{,}15 \\times t + 1$'}</MathText> ne diffèrent que par l’ordre.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les cartes assemblées
            une à une jusqu’à ce que la vérification passe.</div>
          </div>
        ),
      },
      {
        id: 'sens-des-parametres',
        type: 'regles',
        title: 'Chaque paramètre a un sens dans la situation',
        summary: 'Le coefficient de la variable est un taux — par minute, par km, par personne ; la part fixe est ce qu’on a déjà pour 0.',
        body: (
          <div className="space-y-2">
            <p>Lire un modèle, c’est retraduire chacun de ses nombres :</p>
            <ul className="space-y-1 text-sm">
              <li><strong>0,15</strong> : ce qui s’ajoute pour <em>chaque</em> minute — un tarif.</li>
              <li><strong>1</strong> : le déblocage, payé même pour 0 minute — la part fixe.</li>
              <li><strong>t</strong> : la durée, la variable qu’on choisit.</li>
            </ul>
            <p className="text-xs text-slate-500">Un paramètre sans unité et sans phrase n’est
            qu’un nombre : le modèle n’aide à décider que si on sait ce que chacun raconte.</p>
          </div>
        ),
      },
      {
        id: 'cycle-modelisation',
        type: 'methodes',
        title: 'Le cycle de la modélisation',
        summary: 'Situation → grandeurs → relation → représentation → calcul → interprétation → vérification, puis retour à la situation.',
        body: (
          <div className="space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li><strong>Situation</strong> : trier les informations utiles.</li>
              <li><strong>Grandeurs</strong> : nommer la variable et ce qui en dépend.</li>
              <li><strong>Relation</strong> : la règle d’accord avec toutes les données.</li>
              <li><strong>Représentation</strong> : tableau, graphique, expression — selon la question.</li>
              <li><strong>Calcul</strong> : prévoir, résoudre.</li>
              <li><strong>Interprétation</strong> : revenir à la situation, avec les unités.</li>
              <li><strong>Vérification</strong> : cohérence, ordre de grandeur, limites.</li>
            </ol>
            <p className="text-xs text-slate-500">Un nombre nu n’est jamais une réponse : les
            deux dernières étapes ne sont pas facultatives.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : c’est exactement ce que
            tu fais depuis le laboratoire du module 1.</div>
          </div>
        ),
      },
    ],

    /* M6 — Un modèle prévoit dans son domaine ; ailleurs, il faut douter. */
    6: [
      {
        id: 'domaine-de-validite',
        type: 'concepts',
        title: 'Le domaine de validité',
        summary: 'Un modèle n’est exact que sur une plage de valeurs ; ailleurs, une autre règle prend le relais ou la situation impose ses bornes.',
        visual: domainVisual,
        body: (
          <div className="space-y-2">
            <p>Le <strong>domaine de validité</strong> est l’ensemble des valeurs de la variable
            pour lesquelles le modèle raconte encore la situation.</p>
            <p className="text-xs text-slate-500">Il est fixé par le réel, pas par les
            mathématiques : un plafond de prix, un réservoir qui ne peut pas contenir moins que
            rien, un nombre de personnes qui ne peut pas être négatif.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : à partir de 46,7 min,
            la facture reste à 8 € et la droite décroche.</div>
          </div>
        ),
      },
      {
        id: 'extrapolation',
        type: 'vocabulaire',
        title: 'Extrapoler',
        summary: 'Extrapoler, c’est utiliser un modèle loin de ses données — le calcul reste juste, mais le résultat peut être faux.',
        body: (
          <div className="space-y-2">
            <p>Rien n’empêche de continuer à calculer hors du domaine : c’est précisément le
            piège. Le nombre obtenu a l’air d’une réponse.</p>
            <p className="text-xs text-slate-500">Signal d’alarme : un <strong>ordre de
            grandeur</strong> absurde. Quand la prévision devient impossible dans la situation,
            c’est le modèle qu’il faut remettre en cause, pas la réalité.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les bactéries — un
            calcul juste, un résultat que la boîte de Petri refuse.</div>
          </div>
        ),
      },
      {
        id: 'interpreter-resultat',
        type: 'methodes',
        title: 'Interpréter un résultat',
        summary: 'Un nombre se traduit dans la situation : avec son unité, et arrondi comme la situation l’exige.',
        body: (
          <div className="space-y-2">
            <p>Le calcul donne 6,25 ; la situation demande un nombre entier de séances : la
            réponse est « <strong>dès la 7e séance</strong> ».</p>
            <p className="text-xs text-slate-500">Trois questions à se poser : le calcul est-il
            juste ? le modèle est-il valable ici ? le nombre a-t-il un sens dans la situation ?</p>
          </div>
        ),
      },
      {
        id: 'mem-douter',
        type: 'memoriser',
        title: '⭐ Douter d’un modèle, c’est le comprendre',
        summary: 'Un modèle prévoit dans son domaine, se relit avec ses unités, et se vérifie en revenant à la situation.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 text-center space-y-1">
            <div className="text-lg font-black text-rose-700">Calcul juste ≠ réponse juste</div>
            <p className="text-xs text-rose-700">Toujours revenir à la situation : unité, bornes,
            ordre de grandeur.</p>
          </div>
        ),
      },
    ],

    /* M7 — Deux modèles concurrents : le seuil où la réponse bascule. */
    7: [
      {
        id: 'seuil-deux-modeles',
        type: 'methodes',
        title: 'Comparer deux modèles : le seuil',
        summary: 'Quand deux modèles décrivent deux options, on cherche la valeur où ils donnent le même résultat : avant elle, l’une gagne ; après, l’autre.',
        body: (
          <div className="space-y-2">
            <p>Sur le graphique, ce <strong>seuil</strong> est le point où les deux courbes se
            croisent. Le calcul le précise : on écrit l’égalité des deux modèles et on résout.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-center text-sm">
              <MathText>{'$240 + 6n = 14n \\;\\Longrightarrow\\; 8n = 240 \\;\\Longrightarrow\\; n = 30$'}</MathText>
            </div>
            <p className="text-xs text-slate-500">Une décision se cite toujours avec son seuil et
            ses conditions : « au-dessus de 30 personnes » — pas « moins cher », tout court.</p>
          </div>
        ),
      },
    ],
  },
};
