import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { madarApi } from '../../services/madarService';

/**
 * Qui joue, et où : l'ÉLÈVE (/espace/jeux) ou l'ENSEIGNANT dans une de ses
 * classes (/enseignant/classes/:classId/jeux — « نافس أستاذك »). La page et ses
 * liens restent les mêmes ; seuls l'API, les adresses et quelques textes changent.
 */
export function useMadarScope() {
  const { classId } = useParams();
  return useMemo(() => ({
    teacher: Boolean(classId),
    classId: classId ?? null,
    api: madarApi(classId ?? null),
    hub: classId ? `/enseignant/classes/${classId}/jeux` : '/espace/jeux',
    exit: classId ? `/enseignant/jeux?classe=${classId}` : '/espace',
  }), [classId]);
}
