/**
 * LES MOTS de l'atelier « Logique et raisonnement ».
 *
 * Une clé manquante ne casse rien : elle s'AFFICHE, telle quelle, en plein
 * milieu de l'écran — « tools.logic.proof.chooseProof » là où l'élève
 * attend une phrase. C'est un défaut que seule une capture d'écran
 * attrapait ; ce fichier l'attrape désormais avant.
 *
 * On ne vérifie pas une liste écrite à la main : on parcourt les PRÉRÉGLAGES
 * réels et on exige le mot de chacun. Ajouter un énoncé, une preuve ou un
 * sophisme sans sa traduction fait donc échouer la suite.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  STATEMENTS, COUNTEREXAMPLE_CHALLENGES, PROOFS, FALLACIES, FALLACY_KINDS,
} from './presets.js';
import { AREAS, VERDICTS, IMPLICATION_FORMS, PROOF_MODES, NEGATION_KINDS, MAX_PRACTICE_LEVEL } from './logicState.js';
import { CONNECTORS } from './logicMath.js';
import { CHALLENGE_KINDS, generateChallenge } from './practice.js';
import { DICTIONARY, DICTIONARY_GROUPS } from './dictionary.js';
import { INDUCTION_CASES, INDUCTION_SEQUENCES } from './presets.js';
import { SUPPORTED_GRAMMAR, UNSUPPORTED_NOTES } from './inductionLab.js';
import { INDUCTION_EXERCISES } from './inductionExercises.js';
import { FAILURES, RELATIONS } from './inductionModel.js';

const here = dirname(fileURLToPath(import.meta.url));
const catalog = JSON.parse(readFileSync(resolve(here, '../../../../i18n/locales/fr/mathlab.json'), 'utf8'));

const lookup = (key) => key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), catalog);
const exists = (key) => typeof lookup(key) === 'string' && lookup(key).length > 0;
const K = 'tools.logic';
const ARABIC = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/** Toutes les clés doivent exister ET ne pas être vides. */
function expectKeys(keys) {
  const missing = keys.filter((key) => !exists(key));
  expect(missing, `clés manquantes : ${missing.join(', ')}`).toEqual([]);
}

describe('l’instrument lui-même', () => {
  it('a son nom, sa description et ses libellés de document', () => {
    expectKeys([`${K}.name`, `${K}.description`, `${K}.new`, `${K}.defaultTitle`, `${K}.clearTitle`, `${K}.clearBody`]);
  });

  it('a les mots de sa coquille', () => {
    expectKeys([`${K}.cycle`, `${K}.areasLabel`, `${K}.panelHeading`, `${K}.panelShow`, `${K}.panelHide`, `${K}.canvasLabel`]);
  });

  it('nomme ses dix aires', () => {
    expectKeys(AREAS.map((area) => `${K}.areas.${area}`));
  });

  it('a les mots partagés par toutes les aires', () => {
    expectKeys([
      'predict', 'predictHint', 'reveal', 'test', 'tryValue', 'valueLabel', 'randomValue',
      'domain', 'excludedHint', 'true', 'false', 'undefined', 'tried', 'choosePreset',
      'sendToNotebook', 'sentToNotebook', 'openPractice', 'closePractice',
    ].map((key) => `${K}.common.${key}`));
  });

  it('nomme les trois verdicts', () => {
    expectKeys(VERDICTS.map((verdict) => `${K}.verdicts.${verdict}`));
  });
});

