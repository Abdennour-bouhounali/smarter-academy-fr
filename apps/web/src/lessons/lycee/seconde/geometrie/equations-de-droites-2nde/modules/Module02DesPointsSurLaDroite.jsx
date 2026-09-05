import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LineWalker from '../components/LineWalker';
import { pointAt, slopeFromPoints, formatPoint, formatVec, formatSlope } from '../components/lineUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DISCOVERY : « Des points sur la droite ».
 *
 * Activity: marcher sur la droite depuis A, t pas de u à la fois.
 * Student action: stepper t (−2 … 3).
 * Controlled variable: t.
 * Mathematical state: { A, u, t }, les t visités.
 * Visual consequence: M = A + t·u glisse SUR la droite ; l'escalier montre
 *   t·u_x à l'horizontale et t·u_y à la verticale.
 * Expected observation (aha): chaque pas ajoute u_x à x et u_y à y ; le
 *   rapport montée / avancée est constant — c'est la pente u_y / u_x.
 * Misconception targeted: pente = avancée / montée ; pente lue entre deux
 *   points « au hasard » sans diviser.
 */
const LINE = { A: { x: -1, y: 0 }, u: { x: 2, y: 1 } };
const GOALS = [2, 3, -2];
const P = { x: -2, y: 5 };
const Q = { x: 4, y: -4 };
const parseSigned = (s) => parseDec(String(s ?? '').replace('−', '-'));

export default function Module02DesPointsSurLaDroite() {
  const [t, setT] = useState(1);
  const [visited, setVisited] = useState(() => new Set([0, 1]));
  const [q2, setQ2] = useState(false);
  const [n3, setN3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = GOALS.every((g) => visited.has(g));

  const walk = (nt, react) => {
    setT(nt);
    if (!visited.has(nt)) {
      const s = new Set(visited); s.add(nt); setVisited(s);
      if (GOALS.includes(nt)) react?.(true);
    }
  };
  const M3 = pointAt(LINE.A, LINE.u, 3);
  const mPQ = slopeFromPoints(P, Q);

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Des points sur la droite"
      moduleSubtitle="Marche sur la droite pas à pas depuis A : chaque pas ajoute la même chose à x et à y."
      estimatedTime="9 min"
      brief={{ tag: '🚶 Mission 02', title: `A ${formatPoint(LINE.A)}, u ${formatVec(LINE.u)}. Un pas = un vecteur u.`, tone: 'indigo', body: <p>Avance de t pas — en arrière aussi. Où est M ? Lis ses coordonnées à chaque pas.</p> }}
      steps={[
        {
          num: 1, title: 'Marche : t = 2, t = 3, puis t = −2', subtitle: 'M = A + t·u. Regarde l’escalier et le calcul.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <LineWalker line={LINE} t={t} onT={(v) => walk(v, kit.react)} visited={[...visited]} min={-2} max={3} disabled={done1} />
              {done1 ? (
                <Feedback tone="ok">Tous les points visités sont <strong>sur la droite</strong>, et ils s’écrivent tous pareil : M = A + t·u = ({formatDec(LINE.A.x)} + 2t ; {formatDec(LINE.A.y)} + t). Chaque pas ajoute u_x = 2 à x et u_y = 1 à y — en arrière (t &lt; 0), il les retire. Entre deux points de la droite, l’avancée et la montée gardent toujours le même rapport.</Feedback>
              ) : (
                <Feedback tone="info">Encore à visiter : {GOALS.filter((g) => !visited.has(g)).map((g) => `t = ${formatDec(g)}`).join(', ')}.</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'La pente', subtitle: 'Avancer de 2, monter de 1 : la droite monte de 1/2 par unité vers la droite.', done: q2,
          content: (
            <TapQuestion
              prompt={`Entre A ${formatPoint(LINE.A)} et M ${formatPoint(M3)}, quelle est la pente (montée ÷ avancée) ?`}
              options={['0,5', '2', '3', '6']} cols={4} correct={0}
              explain={`Montée : 3 − 0 = 3 ; avancée : 5 − (−1) = 6 ; pente = 3 ÷ 6 = 0,5 — exactement u_y / u_x = 1 / 2. Peu importe les deux points choisis sur la droite : le rapport ne change pas.`}
              explainWrong="La pente est la MONTÉE divisée par l’AVANCÉE : (3 − 0) ÷ (5 − (−1)) = 3 ÷ 6 = 0,5. Avec la flèche : u_y / u_x = 1/2. 2 est l’inverse, 3 et 6 sont la montée et l’avancée elles-mêmes."
              solved={q2} onAnswered={() => setQ2(true)} />
          ),
        },
        {
          num: 3, title: 'Pente entre deux points', subtitle: `P ${formatPoint(P)} et Q ${formatPoint(Q)}.`, done: n3,
          content: (
            <NumericQuestion
              prompt="Quelle est la pente de la droite (PQ) ?"
              expected={mPQ} parse={parseSigned} display={formatSlope(mPQ)} width="w-24"
              explain={`Montée : yQ − yP = −4 − 5 = −9 ; avancée : xQ − xP = 4 − (−2) = 6 ; pente = −9 ÷ 6 = −1,5. Le vecteur PQ (6 ; −9) dirige la droite : u_y / u_x = −9/6.`}
              explainFor={(n) => (Math.abs(n + 2 / 3) < 0.01 ? 'Tu as divisé l’avancée par la montée. La pente est montée ÷ avancée : −9 ÷ 6 = −1,5.' : n === 1.5 ? 'Le signe : la droite DESCEND de P à Q (y passe de 5 à −4). Pente −1,5.' : n === -9 ? '−9 est la montée seule. Divise par l’avancée 6 : −1,5.' : null)}
              solved={n3} onAnswered={() => setN3(true)} />
          ),
        },
        {
          num: 4, title: 'Pente et vecteur directeur', done: q4,
          content: (
            <TapQuestion
              prompt="Une droite a pour pente −3. Lesquels de ces vecteurs la dirigent ?"
              options={['(1 ; −3) et (−2 ; 6)', '(−3 ; 1)', '(3 ; 1)', '(1 ; 3)']} cols={1} correct={0}
              explain="Pente −3 : pour 1 vers la droite, 3 vers le bas — (1 ; −3) convient, et tout vecteur colinéaire aussi : (−2 ; 6) = −2 × (1 ; −3). (−3 ; 1) échange avancée et montée ; (1 ; 3) monte."
              explainWrong="Pente = u_y / u_x. Pour (1 ; −3) : −3 ✓. Pour (−2 ; 6) : 6 / (−2) = −3 ✓. (−3 ; 1) donnerait −1/3, (3 ; 1) donnerait 1/3, (1 ; 3) donnerait 3."
              solved={q4} onAnswered={() => setQ4(true)} />
          ),
        },
      ]}
      footer={<Feedback tone="ok">Tous les points de la droite s’écrivent A + t·u. Mais la question de départ reste : comment savoir si un point donné (x ; y) est sur la droite, sans marcher ? Il faut une relation entre x et y — module suivant.</Feedback>}
    />
  );
}
