import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoProbes from '../components/TwoProbes';
import { ABS, SQUARE, ABS_RANGE, curvePieces, squareBelowAbs, formatDec } from '../components/referenceUtils';

/**
 * Module 4 — DÉCOUVERTE : le V.
 * Step 1  le miroir sur |x| : h(−a) = h(a) = distance à 0 ; deux demi-droites y = x et y = −x.
 * Step 2  le V contre la parabole : trouver a avec a² < |a|, puis a² > |a| → x² ≤ |x| ⟺ −1 ≤ x ≤ 1.
 * Step 3  |x| = 3. Step 4  portrait.
 */
const PLANE = { f: ABS, range: ABS_RANGE, unit: 34, unitY: 34 };
const HALF_LINES = [
  { id: 'yx', points: [{ x: 0, y: 0 }, { x: 4, y: 4 }], tone: '#94a3b8', dashed: true, width: 1.5 },
  { id: 'ymx', points: [{ x: -4, y: 4 }, { x: 0, y: 0 }], tone: '#94a3b8', dashed: true, width: 1.5 },
];
const PARABOLA = curvePieces(SQUARE, ABS_RANGE).map((pc, i) => ({ id: `sq${i}`, points: pc, tone: '#4f46e5', dashed: true, width: 2 }));

export default function Module04LeV() {
  const [a1, setA1] = useState(2);
  const [seenNeg, setSeenNeg] = useState(false);
  const [a2, setA2] = useState(2);
  const [seenBelow, setSeenBelow] = useState(false);
  const [seenAbove, setSeenAbove] = useState(true); // a = 2 : a² > |a| déjà constaté au départ ? non — on l'exige par un geste
  const [seenAboveMoved, setSeenAboveMoved] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = seenNeg;
  const done2 = seenBelow && seenAboveMoved;

  const move1 = ({ a }, react) => { setA1(a); if (a < 0 && !seenNeg) { setSeenNeg(true); react?.(true); } };
  const move2 = ({ a }, react) => {
    setA2(a);
    let hit = false;
    if (a !== 0 && squareBelowAbs(a) && !seenBelow) { setSeenBelow(true); hit = seenAboveMoved; }
    if (!squareBelowAbs(a) && !seenAboveMoved) { setSeenAboveMoved(true); hit = seenBelow; }
    if (hit) react?.(true);
  };
  const cmp2 = a2 * a2 < Math.abs(a2) ? '<' : a2 * a2 > Math.abs(a2) ? '>' : '=';

  const steps = [
    {
      num: 1, title: 'La distance à zéro', subtitle: 'La sonde a et le point d’abscisse −a. Les deux demi-droites en pointillés sont y = x et y = −x.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <TwoProbes {...PLANE} a={a1} b={0} showB={false} showMirror step={0.5} extraCurves={HALF_LINES} onChange={(v) => move1(v, kit.react)} disabled={done1} />
          {done1 ? (
            <Feedback tone="ok"><strong>h(−a) = h(a)</strong> = la distance de a à 0 : axe de symétrie (Oy), comme la parabole. La courbe suit y = x à droite de 0 et y = −x à gauche : deux <strong>demi-droites</strong> qui se rejoignent en O, le point le plus bas — un <strong>V</strong>.</Feedback>
          ) : (
            <Feedback tone="info">h({formatDec(a1)}) = {formatDec(Math.abs(a1))}. Va voir du côté négatif.</Feedback>
          )}
          {done1 && (
            <KnowledgeBrick
              id="vocab-extremum"
              variant="new"
              lead="Le coin du V est le point le plus bas de la courbe : aucune valeur de |x| ne descend plus bas que 0. Ce « point le plus bas » a un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Le V contre la parabole', subtitle: 'La parabole est en pointillés. Trouve un a pour lequel a² < |a|, puis un a pour lequel a² > |a|.', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TwoProbes {...PLANE} a={a2} b={0} showB={false} step={0.5} extraCurves={PARABOLA} highlightIntervals={done2 ? [{ from: -1, to: 1, tone: 'emerald' }] : []} onChange={(v) => move2(v, kit.react)} disabled={done2 || !done1} />
          <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
            <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900">a² = {formatDec(a2 * a2)}</span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">|a| = {formatDec(Math.abs(a2))}</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white" data-compare={cmp2}>a² {cmp2} |a|</span>
          </div>
          {done2 ? (
            <Feedback tone="ok">Entre −1 et 1, le V passe <strong>au-dessus</strong> de la parabole (0,5² = 0,25 &lt; 0,5) ; au-delà, la parabole domine (2² = 4 &gt; 2). Les deux courbes se croisent en −1, 0 et 1 : <strong>x² ≤ |x| exactement pour −1 ≤ x ≤ 1</strong>.</Feedback>
          ) : (
            <Feedback tone="info">{!seenBelow ? 'Cherche un a (non nul) avec a² < |a| : essaie près de 0. ' : ''}{!seenAboveMoved ? 'Puis éloigne-toi : a² > |a|.' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Résoudre avec le V', done: q3,
      content: (
        <TapQuestion prompt="Quels nombres ont pour valeur absolue 3 ? (c’est-à-dire : les antécédents de 3 par x ↦ |x|)"
          options={['−3 et 3', '3 seulement', '−3 seulement', 'aucun']}
          correct={0} cols={4}
          explain="Deux nombres sont à distance 3 de 0 : −3 et 3. Sur le V, la droite y = 3 coupe les deux demi-droites."
          explainWrong="La valeur absolue est une distance à 0, et deux nombres sont à distance 3 de zéro : 3 et −3. Le V le montre : la droite horizontale y = 3 le coupe deux fois."
          solved={q3} onAnswered={() => setQ3(true)} />
      ),
    },
    {
      num: 4, title: 'Portrait du V', done: q4,
      content: (
        <BatchChoiceQuestion intro={<p className="text-sm text-slate-700">Sans sonde :</p>}
          rows={[
            { id: 'r1', label: 'Minimum de |x|', options: ['0, atteint en x = 0', '1, atteint en x = 1', 'il n’y en a pas'], correct: 0, correction: 'le coin du V' },
            { id: 'r2', label: 'Sur [0 ; +∞[, |x| est', options: ['croissante', 'décroissante'], correct: 0, correction: 'la demi-droite y = x monte' },
            { id: 'r3', label: '|x| = x exactement pour', options: ['x ≥ 0', 'x ≤ 0', 'tout x'], correct: 0, correction: 'à gauche, |x| = −x' },
            { id: 'r4', label: 'x² ≤ |x| pour', options: ['−1 ≤ x ≤ 1', 'tout x', 'aucun x'], correct: 0, correction: 'le V au-dessus de la parabole' },
          ]}
          feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Le V : |x| = distance à 0, axe de symétrie (Oy), minimum 0 en 0, décroissante sur ]−∞ ; 0], croissante sur [0 ; +∞[, jamais négative ; au-dessus de la parabole sur [−1 ; 1].</Feedback>}
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Le V" moduleSubtitle="La courbe de x ↦ |x| : deux demi-droites, un coin" estimatedTime="8 min"
      brief={{ tag: 'Découverte', title: 'La fonction valeur absolue', tone: 'emerald', body: <p>|x| est la distance de x à 0. Sa courbe est un <strong>V</strong>. Sonde-la, puis compare-la à la parabole.</p> }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4}>Trois courbes, trois portraits. Module suivant : les faire parler — images, antécédents, et qui est au-dessus de qui.</KnowledgeSnapshot>} />
  );
}
