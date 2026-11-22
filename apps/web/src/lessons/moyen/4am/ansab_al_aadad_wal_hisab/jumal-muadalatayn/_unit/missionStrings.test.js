import { describe, it, expect } from 'vitest';
import { showsAny, visibleLines } from './forbiddenShared.js';
import i18n from '../../../../../../i18n/locales/ar/lesson.manipulation.json';

/**
 * Unité 5 « جمل معادلتين » — ce que l'élève LIT de la mission, de la carte des معارف et des données du manuel (squelette du commit 0 du
 * 2026-11-11 ; modèle : l'unité 4, muadalat-mutarajihat/_unit/missionStrings.test.js). Les signatures viennent de `_unit/signatures/<leçon>.js`,
 * une par leçon (écrite par son constructeur ; contrat : `signatures/README.md`) :
 *   - aucun caractère de contrôle dans un point d'étape ni dans l'ouverture ;
 *   - les cartes de connaissance et la carte des معارف ne montrent pas la solution de la مسألة de LEUR leçon ;
 *   - le manuel que l'élève lit ne dit ni « الكتاب », ni « تمرين N : », ni « خطأً مطبعيًا » ;
 *   - LA DISTRIBUTION (verdict X1) : chaque « ورقة زميل » porte le prénom et l'id de SA leçon, un prénom UNIQUE parmi les « ورقة زميل » de la
 *     plateforme ; aucun autre prénom connu n'apparaît dans une manche, un point d'étape, un item de « أستعدّ » ou une feuille de camarade.
 */
const sigFiles = import.meta.glob('./signatures/*.js', { eager: true });
const configs = import.meta.glob('../*/lesson.config.js', { eager: true });
const raw = import.meta.glob(['../*/knowledge.jsx', '../*/knowledgeGraph.js', '../*/content/textbook.js', '../*/content/exercises.js'], { eager: true, query: '?raw', import: 'default' });
const textbooks = import.meta.glob('../*/content/textbook.js', { eager: true });
// le contenu d'avant la مسألة qu'écrit un constructeur (manches, échelle « أستعدّ », feuille de camarade…) — pas la مسألة, ni les exercices, ni le manuel
const ownContent = import.meta.glob(['../*/content/*.js', '!../*/content/*.test.js', '!../*/content/problems.js', '!../*/content/exercises.js', '!../*/content/textbook.js', '!../*/content/forbidden.js'], { eager: true, query: '?raw', import: 'default' });
const peers = import.meta.glob('../../../../**/content/peerSheet.js', { eager: true });
const unitPeers = import.meta.glob('../*/content/peerSheet.js', { eager: true });
const CONTROL = /[\t\n\r\f\v\b]/;
const BOOK = [/الكتاب(?!ة)/, /تمرين\s*\d+\s*:/, /خطأً? مطبعي/];
const lessonOf = (path) => path.split('/')[1];
const CLIMAX = Object.fromEntries(Object.entries(sigFiles).map(([p, m]) => [p.replace(/^.*\/(.+)\.js$/, '$1'), m.TEXT ?? []]));

/* ── La distribution de l'unité (verdict X1) ── */
const PEERS = { 'mafhum-jumla': { name: 'صهيب', id: 'm2-suhayb' }, 'hall-jabri': { name: 'أسامة', id: 'm2-usama' }, 'mushkilat-jumla': { name: 'وئام', id: 'm2-wiam' }, 'wadiya-idmajiya-jumal': { name: 'عائشة', id: 'm7-aisha' } };
const PUPILS = { 'hall-jabri': ['إكرام', 'إسحاق'] };            // module 1 de hall-jabri seulement (auteurs des cartes-devinettes)
const RESERVED = ['ملاك'];                                       // la page d'unité seulement
const CLIMAX_NAMES = ['الطاهر', 'ياسين', 'أنيس'];                  // la مسألة de hall-jabri, nulle part ailleurs
const LAB_KEYS = { 'mafhum-jumla': 'pairScoreboard', 'hall-jabri': 'eliminationCards', 'mushkilat-jumla': 'storyModeller' };
const CAST = new Set([...Object.values(PEERS).map((p) => p.name), ...Object.values(PUPILS).flat(), ...RESERVED]);
// les prénoms connus de la plateforme : chaque camarade d'une « ورقة زميل » + la distribution de l'unité 4 ; ceux de l'unité 5 exceptés
const UNIT4_CAST = ['أيوب', 'خديجة', 'نسيم', 'كوثر', 'حاتم', 'بسّام', 'هدى', 'عماد', 'لقمان', 'شيماء'];
const OTHER_NAMES = [...new Set([...Object.values(peers).map((m) => m.PEER_KID?.name).filter(Boolean), ...UNIT4_CAST])]
  .filter((n) => !CAST.has(n) && !CLIMAX_NAMES.includes(n));
