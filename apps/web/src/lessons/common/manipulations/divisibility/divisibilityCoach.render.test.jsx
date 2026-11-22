import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import DivisorExplorer from './DivisorExplorer';
import DivisorExplorerBooks from './DivisorExplorerBooks';
import TeamBuilder from './TeamBuilder';
import FactorPairs from './FactorPairs';
import DivisorProperties from './DivisorProperties';
import CommonDivisors from './CommonDivisors';
import { LEVELS } from '../levels';

/**
 * LabCoach sur les six labos de la divisibilité (MANIPULATION_CONTRACT §8quater) : l'interrupteur est sous la consigne et avant la
 * scène, la couche est dans le cadre, `coach={false}` éteint tout, et chaque astuce existe, sans clé brute ni interpolation oubliée,
 * et ne dit jamais la règle à découvrir.
 */
const RAW = /manipulation\.[a-zA-Z]/;
const html = (C, props) => renderToString(<C {...props} />);
const say = (path, o) => i18n.t(`lesson:manipulation.${path}`, o);

const LABS = [
  { name: 'divisor-explorer', C: DivisorExplorer, ns: 'divisorExplorer', props: { ...LEVELS['divisor-explorer'].beginner.numbers, candidates: LEVELS['divisor-explorer'].beginner.candidates, a: 24 },
    steps: ['size', 'again'], rule: /قاسم|يقسم|الباقي|لا يبقى|معدوم/ },
  { name: 'divisor-explorer-books', C: DivisorExplorerBooks, ns: 'bookshelf', props: { total: 24, min: 2, max: 12 },
    steps: ['handle', 'nudge'], rule: /قاسم|يقسم|الأرض|فارغ|معدوم/ },
  { name: 'team-builder', C: TeamBuilder, ns: 'teamBuilder', props: {},
    steps: ['place', 'more', 'teams', 'free'], rule: /بالتساوي|متساوي|قاسم|يقسم|معدوم/ },
  { name: 'factor-pairs', C: FactorPairs, ns: 'factorPairs', props: { n: 24 },
    steps: ['handle', 'nudge'], rule: /مستطيل|مربّع|قاسم|جذر|زوج/ },
  { name: 'divisor-properties', C: DivisorProperties, ns: 'props', props: { n: 3, a: 18, b: 12 },
    steps: ['predict', 'carry', 'carryNext'], rule: /طوب كامل|يقسم|قاسم|مجموع|فرق/, vars: { zone: 'الأولى' } },
  { name: 'common-divisors', C: CommonDivisors, ns: 'common', props: { a: 12, b: 18 },
    steps: ['add', 'more', 'toLists', 'middle', 'pgcd'], rule: /قاسم|يقسم|تقسم|المشترك|أكبر|PGCD الأكبر/ },
];

describe.each(LABS)('$name — onboarding (LabCoach)', ({ C, ns, props, steps, rule, vars }) => {
  it('est PRÉSENT par défaut, sous la consigne et avant la scène ; coach={false} éteint tout', () => {
    const out = html(C, props);
    expect(out).toContain('data-lab-coach-toggle');
    expect(out).toContain('data-lab-coach-layer');
    expect(out).toContain(say(`${ns}.coach.hide`));
    expect(out.indexOf('data-manipulation-mission')).toBeLessThan(out.indexOf('data-lab-coach-toggle'));
    expect(out.indexOf('data-lab-coach-toggle')).toBeLessThan(out.indexOf('data-manipulation-stage'));
    expect(out).not.toMatch(RAW);
    const off = html(C, { ...props, coach: false });
    expect(off).not.toContain('data-lab-coach-toggle');
    expect(off).not.toContain('data-lab-coach-layer');
  });

  it('chaque astuce existe, entièrement interpolée, en UNE phrase, et ne donne JAMAIS la règle', () => {
    for (const key of [...steps, 'hide', 'show', 'ok', 'stop']) {
      const text = say(`${ns}.coach.${key}`, vars);
      expect(text, key).toBeTruthy();
      expect(text, key).not.toMatch(/manipulation\.|\{\{/);
      expect(text.replace(/PGCD/g, ''), key).not.toMatch(/[A-Za-z]{2,}/);
      if (!['hide', 'show', 'ok', 'stop'].includes(key)) expect(text, key).not.toMatch(rule);
    }
  });
});

describe('les cibles du guide existent dans le contrat DOM rendu', () => {
  it('divisor-explorer : les cartes du rail sont des sources de glisser', () => {
    const out = html(DivisorExplorer, { a: 24, candidates: [3, 4, 5, 6, 8, 12] });
    expect(out).toContain('data-drag-source="size:3"');
  });
  it('books / factor-pairs : la poignée et les boutons ± portent leur marque', () => {
    const books = html(DivisorExplorerBooks, { total: 24, min: 2, max: 12 });
    expect(books).toContain('data-stretch-handle');
    expect(books).toContain('data-shelf-nudge="1"');
    expect(books).toContain('data-shelf-nudge="-1"');
    const fp = html(FactorPairs, { n: 24 });
    expect(fp).toContain('data-stretch-handle');
    expect(fp).toContain('data-fp-nudge="1"');
  });
  it('team-builder : joueur du banc et pastilles d’équipes ; divisor-properties : le mur de b ; common-divisors : emballage et zones', () => {
    const tb = html(TeamBuilder, {});
    expect(tb).toContain('data-drag-source="player:0"');
    expect(tb).toContain('data-tb-teams="2"');
    expect(html(DivisorProperties, { n: 3, a: 18, b: 12 })).toContain('data-drag-source="wall:b"');
    const cd = html(CommonDivisors, { a: 12, b: 18 });
    expect(cd).toContain('data-drag-source="group:add"');
    expect(cd).toContain('data-group-row');
    expect(cd).toContain('data-group-add');
    const lists = html(CommonDivisors, { a: 28, b: 42, startWith: 'lists' });
    expect(lists).toContain('data-drop-zone="middle"');
    expect(lists).toContain('data-drop-zone="pgcd"');
  });
});
