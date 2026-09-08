import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis (DONNÉES uniquement).
 *
 * Il MESURE ce que la leçon suppose (`priorKnowledge` de lesson.config.js) et
 * rien de la matière de la leçon : ni fraction égale, ni simplification, ni
 * comparaison, ni addition de fractions. Tout ici vient de la 6e (le sens du
 * numérateur et du dénominateur, la fraction simple d'une quantité, la
 * demi-droite graduée) et de la leçon « Opérations » de cette même famille
 * (multiples et division exacte).
 *
 * Aucune question ne bloque et aucune ne produit de preuve
 * (docs/architecture/KNOWLEDGE_DEPENDENCY.md, § « Le module 0 et le test final »).
 */
const SKILLS = {
  sens: { label: 'Lire une fraction', emoji: '🍰' },
  quantite: { label: 'Fraction d’une quantité', emoji: '⚖️' },
  division: { label: 'Diviser', emoji: '➗' },
};

const QUESTIONS = [
  {
    id: 'nr5r-d1-denominateur',
    skill: 'sens',
    points: 2,
    requires: ['denominateur'],
    prompt: 'Dans la fraction 3/5, que raconte le nombre du BAS ?',
    options: ['En combien de parts égales on a coupé', 'Combien de parts on prend', 'Le résultat du partage'],
    cols: 1,
    correct: 0,
    explain: 'Le nombre du bas — le dénominateur — dit en combien de parts égales l’unité a été coupée. Ici, en 5.',
  },
  {
    id: 'nr5r-d2-numerateur',
    skill: 'sens',
    points: 2,
    requires: ['numerateur'],
    prompt: 'Une tablette est coupée en 8 carrés égaux. On en mange 3. Quelle fraction a-t-on mangée ?',
    options: ['3/8', '8/3', '3/5'],
    cols: 3,
    correct: 0,
    explain: 'On a pris 3 parts sur 8 : la fraction est 3/8. Le nombre du haut compte les parts prises.',
  },
  {
    id: 'nr5r-d3-quantite',
    skill: 'quantite',
    points: 2,
    requires: ['fraction-decimale', 'quotient'],
    prompt: 'Combien font la moitié de 18 ?',
    options: ['9', '36', '16'],
    cols: 3,
    correct: 0,
    explain: 'Prendre la moitié, c’est partager en 2 : 18 ÷ 2 = 9.',
  },
  {
    id: 'nr5r-d4-tiers',
    skill: 'quantite',
    points: 2,
    requires: ['quotient'],
    prompt: 'Combien font le tiers de 24 ?',
    options: ['8', '12', '21'],
    cols: 3,
    correct: 0,
    explain: 'Prendre le tiers, c’est partager en 3 : 24 ÷ 3 = 8.',
  },
  {
    id: 'nr5r-d5-multiple',
    skill: 'division',
    points: 2,
    requires: ['tables-multiplication', 'quotient'],
    prompt: 'Le nombre 12 est-il un multiple de 4 ?',
    options: ['Oui, car 4 × 3 = 12', 'Non, car 12 est plus grand que 4', 'Non, car 12 n’est pas dans la table de 4'],
    cols: 1,
    correct: 0,
    explain: '12 est bien dans la table de 4 (4 × 3 = 12) : c’est un multiple de 4, et la division 12 ÷ 4 tombe juste.',
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
            Avant de fabriquer ta première graduation, un tour de tes outils : lire une fraction,
            en prendre une part d’une quantité, et reconnaître un multiple.{' '}
            <strong>Rien n’est bloquant.</strong>
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
