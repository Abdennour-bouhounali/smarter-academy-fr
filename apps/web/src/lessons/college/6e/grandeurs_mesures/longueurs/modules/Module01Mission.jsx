import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitSwitcher from '../components/UnitSwitcher';
import InvariantRibbon from '../components/InvariantRibbon';
import { convert, formatLength } from '../components/lengthUtils';

/**
 * Module 1 — déclencheur, reconstruit sur le lesson kit.
 *
 * Un choix d'unité absurde (des millimètres pour Paris–Lyon) déclenche le
 * réflexe : l'unité doit être adaptée à la taille de ce qu'on mesure.
 */
const CONSTAT_Q = {
  q: "Léo doit indiquer la distance entre Paris et Lyon. Il écrit : « 465 000 000 mm ». Que penses-tu de son choix ?",
  options: [
    "C'est juste, du moment que le nombre est exact",
    "Le nombre est peut-être juste, mais le millimètre n'est pas une unité adaptée pour une aussi grande distance",
  ],
  correct: 1,
  explain:
    "465 000 000 mm et 465 km représentent la même distance. Mais un nombre avec autant de chiffres n'aide personne à se représenter la distance : on choisit une unité adaptée à la taille de ce qu'on mesure.",
};

const ITEMS = [
  { id: 'stylo', emoji: '🖊️', label: 'La longueur d’un stylo', correct: 'cm', valueInCorrect: 15, badUnit: 'mm' },
  { id: 'paris', emoji: '🏙️', label: 'La distance entre deux villes', correct: 'km', valueInCorrect: 465, badUnit: 'mm' },
  { id: 'piece', emoji: '🪙', label: 'L’épaisseur d’une pièce de monnaie', correct: 'mm', valueInCorrect: 2, badUnit: 'km' },
  { id: 'porte', emoji: '🚪', label: 'La hauteur d’une porte', correct: 'm', valueInCorrect: 2, badUnit: 'mm' },
  { id: 'cahier', emoji: '📓', label: 'La largeur d’un cahier', correct: 'cm', valueInCorrect: 21, badUnit: 'mm' },
];
const UNITS = ['km', 'm', 'cm', 'mm'];

