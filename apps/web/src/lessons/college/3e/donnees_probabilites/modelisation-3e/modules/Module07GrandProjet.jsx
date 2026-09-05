import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import InfoSorter from '../../../../../common/components/InfoSorter';
import ValueTable from '../../../../../common/components/ValueTable';
import CoordPlane from '../../../../../common/components/CoordPlane';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { FETE } from '../components/situationsData';
import { formatDec, parseDec, evaluate, breakEven, cheapest, formatModel, planeFor } from '../components/modelUtils';

/**
 * Module 7 — LABORATOIRE (transfert) : « Le grand projet ».
 *
 * Activity: organiser la fête de fin d'année — trier les informations, écrire
 *   les deux modèles de coût, choisir la représentation qui répond à « à
 *   partir de combien de personnes ? », trouver le seuil, décider pour 45
 *   personnes, et vérifier.
 * Mathematical objective: mener le cycle complet sur une situation neuve, avec
 *   deux modèles concurrents (affine vs proportionnel) : le graphique montre
 *   le croisement, le calcul le précise, la situation décide.
 * Student action: trier, toucher des valeurs, répondre.
 * Mathematical state: `FETE` (deux règles) ; seuil, coûts et vainqueur
 *   viennent de `breakEven` / `cheapest` / `evaluate`.
 * Expected observation: « les deux droites se croisent à 30 personnes ;
 *   pour 45, la salle est moins chère ».
 */

const S = FETE.salle.model;
const Tr = FETE.traiteur.model;
const SEUIL = breakEven(S, Tr);
const XS = [10, 20, 30, 40, 50, 60];

