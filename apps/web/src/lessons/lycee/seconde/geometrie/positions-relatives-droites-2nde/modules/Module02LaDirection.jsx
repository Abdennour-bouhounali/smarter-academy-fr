import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoLinesPlane, { TONES } from '../components/TwoLinesPlane';
import HandlePad from '../components/HandlePad';
import LineReadouts from '../components/LineReadouts';
import PredictionChips from '../components/PredictionChips';
import { moveHandle } from './Module01LeLaboratoireDesDeuxDroites';
import { lineFromPointVector, det, coupleText, slopeOf, fracText, formatDec, parseDec } from '../components/droitesUtils';

/**
 * Module 2 — DÉCOUVERTE : la direction, en nombres.
 *
 * Activity               la même scène, mais SEULE la flèche v bouge ; un
 *                        nombre est calculé en direct : det(u, v) = u_x·v_y − u_y·v_x
 *                        (réactivé de « Colinéarité et alignement »), et les
 *                        deux pentes.
 * Student action         orienter v ; annuler le déterminant ; rendre v vertical.
 * Controlled variable    v (u, A et B sont figés).
 * Mathematical state     { A, u, B, v } ; det et pentes DÉRIVÉS.
 * Visual consequence     det s'annule exactement quand I disparaît ; les
 *                        pentes deviennent égales au même instant ; v vertical
 *                        n'a pas de pente, mais det tranche quand même.
 * Expected observation   « det(u, v) = 0 ⟺ même direction ⟺ parallèles (ou
 *                        confondues) » ; « pentes égales, même chose — sauf
 *                        que la verticale n'a pas de pente ».
 * Misconception targeted « pentes différentes ⇒ peut-être parallèles quand
 *                        même » ; « une droite verticale a une pente ».
 * Formalization          le critère de direction, écrit en pied de module
 *                        (carte des connaissances).
 */
const START = { A: { x: -3, y: -1 }, u: { x: 2, y: 1 }, B: { x: 3, y: -1 }, v: { x: 1, y: -1 } };
const slopeText = (u) => { const m = slopeOf(lineFromPointVector({ x: 0, y: 0 }, u)); return m === null ? 'aucune (verticale)' : fracText(m); };

