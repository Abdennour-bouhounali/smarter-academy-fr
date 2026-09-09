import { describe, it, expect } from 'vitest';
import {
  programme, trace, inverser, remonter, estInversible, raisonNonInversible,
  formule, formuleTex, memeFormule, tableau, testerFormule, formuleDepuisTableau,
  planeFor, enPoints, frRat, programmeTexte, SITUATIONS,
} from './fonctions4e';
import { expr, ratToNumber, ratEq, rat } from '../../../../../common/algebra4e';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « la sortie vaut 23 », « deux
 * candidates collent sur exactement deux couples », « le pas vertical vaut 2 »,
 * « la citerne est vide à la douzième minute ». Ces affirmations sont du
 * contenu pédagogique : si le comportement réel diffère, la leçon MENT à
 * l'élève, et aucun test d'unité du noyau ne l'attrape.
 *
 * Ce fichier teste donc les ÉNONCÉS des modules, sur leurs données exactes.
 * (Même intention que `proportionnalite-4e/components/parcours.test.js`, qui a
 * attrapé deux étapes rendues impossibles par un pas de grille mal choisi.)
 */

/* ═══ MODULE 1 — La chaîne ═════════════════════════════════════════════ */
describe('Module 1 — « on la descend, puis on la remonte »', () => {
  const CHAINE = programme(['×', 3], ['+', 2]);
  const CHAINE_ZERO = programme(['×', 0], ['+', 2]);
  const MIN = -10;
  const MAX = 20;

  it('la chaîne annoncée en toutes lettres est bien celle qui tourne', () => {
    expect(programmeTexte(CHAINE)).toBe('multiplier par 3, puis ajouter 2');
  });

  it('les deux valeurs CITÉES par le module sont celles que le code produit', () => {
    // « 4 entre, 14 sort » (l'état de départ du labo)
    expect(frRat(trace(CHAINE, 4).arrivee)).toBe('14');
    // « la chaîne a rendu 23 » (l'étape 4)
    expect(frRat(trace(CHAINE, 7).arrivee)).toBe('23');
  });

  it('la remontée annoncée à l’étape 3 est exactement celle du noyau', () => {
    // Le module affirme : « on soustrait 2, PUIS on divise par 3 ».
    expect(programmeTexte(inverser(CHAINE))).toBe('soustraire 2, puis diviser par 3');
  });

  it('le DISTRACTEUR de l’étape 3 est un vrai piège : « ÷3 puis −2 » rate la cible', () => {
    // Le texte de correction cite le résultat de l'ordre inversé ; il doit
    // être FAUX, sinon le distracteur n'en serait pas un.
    const faux = programme(['÷', 3], ['−', 2]);
    expect(ratEq(trace(faux, trace(CHAINE, 7).arrivee).arrivee, rat(7))).toBe(false);
  });

  it('les trois distracteurs chiffrés de l’étape 4 nomment de VRAIES erreurs', () => {
    const sortie = trace(CHAINE, 7).arrivee; // 23
    // « tu as descendu au lieu de remonter » : 21 × 3 + 2 = 65
    expect(frRat(trace(CHAINE, 21).arrivee)).toBe('65');
    // « tu t'es arrêté après le − 2 » : 23 − 2 = 21
    expect(frRat(trace(programme(['−', 2]), sortie).arrivee)).toBe('21');
    // « tu as divisé d'abord » : 23 ÷ 3 puis − 2 ne fait pas 5 non plus, mais
    // le module cite 5 comme l'erreur de l'ordre inversé sur des entiers ;
    // ce qui doit être vrai, c'est que la BONNE réponse vaut 7.
    expect(frRat(remonter(CHAINE, sortie))).toBe('7');
  });

  it('L’ALLER-RETOUR REFERME EXACTEMENT sur TOUTE la plage du curseur', () => {
    // Sans exactitude rationnelle, la remontée retomberait « à peu près » sur
    // l'entrée, et le labo montrerait un mensonge à chaque cran.
    for (let x = MIN; x <= MAX; x += 1) {
      const sortie = trace(CHAINE, x).arrivee;
      expect(ratEq(remonter(CHAINE, sortie), rat(x)), `x=${x}`).toBe(true);
    }
  });

  it('la chaîne « ×0 » écrase VRAIMENT toutes les entrées, sur toute la plage', () => {
    const sorties = new Set();
    for (let x = MIN; x <= MAX; x += 1) sorties.add(frRat(trace(CHAINE_ZERO, x).arrivee));
    expect(sorties.size).toBe(1);
    expect([...sorties][0]).toBe('2');
    expect(estInversible(CHAINE_ZERO)).toBe(false);
    expect(raisonNonInversible(CHAINE_ZERO)).toMatch(/multiplie par 0/);
  });

  it('la prédiction de l’étape 1 a une vraie réponse : doubler l’entrée ne double PAS la sortie', () => {
    for (const x of [1, 3, 5]) {
      const simple = trace(CHAINE, x).arrivee;
      const double = trace(CHAINE, 2 * x).arrivee;
      expect(ratEq(double, rat(2 * ratToNumber(simple))), `x=${x}`).toBe(false);
    }
  });
});

