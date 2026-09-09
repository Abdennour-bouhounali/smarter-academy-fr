import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorPlane, { Lamp, ComponentStepper } from '../components/VectorPlane';
import {
  vecFromPoints, det, detText, linesParallel, collinearityRatio, pointsAligned, yForAlignment,
  formatVec, fr, parseSigned, samePoint,
} from '../components/colinUtils';

/**
 * Module 5 — PRACTICE LAB : « Alignement et parallélisme ».
 *
 * Étape 1 — MANIPULATION du parallélisme : (AB) est fixe, l'élève déplace D ;
 *   la droite (CD) tourne autour de C. ACTION → CHANGEMENT (la droite pivote,
 *   det(AB, CD) se réécrit) → OBSERVATION ((CD) ∥ (AB) exactement quand det = 0,
 *   y compris avec CD de sens contraire) → SENS (parallèles ⇔ vecteurs
 *   directeurs colinéaires — le même test que l'alignement).
 * Étapes 2 à 5 — l'échelle de l'alignement, scaffolding décroissant :
 *   niveau 1 l'œil sur une figure (et l'œil se trompe) ; niveau 2 construire
 *   les vecteurs ; niveau 3 la proportionnalité ; niveau 4 le déterminant ;
 *   niveau 5 une coordonnée manquante, sans figure.
 */
const RANGE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
const A = { x: -5, y: -3 };
const B = { x: -2, y: -1 };
const C = { x: 0, y: 2 };
const AB = vecFromPoints(A, B);                       // (3 ; 2)

// L'œil : P, Q, R « ont l'air » alignés — det = 1.
const P = { x: -4, y: -2 };
const Q = { x: -1, y: 0 };
const R = { x: 5, y: 3 };
const PQ = vecFromPoints(P, Q);                       // (3 ; 2)
const PR = vecFromPoints(P, R);                       // (9 ; 5)

// Niveau 5 : E, F, G(7 ; y) alignés.
const E = { x: -1, y: 2 };
const F = { x: 2, y: 4 };
const G_X = 5;
const G_Y = yForAlignment(E, F, G_X);                 // 6

