import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PAS, round, fr, enCarreaux, auNoeud, estSurNoeud,
  glissement, nomDuSens, translater, translaterPoint,
  retrouverGlissement, trajets, trajetsConcordants,
  invariants, parallelogrammeDe, diagonalesMemeMilieu,
  demiTour, retrouverCentre, quelGeste,
  assertScope4e, SUJETS_HORS_PERIMETRE,
  DRAPEAU, TRIANGLE_M3, QUAD_M4, GLISSEMENTS,
  CENTRE_DEMI_TOUR, M_POINT, M_PARA, N_PARA, CADRE, dansLeCadre,
} from './translation4e';
import { dist, polygonArea } from '../../../../../common/utils/geometry2d';

const HERE = dirname(fileURLToPath(import.meta.url));
const LESSON = join(HERE, '..');

/* ═══ Les trois caractères du glissement ═══════════════════════════════════ */
describe('un glissement se décrit par sa direction, son sens et sa longueur', () => {
  it('la longueur est la distance parcourue par CHAQUE point', () => {
    const g = glissement({ dx: 120, dy: -160 });
    expect(g.longueur).toBeCloseTo(200, 9);
    for (const p of translater(DRAPEAU, g).map((q, i) => dist(DRAPEAU[i], q))) {
      expect(p).toBeCloseTo(200, 9);
    }
  });

  it('la direction est NON orientée : deux glissements opposés la partagent', () => {
    const g = glissement({ dx: 200, dy: -80 });
    const r = g.retour();
    expect(r.direction).toBeCloseTo(g.direction, 9);
    // …et pourtant ils ne font pas la même chose : c'est le SENS qui les sépare.
    expect(r.sens).not.toBe(g.sens);
  });

  it('la direction est ramenée dans [0 ; 180[ degrés', () => {
    for (const [dx, dy] of [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [3, -7]]) {
      const d = glissement({ dx, dy }).direction;
      expect(d).toBeGreaterThanOrEqual(0);
      expect(d).toBeLessThan(180);
    }
  });

  it('la direction se lit dans le repère de l’ÉLÈVE, pas dans celui du SVG', () => {
    // dy négatif = vers le HAUT sur l'écran : la diagonale montante fait 45°.
    expect(glissement({ dx: 100, dy: -100 }).direction).toBeCloseTo(45, 6);
    expect(glissement({ dx: 100, dy: 0 }).direction).toBeCloseTo(0, 6);
    expect(glissement({ dx: 0, dy: -100 }).direction).toBeCloseTo(90, 6);
  });

  it('le sens est nommé en français, dans le repère de l’élève', () => {
    expect(nomDuSens({ dx: 100, dy: 0 })).toBe('vers la droite');
    expect(nomDuSens({ dx: -100, dy: 0 })).toBe('vers la gauche');
    expect(nomDuSens({ dx: 0, dy: -100 })).toBe('vers le haut');
    expect(nomDuSens({ dx: 0, dy: 100 })).toBe('vers le bas');
    expect(nomDuSens({ dx: 100, dy: -100 })).toBe('vers la droite et vers le haut');
  });

  it('un glissement nul n’a NI sens NI trajet — l’écran ne peut pas en inventer un', () => {
    const g = glissement({ dx: 0, dy: 0 });
    expect(g.estNul).toBe(true);
    expect(g.sens).toBe(null);
    expect(translater(DRAPEAU, g)).toEqual(DRAPEAU);
  });

  it('le retour est le glissement qui défait, et il ramène EXACTEMENT au départ', () => {
    const g = GLISSEMENTS.m1;
    expect(translater(translater(DRAPEAU, g), g.retour())).toEqual(DRAPEAU);
  });
});

