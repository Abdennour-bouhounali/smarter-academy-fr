import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { BoxPlot, median, interquartileRange, range as rangeOf } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { VILLES, BREST, TOULOUSE, EMBRUN } from '../data';

/**
 * Module 4 — MANIPULATION : à question donnée, indicateur adapté.
 *
 * L'élève choisit la ville qui répond à chaque question, et le module rend
 * visible que la réponse CHANGE avec la question — « le plus chaud » et
 * « le plus régulier » ne désignent pas la même ville. C'est l'usage réel
 * d'un résumé statistique : répondre à une question précise, pas classer
 * les séries une fois pour toutes.
 */
const QUESTIONS = [
  { id: 'chaud', q: 'Où fait-il le plus chaud en général ?', good: 'toulouse', ind: 'la médiane la plus haute', why: `Toulouse, médiane ${median(TOULOUSE)} °C.` },
  { id: 'regulier', q: 'Où le temps est-il le plus prévisible ?', good: 'brest', ind: 'l’écart interquartile le plus faible', why: `Brest, écart interquartile ${interquartileRange(BREST)} °C.` },
  { id: 'extreme', q: 'Où a-t-on relevé le jour le plus chaud ?', good: 'embrun', ind: 'le maximum', why: `Embrun, maximum ${Math.max(...EMBRUN)} °C.` },
  { id: 'contraste', q: 'Où l’écart entre le jour le plus froid et le plus chaud est-il le plus grand ?', good: 'embrun', ind: 'l’étendue', why: `Embrun, étendue ${rangeOf(EMBRUN)} °C.` },
];

