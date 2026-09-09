import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DomaineLab from '../components/DomaineLab';
import { AMBIGU, formatAbscissa, lieuById, sharingAbscissa } from '../components/reperageUtils';

/**
 * Module 1 — DÉCLENCHEUR : un seul nombre ne suffit pas.
 *
 * Le module OUVRE sur la manipulation (§6bis, et la règle « lab d'abord, pas
 * de portillon de prédiction ») : dès l'étape 1, l'élève tient le curseur.
 *
 * Ce qu'il découvre n'est PAS l'abscisse — il la connaît, elle vient de la 6e
 * et de la leçon voisine sur les relatifs. Ce qu'il découvre, c'est que
 * l'abscisse seule désigne une COLONNE ENTIÈRE de la carte : deux lieux
 * s'allument ensemble. Le manque est constaté par le geste, jamais affirmé
 * par un texte, et c'est lui qui rendra le second axe nécessaire au module 2.
 *
 * Expected observation : « ce nombre ne dit pas OÙ, il dit seulement sur
 * quelle colonne ».
 * Misconception targeted : croire qu'un repérage à un nombre suffit dès qu'on
 * sait lire une droite graduée.
 */
export default function Module01UnSeulNombreSuffitIl() {
  // Le curseur démarre AILLEURS que sur la colonne ambiguë : l'élève doit
  // l'atteindre lui-même pour que la découverte soit la sienne.
  const [x, setX] = useState(1);
  const [vuAmbigu, setVuAmbigu] = useState(false);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const partages = sharingAbscissa(x);

  const bouger = (next, react) => {
    setX(next);
    if (sharingAbscissa(next).length >= 2 && !vuAmbigu) {
      setVuAmbigu(true);
      react?.(true);
    }
  };

  const sommet = lieuById('sommet');
  const lac = lieuById('lac');

  const steps = [
    {
      num: 1,
      title: 'Un seul curseur pour désigner un lieu',
      subtitle: 'Fais glisser le curseur et regarde ce qui s’allume sur la carte.',
      done: vuAmbigu,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3.5 text-sm text-slate-700">
            Tu donnes rendez-vous à quelqu’un sur le domaine. Pour l’instant, tu ne peux lui
            donner qu’<strong>un seul nombre</strong> : la position sur la règle horizontale, sous
            la carte. Le chalet d’accueil est le <strong>0</strong>.
          </div>

          <DomaineLab
            axis="x"
            x={x}
            onX={(next) => bouger(next, kit.react)}
            ariaLabel="Carte du domaine — un seul curseur d’abscisse"
          />

          {/* La prédiction vit DANS le lab, sans verdict : elle invite à
              réfléchir, elle ne conditionne rien (§6ter.3). */}
          {!vuAmbigu && (
            <PredictionChips
              prompt="À ton avis, un seul nombre peut-il toujours désigner un seul lieu ?"
              options={[
                { id: 'oui', label: 'Oui, toujours' },
                { id: 'non', label: 'Non, pas toujours' },
              ]}
              value={pred}
              onChange={setPred}
            />
          )}

          {vuAmbigu ? (
            <Feedback tone="ok">
              Tu y es : à l’abscisse <strong>{formatAbscissa(AMBIGU.x)}</strong>, ce sont{' '}
              <strong>{sommet.nom}</strong> et <strong>{lac.nom}</strong> qui s’allument tous les
              deux. Le nombre {formatAbscissa(AMBIGU.x)} ne désigne pas un lieu : il désigne
              <strong> toute une colonne</strong> de la carte.
            </Feedback>
          ) : partages.length === 1 ? (
            <Feedback tone="info">
              Ici un seul lieu s’allume — mais continue de chercher : il existe une position où
              <strong> deux lieux</strong> s’allument en même temps.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Aucun lieu sur cette colonne. Balaie la règle : certaines colonnes portent un lieu,
              et l’une d’elles en porte <strong>deux</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que le nombre dit, et ce qu’il ne dit pas',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Rappel juste-à-temps : l'abscisse n'est pas enseignée ici, elle
              vient des relatifs. La brique la remet en place pour la nommer
              avant que la question suivante ne l'emploie. */}
          <KnowledgeBrick
            id="abscisse"
            variant="rappel"
            lead={<>Le nombre que tu viens de faire varier porte un nom que tu connais déjà.</>}
          />
          <TapQuestion
            prompt={
              <>
                Ton camarade est au <strong>{lac.nom}</strong>. Tu lui écris seulement «{' '}
                <span className="font-mono font-bold">{formatAbscissa(AMBIGU.x)}</span> ». Que
                peut-il en conclure ?
              </>
            }
            options={[
              'Qu’il peut être au Lac gelé ou au Sommet : le nombre ne tranche pas',
              'Qu’il est forcément au Lac gelé',
              'Qu’il est forcément au Sommet',
              'Que le nombre est faux',
            ]}
            correct={0}
            cols={1}
            requires={['abscisse']}
            explain={`Les deux lieux ont la même abscisse ${formatAbscissa(AMBIGU.x)}. Le nombre situe la colonne, il ne dit pas à quelle hauteur on se trouve.`}
            explainWrong={`Rien ne permet de trancher : ${sommet.nom} et ${lac.nom} ont exactement la même abscisse ${formatAbscissa(AMBIGU.x)}. C’est justement le problème — ce nombre désigne les deux.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Que manque-t-il ?',
      subtitle: 'Nomme l’information qui permettrait de trancher.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quelle information supplémentaire distinguerait le Sommet du Lac gelé ?"
            options={[
              'À quelle hauteur on se trouve sur la carte',
              'La couleur de la piste',
              'Le nom du lieu',
              'L’heure du rendez-vous',
            ]}
            correct={0}
            cols={1}
            requires={['abscisse']}
            explain="Les deux lieux diffèrent par leur HAUTEUR sur la carte : le Sommet est en haut, le Lac gelé en bas. Il faut donc un second nombre, pour la direction verticale."
            explainWrong="Le nom ou la couleur ne sont pas des informations de position : ils ne se lisent pas sur un axe. Ce qui sépare vraiment les deux lieux, c’est leur hauteur sur la carte."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />

          {q3 && (
            <KnowledgeBrick
              id="deuxieme-dimension"
              variant="new"
              lead={<>C’est le constat qui ouvre toute la leçon : un nombre situe une colonne, pas un endroit.</>}
            />
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
      moduleTitle="Un seul nombre suffit-il ?"
      moduleSubtitle="Le manque qui rend le repère nécessaire"
      estimatedTime="9 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Donner rendez-vous avec un seul nombre',
        tone: 'indigo',
        body: (
          <p>
            Tu sais déjà lire une position sur une droite graduée, négatifs compris. Reste une
            question : <strong>cela suffit-il pour désigner un endroit sur une carte ?</strong>{' '}
            Fais glisser le curseur, et regarde ce qui s’allume.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
