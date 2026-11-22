import { describe, it, expect } from 'vitest';
import { isolateMathRuns, isolateOutsideMath } from './bidi';

const L = '⁦';
const P = '⁩';

describe('isolateMathRuns — une écriture mathématique en clair forme un bloc isolé', () => {
  it('isole le titre signalé « Fiche — 120 = 6 × 20 »', () => {
    expect(isolateMathRuns('Fiche — 120 = 6 × 20')).toBe(`Fiche — ${L}120 = 6 × 20${P}`);
  });

  it('isole une fraction, une soustraction, une division euclidienne', () => {
    expect(isolateMathRuns('Fiche — 28/42')).toBe(`Fiche — ${L}28/42${P}`);
    expect(isolateMathRuns('407 − 253 = 154')).toBe(`${L}407 − 253 = 154${P}`);
    expect(isolateMathRuns('65 = 56 × 1 + 9 donc')).toBe(`${L}65 = 56 × 1 + 9${P} donc`);
    expect(isolateMathRuns('Le nombre 7,5 = 15/2')).toBe(`Le nombre ${L}7,5 = 15/2${P}`);
  });

  it('ne lie pas deux nombres par « : », « — » ou « ; »', () => {
    expect(isolateMathRuns('Question 2 : 120')).toBe('Question 2 : 120');
    expect(isolateMathRuns('910 ; 1000')).toBe('910 ; 1000');
    expect(isolateMathRuns('Exercice 4 — 910')).toBe('Exercice 4 — 910');
  });

  it('laisse un nombre seul, un texte sans nombre, et est idempotent', () => {
    expect(isolateMathRuns('Étagère 12')).toBe('Étagère 12');
    expect(isolateMathRuns('Sans nombre')).toBe('Sans nombre');
    const once = isolateMathRuns('15 = 3 × 5');
    expect(isolateMathRuns(once)).toBe(once);
  });

  it('isole un nombre suivi de son unité — « 24 L » reste un bloc', () => {
    expect(isolateMathRuns('Le premier récipient contient 24 L, le second 18 L.')).toBe(
      `Le premier récipient contient ${L}24 L${P}, le second ${L}18 L${P}.`,
    );
    expect(isolateMathRuns('Aire : 7,5 cm²')).toBe(`Aire : ${L}7,5 cm²${P}`);
    expect(isolateMathRuns('240x')).toBe(`${L}240x${P}`);
    expect(isolateMathRuns('2 cm × 3 cm')).toBe(`${L}2 cm × 3 cm${P}`);
  });

  it('« x » entre deux nombres reste l’opérateur, pas une unité', () => {
    expect(isolateMathRuns('2 x 3 = 6')).toBe(`${L}2 x 3 = 6${P}`);
  });

  it('isole les écritures algébriques : radical, carré, inégalité', () => {
    expect(isolateMathRuns('Solutions : √a ; −√a')).toBe(`Solutions : ${L}√a${P} ; ${L}−√a${P}`);
    expect(isolateMathRuns('On écrit : x² = (√a)²')).toBe(`On écrit : ${L}x² = (√a)²${P}`);
    expect(isolateMathRuns('Preuve : √(a + b) ≠ √a + √b.')).toBe(`Preuve : ${L}√(a + b) ≠ √a + √b${P}.`);
    expect(isolateMathRuns('Le symbole √')).toBe(`Le symbole ${L}√${P}`);
    expect(isolateMathRuns('Forme : a√b')).toBe(`Forme : ${L}a√b${P}`);
    expect(isolateMathRuns('Valeur : √5 ≈ 2,24')).toBe(`Valeur : ${L}√5 ≈ 2,24${P}`);
  });

  it('n’isole ni une lettre seule, ni un mot latin, ni un sigle', () => {
    expect(isolateMathRuns('où a est un nombre positif')).toBe('où a est un nombre positif');
    expect(isolateMathRuns('Le logiciel GeoGebra')).toBe('Le logiciel GeoGebra');
    expect(isolateMathRuns('PGCD')).toBe('PGCD');
  });

  it('laisse intacte une formule collée à un mot latin court (« et », « où ») : la page lit de gauche à droite', () => {
    expect(isolateMathRuns('sous la forme a√b, où b est plus petit')).toBe('sous la forme a√b, où b est plus petit');
  });

  it('isole une égalité littérale « a = b × q »', () => {
    expect(isolateMathRuns('Égalité : a = b × q')).toBe(`Égalité : ${L}a = b × q${P}`);
  });

  it('isole un nombre négatif seul : « −9 » reste un bloc', () => {
    expect(isolateMathRuns('x² = 25 ; 3 ; −9')).toBe(`${L}x² = 25${P} ; 3 ; ${L}−9${P}`);
  });

  it('isole un point « prime » et un parallélisme', () => {
    expect(isolateMathRuns('Point : B′')).toBe(`Point : ${L}B′${P}`);
    expect(isolateMathRuns('Droite : (d′)')).toBe(`Droite : ${L}(d′)${P}`);
    expect(isolateMathRuns('Parallèles ? (BC) ; (B′C′)')).toBe(`Parallèles ? (BC) ; ${L}(B′C′)${P}`);
    expect(isolateMathRuns('Donc : (CF)//(AB) ; (B′C′)//(BC).')).toBe(`Donc : ${L}(CF)//(AB)${P} ; ${L}(B′C′)//(BC)${P}.`);
    expect(isolateMathRuns('Les rapports sont égaux : (MN)//(BC)')).toBe(`Les rapports sont égaux : ${L}(MN)//(BC)${P}`);
  });

  it('reste idempotent sur une écriture algébrique', () => {
    const once = isolateMathRuns('Nombres : √a ; −√a');
    expect(isolateMathRuns(once)).toBe(once);
  });
});

describe('isolateOutsideMath — les îles $…$ restent intactes', () => {
  it('isole le texte brut et laisse KaTeX tranquille', () => {
    expect(isolateOutsideMath('Nombre : √a ; $\\sqrt{b}$')).toBe(`Nombre : ${L}√a${P} ; $\\sqrt{b}$`);
    expect(isolateOutsideMath('$x^2 = a$ deux solutions')).toBe('$x^2 = a$ deux solutions');
  });
});
