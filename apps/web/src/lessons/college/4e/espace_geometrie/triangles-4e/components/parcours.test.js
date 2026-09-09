import { describe, it, expect } from 'vitest';
import {
  A_DEFAUT, B_DEFAUT, C_DEPART, CADRE, surLeCercleAB,
  caracterisationRectangle, cercleCirconscrit, medianeVersAB,
  droiteDesMilieux, reciproqueMilieux, statut, ENONCES_IDS,
  preuveEstCharpentee, TRIANGLES_MILIEUX, dist, midpoint, arrondi,
} from './triangles4e';
import { vueDe, MARGE, RAYON_MAX_CADRE, HIT_R } from './DetectiveLab';

/**
 * Les deux PAS de déplacement au clavier, recopiés des labos. Ils sont ici
 * pour être COMPARÉS à la taille des cibles : c'est cette comparaison, et non
 * un essai particulier, qui garantit qu'aucune cible n'est enjambable.
 */
const PAS_CLAVIER = 4;   // DetectiveLab, en unités de viewBox
const PAS_T = 0.01;      // MilieuxLab en mode réciproque, en paramètre

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « le centre vient se poser sur
 * le milieu », « ces deux nombres ne bougent pas », « une seule position rend
 * le trait parallèle ». Ces affirmations sont du CONTENU PÉDAGOGIQUE : si le
 * comportement réel diffère, la leçon MENT à l'élève.
 *
 * Ce fichier vérifie trois choses qu'aucun autre test ne voit :
 *   1. les NOMBRES que les modules affichent, calculés depuis le noyau ;
 *   2. l'ATTEIGNABILITÉ de chaque cible — un défi qu'on ne peut pas gagner
 *      n'est pas un défi, et une cible d'un pixel de large n'est pas honnête ;
 *   3. la SÉCURITÉ VISUELLE du cadre déduit du labo signature, à TOUTE position
 *      atteignable de C. `vueDe` est importée du composant lui-même : le test
 *      ne peut donc pas diverger de ce qui est réellement dessiné.
 */

