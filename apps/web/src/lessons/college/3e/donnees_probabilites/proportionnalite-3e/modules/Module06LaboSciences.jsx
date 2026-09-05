import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioTable from '../components/RatioTable';
import { SITUATIONS, tableFor } from '../components/situationsData';
import { formatDec, parseDec, distance, duration, mass, cmToKm, realDistanceCm, magnitudeOk } from '../components/propUtils';

/**
 * Module 6 — LABORATOIRE : « Le labo des sciences ».
 *
 * Activity: lire une vitesse sur un tableau ET sur un graphique ; calculer
 *   distance et durée ; comparer deux droites (fer, aluminium) ; convertir
 *   une longueur sur une carte ; démasquer des ordres de grandeur absurdes.
 * Mathematical objective: mobiliser la proportionnalité dans des situations
 *   scientifiques (vitesse, masse volumique, échelle) ; passer entre tableau,
 *   graphique et situation ; vérifier la cohérence d'un résultat.
 * Student action: répondre ; lire le graphique.
 * Mathematical state: situations (règles) de situationsData ; tableaux et
 *   droites en sont dérivés.
 * Visual consequence: droites par l'origine, plus ou moins raides selon le
 *   coefficient.
 * Expected observation: « la droite la plus raide est la matière la plus
 *   dense » ; « 2 700 km en 3 h, c'est absurde ».
 * Misconception targeted: confondre vitesse et distance ; lire un graphique
 *   sans ses unités ; accepter un résultat absurde.
 */

const VIT = SITUATIONS.vitesse;
const FER = SITUATIONS.fer;
const ALU = SITUATIONS.alu;
const vitRows = tableFor(VIT);
const RANGE_V = { xMin: 0, xMax: 5, yMin: 0, yMax: 450 };
const RANGE_M = { xMin: 0, xMax: 50, yMin: 0, yMax: 400 };

