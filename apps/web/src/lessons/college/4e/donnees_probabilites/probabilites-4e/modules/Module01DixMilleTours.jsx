import React, { useState } from 'react';
import { Sparkles, RotateCw } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoueLab from '../components/RoueLab';
import { GRAINE_LECON, graineSuivante, TAILLES_DE_SERIE } from '../components/proba4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              composer une roue, la faire tourner 10 fois, puis
 *                       100, 1 000 et 10 000, et regarder cinq séries à la
 *                       fois.
 * Mathematical objective la fréquence observée FLUCTUE d'une série à l'autre
 *                       et se resserre autour de la probabilité quand on
 *                       répète. Elle ne l'atteint jamais exactement.
 * Student action        régler la composition, choisir le nombre de tours,
 *                       relancer.
 * Controlled variable   la composition de la roue et la taille des séries.
 * Mathematical state    { composition, taille, graine } ; les fréquences, les
 *                       écarts et l'amplitude sont TOUS calculés par le noyau.
 * Visual consequence    cinq barres qui partent dans tous les sens à 10 tours
 *                       et se collent au trait noir à 10 000.
 * Expected observation  « l'écart entre la plus petite et la plus grande
 *                       fond quand on lance plus ».
 * Misconception targeted « à 10 000 tours, on tombera exactement sur la
 *                       probabilité » — l'écart devient petit, jamais nul.
 * Formalization         les mots « fluctuation » et « stabilisation » sont
 *                       posés au module 2 ; ici on les fait VOIR.
 *
 * CONTINUITÉ : la roue composée ici est mémorisée (`useLabState`) et revient
 * au module 6 — c'est la même expérience, vue d'abord de l'extérieur (les
 * fréquences) puis de l'intérieur (le modèle). Déclaré dans `lesson.config.js`.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur, comme une invitation, jamais comme un péage.
 */
const DEPART = { or: 3, violet: 2, turquoise: 2, rose: 1 };

export default function Module01DixMilleTours() {
  const roue = useLabState(LESSON_CONFIG.id, 'roue', DEPART);
  const [composition, setComposition] = useState(roue.value);
  const [taille, setTaille] = useState(TAILLES_DE_SERIE[0]);
  const [graine, setGraine] = useState(GRAINE_LECON);
  const [lance, setLance] = useState(false);
  const [taillesVues, setTaillesVues] = useState([]);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const lancer = (t) => {
    setTaille(t);
    setLance(true);
    setTaillesVues((v) => (v.includes(t) ? v : [...v, t]));
  };

  const done1 = lance && taillesVues.length >= 1;
  // L'élève doit avoir vu les DEUX extrêmes : c'est là que le phénomène est visible.
  const done2 = taillesVues.includes(TAILLES_DE_SERIE[0])
    && taillesVues.includes(TAILLES_DE_SERIE[TAILLES_DE_SERIE.length - 1]);

  const lab = (
    <RoueLab
      composition={composition}
      onComposition={(c) => { setComposition(c); roue.save(c); }}
      taille={taille}
      onTaille={lancer}
      graine={graine}
      onRelancer={() => setGraine((g) => graineSuivante(g))}
      lance={lance}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Compose ta roue, puis lance-la',
      subtitle: 'Choisis combien de secteurs de chaque couleur, puis un nombre de tours.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Sur 10 tours, combien de fois penses-tu tomber sur l’or ?"
            options={[
              { id: 'exact', label: 'Exactement 3 fois' },
              { id: 'autour', label: 'Autour de 3, mais pas exactement' },
              { id: 'imprevisible', label: 'Vraiment n’importe quoi' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {done1 && (
            <Feedback tone="info">
              Cinq séries de {taille.toLocaleString('fr-FR')} tours, et cinq résultats différents.
              Le trait noir marque la probabilité — celle que la composition de ta roue impose.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Monte jusqu’à dix mille',
      subtitle: 'Lance les quatre tailles, et surveille l’écart affiché en bas.',
      done: done2,
      content: (
        <div className="space-y-3">
          {lab}
          {!done2 && (
            <Feedback tone="info">
              Tailles essayées : {taillesVues.length ? taillesVues.map((t) => t.toLocaleString('fr-FR')).join(', ') : 'aucune'}.
              Il te manque {taillesVues.includes(TAILLES_DE_SERIE[0]) ? '' : '10 tours'}
              {!taillesVues.includes(TAILLES_DE_SERIE[0]) && !taillesVues.includes(10000) ? ' et ' : ''}
              {taillesVues.includes(10000) ? '' : '10 000 tours'}.
            </Feedback>
          )}
          {done2 && (
            <Feedback tone="ok">
              À 10 tours, les cinq séries s’éparpillent. À 10 000, elles se collent au trait.
              L’écart affiché en bas a fondu.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que tu viens de voir',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quand on passe de 10 à 10 000 tours, que devient le nombre affiché en bas — l’écart entre la plus petite et la plus grande des cinq barres ?"
            options={[
              'Il diminue nettement',
              'Il reste le même',
              'Il augmente',
              'Il devient exactement zéro',
            ]}
            correct={0}
            cols={2}
            requires={['frequence-observee', 'probabilite']}
            explain="Les cinq séries se resserrent autour du trait noir. Elles ne se confondent pas avec lui : l’écart devient petit, il ne s’annule pas."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="fluctuation"
              variant="new"
              lead="Ce que tu observes d’une série à l’autre porte un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et si on lançait un million de fois ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="En lançant un très grand nombre de fois, la fréquence observée finira-t-elle par valoir EXACTEMENT la probabilité ?"
            options={[
              'Non, mais elle s’en approche de plus en plus',
              'Oui, à partir d’un certain nombre de lancers',
              'Non, elle reste toujours aussi éloignée',
              'Cela dépend de la couleur choisie',
            ]}
            correct={0}
            cols={1}
            requires={['fluctuation', 'probabilite']}
            explain="Aucune de tes séries n’est jamais tombée pile sur le trait. Plus on lance, plus on s’en approche — mais s’approcher n’est pas atteindre."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Une question reste ouverte : deux séries de même taille donnent-elles toujours des
              résultats aussi différents ? C’est le module suivant.
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
      moduleTitle="Dix mille tours"
      moduleSubtitle="Ce que le hasard fait quand on le répète"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'La roue de la fête foraine',
        tone: 'indigo',
        body: (
          <>
            Tu connais la probabilité de tomber sur l’or : elle se lit sur la roue. Mais que
            donne un vrai lancer ? <strong>Et cent ? Et dix mille ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <RotateCw className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            Compose ta roue, puis lance. <Sparkles className="inline h-4 w-4" aria-hidden="true" />{' '}
            Cinq séries partent à chaque fois : regarde à quel point elles se ressemblent — ou pas.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
