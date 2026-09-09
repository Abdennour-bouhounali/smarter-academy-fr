import { describe, it, expect } from 'vitest';
import {
  executer, executerPasAPas, estFermee, capRetrouve, cadre, arrondi, mod360,
  premiereDifference, premiereDifferenceVariables, makeRepeat, avancer, tourner,
  estPlat, KINDS, COMPARATEURS, makeSi, condition, lit, affecter, formule,
} from '../../../../../common/turtle/trace4e';
import { positionsDesPas } from './pasSource';
import {
  PROGRAMME_DEPART, PROGRAMME_CHOIX, ENTREES_CHOIX,
  programmeGardeFou, SEUIL_GARDE_FOU, ESSAIS_GARDE_FOU,
  PROGRAMME_SPIRALE, PROGRAMME_COMPTEUR,
  PROGRAMME_A_MODIFIER, PROGRAMME_CIBLE, PROGRAMME_PENTAGONE,
  BUGS,
} from './programmes';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Chaque module AFFIRME des choses sur le comportement d'un programme :
 * « il s'écrit en 2 instructions et en exécute 8 », « la branche sinon est
 * prise pour n = 3 », « le compteur vaut 5 à la fin », « les deux programmes
 * ne se séparent qu'au pas 4 ». Ces affirmations sont du CONTENU PÉDAGOGIQUE :
 * si le comportement réel diffère, la leçon MENT à l'élève.
 *
 * Ce fichier les rejoue toutes sur le moteur, et vérifie en outre :
 *   · la SÉCURITÉ VISUELLE du labo signature — aucun état atteignable ne sort
 *     du cadre, à aucun pas de l'exécution ;
 *   · le PÉRIMÈTRE — aucun programme de la leçon n'utilise ce qui est réservé
 *     à la 3e ;
 *   · que `positionsDesPas` ne peut pas diverger du moteur.
 */

/* ═══ PÉRIMÈTRE — la frontière 4e/3e, écrite en test ═══════════════════ */
describe('périmètre de la leçon', () => {
  const TOUS = [
    PROGRAMME_DEPART, PROGRAMME_CHOIX, PROGRAMME_SPIRALE, PROGRAMME_COMPTEUR,
    PROGRAMME_A_MODIFIER, PROGRAMME_CIBLE, PROGRAMME_PENTAGONE,
    programmeGardeFou('>', SEUIL_GARDE_FOU), programmeGardeFou('>=', SEUIL_GARDE_FOU),
    ...BUGS.flatMap((b) => [b.casse, b.repare]),
  ];

  it('le moteur ne connaît PAS la boucle « tant que » (c’est la 3e)', () => {
    expect(KINDS).not.toContain('TANT_QUE');
    expect(KINDS).not.toContain('TANTQUE');
  });

  it('aucune condition composée n’est exprimable : un seul comparateur par test', () => {
    expect(Object.keys(COMPARATEURS)).toEqual(['<', '<=', '>', '>=', '=', '≠']);
    expect(Object.keys(COMPARATEURS)).not.toContain('ET');
    expect(Object.keys(COMPARATEURS)).not.toContain('OU');
  });

  it('AUCUN programme de la leçon n’imbrique de structure', () => {
    for (const p of TOUS) expect(estPlat(p)).toBe(true);
  });

  it('aucun programme n’utilise une instruction hors du jeu clos', () => {
    const kinds = new Set();
    const parcourir = (bloc) => (bloc || []).forEach((n) => {
      kinds.add(n.kind);
      parcourir(n.corps); parcourir(n.alors); parcourir(n.sinon);
    });
    TOUS.forEach(parcourir);
    for (const k of kinds) expect(KINDS).toContain(k);
  });
});

