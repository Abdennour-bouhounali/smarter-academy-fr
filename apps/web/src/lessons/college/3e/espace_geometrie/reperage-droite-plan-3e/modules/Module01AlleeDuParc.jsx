import React, { useState } from 'react';
import { MapPin, HelpCircle } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatNumber } from '../components/reperageUtils';

/**
 * Module 1 — DÉCLENCHEUR (conflit cognitif).
 *
 * Activity              une consigne ambiguë sur une allée graduée.
 * Mathematical objective sur une droite, une distance ne suffit pas : il faut
 *                       aussi un SENS. C'est ce que l'abscisse ajoute.
 * Student action        placer un banc « à 3 de la fontaine ».
 * Controlled variable   la position sur la droite.
 * Mathematical state    une abscisse relative.
 * Visual consequence    deux positions répondent à la consigne — le doute est
 *                       à l'écran, pas dans une phrase.
 * Expected observation  « il manque une information ».
 * Misconception         « 3 et −3, c'est la même distance donc le même
 *                       endroit ». Vrai pour la distance, faux pour le repère.
 * Feedback              on nomme les deux réponses possibles, on ne dit pas
 *                       « faux ».
 * Formalization         le mot « abscisse » arrive à la fin, après le besoin.
 * Scaffolding           lecture d'abord, placement ensuite, décimal pour finir.
 * Transfer              prépare le plan à deux dimensions du module 2.
 */
export default function Module01AlleeDuParc() {
  const [q1, setQ1] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Un rendez-vous impossible',
      subtitle: '« Retrouve-moi à 3 de la fontaine. »',
      done: q1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            L’allée du parc est graduée, la fontaine est au 0. Ton ami écrit :
            « <em>Je t’attends à 3 de la fontaine.</em> » Tu arrives… et il n’est pas là.
          </p>
          <NumberLine
            min={-6} max={6} step={1} labelEvery={1}
            markers={[
              { value: 0, label: '⛲', color: '#0284c7' },
              { value: 3, label: '?', color: '#f59e0b' },
              { value: -3, label: '?', color: '#f59e0b' },
            ]}
            ariaLabel="Allée graduée de −6 à 6, la fontaine au 0, deux points d’interrogation à 3 et à −3"
          />
          <TapQuestion
            prompt="Pourquoi le rendez-vous a-t-il échoué ?"
            options={[
              'Deux endroits sont à 3 de la fontaine : un de chaque côté. Le message ne dit pas lequel.',
              'Parce que 3 est trop petit pour être précis.',
              'Parce qu’il fallait compter en mètres et pas en graduations.',
              'Parce que la fontaine n’est pas au bon endroit sur l’allée.',
            ]}
            correct={0}
            cols={1}
            explain="Sur une droite graduée, une distance donne DEUX positions possibles, une de chaque côté du zéro. Pour en désigner une seule, il faut ajouter le côté — c’est le rôle du signe."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le signe tranche',
      subtitle: 'Place le banc à l’abscisse −4.',
      done: placed === -4,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Cette fois la consigne est complète : le banc est à l’abscisse <strong>−4</strong>.
            Clique la graduation qui convient.
          </p>
          <NumberLine
            min={-6} max={6} step={1} labelEvery={1}
            mode="read"
            selectedValue={placed}
            onTickClick={(v) => {
              setPlaced(v);
              kit.react(v === -4);
            }}
            markers={[{ value: 0, label: '⛲', color: '#0284c7' }]}
            ariaLabel="Allée graduée : clique la graduation −4"
            disabled={placed === -4}
          />
          {placed !== null && placed !== -4 && (
            <Feedback tone="ko">
              Tu as choisi {formatNumber(placed)}.{' '}
              {placed === 4
                ? 'C’est la bonne distance mais du mauvais côté : le signe − indique la gauche de la fontaine.'
                : `L’abscisse demandée est −4 : quatre graduations à gauche du 0.`}
            </Feedback>
          )}
          {placed === -4 && (
            <Feedback tone="ok">
              Exact. Ce nombre −4 s’appelle l’<strong>abscisse</strong> du banc : il donne à la fois la
              distance (4) et le côté (le signe −).
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Entre deux graduations',
      subtitle: 'Une abscisse n’est pas forcément un nombre entier.',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumberLine
            min={-4} max={4} step={0.5} labelEvery={2}
            markers={[
              { value: 0, label: '⛲', color: '#0284c7' },
              { value: -2.5, label: '🌳', color: '#16a34a' },
            ]}
            ariaLabel="Allée graduée de demi en demi, un arbre placé entre −3 et −2"
          />
          <NumericQuestion
            prompt="Quelle est l’abscisse de l’arbre 🌳 ?"
            expected={-2.5}
            parse={(s) => Number(String(s).replace(',', '.').replace('−', '-'))}
            display="−2,5"
            width="w-28"
            explain="L’arbre est entre −3 et −2, exactement au milieu : son abscisse est −2,5. Les abscisses ne sont pas toujours entières."
            explainFor={(n) => (n === 2.5
              ? 'Bonne distance, mauvais côté : l’arbre est à gauche du 0, donc son abscisse est négative.'
              : null)}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une allée ne suffit pas',
      subtitle: 'Le parc, lui, a deux dimensions.',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sur l’allée, un seul nombre suffit à désigner un endroit. Mais le parc entier n’est pas
            une ligne : on peut aussi s’éloigner de l’allée.
          </p>
          <TapQuestion
            prompt="Pour désigner un endroit N’IMPORTE OÙ dans le parc, que faut-il ?"
            options={[
              'Deux nombres : un pour la direction de l’allée, un pour la direction perpendiculaire.',
              'Un seul nombre, mais beaucoup plus précis.',
              'Un seul nombre et le nom du lieu le plus proche.',
              'Trois nombres, comme pour un objet en volume.',
            ]}
            correct={0}
            cols={1}
            explain="Une ligne se repère avec un nombre ; une surface en demande deux. C’est exactement ce que fait un repère du plan — et c’est le sujet du module suivant."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’allée du parc"
      moduleSubtitle="Quand une distance ne suffit pas à dire où l’on est"
      estimatedTime="8 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un rendez-vous raté',
        tone: 'indigo',
        body: (
          <p>
            Un message trop court, un ami introuvable. Cherche ce qui manquait dans la consigne —
            c’est exactement ce que les mathématiciens ont inventé pour désigner un point sans se tromper.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: MapPin, t: 'Le repère du parc', d: 'La fontaine est le point zéro de toutes les mesures.' },
            { icon: HelpCircle, t: 'Ce qui manque', d: 'Une distance seule laisse deux possibilités.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className="w-5 h-5 text-indigo-600 mb-1" aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Sur une droite graduée, l’<strong>abscisse</strong> d’un point est
          le nombre relatif qui le repère : sa valeur donne la distance au zéro, son signe donne le côté.
        </Feedback>
      }
    />
  );
}
