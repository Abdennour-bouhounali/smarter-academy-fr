/**
 * LES AFFIRMATIONS DE LA LEÇON, VÉRIFIÉES SUR SES DONNÉES EXACTES.
 *
 * Les modules AFFIRMENT des choses à l'élève : « règle les deux machines sur le
 * même deuxième terme, puis appuie encore : elles divergent », « cette suite
 * est géométrique de raison 0,5 », « u(n+1) − u(n) = 5 ». Ce sont des CONTENUS
 * PÉDAGOGIQUES : si le comportement réel diffère, la leçon ment, et
 * `sequences.test.js` ne l'attrape pas — il vérifie que `detectKind` est juste,
 * pas qu'un module dit vrai en la citant.
 *
 * PÉRIMÈTRE : aucun test ne mentionne la somme des termes ni la limite d'une
 * suite — ce sont les deux leçons suivantes.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  fr, parseNombre,
  LAB_U0, LAB_PAS_ADDITIFS, LAB_PAS_MULTIPLICATIFS, LAB_PLAFOND,
  rangMaxLab, etatLab, premierRangQuiDiffere, pasAdditifQuiCoincide, missionLabRemplie,
  CATALOGUE, FORMULES, RECURRENCES, deroulerRecurrence,
  A_DEMONTRER, ecartFormule, rapportFormule,
  CAS_VARIATION, MODELES,
  detectKind, variationSense, terms, nthArithmetic, nthGeometric,
} from './suitesUtils';

/* ── Module 1 : le laboratoire signature ─────────────────────────────────── */

describe('module 1 — SÉCURITÉ DE MISE EN PAGE : rien ne sort jamais du cadre', () => {
  it('BALAYÉ, pas échantillonné : tout réglage × tout rang atteignable reste sous le plafond', () => {
    // C'est le contrôle qui décide du plafond du cliquet : la pile géométrique
    // explose, et un rang de trop mettrait 13 122 dans une accolade.
    let combinaisons = 0;
    for (const pasAdd of LAB_PAS_ADDITIFS) {
      for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
        const nMax = rangMaxLab(pasAdd, pasMul);
        expect(nMax).toBeGreaterThanOrEqual(3);   // sinon la divergence n'a pas la place de se voir
        for (let n = 0; n <= nMax; n += 1) {
          const e = etatLab(pasAdd, pasMul, n);
          for (const v of [...e.add, ...e.mul]) {
            expect(v).toBeLessThanOrEqual(LAB_PLAFOND);
            expect(v).toBeGreaterThan(0);
          }
        }
        combinaisons += 1;
      }
    }
    expect(combinaisons).toBe(LAB_PAS_ADDITIFS.length * LAB_PAS_MULTIPLICATIFS.length);
  });

  it('le rang JUSTE AU-DESSUS du plafond dépasserait vraiment : le plafond n’est pas arbitraire', () => {
    for (const pasAdd of LAB_PAS_ADDITIFS) {
      for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
        const n = rangMaxLab(pasAdd, pasMul);
        const suivant = Math.max(
          nthArithmetic(LAB_U0, pasAdd, n + 1),
          nthGeometric(LAB_U0, pasMul, n + 1),
        );
        expect(suivant).toBeGreaterThan(LAB_PLAFOND);
      }
    }
  });

  it('tous les termes affichables sont des ENTIERS : aucune décimale dans une accolade', () => {
    // C'est pour cela que les crans multiplicatifs sont entiers : q = 2,5
    // remplirait la pile de 12,5 puis 31,25, illisibles à cette taille.
    for (const pasAdd of LAB_PAS_ADDITIFS) {
      for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
        const e = etatLab(pasAdd, pasMul, rangMaxLab(pasAdd, pasMul));
        for (const v of [...e.add, ...e.mul, ...e.ecartsAdd, ...e.ecartsMul]) {
          expect(Number.isInteger(v)).toBe(true);
        }
      }
    }
  });
});

