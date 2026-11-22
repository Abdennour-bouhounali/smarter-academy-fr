import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import programme from './programme_4am_2026_2027.json';
import decomposition from './lessons_4am_2026_2027.json';
import units from './units_4am_2026_2027.json';
import { dzCourseLevels } from '../coursesData.js';

/**
 * La TRAÇABILITÉ du découpage 4AM (phase 7).
 *
 * Ce que ces tests protègent : le programme officiel est la seule autorité sur
 * ce qui doit être enseigné, et le découpage en leçons en dérive. Deux dérives
 * sont possibles, toutes deux silencieuses sans contrôle —
 *
 *   un sujet officiel qui perd sa leçon  → on cesse d'enseigner une partie du
 *                                          programme sans que personne ne le
 *                                          décide ;
 *   une leçon sans sujet officiel        → on enseigne quelque chose que le
 *                                          programme ne demande pas, présenté
 *                                          à l'élève comme s'il le demandait.
 *
 * Les intitulés arabes ne sont JAMAIS recopiés ici : chaque test lit le JSON
 * source et compare. Un test qui retaperait le libellé passerait au vert
 * pendant que le catalogue s'éloignerait du programme.
 */

const officialTopics = programme.domains.flatMap((d) =>
  d.topics.map((t) => ({ ...t, chapterId: d.id }))
);
const dzGrade4am = dzCourseLevels
  .flatMap((l) => l.grades)
  .find((g) => g.id === '4am');
const catalogueLessons = dzGrade4am.chapters.flatMap((c) =>
  c.lessons.map((lesson) => ({ ...lesson, chapterId: c.id }))
);

