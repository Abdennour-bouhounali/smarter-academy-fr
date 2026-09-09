import { describe, it, expect } from 'vitest';
import {
  KINDS, COMPARATEURS, mod360, arrondi,
  avancer, tourner, lever, baisser, makeRepeat, makeSi, affecter, estPlat,
  lit, formule, evalValeur, ecrireValeur,
  condition, evalTest, ecrireTest,
  derouler, tailleEcrite, tailleExecutee,
  executer, executerPasAPas,
  estFermee, capRetrouve, cadre, toSvg,
  angleExterieur, polygone, nomPolygone,
  ecrireInstruction, ecrireProgramme,
  premiereDifference, premiereDifferenceVariables,
} from './trace4e';

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE
   Ces tests échouent si quelqu'un ajoute au moteur ce que la 4e n'enseigne
   pas. Ils sont la frontière 4e/3e, pas un commentaire.
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e — ce que le moteur ne SAIT PAS faire', () => {
  it('ne connaît AUCUNE boucle conditionnelle (TANT QUE est de 3e)', () => {
    expect(KINDS).not.toContain('TANTQUE');
    expect(KINDS).not.toContain('TANT_QUE');
    expect(KINDS.some((k) => /TANT/i.test(k))).toBe(false);
  });

  it('ne connaît AUCUNE condition composée (ET / OU sont de 3e)', () => {
    const ops = Object.keys(COMPARATEURS);
    expect(ops).not.toContain('ET');
    expect(ops).not.toContain('OU');
    expect(ops.every((op) => op.length <= 2)).toBe(true);
  });

  it('connaît en revanche le SI et l’AFFECTATION — les deux nouveautés de 4e', () => {
    expect(KINDS).toContain('SI');
    expect(KINDS).toContain('AFFECTER');
  });

  it('refuse d’imbriquer une boucle dans une boucle', () => {
    const interne = makeRepeat(2, [avancer(10)]);
    const externe = makeRepeat(3, [avancer(10), interne]);
    expect(externe.corps.some((b) => b.kind === 'REPETER')).toBe(false);
    expect(estPlat([externe])).toBe(true);
  });

  it('refuse d’imbriquer un SI dans un SI', () => {
    const interne = makeSi(condition(lit('n'), '>', 1), [avancer(5)]);
    const externe = makeSi(condition(lit('n'), '>', 0), [avancer(10), interne], [interne]);
    expect(externe.alors.some((b) => b.kind === 'SI')).toBe(false);
    expect(externe.sinon.some((b) => b.kind === 'SI')).toBe(false);
  });

  it('accepte un SI DANS une boucle — c’est la boucle « qui choisit » de 4e', () => {
    const boucle = makeRepeat(4, [makeSi(condition(lit('i'), '>', 1), [avancer(10)], [avancer(30)])]);
    expect(boucle.corps[0].kind).toBe('SI');
    expect(estPlat([boucle])).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA CONDITION
   ══════════════════════════════════════════════════════════════════════ */
describe('evalTest — une condition compare deux valeurs, et une seule fois', () => {
  it('compare un nombre à une variable, dans les deux sens', () => {
    expect(evalTest(condition(lit('cote'), '>', 50), { cote: 80 })).toBe(true);
    expect(evalTest(condition(50, '>', lit('cote')), { cote: 80 })).toBe(false);
  });

  it('gère les six comparateurs, bornes comprises', () => {
    const env = { n: 5 };
    expect(evalTest(condition(lit('n'), '<', 5), env)).toBe(false);
    expect(evalTest(condition(lit('n'), '<=', 5), env)).toBe(true);
    expect(evalTest(condition(lit('n'), '>', 5), env)).toBe(false);
    expect(evalTest(condition(lit('n'), '>=', 5), env)).toBe(true);
    expect(evalTest(condition(lit('n'), '=', 5), env)).toBe(true);
    expect(evalTest(condition(lit('n'), '≠', 5), env)).toBe(false);
  });

  it('compare deux variables entre elles', () => {
    expect(evalTest(condition(lit('a'), '>', lit('b')), { a: 7, b: 3 })).toBe(true);
  });

  it('compare une FORMULE, comme une valeur d’instruction', () => {
    // cote × 2 = 60 > 50
    expect(evalTest(condition(formule('cote', { fois: 2 }), '>', 50), { cote: 30 })).toBe(true);
  });

  it('une variable absente vaut 0 : la condition reste décidable', () => {
    expect(evalTest(condition(lit('inconnue'), '=', 0), {})).toBe(true);
  });

  it('un opérateur inconnu vaut FAUX, il ne lève pas', () => {
    expect(evalTest({ gauche: 1, op: '≈', droite: 1 }, {})).toBe(false);
    expect(evalTest(null, {})).toBe(false);
  });

  it('compare les valeurs ARRONDIES : 0,1 + 0,2 ne trahit pas l’élève', () => {
    // 0,1 × 3 = 0,30000000000000004 en flottant ; l'élève, lui, écrit 0,3.
    expect(evalTest(condition(formule('u', { fois: 3 }), '=', 0.3), { u: 0.1 })).toBe(true);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE DÉROULEMENT AVEC BRANCHES ET VARIABLES
   ══════════════════════════════════════════════════════════════════════ */
describe('derouler — un SI ne déroule QU’UNE branche', () => {
  const prog = [makeSi(condition(lit('cote'), '>', 50), [avancer(100)], [avancer(10), tourner(90)])];

  it('prend « alors » quand la condition est vraie, et rien de « sinon »', () => {
    const pas = derouler(prog, { cote: 80 });
    expect(pas).toHaveLength(1);
    expect(pas[0].kind).toBe('AVANCER');
    expect(pas[0].valeur).toBe(100);
    expect(pas[0].branche).toBe('alors');
  });

  it('prend « sinon » quand elle est fausse, et rien de « alors »', () => {
    const pas = derouler(prog, { cote: 20 });
    expect(pas.map((p) => p.kind)).toEqual(['AVANCER', 'TOURNER']);
    expect(pas[0].valeur).toBe(10);
    expect(pas.every((p) => p.branche === 'sinon')).toBe(true);
  });

  it('un SI sans SINON ne déroule rien quand la condition est fausse', () => {
    const sansSinon = [makeSi(condition(lit('n'), '>', 10), [avancer(50)])];
    expect(derouler(sansSinon, { n: 1 })).toHaveLength(0);
    expect(derouler(sansSinon, { n: 99 })).toHaveLength(1);
  });

  it('« écrit » et « exécuté » ne sont pas le même nombre — c’est tout le sujet', () => {
    expect(tailleEcrite(prog)).toBe(1);
    expect(tailleExecutee(prog, { cote: 20 })).toBe(2);
  });
});

describe('derouler — une variable qui ÉVOLUE change ce que fait la suite', () => {
  it('l’affectation est visible par les instructions suivantes', () => {
    const prog = [affecter('c', 20), avancer(lit('c')), affecter('c', formule('c', { plus: 30 })), avancer(lit('c'))];
    const res = executer(prog);
    expect(res.segments.map((s) => Math.round(s.x2 - s.x1))).toEqual([20, 50]);
    expect(res.env.c).toBe(50);
  });

  it('DANS une boucle, le compteur grandit à chaque tour (la spirale)', () => {
    const prog = [
      affecter('c', 10),
      makeRepeat(4, [avancer(lit('c')), tourner(90), affecter('c', formule('c', { plus: 10 }))]),
    ];
    const res = executer(prog);
    const longueurs = res.segments.map((s) => Math.round(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)));
    expect(longueurs).toEqual([10, 20, 30, 40]);
    expect(res.env.c).toBe(50);
  });

  it('LA MÊME instruction, rencontrée deux fois, peut ne pas faire la même chose', () => {
    // Le SI est dans la boucle : au 1er tour c vaut 10 (sinon), au 3e il vaut 30 (alors).
    const prog = [
      affecter('c', 10),
      makeRepeat(3, [
        makeSi(condition(lit('c'), '>', 20), [avancer(100)], [avancer(5)]),
        affecter('c', formule('c', { plus: 10 })),
      ]),
    ];
    const branches = derouler(prog).filter((p) => p.kind === 'AVANCER').map((p) => p.branche);
    expect(branches).toEqual(['sinon', 'sinon', 'alors']);
  });

  it('la boucle lit son nombre de tours DANS l’environnement', () => {
    const prog = [makeRepeat(lit('n'), [avancer(10)])];
    expect(derouler(prog, { n: 3 })).toHaveLength(3);
    expect(derouler(prog, { n: 0 })).toHaveLength(0);
    // Une variable absente vaut 0 : zéro tour, pas une boucle infinie.
    expect(derouler(prog, {})).toHaveLength(0);
  });

  it('un nombre de tours négatif ou décimal ne casse rien', () => {
    expect(derouler([makeRepeat(-5, [avancer(10)])])).toHaveLength(0);
    expect(derouler([makeRepeat(3.7, [avancer(10)])])).toHaveLength(3);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   L'INVARIANT HÉRITÉ DE LA 5e : la boucle ne change pas le dessin
   ══════════════════════════════════════════════════════════════════════ */
describe('La boucle ne change pas le dessin, elle change ce qu’on écrit', () => {
  it('RÉPÉTER 4 [AVANCER ; TOURNER] et huit instructions donnent le MÊME tracé', () => {
    const boucle = [makeRepeat(4, [avancer(60), tourner(90)])];
    const aPlat = [
      avancer(60), tourner(90), avancer(60), tourner(90),
      avancer(60), tourner(90), avancer(60), tourner(90),
    ];
    const a = executer(boucle);
    const b = executer(aPlat);
    // On compare LE DESSIN, pas la provenance : `srcIndex` et `tour` disent
    // de quelle carte vient chaque segment, et diffèrent forcément entre une
    // boucle (une carte, quatre tours) et huit instructions écrites.
    const trace = (r) => r.segments.map(({ x1, y1, x2, y2 }) => ({ x1, y1, x2, y2 }));
    expect(trace(a)).toEqual(trace(b));
    expect(premiereDifference(a, b)).toBe(-1);
    expect(a.final).toEqual(b.final);
    expect(a.longueur).toBe(b.longueur);
    expect(tailleEcrite(boucle)).toBe(1);
    expect(tailleEcrite(aPlat)).toBe(8);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE POLYGONE — acquis de 5e, qui doit rester vrai ici
   ══════════════════════════════════════════════════════════════════════ */
describe('Le polygone régulier se referme pour tout n', () => {
  it('360 ÷ n ferme la figure et retrouve le cap, de 3 à 12 côtés', () => {
    for (let n = 3; n <= 12; n += 1) {
      const res = executer(polygone(n, 60));
      expect(estFermee(res), `polygone à ${n} côtés fermé`).toBe(true);
      expect(capRetrouve(res), `polygone à ${n} côtés : cap retrouvé`).toBe(true);
      expect(res.segments).toHaveLength(n);
    }
  });

  it('l’heptagone ne trahit pas l’élève : 359,999…° vaut un tour complet', () => {
    const res = executer(polygone(7, 60));
    expect(capRetrouve(res)).toBe(true);
    expect(res.rotationTotale).toBe(360);
  });

  it('un angle FAUX laisse la figure ouverte — c’est ce qui se voit', () => {
    const res = executer([makeRepeat(3, [avancer(60), tourner(60)])]); // 60° au lieu de 120°
    expect(estFermee(res)).toBe(false);
  });

  it('angleExterieur est un quotient, pas une table', () => {
    expect(angleExterieur(4)).toBe(90);
    expect(angleExterieur(5)).toBe(72);
    expect(nomPolygone(4)).toBe('carré');
    expect(nomPolygone(13)).toBe('polygone régulier à 13 côtés');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   L'EXÉCUTION PAS À PAS — ce qui rend la variable OBSERVABLE
   ══════════════════════════════════════════════════════════════════════ */
describe('executerPasAPas — chaque état est inspectable', () => {
  const prog = [affecter('c', 10), avancer(lit('c')), tourner(90), affecter('c', formule('c', { plus: 5 })), avancer(lit('c'))];

  it('commence par l’ÉTAT DE DÉPART, avant toute instruction', () => {
    const pas = executerPasAPas(prog, { env: { c: 0 } });
    expect(pas[0].rang).toBe(0);
    expect(pas[0].kind).toBeNull();
    expect(pas[0].pos).toEqual({ x: 0, y: 0, cap: 0 });
    expect(pas[0].segmentsJusquIci).toHaveLength(0);
  });

  it('donne un état par instruction exécutée, plus le départ', () => {
    const pas = executerPasAPas(prog);
    expect(pas).toHaveLength(tailleExecutee(prog) + 1);
  });

  it('montre la variable APRÈS l’instruction qui la change', () => {
    const pas = executerPasAPas(prog);
    const apresPremiereAffectation = pas.find((p) => p.kind === 'AFFECTER');
    expect(apresPremiereAffectation.env.c).toBe(10);
    expect(pas[pas.length - 1].env.c).toBe(15);
  });

  it('les segments s’accumulent : on ne voit jamais la figure déjà finie', () => {
    const pas = executerPasAPas(prog);
    const compte = pas.map((p) => p.segmentsJusquIci.length);
    // croissant, jamais décroissant, et le dernier a tout
    expect(compte).toEqual([...compte].sort((a, b) => a - b));
    expect(compte[compte.length - 1]).toBe(executer(prog).segments.length);
  });

  it('dit quelle branche du SI a été prise, pour la surligner', () => {
    const p = [makeSi(condition(lit('n'), '>', 5), [avancer(10)], [tourner(45)])];
    expect(executerPasAPas(p, { env: { n: 9 } })[1].branche).toBe('alors');
    expect(executerPasAPas(p, { env: { n: 1 } })[1].branche).toBe('sinon');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE DÉBOGAGE
   ══════════════════════════════════════════════════════════════════════ */
describe('premiereDifference — l’erreur se repère, elle n’est pas coloriée d’avance', () => {
  it('vaut -1 quand deux programmes tracent la même chose', () => {
    expect(premiereDifference(executer(polygone(4, 60)), executer(polygone(4, 60)))).toBe(-1);
  });

  it('désigne le pas exact où le tracé quitte le bon chemin', () => {
    const bon = [avancer(60), tourner(90), avancer(60)];
    const casse = [avancer(60), tourner(60), avancer(60)];
    expect(premiereDifference(executer(bon), executer(casse))).toBe(1);
  });

  it('repère une divergence de VARIABLE avant même que le dessin ne bouge', () => {
    // Même tracé (avancer 20 deux fois), mais l'un incrémente son compteur.
    const bon = [affecter('c', 20), avancer(20), affecter('c', formule('c', { plus: 1 })), avancer(20)];
    const casse = [affecter('c', 20), avancer(20), affecter('c', formule('c')), avancer(20)];
    expect(premiereDifference(executer(bon), executer(casse))).toBe(-1);
    expect(premiereDifferenceVariables(executer(bon), executer(casse))).toBe(2);
  });

  it('un programme plus court diverge au premier pas manquant', () => {
    const court = [avancer(60)];
    const long = [avancer(60), avancer(60)];
    expect(premiereDifference(executer(court), executer(long))).toBe(1);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LE STYLO, LE CADRE, L'ÉCRITURE
   ══════════════════════════════════════════════════════════════════════ */
describe('Le stylo levé ne laisse pas de trace, mais le déplacement a lieu', () => {
  it('aucun segment pendant que le stylo est levé, la position bouge quand même', () => {
    const res = executer([lever(), avancer(50), baisser(), avancer(50)]);
    expect(res.segments).toHaveLength(1);
    expect(res.final.x).toBe(100);
    expect(res.longueur).toBe(50);
  });
});

describe('cadre et toSvg', () => {
  it('un programme vide a un cadre valide (sinon le SVG naît sans dimensions)', () => {
    const c = cadre(executer([]));
    expect(c.largeur).toBeGreaterThan(0);
    expect(c.hauteur).toBeGreaterThan(0);
  });

  it('toSvg est la SEULE inversion verticale : y monte pour l’élève, descend en SVG', () => {
    const res = executer([tourner(-90), avancer(50)]); // vers le haut
    const c = cadre(res, 0);
    const bas = toSvg(c, res.depart.x, res.depart.y);
    const haut = toSvg(c, res.final.x, res.final.y);
    expect(res.final.y).toBeGreaterThan(res.depart.y);
    expect(haut.y).toBeLessThan(bas.y);
  });
});

describe('L’écriture d’un programme — ce que l’élève lit', () => {
  it('écrit un SI avec ses deux branches', () => {
    const s = ecrireInstruction(makeSi(condition(lit('cote'), '>', 50), [avancer(100)], [avancer(10)]));
    expect(s).toBe('SI cote > 50 ALORS [ AVANCER de 100 ] SINON [ AVANCER de 10 ]');
  });

  it('n’écrit pas de SINON quand il n’y en a pas', () => {
    expect(ecrireInstruction(makeSi(condition(lit('n'), '=', 3), [avancer(10)]))).toBe(
      'SI n = 3 ALORS [ AVANCER de 10 ]'
    );
  });

  it('écrit une affectation et une formule', () => {
    expect(ecrireInstruction(affecter('c', formule('c', { plus: 10 })))).toBe('METTRE c + 10 DANS c');
    expect(ecrireValeur(formule('cote', { fois: 2, plus: -5 }))).toBe('cote × 2 − 5');
    expect(ecrireTest(condition(lit('c'), '>=', 20))).toBe('c ⩾ 20');
  });

  it('un programme vide se dit, il ne s’affiche pas vide', () => {
    expect(ecrireProgramme([])).toBe('programme vide');
  });
});

describe('Les utilitaires numériques', () => {
  it('mod360 ramène dans [0, 360[, y compris pour un angle négatif', () => {
    expect(mod360(-90)).toBe(270);
    expect(mod360(450)).toBe(90);
  });

  it('arrondi coupe au millième, pour que la comparaison soit celle de l’élève', () => {
    expect(arrondi(0.30000000000000004)).toBe(0.3);
    expect(arrondi(360.00000000000006)).toBe(360);
  });

  it('evalValeur est TOTALE : rien ne la fait lever', () => {
    expect(evalValeur(undefined)).toBe(0);
    expect(evalValeur(lit('absente'), {})).toBe(0);
    expect(evalValeur('42')).toBe(42);
    expect(evalValeur(formule('c', { fois: 2, plus: 10 }), { c: 5 })).toBe(20);
  });
});
