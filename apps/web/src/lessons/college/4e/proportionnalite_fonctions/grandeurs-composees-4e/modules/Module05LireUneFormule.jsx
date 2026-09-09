import React, { useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FormuleLab, { ECRITURES } from '../components/FormuleLab';
import { fr, relation, texteDuree } from '../components/grandeurs4e';

/**
 * Module 5 — MANIPULATION : une seule égalité, lue dans trois sens.
 *
 * Activity              choisir la grandeur cherchée et voir la formule se
 *                       retourner pour y répondre.
 * Mathematical objective d = v × t n'est pas trois formules à retenir : c'est
 *                       une égalité dont l'écriture dépend de l'INCONNUE.
 * Student action        taper la grandeur cherchée, régler les deux connues.
 * Controlled variable   l'inconnue, et les deux valeurs données.
 * Mathematical state    deux nombres ; le troisième vient de `relation()`, qui
 *                       dit elle-même ce qu'elle a calculé — l'écriture
 *                       affichée ne peut donc pas contredire le résultat.
 * Visual consequence    la ligne de formule se réécrit, la vérification se
 *                       recalcule.
 * Expected observation  « c'est toujours la même égalité ; je la lis dans le
 *                       sens qui m'arrange ».
 * Misconception targeted retenir trois formules séparées, et diviser à
 *                       l'envers (t = v ÷ d).
 * Formalization         la brique `lire-une-formule` arrive après que les
 *                       trois écritures ont été VUES se succéder.
 *
 * ATTEINTE DES VALEURS : les soixante couples proposés par le labo donnent
 * tous une vérification exacte — c'est vérifié dans `parcours.test.js`. Une
 * valeur qui ferait mentir la ligne « on retombe bien dessus » détruirait le
 * seul argument du module.
 */

/** Les trois problèmes de l'étape 3, un par écriture. */
const PROBLEMES = {
  distance: relation({ vitesse: 60, duree: 2.5 }),
  duree: relation({ distance: 150, vitesse: 60 }),
  vitesse: relation({ distance: 150, duree: 2.5 }),
};

export default function Module05LireUneFormule() {
  const [cherche, setCherche] = useState('distance');
  const [valeurs, setValeurs] = useState({ distance: 60, duree: 1.5, vitesse: 30 });
  const [vues, setVues] = useState(['distance']);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const choisir = (g) => {
    setCherche(g);
    setVues((v) => (v.includes(g) ? v : [...v, g]));
  };

  const done1 = vues.length >= 3;

  const lab = (
    <FormuleLab
      cherche={cherche}
      onCherche={choisir}
      valeurs={valeurs}
      onValeur={(g, v) => setValeurs((old) => ({ ...old, [g]: v }))}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Retourne la formule trois fois',
      subtitle: 'Change ce que tu cherches, et regarde l’égalité se réécrire.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Une seule égalité relie la distance, la durée et la vitesse. Ce qui change, c’est{' '}
            <strong>ce que tu cherches</strong> — et donc la façon de l’écrire.
          </p>
          {lab}
          {!done1 && (
            <Feedback tone="info">
              {vues.length} écriture{vues.length > 1 ? 's' : ''} sur 3 essayée
              {vues.length > 1 ? 's' : ''}. Change de grandeur cherchée.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois écritures : <span className="font-mono">{ECRITURES.distance.formule}</span>,{' '}
              <span className="font-mono">{ECRITURES.vitesse.formule}</span> et{' '}
              <span className="font-mono">{ECRITURES.duree.formule}</span>. Aucune n’est à
              apprendre séparément : elles disent la même chose.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Qui décide de l’écriture ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quand tu passes de d = v × t à t = d ÷ v, qu’est-ce qui a changé ?"
            options={[
              'La grandeur qu’on cherche : c’est elle qui passe à gauche',
              'La relation elle-même, qui n’est plus la même',
              'Les unités, qui deviennent des minutes',
              'Rien : ce sont deux relations différentes à mémoriser',
            ]}
            correct={0}
            cols={1}
            requires={['trois-grandeurs-liees']}
            explain="La relation ne bouge jamais. On la réécrit simplement pour isoler ce qu’on cherche — comme au module 1, où le troisième cadran était toujours le calculé."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="lire-une-formule"
              variant="new"
              lead="Les trois écritures que tu viens de faire défiler méritent d’être posées ensemble."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Choisis la bonne lecture',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un car roule à {fr(PROBLEMES.duree.vitesse)} km/h et doit parcourir{' '}
            {fr(PROBLEMES.duree.distance)} km. Règle le labo sur cette situation si tu veux
            vérifier.
          </p>
          {lab}
          <NumericQuestion
            prompt="Combien d’heures dure le trajet ? Donne un nombre décimal."
            expected={PROBLEMES.duree.duree}
            parse={parseDec}
            suffix="h"
            requires={['lire-une-formule']}
            explain={`On cherche la durée, donc t = d ÷ v : ${fr(PROBLEMES.duree.distance)} ÷ ${fr(PROBLEMES.duree.vitesse)} = ${fr(PROBLEMES.duree.duree)} h, soit ${texteDuree(PROBLEMES.duree.duree)}. Vérification : ${fr(PROBLEMES.duree.vitesse)} × ${fr(PROBLEMES.duree.duree)} = ${fr(PROBLEMES.duree.distance)}.`}
            explainFor={(n) => {
              if (n === 9000) return 'Tu as multiplié. Un trajet de 150 km à 60 km/h ne peut pas durer 9000 h : c’est une division qu’il faut, t = d ÷ v.';
              if (n === 0.4) return 'Tu as divisé à l’envers (60 ÷ 150). Les unités le disent : des km/h divisés par des km ne donnent pas des heures.';
              if (n === 2.3 || n === 2.30) return 'Attention : 2,5 h ne se lit pas « 2 h 5 min ». C’est 2 h 30 min, car une demi-heure vaut 30 minutes.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'L’erreur de sens',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un élève écrit t = v ÷ d pour trouver une durée. Comment voir tout de suite que c’est faux, sans calculer ?"
            options={[
              'Par les unités : des km/h divisés par des km ne donnent pas des heures',
              'Parce que la division n’est jamais permise dans une formule',
              'Parce que v est toujours plus grand que d',
              'On ne peut pas le voir sans calculer',
            ]}
            correct={0}
            cols={1}
            requires={['lire-une-formule', 'grandeur-quotient']}
            explain="Les unités composées servent aussi à cela : km/h ÷ km donne des « par heure », pas des heures. C’est d ÷ v qui donne bien une durée, puisque les kilomètres s’en vont."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Tu as désormais tout ce qu’il faut : la relation, ses trois lectures, les deux
              familles d’unités et le changement d’unité. Le module suivant ne t’apprendra rien
              de neuf — il te demandera de choisir.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Lire une formule"
      moduleSubtitle="Une seule égalité, trois questions"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Trois formules, ou une seule ?',
        tone: 'indigo',
        body: (
          <>
            On te fera peut-être apprendre d = v × t, puis v = d ÷ t, puis t = d ÷ v.{' '}
            <strong>Ce sont trois façons d’écrire la même chose — et une seule à comprendre.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Commence toujours par la question : <em>qu’est-ce que je cherche ?</em>{' '}
            <RefreshCw className="inline h-4 w-4" aria-hidden="true" /> L’écriture suit, et la
            vérification par la multiplication tranche s’il reste un doute.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
