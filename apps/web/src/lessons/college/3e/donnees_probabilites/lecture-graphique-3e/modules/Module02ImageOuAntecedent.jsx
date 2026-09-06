import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphProbe from '../components/GraphProbe';
import { antecedents } from '../components/readingUtils';
import { BALLOON } from '../components/balloonData';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 2 — DÉCOUVERTE : « Image ou antécédent ».
 *
 * Activity: basculer la sonde d'un axe à l'autre sur la MÊME courbe, et
 *   compter combien de réponses chaque sens produit.
 * Mathematical objective: la dissymétrie. Chercher une image, c'est descendre
 *   d'une heure vers la courbe : une seule réponse. Chercher un antécédent,
 *   c'est balayer horizontalement : autant de réponses que de croisements.
 * Student action: choisir le mode, puis déplacer la sonde.
 * Controlled variable: l'axe piloté, puis la valeur.
 * Mathematical state: { mode, value } ; `antecedents` renvoie une LISTE, et
 *   c'est cette liste que le composant affiche — impossible de n'en montrer
 *   qu'une par erreur.
 * Visual consequence: en mode altitude, quatre points s'allument d'un coup à
 *   400 m. Le contraste avec le mode heure est immédiat.
 * Expected observation: « une heure donne une altitude, une altitude peut
 *   donner quatre heures ».
 * Misconception targeted: « à chaque valeur correspond une seule autre » — la
 *   symétrie supposée entre les deux sens de lecture.
 * Feedback: le décompte est écrit en clair (« atteinte 4 fois : à 2 h, 5 h… »).
 * Formalization: la MÉTHODE du guide horizontal — « balayer toute la largeur
 *   avant de conclure » — posée sur le geste qui vient d'être fait.
 * Scaffolding: exploration des deux extrêmes → décompte → méthode → cas à zéro.
 * Transfer: le module 4 s'en sert pour les extremums.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   L'étape 3 était une question « devine le mot » : « antécédent » y
 *   apparaissait pour la PREMIÈRE fois dans le texte des options, et n'était
 *   expliqué qu'ensuite, dans l'`explain`. Un élève ne pouvait donc que
 *   deviner. L'étape est retournée :
 *     étape 1  balayer la courbe avec le guide horizontal (le geste)
 *     étape 2  compter les croisements — sans nommer quoi que ce soit
 *     étape 3  rappel `antecedent` (acquis de fonctions-3e) PUIS brique
 *              `tous-les-antecedents` (ce que la lecture graphique ajoute),
 *              et seulement alors la question, devenue une application
 *     étape 4  le cas à zéro, puis la brique `mem-un-sens-pas-lautre`
 *   Le mot n'est plus la réponse à trouver : la méthode l'est.
 */

const Y_MANY = 400;      // atteint 4 fois
const Y_NONE = 800;      // jamais atteint

