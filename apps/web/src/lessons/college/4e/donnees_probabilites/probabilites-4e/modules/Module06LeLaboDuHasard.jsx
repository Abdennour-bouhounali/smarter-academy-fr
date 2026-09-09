import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RoueLab from '../components/RoueLab';
import { parseDec } from '@smarter-academy/core';
import { GRAINE_LECON, graineSuivante, TAILLES_DE_SERIE } from '../components/proba4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 6 — PRACTICE LAB : prédire, lancer, comparer.
 *
 * Ce module n'enseigne rien de neuf : il fait FAIRE le cycle complet.
 * L'élève annonce ce qu'il attend, l'expérience répond, et il confronte.
 * Les erreurs n'y comptent pas comme preuve (stage `practice_lab`).
 *
 * CONTINUITÉ (déclarée dans `lesson.config.js`) : la roue reprise ici est
 * CELLE que l'élève a composée au module 1. Il retrouve son propre objet,
 * et peut le modifier pour voir la probabilité — donc le trait noir — se
 * déplacer. C'est la même expérience, vue de l'intérieur cette fois.
 */
const DEPART = { or: 3, violet: 2, turquoise: 2, rose: 1 };

export default function Module06LeLaboDuHasard() {
  const roue = useLabState(LESSON_CONFIG.id, 'roue', DEPART);
  const [composition, setComposition] = useState(roue.value);
  const [taille, setTaille] = useState(TAILLES_DE_SERIE[2]);
  const [graine, setGraine] = useState(graineSuivante(GRAINE_LECON, 7));
  const [lance, setLance] = useState(false);
  const [pred, setPred] = useState(null);
  const [modifie, setModifie] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const total = Object.values(composition).reduce((s, x) => s + x, 0);
  const pOr = total > 0 ? composition.or / total : 0;

  const changer = (c) => {
    setComposition(c);
    setModifie(true);
  };

  const lab = (
    <RoueLab
      composition={composition}
      onComposition={changer}
      taille={taille}
      onTaille={(t) => { setTaille(t); setLance(true); }}
      graine={graine}
      onRelancer={() => setGraine((g) => graineSuivante(g))}
      lance={lance}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Ta roue est revenue',
      subtitle: 'Celle du module 1. Prédis d’abord, lance ensuite.',
      done: lance && pred !== null,
      content: (
        <div className="space-y-3">
          {roue.saved && (
            <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              C’est la roue que tu avais composée au module 1.{' '}
              <button type="button" onClick={() => { roue.reset(); setComposition(DEPART); }}
                      className="font-semibold text-indigo-700 underline">
                Repartir de la roue d’origine
              </button>
            </p>
          )}
          <PredictionChips
            prompt={`Sur ${taille.toLocaleString('fr-FR')} tours, la fréquence de l’or sera-t-elle proche de sa probabilité ?`}
            options={[
              { id: 'tres', label: 'Très proche' },
              { id: 'assez', label: 'Assez proche' },
              { id: 'loin', label: 'Sans rapport' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Change le modèle, prédis le trait',
      subtitle: 'Ajoute ou retire des secteurs : où va se placer le trait noir ?',
      done: q2,
      content: (
        <div className="space-y-3">
          {lab}
          <NumericQuestion
            prompt="Avec ta roue actuelle, quelle est la probabilité de tomber sur l’or ? (nombre décimal)"
            expected={Math.round(pOr * 1000) / 1000}
            parse={parseDec}
            requires={['probabilite']}
            explain={`${composition.or} secteurs or sur ${total} au total, soit ${composition.or} ÷ ${total}.`}
            explainFor={(n) => {
              if (n === composition.or) return 'C’est le NOMBRE de secteurs or, pas une probabilité : il faut diviser par le nombre total de secteurs.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && modifie && (
            <Feedback tone="ok">
              Tu as changé la roue, et le trait noir a suivi : c’est la composition qui décide de
              la probabilité, pas les lancers.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le raisonnement complet',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un joueur lance 20 fois et tombe 8 fois sur l’or, alors que la probabilité est de 0,375. Que conclure ?"
            options={[
              'Rien d’anormal : sur 20 lancers, la fréquence fluctue',
              'La roue est truquée',
              'La probabilité annoncée est fausse',
              'Il faut refaire exactement les mêmes 20 lancers',
            ]}
            correct={0}
            cols={1}
            requires={['fluctuation', 'stabilisation']}
            explain="8 sur 20 fait 0,4, contre 0,375 attendu : l’écart est minuscule et parfaitement normal sur si peu de lancers. Pour juger d’une roue, il faut beaucoup plus de tours."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              C’est exactement la démarche du scientifique : un modèle donne une prévision,
              l’expérience donne une observation, et on compare les deux en tenant compte de la
              fluctuation.
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
      moduleTitle="Le labo du hasard"
      moduleSubtitle="Prédire, lancer, comparer"
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'À toi de mener l’expérience',
        tone: 'slate',
        body: (
          <>
            Ta roue du module 1 est de retour. Cette fois, tu annonces ce que tu attends
            AVANT de lancer. <strong>Les erreurs ne comptent pas ici.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Un modèle prédit, l’expérience observe. Quand les deux diffèrent un peu, ce n’est pas
            forcément le modèle qui a tort.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
