import React, { useState } from 'react';
import { Search, Compass } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SolidTurner from '../components/SolidTurner';
import { SOLIDS, countsOf } from '../components/espaceUtils';

/**
 * Module 4 — MANIPULATION : identifier un solide en le tournant.
 *
 * Activity              reconnaître un solide à partir d'une vue ambiguë, en
 *                       le tournant pour lever le doute.
 * Mathematical objective une seule vue ne suffit pas toujours à identifier un
 *                       solide ; changer de point de vue est une méthode.
 * Student action        tourner, compter, conclure.
 * Misconception ciblée   trancher sur une seule vue (« c'est un carré, donc
 *                       c'est un cube »).
 * Feedback              les comptes tranchent, pas l'apparence.
 * Transfer              module 5 : les trois vues normalisées.
 */
const MYSTERE = SOLIDS.prisme;

export default function Module04TournerPourVerifier() {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [tourne, setTourne] = useState(false);
  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Quel est ce solide ?',
      subtitle: 'De face, difficile à dire. Tourne-le.',
      done: tourne && q2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Vu sous cet angle, ce solide est ambigu. Fais-le tourner et compte ses faces, ses
            arêtes et ses sommets.
          </p>
          <SolidTurner
            solid={MYSTERE}
            yaw={yaw}
            pitch={pitch}
            onYawChange={(v) => { setYaw(v); setTourne(true); kit.react(true); }}
            onPitchChange={(v) => { setPitch(v); setTourne(true); kit.react(true); }}
            ariaLabel="Solide mystère à identifier en le tournant"
          />
          <TapQuestion
            prompt="De quel solide s’agit-il ?"
            options={[
              'Un prisme droit à base triangulaire',
              'Une pyramide à base carrée',
              'Un cube',
              'Un pavé droit',
            ]}
            correct={0}
            cols={1}
            explain={`Ses comptes le trahissent : ${countsOf(MYSTERE).faces} faces, ${countsOf(MYSTERE).aretes} arêtes, ${countsOf(MYSTERE).sommets} sommets. Une pyramide à base carrée aurait 5 faces mais seulement 5 sommets, et un cube en aurait 6, 12 et 8. En tournant, on voit apparaître les deux triangles opposés.`}
            explainWrong="Ne te fie pas à une seule vue : compte plutôt. Les faces, les arêtes et les sommets identifient un solide sans ambiguïté."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {tourne && q2 && (
            <Feedback tone="ok">
              Tourner a permis de voir les deux <strong>faces triangulaires</strong> opposées, que
              la vue de face écrasait. C’est la méthode : quand une vue ne suffit pas, on change de
              point de vue.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une vue ne suffit pas toujours',
      done: q2 && tourne,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 text-center">Cube, vu de face</p>
              <SolidTurner solid={SOLIDS.cube} yaw={0} pitch={0}
                ariaLabel="Cube vu de face : un carré" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-600 text-center">
                Pavé droit, vu de face
              </p>
              <SolidTurner solid={SOLIDS.pave} yaw={0} pitch={0}
                ariaLabel="Pavé droit vu de face : un rectangle" />
            </div>
          </div>
          <Feedback tone="info">
            Vus strictement de face, ces deux solides ne se distinguent que par leurs proportions —
            et si le pavé avait une face avant carrée, ils seraient <strong>identiques</strong> sur
            ce dessin. Il faudrait alors une deuxième vue pour trancher : c’est l’objet du module
            suivant.
          </Feedback>
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Tourner pour vérifier"
      moduleSubtitle="Quand une seule vue ne suffit pas"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le solide mystère',
        tone: 'violet',
        body: (
          <p>
            Un dessin arrive sans légende. Plutôt que de deviner, <strong>tourne l’objet</strong> et
            compte ce qui ne ment pas.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Search, t: 'Compter', d: 'Faces, arêtes, sommets identifient un solide.', c: 'text-violet-600' },
            { icon: Compass, t: 'Changer d’angle', d: 'Une vue peut cacher l’essentiel.', c: 'text-sky-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Méthode.</strong> Face à un dessin ambigu : tourner l’objet, compter faces,
          arêtes et sommets, et comparer aux solides connus. Une vue unique peut être trompeuse ;
          les comptes, jamais.
        </Feedback>
      }
    />
  );
}
