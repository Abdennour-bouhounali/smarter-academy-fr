import { describe, it, expect } from 'vitest';
import * as L from './gearCrank';

/** Suit le coach jusqu'au bout d'un niveau (le labo doit pouvoir se finir par le guide seul) ; renvoie l'état final. */
function followCoach(s0) {
  let s = s0;
  for (let guard = 0; guard < 400; guard += 1) {
    const c = L.coachOf(s);
    if (!c && L.canNext(s)) { s = L.nextTask(s); continue; }   // le bouton vert « المهمة التالية » n'a pas de guide
    if (!c || c.id === 'free') break;
    const t = L.taskOf(s);
    if (c.id === 'predict') {
      const p = t.goalPedal;
      s = L.submitPrediction(L.setPredDen(L.setPredNum(s, String(p.n)), String(p.d)));
    } else if (c.id === 'crank' || c.id === 'flag') {
      s = L.release(L.turnTo(s, t.goalTeeth - 2));
    } else if (c.id === 'teeth') {
      s = L.release(L.stepTeeth(s, s.teeth < t.goalTeeth ? 1 : -1));
    } else throw new Error(`étape inconnue ${c.id}`);
  }
  return s;
}

describe('gear-crank — les tâches', () => {
  it('chaque tâche des préréglages a son drapeau sur une dent', () => {
    const goals = Object.fromEntries(['beginner', 'advanced', 'reverse'].flatMap((k) => L.init(L.PRESETS[k]).tasks.map((t) => [t.id, [t.goalTeeth, L.turnsAt(t, t.goalTeeth)]])));
    expect(goals.m1[0]).toBe(72);
    expect(goals.m2[0]).toBe(192);
    expect(goals.m3[0]).toBe(32);
    expect(goals.a1[0]).toBe(216);
    expect(goals.a2[0]).toBe(60);
    expect(goals.a3[0]).toBe(140);
    expect(goals.a4a[0]).toBe(30);
    expect(goals.a4b[0]).toBe(42);
    expect(goals.r1[0]).toBe(24);
    expect(goals.r2[0]).toBe(40);
  });

  it('les tours de pédale attendus : 3/2, 8, 4/3, 6, 3/2, 14/3, 5/7, 7/5, 3/5, 5/3', () => {
    const want = { m1: '3/2', m2: '8', m3: '4/3', a1: '6', a2: '3/2', a3: '14/3', a4a: '5/7', a4b: '7/5', r1: '3/5', r2: '5/3' };
    for (const k of ['beginner', 'advanced', 'reverse']) {
      for (const t of L.init(L.PRESETS[k]).tasks) {
        const s = L.init({ tasks: [{ id: t.id, F: t.F, R: t.R, target: t.targetText }] });
        const at = L.turnTo(s, t.goalTeeth);
        expect(`${t.id} ${L.judge(at).atFlag} ${L.turnsNow(at).wheel.n}/${L.turnsNow(at).wheel.d}`.startsWith(`${t.id} true`)).toBe(true);
        expect(`${L.turnsNow(at).pedal.n}${L.turnsNow(at).pedal.d === 1n ? '' : `/${L.turnsNow(at).pedal.d}`}`, t.id).toBe(want[t.id]);
      }
    }
  });

  it('une tâche dont le drapeau tombe entre deux dents est refusée à la construction', () => {
    expect(() => L.init({ tasks: [{ F: 24, R: 32, target: '7/5' }] })).toThrow();
    expect(() => L.init({ tasks: [{ F: 0, R: 32, target: '1' }] })).toThrow();
  });
});