/* ═══ MODULE 1 — Le labo signature ═════════════════════════════════════ */
describe('Module 1 — « amène l’angle en C à 90° »', () => {
  it('la position de DÉPART n’est PAS la solution — sinon il n’y a rien à chercher', () => {
    const k = caracterisationRectangle(A_DEFAUT, B_DEFAUT, C_DEPART);
    expect(k.droit).toBe(false);
    expect(k.nature).toBe('obtus');
    // …et elle est franchement loin, pas à un cheveu : l'élève doit voir qu'il
    // a du chemin à faire.
    expect(Math.abs(k.angleC - 90)).toBeGreaterThan(8);
  });

  it('ATTEIGNABILITÉ : la cible se trouve au pas du CLAVIER depuis le départ', () => {
    // DÉFAUT RÉEL, ATTRAPÉ ICI. Avec le pas de 12 unités des labos voisins, la
    // montée verticale passait de 97,7° à 92,4° puis 87,5° : elle ENJAMBAIT la
    // bande gagnante, et le défi était impossible au clavier alors qu'il se
    // gagnait à la souris. Le pas vaut maintenant 4.
    let C = { ...C_DEPART };
    let atteint = false;
    for (let i = 0; i < 120 && !atteint; i += 1) {
      C = { x: C.x, y: C.y - PAS_CLAVIER };
      if (caracterisationRectangle(A_DEFAUT, B_DEFAUT, C).droit) atteint = true;
    }
    expect(atteint, `dernière position : ${JSON.stringify(C)}`).toBe(true);
  });

  it('ATTEIGNABILITÉ : le pas clavier est PLUS PETIT que la bande gagnante', () => {
    // La garde générale, celle qui empêchera le défaut de revenir : quel que
    // soit l'endroit d'où l'élève arrive, il ne peut pas enjamber la cible.
    const M = midpoint(A_DEFAUT, B_DEFAUT);
    for (const x of [200, 250, 300, 350, 420]) {
      const bande = [];
      for (let y = 60; y <= 300; y += 0.25) {
        if (caracterisationRectangle(A_DEFAUT, B_DEFAUT, { x, y }).droit) bande.push(y);
      }
      expect(bande.length, `x = ${x}`).toBeGreaterThan(0);
      const hauteur = Math.max(...bande) - Math.min(...bande);
      expect(hauteur, `x = ${x} : bande de ${arrondi(hauteur, 2)} unités`).toBeGreaterThan(PAS_CLAVIER);
    }
    expect(M.x).toBeGreaterThan(0);
  });

  it('la zone gagnante fait plusieurs unités de haut, pas un pixel', () => {
    // Sur la verticale du milieu, on mesure la hauteur de la bande où l'angle
    // est déclaré droit. Une cible d'une unité serait injouable au doigt.
    const M = midpoint(A_DEFAUT, B_DEFAUT);
    const gagnantes = [];
    for (let y = M.y - 200; y <= M.y - 60; y += 0.5) {
      if (caracterisationRectangle(A_DEFAUT, B_DEFAUT, { x: M.x, y }).droit) gagnantes.push(y);
    }
    expect(gagnantes.length).toBeGreaterThan(0);
    const hauteur = Math.max(...gagnantes) - Math.min(...gagnantes);
    expect(hauteur, `bande de ${hauteur} unités`).toBeGreaterThanOrEqual(4);
  });

  it('les DEUX témoins du lab disent toujours la même chose (jamais de contradiction affichée)', () => {
    // Le lab affiche « les deux témoins se contredisent » comme garde-fou. Ce
    // message ne doit JAMAIS apparaître : les deux seuils sont dérivés l'un de
    // l'autre. On le vérifie sur toute la zone atteignable au pointeur.
    for (let x = 24; x <= CADRE.largeur - 24; x += 12) {
      for (let y = 24; y <= A_DEFAUT.y - 14; y += 12) {
        const k = caracterisationRectangle(A_DEFAUT, B_DEFAUT, { x, y });
        expect(k.droit === k.centreSurMilieu, `C = (${x}, ${y}) angle ${arrondi(k.angleC, 2)}°`).toBe(true);
      }
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre déduit contient A, B, C et M à toute position', () => {
    const M = midpoint(A_DEFAUT, B_DEFAUT);
    for (let x = 24; x <= CADRE.largeur - 24; x += 10) {
      for (let y = 24; y <= A_DEFAUT.y - 14; y += 10) {
        const C = { x, y };
        const v = vueDe(C);
        for (const [nom, p] of [['A', A_DEFAUT], ['B', B_DEFAUT], ['C', C], ['M', M]]) {
          expect(p.x, `${nom} à C=(${x},${y})`).toBeGreaterThanOrEqual(v.x - 1e-9);
          expect(p.x).toBeLessThanOrEqual(v.x + v.w + 1e-9);
          expect(p.y).toBeGreaterThanOrEqual(v.y - 1e-9);
          expect(p.y).toBeLessThanOrEqual(v.y + v.h + 1e-9);
        }
      }
    }
  });

  it('SÉCURITÉ VISUELLE : le centre O entre dans le cadre quand il est PROCHE', () => {
    // C'est la promesse du module : on VOIT le point rouge se rapprocher.
    // Quand il fuit à l'infini (C près de (AB)), il est légitimement hors
    // cadre — mais tant qu'il est raisonnablement proche, il doit être visible.
    for (let x = 60; x <= 560; x += 20) {
      for (let y = 40; y <= 260; y += 20) {
        const C = { x, y };
        const cercle = cercleCirconscrit(A_DEFAUT, B_DEFAUT, C);
        if (!cercle) continue;
        if (dist(cercle.centre, midpoint(A_DEFAUT, B_DEFAUT)) > RAYON_MAX_CADRE) continue;
        const v = vueDe(C);
        expect(cercle.centre.x, `O à C=(${x},${y})`).toBeGreaterThanOrEqual(v.x - 1e-9);
        expect(cercle.centre.x).toBeLessThanOrEqual(v.x + v.w + 1e-9);
        expect(cercle.centre.y).toBeGreaterThanOrEqual(v.y - 1e-9);
        expect(cercle.centre.y).toBeLessThanOrEqual(v.y + v.h + 1e-9);
      }
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre garde un rapport d’aspect ≤ 3, partout', () => {
    // DÉFAUT ÉVITÉ : le rayon du cercle circonscrit tend vers l'infini quand C
    // approche de la droite (AB). Un cadre déduit naïvement du cercle entier
    // deviendrait démesuré, et la figure disparaîtrait en un point. Le rayon
    // est donc plafonné, et la garde d'aspect élargit — jamais ne rogne.
    for (let x = 24; x <= CADRE.largeur - 24; x += 10) {
      for (let y = 24; y <= A_DEFAUT.y - 14; y += 10) {
        const v = vueDe({ x, y });
        expect(v.w, `C=(${x},${y})`).toBeGreaterThan(0);
        expect(v.h).toBeGreaterThan(0);
        expect(v.h / v.w, `C=(${x},${y}) : ${arrondi(v.h, 1)}×${arrondi(v.w, 1)}`).toBeLessThanOrEqual(3.0001);
        expect(v.w / v.h, `C=(${x},${y})`).toBeLessThanOrEqual(3.0001);
      }
    }
  });

  it('SÉCURITÉ VISUELLE : la cible tactile ne déborde JAMAIS du cadre déduit', () => {
    // DÉFAUT ATTRAPÉ AU NAVIGATEUR (audit `domOverflow`). Le disque invisible
    // de 68 unités autour de C dépassait du SVG dès que le cadre se resserrait,
    // donc de la colonne principale : une partie de la zone sensible tombait
    // hors de l'écran. Le rayon est maintenant borné par les marges du cadre.
    // On reproduit ici la formule de `hitBorne`, et on vérifie les DEUX
    // exigences : ne pas déborder, et rester au-dessus du rayon visible.
    const R_VISIBLE = 11;
    for (let x = 24; x <= CADRE.largeur - 24; x += 10) {
      for (let y = 24; y <= A_DEFAUT.y - 14; y += 10) {
        const v = vueDe({ x, y });
        const px = x - v.x;
        const py = y - v.y;
        const hit = Math.max(R_VISIBLE + 6, Math.min(HIT_R, px, v.w - px, py, v.h - py));
        // La cible reste dans le cadre…
        expect(px - hit, `C=(${x},${y})`).toBeGreaterThanOrEqual(-1e-6);
        expect(py - hit, `C=(${x},${y})`).toBeGreaterThanOrEqual(-1e-6);
        expect(px + hit).toBeLessThanOrEqual(v.w + 1e-6);
        expect(py + hit).toBeLessThanOrEqual(v.h + 1e-6);
        // …et elle reste plus grande que la pastille visible, sinon la poignée
        // deviendrait plus petite que ce qu'on voit.
        expect(hit).toBeGreaterThan(R_VISIBLE);
      }
    }
  });

  it('SÉCURITÉ VISUELLE : la marge annoncée est bien celle qui sépare le contenu du bord', () => {
    // Sur une position centrale, où rien n'est plafonné, le cadre doit être
    // exactement le contenu plus MARGE — sinon la constante mentirait.
    const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, Math.PI / 2);
    const v = vueDe(C);
    const cercle = cercleCirconscrit(A_DEFAUT, B_DEFAUT, C);
    expect(cercle.rayon).toBeLessThan(RAYON_MAX_CADRE);
    expect(v.x).toBeCloseTo(cercle.centre.x - cercle.rayon - MARGE, 6);
  });
});

/* ═══ MODULE 2 — Le demi-tour ══════════════════════════════════════════ */
describe('Module 2 — « 90° partout sur le cercle »', () => {
  // Les quatre positions proposées par les boutons du module.
  const THETAS = [90, 152, 26, 62];

  it('les quatre positions du module donnent TOUTES 90,0° à l’affichage', () => {
    for (const theta of THETAS) {
      const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, (theta * Math.PI) / 180);
      const k = caracterisationRectangle(A_DEFAUT, B_DEFAUT, C);
      // C'est le nombre EXACT que le tableau du module écrit.
      expect(arrondi(k.angleC, 1), `θ = ${theta}°`).toBe(90);
      expect(k.droit).toBe(true);
    }
  });

  it('les quatre positions sont VRAIMENT différentes — sinon le relevé ne prouve rien', () => {
    const points = THETAS.map((t) => surLeCercleAB(A_DEFAUT, B_DEFAUT, (t * Math.PI) / 180));
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        expect(dist(points[i], points[j]), `${THETAS[i]}° vs ${THETAS[j]}°`).toBeGreaterThan(40);
      }
    }
  });

  it('le rapport CM ÷ AB que le module affiche vaut bien 0,50 aux quatre positions', () => {
    for (const theta of THETAS) {
      const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, (theta * Math.PI) / 180);
      const med = medianeVersAB(A_DEFAUT, B_DEFAUT, C);
      expect(arrondi(med.rapport, 2), `θ = ${theta}°`).toBe(0.5);
      expect(med.estLaMoitie).toBe(true);
    }
  });

  it('le glisser du module reste sur le cercle : les bornes ne cassent pas la propriété', () => {
    // Le module borne l'angle polaire à [0,12 ; π − 0,12] rad. Aux deux bornes,
    // le triangle doit rester valide et rectangle.
    for (const t of [0.12, Math.PI - 0.12]) {
      const C = surLeCercleAB(A_DEFAUT, B_DEFAUT, t);
      expect(caracterisationRectangle(A_DEFAUT, B_DEFAUT, C).droit, `t = ${t}`).toBe(true);
      // …et le point reste dans le cadre de référence.
      expect(C.x).toBeGreaterThan(0);
      expect(C.x).toBeLessThan(CADRE.largeur);
      expect(C.y).toBeGreaterThan(0);
    }
  });
});

