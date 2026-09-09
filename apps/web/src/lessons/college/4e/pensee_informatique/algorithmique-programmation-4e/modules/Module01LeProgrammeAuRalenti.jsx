import React, { useState } from 'react';
import { Gauge, Footprints } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AlgoLab from '../components/AlgoLab';
import { PROGRAMME_DEPART } from '../components/programmes';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity               composer un programme en blocs, puis l'exécuter au
 *                        RALENTI : lancer, mettre en pause, avancer d'un pas,
 *                        reculer, faire glisser la réglette d'exécution.
 * Mathematical objective un programme possède un ÉTAT à chaque instant —
 *                        position, cap, variables — et c'est cet état, non le
 *                        dessin fini, qui explique ce qu'il fait.
 * Student action         glisser la réglette, avancer d'un pas, régler une
 *                        longueur ou un angle, réordonner deux blocs.
 * Controlled variable    le RANG d'exécution : la grandeur nouvelle du niveau,
 *                        celle qu'aucune leçon antérieure n'exposait.
 * Mathematical state     le programme et le rang. Dessin, position, cap,
 *                        variables et surlignage sont tous DÉRIVÉS par
 *                        `executerPasAPas` — jamais stockés deux fois.
 * Visual consequence     à chaque pas le tracé s'allonge d'au plus un segment,
 *                        la flèche du stylo tourne, et l'instruction en cours
 *                        s'allume dans le programme écrit.
 * Expected observation   « le programme s'arrête au milieu, et je vois ce
 *                        qu'il a dans la tête ».
 * Misconception targeted croire qu'un programme n'existe qu'une fois terminé,
 *                        et qu'un TOURNER « ne compte pas » puisqu'il ne laisse
 *                        pas de trait.
 * Formalization          l'ÉTAT et le PAS À PAS sont posés ici, parce qu'ils
 *                        conditionnent tout le reste. Le SI (M2), la condition
 *                        (M3) et l'affectation (M4) attendent leur module.
 *
 * CONTINUITÉ : le programme réglé ici est mémorisé et revient au module 2, où
 * on y glisse un bloc « si ». Déclaré dans `lesson.config.js`.
 */
