import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SumLab from '../components/SumLab';
import VectorScene, { VecName, SCENE_COLORS } from '../components/VectorScene';
import { SCENES, RANGE, add, vec, equal, opposite, isZero, formatVec } from '../components/vecteurUtils';

/**
 * Module 4 — MANIPULATION : enchaîner les déplacements.
 *
 * Activity              poser v au bout de u, lire le trajet direct ; revenir
 *                       au départ ; la relation de Chasles ; l'ordre inverse.
 * Mathematical objective u + v est le déplacement « u puis v » ; ses
 *                       coordonnées s'ajoutent ; AB + BC = AC ; u + (−u) = 0.
 * Student action        régler v (steppers, glisser C) ; prédire avant.
 * Controlled variable   v.
 * Mathematical state    origine, u, v ; la somme dérivée.
 * Visual consequence    la flèche ambre « trajet direct » ; le tableau des
 *                       coordonnées avec l'addition écrite.
 * Expected observation  « la somme, c'est le trajet direct, et les nombres
 *                       s'ajoutent » ; « pour revenir : l'opposé ».
 * Misconception targeted la somme « plus longue que les deux » ; oublier le
 *                       signe dans 3 + (−1).
 */
const { u: U, v: V, origin: O } = SCENES.somme;
const ARRIVEE = add(add(O, U), V);            // (−1 ; 1)
const { A, B, C } = SCENES.chasles;

