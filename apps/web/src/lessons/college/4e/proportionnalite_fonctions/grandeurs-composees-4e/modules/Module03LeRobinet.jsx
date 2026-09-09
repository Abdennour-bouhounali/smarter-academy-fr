import React, { useState } from 'react';
import { Droplets, Repeat } from 'lucide-react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TankLab, { CAPACITE } from '../components/TankLab';
import { fr, tempsDeRemplissage, masseVolumiqueRelation } from '../components/grandeurs4e';

/**
 * Module 3 — MANIPULATION : le débit, ou la MÊME structure sur d'autres
 * grandeurs.
 *
 * Activity              ouvrir un robinet, régler son débit et la durée, et
 *                       voir le volume se calculer.
 * Mathematical objective volume = débit × durée. Ce n'est pas une notion
 *                       nouvelle : c'est distance = vitesse × durée, sur
 *                       d'autres grandeurs — et le code le dit littéralement,
 *                       puisque `debitRelation` DÉLÈGUE à `relation`.
 * Student action        glisser le débit, glisser la durée, noter des
 *                       remplissages.
 * Controlled variable   le débit et la durée. Le volume n'est jamais réglable.
 * Mathematical state    (debit, duree) ; le volume est DÉRIVÉ.
 * Visual consequence    le niveau d'eau monte, le volume se réécrit, et le
 *                       réservoir annonce lui-même quand il déborde.
 * Expected observation  « c'est exactement le tableau de bord, avec d'autres
 *                       mots ».
 * Misconception targeted croire qu'un débit se calcule autrement, et devoir
 *                       mémoriser une formule de plus.
 * Formalization         la brique `debit` arrive après que l'élève a lui-même
 *                       reconnu la structure, à l'étape 3.
 */

/** Les trois remplissages que l'étape 1 demande de comparer. */
const REMPLISSAGE_CIBLE = { volume: 300, debit: 12 };

export default function Module03LeRobinet() {
  const [debit, setDebit] = useState(10);
  const [duree, setDuree] = useState(8);
  const [releves, setReleves] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const relever = (x) =>
    setReleves((r) =>
      r.some((y) => y.debit === x.debit && y.duree === x.duree) ? r : [...r, x]
    );

  const done1 = releves.length >= 3;

  const lab = (
    <TankLab
      debit={debit}
      onDebit={setDebit}
      duree={duree}
      onDuree={setDuree}
      releves={releves}
      onRelever={relever}
    />
  );

  const tempsCible = tempsDeRemplissage(REMPLISSAGE_CIBLE.volume, REMPLISSAGE_CIBLE.debit);
  const fer = masseVolumiqueRelation({ masse: 78, volume: 10 });

  const steps = [
    {
      num: 1,
      title: 'Remplis le réservoir',
      subtitle: 'Règle le robinet et la durée. Note trois remplissages différents.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un robinet remplit un réservoir de {CAPACITE} L. Tu commandes le{' '}
            <strong>débit</strong> et la <strong>durée</strong> — le volume, lui, se calcule.
          </p>
          <PredictionChips
            prompt="Avant d’ouvrir : pour trouver le volume écoulé, tu penses qu’il faut…"
            options={[
              { id: 'mul', label: 'multiplier le débit par la durée' },
              { id: 'div', label: 'diviser le débit par la durée' },
              { id: 'add', label: 'additionner les deux' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              {releves.length} remplissage{releves.length > 1 ? 's' : ''} noté
              {releves.length > 1 ? 's' : ''}. Change les réglages et note-en{' '}
              {3 - releves.length} de plus.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois remplissages. Regarde la ligne de calcul sous chaque volume : c’est toujours
              le débit multiplié par la durée — comme la vitesse multipliée par la durée donnait
              la distance.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La même structure',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Qu’est-ce qui relie le débit à la vitesse du module 1 ?"
            options={[
              'Les deux divisent une grandeur par une durée : ce sont deux grandeurs quotient',
              'Rien : le débit concerne des liquides, la vitesse des déplacements',
              'Les deux sont des grandeurs produit',
              'Le débit s’additionne, la vitesse se multiplie',
            ]}
            correct={0}
            cols={1}
            requires={['grandeur-quotient', 'trois-grandeurs-liees']}
            explain="Distance ÷ durée donne des km/h ; volume ÷ durée donne des L/min. Même structure, autres grandeurs — donc rien de neuf à apprendre, seulement à reconnaître."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="debit"
              variant="new"
              lead="Tu viens de reconnaître la structure : voici son nom, et sa troisième sœur."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Combien de temps pour le remplir ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Règle le robinet sur {REMPLISSAGE_CIBLE.debit} L/min et cherche la durée qui remplit
            exactement les {CAPACITE} L.
          </p>
          {lab}
          <NumericQuestion
            prompt={`Combien de minutes faut-il pour verser ${REMPLISSAGE_CIBLE.volume} L à ${REMPLISSAGE_CIBLE.debit} L/min ?`}
            expected={tempsCible}
            parse={parseDec}
            suffix="min"
            requires={['debit']}
            explain={`${REMPLISSAGE_CIBLE.volume} ÷ ${REMPLISSAGE_CIBLE.debit} = ${fr(tempsCible)} min. Exactement la division qui donnait une durée à partir d’une distance et d’une vitesse.`}
            explainFor={(n) => {
              if (n === 3600) return 'Tu as multiplié au lieu de diviser. Le volume est le PRODUIT ; la durée cherchée est donc un quotient : 300 ÷ 12.';
              if (n === 288) return 'Tu as soustrait. Un débit ne s’ajoute ni ne se retranche à un volume : il le divise.';
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
      title: 'Et une troisième fois',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un morceau de fer de {fr(fer.volume)} cm³ pèse {fr(fer.masse)} g. La{' '}
            <strong>masse volumique</strong> se lit en g/cm³.
          </p>
          <NumericQuestion
            prompt="Quelle est la masse volumique de ce fer, en g/cm³ ?"
            expected={fer.masseVolumique}
            parse={parseDec}
            suffix="g/cm³"
            requires={['debit', 'grandeur-quotient']}
            explain={`${fr(fer.masse)} ÷ ${fr(fer.volume)} = ${fr(fer.masseVolumique)} g/cm³ : un centimètre cube de fer pèse ${fr(fer.masseVolumique)} g. Troisième fois la même division.`}
            explainFor={(n) => {
              if (n === 780) return 'Tu as multiplié. La masse volumique dit ce que pèse UN centimètre cube : c’est une division, comme le prix d’un seul objet.';
              if (n === 0.13) return 'Tu as divisé à l’envers (10 ÷ 78). Le mot « grammes par centimètre cube » donne l’ordre : les grammes sont au-dessus.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Trois grandeurs quotient, une seule structure. Une question reste : ce même robinet,
              on pourrait le donner en L/h plutôt qu’en L/min — comment change-t-on d’unité sans
              se tromper de sens ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le robinet"
      moduleSubtitle="Rien de neuf : la même structure, sur d’autres grandeurs"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Un réservoir de 300 litres',
        tone: 'indigo',
        body: (
          <>
            Un robinet, un réservoir, un niveau qui monte. Tu vas croire qu’il faut apprendre une
            formule de plus. <strong>Regarde bien : tu la connais déjà.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Droplets className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Ouvre plus grand, laisse couler plus longtemps.{' '}
            <Repeat className="inline h-4 w-4" aria-hidden="true" /> Compare la ligne de calcul
            avec celle du tableau de bord : ce sont les mêmes mots, à deux noms près.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
