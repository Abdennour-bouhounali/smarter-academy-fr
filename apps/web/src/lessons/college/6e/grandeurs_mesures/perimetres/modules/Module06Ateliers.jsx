import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AnswerBuilder from '../../../../../common/components/AnswerBuilder';
import { rectanglePerimeter, circleCircumference, formatDec, parseDec } from '../components/perimUtils';

/**
 * Module 6 — practice lab : trois commandes réelles du géomètre.
 *
 * Chaque atelier mobilise le rituel du module 5 (unifier les unités,
 * estimer, calculer, répondre en phrase complète). AnswerBuilder impose la
 * réponse complète : nombre + unité + phrase.
 */

// Atelier 1 — terrain quelconque, unités mélangées, total entier (50 m).
const PLOT = {
  sides: ['12 m', '9 m', '850 cm', '14 m', '6,5 m'],
  totalM: 50,
};

// Atelier 2 — la piste : rectangle 40 × 25, combien de tours pour 500 m ?
const PISTE = { L: 40, l: 25 };
const PISTE_P = rectanglePerimeter(PISTE.L, PISTE.l); // 130
const TOURS_Q = {
  q: `Le tour du terrain mesure ${PISTE_P} m. Combien de tours COMPLETS faut-il courir pour dépasser 500 m ?`,
  options: ['3 tours (390 m)', '4 tours (520 m)', '5 tours (650 m)'],
  correct: 1,
  explain: '3 tours = 390 m (pas assez), 4 tours = 520 m : c’est le premier nombre de tours qui dépasse 500 m.',
};

// Atelier 3 — la fontaine : cercle D = 4 m, bordure par barres de 2 m.
const FONTAINE_P = circleCircumference(4); // 12,56
const BARRES_Q = {
  q: `La bordure mesure ≈ ${formatDec(FONTAINE_P)} m et se vend par barres de 2 m. Combien de barres commander ?`,
  options: ['6 barres (12 m)', '7 barres (14 m)', '13 barres'],
  correct: 1,
  explain: '6 barres = 12 m : il manquerait 56 cm. On commande 7 barres (14 m) et on recoupe — sur un chantier, on arrondit toujours au-dessus.',
};

export default function Module06Ateliers() {
  const [plotDone, setPlotDone] = useState(false);
  const [pisteCalcDone, setPisteCalcDone] = useState(false);
  const [toursDone, setToursDone] = useState(false);
  const [fontaineCalcDone, setFontaineCalcDone] = useState(false);
  const [barresDone, setBarresDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Les ateliers du géomètre"
      moduleSubtitle="Trois commandes réelles : clôture, piste, bordure de fontaine."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Trois bons de commande t’attendent sur le bureau.',
        body: <p>À chaque fois : mêmes unités partout, une estimation en tête, un calcul, et une réponse complète.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Atelier 1 · La clôture du terrain',
          done: plotDone,
          content: (
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-sm text-slate-700">
                Le terrain à clôturer a cinq côtés : <strong>{PLOT.sides.join(' · ')}</strong>. Attention, un des
                côtés est donné en centimètres !
              </div>
              <AnswerBuilder
                value={PLOT.totalM}
                unitOptions={['cm', 'm', 'km']}
                correctUnit="m"
                sentenceOptions={[
                  'Il faut 50 m de clôture pour faire le tour du terrain.',
                  'Le terrain mesure 50 m de long.',
                  'L’aire du terrain est de 50 m.',
                ]}
                correctSentenceIndex={0}
                hint="850 cm = 8,5 m. Mets tout en mètres : 12 + 9 + 8,5 + 14 + 6,5."
                solved={plotDone}
                onSolved={() => setPlotDone(true)}
              />
            </div>
          ),
        },
        {
          num: 2,
          title: 'Atelier 2 · La piste de course',
          done: pisteCalcDone && toursDone,
          content: (
            <div className="space-y-5">
              <NumericQuestion
                prompt={`Le terrain de course est un rectangle de ${PISTE.L} m sur ${PISTE.l} m. Quel est son périmètre ?`}
                suffix="m"
                expected={PISTE_P}
                parse={parseDec}
                display={formatDec(PISTE_P)}
                explain={<>P = 2 × ({PISTE.L} + {PISTE.l}) = 2 × 65 = <strong>{PISTE_P} m</strong>.</>}
                explainFor={(n) =>
                  n === 65
                    ? 'Tu as calculé L + l = 65, un seul « aller ». Le tour complet double cette somme : 2 × 65.'
                    : 'Utilise la formule du rectangle : P = 2 × (L + l).'
                }
                requires={['perimetre', 'formules-polygones']}
                solved={pisteCalcDone}
                onAnswered={() => setPisteCalcDone(true)}
              />
              {pisteCalcDone && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    prompt={TOURS_Q.q}
                    options={TOURS_Q.options}
                    correct={TOURS_Q.correct}
                    cols={1}
                    explain={TOURS_Q.explain}
                    requires={['perimetre', 'formules-polygones']}
                    solved={toursDone}
                    onAnswered={() => setToursDone(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Atelier 3 · La bordure de la fontaine',
          done: fontaineCalcDone && barresDone,
          content: (
            <div className="space-y-5">
              <NumericQuestion
                prompt="La fontaine ronde a un diamètre de 4 m. Quelle est la longueur approchée de sa bordure ? (π ≈ 3,14)"
                suffix="m"
                expected={FONTAINE_P}
                parse={parseDec}
                display={formatDec(FONTAINE_P)}
                explain={<>P ≈ 3,14 × 4 ≈ <strong>{formatDec(FONTAINE_P)} m</strong>.</>}
                explainFor={() => 'P ≈ π × D : multiplie 3,14 par le diamètre (4 m).'}
                requires={['perimetre', 'pi', 'perimetre-cercle']}
                solved={fontaineCalcDone}
                onAnswered={() => setFontaineCalcDone(true)}
              />
              {fontaineCalcDone && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    prompt={BARRES_Q.q}
                    options={BARRES_Q.options}
                    correct={BARRES_Q.correct}
                    cols={1}
                    explain={BARRES_Q.explain}
                    requires={['perimetre', 'perimetre-cercle', 'perimetre-est-longueur']}
                    solved={barresDone}
                    onAnswered={() => setBarresDone(true)}
                  />
                </div>
              )}
              {barresDone && (
                <Feedback tone="ok">
                  Trois commandes bouclées : figure quelconque (somme des côtés), rectangle (formule), cercle
                  (π × D) — et à chaque fois, une réponse utilisable sur le chantier.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Tout ce que la mission finale va te demander tient sur cette
          carte — rien de neuf ne t'y attend.
        </KnowledgeSnapshot>
      }
    />
  );
}
