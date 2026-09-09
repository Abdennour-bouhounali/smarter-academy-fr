import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ScalaireScene, { TONS } from '../components/ScalaireScene';
import {
  SCENES, normalDe, equationCartesienne, equationTexte, estSurLaDroite,
  directeurDeEquation, produitCoordonnees, add, scale,
  parseSigned, fr, frVec,
} from '../components/scalaireUtils';

/**
 * Module 5 — ATELIER : une flèche en travers d'une droite l'écrit tout entière.
 *
 * Étape 1  le vecteur normal, construit par le GESTE : l'élève déplace le
 *          point M le long de la droite et regarde n · AM rester nul, quelle
 *          que soit la position. C'est cette invariance qui EST l'équation.
 * Étape 2  l'équation en découle : a et b sont les coordonnées du normal, et
 *          c se calcule en écrivant que A appartient à la droite.
 * Étape 3  le sens inverse — lire un normal DANS une équation, et ne pas le
 *          confondre avec le directeur.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → constat → brique
 * `vocab-vecteur-normal` ; étape 2 calcul mené → briques
 * `regle-equation-cartesienne`, `methode-equation-par-le-normal` et
 * `mem-abc-normal` ; étape 3 la demande, légitime.
 *
 * MANIPULATION JAMAIS GELÉE : le curseur de M reste actionnable après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 */
const { A, directeur } = SCENES.normal;
const N = normalDe(directeur);                       // (1 ; 3)
const EQN = equationCartesienne(A, N);               // x + 3y − 7 = 0

/** Les positions de M atteignables au cliquet, toutes DANS le cadre. */
const T_MIN = -1.5;
const T_MAX = 1.5;
const T_PAS = 0.5;

