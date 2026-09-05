import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/** Module 6 — FORMALISATION : « À retenir » — quatre lectures d'une droite, trois chemins vers son équation. */
const CARDS = [
  { t: 'vecteur directeur', f: 'u ≠ 0, et tout k·u', s: 'la direction de la droite ; A + t·u parcourt tous ses points' },
  { t: 'pente', f: 'm = u_y / u_x', s: 'montée ÷ avancée entre deux points ; aucune pente si la droite est verticale' },
  { t: 'équation cartésienne', f: 'a·x + b·y + c = 0', s: 'vecteur directeur (−b ; a) ; écrit TOUTES les droites (b = 0 : verticale)' },
  { t: 'équation réduite', f: 'y = m·x + p', s: 'm pente, p ordonnée à l’origine (point (0 ; p)) ; pas de verticale' },
  { t: 'appartenance', f: 'M ∈ d ⇔ ses coordonnées vérifient l’équation', s: 'remplacer x par x_M, comparer à y_M' },
  { t: 'trouver l’équation', f: 'deux points · point + u · point + pente', s: 'la pente d’abord (ou u), puis p avec le point' },
];

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
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CARDS.map((c) => (
                    <div key={c.t} className="rounded-xl bg-white border border-indigo-200 p-3">
                      <div className="text-[11px] font-bold uppercase text-indigo-500">{c.t}</div>
                      <div className="font-extrabold font-mono">{c.f}</div>
                      <div className="text-xs">{c.s}</div>
                    </div>
                  ))}
                </div>
              </div>
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
                solved={b1} onAnswered={() => setB1(true)} />
            </div>
          ),
        },
        {
          num: 2, title: 'Passer d’une lecture à l’autre', done: t2,
          content: (
            <TapQuestion
              prompt="Droite d’équation 3x − 2y + 4 = 0. Laquelle de ces lectures est FAUSSE ?"
              options={['vecteur directeur (3 ; −2)', 'vecteur directeur (2 ; 3)', 'pente 1,5', 'équation réduite y = 1,5x + 2']} cols={2} correct={0}
              explain="Un vecteur directeur est (−b ; a) = (2 ; 3), pente 3/2 = 1,5, et −2y = −3x − 4 donne y = 1,5x + 2. (3 ; −2) = (a ; b) n’est PAS un vecteur directeur : il est perpendiculaire à la droite."
              explainWrong="Le vecteur directeur de ax + by + c = 0 est (−b ; a) = (2 ; 3), jamais (a ; b). Vérifie : de (0 ; 2) à (2 ; 5), 3 × 2 − 2 × 5 + 4 = 0 ✓."
              solved={t2} onAnswered={() => setT2(true)} />
          ),
        },
        {
          num: 3, title: 'Trouver l’équation', done: b3,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'c1', label: 'Par (0 ; 3) et (2 ; 7)', options: ['y = 2x + 3', 'y = 3x + 2', 'y = 2x + 7'], correct: 0, correction: 'pente (7 − 3)/(2 − 0) = 2, p = 3 (le point (0 ; 3)).' },
                { id: 'c2', label: 'Par A (1 ; −2), de vecteur directeur (1 ; 4)', options: ['y = 4x − 6', 'y = 4x − 2', 'y = x + 4'], correct: 0, correction: 'm = 4/1 = 4 ; −2 = 4 × 1 + p donne p = −6.' },
                { id: 'c3', label: 'Par B (−2 ; 5), de pente −1', options: ['y = −x + 3', 'y = −x + 5', 'y = −x − 2'], correct: 0, correction: '5 = −(−2) + p donne p = 3.' },
                { id: 'c4', label: 'Par (3 ; 1) et (3 ; −4)', options: ['x = 3', 'y = 3', 'aucune : pente infinie'], correct: 0, correction: 'même abscisse : droite verticale x = 3 — pas de pente, mais une équation cartésienne x − 3 = 0.' },
              ]}
              feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>Le chemin est toujours le même : la pente (ou le vecteur directeur) d’abord, puis p en remplaçant x et y par le point. Et si les deux points ont la même abscisse : x = k.</Feedback>}
              solved={b3} onAnswered={() => setB3(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Les quatre lectures sont en place. Reste à construire, lire, tracer et résoudre sans filet : l’atelier.</Feedback>}
    />
  );
}
