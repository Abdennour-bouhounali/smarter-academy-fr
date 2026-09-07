import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ZoomLine from '../components/ZoomLine';
import PredictionChips from '../components/PredictionChips';
import { NUMBERS } from '../components/numbers';

/**
 * Module 1 — TRIGGER : « Le zoom infini » (manipulation signature).
 *
 * Activity: chercher la diagonale du carreau (√2) sur le mètre-ruban en
 *   zoomant ×10 ; comparer avec 1,5 puis 1/3.
 * Mathematical objective: faire vivre que tout réel est un point, que le
 *   zoom donne un chiffre de plus et un encadrement plus fin, et que trois
 *   comportements existent (s'arrête / se répète / ni l'un ni l'autre).
 * Student action: prédire (sans verdict) si √2 tombera sur une graduation ;
 *   zoomer ; changer de nombre ; lire un encadrement.
 * Controlled variable: le niveau de zoom, puis le nombre cherché.
 * Mathematical state: { spec, k } ; tout est dérivé des chiffres exacts.
 * Visual consequence: fenêtre resserrée, chiffre de plus, point vert quand
 *   il tombe pile.
 * Expected observation (aha) : 1,5 tombe pile dès le premier zoom ; √2 ne
 *   tombe jamais et n'a aucun motif ; 1/3 ne tombe jamais mais répète 3.
 * Misconception targeted: « en zoomant assez on finit toujours par tomber
 *   sur une graduation », « √2 = 1,41 ».
 * Formalization: aucune ici — « décimal / rationnel / irrationnel » sont
 *   nommés aux modules 2 et 3. Le module se termine sur la question.
 */
const CHOICES_1 = [NUMBERS['un-et-demi'], NUMBERS.sqrt2];
const CHOICES_2 = [NUMBERS['un-tiers'], NUMBERS['deux-huitiemes'], NUMBERS.pi];

