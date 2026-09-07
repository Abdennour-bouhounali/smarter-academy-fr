import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Logique et raisonnement » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. L'implication n'apparaît qu'au module 3,
 * l'équivalence au module 4, l'absurde au module 5 (ex-module 6).
 *
 * Numérotation : le module « À retenir » (ex-05) a été supprimé ; « Par
 * l'absurde » est devenu le module 5 et le test final le module 6.
 */
export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — La formule qui tombe : proposition, valeur de vérité,
       contre-exemple, et l'asymétrie réfuter / prouver. */
    1: [
      {
        id: 'proposition',
        type: 'concepts',
        title: 'Proposition',
        summary: 'Une phrase mathématique qui est soit vraie, soit fausse — jamais les deux, jamais une affaire d’avis.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Une <strong>proposition</strong> affirme quelque chose dont on peut décider si c’est vrai ou faux.
              Cette valeur (vrai / faux) s’appelle sa <strong>valeur de vérité</strong>.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1.5 text-sm">
              <div className="text-emerald-700">✓ « 7 est un nombre premier » — une proposition (vraie)</div>
              <div className="text-rose-600">✗ « Les nombres premiers sont beaux » — un avis</div>
              <div className="text-rose-600">✗ « x + 1 » — une expression, pas une phrase</div>
              <div className="text-rose-600">✗ « Combien vaut 3 + 4 ? » — une question n’affirme rien</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              « <MathText>{'$n^{2} + n + 41$'}</MathText> est premier » dépend de n : ce n’est une proposition qu’une
              fois n fixé, ou qu’une fois précisé « pour tout n ».
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la formule d’Euler, testée valeur après valeur.</div>
          </div>
        ),
      },
      {
        id: 'contre-exemple',
        type: 'concepts',
        title: 'Contre-exemple',
        summary: 'Un seul cas qui met une affirmation universelle en défaut — et il suffit à la réfuter.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">« Pour tout entier n, n² + n + 41 est premier »</div>
              <div className="font-mono text-sm text-slate-800">n = 40 → 1 681 = 41 × 41</div>
              <div className="text-xs text-slate-500">un contre-exemple : l’affirmation est fausse.</div>
            </div>
            <p className="text-sm text-slate-600">
              La formule tient pour n = 0 jusqu’à 39. Quarante succès ne prouvent rien ; un seul échec réfute
              définitivement.
            </p>
          </div>
        ),
      },
      {
        id: 'regle-refuter-prouver',
        type: 'regles',
        title: 'Réfuter et prouver ne demandent pas le même travail',
        summary: 'Un contre-exemple suffit à réfuter ; prouver exige un raisonnement valable pour tous les cas.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2">
              <div className="rounded-xl bg-white border border-orange-200 p-3">
                <div className="text-xs font-bold uppercase text-orange-500">Réfuter « pour tout n… »</div>
                <div className="text-sm text-slate-700">UN contre-exemple, et c’est fini.</div>
              </div>
              <div className="rounded-xl bg-white border border-orange-200 p-3">
                <div className="text-xs font-bold uppercase text-orange-500">Prouver « pour tout n… »</div>
                <div className="text-sm text-slate-700">
                  Un raisonnement qui couvre tous les cas. Exemple : <MathText>{'$n(n+1)$'}</MathText> est le produit de
                  deux entiers consécutifs, donc l’un des deux est pair.
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Les exemples servent à deviner une conjecture, jamais à la démontrer.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-contre-exemple',
        type: 'memoriser',
        title: '⭐ Un contre-exemple suffit à réfuter',
        summary: 'Aucun nombre d’exemples ne suffit à prouver une affirmation universelle.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg font-black text-rose-700">1 contre-exemple = réfutée</div>
              <div className="text-lg font-black text-slate-400">40 exemples ≠ prouvée</div>
            </div>
            <p className="text-xs text-slate-500 text-center">n = 40 : 1 681 = 41 × 41.</p>
          </div>
        ),
      },
    ],

    /* M2 — ET, OU, NON : les trois connecteurs et la négation, cas limites
       compris. */
    2: [
      {
        id: 'connecteurs',
        type: 'concepts',
        title: 'Les connecteurs ET, OU, NON',
        summary: 'ET exige les deux ; OU se contente d’une et accepte les deux ; NON couvre exactement le reste.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2">
              <div className="rounded-xl bg-white border border-blue-200 p-3">
                <div className="font-mono font-bold text-slate-800">P ET Q</div>
                <div className="text-xs text-slate-500">vraie seulement si les deux le sont</div>
              </div>
              <div className="rounded-xl bg-white border border-blue-200 p-3">
                <div className="font-mono font-bold text-slate-800">P OU Q</div>
                <div className="text-xs text-slate-500">vraie dès qu’au moins une l’est</div>
              </div>
              <div className="rounded-xl bg-white border border-blue-200 p-3">
                <div className="font-mono font-bold text-slate-800">NON P</div>
                <div className="text-xs text-slate-500">vraie exactement quand P est fausse</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le filtre à deux voyants, et les douze nombres qui passent ou non.</div>
          </div>
        ),
      },
      {
        id: 'regle-ou-inclusif',
        type: 'regles',
        title: 'Le OU mathématique est inclusif',
        summary: '« P OU Q » est vraie aussi quand les deux le sont — contrairement au « ou » courant.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div className="text-slate-400 text-xs">P : « n est pair » · Q : « n &gt; 5 »</div>
              <div className="text-sm text-slate-700">8 est pair <strong>et</strong> plus grand que 5 : il passe « P OU Q ».</div>
              <div className="text-xs text-slate-500">Seuls 1, 3 et 5 restent dehors.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Le « ou » du langage courant est souvent exclusif (« fromage ou dessert »). En mathématiques, jamais.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-negation',
        type: 'methodes',
        title: 'Nier une proposition',
        summary: 'La négation couvre exactement les cas restants — cas limites compris.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3"><span className="font-mono text-slate-800">n &gt; 5</span><span className="font-mono text-emerald-700">n ≤ 5</span></div>
              <div className="flex justify-between gap-3"><span className="font-mono text-slate-800">x ≤ 3</span><span className="font-mono text-emerald-700">x &gt; 3</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-700">n est pair</span><span className="text-emerald-700">n est impair</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-700">tous sont présents</span><span className="text-emerald-700">au moins un est absent</span></div>
              <div className="flex justify-between gap-3"><span className="text-slate-700">multiple de 3 ET de 5</span><span className="text-emerald-700">pas multiple de 3, OU pas de 5</span></div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Deux réflexes : nier « tous » donne « au moins un… ne pas » ; nier un <strong>ET</strong> donne un <strong>OU</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-negation-limite',
        type: 'memoriser',
        title: '⭐ La négation de « &gt; 5 » est « ≤ 5 »',
        summary: 'Le cas limite appartient à la négation : 5 n’est pas &gt; 5.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-1.5">
              <div className="font-mono text-lg font-black text-rose-700">NON (n &gt; 5) ⟺ n ≤ 5</div>
              <div className="text-xs text-rose-600">et non « n &lt; 5 », qui oublierait 5</div>
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Implication et réciproque : le seul cas interdit, contraposée,
       réciproque. */
    3: [
      {
        id: 'implication',
        type: 'concepts',
        title: 'Implication P ⇒ Q',
        summary: '« Si P alors Q » interdit un seul cas : P vraie et Q fausse.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              L’implication ne dit pas que P est vraie. Elle dit qu’<strong>on ne peut pas</strong> avoir P vraie
              avec Q fausse.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono font-bold text-slate-800">n multiple de 4 ⇒ n pair</div>
              <div className="text-xs text-slate-500">Aucun multiple de 4 n’est impair : la case interdite est vide.</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Savoir que Q est vraie ne dit <strong>rien</strong> sur P : 10 est pair, on ne peut rien en conclure sur
              « multiple de 4 ».
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les quatre cases, et celle qu’il fallait laisser vide.</div>
          </div>
        ),
      },
      {
        id: 'reciproque',
        type: 'concepts',
        title: 'Réciproque Q ⇒ P',
        summary: 'Une autre affirmation, à tester séparément : elle peut être fausse quand l’implication est vraie.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1.5">
              <div className="font-mono text-sm text-emerald-700">multiple de 4 ⇒ pair &nbsp;— vraie</div>
              <div className="font-mono text-sm text-rose-600">pair ⇒ multiple de 4 &nbsp;— fausse</div>
              <div className="text-xs text-slate-500">2, 6, 10, 14 sont pairs sans être multiples de 4.</div>
            </div>
            <p className="text-sm text-slate-600">
              Une implication et sa réciproque sont deux affirmations différentes : la vérité de l’une ne dit rien
              sur l’autre.
            </p>
          </div>
        ),
      },
      {
        id: 'contraposee',
        type: 'regles',
        title: 'Contraposée : non Q ⇒ non P',
        summary: 'Toujours équivalente à l’implication de départ — elle dit exactement la même chose.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <div className="font-mono text-sm text-slate-800">n multiple de 4 ⇒ n pair</div>
              <div className="text-center text-slate-400 text-xs">⟺ (même affirmation)</div>
              <div className="font-mono text-sm text-slate-800">n non pair ⇒ n non multiple de 4</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Ne pas confondre : la <strong>contraposée</strong> est équivalente, la <strong>réciproque</strong> ne l’est
              pas. Prouver la contraposée prouve l’implication.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-cas-interdit',
        type: 'memoriser',
        title: '⭐ P ⇒ Q interdit un seul cas',
        summary: 'P vraie et Q fausse. C’est tout ce que dit une implication.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="text-lg font-black text-rose-700">P vraie &nbsp;+&nbsp; Q fausse</div>
              <div className="text-sm font-bold text-slate-600">= le seul cas interdit</div>
            </div>
            <p className="text-xs text-slate-500 text-center">Contraposée équivalente · réciproque à tester à part.</p>
          </div>
        ),
      },
    ],

    /* M4 — Équivalence : les deux sens, et le piège des négatifs. */
    4: [
      {
        id: 'equivalence',
        type: 'concepts',
        title: 'Équivalence P ⇔ Q',
        summary: '« P ⇒ Q » ET « Q ⇒ P » : les deux sens tiennent, on lit « si et seulement si ».',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <div className="font-mono font-bold text-slate-800">P ⇔ Q</div>
              <div className="text-xs text-slate-500">= (P ⇒ Q) et (Q ⇒ P) — deux cases interdites, toutes deux vides.</div>
            </div>
            <p className="text-sm text-slate-600">
              Un seul contre-exemple, dans un seul sens, suffit à briser une équivalence.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : « x² = 9 ⇔ x = 3 » et le −3 oublié.</div>
          </div>
        ),
      },
      {
        id: 'regle-equivalence-carre',
        type: 'regles',
        title: 'x² = 9 équivaut à « x = 3 ou x = −3 »',
        summary: 'Un carré oublie le signe : l’équivalence n’est vraie qu’avec les deux solutions.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <div className="font-mono text-sm text-rose-600">x² = 9 ⇔ x = 3 &nbsp;— faux ((−3)² = 9)</div>
              <div className="font-mono text-sm text-emerald-700">x² = 9 ⇔ (x = 3 ou x = −3) &nbsp;— vrai</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Les nombres négatifs sont le piège classique des équivalences : « x &gt; 2 ⇒ x² &gt; 4 » est vraie, mais
              la réciproque tombe sur x = −3.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-choisir-symbole',
        type: 'methodes',
        title: 'Choisir entre ⇒ et ⇔',
        summary: 'Tester chaque sens séparément ; n’écrire ⇔ que si les deux tiennent.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Tester le sens direct : existe-t-il un cas où P est vraie et Q fausse ?</li>
              <li>Tester la réciproque de la même façon, sur un domaine qui contient les négatifs.</li>
              <li>Les deux tiennent → ⇔. Un seul tient → ⇒, et le sens compte.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 text-sm">
              <div><span className="font-mono">n pair ⇔ n multiple de 2</span> <span className="text-xs text-slate-500">— même définition</span></div>
              <div><span className="font-mono">x = 2 ⇔ 3x = 6</span> <span className="text-xs text-slate-500">— réversible</span></div>
              <div><span className="font-mono">n mult. de 6 ⇒ n mult. de 3</span> <span className="text-xs text-slate-500">— seulement (9 !)</span></div>
            </div>
          </div>
        ),
      },
    ],

    /* M5 (ex-M6) — Par l'absurde et disjonction des cas ; la boîte à outils
       complète du raisonnement. */
    5: [
      {
        id: 'raisonnement-absurde',
        type: 'methodes',
        title: 'Raisonner par l’absurde',
        summary: 'Supposer le contraire, aboutir à une contradiction, conclure que la supposition était fausse.',
        body: (
          <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li><strong>Supposer</strong> le contraire de ce qu’on veut montrer.</li>
              <li><strong>Raisonner</strong> normalement à partir de cette supposition.</li>
              <li><strong>Se cogner</strong> à une contradiction, une impossibilité.</li>
              <li><strong>Conclure</strong> : la supposition était fausse, donc l’énoncé est vrai.</li>
            </ol>
            <div className="bg-white rounded-xl border border-emerald-100 p-3">
              <div className="text-slate-400 text-xs mb-1">Exemple</div>
              <div className="text-sm text-slate-700">
                13 élèves, 12 mois. Supposons qu’aucun mois ne soit partagé : au plus un élève par mois, donc au plus
                12 élèves. Contradiction — deux élèves partagent forcément un mois.
              </div>
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le treizième élève, et la case qui manque.</div>
          </div>
        ),
      },
      {
        id: 'disjonction-cas',
        type: 'methodes',
        title: 'Raisonner par disjonction des cas',
        summary: 'Découper en cas qui couvrent TOUT, puis conclure dans chacun.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">Montrer que <MathText>{'$n(n+1)$'}</MathText> est pair pour tout n</div>
              <div className="text-sm text-slate-700"><strong>Cas 1</strong> — n pair : le produit l’est.</div>
              <div className="text-sm text-slate-700"><strong>Cas 2</strong> — n impair : alors n + 1 est pair, le produit l’est.</div>
              <div className="text-xs text-slate-500">Les deux cas couvrent tout : le résultat vaut pour tout n.</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              La condition essentielle : les cas doivent <strong>couvrir toutes</strong> les possibilités, sans exception.
            </div>
          </div>
        ),
      },
      {
        id: 'vocab-quatre-outils',
        type: 'vocabulaire',
        title: 'Les quatre façons de démontrer',
        summary: 'Direct, contraposée, absurde, disjonction des cas.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-xl bg-white border border-violet-200 p-2.5">
                <strong>Direct</strong> — partir de l’hypothèse, dérouler jusqu’à la conclusion.
              </div>
              <div className="rounded-xl bg-white border border-violet-200 p-2.5">
                <strong>Contraposée</strong> — prouver « non Q ⇒ non P », équivalent.
              </div>
              <div className="rounded-xl bg-white border border-violet-200 p-2.5">
                <strong>Absurde</strong> — supposer le contraire, trouver une contradiction.
              </div>
              <div className="rounded-xl bg-white border border-violet-200 p-2.5">
                <strong>Disjonction des cas</strong> — découper, conclure partout.
              </div>
            </div>
            <div className="bg-violet-50 rounded-lg p-3 text-xs text-violet-700">
              Et pour réfuter, un cinquième réflexe, plus rapide que tous : le contre-exemple.
            </div>
          </div>
        ),
      },
    ],
  },
};