describe('module 1 — LA CONSIGNE DIT CE QUI EST VRAI', () => {
  it('CIBLE ATTEIGNABLE : pour chaque cran ×, le cran + qui coïncide EXISTE dans la liste', () => {
    // Sans ce contrôle, la mission serait infaisable : l'élève encadrerait la
    // bonne machine sans jamais l'atteindre, et l'étape resterait bloquée.
    for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
      const cible = pasAdditifQuiCoincide(pasMul);
      expect(LAB_PAS_ADDITIFS).toContain(cible);
    }
  });

  it('deux termes coïncident, JAMAIS trois — la consigne parle donc de deux', () => {
    // Le fait mathématique qui porte tout le module : u0 + 2r = u0q² et
    // u0 + r = u0q forcent q = 1. Le module 1 ne peut donc pas demander trois
    // termes identiques ; il demande les deux premiers, puis fait diverger.
    for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
      const pasAdd = pasAdditifQuiCoincide(pasMul);
      const e = etatLab(pasAdd, pasMul, rangMaxLab(pasAdd, pasMul));
      expect(e.add[0]).toBe(e.mul[0]);
      expect(e.add[1]).toBe(e.mul[1]);
      expect(e.add[2]).not.toBe(e.mul[2]);
      expect(e.rangDeDivergence).toBe(2);
    }
  });

  it('la divergence est VISIBLE, pas symbolique : au rang 3, l’écart est franc', () => {
    for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
      const pasAdd = pasAdditifQuiCoincide(pasMul);
      const e = etatLab(pasAdd, pasMul, 3);
      expect(e.mul[3] - e.add[3]).toBeGreaterThanOrEqual(4);
    }
  });

  it('CE QUI EST CONSTANT N’EST PAS LE TERME, C’EST LE PAS — l’aha, chiffré', () => {
    for (const pasAdd of LAB_PAS_ADDITIFS) {
      for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
        const e = etatLab(pasAdd, pasMul, rangMaxLab(pasAdd, pasMul));
        // Pile additive : les ÉCARTS sont tous égaux, les rapports non.
        expect(e.ecartsAdd.every((x) => x === pasAdd)).toBe(true);
        expect(new Set(e.rapportsAdd.map((x) => Math.round(x * 1e6))).size).toBeGreaterThan(1);
        // Pile multiplicative : les RAPPORTS sont tous égaux, les écarts non.
        expect(e.rapportsMul.every((x) => Math.abs(x - pasMul) < 1e-9)).toBe(true);
        expect(new Set(e.ecartsMul).size).toBeGreaterThan(1);
      }
    }
  });

  it('la mission n’est validée qu’au rang 2 ou plus, et seulement si les machines coïncident', () => {
    const bon = pasAdditifQuiCoincide(2);
    expect(missionLabRemplie(etatLab(bon, 2, 1))).toBe(false);   // coïncident, mais on n'a pas vu diverger
    expect(missionLabRemplie(etatLab(bon, 2, 2))).toBe(true);
    expect(missionLabRemplie(etatLab(bon + 1, 2, 4))).toBe(false); // mal réglées
  });

  it('L’ÉTAT DE DÉPART ne coïncide PAS : il y a bien quelque chose à régler', () => {
    // Un laboratoire déjà réglé priverait le module 1 de son geste : la
    // mission serait remplie avant que l'élève ait touché quoi que ce soit.
    expect(etatLab(LAB_PAS_ADDITIFS[0], LAB_PAS_MULTIPLICATIFS[0], 1).coincidentAuRang1).toBe(false);
  });

  it('le CLAMP du rang ne produit jamais de pile incohérente, sur tout réglage', () => {
    // Le composant borne le rang à `rangMaxLab` : après un changement de
    // réglage, un rang devenu trop grand doit se replier proprement plutôt
    // que de laisser une pile plus courte que l'autre.
    for (const pasMul of LAB_PAS_MULTIPLICATIFS) {
      for (const pasAdd of LAB_PAS_ADDITIFS) {
        const n = rangMaxLab(pasAdd, pasMul);
        const e = etatLab(pasAdd, pasMul, n);
        expect(e.add).toHaveLength(n + 1);
        expect(e.mul).toHaveLength(n + 1);
      }
    }
  });

  it('premierRangQuiDiffere rend null quand les piles sont identiques', () => {
    expect(premierRangQuiDiffere([1, 2, 3], [1, 2, 3])).toBeNull();
    expect(premierRangQuiDiffere([1, 2, 3], [1, 2, 9])).toBe(2);
    expect(premierRangQuiDiffere([5, 2], [1, 2])).toBe(0);
  });

  it('le laboratoire de démonstration cité par le module 1 : q = 2 donne 2,4,8,16 face à 2,4,6,8', () => {
    const e = etatLab(2, 2, 3);
    expect(e.add).toEqual([2, 4, 6, 8]);
    expect(e.mul).toEqual([2, 4, 8, 16]);
  });
});