/* ═══ MODULE 1 — « écrire 2, exécuter 8 » ══════════════════════════════ */
describe('Module 1 — le programme au ralenti', () => {
  const pas = executerPasAPas(PROGRAMME_DEPART);

  it('le programme s’ÉCRIT en 2 instructions et en EXÉCUTE 8', () => {
    // C'est l'affirmation du module 1 (étape 1, et la question de l'étape 4
    // sur le même principe avec 6 tours).
    expect(PROGRAMME_DEPART[0].corps).toHaveLength(2);
    expect(pas.length - 1).toBe(8);
  });

  it('ce programme trace bien UN CARRÉ : 4 côtés égaux, fermé, cap retrouvé', () => {
    const r = executer(PROGRAMME_DEPART);
    expect(r.segments).toHaveLength(4);
    const longueurs = r.segments.map((s) => arrondi(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)));
    expect(new Set(longueurs).size).toBe(1);
    expect(longueurs[0]).toBe(60);
    expect(estFermee(r)).toBe(true);
    expect(capRetrouve(r)).toBe(true);
  });

  it('« le tracé ne s’allonge qu’un pas sur deux » — vrai, et c’est le TOURNER', () => {
    // L'affirmation de l'étape 2. Un pas sur deux porte un segment, et les
    // pas sans segment sont exactement les TOURNER.
    const avecSegment = pas.slice(1).filter((p) => p.segment);
    expect(avecSegment).toHaveLength(4);
    for (const p of pas.slice(1)) {
      expect(!!p.segment).toBe(p.kind === 'AVANCER');
    }
  });

  it('AU PAS 5, le cap vaut bien 180° — la réponse attendue de l’étape 3', () => {
    expect(mod360(pas[5].pos.cap)).toBe(180);
  });

  it('les caps que les explications « faux » citent sont ceux annoncés', () => {
    // LE STYLO TOURNE À DROITE : le cap DÉCROÎT. Un premier jet de ce module
    // annonçait 90° après un virage et 270° après trois — l'inverse. Ce test
    // l'a attrapé ; les deux `explainFor` disent maintenant la vérité.
    expect(mod360(pas[2].pos.cap)).toBe(270);   // après UN virage
    expect(mod360(pas[3].pos.cap)).toBe(270);
    expect(mod360(pas[6].pos.cap)).toBe(90);    // après TROIS virages
    expect(mod360(pas[7].pos.cap)).toBe(90);
    expect(mod360(pas[8].pos.cap)).toBe(0);     // après les quatre
  });

  it('« RÉPÉTER 6 fois [ AVANCER ; TOURNER ] compte 12 pas » — la question de l’étape 4', () => {
    const p = [makeRepeat(6, [avancer(40), tourner(60)])];
    expect(executerPasAPas(p).length - 1).toBe(12);
  });

  it('SÉCURITÉ VISUELLE : à CHAQUE pas, tout ce qui est dessiné tient dans le cadre', () => {
    // Le cadre du canevas est dérivé du résultat COMPLET : c'est ce qui
    // empêche la figure de « sauter » d'un pas à l'autre. Encore faut-il que
    // chaque état intermédiaire y tienne — position du stylo comprise.
    const r = executer(PROGRAMME_DEPART);
    const c = cadre(r);
    for (const p of executerPasAPas(PROGRAMME_DEPART)) {
      expect(p.pos.x, `pas ${p.rang}`).toBeGreaterThanOrEqual(c.minX);
      expect(p.pos.x).toBeLessThanOrEqual(c.maxX);
      expect(p.pos.y).toBeGreaterThanOrEqual(c.minY);
      expect(p.pos.y).toBeLessThanOrEqual(c.maxY);
      for (const s of p.segmentsJusquIci) {
        for (const [x, y] of [[s.x1, s.y1], [s.x2, s.y2]]) {
          expect(x).toBeGreaterThanOrEqual(c.minX);
          expect(x).toBeLessThanOrEqual(c.maxX);
          expect(y).toBeGreaterThanOrEqual(c.minY);
          expect(y).toBeLessThanOrEqual(c.maxY);
        }
      }
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre reste raisonnable pour tous les réglages du lab', () => {
    // Les bornes exposées par AlgoLab : AVANCER 10..120, TOURNER 15..180,
    // REPETER 2..12. Aucun réglage atteignable ne doit produire un cadre
    // dégénéré (une bande très étroite est illisible, cf. aspectAudit e2e).
    for (let f = 2; f <= 12; f += 1) {
      for (const d of [10, 60, 120]) {
        for (const a of [15, 90, 180]) {
          const c = cadre(executer([makeRepeat(f, [avancer(d), tourner(a)])]));
          expect(c.largeur, `f=${f} d=${d} a=${a}`).toBeGreaterThan(0);
          expect(c.hauteur).toBeGreaterThan(0);
          const ratio = Math.max(c.largeur, c.hauteur) / Math.min(c.largeur, c.hauteur);
          expect(ratio, `f=${f} d=${d} a=${a} ratio`).toBeLessThan(12);
        }
      }
    }
  });
});

