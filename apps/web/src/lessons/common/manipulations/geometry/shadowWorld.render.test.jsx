import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import i18n from '../../../../i18n';
import ShadowWorld, { chainOf, QUESTIONS, makeSay } from './ShadowWorld';
import ManipulationWorkspace from '../ManipulationWorkspace';
import { LEVELS } from '../levels';
import * as W from '../logic/shadowWorld';
import manipulationAr from '../../../../i18n/locales/ar/lesson.manipulation.json';

/**
 * shadow-world se rend aux deux niveaux, seul et dans un workspace, sans clé i18n brute ni interpolation oubliée,
 * et SANS LA LOI : ni la hauteur de la minaret, ni « × 1,6 », ni le rapport ombre ÷ hauteur au premier écran.
 * Puis : chaque message que le compagnon peut dire existe en arabe (react / guide / help, tous paliers).
 */
const RAW = /manipulation\.[a-zA-Z]/;

describe('shadow-world — rendu', () => {
  it('beginner: the square, the sun at 13:00, the companion, the quests, no notebook yet (questions du labo coupées par l’enseignant)', () => {
    const html = renderToString(<ShadowWorld {...LEVELS['shadow-world'].beginner.numbers} checkpoints={false} />);
    expect(html).toContain('data-shadow-world');
    expect(html).toContain('data-sw-glance');
    expect(html).toContain('data-hour="13:00"');
    expect(html).toContain('data-sw-sun="13:00"');
    expect(html).toContain('data-sw-companion');
    expect(html).toContain('data-msg="g_observe"');
    expect(html).toContain('data-sw-quest="observe"');
    expect(html).toContain('data-sw-stick-handle="1500"'); // le bâton démarre au soleil
    expect(html).toContain('data-deco="city"');
    expect(html).not.toContain('data-sw-rule-try'); // la règle s'ouvre après un pari
    expect(html).not.toContain('data-sw-challenge');
    expect(html).not.toMatch(RAW);
    expect(html).not.toContain('{{');
  });

  it('le panneau de مقران (questions du labo coupées) : au premier écran UNE mission (pas de question), la progression des 5 questions, aucun fil encore', () => {
    const html = renderToString(<ShadowWorld {...LEVELS['shadow-world'].advanced.numbers} checkpoints={false} />);
    expect(html).toContain('data-sw-card="task"');
    expect(html).not.toContain('data-sw-card="question"');
    expect(html).toContain('data-sw-progress="0/5"');
    expect((html.match(/data-sw-step=/g) ?? []).length).toBe(5);
    expect(html).not.toContain('data-sw-thread');
    expect(html).not.toContain('data-sw-quiz-option');
  });

  it('advanced (تحدّ): nothing on the first screen gives the height or the law', () => {
    const html = renderToString(<ShadowWorld {...LEVELS['shadow-world'].advanced.numbers} />);
    expect(html).not.toContain('7,25');
    expect(html).not.toContain('7{,}25');
    expect(html).not.toContain('1{,}6');
    expect(html).not.toContain('÷ الطول');
    expect(html).not.toMatch(RAW);
  });

  it('inside a workspace: both levels mounted, one selector', () => {
    const html = renderToString(
      <ManipulationWorkspace defaultLevel="advanced" levels={{
        beginner: () => <ShadowWorld level="beginner" {...LEVELS['shadow-world'].beginner.numbers} />,
        advanced: () => <ShadowWorld {...LEVELS['shadow-world'].advanced.numbers} />,
      }} />,
    );
    expect((html.match(/data-shadow-world/g) ?? []).length).toBe(2);
    expect(html).not.toMatch(RAW);
  });
});

