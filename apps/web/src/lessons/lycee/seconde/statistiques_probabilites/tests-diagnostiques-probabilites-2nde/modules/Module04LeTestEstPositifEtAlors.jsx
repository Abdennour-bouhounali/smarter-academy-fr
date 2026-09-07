import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PpvExplorer from '../components/PpvExplorer';
import { REFERENCE, scenario } from '../data';

/**
 * Module 4 — FORMALISATION : la valeur prédictive positive, et l'inversion
 * du conditionnement.
 *
 * La manipulation décisive : ne bouger QUE la prévalence et voir la VPP
 * passer de 2 % à 93 % sans que le test ait changé. C'est ce qui établit,
 * sans le dire, que P(atteint | test +) n'est pas une propriété du test —
 * alors que la sensibilité en est une.
 *
 * L'élève doit avoir exploré une prévalence basse ET une haute pour valider :
 * une seule valeur ne montrerait rien.
 */
const S = scenario(REFERENCE);

export default function Module04LeTestEstPositifEtAlors() {
  const [params, setParams] = useState(REFERENCE);
  const [lowSeen, setLowSeen] = useState(false);
  const [highSeen, setHighSeen] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = lowSeen && highSeen;

  const handleChange = (next, react) => {
    setParams(next);
    let low = lowSeen; let high = highSeen;
    if (next.prevalence <= 0.02) low = true;
    if (next.prevalence >= 0.2) high = true;
    setLowSeen(low); setHighSeen(high);
    if (!done1 && low && high) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Fais varier la prévalence, sans toucher au test',
      subtitle: 'Descends sous 2 %, puis monte au-dessus de 20 %. Regarde la dernière ligne.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PpvExplorer params={params} onChange={(next) => handleChange(next, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              Le test n’a pas changé : même sensibilité, même spécificité. Pourtant la réponse à
              « suis-je atteint ? » passe de quelques pour cent à plus de 90 %. Cette probabilité{' '}
              <strong>n’est pas une propriété du test</strong> : elle dépend de la population dans laquelle
              on l’utilise. C’est pourquoi un dépistage de masse et un test sur un groupe à risque ne
              s’interprètent pas de la même façon.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Encore à explorer : {!lowSeen && 'une prévalence faible (sous 2 %)'}
              {!lowSeen && !highSeen && ' et '}
              {!highSeen && 'une prévalence élevée (au-dessus de 20 %)'}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La question de la personne testée',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 space-y-3">
            <div className="text-center">
              <MathText>{'$$P_{\\text{test }+}(\\text{atteint}) = \\frac{VP}{VP + FP}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              On l’appelle la <strong>valeur prédictive positive</strong>. Elle se calcule sur une
              <strong> ligne</strong> du tableau (les positifs), là où sensibilité et spécificité se
              calculaient sur les <strong>colonnes</strong> (l’état de santé).
            </p>
            <div className="grid gap-2 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900">
                <strong>P<sub>atteint</sub>(test +) = 99 %</strong><br />
                <span className="text-xs">la qualité du test</span>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                <strong>P<sub>test +</sub>(atteint) = {formatPercent(S.ppv, 1)}</strong><br />
                <span className="text-xs">ce qui intéresse la personne testée</span>
              </div>
            </div>
          </div>
          <NumericQuestion
            prompt={`Avec les valeurs de départ (${S.truePositive} vrais positifs et ${S.falsePositive} faux positifs), quelle est la valeur prédictive positive ? (en %, arrondie au dixième)`}
            expected={(n) => Math.abs(n - S.ppv * 100) < 0.4}
            parse={parseDec}
            display="16,7 %"
            suffix="%"
            explain={`${S.truePositive} ÷ ${S.positive} ≈ 0,167, soit environ 16,7 %. On divise par le nombre TOTAL de tests positifs, pas par le nombre de malades.`}
            explainFor={(n) => (Math.abs(n - 99) < 1
              ? 'C’est la sensibilité : elle se calcule parmi les personnes atteintes. Ici la condition est « le test est positif », donc le dénominateur est le nombre de positifs.'
              : null)}
            solved={q2} onAnswered={(ok) => { if (ok) setQ2(true); }}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Repérer l’inversion',
      done: q3,
      content: (
        <TapQuestion
          prompt="« Ce test est fiable à 99 %, donc si tu es positif, tu as 99 % de risque d’être atteint. » Où est l’erreur ?"
          options={[
            'On a échangé la condition : 99 % est P(test + | atteint), pas P(atteint | test +)',
            'Le test n’est pas vraiment fiable à 99 %',
            'Il faudrait ajouter la spécificité aux 99 %',
            'Il n’y a pas d’erreur',
          ]}
          correct={0} cols={1}
          explain="C’est l’erreur d’inversion du conditionnement, exactement celle rencontrée avec les fréquences conditionnelles. Les 99 % se calculent parmi les personnes atteintes ; la question porte sur les personnes positives. Deux populations de référence différentes, deux nombres sans rapport : 99 % et 16,7 %."
          explainWrong="Les 99 % annoncés sont une qualité mesurée SUR LES MALADES. La question posée part du résultat du test — c’est le conditionnement inverse."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Le test est positif : et alors ?" moduleSubtitle="La valeur prédictive positive" estimatedTime="15 min"
      brief={{
        tag: 'Formalisation', title: 'La seule question qui compte pour la personne testée', tone: 'emerald',
        body: <p>Sensibilité et spécificité décrivent le test. Mais celui qui reçoit un résultat positif veut savoir tout autre chose — et la réponse dépend d’un nombre qui n’a rien à voir avec le test.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Retenu.</strong> <strong>VPP</strong> = VP / (VP + FP), calculée sur la ligne des positifs,
          et elle dépend fortement de la <strong>prévalence</strong>. Ne jamais confondre
          P<sub>atteint</sub>(test +) et P<sub>test +</sub>(atteint). Module suivant : quatre affirmations à
          trancher.
        </KnowledgeSnapshot>
      )}
    />
  );
}