/* ═══ MODULE 2 — la branche prise ══════════════════════════════════════ */
describe('Module 2 — le bloc qui choisit', () => {
  it('« la branche SINON est prise pour n = 3 » — et elle trace des côtés de 35', () => {
    const r = executer(PROGRAMME_CHOIX, { env: { n: 3 } });
    expect(new Set(r.segments.map((s) => s.branche))).toEqual(new Set(['sinon']));
    for (const s of r.segments) {
      expect(arrondi(Math.hypot(s.x2 - s.x1, s.y2 - s.y1))).toBe(35);
    }
  });

  it('« la branche ALORS est prise pour n = 7 » — et elle trace des côtés de 70', () => {
    const r = executer(PROGRAMME_CHOIX, { env: { n: 7 } });
    expect(new Set(r.segments.map((s) => s.branche))).toEqual(new Set(['alors']));
    for (const s of r.segments) {
      expect(arrondi(Math.hypot(s.x2 - s.x1, s.y2 - s.y1))).toBe(70);
    }
  });

  it('LA FORME NE CHANGE PAS : carré fermé dans les deux cas, seule la taille diffère', () => {
    // Argument explicite du module : si la forme changeait aussi, l'élève
    // pourrait attribuer la différence à autre chose qu'au choix.
    for (const n of ENTREES_CHOIX) {
      const r = executer(PROGRAMME_CHOIX, { env: { n } });
      expect(r.segments, `n = ${n}`).toHaveLength(4);
      expect(estFermee(r), `n = ${n}`).toBe(true);
    }
    const petit = executer(PROGRAMME_CHOIX, { env: { n: 3 } }).longueur;
    const grand = executer(PROGRAMME_CHOIX, { env: { n: 7 } }).longueur;
    expect(grand).toBeGreaterThan(petit);
  });

  it('« 8 pas » — une seule branche est exécutée à chaque tour', () => {
    // La réponse attendue de l'étape 2. 4 tours × (1 AVANCER + 1 TOURNER).
    for (const n of ENTREES_CHOIX) {
      expect(executerPasAPas(PROGRAMME_CHOIX, { env: { n } }).length - 1, `n = ${n}`).toBe(8);
    }
  });

  it('« pour n = 4, c’est SINON » — la question de prévision de l’étape 3', () => {
    const r = executer(PROGRAMME_CHOIX, { env: { n: 4 } });
    expect(r.segments[0].branche).toBe('sinon');
    expect(arrondi(Math.hypot(r.segments[0].x2 - r.segments[0].x1, r.segments[0].y2 - r.segments[0].y1))).toBe(35);
  });
});

