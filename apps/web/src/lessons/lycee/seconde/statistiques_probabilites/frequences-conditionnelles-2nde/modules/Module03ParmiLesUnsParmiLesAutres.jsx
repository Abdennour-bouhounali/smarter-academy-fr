import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { CrossTableView, conditionalFrequency, formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { enqueteTable } from '../data';

/**
 * Module 3 — DÉCOUVERTE : « parmi les A, les B » ≠ « parmi les B, les A ».
 *
 * C'est l'erreur d'inversion, préfiguration exacte de la confusion
 * P(A|B) / P(B|A) que traiteront les leçons de probabilités. On la fait
 * constater sur une case dont les deux conditionnelles sont franchement
 * différentes (50 % contre 62,5 %), puis sur un cas où l'écart est spectaculaire.
 *
 * Le module fait aussi le lien promis par la leçon précédente : comparer des
 * sous-populations de tailles différentes exige des conditionnelles, jamais
 * des effectifs bruts.
 */
const T = enqueteTable();
const P_BUS_SACHANT_2DE = conditionalFrequency(T, { axis: 'col', key: '2de' }, 'bus');
const P_2DE_SACHANT_BUS = conditionalFrequency(T, { axis: 'row', key: 'bus' }, '2de');

export default function Module03ParmiLesUnsParmiLesAutres() {
  const [cond, setCond] = useState('col');
  const [seen, setSeen] = useState(() => new Set(['col']));
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = seen.size >= 2;
  const done2 = q2;
  const done3 = q3;

  const toggle = (c, react) => {
    setCond(c);
    const next = new Set(seen); next.add(c); setSeen(next);
    if (!done1 && next.size >= 2) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Inverser la condition',
      subtitle: 'Même case (100 élèves), deux conditions opposées. Bascule et compare.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="« la part du bus parmi les 2de » et « la part des 2de parmi les usagers du bus » : est-ce le même nombre ?"
            options={[
              { id: 'oui', label: 'Oui, c’est la même case' },
              { id: 'non', label: 'Non, ce sont deux questions différentes' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Condition">
            {[
              { id: 'col', l: 'Parmi les élèves de 2de…' },
              { id: 'row', l: 'Parmi les usagers du bus…' },
            ].map((o) => (
              <button key={o.id} type="button" aria-pressed={cond === o.id}
                onClick={() => toggle(o.id, kit.react)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  cond === o.id ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                }`}>
                {o.l}
              </button>
            ))}
          </div>
          <CrossTableView table={T} mode="conditional"
            highlight={cond === 'col' ? { axis: 'col', key: '2de' } : { axis: 'row', key: 'bus' }}
            rowsTitle="Transport" colsTitle="Niveau"
            caption="La zone colorée est la population de référence" />
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5">
            <p className="font-mono text-sm text-sky-900">
              {cond === 'col'
                ? <>100 / 200 = <strong className="text-lg">{formatPercent(P_BUS_SACHANT_2DE, 1)}</strong> — parmi les 2de, la part du bus</>
                : <>100 / 160 = <strong className="text-lg">{formatPercent(P_2DE_SACHANT_BUS, 1)}</strong> — parmi les usagers du bus, la part des 2de</>}
            </p>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'non' ? 'Ta prédiction tenait' : 'Regarde les deux résultats'} :
              {' '}<strong>{formatPercent(P_BUS_SACHANT_2DE, 1)}</strong> contre
              {' '}<strong>{formatPercent(P_2DE_SACHANT_BUS, 1)}</strong>. Même numérateur, dénominateurs différents
              (200 élèves de 2de, 160 usagers du bus). <strong>Inverser la condition change la question</strong> —
              et donc la réponse.
              {' '}<span className="text-slate-500">Rebascule autant que tu veux.</span>
            </Feedback>
          ) : (
            <Feedback tone="info">Essaie les deux conditions.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un écart spectaculaire',
      done: done2,
      content: (
        <TapQuestion
          prompt="Dans une ville, 90 % des accidents graves impliquent une voiture. Un journal en conclut : « 90 % des trajets en voiture finissent en accident grave ». Qu’en penser ?"
          options={[
            'C’est une inversion de la condition : « parmi les accidents, la part de voitures » n’est pas « parmi les trajets en voiture, la part d’accidents »',
            'C’est correct : ce sont deux façons de dire la même chose',
            'C’est correct si le nombre de voitures est grand',
            'C’est impossible à trancher',
          ]}
          correct={0} cols={1}
          explain="Les deux phrases ont le même numérateur (les accidents graves en voiture) mais des dénominateurs sans commune mesure : quelques milliers d’accidents d’un côté, des millions de trajets de l’autre. La seconde fréquence est minuscule. C’est exactement l’erreur du module précédent, portée à l’absurde."
          explainWrong="Regarde les dénominateurs : « parmi les accidents » compte des accidents, « parmi les trajets » compte des trajets. Ces deux groupes n’ont ni la même taille ni le même sens."
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Comparer des sous-populations',
      done: done3,
      content: (
        <NumericQuestion
          prompt="Parmi les 80 élèves de terminale, 40 viennent en voiture. Quelle est cette fréquence conditionnelle, en pourcentage ?"
          expected={50} suffix="%"
          above={(revealed) => (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900 space-y-1">
              <p>Rappel : en 2de, 20 élèves sur 200 viennent en voiture, soit 10 %.</p>
              {revealed && <p className="text-xs">40 ÷ 80 = 0,5 = 50 % — cinq fois plus qu’en 2de.</p>}
            </div>
          )}
          explain="40 ÷ 80 = 50 %. En effectif brut, 40 élèves de terminale contre 20 de 2de, soit « deux fois plus » ; mais rapporté à chaque niveau, la part passe de 10 % à 50 %, soit CINQ fois plus. Comparer des groupes de tailles différentes exige les conditionnelles."
          explainFor={(n) => (n === 40
            ? '40 est l’effectif. La fréquence conditionnelle le rapporte à son groupe de référence : 40 ÷ 80 = 50 %.'
            : n === 10
              ? '10 % est la part de la voiture en 2de. Ici on demande la part parmi les TERMINALES : 40 ÷ 80 = 50 %.'
              : 'On divise par l’effectif de la population de référence : 40 ÷ 80 = 50 %.')}
          solved={done3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Parmi les uns, parmi les autres" moduleSubtitle="Inverser la condition change la question" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'L’erreur d’inversion', tone: 'sky',
        body: <p>« Parmi les A, la part de B » et « parmi les B, la part de A » se ressemblent en français. Elles n’ont ni le même dénominateur ni le même sens — et l’écart peut être spectaculaire.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Dans l’autre sens.</strong> Si l’on connaît les fréquences et l’effectif total, peut-on
          retrouver le tableau ? Module suivant : reconstruire les effectifs.
        </KnowledgeSnapshot>
      )}
    />
  );
}
