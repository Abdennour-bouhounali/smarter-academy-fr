import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExperienceLab from '../components/ExperienceLab';
import IssuesLab from '../components/IssuesLab';
import { EXPERIENCES } from '../components/probabilites';

/**
 * Module 4 — MANIPULATION : l'équiprobabilité est une CONDITION.
 *
 * Le sac (3 rouges, 2 bleues, 1 verte) est le contre-exemple qui empêche
 * « toutes les issues ont la même chance » de se mémoriser comme une loi de
 * la nature. L'élève tire à la main, voit le rouge revenir beaucoup plus
 * souvent, et doit trancher DEUX questions qui n'ont pas la même réponse :
 *   · les six BILLES ont-elles la même chance ? — oui ;
 *   · les trois COULEURS ont-elles la même chance ? — non.
 *
 * Expected observation : « ce n'est pas le dispositif qui est équiprobable ou
 * non, c'est la façon dont je découpe les résultats ».
 * Misconception targeted : croire que tout dispositif de hasard est juste ;
 * et croire que « 3 couleurs » signifie « une chance sur trois ».
 *
 * Toujours aucun quotient — on compare des chances, on ne les chiffre pas.
 */
export default function Module04LeSacTruque() {
  const [prediction, setPrediction] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [selection, setSelection] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const rouges = historique.filter((h) => h === 'rouge').length;

  const steps = [
    {
      num: 1,
      title: 'Tire des billes du sac',
      subtitle: 'Trois rouges, deux bleues, une verte. Tire une dizaine de fois.',
      done: q1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avant de tirer : quelle couleur sortira le plus souvent, d’après toi ?"
            options={[
              { id: 'rouge', label: '🔴 Rouge' },
              { id: 'bleu', label: '🔵 Bleu' },
              { id: 'vert', label: '🟢 Vert' },
              { id: 'egal', label: 'Toutes pareil' },
            ]}
            value={prediction}
            onChange={setPrediction}
          />

          {/* La manipulation ouvre le module : on tire, on regarde. */}
          <ExperienceLab
            experience="urne"
            historique={historique}
            onLancer={(r) => setHistorique((h) => [...h, r])}
            ariaLabel="Tirage d’une bille dans le sac"
          />

          {historique.length >= 6 && (
            <Feedback tone="info">
              Sur tes {historique.length} tirages, le rouge est sorti{' '}
              <strong>{rouges} fois</strong>. Continue à tirer : l’écart avec le vert se creuse,
              il ne se comble pas.
            </Feedback>
          )}

          <TapQuestion
            prompt="Dans ce sac, les trois couleurs ont-elles la même chance de sortir ?"
            options={[
              'Non : il y a trois billes rouges, mais une seule verte',
              'Oui : il y a trois couleurs, donc une chance sur trois chacune',
              'Oui : le tirage se fait sans regarder, donc c’est juste',
              'On ne peut pas savoir',
            ]}
            correct={0}
            cols={1}
            requires={['issue']}
            explain="Ce qui compte, c’est le nombre de BILLES de chaque couleur, pas le nombre de couleurs. Trois billes rouges contre une verte : le rouge a trois fois plus de chances de sortir."
            explainWrong="Tirer sans regarder rend le tirage honnête pour chaque BILLE, mais pas pour chaque couleur : le sac contient trois fois plus de rouge que de vert, et aucun bandeau sur les yeux n’y changera rien."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et les billes, alors ?',
      subtitle: 'Coche les billes qui ont la même chance d’être tirées.',
      done: q2,
      content: (
        <div className="space-y-3">
          <IssuesLab
            experience="urne"
            selection={selection}
            onSelection={setSelection}
            intitule={<>Voici les <strong>six billes</strong> du sac, une par une. Coche celles qui ont la même chance d’être tirées.</>}
            ariaLabel="Les six billes du sac"
          />
          <TapQuestion
            prompt="Bille par bille, cette fois : ont-elles toutes la même chance d’être tirées ?"
            options={[
              'Oui : elles sont de même taille, et on tire sans regarder',
              'Non : les rouges ont plus de chances',
              'Non : la verte est plus rare, donc plus difficile à attraper',
              'Cela dépend de la main qui tire',
            ]}
            correct={0}
            cols={1}
            requires={['issue']}
            explain="Chacune des six billes a exactement la même chance. Ce qui rend le rouge fréquent, ce n’est pas qu’une bille rouge soit avantagée — c’est qu’il y en a TROIS à pouvoir sortir."
            explainWrong="Une bille rouge n’a aucun avantage sur la verte : elles sont identiques au toucher. Ce sont les billes rouges qui sont plus NOMBREUSES, ce qui n’est pas la même chose."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Même sac, deux réponses opposées : <strong>les 6 billes</strong> sont à égalité,{' '}
                <strong>les 3 couleurs</strong> ne le sont pas. Tout dépend de ce qu’on appelle
                une issue.
              </Feedback>
              <KnowledgeBrick
                id="equiprobabilite"
                variant="new"
                lead={<>Voilà pourquoi cette condition se vérifie à chaque fois, au lieu d’être supposée.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Juste ou truqué ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Dans chaque cas, les issues proposées sont-elles <strong>équiprobables</strong> ?
              </p>
            }
            rows={[
              {
                id: 's1',
                label: 'Les 6 faces d’un dé équilibré',
                options: ['Équiprobables', 'Pas équiprobables'],
                correct: 0,
                correction: 'Les six faces sont identiques, sauf le nombre écrit dessus : rien n’en favorise une.',
              },
              {
                id: 's2',
                label: 'Les 2 issues « il pleut demain » / « il ne pleut pas demain »',
                options: ['Équiprobables', 'Pas équiprobables'],
                correct: 1,
                correction: 'Deux issues seulement ne veut pas dire une chance sur deux : selon la saison et le lieu, la pluie est bien plus ou bien moins probable.',
              },
              {
                id: 's3',
                label: 'Une roue partagée en 4 secteurs de tailles très différentes',
                options: ['Équiprobables', 'Pas équiprobables'],
                correct: 1,
                correction: 'L’aiguille s’arrête plus souvent sur les grands secteurs : la taille change la chance.',
              },
              {
                id: 's4',
                label: 'Les 2 issues « Pile » / « Face » d’une pièce ordinaire',
                options: ['Équiprobables', 'Pas équiprobables'],
                correct: 0,
                correction: 'La pièce est symétrique : rien ne distingue les deux côtés du point de vue du lancer.',
              },
            ]}
            requires={['equiprobabilite']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le nombre d’issues ne décide de rien : <strong>deux</strong> issues peuvent être
                  très inégales (la pluie), et <strong>six</strong> parfaitement égales (le dé).
                  Ce qui décide, c’est la <strong>symétrie du dispositif</strong>.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Le piège classique est de compter les issues : « deux
                  possibilités, donc une chance sur deux ». Faux — demande-toi plutôt si quelque
                  chose, dans le dispositif, favorise l’une des issues.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Tu sais lister les issues, décrire un événement et vérifier l’égalité des chances.
              Il te manque un <strong>nombre</strong> — et pour le trouver, on va lancer
              beaucoup, beaucoup plus.
            </Feedback>
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
      moduleTitle="Le sac qui n’est pas juste"
      moduleSubtitle="Même dispositif, deux réponses opposées"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Trois rouges, deux bleues, une verte',
        tone: 'indigo',
        body: (
          <p>
            Toutes les billes se ressemblent au toucher, et pourtant le rouge sort bien plus
            souvent. Sont-elles à égalité, oui ou non&nbsp;? La réponse dépend de ce que tu
            appelles un résultat — et c’est <strong>la question qu’on doit se poser avant tout
            calcul</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
