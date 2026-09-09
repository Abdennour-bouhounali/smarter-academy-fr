import { describe, it, expect } from 'vitest';
import {
  round2, fr,
  relation, siOnDouble, debitRelation, tempsDeRemplissage, masseVolumiqueRelation,
  kmhVersMs, msVersKmh, texteDuree, enHeuresMinutes,
  GRANDEURS, CYCLISTE, BORNES, assertScope4e,
} from './grandeurs4e';
import { CHOIX, ECRITURES } from './FormuleLab';
import { CAPACITE, BORNES_ROBINET } from './TankLab';
import { BORNES_VITESSE, ETAPES } from './ConversionLab';
import { ETIQUETTES } from './UnitesLab';
import { texteCadran, CADRANS } from './DashboardLab';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module de manipulation AFFIRME des choses — « la vitesse tombe à 12 »,
 * « on retombe bien dessus », « le nombre doit rétrécir », « chaque cible est
 * atteignable au cran près ». Ces affirmations sont du contenu pédagogique :
 * si le comportement réel diffère, la leçon MENT à l'élève, et aucun test
 * d'unité du noyau ne l'attrape.
 *
 * Ce fichier teste donc les ÉNONCÉS des modules, sur leurs données exactes,
 * plus l'ATTEIGNABILITÉ de chaque cible de curseur.
 *
 * Un défaut réel a été trouvé par ce fichier avant l'écriture de l'UI :
 * le choix `vitesse: 45` du module 5 produisait 30 km à 45 km/h → 0,67 h,
 * dont la vérification 45 × 0,67 = 30,15 CONTREDISAIT la distance affichée
 * juste au-dessus. La valeur a été retirée de `CHOIX`, et le test qui l'a
 * attrapée est celui qui la garde retirée.
 */

