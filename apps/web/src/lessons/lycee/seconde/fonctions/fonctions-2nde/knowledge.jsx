import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de la leçon « Fonctions » — SOURCE UNIQUE de vérité
 * (docs/architecture/KNOWLEDGE_MAP.md). Un item n'utilise que des notions
 * déjà rencontrées au module qui le déclare : la formule de la boîte attend
 * le module 3, la courbe « point par point » le module 4, la réunion
 * d'intervalles le module 6.
 */
const V = (x) => x * (20 - 2 * x) ** 2;
const boxGraph = (extra = {}) => (
  <MiniGraph width={220} height={150} xMin={0} xMax={10} yMin={0} yMax={600}
    functions={[{ fn: V, color: '#4f46e5', domain: [0.02, 9.98] }]} {...extra} />
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La boîte : une dépendance, une variable, une image et une seule. */
    1: [
      {
        id: 'fonction-dependance',
        type: 'concepts',
        title: 'Fonction',
        summary: 'Une fonction décrit une dépendance : à chaque valeur de la variable correspond une valeur, et une seule.',
        visual: boxGraph({ points: [{ x: 3, y: V(3), label: '(3 ; 588)', color: '#e11d48', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Quand une grandeur est <strong>entièrement déterminée</strong> par la valeur d’une autre, on dit qu’elle en est <strong>fonction</strong>.</p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1 text-sm text-slate-700">
              <div className="text-slate-400 text-xs">Exemple</div>
              <div>Le volume de la boîte ne dépend que de la découpe x : choisir x = 3 cm fixe le volume, 588 cm³ — toujours le même.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">Une valeur de x → <strong>une seule</strong> valeur. La réciproque n’est pas exigée : deux découpes différentes peuvent donner le même volume.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : « Déjà enregistrée » — la même découpe ne peut pas donner un autre volume.</div>
          </div>
        ),
      },
      {
        id: 'vocab-variable',
        type: 'vocabulaire',
        title: 'Variable',
        summary: 'La variable est la grandeur que l’on choisit librement (x) ; la fonction en calcule une autre.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>La <strong>variable</strong> est le nombre que l’on fait varier : la découpe x, une largeur, une durée… On le note souvent x.</p>
            <p>La fonction associe à chaque valeur de la variable une valeur calculée : le volume, un périmètre, un prix.</p>
            <p className="text-xs text-slate-500">Modéliser une situation, c’est d’abord choisir la variable — puis dire comment l’autre grandeur en dépend.</p>
          </div>
        ),
      },
      {
        id: 'mem-un-x-une-valeur',
        type: 'memoriser',
        title: '⭐ Un x, une valeur',
        summary: 'À chaque valeur de la variable, une valeur et une seule.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">Un x → une valeur, toujours la même</div>
            <p className="text-xs text-rose-700">Le volume monte puis redescend quand x grandit — mais chaque x n’a qu’un volume.</p>
          </div>
        ),
      },
    ],

    /* M2 — Image, antécédents, ensemble de définition, lecture graphique. */
    2: [
      {
        // ACQUIS du chapitre « Ensembles et intervalles » (premier objet du
        // programme de Seconde), déclaré en `priorKnowledge` et diagnostiqué
        // par le module 0. On le REPOSE ici en `variant="rappel"` parce que
        // l'ensemble de définition s'écrit avec, et qu'un élève qui a oublié
        // le sens des crochets ne peut pas répondre.
        id: 'rappel-intervalle',
        type: 'vocabulaire',
        title: 'Rappel : intervalles et crochets',
        summary: 'Un intervalle décrit tous les nombres entre deux bornes ; le sens du crochet dit si la borne en fait partie.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1">
              <p><MathText>{'$[a\\,;\\,b]$'}</MathText> : a et b <strong>font partie</strong> de l’intervalle (crochets tournés vers l’intérieur).</p>
              <p><MathText>{'$]a\\,;\\,b[$'}</MathText> : a et b sont <strong>exclus</strong> (crochets tournés vers l’extérieur).</p>
            </div>
            <p className="text-xs text-slate-500">On peut mélanger : <MathText>{'$]0\\,;\\,10]$'}</MathText> exclut 0 et garde 10. Et <MathText>{'$x \\in I$'}</MathText> se lit « x appartient à I ».</p>
          </div>
        ),
      },
      {
        id: 'image-antecedent',
        type: 'concepts',
        title: 'Image et antécédents',
        summary: 'L’image de x est f(x), unique ; les antécédents de y sont les x tels que f(x) = y — il peut y en avoir 0, 1 ou plusieurs.',
        visual: boxGraph({ guides: [{ y: 400, color: '#059669' }], points: [{ x: 1.32, y: 400, color: '#059669', label: 'x₁', labelPos: 'tl' }, { x: 5.88, y: 400, color: '#059669', label: 'x₂', labelPos: 'tr' }] }),
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900"><strong>Image</strong> de x : la valeur f(x). On part de x. <em>Une seule.</em></div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>Antécédent</strong> de y : un x tel que f(x) = y. On part de y. <em>0, 1, 2… valeurs.</em></div>
            </div>
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-sm text-slate-700 space-y-1">
              <div className="text-slate-400 text-xs">Exemple (la boîte)</div>
              <div>V(2) = 512 : 512 est l’image de 2. 400 a deux antécédents (x ≈ 1,3 et x ≈ 5,9). 600 n’en a aucun.</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde verticale touche la courbe une fois ; la sonde horizontale, deux fois.</div>
          </div>
        ),
      },
      {
        id: 'ensemble-definition',
        type: 'concepts',
        title: 'Ensemble de définition',
        summary: 'L’ensemble des valeurs de x qui ont une image, noté D_f. Hors de D_f, pas d’image.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">Une fonction n’existe que sur son <strong>ensemble de définition</strong> <MathText>{'$D_f$'}</MathText>. Souvent un intervalle ; les crochets disent si les bornes en font partie.</p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-sm text-slate-700"><MathText>{'$D_V = \\,]0\\,;\\,10[$'}</MathText> : la boîte existe pour 0 &lt; x &lt; 10, bornes exclues.</div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Qu’une formule « calcule » pour x = 12 ne suffit pas : s’il n’y a pas de boîte, 12 n’a pas d’image.</div>
          </div>
        ),
      },
      {
        id: 'vocab-notation-fx',
        type: 'vocabulaire',
        title: 'Notation f(x)',
        summary: 'f(x) se lit « f de x » : c’est l’image de x. On écrit aussi f : x ↦ f(x).',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-violet-100 p-3 text-center"><MathText>{'$$V(2) = 512 \\qquad V : x \\mapsto V(x)$$'}</MathText></div>
            <p>« V(2) = 512 » : l’image de 2 par V est 512. La flèche ↦ (« a pour image ») décrit la fonction elle-même.</p>
            <p className="text-xs text-slate-500">f(x) n’est pas une multiplication f × x.</p>
          </div>
        ),
      },
      {
        id: 'methode-lire-image-graphique',
        type: 'methodes',
        title: 'Lire une image sur la courbe',
        summary: 'Partir de x sur l’axe des abscisses, monter jusqu’à la courbe, lire l’ordonnée.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Repérer x sur l’axe horizontal.</li>
            <li>Monter (ou descendre) verticalement jusqu’à la courbe — un seul point.</li>
            <li>Lire l’ordonnée : c’est f(x), à la précision du dessin.</li>
          </ol>
        ),
      },
      {
        id: 'methode-lire-antecedents-graphique',
        type: 'methodes',
        title: 'Lire des antécédents sur la courbe',
        summary: 'Partir de y sur l’axe des ordonnées, tracer l’horizontale, lire l’abscisse de CHAQUE point commun avec la courbe.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Repérer y sur l’axe vertical, tracer la droite horizontale.</li>
            <li>Chaque point où elle coupe la courbe donne un antécédent.</li>
            <li>Aucun point : y n’a pas d’antécédent ; plusieurs points : plusieurs antécédents.</li>
          </ol>
        ),
      },
    ],

    /* M3 — Expression, tableau de valeurs, antécédent par le calcul. */
    3: [
      {
        id: 'methode-calculer-image',
        type: 'methodes',
        title: 'Calculer une image avec l’expression',
        summary: 'Remplacer x par la valeur (entre parenthèses si elle est négative) et calculer.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-emerald-100 p-3"><MathText>{'$g(x) = 3x^2 - 5 \\;:\\; g(-1) = 3\\times(-1)^2 - 5 = 3 - 5 = -2$'}</MathText></div>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Le carré porte sur x seul : 3 × 2² = 12, pas (3 × 2)². Un x négatif se met entre parenthèses.</div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la formule de la boîte, V(x) = x(20 − 2x)², retrouvée en testant trois valeurs.</div>
          </div>
        ),
      },
      {
        id: 'tableau-valeurs',
        type: 'concepts',
        title: 'Tableau de valeurs',
        summary: 'Quelques valeurs de x et leurs images. Exact sur ses colonnes, muet entre elles.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Un tableau de valeurs donne des couples (x ; f(x)). On y lit une image (colonne de x) ou des antécédents (cases qui portent y).</p>
            <div className="bg-rose-50 rounded-lg p-3 text-xs text-rose-700">Ce qu’il ne dit pas : les x absents du tableau ont une image, mais il faut l’expression ou la courbe pour la connaître. Et une valeur absente n’a pas « zéro antécédent » pour autant.</div>
            <p className="text-xs text-slate-500">Une formule se vérifie sur PLUSIEURS lignes : une coïncidence ne prouve rien.</p>
          </div>
        ),
      },
      {
        id: 'regle-antecedent-equation',
        type: 'regles',
        title: 'Antécédent = équation',
        summary: 'Chercher les antécédents de k par f, c’est résoudre l’équation f(x) = k.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-orange-100 p-3 text-center"><MathText>{'$$f(x) = 2x + 3,\\quad f(x) = 11 \\iff 2x + 3 = 11 \\iff x = 4$$'}</MathText></div>
            <p>4 est l’antécédent de 11. Attention au sens : f(11) = 25 est l’<em>image</em> de 11.</p>
          </div>
        ),
      },
    ],

    /* M4 — Courbe représentative : M(x ; y) ∈ C ⟺ y = f(x). */
    4: [
      {
        id: 'courbe-representative',
        type: 'concepts',
        title: 'Courbe représentative',
        summary: 'L’ensemble des points M(x ; f(x)) pour x dans D_f. Un point est sur la courbe exactement quand y = f(x).',
        visual: (
          <MiniGraph width={220} height={150} xMin={-3} xMax={4} yMin={-4} yMax={7}
            functions={[{ fn: (x) => x * x - 3, color: '#4f46e5' }]}
            points={[{ x: 3, y: 6, label: '(3 ; 6)', color: '#059669', labelPos: 'tl' }, { x: -2, y: 1, label: '(−2 ; 1)', color: '#0284c7', labelPos: 'tl' }]} />
        ),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-center"><MathText>{'$$M(x\\,;\\,y) \\in \\mathcal{C}_f \\iff y = f(x)$$'}</MathText></div>
            <p className="text-sm text-slate-700">L’abscisse est la valeur de la variable, l’ordonnée son image. L’ordre compte : (3 ; 6) est sur la courbe de x² − 3, pas (6 ; 3).</p>
            <p className="text-sm text-slate-700">La courbe ne s’arrête pas aux points du tableau : elle passe par TOUS les (x ; f(x)).</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : six points posés à la main, puis la courbe qui les traverse et continue.</div>
          </div>
        ),
      },
      {
        id: 'methode-tracer-courbe',
        type: 'methodes',
        title: 'Tracer une courbe point par point',
        summary: 'Dresser un tableau de valeurs, placer chaque point (x ; f(x)), relier par un trait régulier.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Choisir des valeurs de x dans l’ensemble de définition, calculer leurs images.</li>
            <li>Placer chaque point : x en abscisse, f(x) en ordonnée.</li>
            <li>Relier les points par une courbe régulière (plus il y a de points, plus le tracé est fidèle).</li>
          </ol>
        ),
      },
      {
        id: 'methode-tester-point',
        type: 'methodes',
        title: 'Un point est-il sur la courbe ?',
        summary: 'Calculer l’image de l’abscisse et la comparer à l’ordonnée.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Pour M(a ; b) : calculer f(a). Si f(a) = b, M est sur la courbe ; sinon, non. Ni dessin ni tableau nécessaires.</p>
            <div className="bg-white rounded-xl border border-emerald-100 p-3">f(x) = x² − 3, M(1,5 ; −0,75) : f(1,5) = 2,25 − 3 = −0,75 = ordonnée → M ∈ C_f.</div>
          </div>
        ),
      },
      {
        id: 'mem-point-sur-courbe',
        type: 'memoriser',
        title: '⭐ Sur la courbe ⟺ y = f(x)',
        summary: 'Un point (x ; y) est sur la courbe de f exactement quand y est l’image de x.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">(x ; y) ∈ C_f ⟺ y = f(x)</div>
            <p className="text-xs text-rose-700">abscisse = variable · ordonnée = image · l’ordre compte</p>
          </div>
        ),
      },
    ],

    /* M5 — Quatre registres, une fonction ; modéliser. */
    5: [
      {
        id: 'quatre-registres',
        type: 'concepts',
        title: 'Quatre registres',
        summary: 'Situation, tableau de valeurs, courbe, expression : quatre façons de décrire la même fonction.',
        body: (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>Situation</strong> — la boîte, un rectangle, un forfait</div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900"><strong>Tableau</strong> — des couples exacts, mais quelques-uns</div>
              <div className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-violet-900"><strong>Courbe</strong> — tout d’un coup d’œil, approximativement</div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>Expression</strong> — exact pour tout x</div>
            </div>
            <p className="text-sm text-slate-700">Deux expressions peuvent définir la même fonction : 2x + 10 et 2(x + 5) ont les mêmes images pour tout x.</p>
          </div>
        ),
      },
      {
        id: 'methode-choisir-registre',
        type: 'methodes',
        title: 'Choisir le bon registre',
        summary: 'Valeur exacte → expression ; nombre d’antécédents, zones → courbe ; mesures seules → tableau.',
        body: (
          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
            <li>Calculer f(3,7) exactement : l’<strong>expression</strong>.</li>
            <li>Compter les antécédents de 2, voir où f dépasse 100 : la <strong>courbe</strong>.</li>
            <li>Lire f(2) quand on ne dispose que de mesures : le <strong>tableau</strong>.</li>
            <li>Reconnaître une courbe : calculer f(0), f(1), f(−1) et repérer ces points.</li>
          </ul>
        ),
      },
      {
        id: 'methode-modeliser',
        type: 'methodes',
        title: 'Modéliser une situation',
        summary: 'Choisir la variable, exprimer la grandeur étudiée en fonction d’elle, préciser l’ensemble de définition.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Nommer la variable (x) et la grandeur qui en dépend.</li>
              <li>Écrire l’expression à partir de la situation.</li>
              <li>Dire pour quels x la situation a un sens : l’ensemble de définition.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3">Rectangle de largeur x et de longueur 5 : P(x) = 2x + 10, pour x &gt; 0. Périmètre 24 ⟺ 2x + 10 = 24 ⟺ x = 7.</div>
          </div>
        ),
      },
    ],

    /* M6 — Réunion d'intervalles, fonction définie par morceaux. */
    6: [
      {
        id: 'reunion-intervalles',
        type: 'concepts',
        title: 'Fonction définie sur une réunion d’intervalles',
        summary: 'L’ensemble de définition peut être en plusieurs morceaux, par exemple [8 ; 12] ∪ [14 ; 20] ; entre les morceaux, aucune image.',
        visual: (
          <MiniGraph width={220} height={150} xMin={6} xMax={22} yMin={0} yMax={100}
            functions={[
              { fn: (x) => [[8, 0], [9, 20], [10, 45], [11, 60], [12, 40]].reduce((acc, [px, py], i, arr) => (acc !== null ? acc : (i < arr.length - 1 && x >= px && x <= arr[i + 1][0] ? py + (arr[i + 1][1] - py) * (x - px) / (arr[i + 1][0] - px) : null)), null) ?? NaN, color: '#7c3aed', domain: [8, 12] },
              { fn: (x) => [[14, 30], [15, 55], [16, 80], [17, 70], [18, 50], [19, 25], [20, 0]].reduce((acc, [px, py], i, arr) => (acc !== null ? acc : (i < arr.length - 1 && x >= px && x <= arr[i + 1][0] ? py + (arr[i + 1][1] - py) * (x - px) / (arr[i + 1][0] - px) : null)), null) ?? NaN, color: '#7c3aed', domain: [14, 20] },
            ]}
            bands={[{ from: 12, to: 14, color: '#e11d48', opacity: 0.12 }]} />
        ),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 text-center"><MathText>{'$$D_n = [8\\,;\\,12] \\cup [14\\,;\\,20]$$'}</MathText></div>
            <p className="text-sm text-slate-700">La piscine est fermée entre 12 h et 14 h : 13 n’a <strong>pas d’image</strong>. Ce n’est pas « 0 nageur » — la question n’a pas de sens.</p>
            <p className="text-sm text-slate-700">Une valeur y peut avoir des antécédents dans chaque morceau : 50 nageurs, quatre fois.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la sonde à 13 h qui ne rencontre rien.</div>
          </div>
        ),
      },
      {
        id: 'vocab-union-intervalles',
        type: 'vocabulaire',
        title: 'Réunion, ∪, crochets',
        summary: 'A ∪ B rassemble les deux intervalles ; [a ; b] inclut les bornes, ]a ; b[ les exclut.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p><strong>∪</strong> se lit « union » : x ∈ A ∪ B quand x est dans A <em>ou</em> dans B.</p>
            <p>Crochets fermés [8 ; 12] : 8 et 12 en font partie. Crochets ouverts ]0 ; 10[ : 0 et 10 sont exclus.</p>
          </div>
        ),
      },
      {
        id: 'methode-fonction-par-morceaux',
        type: 'methodes',
        title: 'Calculer avec une fonction définie par morceaux',
        summary: 'Repérer d’abord dans quel morceau se trouve x, puis appliquer la formule de ce morceau ; hors des morceaux, pas d’image.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="bg-white rounded-xl border border-emerald-100 p-3">T(x) = 3 si x ∈ [8 ; 12], T(x) = 5 si x ∈ [14 ; 20] : T(12) = 3 (borne fermée), T(15) = 5, T(13) n’existe pas.</div>
            <p className="text-xs text-slate-500">Un forfait par paliers, un tarif horaire, une piscine qui ferme : des fonctions par morceaux.</p>
          </div>
        ),
      },
    ],

    /* M7 — Atelier : ce qui n'a été formalisé nulle part ailleurs. */
    7: [
      {
        id: 'methode-verifier-modele',
        type: 'methodes',
        title: 'Vérifier un modèle',
        summary: 'Tester l’expression sur une valeur connue et contrôler l’ensemble de définition avant d’utiliser la fonction.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>Une expression modélise une situation seulement si elle redonne les valeurs observées et si son ensemble de définition correspond aux valeurs qui ont un sens.</p>
            <div className="bg-white rounded-xl border border-emerald-100 p-3">Feuille de 30 cm : V(x) = x(30 − 2x)² sur ]0 ; 15[ ; V(5) = 5 × 20² = 2 000 cm³. Un forfait de 0 à 10 Go : f définie sur [0 ; 10], f(5) = 10 + 4 × 3 = 22 €.</div>
          </div>
        ),
      },
    ],
  },
};
