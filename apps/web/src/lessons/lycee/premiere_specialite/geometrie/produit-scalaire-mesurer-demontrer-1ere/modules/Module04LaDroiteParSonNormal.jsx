import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MesureScene, { TONS } from '../components/MesureScene';
import {
  SCENES, formeNormale, formeNormaleTexte, equationTexte,
  distancePointDroite, dot, vec, add, scale, norm,
  parseSigned, fr, frVec,
} from '../components/theodoliteUtils';

/**
 * Module 4 — ATELIER : la droite écrite par son vecteur normal (P3), et la
 * distance d'un point à cette droite (P2 réemployé).
 *
 * Étape 1  le GESTE — l'élève promène M le long de la droite et lit n · P₀M
 *          rester nul. C'est cette invariance qui EST l'équation. Puis il sort
 *          de la droite et voit le nombre cesser d'être nul.
 * Étape 2  l'écriture a(x − x₀) + b(y − y₀) = 0, développée jusqu'à
 *          ax + by + c = 0, avec le piège du signe de y₀.
 * Étape 3  la distance d'un point à la droite — le même numérateur, divisé
 *          par la longueur du normal.
 * Étape 4  trois droites à écrire, avec le piège du normal confondu avec le
 *          directeur.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → constat → brique
 * `regle-forme-normale` ; étape 2 le calcul mené → briques
 * `methode-ecrire-forme-normale` et `mem-forme-normale` ; étape 3 le constat
 * du facteur 5 → brique `formule-distance-point-droite`.
 *
 * MANIPULATION JAMAIS GELÉE : le curseur de M reste actionnable après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. Elle partait du normal pour trouver c par
 * substitution. Ici on part de la FORME FACTORISÉE — la forme normale — qui
 * lit directement le point dans l'équation, et l'on en déduit en prime la
 * distance d'un point à la droite : ce que l'écriture développée ne donne pas.
 */
const { P0, n, dessus, dehors } = SCENES.normale;
const EQN = formeNormale(P0, n);

/** Un vecteur DIRECTEUR de la droite : le normal tourné d'un quart de tour. */
const DIR = { x: -n.y, y: n.x };

/**
 * Les positions de M atteignables au cliquet, toutes DANS le cadre — bornes
 * BALAYÉES par un test, pas supposées.
 *
 * Le premier jet ouvrait t sur [−1 ; 1] et l'écart sur [−1 ; 1] : la
 * combinaison (t = −1, écart = −1) plaçait M en (2 ; −9), hors du repère, où
 * le navigateur l'aurait rogné en silence. Les bornes sont resserrées à
 * t ∈ [−0,5 ; 1] et écart ∈ [−0,5 ; 0,5], ce qui laisse quatre positions
 * distinctes sur la droite — assez pour les trois exigées par l'étape.
 */
const T_MIN = -0.5;
const T_MAX = 1;
const T_PAS = 0.5;
const E_MAX = 0.5;

