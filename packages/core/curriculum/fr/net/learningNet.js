import programme from './official_programme_college.json' with { type: 'json' };
import net from './learning_net_college.json' with { type: 'json' };
import lessons6e from '../lessons_6e_2026_2027.json' with { type: 'json' };
import lessons5e from '../lessons_5e_2026_2027.json' with { type: 'json' };
import lessons4e from '../lessons_4e_2026_2027.json' with { type: 'json' };
import lessons3e from '../lessons_3e_2026_2027.json' with { type: 'json' };
import units6e from '../units_6e_2026_2027.json' with { type: 'json' };
import units5e from '../units_5e_2026_2027.json' with { type: 'json' };
import units4e from '../units_4e_2026_2027.json' with { type: 'json' };
import units3e from '../units_3e_2026_2027.json' with { type: 'json' };

/**
 * Le RÉSEAU DES COMPÉTENCES du collège (6e–3e) — résolveur pur.
 *
 * Trois couches, une seule autorité chacune (docs/architecture/LEARNING_NET.md) :
 *
 *   official_programme_college.json  les ITEMS du programme officiel, mot pour mot,
 *                                  id stable `<g>.m<segment>.r<nn>` (ou `.x<n>`) ;
 *   learning_net_college.json      les LIENS entre items (requires / extends /
 *                                  consolidates) et les fils conceptuels ;
 *   lessons_<g>_*.json             les leçons des quatre classes, qui déclarent
 *                                  leurs items dans `programmeItems` : publiées
 *                                  (`available`) ou à générer (`coming_soon`,
 *                                  vues ici comme `planned`).
 *
 * Une leçon générée garde son code et ses items, et passe `available` : aucun
 * lien n'est à réécrire.
 *
 * STUB items (`stub: true`): real prerequisites of a later grade, in a grade that has NO lesson yet. A stub has no home
 * lesson (`homeLessonOf` → null) and every result that names a home lesson names, for a stub, the item itself with
 * `noLessonInGrade: <its grade>` instead. Tested: a stub's grade has no lesson at all, and no link ends on a stub.
 *
 * What the 2026 programme adds to 3e from 2028 lives in `horizon_2028.json`, which this module does NOT load.
 *
 * Ce module n'entre PAS dans le barrel `@smarter-academy/core` (bundle
 * d'entrée) : on l'importe par son chemin, depuis le runtime de leçon.
 *
 * `createLearningNet` construit le résolveur sur des données données : les tests
 * vérifient ainsi les règles du réseau sur un petit jeu à eux, en plus du réseau
 * livré. Les exports nommés sont le résolveur du programme livré (3e, 2026-11-22).
 */

/** Les deux poids d'un lien (voir plus bas, « LE POIDS D'UN LIEN »). */
export const WEIGHTS = ['core', 'support'];
export const weightOf = (link) => link.weight ?? null;

/**
 * Le résolveur du réseau sur un jeu de données.
 *
 * @param {object} data
 * @param {object} data.programme      la forme de official_programme_college.json (`grades` donne l'ordre des classes)
 * @param {object} data.net            la forme de learning_net_college.json
 * @param {object[]} data.lessonFiles  les fichiers lessons_<g>, dans l'ordre des classes
 * @param {object[]} data.unitFiles    les fichiers units_<g>
 * @param {string[]} [data.weightedGrades]  les classes dont TOUS les liens entrants sont classés core / support
 */
