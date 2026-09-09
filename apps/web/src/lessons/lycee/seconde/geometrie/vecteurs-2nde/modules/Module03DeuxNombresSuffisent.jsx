import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import { VecName } from '../components/VectorScene';
import { SCENES, RANGE, vec, equal, formatVec, formatNum, parseDecSigned } from '../components/vecteurUtils';

/**
 * Module 3 — DÉCOUVERTE : deux nombres suffisent.
 *
 * Activity              lire les deux nombres de l'escalier ; déplacer A et B
 *                       et voir xB − xA et yB − yA se calculer ; calculer seul.
 * Mathematical objective la base orthonormée (i, j) ; les coordonnées d'un
 *                       vecteur ; AB (xB − xA ; yB − yA).
 * Student action        régler les composantes (mode 'build'), puis déplacer
 *                       A ou B (mode 'points').
 * Controlled variable   une composante, puis un point.
 * Mathematical state    origine + vecteur ; A, B.
 * Visual consequence    l'escalier +3 / +2 ; le tableau xA, xB, xB − xA.
 * Expected observation  « x et y sont les deux marches de l'escalier » ;
 *                       « la différence donne toujours la marche ».
 * Misconception targeted départ − arrivée ; composantes échangées
 *                       (`explainFor` intercepte les deux).
 * Formalization         u = x·i + y·j ⟺ u (x ; y) ; la formule de AB en fin.
 */
const { A: A0, B: B0 } = SCENES.AB;
const U0 = vec(A0, B0);                       // (3 ; 2)
const CIBLE_2 = { x: -2, y: 4 };
const C = { x: 5, y: -3 };
const D = { x: 1, y: 2 };
const CD = vec(C, D);                         // (−4 ; 5)
const I = { x: 1, y: 0 };
const J = { x: 0, y: 1 };

