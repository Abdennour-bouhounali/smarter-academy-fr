import React from 'react';
import RealLine from '../../../../common/components/RealLine';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Équations et inéquations » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. La méthode d'isolation arrive au module 2, le
 * retournement du signe au module 3, le produit nul au module 4, la valeur
 * interdite au module 5.
 *
 * Les modules gardent leur numérotation : le module 5 « Quotient et valeur
 * interdite » enseigne une vraie notion nouvelle — seul son encadré
 * « À retenir » recopié a disparu au profit de la carte.
 */

const line = (props) => (
  <div className="rounded-xl border border-slate-200 bg-white p-1.5">
    <RealLine step={1} {...props} />
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Le scanner de solutions : équation, solution, ensemble des
       solutions, et la vérification par substitution. */
    1: [
      {
        id: 'equation-solution',
        type: 'concepts',
        title: 'Équation et solution',
        summary: 'Une égalité contenant une inconnue ; une solution est une valeur qui la rend vraie.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">2x + 5 = 13</div>
              <div className="text-xs text-slate-500">x = 4 est solution : 2 × 4 + 5 = 13.</div>
            </div>
            <p className="text-sm text-slate-600">
              <strong>Résoudre</strong>, c’est trouver <strong>toutes</strong> les valeurs qui rendent l’égalité vraie.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux forfaits, et le curseur qui cherche où les prix se croisent.</div>
          </div>
        ),
      },
      {
        id: 'regle-nombre-de-solutions',
        type: 'regles',
        title: 'Une équation peut avoir une, aucune ou une infinité de solutions',
        summary: 'L’ensemble des solutions se note S, et peut être vide.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="font-mono text-slate-800">2x + 5 = 13</span><span className="font-mono text-slate-600">S = {'{'}4{'}'}</span></div>
              <div className="flex justify-between gap-3"><span className="font-mono text-slate-800">2x + 3 = 2x + 5</span><span className="font-mono text-slate-600">S = ∅</span></div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              2x + 3 = 2x + 5 n’a aucune solution : l’écart reste 2 quelle que soit la valeur de x.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-verifier-solution',
        type: 'methodes',
        title: 'Vérifier une solution',
        summary: 'Remplacer x par la valeur dans chaque membre séparément, puis comparer.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">x = 4 dans 2x + 5 = 13</div>
              <div className="font-mono text-sm text-slate-800">gauche : 2 × 4 + 5 = 13</div>
              <div className="font-mono text-sm text-slate-800">droite : 13 &nbsp;→ égalité vraie ✓</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Attention à l’écriture : 2x signifie 2 × x, jamais « 2 collé à x ».
            </div>
          </div>
        ),
      },
      {
        id: 'inequation-infinite',
        type: 'concepts',
        title: 'Une inéquation a en général une infinité de solutions',
        summary: 'Elles ne forment pas une liste mais tout un intervalle.',
        visual: line({
          min: -1, max: 10,
          intervals: [{ id: 'S', from: 0, to: 4, openTo: true, tone: 'emerald', label: '[0 ; 4[' }],
          points: [{ id: 'eq', value: 4, label: 'A = B', tone: 'indigo', open: true }],
          ariaLabel: 'De 0 à 4 exclu, le forfait A est moins cher',
        }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">2x + 5 &lt; 13 &nbsp;(avec x ≥ 0) → S = [0 ; 4[</div>
              <div className="text-xs text-slate-500">0,5 ; 1 ; 3,99… une infinité de valeurs conviennent.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              C’est pourquoi on <strong>décrit</strong> l’ensemble des solutions par un intervalle, au lieu de les
              énumérer.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Isoler x : les transformations qui conservent les solutions. */
    2: [
      {
        id: 'regle-deux-membres',
        type: 'regles',
        title: 'Ce qu’on fait à un membre, on le fait à l’autre',
        summary: 'Appliquée aux deux membres, une opération conserve les solutions ; à un seul, elle les change.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Une équation est une <strong>balance</strong>. Ajouter, soustraire, multiplier ou diviser (par un nombre
              non nul) des deux côtés donne une équation qui a exactement les mêmes solutions.
            </p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1 text-sm">
              <div className="text-emerald-700 font-mono">2x + 5 = 13 → −5 des deux côtés → 2x = 8 ✓</div>
              <div className="text-rose-600 font-mono">−5 à gauche seulement → les solutions changent ✗</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la ligne rouge, quand l’opération n’était faite que d’un côté.</div>
          </div>
        ),
      },
      {
        id: 'methode-premier-degre',
        type: 'methodes',
        title: 'Résoudre une équation du premier degré',
        summary: 'Rassembler les x d’un côté, les nombres de l’autre, puis diviser par le coefficient de x.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Développer et réduire chaque membre si besoin.</li>
              <li><strong>Rassembler les x</strong> d’un côté (même opération aux deux membres).</li>
              <li><strong>Rassembler les nombres</strong> de l’autre.</li>
              <li><strong>Diviser</strong> par le coefficient de x.</li>
              <li><strong>Vérifier</strong> par substitution.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>3x − 4 = x + 6</div>
              <div>2x − 4 = 6 &nbsp;→&nbsp; 2x = 10 &nbsp;→&nbsp; x = 5</div>
              <div className="font-sans text-xs text-slate-500">vérification : 3 × 5 − 4 = 11 et 5 + 6 = 11 ✓</div>
            </div>
          </div>
        ),
      },
      {
        id: 'regle-solution-exacte',
        type: 'regles',
        title: 'Garder la solution exacte',
        summary: 'Une valeur approchée ne vérifie pas l’équation : on écrit 7/3, pas 2,33.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1 text-sm">
              <div className="font-mono text-emerald-700">x = 7/3 → les deux membres valent 55/3 ✓</div>
              <div className="font-mono text-rose-600">x ≈ 2,33 → 18,31 contre 18,32 ✗</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              La solution d’une équation est un nombre exact ; on n’arrondit que pour interpréter, jamais pour
              conclure la résolution.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Le signe qui se retourne : la règle propre aux inéquations. */
    3: [
      {
        id: 'regle-signe-retourne',
        type: 'regles',
        title: 'Multiplier ou diviser par un négatif retourne le sens',
        summary: 'C’est la seule différence entre résoudre une inéquation et résoudre une équation.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">2 &lt; 5 &nbsp;→ × (−1) →&nbsp; −2 &gt; −5</div>
              <div className="text-xs text-slate-500">multiplier par −1 prend le symétrique par rapport à 0 : l’ordre s’inverse.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Par un nombre <strong>positif</strong>, l’ordre est conservé. Ajouter ou soustraire ne retourne jamais rien.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux points qui changent de côté du zéro — et d’ordre.</div>
          </div>
        ),
      },
      {
        id: 'methode-resoudre-inequation',
        type: 'methodes',
        title: 'Résoudre une inéquation du premier degré',
        summary: 'Comme une équation, en surveillant le signe du diviseur, puis décrire les solutions par un intervalle.',
        visual: line({
          min: -6, max: 6,
          intervals: [{ id: 'S', from: -2, to: Infinity, tone: 'emerald', label: '[−2 ; +∞[' }],
          ariaLabel: 'Solutions de −3x + 4 ≤ 10 : de −2 inclus vers plus l’infini',
        }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>−3x + 4 ≤ 10</div>
              <div>−3x ≤ 6</div>
              <div>x ≥ −2 <span className="font-sans text-xs text-slate-500">÷ (−3) : le sens se retourne</span></div>
              <div>S = [−2 ; +∞[</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Un signe large (≤, ≥) donne un crochet fermé ; un signe strict (&lt;, &gt;) un crochet ouvert.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-signe-negatif',
        type: 'memoriser',
        title: '⭐ ÷ par un négatif ⇒ le sens se retourne',
        summary: 'La seule règle en plus par rapport aux équations.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="font-mono text-lg font-black text-rose-700">−3x ≤ 6 &nbsp;⟹&nbsp; x ≥ −2</div>
              <div className="text-xs text-rose-600">le ≤ devient ≥</div>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Produit nul : la règle, et le piège du « = 3 ». */
    4: [
      {
        id: 'vocab-facteur',
        type: 'vocabulaire',
        title: 'Facteur',
        summary: 'Chacune des expressions qui sont MULTIPLIÉES dans un produit.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-violet-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">(x − 2) × (2x + 6)</div>
              <div className="text-xs text-slate-500">
                deux facteurs : <span className="font-mono">x − 2</span> et <span className="font-mono">2x + 6</span>.
                Le résultat de leur multiplication est le <strong>produit</strong>.
              </div>
            </div>
            <div className="bg-violet-50 rounded-lg p-3 text-xs text-violet-700">
              Un facteur peut valoir 0 pour certaines valeurs de x — c’est le cœur du module.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux barres du scanner, chacune avec son propre zéro.</div>
          </div>
        ),
      },
      {
        id: 'produit-nul',
        type: 'regles',
        title: 'Règle du produit nul',
        summary: 'A × B = 0 ⇔ A = 0 ou B = 0 : un seul facteur nul suffit.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3">
              <MathText>{'$A \\times B = 0 \\iff A = 0 \\ \\text{ou} \\ B = 0$'}</MathText>
            </div>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>(x − 2)(2x + 6) = 0</div>
              <div>x = 2 &nbsp;ou&nbsp; x = −3</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le produit qui tombe à 0 exactement quand un facteur s’annule.</div>
          </div>
        ),
      },
      {
        id: 'methode-equation-produit',
        type: 'methodes',
        title: 'Résoudre une équation produit',
        summary: 'Ramener à 0, factoriser, puis résoudre une branche par facteur.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li><strong>Ramener à 0</strong> : tout passer du même côté.</li>
              <li><strong>Factoriser</strong> le membre obtenu.</li>
              <li><strong>Une branche par facteur</strong>, résolue séparément.</li>
              <li>Rassembler les solutions dans S.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>x² = 9 → x² − 9 = 0 → (x − 3)(x + 3) = 0</div>
              <div>S = {'{'}−3 ; 3{'}'}</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Oublier la solution négative de x² = 9 est l’erreur classique.
            </div>
          </div>
        ),
      },
      {
        id: 'regle-piege-produit-non-nul',
        type: 'regles',
        title: 'La règle ne vaut que pour 0',
        summary: '(x + 1)(x − 1) = 3 n’autorise pas à écrire « x + 1 = 3 ou x − 1 = 3 ».',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Un produit égal à 3 peut être 1 × 3, mais aussi 1,5 × 2 ou 6 × 0,5 : rien n’impose qu’un facteur vaille 3.
            </p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>(x + 1)(x − 1) = 3 → x² − 1 = 3 → x² = 4</div>
              <div>S = {'{'}−2 ; 2{'}'}</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Zéro est le seul nombre qui force un facteur à s’annuler. Toujours ramener à 0 d’abord.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-produit-nul',
        type: 'memoriser',
        title: '⭐ A × B = 0 ⇔ A = 0 ou B = 0',
        summary: 'Valable pour 0, et seulement pour 0.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <MathText>{'$A \\times B = 0 \\iff A = 0 \\ \\text{ou} \\ B = 0$'}</MathText>
              <div className="text-xs text-rose-600">ramener à 0, factoriser, une branche par facteur</div>
            </div>
          </div>
        ),
      },
    ],

    /* M5 — Quotient et valeur interdite. */
    5: [
      {
        id: 'valeur-interdite',
        type: 'concepts',
        title: 'Valeur interdite',
        summary: 'La valeur qui annule un dénominateur : le quotient n’y existe pas.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <MathText>{'$\\dfrac{x - 3}{x + 1}$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">
                en x = −1, le dénominateur vaut 0 : division impossible, valeur <strong>interdite</strong>.
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              On cherche les valeurs interdites <strong>avant</strong> de résoudre, jamais après.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le trou dans la courbe, là où le calcul plante.</div>
          </div>
        ),
      },
      {
        id: 'quotient-nul',
        type: 'regles',
        title: 'Règle du quotient nul',
        summary: 'A / B = 0 ⇔ A = 0 ET B ≠ 0.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3">
              <MathText>{'$\\dfrac{A}{B} = 0 \\iff A = 0 \\ \\text{et} \\ B \\neq 0$'}</MathText>
            </div>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5 text-sm">
              <div className="font-mono text-slate-800">(x − 3)/(x + 1) = 0 → S = {'{'}3{'}'}</div>
              <div className="font-mono text-slate-800">(2x + 4)/(x + 2) = 0 → S = ∅</div>
              <div className="text-xs text-slate-500">
                dans le second cas, −2 annule le numérateur… mais aussi le dénominateur : il est interdit.
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Un quotient est nul quand son <strong>numérateur</strong> l’est — à condition que la valeur soit autorisée.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-choisir-methode',
        type: 'methodes',
        title: 'Reconnaître la forme pour choisir la méthode',
        summary: 'Premier degré, inéquation, produit nul, quotient nul : quatre formes, quatre méthodes.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-xl bg-white border border-emerald-200 p-2.5">
                <div className="font-mono font-bold text-slate-800">ax + b = cx + d</div>
                <div className="text-xs text-slate-500">rassembler, diviser, vérifier</div>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-2.5">
                <div className="font-mono font-bold text-slate-800">ax + b ≤ cx + d</div>
                <div className="text-xs text-slate-500">idem, le négatif retourne le sens ; solutions = intervalle</div>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-2.5">
                <div className="font-mono font-bold text-slate-800">A × B = 0</div>
                <div className="text-xs text-slate-500">ramener à 0, factoriser, une branche par facteur</div>
              </div>
              <div className="rounded-xl bg-white border border-emerald-200 p-2.5">
                <div className="font-mono font-bold text-slate-800">A / B = 0</div>
                <div className="text-xs text-slate-500">valeur interdite d’abord, puis numérateur nul</div>
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M6 — Modéliser : la chaîne complète, jusqu'à l'interprétation. */
    6: [
      {
        id: 'methode-modeliser',
        type: 'methodes',
        title: 'Mettre un problème en équation',
        summary: 'Choisir l’inconnue, traduire, résoudre, vérifier, interpréter.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li><strong>Choisir l’inconnue</strong> et la nommer précisément (« x est la largeur, en cm »).</li>
              <li><strong>Traduire</strong> l’énoncé en équation ou inéquation.</li>
              <li><strong>Résoudre</strong>.</li>
              <li><strong>Vérifier</strong> dans l’énoncé, pas seulement dans l’équation.</li>
              <li><strong>Interpréter</strong> : répondre à la question posée, avec l’unité.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>périmètre 26, longueur = largeur + 3</div>
              <div>2x + 2(x + 3) = 26 → 4x + 6 = 26 → x = 5</div>
              <div className="font-sans text-xs text-slate-500">largeur 5 cm, longueur 8 cm : 2 × 5 + 2 × 8 = 26 ✓</div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le rectangle, le budget de vélo et la poursuite des deux voitures.</div>
          </div>
        ),
      },
      {
        id: 'regle-interpreter-solution',
        type: 'regles',
        title: 'Une solution mathématique peut n’avoir aucun sens',
        summary: 'Une largeur de −2 cm est refusée par la situation, même si le calcul est juste.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Résoudre ne suffit pas : il faut confronter la solution au contexte. Une longueur, une durée ou une
              quantité ne peuvent pas être négatives.
            </p>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Le contexte ajoute aussi ses propres contraintes : pour une location de vélo, h ≥ 0 s’ajoute à h ≤ 5,
              d’où [0 ; 5].
            </div>
          </div>
        ),
      },
      {
        id: 'methode-traduire-vitesse',
        type: 'methodes',
        title: 'Traduire des grandeurs en expressions',
        summary: 'Périmètre, coût, distance : chaque grandeur s’écrit avec l’inconnue choisie.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="text-slate-600">périmètre d’un rectangle</span><span className="font-mono text-slate-800">2x + 2(x + 3)</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">coût fixe + coût horaire</span><span className="font-mono text-slate-800">15 + 2h</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-600">distance parcourue</span><span className="font-mono text-slate-800">vitesse × temps</span></div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Un départ décalé se traduit dans le temps, pas dans la vitesse : partie 1 h plus tard, la voiture B a
              roulé (t − 1) heures, d’où 60t = 90(t − 1).
            </div>
          </div>
        ),
      },
    ],
  },
};