export function createLearningNet({ programme, net, lessonFiles, unitFiles, weightedGrades = [] }) {
  const WEIGHTED_GRADES = weightedGrades;
  const GRADES = programme.grades;
  const GRADE_ORDER = Object.fromEntries(GRADES.map((g, i) => [g.id, i + 1]));
  // `{grade}_{lessonCode}_P{n}`, for the grades of this programme only.
  const learningPointPattern = new RegExp(`^(${GRADES.map((g) => g.id).join('|')})_([a-z0-9]+(?:-[a-z0-9]+)*)_P\\d+$`);
  const ITEMS = programme.items;
  const SEGMENTS = programme.segments;
  const THREADS = net.threads;
  const LINKS = net.links;
  /** Les unités des quatre classes, avec leur classe. */
  const UNITS = unitFiles.flatMap((file) => file.units.map((u) => ({ ...u, grade: file.grade })));

  const itemById = new Map(ITEMS.map((i) => [i.id, i]));
  const segmentById = new Map(SEGMENTS.map((s) => [s.id, s]));
  const threadOfItem = new Map(THREADS.flatMap((t) => t.items.map((id) => [id, t.id])));

  /**
   * Toutes les leçons, dans l'ordre du cursus (année, puis `order` du catalogue).
   * `status` : `available` (publiée) ou `planned` (`coming_soon` au catalogue).
   */
  const LESSONS = lessonFiles.flatMap((file) =>
    file.lessons.map((l) => ({
      code: l.code,
      grade: file.grade,
      unit: l.unitId,
      order: l.order,
      kind: l.kind,
      title: l.title,
      programmeItems: l.programmeItems ?? [],
      status: l.status === 'available' ? 'available' : 'planned',
    }))
  ).sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.order - b.order);

  const lessonByCode = new Map(LESSONS.map((l) => [l.code, l]));

  /** Position d'un item dans le cursus : année, puis مقطع, puis rang. */
  function itemRank(id) {
    const item = itemById.get(id);
    if (!item) return Infinity;
    const seg = segmentById.get(item.segment);
    const n = item.number ?? 50 + Number(id.split('.x')[1] ?? 0);
    return GRADE_ORDER[item.grade] * 10000 + seg.number * 100 + n;
  }

  function getItem(id) {
    return itemById.get(id) ?? null;
  }

  function getSegment(id) {
    return segmentById.get(id) ?? null;
  }

  function getThreadOf(itemId) {
    return threadOfItem.get(itemId) ?? null;
  }

  function getLesson(code) {
    return lessonByCode.get(code) ?? null;
  }

  /** A stub item: a prerequisite whose grade has no lesson yet. */
  function isStub(itemId) {
    return itemById.get(itemId)?.stub === true;
  }

  /**
   * La leçon d'ACCUEIL d'un item : la première leçon (ordre du cursus) qui le
   * déclare. C'est là qu'on renvoie un élève qui bute sur cet item. Les leçons
   * de synthèse ne sont jamais l'accueil d'un item. `null` for a stub (its grade has no lesson) and for an unknown id.
   */
  function homeLessonOf(itemId) {
    if (isStub(itemId)) return null;
    return LESSONS.find((l) => l.kind !== 'synthesis' && l.programmeItems.includes(itemId)) ?? null;
  }

  /** Les leçons (existantes ou prévues) qui déclarent l'item, dans l'ordre du cursus. */
  function lessonsOf(itemId) {
    return LESSONS.filter((l) => l.programmeItems.includes(itemId));
  }

  /** Liens ENTRANTS : ce dont l'item repart (types filtrables). */
  function linksInto(itemId, types = ['requires', 'extends', 'consolidates']) {
    return LINKS.filter((k) => k.to === itemId && types.includes(k.type));
  }

  /** Liens SORTANTS : où l'item sert plus tard. */
  function linksFrom(itemId, types = ['requires', 'extends', 'consolidates']) {
    return LINKS.filter((k) => k.from === itemId && types.includes(k.type));
  }

  const describeItem = (id) => {
    const item = itemById.get(id);
    return { id, grade: item.grade, segment: item.segment, text: item.text, stub: item.stub === true };
  };

  const describeLesson = (lesson) =>
    lesson ? { code: lesson.code, grade: lesson.grade, title: lesson.title, status: lesson.status } : null;

  /**
   * « راجع قبل أن تنطلق » — ce qu'une leçon suppose acquis, d'UN pas dans le
   * réseau (jamais la fermeture transitive : on renvoie à la marche d'en
   * dessous, pas à tout l'escalier).
   *
   * Pour chaque item de la leçon, ses prérequis (`requires`) et la base qu'il
   * prolonge ou consolide (`extends` / `consolidates`). Sont écartés : les items
   * que la leçon enseigne elle-même, et ceux dont la leçon d'accueil est cette
   * leçon. Groupé par leçon d'accueil, du plus ancien au plus récent.
   *
   * Chaque item porte le POIDS du lien (`weight` : 'core' | 'support' | null si le lien
   * n'est pas encore classé — voir WEIGHTED_GRADES).
   *
   * Stub prerequisites are grouped by their grade: `{ lesson: null, noLessonInGrade: '4e', items }` — the items
   * themselves (text, grade), since no lesson teaches them yet.
   *
   * @returns {Array<{ lesson: {code, grade, title, status} | null, noLessonInGrade?: string,
   *                   items: Array<{id, grade, segment, text, stub, via, weight}> }>}
   */
  function reviewLinksForLesson(code) {
    const lesson = lessonByCode.get(code);
    if (!lesson) return [];
    const own = new Set(lesson.programmeItems);
    const found = new Map();
    for (const itemId of lesson.programmeItems) {
      for (const link of linksInto(itemId)) {
        if (own.has(link.from)) continue;
        // un item atteint par deux liens garde le plus fort : « core » l'emporte
        if (found.has(link.from)) { if (link.weight === 'core') found.get(link.from).weight = 'core'; continue; }
        const home = homeLessonOf(link.from);
        if (home?.code === code) continue;
        found.set(link.from, { ...describeItem(link.from), via: link.type, weight: link.weight ?? null, home });
      }
    }
    const groups = new Map();
    for (const entry of [...found.values()].sort((a, b) => itemRank(a.id) - itemRank(b.id))) {
      const key = entry.home?.code ?? (entry.stub ? `__stub__${entry.grade}` : `__none__${entry.id}`);
      if (!groups.has(key)) {
        groups.set(key, entry.stub
          ? { lesson: null, noLessonInGrade: entry.grade, items: [] }
          : { lesson: describeLesson(entry.home), items: [] });
      }
      const { home: _home, ...item } = entry;
      groups.get(key).items.push(item);
    }
    return [...groups.values()];
  }

  /**
   * LE POIDS D'UN LIEN (2026-11-17, propriétaire : « ce qui dépend LOURDEMENT d'autre chose »).
   *   core     on ne peut pas réussir les exercices de « to » en échouant sur « from » ;
   *   support  « from » aide, éclaire ou sert une preuve, mais « to » se réussit sans lui (le lien dit pourquoi : `weightNote`).
   * Le poids vaut pour les trois types de lien. Il décide : quels prérequis un lancement mesure d'abord, lequel peut être
   * NOMMÉ comme cause d'une difficulté, et ce qu'une réussite sur « to » permet de DÉDUIRE (jamais à travers un lien support).
   * Les liens sont classés année par année : `WEIGHTED_GRADES` liste les années dont TOUS les liens entrants sont classés —
   * ceux de ses items, et ceux des items d'une autre année que ses leçons enseignent (leçon de rappel) (testé).
   */

  /** Les prérequis DIRECTS d'un item par un lien « core » (un pas ; jamais la fermeture). */
  function corePrerequisitesOf(itemId) {
    return LINKS.filter((k) => k.to === itemId && k.weight === 'core').map((k) => k.from);
  }

  /** Les items que celui-ci porte DIRECTEMENT par un lien « core » : ce qu'une faiblesse ici met en danger. */
  function coreDependentsOf(itemId) {
    return LINKS.filter((k) => k.from === itemId && k.weight === 'core').map((k) => k.to);
  }

  /**
   * Les OUTILS d'une leçon — les prérequis qu'un lancement (« عُدّة الانطلاق ») mesure, dans l'ordre où il les mesure :
   * les « core » d'abord, puis les « support » ; à poids égal l'année la plus récente d'abord (le pas juste en dessous),
   * puis l'ordre du programme. Au plus `max` (4 : cinq minutes). Un lien non classé compte comme « core » en attendant
   * (une année non classée ne perd aucun outil).
   * Un outil est une الكفاءة ANTÉRIEURE (2026-11-18) : un item dont la leçon d'accueil vient APRÈS la leçon (même année,
   * `order` plus grand) n'est jamais un outil — un lancement ne mesure pas ce que l'élève n'a pas encore appris. Cas réel :
   * « القسمة الإقليدية وحصر حاصل القسمة » (2AM, ordre 5) partage `2am.m1.r06` avec « الكسر: نسبة وحاصل قسمة » (ordre 6), et
   * `2am.m1.r06` « requires » `2am.m1.r05` (le lien va de r05 à r06), un item dont la leçon d'accueil est la leçon 6 ; sans
   * cette règle, la leçon 5 mesurait un outil de la leçon 6.
   *
   * A stub prerequisite is a tool (it is earlier by construction: an earlier grade) with `lesson: null` and
   * `noLessonInGrade` set.
   *
   * @returns {Array<{ id, grade, segment, text, stub, via, weight, lesson: {code, grade, title, status} | null,
   *                   noLessonInGrade: string | null }>}
   */
  function toolsForLesson(code, { max = 4 } = {}) {
    const at = LESSONS.indexOf(lessonByCode.get(code));
    const earlier = (lesson) => !lesson || LESSONS.indexOf(lessonByCode.get(lesson.code)) < at;
    const flat = reviewLinksForLesson(code)
      .filter((group) => earlier(group.lesson))
      .flatMap((group) => group.items.map((item) => ({ ...item, lesson: group.lesson, noLessonInGrade: group.noLessonInGrade ?? null })));
    const heavy = (t) => (t.weight === 'support' ? 1 : 0);
    return flat.sort((a, b) => heavy(a) - heavy(b) || itemRankGrade(b.id) - itemRankGrade(a.id) || itemRank(a.id) - itemRank(b.id)).slice(0, max);
  }
  const itemRankGrade = (id) => GRADE_ORDER[itemById.get(id).grade];

  /**
   * Où ce que la leçon enseigne SERT plus tard (liens sortants vers d'autres
   * leçons), groupé par leçon d'accueil de l'item cible. A link never ends on a stub (tested), so every target has
   * a home lesson or is skipped.
   */
  function forwardLinksForLesson(code) {
    const lesson = lessonByCode.get(code);
    if (!lesson) return [];
    const own = new Set(lesson.programmeItems);
    const groups = new Map();
    for (const itemId of lesson.programmeItems) {
      for (const link of linksFrom(itemId)) {
        if (own.has(link.to)) continue;
        const home = homeLessonOf(link.to);
        if (!home || home.code === code) continue;
        if (!groups.has(home.code)) groups.set(home.code, { lesson: describeLesson(home), items: [] });
        const items = groups.get(home.code).items;
        if (!items.some((i) => i.id === link.to)) items.push({ ...describeItem(link.to), via: link.type });
      }
    }
    return [...groups.values()].sort(
      (a, b) => itemRank(a.items[0].id) - itemRank(b.items[0].id)
    );
  }

  /**
   * Ce qu'une leçon ne doit PAS reconstruire : pour chacun de ses items qui
   * prolonge (`extends`) ou répète (`consolidates`) un item antérieur, la base et
   * la valeur ajoutée attendue. C'est la règle anti-doublon du réseau, lue par
   * le générateur de leçons. A stub base has `baseLesson: null` and `baseNoLessonInGrade: <its grade>`.
   */
  function noRebuildForLesson(code) {
    const lesson = lessonByCode.get(code);
    if (!lesson) return [];
    return lesson.programmeItems.flatMap((itemId) =>
      linksInto(itemId, ['extends', 'consolidates']).map((link) => ({
        item: describeItem(itemId),
        base: describeItem(link.from),
        baseLesson: describeLesson(homeLessonOf(link.from)),
        baseNoLessonInGrade: isStub(link.from) ? itemById.get(link.from).grade : null,
        type: link.type,
        addedValue: link.addedValue ?? null,
        note: link.note ?? null,
      }))
    );
  }

  /** La leçon d'une الكفاءة : `{grade}_{lessonCode}_P{n}` → `lessonCode` (ou null). */
  function lessonCodeOfLearningPoint(lpCode) {
    const m = learningPointPattern.exec(lpCode ?? '');
    return m && lessonByCode.has(m[2]) ? m[2] : null;
  }

  /**
   * « راجع » APRÈS UNE ERREUR (décision D7 du propriétaire, 2026-10-13 : les liens vers
   * les années antérieures vont aussi DANS les exercices). Pour une question, on part
   * de sa الكفاءة principale — sinon de la leçon — et on renvoie les liens « راجع » de
   * sa leçon qui viennent d'une année ANTÉRIEURE : `reviewLinksForLesson` réduit au
   * pas qui change d'année. Rien n'est écrit à la main dans les exercices : le lien
   * se dérive du réseau (LEARNING_NET.md §3). A stub keeps its group `{ lesson: null, noLessonInGrade }`: the item
   * is shown, no link is offered.
   *
   * @returns {Array<{ lesson: {code, grade, title, status} | null, noLessonInGrade?: string,
   *                   items: Array<{id, grade, segment, text, stub, via}> }>}
   */
  function earlierYearReviewFor({ learningPointCode = null, lessonCode = null } = {}) {
    const code = lessonCodeOfLearningPoint(learningPointCode) ?? (lessonByCode.has(lessonCode) ? lessonCode : null);
    if (!code) return [];
    const grade = GRADE_ORDER[lessonByCode.get(code).grade];
    return reviewLinksForLesson(code)
      .map((g) => ({ ...g, items: g.items.filter((i) => GRADE_ORDER[i.grade] < grade) }))
      .filter((g) => g.items.length > 0);
  }

  return {
    GRADES, ITEMS, SEGMENTS, THREADS, LINKS, UNITS, LESSONS, WEIGHTED_GRADES,
    itemRank, getItem, getSegment, getThreadOf, getLesson, isStub, homeLessonOf, lessonsOf, linksInto, linksFrom,
    reviewLinksForLesson, corePrerequisitesOf, coreDependentsOf, toolsForLesson, forwardLinksForLesson,
    noRebuildForLesson, lessonCodeOfLearningPoint, earlierYearReviewFor,
  };
}

// 3e is the only weighted grade: every link into a 3e item carries core / support.
const delivered = createLearningNet({
  programme,
  net,
  lessonFiles: [lessons6e, lessons5e, lessons4e, lessons3e],
  unitFiles: [units6e, units5e, units4e, units3e],
  weightedGrades: ['3e'],
});

export const {
  GRADES, ITEMS, SEGMENTS, THREADS, LINKS, UNITS, LESSONS, WEIGHTED_GRADES,
  itemRank, getItem, getSegment, getThreadOf, getLesson, isStub, homeLessonOf, lessonsOf, linksInto, linksFrom,
  reviewLinksForLesson, corePrerequisitesOf, coreDependentsOf, toolsForLesson, forwardLinksForLesson,
  noRebuildForLesson, lessonCodeOfLearningPoint, earlierYearReviewFor,
} = delivered;
