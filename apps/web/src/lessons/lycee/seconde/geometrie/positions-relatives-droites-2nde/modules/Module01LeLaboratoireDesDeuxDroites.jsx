import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TwoLinesPlane, { TONES } from '../components/TwoLinesPlane';
import HandlePad from '../components/HandlePad';
import LineReadouts from '../components/LineReadouts';
import PredictionChips from '../components/PredictionChips';
import { lineFromPointVector, relativePosition, det, coupleText, frameFor, inRange, POSITION_LABEL } from '../components/droitesUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le laboratoire des
 * deux droites.
 *
 * Activity               deux trajectoires rectilignes (deux drones vus du
 *                        dessus) sur une carte quadrillée.
 * Mathematical objective deux droites ont 1, 0 ou une infinité de points
 *                        communs ; la DIRECTION décide sécantes / parallèles,
 *                        la POSITION décide parallèles / confondues.
 * Student action         choisir une poignée (A, u, B, v), la déplacer :
 *                        glisser sur le plan, croix directionnelle, clavier.
 * Controlled variable    UNE poignée à la fois — v seule (étape 1), B seule
 *                        (étape 2), puis les quatre (étape 3).
 * Mathematical state     { A, u, B, v } entiers ; tout le reste (droites
 *                        canoniques, position, I) est dérivé (droitesUtils).
 * Visual consequence     les deux droites se redessinent ; I apparaît,
 *                        disparaît partout à la fois, ou toute la droite
 *                        devient commune (trait large).
 * Expected observation   « déplacer B ne change jamais le nombre de points
 *                        communs — sauf quand B tombe sur (d₁) » ; « rendre
 *                        v parallèle à u fait disparaître I d'un coup ».
 * Misconception targeted « pour rendre parallèle, il faut éloigner la
 *                        droite » (position vs direction) ; « deux droites
 *                        qui ne se coupent pas SUR LE DESSIN sont parallèles ».
 * Formalization          rien n'est calculé ici : le module se termine sur la
 *                        question « avec seulement les quatre couples de
 *                        nombres, peut-on décider ? » (module 2).
 */
const START = { A: { x: -3, y: -1 }, u: { x: 2, y: 1 }, B: { x: 3, y: -1 }, v: { x: 1, y: -1 } };
const { range: RANGE } = frameFor(6);
const ESCAPE_AFTER = 14;

const HANDLES = {
  A: { id: 'A', name: 'A', color: TONES.indigo },
  uTip: { id: 'uTip', name: 'u', color: TONES.violet },
  B: { id: 'B', name: 'B', color: TONES.rose },
  vTip: { id: 'vTip', name: 'v', color: TONES.pink },
};

/** Les quatre poignées, dérivées de l'état. */
const handlesOf = (s, ids) => ids.map((id) => {
  const h = HANDLES[id];
  const p = id === 'A' ? s.A : id === 'B' ? s.B : id === 'uTip' ? { x: s.A.x + s.u.x, y: s.A.y + s.u.y } : { x: s.B.x + s.v.x, y: s.B.y + s.v.y };
  return { ...h, ...p };
});

/** Applique une nouvelle position de poignée ; refuse un vecteur nul ou une sortie du cadre. */
export function moveHandle(s, id, p) {
  const P = { x: Math.round(p.x), y: Math.round(p.y) };
  if (!inRange(RANGE, P)) return null;
  if (id === 'A') { if (!inRange(RANGE, { x: P.x + s.u.x, y: P.y + s.u.y })) return null; return { ...s, A: P }; }
  if (id === 'B') { if (!inRange(RANGE, { x: P.x + s.v.x, y: P.y + s.v.y })) return null; return { ...s, B: P }; }
  if (id === 'uTip') { const u = { x: P.x - s.A.x, y: P.y - s.A.y }; if (!u.x && !u.y) return null; return { ...s, u }; }
  const v = { x: P.x - s.B.x, y: P.y - s.B.y };
  if (!v.x && !v.y) return null;
  return { ...s, v };
}

const linesOf = (s) => [
  { id: 'd1', name: '(d₁)', line: lineFromPointVector(s.A, s.u), tone: 'indigo', anchor: s.A, vector: s.u },
  { id: 'd2', name: '(d₂)', line: lineFromPointVector(s.B, s.v), tone: 'rose', anchor: s.B, vector: s.v },
];
const posOf = (s) => relativePosition(lineFromPointVector(s.A, s.u), lineFromPointVector(s.B, s.v));

