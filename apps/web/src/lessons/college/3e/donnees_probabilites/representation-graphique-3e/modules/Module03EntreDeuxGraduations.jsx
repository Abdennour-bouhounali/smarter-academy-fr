import React, { useState } from 'react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CROISSANCE } from '../components/graphData';
import { describeError } from '../components/graphUtils';
import { formatDec } from '@smarter-academy/core';

/**
 * Module 3 — DÉCOUVERTE : « Entre deux graduations ».
 *
 * Activity: placer des points dont l'ordonnée ne tombe PAS sur une graduation.
 * Mathematical objective: quand un carreau vaut 5, placer 22,5 demande de
 *   compter des demi-carreaux. Le pas de la grille et le pas des valeurs ne
 *   coïncident pas — c'est la difficulté propre à cette leçon.
 * Student action: déplacer le point (doigt ou flèches), puis valider.
 * Controlled variable: la position du point, au demi-carreau.
 * Mathematical state: { placed[] } comparé aux lignes du tableau ; l'écart est
 *   calculé par `describeError`, donc la correction ne peut pas diverger.
 * Visual consequence: le point validé se fige en vert ; un point faux reste
 *   visible et la cible en pointillé montre où il fallait aller.
 * Expected observation: « 22,5 est au milieu entre 20 et 25 ».
 * Misconception targeted: arrondir à la graduation la plus proche parce que
 *   « ça tombe entre deux » ; et lire l'échelle comme si un carreau valait 1.
 * Feedback: l'écart est dit en mots et en unités, jamais jugé ; échappée après
 *   3 essais.
 * Formalization: aucune ; la règle de lecture est déjà posée au module 2.
 * Scaffolding: première cible affichée, les suivantes non.
 * Transfer: le module 4 fait construire le graphique entier.
 *
 * NOTE — `fonctions-3e` M04 plaçait déjà des points d'un tableau, mais sur une
 * grille d'unités où tout tombait juste, et pour constater l'alignement. Ici le
 * pas vaut 5 et les valeurs sont décimales : l'objet est le placement lui-même.
 */

const RANGE = { xMin: 0, xMax: 5, yMin: 0, yMax: 35 };
const Y_STEP = 5;
const TARGETS = CROISSANCE.rows;

