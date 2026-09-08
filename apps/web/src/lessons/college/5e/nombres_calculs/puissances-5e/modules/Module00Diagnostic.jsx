import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : aucune notation puissance, aucun carré
 * parfait, aucun exposant. Tout ici vient de la 6e — le produit de facteurs
 * identiques, les tables, l'aire d'un carré et le décalage de la virgule.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  repetition: { label: 'Produit répété', emoji: '✖️' },
  tables: { label: 'Tables', emoji: '🔢' },
  geometrie: { label: 'Aire d’un carré', emoji: '⬛' },
};

const QUESTIONS = [
  {
    id: 'pui5-d1-repetition',
    skill: 'repetition',
    points: 2,
    requires: ['multiplication-repetee'],
    prompt: 'Combien font 3 × 3 × 3 ?',
    options: ['27', '9', '333'],
    cols: 3,
    correct: 0,
    explain: '3 × 3 = 9, puis 9 × 3 = 27.',
  },
  {
    id: 'pui5-d2-repetition',
    skill: 'repetition',
    points: 2,
    requires: ['multiplication-repetee', 'calcul-numerique'],
    prompt: 'Dans le calcul 5 × 5 × 5 × 5, combien de fois le facteur 5 apparaît-il ?',
    options: ['4 fois', '5 fois', '20 fois'],
    cols: 3,
    correct: 0,
    explain: 'Il faut compter les 5 écrits : il y en a quatre. (20 serait 5 × 4, ce qui n’est pas ce qu’on demande.)',
  },
  {
    id: 'pui5-d3-tables',
    skill: 'tables',
    points: 2,
    requires: ['tables-multiplication'],
    prompt: 'Combien font 7 × 7 ?',
    options: ['49', '42', '14'],
    cols: 3,
    correct: 0,
    explain: '7 × 7 = 49. (42 est 6 × 7, et 14 est 7 + 7.)',
  },
  {
    id: 'pui5-d4-aire',
    skill: 'geometrie',
    points: 2,
    requires: ['aire'],
    prompt: 'Quelle est l’aire d’un carré de côté 6 cm ?',
    options: ['36 cm²', '24 cm²', '12 cm²'],
    cols: 3,
    correct: 0,
    explain: 'L’aire d’un carré est côté × côté : 6 × 6 = 36 cm². (24 cm serait son périmètre.)',
  },
  {
    id: 'pui5-d5-virgule',
    skill: 'tables',
    points: 2,
    requires: ['decalage-virgule'],
    prompt: 'Combien font 3,7 × 100 ?',
    options: ['370', '37', '3 700'],
    cols: 3,
    correct: 0,
    explain: 'Multiplier par 100 décale la virgule de deux rangs vers la droite : 3,7 devient 370.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions pour savoir par où commencer"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Avant de poser le premier grain de riz, un tour de tes outils : multiplier un nombre
            par lui-même, compter des facteurs, l’aire d’un carré et le décalage de la virgule.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
