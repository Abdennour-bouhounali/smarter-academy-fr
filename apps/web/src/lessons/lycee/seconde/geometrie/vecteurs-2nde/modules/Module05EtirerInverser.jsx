import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ScaleLab from '../components/ScaleLab';
import VectorLab from '../components/VectorLab';
import { VecName } from '../components/VectorScene';
import { SCENES, RANGE, colinearFactor, isZero, equal, formatVec, formatNum, scale } from '../components/vecteurUtils';

/**
 * Module 5 — MANIPULATION : étirer, inverser.
 *
 * Activity              faire varier k et regarder k·u ; construire un
 *                       vecteur colinéaire à u.
 * Mathematical objective k·u a pour coordonnées (k·x ; k·y) : même direction,
 *                       longueur × |k|, sens conservé si k > 0, inversé si
 *                       k < 0, vecteur nul si k = 0. Colinéaires = l'un est
 *                       un multiple de l'autre.
 * Student action        curseur / stepper sur k ; steppers sur v.
 * Controlled variable   k, puis v.
 * Visual consequence    la flèche s'allonge, se retourne (couleur ambre),
 *                       disparaît ; le facteur k s'affiche ou « pas un multiple ».
 * Expected observation  « k négatif ne change pas la direction, seulement le sens ».
 * Misconception targeted « k < 0 change la direction » ; « ×2 sur une seule
 *                       coordonnée ».
 */
const { u: U, origin: O } = SCENES.etirer;
const GOALS = [2, -1, 0];
const C0 = { x: -5, y: -4 };

