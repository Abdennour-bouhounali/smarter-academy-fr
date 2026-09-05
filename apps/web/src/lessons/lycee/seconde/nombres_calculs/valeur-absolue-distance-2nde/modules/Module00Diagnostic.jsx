import React from 'react';
import { PrerequisiteDiagnostic } from '../../../../../common/kit';
import RealLine from '../../../../../common/components/RealLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 0 — diagnostic (DONNÉES). Prérequis déclarés : « Nombres réels »,
 * « Ensembles et intervalles » : opposé d'un nombre, lecture d'un point,
 * soustraction de relatifs, appartenance à un intervalle, notation.
 */
const SKILLS = {
  reels: { label: 'Nombres réels et droite', emoji: 'ℝ' },
  intervalles: { label: 'Intervalles', emoji: '[ ]' },
};
const QUESTIONS = [
  { id: 'q1-oppose', skill: 'reels', points: 2, prompt: 'Quel est l’opposé de −2,5 ?', options: ['2,5', '−2,5', '0,4'], cols: 3, correct: 0, explain: 'L’opposé de x est −x ; l’opposé de −2,5 est −(−2,5) = 2,5 : même distance à 0, de l’autre côté.' },
  { id: 'q2-lire', skill: 'reels', points: 2, prompt: (<span className="block space-y-2"><span className="block">Quelle est l’abscisse du point B ?</span><RealLine inline min={-4} max={4} step={1} points={[{ id: 'B', value: -3, label: 'B', tone: 'rose' }]} ariaLabel="Droite graduée de −4 à 4 avec un point B" /></span>), options: ['−3', '3', '−1'], cols: 3, correct: 0, explain: 'B est trois graduations à gauche de 0 : −3.' },
  { id: 'q3-soustraire', skill: 'reels', points: 2, prompt: 'Combien vaut 5 − (−3) ?', options: ['2', '8', '−8'], cols: 3, correct: 1, explain: 'Soustraire −3, c’est ajouter 3 : 5 + 3 = 8. Ce réflexe servira pour |5 − (−3)|.' },
  { id: 'q4-appartient', skill: 'intervalles', points: 2, prompt: '1,5 appartient-il à [1 ; 2[ ?', options: ['Oui', 'Non'], cols: 2, correct: 0, explain: '1 ≤ 1,5 < 2 : oui. Seule la borne 2 est exclue.' },
  { id: 'q5-notation', skill: 'intervalles', points: 2, prompt: 'Les nombres x tels que −2 ≤ x ≤ 6 forment l’intervalle :', options: ['[−2 ; 6]', ']−2 ; 6[', '[6 ; −2]'], cols: 3, correct: 0, explain: 'Deux inégalités larges, deux crochets fermés, la plus petite borne à gauche : [−2 ; 6].' },
];
export default function Module00Diagnostic() {
  return (
    <PrerequisiteDiagnostic ctx={MODULE_CTX} navLinks={getNavLinks(0)} estimatedTime="4 min"
      brief={{ body: <p>Cette leçon s’appuie sur la droite des réels et les intervalles. Cinq questions, sans enjeu : tu passes au Module 1 quel que soit ton score.</p> }}
      skills={SKILLS} questions={QUESTIONS} />
  );
}
