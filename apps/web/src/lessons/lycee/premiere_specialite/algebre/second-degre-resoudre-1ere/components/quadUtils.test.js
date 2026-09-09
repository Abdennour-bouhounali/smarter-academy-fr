/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « les deux points fusionnent
 * exactement quand Δ s'annule », « ce trinôme n'a pas de solution », « la
 * forme factorisée redonne le trinôme de départ ». Ce sont des CONTENUS
 * PÉDAGOGIQUES : si le comportement réel diffère, la leçon ment, et
 * `quadratic.test.js` ne l'attrape pas — il vérifie que `roots` est juste, pas
 * qu'un module dit vrai en la citant.
 *
 * PÉRIMÈTRE : aucun test ne porte sur le SIGNE d'un trinôme sur un intervalle,
 * ni sur une inéquation, ni sur la modélisation d'un problème concret : c'est
 * la leçon « Second degré : signe et problèmes ».
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  LAB, C_STEPS, labState, regimes, aVuLesTroisRegimes, TRINOMES, cadreDe,
  trinomeText, factoriseeText, solutionsText, fr, parseSigned,
  discriminant, roots, vertex, evalTrinome, rootCount,
} from './quadUtils';

describe('module 1 — le laboratoire « la parabole qui remonte »', () => {
  it('les crans de c sont croissants, régulierement espacés, et couvrent la plage', () => {
    expect(C_STEPS[0]).toBe(LAB.cMin);
    expect(C_STEPS.at(-1)).toBe(LAB.cMax);
    for (let i = 1; i < C_STEPS.length; i += 1) {
      expect(C_STEPS[i] - C_STEPS[i - 1]).toBeCloseTo(LAB.cStep, 12);
    }
  });

  it('CIBLE ATTEIGNABLE : Δ = 0 tombe EXACTEMENT sur un cran, et c’est c = 4', () => {
    // Sans ce contrôle, la fusion des deux points serait un état que l'élève
    // ne pourrait jamais atteindre : le module raconterait un phénomène
    // invisible, et son étape serait imbloquable.
    expect(C_STEPS).toContain(LAB.cFusion);
    expect(discriminant(LAB.a, LAB.b, LAB.cFusion)).toBe(0);
    // Et il est atteignable depuis le DÉPART, en un nombre entier de crans.
    const k = (LAB.cFusion - LAB.cStart) / LAB.cStep;
    expect(k).toBe(Math.round(k));
    expect(k).toBe(8);
  });

  it('LES TROIS RÉGIMES sont tous atteignables : 2 points, 1 point, 0 point', () => {
    const r = regimes();
    expect(r[2].length).toBeGreaterThan(0);
    expect(r[1].length).toBeGreaterThan(0);
    expect(r[0].length).toBeGreaterThan(0);
    // Un seul cran donne exactement un point : la fusion est un INSTANT.
    expect(r[1]).toEqual([LAB.cFusion]);
  });

  it('le signe de Δ bascule EXACTEMENT au cran de la fusion — c’est tout l’aha', () => {
    for (const c of C_STEPS) {
      const s = labState(c);
      if (c < LAB.cFusion) {
        expect(s.delta).toBeGreaterThan(0);
        expect(s.nombre).toBe(2);
      } else if (c === LAB.cFusion) {
        expect(s.delta).toBe(0);
        expect(s.nombre).toBe(1);
      } else {
        expect(s.delta).toBeLessThan(0);
        expect(s.nombre).toBe(0);
      }
    }
  });

  it('les deux points se RAPPROCHENT à mesure que c monte, jusqu’à se toucher', () => {
    let ecartPrecedent = Infinity;
    for (const c of C_STEPS) {
      const rs = roots(LAB.a, LAB.b, c);
      if (rs.length < 2) break;
      const ecart = rs[1] - rs[0];
      expect(ecart).toBeLessThan(ecartPrecedent);
      ecartPrecedent = ecart;
    }
    // Au cran de la fusion, l'écart est nul : un seul point.
    expect(roots(LAB.a, LAB.b, LAB.cFusion)).toHaveLength(1);
  });

  it('SÉCURITÉ DE MISE EN PAGE, BALAYÉE : tout ce que la figure montre reste DANS le cadre', () => {
    // Balayé, pas échantillonné : chaque cran de c, chaque racine, chaque
    // sommet. Une racine hors cadre serait un point que l'élève ne verrait pas
    // disparaître — il verrait la figure mentir.
    const { xMin, xMax, yMin, yMax } = LAB.range;
    for (const c of C_STEPS) {
      const s = labState(c);
      expect(s.sommet.x).toBeGreaterThanOrEqual(xMin);
      expect(s.sommet.x).toBeLessThanOrEqual(xMax);
      expect(s.sommet.y).toBeGreaterThanOrEqual(yMin);
      expect(s.sommet.y).toBeLessThanOrEqual(yMax);
      for (const r of s.racines) {
        expect(r).toBeGreaterThanOrEqual(xMin);
        expect(r).toBeLessThanOrEqual(xMax);
      }
    }
  });

  it('le sommet MONTE strictement avec c : le geste est bien « la parabole remonte »', () => {
    for (let i = 1; i < C_STEPS.length; i += 1) {
      expect(vertex(LAB.a, LAB.b, C_STEPS[i]).y)
        .toBeGreaterThan(vertex(LAB.a, LAB.b, C_STEPS[i - 1]).y);
    }
    // Et il traverse l'axe des abscisses EXACTEMENT au cran de la fusion.
    expect(vertex(LAB.a, LAB.b, LAB.cFusion).y).toBeCloseTo(0, 12);
  });

  it('l’objectif de l’étape n’est atteint qu’après les TROIS régimes', () => {
    expect(aVuLesTroisRegimes([0, 1, 2])).toBe(false);
    expect(aVuLesTroisRegimes([0, 4])).toBe(false);
    expect(aVuLesTroisRegimes([0, 4, 5])).toBe(true);
    expect(aVuLesTroisRegimes([3.5, 4, 4.5])).toBe(true);
  });

  it('les valeurs que le module 1 CITE sont exactes', () => {
    expect(labState(0).delta).toBe(16);
    expect(labState(0).racines).toEqual([0, 4]);
    expect(labState(3).delta).toBe(4);
    expect(labState(3).racines).toEqual([1, 3]);
    expect(labState(4).delta).toBe(0);
    expect(labState(4).racines).toEqual([2]);
    expect(labState(5).delta).toBe(-4);
    expect(labState(5).racines).toEqual([]);
  });
});

