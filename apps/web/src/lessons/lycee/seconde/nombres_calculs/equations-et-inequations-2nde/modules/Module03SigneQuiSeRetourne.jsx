import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import RealLine from '../../../../../common/components/RealLine';
import SolutionBuilder from '../components/SolutionBuilder';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignFlipLine from '../components/SignFlipLine';
import EquationSteps from '../components/EquationSteps';
import { lin, applyBothSides, applyOneSide, isSolvedForm } from '../components/eqUtils';

/**
 * Module 3 — DISCOVERY : « Le signe qui se retourne ».
 * Activity: multiplier 2 < 5 par −1, 2, −2, 3 sur la droite ; résoudre
 *   −3x + 4 ≤ 10 pas à pas ; représenter les solutions ; traduire en série.
 * Mathematical objective: multiplier/diviser par un négatif retourne le sens ;
 *   les solutions d'une inéquation forment un intervalle, représenté sur la
 *   droite.
 * Expected observation: −2 est à droite de −5 (symétrie par 0) ; ÷ (−3)
 *   transforme ≤ en ≥ ; x ≥ −2 se colorie vers +∞ avec −2 inclus.
 */
const OPS = [
  { id: 'm4', label: '− 4 des deux côtés', op: { type: 'add', k: -4 } },
  { id: 'dm3', label: '÷ (−3) des deux côtés', op: { type: 'div', k: -3 } },
  { id: 'd3', label: '÷ 3 des deux côtés', op: { type: 'div', k: 3 } },
  { id: 'xm1', label: '× (−1) des deux côtés', op: { type: 'mul', k: -1 } },
  { id: 'm4L', label: '− 4 à gauche seulement', op: { type: 'add', k: -4 }, side: 'L' },
];
const START = { L: lin(-3, 4), R: lin(0, 10) };