/* ═══ MODULE 3 — la borne ══════════════════════════════════════════════ */
describe('Module 3 — écrire la condition', () => {
  const coteAvec = (op, valeur) => {
    const r = executer(programmeGardeFou(op, SEUIL_GARDE_FOU), { env: { valeur } });
    const s = r.segments[0];
    return arrondi(Math.hypot(s.x2 - s.x1, s.y2 - s.y1));
  };

  it('« 49 et 51 ne séparent pas > et ⩾ » — l’affirmation de l’étape 1', () => {
    expect(coteAvec('>', 49)).toBe(coteAvec('>=', 49));
    expect(coteAvec('>', 51)).toBe(coteAvec('>=', 51));
  });

  it('« SEULE la valeur 50 les sépare » — la réponse de l’étape 2', () => {
    expect(coteAvec('>', 50)).not.toBe(coteAvec('>=', 50));
    expect(coteAvec('>', 50)).toBe(30);   // petit carré : le test est faux
    expect(coteAvec('>=', 50)).toBe(80);  // grand carré : le test est vrai
  });

  it('« ⩾ 50 est le bon test pour “à partir de 50” » — la réponse de l’étape 3', () => {
    for (const v of [50, 51, 200]) expect(coteAvec('>=', v), `valeur = ${v}`).toBe(80);
    for (const v of [49, 0]) expect(coteAvec('>=', v), `valeur = ${v}`).toBe(30);
  });

  it('les trois valeurs d’essai encadrent bien le seuil', () => {
    expect(ESSAIS_GARDE_FOU).toEqual([SEUIL_GARDE_FOU - 1, SEUIL_GARDE_FOU, SEUIL_GARDE_FOU + 1]);
  });

  it('la figure est un carré fermé pour TOUS les comparateurs proposés et toutes les valeurs', () => {
    // Sécurité visuelle : aucun réglage atteignable ne casse la figure.
    for (const op of ['>', '>=', '=', '≠']) {
      for (const v of ESSAIS_GARDE_FOU) {
        const r = executer(programmeGardeFou(op, SEUIL_GARDE_FOU), { env: { valeur: v } });
        expect(r.segments, `${op} / ${v}`).toHaveLength(4);
        expect(estFermee(r), `${op} / ${v}`).toBe(true);
      }
    }
  });
});

/* ═══ MODULE 4 — la variable qui évolue ════════════════════════════════ */
describe('Module 4 — le compteur qui grandit', () => {
  it('« un seul AVANCER écrit, six longueurs différentes » — la spirale', () => {
    const r = executer(PROGRAMME_SPIRALE);
    const avancers = PROGRAMME_SPIRALE[1].corps.filter((n) => n.kind === 'AVANCER');
    expect(avancers).toHaveLength(1);
    const longueurs = r.segments.map((s) => arrondi(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)));
    expect(longueurs).toHaveLength(6);
    expect(new Set(longueurs).size).toBe(6);
  });

  it('« i vaut 20, 40, 60, 80, 100, 120 » — la suite annoncée par la carte', () => {
    const pas = executerPasAPas(PROGRAMME_SPIRALE);
    // Les valeurs de i au moment de chaque AVANCER : c'est ce que l'élève lit.
    const lues = pas.filter((p) => p.kind === 'AVANCER').map((p) => p.env.i);
    expect(lues).toEqual([20, 40, 60, 80, 100, 120]);
  });

  it('LES LONGUEURS TRACÉES SONT EXACTEMENT LES VALEURS DE i', () => {
    // Sans cela, la pastille « i = … » mentirait sur ce que le trait mesure.
    const r = executer(PROGRAMME_SPIRALE);
    const pas = executerPasAPas(PROGRAMME_SPIRALE);
    const lues = pas.filter((p) => p.kind === 'AVANCER').map((p) => p.env.i);
    const tracees = r.segments.map((s) => arrondi(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)));
    expect(tracees).toEqual(lues);
  });

  it('« le compteur vaut 5 à la fin » — la réponse numérique de l’étape 3', () => {
    const r = executer(PROGRAMME_COMPTEUR);
    expect(r.env.i).toBe(5);
  });

  it('… et 5 est bien le NOMBRE DE CÔTÉS tracés, comme l’explication l’affirme', () => {
    const r = executer(PROGRAMME_COMPTEUR);
    expect(r.segments).toHaveLength(r.env.i);
    expect(estFermee(r)).toBe(true);
  });

  it('les valeurs citées par explainFor (0, 1, 6) ne sont PAS la bonne réponse', () => {
    const i = executer(PROGRAMME_COMPTEUR).env.i;
    for (const faux of [0, 1, 6]) expect(i).not.toBe(faux);
  });

  it('SÉCURITÉ VISUELLE : la spirale tient dans son cadre à chaque pas', () => {
    const c = cadre(executer(PROGRAMME_SPIRALE));
    for (const p of executerPasAPas(PROGRAMME_SPIRALE)) {
      expect(p.pos.x, `pas ${p.rang}`).toBeGreaterThanOrEqual(c.minX);
      expect(p.pos.x).toBeLessThanOrEqual(c.maxX);
      expect(p.pos.y).toBeGreaterThanOrEqual(c.minY);
      expect(p.pos.y).toBeLessThanOrEqual(c.maxY);
    }
  });
});

