import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseReel } from '../components/parseBridge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DerouleurLab from '../components/DerouleurLab';
import { SIN, CIBLES, tDuCran, labelPi, fr, sinExact, cosExact } from '../components/trigFnUtils';

/**
 * Module 2 — DÉCOUVERTE : tout réel a sa place sur le cercle (LP1), et les
 * deux fonctions reçoivent leur statut d'OBJET.
 *
 * Le rappel est BREF : la Seconde a déjà enseigné l'enroulement, et le
 * module 0 vient de le mesurer. Ce que la Première ajoute, et qui commence
 * ici : les réels PLUS GRANDS QUE 2π et les réels NÉGATIFS.
 *
 * Étape 1  atteindre 13π/6 au cliquet, et constater qu'on est au même point
 *          que π/6 — un tour plus loin. Puis −π/6, de l'autre côté.
 * Étape 2  la brique posée, la méthode appliquée : trois réels à situer.
 * Étape 3  le changement de statut : sin n'est plus une valeur qu'on lit,
 *          c'est une FONCTION définie sur ℝ tout entier.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → brique
 * `reel-au-dela-du-tour` ; étape 2 la demande, désormais légitime ; étape 3
 * constat → brique `fonction-sinus` → demande.
 *
 * MANIPULATION JAMAIS GELÉE : le dérouloir de l'étape 1 reste pilotable après
 * validation — c'est en le repromenant qu'on voit les points se superposer.
 */