export default function Module03SigneQuiSeRetourne() {
  const [k, setK] = useState(1);
  const [tried, setTried] = useState(() => new Set());
  const [flipDone, setFlipDone] = useState(false);
  const [history, setHistory] = useState([START]);
  const [count, setCount] = useState(0);
  const [lineDone, setLineDone] = useState(false);
  const [sol, setSol] = useState({ bound: 2, closed: false, toRight: false });
  const [builtOk, setBuiltOk] = useState(false);
  const [batchDone, setBatchDone] = useState(false);
  const last = history[history.length - 1];
  const solved = isSolvedForm(last) && history.every((h) => !h.op || h.both);

  const apply = (o) => { const next = o.side ? applyOneSide(last, o.op, o.side) : applyBothSides(last, o.op); setHistory([...history, { ...next, op: o.op, both: !o.side, label: o.label }]); setCount(count + 1); };
  const reveal = () => { let cur = START; const h = [START]; for (const o of [OPS[0], OPS[1]]) { cur = applyBothSides(cur, o.op); h.push({ ...cur, op: o.op, both: true, label: o.label }); } setHistory(h); };

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Le signe qui se retourne"
      moduleSubtitle="2 < 5. Multiplie par −1 : −2 et −5 changent de côté du zéro… et d’ordre. Puis résous −3x + 4 ≤ 10."
      estimatedTime="11 min"
      brief={{ tag: '🔁 Mission 03', title: 'Pour une inéquation, une seule règle change. Trouve laquelle.', tone: 'indigo', body: <p>Commence par deux nombres et un multiplicateur. Puis résous comme au module 2 — en surveillant le signe.</p> }}
      steps={[
        {
          num: 1, title: 'Multiplie 2 < 5', subtitle: 'Essaie × (−1) et × 2 au moins. Regarde l’ordre des deux points.', done: tried.has(-1) && tried.has(2) && flipDone,
          content: (kit) => (
            <div className="space-y-3">
              <SignFlipLine k={k} onK={(c) => { setK(c); const s = new Set(tried); s.add(c); setTried(s); if (c === -1 && !tried.has(-1)) kit.react(true); }} />
              {tried.has(-1) && tried.has(2) && (
                <TapQuestion prompt="Que se passe-t-il quand on multiplie les deux membres d’une inégalité par un nombre négatif ?" options={['Le sens de l’inégalité se retourne', 'Rien, comme pour une égalité', 'L’inégalité devient fausse']} cols={1} correct={0}
                  explain="Multiplier par −1, c’est prendre le symétrique par rapport à 0 : le plus petit devient le plus grand. 2 < 5 devient −2 > −5. Par un positif, l’ordre est conservé."
                  explainWrong="Regarde la droite : après × (−1), −2 est à DROITE de −5, donc −2 > −5. Le sens s’est retourné. C’est la seule différence avec les équations."
                  requires={['nombres-relatifs', 'ordre-nombres']}
                  solved={flipDone} onAnswered={() => setFlipDone(true)} />
              )}
              {flipDone && (
                <KnowledgeBrick
                  id="regle-signe-retourne"
                  variant="new"
                  lead="Les deux points ont changé de côté du zéro, et d’ordre. Retiens exactement quand cela arrive."
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Résous −3x + 4 ≤ 10', subtitle: 'Comme au module 2 — mais attention au coefficient de x.', done: solved,
          content: (kit) => (
            <div className="space-y-3">
              <EquationSteps history={history} ops={OPS} onApply={(o) => { apply(o); if (!o.side) { const n = applyBothSides(last, o.op); if (isSolvedForm(n)) kit.react(true); } }} onUndo={() => setHistory(history.slice(0, -1))} onReset={() => setHistory([START])} ineq="≤" />
              {count >= 5 && !solved && <button type="button" onClick={reveal} className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-600 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">Je ne trouve pas — montre-moi</button>}
              {solved && <Feedback tone="ok">− 4 des deux côtés : −3x ≤ 6. Puis ÷ (−3) : on divise par un NÉGATIF, le sens se retourne : x ≥ −2. (Diviser par 3 donne −x ≤ 2, puis × (−1) retourne aussi : x ≥ −2.)</Feedback>}
              {solved && (
                <>
                  <KnowledgeBrick
                    id="methode-resoudre-inequation"
                    variant="new"
                    lead="Tu as résolu comme au module 2, avec un seul moment de vigilance. Voilà la méthode complète."
                  />
                  <KnowledgeBrick
                    id="mem-signe-negatif"
                    variant="new"
                    compact
                    lead="S’il ne fallait retenir qu’une chose de ce module :"
                  />
                </>
              )}
            </div>
          ),
        },
        {
          // L'intitulé du learning point dit « REPRÉSENTER l'ensemble des
          // solutions sur une droite ». C'était un QCM de notation, avec le
          // dessin révélé APRÈS la réponse : l'élève ne représentait rien.
          // Il pose maintenant les trois décisions lui-même — la borne, le
          // crochet, le sens — et la notation ne vient qu'ensuite.
          num: 3, title: 'Représente les solutions',
          subtitle: 'Pose la borne sur la droite, choisis le crochet, puis le côté. Tu viens de trouver x ≥ −2.',
          done: builtOk,
          content: (kit) => (
            <div className="space-y-3">
              <SolutionBuilder
                target={{ bound: -2, closed: true, toRight: true }}
                value={sol}
                onChange={(next) => {
                  setSol(next);
                  const ok = next.bound === -2 && next.closed === true && next.toRight === true;
                  if (ok && !builtOk) { setBuiltOk(true); kit.react?.(true); }
                }}
                min={-6} max={6} step={1}
              />
              {builtOk && (
                <TapQuestion prompt="Comment écrit-on l’ensemble que tu viens de dessiner ?"
                  options={['[−2 ; +∞[', ']−∞ ; −2]', ']−2 ; +∞[', '[2 ; +∞[']} cols={2} correct={0}
                  explain="Le crochet tourné vers l’intérieur en −2 dit « borne incluse » ; la bande file vers +∞, où le crochet est toujours ouvert. C’est le dessin que tu viens de poser."
                  explainWrong="Regarde ton dessin : la bande part de −2 INCLUS (crochet fermé) et va vers +∞. Du côté de l’infini, le crochet reste toujours ouvert."
                  requires={['methode-resoudre-inequation', 'inequation-infinite', 'intervalle', 'intervalle-crochets']}
                  solved={lineDone} onAnswered={() => setLineDone(true)} />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'En série', done: batchDone,
          content: (
            <BatchChoiceQuestion intro={<p className="text-sm text-slate-600">L’ensemble des solutions de chaque inéquation :</p>}
              rows={[
                { id: 'r1', label: '2x > 6', options: [']3 ; +∞[', '[3 ; +∞[', ']−∞ ; 3['], correct: 0 },
                { id: 'r2', label: '−x ≤ 5', options: [']−∞ ; −5]', '[−5 ; +∞[', ']−∞ ; 5]'], correct: 1, correction: '× (−1) retourne : x ≥ −5.' },
                { id: 'r3', label: '4 − x < 1', options: [']3 ; +∞[', ']−∞ ; 3[', ']−3 ; +∞['], correct: 0, correction: '−x < −3 puis × (−1) : x > 3.' },
                { id: 'r4', label: '5x ≥ 5x + 1', options: ['ℝ', '∅', '[1 ; +∞['], correct: 1, correction: '0 ≥ 1 est faux : aucune solution.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => <Feedback tone={allRight ? 'ok' : 'ko'}>{allRight ? 'Quatre sur quatre.' : `${nCorrect} / ${total}.`} Diviser par un positif : le sens reste. Par un négatif : il se retourne. Et une inéquation peut n’avoir aucune solution — ou toutes.</Feedback>}
              requires={['methode-resoudre-inequation', 'regle-signe-retourne', 'regle-nombre-de-solutions', 'intervalle', 'intervalle-crochets', 'ensemble-reels']}
              solved={batchDone} onAnswered={() => setBatchDone(true)} />
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
