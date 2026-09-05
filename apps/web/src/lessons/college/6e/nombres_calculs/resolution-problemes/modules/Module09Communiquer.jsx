import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import AnswerBuilder from '../../../../../common/components/AnswerBuilder';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 9 — practice lab, reconstruit sur le lesson kit.
 *
 * Une réponse mathématique complète : résultat + unité + phrase. AnswerBuilder
 * reste une manipulation maison en deux temps (pas d'état faux sur le
 * résultat/l'unité, une vraie question sur la phrase finale).
 */

/* ─── Étape 2 : détecter une mauvaise unité ──────────────────────── */
const UNIT_ERRORS = [
  { claim: '« Il reste 157 €. »', context: 'La question portait sur un nombre de crayons.', wrong: 'unité (€ au lieu de crayons)' },
  { claim: '« Le trajet mesure 2,5 L. »', context: 'La question portait sur une distance.', wrong: 'unité (L au lieu de km)' },
  { claim: '« Il faut 4 étudiants. »', context: 'La question portait sur un nombre de bus.', wrong: 'unité (étudiants au lieu de bus)' },
];

function DetectionUnite({ done, setDone, solved, onAnswered }) {
  return (
    <div className="space-y-5">
      {UNIT_ERRORS.map((e, i) =>
        i === 0 || done.includes(i - 1) ? (
          <div key={e.claim} className="border-2 border-amber-200 bg-amber-50/50 rounded-2xl p-4 space-y-3">
            <p className="text-sm text-slate-700">{e.context}</p>
            <p className="text-base font-semibold text-slate-800 italic">{e.claim}</p>
            <TapQuestion
              prompt="Quel est le problème avec cette réponse ?"
              options={['Le résultat numérique est faux', "L'unité ne correspond pas à ce que demande la question", 'La phrase est mal écrite']}
              correct={1}
              cols={1}
              explain={`Le nombre peut être juste, mais l'${e.wrong} rend la réponse fausse dans son ensemble. La communication mathématique exige la bonne unité.`}
              solved={done.includes(i) || solved}
              onAnswered={() => {
                const next = done.includes(i) ? done : [...done, i];
                setDone(next);
                if (next.length === UNIT_ERRORS.length) onAnswered();
              }}
            />
          </div>
        ) : null
      )}
    </div>
  );
}

/* ─── Étape 3 : la vraie question ─────────────────────────────────── */
const VRAIE_Q_Q = {
  q: '« Un magasin a reçu 320 objets. Il en vend 45 par jour. Après combien de jours tous les objets seront-ils vendus ? » Un élève répond : « 45 × 7 = 315 ». Cette réponse répond-elle à la question posée ?',
  options: [
    'Oui, le calcul est juste donc la réponse est bonne',
    "Non : la question demande un nombre de JOURS, pas un nombre d'objets — même avec un calcul correct, la réponse ne répond pas à la vraie question",
  ],
  correct: 1,
  explain: "Un calcul peut être juste sans répondre à la question posée. Ici il fallait répondre « 7 jours » (avec un reste à interpréter), pas donner 315 sans phrase. Toujours se demander : « Ma réponse dit-elle ce qu'on m'a demandé ? »",
};

export default function Module09Communiquer() {
  const [s1, setS1] = useState(false);
  const [unitDone, setUnitDone] = useState([]);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(9)}
      moduleNumber={9}
      moduleTitle="Communiquer une réponse"
      moduleSubtitle="Un nombre seul n'est pas toujours une réponse complète."
      estimatedTime="7 min"
      brief={{
        tag: '✍️ Communiquer',
        title: 'Trouver le bon nombre ne suffit pas.',
        body: <p>Une réponse mathématique complète a un résultat, une unité, et une phrase qui répond vraiment à la question.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Construis une réponse complète',
          done: s1,
          content: (
            <div className="space-y-4">
              <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
                Rappel : 8 boîtes de 24 crayons, 35 distribués → il reste 157 crayons. Construis une réponse
                COMPLÈTE.
              </p>
              <AnswerBuilder
                value={157}
                unitOptions={['crayons', '€', 'kg']}
                correctUnit="crayons"
                sentenceOptions={['157', 'Il reste 157 crayons.', 'Il reste 157 €.']}
                correctSentenceIndex={1}
                solved={s1}
                onSolved={() => setS1(true)}
                hint="La question porte sur des crayons : vérifie le nombre ET l'unité."
              />
              {s1 && (
                <Feedback tone="info">
                  « 157 » seul n'est pas une réponse complète : il faut le RÉSULTAT, l'UNITÉ, et une PHRASE qui
                  répond vraiment à la question posée.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Détecte les mauvaises unités',
          done: s2,
          content: <DetectionUnite done={unitDone} setDone={setUnitDone} solved={s2} onAnswered={() => setS2(true)} />,
        },
        {
          num: 3,
          title: 'Répond-on vraiment à la question ?',
          done: s3,
          content: (
            <TapQuestion
              prompt={VRAIE_Q_Q.q}
              options={VRAIE_Q_Q.options}
              correct={VRAIE_Q_Q.correct}
              cols={1}
              explain={VRAIE_Q_Q.explain}
              solved={s3}
              onAnswered={() => setS3(true)}
            />
          ),
        },
      ]}
    />
  );
}
