import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DetTester from '../components/DetTester';
import { FIGURES, detTest, cartesianOf, reducedOf, formatCartesian, formatReduced, formatPoint, formatVec } from '../components/lineUtils';
import { parseDec } from '@smarter-academy/core';

/**
 * Module 3 — DISCOVERY : « De la droite à l'équation ».
 *
 * Activity: un point M libre ; le nombre det(AM, u) = u_y(x − x_A) − u_x(y − y_A)
 *   se recalcule à chaque position.
 * Student action: déplacer M jusqu'à annuler le nombre, trois fois.
 * Controlled variable: M.
 * Mathematical state: la droite fil rouge { A(1 ; 3), u(1 ; 2) }, M, les
 *   positions trouvées.
 * Visual consequence: M devient vert quand le nombre vaut 0 — et il est alors
 *   SUR la droite, à chaque fois.
 * Expected observation (aha): « le nombre vaut 0 exactement quand M est sur
 *   la droite » ; développé, c'est une relation entre x et y : l'ÉQUATION.
 * Misconception targeted: « l'équation est une formule à part » — ici elle
 *   naît du test géométrique de la leçon précédente (colinéarité de AM et u).
 * Formalization: équation cartésienne (étape 2), équation réduite (étape 3),
 *   le chemin point + vecteur (étape 4).
 */
const LINE = FIGURES.fil;
const CAR = cartesianOf(LINE);
const RED = reducedOf(LINE);
const B = { x: -2, y: 1 };
const V = { x: 3, y: 1 };
const parseSigned = (s) => parseDec(String(s ?? '').replace('−', '-'));