describe('découpage 4AM — traçabilité sujet ↔ leçon', () => {
  it('ne PUBLIE que les leçons construites, et le dit explicitement', () => {
    // Le catalogue ne liste plus que ce que la plateforme publie (décision du
    // propriétaire, 2026-09-21). Un sujet officiel sans leçon n'est donc plus
    // un oubli : c'est un sujet pas encore construit, et il ne doit
    // apparaître NULLE PART — pas de carte « قريبًا », pas de ligne dans
    // l'arbre de progression, pas de rangée en base.
    //
    // Ce que ce test garde du précédent : la décision doit être ÉCRITE. Sans
    // `publishedScope`, un catalogue amputé serait indiscernable d'un
    // catalogue abîmé.
    expect(decomposition.publishedScope?.rule).toBe('catalogue_lists_built_lessons_only');
    expect(decomposition.publishedScope?.unitIds?.length).toBeGreaterThan(0);

    // Et l'inverse reste vrai : tout ce qui EST publié vient du programme.
    const officialIds = new Set(officialTopics.map((t) => t.id));
    for (const lesson of catalogueLessons) {
      expect(officialIds.has(lesson.sourceTopicId), lesson.id).toBe(true);
    }
  });

  it('chaque leçon publiée appartient à une unité déclarée dans la portée', () => {
    // Aujourd'hui : l'unité 1 seulement. Si une leçon publiée sortait de la
    // portée déclarée, la page du ميدان la montrerait hors de toute unité —
    // exactement la carte orpheline qu'on vient de retirer.
    const scope = new Set(decomposition.publishedScope.unitIds);
    for (const lesson of decomposition.lessons) {
      expect(lesson.unitId, lesson.code).toBeTruthy();
      expect(scope.has(lesson.unitId), lesson.code).toBe(true);
      expect(lesson.status, lesson.code).toBe('available');
    }
  });

  it('chaque leçon vient d’exactement un sujet officiel', () => {
    const officialIds = new Set(officialTopics.map((t) => t.id));
    for (const lesson of catalogueLessons) {
      expect(lesson.sourceTopicId, lesson.id).toBeTruthy();
      expect(officialIds.has(lesson.sourceTopicId), `${lesson.id} → ${lesson.sourceTopicId}`).toBe(true);
    }
  });

  it('chaque leçon est rattachée au chapitre de son sujet', () => {
    const chapterOf = new Map(officialTopics.map((t) => [t.id, t.chapterId]));
    // Seule exception admise : une unité du manuel que le PROPRIÉTAIRE place
    // sous un autre ميدان que celui du programme, et qui le DÉCLARE
    // (`placement`) en nommant le domaine du programme. L'écart est donc
    // visible et vérifié, jamais silencieux (unité 3 « الحساب الحرفي »).
    const placed = new Map(units.units.filter((u) => u.placement?.decidedBy === 'owner').map((u) => [u.code, u]));
    for (const lesson of catalogueLessons) {
      const unit = placed.get(lesson.unitId);
      if (unit) {
        expect(chapterOf.get(lesson.sourceTopicId), lesson.id).toBe(unit.placement.programmeDomainId);
        expect(lesson.chapterId, lesson.id).toBe(unit.chapterId);
        continue;
      }
      expect(lesson.chapterId, lesson.id).toBe(chapterOf.get(lesson.sourceTopicId));
    }
  });

  it('un ميدان d’affichage du propriétaire est déclaré, sans sujet, et seulement pour des unités placées', () => {
    // Unité 6 (2026-10-02) : « ميدان التناسبية والدوال » n'est pas un domaine du programme.
    // Il vit dans units_4am › ownerChapters, n'ajoute AUCUN sujet officiel, et toute unité
    // qui s'y range déclare le domaine de programme de son sujet (`placement`).
    const programmeIds = new Set(programme.domains.map((d) => d.id));
    const owner = units.ownerChapters ?? [];
    for (const c of owner) {
      expect(programmeIds.has(c.id), c.id).toBe(false);
      expect(c.decidedBy, c.id).toBe('owner');
      expect(c.decidedOn, c.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const chapter = dzGrade4am.chapters.find((ch) => ch.id === c.id);
      if (chapter) expect(chapter.topics, c.id).toEqual([]);
    }
    const ownerIds = new Set(owner.map((c) => c.id));
    for (const unit of units.units.filter((u) => ownerIds.has(u.chapterId))) {
      expect(unit.placement?.decidedBy, unit.code).toBe('owner');
      expect(programmeIds.has(unit.placement.programmeDomainId), unit.code).toBe(true);
    }
  });

  it('applique la règle arrêtée : un sujet = une leçon, SAUF dans une unité du manuel', () => {
    expect(decomposition.decompositionRule).toBe('one_lesson_per_official_topic_unless_textbook_unit');
    const topicsInUnits = new Set(units.units.flatMap((u) => u.sourceTopicIds));
    const perTopic = new Map();
    for (const lesson of catalogueLessons.filter((l) => !l.unitId)) {
      perTopic.set(lesson.sourceTopicId, (perTopic.get(lesson.sourceTopicId) ?? 0) + 1);
    }
    for (const [topicId, count] of perTopic) {
      expect(count, topicId).toBe(1);
    }
    // Un sujet couvert par une unité peut avoir plusieurs leçons. Un sujet
    // PUBLIÉ hors unité en aurait exactement une — il n'y en a plus aucun
    // aujourd'hui, la règle reste écrite pour le jour où l'on en republiera.
    // Un sujet non publié n'a aucune leçon, et c'est voulu (voir ci-dessus).
    for (const topic of officialTopics) {
      const n = catalogueLessons.filter((l) => l.sourceTopicId === topic.id).length;
      if (topicsInUnits.has(topic.id)) expect(n, topic.id).toBeGreaterThanOrEqual(1);
      else expect(n, topic.id).toBeLessThanOrEqual(1);
    }
  });

  it('porte le titre officiel du sujet, au mot près, quand la leçon EST le sujet', () => {
    const titleOf = new Map(officialTopics.map((t) => [t.id, t.titleAr]));
    for (const lesson of catalogueLessons) {
      expect(lesson.officialTopicTitle, lesson.id).toBe(titleOf.get(lesson.sourceTopicId));
      if (lesson.titleSource === 'official_topic') {
        expect(lesson.title, lesson.id).toBe(titleOf.get(lesson.sourceTopicId));
      }
    }
  });

  it('rattache chaque leçon du manuel à une unité qui couvre son sujet officiel', () => {
    const unitById = new Map(units.units.map((u) => [u.code, u]));
    for (const lesson of catalogueLessons.filter((l) => l.unitId)) {
      const unit = unitById.get(lesson.unitId);
      expect(unit, `${lesson.id} → ${lesson.unitId}`).toBeTruthy();
      expect(unit.chapterId, lesson.id).toBe(lesson.chapterId);
      expect(unit.sourceTopicIds, `${lesson.id} : sujet ${lesson.sourceTopicId} hors de l'unité`).toContain(lesson.sourceTopicId);
      expect(lesson.titleSource, lesson.id).toBe('textbook');
    }
    // Une unité a au plus UNE synthèse, et elle est déclarée par l'unité.
    for (const unit of units.units) {
      const syntheses = catalogueLessons.filter((l) => l.unitId === unit.code && l.kind === 'synthesis');
      expect(syntheses.length, unit.code).toBeLessThanOrEqual(1);
      if (syntheses.length) expect(syntheses[0].id).toBe(unit.synthesisLessonCode);
    }
  });

  it('déclare la provenance de chaque leçon de façon lisible par machine', () => {
    for (const lesson of catalogueLessons) {
      if (lesson.unitId) {
        expect(['textbook_lesson', 'textbook_synthesis'], lesson.id).toContain(lesson.decompositionType);
        expect(lesson.decisionStatus, lesson.id).toBe('textbook_derived');
        expect(lesson.kind, lesson.id).toBe(lesson.decompositionType === 'textbook_synthesis' ? 'synthesis' : 'lesson');
      } else {
        expect(lesson.decompositionType, lesson.id).toBe('single_topic');
        expect(lesson.decisionStatus, lesson.id).toBe('owner_supplied');
      }
    }
  });

  it('ne déclare que des prérequis pédagogiques qui existent, et jamais circulaires', () => {
    // Une leçon prérequise peut être d'une année ANTÉRIEURE (LEARNING_NET.md §3bis) : on cherche dans tout le cycle.
    const allLessons = dzCourseLevels.flatMap((l) => l.grades).flatMap((g) => g.chapters.flatMap((c) => c.lessons));
    const codes = new Set(allLessons.map((l) => l.id));
    // Une الكفاءة d'une année ANTÉRIEURE est admise (LEARNING_NET.md §4.8), mais seulement
    // si sa leçon est PUBLIÉE : on n'écrit jamais d'arête vers une الكفاءة brouillon.
    const lpIds = new Set(allLessons
      .filter((l) => l.status === 'available')
      .flatMap((l) => l.learningPoints.map((lp) => lp.id)));
    const byId = new Map(allLessons.map((l) => [l.id, l]));
    const visiting = new Set();
    const visit = (id, trail) => {
      expect(visiting.has(id), `cycle : ${[...trail, id].join(' → ')}`).toBe(false);
      visiting.add(id);
      for (const pre of byId.get(id).prerequisiteLessonCodes) {
        expect(codes.has(pre), `${id} → ${pre}`).toBe(true);
        visit(pre, [...trail, id]);
      }
      visiting.delete(id);
    };
    for (const lesson of catalogueLessons) {
      visit(lesson.id, []);
      for (const lp of lesson.learningPoints) {
        for (const pre of lp.prerequisites) {
          expect(lpIds.has(pre.id), `${lp.id} → ${pre.id}`).toBe(true);
          expect(pre.id, lp.id).not.toBe(lp.id);
          expect(pre.requiredMastery).toBeGreaterThan(0);
          expect(pre.requiredMastery).toBeLessThanOrEqual(1);
        }
      }
    }
  });
});

describe('découpage 4AM — intégrité des leçons', () => {
  it('donne à chaque leçon un code unique', () => {
    const codes = catalogueLessons.map((l) => l.id);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('donne à chaque leçon les champs dont le catalogue a besoin pour s’afficher', () => {
    for (const lesson of catalogueLessons) {
      // `Courses.jsx` et `LessonCard` déréférencent ces champs sans garde :
      // un null ici est un écran blanc, pas un affichage dégradé.
      expect(typeof lesson.title, lesson.id).toBe('string');
      expect(typeof lesson.description, lesson.id).toBe('string');
      expect(typeof lesson.path, lesson.id).toBe('string');
      expect(lesson.description.length, lesson.id).toBeGreaterThan(0);
      expect(Array.isArray(lesson.prerequisites), lesson.id).toBe(true);
    }
  });

  it('construit le chemin sous le niveau et la classe qui la portent', () => {
    for (const lesson of catalogueLessons) {
      expect(lesson.path, lesson.id).toBe(
        `/courses/moyen/4am/${lesson.chapterId}/${lesson.id}`
      );
    }
  });

  it("n'ouvre à l'élève que les leçons réellement écrites sur le disque", () => {
    // La règle que la phase 7 exprimait par « tout est coming_soon » : une
    // leçon ne passe à `available` QUE si son implémentation existe. Elle
    // est ici vérifiée sur le disque plutôt que figée à « aucune », pour
    // qu'écrire une leçon reste possible sans affaiblir la garde — et pour
    // qu'un `available` posé par erreur sur une leçon non écrite échoue.
    const lessonsDir = new URL(
      '../../../../apps/web/src/lessons/moyen/4am/',
      import.meta.url
    );

    for (const lesson of catalogueLessons) {
      // Une leçon d'unité vit sous le dossier de son unité.
      const configPath = new URL(
        lesson.unitId
          ? `${lesson.chapterId}/${lesson.unitId}/${lesson.id}/lesson.config.js`
          : `${lesson.chapterId}/${lesson.id}/lesson.config.js`,
        lessonsDir
      );
      const built = existsSync(configPath);

      expect(
        lesson.status,
        `${lesson.id} : statut « ${lesson.status} » alors que lesson.config.js ${built ? 'existe' : "n'existe pas"}`
      ).toBe(built ? 'available' : 'coming_soon');
    }
  });
});

describe('découpage 4AM — points d’apprentissage', () => {
  const allLps = catalogueLessons.flatMap((l) =>
    l.learningPoints.map((lp) => ({ ...lp, lessonId: l.id }))
  );

  it('rattache chaque point à exactement une leçon, avec un identifiant stable', () => {
    for (const lesson of catalogueLessons) {
      lesson.learningPoints.forEach((lp, i) => {
        expect(lp.id, `${lesson.id}/${i}`).toBe(`4am_${lesson.id}_P${i + 1}`);
        expect(lp.order).toBe(i + 1);
      });
    }
  });

  it('ne donne jamais le même identifiant à deux points', () => {
    const ids = allLps.map((lp) => lp.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('donne à chaque leçon au moins un point d’apprentissage', () => {
    // Une leçon sans point n'est évaluable par rien : ni progression, ni
    // carte des connaissances, ni évaluation finale ne peuvent s'y accrocher.
    for (const lesson of catalogueLessons) {
      expect(lesson.learningPoints.length, lesson.id).toBeGreaterThan(0);
    }
  });

  it('reprend les intitulés fournis, sans en réécrire aucun', () => {
    const supplied = new Map(decomposition.lessons.map((l) => [l.code, l.pointsToLearn]));
    for (const lesson of catalogueLessons) {
      expect(lesson.learningPoints.map((lp) => lp.title), lesson.id).toEqual(supplied.get(lesson.id));
    }
  });

  it('ne duplique aucun intitulé à l’intérieur d’une même leçon', () => {
    for (const lesson of catalogueLessons) {
      const titles = lesson.learningPoints.map((lp) => lp.title);
      expect(new Set(titles).size, lesson.id).toBe(titles.length);
    }
  });
});

describe('découpage 4AM — périmètre', () => {
  it('ne fait entrer aucune leçon française dans le catalogue algérien', () => {
    // Le catalogue français a été supprimé (2026-09-25) : une leçon française
    // se reconnaît désormais à son chemin, hors du niveau « moyen » algérien.
    for (const lesson of catalogueLessons) {
      expect(lesson.path, lesson.id).not.toMatch(/^\/courses\/(college|lycee)\//);
    }
  });

  it('laisse la terminale sans contenu inventé', () => {
    // Aucun programme n'a été fourni pour cette classe. Elle garde son
    // identité et son état explicite, et rien d'autre.
    const terminale = dzCourseLevels
      .flatMap((l) => l.grades)
      .find((g) => g.id === 'terminale_dz');
    expect(terminale.chapters).toEqual([]);
    expect(terminale.curriculumStatus).toBe('not_supplied');
  });

  it('dit que la 4AM a un découpage, pas encore des cours', () => {
    expect(dzGrade4am.curriculumStatus).toBe('lessons_planned');
  });
});
