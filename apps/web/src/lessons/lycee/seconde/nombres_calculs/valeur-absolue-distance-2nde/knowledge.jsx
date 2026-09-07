import React from 'react';
import RealLine from '../../../../common/components/RealLine';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Valeur absolue et distance » — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte des connaissances ; la
 * carte que voit l'élève est la réduction cumulative des modules validés
 * (components/knowledgeState.js). Deux présentations consomment ces données :
 * le tiroir « Ma carte » (components/KnowledgeMap.jsx) et l'« À retenir » de
 * fin de module (components/KnowledgeSnapshot.jsx) ; la synthèse du test
 * final affiche la carte complète. Aucun module n'écrit son propre résumé.
 *
 * Règle d'or : un item n'utilise que des notions déjà rencontrées par l'élève
 * au module qui le déclare. La distance à 0 arrive au module 1, le calcul de
 * |x| au module 2, la distance entre deux nombres au module 3, le lien avec
 * les intervalles au module 4.
 *
 * Numérotation : le module « À retenir » (ex-05) a été supprimé ;
 * « Situations » est devenu le module 5 et le test final le module 6.
 */

const line = (props) => (
  <div className="rounded-xl border border-slate-200 bg-white p-1.5">
    <RealLine step={1} {...props} />
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Deux bateaux : |x| comme distance à 0, et les deux positions à
       une distance donnée. Aucun calcul encore. */
    1: [
      {
        id: 'valeur-absolue-distance-zero',
        type: 'concepts',
        title: 'Valeur absolue',
        summary: '|x| est la distance de x à 0 — une longueur, jamais négative.',
        visual: line({
          min: -6, max: 6,
          points: [
            { id: 'a', value: -4, label: '−4', tone: 'amber' },
            { id: 'o', value: 0, label: '0', tone: 'indigo' },
            { id: 'b', value: 4, label: '4', tone: 'emerald' },
          ],
          ariaLabel: 'Les nombres −4 et 4, tous deux à 4 unités de 0',
        }),
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              <span className="font-mono font-bold text-slate-900">|x|</span> se lit « valeur absolue de x ». C’est la
              longueur de la barre entre x et 0.
            </p>
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>|−4| = |4| = 4</div>
              <div>|−7| = 7</div>
              <div>|0| = 0</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              Une distance ne regarde pas le sens : au km −4 comme au km +4, on est à 4 km du phare.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le phare au km 0, et la barre verte qui s’étire.</div>
          </div>
        ),
      },
      {
        id: 'regle-opposes-meme-distance',
        type: 'regles',
        title: 'Un nombre et son opposé ont la même valeur absolue',
        summary: '|x| = |−x| : x et −x sont à la même distance de 0, de part et d’autre.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3">
              <div className="font-mono font-bold text-slate-800">|x| = |−x|</div>
              <div className="text-xs text-slate-500 mt-1">|−5| = |5| = 5</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Conséquence : il y a toujours <strong>deux</strong> positions à une distance donnée de 0 — une de chaque
              côté. Sauf pour la distance 0, qui n’en a qu’une.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-valeur-absolue-positive',
        type: 'memoriser',
        title: '⭐ Une valeur absolue n’est jamais négative',
        summary: '|x| ≥ 0 toujours, et |x| = 0 seulement pour x = 0.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <div className="font-mono text-xl font-black text-rose-700">|x| ≥ 0</div>
              <div className="text-xs text-rose-600">c’est une longueur</div>
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Calculer |x| : les deux règles de la machine, et le sens de −x. */
    2: [
      {
        id: 'regle-calcul-valeur-absolue',
        type: 'regles',
        title: 'Calculer |x| : deux règles',
        summary: '|x| = x si x ≥ 0, et |x| = −x si x < 0.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <MathText>{'$|x| = x \\quad \\text{si } x \\geq 0$'}</MathText>
              <MathText>{'$|x| = -x \\quad \\text{si } x < 0$'}</MathText>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Le signe « − » de −x ne veut pas dire « négatif », il veut dire <strong>l’opposé de</strong>. Si
              x = −12,75, alors −x = 12,75 : la deuxième règle rend bien une longueur positive.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la machine à deux règles, et celle qui s’allume selon le signe.</div>
          </div>
        ),
      },
      {
        id: 'methode-calculer-expression-absolue',
        type: 'methodes',
        title: 'Calculer une expression avec des barres',
        summary: 'D’abord ce qu’il y a entre les barres, puis la distance à 0, et enfin ce qui est devant.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>|3 − 5| = |−2| = 2</div>
              <div>−|−3| = −(3) = −3</div>
              <div>|−6| − |6| = 6 − 6 = 0</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Les barres jouent le rôle de parenthèses : on termine le calcul intérieur avant de prendre la distance
              à 0.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — La distance entre deux nombres : |b − a|, symétrique et
       invariante par translation. */
    3: [
      {
        id: 'distance-deux-nombres',
        type: 'concepts',
        title: 'Distance entre deux nombres',
        summary: 'La distance entre a et b vaut |b − a| = |a − b| : l’ordre n’a pas d’importance.',
        visual: line({
          min: -6, max: 6,
          intervals: [{ id: 'd', from: -3, to: 5, tone: 'emerald', label: 'distance 8' }],
          points: [
            { id: 'a', value: -3, label: 'A', tone: 'amber' },
            { id: 'b', value: 5, label: 'B', tone: 'indigo' },
          ],
          ariaLabel: 'Distance de 8 entre les points −3 et 5',
        }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-blue-100 p-3 space-y-1">
              <MathText>{'$d(a\\,;\\,b) = |b - a| = |a - b|$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">
                5 − (−3) = 8 et (−3) − 5 = −8 : les deux valeurs absolues valent 8.
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
              La distance à 0 du module 1 n’était que le cas particulier a = 0 : |x − 0| = |x|.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux bateaux, et la barre entre eux.</div>
          </div>
        ),
      },
      {
        id: 'regle-distance-invariante',
        type: 'regles',
        title: 'La distance ne dépend que de l’écart',
        summary: 'Déplacer les deux nombres du même pas ne change pas leur distance.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Quand A et B avancent ensemble de 2 km, la barre entre eux garde exactement la même longueur.
            </p>
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1 font-mono text-sm text-slate-800">
              <div>A = −3, B = 5 → 8</div>
              <div>A = −1, B = 7 → 8</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Attention aux nombres du même côté de 0 : la distance entre −7,5 et −2 est 5,5, pas 9,5 — on soustrait,
              on n’additionne pas.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-distance',
        type: 'memoriser',
        title: '⭐ d(a ; b) = |b − a|',
        summary: 'Soustraire dans n’importe quel ordre, la valeur absolue s’occupe du signe.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <MathText>{'$|b - a| = |a - b|$'}</MathText>
              <div className="text-xs text-rose-600">la distance entre deux nombres</div>
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Le faisceau : le lien entre valeur absolue et intervalle, et
       l'équation |x − a| = r. */
    4: [
      {
        id: 'faisceau-intervalle',
        type: 'regles',
        title: '|x − a| ≤ r décrit un intervalle',
        summary: 'Les x à distance au plus r de a forment [a − r ; a + r] — strict ⇔ intervalle ouvert.',
        visual: line({
          min: -2, max: 8,
          intervals: [{ id: 'beam', from: 1, to: 5, tone: 'amber', label: '[1 ; 5]' }],
          points: [
            { id: 'c', value: 3, label: 'a = 3', tone: 'indigo' },
            { id: 'l', value: 1, label: '3 − 2', tone: 'emerald' },
            { id: 'r', value: 5, label: '3 + 2', tone: 'emerald' },
          ],
          ariaLabel: 'Faisceau centré en 3, de rayon 2, de 1 à 5',
        }),
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1.5">
              <MathText>{'$|x - a| \\leq r \\iff x \\in [a - r\\,;\\,a + r]$'}</MathText>
              <MathText>{'$|x - a| < r \\iff x \\in \\,]a - r\\,;\\,a + r[$'}</MathText>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Le faisceau est <strong>symétrique</strong> autour du centre : il éclaire des deux côtés. Un signe large
              inclut les bords, un signe strict les exclut — exactement comme un crochet.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le bateau-test promené jusqu’au bord du faisceau.</div>
          </div>
        ),
      },
      {
        id: 'equation-distance-egale',
        type: 'regles',
        title: '|x − a| = r a deux solutions',
        summary: 'Les deux bords du faisceau : a − r et a + r.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <MathText>{'$|x - 3| = 2 \\iff x = 1 \\ \\text{ou} \\ x = 5$'}</MathText>
              <div className="text-xs text-slate-500 mt-1">une position de chaque côté du centre.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Cas particuliers : si r = 0 il n’y a qu’une solution (x = a) ; si r &lt; 0, aucune — une distance
              n’est jamais négative.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-centre-rayon',
        type: 'methodes',
        title: 'Retrouver le centre et le rayon d’un intervalle',
        summary: 'Le centre est le milieu des bornes, le rayon la moitié de la longueur.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5">
              <div className="text-slate-400 text-xs">L’intervalle [−1 ; 7]</div>
              <div className="font-mono text-sm text-slate-800">centre = (−1 + 7) ÷ 2 = 3</div>
              <div className="font-mono text-sm text-slate-800">rayon = (7 − (−1)) ÷ 2 = 4</div>
              <MathText>{'$[-1\\,;\\,7] \\iff |x - 3| \\leq 4$'}</MathText>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              C’est le chemin inverse du faisceau : d’un intervalle vers son écriture en valeur absolue.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-faisceau',
        type: 'memoriser',
        title: '⭐ |x − a| ≤ r ⇔ x ∈ [a − r ; a + r]',
        summary: 'Centre a, rayon r : une distance devient un intervalle.',
        body: (
          <div className="space-y-3">
            <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
              <MathText>{'$|x - a| \\leq r \\iff a - r \\leq x \\leq a + r$'}</MathText>
              <div className="flex justify-center gap-3 flex-wrap pt-1">
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">a = centre</span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">r = rayon</span>
              </div>
            </div>
          </div>
        ),
      },
    ],

    /* M5 (ex-M6) — Situations : reconnaître un centre et un rayon dans un
       énoncé. */
    5: [
      {
        id: 'methode-tolerance',
        type: 'methodes',
        title: 'Traduire une tolérance ou une plage',
        summary: 'Une valeur cible ± une marge, ou deux bornes : dans les deux cas un centre et un rayon.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-emerald-100 p-3 space-y-1.5 text-sm">
              <div className="text-slate-400 text-xs">Une vis de 20 mm à 0,5 mm près</div>
              <div className="font-mono text-slate-800">|d − 20| ≤ 0,5 ⟺ d ∈ [19,5 ; 20,5]</div>
              <div className="text-slate-400 text-xs pt-1.5">Un vaccin entre 2 °C et 8 °C inclus</div>
              <div className="font-mono text-slate-800">centre 5, rayon 3 → |T − 5| ≤ 3</div>
              <div className="text-slate-400 text-xs pt-1.5">À moins de 1,5 km de la borne 12 (strictement)</div>
              <div className="font-mono text-slate-800">|x − 12| &lt; 1,5 ⟺ x ∈ ]10,5 ; 13,5[</div>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-xs text-emerald-700">
              Les mots donnent le crochet : « inclus », « à … près » et « au plus » sont larges ; « strictement » et
              « moins de » sont stricts.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la vis, le vaccin et le randonneur — trois distances déguisées.</div>
          </div>
        ),
      },
      {
        id: 'regle-deux-positions',
        type: 'regles',
        title: 'Une distance donnée définit deux positions',
        summary: 'À 3 km d’un phare situé au km −2 : au km −5 ou au km 1.',
        body: (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-orange-100 p-3 space-y-1">
              <div className="font-mono text-sm text-slate-800">|x + 2| = 3 ⟺ x = −5 ou x = 1</div>
              <div className="text-xs text-slate-500">−2 − 3 = −5 et −2 + 3 = 1, de part et d’autre du centre.</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 text-xs text-orange-700">
              Piège fréquent : répondre ±3, qui serait la réponse pour un phare au km 0. Le centre compte.
            </div>
          </div>
        ),
      },
    ],
  },
};
