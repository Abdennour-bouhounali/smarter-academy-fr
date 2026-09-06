import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioTable from '../components/RatioTable';
import { SITUATIONS, tableFor } from '../components/situationsData';
import { formatDec, parseDec, applyRule, rowsCoefficient, distance } from '../components/propUtils';

/**
 * Module 2 — DÉCOUVERTE : « Le nombre caché ».
 *
 * Activity: révéler colonne par colonne le rapport y ÷ x d'un tableau ; le
 *   nommer ; l'utiliser ; découvrir un tableau où les rapports ne sont PAS
 *   égaux ; trier des tableaux.
 * Mathematical objective: le COEFFICIENT DE PROPORTIONNALITÉ est le rapport
 *   y ÷ x, le même dans toutes les colonnes ; il a un sens concret (litres
 *   par km, euros par kg) ; des rapports différents signent une situation non
 *   proportionnelle (part fixe).
 * Student action: toucher les « ? » de la ligne des rapports ; répondre.
 * Controlled variable: la colonne dont le rapport est révélé.
 * Mathematical state: `revealed` (Set d'index) ; les rapports sont calculés
 *   par RatioTable à partir des lignes, elles-mêmes issues de la règle.
 * Visual consequence: la ligne des rapports se remplit ; identique partout,
 *   ou pas.
 * Expected observation: « 0,065 partout » puis « 12, 7, 4 : ce n'est pas le
 *   même nombre ».
 * Misconception targeted: « ça augmente ensemble, donc c'est proportionnel ».
 */

const ESS = SITUATIONS.essence;
const ABO = SITUATIONS.abonnement;
const essRows = tableFor(ESS);
const aboRows = tableFor(ABO);
const K = rowsCoefficient(essRows);

