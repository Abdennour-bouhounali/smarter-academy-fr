import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import InfoSorter from '../../../../../common/components/InfoSorter';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import QuantityPicker from '../components/QuantityPicker';
import ModelTester from '../components/ModelTester';
import ModelViews from '../components/ModelViews';
import { TROTTINETTE as T } from '../components/situationsData';
import { formatDec, parseDec, evaluate, agreesWithAll, capped } from '../components/modelUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Le laboratoire de modélisation » (signature).
 *
 * Activity: à partir de l'écran d'une application de trottinettes, trier les
 *   informations, choisir les deux grandeurs, tester quatre modèles sur trois
 *   tickets réels, dérouler tableau / graphique / expression, prévoir le prix
 *   d'un trajet de 35 min, puis confronter la prévision au prix payé.
 * Mathematical objective: faire VIVRE le cycle de modélisation avant de le
 *   décrire — informations utiles → grandeurs → relation testée sur TOUTES les
 *   données → représentations → prévision → retour au réel — et faire
 *   découvrir qu'un modèle est choisi par les données (la part fixe de 1 €
 *   exclut le modèle proportionnel).
 * Student action: trier des cartes, toucher des grandeurs, toucher des
 *   modèles candidats, répondre, comparer.
 * Controlled variable: le modèle candidat ; puis la durée à prévoir.
 * Mathematical state: la situation (situationsData) ; `selected`, `chosen`,
 *   les réponses. Les verdicts, tableaux, points et prévisions viennent tous
 *   de `evaluate` — jamais écrits à la main.
 * Visual consequence: les cartes se rangent ; le testeur affiche ✓ / ✗ ticket
 *   par ticket ; les trois vues du modèle apparaissent une à une ; la
 *   prévision devient un point rouge sur la droite.
 * Expected observation: « un seul modèle est d'accord avec les trois tickets ;
 *   il donne 6,25 € pour 35 min — et l'appli a facturé 6,25 € ».
 * Misconception targeted: prendre toutes les données ; supposer
 *   proportionnel malgré le déblocage ; valider sur un ticket.
 * Formalization: aucune définition ; le mot « modèle » est employé comme
 *   « la règle qui raconte les tickets » ; le cycle est nommé au module 5.
 * Scaffolding: tri assisté (InfoSorter formatif) → grandeurs (2 sur 4) →
 *   candidats fermés → vues révélées → prévision hors données → confrontation.
 * Transfer: la question finale (50 min facturées 8 €) ouvre le module 6.
 */

const XS = [0, 5, 10, 20, 30];