describe('chaque préréglage a ses mots', () => {
  it('les énoncés sans formule ont un texte', () => {
    expectKeys(STATEMENTS.filter((s) => !s.formula).map((s) => `${K}.statements.items.${s.id}`));
  });

  it('les défis de contre-exemple ont leur énoncé ET leurs indices', () => {
    expectKeys(COUNTEREXAMPLE_CHALLENGES.map((c) => `${K}.counterexample.claims.${c.id}`));
    expectKeys(COUNTEREXAMPLE_CHALLENGES.flatMap((c) => c.hintKeys ?? []));
  });

  it('chaque preuve a son titre, ses étapes et ses distracteurs expliqués', () => {
    expectKeys(PROOFS.map((p) => `${K}.proof.proofs.${p.id}.title`));
    expectKeys(PROOFS.flatMap((p) => p.steps.map((step) => `${K}.proof.proofs.${p.id}.${step.id}`)));
    // Les alternatives acceptées (§36) ont aussi leur texte.
    expectKeys(PROOFS.flatMap((p) => p.steps.flatMap((step) => (step.alternatives ?? []).map(
      (alt) => `${K}.proof.proofs.${p.id}.${alt}`,
    ))));
    // Un distracteur doit expliquer POURQUOI il est faux (§27).
    expectKeys(PROOFS.flatMap((p) => (p.distractors ?? []).map((d) => `${K}.proof.proofs.${p.id}.${d}`)));
    expectKeys(PROOFS.flatMap((p) => (p.distractors ?? []).map((d) => `${K}.proof.proofs.${p.id}.why.${d}`)));
  });

  it('chaque sophisme a son argument et son type nommé', () => {
    expectKeys(FALLACIES.map((f) => `${K}.fallacy.arguments.${f.id}`));
    expectKeys(FALLACY_KINDS.map((kind) => `${K}.fallacy.kinds.${kind}`));
    expectKeys(FALLACY_KINDS.map((kind) => `${K}.fallacy.kindHints.${kind}`));
  });
});

