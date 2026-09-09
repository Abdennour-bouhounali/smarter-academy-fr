import { describe, it, expect } from 'vitest';
import {
  OPS, OP_LABEL, etape, programme, programmeValide,
  executer, trace,
  estInversible, raisonNonInversible, inverser, remonter,
  formule, formuleTex, valeurTex, etapeTex, etapeTexte, programmeTexte,
  memeFormule, evaluerFormule,
  tableau, enPoints, tableauDecimal,
  testerFormule, formuleDepuisTableau, programmeDepuisFormule,
  pasRond, planeFor,
  assertScope4e,
  SITUATIONS, tableauSituation, pointsSituation,
  frRat, fr,
} from './fonctions4e';
import { rat, ratEq, ratToNumber, ratIsDecimal, expr } from '../../../../../common/algebra4e';
import * as f4 from './fonctions4e';

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   Un commentaire n'a jamais empêché une donnée hors programme d'atteindre
   l'écran ; ces tests le font.
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — ce que ce noyau ne SAIT PAS faire', () => {
  it('n’expose NI image NI antécédent (objets de 3e)', () => {
    expect(f4.image).toBeUndefined();
    expect(f4.imageOf).toBeUndefined();
    expect(f4.antecedent).toBeUndefined();
    expect(f4.antecedentsOf).toBeUndefined();
    expect(f4.antecedents).toBeUndefined();
  });

  it('n’expose AUCUNE notation fonctionnelle f(x) (objet de 3e)', () => {
    expect(f4.fx).toBeUndefined();
    expect(f4.formatImage).toBeUndefined();
    expect(f4.evaluer).toBeUndefined();
    expect(f4.nommerFonction).toBeUndefined();
  });

  it('n’expose NI fonction linéaire NI fonction affine, ni leur classement (3e)', () => {
    expect(f4.fonctionLineaire).toBeUndefined();
    expect(f4.fonctionAffine).toBeUndefined();
    expect(f4.lineaire).toBeUndefined();
    expect(f4.affine).toBeUndefined();
    expect(f4.isLinear).toBeUndefined();
    expect(f4.isAffine).toBeUndefined();
    expect(f4.classify).toBeUndefined();
    expect(f4.classifier).toBeUndefined();
    expect(f4.coefficientDirecteur).toBeUndefined();
    expect(f4.ordonneeOrigine).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets, avec la raison', () => {
    const interdits = [
      'image', 'antecedent', 'notation-fx',
      'fonction-lineaire', 'fonction-affine',
      'coefficient-directeur', 'ordonnee-origine',
    ];
    for (const sujet of interdits) {
      expect(() => assertScope4e(sujet), sujet).toThrow(/3e/);
    }
  });

  it('assertScope4e LAISSE passer ce qui EST au programme de 4e', () => {
    for (const sujet of [
      'programme-de-calcul', 'inverser-programme', 'produire-formule',
      'tableau-de-valeurs', 'representer-graphiquement', 'modeliser',
    ]) {
      expect(assertScope4e(sujet), sujet).toBe(true);
    }
  });

  it('AUCUNE écriture produite par ce noyau ne contient « f(x) », « image » ou « antécédent »', () => {
    const ecrits = [];
    for (const s of Object.values(SITUATIONS)) {
      ecrits.push(s.formuleTex(), s.nom, s.question, s.note, s.entreeNom, s.sortieNom);
      ecrits.push(programmeTexte(s.prog), ...s.prog.map(etapeTex), ...s.prog.map(etapeTexte));
    }
    for (const t of ecrits) {
      expect(t, t).not.toMatch(/f\s*\(\s*x\s*\)/i);
      expect(t, t).not.toMatch(/image|antécédent|antecedent|affine|linéaire|lineaire/i);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   EXÉCUTER — et rester EXACT
   ══════════════════════════════════════════════════════════════════════ */
describe('executer — le programme rend un rationnel EXACT, jamais un arrondi', () => {
  it('« ÷ 3 » sur 1 rend 1/3, et surtout PAS 0,333…', () => {
    const p = programme(['÷', 3]);
    const y = executer(p, 1);
    expect(ratEq(y, rat(1, 3))).toBe(true);
    expect(ratIsDecimal(y)).toBe(false);
    expect(y.n).toBe(1);
    expect(y.d).toBe(3);
    // le flottant correspondant N'EST PAS la valeur stockée
    expect(ratToNumber(y)).not.toBe(0.333);
    expect(ratToNumber(y)).toBeCloseTo(0.333333, 5);
  });

  it('trois tiers reviennent exactement à 1 — l’aller-retour se referme au nombre près', () => {
    const p = programme(['÷', 3], ['×', 3]);
    for (let x = -20; x <= 20; x += 1) {
      expect(ratEq(executer(p, x), rat(x)), `x=${x}`).toBe(true);
    }
  });

  it('l’ORDRE des étapes change le résultat — le premier constat du niveau', () => {
    const a = programme(['×', 3], ['+', 2]); // 3x + 2
    const b = programme(['+', 2], ['×', 3]); // 3x + 6
    expect(ratEq(executer(a, 5), rat(17))).toBe(true);
    expect(ratEq(executer(b, 5), rat(21))).toBe(true);
    expect(memeFormule(a, b)).toBe(false);
  });

  it('la trace donne la valeur après CHAQUE étape, dans l’ordre', () => {
    const p = programme(['×', 3], ['+', 2], ['÷', 2]);
    const t = trace(p, 4);
    expect(t.etapes).toHaveLength(3);
    expect(t.etapes.map((e) => ratToNumber(e.apres))).toEqual([12, 14, 7]);
    expect(ratEq(t.depart, rat(4))).toBe(true);
    expect(ratEq(t.arrivee, executer(p, 4))).toBe(true);
    // chaque étape part de l'arrivée de la précédente : la chaîne est continue
    for (let i = 1; i < t.etapes.length; i += 1) {
      expect(ratEq(t.etapes[i].avant, t.etapes[i - 1].apres), `étape ${i}`).toBe(true);
    }
  });

  it('un programme se construit et se valide, ou se refuse à la construction', () => {
    expect(programmeValide(programme(['×', 3], ['+', 2]))).toBe(true);
    expect(programmeValide([])).toBe(false);
    expect(programmeValide(null)).toBe(false);
    expect(programmeValide([{ op: '^', val: rat(2) }])).toBe(false);
    expect(() => etape('^', 2)).toThrow(/opération inconnue/);
    expect(() => etape('÷', 0)).toThrow(/zéro/);
  });

  it('les quatre opérations, et pas une de plus : ni carré ni racine', () => {
    expect(OPS).toEqual(['+', '−', '×', '÷']);
    expect(Object.keys(OP_LABEL).sort()).toEqual([...OPS].sort());
  });
});

/* ══════════════════════════════════════════════════════════════════════
   INVERSER — le cœur de l'approfondissement de 4e
   ══════════════════════════════════════════════════════════════════════ */
describe('inverser — remonter le programme, l’ordre retourné ET les opérations défaites', () => {
  it('« ×3 puis +2 » se défait par « −2 puis ÷3 » — et non par « ÷3 puis −2 »', () => {
    const p = programme(['×', 3], ['+', 2]);
    const q = inverser(p);
    expect(q.map((e) => e.op)).toEqual(['−', '÷']);
    expect(q.map((e) => ratToNumber(e.val))).toEqual([2, 3]);
    // l'erreur du niveau, chiffrée : garder l'ordre ne ramène PAS au départ
    const faux = programme(['÷', 3], ['−', 2]);
    const y = executer(p, 5); // 17
    expect(ratEq(executer(q, y), rat(5))).toBe(true);
    expect(ratEq(executer(faux, y), rat(5))).toBe(false);
  });

  it('ALLER-RETOUR EXHAUSTIF : toute grille de programmes × toute grille d’entrées', () => {
    const valeurs = [rat(1), rat(2), rat(3), rat(5), rat(-4), rat(1, 2), rat(2, 3), rat(-3, 4)];
    const entrees = [-7, -3, -1, 0, 1, 2, 5, 12];
    let combinaisons = 0;
    for (const op1 of OPS) {
      for (const v1 of valeurs) {
        for (const op2 of OPS) {
          for (const v2 of valeurs) {
            if ((op1 === '÷' && v1.n === 0) || (op2 === '÷' && v2.n === 0)) continue;
            const p = [etape(op1, v1), etape(op2, v2)];
            if (!estInversible(p)) continue;
            combinaisons += 1;
            for (const x of entrees) {
              const y = executer(p, x);
              expect(ratEq(remonter(p, y), rat(x)), `${op1}${v1.n}/${v1.d} ${op2}${v2.n}/${v2.d} x=${x}`).toBe(true);
            }
          }
        }
      }
    }
    // la grille est réellement balayée, pas court-circuitée
    expect(combinaisons).toBe(4 * 8 * 4 * 8);
  });

  it('l’aller-retour se referme aussi sur les programmes à TROIS étapes', () => {
    const p = programme(['÷', 3], ['−', rat(1, 2)], ['×', 6]);
    for (let x = -12; x <= 12; x += 1) {
      expect(ratEq(remonter(p, executer(p, x)), rat(x)), `x=${x}`).toBe(true);
    }
  });

  it('inverser deux fois redonne le programme de départ', () => {
    const p = programme(['×', 5], ['−', 4], ['÷', 2]);
    const pp = inverser(inverser(p));
    expect(pp.map((e) => e.op)).toEqual(p.map((e) => e.op));
    expect(pp.map((e) => ratToNumber(e.val))).toEqual(p.map((e) => ratToNumber(e.val)));
  });

  it('LE CONTRE-EXEMPLE : « ×0 » n’est PAS inversible, et la raison est lisible par l’élève', () => {
    const p = programme(['×', 3], ['×', 0], ['+', 7]);
    expect(estInversible(p)).toBe(false);
    expect(raisonNonInversible(p)).toMatch(/multiplie par 0/);
    expect(() => inverser(p)).toThrow(/non inversible/);
    // pourquoi : toutes les entrées donnent la MÊME sortie
    const sorties = [-5, 0, 1, 100].map((x) => ratToNumber(executer(p, x)));
    expect(new Set(sorties).size).toBe(1);
  });

  it('tout programme SANS « ×0 » est inversible, et raisonNonInversible rend null', () => {
    const p = programme(['×', -2], ['+', 9], ['÷', rat(3, 4)]);
    expect(estInversible(p)).toBe(true);
    expect(raisonNonInversible(p)).toBeNull();
  });

  it('« ÷0 » n’existe même pas : il est refusé à la construction, pas à l’inversion', () => {
    expect(() => programme(['÷', 0])).toThrow(/zéro/);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   PRODUIRE LA FORMULE
   ══════════════════════════════════════════════════════════════════════ */
describe('formule — l’écriture qui résume le programme', () => {
  it('« ×3 puis +2 » s’écrit 3x + 2', () => {
    expect(formuleTex(programme(['×', 3], ['+', 2]))).toBe('3x + 2');
  });

  it('la formule est vraie POUR TOUTE entrée, pas seulement pour celles du tableau', () => {
    const progs = [
      programme(['×', 3], ['+', 2]),
      programme(['+', 2], ['×', 3]),
      programme(['÷', 4], ['−', rat(1, 2)]),
      programme(['×', -1], ['+', 10]),
      programme(['×', rat(2, 3)], ['÷', 5], ['+', 1]),
    ];
    for (const p of progs) {
      const f = formule(p);
      for (let x = -25; x <= 25; x += 1) {
        expect(ratEq(evaluerFormule(f, x), executer(p, x)), `${formuleTex(p)} x=${x}`).toBe(true);
      }
      // et sur des entrées fractionnaires, que le tableau n'affiche jamais
      for (const x of [rat(1, 3), rat(-5, 7), rat(7, 2)]) {
        expect(ratEq(evaluerFormule(f, x), executer(p, x)), formuleTex(p)).toBe(true);
      }
    }
  });

  it('l’écriture n’invente rien : pas de « 1x », pas de « + −3 », virgule française', () => {
    expect(formuleTex(programme(['+', 5]))).toBe('x + 5');
    expect(formuleTex(programme(['−', 3]))).toBe('x − 3');
    expect(formuleTex(programme(['×', -1]))).toBe('−x');
    expect(formuleTex(programme(['×', rat(1, 2)]))).toBe('0{,}5x');
    expect(formuleTex(programme(['÷', 3]))).toBe('\\dfrac{1}{3}x');
    // le moins est bien le moins typographique U+2212
    expect(formuleTex(programme(['−', 3])).includes('−')).toBe(true);
  });

  it('DEUX PROGRAMMES DIFFÉRENTS peuvent avoir la MÊME formule — l’aha du module', () => {
    const a = programme(['×', 2], ['×', 3]);
    const b = programme(['×', 6]);
    expect(memeFormule(a, b)).toBe(true);
    expect(a).not.toHaveLength(b.length);
    for (let x = -10; x <= 10; x += 1) expect(ratEq(executer(a, x), executer(b, x))).toBe(true);
  });

  it('une formule redonne un programme, qui redonne la formule (aller-retour d’écriture)', () => {
    for (const p of [
      programme(['×', 3], ['+', 2]),
      programme(['+', 2], ['×', 3]),
      programme(['÷', 2], ['−', 7]),
      programme(['×', -25], ['+', 300]),
    ]) {
      const q = programmeDepuisFormule(formule(p));
      expect(memeFormule(p, q), formuleTex(p)).toBe(true);
      expect(q.length).toBeLessThanOrEqual(2);
    }
  });

  it('un programme sans terme en x n’est pas une dépendance : programmeDepuisFormule refuse', () => {
    expect(() => programmeDepuisFormule(expr(0, 5))).toThrow(/ne dépend pas/);
  });

  it('les écritures d’étape sont lisibles, en LaTeX comme en toutes lettres', () => {
    const p = programme(['×', 3], ['+', 2]);
    expect(etapeTex(p[0])).toBe('×\\, 3');
    expect(etapeTexte(p[0])).toBe('multiplier par 3');
    expect(programmeTexte(p)).toBe('multiplier par 3, puis ajouter 2');
    expect(valeurTex(rat(1, 3))).toBe('\\dfrac{1}{3}');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   DU TABLEAU À LA FORMULE — et le testeur de règle
   ══════════════════════════════════════════════════════════════════════ */
describe('tableau — la dépendance rangée en deux lignes', () => {
  it('chaque ligne du tableau est bien ce que le programme rend', () => {
    const p = programme(['×', 7], ['+', 12]);
    const xs = [0, 1, 2, 5, 10];
    const t = tableau(p, xs);
    expect(t.map((c) => ratToNumber(c.y))).toEqual([12, 19, 26, 47, 82]);
    for (const c of t) expect(ratEq(c.y, executer(p, c.x))).toBe(true);
  });

  it('le tableau reste EXACT quand les sorties ne sont pas décimales', () => {
    const t = tableau(programme(['÷', 3]), [1, 2, 3]);
    expect(tableauDecimal(t)).toBe(false);
    expect(ratEq(t[0].y, rat(1, 3))).toBe(true);
    expect(ratEq(t[2].y, rat(1))).toBe(true);
  });

  it('enPoints ne convertit en flottant qu’au tout dernier moment', () => {
    const pts = enPoints(tableau(programme(['×', rat(1, 4)]), [1, 2]));
    expect(pts).toEqual([{ x: 1, y: 0.25 }, { x: 2, y: 0.5 }]);
  });
});

describe('testerFormule — une règle se juge sur TOUS les couples, jamais sur un seul', () => {
  const vrai = programme(['×', 3], ['+', 2]); // 3x + 2
  const couples = tableau(vrai, [0, 1, 2, 3, 4]);

  it('la bonne formule est d’accord partout', () => {
    const r = testerFormule(formule(vrai), couples);
    expect(r.valide).toBe(true);
    expect(r.accord).toBe(r.total);
    expect(r.echecs).toHaveLength(0);
  });

  it('LE PIÈGE : une formule qui tombe juste sur CERTAINS couples est REJETÉE', () => {
    // 4x + 1 : d'accord en x = 1 (5 = 5) et nulle part ailleurs.
    const menteuse = expr(4, 1);
    const r = testerFormule(menteuse, couples);
    expect(r.accord).toBeGreaterThan(0);   // elle tombe juste quelque part…
    expect(r.accord).toBeLessThan(r.total); // …mais pas partout
    expect(r.valide).toBe(false);
    expect(r.echecs.length).toBe(r.total - r.accord);
    // le rapport NOMME les couples qui la démentent
    expect(r.echecs.map((e) => ratToNumber(e.x))).toEqual([0, 2, 3, 4]);
    expect(ratToNumber(r.echecs[0].attendu)).toBe(2);
    expect(ratToNumber(r.echecs[0].obtenu)).toBe(1);
  });

  it('une formule d’accord sur UN SEUL couple ne passe pas — même si c’est le premier', () => {
    const r = testerFormule(expr(1, 2), couples); // x + 2 : juste en x = 0
    expect(r.accord).toBe(1);
    expect(r.valide).toBe(false);
  });

  it('un PROGRAMME candidat se teste comme une formule, sans conversion par l’appelant', () => {
    expect(testerFormule(programme(['+', 2], ['×', 3]), couples).valide).toBe(false);
    expect(testerFormule(programme(['×', 3], ['+', 2]), couples).valide).toBe(true);
  });

  it('sans aucun couple, RIEN n’est validé : une formule non contredite n’est pas prouvée', () => {
    expect(testerFormule(expr(3, 2), []).valide).toBe(false);
  });

  it('formuleDepuisTableau retrouve la formule, et la VÉRIFIE sur tous les couples', () => {
    for (const p of [
      programme(['×', 3], ['+', 2]),
      programme(['×', -25], ['+', 300]),
      programme(['÷', 4]),
      programme(['×', rat(2, 3)], ['−', 1]),
    ]) {
      const f = formuleDepuisTableau(tableau(p, [0, 1, 2, 5, 8]));
      expect(f, formuleTex(p)).not.toBeNull();
      expect(ratEq(f.x, formule(p).x)).toBe(true);
      expect(ratEq(f.k, formule(p).k)).toBe(true);
    }
  });

  it('un tableau qui ne cache AUCUNE formule de ce type rend null — c’est une réponse', () => {
    // des carrés : 0, 1, 4, 9 — aucun programme de 4e ne les produit
    const carres = [0, 1, 2, 3].map((x) => ({ x: rat(x), y: rat(x * x) }));
    expect(formuleDepuisTableau(carres)).toBeNull();
  });

  it('moins de deux entrées DISTINCTES : rien à déterminer, null', () => {
    expect(formuleDepuisTableau([{ x: 2, y: 7 }])).toBeNull();
    expect(formuleDepuisTableau([{ x: 2, y: 7 }, { x: 2, y: 7 }])).toBeNull();
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE CADRE DU GRAPHIQUE — jamais dégénéré, jamais mille traits
   ══════════════════════════════════════════════════════════════════════ */
describe('planeFor — un repère utilisable pour n’importe quels points', () => {
  const CAS = [
    { nom: 'liste vide', pts: [] },
    { nom: 'un seul point à l’origine', pts: [{ x: 0, y: 0 }] },
    { nom: 'points tous confondus', pts: [{ x: 3, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 3 }] },
    { nom: 'négatifs', pts: [{ x: -8, y: -40 }, { x: -1, y: -5 }] },
    { nom: 'des deux côtés de zéro', pts: [{ x: -5, y: 12 }, { x: 9, y: -3 }] },
    { nom: 'très grands', pts: [{ x: 0, y: 0 }, { x: 10000, y: 70000 }] },
    { nom: 'très petits décimaux', pts: [{ x: 0, y: 0 }, { x: 0.3, y: 0.12 }] },
    { nom: 'décimaux et entiers mêlés', pts: [{ x: 0.5, y: 2.25 }, { x: 7, y: 19.75 }] },
    { nom: 'un seul point très loin', pts: [{ x: 100000, y: 0.001 }] },
    { nom: 'valeurs non finies filtrées', pts: [{ x: NaN, y: 3 }, { x: 2, y: Infinity }, { x: 4, y: 8 }] },
  ];

  it('l’étendue n’est JAMAIS dégénérée — un repère plat diviserait par zéro', () => {
    for (const { nom, pts } of CAS) {
      const { range, unit, unitY } = planeFor(pts);
      expect(range.xMax, nom).toBeGreaterThan(range.xMin);
      expect(range.yMax, nom).toBeGreaterThan(range.yMin);
      expect(Number.isFinite(unit) && unit > 0, nom).toBe(true);
      expect(Number.isFinite(unitY) && unitY > 0, nom).toBe(true);
    }
  });

  it('les deux axes contiennent toujours 0 — CoordPlane les trace en 0', () => {
    for (const { nom, pts } of CAS) {
      const { range } = planeFor(pts);
      expect(range.xMin <= 0 && range.xMax >= 0, nom).toBe(true);
      expect(range.yMin <= 0 && range.yMax >= 0, nom).toBe(true);
    }
  });

  it('le nombre de graduations reste BORNÉ, même pour 10 000 ou 100 000', () => {
    for (const { nom, pts } of CAS) {
      const p = planeFor(pts, { maxTicks: 10 });
      expect(p.xTicks, `${nom} — x`).toBeLessThanOrEqual(13);
      expect(p.yTicks, `${nom} — y`).toBeLessThanOrEqual(13);
      expect(p.xTicks, `${nom} — x`).toBeGreaterThanOrEqual(2);
      expect(p.yTicks, `${nom} — y`).toBeGreaterThanOrEqual(2);
    }
  });

  it('tous les points TIENNENT dans le cadre', () => {
    for (const { nom, pts } of CAS) {
      const { range } = planeFor(pts);
      for (const p of pts.filter((q) => Number.isFinite(q.x) && Number.isFinite(q.y))) {
        expect(p.x >= range.xMin && p.x <= range.xMax, `${nom} x=${p.x}`).toBe(true);
        expect(p.y >= range.yMin && p.y <= range.yMax, `${nom} y=${p.y}`).toBe(true);
      }
    }
  });

  it('pasRond tient toujours l’étendue sous le plafond de graduations', () => {
    for (const e of [0, 0.01, 0.4, 1, 7, 23, 99, 1000, 12345, 987654]) {
      const p = pasRond(e, 10);
      expect(p, `étendue ${e}`).toBeGreaterThan(0);
      // une étendue nulle retombe sur 1 (rien à graduer) ; sinon le plafond tient
      expect((e > 0 ? e : 1) / p, `étendue ${e}`).toBeLessThanOrEqual(10);
    }
  });

  it('un repère fin ne s’écrase pas sur un pas entier : 0,3 mérite mieux que 1', () => {
    const p = planeFor([{ x: 0, y: 0 }, { x: 0.3, y: 0.12 }]);
    expect(p.xStep).toBeLessThan(1);
    expect(p.yStep).toBeLessThan(1);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES SITUATIONS — balayées sur TOUT leur domaine, jamais échantillonnées
   ══════════════════════════════════════════════════════════════════════ */
describe('Les situations à modéliser', () => {
  it('chaque situation a un programme valide, un domaine non vide et une formule', () => {
    for (const s of Object.values(SITUATIONS)) {
      expect(programmeValide(s.prog), s.id).toBe(true);
      expect(s.entrees.length, s.id).toBeGreaterThanOrEqual(5);
      expect(s.formuleTex(), s.id).toBeTruthy();
      expect(estInversible(s.prog), s.id).toBe(true);
    }
  });

  it('la valeur exacte et la valeur affichée s’accordent, sur TOUT le domaine', () => {
    for (const s of Object.values(SITUATIONS)) {
      for (const x of s.entrees) {
        expect(s.valeurNum(x), `${s.id} x=${x}`).toBeCloseTo(ratToNumber(s.valeur(x)), 9);
        expect(ratEq(evaluerFormule(s.formule(), x), s.valeur(x)), `${s.id} x=${x}`).toBe(true);
      }
    }
  });

  it('AUCUNE sortie négative sur le domaine : la figure ne peut pas mentir', () => {
    for (const s of Object.values(SITUATIONS)) {
      for (const x of s.entrees) {
        expect(s.valeurNum(x), `${s.id} x=${x}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('le forfait fait payer même pour zéro : la part fixe est visible dès x = 0', () => {
    const s = SITUATIONS.forfait;
    expect(s.valeurNum(0)).toBe(12);
    expect(s.formuleTex()).toBe('7x + 12');
    expect(s.valeurNum(10)).toBe(82);
  });

  it('LA SURPRISE : quand la longueur augmente, la largeur DIMINUE — c’est encore une dépendance', () => {
    const s = SITUATIONS.perimetreFixe;
    const ys = s.entrees.map((x) => s.valeurNum(x));
    expect(ys.every((y, i) => i === 0 || y < ys[i - 1])).toBe(true);
    // et le rectangle existe partout sur le domaine : largeur > 0 strictement
    for (const x of s.entrees) expect(s.valeurNum(x), `x=${x}`).toBeGreaterThan(0);
    // le périmètre annoncé est bien 20 : 2(L + l) = 20 pour toute longueur du domaine
    for (const x of s.entrees) expect(2 * (x + s.valeurNum(x)), `x=${x}`).toBe(20);
  });

  it('la conversion passe par l’origine, et n’a AUCUNE part fixe', () => {
    const s = SITUATIONS.conversion;
    expect(s.valeurNum(0)).toBe(0);
    expect(ratEq(formule(s.prog).k, rat(0))).toBe(true);
    expect(s.valeurNum(5)).toBe(8);
    // 8/5 exact : l'aller-retour se referme, ce que 1,6 en flottant ne garantirait pas
    for (const x of s.entrees) expect(ratEq(remonter(s.prog, s.valeur(x)), rat(x)), `x=${x}`).toBe(true);
  });

  it('la citerne est VIDE exactement à la minute 12, et cette durée est DANS le domaine', () => {
    const s = SITUATIONS.citerne;
    expect(s.valeurNum(0)).toBe(300);
    expect(s.valeurNum(12)).toBe(0);
    // remonter le programme depuis 0 donne la durée — c'est la question du module
    expect(ratEq(remonter(s.prog, rat(0)), rat(12))).toBe(true);
    expect(s.entrees).toContain(12);
    expect(Math.max(...s.entrees)).toBe(12); // et le domaine ne va pas plus loin
  });

  it('chaque situation se lit en points, dans un repère non dégénéré', () => {
    for (const s of Object.values(SITUATIONS)) {
      const pts = pointsSituation(s);
      expect(pts.length, s.id).toBe(s.entrees.length);
      const { range, xTicks, yTicks } = planeFor(pts);
      expect(range.xMax > range.xMin && range.yMax > range.yMin, s.id).toBe(true);
      expect(xTicks, s.id).toBeLessThanOrEqual(13);
      expect(yTicks, s.id).toBeLessThanOrEqual(13);
      for (const p of pts) {
        expect(p.x >= range.xMin && p.x <= range.xMax, `${s.id} x=${p.x}`).toBe(true);
        expect(p.y >= range.yMin && p.y <= range.yMax, `${s.id} y=${p.y}`).toBe(true);
      }
    }
  });

  it('le tableau d’une situation est celui de son programme — une seule source', () => {
    for (const s of Object.values(SITUATIONS)) {
      const t = tableauSituation(s);
      expect(t.map((c) => ratToNumber(c.y))).toEqual(s.entrees.map((x) => s.valeurNum(x)));
    }
  });

  it('les quatre situations ne se ressemblent pas : deux montent, deux descendent, une part de 0', () => {
    const pentes = Object.values(SITUATIONS).map((s) => ratToNumber(formule(s.prog).x));
    expect(pentes.filter((a) => a > 0).length).toBeGreaterThanOrEqual(2);
    expect(pentes.filter((a) => a < 0).length).toBeGreaterThanOrEqual(2);
    const parts = Object.values(SITUATIONS).map((s) => ratToNumber(formule(s.prog).k));
    expect(parts.filter((b) => b === 0).length).toBeGreaterThanOrEqual(1);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES ÉCRITURES — ce que l'élève LIT
   ══════════════════════════════════════════════════════════════════════ */
describe('Les écritures françaises', () => {
  it('un rationnel s’écrit entier, décimal à la virgule, ou fraction', () => {
    expect(frRat(rat(7))).toBe('7');
    expect(frRat(rat(1, 2))).toBe('0,5');
    expect(frRat(rat(1, 3))).toBe('1/3');
    expect(frRat(rat(-3))).toBe('−3');
  });

  it('le moins est le moins typographique U+2212, jamais le tiret du clavier', () => {
    expect(frRat(rat(-3)).charCodeAt(0)).toBe(0x2212);
    expect(fr(-4.5).charCodeAt(0)).toBe(0x2212);
  });

  it('fr sépare les milliers (espace fine insécable, U+202F)', () => {
    expect(fr(12500).replace(/[\u202f\u00a0 ]/g, ' ')).toBe('12 500');
    expect(fr(NaN)).toBe('—');
  });
});
