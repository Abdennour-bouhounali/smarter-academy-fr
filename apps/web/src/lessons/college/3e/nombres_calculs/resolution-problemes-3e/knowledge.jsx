import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de la leçon « Résolution de problèmes » (3e) — SOURCE UNIQUE de
 * vérité (docs/architecture/KNOWLEDGE_MAP.md).
 *
 * Chaque item est posé dans la page par un <KnowledgeBrick id="…"> au moment
 * où l'élève vient de le rencontrer par le geste, puis il reste sur sa carte.
 *
 * ORDRE — c'est celui du carnet, et il n'est pas négociable : lire (M2) avant
 * choisir l'inconnue (M3), l'inconnue avant traduire (M4), traduire avant
 * résoudre (M5-M6), et résoudre avant interpréter (M7). Chaque étape n'a de
 * sens qu'une fois la précédente faite.
 */

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Pourquoi une équation plutôt que des essais. */
    1: [
      {
        id: 'pourquoi-une-equation',
        type: 'concepts',
        title: 'Pourquoi écrire une équation',
        summary: 'Essayer des valeurs finit par marcher ; une équation trouve la réponse en une ligne, et continue de marcher quand elle n’est pas un nombre rond.',
        body: (
          <div className="space-y-3">
            <p>Tâtonner donne parfois la bonne valeur — à condition de tomber dessus. Une
            <strong> équation</strong> la donne à coup sûr.</p>
            <p className="text-xs text-slate-500">Surtout : dès que la réponse n’est pas un entier,
            le tableau d’essais ne la trouve plus. L’équation, si.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux cartes de cinéma,
            et le nombre de séances à partir duquel l’abonnement devient rentable.</div>
          </div>
        ),
      },
    ],

    /* M2 — Lire : trier ce que l'énoncé donne. */
    2: [
      {
        id: 'lire-un-enonce',
        type: 'methodes',
        title: 'Lire un énoncé',
        summary: 'La question dit ce qu’on cherche ; les contraintes disent ce qu’on a le droit de trouver ; les données utiles sont celles sans lesquelles la question reste sans réponse.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>La question</strong> — ce qu’on cherche, et sous quelle forme.
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                <strong>Les contraintes</strong> — ce que la réponse a le droit d’être (entier,
                positif, inférieur à…).
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Les données utiles</strong> — celles sans lesquelles on ne peut pas répondre.
              </div>
            </div>
            <p className="text-xs text-slate-500">Un énoncé contient souvent des nombres dont on n’a
            pas besoin. Les repérer fait partie du travail.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’énoncé où plusieurs
            nombres ne servaient à rien.</div>
          </div>
        ),
      },
    ],

    /* M3 — Choisir l'inconnue. */
    3: [
      {
        id: 'choisir-linconnue',
        type: 'methodes',
        title: 'Choisir l’inconnue',
        summary: 'On nomme x une seule quantité, puis on écrit toutes les autres à partir d’elle.',
        body: (
          <div className="space-y-3">
            <p>Choisir <MathText>{'$x$'}</MathText>, c’est choisir <strong>par où l’on entre</strong>
            dans le problème. Une fois ce choix fait, les autres quantités s’écrivent avec cette
            lettre.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
              « Le second a 4 de plus que le premier » : si le premier est
              <MathText>{' $x$'}</MathText>, le second est <MathText>{'$x + 4$'}</MathText>.
            </div>
            <p className="text-xs text-slate-500">Un autre choix de x donne une autre équation —
            souvent plus simple, parfois plus compliquée. Le résultat, lui, ne change pas.</p>
          </div>
        ),
      },
      {
        id: 'declarer-linconnue',
        type: 'regles',
        title: 'Déclarer ce que x désigne',
        summary: 'Une phrase précise ce que x représente, avec son unité : sans elle, l’équation ne veut rien dire.',
        body: (
          <div className="space-y-2">
            <p>« Soit <MathText>{'$x$'}</MathText> le nombre de séances » — pas « soit x le
            cinéma ». Une quantité, et son unité.</p>
            <p className="text-xs text-slate-500">C’est cette phrase qui permettra, à la fin, de
            retraduire le résultat en réponse.</p>
          </div>
        ),
      },
    ],

    /* M4 — Traduire : la même quantité, deux fois. */
    4: [
      {
        id: 'traduire-en-equation',
        type: 'methodes',
        title: 'Traduire en équation',
        summary: 'Une équation dit la même quantité de deux façons différentes : c’est ce qui justifie le signe égal.',
        body: (
          <div className="space-y-3">
            <p>Écrire une équation, ce n’est pas calculer : c’est <strong>dire deux fois la même
            chose</strong>, de deux manières, et relier les deux par
            <MathText>{' $=$'}</MathText>.</p>
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
              « Les deux formules coûtent pareil » →
              <MathText>{' $5x = 3x + 12$'}</MathText> : le prix, exprimé deux fois.
            </div>
            <p className="text-xs text-slate-500">Tant qu’on n’a pas repéré la quantité exprimable
            de deux façons, il n’y a pas d’équation à écrire.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le Traducteur, où tu as
            assemblé l’équation carte par carte.</div>
          </div>
        ),
      },
    ],

    /* M5 — Choisir sa stratégie. */
    5: [
      {
        id: 'choisir-la-strategie',
        type: 'methodes',
        title: 'Tableau ou équation ?',
        summary: 'La structure du problème décide : part fixe ou non, quantité cherchée prise dans le calcul ou non.',
        body: (
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>Un tableau</strong> suffit quand quelques essais bien choisis suffisent, et
                que la réponse est un entier.
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>Une équation</strong> s’impose dès que la quantité cherchée intervient
                dans le calcul, ou que la réponse n’est pas ronde.
              </div>
            </div>
            <p className="text-xs text-slate-500">Le tableau ne trouve que ce qu’on a pensé à
            tester ; l’équation trouve ce qu’on n’aurait pas deviné.</p>
          </div>
        ),
      },
    ],

    /* M6 — Résoudre, puis vérifier dans l'histoire. */
    6: [
      {
        id: 'resoudre-etape-par-etape',
        type: 'methodes',
        title: 'Résoudre pas à pas',
        summary: 'On fait la même opération des deux côtés du signe égal, jusqu’à isoler x.',
        body: (
          <div className="space-y-2">
            <p>Chaque étape doit garder l’égalité vraie : ce qu’on fait d’un côté, on le fait de
            l’autre.</p>
            <p className="text-xs text-slate-500">Une étape non valable casse tout ce qui suit —
            même si le calcul est juste.</p>
          </div>
        ),
      },
      {
        id: 'mem-verifier-dans-lhistoire',
        type: 'memoriser',
        title: '⭐ Vérifier dans l’histoire, pas dans la dernière ligne',
        summary: 'On remet la valeur trouvée dans l’énoncé de départ, pas dans le calcul qu’on vient d’écrire.',
        body: (
          <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-4 space-y-2 text-center">
            <div className="text-base font-black text-rose-700">
              la valeur retourne dans l’ÉNONCÉ
            </div>
            <p className="text-xs text-rose-700">Vérifier sur sa propre dernière ligne ne prouve
            rien : si l’équation était fausse, elle le reste. Seul l’énoncé tranche.</p>
          </div>
        ),
      },
    ],

    /* M7 — Interpréter, et répondre par une phrase. */
    7: [
      {
        id: 'interpreter-le-resultat',
        type: 'regles',
        title: 'Interpréter le résultat',
        summary: 'Un résultat non entier n’est pas faux : c’est le contexte qui dit s’il faut arrondir, et dans quel sens.',
        body: (
          <div className="space-y-3">
            <p>12,4 personnes n’existe pas ; 12,4 kilomètres, si. C’est la <strong>question</strong>
            qui décide de ce qu’on fait du résultat.</p>
            <p className="text-xs text-slate-500">Et le sens de l’arrondi dépend du problème : pour
            « combien de cartons faut-il ? », on arrondit toujours au-dessus.</p>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les parcours complets, de
            l’énoncé jusqu’à la phrase de réponse.</div>
          </div>
        ),
      },
      {
        id: 'phrase-de-reponse',
        type: 'methodes',
        title: 'La phrase de réponse',
        summary: 'On termine par une phrase qui répond à la question posée, avec son unité — pas par « x = 12 ».',
        body: (
          <div className="space-y-2">
            <p><MathText>{'$x = 12$'}</MathText> est un résultat de calcul, pas une réponse.
            « Il faut 12 séances pour que l’abonnement devienne rentable » en est une.</p>
            <p className="text-xs text-slate-500">C’est la déclaration de l’inconnue, faite au
            module 3, qui permet de rédiger cette phrase.</p>
          </div>
        ),
      },
    ],
  },
};
