import { describe, it, expect } from 'vitest';
import {
  PAS_T, T_MIN, T_MAX, aimanterT, crans, parametreSousLeDoigt,
} from './ParametreLab';
import {
  droiteNom, pointDeParametre, parametreDe, lignesParametriques,
  orientationsAtteignables, ecran, DEMI_CADRE, RAYON_POIGNEE, NOMS, pt, v3,
  ORIENTATION_DEPART,
} from './planUtils';

/**
 * Les fonctions PURES du laboratoire du paramètre. Elles vivent dans le
 * composant parce qu'elles n'ont de sens que pour lui, mais elles sont testées
 * comme un modèle : le composant n'invente aucune valeur.
 */

/** Les droites que le module 4 propose. */
const DROITES = [
  droiteNom('A', 'G'),
  droiteNom('B', 'H'),
  droiteNom('A', 'C'),
  droiteNom('E', 'C'),
];

describe('le paramètre et son aimantation', () => {
  it('aimante tout paramètre sur un cran, et le borne', () => {
    expect(aimanterT(0)).toBe(0);
    expect(aimanterT(0.4)).toBe(0.5);
    expect(aimanterT(0.1)).toBe(0);
    expect(aimanterT(0.9)).toBe(1);
    expect(aimanterT(-0.1)).toBe(0);
    expect(aimanterT(99)).toBe(T_MAX);
    expect(aimanterT(-99)).toBe(T_MIN);
    // Jamais de −0 : un « t = −0 » affiché serait absurde, et une comparaison
    // à 0 dans un module échouerait sans que rien ne paraisse anormal.
    expect(Object.is(aimanterT(-0.1), -0)).toBe(false);
    expect(Object.is(aimanterT(-0), -0)).toBe(false);
  });

  // LES CIBLES PÉDAGOGIQUES DOIVENT TOMBER SUR UN CRAN. Le module 4 demande
  // d'atteindre t = 0, t = 1 et le milieu : sans cela, la consigne serait un
  // ordre impossible au doigt.
  it('rend les trois cibles pédagogiques EXACTEMENT atteignables', () => {
    const C = crans();
    for (const cible of [0, 0.25, 0.5, 0.75, 1, T_MIN, T_MAX]) {
      expect(C, `t = ${cible} n'est pas un cran`).toContain(cible);
    }
    expect(C[0]).toBe(T_MIN);
    expect(C[C.length - 1]).toBe(T_MAX);
    expect(C).toHaveLength(1 + (T_MAX - T_MIN) / PAS_T);
    // Tous les crans sont distincts et croissants.
    for (let i = 1; i < C.length; i += 1) expect(C[i]).toBeGreaterThan(C[i - 1]);
  });

  it('dépasse des DEUX côtés du segment de référence', () => {
    // Sans quoi l'élève croirait que la droite s'arrête aux deux points qui la
    // définissent — l'erreur que le module 4 vise explicitement.
    expect(T_MIN).toBeLessThan(0);
    expect(T_MAX).toBeGreaterThan(1);
  });

  // C'est ce mécanisme qui rend le glisser compatible avec l'atteignabilité :
  // le curseur ne peut littéralement pas s'arrêter entre deux crans.
  it('aimante le doigt sur un cran, où qu’il tombe dans le cadre', () => {
    for (const droite of DROITES) {
      for (const o of orientationsAtteignables()) {
        for (const x of [-500, 0, 40, 150, 260, 299, 900]) {
          for (const y of [-500, 0, 150, 299, 900]) {
            const t = parametreSousLeDoigt(o, droite, { x, y }, 0);
            expect(crans()).toContain(t);
          }
        }
      }
    }
  });

  it('rend le paramètre exact quand le doigt tombe SUR un cran', () => {
    for (const droite of DROITES) {
      for (const o of orientationsAtteignables()) {
        for (const cible of crans()) {
          const [E] = ecran(o, [pointDeParametre(droite, cible)]);
          expect(parametreSousLeDoigt(o, droite, E, 0)).toBeCloseTo(cible, 9);
        }
      }
    }
  });

  it('garde le paramètre courant quand le segment est dégénéré à l’écran', () => {
    // Une droite dont les deux ancres se projettent au même point : la
    // projection orthogonale n'a plus de sens, et rendre 0 ferait sauter le
    // curseur au départ sans que l'élève l'ait demandé.
    const degeneree = { A: v3(0, 0, 0), u: v3(0, 0, 0), nom: 'dégénérée' };
    const o = orientationsAtteignables()[0];
    expect(parametreSousLeDoigt(o, degeneree, { x: 10, y: 10 }, 1.5)).toBe(1.5);
  });
});