export default function Module06LaboSciences() {
  const [vDone, setVDone] = useState(false);
  const [dDone, setDDone] = useState(false);
  const [tDone, setTDone] = useState(false);
  const [mDone, setMDone] = useState(false);
  const [gDone, setGDone] = useState(false);
  const [mapDone, setMapDone] = useState(false);
  const [absurdDone, setAbsurdDone] = useState(false);
  const [plausDone, setPlausDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le labo des sciences"
      moduleSubtitle="Vitesse, masse volumique, échelle : tableau, graphique, situation — et un résultat à vérifier."
      estimatedTime="12 min"
      brief={{
        tag: '🔬 Mission 06',
        title: 'Le voyage jusqu’à la fête',
        tone: 'rose',
        body: (
          <p>
            Le train régional roule à vitesse constante : 1 h → 90 km, 2 h → 180 km, 3,5 h → 315 km. Le tableau
            et le graphique disent la même chose — sauras-tu lire les deux ?
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La vitesse',
          subtitle: 'Tableau et graphique du train.',
          done: vDone && dDone && tDone,
          content: (
            <div className="space-y-4">
              <RatioTable xLabel="temps" xUnit="h" yLabel="distance" yUnit="km" columns={vitRows} ratios="all" caption="Le train régional" />
              <CoordPlane range={RANGE_V} unit={56} unitY={200 / RANGE_V.yMax} xStep={1} yStep={90}
                functions={[{ id: 'v', a: 90, b: 0, tone: 'rose', label: 'train' }]}
                points={vitRows.map((r) => ({ id: `p${r.x}`, x: r.x, y: r.y, color: '#e11d48' }))}
                axisLabels={{ x: 'h', y: 'km' }} ariaLabel="Repère : distance parcourue selon le temps" caption={false} />
              <TapQuestion
                prompt="Quel est le coefficient de proportionnalité, et que représente-t-il ?"
                options={['90 : la vitesse, en km par heure', '315 : la distance totale', '3,5 : le temps du trajet', '0,011 : les heures par km']}
                correct={0}
                cols={1}
                explain="distance ÷ temps = 90 partout : c’est la VITESSE, 90 km/h — la distance parcourue en une heure. Sur le graphique, c’est la pente de la droite : à chaque heure, 90 km de plus."
                solved={vDone}
                onAnswered={() => setVDone(true)}
              />
              {vDone && (
                <NumericQuestion
                  prompt="Quelle distance en 2,5 h ?"
                  suffix="km"
                  expected={distance(90, 2.5)}
                  parse={parseDec}
                  display={`${formatDec(distance(90, 2.5))} km`}
                  explain="90 × 2,5 = 225 km. Sur le graphique : la droite passe par (2,5 ; 225)."
                  explainFor={(n) => (n === 92.5 ? '90 + 2,5 additionne la vitesse et le temps. Distance = vitesse × temps = 225 km.' : null)}
                  solved={dDone}
                  onAnswered={() => setDDone(true)}
                />
              )}
              {dDone && (
                <NumericQuestion
                  prompt="La fête est à 405 km. Combien de temps dure le trajet ?"
                  suffix="h"
                  expected={duration(405, 90)}
                  parse={parseDec}
                  display={`${formatDec(duration(405, 90))} h`}
                  explain="405 ÷ 90 = 4,5 h, soit 4 h 30 min. Le chemin inverse : de la distance vers le temps, on DIVISE par le coefficient."
                  explainFor={(n) => {
                    if (n === 36450) return '405 × 90 multiplie au lieu de diviser : 36 450 h, c’est plus de quatre ans ! Temps = distance ÷ vitesse = 4,5 h.';
                    if (n === 4.05 || n === 45) return 'Attention à la virgule : 405 ÷ 90 = 4,5 h.';
                    return null;
                  }}
                  solved={tDone}
                  onAnswered={() => setTDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'La masse volumique',
          subtitle: 'Fer : 7,8 g par cm³. Aluminium : 2,7 g par cm³.',
          done: mDone && gDone,
          content: (
            <div className="space-y-4">
              <NumericQuestion
                prompt="Quelle est la masse d’un morceau de fer de 25 cm³ ?"
                suffix="g"
                expected={mass(7.8, 25)}
                parse={parseDec}
                display={`${formatDec(mass(7.8, 25))} g`}
                explain="masse = masse volumique × volume = 7,8 × 25 = 195 g. La masse volumique est un coefficient de proportionnalité entre volume et masse."
                explainFor={(n) => (n === 32.8 ? '7,8 + 25 additionne. La masse volumique se MULTIPLIE par le volume : 195 g.' : null)}
                solved={mDone}
                onAnswered={() => setMDone(true)}
              />
              {mDone && (
                <TapQuestion
                  prompt="Deux droites : laquelle est celle du fer ?"
                  above={
                    <CoordPlane range={RANGE_M} unit={5.6} unitY={200 / RANGE_M.yMax} xStep={10} yStep={100}
                      functions={[{ id: 'a', a: 7.8, b: 0, tone: 'indigo', label: 'A' }, { id: 'b', a: 2.7, b: 0, tone: 'emerald', label: 'B' }]}
                      axisLabels={{ x: 'cm³', y: 'g' }} ariaLabel="Repère : masse selon le volume, deux droites A et B" caption={false} />
                  }
                  options={['La droite A, la plus raide : à volume égal, plus de masse', 'La droite B, la plus basse', 'Les deux : elles passent par l’origine', 'Impossible sans le tableau']}
                  correct={0}
                  cols={1}
                  explain="Les deux passent par O (proportionnalité), mais la pente lit le coefficient : A monte de 7,8 g par cm³, B de 2,7. Le fer, plus dense, est la droite la plus raide — le graphique dit le coefficient sans un seul calcul."
                  solved={gDone}
                  onAnswered={() => setGDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'L’échelle de la carte',
          subtitle: 'Sur la carte au 1/25 000, la salle des fêtes est à 7 cm de la gare.',
          done: mapDone,
          content: (
            <NumericQuestion
              prompt="Quelle est la distance réelle, en km ?"
              suffix="km"
              expected={cmToKm(realDistanceCm(7, 25000))}
              parse={parseDec}
              display={`${formatDec(cmToKm(realDistanceCm(7, 25000)))} km`}
              explain="1 cm sur la carte = 25 000 cm réels = 250 m. 7 cm → 7 × 250 = 1 750 m = 1,75 km. L’échelle est un coefficient : distance réelle = 25 000 × distance sur la carte."
              explainFor={(n) => {
                if (n === 175000) return '175 000, c’est en cm. En km : 175 000 ÷ 100 000 = 1,75 km.';
                if (n === 17.5) return 'Une erreur de conversion : 175 000 cm = 1 750 m = 1,75 km.';
                if (n === 0.175) return 'Un facteur 10 manque : 7 × 25 000 = 175 000 cm = 1,75 km.';
                return null;
              }}
              solved={mapDone}
              onAnswered={() => setMapDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Cohérent ou absurde ?',
          subtitle: 'Avant d’annoncer un résultat, on le regarde.',
          done: absurdDone && plausDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Un élève calcule : « à 90 km/h, en 3 h, le train parcourt 2 700 km ». Que lui dis-tu ?"
                options={['C’est absurde : 90 × 3 = 270 km — 2 700 km, c’est Paris–Moscou', 'C’est juste : 90 × 30 = 2 700', 'C’est possible si le train accélère', 'Il fallait diviser : 30 km']}
                correct={0}
                cols={1}
                explain={`Un ordre de grandeur suffit : 3 h à 90 km/h font moins de 300 km. 2 700 km est ${magnitudeOk(2700, 270) ? 'plausible' : 'dix fois trop grand'} — une virgule ou un zéro a glissé. Vérifier, c’est d’abord se demander si le nombre est raisonnable.`}
                solved={absurdDone}
                onAnswered={() => setAbsurdDone(true)}
              />
              {absurdDone && (
                <BatchChoiceQuestion
                  intro={<p className="text-sm font-semibold text-slate-700">Plausible ou non ?</p>}
                  rows={[
                    { id: 'a', label: '4 cm sur la carte au 1/25 000 → 1 km', options: ['Plausible', 'Absurde'], correct: 0, correction: '4 × 25 000 cm = 1 km.' },
                    { id: 'b', label: '50 cm³ d’aluminium → 1 350 g', options: ['Plausible', 'Absurde'], correct: 1, correction: '2,7 × 50 = 135 g, dix fois moins.' },
                    { id: 'c', label: 'Une recette pour 12 avec 1 800 g de farine (150 g par personne)', options: ['Plausible', 'Absurde'], correct: 0, correction: '150 × 12 = 1 800.' },
                    { id: 'd', label: 'Un prix de 60 € après −25 % sur 80 €', options: ['Plausible', 'Absurde'], correct: 0, correction: '80 × 0,75 = 60.' },
                  ]}
                  feedback={({ allRight, nCorrect, total }) => (
                    <Feedback tone={allRight ? 'ok' : 'ko'}>
                      {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un résultat de proportionnalité se vérifie par le rapport, par le sens
                      (une baisse baisse) et par l’ordre de grandeur.
                    </Feedback>
                  )}
                  solved={plausDone}
                  onAnswered={() => setPlausDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Vitesse, masse volumique, échelle : trois coefficients de proportionnalité, trois droites par l’origine.
          Tableau, graphique et situation racontent le même nombre. Place à la grande tablée.
        </Feedback>
      }
    />
  );
}
