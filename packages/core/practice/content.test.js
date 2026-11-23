import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateAnswer } from './answerEvaluator.js';
import { allCourseLevels } from '../curriculum/coursesData.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../content/practice');

function allExercises(dir = ROOT, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) allExercises(full, acc);
    else if (entry.name.endsWith('.json') && dir.includes('level-')) {
      acc.push({ file: full, data: JSON.parse(readFileSync(full, 'utf-8')) });
    }
  }
  return acc;
}

const exercises = allExercises();

/**
 * La forme de réponse qu'attend l'évaluateur pour ce type de question.
 *
 * Les types à CHAMP LIBRE (`rational`, `integerSet`, `affine`…) reçoivent
 * `{ value }` ; les choix reçoivent leur(s) identifiant(s). Centralisé ici
 * parce qu'une cascade de ternaires oubliait silencieusement chaque nouveau
 * type : une question correcte était alors déclarée « refusée ».
 */
const VALUE_TYPES = new Set(['rational', 'integerSet', 'factorization']);

function wrapValue(q, value) {
  return VALUE_TYPES.has(q.answerType) ? { value } : value;
}

function answerFor(q) {
  if (q.answerType === 'choice') return { choiceId: q.choices.find((c) => c.isCorrect).id };
  if (q.answerType === 'multiChoice') return { choiceIds: q.choices.filter((c) => c.isCorrect).map((c) => c.id) };
  // Auto-évaluation : pas de clé — l'élève déclare « حلّي مطابق ».
  if (q.answerType === 'selfCheck') return { selfMark: 'correct' };
  return wrapValue(q, q.expectedAnswer);
}

describe('contenu de pratique — contrat exécutable', () => {
  it("l'évaluateur accepte la réponse attendue de CHAQUE question", () => {
    // La vérification la plus utile du lot : une réponse attendue que
    // l'évaluateur ne sait pas lire rendrait la question insoluble en
    // production, alors que le schéma la déclarerait valide.
    for (const { data } of exercises) {
      for (const q of data.questions) {
        const result = evaluateAnswer(answerFor(q), q);
        expect(result.isCorrect, `${data.id} · ${q.id} — la bonne réponse est refusée`).toBe(true);
      }
    }
  });

  it('chaque signature de misconception déclenche bien son diagnostic', () => {
    // Une signature qui ne se déclenche jamais est un retour pédagogique mort.
    for (const { data } of exercises) {
      for (const q of data.questions) {
        for (const sig of q.misconceptionSignatures ?? []) {
          const result = evaluateAnswer(wrapValue(q, sig.value), q);
          expect(result.misconceptionId, `${data.id} · ${q.id} — signature ${sig.id} muette`).toBe(sig.id);
        }
      }
    }
  });

  it('les distracteurs de QCM ne sont jamais acceptés comme justes', () => {
    for (const { data } of exercises) {
      for (const q of data.questions) {
        if (q.answerType !== 'choice') continue;
        for (const wrong of q.choices.filter((c) => !c.isCorrect)) {
          expect(evaluateAnswer({ choiceId: wrong.id }, q).isCorrect).toBe(false);
        }
      }
    }
  });

  it('la couverture minimale est atteinte sur chacun des 5 niveaux', () => {
    // Le MINIMUM par niveau est une politique, pas une constante : les
    // leçons issues du manuel n'ont que les exercices que le manuel donne
    // (content/practice/policy.json le dit nommément, et
    // scripts/validate-exercises.mjs le fait respecter). Ici on vérifie
    // seulement qu'aucun niveau n'est VIDE — un niveau sans exercice serait
    // un cul-de-sac pour l'élève. Une banque entièrement vide (2026-11-22 :
    // aucune leçon n'existe encore) n'a pas de niveau à juger.
    if (exercises.length === 0) return;
    const byLevel = {};
    for (const { data } of exercises) byLevel[data.level] = (byLevel[data.level] ?? 0) + 1;
    for (const level of [1, 2, 3, 4, 5]) {
      expect(byLevel[level] ?? 0, `niveau ${level} sans aucun exercice`).toBeGreaterThan(0);
    }
  });

  it('chaque learning point d\'une leçon pratiquée est primaire quelque part', () => {
    // Généralisé le 2026-09-25 : ce test visait la seule leçon française qui
    // avait des exercices (fonction-affine-2nde, supprimée). La règle vaut
    // pour toute leçon qui a un dossier de pratique : aucun de ses points
    // d'apprentissage ne doit rester sans question qui le vise en premier.
    const primary = new Set();
    for (const { data } of exercises) {
      for (const q of data.questions) {
        for (const lp of q.learningPoints) if (lp.role === 'primary') primary.add(lp.code);
      }
    }
    const practised = allCourseLevels
      .flatMap((level) => level.grades.flatMap((grade) => grade.chapters.flatMap((c) => c.lessons.map((lesson) => ({ grade, lesson })))))
      .filter(({ grade, lesson }) => existsSync(join(ROOT, grade.id, lesson.id)));
    for (const { lesson } of practised) {
      for (const lp of lesson.learningPoints) {
        expect(primary, `${lp.id} n'est primaire nulle part`).toContain(lp.id);
      }
    }
  });
});