describe('le point du curseur, dérivé du seul paramètre', () => {
  it('donne les points remarquables des quatre droites du module', () => {
    expect(pointDeParametre(droiteNom('A', 'G'), 0)).toEqual(pt('A'));
    expect(pointDeParametre(droiteNom('A', 'G'), 1)).toEqual(pt('G'));
    expect(pointDeParametre(droiteNom('A', 'G'), 0.5)).toEqual(v3(1, 1, 1));
    expect(pointDeParametre(droiteNom('B', 'H'), 0.5)).toEqual(v3(1, 1, 1));
    expect(pointDeParametre(droiteNom('A', 'C'), 0.5)).toEqual(v3(1, 1, 0));
    expect(pointDeParametre(droiteNom('E', 'C'), 0.5)).toEqual(v3(1, 1, 1));
  });

  it('rend des coordonnées lisibles sur chaque cran, pour chaque droite', () => {
    // Le cran d'un QUART et les directeurs à coordonnées ±2 s'accordent : chaque
    // position lue par l'élève est un demi-entier, jamais un 1,3333.
    for (const droite of DROITES) {
      for (const t of crans()) {
        const M = pointDeParametre(droite, t);
        for (const axe of ['x', 'y', 'z']) {
          expect(Number.isInteger(M[axe] * 2), `${droite.nom} t=${t} ${axe}=${M[axe]}`).toBe(true);
        }
      }
      // Et sur les trois cibles pédagogiques, elles sont ENTIÈRES.
      for (const t of [0, 0.5, 1]) {
        const M = pointDeParametre(droite, t);
        for (const axe of ['x', 'y', 'z']) expect(Number.isInteger(M[axe])).toBe(true);
      }
    }
  });

  it('retrouve le paramètre de chaque point du curseur', () => {
    for (const droite of DROITES) {
      for (const t of crans()) {
        expect(parametreDe(droite, pointDeParametre(droite, t))).toBeCloseTo(t, 12);
      }
    }
  });

  it('écrit les trois lignes des quatre droites, sans jamais en omettre une', () => {
    for (const droite of DROITES) {
      const l = lignesParametriques(droite);
      expect(l).toHaveLength(3);
      expect(l.map((r) => r.axe)).toEqual(['x', 'y', 'z']);
      for (const r of l) expect(r.texte).toMatch(/^[xyz] = /);
    }
    expect(lignesParametriques(droiteNom('A', 'C')).map((r) => r.texte)).toEqual([
      'x = 0 + 2t', 'y = 0 + 2t', 'z = 0 + 0t',
    ]);
  });
});

describe('sécurité de mise en page du laboratoire du paramètre', () => {
  // LE PROLONGEMENT SORT DU CUBE. C'est voulu — il montre que la droite ne
  // s'arrête pas — mais il ne doit pas sortir du CADRE. On BALAIE toute la
  // plage : quatre droites × 21 orientations × 7 crans.
  it('ne laisse RIEN sortir du cadre, prolongement compris', () => {
    const marge = RAYON_POIGNEE + 1;
    let controles = 0;
    for (const droite of DROITES) {
      for (const o of orientationsAtteignables()) {
        const pts = crans().map((t) => pointDeParametre(droite, t));
        for (const P of ecran(o, pts)) {
          expect(P.x, `${droite.nom} @ ${JSON.stringify(o)}`).toBeGreaterThanOrEqual(marge);
          expect(P.x).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
          expect(P.y).toBeGreaterThanOrEqual(marge);
          expect(P.y).toBeLessThanOrEqual(2 * DEMI_CADRE - marge);
          controles += 1;
        }
      }
    }
    expect(controles).toBeGreaterThan(500);
    // Et le dépassement reste VISIBLE : c'est lui qui montre que la droite ne
    // s'arrête pas. On le mesure dans la vue de départ plutôt que de l'espérer.
    for (const droite of DROITES) {
      const [Emin, E0, E1] = ecran(ORIENTATION_DEPART, [
        pointDeParametre(droite, T_MIN), pointDeParametre(droite, 0), pointDeParametre(droite, 1),
      ]);
      const segment = Math.hypot(E1.x - E0.x, E1.y - E0.y);
      const depasse = Math.hypot(Emin.x - E0.x, Emin.y - E0.y);
      expect(depasse).toBeGreaterThan(3 * RAYON_POIGNEE);
      expect(depasse).toBeLessThan(segment);
    }
  });

  it('garde le curseur discernable des deux ancres à mi-parcours', () => {
    // À t = 0,5, le curseur est entre les deux ancres : il ne doit pas les
    // recouvrir, sinon l'élève ne saurait plus ce qu'il attrape.
    let mini = Infinity;
    for (const droite of DROITES) {
      for (const o of orientationsAtteignables()) {
        const [E0, E1, EM] = ecran(o, [
          pointDeParametre(droite, 0), pointDeParametre(droite, 1), pointDeParametre(droite, 0.5),
        ]);
        mini = Math.min(mini,
          Math.hypot(E0.x - EM.x, E0.y - EM.y),
          Math.hypot(E1.x - EM.x, E1.y - EM.y));
      }
    }
    expect(mini).toBeGreaterThan(RAYON_POIGNEE + 5.5);
  });

  it('n’emploie que des sommets du cube pour définir ses droites', () => {
    for (const droite of DROITES) {
      expect(NOMS).toContain(droite.a);
      expect(NOMS).toContain(droite.b);
    }
  });
});

