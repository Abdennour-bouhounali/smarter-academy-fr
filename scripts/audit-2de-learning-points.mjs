#!/usr/bin/env node
// Learning-Point coverage extractor for one grade (Seconde by default).
//
// WHAT THIS DOES: it reports, for every lesson of the grade, what the SOURCE
// verifiably contains — which module declares teaching each Learning Point,
// which boss question measures it, which manipulation the student drives,
// which knowledge bricks are posted and in what order, and where the declared
// durations disagree.
//
// WHAT THIS DOES NOT DO: decide whether a Learning Point is actually LEARNABLE
// from the lesson. That judgement is human (docs/audits/judgements/<id>.json)
// and this script only reads, validates and merges it — re-running never
// overwrites a judgement. See docs/audits/2DE_LEARNING_POINT_AUDIT.md.
//
//   node scripts/audit-2de-learning-points.mjs [--grade seconde] [--lesson id]
//        [--md] [--inject <audit.md>] [--smoke <file>]… [--strict]

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import {
  repoRoot, lessonsRoot, findLessonDirs, gradeOf, listSourceFiles, moduleOfFile,
  buildLessonIndex, parseLessonConfig, parseFile, traverse, literalValue, propOf,
} from './lib/lessonAst.mjs';
import { readKnowledge } from './lib/knowledgeData.mjs';
import { readModuleFacts } from './lib/moduleFacts.mjs';
import { extractAssessmentQuestions } from './lib/assessmentQuestions.mjs';

const argv = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback;
};
const has = (name) => argv.includes(`--${name}`);
const multi = (name) => argv.reduce((acc, a, i) => (a === `--${name}` && argv[i + 1] ? [...acc, argv[i + 1]] : acc), []);

const GRADE = flag('grade', 'seconde');
const ONLY = flag('lesson');
const STRICT = has('strict');
const OUT_JSON = flag('json', `docs/audits/${GRADE === 'seconde' ? '2de' : GRADE}-lp-matrix.json`);
const OUT_MD = flag('md-file', `docs/audits/${GRADE === 'seconde' ? '2de' : GRADE}-lp-matrix.generated.md`);
const JUDGE_DIR = flag('judgements', 'docs/audits/judgements');
const RECON_FILE = flag('reconciliation', 'docs/audits/2de-reconciliation.json');
const EXTERNAL_FILE = flag('external', 'docs/audits/2de-external-lps.json');
const INJECT = flag('inject');
const SMOKE_FILES = multi('smoke');

const abs = (p) => (p.startsWith('/') ? p : join(repoRoot, p));
const readJson = (p) => {
  if (!existsSync(abs(p))) return null;
  try { return JSON.parse(readFileSync(abs(p), 'utf-8')); }
  catch (e) { console.error(`⚠️  ${p} n'est pas du JSON valide — ${e.message}`); return null; }
};

// ── App wiring: which lesson route files App.jsx actually imports ────────────
const appSource = readFileSync(join(repoRoot, 'apps/web/src/App.jsx'), 'utf-8');

/** `LessonKnowledgeProvider` imported from common/knowledge AND rendered. */
function readRoutes(lessonDir) {
  const file = join(lessonDir, 'routes.jsx');
  if (!existsSync(file)) return { file: null, providerImported: false, providerMounted: false, basePath: null };
  const source = readFileSync(file, 'utf-8');
  const ast = parseFile(file);
  let providerImported = false;
  let shared = false;
  let providerMounted = false;
  traverse(ast, {
    ImportDeclaration(path) {
      const src = path.node.source.value;
      if (!/knowledge$/.test(String(src))) return;
      for (const spec of path.node.specifiers) {
        if (/KnowledgeProvider$/.test(spec.local.name)) {
          providerImported = true;
          if (/common\/knowledge$/.test(String(src))) shared = true;
        }
      }
    },
    JSXOpeningElement(path) {
      const n = path.node.name;
      if (n.type === 'JSXIdentifier' && /KnowledgeProvider$/.test(n.name)) providerMounted = true;
    },
  });
  const basePath = source.match(/LESSON_BASE_PATH\s*=\s*['"]([^'"]+)['"]/)?.[1] ?? null;
  return { file: relative(repoRoot, file), providerImported, providerFromShared: shared, providerMounted, basePath };
}

