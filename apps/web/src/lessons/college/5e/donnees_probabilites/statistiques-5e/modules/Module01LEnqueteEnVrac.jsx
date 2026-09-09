import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DatasetLab from '../components/DatasetLab';
import { ENQUETE, datasetInit, tableau } from '../components/statistiques';

/**
 * Module 1 — DÉCLENCHEUR : douze réponses en vrac.
 *
 * Le module OUVRE sur la manipulation (§6bis, memory « M1 lab first ») :
 * l'élève reçoit les douze réponses brutes et doit répondre à une question
 * simple — « quel nombre de livres revient le plus souvent ? » — SANS aucun
 * outil. Il va compter à la main, se tromper ou hésiter, puis découvrir que
 * trier rend la réponse évidente.
 *
 * Expected observation : « en vrac, je dois tout relire et je perds le fil ;
 * une fois rangé, la réponse saute aux yeux — et ce sont pourtant les mêmes
 * douze nombres ».
 * Misconception targeted : croire que le tableau AJOUTE de l'information,
 * alors qu'il ne fait que la rendre lisible ; et confondre la valeur qui
 * revient le plus (2) avec le nombre de fois où elle revient (4).
 */
export default function Module01LEnqueteEnVrac() {
  const [data, setData] = useState(() => datasetInit());
  const [prediction, setPrediction] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const lignes = tableau(data);

  const steps = [
    {
      num: 1,
      title: 'Les douze réponses',
      subtitle: 'Range-les comme tu veux — la réponse est dedans, il faut la faire sortir.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 text-sm text-slate-700">
            On a posé une seule question à <strong>12 élèves</strong> :
            «&nbsp;<strong>{ENQUETE.question}</strong>&nbsp;» Voici leurs réponses, dans
            l’ordre où elles sont arrivées.
          </div>

          {/* La manipulation OUVRE le module : trier est le seul geste
              disponible ici — ni ajout, ni suppression, ni graphique. Une
              seule action à la fois. */}
          <DatasetLab
            data={data}
            onData={setData}
            actions={['trier']}
            ariaLabel="Les douze réponses de l’enquête"
          />

          {/* La prédiction se recueille SANS verdict, à l'intérieur du lab
              (memory « M1 lab first, no prediction gate »). */}
          <PredictionChips
            prompt="Avant de compter : d’après toi, quel nombre de livres revient le plus souvent ?"
            options={[
              { id: '0', label: '0 livre' },
              { id: '1', label: '1 livre' },
              { id: '2', label: '2 livres' },
              { id: '3', label: '3 livres' },
            ]}
            value={prediction}
            onChange={setPrediction}
          />

          <TapQuestion
            prompt="Maintenant, compte. Quel nombre de livres revient le plus souvent ?"
            options={['0 livre', '1 livre', '2 livres', '3 livres']}
            correct={2}
            cols={4}
            /* Aucune notion de la leçon n'est requise : compter des jetons
               identiques est de la 6e. C'est ce comptage qui produira le
               besoin du tableau. */
            requires={['lire-tableau']}
            explain="La valeur 2 revient 4 fois (Inès, Malo, Lina, Yanis) — plus que toute autre. Trier la liste « par nombre de livres » regroupe ces quatre-là côte à côte et rend le comptage sûr."
            explainWrong="1 livre revient 3 fois seulement (Tom, Jade, Ethan), et 3 livres aussi 3 fois (Sarah, Camille, Léa). C’est 2 qui revient le plus, avec 4 élèves. En vrac, ces quatre-là sont éparpillés d’un bout à l’autre de la liste — d’où l’erreur."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />

          {q1 && prediction && (
            <Feedback tone="info">
              Ta prédiction était <strong>{prediction} livre{prediction === '1' || prediction === '0' ? '' : 's'}</strong>. {prediction === '2'
                ? 'Elle était juste — mais avoue que sans trier, tu n’en étais pas certain.'
                : 'Le comptage donne 2. En vrac, l’œil se laisse tromper par les nombres qui reviennent au début.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La même liste, deux fois',
      subtitle: 'Trier a changé l’affichage. A-t-il changé l’enquête ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <Feedback tone="info">
            Tu viens de réorganiser les douze réponses. Regarde bien : le nombre d’élèves, et
            qui a lu quoi, ont-ils bougé&nbsp;?
          </Feedback>
          <TapQuestion
            prompt="En triant la liste, qu’est-ce qui a changé ?"
            options={[
              'Rien du tout : ce sont les mêmes réponses, dans un autre ordre',
              'Le nombre d’élèves interrogés',
              'Le nombre de livres lus par Noé',
              'Les réponses elles-mêmes',
            ]}
            correct={0}
            cols={1}
            requires={['lire-tableau']}
            explain="Trier déplace les étiquettes, rien d’autre. Les 12 élèves sont toujours 12, et Noé a toujours lu 5 livres. Le tri sert à VOIR, pas à transformer."
            explainWrong="Regarde le compteur d’élèves pendant que tu tries : il reste à 12. Une réponse ne change pas parce qu’on la déplace dans une liste."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="serie-donnees"
              variant="new"
              lead={<>Ces douze réponses ont un nom, et le fait que le tri ne les change pas est leur propriété la plus importante.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Qui, quoi, combien',
      subtitle: 'Trois mots pour ne plus confondre les élèves et les livres.',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="vocab-serie"
            variant="new"
            lead={<>Pour parler d’une enquête sans s’emmêler, on distingue ceux qu’on interroge de ce qu’on leur demande.</>}
          />
          <TapQuestion
            prompt={<>Dans notre enquête, quel est le <strong>caractère étudié</strong> ?</>}
            options={[
              'Le nombre de livres lus',
              'Les 12 élèves',
              'Noé',
              'Les vacances',
            ]}
            correct={0}
            cols={2}
            requires={['vocab-serie']}
            explain="Le caractère, c’est ce qu’on mesure chez chaque individu : ici, le nombre de livres lus. Les 12 élèves forment la population, et Noé est l’un des individus."
            explainWrong="Les 12 élèves sont la population — ceux qu’on interroge. Le caractère est ce qu’on leur demande : le nombre de livres lus."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Tu as une série de {lignes.length} valeurs différentes, données par 12 élèves. La
              question suivante tombe toute seule : <strong>combien d’élèves pour chacune&nbsp;?</strong>
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’enquête en vrac"
      moduleSubtitle="Douze réponses qui ne disent rien… jusqu’à ce qu’on les range"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Douze réponses, et une question toute bête',
        tone: 'indigo',
        body: (
          <p>
            Une question posée à douze élèves, ça donne douze nombres en désordre. Tout est là —
            et pourtant on n’y voit rien. Ce module te fait <strong>ranger</strong> ces nombres,
            et découvrir que ranger ne change rien aux données, mais change tout à ce qu’on peut
            en dire.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
