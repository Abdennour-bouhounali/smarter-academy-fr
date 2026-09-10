import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Dérivation : les règles de calcul » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 *
 * Pas de MiniGraph ici : cette leçon est SYMBOLIQUE. Sa leçon amont porte
 * déjà trois laboratoires « courbe + curseur » ; ce qu'il y a à retenir tient
 * dans des formules et des gestes, pas dans des dessins de tangentes.
 */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'derivation-ne-se-distribue-pas',
        type: 'concepts',
        title: 'Dériver ne traverse pas toutes les opérations',
        summary:
          'Remplacer chaque morceau par sa dérivée et recoller de la même façon fonctionne pour « + » et pour « × un nombre ». Pour un produit de deux fonctions, cela donne un résultat FAUX : il faut une règle propre.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>u + v</strong> — le geste passe : la dérivée est u′ + v′
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>k × u</strong> (k un nombre) — le geste passe : la dérivée est k × u′
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                <strong>u × v</strong> — le geste NE passe PAS : u′ × v′ est faux
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le contre-exemple qui tranche : x² × x, c’est x³. Sa pente en 2 vaut 12. Or
              « 2x × 1 » donnerait 4. Trois fois trop petit — ce n’est pas un arrondi.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux cartes retournées, et la pente mesurée qui refuse de coller.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'derivees-usuelles',
        type: 'formules',
        title: 'Les dérivées des fonctions usuelles',
        summary:
          'Une constante a une dérivée nulle ; x^n a pour dérivée n·x^(n−1) ; 1/x a pour dérivée −1/x² ; √x a pour dérivée 1/(2√x).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white">
              <table className="w-full text-center text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr><th className="px-3 py-1.5 text-left">f(x)</th><th className="px-3 py-1.5 text-left">f′(x)</th><th className="px-3 py-1.5 text-left">valable pour</th></tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-t"><td className="px-3 py-1.5 text-left">c (un nombre)</td><td className="px-3 py-1.5 text-left">0</td><td className="px-3 py-1.5 text-left font-sans text-xs text-slate-500">tout x</td></tr>
                  <tr className="border-t"><td className="px-3 py-1.5 text-left">x</td><td className="px-3 py-1.5 text-left">1</td><td className="px-3 py-1.5 text-left font-sans text-xs text-slate-500">tout x</td></tr>
                  <tr className="border-t bg-violet-50/40"><td className="px-3 py-1.5 text-left">x<sup>n</sup></td><td className="px-3 py-1.5 text-left">n·x<sup>n−1</sup></td><td className="px-3 py-1.5 text-left font-sans text-xs text-slate-500">n entier ≥ 1</td></tr>
                  <tr className="border-t"><td className="px-3 py-1.5 text-left">1/x</td><td className="px-3 py-1.5 text-left">−1/x²</td><td className="px-3 py-1.5 text-left font-sans text-xs text-slate-500">x ≠ 0</td></tr>
                  <tr className="border-t"><td className="px-3 py-1.5 text-left">√x</td><td className="px-3 py-1.5 text-left">1/(2√x)</td><td className="px-3 py-1.5 text-left font-sans text-xs text-slate-500">x &gt; 0</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              Elles ne sortent pas de nulle part : chacune est ce vers quoi le taux se dirige.
              Sur x³ en 2, les taux donnent 12,61 puis 12,06 puis 12,006 — ils se posent
              sur <strong>12</strong>, et 3 × 2² fait bien 12.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              La colonne de droite compte : √x n’a pas de pente en 0, et 1/x n’y est même pas
              définie. Une dérivée vient toujours avec l’ensemble où elle vaut.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-x-puissance-n',
        type: 'memoriser',
        title: '⭐ (xⁿ)′ = n·xⁿ⁻¹',
        summary: 'L’exposant descend devant, et il diminue de 1.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">(xⁿ)′ = n·xⁿ⁻¹</div>
            <p className="text-xs text-rose-700">x² → 2x · x³ → 3x² · x⁵ → 5x⁴</p>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'regle-somme-et-reel',
        type: 'regles',
        title: 'Somme et produit par un nombre',
        summary:
          'La dérivation traverse ces deux opérations : (u + v)′ = u′ + v′ et (k·u)′ = k·u′. On dérive donc terme par terme, en gardant chaque coefficient.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$(u + v)\' = u\' + v\' \\qquad (k\\,u)\' = k\\,u\'$$'}</MathText>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-white p-3">
              f(x) = 3x² + 5x − 7 se dérive terme par terme : 3 × 2x, puis 5 × 1, puis 0.
              Donc <strong className="font-mono">f′(x) = 6x + 5</strong>.
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le −7 disparaît : une constante ne fait pas monter la courbe, elle la décale.
              Sa dérivée est nulle, pas égale à −7.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux cartes du « + » qui se retournent chacune de son côté, sans se gêner.</div>
          </div>
        ),
      },
      {
        id: 'regle-produit',
        type: 'regles',
        title: 'La dérivée d’un produit',
        summary:
          '(u·v)′ = u′·v + u·v′ : on dérive le premier facteur en gardant le second, puis on garde le premier en dérivant le second, et l’on additionne.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$(u\\,v)\' = u\'\\,v + u\\,v\'$$'}</MathText>
            </div>
            <p>
              Deux morceaux, pas un : on dérive <strong>chacun à son tour</strong> pendant que
              l’autre attend. Sur u = x² et v = x : u′v + uv′ = 2x·x + x²·1 = 3x², qui est bien
              la dérivée de x³.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              u′·v′ est l’erreur classique : elle donnerait 2x × 1 = 2x, soit 4 en x = 2, quand
              la pente vaut 12.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le banc où la prédiction naïve tombe à côté de la pente mesurée.</div>
          </div>
        ),
      },
      {
        id: 'mem-produit',
        type: 'memoriser',
        title: '⭐ (uv)′ = u′v + uv′',
        summary: 'Deux termes, jamais un seul.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">(uv)′ = u′v + uv′</div>
            <p className="text-xs text-rose-700">« je dérive le premier, je garde le second — puis l’inverse »</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'regle-quotient',
        type: 'regles',
        title: 'La dérivée d’un quotient',
        summary:
          '(u/v)′ = (u′·v − u·v′) / v². Le numérateur ressemble à la règle du produit, mais avec un MOINS, et l’ordre des deux morceaux n’est plus interchangeable.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$\\left(\\frac{u}{v}\\right)\' = \\frac{u\'\\,v - u\\,v\'}{v^{2}}$$'}</MathText>
            </div>
            <p>
              Le carré au dénominateur est toujours positif : c’est donc le <strong>numérateur
              seul</strong> qui décide du signe de la pente.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Diviser les dérivées est faux, et cette fois le <strong>signe</strong> lui-même se
              trompe : sur x ÷ x² (c’est-à-dire 1/x), la pente en 2 vaut −0,25, alors que
              « 1 ÷ 2x » annoncerait +0,25.
            </div>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Le moins n’est pas décoratif : échanger les deux termes du numérateur change le
              résultat en son opposé. u′v vient EN PREMIER.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la prédiction qui montait alors que la vraie pente descendait.</div>
          </div>
        ),
      },
      {
        id: 'mem-quotient',
        type: 'memoriser',
        title: '⭐ (u/v)′ = (u′v − uv′) / v²',
        summary: 'Le moins, et le carré en bas.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">(u/v)′ = (u′v − uv′) / v²</div>
            <p className="text-xs text-rose-700">u′v d’abord, puis on retire uv′ — jamais l’inverse</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'regle-composee-simple',
        type: 'regles',
        title: 'La dérivée d’une composée simple',
        summary:
          '((ax + b)^n)′ = n·a·(ax + b)^(n−1) : on dérive la puissance comme d’habitude, puis on MULTIPLIE par la dérivée de l’intérieur. Plus généralement (u^n)′ = n·u′·u^(n−1).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$\\big((ax+b)^{n}\\big)\' = n\\,a\\,(ax+b)^{n-1} \\qquad (u^{n})\' = n\\,u\'\\,u^{n-1}$$'}</MathText>
            </div>
            <p>
              L’intérieur laisse une <strong>trace</strong> : le facteur a. Sur (3x − 2)⁴, on
              écrit 4(3x − 2)³ puis on multiplie par 3 : <strong className="font-mono">12(3x − 2)³</strong>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Oublier ce facteur donne une pente a fois trop petite : en x = 1, 4 au lieu de 12.
              Trois fois moins, ce n’est pas une erreur d’arrondi.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le facteur intérieur que la pente mesurée réclamait.</div>
          </div>
        ),
      },
      {
        id: 'mem-composee',
        type: 'memoriser',
        title: '⭐ (uⁿ)′ = n·u′·uⁿ⁻¹',
        summary: 'La dérivée de l’intérieur ne s’oublie jamais.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">(uⁿ)′ = n·u′·uⁿ⁻¹</div>
            <p className="text-xs text-rose-700">(3x − 2)⁴ → 4(3x − 2)³ × 3 = 12(3x − 2)³</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'methode-choisir-la-regle',
        type: 'methodes',
        title: 'Reconnaître la règle avant de calculer',
        summary:
          'Regarder la STRUCTURE de l’expression avant d’écrire quoi que ce soit : une somme de termes, un produit, un quotient, ou un emboîtement — chaque forme appelle sa règle.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Une <strong>somme de termes</strong> séparés par + ou − ? Dériver terme par terme.</li>
              <li>Un <strong>produit</strong> de deux expressions qui contiennent chacune x ? u′v + uv′.</li>
              <li>Une <strong>fraction</strong> dont le bas contient x ? (u′v − uv′)/v².</li>
              <li>Une <strong>parenthèse élevée à une puissance</strong> ? n·u′·u^(n−1).</li>
            </ol>
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              Un nombre qui multiplie n’appelle PAS la règle du produit : 3x² se dérive en 6x,
              pas en « 0 × x² + 3 × 2x » — ce qui d’ailleurs donnerait le même résultat, mais
              par un détour inutile.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le tri des cinq expressions de l’atelier, avant tout calcul.</div>
          </div>
        ),
      },
    ],
  },
};