/* ═══ MODULE 1 — Le tableau de bord ════════════════════════════════════ */
describe('Module 1 — « la réponse dépend de ce qu’on tient fixe »', () => {
  it('l’état de départ du cycliste est cohérent, et c’est celui que la leçon cite', () => {
    expect(relation(CYCLISTE).coherent).toBe(true);
    expect(CYCLISTE.distance).toBe(36);
    expect(texteDuree(CYCLISTE.duree)).toBe('1 h 30 min');
    expect(CYCLISTE.vitesse).toBe(24);
  });

  it('LES DEUX NOMBRES CITÉS par l’étape 2 sont ceux que le noyau produit', () => {
    // « la vitesse passe de 24 à 48 » puis « elle tombe à 12 ».
    const doubleDistance = relation({ distance: CYCLISTE.distance * 2, duree: CYCLISTE.duree });
    const doubleDuree = relation({ distance: CYCLISTE.distance, duree: CYCLISTE.duree * 2 });
    expect(doubleDistance.vitesse).toBe(48);
    expect(doubleDuree.vitesse).toBe(12);
  });

  it('et ils sont bien OPPOSÉS : sinon l’aha du module n’existerait pas', () => {
    const a = siOnDouble({ grandeur: 'distance', fixee: 'duree', etat: CYCLISTE });
    const b = siOnDouble({ grandeur: 'duree', fixee: 'distance', etat: CYCLISTE });
    expect(a.facteur).toBe(2);
    expect(b.facteur).toBe(0.5);
    expect(a.troisieme).toBe(b.troisieme); // les deux parlent bien de la VITESSE
  });

  it('OÙ SE TROUVE VRAIMENT LE CONTRASTE — et où il ne se trouve PAS', () => {
    // DÉFAUT TROUVÉ AU NAVIGATEUR, verrouillé ici. La première version du labo
    // comparait, à grandeur fixée constante, les deux grandeurs qu'on peut
    // doubler. Ces deux facteurs sont TOUJOURS ÉGAUX : à durée fixée, doubler
    // la distance et doubler la vitesse donnent ×2 toutes les deux. La
    // phrase-clé du labo ne pouvait donc jamais s'afficher.
    const base = relation({ distance: CYCLISTE.distance, duree: CYCLISTE.duree });
    for (const fixee of ['distance', 'duree', 'vitesse']) {
      const autres = ['distance', 'duree', 'vitesse'].filter((g) => g !== fixee);
      const fs = autres.map((g) => siOnDouble({
        grandeur: g, fixee, etat: { [fixee]: base[fixee], [g]: base[g] },
      }).facteur);
      expect(fs[0], `à ${fixee} fixée, les deux facteurs sont égaux`).toBe(fs[1]);
    }
  });

  it('le contraste EXISTE quand on compare les deux FIXATIONS d’un même geste', () => {
    // C'est ce que le labo affiche désormais : je double `reglee`, et je regarde
    // ce qui arrive à la troisième sous chacune des deux fixations possibles.
    const base = relation({ distance: CYCLISTE.distance, duree: CYCLISTE.duree });
    const contraste = (reglee) => {
      const fs = ['distance', 'duree', 'vitesse']
        .filter((f) => f !== reglee)
        .map((f) => siOnDouble({
          grandeur: reglee, fixee: f, etat: { [f]: base[f], [reglee]: base[reglee] },
        }).facteur);
      return fs[0] !== fs[1];
    };
    // Régler la DURÉE ou la VITESSE fait apparaître le contraste…
    expect(contraste('duree'), 'régler la durée').toBe(true);
    expect(contraste('vitesse'), 'régler la vitesse').toBe(true);
    // …régler la DISTANCE non : doubler la distance multiplie par 2 des deux
    // côtés. Le labo le DIT plutôt que de feindre un contraste.
    expect(contraste('distance'), 'régler la distance').toBe(false);
  });

  it('LE DÉFAUT DE DÉPART DU MODULE 1 PORTE L’AHA', () => {
    // Le module ouvre sur `fixee: 'distance'`, `reglee: 'duree'` : c'est
    // précisément le réglage où le même geste a deux effets opposés. S'ouvrir
    // sur « régler la distance » montrerait ×2 des deux côtés, et l'élève
    // n'aurait rien à remarquer.
    const base = relation({ distance: CYCLISTE.distance, duree: CYCLISTE.duree });
    const aDistanceFixee = siOnDouble({
      grandeur: 'duree', fixee: 'distance', etat: { distance: base.distance, duree: base.duree },
    });
    const aVitesseFixee = siOnDouble({
      grandeur: 'duree', fixee: 'vitesse', etat: { vitesse: base.vitesse, duree: base.duree },
    });
    expect(aDistanceFixee.facteur).toBe(0.5);
    expect(aVitesseFixee.facteur).toBe(2);
    expect(aDistanceFixee.facteur).not.toBe(aVitesseFixee.facteur);
  });

  it('TOUT état atteignable des cadrans reste lisible : jamais de NaN ni de « 60 min »', () => {
    // Sans cela, un réglage extrême afficherait « — » ou « 2 h 60 min » et la
    // figure mentirait (mémoire « invariant visuel »).
    for (const fixee of ['distance', 'duree', 'vitesse']) {
      for (const reglee of ['distance', 'duree', 'vitesse']) {
        if (reglee === fixee) continue;
        const b = BORNES[reglee];
        for (let v = b.min; v <= b.max; v = round2(v + b.pas)) {
          const r = relation({ [fixee]: CYCLISTE[fixee], [reglee]: v });
          for (const c of CADRANS) {
            const txt = texteCadran(c.id, r[c.id]);
            expect(txt, `${fixee}/${reglee}=${v}/${c.id}`).not.toMatch(/NaN|undefined|—/);
            if (c.id === 'duree') expect(txt).not.toMatch(/\b60 min/);
          }
        }
      }
    }
  });

  it('la troisième valeur reste STRICTEMENT POSITIVE partout : aucun cadran ne casse', () => {
    for (let d = BORNES.distance.min; d <= BORNES.distance.max; d += 1) {
      for (let t = BORNES.duree.min; t <= BORNES.duree.max; t = round2(t + BORNES.duree.pas)) {
        const v = relation({ distance: d, duree: t }).vitesse;
        expect(v, `${d} km en ${t} h`).toBeGreaterThan(0);
      }
    }
  });
});

