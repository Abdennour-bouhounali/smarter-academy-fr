import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SimulationLab from '../components/SimulationLab';
import { EXPERIENCES, simInit, EVENEMENTS_DE, probaEvenementDe, probaCouleur, pct } from '../components/probabilites';

/**
 * Module 6 — LE QUOTIENT, enfin.
 *
 * Tout la leçon a été construite pour ce moment : le mot « probabilité » et
 * l'écriture favorables/possibles arrivent ICI, et pas avant. Ils ne sont pas
 * présentés comme une définition à retenir, mais comme la RÉPONSE à la
 * question laissée ouverte au module 5 — « peut-on trouver ce nombre sans
 * rien lancer ? ».
 *
 * La vérification est immédiate et visuelle : `montrerAttendue` passe à vrai,
 * et le repère violet de 1/6 vient se poser exactement là où l'élève avait vu
 * ses barres se stabiliser. Le calcul et l'observation se recouvrent sous ses
 * yeux — c'est ce recouvrement qui fait la preuve, pas une affirmation.
 *
 * Expected observation : « le nombre que j'avais lu, 16,7 %, c'est 1/6 — et
 * je pouvais le trouver en comptant les faces, sans lancer une seule fois ».
 * Misconception targeted : appliquer le quotient sans vérifier
 * l'équiprobabilité (le sac : 3 couleurs ⇒ « 1/3 », faux) ; et compter les
 * couleurs au lieu des billes.
 */