/** `components/learningPoints.js` — the per-LP remediation pointer. */
function readLearningPointsMirror(lessonDir) {
  const file = join(lessonDir, 'components/learningPoints.js');
  if (!existsSync(file)) return null;
  const ast = parseFile(file);
  const out = [];
  traverse(ast, {
    VariableDeclarator(path) {
      if (path.node.id.name !== 'LESSON_LEARNING_POINTS' || path.node.init?.type !== 'ArrayExpression') return;
      for (const el of path.node.init.elements) {
        if (el?.type !== 'ObjectExpression') continue;
        out.push({
          code: literalValue(propOf(el, 'code')),
          title: literalValue(propOf(el, 'title')),
          recommendedSlug: literalValue(propOf(el, 'recommendedSlug')),
        });
      }
    },
  });
  return out;
}

const SPEC_DIR = join(repoRoot, 'docs/lessons');
const E2E_DIR = join(repoRoot, 'apps/web/e2e/lesson-kit');
const specFiles = existsSync(SPEC_DIR) ? readdirSync(SPEC_DIR).filter((f) => f.endsWith('.md')) : [];
const e2eFiles = existsSync(E2E_DIR) ? readdirSync(E2E_DIR).filter((f) => f.endsWith('.mjs')) : [];
const findByMention = (dir, files, id) => files.filter((f) => readFileSync(join(dir, f), 'utf-8').includes(id))
  .map((f) => relative(repoRoot, join(dir, f)));

// ── Build the matrix ────────────────────────────────────────────────────────
const lessonIndex = buildLessonIndex();
const lessons = [];
const integrity = [];