describe('gear-crank — le geste, le lâcher, le drapeau', () => {
  it('l\'aperçu ne juge rien ; le lâcher est l\'essai ; m2 : 192 dents = 8 tours de pédale pour 6 de roue', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.nextTask(L.release(L.turnTo(s, 72)));            // m1
    s = L.turnTo(s, 100);
    expect(s.trials.filter((t) => t.tk === 'release')).toHaveLength(1);   // l'aperçu n'a rien ajouté
    s = L.release(L.turnTo(s, 192));
    expect(s.last).toMatchObject({ tk: 'release', id: 'm2', F: 24, R: 32, teeth: 192, pedal: '8', wheel: '6', atFlag: true, gap: '0', free: false, ok: true });
    expect(s.trials.at(-1)).toEqual({ tk: 'solved', id: 'm2' });
    expect(L.taskDone(s)).toBe(true);
    expect(L.canTurn(s)).toBe(false);                      // le tampon fige la manivelle
  });

  it('dépasser le drapeau : l\'écart signé en tours de roue, et on peut rouler en arrière', () => {
    let s = L.nextTask(L.release(L.turnTo(L.init(L.PRESETS.beginner), 72)));
    s = L.release(L.turnTo(s, 196));                       // 4 dents de trop = 4/32 = 1/8 de tour de roue
    expect(s.last).toMatchObject({ atFlag: false, gap: '1/8', wheel: '49/8', pedal: '49/6', ok: false });
    expect(L.judge(s).over).toBe(true);
    expect(L.taskDone(s)).toBe(false);
    s = L.release(L.stepTeeth(L.turnTo(s, 190), 0));
    expect(s.last).toMatchObject({ gap: '-1/16', atFlag: false });   // en deçà : écart négatif
    s = L.release(L.turnTo(s, 192));
    expect(s.last.ok).toBe(true);
  });

  it('un lâcher sans mouvement n\'est pas un essai ; la butée est un tour de roue après le drapeau', () => {
    let s = L.init(L.PRESETS.beginner);
    expect(L.release(s)).toBe(s);
    s = L.turnTo(s, 10000);
    expect(s.teeth).toBe(L.taskOf(s).goalTeeth + L.taskOf(s).R);
    expect(L.turnTo(s, -5).teeth).toBe(0);
  });

  it('les compteurs de مبتدئ sont lisibles en direct ; ceux de متقدم sont voilés jusqu\'au lâcher', () => {
    const b = L.init(L.PRESETS.beginner);
    expect(L.veiled(L.turnTo(b, 10))).toBe(false);
    let a = L.init(L.PRESETS.advanced);
    a = L.submitPrediction(L.setPredDen(L.setPredNum(a, '6'), '1'));
    a = L.turnTo(a, 100);
    expect(L.veiled(a)).toBe(true);
    a = L.release(a);
    expect(L.veiled(a)).toBe(false);
    expect(L.veiled(L.turnTo(a, 101))).toBe(true);
  });
});

describe('gear-crank — la prédiction', () => {
  it('la manivelle est bloquée tant qu\'aucune fraction n\'est écrite', () => {
    let s = L.init(L.PRESETS.advanced);
    expect(L.locked(s)).toBe(true);
    expect(L.turnTo(s, 10)).toBe(s);
    expect(L.canPredict(s)).toBe(false);
    s = L.setPredNum(s, '2٧');
    expect(s.predNum).toBe('27');
    s = L.setPredDen(s, '8888');
    expect(s.predDen).toBe('888');                         // 3 chiffres au plus
    s = L.setPredDen(s, '0');
    expect(L.canPredict(s)).toBe(false);                   // dénominateur nul
  });

  it('une prédiction fausse (27/8) est réfutée par la course : le drapeau a demandé 6 tours', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.submitPrediction(L.setPredDen(L.setPredNum(s, '27'), '8'));
    expect(s.last).toEqual({ tk: 'predict', id: 'a1', F: 36, R: 48, target: '9/2', value: '27/8', expected: '6', ok: false, free: false });
    expect(s.pred).toEqual({ value: '27/8', ok: false });
    expect(L.locked(s)).toBe(false);
    s = L.release(L.turnTo(s, 216));
    expect(s.last).toMatchObject({ atFlag: true, pedal: '6', wheel: '9/2', ok: true });   // la course tranche
    expect(s.pred.ok).toBe(false);
  });

  it('une prédiction juste (non réduite, 12/2) est reconnue', () => {
    let s = L.init(L.PRESETS.advanced);
    s = L.submitPrediction(L.setPredDen(L.setPredNum(s, '12'), '2'));
    expect(s.pred).toEqual({ value: '6', ok: true });
  });

  it('a4b suit a4a : le plateau et le pignon échangés, 5/7 puis 7/5, de produit 1', () => {
    let s = L.init(L.PRESETS.advanced);
    s = { ...s, ti: 3 };
    expect(L.swappedFrom(s)).toBeNull();   // a3 (30/42, 10/3) puis a4a (42/30, 1) : autre drapeau, la chaîne n'a pas été déplacée
    s = { ...s, ti: 4 };
    expect(L.swappedFrom(s).id).toBe('a4a');
    expect(L.taskOf(s).goalPedal).toEqual({ n: 7n, d: 5n });
  });
});

describe('gear-crank — le coach mène au bout de chaque niveau', () => {
  for (const k of ['beginner', 'advanced', 'reverse']) {
    it(`${k} : suivre coachOf termine toutes les tâches`, () => {
      const s = followCoach(L.init(L.PRESETS[k]));
      expect(L.allDone(s), k).toBe(true);
      expect(s.trials.filter((t) => t.tk === 'solved')).toHaveLength(L.PRESETS[k].tasks.length);
      // tout est fait : la découverte de مبتدئ n'a pas de guide ; متقدم et `reverse` invitent à « جرّب أعدادك »
      expect(L.coachOf(s)?.id ?? null).toBe(k === 'beginner' ? null : 'free');
      expect(L.discoveryReady(s)).toBe(k === 'beginner');
      if (k === 'advanced') expect(s.trials.filter((t) => t.tk === 'predict' && t.ok)).toHaveLength(5);
    });
  }

  it('le coach ne montre jamais la réponse : ses cibles sont des commandes', () => {
    const c = L.coachOf(L.init(L.PRESETS.advanced));
    expect(c.id).toBe('predict');
    for (const k of ['beginner', 'advanced', 'reverse']) {
      let s = L.init(L.PRESETS[k]);
      for (let i = 0; i < 60; i += 1) {
        const step = L.coachOf(s);
        if (!step) break;
        expect(step.target, k).toMatch(/^\[data-gc-(predict|crank|flag|teeth-more|teeth-less|next)\]$/);
        const before = s;
        s = followCoach(s);
        if (s === before) break;
        break;
      }
    }
  });
});