/* ═══ MODULE 3 — Deux milieux, une droite ══════════════════════════════ */
describe('Module 3 — « 0,0° et 0,50 sur toutes les formes »', () => {
  const { A, B, C } = TRIANGLES_MILIEUX[0];

  it('le triangle de départ affiche exactement les deux nombres annoncés', () => {
    const m = droiteDesMilieux(A, B, C);
    expect(arrondi(m.angleAvecBC, 1)).toBe(0);
    expect(arrondi(m.rapport, 2)).toBe(0.5);
  });

  it('ATTEIGNABILITÉ : toutes les positions de A que le lab autorise gardent la propriété', () => {
    // Le lab borne A à x ∈ [24 ; 596] et y ≤ min(B.y, C.y) − 30. Chacune de ces
    // positions doit donner 0,0° et 0,50 : sinon un élève pourrait fabriquer un
    // relevé qui contredit la propriété que le module va énoncer.
    const yMax = Math.min(B.y, C.y) - 30;
    for (let x = 24; x <= 596; x += 20) {
      for (let y = 24; y <= yMax; y += 20) {
        const m = droiteDesMilieux({ x, y }, B, C);
        expect(arrondi(m.angleAvecBC, 1), `A = (${x}, ${y})`).toBe(0);
        expect(arrondi(m.rapport, 2), `A = (${x}, ${y})`).toBe(0.5);
      }
    }
  });

  it('la question chiffrée du module 3 est cohérente : BC ÷ 2 est bien la réponse', () => {
    // Le module affiche BC en dixièmes d'unité et attend BC ÷ 2. On vérifie que
    // l'arrondi n'introduit pas d'écart : sinon la réponse juste serait refusée.
    const m = droiteDesMilieux(A, B, C);
    const bcAffiche = arrondi(m.longBC / 10, 1);
    const ijAttendu = arrondi(bcAffiche / 2, 2);
    const ijReel = arrondi(m.longIJ / 10, 2);
    expect(Math.abs(ijAttendu - ijReel), `attendu ${ijAttendu}, réel ${ijReel}`).toBeLessThan(0.06);
  });

  it('les trois triangles du noyau sont VRAIMENT de formes différentes', () => {
    const formes = TRIANGLES_MILIEUX.map((T) => {
      const m = droiteDesMilieux(T.A, T.B, T.C);
      return arrondi(m.longBC, 0);
    });
    expect(new Set(formes).size, formes.join(' ')).toBe(formes.length);
  });
});

