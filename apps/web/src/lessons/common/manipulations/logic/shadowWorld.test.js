import { describe, it, expect } from 'vitest';
import * as W from './shadowWorld';

const TB = W.TEXTBOOK_HOUR;
/** Un état qui a déjà franchi les checkpoints trend et fastest (préalables, dans l'ordre pédagogique) à l'heure TB. */
const pastObserve = () => {
  let s = W.setHour(W.init(), 4);
  s = W.answerQuiz(s, 'trend', W.judgeTrend(s).correct);
  s = W.setHour(s, 3);
  s = W.answerQuiz(s, 'fastest', W.judgeFastest(s).correct);
  return W.setHour(s, TB);
};

describe('shadow-world — le monde', () => {
  it('toutes les ombres sont des centimètres ENTIERS, à toutes les heures, pour tous les objets', () => {
    for (const minaret of ['5', '7,25']) {
      const s = W.init({ minaret });
      for (let i = 0; i < W.HOURS.length; i += 1) {
        for (const o of W.OBJECTS) expect(Number.isInteger(W.shadowAt(W.heightOf(s, o.id), i)), `${o.id}@${i}`).toBe(true);
      }
    }
  });

  it('le soleil du manuel : à 15 h 00, bâton 1,6 m, minaret 11,6 m ; le bâton à 10 m fait finir les ombres ensemble', () => {
    const s = W.setHour(W.init(), TB);
    expect(W.HOURS[TB]).toBe('15:00');
    expect(W.m(W.shadowAt(100, TB))).toBe('1,6');
    expect(W.m(W.minaretTip(s))).toBe('11,6');
    expect(W.stickMeets(s, TB, 1000)).toBe(true);
    expect(W.stickMeets(s, TB, 995)).toBe(false);
  });

  it('k croît pendant l’après-midi (la courbe du soleil est monotone) et vaut 1 à 12 h 30', () => {
    for (let i = 1; i < W.K25.length; i += 1) expect(W.K25[i]).toBeGreaterThan(W.K25[i - 1]);
    expect(W.kAt(0)).toBe(1);
    expect(W.kAt(5)).toBeCloseTo(1.6);
    expect(W.kAt(4.5)).toBeCloseTo((1.32 + 1.6) / 2);
  });

  it('la tête du bâton est dans l’ombre de la minaret tant que son ombre finit avant O', () => {
    const s = W.setHour(W.init(), TB);
    expect(W.stickHidden(s, TB, 900)).toBe(true);
    expect(W.stickHidden(s, TB, 1000)).toBe(false);
    expect(W.stickHidden(s, TB, 1100)).toBe(false);
  });

  it('nombres : écriture arabe à virgule, saisie tolérante', () => {
    expect(W.m(1160)).toBe('11,6');
    expect(W.m(725)).toBe('7,25');
    expect(W.m(100)).toBe('1');
    expect(W.tex(1160)).toBe('11{,}6');
    expect(W.parseHundredths('1,6')).toBe(160);
    expect(W.parseHundredths('١٫٦')).toBe(160);
    expect(W.parseHundredths('7.25')).toBe(725);
    expect(W.parseHundredths('abc')).toBe(null);
  });

  it('refuse une minaret qui ne tombe pas sur 25 cm', () => {
    expect(() => W.init({ minaret: '7,3' })).toThrow();
  });
});

describe('shadow-world — mesurer', () => {
  it('le carnet garde UNE ligne par (heure, objet) ; une ombre avalée ne se mesure pas', () => {
    let s = W.setHour(W.init(), TB);
    s = W.placeStick(s, 400);
    expect(s.last.firstHidden).toBe(true);
    s = W.measure(s, 'stick');
    expect(s.last.kind).toBe('measureHidden');
    expect(s.notebook).toHaveLength(0);
    s = W.placeStick(s, 1200);
    s = W.measure(s, 'stick');
    s = W.measure(s, 'stick');
    expect(s.notebook).toHaveLength(1);
    expect(s.notebook[0]).toMatchObject({ hour: TB, obj: 'stick', shadow: 160 });
    s = W.measure(s, 'farid');
    expect(s.last.sameHour).toBe(2);
    expect(W.react(s).id).toBe('rTwoSameHour');
  });

  it('un objet pas encore installé ne se mesure pas', () => {
    const s = W.init();
    expect(W.measure(s, 'lamp')).toBe(s);
  });

  it('le ruban qui grimpe la minaret est refusé', () => {
    const s = W.climb(W.init());
    expect(W.react(s).id).toBe('rClimb');
  });
});