for (const lessonDir of findLessonDirs(lessonsRoot)) {
  if (gradeOf(lessonDir) !== GRADE) continue;
  const config = parseLessonConfig(lessonDir);
  if (!config.id || (ONLY && config.id !== ONLY)) continue;

  const rel = relative(repoRoot, lessonDir);
  const catalogue = lessonIndex.get(`${GRADE}:${config.id}`) ?? null;
  const knowledge = readKnowledge(lessonDir);
  const routes = readRoutes(lessonDir);
  const mirror = readLearningPointsMirror(lessonDir);

  const moduleFiles = listSourceFiles(join(lessonDir, 'modules'));
  const modules = [];
  const assessment = { module: null, questions: [] };

  for (const m of config.modules ?? []) {
    const file = moduleFiles.find((f) => moduleOfFile(lessonDir, config.modules, f)?.number === m.number);
    if (!file) { integrity.push({ lesson: config.id, error: `module ${m.number} (${m.slug}) has no source file` }); continue; }
    const facts = readModuleFacts(file, m, knowledge.items);
    const questions = extractAssessmentQuestions(file);
    if (questions.length) {
      assessment.module = m.number;
      assessment.questions.push(...questions.map((q) => ({ ...q, file: relative(repoRoot, q.file), module: m.number })));
    }
    modules.push({
      number: m.number, slug: m.slug, title: m.title ?? null, stage: m.stage,
      estimatedMin: m.estimatedMin, estimatedTimeLabel: facts.estimatedTimeLabel,
      teaches: Array.isArray(m.teachesLearningPointIds) ? m.teachesLearningPointIds : [],
      requiresLearningPointIds: Array.isArray(m.requiresLearningPointIds) ? m.requiresLearningPointIds : [],
      knowledgeItems: (knowledge.byModule.get(m.number) ?? []).map((i) => i.id),
      ...facts,
    });
  }

  const moduleSum = (config.modules ?? []).reduce((n, m) => n + (typeof m.estimatedMin === 'number' ? m.estimatedMin : 0), 0);
  const duration = {
    catalogue: catalogue?.durationMinutes ?? null,
    config: config.estimatedDurationMin,
    moduleSum,
    // The module sum is the truth: it is what the student actually meets.
    drift: [catalogue?.durationMinutes, config.estimatedDurationMin].some((v) => typeof v === 'number' && v !== moduleSum),
  };

  // Per-LP mechanical facts.
  const judgeFile = join(abs(JUDGE_DIR), `${config.id}.json`);
  let judgement = null;
  if (existsSync(judgeFile)) {
    // A malformed judgement must name itself: these files are hand/agent
    // written, and a bare "position 26853" tells nobody which one to open.
    try { judgement = JSON.parse(readFileSync(judgeFile, 'utf-8')); }
    catch (e) { integrity.push({ lesson: config.id, error: `${relative(repoRoot, judgeFile)} n'est pas du JSON valide — ${e.message}` }); }
  }
  const moduleNumbers = new Set(modules.map((m) => m.number));
  const questionIds = new Set(assessment.questions.map((q) => q.id));

  const learningPoints = (catalogue?.learningPoints ?? []).map((lp) => {
    const taughtBy = modules.filter((m) => m.teaches.includes(lp.id)).map((m) => m.number);
    const mirrorEntry = mirror?.find((e) => e.code === lp.id) ?? null;
    const recommendedModule = mirrorEntry?.recommendedSlug
      ? modules.find((m) => m.slug === mirrorEntry.recommendedSlug)?.number ?? null : null;
    const j = judgement?.learningPoints?.[lp.id] ?? null;
    if (j) {
      for (const e of j.evidence ?? []) {
        if (e.module != null && !moduleNumbers.has(e.module)) integrity.push({ lesson: config.id, error: `judgement ${lp.id}: unknown module ${e.module}` });
        const slugOf = modules.find((m) => m.number === e.module)?.slug;
        if (e.moduleSlug && slugOf && e.moduleSlug !== slugOf) integrity.push({ lesson: config.id, error: `judgement ${lp.id}: module ${e.module} is '${slugOf}', judgement says '${e.moduleSlug}'` });
      }
      for (const q of j.assessmentQuestionIds ?? []) {
        if (!questionIds.has(q)) integrity.push({ lesson: config.id, error: `judgement ${lp.id}: unknown question id '${q}'` });
      }
    }
    return {
      id: lp.id, order: lp.order, title: lp.title,
      taughtBy,
      recommendedModule,
      recommendedNotInTeaches: recommendedModule != null && !taughtBy.includes(recommendedModule),
      assessmentQuestionIds: assessment.questions.filter((q) => q.learningPointIds.includes(lp.id)).map((q) => q.id),
      knowledgeItemsInTeachingModules: modules.filter((m) => taughtBy.includes(m.number)).flatMap((m) => m.knowledgeItems),
      manipulationsInTeachingModules: [...new Set(modules.filter((m) => taughtBy.includes(m.number)).flatMap((m) => m.manipulations.map((x) => x.name)))],
      judgement: j ? { ...j } : { status: 'UNJUDGED' },
    };
  });
  if (judgement) {
    const known = new Set(learningPoints.map((lp) => lp.id));
    for (const id of Object.keys(judgement.learningPoints ?? {})) {
      if (!known.has(id)) integrity.push({ lesson: config.id, error: `judgement names unknown learning point '${id}'` });
    }
  }

  const flags = [];
  if (duration.drift) flags.push('DURATION_DRIFT');
  if (!routes.providerMounted) flags.push('PROVIDER_NOT_MOUNTED');
  if (!routes.providerFromShared && routes.providerImported) flags.push('PROVIDER_LOCAL_COPY');
  if (!appSource.includes(`${relative(join(repoRoot, 'apps/web/src'), lessonDir)}/routes`)) flags.push('APP_WIRING_UNVERIFIED');
  if (!findByMention(SPEC_DIR, specFiles, config.id).length) flags.push('NO_SPEC');
  if (!findByMention(E2E_DIR, e2eFiles, config.id).length) flags.push('NO_E2E');
  if (modules.some((m) => m.stepsShape === 'unparseable')) flags.push('UNPARSEABLE_STEPS');
  if (modules.some((m) => m.stepsShape === 'mapped')) flags.push('MAPPED_STEPS');
  if (modules.some((m) => m.requires.invalid)) flags.push('REQUIRES_NOT_LITERAL');
  if (modules.some((m) => m.missingKitImports?.length)) flags.push('MISSING_KIT_IMPORT');
  if (modules.some((m) => m.bricks.some((b) => b.itemMissing))) flags.push('BRICK_WITHOUT_ITEM');
  if (learningPoints.some((lp) => !lp.taughtBy.length)) flags.push('LP_NOT_TAUGHT');
  if (learningPoints.some((lp) => !lp.assessmentQuestionIds.length)) flags.push('LP_NOT_ASSESSED');
  if (learningPoints.some((lp) => lp.recommendedNotInTeaches)) flags.push('RECOMMENDED_NOT_IN_TEACHES');
  if (!mirror) flags.push('NO_LEARNING_POINTS_MIRROR');

  lessons.push({
    id: config.id, title: config.title ?? catalogue?.title ?? null,
    catalogueKey: catalogue ? `${GRADE}_${catalogue.officialObject}` : null,
    officialObject: catalogue?.officialObject ?? null,
    domain: catalogue?.chapterId ?? relative(join(lessonsRoot, 'lycee', GRADE), lessonDir).split('/')[0],
    status: catalogue?.status ?? null,
    dir: rel, duration, knowledgeMap: config.knowledgeMap,
    priorKnowledge: config.priorKnowledge ?? [],
    routes, mirror: !!mirror,
    knowledge: { file: knowledge.file ? relative(repoRoot, knowledge.file) : null, items: knowledge.items.size, problems: knowledge.problems },
    snapshotCount: modules.reduce((n, m) => n + (m.questionCounts.jsxStatic.KnowledgeSnapshot ?? 0), 0),
    brickCount: modules.reduce((n, m) => n + m.bricks.length, 0),
    requiresCount: modules.reduce((n, m) => n + m.requires.count, 0),
    specDocs: findByMention(SPEC_DIR, specFiles, config.id),
    e2eSuites: findByMention(E2E_DIR, e2eFiles, config.id),
    modules, assessment, learningPoints, flags,
  });
}