/* ═══ L'image d'un point, l'image d'une figure ═════════════════════════════ */
describe('l’image d’une figure EST l’image de chacun de ses points', () => {
  it('translater une figure ou translater ses sommets un à un donne la même chose', () => {
    const g = GLISSEMENTS.m3;
    const enBloc = translater(TRIANGLE_M3, g);
    const unParUn = TRIANGLE_M3.map((p) => translaterPoint(p, g));
    expect(unParUn).toEqual(enBloc);
  });

  it('translater refuse autre chose qu’un tableau — pas de silence sur un point seul', () => {
    expect(() => translater({ x: 0, y: 0 }, GLISSEMENTS.m1)).toThrow(/tableau/);
  });

  it('les trajets [M M’] ont TOUS la même longueur et sont TOUS parallèles', () => {
    const g = GLISSEMENTS.m1;
    const img = translater(DRAPEAU, g);
    const ts = trajets(DRAPEAU, img);
    expect(ts).toHaveLength(DRAPEAU.length);
    for (const t of ts) expect(t.longueur).toBeCloseTo(g.longueur, 9);
    expect(trajetsConcordants(DRAPEAU, img)).toBe(true);
  });
});

/* ═══ Retrouver le glissement — et le `null` qui enseigne ══════════════════ */
describe('retrouverGlissement rend le glissement, ou null quand il n’y en a pas', () => {
  it('sur une vraie translation, il retrouve exactement le glissement de départ', () => {
    const g = GLISSEMENTS.m4;
    const trouve = retrouverGlissement(QUAD_M4, translater(QUAD_M4, g));
    expect(trouve).not.toBe(null);
    expect(trouve.dx).toBeCloseTo(g.dx, 9);
    expect(trouve.dy).toBeCloseTo(g.dy, 9);
    expect(trouve.sens).toBe(g.sens);
  });

  it('sur un DEMI-TOUR, il renvoie null : les points n’ont pas fait le même trajet', () => {
    const image = demiTour(DRAPEAU, { x: 400, y: 280 });
    expect(retrouverGlissement(DRAPEAU, image)).toBe(null);
    expect(trajetsConcordants(DRAPEAU, image)).toBe(false);
  });

  it('sur une figure DÉFORMÉE, il renvoie null même si un sommet est bien placé', () => {
    const g = GLISSEMENTS.m3;
    const image = translater(TRIANGLE_M3, g);
    image[2] = { x: image[2].x + 60, y: image[2].y };
    expect(retrouverGlissement(TRIANGLE_M3, image)).toBe(null);
  });

  it('la tolérance est plus SERRÉE que ce que l’élève voit', () => {
    const g = GLISSEMENTS.m2;
    const image = translater(TRIANGLE_M3, g);
    // 4 unités SVG < 2 px à l'écran : accepté.
    image[1] = { x: image[1].x + 4, y: image[1].y };
    expect(retrouverGlissement(TRIANGLE_M3, image)).not.toBe(null);
    // 20 unités : nettement visible, donc refusé.
    image[1] = { x: image[1].x + 20, y: image[1].y };
    expect(retrouverGlissement(TRIANGLE_M3, image)).toBe(null);
  });

  it('deux listes de tailles différentes ne définissent aucun glissement', () => {
    expect(retrouverGlissement(TRIANGLE_M3, [])).toBe(null);
    expect(retrouverGlissement([], [])).toBe(null);
  });
});