describe('chaque aire a les mots qu’elle affiche', () => {
  it('les énoncés', () => {
    expectKeys([
      'heading', 'lead', 'verdictQuestion', 'probeLabel', 'atValue',
      'isTrueHere', 'isFalseHere', 'dependsExplain', 'domainMatters',
    ].map((key) => `${K}.statements.${key}`));
  });

  it('les connecteurs — un nom et une lecture par connecteur', () => {
    expectKeys(['heading', 'lead', 'toggleP', 'toggleQ', 'resultLabel', 'tableCaption', 'currentRow']
      .map((key) => `${K}.connectors.${key}`));
    expectKeys(CONNECTORS.map((id) => `${K}.connectors.names.${id}`));
    expectKeys(CONNECTORS.map((id) => `${K}.connectors.readings.${id}`));
  });

  it('la conditionnelle — une étiquette et un rappel par forme', () => {
    expectKeys([
      'heading', 'lead', 'xLabel', 'criticalCase', 'vacuous', 'holds', 'fails',
      'formLabel', 'converseWarning', 'converseCounterexample', 'converseHolds',
      'contrapositiveSame', 'setsHeading', 'setsInside', 'setsOutside', 'showSets', 'hideSets',
    ].map((key) => `${K}.implication.${key}`));
    expectKeys(IMPLICATION_FORMS.map((form) => `${K}.implication.forms.${form}`));
    expectKeys(IMPLICATION_FORMS.map((form) => `${K}.implication.formHints.${form}`));
  });

  it('le tekafu', () => {
    expectKeys([
      'heading', 'lead', 'forward', 'backward', 'forwardHolds', 'backwardHolds',
      'forwardFails', 'backwardFails', 'bothHold', 'onlyOne', 'counterexample',
      'sharedRegion', 'pOnlyRegion', 'qOnlyRegion',
    ].map((key) => `${K}.equivalence.${key}`));
  });

  it('le contre-exemple', () => {
    expectKeys([
      'heading', 'lead', 'question', 'searchHint', 'found', 'foundExplain',
      'notCounterexample', 'outsideDomain', 'stillSearching', 'keepTrying',
    ].map((key) => `${K}.counterexample.${key}`));
  });

  it('les conditions', () => {
    expectKeys([
      'heading', 'lead', 'forwardQuestion', 'backwardQuestion', 'yes', 'no',
      'aSufficient', 'bNecessary', 'bNotSufficient', 'mapHeading',
    ].map((key) => `${K}.conditions.${key}`));
  });

  it('les quantificateurs — dont les phrases qui disent « ce n’est pas une preuve »', () => {
    expectKeys([
      'heading', 'lead', 'forallHint', 'existsHint', 'searchedCount',
      'noCounterexampleFound', 'notAProof', 'counterexampleFound',
      'witnessFound', 'noWitnessFound', 'proofNeeded',
    ].map((key) => `${K}.quantifiers.${key}`));
  });

  it('la négation — un libellé par genre de négation', () => {
    expectKeys(['heading', 'lead', 'deMorgan', 'quantifierNegation', 'left', 'right', 'sameColumn', 'keyIdea']
      .map((key) => `${K}.negation.${key}`));
    expectKeys(NEGATION_KINDS.map((kind) => `${K}.negation.kinds.${kind}`));
  });

  it('le constructeur de preuve — modes, rôles, erreurs, arbre', () => {
    expectKeys([
      'heading', 'lead', 'chooseProof', 'dragHint', 'available', 'chain', 'empty',
      'undo', 'resetChain', 'complete', 'completeExplain', 'strategyLabel',
      'gapQuestion', 'gapCorrect', 'gapWrong', 'anotherGap', 'treeHeading', 'treeHint',
    ].map((key) => `${K}.proof.${key}`));
    expectKeys(PROOF_MODES.map((mode) => `${K}.proof.modes.${mode}`));
    expectKeys(PROOF_MODES.map((mode) => `${K}.proof.modeHints.${mode}`));
    expectKeys(['given', 'observation', 'rule', 'conclusion', 'result'].map((role) => `${K}.proof.roles.${role}`));
    expectKeys([...new Set(PROOFS.map((p) => p.strategy))].map((s) => `${K}.proof.strategies.${s}`));
    expectKeys(['missingPrerequisite', 'missingNames', 'notInProof', 'alreadyPlaced', 'orderBreaksAt']
      .map((key) => `${K}.proof.errors.${key}`));
  });

  it('les sophismes', () => {
    expectKeys(['heading', 'lead', 'nameIt', 'refuteIt', 'named', 'refuted', 'bothDone',
      'namedOnly', 'refutedOnly', 'wrongName', 'wrongValue'].map((key) => `${K}.fallacy.${key}`));
  });

  it('chaque rôle déclaré par une étape a son mot', () => {
    const roles = new Set(PROOFS.flatMap((p) => p.steps.map((step) => step.role)));
    expectKeys([...roles].map((role) => `${K}.proof.roles.${role}`));
  });
});

