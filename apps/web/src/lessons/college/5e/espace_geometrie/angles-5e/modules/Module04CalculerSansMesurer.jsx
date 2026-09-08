import React, { useMemo, useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SecanteLab from '../components/SecanteLab';
import { droite, configuration } from '../components/angles';
import { fr, round } from '../../../../../common/geo5e/geo5e';

/**
 * Module 4 — MANIPULATION : calculer sans mesurer.
 *
 * La propriété du module 3 donne UNE égalité. Ce module montre qu'elle en
 * donne en réalité sept : à partir d'un seul angle connu, les huit se
 * déduisent, et ils ne prennent que DEUX valeurs — a et 180 − a.
 *
 * Le laboratoire affiche les huit mesures en direct ; l'élève tourne la
 * sécante et constate que la structure « deux valeurs qui alternent » ne
 * bouge pas, seules les valeurs changent. C'est cette invariance de FORME,
 * et non un tableau à mémoriser, qui rend le calcul possible.
 *
 * Les valeurs attendues sont DÉDUITES de la configuration réelle, jamais
 * écrites à côté du dessin : l'angle affiché et le nombre attendu viennent du
 * même calcul.
 *
 * Expected observation : « il n'y a que deux valeurs, et elles alternent
 * autour de chaque croisement ».
 * Misconception targeted : croire qu'il faut mesurer chaque angle, ou
 * appliquer « donc égaux » à deux angles adjacents.
 */
const P1 = { x: 390, y: 150 };
const P2 = { x: 390, y: 355 };
const PS = { x: 390, y: 252 };

export default function Module04CalculerSansMesurer() {
  const [s, setS] = useState(droite(PS, 62));
  const [secantes, setSecantes] = useState(0);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const d1 = useMemo(() => droite(P1, 0), []);
  const d2 = useMemo(() => droite(P2, 0), []);   // PARALLÈLES : c'est l'hypothèse

  const config = useMemo(() => {
    try {
      return configuration(d1, d2, s);
    } catch {
      return null;
    }
  }, [d1, d2, s]);

  // Les deux seules valeurs présentes dans la figure, calculées.
  const valeurs = useMemo(() => {
    if (!config) return null;
    const uniques = [];
    for (const a of config.angles) {
      if (!uniques.some((v) => Math.abs(v - a.mesure) < 0.6)) uniques.push(a.mesure);
    }
    return uniques.sort((x, y) => x - y);
  }, [config]);

  const petit = valeurs ? round(valeurs[0], 0) : null;
  const grand = valeurs && valeurs.length > 1 ? round(valeurs[1], 0) : null;

  const assez = secantes >= 3;

  const steps = [
    {
      num: 1,
      title: 'Les huit angles, mais combien de valeurs ?',
      subtitle: 'Les droites sont parallèles. Fais pivoter la sécante et compte les valeurs différentes.',
      done: assez,
      content: (kit) => (
        <div className="space-y-3">
          <SecanteLab
            d1={d1}
            d2={d2}
            s={s}
            onS={(ns) => {
              setS(ns);
              setSecantes((n) => {
                const next = n + 1;
                if (next === 3) kit.react?.(true);
                return next;
              });
            }}
            montrer="tous"
            ariaLabel="Deux droites parallèles coupées par une sécante, avec les huit angles mesurés"
          />
          {valeurs && (
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-800 text-center mb-2">
                Les valeurs présentes dans la figure
              </div>
              <div className="flex gap-2 justify-center flex-wrap">
                {valeurs.map((v) => (
                  <span key={v} className="rounded-lg bg-white border-2 border-emerald-300 px-3 py-1.5 font-mono text-base font-black tabular-nums text-emerald-700">
                    {fr(v, 0)}°
                  </span>
                ))}
              </div>
              <div className="text-center text-sm text-slate-600 mt-2">
                {valeurs.length === 1
                  ? 'une seule valeur — la sécante est perpendiculaire aux deux droites'
                  : <>seulement <strong>deux valeurs</strong> pour huit angles</>}
              </div>
            </div>
          )}
          {assez ? (
            <Feedback tone="ok">
              Quelle que soit la sécante, les huit angles ne prennent jamais que{' '}
              <strong>deux valeurs</strong>, et leur somme fait toujours 180°. Elles alternent
              autour de chaque croisement, et se répètent à l’identique au second — parce que les
              droites sont parallèles.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Sécantes essayées : <strong className="tabular-nums">{secantes}</strong> sur 3.
              Combien de valeurs différentes vois-tu à chaque fois ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La méthode',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="calculer-les-angles"
            variant="new"
            lead={<>Deux valeurs seulement, qui alternent : c’est ce qui permet de déduire les sept autres angles d’un seul.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Deux droites <strong>parallèles</strong> sont coupées par une sécante. Un angle
                mesure <strong>72°</strong>. Pour chaque angle décrit, donne sa mesure.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'Son angle opposé par le sommet',
                options: ['72°', '108°'],
                correct: 0,
                correction: 'Les opposés par le sommet sont toujours égaux : 72°.',
              },
              {
                id: 'r2',
                label: 'Son angle adjacent (à côté, sur la même droite)',
                options: ['108°', '72°'],
                correct: 0,
                correction: 'Deux angles adjacents forment un angle plat : 180 − 72 = 108°.',
              },
              {
                id: 'r3',
                label: 'Son angle correspondant, à l’autre croisement',
                options: ['72°', '108°'],
                correct: 0,
                correction: 'Les droites sont parallèles : les correspondants sont égaux, donc 72°.',
              },
              {
                id: 'r4',
                label: 'Son angle alterne-interne',
                options: ['72°', '108°'],
                correct: 0,
                correction: 'Parallèles également : les alternes-internes sont égaux, donc 72°.',
              },
            ]}
            requires={['calculer-les-angles', 'paralleles-angles-egaux', 'angles-alternes-internes', 'angles-correspondants']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Un seul angle donné, et toute la figure se remplit. Retiens la règle du tri :{' '}
                  <strong>adjacent → 180 moins</strong> ; <strong>tout le reste → la même
                  mesure</strong>.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Une seule question à te poser à chaque fois :{' '}
                  <strong>cet angle est-il collé au mien sur la même droite ?</strong> Si oui, c’est
                  180 moins ; sinon, c’est la même mesure.
                </Feedback>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'À toi de remplir la figure',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5 text-sm text-slate-700">
            Deux droites parallèles sont coupées par une sécante. L’un des huit angles mesure{' '}
            <strong>124°</strong>.
          </div>
          <NumericQuestion
            prompt="Combien mesure l’angle qui lui est adjacent, sur la même droite ?"
            expected={56}
            suffix="°"
            requires={['calculer-les-angles']}
            explain="Deux angles adjacents forment un angle plat : 180 − 124 = 56°."
            explainFor={(n) => (n === 124
              ? '124° est la mesure de l’angle de départ. Un angle ADJACENT le complète jusqu’à l’angle plat : 180 − 124 = 56°.'
              : n === 236
                ? 'Tu as ajouté au lieu de soustraire : un angle ne peut pas dépasser 180°. La bonne opération est 180 − 124.'
                : null)}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Tu sais maintenant <strong>déduire</strong> quand on te dit que les droites sont
              parallèles. Mais que faire quand personne ne te le dit — et que c’est justement ce
              qu’il faut établir ? C’est le module suivant.
            </Feedback>
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
      moduleTitle="Calculer sans mesurer"
      moduleSubtitle="Un seul angle donné, et les sept autres suivent"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Huit angles, deux valeurs',
        tone: 'indigo',
        body: (
          <p>
            Range le rapporteur. Quand les droites sont parallèles, <strong>un seul angle</strong>{' '}
            suffit à connaître les sept autres — et tu vas voir pourquoi en comptant les valeurs
            différentes à l’écran.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
