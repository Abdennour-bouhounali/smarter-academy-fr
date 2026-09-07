import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ReducedLab from '../components/ReducedLab';
import PredictionChips from '../components/PredictionChips';
import { lineFromSlopeIntercept, relativePosition, formatDec } from '../components/droitesUtils';

/**
 * Module 3 — DÉCOUVERTE : les équations décident tout.
 *
 * Activity               (d₁) : y = 0,5x + 2 est figée ; (d₂) : y = m₂x + p₂
 *                        se règle avec deux curseurs.
 * Student action         régler m₂ (étape 1), puis p₂ seul (étape 2).
 * Controlled variable    m₂ puis p₂ — un bouton à la fois.
 * Mathematical state     (m₂, p₂) ; droites canoniques et position DÉRIVÉES.
 * Visual consequence     m₂ fait pivoter (d₂) : à m₂ = 0,5 elle devient
 *                        parallèle à (d₁) — pour n'importe quel p₂ ; p₂ la
 *                        fait glisser : à p₂ = 2 elle se confond avec (d₁).
 * Expected observation   « m décide sécantes / parallèles ; p départage
 *                        parallèles / confondues ».
 * Misconception targeted « même pente ⇒ même droite » ; « une équation
 *                        cartésienne et une équation réduite aux coefficients
 *                        différents sont deux droites différentes ».
 * Formalization          le critère sur les équations, en pied de module.
 */
const D1 = { m: 0.5, p: 2 };
const posOf = (v) => relativePosition(lineFromSlopeIntercept(D1.m, D1.p), lineFromSlopeIntercept(v.m, v.p));

