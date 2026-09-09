import React, { useState } from 'react';
import { Combine } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SacLab from '../components/SacLab';
import { parseDec } from '@smarter-academy/core';
import {
  SAC, EVENEMENTS_SAC, intersection, reunion, compteNaifReunion, probabilite, fraction,
} from '../components/proba4e';

/**
 * Module 4 — MANIPULATION : intersection et réunion, par les issues.
 *
 * Activity              croiser deux filtres (une couleur et une taille) et
 *                       lire les billes retenues en mode ET puis en mode OU.
 * Mathematical objective l'intersection retient les issues qui vérifient les
 *                       DEUX conditions ; la réunion celles qui en vérifient
 *                       AU MOINS UNE. Additionner les deux effectifs compte
 *                       DEUX FOIS celles qui sont dans les deux.
 * Student action        choisir les deux filtres, basculer entre ET et OU.
 * Controlled variable   les deux événements et le mode.
 * Mathematical state    deux événements ; l'ensemble retenu est CALCULÉ.
 * Visual consequence    les billes des deux ensembles portent un liseré noir ;
 *                       en mode OU elles restent allumées UNE fois.
 * Expected observation  « 4 rouges + 4 grandes, ça ferait 8 — mais deux
 *                       billes restent éteintes ».
 * Misconception targeted additionner les effectifs de deux événements qui se
 *                       chevauchent. Ici, le comptage naïf donne 8 sur 8,
 *                       c'est-à-dire « certain », alors que B2 et B3 sont
 *                       visiblement en pointillé : l'erreur se réfute sur la
 *                       figure, pas par une correction.
 *
 * PÉRIMÈTRE : aucune FORMULE additive n'est énoncée. P(A∪B) = P(A) + P(B) −
 * P(A∩B) est un objet de 3e ; ici on compte les issues.
 */
export default function Module04EtOuBienOu() {
  const [fa, setFa] = useState('rouge');
  const [fb, setFb] = useState('grande');
  const [mode, setMode] = useState('et');
  const [modesVus, setModesVus] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const R = EVENEMENTS_SAC.rouge;
  const G = EVENEMENTS_SAC.grande;
  const ET = intersection(R, G);
  const OU = reunion(R, G);
  const naif = compteNaifReunion(R, G);

  const changerMode = (m) => {
    setMode(m);
    setModesVus((v) => (v.includes(m) ? v : [...v, m]));
  };
  const done1 = modesVus.includes('et') && modesVus.includes('ou');

  const lab = (montrer) => (
    <SacLab
      filtreA={fa}
      filtreB={fb}
      mode={mode}
      onFiltreA={setFa}
      onFiltreB={setFb}
      onMode={changerMode}
      montrerComptage={montrer}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Croise deux filtres',
      subtitle: 'Rouge et grande. Bascule d’un croisement à l’autre, et compte les billes allumées.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt={`Il y a ${R.issues.length} billes rouges et ${G.issues.length} grandes. Combien seront allumées pour « rouge OU grande » ?`}
            options={[
              { id: 'huit', label: '8 (toutes)' },
              { id: 'six', label: '6' },
              { id: 'quatre', label: '4' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab(false)}
          {done1 && (
            <Feedback tone="ok">
              Avec ET, {ET.issues.length} billes seulement. Avec OU, {OU.issues.length} —
              et non 8. Les billes cerclées de noir sont dans les deux ensembles à la fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi pas 8 ?',
      done: q2,
      content: (
        <div className="space-y-3">
          {lab(true)}
          <TapQuestion
            prompt={`${R.issues.length} rouges + ${G.issues.length} grandes = ${naif}. Pourtant seules ${OU.issues.length} billes s’allument pour « rouge OU grande ». Pourquoi ?`}
            options={[
              `${ET.issues.length} billes sont rouges ET grandes : elles ont été comptées deux fois`,
              'Deux billes ont été oubliées dans le sac',
              'Le croisement OU ne retient qu’une partie des billes',
              'Les billes vertes ne comptent pas',
            ]}
            correct={0}
            cols={1}
            requires={['evenement']}
            explain={`R1 et R2 sont à la fois rouges et grandes. En additionnant les deux nombres de billes, on les compte une fois comme rouges et une fois comme grandes — d’où ${naif} au lieu de ${OU.issues.length}.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="intersection"
              variant="new"
              lead="Les billes cerclées de noir forment un ensemble qui a un nom."
            />
          )}
          {q2 && (
            <KnowledgeBrick
              id="reunion"
              variant="new"
              lead="Et l’ensemble de toutes les billes allumées en mode OU en a un autre."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Calculer les deux probabilités',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={`Combien de billes sont à la fois rouges ET grandes ?`}
            expected={ET.issues.length}
            requires={['intersection']}
            explain={`R1 et R2 : ${ET.issues.length} billes sur ${SAC.issues.length}, soit une probabilité de ${fraction(probabilite(ET))}.`}
            explainFor={(n) => {
              if (n === naif) return 'Tu as additionné les deux groupes. Ici on cherche seulement les billes qui vérifient les DEUX conditions.';
              if (n === OU.issues.length) return 'C’est le compte de « rouge OU grande ». Le croisement ET est plus exigeant : il faut les deux caractères.';
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
      title: 'Quand rien ne se chevauche',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Essaie maintenant « rouge » et « bleue ». Aucune bille ne peut être des deux couleurs.
          </p>
          {lab(false)}
          <TapQuestion
            prompt="Pour « rouge OU bleue », l’addition des deux groupes donne-t-elle le bon compte ?"
            options={[
              'Oui, car aucune bille n’est dans les deux',
              'Non, il faut toujours retirer quelque chose',
              'Oui, car ce sont deux couleurs',
              'Non, l’addition ne marche jamais',
            ]}
            correct={0}
            cols={1}
            requires={['intersection', 'reunion']}
            explain="Quand l’intersection est vide, il n’y a rien à compter deux fois : l’addition tombe juste. C’est le seul cas où elle fonctionne."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="mem-et-ou"
              variant="new"
              lead="Le réflexe à garder, maintenant que tu as vu les deux cas."
            />
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
      moduleTitle="ET, ou bien OU"
      moduleSubtitle="Deux filtres, et des billes qu’on compterait deux fois"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Rouge et grande, rouge ou grande',
        tone: 'indigo',
        body: (
          <>
            Quatre billes rouges, quatre grandes. Combien de billes sont
            « rouges OU grandes » ? <strong>La réponse n’est pas huit.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Combine className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Les billes cerclées de noir appartiennent aux DEUX filtres. Garde-les à l’œil :
            ce sont elles qui font toute la différence.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
