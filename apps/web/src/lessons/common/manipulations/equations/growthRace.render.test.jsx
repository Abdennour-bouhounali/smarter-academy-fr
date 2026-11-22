import { it, expect, describe } from 'vitest';
import { renderToString } from 'react-dom/server';
import '../../../../i18n';
import i18n from '../../../../i18n';
import GrowthRace, { BUILD_CHAIN, RACE_CHAINS, QUESTIONS, raceOptions, RaceFormal } from './GrowthRace';
import * as L from '../logic/growthRace';

/**
 * growth-race se rend pour les DEUX thèmes (âges : la leçon ترييض مشكلة ; piscine : la
 * synthèse) et pour chaque forme d'expression du contrat (somme d'âges, groupe k(…),
 * tarifs + abonnement), sans clé i18n brute ni texte latin hors des formules.
 */
const CASES = [
  { left: '36+x', right: '4+x+6+x+8+x', theme: 'ages', goal: 'equal', expect: ['الأب', 'الابن الثاني', 'مجموع أعمار الأبناء'] },
  { left: '30+x', right: '2(6+x)', theme: 'ages', goal: 'equal', expect: ['الابن', 'ضعف عمر الابن'] },
  { left: '43+x', right: '2(4+x+7+x)', theme: 'ages', goal: 'equal', expect: ['ضعف مجموع أعمار الأبناء'] },
  { left: '75x', right: '560+5x', theme: 'pool', goal: 'greater', expect: ['الصيغة 1', 'الصيغة 2', 'الاشتراك السنوي', 'تذكرة الحصّة'] },
];

it('les deux thèmes se rendent, dans l’étape « construire », avec les mots de l’histoire', () => {
  for (const c of CASES) {
    const html = renderToString(<GrowthRace left={c.left} right={c.right} theme={c.theme} goal={c.goal} />);
    expect(html, c.left).toContain('data-growth-race');
    expect(html).toContain('data-stage="build"');
    expect(html).toContain(`data-theme="${c.theme}"`);
    expect(html).toContain('data-gr-token');
    for (const w of c.expect) expect(html, `${c.left}: ${w}`).toContain(w);
    expect(html).not.toMatch(/manipulation\.growthRace\./);
    expect(html).toContain('data-decor');
  }
});

it('un thème qui contredit l’opération cède au bon (des tarifs restent une piscine)', () => {
  const html = renderToString(<GrowthRace left="75x" right="560+5x" theme="ages" goal="greater" />);
  expect(html).toContain('data-theme="pool"');
  expect(html).toContain('data-op="mul"');
});

it('le contexte de la leçon remplace les mots du thème', () => {
  const html = renderToString(<GrowthRace left="75x" right="560+5x" theme="pool" goal="greater" context={{ leftTitle: 'تذاكر فقط', names: { R0: 'بطاقة السنة' } }} />);
  expect(html).toContain('تذاكر فقط');
  expect(html).toContain('بطاقة السنة');
});

it('« startWith="race" » épingle la course : la règle, les colonnes, la lecture du manuel', () => {
  for (const c of CASES) {
    const html = renderToString(<GrowthRace left={c.left} right={c.right} theme={c.theme} goal={c.goal} startWith="race" />);
    expect(html, c.left).toContain('data-stage="race"');
    expect(html).toContain('data-gr-ruler');
    expect(html).toContain('data-gr-columns');
    expect(html).toContain('data-gr-back');
    expect(html).not.toMatch(/manipulation\.growthRace\./);
  }
  // à x = 0 : le père 36, les enfants 4 + 6 + 8 = 18
  const html = renderToString(<GrowthRace startWith="race" />);
  expect(html).toContain('data-rel="&gt;"');
  expect(html).toContain('36 سنة');
});

it('growth-race : la course s\'ouvre sur un x par défaut, sans essai enregistré', () => {
  const html = renderToString(<GrowthRace left="36+x" right="4+x+6+x+8+x" startWith="race" />);
  expect(html).toContain('data-gr-x');
  expect(html).not.toContain('data-trial-x=');
});

const RAW = /manipulation\.[a-zA-Z]/;
const k = (key, o) => i18n.t(`lesson:manipulation.growthRace.${key}`, o);