/* ── Module 2 : formules et récurrences ──────────────────────────────────── */

describe('module 2 — le texte affiché et la fonction qui juge disent la même chose', () => {
  it('chaque formule rend les valeurs que son écriture annonce', () => {
    const attendus = {
      'f-2n1': [1, 3, 5, 7, 9],
      'f-n2': [0, 1, 4, 9, 16],
      'f-3x2n': [3, 6, 12, 24, 48],
      'f-10-3n': [10, 7, 4, 1, -2],
    };
    for (const f of FORMULES) {
      const vals = [0, 1, 2, 3, 4].map(f.f);
      expect(vals, `${f.id} (${f.expr})`).toEqual(attendus[f.id]);
    }
  });

  it('chaque récurrence déroule ce que son texte annonce, u0 en tête', () => {
    const attendus = {
      'r-plus5': [4, 9, 14, 19, 24],
      'r-fois3': [1, 3, 9, 27, 81],
      'r-double-moins1': [5, 9, 17, 33, 65],
    };
    for (const r of RECURRENCES) {
      expect(deroulerRecurrence(r, 4), r.id).toEqual(attendus[r.id]);
      expect(deroulerRecurrence(r, 4)[0]).toBe(r.premier);
    }
  });

  it('la récurrence « 2u − 1 » n’est NI arithmétique NI géométrique : le contre-exemple existe', () => {
    // Le module 2 s'en sert pour dire qu'une récurrence n'est pas
    // automatiquement l'une des deux familles.
    expect(detectKind(deroulerRecurrence(RECURRENCES[2], 4)).kind).toBe('ni');
  });

  it('formule et récurrence décrivent la MÊME suite quand la leçon le dit', () => {
    // u(n) = 5n + 4 ⟺ u(0) = 4 et u(n+1) = u(n) + 5.
    const parRecurrence = deroulerRecurrence(RECURRENCES[0], 5);
    for (let n = 0; n <= 5; n += 1) expect(parRecurrence[n]).toBe(5 * n + 4);
    // v(n) = 3ⁿ ⟺ v(0) = 1 et v(n+1) = 3 v(n).
    const g = deroulerRecurrence(RECURRENCES[1], 5);
    for (let n = 0; n <= 5; n += 1) expect(g[n]).toBe(3 ** n);
  });
});

/* ── Module 3 : reconnaître ──────────────────────────────────────────────── */