/* ═══ MODULE 4 — La réciproque ═════════════════════════════════════════ */
describe('Module 4 — « une seule position rend le trait parallèle »', () => {
  const { A, B, C } = TRIANGLES_MILIEUX[1];

  it('la position de DÉPART (t = 0,24) n’est pas la solution', () => {
    const r = reciproqueMilieux(A, B, C, 0.24);
    expect(r.parallele).toBe(false);
    // …et l'écart d'angle est franchement VISIBLE : l'élève doit voir qu'il
    // n'y est pas encore.
    expect(r.angleAvecBC).toBeGreaterThan(5);
  });

  it('ATTEIGNABILITÉ : le pas clavier atteint la cible depuis le départ', () => {
    let t = 0.24;
    let atteint = false;
    for (let i = 0; i < 120 && !atteint; i += 1) {
      t = Math.min(0.95, t + PAS_T);
      if (reciproqueMilieux(A, B, C, t).parallele) atteint = true;
    }
    expect(atteint, `dernier t = ${arrondi(t, 3)}`).toBe(true);
  });

  it('la zone gagnante existe et reste ÉTROITE — la propriété serait creuse sinon', () => {
    const gagnants = [];
    for (let t = 0.08; t <= 0.95; t += 0.001) {
      if (reciproqueMilieux(A, B, C, t).parallele) gagnants.push(t);
    }
    expect(gagnants.length).toBeGreaterThan(0);
    const largeur = Math.max(...gagnants) - Math.min(...gagnants);
    // DÉFAUT RÉEL, ATTRAPÉ ICI. `areParallel` travaille à eps = 1e-6 : la zone
    // gagnante était réduite au seul t = 0,5 exact, donc INATTEIGNABLE au doigt
    // comme au clavier, alors que le lab affichait « 0,7° » à côté. La
    // tolérance de la manipulation est maintenant explicite (TOL_PARALLELE).
    // Assez large pour être atteignable au pas du clavier…
    expect(largeur).toBeGreaterThan(PAS_T);
    // …et assez étroite pour que « ça ne marche qu’au milieu » soit vrai.
    expect(largeur).toBeLessThan(0.12);
    expect(Math.min(...gagnants)).toBeGreaterThan(0.42);
    expect(Math.max(...gagnants)).toBeLessThan(0.58);
  });

  it('les DEUX verdicts du lab réciproque ne se contredisent JAMAIS', () => {
    // Le lab affiche « parallèles » d'un côté et « K est le milieu » de l'autre.
    // Les deux seuils sont différents (angle vs paramètre) : ils doivent malgré
    // tout basculer ensemble, sinon l'élève lit une contradiction.
    for (let t = 0.08; t <= 0.95; t += 0.001) {
      const r = reciproqueMilieux(A, B, C, t);
      expect(r.parallele === r.tEstMilieu, `t = ${arrondi(t, 3)} : ${arrondi(r.angleAvecBC, 3)}°`).toBe(true);
    }
  });

  it('le piège « 0,45, c’est presque parallèle » est CHIFFRÉ : l’angle n’est pas nul', () => {
    // Le module 4 étape 3 pose exactement ce cas. Si l'angle y était de 0,1°,
    // l'élève aurait raison de dire « c'est presque parallèle » et la leçon
    // serait injuste.
    const r = reciproqueMilieux(A, B, C, 0.45);
    expect(r.parallele).toBe(false);
    expect(r.angleAvecBC, `angle à t=0,45 : ${arrondi(r.angleAvecBC, 2)}°`).toBeGreaterThan(1);
  });
});

