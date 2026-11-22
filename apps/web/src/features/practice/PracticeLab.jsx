import { Suspense } from 'react';

/**
 * Registre FERMÉ des laboratoires qu'un exercice peut embarquer.
 *
 * Un fichier de contenu nomme un labo (`support.lab`), il n'en fournit
 * jamais le code : c'est ce qui empêche le contenu d'exécuter quoi que ce
 * soit. Le validateur refuse un nom absent de cette table.
 *
 * Le registre est VIDE depuis le 2026-09-25 : ses deux labos (TankLab,
 * RateProbes) appartenaient à la leçon française « fonction affine » (2nde),
 * retirée avec toutes les leçons hors de l'unité « الأعداد الطبيعيّة والأعداد
 * النّاطقة ». Le mécanisme reste : un labo réutilisable s'ajoute ici ET dans
 * SUPPORT_LABS (scripts/validate-exercises.mjs), jamais dans le contenu.
 */
const LABS = {};

export default function PracticeLab({ support }) {
  if (!support?.lab) return null;
  const Lab = LABS[support.lab];
  if (!Lab) return null;

  return (
    <Suspense fallback={<div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />}>
      <Lab {...(support.props ?? {})} />
    </Suspense>
  );
}