export default function Module02ImageOuAntecedent() {
  const [mode, setMode] = useState('y');
  const [value, setValue] = useState(400);
  const [seen, setSeen] = useState(() => new Set());
  const [countDone, setCountDone] = useState(false);
  const [vocabDone, setVocabDone] = useState(false);
  const [noneDone, setNoneDone] = useState(false);

  // On veut que l'élève ait vu une altitude à PLUSIEURS antécédents et une
  // altitude jamais atteinte : c'est la comparaison qui enseigne.
  const nb = mode === 'y' ? antecedents(BALLOON, value).length : -1;
  const record = (m, v) => {
    if (m !== 'y') return;
    const n = antecedents(BALLOON, v).length;
    setSeen((prev) => new Set(prev).add(n >= 3 ? 'plusieurs' : n === 0 ? 'aucun' : 'peu'));
  };
  const explored = seen.has('plusieurs') && seen.has('aucun');

  const change = (v, kit) => {
    setValue(v);
    record(mode, v);
    kit.react(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Image ou antécédent"
      moduleSubtitle="Un guide vertical donne une réponse. Un guide horizontal peut en donner quatre."
      estimatedTime="9 min"
      brief={{
        tag: '🔁 Mission 02',
        title: 'La sonde change de sens',
        tone: 'indigo',
        body: (
          <p>
            Même courbe, même sonde — mais tournée de 90°. Compare le nombre de réponses
            que donne chaque sens de lecture.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Cherche une altitude jamais atteinte, et une atteinte plusieurs fois',
          subtitle: 'Reste en mode « altitude » et promène la sonde de haut en bas.',
          done: explored,
          content: (kit) => (
            <div className="space-y-3">
              <GraphProbe
                curve={BALLOON}
                mode={mode}
                value={value}
                onChange={(v) => change(v, kit)}
                onModeChange={(m) => { setMode(m); setValue(m === 'y' ? 400 : 3); }}
                ariaLabel="Repère : la sonde peut suivre l’un ou l’autre axe"
              />
              <Feedback tone={explored ? 'ok' : 'info'}>
                {explored ? (
                  <>
                    Une même altitude peut être atteinte <strong>plusieurs fois</strong> — ou
                    <strong> jamais</strong>. Dans l’autre sens, une heure ne donne jamais
                    qu’une seule altitude : le ballon ne peut pas être à deux hauteurs à la
                    fois.
                  </>
                ) : (
                  <>
                    Il te reste à trouver une altitude{' '}
                    {!seen.has('plusieurs') && <strong>atteinte au moins trois fois</strong>}
                    {!seen.has('plusieurs') && !seen.has('aucun') && ' et une '}
                    {!seen.has('aucun') && <strong>jamais atteinte</strong>}.
                  </>
                )}
              </Feedback>
            </div>
          ),
        },
        {
          num: 2,
          title: 'Combien de fois ?',
          done: countDone,
          content: (kit) => (
            <NumericQuestion
              prompt="Combien de fois le ballon est-il passé par 400 m ?"
              expected={antecedents(BALLOON, Y_MANY).length}
              parse={parseDec}
              display={formatDec(antecedents(BALLOON, Y_MANY).length)}
              suffix="fois"
              requires={['lecture-image-graphique']}
              explain={`Quatre fois : à ${antecedents(BALLOON, Y_MANY).map((x) => `${formatDec(x)} h`).join(', ')}. Le guide horizontal coupe la courbe en quatre endroits.`}
              explainFor={(n) => {
                if (n === 1) return 'C’est le réflexe de l’image : dans ce sens-là, il n’y a effectivement qu’une réponse. Mais ici on part de l’altitude.';
                if (n === 400) return 'Tu as redonné l’altitude. La question porte sur le NOMBRE de passages.';
                return null;
              }}
              solved={countDone}
              onAnswered={(ok) => { setCountDone(true); kit.react(ok); }}
            />
          ),
        },
        {
          num: 3,
          title: 'Le geste que tu viens de faire porte un nom',
          subtitle: 'Tu as balayé la courbe à hauteur constante et relevé chaque croisement.',
          done: vocabDone,
          content: (kit) => (
            <div className="space-y-3">
              <KnowledgeBrick
                id="antecedent"
                variant="rappel"
                compact
                lead="Les quatre heures que tu viens de relever pour 400 m portent déjà ce nom-là, vu avec les machines à nombres."
              />
              <KnowledgeBrick
                id="tous-les-antecedents"
                variant="new"
                lead="Sur un dessin, en trouver UN ne suffit pas : voici le geste complet."
              >
                <TapQuestion
                  prompt="L’altitude 200 m est atteinte quatre fois. Comment t’en assurer sans en oublier ?"
                  options={[
                    'En suivant le guide horizontal à 200 m d’un bout à l’autre du repère',
                    'En s’arrêtant au premier croisement rencontré',
                    'En lisant la valeur écrite sur l’axe vertical',
                    'En cherchant le point le plus haut de la courbe',
                  ]}
                  correct={0}
                  cols={1}
                  requires={['tous-les-antecedents']}
                  explain={`Le guide horizontal traverse tout le repère : à 200 m il coupe la courbe à ${antecedents(BALLOON, 200).map((x) => `${formatDec(x)} h`).join(', ')}. S’arrêter au premier croisement, c’est en oublier trois.`}
                  explainWrong="Un antécédent se lit sur l’axe horizontal, et il faut balayer toute la largeur du repère avant de conclure."
                  solved={vocabDone}
                  onAnswered={(ok) => { setVocabDone(true); kit.react(ok); }}
                />
              </KnowledgeBrick>
            </div>
          ),
        },
        {
          num: 4,
          title: 'Et quand il n’y a aucune réponse ?',
          done: noneDone,
          content: (
            <div className="space-y-3">
              <TapQuestion
                prompt="Combien d’antécédents l’altitude 800 m a-t-elle ?"
                options={['Aucun : le ballon n’est jamais monté si haut', 'Un seul', 'Deux', 'Quatre']}
                correct={0}
                cols={2}
                requires={['tous-les-antecedents']}
                explain="Le guide placé à 800 m ne coupe la courbe nulle part : cette altitude n’a aucun antécédent. Une valeur peut donc en avoir zéro, un, ou plusieurs — mais une heure a toujours exactement une altitude."
                explainWrong="Suis le guide horizontal à 800 m sur toute la largeur : il ne rencontre la courbe nulle part."
                solved={noneDone}
                onAnswered={() => setNoneDone(true)}
              />
              {noneDone && (
                <KnowledgeBrick
                  id="mem-un-sens-pas-lautre"
                  variant="new"
                  compact
                  lead="Tu as maintenant vu les trois cas : quatre réponses, une seule, aucune. Voilà la dissymétrie, à retenir telle quelle."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais interroger la courbe dans les deux sens. Reste à
          savoir ce que valent vraiment les nombres que tu lis : au module suivant, c’est
          l’échelle de l’axe qui décide.
        </KnowledgeSnapshot>
      )}
    />
  );
}