/* ═══ MODULE 5 — modifier ══════════════════════════════════════════════ */
describe('Module 5 — changer le résultat', () => {
  it('« le programme livré NE SE REFERME PAS » — 5 × 60 = 300°', () => {
    const r = executer(PROGRAMME_A_MODIFIER);
    expect(estFermee(r)).toBe(false);
    expect(r.rotationTotale).toBe(300);
  });

  it('« passer à 6 tours donne l’hexagone fermé » — la cible du module', () => {
    const r = executer(PROGRAMME_CIBLE);
    expect(r.segments).toHaveLength(6);
    expect(estFermee(r)).toBe(true);
    expect(r.rotationTotale).toBe(360);
  });

  it('UNE SEULE valeur sépare le programme livré de la cible', () => {
    // L'affirmation de l'étape 1 : « une seule valeur a changé ».
    expect(PROGRAMME_A_MODIFIER[0].corps).toEqual(PROGRAMME_CIBLE[0].corps);
    expect(PROGRAMME_A_MODIFIER[0].fois).toBe(5);
    expect(PROGRAMME_CIBLE[0].fois).toBe(6);
  });

  it('LE PIÈGE EST RÉEL : 5 tours à 72° se referme AUSSI, mais en pentagone', () => {
    const r = executer(PROGRAMME_PENTAGONE);
    expect(estFermee(r)).toBe(true);        // ça se referme…
    expect(r.rotationTotale).toBe(360);
    expect(r.segments).toHaveLength(5);     // … mais ce n'est pas l'hexagone
  });

  it('« un carré doublé se fait en changeant le AVANCER » — la question de l’étape 3', () => {
    const petit = executer([makeRepeat(4, [avancer(40), tourner(90)])]);
    const grand = executer([makeRepeat(4, [avancer(80), tourner(90)])]);
    expect(grand.longueur).toBe(petit.longueur * 2);
    expect(grand.segments).toHaveLength(petit.segments.length);
    // Les distracteurs sont bien FAUX : 8 tours ou 45° ne donnent pas un carré.
    expect(executer([makeRepeat(8, [avancer(40), tourner(90)])]).segments).toHaveLength(8);
    expect(estFermee(executer([makeRepeat(4, [avancer(40), tourner(45)])]))).toBe(false);
  });
});

