import { describe, it, expect } from 'vitest';
import {
  assertScope4e,
  experience, poidsTotal, toutesLesIssues, issue, equiprobable,
  evenement, evenementSi, memeEvenement,
  contraire, intersection, reunion, compteNaifReunion, incompatibles,
  probabilite, poidsFavorables, probaContraire, estImpossible, estCertain,
  qualifier, couplecontraire,
  fraction, decimal, pct, pctNombre, fr,
  tirer, simuler, effectifEvenement, frequenceObservee, trajectoire,
  series, graineSuivante, ecartALaProbabilite, amplitude, ecartMoyen,
  tableauDeStabilisation, PAS_DE_GRAINE,
  SAC, ROUE, EVENEMENTS_SAC, COUPLE_CHEVAUCHANT, COUPLE_INCOMPATIBLE,
  TAILLES_DE_SERIE, NOMBRE_DE_SERIES, GRAINE_LECON,
} from './proba4e';
import { rat, ratAdd, ratEq, ratToNumber } from '../../../../../common/algebra4e';
import * as proba4e from './proba4e';

/** Toutes les parties d'un ensemble d'issues — la grille EXHAUSTIVE. */
function toutesLesParties(ids) {
  return Array.from({ length: 2 ** ids.length }, (_, masque) =>
    ids.filter((_id, k) => (masque >> k) & 1),
  );
}