lessons.sort((a, b) => (a.domain ?? '').localeCompare(b.domain ?? '') || a.id.localeCompare(b.id));

// Catalogue lessons of this grade with no implementation on disk.
const built = new Set(lessons.map((l) => l.id));
const unbuilt = [...lessonIndex.entries()]
  .filter(([k]) => k.startsWith(`${GRADE}:`))
  .map(([k, v]) => ({ id: k.slice(GRADE.length + 1), ...v }))
  .filter((l) => !built.has(l.id))
  .map((l) => ({ id: l.id, title: l.title, status: l.status, domain: l.chapterId, officialObject: l.officialObject, learningPoints: l.learningPoints.length }));

// ── Smoke merge ─────────────────────────────────────────────────────────────
let smoke = null;
for (const f of SMOKE_FILES) {
  const data = readJson(f);
  if (!data) { integrity.push({ lesson: '-', error: `smoke file not found: ${f}` }); continue; }
  smoke = smoke ?? { files: [], lessons: {} };
  smoke.files.push(f);
  for (const l of data.lessons ?? []) {
    const prev = smoke.lessons[l.id] ?? { pages: 0, failures: [] };
    smoke.lessons[l.id] = {
      pages: prev.pages + l.pages.length,
      failures: [...prev.failures, ...l.pages.filter((p) => !p.ok).map((p) => `${p.viewport} ${p.path}: ${p.why ?? ''}`)],
    };
  }
}
if (smoke) for (const l of lessons) l.smoke = smoke.lessons[l.id] ?? { pages: 0, failures: ['NOT SMOKED'] };