export default function Module04ChoisirLeBonIndicateur() {
  const [answers, setAnswers] = useState({});
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = QUESTIONS.every((q) => answers[q.id]);
  const allRight = QUESTIONS.every((q) => answers[q.id] === q.good);

  const pick = (qid, vid, react) => {
    const next = { ...answers, [qid]: vid };
    setAnswers(next);
    if (QUESTIONS.every((q) => next[q.id])) react?.(QUESTIONS.every((q) => next[q.id] === q.good));
  };

  const series = VILLES.map((v) => ({ id: v.id, label: v.label, values: v.values, color: v.color }));

  const steps = [
    {
      num: 1,
      title: 'Quatre questions, quatre indicateurs',
      subtitle: 'Pour chaque question, désigne la ville — et remarque que la réponse change.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <BoxPlot series={series} domain={{ min: 4, max: 37 }} unit="°C" />
          <div className="space-y-2">
            {QUESTIONS.map((q) => {
              const picked = answers[q.id];
              const right = picked === q.good;
              return (
                <div key={q.id} className={`rounded-2xl border-2 p-3 space-y-2 ${
                  !picked ? 'border-slate-200 bg-white' : right ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-300 bg-rose-50/50'
                }`}>
                  <p className="text-sm font-semibold text-slate-700">{q.q}</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label={q.q}>
                    {VILLES.map((v) => (
                      <button key={v.id} type="button" aria-pressed={picked === v.id}
                        onClick={() => pick(q.id, v.id, kit.react)}
                        className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          picked === v.id
                            ? (right ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-rose-600 border-rose-700 text-white')
                            : 'bg-white border-slate-300 text-slate-700 hover:border-emerald-400'
                        }`}>
                        {v.label}
                      </button>
                    ))}
                  </div>
                  {picked && (
                    <p className={`text-xs ${right ? 'text-emerald-700' : 'text-rose-700'}`}>
                      On regarde <strong>{q.ind}</strong> → {q.why}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {done1 ? (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : 'Regarde les corrections ci-dessus.'} Trois villes, quatre questions,
              et <strong>trois réponses différentes</strong> : il n’existe pas de « meilleure » ville dans l’absolu.
              Un résumé statistique répond à une question précise — encore faut-il choisir le bon nombre.
              {' '}<span className="text-slate-500">Tu peux changer tes réponses.</span>
            </Feedback>
          ) : null}
          {/* Les quatre réponses viennent de montrer qu'une question précise
              appelle un indicateur précis : c'est l'instant pour nommer la
              règle, avant que l'étape 2 ne l'exige. */}
          {done1 && (
            <KnowledgeBrick
              id="choisir-indicateur"
              variant="new"
              lead={<>Position pour « où ? », dispersion pour « à quel point est-ce régulier ? ». Tu viens de le vivre sur quatre questions.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quel nombre pour quelle question ?',
      done: q2,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm font-semibold text-slate-700">Associe chaque question à l’indicateur qui y répond.</p>}
          rows={[
            { id: 'i1', label: '« Quelle est la valeur centrale ? »', options: ['La médiane', 'L’étendue', 'Le maximum'], correct: 0, correction: 'La médiane partage l’effectif en deux.' },
            { id: 'i2', label: '« La série est-elle régulière ? »', options: ['L’écart interquartile', 'La médiane', 'Le minimum'], correct: 0, correction: 'Q3 − Q1 mesure la dispersion du cœur de la série.' },
            { id: 'i3', label: '« Quel est le cas le plus extrême ? »', options: ['Le maximum', 'La médiane', 'Q3'], correct: 0, correction: 'Seul le maximum le donne — c’est le bout de la moustache.' },
            { id: 'i4', label: '« Quel écart total entre les cas extrêmes ? »', options: ['L’étendue', 'L’écart interquartile', 'La médiane'], correct: 0, correction: 'Étendue = maximum − minimum, d’une pointe à l’autre.' },
          ]}
          requires={['choisir-indicateur', 'quartile', 'etendue', 'dispersion']}
          feedback={({ allRight: ar, nCorrect, total }) => (
            <Feedback tone={ar ? 'ok' : 'ko'}>
              {ar ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Deux familles : les indicateurs de
              <strong> position</strong> (médiane, quartiles) et ceux de <strong>dispersion</strong>
              {' '}(étendue, écart interquartile). Une comparaison sérieuse en croise toujours un de chaque.
            </Feedback>
          )}
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Interpréter en contexte',
      done: q3,
      content: (
        <div className="space-y-3">
        <TapQuestion
          prompt="Un organisateur de festival en plein air veut minimiser le risque de mauvaise surprise météo. Quel critère doit-il privilégier ?"
          options={[
            'Une faible dispersion : une boîte étroite et des moustaches courtes, donc Brest',
            'La médiane la plus haute, donc Toulouse',
            'Le maximum le plus élevé, donc Embrun',
            'L’étendue la plus grande, pour avoir toutes les possibilités',
          ]}
          correct={0} cols={1}
          requires={['choisir-indicateur', 'dispersion', 'etendue']}
          explain={`« Minimiser la surprise » est une question de RÉGULARITÉ, pas de niveau : c’est la dispersion qui répond. Brest a l’écart interquartile le plus faible (${interquartileRange(BREST)} °C) et l’étendue la plus courte (${rangeOf(BREST)} °C) : on sait à quoi s’attendre. Si la question avait été « où fait-il le plus chaud ? », la réponse aurait été Toulouse.`}
          explainWrong="Une médiane élevée ne protège pas des écarts, et une grande étendue est précisément ce qu’il faut éviter ici. Le critère de la prévisibilité est la dispersion."
          solved={q3} onAnswered={() => setQ3(true)}
        />
        {/* Capstone du module : le réflexe qui reste, une fois les trois
            étapes vécues. */}
        {q3 && (
          <KnowledgeBrick
            id="mem-boite"
            variant="new"
            lead={<>C’est ce réflexe qui va servir dans l’atelier et la mission finale.</>}
          />
        )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Choisir le bon indicateur" moduleSubtitle="La réponse dépend de la question" estimatedTime="12 min"
      brief={{
        tag: 'Manipulation', title: 'Pas de « meilleure » série', tone: 'emerald',
        body: <p>« Le plus chaud », « le plus régulier », « le plus extrême » : trois questions, trois nombres différents — et pas forcément la même ville.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Dernier entraînement.</strong> Des boîtes que tu n’as pas construites, dans des contextes
          variés — et un piège classique à repérer.
        </KnowledgeSnapshot>
      )}
    />
  );
}