describe('l’aire de la récurrence (§28)', () => {
  it('a ses mots, son principe et son piège', () => {
    expectKeys([
      'heading', 'lead', 'principle', 'principleText', 'whyBothNeeded', 'trap', 'trapText',
      'baseLabel', 'stepLabel', 'twoPathsHint', 'chooseProof', 'buildHeading', 'completeExplain',
      'stairsHeading', 'stairsCaption', 'casesHeading', 'casesLead', 'worksLabel', 'failsLabel', 'checkAt',
    ].map((key) => `${K}.induction.${key}`));
  });

  it('les trois états de l’escalier se disent', () => {
    expectKeys(['complete', 'noBase', 'broken'].map((state) => `${K}.induction.stairs.${state}`));
  });

  it('l’escalier qu’on monte a tous ses mots (§33)', () => {
    expectKeys([
      'invite', 'ruleHeading', 'chooseSequence', 'ruleLabel', 'examples',
      'entryType', 'entryBuild', 'showValues', 'hideValues', 'discoverHint',
      'currentHeading', 'readyToTest', 'writeRuleFirst', 'test', 'next', 'restart',
      'correct', 'incorrect', 'yourRule', 'yourResult', 'expected', 'why', 'whyText',
      'tryAdjust', 'stairsCaption', 'stairLabel', 'climbing', 'brokenTitle', 'brokenText',
      'brokenLesson', 'allGreen', 'notAProof', 'towardsInduction',
      'trySuggestions', 'grammarHeading', 'grammarUnsupported',
    ].map((key) => `${K}.induction.climb.${key}`));
  });

  it('chaque suite proposée a son libellé', () => {
    expectKeys(INDUCTION_SEQUENCES.map((s) => `${K}.induction.sequences.${s.id}`));
  });

  it('chaque état de marche se dit — le lecteur d’écran les annonce', () => {
    expectKeys(['untested', 'testing', 'correct', 'incorrect'].map((s) => `${K}.induction.status.${s}`));
  });

  it('chaque famille de la grammaire ANNONCÉE a son nom (§7)', () => {
    expectKeys(SUPPORTED_GRAMMAR.map((g) => `${K}.induction.climb.grammar.${g.id}`));
    expectKeys(UNSUPPORTED_NOTES.map((id) => `${K}.induction.climb.unsupported.${id}`));
  });

  it('chaque refus du moteur a une phrase, jamais un code technique (§9)', () => {
    expectKeys(['empty', 'syntax', 'unknownSymbol', 'incomplete', 'undefined', 'overflow']
      .map((code) => `${K}.induction.climb.errors.${code}`));
  });

  it('chaque exemple — qui marche ou qui échoue — a son énoncé ET son pourquoi', () => {
    expectKeys(INDUCTION_CASES.map((c) => `${K}.induction.cases.${c.id}.claim`));
    expectKeys(INDUCTION_CASES.map((c) => `${K}.induction.cases.${c.id}.why`));
  });
});

describe('l’entraînement : chaque question, chaque indice, chaque explication', () => {
  it('a les mots de son panneau', () => {
    expectKeys([
      'heading', 'score', 'levelLabel', 'check', 'hint', 'reveal', 'next', 'showInLab',
      'answerLabel', 'answerPlaceholder', 'correct', 'incorrect', 'unreadable',
      'retryFreely', 'answerIs', 'sameValue', 'differentValue', 'yes', 'no',
    ].map((key) => `${K}.practice.${key}`));
  });

  it('nomme ses quatre niveaux', () => {
    expectKeys(Array.from({ length: MAX_PRACTICE_LEVEL }, (_, i) => `${K}.practice.levels.${i + 1}`));
  });

  /**
   * L'épreuve qui compte : on GÉNÈRE des défis et on exige que chacun sache
   * s'écrire — sa question, tous ses indices, son explication. Un défi dont
   * l'explication manque afficherait « tools.logic.practice.e.… » à l'élève
   * au moment précis où il attend une réponse.
   */
  it('chaque défi tiré sait s’écrire en entier (400 graines)', () => {
    const missing = new Set();
    for (let seed = 1; seed <= 400; seed += 1) {
      const challenge = generateChallenge(seed);
      if (!exists(challenge.promptKey)) missing.add(challenge.promptKey);
      for (const hint of challenge.hintKeys) if (!exists(hint)) missing.add(hint);
      if (!exists(challenge.explainKey)) missing.add(challenge.explainKey);
      if (challenge.textKey && !exists(challenge.textKey)) missing.add(challenge.textKey);
    }
    expect([...missing], `clés manquantes : ${[...missing].join(', ')}`).toEqual([]);
  });

  it('chaque famille de défi est couverte par au moins une graine', () => {
    const seen = new Set();
    for (let seed = 1; seed <= 400; seed += 1) seen.add(generateChallenge(seed).kind);
    expect([...CHALLENGE_KINDS].filter((kind) => !seen.has(kind))).toEqual([]);
  });
});

/**
 * « Lexique des symboles » — l'instrument écrit de la notation (∀, ⇒, P, n,
 * V / F) ; le lexique est ce qui la rend lisible. Une entrée sans son nom ou sa lecture laisserait un symbole
 * inexpliqué, c'est-à-dire exactement le problème qu'il vient résoudre.
 */