const external = readJson(EXTERNAL_FILE);
const reconciliation = readJson(RECON_FILE);

const matrix = {
  generatedAt: new Date().toISOString(),
  generator: 'scripts/audit-2de-learning-points.mjs',
  grade: GRADE,
  counts: {
    lessons: lessons.length,
    unbuiltCatalogueLessons: unbuilt.length,
    learningPoints: lessons.reduce((n, l) => n + l.learningPoints.length, 0),
    judged: lessons.reduce((n, l) => n + l.learningPoints.filter((lp) => lp.judgement.status !== 'UNJUDGED').length, 0),
    bricks: lessons.reduce((n, l) => n + l.brickCount, 0),
    assessmentQuestions: lessons.reduce((n, l) => n + l.assessment.questions.length, 0),
    externalLearningPoints: external?.length ?? 0,
    reconciled: reconciliation?.length ?? 0,
  },
  lessons, unbuilt, integrity,
  smokeFiles: SMOKE_FILES,
};

mkdirSync(abs('docs/audits'), { recursive: true });
writeFileSync(abs(OUT_JSON), `${JSON.stringify(matrix, null, 2)}\n`);
console.log(`${OUT_JSON} — ${matrix.counts.lessons} leçons, ${matrix.counts.learningPoints} LP (${matrix.counts.judged} jugés), ${matrix.counts.assessmentQuestions} questions d'évaluation`);

// ── Markdown rendering ──────────────────────────────────────────────────────
const STATUS_ORDER = ['COVERED', 'PARTIALLY_COVERED', 'MENTIONED_ONLY', 'EXERCISED_ONLY', 'MANIPULATION_ONLY', 'ASSESSMENT_ONLY', 'MISSING', 'DUPLICATED', 'MISALIGNED', 'UNJUDGED'];
const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const trunc = (s, n) => (String(s ?? '').length > n ? `${String(s).slice(0, n - 1)}…` : String(s ?? ''));

const blocks = {};

blocks['status-counts'] = () => {
  const tally = new Map(STATUS_ORDER.map((s) => [s, 0]));
  for (const l of lessons) for (const lp of l.learningPoints) tally.set(lp.judgement.status, (tally.get(lp.judgement.status) ?? 0) + 1);
  const total = matrix.counts.learningPoints;
  return ['| Statut | LP | Part |', '| --- | ---: | ---: |',
    ...STATUS_ORDER.filter((s) => tally.get(s)).map((s) => `| \`${s}\` | ${tally.get(s)} | ${((tally.get(s) / total) * 100).toFixed(1)} % |`),
    `| **Total** | **${total}** | 100 % |`].join('\n');
};

blocks['lesson-inventory'] = () => [
  '| Leçon | Domaine | Statut | Durée cat./config/somme | Modules | LP | Briques | requires | Snapshots | Carte | Spec | e2e | Signalements |',
  '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | :-: | :-: | :-: | --- |',
  ...lessons.map((l) => `| \`${l.id}\` | ${l.domain} | ${l.status} | ${l.duration.catalogue ?? '—'} / ${l.duration.config ?? '—'} / ${l.duration.moduleSum}${l.duration.drift ? ' ⚠️' : ''} | ${l.modules.length} | ${l.learningPoints.length} | ${l.brickCount} | ${l.requiresCount} | ${l.snapshotCount} | ${l.routes.providerMounted ? '✅' : '❌'} | ${l.specDocs.length ? '✅' : '❌'} | ${l.e2eSuites.length ? '✅' : '❌'} | ${l.flags.join(', ') || '—'} |`),
  '',
  ...(unbuilt.length ? ['**Au catalogue, sans implémentation :**', '',
    '| Leçon | Domaine | Statut | LP |', '| --- | --- | --- | ---: |',
    ...unbuilt.map((l) => `| \`${l.id}\` | ${l.domain} | ${l.status} | ${l.learningPoints} |`)] : []),
].join('\n');