/* ═══ MODULE 2 — « Par » ou « fois » ? ═════════════════════════════════ */
describe('Module 2 — le tri des cinq étiquettes', () => {
  it('les cinq étiquettes du labo existent toutes dans le noyau', () => {
    expect(ETIQUETTES).toHaveLength(5);
    for (const id of ETIQUETTES) expect(GRANDEURS[id], id).toBeDefined();
  });

  it('les deux familles sont bien représentées — sinon le tri serait trivial', () => {
    const kinds = ETIQUETTES.map((id) => GRANDEURS[id].kind);
    expect(kinds.filter((k) => k === 'quotient')).toHaveLength(3);
    expect(kinds.filter((k) => k === 'produit')).toHaveLength(2);
  });

  it('LE PIÈGE ANNONCÉ EST RÉEL : le symbole ne suffit pas à trier', () => {
    // Le module affirme : « ouvriers·jours n'a pas de barre et n'est pourtant
    // pas un quotient ». Si toutes les barres coïncidaient avec les quotients,
    // la phrase serait fausse et l'étape 3 sans objet.
    expect(GRANDEURS.travail.symbole).not.toMatch(/\//);
    expect(GRANDEURS.travail.kind).toBe('produit');
    expect(GRANDEURS.energie.symbole).not.toMatch(/\//);
    expect(GRANDEURS.energie.kind).toBe('produit');
    // …et g/cm³ EN a une, et en est bien un.
    expect(GRANDEURS.masseVolumique.symbole).toMatch(/\//);
    expect(GRANDEURS.masseVolumique.kind).toBe('quotient');
  });

  it('les deux lectures CITÉES par les explications sont exactes', () => {
    expect(GRANDEURS.debit.lecture).toBe('des litres par minute');
    expect(GRANDEURS.energie.lecture).toBe('des kilowatts fois des heures');
  });

  it('chaque lecture contient « par » ou « fois », jamais les deux', () => {
    for (const id of ETIQUETTES) {
      const l = GRANDEURS[id].lecture;
      const par = / par /.test(l);
      const fois = / fois /.test(l);
      expect(par !== fois, `${id}: ${l}`).toBe(true);
      expect(par, `${id} kind=${GRANDEURS[id].kind}`).toBe(GRANDEURS[id].kind === 'quotient');
    }
  });
});

/* ═══ MODULE 3 — Le robinet ════════════════════════════════════════════ */
describe('Module 3 — le débit, et l’ATTEIGNABILITÉ du remplissage exact', () => {
  it('LA CIBLE DE L’ÉTAPE 3 TOMBE SUR UN CRAN DU CURSEUR', () => {
    // 300 L à 12 L/min = 25 min. Sans cela, l'élève ne pourrait pas régler le
    // labo sur la situation qu'on lui demande (mémoire « cible atteignable »).
    const t = tempsDeRemplissage(CAPACITE, 12);
    expect(t).toBe(25);
    expect(12).toBeGreaterThanOrEqual(BORNES_ROBINET.debit.min);
    expect(12).toBeLessThanOrEqual(BORNES_ROBINET.debit.max);
    expect(t).toBeGreaterThanOrEqual(BORNES_ROBINET.duree.min);
    expect(t).toBeLessThanOrEqual(BORNES_ROBINET.duree.max);
    // et le cran est ENTIER : le curseur avance de 1 en 1
    expect(t % BORNES_ROBINET.duree.pas).toBe(0);
  });

  it('la masse volumique du fer citée à l’étape 4 est exacte', () => {
    const fer = masseVolumiqueRelation({ masse: 78, volume: 10 });
    expect(fer.masseVolumique).toBe(7.8);
    expect(fer.manquante).toBe('masseVolumique');
    // le distracteur nommé (« tu as divisé à l'envers ») est bien 10 ÷ 78
    expect(round2(10 / 78)).toBe(0.13);
    // et celui de la multiplication
    expect(78 * 10).toBe(780);
  });

  it('le distracteur « tu as multiplié » de l’étape 3 est le nombre annoncé', () => {
    expect(CAPACITE * 12).toBe(3600);
    expect(CAPACITE - 12).toBe(288);
  });

  it('AUCUN volume affichable n’est négatif, et le débordement est ANNONÇABLE', () => {
    let debordeAuMoinsUneFois = false;
    for (let d = BORNES_ROBINET.debit.min; d <= BORNES_ROBINET.debit.max; d += 1) {
      for (let t = BORNES_ROBINET.duree.min; t <= BORNES_ROBINET.duree.max; t += 1) {
        const v = debitRelation({ debit: d, duree: t }).volume;
        expect(v, `${d}×${t}`).toBeGreaterThan(0);
        if (v > CAPACITE) debordeAuMoinsUneFois = true;
      }
    }
    // Le labo dit « le réservoir déborde » : encore faut-il que ce soit
    // atteignable, sinon le message serait du code mort.
    expect(debordeAuMoinsUneFois).toBe(true);
  });

  it('le réservoir peut aussi être rempli EXACTEMENT, pas seulement dépassé', () => {
    const exacts = [];
    for (let d = BORNES_ROBINET.debit.min; d <= BORNES_ROBINET.debit.max; d += 1) {
      for (let t = BORNES_ROBINET.duree.min; t <= BORNES_ROBINET.duree.max; t += 1) {
        if (debitRelation({ debit: d, duree: t }).volume === CAPACITE) exacts.push([d, t]);
      }
    }
    expect(exacts.length).toBeGreaterThan(0);
    expect(exacts).toContainEqual([12, 25]);
  });
});

/* ═══ MODULE 4 — 1000 mètres en 3600 secondes ══════════════════════════ */
describe('Module 4 — le raisonnement et le raccourci ne divergent JAMAIS', () => {
  it('les deux vitesses repères du module tombent sur des crans, et sur des entiers', () => {
    for (const v of [36, 90]) {
      expect(v).toBeGreaterThanOrEqual(BORNES_VITESSE.min);
      expect(v).toBeLessThanOrEqual(BORNES_VITESSE.max);
      expect((v - BORNES_VITESSE.min) % BORNES_VITESSE.pas).toBe(0);
      // Une image entière : l'élève doit pouvoir la taper sans virgule.
      expect(Number.isInteger(kmhVersMs(v).valeur), `${v}`).toBe(true);
    }
  });

  it('SUR TOUTE LA PLAGE DU CURSEUR, la ligne 4 redonne la ligne 3', () => {
    // C'est l'affirmation centrale du module : « la ligne 4 redonne exactement
    // la ligne 3, à toutes les vitesses ».
    for (let v = BORNES_VITESSE.min; v <= BORNES_VITESSE.max; v += BORNES_VITESSE.pas) {
      const e = kmhVersMs(v).etapes;
      expect(e.quotient, `${v} km/h`).toBeCloseTo(e.raccourci, 2);
    }
  });

  it('le SENS annoncé est vrai partout : en m/s le nombre est plus petit', () => {
    // Le labo écrit « le nombre en m/s est plus petit ». Il ne doit jamais
    // afficher « plus grand » sur la plage réelle du curseur.
    for (let v = BORNES_VITESSE.min; v <= BORNES_VITESSE.max; v += BORNES_VITESSE.pas) {
      expect(kmhVersMs(v).valeur, `${v} km/h`).toBeLessThan(v);
    }
  });

  it('les nombres cités pour 90 km/h sont ceux du noyau', () => {
    const r = kmhVersMs(90);
    expect(r.etapes.metres).toBe(90000);
    expect(r.etapes.secondes).toBe(3600);
    expect(r.valeur).toBe(25);
    // le piège nommé dans explainFor : la multiplication par 3,6
    expect(round2(90 * 3.6)).toBe(324);
    // celui de la division par 60 seulement
    expect(round2(90 / 60)).toBe(1.5);
  });

  it('le RETOUR de l’étape 4 est exact, et son piège aussi', () => {
    expect(kmhVersMs(36).valeur).toBe(10);
    expect(msVersKmh(10).valeur).toBe(36);
    // « tu as divisé par 3,6 » : le nombre annoncé
    expect(round2(10 / 3.6)).toBe(2.78);
    expect(10 * 60).toBe(600);
  });

  it('les trois repères du mémo sont exacts', () => {
    expect(kmhVersMs(3.6).valeur).toBe(1);
    expect(kmhVersMs(36).valeur).toBe(10);
    expect(kmhVersMs(90).valeur).toBe(25);
  });

  it('le labo a bien QUATRE étapes, et le module les dévoile toutes', () => {
    expect(ETAPES).toHaveLength(4);
  });
});

/* ═══ MODULE 5 — Lire une formule ══════════════════════════════════════ */
describe('Module 5 — LA VÉRIFICATION NE MENT JAMAIS', () => {
  it('les SOIXANTE-CINQ couples proposés donnent une vérification exacte', () => {
    // LE DÉFAUT ATTRAPÉ ICI : `relation` arrondit la durée au centième, et
    // 30 km à 45 km/h donnait 0,67 h — dont le produit 45 × 0,67 = 30,15
    // contredisait la distance affichée juste au-dessus. Le labo affiche
    // « on retombe bien dessus » : ce test est ce qui le rend vrai.
    let couples = 0;
    for (const cherche of ['distance', 'duree', 'vitesse']) {
      const connues = ['distance', 'duree', 'vitesse'].filter((g) => g !== cherche);
      for (const a of CHOIX[connues[0]]) {
        for (const b of CHOIX[connues[1]]) {
          const r = relation({ [connues[0]]: a, [connues[1]]: b });
          couples += 1;
          expect(round2(r.vitesse * r.duree), `${cherche}: ${connues[0]}=${a} ${connues[1]}=${b}`)
            .toBeCloseTo(r.distance, 2);
        }
      }
    }
    // 5×5 (distance cherchée) + 5×4 + 5×4 : le compte est FIXÉ, pour qu'un
    // ajout de valeur dans CHOIX repasse forcément par ce test.
    expect(couples).toBe(65);
  });

  it('la vitesse 45 est EXCLUE des choix — c’est elle qui faisait mentir la figure', () => {
    expect(CHOIX.vitesse).not.toContain(45);
    expect(round2(relation({ distance: 30, vitesse: 45 }).duree * 45)).not.toBe(30);
  });

  it('toute durée proposée s’écrit proprement en heures et minutes', () => {
    for (const t of CHOIX.duree) {
      const txt = texteDuree(t);
      expect(txt, `${t}`).not.toMatch(/NaN|undefined|60 min/);
    }
    expect(texteDuree(0.5)).toBe('30 min');
    expect(texteDuree(1.5)).toBe('1 h 30 min');
  });

  it('les trois écritures sont bien les trois lectures de la MÊME égalité', () => {
    expect(ECRITURES.distance.formule).toBe('d = v × t');
    expect(ECRITURES.duree.formule).toBe('t = d ÷ v');
    expect(ECRITURES.vitesse.formule).toBe('v = d ÷ t');
  });

  it('le problème du car de l’étape 3 est exact, et ses distracteurs sont nommés justement', () => {
    const r = relation({ distance: 150, vitesse: 60 });
    expect(r.duree).toBe(2.5);
    expect(texteDuree(r.duree)).toBe('2 h 30 min');
    expect(150 * 60).toBe(9000);          // « tu as multiplié »
    expect(round2(60 / 150)).toBe(0.4);   // « tu as divisé à l'envers »
    // La cible est bien réglable dans le labo : les deux valeurs y figurent.
    expect(CHOIX.vitesse).toContain(60);
  });

  it('2,5 h ne se lit surtout pas « 2 h 5 min » — le piège de l’explainFor', () => {
    expect(enHeuresMinutes(2.5)).toEqual({ h: 2, min: 30 });
  });
});

/* ═══ MODULE 6 — Le carnet de route ════════════════════════════════════ */
describe('Module 6 — les trois problèmes, et leur TRANSFERT', () => {
  it('le TGV : 300 km en 1 h 30 min font 200 km/h', () => {
    const r = relation({ distance: 300, duree: 1.5 });
    expect(r.vitesse).toBe(200);
    expect(texteDuree(r.duree)).toBe('1 h 30 min');
    expect(300 * 1.5).toBe(450);          // distracteur « tu as multiplié »
    expect(round2(300 / 2)).toBe(150);    // distracteur « tu as divisé par 2 »
  });

  it('la piscine : 4500 L à 25 L/min font 180 min, soit 3 h', () => {
    const t = debitRelation({ volume: 4500, debit: 25 }).duree;
    expect(t).toBe(180);
    expect(texteDuree(t / 60)).toBe('3 h');
    expect(4500 * 25).toBe(112500);       // distracteur « tu as multiplié »
  });

  it('le panneau : 72 km/h font 20 m/s, et son piège est bien 259,2', () => {
    const r = kmhVersMs(72);
    expect(r.valeur).toBe(20);
    expect(r.etapes.metres).toBe(72000);
    expect(round2(72 * 3.6)).toBe(259.2);
  });

  it('AUCUNE valeur du module 6 ne rejoue celles des modules 1 à 5', () => {
    // Le module promet du TRANSFERT : il ne doit reprendre ni le cycliste, ni
    // le réservoir de 300 L, ni les vitesses 36 / 90 des conversions.
    const valeurs = [300, 1.5, 4500, 25, 72];
    expect(valeurs).not.toContain(CYCLISTE.distance);
    expect(valeurs).not.toContain(36);
    expect(valeurs).not.toContain(90);
    // 300 apparaît bien ici ET comme capacité du réservoir : mais dans un rôle
    // MATHÉMATIQUE différent (une distance en km, pas un volume en L).
    expect(CAPACITE).toBe(300);
  });
});

/* ═══ MODULE 7 — La mission finale ═════════════════════════════════════ */
describe('Module 7 — les dix épreuves reposent sur des nombres exacts', () => {
  it('épreuve 1 : 14 km en 3,5 h font 4 km/h', () => {
    expect(relation({ distance: 14, duree: 3.5 }).vitesse).toBe(4);
    expect(14 * 3.5).toBe(49);            // distracteur
    expect(round2(3.5 / 14)).toBe(0.25);  // distracteur
  });

  it('épreuve 2 : à distance fixée, doubler la durée divise la vitesse par 2', () => {
    const r = siOnDouble({ grandeur: 'duree', fixee: 'distance', etat: { distance: 14, duree: 3.5 } });
    expect(r.facteur).toBe(0.5);
  });

  it('épreuves 5 et 6 : le débit dans ses deux sens', () => {
    expect(debitRelation({ debit: 18, duree: 20 }).volume).toBe(360);
    expect(18 + 20).toBe(38);             // distracteur « tu as additionné »
    expect(tempsDeRemplissage(750, 15)).toBe(50);
    expect(750 * 15).toBe(11250);         // distracteur
    expect(750 + 15).toBe(765);           // distracteur
  });

  it('épreuves 7 et 8 : les deux sens de la conversion, et leurs pièges', () => {
    expect(kmhVersMs(54).valeur).toBe(15);
    expect(round2(54 * 3.6)).toBe(194.4); // le mauvais sens
    expect(round2(54 / 60)).toBe(0.9);    // la division partielle
    expect(msVersKmh(5).valeur).toBe(18);
    expect(round2(5 / 3.6)).toBe(1.39);   // le mauvais sens
    expect(5 * 60).toBe(300);             // la conversion partielle
  });

  it('épreuve 10 : la vitesse d’ensemble se recalcule par les grandeurs, pas par un milieu', () => {
    const t1 = relation({ distance: 40, vitesse: 40 }).duree;
    const t2 = relation({ distance: 60, vitesse: 60 }).duree;
    expect(t1).toBe(1);
    expect(t2).toBe(1);
    const moyenne = relation({ distance: 100, duree: t1 + t2 }).vitesse;
    expect(moyenne).toBe(50);
    // L'explication AVERTIT que la coïncidence tient aux durées égales : on
    // vérifie qu'un contre-exemple existe, sinon l'avertissement serait faux.
    const u1 = relation({ distance: 40, vitesse: 40 }).duree;
    const u2 = relation({ distance: 60, vitesse: 20 }).duree;
    expect(relation({ distance: 100, duree: u1 + u2 }).vitesse).not.toBe(30);
  });

  it('l’aluminium de l’épreuve 4 est bien à 2,7 g/cm³', () => {
    expect(masseVolumiqueRelation({ masse: 270, volume: 100 }).masseVolumique).toBe(2.7);
  });
});

/* ═══ PÉRIMÈTRE ET ÉCRITURE ════════════════════════════════════════════ */
describe('Le périmètre et l’écriture, tenus par les composants eux-mêmes', () => {
  it('les composants de la leçon n’importent RIEN d’un autre dossier de leçon', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const dir = fileURLToPath(new URL('.', import.meta.url));
    for (const f of readdirSync(dir).filter((x) => /\.(jsx?|mjs)$/.test(x))) {
      const src = readFileSync(`${dir}/${f}`, 'utf8');
      for (const [, spec] of src.matchAll(/from '([^']+)'/g)) {
        expect(
          spec.includes('proportionnalite-4e') || spec.includes('fonctions-4e') || spec.includes('/college/'),
          `${f} importe ${spec}`
        ).toBe(false);
      }
    }
  });

  it('aucun composant n’écrit « fonction affine » ni « coefficient directeur » (objets de 3e)', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const { fileURLToPath } = await import('node:url');
    const racine = fileURLToPath(new URL('..', import.meta.url));
    const fichiers = [];
    const parcourir = (d) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        if (e.isDirectory()) parcourir(`${d}/${e.name}`);
        else if (/\.(jsx?|mjs)$/.test(e.name) && !e.name.includes('.test.')) fichiers.push(`${d}/${e.name}`);
      }
    };
    parcourir(racine);
    expect(fichiers.length).toBeGreaterThan(10);
    for (const f of fichiers) {
      const src = readFileSync(f, 'utf8');
      // Les DÉCLARATIONS de périmètre — `teachingScope.exclude` et
      // `assertScope4e` — nomment forcément ce qu'elles excluent. C'est
      // exactement leur rôle : on les saute, mais on vérifie AUSSI qu'elles
      // existent, pour que cette exemption ne devienne pas une porte ouverte.
      const declaration = f.endsWith('lesson.config.js') || f.endsWith('grandeurs4e.js');
      if (declaration) continue;
      expect(/fonction\s+affine/i.test(src), f).toBe(false);
      expect(/coefficient\s+directeur/i.test(src), f).toBe(false);
      expect(/fonction\s+lin[ée]aire/i.test(src), f).toBe(false);
    }
    // La garde exécutable existe bien, et lève sur les quatre sujets de 3e.
    for (const s of ['aire-agrandie', 'volume-agrandi', 'fonction-lineaire', 'fonction-affine']) {
      expect(() => assertScope4e(s), s).toThrow(/3e/);
    }
  });

  it('fr() écrit bien à la française : une virgule décimale', () => {
    expect(fr(2.5)).toBe('2,5');
    expect(fr(7.8)).toBe('7,8');
  });
});