describe('shadow-world — le pronostic révèle le modèle de l’élève', () => {
  const at = (i) => W.setHour(W.init(), i);
  const bet = (s, p) => W.install(W.setFlag(s, p));

  it.each([
    [480, 'right'], // 3 × 1,6
    [360, 'additive'], // 3 + 0,6
    [160, 'copy'],
    [300, 'equal'],
    [190, 'inverse'], // 3 ÷ 1,6 = 1,875
    [250, 'short'],
    [700, 'long'],
  ])('lampadaire à 15 h 00, pronostic %i cm → %s', (p, kind) => {
    const s = bet(at(TB), p);
    expect(s.predictions[0].kind).toBe(kind);
    expect(s.installed.lamp).toBe(true);
    expect(s.flagP).toBe(null);
  });

  it('à 12 h 30 (k = 1) un pronostic juste NE PROUVE RIEN : ajouter et multiplier coïncident', () => {
    const s = bet(at(0), 300);
    expect(s.predictions[0].kind).toBe('right');
    expect(s.predictions[0].discriminating).toBe(false);
    expect(W.react(s).id).toBe('rPredLucky');
    const t = bet(at(TB), 480);
    expect(t.predictions[0].discriminating).toBe(true);
    expect(W.react(t).id).toBe('rPredRight');
  });

  it('la commune installe le lampadaire, puis la hampe, puis plus rien', () => {
    let s = bet(at(TB), 480);
    expect(W.nextInstall(s)).toBe('flag');
    s = bet(s, 960);
    expect(W.nextInstall(s)).toBe(null);
    expect(W.setFlag(s, 100)).toBe(s);
  });
});

describe('shadow-world — la règle de l’élève, testée par le monde', () => {
  it('« + 0,6 » colle au bâton mais pas à فريد ; « × 1,6 » colle à tout ; le soleil qui bouge la réfute', () => {
    let s = W.setHour(W.init(), TB);
    s = W.applyRule(s, '+', 60);
    expect(s.rules[0].allFit).toBe(false);
    expect(s.rules[0].fits.find((f) => f.obj === 'stick').ok).toBe(true);
    expect(s.rules[0].fits.find((f) => f.obj === 'farid').ok).toBe(false);
    expect(W.react(s).id).toBe('rRulePartial');
    s = W.applyRule(s, '×', 160);
    expect(s.rules[1].allFit).toBe(true);
    expect(W.react(s).id).toBe('rRuleFits');
    s = W.setHour(s, 6);
    expect(s.last.ruleStill).toBe(false);
    expect(W.react(s).id).toBe('rRuleBroken');
    s = W.applyRule(s, '×', 184);
    expect(s.rules[2].allFit).toBe(true);
    expect(W.react(s).id).toBe('rRuleFitsAgain');
  });

  it('à 12 h 30, « + 0 » colle aussi — le compagnon le signale au lieu de valider', () => {
    let s = W.setHour(W.init(), 0);
    s = W.applyRule(s, '+', 0);
    expect(s.rules[0].allFit).toBe(true);
    expect(W.react(s).id).toBe('rRulePlusFits');
    expect(W.goals(s).rule).toBe(false);
  });

  it('une seule règle juste ne suffit pas : il faut l’avoir RÉPARÉE à une autre heure', () => {
    let s = W.init();
    s = W.setHour(s, 3); s = W.setHour(s, TB);
    s = W.answerQuiz(s, 'trend', W.judgeTrend(s).correct);
    s = W.setHour(s, 6); // un deuxième mouvement pour que `fastest` ait deux heures DISTINCTES à comparer
    s = W.answerQuiz(s, 'fastest', W.judgeFastest(s).correct);
    s = W.setHour(s, TB);
    s = W.placeStick(s, 1300); // hors de l'ombre de la minaret à cette heure : mesurable
    s = W.measure(s, 'farid'); s = W.measure(s, 'stick'); s = W.measure(s, 'minaret');
    s = W.answerQuiz(s, 'ratioSeed', 'same');
    s = W.install(W.setFlag(s, 360));
    s = W.answerQuiz(s, 'predictReflect', W.judgePredictReflect(s).correct);
    s = W.applyRule(s, '×', 160);
    s = W.answerQuiz(s, 'ruleReflect', 'form');
    expect(W.discoveryReady(s)).toBe(false);
    s = W.setHour(s, 3);
    s = W.applyRule(s, '×', 120);
    expect(W.discoveryReady(s)).toBe(true);
    expect(W.fittingRules(s).map((r) => r.num)).toEqual([120, 160]);
  });
});

