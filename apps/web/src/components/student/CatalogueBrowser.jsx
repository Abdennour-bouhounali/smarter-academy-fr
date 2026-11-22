import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../common/DirectionalIcons';
import LessonCard from './LessonCard';
import LessonRow from './LessonRow';
import UnitGroup from './UnitGroup';
import { NoLessonMatches } from './GradeLessonSearch';
import { groupLessonsByUnit } from './unitGrouping';
import { groupLessonsByChapter, unitByLessonId } from './catalogueView';

/**
 * LE rendu de la sélection du catalogue — /courses, « Mes leçons » et
 * « Explorer » (et /enseignant/cours) le partagent, pour qu'une vue choisie
 * se comporte partout pareil. La page garde ses filtres (niveau, thème,
 * recherche) ; ce composant ne fait que DESSINER ce qu'elle lui donne,
 * selon la vue de l'utilisateur (catalogueView.js) :
 *
 *   recherche active → les résultats à plat, chacun avec son unité ;
 *   'units'          → cartes d'unité, puis leçons hors unité (défaut) ;
 *   'chapters'       → thème → chapitre → leçons + synthèse, tout déplié ;
 *   'all'            → toutes les leçons à plat, chacune avec son unité.
 *
 * @param {Array}  chapters      les thèmes visibles (un seul, ou tous)
 * @param {Array}  lessons       les leçons visibles (déjà filtrées par thème)
 * @param {Array}  gradeChapters TOUS les thèmes du niveau — d'où l'unité de
 *                               chaque résultat de recherche (qui traverse
 *                               les thèmes) est lue
 * @param {Array|null} searchResults  `filterLessonsByQuery(...)` — null hors recherche
 * @param {{group, layout}} view
 */
export default function CatalogueBrowser(props) {
  // Un changement de thème, de vue ou de recherche REMONTE la liste au lieu
  // de l'animer : avec <AnimatePresence mode="popLayout">, jusqu'à 74 tuiles
  // sortantes gardaient leur place pendant l'animation — la page restait
  // haute, une grande bande vide sous la liste (vu par le propriétaire,
  // 2026-10-07) — et les tuiles communes aux deux sélections traversaient
  // l'écran (`layout`). Les tuiles gardent leur fondu d'entrée.
  const selectionKey = [
    (props.chapters ?? []).map((c) => c.id).join('|'),
    props.view.group,
    props.view.layout,
    props.searchResults ? `q:${props.searchQuery}` : '',
  ].join('/');
  // Une classe dont AUCUNE leçon n'est encore publiée (1AM–3AM, 2026-10-14) :
  // le programme et le découpage du manuel sont là, en cartes « En préparation » —
  // on le dit une fois, en tête, pour que l'élève ne prenne pas ça pour une panne.
  const lessons = props.lessons ?? [];
  const drafting = !props.searchResults && lessons.length > 0 && !lessons.some((l) => l.status === 'available');
  return (
    <>
      {drafting && <GradeDraftingNotice />}
      <CatalogueSelection key={selectionKey} {...props} />
    </>
  );
}

function GradeDraftingNotice() {
  const { t } = useTranslation('common');
  return (
    <div className="mb-5 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3" role="status" data-grade-drafting>
      <p className="font-bold text-slate-800">{t('gradeProgrammeOnlyTitle')}</p>
      <p className="mt-0.5 text-sm text-slate-600">{t('gradeProgrammeOnlyBody')}</p>
    </div>
  );
}

function CatalogueSelection({
  chapters,
  gradeChapters = chapters,
  lessons,
  searchResults = null,
  searchQuery = '',
  view,
  onLessonClick,
  emptyMessage = null,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
}) {
  const { t } = useTranslation('student');
  const rows = view.layout === 'rows';
  const Tile = rows ? LessonRow : LessonCard;
  const units = useMemo(() => unitByLessonId(gradeChapters), [gradeChapters]);

  const unitLabel = (lesson) => {
    const unit = units.get(lesson.id);
    return unit ? `${t('unit.unitNumber', { n: unit.number })} · ${unit.title}` : null;
  };
  const tiles = (list, { withUnit = false } = {}) => list.map((lesson) => (
    <Tile key={lesson.id} lesson={lesson} eyebrow={withUnit ? unitLabel(lesson) : null}
      onClick={onLessonClick ? () => onLessonClick(lesson) : undefined} />
  ));
  const box = (children, extra = '') => (
    <div className={`${rows ? 'flex flex-col gap-2' : gridClassName} ${extra}`}>
      {children}
    </div>
  );

  if (searchResults) {
    return searchResults.length === 0
      ? <NoLessonMatches query={searchQuery} />
      : box(tiles(searchResults, { withUnit: true }));
  }

  if (lessons.length === 0) return emptyMessage;

  if (view.group === 'chapters') {
    const sections = groupLessonsByChapter(chapters, lessons);
    return (
      <div className="space-y-10" data-catalogue-view="chapters">
        {sections.map(({ chapter, blocks }) => (
          <section key={chapter.id} aria-labelledby={`chapter-${chapter.id}`} className="space-y-6">
            <h2 id={`chapter-${chapter.id}`} className="flex items-center gap-2 border-b border-slate-200 pb-2 font-space text-lg font-bold text-slate-900">
              {chapter.icon && <span className="text-2xl" aria-hidden="true">{chapter.icon}</span>}
              {chapter.title}
            </h2>
            {blocks.map(({ unit, lessons: list }) => (
              <div key={unit?.id ?? 'rest'} className="space-y-3">
                {unit ? (
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-bold text-slate-800">
                      {unit.icon && <span className="me-1.5" aria-hidden="true">{unit.icon}</span>}
                      <span className="me-2 font-mono text-[11px] uppercase tracking-wider text-nav-accent">{t('unit.unitNumber', { n: unit.number })}</span>
                      {unit.title}
                    </h3>
                    <Link to={unit.path} className="group inline-flex items-center gap-1 text-xs font-bold text-nav-accent hover:text-indigo-900" data-unit-group={unit.id}>
                      {t('unit.unitCard.open')} <ArrowForward size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                ) : (
                  <h3 className="text-sm font-bold text-slate-600">{t('unit.unitCard.otherTopics')}</h3>
                )}
                {box(tiles(list))}
              </div>
            ))}
          </section>
        ))}
      </div>
    );
  }

  if (view.group === 'all') {
    return <div data-catalogue-view="all">{box(tiles(lessons, { withUnit: true }))}</div>;
  }

  // 'units' — le niveau chapitre (phase 8) : dans un thème du manuel, l'élève
  // choisit d'abord une UNITÉ ; ses leçons vivent sur la page d'unité. Les
  // leçons hors unité restent des tuiles. Sans unité : les leçons seules.
  const unitGroups = groupLessonsByUnit(chapters, lessons);
  if (!unitGroups) return <div data-catalogue-view="units">{box(tiles(lessons))}</div>;
  return (
    <div className="space-y-6" data-catalogue-view="units">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700">{t('unit.unitCard.unitsTitle')}</h3>
        {box(unitGroups.units.map((unit) => <UnitGroup key={unit.id} unit={unit} layout={view.layout} />))}
      </div>
      {unitGroups.rest.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-600">{t('unit.unitCard.otherTopics')}</h3>
          {box(tiles(unitGroups.rest))}
        </div>
      )}
    </div>
  );
}
