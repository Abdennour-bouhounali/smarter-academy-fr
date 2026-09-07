import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLineLab from '../components/NumberLineLab';
import {
  fmt, ecart, ranger, amplitude, jourLePlusFroid, RELEVE, parseRelatif,
} from '../components/relatifs';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : un relevé de températures.
 *
 * Aucune connaissance nouvelle : le module TRANSFÈRE ce que les modules 1 à 5
 * ont établi vers une situation où les relatifs sont des données, pas des
 * exercices. Toutes les affirmations du module (jour le plus froid, plus
 * grande amplitude) sont CALCULÉES depuis RELEVE et vérifiées par
 * components/relatifs.test.js — aucune n'est écrite à la main.
 *
 * Les erreurs ici ne comptent jamais comme preuve de maîtrise
 * (stage practice_lab) : c'est un entraînement.
 */
const FROID = jourLePlusFroid();
const AMPLE = RELEVE.reduce((a, b) => (amplitude(b) > amplitude(a) ? b : a));
const MINIMA = RELEVE.map((j) => j.min);

export default function Module06LeReleveDeLaStation() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const Tableau = (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[320px]">
        <caption className="sr-only">Relevé des températures minimales et maximales de la semaine</caption>
        <thead>
          <tr className="bg-slate-100">
            <th scope="col" className="text-left p-2 font-semibold text-slate-700">Jour</th>
            <th scope="col" className="text-right p-2 font-semibold text-slate-700">Minimale</th>
            <th scope="col" className="text-right p-2 font-semibold text-slate-700">Maximale</th>
          </tr>
        </thead>
        <tbody>
          {RELEVE.map((j) => (
            <tr key={j.jour} className="border-t border-slate-200">
              <th scope="row" className="text-left p-2 font-medium text-slate-700">{j.jour}</th>
              <td className={`text-right p-2 tabular-nums font-bold ${j.min < 0 ? 'text-rose-600' : 'text-indigo-700'}`}>{fmt(j.min)} °C</td>
              <td className={`text-right p-2 tabular-nums font-bold ${j.max < 0 ? 'text-rose-600' : 'text-indigo-700'}`}>{fmt(j.max)} °C</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Le jour le plus froid',
      subtitle: 'Lis le tableau : cinq jours, une minimale et une maximale par jour.',
      done: q1,
      content: (
        <div className="space-y-3">
          {Tableau}
          <TapQuestion
            prompt="Quel jour a-t-on relevé la température la plus basse de la semaine ?"
            options={RELEVE.map((j) => j.jour)}
            correct={RELEVE.findIndex((j) => j.jour === FROID.jour)}
            cols={2}
            requires={['ordre-relatifs', 'droite-relatifs']}
            explain={`La plus basse est ${fmt(FROID.min)} °C, relevée ${FROID.jour.toLowerCase()}. Chez les négatifs, la température la plus basse est celle dont la distance à zéro est la PLUS GRANDE : ${fmt(FROID.min)} est plus froid que ${fmt(-4)}.`}
            explainWrong={`Attention au piège du chapitre : ${fmt(-4)} n’est pas plus froid que ${fmt(-11)}. Place les cinq minimales sur une droite graduée — la plus froide est la plus à gauche.`}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <NumberLineLab
                min={-12} max={2}
                value={null}
                marks={RELEVE.map((j) => ({ at: j.min, label: j.jour.slice(0, 3), color: '#e11d48' }))}
                ariaLabel="Droite graduée — les cinq températures minimales"
              />
              <Feedback tone="ok">
                Rangées, les minimales donnent : {ranger(MINIMA).map((n) => `${fmt(n)} °C`).join(' < ')}.
              </Feedback>
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les écarts de la journée',
      done: q2,
      content: (
        <div className="space-y-3">
          {Tableau}
          <NumericQuestion
            prompt={`${AMPLE.jour} : de combien de degrés la température a-t-elle monté entre la minimale (${fmt(AMPLE.min)} °C) et la maximale (${fmt(AMPLE.max)} °C) ?`}
            expected={amplitude(AMPLE)}
            parse={parseRelatif}
            requires={['ecart-deux-nombres', 'soustraction-oppose']}
            explain={`De ${fmt(AMPLE.min)} à ${fmt(AMPLE.max)}, il y a ${amplitude(AMPLE)} degrés : ${fmt(AMPLE.max)} − ${fmt(AMPLE.min)} = ${amplitude(AMPLE)}. Un écart est une distance — jamais de signe.`}
            explainFor={(n) => (n === AMPLE.max + AMPLE.min
              ? <>Tu as additionné les deux températures. Pour un écart, on <strong>soustrait</strong> : la maximale moins la minimale.</>
              : n === -amplitude(AMPLE)
                ? <>Le bon nombre de degrés, mais un écart ne porte pas de signe : c’est une distance.</>
                : null)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Vrai ou faux ?',
      done: q3,
      content: (
        <div className="space-y-3">
          {Tableau}
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Pour chaque affirmation sur le relevé, dis si elle est <strong>vraie</strong> ou <strong>fausse</strong>.</p>}
            rows={[
              {
                id: 'v1',
                label: `Mardi (${fmt(RELEVE[1].min)} °C) a été plus froid que lundi (${fmt(RELEVE[0].min)} °C).`,
                options: ['Vrai', 'Faux'],
                correct: 1,
                correction: `Faux : ${fmt(RELEVE[1].min)} > ${fmt(RELEVE[0].min)}, donc mardi a été moins froid. Sur la droite, ${fmt(RELEVE[1].min)} est à droite de ${fmt(RELEVE[0].min)}.`,
              },
              {
                id: 'v2',
                label: `Vendredi, la température maximale a atteint zéro sans le dépasser.`,
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction: `Vrai : la maximale de vendredi est ${fmt(RELEVE[4].max)} °C — exactement le zéro, qui n’est ni positif ni négatif.`,
              },
              {
                id: 'v3',
                label: `Le jour le plus froid est aussi celui où l’écart entre minimale et maximale est le plus grand.`,
                options: ['Vrai', 'Faux'],
                correct: 1,
                correction: `Faux : le plus froid est ${FROID.jour.toLowerCase()} (${fmt(FROID.min)} °C), mais le plus grand écart est celui de ${AMPLE.jour.toLowerCase()} (${amplitude(AMPLE)} °C contre ${amplitude(FROID)} °C). Être bas et beaucoup varier sont deux choses différentes.`,
              },
              {
                id: 'v4',
                label: `Jeudi, la température est passée d’un côté à l’autre du zéro.`,
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction: `Vrai : de ${fmt(RELEVE[3].min)} °C à ${fmt(RELEVE[3].max)} °C, elle a franchi le zéro — soit un écart de ${ecart(RELEVE[3].min, RELEVE[3].max)} degrés.`,
              },
            ]}
            requires={['ordre-relatifs', 'ecart-deux-nombres', 'nombre-relatif', 'distance-a-zero']}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le relevé de la station"
      moduleSubtitle="Des relatifs qui viennent du réel"
      estimatedTime="8 min"
      brief={{
        tag: 'Entraînement',
        title: 'Une semaine en montagne',
        tone: 'slate',
        body: (
          <p>
            Voici le relevé d’une station de montagne : cinq jours, une température minimale et une
            maximale par jour. Tout ce que tu as appris sert ici — lire, comparer, mesurer un écart.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