describe('shadow-world — le tuteur : une question BLOQUE l’étape jusqu’à la bonne réponse', () => {
  it('le premier mouvement du soleil ouvre "trend" ; une mauvaise réponse ne débloque rien, la bonne si', () => {
    let s = W.setHour(W.init(), 4); // plus tard que l'heure initiale (1) : les ombres s'allongent
    expect(W.currentCheckpoint(s)).toBe('trend');
    expect(W.currentGoal(s)).toBe('quiz_trend');
    const wrong = W.judgeTrend(s).correct === 'longer' ? 'shorter' : 'longer';
    s = W.answerQuiz(s, 'trend', wrong);
    expect(s.last.correctPick).toBe(false);
    expect(s.quizzes.trend).toBeUndefined();
    expect(W.currentCheckpoint(s)).toBe('trend'); // toujours bloqué
    s = W.answerQuiz(s, 'trend', 'longer');
    expect(s.last.correctPick).toBe(true);
    expect(s.quizzes.trend).toBe(true);
  });

  it('"fastest" exige deux heures DISTINCTES, et sa bonne réponse est toujours la مئذنة (plus haute)', () => {
    let s = W.init(); // hour = 1, hoursSeen = [1] : une seule heure, rien à comparer
    expect(W.judgeFastest(s)).toBe(null);
    s = W.setHour(s, 4); // hoursSeen = [1, 4] : deux heures distinctes, assez pour juger
    s = W.answerQuiz(s, 'trend', W.judgeTrend(s).correct);
    const v = W.judgeFastest(s);
    expect(v).not.toBe(null);
    expect(v.correct).toBe('minaret');
    expect(v.dMinaret).toBeGreaterThan(v.dStick); // en centimètres, l'objet le plus haut varie le plus
    expect(v.pctMinaret).toBe(v.pctStick); // mais en POURCENTAGE, les deux varient de la même façon (le phénomène)
    s = W.answerQuiz(s, 'fastest', 'stick');
    expect(s.quizzes.fastest).toBeUndefined();
    s = W.answerQuiz(s, 'fastest', 'minaret');
    expect(s.quizzes.fastest).toBe(true);
  });

  it('"ratioSeed" ne se pose qu’avec DEUX objets connus mesurés à la MÊME heure, et sa réponse est toujours "same"', () => {
    let s = W.setHour(W.init(), TB);
    s = W.placeStick(s, 1300); // hors de l'ombre de la minaret à cette heure : mesurable
    expect(W.judgeRatioSeed(s)).toBe(null);
    s = W.measure(s, 'farid');
    expect(W.judgeRatioSeed(s)).toBe(null); // un seul objet connu mesuré : rien à comparer encore
    s = W.measure(s, 'stick');
    const v = W.judgeRatioSeed(s);
    expect(v.correct).toBe('same');
    expect(v.ra).toBe(v.rb); // ombre ÷ hauteur × 100, identique pour les deux objets à cette heure
    // `a`/`b` sont des ids d'OBJETS (traduits par la vue via `obj.<id>`), jamais des noms bruts à afficher tels quels.
    expect(W.OBJECTS.map((o) => o.id)).toContain(v.a);
    expect(W.OBJECTS.map((o) => o.id)).toContain(v.b);
  });

  it('"predictReflect" JUGE correctement le pari contre le modèle de `classify`, répondable une fois trend/fastest franchis', () => {
    let s = W.install(W.setFlag(pastObserve(), 360)); // 3 + 0,6 : modèle additif
    const v = W.judgePredictReflect(s);
    expect(v.correct).toBe('additive'); // le juge est correct indépendamment de la porte
    s = W.answerQuiz(s, 'predictReflect', 'equal');
    expect(s.quizzes.predictReflect).toBeUndefined();
    s = W.answerQuiz(s, 'predictReflect', 'additive');
    expect(s.quizzes.predictReflect).toBe(true);
  });

  it('un pari JUSTE ne pose pas "predictReflect" : rien à faire reconnaître', () => {
    let s = W.setHour(W.init(), TB);
    s = W.install(W.setFlag(s, 480)); // 3 × 1,6 exact
    expect(s.predictions.at(-1).kind).toBe('right');
    expect(W.judgePredictReflect(s)).toBe(null);
  });

  it('"ruleReflect" se pose dès la première règle × juste, répondable une fois trend/fastest franchis', () => {
    let s = W.applyRule(pastObserve(), '×', 160);
    const v = W.judgeRuleReflect(s);
    expect(v.correct).toBe('form'); // le juge est correct indépendamment de la porte
    s = W.answerQuiz(s, 'ruleReflect', 'number');
    expect(s.quizzes.ruleReflect).toBeUndefined();
    s = W.answerQuiz(s, 'ruleReflect', 'form');
    expect(s.quizzes.ruleReflect).toBe(true);
  });

  it('currentGoal ne révèle jamais deux questions à la fois : une seule porte ouverte à la fois, dans l’ordre pédagogique', () => {
    let s = W.setHour(W.init(), 4);
    s = W.setHour(s, 6);
    s = W.answerQuiz(s, 'fastest', W.judgeFastest(s)?.correct); // répondu hors ordre : ne compte pas tant que trend bloque
    expect(W.currentGoal(s)).toBe('quiz_trend');
    s = W.answerQuiz(s, 'trend', W.judgeTrend(s).correct);
    expect(W.currentGoal(s)).toBe('quiz_fastest'); // fastest redevient posable, et n'a pas été « gagné » par l'essai précoce
  });
});

