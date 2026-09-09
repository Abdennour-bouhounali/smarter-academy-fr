import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE les acquis listés dans `priorKnowledge` — le carré et le cube,
 * les premiers carrés parfaits, l'aire d'un carré (6e/5e), et la règle des
 * signes (4e) — et RIEN de la matière de la leçon : ni racine carrée, ni
 * symbole √, ni encadrement.
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 */
const SKILLS = {
  carre: { label: 'Le carré', emoji: '⬛' },
  aire: { label: 'Aire', emoji: '📐' },
  signes: { label: 'Signes', emoji: '±' },
};

const QUESTIONS = [
  {
    id: 'rc4-d1-carre',
    skill: 'carre',
    points: 2,
    requires: ['carre-cube', 'puissance'],
    prompt: 'Combien vaut 8² ?',
    options: ['64', '16', '82'],
    cols: 3,
    correct: 0,
    explain: '8² se lit « 8 au carré » : c’est 8 × 8 = 64. (16 serait 8 × 2.)',
  },
  {
    id: 'rc4-d2-parfaits',
    skill: 'carre',
    points: 2,
    requires: ['carres-parfaits'],
    prompt: 'Quel nombre, multiplié par lui-même, donne 81 ?',
    options: ['9', '8', '40,5'],
    cols: 3,
    correct: 0,
    explain: '9 × 9 = 81. (40,5 serait la moitié de 81 — mais 40,5 × 40,5 donne bien plus que 81.)',
  },
  {
    id: 'rc4-d3-aire',
    skill: 'aire',
    points: 2,
    requires: ['aire'],
    prompt: 'Quelle est l’aire d’un carré de 6 cm de côté ?',
    options: ['36 cm²', '24 cm²', '12 cm²'],
    cols: 3,
    correct: 0,
    explain: 'L’aire d’un carré est côté × côté : 6 × 6 = 36 cm². (24 cm serait son périmètre.)',
  },
  {
    id: 'rc4-d4-aire-inverse',
    skill: 'aire',
    points: 2,
    requires: ['aire'],
    prompt: 'Un carré a une aire de 25 cm². Quel est son côté ?',
    options: ['5 cm', '12,5 cm', '625 cm'],
    cols: 3,
    correct: 0,
    explain: 'On cherche le nombre qui, multiplié par lui-même, donne 25 : c’est 5. (12,5 serait la moitié de l’aire, ce qui n’a pas de rapport.)',
  },
  {
    id: 'rc4-d5-signes',
    skill: 'signes',
    points: 2,
    requires: ['regle-des-signes'],
    prompt: 'Combien fait (−7) × (−7) ?',
    options: ['49', '−49', '−14'],
    cols: 3,
    correct: 0,
    explain: 'Deux facteurs de même signe donnent un produit positif : 7 × 7 = 49, donc 49. Un nombre négatif au carré est donc positif.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      moduleTitle="Mission de départ"
      moduleSubtitle="Cinq questions sur les carrés"
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Cette leçon introduit une opération <strong>entièrement nouvelle</strong>. Elle repose
            sur ce que tu sais du carré et de l’aire — c’est ce qu’on vérifie ici.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
