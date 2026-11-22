import { describe, it, expect } from 'vitest';
import { TEXT as TAHLIL } from '../tahlil-ibara/content/forbidden.js';
import { TEXT as NASHR } from '../nashr-tabsit/content/forbidden.js';
import { TEXT as SHAHIRA } from '../mutatabiqat-shahira/content/forbidden.js';
import { ANSWER_TEXT as SYNTH } from '../wadiya-idmajiya-harfi/content/forbidden.js';

/**
 * Unité 3 « الحساب الحرفي » — ce que l'élève LIT de la mission, de la carte des معارف et des données du manuel (modèle : l'unité 9,
 * khassiyat-talis/_unit/missionStrings.test.js ; rollout 2026-11-11). Une leçon CONVERTIE entre dans `CLIMAX` avec la signature de SA مسألة
 * (tahlil-ibara le 2026-11-11 ; nashr-tabsit et mutatabiqat-shahira y ajoutent la leur) :
 *   - aucun caractère de contrôle dans un point d'étape ni dans l'ouverture (« \times » dans une chaîne JS à apostrophes devient TAB + « imes ») ;
 *   - aucune ligne de la carte des معارف (knowledgeGraph.js) d'une leçon convertie ne renvoie au manuel ;
 *   - les cartes de connaissance (knowledge.jsx) et la carte des معارف — ouvertes dès le début (`knowledgeMapOpen`) — ne montrent pas la
 *     solution de la مسألة de LEUR leçon ; ses points d'étape non plus ;
 *   - les textes du manuel que l'élève lit (knowledge.jsx, knowledgeGraph.js, content/textbook.js, content/exercises.js) ne disent ni
 *     « الكتاب », ni « تمرين N : », ni « خطأً مطبعيًا » (indépendance du manuel) — hors commentaires et métadonnées `src(...)` ;
 *   - le camarade de chaque « ورقة زميل » des leçons de 4AM a un prénom UNIQUE (verdict X4 du 2026-11-11).
 */
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const graphs = import.meta.glob('../*/knowledgeGraph.js', { eager: true });
const raw = import.meta.glob(['../*/knowledge.jsx', '../*/knowledgeGraph.js', '../*/content/textbook.js', '../*/content/exercises.js'], { eager: true, query: '?raw', import: 'default' });
const peers = import.meta.glob('../../../../**/content/peerSheet.js', { eager: true });
const unitPeers = import.meta.glob('../*/content/peerSheet.js', { eager: true });
const CONTROL = /[\t\n\r\f\v\b]/;

/** Le texte d'un fichier sans ses commentaires ni ses métadonnées de source. */
const strings = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/ .*$/gm, '')
  .replace(/src\([^)]*\)/g, '');

/**
 * La signature de la مسألة de chaque leçon CONVERTIE : ce que ses cartes de connaissance et ses points d'étape ne montrent jamais.
 *   tahlil-ibara (module 5, le gazon du terrain du quartier) : 10x² + 15x = 5x(2x + 3), 5(2x² + 3x), 5x²(2 + 3x), 2x + 15, PGCD(10 ; 15),
 *   1500 / 450 / 135000, 5x posé en facteur d'une somme en x — content/forbidden.js › TEXT.
 */
const CLIMAX = {
  'tahlil-ibara': TAHLIL,
  // nashr-tabsit (module 4, le couloir des spectateurs) : 1820, 1760, 1944, 124, 186000, 1500, 350, x = 30, les facteurs 2x + 10, x − 4,
  // 2x + 12, x − 3, les termes −8x, 10x, −40, −36, 12x, −6x et les développements de la مسألة — content/forbidden.js › TEXT (2026-11-11).
  'nashr-tabsit': NASHR,
  // mutatabiqat-shahira (module 5, les gradins sur deux côtés) : 27, 729, 720, 711, 171, 900, 180, x = 30, le facteur x − 3, les termes ±6x et la
  // constante ±9, les développements x² − 6x + 9, 6x − 9 et leurs leurres, l'ancre mentale 30 — content/forbidden.js › TEXT (2026-11-11).
  'mutatabiqat-shahira': SHAHIRA,
  // la synthèse wadiya-idmajiya-harfi (2026-11-12, lecteur de mission) : le défi 🏆 RÉSOLU (4x² + 40x, x² + 10x − 11, (x − 1)(x + 11), −11,
  // 144, x = 1 m) — content/forbidden.js › ANSWER_TEXT ; une synthèse n'a pas de content/exercises.js (trois fichiers lus, non quatre)
  'wadiya-idmajiya-harfi': SYNTH,
};
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+\s*:/, /خطأً? مطبعي/];
const lessonOf = (path) => path.split('/')[1];
const hit = (s) => TAHLIL.some((re) => re.test(s));

