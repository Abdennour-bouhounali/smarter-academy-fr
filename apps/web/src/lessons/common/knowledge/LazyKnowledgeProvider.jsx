import React, { lazy } from 'react';
import { LessonKnowledgeProvider } from './KnowledgeProvider';

/**
 * Le provider de carte des connaissances, avec sa DONNÉE chargée à la demande.
 *
 * ── Le problème que ce fichier résout ────────────────────────────────────
 * Chaque `routes.jsx` de leçon importait statiquement son `knowledge.jsx` :
 *
 *     import { LESSON_KNOWLEDGE } from './knowledge';
 *
 * App.jsx importe les 132 `routes.jsx` (il le doit : les CHEMINS des routes
 * doivent exister au premier rendu pour que React Router puisse apparier
 * l'URL). En conséquence, les 132 `knowledge.jsx` entraient dans le lot
 * d'entrée — 2,8 Mo de source, plus KaTeX qu'ils tirent via `MathText`.
 * Un visiteur anonyme sur la page d'accueil téléchargeait la carte des
 * connaissances de TOUTES les leçons du collège et du lycée.
 *
 * ── Pourquoi on peut le différer sans rien casser ────────────────────────
 * `LESSON_KNOWLEDGE` n'est pas nécessaire pour APPARIER une route : il est
 * seulement consommé À L'INTÉRIEUR de l'élément, par le provider. Les chemins
 * viennent de `lesson.config.js`, un module de données sans aucun import, qui
 * reste chargé d'avance. On garde donc l'appariement synchrone et on ne
 * charge la carte que lorsque la page de la leçon s'ouvre réellement —
 * exactement au même moment que le composant du module, lui déjà `lazy`.
 *
 * L'attente est donc celle qui existait déjà : `withSuspense` enveloppait
 * toujours le contenu d'un `<Suspense>`, et le module lui-même est chargé en
 * parallèle de la carte, pas après.
 *
 * @param {() => Promise<{LESSON_KNOWLEDGE: object}>} load  l'import dynamique du knowledge.jsx de la leçon
 */
const cache = new Map();

export function makeLazyKnowledgeProvider(load) {
  // Un composant `lazy` par leçon, mémorisé : en recréer un à chaque rendu
  // relancerait le chargement et remonterait tout l'arbre de la leçon.
  const cached = cache.get(load);
  if (cached) return cached;

  // `lazy` mémorise la promesse : le module n'est demandé qu'une fois, et les
  // navigations suivantes dans la leçon sont synchrones.
  const Inner = lazy(async () => {
    const mod = await load();
    const knowledge = mod.LESSON_KNOWLEDGE;
    return {
      default: function LoadedKnowledgeProvider({ children, ...props }) {
        return (
          <LessonKnowledgeProvider {...props} knowledge={knowledge}>
            {children}
          </LessonKnowledgeProvider>
        );
      },
    };
  });
  cache.set(load, Inner);
  return Inner;
}

/**
 * Variante pratique : accepte directement la fonction d'import et rend le
 * provider. Le `<Suspense>` reste à la charge de l'appelant (`routes.jsx` en
 * pose déjà un autour de tout l'élément).
 */
export function LazyLessonKnowledgeProvider({ load, children, ...props }) {
  const Provider = makeLazyKnowledgeProvider(load);
  return <Provider {...props}>{children}</Provider>;
}
