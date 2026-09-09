import React from 'react';
import MathText from '../../../../common/components/MathText';
import { MiniGraph } from '../../../../common/knowledge';

/**
 * Connaissances de « Le nombre dérivé et la tangente » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 */
const carre = (x) => x * x;
const cube = (x) => x ** 3 - 3 * x;
const I = '#4f46e5';   // la courbe
const S = '#0284c7';   // la sécante
const T = '#e11d48';   // la tangente
const A = '#d97706';   // le point de contact

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'taux-variation-secante',
        type: 'concepts',
        title: 'Le taux de variation est une pente',
        summary:
          'Entre A(a ; f(a)) et B(a + h ; f(a + h)), le taux de variation vaut (f(a + h) − f(a)) / h : la montée divisée par l’avancée, c’est-à-dire le coefficient directeur de la sécante (AB).',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-0.5} xMax={3.5} yMin={-1} yMax={9}
            functions={[{ fn: carre, color: I }, { fn: (x) => 3 * x - 2, color: S, dashed: true }]}
            points={[{ x: 1, y: 1, color: A, label: 'A', labelPos: 'l' }, { x: 2, y: 4, color: A, label: 'B', labelPos: 't' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-indigo-100 bg-white p-3 text-center">
              <MathText>{'$$\\frac{f(a+h) - f(a)}{h} = \\text{pente de la sécante } (AB)$$'}</MathText>
            </div>
            <p>
              Deux nombres, jamais un seul : la <strong>montée</strong> f(a + h) − f(a) et
              l’<strong>avancée</strong> h. Une montée de 1,25 sur une avancée de 0,5 fait une
              pente de 2,5, pas de 1,25.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              La montée seule n’est pas le taux : sans diviser par l’avancée, on ne compare pas
              deux pentes entre elles.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le triangle sous la sécante, avec ses deux côtés mesurés.</div>
          </div>
        ),
      },
      {
        id: 'rapprochement-stabilisation',
        type: 'concepts',
        title: 'Quand h rétrécit, les pentes se stabilisent',
        summary:
          'En rapprochant B de A, les pentes des sécantes ne partent pas dans tous les sens : elles se rapprochent d’un nombre fixe, sans que h ait besoin d’atteindre 0.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-indigo-100 bg-white">
              <table className="w-full font-mono text-center text-sm"><tbody>
                <tr className="bg-slate-50"><th className="px-2 py-1 text-left">h</th><td>1</td><td>0,5</td><td>0,25</td><td>0,1</td><td>0,01</td></tr>
                <tr className="border-t"><th className="px-2 py-1 text-left">pente</th><td>3</td><td>2,5</td><td>2,25</td><td>2,1</td><td>2,01</td></tr>
              </tbody></table>
            </div>
            <p>
              Sur f(x) = x² en a = 1, le taux vaut exactement <strong>2 + h</strong>. Il s’approche
              de 2 autant qu’on veut, et ne l’atteint jamais : h = 0 n’a pas de sens, on ne divise
              pas par zéro.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la colonne de pentes qui se tasse pendant que la sécante se couche.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'nombre-derive',
        type: 'vocabulaire',
        title: 'Le nombre dérivé f′(a)',
        summary:
          'Le nombre vers lequel les taux de variation se stabilisent quand h tend vers 0 s’appelle le nombre dérivé de f en a. Il se note f′(a).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$f\'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}$$'}</MathText>
            </div>
            <p>
              C’est un nombre attaché à <strong>un seul point</strong>, pas à un couple de points :
              il ne dépend plus de h. Sur f(x) = x², f′(1) = 2 et f′(3) = 6 — un point, un nombre.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              f′(a) et f(a) sont deux nombres différents : en a = 1, f(1) = 1 tandis que f′(1) = 2.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-calculer-nombre-derive',
        type: 'methodes',
        title: 'Calculer un nombre dérivé par le taux',
        summary:
          'Écrire le taux entre a et a + h, le simplifier jusqu’à faire disparaître le h du dénominateur, puis remplacer h par 0.',
        body: (
          <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
            <li>Écrire le taux : [f(a + h) − f(a)] / h.</li>
            <li>Développer le numérateur et le simplifier : sur x² en a, on obtient (2ah + h²)/h.</li>
            <li>Factoriser par h et simplifier : h(2a + h)/h = 2a + h.</li>
            <li>Faire tendre h vers 0 : il reste f′(a) = 2a.</li>
          </ol>
        ),
      },
    ],
    3: [
      {
        id: 'tangente-position-limite',
        type: 'concepts',
        title: 'La tangente, position limite de la sécante',
        summary:
          'Quand B se rapproche de A, la sécante (AB) se couche sur une droite limite qui passe par A : c’est la tangente à la courbe au point d’abscisse a.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-0.5} xMax={3.5} yMin={-1} yMax={9}
            functions={[{ fn: carre, color: I }, { fn: (x) => 2 * x - 1, color: T }]}
            points={[{ x: 1, y: 1, color: A, label: 'A', labelPos: 'l' }]}
          />
        ),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              La tangente <strong>touche</strong> la courbe en A et l’épouse au plus près autour de
              ce point. Elle passe toujours par le point de contact A(a ; f(a)).
            </p>
          </div>
        ),
      },
      {
        id: 'derive-coefficient-directeur',
        type: 'regles',
        title: 'f′(a) est le coefficient directeur de la tangente',
        summary:
          'Le nombre dérivé se LIT sur le dessin : c’est la pente de la tangente au point d’abscisse a. Positif, la tangente monte ; négatif, elle descend ; nul, elle est horizontale.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-2.4} xMax={2.4} yMin={-3.5} yMax={3.5}
            functions={[{ fn: cube, color: I }, { fn: () => -2, color: T }]}
            points={[{ x: 1, y: -2, color: A, label: 'a = 1', labelPos: 'b' }]}
          />
        ),
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>f′(a) &gt; 0</strong> — la tangente monte</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><strong>f′(a) &lt; 0</strong> — la tangente descend</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>f′(a) = 0</strong> — la tangente est horizontale</div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le signe de f′(a) n’est pas la position de la courbe : en x = 1,5 la courbe de
              g(x) = x³ − 3x est <em>sous</em> l’axe (g = −1,125) et pourtant g′(1,5) = 3,75 &gt; 0,
              la tangente monte.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’escalier +1 → +f′(a) posé sur la tangente.</div>
          </div>
        ),
      },
      {
        id: 'mem-derive-est-la-pente',
        type: 'memoriser',
        title: '⭐ Le nombre dérivé EST la pente de la tangente',
        summary: 'f′(a) = coefficient directeur de la tangente au point d’abscisse a.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">f′(a) = pente de la tangente en a</div>
            <p className="text-xs text-rose-700">un point, un nombre — et ce nombre se lit sur le dessin</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'tangente-peut-recouper',
        type: 'regles',
        title: 'Une tangente peut recouper la courbe',
        summary:
          '« Tangente » décrit ce qui se passe AU POINT de contact, pas sur tout le dessin : plus loin, la droite peut très bien retraverser la courbe.',
        visual: (
          <MiniGraph
            width={220} height={150} xMin={-2.4} xMax={2.4} yMin={-3.5} yMax={3.5}
            functions={[{ fn: cube, color: I }, { fn: () => -2, color: T }]}
            points={[{ x: 1, y: -2, color: A, label: 'contact', labelPos: 'b' }, { x: -2, y: -2, color: S, label: 'recoupe', labelPos: 't' }]}
          />
        ),
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              La tangente à g(x) = x³ − 3x au point d’abscisse 1 est la droite horizontale
              y = −2. Elle touche la courbe en x = 1… et la recoupe en x = −2.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « Elle ne touche qu’en un point » est faux. Ce qui est vrai : au voisinage de a, elle
              est la droite qui colle le mieux à la courbe.
            </div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'formule-equation-tangente',
        type: 'formules',
        title: 'Équation de la tangente',
        summary:
          'La tangente à la courbe de f au point d’abscisse a a pour équation y = f′(a)(x − a) + f(a).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-indigo-100 bg-white p-3 text-center">
              <MathText>{'$$y = f\'(a)(x - a) + f(a)$$'}</MathText>
            </div>
            <p>
              Trois nombres suffisent : le point de contact <strong>a</strong>, l’ordonnée
              <strong> f(a)</strong>, la pente <strong>f′(a)</strong>. Le facteur (x − a) est le
              décalage qui force la droite à passer par le point de contact.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Écrire y = f′(a)x + f(a) est l’erreur classique : cette droite a la bonne pente mais
              passe à côté du point. En a = 2 sur x² : y = 4x + 4 donne 12 en x = 2, alors que la
              courbe y vaut 4.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-ecrire-tangente',
        type: 'methodes',
        title: 'Écrire l’équation d’une tangente',
        summary:
          'Calculer f(a), calculer f′(a), remplacer dans y = f′(a)(x − a) + f(a), puis développer pour obtenir la forme réduite.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Calculer <strong>f(a)</strong> : l’ordonnée du point de contact.</li>
              <li>Calculer <strong>f′(a)</strong> : la pente.</li>
              <li>Remplacer dans y = f′(a)(x − a) + f(a).</li>
              <li>Développer : on obtient y = mx + p.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              f(x) = x² en a = 2 : f(2) = 4, f′(2) = 4, donc y = 4(x − 2) + 4, soit
              <strong> y = 4x − 4</strong>. Vérification : en x = 2, 4 × 2 − 4 = 4 = f(2). ✔
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la vérification qui remet x = a et retrouve f(a).</div>
          </div>
        ),
      },
      {
        id: 'mem-equation-tangente',
        type: 'memoriser',
        title: '⭐ y = f′(a)(x − a) + f(a)',
        summary: 'La pente multiplie (x − a), et l’on ajoute f(a).',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">y = f′(a)(x − a) + f(a)</div>
            <p className="text-xs text-rose-700">toujours vérifier : en x = a, on doit retrouver f(a)</p>
          </div>
        ),
      },
    ],
  },
};
