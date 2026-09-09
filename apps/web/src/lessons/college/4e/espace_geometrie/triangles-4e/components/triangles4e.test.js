import { describe, it, expect } from 'vitest';
import {
  angles, estRectangleEn, estDegenere,
  cercleCirconscrit, caracterisationRectangle, medianeVersAB,
  droiteDesMilieux, reciproqueMilieux,
  statut, ENONCES_IDS, STATUTS,
  preuveEstCharpentee, ROLES,
  assertScope4e,
  A_DEFAUT, B_DEFAUT, surLeCercleAB, TRIANGLES_MILIEUX,
  arrondi, fr, dist, midpoint,
} from './triangles4e';

/**
 * LE NOYAU, VÉRIFIÉ CONTRE SES PROPRES PROMESSES.
 *
 * Ce fichier ne teste pas « le code fait ce que le code fait » : il teste les
 * AFFIRMATIONS MATHÉMATIQUES que la leçon pose devant l'élève. Chaque `it`
 * porte le nom de la phrase que la leçon prononce. Si l'une tombe, ce n'est pas
 * une régression technique — c'est un mensonge pédagogique.
 */

const C_TEST = { x: 300, y: 200 };

/* ═══ Le cercle circonscrit et la caractérisation ══════════════════════ */
describe('P1 — « rectangle ⟺ le centre est le milieu de l’hypoténuse »', () => {
  it('le centre est équidistant des TROIS sommets (contrôle interne)', () => {
    for (const T of TRIANGLES_MILIEUX) {
      const c = cercleCirconscrit(T.A, T.B, T.C);
      expect(c, T.nom).not.toBeNull();
      expect(c.rayonsEgaux, T.nom).toBe(true);
      expect(c.rayons.A).toBeCloseTo(c.rayons.B, 6);
      expect(c.rayons.B).toBeCloseTo(c.rayons.C, 6);
    }
  });

  it('SUR le cercle de diamètre [AB], l’angle en C est droit — sur tout le demi-tour', () => {
    for (let d = 10; d <= 170; d += 5) {
      const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, (d * Math.PI) / 180);
      expect(angles({ A: A_DEFAUT, B: B_DEFAUT, C }).C, `θ = ${d}°`).toBeCloseTo(90, 6);
      expect(estRectangleEn({ A: A_DEFAUT, B: B_DEFAUT, C }, 'C')).toBe(true);
    }
  });

  it('…et le centre du cercle circonscrit y tombe SUR le milieu de [AB]', () => {
    const M = midpoint(A_DEFAUT, B_DEFAUT);
    for (let d = 10; d <= 170; d += 5) {
      const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, (d * Math.PI) / 180);
      const c = cercleCirconscrit(A_DEFAUT, B_DEFAUT, C);
      expect(c.ecartAuMilieu, `θ = ${d}°`).toBeLessThan(1e-6);
      expect(c.centreEstMilieuAB).toBe(true);
      expect(c.abEstDiametre).toBe(true);
      expect(dist(c.centre, M)).toBeLessThan(1e-6);
    }
  });

  it('les DEUX verdicts s’allument et s’éteignent ENSEMBLE — c’est ce que veut dire « caractérisation »', () => {
    // Balayage de tout le demi-plan au-dessus de [AB] : partout, « angle droit »
    // et « centre sur le milieu » disent la même chose. C'est l'affirmation
    // centrale du module 1, et rien d'autre ne peut l'établir.
    let vusDroits = 0;
    let vusNonDroits = 0;
    for (let x = 60; x <= 560; x += 20) {
      for (let y = 60; y <= 300; y += 20) {
        const C = { x, y };
        if (estDegenere({ A: A_DEFAUT, B: B_DEFAUT, C })) continue;
        const k = caracterisationRectangle(A_DEFAUT, B_DEFAUT, C);
        expect(k.coincident, `C = (${x}, ${y}) : angle ${arrondi(k.angleC, 2)}°, centre ${k.centreSurMilieu}`).toBe(true);
        if (k.droit) vusDroits += 1; else vusNonDroits += 1;
      }
    }
    // Le balayage doit contenir les deux cas, sinon il ne prouve rien.
    expect(vusDroits).toBeGreaterThan(0);
    expect(vusNonDroits).toBeGreaterThan(0);
  });

  it('hors du cercle, le centre S’ÉLOIGNE du milieu — l’écart est un nombre qu’on peut viser', () => {
    const M = midpoint(A_DEFAUT, B_DEFAUT);
    const rayon = dist(A_DEFAUT, B_DEFAUT) / 2;
    // Trois points sur la verticale du milieu, à des hauteurs croissantes :
    // sous le cercle (obtus), sur le cercle (droit), au-dessus (aigu).
    const dedans = cercleCirconscrit(A_DEFAUT, B_DEFAUT, { x: M.x, y: M.y - rayon * 0.5 });
    const dessus = cercleCirconscrit(A_DEFAUT, B_DEFAUT, { x: M.x, y: M.y - rayon });
    const dehors = cercleCirconscrit(A_DEFAUT, B_DEFAUT, { x: M.x, y: M.y - rayon * 1.7 });
    expect(dessus.ecartAuMilieu).toBeLessThan(1e-6);
    expect(dedans.ecartAuMilieu).toBeGreaterThan(10);
    expect(dehors.ecartAuMilieu).toBeGreaterThan(10);
    // …et les natures d'angle correspondantes, celles que le lab affiche.
    expect(caracterisationRectangle(A_DEFAUT, B_DEFAUT, { x: M.x, y: M.y - rayon * 0.5 }).nature).toBe('obtus');
    expect(caracterisationRectangle(A_DEFAUT, B_DEFAUT, { x: M.x, y: M.y - rayon * 1.7 }).nature).toBe('aigu');
  });

  it('la MÉDIANE issue de C vaut la moitié de [AB] exactement sur le cercle', () => {
    const M = midpoint(A_DEFAUT, B_DEFAUT);
    const rayon = dist(A_DEFAUT, B_DEFAUT) / 2;
    for (let d = 20; d <= 160; d += 10) {
      const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, (d * Math.PI) / 180);
      const m = medianeVersAB(A_DEFAUT, B_DEFAUT, C);
      expect(m.longueur, `θ = ${d}°`).toBeCloseTo(rayon, 6);
      expect(m.estLaMoitie).toBe(true);
      expect(m.rapport).toBeCloseTo(0.5, 6);
    }
    // Et hors du cercle, elle ne l'est plus — sinon la propriété ne dirait rien.
    // DÉFAUT ATTRAPÉ : avec un seuil forfaitaire de 2 % de AB, un triangle à
    // 80° passait encore pour « la moitié ». Le seuil vient maintenant de la
    // tolérance d'angle, et 80° est refusé comme il doit l'être.
    expect(medianeVersAB(A_DEFAUT, B_DEFAUT, { x: M.x, y: M.y - rayon * 1.5 }).estLaMoitie).toBe(false);
    const presque = surLeCercleAB(A_DEFAUT, B_DEFAUT, (60 * Math.PI) / 180);
    const hors = { x: presque.x, y: presque.y - 22 };
    expect(arrondi(angles({ A: A_DEFAUT, B: B_DEFAUT, C: hors }).C, 1)).toBeLessThan(85);
    expect(medianeVersAB(A_DEFAUT, B_DEFAUT, hors).estLaMoitie).toBe(false);
  });

  it('trois points alignés n’ont PAS de cercle circonscrit — la leçon doit pouvoir le dire', () => {
    expect(cercleCirconscrit({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 25, y: 0 })).toBeNull();
    expect(estDegenere({ A: { x: 0, y: 0 }, B: { x: 10, y: 0 }, C: { x: 25, y: 0 } })).toBe(true);
  });

  it('estRectangleEn refuse un sommet inconnu au lieu de répondre « faux »', () => {
    expect(() => estRectangleEn({ A: A_DEFAUT, B: B_DEFAUT, C: C_TEST }, 'D')).toThrow(/sommet inconnu/);
  });
});
/* ═══ La droite des milieux ════════════════════════════════════════════ */
describe('P2 — « (IJ) est parallèle à (BC), et vaut sa moitié »', () => {
  it('les DEUX faits sont mesurés, et tiennent sur trois formes très différentes', () => {
    for (const T of TRIANGLES_MILIEUX) {
      const m = droiteDesMilieux(T.A, T.B, T.C);
      expect(m.parallele, T.nom).toBe(true);
      expect(m.angleAvecBC, T.nom).toBeCloseTo(0, 6);
      expect(m.rapport, T.nom).toBeCloseTo(0.5, 9);
      expect(m.estLaMoitie).toBe(true);
    }
  });

  it('I et J sont bien les milieux — et non le pied d’une hauteur (erreur visée)', () => {
    const T = TRIANGLES_MILIEUX[0];
    const m = droiteDesMilieux(T.A, T.B, T.C);
    expect(dist(T.A, m.I)).toBeCloseTo(dist(m.I, T.B), 9);
    expect(dist(T.A, m.J)).toBeCloseTo(dist(m.J, T.C), 9);
  });

  it('le rapport vaut 1/2 sur un balayage complet de la forme du triangle', () => {
    // Ce n'est pas un cas particulier : on déplace A partout au-dessus de (BC).
    const B = { x: 140, y: 360 };
    const C = { x: 480, y: 360 };
    for (let x = 60; x <= 560; x += 40) {
      for (let y = 60; y <= 320; y += 40) {
        const m = droiteDesMilieux({ x, y }, B, C);
        expect(m.rapport, `A = (${x}, ${y})`).toBeCloseTo(0.5, 9);
        expect(m.parallele).toBe(true);
      }
    }
  });

  it('refuse un triangle aplati au lieu de renvoyer un rapport absurde', () => {
    expect(() => droiteDesMilieux({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 30, y: 0 }))
      .toThrow(/alignés/);
  });
});