describe('le dictionnaire des symboles', () => {
  it('a son titre, son introduction et sa note sur les lettres latines', () => {
    expectKeys([`${K}.dictionary.heading`, `${K}.dictionary.lead`, `${K}.dictionary.whyLatin`]);
  });

  it('nomme chacun de ses groupes', () => {
    expectKeys(DICTIONARY_GROUPS.map((group) => `${K}.dictionary.groups.${group}`));
  });

  it('chaque symbole a un NOM et une LECTURE en arabe', () => {
    expectKeys(DICTIONARY.map((entry) => `${K}.dictionary.entries.${entry.id}.name`));
    expectKeys(DICTIONARY.map((entry) => `${K}.dictionary.entries.${entry.id}.reading`));
  });

  it('chaque entrée appartient à un groupe déclaré', () => {
    const unknown = DICTIONARY.filter((entry) => !DICTIONARY_GROUPS.includes(entry.group));
    expect(unknown.map((e) => e.id)).toEqual([]);
  });

  it('couvre les symboles que l’instrument affiche vraiment', () => {
    const symbols = new Set(DICTIONARY.map((entry) => entry.symbol));
    for (const symbol of ['¬', '∧', '∨', '⇒', '⇔', '∀', '∃', '∈', 'ℝ', 'ℕ', 'P', 'Q', 'V', 'F']) {
      expect(symbols, `« ${symbol} » n’est pas au dictionnaire`).toContain(symbol);
    }
  });

  it('les noms et lectures sont des MOTS français (c’est là toute leur raison d’être)', () => {
    for (const entry of DICTIONARY) {
      for (const field of ['name', 'reading']) {
        const value = lookup(`${K}.dictionary.entries.${entry.id}.${field}`);
        // Un mot (pas seulement le symbole recopié) et aucune lettre arabe.
        expect(/[A-Za-zÀ-ÿ]{3,}/.test(value), `${entry.id}.${field} = ${value}`).toBe(true);
        expect(ARABIC.test(value), `${entry.id}.${field} = ${value}`).toBe(false);
      }
    }
  });
});

