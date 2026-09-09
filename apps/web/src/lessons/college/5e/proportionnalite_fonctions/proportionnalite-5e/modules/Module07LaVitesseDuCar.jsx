import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { speed, distance, fr, parseDec } from '../components/propUtils';

/**
 * Module 7 — LABO : la vitesse moyenne.
 *
 * Le coefficient a une UNITÉ, et cette unité dit le calcul : « km/h » se lit
 * « kilomètres par heure », donc kilomètres DIVISÉS PAR heures. C'est le
 * dernier transfert du niveau, et il referme la leçon sur la même opération
 * que le module 2 — sortie ÷ entrée — appliquée à une distance et à une durée.
 *
 * Action → changement → observation → sens :
 *   régler la durée du trajet → la distance suit sur le graphique →
 *   « la pente ne change pas » → une vitesse constante est un coefficient.
 *
 * Misconception targeted : croire qu'une vitesse moyenne est la moyenne des
 * vitesses, ou que le car a roulé à 60 km/h à chaque instant. Le mot
 * « moyenne » est explicité dans la brique.
 *
 * PÉRIMÈTRE : pas de conversion m/s ↔ km/h (4e), pas de graphique
 * distance-temps à plusieurs pentes.
 */
const KMH = 60;

export default function Module07LaVitesseDuCar() {
  const [h, setH] = useState(1);
  const [vu1, setVu1] = useState(false);
  const done1 = vu1;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const bouger = (v, react) => {
    setH(v);
    if (v !== 1 && !vu1) {
      setVu1(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Le trajet du car',
      subtitle: 'Fais varier la durée : la distance parcourue suit.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Le car roule à allure régulière vers le parc. En <strong>3 h</strong>, il parcourt{' '}
            <strong>180 km</strong>.
          </div>

          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 space-y-2.5">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <label htmlFor="vitesse-h" className="text-sm font-bold text-amber-900">
                Durée du trajet
              </label>
              <span className="font-mono text-2xl font-black tabular-nums text-amber-700">
                {fr(h)} h
              </span>
            </div>
            <input
              id="vitesse-h"
              type="range"
              min={0.5}
              max={4}
              step={0.5}
              value={h}
              onChange={(e) => bouger(Number(e.target.value), kit.react)}
              className="w-full accent-amber-600 h-6 cursor-pointer"
              aria-label="Durée du trajet en heures"
            />
            <div className="grid sm:grid-cols-2 gap-2">
              <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-center space-y-0.5">
                <div className="text-xs font-semibold text-slate-500">Distance parcourue</div>
                <div className="font-mono text-lg font-black tabular-nums text-slate-800">
                  {fr(distance(KMH, h))} km
                </div>
              </div>
              <div className="rounded-xl border-2 border-amber-300 bg-white px-3 py-2 text-center space-y-0.5">
                <div className="text-xs font-semibold text-slate-500">Distance ÷ durée</div>
                <div className="font-mono text-lg font-black tabular-nums text-amber-700">
                  {fr(speed(distance(KMH, h), h))} km/h
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 4, yMin: 0, yMax: 240 }}
              unit={55}
              unitY={0.85}
              xStep={0.5}
              yStep={60}
              points={[{ id: 'car', x: h, y: distance(KMH, h), color: '#d97706' }]}
              functions={[{ id: 'trajet', a: KMH, b: 0, tone: 'amber', label: 'trajet du car' }]}
              axisLabels={{ x: 'h', y: 'km' }}
              ariaLabel="Repère : la distance parcourue en fonction de la durée"
              caption={false}
            />
          </div>

          {done1 ? (
            <Feedback tone="ok">
              Quelle que soit la durée, <strong className="font-mono">distance ÷ durée</strong>{' '}
              donne toujours <strong className="font-mono">60 km/h</strong>. C’est exactement le
              calcul du coefficient — et le point reste sur la même droite, qui part de l’origine.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Glisse la durée. Le nombre de droite change-t-il ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un coefficient avec une unité',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="vitesse-moyenne"
            variant="new"
            lead={<>Le nombre que tu retrouvais à chaque durée, c’est la vitesse moyenne.</>}
          />
          <KnowledgeBrick id="mem-vitesse" variant="new" compact />
          <NumericQuestion
            prompt={
              <>
                Un cycliste parcourt <strong>45 km</strong> en <strong>3 h</strong>. Quelle est sa
                vitesse moyenne ?
              </>
            }
            expected={15}
            parse={parseDec}
            suffix="km/h"
            requires={['vitesse-moyenne']}
            explain="45 km ÷ 3 h = 15 km/h. L’unité « km/h » dit l’opération : des kilomètres divisés par des heures."
            explainFor={(n) =>
              n === 135
                ? 'Tu as multiplié. L’unité km/h indique une DIVISION : 45 ÷ 3 = 15.'
                : 'Divise la distance par la durée : 45 ÷ 3 = 15 km/h.'
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Dans l’autre sens',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <>
                Le car roule à <strong>60 km/h</strong>. Quelle distance parcourt-il en{' '}
                <strong>2,5 h</strong> ?
              </>
            }
            expected={150}
            parse={parseDec}
            suffix="km"
            requires={['vitesse-moyenne', 'coefficient-proportionnalite']}
            explain="La vitesse est un coefficient : distance = vitesse × durée, soit 60 × 2,5 = 150 km."
            explainFor={(n) =>
              n === 24
                ? 'Tu as divisé 60 par 2,5. Ici on connaît le coefficient et l’entrée (la durée) : on multiplie. 60 × 2,5 = 150 km.'
                : 'Multiplie la vitesse par la durée : 60 × 2,5 = 150 km.'
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce que « moyenne » veut dire',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Le car a fait 180 km en 3 h, soit <strong>60 km/h</strong> de moyenne. Qu’est-ce
                que cela signifie exactement ?
              </>
            }
            options={[
              'Le car aurait fait le même trajet dans le même temps en roulant tout du long à 60 km/h',
              'Le car a roulé à 60 km/h à chaque instant du trajet',
              'Le car n’a jamais dépassé 60 km/h',
            ]}
            cols={1}
            correct={0}
            requires={['vitesse-moyenne']}
            explain="Une vitesse moyenne résume tout le trajet par un seul nombre. Le car a ralenti aux feux et accéléré sur la route ; 60 km/h est la vitesse constante qui aurait donné le même résultat."
            explainWrong="Un vrai trajet comporte des arrêts et des accélérations : le car n’a presque jamais été exactement à 60 km/h. La moyenne ne décrit pas chaque instant, elle résume l’ensemble."
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
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="La vitesse du car"
      moduleSubtitle="Le coefficient porte une unité"
      estimatedTime="9 min"
      brief={{
        tag: 'Labo',
        title: 'km/h : l’unité qui dit le calcul',
        tone: 'amber',
        body: (
          <p>
            Depuis le module 2, tu calcules <strong>sortie ÷ entrée</strong>. Applique-le à des
            kilomètres et à des heures : tu obtiens une <strong>vitesse</strong>. Son unité,
            « km/h », est le mode d’emploi de l’opération.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={7} />}
    />
  );
}
