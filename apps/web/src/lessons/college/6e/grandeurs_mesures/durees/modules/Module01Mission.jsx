import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CadranAccumulateur from '../components/CadranAccumulateur';

/**
 * Module 1 — LABORATOIRE : « La course contre la montre ».
 *
 * Activity: faire tourner la grande aiguille du chronomètre de la course et
 *   regarder la durée s'accumuler, tour après tour.
 * Mathematical objective: une durée s'accumule, et elle s'accumule EN BASE
 *   60 — la retenue se fait à 60, pas à 100.
 * Student action: on attrape l'aiguille et on la fait tourner ; l'heure, les
 *   deux aiguilles, le compte de tours et la durée écoulée bougent ensemble.
 * Mathematical state: UN entier `elapsed` (minutes écoulées) ; la
 *   décomposition en heures et minutes EST sa division euclidienne par 60,
 *   donc la retenue est calculée et jamais écrite à la main.
 * Expected observation: au passage sur le 12, le compteur du tour ne va pas
 *   jusqu'à 100 : il retombe à 0 et l'heure gagne 1. On voit la retenue.
 * Misconception targeted: « le temps se compte comme les longueurs » — la
 *   virgule décimale (1 h 30 = « 1,30 h »), qui vient de croire que la
 *   retenue se fait à 100. Ici l'élève voit l'aiguille sauter à 60.
 * Controlled surprise: la prédiction porte sur ce qu'affichera le compteur
 *   du tour quand l'aiguille franchira le 12 ; beaucoup annoncent 100.
 * Formalization: rien n'est nommé dans ce labo — les unités arrivent à
 *   l'étape 2 (brique `unites-temps`), la règle du 60 au module 3, qui la
 *   redémontre sur son propre tour complet.
 * Scaffolding: le cadran ne se fige jamais ; on peut tourner en arrière,
 *   revenir à zéro (touche Début) et refaire l'expérience à volonté.
 *
 * ⚠️ Aucun escalier ×10 ici : le temps n'est PAS décimal. La leçon garde
 * son `EscalierDuTemps` à marches inégales (module 4), volontairement
 * différent de l'`UnitLadder` des longueurs.
 */
// Le départ de la course : 9 h 00 pile, pour que la première retenue tombe
// sur une heure ronde et se lise sans ambiguïté.
const DEPART = { hours: 9, minutes: 0 };

const UNIT_ROWS = [
  { id: 'sprint', emoji: '🏃', label: 'Un sprint de 100 mètres', correct: 's' },
  { id: 'cours', emoji: '📚', label: 'Un cours de mathématiques', correct: 'min' },
  { id: 'nuit', emoji: '🌙', label: 'Une nuit de sommeil', correct: 'h' },
  { id: 'vacances', emoji: '🏖️', label: 'Les vacances d’été', correct: 'j' },
];
const UNIT_OPTIONS = ['s', 'min', 'h', 'j'];

const ESTIM_ROWS = [
  { id: 'dents', emoji: '🪥', label: 'Se brosser les dents', options: ['3 s', '3 min', '3 h'], correct: '3 min' },
  { id: 'clignement', emoji: '👁️', label: 'Un clignement d’yeux', options: ['1 s', '1 min', '1 h'], correct: '1 s' },
  { id: 'film', emoji: '🎬', label: 'Un film au cinéma', options: ['2 min', '2 h', '2 j'], correct: '2 h' },
];

const TRAP_Q = {
  q: 'Léa a couru pendant « 1,5 minute ». Est-ce la même chose que 1 min 50 s ?',
  options: [
    'Oui : 1,5 minute = 1 minute et 50 secondes',
    'Non : 1,5 minute = 1 minute et 30 secondes, car la moitié d’une minute vaut 30 s',
  ],
  correct: 1,
  explain:
    'Une minute vaut 60 secondes : sa MOITIÉ vaut 30 s, pas 50. Le temps ne compte pas en dixièmes comme les longueurs — ici, tout marche par 60. C’est le grand secret de cette leçon.',
};

/**
 * ACTION      attraper la grande aiguille et la faire tourner.
 * CHANGE      l'heure avance, la petite aiguille suit, le compteur du tour
 *             monte — et retombe à 0 au passage du 12.
 * OBSERVATION la retenue se fait à 60, pas à 100 : elle est mécanique.
 * SENS        le temps n'est pas décimal, d'où l'interdit « 1 h 30 = 1,30 h ».
 *
 * Validé quand l'élève a franchi le 12 au moins une fois — c'est-à-dire
 * quand il a PRODUIT la retenue, pas quand il l'a lue.
 */
function ChronoLab({ react, solved, onSolved }) {
  const [elapsed, setElapsed] = useState(0);
  const [maxVu, setMaxVu] = useState(0);
  const done = solved || maxVu >= 60;

  const change = (v) => {
    setElapsed(v);
    setMaxVu((m) => Math.max(m, v));
  };

  /* Le signal part d'un EFFET, jamais de l'updater de setState : appeler
     `react` (un setState du parent) depuis l'updater d'un enfant met à jour
     un composant pendant le rendu d'un autre. */
  React.useEffect(() => {
    if (maxVu >= 60 && !solved) { react(true); onSolved?.(); }
  }, [maxVu, solved, react, onSolved]);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        La course part à <strong>9 h 00</strong>. Attrape la{' '}
        <strong className="text-rose-600">grande aiguille</strong> et fais-lui faire au moins un tour complet.
        Surveille les deux compteurs pendant qu'elle passe sur le 12.
      </p>
      <CadranAccumulateur
        start={DEPART}
        elapsed={elapsed}
        onChange={change}
        maxElapsed={4 * 60}
      />
      {done && (
        <Feedback tone="ok">
          Un tour complet de la grande aiguille, et la petite a avancé d'exactement une graduation : le
          compteur du tour est passé de 55 à 0 pendant que le compte de tours passait à 1. Fais-en un
          deuxième, ou reviens en arrière : la retenue se fait toujours au même endroit.
        </Feedback>
      )}
    </div>
  );
}