export default function Module02UnReelUnPoint() {
  const [cran1, setCran1] = useState(0);
  const [vus1, setVus1] = useState([0]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q3b, setQ3b] = useState(false);

  // Les deux crans à atteindre : 13π/6 (un tour plus loin que π/6) et −π/6.
  const CIBLE_LOIN = CIBLES.find((c) => c.id === 'deux-pi-plus-pi-6').cran;   // 26
  const CIBLE_NEG = CIBLES.find((c) => c.id === 'moins-pi-6').cran;           // −2

  const atteint = (v) => v.includes(CIBLE_LOIN) && v.includes(CIBLE_NEG);
  const done1 = atteint(vus1);
  const done3 = q3 && q3b;

  const visiter = (v, react) => {
    setCran1(v);
    if (vus1.includes(v)) return;
    const suivant = [...vus1, v];
    setVus1(suivant);
    if (!done1 && atteint(suivant)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Au-delà d’un tour, et en dessous de zéro',
      subtitle:
        'Attrape le point et fais-le tourner jusqu’à 13π/6 (soit 2π + π/6), puis jusqu’à −π/6. Regarde à chaque fois OÙ il arrive sur le cercle, et compare avec π/6.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DerouleurLab fn={SIN} cran={cran1} visites={vus1} onChangeCran={(v) => visiter(v, kit.react)} />
          <div className="grid grid-cols-2 gap-2 text-center text-[13px]">
            <div className={`rounded-lg border-2 px-2 py-2 ${vus1.includes(CIBLE_LOIN) ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600'}`}>
              {vus1.includes(CIBLE_LOIN) ? '✔' : '○'} atteindre <strong>13π/6</strong>
            </div>
            <div className={`rounded-lg border-2 px-2 py-2 ${vus1.includes(CIBLE_NEG) ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600'}`}>
              {vus1.includes(CIBLE_NEG) ? '✔' : '○'} atteindre <strong>−π/6</strong>
            </div>
          </div>
          {done1 ? (
            <>
              <Feedback tone="ok">
                Le point n’est jamais « sorti » du cercle. En <strong>13π/6</strong> il est
                exactement là où il était en π/6 : un tour complet de plus, et la hauteur vaut de
                nouveau <strong>{fr(sinExact(tDuCran(CIBLE_LOIN)))}</strong>. En
                <strong> −π/6</strong>, on a tourné dans l’autre sens : le point est en dessous de
                l’axe horizontal, et la hauteur vaut{' '}
                <strong>{fr(sinExact(tDuCran(CIBLE_NEG)))}</strong>.
              </Feedback>
              <KnowledgeBrick
                id="reel-au-dela-du-tour"
                variant="new"
                lead={<>Ce que tu viens de faire vaut pour n’importe quel réel. Repromène le point en le lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Le point s’aimante de douzième de π en douzième de π : 13π/6 est à 26 crans de 0
              (un tour complet, puis deux crans), et −π/6 à deux crans en arrière.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Situer trois réels',
      done: q2,
      content: (
        <BatchChoiceQuestion
          intro={<p>Sur le cercle, chacun de ces réels arrive au même point qu’un réel de [0 ; 2π[. Lequel ?</p>}
          rows={[
            { id: 'r1', label: '9π/4', options: ['π/4', '3π/4', '5π/4'], correct: 0, correction: '9π/4 − 8π/4 = π/4 : on retranche un tour (8π/4 = 2π).' },
            { id: 'r2', label: '−π/2', options: ['3π/2', 'π/2', 'π'], correct: 0, correction: '−π/2 + 2π = 3π/2 : on ajoute un tour pour revenir dans [0 ; 2π[.' },
            { id: 'r3', label: '4π', options: ['0', 'π', '2π'], correct: 0, correction: '4π, c’est exactement DEUX tours : on revient au point de départ, celui du réel 0.' },
          ]}
          requires={['reel-au-dela-du-tour', 'enroulement']}
          feedback={({ allRight }) =>
            allRight ? (
              <>On retranche ou on ajoute des tours entiers jusqu’à tomber dans [0 ; 2π[ — le point, lui, ne bouge pas.</>
            ) : (
              <>Le principe est toujours le même : ajouter ou retrancher 2π autant de fois qu’il le faut. Attention, 2π s’écrit aussi 8π/4 : c’est utile pour 9π/4.</>
            )
          }
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Sin n’est plus une valeur : c’est une fonction',
      subtitle:
        'À chaque réel x, l’enroulement associe UN point, donc UNE hauteur. Cela a un nom précis en mathématiques.',
      done: done3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              Le dérouloir a associé une hauteur à <em>chaque</em> réel que tu as visité : à 0 la
              hauteur {fr(sinExact(0))}, à π/6 la hauteur {fr(sinExact(Math.PI / 6))}, à π/2 la
              hauteur {fr(sinExact(Math.PI / 2))}, à −π/6 la hauteur {fr(sinExact(-Math.PI / 6))}.
              Et aucun réel n’a été refusé.
            </p>
          </div>
          <KnowledgeBrick
            id="fonction-sinus"
            variant="new"
            lead={<>Un objet qui associe un nombre à chaque réel porte un nom que tu connais déjà.</>}
          />
          <TapQuestion
            prompt="Quel est l’ensemble des réels x pour lesquels sin x existe ?"
            options={[
              'Tous les réels : aucun n’est interdit, on peut toujours enrouler',
              'Seulement les réels de [0 ; 2π]',
              'Seulement les réels positifs',
              'Seulement les réels compris entre −1 et 1',
            ]}
            correct={0}
            cols={1}
            requires={['fonction-sinus', 'reel-au-dela-du-tour']}
            explain="Quel que soit le réel x — grand, petit, négatif — on peut enrouler une longueur x sur le cercle et lire la hauteur du point d’arrivée. Les deux fonctions sont définies sur ℝ tout entier."
            explainWrong="Tu viens d’enrouler 13π/6, qui dépasse 2π, et −π/6, qui est négatif : les deux ont donné une hauteur. Aucun réel n’est donc exclu. Attention à ne pas confondre les x qu’on peut enrouler (tous) avec les valeurs obtenues (entre −1 et 1)."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          <NumericQuestion
            prompt={<>En utilisant ce que tu viens de voir : que vaut <strong>sin(13π/6)</strong> ?</>}
            expected={0.5}
            parse={parseReel}
            display="0,5"
            requires={['fonction-sinus', 'reel-au-dela-du-tour']}
            explain="13π/6 = 2π + π/6 : le point est au même endroit que pour π/6, donc la hauteur est la même. sin(13π/6) = sin(π/6) = 0,5."
            explainFor={(n) =>
              n === 13 / 6
                ? 'Tu as répondu avec le réel lui-même, pas avec la hauteur du point. Ce qu’on demande est l’ordonnée du point d’arrivée.'
                : Math.abs(n - 0.87) < 0.02
                ? 'C’est le COSINUS de π/6 (environ 0,87), c’est-à-dire la position horizontale. La hauteur, elle, vaut 0,5.'
                : null
            }
            solved={q3b}
            onAnswered={() => setQ3b(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Un réel, un point"
      moduleSubtitle="Même au-delà d’un tour, même négatif"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Aucun réel n’est refusé',
        tone: 'indigo',
        body: (
          <p>
            Tu sais déjà enrouler la droite des réels sur le cercle. Reste une question que la
            Seconde laissait de côté : que se passe-t-il <strong>au-delà d’un tour</strong>, et
            pour un réel <strong>négatif</strong> ?
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Retour aux deux constats.</strong> Tu sais maintenant situer n’importe quel réel.
          Les deux phénomènes vus au module 1 — la trace qui se répète, la trace qui se retourne —
          peuvent enfin être nommés. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