export default function Module05EtirerInverser() {
  const [pred, setPred] = useState(null);
  const [k, setK] = useState(1);
  const [visited, setVisited] = useState(() => new Set());
  const done1 = GOALS.every((g) => visited.has(g));

  const [b2, setB2] = useState(false);

  const [v3, setV3] = useState({ x: 1, y: 2 });
  const k3 = colinearFactor(U, v3);
  const done3 = k3 !== null && k3 !== 1 && !isZero(v3);

  const [q4, setQ4] = useState(false);

  const onK = (next, react) => {
    setK(next);
    if (GOALS.includes(next) && !visited.has(next)) {
      const s = new Set(visited); s.add(next); setVisited(s);
      react(true);
    }
  };
  const remaining = GOALS.filter((g) => !visited.has(g));

  const steps = [
    {
      num: 1,
      title: 'Fais varier k',
      subtitle: 'Passe par k = 2, k = −1 et k = 0. Observe la flèche à chaque valeur.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Que devient le vecteur si je double son déplacement (k = 2) ?"
            options={[
              { id: 'long', label: 'Deux fois plus long, même sens' },
              { id: 'inv', label: 'Deux fois plus long, sens contraire' },
              { id: 'haut', label: 'Même longueur, plus vers le haut' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <ScaleLab origin={O} u={U} k={k} onK={(next) => onK(next, kit.react)} range={RANGE} />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'long' ? 'Ta prédiction était juste' : pred === 'inv' ? 'Pour k = 2 le sens ne change pas — c’est k négatif qui retourne la flèche' : pred === 'haut' ? 'Doubler multiplie LES DEUX coordonnées : la direction ne change pas' : 'Regarde'} :
              k = 2 double la longueur en gardant le sens ; k = −1 garde la longueur et la{' '}
              <strong>direction</strong> mais retourne le sens ; k = 0 laisse le vecteur nul. Dans tous les
              cas, k·<VecName>u</VecName> = (k × {formatNum(U.x)} ; k × {formatNum(U.y)}).
            </Feedback>
          ) : null}
          {/* k = 2, −1 puis 0 viennent d'être visités et regardés : la règle
              du produit par un réel est ce que la flèche vient de montrer. */}
          {done1 && (
            <KnowledgeBrick
              id="regle-produit-reel"
              variant="new"
              lead={<>Tu viens de passer par k = 2, k = −1 et k = 0 sur la même flèche.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">Encore à visiter : {remaining.map((g) => `k = ${formatNum(g)}`).join(', ')}.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Par le calcul',
      subtitle: `u = ${formatVec(U)}.`,
      done: b2,
      content: (
        <BatchChoiceQuestion
          rows={[
            { id: 'k1', label: '3·u', options: [formatVec(scale(U, 3)), '(6 ; 1)', '(5 ; 4)'], correct: 0, correction: 'Les DEUX coordonnées sont multipliées : (3 × 2 ; 3 × 1).' },
            { id: 'k2', label: '−u', options: [formatVec(scale(U, -1)), '(−2 ; 1)', '(1 ; 2)'], correct: 0, correction: 'Le signe change sur les deux coordonnées : sens contraire.' },
            { id: 'k3', label: '0,5·u', options: [formatVec(scale(U, 0.5)), '(1 ; 1)', '(2,5 ; 1,5)'], correct: 0, correction: '(0,5 × 2 ; 0,5 × 1) = (1 ; 0,5) : deux fois plus court, même sens.' },
            { id: 'k4', label: '−3·u', options: [formatVec(scale(U, -3)), '(−6 ; 3)', '(6 ; 3)'], correct: 0, correction: 'Trois fois plus long ET retourné : (−6 ; −3).' },
          ]}
          requires={['regle-produit-reel']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight ? 'k multiplie chaque coordonnée, signe compris.' : `${nCorrect} sur ${total}. k·(x ; y) = (k·x ; k·y) : les deux coordonnées, avec le signe de k.`}
            </Feedback>
          )}
          solved={b2}
          onAnswered={() => setB2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Construis un vecteur porté par la même direction',
      subtitle: `La flèche grise est u = ${formatVec(U)}. Règle v pour qu’il soit un multiple de u — mais pas u lui-même.`,
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={C0}
            vector={v3}
            onVectorChange={(nv) => {
              setV3(nv);
              const kk = colinearFactor(U, nv);
              if (kk !== null && kk !== 1 && !isZero(nv)) kit.react(true);
            }}
            mode="build"
            range={RANGE}
            names={{ origin: 'C', tip: 'D', vector: 'v' }}
            ghosts={[{ origin: O, vector: U, name: 'u' }]}
            showWords={false}
            ariaLabel={`Flèche v depuis C, coordonnées ${formatVec(v3)}`}
          />
          <p className="text-sm text-slate-700" aria-live="polite">
            {isZero(v3)
              ? 'v est nul : colinéaire à tout, mais ce n’est pas ce qu’on cherche ici.'
              : k3 === null
                ? <>Pas un multiple de <VecName>u</VecName> : les deux flèches ne sont pas parallèles.</>
                : <><VecName>v</VecName> = <strong>{formatNum(k3)}</strong>·<VecName>u</VecName>{k3 === 1 ? ' — c’est u lui-même, cherche un autre multiple.' : ''}</>}
          </p>
          {done3 ? (
            <Feedback tone="ok">
              <VecName>v</VecName> = {formatNum(k3)}·<VecName>u</VecName> : les deux flèches ont la même
              direction. On dit que <VecName>u</VecName> et <VecName>v</VecName> sont{' '}
              <strong>colinéaires</strong>. Deux vecteurs non nuls sont colinéaires exactement quand
              l’un est un multiple de l’autre.
            </Feedback>
          ) : null}
          {/* v vient d'être réglé pour être un multiple de u, et l'élève a
              vu les deux flèches s'aligner : la colinéarité est ce résultat. */}
          {done3 && (
            <KnowledgeBrick
              id="regle-colineaire"
              variant="new"
              lead={<>Tu viens de régler v pour qu’il ait la même direction que u.</>}
            />
          )}
          {!done3 && (
            <Feedback tone="info">Un multiple de (2 ; 1) : (4 ; 2), (−2 ; −1), (6 ; 3)… Les deux coordonnées sont multipliées par le même nombre.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Colinéaires ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Quelle paire de vecteurs est colinéaire ?"
          options={['(2 ; 3) et (−4 ; −6)', '(2 ; 3) et (3 ; 2)', '(2 ; 3) et (4 ; 5)', '(1 ; 0) et (0 ; 1)']}
          correct={0}
          cols={2}
          requires={['regle-colineaire', 'regle-produit-reel']}
          explain="(−4 ; −6) = −2 × (2 ; 3) : même direction, sens contraire — colinéaires. Les autres ne sont pas des multiples : (3 ; 2) échange les coordonnées, (4 ; 5) double la première mais pas la seconde, et i et j sont perpendiculaires."
          explainWrong="Cherche un nombre k qui multiplie LES DEUX coordonnées : seul (−4 ; −6) = −2 × (2 ; 3) convient."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Étirer, inverser"
      moduleSubtitle="Multiplier un vecteur par un réel"
      estimatedTime="9 min"
      brief={{
        tag: 'Manipulation',
        title: 'Un seul bouton : k',
        tone: 'purple',
        body: (
          <p>
            Le robot reçoit l’ordre « fais ce trajet <strong>k fois</strong> ». Pour k = 2, k = −1,
            k = 0… la flèche change — mais pas sa direction. Vérifie-le.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