/* ═══ MODULE 6 — le point de divergence, CALCULÉ ═══════════════════════ */
describe('Module 6 — le labo de réparation', () => {
  /** Le diagnostic tel que le module le calcule — même code, même source. */
  const diag = (bug) => {
    const casse = executer(bug.casse);
    const repare = executer(bug.repare);
    const ecartTrace = premiereDifference(repare, casse);
    const ecartVars = premiereDifferenceVariables(repare, casse);
    const candidats = [ecartTrace, ecartVars].filter((i) => i >= 0);
    return { casse, repare, ecartTrace, ecartVars, premier: candidats.length ? Math.min(...candidats) : -1 };
  };

  it('les trois pannes sont RÉELLES : chaque programme cassé diverge de sa réparation', () => {
    for (const bug of BUGS) {
      const d = diag(bug);
      expect(d.premier, `bug « ${bug.id} » ne diverge jamais`).toBeGreaterThanOrEqual(0);
    }
  });

  it('la RÉPARATION est réelle : le programme réparé ne diverge plus de lui-même', () => {
    for (const bug of BUGS) {
      const r = executer(bug.repare);
      expect(premiereDifference(r, r), bug.id).toBe(-1);
      expect(premiereDifferenceVariables(r, r), bug.id).toBe(-1);
    }
  });

  it('BUG « angle » : divergence au PAS 2 (le premier virage), figure non fermée', () => {
    // CONVENTION D'INDEX, vérifiée ici une fois pour toutes :
    // `premiereDifference` indexe `etapes`, et `etapes[i]` est le pas i + 1 de
    // `executerPasAPas` (dont l'index 0 est l'état de DÉPART). Le module
    // affiche donc `ecart + 1`, et c'est juste.
    const d = diag(BUGS.find((b) => b.id === 'angle'));
    expect(d.ecartTrace).toBe(1);
    expect(d.ecartTrace + 1).toBe(2);       // le pas affiché : le TOURNER fautif
    // Et c'est bien le premier virage, pas le premier trait : le segment 1 est
    // identique dans les deux programmes.
    const bug = BUGS.find((b) => b.id === 'angle');
    expect(executerPasAPas(bug.repare)[1].pos).toEqual(executerPasAPas(bug.casse)[1].pos);
    expect(estFermee(d.repare)).toBe(true);
    expect(estFermee(d.casse)).toBe(false);
    expect(d.repare.rotationTotale).toBe(360);
    expect(d.casse.rotationTotale).toBe(300);
  });

  it('BUG « seuil » : LE PREMIER TOUR EST IDENTIQUE — la divergence est au pas 4', () => {
    // C'est l'affirmation centrale de l'étape 2 : « regarder le début ne
    // suffit pas ». Si ce test tombe, la phrase du module devient fausse.
    const bug = BUGS.find((b) => b.id === 'seuil');
    const d = diag(bug);
    expect(d.ecartTrace).toBe(4);
    // Le module affiche `ecartTrace + 1` : le pas 5.
    expect(d.ecartTrace + 1).toBe(5);
    // Et il faut vraiment que le premier tour soit identique des deux côtés :
    // le corps de boucle compte 3 instructions, donc les pas 1 à 3 sont le
    // premier tour, et le pas 4 en est le début du second.
    const pasBon = executerPasAPas(bug.repare);
    const pasCasse = executerPasAPas(bug.casse);
    for (let i = 1; i <= 4; i += 1) {
      expect(pasBon[i].pos, `pas ${i}`).toEqual(pasCasse[i].pos);
    }
    expect(pasBon[5].pos).not.toEqual(pasCasse[5].pos);
  });

  it('BUG « seuil » : les branches prises diffèrent bien à partir du 2e tour', () => {
    const bug = BUGS.find((b) => b.id === 'seuil');
    const bon = executer(bug.repare).segments.map((s) => s.branche);
    const casse = executer(bug.casse).segments.map((s) => s.branche);
    expect(bon).toEqual(['sinon', 'sinon', 'alors', 'alors']);
    expect(casse).toEqual(['sinon', 'alors', 'alors', 'alors']);
  });

  it('BUG « compteur » : LA VARIABLE DIVERGE AVANT LE TRACÉ — le cœur du module', () => {
    // L'étape 3 affirme : « les valeurs de i diffèrent dès le pas N, alors que
    // les deux tracés sont encore identiques ». Ce test est la preuve que la
    // phrase est vraie, et que le point annoncé est bien celui calculé.
    const d = diag(BUGS.find((b) => b.id === 'compteur'));
    expect(d.ecartVars).toBeGreaterThanOrEqual(0);
    expect(d.ecartTrace).toBeGreaterThan(d.ecartVars);
    expect(d.ecartVars).toBe(3);   // le module affiche le pas 4
    expect(d.ecartTrace).toBe(4);  // le module affiche le pas 5
    // Et la preuve directe : au pas où les variables diffèrent, les DEUX
    // tracés sont encore rigoureusement identiques.
    const bug = BUGS.find((b) => b.id === 'compteur');
    const pasBon = executerPasAPas(bug.repare);
    const pasCasse = executerPasAPas(bug.casse);
    expect(pasBon[d.ecartVars + 1].env.i).not.toBe(pasCasse[d.ecartVars + 1].env.i);
    expect(pasBon[d.ecartVars + 1].pos).toEqual(pasCasse[d.ecartVars + 1].pos);
  });

  it('BUG « compteur » : le programme réparé fait bien une SPIRALE, le cassé non', () => {
    const bug = BUGS.find((b) => b.id === 'compteur');
    const long = (r) => r.segments.map((s) => arrondi(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)));
    expect(new Set(long(executer(bug.repare))).size).toBe(5);  // toutes différentes
    expect(new Set(long(executer(bug.casse))).size).toBe(1);   // toutes égales
  });

  it('le pas ANNONCÉ par le module est exactement celui que le moteur calcule', () => {
    // La garde générale : aucune valeur du module n'est écrite en dur.
    for (const bug of BUGS) {
      const d = diag(bug);
      const attenduNature = d.ecartVars >= 0 && (d.ecartTrace < 0 || d.ecartVars < d.ecartTrace)
        ? 'variable' : 'trace';
      expect(attenduNature, `bug « ${bug.id} » : nature déclarée`).toBe(bug.nature);
    }
  });

  it('SÉCURITÉ VISUELLE : le cadre COMMUN contient les deux tracés de chaque panne', () => {
    // Le module dessine les deux figures dans un cadre imposé unique — sinon
    // deux tracés de tailles différentes paraîtraient superposables.
    for (const bug of BUGS) {
      const a = cadre(executer(bug.casse));
      const b = cadre(executer(bug.repare));
      const commun = {
        minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX),
        minY: Math.min(a.minY, b.minY), maxY: Math.max(a.maxY, b.maxY),
      };
      for (const prog of [bug.casse, bug.repare]) {
        for (const p of executerPasAPas(prog)) {
          expect(p.pos.x, `${bug.id} pas ${p.rang}`).toBeGreaterThanOrEqual(commun.minX);
          expect(p.pos.x).toBeLessThanOrEqual(commun.maxX);
          expect(p.pos.y).toBeGreaterThanOrEqual(commun.minY);
          expect(p.pos.y).toBeLessThanOrEqual(commun.maxY);
        }
      }
    }
  });
});

