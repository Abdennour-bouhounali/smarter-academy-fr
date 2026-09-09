import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ETAPES, etapeApres, tester, chercherContreExemple, programmeMystere, etapesProgramme,
  sommeTroisConsecutifs, etapesPreuveConsecutifs, verifierDansLHistoire, plausible,
  STRATEGIES, CONJECTURES, PROBLEME_FINAL, fr,
} from './raisonnement4e';
import { CONJ_RESULTAT_6, N_MIN, N_MAX } from './EnqueteLab';
import { V_MIN, V_MAX } from './ConjectureLab';
import { LESSON_CONFIG } from '../lesson.config';
import { LESSON_KNOWLEDGE } from '../knowledge';

/**
 * LES PARCOURS QUE LA LEÇON PROMET À L'ÉLÈVE, VÉRIFIÉS.
 *
 * Un module AFFIRME des choses — « le résultat vaut toujours 6 », « il reste
 * 62 € à partager en 5 », « les deux chemins tombent sur le même nombre »,
 * « un seul contre-exemple suffit ». Ces affirmations sont du CONTENU
 * PÉDAGOGIQUE : si le comportement réel diffère, la leçon MENT à l'élève.
 *
 * Ce fichier vérifie aussi l'invariant central de la leçon : AUCUNE copie ne
 * peut dire qu'une conjecture est « prouvée » parce que des essais ont réussi.
 * Le noyau ne produit pas ce statut ; ce test interdit qu'un module l'écrive.
 */

const DIR = new URL('.', import.meta.url).pathname;
const lire = (rel) => readFileSync(join(DIR, '..', rel), 'utf-8');
const MODULES = [
  'Module00Diagnostic', 'Module01ProgrammeMystere', 'Module02Enonce', 'Module03Schema',
  'Module04DeuxChemins', 'Module05ContreExemple', 'Module06EnqueteComplete', 'Module07MissionFinale',
].map((n) => ({ nom: n, src: lire(`modules/${n}.jsx`) }));

/* ═══ L'INVARIANT DE LA LEÇON ══════════════════════════════════════════ */
describe('La leçon ne dit JAMAIS qu’une conjecture est prouvée par des essais', () => {
  it('le noyau n’a que deux statuts, et « prouvee » n’en fait pas partie', () => {
    const beaucoup = Array.from({ length: 300 }, (_, i) => i + 1);
    const r = tester(CONJECTURES.sommeMultipleDe3, beaucoup);
    expect(r.statut).toBe('non-prouvee');
    expect(r.statut).not.toBe('prouvee');
    expect(r.message).toMatch(/ne prouvent rien/);
  });

  it('aucun module n’écrit « prouvée » à propos d’essais', () => {
    // On cherche le mot dans la copie affichée, pas dans les commentaires
    // d'en-tête (qui l'emploient pour EXPLIQUER la règle).
    for (const { nom, src } of MODULES) {
      const copie = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      expect(copie, `${nom} : la copie affirme une conjecture « prouvée »`)
        .not.toMatch(/conjecture (?:est|serait) (?:donc )?prouv/i);
      expect(copie, `${nom} : la copie déduit une preuve d’essais`)
        .not.toMatch(/essais? (?:le |la |l’)?(?:prouve|démontre)/i);
    }
  });

  it('la conjecture du laboratoire signature est vraie ET jamais déclarée prouvée', () => {
    expect(CONJ_RESULTAT_6.vraie).toBe(true);
    const r = tester(CONJ_RESULTAT_6, [0, 1, -7, 12, 999]);
    expect(r.contreExemples).toEqual([]);
    expect(r.statut).toBe('non-prouvee');
  });
});

