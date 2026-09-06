// Knowledge-dependency audit — the mechanical form of the platform's
// pedagogical law (docs/architecture/KNOWLEDGE_DEPENDENCY.md):
//
//   BEFORE ANY DEMAND, EVERYTHING REQUIRED TO UNDERSTAND IT MUST ALREADY BE
//   AVAILABLE TO THE STUDENT.
//
// It reads each lesson as an EXPOSURE STREAM (scripts/lib/exposureStream.mjs)
// and runs two checks:
//
//   1. DECLARED CONTRACT — every `requires={[…]}` on a question names a
//      concept established EARLIER by a <KnowledgeBrick> or listed in the
//      lesson's `priorKnowledge`. This is exact, and it is what --gate fails on.
//   2. LEXICON SCAN — a curated list of French mathematical terms and
//      notations; a term whose FIRST appearance in a lesson is a demand or a
//      post-answer slot is reported. This is a DETECTOR, not the judge: it
//      finds candidates for the manual audit and cannot prove a lesson correct.
//
// Usage:
//   node scripts/audit-knowledge-dependencies.mjs [--lesson <id>] [--grade 3e]
//                                                 [--report] [--gate] [--strict] [--json]

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import {
  repoRoot, findLessonDirs, parseLessonConfig, buildLessonIndex, listSourceFiles, moduleFileNumber,
} from './lib/lessonAst.mjs';
import { readKnowledge } from './lib/knowledgeData.mjs';
import { buildModuleStream } from './lib/exposureStream.mjs';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : null;
};

const moduleOpts = {
  lesson: value('lesson'),
  grade: value('grade'),
  report: flag('report'),
  gate: flag('gate'),
  strict: flag('strict'),
  json: flag('json'),
};
const opts = moduleOpts;

const LEXICON = JSON.parse(readFileSync(join(repoRoot, 'scripts/audit/lexicon.json'), 'utf-8'));
const GRADE_RANK = Object.fromEntries(LEXICON.gradeOrder.map((g, i) => [g, i]));
const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };

/** Compiled once: patterns are unicode + case-insensitive. */
const TERMS = LEXICON.terms.map((t) => ({
  ...t,
  re: (t.patterns ?? []).map((p) => new RegExp(p, 'iu')),
  reNotation: (t.notationPatterns ?? []).map((p) => new RegExp(p, 'iu')),
  reTarget: (t.targetPatterns ?? t.patterns ?? []).map((p) => new RegExp(p, 'iu')),
}));

const TEACHING_KINDS = new Set(['teaching', 'brick']);
const DEMAND_KINDS = new Set(['demand']);