export default function Module03DeuxNombresSuffisent() {
  const [v1, setV1] = useState({ x: 1, y: -1 });
  const done1 = equal(v1, U0);

  const [A, setA] = useState({ x: -4, y: -1 });
  const [v2, setV2] = useState({ x: 3, y: 2 });
  const B = { x: A.x + v2.x, y: A.y + v2.y };
  const done2 = equal(v2, CIBLE_2);

  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);
  const [b4, setB4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Lis l’escalier',
      subtitle: 'Amène B sur l’anneau. Les deux nombres de l’escalier sont ceux qui décrivent u.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={A0}
            vector={v1}
            onVectorChange={(nv) => { setV1(nv); if (equal(nv, U0)) kit.react(true); }}
            mode="build"
            range={RANGE}
            names={{ origin: 'A', tip: 'B', vector: 'u' }}
            escalier
            extraArrows={[
              { id: 'i', from: { x: 0, y: 0 }, to: I, color: '#0369a1', name: 'i', width: 2.5 },
              { id: 'j', from: { x: 0, y: 0 }, to: J, color: '#047857', name: 'j', width: 2.5 },
            ]}
            extraPoints={[{ id: 'tgt', x: B0.x, y: B0.y, hollow: true, color: '#f59e0b' }]}
            showWords={false}
            ariaLabel={`Flèche u de A ${formatVec(A0)} vers B, coordonnées ${formatVec(v1)}`}
          />
          <p className="text-sm text-slate-700 font-mono" aria-live="polite">
            <VecName>u</VecName> = {formatNum(v1.x)}·<VecName>i</VecName> {v1.y < 0 ? '−' : '+'} {formatNum(Math.abs(v1.y))}·<VecName>j</VecName>
          </p>
          {done1 ? (
            <Feedback tone="ok">
              Les deux petites flèches <VecName>i</VecName> (1 vers la droite) et <VecName>j</VecName>{' '}
              (1 vers le haut) forment une <strong>base orthonormée</strong> : perpendiculaires, de même
              longueur 1. Tout déplacement s’écrit avec elles : <VecName>u</VecName> = 3<VecName>i</VecName> + 2<VecName>j</VecName>.
              Les deux nombres <strong>(3 ; 2)</strong> sont les <strong>coordonnées</strong> de{' '}
              <VecName>u</VecName> — exactement les marches de l’escalier.
            </Feedback>
          ) : null}
          {/* B vient d'arriver sur l'anneau : l'escalier qui restait sous les
              yeux donne son sens à la base et aux coordonnées. */}
          {done1 && (
            <KnowledgeBrick
              id="coordonnees-vecteur"
              variant="new"
              lead={<>Tu viens de lire l’escalier : deux marches, deux nombres.</>}
            />
          )}
          {done1 && (
            <KnowledgeBrick
              id="vocab-base-orthonormee"
              variant="new"
              compact
              lead={<>Les deux petites flèches i et j que tu viens de voir, à côté de l’escalier.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">L’anneau ambre marque la case où B doit arriver. Lis les marches de l’escalier à chaque réglage.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Bouge A, bouge B',
      subtitle: 'Choisis le point à déplacer. Obtiens AB = (−2 ; 4). Le tableau se recalcule à chaque mouvement.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={A}
            vector={v2}
            onOriginChange={(nextA, nextV) => { setA(nextA); setV2(nextV); if (equal(nextV, CIBLE_2)) kit.react(true); }}
            onVectorChange={(nv) => { setV2(nv); if (equal(nv, CIBLE_2)) kit.react(true); }}
            mode="points"
            range={RANGE}
            names={{ origin: 'A', tip: 'B', vector: 'AB' }}
            escalier
            showWords={false}
            ariaLabel={`A en ${formatVec(A)}, B en ${formatVec(B)}, vecteur AB ${formatVec(v2)}`}
          />
          <div className="overflow-x-auto">
            <table className="text-sm font-mono tabular-nums border-separate border-spacing-1" aria-live="polite">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th></th><th className="px-2">A</th><th className="px-2">B</th><th className="px-2">B − A</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-sky-800 pr-2">x</td>
                  <td className="px-2 py-1 rounded bg-slate-100 text-center">{formatNum(A.x)}</td>
                  <td className="px-2 py-1 rounded bg-slate-100 text-center">{formatNum(B.x)}</td>
                  <td className="px-2 py-1 rounded bg-sky-100 text-sky-900 font-bold text-center">{formatNum(B.x)} − ({formatNum(A.x)}) = {formatNum(v2.x)}</td>
                </tr>
                <tr>
                  <td className="font-bold text-emerald-800 pr-2">y</td>
                  <td className="px-2 py-1 rounded bg-slate-100 text-center">{formatNum(A.y)}</td>
                  <td className="px-2 py-1 rounded bg-slate-100 text-center">{formatNum(B.y)}</td>
                  <td className="px-2 py-1 rounded bg-emerald-100 text-emerald-900 font-bold text-center">{formatNum(B.y)} − ({formatNum(A.y)}) = {formatNum(v2.y)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {done2 ? (
            <Feedback tone="ok">
              Tu l’as vu à chaque mouvement : la marche horizontale vaut toujours{' '}
              <strong>x<sub>B</sub> − x<sub>A</sub></strong> et la verticale <strong>y<sub>B</sub> − y<sub>A</sub></strong>.
              Bouger A change le vecteur ; bouger B aussi ; mais la règle, elle, ne bouge pas.
            </Feedback>
          ) : null}
          {/* Le tableau vient de recalculer B − A à chaque mouvement de A ou
              de B : la règle « arrivée moins départ » est ce que l'élève
              vient de voir se répéter, pas une formule à apprendre par cœur. */}
          {done2 && (
            <KnowledgeBrick
              id="regle-coordonnees"
              variant="new"
              lead={<>Tu viens de bouger A et B, et de voir le tableau recalculer B − A à chaque fois.</>}
            />
          )}
          {done2 && (
            <KnowledgeBrick
              id="mem-arrivee-moins-depart"
              variant="new"
              compact
              lead={<>La ligne à retenir : le tableau que tu viens de lire calcule toujours B − A, jamais A − B.</>}
            />
          )}
          {done2 && (
            <KnowledgeBrick
              id="methode-calcul-coordonnees"
              variant="new"
              compact
              lead={<>Les trois étapes que tu viens d’exécuter, en les répétant sur A et B.</>}
            />
          )}
          {done2 && (
            <KnowledgeBrick
              id="formule-coordonnees"
              variant="new"
              compact
              lead={<>La même règle, écrite en formule.</>}
            />
          )}
          {done2 && (
            <KnowledgeBrick
              id="mem-oppose"
              variant="new"
              compact
              lead={<>Un corollaire immédiat : inverser A et B inverse le signe des deux coordonnées.</>}
            />
          )}
          {!done2 && (
            <Feedback tone="info">Actuellement <VecName>AB</VecName> = {formatVec(v2)}. Objectif (−2 ; 4) : B doit être 2 à gauche et 4 au-dessus de A.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Sans la figure',
      subtitle: `C est en ${formatVec(C)} et D en ${formatVec(D)}.`,
      done: q3a && q3b,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Abscisse du vecteur <VecName>CD</VecName> ?</>}
            expected={CD.x}
            parse={parseDecSigned}
            display={formatNum(CD.x)}
            width="w-24"
            requires={['regle-coordonnees', 'mem-arrivee-moins-depart']}
            explain={`Arrivée moins départ, sur les abscisses : ${formatNum(D.x)} − ${formatNum(C.x)} = ${formatNum(CD.x)}. Le déplacement va vers la gauche.`}
            explainFor={(n) => (n === -CD.x
              ? 'Signe inversé : tu as calculé départ − arrivée. Le vecteur va de C VERS D, donc xD − xC.'
              : n === CD.y ? 'Tu as calculé l’ordonnée. L’abscisse se lit sur les premiers nombres : 1 − 5.' : null)}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          {q3a && (
            <NumericQuestion
              prompt={<>Ordonnée du vecteur <VecName>CD</VecName> ?</>}
              expected={CD.y}
              parse={parseDecSigned}
              display={formatNum(CD.y)}
              width="w-24"
              requires={['regle-coordonnees', 'mem-arrivee-moins-depart']}
              explain={`Sur les ordonnées : ${formatNum(D.y)} − (${formatNum(C.y)}) = ${formatNum(CD.y)}. Soustraire −3, c’est ajouter 3.`}
              explainFor={(n) => (n === -CD.y
                ? 'Signe inversé : c’est yD − yC = 2 − (−3) = 5, pas l’inverse.'
                : n === -1 ? '2 − 3 = −1 oublie que l’ordonnée de C est −3 : 2 − (−3) = 2 + 3 = 5.' : null)}
              solved={q3b}
              onAnswered={() => setQ3b(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Égaux ou pas ?',
      subtitle: 'Compare, paire par paire, sans faire la figure.',
      done: b4,
      content: (
        <div className="space-y-3">
          {/* Les modules 2 et 3 viennent d'installer l'égalité par la figure
              (M2) et les coordonnées (M3, escalier + tableau) : cette brique
              formule le CRITÈRE de calcul, juste avant qu'il ne serve. */}
          <KnowledgeBrick
            id="regle-egalite-coordonnees"
            variant="new"
            lead={<>Tu sais calculer les coordonnées d’un vecteur. Comparer deux vecteurs revient à comparer deux couples de nombres.</>}
          />
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Pour chaque paire de flèches, même vecteur ou non ?</p>}
          rows={[
            { id: 'p1', label: 'De (0 ; 0) à (3 ; 1), et de (−4 ; 2) à (−1 ; 3)', options: ['Même vecteur', 'Différents'], correct: 0, correction: 'Les deux valent (3 ; 1). L’endroit ne compte pas.' },
            { id: 'p2', label: 'De (1 ; 1) à (4 ; 2), et de (4 ; 2) à (1 ; 1)', options: ['Même vecteur', 'Différents'], correct: 1, correction: '(3 ; 1) et (−3 ; −1) : opposés, pas égaux.' },
            { id: 'p3', label: 'De (0 ; 0) à (2 ; 3), et de (0 ; 0) à (3 ; 2)', options: ['Même vecteur', 'Différents'], correct: 1, correction: '(2 ; 3) ≠ (3 ; 2) : les coordonnées échangées donnent une autre direction.' },
            { id: 'p4', label: 'De (−5 ; −5) à (−3 ; −1), et de (3 ; 1) à (5 ; 5)', options: ['Même vecteur', 'Différents'], correct: 0, correction: 'Les deux valent (2 ; 4), aux deux extrémités du sol.' },
          ]}
          requires={['regle-egalite-coordonnees', 'regle-coordonnees']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight ? 'Tu compares les coordonnées, et rien d’autre : c’est le bon critère.' : `${nCorrect} sur ${total}. Calcule arrivée − départ sur chaque coordonnée, puis compare les deux couples.`}
            </Feedback>
          )}
          solved={b4}
          onAnswered={() => setB4(true)}
        />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Deux nombres suffisent"
      moduleSubtitle="Les coordonnées d’un vecteur"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Écrire un déplacement',
        tone: 'sky',
        body: (
          <p>
            « 3 vers la droite et 2 vers le haut » tient en deux nombres. Ils se lisent sur un
            escalier, puis se calculent à partir des coordonnées des points — sans figure.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
