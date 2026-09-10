import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, '../..');
const read = (p) => readFileSync(resolve(srcRoot, p), 'utf8');

/**
 * « L'élève peut noter quand il veut, pas seulement s'il s'est trompé. »
 *
 * Le carnet était rendu à l'intérieur du bloc `{answered && …}` : tant que la
 * question n'était pas validée, aucun moyen d'écrire quoi que ce soit. Une
 * remarque vient pourtant souvent PENDANT la recherche, et l'élève qui a juste
 * a autant à noter que celui qui s'est trompé.
 */
describe('le carnet est atteignable à tout moment', () => {
  const session = read('pages/student/practice/PracticeSession.jsx');

  it('un NotebookButton est rendu hors du bloc « répondu »', () => {
    // On isole le bloc de correction (`{answered && (` … ) pour vérifier qu'il
    // reste AU MOINS un bouton en dehors de lui.
    const start = session.indexOf('{answered && (');
    expect(start).toBeGreaterThan(-1);
    const before = session.slice(0, start);
    expect(before).toMatch(/<NotebookButton/);
  });

  it('le déclencheur cohabite avec la validation, pas avec le verdict', () => {
    expect(session).toMatch(/\{!answered && <NotebookButton/);
  });

  it('le libellé de saisie ne présume pas d’une erreur', () => {
    const button = read('features/practice/NotebookButton.jsx');
    // « Ce que je dois retenir de cette question » cadrait la note comme un
    // constat d'échec.
    expect(button).not.toMatch(/Ce que je dois retenir/);
    expect(button).toMatch(/Ce que je veux retenir/);
  });

  it('le type d’erreur reste facultatif', () => {
    const button = read('features/practice/NotebookButton.jsx');
    // `mistakeType` part à null et n'est jamais exigé avant l'envoi : seul le
    // contenu conditionne l'enregistrement.
    expect(button).toMatch(/defaultType = null/);
    expect(button).toMatch(/disabled=\{!content\.trim\(\) \|\| busy\}/);
  });
});

describe('le carnet se parcourt par leçon dans Ma progression', () => {
  it('Ma progression monte le carnet', () => {
    expect(read('pages/student/Progression.jsx')).toMatch(/<NotebookBrowser\s*\/>/);
  });

  const browser = read('features/practice/NotebookBrowser.jsx');

  it('les notes sont groupées par leçon et titrées depuis le catalogue', () => {
    expect(browser).toMatch(/getLessonById/);
    expect(browser).toMatch(/note\.lessonCode \|\| '__sans_lecon__'/);
  });

  it('elles se présentent UNE PAR UNE, avec navigation', () => {
    expect(browser).toMatch(/Note \{index \+ 1\} \/ \{group\.notes\.length\}/);
    expect(browser).toMatch(/Précédente/);
    expect(browser).toMatch(/Suivante/);
  });

  it('chacune se modifie et se marque traitée — dans les deux sens', () => {
    expect(browser).toMatch(/Marquer comme traitée/);
    expect(browser).toMatch(/À revoir/);
    expect(browser).toMatch(/completed: !note\.isCompleted/);
    expect(browser).toMatch(/Modifier/);
  });

  it('une note sans leçon n’est pas perdue', () => {
    // Elle est rangée dans un groupe explicite plutôt que filtrée.
    expect(browser).toMatch(/Notes hors leçon/);
  });
});
