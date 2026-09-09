import { useCallback, useMemo, useState } from 'react';
import { scopedStorage } from '../../../utils/storage';

/**
 * CONTINUITÉ D'UN OBJET MATHÉMATIQUE ENTRE PLUSIEURS MODULES.
 *
 * Une leçon peut vouloir que l'objet construit au module 1 soit CELUI qu'on
 * retrouve au module 3 : le triangle qu'on a déformé, la machine qu'on a
 * assemblée, la série qu'on a modifiée. Sans cela, chaque module repart d'un
 * exemple neuf et l'élève ne reconnaît pas son propre travail.
 *
 * RÈGLE (« continuité seulement si elle est pédagogique ») : ce hook ne sert
 * QUE lorsque la réutilisation de l'objet est un choix pédagogique, déclaré
 * par `LESSON_CONFIG.continuity` — jamais pour satisfaire une règle
 * d'architecture ou faire passer un test.
 *
 * Ce n'est PAS un second système de progression :
 * - local-only, jamais synchronisé au serveur (idiome copié de
 *   `usePrerequisiteDiagnostic`) ;
 * - aucune influence sur le déverrouillage, la maîtrise ou les preuves ;
 * - l'absence de valeur mémorisée est un cas NORMAL (nouvelle session,
 *   navigation privée, élève qui commence au module 3) : `initial` reprend la
 *   main et le module reste entièrement jouable.
 *
 * Écrire sur un GESTE SIGNIFIANT (« relever », « garder », « valider »),
 * jamais sur `pointermove` : la persistance ne doit pas entrer dans la boucle
 * de rendu d'une manipulation continue.
 */

/** La clé de stockage. Locale à la leçon ET à l'objet partagé. */
export function labStateKey(lessonId, key) {
  return `smarter_lab_${lessonId}_${key}`;
}

/**
 * Décode ce qui a été mémorisé. Toute donnée illisible ou d'une forme
 * antérieure vaut « rien de mémorisé » : un module ne plante jamais à cause
 * du contenu du localStorage.
 *
 * @returns {{v: *, savedAt?: string} | null}
 */
export function parseLabRecord(raw) {
  if (raw == null) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'v' in parsed) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/** L'enregistrement écrit pour une valeur donnée. */
export function makeLabRecord(v, now = new Date()) {
  return { v, savedAt: now.toISOString() };
}

/**
 * @param {string} lessonId  l'id de la leçon (`LESSON_CONFIG.id`)
 * @param {string} key       le nom de l'objet partagé (`LESSON_CONFIG.continuity.key`)
 * @param {*} initial        la valeur par défaut quand rien n'est mémorisé
 * @returns {{ value: *, saved: boolean, save: (v: *) => void, reset: () => void }}
 */
export function useLabState(lessonId, key, initial) {
  const storageKey = labStateKey(lessonId, key);

  // Lecture en INITIALISEUR : une seule lecture au montage, et le premier
  // rendu affiche déjà l'objet du module précédent (aucun clignotement).
  const [record, setRecord] = useState(() => parseLabRecord(scopedStorage.getItem(storageKey)));

  const save = useCallback(
    (v) => {
      const next = makeLabRecord(v);
      setRecord(next);
      // scopedStorage avale déjà les erreurs de stockage (navigation privée) :
      // la continuité est alors perdue, la leçon reste jouable.
      scopedStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey]
  );

  /** « Un autre exemple » — on repart de `initial`. */
  const reset = useCallback(() => {
    setRecord(null);
    scopedStorage.removeItem(storageKey);
  }, [storageKey]);

  const value = useMemo(() => (record ? record.v : initial), [record, initial]);

  return { value, saved: record != null, save, reset };
}

export default useLabState;
