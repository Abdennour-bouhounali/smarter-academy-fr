// SURFACE DE QA — pas une leçon, et délibérément hors de src/lessons/.
//
// ── Pourquoi ce fichier existe ──────────────────────────────────────────
// La reprise précédente a laissé une vérification en suspens (rapport de
// reprise §17, §18 risque 1) : le moteur de leçon n'a JAMAIS été rendu sous
// RTL, parce qu'aucune leçon n'est montée — les 132 leçons françaises sont
// dormantes, et aucune leçon algérienne n'existe encore. La carte des
// connaissances, les mathématiques LTR et la mise en page des modules
// n'avaient donc été éprouvées que par une sonde temporaire, supprimée après
// usage.
//
// Cette surface monte les VRAIS composants du moteur — ContentModule,
// ModuleLayout, LessonIndex, la carte des connaissances, MathText, CoordPlane
// — avec du contenu arabe, pour qu'on puisse enfin regarder ce que le moteur
// fait en arabe. Ce qu'elle éprouve est le MOTEUR, jamais la pédagogie.
//
// ── Ce qu'elle n'est PAS ────────────────────────────────────────────────
//   — Ce n'est pas une leçon du programme : aucun contenu 4AM, aucun point
//     d'apprentissage, rien qui prétende enseigner quoi que ce soit. Les
//     mathématiques montrées (une fraction, une équation, une droite) sont
//     des ILLUSTRATIONS génériques, choisies pour exercer le rendu.
//   — Ce n'est pas dans src/lessons/ : le glob de registry.js, check-routes,
//     validate-lessons et check-dormant-isolation n'y voient donc rien, et
//     elle n'apparaît dans aucun catalogue.
//   — Ce n'est pas servi en production : App.jsx ne la monte que sous
//     `import.meta.env.DEV` ou `VITE_QA_FIXTURES=true` (voir le test
//     d'isolement qui le vérifie sur le lot construit).
//
// Elle disparaîtra d'elle-même quand la première vraie leçon 4AM existera :
// c'est ELLE qui deviendra alors la surface de QA, et celle-ci pourra être
// supprimée.

export const FIXTURE_BASE_PATH = '/__qa/rtl-lesson';

export const FIXTURE_CONFIG = {
  id: 'qa-rtl-fixture',
  // La carte des connaissances est active : c'est l'une des surfaces qu'on
  // vient précisément regarder sous RTL (elle se dockait au bord physique
  // droit avant la correction de la reprise).
  knowledgeMap: true,
  sequentialUnlock: false,
  title: 'واجهة اختبار العرض من اليمين إلى اليسار',
  description: 'سطح تقني للتحقق من محرّك الدروس بالعربية. ليس درسًا من البرنامج.',
  level: 'qa',
  grade: 'qa',
  chapter: 'qa',
  chapterTitle: 'اختبار تقني',
  emoji: '🧭',
  estimatedDurationMin: 9,
  modules: [
    {
      id: '01',
      number: 1,
      slug: 'nass-wa-riyadiyat',
      path: `${FIXTURE_BASE_PATH}/nass-wa-riyadiyat`,
      title: 'نص ورياضيات',
      desc: 'فقرة عربية تتضمّن تعابير رياضية داخلية وكتلية.',
      stage: 'trigger',
      color: 'indigo',
      estimatedMin: 3,
      actionText: 'ابدأ',
    },
    {
      id: '02',
      number: 2,
      slug: 'rusum-wa-jadawil',
      path: `${FIXTURE_BASE_PATH}/rusum-wa-jadawil`,
      title: 'رسوم وجداول',
      desc: 'معلم، مستقيم مدرّج وجدول قيم داخل صفحة عربية.',
      stage: 'discovery',
      color: 'emerald',
      estimatedMin: 3,
      actionText: 'تابع',
    },
    {
      id: '03',
      number: 3,
      slug: 'asila-wa-taqaddum',
      path: `${FIXTURE_BASE_PATH}/asila-wa-taqaddum`,
      title: 'أسئلة وتقدّم',
      desc: 'أسئلة المحرّك، التغذية الراجعة وشريط التقدّم.',
      stage: 'practice_lab',
      color: 'amber',
      estimatedMin: 3,
      actionText: 'أنهِ',
    },
  ],
};

/** Le contexte qu'un module réel reçoit — même forme que moduleContext.js. */
export const FIXTURE_CTX = {
  lessonId: FIXTURE_CONFIG.id,
  coursePath: FIXTURE_BASE_PATH,
  courseTitle: FIXTURE_CONFIG.title,
  chapter: FIXTURE_CONFIG.chapter,
  chapterTitle: FIXTURE_CONFIG.chapterTitle,
  levelLabel: 'اختبار',
  gradeLabel: 'تقني',
  totalModules: FIXTURE_CONFIG.modules.length,
  lastModuleNumber: FIXTURE_CONFIG.modules[FIXTURE_CONFIG.modules.length - 1].number,
  sequentialUnlock: FIXTURE_CONFIG.sequentialUnlock,
};

/** Les liens précédent/suivant, comme les calcule getNavLinks d'une leçon. */
export function getFixtureNavLinks(currentModuleNumber) {
  const index = FIXTURE_CONFIG.modules.findIndex((m) => m.number === currentModuleNumber);
  const previous = FIXTURE_CONFIG.modules[index - 1];
  const next = FIXTURE_CONFIG.modules[index + 1];

  return {
    prevLink: previous ? { to: previous.path, label: previous.title } : null,
    nextLink: next ? { to: next.path, label: next.title } : null,
  };
}