export default function Module01LeProgrammeAuRalenti() {
  const memo = useLabState(LESSON_CONFIG.id, 'programme', { programme: PROGRAMME_DEPART });
  const [programme, setProgramme] = useState(memo.value.programme ?? PROGRAMME_DEPART);
  const [pred, setPred] = useState(null);
  const [visites, setVisites] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // Le geste qui compte : avoir REGARDÉ plusieurs pas intermédiaires. Un
  // simple « exécuter » ne prouve rien — c'est l'arrêt en cours de route qui
  // est la nouveauté. On mémorise les rangs distincts effectivement affichés.
  const voirPas = (rang) => setVisites((v) => (v.includes(rang) ? v : [...v, rang]));

  const changerProgramme = (p) => {
    setProgramme(p);
    memo.save({ programme: p });
  };

  const intermediaires = visites.filter((r) => r > 0 && r < 8);
  const done1 = intermediaires.length >= 3;

  const lab = (
    <AlgoLab
      programme={programme}
      onProgramme={changerProgramme}
      onRang={voirPas}
      titre="Le laboratoire du programme"
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Arrête le programme au milieu',
      subtitle: 'Lance-le, mets-le en pause, puis avance d’un seul pas à la fois.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Ce programme exécute ses instructions une par une. Combien en exécutera-t-il en tout, alors qu’il n’en a que deux d’écrites ?"
            options={[
              { id: 'deux', label: '2 — celles qui sont écrites' },
              { id: 'quatre', label: '4 — une par côté' },
              { id: 'huit', label: '8 — quatre côtés, deux instructions' },
              { id: 'sais-pas', label: 'Je ne sais pas encore' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              Fais glisser la réglette, ou appuie plusieurs fois sur « Un pas », et regarde à
              chaque arrêt la position, le cap et le dessin.
              {intermediaires.length > 0 && ` ${intermediaires.length} arrêt${intermediaires.length > 1 ? 's' : ''} observé${intermediaires.length > 1 ? 's' : ''} — continue.`}
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Le programme s’écrit en 2 instructions et en exécute 8. À chaque arrêt, il a une
              position, une direction — et il n’a pas fini.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Tous les pas ne laissent pas de trait',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Avance pas à pas et compte : le dessin ne s’allonge pas à chaque fois.
          </p>
          {lab}
          <TapQuestion
            prompt="Pourquoi le tracé ne s’allonge-t-il qu’un pas sur deux ?"
            options={[
              'Parce qu’un TOURNER change la direction sans déplacer le stylo',
              'Parce que le programme saute une instruction sur deux',
              'Parce que le stylo est levé un pas sur deux',
              'Parce que la boucle ne compte qu’un pas sur deux',
            ]}
            correct={0}
            cols={1}
            requires={['instruction-programme', 'instruction-parametree']}
            explain="Un TOURNER est bien une instruction exécutée — elle a son propre pas — mais elle ne fait que changer le cap. Seul un AVANCER, stylo baissé, laisse un trait."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="etat-programme"
              variant="new"
              lead="Ce que tu viens de lire à chaque arrêt porte un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Où est le stylo au pas 5 ?',
      subtitle: 'Prévois d’abord, puis amène la réglette sur le pas 5 pour vérifier.',
      done: q3,
      content: (
        <div className="space-y-3">
          {lab}
          <NumericQuestion
            prompt="Remets le programme sur le carré de 60 (4 côtés, virages de 90°), puis place-toi au pas 5. Quel est alors le cap du stylo, en degrés ?"
            expected={180}
            parse={parseDec}
            suffix="°"
            requires={['etat-programme']}
            explain="Au pas 5, le stylo a exécuté : avancer, tourner, avancer, tourner, avancer. Il a donc tourné deux fois à droite de 90°, ce qui le laisse cap au 180 : il regarde à l’opposé de sa direction de départ."
            explainFor={(n) => {
              if (n === 270) return 'C’est le cap après UN seul virage (pas 2 et pas 3). Au pas 5, le stylo a déjà tourné deux fois.';
              if (n === 90) return 'C’est le cap après TROIS virages (pas 6 et pas 7). Au pas 5, il n’en a fait que deux.';
              if (n === 0 || n === 360) return 'Le stylo ne retrouve sa direction de départ qu’au pas 8, après les quatre virages.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="pas-a-pas"
              variant="new"
              lead="Tu viens d’utiliser la méthode qui rend tout le reste de la leçon possible."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Écrire peu, exécuter beaucoup',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un programme s’écrit « RÉPÉTER 6 fois [ AVANCER de 40 ; TOURNER de 60° ] ». Combien de pas comptera son exécution ?"
            options={['12 pas', '6 pas', '2 pas', '8 pas']}
            correct={0}
            cols={4}
            requires={['pas-a-pas', 'repeter-n-fois']}
            explain="Le corps compte 2 instructions et la boucle fait 6 tours : 6 × 2 = 12 pas exécutés, pour 2 instructions écrites."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Une question reste ouverte : jusqu’ici, le programme exécute toujours TOUT ce qui
              est écrit. Et s’il pouvait choisir ? C’est le module suivant.
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
      moduleTitle="Le programme au ralenti"
      moduleSubtitle="Un état à chaque instant, pas seulement à la fin"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Arrête-le au milieu',
        tone: 'indigo',
        body: (
          <>
            Un dessin fini ne dit pas comment il a été fait. Mets le programme au ralenti :{' '}
            <strong>que se passe-t-il entre deux traits ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Gauge className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            <Footprints className="inline h-4 w-4" aria-hidden="true" /> Fais glisser la
            réglette d’exécution : à chaque arrêt, la position, le cap et le dessin sont ceux de
            CET instant précis.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
