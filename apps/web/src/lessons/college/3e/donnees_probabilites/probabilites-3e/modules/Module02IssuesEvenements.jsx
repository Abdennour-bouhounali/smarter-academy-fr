import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EventBuilder from '../components/EventBuilder';
import { makeRng, formatDec } from '@smarter-academy/core';
import { ZERO, rollMany, sameSet, faceList, eventCount, totalOf, formatPct, eventFrequency } from '../components/probaUtils';

/**
 * Module 2 — DÉCOUVERTE : « Issues et événements ».
 *
 * Activity: composer un événement en touchant les faces qui le réalisent ;
 *   lire sa part sur une série de 1 000 lancers figée ; classer des
 *   événements impossibles, possibles, certains.
 * Mathematical objective: un ÉVÉNEMENT est un ensemble d'issues ; sa chance
 *   se lit sur le nombre de faces favorables et se mesure par un nombre entre
 *   0 (impossible) et 1 (certain).
 * Student action: toucher des faces, vérifier ; répondre.
 * Controlled variable: l'ensemble des faces retenues.
 * Mathematical state: `selected` (Set) par étape ; la série de 1 000 lancers
 *   est un instantané semé (SEED), calculé une fois — l'effectif et la
 *   fréquence de l'événement en sont dérivés.
 * Visual consequence: les barres de l'événement passent en indigo ; la lecture
 *   « k faces sur 6 » et « x fois sur 1 000 » suivent chaque touche.
 * Expected observation: « plus je retiens de faces, plus la part grandit ;
 *   aucune face → jamais ; six faces → toujours ».
 * Misconception targeted: confondre issue et événement ; croire que « plus
 *   de 4 » inclut le 4.
 * Feedback: l'écart est nommé (faces manquantes, faces en trop) ; révélation
 *   après 3 essais.
 * Formalization: « événement », « impossible / certain » — après le geste ;
 *   la fraction P = k/6 apparaît à la fin de l'étape 2 seulement.
 * Scaffolding: événement dicté et vérifié → prédiction sur la série → tri
 *   → comparaison sans manipulation.
 */

const SEED = 20260905 + 2;
const SERIES = rollMany(ZERO, 1000, makeRng(SEED)).counts;
const MAX_ATTEMPTS = 3;

const PAIR = [2, 4, 6];
const PONT = [5, 6];

function useEventTask(target) {
  const [selected, setSelected] = useState(() => new Set());
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState(null);
  const toggle = (f) => {
    if (done) return;
    setSelected((s) => { const n = new Set(s); if (n.has(f)) n.delete(f); else n.add(f); return n; });
    setMessage(null);
  };
  const check = (react) => {
    if (done) return;
    const ok = sameSet(selected, target);
    const n = attempts + 1;
    react?.(ok);
    if (ok) { setDone(true); setMessage({ tone: 'ok' }); return; }
    const missing = target.filter((f) => !selected.has(f));
    const extra = [...selected].filter((f) => !target.includes(f));
    if (n >= MAX_ATTEMPTS) {
      setSelected(new Set(target));
      setDone(true);
      setMessage({ tone: 'info', revealed: true, missing, extra });
      return;
    }
    setAttempts(n);
    setMessage({ tone: 'ko', missing, extra, left: MAX_ATTEMPTS - n });
  };
  return { selected, toggle, check, done, message, attempts };
}