/* ═══ Les invariants, MESURÉS sur les points dessinés ══════════════════════ */
describe('invariants : la figure ne ment jamais', () => {
  const g = GLISSEMENTS.m4;
  const image = translater(QUAD_M4, g);
  const inv = invariants(QUAD_M4, image);

  it('longueurs, angles, aire et parallélisme sont TOUS conservés', () => {
    expect(inv.longueurs.conserve).toBe(true);
    expect(inv.angles.conserve).toBe(true);
    expect(inv.aire.conserve).toBe(true);
    expect(inv.parallelisme.conserve).toBe(true);
    expect(inv.tout).toBe(true);
  });

  it('les deux aires sont calculées séparément et coïncident au dixième près', () => {
    expect(inv.aire.figure).toBeCloseTo(polygonArea(QUAD_M4), 9);
    expect(inv.aire.image).toBeCloseTo(polygonArea(image), 9);
    expect(Math.abs(inv.aire.figure - inv.aire.image)).toBeLessThan(1e-6);
  });

  it('une figure AGRANDIE fait échouer longueurs et aire — la mesure décide', () => {
    const agrandie = QUAD_M4.map((p) => ({ x: p.x * 1.5, y: p.y * 1.5 }));
    const bad = invariants(QUAD_M4, agrandie);
    expect(bad.longueurs.conserve).toBe(false);
    expect(bad.aire.conserve).toBe(false);
    expect(bad.tout).toBe(false);
    // …mais les angles, eux, tiennent : c'est ce qui rend l'agrandissement
    // différent d'une déformation, et pourquoi il est réservé à la 3e.
    expect(bad.angles.conserve).toBe(true);
  });

  it('une figure DÉFORMÉE fait échouer les angles', () => {
    const tordue = translater(QUAD_M4, g).map((p, i) => (i === 2 ? { x: p.x + 80, y: p.y } : p));
    expect(invariants(QUAD_M4, tordue).angles.conserve).toBe(false);
  });

  it('un DEMI-TOUR conserve tout SAUF… tout aussi : c’est pourquoi les invariants ne suffisent pas à reconnaître le geste', () => {
    // Fait pédagogique capital : les invariants ne DISTINGUENT pas les deux
    // transformations. Ce qui les distingue, ce sont les TRAJETS. Le module 4
    // le dit, et ce test empêche la leçon de prétendre l'inverse.
    const dt = demiTour(QUAD_M4, { x: 400, y: 280 });
    expect(invariants(QUAD_M4, dt).longueurs.conserve).toBe(true);
    expect(invariants(QUAD_M4, dt).aire.conserve).toBe(true);
    expect(trajetsConcordants(QUAD_M4, dt)).toBe(false);
  });
});

/* ═══ Le parallélogramme ═══════════════════════════════════════════════════ */
describe('parallelogrammeDe : l’ORDRE des sommets fait le parallélogramme', () => {
  const M = { x: 160, y: 320 };
  const N = { x: 280, y: 280 };
  const q = parallelogrammeDe(M, N, GLISSEMENTS.m5);

  it('M, M’, N’, N est bien un parallélogramme — mesuré, pas déclaré', () => {
    expect(q.estParallelogramme).toBe(true);
    expect(diagonalesMemeMilieu(q)).toBe(true);
  });

  it('l’ordre M, N, M’, N’ donne un quadrilatère CROISÉ, d’aire nulle', () => {
    /* Les deux lobes du nœud papillon sont superposables et parcourus en sens
       contraire : la formule du lacet les annule exactement. C'est la
       signature mathématique du « croisé », et non un artefact. */
    expect(polygonArea(q.sommetsCroises)).toBe(0);
    expect(polygonArea(q.sommets)).toBeGreaterThan(0);
  });

  it('quand M, N et le glissement sont alignés, la figure est aplatie et refusée', () => {
    // N sur la droite portant le glissement depuis M : les 4 points s'alignent.
    const gAligne = glissement({ dx: 120, dy: 0 });
    const plat = parallelogrammeDe({ x: 160, y: 320 }, { x: 400, y: 320 }, gAligne);
    expect(plat.aplati).toBe(true);
    expect(plat.estParallelogramme).toBe(false);
  });

  it('les images sont celles de translater — une seule vérité pour la figure', () => {
    expect(q.Mprime).toEqual(translaterPoint(M, GLISSEMENTS.m5));
    expect(q.Nprime).toEqual(translaterPoint(N, GLISSEMENTS.m5));
  });
});