export default function Module02NombreCache() {
  const [rev1, setRev1] = useState(() => new Set());
  const [meaningDone, setMeaningDone] = useState(false);
  const [useDone, setUseDone] = useState(false);
  const [rev3, setRev3] = useState(() => new Set());
  const [whyDone, setWhyDone] = useState(false);
  const [sortDone, setSortDone] = useState(false);

  const done1 = rev1.size === essRows.length;
  const done3 = rev3.size === aboRows.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le nombre caché"
      moduleSubtitle="Touche un couple, lis son rapport : le coefficient apparaît — ou pas."
      estimatedTime="9 min"
      brief={{
        tag: '⛽ Mission 02',
        title: 'Combien d’essence pour aller à la fête ?',
        tone: 'sky',
        body: (
          <p>
            Le carnet de la voiture note : 100 km → 6,5 L, 250 km → 16,25 L, 40 km → 2,6 L. Quel nombre se
            cache derrière ces trois couples ? Révèle les rapports.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Un couple, un rapport',
          subtitle: 'Touche chaque « ? » pour révéler essence ÷ distance.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <RatioTable xLabel={ESS.xLabel} yLabel={ESS.yLabel} xUnit={ESS.xUnit} yUnit={ESS.yUnit} columns={essRows} ratios={rev1}
                onColumnTap={(i) => { setRev1((s) => new Set(s).add(i)); kit.react(true); }} caption="Le carnet de la voiture" />
              {done1 ? (
                <KnowledgeBrick
                  id="coefficient-proportionnalite"
                  establishes={['coefficient-lineaire']}
                  variant="new"
                  lead={<>Le même nombre dans les trois colonnes : <strong>{formatDec(K)}</strong>. Il ne dépend pas de la colonne, et il porte un nom.</>}
                />
              ) : (
                <Feedback tone="info">
                  Encore {essRows.length - rev1.size} rapport{essRows.length - rev1.size > 1 ? 's' : ''} à révéler.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Ce que dit le coefficient',
          subtitle: 'Un nombre qui a un sens.',
          done: meaningDone && useDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={`Que signifie le coefficient ${formatDec(K)} ?`}
                options={['La voiture consomme 0,065 L pour chaque kilomètre', 'La voiture consomme 6,5 L en tout', 'On peut faire 0,065 km avec un litre', 'Le plein coûte 0,065 €']}
                correct={0}
                cols={1}
                explain="essence ÷ distance = litres PAR kilomètre : 0,065 L pour 1 km (soit 6,5 L pour 100 km). Le coefficient est la valeur pour UNE unité de la première grandeur."
                requires={['situation-proportionnelle', 'quotient']}
                solved={meaningDone}
                onAnswered={() => setMeaningDone(true)}
              />
              {meaningDone && (
                <NumericQuestion
                  prompt="La fête est à 300 km. Combien de litres faut-il prévoir ?"
                  suffix="L"
                  expected={applyRule(ESS.rule, 300)}
                  parse={parseDec}
                  display={`${formatDec(applyRule(ESS.rule, 300))} L`}
                  explain={`300 × ${formatDec(K)} = ${formatDec(applyRule(ESS.rule, 300))} L. Une fois le coefficient trouvé, n’importe quelle distance se traite d’une multiplication.`}
                  explainFor={(n) => {
                    if (n === 6.5 * 3) return 'Juste ! 3 × 6,5 = 19,5 : tu as multiplié la colonne 100 km par 3 — c’est un autre chemin vers le même nombre.';
                    if (n === 300 / 6.5 || Math.abs(n - 46.15) < 0.1) return 'Tu as divisé 300 par 6,5. Le coefficient est litres ÷ km = 0,065, et on MULTIPLIE la distance : 300 × 0,065 = 19,5 L.';
                    if (n === 6.5) return '6,5 L, c’est pour 100 km. Pour 300 km : 300 × 0,065 = 19,5 L.';
                    return null;
                  }}
                  requires={['coefficient-proportionnalite']}
                  solved={useDone}
                  onAnswered={() => setUseDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'L’abonnement vidéo',
          subtitle: '10 € par mois, plus 2 € par film. Révèle les rapports.',
          done: done3 && whyDone,
          content: (kit) => (
            <div className="space-y-3">
              <RatioTable xLabel={ABO.xLabel} yLabel={ABO.yLabel} yUnit={ABO.yUnit} columns={aboRows} ratios={rev3}
                onColumnTap={(i) => { setRev3((s) => new Set(s).add(i)); kit.react(true); }} caption="L’abonnement vidéo" />
              {done3 && (
                <TapQuestion
                  prompt="Les rapports valent 12, 7 et 4. Que peut-on en conclure ?"
                  options={['Le prix n’est pas proportionnel au nombre de films : il y a une part fixe de 10 €', 'Le prix est proportionnel, avec un coefficient qui varie', 'Il faut plus de colonnes pour décider', 'Le prix est proportionnel, coefficient 2']}
                  correct={0}
                  cols={1}
                  explain="Pas de nombre commun : pas de proportionnalité. Les 10 € d’abonnement se paient même pour 0 film — cette part fixe casse le rapport. (2 € par film est bien un « prix unitaire », mais le prix TOTAL n’est pas proportionnel au nombre de films.)"
                  explainWrong="Un coefficient qui varie n’est pas un coefficient. Quand les rapports diffèrent, la situation n’est pas proportionnelle — ici à cause des 10 € fixes."
                  requires={['coefficient-proportionnalite']}
                  solved={whyDone}
                  onAnswered={() => setWhyDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Reconnaître',
          subtitle: 'Proportionnel ou non ? Décide avec les rapports.',
          done: sortDone,
          content: (
            <BatchChoiceQuestion
              rows={[
                { id: 'a', label: <span>Tomates : 3 kg → 7,50 € ; 5 kg → 12,50 €</span>, options: ['Proportionnel', 'Non'], correct: 0, correction: '7,5 ÷ 3 = 2,5 et 12,5 ÷ 5 = 2,5.' },
                { id: 'b', label: <span>Âge : Lina a 10 ans ; dans 5 ans, 15 ans</span>, options: ['Proportionnel', 'Non'], correct: 1, correction: '15 ÷ 5 = 3 mais 10 ÷ 0 n’existe pas : « 5 ans de plus » n’est pas « fois ».' },
                { id: 'c', label: <span>Train : 1 h → 90 km ; 3,5 h → 315 km</span>, options: ['Proportionnel', 'Non'], correct: 0, correction: '90 ÷ 1 = 90 et 315 ÷ 3,5 = 90.' },
                { id: 'd', label: <span>Taille : 2 ans → 85 cm ; 10 ans → 138 cm</span>, options: ['Proportionnel', 'Non'], correct: 1, correction: '85 ÷ 2 = 42,5 mais 138 ÷ 10 = 13,8.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} « Ça augmente ensemble » ne suffit jamais : la taille et l’âge
                  augmentent ensemble sans être proportionnels. Le test, c’est le RAPPORT : le même nombre dans chaque colonne.
                </Feedback>
              )}
              requires={['coefficient-proportionnalite']}
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Le coefficient est identifié. Quand une case est vide, par
          quel chemin la remplir ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
