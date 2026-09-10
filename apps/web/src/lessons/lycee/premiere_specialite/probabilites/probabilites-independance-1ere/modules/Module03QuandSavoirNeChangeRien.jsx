import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CrossJudge from '../components/CrossJudge';
import TwoTreesLab from '../components/TwoTreesLab';
import { independence, conditional, pct } from '../components/indepUtils';
import { CAS, casTable, LAB_INDEP } from '../data';

/**
 * Module 3 — MANIPULATION : reconnaître le cas particulier, et le nommer (P2).
 *
 * CE QUE LE MODULE FAIT, ET DANS QUEL ORDRE. Le module 1 a fait TROUVER le cas
 * au glisser ; le module 2 a construit l'inversion. Ici on donne son NOM au cas
 * — c'est le seul endroit de la leçon où le mot est posé — puis on apprend à le
 * repérer sur un tableau ou un arbre… et surtout à se méfier de ce repérage.
 *
 * L'INTERACTION : QUATRE POPULATIONS À JUGER, une par une. Pour chacune, les
 * deux poids de deuxième génération sont affichés côte à côte (`reveal="poids"`)
 * et l'élève tranche. Le quatrième cas est un PRESQUE-CAS : 31 % contre 30 %.
 * L'œil dit « pareil », le calcul dit « non ». C'est ce défaut délibéré qui
 * ouvre le module 4 — sans lui, l'élève croirait qu'un coup d'œil suffit.
 *
 * Le geste n'est pas un glisser parce que l'objet à manipuler n'est pas une
 * figure dans un repère : c'est un VERDICT à rendre sur une population donnée
 * (patron §Le glisser d'abord, condition 3). Le laboratoire glissant du module 1
 * reste présent à l'étape 1, et il n'est JAMAIS gelé.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  revoir le cas trouvé au module 1, et lui donner son nom →
 *            brique `independance`
 *   étape 2  juger trois populations où l'œil suffit
 *   étape 3  la quatrième, qui piège l'œil → brique `reconnaitre-sur-arbre`
 *   étape 4  la question qui exige de ne pas conclure trop vite
 */
const [C1, C2, C3, C4] = CAS;
const poids = (cas, row) => pct(conditional(casTable(cas), { axis: 'row', key: row }, 'B'), 1);
const verdict = (cas) => independence(casTable(cas), { rowKey: 'A', colKey: 'B' });

