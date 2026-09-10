import { lazy, Suspense } from 'react';

/**
 * Registre FERMÉ des laboratoires qu'un exercice peut embarquer.
 *
 * Un fichier de contenu nomme un labo (`support.lab`), il n'en fournit
 * jamais le code : c'est ce qui empêche le contenu d'exécuter quoi que ce
 * soit. Le validateur refuse un nom absent de cette table.
 *
 * Les deux labos sont ceux que la leçon a déjà construits et éprouvés — la
 * pratique les réutilise plutôt que d'inventer une seconde manipulation pour
 * les mêmes mathématiques.
 */
const LABS = {
  TankLab: lazy(() => import('../../lessons/lycee/seconde/fonctions/fonction-affine-2nde/components/TankLab')),
  RateProbes: lazy(() => import('../../lessons/lycee/seconde/fonctions/fonction-affine-2nde/components/RateProbes')),
};

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
