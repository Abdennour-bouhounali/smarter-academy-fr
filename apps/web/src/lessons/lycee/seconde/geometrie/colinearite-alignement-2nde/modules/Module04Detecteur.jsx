import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorPlane, { Lamp, ComponentStepper } from '../components/VectorPlane';
import { det, detText, addVec, fitRange, formatVec, fr, isZeroVec, parseSigned } from '../components/colinUtils';

/**
 * Module 4 — MANIPULATION : « Le détecteur ».
 *
 * ACTION            l'élève règle les coordonnées de u et de v (− / +, ou
 *                   glisse l'extrémité du vecteur choisi).
 * CHANGEMENT        le parallélogramme construit sur u et v se déforme ; le
 *                   calcul x·y′ − y·x′ se réécrit ; un voyant « det = 0 ».
 * OBSERVATION       le déterminant s'annule EXACTEMENT quand le parallélogramme
 *                   s'aplatit (u et v sur le même rail) ; son signe change
 *                   quand v traverse le rail ; |det| = 1 pour un presque-aligné.
 * SENS MATHÉMATIQUE det(u, v) = x y′ − y x′ ; |det| = aire du parallélogramme ;
 *                   det = 0 ⇔ colinéaires. Un outil qui détecte une propriété
 *                   géométrique, pas une formule à retenir d'abord.
 * Controlled variable : les quatre coordonnées.
 * Expected observation (aha) : « plat ⇔ zéro » ; l'œil hésite pour (3 ; 1) et
 *   (4 ; 1), le détecteur dit −1.
 * Misconception targeted : det = x y′ + y x′ ; ordre des produits inversé ;
 *   « ça a l'air colinéaire ».
 */
