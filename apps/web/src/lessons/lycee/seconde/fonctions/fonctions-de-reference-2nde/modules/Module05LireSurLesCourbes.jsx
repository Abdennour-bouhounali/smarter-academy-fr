import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FunctionProbe from '../components/FunctionProbe';
import { SQUARE, INVERSE, ABS, REFERENCES, SQUARE_RANGE, INVERSE_RANGE, ABS_RANGE, curvePieces } from '../components/referenceUtils';

/**
 * Module 5 — MANIPULATION : lire sur les courbes.
 * Sonde horizontale (antécédents) sur chaque référence : x² = 4 (deux), x² = −1
 * (aucun), 1/x = 2 (un), |x| = 3 (deux) ; puis la position relative des trois
 * courbes sur ]0 ; 1[ et sur ]1 ; +∞[.
 */
const COMPARE_RANGE = { xMin: 0, xMax: 3, yMin: 0, yMax: 4 };

export default function Module05LireSurLesCourbes() {
  const [y1, setY1] = useState(1);
  const [seen4, setSeen4] = useState(false);
  const [seenNeg, setSeenNeg] = useState(false);
  const [y2, setY2] = useState(0.5);
  const [seen2, setSeen2] = useState(false);
  const [y3, setY3] = useState(1);
  const [seen3, setSeen3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = seen4 && seenNeg;

  const steps = [
    {
      num: 1, title: 'x² = 4, puis x² = −1', subtitle: 'Sonde horizontale sur la parabole : amène-la à 4, puis à −1.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <FunctionProbe f={SQUARE} range={SQUARE_RANGE} unit={34} unitY={30} mode="y" value={y1} yStep={1} disabled={done1}
            onChange={(v) => { setY1(v); let hit = false; if (v === 4 && !seen4) { setSeen4(true); hit = seenNeg; } if (v === -1 && !seenNeg) { setSeenNeg(true); hit = seen4; } if (hit) kit.react(true); }} />
          {done1 ? (
            <Feedback tone="ok">x² = 4 a <strong>deux</strong> solutions, −2 et 2 (la droite y = 4 coupe la parabole deux fois) ; x² = −1 n’en a <strong>aucune</strong> (la parabole ne descend pas sous l’axe). Et x² = 0 en a une seule, 0. Un nombre positif a deux antécédents par la fonction carré, opposés.</Feedback>
          ) : (
            <Feedback tone="info">{!seen4 ? 'Vise 4. ' : ''}{!seenNeg ? 'Puis −1.' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: '1/x = 2', subtitle: 'Sur l’hyperbole, amène la sonde à 2.', done: seen2,
      content: (kit) => (
        <div className="space-y-3">
          <FunctionProbe f={INVERSE} range={INVERSE_RANGE} unit={34} mode="y" value={y2} yStep={0.5} disabled={seen2 || !done1}
            onChange={(v) => { setY2(v); if (v === 2 && !seen2) { setSeen2(true); kit.react(true); } }} />
          {seen2 ? (
            <Feedback tone="ok">1/x = 2 a <strong>une seule</strong> solution, x = 0,5 : chaque nombre non nul a exactement un antécédent par la fonction inverse (son inverse !). Et 0 n’en a aucun : la sonde à y = 0 ne rencontre jamais la courbe.</Feedback>
          ) : (
            <Feedback tone="info">Vise y = 2.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: '|x| = 3', subtitle: 'Sur le V, amène la sonde à 3.', done: seen3,
      content: (kit) => (
        <div className="space-y-3">
          <FunctionProbe f={ABS} range={ABS_RANGE} unit={34} unitY={34} mode="y" value={y3} yStep={1} disabled={seen3 || !seen2}
            onChange={(v) => { setY3(v); if (v === 3 && !seen3) { setSeen3(true); kit.react(true); } }} />
          {seen3 ? (
            <Feedback tone="ok">|x| = 3 : <strong>deux</strong> solutions, −3 et 3 — comme pour le carré, un positif a deux antécédents opposés ; |x| = 0 en a un seul ; |x| = −1 aucun.</Feedback>
          ) : (
            <Feedback tone="info">Vise y = 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'Qui est au-dessus ?', done: q4,
      content: (
        <BatchChoiceQuestion
          intro={(
            <div className="space-y-2">
              <p className="text-sm text-slate-700">Les trois courbes sur [0 ; 3] :</p>
              <CoordPlane range={COMPARE_RANGE} unit={80} unitY={50} xStep={0.5} yStep={1} caption={false} ariaLabel="Les trois courbes de référence sur [0 ; 3]"
                curves={REFERENCES.flatMap((f) => curvePieces(f, COMPARE_RANGE).map((pc, i) => ({ id: `${f.id}${i}`, points: pc, tone: f.color, width: 2.5, label: f.label })))} />
            </div>
          )}
          rows={[
            { id: 'r1', label: 'Pour 0 < x < 1, du plus petit au plus grand', options: ['x² < |x| < 1/x', '1/x < |x| < x²', '|x| < x² < 1/x'], correct: 0, correction: '0,5² = 0,25 < 0,5 < 2' },
            { id: 'r2', label: 'Pour x > 1', options: ['1/x < |x| < x²', 'x² < |x| < 1/x', '|x| < 1/x < x²'], correct: 0, correction: '0,5 < 2 < 4 en x = 2' },
            { id: 'r3', label: 'En x = 1', options: ['les trois valent 1', 'x² est le plus grand', '1/x est le plus grand'], correct: 0, correction: 'les trois courbes se croisent en (1 ; 1)' },
            { id: 'r4', label: 'Parmi les trois, celle qui prend des valeurs négatives', options: ['1/x (pour x < 0)', 'x² (pour x < 0)', '|x| (pour x < 0)'], correct: 0, correction: 'le signe de x' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Entre 0 et 1, élever au carré diminue et inverser augmente ; au-delà de 1, c’est l’inverse. Les trois courbes passent par (1 ; 1).</Feedback>}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Lire sur les courbes" moduleSubtitle="Images, antécédents, et la position relative des trois courbes" estimatedTime="11 min"
      brief={{ tag: 'Manipulation', title: 'Les courbes répondent', tone: 'sky', body: <p>Une équation x² = k, 1/x = k ou |x| = k se lit sur la courbe : combien de fois la droite y = k la coupe-t-elle ? Puis les trois courbes ensemble : qui domine qui.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5}>Module suivant : reconnaître une référence dans une situation réelle — une aire, une durée, un écart.</KnowledgeSnapshot>} />
  );
}
