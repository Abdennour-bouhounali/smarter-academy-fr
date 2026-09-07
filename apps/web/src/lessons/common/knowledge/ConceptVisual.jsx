import React from 'react';

/**
 * ConceptVisual — la présentation d'un visuel de connaissance.
 *
 * POURQUOI CE FICHIER. Les 279 `visual:` des 74 leçons étaient tous rendus
 * dans le même encadré, à leur taille intrinsèque : un SVG écrit
 * `width={200} height={160}` occupe 200 px quelle que soit la place offerte.
 * Élargir la carte ne changeait donc rien — le schéma restait une vignette au
 * milieu d'un pavé de texte, et dans le tiroir (`overflow-hidden`) un visuel
 * plus large que la colonne était COUPÉ, sans ascenseur pour le rattraper.
 *
 * La correction n'est pas un `transform: scale()` — il floute les traits,
 * déborde et casse les proportions. C'est le `viewBox` qui fait le travail :
 * laissé libre de s'étirer (`w-full`), il redessine géométrie, étiquettes et
 * épaisseurs ENSEMBLE, donc net à toute taille. `maxWidth` empêche seulement
 * un petit schéma de s'étaler bêtement au-delà de sa taille utile.
 *
 * SÉMANTIQUE, PAS DES PIXELS. L'auteur d'une leçon ne décrit pas une largeur,
 * il décrit ce que le visuel VAUT pour la compréhension :
 *
 *   visualSize: 'sm'    une vignette qui illustre        (2 + 3 = 5)
 *               'md'    un schéma qu'on lit              (défaut)
 *               'lg'    des relations qu'on inspecte     (figure géométrique)
 *               'full'  la démonstration elle-même       (schéma complexe)
 *
 * Un `visualSize` absent vaut 'md' : les leçons existantes ne changent pas de
 * comportement, elles cessent seulement d'être bridées à leur taille native.
 *
 * @param {React.ReactNode} children le visuel (SVG, figure, tableau…)
 * @param {'sm'|'md'|'lg'|'full'} [size='md']
 * @param {'brick'|'drawer'|'print'} [context='brick'] où l'on dessine
 */

/**
 * La décision de présentation, isolée du rendu pour être testable
 * (les tests du dépôt sont des tests de logique, sans DOM).
 */
export function resolveVisual(size, context) {
  return {
    size: size in SIZES ? size : 'md',
    maxWidth: SIZES[size] ?? SIZES.md,
    box: (CONTEXT[context] ?? CONTEXT.brick).box,
  };
}

export default function ConceptVisual({ children, size = 'md', context = 'brick', className = '' }) {
  const resolved = resolveVisual(size, context);

  return (
    <figure
      data-concept-visual={resolved.size}
      className={`sa-concept-visual ${resolved.box} ${className}`}
    >
      {/* La largeur est portée ICI, pas sur le SVG : l'enfant garde son
          viewBox et s'étire jusqu'à cette borne, centré au-delà.

          `sa-concept-visual` (styles.css) NEUTRALISE le `max-width` que
          chaque schéma s'était donné — sa largeur d'origine, 120 à 258 px
          selon les leçons. Sans cela un schéma resterait une vignette dans
          une carte de 686 px : c'est la taille sémantique qui décide, pas
          le nombre que l'auteur avait tapé pour dessiner. */}
      <div className="w-full mx-auto" style={{ maxWidth: resolved.maxWidth }}>
        {children}
      </div>
    </figure>
  );
}

/**
 * Les bornes. Elles plafonnent, elles n'imposent pas : un schéma dont le
 * `maxWidth` propre est plus petit reste à sa taille — on ne grossit jamais
 * un visuel au-delà de ce que son auteur a jugé lisible (§18 : « big enough
 * to understand », pas « bigger everything »).
 */
const SIZES = {
  sm: 260,
  md: 420,
  lg: 620,
  full: '100%',
};

/**
 * Le cadre change avec le lieu, la largeur ne change pas.
 *
 * `drawer` et `print` ne mettent PAS d'encadré : dans le tiroir les cartes
 * sont déjà séparées par un filet, et à l'impression un cadre de plus mange
 * la page. `overflow-x-auto` remplace partout l'`overflow-hidden` d'origine —
 * si un visuel dépasse malgré tout, on peut le faire défiler au lieu de le
 * perdre.
 */
const CONTEXT = {
  brick: {
    box: 'my-1 flex justify-center rounded-xl border border-slate-100 bg-slate-50/60 px-2 py-3 overflow-x-auto',
  },
  drawer: {
    box: 'my-2 flex justify-center overflow-x-auto',
  },
  print: {
    box: 'my-2 flex justify-center print-example',
  },
};

export { SIZES as CONCEPT_VISUAL_SIZES };