/* ═══ MODULE 1 — Le programme mystère ══════════════════════════════════ */
describe('Module 1 — « les colonnes du milieu changent, la dernière non »', () => {
  it('le résultat vaut 6 sur TOUTE la plage que le champ accepte', () => {
    for (let n = N_MIN; n <= N_MAX; n += 1) {
      expect(programmeMystere(n), `n = ${n}`).toBe(6);
    }
  });

  it('LES VALEURS INTERMÉDIAIRES CHANGENT VRAIMENT d’un essai à l’autre', () => {
    // Sans cela, la phrase « regarde les colonnes du milieu » serait creuse.
    const suggestions = [7, 100, 0, -5];
    const milieux = suggestions.map((n) => etapesProgramme(n)[2].valeur);
    expect(new Set(milieux).size, milieux.join(' ')).toBe(suggestions.length);
  });

  it('les quatre étapes affichées SONT les quatre consignes du programme', () => {
    const e = etapesProgramme(11);
    expect(e).toHaveLength(4);
    expect(e[0].valeur).toBe(11);
    expect(e[1].valeur).toBe(14);
    expect(e[2].valeur).toBe(28);
    expect(e[3].valeur).toBe(6);
  });

  it('les tuiles 2n + 6 − 2n du module se réduisent bien à 6', () => {
    // Le module affiche « 2 × (n + 3) = 2n + 6 » puis « 2n + 6 − 2n ».
    for (const n of [0, 1, 5, 40, -12]) {
      expect(2 * n + 6 - 2 * n).toBe(6);
      expect(2 * (n + 3) - 2 * n).toBe(programmeMystere(n));
    }
  });

  it('le module 1 ne montre le mot « conjecture » qu’après le geste', () => {
    const src = MODULES[1].src;
    const posLab = src.indexOf('<EnqueteLab');
    const posBrique = src.indexOf("id=\"conjecture\"");
    expect(posLab).toBeGreaterThan(0);
    expect(posBrique).toBeGreaterThan(posLab);
  });
});

/* ═══ MODULE 2 — L'énoncé ══════════════════════════════════════════════ */
describe('Module 2 — le tri des données', () => {
  it('les deux données inutiles du module SONT celles du noyau', () => {
    const src = MODULES[2].src;
    expect(PROBLEME_FINAL.donneesInutiles).toHaveLength(2);
    // Elles apparaissent toutes les deux dans les cartes du trieur.
    expect(src).toMatch(/28 adhérents|\$\{28\} adhérents/);
    expect(src).toMatch(/trois jours/);
    for (const d of PROBLEME_FINAL.donneesInutiles) {
      const noyau = d.replace(/^le |^la /, '');
      const mots = noyau.split(' ').filter((m) => m.length > 4);
      expect(mots.some((m) => src.includes(m)), d).toBe(true);
    }
  });

  it('l’énoncé affiché est CELUI du noyau, pas une recopie', () => {
    expect(MODULES[2].src).toContain('PROBLEME_FINAL.enonce');
    expect(MODULES[2].src).toContain('PROBLEME_FINAL.question');
  });

  it('le troisième temps annoncé est bien « représenter »', () => {
    expect(etapeApres('extraire').id).toBe('representer');
    expect(ETAPES[2].id).toBe('representer');
  });
});

/* ═══ MODULE 3 — Schéma et estimation ══════════════════════════════════ */
describe('Module 3 — « il reste 62 € à partager en 5 »', () => {
  const TOTAL = 74;
  const ECART = 4;
  const NB_BALLONS = 3;
  const NB_FILETS = 2;
  const NB_PARTS = NB_BALLONS + NB_FILETS;
  const SURPLUS = NB_BALLONS * ECART;
  const RESTE = TOTAL - SURPLUS;

  it('la décomposition du schéma retombe sur la solution du noyau', () => {
    expect(SURPLUS).toBe(12);
    expect(RESTE).toBe(62);
    expect(RESTE / NB_PARTS).toBeCloseTo(PROBLEME_FINAL.solution, 10);
  });

  it('le total du schéma est bien celui de l’énoncé', () => {
    const f = PROBLEME_FINAL.solution;
    expect(NB_BALLONS * (f + ECART) + NB_FILETS * f).toBeCloseTo(TOTAL, 10);
  });

  it('la fourchette 10–15 € proposée comme bonne réponse CONTIENT la solution', () => {
    expect(PROBLEME_FINAL.solution).toBeGreaterThan(10);
    expect(PROBLEME_FINAL.solution).toBeLessThan(15);
  });

  it('…et les trois autres fourchettes de l’épreuve l’excluent VRAIMENT', () => {
    const f = PROBLEME_FINAL.solution;
    for (const [a, b] of [[20, 30], [0, 5], [60, TOTAL]]) {
      expect(f >= a && f <= b, `[${a} ; ${b}]`).toBe(false);
    }
  });

  it('la prédiction « plus ou moins de 15 € » a une réponse tranchée', () => {
    expect(PROBLEME_FINAL.solution).toBeLessThan(15);
  });
});

