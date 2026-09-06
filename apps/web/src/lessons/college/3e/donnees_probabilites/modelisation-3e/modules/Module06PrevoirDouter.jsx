import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import ValueTable from '../../../../../common/components/ValueTable';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { TROTTINETTE as T } from '../components/situationsData';
import { formatDec, parseDec, evaluate, capped, interpretResult, planeFor } from '../components/modelUtils';

/**
 * Module 6 — LABORATOIRE : « Prévoir, interpréter, douter ».
 *
 * Activity: tester le modèle de la trottinette au-delà de 46 min et voir le
 *   plafond ; interpréter un résultat non entier (dès la 7e séance) et une
 *   valeur impossible (durée négative) ; démasquer une extrapolation absurde
 *   (bactéries) ; vérifier des ordres de grandeur.
 * Mathematical objective: un modèle prévoit ; le résultat s'interprète dans
 *   le contexte (unité, entier, borne) ; un modèle a un domaine de validité
 *   et des limites qu'il faut chercher.
 * Student action: toucher des valeurs de t dans le testeur ; répondre.
 * Mathematical state: `tested` (Set) ; les colonnes « modèle » et « facturé »
 *   viennent de `evaluate` et de `capped` — la contradiction est produite par
 *   les mathématiques, pas écrite.
 * Visual consequence: à partir de 50 min, la colonne « facturé » décroche du
 *   modèle et les lignes passent en rose ; sur le graphique, la droite est
 *   coupée par le plafond (bande de validité).
 * Expected observation: « le modèle est valable jusqu'à ≈ 46 min ; au-delà,
 *   l'application plafonne ».
 */

const CAPPED = capped(T.model, T.cap);
const XS = [10, 30, 40, 50, 60];
const CAP_X = (T.cap - 1) / 0.15;   // ≈ 46,67 min
const CINEMA = { fixed: 24, per: 5, alt: 9 };   // 24 € + 5 €/séance vs 9 €/séance
const nCinema = CINEMA.fixed / (CINEMA.alt - CINEMA.per);   // 6