export default function Module04Detecteur() {
  const [prediction, setPrediction] = useState(null);
  const [u, setU] = useState({ x: 3, y: 1 });
  const [v, setV] = useState({ x: 1, y: 2 });
  const [drag, setDrag] = useState('v');
  const [zeroSeen, setZeroSeen] = useState(false);
  const [signs, setSigns] = useState(() => new Set());
  const [nearSeen, setNearSeen] = useState(false);
  const [n3, setN3] = useState(false);
  const [q4, setQ4] = useState(false);

  const D = det(u, v);
  const sum = addVec(u, v);
  const range = fitRange([u, v, sum], { min: 5 });
  const flat = D === 0;
  const done2 = signs.has('+') && signs.has('-') && nearSeen;

  const record = (nu, nv, react) => {
    const d = det(nu, nv);
    let hit = false;
    if (d === 0 && !isZeroVec(nu) && !isZeroVec(nv) && !zeroSeen) { setZeroSeen(true); hit = true; }
    if (zeroSeen) {
      if (d !== 0) { const s = new Set(signs); const key = d > 0 ? '+' : '-'; if (!s.has(key)) { s.add(key); setSigns(s); hit = true; } }
      if (Math.abs(d) === 1 && !nearSeen) { setNearSeen(true); hit = true; }
    }
    if (hit) react?.(true);
  };
  const setCoord = (which, key, val, react) => {
    const nu = which === 'u' ? { ...u, [key]: val } : u;
    const nv = which === 'v' ? { ...v, [key]: val } : v;
    if (isZeroVec(nu) || isZeroVec(nv)) return; // le vecteur nul ne construit aucun parallélogramme
    setU(nu); setV(nv); record(nu, nv, react);
  };
  const onDrag = (p, react) => {
    const q = { x: p.x, y: p.y };
    if (isZeroVec(q)) return;
    if (drag === 'u') { setU(q); record(q, v, react); } else { setV(q); record(u, q, react); }
  };

  const lab = (kit) => (
    <div className="space-y-3">
      <div className="flex justify-center gap-2" role="group" aria-label="Vecteur à déplacer">
        {['u', 'v'].map((w) => (
          <button key={w} type="button" aria-pressed={drag === w} onClick={() => setDrag(w)} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${drag === w ? (w === 'u' ? 'bg-violet-600 border-violet-700 text-white' : 'bg-emerald-600 border-emerald-700 text-white') : 'bg-white border-slate-300 text-slate-700'}`}>Déplacer {w}</button>
        ))}
      </div>
      <VectorPlane
        range={range}
        points={[{ id: 'u', ...u, color: drag === 'u' ? undefined : 'violet', r: 5 }, { id: 'v', ...v, color: drag === 'v' ? undefined : 'emerald', r: 5 }]}
        draggableId={drag}
        onPointChange={(p) => onDrag(p, kit.react)}
        polygons={[{ id: 'para', points: [{ x: 0, y: 0 }, u, sum, v], fill: flat ? '#f59e0b' : '#a7f3d0', fillOpacity: flat ? 0.0 : 0.45, stroke: flat ? '#f59e0b' : '#059669', strokeWidth: flat ? 4 : 1.5 }]}
        vectors={[{ id: 'u', from: { x: 0, y: 0 }, to: u, color: 'violet', width: 5 }, { id: 'v', from: { x: 0, y: 0 }, to: v, color: 'emerald', width: 3 }]}
        legend={[{ id: 'u', label: 'u', value: formatVec(u), color: 'violet' }, { id: 'v', label: 'v', value: formatVec(v), color: 'emerald' }]}
        ariaLabel={`Repère : u ${formatVec(u)}, v ${formatVec(v)}, déterminant ${fr(D)} — déplace ${drag}`}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="flex flex-wrap gap-2 justify-center rounded-xl border border-violet-200 bg-violet-50/60 p-2">
          <ComponentStepper label="x de u" value={u.x} min={-6} max={6} onChange={(x) => setCoord('u', 'x', x, kit.react)} tone="violet" />
          <ComponentStepper label="y de u" value={u.y} min={-6} max={6} onChange={(y) => setCoord('u', 'y', y, kit.react)} tone="violet" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center rounded-xl border border-emerald-200 bg-emerald-50/60 p-2">
          <ComponentStepper label="x de v" value={v.x} min={-6} max={6} onChange={(x) => setCoord('v', 'x', x, kit.react)} tone="emerald" />
          <ComponentStepper label="y de v" value={v.y} min={-6} max={6} onChange={(y) => setCoord('v', 'y', y, kit.react)} tone="emerald" />
        </div>
      </div>
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1" aria-live="polite">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">det(u, v) = x<sub>u</sub> × y<sub>v</sub> − y<sub>u</sub> × x<sub>v</sub></p>
        <p className="font-mono text-sm sm:text-base font-bold text-slate-800 tabular-nums break-words">{detText(u, v)}</p>
        <div className="flex gap-2 flex-wrap justify-center">
          <Lamp label="Parallélogramme" on={flat} onText="plat — aire 0" offText={`aire ${fr(Math.abs(D))}`} tone="amber" />
          <Lamp label="u et v" on={flat} onText="colinéaires (det = 0)" offText={`non colinéaires (det = ${fr(D)})`} />
        </div>
      </div>
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Le détecteur"
      moduleSubtitle="Un nombre calculé sur les coordonnées, un parallélogramme qui s’aplatit : le déterminant détecte la colinéarité."
      estimatedTime="10 min"
      brief={{ tag: '🔎 Mission 04', title: 'Le nombre x·y′ − y·x′ du module 3 s’appelle le déterminant de (u, v). Il se recalcule à chaque geste.', tone: 'indigo', body: <p>Déforme le parallélogramme construit sur u et v. Quand le déterminant vaut-il 0 ?</p> }}
      steps={[
        {
          num: 1, title: 'Annule le déterminant', subtitle: 'Sans utiliser le vecteur nul.', done: zeroSeen,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="que doit-il se passer pour que le déterminant soit nul ?" options={[{ id: 'rail', label: 'u et v sur le même rail' }, { id: 'perp', label: 'u et v perpendiculaires' }, { id: 'long', label: 'u et v de même longueur' }]} value={prediction} onChange={setPrediction} disabled={zeroSeen} />
              {lab(kit)}
              {zeroSeen ? (
                <>
                  <Feedback tone="ok">{prediction === 'rail' ? 'Ta prédiction : sur le même rail. Le détecteur confirme' : prediction ? `Ta prédiction : ${prediction === 'perp' ? 'perpendiculaires' : 'même longueur'}. Le détecteur te contredit` : 'Le détecteur tranche'} : det = 0 exactement quand le parallélogramme est <strong>plat</strong>, c’est-à-dire quand u et v sont colinéaires. Et |det| est son aire, en carreaux.</Feedback>
                  <KnowledgeBrick
                    id="colin-determinant"
                    variant="new"
                    compact
                    lead={<>Le nombre affiché sous le parallélogramme, que tu viens d’annuler : le déterminant.</>}
                  />
                  <KnowledgeBrick
                    id="colin-critere-det"
                    variant="new"
                    compact
                    lead={<>Ce que tu viens de vérifier au geste : le parallélogramme plat, et det = 0, ensemble.</>}
                  />
                </>
              ) : (
                <Feedback tone="info">det = {fr(D)} : le parallélogramme a une aire de {fr(Math.abs(D))} carreaux. Aplatis-le : amène v sur le rail de u (par exemple v = (6 ; 2), ou (−3 ; −1)).</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Le signe, et le presque-plat', subtitle: 'Obtiens un déterminant positif, un négatif, puis un déterminant de 1 ou −1.', done: done2,
          content: (kit) => (
            <div className="space-y-3">
              {lab(kit)}
              {done2 ? (
                <>
                  <Feedback tone="ok">Le signe dit de quel côté du rail se trouve v (à gauche de u : positif ; à droite : négatif). Et un déterminant de <strong>±1</strong> — u (3 ; 1) et v (4 ; 1), par exemple — c’est un parallélogramme d’aire 1 : l’œil hésite, <strong>le déterminant tranche</strong>. Zéro, ou pas zéro : rien d’autre ne compte pour la colinéarité.</Feedback>
                  <KnowledgeBrick
                    id="colin-vocabulaire-determinant"
                    variant="new"
                    compact
                    lead={<>Le mot pour le nombre que tu viens de faire changer de signe, puis presque annuler.</>}
                  />
                </>
              ) : (
                <Feedback tone="info">{!signs.has('+') ? 'Il manque un déterminant positif. ' : ''}{!signs.has('-') ? 'Il manque un déterminant négatif. ' : ''}{!nearSeen ? 'Il manque un presque-plat : det = 1 ou −1 (essaie u = (3 ; 1), v = (4 ; 1)).' : ''}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3, title: 'Calculer', done: n3,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="colin-formule-det"
                variant="new"
                lead={<>La formule que tu as déjà utilisée au geste, écrite cette fois sans dessin.</>}
              />
              <NumericQuestion
                prompt="Sans dessin : det(u, v) pour u(3 ; 5) et v(2 ; 4) ?"
                expected={2} parse={parseSigned} display="2" width="w-24"
                explain="det = x_u × y_v − y_u × x_v = 3 × 4 − 5 × 2 = 12 − 10 = 2. Non nul : u et v ne sont pas colinéaires (presque : aire 2)."
                explainFor={(n) => (n === 22 ? '22 = 12 + 10 : tu as AJOUTÉ les produits en croix. Le déterminant est leur DIFFÉRENCE : 12 − 10 = 2.' : n === -2 ? '−2 = 10 − 12 : l’ordre est inversé. On commence par x_u × y_v = 3 × 4 = 12, puis on retire y_u × x_v = 5 × 2 = 10 : 2.' : n === 0 ? 'Non : 3 × 4 = 12 et 5 × 2 = 10 ne sont pas égaux. det = 12 − 10 = 2, u et v ne sont pas colinéaires.' : `det = 3 × 4 − 5 × 2 = 12 − 10 = 2, pas ${fr(n)}.`)}
                requires={['colin-determinant', 'colin-formule-det']}
                solved={n3} onAnswered={() => setN3(true)} />
              {n3 && (
                <KnowledgeBrick
                  id="colin-calculer-det"
                  variant="new"
                  lead={<>Le calcul que tu viens de faire, avec ses deux pièges nommés.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Décider', done: q4,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="u(4 ; 6) et v(6 ; 9) sont-ils colinéaires ?"
                options={['Oui : det = 4 × 9 − 6 × 6 = 0', 'Non : 6 ≠ 9, les coordonnées diffèrent', 'Non : det = 4 × 6 − 6 × 9 = −30']} cols={1} correct={0}
                explain="det(u, v) = 4 × 9 − 6 × 6 = 36 − 36 = 0 : colinéaires (v = 1,5·u). Le détecteur remplace le dessin."
                explainWrong="Calcule : x_u × y_v − y_u × x_v = 4 × 9 − 6 × 6 = 36 − 36 = 0. Zéro : colinéaires, v = 1,5·u. Des coordonnées différentes n’empêchent pas la colinéarité ; et attention à l’ordre des produits."
                requires={['colin-critere-det', 'colin-calculer-det']}
                solved={q4} onAnswered={() => setQ4(true)} />
              {q4 && (
                <KnowledgeBrick
                  id="mem-colin-det-zero"
                  variant="new"
                  lead={<>Ce que tu viens d’appliquer, en une ligne à retenir.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