/* ═══ MODULE 4 — Deux chemins ══════════════════════════════════════════ */
describe('Module 4 — les deux chemins arrivent au MÊME nombre', () => {
  const DEPART = 9;
  const AJOUT = 7;
  const FACTEUR = 3;
  const ARRIVEE = (DEPART + AJOUT) * FACTEUR;

  it('la situation est cohérente : 48 € à l’arrivée', () => {
    expect(ARRIVEE).toBe(48);
  });

  it('le chemin « remonter à l’envers » redonne le départ', () => {
    expect(ARRIVEE / FACTEUR - AJOUT).toBe(DEPART);
  });

  it('le chemin « équation » redonne le même départ', () => {
    // 3(x + 7) = 48 → 3x + 21 = 48 → x = (48 − 21)/3
    expect((ARRIVEE - FACTEUR * AJOUT) / FACTEUR).toBe(DEPART);
  });

  it('toutes les valeurs intermédiaires affichées sont des entiers', () => {
    // Un chemin qui ferait apparaître une virgule contredirait la mise en
    // scène (« une cagnotte, des euros ronds ») — défaut réel à écarter.
    for (const v of [ARRIVEE, ARRIVEE / FACTEUR, ARRIVEE / FACTEUR - AJOUT, FACTEUR * AJOUT]) {
      expect(Number.isInteger(v), String(v)).toBe(true);
    }
  });

  it('la variante « on retire le double du départ » donne bien 30 €', () => {
    expect(ARRIVEE - 2 * DEPART).toBe(30);
  });

  it('les deux stratégies citées existent dans le noyau', () => {
    for (const id of ['remonter', 'equation']) {
      expect(STRATEGIES.find((s) => s.id === id), id).toBeTruthy();
    }
  });
});

/* ═══ MODULE 5 — Le contre-exemple ═════════════════════════════════════ */
describe('Module 5 — trois affirmations, trois issues', () => {
  it('la conjecture « multiple de 3 » RÉSISTE aux suggestions du module', () => {
    const r = tester(CONJECTURES.sommeMultipleDe3, [1, 8, 25, 100]);
    expect(r.contreExemples).toEqual([]);
    expect(r.statut).toBe('non-prouvee');
  });

  it('…et à tout entier de la plage que le champ accepte', () => {
    for (let n = V_MIN; n <= V_MAX; n += 1) {
      expect(Math.abs(sommeTroisConsecutifs(n) % 3), `n = ${n}`).toBe(0);
    }
  });

  it('la conjecture « toujours paire » a un contre-exemple ATTEIGNABLE dans les suggestions', () => {
    const suggestions = [1, 3, 5, 6];
    const r = tester(CONJECTURES.sommeToujoursPaire, suggestions);
    expect(r.statut).toBe('refutee');
    expect(r.contreExemples).toContain(6);
    // Et l'indice donné par le module pointe bien vers le premier d'entre eux.
    expect(chercherContreExemple(CONJECTURES.sommeToujoursPaire, 1, 50)).toBe(2);
  });

  it('la conjecture PIÈGE ne tombe PAS sur les suggestions « évidentes »', () => {
    // C'est tout l'intérêt du module : 2, 5 et 10 la laissent debout.
    const r = tester(CONJECTURES.carrePlusGrand, [2, 5, 10]);
    expect(r.statut).toBe('non-prouvee');
  });

  it('…mais tombe sur 0, qui EST proposé dans les suggestions du module', () => {
    expect(chercherContreExemple(CONJECTURES.carrePlusGrand, 0, 50)).toBe(0);
    expect(MODULES[5].src).toMatch(/suggestions=\{\[2, 5, 10, 0\]\}/);
    expect(tester(CONJECTURES.carrePlusGrand, [0]).statut).toBe('refutee');
  });

  it('le second contre-exemple annoncé par la correction existe bien', () => {
    // La correction dit « il existe un second contre-exemple, tout aussi
    // discret » : ce test l'exige, sinon la phrase serait fausse.
    const ce = [0, 1].filter((n) => !CONJECTURES.carrePlusGrand.predicat(n));
    expect(ce).toEqual([0, 1]);
  });

  it('la preuve affichée enchaîne les TROIS écritures, toutes égales', () => {
    for (const n of [0, 7, 41, -3]) {
      const [a, b, c] = etapesPreuveConsecutifs(n);
      expect(a.valeur).toBe(b.valeur);
      expect(b.valeur).toBe(c.valeur);
      expect(c.valeur).toBe(sommeTroisConsecutifs(n));
    }
    expect(etapesPreuveConsecutifs(7)[2].texte).toBe('3 × (n + 1)');
  });

  it('le distracteur « 2 » de la question finale est bien FAUX', () => {
    // « Par quel nombre la somme est-elle forcément divisible ? » — 3, pas 2.
    expect(sommeTroisConsecutifs(2) % 2).not.toBe(0);
  });
});

