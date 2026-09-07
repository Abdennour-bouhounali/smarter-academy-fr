import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { CrossTableView, conditionalFrequency, formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { enqueteTable, TRANSPORTS } from '../data';

/**
 * Module 2 — DÉCOUVERTE : nommer les trois fréquences par leur dénominateur.
 *
 * La propriété qui distingue la conditionnelle des deux autres, et qui sert
 * de vérification : les conditionnelles selon UNE MÊME condition somment à 1
 * (on a réparti tout le groupe de référence), alors que les conjointes
 * somment à 1 sur le tableau ENTIER.
 */
const T = enqueteTable();

export default function Module02MarginaleConjointeConditionnelle() {
  const [mode, setMode] = useState('counts');
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const somme2de = TRANSPORTS.reduce((a, t) => a + conditionalFrequency(T, { axis: 'col', key: '2de' }, t), 0);

  const steps = [
    {
      num: 1,
      title: 'Trois noms, trois dénominateurs',
      done: true,
      content: (
        <div className="space-y-3">
          {/* Les trois dénominateurs ont déjà été manipulés au module 1 : ici
              on ne fait que leur donner leur nom, avant toute demande. */}
          <KnowledgeBrick
            id="trois-frequences"
            variant="new"
            lead={<>Au module précédent tu as changé trois fois de référence sans les nommer. Voici les trois noms, chacun attaché à son dénominateur.</>}
          />
          <Feedback tone="info">
            Les trois utilisent le même numérateur ou presque : ce qui les distingue est <strong>ce par quoi on
            divise</strong>. Une phrase contenant « parmi les… » ou « des… » annonce toujours une conditionnelle.
          </Feedback>
        </div>
      ),
    },
    {
      num: 2,
      title: 'Des effectifs aux fréquences',
      subtitle: 'Bascule l’affichage du tableau et vérifie une valeur.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Affichage">
            {[
              { id: 'counts', l: 'Effectifs' },
              { id: 'joint', l: 'Fréquences conjointes (÷ 400)' },
            ].map((o) => (
              <button key={o.id} type="button" aria-pressed={mode === o.id}
                onClick={() => setMode(o.id)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  mode === o.id ? 'bg-violet-600 border-violet-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-violet-400'
                }`}>
                {o.l}
              </button>
            ))}
          </div>
          <CrossTableView table={T} mode={mode} rowsTitle="Transport" colsTitle="Niveau"
            caption="Enquête sur 400 lycéens" />
          <NumericQuestion
            prompt="Quelle est la fréquence MARGINALE des élèves de terminale, en pourcentage ?"
            expected={20} suffix="%"
            requires={['trois-frequences', 'population-reference', 'quotient', 'pourcentage', 'effectif', 'tableau-double-entree']}
            explain="80 élèves de terminale sur 400 enquêtés : 80 ÷ 400 = 0,20 = 20 %. Une fréquence marginale se rapporte toujours au TOTAL."
            explainFor={(n) => (n === 80
              ? '80 est l’effectif, pas la fréquence : il reste à le rapporter au total, 80 ÷ 400 = 20 %.'
              : 'On divise l’effectif marginal par le total général : 80 ÷ 400 = 20 %.')}
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La somme qui vaut 1',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La répartition des 200 élèves de 2de est sous les yeux : c'est le
              moment de dire ce qu'elle vaut, avant de le faire vérifier. */}
          <KnowledgeBrick
            id="somme-conditionnelles"
            variant="new"
            compact
            lead={<>Tu viens de calculer une fréquence sur une référence choisie. Regarde ce qui se passe quand on les prend TOUTES sur la même référence.</>}
          />
          <BatchChoiceQuestion
            intro={(
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                Parmi les 200 élèves de 2de : {formatPercent(conditionalFrequency(T, { axis: 'col', key: '2de' }, 'bus'), 0)} en bus,
                {' '}{formatPercent(conditionalFrequency(T, { axis: 'col', key: '2de' }, 'vélo'), 0)} à vélo,
                {' '}{formatPercent(conditionalFrequency(T, { axis: 'col', key: '2de' }, 'voiture'), 0)} en voiture,
                {' '}{formatPercent(conditionalFrequency(T, { axis: 'col', key: '2de' }, 'à pied'), 0)} à pied.
              </p>
              <p className="text-sm font-semibold text-slate-700">Vrai ou faux ?</p>
            </div>
          )}
            requires={['somme-conditionnelles', 'trois-frequences', 'population-reference', 'denominateur']}
            rows={[
            { id: 's1', label: 'Ces quatre pourcentages somment à 100 %', options: ['Vrai', 'Faux'], correct: 0, correction: `Ils répartissent tout le groupe de référence : ${formatPercent(somme2de, 0)}.` },
            { id: 's2', label: 'Les quatre fréquences CONJOINTES du bus somment aussi à 100 %', options: ['Vrai', 'Faux'], correct: 1, correction: 'Non : les conjointes ne somment à 1 que sur le tableau ENTIER, pas sur une ligne.' },
            { id: 's3', label: 'Les fréquences marginales des quatre transports somment à 100 %', options: ['Vrai', 'Faux'], correct: 0, correction: 'Chaque enquêté a exactement un mode de transport : 40 + 20 + 22,5 + 17,5 = 100 %.' },
            { id: 's4', label: 'On peut additionner une conditionnelle « parmi les 2de » et une « parmi les 1re »', options: ['Vrai', 'Faux'], correct: 1, correction: 'Non : elles n’ont pas le même dénominateur, la somme ne représenterait rien.' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Une somme de fréquences n’a de sens que
              si elles partagent le <strong>même dénominateur</strong>. C’est ce qui fait des conditionnelles
              « selon une même condition » une répartition — et interdit d’en additionner deux prises sous des
              conditions différentes.
            </Feedback>
          )}
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Marginale, conjointe, conditionnelle" moduleSubtitle="Trois noms pour trois dénominateurs" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'Par quoi divise-t-on ?', tone: 'violet',
        body: <p>Les trois fréquences se ressemblent au numérateur et se distinguent au dénominateur. Les nommer, c’est surtout savoir de quel groupe on parle.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Un piège arrive.</strong> « Parmi les A, les B » et « parmi les B, les A » se ressemblent
          en français et n’ont rien à voir en mathématiques. Module suivant.
        </KnowledgeSnapshot>
      )}
    />
  );
}