/* ═══ MODULE 7 — les nombres du test final ═════════════════════════════ */
describe('Module 7 — les épreuves disent vrai', () => {
  it('e2 : 3 tours × (2 instructions de branche + 1 TOURNER) = 9 pas', () => {
    // On reconstruit la situation de l'épreuve pour vérifier le nombre annoncé.
    const p = [
      makeRepeat(3, [
        makeSi(condition(lit('x'), '>', 0), [avancer(30), tourner(10)], [avancer(50), tourner(20)]),
        tourner(90),
      ]),
    ];
    expect(executerPasAPas(p, { env: { x: 1 } }).length - 1).toBe(9);
    expect(executerPasAPas(p, { env: { x: -1 } }).length - 1).toBe(9);
  });

  it('e8 : c part de 3 et gagne 2 quatre fois → 11', () => {
    const p = [affecter('c', 3), makeRepeat(4, [avancer(30), affecter('c', formule('c', { plus: 2 }))])];
    expect(executer(p).env.c).toBe(11);
  });

  it('e9 : l’octogone se referme, et seul « 4 tours ET 90° » donne un carré', () => {
    const oct = executer([makeRepeat(8, [avancer(50), tourner(45)])]);
    expect(oct.segments).toHaveLength(8);
    expect(estFermee(oct)).toBe(true);

    const carre = executer([makeRepeat(4, [avancer(50), tourner(90)])]);
    expect(carre.segments).toHaveLength(4);
    expect(estFermee(carre)).toBe(true);

    // Les distracteurs sont bien faux, chacun pour sa raison annoncée.
    const quatreQuaranteCinq = executer([makeRepeat(4, [avancer(50), tourner(45)])]);
    expect(estFermee(quatreQuaranteCinq)).toBe(false);   // figure ouverte
    expect(quatreQuaranteCinq.rotationTotale).toBe(180);

    const huitQuatreVingtDix = executer([makeRepeat(8, [avancer(50), tourner(90)])]);
    expect(huitQuatreVingtDix.rotationTotale).toBe(720);  // le carré parcouru deux fois
    expect(huitQuatreVingtDix.segments).toHaveLength(8);
  });
});