export default function Module01Mission() {
  const [switchDone, setSwitchDone] = useState(false);
  const [seenUnits, setSeenUnits] = useState(['km']);
  const [displayUnit, setDisplayUnit] = useState('km');
  const [constatDone, setConstatDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);

  /* Le laboratoire d'invariance : l'élève pose lui-même la longueur du ruban,
     puis change d'unité. `ribbonMm` est la longueur PHYSIQUE, en millimètres —
     elle ne bouge que par le geste, jamais par un changement d'unité. */
  const [ribbonMm, setRibbonMm] = useState(1500);
  const [ribbonUnit, setRibbonUnit] = useState('cm');
  const [pred, setPred] = useState(null);
  const [pulled, setPulled] = useState(false);
  const [unitsSeenOnFixed, setUnitsSeenOnFixed] = useState(['cm']);
  const [ribbonDone, setRibbonDone] = useState(false);

  const handleUnitChange = (u) => {
    setDisplayUnit(u);
    setSeenUnits((prev) => (prev.includes(u) ? prev : [...prev, u]));
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : quelle unité ?"
      moduleSubtitle="La largeur d’un cahier, la distance Paris–Lyon : une seule unité pour tout mesurer ?"
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Léo doit annoncer une distance… mais quelque chose cloche.',
        body: (
          <>
            <div className="bg-white/10 rounded-xl p-4 text-center font-mono text-lg font-bold text-white mt-2">
              Paris → Lyon : 465 000 000 mm
            </div>
            <p className="pt-2">Le nombre est correct. Alors pourquoi ce choix te semble-t-il bizarre ?</p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Tire sur le ruban, puis change d’unité',
          subtitle: 'Donne-lui la longueur que tu veux, et surveille le repère noir.',
          done: ribbonDone,
          content: (kit) => (
            <div className="space-y-4">
              {/* Prédiction SANS verdict (§6ter.3) : c'est le ruban qui
                  répondra, une seconde plus tard. Elle est posée À CÔTÉ du
                  labo, jamais devant lui (règle du 2026-09-05). */}
              <PredictionChips
                prompt="quand tu passeras de cm à mm, que fera le ruban ?"
                options={[
                  { id: 'plus-long', label: 'Il deviendra plus long' },
                  { id: 'plus-court', label: 'Il deviendra plus court' },
                  { id: 'rien', label: 'Il ne bougera pas' },
                ]}
                value={pred}
                onChange={setPred}
              />
              {/* JAMAIS `disabled` : le ruban reste tirable après validation. */}
              <InvariantRibbon
                lengthMm={ribbonMm}
                onLengthChange={(v) => { setRibbonMm(v); setPulled(true); }}
                unit={ribbonUnit}
                onUnitChange={(u) => {
                  setRibbonUnit(u);
                  const next = unitsSeenOnFixed.includes(u) ? unitsSeenOnFixed : [...unitsSeenOnFixed, u];
                  setUnitsSeenOnFixed(next);
                  // Le geste ET deux écritures au moins : l'élève a posé une
                  // longueur, puis l'a vue s'écrire autrement sans bouger.
                  if (pulled && next.length >= 2 && !ribbonDone) {
                    kit.react(true);
                    setRibbonDone(true);
                  }
                }}
                changedUnitWhileFixed={unitsSeenOnFixed.length >= 2}
              />
              {!ribbonDone && (
                <p className="text-center text-xs text-slate-500">
                  Tire d’abord le bout du ruban, puis touche une autre unité.
                </p>
              )}
              {ribbonDone && (
                <Feedback tone="ok">
                  Le ruban n’a pas bougé d’un pixel. Pourtant le nombre, lui, a changé —{' '}
                  {pred === 'rien'
                    ? 'exactement comme tu l’avais prédit.'
                    : 'ce n’est donc pas la longueur qui change, c’est l’unité qui la mesure.'}
                </Feedback>
              )}
              {/* La brique nomme ce que le GESTE vient d'établir : le ruban
                  posé par l'élève n'a pas bougé pendant que son écriture
                  changeait. C'est ici, et pas à l'étape suivante, que
                  l'invariance a été rendue visible au pixel près. */}
              {ribbonDone && (
                <KnowledgeBrick
                  id="longueur-invariante"
                  variant="new"
                  lead="Ton ruban n’a pas bougé pendant que son nombre changeait."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Une même distance, quatre unités',
          done: switchDone,
          content: (kit) => (
            <div className="space-y-4">
              <UnitSwitcher
                unit={displayUnit}
                onUnitChange={(u) => {
                  handleUnitChange(u);
                  const allSeen = new Set([...seenUnits, u]).size === UNITS.length;
                  if (allSeen && !switchDone) {
                    kit.react(true);
                    setSwitchDone(true);
                  }
                }}
              />
              {switchDone && (
                <Feedback tone="ok">
                  Le trajet Paris–Lyon n'a pas changé : c'est l'unité qui devient plus grande ou plus petite, et le
                  nombre s'adapte en conséquence.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Un premier constat',
          done: constatDone,
          content: (
            <TapQuestion
              requires={['longueur-invariante']}
              prompt={CONSTAT_Q.q}
              options={CONSTAT_Q.options}
              correct={CONSTAT_Q.correct}
              cols={1}
              explain={CONSTAT_Q.explain}
              solved={constatDone}
              onAnswered={() => setConstatDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'À chaque situation, son unité',
          done: matchDone,
          content: (
            <div className="space-y-5">
              <BatchChoiceQuestion
                intro={
                  <p className="text-sm text-slate-600">
                    Pour chaque situation, choisis l'unité la plus adaptée. Il n'y a pas de piège caché : demande-toi
                    simplement « à peu près quelle taille est-ce que je mesure ? »
                  </p>
                }
                rows={ITEMS.map((it) => ({
                  id: it.id,
                  label: (
                    <>
                      <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                      <span>{it.label}</span>
                    </>
                  ),
                  options: UNITS,
                  correct: UNITS.indexOf(it.correct),
                  correction: (
                    <>
                      → {it.correct} — en {it.badUnit}, ça ferait{' '}
                      <span className="font-mono">{formatLength(convert(it.valueInCorrect, it.correct, it.badUnit), it.badUnit)}</span> :
                      peu pratique.
                    </>
                  ),
                }))}
                requires={['longueur-invariante']}
                solved={matchDone}
                onAnswered={() => setMatchDone(true)}
                feedback={({ allRight, nCorrect, total }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    {!allRight && (
                      <>
                        {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                      </>
                    )}
                    On choisit l'unité selon la taille de ce qu'on mesure, pas au hasard : un stylo se
                    mesure comme un cahier (cm), une pièce est très fine (mm), une porte est plus grande que toi
                    (m), une distance entre villes se compte en km.
                  </Feedback>
                )}
              />
              {/* Cinq objets viennent d'être appariés à leur unité : la règle
                  du choix se dit maintenant sans rien annoncer d'avance. */}
              {matchDone && (
                <KnowledgeBrick
                  id="unite-adaptee"
                  variant="new"
                  lead="Tu viens de choisir cinq fois : à chaque fois, la taille de l'objet a décidé."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais choisir une unité. Reste à s'en servir pour de vrai :
          au module suivant, tu poses un objet sur une règle — et la règle te tend un piège.
        </KnowledgeSnapshot>
      }
    />
  );
}