describe('module 3 — chaque entrée du catalogue est ÉTIQUETÉE JUSTE', () => {
  it('la nature annoncée est celle que detectKind trouve, pour les six', () => {
    for (const c of CATALOGUE) {
      const d = detectKind(c.list);
      expect(d.kind, `${c.id} — ${c.label}`).toBe(c.nature);
      if (c.raison === null) expect(d.raison).toBeNull();
      else expect(d.raison).toBeCloseTo(c.raison, 9);
    }
  });

  it('le catalogue balaie les quatre pièges du chapitre', () => {
    const natures = CATALOGUE.map((c) => c.nature);
    expect(natures).toContain('arithmetique');
    expect(natures).toContain('geometrique');
    expect(natures).toContain('ni');
    // raison négative, raison entre 0 et 1, raison nulle
    expect(CATALOGUE.some((c) => c.raison !== null && c.raison < 0)).toBe(true);
    expect(CATALOGUE.some((c) => c.raison !== null && c.raison > 0 && c.raison < 1)).toBe(true);
    expect(CATALOGUE.some((c) => c.raison === 0)).toBe(true);
  });

  it('la suite CONSTANTE est classée arithmétique de raison 0 — le cas qui piège', () => {
    const z = CATALOGUE.find((c) => c.id === 'c-const');
    expect(z.nature).toBe('arithmetique');
    expect(z.raison).toBe(0);
    // Elle est aussi géométrique de raison 1 : la leçon le dit, on le vérifie.
    expect(z.list.every((v, i, l) => i === 0 || v / l[i - 1] === 1)).toBe(true);
  });

  it('l’étiquette affichée liste bien les mêmes nombres que la suite jugée', () => {
    // Un décalage entre le label et la liste ferait juger une autre suite que
    // celle que l'élève lit — le mensonge le plus invisible qui soit.
    for (const c of CATALOGUE) {
      const dansLabel = c.label.split(':')[1].split(',').map((s) => parseNombre(s));
      expect(dansLabel, c.id).toEqual(c.list);
    }
  });
});

/* ── Module 4 : démontrer ────────────────────────────────────────────────── */

describe('module 4 — les démonstrations portent sur des suites qui le méritent', () => {
  it('la constante annoncée est celle que le calcul rend, sur cinq rangs', () => {
    for (const d of A_DEMONTRER) {
      for (let n = 0; n <= 4; n += 1) {
        const obtenu = d.preuve === 'ecart' ? ecartFormule(d.f, n) : rapportFormule(d.f, n);
        expect(obtenu, `${d.id} au rang ${n}`).toBeCloseTo(d.constante, 9);
      }
    }
  });

  it('la nature démontrée est bien celle que detectKind confirme sur les termes', () => {
    for (const d of A_DEMONTRER) {
      const list = [0, 1, 2, 3, 4].map(d.f);
      const attendu = d.preuve === 'ecart' ? 'arithmetique' : 'geometrique';
      expect(detectKind(list).kind, d.id).toBe(attendu);
      expect(detectKind(list).raison).toBeCloseTo(d.constante, 9);
    }
  });

  it('la LIGNE DE CALCUL citée par le module se termine sur la bonne constante', () => {
    for (const d of A_DEMONTRER) {
      const fin = d.calcul.split('=').pop().trim().replace('−', '-');
      expect(parseNombre(fin), d.id).toBeCloseTo(d.constante, 9);
    }
  });

  it('un écart constant NÉGATIF reste une démonstration d’arithmétique', () => {
    const w = A_DEMONTRER.find((d) => d.id === 'd-affine-neg');
    expect(w.constante).toBe(-4);
    expect(detectKind([0, 1, 2, 3, 4].map(w.f)).kind).toBe('arithmetique');
    expect(variationSense([0, 1, 2, 3, 4].map(w.f)).sens).toBe('decroissante');
  });
});

/* ── Module 5 : sens de variation ────────────────────────────────────────── */

describe('module 5 — chaque cas de variation est étiqueté juste', () => {
  it('le sens annoncé est celui que variationSense trouve, pour les six', () => {
    for (const c of CAS_VARIATION) {
      expect(variationSense(c.list).sens, `${c.id} — ${c.label}`).toBe(c.attendu);
    }
  });

  it('les trois pièges du sens de variation sont TOUS présents dans les cas', () => {
    // 1. raison négative → décroissante
    expect(CAS_VARIATION.find((c) => c.id === 'v-arith-moins').attendu).toBe('decroissante');
    // 2. raison entre 0 et 1 → géométrique DÉCROISSANTE, malgré une multiplication
    const demi = CAS_VARIATION.find((c) => c.id === 'v-geo-demi');
    expect(demi.attendu).toBe('decroissante');
    expect(demi.list).toEqual([64, 32, 16, 8, 4]);
    // 3. u0 < 0 RENVERSE le sens d'une géométrique de raison > 1
    const neg = CAS_VARIATION.find((c) => c.id === 'v-geo-u0-neg');
    expect(neg.attendu).toBe('decroissante');
    expect(neg.list).toEqual([-3, -6, -12, -24, -48]);
    // et le même réglage avec u0 > 0 monte : c'est la comparaison qui enseigne
    expect(CAS_VARIATION.find((c) => c.id === 'v-geo-2').attendu).toBe('croissante');
  });

  it('la suite constante est « constante », pas « croissante »', () => {
    expect(CAS_VARIATION.find((c) => c.id === 'v-const').attendu).toBe('constante');
  });
});