export default function Module01LaboModelisation() {
  const [sortDone, setSortDone] = useState(false);
  const [quantities, setQuantities] = useState(() => new Set());
  const [qDone, setQDone] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [tested, setTested] = useState(() => new Set());
  const [modelDone, setModelDone] = useState(false);
  const [viewsDone, setViewsDone] = useState(false);
  const [predDone, setPredDone] = useState(false);
  const [realDone, setRealDone] = useState(false);
  const [capDone, setCapDone] = useState(false);

  const chosenModel = T.candidates.find((c) => c.id === candidate)?.model ?? null;
  const chosenOk = chosenModel ? agreesWithAll(chosenModel, T.tickets) : false;
  const toggleQ = (id) => setQuantities((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const qRight = quantities.size === 2 && T.quantities.filter((q) => q.relevant).every((q) => quantities.has(q.id));
  const predicted = evaluate(T.model, T.predictX);
  const naive50 = evaluate(T.model, 50);
  const capped50 = evaluate(capped(T.model, T.cap), 50);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le laboratoire de modélisation"
      moduleSubtitle="Trie les infos, choisis les grandeurs, teste quatre modèles sur trois tickets — puis prévois."
      estimatedTime="12 min"
      brief={{
        tag: '🛴 Mission 01',
        title: 'Combien va coûter le prochain trajet ?',
        tone: 'indigo',
        body: (
          <p>
            L’application de trottinettes affiche plein d’informations, et tu as gardé trois tickets. Demain,
            le trajet durera 35 minutes. Peux-tu prévoir le prix <em>avant</em> de rouler ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trie les informations',
          subtitle: 'Touche une carte, puis le bac où elle va. Utile pour le prix d’un trajet, ou pas ?',
          done: sortDone,
          content: (kit) => (
            <div className="space-y-3">
              <InfoSorter items={T.infos} solved={sortDone} onSolved={() => setSortDone(true)} formative onCheck={kit.react} />
              {sortDone && (
                <Feedback tone="ok">
                  Trois informations comptent pour le prix : le déblocage (1 €), le tarif par minute (0,15 €) et la durée du
                  trajet. Couleur, autonomie, heure et poids sont du décor — une situation réelle en est toujours pleine.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Choisis les deux grandeurs',
          subtitle: 'Lesquelles varient ensemble dans la question « combien coûte le trajet ? »',
          done: qDone,
          content: (kit) => (
            <div className="space-y-3">
              <QuantityPicker quantities={T.quantities} selected={quantities} onToggle={toggleQ} revealed={qDone} />
              {!qDone && quantities.size === 2 && (
                <button type="button" onClick={() => { kit.react(qRight); setQDone(true); }}
                  className="w-full min-h-[48px] rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ touchAction: 'manipulation' }}>Valider mes deux grandeurs</button>
              )}
              {qDone && (
                <Feedback tone={qRight ? 'ok' : 'ko'}>
                  {qRight ? 'Exact.' : 'Pas tout à fait : '}Les deux grandeurs sont la <strong>durée</strong> (ce qu’on choisit — la variable) et le{' '}
                  <strong>prix</strong> (ce qui en dépend). Poids et autonomie ne varient pas d’un trajet à l’autre : ils n’entrent pas dans la relation.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Teste les modèles sur les tickets',
          subtitle: 'Quatre règles possibles. Une seule est d’accord avec les trois tickets — laquelle ?',
          done: modelDone,
          content: (kit) => (
            <div className="space-y-3">
              <ModelTester candidates={T.candidates} points={T.tickets} selected={candidate}
                onSelect={(id) => { setCandidate(id); setTested((s) => new Set(s).add(id)); kit.react(agreesWithAll(T.candidates.find((c) => c.id === id).model, T.tickets)); }}
                xLabel="durée" xUnit="min" yLabel="prix" yUnit="€" disabled={modelDone} />
              {chosenOk && !modelDone && (
                <button type="button" onClick={() => setModelDone(true)}
                  className="w-full min-h-[48px] rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                  style={{ touchAction: 'manipulation' }}>Je garde ce modèle</button>
              )}
              {candidate && !chosenOk && (
                <Feedback tone="info">
                  {candidate === 'prop' ? 'Sans le déblocage, chaque prix manque 1 € : 5 min ne peut pas coûter 0,75 €.' : candidate === 'x115'
                    ? '1,15 € par minute ferait payer 5,75 € pour 5 min — les tickets disent 1,75 €.' : 'Ajouter la durée au déblocage compte 1 € par minute : bien trop cher.'}{' '}
                  Essaie un autre modèle. ({tested.size} testé{tested.size > 1 ? 's' : ''} sur 4)
                </Feedback>
              )}
              {modelDone && (
                <Feedback tone="ok">
                  <strong>prix = 0,15 × durée + 1</strong> est d’accord avec les trois tickets. Le 1 € de déblocage se paie même pour 0 minute : le
                  prix n’est pas proportionnel à la durée, et un modèle qui tombe juste sur un ticket mais pas sur les autres n’est pas le modèle.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Trois vues du même modèle',
          subtitle: 'Tableau, graphique, expression : lesquelles racontent la même chose ?',
          done: viewsDone,
          content: (
            <TapQuestion
              prompt="Tableau, droite et expression : que remarques-tu ?"
              above={<ModelViews model={T.model} xs={XS} points={T.tickets} variable="t" xLabel="durée" yLabel="prix" xUnit="min" yUnit="€" />}
              options={['Les trois disent la même chose : les tickets sont sur la droite, et le tableau donne les mêmes nombres', 'Le tableau et la droite se contredisent pour 0 minute', 'Seule l’expression est un modèle, le reste est décoratif']}
              correct={0}
              cols={1}
              explain="Un modèle est UNE règle ; tableau, graphique et expression en sont trois écritures. La droite ne passe pas par l’origine (0 min → 1 €), le tableau le dit aussi, l’expression l’écrit : + 1."
              solved={viewsDone}
              onAnswered={() => setViewsDone(true)}
            />
          ),
        },
        {
          num: 5,
          title: 'Prévois : 35 minutes',
          subtitle: 'Aucun ticket ne dure 35 min. Le modèle, lui, sait répondre.',
          done: predDone,
          content: (
            <NumericQuestion
              prompt="D’après le modèle, combien coûtera un trajet de 35 minutes ?"
              suffix="€"
              expected={predicted}
              parse={parseDec}
              display={`${formatDec(predicted)} €`}
              above={(revealed) => revealed && <ModelViews model={T.model} xs={XS} points={T.tickets} extraPoint={{ x: T.predictX, y: predicted, label: '35 min' }} variable="t" xLabel="durée" yLabel="prix" xUnit="min" yUnit="€" show={{ graph: true }} />}
              explain={`0,15 × 35 + 1 = ${formatDec(predicted)} €. Le modèle prévoit une durée jamais essayée — c'est pour ça qu'on modélise.`}
              explainFor={(n) => {
                if (n === 5.25) return '0,15 × 35 = 5,25 oublie le déblocage : + 1 € → 6,25 €.';
                if (n === 36) return '35 + 1 ajoute la durée au déblocage. Le tarif est 0,15 € PAR minute : 0,15 × 35 + 1 = 6,25 €.';
                return null;
              }}
              solved={predDone}
              onAnswered={() => setPredDone(true)}
            />
          ),
        },
        {
          num: 6,
          title: 'Retour au réel',
          subtitle: 'Le lendemain, l’application facture 6,25 € pour 35 min. Et 8 € pour un trajet de 50 min.',
          done: realDone && capDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={`Prévision : ${formatDec(predicted)} €. Facturé : ${formatDec(T.realPaid)} €. Que conclure ?`}
                options={['Le modèle est confirmé : il a prévu le prix réel', 'C’est un hasard : un modèle ne peut pas prévoir', 'Le modèle est faux, puisqu’il n’a pas de ticket de 35 min']}
                correct={0}
                cols={1}
                explain="Une prévision juste sur un cas nouveau est la meilleure confirmation d’un modèle. Modéliser, c’est traduire une situation en mathématiques pour pouvoir raisonner dessus — et prévoir."
                solved={realDone}
                onAnswered={() => setRealDone(true)}
              />
              {realDone && (
                <TapQuestion
                  prompt={`Pour 50 min, le modèle donne 0,15 × 50 + 1 = ${formatDec(naive50)} €. L’application a facturé ${formatDec(capped50)} €. Que se passe-t-il ?`}
                  options={['Le modèle a une limite qu’on ne connaît pas encore (un plafond ?) : il faut l’étudier', 'L’application s’est trompée', 'Les tickets étaient faux', 'Le modèle est proportionnel finalement']}
                  correct={0}
                  cols={1}
                  explain="Un modèle n’est valable que dans un certain domaine. Ici l’application plafonne à 8 € par heure — une information qui n’était pas sur l’écran. Douter d’un modèle et chercher ses limites, c’est la fin du module 6."
                  solved={capDone}
                  onAnswered={() => setCapDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Tu viens de <strong>modéliser</strong> : trier, choisir les grandeurs, trouver la règle d’accord avec toutes les données,
          l’écrire de trois façons, prévoir — et revenir au réel. Les modules suivants reprennent chaque étape, jusqu’aux
          limites du modèle.
        </Feedback>
      }
    />
  );
}