describe('les mots ne mentent pas sur la langue', () => {
  /**
   * L'interface est FRANÇAISE ; la notation (« P ⇒ Q », « n² = 2(2k²) »,
   * « {{solved}} / {{seen}} ») s'écrit telle quelle. Ce qui ne doit plus
   * jamais apparaître : une lettre arabe (une traduction oubliée), une marque
   * de direction invisible héritée de la mise en page arabe, un mot anglais
   * laissé en attente, une apostrophe droite ou une ponctuation haute collée.
   */
  const values = [];
  const walk = (node, path) => {
    if (typeof node === 'string') {
      values.push([path, node]);

      return;
    }
    if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
  };
  walk(catalog.tools.logic, 'tools.logic');
  const offending = (test) => values.filter(([, value]) => test(value)).map(([path, value]) => `${path} = ${value}`);

  it('le bloc a bien été parcouru', () => {
    expect(values.length).toBeGreaterThan(600);
  });

  it('aucune lettre arabe dans le bloc', () => {
    const found = offending((value) => ARABIC.test(value));
    expect(found, found.join(' | ')).toEqual([]);
  });

  it('aucune marque de direction invisible (LRM, RLM, isolats)', () => {
    const found = offending((value) => /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/.test(value));
    expect(found, found.join(' | ')).toEqual([]);
  });

  it('aucun mot anglais ni texte d’attente oublié', () => {
    const placeholder = /\b(the|and|of|is|are|with|not|true|false|TODO|FIXME|TBD|XXX|lorem|ipsum|translate|placeholder)\b/i;
    const found = offending((value) => placeholder.test(value.replace(/\{\{\w+\}\}/g, '')));
    expect(found, found.join(' | ')).toEqual([]);
  });

  it('chaque PHRASE est du français : elle contient un mot-outil français', () => {
    // Une phrase = au moins cinq mots de deux lettres ou plus ; la notation
    // pure (« P ⇒ Q », « ¬(P ∧ Q) ») n'en a pas et n'est pas concernée.
    const glue = /(^|[^A-Za-zÀ-ÿ])(le|la|les|l’|un|une|de|des|du|d’|est|et|ou|à|au|en|pour|par|sur|tu|ta|ton|tes|on|il|elle|si|ce|qui|que|ne|pas|se|sa|son|dans|avec|sans|ces|cette|sont)(?=[^A-Za-zÀ-ÿ]|$)/i;
    const found = offending((value) => {
      const words = value.replace(/\{\{\w+\}\}/g, '').match(/[A-Za-zÀ-ÿ’]{2,}/g) ?? [];

      return words.length >= 5 && !glue.test(value);
    });
    expect(found, found.join(' | ')).toEqual([]);
  });

  it('la typographie française : apostrophe courbe, espace fine avant ; ! ?', () => {
    const found = offending((value) => /[A-Za-zÀ-ÿ]'[A-Za-zÀ-ÿ]/.test(value) || /[A-Za-zÀ-ÿ]{2}[;!?]/.test(value) || / [;!?]/.test(value));
    expect(found, found.join(' | ')).toEqual([]);
  });

  it('aucune valeur vide', () => {
    const empty = [];
    const walk = (node, path) => {
      if (typeof node === 'string') {
        if (node.trim().length === 0) empty.push(path);

        return;
      }
      if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
    };
    walk(catalog.tools.logic, 'tools.logic');
    expect(empty, empty.join(' | ')).toEqual([]);
  });
});

/**
 * L'ESCALIER DES PROPOSITIONS — ses mots.
 *
 * Comme ailleurs dans ce fichier, on parcourt les EXERCICES réels : ajouter
 * un exercice sans son nom ni le texte de ses étapes fait échouer la
 * suite, au lieu d'afficher « tools.logic.induction.exercises.x.name » en
 * plein milieu de l'écran d'un élève.
 */
describe('l’escalier des propositions (récurrence)', () => {
  it('a les mots de son écran', () => {
    expectKeys([
      'heading', 'chooseExercise', 'toProve', 'tryAnother', 'useIt',
      'leftSide', 'relation', 'rightSide', 'available',
      'test', 'readyToTest', 'testing', 'values', 'therefore', 'stairsCaption',
      'announceCorrect', 'announceIncorrect', 'changedAnnounce', 'changed',
      'observed', 'notEnough', 'question', 'buildProof',
      'counterexample', 'failsBelow',
      'heredityHeading', 'heredityIntro', 'placed',
    ].map((key) => `${K}.induction.recurrence.${key}`));
  });

  // §25 — les quatre verdicts, dont les trois qui ne sont PAS une preuve.
  it('nomme les quatre verdicts de preuve', () => {
    expectKeys(['none', 'baseOnly', 'stepOnly', 'complete']
      .map((verdict) => `${K}.induction.recurrence.verdict.${verdict}`));
  });

  // §17 — aucun refus ne doit tomber sur une clé absente et montrer du code.
  it('a une phrase pour CHAQUE code de refus du moteur', () => {
    expectKeys([...FAILURES, 'empty', 'syntax', 'unknownSymbol', 'incomplete', 'relation']
      .map((code) => `${K}.induction.recurrence.errors.${code}`));
  });

  it('nomme chaque exercice livré', () => {
    expectKeys(INDUCTION_EXERCISES.map((e) => `${K}.induction.exercises.${e.id}.name`));
  });

  it('a le texte de CHAQUE maillon d’hérédité', () => {
    expectKeys(INDUCTION_EXERCISES.flatMap((exercise) => exercise.chain.map(
      (link) => `${K}.induction.exercises.${exercise.id}.steps.${link.id}`,
    )));
  });

  // Les relations sont des SYMBOLES : elles ne se traduisent pas, et ne
  // doivent surtout pas être cherchées dans le catalogue.
  it('garde les relations en symboles, hors du catalogue', () => {
    expect(RELATIONS.every((relation) => relation.length === 1)).toBe(true);
  });
});
