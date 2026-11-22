import { describe, it, expect } from 'vitest';
import { FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, SITUATION, REMARKS } from './textbook';
import { LESSON_CONFIG } from '../lesson.config';
import catalogue from '../../../../../../../../../../packages/core/curriculum/dz/lessons_2am_2026_2027.json';
import units from '../../../../../../../../../../packages/core/curriculum/dz/units_2am_2026_2027.json';
import ahill from '../modules/Module08Ahill.jsx?raw';
import astaidd from '../modules/Module00Astaidd.jsx?raw';
import tahlil from '../modules/Module07TahlilWadiya.jsx?raw';

/* Contrôle INDÉPENDANT : relatifs décimaux exacts en BigInt (centièmes). */
const D = (v) => {
  let s = String(v).replace('−', '-'); const neg = s.startsWith('-'); s = s.replace(/^[-+]/, '');
  const [i, f = ''] = s.split('.');
  const r = BigInt(i) * 100n + BigInt((f + '00').slice(0, 2));
  return neg ? -r : r;
};
const abs = (x) => (x < 0n ? -x : x);
const MIN = ['-3', '-5.5', '1', '-0.5', '-2'].map(D);
const MAX = ['6', '4.5', '9', '7.5', '5'].map(D);
const asc = (xs) => [...xs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

describe('« أدمج تعلّماتي — الأعداد النسبية » — le test final (clés recalculées)', () => {
  const get = (id) => FINAL.find((e) => e.id === id);
  const changes = MIN.slice(1).map((m, i) => m - MIN[i]);

  it('E1 — l\'ordre croissant des minimales ; les trois autres listes sont FAUSSES et portent leur erreur', () => {
    const key = asc(MIN);
    expect(key).toEqual(['-5.5', '-3', '-2', '-0.5', '1'].map(D));
    const byDistance = [...MIN.filter((x) => x < 0n)].sort((a, b) => (abs(a) < abs(b) ? -1 : 1)).concat(MIN.filter((x) => x >= 0n)); // négatifs par distance croissante : BDG
    expect(byDistance).toEqual(['-0.5', '-2', '-3', '-5.5', '1'].map(D));
    expect(byDistance).not.toEqual(key);
    expect([...key].reverse()).toEqual(['1', '-0.5', '-2', '-3', '-5.5'].map(D)); // OD
    expect(get('E1').options[0]).toBe('$-5{,}5 < -3 < -2 < -0{,}5 < +1$');
    expect(get('E1').options[1]).toBe('$-0{,}5 < -2 < -3 < -5{,}5 < +1$');
    expect(get('E1').options[2]).toBe('$+1 < -0{,}5 < -2 < -3 < -5{,}5$');
    expect(['-2', '-3', '-0.5', '-5.5', '1'].map(D)).not.toEqual(key);
  });

  it('E2 — l\'écart du jour 2 est 10 ; 1, −10 et −1 sont faux', () => {
    const lo = MIN[1]; const hi = MAX[1];
    expect(hi - lo).toBe(D('10'));
    expect(abs(lo) - abs(hi)).toBe(D('1')); // SUBDIST : 5,5 − 4,5
    expect(lo - hi).toBe(D('-10')); // NEGDIST
    expect(hi - abs(lo)).toBe(D('-1')); // ORDERSWAP : 4,5 − 5,5
    for (const wrong of ['1', '-10', '-1']) expect(D(wrong)).not.toBe(hi - lo);
    expect(get('E2').options.slice(1)).toEqual(['$5{,}5-4{,}5=1$', '$(-5{,}5)-(+4{,}5)=-10$', '$4{,}5-5{,}5=-1$']);
  });

  it('E3 — le changement du jour 2 au jour 3 est +6,5 ; −6,5, −4,5 et +4,5 sont faux', () => {
    expect(MIN[2] - MIN[1]).toBe(D('6.5'));
    expect(MIN[1] - MIN[2]).toBe(D('-6.5')); // REVERSED
    expect(MIN[2] + MIN[1]).toBe(D('-4.5')); // SUBNOFLIP
    expect(abs(MIN[1]) - abs(MIN[2])).toBe(D('4.5')); // distances soustraites
    for (const wrong of ['-6.5', '-4.5', '4.5']) expect(D(wrong)).not.toBe(MIN[2] - MIN[1]);
  });

  it('E4 — les changements −2,5, +6,5, −1,5, −1,5 ; leur somme +1 = (−2) − (−3) ; −1, −12 et +12 sont faux', () => {
    expect(changes).toEqual(['-2.5', '6.5', '-1.5', '-1.5'].map(D));
    const total = changes.reduce((a, b) => a + b, 0n);
    expect(total).toBe(D('1'));
    expect(total).toBe(MIN[4] - MIN[0]); // la dernière moins la première
    expect(MIN[0] - MIN[4]).toBe(D('-1'));
    expect(changes.reduce((t, c) => t - abs(c), 0n)).toBe(D('-12')); // ALLNEG
    expect(changes.reduce((t, c) => t + abs(c), 0n)).toBe(D('12'));
    for (const wrong of ['-1', '-12', '12']) expect(D(wrong)).not.toBe(total);
    expect(get('E4').text).toContain('$-2{,}5$ ثمّ $+6{,}5$ ثمّ $-1{,}5$ ثمّ $-1{,}5$');
  });

  it('E5 — la minimale du jour 4 est −0,5 : le point (4 ; −0,5), sous l\'axe des abscisses ; les trois autres sont faux', () => {
    expect(MIN[3]).toBe(D('-0.5'));
    expect(get('E5').options[0]).toBe('$(4\\,;\\,-0{,}5)$ ، تحت محور الفواصل');
    expect(get('E5').options[1]).toContain('(-0{,}5\\,;\\,4)'); // SWAP
    expect(get('E5').options[2]).toContain('(4\\,;\\,0{,}5)'); // SIGNAXIS
    expect(get('E5').options[3]).toContain('(-4\\,;\\,-0{,}5)'); // SIGNLEFT
    expect(MIN[3] < 0n).toBe(true);
  });

  it('chaque épreuve : quatre options, la bonne en tête, toutes distinctes, et le module 8 contient exactement ces options', () => {
    expect(FINAL.length).toBe(5);
    for (const e of FINAL) {
      expect(e.options.length).toBe(4);
      expect(e.correct).toBe(0);
      for (const o of e.options) expect(ahill, `${e.id} ${o}`).toContain(o.replace(/\\/g, '\\\\'));
      expect(new Set(e.options).size).toBe(4);
    }
    expect((ahill.match(/learningPointIds: \['2am_wadiya-idmajiya-adad-nisbiya-2_P1'\]/g) ?? []).length).toBe(5);
  });

  it('la situation : six données utiles, deux inutiles, trois étapes ; le module 7 ne montre aucune valeur de la solution ; aucune ligne ne renvoie au manuel', () => {
    expect(SITUATION.data.filter((d) => d.useful).length).toBe(6);
    expect(SITUATION.data.filter((d) => !d.useful).length).toBe(2);
    expect(SITUATION.analysis.length).toBe(3);
    // la situation porte les dix relevés
    for (const v of ['-3', '-5{,}5', '+1', '-0{,}5', '-2', '+6', '+4{,}5', '+9', '+7{,}5', '+5']) expect(SITUATION.text).toContain(`$${v}$`);
    const visible = JSON.stringify([SITUATION, FINAL, PREP_ITEMS, PREP_PLATFORM_ITEMS, REMARKS]);
    expect(visible).not.toMatch(/الكتاب(?!ة)|(^|[^ء-ي])ص\.?\s*\d+/);
    expect(visible).not.toMatch(/خنزير|🐷|خمر|قمار|ميسر|(^|[^ء-ي])(ربا|ساحر|سحر|نرد)([^ء-ي]|$)|فائدة|فوائد|قرض|ورق اللعب/);
    const seen = JSON.stringify(SITUATION) + JSON.stringify(REMARKS) + tahlil;
    for (const v of ['6{,}5', '2{,}5', '-1{,}5', '=10', '$10$', '(4\\\\,;\\\\,-0{,}5)', '+1$ ، تحت']) expect(seen).not.toContain(v);
  });

  it('أستعدّ — six affirmations, les réponses [✓ ✓ ✗ ✓ ✓ ✗], les clés recalculées', () => {
    const all = [...PREP_PLATFORM_ITEMS, ...PREP_ITEMS];
    expect(all.length).toBe(6);
    expect(all.map((i) => i.answer)).toEqual([true, true, false, true, true, false]);
    expect((astaidd.match(/\.\.\.prepQuestion\(/g) ?? []).length).toBe(6);
    expect(-(4n * 5n)).toBe(-20n);
    expect(abs(D('-3.5')) > abs(D('-3.05')) && D('-3.5') < D('-3.05')).toBe(true);
    expect(D('-6') + D('2.5')).toBe(D('-3.5'));
    expect(D('-7') + D('3') + D('-5') + D('9')).toBe(0n);
    expect(abs(D('4') - D('-3'))).toBe(D('7'));
    // (−2 ; 0) a pour ordonnée 0 : il est sur l'axe des abscisses
    expect(PREP_PLATFORM_ITEMS[2].text).toContain('(-2\\,;\\,0)');
  });

  it('la configuration : synthèse de l\'unité, neuf modules, un seul LP, le catalogue est publié, le تحدّي de l\'unité est celui de la plateforme', () => {
    expect(LESSON_CONFIG).toMatchObject({ kind: 'synthesis', unit: 'adad-nisbiya-2', grade: '2am' });
    expect(LESSON_CONFIG.modules.length).toBe(9);
    expect(LESSON_CONFIG.skills.length).toBe(1);
    expect(LESSON_CONFIG.skills[0].length).toBeLessThanOrEqual(255);
    const entry = catalogue.lessons.find((l) => l.code === 'wadiya-idmajiya-adad-nisbiya-2');
    expect(entry).toMatchObject({ status: 'available', kind: 'synthesis', programmeItems: [], durationMinutes: 30, difficulty: 'متقدم' });
    expect(entry.pointsToLearn).toEqual(LESSON_CONFIG.skills);
    expect(entry.prerequisiteLessonCodes).toEqual(['talim-mustaqim-mudarraj-2', 'muqarana-nisbiya', 'talim-nuqta-mustawi', 'jam-tarh-nisbiya', 'masafa-nuqtatayn', 'majmu-jabri']);
    expect(entry.pointPrerequisites.P1).toEqual(['2am_talim-mustaqim-mudarraj-2_P2', '2am_muqarana-nisbiya_P3', '2am_talim-nuqta-mustawi_P3', '2am_jam-tarh-nisbiya_P3', '2am_majmu-jabri_P2', '2am_masafa-nuqtatayn_P1']);
    // chaque الكفاءة citée existe dans le catalogue
    for (const id of entry.pointPrerequisites.P1) {
      const [, code, p] = /^2am_(.+)_P(\d)$/.exec(id);
      expect(catalogue.lessons.find((l) => l.code === code).pointsToLearn.length, id).toBeGreaterThanOrEqual(Number(p));
    }
    const unit = units.units.find((u) => u.code === 'adad-nisbiya-2');
    expect(unit.challenge.textAr).toContain('شطّ ملغيغ');
    expect(unit.challenge.textAr).not.toContain('البحيرات العظمى');
  });

  it('le تحدّي : 2948 m, 592 m et 3540 m, −200 m (recalculés)', () => {
    expect(D('2908') - D('-40')).toBe(D('2948'));
    expect(D('3500') - D('2908')).toBe(D('592')); expect(D('3500') - D('-40')).toBe(D('3540'));
    expect(D('-40') - D('160')).toBe(D('-200'));
  });
});