/* ═══ Distinguer les trois gestes ══════════════════════════════════════════ */
describe('quelGeste tranche entre glissement, demi-tour et ni l’un ni l’autre', () => {
  it('une translation est reconnue comme glissement', () => {
    expect(quelGeste(DRAPEAU, translater(DRAPEAU, GLISSEMENTS.m1))).toBe('glissement');
  });

  it('une symétrie centrale est reconnue comme demi-tour', () => {
    expect(quelGeste(DRAPEAU, demiTour(DRAPEAU, { x: 400, y: 280 }))).toBe('demi-tour');
    expect(retrouverCentre(DRAPEAU, demiTour(DRAPEAU, { x: 400, y: 280 })))
      .toEqual({ x: 400, y: 280 });
  });

  it('un agrandissement n’est NI l’un NI l’autre', () => {
    expect(quelGeste(DRAPEAU, DRAPEAU.map((p) => ({ x: p.x * 1.4, y: p.y * 1.4 })))).toBe('aucun');
  });

  it('la figure immobile est classée « glissement » (nul), pas « demi-tour »', () => {
    expect(quelGeste(DRAPEAU, [...DRAPEAU])).toBe('glissement');
  });
});

/* ═══ Le quadrillage : toute cible est ATTEIGNABLE ═════════════════════════ */
describe('quadrillage', () => {
  it('auNoeud ramène au nœud le plus proche, estSurNoeud le confirme', () => {
    expect(auNoeud({ x: 137, y: 22 })).toEqual({ x: 120, y: 40 });
    expect(estSurNoeud({ x: 120, y: 40 })).toBe(true);
    expect(estSurNoeud({ x: 137, y: 40 })).toBe(false);
  });

  it('CHAQUE figure de la leçon a tous ses sommets sur des nœuds', () => {
    for (const [nom, fig] of Object.entries({ DRAPEAU, TRIANGLE_M3, QUAD_M4 })) {
      for (const p of fig) expect(estSurNoeud(p), `${nom} ${JSON.stringify(p)}`).toBe(true);
    }
  });

  it('CHAQUE glissement de la leçon est un multiple entier du pas', () => {
    for (const [nom, g] of Object.entries(GLISSEMENTS)) {
      expect(Number.isInteger(g.dx / PAS), `${nom}.dx`).toBe(true);
      expect(Number.isInteger(g.dy / PAS), `${nom}.dy`).toBe(true);
    }
  });

  it('CHAQUE figure ET son image tiennent dans le cadre — sinon on ne les verrait pas', () => {
    for (const [nom, fig, g] of [
      ['DRAPEAU/m1', DRAPEAU, GLISSEMENTS.m1],
      ['TRIANGLE/m3', TRIANGLE_M3, GLISSEMENTS.m3],
      ['QUAD/m4', QUAD_M4, GLISSEMENTS.m4],
    ]) {
      expect(dansLeCadre(fig), `${nom} figure`).toBe(true);
      expect(dansLeCadre(translater(fig, g)), `${nom} image`).toBe(true);
    }
    // Le contre-exemple du module 1 aussi : un demi-tour qui sortirait du
    // cadre ne montrerait rien.
    expect(dansLeCadre(demiTour(DRAPEAU, CENTRE_DEMI_TOUR))).toBe(true);
  });

  it('enCarreaux traduit les unités SVG en carreaux comptables', () => {
    expect(enCarreaux(200)).toBe(5);
    expect(enCarreaux(GLISSEMENTS.m3.dx)).toBe(7);
    // Le glissement du module 2 mesure exactement 5 carreaux : un nombre que
    // l'élève peut compter, et c'est pourquoi il a été choisi.
    expect(enCarreaux(GLISSEMENTS.m2.longueur)).toBe(5);
  });
});

/* ═══ Écritures ════════════════════════════════════════════════════════════ */
describe('écritures françaises', () => {
  it('fr utilise la virgule décimale et arrondit', () => {
    expect(fr(3.25, 1)).toBe('3,3');
    expect(fr(5, 1)).toBe('5');
    expect(fr(NaN)).toBe('—');
  });

  it('round n’introduit pas de bruit binaire', () => {
    expect(round(0.1 + 0.2, 2)).toBe(0.3);
  });
});