function Lab({ state, ids, activeId, onActive, onChange, disabled, halfSpan = 6 }) {
  const handles = handlesOf(state, ids);
  const lines = linesOf(state);
  const active = handles.find((h) => h.id === activeId);
  const tipOf = (id) => handles.find((h) => h.id === id);
  const canMove = (dx, dy) => !!active && !!moveHandle(state, activeId, { x: active.x + dx, y: active.y + dy });
  return (
    <div className="space-y-3">
      <TwoLinesPlane
        lines={lines} handles={handles} activeId={disabled ? null : activeId} halfSpan={halfSpan}
        onHandleChange={(id, p) => { const next = moveHandle(state, id, p); if (next) onChange(next); }}
        disabled={disabled}
      />
      {!disabled && (
        <HandlePad handles={handles} activeId={activeId} onActive={onActive} canMove={canMove}
          onMove={(dx, dy) => { const t = tipOf(activeId); const next = moveHandle(state, activeId, { x: t.x + dx, y: t.y + dy }); if (next) onChange(next); }} />
      )}
      <div className="flex flex-wrap gap-2 text-sm font-mono font-bold tabular-nums">
        <span className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800">A {coupleText(state.A.x, state.A.y)}</span>
        <span className="px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-200 text-violet-800">u {coupleText(state.u.x, state.u.y)}</span>
        <span className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">B {coupleText(state.B.x, state.B.y)}</span>
        <span className="px-3 py-1.5 rounded-lg bg-pink-50 border border-pink-200 text-pink-800">v {coupleText(state.v.x, state.v.y)}</span>
      </div>
      <LineReadouts L1={lines[0].line} L2={lines[1].line} show={{ equations: false, position: true, intersection: true }} />
    </div>
  );
}