export default function Module05LaFlecheQuiTientLaDroite() {
  const [t, setT] = useState(0);
  const [vus, setVus] = useState([0]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // Trois positions distinctes suffisent à voir que le nombre ne bouge pas.
  const done1 = vus.length >= 3 && q1;
  const done2 = q2;

  const M = add(A, scale(directeur, t));
  const AM = { x: M.x - A.x, y: M.y - A.y };
  const nAM = produitCoordonnees(N, AM);

  const bouger = (d, react) => {
    const v = Math.round((t + d * T_PAS) * 100) / 100;
    if (v < T_MIN - 1e-9 || v > T_MAX + 1e-9) return;
    setT(v);
    if (vus.includes(v)) return;
    const suivant = [...vus, v];
    setVus(suivant);
    if (vus.length < 3 && suivant.length >= 3) react?.(true);
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 ' +
    'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="La flèche qui tient la droite"
      moduleSubtitle="Une seule flèche en travers, et toute la droite s’écrit"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Une flèche suffit à décrire une droite entière',
        tone: 'indigo',
        body: (
          <p>
            Plante une flèche en travers d’une droite. Puis promène un point le long de cette
            droite, et regarde le produit scalaire. Ce qui ne bougera pas est exactement
            l’équation que tu cherches.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le nombre qui ne bouge pas',
          subtitle:
            `La droite passe par A${frVec(A)} et suit la direction ${frVec(directeur)}. La flèche rouge n est en travers. Déplace M le long de la droite et lis n · AM : visite au moins trois positions.`,
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <ScalaireScene
                droites={[{ id: 'd', a: A, b: add(A, directeur), color: TONS.droite }]}
                fleches={[
                  { id: 'w', v: directeur, from: A, color: TONS.v, nom: 'la direction de la droite' },
                  { id: 'n', v: N, from: A, color: TONS.normal, nom: 'n, en travers' },
                  ...(Math.abs(t) > 1e-9
                    ? [{ id: 'am', v: AM, from: A, color: TONS.somme, nom: 'AM', dashed: true, width: 2.5 }]
                    : []),
                ]}
                points={[
                  { id: 'A', ...A, nom: 'A', color: '#0f172a' },
                  { id: 'M', ...M, nom: 'M', color: TONS.somme },
                ]}
                ariaLabel={
                  `Une droite passant par A(${fr(A.x)} ; ${fr(A.y)}). La flèche n(${fr(N.x)} ; ${fr(N.y)}) `
                  + `part de A en travers de la droite. Le point M est en (${fr(M.x)} ; ${fr(M.y)}). `
                  + `Le produit scalaire n · AM vaut ${fr(nAM)}.`
                }
              />

              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Déplacer le point M le long de la droite">
                <button type="button" className={btn} onClick={() => bouger(-1, kit.react)} disabled={t - T_PAS < T_MIN - 1e-9} aria-label="Déplacer M vers l’arrière">←</button>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">
                  M ({fr(M.x)} ; {fr(M.y)})
                </span>
                <button type="button" className={btn} onClick={() => bouger(1, kit.react)} disabled={t + T_PAS > T_MAX + 1e-9} aria-label="Déplacer M vers l’avant">→</button>
                <span className="text-[13px] text-slate-600">positions visitées : {vus.length}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                  <div className="text-[13px] text-slate-500">AM</div>
                  <div className="font-mono font-bold tabular-nums text-slate-900">{frVec(AM)}</div>
                </div>
                <div className="rounded-lg border-2 border-rose-300 bg-rose-50 px-2 py-2">
                  <div className="text-[13px] text-rose-700">n · AM</div>
                  <div className="font-mono font-black tabular-nums text-rose-900">{fr(nAM)}</div>
                </div>
              </div>

              {vus.length >= 3 ? (
                <>
                  <Feedback tone="ok">
                    AM change à chaque cran ; <strong>n · AM reste nul</strong>. C’est vrai pour
                    tous les points de la droite, et pour aucun autre : cette égalité EST la droite,
                    écrite avec un produit scalaire.
                  </Feedback>
                  <KnowledgeBrick
                    id="vocab-vecteur-normal"
                    variant="new"
                    lead={<>Le nom de cette flèche en travers. Repromène M en le lisant.</>}
                  />
                  <TapQuestion
                    prompt="Un vecteur normal à une droite est un vecteur non nul qui…"
                    options={[
                      'est orthogonal à tout vecteur directeur de cette droite',
                      'est porté par la droite elle-même',
                      'a pour longueur 1',
                      'joint deux points quelconques de la droite',
                    ]}
                    correct={0}
                    cols={1}
                    requires={['vocab-vecteur-normal', 'regle-orthogonalite']}
                    explain={`n${frVec(N)} et la direction ${frVec(directeur)} donnent ${fr(N.x)} × ${fr(directeur.x)} + ${fr(N.y)} × ${fr(directeur.y)} = 0 : n est bien en travers. Et tous ses multiples le sont aussi — un normal n’est jamais unique.`}
                    explainWrong="Un vecteur porté par la droite, ou joignant deux de ses points, est un vecteur DIRECTEUR — pas un normal. Et la longueur est libre : (2 ; 6) convient tout autant que (1 ; 3)."
                    solved={q1}
                    onAnswered={() => setQ1(true)}
                  />
                </>
              ) : (
                <Feedback tone="info">
                  Déplace M et surveille les deux compteurs : le premier bouge, le second devrait
                  t’étonner.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'De la flèche à l’équation',
          subtitle:
            'Cette égalité qui ne bougeait pas s’écrit avec des lettres. Ce qu’on obtient alors est exactement l’équation de la droite.',
          done: done2,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 space-y-2">
                <p>Pour un point M(x ; y) quelconque, AM = (x − {fr(A.x)} ; y − {fr(A.y)}), donc :</p>
                <p className="font-mono text-center text-[15px]">
                  {fr(N.x)}(x − {fr(A.x)}) + {fr(N.y)}(y − {fr(A.y)}) = 0
                </p>
                <p>
                  En développant : x − {fr(A.x)} + {fr(N.y)}y − {fr(N.y * A.y)} = 0. Les deux
                  premiers coefficients sont exactement les coordonnées de n.
                </p>
              </div>
              <NumericQuestion
                prompt={
                  <>
                    L’équation s’écrit donc <strong className="font-mono">x + {fr(N.y)}y + c = 0</strong>.
                    Sachant qu’elle doit être vérifiée par A{frVec(A)}, combien vaut{' '}
                    <strong>c</strong> ?
                  </>
                }
                expected={EQN.c}
                parse={parseSigned}
                display={fr(EQN.c)}
                requires={['vocab-vecteur-normal', 'regle-orthogonalite', 'regle-coordonnees']}
                explain={`On remplace x par ${fr(A.x)} et y par ${fr(A.y)} : ${fr(A.x)} + ${fr(N.y)} × ${fr(A.y)} + c = 0, soit ${fr(A.x + N.y * A.y)} + c = 0, donc c = ${fr(EQN.c)}.`}
                explainFor={(n) =>
                  n === -EQN.c
                    ? `Signe inverse : l’équation est ${fr(A.x + N.y * A.y)} + c = 0, donc c vaut ${fr(EQN.c)}. Vérifie en remettant A : ${fr(A.x)} + ${fr(N.y * A.y)} ${fr(EQN.c)} = 0 ✔`
                    : null
                }
                solved={q2}
                onAnswered={() => setQ2(true)}
              />
              {q2 && (
                <>
                  <Feedback tone="ok">
                    L’équation de la droite est <strong className="font-mono">{equationTexte(EQN)}</strong>.
                    Vérification en A : {fr(A.x)} + {fr(N.y * A.y)} − {fr(-EQN.c)} = 0 ✔ — et un point
                    hors de la droite, comme (0 ; 0), donne {fr(EQN.c)}, non nul.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-equation-cartesienne"
                    variant="new"
                    lead={<>Le lien entre la flèche en travers et les coefficients de l’équation, dans les deux sens.</>}
                  />
                  <KnowledgeBrick
                    id="methode-equation-par-le-normal"
                    variant="new"
                    compact
                    lead={<>Les quatre gestes, dans l’ordre.</>}
                  />
                  <KnowledgeBrick
                    id="mem-abc-normal"
                    variant="new"
                    lead={<>La seule chose à retenir par cœur de ce module.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Lire un normal dans une équation',
          done: q3,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                Le chemin inverse est immédiat : dans <span className="font-mono">ax + by + c = 0</span>,
                le couple (a ; b) est un vecteur normal, et (−b ; a) un vecteur directeur.
              </div>
              <BatchChoiceQuestion
                intro={<p>Pour chaque droite, quel vecteur lui est <strong>normal</strong> ?</p>}
                rows={[
                  {
                    id: 'n1',
                    label: '2x + 5y − 10 = 0',
                    options: ['(2 ; 5)', '(−5 ; 2)', '(5 ; 2)'],
                    correct: 0,
                    correction: 'Les deux premiers coefficients, dans l’ordre : (2 ; 5). Le vecteur (−5 ; 2) est un DIRECTEUR, pas un normal.',
                  },
                  {
                    id: 'n2',
                    label: '3x − 2y + 6 = 0',
                    options: ['(3 ; −2)', '(2 ; 3)', '(3 ; 2)'],
                    correct: 0,
                    correction: 'a = 3 et b = −2 donnent n(3 ; −2). Attention au signe : c’est bien −2, pas 2.',
                  },
                  {
                    id: 'n3',
                    label: 'y = 4 (droite horizontale)',
                    options: ['(0 ; 1)', '(1 ; 0)', '(4 ; 0)'],
                    correct: 0,
                    correction: 'On la réécrit 0x + 1y − 4 = 0 : le normal est (0 ; 1), une flèche verticale. C’est cohérent — une droite horizontale a bien une perpendiculaire verticale.',
                  },
                ]}
                requires={['regle-equation-cartesienne', 'mem-abc-normal', 'vocab-vecteur-normal']}
                feedback={({ allRight }) =>
                  allRight ? (
                    <>
                      Le réflexe : les deux premiers coefficients donnent le normal ; on échange et
                      on change un signe pour obtenir le directeur. Vérification toujours possible —
                      leur produit scalaire doit être nul.
                    </>
                  ) : (
                    <>
                      Ne confonds pas les deux flèches. Dans ax + by + c = 0, n(a ; b) est en
                      TRAVERS de la droite, tandis que (−b ; a) la SUIT. Leur produit scalaire vaut
                      a × (−b) + b × a = 0 : c’est le contrôle qui départage.
                    </>
                  )
                }
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Tu as tout.</strong> Deux formules pour calculer, une algèbre pour transformer,
          un critère pour démontrer, et un normal pour écrire une droite. Il reste à le prouver.
        </KnowledgeSnapshot>
      }
    />
  );
}
