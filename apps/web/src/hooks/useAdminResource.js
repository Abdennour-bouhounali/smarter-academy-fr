import { useCallback, useEffect, useState } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Charge une ressource d'administration, avec ses trois états.
 *
 * Écrit une fois ici parce que CHAQUE écran d'administration a besoin des
 * mêmes : chargement / erreur / donnée, plus un rechargement manuel. Sans ça,
 * une page finirait par oublier son état d'erreur et échouerait en silence —
 * ce que la spec §34 interdit explicitement.
 *
 * @param {(token: string) => Promise<any>} loader
 * @param {any[]} deps  dépendances qui déclenchent un rechargement
 */
export function useAdminResource(loader, deps = []) {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setData(await loader(token));
    } catch (caught) {
      setError(caught.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
    // loader est recréé à chaque rendu par l'appelant : ce sont `deps` qui
    // décident d'un rechargement, pas l'identité de la fonction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ...deps]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load, setData };
}