/* ═══ La réciproque de la droite des milieux ═══════════════════════════ */
describe('P2/P3 — la réciproque : le parallélisme n’apparaît QU’au milieu', () => {
  const T = TRIANGLES_MILIEUX[0];

  it('en t = 1/2, (IK) est parallèle à (BC) et K EST le milieu', () => {
    const r = reciproqueMilieux(T.A, T.B, T.C, 0.5);
    expect(r.parallele).toBe(true);
    expect(r.tEstMilieu).toBe(true);
    expect(r.rapport).toBeCloseTo(0.5, 9);
  });

  it('AILLEURS, ce n’est PAS parallèle — c’est ce que l’élève doit voir en glissant K', () => {
    for (const t of [0.15, 0.3, 0.42, 0.58, 0.7, 0.9]) {
      const r = reciproqueMilieux(T.A, T.B, T.C, t);
      expect(r.parallele, `t = ${t}`).toBe(false);
      expect(r.tEstMilieu, `t = ${t}`).toBe(false);
    }
  });

  it('un t VOISIN de 1/2 donne un écart d’angle VISIBLE (≥ 2°) — la cible est fine mais honnête', () => {
    // Si 0,42 donnait 0,3° d'écart, l'élève ne verrait aucune différence et la
    // manipulation serait un mensonge. On exige que le voisinage se voie.
    expect(reciproqueMilieux(T.A, T.B, T.C, 0.42).angleAvecBC).toBeGreaterThan(2);
    expect(reciproqueMilieux(T.A, T.B, T.C, 0.58).angleAvecBC).toBeGreaterThan(2);
  });

  it('le paramètre t reste dans [0 ; 1] — hors de là, K n’est plus sur le côté', () => {
    expect(() => reciproqueMilieux(T.A, T.B, T.C, 1.4)).toThrow(/dans \[0 ; 1\]/);
    expect(() => reciproqueMilieux(T.A, T.B, T.C, -0.2)).toThrow(/dans \[0 ; 1\]/);
  });
});

