import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLine from '../../../../../common/components/NumberLine';
import ReferenceRuler from '../components/ReferenceRuler';

/**
 * Module 5 — practice lab, reconstruit sur le lesson kit.
 *
 * Estimer avant de mesurer : choisir une valeur plausible (unité
 * ET valeur ensemble), puis situer une longueur sur une droite graduée.
 */
const SCENARIOS = [
  { id: 'porte', emoji: '🚪', label: 'La hauteur d’une porte', options: [{ v: 20, u: 'cm' }, { v: 2, u: 'm' }, { v: 20, u: 'm' }], correct: 1 },
  { id: 'foot', emoji: '⚽', label: 'La longueur d’un terrain de foot', options: [{ v: 10, u: 'm' }, { v: 100, u: 'm' }, { v: 1000, u: 'm' }], correct: 1 },
  { id: 'cd', emoji: '💿', label: 'L’épaisseur d’un CD', options: [{ v: 1, u: 'mm' }, { v: 1, u: 'cm' }, { v: 10, u: 'cm' }], correct: 0 },
  { id: 'trajet', emoji: '🚗', label: 'Le trajet Paris–Marseille', options: [{ v: 8, u: 'km' }, { v: 80, u: 'km' }, { v: 800, u: 'km' }], correct: 2 },
];

export default function Module05ChoisirEstimer() {
  const [scenarioDone, setScenarioDone] = useState([]);
  const allScenariosDone = scenarioDone.length === SCENARIOS.length;

  const [nlValue, setNlValue] = useState(2.5);
  const [nlChecked, setNlChecked] = useState(false);
  const [nlDone, setNlDone] = useState(false);

  const [refPos, setRefPos] = useState(550);
  const [refDone, setRefDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Choisir et estimer"
      moduleSubtitle="Quelle unité choisir ? Quelle valeur attendre avant même de mesurer ?"
      estimatedTime="11 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Avant de sortir la règle, essaie de deviner.',
        body: <p>Pour chaque objet, choisis la proposition la plus réaliste — unité ET valeur en même temps.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'La proposition la plus réaliste',
          done: allScenariosDone,
          content: (
            <div className="space-y-8">
              {SCENARIOS.map((s, i) =>
                i === 0 || scenarioDone.includes(i - 1) ? (
                  <div key={s.id} className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <TapQuestion
                      requires={['unite-adaptee', 'escalier-longueurs']}
                      prompt={
                        <span className="flex items-center gap-2.5">
                          <span className="text-2xl" aria-hidden="true">{s.emoji}</span>
                          <span>{s.label}</span>
                        </span>
                      }
                      options={s.options}
                      correct={s.correct}
                      cols={3}
                      renderOption={(o) => (
                        <span className="font-mono font-extrabold text-base">
                          {o.v} <span className="text-xs font-semibold text-slate-500">{o.u}</span>
                        </span>
                      )}
                      correctionLabel={`${s.options[s.correct].v} ${s.options[s.correct].u}`}
                      explain={`${s.options[s.correct].v} ${s.options[s.correct].u} : c'est la seule proposition réaliste — les deux autres sont ridiculement petite ou grande.`}
                      solved={scenarioDone.includes(i)}
                      onAnswered={() => setScenarioDone((d) => (d.includes(i) ? d : [...d, i]))}
                    />
                  </div>
                ) : null
              )}
              {/* Quatre jugements viennent d'être portés sans instrument :
                  c'est ici, et pas dans le titre d'étape, que le mot
                  « estimer » prend son sens. */}
              {allScenariosDone && (
                <KnowledgeBrick
                  id="estimation-plausible"
                  variant="new"
                  lead="Tu viens d'éliminer quatre fois l'impossible sans rien mesurer. Ce geste a un nom."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Place ton estimation sur la droite',
          done: nlDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Cette droite va de 0 à 5 m. Fais glisser le curseur là où tu penses que se trouve la hauteur d'une
                porte (environ 2 m) — le nombre reste caché tant que tu n'as pas validé.
              </p>
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                <NumberLine
                  min={0}
                  max={5}
                  step={0.1}
                  labelEvery={10}
                  height={150}
                  mode="place"
                  value={nlValue}
                  onChange={setNlValue}
                  revealValue={nlChecked}
                  ghost={nlChecked ? { value: 2, label: '2 m (hauteur réelle)' } : null}
                  disabled={nlChecked}
                  ariaLabel="Droite graduée de 0 à 5 mètres, curseur à placer"
                />
              </div>
              {!nlChecked ? (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setNlChecked(true);
                      const ok = Math.abs(nlValue - 2) <= 0.3;
                      kit.react(ok);
                      setNlDone(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700"
                  >
                    Valider mon estimation
                  </button>
                </div>
              ) : (
                <Feedback tone={Math.abs(nlValue - 2) <= 0.3 ? 'ok' : 'ko'}>
                  Tu avais placé le curseur vers {nlValue.toFixed(1)} m ; la hauteur réelle d'une porte est d'environ
                  2 m.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Compare avec une référence connue',
          done: refDone,
          content: (kit) => (
            <div className="space-y-3">
              <ReferenceRuler
                targetLabel="La porte"
                targetHeightM={2}
                referenceLengthM={1}
                referenceLabel="1 m"
                position={refPos}
                onPositionChange={setRefPos}
                disabled={refDone}
              />
              {!refDone && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      kit.react(true);
                      setRefDone(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-700"
                  >
                    J'ai comparé
                  </button>
                </div>
              )}
              {refDone && (
                <Feedback tone="ok">
                  La porte fait environ deux fois la règle de 1 m que tu viens de faire glisser : environ 2 m.
                </Feedback>
              )}
              {refDone && (
                <KnowledgeBrick
                  id="reference-connue"
                  variant="new"
                  lead="Tu viens de mesurer une porte sans mètre ruban, juste en comparant."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu sais estimer une longueur seule. Au dernier module de
          contenu, il faudra en additionner plusieurs : le tour complet d'une figure.
        </KnowledgeSnapshot>
      }
    />
  );
}
