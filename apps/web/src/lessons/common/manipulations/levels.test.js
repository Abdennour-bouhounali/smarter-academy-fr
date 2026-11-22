import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { MANIPULATION_TYPE_IDS, MANIPULATION_TYPES } from '@smarter-academy/core/curriculum/manipulationTypes.js';
import * as linearSystem from '@smarter-academy/core/arithmetic/linearSystem.js';
import * as Lin from '@smarter-academy/core/arithmetic/linear.js';
import * as levelsModule from './levels';
import { LEVELS, levelsFor, levelMatching, resolveManipulationLevels } from './levels';
import { STORIES } from './logic/storyBars';

/**
 * Le contrat À DEUX NIVEAUX de chaque manipulation (MANIPULATION_CONTRACT §7).
 * Un type ajouté au registre sans sa paire { beginner, advanced } échoue ici.
 */
describe('niveaux de manipulation — beginner / advanced, rien d’autre', () => {
  it('chaque type du registre a EXACTEMENT les deux niveaux', () => {
    for (const type of MANIPULATION_TYPE_IDS) {
      expect(Object.keys(LEVELS[type] ?? {}), type).toEqual(['beginner', 'advanced']);
    }
    expect(Object.keys(LEVELS).sort()).toEqual([...MANIPULATION_TYPE_IDS].sort());
  });

  it('l’ancienne échelle à quatre paliers n’existe plus', () => {
    expect(levelsModule.LEVEL_KEYS).toBeUndefined();
    const manipulation = JSON.parse(readFileSync(new URL('../../../i18n/locales/ar/lesson.manipulation.json', import.meta.url), 'utf8'));
    expect(manipulation.levels).toBeUndefined();
    expect(Object.keys(manipulation.level)).toEqual(expect.arrayContaining(['label', 'beginner', 'advanced', 'practiceTitle']));
  });

  it('les deux niveaux diffèrent, l’avancé demande plus, et cite le manuel', () => {
    for (const type of MANIPULATION_TYPE_IDS) {
      const { beginner, advanced } = LEVELS[type];
      expect(advanced.numbers, type).not.toEqual(beginner.numbers);
      // Une expression algébrique (unité 3, `expr: '3x-1|3+x'`) se mesure par son
      // nombre de termes plus sa plus haute puissance : plus de zones à porter,
      // ou des carrés à faire apparaître, c'est une demande plus lourde.
      const algebraic = (e) => (e.match(/[^+\-|]+/g) ?? []).length + Math.max(1, ...[...e.matchAll(/\^(\d)/g)].map((m) => Number(m[1])));
      // Une jumla (unité 5, `system: '2x+y=7|3x-2y=4,2'`) se mesure par ce qu'elle demande à la main :
      // coefficients autres que ±1 après réduction, parenthèses à développer, décimaux, solution non
      // entière, et la taille des constantes (chiffres de la plus grande).
      const jumla = (v) => {
        const sys = linearSystem.system(...v.split('|'));
        const nonUnit = sys.flatMap((e) => [e.a, e.b]).filter((c) => Math.abs(c.n) !== c.d).length;
        const sol = linearSystem.classify(sys);
        const fractional = sol.kind === 'unique' && (sol.x.d !== 1 || sol.y.d !== 1) ? 1 : 0;
        const digits = Math.max(...sys.map((e) => String(Math.abs(Math.round(e.c.n / e.c.d))).length));
        return nonUnit + (v.match(/\(/g) ?? []).length + (v.match(/,/g) ?? []).length + fractional + digits;
      };
      const scalar = (v) => (typeof v !== 'string' ? v : v.includes('=') && v.includes('|') ? jumla(v) : algebraic(v));
      // Unité 10 : des listes et des objets (angles du tableau, cibles { ratio, value: '7/3' }) se mesurent par leurs
      // feuilles ; À L'INTÉRIEUR d'eux, un rapport écrit « 7/3 » ou « 0,52 » vaut le plus grand de ses entiers.
      const nested = (v) => (Array.isArray(v) ? Math.max(...v.map(nested))
        : v && typeof v === 'object' ? Math.max(...Object.values(v).map(nested))
          : typeof v === 'string' && /^\d+(?:[.,]\d+)?(?:\/\d+)?$/.test(v) ? Math.max(...v.split(/[/.,]/).map(Number))
            : scalar(v));
      const size = (n) => Math.max(...Object.values(n).map((v) => (v && typeof v === 'object' ? nested(v) : scalar(v))));
      // Unité 2 de 1AM : une HISTOIRE (`story: 'act1'`) se mesure par son nombre d'items (logic/storyBars.js).
      if (type === 'story-bars') expect(STORIES[advanced.numbers.story].items.length, type).toBeGreaterThan(STORIES[beginner.numbers.story].items.length);
      // Unité 3 de 1AM : les critères (`digit-cards`) se mesurent par le nombre de DIVISEURS à juger (la table va jusqu'à 48,
      // les cartes ne portent que des chiffres : la taille des nombres ne dit pas la difficulté).
      else if (type === 'digit-cards') expect(advanced.numbers.divisors.length, type).toBeGreaterThan(beginner.numbers.divisors.length);
      // Unité 11 de 1AM : `tile-yard` change de MODE, pas de nombres — la corde (aires libres) demande plus que les carreaux déplacés (aire fixe).
      else if (type === 'tile-yard') expect(['fence', 'rope'].indexOf(advanced.numbers.mode), type).toBeGreaterThan(['fence', 'rope'].indexOf(beginner.numbers.mode));
      // Unité 5 de 3AM : `equality-lanes` se mesure par le NOMBRE D'OPÉRATIONS à enchaîner (4 tâches d'une opération, puis 3 tâches de 1 + 2 + 2).
      else if (type === 'equality-lanes') {
        const ops = (n) => n.tasks.flat().length;
        expect(ops(advanced.numbers), type).toBeGreaterThan(ops(beginner.numbers));
      }
      // Unité 5 de 3AM, leçon 2 : `loom-threads` se mesure par le NOMBRE D'ÉTAPES permis (متقدم seul : deux poutres), la BANDE transportée et la finesse du pas (1 puis 1/2).
      else if (type === 'loom-threads') {
        const stepsAllowed = (n) => Math.max(...n.tasks.map((tk) => tk.maxStages ?? 1));
        expect(stepsAllowed(advanced.numbers), type).toBeGreaterThan(stepsAllowed(beginner.numbers));
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'band'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'band'), type).toBe(false);
        expect(Lin.toNumber(Lin.parseNumber(advanced.numbers.step)), type).toBeLessThan(Lin.toNumber(Lin.parseNumber(beginner.numbers.step)));
      }
      // Unité 5 de 3AM, leçon 3 : `scoop-scale` se mesure par la FINESSE du rang de l'écran (0,1 puis 0,01 pour les tâches principales) et par la tâche PIÈGE (متقدم seul : 2/7 jamais atteint).
      else if (type === 'scoop-scale') {
        const rankOf = (n) => Math.max(...n.tasks.filter((tk) => tk.kind !== 'trap').map((tk) => tk.rank));
        expect(rankOf(advanced.numbers), type).toBeGreaterThan(rankOf(beginner.numbers));
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'trap'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'trap'), type).toBe(false);
      }
      // Unité 2 de 2AM, leçon 9 : `level-laser` se mesure par la PRÉDICTION voilée (متقدم seul) et par le nombre de RÉSERVOIRS (trois à ordonner, متقدم seul).
      else if (type === 'level-laser') {
        expect(advanced.numbers.tasks.every((tk) => tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict), type).toBe(false);
        expect(Math.max(...advanced.numbers.tasks.map((tk) => tk.tanks.length)), type).toBeGreaterThan(Math.max(...beginner.numbers.tasks.map((tk) => tk.tanks.length)));
      }
      // Unité 4 de 2AM, leçon 1 : `wax-cells` se mesure par la PRÉDICTION (compteur caché, متقدم seul) et par la BANDE de deux rangs et les DEUX LETTRES (متقدم seul).
      else if (type === 'wax-cells') {
        expect(advanced.numbers.tasks.every((tk) => tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => tk.strip) && advanced.numbers.tasks.some((tk) => tk.kind === 'two'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.strip || tk.kind === 'two'), type).toBe(false);
      }
      // Unité 4 de 2AM, leçon 2 : `juice-line` se mesure par la MAIN (مبتدئ : le moule, deux essais ; متقدم : le réservoir, le dividende manquant) et par le REPORT `carry` (متقدم seul).
      else if (type === 'juice-line') {
        expect(beginner.numbers.tasks.every((tk) => tk.kind === 'mould' && tk.tests === 2), type).toBe(true);
        expect(advanced.numbers.tasks.every((tk) => tk.kind === 'tank'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.carry > 0) && !beginner.numbers.tasks.some((tk) => tk.carry), type).toBe(true);
      }
      // Unité 4 de 2AM, leçon 3 : `bridge-load` se mesure par la PRÉDICTION de l'écran masqué (متقدم seul), les AFFIRMATIONS à réfuter (متقدم seul) et le signe ≤ (متقدم seul).
      else if (type === 'bridge-load') {
        expect(beginner.numbers.tasks.some((tk) => tk.predict || tk.kind === 'claim'), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => tk.predict) && advanced.numbers.tasks.some((tk) => tk.kind === 'claim'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => /<=|≤/.test(tk.rule)) && !beginner.numbers.tasks.some((tk) => /<=|≤/.test(tk.rule)), type).toBe(true);
      }
      // Unité 1 de 1AM, leçon 3 : `jump-tape` se mesure par l'UNITÉ étirée par la main puis le drapeau planté (مبتدئ seul : `plant`) et par la LECTURE d'un drapeau déjà planté, exacte ou par encadrement (متقدم seul : `read`, fenêtre sans origine, centièmes).
      else if (type === 'jump-tape') {
        expect(beginner.numbers.tasks.every((tk) => tk.kind === 'plant') && advanced.numbers.tasks.every((tk) => tk.kind === 'read'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.unit === 'free'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.from !== '0') && advanced.numbers.tasks.some((tk) => tk.step === '0,1'), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => tk.from === '0' && tk.step === '1'), type).toBe(true);
      }
      // Unité 5 de 1AM, leçon 1 : `frost-gauge` se mesure par le NIVEAU tenu et enregistré lecture par lecture (`set`, `mirror` pour l'ombre/l'opposé au niveau مبتدئ) puis la paire à même distance du zéro, les étages et la distance à la mer (`pair`/`set` au niveau متقدم).
      else if (type === 'frost-gauge') {
        const kinds = (lv) => lv.numbers.tasks.map((tk) => tk.kind);
        expect(kinds(beginner).includes('mirror') && !kinds(beginner).includes('pair'), type).toBe(true);
        expect(kinds(advanced).includes('pair') && advanced.numbers.tasks.some((tk) => tk.scene === 'floors'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.scene === 'altitude') && beginner.numbers.tasks.some((tk) => tk.reads.some((r) => r === 0 || r.self === 0)), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => /^b\d$/.test(tk.id)) && advanced.numbers.tasks.every((tk) => /^a\d$/.test(tk.id)), type).toBe(true);
      }
      // Unité 6 de 1AM, leçon 2 : `letter-dial` se mesure par la VALEUR du cadran qui tombe dans chaque fente : مبتدئ = une lettre (une valeur donnée, une valeur à trouver, une lettre écrite deux fois), متقدم = deux lettres puis une prétendue règle réfutée par un contre-exemple.
      else if (type === 'letter-dial') {
        const kinds = (lv) => lv.numbers.tasks.map((tk) => tk.kind);
        expect(kinds(beginner), type).toEqual(['set', 'find', 'set']);
        expect(beginner.numbers.tasks.every((tk) => Object.keys(tk.dials).length === 1), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => (tk.formula.match(/n/g) ?? []).length === 2), type).toBe(true);
        expect(kinds(advanced).includes('claim') && advanced.numbers.tasks.some((tk) => Object.keys(tk.dials).length === 2), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => /^b\d$/.test(tk.id)) && advanced.numbers.tasks.every((tk) => /^a\d$/.test(tk.id)), type).toBe(true);
      }
      // Unité 6 de 1AM, leçon 1 : `rewind-belt` se mesure par la CARTE choisie à rebours puis la contre-épreuve : مبتدئ = entiers (somme, différence, produit, carte piège « a − »), متقدم = décimaux et un quotient qui ne s'arrête pas.
      else if (type === 'rewind-belt') {
        const kinds = (lv) => lv.numbers.tasks.map((tk) => tk.kind);
        expect(kinds(beginner).includes('rsub') && kinds(beginner).includes('mul') && kinds(beginner).includes('add'), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => /^\d+$/.test(tk.a) && /^\d+$/.test(tk.out)), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.a.includes(',')) && advanced.numbers.tasks.some((tk) => tk.kind === 'mul' && Number(tk.out) % Number(tk.a) !== 0), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => /^b\d$/.test(tk.id)) && advanced.numbers.tasks.every((tk) => /^a\d$/.test(tk.id)), type).toBe(true);
      }
      // Unité 5 de 1AM, leçon 2 : `stride-stamp` se mesure par la FOULÉE portée des deux côtés et enregistrée lecture par lecture (`stamp`, `twin`, `place` au niveau مبتدئ) puis le drapeau de l'origine sur une droite à origine cachée et l'encadrement entre deux ticks (`origin`, `bound` au niveau متقدم).
      else if (type === 'stride-stamp') {
        const kinds = (lv) => lv.numbers.tasks.map((tk) => tk.kind);
        expect(['stamp', 'twin', 'place'].every((x) => kinds(beginner).includes(x)) && !kinds(beginner).includes('origin'), type).toBe(true);
        expect(['origin', 'bound'].every((x) => kinds(advanced).includes(x)), type).toBe(true);
        expect(beginner.numbers.tasks.find((tk) => tk.kind === 'stamp').stride, type).toBe(2); // la foulée longue : la route s'arrête avant −3
        expect(beginner.numbers.tasks.find((tk) => tk.kind === 'place').reads.map((r) => r.x), type).toEqual([-30, 27, -15]);
        expect(beginner.numbers.tasks.every((tk) => /^b\d$/.test(tk.id)) && advanced.numbers.tasks.every((tk) => /^a\d$/.test(tk.id)), type).toBe(true);
      }
      // Unité 5 de 1AM, leçon 3 : `courtyard-drone` se mesure par l'ORDRE des deux nombres (le lieu échangé est un autre lieu), les points d'un axe (une coordonnée nulle) et la lecture d'un couple : مبتدئ = `fly` sur papier quadrillé puis `read`, entiers ; متقدم = demi-cases et papier SANS carreaux.
      else if (type === 'courtyard-drone') {
        const kinds = (lv) => lv.numbers.tasks.map((tk) => tk.kind);
        expect(kinds(beginner).includes('fly') && kinds(beginner).includes('read'), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => tk.paper === 'squared' && tk.reads.every((r) => r.x % 10 === 0 && r.y % 10 === 0)), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.reads.some((r) => r.y === 0)) && beginner.numbers.tasks.some((tk) => tk.reads.some((r) => r.x === 0)), type).toBe(true); // deux points d'un axe
        expect(beginner.numbers.tasks[0].reads[0], type).toMatchObject({ x: 30, y: -20 }); // la fontaine (3 ; −2) : l'échangé est (−2 ; 3)
        expect(advanced.numbers.tasks.some((tk) => tk.paper === 'plain') && advanced.numbers.tasks.some((tk) => tk.reads.some((r) => r.x % 10 !== 0 || r.y % 10 !== 0)), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => /^b\d$/.test(tk.id)) && advanced.numbers.tasks.every((tk) => /^a\d$/.test(tk.id)), type).toBe(true);
      }
      // Unité 2 de 2AM, leçon 8 : `window-blinds` se mesure par la PRÉDICTION écrite avant de tirer (متقدم seul) et par les FACTEURS > 1 (متقدم seul).
      else if (type === 'window-blinds') {
        const val = (f) => { const [n, d] = f.split('/').map(Number); return n / d; };
        const big = (tk) => val(tk.curtain) > 1 || val(tk.blind) > 1;
        expect(advanced.numbers.tasks.every((tk) => tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict), type).toBe(false);
        expect(advanced.numbers.tasks.every(big), type).toBe(true);
        expect(beginner.numbers.tasks.some(big), type).toBe(false);
      }
      // Unité 2 de 2AM, leçon 7 : `trail-odometer` se mesure par la PRÉDICTION écrite avant de marcher (متقدم seul) et par le CIRCUIT (a4).
      else if (type === 'trail-odometer') {
        expect(advanced.numbers.tasks.every((tk) => tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => tk.loop), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.loop), type).toBe(false);
      }
      // Unité 2 de 2AM, leçon 6 : `mooring-lines` se mesure par le DIVISEUR DÉCIMAL (متقدم : des cordes de 0,7 m, le ruban change d'unité) contre un diviseur naturel (مبتدئ : couper en b cordes).
      else if (type === 'mooring-lines') {
        expect(advanced.numbers.tasks.every((tk) => tk.kind === 'count' && tk.b.includes(',') || tk.kind === 'count'), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => tk.kind === 'share' && !tk.b.includes(',')), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.b.includes(',')), type).toBe(true);
      }
      // Unité 5 de 3AM : `term-ferry` se mesure par le NOMBRE DE TÂCHES (2 équations, puis 3 dont un coefficient négatif et un grand nombre).
      else if (type === 'term-ferry') expect(advanced.numbers.tasks.length, type).toBeGreaterThan(beginner.numbers.tasks.length);
      // Unité 3 de 2AM, leçon 5 : `balloon-ballast` se mesure par l'OPÉRATION (مبتدئ : sommes seules ; متقدم : différences seules, écrites AVANT d'exécuter).
      else if (type === 'balloon-ballast') {
        expect(beginner.numbers.tasks.every((tk) => tk.op === '+' && !tk.predict), type).toBe(true);
        expect(advanced.numbers.tasks.every((tk) => tk.op === '-' && tk.predict), type).toBe(true);
      }
      // Unité 3 de 2AM, leçon 6 : `tug-rope` se mesure par la PRÉDICTION écrite avant le coup de sifflet (متقدم seul), les DÉCIMAUX et le CROCHET réglé d'abord (متقدم seul).
      else if (type === 'tug-rope') {
        expect(advanced.numbers.tasks.every((tk) => tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => tk.chain.includes('[')) && !beginner.numbers.tasks.some((tk) => tk.chain.includes('[')), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.chain.includes(',')) && !beginner.numbers.tasks.some((tk) => tk.chain.includes(',')), type).toBe(true);
      }
      // Unité 3 de 2AM, leçon 1 : `corniche-ruler` se mesure par le GESTE (مبتدئ : l'origine — lire, déplacer, placer ; متقدم : la graduation, tâches `fit` seules) et par les décimaux.
      else if (type === 'corniche-ruler') {
        expect(advanced.numbers.tasks.every((tk) => tk.kind === 'fit'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'fit'), type).toBe(false);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'move') && beginner.numbers.tasks.some((tk) => tk.kind === 'opp'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.marks.some((m) => m.x.includes(','))), type).toBe(true);
      }
      // Unité 3 de 2AM, leçon 4 : `dig-grid` se mesure par le GESTE (مبتدئ : le piquet, tâches `stake` seules, dont une impossible ; متقدم : un point écrit, touché ou symétrique) et par les demi-mètres (متقدم).
      else if (type === 'dig-grid') {
        expect(beginner.numbers.tasks.every((tk) => tk.kind === 'stake'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.none), type).toBe(true);
        expect(advanced.numbers.tasks.every((tk) => tk.kind !== 'stake'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.targets?.some((g) => g.at.includes('.'))), type).toBe(true);
      }
      // Unité 3 de 2AM, leçon 5 : `gap-caliper` se mesure par la PRÉDICTION de l'ouverture écrite avant la vis (متقدم : tâches `predict` ou `swing`), les DÉCIMAUX (متقدم seul) et le compas serré sur la graine du HAUT.
      else if (type === 'gap-caliper') {
        expect(advanced.numbers.tasks.every((tk) => tk.predict || tk.kind === 'swing'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict || tk.kind === 'swing'), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => (tk.anchor + (tk.target ?? '')).includes('.')) && !beginner.numbers.tasks.some((tk) => (tk.anchor + tk.target).includes('.')), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.target !== undefined && Number(tk.anchor) > Number(tk.target)) && beginner.numbers.tasks.every((tk) => Number(tk.anchor) < Number(tk.target)), type).toBe(true);
      }
      // Unité 3 de 2AM : `zero-probe` se mesure par la FINESSE du pas (1 puis 0,1) et le nombre de décimales des nombres à juger.
      else if (type === 'zero-probe') {
        const decimals = (n) => Math.max(...n.tasks.flatMap((t) => [t.a, t.lo, t.hi].filter(Boolean)).map((v) => (String(v).split(',')[1] ?? '').length));
        expect(decimals(advanced.numbers), type).toBeGreaterThan(decimals(beginner.numbers));
      }
      // Unité 5 de 2AM : `fourth-gauges` se mesure par ce que la main doit FAIRE SANS VOIR : au niveau متقدم toutes les balances sont voilées
      // (le nombre se calcule avant de lâcher), il y a plus de tâches, des trous dans les quatre cases et un pas plus fin.
      else if (type === 'fourth-gauges') {
        const covered = (n) => n.tasks.filter((tk) => tk.covered).length;
        expect(covered(advanced.numbers), type).toBe(advanced.numbers.tasks.length);
        expect(covered(beginner.numbers), type).toBe(0);
        expect(advanced.numbers.tasks.length, type).toBeGreaterThan(beginner.numbers.tasks.length);
        expect(new Set(advanced.numbers.tasks.map((tk) => tk.hole)).size, type).toBeGreaterThan(new Set(beginner.numbers.tasks.map((tk) => tk.hole)).size);
      }
      // Unité 6 de 3AM : `hundred-grid` se mesure par le NOMBRE DE TÂCHES et par les sortes demandées (le taux et le stock entier se CHERCHENT).
      else if (type === 'hundred-grid') {
        expect(advanced.numbers.tasks.length, type).toBeGreaterThan(beginner.numbers.tasks.length);
        expect(new Set(advanced.numbers.tasks.map((tk) => tk.kind)).has('whole'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.carry), type).toBe(true);
      }
      // Unité 1 de 3AM : `elevator-reel` se mesure par la FINESSE du pas (1 puis 0,5), la PRÉDICTION (متقدم : la PREMIÈRE mission, avant tout geste ; مبتدئ :
      // après une première mission, 2026-10-27) et les missions où la main tient aussi la vitesse.
      else if (type === 'elevator-reel') {
        const stepOf = (n) => Number(String(n.step).replace(',', '.'));
        expect(stepOf(advanced.numbers), type).toBeLessThan(stepOf(beginner.numbers));
        expect(advanced.numbers.tasks[0].kind, type).toBe('predict');
        expect(beginner.numbers.tasks[0].kind ?? 'floor', type).toBe('floor');
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'both'), type).toBe(true);
      }
      // Unité 1 de 3AM, module 2 : `sign-machine` se mesure par la PRÉDICTION posée en premier (متقدم : avant tout geste) et par le signe de a à la main (`both`).
      else if (type === 'sign-machine') {
        expect(advanced.numbers.tasks[0].kind, type).toBe('predict');
        expect(beginner.numbers.tasks[0].kind, type).toBe('fill');
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'both'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'both'), type).toBe(false);
      }
      // Unité 1 de 2AM, leçon 1 : `tram-route` se mesure par l'ÉCRITURE de la chaîne (متقدم seul : plaques et puces à poser avant de tamponner) et par la PRÉDICTION écrite avant « انطلق ».
      else if (type === 'tram-route') {
        expect(advanced.numbers.tasks.every((tk) => tk.build && tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.build || tk.predict), type).toBe(false);
      }
      // Unité 1 de 2AM, leçon 2 : `coop-calculator` se mesure par la FRAPPE de toute la ligne (متقدم seul : `type`) contre l'insertion de parenthèses dans une ligne donnée (`insert`).
      else if (type === 'chain-cutter') {
        expect(beginner.numbers.tasks.every((tk) => tk.kind === 'cut'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'glue') && advanced.numbers.tasks.some((tk) => tk.hidden), type).toBe(true);
      }
      // Unité 1 de 2AM, leçon 4 : `kit-packer` se mesure par la PRÉDICTION du total écrite avant « وزّع » (متقدم seul) et par la FORME de la tâche (بطاقات verrouillées / nombre rond ± petit nombre / décimaux).
      else if (type === 'kit-packer') {
        expect(advanced.numbers.tasks.every((tk) => tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict), type).toBe(false);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'bags') && beginner.numbers.tasks.some((tk) => tk.op === '−'), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'split') && advanced.numbers.tasks.some((tk) => tk.unit === 'm'), type).toBe(true);
      }
      else if (type === 'coop-calculator') {
        expect(advanced.numbers.tasks.every((tk) => tk.kind === 'type' && !tk.pre), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => tk.kind === 'insert' && tk.pre), type).toBe(true);
      }
      // Unité 4 de 3AM, leçon 3 : `marble-run` se mesure par la PRÉDICTION écrite avant le lancement (متقدم seul) et par les DEUX lettres (r6).
      else if (type === 'marble-run') {
        expect(advanced.numbers.predict, type).toBe(true);
        expect(beginner.numbers.predict, type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => Object.keys(tk.target).length === 2), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => Object.keys(tk.target).length === 1), type).toBe(true);
      }
      // Unité 1 de 3AM, leçon 2 : `robot-track` se mesure par la PRÉDICTION écrite avant « شغّل » (متقدم seul) et par l'ORDRE à choisir.
      else if (type === 'robot-track') {
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'predict'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'predict' || tk.kind === 'repeat'), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => tk.at), type).toBe(true);
      }
      // Unité 1 de 3AM, leçon 3 : `code-lockers` se mesure par le SIGNE POSÉ AVANT les chiffres (« ثبّت », متقدم seul) et par le code DÉCIMAL.
      else if (type === 'code-lockers') {
        expect(advanced.numbers.tasks.every((tk) => tk.commit), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.commit), type).toBe(false);
        expect(advanced.numbers.tasks.every((tk) => tk.layout === 'dec'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.qFirst), type).toBe(true);
      }
      // Unité 2 de 3AM : `gear-crank` se mesure par le NOMBRE DE TÂCHES et par la PRÉDICTION écrite avant de partir (متقدم seul : manivelle bloquée, compteurs voilés).
      else if (type === 'gear-crank') {
        expect(advanced.numbers.tasks.length, type).toBeGreaterThan(beginner.numbers.tasks.length);
        expect(advanced.numbers.tasks.every((tk) => tk.predict), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.predict), type).toBe(false);
      }
      // Unité 2 de 3AM, leçon 2 : `shade-match` se mesure par le NOMBRE DE TÂCHES et par le VOILE du mesureur (متقدم seul).
      else if (type === 'shade-match') {
        expect(advanced.numbers.tasks.length, type).toBeGreaterThan(beginner.numbers.tasks.length);
        expect(advanced.numbers.tasks.every((tk) => tk.veil), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.veil), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => tk.kind === 'compare'), type).toBe(true);
      }
      // Unité 2 de 3AM, leçon 3 : `seed-rake` se mesure par le NOMBRE DE TÂCHES et par la PRÉDICTION écrite avant de semer (متقدم seul : râteau bloqué).
      else if (type === 'seed-rake') {
        expect(advanced.numbers.tasks.length, type).toBeGreaterThan(beginner.numbers.tasks.length);
        expect(advanced.numbers.tasks.every((tk) => tk.kind === 'predict'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'predict'), type).toBe(false);
      }
      // Unité 4 de 3AM, leçon 4 : `difference-meter` se mesure par le VOLET d'écriture (la différence se ÉCRIT avant de voir l'aiguille) et le RIDEAU (l'ordre se lit sur la différence seule) — متقدم seul.
      else if (type === 'difference-meter') {
        expect(advanced.numbers.tasks.filter((tk) => tk.write).length, type).toBeGreaterThanOrEqual(2);
        expect(advanced.numbers.tasks.some((tk) => tk.curtain), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.write || tk.curtain), type).toBe(false);
        expect(beginner.numbers.tasks.some((tk) => tk.mustSwap), type).toBe(true);
      }
      // Unité 3 de 3AM, leçon 1 : `ten-zoom` se mesure par la TALLY (les opérations écrites sous la plaque, مبتدئ seul), les cartes en NOMS / UNITÉS (متقدم seul) et la prédiction vers le PETIT.
      else if (type === 'ten-zoom') {
        expect(beginner.numbers.tally, type).toBe(true);
        expect(advanced.numbers.tally, type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => 'name' in tk.card || 'unit' in tk.card || 'km' in tk.card), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => 'dec' in tk.card), type).toBe(true);
        expect(advanced.numbers.tasks.filter((tk) => tk.predict).length, type).toBeGreaterThanOrEqual(1);
        expect(advanced.numbers.tasks.some((tk) => tk.target <= -7), type).toBe(true);
      }
      // Unité 3 de 3AM, leçon 2 : `unit-ladder` se mesure par le MODE CHOISI (متقدم seul), le facteur écrit le long du ruban (مبتدئ seul) et le ruban enchaîné.
      else if (type === 'unit-ladder') {
        expect(beginner.numbers.fixedMode, type).toBe(true);
        expect(advanced.numbers.fixedMode, type).toBe(false);
        expect(beginner.numbers.showFactor, type).toBe(true);
        expect(advanced.numbers.showFactor, type).toBe(false);
        expect(beginner.numbers.tasks.every((tk) => tk.mode === 1), type).toBe(true);
        expect(advanced.numbers.tasks.every((tk) => tk.mode > 1), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.path.length === 3), type).toBe(true);
        expect(advanced.numbers.tasks.some((tk) => tk.path.at(-1) === 'm' && tk.path[0] === 'mm'), type).toBe(true);
      }
      // Unité 3 de 3AM, leçon 3 : `size-ladder` se mesure par la SAISIE de a et n avant de suspendre (متقدم seul) et par les écritures qui ne sont pas des décimales simples (k × 10ᵖ, km).
      else if (type === 'size-ladder') {
        expect(advanced.numbers.tasks.filter((tk) => tk.cards.every((c) => c.typed || tk.kind === 'compare')).length, type).toBeGreaterThanOrEqual(3);
        expect(beginner.numbers.tasks.some((tk) => tk.cards.some((c) => c.typed)), type).toBe(false);
        expect(advanced.numbers.tasks.some((tk) => tk.cards.some((c) => c.unit === 'km' || /×/.test(c.given))), type).toBe(true);
        expect(beginner.numbers.tasks.every((tk) => tk.cards.every((c) => !c.unit && !/×/.test(c.given))), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'compare') && advanced.numbers.tasks.some((tk) => tk.kind === 'compare'), type).toBe(true);
      }
      // Unité 2 de 3AM, leçon 5 : `merge-board` se mesure par le NOMBRE DE TÂCHES et par les BARRES CACHÉES (متقدم seul).
      else if (type === 'merge-board') {
        expect(advanced.numbers.tasks.length, type).toBeGreaterThanOrEqual(beginner.numbers.tasks.length);
        expect(advanced.numbers.tasks.every((tk) => tk.hidden === true), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.hidden), type).toBe(false);
      }
      // Unité 2 de 3AM, leçon 4 : `number-line-pegs` se mesure par le NOMBRE DE TÂCHES et par le VERDICT D'ORDRE (متقدم seul : toutes les cartes, puis un seul « تحقّق »).
      else if (type === 'number-line-pegs') {
        expect(advanced.numbers.tasks.length, type).toBeGreaterThanOrEqual(beginner.numbers.tasks.length);
        expect(advanced.numbers.tasks.every((tk) => tk.kind === 'order'), type).toBe(true);
        expect(beginner.numbers.tasks.some((tk) => tk.kind === 'order'), type).toBe(false);
      }
      // Unité 6 de 3AM : `pin-rails` se mesure par le NOMBRE DE TÂCHES et par les LECTURES sur la droite (متقدم seul).
      else if (type === 'pin-rails') {
        expect(advanced.numbers.tasks.length, type).toBeGreaterThan(beginner.numbers.tasks.length);
        expect(advanced.numbers.tasks.filter((tk) => tk.mode === 'read').length, type).toBeGreaterThan(beginner.numbers.tasks.filter((tk) => tk.mode === 'read').length);
      }
      // Unité 4 de 3AM : `area-split` se mesure par le NOMBRE DE PARCELLES à décider (côté constant : 2 parcelles ; deux côtés à deux termes : 4,
      // dont le coin ôté deux fois) et par le nombre de coupures à faire.
      else if (type === 'area-split') {
        const pieces = (n) => Math.max(...n.tasks.map((tk) => [tk.h, tk.w].reduce((a, sd) => a * ((sd.m ? 1 : 0) + (sd.n ? 1 : 0)), 1)));
        expect(pieces(advanced.numbers), type).toBeGreaterThan(pieces(beginner.numbers));
        expect(advanced.numbers.world, type).toBe('plot');
      }
      else expect(size(advanced.numbers), type).toBeGreaterThan(size(beginner.numbers));
      expect(advanced.source, type).toBe('textbook');
      expect(typeof advanced.ref, type).toBe('string');
      expect(['textbook', 'platform'], type).toContain(beginner.source);
    }
  });

  it('les nombres des niveaux respectent les bornes du registre', () => {
    for (const type of MANIPULATION_TYPE_IDS) {
      const bounds = MANIPULATION_TYPES[type].controls?.changeNumbers;
      if (!bounds) continue;
      for (const id of ['beginner', 'advanced']) {
        for (const [k, v] of Object.entries(LEVELS[type][id].numbers)) {
          if (!Array.isArray(bounds[k]) || v === 0) continue;
          expect(v, `${type}.${id}.${k}`).toBeGreaterThanOrEqual(bounds[k][0]);
          expect(v, `${type}.${id}.${k}`).toBeLessThanOrEqual(bounds[k][1]);
        }
      }
    }
  });

  it('la réglette des livres contient les marques du manuel, et le niveau avancé n’en propose pas d’autres', () => {
    for (const id of ['beginner', 'advanced']) {
      const lv = LEVELS['divisor-explorer-books'][id];
      expect(lv.range.min).toBeLessThan(lv.range.max);
      for (const m of lv.marks) expect(m >= lv.range.min && m <= lv.range.max, `${id} ${m}`).toBe(true);
      expect(lv.candidates, id).toBeUndefined();
    }
    expect(LEVELS['divisor-explorer-books'].advanced.marks).toEqual([26, 28]);
  });

  it('levelMatching reconnaît un niveau par ses nombres', () => {
    expect(levelMatching('coprime-explorer', { a: 27, b: 36 })).toBe('advanced');
    expect(levelMatching('coprime-explorer', { a: 17, b: 18 })).toBe('beginner');
    expect(levelMatching('coprime-explorer', { a: 22, b: 15 })).toBeNull();
    expect(levelsFor('inconnu')).toBeNull();
  });
});

