import { describe, it, expect } from 'vitest';
import {
  round2, fr, quotient, produit, relation, siOnDouble,
  debitRelation, tempsDeRemplissage, masseVolumiqueRelation,
  kmhVersMs, msVersKmh, enHeuresMinutes, texteDuree,
  assertScope4e, GRANDEURS, CYCLISTE, BORNES,
} from './grandeurs4e';
import * as mod from './grandeurs4e';

/* ══════════════════════════════════════════════════════════════════════
   LE PÉRIMÈTRE, EN CODE — frontière 4e / 3e
   ══════════════════════════════════════════════════════════════════════ */
describe('Périmètre officiel de 4e', () => {
  it('n’expose ni k², ni k³, ni fonction linéaire ou affine (objets de 3e)', () => {
    expect(mod.aireAgrandie).toBeUndefined();
    expect(mod.volumeAgrandi).toBeUndefined();
    expect(mod.fonctionLineaire).toBeUndefined();
    expect(mod.fonctionAffine).toBeUndefined();
  });

  it('assertScope4e LÈVE sur chacun de ces sujets', () => {
    for (const s of ['aire-agrandie', 'volume-agrandi', 'fonction-lineaire', 'fonction-affine']) {
      expect(() => assertScope4e(s), s).toThrow(/3e/);
    }
    expect(assertScope4e('debit')).toBe(true);
  });

  it('n’importe RIEN d’un autre dossier de leçon (§6ter.6)', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(
      new URL('./grandeurs4e.js', import.meta.url).pathname, 'utf8'
    );
    const imports = [...src.matchAll(/from '([^']+)'/g)].map((m) => m[1]);
    for (const i of imports) {
      expect(i.includes('proportionnalite-4e') || i.includes('/college/'), i).toBe(false);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LA RELATION — trois lectures d'une seule vérité
   ══════════════════════════════════════════════════════════════════════ */
describe('relation — on en donne deux, elle calcule la troisième', () => {
  it('calcule chacune des trois, et retrouve toujours les deux autres', () => {
    const cas = [
      { distance: 36, duree: 1.5 },
      { distance: 36, vitesse: 24 },
      { duree: 1.5, vitesse: 24 },
    ];
    for (const c of cas) {
      const r = relation(c);
      expect(r.distance, JSON.stringify(c)).toBeCloseTo(36, 6);
      expect(r.duree).toBeCloseTo(1.5, 6);
      expect(r.vitesse).toBeCloseTo(24, 6);
    }
  });

  it('les TROIS lectures sont cohérentes sur toute une grille', () => {
    for (let v = 5; v <= 60; v += 5) {
      for (let t = 0.25; t <= 6; t += 0.25) {
        const r = relation({ duree: t, vitesse: v });
        expect(relation({ distance: r.distance, vitesse: v }).duree, `${v} ${t}`).toBeCloseTo(t, 2);
        expect(relation({ distance: r.distance, duree: t }).vitesse).toBeCloseTo(v, 2);
      }
    }
  });

  it('dit LAQUELLE des trois elle a calculée', () => {
    expect(relation({ duree: 2, vitesse: 30 }).manquante).toBe('distance');
    expect(relation({ distance: 60, vitesse: 30 }).manquante).toBe('duree');
    expect(relation({ distance: 60, duree: 2 }).manquante).toBe('vitesse');
  });

  it('avec les trois valeurs, elle ne calcule rien : elle VÉRIFIE', () => {
    expect(relation({ distance: 60, duree: 2, vitesse: 30 }).coherent).toBe(true);
    expect(relation({ distance: 60, duree: 2, vitesse: 25 }).coherent).toBe(false);
  });

  it('refuse une seule donnée, une durée nulle, une vitesse nulle, un négatif', () => {
    expect(() => relation({ distance: 60 })).toThrow(/DEUX/);
    expect(() => relation({ distance: 60, duree: 0 })).toThrow(/durée nulle/);
    expect(() => relation({ distance: 60, vitesse: 0 })).toThrow(/vitesse nulle/);
    expect(() => relation({ distance: -5, duree: 2 })).toThrow(/négatif/);
  });
});

describe('siOnDouble — la réponse DÉPEND de ce qu’on fixe', () => {
  it('doubler la distance à durée fixée DOUBLE la vitesse', () => {
    const r = siOnDouble({ grandeur: 'distance', fixee: 'duree', etat: { distance: 36, duree: 1.5 } });
    expect(r.troisieme).toBe('vitesse');
    expect(r.facteur).toBeCloseTo(2, 6);
  });

  it('doubler la durée à distance fixée DIVISE la vitesse par deux', () => {
    const r = siOnDouble({ grandeur: 'duree', fixee: 'distance', etat: { distance: 36, duree: 1.5 } });
    expect(r.troisieme).toBe('vitesse');
    expect(r.facteur).toBeCloseTo(0.5, 6);
  });

  it('doubler la vitesse à distance fixée DIVISE la durée par deux', () => {
    const r = siOnDouble({ grandeur: 'vitesse', fixee: 'distance', etat: { distance: 36, vitesse: 24 } });
    expect(r.troisieme).toBe('duree');
    expect(r.facteur).toBeCloseTo(0.5, 6);
  });

  it('LES DEUX RÉPONSES DIFFÈRENT : c’est tout l’intérêt de la question', () => {
    const a = siOnDouble({ grandeur: 'distance', fixee: 'duree', etat: CYCLISTE });
    const b = siOnDouble({ grandeur: 'duree', fixee: 'distance', etat: CYCLISTE });
    expect(a.facteur).not.toBeCloseTo(b.facteur, 3);
  });

  it('refuse de doubler la grandeur qu’on fixe', () => {
    expect(() => siOnDouble({ grandeur: 'duree', fixee: 'duree', etat: CYCLISTE })).toThrow();
  });
});

/* ══════════════════════════════════════════════════════════════════════
   DÉBIT ET MASSE VOLUMIQUE — la MÊME structure
   ══════════════════════════════════════════════════════════════════════ */
describe('Le débit et la masse volumique ne sont pas des notions de plus', () => {
  it('le débit se calcule comme la vitesse : un volume par une durée', () => {
    expect(debitRelation({ volume: 120, duree: 10 }).debit).toBe(12);
    expect(debitRelation({ volume: 120, debit: 12 }).duree).toBe(10);
    expect(debitRelation({ duree: 10, debit: 12 }).volume).toBe(120);
  });

  it('tempsDeRemplissage : 300 L à 12 L/min font 25 min', () => {
    expect(tempsDeRemplissage(300, 12)).toBe(25);
  });

  it('la masse volumique aussi : une masse par un volume', () => {
    expect(masseVolumiqueRelation({ masse: 78, volume: 10 }).masseVolumique).toBe(7.8);
    expect(masseVolumiqueRelation({ volume: 10, masseVolumique: 7.8 }).masse).toBe(78);
  });

  it('elle nomme correctement la grandeur calculée', () => {
    expect(masseVolumiqueRelation({ masse: 78, volume: 10 }).manquante).toBe('masseVolumique');
    expect(debitRelation({ volume: 120, duree: 10 }).manquante).toBe('debit');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   QUOTIENT vs PRODUIT
   ══════════════════════════════════════════════════════════════════════ */
describe('Deux familles de grandeurs composées', () => {
  it('la vitesse, le débit et la masse volumique sont des QUOTIENTS', () => {
    for (const id of ['vitesse', 'debit', 'masseVolumique']) {
      expect(GRANDEURS[id].kind, id).toBe('quotient');
      expect(GRANDEURS[id].symbole).toMatch(/\//);
    }
  });

  it('le kWh et les ouvriers·jours sont des PRODUITS', () => {
    for (const id of ['energie', 'travail']) {
      expect(GRANDEURS[id].kind, id).toBe('produit');
      expect(GRANDEURS[id].symbole).not.toMatch(/\//);
    }
  });

  it('chaque grandeur sait se LIRE à voix haute', () => {
    expect(GRANDEURS.vitesse.lecture).toBe('des kilomètres par heure');
    expect(GRANDEURS.energie.lecture).toBe('des kilowatts fois des heures');
  });
});

/* ══════════════════════════════════════════════════════════════════════
   LES CHANGEMENTS D'UNITÉ — par le SENS
   ══════════════════════════════════════════════════════════════════════ */
describe('kmhVersMs — le « ÷ 3,6 » est une conséquence, pas un point de départ', () => {
  it('36 km/h font 10 m/s', () => {
    expect(kmhVersMs(36).valeur).toBe(10);
  });

  it('le raisonnement et le raccourci donnent le MÊME nombre, partout', () => {
    for (let v = 0; v <= 130; v += 1) {
      const r = kmhVersMs(v);
      expect(r.etapes.quotient, `${v} km/h`).toBeCloseTo(r.etapes.raccourci, 2);
      expect(r.valeur).toBeCloseTo(r.etapes.raccourci, 2);
    }
  });

  it('les étapes exposent le raisonnement : 1000 m en 3600 s', () => {
    const r = kmhVersMs(90);
    expect(r.etapes.metres).toBe(90000);
    expect(r.etapes.secondes).toBe(3600);
    expect(r.valeur).toBe(25);
  });

  it('le chemin inverse redonne le départ', () => {
    for (const v of [0, 5, 18, 36, 50, 90, 130]) {
      expect(msVersKmh(kmhVersMs(v).valeur).valeur, `${v}`).toBeCloseTo(v, 1);
    }
  });

  it('refuse une vitesse négative', () => {
    expect(() => kmhVersMs(-10)).toThrow();
    expect(() => msVersKmh(-1)).toThrow();
  });
});

describe('Les durées décimales s’écrivent en heures et minutes', () => {
  it('2,25 h font 2 h 15 min', () => {
    expect(enHeuresMinutes(2.25)).toEqual({ h: 2, min: 15 });
    expect(texteDuree(2.25)).toBe('2 h 15 min');
  });

  it('le REPORT est géré : 1,999 h ne donne jamais « 1 h 60 »', () => {
    expect(enHeuresMinutes(1.999)).toEqual({ h: 2, min: 0 });
    expect(texteDuree(1.999)).toBe('2 h');
  });

  it('une durée de moins d’une heure s’écrit en minutes seules', () => {
    expect(texteDuree(0.75)).toBe('45 min');
    expect(texteDuree(0.25)).toBe('15 min');
  });

  it('les minutes sont sur deux chiffres', () => {
    expect(texteDuree(3.1)).toBe('3 h 06 min');
  });

  it('toutes les durées atteignables du cadran s’écrivent proprement', () => {
    for (let t = BORNES.duree.min; t <= BORNES.duree.max; t += BORNES.duree.pas) {
      const txt = texteDuree(t);
      expect(txt, `${t}`).not.toMatch(/60 min/);
      expect(txt).not.toMatch(/NaN|undefined/);
    }
  });
});

describe('Les bornes du tableau de bord', () => {
  it('l’état de départ est cohérent : 36 km en 1,5 h à 24 km/h', () => {
    expect(relation(CYCLISTE).coherent).toBe(true);
  });

  it('TOUTE combinaison atteignable des deux cadrans reste dans le troisième', () => {
    // Sans cela, l'élève pourrait régler un couple dont la troisième valeur
    // sortirait du cadran — et la figure mentirait.
    for (let d = BORNES.distance.min; d <= BORNES.distance.max; d += 5) {
      for (let t = BORNES.duree.min; t <= BORNES.duree.max; t += BORNES.duree.pas) {
        const v = relation({ distance: d, duree: t }).vitesse;
        expect(v, `${d} km en ${t} h`).toBeGreaterThan(0);
        expect(Number.isFinite(v)).toBe(true);
      }
    }
  });
});
