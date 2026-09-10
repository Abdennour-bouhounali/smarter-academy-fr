import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PyLab from '../components/PyLab';

/**
 * Module 3 — séquence et conditionnelle.
 *
 * Le cas LIMITE est le cœur du module : l'élève exécute le programme avec une
 * note de 10 exactement, constate le résultat, puis remplace >= par > et voit
 * la réponse basculer. Aucun texte ne remplace ce constat.
 */
const NOTE = `note = 10
if note >= 10:
    print("admis")
else:
    print("recalé")`;

export default function Module03LeProgrammeQuiChoisit() {
  const [seenAdmis, setSeenAdmis] = useState(false);
  const [seenRecale, setSeenRecale] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = seenAdmis && seenRecale;

  const steps = [
    {
      num: 1,
      title: 'Le cas limite',
      subtitle: 'La note vaut exactement 10. Exécute. Puis remplace >= par > et exécute encore.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PyLab
            initial={NOTE}
            label="Admis ou recalé"
            onRun={({ output }) => {
              const o = output.join(' ');
              if (o.includes('admis') && !seenAdmis) { setSeenAdmis(true); if (seenRecale) kit.react?.(true); }
              if (o.includes('recalé') && !seenRecale) { setSeenRecale(true); if (seenAdmis) kit.react?.(true); }
            }}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                Même note, même programme, deux réponses opposées : <strong>un seul caractère</strong> a
                changé. <span className="font-mono">&gt;=</span> accepte l’égalité, <span className="font-mono">&gt;</span>
                la refuse. C’est pour cela que le cas limite est le premier à tester.
              </Feedback>
              <KnowledgeBrick
                id="conditionnelle"
                variant="new"
                lead={<>Ce bloc qui ne s’exécute que sous condition, et son bloc de secours, ont une écriture précise.</>}
              />
              <KnowledgeBrick
                id="regle-cas-limite"
                variant="new"
                lead={<>Et voilà ce que tu viens de faire basculer.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              {!seenAdmis ? 'Exécute tel quel pour voir « admis ». ' : ''}
              {seenAdmis && !seenRecale ? 'Maintenant remplace >= par > et exécute : la réponse change.' : ''}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’ordre compte',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="sequence"
            variant="new"
            lead={<>Avant même la condition, une règle plus simple gouverne tout programme.</>}
          />
          <TapQuestion
            prompt={<span>Le programme <span className="font-mono">x = 2</span> puis <span className="font-mono">y = x * 3</span> puis <span className="font-mono">x = 10</span> se termine. Que vaut y ?</span>}
            options={['6, car y a été calculé quand x valait 2', '30, car x vaut 10 à la fin', '10', 'y n’existe pas']}
            correct={0} cols={1}
            requires={['sequence', 'affectation']}
            explain="y a reçu sa valeur à la deuxième ligne, avec le x de ce moment-là : 2 × 3 = 6. Changer x ensuite ne recalcule PAS y — une affectation n’est pas une formule vivante."
            explainWrong="Une variable garde la valeur qu’on lui a rangée. Modifier x plus tard ne remonte pas jusqu’à y : il faudrait réécrire la ligne y = x * 3."
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Choisir la bonne condition',
      done: q3,
      content: () => (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-600">Quelle condition traduit chaque phrase ?</p>}
          rows={[
            { id: 'r1', label: 'Au moins 18 ans', options: ['age >= 18', 'age > 18', 'age == 18'], correct: 0, correction: '« au moins » inclut 18.' },
            { id: 'r2', label: 'Strictement plus de 100 €', options: ['prix > 100', 'prix >= 100', 'prix != 100'], correct: 0, correction: '« strictement plus » exclut 100.' },
            { id: 'r3', label: 'Exactement zéro', options: ['n == 0', 'n = 0', 'n <= 0'], correct: 0, correction: '== compare, = affecte : les confondre est une erreur classique.' },
            { id: 'r4', label: 'Différent de 7', options: ['n != 7', 'n == 7', 'not 7'], correct: 0, correction: '!= se lit « différent de ».' },
          ]}
          requires={['conditionnelle', 'regle-cas-limite']}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Les quatre.' : `${nCorrect} sur ${total}.`} Deux pièges reviennent tout le temps :
              « au moins » veut dire <span className="font-mono">&gt;=</span>, et <span className="font-mono">==</span>
              compare quand <span className="font-mono">=</span> affecte.
            </Feedback>
          )}
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le programme qui choisit"
      moduleSubtitle="Une séquence, puis un si… sinon"
      estimatedTime="12 min"
      brief={{
        tag: '🔀 Mission 03',
        title: 'Un caractère de différence, et la réponse s’inverse.',
        tone: 'indigo',
        body: <p>Une note de 10 pile : admis ou recalé ? Cela dépend d’un seul signe, et c’est toi qui vas le changer.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          Ton programme sait choisir. Reste à lui faire répéter un travail sans recopier
          cinquante fois la même ligne.
        </KnowledgeSnapshot>
      )}
    />
  );
}