export function auditLesson(lessonDir, catalogue, options = {}) {
  const opts = { ...moduleOpts, ...options };
  const config = parseLessonConfig(lessonDir);
  const rel = relative(repoRoot, lessonDir);
  const findings = [];
  const add = (code, severity, message, seg = {}) => findings.push({
    code, severity, message,
    file: seg.file ?? `${rel}/lesson.config.js`,
    line: seg.line ?? 0,
    module: seg.module ?? null,
    step: seg.step ?? null,
    term: seg.term ?? null,
    questionId: seg.questionId ?? null,
    position: seg.position ?? -1,
  });

  const knowledge = readKnowledge(lessonDir);
  for (const p of knowledge.problems) {
    add(p.code, p.code.startsWith('E_') ? 'critical' : 'medium', p.message, { file: relative(repoRoot, knowledge.file), line: p.line });
  }

  const priorKnowledge = Array.isArray(config.priorKnowledge) ? config.priorKnowledge : [];
  if (config.priorKnowledge === 'INVALID') {
    add('E_PRIOR_KNOWLEDGE_NOT_LITERAL', 'critical', 'priorKnowledge must be a literal array of concept id strings');
  }

  // ── Build the ordered exposure stream over all modules ────────────────────
  const counter = { n: 0 };
  const segments = [];
  const moduleFiles = listSourceFiles(join(lessonDir, 'modules'));
  const byNumber = new Map();
  for (const file of moduleFiles) {
    const n = moduleFileNumber(file);
    if (n !== null && !byNumber.has(n)) byNumber.set(n, file);
  }

  let skipped = null;
  for (const m of config.modules ?? []) {
    const file = byNumber.get(m.number);
    if (!file) continue;
    const res = buildModuleStream(file, {
      moduleNumber: m.number, stage: m.stage, knowledgeItems: knowledge.items, counter,
    });
    if (res.unparseable === 'no-kit-root') {
      skipped = 'legacy';
      add('W_MODULE_NOT_KIT', 'info', `module ${m.number} does not use the lesson kit — not analysable`, { file: relative(repoRoot, file), module: m.number });
      continue;
    }
    if (res.unparseable) {
      add('W_UNPARSEABLE_STEPS', 'medium', `module ${m.number}: could not resolve '${res.unparseable}' to a literal array — its content is invisible to the audit`, { file: relative(repoRoot, file), module: m.number });
    }
    segments.push(...res.segments);
  }

  // ── Check 1: declared contract ────────────────────────────────────────────
  const established = new Map();
  for (const id of priorKnowledge) established.set(id, { position: -1, source: 'prior', variant: null });

  const bricks = [];
  for (const seg of segments) {
    if (seg.slot !== 'brick.item') continue;
    bricks.push(seg);
    if (seg.itemMissing) {
      add('E_BRICK_ITEM_MISSING', 'critical', `<KnowledgeBrick id="${seg.itemId}"> has no matching item in knowledge.jsx`, seg);
    }
    const item = knowledge.items.get(seg.itemId);
    if (item && item.module !== seg.module) {
      add('W_BRICK_MODULE_MISMATCH', 'medium', `brick '${seg.itemId}' renders in module ${seg.module} but knowledge.jsx declares it under module ${item.module} — the map attributes it to ${item.module}`, seg);
    }
    for (const id of seg.establishes ?? []) {
      if (!established.has(id)) established.set(id, { position: seg.position, source: 'brick', variant: seg.variant, line: seg.line, file: seg.file, module: seg.module });
      else if (established.get(id).source === 'prior') {
        add('W_PRIOR_REESTABLISHED', 'info', `'${id}' is declared in priorKnowledge and re-established by a brick here (fine for a « rappel »)`, seg);
      }
    }
  }

  const questions = new Map();
  for (const seg of segments) {
    if (!seg.questionId) continue;
    if (!questions.has(seg.questionId)) {
      questions.set(seg.questionId, {
        questionId: seg.questionId, module: seg.module, step: seg.step, component: seg.component,
        file: seg.file, line: seg.line, position: seg.position, requires: seg.requires, segments: [],
      });
    }
    const q = questions.get(seg.questionId);
    q.segments.push(seg);
    if (DEMAND_KINDS.has(seg.kind)) q.position = Math.min(q.position, seg.position);
    if (seg.requires !== undefined && q.requires === undefined) q.requires = seg.requires;
  }

  for (const q of questions.values()) {
    const isDiagnostic = q.component === 'diag';
    if (q.requires === 'INVALID') {
      add('E_REQUIRES_NOT_LITERAL', 'critical', `question '${q.questionId}': requires must be a literal array of concept id strings`, q);
      continue;
    }
    if (q.requires === undefined) {
      if (opts.strict) {
        add('E_QUESTION_WITHOUT_REQUIRES', 'high', `question '${q.questionId}' does not declare requires — its knowledge dependencies are undeclared`, q);
      }
      continue;
    }
    for (const id of q.requires) {
      if (isDiagnostic && !priorKnowledge.includes(id)) {
        add('E_DIAG_REQUIRES_UNDECLARED', 'critical', `diagnostic question '${q.questionId}' requires '${id}', which is not in priorKnowledge — Module 0 tests prior knowledge only`, q);
        continue;
      }
      const src = established.get(id);
      if (!src) {
        add('E_REQUIRES_NOT_ESTABLISHED', 'critical', `question '${q.questionId}' requires '${id}', which no brick establishes and priorKnowledge does not declare`, q);
      } else if (src.variant === 'enrichment') {
        // L'enrichissement d'abord : sa position ne le sauverait pas. Une
        // question du parcours principal ne peut jamais en dépendre.
        add('E_REQUIRES_ENRICHMENT', 'critical', `question '${q.questionId}' requires '${id}', which is declared as enrichment — enrichment is never required on the core path`, q);
      } else if (src.position > q.position) {
        add('E_REQUIRES_ESTABLISHED_LATER', 'critical', `question '${q.questionId}' requires '${id}', established only later by the brick at ${src.file}:${src.line}`, q);
      }
    }
  }

  const diagnosed = new Set();
  for (const q of questions.values()) {
    if (q.component === 'diag' && Array.isArray(q.requires)) q.requires.forEach((id) => diagnosed.add(id));
  }
  for (const id of priorKnowledge) {
    if (!diagnosed.has(id)) {
      add('W_PRIOR_NOT_DIAGNOSED', opts.strict ? 'high' : 'medium', `priorKnowledge declares '${id}' but no Module 0 question diagnoses it`);
    }
  }

  const brickIds = new Set(bricks.map((b) => b.itemId));
  for (const item of knowledge.items.values()) {
    if (!brickIds.has(item.id)) {
      add('W_ITEM_WITHOUT_BRICK', 'info', `knowledge item '${item.id}' (module ${item.module}) is never established by a brick — it only appears in the end-of-module snapshot`, { file: relative(repoRoot, knowledge.file), line: item.line, module: item.module });
    }
  }

  // ── Check 2: lexicon scan ─────────────────────────────────────────────────
  const lessonRank = GRADE_RANK[config.grade] ?? 0;
  const ignored = new Set(config.knowledgeAuditIgnore.map((i) => i.term));
  const targetText = [...config.teachingScopeInclude, ...(catalogue?.pointsToLearn ?? [])].join(' | ');

  for (const term of TERMS) {
    if (ignored.has(term.id)) continue;
    if (priorKnowledge.includes(term.id)) continue;
    // A term from an earlier grade is prior knowledge by default: reporting it
    // everywhere would bury the real findings. --strict surfaces them.
    if ((GRADE_RANK[term.grade] ?? 0) < lessonRank && !opts.strict) continue;

    const hits = [];
    for (const seg of segments) {
      const inText = term.re.some((re) => re.test(seg.text));
      const inNotation = term.reNotation.length > 0 && seg.notation.some((n) => term.reNotation.some((re) => re.test(n)));
      if (inText || inNotation) hits.push(seg);
    }
    if (hits.length === 0) continue;

    const first = hits[0];
    // Established by a brick before its first textual use → nothing to report.
    const establishedAt = established.get(term.id)?.position;
    if (establishedAt !== undefined && establishedAt <= first.position) continue;
    if (TEACHING_KINDS.has(first.kind)) continue;

    const taughtAt = hits.find((h) => TEACHING_KINDS.has(h.kind));
    const isTarget = term.reTarget.some((re) => re.test(targetText));
    const distractorOnly = hits.every(
      (h) => (h.slot === 'q.option' || h.slot === 'q.rowOption' || h.slot === 'boss.option' || h.slot === 'diag.option')
        && h.optionIndex !== h.correctIndex
    );

    if (first.kind === 'jit') {
      add('I_FIRST_IN_JIT', 'info', `« ${term.label} » first appears in a just-in-time slot (${first.slot})`, { ...first, term: term.id });
      continue;
    }

    // Un titre d'étape est lu alors que l'étape est encore verrouillée : il
    // annonce le mot sans rien en dire. C'est une fuite réelle, mais moins
    // grave qu'une demande — sauf si le mot n'est jamais posé ensuite.
    if (first.kind === 'preview') {
      const taught = hits.find((h) => TEACHING_KINDS.has(h.kind));
      add(taught ? 'M_NAMED_IN_LOCKED_TITLE' : 'H_NAMED_ONLY_IN_TITLE',
        taught ? 'medium' : 'high',
        `« ${term.label} » est nommé dans le titre de l'étape ${first.step} (module ${first.module}), lisible avant que l'étape ne s'ouvre${taught ? '' : ', et n\'est jamais posé ensuite'}`,
        { ...first, term: term.id });
      continue;
    }

    const where = `${first.slot} (module ${first.module}${first.step ? `, étape ${first.step}` : ''})`;
    if (distractorOnly) {
      add('L_DISTRACTOR_ONLY', 'low', `« ${term.label} » appears only as a wrong answer, first at ${where} — a distractor still creates a first exposure`, { ...first, term: term.id });
    } else if (isTarget) {
      add('C_TARGET_DEMANDED_BEFORE_TAUGHT', 'critical', `« ${term.label} » is a target concept of this lesson but its first appearance is ${where}${taughtAt ? `; it is only taught later at ${taughtAt.file}:${taughtAt.line}` : ' and it is never taught in a teaching position'}`, { ...first, term: term.id });
    } else if (!taughtAt) {
      add('H_NEVER_TAUGHT', 'high', `« ${term.label} » first appears at ${where} and is never established in a teaching position in this lesson`, { ...first, term: term.id });
    } else if (first.kind === 'postAnswer' && hits.some((h) => DEMAND_KINDS.has(h.kind) && h.position > first.position && h.position < taughtAt.position)) {
      add('M_TAUGHT_IN_FEEDBACK_THEN_DEMANDED', 'medium', `« ${term.label} » is introduced in feedback (${first.file}:${first.line}) and then demanded before any teaching position`, { ...first, term: term.id });
    } else {
      add('M_TAUGHT_TOO_LATE', 'medium', `« ${term.label} » first appears at ${where}, before its teaching position at ${taughtAt.file}:${taughtAt.line}`, { ...first, term: term.id });
    }
  }

  // ── The lesson's knowledge contract ───────────────────────────────────────
  const conceptFor = (item) => ({
    id: item.id, type: item.type, module: item.module,
    brick: bricks.find((b) => b.itemId === item.id)
      ? { file: bricks.find((b) => b.itemId === item.id).file, line: bricks.find((b) => b.itemId === item.id).line, step: bricks.find((b) => b.itemId === item.id).step, variant: bricks.find((b) => b.itemId === item.id).variant }
      : null,
  });
  const allItems = [...knowledge.items.values()];
  const contract = {
    lesson: config.id,
    grade: config.grade,
    lexiconVersion: LEXICON.version,
    prerequisites: priorKnowledge,
    conceptsIntroduced: allItems.filter((i) => i.type === 'concepts' || i.type === 'regles' || i.type === 'formules').map(conceptFor),
    vocabularyIntroduced: allItems.filter((i) => i.type === 'vocabulaire').map(conceptFor),
    proceduresIntroduced: allItems.filter((i) => i.type === 'methodes').map(conceptFor),
    memorisation: allItems.filter((i) => i.type === 'memoriser').map(conceptFor),
    questions: [...questions.values()].map((q) => {
      const status = {};
      for (const id of Array.isArray(q.requires) ? q.requires : []) {
        const src = established.get(id);
        if (!src) status[id] = 'missing';
        else if (src.source === 'prior') status[id] = 'prior';
        else if (src.variant === 'enrichment') status[id] = 'enrichment';
        else if (src.position > q.position) status[id] = `later@M${src.module}`;
        else status[id] = `established@M${src.module}`;
      }
      const lexiconHits = findings.filter((f) => f.questionId === q.questionId && f.term).map((f) => f.term);
      return {
        questionId: q.questionId, module: q.module, step: q.step, component: q.component,
        file: q.file, line: q.line,
        requires: q.requires === undefined ? null : q.requires,
        prerequisiteStatus: status,
        lexiconHits,
        pedagogicallyValid: Object.values(status).every((v) => v === 'prior' || v.startsWith('established'))
          && !findings.some((f) => f.questionId === q.questionId && SEVERITY_RANK[f.severity] <= 1),
      };
    }),
    findings,
  };

  findings.sort((a, b) => (SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]) || (a.position - b.position));

  return {
    id: config.id, grade: config.grade, dir: rel, skipped,
    hasKnowledge: knowledge.file !== null,
    brickCount: bricks.length,
    questionCount: questions.size,
    requiresCount: [...questions.values()].filter((q) => Array.isArray(q.requires)).length,
    ignored: config.knowledgeAuditIgnore,
    findings, contract, segments,
  };
}