export default function Module02IssuesEvenements() {
  const t1 = useEventTask(PAIR);
  const t2 = useEventTask(PONT);
  const [pontPred, setPontPred] = useState(false);
  const [sortDone, setSortDone] = useState(false);
  const [cmpDone, setCmpDone] = useState(false);
  const [defDone, setDefDone] = useState(false);

  const pontCount = eventCount(SERIES, PONT);
  const pontFreq = formatPct(eventFrequency(SERIES, PONT), totalOf(SERIES));

  const gap = (m) => (
    <>
      {m.missing.length > 0 && <>Il manque {m.missing.length > 1 ? 'les faces' : 'la face'} <strong>{faceList(m.missing)}</strong>. </>}
      {m.extra.length > 0 && <>{m.extra.length > 1 ? 'Les faces' : 'La face'} <strong>{faceList(m.extra)}</strong> ne {m.extra.length > 1 ? 'réalisent' : 'réalise'} pas l’événement. </>}
    </>
  );

  const taskUi = (task, kit, opts) => (
    <div className="space-y-3">
      <EventBuilder selected={task.selected} onToggle={task.toggle} disabled={task.done} {...opts} />
      {!task.done && (
        <ValidateButton onClick={() => task.check(kit.react)} disabled={task.selected.size === 0} tone="indigo">
          Vérifier mon événement
        </ValidateButton>
      )}
      {task.message?.tone === 'ko' && (
        <Feedback tone="ko">{gap(task.message)} Encore {task.message.left} essai{task.message.left > 1 ? 's' : ''}.</Feedback>
      )}
      {task.message?.revealed && (
        <Feedback tone="info">Pas grave, on te le montre : {gap(task.message)} Les bonnes faces sont maintenant retenues.</Feedback>
      )}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Issues et événements"
      moduleSubtitle="Touche les faces qui réalisent l’événement : sa part apparaît."
      estimatedTime="10 min"
      brief={{
        tag: '🎲 Mission 02',
        title: 'Avancer d’un nombre pair de cases',
        tone: 'sky',
        body: (
          <p>
            Nouvelle règle du jeu : tu ne peux avancer que si le dé donne un nombre pair. Quelles faces
            te font avancer ? Touche-les.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Obtenir un nombre pair',
          subtitle: 'Retiens toutes les faces qui réalisent l’événement, puis vérifie.',
          done: t1.done,
          content: (kit) => (
            <div className="space-y-3">
              {taskUi(t1, kit, { caption: 'Événement : « obtenir un nombre pair »' })}
              {t1.done && (
                <Feedback tone="ok">
                  Trois faces — 2, 4 et 6 — réalisent « obtenir un nombre pair ». Un <strong>événement</strong> n’est
                  pas une face : c’est un <strong>ensemble d’issues</strong>. Ici, 3 issues favorables sur 6 possibles.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Passer le pont : « plus de 4 »',
          subtitle: 'Compose l’événement, puis prédis sa part sur 1 000 lancers.',
          done: t2.done && pontPred,
          content: (kit) => (
            <div className="space-y-3">
              {taskUi(t2, kit, {
                caption: 'Événement : « obtenir plus de 4 »',
                counts: t2.done ? SERIES : null,
                showFrequency: pontPred,
                showFraction: pontPred,
              })}
              {t2.done && (
                <TapQuestion
                  prompt="Sur une série de 1 000 lancers, à peu près combien de fois l’événement « plus de 4 » va-t-il se réaliser ?"
                  options={[
                    'Environ 330 fois : 2 faces sur 6, c’est 1 fois sur 3',
                    'Environ 500 fois : une fois sur deux',
                    'Environ 670 fois : 4 est déjà « beaucoup »',
                  ]}
                  correct={0}
                  cols={1}
                  explain={
                    <>
                      Sur cette série, l’événement est arrivé <strong>{formatDec(pontCount)} fois</strong> ({pontFreq}). Deux
                      faces favorables sur six : la part attendue est 2/6 = 1/3, soit environ 333 sur 1 000. La
                      fréquence observée tourne autour — c’est ce que tu as vu au module 1.
                    </>
                  }
                  explainWrong={
                    <>
                      Compte les faces : « plus de 4 », ce sont 5 et 6 — deux faces sur six, soit 1 sur 3. Sur ta série
                      l’événement est arrivé <strong>{formatDec(pontCount)} fois</strong> ({pontFreq}), proche de 333.
                    </>
                  }
                  solved={pontPred}
                  onAnswered={() => setPontPred(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Impossible, possible, certain',
          subtitle: 'Pour chaque événement, dis sa chance : 0, entre les deux, ou 1.',
          done: sortDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-700">On lance un dé équilibré à six faces.</p>}
              rows={[
                { id: 'sept', label: '« Obtenir 7 »', options: ['0 (impossible)', 'entre 0 et 1', '1 (certain)'], correct: 0, correction: 'Aucune face ne donne 7 : impossible, chance 0.' },
                { id: 'sixmax', label: '« Obtenir 6 ou moins »', options: ['0 (impossible)', 'entre 0 et 1', '1 (certain)'], correct: 2, correction: 'Toutes les faces conviennent : certain, chance 1.' },
                { id: 'mult3', label: '« Obtenir un multiple de 3 »', options: ['0 (impossible)', 'entre 0 et 1', '1 (certain)'], correct: 1, correction: 'Les faces 3 et 6 : possible, mais pas certain.' },
                { id: 'sup0', label: '« Obtenir au moins 1 »', options: ['0 (impossible)', 'entre 0 et 1', '1 (certain)'], correct: 2, correction: 'Chaque face vaut au moins 1 : certain.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un événement <strong>impossible</strong> n’est
                  réalisé par aucune issue : sa chance vaut <strong>0</strong>. Un événement <strong>certain</strong> est réalisé
                  par toutes : sa chance vaut <strong>1</strong>. Tous les autres sont entre les deux.
                </Feedback>
              )}
              solved={sortDone}
              onAnswered={() => setSortDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Trois événements, trois chances',
          subtitle: 'Sans lancer, cette fois.',
          done: cmpDone && defDone,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt="Lequel de ces événements a le plus de chances de se réaliser en un lancer ?"
                options={['« Obtenir un nombre pair »', '« Obtenir plus de 4 »', '« Obtenir un 3 »', 'Ils ont tous la même chance']}
                correct={0}
                cols={1}
                explain="Trois faces favorables (2, 4, 6) contre deux (5, 6) contre une (3) : plus un événement est réalisé par d’issues, plus il a de chances. La chance se compte en issues favorables."
                solved={cmpDone}
                onAnswered={() => setCmpDone(true)}
              />
              {cmpDone && (
                <TapQuestion
                  prompt="Ce nombre entre 0 et 1 qui mesure la chance d’un événement s’appelle sa probabilité. Que dit une probabilité proche de 1 ?"
                  options={[
                    'Que l’événement a beaucoup de chances de se réaliser',
                    'Que l’événement se réalisera exactement une fois',
                    'Que l’événement est impossible',
                  ]}
                  correct={0}
                  cols={1}
                  explain="La probabilité mesure la POSSIBILITÉ qu’un événement se réalise : 0 pour l’impossible, 1 pour le certain, et entre les deux pour tout le reste — plus elle est proche de 1, plus l’événement est probable. Comment la calculer ? C’est le module suivant."
                  solved={defDone}
                  onAnswered={() => setDefDone(true)}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Une <strong>issue</strong> est un résultat possible (une face). Un <strong>événement</strong> est un ensemble
          d’issues. Sa <strong>probabilité</strong> est un nombre entre 0 et 1 qui mesure sa chance. Prochaine
          question : comment l’écrire exactement, avec une fraction ?
        </Feedback>
      }
    />
  );
}
