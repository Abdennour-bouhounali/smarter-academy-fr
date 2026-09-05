import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic des prérequis, sur le lesson kit : ce fichier ne
 * contient que les DONNÉES. Le moteur (score, paliers, persistance,
 * correction, jamais-bloquant) vit dans common/kit/PrerequisiteDiagnostic.jsx.
 *
 * Prérequis officiels (coursesData.js, 6e_perimetres) : « Longueurs » et
 * « Mesures de longueurs » — savoir lire une règle et additionner des
 * longueurs, PAS le périmètre lui-même, enseigné à partir du Module 1.
 * (Jeu de questions volontairement disjoint du diagnostic de la leçon
 * Aires, qui partage le prérequis Longueurs.)
 */
const SKILLS = {
  mesurerLongueurs: { label: 'Mesurer des longueurs', emoji: '📏' },
};

const QUESTIONS = [
  {
    id: 'q1-regle-zero',
    skill: 'mesurerLongueurs',
    points: 2,
    prompt: <>Sur une règle, un crayon commence à la graduation 2 cm et se termine à la graduation 9 cm. Quelle est sa longueur ?</>,
    options: ['9 cm', '7 cm', '11 cm'],
    cols: 3,
    correct: 1,
    explain: 'La longueur se lit comme une différence : 9 − 2 = 7 cm. Le bout du crayon ne suffit pas.',
  },
  {
    id: 'q2-additionner',
    skill: 'mesurerLongueurs',
    points: 2,
    prompt: <>Trois ficelles mesurent 12 cm, 8 cm et 15 cm. Mises bout à bout, quelle longueur totale ?</>,
    options: ['25 cm', '35 cm', '45 cm'],
    cols: 3,
    correct: 1,
    explain: '12 + 8 + 15 = 35 cm : on additionne les longueurs mises bout à bout.',
  },
  {
    id: 'q3-convertir',
    skill: 'mesurerLongueurs',
    points: 2,
    prompt: <>Convertis : <strong className="font-mono">250 cm</strong> = ? m</>,
    options: ['2,5 m', '25 m', '0,25 m'],
    cols: 3,
    correct: 0,
    explain: '1 m = 100 cm, donc 250 cm = 250 ÷ 100 = 2,5 m.',
  },
  {
    id: 'q4-comparer',
    skill: 'mesurerLongueurs',
    points: 2,
    prompt: <>Lequel est le plus long : <strong className="font-mono">1,2 m</strong> ou <strong className="font-mono">118 cm</strong> ?</>,
    options: ['1,2 m', '118 cm', 'Ils sont égaux'],
    cols: 3,
    correct: 0,
    explain: '1,2 m = 120 cm, et 120 cm > 118 cm. Pour comparer, on met tout dans la même unité.',
  },
  {
    id: 'q5-instrument',
    skill: 'mesurerLongueurs',
    points: 2,
    prompt: <>Pour mesurer le tour de la cour de récréation, quel instrument est le plus adapté ?</>,
    options: ['Une règle de 20 cm', 'Un mètre-ruban ou une roue de mesure', 'Un rapporteur'],
    cols: 1,
    correct: 1,
    explain: 'Pour de grandes longueurs, la petite règle est impraticable et le rapporteur mesure des angles — le mètre-ruban (ou la roue) est fait pour ça.',
  },
];

export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic
      ctx={MODULE_CTX}
      navLinks={getNavLinks(0)}
      estimatedTime="4 min"
      brief={{
        body: (
          <p>
            Vérifions ensemble la petite base dont tu auras besoin pour explorer les périmètres : lire une règle
            et additionner des longueurs. Ce test nous aide à savoir comment t'aider — ce n'est pas un examen, et
            tu pourras toujours continuer vers le Module 1, quel que soit ton score.
          </p>
        ),
      }}
      skills={SKILLS}
      questions={QUESTIONS}
    />
  );
}