/* ═══ La grammaire des énoncés ═════════════════════════════════════════ */
describe('P3 — définition, propriété, caractérisation', () => {
  it('chaque énoncé porte un statut VALIDE et un texte non vide', () => {
    for (const id of ENONCES_IDS) {
      const e = statut(id);
      expect(STATUTS.map((s) => s.id), id).toContain(e.statut);
      expect(e.texte.length).toBeGreaterThan(20);
      expect(e.pourquoi.length).toBeGreaterThan(20);
    }
  });

  it('une DÉFINITION n’a pas de réciproque : le champ vaut null, jamais false', () => {
    // La nuance compte : afficher « réciproque fausse » sur une définition
    // enseignerait quelque chose de faux.
    for (const id of ENONCES_IDS) {
      const e = statut(id);
      if (e.statut === 'definition') expect(e.reciproqueVraie, id).toBeNull();
      else expect(typeof e.reciproqueVraie, id).toBe('boolean');
    }
  });

  it('une CARACTÉRISATION a toujours sa réciproque vraie — c’est sa définition même', () => {
    for (const id of ENONCES_IDS) {
      const e = statut(id);
      if (e.statut === 'caracterisation') expect(e.reciproqueVraie, id).toBe(true);
    }
  });

  it('le tri du module 5 contient les TROIS statuts, et au moins une réciproque FAUSSE', () => {
    // Sans contre-exemple, l'élève conclurait que « la réciproque est toujours
    // vraie » — exactement la croyance que la leçon vient combattre.
    const tous = ENONCES_IDS.map(statut);
    for (const s of STATUTS) {
      expect(tous.some((e) => e.statut === s.id), s.id).toBe(true);
    }
    expect(tous.filter((e) => e.reciproqueVraie === false).length).toBeGreaterThanOrEqual(2);
  });

  it('refuse un énoncé inconnu au lieu de le classer par défaut', () => {
    expect(() => statut('prop-inventee')).toThrow(/énoncé inconnu/);
  });
});

