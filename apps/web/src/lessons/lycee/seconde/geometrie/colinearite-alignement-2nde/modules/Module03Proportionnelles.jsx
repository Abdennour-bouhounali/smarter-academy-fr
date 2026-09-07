import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorPlane from '../components/VectorPlane';
import Stepper from '../components/Stepper';
import { scaleVec, formatVec, fr, factor, parseSigned, det } from '../components/colinUtils';

/**
 * Module 3 — DISCOVERY : « Des coordonnées proportionnelles ».
 *
 * ACTION            l'élève règle k (−3 … 3, pas 0,5) ; v = k·u se redessine.
 * CHANGEMENT        v glisse le long du rail, se retourne pour k < 0, disparaît
 *                   en (0 ; 0) pour k = 0 ; le tableau des coordonnées suit.
 * OBSERVATION       quoi que vaille k, v reste sur le rail ; ses deux
 *                   coordonnées sont celles de u multipliées par le MÊME k.
 * SENS MATHÉMATIQUE v colinéaire à u ⇔ v = k·u ⇔ coordonnées proportionnelles.
 *                   On peut donc décider sans dessin : les produits en croix
 *                   x·y′ et y·x′ doivent être égaux.
 * Controlled variable : k.
 * Expected observation (aha) : (4 ; 3) n'est pas proportionnel à (2 ; 1) —
 *   ×2 et ×3 ; le vecteur nul (k = 0) est colinéaire à tout vecteur.
 * Misconception targeted : « les deux coordonnées ont grandi, donc c'est
 *   colinéaire » ; diviser par 0 pour une coordonnée nulle.
 * Laissé au module suivant : nommer x y′ − y x′ et l'interpréter.
 */
const U = { x: 2, y: 1 };
const RANGE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };

function ProportionTable({ u, v, k }) {
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto text-sm font-mono tabular-nums border-separate border-spacing-1" aria-label="Coordonnées de u et de v">
        <thead><tr><th className="px-2 text-slate-500 font-semibold text-xs text-left">vecteur</th><th className="px-3 text-slate-500 font-semibold text-xs">x</th><th className="px-3 text-slate-500 font-semibold text-xs">y</th></tr></thead>
        <tbody>
          <tr><td className="px-2 rounded-lg bg-violet-100 text-violet-800 font-bold">u</td><td className="px-3 text-center rounded-lg bg-white border border-slate-200 font-bold">{fr(u.x)}</td><td className="px-3 text-center rounded-lg bg-white border border-slate-200 font-bold">{fr(u.y)}</td></tr>
          <tr><td className="px-2 text-center text-xs text-slate-500" colSpan={3}>↓ × {fr(k)} sur chaque colonne ↓</td></tr>
          <tr><td className="px-2 rounded-lg bg-emerald-100 text-emerald-800 font-bold">v</td><td className="px-3 text-center rounded-lg bg-white border border-slate-200 font-bold">{fr(v.x)}</td><td className="px-3 text-center rounded-lg bg-white border border-slate-200 font-bold">{fr(v.y)}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default function Module03Proportionnelles() {
  const [k, setK] = useState(1);
  const [visited, setVisited] = useState(() => new Set([1]));
  const [b2, setB2] = useState(false);
  const [n3, setN3] = useState(false);
  const v = scaleVec(U, k);
  const done1 = visited.has(2) && [...visited].some((x) => x < 0) && [...visited].some((x) => !Number.isInteger(x));

  const changeK = (nk, react) => {
    setK(nk);
    if (!visited.has(nk)) { const s = new Set(visited); s.add(nk); setVisited(s); }
    const next = new Set(visited); next.add(nk);
    const ok = next.has(2) && [...next].some((x) => x < 0) && [...next].some((x) => !Number.isInteger(x));
    if (ok && !done1) react?.(true);
  };

  const pairs = [
    { id: 'r1', u: { x: 2, y: 1 }, v: { x: 6, y: 3 } },
    { id: 'r2', u: { x: 2, y: 1 }, v: { x: 4, y: 3 } },
    { id: 'r3', u: { x: 3, y: -2 }, v: { x: -1.5, y: 1 } },
    { id: 'r4', u: { x: 4, y: 0 }, v: { x: 6, y: 0 } },
  ];
  const cross = (p) => `${factor(p.u.x)} × ${factor(p.v.y)} = ${fr(p.u.x * p.v.y)} et ${factor(p.u.y)} × ${factor(p.v.x)} = ${fr(p.u.y * p.v.x)}`;

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Des coordonnées proportionnelles"
      moduleSubtitle="v = k·u : les coordonnées suivent le même facteur. Peut-on décider la colinéarité sans dessiner ?"
      estimatedTime="9 min"
      brief={{ tag: '✖️ Mission 03', title: 'Sur le rail, v est un multiple de u : v = k·u. Le nombre k est le seul réglage.', tone: 'indigo', body: <p>Fais varier k et regarde le tableau des coordonnées autant que le dessin.</p> }}
      steps={[
        {
          num: 1, title: 'Règle k', subtitle: 'Passe par k = 2, par un k négatif et par un k non entier.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <VectorPlane
                range={RANGE}
                rails={[{ id: 'rail', through: { x: 0, y: 0 }, dir: U, color: 'violet' }]}
                vectors={[{ id: 'u', from: { x: 0, y: 0 }, to: U, color: 'violet', width: 5 }, { id: 'v', from: { x: 0, y: 0 }, to: v, color: 'emerald', width: 3 }]}
                legend={[{ id: 'u', label: 'u', value: formatVec(U), color: 'violet' }, { id: 'v', label: `v = ${fr(k)}·u`, value: formatVec(v), color: 'emerald' }]}
                ariaLabel={`Repère : u (2 ; 1) et v = ${fr(k)} u = ${formatVec(v)}`}
              />
              <div className="flex justify-center"><Stepper label="k" value={k} onChange={(nk) => changeK(nk, kit.react)} min={-3} max={3} step={0.5} tone="emerald" /></div>
              <ProportionTable u={U} v={v} k={k} />
              {done1 ? (
                <>
                  <Feedback tone="ok">Quel que soit k, v reste sur le rail : <strong>colinéaire à u ⇔ v = k·u</strong>. Les coordonnées de v sont celles de u multipliées par le même k — elles sont <strong>proportionnelles</strong>. k &lt; 0 retourne le sens{visited.has(0) ? ' ; k = 0 donne le vecteur nul, colinéaire à tout vecteur' : ''}.</Feedback>
                  <KnowledgeBrick
                    id="colin-multiple"
                    variant="new"
                    compact
                    lead={<>Tu viens de régler k et de voir v = k·u rester sur le rail à chaque valeur.</>}
                  />
                  <KnowledgeBrick
                    id="colin-nul-colineaire-tout"
                    variant="new"
                    compact
                    lead={<>Et k = 0 : le cas particulier que tu as croisé en réglant le curseur.</>}
                  />
                </>
              ) : (
                <Feedback tone="info">{k === 0 ? 'k = 0 : v est le vecteur nul (0 ; 0) — colinéaire à tout vecteur, par convention. ' : ''}{!visited.has(2) ? 'Passe par k = 2. ' : ''}{![...visited].some((x) => x < 0) ? 'Essaie un k négatif. ' : ''}{![...visited].some((x) => !Number.isInteger(x)) ? 'Et un k non entier, comme 1,5.' : ''}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Sans dessiner', subtitle: 'Les coordonnées sont-elles proportionnelles ? Décide, puis vérifie avec les produits en croix.', done: b2,
          content: (
            <div className="space-y-3">
              <KnowledgeBrick
                id="colin-produits-croix"
                variant="new"
                lead={<>Le rappel de collège avant d’en refaire quatre : les produits en croix, sans dessin.</>}
              />
              <BatchChoiceQuestion
                intro={<p className="text-sm text-slate-600">Rappel de collège : deux couples (x ; y) et (x′ ; y′) sont proportionnels quand les produits en croix x·y′ et y·x′ sont égaux.</p>}
                rows={[
                  { id: 'r1', label: 'u(2 ; 1) et v(6 ; 3)', options: ['colinéaires', 'non colinéaires'], correct: 0 },
                  { id: 'r2', label: 'u(2 ; 1) et v(4 ; 3)', options: ['colinéaires', 'non colinéaires'], correct: 1, correction: '×2 sur x mais ×3 sur y : 2 × 3 ≠ 1 × 4.' },
                  { id: 'r3', label: 'u(3 ; −2) et v(−1,5 ; 1)', options: ['colinéaires', 'non colinéaires'], correct: 0, correction: 'v = −0,5·u.' },
                  { id: 'r4', label: 'u(4 ; 0) et v(6 ; 0)', options: ['colinéaires', 'non colinéaires'], correct: 0, correction: 'v = 1,5·u — pas besoin de diviser par 0 : 4 × 0 = 0 × 6.' },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'Quatre sur quatre. ' : `${nCorrect} / ${total}. `}Produits en croix : {pairs.map((p) => <span key={p.id} className="block font-mono text-xs">{cross(p)}{det(p.u, p.v) === 0 ? ' → égaux, colinéaires' : ' → différents, non colinéaires'}</span>)}
                  </Feedback>
                )}
                requires={['colin-multiple', 'colin-produits-croix']}
                solved={b2} onAnswered={() => setB2(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'La coordonnée manquante', done: n3,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt="u(2 ; −3) et v(−6 ; y) sont colinéaires. Que vaut y ?"
                expected={9} parse={parseSigned} display="9" width="w-24"
                explain="v = k·u avec −6 = 2k, donc k = −3, et y = −3 × (−3) = 9. Produits en croix : 2 × 9 = 18 et (−3) × (−6) = 18."
                explainFor={(n) => (n === -9 ? 'Le signe : k = −6 ÷ 2 = −3, puis y = k × (−3) = (−3) × (−3) = +9.' : n === 6 ? '6 est bien à la même distance de 0 que −6… mais y = k × (−3) avec k = −3 : y = 9.' : `Avec y = ${fr(n)}, les produits en croix valent 2 × ${factor(n)} = ${fr(2 * n)} et (−3) × (−6) = 18 : différents. Il faut y = 9.`)}
                requires={['colin-multiple', 'colin-produits-croix']}
                solved={n3} onAnswered={() => setN3(true)} />
              {/* La résolution qui précède EST la méthode : on la nomme une
                  fois qu'elle vient d'être exécutée en entier. */}
              {n3 && (
                <KnowledgeBrick
                  id="colin-coordonnee-manquante-prop"
                  variant="new"
                  lead={<>Tu viens de trouver y en écrivant la proportionnalité puis en résolvant : la méthode en trois lignes.</>}
                />
              )}
              {n3 && (
                <KnowledgeBrick
                  id="mem-colin-multiple"
                  variant="new"
                  lead={<>Ce que tu viens de faire, en une ligne à retenir.</>}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