/* ═══ LE RÉSOLVEUR DE POSITION — il ne peut pas mentir ═════════════════ */
describe('positionsDesPas — aligné sur le moteur, par construction', () => {
  const TOUS = [
    { p: PROGRAMME_DEPART, env: {} },
    { p: PROGRAMME_CHOIX, env: { n: 3 } },
    { p: PROGRAMME_CHOIX, env: { n: 7 } },
    { p: PROGRAMME_SPIRALE, env: {} },
    { p: PROGRAMME_COMPTEUR, env: {} },
    { p: programmeGardeFou('>=', 50), env: { valeur: 50 } },
    ...BUGS.flatMap((b) => [{ p: b.casse, env: {} }, { p: b.repare, env: {} }]),
  ];

  it('le rang 0 n’a jamais de position d’écriture (c’est l’état de départ)', () => {
    for (const { p, env } of TOUS) {
      expect(positionsDesPas(p, executerPasAPas(p, { env }))[0]).toBeNull();
    }
  });

  it('une position est produite pour CHAQUE pas exécuté', () => {
    for (const { p, env } of TOUS) {
      const pas = executerPasAPas(p, { env });
      const pos = positionsDesPas(p, pas);
      expect(pos).toHaveLength(pas.length);
      for (let i = 1; i < pas.length; i += 1) {
        expect(pos[i], `pas ${i} de ${JSON.stringify(env)}`).not.toBeNull();
      }
    }
  });

  it('la position DÉSIGNE la bonne instruction : même kind que le pas du moteur', () => {
    // C'est la garantie qui rend le surlignage honnête. Si la résolution
    // divergeait du moteur, le lab allumerait une instruction et en exécuterait
    // une autre.
    for (const { p, env } of TOUS) {
      const pas = executerPasAPas(p, { env });
      const pos = positionsDesPas(p, pas);
      for (let i = 1; i < pas.length; i += 1) {
        const q = pos[i];
        const noeud = p[q.srcIndex];
        let cible;
        if (q.branche != null) {
          const si = q.corpsIndex == null ? noeud : noeud.corps[q.corpsIndex];
          cible = (q.branche === 'alors' ? si.alors : si.sinon)[q.brancheIndex];
        } else if (q.corpsIndex != null) {
          cible = noeud.corps[q.corpsIndex];
        } else {
          cible = noeud;
        }
        expect(cible, `pas ${i}`).toBeDefined();
        expect(cible.kind, `pas ${i} (${JSON.stringify(env)})`).toBe(pas[i].kind);
      }
    }
  });

  it('la branche résolue est CELLE DU MOTEUR, jamais réévaluée', () => {
    for (const { p, env } of TOUS) {
      const pas = executerPasAPas(p, { env });
      const pos = positionsDesPas(p, pas);
      for (let i = 1; i < pas.length; i += 1) {
        expect(pos[i].branche, `pas ${i}`).toBe(pas[i].branche);
      }
    }
  });
});