/** Le contexte que le composant construit pour ses questions : titres, thème, solution, options de la règle. */
function ctxOf(lab, goal, maxX) {
  const model = lab.model;
  const themeId = model.op === 'mul' ? 'pool' : 'ages';
  const tw = (key, o) => i18n.t(`lesson:manipulation.growthRace.themes.${themeId}.${key}`, o);
  const range = L.xRange(model, maxX);
  const c = {
    lab, model, range, goal, ans: L.answer(model, goal), kind: L.discoveryKind(model, range), sol: L.solution(model), k, tw,
    titleL: model.op === 'mul' ? tw('leftTitle') : tw('leftTitle'), titleR: model.op === 'mul' ? tw('rightTitle') : tw('rightMany'),
    unitsLabel: (n) => tw('units', { count: n }),
  };
  c.options = raceOptions(c);
  c.formal = <RaceFormal c={c} />;
  return c;
}

/** Un labo « fini » : modèle vérifié, course ouverte, essais autour de la rencontre (ou trois essais dont 0). */
function finished(left, right) {
  let lab = L.init(left, right);
  lab = L.check({ ...lab, carried: L.storyCarried(lab.model) });
  lab = L.openRace(lab);
  const range = L.xRange(lab.model);
  const sol = L.solution(lab.model);
  const s = sol.x != null ? Math.floor(L.toNumber(sol.x)) : 0;
  const xs = [0, s - 1, s, s + 1, s + 2, 1, 2].filter((v) => v >= 0 && v <= range.max);
  xs.forEach((v) => { lab = L.commitTrial(lab, v); });
  return lab;
}

const RACES = [
  ['36+x', '4+x+6+x+8+x', 'equal'], ['30+x', '2(6+x)', 'equal'], ['43+x', '2(4+x+7+x)', 'equal'],
  ['36+x', '3(14+x)', 'equal'], ['75x', '560+5x', 'greater'], ['50x', '200+10x', 'greater'],
];

describe('growth-race — questions pendant le labo (LabCheckpoint)', () => {
  for (const [left, right, goal] of RACES) {
    it(`${left} / ${right} : chaque question a un texte, deux indices, une seule bonne réponse, ni clé brute ni {{`, () => {
      const lab = finished(left, right, goal);
      const c = ctxOf(lab, goal);
      expect(L.discoveryReady(lab, c.range), `${left}|${right}`).toBe(true);
      const kind = c.kind === 'meet' ? (goal !== 'equal' && c.ans.toInfinity && c.ans.first != null ? 'first' : 'meet') : c.kind;
      const ids = [...BUILD_CHAIN, ...RACE_CHAINS[kind]];
      for (const qid of ids) {
        const q = QUESTIONS[qid](lab, k, c);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${left}|${right}.${qid}`).not.toMatch(RAW);
        expect(out, `${left}|${right}.${qid}`).not.toContain('{{');
        expect(out, `${left}|${right}.${qid}`).not.toMatch(/\$/);   // aucun « $ » orphelin (un $…$ imbriqué)
        expect(q.hints, `${left}|${right}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') expect(q.options.filter((o) => o.correct), `${left}|${right}.${qid}`).toHaveLength(1);
        else expect(q.expected, `${left}|${right}.${qid}`).toBeTruthy();
      }
    });
  }

  it('les nombres viennent des cartes : 36 + x contre 4 + x + 6 + x + 8 + x se croisent à 9 (pentes 1 et 3)', () => {
    const lab = finished('36+x', '4+x+6+x+8+x');
    const c = ctxOf(lab, 'equal');
    expect(QUESTIONS.slopeLeft(lab, k, c).expected).toBe('1');
    expect(QUESTIONS.slopeRight(lab, k, c).expected).toBe('3');
    expect(QUESTIONS.where(lab, k, c).expected).toBe('9');
    expect(QUESTIONS.faster(lab, k, c).options.map((o) => !!o.correct)).toEqual([false, true, false]);
    const g = ctxOf(finished('75x', '560+5x', 'greater'), 'greater');
    expect(QUESTIONS.first(finished('75x', '560+5x', 'greater'), k, g).expected).toBe('9');
  });
});

describe('growth-race — mode guidé (les questions remplacent جرّب › اكتشف › صِغ et تلميح)', () => {
  it('avec questions : ni la progression ni le bouton d’indice ; checkpoints={false} : les deux reviennent', () => {
    const g = renderToString(<GrowthRace left="36+x" right="4+x+6+x+8+x" />);
    expect(g).not.toContain('data-manipulation-progress');
    expect(g).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(g).toContain('data-gr2-step');
    const off = renderToString(<GrowthRace left="36+x" right="4+x+6+x+8+x" checkpoints={false} />);
    expect(off).toContain('data-manipulation-progress');
    expect(off).toContain(i18n.t('lesson:manipulation.hint.show'));
  });
});