describe('resolveManipulationLevels — les nombres de la leçon sont toujours un des deux niveaux', () => {
  it('des nombres propres à la leçon deviennent le niveau débutant', () => {
    const r = resolveManipulationLevels('common-divisors', { a: 28, b: 42 });
    expect(r.initial).toBe('beginner');
    expect(r.levels.beginner).toMatchObject({ numbers: { a: 28, b: 42 }, authored: true, source: 'lesson' });
    expect(r.levels.advanced.numbers).toEqual({ a: 65, b: 78 });
  });

  it('des nombres égaux au niveau avancé du type ouvrent sur l’avancé', () => {
    const r = resolveManipulationLevels('coprime-explorer', { a: 27, b: 36 });
    expect(r.initial).toBe('advanced');
    expect(r.levels.advanced).toMatchObject({ authored: true, source: 'textbook' });
    expect(r.levels.beginner.numbers).toEqual({ a: 17, b: 18 });
  });

  it('un niveau demandé l’emporte, un niveau inconnu retombe sur beginner', () => {
    expect(resolveManipulationLevels('factor-pairs', { n: 48 }, 'advanced').initial).toBe('advanced');
    expect(resolveManipulationLevels('factor-pairs', { n: 48 }, 'challenge').initial).toBe('beginner');
    expect(resolveManipulationLevels('inconnu', { n: 1 })).toBeNull();
  });
});