describe('modules 2 et 3 — Δ décide, et la formule des racines', () => {
  it('la formule (−b ± √Δ)/(2a) est bien ce que `roots` calcule', () => {
    for (const t of Object.values(TRINOMES)) {
      const d = discriminant(t.a, t.b, t.c);
      if (d < 0) { expect(roots(t.a, t.b, t.c)).toEqual([]); continue; }
      const r = Math.sqrt(d);
      const attendues = [(-t.b - r) / (2 * t.a), (-t.b + r) / (2 * t.a)]
        .sort((x, y) => x - y)
        .filter((v, i, arr) => d !== 0 || i === 0);
      const obtenues = roots(t.a, t.b, t.c);
      expect(obtenues).toHaveLength(attendues.length);
      obtenues.forEach((v, i) => expect(v).toBeCloseTo(attendues[i], 12));
    }
  });

  it('les trois cas ont chacun leur trinôme, et il dit vrai', () => {
    expect(discriminant(2, -1, -3)).toBe(25);
    expect(rootCount(2, -1, -3)).toBe(2);
    expect(discriminant(1, -6, 9)).toBe(0);
    expect(rootCount(1, -6, 9)).toBe(1);
    expect(discriminant(1, 2, 3)).toBe(-8);
    expect(rootCount(1, 2, 3)).toBe(0);
  });

  it('2x² − x − 3 a pour racines −1 et 1,5 — la valeur que le module affiche', () => {
    const rs = roots(2, -1, -3);
    expect(rs).toEqual([-1, 1.5]);
    for (const x of rs) expect(evalTrinome(2, -1, -3, x)).toBeCloseTo(0, 12);
    expect(solutionsText(2, -1, -3)).toBe('{ −1 ; 1,5 }');
  });

  it('x² − 6x + 9 a UNE racine, 3, et c’est (x − 3)²', () => {
    expect(roots(1, -6, 9)).toEqual([3]);
    expect(factoriseeText(1, -6, 9)).toBe('(x − 3)²');
  });

  it('x² + 2x + 3 n’a AUCUNE solution réelle, et son ensemble de solutions est vide', () => {
    expect(roots(1, 2, 3)).toEqual([]);
    expect(solutionsText(1, 2, 3)).toBe('∅');
    expect(factoriseeText(1, 2, 3)).toBeNull();
    // Et pourtant le trinôme existe : il ne s'annule simplement jamais.
    for (let x = -6; x <= 6; x += 0.25) expect(evalTrinome(1, 2, 3, x)).toBeGreaterThan(0);
  });

  it('a < 0 : −x² + 2x + 3 a pour racines −1 et 3, TRIÉES croissantes', () => {
    expect(roots(-1, 2, 3)).toEqual([-1, 3]);
    expect(vertex(-1, 2, 3)).toEqual({ x: 1, y: 4 });
  });

  it('racines IRRATIONNELLES : x² − 2x − 1 a pour racines 1 ± √2', () => {
    const rs = roots(1, -2, -1);
    expect(rs[0]).toBeCloseTo(1 - Math.SQRT2, 12);
    expect(rs[1]).toBeCloseTo(1 + Math.SQRT2, 12);
    // Le module affiche des valeurs approchées : elles doivent être justes.
    expect(fr(rs[0], { maxDecimals: 2 })).toBe('−0,41');
    expect(fr(rs[1], { maxDecimals: 2 })).toBe('2,41');
  });
});

