import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoLinesPlane, { TONES } from '../components/TwoLinesPlane';
import LineReadouts from '../components/LineReadouts';
import { lineFromSlopeIntercept, lineFromTwoPoints, parseDec, formatDec } from '../components/droitesUtils';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT : deux trajectoires.
 *
 * Le support visuel se retire pas à pas (§15 : décroissance de l'étayage) :
 *  1. deux drones — le plan est là, sans le point I : le calcul le trouve ;
 *  2. une route parallèle par un point — le plan montre (d₁) et C, la
 *     réponse est un nombre ;
 *  3. (AB) et (CD) — quatre points, aucune équation donnée : à l'élève de
 *     choisir l'outil (déterminant, puis un point pour départager) ;
 *  4. un système « 0 = 0 » — plus aucun dessin.
 * Chaque erreur classique a sa réponse ciblée (explainFor).
 */
const DRONE1 = lineFromSlopeIntercept(2, -3);  // y = 2x − 3
const DRONE2 = lineFromSlopeIntercept(-1, 6);  // y = −x + 6  → I(3 ; 3)
const ROUTE = lineFromSlopeIntercept(2, -3);
const C = { x: 1, y: 5 };
const PAR = lineFromSlopeIntercept(2, 3);      // y = 2x + 3
const A = { x: 0, y: 1 }; const B = { x: 2, y: 4 }; const Cc = { x: -1, y: -2 }; const D = { x: 3, y: 4 };
const AB = lineFromTwoPoints(A, B); const CD = lineFromTwoPoints(Cc, D);

export default function Module05DeuxTrajectoires() {
  const [qx, setQx] = useState(false);
  const [qy, setQy] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Les deux drones',
      subtitle: 'Drone 1 : y = 2x − 3. Drone 2 : y = −x + 6. Où leurs trajectoires se croisent-elles ?',
      done: qx && qy,
      content: (
        <div className="space-y-4">
          <TwoLinesPlane lines={[{ id: 'd1', name: '(d₁)', line: DRONE1, tone: 'indigo' }, { id: 'd2', name: '(d₂)', line: DRONE2, tone: 'rose' }]} showIntersection={false} />
          <LineReadouts L1={DRONE1} L2={DRONE2} show={{ equations: true, position: false, intersection: false }} />
          <NumericQuestion
            prompt="Abscisse du point de croisement ?"
            expected={3}
            parse={parseDec}
            display={formatDec(3)}
            explain={<span>2x − 3 = −x + 6 ⟺ 3x = 9 ⟺ x = <strong>3</strong>.</span>}
            explainFor={(n) => (n === 9 ? 'Tu as oublié de diviser : 3x = 9 donne x = 3.'
              : n === 1 ? '2x − 3 = −x + 6 : les x se rassemblent en 2x + x = 3x, et les nombres en 6 + 3 = 9. Donc x = 3.'
              : n === -3 ? 'Signe : 2x + x = 6 + 3, soit 3x = 9, x = 3.'
              : 'Égale les deux ordonnées : 2x − 3 = −x + 6, d’où 3x = 9 et x = 3.')}
            solved={qx}
            onAnswered={() => setQx(true)}
          />
          {qx && (
            <NumericQuestion
              prompt="Ordonnée du point de croisement ?"
              expected={3}
              parse={parseDec}
              display={formatDec(3)}
              explain={<span>y = 2 × 3 − 3 = 3 ; et −3 + 6 = 3 aussi. Les drones se croisent en <strong>(3 ; 3)</strong> — s’ils y passent au même instant, il y a collision.</span>}
              explainFor={(n) => (n === 9 ? 'y = 2x − 3 avec x = 3 : 6 − 3 = 3 (pas 2 × 3 + 3).'
                : 'Remplace x = 3 dans l’une des équations : 2 × 3 − 3 = 3. L’autre confirme : −3 + 6 = 3.')}
              solved={qy}
              onAnswered={() => setQy(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une route parallèle',
      subtitle: 'Une route suit y = 2x − 3. On trace la route parallèle passant par C(1 ; 5). Son équation est y = 2x + p : trouve p.',
      done: q2,
      content: (
        <div className="space-y-4">
          <TwoLinesPlane
            lines={[{ id: 'd1', name: '(d₁)', line: ROUTE, tone: 'indigo' }, ...(q2 ? [{ id: 'd2', name: '(d₂)', line: PAR, tone: 'rose' }] : [])]}
            handles={[{ id: 'C', name: 'C', x: C.x, y: C.y, color: TONES.rose }]}
            showIntersection={false}
          />
          <NumericQuestion
            prompt="Valeur de p pour la parallèle passant par C(1 ; 5) ?"
            expected={3}
            parse={parseDec}
            display={formatDec(3)}
            explain={<span>Parallèle ⟹ même coefficient directeur 2. C est sur la droite : 5 = 2 × 1 + p, donc p = <strong>3</strong>. La route : y = 2x + 3.</span>}
            explainFor={(n) => (n === -3 ? 'p = −3 est l’ordonnée à l’origine de la PREMIÈRE route : la parallèle passe par C, pas par (0 ; −3). Écris 5 = 2 × 1 + p.'
              : n === 5 ? '5 est l’ordonnée de C, pas p. C vérifie y = 2x + p : 5 = 2 × 1 + p, donc p = 3.'
              : n === 7 ? 'Signe : 5 = 2 + p donne p = 5 − 2 = 3.'
              : 'Même m que la route (2), et C(1 ; 5) vérifie l’équation : 5 = 2 × 1 + p, p = 3.')}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: '(AB) et (CD)',
      subtitle: 'A(0 ; 1), B(2 ; 4), C(−1 ; −2), D(3 ; 4). Position relative des droites (AB) et (CD) ?',
      done: q3,
      content: (
        <TapQuestion
          above={(revealed) => (
            <TwoLinesPlane
              lines={revealed ? [{ id: 'ab', name: '(AB)', line: AB, tone: 'indigo' }, { id: 'cd', name: '(CD)', line: CD, tone: 'rose' }] : []}
              handles={[
                { id: 'A', name: 'A', x: A.x, y: A.y, color: TONES.indigo }, { id: 'B', name: 'B', x: B.x, y: B.y, color: TONES.indigo },
                { id: 'C', name: 'C', x: Cc.x, y: Cc.y, color: TONES.rose }, { id: 'D', name: 'D', x: D.x, y: D.y, color: TONES.rose },
              ]}
              showIntersection={false}
            />
          )}
          options={['Strictement parallèles', 'Sécantes', 'Confondues', 'On ne peut pas savoir sans les tracer']}
          correct={0}
          cols={2}
          explain={<span>AB(2 ; 3) et CD(4 ; 6) : det = 2 × 6 − 3 × 4 = 0, même direction. Confondues ou parallèles ? (AB) : y = 1,5x + 1 ; C(−1 ; −2) donne 1,5 × (−1) + 1 = −0,5 ≠ −2, donc C n’est pas sur (AB) : <strong>strictement parallèles</strong>.</span>}
          explainWrong={<span>Deux étapes. Direction : AB(2 ; 3), CD(4 ; 6), det = 12 − 12 = 0 ⟹ même direction, donc pas sécantes. Position : C est-il sur (AB) ? (AB) a pour équation y = 1,5x + 1 et 1,5 × (−1) + 1 = −0,5 ≠ −2 : non. Strictement parallèles.</span>}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Zéro égale zéro',
      done: q4,
      content: (
        <TapQuestion
          prompt={<span>On cherche l’intersection de <MathText>{'$2x - 4y + 8 = 0$'}</MathText> et <MathText>{'$y = 0{,}5x + 2$'}</MathText>. En remplaçant y dans la première : <MathText>{'$2x - 4(0{,}5x + 2) + 8 = 0$'}</MathText>, soit <MathText>{'$0 = 0$'}</MathText>. Conclusion ?</span>}
          options={[
            'Une infinité de points communs : les droites sont confondues.',
            'Aucun point commun : les droites sont parallèles.',
            'Un seul point commun, en (0 ; 0).',
            'Le calcul est faux.',
          ]}
          correct={0}
          cols={1}
          explain="0 = 0 est vrai pour TOUT x : chaque point de l’une vérifie l’équation de l’autre. Les deux équations décrivent la même droite (2x − 4y + 8 = 0 ⟺ y = 0,5x + 2)."
          explainWrong="Une égalité toujours vraie ne désigne pas un point, elle les désigne tous : les droites sont confondues. Compare avec le module 4 : une égalité fausse (2 = −1) donnait « aucun point ». Et (0 ; 0) ne vérifie pas y = 0,5x + 2."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Deux trajectoires"
      moduleSubtitle="Décider, calculer, conclure — avec de moins en moins de dessin"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Les mêmes outils, sans les curseurs',
        tone: 'rose',
        body: (
          <p>
            Quatre situations. À chaque fois, pose-toi les deux questions dans l’ordre : <strong>même direction ?</strong> (déterminant, pentes, m) —
            puis, si oui, <strong>même position ?</strong> (un point de l’une est-il sur l’autre ?). Si non, <strong>où est le point commun ?</strong> (le système).
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          Il ne reste qu’à le prouver : la mission finale. Dix épreuves, une seule validation.
        </KnowledgeSnapshot>
      }
    />
  );
}