export default function Module03EntreDeuxGraduations() {
  const [cur, setCur] = useState({ x: 1, y: 5 });
  const [placed, setPlaced] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [halfDone, setHalfDone] = useState(false);

  const idx = placed.length;
  const target = idx < TARGETS.length ? TARGETS[idx] : null;
  const done1 = placed.length === TARGETS.length || revealed;

  const validate = (kit) => {
    if (done1 || !target) return;
    if (cur.x === target.x && cur.y === target.y) {
      setPlaced((p) => [...p, { x: cur.x, y: cur.y }]);
      setWrong(null);
      kit.react(true);
    } else {
      setWrong({ placed: { ...cur }, target });
      setTries((t) => t + 1);
      kit.react(false);
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Entre deux graduations"
      moduleSubtitle="Quand le pas ne vaut pas 1, placer un point demande de compter."
      estimatedTime="8 min"
      brief={{
        tag: '🌱 Mission 03',
        title: 'Le tournesol, semaine après semaine',
        tone: 'indigo',
        body: (
          <p>
            Un carreau vertical vaut <strong>5 cm</strong>. Or les hauteurs mesurées sont
            7,5 · 15 · 22,5 · 30. Toutes ne tombent pas sur une graduation.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Place les quatre mesures',
          subtitle: 'Déplace le point, puis pose-le.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Hauteur du plant par semaine</caption>
                  <tbody>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600">Semaine</th>
                      {TARGETS.map((r, i) => (
                        <td key={`x${r.x}`} className={`px-3 text-center font-mono tabular-nums ${i === idx && !done1 ? 'bg-amber-100 rounded font-bold' : ''}`}>
                          {formatDec(r.x)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600">Hauteur (cm)</th>
                      {TARGETS.map((r, i) => (
                        <td key={`y${r.x}`} className={`px-3 text-center font-mono tabular-nums ${i === idx && !done1 ? 'bg-amber-100 rounded font-bold' : ''}`}>
                          {formatDec(r.y)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <CoordPlane
                range={RANGE}
                unit={30}
                unitY={312 / (RANGE.yMax - RANGE.yMin)}
                xStep={1}
                yStep={Y_STEP}
                // Pas D'AIMANTATION PAR AXE. Un pas unique de 2,5 s'appliquait
                // aussi aux abscisses : seules 0, 2,5 et 5 étaient
                // atteignables, donc aucune des semaines 1 à 4 — l'élève ne
                // pouvait poser presque aucun point. Les semaines sont
                // entières, les hauteurs tombent au demi-carreau.
                step={{ x: 1, y: 2.5 }}
                points={[
                  ...placed.map((p, i) => ({ id: `p${i}`, x: p.x, y: p.y, color: '#059669' })),
                  ...(done1 ? [] : [{ id: 'M', name: 'M', x: cur.x, y: cur.y, color: '#4f46e5' }]),
                ]}
                draggableId={done1 ? null : 'M'}
                onPointChange={(p) => { setCur(p); setWrong(null); }}
                target={!done1 && target && placed.length === 0 ? target : null}
                ghost={wrong ? { ...wrong.target, label: 'ici' } : null}
                axisLabels={{ x: 'semaine', y: 'cm' }}
                ariaLabel="Repère : placer les hauteurs du plant"
                caption={!done1}
              />

              {!done1 && (
                <>
                  <button
                    type="button"
                    onClick={() => validate(kit)}
                    className="w-full min-h-[48px] rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Poser le point ({formatDec(target.x)} ; {formatDec(target.y)})
                  </button>
                  <Feedback tone={wrong ? 'ko' : 'info'}>
                    {wrong ? (
                      <>Ton point est à {describeError(wrong.placed, wrong.target)} de la position demandée.</>
                    ) : (
                      <>
                        Il reste <strong>{TARGETS.length - placed.length}</strong> point
                        {TARGETS.length - placed.length > 1 ? 's' : ''}. Un carreau vaut 5 cm :
                        pour 7,5 cm, vise entre 5 et 10.
                      </>
                    )}
                  </Feedback>
                  {tries >= 3 && (
                    <button
                      type="button"
                      onClick={() => { setPlaced(TARGETS.map((t) => ({ ...t }))); setRevealed(true); setWrong(null); kit.react(false); }}
                      className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Je ne trouve pas — montre-moi les points
                    </button>
                  )}
                </>
              )}

              {done1 && (
                <Feedback tone={revealed ? 'info' : 'ok'}>
                  {revealed ? 'On te les montre. ' : 'Les quatre points sont posés. '}
                  Deux d’entre eux tombaient <strong>entre</strong> deux graduations : il
                  fallait viser le milieu du carreau.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Compter les demi-carreaux',
          done: halfDone,
          content: (
            <TapQuestion
              prompt="Un carreau vaut 5 cm. Où se place une hauteur de 12,5 cm ?"
              options={[
                'Au milieu entre 10 et 15',
                'Sur la graduation 10, la plus proche',
                'Sur la graduation 15',
                'On ne peut pas la placer avec cette échelle',
              ]}
              correct={0}
              cols={1}
              explain="12,5 est exactement à mi-chemin entre 10 et 15 : on place le point au milieu du carreau. Arrondir à la graduation la plus proche fausserait le graphique — un point vaut la valeur qu’il représente, pas la graduation d’à côté."
              explainWrong="Une valeur qui tombe entre deux graduations se place entre elles. C’est justement à quoi sert de choisir une échelle : savoir ce que vaut un carreau permet de placer n’importe quelle valeur."
              solved={halfDone}
              onAnswered={() => setHalfDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Placer un point, c’est traduire deux nombres en une position. Quand l’échelle ne
          vaut pas 1, il faut <strong>compter les carreaux</strong> — et parfois les couper
          en deux.
        </Feedback>
      }
    />
  );
}