function DirectionLab({ state, onChange, disabled }) {
  const handles = [{ id: 'vTip', name: 'v', color: TONES.pink, x: state.B.x + state.v.x, y: state.B.y + state.v.y }];
  const L1 = lineFromPointVector(state.A, state.u);
  const L2 = lineFromPointVector(state.B, state.v);
  const d = det(state.u, state.v);
  const lines = [
    { id: 'd1', name: '(d₁)', line: L1, tone: 'indigo', anchor: state.A, vector: state.u },
    { id: 'd2', name: '(d₂)', line: L2, tone: 'rose', anchor: state.B, vector: state.v },
  ];
  const tip = handles[0];
  const canMove = (dx, dy) => !!moveHandle(state, 'vTip', { x: tip.x + dx, y: tip.y + dy });
  return (
    <div className="space-y-3">
      <TwoLinesPlane lines={lines} handles={handles} activeId={disabled ? null : 'vTip'}
        onHandleChange={(id, p) => { const next = moveHandle(state, id, p); if (next) onChange(next); }} disabled={disabled} />
      {!disabled && (
        <HandlePad handles={handles} activeId="vTip" onActive={() => {}} canMove={canMove}
          onMove={(dx, dy) => { const next = moveHandle(state, 'vTip', { x: tip.x + dx, y: tip.y + dy }); if (next) onChange(next); }} />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm font-mono font-bold tabular-nums" aria-live="polite">
        <div className="px-3 py-2 rounded-xl border bg-white border-slate-200 text-slate-800">
          <div className="text-xs font-sans font-semibold uppercase tracking-wide text-slate-500">u et v</div>
          u {coupleText(state.u.x, state.u.y)} · v {coupleText(state.v.x, state.v.y)}
        </div>
        <div className={`px-3 py-2 rounded-xl border ${d === 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 text-slate-800'}`}>
          <div className="text-xs font-sans font-semibold uppercase tracking-wide text-slate-500">det(u, v) = u_x·v_y − u_y·v_x</div>
          {formatDec(state.u.x)} × {formatDec(state.v.y)} − {formatDec(state.u.y)} × {formatDec(state.v.x)} = <strong>{formatDec(d)}</strong>
        </div>
        <div className="px-3 py-2 rounded-xl border bg-white border-slate-200 text-slate-800">
          <div className="text-xs font-sans font-semibold uppercase tracking-wide text-slate-500">pentes</div>
          m₁ = {slopeText(state.u)} · m₂ = {slopeText(state.v)}
        </div>
      </div>
      <LineReadouts L1={L1} L2={L2} show={{ equations: false, position: true, intersection: true }} />
    </div>
  );
}

export default function Module02LaDirection() {
  const [state, setState] = useState(START);
  const [pred1, setPred1] = useState(null);
  const [snap1, setSnap1] = useState(null);
  const [snap2, setSnap2] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = snap1 !== null;
  const done2 = snap2 !== null;

  const change1 = (next, react) => { setState(next); if (det(next.u, next.v) === 0) { setSnap1(next); react?.(true); } };
  const change2 = (next, react) => { setState(next); if (next.v.x === 0) { setSnap2(next); react?.(true); } };

  const steps = [
    {
      num: 1,
      title: 'Annule le déterminant',
      subtitle: 'Oriente v et regarde le nombre det(u, v). Fais-le tomber à 0.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="au moment où (d₂) devient parallèle à (d₁), que vaut det(u, v) ?"
            options={[{ id: 'zero', label: 'Il vaut 0' }, { id: 'max', label: 'Il est le plus grand possible' }, { id: 'same', label: 'Il ne change pas' }]}
            value={pred1} onChange={setPred1} disabled={done1} />
          <DirectionLab state={done1 ? snap1 : state} onChange={(n) => change1(n, kit.react)} disabled={done1} />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'zero' ? 'Ta prédiction était la bonne' : pred1 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : det(u, v) vaut <strong>0</strong> exactement quand
              v a la direction de u — v = {coupleText(snap1.v.x, snap1.v.y)} est colinéaire à u = {coupleText(snap1.u.x, snap1.u.y)}. Et au même instant, les pentes sont
              devenues égales : m₁ = m₂ = {slopeText(snap1.u)}. Sans dessin, <strong>un seul nombre</strong> décide.
            </Feedback>
          ) : (
            <Feedback tone="info">det(u, v) = {formatDec(det(state.u, state.v))} : les droites sont sécantes. Il faut que v et u aient la <em>même direction</em>.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le piège de la verticale',
      subtitle: 'Mets v à la verticale (v_x = 0). Que devient la pente de (d₂) ? Et le déterminant ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <DirectionLab state={done2 ? snap2 : (done1 ? state : START)} onChange={(n) => change2(n, kit.react)} disabled={done2 || !done1} />
          {done2 ? (
            <Feedback tone="ok">
              v = {coupleText(snap2.v.x, snap2.v.y)} : (d₂) est verticale, et sa pente <strong>n’existe pas</strong> (on diviserait par v_x = 0). Comparer les pentes ne
              peut donc rien dire — mais det(u, v) = {formatDec(det(snap2.u, snap2.v))} ≠ 0 tranche : <strong>sécantes</strong>. Le déterminant marche toujours ; les pentes,
              seulement quand les deux droites en ont une.
            </Feedback>
          ) : (
            <Feedback tone="info">Amène la pointe de v exactement au-dessus (ou au-dessous) de B.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Sans dessin',
      done: q3,
      content: (
        <NumericQuestion
          prompt="Deux droites ont pour vecteurs directeurs u(2 ; 1) et v(−4 ; −2). Calcule det(u, v) = u_x·v_y − u_y·v_x."
          expected={0}
          parse={parseDec}
          display={formatDec(0)}
          explain={<span>2 × (−2) − 1 × (−4) = −4 + 4 = 0 : même direction, les droites sont <strong>parallèles ou confondues</strong> — il faudra un point pour départager.</span>}
          explainFor={(n) => (n === -8 ? 'Tu as calculé 2 × (−4) : c’est u_x · v_x. Le déterminant croise les coordonnées : u_x · v_y − u_y · v_x = 2 × (−2) − 1 × (−4) = 0.'
            : n === -2 || n === 2 ? 'Tu as sans doute additionné. Le déterminant est une DIFFÉRENCE de deux produits croisés : 2 × (−2) − 1 × (−4) = −4 + 4 = 0.'
            : '2 × (−2) − 1 × (−4) = −4 − (−4) = 0 : les deux vecteurs ont la même direction ((−4 ; −2) = −2·(2 ; 1)).')}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Parallèles ou sécantes ?',
      done: q4,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Pour chaque paire de vecteurs directeurs, décide. Le déterminant ou les pentes — à toi de choisir l’outil.</p>}
          rows={[
            { id: 'r1', label: 'u(5 ; 2) et v(−10 ; −4)', options: ['parallèles ou confondues', 'sécantes'], correct: 0, correction: 'det = 5 × (−4) − 2 × (−10) = 0' },
            { id: 'r2', label: 'u(2 ; 3) et v(3 ; 2)', options: ['parallèles ou confondues', 'sécantes'], correct: 1, correction: 'det = 2 × 2 − 3 × 3 = −5 ≠ 0' },
            { id: 'r3', label: 'u(0 ; 1) et v(0 ; −4)', options: ['parallèles ou confondues', 'sécantes'], correct: 0, correction: 'deux verticales : det = 0 × (−4) − 1 × 0 = 0' },
            { id: 'r4', label: 'u(1 ; −1) et v(1 ; 1)', options: ['parallèles ou confondues', 'sécantes'], correct: 1, correction: 'pentes −1 et 1 : différentes' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Même direction ⟺ det(u, v) = 0 ⟺ (quand elles existent) pentes égales. Le déterminant n’a pas
              d’exception ; les pentes en ont une, la verticale.
            </Feedback>
          )}
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La direction"
      moduleSubtitle="Sans dessin : un nombre calculé sur u et v dit si les droites se croisent"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Quatre couples de nombres suffisent-ils ?',
        tone: 'violet',
        body: (
          <p>
            Au module 1, c’est la <strong>direction</strong> de v qui a fait disparaître le point commun. Cette fois, un nombre est calculé sous tes yeux :{' '}
            <MathText>{'$\\det(\\vec u, \\vec v) = u_x\\,v_y - u_y\\,v_x$'}</MathText>. Observe-le pendant que tu orientes v.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          Le déterminant ne dit pas tout : quand il vaut 0, les droites peuvent être parallèles <em>ou</em> confondues. Module suivant : les
          <strong> équations</strong>, qui décident tout — y compris ça.
        </KnowledgeSnapshot>
      }
    />
  );
}
