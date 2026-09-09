import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Second degré : résoudre » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 */
const I = '#4f46e5';   // la parabole
const R = '#e11d48';   // les racines
const A = '#d97706';   // le sommet

const p = (a, b, c) => (x) => a * x * x + b * x + c;

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'trinome-second-degre',
        type: 'vocabulaire',
        title: 'Trinôme du second degré',
        summary:
          'Une expression de la forme ax² + bx + c, avec a ≠ 0. Sa courbe est une parabole, et résoudre ax² + bx + c = 0 revient à chercher où cette parabole rencontre l’axe des abscisses.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-1} xMax={5} yMin={-5} yMax={4}
            functions={[{ fn: p(1, -4, 0), color: I }]}
            points={[{ x: 0, y: 0, color: R }, { x: 4, y: 0, color: R }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-indigo-100 bg-white p-3 text-center">
              <MathText>{'$$ax^2 + bx + c \\quad \\text{avec } a \\neq 0$$'}</MathText>
            </div>
            <p>
              <strong>a</strong>, <strong>b</strong> et <strong>c</strong> sont les trois
              coefficients. Le premier, a, ne peut pas être nul : sinon il ne resterait que
              bx + c, une expression du premier degré, et la courbe serait une droite.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Attention à l’ordre : dans 3 − 2x + x², on a a = 1, b = −2 et c = 3. Le coefficient
              se lit sur le terme, pas sur la position d’écriture.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la parabole que tu as fait monter et descendre.</div>
          </div>
        ),
      },
      {
        id: 'points-axe-abscisses',
        type: 'concepts',
        title: 'Les points d’intersection avec l’axe des abscisses',
        summary:
          'Un point de la courbe posé sur l’axe des abscisses a une ordonnée nulle : son abscisse est donc une solution de ax² + bx + c = 0. Il y en a deux, un seul, ou aucun.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Une parabole peut rencontrer l’axe des abscisses de trois façons seulement, et le
              laboratoire les a toutes montrées : elle le traverse en <strong>deux</strong> points,
              elle le touche en <strong>un seul</strong>, ou elle reste <strong>entièrement</strong>{' '}
              d’un côté.
            </p>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Aucun point commun ne signifie pas « pas de courbe » : la parabole existe toujours,
              elle passe simplement au-dessus (ou en dessous) sans jamais toucher l’axe.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux points rouges qui se rejoignent, puis s’effacent.</div>
          </div>
        ),
      },
      {
        id: 'un-nombre-predit',
        type: 'concepts',
        title: 'Un seul nombre prédit le nombre de solutions',
        summary:
          'Le nombre b² − 4ac change de signe exactement au moment où les deux points d’intersection se rejoignent : positif → deux points, nul → un point, négatif → aucun.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
              <table className="w-full font-mono text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left">c</th><td>0</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left">b² − 4ac</th><td>16</td><td>8</td><td>4</td><td>0</td><td>−4</td><td>−8</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left">points</th><td>2</td><td>2</td><td>2</td><td>1</td><td>0</td><td>0</td></tr>
              </tbody></table>
            </div>
            <p>
              Sur y = x² − 4x + c, ce nombre vaut 16 − 4c. Il s’annule en c = 4, et c’est
              exactement là que les deux points fusionnent : <strong>on peut donc compter les
              solutions sans en calculer aucune.</strong>
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux afficheurs qui basculent au même cran.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'discriminant',
        type: 'vocabulaire',
        title: 'Le discriminant Δ',
        summary:
          'Le nombre b² − 4ac s’appelle le discriminant du trinôme ax² + bx + c. Il se note Δ, la lettre grecque « delta ».',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\Delta = b^2 - 4ac$$'}</MathText>
            </div>
            <p>
              « Discriminant » vient de <em>discriminer</em> : distinguer, trancher. Ce nombre
              tranche entre les trois cas possibles, et il le fait avant toute résolution.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              C’est b² et non b : sur x² − 4x + 3, Δ = (−4)² − 4 × 1 × 3 = 16 − 12 = 4. Un carré
              efface le signe de b — mais pas celui de a ni de c.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-calculer-delta',
        type: 'methodes',
        title: 'Calculer un discriminant',
        summary:
          'Ranger l’équation sous la forme ax² + bx + c = 0, relever a, b et c avec leurs signes, puis appliquer Δ = b² − 4ac.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Tout ramener d’un même côté : l’équation doit finir par « = 0 ».</li>
            <li>Relever a, b et c <strong>avec leur signe</strong> : sur 2x² − x − 3, a = 2, b = −1, c = −3.</li>
            <li>Élever b au carré : (−1)² = 1.</li>
            <li>Calculer 4ac : 4 × 2 × (−3) = −24.</li>
            <li>Soustraire : Δ = 1 − (−24) = 25.</li>
          </ol>
        ),
      },
      {
        id: 'mem-delta',
        type: 'memoriser',
        title: '⭐ Δ = b² − 4ac',
        summary: 'Le discriminant se calcule avant tout, et son SIGNE donne le nombre de solutions.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">Δ = b² − 4ac</div>
            <p className="text-xs text-rose-700">Δ &gt; 0 → deux solutions · Δ = 0 → une · Δ &lt; 0 → aucune</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'racine-trinome',
        type: 'vocabulaire',
        title: 'Racine d’un trinôme',
        summary:
          'Une racine du trinôme ax² + bx + c est un nombre qui l’annule : c’est une solution de l’équation ax² + bx + c = 0, et l’abscisse d’un point de la parabole posé sur l’axe.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Trois mots pour la même chose : <strong>solution</strong> de l’équation,{' '}
              <strong>racine</strong> du trinôme, <strong>abscisse d’un point</strong>{' '}
              d’intersection avec l’axe. On vérifie toujours de la même façon — en remplaçant x
              par le nombre trouvé : le trinôme doit valoir 0.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs">
              1,5 est-elle racine de 2x² − x − 3 ? 2 × 2,25 − 1,5 − 3 = 4,5 − 4,5 = 0. ✔
            </div>
          </div>
        ),
      },
      {
        id: 'formule-racines',
        type: 'formules',
        title: 'La formule des racines',
        summary:
          'Quand Δ ≥ 0, les racines de ax² + bx + c s’obtiennent par (−b ± √Δ) / (2a). Quand Δ = 0, les deux valeurs se confondent en une seule : −b / (2a).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-indigo-100 bg-white p-3 text-center">
              <MathText>{'$$x_1 = \\frac{-b - \\sqrt{\\Delta}}{2a} \\qquad x_2 = \\frac{-b + \\sqrt{\\Delta}}{2a}$$'}</MathText>
            </div>
            <p>
              Le <strong>−b</strong> est au numérateur tout entier, et le <strong>2a</strong> divise
              tout : la barre de fraction passe sous les deux morceaux, pas seulement sous √Δ.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Sur 2x² − x − 3 : Δ = 25, donc x = (1 ± 5) / 4, soit −1 et 1,5. Écrire
              −b + √Δ / 2a — sans la grande barre — donnerait 1 + 1,25 = 2,25, qui n’annule pas
              le trinôme.
            </div>
          </div>
        ),
      },
      {
        id: 'trois-cas-selon-delta',
        type: 'regles',
        title: 'Les trois cas selon le signe de Δ',
        summary:
          'Δ > 0 : deux racines distinctes. Δ = 0 : une racine double. Δ < 0 : aucune racine réelle — et l’équation n’a alors aucune solution.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-2} xMax={6} yMin={-3} yMax={6}
            functions={[
              { fn: p(1, -4, 3), color: I },
              { fn: p(1, -4, 4), color: A, dashed: true },
              { fn: p(1, -4, 6), color: R, dashed: true },
            ]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>Δ &gt; 0</strong> — deux racines, la parabole traverse l’axe en deux points</div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900"><strong>Δ = 0</strong> — une racine double, la parabole touche l’axe sans le traverser</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><strong>Δ &lt; 0</strong> — aucune racine réelle, la parabole reste d’un seul côté</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Δ &lt; 0 ne veut pas dire « erreur de calcul » : c’est une réponse complète. On écrit
              alors que l’équation n’a pas de solution réelle, et l’ensemble des solutions est vide.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-resoudre-second-degre',
        type: 'methodes',
        title: 'Résoudre une équation du second degré',
        summary:
          'Ramener à ax² + bx + c = 0, relever a, b, c, calculer Δ, puis conclure selon son signe — et seulement alors appliquer la formule.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire l’équation sous la forme <strong>ax² + bx + c = 0</strong>.</li>
              <li>Relever a, b et c avec leurs signes.</li>
              <li>Calculer <strong>Δ = b² − 4ac</strong>.</li>
              <li>Conclure sur le NOMBRE de solutions avant d’en chercher une seule.</li>
              <li>Si Δ ≥ 0, appliquer (−b ± √Δ) / (2a), puis vérifier en remplaçant.</li>
            </ol>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le compteur de points qui répondait avant tout calcul.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'forme-factorisee-trinome',
        type: 'formules',
        title: 'La forme factorisée d’un trinôme',
        summary:
          'Quand le trinôme a deux racines x₁ et x₂, il s’écrit a(x − x₁)(x − x₂). Quand il a une racine double x₀, il s’écrit a(x − x₀)².',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-indigo-100 bg-white p-3 text-center">
              <MathText>{'$$ax^2 + bx + c = a(x - x_1)(x - x_2)$$'}</MathText>
            </div>
            <p>
              Le <strong>a</strong> ne disparaît pas : sans lui, (x − x₁)(x − x₂) aurait 1 comme
              coefficient de x². Sur 2x² − x − 3, dont les racines sont −1 et 1,5, la forme
              factorisée est <strong>2(x + 1)(x − 1,5)</strong>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le signe entre DANS la parenthèse : pour la racine −1 on écrit (x + 1), jamais
              (x − −1). Et quand Δ &lt; 0, il n’y a pas de forme factorisée à écrire.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-factoriser-par-racines',
        type: 'methodes',
        title: 'Factoriser un trinôme à partir de ses racines',
        summary:
          'Calculer Δ, trouver les racines, écrire a(x − x₁)(x − x₂), puis redévelopper pour se relire.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Calculer Δ. S’il est négatif, s’arrêter : pas de factorisation.</li>
              <li>Calculer les racines par la formule.</li>
              <li>Écrire <strong>a(x − x₁)(x − x₂)</strong> en faisant entrer les signes.</li>
              <li><strong>Redévelopper</strong> : on doit retrouver le trinôme de départ.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs">
              x² − x − 6 : Δ = 1 + 24 = 25, racines −2 et 3, donc (x + 2)(x − 3). Vérification :
              x² − 3x + 2x − 6 = x² − x − 6. ✔
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le redéveloppement qui retombe sur le trinôme de départ.</div>
          </div>
        ),
      },
      {
        id: 'mem-forme-factorisee',
        type: 'memoriser',
        title: '⭐ a(x − x₁)(x − x₂)',
        summary: 'Les racines donnent la factorisation, et la factorisation redonne les racines.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">ax² + bx + c = a(x − x₁)(x − x₂)</div>
            <p className="text-xs text-rose-700">toujours vérifier : en redéveloppant, on retrouve le trinôme</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'racines-et-parabole',
        type: 'regles',
        title: 'Les racines se lisent sur la parabole',
        summary:
          'Le nombre de points communs entre la parabole et l’axe des abscisses EST le nombre de racines : deux points → Δ > 0, un point → Δ = 0, aucun point → Δ < 0.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-2} xMax={5} yMin={-3} yMax={5}
            functions={[{ fn: p(1, -3, 2), color: I }]}
            points={[{ x: 1, y: 0, color: R }, { x: 2, y: 0, color: R }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Un dessin suffit à donner le signe de Δ, sans le moindre calcul — et réciproquement,
              Δ calculé annonce ce que le dessin montrera.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le sommet ne se confond pas avec une racine : sur x² − 3x + 2, le sommet est en
              (1,5 ; −0,25) alors que les racines valent 1 et 2. Le sommet n’est une racine que
              dans le cas Δ = 0, où il est posé sur l’axe.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les points rouges sur l’axe, un par racine.</div>
          </div>
        ),
      },
    ],
  },
};