describe('shadow-world — la voix de مقران existe en entier', () => {
  const has = (id) => i18n.exists(`manipulation.shadowWorld.${id}`, { ns: 'lesson' });

  it('chaque réaction, chaque question de fond, chaque palier d’aide', () => {
    const ids = [
      'rSunFirst', 'rSunLater', 'rSunEarlier', 'rNoon', 'rRuleBroken', 'rPlusSurvives', 'rMeet', 'rStickHidden', 'rMeasureHidden',
      'rClimb', 'rMeasureMinaret', 'rMeasured', 'rTwoSameHour', 'rPredRight', 'rPredLucky', 'rRulePartial', 'rRuleNone',
      'rRuleFits', 'rRuleFitsAgain', 'rRulePlusFits', 'rAnsInvalid',
      ...['right', 'additive', 'copy', 'equal', 'inverse', 'short', 'long'].filter((x) => x !== 'right').map((x) => `rPred_${x}`),
      ...['right', 'shadowItself', 'inverted', 'additive', 'mixedHours', 'distance', 'noShadow', 'tooHigh', 'tooLow'].map((x) => `rAns_${x}`),
      ...['observe', 'measure', 'predict', 'rule', 'rule2', 'conclude', 'minaret', 'done'].map((x) => `g_${x}`),
    ];
    for (const goal of ['observe', 'measure', 'predict', 'rule', 'rulePlus', 'rule2', 'rule2Same', 'conclude', 'minaret', 'done']) {
      for (const l of [1, 2, 3]) ids.push(`h_${goal}_${l}`);
    }
    for (const id of ids) expect(has(id), id).toBe(true);
    for (const o of W.OBJECTS) expect(has(`obj.${o.id}`), o.id).toBe(true);
  });

  it('chaque question du TUTEUR (checkpoints) a son prompt, sa réaction juste/fausse, et le libellé de chacune de ses options', () => {
    for (const quizId of Object.keys(W.QUIZZES)) {
      for (const prefix of ['q', 'qRight', 'qWrong']) expect(has(`${prefix}_${quizId}`), `${prefix}_${quizId}`).toBe(true);
      // les indices de la carte question (`help` → hq_<quiz>_<1..3>) : un oubli affichait la clé brute (QA 2026-10-13)
      for (const l of [1, 2, 3]) expect(has(`hq_${quizId}_${l}`), `hq_${quizId}_${l}`).toBe(true);
    }
    for (const id of ['threadMore', 'threadLess', 'you', 'questionLabel', 'questionStep', 'taskLabel', 'hintBtn', 'hintMore', 'hintStep', 'triedWrong', 'actionFreeStick', 'youRule', 'youBet', 'youAnswer', 'progressLabel']) {
      expect(has(id), id).toBe(true);
    }
    const FIXED_OPTIONS = { trend: ['longer', 'shorter'], fastest: ['minaret', 'stick'], ratioSeed: ['same', 'different'], ruleReflect: ['form', 'number'] };
    for (const [quizId, opts] of Object.entries(FIXED_OPTIONS)) {
      for (const optId of opts) expect(has(`quizOpt_${quizId}_${optId}`), `quizOpt_${quizId}_${optId}`).toBe(true);
    }
    // predictReflect : les QUATRE modèles possibles (correct OU distracteur selon le pari de l'élève) ont tous un libellé.
    for (const model of ['additive', 'copy', 'equal', 'inverse']) {
      expect(has(`quizOpt_predictReflect_${model}`), `quizOpt_predictReflect_${model}`).toBe(true);
    }
  });

  it('mقران ne pose de question QUE là où l’élève peut répondre : aucune réaction ni mission ne contient « ؟ » (owner 2026-10-13)', () => {
    // Les questions vivent dans les cartes « سؤال مقران » (q_*, options tapées), les indices (h_*, hq_*) et le défi
    // (rAns_*, répondu dans la case du défi). Une réaction (r*) ou une mission (g_*) qui demande quelque chose sans
    // bouton pour répondre, c'est exactement la confusion relevée par le propriétaire.
    for (const [key, text] of Object.entries(manipulationAr.shadowWorld)) {
      // un « … » cite le TITRE d'un panneau où l'élève répond (« ماذا لاحظت؟ ») : ce n'est pas une question de مقران
      if ((/^r[A-Z]/.test(key) && !key.startsWith('rAns')) || key.startsWith('g_')) expect(text.replace(/«[^»]*»/g, ''), key).not.toContain('؟');
    }
  });

  it('un libellé d’option (`quizOpt_*`) n’est JAMAIS interpolé par la vue (`k()` sans paramètres) : aucun `{{…}}` ne doit y rester', () => {
    // bug réel trouvé en QA navigateur (2026-10-13) : `quizOpt_ruleReflect_number` contenait `{{numText}}`, affiché
    // tel quel sur le bouton (« العدد {{numText}} يبقى... ») faute d'interpolation — les options sont STATIQUES.
    for (const [key, text] of Object.entries(manipulationAr.shadowWorld)) {
      if (key.startsWith('quizOpt_')) expect(text, key).not.toContain('{{');
    }
  });

  it('aucun message ne donne la loi avant que l’élève l’ait écrite : ni « × 1,6 », ni « مضروب في 1 » chiffré', () => {
    const bag = manipulationAr.shadowWorld;
    expect(Object.keys(bag).length).toBeGreaterThan(100);
    // inclut les checkpoints trend/fastest/ratioSeed (posés AVANT que ruleReflect ait même pu exister) et leurs options,
    // mais PAS ruleReflect/predictReflect eux-mêmes : ceux-ci réagissent à une règle ou un pari déjà faits par l'élève,
    // donc ils peuvent légitimement nommer « × » et un nombre — celui que l'ÉLÈVE vient d'écrire, jamais 1,6 imposé.
    const before = Object.entries(bag).filter(([key]) => /^(g_(observe|measure|predict|rule|rule2)|h_(observe|measure|predict|rule|rulePlus|rule2|rule2Same)_|hq_(trend|fastest|ratioSeed)_|r(Sun|Pred|Measure|Two|Rule)|q(Right|Wrong)?_(trend|fastest|ratioSeed)|quizOpt_(trend|fastest|ratioSeed))/.test(key));
    expect(before.length).toBeGreaterThan(10);
    for (const [key, text] of before) {
      expect(text, key).not.toMatch(/1[,.]6|\\times|×\s*\d/);
    }
  });

  it('un checkpoint dont la donnée n’existe pas encore (predictReflect sans pari, ruleReflect sans règle × juste) n’est jamais le checkpoint courant au premier écran', () => {
    const s = W.init();
    expect(W.currentCheckpoint(s)).toBe(null); // aucun geste encore : rien à juger, مقران questionne, ne bloque pas
    expect(W.currentGoal(s)).toBe('observe');
  });
});

