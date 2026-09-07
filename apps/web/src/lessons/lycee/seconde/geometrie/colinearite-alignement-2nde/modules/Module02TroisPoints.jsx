import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorPlane, { Lamp, ComponentStepper } from '../components/VectorPlane';
import PredictionChips from '../components/PredictionChips';
import { vecFromPoints, pointsAligned, formatVec, samePoint, compareDirections } from '../components/colinUtils';

/**
 * Module 2 — DISCOVERY : « Trois points, une droite ».
 *
 * ACTION            l'élève déplace C ; A(−3 ; −1) et B(1 ; 1) sont fixes.
 * CHANGEMENT        le vecteur AC tourne ; deux voyants — « A, B, C alignés »
 *                   et « AB et AC colinéaires » — s'allument ENSEMBLE ou
 *                   s'éteignent ensemble.
 * OBSERVATION       C est aligné exactement quand AC roule sur le rail de AB :
 *                   au-delà de B, entre A et B, et même de l'autre côté de A
 *                   (AC de sens contraire).
 * SENS MATHÉMATIQUE alignement de trois points = colinéarité de deux vecteurs
 *                   construits sur ces points. C'est le pont géométrie → calcul.
 * Controlled variable : C (entier, C ≠ A, C ≠ B).
 * Expected observation (aha) : (−5 ; −2) allume « alignés » alors que C n'est
 *   pas « entre » A et B ; (5 ; 4) a l'air aligné et ne l'est pas.
 * Misconception targeted : alignés ⇔ C entre A et B ; alignés ⇔ AB = AC ;
 *   « ça a l'air aligné ».
 * Laissé aux modules suivants : le facteur k (M3), le déterminant (M4).
 */
const A = { x: -3, y: -1 };
const B = { x: 1, y: 1 };
const AB = vecFromPoints(A, B);
const RANGE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };

export default function Module02TroisPoints() {
  const [prediction, setPrediction] = useState(null);
  const [C, setC] = useState({ x: 4, y: -2 });
  const [found, setFound] = useState(() => new Set());
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const AC = vecFromPoints(A, C);
  const aligned = pointsAligned(A, B, C);
  const cmp = compareDirections(AB, AC);
  const done1 = found.size >= 3;

  const moveC = (p, react) => {
    if (samePoint(p, A) || samePoint(p, B)) return; // C ne se confond jamais avec A ou B
    setC(p);
    if (pointsAligned(A, B, p)) {
      const key = `${p.x};${p.y}`;
      if (!found.has(key)) { const f = new Set(found); f.add(key); setFound(f); react?.(true); }
    }
  };
  const foundList = [...found].map((k) => { const [x, y] = k.split(';').map(Number); return { x, y }; });
  const beyondA = foundList.some((p) => p.x < A.x);
  const between = foundList.some((p) => p.x > A.x && p.x < B.x);

  const lab = (kit) => (
    <div className="space-y-3">
      <VectorPlane
        range={RANGE}
        points={[
          { id: 'A', name: 'A', ...A, color: 'rose' }, { id: 'B', name: 'B', ...B, color: 'rose' },
          { id: 'C', name: 'C', ...C },
        ]}
        draggableId="C"
        onPointChange={(p) => moveC({ x: p.x, y: p.y }, kit.react)}
        rails={[{ id: 'rail-ab', through: A, dir: AB, color: 'sky' }]}
        vectors={[
          { id: 'ab', from: A, to: B, color: 'violet', width: 5 },
          { id: 'ac', from: A, to: C, color: 'emerald', width: 3 },
        ]}
        legend={[{ id: 'ab', label: 'AB', value: formatVec(AB), color: 'violet' }, { id: 'ac', label: 'AC', value: formatVec(AC), color: 'emerald' }, { id: 'c', label: 'C', value: formatVec(C), color: 'indigo' }]}
        ariaLabel={`Repère : A (−3 ; −1), B (1 ; 1), C ${formatVec(C)} — déplace C`}
      />
      <div className="flex flex-wrap gap-3 justify-center">
        <ComponentStepper label="x de C" value={C.x} min={RANGE.xMin} max={RANGE.xMax} onChange={(x) => moveC({ x, y: C.y }, kit.react)} />
        <ComponentStepper label="y de C" value={C.y} min={RANGE.yMin} max={RANGE.yMax} onChange={(y) => moveC({ x: C.x, y }, kit.react)} />
      </div>
      <div className="flex gap-2 flex-wrap">
        <Lamp label="A, B, C" on={aligned} onText="alignés" offText="non alignés" />
        <Lamp label="AB et AC" on={aligned} onText="colinéaires" offText="non colinéaires" />
        <Lamp label="Sens de AC" neutral={cmp.sens === null} on={cmp.sens === 'meme'} onText="celui de AB" offText="contraire" tone="amber" />
      </div>
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Trois points, une droite"
      moduleSubtitle="A et B sont fixés. Déplace C : quand les trois points sont-ils alignés — et que font alors les vecteurs AB et AC ?"
      estimatedTime="9 min"
      brief={{ tag: '📍 Mission 02', title: 'Trois points sont alignés quand ils sont sur une même droite. Ici, la droite (AB) est tracée en pointillé.', tone: 'indigo', body: <p>Déplace C et observe les deux voyants. Ils ne se contredisent jamais — pourquoi ?</p> }}
      steps={[
        {
          num: 1, title: 'Trouve trois positions de C alignées avec A et B', subtitle: 'Il y en a de chaque côté. Les voyants te répondent à chaque déplacement.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="si je place C en (5 ; 3), A, B et C seront-ils alignés ?" options={[{ id: 'oui', label: 'Oui' }, { id: 'non', label: 'Non' }]} value={prediction} onChange={setPrediction} disabled={done1} />
              {lab(kit)}
              {done1 ? (
                <>
                  <Feedback tone="ok">Positions trouvées : {foundList.map(formatVec).join(', ')}. {between ? 'Entre A et B, ' : ''}{beyondA ? 'de l’autre côté de A (AC part alors dans le sens contraire de AB !), ' : ''}au-delà de B : à chaque fois, <strong>AC roule sur le rail de AB</strong>. Alignés ⇔ AB et AC colinéaires. {prediction ? `Ta prédiction pour (5 ; 3) : ${prediction}. ${found.has('5;3') ? 'Tu l’as vérifiée.' : 'Vérifie-la si tu veux.'}` : ''}</Feedback>
                  <KnowledgeBrick
                    id="colin-alignement"
                    variant="new"
                    compact
                    lead={<>Tu viens de trouver trois positions de C où les voyants « alignés » et « colinéaires » s’allument ensemble : ce lien porte un nom.</>}
                  />
                  <KnowledgeBrick
                    id="colin-vocabulaire-aligne"
                    variant="new"
                    compact
                    lead={<>Le mot pour trois points sur une même droite.</>}
                  />
                </>
              ) : (
                <Feedback tone="info">{found.size} position{found.size > 1 ? 's' : ''} alignée{found.size > 1 ? 's' : ''} sur 3. {aligned ? 'Celle-ci l’est ! Cherche-en une autre — pourquoi pas de l’autre côté de A.' : 'C n’est pas sur la droite (AB) : rapproche-le du pointillé.'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Le presque-aligné', subtitle: 'Prédis, puis vérifie en déplaçant C.', done: q2,
          content: (kit) => (
            <div className="space-y-3">
              <TapQuestion
                prompt="Si C est en (5 ; 4), A, B et C sont-ils alignés ?"
                options={['Oui, C est sur (AB)', 'Non, C n’est pas sur (AB)']} cols={2} correct={1}
                explain="Non : AB = (4 ; 2) et AC = (8 ; 5). Pour rester sur le rail, 8 = 2 × 4 exigerait 5 = 2 × 2 — il faudrait C en (5 ; 3). L’œil hésite à un carreau près ; les coordonnées ne se trompent pas."
                explainWrong="Presque, mais non : AB = (4 ; 2), AC = (8 ; 5). Si AC était sur le rail, 8 étant le double de 4, il faudrait 5 = double de 2. Le point aligné est (5 ; 3). Place C en (5 ; 4) ci-dessous : le voyant reste éteint."
                requires={['colin-alignement', 'colin-vocabulaire-aligne']}
                solved={q2} onAnswered={() => setQ2(true)} />
              {lab(kit)}
              {q2 && (
                <KnowledgeBrick
                  id="colin-oeil-hesite"
                  variant="new"
                  compact
                  lead={<>C en (5 ; 4) avait l’air aligné, et ne l’était pas : ce que ça dit sur l’œil et le dessin.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Le pont', done: q3,
          content: (
            <TapQuestion
              prompt="Trois points A, B et C sont alignés exactement quand…"
              options={['les vecteurs AB et AC sont colinéaires', 'les vecteurs AB et AC sont égaux', 'AB et AC ont la même longueur', 'C est entre A et B']} cols={1} correct={0}
              explain="Alignés ⇔ AB et AC ont la même direction ⇔ colinéaires. Ni égaux (C ≠ B), ni de même longueur, ni forcément entre A et B : (−5 ; −2) est aligné, de l’autre côté de A."
              explainWrong="Tu as vu (−5 ; −2) ou (5 ; 3) s’aligner : AC n’y est ni égal à AB, ni de même longueur, ni « entre ». La seule chose commune à toutes tes positions alignées : AC sur le rail de AB — colinéaires."
              requires={['colin-alignement', 'colin-oeil-hesite']}
              solved={q3} onAnswered={() => setQ3(true)} />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          Il reste à décider la colinéarité SANS dessiner.
        </KnowledgeSnapshot>
      )}
    />
  );
}