export default function Module04LaDroiteParSonNormal() {
  const [t, setT] = useState(0);
  const [ecart, setEcart] = useState(0);
  const [vus, setVus] = useState([0]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = vus.length >= 3 && q1;
  const done2 = q2;
  const done3 = q3;

  // M = P₀ + t × directeur + ecart × normal. Avec ecart = 0, M reste SUR la
  // droite ; l'élève peut l'en écarter d'un cran pour voir le nombre bouger.
  const M = add(add(P0, scale(DIR, t)), scale(n, ecart));
  const P0M = vec(P0, M);
  const produit = dot(n, P0M);

  const bouger = (d, react) => {
    const v = Math.round((t + d * T_PAS) * 100) / 100;
    if (v < T_MIN - 1e-9 || v > T_MAX + 1e-9) return;
    setT(v);
    if (ecart !== 0 || vus.includes(v)) return;
    const suivant = [...vus, v];
    setVus(suivant);
    if (vus.length < 3 && suivant.length >= 3) react?.(true);
  };

  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La droite par son normal"
      moduleSubtitle="Un point, une flèche en travers, et l’équation tombe en deux lignes"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Une droite, c’est un produit scalaire qui reste nul',
        tone: 'indigo',
        body: (
          <p>
            Plante une flèche en travers d’une droite, puis promène un point le long de cette
            droite. Le produit scalaire ne bougera pas — et c’est justement cette{' '}
            <strong>immobilité</strong> qui s’écrit comme une équation.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Le nombre qui refuse de bouger',
          subtitle:
            `La droite passe par P₀${frVec(P0)} et la flèche rouge n${frVec(n)} lui est normale. Déplace M le long de la droite — visite au moins trois positions — puis écarte-le d’un cran.`,
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <MesureScene
                droites={[{ id: 'd', a: P0, b: add(P0, DIR), color: TONS.droite }]}
                fleches={[
                  { id: 'n', v: n, from: P0, color: TONS.normal, nom: 'n, en travers' },
                  ...(Math.abs(P0M.x) > 1e-9 || Math.abs(P0M.y) > 1e-9
                    ? [{ id: 'p0m', v: P0M, from: P0, color: TONS.ok, nom: 'P₀M', dashed: true, width: 2.5 }]
                    : []),
                ]}
                points={[
                  { id: 'P0', ...P0, nom: 'P₀', color: '#0f172a' },
                  { id: 'M', ...M, nom: 'M', color: TONS.ok },
                ]}
                ariaLabel={
                  `Une droite passant par P₀ ${frVec(P0)}. La flèche n ${frVec(n)} part de P₀ en travers `
                  + `de la droite. Le point M est en ${frVec(M)}. Le produit scalaire n · P₀M vaut ${fr(produit)}.`
                }
              />

              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Déplacer le point M le long de la droite">
                <button type="button" className={btn} onClick={() => bouger(-1, kit.react)} disabled={t - T_PAS < T_MIN - 1e-9} aria-label="Déplacer M vers l’arrière le long de la droite">←</button>
                <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-sm">
                  M {frVec(M)}
                </span>
                <button type="button" className={btn} onClick={() => bouger(1, kit.react)} disabled={t + T_PAS > T_MAX + 1e-9} aria-label="Déplacer M vers l’avant le long de la droite">→</button>
                <span className="text-[13px] text-slate-600">positions sur la droite : {vus.length}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Écarter M de la droite">
                <span className="text-[13px] text-slate-600">écarter M de la droite :</span>
                <button type="button" className={btn} onClick={() => setEcart((e) => Math.max(-E_MAX, e - E_MAX))} disabled={ecart <= -E_MAX} aria-label="Écarter M d’un cran d’un côté">−</button>
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 font-mono font-bold tabular-nums text-sm">{fr(ecart)}</span>
                <button type="button" className={btn} onClick={() => setEcart((e) => Math.min(E_MAX, e + E_MAX))} disabled={ecart >= E_MAX} aria-label="Écarter M d’un cran de l’autre côté">+</button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
                  <div className="text-[13px] text-slate-500">P₀M</div>
                  <div className="font-mono font-bold tabular-nums text-slate-900">{frVec(P0M)}</div>
                </div>
                <div className={`rounded-lg border-2 px-2 py-2 ${produit === 0 ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
                  <div className="text-[13px] text-slate-600">n · P₀M</div>
                  <div className={`font-mono font-black tabular-nums ${produit === 0 ? 'text-emerald-900' : 'text-rose-900'}`}>{fr(produit)}</div>
                </div>
              </div>

              {vus.length >= 3 ? (
                <>
                  <Feedback tone="ok">
                    P₀M change à chaque cran ; <strong>n · P₀M reste nul</strong> tant que M est sur
                    la droite, et cesse de l’être dès qu’il s’en écarte. Cette égalité n’est pas une
                    propriété de la droite : elle EST la droite.
                  </Feedback>
                  <KnowledgeBrick
                    id="regle-forme-normale"
                    variant="new"
                    lead={<>L’écriture de cette immobilité. Repromène M en la lisant.</>}
                  />
                  <TapQuestion
                    prompt="Que signifie exactement « n · P₀M = 0 » pour le point M ?"
                    options={[
                      'M est sur la droite : la flèche P₀M ne monte pas du tout dans la direction de n',
                      'M est confondu avec P₀',
                      'M est à distance 1 de la droite',
                      'La flèche P₀M a la même longueur que n',
                    ]}
                    correct={0}
                    cols={1}
                    requires={['regle-forme-normale', 'regle-orthogonalite']}
                    explain={`Le produit scalaire s’annule exactement quand les deux flèches sont en travers l’une de l’autre. Or n est normal à la droite : P₀M en travers de n signifie que P₀M SUIT la droite, donc que M y est. Un écart d’un cran, et le produit passe à ${fr(dot(n, scale(n, 0.5)))}.`}
                    explainWrong="M peut parcourir toute la droite en gardant le produit nul : il n’est donc pas confondu avec P₀. Et le produit ne dit rien des longueurs — seulement de la direction."
                    solved={q1}
                    onAnswered={() => setQ1(true)}
                  />
                </>
              ) : (
                <Feedback tone="info">
                  Déplace M le long de la droite et surveille les deux compteurs : le premier bouge,
                  le second devrait t’étonner.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'De l’immobilité à l’équation',
          subtitle:
            'On écrit n · P₀M = 0 pour un point M(x ; y) quelconque, et l’équation apparaît d’elle-même.',
          done: done2,
          content: (
            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-2">
                <p>Pour M(x ; y), la flèche P₀M a pour coordonnées (x − {fr(P0.x)} ; y {P0.y < 0 ? '+' : '−'} {fr(Math.abs(P0.y))}). Le produit scalaire avec n{frVec(n)} donne :</p>
                <p className="font-mono text-center text-[17px] font-bold">{formeNormaleTexte(EQN)}</p>
                <p>
                  C’est la <strong>forme normale</strong> : les deux coefficients viennent du normal,
                  les deux nombres entre parenthèses viennent du point.
                </p>
              </div>

              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                Attention au signe : y₀ vaut {fr(P0.y)}, donc « y − y₀ » s’écrit « y {P0.y < 0 ? '+' : '−'} {fr(Math.abs(P0.y))} ». Recopier « y − {fr(Math.abs(P0.y))} » donnerait une droite parallèle, qui rate le point.
              </div>

              <NumericQuestion
                prompt={
                  <>
                    Développe : <strong className="font-mono">{formeNormaleTexte(EQN)}</strong> devient{' '}
                    <strong className="font-mono">{fr(EQN.a)}x + {fr(EQN.b)}y + c = 0</strong>.
                    Combien vaut <strong>c</strong> ?
                  </>
                }
                expected={EQN.c}
                parse={parseSigned}
                display={fr(EQN.c)}
                requires={['regle-forme-normale', 'coordonnees-vecteur']}
                explain={`${fr(EQN.a)}x ${fr(-EQN.a * P0.x)} + ${fr(EQN.b)}y + ${fr(-EQN.b * P0.y)} = 0, donc c = ${fr(-EQN.a * P0.x)} + ${fr(-EQN.b * P0.y)} = ${fr(EQN.c)}. Contrôle en P₀ : ${fr(EQN.a * P0.x)} + ${fr(EQN.b * P0.y)} + ${fr(EQN.c)} = 0 ✔`}
                explainFor={(nn) =>
                  nn === -EQN.c
                    ? `Signe inverse. Vérifie en remettant P₀${frVec(P0)} dans ton équation : tu devrais trouver 0, et tu trouverais ${fr(EQN.a * P0.x + EQN.b * P0.y - EQN.c)}.`
                    : null
                }
                solved={q2}
                onAnswered={() => setQ2(true)}
              />

              {q2 && (
                <>
                  <Feedback tone="ok">
                    L’équation de la droite est{' '}
                    <strong className="font-mono">{equationTexte(EQN)}</strong>. Contrôle sur un
                    autre point de la droite, {frVec(dessus)} :{' '}
                    {fr(EQN.a * dessus.x)} + {fr(EQN.b * dessus.y)} + {fr(EQN.c)} = 0 ✔ — et sur{' '}
                    {frVec(dehors)}, qui n’y est pas : {fr(EQN.a * dehors.x + EQN.b * dehors.y + EQN.c)}, non nul.
                  </Feedback>
                  <KnowledgeBrick
                    id="methode-ecrire-forme-normale"
                    variant="new"
                    compact
                    lead={<>Les quatre gestes, dans l’ordre.</>}
                  />
                  <KnowledgeBrick
                    id="mem-forme-normale"
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
          title: 'Ce que le nombre non nul mesure',
          subtitle:
            `Le point ${frVec(dehors)} n’est pas sur la droite : l’équation y rend ${fr(EQN.a * dehors.x + EQN.b * dehors.y + EQN.c)} au lieu de 0. Ce nombre n’est pas encore une distance.`,
          done: done3,
          content: (
            <div className="space-y-3">
              <MesureScene
                droites={[{ id: 'd', a: P0, b: add(P0, DIR), color: TONS.droite }]}
                fleches={[{ id: 'n', v: n, from: P0, color: TONS.normal, nom: 'n' }]}
                points={[
                  { id: 'P0', ...P0, nom: 'P₀', color: '#0f172a' },
                  { id: 'K', ...dehors, nom: 'K', color: '#e11d48' },
                ]}
                ariaLabel={`La droite d’équation ${equationTexte(EQN)}, et le point K ${frVec(dehors)} qui n’y appartient pas.`}
              />
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 space-y-2">
                <p>
                  Le nombre {fr(EQN.a * dehors.x + EQN.b * dehors.y + EQN.c)} mesure de combien K rate
                  l’équation — mais il dépend de la LONGUEUR du normal : doubler n doublerait ce
                  nombre sans que K ne bouge. On le ramène donc à une vraie distance en divisant par
                  ‖n‖ :
                </p>
                <p className="font-mono text-center text-[15px] font-bold">
                  d(K, droite) = |{fr(EQN.a)} × {fr(dehors.x)} + {fr(EQN.b)} × {fr(dehors.y)} + {fr(EQN.c)}| ÷ √({fr(EQN.a ** 2)} + {fr(EQN.b ** 2)})
                </p>
              </div>
              <NumericQuestion
                prompt={<>Combien vaut cette distance ?</>}
                expected={distancePointDroite(EQN, dehors)}
                parse={parseSigned}
                display={fr(distancePointDroite(EQN, dehors))}
                requires={['regle-forme-normale', 'formule-norme', 'formule-carre-scalaire-longueur']}
                explain={`Le numérateur vaut |${fr(EQN.a * dehors.x + EQN.b * dehors.y + EQN.c)}| = ${fr(Math.abs(EQN.a * dehors.x + EQN.b * dehors.y + EQN.c))}, et ‖n‖ = √(${fr(EQN.a ** 2)} + ${fr(EQN.b ** 2)}) = ${fr(norm(n))}. La distance vaut donc ${fr(Math.abs(EQN.a * dehors.x + EQN.b * dehors.y + EQN.c))} ÷ ${fr(norm(n))} = ${fr(distancePointDroite(EQN, dehors))}.`}
                explainFor={(nn) =>
                  nn === Math.abs(EQN.a * dehors.x + EQN.b * dehors.y + EQN.c)
                    ? `C’est le numérateur seul. Sans la division par ‖n‖ = ${fr(norm(n))}, le point paraîtrait ${fr(norm(n))} fois plus loin qu’il ne l’est.`
                    : null
                }
                solved={q3}
                onAnswered={() => setQ3(true)}
              />
              {q3 && (
                <>
                  <Feedback tone="ok">
                    Le même calcul sert donc deux fois : nul, il dit « le point est sur la droite » ;
                    non nul, il dit « le point est à telle distance ».
                  </Feedback>
                  <KnowledgeBrick
                    id="formule-distance-point-droite"
                    variant="new"
                    lead={<>La formule complète, avec sa valeur absolue et son dénominateur.</>}
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Trois droites à écrire',
          done: q4,
          content: (
            <div className="space-y-3">
              <BatchChoiceQuestion
                intro={<p>Pour chaque couple point + normal, quelle est l’équation de la droite ?</p>}
                rows={[
                  {
                    id: 'e1',
                    label: 'P(2 ; −1), n(5 ; −3)',
                    options: ['5x − 3y − 13 = 0', '5x − 3y + 13 = 0', '−3x + 5y − 13 = 0'],
                    correct: 0,
                    correction: '5(x − 2) − 3(y + 1) = 0, soit 5x − 10 − 3y − 3 = 0, donc 5x − 3y − 13 = 0. Contrôle en P : 10 + 3 − 13 = 0 ✔ Avec + 13, on trouverait 26 : la droite raterait le point.',
                  },
                  {
                    id: 'e2',
                    label: 'P(0 ; 4), n(1 ; 2)',
                    options: ['x + 2y − 8 = 0', 'x + 2y + 8 = 0', '2x + y − 4 = 0'],
                    correct: 0,
                    correction: '1(x − 0) + 2(y − 4) = 0, soit x + 2y − 8 = 0. Contrôle en P : 0 + 8 − 8 = 0 ✔ L’option 2x + y − 4 = 0 a échangé les deux coordonnées du normal.',
                  },
                  {
                    id: 'e3',
                    label: 'P(−3 ; 2), et la droite a pour vecteur DIRECTEUR w(4 ; 1)',
                    options: ['x − 4y + 11 = 0', '4x + y + 10 = 0', 'x − 4y − 11 = 0'],
                    correct: 0,
                    correction:
                      'Le directeur w(4 ; 1) n’est PAS le normal : il faut le tourner d’un quart de tour, ce qui donne n(−1 ; 4). L’équation −1(x + 3) + 4(y − 2) = 0 devient −x + 4y − 11 = 0, qu’on écrit aussi x − 4y + 11 = 0. Contrôle en P : −3 − 8 + 11 = 0 ✔ Le piège 4x + y + 10 = 0 passe bien par P — mais avec le normal (4 ; 1), c’est-à-dire la droite PERPENDICULAIRE à celle qu’on cherche.',
                  },
                ]}
                requires={['methode-ecrire-forme-normale', 'mem-forme-normale', 'vocab-vecteur-normal']}
                feedback={({ allRight }) =>
                  allRight ? (
                    <>
                      Le réflexe : le normal donne a et b, le point donne x₀ et y₀ — et l’on contrôle
                      toujours en remettant le point dans l’équation finale.
                    </>
                  ) : (
                    <>
                      Deux pièges se répètent : échanger les deux coordonnées du normal, et se
                      tromper de signe sur c quand le point a une coordonnée négative. Le contrôle
                      en remettant le point les attrape tous les deux.
                    </>
                  )
                }
                solved={q4}
                onAnswered={() => setQ4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Il reste à démontrer.</strong> Angles, longueurs, droites : tu as les trois
          instruments. Le module suivant les met au service d’un tribunal — quatre figures à juger,
          dont deux qui trompent l’œil.
        </KnowledgeSnapshot>
      }
    />
  );
}