export default function Module07GrandProjet() {
  const [sortDone, setSortDone] = useState(false);
  const [modelsDone, setModelsDone] = useState(false);
  const [reprDone, setReprDone] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [seuilDone, setSeuilDone] = useState(false);
  const [decideDone, setDecideDone] = useState(false);
  const [checkDone, setCheckDone] = useState(false);

  const geo = planeFor([{ x: 60, y: evaluate(S, 60) }, { x: 60, y: evaluate(Tr, 60) }], { maxTicks: 7, width: 320, height: 200 });
  const win45 = cheapest([S, Tr], FETE.attendance);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Le grand projet"
      moduleSubtitle="La fête de fin d’année : deux devis, un seuil, une décision argumentée."
      estimatedTime="8 min"
      brief={{
        tag: '🎉 Mission 07',
        title: 'Deux devis pour la fête',
        tone: 'purple',
        body: (
          <p>
            Le comité hésite : louer la salle et faire le buffet, ou prendre un traiteur ? Tout dépend du nombre
            de participants. Modélise, puis décide pour {FETE.attendance} personnes.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Trie les informations',
          done: sortDone,
          content: (kit) => (
            <div className="space-y-3">
              <InfoSorter items={FETE.infos} solved={sortDone} onSolved={() => setSortDone(true)} formative onCheck={kit.react} />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Écris les deux modèles',
          subtitle: 'n = nombre de participants.',
          done: modelsDone && reprDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Quels sont les deux modèles de coût ?"
                options={[
                  'Salle : 240 + 6n · Traiteur : 14n',
                  'Salle : 246n · Traiteur : 14n',
                  'Salle : 240n + 6 · Traiteur : 14 + n',
                  'Salle : 240 + 6n · Traiteur : 14 + n',
                ]}
                correct={0}
                cols={1}
                explain="La salle a une part fixe (240 €) et un coût par personne (6 €) : modèle affine. Le traiteur n’a qu’un coût par personne : modèle proportionnel, 14n."
                solved={modelsDone}
                onAnswered={() => setModelsDone(true)}
              />
              {modelsDone && (
                <TapQuestion
                  prompt="La question est « à partir de combien de personnes la salle devient-elle moins chère ? ». Quelle représentation est la plus utile ?"
                  options={['Le graphique des deux modèles : on voit où les droites se croisent', 'Un tableau pour n = 45 seulement', 'La couleur des devis']}
                  correct={0}
                  cols={1}
                  explain="Un « à partir de quand » est un croisement : le graphique le montre, puis le calcul (240 + 6n = 14n) le précise."
                  solved={reprDone}
                  onAnswered={() => setReprDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le seuil',
          subtitle: 'Teste des valeurs de n, regarde les droites, puis calcule le seuil.',
          done: seuilDone,
          content: (kit) => (
            <div className="space-y-3">
              <ValueTable columns={[{ id: 's', label: 'salle : 240 + 6n', fn: (n) => evaluate(S, n) }, { id: 't', label: 'traiteur : 14n', fn: (n) => evaluate(Tr, n) }]}
                xs={XS} tested={tested} onTest={(x) => { setTested((s) => new Set(s).add(x)); kit.react(true); }} variable="n" unit="€" caption="Vert : même coût" />
              <CoordPlane range={geo.range} unit={geo.unit} unitY={geo.unitY} xStep={geo.xStep} yStep={geo.yStep}
                functions={[{ id: 's', a: 6, b: 240, tone: 'indigo', label: 'salle' }, { id: 't', a: 14, b: 0, tone: 'rose', label: 'traiteur' }]}
                axisLabels={{ x: 'personnes', y: '€' }} ariaLabel="Repère : coût des deux formules selon le nombre de personnes" caption={false} />
              <NumericQuestion
                prompt="Pour quel nombre de personnes les deux formules coûtent-elles la même chose ?"
                expected={SEUIL}
                parse={parseDec}
                display={formatDec(SEUIL)}
                explain={`240 + 6n = 14n → 8n = 240 → n = ${formatDec(SEUIL)}. À ${formatDec(SEUIL)} personnes, ${formatDec(evaluate(S, SEUIL))} € des deux côtés — c'est le croisement des droites.`}
                explainFor={(n) => (n === 240 / 14 || Math.abs(n - 17.14) < 0.02 ? '240 ÷ 14 compare la location au traiteur pour une personne. Il faut égaler les deux coûts totaux : 240 + 6n = 14n.' : null)}
                solved={seuilDone}
                onAnswered={() => setSeuilDone(true)}
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Décide, puis vérifie',
          subtitle: `Le comité attend ${FETE.attendance} personnes.`,
          done: decideDone && checkDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={`Pour ${FETE.attendance} personnes, quelle formule choisir ?`}
                options={[
                  `La salle : ${formatDec(evaluate(S, FETE.attendance))} € contre ${formatDec(evaluate(Tr, FETE.attendance))} € — au-dessus de 30 personnes, la salle gagne`,
                  `Le traiteur : ${formatDec(evaluate(Tr, FETE.attendance))} € contre ${formatDec(evaluate(S, FETE.attendance))} €`,
                  'Les deux se valent',
                ]}
                correct={win45[0] === S ? 0 : 1}
                cols={1}
                explain={`Au-delà du seuil (${formatDec(SEUIL)}), la droite de la salle passe sous celle du traiteur : pour ${FETE.attendance} personnes, salle ${formatDec(evaluate(S, FETE.attendance))} € contre traiteur ${formatDec(evaluate(Tr, FETE.attendance))} €. En dessous de 30, c'est l'inverse.`}
                solved={decideDone}
                onAnswered={() => setDecideDone(true)}
              />
              {decideDone && (
                <TapQuestion
                  prompt="Un membre du comité objecte : « et si seulement 25 personnes viennent ? ». Que vaut ta décision ?"
                  options={['Elle dépend du nombre réel : à 25, le traiteur serait moins cher (350 € contre 390 €) — il faut sécuriser le nombre de participants', 'La salle reste moins chère dans tous les cas', 'Le modèle est faux']}
                  correct={0}
                  cols={1}
                  explain={<>Le modèle ne décide pas seul : il dit que la réponse bascule à 30. Une bonne décision cite le seuil et ses conditions. <MathText>{`$\\text{salle} = ${formatModel(S, { variable: 'n' })}$`}</MathText>, <MathText>{`$\\text{traiteur} = ${formatModel(Tr, { variable: 'n' })}$`}</MathText>.</>}
                  solved={checkDone}
                  onAnswered={() => setCheckDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Le cycle complet sur une situation neuve : trier, modéliser deux fois, choisir le graphique pour voir le croisement,
          calculer le seuil, décider — et garder la limite en tête. Tu es prêt pour le bureau d’études.
        </Feedback>
      }
    />
  );
}
