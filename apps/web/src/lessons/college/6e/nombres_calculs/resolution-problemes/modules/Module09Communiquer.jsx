import React, { useState } from 'react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import AnswerBuilder from '../../../../../common/components/AnswerBuilder';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/* ─── Étape 1 : construire une réponse complète ──────────────────── */
function ReponseComplete({ solved, onSolved }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Rappel : 8 boîtes de 24 crayons, 35 distribués → il reste 157 crayons. Construis une réponse COMPLÈTE.
      </p>
      <AnswerBuilder
        value={157}
        unitOptions={['crayons', '€', 'kg']}
        correctUnit="crayons"
        sentenceOptions={['157', 'Il reste 157 crayons.', 'Il reste 157 €.']}
        correctSentenceIndex={1}
        solved={solved}
        onSolved={onSolved}
        hint="La question porte sur des crayons : vérifie le nombre ET l'unité."
      />
      {solved && (
        <Feedback tone="info">
          « 157 » seul n'est pas une réponse complète : il faut le RÉSULTAT, l'UNITÉ, et une PHRASE qui répond
          vraiment à la question posée.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 2 : détecter une mauvaise unité ──────────────────────── */
const UNIT_ERRORS = [
  { claim: '« Il reste 157 €. »', context: 'La question portait sur un nombre de crayons.', wrong: 'unité (€ au lieu de crayons)' },
  { claim: '« Le trajet mesure 2,5 L. »', context: 'La question portait sur une distance.', wrong: 'unité (L au lieu de km)' },
  { claim: '« Il faut 4 étudiants. »', context: 'La question portait sur un nombre de bus.', wrong: 'unité (étudiants au lieu de bus)' },
];

function DetectionUnite({ solved, onSolved }) {
  const [done, setDone] = useState([]);

  return (
    <div className="space-y-5">
      {UNIT_ERRORS.map((e, i) => (
        <ErrorCard key={e.claim} item={e} solved={done.includes(i)} onSolved={() => {
          const next = done.includes(i) ? done : [...done, i];
          setDone(next);
          if (next.length === UNIT_ERRORS.length) onSolved?.();
        }} />
      ))}
    </div>
  );
}

function ErrorCard({ item, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correct = 1;

  return (
    <div className="border-2 border-amber-200 bg-amber-50/50 rounded-2xl p-4 space-y-3">
      <p className="text-sm text-slate-700">{item.context}</p>
      <p className="text-base font-semibold text-slate-800 italic">{item.claim}</p>
      <p className="text-sm font-semibold text-slate-700">Quel est le problème avec cette réponse ?</p>
      <ChoiceGrid
        options={['Le résultat numérique est faux', `L'unité ne correspond pas à ce que demande la question`, 'La phrase est mal écrite']}
        selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={1}
      />
      {!revealed && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved?.(); }} disabled={pick === null} tone="amber">Valider</ValidateButton>
        </div>
      )}
      {revealed && (
        <Feedback tone={pick === correct ? 'ok' : 'ko'}>
          Le nombre peut être juste, mais l'{item.wrong} rend la réponse fausse dans son ensemble. La communication mathématique exige la bonne unité.
          {pick !== correct && (
            <>
              {' '}
              <button type="button" onClick={() => { setRevealed(false); setPick(null); }} className="underline font-semibold">Réessayer</button>
            </>
          )}
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : la vraie question ─────────────────────────────────── */
const VRAIE_Q_Q = {
  q: '« Un magasin a reçu 320 objets. Il en vend 45 par jour. Après combien de jours tous les objets seront-ils vendus ? » Un élève répond : « 45 × 7 = 315 ». Cette réponse répond-elle à la question posée ?',
  options: [
    "Oui, le calcul est juste donc la réponse est bonne",
    "Non : la question demande un nombre de JOURS, pas un nombre d'objets — même avec un calcul correct, la réponse ne répond pas à la vraie question",
  ],
  correct: 1,
  explain: "Un calcul peut être juste sans répondre à la question posée. Ici il fallait répondre « 7 jours » (avec un reste à interpréter), pas donner 315 sans phrase. Toujours se demander : « Ma réponse dit-elle ce qu'on m'a demandé ? »",
};

export default function Module09Communiquer() {
  const navLinks = getNavLinks(9);
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [vraiePick, setVraiePick] = useState(null);
  const [vraieRevealed, setVraieRevealed] = useState(false);

  const s3 = vraieRevealed && vraiePick === VRAIE_Q_Q.correct;
  const allDone = s1 && s2 && s3;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Communiquer une réponse"
      moduleSubtitle="Un nombre seul n'est pas toujours une réponse complète."
      moduleNumber={9}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="✍️ Communiquer" title="Trouver le bon nombre ne suffit pas.">
          <p>Une réponse mathématique complète a un résultat, une unité, et une phrase qui répond vraiment à la question.</p>
        </MissionBrief>

        <StepCard num={1} title="Construis une réponse complète" done={s1}>
          <ReponseComplete solved={s1} onSolved={() => setS1(true)} />
        </StepCard>

        <StepCard num={2} title="Détecte les mauvaises unités" done={s2} locked={!s1}>
          <DetectionUnite solved={s2} onSolved={() => setS2(true)} />
        </StepCard>

        <StepCard num={3} title="Répond-on vraiment à la question ?" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">{VRAIE_Q_Q.q}</p>
            <ChoiceGrid options={VRAIE_Q_Q.options} selected={vraiePick} onSelect={setVraiePick} revealed={vraieRevealed} correctIndex={VRAIE_Q_Q.correct} cols={1} />
            {!vraieRevealed && (
              <div className="text-center">
                <ValidateButton onClick={() => setVraieRevealed(true)} disabled={vraiePick === null}>Valider</ValidateButton>
              </div>
            )}
            {vraieRevealed && (
              <Feedback tone={vraiePick === VRAIE_Q_Q.correct ? 'ok' : 'ko'}>
                {VRAIE_Q_Q.explain}
                {vraiePick !== VRAIE_Q_Q.correct && (
                  <>
                    {' '}
                    <button type="button" onClick={() => { setVraieRevealed(false); setVraiePick(null); }} className="underline font-semibold">Réessayer</button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
