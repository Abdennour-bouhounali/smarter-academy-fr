import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConstructeurEuler from '../components/ConstructeurEuler';
import { NB_PAS, DEPARTS, ligneEuler, fr, affiche } from '../components/expoUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : la courbe qui construit
 * sa propre pente (components/ConstructeurEuler.jsx).
 *
 * Étape 1  CONSTRUIRE. L'élève tire les quatre extrémités depuis la hauteur 1.
 *          À chaque pas la règle « la pente vaut la hauteur » lui dicte un seul
 *          endroit possible. C'est le geste, avant tout mot.
 * Étape 2  CHANGER LE DÉPART. Les trois hauteurs se construisent aussi bien ;
 *          mais une seule passe par 1. Deux exigences, une seule courbe.
 * Étape 3  la question qui compte : combien de courbes satisfont les DEUX
 *          exigences à la fois ?
 * Étape 4  et cette courbe, comment s'appelle-t-elle ? — posé comme une
 *          QUESTION, jamais nommé.
 *
 * Rien ne s'appelle « exponentielle » ni « e » avant le module 2 : le module
 * se termine en DEMANDANT ce que le suivant nommera (§6bis.1).
 *
 * CONNAISSANCES AVANT LA DEMANDE. Le module 1 ne pose AUCUNE brique : il
 * construit le phénomène, et les briques qui le disent sont posées au module 2,
 * quand le mot arrive. Les questions n'exigent donc que des `priorKnowledge`.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée — c'est précisément là qu'on veut recommencer avec un autre départ.
 * `verrouille` ne porte QUE le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 */
