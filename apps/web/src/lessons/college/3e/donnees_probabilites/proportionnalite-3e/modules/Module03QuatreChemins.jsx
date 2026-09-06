import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioTable from '../components/RatioTable';
import StrategyPicker from '../components/StrategyPicker';
import { SITUATIONS, tableFor } from '../components/situationsData';
import { formatDec, parseDec, applyRule, strategiesFor, fourthProportional } from '../components/propUtils';

/**
 * Module 3 — MANIPULATION : « Quatre chemins vers la case vide ».
 *
 * Activity: pour une case vide, prédire sa valeur, puis dérouler deux chemins
 *   au moins (unité, facteur, coefficient, produit en croix) et constater
 *   qu'ils concordent ; répéter avec un cas où l'unité gagne, un cas où le
 *   facteur gagne ; compléter un tableau ; refuser le produit en croix sur
 *   une situation non proportionnelle.
 * Mathematical objective: compléter un tableau de proportionnalité par
 *   passage à l'unité, facteur entre colonnes (coefficient multiplicateur
 *   horizontal), coefficient, produit en croix — et choisir le plus court.
 * Student action: répondre, puis toucher des chemins.
 * Controlled variable: le chemin choisi.
 * Mathematical state: `chosen` (Set d'ids) par étape ; chaque chaîne est
 *   calculée par `strategiesFor` (propUtils) — jamais écrite à la main ; le
 *   garde-fou `strategiesAgree` est testé.
 * Visual consequence: la chaîne de calcul du chemin se déroule ; les
 *   résultats identiques s'alignent.
 * Expected observation: « quatre chemins, une seule case ; le plus court
 *   dépend des nombres ».
 * Misconception targeted: produit en croix appliqué sans proportionnalité ;
 *   facteur appliqué à une seule ligne.
 */

const TOM = SITUATIONS.tomates;
const CAH = SITUATIONS.cahiers;
const ESS = SITUATIONS.essence;
const ABO = SITUATIONS.abonnement;

