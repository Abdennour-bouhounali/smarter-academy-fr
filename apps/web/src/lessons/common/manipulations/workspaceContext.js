import { createContext, useContext } from 'react';

/**
 * Le niveau du `ManipulationWorkspace` qui ENTOURE une manipulation, ou
 * `null` si elle est posée seule.
 *
 * Il n'y a qu'UN sélecteur مبتدئ / متقدم à l'écran : celui du workspace
 * quand il y en a un, sinon celui de la manipulation. Une manipulation qui
 * lit un niveau ici n'affiche donc pas le sien — c'est ce contexte qui
 * empêche deux sélecteurs empilés.
 */
export const WorkspaceLevelContext = createContext(null);

export function useWorkspaceLevel() {
  return useContext(WorkspaceLevelContext);
}
