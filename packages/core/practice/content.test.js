import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateAnswer, OUTCOMES } from './answerEvaluator.js';

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

describe('contenu de pratique — contrat exécutable', () => {
  it('trouve les 15 exercices de référence', () => {
    expect(exercises.length).toBe(15);
  });

  it("l'évaluateur accepte la réponse attendue de CHAQUE question", () => {
    // La vérification la plus utile du lot : une réponse attendue que
    // l'évaluateur ne sait pas lire rendrait la question insoluble en
    // production, alors que le schéma la déclarerait valide.
    for (const { data } of exercises) {
      for (const q of data.questions) {
        const answer = q.answerType === 'choice'
          ? { choiceId: q.choices.find((c) => c.isCorrect).id }
          : q.answerType === 'multiChoice'
            ? { choiceIds: q.choices.filter((c) => c.isCorrect).map((c) => c.id) }
            : q.answerType === 'rational'
              ? { value: q.expectedAnswer }
              : q.expectedAnswer;

        const result = evaluateAnswer(answer, q);
        expect(result.isCorrect, `${data.id} · ${q.id} — la bonne réponse est refusée`).toBe(true);
      }
    }
  });

  it('chaque signature de misconception déclenche bien son diagnostic', () => {
    // Une signature qui ne se déclenche jamais est un retour pédagogique mort.
    for (const { data } of exercises) {
      for (const q of data.questions) {
        for (const sig of q.misconceptionSignatures ?? []) {
          const answer = q.answerType === 'rational' ? { value: sig.value } : sig.value;
          const result = evaluateAnswer(answer, q);
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

  it('la couverture minimale est atteinte : 3 exercices sur chacun des 5 niveaux', () => {
    const byLevel = {};
    for (const { data } of exercises) byLevel[data.level] = (byLevel[data.level] ?? 0) + 1;
    expect(byLevel).toEqual({ 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 });
  });

  it('chaque learning point de la leçon est primaire quelque part', () => {
    const primary = new Set();
    for (const { data } of exercises) {
      for (const q of data.questions) {
        for (const lp of q.learningPoints) if (lp.role === 'primary') primary.add(lp.code);
      }
    }
    for (let n = 1; n <= 11; n++) {
      expect(primary, `P${n} n'est primaire nulle part`).toContain(`seconde_fonction-affine-2nde_P${n}`);
    }
  });
});
