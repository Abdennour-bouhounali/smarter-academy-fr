import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import TenZoom, { discoveryOptions, Formal, CHAINS, QUESTIONS } from './TenZoom';
import * as TZ from '../logic/tenZoom';
import { LEVELS } from '../levels';
import * as L from '../logic/tenZoom';
import { SCENE_IDS } from './tenZoom/art';

const RAW = /manipulation\.[a-zA-Z]/;
const html = (props) => renderToString(<TenZoom {...props} />);
const text = (out) => out.replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/[⁦⁩]/g, '').replace(/\s+/g, ' ');
const prose = (out) => text(out.replace(/<span class="katex[\s\S]*?<\/span><\/span><\/span>/g, ' ').replace(/<math[\s\S]*?<\/math>/g, ' '));
const k = (key, o) => i18n.t(`lesson:manipulation.tenZoom.${key}`, o);
const LV = LEVELS['ten-zoom'];
const HOOKS = ['data-ten-zoom', 'data-tz-glance', 'data-tz-stage', 'data-tz-scene', 'data-tz-lens', 'data-tz-ring', 'role="slider"', 'data-tz-plate', 'data-tz-side', 'data-tz-card', 'data-tz-dock', 'data-tz-less', 'data-tz-more', 'data-tz-banner', 'data-tz-free', 'data-tz-kid'];

describe('ten-zoom — rendu', () => {
  it('مبتدئ : la lentille, la bague (slider), la plaque, la carte, les boutons, le panneau libre ; ni clé brute ni prose latine', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    for (const hook of HOOKS) expect(out, hook).toContain(hook);
    expect(out).toContain('aria-valuenow="0"');
    expect(out).not.toContain('data-tz-next');
    expect(out).not.toContain('data-tz-formal');
    expect(out).not.toContain('data-tz-predict-card');
    expect(out).not.toMatch(RAW);
    expect(out).not.toContain('{{');
    const words = (prose(out).match(/[A-Za-z]{2,}/g) ?? []);
    expect(words).toEqual([]);
  });

  it('ouvre sur son CONTEXTE puis UNE question, sans titre visible', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).toContain('data-lab-context');
    expect(out).toContain('data-lab-question');
    expect(out).toMatch(/<h3 class="sr-only">/);
    expect(text(out)).toContain('الإطار الآن ضلعه 1 م');
    expect(text(out)).toContain('أدر الحلقة حتى يصير ضلع الإطار مساويًا للطول المكتوب على البطاقة');
  });

  it('dit chaque chose UNE fois : la carte (1 000 م) et la plaque (1 م) sont distinctes, la tally seulement après un cran', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect((out.match(/data-tz-card=/g) ?? []).length).toBe(1);
    expect((out.match(/data-tz-plate/g) ?? []).length).toBeGreaterThanOrEqual(1);
    expect(out).not.toContain('data-tz-tally');
    expect(text(out)).toContain('1 000');
  });

  it('z2 : la carte de prédiction est là, la bague bloquée tant qu’on n’a pas choisi (état)', () => {
    const out = html({ tasks: [LV.beginner.numbers.tasks[1]], levels: false, tally: true });
    expect(out).toContain('data-tz-predict-card');
    expect((out.match(/data-tz-predict="/g) ?? []).length).toBe(3);
    expect(out).toContain('aria-disabled="true"');
    expect(text(out)).toContain('كم نقرة تكبير تحتاج؟');
    expect(out).not.toMatch(RAW);
  });

  it('متقدم : pas de tally, cartes en noms (مليار متر) et en unités', () => {
    const out = html({ ...LV.advanced.numbers, level: 'advanced' });
    expect(out).not.toContain('data-tz-tally');
    expect(text(out)).toContain('مليار متر');
    const unit = html({ tasks: [LV.advanced.numbers.tasks[1]], levels: false });
    expect(text(unit)).toContain('ميكرومتر واحد: جزء من مليون من المتر');
    const km = html({ tasks: [LV.advanced.numbers.tasks[3]], levels: false });
    expect(text(km)).toContain('10 كم');
  });

  it('monde prefixes posé seul : les cartes sont des unités et le contexte parle de la lentille', () => {
    const out = html({ world: 'prefixes', levels: false });
    expect(out).toContain('data-world="prefixes"');
    expect(text(out)).toContain('كيلومتر واحد');
    expect(text(out)).toContain('اسم الوحدة');
    expect(out).not.toMatch(RAW);
  });

  it('un décor existe pour chaque n de −7 à 9 et seulement ceux-là', () => {
    expect([...SCENE_IDS].sort((a, b) => a - b)).toEqual(Array.from({ length: 17 }, (_, i) => i - 7));
    for (let n = L.SCENE_MIN; n <= L.SCENE_MAX; n += 1) expect(k(`scene.names.${n}`), String(n)).not.toMatch(RAW);
  });
});

describe('ten-zoom — chaînes de texte', () => {
  it('toutes les clés existent et ne laissent aucune interpolation brute', () => {
    for (const key of ['title', 'context.first', 'context.again', 'context.carry', 'context.prefixes', 'context.free', 'question.zoom', 'question.prefixes', 'ring.aria', 'less.aria', 'more.aria', 'plate.label', 'card.label', 'predict.out', 'predict.in',
      'dock', 'next', 'retry', 'idle.start', 'idle.predict', 'v.limit', 'v.custom', 'free.title', 'free.hint', 'free.on', 'free.refusal.notpow', 'free.refusal.format', 'free.refusal.range',
      'coach.ring', 'coach.plate', 'coach.predict', 'coach.dock', 'coach.next', 'coach.free', 'hints.0', 'hints.1', 'hints.2', 'explanation', 'discovery.count.prompt', 'discovery.rank.prompt', 'formal.pos', 'formal.zero', 'formal.neg', 'formal.read', 'scene.none']) {
      const v = k(key);
      expect(v, key).not.toMatch(RAW);
      expect(v.length, key).toBeGreaterThan(2);
    }
  });
  it('le coach couvre chaque étape que coachOf peut rendre', () => {
    for (const id of ['ring', 'plate', 'predict', 'dock', 'next', 'free']) expect(k(`coach.${id}`), id).not.toMatch(RAW);
  });
  it('découverte : trois formulations dont une juste, pour chaque niveau ; règle formelle', () => {
    for (const kind of ['count', 'rank']) {
      const opts = discoveryOptions(k, kind);
      expect(opts).toHaveLength(3);
      expect(opts.filter((o) => o.correct)).toHaveLength(1);
    }
    const f = renderToString(<Formal k={k} />);
    expect(f).toContain('data-tz-formal');
    expect(f).not.toMatch(RAW);
  });
  it('la prose ne dit pas la règle avant la découverte (consigne, coach, indices)', () => {
    const early = ['context.first', 'context.again', 'question.zoom', 'coach.ring', 'coach.plate', 'coach.dock', 'hints.0', 'hints.1', 'hints.2'].map((x) => k(x)).join(' ');
    expect(early).not.toMatch(/أصفار|صفر|الفاصلة|رتبة|قوة|أس /);
  });
});

describe('ten-zoom — questions pendant le labo (LabCheckpoint)', () => {
  it('chaque question de chaque tâche (deux niveaux et monde des préfixes) : texte, 2 indices, une seule bonne réponse, ni clé brute ni {{', () => {
    for (const [tag, numbers] of [['beginner', LV.beginner.numbers], ['advanced', LV.advanced.numbers], ['prefixes', TZ.PRESETS.prefixes]]) {
      const base = TZ.init(numbers);
      base.tasks.forEach((tk, i) => {
        expect(CHAINS[tk.id], `${tag}.${tk.id}`).toBeTruthy();
        const lab = { ...base, ti: i };
        for (const qid of CHAINS[tk.id]) {
          const q = QUESTIONS[qid](lab, tk, k);
          const out = renderToString(<div>{q.prompt}{q.options?.map((o, j) => <span key={j}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toMatch(RAW);
          expect(out, `${tag}.${tk.id}.${qid}`).not.toContain('{{');
          expect(q.hints, `${tag}.${tk.id}.${qid}`).toHaveLength(2);
          if (q.kind === 'choice') {
            expect(q.options.filter((o) => o.correct), `${tag}.${tk.id}.${qid}`).toHaveLength(1);
            expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${tag}.${tk.id}.${qid} why`).toBe(true);
            expect(new Set(q.options.map((o) => renderToString(<span>{o.text}</span>))).size, `${tag}.${tk.id}.${qid} distinct`).toBe(q.options.length);
          } else expect(Number(q.expected)).toBeGreaterThan(0);
        }
      });
    }
  });
  it('les nombres : 3 crans pour 1 000 m, 3 pour le retour de 0,001 m, 3 entre milli et micro ; la dernière tâche de chaque niveau finit par la règle', () => {
    const b = TZ.init(LV.beginner.numbers);
    expect(QUESTIONS.clicks(b, b.tasks[0], k).expected).toBe('3');
    expect(QUESTIONS.back({ ...b, ti: 3 }, b.tasks[3], k).expected).toBe('3');
    const p = TZ.init(TZ.PRESETS.prefixes);
    expect(QUESTIONS.between({ ...p, ti: 2 }, p.tasks[2], k).expected).toBe('3');
    expect(CHAINS.z4.at(-1)).toBe('rule');
    expect(CHAINS.z8.at(-1)).toBe('rule');
  });
  it('« أعِد التجربة » : la même tâche repart (celle qui part de la précédente, du cadre précédent) et son drapeau « fait » tombe', () => {
    const lab = { ...TZ.init(LV.beginner.numbers), ti: 3, n: 0, done: [true, true, true, true] };
    const r = TZ.retryTask(lab);
    expect(r.done[3]).toBe(false);
    expect(r.n).toBe(-3);
  });
  it('mode guidé : ni la progression ni le bouton d’indice, les étapes et le son sont là', () => {
    const out = html({ ...LV.beginner.numbers, level: 'beginner' });
    expect(out).not.toContain('data-manipulation-progress');
    expect(out).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(out).toContain('data-tz-step="3"');
    expect(out).toContain('data-manipulation-sound');
    expect(html({ ...LV.beginner.numbers, level: 'beginner', checkpoints: false })).toContain('data-manipulation-progress');
  });
});
