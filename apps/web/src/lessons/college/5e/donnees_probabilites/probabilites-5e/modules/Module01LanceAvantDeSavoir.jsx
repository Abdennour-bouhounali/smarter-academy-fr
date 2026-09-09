import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExperienceLab from '../components/ExperienceLab';

/**
 * Module 1 — DÉCLENCHEUR : lancer avant de savoir.
 *
 * Le module OUVRE sur la manipulation (§6bis, memory « M1 lab first ») :
 * l'élève lance un dé, réellement, plusieurs fois. Il a écrit sa prédiction
 * AVANT — non pour être noté, mais pour constater lui-même que prédire un
 * lancer est impossible, alors que prédire la LISTE des résultats possibles
 * est facile. C'est tout l'écart sur lequel la leçon est bâtie.
 *
 * Expected observation : « je ne peux pas dire ce que je vais obtenir, mais
 * je peux dire à coup sûr que ce sera un nombre entre 1 et 6 ».
 * Misconception targeted : croire que le hasard est totalement imprévisible
 * (donc qu'il n'y a rien à calculer) ; ou au contraire croire qu'on peut
 * « sentir » le prochain résultat, et qu'un 6 « est dû » après une série sans 6.
 *
 * AUCUN NOMBRE ici : ni fraction, ni quotient, ni le mot « probabilité ».
 * Le module ne produit qu'un constat qualitatif.
 */
export default function Module01LanceAvantDeSavoir() {
  const [prediction, setPrediction] = useState(null);
  const [historique, setHistorique] = useState([]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const assezLance = historique.length >= 3;

  const steps = [
    {
      num: 1,
      title: 'Écris ta prédiction, puis lance',
      subtitle: 'Trois lancers au moins. Regarde si ta prédiction tient.',
      done: q1,
      content: (
        <div className="space-y-3">
          {/* La prédiction est recueillie SANS verdict, avant le geste. */}
          <PredictionChips
            prompt="Avant de lancer : quel nombre vas-tu obtenir au prochain lancer ?"
            options={[1, 2, 3, 4, 5, 6].map((n) => ({ id: String(n), label: String(n) }))}
            value={prediction}
            onChange={setPrediction}
          />

          {/* La manipulation ouvre le module. */}
          <ExperienceLab
            experience="de"
            historique={historique}
            onLancer={(r) => setHistorique((h) => [...h, r])}
          />

          {assezLance && prediction && (
            <Feedback tone="info">
              Tu avais annoncé <strong>{prediction}</strong>. Sur tes {historique.length} lancers,
              tu l’as obtenu{' '}
              <strong>
                {historique.filter((h) => h === prediction).length} fois
              </strong>
              . Relance encore : ta prédiction ne devient jamais fiable.
            </Feedback>
          )}

          <TapQuestion
            prompt="Après plusieurs lancers : peut-on prédire à coup sûr le résultat du prochain ?"
            options={[
              'Non — mais on sait d’avance que ce sera 1, 2, 3, 4, 5 ou 6',
              'Oui, en observant bien les lancers précédents',
              'Non, et on ne sait rien du tout à l’avance',
              'Oui, si on lance toujours de la même façon',
            ]}
            correct={0}
            cols={1}
            /* Aucune notion de la leçon n'est requise : c'est le constat brut
               du geste qui vient d'être fait. */
            requires={[]}
            explain="Deux choses à la fois : le résultat exact est imprévisible, et pourtant la LISTE des résultats possibles est connue d’avance. C’est cette liste qui va permettre de calculer quelque chose."
            explainWrong="Ce n’est pas « on ne sait rien » : tu es certain que le dé ne donnera pas 7, ni 0, ni « rouge ». Tu connais parfaitement l’ensemble des résultats possibles — seul le tirage reste inconnu."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le mot pour ça',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="experience-aleatoire"
            variant="new"
            lead={<>Ce que tu viens de faire — connaître les possibilités sans connaître le résultat — décrit une famille précise d’expériences.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Ces situations sont-elles des <strong>expériences aléatoires</strong> ?
              </p>
            }
            rows={[
              {
                id: 'a1',
                label: 'Tirer une carte dans un jeu mélangé, face cachée',
                options: ['Aléatoire', 'Pas aléatoire'],
                correct: 0,
                correction: 'On connaît les cartes du jeu, mais pas celle qui viendra. C’est bien du hasard.',
              },
              {
                id: 'a2',
                label: 'Mesurer la longueur de son crayon avec une règle',
                options: ['Aléatoire', 'Pas aléatoire'],
                correct: 1,
                correction: 'Le crayon a une longueur ; la mesurer donne toujours (à peu près) le même résultat. Rien n’est tiré au sort.',
              },
              {
                id: 'a3',
                label: 'Lancer une pièce de monnaie',
                options: ['Aléatoire', 'Pas aléatoire'],
                correct: 0,
                correction: 'Deux résultats possibles connus d’avance, aucun des deux garanti.',
              },
              {
                id: 'a4',
                label: 'Calculer 7 × 8',
                options: ['Aléatoire', 'Pas aléatoire'],
                correct: 1,
                correction: 'Le résultat est 56, aujourd’hui et demain. Un calcul n’a rien d’un tirage.',
              },
            ]}
            requires={['experience-aleatoire']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le test tient en une phrase : <strong>si on refait exactement la même chose,
                  peut-on obtenir autre chose&nbsp;?</strong> Si oui, c’est aléatoire.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Pour chaque ligne, imagine que tu recommences dix fois
                  à l’identique. Obtiens-tu toujours la même chose (pas aléatoire), ou cela
                  change-t-il (aléatoire) ?
                </Feedback>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège du joueur',
      subtitle: 'Une croyance très répandue — et fausse.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Un joueur lance un dé six fois sans jamais obtenir de 6. Il annonce :
                «&nbsp;maintenant, le 6 <strong>doit</strong> sortir&nbsp;». A-t-il raison ?
              </>
            }
            options={[
              'Non : le dé ne se souvient d’aucun lancer précédent',
              'Oui, car sur six lancers chaque face doit sortir une fois',
              'Oui, car le 6 est en retard',
              'Non, car le 6 ne sortira jamais',
            ]}
            correct={0}
            cols={1}
            requires={['experience-aleatoire']}
            explain="Le dé n’a pas de mémoire. Au septième lancer, le 6 a exactement la même chance qu’au premier — ni plus, ni moins. Aucun résultat n’est « dû »."
            explainWrong="Rien n’oblige les six faces à sortir une fois chacune en six lancers : on peut très bien obtenir six 3 d’affilée. C’est improbable, mais parfaitement possible."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Alors, que peut-on calculer&nbsp;? Rien sur UN lancer. Mais tu as dit toi-même que
              tu connaissais la liste des résultats possibles — c’est par elle qu’il faut
              commencer.
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
      moduleTitle="Lance avant de savoir"
      moduleSubtitle="Imprévisible, et pourtant pas inconnu"
      estimatedTime="9 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Devine ce que va donner ce dé',
        tone: 'indigo',
        body: (
          <p>
            Écris ta prédiction, puis lance. Tu vas te tromper — c’est prévu, et c’est même le
            sujet. Ce module te fait découvrir que le hasard n’est pas l’inconnu total :{' '}
            <strong>tu sais parfaitement ce qui peut arriver</strong>, tu ignores seulement ce
            qui arrivera.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
