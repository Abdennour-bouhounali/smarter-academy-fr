import React from 'react';

/** Connaissances de « Fonctions en Python » — SOURCE UNIQUE. */
export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'fonction-python', type: 'concepts', title: 'Une fonction Python',
        summary: 'Un bloc de code qui porte un nom, reçoit des valeurs et en renvoie une. On l’écrit une fois, on l’utilise autant de fois qu’on veut.',
        body: (
          <div className="space-y-2 text-sm">
            <p>Comme la fonction mathématique : une entrée, un traitement, une sortie. Ici, c’est toi qui écris le traitement.</p>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 font-mono text-sky-900 whitespace-pre">{`def double(x):
    return 2 * x`}</div>
          </div>
        ),
      },
      {
        id: 'def-return', type: 'vocabulaire', title: 'def et return',
        summary: '« def » ouvre la définition (elle se termine par « : », le corps est indenté). « return » renvoie le résultat et SORT de la fonction.',
        body: (
          <div className="space-y-1 text-sm">
            <p><span className="font-mono text-sky-700">def nom(parametres):</span> — la ligne d’en-tête, deux points obligatoires.</p>
            <p><span className="font-mono text-sky-700">return valeur</span> — renvoie et quitte immédiatement.</p>
            <p className="text-slate-600">Sans return, la fonction renvoie <span className="font-mono">None</span>.</p>
          </div>
        ),
      },
      {
        id: 'appel-fonction', type: 'concepts', title: 'L’appel',
        summary: 'Définir ne calcule rien. C’est l’appel — nom(valeur) — qui exécute le corps et produit le résultat.',
        body: (
          <div className="space-y-2 text-sm">
            <p>La définition range la recette ; l’appel la fait exécuter.</p>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 font-mono text-emerald-900 whitespace-pre">{`print(double(7))   # affiche 14`}</div>
          </div>
        ),
      },
      {
        id: 'mem-entree-sortie', type: 'memoriser', title: '⭐ Entrée, corps, sortie',
        summary: 'Trois questions pour toute fonction : que reçoit-elle, que fait-elle, que renvoie-t-elle ?',
      },
    ],
    2: [
      {
        id: 'parametre-argument', type: 'vocabulaire', title: 'Paramètre et argument',
        summary: 'Le paramètre est le nom écrit dans la définition ; l’argument est la valeur donnée à l’appel. Le premier argument va au premier paramètre.',
        body: (
          <div className="space-y-2 text-sm">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono whitespace-pre">{`def aire(L, l):     # L et l : paramètres
    return L * l
aire(6, 4)          # 6 et 4 : arguments`}</div>
            <p>Ici L reçoit 6 et l reçoit 4 — par leur POSITION, pas par leur nom.</p>
          </div>
        ),
      },
      {
        id: 'regle-ordre-arguments', type: 'regles', title: 'L’ordre des arguments décide',
        summary: 'Les arguments sont distribués dans l’ordre d’écriture. Les échanger change le résultat dès que la fonction n’est pas symétrique.',
      },
      {
        id: 'portee-locale', type: 'concepts', title: 'La portée',
        summary: 'Une variable créée dans une fonction n’existe QUE pendant l’appel. Dehors, elle est inconnue — même si le nom est le même.',
        body: (
          <div className="space-y-2 text-sm">
            <p>C’est une protection : deux fonctions peuvent utiliser le nom x sans se gêner.</p>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-amber-900 whitespace-pre">{`def f(x):
    y = x + 1
    return y
print(y)    # ⚠ erreur : y n'existe pas ici`}</div>
          </div>
        ),
      },
      {
        id: 'mem-locale-reste-locale', type: 'memoriser', title: '⭐ Ce qui naît dans la fonction y reste',
        summary: 'Pour faire sortir une valeur d’une fonction, il n’y a qu’un chemin : return.',
      },
    ],
    4: [
      {
        id: 'methode-traduire-formule', type: 'methodes', title: 'Traduire une formule en fonction',
        summary: 'Repérer ce qui varie (→ paramètres), écrire le calcul (→ corps), décider ce qui sort (→ return).',
        body: (
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Qu’est-ce qui change d’un cas à l’autre ? Ce sont les paramètres.</li>
            <li>Quel calcul relie l’entrée à la sortie ? C’est le corps.</li>
            <li>Que veut-on récupérer ? C’est le return.</li>
          </ol>
        ),
      },
      {
        id: 'regle-return-vs-print', type: 'regles', title: 'return n’est pas print',
        summary: 'print AFFICHE et ne renvoie rien d’utilisable ; return RENVOIE une valeur qu’on peut stocker ou réutiliser dans un calcul.',
        body: (
          <div className="space-y-2 text-sm">
            <p>Avec print, on ne peut pas écrire <span className="font-mono">2 * double(3)</span> : il n’y a aucune valeur à multiplier.</p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'methode-lire-fonction', type: 'methodes', title: 'Lire une fonction écrite par un autre',
        summary: 'Ne pas lire ligne à ligne : repérer les paramètres, puis le return, puis seulement ce qu’il y a entre les deux.',
        body: (
          <ol className="list-decimal space-y-1 pl-5 text-sm">
            <li>Que reçoit-elle ? (l’en-tête)</li>
            <li>Que renvoie-t-elle ? (le return)</li>
            <li>Essayer un cas simple mentalement, puis l’exécuter pour se vérifier.</li>
          </ol>
        ),
      },
    ],
    3: [
      {
        id: 'randint', type: 'vocabulaire', title: 'randint(a, b)',
        summary: 'Renvoie un entier au hasard entre a et b, les DEUX bornes comprises — contrairement à range.',
        body: (
          <div className="space-y-1 text-sm">
            <p><span className="font-mono">randint(1, 6)</span> : un dé à six faces, chaque face également probable.</p>
            <p className="text-slate-600">Deux appels successifs donnent presque toujours deux résultats différents.</p>
          </div>
        ),
      },
      {
        id: 'simulation', type: 'concepts', title: 'Simuler une expérience',
        summary: 'Remplacer l’expérience réelle par un programme qui produit les mêmes résultats avec les mêmes probabilités.',
        body: (
          <div className="space-y-2 text-sm">
            <p>Un dé lancé mille fois à la main prend une heure ; simulé, une seconde. La démarche est identique.</p>
          </div>
        ),
      },
      {
        id: 'regle-bornes-randint', type: 'regles', title: 'randint inclut ses deux bornes',
        summary: 'randint(1, 6) peut donner 6 ; range(1, 6) s’arrête à 5. Deux fonctions, deux conventions à ne pas confondre.',
      },
    ],
    6: [
      {
        id: 'methode-repeter-collecter', type: 'methodes', title: 'Répéter et collecter',
        summary: 'Une liste vide, une boucle qui appelle la fonction, un append à chaque tour : la série est constituée.',
        body: (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm whitespace-pre">{`serie = []
for i in range(1000):
    serie.append(lancer())`}</div>
        ),
      },
      {
        id: 'regle-fluctuation', type: 'regles', title: 'Deux simulations ne donnent pas le même nombre',
        summary: 'Le résultat fluctue autour de la valeur théorique, et il s’en approche d’autant plus que le nombre de répétitions est grand.',
        body: (
          <div className="space-y-2 text-sm">
            <p>Sur 1 000 lancers d’un dé, on attend environ 167 « 6 » — on en obtient 150, 168, 181… mais jamais exactement 166,67.</p>
            <p className="text-slate-600">Un résultat différent à chaque exécution n’est donc PAS un bug.</p>
          </div>
        ),
      },
      {
        id: 'methode-verifier-simulation', type: 'methodes', title: 'Vérifier un programme de simulation',
        summary: 'Comparer à une valeur qu’on sait calculer autrement (ici la probabilité théorique), et vérifier que les valeurs produites sont dans la plage attendue.',
      },
      {
        id: 'mem-plus-on-repete', type: 'memoriser', title: '⭐ Plus on répète, plus on approche',
        summary: 'La fréquence observée se rapproche de la probabilité quand le nombre d’expériences augmente.',
      },
    ],
  },
};

export default LESSON_KNOWLEDGE;