/** Les graines de balayage : jamais une seule, jamais la graine « chanceuse ». */
const GRAINES = [1, 7, 42, 2024, 31337, 999983, 123456789, GRAINE_LECON];

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — ce que ce noyau ne SAIT PAS faire', () => {
  it('n’expose AUCUN arbre pondéré (objet de 3e)', () => {
    expect(proba4e.arbre).toBeUndefined();
    expect(proba4e.arbrePondere).toBeUndefined();
    expect(proba4e.branches).toBeUndefined();
  });

  it('n’expose AUCUNE probabilité conditionnelle (objet de lycée)', () => {
    expect(proba4e.probaConditionnelle).toBeUndefined();
    expect(proba4e.probabiliteConditionnelle).toBeUndefined();
    expect(proba4e.sachantQue).toBeUndefined();
  });

  it('n’expose AUCUNE expérience à deux épreuves (objet de 3e)', () => {
    expect(proba4e.deuxEpreuves).toBeUndefined();
    expect(proba4e.experienceComposee).toBeUndefined();
    expect(proba4e.tirageSuccessif).toBeUndefined();
  });

  it('n’expose AUCUNE formule P(A∪B) = P(A)+P(B)−P(A∩B) (objet de 3e)', () => {
    expect(proba4e.formuleUnion).toBeUndefined();
    expect(proba4e.probaUnion).toBeUndefined();
    expect(proba4e.additionDesProbabilites).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces quatre sujets, avec la raison', () => {
    for (const sujet of ['arbre-pondere', 'probabilite-conditionnelle', 'deux-epreuves', 'formule-union']) {
      expect(() => assertScope4e(sujet), sujet).toThrow(/Hors programme de 4e/);
    }
  });

  it('assertScope4e LAISSE PASSER ce qui est bien au programme de 4e', () => {
    for (const sujet of ['evenement-contraire', 'intersection', 'reunion', 'fluctuation']) {
      expect(assertScope4e(sujet), sujet).toBe(true);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   L'EXPÉRIENCE ET SES ISSUES — le socle de 5e, gardé solide
   ══════════════════════════════════════════════════════════════════════ */
describe('Les expériences de la leçon', () => {
  it('le sac a huit billes équiprobables : le cadre de 5e est conservé', () => {
    expect(SAC.issues).toHaveLength(8);
    expect(poidsTotal(SAC)).toBe(8);
    expect(equiprobable(SAC)).toBe(true);
  });

  it('la roue N’est PAS équiprobable — le contre-exemple existe, sinon « favorables ÷ possibles » se mémorise comme une loi universelle', () => {
    expect(equiprobable(ROUE)).toBe(false);
    expect(poidsTotal(ROUE)).toBe(8);
  });

  it('la roue donne des probabilités qui se LISENT sur le dessin : 3/8, 2/8 = 1/4, 1/8', () => {
    const p = (id) => fraction(probabilite(evenementSi(ROUE, (s) => s.id === id)));
    expect(p('or')).toBe('3/8');
    expect(p('violet')).toBe('1/4');
    expect(p('rose')).toBe('1/8');
  });

  it('chaque bille porte DEUX attributs — sans quoi intersection et réunion seraient triviales', () => {
    for (const b of SAC.issues) {
      expect(b.couleur, b.id).toBeTruthy();
      expect(b.taille, b.id).toBeTruthy();
    }
    expect(new Set(SAC.issues.map((b) => b.couleur)).size).toBeGreaterThan(1);
    expect(new Set(SAC.issues.map((b) => b.taille)).size).toBeGreaterThan(1);
  });

  it('une expérience sans issue, à poids non entier ou à ids dupliqués est REFUSÉE', () => {
    expect(() => experience({ id: 'x', nom: 'x', issues: [] })).toThrow(/au moins une issue/);
    expect(() => experience({ id: 'x', nom: 'x', issues: [{ id: 'a', poids: 0 }] })).toThrow(/entier/);
    expect(() => experience({ id: 'x', nom: 'x', issues: [{ id: 'a', poids: 1.5 }] })).toThrow(/entier/);
    expect(() => experience({ id: 'x', nom: 'x', issues: [{ id: 'a' }, { id: 'a' }] })).toThrow(/même id|id « a »/);
  });

  it('un événement bâti sur une issue inexistante est REFUSÉ : la vue ne peut pas afficher un fantôme', () => {
    expect(() => evenement(SAC, ['R9'], { label: 'test' })).toThrow(/n’existe pas/);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   P1–P2 — L'ÉVÉNEMENT CONTRAIRE, et P(A) + P(Ā) = 1 EXACTEMENT
   ══════════════════════════════════════════════════════════════════════ */
describe('L’événement contraire (P1) et sa probabilité (P2)', () => {
  it('le contraire est le COMPLÉMENTAIRE : ses issues sont exactement celles qui manquent', () => {
    const rouge = EVENEMENTS_SAC.rouge;
    expect(rouge.issues).toEqual(['R1', 'R2', 'R3', 'R4']);
    expect(contraire(rouge).issues).toEqual(['B1', 'B2', 'B3', 'V1']);
  });

  it('le contraire du contraire est l’événement de départ — sur TOUTES les parties du sac', () => {
    for (const partie of toutesLesParties(toutesLesIssues(SAC))) {
      const a = evenement(SAC, partie);
      expect(memeEvenement(contraire(contraire(a)), a), partie.join(',')).toBe(true);
    }
  });

  it('P(A) + P(Ā) = 1 EXACTEMENT, en rationnels, sur les 256 parties du sac — aucune tolérance flottante', () => {
    const un = rat(1);
    for (const partie of toutesLesParties(toutesLesIssues(SAC))) {
      const a = evenement(SAC, partie);
      const somme = ratAdd(probabilite(a), probabilite(contraire(a)));
      expect(ratEq(somme, un), `partie {${partie.join(',')}} → ${fraction(somme)}`).toBe(true);
      // et l'égalité est littérale, pas seulement « équivalente » :
      expect(somme, partie.join(',')).toEqual({ n: 1, d: 1 });
    }
  });

  it('P(A) + P(Ā) = 1 EXACTEMENT aussi sur la roue, où les issues NE sont PAS équiprobables', () => {
    for (const partie of toutesLesParties(toutesLesIssues(ROUE))) {
      const a = evenement(ROUE, partie);
      expect(ratAdd(probabilite(a), probabilite(contraire(a))), partie.join(',')).toEqual({ n: 1, d: 1 });
    }
  });

  it('les DEUX chemins vers P(Ā) coïncident : compter ses issues, ou soustraire à 1', () => {
    for (const exp of [SAC, ROUE]) {
      for (const partie of toutesLesParties(toutesLesIssues(exp))) {
        const a = evenement(exp, partie);
        expect(ratEq(probabilite(contraire(a)), probaContraire(a)), `${exp.id} {${partie}}`).toBe(true);
      }
    }
  });

  it('couplecontraire fournit la somme DÉJÀ vérifiée : la vue n’a rien à recalculer', () => {
    const c = couplecontraire(EVENEMENTS_SAC.rouge);
    expect(fraction(c.p)).toBe('1/2');
    expect(fraction(c.pBarre)).toBe('1/2');
    expect(c.sommeVautUn).toBe(true);
  });

  it('une probabilité de 3/8 a bien 5/8 pour contraire — et jamais « 0,625 » dans l’écriture attendue', () => {
    const or = evenementSi(ROUE, (s) => s.id === 'or');
    expect(fraction(probabilite(or))).toBe('3/8');
    expect(fraction(probabilite(contraire(or)))).toBe('5/8');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   P3–P4 — INTERSECTION ET RÉUNION, décrites par leurs ISSUES
   ══════════════════════════════════════════════════════════════════════ */
describe('Intersection (P3) et réunion (P4) — des ENSEMBLES, jamais une formule', () => {
  const { a: rouge, b: grande } = COUPLE_CHEVAUCHANT;

  it('le couple choisi se CHEVAUCHE vraiment : l’intersection n’est ni vide, ni égale à l’un des deux', () => {
    const inter = intersection(rouge, grande);
    expect(inter.issues.length).toBeGreaterThan(0);
    expect(inter.issues.length).toBeLessThan(rouge.issues.length);
    expect(inter.issues.length).toBeLessThan(grande.issues.length);
    expect(incompatibles(rouge, grande)).toBe(false);
  });

  it('l’intersection est la liste des billes rouges ET grandes', () => {
    expect(intersection(rouge, grande).issues).toEqual(['R1', 'R2']);
    expect(fraction(probabilite(intersection(rouge, grande)))).toBe('1/4');
  });

  it('la réunion est la liste des billes rouges OU grandes, chaque bille UNE SEULE fois', () => {
    const uni = reunion(rouge, grande);
    expect(uni.issues).toEqual(['R1', 'R2', 'R3', 'R4', 'B1', 'V1']);
    expect(new Set(uni.issues).size).toBe(uni.issues.length);
    expect(fraction(probabilite(uni))).toBe('3/4');
  });

  it('LE POINT DE LA LEÇON : le comptage naïf |A| + |B| est FAUX ici, et il l’est de façon VISIBLE', () => {
    const naif = compteNaifReunion(rouge, grande); // 4 + 4 = 8
    const vrai = reunion(rouge, grande).issues.length; // 6
    expect(naif).toBe(8);
    expect(vrai).toBe(6);
    expect(naif).toBeGreaterThan(vrai);
    // Le naïf conclurait « 8 billes sur 8 », donc un événement CERTAIN...
    expect(naif).toBe(poidsTotal(SAC));
    // ...alors qu'une bille au moins échappe à la réunion, et l'élève la voit.
    const dehors = toutesLesIssues(SAC).filter((id) => !reunion(rouge, grande).issues.includes(id));
    expect(dehors).toEqual(['B2', 'B3']);
    for (const id of dehors) {
      const b = issue(SAC, id);
      expect(b.couleur, id).not.toBe('rouge');
      expect(b.taille, id).not.toBe('grande');
    }
  });

  it('l’écart entre le comptage naïf et le vrai est EXACTEMENT le nombre d’issues communes', () => {
    for (const partieA of toutesLesParties(toutesLesIssues(SAC))) {
      for (const partieB of [['R1', 'R2'], ['R1', 'B1', 'V1'], ['B2'], toutesLesIssues(SAC), []]) {
        const a = evenement(SAC, partieA);
        const b = evenement(SAC, partieB);
        expect(compteNaifReunion(a, b) - reunion(a, b).issues.length)
          .toBe(intersection(a, b).issues.length);
      }
    }
  });

  it('quand A et B sont INCOMPATIBLES, le comptage naïf tombe juste — c’est le cas particulier, pas la règle', () => {
    const { a, b } = COUPLE_INCOMPATIBLE;
    expect(incompatibles(a, b)).toBe(true);
    expect(intersection(a, b).issues).toEqual([]);
    expect(compteNaifReunion(a, b)).toBe(reunion(a, b).issues.length);
  });

  it('intersection et réunion sont COMMUTATIVES et retrouvent l’ordre d’affichage', () => {
    const { a, b } = COUPLE_CHEVAUCHANT;
    expect(memeEvenement(intersection(a, b), intersection(b, a))).toBe(true);
    expect(memeEvenement(reunion(a, b), reunion(b, a))).toBe(true);
    const ordre = toutesLesIssues(SAC);
    for (const ev of [intersection(a, b), reunion(a, b)]) {
      const rangs = ev.issues.map((id) => ordre.indexOf(id));
      expect([...rangs].sort((x, y) => x - y)).toEqual(rangs);
    }
  });

  it('A ∩ B ⊆ A ⊆ A ∪ B — sur toutes les parties, l’encadrement des probabilités suit', () => {
    const temoins = [['R1', 'R2'], ['R1', 'B1', 'V1'], ['B2', 'B3'], []];
    for (const partieA of toutesLesParties(toutesLesIssues(SAC))) {
      const a = evenement(SAC, partieA);
      for (const partieB of temoins) {
        const b = evenement(SAC, partieB);
        const pInter = ratToNumber(probabilite(intersection(a, b)));
        const pA = ratToNumber(probabilite(a));
        const pUni = ratToNumber(probabilite(reunion(a, b)));
        expect(pInter, `{${partieA}} ∩ {${partieB}}`).toBeLessThanOrEqual(pA);
        expect(pA, `{${partieA}} ∪ {${partieB}}`).toBeLessThanOrEqual(pUni);
      }
    }
  });

  it('mêler deux expériences différentes est REFUSÉ : l’erreur est d’auteur, elle doit être bruyante', () => {
    const a = EVENEMENTS_SAC.rouge;
    const b = evenementSi(ROUE, (s) => s.id === 'or');
    expect(() => intersection(a, b)).toThrow(/MÊME expérience/);
    expect(() => reunion(a, b)).toThrow(/MÊME expérience/);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   P5 — IMPOSSIBLE ET CERTAIN, reconnus par leurs ISSUES
   ══════════════════════════════════════════════════════════════════════ */
describe('Événement impossible et événement certain (P5)', () => {
  it('« la bille est noire » est IMPOSSIBLE : aucune issue, probabilité 0 exacte', () => {
    const noire = EVENEMENTS_SAC.noire;
    expect(noire.issues).toEqual([]);
    expect(estImpossible(noire)).toBe(true);
    expect(probabilite(noire)).toEqual({ n: 0, d: 1 });
    expect(fraction(probabilite(noire))).toBe('0');
  });

  it('« la bille est colorée » est CERTAIN : toutes les issues, probabilité 1 exacte', () => {
    const coloree = EVENEMENTS_SAC.coloree;
    expect(coloree.issues).toHaveLength(8);
    expect(estCertain(coloree)).toBe(true);
    expect(probabilite(coloree)).toEqual({ n: 1, d: 1 });
    expect(fraction(probabilite(coloree))).toBe('1');
  });

  it('impossible et certain sont CONTRAIRES l’un de l’autre — la définition se referme', () => {
    expect(memeEvenement(contraire(EVENEMENTS_SAC.noire), EVENEMENTS_SAC.coloree)).toBe(true);
    expect(estCertain(contraire(EVENEMENTS_SAC.noire))).toBe(true);
    expect(estImpossible(contraire(EVENEMENTS_SAC.coloree))).toBe(true);
  });

  it('l’intersection de deux événements incompatibles est IMPOSSIBLE, leur réunion peut ne pas être certaine', () => {
    const { a, b } = COUPLE_INCOMPATIBLE;
    expect(estImpossible(intersection(a, b))).toBe(true);
    expect(estCertain(reunion(a, b))).toBe(false); // il reste la bille verte
  });

  it('qualifier donne le MOT et sa RAISON — et sur les 256 parties, mot et probabilité concordent', () => {
    expect(qualifier(EVENEMENTS_SAC.noire).mot).toBe('impossible');
    expect(qualifier(EVENEMENTS_SAC.coloree).mot).toBe('certain');
    expect(qualifier(EVENEMENTS_SAC.rouge).mot).toBe('une chance sur deux');
    expect(qualifier(EVENEMENTS_SAC.verte).mot).toBe('peu probable');
    for (const partie of toutesLesParties(toutesLesIssues(SAC))) {
      const q = qualifier(evenement(SAC, partie));
      const p = ratToNumber(q.p);
      expect(p, partie.join(',')).toBeGreaterThanOrEqual(0);
      expect(p, partie.join(',')).toBeLessThanOrEqual(1);
      if (q.mot === 'impossible') expect(p).toBe(0);
      if (q.mot === 'certain') expect(p).toBe(1);
      if (q.mot === 'peu probable') expect(p).toBeLessThan(0.5);
      if (q.mot === 'probable') expect(p).toBeGreaterThan(0.5);
      expect(q.raison, partie.join(',')).toBeTruthy();
    }
  });

  it('toute probabilité du sac ET de la roue reste dans [0 ; 1] — l’échelle de 5e tient', () => {
    for (const exp of [SAC, ROUE]) {
      for (const partie of toutesLesParties(toutesLesIssues(exp))) {
        const p = ratToNumber(probabilite(evenement(exp, partie)));
        expect(p, `${exp.id} {${partie}}`).toBeGreaterThanOrEqual(0);
        expect(p, `${exp.id} {${partie}}`).toBeLessThanOrEqual(1);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   P6 — LA FLUCTUATION : déterministe à graine égale, DIFFÉRENTE sinon
   ══════════════════════════════════════════════════════════════════════ */
describe('La simulation (P6) — reproductible, et pourtant vivante', () => {
  it('à graine égale, la MÊME série — deux appels sont identiques', () => {
    for (const g of GRAINES) {
      expect(simuler(SAC, 200, g), `graine ${g}`).toEqual(simuler(SAC, 200, g));
      expect(trajectoire(SAC, EVENEMENTS_SAC.rouge, 500, g), `graine ${g}`)
        .toEqual(trajectoire(SAC, EVENEMENTS_SAC.rouge, 500, g));
    }
  });

  it('à graines DIFFÉRENTES, des séries différentes — un sac qui rendrait toujours la même chose ne serait plus un sac', () => {
    const empreintes = new Set(GRAINES.map((g) => JSON.stringify(simuler(SAC, 200, g).effectifs)));
    expect(empreintes.size).toBe(GRAINES.length);
  });

  it('les cinq séries d’un même paquet sont RÉELLEMENT différentes — sinon la fluctuation ne se voit pas', () => {
    for (const g of GRAINES) {
      const paquet = series(SAC, EVENEMENTS_SAC.rouge, 60, g, NOMBRE_DE_SERIES);
      expect(new Set(paquet.map((s) => s.graine)).size, `graine ${g}`).toBe(NOMBRE_DE_SERIES);
      expect(new Set(paquet.map((s) => s.effectif)).size, `graine ${g}`).toBeGreaterThan(1);
    }
  });

  it('graineSuivante écarte VRAIMENT les graines : le premier tirage change à chaque relance', () => {
    // Le piège mesuré : avec `graine + 1`, les graines 1, 2, 3 et 5 donnent
    // toutes la même première bille sur le sac. Avec le pas premier, non.
    const premier = (g) => simuler(SAC, 1, g).effectifs;
    const naives = [1, 2, 3, 5].map((g) => JSON.stringify(premier(g)));
    expect(new Set(naives).size).toBe(1); // le piège existe bel et bien
    let g = 1;
    const relances = Array.from({ length: 6 }, () => {
      const e = JSON.stringify(premier(g));
      g = graineSuivante(g);
      return e;
    });
    expect(new Set(relances).size).toBeGreaterThan(3);
    expect(graineSuivante(1)).toBe(1 + PAS_DE_GRAINE);
  });

  it('les effectifs simulés se répartissent sur TOUTES les issues et somment au nombre de répétitions', () => {
    for (const exp of [SAC, ROUE]) {
      for (const g of GRAINES) {
        const sim = simuler(exp, 4000, g);
        const total = Object.values(sim.effectifs).reduce((s, v) => s + v, 0);
        expect(total, `${exp.id} ${g}`).toBe(4000);
        for (const id of toutesLesIssues(exp)) {
          expect(sim.effectifs[id], `${exp.id} ${g} ${id}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('la roue simulée respecte ses POIDS : Or sort environ trois fois plus que Rose', () => {
    for (const g of GRAINES) {
      const sim = simuler(ROUE, 20000, g);
      expect(sim.effectifs.or / sim.effectifs.rose, `graine ${g}`).toBeGreaterThan(2.4);
      expect(sim.effectifs.or / sim.effectifs.rose, `graine ${g}`).toBeLessThan(3.6);
    }
  });

  it('la trajectoire est croissante en n, ses fréquences restent dans [0 ; 1], et son dernier point est la série entière', () => {
    for (const g of GRAINES) {
      const t = trajectoire(SAC, EVENEMENTS_SAC.rouge, 2000, g);
      expect(t.length).toBeGreaterThan(5);
      for (const [k, point] of t.entries()) {
        expect(point.frequence).toBeGreaterThanOrEqual(0);
        expect(point.frequence).toBeLessThanOrEqual(1);
        expect(point.frequence).toBeCloseTo(point.effectif / point.n, 12);
        if (k > 0) expect(point.n).toBeGreaterThan(t[k - 1].n);
      }
      expect(t[t.length - 1].n).toBe(2000);
    }
  });

  it('la trajectoire FLUCTUE beaucoup au début et peu à la fin — c’est ce contraste que l’élève doit voir', () => {
    for (const g of GRAINES) {
      const t = trajectoire(SAC, EVENEMENTS_SAC.rouge, 5000, g);
      const saut = (pts) => Math.max(...pts.slice(1).map((p, k) => Math.abs(p.frequence - pts[k].frequence)));
      const debut = t.filter((p) => p.n <= 30);
      const fin = t.filter((p) => p.n >= 1000);
      expect(saut(debut), `graine ${g}`).toBeGreaterThan(saut(fin));
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   P7 — LA STABILISATION, MESURÉE : elle est vérifiée, pas affirmée
   ══════════════════════════════════════════════════════════════════════ */
describe('Fréquence observée et probabilité (P7) — la stabilisation est démontrée par balayage', () => {
  it('ecartALaProbabilite mesure bien la distance à la valeur théorique', () => {
    expect(ecartALaProbabilite(0.5, EVENEMENTS_SAC.rouge)).toBeCloseTo(0, 12);
    expect(ecartALaProbabilite(0.7, EVENEMENTS_SAC.rouge)).toBeCloseTo(0.2, 12);
    expect(ecartALaProbabilite(0.3, EVENEMENTS_SAC.rouge)).toBeCloseTo(0.2, 12);
    expect(ecartALaProbabilite(null, EVENEMENTS_SAC.rouge)).toBeNull();
  });

  it('L’ÉCART MOYEN DÉCROÎT à chaque palier de taille — sur les HUIT graines de balayage, pas sur une seule', () => {
    for (const g of GRAINES) {
      const table = tableauDeStabilisation(SAC, EVENEMENTS_SAC.rouge, TAILLES_DE_SERIE, g, NOMBRE_DE_SERIES);
      expect(table.map((r) => r.n)).toEqual(TAILLES_DE_SERIE);
      for (const [k, ligne] of table.entries()) {
        if (k === 0) continue;
        expect(
          ligne.ecartMoyen,
          `graine ${g} : n=${ligne.n} (${ligne.ecartMoyen}) devrait être plus proche que n=${table[k - 1].n} (${table[k - 1].ecartMoyen})`,
        ).toBeLessThan(table[k - 1].ecartMoyen);
      }
    }
  });

  it('L’AMPLITUDE entre séries RÉTRÉCIT elle aussi à chaque palier, sur les mêmes huit graines', () => {
    for (const g of GRAINES) {
      const table = tableauDeStabilisation(SAC, EVENEMENTS_SAC.rouge, TAILLES_DE_SERIE, g, NOMBRE_DE_SERIES);
      for (const [k, ligne] of table.entries()) {
        if (k === 0) continue;
        expect(ligne.amplitude, `graine ${g} n=${ligne.n}`).toBeLessThan(table[k - 1].amplitude);
      }
    }
  });

  it('la stabilisation vaut aussi pour la roue NON équiprobable — ce n’est pas un artefact du 1/2', () => {
    const or = evenementSi(ROUE, (s) => s.id === 'or', { label: 'la roue tombe sur Or' });
    expect(fraction(probabilite(or))).toBe('3/8');
    for (const g of GRAINES) {
      const table = tableauDeStabilisation(ROUE, or, TAILLES_DE_SERIE, g, NOMBRE_DE_SERIES);
      expect(table[table.length - 1].ecartMoyen, `graine ${g}`).toBeLessThan(table[0].ecartMoyen);
      expect(table[table.length - 1].ecartMoyen, `graine ${g}`).toBeLessThan(0.02);
    }
  });

  it('à 10 lancers l’écart est GROS et à 10 000 il est petit : la leçon peut le montrer, pas seulement le dire', () => {
    for (const g of GRAINES) {
      const table = tableauDeStabilisation(SAC, EVENEMENTS_SAC.rouge, TAILLES_DE_SERIE, g, NOMBRE_DE_SERIES);
      expect(table[0].amplitude, `graine ${g}`).toBeGreaterThan(0.15);
      expect(table[table.length - 1].amplitude, `graine ${g}`).toBeLessThan(0.05);
    }
  });

  it('sur une série longue, la fréquence observée approche la probabilité THÉORIQUE exacte', () => {
    for (const g of GRAINES) {
      const sim = simuler(SAC, 20000, g);
      const f = frequenceObservee(sim, EVENEMENTS_SAC.rouge);
      expect(Math.abs(f - ratToNumber(probabilite(EVENEMENTS_SAC.rouge))), `graine ${g}`).toBeLessThan(0.02);
    }
  });

  it('la fréquence de l’événement contraire complète celle de l’événement — à 1, sur chaque série', () => {
    for (const g of GRAINES) {
      const sim = simuler(SAC, 1000, g);
      const f = frequenceObservee(sim, EVENEMENTS_SAC.grande);
      const fBarre = frequenceObservee(sim, contraire(EVENEMENTS_SAC.grande));
      expect(f + fBarre, `graine ${g}`).toBeCloseTo(1, 12);
    }
  });

  it('la fréquence de la RÉUNION n’est PAS la somme des fréquences quand les événements se chevauchent', () => {
    const { a, b } = COUPLE_CHEVAUCHANT;
    for (const g of GRAINES) {
      const sim = simuler(SAC, 4000, g);
      const fUni = frequenceObservee(sim, reunion(a, b));
      const somme = frequenceObservee(sim, a) + frequenceObservee(sim, b);
      expect(somme, `graine ${g}`).toBeGreaterThan(fUni);
      // L'écart observé est la fréquence de l'intersection — le même fait,
      // constaté sur l'expérience et non plus seulement sur le sac.
      expect(somme - fUni, `graine ${g}`).toBeCloseTo(frequenceObservee(sim, intersection(a, b)), 12);
    }
  });

  it('effectif, fréquence et écart sont cohérents dans chaque série d’un paquet', () => {
    for (const g of GRAINES) {
      for (const s of series(SAC, EVENEMENTS_SAC.grande, 300, g, NOMBRE_DE_SERIES)) {
        expect(s.frequence).toBeCloseTo(s.effectif / s.n, 12);
        expect(s.ecart).toBeCloseTo(Math.abs(s.frequence - 0.5), 12);
      }
    }
  });

  it('amplitude et ecartMoyen renvoient null sur un paquet vide, jamais NaN ni −Infinity', () => {
    expect(amplitude([])).toBeNull();
    expect(ecartMoyen([])).toBeNull();
    expect(frequenceObservee({ total: 0, effectifs: {} }, EVENEMENTS_SAC.rouge)).toBeNull();
  });

  it('effectifEvenement d’un événement impossible vaut 0, d’un événement certain vaut le total', () => {
    const sim = simuler(SAC, 500, GRAINE_LECON);
    expect(effectifEvenement(sim, EVENEMENTS_SAC.noire)).toBe(0);
    expect(effectifEvenement(sim, EVENEMENTS_SAC.coloree)).toBe(500);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES ÉCRITURES — une probabilité s'écrit en fraction irréductible
   ══════════════════════════════════════════════════════════════════════ */
describe('Les écritures françaises', () => {
  it('fraction donne la forme IRRÉDUCTIBLE, et l’entier sans dénominateur', () => {
    expect(fraction(rat(4, 8))).toBe('1/2');
    expect(fraction(rat(3, 8))).toBe('3/8');
    expect(fraction(rat(0, 8))).toBe('0');
    expect(fraction(rat(8, 8))).toBe('1');
  });

  it('décimal et pourcentage utilisent la VIRGULE française', () => {
    expect(decimal(rat(3, 8))).toBe('0,375');
    expect(pct(rat(3, 8))).toBe('37,5 %');
    expect(pct(rat(1, 2))).toBe('50 %');
    expect(pctNombre(0.512)).toBe('51,2 %');
    expect(fr(0.5)).toBe('0,5');
  });

  it('un nombre non fini ne produit jamais « NaN » à l’écran', () => {
    expect(fr(NaN)).toBe('—');
    expect(pctNombre(null)).toBe('—');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES DONNÉES DE LA LEÇON — les chiffres que la rédaction annonce
   ══════════════════════════════════════════════════════════════════════ */
describe('Les constantes de la leçon disent bien ce que la leçon montre', () => {
  it('les tailles de série montent d’un facteur 10 — le seul rythme où l’écart se voit fondre', () => {
    expect(TAILLES_DE_SERIE).toEqual([10, 100, 1000, 10000]);
    for (const [k, n] of TAILLES_DE_SERIE.entries()) {
      if (k > 0) expect(n / TAILLES_DE_SERIE[k - 1]).toBe(10);
    }
    expect(NOMBRE_DE_SERIES).toBe(5);
  });

  it('poidsFavorables et probabilite s’accordent sur toutes les parties du sac et de la roue', () => {
    for (const exp of [SAC, ROUE]) {
      for (const partie of toutesLesParties(toutesLesIssues(exp))) {
        const a = evenement(exp, partie);
        expect(probabilite(a), `${exp.id} {${partie}}`).toEqual(rat(poidsFavorables(a), poidsTotal(exp)));
      }
    }
  });

  it('tirer ne rend QUE des issues existantes, sur les deux expériences', () => {
    const rng = () => 0.999999999;
    expect(toutesLesIssues(SAC)).toContain(tirer(SAC, rng));
    expect(toutesLesIssues(ROUE)).toContain(tirer(ROUE, rng));
    const rngZero = () => 0;
    expect(tirer(SAC, rngZero)).toBe('R1');
    expect(tirer(ROUE, rngZero)).toBe('or');
  });
});
