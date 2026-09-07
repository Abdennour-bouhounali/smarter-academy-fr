import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TestPopulationLab from '../components/TestPopulationLab';
import { REFERENCE, scenario } from '../data';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : révéler la population
 * par étapes (components/TestPopulationLab.jsx).
 *
 * Le paradoxe des faux positifs n'est PAS énoncé : il apparaît à la
 * quatrième étape, quand les 495 pastilles orange écrasent visuellement les
 * 99 rouges. La prédiction est recueillie avant — et la très grande majorité
 * des élèves (comme des adultes, et comme beaucoup de médecins dans les
 * études classiques) répond « environ 99 % ».
 *
 * Tout est en EFFECTIFS. Aucune probabilité décimale, aucune notation : le
 * comptage suffit à produire la surprise, et c'est précisément ce qui rend
 * le phénomène intuitif. Ce que ce module ne fait PAS : nommer les quatre
 * cases (M2), définir sensibilité/spécificité (M3), écrire P_+(M) ni faire
 * varier la prévalence (M4).
 */
const S = scenario(REFERENCE);

export default function Module01DixMillePersonnes() {
  const [step, setStep] = useState('population');
  const [seen, setSeen] = useState(() => new Set(['population']));
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);

  const done1 = seen.has('positifs');
  const done2 = q2;

  const changeStep = (id, react) => {
    setStep(id);
    const next = new Set(seen); next.add(id); setSeen(next);
    if (!done1 && id === 'positifs') react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Révèle la population, étape par étape',
      subtitle: 'Un test très fiable, une maladie rare. Va jusqu’à la quatrième étape.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Un test détecte 99 % des personnes atteintes et se trompe sur 5 % des personnes saines. Ton test est positif : quelle est, à ton avis, la probabilité que tu sois atteint ?"
            options={[
              { id: 'presque-sur', label: 'Environ 99 %' },
              { id: 'moitie', label: 'Environ 50 %' },
              { id: 'faible', label: 'Moins de 20 %' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <TestPopulationLab step={step} params={REFERENCE} onStepChange={(id) => changeStep(id, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'faible' ? 'Tu avais vu juste' : 'Voilà la surprise'} : parmi les{' '}
              <strong>{S.positive}</strong> personnes dont le test est positif, seulement{' '}
              <strong>{S.truePositive}</strong> sont réellement atteintes —{' '}
              <strong>{formatPercent(S.ppv, 1)}</strong>. Le test n’est pourtant pas mauvais : il détecte
              99 des 100 malades. Mais 5 % d’erreur sur <strong>{S.healthy.toLocaleString('fr-FR')}</strong>{' '}
              personnes saines font <strong>{S.falsePositive}</strong> fausses alertes, et elles noient les
              vrais cas.
              <br />
              <span className="text-slate-500">
                Nombre de médecins se trompent sur cette question : ce n’est pas une question de calcul,
                c’est une question de population de référence.
              </span>
            </Feedback>
          ) : null}
          {/* Les quatre groupes viennent d'être COMPTÉS à l'écran, et le
              déséquilibre 99 / 495 est encore sous les yeux : c'est l'instant
              où l'on peut les nommer comme partition — avant la question de
              l'étape 2, qui l'exige. */}
          {done1 && (
            <KnowledgeBrick
              id="quatre-groupes"
              variant="new"
              lead={<>Tu viens de séparer <strong>{S.ill}</strong> personnes atteintes de <strong>{S.healthy.toLocaleString('fr-FR')}</strong> personnes saines, puis de compter combien de chaque groupe le test déclare positives. Ces quatre nombres ont un statut.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">
              Étapes révélées : {seen.size} sur 4. Va jusqu’à « ne garder que les positifs ».
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'D’où viennent tous ces faux positifs ?',
      done: done2,
      content: (
        <TapQuestion
          requires={['quatre-groupes', 'effectif', 'pourcentage']}
          prompt={`Pourquoi y a-t-il ${S.falsePositive} faux positifs, alors que le test ne se trompe que sur 5 % des personnes saines ?`}
          options={[
            'Parce que les personnes saines sont très nombreuses : 5 % de 9 900 font beaucoup',
            'Parce que le test est mal conçu',
            'Parce que la sensibilité est trop faible',
            'Parce qu’on a testé trop peu de personnes',
          ]}
          correct={0} cols={1}
          explain={`5 % de ${S.healthy.toLocaleString('fr-FR')} personnes saines = ${S.falsePositive} erreurs, contre 99 % de seulement ${S.ill} malades = ${S.truePositive} détections. Une petite proportion d’un très grand groupe dépasse une grande proportion d’un tout petit groupe. Le test n’est pas en cause : c’est la RARETÉ de la maladie qui produit ce déséquilibre.`}
          explainWrong="Compare les deux effectifs de départ : 100 personnes atteintes contre 9 900 saines. Même un petit taux d’erreur appliqué au second groupe donne un grand nombre."
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Dix mille personnes, quatre groupes" moduleSubtitle="Compter avant de calculer" estimatedTime="15 min"
      brief={{
        tag: 'Déclencheur', title: 'Un test fiable à 99 %', tone: 'indigo',
        body: (
          <>
            <p>On teste 10 000 personnes pour une maladie qui touche 1 personne sur 100. Le test est excellent. Ton résultat est positif — que faut-il en conclure ?</p>
            <p className="mt-1.5 text-xs text-slate-500">Les nombres de cette leçon sont fictifs : on modélise un test, on ne parle d’aucune maladie réelle et on ne donne aucun conseil médical.</p>
          </>
        ),
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Ce que tu viens de voir.</strong> Un test partage une population en{' '}
          <strong>quatre groupes</strong>, et un résultat positif ne signifie pas « atteint » : tout dépend
          du nombre de personnes saines testées. Module suivant : nommer ces quatre groupes.
        </KnowledgeSnapshot>
      )}
    />
  );
}