/* ═════════════════════════════════════════════════════════════════════════
   LES VALEURS ET LES DISTRACTEURS CITÉS PAR LE MODULE 4
   ═════════════════════════════════════════════════════════════════════════ */

describe('les valeurs et les pièges du module 4', () => {
  // §15 du patron : chaque distracteur est CALCULÉ, et distinct de la bonne
  // réponse comme des autres. Deux options identiques rendraient l'épreuve
  // insoluble — et ici, les quatre options sont produites par la MÊME fonction
  // sur quatre droites différentes, donc rien ne garantit a priori qu'elles
  // diffèrent.
  it('rend les quatre représentations paramétriques du QCM DISTINCTES', () => {
    const options = [
      droiteNom('B', 'H'),      // la bonne
      droiteNom('A', 'G'),      // la droite de l'étape 1, familière
      droiteNom('H', 'B'),      // la même droite, parcourue à l'envers
      droiteNom('A', 'C'),      // celle dont un coefficient est nul
    ].map((d) => lignesParametriques(d).map((l) => l.texte).join(' ; '));
    expect(new Set(options).size).toBe(options.length);
    // Et chacune décrit BIEN la droite annoncée : t = 0 rend le départ,
    // t = 1 rend l'arrivée.
    for (const [a, b] of [['B', 'H'], ['A', 'G'], ['H', 'B'], ['A', 'C']]) {
      const d = droiteNom(a, b);
      expect(pointDeParametre(d, 0)).toEqual(pt(a));
      expect(pointDeParametre(d, 1)).toEqual(pt(b));
    }
  });

  // (HB) est la MÊME droite que (BH), parcourue à l'envers : c'est un
  // distracteur honnête — son écriture diffère, et un élève qui vérifie sur
  // t = 0 le rejette pour la bonne raison.
  it('fait de (HB) un piège plausible : même droite, écriture différente', () => {
    const bh = droiteNom('B', 'H');
    const hb = droiteNom('H', 'B');
    expect(lignesParametriques(bh).map((l) => l.texte))
      .not.toEqual(lignesParametriques(hb).map((l) => l.texte));
    // Mais le point de départ annoncé n'est pas le même : c'est ce qui permet
    // de trancher sans ambiguïté.
    expect(pointDeParametre(hb, 0)).not.toEqual(pointDeParametre(bh, 0));
  });

  // LE POINT-PIÈGE de l'étape 3 : deux coordonnées s'accordent, la troisième
  // refuse. Si le point était réellement sur la droite, la question serait
  // fausse.
  it('vérifie que le point-piège (1 ; 1 ; 1) n’est PAS sur (AC)', () => {
    const ac = droiteNom('A', 'C');
    const piege = v3(1, 1, 1);
    expect(parametreDe(ac, piege)).toBeNull();
    // Et que les DEUX premières coordonnées s'accordent bien, sinon le piège
    // serait grossier et n'apprendrait rien.
    expect(piege.x / ac.u.x).toBeCloseTo(0.5, 12);
    expect(piege.y / ac.u.y).toBeCloseTo(0.5, 12);
    // La troisième est celle qui refuse.
    expect(ac.u.z).toBe(0);
    expect(piege.z).not.toBe(ac.A.z);
    // Le vrai point de paramètre 0,5 est un autre point.
    expect(pointDeParametre(ac, 0.5)).toEqual(v3(1, 1, 0));
  });

  it('vérifie que le milieu de (AG) est bien le centre de la boîte', () => {
    expect(pointDeParametre(droiteNom('A', 'G'), 0.5)).toEqual(v3(1, 1, 1));
    // Et que la cible 0,5 est atteignable au cran.
    expect(crans()).toContain(0.5);
  });
});
