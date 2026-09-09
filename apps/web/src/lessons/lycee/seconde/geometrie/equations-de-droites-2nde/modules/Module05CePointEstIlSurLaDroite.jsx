import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MembershipLab from '../components/MembershipLab';
import LineScene from '../components/LineScene';
import { FIGURES, lineFromPoints, reducedOf, formatReduced, formatPoint, isOnLine } from '../components/lineUtils';

/**
 * Module 5 — MANIPULATION : « Ce point est-il sur la droite ? »
 *
 * Activity: cinq points suspects sur y = 0,5x + 1, dont deux à 0,1 près —
 *   indiscernables à l'écran.
 * Student action: prédire (oui / non, sans verdict) puis tester par l'équation.
 * Visual consequence: le point devient vert ou rose APRÈS le test.
 * Expected observation (aha): l'œil dit oui, l'équation dit non. Un point
 *   appartient à la droite exactement quand ses coordonnées vérifient
 *   l'équation — c'est le seul test fiable. Puis : trois points alignés ⇔ le
 *   troisième vérifie l'équation de la droite des deux premiers.
 */
const LINE = FIGURES.membership;                 // y = 0,5x + 1
const CANDIDATES = [
  { id: 'K', name: 'K', x: 2, y: 2 },
  { id: 'L', name: 'L', x: 3, y: 2.4 },
  { id: 'M', name: 'M', x: -2, y: 0 },
  { id: 'N', name: 'N', x: -4, y: -0.9 },
  { id: 'R', name: 'R', x: 4, y: 3 },
];
const A3 = { x: -3, y: -1 };
const B3 = { x: 1, y: 1 };
const C3 = { x: 5, y: 3 };
const LINE3 = lineFromPoints(A3, B3);
const RED3 = reducedOf(LINE3);

export default function Module05CePointEstIlSurLaDroite() {
  const [predictions, setPredictions] = useState({});
  const [tested, setTested] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const done1 = tested.length >= CANDIDATES.length;
  const wrongEye = CANDIDATES.filter((c) => tested.includes(c.id) && predictions[c.id] !== (isOnLine(LINE, c) ? 'oui' : 'non'));

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Ce point est-il sur la droite ?"
      moduleSubtitle="Cinq points suspects, dont deux à 0,1 près. Ton œil dit oui ; que dit l’équation ?"
      estimatedTime="8 min"
      brief={{ tag: '🕵️ Mission 05', title: 'Une droite, cinq points. Certains sont dessus, d’autres juste à côté — à 3 pixels près.', tone: 'indigo', body: <p>Donne ton avis, puis fais le calcul. Compte les fois où ton œil s’est trompé.</p> }}
      steps={[
        {
          num: 1, title: 'Prédis, puis teste chaque point', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <MembershipLab
                line={LINE} candidates={CANDIDATES} predictions={predictions}
                onPredict={(id, v) => setPredictions((p) => ({ ...p, [id]: v }))}
                tested={tested}
                onTest={(id, on, pred) => { setTested((t) => [...t, id]); kit.react(pred === (on ? 'oui' : 'non')); }}
                disabled={done1}
              />
              {done1 && (
                <Feedback tone="ok">
                  {wrongEye.length === 0 ? 'Ton œil ne s’est pas trompé — mais il ne pouvait pas le PROUVER.' : `Ton œil s’est trompé ${wrongEye.length} fois (${wrongEye.map((c) => c.name).join(', ')}).`}{' '}
                  L et N sont à 0,1 unité de la droite : invisible à l’écran, évident dans l’équation. Un point appartient à une droite <strong>exactement quand ses coordonnées vérifient son équation</strong>.
                </Feedback>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="droite-appartenance"
                  variant="new"
                  lead="L et N étaient à 0,1 de la droite — invisible à l’œil, net dans le calcul. Le seul critère fiable :"
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Le critère', done: q2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-methode-tester-point"
                variant="new"
                compact
                lead="Le laboratoire faisait le calcul pour toi. Le voici en deux gestes, à faire seul."
              />
              <TapQuestion
              prompt="Le point (7 ; 4,5) est-il sur la droite y = 0,5x + 1 ?"
              options={['Oui : 0,5 × 7 + 1 = 4,5 = y', 'Non : 7 est trop loin sur le dessin', 'Oui : il est dans le prolongement, à vue d’œil', 'Non : 0,5 × 4,5 + 1 ≠ 7']} cols={1} correct={0}
              explain="On remplace x par 7 : 0,5 × 7 + 1 = 4,5, qui est bien l’ordonnée du point. Il est sur la droite — même hors du cadre, sans dessin. On remplace x par l’ABSCISSE et on compare à l’ordonnée, jamais l’inverse."
                explainWrong="Le test : remplacer x par l’abscisse 7 dans l’équation, 0,5 × 7 + 1 = 4,5, et comparer à l’ordonnée 4,5. Égalité : le point est dessus. Le dessin n’a pas son mot à dire."
                requires={['droite-appartenance', 'droite-methode-tester-point']}
                solved={q2} onAnswered={() => setQ2(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'Trois points alignés', subtitle: `A ${formatPoint(A3)}, B ${formatPoint(B3)}, C ${formatPoint(C3)}.`, done: q3,
          content: (
            <div className="space-y-3">
              <LineScene line={LINE3} nameA="A" frozen points={[{ id: 'B', name: 'B', ...B3, color: '#e11d48' }, { id: 'C', name: 'C', ...C3, color: '#0284c7' }]} ariaLabel={`Droite (AB) ${formatReduced(RED3)} et le point C`} />
              <KnowledgeBrick
                id="droite-alignement-equation"
                variant="new"
                compact
                lead="Trois points, et le même test qu’à l’instant — appliqué au troisième."
              />
              <TapQuestion
                prompt={`La droite (AB) a pour équation ${formatReduced(RED3)}. A, B et C sont-ils alignés ?`}
                options={['Oui : 0,5 × 5 + 0,5 = 3 = y_C, C est sur (AB)', 'Non : C est trop loin de B', 'Oui : sur la figure, c’est droit', 'Non : 0,5 × 3 + 0,5 ≠ 5']} cols={1} correct={0}
                explain="Trois points sont alignés quand le troisième est sur la droite des deux premiers : C vérifie l’équation de (AB) (0,5 × 5 + 0,5 = 3 = y_C). C’est la version « équation » du test det(AB, AC) = 0 de la leçon précédente."
                explainWrong="Remplace x par x_C = 5 dans l’équation de (AB) : 0,5 × 5 + 0,5 = 3, et y_C = 3. Égalité : C est sur (AB), les trois points sont alignés. La distance et l’apparence ne comptent pas."
                requires={['droite-alignement-equation', 'droite-methode-tester-point']}
                solved={q3} onAnswered={() => setQ3(true)} />
              {q3 && (
                <KnowledgeBrick
                  id="mem-droite-appartenance"
                  variant="new"
                  compact
                  lead="Ce qu’il faut retenir de ce module."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          Vecteur directeur, pente, équation cartésienne, équation réduite, test d’appartenance : tout est en place. La carte au module suivant, puis l’atelier.
        </KnowledgeSnapshot>
      }
    />
  );
}
