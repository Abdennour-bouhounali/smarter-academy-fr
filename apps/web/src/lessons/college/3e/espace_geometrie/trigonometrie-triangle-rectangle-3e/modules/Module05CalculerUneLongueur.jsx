import React, { useState } from 'react';
import { Target } from 'lucide-react';
import { ContentModule, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioLab from '../components/RatioLab';
import RatioChooser from '../components/RatioChooser';
import { chooseRatio, RATIO_DEF, solveSide, roundTenth } from '../components/trigoUtils';

/**
 * Module 5 — MANIPULATION : calculer une longueur.
 *
 * Activity              désigner le côté connu et le côté cherché, laisser le
 *                       rapport se déduire, puis calculer.
 * Mathematical objective la méthode complète : repérer, choisir, appliquer,
 *                       vérifier.
 * Student action        deux désignations, puis une réponse chiffrée.
 * Misconception ciblée   choisir le rapport au hasard ou par habitude ; et
 *                       multiplier là où il faut diviser. `explainFor`
 *                       intercepte les deux résultats correspondants.
 * Feedback              la vraisemblance est vérifiée (un côté de l'angle
 *                       droit reste plus court que l'hypoténuse).
 */
const CAS = { alpha: 35, hyp: 12 };   // en mètres, pour l'énoncé

export default function Module05CalculerUneLongueur() {
  const [known, setKnown] = useState(null);
  const [wanted, setWanted] = useState(null);
  const bonChoix = known === 'hyp' && wanted === 'opp';
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const attendu = solveSide({
    alphaDeg: CAS.alpha, known: 'hyp', knownValue: CAS.hyp, wanted: 'opp',
  });

  const steps = [
    {
      num: 1,
      title: 'Choisir le rapport',
      subtitle: 'Deux désignations suffisent à le déterminer.',
      done: bonChoix,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Une échelle de <strong>{CAS.hyp} m</strong> est appuyée contre un mur en formant un
              angle de <strong>{CAS.alpha}°</strong> avec le sol. On cherche la{' '}
              <strong>hauteur atteinte</strong> sur le mur.
            </p>
          </div>
          <RatioLab alpha={CAS.alpha} hyp={130} showRatios={false} showLengths={false} disabled
            highlight={wanted ?? undefined}
            ariaLabel="Schéma : échelle contre un mur" />
          <p className="text-xs text-slate-600 text-center">
            L’échelle est l’hypoténuse ; la hauteur cherchée est le côté opposé à l’angle.
          </p>
          <RatioChooser
            known={known} wanted={wanted}
            onKnown={(s) => { setKnown(s); if (s === 'hyp' && wanted === 'opp') kit.react(true); }}
            onWanted={(s) => { setWanted(s); if (known === 'hyp' && s === 'opp') kit.react(true); }}
            disabled={bonChoix}
          />
          {bonChoix ? (
            <Feedback tone="ok">
              Connu : l’hypoténuse. Cherché : le côté opposé. Le seul rapport qui relie ces deux
              côtés est le <strong>sinus</strong>. Aucun choix arbitraire : il se déduit.
            </Feedback>
          ) : (
            <Feedback tone="info">
              L’échelle (12 m) est l’hypoténuse — c’est elle que tu connais. La hauteur sur le mur
              est le côté opposé à l’angle de 35°.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Appliquer',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <p className="text-sm text-slate-700 font-mono">
              sin 35° = hauteur ÷ 12
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle hauteur l’échelle atteint-elle, arrondie au dixième ?"
            suffix="m"
            expected={(n) => Math.abs(n - roundTenth(attendu)) < 0.11}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(roundTenth(attendu)).replace('.', ',')}
            width="w-24"
            explain={`hauteur = 12 × sin 35° ≈ ${String(roundTenth(attendu)).replace('.', ',')} m. Contrôle : la hauteur doit être plus PETITE que l’échelle (12 m) — c’est bien le cas.`}
            explainFor={(n) => {
              if (n > CAS.hyp) return 'Ton résultat dépasse la longueur de l’échelle : impossible. Tu as sans doute divisé au lieu de multiplier.';
              if (Math.abs(n - 12 * Math.cos(35 * Math.PI / 180)) < 0.3) return 'Tu as utilisé le cosinus : cela donne la distance au pied du mur, pas la hauteur. La hauteur est le côté OPPOSÉ à l’angle.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un autre côté, un autre rapport',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Même échelle de <strong>12 m</strong>, même angle de <strong>35°</strong>. Cette fois
              on cherche <strong>à quelle distance du mur</strong> se trouve le pied de l’échelle —
              c’est le côté adjacent.
            </p>
          </div>
          <NumericQuestion
            prompt="Quelle est cette distance, arrondie au dixième ?"
            suffix="m"
            expected={(n) => Math.abs(n - roundTenth(12 * Math.cos(35 * Math.PI / 180))) < 0.11}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(roundTenth(12 * Math.cos(35 * Math.PI / 180))).replace('.', ',')}
            width="w-24"
            explain={`Connu : l’hypoténuse. Cherché : l’adjacent. Le rapport qui les relie est le COSINUS : distance = 12 × cos 35° ≈ ${String(roundTenth(12 * Math.cos(35 * Math.PI / 180))).replace('.', ',')} m.`}
            explainFor={(n) => (Math.abs(n - roundTenth(attendu)) < 0.2
              ? 'C’est la hauteur que tu viens de calculer. Ici le côté cherché est l’ADJACENT : il faut donc le cosinus.'
              : null)}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Calculer une longueur"
      moduleSubtitle="Le rapport ne se devine pas : il se déduit"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'La méthode complète',
        tone: 'purple',
        body: (
          <p>
            Désigne le côté que tu <strong>connais</strong> et celui que tu{' '}
            <strong>cherches</strong> : il n’existe qu’un seul rapport qui relie ces deux-là.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 flex gap-3 items-start">
          <Target className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Méthode : nommer les trois côtés par rapport à l’angle · repérer le connu et le cherché
            · en déduire le rapport · calculer · <strong>vérifier la vraisemblance</strong>.
          </p>
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Opposé et hypoténuse ⇒ sinus. Adjacent et hypoténuse ⇒
          cosinus. Opposé et adjacent ⇒ tangente. Et le résultat cherché reste toujours plus petit
          que l’hypoténuse.
        </Feedback>
      }
    />
  );
}