export default function Module03QuatreChemins() {
  const [t1, setT1] = useState(false);
  const [c1, setC1] = useState(() => new Set());
  const [t2, setT2] = useState(false);
  const [c2, setC2] = useState(() => new Set());
  const [t3, setT3] = useState(false);
  const [c3, setC3] = useState(() => new Set());
  const [tableDone, setTableDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);

  const s1 = strategiesFor(3, applyRule(TOM.rule, 3), 5, { xUnit: 'kg', yUnit: '€' });
  const s2 = strategiesFor(12, applyRule(CAH.rule, 12), 7, { xUnit: 'cahiers', yUnit: '€' });
  const s3 = strategiesFor(4, 22, 12, { xUnit: 'kg', yUnit: '€' });

  const picker = (strategies, chosen, setChosen, kit, unit) => (
    <StrategyPicker strategies={strategies} chosen={chosen} yUnit={unit} onChoose={(id) => { setChosen((s) => new Set(s).add(id)); kit.react(true); }} />
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Quatre chemins vers la case vide"
      moduleSubtitle="Unité, facteur, coefficient, produit en croix : tous mènent à la même case."
      estimatedTime="11 min"
      brief={{
        tag: '🍅 Mission 03',
        title: 'Les courses de la fête',
        tone: 'emerald',
        body: (
          <p>
            Au marché, 3 kg de tomates coûtent 7,50 €. Il en faut 5 kg. Combien ? Réponds, puis regarde
            par combien de chemins on peut y arriver.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La case vide',
          subtitle: 'Prédis le prix, puis ouvre au moins deux chemins.',
          done: t1 && c1.size >= 2,
          content: (kit) => (
            <div className="space-y-3">
              <RatioTable xLabel="masse" xUnit="kg" yLabel="prix" yUnit="€" columns={[{ x: 3, y: applyRule(TOM.rule, 3) }, { x: 5, y: t1 ? applyRule(TOM.rule, 5) : null }]} caption="Les tomates" />
              {t1 && c1.size >= 2 && (
                <KnowledgeBrick
                  id="quatre-chemins"
                  variant="new"
                  lead="Tu viens d’ouvrir plusieurs chemins vers la même case. Les voici tous les quatre."
                />
              )}
              <NumericQuestion
                prompt="Combien coûtent 5 kg de tomates ?"
                suffix="€"
                expected={applyRule(TOM.rule, 5)}
                parse={parseDec}
                display={`${formatDec(applyRule(TOM.rule, 5))} €`}
                explain="12,50 €. Plusieurs chemins y mènent — ouvre-les ci-dessous et compare."
                explainFor={(n) => {
                  if (n === 9.5) return 'Tu as ajouté 2 € pour 2 kg de plus : mais 1 kg coûte 2,50 €, donc 2 kg de plus, c’est 5 € de plus : 12,50 €.';
                  if (n === 37.5) return '7,5 × 5 = 37,5 oublie que 7,50 € est le prix de 3 kg. Prix d’1 kg : 7,5 ÷ 3 = 2,5 €, puis × 5 = 12,50 €.';
                  return null;
                }}
                requires={['coefficient-proportionnalite']}
                solved={t1}
                onAnswered={() => setT1(true)}
              />
              {t1 && picker(s1, c1, setC1, kit, '€')}
              {c1.size >= 2 && (
                <Feedback tone="ok">
                  {c1.size} chemins, un seul résultat : <strong>{formatDec(s1[0].result)} €</strong>. Ici, de 3 à 5 il n’y a pas de facteur simple : l’unité, le
                  coefficient ou le produit en croix font le travail.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Quand l’unité gagne',
          subtitle: '12 cahiers coûtent 30 €. Et 7 cahiers ?',
          done: t2 && c2.size >= 1,
          content: (kit) => (
            <div className="space-y-3">
              <RatioTable xLabel="cahiers" yLabel="prix" yUnit="€" columns={[{ x: 12, y: 30 }, { x: 7, y: t2 ? applyRule(CAH.rule, 7) : null }]} caption="Les cahiers" />
              <NumericQuestion
                prompt="Combien coûtent 7 cahiers ?"
                suffix="€"
                expected={applyRule(CAH.rule, 7)}
                parse={parseDec}
                display={`${formatDec(applyRule(CAH.rule, 7))} €`}
                explain="Un cahier : 30 ÷ 12 = 2,50 €. Sept cahiers : 2,5 × 7 = 17,50 €. Passer par l’unité est ici le chemin naturel : 12 se divise bien, 7 ne se déduit pas de 12 par un facteur simple."
                explainFor={(n) => {
                  if (n === 210) return '30 × 7 = 210 confond le prix du lot avec celui d’un cahier. Un cahier : 30 ÷ 12 = 2,50 € ; sept : 17,50 €.';
                  if (n === 25) return '30 − 5 = 25 retire 1 € par cahier manquant : mais un cahier vaut 2,50 €, pas 1 €. Sept cahiers : 17,50 €.';
                  return null;
                }}
                requires={['quatre-chemins']}
                solved={t2}
                onAnswered={() => setT2(true)}
              />
              {t2 && picker(s2, c2, setC2, kit, '€')}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Quand le facteur gagne',
          subtitle: '4 kg de pommes coûtent 22 €. Et 12 kg ?',
          done: t3 && c3.size >= 1,
          content: (kit) => (
            <div className="space-y-3">
              <RatioTable xLabel="masse" xUnit="kg" yLabel="prix" yUnit="€" columns={[{ x: 4, y: 22 }, { x: 12, y: t3 ? 66 : null }]} horizontal={{ from: 0, to: 1, factor: 3 }} caption="Les pommes" />
              <NumericQuestion
                prompt="Combien coûtent 12 kg de pommes ?"
                suffix="€"
                expected={66}
                parse={parseDec}
                display="66 €"
                explain="De 4 kg à 12 kg, on multiplie par 3 : le prix aussi, 22 × 3 = 66 €. Ce facteur horizontal — le coefficient multiplicateur entre colonnes — s’applique aux DEUX lignes."
                explainFor={(n) => {
                  if (n === 30) return '22 + 8 ajoute les kilos au prix ! De 4 à 12 on multiplie par 3, donc 22 × 3 = 66 €.';
                  if (n === 88) return '22 × 4 = 88 prend le facteur 4 (la masse de départ) au lieu du facteur 12 ÷ 4 = 3. Prix : 66 €.';
                  return null;
                }}
                requires={['quatre-chemins']}
                solved={t3}
                onAnswered={() => setT3(true)}
              />
              {t3 && picker(s3, c3, setC3, kit, '€')}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Compléter le tableau',
          subtitle: 'La voiture : 100 km → 6,5 L. Trois cases à trouver.',
          done: tableDone,
          content: (
            <BatchChoiceQuestion
              intro={<RatioTable xLabel="distance" xUnit="km" yLabel="essence" yUnit="L" columns={[{ x: 100, y: 6.5 }, { x: 50, y: null }, { x: 300, y: null }, { x: 200, y: null }]} caption="Le carnet de la voiture" />}
              rows={[
                { id: 'a', label: '50 km →', options: ['3,25 L', '6 L', '13 L'], correct: 0, correction: '100 ÷ 2 = 50, donc 6,5 ÷ 2 = 3,25.' },
                { id: 'b', label: '300 km →', options: ['19,5 L', '9,5 L', '206,5 L'], correct: 0, correction: '× 3 : 6,5 × 3 = 19,5.' },
                { id: 'c', label: '13 L permettent…', options: ['200 km', '106,5 km', '1 300 km'], correct: 0, correction: '13 = 6,5 × 2, donc 100 × 2 = 200 km.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Trois sur trois.' : `${nCorrect} sur ${total}.`} ÷ 2, × 3, et le chemin inverse (de l’essence vers les km) : un tableau se complète
                  dans les deux sens, toujours avec le même facteur sur les deux lignes — ou avec le coefficient 0,065.
                </Feedback>
              )}
              requires={['quatre-chemins', 'coefficient-proportionnalite']}
              solved={tableDone}
              onAnswered={() => setTableDone(true)}
            />
          ),
        },
        {
          num: 5,
          title: 'Le piège du produit en croix',
          subtitle: 'Un chemin puissant — à condition d’avoir le droit de l’emprunter.',
          done: trapDone,
          content: (
            <TapQuestion
              prompt={`L’abonnement vidéo : 1 film → 12 €, 5 films → 20 €. Un élève calcule le prix de 10 films par produit en croix : 12 × 10 ÷ 1 = 120 €. Qu’en penses-tu ?`}
              above={<RatioTable xLabel="films" yLabel="prix" yUnit="€" columns={tableFor(ABO)} ratios="all" caption="L’abonnement vidéo" />}
              options={['Faux : le prix n’est pas proportionnel au nombre de films, le produit en croix n’a pas de sens ici', `Juste : ${formatDec(fourthProportional(1, 12, 10))} €`, 'Faux : il fallait faire 20 × 10 ÷ 5 = 40 €', 'Juste, mais il faut arrondir']}
              correct={0}
              cols={1}
              explain="Le produit en croix suppose des rapports égaux. Ici 12 ÷ 1 ≠ 20 ÷ 5 : la situation n’est pas proportionnelle (10 € fixes), donc aucune des « quatre méthodes » ne s’applique. Le vrai prix : 10 + 2 × 10 = 30 €. Avant de calculer, on vérifie qu’on a le droit."
              requires={['quatre-chemins', 'situation-proportionnelle']}
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Quatre chemins qui concordent — dans une situation
          proportionnelle. Et si on agrandit une figure ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
