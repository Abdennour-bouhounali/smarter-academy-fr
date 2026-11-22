import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ClassroomPresentation from './ClassroomPresentation';
import { lessonNeighbours } from './classroomUnits';
import { useClassroomMode } from './ClassroomContext';
import { wantsClassroomStart } from '../../../features/teacher/lessonMemo/memoRoutes';
import { hasClassBoard, classSessionPath } from '../../../features/classSession/boardLessons';

/**
 * La coquille de présentation d'une LEÇON — un élément de route « layout »
 * posé au-dessus du sommaire et des modules (buildLessonRoutes). Il reste
 * monté quand on passe d'un module à l'autre : c'est ce qui permet à la
 * session (et au plein écran natif, qui est sur SA racine) de survivre à la
 * navigation « module suivant » d'une présentation de leçon.
 *
 * Elle sert les deux portées supérieures :
 *   🎓 وضع القسم   (sommaire → module 0 → … → dernier module)
 *   ⛶ عرض          (le module courant, ses unités seulement) — bouton flottant
 *
 * Elle ne connaît rien du contenu : les pages présentées déclarent leur
 * titre et leurs gestes (useClassroomStage) ; elle ne fournit que la
 * navigation entre pages, dérivée de LESSON_CONFIG.modules et de l'URL.
 */
export default function LessonClassroomShell({ config, basePath }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation('lesson');

  const neighbours = useMemo(() => lessonNeighbours(config, basePath, pathname), [config, basePath, pathname]);
  const goPrevious = useCallback(() => { if (neighbours.previous) navigate(neighbours.previous); }, [navigate, neighbours.previous]);
  const goNext = useCallback(() => { if (neighbours.next) navigate(neighbours.next); }, [navigate, neighbours.next]);
  // Le libellé du saut NOMME sa cible (« المحور 2 ») plutôt que de répéter
  // « المحور التالي » : l'enseignant voit où il va avant de cliquer. Le
  // retour au sommaire garde son nom à lui.
  const labelFor = useCallback((module, fallbackKey) => (module
    ? `${t('nav.module')} ${module.number}`
    : t(fallbackKey)), [t]);
  const lessonNavigation = useMemo(() => ({
    previous: neighbours.previous ? goPrevious : null,
    next: neighbours.next ? goNext : null,
    previousLabel: neighbours.previous ? labelFor(neighbours.previousModule, 'classroom.positionOverview') : undefined,
    nextLabel: neighbours.next ? labelFor(neighbours.nextModule, 'classroom.nextModule') : undefined,
    position: neighbours.position,
    total: neighbours.total,
  }), [neighbours, goPrevious, goNext, labelFor]);

  return (
    <ClassroomPresentation
      scope="lesson"
      title={config.title}
      entry="none"
      routeScope={basePath}
      lessonNavigation={lessonNavigation}
      className="sa-classroom-lesson"
      retired={hasClassBoard(config.id)}
    >
      <StartOnArrival title={config.title} lessonId={config.id} />
      <Outlet />
    </ClassroomPresentation>
  );
}

/**
 * « وضع القسم » depuis une CARTE du catalogue enseignant (TeacherLessonCard)
 * ou depuis la مذكرة الدرس : on arrive sur la leçon avec l'état
 * `CLASSROOM_START_STATE`, et la séance s'ouvre ici — exactement comme le
 * bouton du sommaire (`enterClassroomMode`, même permission
 * `canPresentClassroom`, même plein écran).
 *
 * Le clic d'origine date de quelques millisecondes : le navigateur accorde
 * encore le plein écran (activation utilisateur transitoire). S'il le
 * refuse, la présentation s'ouvre en repli, comme partout ailleurs.
 *
 * L'état est effacé aussitôt (`replace`) : un rafraîchissement ou un retour
 * arrière ne rouvre jamais la séance tout seul.
 */
function StartOnArrival({ title, lessonId }) {
  const { state, pathname, search } = useLocation();
  const navigate = useNavigate();
  const { canPresent, isClassroomMode, enterClassroomMode } = useClassroomMode();
  const done = useRef(false);
  useEffect(() => {
    // A lesson that has its own board: an old « وضع القسم » door (a bookmark, a link kept somewhere) opens « حصّة القسم ».
    if (!done.current && wantsClassroomStart(state) && hasClassBoard(lessonId)) { done.current = true; navigate(classSessionPath(lessonId), { replace: true }); return; }
    // `canPresent` attend le compte (AuthContext) : tant qu'il n'est pas là,
    // on patiente sans consommer la demande.
    if (done.current || !wantsClassroomStart(state) || !canPresent) return;
    done.current = true;
    navigate(`${pathname}${search}`, { replace: true, state: null });
    if (!isClassroomMode) enterClassroomMode({ scope: 'lesson', title });
  }, [state, pathname, search, navigate, canPresent, isClassroomMode, enterClassroomMode, title]);
  return null;
}
