import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DatasetLab from '../components/DatasetLab';
import BarChart from '../components/BarChart';
import { datasetInit, tableau } from '../components/statistiques';

/**
 * Module 4 — MANIPULATION : le jeu de données vivant.
 *
 * C'est le cœur manipulatoire de la leçon. L'élève dispose des QUATRE gestes
 * (ajouter, supprimer, trier, changer de représentation) et le tableau comme
 * le graphique se recalculent en direct. Le module ne demande pas de « bien »
 * manipuler : il demande de TRIER LES CONSÉQUENCES — quels gestes changent
 * l'enquête, quels gestes n'en changent que l'affichage.
 *
 * Expected observation : « trier et changer de graphique ne touchent à rien ;
 * ajouter ou supprimer un élève change le total, donc toutes les fréquences ».
 * Misconception targeted : croire qu'un graphique différent raconte des
 * données différentes ; et croire qu'ajouter une donnée « ne change que sa
 * propre colonne », alors que le total bouge et donc TOUTES les fréquences.
 *
 * Le module introduit aussi l'axe tronqué comme un MENSONGE graphique — la
 * seule façon honnête de faire comprendre pourquoi l'axe part de zéro.
 */
export default function Module04LeDatasetVivant() {
  const [data, setData] = useState(() => datasetInit());
  const [vue, setVue] = useState('barres');
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const lignes = tableau(data);

  const steps = [
    {
      num: 1,
      title: 'Prends la main sur l’enquête',
      subtitle: 'Ajoute, retire, trie, change de dessin — et regarde le bandeau du bas.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
            Le tableau et le graphique se recalculent à chaque geste. Essaie au moins :{' '}
            <strong>ajouter un élève qui a lu 12 livres</strong>, puis{' '}
            <strong>retirer Noé</strong>, puis <strong>trier</strong>. Le bandeau bleu, en bas,
            te dit à chaque fois ce qui a bougé.
          </div>

          {/* Les QUATRE gestes, disponibles ensemble pour la première fois. */}
          <DatasetLab
            data={data}
            onData={setData}
            vue={vue}
            onVue={setVue}
            montrerFrequences
            ariaLabel="Jeu de données vivant : ajouter, supprimer, trier, changer de représentation"
          />

          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque geste : est-ce que l’<strong>enquête</strong> change (les données
                elles-mêmes), ou seulement son <strong>affichage</strong> ?
              </p>
            }
            rows={[
              {
                id: 'g1',
                label: 'Trier la liste par prénom',
                options: ['L’enquête change', 'Seulement l’affichage'],
                correct: 1,
                correction: 'Les 12 réponses restent les mêmes : effectifs, fréquences, tout est identique.',
              },
              {
                id: 'g2',
                label: 'Ajouter un élève qui a lu 12 livres',
                options: ['L’enquête change', 'Seulement l’affichage'],
                correct: 0,
                correction: 'On passe de 12 à 13 élèves : le total change, donc toutes les fréquences aussi.',
              },
              {
                id: 'g3',
                label: 'Passer des barres au camembert',
                options: ['L’enquête change', 'Seulement l’affichage'],
                correct: 1,
                correction: 'Deux dessins des mêmes nombres. Aucun effectif n’a bougé.',
              },
              {
                id: 'g4',
                label: 'Retirer Noé de l’enquête',
                options: ['L’enquête change', 'Seulement l’affichage'],
                correct: 0,
                correction: 'Il reste 11 élèves, et les 5 livres de Noé ont disparu de la série.',
              },
            ]}
            requires={['effectif', 'frequence']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Deux familles de gestes, bien séparées. <strong>Trier</strong> et{' '}
                  <strong>changer de graphique</strong> ne touchent pas aux données : ils
                  changent la façon de les regarder. <strong>Ajouter</strong> et{' '}
                  <strong>supprimer</strong> modifient la population — ce n’est plus la même
                  enquête, et le total le dit tout de suite.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Le test est simple : refais le geste dans le
                  laboratoire et surveille le <strong>compteur d’élèves</strong>. S’il bouge,
                  l’enquête a changé. S’il ne bouge pas, seul l’affichage a changé.
                </Feedback>
              )
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que dit une barre',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="diagramme-barres"
            variant="new"
            lead={<>Le dessin que tu viens de faire bouger a des règles précises — et la première concerne l’endroit où l’axe commence.</>}
          />
          <TapQuestion
            prompt="Sur le diagramme en barres de notre enquête, quelle barre est la plus haute, et pourquoi ?"
            options={[
              'Celle de 2 livres, car 4 élèves ont donné cette réponse',
              'Celle de 5 livres, car 5 est le plus grand nombre',
              'Celle de 0 livre, car elle part de zéro',
              'Elles ont toutes la même hauteur',
            ]}
            correct={0}
            cols={1}
            requires={['diagramme-barres', 'effectif']}
            explain="La hauteur représente l’EFFECTIF, pas la valeur. La colonne 2 monte à 4 élèves ; la colonne 5 ne monte qu’à 1, parce que Noé est seul."
            explainWrong="C’est le piège classique : la barre de « 5 livres » est la plus BASSE, parce qu’un seul élève a lu 5 livres. La hauteur compte les élèves, pas les livres."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le graphique qui ment',
      subtitle: 'Mêmes données, mêmes nombres — et pourtant une impression totalement fausse.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 text-center">Axe partant de 0</div>
              <BarChart lignes={lignes} total={data.length} ariaLabel="Diagramme honnête" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 text-center">Axe tronqué</div>
              <BarChart lignes={lignes} total={data.length} axeTronque ariaLabel="Diagramme trompeur" />
            </div>
          </div>
          <TapQuestion
            prompt="Les deux graphiques affichent exactement les mêmes effectifs. Pourquoi le second est-il malhonnête ?"
            options={[
              'Son axe ne part pas de 0, donc les écarts paraissent bien plus grands',
              'Il a inversé les couleurs',
              'Il a changé les effectifs',
              'Il a trié les barres différemment',
            ]}
            correct={0}
            cols={1}
            requires={['diagramme-barres']}
            explain="Aucun chiffre n’est faux dans le second graphique. Mais en coupant le bas de l’axe, un écart de 1 élève occupe la moitié de la hauteur : l’œil lit un écart énorme là où il n’y en a presque pas."
            explainWrong="Regarde la graduation de gauche : sur le second, elle ne commence pas à 0. Les nombres sont pourtant les mêmes — c’est le DESSIN qui trompe, pas les données."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                Un graphique peut mentir sans écrire un seul chiffre faux. C’est pour cela qu’on
                vérifie toujours <strong>d’où part l’axe</strong> avant de croire une impression.
              </Feedback>
              <KnowledgeBrick
                id="donnees-invariantes"
                variant="new"
                lead={<>Et voici la règle que tes quatre gestes ont établie : ce qui change l’affichage ne change pas les données.</>}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le jeu de données vivant"
      moduleSubtitle="Quatre gestes, et seulement deux qui changent l’enquête"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'À toi les commandes',
        tone: 'indigo',
        body: (
          <p>
            L’enquête est entre tes mains : ajoute un élève, retires-en un, trie, change de
            graphique. Tout se recalcule en direct. Ta mission n’est pas de manipuler au
            hasard — c’est de repérer <strong>lesquels de ces gestes changent vraiment les
            données</strong>, et lesquels ne changent que la façon de les regarder.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