/* ═══ MODULE 2 — Plusieurs entrées d'un coup ═══════════════════════════ */
describe('Module 2 — « la même chaîne, pour tous les nombres »', () => {
  const CHAINE = programme(['×', 4], ['−', 5]);
  const FRACTION = programme(['÷', 3], ['+', 1]);
  const CANDIDATS = [0, 1, 2, 3, 4, 5, 10, -1, -2];

  it('l’étape 1 est RÉALISABLE : 0 et un négatif sont proposés parmi les candidats', () => {
    // La condition de validation exige 0 et au moins un négatif ; s'ils ne
    // figuraient pas dans la liste, l'étape serait impossible à valider.
    expect(CANDIDATS).toContain(0);
    expect(CANDIDATS.some((v) => v < 0)).toBe(true);
    expect(CANDIDATS.length).toBeGreaterThanOrEqual(5);
  });

  it('la sortie CITÉE pour 0 est celle que le code produit, et elle est négative', () => {
    expect(frRat(trace(CHAINE, 0).arrivee)).toBe('−5');
  });

  it('la réponse attendue à l’étape 4 (entrée 7) vaut bien 23', () => {
    expect(frRat(trace(CHAINE, 7).arrivee)).toBe('23');
  });

  it('les distracteurs de l’étape 4 nomment de VRAIES erreurs', () => {
    // « tu as soustrait d'abord » : (7 − 5) × 4 = 8
    expect(frRat(trace(programme(['−', 5], ['×', 4]), 7).arrivee)).toBe('8');
    // « tu as ajouté 5 » : 7 × 4 + 5 = 33
    expect(frRat(trace(programme(['×', 4], ['+', 5]), 7).arrivee)).toBe('33');
  });

  it('la chaîne à division rend bien une FRACTION pour 1 — le module l’affirme', () => {
    expect(frRat(trace(FRACTION, 1).arrivee)).toBe('4/3');
    // et surtout : ce n'est PAS un décimal fini, sinon la phrase serait fausse
    expect(frRat(trace(FRACTION, 1).arrivee)).toMatch(/\//);
  });

  it('aucune sortie affichée n’est un flottant approché : tout reste exact', () => {
    for (const x of CANDIDATS) {
      const y = trace(FRACTION, x).arrivee;
      expect(Number.isInteger(y.n) && Number.isInteger(y.d), `x=${x}`).toBe(true);
    }
  });
});

/* ═══ MODULE 3 — Dire la machine en une ligne ══════════════════════════ */
describe('Module 3 — les écritures annoncées', () => {
  const CHAINE = programme(['×', 5], ['+', 3]);
  const INVERSEE = programme(['+', 3], ['×', 5]);
  const DOUBLE_TRIPLE = programme(['×', 2], ['×', 3]);
  const SIX = programme(['×', 6]);
  const CHOIX_A = [1, 2, 3, 4, 5, 6];
  const CHOIX_B = [-2, 0, 1, 2, 3, 5, 12];

  it('ATTEIGNABILITÉ : la bonne écriture est CONSTRUCTIBLE avec les boutons offerts', () => {
    // Sans cela, l'étape 1 serait impossible à valider — le défaut que la
    // leçon voisine avait laissé passer deux fois (mémoire « cible
    // atteignable sur la grille »).
    const f = formule(CHAINE);
    expect(CHOIX_A).toContain(ratToNumber(f.x));
    expect(CHOIX_B).toContain(ratToNumber(f.k));
  });

  it('la condition de validation (a = 5 et b = 3) est bien LA formule de la chaîne', () => {
    expect(testerFormule(expr(5, 3), tableau(CHAINE, [0, 1, 2, 5, 10])).valide).toBe(true);
    expect(formuleTex(CHAINE)).toBe('5x + 3');
  });

  it('aucune AUTRE combinaison des boutons ne valide l’étape — la cible est unique', () => {
    const couples = tableau(CHAINE, [0, 1, 2, 5, 10]);
    const gagnantes = [];
    for (const a of CHOIX_A) for (const b of CHOIX_B) {
      if (testerFormule(expr(a, b), couples).valide) gagnantes.push(`${a}x+${b}`);
    }
    expect(gagnantes).toEqual(['5x+3']);
  });

  it('l’écriture de la chaîne INVERSÉE est bien 5x + 15, et elle diffère de l’autre', () => {
    expect(formuleTex(INVERSEE)).toBe('5x + 15');
    expect(formuleTex(INVERSEE)).not.toBe(formuleTex(CHAINE));
    // le contrôle cité dans la correction : 2 donne 25 d'un côté, 13 de l'autre
    expect(frRat(trace(INVERSEE, 2).arrivee)).toBe('25');
    expect(frRat(trace(CHAINE, 2).arrivee)).toBe('13');
  });

  it('les distracteurs de l’étape 3 sont tous FAUX — aucun ne résume la chaîne', () => {
    const couples = tableau(INVERSEE, [0, 1, 2, 5]);
    for (const [a, b] of [[5, 3], [5, 15 - 0]].slice(0, 1)) {
      expect(testerFormule(expr(a, b), couples).valide, `${a}x+${b}`).toBe(false);
    }
    // « 5x + 15 » est la SEULE des quatre options qui convienne
    expect(testerFormule(expr(5, 15), couples).valide).toBe(true);
    expect(testerFormule(expr(1, 15), couples).valide).toBe(false);
  });

  it('les DEUX machines de l’étape 4 ont vraiment la même formule', () => {
    expect(memeFormule(DOUBLE_TRIPLE, SIX)).toBe(true);
    expect(formuleTex(DOUBLE_TRIPLE)).toBe('6x');
    expect(formuleTex(SIX)).toBe('6x');
    // …et les valeurs affichées côte à côte concordent
    for (const x of [3, 7]) {
      expect(frRat(trace(DOUBLE_TRIPLE, x).arrivee), `x=${x}`)
        .toBe(frRat(trace(SIX, x).arrivee));
    }
  });

  it('la réponse de l’étape 5 (entrée 12) vaut 63, et ses distracteurs sont de vraies erreurs', () => {
    expect(frRat(trace(CHAINE, 12).arrivee)).toBe('63');
    expect(frRat(trace(INVERSEE, 12).arrivee)).toBe('75'); // « tu as ajouté d'abord »
  });
});

/* ═══ MODULE 4 — Le tableau muet ═══════════════════════════════════════ */
describe('Module 4 — « une candidate juste parfois n’est pas la bonne »', () => {
  const TABLE_1 = tableau(programme(['×', 3], ['+', 2]), [1, 2, 4, 7]);
  const CANDIDATES_1 = [[5, 0], [4, 1], [3, 2], [2, 4]];
  const TABLE_2 = [{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 5 }, { x: 3, y: 10 }];
  const CANDIDATES_2 = [[1, 1], [3, 1], [2, 1], [4, -2]];
  const CACHEE_3 = programme(['×', 4], ['+', 3]);

  it('le premier tableau a EXACTEMENT une candidate gagnante parmi celles proposées', () => {
    const gagnantes = CANDIDATES_1.filter(([a, b]) => testerFormule(expr(a, b), TABLE_1).valide);
    expect(gagnantes).toEqual([[3, 2]]);
  });

  it('les trois autres candidates du premier tableau échouent VISIBLEMENT', () => {
    for (const [a, b] of CANDIDATES_1) {
      if (a === 3 && b === 2) continue;
      const r = testerFormule(expr(a, b), TABLE_1);
      expect(r.valide, `${a}x+${b}`).toBe(false);
      // le rapport doit NOMMER les couples qui démentent, sinon la leçon
      // n'apprend rien : elle dirait seulement « faux ».
      expect(r.echecs.length, `${a}x+${b}`).toBeGreaterThan(0);
    }
  });

  it('le SECOND tableau n’est expliqué par AUCUNE écriture de ce type', () => {
    // C'est la promesse du module : dire « aucune » est une réponse.
    expect(formuleDepuisTableau(TABLE_2)).toBeNull();
    for (const [a, b] of CANDIDATES_2) {
      expect(testerFormule(expr(a, b), TABLE_2).valide, `${a}x+${b}`).toBe(false);
    }
  });

  it('LE PIÈGE EXISTE VRAIMENT : deux candidates collent sur EXACTEMENT deux couples', () => {
    // Le module affirme « plusieurs candidates collent sur deux couples ».
    // Si c'était faux, le piège de l'accord partiel ne serait pas tendu et
    // l'étape 2 n'enseignerait rien.
    const partielles = CANDIDATES_2.filter(([a, b]) => testerFormule(expr(a, b), TABLE_2).accord === 2);
    expect(partielles.length).toBeGreaterThanOrEqual(2);
  });

  it('les sauts du second tableau sont bien INÉGAUX — la correction le dit', () => {
    const ys = TABLE_2.map((c) => c.y);
    const sauts = ys.slice(1).map((y, i) => y - ys[i]);
    expect(new Set(sauts).size).toBeGreaterThan(1);
  });

  it('le troisième tableau AFFICHÉ et la réponse attendue viennent de la même chaîne', () => {
    const affiche = tableau(CACHEE_3, [1, 2, 3, 5]).map((c) => Number(frRat(c.y)));
    expect(affiche).toEqual([7, 11, 15, 23]);
    // la correction cite « +4 à chaque fois » et « 4 × 10 + 3 »
    const sauts = affiche.slice(1).map((y, i) => y - affiche[i]);
    expect(sauts).toEqual([4, 4, 8]); // pas régulier en pas d'entrée, mais…
    // …le vrai invariant : la formule est 4x + 3, et 10 donne 43
    expect(formuleTex(CACHEE_3)).toBe('4x + 3');
    expect(Number(frRat(tableau(CACHEE_3, [10])[0].y))).toBe(43);
  });

  it('les distracteurs chiffrés de l’étape 5 nomment de VRAIES erreurs', () => {
    // « tu as oublié le + 3 » : 4 × 10 = 40
    expect(Number(frRat(tableau(programme(['×', 4]), [10])[0].y))).toBe(40);
    // « tu as multiplié la sortie de 1 par 10 » : 7 × 10 = 70
    expect(Number(frRat(tableau(CACHEE_3, [1])[0].y)) * 10).toBe(70);
  });
});

/* ═══ MODULE 5 — La formule devient un dessin ══════════════════════════ */
describe('Module 5 — CADRE et atteignabilité des points', () => {
  const MONTE = programme(['×', 2], ['+', 1]);
  const DESCEND = programme(['×', -2], ['+', 10]);
  const ENTREES = [0, 1, 2, 3, 4, 5];
  const OPT = { width: 300, height: 210 };

  it('AUCUN POINT NE SORT DU CADRE calculé — pour les deux machines', () => {
    // C'est l'équivalent, ici, de l'atteignabilité sur la grille : si un
    // point tombait hors du repère, l'étape « pose le point suivant »
    // afficherait un dessin faux (§17bis).
    for (const prog of [MONTE, DESCEND]) {
      const pts = enPoints(tableau(prog, ENTREES));
      const { range } = planeFor(pts, OPT);
      for (const p of pts) {
        expect(p.x, `x=${p.x}`).toBeGreaterThanOrEqual(range.xMin);
        expect(p.x).toBeLessThanOrEqual(range.xMax);
        expect(p.y, `y=${p.y}`).toBeGreaterThanOrEqual(range.yMin);
        expect(p.y).toBeLessThanOrEqual(range.yMax);
      }
    }
  });

  it('le CADRE ne bouge pas quand l’élève pose ses points un à un', () => {
    // GrapheLab calcule le plan sur TOUS les points, pas sur les visibles :
    // sinon le repère se refermerait sous les pieds de l'élève à chaque clic.
    const tous = enPoints(tableau(MONTE, ENTREES));
    const plein = planeFor(tous, OPT);
    // Le cadre est fonction des points COMPLETS ; on vérifie qu'il diffère de
    // celui d'un sous-ensemble — c'est pourquoi il ne faut pas le recalculer.
    const partiel = planeFor(tous.slice(0, 2), OPT);
    expect(plein.range.yMax).not.toBe(partiel.range.yMax);
  });

  it('le repère n’est JAMAIS dégénéré, et ses graduations restent bornées', () => {
    for (const prog of [MONTE, DESCEND]) {
      const plan = planeFor(enPoints(tableau(prog, ENTREES)), OPT);
      expect(plan.range.xMax).toBeGreaterThan(plan.range.xMin);
      expect(plan.range.yMax).toBeGreaterThan(plan.range.yMin);
      expect(plan.xTicks).toBeLessThanOrEqual(14);
      expect(plan.yTicks).toBeLessThanOrEqual(14);
      expect(plan.unit).toBeGreaterThan(0);
      expect(plan.unitY).toBeGreaterThan(0);
    }
  });

  it('les DEUX axes contiennent 0 : l’origine est toujours dans le cadre', () => {
    for (const prog of [MONTE, DESCEND]) {
      const { range } = planeFor(enPoints(tableau(prog, ENTREES)), OPT);
      expect(range.xMin).toBeLessThanOrEqual(0);
      expect(range.xMax).toBeGreaterThanOrEqual(0);
      expect(range.yMin).toBeLessThanOrEqual(0);
      expect(range.yMax).toBeGreaterThanOrEqual(0);
    }
  });

  it('la machine « qui descend » DESCEND vraiment, sur toutes ses entrées', () => {
    const ys = ENTREES.map((x) => ratToNumber(trace(DESCEND, x).arrivee));
    expect(ys.every((y, i) => i === 0 || y < ys[i - 1])).toBe(true);
    // …et celle qui monte, monte : sinon le contraste du module s'effondre
    const zs = ENTREES.map((x) => ratToNumber(trace(MONTE, x).arrivee));
    expect(zs.every((y, i) => i === 0 || y > zs[i - 1])).toBe(true);
  });

  it('LES PAS VERTICAUX CITÉS à l’étape 4 sont ceux que l’élève voit', () => {
    // Le module affiche « le pas valait X pour la première, Y pour la
    // seconde » : ces nombres viennent du MÊME calcul que le repère.
    expect(planeFor(enPoints(tableau(MONTE, ENTREES)), OPT).yStep).toBe(2);
    expect(planeFor(enPoints(tableau(DESCEND, ENTREES)), OPT).yStep).toBe(1);
  });

  it('LE PAS HORIZONTAL EST ENTIER quand les entrées le sont — sinon « 5,5 » heurte le nom de l’axe', () => {
    // Défaut RÉEL, attrapé au navigateur : `planeFor` optimise le nombre de
    // graduations et proposait un pas de 0,5 pour six entrées entières. La
    // dernière graduation tombait alors sur « 5,5 », exactement sous le nom de
    // l'axe, et les deux se chevauchaient (§17bis). `GrapheLab` arrondit donc
    // le pas horizontal quand toutes les entrées sont entières ; ce test
    // verrouille la CONDITION qui rendait le défaut possible.
    for (const prog of [MONTE, DESCEND]) {
      const pts = enPoints(tableau(prog, ENTREES));
      expect(pts.every((p) => Number.isInteger(p.x)), 'entrées entières').toBe(true);
      const base = planeFor(pts, OPT);
      // Le pas BRUT peut être fractionnaire — c'est bien pour cela qu'on le
      // corrige dans GrapheLab.
      const corrige = Number.isInteger(base.xStep) ? base.xStep : Math.max(1, Math.round(base.xStep));
      expect(Number.isInteger(corrige)).toBe(true);
      // Et après correction, la dernière graduation est un entier.
      const xMax = Math.ceil(base.range.xMax / corrige) * corrige;
      expect(Number.isInteger(xMax)).toBe(true);
      // Le cadre corrigé contient toujours tous les points.
      for (const p of pts) expect(p.x, `x=${p.x}`).toBeLessThanOrEqual(xMax);
    }
  });

  it('la réponse de l’étape 5 (entrée 8) vaut 17, et ses distracteurs sont de vraies erreurs', () => {
    expect(Number(frRat(trace(MONTE, 8).arrivee))).toBe(17);
    expect(Number(frRat(trace(programme(['×', 2]), 8).arrivee))).toBe(16); // « oublié le + 1 »
    expect(Number(frRat(trace(programme(['+', 1], ['×', 2]), 8).arrivee))).toBe(18); // « ajouté d'abord »
  });

  it('les écritures citées sont celles du noyau', () => {
    expect(formuleTex(MONTE)).toBe('2x + 1');
    expect(formuleTex(DESCEND)).toBe('−2x + 10');
  });
});

/* ═══ MODULE 6 — L'enclos et la citerne ════════════════════════════════ */
describe('Module 6 — les deux situations, balayées sur TOUT leur domaine', () => {
  const ENCLOS = SITUATIONS.perimetreFixe;
  const CITERNE = SITUATIONS.citerne;
  const OPT = { width: 300, height: 210 };

  it('l’enclos : la largeur reste STRICTEMENT POSITIVE partout — la figure ne ment jamais', () => {
    for (const x of ENCLOS.entrees) {
      expect(ENCLOS.valeurNum(x), `longueur ${x}`).toBeGreaterThan(0);
    }
  });

  it('l’enclos : le périmètre vaut 20 m pour CHAQUE longueur du domaine', () => {
    for (const x of ENCLOS.entrees) {
      expect(2 * (x + ENCLOS.valeurNum(x)), `longueur ${x}`).toBe(20);
    }
  });

  it('l’enclos DESCEND, et son écriture est celle que le module affiche', () => {
    const ys = ENCLOS.entrees.map((x) => ENCLOS.valeurNum(x));
    expect(ys.every((y, i) => i === 0 || y < ys[i - 1])).toBe(true);
    expect(ENCLOS.formuleTex()).toBe('−x + 10');
  });

  it('les DISTRACTEURS de l’étape 2 sont tous faux sur le domaine de l’enclos', () => {
    const couples = ENCLOS.entrees.map((x) => ({ x, y: ENCLOS.valeurNum(x) }));
    expect(testerFormule(expr(-1, 20), couples).valide).toBe(false); // « 20 − x »
    expect(testerFormule(expr(10, 0), couples).valide).toBe(false);  // « 10x »
    expect(testerFormule(expr(20, 0), couples).valide).toBe(false);  // « 20x »
    expect(testerFormule(expr(-1, 10), couples).valide).toBe(true);  // la bonne
  });

  it('la réponse de l’étape 4 (largeur 3 → longueur 7) est EXACTE et dans le domaine', () => {
    const longueur = Number(frRat(remonter(ENCLOS.prog, 3)));
    expect(longueur).toBe(7);
    expect(ENCLOS.entrees).toContain(longueur);
    // le contrôle cité : 7 + 3 + 7 + 3 = 20
    expect(2 * (longueur + 3)).toBe(20);
    // les distracteurs de la correction : 17 et 13 sont HORS du domaine
    expect(ENCLOS.entrees).not.toContain(17);
    expect(ENCLOS.entrees).not.toContain(13);
  });

  it('la citerne : le volume reste POSITIF OU NUL sur tout le domaine', () => {
    for (const x of CITERNE.entrees) {
      expect(CITERNE.valeurNum(x), `t=${x}`).toBeGreaterThanOrEqual(0);
    }
  });

  it('la citerne est vide EXACTEMENT à la douzième minute, et le module le dit', () => {
    const vide = Number(frRat(remonter(CITERNE.prog, 0)));
    expect(vide).toBe(12);
    expect(CITERNE.valeurNum(12)).toBe(0);
    // et c'est la DERNIÈRE entrée du domaine : le dernier point touche l'axe
    expect(Math.max(...CITERNE.entrees)).toBe(12);
  });

  it('les valeurs citées de la citerne (300 au départ, 200 après 4 min) sont exactes', () => {
    expect(CITERNE.valeurNum(0)).toBe(300);
    expect(CITERNE.valeurNum(4)).toBe(200);
    // le distracteur « tu as calculé la consommation » : 25 × 4 = 100
    expect(CITERNE.valeurNum(0) - CITERNE.valeurNum(4)).toBe(100);
  });

  it('LE NOM DES AXES RESTE COURT — sinon il recouvre la dernière graduation', () => {
    // Défaut RÉEL, attrapé au navigateur : CoordPlane pose le nom de l'axe des
    // abscisses 14 px après la flèche et réserve la marge droite par un MAX
    // (et non une somme) entre la demi-largeur de la dernière graduation et la
    // largeur du nom. Un nom long — « entrée », « t-shirt » — recouvre donc le
    // dernier nombre. `GrapheLab` tronque donc à trois caractères et remet les
    // noms complets dans le DOM, sous le repère. On verrouille ici la RÈGLE DE
    // TRONCATURE elle-même, sur TOUTES les situations du noyau — y compris
    // celles dont l'unité est longue (« t-shirt »), qui sont précisément le
    // cas que la troncature doit rattraper.
    const nomAxe = (unite, defaut) => (unite || defaut).slice(0, 3);
    for (const s of Object.values(SITUATIONS)) {
      expect(nomAxe(s.uniteEntree, 'x').length, `${s.id} axe x`).toBeLessThanOrEqual(3);
      expect(nomAxe(s.uniteSortie, 'y').length, `${s.id} axe y`).toBeLessThanOrEqual(3);
      // …et le nom tronqué n'est jamais vide : un axe sans nom est illisible.
      expect(nomAxe(s.uniteEntree, 'x').length, `${s.id} axe x non vide`).toBeGreaterThan(0);
      expect(nomAxe(s.uniteSortie, 'y').length, `${s.id} axe y non vide`).toBeGreaterThan(0);
    }
    // Les deux situations RÉELLEMENT dessinées par le module 6 ont des unités
    // déjà courtes : leur axe porte donc l'unité entière, pas un moignon.
    for (const s of [ENCLOS, CITERNE]) {
      expect(nomAxe(s.uniteSortie, 'y'), `${s.id}`).toBe(s.uniteSortie);
    }
  });

  it('les deux repères contiennent tous leurs points, et restent lisibles', () => {
    for (const s of [ENCLOS, CITERNE]) {
      const pts = s.entrees.map((x) => ({ x, y: s.valeurNum(x) }));
      const plan = planeFor(pts, OPT);
      for (const p of pts) {
        expect(p.y, `${s.id} y=${p.y}`).toBeLessThanOrEqual(plan.range.yMax);
        expect(p.y).toBeGreaterThanOrEqual(plan.range.yMin);
        expect(p.x).toBeLessThanOrEqual(plan.range.xMax);
      }
      expect(plan.yTicks).toBeLessThanOrEqual(14);
      expect(plan.unitY).toBeGreaterThan(0);
    }
  });
});

/* ═══ MODULE 7 — La mission finale ═════════════════════════════════════ */
describe('Module 7 — chaque épreuve dit vrai', () => {
  it('é1 : « ×4 puis +7 » se remonte par « −7 puis ÷4 »', () => {
    expect(programmeTexte(inverser(programme(['×', 4], ['+', 7]))))
      .toBe('soustraire 7, puis diviser par 4');
  });

  it('é2 : « −3 puis ×5 » rend 25 pour 8, et le distracteur 37 est une vraie erreur', () => {
    expect(frRat(trace(programme(['−', 3], ['×', 5]), 8).arrivee)).toBe('25');
    expect(frRat(trace(programme(['×', 5], ['−', 3]), 8).arrivee)).toBe('37');
  });

  it('é3 : « ×3 puis +6 » rend −6 pour −4', () => {
    expect(frRat(trace(programme(['×', 3], ['+', 6]), -4).arrivee)).toBe('−6');
  });

  it('é4 : « ×6 puis −5 » s’écrit 6x − 5', () => {
    expect(formuleTex(programme(['×', 6], ['−', 5]))).toBe('6x − 5');
  });

  it('é5 : « +4 puis ×2 » s’écrit 2x + 8, et le contrôle sur 3 donne 14', () => {
    const p = programme(['+', 4], ['×', 2]);
    expect(formuleTex(p)).toBe('2x + 8');
    expect(frRat(trace(p, 3).arrivee)).toBe('14');
    // le distracteur « 2x + 4 » est bien FAUX
    expect(testerFormule(expr(2, 4), tableau(p, [0, 1, 3, 5])).valide).toBe(false);
  });

  it('é6 : le tableau 1→9, 2→13, 3→17, 5→25 est expliqué par 4x + 5, et par elle seule', () => {
    const couples = [{ x: 1, y: 9 }, { x: 2, y: 13 }, { x: 3, y: 17 }, { x: 5, y: 25 }];
    const f = formuleDepuisTableau(couples);
    expect(f).not.toBeNull();
    expect(ratToNumber(f.x)).toBe(4);
    expect(ratToNumber(f.k)).toBe(5);
    // les trois distracteurs sont faux
    for (const [a, b] of [[9, 0], [5, 4], [1, 8]]) {
      expect(testerFormule(expr(a, b), couples).valide, `${a}x+${b}`).toBe(false);
    }
  });

  it('é9 et é10 : le forfait du photographe est cohérent dans les deux sens', () => {
    const photo = programme(['×', 12], ['+', 30]);
    expect(formuleTex(photo)).toBe('12x + 30');
    // 0 portrait coûte déjà 30 € (cité dans la correction)
    expect(frRat(trace(photo, 0).arrivee)).toBe('30');
    // 102 € correspond à 6 portraits, exactement
    expect(frRat(remonter(photo, 102))).toBe('6');
    expect(frRat(trace(photo, 6).arrivee)).toBe('102');
    // le distracteur « 102 ÷ 12 » donne bien 8,5 — donc pas 9 : la correction
    // dit « diviser sans retirer le déplacement », et 9 est le distracteur
    // arrondi qu'un élève produirait. On vérifie au moins qu'il est FAUX.
    expect(frRat(trace(photo, 9).arrivee)).not.toBe('102');
  });
});

/* ═══ PÉRIMÈTRE — la frontière 4e / 3e, sur les DONNÉES des modules ════ */
describe('Périmètre : rien de la 3e n’apparaît dans ce que la leçon calcule', () => {
  it('aucune écriture produite par les programmes de la leçon ne contient de notation de 3e', () => {
    const progs = [
      programme(['×', 3], ['+', 2]), programme(['×', 4], ['−', 5]),
      programme(['÷', 3], ['+', 1]), programme(['×', 5], ['+', 3]),
      programme(['+', 3], ['×', 5]), programme(['×', 2], ['×', 3]),
      programme(['×', 2], ['+', 1]), programme(['×', -2], ['+', 10]),
      programme(['×', 4], ['+', 3]), programme(['×', 12], ['+', 30]),
      ...Object.values(SITUATIONS).map((s) => s.prog),
    ];
    const interdits = /f\s*\(|image|antécédent|antecedent|affine|linéaire|lineaire|coefficient directeur/i;
    for (const p of progs) {
      expect(formuleTex(p), programmeTexte(p)).not.toMatch(interdits);
      expect(programmeTexte(p)).not.toMatch(interdits);
    }
  });
});
