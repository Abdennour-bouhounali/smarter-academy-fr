import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import UnitLadder, { discoveryOptions, Formal, colsText, CHAINS, QUESTIONS } from './UnitLadder';
import * as UL from '../logic/unitLadder';
import { LEVELS } from '../levels';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<UnitLadder {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.unitLadder.${key}`, o);
const LV = LEVELS['unit-ladder'];
const HOOKS = ['data-unit-ladder', 'data-ul-glance', 'data-ul-stage', 'data-ul-ruler', 'data-ul-plaque="km"', 'data-ul-plaque="nm"', 'data-ul-handle', 'role="slider"', 'data-ul-readout', 'data-ul-card', 'data-ul-dock', 'data-ul-less', 'data-ul-more', 'data-ul-banner', 'data-ul-free', 'data-ul-kid'];

describe('unit-ladder — rendu', () => {
  it('مبتدئ : règle, plaques km … nm, poignée (slider), lecture, carte, boutons, panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of HOOKS) expect(out, hook).toContain(hook);
    expect(out).toContain('aria-valuenow="0"');
    expect(out).toContain('data-ul-predict-card');
    expect((out.match(/data-ul-predict="/g) ?? []).length).toBe(3);
    expect(out).not.toContain('data-ul-dial');
    expect(out).not.toContain('data-ul-next');
    expect(out).not.toContain('data-ul-formal');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    expect(prose(out).match(/[A-Za-z]{2,}/g) ?? []).toEqual([]);
  });
  it('ouvre sur son CONTEXTE puis UNE question, sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    expect(out).toMatch(/<h3 class="sr-only">/);
    expect(text(out)).toContain('بين كل عمودين متجاورين نضرب في 10');
    expect(text(out)).toContain('مدّ الشريط من لوحة البطاقة إلى اللوحة المطلوبة');
  });
  it('dit chaque chose UNE fois : une carte, une lecture, une poignée', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect((out.match(/data-ul-card=/g) ?? []).length).toBe(1);
    expect((out.match(/data-ul-readout=/g) ?? []).length).toBe(1);
    expect((out.match(/data-ul-handle=/g) ?? []).length).toBe(1);
    expect(text(out)).toContain('كم ملم في 1 كم');
  });
  it('متقدم : cadran de mode, plaques en mètres carrés après le choix, aucun facteur écrit', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).toContain('data-ul-dial');
    for (const m of [1, 2, 3]) expect(out).toContain(`data-ul-mode="${m}"`);
    expect(out).not.toContain('data-ul-factor');
    expect(text(out)).toContain('كم م² في 1 كم²');
    expect(out).not.toMatch(RAW);
  });
  it('monde libre : trois sélecteurs', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const h of ['data-ul-free-mode', 'data-ul-free-from', 'data-ul-free-to']) expect(out).toContain(h);
  });
});

describe('unit-ladder — chaînes de texte', () => {
  it('toutes les clés existent et ne laissent aucune interpolation brute', () => {
    for (const key of ['title', 'context.first', 'context.again', 'context.tables', 'context.free', 'question.ladder', 'question.tables', 'scene.aria', 'card.label', 'card.pos', 'card.neg', 'card.via', 'readout.label', 'dock', 'next', 'retry', 'left', 'right',
      'handle.aria', 'idle.start', 'idle.predict', 'idle.moved', 'idle.mode', 'refuse.mid', 'refuse.blank', 'refuse.wrong', 'refuse.mode', 'v.hop', 'v.solved', 'v.solvedNeg', 'v.wobble', 'v.custom', 'free.title', 'free.hint', 'free.on',
      'free.refusal.same', 'free.refusal.unit', 'free.refusal.range', 'coach.handle', 'coach.readout', 'coach.predict', 'coach.mode', 'coach.dock', 'coach.next', 'coach.free', 'hints.0', 'hints.1', 'hints.2', 'explanation',
      'discovery.gap.prompt', 'discovery.tables.prompt', 'mode.1', 'mode.2', 'mode.3', 'units.um', 'units.full.nm']) {
      const v = k(key, { from: 'كم', to: 'م', via: 'م', got: 'كم', want: 'م', k: '3 أعمدة', n: 2, i: 1, table: 'جدول', c: 'عمودان', m: 'طول', have: 'جدول طول', wantT: 'جدول مساحة', f: '1', v: '9' });
      expect(v, key).not.toMatch(RAW);
      expect(v, key).not.toContain('{{');
      expect(v.length, key).toBeGreaterThan(1);
    }
  });
  it('l’accord du nombre d’colonnes', () => {
    const tt = (n) => colsText(n, k);
    expect([0, 1, 2, 3, 10, 11].map(tt)).toEqual(['لا عمود', 'عمود واحد', 'عمودان', '3 أعمدة', '10 أعمدة', '11 عمودًا']);
    expect(tt(-6)).toBe('6 أعمدة');
  });
  it('découverte : trois formulations dont une juste, pour chaque niveau ; règle formelle', () => {
    for (const kind of ['gap', 'tables']) {
      const opts = discoveryOptions(k, kind);
      expect(opts).toHaveLength(3);
      expect(opts.filter((o) => o.correct)).toHaveLength(1);
      const f = renderToString(<Formal k={k} kind={kind} />);
      expect(f).toContain('data-ul-formal');
      expect(f).not.toMatch(RAW);
    }
  });
  it('la prose ne dit pas la règle avant la découverte (consigne, coach, indices)', () => {
    const early = ['context.first', 'context.again', 'context.tables', 'question.ladder', 'question.tables', 'coach.handle', 'coach.readout', 'coach.dock', 'coach.predict', 'coach.mode', 'hints.0', 'hints.1', 'hints.2'].map((x) => k(x)).join(' ');
    expect(early).not.toMatch(/نجمع|نطرح|الأس|قوة|أسّ|الأسّين/);
  });
});

describe('unit-ladder — questions pendant le labo (LabCheckpoint)', () => {
  const RAWK = /manipulation\.[a-zA-Z]/;
  it('chaque question de chaque tâche des deux niveaux : texte, 2 indices, une seule bonne réponse, ni clé brute ni {{', () => {
    for (const lv of ['beginner', 'advanced']) {
      const base = UL.init(LV[lv].numbers);
      base.tasks.forEach((tk, i) => {
        expect(CHAINS[tk.id], tk.id).toBeTruthy();
        // les rubans posés par la tâche : un par saut, chacun de k colonnes (le total est la somme)
        const bands = tk.path.slice(0, -1).map((u, j) => ({ from: u, to: tk.path[j + 1], k: UL.bandOf(u, tk.path[j + 1], tk.mode) }));
        const lab = { ...base, ti: i, mode: tk.mode, bands };
        for (const qid of CHAINS[tk.id]) {
          const q = QUESTIONS[qid](lab, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tk.id}.${qid}`).not.toMatch(RAWK);
          expect(out, `${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${tk.id}.${qid}`).toHaveLength(1);
            expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${tk.id}.${qid} why`).toBe(true);
            expect(new Set(q.options.map((o) => renderToString(<span>{o.text}</span>))).size, `${tk.id}.${qid} distinct`).toBe(q.options.length);
          } else expect(q.expected).toBeTruthy();
        }
      });
    }
  });
  it('les nombres : 3 + 3 colonnes, km → cm = 5, aire 6, volume 6', () => {
    const b = UL.init(LV.beginner.numbers); const a = UL.init(LV.advanced.numbers);
    const bandsOf = (tk) => tk.path.slice(0, -1).map((u, j) => ({ k: UL.bandOf(u, tk.path[j + 1], tk.mode) }));
    expect(QUESTIONS.hopsTotal({ ...b, bands: bandsOf(b.tasks[0]) }, b.tasks[0], k).expected).toBe('6');
    const across = QUESTIONS.across(b, b.tasks[1], k);
    expect(renderToString(<span>{across.options.find((o) => o.correct).text}</span>)).toContain('5');
    expect(QUESTIONS.power({ ...a, ti: 0 }, a.tasks[0], k).options.filter((o) => o.correct)).toHaveLength(1);
    expect(CHAINS.u3.at(-1)).toBe('rule');
    expect(CHAINS.u7.at(-1)).toBe('rule');
  });
  it('« أعِد التجربة » : la même tâche repart et son drapeau « fait » tombe', () => {
    const lab = { ...UL.init(LV.beginner.numbers), done: [true, false, false] };
    expect(UL.retryTask(lab).done[0]).toBe(false);
  });
  it('mode guidé : ni la progression ni le bouton d’indice, les étapes et le son sont là', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-ul-step="2"');
    expect(out).toContain('data-manipulation-sound');
    expect(html({ ...LV.beginner.numbers, level: 'beginner', checkpoints: false })).toContain('data-manipulation-progress');
  });
});