describe('shadow-world — questions pendant le labo (LabCheckpoint)', () => {
  const k = (key, o) => i18n.t(`lesson:manipulation.shadowWorld.${key}`, o);
  const say = makeSay(k);

  /** Une partie complète, un état par arrêt : 3 heures vues → 2 mesures → un pari faux → une règle × → la règle réparée → la hauteur. */
  const journey = () => {
    let s = W.init({ minaret: '7,25' });
    s = W.setHour(W.setHour(s, 2), 3);
    const observe = s;
    s = W.measure(W.measure(s, 'stick'), 'farid');
    const measure = s;
    s = W.install(W.setFlag(s, 300));               // le lampadaire (3 m) : « l'ombre égale la hauteur » à 14:00
    const predict = s;
    s = W.applyRule(s, '×', 120);
    const rule = s;
    s = W.applyRule(W.setHour(s, 5), '×', 160);
    const rule2 = s;
    s = W.answer(s, '7,25');
    return { observe, measure, predict, rule, rule2, minaret: s };
  };

  it('chaque arrêt est atteint à son étape, avec une suite de 2 à 3 questions complètes (texte, 2 indices, une seule bonne réponse, ni clé brute ni {{)', () => {
    const j = journey();
    const order = ['observe', 'measure', 'predict', 'rule', 'rule2', 'minaret'];
    order.forEach((stop, i) => {
      const lab = j[stop];
      expect(W.stopReached(lab, stop), `${stop} atteint`).toBe(true);
      if (i > 0) expect(W.stopReached(j[order[i - 1]], stop), `${stop} pas avant`).toBe(false);
      const chain = chainOf(stop, lab);
      expect(chain.length, stop).toBeGreaterThanOrEqual(2);
      for (const qid of chain) {
        const q = QUESTIONS[qid](lab, stop, k, say);
        const out = renderToString(<div>{q.prompt}{q.options?.map((o, n) => <span key={n}>{o.text}{o.why}</span>)}{q.hints}{q.explain}</div>);
        expect(out, `${stop}.${qid}`).not.toMatch(RAW);
        expect(out, `${stop}.${qid}`).not.toContain('{{');
        expect(q.hints, `${stop}.${qid}`).toHaveLength(2);
        if (q.kind === 'choice') {
          expect(q.options.filter((o) => o.correct), `${stop}.${qid}`).toHaveLength(1);
          expect(q.options.filter((o) => !o.correct).every((o) => o.why), `${stop}.${qid} why`).toBe(true);
        } else expect(q.expected, `${stop}.${qid}`).toMatch(/^\d+(,\d+)?$/);
      }
    });
    // les nombres de l'élève : 1,2 à 14:00 (ombre 120 cm pour 100 cm), 4 × 1,2 = 4,8 m, 7,25 m ⇒ 11,6 ÷ 7,25 = 1,6
    expect(QUESTIONS.ratioVal(j.measure, 'measure', k, say).expected).toBe('1,2');
    expect(QUESTIONS.ruleWhich(j.rule, 'rule', k, say).expected).toBe('4,8');
    expect(QUESTIONS.minaretCheck(j.minaret, 'minaret', k, say).expected).toBe('1,6');
  });

  it('les questions tapées de مقران rejouées dans la suite gagnent les mêmes quiz ; « أعِد التجربة » défait SEULEMENT son arrêt', () => {
    const j = journey();
    const won = W.winQuizzes(W.winQuizzes(j.rule2, W.QUIZZES_OF_STOP.observe), W.QUIZZES_OF_STOP.measure);
    expect(won.quizzes.trend && won.quizzes.fastest && won.quizzes.ratioSeed).toBe(true);
    expect(W.goals(won).observe && W.goals(won).measure).toBe(true);
    const back = W.retryStop(j.rule2, 'rule2');
    expect(W.fittingRules(back)).toHaveLength(1);
    expect(W.stopReached(back, 'rule2')).toBe(false);
    expect(W.stopReached(back, 'rule')).toBe(true);
    expect(W.stopReached(W.retryStop(j.predict, 'predict'), 'predict')).toBe(false);
    expect(W.stopReached(W.retryStop(j.observe, 'observe'), 'observe')).toBe(false);
    expect(W.stopReached(W.retryStop(j.measure, 'measure'), 'measure')).toBe(false);
    expect(W.stopReached(W.retryStop(j.minaret, 'minaret'), 'minaret')).toBe(false);
  });

  it('mode guidé : ni la progression ni le bouton d’indice du shell, les étapes à la place des pastilles, et مقران sans ses points de questions', () => {
    const html = renderToString(<ShadowWorld minaret="7,25" level="beginner" />);
    expect(html).not.toContain('data-manipulation-progress');
    expect(html).not.toContain(i18n.t('lesson:manipulation.hint.show'));
    expect(html).toContain('data-lab-stepper');
    expect(html).not.toContain('data-sw-progress');
    expect(html).not.toContain('data-sw-quest=');
    expect(W.currentGoal(W.init(), { skipQuizzes: true })).toBe('observe');
  });
});