// ── Run (CLI only — importing this module must not audit the repo) ──────────
const invokedDirectly = process.argv[1] && process.argv[1].endsWith('audit-knowledge-dependencies.mjs');
if (invokedDirectly) runCli();

function runCli() {
const lessonIndex = buildLessonIndex();
const results = [];
for (const dir of findLessonDirs()) {
  const config = parseLessonConfig(dir);
  if (!config.id) continue;
  if (opts.lesson && config.id !== opts.lesson) continue;
  if (opts.grade && config.grade !== opts.grade) continue;
  results.push(auditLesson(dir, lessonIndex.get(`${config.grade}:${config.id}`)));
}

const count = (r, sev) => r.findings.filter((f) => f.severity === sev).length;
const errorsOf = (r) => r.findings.filter((f) => f.code.startsWith('E_'));

if (opts.json) {
  console.log(JSON.stringify(results.map(({ segments, ...r }) => r), null, 2));
} else {
  for (const r of results) {
    const e = errorsOf(r).length;
    console.log(
      `${r.grade}:${r.id}`.padEnd(46)
      + `bricks ${String(r.brickCount).padStart(2)}  requires ${String(r.requiresCount)}/${r.questionCount}  `
      + `contract ${e}E  lexicon ${count(r, 'critical')}C/${count(r, 'high')}H/${count(r, 'medium')}M/${count(r, 'low')}L`
      + (r.skipped ? `  [${r.skipped}]` : '')
    );
    for (const f of r.findings) {
      if (f.severity === 'info' && !opts.strict) continue;
      console.log(`    ${f.severity.toUpperCase().padEnd(8)} ${f.code.padEnd(36)} ${f.file}:${f.line}  ${f.message}`);
    }
  }
}

if (opts.report) {
  const outDir = join(repoRoot, 'docs/reports/knowledge-contracts');
  mkdirSync(outDir, { recursive: true });
  for (const r of results) {
    writeFileSync(join(outDir, `${r.grade}_${r.id}.json`), `${JSON.stringify(r.contract, null, 2)}\n`);
  }

  const inScope = (r) => r.grade === '3e' || r.grade === 'seconde';
  const sum = (rs, sev) => rs.reduce((n, r) => n + count(r, sev), 0);
  const scoped = results.filter(inScope);
  const other = results.filter((r) => !inScope(r));

  const table = (rs) => [
    '| Leçon | Carte | Bricks | requires | Contrat | C | H | M | L |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rs.map((r) => `| \`${r.grade}:${r.id}\` | ${r.hasKnowledge ? '✅' : '—'} | ${r.brickCount} | ${r.requiresCount}/${r.questionCount} | ${errorsOf(r).length} | ${count(r, 'critical')} | ${count(r, 'high')} | ${count(r, 'medium')} | ${count(r, 'low')} |`),
  ].join('\n');

  const details = (rs) => rs.filter((r) => r.findings.some((f) => f.severity !== 'info')).map((r) => [
    `### \`${r.grade}:${r.id}\``, '',
    ...r.findings.filter((f) => f.severity !== 'info').map((f) => `- **${f.severity.toUpperCase()}** \`${f.code}\` — ${f.file}:${f.line}${f.term ? ` · terme « ${f.term} »` : ''}  \n  ${f.message}`),
    '',
  ].join('\n')).join('\n');

  const md = `# Audit des dépendances de connaissances

> Généré par \`npm run audit:knowledge\` (lexique v${LEXICON.version}). Ne pas éditer à la main.
>
> La loi : **avant toute demande, tout ce qui est nécessaire pour la comprendre doit déjà être
> disponible pour l'élève** (docs/architecture/KNOWLEDGE_DEPENDENCY.md). Les positions
> \`explain\`, \`explainWrong\`, \`correction\`, \`feedback\` et \`footer\` renforcent une notion ;
> elles ne l'établissent jamais.
>
> Le lexique est un **détecteur**, pas le juge : il signale les candidats à l'audit manuel.

## Périmètre courant — 3e et 2nde

${scoped.length} leçon(s) · critiques ${sum(scoped, 'critical')} · hautes ${sum(scoped, 'high')} · moyennes ${sum(scoped, 'medium')} · basses ${sum(scoped, 'low')}

${table(scoped)}

${details(scoped)}

## Hors périmètre — 6e et 4e (relevé, non réparé)

Ces niveaux ne sont pas traités par le chantier en cours. Les constats sont enregistrés ici pour
mémoire ; **aucune leçon 6e/4e ne doit être modifiée**.

${other.length} leçon(s) · critiques ${sum(other, 'critical')} · hautes ${sum(other, 'high')} · moyennes ${sum(other, 'medium')} · basses ${sum(other, 'low')}

${table(other)}
`;
  writeFileSync(join(repoRoot, 'docs/reports/KNOWLEDGE_DEPENDENCY_AUDIT.md'), md);
  console.log(`\nRapport écrit : docs/reports/KNOWLEDGE_DEPENDENCY_AUDIT.md (+ ${results.length} contrats JSON)`);
}

if (opts.gate) {
  const blocking = results.flatMap((r) => errorsOf(r));
  const lexical = opts.strict
    ? results.flatMap((r) => r.findings.filter((f) => ['critical', 'high', 'medium'].includes(f.severity) && !f.code.startsWith('E_')))
    : [];
  const total = blocking.length + lexical.length;
  if (total > 0) {
    console.error(`\n${total} blocage(s) de dépendance de connaissances.`);
    process.exit(1);
  }
  console.log('\nAudit des dépendances : aucun blocage.');
}
}
