import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SALLE } from '../components/situations';
import { readCurve, inputsReaching, maximumOf, toPoints, fr, parseDec } from '../components/fonctionsUtils';

/**
 * Module 5 — MANIPULATION : lire un graphique pour répondre à une question.
 *
 * Action → changement → observation → sens :
 *   déplacer la sonde le long de la journée → la température lue se réécrit →
 *   « il fait 22 °C à DEUX moments » → une entrée n'a qu'une sortie, mais une
 *   sortie peut venir de plusieurs entrées.
 *
 * Expected observation : « la courbe monte puis redescend, donc la même
 * température revient l'après-midi ».
 * Misconception targeted : croire que la lecture est symétrique — qu'à une
 * température donnée correspond forcément un seul instant.
 *
 * PÉRIMÈTRE : la dissymétrie est FAITE VOIR, jamais nommée « antécédent »
 * (3e). On dit « les moments où il fait 22 °C ».
 *
 * SÉCURITÉ VISUELLE : `unitY` distinct, cadre calé sur les relevés, et la
 * lecture de la sonde vit dans le DOM (sous le repère) et non en texte SVG.
 */
const MAXI = maximumOf(SALLE);

export default function Module05LireLeGraphique() {
  const [h, setH] = useState(8);
  const [bouge, setBouge] = useState(false);
  const done1 = bouge;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const sonder = (v, react) => {
    setH(v);
    if (v !== 8 && !bouge) {
      setBouge(true);
      react?.(true);
    }
  };

  const lue = readCurve(SALLE, h);
  const moments22 = inputsReaching(SALLE, 22);

  const steps = [
    {
      num: 1,
      title: 'Promène la sonde',
      subtitle: 'La température de la salle, heure par heure. Déplace le curseur.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Un thermomètre a relevé la <strong>température de la salle polyvalente</strong> toute la
            journée, de 8 h à 18 h.
          </div>

          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 18, yMin: 0, yMax: 28 }}
              unit={20}
              unitY={9}
              xStep={2}
              yStep={4}
              points={toPoints(SALLE, '#7c3aed', 'sa')}
              curves={[{ id: 'temp', points: SALLE, tone: 'violet', label: 'température' }]}
              cursor={{ x: h, onChange: (v) => sonder(v, kit.react) }}
              axisLabels={{ x: 'h', y: '°C' }}
              ariaLabel="Repère : la température de la salle en fonction de l’heure"
              caption={false}
            />
          </div>

          <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-3.5 space-y-2.5">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <label htmlFor="sonde-h" className="text-sm font-bold text-purple-900">
                Heure
              </label>
              <span className="font-mono text-2xl font-black tabular-nums text-purple-700">
                {fr(h)} h → {fr(lue)} °C
              </span>
            </div>
            <input
              id="sonde-h"
              type="range"
              min={8}
              max={18}
              step={0.5}
              value={h}
              onChange={(e) => sonder(Number(e.target.value), kit.react)}
              className="w-full accent-purple-600 h-6 cursor-pointer"
              aria-label="Heure de la journée"
            />
          </div>

          {done1 ? (
            <Feedback tone="ok">
              La courbe <strong>monte le matin</strong>, atteint son sommet vers{' '}
              <strong className="font-mono">{fr(MAXI.x)} h</strong> ({fr(MAXI.y)} °C), puis{' '}
              <strong>redescend</strong>. Elle ne fait pas que grimper : c’est une dépendance, pas
              une montée.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais glisser la sonde sur toute la journée. À quelle heure fait-il le plus chaud ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Répondre à une vraie question',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="lire-graphique"
            variant="new"
            lead={<>C’est exactement le geste que tu viens de faire avec la sonde.</>}
          />
          <NumericQuestion
            prompt={
              <>
                Le club de théâtre répète à <strong>16 h</strong>. Quelle température fera-t-il dans
                la salle ?
              </>
            }
            expected={readCurve(SALLE, 16)}
            parse={parseDec}
            suffix="°C"
            requires={['lire-graphique', 'couple-point']}
            explain="On repère 16 h sur l’axe horizontal, on monte jusqu’à la courbe, et on lit à gauche : 22 °C."
            explainFor={() =>
              'Pars de 16 sur l’axe des heures, monte jusqu’à rencontrer la courbe, puis lis la valeur sur l’axe vertical.'
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La question qui a deux réponses',
      subtitle: 'Cette fois, on connaît la température et on cherche l’heure.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                À quels moments de la journée la salle est-elle exactement à{' '}
                <strong>22 °C</strong> ?
              </>
            }
            options={[
              'À deux moments : une fois le matin, une fois l’après-midi',
              'À un seul moment',
              'Jamais',
            ]}
            cols={1}
            correct={0}
            /* La courbe est visible depuis l'étape 1, et l'élève l'a balayée
               avec la sonde : la question porte sur ce qu'il a déjà vu. */
            above={(revealed) =>
              revealed ? (
                <div className="overflow-x-auto">
                  <CoordPlane
                    range={{ xMin: 0, xMax: 18, yMin: 0, yMax: 28 }}
                    unit={20}
                    unitY={9}
                    xStep={2}
                    yStep={4}
                    points={moments22.map((x) => ({ id: `m${x}`, x, y: 22, color: '#e11d48' }))}
                    curves={[{ id: 'temp', points: SALLE, tone: 'violet', label: 'température' }]}
                    axisLabels={{ x: 'h', y: '°C' }}
                    ariaLabel="Les deux moments où la salle est à 22 degrés"
                    caption={false}
                  />
                </div>
              ) : null
            }
            requires={['lire-graphique']}
            explain={`La courbe passe par 22 °C deux fois : à ${moments22.map((m) => `${fr(m)} h`).join(' et à ')}. Une fois en montant le matin, une fois en redescendant l’après-midi.`}
            explainWrong={`Regarde bien la courbe : elle monte jusqu’à ${fr(MAXI.x)} h, puis redescend. Elle croise donc la hauteur 22 °C deux fois — à ${moments22.map((m) => `${fr(m)} h`).join(' et à ')}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Les deux sens ne se valent pas',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="plusieurs-instants"
            variant="new"
            lead={<>Une heure donnait une seule température ; 22 °C a donné deux heures.</>}
          />
          <TapQuestion
            prompt="Laquelle de ces deux phrases est toujours vraie pour la salle ?"
            options={[
              'À une heure donnée correspond une seule température',
              'À une température donnée correspond une seule heure',
            ]}
            cols={1}
            correct={0}
            requires={['plusieurs-instants', 'meme-entree-meme-sortie']}
            explain="À 16 h, il ne peut pas faire deux températures à la fois. En revanche, 22 °C se produit deux fois dans la journée. C’est pourquoi on précise toujours quelle grandeur dépend de laquelle."
            explainWrong="C’est justement ce que l’étape précédente a montré : 22 °C correspond à deux heures différentes. Le sens qui fonctionne toujours est l’autre — une heure ne donne qu’une température."
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Lire le graphique"
      moduleSubtitle="Une sonde, et de vraies questions"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le dessin répond, si on sait l’interroger',
        tone: 'indigo',
        body: (
          <p>
            Un graphique n’est pas une décoration : c’est un outil pour{' '}
            <strong>répondre à des questions</strong>. Promène la sonde sur la journée — et
            découvre une question qui, elle, a deux réponses.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