export default function Module03LesEquations() {
  const [val, setVal] = useState({ m: 2, p: -1 });
  const [pred1, setPred1] = useState(null);
  const [snap1, setSnap1] = useState(null);
  const [snap2, setSnap2] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = snap1 !== null;
  const done2 = snap2 !== null;

  const change1 = (next, react) => { setVal(next); if (posOf(next) === 'paralleles') { setSnap1(next); react?.(true); } };
  const change2 = (next, react) => { setVal(next); if (posOf(next) === 'confondues') { setSnap2(next); react?.(true); } };

  const steps = [
    {
      num: 1,
      title: 'Rends (d₂) parallèle à (d₁) — avec m₂ seulement',
      subtitle: 'p₂ est verrouillé. Règle m₂ jusqu’à ce que le point commun disparaisse.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="pour rendre (d₂) parallèle à (d₁), quelle valeur de m₂ faut-il ?"
            options={[{ id: 'm', label: 'm₂ = 0,5, comme (d₁)' }, { id: 'p', label: 'Ça dépend aussi de p₂' }, { id: 'opp', label: 'm₂ = −0,5' }]}
            value={pred1} onChange={setPred1} disabled={done1} />
          <ReducedLab d1={D1} value={done1 ? snap1 : val} onChange={(n) => change1(n, kit.react)} disabled={done1} lockP />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'm' ? 'Ta prédiction était la bonne' : pred1 === 'p' ? 'Ta prédiction : ça dépend de p₂. Non — p₂ n’a pas bougé' : pred1 === 'opp' ? 'Ta prédiction : −0,5. C’est l’autre diagonale' : 'Regarde'} :
              à <strong>m₂ = {formatDec(snap1.m)} = m₁</strong>, les droites deviennent <strong>strictement parallèles</strong>, quel que soit p₂ (ici p₂ = {formatDec(snap1.p)}).
              Le coefficient directeur EST la direction : (1 ; m) dirige la droite.
            </Feedback>
          ) : (
            <Feedback tone="info">Sécantes tant que m₂ ≠ m₁. Le point I glisse le long de (d₁) quand m₂ change.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Puis confondues — avec p₂ seulement',
      subtitle: 'm₂ reste égal à m₁. Règle p₂ : à quelle valeur ne reste-t-il plus qu’une droite ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <ReducedLab d1={D1} value={done2 ? snap2 : (done1 ? val : { m: 0.5, p: -1 })} onChange={(n) => change2(n, kit.react)} disabled={done2 || !done1} lockM />
          {done2 ? (
            <Feedback tone="ok">
              À <strong>p₂ = {formatDec(snap2.p)} = p₁</strong> : mêmes m, mêmes p, <strong>même équation</strong> — c’est la même droite, tous ses points sont communs.
              Même pente ne suffisait pas ; il fallait aussi le même point de passage sur l’axe des ordonnées.
            </Feedback>
          ) : (
            <Feedback tone="info">Parallèles, toujours zéro point commun… jusqu’à ce que p₂ atteigne p₁.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une même droite, deux écritures',
      done: q3,
      content: (
        <TapQuestion
          prompt={<span>La droite d’équation cartésienne <MathText>{'$2x - 4y + 8 = 0$'}</MathText> et la droite <MathText>{'$y = 0{,}5x + 2$'}</MathText> : quelle position relative ?</span>}
          options={[
            'Confondues : c’est la même droite, écrite autrement.',
            'Sécantes : les coefficients sont différents.',
            'Strictement parallèles : même pente, autre ordonnée à l’origine.',
            'On ne peut pas comparer une équation cartésienne et une équation réduite.',
          ]}
          correct={0}
          cols={1}
          explain="Isole y : 2x − 4y + 8 = 0 ⟺ −4y = −2x − 8 ⟺ y = 0,5x + 2. Même m, même p : même droite. On peut aussi comparer les coefficients cartésiens : (2 ; −4 ; 8) est proportionnel à (−0,5 ; 1 ; −2)."
          explainWrong="Ramène toujours les deux écritures à la même forme avant de comparer. 2x − 4y + 8 = 0 devient y = 0,5x + 2 : ce sont les mêmes m et p que la seconde droite."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Décide à partir des équations',
      done: q4,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Pour chaque paire, décide : sécantes, strictement parallèles ou confondues.</p>}
          rows={[
            { id: 'e1', label: 'y = 3x − 1 et y = 3x + 4', options: ['sécantes', 'parallèles', 'confondues'], correct: 1, correction: 'même m, p différents' },
            { id: 'e2', label: 'y = −x + 2 et y = x + 2', options: ['sécantes', 'parallèles', 'confondues'], correct: 0, correction: 'm = −1 et m = 1' },
            { id: 'e3', label: 'y = 2x + 1 et 4x − 2y + 2 = 0', options: ['sécantes', 'parallèles', 'confondues'], correct: 2, correction: '4x − 2y + 2 = 0 ⟺ y = 2x + 1' },
            { id: 'e4', label: 'x + y − 1 = 0 et 2x + 2y − 7 = 0', options: ['sécantes', 'parallèles', 'confondues'], correct: 1, correction: 'y = −x + 1 et y = −x + 3,5' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Sur les équations réduites : m₁ ≠ m₂ ⇒ sécantes ; m₁ = m₂ et p₁ ≠ p₂ ⇒ strictement parallèles ;
              m₁ = m₂ et p₁ = p₂ ⇒ confondues. Une équation cartésienne se ramène d’abord à la forme réduite (ou on compare a₁b₂ − a₂b₁).
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Les équations"
      moduleSubtitle="m décide, p départage"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Deux boutons, deux décisions',
        tone: 'sky',
        body: (
          <p>
            (d₁) est fixée : <MathText>{'$y = 0{,}5x + 2$'}</MathText>. (d₂) : <MathText>{'$y = m_2 x + p_2$'}</MathText> a deux boutons. Un seul à la fois — et
            regarde le nombre de points communs.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          Sécantes : <strong>un</strong> point commun. Où est-il, exactement ? Module suivant : le point d’intersection — et le système qu’il résout.
        </KnowledgeSnapshot>
      }
    />
  );
}
