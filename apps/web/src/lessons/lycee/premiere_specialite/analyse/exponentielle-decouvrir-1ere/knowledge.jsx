import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Exponentielle : la fonction égale à sa dérivée » — SOURCE
 * UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le geste
 * vient de lui donner du sens.
 */
const expo = (x) => Math.exp(x);
const I = '#4f46e5';   // la courbe
const T = '#e11d48';   // la tangente
const A = '#d97706';   // le point de contact
const G = '#94a3b8';   // le contre-exemple

export const LESSON_KNOWLEDGE = {
  modules: {
    2: [
      {
        id: 'propriete-caracteristique',
        type: 'concepts',
        title: 'Une pente égale à la hauteur',
        summary:
          'Une fonction f vérifie la propriété caractéristique lorsque f′(x) = f(x) pour tout x : en chaque point, la pente de sa courbe est égale à son ordonnée.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-1.6} xMax={1.6} yMin={-0.4} yMax={5}
            functions={[{ fn: expo, color: I }, { fn: (x) => x + 1, color: T, dashed: true }]}
            points={[{ x: 0, y: 1, color: A, label: '1', labelPos: 'l' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$f\'(x) = f(x) \\quad \\text{pour tout } x$$'}</MathText>
            </div>
            <p>
              C’est une exigence très forte : elle relie les deux nombres attachés à un même
              point. Là où la courbe est haute, elle monte vite ; là où elle est basse, elle monte
              lentement. La montée s’accélère donc d’elle-même.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Ce n’est PAS « la courbe monte » : une droite qui monte a une pente constante alors
              que sa hauteur change. Ici les deux nombres doivent rester égaux à chaque instant.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : chaque segment tiré, dont l’inclinaison était imposée par la hauteur atteinte.</div>
          </div>
        ),
      },
      {
        id: 'exponentielle-definition',
        type: 'vocabulaire',
        title: 'La fonction exponentielle',
        summary:
          'La fonction exponentielle est l’unique fonction définie sur ℝ telle que f′ = f et f(0) = 1. On la note exp, et exp(x) s’écrit aussi e^x.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\exp\' = \\exp \\quad \\text{et} \\quad \\exp(0) = 1$$'}</MathText>
            </div>
            <p>
              Les deux conditions comptent. Sans la seconde, une infinité de fonctions
              conviendraient — toutes celles obtenues en changeant la hauteur de départ. Avec
              elle, il n’en reste plus qu’une.
            </p>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              Le nombre <strong>e</strong> est la valeur de cette fonction en 1 :
              e = exp(1) ≈ 2,718. On écrit alors exp(x) = e^x.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois hauteurs de départ, dont une seule passait par 1.</div>
          </div>
        ),
      },
      {
        id: 'mem-exp-egale-sa-derivee',
        type: 'memoriser',
        title: '⭐ exp′ = exp et exp(0) = 1',
        summary: 'Ces deux lignes définissent l’exponentielle à elles seules.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">exp′ = exp&nbsp;&nbsp;et&nbsp;&nbsp;exp(0) = 1</div>
            <p className="text-xs text-rose-700">deux exigences, une seule fonction possible</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'exp-definie-sur-r',
        type: 'regles',
        title: 'Définie sur ℝ tout entier',
        summary:
          'La construction se poursuit indéfiniment vers la droite comme vers la gauche : rien ne l’arrête. L’exponentielle est définie pour tout nombre réel.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              À chaque point, la règle donne une pente — et une pente permet toujours de continuer.
              Aucune valeur interdite, aucun trou : l’ensemble de définition est <strong>ℝ</strong>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Contrairement à 1/x, qui refuse 0, ou à √x, qui refuse les nombres négatifs,
              l’exponentielle accepte tout.
            </div>
          </div>
        ),
      },
      {
        id: 'exp-strictement-positive',
        type: 'regles',
        title: 'Toujours strictement positive',
        summary:
          'exp(x) > 0 pour tout x : la courbe reste au-dessus de l’axe des abscisses, sans jamais le toucher ni le franchir.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-3} xMax={1.4} yMin={-0.5} yMax={4}
            functions={[{ fn: expo, color: I }, { fn: () => 0, color: G, dashed: true }]}
            points={[{ x: 0, y: 1, color: A, label: '1', labelPos: 'l' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3">
              <p className="font-semibold text-sky-900 mb-1">Pourquoi c’est impossible qu’elle s’annule</p>
              <p>
                Supposons qu’elle vaille 0 en un point. Comme la pente est égale à la hauteur, la
                pente y vaudrait 0 aussi : la courbe serait plate. Plate et nulle, elle resterait
                nulle partout — donc aussi en 0. Or elle vaut 1 en 0. C’est contradictoire : elle ne
                s’annule nulle part.
              </p>
            </div>
            <p>
              Partant d’une valeur strictement positive, elle ne peut donc jamais atteindre 0 :
              elle reste strictement positive sur ℝ.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la construction partie de la hauteur 0, qui n’a jamais décollé.</div>
          </div>
        ),
      },
      {
        id: 'mem-exp-jamais-nulle',
        type: 'memoriser',
        title: '⭐ exp(x) > 0 pour tout x',
        summary: 'La courbe ne coupe jamais l’axe des abscisses.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">exp(x) &gt; 0</div>
            <p className="text-xs text-rose-700">jamais nulle, jamais négative — quelle que soit la valeur de x</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'exp-strictement-croissante',
        type: 'regles',
        title: 'Strictement croissante sur ℝ',
        summary:
          'Sa dérivée est elle-même, donc strictement positive : d’après le théorème du sens de marche, l’exponentielle est strictement croissante sur ℝ.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$\\exp\'(x) = \\exp(x) > 0 \\;\\Longrightarrow\\; \\exp \\text{ strictement croissante}$$'}</MathText>
            </div>
            <p>
              L’enchaînement tient en trois pas : la dérivée est la fonction elle-même ; cette
              fonction est strictement positive ; une dérivée strictement positive donne une
              fonction strictement croissante. Aucune valeur à calculer, aucune équation à
              résoudre.
            </p>
            <div className="overflow-x-auto rounded-xl border border-emerald-100 bg-white">
              <table className="w-full text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left">x</th><td>−∞</td><td className="w-24" /><td>+∞</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left">exp′(x)</th><td /><td className="font-bold text-emerald-700">+</td><td /></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left">exp</th><td /><td className="font-bold text-emerald-700">↗</td><td /></tr>
              </tbody></table>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Une seule flèche, sans retournement : la dérivée ne change jamais de signe, donc il
              n’y a ni plus grande ni plus petite valeur atteinte.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le tableau à une seule flèche, tranché sans un seul calcul.</div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'tangente-en-zero',
        type: 'formules',
        title: 'La tangente en 0 : y = x + 1',
        summary:
          'Au point (0 ; 1), la pente vaut exp(0) = 1 et l’ordonnée vaut 1 : la tangente a pour équation y = x + 1.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-2.2} xMax={1.6} yMin={-1.2} yMax={4.4}
            functions={[{ fn: expo, color: I }, { fn: (x) => x + 1, color: T }]}
            points={[{ x: 0, y: 1, color: A, label: '(0 ; 1)', labelPos: 'l' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$y = \\exp\'(0)(x - 0) + \\exp(0) = x + 1$$'}</MathText>
            </div>
            <p>
              Les deux nombres nécessaires valent 1, et pour la même raison : la pente EST la
              hauteur. C’est le seul point de la courbe où l’on connaît les deux sans rien calculer.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Écrire y = x est l’erreur classique — cette droite passe par (0 ; 0) et rate donc le
              point de contact, qui est (0 ; 1).
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la droite qui touche la courbe en (0 ; 1) et passe dessous partout ailleurs.</div>
          </div>
        ),
      },
      {
        id: 'exp-comportement-aux-bornes',
        type: 'concepts',
        title: 'Aux deux bouts de la courbe',
        summary:
          'Vers la droite, la courbe s’élève de plus en plus vite ; vers la gauche, elle se rapproche de l’axe des abscisses sans jamais l’atteindre.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              Les deux comportements viennent de la même règle. À droite, la hauteur est grande
              donc la pente est grande, donc la hauteur grandit encore : la montée s’emballe.
            </p>
            <p>
              À gauche, la hauteur est petite donc la pente est petite : la courbe s’aplatit et
              se colle à l’axe — sans jamais le toucher, puisqu’elle ne s’annule nulle part.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « Se rapprocher de l’axe » n’est pas « l’atteindre » : exp(−10) est minuscule, mais
              strictement positif.
            </div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'regle-derivee-exp-u',
        type: 'regles',
        title: 'Dériver e^{ax+b}',
        summary:
          'La dérivée de x ↦ e^{ax+b} est x ↦ a·e^{ax+b} : l’exponentielle se recopie, et le coefficient de x sort en facteur.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-100 bg-white p-3 text-center">
              <MathText>{'$$\\left(e^{ax+b}\\right)\' = a \\cdot e^{ax+b}$$'}</MathText>
            </div>
            <p>
              C’est le geste de la composée, déjà connu : on dérive l’enveloppe — qui se recopie à
              l’identique, puisque l’exponentielle est sa propre dérivée — et l’on multiplie par la
              dérivée de l’intérieur, qui vaut <strong>a</strong>.
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"><MathText>{'$(e^{2x})\' = 2e^{2x}$'}</MathText></div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"><MathText>{'$(e^{-x})\' = -e^{-x}$'}</MathText></div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2"><MathText>{'$(e^{3x+1})\' = 3e^{3x+1}$'}</MathText></div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Oublier le facteur donne une pente fausse. Le nombre <strong>b</strong>, lui, ne sort
              jamais : il ne change pas la vitesse, seulement la position.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le facteur qui descend devant, exactement comme pour une composée.</div>
          </div>
        ),
      },
      {
        id: 'mem-facteur-descend',
        type: 'memoriser',
        title: '⭐ (e^{ax+b})′ = a·e^{ax+b}',
        summary: 'L’exponentielle se recopie ; le coefficient de x descend en facteur.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">(e^(ax+b))′ = a · e^(ax+b)</div>
            <p className="text-xs text-rose-700">le facteur oublié est l’erreur la plus fréquente</p>
          </div>
        ),
      },
    ],
  },
};