const word = (n) => new RegExp(`(^|[^\\u0600-\\u06FF])(و|ف|ل|ب)?${n}(?![\\u0600-\\u06FF])`);

/** Les textes d'avant la مسألة, leçon par leçon : points d'étape, ouverture, « أستعدّ » du manuel, contenu propre, bloc i18n du lecteur. */
const sourcesOf = (id) => {
  const cfg = configs[`../${id}/lesson.config.js`]?.LESSON_CONFIG;
  const tb = textbooks[`../${id}/content/textbook.js`] ?? {};
  const lab = i18n[LAB_KEYS[id]] ?? {};
  return [
    ...(cfg?.mission?.checkpoints ?? []).map((cp) => [`${id} ${cp.id}`, [cp.prompt, ...(cp.options ?? []), cp.explain].join(' ')]),
    ...[...(tb.PREP_ITEMS ?? []), ...(tb.PREP_PLATFORM_ITEMS ?? [])].map((it, i) => [`${id} prep ${i + 1}`, `${it.text} ${it.why}`]),
    ...Object.entries(ownContent).filter(([p]) => lessonOf(p) === id).map(([p, src]) => [p, visibleLines(src).join('\n')]),
    [`i18n ${LAB_KEYS[id]}.player/coach/predict`, JSON.stringify([lab.player, lab.coach, lab.predict])],
  ];
};
const OPENING = (id) => configs[`../${id}/lesson.config.js`]?.LESSON_CONFIG?.mission?.opening?.text ?? '';

describe('unit 5 — mission strings and knowledge maps', () => {
  it('found the lessons', () => {
    expect(Object.keys(configs).length).toBeGreaterThanOrEqual(4);
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
    Object.entries(raw).filter(([path]) => CLIMAX[lessonOf(path)]?.length).forEach(([path, src]) => {
      visibleLines(src).forEach((line, i) => BOOK.forEach((re) => expect(re.test(line), `${path}:${i + 1} ${re} — ${line.trim().slice(0, 90)}`).toBe(false)));
    });
  });
});

describe('unit 5 — the cast (verdict X1)', () => {
  it('each peer sheet is its lesson\'s: صهيب (mafhum-jumla), أسامة (hall-jabri), وئام (mushkilat-jumla)', () => {
    Object.entries(unitPeers).forEach(([path, m]) => {
      const want = PEERS[lessonOf(path)];
      expect(want, `${path}: a peer sheet outside the three lessons`).toBeTruthy();
      expect(m.PEER_KID?.name, path).toBe(want.name);
      expect(m.PEER_SHEET?.id, path).toBe(want.id);
    });
  });
  it('every peer-sheet classmate of THIS unit has a first name used by no other peer sheet of the platform', () => {
    const names = Object.values(peers).map((m) => m.PEER_KID?.name).filter(Boolean);
    const ours = Object.values(unitPeers).map((m) => m.PEER_KID?.name).filter(Boolean);
    ours.forEach((n) => expect(names.filter((x) => x === n), n).toHaveLength(1));
    // and the cast is free TODAY outside this unit
    // Vite keys this unit's own sheets `../<lesson>/content/peerSheet.js` in BOTH globs (never with `/jumal-muadalatayn/`),
    // so « outside » is every sheet that is not one of `unitPeers`.
    const outside = Object.entries(peers).filter(([p]) => !(p in unitPeers) && !p.includes('/jumal-muadalatayn/')).map(([, m]) => m.PEER_KID?.name);
    Object.values(PEERS).forEach(({ name }) => expect(outside, name).not.toContain(name));
  });
  it('before the climax, a lesson names only its own cast: no reserved name, no climax name, no name of another lesson or unit', () => {
    Object.keys(PEERS).forEach((id) => {
      const mine = new Set([PEERS[id].name, ...(PUPILS[id] ?? [])]);
      const banned = [...OTHER_NAMES, ...RESERVED, ...CLIMAX_NAMES, ...[...CAST].filter((n) => !mine.has(n) && !RESERVED.includes(n))];
      sourcesOf(id).forEach(([where, text]) => banned.forEach((n) => expect(word(n).test(text), `${where} names « ${n} »`).toBe(false)));
      [...OTHER_NAMES, ...RESERVED].forEach((n) => expect(word(n).test(OPENING(id)), `${id} opening names « ${n} »`).toBe(false));
    });
  });
  it('the name scan fires (negative control)', () => {
    expect(word('إكرام').test('أخفت إكرام عددين')).toBe(true);
    expect(word('ملاك').test('قدّمت ملاك التحدّي')).toBe(true);
    expect(word('أنيس').test('مصروف لأنيس')).toBe(true);
    expect(word('هدى').test('اهتدى')).toBe(false);
    expect(OTHER_NAMES).toContain('شيماء');
    expect(OTHER_NAMES).not.toContain('صهيب');
  });
});
