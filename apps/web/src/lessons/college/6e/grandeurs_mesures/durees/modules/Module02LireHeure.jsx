import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ClockFace from '../components/ClockFace';
import { formatTime } from '../components/durationUtils';

/**
 * Module 2 — découverte : lire un INSTANT sur le cadran.
 *
 * Lire (deux cadrans, dont un entre les graduations), puis RÉGLER
 * soi-même l'horloge sur 16 h 30 — le geste du chef de gare. La double
 * notation 12 h / 24 h s'affiche sous le cadran pendant le réglage.
 */
const READ1 = { hours: 9, minutes: 15, options: ['9 h 15', '3 h 45', '9 h 03'], correct: 0, explain: 'Petite aiguille entre 9 et 10, grande aiguille sur le 3 (= 15 min) : il est 9 h 15.' };
const READ2 = { hours: 9, minutes: 47, options: ['9 h 47', '10 h 47', '9 h 09'], correct: 0, explain: 'La grande aiguille est entre 45 et 50 min (à 47), la petite APPROCHE du 10 sans y être : il est encore 9 h — 9 h 47.' };

const TARGET = { hours: 16, minutes: 30 };

const TABLEAU_Q = {
  q: 'Le tableau des départs affiche : « Bus scolaire — départ 14 h 05 ». Quelle horloge le montre ?',
  options: ['Horloge A', 'Horloge B', 'Horloge C'],
  correct: 1,
  explain:
    'À 14 h 05, la petite aiguille est juste après le 2 (14 h = 2 h de l’après-midi) et la grande sur le 1 (= 05 min). Lire un horaire, c’est lire un INSTANT — pas une durée.',
};

function SetChallenge({ react, solved, onSolved }) {
  const [time, setTime] = useState(solved ? TARGET : { hours: 15, minutes: 0 });
  const [checked, setChecked] = useState(solved);
  const isTarget = time.hours === TARGET.hours && time.minutes === TARGET.minutes;
  const done = solved || checked;

  const validate = () => {
    if (done) return;
    setChecked(true);
    react(isTarget);
    onSolved?.();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Le train part à <strong>16 h 30</strong>. Règle l'horloge de la gare : fais glisser la grande aiguille
        (ou utilise les boutons), puis valide.
      </p>
      <ClockFace
        hours={time.hours}
        minutes={time.minutes}
        mode={done ? 'display' : 'set'}
        onChange={setTime}
        showBothNotations
        disabled={done}
      />
      {!done && (
        <div className="text-center">
          <button
            type="button"
            onClick={validate}
            className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            C'est réglé !
          </button>
        </div>
      )}
      {done && (
        <Feedback tone={isTarget ? 'ok' : 'ko'}>
          {isTarget ? (
            <>Parfaitement réglé : <strong>16 h 30</strong> — la petite aiguille à mi-chemin entre 4 et 5, la grande sur le 6.</>
          ) : (
            <>
              Ton horloge indique {formatTime({ h: time.hours, min: time.minutes })}, le train part à{' '}
              <strong>16 h 30</strong> : la grande aiguille doit pointer le 6 (30 min) et la petite être à
              mi-chemin entre 4 et 5.
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

export default function Module02LireHeure() {
  const [read1Done, setRead1Done] = useState(false);
  const [read2Done, setRead2Done] = useState(false);
  const [setDone, setSetDone] = useState(false);
  const [tableauDone, setTableauDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Lire l’heure comme un chef de gare"
      moduleSubtitle="Deux aiguilles, deux notations : lire un instant sans se tromper."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'À la gare, une horloge mal lue = un train raté.',
        body: <p>Petite aiguille pour les heures, grande pour les minutes — et la notation 24 h des tableaux de départ.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Lis les cadrans',
          done: read1Done && read2Done,
          content: (
            <div className="space-y-6">
              <TapQuestion
                above={<ClockFace hours={READ1.hours} minutes={READ1.minutes} />}
                prompt="Quelle heure est-il ?"
                options={READ1.options}
                correct={READ1.correct}
                cols={3}
                explain={READ1.explain}
                solved={read1Done}
                onAnswered={() => setRead1Done(true)}
              />
              {read1Done && (
                <div className="border-t border-slate-100 pt-4">
                  <TapQuestion
                    above={<ClockFace hours={READ2.hours} minutes={READ2.minutes} />}
                    prompt="Et maintenant — attention, la grande aiguille est entre deux graduations…"
                    options={READ2.options}
                    correct={READ2.correct}
                    cols={3}
                    explain={READ2.explain}
                    solved={read2Done}
                    onAnswered={() => setRead2Done(true)}
                  />
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Règle l’horloge de la gare',
          done: setDone,
          content: (kit) => (
            <SetChallenge react={kit.react} solved={setDone} onSolved={() => setSetDone(true)} />
          ),
        },
        {
          num: 3,
          title: 'Le tableau des départs',
          done: tableauDone,
          content: (
            <TapQuestion
              above={
                <div className="grid grid-cols-3 gap-2" aria-hidden="true">
                  <div className="space-y-1">
                    <ClockFace hours={4} minutes={1} size={140} />
                    <p className="text-center text-xs text-slate-500">A</p>
                  </div>
                  <div className="space-y-1">
                    <ClockFace hours={14} minutes={5} size={140} />
                    <p className="text-center text-xs text-slate-500">B</p>
                  </div>
                  <div className="space-y-1">
                    <ClockFace hours={5} minutes={14} size={140} />
                    <p className="text-center text-xs text-slate-500">C</p>
                  </div>
                </div>
              }
              prompt={TABLEAU_Q.q}
              options={TABLEAU_Q.options}
              correct={TABLEAU_Q.correct}
              cols={3}
              explain={TABLEAU_Q.explain}
              solved={tableauDone}
              onAnswered={() => setTableauDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
          <Clock className="w-6 h-6 mx-auto text-sky-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Petite aiguille = heures, grande = minutes (chaque graduation-chiffre vaut 5 min). Après midi, on
            ajoute 12 : 4 h 30 de l'après-midi = 16 h 30.
          </p>
        </motion.div>
      }
    />
  );
}