export default function Module03DeLaDroiteALEquation() {
  const [pred, setPred] = useState(null);
  const [M, setM] = useState({ x: 3, y: 1 });
  const [found, setFound] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [n4, setN4] = useState(false);
  const done1 = found.length >= 3;

  const moveM = (p, react) => {
    setM(p);
    if (detTest(LINE, p) === 0 && !found.some((q) => q.x === p.x && q.y === p.y)) {
      setFound((f) => [...f, p]);
      react?.(true);
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="De la droite à l’équation"
      moduleSubtitle="Un nombre vaut 0 exactement quand M est sur la droite. Écris-le avec x et y : c’est l’équation."
      estimatedTime="10 min"
      brief={{ tag: '🔎 Mission 03', title: `A ${formatPoint(LINE.A)}, u ${formatVec(LINE.u)}. M est sur la droite quand AM et u sont colinéaires — det(AM, u) = 0 (leçon précédente).`, tone: 'indigo', body: <p>Déplace M et regarde ce nombre. Quand vaut-il 0 ?</p> }}
      steps={[
        {
          num: 1, title: 'Annule le nombre — trois fois', subtitle: 'Trouve trois positions de M où det(AM, u) = 0.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="pour quelles positions de M le nombre vaut-il 0 ?" options={[{ id: 'droite', label: 'Quand M est sur la droite' }, { id: 'A', label: 'Seulement quand M est en A' }, { id: 'partout', label: 'Partout' }]} value={pred} onChange={setPred} disabled={done1} />
              <DetTester line={LINE} M={M} onM={(p) => moveM(p, kit.react)} found={found} disabled={done1} />
              {done1 ? (
                <Feedback tone="ok">{pred === 'droite' ? 'Ta prédiction était juste' : pred === 'A' ? 'Pas seulement en A' : pred === 'partout' ? 'Pas partout' : 'Regarde'} : {found.map(formatPoint).join(', ')} — trois points verts, tous <strong>sur la droite</strong>. Le nombre 2(x − 1) − 1(y − 3) vaut 0 pour TOUS les points de la droite et pour eux seuls : c’est une relation entre x et y qui décrit la droite entière.</Feedback>
              ) : (
                <Feedback tone="info">{found.length} sur 3. Le nombre est 2(x − 1) − (y − 3) : il faut y − 3 = 2(x − 1).</Feedback>
              )}
              {done1 && (
                <KnowledgeBrick
                  id="droite-equation-idee"
                  variant="new"
                  lead="Le nombre s’annulait exactement quand M rejoignait la droite. C’est cela, une équation."
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'L’équation cartésienne', subtitle: 'Développe 2(x − 1) − (y − 3) = 0.', done: q2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-equation-cartesienne"
                variant="new"
                lead="Développée, cette relation prend toujours la même forme — et ses coefficients viennent de la flèche."
              />
              <TapQuestion
              prompt="Quelle équation obtient-on ?"
              options={[formatCartesian(CAR), '2x + y − 5 = 0', 'x − 2y + 5 = 0', '2x − y − 1 = 0']} cols={2} correct={0}
              explain={`2(x − 1) − (y − 3) = 2x − 2 − y + 3 = 2x − y + 1. L’équation ${formatCartesian(CAR)} est l’ÉQUATION CARTÉSIENNE de la droite : un point est dessus exactement quand ses coordonnées la vérifient. Ses coefficients (2 ; −1) sont (u_y ; −u_x) — la direction est dedans.`}
                explainWrong="Attention aux signes : 2(x − 1) = 2x − 2 et −(y − 3) = −y + 3. Somme : 2x − y + 1 = 0."
                requires={['droite-equation-idee', 'droite-equation-cartesienne']}
                solved={q2} onAnswered={() => setQ2(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'L’équation réduite', subtitle: 'Isole y dans 2x − y + 1 = 0.', done: q3,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-equation-reduite"
                variant="new"
                lead="La même droite, écrite autrement : y tout seul d’un côté. C’est ici qu’apparaissent m et p."
              />
              <TapQuestion
              prompt="On obtient…"
              options={[formatReduced(RED), 'y = −2x − 1', 'y = 2x − 1', 'y = x + 0,5']} cols={2} correct={0}
              explain={`2x − y + 1 = 0 ⇔ y = 2x + 1. C’est l’ÉQUATION RÉDUITE : y = m·x + p avec m = 2 (la pente, u_y / u_x) et p = 1 (l’ordonnée du point de la droite sur l’axe des y). Vérifie : A (1 ; 3) → 2 × 1 + 1 = 3 ✓.`}
                explainWrong="Passe −y de l’autre côté : 2x + 1 = y, donc y = 2x + 1. Vérifie avec A (1 ; 3) : 2 × 1 + 1 = 3 ✓."
                requires={['droite-equation-reduite', 'droite-equation-cartesienne', 'droite-pente']}
                solved={q3} onAnswered={() => setQ3(true)} />
            </div>
          ),
        },
        {
          num: 4, title: 'Une autre droite, la même méthode', subtitle: `Droite passant par B ${formatPoint(B)}, de vecteur directeur v ${formatVec(V)}.`, done: n4,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="droite-methode-point-vecteur"
                variant="new"
                lead="Tu viens de le faire une fois sur la droite fil rouge. En trois gestes, quels que soient le point et la flèche :"
              />
              <NumericQuestion
              prompt="Son équation cartésienne s’écrit x − 3y + c = 0. Que vaut c ?"
              expected={5} parse={parseSigned} display="5" width="w-24"
              explain="a = v_y = 1 et b = −v_x = −3 : x − 3y + c = 0. B est dessus : (−2) − 3 × 1 + c = 0, donc c = 5. Équation : x − 3y + 5 = 0."
              explainFor={(n) => (n === -5 ? 'Le signe : −2 − 3 + c = 0 donne c = +5.' : n === 1 ? '1 est y_B, pas c. Remplace x et y par les coordonnées de B : −2 − 3 + c = 0.' : `Avec c = ${String(n).replace('-', '−')} : −2 − 3 + c ≠ 0, B ne serait pas sur la droite. Il faut c = 5.`)}
                requires={['droite-methode-point-vecteur', 'droite-equation-cartesienne']}
                solved={n4} onAnswered={() => setN4(true)} />
              {n4 && (
                <>
                  <KnowledgeBrick
                    id="droite-formules-equations"
                    variant="new"
                    compact
                    lead="Les deux écritures rencontrées dans ce module, côte à côte."
                  />
                  <KnowledgeBrick
                    id="mem-droite-deux-ecritures"
                    variant="new"
                    compact
                    lead="Ce qu’il faut retenir de ce module."
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={<Feedback tone="ok">Une droite, deux écritures : cartésienne a·x + b·y + c = 0 (vecteur directeur (−b ; a)) et réduite y = m·x + p. Que font m et p quand on les change ? Module suivant.</Feedback>}
    />
  );
}