/* ── Module 6 : modéliser ────────────────────────────────────────────────── */

describe('module 6 — les modèles rendent les nombres que l’énoncé promet', () => {
  it('le versement fixe est arithmétique de raison 20, et vaut 250 € au rang 5', () => {
    const m = MODELES[0];
    const list = terms(m.gen, 5);
    expect(list[0]).toBe(150);
    expect(list[5]).toBe(250);
    expect(detectKind(list).kind).toBe('arithmetique');
    expect(detectKind(list).raison).toBeCloseTo(20, 9);
  });

  it('la hausse de 5 % est géométrique de raison 1,05 — le coefficient multiplicateur de 2de', () => {
    const m = MODELES[1];
    const list = terms(m.gen, 3);
    expect(list[0]).toBe(400);
    expect(list[1]).toBeCloseTo(420, 9);
    expect(detectKind(list).kind).toBe('geometrique');
    expect(detectKind(list).raison).toBeCloseTo(1.05, 9);
    // La confusion à éviter : + 5 % n'est PAS + 5 (ce serait 405).
    expect(list[1]).not.toBe(405);
  });

  it('les deux modèles se distinguent au rang 3, pas seulement en théorie', () => {
    const arith = terms(MODELES[0].gen, 3);
    const geo = terms(MODELES[1].gen, 3);
    expect(detectKind(arith).kind).not.toBe(detectKind(geo).kind);
  });
});

/* ── Écriture française, et lecture des saisies ──────────────────────────── */

describe('écriture et lecture des nombres', () => {
  it('fr utilise la virgule et le VRAI signe moins', () => {
    expect(fr(1.05)).toBe('1,05');
    expect(fr(-6)).toBe('−6');
    expect(fr(0.5)).toBe('0,5');
    expect(fr(64)).toBe('64');
  });

  it('parseNombre accepte le vrai signe moins U+2212 — que parseDec REFUSE', () => {
    // C'est le défaut de classe : l'élève recopie « −6 » depuis l'écran, et
    // `parseDec` rend NaN sur ce caractère. Sa réponse juste serait refusée.
    expect(parseNombre('−6')).toBe(-6);
    expect(parseNombre('-6')).toBe(-6);
    expect(parseNombre('−0,5')).toBe(-0.5);
    expect(parseNombre('1,05')).toBeCloseTo(1.05, 12);
    expect(parseNombre('  4  ')).toBe(4);
  });

  it('parseNombre refuse ce qui n’est pas un nombre, sans rendre 0', () => {
    for (const s of ['', 'abc', '2x', '−', ',']) expect(Number.isNaN(parseNombre(s))).toBe(true);
  });

  it('fr et parseNombre sont réciproques sur les nombres de la leçon', () => {
    for (const n of [-6, -4, -0.5, 0, 0.5, 1.05, 2, 20, 64, 250]) {
      expect(parseNombre(fr(n))).toBeCloseTo(n, 9);
    }
  });
});

/* ── Le boss ─────────────────────────────────────────────────────────────── */

