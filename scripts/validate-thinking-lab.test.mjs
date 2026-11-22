// Le validateur du « labo des énigmes » attrape-t-il vraiment ce qu'il prétend attraper ?
// Chaque cas part d'un défi témoin valide (#318, en français, scripts/__fixtures__/thinking-lab/ — la banque livrée est
// vide) et casse UNE règle.
import { describe, it, expect } from 'vitest';
import { fileURLToPath } from 'node:url';
import { readChallenges } from './build-thinking-lab-index.mjs';
import { validateThinkingLab, forbiddenIn, leaksAnswer, bandOf, mathCandidates } from './validate-thinking-lab.mjs';

const FIXTURES = fileURLToPath(new URL('./__fixtures__/thinking-lab/challenges', import.meta.url));
const base = readChallenges(FIXTURES).find((e) => e.file === '0318-four-arcs-area.json');
const clone = () => JSON.parse(JSON.stringify(base.data));
const run = (data, file = base.file) => validateThinkingLab([{ file, data }]).errors;

describe('validate-thinking-lab', () => {
  it('le défi témoin #318 passe', () => {
    expect(run(clone())).toEqual([]);
  });

  it('refuse un champ inconnu (schéma)', () => {
    const c = clone();
    c.answr = 1;
    expect(run(c).join('\n')).toMatch(/champ inconnu « answr »/);
  });

  it('refuse une réponse illisible', () => {
    const c = clone();
    c.answer.value = 'x^2*(1+';
    expect(run(c).join('\n')).toMatch(/answer/);
  });

  it('refuse une erreur déclarée qui est en fait juste', () => {
    const c = clone();
    c.mistakes[0] = { value: '1+pi/3-sqrt(3)', scaleWith: 'x^2', reply: 'Pas encore.' };
    expect(run(c).join('\n')).toMatch(/ACCEPTÉE/);
  });

  it('refuse une clé qui divulgue la réponse (valeur équivalente, autre écriture)', () => {
    const c = clone();
    c.keys[2].text = 'Réponse : x²(1 + π/3 − √3)';
    expect(run(c).join('\n')).toMatch(/keys\[2\].*divulgue/);
  });

  it('refuse une clé qui divulgue la réponse au milieu d’une phrase française, sans deux-points (plan §8bis)', () => {
    const c = clone();
    c.keys[2].text = 'Tu devrais trouver x²(1 + π/3 − √3) pour cette aire.';
    expect(run(c).join('\n')).toMatch(/keys\[2\].*divulgue/);
  });

  it('refuse une tranche qui ne suit pas le numéro, et un faux sommet', () => {
    const c = clone();
    c.band = 'middle';
    c.summit = true;
    const errors = run(c).join('\n');
    expect(errors).toMatch(/tranche « secondary »/);
    expect(errors).toMatch(/summit/);
  });

  it('refuse une longue relecture sans pause « Explique-toi »', () => {
    const c = clone();
    c.replay.forEach((s) => delete s.ask);
    expect(run(c).join('\n')).toMatch(/ask/);
  });

  it('refuse une phase inconnue', () => {
    const c = clone();
    c.keys[0].phase = 'X';
    expect(run(c).join('\n')).toMatch(/phase/);
  });

  it('refuse un nom de fichier qui ne suit pas NNNN-id.json', () => {
    expect(run(clone(), '318-four-arcs.json').join('\n')).toMatch(/0318-four-arcs-area\.json/);
  });

  it('refuse des numéros en double', () => {
    const errors = validateThinkingLab([{ file: base.file, data: clone() }, { file: base.file, data: clone() }]).errors.join('\n');
    expect(errors).toMatch(/déjà pris/);
  });

  it('refuse un mot interdit', () => {
    const c = clone();
    c.statement = 'A betting game: what is the chance of rolling 6 twice?';
    expect(run(c).join('\n')).toMatch(/mot interdit/);
  });

  it('vérifie chaque tuple de params', () => {
    const c = clone();
    c.params = { vars: { a: [2, 3] } };
    c.statement = 'Un carré a pour côté {a}x. Calcule l\'aire commune aux quatre arcs.';
    c.mistakes = c.mistakes.slice(0, 2);
    expect(run(c)).toEqual([]);
    c.keys[0].text = 'Connais-tu une formule pour l\'aire de {b} ?';
    expect(run(c).join('\n')).toMatch(/non rempli/);
  });
});

describe('aides', () => {
  it('mots interdits : mots entiers, élisions et majuscules comprises', () => {
    // Des mots qui en CONTIENNENT un interdit, ou qui lui ressemblent, passent.
    expect(forbiddenIn('Il y a vingt élèves.')).toBeNull();
    expect(forbiddenIn('Le train part de Paris à 8 h.')).toBeNull();
    expect(forbiddenIn('Une comparaison de deux porcelaines.')).toBeNull();
    expect(forbiddenIn('Le noeud du problème.')).toBeNull();
    // Élision, majuscule, pluriel.
    expect(forbiddenIn('Un litre d’alcool.')).toBe('alcool');
    expect(forbiddenIn("Le prix de l'Alcool.")).toBe('alcool');
    expect(forbiddenIn('Les cadeaux de Noël.')).toBe('noël');
    expect(forbiddenIn('Il veut parier 5 €.')).toBe('parier');
    expect(forbiddenIn('Les paris sportifs du week-end.')).toBe('paris sportifs');
    expect(forbiddenIn('On tire une carte d’un jeu de 32 cartes.')).toBe('jeu de 32 cartes');
    expect(forbiddenIn('🐷')).toBe('🐷');
    expect(forbiddenIn('🃏')).toBe('🃏');
  });

  it('un dé, une pièce, une urne, une roue sont des EXPÉRIENCES permises (plan §7bis)', () => {
    expect(forbiddenIn('On lance un dé équilibré à six faces.')).toBeNull();
    expect(forbiddenIn('On lance deux fois une pièce de monnaie.')).toBeNull();
    expect(forbiddenIn('Une urne contient 3 boules rouges.')).toBeNull();
    expect(forbiddenIn('On fait tourner une roue partagée en 8 secteurs.')).toBeNull();
    expect(forbiddenIn('🎲')).toBeNull();
    // Un taux d'intérêt est un contexte de pourcentages en France.
    expect(forbiddenIn('Un prêt à un taux d’intérêt de 2 %.')).toBeNull();
  });

  it('fuite par valeur pour un nombre, dans une phrase française', () => {
    expect(leaksAnswer('Multiplie 3/5 par 2/4.', { check: 'rational', value: '3/10' })).toBeNull();
    expect(leaksAnswer('Le résultat est 0,3.', { check: 'rational', value: '3/10' })).toBe('0,3');
    // « a » est ici le verbe : la valeur qui le suit est quand même lue.
    expect(leaksAnswer('Chaque part a 0,3 de l’aire.', { check: 'rational', value: '3/10' })).toBe('0,3');
  });

  it('les mots de prose ne sont pas des formules ; les variables isolées et les fonctions le sont', () => {
    const c = mathCandidates('Réponse : x²(1 + π/3 − √3)');
    expect(c).toContain('x²(1 + π/3 − √3)');
    expect(c.some((x) => /Réponse|ponse/.test(x))).toBe(false);
    expect(mathCandidates('Écris sqrt(2) puis compare.')).toContain('sqrt(2)');
  });

  it('tranches cachées', () => {
    expect([bandOf(1), bandOf(120), bandOf(121), bandOf(318), bandOf(500)]).toEqual(['primary', 'primary', 'middle', 'secondary', 'university']);
  });
});