/* ═══ PÉRIMÈTRE — la frontière 4e/3e est EXÉCUTABLE ═══════════════════════ */
describe('périmètre de 4e', () => {
  it('les quatre sujets de 3e LÈVENT, ils ne sont pas seulement commentés', () => {
    expect(SUJETS_HORS_PERIMETRE.sort()).toEqual(
      ['chasles', 'coordonnees-vecteur', 'homothetie', 'vecteur'],
    );
    for (const sujet of SUJETS_HORS_PERIMETRE) {
      expect(() => assertScope4e(sujet), sujet).toThrow(/réservé à la 3e/);
    }
  });

  it('un sujet du programme de 4e passe', () => {
    expect(assertScope4e('translation')).toBe(true);
    expect(assertScope4e('parallelogramme')).toBe(true);
  });

  it('le noyau n’EXPORTE aucune fonction de 3e — la garde est structurelle', async () => {
    const api = Object.keys(await import('./translation4e'));
    for (const interdit of ['composer', 'chasles', 'coordonnees', 'homothetie', 'agrandir', 'vecteur']) {
      expect(api.some((k) => k.toLowerCase().includes(interdit)), `${interdit} exporté`).toBe(false);
    }
    // …et il exporte bien ce que la leçon promet.
    for (const attendu of ['translater', 'retrouverGlissement', 'invariants', 'assertScope4e']) {
      expect(api).toContain(attendu);
    }
  });
});

/* ═══ LE MOT INTERDIT — vérifié sur le TEXTE SOURCE ═══════════════════════ */
describe('le mot « vecteur » n’atteint jamais l’élève', () => {
  /** Tous les fichiers que l'élève peut lire : modules, composants, carte. */
  const fichiersEleve = () => {
    const out = [];
    const walk = (dir) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.jsx?$/.test(e.name) && !/\.test\.jsx?$/.test(e.name)) out.push(p);
      }
    };
    walk(LESSON);
    return out;
  };

  it('aucun fichier rendu à l’élève ne contient « vecteur », « Chasles » ni « homothétie »', () => {
    const coupables = [];
    for (const f of fichiersEleve()) {
      // Le noyau porte les CLÉS de la garde de périmètre : c'est son rôle, et
      // rien de ce qu'il contient n'est affiché. Tout le reste est du texte vu.
      if (f.endsWith('translation4e.js')) continue;
      const src = readFileSync(f, 'utf-8');
      if (/vecteur|chasles|homoth[ée]tie/i.test(src)) coupables.push(f.replace(LESSON, ''));
    }
    expect(coupables, coupables.join(', ')).toEqual([]);
  });

  it('même le noyau ne l’emploie que dans son en-tête et sa garde de périmètre', () => {
    const src = readFileSync(join(LESSON, 'components/translation4e.js'), 'utf-8');
    const lignes = src.split('\n');
    const debutGarde = lignes.findIndex((l) => l.includes('HORS_PERIMETRE_4E = {'));
    const finGarde = lignes.findIndex((l) => l.includes('SUJETS_HORS_PERIMETRE'));
    const finEntete = lignes.findIndex((l) => l.startsWith('import '));
    expect(debutGarde, 'la garde de périmètre existe').toBeGreaterThan(0);

    const fautives = lignes
      .map((l, i) => ({ l, i }))
      .filter(({ l }) => /vecteur/i.test(l))
      // L'en-tête du fichier explique l'interdiction : c'est sa raison d'être.
      .filter(({ i }) => i > finEntete)
      // Le bloc de la garde porte les CLÉS refusées et leurs messages.
      .filter(({ i }) => i < debutGarde || i > finGarde)
      .map(({ l, i }) => `${i + 1}: ${l.trim()}`);

    expect(fautives, fautives.join(' | ')).toEqual([]);
  });
});