/* ═══ La charpente d’une démonstration ═════════════════════════════════ */
describe('P4 — donnée → propriété → conclusion', () => {
  const d = { role: 'donnee' };
  const p = { role: 'propriete' };
  const c = { role: 'conclusion' };

  it('accepte la charpente complète, dans l’ordre', () => {
    expect(preuveEstCharpentee([d, p, c]).ok).toBe(true);
    expect(preuveEstCharpentee([d, d, p, c]).ok).toBe(true);
    expect(preuveEstCharpentee([d, p, p, c]).ok).toBe(true);
  });

  it('REFUSE une conclusion sans propriété — l’erreur exacte que le module vise', () => {
    const v = preuveEstCharpentee([d, c]);
    expect(v.ok).toBe(false);
    expect(v.raison).toMatch(/propriété/);
  });

  it('refuse une conclusion sans donnée', () => {
    expect(preuveEstCharpentee([p, c]).raison).toMatch(/donnée/);
  });

  it('refuse l’ordre inversé, et les conclusions multiples', () => {
    expect(preuveEstCharpentee([p, d, c]).ok).toBe(false);
    expect(preuveEstCharpentee([d, p, c, c]).raison).toMatch(/exactement une conclusion/);
    expect(preuveEstCharpentee([d, p]).raison).toMatch(/exactement une conclusion/);
    expect(preuveEstCharpentee([d, c, p]).ok).toBe(false);
  });

  it('les trois rôles sont exactement ceux du contrat', () => {
    expect(ROLES).toEqual(['donnee', 'propriete', 'conclusion']);
  });
});

/* ═══ Le périmètre, exécutable ═════════════════════════════════════════ */
describe('périmètre — la frontière 4e/3e et la frontière avec la leçon sœur', () => {
  it('lève sur Thalès et la trigonométrie (3e)', () => {
    expect(() => assertScope4e('thales')).toThrow(/3e/);
    expect(() => assertScope4e('trigonometrie')).toThrow(/3e/);
  });

  it('lève sur le CALCUL de Pythagore : c’est la leçon sœur', () => {
    expect(() => assertScope4e('pythagore-calcul')).toThrow(/pythagore-4e/);
  });

  it('laisse passer ce qui est au programme', () => {
    expect(assertScope4e('cercle-circonscrit')).toBe(true);
    expect(assertScope4e('droite-des-milieux')).toBe(true);
  });

  it('le noyau n’EXPOSE aucune fonction hors périmètre', async () => {
    // La garde porte sur des noms ENTIERS, pas sur des sous-chaînes : une
    // première version cherchait « tan » et se déclenchait sur
    // `caracterisationRectangle` (« rec-TAN-gle »). Un test qui échoue sur du
    // code correct finit par être désactivé, ce qui coûte la garde entière.
    const mod = await import('./triangles4e');
    const interdits = [
      'thales', 'thalès', 'cos', 'sin', 'tan', 'cosinus', 'sinus', 'tangente',
      'hypotenuse', 'pythagore', 'trigonometrie',
    ];
    const mots = (nom) => nom.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase().split(/[^a-zà-ÿ]+/);
    for (const nom of Object.keys(mod)) {
      const collision = mots(nom).find((m) => interdits.includes(m));
      expect(collision, `${nom} expose « ${collision} »`).toBeUndefined();
    }
  });
});

/* ═══ L’affichage ══════════════════════════════════════════════════════ */
describe('affichage — la virgule française et l’arrondi', () => {
  it('fr rend une virgule décimale, et « — » pour un non-nombre', () => {
    expect(fr(12.34, 1)).toBe('12,3');
    expect(fr(NaN)).toBe('—');
  });

  it('fr épingle le NOMBRE DE DÉCIMALES — la constance doit se VOIR', () => {
    // DÉFAUT ATTRAPÉ AU NAVIGATEUR : sans minimum, le rapport s'affichait
    // « 0,5 » là où la leçon promet « 0,50 », et l'angle « 0° » là où elle
    // promet « 0,0° ». Une colonne de relevés dont les décimales
    // apparaissent et disparaissent ne se lit plus comme une constante.
    expect(fr(0.5, 2)).toBe('0,50');
    expect(fr(0, 1)).toBe('0,0');
    expect(fr(90, 1)).toBe('90,0');
    expect(fr(2, 2)).toBe('2,00');
  });

  it('arrondi coupe au rang demandé', () => {
    expect(arrondi(89.996, 2)).toBe(90);
    expect(arrondi(0.5001, 1)).toBe(0.5);
  });
});