export default function Module04EnchainerLesDeplacements() {
  const [pred1, setPred1] = useState(null);
  const [v1, setV1] = useState({ x: 1, y: 1 });
  const done1 = equal(v1, V);

  const [pred2, setPred2] = useState(null);
  const [v2, setV2] = useState({ x: 1, y: 1 });
  const done2 = equal(v2, opposite(U));

  const [q3, setQ3] = useState(false);
  const [b4, setB4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Deux flèches bout à bout',
      subtitle: `u = ${formatVec(U)} est posé depuis A. Règle v = ${formatVec(V)} au bout de u, et regarde où arrive C.`,
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt={`Depuis A ${formatVec(O)}, après u = ${formatVec(U)} puis v = ${formatVec(V)}, où arrive-t-on ?`}
            options={[
              { id: 'ok', label: formatVec(ARRIVEE) },
              { id: 'sum', label: formatVec(add(U, V)) },
              { id: 'uonly', label: formatVec(add(O, U)) },
            ]}
            value={pred1}
            onChange={setPred1}
            disabled={done1}
          />
          <SumLab
            origin={O}
            u={U}
            v={v1}
            onV={(nv) => { setV1(nv); if (equal(nv, V)) kit.react(true); }}
            range={RANGE}
            showSum={done1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'ok' ? 'Ta prédiction était juste' : pred1 === 'sum' ? `Ta prédiction ${formatVec(add(U, V))} est le DÉPLACEMENT total, pas le point d’arrivée` : pred1 === 'uonly' ? 'Ta prédiction s’arrêtait après u' : 'Regarde'} :
              C est en {formatVec(ARRIVEE)}. Le trajet direct de A à C (flèche ambre) vaut{' '}
              <strong>{formatVec(add(U, V))}</strong> : c’est <VecName>u</VecName> + <VecName>v</VecName>, et ses
              coordonnées sont les <strong>sommes</strong> 3 + (−1) et 1 + 3.
            </Feedback>
          ) : null}
          {/* La flèche ambre vient d'afficher le trajet direct : la somme
              est ce que l'élève regarde, pas une formule annoncée d'avance. */}
          {done1 && (
            <KnowledgeBrick
              id="regle-somme"
              variant="new"
              lead={<>Tu viens de poser v au bout de u et de voir le trajet direct (flèche ambre) apparaître.</>}
            />
          )}
          {done1 && (
            <KnowledgeBrick
              id="formule-somme"
              variant="new"
              compact
              lead={<>La même règle, écrite en formule.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">Règle v = {formatVec(V)} : la flèche verte part du bout de u. C se déplace avec elle.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Reviens en A',
      subtitle: 'Même u. Quel v faut-il ajouter pour que C retombe sur A ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Quel déplacement faut-il ajouter à u pour revenir au point de départ ?"
            options={[
              { id: 'opp', label: `−u = ${formatVec(opposite(U))}` },
              { id: 'same', label: `u encore = ${formatVec(U)}` },
              { id: 'zero', label: 'le vecteur nul' },
            ]}
            value={pred2}
            onChange={setPred2}
            disabled={done2}
          />
          <SumLab
            origin={O}
            u={U}
            v={v2}
            onV={(nv) => { setV2(nv); if (equal(nv, opposite(U))) kit.react(true); }}
            range={RANGE}
            names={{ u: 'u', v: 'v', sum: 'u + v', origin: 'A', mid: 'B', end: 'C' }}
            showSum
          />
          {done2 ? (
            <Feedback tone="ok">
              {pred2 === 'opp' ? 'Ta prédiction était la bonne' : pred2 === 'zero' ? 'Ajouter le vecteur nul ne déplace rien : c’est −u qu’il fallait' : pred2 === 'same' ? 'Ajouter u encore éloigne deux fois plus : c’est −u qu’il fallait' : 'Regarde'} :
              avec v = −<VecName>u</VecName>, C est revenu sur A et le trajet direct est un anneau :{' '}
              <VecName>u</VecName> + (−<VecName>u</VecName>) = <VecName>0</VecName>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {isZero(add(U, v2)) ? '' : `Trajet direct actuel : ${formatVec(add(U, v2))}. Il doit devenir (0 ; 0).`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La relation de Chasles',
      subtitle: 'Trois points quelconques A, B, C.',
      done: q3,
      content: (
        <div className="space-y-3">
          <VectorScene
            range={RANGE}
            points={[
              { id: 'A', name: 'A', x: A.x, y: A.y, color: '#4f46e5' },
              { id: 'B', name: 'B', x: B.x, y: B.y, color: '#7c3aed' },
              { id: 'C', name: 'C', x: C.x, y: C.y, color: '#059669' },
            ]}
            arrows={[
              { id: 'ab', from: A, to: B, color: SCENE_COLORS.main, name: 'AB' },
              { id: 'bc', from: B, to: C, color: SCENE_COLORS.second, name: 'BC' },
              { id: 'ac', from: A, to: C, color: SCENE_COLORS.sum, name: 'AC', dashed: true },
            ]}
            ariaLabel="Trois points A, B, C avec les flèches AB, BC et AC"
          />
          {/* La figure ci-dessus affiche déjà AB, BC et AC : la relation de
              Chasles nomme ce que l'élève va vérifier dans la question. */}
          <KnowledgeBrick
            id="vocab-relation-chasles"
            variant="new"
            lead={<>Regarde les trois flèches : AB, puis BC, puis AC en pointillé.</>}
          />
          <KnowledgeBrick
            id="mem-chasles"
            variant="new"
            compact
            lead={<>Une phrase à retenir : la lettre du milieu disparaît.</>}
          />
          <KnowledgeBrick
            id="formule-chasles"
            variant="new"
            compact
            lead={<>La même règle, écrite en formule.</>}
          />
          <TapQuestion
            prompt={<>Que vaut <VecName>AB</VecName> + <VecName>BC</VecName> ?</>}
            options={['AC', 'CA', 'AB', 'BC']}
            renderOption={(o) => <VecName>{o}</VecName>}
            correctionLabel="AC"
            correct={0}
            cols={4}
            requires={['vocab-relation-chasles', 'regle-somme']}
            explain={`Aller de A à B puis de B à C, c’est aller de A à C : AB + BC = AC. Vérifie avec les coordonnées : ${formatVec(vec(A, B))} + ${formatVec(vec(B, C))} = ${formatVec(vec(A, C))}. C’est la relation de Chasles, vraie pour n’importe quel point B.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Dans l’autre ordre, et par le calcul',
      subtitle: 'Le fantôme gris fait v puis u : même arrivée. Puis trois sommes sans figure.',
      done: b4,
      content: (
        <div className="space-y-3">
          <SumLab origin={O} u={U} v={V} range={RANGE} parallelogram showSum showTable={false} disabled ariaLabel="u puis v, et v puis u : un parallélogramme" />
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Calcule chaque somme.</p>}
            rows={[
              { id: 's1', label: '(2 ; −3) + (−5 ; 1)', options: ['(−3 ; −2)', '(7 ; −4)', '(−3 ; 2)'], correct: 0, correction: '2 + (−5) = −3 et −3 + 1 = −2.' },
              { id: 's2', label: '(4 ; 0) + (−4 ; 0)', options: ['(0 ; 0)', '(8 ; 0)', '(0 ; 4)'], correct: 0, correction: 'Les deux vecteurs sont opposés : la somme est le vecteur nul.' },
              { id: 's3', label: 'v + u, quand u + v = (2 ; 4)', options: ['(2 ; 4)', '(4 ; 2)', '(−2 ; −4)'], correct: 0, correction: 'L’addition est commutative : la figure ci-dessus le montre, les deux chemins arrivent au même point.' },
            ]}
            requires={['regle-somme', 'vocab-relation-chasles']}
            feedback={({ allRight, nCorrect, total }) => (
              <Feedback tone={allRight ? 'ok' : 'info'}>
                {allRight ? 'Coordonnée par coordonnée, avec les signes : c’est tout.' : `${nCorrect} sur ${total}. On ajoute les abscisses ensemble, puis les ordonnées ensemble, sans oublier les signes.`}
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
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Enchaîner les déplacements"
      moduleSubtitle="La somme de deux vecteurs"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Deux ordres, un trajet',
        tone: 'emerald',
        body: (
          <p>
            Au dépôt, deux ordres à la suite faisaient un seul trajet direct. Ici, tu poses la seconde
            flèche au bout de la première et tu lis le trajet direct — puis tu le calcules.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