blocks['lp-inventory'] = () => [
  '| LP | Leçon | Objet officiel | Intitulé |', '| --- | --- | --- | --- |',
  ...lessons.flatMap((l) => l.learningPoints.map((lp) => `| \`${lp.id}\` | \`${l.id}\` | \`${l.officialObject}\` | ${esc(lp.title)} |`)),
].join('\n');

blocks['coverage-matrix'] = () => [
  '| LP | Chapter | Lesson | Module | Status | Evidence | Manipulation | Assessment | Knowledge Map | Progress |',
  '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ...lessons.flatMap((l) => l.learningPoints.map((lp) => {
    const j = lp.judgement;
    const evidence = (j.evidence ?? []).map((e) => `M${e.module}${e.step != null ? `.${e.step}` : ''} ${e.mechanism ?? ''}`.trim()).join(' · ');
    const teaching = lp.taughtBy.map((n) => `M${n}`).join(', ') || '—';
    const km = (j.knowledgeItems ?? lp.knowledgeItemsInTeachingModules).slice(0, 3).map((k) => `\`${k}\``).join(' ');
    return `| \`${lp.id.replace(`${GRADE}_${l.id}_`, '')}\` ${esc(trunc(lp.title, 46))} | ${l.domain} | \`${l.id}\` | ${teaching} | ${j.status} | ${esc(trunc(evidence, 70)) || '—'} | ${esc(trunc(j.manipulation ?? lp.manipulationsInTeachingModules.join(', '), 34)) || '—'} | ${lp.assessmentQuestionIds.map((q) => `\`${q}\``).join(' ') || '❌'} | ${km || '—'} | ${teaching} |`;
  })),
].join('\n');

blocks['technical-flags'] = () => {
  const rows = [];
  for (const l of lessons) {
    if (l.duration.drift) rows.push(`| \`${l.id}\` | DURATION_DRIFT | catalogue ${l.duration.catalogue}, config ${l.duration.config}, somme des modules ${l.duration.moduleSum} |`);
    for (const f of l.flags.filter((x) => x !== 'DURATION_DRIFT')) {
      const detail = f === 'MAPPED_STEPS' ? l.modules.filter((m) => m.stepsShape === 'mapped').map((m) => `M${m.number}`).join(', ')
        : f === 'LP_NOT_ASSESSED' ? l.learningPoints.filter((lp) => !lp.assessmentQuestionIds.length).map((lp) => lp.id.split('_').pop()).join(', ')
        : f === 'LP_NOT_TAUGHT' ? l.learningPoints.filter((lp) => !lp.taughtBy.length).map((lp) => lp.id.split('_').pop()).join(', ')
        : f === 'RECOMMENDED_NOT_IN_TEACHES' ? l.learningPoints.filter((lp) => lp.recommendedNotInTeaches).map((lp) => `${lp.id.split('_').pop()}→M${lp.recommendedModule}`).join(', ')
        : f === 'MISSING_KIT_IMPORT' ? l.modules.filter((m) => m.missingKitImports?.length).map((m) => `M${m.number}: ${m.missingKitImports.join(', ')}`).join(' · ')
        : f === 'NO_SPEC' ? 'aucun docs/lessons/*_SPEC.md'
        : f === 'NO_E2E' ? 'aucune suite apps/web/e2e/lesson-kit/'
        : '';
      rows.push(`| \`${l.id}\` | ${f} | ${esc(detail)} |`);
    }
  }
  return ['| Leçon | Signalement | Détail |', '| --- | --- | --- |', ...rows].join('\n');
};