describe('unit 3 — mission strings and knowledge maps', () => {
  it('found the lessons and the peer sheets', () => {
    expect(Object.keys(configs).length).toBeGreaterThanOrEqual(4);
    expect(Object.keys(raw).filter((path) => CLIMAX[lessonOf(path)]).length).toBe(4 * Object.keys(CLIMAX).length - 1);
    expect(Object.keys(peers).length).toBeGreaterThanOrEqual(10);
  });
  it('the signature regexes catch what they must (negative controls)', () => {
    ['$10x^2 + 15x$', '5x(2x + 3)', '$5(2x^2 + 3x)$', 'PGCD$(10 ; 15)$', '135000', 'السياج 1500 دج', '$5x(x - 1)$', '2x + 15'].forEach((s) => expect(hit(s), s).toBe(true));
    ['$8x + 6 = 2(4x + 3)$', '(2x + 3)^2', '$5x(2x + 1) + (2x + 1)$', '15x', '$x(x + 5)$', '1,5'].forEach((s) => expect(hit(s), s).toBe(false));
  });
  it('the nashr-tabsit signature catches what it must (negative controls)', () => {
    const hitN = (s) => NASHR.some((re) => re.test(s));
    ['$1820$', '$(2x + 10)(x - 4)$', '$2x^2 + 2x - 40$', '$-8x + 10x$', '$x = 30$', '$2x^2 - 40$', '$4x + 4$', '186000 دج', '$- 6x$', '$x − 4$', '$2x + 10$', '$x - 3$', '$−8x$', '$2x^2 + 2x − 40$'].forEach((s) => expect(hitN(s), s).toBe(true));
    ['$3x^2 + 8x - 3$', '$6x - 12$', '$-6x^2$', '$-5x^2 - 10x - 5x$', '$x = 3$', '$(x + 4)(2x + 1)$', '$2x^2 + 7x + 3$', '$4x + 45$', '$16x$', '$3x - 4$', '$-2x + 10$', '$(2x - 3)(x - 1)$', '$x^2 - 3x$', '$2x - 3$'].forEach((s) => expect(hitN(s), s).toBe(false));
  });
  it('the mutatabiqat-shahira signature catches what it must (negative controls)', () => {
    const hitS = (s) => SHAHIRA.some((re) => re.test(s));
    ['$(x - 3)^2$', '$x^2 - 6x + 9$', '$6x - 9$', '$729$', '$(30 - 3)^2$', '$x = 30$', '$x^2 - 9$', '$x − 3$', '$900 - 180 + 9$', '171 m²', '$-6x$', '$(x + 3)(x - 3)$', '$-171$', '$x^2-180$', '$874\\,800$', '$1\\,200$', '$x + 3$', 'ضلعه $30\\,m$'].forEach((s) => expect(hitS(s), s).toBe(true));
    ['$(x + 4)^2$', '$x^2 - 10x + 25$', '$16x$', '$0{,}6x$', '$9x^2 - 4$', 'ex-9', 'text-slate-900', '$2x - 3$', '$x^2 - 3x$', '$(41)^2$', '$1\\,016\\,064$', '$(x - 5)(x + 5)$'].forEach((s) => expect(hitS(s), s).toBe(false));
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
  it('the checkpoints of a converted lesson never show its climax', () => {
    Object.entries(configs).forEach(([path, m]) => {
      const sigs = CLIMAX[lessonOf(path)];
      if (!sigs) return;
      (m.LESSON_CONFIG?.mission?.checkpoints ?? []).forEach((cp) => {
        const s = [cp.prompt, ...cp.options, cp.explain].join(' ');
        sigs.forEach((re) => expect(re.test(s), `${path} ${cp.id} ${re}`).toBe(false));
      });
    });
  });
  it('no knowledge-map line of a converted lesson sends the student to the textbook', () => {
    Object.entries(graphs).forEach(([path, m]) => {
      if (!CLIMAX[lessonOf(path)]) return;
      expect(JSON.stringify(m.KNOWLEDGE_GRAPH ?? {}).includes('الكتاب'), path).toBe(false);
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
  it('every peer-sheet classmate of THIS unit has a first name used by no other 4AM peer sheet (verdict X4)', () => {
    // (units 1, 2 and 9 already share سلمى, رياض, رانية — before the rule; a unit-3 classmate never joins them)
    const names = Object.values(peers).map((m) => m.PEER_KID?.name).filter(Boolean);
    const ours = Object.values(unitPeers).map((m) => m.PEER_KID?.name).filter(Boolean);
    expect(ours.length).toBeGreaterThanOrEqual(1);
    ours.forEach((n) => expect(names.filter((x) => x === n), n).toHaveLength(1));
  });
});
