import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Suites : générer et reconnaître » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 *
 * VISUELS EN DOM, jamais en <text> SVG. Le sujet est une PILE DE NOMBRES : un
 * empilement de rectangles étiquetés reste lisible à toute taille, là où des
 * étiquettes SVG posées près de valeurs qui explosent (2 → 64) finiraient par
 * se chevaucher. C'est la règle §6bis.4 appliquée avant d'avoir le défaut.
 */

/** Une pile de termes, en DOM : chaque case porte son rang et sa valeur. */
function Pile({ list, tone = 'indigo', pas, signe }) {
  const t = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
  }[tone];
  return (
    <div className="flex items-end gap-1.5 overflow-x-auto py-1">
      {list.map((v, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <span className="shrink-0 self-center font-mono text-[13px] font-bold text-slate-500">
              {signe}{pas}
            </span>
          )}
          <span className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-center ${t}`}>
            <span className="block font-mono text-[13px] opacity-70">rang {i}</span>
            <span className="block font-mono text-base font-black tabular-nums">{v}</span>
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'suite-rang-terme',
        type: 'vocabulaire',
        title: 'Une suite, un rang, un terme',
        summary:
          'Une suite est une liste de nombres rangés dans un ordre : à chaque rang n correspond un terme et un seul, noté u(n). Le premier terme est u(0).',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <Pile list={[2, 4, 6, 8]} pas="" signe="" tone="indigo" />
            <p>
              On lit <strong>u(0) = 2</strong>, <strong>u(1) = 4</strong>, <strong>u(2) = 6</strong>…
              Le <strong>rang</strong> est la place dans la liste ; le <strong>terme</strong> est le
              nombre qui s’y trouve. Le rang est toujours un entier, et l’on part du rang 0.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              u(2) n’est pas « le deuxième nombre affiché » mais le terme <em>de rang 2</em> : le
              troisième, puisque l’on compte à partir de 0. Décaler d’un rang est l’erreur la plus
              discrète du chapitre.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les cases numérotées sous les deux piles de l’usine.</div>
          </div>
        ),
      },
      {
        id: 'deux-facons-de-fabriquer',
        type: 'concepts',
        title: 'Deux façons de fabriquer les termes',
        summary:
          'Ou bien on AJOUTE toujours le même montant d’un terme au suivant, ou bien on MULTIPLIE toujours par le même facteur. Ce qui est constant n’est pas le terme, c’est le pas.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="space-y-2">
              <div>
                <div className="text-xs font-semibold text-emerald-800 mb-1">on ajoute toujours 2</div>
                <Pile list={[2, 4, 6, 8]} pas="2" signe="+" tone="emerald" />
              </div>
              <div>
                <div className="text-xs font-semibold text-rose-800 mb-1">on multiplie toujours par 2</div>
                <Pile list={[2, 4, 8, 16]} pas="2" signe="×" tone="rose" />
              </div>
            </div>
            <p>
              Les deux piles partent du même nombre et donnent le même deuxième terme. Au
              troisième, elles se séparent : <strong>6 d’un côté, 8 de l’autre</strong>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Deux termes identiques ne suffisent jamais à décider de quelle usine vient une liste.
              Il faut regarder ce qui reste CONSTANT d’un terme au suivant.
            </div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'definition-explicite',
        type: 'concepts',
        title: 'Définition par une formule',
        summary:
          'Une formule donne le terme DIRECTEMENT à partir du rang : u(n) = 2n + 1. On remplace n par le rang voulu, sans passer par les précédents.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$u(n) = 2n + 1$$'}</MathText>
            </div>
            <p>
              u(0) = 1, u(1) = 3, u(2) = 5… et <strong>u(50) = 101 se calcule tout de suite</strong>,
              sans écrire les cinquante précédents. C’est exactement une image, celle du rang.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le rang saisi dans la case, et le terme qui sort seul.</div>
          </div>
        ),
      },
      {
        id: 'definition-recurrence',
        type: 'concepts',
        title: 'Définition de proche en proche',
        summary:
          'Une relation de récurrence donne le PREMIER terme et la règle qui fabrique le suivant : u(0) = 4 et u(n+1) = u(n) + 5.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center font-mono">
              u(0) = 4 &nbsp;&nbsp;et&nbsp;&nbsp; u(n+1) = u(n) + 5
            </div>
            <Pile list={[4, 9, 14, 19]} pas="5" signe="+" tone="emerald" />
            <p>
              Il faut <strong>les deux</strong> : la règle seule ne dit pas où l’on part, et le
              premier terme seul ne dit pas comment avancer.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Pour obtenir u(50) ainsi, il faudrait dérouler les cinquante étapes. C’est le prix de
              cette écriture — et tout l’intérêt de l’autre.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-generer-termes',
        type: 'methodes',
        title: 'Générer les premiers termes',
        summary:
          'Par une formule : remplacer n par 0, 1, 2… Par une récurrence : partir du premier terme et appliquer la règle, une fois par rang.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer laquelle des deux écritures est donnée.</li>
              <li>Formule : substituer le rang, un rang à la fois — u(3) = 2 × 3 + 1 = 7.</li>
              <li>Récurrence : écrire le premier terme, puis appliquer la règle au dernier obtenu.</li>
              <li>Vérifier le COMPTE : de u(0) à u(n), il y a n + 1 termes.</li>
            </ol>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la colonne qui se remplit case après case.</div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'suite-arithmetique',
        type: 'vocabulaire',
        title: 'Suite arithmétique et sa raison',
        summary:
          'Une suite est arithmétique si l’écart u(n+1) − u(n) est le MÊME à tous les rangs. Cet écart constant s’appelle la raison, notée r.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$u(n+1) = u(n) + r$$'}</MathText>
            </div>
            <Pile list={[3, 7, 11, 15]} pas="4" signe="+" tone="emerald" />
            <p>
              Ici la raison vaut <strong>4</strong>. Elle peut être <strong>négative</strong> : la
              suite 20, 14, 8, 2 est arithmétique de raison −6.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              La raison n’est pas le premier terme, et ce n’est pas non plus la différence entre le
              dernier et le premier : c’est l’écart entre DEUX TERMES CONSÉCUTIFS.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les accolades toutes égales à gauche de la pile.</div>
          </div>
        ),
      },
      {
        id: 'suite-geometrique',
        type: 'vocabulaire',
        title: 'Suite géométrique et sa raison',
        summary:
          'Une suite est géométrique si le rapport u(n+1) / u(n) est le MÊME à tous les rangs. Ce rapport constant s’appelle la raison, notée q.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$u(n+1) = q \\times u(n)$$'}</MathText>
            </div>
            <Pile list={[5, 10, 20, 40]} pas="2" signe="×" tone="rose" />
            <p>
              Ici la raison vaut <strong>2</strong>. Elle peut être <strong>comprise entre 0 et
              1</strong> : la suite 80, 40, 20, 10 est géométrique de raison 0,5 — et elle descend,
              bien qu’on multiplie.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un rapport ne se cherche que si aucun terme n’est nul : diviser par 0 n’a pas de sens.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les accolades ×2 identiques le long de la pile.</div>
          </div>
        ),
      },
      {
        id: 'methode-trouver-la-raison',
        type: 'methodes',
        title: 'Trouver la nature et la raison',
        summary:
          'Calculer les écarts successifs : tous égaux ⟹ arithmétique. Sinon calculer les rapports : tous égaux ⟹ géométrique. Sinon, ni l’une ni l’autre.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Écrire les écarts entre termes consécutifs : u(1) − u(0), u(2) − u(1)…</li>
              <li>Tous identiques ? La suite est arithmétique, et cet écart est r.</li>
              <li>Sinon, écrire les rapports u(1)/u(0), u(2)/u(1)…</li>
              <li>Tous identiques ? La suite est géométrique, et ce rapport est q.</li>
              <li>Ni l’un ni l’autre ? La suite n’appartient à aucune des deux familles.</li>
            </ol>
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-xs">
              1, 4, 9, 16 : écarts 3, 5, 7 — pas constants ; rapports 4 ; 2,25 ; 1,78 — pas
              constants non plus. Cette suite n’est <strong>ni arithmétique ni géométrique</strong>.
            </div>
          </div>
        ),
      },
      {
        id: 'cas-suite-constante',
        type: 'regles',
        title: 'La suite constante appartient aux deux familles',
        summary:
          'Une suite dont tous les termes sont égaux est arithmétique de raison 0 ET géométrique de raison 1. Les deux familles se recouvrent en ce seul point.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <Pile list={[6, 6, 6, 6]} pas="0" signe="+" tone="indigo" />
            <p>
              6, 6, 6, 6 : l’écart vaut 0 partout — arithmétique de raison 0. Et le rapport vaut 1
              partout — géométrique de raison 1. Les deux lectures sont vraies en même temps.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              C’est le seul cas de recouvrement : dès qu’une suite bouge, elle ne peut pas être des
              deux familles à la fois.
            </div>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'preuve-vs-constat',
        type: 'concepts',
        title: 'Quatre termes ne prouvent rien',
        summary:
          'Voir quatre écarts égaux ne garantit pas que le cinquième le sera. Démontrer, c’est faire le calcul pour un rang n QUELCONQUE.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              La suite 2, 4, 8, 16 ressemble à une suite géométrique de raison 2 — et l’on ne sait
              rien du terme suivant tant qu’on n’a pas la règle. Une liste de nombres est un
              <strong> indice</strong>, pas une preuve.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « J’ai vérifié sur les premiers termes » n’est pas une démonstration : la propriété est
              annoncée pour TOUS les rangs, elle doit donc être établie pour un rang quelconque.
            </div>
          </div>
        ),
      },
      {
        id: 'methode-demontrer-arithmetique',
        type: 'methodes',
        title: 'Démontrer qu’une suite est arithmétique',
        summary:
          'Calculer u(n+1) − u(n) avec la lettre n, développer, réduire. Si le résultat ne contient plus n, la suite est arithmétique et ce nombre est la raison.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 font-mono text-xs leading-relaxed">
              u(n) = 5n − 2<br />
              u(n+1) − u(n) = [5(n+1) − 2] − [5n − 2]<br />
              &nbsp;&nbsp;= 5n + 5 − 2 − 5n + 2<br />
              &nbsp;&nbsp;= <strong>5</strong>
            </div>
            <p>
              Le résultat ne dépend plus de n : l’écart vaut 5 à <em>tous</em> les rangs. La suite
              est arithmétique de raison 5.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les termes en n qui s’annulent deux à deux.</div>
          </div>
        ),
      },
      {
        id: 'methode-demontrer-geometrique',
        type: 'methodes',
        title: 'Démontrer qu’une suite est géométrique',
        summary:
          'Calculer u(n+1) / u(n), simplifier. Si le résultat ne contient plus n, la suite est géométrique et ce nombre est la raison.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 font-mono text-xs leading-relaxed">
              v(n) = 4 × 3ⁿ<br />
              v(n+1) / v(n) = (4 × 3ⁿ⁺¹) / (4 × 3ⁿ)<br />
              &nbsp;&nbsp;= <strong>3</strong>
            </div>
            <p>
              Le rapport ne dépend plus de n : la suite est géométrique de raison 3. On ne peut
              écrire ce quotient que si aucun terme n’est nul — ici 4 × 3ⁿ ne s’annule jamais.
            </p>
          </div>
        ),
      },
      {
        id: 'mem-ecart-ou-rapport',
        type: 'memoriser',
        title: '⭐ Écart constant, ou rapport constant',
        summary: 'u(n+1) − u(n) = r ⟹ arithmétique · u(n+1) / u(n) = q ⟹ géométrique.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-lg font-black text-rose-700">u(n+1) − u(n) = r → arithmétique</div>
            <div className="text-lg font-black text-rose-700">u(n+1) ÷ u(n) = q → géométrique</div>
            <p className="text-xs text-rose-700">le calcul se fait avec la lettre n, jamais sur quatre nombres</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'sens-variation-suite',
        type: 'regles',
        title: 'Le sens de variation se lit sur le signe de l’écart',
        summary:
          'Si u(n+1) − u(n) > 0 à tous les rangs, la suite est croissante ; si l’écart est négatif partout, elle est décroissante ; s’il est nul, elle est constante.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900"><strong>écart &gt; 0</strong> — la suite croît</div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900"><strong>écart &lt; 0</strong> — la suite décroît</div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800"><strong>écart = 0</strong> — la suite est constante</div>
            </div>
            <p>
              Pour une suite arithmétique, l’écart EST la raison : son signe décide tout, et le
              premier terme n’y change rien.
            </p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la colonne d’écarts, tous du même signe.</div>
          </div>
        ),
      },
      {
        id: 'regle-variation-geometrique',
        type: 'regles',
        title: 'Multiplier ne veut pas dire monter',
        summary:
          'Une suite géométrique de raison entre 0 et 1 DESCEND. Et si le premier terme est négatif, une raison plus grande que 1 la fait descendre aussi.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="space-y-2">
              <div>
                <div className="text-xs font-semibold text-rose-800 mb-1">u(0) = 64, raison 0,5 — elle DESCEND</div>
                <Pile list={[64, 32, 16, 8]} pas="0,5" signe="×" tone="rose" />
              </div>
              <div>
                <div className="text-xs font-semibold text-rose-800 mb-1">u(0) = −3, raison 2 — elle DESCEND aussi</div>
                <Pile list={[-3, -6, -12, -24]} pas="2" signe="×" tone="rose" />
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « On multiplie donc ça monte » est faux deux fois. Le sens dépend de la raison ET du
              signe du premier terme — et en cas de doute, l’écart u(n+1) − u(n) tranche toujours.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-sens-de-variation',
        type: 'memoriser',
        title: '⭐ Le signe de l’écart décide',
        summary: 'En cas de doute sur le sens, calculer u(n+1) − u(n) : son signe est la réponse.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">signe de u(n+1) − u(n)</div>
            <p className="text-xs text-rose-700">positif ça monte · négatif ça descend · nul ça reste</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'modeliser-par-une-suite',
        type: 'methodes',
        title: 'Choisir la famille qui modélise une situation',
        summary:
          'Un montant fixe ajouté à chaque étape donne une suite arithmétique ; un pourcentage appliqué à chaque étape donne une suite géométrique de raison 1 + t.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                « on verse 20 € chaque mois » → on AJOUTE 20 : arithmétique, raison 20
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                « le loyer augmente de 5 % chaque année » → on MULTIPLIE par 1,05 : géométrique,
                raison 1,05
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              + 5 % n’est pas + 5 : un loyer de 400 € passe à 420 €, pas à 405 €. Le pourcentage
              porte sur la valeur du moment, qui change à chaque étape.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux énoncés côte à côte, et les deux piles qu’ils produisent.</div>
          </div>
        ),
      },
    ],
  },
};