describe('shadow-world — le défi et ses fausses démarches', () => {
  const ready = () => {
    let s = W.setHour(W.init(), TB);
    s = W.placeStick(s, 1200);
    s = W.measure(s, 'stick');
    s = W.measure(s, 'minaret');
    return s;
  };

  it.each([
    ['7,25', 'right'],
    ['11,6', 'shadowItself'],
    ['18,56', 'inverted'], // 11,6 × 1,6
    ['11', 'additive'], // 11,6 − 0,6
    ['3', 'tooLow'],
    ['20', 'tooHigh'],
  ])('h = %s → %s', (raw, kind) => {
    const s = W.answer(ready(), raw);
    expect(s.answers.at(-1).kind).toBe(kind);
  });

  it('deux heures mélangées : ombre de la minaret à 15 h 00, فريد mesuré à 16 h 00', () => {
    let s = ready();
    s = W.setHour(s, 7);
    s = W.measure(s, 'stick'); // à 16 h 00 la tête du bâton (12 m) est dans l'ombre de la minaret : rien
    expect(s.last.kind).toBe('measureHidden');
    s = W.measure(s, 'farid'); // 3,42 pour 1,5 m
    s = W.setHour(s, TB);
    const h = (1160 * 150) / 342; // ≈ 5,09
    s = W.answer(s, W.m(h));
    expect(s.answers.at(-1).kind).toBe('mixedHours');
  });

  it('la méthode du manuel : la distance AB = 10 m n’est pas la hauteur', () => {
    let s = W.setHour(W.init(), TB);
    s = W.placeStick(s, 1000);
    expect(s.last.meet).toBe(true);
    expect(W.react(s).id).toBe('rMeet');
    s = W.answer(s, '10');
    expect(s.answers.at(-1).kind).toBe('distance');
  });

  it('sans ombre mesurée, la réponse fausse le dit ; une saisie illisible aussi', () => {
    expect(W.answer(W.init(), '9').answers.at(-1).kind).toBe('noShadow');
    expect(W.answer(W.init(), 'x').last.kind).toBe('answerInvalid');
  });
});