export default function Module01LeZoomInfini() {
  const [prediction, setPrediction] = useState(null);
  const [spec, setSpec] = useState(NUMBERS['un-et-demi']);
  const [k, setK] = useState(0);
  const [maxK, setMaxK] = useState({});
  const [spec2, setSpec2] = useState(NUMBERS['un-tiers']);
  const [k2, setK2] = useState(0);
  const [maxK2, setMaxK2] = useState({});
  const [readDone, setReadDone] = useState(false);

  const zoom = (setSpecK, setMax, s) => (nk) => {
    setSpecK(nk);
    setMax((m) => ({ ...m, [s.id]: Math.max(m[s.id] ?? 0, nk) }));
  };
  const step2Done = (maxK['un-et-demi'] ?? 0) >= 1 && (maxK.sqrt2 ?? 0) >= 4;
  const step3Done = (maxK2['un-tiers'] ?? 0) >= 3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le zoom infini"
      moduleSubtitle="Où est √2 sur le mètre-ruban ? Zoome ×10, encore, encore… tombe-t-il un jour sur une graduation ?"
      estimatedTime="9 min"
      brief={{
        tag: '📐 Mission 01',
        title: 'Un carreau carré de 1 m de côté. Sa diagonale mesure √2 m — le nombre dont le carré vaut 2.',
        tone: 'indigo',
        body: <p>Le carreleur veut la marquer sur son mètre-ruban. Entre 1 et 2, d’accord… mais où exactement ? Zoome pour le savoir.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Zoome sur 1,5 puis sur √2',
          subtitle: 'Commence par 1,5 (zoome une fois). Puis cherche √2 : zoome au moins quatre fois.',
          done: step2Done,
          content: (kit) => (
            <div className="space-y-3">
              <PredictionChips
                prompt="en zoomant assez, √2 tombera-t-il pile sur une graduation ?"
                options={[{ id: 'oui', label: 'Oui, en zoomant assez' }, { id: 'non', label: 'Non, jamais' }]}
                value={prediction}
                onChange={setPrediction}
                disabled={step2Done}
              />
              <ZoomLine
                spec={spec} k={k}
                onZoom={(nk) => { zoom(setK, setMaxK, spec)(nk); if (nk === 4 && spec.id === 'sqrt2') kit.react(true); }}
                choices={CHOICES_1}
                onChoose={(id) => { setSpec(NUMBERS[id]); setK(0); }}
              />
              {!step2Done && (
                <Feedback tone="info">
                  {(maxK['un-et-demi'] ?? 0) < 1 ? 'Zoome une fois sur 1,5 : regarde la couleur du point.' : (maxK.sqrt2 ?? 0) === 0 ? 'Maintenant choisis √2 et zoome.' : `√2 : ${maxK.sqrt2} zoom${maxK.sqrt2 > 1 ? 's' : ''} sur 4 — continue, un chiffre de plus à chaque fois.`}
                </Feedback>
              )}
              {step2Done && (
                <Feedback tone="ok">
                  {prediction === 'non' ? 'Ta prédiction : jamais. Le zoom confirme' : prediction === 'oui' ? 'Ta prédiction : oui, en zoomant assez. Le zoom te contredit' : 'Le zoom tranche'} : 1,5 tombe pile au premier zoom, mais √2 reste <strong>toujours entre deux graduations</strong> — 1,4 puis 1,41 puis 1,414 puis 1,4142… Chaque zoom donne un chiffre de plus et un encadrement plus fin, jamais un point sur une graduation. Et aucun motif ne se répète.
                </Feedback>
              )}
              {/* Le zoom vient de montrer : tout nombre est un point de la
                  droite, et chaque zoom ×10 resserre son encadrement d'un
                  chiffre. C'est le moment où « droite-reelle » a un sens. */}
              {step2Done && (
                <KnowledgeBrick
                  id="droite-reelle"
                  variant="new"
                  lead={<>Tu viens de zoomer sur √2 quatre fois de suite : à chaque fois, un chiffre de plus et une fenêtre plus étroite.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et 1/3 ?',
          subtitle: 'Zoome au moins trois fois sur 1/3. Compare avec 2/8, puis regarde π.',
          done: step3Done,
          content: (kit) => (
            <div className="space-y-3">
              <ZoomLine
                spec={spec2} k={k2}
                onZoom={(nk) => { zoom(setK2, setMaxK2, spec2)(nk); if (nk === 3 && spec2.id === 'un-tiers') kit.react(true); }}
                choices={CHOICES_2}
                onChoose={(id) => { setSpec2(NUMBERS[id]); setK2(0); }}
              />
              {step3Done ? (
                <Feedback tone="ok">
                  1/3 ne tombe jamais sur une graduation, comme √2 — mais lui <strong>répète le même chiffre</strong> : 0,3 ; 0,33 ; 0,333… Trois comportements : 2/8 = 0,25 <strong>s’arrête</strong>, 1/3 <strong>se répète</strong>, √2 et π ne font <strong>ni l’un ni l’autre</strong>.
                </Feedback>
              ) : (
                <Feedback tone="info">Zoome sur 1/3 : que remarques-tu sur les chiffres qui apparaissent ?</Feedback>
              )}
              {/* Les trois zooms (2/8, 1/3, √2/π) viennent de faire vivre les
                  trois comportements : c'est l'instant pour les nommer. */}
              {step3Done && (
                <KnowledgeBrick
                  id="trois-comportements"
                  variant="new"
                  lead={<>2/8 s’est arrêté, 1/3 a répété son 3, et √2 comme π n’ont fait ni l’un ni l’autre.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Lire un encadrement',
          done: readDone,
          content: (
            <div className="space-y-3">
              {/* La méthode de lecture d'un encadrement : sens vécu dès le
                  premier zoom, formalisée ici avant la question qui l'exige. */}
              <KnowledgeBrick
                id="methode-encadrer-decimales"
                variant="new"
                lead={<>Regarde encore le zoom sur √2 : à chaque étape, deux graduations encadrent le nombre.</>}
              />
              <TapQuestion
                prompt="D’après le zoom, entre quels deux nombres à deux décimales se trouve √2 ?"
                options={['1,41 et 1,42', '1,4 et 1,5', '1,414 et 1,415', '1,42 et 1,43']}
                cols={2}
                correct={0}
                requires={['droite-reelle', 'methode-encadrer-decimales']}
                explain="Au zoom ×100, √2 est entre les graduations 1,41 et 1,42 : on écrit 1,41 < √2 < 1,42, un encadrement d’amplitude 0,01. (1,4 < √2 < 1,5 est vrai mais à une décimale ; 1,414 < √2 < 1,415 en a trois.)"
                explainWrong="Deux décimales = le zoom ×100 : la fenêtre 1,41 → 1,42 contient √2. Les autres encadrements ont une ou trois décimales, ou sont faux (√2 < 1,42)."
                solved={readDone}
                onAnswered={() => setReadDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Ces trois familles ont des noms : c’est le module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