describe('modules 5 et 6 — factoriser, et le lien avec la parabole', () => {
  it('la forme factorisée REDÉVELOPPE le trinôme de départ, pour chaque trinôme de la leçon', () => {
    for (const t of Object.values(TRINOMES)) {
      const rs = roots(t.a, t.b, t.c);
      if (rs.length === 0) continue;
      const [x1, x2] = rs.length === 1 ? [rs[0], rs[0]] : rs;
      // Balayé : la forme factorisée et le trinôme prennent les MÊMES valeurs.
      for (let x = -5; x <= 5; x += 0.25) {
        expect(t.a * (x - x1) * (x - x2)).toBeCloseTo(evalTrinome(t.a, t.b, t.c, x), 9);
      }
    }
  });

  it('l’écriture française des formes factorisées : le signe entre DANS la parenthèse', () => {
    // « 2(x + 1)(x − 1,5) » et jamais « 2(x − −1)(x − 1,5) ».
    expect(factoriseeText(2, -1, -3)).toBe('2(x + 1)(x − 1,5)');
    expect(factoriseeText(1, -4, 3)).toBe('(x − 1)(x − 3)');
    expect(factoriseeText(-1, 2, 3)).toBe('−(x + 1)(x − 3)');
    expect(factoriseeText(1, -6, 9)).toBe('(x − 3)²');
  });

  it('l’écriture française d’un trinôme', () => {
    expect(trinomeText(1, -4, 3)).toBe('x² − 4x + 3');
    expect(trinomeText(2, -1, -3)).toBe('2x² − x − 3');
    expect(trinomeText(-1, 2, 3)).toBe('−x² + 2x + 3');
    expect(trinomeText(1, 0, -4)).toBe('x² − 4');
    expect(trinomeText(1, -6, 9)).toBe('x² − 6x + 9');
  });

  it('P5 : le nombre de racines EST le nombre de points communs avec l’axe', () => {
    // C'est l'affirmation centrale du module 6 : on la vérifie en cherchant
    // les traversées de l'axe sur un balayage fin, sans utiliser `roots`.
    for (const t of Object.values(TRINOMES)) {
      let traversees = 0;
      let precedent = evalTrinome(t.a, t.b, t.c, -8);
      for (let x = -8 + 0.001; x <= 8; x += 0.001) {
        const y = evalTrinome(t.a, t.b, t.c, x);
        if (precedent * y < 0) traversees += 1;
        precedent = y;
      }
      const n = rootCount(t.a, t.b, t.c);
      // Δ = 0 : la parabole TOUCHE sans traverser — zéro changement de signe.
      expect(traversees).toBe(n === 1 ? 0 : n);
    }
  });

  it('P5 : quand Δ = 0 le sommet est SUR l’axe ; quand Δ < 0 il n’y touche jamais', () => {
    expect(vertex(1, -6, 9).y).toBe(0);
    expect(vertex(1, 2, 3).y).toBeGreaterThan(0);       // a > 0, tout au-dessus
    expect(vertex(-1, 0, -3).y).toBeLessThan(0);        // a < 0, tout en dessous
  });

  it('les cadres CALCULÉS contiennent le sommet et les racines de leur trinôme', () => {
    for (const t of Object.values(TRINOMES)) {
      const cadre = cadreDe(t);
      const v = vertex(t.a, t.b, t.c);
      expect(v.x).toBeGreaterThanOrEqual(cadre.xMin);
      expect(v.x).toBeLessThanOrEqual(cadre.xMax);
      expect(v.y).toBeGreaterThanOrEqual(cadre.yMin);
      expect(v.y).toBeLessThanOrEqual(cadre.yMax);
      for (const r of roots(t.a, t.b, t.c)) {
        expect(r).toBeGreaterThanOrEqual(cadre.xMin);
        expect(r).toBeLessThanOrEqual(cadre.xMax);
      }
      // L'axe des abscisses est toujours visible : sans lui, « couper l'axe »
      // n'aurait rien à montrer.
      expect(cadre.yMin).toBeLessThanOrEqual(0);
      expect(cadre.yMax).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('lecture des saisies élèves', () => {
  it('parseSigned accepte le VRAI signe moins que la leçon affiche', () => {
    // Le piège : `parseDec` du noyau refuse U+2212, et l'élève recopie ce
    // qu'il voit à l'écran. Sa réponse juste serait déclarée fausse.
    expect(parseSigned('−4')).toBe(-4);
    expect(parseSigned('-4')).toBe(-4);
    expect(parseSigned('−1,5')).toBe(-1.5);
    expect(parseSigned('1,5')).toBe(1.5);
    expect(parseSigned('0')).toBe(0);
    expect(parseSigned('abc')).toBeNaN();
  });

  it('fr écrit à la française, avec le vrai signe moins', () => {
    expect(fr(-4)).toBe('−4');
    expect(fr(1.5)).toBe('1,5');
    expect(fr(0)).toBe('0');
    expect(fr(25)).toBe('25');
  });
});

describe('mission finale — les distracteurs sont NUMÉRIQUEMENT distincts', () => {
  /**
   * Un distracteur qui vaut la bonne réponse rend la question insoluble, quoi
   * qu'en dise le texte. Le contrôle est arithmétique, jamais visuel.
   */
  it('e1 — Δ de x² − 5x + 6 vaut 1, et aucun piège ne vaut 1', () => {
    const bonne = discriminant(1, -5, 6);
    expect(bonne).toBe(1);
    const signeOublie = (-5) * (-5) + 4 * 1 * 6;      // 49 — le « + 4ac »
    const carreOublie = -5 - 4 * 1 * 6;               // −29 — b non élevé au carré
    const quatreOublie = 25 - 1 * 6;                  // 19 — le facteur 4 perdu
    expect(new Set([bonne, signeOublie, carreOublie, quatreOublie]).size).toBe(4);
  });

  it('e2 — Δ de 2x² + 3x + 5 vaut −31 : NÉGATIF, donc aucune solution', () => {
    expect(discriminant(2, 3, 5)).toBe(-31);
    expect(rootCount(2, 3, 5)).toBe(0);
  });

  it('e4 — les racines de x² − 5x + 6 sont 2 et 3, distinctes des pièges', () => {
    expect(roots(1, -5, 6)).toEqual([2, 3]);
    // Les pièges : le signe de b non changé (−2 et −3), et b/2 ± … .
    for (const p of [[-2, -3], [-3, -2], [1, 6]]) {
      expect(p).not.toEqual(roots(1, -5, 6));
    }
  });

  it('e5 — x² + x + 1 : Δ = −3, et le trinôme ne s’annule JAMAIS', () => {
    expect(discriminant(1, 1, 1)).toBe(-3);
    for (let x = -10; x <= 10; x += 0.1) expect(evalTrinome(1, 1, 1, x)).toBeGreaterThan(0);
  });

  it('e6 — la racine double de x² − 10x + 25 vaut 5', () => {
    expect(discriminant(1, -10, 25)).toBe(0);
    expect(roots(1, -10, 25)).toEqual([5]);
    expect(factoriseeText(1, -10, 25)).toBe('(x − 5)²');
  });

  it('e7 — 3x² − 12 se factorise en 3(x + 2)(x − 2), et le piège 3(x − 2)² est faux', () => {
    expect(roots(3, 0, -12)).toEqual([-2, 2]);
    expect(factoriseeText(3, 0, -12)).toBe('3(x + 2)(x − 2)');
    // Le piège : 3(x − 2)² vaut 27 en x = −1 là où le trinôme vaut −9.
    expect(3 * (-1 - 2) ** 2).not.toBeCloseTo(evalTrinome(3, 0, -12, -1), 6);
  });

  it('e8 — x² − x − 6 = (x + 2)(x − 3), et le piège (x − 2)(x + 3) redonne un AUTRE trinôme', () => {
    expect(roots(1, -1, -6)).toEqual([-2, 3]);
    expect(factoriseeText(1, -1, -6)).toBe('(x + 2)(x − 3)');
    // (x − 2)(x + 3) = x² + x − 6 : même c, mais b OPPOSÉ. Le piège est donc
    // franc — il n'a AUCUNE racine en commun avec le trinôme (2 et −3 contre
    // −2 et 3) — et il ne coïncide qu'en x = 0, où le terme en x s'efface.
    // C'est le vrai fait, et non « ils coïncident sur les racines communes » :
    // le balayage a corrigé cette supposition.
    expect(roots(1, 1, -6)).toEqual([-3, 2]);
    for (const r of roots(1, -1, -6)) expect(evalTrinome(1, 1, -6, r)).not.toBe(0);
    for (let x = -4; x <= 4; x += 0.5) {
      if (x === 0) continue;                            // le seul point commun
      expect((x - 2) * (x + 3)).not.toBeCloseTo(evalTrinome(1, -1, -6, x), 6);
    }
    expect((0 - 2) * (0 + 3)).toBe(evalTrinome(1, -1, -6, 0));
  });

  it('e9 — une parabole qui coupe l’axe en 2 points a bien Δ > 0', () => {
    expect(rootCount(1, -5, 6)).toBe(2);
    expect(discriminant(1, -5, 6)).toBeGreaterThan(0);
  });

  it('e10 — la parabole de x² − 4x + 7 est ENTIÈREMENT au-dessus de l’axe', () => {
    expect(discriminant(1, -4, 7)).toBe(-12);
    expect(vertex(1, -4, 7)).toEqual({ x: 2, y: 3 });
    for (let x = -10; x <= 10; x += 0.1) expect(evalTrinome(1, -4, 7, x)).toBeGreaterThan(0);
  });

  it('les cinq LP sont couverts par au moins une épreuve QUI LEUR EST PROPRE', () => {
    // Lu en TEXTE, comme le validateur : c'est ce qu'il voit réellement.
    const src = readFileSync(
      new URL('../modules/Module07MissionFinaleLeDiscriminant.jsx', import.meta.url),
      'utf8'
    );
    const listes = [...src.matchAll(/learningPointIds: \[([^\]]+)\]/g)].map((m) =>
      m[1].split(',').map((s) => s.trim().replace(/'/g, ''))
    );
    expect(listes).toHaveLength(10);
    const prefixe = 'premiere_specialite_second-degre-resoudre-1ere_P';
    for (const n of [1, 2, 3, 4, 5]) {
      const seule = listes.some((l) => l.length === 1 && l[0] === `${prefixe}${n}`);
      expect(seule, `P${n} doit avoir une épreuve dédiée`).toBe(true);
    }
  });
});

describe('les modules ne peuvent citer que des valeurs que le modèle produit', () => {
  /**
   * Balayage de TOUS les états atteignables du laboratoire, à travers ce que
   * ParabolaLab en dérive réellement : compteur, afficheur de Δ, légende des
   * points, sommet. Un état qui produirait NaN, Infinity ou « −0 » passerait
   * les tests d'affirmation ci-dessus tout en s'affichant faux à l'écran.
   */
  it('aucun état du laboratoire ne produit NaN, Infinity ou un zéro négatif', () => {
    for (const c of C_STEPS) {
      const s = labState(c);
      for (const v of [s.delta, s.sommet.x, s.sommet.y, ...s.racines]) {
        expect(Number.isFinite(v)).toBe(true);
        expect(Object.is(v, -0)).toBe(false);
      }
      // Ce que la légende écrit, caractère par caractère.
      for (const v of [s.delta, s.sommet.x, s.sommet.y, ...s.racines]) {
        expect(fr(v)).not.toContain('NaN');
        expect(fr(v)).not.toBe('−0');
      }
      expect([0, 1, 2]).toContain(s.nombre);
    }
  });

  it('chaque trinôme de la leçon s’écrit sans terme fantôme ni double signe', () => {
    for (const t of Object.values(TRINOMES)) {
      const txt = trinomeText(t.a, t.b, t.c);
      expect(txt).not.toMatch(/[+−-]\s*[+−-]/);   // « + − » ou « − − »
      expect(txt).not.toContain('NaN');
      expect(txt).not.toMatch(/(^|\s)0x/);        // un terme de coefficient nul
      const f = factoriseeText(t.a, t.b, t.c);
      if (f) {
        expect(f).not.toMatch(/x\s*−\s*−/);       // « (x − −1) »
        expect(f).not.toContain('NaN');
      }
    }
  });

  it('un a nul est refusé par le noyau plutôt que dessiné comme une droite', () => {
    // Le contrat du noyau partagé, vérifié DEPUIS la leçon : c'est ce qui
    // empêche un trinôme mal saisi de produire une figure silencieusement fausse.
    expect(() => discriminant(0, 1, 2)).toThrow();
  });
});