describe('gear-crank — « جرّب أعدادك »', () => {
  it('accepte 12 … 52 dents et un drapeau p/q (p ≤ 40, q ≤ 12) qui tombe sur une dent', () => {
    expect(L.validateFree('36', '48', '9/2')).toEqual({ ok: true, cfg: { F: 36, R: 48, target: '9/2' } });
    expect(L.validateFree('٣٦', '48', '٣')).toMatchObject({ ok: true });
    expect(L.validateFree('12', '52', '40')).toMatchObject({ ok: true });
  });

  it('refuse 0 dent : « صحنٌ بلا أسنان لا يُدير السلسلة »', () => {
    expect(L.validateFree('0', '32', '1')).toEqual({ ok: false, why: 'noTeeth', which: 'front' });
    expect(L.validateFree('24', '0', '1')).toEqual({ ok: false, why: 'noTeeth', which: 'rear' });
  });

  it('refuse un drapeau entre deux dents : 7/5 × 32 n\'est pas entier', () => {
    expect(L.validateFree('24', '32', '7/5')).toEqual({ ok: false, why: 'between', product: '7/5 × 32' });
    expect(L.validateFree('24', '30', '7/5')).toMatchObject({ ok: true });   // 7/5 × 30 = 42
  });

  it('refuse un nombre de dents hors bornes, un drapeau illisible ou trop grand', () => {
    expect(L.validateFree('11', '32', '1').why).toBe('range');
    expect(L.validateFree('24', '53', '1').why).toBe('range');
    expect(L.validateFree('', '32', '1').why).toBe('range');
    expect(L.validateFree('24', '32', '').why).toBe('target');
    expect(L.validateFree('24', '32', '41').why).toBe('target');
    expect(L.validateFree('24', '32', '1/13').why).toBe('target');
    expect(L.validateFree('24', '32', '0').why).toBe('target');
    expect(L.validateFree('24', '32', 'abc').why).toBe('target');
  });

  it('un lâcher libre est un `custom` jamais compté ; le tampon ne fige rien ; « عُد إلى المهمة » ramène', () => {
    let s = L.init(L.PRESETS.beginner);
    s = L.setFree(s, L.validateFree('36', '48', '9/2').cfg);
    expect(L.isFree(s)).toBe(true);
    s = L.release(L.turnTo(s, 216));
    expect(s.last).toEqual({ tk: 'custom', free: true, id: 'free', F: 36, R: 48, target: '9/2', teeth: 216, pedal: '6', wheel: '9/2', atFlag: true, gap: '0', ok: false });
    expect(s.trials.some((t) => t.tk === 'solved')).toBe(false);
    expect(L.canTurn(s)).toBe(true);
    expect(L.coachOf(s)).toBeNull();
    expect(L.allDone(s)).toBe(false);
    s = L.toGuided(s);
    expect(L.isFree(s)).toBe(false);
    expect(L.taskOf(s).id).toBe('m1');
  });

  it('l\'exemple du مقلوب : F = 3 n\'existe pas en libre, mais 1 tour de roue donne le miroir (F = 36, R = 12 : 1/3)', () => {
    let s = L.setFree(L.init(L.PRESETS.beginner), L.validateFree('36', '12', '1').cfg);
    s = L.release(L.turnTo(s, 12));
    expect(s.last).toMatchObject({ pedal: '1/3', wheel: '1', atFlag: true });
  });
});

describe('gear-crank — la formalisation de m2', () => {
  it('3/4, son miroir 4/3, 6 et 8 ; la fausse conjecture 6 × 3/4 = 9/2', () => {
    const m2 = L.init(L.PRESETS.beginner).tasks[1];
    expect(L.formalOf(m2)).toEqual({ ratio: '3/4', mirror: '4/3', target: '6', answer: '8', wrong: '9/2' });
  });

  it('les témoins viennent des tâches réussies', () => {
    const s = followCoach(L.init(L.PRESETS.beginner));
    expect(L.witnesses(s).bigger.id).toBe('m2');
    expect(L.witnesses(s).first.id).toBe('m1');
  });
});
