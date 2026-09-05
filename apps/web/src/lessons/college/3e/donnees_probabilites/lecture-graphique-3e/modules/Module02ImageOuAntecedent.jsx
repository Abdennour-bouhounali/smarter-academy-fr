import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraphProbe from '../components/GraphProbe';
import { antecedents, image, isReadingOk } from '../components/readingUtils';
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
 * Formalization: les mots image et antécédent sont posés à l'étape 3, sur des
 *   gestes déjà faits.
 * Scaffolding: mode imposé → mode libre → vocabulaire → cas à zéro antécédent.
 * Transfer: le module 4 s'en sert pour les extremums.
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
          title: 'Les deux mots',
          done: vocabDone,
          content: (
            <TapQuestion
              prompt={<>À 3 h le ballon est à 600 m. Quelle phrase est exacte ?</>}
              options={[
                '600 est l’image de 3, et 3 est un antécédent de 600',
                '3 est l’image de 600, et 600 un antécédent de 3',
                '3 et 600 sont deux images',
                'Ni l’un ni l’autre : ce sont des coordonnées',
              ]}
              correct={0}
              cols={1}
              explain="L’heure est ce qu’on ENTRE, l’altitude ce qui SORT : 600 est l’image de 3, et 3 est un antécédent de 600. « Un » antécédent, car 600 en a d’autres — ici 4 h et 10 h."
              explainWrong="On entre une heure et on lit une altitude : l’image est donc l’altitude, et l’heure est l’antécédent."
              solved={vocabDone}
              onAnswered={() => setVocabDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Et quand il n’y a aucune réponse ?',
          done: noneDone,
          content: (
            <TapQuestion
              prompt="Combien d’antécédents l’altitude 800 m a-t-elle ?"
              options={['Aucun : le ballon n’est jamais monté si haut', 'Un seul', 'Deux', 'Quatre']}
              correct={0}
              cols={2}
              explain="Le sommet du vol est à 600 m. Le guide placé à 800 m ne coupe la courbe nulle part : cette altitude n’a aucun antécédent. Une valeur peut donc en avoir zéro, un, ou plusieurs — mais une heure a toujours exactement une altitude."
              explainWrong="Regarde le point le plus haut de la courbe : le ballon n’a jamais dépassé 600 m."
              solved={noneDone}
              onAnswered={() => setNoneDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          <strong>À retenir.</strong> Chercher une <strong>image</strong> : on part de
          l’abscisse et on descend sur la courbe — une seule réponse. Chercher un{' '}
          <strong>antécédent</strong> : on part de l’ordonnée et on balaye — zéro, une ou
          plusieurs réponses.
        </Feedback>
      }
    />
  );
}
