import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(resolve(here, 'Progression.jsx'), 'utf8');
const home = readFileSync(resolve(here, 'StudentHome.jsx'), 'utf8');

/**
 * « Ma progression » ne montre que la classe courante de l'élève.
 *
 * L'accueil de l'espace appelait déjà `getStudentActivity` avec `gradeId` ;
 * cette page ne le faisait pas, et les deux racontaient donc deux histoires
 * différentes du même parcours.
 *
 * Ce cadrage ne contredit pas ARCHITECTURE.md §10 : la mise en garde y vise
 * `getResumeLesson` — ce qu'on PROPOSE de faire — et non ce qu'un tableau de
 * bord AFFICHE. La progression reste indexée par leçon : changer de classe
 * n'efface rien, le travail réapparaît quand on y revient.
 */
describe('Ma progression est cadrée sur la classe de l’élève', () => {
  it('l’activité est demandée pour la classe courante', () => {
    expect(src).toMatch(/getStudentActivity\(\s*courseLevels,\s*gradeId \? \{ gradeId \} : undefined/);
  });

  it('la classe vient de AuthContext, pas d’un état local', () => {
    expect(src).toMatch(/const \{ user \} = useContext\(AuthContext\)/);
    expect(src).toMatch(/const gradeId = user\?\.grade \|\| null/);
  });

  it('la maîtrise est filtrée sur la même classe', () => {
    // Sinon le compteur « compétences maîtrisées » compterait des acquis
    // invisibles sur la page.
    expect(src).toMatch(/all\.filter\(\(g\) => g\.grade === gradeId\)/);
  });

  it('le cadrage est le même que celui de l’accueil de l’espace', () => {
    expect(home).toMatch(/getStudentActivity\(courseLevels, \{ gradeId: user\?\.grade \}\)/);
  });

  it('un élève sans classe voit tout, plutôt qu’une page vide', () => {
    // `gradeId ? … : undefined` — un compte neuf (grade null) n'est pas
    // enfermé dans un cadre qui n'existe pas encore.
    expect(src).toMatch(/gradeId \? \{ gradeId \} : undefined/);
    expect(src).toMatch(/gradeId \? all\.filter/);
  });

  it('l’interface annonce la classe affichée', () => {
    // Sans cela, un élève qui a travaillé ailleurs croirait ce travail perdu.
    expect(src).toMatch(/Ta classe de/);
    expect(src).toMatch(/Compétences maîtrisées \(\$\{gradeLabel\}\)/);
    expect(src).not.toMatch(/toutes leçons/);
  });
});
