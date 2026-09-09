import React, { useState } from 'react';
import { Ban } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SacLab from '../components/SacLab';
import { parseDec } from '@smarter-academy/core';
import { EVENEMENTS_SAC, contraire, probabilite, fraction, SAC } from '../components/proba4e';

/**
 * Module 3 — MANIPULATION : l'événement contraire.
 *
 * Activity              choisir un événement dans le sac et regarder ce qui
 *                       s'éteint.
 * Mathematical objective le contraire d'un événement est l'ensemble des
 *                       issues qui NE sont PAS dedans ; ensemble, les deux
 *                       couvrent tout le sac, donc leurs probabilités font 1.
 * Student action        toucher un filtre, puis basculer sur « son contraire ».
 * Controlled variable   l'événement choisi, et le mode.
 * Mathematical state    l'événement ; le contraire est CALCULÉ.
 * Visual consequence    les billes retenues et les billes éteintes échangent
 *                       exactement leurs rôles.
 * Expected observation  « aucune bille n'est dans les deux, et aucune n'est
 *                       en dehors des deux ».
 * Misconception targeted croire que le contraire de « rouge » est « bleue ».
 *                       Le sac contient aussi du vert : c'est ce qui rend le
 *                       contre-exemple visible d'un coup d'œil.
 */
export default function Module03ToutCeQuiReste() {
  const [filtre, setFiltre] = useState('rouge');
  const [mode, setMode] = useState('simple');
  const [vus, setVus] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const basculer = (m) => {
    setMode(m);
    if (m === 'contraire') setVus((v) => (v.includes(filtre) ? v : [...v, filtre]));
  };

  const done1 = vus.length >= 2;
  const rouge = EVENEMENTS_SAC.rouge;
  const nonRouge = contraire(rouge);

  const lab = (
    <SacLab
      filtreA={filtre}
      mode={mode}
      onFiltreA={(f) => { setFiltre(f); }}
      onMode={basculer}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Allume, puis éteins',
      subtitle: 'Choisis un événement, puis bascule sur « son contraire ». Fais-le pour deux événements différents.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le sac contient {SAC.issues.length} billes. Chacune a une <strong>couleur</strong> et
            une <strong>taille</strong>.
          </p>
          {lab}
          {done1 && (
            <Feedback tone="ok">
              À chaque fois, les billes allumées et les billes éteintes échangent leurs rôles :
              aucune n’est dans les deux, aucune n’est en dehors des deux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le piège du contraire',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Quel est le contraire de « la bille est rouge » ?"
            options={[
              'La bille n’est pas rouge',
              'La bille est bleue',
              'La bille est verte',
              'La bille est grande',
            ]}
            correct={0}
            cols={2}
            requires={['evenement']}
            explain={`Le sac contient aussi des vertes. « Pas rouge », ce sont les ${nonRouge.issues.length} billes bleues ET vertes — pas seulement les bleues.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="evenement-contraire"
              variant="new"
              lead="Ce que tu as vu s’éteindre à chaque bascule porte un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux probabilités',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur les {SAC.issues.length} billes, {rouge.issues.length} sont rouges, donc
            P(rouge) = {fraction(probabilite(rouge))}.
          </p>
          <NumericQuestion
            prompt="Quelle est la probabilité de NE PAS tirer une rouge ? (donne un nombre décimal)"
            expected={probabilite(nonRouge).n / probabilite(nonRouge).d}
            parse={parseDec}
            requires={['evenement-contraire', 'probabilite']}
            explain={`${nonRouge.issues.length} billes ne sont pas rouges sur ${SAC.issues.length}, soit ${fraction(probabilite(nonRouge))} = 0,5. On peut aussi faire 1 − 0,5.`}
            explainFor={(n) => {
              if (n === 4 || n === 8) return 'On demande une PROBABILITÉ, pas un nombre de billes : il faut diviser par le nombre total.';
              if (n === 0.25) return 'Attention : les billes qui ne sont pas rouges sont les bleues ET les vertes, soit 4 billes, pas 2.';
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
      title: 'La règle qui en découle',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un événement a une probabilité de 0,3. Quelle est celle de son contraire ?"
            options={['0,7', '0,3', '−0,3', '1,3']}
            correct={0}
            cols={4}
            requires={['evenement-contraire', 'probabilite']}
            explain="L’événement et son contraire couvrent TOUTES les issues, sans se chevaucher : leurs probabilités font 1 à elles deux. 1 − 0,3 = 0,7."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="somme-contraire"
              variant="new"
              lead="C’est la conséquence immédiate de ce que tu as vu : rien n’est dans les deux, rien n’est dehors."
            />
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
      moduleTitle="Tout ce qui reste"
      moduleSubtitle="Quand un événement n’arrive pas, c’est son contraire qui arrive"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Le sac aux deux caractères',
        tone: 'indigo',
        body: (
          <>
            Huit billes, chacune avec une couleur et une taille. Choisis un événement,
            et regarde <strong>ce qui s’éteint</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Ban className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Les billes en pointillé sont celles que l’événement laisse de côté. Bascule sur
            « son contraire » : elles s’allument, et les autres s’éteignent.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
