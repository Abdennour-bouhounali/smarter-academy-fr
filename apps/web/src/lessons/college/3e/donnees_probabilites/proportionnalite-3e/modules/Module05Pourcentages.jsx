import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PercentBar from '../components/PercentBar';
import { formatDec, parseDec, applyPercent, chainPercents, percentMultiplier } from '../components/propUtils';

/**
 * Module 5 — FORMALISATION : « Pourcentages et coefficient multiplicateur ».
 *
 * Activity: choisir un taux et voir la barre s'étirer ; lire le
 *   multiplicateur ; enchaîner +20 % puis −20 % ; le bloc « À retenir » de
 *   toutes les méthodes ; choisir la bonne méthode et détecter l'incohérence.
 * Mathematical objective: augmenter de t % c'est multiplier par (1 + t/100),
 *   diminuer de t % c'est multiplier par (1 − t/100) ; deux évolutions
 *   s'enchaînent en multipliant les coefficients ; formaliser les chemins de
 *   la leçon.
 * Student action: toucher un taux ; répondre.
 * Controlled variable: le taux.
 * Mathematical state: { value, rates } ; tout vient de `chainPercents`.
 * Visual consequence: la barre « après » s'allonge ou raccourcit face au
 *   repère 100 % ; le multiplicateur s'écrit.
 * Expected observation: « +20 % puis −20 % : 48 €, pas 50 ».
 * Misconception targeted: « +20 % puis −20 % revient au départ » ; « +20 %
 *   c'est +20 € ».
 */

const PRICE = 50;