/* ═══ MODULE 5 — Le tri ════════════════════════════════════════════════ */
describe('Module 5 — les huit cartes du tri', () => {
  it('le module trie bien HUIT énoncés — le titre l’annonce', () => {
    expect(ENONCES_IDS.length).toBe(8);
  });

  it('le contre-exemple 5-5-8 que le module cite EST un vrai triangle isocèle', () => {
    // L'inégalité triangulaire : 5 + 5 = 10 > 8. Si elle tombait, la question
    // du module 5 étape 2 s'appuierait sur un triangle inexistant.
    expect(5 + 5).toBeGreaterThan(8);
    expect(5).toBe(5); // isocèle
    expect(5).not.toBe(8); // pas équilatéral
  });

  it('les deux propriétés ENSEIGNÉES par la leçon ont leur réciproque vraie', () => {
    expect(statut('car-cercle').reciproqueVraie).toBe(true);
    expect(statut('prop-milieux').reciproqueVraie).toBe(true);
  });

  it('…et le tri contient bien les DEUX contre-exemples qui empêchent la surgénéralisation', () => {
    expect(statut('prop-equilateral').reciproqueVraie).toBe(false);
    expect(statut('prop-somme').reciproqueVraie).toBe(false);
  });

  it('chaque carte a un statut valide et une explication à afficher', () => {
    for (const id of ENONCES_IDS) {
      const e = statut(id);
      expect(['definition', 'propriete', 'caracterisation']).toContain(e.statut);
      expect(e.pourquoi).toBeTruthy();
    }
  });
});

/* ═══ MODULE 6 — Les deux preuves ══════════════════════════════════════ */
describe('Module 6 — les preuves proposées sont réellement charpentées', () => {
  // Les rôles des étapes ATTENDUES des deux preuves, recopiés du module.
  const PREUVE_1 = [{ role: 'donnee' }, { role: 'propriete' }, { role: 'conclusion' }];
  const PREUVE_2 = [{ role: 'donnee' }, { role: 'donnee' }, { role: 'propriete' }, { role: 'conclusion' }];

  it('les deux solutions attendues passent le verdict de charpente', () => {
    expect(preuveEstCharpentee(PREUVE_1).ok).toBe(true);
    expect(preuveEstCharpentee(PREUVE_2).ok).toBe(true);
  });

  it('les deux preuves n’ont PAS la même longueur — la charpente n’est pas une recette', () => {
    expect(PREUVE_1.length).not.toBe(PREUVE_2.length);
  });

  it('sauter la propriété est refusé, et le message le NOMME', () => {
    // C'est le message que l'élève lit dans le lab quand il fait l'erreur visée.
    const v = preuveEstCharpentee([{ role: 'donnee' }, { role: 'conclusion' }]);
    expect(v.ok).toBe(false);
    expect(v.raison).toMatch(/propriété/);
  });
});