export default function Module01Mission() {
  const [chronoDone, setChronoDone] = useState(false);
  const [pred, setPred] = useState(null);
  const [unitsDone, setUnitsDone] = useState(false);
  const [estimDone, setEstimDone] = useState(false);
  const [trapDone, setTrapDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La course contre la montre"
      moduleSubtitle="Fais tourner le chronomètre : le temps s’accumule, mais pas comme tu crois."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Léa prépare sa journée de compétition d’athlétisme.',
        body: <p>Le chronomètre officiel part à 9 h 00. Fais-le tourner toi-même : tu vas voir tout de suite ce qui distingue le temps de toutes les autres grandeurs.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Le chronomètre de la course',
          subtitle: 'Fais tourner la grande aiguille : le temps s’accumule sous ton doigt.',
          done: chronoDone,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="quand la grande aiguille repassera sur le 12, qu’affichera le compteur du tour ?"
                options={[
                  { id: 'cent', label: '100 min' },
                  { id: 'soixante', label: 'Il repartira de 0, et l’heure avancera' },
                  { id: 'dix', label: '10 min' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={chronoDone}
              />
              <ChronoLab react={kit.react} solved={chronoDone} onSolved={() => setChronoDone(true)} />
              {chronoDone && (
                <Feedback tone="ok">
                  {pred === 'soixante'
                    ? 'Ta prédiction tenait : '
                    : pred
                      ? 'Ta prédiction annonçait autre chose, et pourtant : '
                      : ''}
                  le compteur du tour ne dépasse jamais 59. À 60, il retombe à 0 et l'heure gagne 1 — c'est
                  le mécanisme lui-même qui l'impose. Retiens ce nombre : <strong>60</strong>, et pas 100.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À chaque durée, son unité',
          done: unitsDone,
          content: (
            <div className="space-y-5">
            <BatchChoiceQuestion
              requires={[]}
              intro={
                <p className="text-sm text-slate-600">
                  Seconde, minute, heure, jour : choisis l'unité la plus naturelle pour chaque durée.
                </p>
              }
              rows={UNIT_ROWS.map((it) => ({
                id: it.id,
                label: (
                  <>
                    <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                    <span>{it.label}</span>
                  </>
                ),
                options: UNIT_OPTIONS,
                correct: UNIT_OPTIONS.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={unitsDone}
              onAnswered={() => setUnitsDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Un sprint se compte en secondes, un cours en minutes, une nuit en heures, des vacances en jours :
                  quatre unités pour quatre échelles de temps.
                </Feedback>
              )}
            />
            {/* Le tri vient d'être fait à l'intuition : la brique fixe les
                quatre unités et leurs échelles. */}
            {unitsDone && (
              <KnowledgeBrick
                id="unites-temps"
                variant="new"
                lead="Ces quatre unités sont celles de toute la leçon — voici l’échelle de chacune."
              />
            )}
            </div>
          ),
        },
        {
          // Le titre était « Le bon ordre de grandeur » : StepCard l'affiche
          // AVANT que l'étape ne s'ouvre, si bien que le mot arrivait avant
          // que rien ne l'ait posé. Titre neutre, mot posé par la brique.
          num: 3,
          title: 'Réaliste, ou pas du tout ?',
          done: estimDone,
          content: (
            <div className="space-y-5">
            <BatchChoiceQuestion
              requires={['unites-temps']}
              intro={<p className="text-sm text-slate-600">Estime chaque durée : une seule proposition est réaliste.</p>}
              rows={ESTIM_ROWS.map((it) => ({
                id: it.id,
                label: (
                  <>
                    <span className="text-2xl" aria-hidden="true">{it.emoji}</span>
                    <span>{it.label}</span>
                  </>
                ),
                options: it.options,
                correct: it.options.indexOf(it.correct),
                correction: <>→ {it.correct}</>,
              }))}
              solved={estimDone}
              onAnswered={() => setEstimDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Chacune des propositions écartées était absurde : quelques secondes pour se brosser
                  les dents, une heure pour cligner des yeux.
                </Feedback>
              )}
            />
            {/* Le jugement rapide vient d'être exercé trois fois : la brique
                le nomme et en fait un réflexe réutilisable. */}
            {estimDone && (
              <KnowledgeBrick
                id="ordre-de-grandeur"
                variant="new"
                lead="Ce que tu viens de faire trois fois — juger « à peu près combien » — porte un nom."
              />
            )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Le piège de la virgule',
          done: trapDone,
          content: (
            <TapQuestion
              prompt={TRAP_Q.q}
              options={TRAP_Q.options}
              correct={TRAP_Q.correct}
              cols={1}
              explain={TRAP_Q.explain}
              requires={['unites-temps', 'ordre-de-grandeur']}
              solved={trapDone}
              onAnswered={() => setTrapDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu as vu l'aiguille repartir à 0 après 60 minutes. Reste à
          lire une heure sur un cadran sans se tromper — puis à comprendre pourquoi ce 60 vaut
          aussi entre les minutes et les secondes.
        </KnowledgeSnapshot>
      }
    />
  );
}