export default function Module05Pourcentages() {
  const [r1, setR1] = useState([]);
  const [multDone, setMultDone] = useState(false);
  const [r2, setR2] = useState([]);
  const [downDone, setDownDone] = useState(false);
  const [rtPred, setRtPred] = useState(false);
  const [r3, setR3] = useState([]);
  const [methodDone, setMethodDone] = useState(false);

  const pick1 = (r) => setR1([r]);
  const pick2 = (r) => setR2([r]);
  const pick3 = (r) => setR3((rs) => (rs.length >= 2 ? [r] : [...rs, r]));
  const chain3 = chainPercents(PRICE, r3);
  const rtDone = r3.length === 2 && r3[0] === 20 && r3[1] === -20;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Pourcentages et coefficient multiplicateur"
      moduleSubtitle="+20 %, c’est ×1,2 ; −25 %, c’est ×0,75 — et l’aller-retour ne revient pas au départ."
      estimatedTime="10 min"
      brief={{
        tag: '🏷️ Mission 05',
        title: 'Les soldes de la déco',
        tone: 'purple',
        body: (
          <p>
            La guirlande coûte 50 €. Le magasin annonce <strong>+20 %</strong> avant les fêtes, puis
            promet <strong>−20 %</strong> après. Reviendra-t-elle à 50 € ? Commence par +20 %.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: '+20 %',
          subtitle: 'Choisis le taux +20 %, puis lis le nouveau prix.',
          done: r1.length === 1 && r1[0] === 20 && multDone,
          content: (
            <div className="space-y-3">
              <PercentBar value={PRICE} rates={r1} onPick={pick1} showMultiplier={r1[0] === 20} caption="La guirlande à 50 €" />
              {r1.length === 1 && r1[0] !== 20 && <Feedback tone="info">Tu as choisi {r1[0] > 0 ? '+' : ''}{formatDec(r1[0])} % : {formatDec(applyPercent(PRICE, r1[0]))} €. Choisis maintenant +20 %.</Feedback>}
              {r1[0] === 20 && (
                <TapQuestion
                  prompt="+20 % : 50 € devient 60 €. Par quel nombre a-t-on multiplié 50 ?"
                  options={['1,2', '20', '0,2', '1,02']}
                  correct={0}
                  cols={2}
                  explain="Augmenter de 20 %, c’est ajouter 20/100 du prix : 50 + 50 × 0,2 = 50 × (1 + 0,2) = 50 × 1,2 = 60 €. Le coefficient multiplicateur d’une hausse de t % est 1 + t/100."
                  explainWrong="50 × 1,2 = 60 : l’augmentation de 20 % est cachée dans une seule multiplication, par 1 + 20/100 = 1,2."
                  requires={['pourcentage', 'quotient']}
                  solved={multDone}
                  onAnswered={() => setMultDone(true)}
                />
              )}
              {multDone && (
                <KnowledgeBrick
                  id="coefficient-multiplicateur"
                  variant="new"
                  lead="Cette multiplication unique qui remplace « ajouter 20 % » a un nom, et une formule."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: '−25 %',
          subtitle: 'Choisis −25 %, puis calcule sur un autre prix.',
          done: r2[0] === -25 && downDone,
          content: (
            <div className="space-y-3">
              <PercentBar value={PRICE} rates={r2} onPick={pick2} showMultiplier caption="La guirlande à 50 €" />
              {r2[0] === -25 && (
                <NumericQuestion
                  prompt="Une nappe coûte 80 €, soldée à −25 %. Nouveau prix ?"
                  suffix="€"
                  expected={applyPercent(80, -25)}
                  parse={parseDec}
                  display={`${formatDec(applyPercent(80, -25))} €`}
                  explain="−25 % : multiplier par 1 − 0,25 = 0,75. 80 × 0,75 = 60 €. Une baisse de t % a pour coefficient 1 − t/100."
                  explainFor={(n) => {
                    if (n === 55) return '80 − 25 retire 25 € : mais 25 %, c’est un quart de 80, soit 20 €. Prix : 80 × 0,75 = 60 €.';
                    if (n === 20) return '20 €, c’est la remise (25 % de 80). Le prix payé : 80 − 20 = 60 €.';
                    if (n === 100) return '80 × 1,25 = 100 est une HAUSSE de 25 %. Pour une baisse : × 0,75 = 60 €.';
                    return null;
                  }}
                  requires={['coefficient-multiplicateur']}
                  solved={downDone}
                  onAnswered={() => setDownDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'L’aller-retour',
          subtitle: 'Prédis, puis enchaîne +20 % et −20 %.',
          done: rtPred && rtDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="50 €, +20 % puis −20 %. Revient-on à 50 € ?"
                options={['Non : on arrive à 48 €', 'Oui : +20 et −20 s’annulent', 'Non : on arrive à 52 €']}
                correct={0}
                cols={1}
                explain="Enchaîne les deux taux ci-dessous pour le voir : les −20 % s’appliquent à 60 €, pas à 50 €."
                explainWrong="Enchaîne les deux taux ci-dessous : les −20 % portent sur 60 €, pas sur 50 €."
                requires={['coefficient-multiplicateur']}
                solved={rtPred}
                onAnswered={() => setRtPred(true)}
              />
              {rtPred && <PercentBar value={PRICE} rates={r3} onPick={pick3} maxRates={2} choices={[-20, 20]} showMultiplier caption="Enchaîne +20 % puis −20 %" />}
              {rtPred && r3.length === 2 && !rtDone && <Feedback tone="info">Tu as enchaîné {r3.map((r) => `${r > 0 ? '+' : ''}${r} %`).join(' puis ')} : {formatDec(chain3.result)} €. Refais dans l’ordre +20 % puis −20 %.</Feedback>}
              {rtDone && (
                <Feedback tone="ok">
                  × 1,2 puis × 0,8 = × <strong>{formatDec(chain3.multiplier)}</strong> : 50 → 60 → <strong>48 €</strong>. Les pourcentages s’enchaînent en{' '}
                  <strong>multipliant les coefficients</strong>, jamais en additionnant les taux : +20 % puis −20 %, c’est −4 % au total.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'À retenir',
          subtitle: 'Toutes les méthodes de la leçon, et quand les utiliser.',
          done: methodDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-4 space-y-2 text-sm text-slate-800">
                <p><strong>Proportionnalité</strong> : d’une grandeur à l’autre, on multiplie toujours par le même nombre, le <strong>coefficient</strong> k = y ÷ x. Les points sont alignés avec l’origine.</p>
                <p><strong>Case vide</strong> : passer par l’unité · multiplier une colonne par un facteur (sur les deux lignes) · multiplier par k · produit en croix <MathText>{'$d = \\dfrac{b \\times c}{a}$'}</MathText>.</p>
                <p><strong>Pourcentages</strong> : +t % → <MathText>{'$\\times \\left(1 + \\dfrac{t}{100}\\right)$'}</MathText> ; −t % → <MathText>{'$\\times \\left(1 - \\dfrac{t}{100}\\right)$'}</MathText> ; évolutions successives : on multiplie les coefficients ({formatDec(percentMultiplier(20))} × {formatDec(percentMultiplier(-20))} = 0,96).</p>
                <p><strong>Agrandissement de rapport k</strong> : longueurs × k, aires × k², volumes × k³ (Thalès : longueurs proportionnelles).</p>
                <p><strong>Vérifier</strong> : même rapport partout ? une baisse fait-elle baisser ? l’ordre de grandeur est-il raisonnable ?</p>
              </div>
              <BatchChoiceQuestion
                intro={<p className="text-sm font-semibold text-slate-700">Quel outil pour quelle question ?</p>}
                rows={[
                  { id: 'a', label: '3 kg → 7,50 € ; 9 kg → ?', options: ['× 3 sur la colonne', '× 1,3', 'k³'], correct: 0, correction: 'De 3 à 9 : facteur 3.' },
                  { id: 'b', label: 'Un prix de 40 € augmente de 30 %', options: ['× 1,3', '× 30', '+ 30 €'], correct: 0, correction: '1 + 30/100 = 1,3.' },
                  { id: 'c', label: 'Une maquette agrandie ×3 : son aire est…', options: ['× 9', '× 3', '× 27'], correct: 0, correction: 'k² = 9.' },
                  { id: 'd', label: 'Un prix soldé à −30 % qui passe de 40 € à 52 € est…', options: ['incohérent : une baisse doit faire baisser', 'juste : 40 × 1,3 = 52', 'juste si on arrondit'], correct: 0, correction: '× 1,3 est une hausse ; −30 % donne 28 €.' },
                ]}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Le bon outil dépend des nombres — et un résultat se vérifie toujours avant d’être annoncé.
                  </Feedback>
                )}
                requires={['coefficient-multiplicateur', 'pourcentage']}
                solved={methodDone}
                onAnswered={() => setMethodDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu as toute la boîte à outils. Le module suivant l’emmène
          en sciences.
        </KnowledgeSnapshot>
      )}
    />
  );
}
