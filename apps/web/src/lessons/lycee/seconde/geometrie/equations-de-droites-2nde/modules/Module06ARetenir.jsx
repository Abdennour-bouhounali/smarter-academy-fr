import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 6 — FORMALISATION : « À retenir » — quatre lectures d'une droite, trois chemins vers son équation. */

export default function Module06ARetenir() {
  const [b1, setB1] = useState(false);
  const [t2, setT2] = useState(false);
  const [b3, setB3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(6)} moduleNumber={6}
      moduleTitle="À retenir"
      moduleSubtitle="Vecteur directeur, pente, équation cartésienne, équation réduite : quatre lectures d’une même droite."
      estimatedTime="7 min"
      brief={{ tag: '📘 Mission 06', title: 'Une droite, quatre façons de la lire — et on passe de l’une à l’autre.', tone: 'indigo', body: <p>Lis la carte, puis trois vérifications.</p> }}
      steps={[
        {
          num: 1, title: 'La carte', done: b1,
          content: (
            <div className="space-y-3">
              {/* Aucun résumé écrit ici : les six cases recopiées à la main ont été
                  supprimées (knowledge.jsx les déclare déjà), et la carte
                  cumulative est rendue UNE fois, en pied de module. Deux
                  <KnowledgeSnapshot> dans le même module compteraient double. */}
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Vrai ou faux ?</p>}
                rows={[
                  { id: 'r1', label: 'Une droite a un seul vecteur directeur', options: ['vrai', 'faux'], correct: 1, correction: 'tout vecteur non nul colinéaire convient : 2u, −u…' },
                  { id: 'r2', label: 'Dans y = 3x − 2, la droite coupe l’axe des ordonnées en (0 ; −2)', options: ['vrai', 'faux'], correct: 0 },
                  { id: 'r3', label: 'Toute droite a une équation réduite y = mx + p', options: ['vrai', 'faux'], correct: 1, correction: 'la verticale x = k n’en a pas.' },
                  { id: 'r4', label: '(a ; b) est un vecteur directeur de ax + by + c = 0', options: ['vrai', 'faux'], correct: 1, correction: 'c’est (−b ; a).' },
                  { id: 'r5', label: 'La pente de la droite de vecteur directeur (4 ; −2) est −0,5', options: ['vrai', 'faux'], correct: 0 },
                ]}
                feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Cinq sur cinq.' : `${nCorrect} / ${total}.`} Une infinité de vecteurs directeurs ; (−b ; a) et non (a ; b) ; la verticale n’a pas de pente ; m = u_y / u_x.</Feedback>}
                requires={['droite-vecteur-directeur', 'droite-ordonnee-origine', 'droite-verticale', 'droite-equation-cartesienne', 'droite-pente-vers-directeur']}
                solved={b1} onAnswered={() => setB1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'Passer d’une lecture à l’autre', done: t2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-lire-cartesienne"
                variant="new"
                lead="Tu sais lire une réduite. Sur une cartésienne, les trois lectures se prennent d’un coup :"
              />
              <TapQuestion
              prompt="Droite d’équation 3x − 2y + 4 = 0. Laquelle de ces lectures est FAUSSE ?"
              options={['vecteur directeur (3 ; −2)', 'vecteur directeur (2 ; 3)', 'pente 1,5', 'équation réduite y = 1,5x + 2']} cols={2} correct={0}
              explain="Un vecteur directeur est (−b ; a) = (2 ; 3), pente 3/2 = 1,5, et −2y = −3x − 4 donne y = 1,5x + 2. (3 ; −2) = (a ; b) n’est PAS un vecteur directeur : il est perpendiculaire à la droite."
                explainWrong="Le vecteur directeur de ax + by + c = 0 est (−b ; a) = (2 ; 3), jamais (a ; b). Vérifie : de (0 ; 2) à (2 ; 5), 3 × 2 − 2 × 5 + 4 = 0 ✓."
                requires={['droite-lire-cartesienne', 'droite-equation-cartesienne', 'droite-equation-reduite']}
                solved={t2} onAnswered={() => setT2(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'Trouver l’équation', done: b3,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-methode-deux-points"
                variant="new"
                lead="Le premier chemin : on ne te donne que deux points. La pente s’en déduit, le reste suit."
              />
              <KnowledgeBrick
                id="droite-methode-point-pente"
                variant="new"
                compact
                lead="Le troisième : quand la pente est déjà donnée, il ne reste que p."
              />
              <BatchChoiceQuestion
              rows={[
                { id: 'c1', label: 'Par (0 ; 3) et (2 ; 7)', options: ['y = 2x + 3', 'y = 3x + 2', 'y = 2x + 7'], correct: 0, correction: 'pente (7 − 3)/(2 − 0) = 2, p = 3 (le point (0 ; 3)).' },
                { id: 'c2', label: 'Par A (1 ; −2), de vecteur directeur (1 ; 4)', options: ['y = 4x − 6', 'y = 4x − 2', 'y = x + 4'], correct: 0, correction: 'm = 4/1 = 4 ; −2 = 4 × 1 + p donne p = −6.' },
                { id: 'c3', label: 'Par B (−2 ; 5), de pente −1', options: ['y = −x + 3', 'y = −x + 5', 'y = −x − 2'], correct: 0, correction: '5 = −(−2) + p donne p = 3.' },
                { id: 'c4', label: 'Par (3 ; 1) et (3 ; −4)', options: ['x = 3', 'y = 3', 'aucune : pente infinie'], correct: 0, correction: 'même abscisse : droite verticale x = 3 — pas de pente, mais une équation cartésienne x − 3 = 0.' },
              ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Le chemin est toujours le même : la pente (ou le vecteur directeur) d’abord, puis p en remplaçant x et y par le point. Et si les deux points ont la même abscisse : x = k.</Feedback>}
                requires={['droite-methode-deux-points', 'droite-methode-point-pente', 'droite-methode-point-vecteur', 'droite-verticale']}
                solved={b3} onAnswered={() => setB3(true)} />
              {b3 && (
                <KnowledgeBrick
                  id="mem-droite-trois-chemins"
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
        <KnowledgeSnapshot moduleNumber={6}>
          Les quatre lectures sont en place. Reste à construire, lire, tracer et résoudre sans filet : l’atelier.
        </KnowledgeSnapshot>
      }
    />
  );
}