export default function Module01LaCourbeQuiConstruitSaPente() {
  // Étape 1 : la construction depuis la hauteur imposée 1.
  const [hauteurs1, setHauteurs1] = useState([]);
  const [brouillon1, setBrouillon1] = useState(null);

  // Étape 2 : l'élève choisit son départ et reconstruit.
  const [depart2, setDepart2] = useState(0.5);
  const [hauteurs2, setHauteurs2] = useState([]);
  const [brouillon2, setBrouillon2] = useState(null);
  const [vus2, setVus2] = useState([]);

  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = hauteurs1.length >= NB_PAS;
  // L'objectif de l'étape 2 : avoir MENÉ À TERME au moins deux départs
  // différents. Un seul ne montrerait pas que le choix change la courbe.
  const done2 = vus2.length >= 2;

  const finirDepart2 = (react) => {
    if (vus2.includes(depart2)) return;
    const suivant = [...vus2, depart2];
    setVus2(suivant);
    if (!done2 && suivant.length >= 2) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Construis la courbe, segment par segment',
      subtitle:
        'Tu pars de la hauteur 1. Attrape l’extrémité du segment et fais-la glisser : la règle t’impose une pente égale à la hauteur atteinte. Pose les quatre segments.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <ConstructeurEuler
            depart={1}
            hauteurs={hauteurs1}
            brouillon={brouillon1}
            onChangeHauteur={setBrouillon1}
            onValider={() => {
              const suivant = [...hauteurs1, brouillon1];
              setHauteurs1(suivant);
              setBrouillon1(null);
              if (suivant.length >= NB_PAS) kit.react?.(true);
            }}
          />
          {done1 ? (
            <Feedback tone="ok">
              Quatre segments, et pas une seule fois le choix : à chaque pas, la hauteur atteinte
              dictait la pente suivante. Les hauteurs successives ont été{' '}
              <strong>{ligneEuler(1).map((p) => fr(affiche(p.y))).join(' → ')}</strong>. Remarque
              que la pente n’a jamais été deux fois la même : cette courbe n’est pas une droite.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Segments posés : {hauteurs1.length} sur {NB_PAS}. La zone bleue montre où la règle
              t’oblige à aller — le point s’y accroche tout seul quand tu en approches.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et si on partait de plus bas ? De plus haut ?',
      subtitle:
        'Choisis une autre hauteur de départ et refais la construction en entier. Puis une troisième si tu veux. La règle est la même — mais la courbe ?',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="en changeant la hauteur de départ, que va devenir la courbe ?"
            options={[
              { id: 'meme', label: 'Ce sera exactement la même courbe' },
              { id: 'decalee', label: 'Une autre courbe, de la même allure' },
              { id: 'impossible', label: 'La construction deviendra impossible' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <ConstructeurEuler
            depart={depart2}
            onChangeDepart={(d) => {
              setDepart2(d);
              setHauteurs2([]);
              setBrouillon2(null);
            }}
            hauteurs={hauteurs2}
            brouillon={brouillon2}
            onChangeHauteur={setBrouillon2}
            onValider={() => {
              const suivant = [...hauteurs2, brouillon2];
              setHauteurs2(suivant);
              setBrouillon2(null);
              if (suivant.length >= NB_PAS) finirDepart2(kit.react);
            }}
            verrouille={!done1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                {pred === 'decalee' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà ce qui se passe'} :
                la construction marche pour <strong>chaque</strong> hauteur de départ, et donne à
                chaque fois une courbe différente. La règle « la pente vaut la hauteur » ne suffit
                donc pas à désigner UNE courbe : il en existe une par départ.
              </Feedback>
              <Feedback tone="info">
                Mais regarde les départs : {DEPARTS.map((d) => fr(d)).join(', ')}. Un seul vaut
                exactement <strong>1</strong>. Si l’on ajoute l’exigence « je pars de la hauteur
                1 », combien de courbes restent possibles ?
              </Feedback>
            </>
          ) : (
            <Feedback tone="info">
              Départs menés jusqu’au bout : {vus2.length} sur 2. Change de hauteur de départ avec
              les boutons, puis repose les quatre segments.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux exigences à la fois',
      done: q3,
      content: (
        <TapQuestion
          prompt="On cherche maintenant une courbe qui satisfasse LES DEUX exigences : sa pente vaut sa hauteur en chaque point, ET elle passe par la hauteur 1 au départ. Combien y en a-t-il ?"
          options={[
            'Une seule : la première exigence laisse une courbe par hauteur de départ, et la seconde choisit laquelle',
            'Aucune : les deux exigences se contredisent',
            'Une infinité, comme avec la première exigence seule',
            'Exactement trois, une par hauteur de départ proposée',
          ]}
          correct={0}
          cols={1}
          requires={['fonction', 'pente']}
          explain="La première exigence laisse exactement une courbe par hauteur de départ — tu les as construites. La seconde fixe cette hauteur à 1. Il ne reste donc qu’une seule possibilité : les deux exigences, ensemble, désignent une courbe et une seule."
          explainWrong="Reprends ta construction : pour CHAQUE départ, elle a marché — les exigences ne se contredisent donc pas, et il y a bien plus de trois départs possibles. Ce qu’il faut voir, c’est que fixer le départ à 1 ne laisse plus qu’une seule de ces courbes."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Comment s’appelle cette courbe ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <ConstructeurEuler
            depart={1}
            hauteurs={ligneEuler(1).slice(1).map((p) => p.y)}
            montrerAide={false}
            montrerSolution
            onChangeHauteur={() => {}}
            verrouille
            ariaLabel="La ligne brisée construite depuis la hauteur 1, comparée en pointillés à la courbe qu’elle approche."
          />
          <Feedback tone="info">
            En pointillés, la courbe vers laquelle ta construction tend. Ta ligne brisée passe un
            peu <strong>en dessous</strong> : normal, tes segments sont droits alors que la vraie
            courbe se redresse déjà entre deux points. Avec des pas plus fins, l’écart diminue.
          </Feedback>
          <TapQuestion
            prompt="Cette courbe — la seule dont la pente vaut la hauteur en chaque point et qui part de 1 — porte un nom en mathématiques. Que peux-tu déjà en dire à coup sûr ?"
            options={[
              'Elle monte partout, de plus en plus vite, et elle ne semble jamais redescendre ni toucher l’axe',
              'C’est une droite, puisqu’on l’a construite avec des segments',
              'Elle finit par redescendre après un certain point',
              'Elle coupe l’axe des abscisses quelque part à gauche',
            ]}
            correct={0}
            cols={1}
            requires={['fonction', 'pente', 'variations']}
            explain="Tout ce que tu as observé le dit : la hauteur augmente à chaque pas, et comme la pente EST la hauteur, plus elle monte, plus elle monte vite. Cette courbe a un nom, et le module suivant le donne — avec la raison pour laquelle elle ne peut pas toucher l’axe."
            explainWrong="Ce n’est pas une droite : la pente a changé à chaque segment, tu l’as lue toi-même. Et rien dans la règle ne la fait redescendre — une hauteur positive impose une pente positive, donc une montée."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La courbe qui construit sa propre pente"
      moduleSubtitle="Une seule règle, et presque plus aucune liberté"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Une règle, et rien d’autre',
        tone: 'indigo',
        body: (
          <p>
            Voici une exigence étrange : que la <strong>pente</strong> de la courbe soit égale à sa{' '}
            <strong>hauteur</strong>, en chaque point. Construis-la toi-même, segment par segment,
            et regarde combien de liberté il te reste.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Le mot juste.</strong> Cette courbe unique, qui monte toujours et ne touche
          jamais l’axe, porte un nom et une notation : module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