/* ═══ MODULE 6 — L'enquête complète ════════════════════════════════════ */
describe('Module 6 — le résultat, sa possibilité, sa vérification', () => {
  it('la solution est 12,40 € et NE TOMBE PAS ROND', () => {
    expect(PROBLEME_FINAL.solution).toBeCloseTo(12.4, 10);
    expect(Number.isInteger(PROBLEME_FINAL.solution)).toBe(false);
    expect(fr(PROBLEME_FINAL.solution)).toBe('12,4');
  });

  it('la vérification DANS L’HISTOIRE passe au vert sur la bonne valeur', () => {
    const v = verifierDansLHistoire(PROBLEME_FINAL.solution, PROBLEME_FINAL.controles);
    expect(v.ok).toBe(true);
    expect(v.details).toHaveLength(2);
    expect(v.details.map((d) => d.obtenu)).toEqual([16.4, 74]);
  });

  it('…et REFUSE une valeur fausse (sinon le panneau vert ne vaudrait rien)', () => {
    for (const faux of [12, 14.8, 12.5]) {
      expect(verifierDansLHistoire(faux, PROBLEME_FINAL.controles).ok, String(faux)).toBe(false);
    }
  });

  it('la solution est PLAUSIBLE au sens des contraintes déclarées', () => {
    const p = plausible(PROBLEME_FINAL.solution, PROBLEME_FINAL.contraintes);
    expect(p.ok).toBe(true);
    expect(p.raisons).toEqual([]);
  });

  it('les pièges du champ numérique correspondent à de VRAIES erreurs', () => {
    const f = PROBLEME_FINAL.solution;
    expect(74 / 5).toBe(14.8);              // partager sans retirer les 12 €
    expect(f + 4).toBeCloseTo(16.4, 10);    // le prix du ballon, pas du filet
    expect(verifierDansLHistoire(74 / 5, PROBLEME_FINAL.controles).ok).toBe(false);
  });

  it('les sept temps sont bouclés, dans l’ordre, sans trou', () => {
    expect(ETAPES.map((e) => e.rang)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(etapeApres('expliquer')).toBeNull();
  });
});

/* ═══ MODULE 7 — Le boss ═══════════════════════════════════════════════ */
describe('Module 7 — les dix épreuves', () => {
  const src = MODULES[7].src;

  it('les sept LPs de la leçon sont couverts par au moins une épreuve', () => {
    for (let i = 1; i <= 7; i += 1) {
      const lp = `4e_raisonnement-problemes-4e_P${i}`;
      expect(src.includes(lp), lp).toBe(true);
    }
  });

  it('les métadonnées d’évaluation sont des LITTÉRAUX (contrainte du validateur)', () => {
    const n = (src.match(/assessment: \{ enabled: true, type: 'assessment', learningPointIds: \[/g) || []).length;
    expect(n).toBe(10);
  });

  it('badges[].test est une FONCTION, pas une valeur', () => {
    expect((src.match(/test: \(m\) =>/g) || []).length).toBe(6);
  });

  it('les nombres des épreuves ne rejouent AUCUN nombre des modules', () => {
    // Transfert, pas répétition : le boss n'affiche ni 74, ni 12,4, ni 48.
    const epreuves = src.slice(src.indexOf('const EPREUVES'), src.indexOf('export default'));
    for (const interdit of ['74', '12,4', '16,4', '62 €', '48 €']) {
      expect(epreuves.includes(interdit), `le boss rejoue « ${interdit} »`).toBe(false);
    }
  });

  it('l’arithmétique de chaque épreuve numérique est exacte', () => {
    expect(320 / 8).toBe(40);                 // e1
    expect(48 / 4).toBe(12);                  // e2 — Nina
    expect(Math.round(45 / 2.2)).toBe(20);    // e3 — une vingtaine
    expect(2 * -5).toBeLessThan(-5);          // e6 — le double d'un négatif
    for (const n of [0, 1, 5, -3]) {          // e7 — le second programme
      expect((5 * n + 10) / 5 - n).toBe(2);
    }
    expect(130 / 12).toBeCloseTo(10.833, 3);  // e10
    expect(Math.ceil(130 / 12)).toBe(11);
  });
});

/* ═══ LA CONFIGURATION ═════════════════════════════════════════════════ */
describe('La configuration tient ses promesses', () => {
  it('la somme des durées vaut la durée annoncée, et reste ≤ 90 min', () => {
    const somme = LESSON_CONFIG.modules.reduce((s, m) => s + m.estimatedMin, 0);
    expect(somme).toBe(LESSON_CONFIG.estimatedDurationMin);
    expect(somme).toBeLessThanOrEqual(90);
  });

  it('les stages suivent l’ordre du parcours', () => {
    const ordre = ['prerequisite_check', 'trigger', 'discovery', 'manipulation', 'practice_lab', 'evaluation'];
    const rangs = LESSON_CONFIG.modules.map((m) => ordre.indexOf(m.stage));
    expect(rangs.every((r) => r >= 0)).toBe(true);
    for (let i = 1; i < rangs.length; i += 1) expect(rangs[i]).toBeGreaterThanOrEqual(rangs[i - 1]);
  });

  it('la continuité est déclarée null, avec sa raison en commentaire', () => {
    expect(LESSON_CONFIG.continuity).toBeNull();
    expect(lire('lesson.config.js')).toMatch(/CONTINUITÉ : aucune, et c'est un CHOIX/);
  });

  it('les couleurs des modules sont dans la palette autorisée', () => {
    const PALETTE = ['emerald', 'indigo', 'violet', 'blue', 'sky', 'purple', 'cyan', 'rose', 'amber', 'slate', 'teal'];
    for (const m of LESSON_CONFIG.modules) expect(PALETTE, m.id).toContain(m.color);
  });

  it('chaque brique posée par un module existe dans knowledge.jsx', () => {
    const declares = new Set(
      Object.values(LESSON_KNOWLEDGE.modules).flat().map((i) => i.id)
    );
    for (const { nom, src } of MODULES) {
      for (const m of src.matchAll(/<KnowledgeBrick\s+id="([^"]+)"/g)) {
        expect(declares.has(m[1]), `${nom} pose « ${m[1]} », absent de knowledge.jsx`).toBe(true);
      }
    }
  });

  it('chaque connaissance déclarée est posée par une brique DANS un module', () => {
    // Une connaissance qui n'apparaît que dans la carte n'a jamais été
    // enseignée : c'est la faute que l'audit appelle W_ITEM_WITHOUT_BRICK.
    const poses = new Set(
      MODULES.flatMap(({ src }) => [...src.matchAll(/<KnowledgeBrick\s+id="([^"]+)"/g)].map((m) => m[1]))
    );
    for (const [num, items] of Object.entries(LESSON_KNOWLEDGE.modules)) {
      for (const it of items) expect(poses.has(it.id), `M${num} : « ${it.id} » n’est posé nulle part`).toBe(true);
    }
  });

  it('aucun module ne fige un laboratoire après validation (disabled={done})', () => {
    // On lit le CODE, pas les commentaires — dont certains citent le motif
    // interdit pour expliquer précisément pourquoi il est interdit.
    for (const { nom, src } of MODULES) {
      const code = src
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      expect(code, `${nom} : un labo est gelé après validation`).not.toMatch(/disabled=\{\s*\w*[Dd]one/);
    }
  });

  it('aucune question ne conditionne sa progression à la justesse (if (ok))', () => {
    for (const { nom, src } of MODULES) {
      expect(src, `${nom} : progression bloquante`).not.toMatch(/onAnswered=\{\s*\(?\s*ok\s*\)?\s*=>\s*\{?\s*if\s*\(/);
    }
  });

  it('les deux laboratoires bornent leur saisie', () => {
    expect(N_MIN).toBeLessThan(0);
    expect(N_MAX).toBeGreaterThan(100);
    expect(V_MIN).toBeLessThan(0);
    expect(V_MAX).toBeGreaterThan(100);
  });
});
