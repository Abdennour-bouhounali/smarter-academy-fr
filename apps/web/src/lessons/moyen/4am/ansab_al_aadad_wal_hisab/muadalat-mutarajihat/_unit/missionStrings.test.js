import { describe, it, expect } from 'vitest';
import { showsAny, visibleLines } from './forbiddenShared.js';

/**
 * Unité 4 « معادلات ومتراجحات » — ce que l'élève LIT de la mission, de la carte des معارف et des données du manuel (squelette du commit 0 du
 * 2026-11-11 ; modèle : l'unité 3, hisab-harfi/_unit/missionStrings.test.js). Les signatures viennent de `_unit/signatures/<leçon>.js`, une par
 * leçon CONVERTIE (écrite par son constructeur) :
 *   - aucun caractère de contrôle dans un point d'étape ni dans l'ouverture ;
 *   - les cartes de connaissance et la carte des معارف ne montrent pas la solution de la مسألة de LEUR leçon ;
 *   - le manuel que l'élève lit ne dit ni « الكتاب », ni « تمرين N : », ni « خطأً مطبعيًا » ;
 *   - le camarade de chaque « ورقة زميل » a un prénom UNIQUE parmi les leçons de 4AM.
 */
const sigFiles = import.meta.glob('./signatures/*.js', { eager: true });
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const raw = import.meta.glob(['../*/knowledge.jsx', '../*/knowledgeGraph.js', '../*/content/textbook.js', '../*/content/exercises.js'], { eager: true, query: '?raw', import: 'default' });
const peers = import.meta.glob('../../../../**/content/peerSheet.js', { eager: true });
const unitPeers = import.meta.glob('../*/content/peerSheet.js', { eager: true });
const CONTROL = /[\t\n\r\f\v\b]/;
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+\s*:/, /خطأً? مطبعي/];
const lessonOf = (path) => path.split('/')[1];
const CLIMAX = Object.fromEntries(Object.entries(sigFiles).map(([p, m]) => [p.replace(/^.*\/(.+)\.js$/, '$1'), m.TEXT ?? []]));

describe('unit 4 — mission strings and knowledge maps', () => {
  it('found the lessons', () => {
    expect(Object.keys(configs).length).toBeGreaterThanOrEqual(5);
  });
  it('no checkpoint or opening string holds a control character (a lost backslash)', () => {
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
      if (!sigs?.length) return;
      (m.LESSON_CONFIG?.mission?.checkpoints ?? []).forEach((cp) => {
        const s = [cp.prompt, ...cp.options, cp.explain].join(' ');
        expect(showsAny(sigs, s), `${path} ${cp.id}`).toBe(false);
      });
    });
  });
  it('the knowledge cards and the knowledge map never show their own lesson\'s climax solution', () => {
    Object.entries(raw).filter(([path]) => /knowledge(Graph)?\.jsx?$/.test(path)).forEach(([path, src]) => {
      const sigs = CLIMAX[lessonOf(path)];
      if (!sigs?.length) return;
      visibleLines(src).forEach((line, i) => expect(showsAny(sigs, line), `${path}:${i + 1} — ${line.trim().slice(0, 90)}`).toBe(false));
    });
  });
  it('the textbook data of a converted lesson never names the book, an exercise number or a printing error', () => {
    Object.entries(raw).filter(([path]) => CLIMAX[lessonOf(path)]).forEach(([path, src]) => {
      visibleLines(src).forEach((line, i) => BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 90)}`).toBe(false)));
    });
  });
  it('every peer-sheet classmate of THIS unit has a first name used by no other 4AM peer sheet', () => {
    const names = Object.values(peers).map((m) => m.PEER_KID?.name).filter(Boolean);
    const ours = Object.values(unitPeers).map((m) => m.PEER_KID?.name).filter(Boolean);
    ours.forEach((n) => expect(names.filter((x) => x === n), n).toHaveLength(1));
  });
});
