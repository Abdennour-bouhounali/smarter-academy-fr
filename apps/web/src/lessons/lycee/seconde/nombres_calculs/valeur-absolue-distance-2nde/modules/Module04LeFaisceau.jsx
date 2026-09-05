import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BeamLine from '../components/BeamLine';
import Stepper from '../components/Stepper';
import BuildCheck from '../components/BuildCheck';
import { absInequalitySet, notation, satisfies, centerRadius } from '../components/absUtils';

/**
 * Module 4 — MANIPULATION : « Le faisceau du phare ».
 * Activity: promener un bateau-test dans le faisceau |x − 3| ≤ 2, lire la
 *   zone éclairée ; retrouver centre et rayon de [−1 ; 7] ; ouvrir le bord.
 * Mathematical objective: |x − a| ≤ r ⇔ x ∈ [a − r ; a + r] ; strict ⇔
 *   ouvert ; |x − a| = r a deux solutions, les bords.
 * Expected observation: le faisceau est symétrique autour de a ; ses bords
 *   sont a − r et a + r ; x = 5 est éclairé pour ≤, pas pour <.
 * Misconception targeted: « |x − 3| ≤ 2 ⇔ x ≤ 5 » (un seul côté), « le
 *   centre est la borne de gauche ».
 */
export default function Module04LeFaisceau() {
  const [x, setX] = useState(0);
  const [litSeen, setLitSeen] = useState(() => new Set());
  const [readDone, setReadDone] = useState(false);
  const [a2, setA2] = useState(0);
  const [r2, setR2] = useState(1);
  const [d2, setD2] = useState(false);
  const [strict, setStrict] = useState(false);
  const [x3, setX3] = useState(5);
  const [edgeDone, setEdgeDone] = useState(false);
  const target2 = centerRadius(-1, 7);

  const moveX = (v) => { setX(v); const s = new Set(litSeen); s.add(satisfies(v, 3, 2) ? 'in' : 'out'); if (v === 5 || v === 1) s.add('edge'); setLitSeen(s); };
  const scanDone = litSeen.has('in') && litSeen.has('out') && litSeen.has('edge');

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Le faisceau du phare"
      moduleSubtitle="Un centre, un rayon : le faisceau éclaire tous les x tels que |x − a| ≤ r. C’est un intervalle."
      estimatedTime="9 min"
      brief={{ tag: '🔦 Mission 04', title: 'Le phare a été déplacé au km 3. Son faisceau porte à 2 km.', tone: 'indigo', body: <p>Un bateau est éclairé quand sa distance au phare est au plus 2 km : |x − 3| ≤ 2. Promène le bateau-test et trouve la zone éclairée.</p> }}
      steps={[
        {
          num: 1, title: 'Promène le bateau-test', subtitle: 'Trouve un endroit éclairé, un endroit dans le noir, et un bord du faisceau (1 ou 5).', done: scanDone && readDone,
          content: (kit) => (
            <div className="space-y-3">
              <BeamLine a={3} r={2} x={x} onX={(v) => { moveX(v); if ((v === 5 || v === 1) && !litSeen.has('edge')) kit.react(true); }} showNotation={false} />
              <Stepper label="bateau x" value={x} onChange={moveX} min={-10} max={10} step={0.5} unit=" km" />
              {scanDone ? (
                <TapQuestion
                  prompt="La zone éclairée, c’est l’ensemble des x tels que |x − 3| ≤ 2. Quel intervalle est-ce ?"
                  options={['[1 ; 5]', ']−∞ ; 5]', '[3 ; 5]', '[−2 ; 2]']} cols={2} correct={0}
                  explain="Le faisceau va de 3 − 2 = 1 à 3 + 2 = 5, des deux côtés du phare : [1 ; 5]. Les bords sont éclairés (≤)."
                  explainWrong="Le faisceau est SYMÉTRIQUE autour du centre 3 : il éclaire 2 km à gauche (jusqu’à 1) ET 2 km à droite (jusqu’à 5). ]−∞ ; 5] oublie le bord gauche ; [3 ; 5] oublie le côté ouest ; [−2 ; 2] est centré en 0."
                  solved={readDone} onAnswered={() => setReadDone(true)} />
              ) : (
                <Feedback tone="info">{!litSeen.has('in') ? 'Trouve une position éclairée.' : !litSeen.has('out') ? 'Maintenant une position dans le noir.' : 'Trouve un BORD du faisceau : la dernière position encore éclairée.'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Retrouve le phare', subtitle: 'Le faisceau éclaire exactement [−1 ; 7]. Règle le centre et le rayon.', done: d2,
          content: (
            <div className="space-y-3">
              <BeamLine a={a2} r={r2} x={x3} onA={setA2} onR={setR2} onX={setX3} rMax={8} disabled={d2} />
              <BuildCheck
                isRight={() => a2 === target2.a && r2 === target2.r}
                current={() => `centre ${a2}, rayon ${r2} → ${notation(absInequalitySet(a2, r2))}`}
                answer={`centre 3, rayon 4 : |x − 3| ≤ 4`}
                why="Le centre est le MILIEU de l’intervalle, (−1 + 7) ÷ 2 = 3, et le rayon la moitié de sa longueur, (7 − (−1)) ÷ 2 = 4."
                hint={() => 'Le centre est au milieu de −1 et 7 ; le rayon est la distance du centre à un bord.'}
                onDone={() => setD2(true)} solved={d2} label="Valider mon réglage" />
            </div>
          ),
        },
        {
          num: 3, title: 'Le bord du faisceau', subtitle: 'Mets le bateau exactement au km 5, puis change le bord en « strictement moins de 2 ».', done: edgeDone,
          content: (
            <div className="space-y-3">
              <BeamLine a={3} r={2} strict={strict} x={x3} onX={setX3} onStrict={setStrict} />
              <Stepper label="bateau x" value={x3} onChange={setX3} min={-10} max={10} step={0.5} unit=" km" />
              <TapQuestion
                prompt="Avec |x − 3| < 2 (strict), le bateau au km 5 est-il éclairé ?"
                options={['Oui, comme avant', 'Non : |5 − 3| = 2, et 2 n’est pas strictement inférieur à 2']} cols={1} correct={1}
                explain="Avec <, le bord est exclu : la zone devient ]1 ; 5[, intervalle ouvert. Le bateau au km 5 est pile sur le bord : dans le noir. Les deux bords 1 et 5 sont exactement les solutions de |x − 3| = 2."
                explainWrong="Regarde le verdict du lab avec le bord exclu : |5 − 3| = 2, et 2 < 2 est faux. La zone éclairée devient ]1 ; 5[ : bords exclus, comme des crochets ouverts."
                solved={edgeDone} onAnswered={() => setEdgeDone(true)} />
            </div>
          ),
        },
      ]}
      footer={<Feedback tone="ok"><strong>|x − a| ≤ r ⇔ x ∈ [a − r ; a + r]</strong> (strict ⇔ ouvert). Et <strong>|x − a| = r</strong> a deux solutions : a − r et a + r, les bords du faisceau.</Feedback>}
    />
  );
}