export default function Module05AlignementParallelisme() {
  const [pred1, setPred1] = useState(null);
  const [D, setD] = useState({ x: 4, y: 3 });
  const [found, setFound] = useState(() => new Set());
  const CD = vecFromPoints(C, D);
  const par = linesParallel(A, B, C, D);
  const k = collinearityRatio(AB, CD);
  const foundList = [...found].map((s) => s.split(';').map(Number));
  const done1 = found.size >= 2 && foundList.some(([x, y]) => collinearityRatio(AB, vecFromPoints(C, { x, y })) < 0);

  const [q2, setQ2] = useState(false);
  const [n3a, setN3a] = useState(false);
  const [n3b, setN3b] = useState(false);
  const [b4, setB4] = useState(false);
  const [n5, setN5] = useState(false);
  const [n6, setN6] = useState(false);
  const [n6b, setN6b] = useState(false);

  const moveD = (p, react) => {
    if (samePoint(p, C)) return;
    setD(p);
    if (linesParallel(A, B, C, p)) {
      const key = `${p.x};${p.y}`;
      if (!found.has(key)) { const f = new Set(found); f.add(key); setFound(f); react?.(true); }
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Alignement et parallélisme"
      moduleSubtitle="Trois points, deux droites, une coordonnée manquante : le déterminant tranche là où l’œil hésite."
      estimatedTime="10 min"
      brief={{ tag: '🧪 Mission 06', title: 'Le même test, deux usages : alignés (AB, AC) et parallèles (AB, CD).', tone: 'indigo', body: <p>D’abord les droites : fais pivoter (CD) jusqu’à ce qu’elle soit parallèle à (AB). Puis l’échelle de l’alignement, du coup d’œil au calcul.</p> }}
      steps={[
        {
          num: 1, title: 'Fais pivoter (CD)', subtitle: 'A, B, C sont fixes. Déplace D : trouve deux positions où (CD) ∥ (AB), dont une avec CD de sens contraire à AB.', done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips prompt="comment reconnaître que (CD) est parallèle à (AB) sans regarder le dessin ?" options={[{ id: 'det', label: 'det(AB, CD) = 0' }, { id: 'egal', label: 'CD = AB' }, { id: 'long', label: 'CD et AB de même longueur' }]} value={pred1} onChange={setPred1} disabled={done1} />
              <VectorPlane
                range={RANGE}
                points={[
                  { id: 'A', name: 'A', ...A, color: 'rose' }, { id: 'B', name: 'B', ...B, color: 'rose' },
                  { id: 'C', name: 'C', ...C, color: 'rose' }, { id: 'D', name: 'D', ...D },
                ]}
                draggableId="D"
                onPointChange={(p) => moveD({ x: p.x, y: p.y }, kit.react)}
                rails={[
                  { id: 'rail-ab', through: A, dir: AB, color: 'violet' },
                  { id: 'rail-cd', through: C, dir: CD, color: par ? 'emerald' : 'slate' },
                ]}
                vectors={[
                  { id: 'ab', from: A, to: B, color: 'violet', width: 5 },
                  { id: 'cd', from: C, to: D, color: 'emerald', width: 3 },
                ]}
                legend={[{ id: 'ab', label: 'AB', value: formatVec(AB), color: 'violet' }, { id: 'cd', label: 'CD', value: formatVec(CD), color: 'emerald' }]}
                ariaLabel={`Repère : droite (AB) fixe, C (0 ; 2), D ${formatVec(D)} — déplace D`}
              />
              <div className="flex flex-wrap gap-3 justify-center">
                <ComponentStepper label="x de D" value={D.x} min={RANGE.xMin} max={RANGE.xMax} onChange={(x) => moveD({ x, y: D.y }, kit.react)} />
                <ComponentStepper label="y de D" value={D.y} min={RANGE.yMin} max={RANGE.yMax} onChange={(y) => moveD({ x: D.x, y }, kit.react)} />
              </div>
              <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-center space-y-1" aria-live="polite">
                <p className="font-mono text-sm font-bold text-slate-800 tabular-nums break-words">det(AB, CD) = {detText(AB, CD)}</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Lamp label="(AB) et (CD)" on={par} onText="parallèles" offText="sécantes" />
                  <Lamp label="AB et CD" on={par} onText={k !== null ? `colinéaires, CD = ${fr(k)}·AB` : 'colinéaires'} offText="non colinéaires" tone="amber" />
                </div>
              </div>
              {done1 ? (
                <>
                  <Feedback tone="ok">{pred1 === 'det' ? 'Ta prédiction : det = 0. Exact' : pred1 === 'egal' ? 'Ta prédiction : CD = AB. Trop fort — CD peut être plus long, ou à l’envers' : pred1 === 'long' ? 'Ta prédiction : même longueur. Non — la longueur ne compte pas' : 'Le détecteur tranche'} : (CD) ∥ (AB) exactement quand <strong>det(AB, CD) = 0</strong>, c’est-à-dire quand les vecteurs directeurs AB et CD sont colinéaires — positions trouvées : {foundList.map(([x, y]) => formatVec({ x, y })).join(', ')}. Parallélisme et alignement sont le même test.</Feedback>
                  <KnowledgeBrick
                    id="colin-parallelisme-det"
                    variant="new"
                    compact
                    lead={<>Tu viens de faire pivoter (CD) jusqu’au parallélisme : le même test que l’alignement, appliqué à deux droites.</>}
                  />
                  <KnowledgeBrick
                    id="colin-vocabulaire-parallele"
                    variant="new"
                    compact
                    establishes={['droites-paralleles']}
                    lead={<>Le mot pour ce que tu viens de reconnaître entre (AB) et (CD) : deux droites parallèles.</>}
                  />
                </>
              ) : (
                <Feedback tone="info">{found.size === 0 ? 'La droite (CD) est grise tant qu’elle coupe (AB). Fais-la pivoter : D = (3 ; 4), par exemple.' : 'Une position trouvée. Cherche-en une autre, avec CD dans le sens contraire de AB (D à gauche de C).'}</Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Niveau 1 — à l’œil', subtitle: 'P, Q et R : alignés ?', done: q2,
          content: (
            <div className="space-y-3">
              <VectorPlane
                range={RANGE}
                points={[{ id: 'P', name: 'P', ...P, color: 'rose' }, { id: 'Q', name: 'Q', ...Q, color: 'rose' }, { id: 'R', name: 'R', ...R, color: 'rose' }]}
                frozen
                ariaLabel="Trois points P (−4 ; −2), Q (−1 ; 0), R (5 ; 3)"
              />
              <TapQuestion
                prompt="À l’œil : P, Q et R sont-ils alignés ?"
                options={['Oui, ils sont sur une même droite', 'Non', 'Impossible à dire sans calcul']} cols={1} correct={2}
                explain="À un carreau près, l’œil ne sait pas. C’est exactement pour cela qu’il faut un calcul — les niveaux suivants le font."
                explainWrong="À un carreau près, l’œil ne peut pas trancher : la figure suggère, elle ne prouve rien. Les niveaux suivants remplacent le coup d’œil par un calcul."
                requires={['colin-oeil-hesite']}
                solved={q2} onAnswered={() => setQ2(true)} />
            </div>
          ),
        },
        {
          num: 3, title: 'Niveau 2 — construire les vecteurs', subtitle: `P ${formatVec(P)}, Q ${formatVec(Q)}, R ${formatVec(R)}.`, done: n3a && n3b,
          content: (
            <div className="space-y-3">
              <NumericQuestion prompt="Abscisse du vecteur PR ?" expected={PR.x} parse={parseSigned} display={fr(PR.x)} width="w-24"
                explain={`Arrivée moins départ : ${fr(R.x)} − (${fr(P.x)}) = ${fr(PR.x)}.`}
                explainFor={(n) => (n === -PR.x ? 'Signe inversé : le vecteur va de P VERS R, donc xR − xP = 5 − (−4) = 9.' : n === PR.y ? 'Tu as calculé l’ordonnée. L’abscisse : 5 − (−4) = 9.' : null)}
                requires={['abscisse', 'vecteur', 'composante']}
                solved={n3a} onAnswered={() => setN3a(true)} />
              {n3a && (
                <NumericQuestion prompt="Ordonnée du vecteur PR ?" expected={PR.y} parse={parseSigned} display={fr(PR.y)} width="w-24"
                  explain={`${fr(R.y)} − (${fr(P.y)}) = ${fr(PR.y)}. Donc PQ = ${formatVec(PQ)} et PR = ${formatVec(PR)}.`}
                  explainFor={(n) => (n === -PR.y ? 'Signe inversé : yR − yP = 3 − (−2) = 5.' : n === 1 ? '3 − 2 = 1 oublie que l’ordonnée de P est −2 : 3 − (−2) = 5.' : null)}
                  requires={['ordonnee', 'vecteur', 'composante']}
                  solved={n3b} onAnswered={() => setN3b(true)} />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Niveaux 3 et 4 — proportionnalité, puis déterminant', subtitle: `PQ = ${formatVec(PQ)}, PR = ${formatVec(PR)}.`, done: b4,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                rows={[
                  { id: 'p1', label: 'Les coordonnées de PR sont-elles proportionnelles à celles de PQ ?', options: ['oui, ×3', 'non', 'oui, ×2,5'], correct: 1, correction: '9 = 3 × 3 mais 5 ≠ 3 × 2 : pas le même facteur.' },
                  { id: 'p2', label: 'det(PQ, PR) = ?', options: [fr(det(PQ, PR)), '33', '0'], correct: 0, correction: `${detText(PQ, PR)}.` },
                  { id: 'p3', label: 'Conclusion', options: ['P, Q, R ne sont pas alignés', 'P, Q, R sont alignés', 'presque alignés, donc alignés'], correct: 0, correction: 'det = −3 ≠ 0 : PQ et PR ne sont pas colinéaires. « Presque » n’existe pas : nul, ou pas nul.' },
                ]}
                feedback={({ allRight }) => <Feedback tone={allRight ? 'ok' : 'ko'}>det(PQ, PR) = {detText(PQ, PR)}. Non nul : les vecteurs ne sont pas colinéaires, les points ne sont pas alignés. L’œil hésitait, le déterminant a tranché. Pour aligner R, il faudrait R en (5 ; 4).</Feedback>}
                requires={['colin-oeil-hesite', 'colin-critere-det']}
                solved={b4} onAnswered={() => setB4(true)} />
              {b4 && (
                <>
                  <KnowledgeBrick
                    id="colin-alignement-det"
                    variant="new"
                    compact
                    lead={<>Tu viens de trancher P, Q, R par le déterminant : le pont du module 2, rendu calculable.</>}
                  />
                  <KnowledgeBrick
                    id="colin-methode-conclure"
                    variant="new"
                    lead={<>Les quatre niveaux que tu viens de traverser — l’œil, les vecteurs, la proportionnalité, le déterminant — forment une méthode.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 5, title: 'Niveau 5 — la coordonnée manquante', subtitle: `E ${formatVec(E)}, F ${formatVec(F)}, G (${G_X} ; y). Sans figure.`, done: n5,
          content: (
            <div className="space-y-3">
              <NumericQuestion
                prompt="Pour quelle valeur de y les points E, F et G sont-ils alignés ?"
                expected={G_Y} parse={parseSigned} display={fr(G_Y)} width="w-24"
                explain={`EF = (3 ; 2), EG = (6 ; y − 2). Alignés ⇔ det(EF, EG) = 0 ⇔ 3 × (y − 2) − 2 × 6 = 0 ⇔ 3y − 6 − 12 = 0 ⇔ y = 6. Vérification : EG = (6 ; 4) = 2·EF.`}
                explainFor={(n) => (n === 4 ? '4 est l’ordonnée de EG, pas celle de G : y − 2 = 4 donne y = 6.' : n === 8 ? '8 = 4 + 4 continue la progression à partir de F en oubliant que G est 3 unités plus loin en x, pas 2… et EG doit être (6 ; 4) : y = 6.' : `Avec y = ${fr(n)}, det(EF, EG) = 3 × (${fr(n)} − 2) − 12 = ${fr(3 * (n - 2) - 12)} ≠ 0. Il faut 3(y − 2) = 12, soit y = 6.`)}
                requires={['colin-methode-conclure']}
                solved={n5} onAnswered={() => setN5(true)} />
              {/* La résolution qui précède EST la méthode de la coordonnée
                  manquante par le déterminant : on la nomme une fois faite. */}
              {n5 && (
                <>
                  <KnowledgeBrick
                    id="colin-coordonnee-manquante-det"
                    variant="new"
                    compact
                    lead={<>Tu viens de poser det = 0 pour trouver y : la même méthode que celle du module 3, cette fois avec le déterminant.</>}
                  />
                  <KnowledgeBrick
                    id="mem-colin-deux-usages"
                    variant="new"
                    lead={<>Ce que tu as fait dans ce module, en une ligne : un test, deux usages — parallélisme à l’étape 1, alignement ici.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 6, title: 'Niveau 6 — un problème de parallélisme',
          subtitle: 'A (1 ; 1), B (5 ; 2), C (6 ; 5). Où placer D pour que ABCD soit un parallélogramme — et comment le PROUVER ?',
          done: n6 && n6b,
          content: (
            <div className="space-y-3">
              {/* Les niveaux 2 à 5 portaient tous sur l'ALIGNEMENT. Le critère
                  de parallélisme était enseigné au niveau 1, mais aucun PROBLÈME
                  de parallélisme n'était posé : l'unique épreuve du boss (col-e9,
                  le trapèze) mesurait donc une compétence jamais travaillée. */}
              <NumericQuestion
                prompt="Quelle est l’ordonnée de D ?"
                expected={4} parse={parseSigned} display="4" width="w-24"
                above={() => (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
                    Dans un parallélogramme ABCD, le côté [AB] et le côté [DC] sont parallèles ET de même
                    longueur : autrement dit AB = DC, les deux vecteurs sont ÉGAUX. Or AB = (4 ; 1).
                  </div>
                )}
                explain="AB = (4 ; 1). Pour que DC = AB, il faut C − D = (4 ; 1), donc D = C − (4 ; 1) = (6 − 4 ; 5 − 1) = (2 ; 4). L’ordonnée de D vaut 4."
                explainFor={(n) => (n === 6 ? 'Tu as pris l’ordonnée de C. D s’obtient en retirant AB à C : 5 − 1 = 4.'
                  : n === 2 ? '2 est l’ABSCISSE de D, pas son ordonnée.'
                  : 'D = C − AB : (6 − 4 ; 5 − 1) = (2 ; 4).')}
                requires={['colin-parallelisme-det', 'colin-methode-conclure']}
                solved={n6} onAnswered={() => setN6(true)} />
              {n6 && (
                <TapQuestion
                  prompt="D (2 ; 4) étant placé, quelle rédaction PROUVE que (AD) ∥ (BC) ?"
                  options={[
                    'AD = (1 ; 3), BC = (1 ; 3) : det(AD, BC) = 1 × 3 − 3 × 1 = 0, donc AD et BC sont colinéaires et (AD) ∥ (BC)',
                    'Sur la figure, (AD) et (BC) ne se coupent pas : elles sont parallèles',
                    'AD et BC ont la même longueur, donc les droites sont parallèles',
                    'ABCD est un parallélogramme, donc (AD) ∥ (BC)',
                  ]}
                  correct={0} cols={1}
                  requires={['colin-parallelisme-det', 'colin-methode-conclure']}
                  explain="Une démonstration de parallélisme passe par les VECTEURS directeurs : on les calcule, on montre que leur déterminant est nul, on conclut. Ici det(AD, BC) = 0 : les droites sont parallèles. C’est le même geste qu’au niveau 1, mais énoncé et rédigé."
                  explainWrong="« On le voit sur la figure » ne prouve rien (le niveau 2 l’a montré), l’égalité des longueurs non plus (deux segments de même longueur peuvent être sécants), et invoquer le parallélogramme suppose acquis ce qu’on veut établir. Seul le déterminant nul le démontre."
                  solved={n6b} onAnswered={() => setN6b(true)} />
              )}
              {n6 && n6b && (
                <Feedback tone="ok">
                  Tu viens de faire les deux moitiés d’un problème de parallélisme : <strong>construire</strong>
                  le point qui le réalise, puis <strong>démontrer</strong> qu’il le réalise vraiment.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
