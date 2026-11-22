import { describe, it, expect } from 'vitest';

/**
 * Unité 2 — ce que l'élève LIT de la mission, de la carte des معارف et des données du manuel (revues ECC 2026-11-10) :
 *   - aucun caractère de contrôle dans un point d'étape (« \times » dans une chaîne JS à apostrophes devient TAB + « imes ») ;
 *   - aucune ligne de la carte des معارف (knowledgeGraph.js) ne renvoie au manuel ;
 *   - les cartes de connaissance (knowledge.jsx) et la carte des معارف — ouvertes dès le début (`knowledgeMapOpen`) — ne montrent pas la
 *     solution de la مسألة de LEUR leçon (sa signature : ses racines, ses nombres-réponses) ;
 *   - les textes du manuel que l'élève lit (knowledge.jsx, knowledgeGraph.js, content/textbook.js, content/exercises.js) ne disent ni
 *     « الكتاب », ni « تمرين N : », ni « خطأً مطبعيًا » (indépendance du manuel) — hors commentaires et métadonnées `src(...)`.
 * A v2 lesson (LESSON_V2.md §2) has no root knowledge.jsx / knowledgeGraph.js: its only knowledge (sheets and map) is its
 * world's `world/knowledge.js`, scanned here by the same rules.
 */
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const graphs = import.meta.glob(['../*/knowledgeGraph.js', '../*/world/knowledge.js'], { eager: true });
const raw = import.meta.glob(['../*/knowledge.jsx', '../*/knowledgeGraph.js', '../*/world/knowledge.js', '../*/content/textbook.js', '../*/content/exercises.js'], { eager: true, query: '?raw', import: 'default' });
const CONTROL = /[\t\n\r\f\v\b]/;

/** Le texte d'un fichier sans ses commentaires ni ses métadonnées de source. */
const strings = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/src\([^)]*\)/g, '');

/** La signature de la مسألة de chaque leçon : ce que ses cartes de connaissance ne montrent jamais. */
const CLIMAX = {
  'jidhr-tarbii': [/\\sqrt\{34\}/, /5\{?,\}?83/],
  'natiqa-ghayr-natiqa': [/2\{?,\}?89/, /1\{?,\}?74/],
  'muadalat-x-murabba': [/\\sqrt\{11\}/, /(^|[^0-9])3\{,\}3(?![0-9])/, /0\{?,\}?09/, /x\^2\s*=\s*64/, /x\^2\s*=\s*-\s*36/],
  'amaliyat-judhur': [/\\sqrt\{180\}/, /6\s*\\sqrt\{5\}/, /3\s*\\sqrt\{5\}/, /(^|[^0-9])(180|192)([^0-9]|$)/],
  'tawzif-khawass-judhur': [/\\sqrt\{200\}/, /\\sqrt\{50\}/, /10\s*\\sqrt\{2\}/, /2\s*\\sqrt\{50\}/, /5\s*\\sqrt\{8\}/, /100\s*\\sqrt\{2\}/, /(^|[^0-9,{}])(200|120|12000)([^0-9,{}]|$)/],
  // la synthèse (2026-11-12, lecteur de mission) : la زربية du 🏆 — sa largeur et sa longueur, exactes et arrondies, et son prix (content/forbidden.js)
  'wadiya-idmajiya-judhur': [/\\sqrt\{12\}/, /(^|[^0-9])[24]\s*\\sqrt\{3\}/, /\\sqrt\{48\}/, /(^|[^0-9])(346|693|692)([^0-9]|$)/, /12000/, /زرب/],
};
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+\s*:/, /خطأً? مطبعي/];
const lessonOf = (path) => path.split('/')[1];

describe('unit 2 — mission strings and knowledge maps', () => {
  it('found the lessons', () => {
    expect(Object.keys(configs).length).toBeGreaterThanOrEqual(5);
    expect(Object.keys(graphs).length).toBeGreaterThanOrEqual(5);
    // the raw scans really read the lessons' knowledge, map, textbook and exercise files — lessons 3–5 on pages (four files
    // each), the synthesis (three) and the two v2 lessons' world/knowledge.js: 3 × 4 + 3 + 2 = 17 (2026-11-21)
    expect(Object.keys(raw).filter((path) => CLIMAX[lessonOf(path)]).length).toBeGreaterThanOrEqual(17);
    expect(Object.values(raw).every((src) => typeof src === 'string' && src.length > 100)).toBe(true);
  });
  it('no checkpoint string holds a control character (a lost backslash)', () => {
    Object.entries(configs).forEach(([path, m]) => {
      (m.LESSON_CONFIG?.mission?.checkpoints ?? []).forEach((cp) => {
        [cp.prompt, ...cp.options, cp.explain].forEach((s) => expect(CONTROL.test(String(s)), `${path} ${cp.id}: ${JSON.stringify(s)}`).toBe(false));
      });
      const o = m.LESSON_CONFIG?.mission?.opening?.text;
      if (o) expect(CONTROL.test(o), `${path} opening`).toBe(false);
    });
  });
  it('no knowledge-map line sends the student to the textbook', () => {
    Object.entries(graphs).forEach(([path, m]) => {
      // « الكتاب » the book — never « الكتابة » (the writing of a number), which a world's map says
      expect(/الكتاب(?!ة)/.test(JSON.stringify(m.KNOWLEDGE_GRAPH ?? {})), path).toBe(false);
    });
  });
  it('the knowledge cards and the knowledge map never show their own lesson\'s climax solution', () => {
    Object.entries(raw).filter(([path]) => /knowledge(Graph)?\.jsx?$/.test(path)).forEach(([path, src]) => {
      const sigs = CLIMAX[lessonOf(path)];
      if (!sigs) return;
      strings(src).split('\n').forEach((line, i) => sigs.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 90)}`).toBe(false)));
    });
  });
  it('the textbook data a student reads never names the book, an exercise number or a printing error', () => {
    Object.entries(raw).filter(([path]) => CLIMAX[lessonOf(path)]).forEach(([path, src]) => {
      strings(src).split('\n').forEach((line, i) => BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 90)}`).toBe(false)));
    });
  });
});
