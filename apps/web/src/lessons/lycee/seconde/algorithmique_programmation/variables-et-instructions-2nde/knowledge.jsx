import React from 'react';

/** Connaissances de « Variables et instructions » — SOURCE UNIQUE. */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'variable-informatique', type: 'concepts', title: 'Une variable informatique',
        summary: 'Un nom, une valeur, et un type. Le nom désigne un emplacement ; la valeur peut changer pendant l’exécution, le nom non.',
        body: (
          <div className="space-y-2 text-sm">
            <p>En mathématiques, x désigne un nombre inconnu mais FIXE. En informatique, x désigne un emplacement dont le contenu change.</p>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 font-mono text-sky-900">prix = 12</div>
          </div>
        ),
      },
      {
        id: 'types-python', type: 'vocabulaire', title: 'Les quatre types de base',
        summary: 'int (entier), float (à virgule), bool (True/False), str (chaîne de caractères). Le type décide de ce qu’on peut faire avec la valeur.',
        body: (
          <div className="space-y-1 text-sm font-mono">
            <div><span className="text-sky-700">int</span> : 12, −3</div>
            <div><span className="text-sky-700">float</span> : 2.5, 3.0</div>
            <div><span className="text-sky-700">bool</span> : True, False</div>
            <div><span className="text-sky-700">str</span> : "bonjour"</div>
          </div>
        ),
      },
      {
        id: 'mem-nom-valeur-type', type: 'memoriser', title: '⭐ Nom, valeur, type',
        summary: 'Trois choses pour une variable. Le type explique la plupart des erreurs.',
      },
    ],
    2: [
      {
        id: 'affectation', type: 'concepts', title: 'L’affectation',
        summary: '« x = 5 » ne dit pas que x ÉGALE 5 : c’est un ordre — range 5 dans x. Le signe = se lit « reçoit ».',
        body: (
          <div className="space-y-2 text-sm">
            <p>D’abord la droite est calculée, ensuite le résultat est rangé à gauche.</p>
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 font-mono text-indigo-900">x = x + 1  # x reçoit (l’ancien x, plus 1)</div>
          </div>
        ),
      },
      {
        id: 'regle-ordre-affectation', type: 'regles', title: 'La droite d’abord',
        summary: 'Dans une affectation, l’expression de droite est évaluée AVANT d’être rangée. C’est pourquoi x = x + 1 a un sens et n’est pas une équation impossible.',
      },
      {
        id: 'methode-formule-variables', type: 'methodes', title: 'Écrire une formule avec des variables',
        summary: 'On nomme chaque grandeur, on écrit la formule avec les noms, jamais avec les nombres : le programme reste juste quand les valeurs changent.',
      },
    ],
    3: [
      {
        id: 'sequence', type: 'concepts', title: 'La séquence',
        summary: 'Les instructions s’exécutent dans l’ordre, de haut en bas. Changer l’ordre change le résultat.',
      },
      {
        id: 'conditionnelle', type: 'concepts', title: 'La conditionnelle',
        summary: 'if teste une condition ; le bloc INDENTÉ dessous ne s’exécute que si elle est vraie. else couvre tous les autres cas.',
        body: (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-emerald-900 whitespace-pre">{'if note >= 10:\n    print("admis")\nelse:\n    print("recalé")'}</div>
            <p>L’indentation n’est pas décorative : c’est elle qui dit ce qui est DANS le bloc.</p>
          </div>
        ),
      },
      {
        id: 'regle-cas-limite', type: 'regles', title: 'Le cas limite se décide au signe',
        summary: '>= inclut la valeur, > l’exclut. Une note de 10 exactement change de côté selon le signe choisi : c’est l’erreur la plus fréquente.',
      },
    ],
    4: [
      {
        id: 'boucle-for', type: 'concepts', title: 'La boucle for',
        summary: 'Répète un bloc un nombre CONNU de fois. range(n) parcourt 0, 1, …, n−1 : n valeurs, mais on ne l’atteint jamais.',
      },
      {
        id: 'boucle-while', type: 'concepts', title: 'La boucle while',
        summary: 'Répète TANT QUE la condition est vraie. On l’utilise quand on ne sait pas d’avance combien de tours seront nécessaires.',
      },
      {
        id: 'regle-condition-arret', type: 'regles', title: 'Une condition qui finit par devenir fausse',
        summary: 'Si rien dans le corps de la boucle ne rapproche la condition du faux, le programme ne s’arrête jamais. C’est le danger propre au while.',
      },
      {
        id: 'mem-for-ou-while', type: 'memoriser', title: '⭐ for si on sait combien, while si on attend',
        summary: 'Le nombre de tours est connu → for. Il dépend d’un seuil à atteindre → while.',
      },
    ],
    5: [
      {
        id: 'methode-tracer', type: 'methodes', title: 'Prévoir puis exécuter',
        summary: 'On suit le programme ligne à ligne en notant la valeur de chaque variable, PUIS on exécute pour comparer. L’écart entre les deux est l’endroit à comprendre.',
      },
      {
        id: 'methode-verifier', type: 'methodes', title: 'Vérifier un programme',
        summary: 'Un cas simple dont on connaît la réponse, puis un cas LIMITE (zéro, égalité, valeur extrême) : c’est là que les erreurs se cachent.',
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
