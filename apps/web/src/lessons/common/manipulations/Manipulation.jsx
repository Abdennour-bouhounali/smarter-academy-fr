import { Suspense } from 'react';
import { MANIPULATION_COMPONENTS } from './manipulationRegistry';

/**
 * Le point d'entrée d'un module : `<Manipulation type="pgcd-differences" a={252} b={140} title="…" />`.
 * Résout le composant du type dans le registre fermé et le rend paresseusement.
 */
export default function Manipulation({ type, ...props }) {
  const Component = MANIPULATION_COMPONENTS[type];
  if (!Component) {
    // Un type inconnu est un DÉFAUT DE CONTENU, attrapé par validate-lessons ;
    // ici on ne rend rien plutôt qu'un message en français.
    return null;
  }
  return (
    <Suspense fallback={<div className="min-h-[160px] rounded-3xl border-2 border-indigo-100 bg-indigo-50/40" />}>
      <Component {...props} />
    </Suspense>
  );
}