describe('shadow-world — le compagnon ne donne jamais la règle', () => {
  it('chaque palier d’aide suit le checkpoint courant quand il y en a un, sinon l’étape', () => {
    let s = W.init();
    expect(W.help(s, 1).id).toBe('h_observe_1');
    expect(W.help(s, 9).id).toBe('h_observe_3');
    s = W.setHour(s, 4); // ouvre "trend" : l'aide porte maintenant sur la question, pas sur l'étape
    expect(W.help(s, 1).id).toBe('hq_trend_1');
    s = W.answerQuiz(s, 'trend', W.judgeTrend(s).correct);
    s = W.setHour(s, 3); // deuxième heure distincte : "fastest" devient posable
    expect(W.help(s, 1).id).toBe('hq_fastest_1');
    s = W.answerQuiz(s, 'fastest', W.judgeFastest(s).correct);
    s = W.setHour(s, TB);
    s = W.placeStick(s, 1300); // le bâton hors de l'ombre de la minaret à cette heure : mesurable
    s = W.measure(s, 'farid'); s = W.measure(s, 'stick');
    expect(W.help(s, 1).id).toBe('hq_ratioSeed_1');
    const rs = W.judgeRatioSeed(s);
    expect(rs.ra).toBe(rs.rb); // le rapport est le même pour les deux objets connus
    s = W.answerQuiz(s, 'ratioSeed', 'same');
    expect(W.goals(s).measure).toBe(true);
    s = W.install(W.setFlag(s, 360)); // pari additif, FAUX : predictReflect devient posable
    expect(W.help(s, 1).id).toBe('hq_predictReflect_1');
    s = W.answerQuiz(s, 'predictReflect', 'additive');
    expect(W.goals(s).predict).toBe(true);
    expect(W.currentGoal(s)).toBe('rule'); // retour au help normal de l'étape, le checkpoint est franchi
    expect(W.help(s, 1).id).toBe('h_rule_1');
  });

  it('un pari JUSTE ne pose pas predictReflect : goals.predict passe directement', () => {
    let s = W.setHour(W.init(), TB);
    s = W.install(W.setFlag(s, 480)); // 3 × 1,6 exact
    expect(s.predictions.at(-1).kind).toBe('right');
    expect(W.judgePredictReflect(s)).toBe(null);
    expect(W.goals(s).predict).toBe(true);
  });

  it('la règle « + » qui ne fit pas tout reste dans le help normal ; seule une règle × juste pose ruleReflect', () => {
    let s = pastObserve();
    s = W.placeStick(s, 1300);
    s = W.measure(s, 'farid'); s = W.measure(s, 'stick');
    s = W.answerQuiz(s, 'ratioSeed', 'same');
    s = W.install(W.setFlag(s, 480));
    s = W.applyRule(s, '+', 60);
    expect(W.help(s, 2).id).toBe('h_rulePlus_2'); // + ne fit pas tout : on reste dans le help normal de l'étape "rule"
    expect(W.judgeRuleReflect(s)).toBe(null);
    s = W.applyRule(s, '×', 160);
    expect(W.help(s, 1).id).toBe('hq_ruleReflect_1'); // × fit tout : ruleReflect se pose avant de pouvoir bouger le soleil
    s = W.answerQuiz(s, 'ruleReflect', 'form');
    expect(W.currentGoal(s)).toBe('rule2');
    expect(W.help(s, 1).id).toBe('h_rule2Same_1');
    expect(W.guide(s).id).toBe('g_rule2');
  });
});