export default function Module06PrevoirDouter() {
  const [tested, setTested] = useState(() => new Set());
  const [capDone, setCapDone] = useState(false);
  const [domDone, setDomDone] = useState(false);
  const [extraNamed, setExtraNamed] = useState(false);
  const [cinemaDone, setCinemaDone] = useState(false);
  const [interpDone, setInterpDone] = useState(false);
  const [negDone, setNegDone] = useState(false);
  const [extraDone, setExtraDone] = useState(false);
  const [plausDone, setPlausDone] = useState(false);

  const geo = planeFor([{ x: 60, y: 10 }], { maxTicks: 6, width: 320, height: 200 });
  const seen50 = tested.has(50) || tested.has(60);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Prévoir, interpréter, douter"
      moduleSubtitle="Un modèle prévoit — mais pas partout : plafond, valeurs impossibles, extrapolation."
      estimatedTime="11 min"
      brief={{
        tag: '🧐 Mission 06',
        title: 'Où le modèle s’arrête-t-il ?',
        tone: 'rose',
        body: (
          <p>
            Le modèle de la trottinette prévoyait 8,50 € pour 50 min ; l’application a facturé 8 €. Teste
            d’autres durées et trouve à partir de quand le modèle décroche.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Teste le modèle',
          subtitle: 'Touche des durées : la colonne « facturé » est ce que l’application a réellement pris.',
          done: seen50 && capDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable
                columns={[
                  { id: 'm', label: 'modèle 0,15t + 1', fn: (t) => evaluate(T.model, t) },
                  { id: 'r', label: 'facturé', fn: (t) => evaluate(CAPPED, t) },
                ]}
                xs={XS} tested={tested} onTest={(x) => { setTested((s) => new Set(s).add(x)); kit.react(true); }} variable="t" unit="€" caption="Vert : le modèle et la facture concordent · rose : ils divergent" />
              {seen50 && (
                <TapQuestion
                  prompt="À 50 et 60 minutes, le modèle donne plus que la facture, qui reste à 8 €. Que se passe-t-il ?"
                  options={['L’application plafonne le prix à 8 € : le modèle n’est valable que jusqu’à ce plafond', 'Le modèle est faux depuis le début', 'L’application fait une erreur au-delà de 45 min']}
                  correct={0}
                  cols={1}
                  requires={['expression-du-modele', 'modeliser']}
                  explain={`8 € = 0,15 × t + 1 pour t ≈ ${formatDec(Math.round(CAP_X * 100) / 100)} min. Jusque-là le modèle est exact ; au-delà, une règle nouvelle (le plafond) prend le relais.`}
                  solved={capDone}
                  onAnswered={() => setCapDone(true)}
                />
              )}
              {capDone && (
                <KnowledgeBrick
                  id="domaine-de-validite"
                  variant="new"
                  lead="Le modèle a été exact, puis il a cessé de l’être à partir d’une certaine durée. Cette plage a un nom."
                />
              )}
              {!seen50 && <Feedback tone="info">Va voir au-delà de 40 minutes.</Feedback>}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le domaine de validité',
          subtitle: 'Sur le graphique, la droite s’arrête où le plafond commence.',
          done: domDone && extraNamed,
          content: (
            <div className="space-y-3">
            <TapQuestion
              prompt="Quel est le prix d’un trajet de 70 minutes ?"
              above={
                <CoordPlane range={geo.range} unit={geo.unit} unitY={geo.unitY} xStep={geo.xStep} yStep={geo.yStep}
                  curves={[{ id: 'real', points: [{ x: 0, y: 1 }, { x: CAP_X, y: 8 }, { x: 60, y: 8 }], tone: 'rose', label: 'facturé' }]}
                  functions={[{ id: 'm', a: 0.15, b: 1, tone: 'indigo', dashed: true, label: 'modèle' }]}
                  highlightIntervals={[{ from: 0, to: CAP_X, tone: 'emerald', label: 'modèle valable' }]}
                  axisLabels={{ x: 'min', y: '€' }} ariaLabel="Repère : prix selon la durée, modèle en pointillés, prix facturé plafonné à 8 €" caption={false} />
              }
              options={['8 € : au-delà de 46,7 min, c’est le plafond qui s’applique', '11,50 € : 0,15 × 70 + 1', 'Impossible à dire']}
              correct={0}
              cols={1}
              requires={['domaine-de-validite', 'representation-graphique']}
              explain="Le modèle 0,15t + 1 n’est exact que jusqu’à 46,7 min. Au-delà, il continue pourtant de donner un nombre : 11,50 € — juste en apparence, faux en réalité."
              solved={domDone}
              onAnswered={() => setDomDone(true)}
            />
            {domDone && (
              <KnowledgeBrick
                id="extrapolation"
                variant="new"
                lead="Le calcul 0,15 × 70 + 1 est parfaitement juste, et pourtant sa réponse est fausse. Ce geste-là porte un nom."
              >
                <TapQuestion
                  prompt="Quand un modèle donne un résultat hors de son domaine, que faut-il en penser ?"
                  options={['Le calcul peut être juste et le résultat faux : c’est le modèle qui ne s’applique plus', 'Le calcul est forcément faux', 'Le résultat est bon puisque le calcul est bon']}
                  correct={0}
                  cols={1}
                  requires={['extrapolation', 'domaine-de-validite']}
                  explain="C’est tout le piège de l’extrapolation : rien dans le calcul ne signale qu’on est sorti du domaine. Seule la situation le dit."
                  solved={extraNamed}
                  onAnswered={() => setExtraNamed(true)}
                />
              </KnowledgeBrick>
            )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Un résultat à interpréter',
          subtitle: 'Cinéma : carte à 24 € puis 5 € la séance, ou 9 € la séance sans carte.',
          done: cinemaDone && interpDone,
          content: (
            <div className="space-y-4">
              <NumericQuestion
                prompt="Pour quel nombre de séances n les deux formules coûtent-elles la même chose ? (24 + 5n = 9n)"
                expected={nCinema}
                parse={parseDec}
                requires={['expression-du-modele', 'equation-premier-degre']}
                display={formatDec(nCinema)}
                explain="24 + 5n = 9n donne 4n = 24, n = 6. À 6 séances, 54 € des deux côtés."
                explainFor={(n) => (n === 24 / 9 || Math.abs(n - 2.67) < 0.01 ? '24 ÷ 9 compare la carte à une seule séance. Il faut égaler les deux dépenses : 24 + 5n = 9n.' : null)}
                solved={cinemaDone}
                onAnswered={() => setCinemaDone(true)}
              />
              {cinemaDone && (
                <TapQuestion
                  prompt={`Avec une carte à 25 €, l’égalité donne n = ${formatDec(25 / 4)}. Que répondre à « à partir de combien de séances la carte est-elle rentable ? »`}
                  options={[`Dès la ${interpretResult(25 / 4, { integer: true, min: 0 }).value}e séance : n est un nombre entier de séances`, '6,25 séances', 'Le problème est impossible', 'Dès la 6e séance']}
                  correct={0}
                  cols={1}
                  requires={['cycle-modelisation']}
                  explain="Le modèle donne 6,25, mais on ne va pas au cinéma 6,25 fois. À 6 séances la carte coûte encore plus (55 € contre 54) ; à 7, elle gagne (60 contre 63)."
                  solved={interpDone}
                  onAnswered={() => setInterpDone(true)}
                />
              )}
              {interpDone && (
                <KnowledgeBrick
                  id="interpreter-resultat"
                  variant="new"
                  lead="Tu viens de transformer « 6,25 » en une phrase que le comité peut suivre."
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Impossible, ou absurde',
          subtitle: 'Un modèle peut produire des nombres que la situation refuse.',
          done: negDone && extraDone && plausDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Pour le réservoir (volume = 60 − 5t), le modèle donne −15 L à t = 15 min. Qu’en penser ?"
                options={['Une valeur négative est impossible : le modèle n’est valable que jusqu’à t = 12, quand le réservoir est vide', 'Le réservoir contient −15 L', 'Le modèle est faux'].map((s) => s)}
                correct={0}
                cols={1}
                requires={['domaine-de-validite', 'interpreter-resultat']}
                explain={`${interpretResult(-15, { min: 0, unit: ' L' }).reason}. Le modèle est exact sur [0 ; 12] ; au-delà, le réservoir reste vide : la situation impose ses bornes.`}
                solved={negDone}
                onAnswered={() => setNegDone(true)}
              />
              {negDone && (
                <TapQuestion
                  prompt="Une bactérie double toutes les heures : 1 000 bactéries à midi, 2 000 à 13 h. Un élève prévoit 1 000 × 2^72 ≈ 4,7 × 10^24 bactéries dans trois jours — plus que d’atomes dans le corps humain. Que lui dis-tu ?"
                  options={['Le modèle « ×2 par heure » cesse d’être valable : la nourriture et la place manquent bien avant', 'Le calcul est faux', 'C’est exact, les bactéries sont très nombreuses']}
                  correct={0}
                  cols={1}
                  requires={['extrapolation', 'domaine-de-validite']}
                  explain="Le calcul est juste ; c’est l’extrapolation qui ne l’est pas. Un modèle décrit une situation dans un domaine ; loin de ses données, il faut douter — l’ordre de grandeur crie l’absurdité."
                  solved={extraDone}
                  onAnswered={() => setExtraDone(true)}
                />
              )}
              {extraDone && (
                <BatchChoiceQuestion
                  requires={['domaine-de-validite', 'interpreter-resultat', 'expression-du-modele']}
                  intro={<p className="text-sm font-semibold text-slate-700">Cohérent ou à revoir ?</p>}
                  rows={[
                    { id: 'a', label: 'Trottinette : 20 min → 4 € (modèle 0,15t + 1)', options: ['cohérent', 'à revoir'], correct: 0, correction: '0,15 × 20 + 1 = 4.' },
                    { id: 'b', label: 'Trottinette : 120 min → 19 €', options: ['à revoir', 'cohérent'], correct: 0, correction: 'Hors domaine : plafond 8 € par heure.' },
                    { id: 'c', label: 'Réservoir : 30 L à t = 6 min', options: ['cohérent', 'à revoir'], correct: 0, correction: '60 − 30 = 30.' },
                    { id: 'd', label: 'Cinéma : la carte devient rentable à 6,25 séances', options: ['à revoir', 'cohérent'], correct: 0, correction: 'On répond « dès la 7e séance ».' },
                  ]}
                  feedback={({ allRight, nCorrect, total }) => (
                    <Feedback tone={allRight ? 'ok' : 'ko'}>
                      {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Vérifier un résultat, c’est trois questions : le calcul est-il juste ? le
                      modèle est-il valable ici ? le nombre a-t-il un sens dans la situation ?
                    </Feedback>
                  )}
                  solved={plausDone}
                  onAnswered={() => setPlausDone(true)}
                />
              )}
              {plausDone && (
                <KnowledgeBrick
                  id="mem-douter"
                  variant="new"
                  compact
                  lead="Trois vérifications, à chaque fois. C’est ce qui sépare un résultat d’une réponse."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          Douter d’un modèle n’est pas le trahir : c’est le comprendre. Dernier chantier : le grand projet, sur une situation neuve.
        </KnowledgeSnapshot>
      }
    />
  );
}
