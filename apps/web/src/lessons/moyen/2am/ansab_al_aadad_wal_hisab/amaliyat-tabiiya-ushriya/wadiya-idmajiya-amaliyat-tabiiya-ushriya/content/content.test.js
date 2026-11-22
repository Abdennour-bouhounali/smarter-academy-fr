import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION, HISTORY, RECALL } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_2am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import tahlil from '../modules/Module07TahlilWadiya.jsx?raw';
import knowledge from '../knowledge.jsx?raw';

/* Contrôle INDÉPENDANT : entiers et décimaux exacts en BigInt (× 10²), aucune importation de packages/core. */
const C = (s) => { const [i, f = ''] = String(s).split('.'); return BigInt(i + (f + '00').slice(0, 2)); }; // centièmes
const get = (id) => FINAL.find((e) => e.id === id);
const STOCK = { planks: 45, corners: 26, screws: 120 };
const KIT = { planks: 6, corners: 4, screws: 16 };
const whole = (s, k) => Math.floor(s / k);

describe('« أدمج تعلّماتي — العمليات على الأعداد الطبيعية والأعداد العشرية » — le test final (clés recalculées)', () => {
  const n = {
    planks: whole(STOCK.planks, KIT.planks), corners: whole(STOCK.corners, KIT.corners), screws: whole(STOCK.screws, KIT.screws),
  };
  const houses = Math.min(n.planks, n.corners, n.screws);

  it('E1 — 45 ÷ 6 = 7,5 ; 26 ÷ 4 = 6,5 ; 120 ÷ 16 = 7,5 : parties entières 7, 6, 7 ; les distracteurs sont faux', () => {
    expect(STOCK.planks * 10 / KIT.planks).toBe(75); expect(STOCK.corners * 10 / KIT.corners).toBe(65); expect(STOCK.screws * 10 / KIT.screws).toBe(75);
    expect([n.planks, n.corners, n.screws]).toEqual([7, 6, 7]);
    expect(get('E1').options[0]).toBe('$7$ ؛ $6$ ؛ $7$');
    expect(get('E1').options[1]).toBe('$8$ ؛ $7$ ؛ $8$'); // arrondi vers le haut : 8 > 7,5
    expect([Math.ceil(7.5), Math.ceil(6.5), Math.ceil(7.5)]).toEqual([8, 7, 8]);
    expect(get('E1').options[2]).toBe('$7{,}5$ ؛ $6{,}5$ ؛ $7{,}5$');
    expect([STOCK.planks - KIT.planks, STOCK.corners - KIT.corners, STOCK.screws - KIT.screws]).toEqual([39, 22, 104]); // soustraction au lieu de division
    expect(get('E1').options[3]).toBe('$39$ ؛ $22$ ؛ $104$');
  });

  it('E2 — le plus petit des trois : 6 nichoirs ; 7 (le plus grand), 13 (7 + 6), 20 (7 + 6 + 7) sont faux', () => {
    expect(houses).toBe(6);
    expect(Math.max(n.planks, n.corners, n.screws)).toBe(7);
    expect(n.planks + n.corners).toBe(13);
    expect(n.planks + n.corners + n.screws).toBe(20);
    expect(get('E2').options).toEqual(['$6$', '$7$', '$13$', '$20$']);
    // 7 nichoirs manquent d'équerres : 28 > 26
    expect(7 * KIT.corners > STOCK.corners).toBe(true);
  });

  it('E3 — il reste 9 planches, 2 équerres, 24 vis (6 nichoirs) ; 3 / 8 viennent de 7 nichoirs (équerres insuffisantes) ; 36 / 24 / 96 sont l\'utilisé', () => {
    expect([STOCK.planks - houses * KIT.planks, STOCK.corners - houses * KIT.corners, STOCK.screws - houses * KIT.screws]).toEqual([9, 2, 24]);
    expect([STOCK.planks - 7 * KIT.planks, STOCK.screws - 7 * KIT.screws]).toEqual([3, 8]);
    expect(STOCK.corners - 7 * KIT.corners).toBeLessThan(0);
    expect([houses * KIT.planks, houses * KIT.corners, houses * KIT.screws]).toEqual([36, 24, 96]);
    expect(get('E3').options[0]).toBe('$9$ ألواح ، وزاويتان ، و $24$ برغيًا');
    expect(get('E3').options[3]).toBe('$36$ لوحًا ، و $24$ زاوية ، و $96$ برغيًا');
  });

  it('E4 — 6 × 450 − (6 × 85 + 120) = 2070 ; sans parenthèses 2310 ; 6 × (450 − 85 + 120) = 2910 ; 6 × 450 − 85 + 120 = 2735', () => {
    expect(6 * 450 - (6 * 85 + 120)).toBe(2070);
    expect(6 * 450 - 6 * 85 + 120).toBe(2310);
    expect(6 * (450 - 85 + 120)).toBe(2910);
    expect(6 * 450 - 85 + 120).toBe(2735);
    expect(6 * 450 - 6 * 85 - 120).toBe(2070); // la bonne valeur aussi sans parenthèses, mais on n'offre pas cette écriture comme fausse
    expect(get('E4').options.map((o) => o.split('=').pop().trim().replace(/\$/g, ''))).toEqual(['2070', '2310', '2910', '2735']);
  });

  it('E5 — 7 × 4 − 26 = 2 équerres à acheter ; 4, 1 et 28 sont faux', () => {
    expect(7 * 4 - 26).toBe(2);
    expect([4, 1, 28]).not.toContain(2);
    expect(get('E5').options).toEqual(['زاويتين', '4 زوايا', 'زاوية واحدة', '28 زاوية']);
  });

  it('chaque épreuve : quatre options distinctes, la bonne en tête, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['2am_wadiya-idmajiya-amaliyat-tabiiya-ushriya_P1'\]/g) ?? []).length).toBe(5);
  });

  it('la situation : cinq données utiles, deux inutiles, trois étapes ; le module 7 ne montre aucune valeur de la solution ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(5);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, HISTORY.text]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+|فهرنهايت/);
    const seen = JSON.stringify(SITUATION.analysis) + JSON.stringify(SITUATION.data) + tahlil + knowledge;
    for (const v of ['7{,}5', '6{,}5', '2070', '2 070', '2310', '9 ألواح', '24 برغيًا']) expect(seen, v).not.toContain(v);
    expect(RECALL.map((r) => r.lesson)).toEqual(LESSON_CONFIG.priorKnowledge.map((p) => p.replace(/-2am$/, '')));
  });

  it('أستعدّ — six affirmations, deux réponses différentes, les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([false, true, true, false, false, true]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    expect(40 - 15 + 5).toBe(30); expect(40 - 15 + 5 === 20).toBe(false);
    expect(3 + 5 * 2).toBe(13);
    expect((18 + 6) / (4 - 1)).toBe(8);
    expect((9 - 4) * 6).toBe(30); // jamais une différence : l'opération finale est le produit
    expect(8 * (5 + 0.5)).toBe(44); expect(40 + 0.5).not.toBe(44);
    expect(99 * 6).toBe(594); expect(600 - 6).toBe(594);
    expect(C('0.5')).toBe(50n);
  });

  it('la configuration : synthèse de l\'unité, neuf modules, une seule الكفاءة, le catalogue est publié', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'amaliyat-tabiiya-ushriya', grade: '2am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-amaliyat-tabiiya-ushriya');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [] });
    expect(entry.pointsToLearn.length).toBe(1);
    expect(entry.durationMinutes).toBeLessThanOrEqual(90);
    expect(entry.prerequisiteLessonCodes).toEqual(['silsila-bidun-aqwas', 'silsila-bi-aqwas', 'wasf-silsila-hisab', 'tawzi-darb-jam-tarh']);
    expect(entry.pointPrerequisites).toEqual({ P1: ['2am_silsila-bidun-aqwas_P3', '2am_silsila-bi-aqwas_P3', '2am_wasf-silsila-hisab_P3', '2am_tawzi-darb-jam-tarh_P4'] });
  });
});