describe('mission finale — les distracteurs sont NUMÉRIQUEMENT distincts', () => {
  it('e1 — u(n) = 2n + 1 au rang 4 vaut 9 ; les pièges valent 8, 10 et 11', () => {
    const u = FORMULES[0].f;
    expect(u(4)).toBe(9);
    const rangDecale = u(5);        // 11 — l'élève a compté u1 comme premier
    const oubliDuPlus1 = 2 * 4;     // 8
    const rangPlusUn = 2 * 4 + 2;   // 10
    expect(new Set([u(4), rangDecale, oubliDuPlus1, rangPlusUn]).size).toBe(4);
  });

  it('e2 — la récurrence w(n+1) = 2w(n) − 1 depuis 5 donne 9, 17, 33 : trois pièges distincts', () => {
    const l = deroulerRecurrence(RECURRENCES[2], 3);
    expect(l).toEqual([5, 9, 17, 33]);
    const sansLeMoins1 = [5, 10, 20, 40];       // on a oublié le −1
    expect(l[3]).not.toBe(sansLeMoins1[3]);
    expect(new Set([l[3], sansLeMoins1[3], 5 + 3 * 2, 2 * 33 - 1]).size).toBe(4);
  });

  it('e3 — raison de 3, 7, 11, 15 : 4, et aucun piège ne vaut 4', () => {
    const c = CATALOGUE[0];
    expect(detectKind(c.list).raison).toBe(4);
    const rapportPremier = c.list[1] / c.list[0];   // 7/3 ≈ 2,333
    const dernierMoinsPremier = c.list[4] - c.list[0]; // 16
    for (const p of [rapportPremier, dernierMoinsPremier, 3]) expect(p).not.toBe(4);
  });

  it('e4 — raison de 80, 40, 20, 10 : 0,5 ; le piège « −40 » est l’écart, pas le rapport', () => {
    const x = CATALOGUE.find((c) => c.id === 'c-geo-demi');
    expect(detectKind(x.list).raison).toBeCloseTo(0.5, 12);
    expect(x.list[1] - x.list[0]).toBe(-40);
    expect(new Set([0.5, -40, 2, -20]).size).toBe(4);
  });

  it('e5/e6 — la démonstration par l’écart donne 5, celle par le rapport donne 3', () => {
    expect(ecartFormule(A_DEMONTRER[0].f, 7)).toBe(5);
    expect(rapportFormule(A_DEMONTRER[1].f, 7)).toBeCloseTo(3, 9);
    // Le piège : prendre le rapport là où c'est l'écart qui est constant.
    const rapportsDeLAffine = [0, 1, 2, 3].map((n) => rapportFormule(A_DEMONTRER[0].f, n));
    expect(new Set(rapportsDeLAffine.map((x) => Math.round(x * 1e6))).size).toBeGreaterThan(1);
  });

  it('e8 — u(0) = −3 et raison ×2 : la suite DESCEND, malgré une raison plus grande que 1', () => {
    const c = CAS_VARIATION.find((v) => v.id === 'v-geo-u0-neg');
    expect(variationSense(c.list).sens).toBe('decroissante');
    expect(c.list[1]).toBeLessThan(c.list[0]);
  });

  it('e10 — le loyer après un an vaut 420 € ; « 405 » est le piège du + 5', () => {
    const list = terms(MODELES[1].gen, 2);
    expect(list[1]).toBeCloseTo(420, 9);
    expect(list[2]).toBeCloseTo(441, 9);
    expect(new Set([420, 405, 500, 441]).size).toBe(4);
  });

  it('les SIX LP sont couverts par au moins une épreuve QUI LEUR EST PROPRE', () => {
    // Lu en TEXTE, comme le validateur : c'est ce qu'il voit réellement.
    const src = readFileSync(
      new URL('../modules/Module07MissionFinaleDeuxFamilles.jsx', import.meta.url),
      'utf8',
    );
    const listes = [...src.matchAll(/learningPointIds: \[([^\]]+)\]/g)].map((m) =>
      m[1].split(',').map((s) => s.trim().replace(/'/g, '')),
    );
    expect(listes).toHaveLength(10);
    const prefixe = 'premiere_specialite_suites-decouvrir-1ere_P';
    for (const n of [1, 2, 3, 4, 5, 6]) {
      const seule = listes.some((l) => l.length === 1 && l[0] === `${prefixe}${n}`);
      expect(seule, `P${n} doit avoir une épreuve dédiée`).toBe(true);
    }
  });
});
