import React, { useMemo, useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BarChart from '../components/BarChart';
import DatasetLab from '../components/DatasetLab';
import { tableau, moyenne, datasetInit, makeObs, fr } from '../components/statistiques';

/**
 * Module 7 — LABO : interpréter, c'est-à-dire relire la moyenne AVEC les
 * données qui l'ont produite.
 *
 * La démonstration est faite par deux séries construites pour avoir
 * EXACTEMENT la même moyenne (10) et des répartitions opposées. Les deux
 * moyennes sont recalculées par le noyau, jamais écrites en dur : si
 * quelqu'un modifiait une série, l'égalité affichée resterait vraie ou le
 * module se contredirait visiblement — c'est un mensonge de cadrage rendu
 * impossible.
 *
 * Expected observation : « la moyenne ne dit rien de la façon dont les
 * données sont réparties ; deux classes très différentes peuvent avoir la
 * même ».
 * Misconception targeted : croire qu'une même moyenne signifie « même
 * niveau » ; et croire qu'une valeur extrême est « une erreur à supprimer ».
 */

/* Deux classes de 6 élèves, construites pour avoir la même moyenne. */
const GROUPEE = [9, 10, 10, 10, 11, 10];
const ETALEE = [2, 3, 18, 19, 10, 8];

export default function Module07CeQueLaMoyenneCache() {
  const [data, setData] = useState(() => datasetInit());
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  /* Les moyennes sont CALCULÉES : la leçon ne peut pas affirmer une égalité
     que les données ne portent pas. */
  const mGroupee = useMemo(() => moyenne(GROUPEE.map((v, i) => makeObs(`A${i}`, v))), []);
  const mEtalee = useMemo(() => moyenne(ETALEE.map((v, i) => makeObs(`B${i}`, v))), []);
  const lignesG = useMemo(() => tableau(GROUPEE.map((v, i) => makeObs(`A${i}`, v))), []);
  const lignesE = useMemo(() => tableau(ETALEE.map((v, i) => makeObs(`B${i}`, v))), []);

  const steps = [
    {
      num: 1,
      title: 'Deux classes, une seule moyenne',
      subtitle: 'Même note moyenne au contrôle. Regarde les deux graphiques.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="rounded-lg bg-sky-50 border-2 border-sky-200 px-2 py-1 text-center">
                <div className="text-xs font-semibold text-sky-800">Classe A</div>
                <div className="font-mono text-sm font-black text-sky-900">
                  moyenne {fr(mGroupee)}
                </div>
              </div>
              <BarChart lignes={lignesG} total={GROUPEE.length} ariaLabel="Notes de la classe A" />
            </div>
            <div className="space-y-1">
              <div className="rounded-lg bg-rose-50 border-2 border-rose-200 px-2 py-1 text-center">
                <div className="text-xs font-semibold text-rose-800">Classe B</div>
                <div className="font-mono text-sm font-black text-rose-900">
                  moyenne {fr(mEtalee)}
                </div>
              </div>
              <BarChart lignes={lignesE} total={ETALEE.length} ariaLabel="Notes de la classe B" />
            </div>
          </div>
          <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3 text-center text-sm text-slate-700">
            Classe A : <span className="font-mono">{GROUPEE.join(' · ')}</span><br />
            Classe B : <span className="font-mono">{ETALEE.join(' · ')}</span>
          </div>
          <TapQuestion
            prompt={<>Les deux classes ont la même moyenne, <strong className="font-mono">{fr(mGroupee)}</strong>. Que peut-on en conclure ?</>}
            options={[
              'Rien sur la répartition : A est très groupée, B très étalée',
              'Les deux classes ont exactement le même niveau',
              'La classe B est meilleure',
              'L’une des deux moyennes est mal calculée',
            ]}
            correct={0}
            cols={1}
            requires={['moyenne', 'diagramme-barres']}
            explain="En A, tout le monde est entre 9 et 11 : la moyenne représente bien la classe. En B, deux élèves sont à 2 et 3 quand deux autres sont à 18 et 19 : personne ne ressemble à la moyenne. Le même nombre résume deux réalités opposées."
            explainWrong="Les deux moyennes sont bien égales et bien calculées. C’est justement le problème : un seul nombre ne peut pas distinguer une classe homogène d’une classe coupée en deux."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <KnowledgeBrick
              id="interpreter"
              variant="new"
              lead={<>Voilà pourquoi on ne s’arrête jamais à la moyenne : elle donne le niveau général, pas la répartition.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’élève qui déplace la moyenne',
      subtitle: 'Ajoute un gros lecteur dans le laboratoire, et surveille le nombre violet.',
      done: q2,
      content: (
        <div className="space-y-3">
          <DatasetLab
            data={data}
            onData={setData}
            montrerMoyenne
            montrerFrequences
            ariaLabel="Effet d’une valeur extrême sur la moyenne"
          />
          <TapQuestion
            prompt={
              <>
                Ajoute un élève qui a lu <strong>12 livres</strong>. La moyenne passe d’environ
                2,08 à environ 2,85. Que faut-il en penser ?
              </>
            }
            options={[
              'Une seule valeur très éloignée suffit à tirer la moyenne vers elle',
              'C’est une erreur : il faut supprimer cet élève',
              'La moyenne ne bouge pas quand on ajoute un élève',
              'Cela prouve que la classe lit beaucoup',
            ]}
            correct={0}
            cols={1}
            requires={['moyenne', 'interpreter']}
            explain="Un seul lecteur à 12 livres ajoute 12 au total alors que la plupart apportent 1, 2 ou 3. La moyenne monte de près d’un livre, alors qu’aucun des douze autres élèves n’a changé ses habitudes."
            explainWrong="Ce n’est pas une erreur : cet élève a réellement lu 12 livres, sa réponse est vraie et doit rester. Ce qu’il faut, c’est SIGNALER qu’une valeur extrême tire la moyenne — pas effacer la donnée qui dérange."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Dire ce que les données disent',
      subtitle: 'Quatre phrases sur notre enquête. Lesquelles sont honnêtes ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Notre enquête : 12 élèves, moyenne ≈ 2,08 livre, réponses 0 · 1 · 1 · 1 · 2 · 2 ·
                2 · 2 · 3 · 3 · 3 · 5.
              </p>
            }
            rows={[
              {
                id: 'p1',
                label: '« La plupart des élèves ont lu entre 1 et 3 livres. »',
                options: ['Honnête', 'Abusif'],
                correct: 0,
                correction: '10 élèves sur 12 sont entre 1 et 3 : la phrase décrit bien la série.',
              },
              {
                id: 'p2',
                label: '« Chaque élève a lu environ 2 livres. »',
                options: ['Honnête', 'Abusif'],
                correct: 1,
                correction: 'Faux pour Hugo (0) comme pour Noé (5). La moyenne ne décrit pas CHAQUE élève.',
              },
              {
                id: 'p3',
                label: '« Un seul élève n’a lu aucun livre. »',
                options: ['Honnête', 'Abusif'],
                correct: 0,
                correction: 'C’est exactement l’effectif de la valeur 0 : 1 élève. Une lecture directe du tableau.',
              },
              {
                id: 'p4',
                label: '« Les élèves de cette classe lisent plus que la moyenne nationale. »',
                options: ['Honnête', 'Abusif'],
                correct: 1,
                correction: 'L’enquête ne contient aucune donnée nationale : on ne peut pas comparer à ce qu’on n’a pas mesuré.',
              },
            ]}
            requires={['interpreter', 'moyenne', 'effectif']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Interpréter honnêtement, c’est ne dire que ce que les données portent : ni
                  étendre la moyenne à chaque individu, ni comparer à une population qu’on n’a
                  pas interrogée.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Pour chaque phrase, demande-toi :{' '}
                  <strong>où est-ce écrit dans le tableau&nbsp;?</strong> Si tu ne peux pas
                  pointer la case, la phrase va trop loin.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && <KnowledgeBrick id="mem-interpreter" variant="new" compact />}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Ce que la moyenne cache"
      moduleSubtitle="Un résumé n’est pas les données"
      estimatedTime="9 min"
      brief={{
        tag: 'Labo',
        title: 'Même moyenne, rien à voir',
        tone: 'amber',
        body: (
          <p>
            Deux classes obtiennent exactement la même moyenne au contrôle. Dans l’une, tout le
            monde tourne autour de 10 ; dans l’autre, la moitié est en grande difficulté et
            l’autre excellente. Un seul nombre, deux réalités opposées — et c’est pour cela
            qu’<strong>on ne s’arrête jamais à la moyenne</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