export default function Module01LeLaboratoireDesDeuxDroites() {
  const [state, setState] = useState(START);
  const [active, setActive] = useState('B');   // l'étape 3 reprend la poignée de l'étape 2
  const [pred1, setPred1] = useState(null);
  const [moves1, setMoves1] = useState(0);
  const [snap1, setSnap1] = useState(null);       // l'état figé de l'étape 1, une fois réussie
  const [moves2, setMoves2] = useState(0);
  const [snap2, setSnap2] = useState(null);
  const [seen, setSeen] = useState(() => new Set());
  const [q4, setQ4] = useState(false);

  const done1 = snap1 !== null;
  const done2 = snap2 !== null;
  const done3 = seen.has('secantes') && seen.has('paralleles') && seen.has('confondues');
  const pos = posOf(state);
  const escape = (onClick, label = 'Je bloque — montre-moi') => (
    <button type="button" onClick={onClick}
      className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
      {label}
    </button>
  );

  // Étape 1 : v seule. But : plus aucun point commun (v colinéaire à u).
  const change1 = (next, react) => {
    setState(next); setMoves1((n) => n + 1);
    if (posOf(next) !== 'secantes') { setSnap1(next); react?.(true); }
  };
  // Étape 2 : B seule, directions figées. But : confondues.
  const change2 = (next, react) => {
    setState(next); setMoves2((n) => n + 1);
    if (posOf(next) === 'confondues') { setSnap2(next); react?.(true); }
  };
  // Étape 3 : tout libre. But : produire les trois situations.
  const change3 = (next, react) => {
    setState(next);
    const p = posOf(next);
    if (!seen.has(p)) {
      const s = new Set(seen); s.add(p); setSeen(s);
      if (s.size === 3) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Fais disparaître le point commun',
      subtitle: 'Seule la flèche v de (d₂) est réglable. Trouve comment les deux droites n’ont plus AUCUN point commun.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="pour que les deux trajectoires ne se croisent plus, il faut…"
            options={[{ id: 'dir', label: 'Changer la direction de (d₂)' }, { id: 'pos', label: 'Éloigner B de (d₁)' }, { id: 'les2', label: 'Les deux à la fois' }]}
            value={pred1} onChange={setPred1} disabled={done1}
          />
          <Lab state={done1 ? snap1 : state} ids={['vTip']} activeId="vTip" onActive={() => {}} onChange={(n) => change1(n, kit.react)} disabled={done1} />
          {!done1 && moves1 >= ESCAPE_AFTER && escape(() => change1({ ...state, v: { ...state.u } }, kit.react))}
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'dir' ? 'Ta prédiction était la bonne' : pred1 === 'pos' ? 'Ta prédiction : éloigner B. Tu n’as pas touché à B, et pourtant' : pred1 === 'les2' ? 'Ta prédiction : les deux. Un seul a suffi' : 'Regarde'} :
              en donnant à v <strong>la direction de u</strong> ({coupleText(snap1.v.x, snap1.v.y)}), le point I a disparu <strong>d’un coup, partout</strong> — pas seulement dans le cadre.
              Les droites sont <strong>{POSITION_LABEL[posOf(snap1)]}</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {moves1 === 0 ? 'Choisis la poignée v (elle est déjà active), puis glisse-la, ou utilise la croix. Le point I t’indique le point commun.' :
                det(state.u, state.v) !== 0 && Math.abs(det(state.u, state.v)) <= 2 ? 'Tu chauffes : I est parti loin, mais il existe encore. Continue.' :
                'Un point commun encore. Observe comment I bouge quand la direction de v change.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Déplace B — sans toucher aux directions',
      subtitle: 'Les flèches sont figées, parallèles. Déplace B : le nombre de points communs change-t-il ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <Lab state={done2 ? snap2 : (done1 ? state : START)} ids={['B']} activeId="B" onActive={() => {}} onChange={(n) => change2(n, kit.react)} disabled={done2 || !done1} />
          {!done2 && done1 && moves2 >= ESCAPE_AFTER && escape(() => change2({ ...state, B: { x: state.A.x + state.u.x, y: state.A.y + state.u.y } }, kit.react))}
          {done2 ? (
            <Feedback tone="ok">
              B est tombé <strong>sur (d₁)</strong> : les deux droites ont alors <strong>tous</strong> leurs points en commun — elles sont{' '}
              <strong>confondues</strong>. {moves2 > 1 ? `Avant cela, tu as déplacé B ${moves2 - 1} fois : le compte restait « aucun point commun ».` : 'Dès le premier déplacement — mais partout ailleurs, le compte serait resté « aucun point commun ».'}
              La direction décide entre <em>sécantes</em> et <em>parallèles</em> ; la position décide entre <em>parallèles</em> et <em>confondues</em>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {moves2 === 0 ? 'Glisse B où tu veux (ou utilise la croix). Vise aussi la droite (d₁) elle-même.' :
                `B a bougé ${moves2} fois : toujours aucun point commun. Que se passe-t-il si B est SUR (d₁) ?`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le tour complet',
      subtitle: 'Tout est libre. Fais apparaître les trois situations : sécantes, strictement parallèles, confondues.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <Lab state={state} ids={['A', 'uTip', 'B', 'vTip']} activeId={active} onActive={setActive} onChange={(n) => change3(n, kit.react)} disabled={done3 || !done2} />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Situations produites">
            {['secantes', 'paralleles', 'confondues'].map((p) => (
              <span key={p} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${seen.has(p) ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-slate-300 text-slate-500'}`}>
                {seen.has(p) ? '✓ ' : '○ '}{POSITION_LABEL[p]}
              </span>
            ))}
          </div>
          {done3 ? (
            <Feedback tone="ok">
              Trois situations, trois comptes : <strong>1</strong> point commun (sécantes), <strong>0</strong> (strictement parallèles), <strong>une infinité</strong> (confondues).
              Il n’en existe pas d’autre : deux droites distinctes qui ont deux points communs sont… la même droite.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Actuellement : <strong>{POSITION_LABEL[pos]}</strong>. {seen.has('secantes') ? '' : 'Pour des sécantes, donne à u et v deux directions différentes. '}
              {seen.has('paralleles') ? '' : 'Pour des parallèles, même direction et B hors de (d₁). '}
              {seen.has('confondues') ? '' : 'Pour des confondues, même direction et B sur (d₁).'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Combien de points communs ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Deux droites du plan peuvent-elles avoir exactement DEUX points communs ?"
          options={[
            'Non : elles en ont 0, 1, ou une infinité — jamais exactement deux.',
            'Oui, si elles se coupent deux fois.',
            'Oui, si elles sont presque parallèles.',
            'Oui, à condition que les droites soient assez longues.',
          ]}
          correct={0}
          cols={1}
          explain="Deux points distincts définissent UNE droite. Si deux droites partagent deux points, elles sont confondues et partagent alors tous leurs points. Restent trois cas : 1 (sécantes), 0 (strictement parallèles), une infinité (confondues)."
          explainWrong="Tu viens de le constater au laboratoire : dès que B est tombé sur (d₁) avec la même direction, TOUTE la droite est devenue commune. Une droite n’a pas de longueur, et deux droites ne peuvent pas se couper deux fois."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le laboratoire des deux droites"
      moduleSubtitle="Deux trajectoires rectilignes : se croisent-elles ? Où ? Peuvent-elles se croiser deux fois ?"
      estimatedTime="9 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Deux drones, deux trajectoires',
        tone: 'indigo',
        body: (
          <p>
            Vus du dessus, deux drones qui volent tout droit dessinent deux droites sur la carte : (d₁) passe par A avec la
            direction u, (d₂) passe par B avec la direction v. Le point <strong>I</strong> marque l’endroit où les trajectoires se croisent.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          Tu as tout fait <strong>avec le dessin</strong>. Mais un drone ne voit pas de dessin : il n’a que quatre couples de nombres —
          A, u, B, v. Peut-on décider, sans tracer, si deux trajectoires se croisent ? Module suivant : la direction en nombres.
        </KnowledgeSnapshot>
      }
    />
  );
}