blocks['smoke-summary'] = () => (smoke
  ? ['| Leçon | Pages ouvertes | Échecs |', '| --- | ---: | --- |',
    ...lessons.map((l) => `| \`${l.id}\` | ${l.smoke?.pages ?? 0} | ${l.smoke?.failures.length ? esc(trunc(l.smoke.failures.join(' · '), 90)) : '—'} |`)].join('\n')
  : '_Fumée navigateur non exécutée pour ce rendu._');

blocks['reconciliation'] = () => {
  if (!external) return '_`docs/audits/2de-external-lps.json` absent : réconciliation non rendue._';
  const byId = new Map((reconciliation ?? []).map((r) => [r.extId, r]));
  return ['| LP externe | Chapitre | Intitulé | Verdict | LP canonique(s) | Extension proposée | Note |',
    '| --- | ---: | --- | --- | --- | --- | --- |',
    ...external.map((e) => {
      const r = byId.get(e.extId);
      return `| \`${e.extId}\` | ${e.chapter} | ${esc(trunc(e.title, 60))} | ${r?.match ?? '—'} | ${(r?.canonical ?? []).map((c) => `\`${c.replace(`${GRADE}_`, '')}\``).join(' ') || '—'} | ${r?.proposedExtension ? `\`${r.proposedExtension}\`` : '—'} | ${esc(trunc(r?.note ?? '', 60))} |`;
    })].join('\n');
};

if (has('md') || flag('md-file')) {
  const body = [
    '# 2de — matrice des Learning Points (généré)', '',
    '> Généré par `scripts/audit-2de-learning-points.mjs` — **Ne pas éditer à la main.**',
    `> ${matrix.counts.lessons} leçons · ${matrix.counts.learningPoints} learning points · ${matrix.counts.bricks} briques · ${matrix.counts.assessmentQuestions} questions d'évaluation.`,
    `> Les statuts proviennent de \`${JUDGE_DIR}/<leçon>.json\` (jugement humain) ; ce script ne les calcule pas.`, '',
    '## Statuts', '', blocks['status-counts'](), '',
    '## Inventaire des leçons', '', blocks['lesson-inventory'](), '',
    '## Matrice de couverture', '', blocks['coverage-matrix'](), '',
    '## Signalements techniques', '', blocks['technical-flags'](), '',
    '## Fumée navigateur', '', blocks['smoke-summary'](), '',
    '## Réconciliation curriculaire', '', blocks['reconciliation'](), '',
    '## Inventaire canonique des LP', '', blocks['lp-inventory'](), '',
  ].join('\n');
  writeFileSync(abs(OUT_MD), `${body}\n`);
  console.log(`${OUT_MD} — rendu`);
}

if (INJECT) {
  const file = abs(INJECT);
  if (!existsSync(file)) { console.error(`--inject: ${INJECT} n'existe pas`); process.exit(1); }
  let doc = readFileSync(file, 'utf-8');
  let injected = 0;
  for (const [name, render] of Object.entries(blocks)) {
    const re = new RegExp(`(<!-- BEGIN GENERATED: ${name} -->)[\\s\\S]*?(<!-- END GENERATED: ${name} -->)`);
    if (!re.test(doc)) continue;
    doc = doc.replace(re, `$1\n${render()}\n$2`);
    injected += 1;
  }
  const declared = [...doc.matchAll(/<!-- BEGIN GENERATED: ([a-z-]+) -->/g)].map((m) => m[1]);
  const unknown = declared.filter((d) => !(d in blocks));
  if (unknown.length) { console.error(`--inject: bloc inconnu ${unknown.join(', ')}`); process.exit(1); }
  writeFileSync(file, doc);
  console.log(`${INJECT} — ${injected}/${declared.length} blocs générés injectés`);
}

if (integrity.length) {
  console.error(`\n⚠️  ${integrity.length} problème(s) d'intégrité :`);
  for (const p of integrity.slice(0, 40)) console.error(`  ${p.lesson}: ${p.error}`);
  if (STRICT) process.exit(1);
}