describe('shadow-world — la scène', () => {
  it.each([320, 360, 390, 768, 1366])('largeur %i : tout tient, le soleil reste dans le ciel à toutes les heures', (width) => {
    const G = W.layout({ width, height: 420, minaret: 725 });
    expect(G.X(W.WORLD.xMin)).toBeGreaterThanOrEqual(0);
    expect(G.X(W.WORLD.xMax)).toBeLessThanOrEqual(width + 0.5);
    expect(G.height).toBeLessThanOrEqual(440);
    for (let i = 0; i < W.HOURS.length; i += 1) {
      const p = G.sunAt(W.K25[i] / 25);
      expect(p.x).toBeGreaterThan(0);
      expect(p.y).toBeGreaterThan(0);
      expect(W.hourFromPoint(G, p.x, p.y)).toBeCloseTo(i, 5);
      // le soleil est sur le prolongement du rayon (O, M) : (M − soleil) ∥ (O − M)
      const O = { x: G.X(W.shadowAt(725, i)), y: G.yBack };
      const cross = (G.M.x - p.x) * (O.y - G.M.y) - (G.M.y - p.y) * (O.x - G.M.x);
      expect(Math.abs(cross) / (G.R * Math.hypot(O.x - G.M.x, O.y - G.M.y))).toBeLessThan(1e-9);
    }
    expect(G.R).toBeGreaterThan(40);
    // l'ombre la plus longue (minaret à 16 h 00) et le bâton au plus loin restent dans le monde dessiné
    expect(725 * 57 / 25).toBeLessThanOrEqual(W.WORLD.xMax);
    expect(W.STICK_MAX + W.shadowAt(100, 7)).toBeLessThanOrEqual(W.WORLD.xMax);
  });
});

describe('shadow-world — jamais d’impasse avec le bâton (owner 2026-10-13)', () => {
  it.each(['5', '7,25'])('minaret %s m : le bâton démarre au soleil, mesurable à TOUTES les heures', (minaret) => {
    for (let i = 0; i < W.HOURS.length; i += 1) {
      const s = W.setHour(W.init({ minaret }), i);
      expect(W.stickHidden(s), `${minaret}@${W.HOURS[i]}`).toBe(false);
      expect(W.measure(s, 'stick').last.kind).toBe('measure');
    }
  });

  it.each(['5', '7,25'])('minaret %s m : « أبعِد العصا » sort toujours le bâton de l’ombre, sans jamais le poser à la place du manuel', (minaret) => {
    for (let i = 0; i < W.HOURS.length; i += 1) {
      let s = W.placeStick(W.setHour(W.init({ minaret }), i), W.STICK_MIN); // tête dans l'ombre
      s = W.placeStick(s, W.stickOutOfShadow(s));
      expect(W.stickHidden(s), `${minaret}@${W.HOURS[i]}`).toBe(false);
      expect(s.last.meet).toBe(false);
    }
  });

  it('une ombre avalée (planter ou mesurer) porte l’action « أبعِد العصا » dans la réaction du compagnon', () => {
    let s = W.placeStick(W.setHour(W.init(), TB), 400);
    expect(W.react(s)).toMatchObject({ id: 'rStickHidden', action: 'freeStick' });
    s = W.measure(s, 'stick');
    expect(W.react(s)).toMatchObject({ id: 'rMeasureHidden', action: 'freeStick' });
  });
});

describe('shadow-world — la progression des questions de مقران', () => {
  it('pending au départ ; current dès que la donnée existe ; done une fois gagnée ; skipped pour un pari juste', () => {
    let s = W.init();
    expect(W.checkpointStatus(s).map((c) => c.status)).toEqual(['pending', 'pending', 'pending', 'pending', 'pending']);
    s = W.setHour(s, 4);
    expect(W.checkpointStatus(s)[0]).toMatchObject({ id: 'trend', status: 'current' });
    s = W.answerQuiz(s, 'trend', 'longer');
    expect(W.checkpointStatus(s)[0].status).toBe('done');
    expect(W.checkpointStatus(s)[1]).toMatchObject({ id: 'fastest', status: 'current' });
    const right = W.install(W.setFlag(W.setHour(W.init(), TB), 480));
    expect(W.checkpointStatus(right).find((c) => c.id === 'predictReflect').status).toBe('skipped');
  });
});

describe('shadow-world — ratioSeed ne porte que sur des hauteurs CONNUES', () => {
  it('le palmier (hauteur inconnue) mesuré avec le bâton ne pose pas la question ; avec فريد, si', () => {
    let s = W.setHour(W.init(), TB); // bâton au soleil par défaut
    s = W.measure(W.measure(s, 'stick'), 'palm');
    expect(W.judgeRatioSeed(s)).toBe(null);
    s = W.measure(s, 'farid');
    const v = W.judgeRatioSeed(s);
    expect([v.a, v.b].sort()).toEqual(['farid', 'stick']);
  });
});
