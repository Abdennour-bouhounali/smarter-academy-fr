import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shapes } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import KindMorph from '../components/KindMorph';
import GeoFigure from '../components/GeoFigure';
import { KINDS, KIND_LABEL, extentSentence } from '../components/droitesUtils';

/**
 * Module 3 — DÉCOUVERTE : les trois objets côte à côte, une seule variable.
 *
 * Objectif : isoler l'étendue comme SEULE différence. Les points A et B ne
 * bougent pas ; seules les pastilles changent le type — et le dessin change.
 *
 * Aha : deux points ne suffisent pas à définir un objet géométrique. Il faut
 * dire jusqu'où il va.
 *
 * Misconception visée : identifier un objet à son apparence (« ça a l'air
 * court, donc c'est un segment ») plutôt qu'à ses extrémités.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 160 };
const A = { x: 90, y: 105 };
const B = { x: 215, y: 65 };

/* Trois figures à identifier, dessinées SANS étiquette. */
const IDENT = [
  { id: 'i1', kind: 'droite' },
  { id: 'i2', kind: 'segment' },
  { id: 'i3', kind: 'demi-droite' },
];

export default function Module03TriDesTraits() {
  const [obj, setObj] = useState({ kind: 'segment', a: A, b: B });
  const [seen, setSeen] = useState(['segment']);
  const [morphDone, setMorphDone] = useState(false);
  const [identDone, setIdentDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  const allSeen = KINDS.every((k) => seen.includes(k));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le tri des traits"
      moduleSubtitle="Trois objets, une seule différence : jusqu’où ça continue."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Mêmes points, trois objets différents.',
        body: (
          <p>
            A et B ne bougeront pas. Change seulement le <strong>type</strong> et observe ce qui apparaît ou
            disparaît sur le dessin.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Passe en revue les trois types',
          subtitle: 'Regarde les bouts et les flèches à chaque changement.',
          done: morphDone,
          content: (kit) => (
            <div className="space-y-3">
              <KindMorph
                obj={obj}
                onKindChange={(k) => {
                  setObj((o) => ({ ...o, kind: k }));
                  setSeen((s) => (s.includes(k) ? s : [...s, k]));
                }}
                box={BOX}
                disabled={morphDone}
              />
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-mono text-slate-500">
                  Types explorés : {seen.length} / {KINDS.length}
                </span>
                {!morphDone && (
                  <button
                    type="button"
                    disabled={!allSeen}
                    onClick={() => {
                      kit.react(true);
                      setMorphDone(true);
                    }}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    J’ai vu les trois
                  </button>
                )}
              </div>
              {morphDone && (
                <Feedback tone="ok">
                  A et B n’ont jamais bougé. Seule l’étendue a changé — et avec elle, les flèches et les
                  points d’extrémité.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Reconnais chaque figure',
          done: identDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <div className="space-y-3">
                  {IDENT.map((f, i) => (
                    <div key={f.id} className="rounded-xl border-2 border-slate-200 bg-white p-2">
                      <p className="text-xs font-mono text-slate-500 mb-1">Figure {i + 1}</p>
                      <GeoFigure
                        objects={[{ kind: f.kind, a: A, b: B }]}
                        box={BOX}
                        showNames={false}
                        size={280}
                        ariaLabel={`Figure ${i + 1}`}
                      />
                    </div>
                  ))}
                  <p className="text-sm text-slate-600">
                    Regarde les bouts : un rond plein est une extrémité, une flèche veut dire « ça continue ».
                  </p>
                </div>
              }
              rows={IDENT.map((f, i) => ({
                id: f.id,
                label: <span className="font-semibold">Figure {i + 1}</span>,
                options: KINDS.map((k) => KIND_LABEL[k]),
                correct: KINDS.indexOf(f.kind),
                correction: <>{KIND_LABEL[f.kind]}</>,
              }))}
              solved={identDone}
              onAnswered={() => setIdentDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Compte les ronds pleins : 2 pour un segment, 1 pour une demi-droite, 0 pour une droite.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'La règle en une phrase',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Pour savoir de quel objet il s’agit, que faut-il regarder en premier ?"
              options={[
                'Ses extrémités : combien il en a',
                'Sa longueur sur le dessin',
                'Son inclinaison',
              ]}
              correct={0}
              cols={1}
              explain="Le nombre d’extrémités décide de tout : 2 → segment, 1 → demi-droite, 0 → droite. La longueur dessinée ne prouve rien, puisqu’on ne voit qu’un morceau de la feuille."
              explainWrong="La longueur et l’inclinaison ne prouvent rien : sur un dessin, une droite paraît courte parce que la feuille s’arrête. Ce sont les extrémités qui comptent."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 space-y-3"
        >
          <Shapes className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
          <div className="grid sm:grid-cols-3 gap-2 text-sm">
            {KINDS.map((k) => (
              <div key={k} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="font-bold text-white capitalize mb-1">{KIND_LABEL[k]}</div>
                <div className="text-slate-300 text-xs">{extentSentence(k)}</div>
              </div>
            ))}
          </div>
        </motion.div>
      }
    />
  );
}