export default function Module03QuandSavoirNeChangeRien() {
  const [etat, setEtat] = useState(LAB_INDEP);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le cas trouvé au premier module a un nom',
      subtitle:
        'Voici le réglage où les deux poids de deuxième génération coïncident. Refais-le glisser autour de cette position : le mot ne vaut que pour cette position-là.',
      done: q1,
      content: (
        <div className="space-y-3">
          <TwoTreesLab state={etat} onChange={setEtat} showReadings={false} />
          <TapQuestion
            prompt="Sur ce réglage, la part d’élèves au club de sport est la même chez ceux qui portent des lunettes et chez les autres. Comment nomme-t-on cette situation ?"
            options={[
              'On dit que les deux événements sont indépendants',
              'On dit que les deux événements sont égaux',
              'On dit que les deux événements sont interchangeables',
              'On dit que les deux événements sont exclusifs',
            ]}
            correct={0}
            cols={1}
            requires={['savoir-ne-change-rien', 'deux-arbres-deux-poids']}
            explain="C’est le mot que les mathématiques réservent à cette situation : savoir que l’un s’est produit ne change pas la probabilité de l’autre. Le mot ne dit pas que les deux événements sont égaux, ni qu’on pourrait les échanger l’un pour l’autre."
            explainWrong="Les deux événements ne sont pas égaux — 500 élèves d’un côté, 400 de l’autre — et on ne peut pas les échanger : les deux arbres portent encore des poids différents, 40 % à gauche contre 50 % à droite. Ce qui les caractérise ici, c’est que la réponse à la première question n’apprend rien sur la seconde."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                Le mot est posé. Attention à ce qu’il ne dit PAS : il ne dit pas que les deux
                arbres deviennent identiques — ici les poids valent 40 % à gauche et 50 % à
                droite — ni qu’aucun élève ne cumule les deux critères ; il y en a{' '}
                {etat.nAB} justement.
              </Feedback>
              <KnowledgeBrick
                id="independance"
                variant="new"
                lead={<>Le nom du cas particulier, et ce qu’il recouvre exactement.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois populations à juger',
      subtitle:
        'Pour chacune, compare les deux poids affichés sous le tableau. Coïncident-ils ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={casTable(C1)} labels={C1.labels} rowKey="A" colKey="B"
            title={`${C1.title} — 1 000 élèves`} reveal="poids"
          />
          <CrossJudge
            table={casTable(C2)} labels={C2.labels} rowKey="A" colKey="B"
            title={`${C2.title} — 800 élèves`} reveal="poids"
          />
          <CrossJudge
            table={casTable(C3)} labels={C3.labels} rowKey="A" colKey="B"
            title={`${C3.title} — 1 200 pièces`} reveal="poids"
          />
          <TapQuestion
            prompt="Dans lesquelles de ces trois populations les deux poids coïncident-ils ?"
            options={[
              `Dans la première (${poids(C1, 'A')} contre ${poids(C1, 'nonA')}) et la troisième (${poids(C3, 'A')} contre ${poids(C3, 'nonA')})`,
              `Dans la première seulement`,
              `Dans la deuxième seulement (${poids(C2, 'A')} contre ${poids(C2, 'nonA')})`,
              'Dans les trois',
            ]}
            correct={0}
            cols={1}
            requires={['independance', 'savoir-ne-change-rien', 'poids-conditionnels']}
            explain={`Première population : ${poids(C1, 'A')} et ${poids(C1, 'nonA')} — coïncident. Deuxième : ${poids(C2, 'A')} contre ${poids(C2, 'nonA')} — non. Troisième : ${poids(C3, 'A')} et ${poids(C3, 'nonA')} — coïncident, alors même que les deux ateliers ont des volumes très différents (300 pièces contre 900). C’est bien le POIDS qui compte, pas la taille des groupes.`}
            explainWrong={`Relis les deux cadres sous chaque tableau. Le second cas donne ${poids(C2, 'A')} d’un côté et ${poids(C2, 'nonA')} de l’autre : être interne change nettement la chance d’être au club. Les deux autres donnent deux fois le même nombre.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="ok">
              La troisième population est la plus instructive : 300 pièces le matin, 900 le soir —
              des volumes du simple au triple — et pourtant {poids(C3, 'A')} de pièces contrôlées
              des deux côtés. La taille des groupes n’a rien à voir avec le verdict.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La quatrième population',
      subtitle:
        'Même exercice. Regarde bien les deux poids avant de répondre.',
      done: q3,
      content: (
        <div className="space-y-3">
          <CrossJudge
            table={casTable(C4)} labels={C4.labels} rowKey="A" colKey="B"
            title={`${C4.title} — 1 000 élèves`} reveal={q3 ? 'tout' : 'poids'}
          />
          <TapQuestion
            prompt={`Ici les deux poids valent ${poids(C4, 'A')} et ${poids(C4, 'nonA')}. Ces deux événements sont-ils indépendants ?`}
            options={[
              'Non : les deux poids sont proches, mais pas égaux — et « proche » ne suffit pas',
              'Oui : à un point près, c’est la même chose',
              'Oui : les deux groupes ont des effectifs différents, donc un écart est normal',
              'On ne peut pas se prononcer sans connaître la population totale',
            ]}
            correct={0}
            cols={1}
            requires={['independance', 'savoir-ne-change-rien', 'denominateur']}
            explain={`${verdict(C4).counts.nAB} × ${verdict(C4).counts.N} = ${verdict(C4).exact.left} tandis que ${verdict(C4).counts.nA} × ${verdict(C4).counts.nB} = ${verdict(C4).exact.right}. L’écart vaut ${Math.abs(verdict(C4).exact.left - verdict(C4).exact.right)} : ce n’est pas égal, donc ce n’est pas le cas particulier. Un point d’écart sur un pourcentage reste un écart.`}
            explainWrong="Un écart, si petit soit-il, suffit à faire tomber le verdict : la propriété est une égalité, pas une ressemblance. Et la population totale est bien connue — 1 000 élèves — elle figure dans le coin du tableau."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                L’œil disait « pareil », le calcul dit « non ». C’est exactement pour cela que
                l’arbre et le tableau servent à REPÉRER un candidat, jamais à conclure.
              </Feedback>
              <KnowledgeBrick
                id="reconnaitre-sur-arbre"
                variant="new"
                lead={<>Ce que le coup d’œil peut faire, et ce qu’il ne peut pas faire.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Que faut-il faire, alors ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Devant deux poids qui se ressemblent sur un arbre, quelle est la bonne conduite ?"
          options={[
            'Les traiter comme un candidat, et trancher par un calcul exact avant de conclure',
            'Conclure directement : deux poids voisins suffisent',
            'Arrondir les deux poids au pourcentage entier le plus proche, puis comparer',
            'Refaire le comptage, car un tel écart signale forcément une erreur de relevé',
          ]}
          correct={0}
          cols={1}
          requires={['reconnaitre-sur-arbre', 'independance']}
          explain="Arrondir reviendrait à décider à l’avance ce qu’on cherche à vérifier : 31 % et 30 % arrondis au même nombre ne prouveraient rien du tout. Et le comptage n’a aucune raison d’être faux — 124 sur 400 et 180 sur 600 sont des effectifs parfaitement possibles. Il faut un calcul qui réponde par oui ou par non : c’est le module suivant."
          explainWrong="Conclure sur une ressemblance, c’est exactement l’erreur que la quatrième population vient de faire commettre. Et arrondir avant de comparer efface la différence qu’on cherche justement à détecter."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Quand savoir ne change rien"
      moduleSubtitle="Quatre populations à juger, et une qui piège l’œil"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Le mot, et ses limites',
        tone: 'indigo',
        body: (
          <p>
            Le cas trouvé au premier module porte un nom. Reste à savoir le reconnaître ailleurs.
            Quatre populations te sont soumises : dans trois d’entre elles, la réponse saute aux
            yeux. Dans la quatrième, les yeux se trompent.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Ce que tu viens d’établir.</strong> Deux événements sont indépendants quand
          savoir que l’un s’est produit ne change pas la probabilité de l’autre : sur un arbre,
          les deux poids de deuxième génération coïncident. Mais l’œil ne distingue pas 30 % de
          31 %. Module suivant : le calcul qui tranche, sans arrondi.
        </KnowledgeSnapshot>
      }
    />
  );
}