export default function Module06MesurerLaChance() {
  const [sim, setSim] = useState(() => simInit(EXPERIENCES.de));
  const [q1, setQ1] = useState(false);
  const [n2, setN2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Compte les faces, sans rien lancer',
      subtitle: 'Six faces, une seule porte le 6. Écris cette chance sous forme de fraction.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 text-sm text-slate-700">
            Au module précédent, tu as vu chaque face se stabiliser autour de{' '}
            <strong>16,7 %</strong>. Essayons de retrouver ce nombre <strong>par le
            comptage</strong> : le dé a 6 faces, et une seule porte le 6.
          </div>
          <TapQuestion
            prompt="Quelle fraction décrit la chance d’obtenir 6 ?"
            options={['1/6', '6/1', '1/2', '6/6']}
            correct={0}
            cols={4}
            requires={['issue', 'evenement', 'equiprobabilite']}
            explain="Une face favorable (le 6) sur six faces possibles : 1/6. Et 1 ÷ 6 = 0,1666… soit 16,7 % — exactement le nombre que la simulation faisait apparaître."
            explainWrong="On écrit toujours « ce qui nous intéresse » sur « le total » : 1 face favorable sur 6 faces possibles, donc 1/6. L’écriture 6/1 vaudrait 6, ce qui n’a aucun sens pour une chance."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="ok">
              1 ÷ 6 = 0,1666… = <strong>{pct(1 / 6)}</strong>. C’est <em>exactement</em> ce que
              tes 10 000 lancers montraient. Le calcul et l’expérience tombent sur le même
              nombre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Vérifie que les deux se superposent',
      subtitle: 'Relance la simulation : le repère violet est maintenant affiché.',
      done: n2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="probabilite"
            variant="new"
            lead={<>Le nombre que tu avais lu sur les barres et celui que tu viens de calculer sont le même. Il porte enfin son nom.</>}
          />
          {/* La cible est RÉVÉLÉE : elle vient se poser là où l'élève avait
              déjà vu ses barres se caler. */}
          <SimulationLab
            experience="de"
            sim={sim}
            onSim={setSim}
            montrerAttendue
          />
          <NumericQuestion
            prompt={<>Combien de faces réalisent «&nbsp;obtenir un nombre pair&nbsp;» ? Donne la probabilité en pourcentage.</>}
            expected={50}
            suffix="%"
            requires={['probabilite', 'evenement']}
            explain="Les faces 2, 4 et 6 réalisent l’événement : 3 favorables sur 6 possibles, soit 3/6 = 1/2 = 50 %."
            explainFor={(n) =>
              n === 3
                ? 'Tu as donné le nombre de faces favorables. Il faut le rapporter au total : 3 sur 6, soit 50 %.'
                : n === 16.7 || n === 17
                  ? 'C’est la probabilité d’UNE seule face. Ici trois faces conviennent (2, 4 et 6), donc trois fois plus : 50 %.'
                  : 'Compte les faces paires (2, 4, 6), puis divise par le nombre total de faces (6).'
            }
            solved={n2}
            onAnswered={() => setN2(true)}
          />
          {n2 && <KnowledgeBrick id="mem-probabilite" variant="new" compact />}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le retour du sac',
      subtitle: 'Attention : la formule a une condition.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3 text-sm text-slate-700">
            Reprenons le sac : <strong>3 billes rouges, 2 bleues, 1 verte</strong>. Quelqu’un
            écrit : «&nbsp;il y a 3 couleurs, donc la probabilité du vert est 1/3&nbsp;».
          </div>
          <TapQuestion
            prompt="Ce raisonnement est-il correct ?"
            options={[
              'Non : les couleurs ne sont pas équiprobables, il faut compter les billes (1/6)',
              'Oui : 3 couleurs, donc 1 chance sur 3',
              'Non : la bonne réponse est 1/2',
              'Oui, mais seulement si on tire plusieurs fois',
            ]}
            correct={0}
            cols={1}
            requires={['equiprobabilite', 'mem-probabilite']}
            explain="La formule favorables ÷ possibles exige des issues ÉQUIPROBABLES. Les couleurs ne le sont pas, mais les billes le sont : 1 bille verte sur 6 billes, donc 1/6."
            explainWrong="Compter les couleurs reviendrait à dire que le vert (1 bille) a autant de chances que le rouge (3 billes). Il faut redescendre au niveau des billes, qui sont, elles, à égalité."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Vérification : P(vert) = <strong>{pct(probaCouleur('vert'))}</strong>, P(rouge) ={' '}
              <strong>{pct(probaCouleur('rouge'))}</strong>. Le rouge est bien trois fois plus
              probable — comme tes tirages le montraient.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Calcule quatre probabilités',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Avec un dé équilibré à 6 faces :</p>}
            rows={[
              {
                id: 'p1',
                label: 'P(obtenir 3)',
                options: ['1/6', '1/3', '3/6'],
                correct: 0,
                correction: 'Une seule face porte le 3 : 1 favorable sur 6 possibles.',
              },
              {
                id: 'p2',
                label: 'P(obtenir un nombre supérieur à 4)',
                options: ['1/6', '2/6', '4/6'],
                correct: 1,
                correction: 'Les faces 5 et 6 : 2 favorables sur 6.',
              },
              {
                id: 'p3',
                label: 'P(obtenir un multiple de 3)',
                options: ['1/6', '2/6', '3/6'],
                correct: 1,
                correction: 'Les faces 3 et 6 : 2 favorables sur 6.',
              },
              {
                id: 'p4',
                label: 'P(obtenir un nombre inférieur à 7)',
                options: ['6/6', '1/6', '0/6'],
                correct: 0,
                correction: 'Les six faces conviennent : 6/6 = 1, l’événement est certain.',
              },
            ]}
            requires={['probabilite', 'mem-probabilite', 'evenement']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Toujours le même geste : compter les faces favorables, puis diviser par 6. Le
                  dernier cas donne <strong className="font-mono">6/6 = 1</strong> — ce qui va
                  nous occuper au module suivant.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Pour chaque ligne, écris d’abord la liste des faces qui
                  réalisent l’événement, compte-les, et mets ce nombre sur 6. Le dénominateur ne
                  change jamais : le dé a toujours six faces.
                </Feedback>
              )
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu as croisé un <strong className="font-mono">0/6</strong> et un{' '}
              <strong className="font-mono">6/6</strong>. Ces deux nombres sont les bornes de
              toute l’échelle — le dernier module la parcourt en entier.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Mesurer la chance"
      moduleSubtitle="Le nombre que tu as vu, sans rien lancer"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Retrouve 16,7 % sans lancer un seul dé',
        tone: 'indigo',
        body: (
          <p>
            Dix mille lancers t’ont fait apparaître un nombre. Et si tu pouvais le trouver en
            dix secondes, juste en comptant les faces&nbsp;? C’est exactement ce que fait la{' '}
            <strong>probabilité</strong> — à une condition, que tu connais déjà.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
