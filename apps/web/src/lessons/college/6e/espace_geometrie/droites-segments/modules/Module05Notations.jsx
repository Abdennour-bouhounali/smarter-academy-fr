import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GeoFigure from '../components/GeoFigure';
import KindMorph from '../components/KindMorph';
import { KINDS, KIND_LABEL, notationOf, notationParts, allNotations } from '../components/droitesUtils';

/**
 * Module 5 — FORMALISATION : la notation, lue COMME l'étendue.
 *
 * Le symbole arrive en dernier, et il est justifié : un crochet ferme (il y a
 * une extrémité de ce côté), une parenthèse ouvre (ça continue). La notation
 * n'est donc pas une convention à mémoriser, c'est un DESSIN de l'étendue.
 *
 * Aha : [AB) se lit de gauche à droite — « ça s'arrête en A, ça continue
 * après B ». Le symbole raconte ce que l'élève a manipulé aux modules 1-3.
 *
 * Misconception visée : mémoriser les notations sans les relier à l'étendue,
 * et donc confondre [AB] et (AB) au moindre stress.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 150 };
const A = { x: 95, y: 100 };
const B = { x: 215, y: 65 };

const MATCH = KINDS.map((k) => ({ id: `n-${k}`, kind: k }));

/** Décomposition visuelle d'une notation : chaque symbole, son sens. */
function NotationBreakdown({ kind }) {
  const p = notationParts(kind);
  const notation = notationOf({ kind }, 'A', 'B');
  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4 space-y-3">
      <div className="text-center font-mono font-extrabold text-3xl text-blue-900 tracking-widest">
        {notation}
      </div>
      <div className="grid sm:grid-cols-2 gap-2 text-sm">
        <div className="bg-white rounded-xl p-3 border border-blue-200">
          <span className="font-mono font-bold text-lg text-blue-700">{p.left}</span>
          <span className="text-slate-700"> côté A : {p.leftMeans}</span>
        </div>
        <div className="bg-white rounded-xl p-3 border border-blue-200">
          <span className="font-mono font-bold text-lg text-blue-700">{p.right}</span>
          <span className="text-slate-700"> côté B : {p.rightMeans}</span>
        </div>
      </div>
      <p className="text-xs text-blue-900 text-center">
        Un <strong>crochet</strong> ferme : il y a une extrémité. Une <strong>parenthèse</strong> ouvre : ça
        continue sans fin.
      </p>
    </div>
  );
}

export default function Module05Notations() {
  const [obj, setObj] = useState({ kind: 'segment', a: A, b: B });
  const [seen, setSeen] = useState(['segment']);
  const [exploreDone, setExploreDone] = useState(false);
  const [matchDone, setMatchDone] = useState(false);
  const [readDone, setReadDone] = useState(false);

  const allSeen = KINDS.every((k) => seen.includes(k));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Crochets et parenthèses"
      moduleSubtitle="(AB), [AB], [AB) : chaque signe raconte l’étendue."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'La notation n’est pas à apprendre par cœur — elle se lit.',
        body: (
          <p>
            Change le type et regarde la notation changer <strong>en même temps</strong> que les bouts du
            trait.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Change le type, regarde la notation',
          done: exploreDone,
          content: (kit) => (
            <div className="space-y-3">
              <KindMorph
                obj={obj}
                onKindChange={(k) => {
                  setObj((o) => ({ ...o, kind: k }));
                  setSeen((s) => (s.includes(k) ? s : [...s, k]));
                }}
                box={BOX}
                showNotation
                disabled={exploreDone}
              />
              <NotationBreakdown kind={obj.kind} />
              {!exploreDone && (
                <button
                  type="button"
                  disabled={!allSeen}
                  onClick={() => { kit.react(true); setExploreDone(true); }}
                  className="w-full min-h-[44px] rounded-xl bg-blue-600 text-white font-bold text-sm disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {allSeen ? 'J’ai compris la logique des symboles' : `Explore les trois types (${seen.length} / 3)`}
                </button>
              )}
              {exploreDone && (
                <>
                  <Feedback tone="ok">
                    Le symbole suit l’étendue : il n’y a rien de plus à retenir.
                  </Feedback>
                  <KnowledgeBrick
                    id="lire-la-notation"
                    variant="new"
                    lead="Tu as vu les symboles bouger en même temps que les bouts du trait : voilà la règle."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Associe chaque objet à sa notation',
          done: matchDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque objet passant par A et B, choisis la bonne écriture.
                </p>
              }
              requires={['lire-la-notation', 'notation-objets', 'mem-compter-bouts']}
              rows={MATCH.map((r) => ({
                id: r.id,
                label: <span className="font-semibold capitalize">{KIND_LABEL[r.kind]}</span>,
                options: allNotations().map((n) => n.notation),
                correct: allNotations().findIndex((n) => n.kind === r.kind),
                correction: <>{notationOf({ kind: r.kind }, 'A', 'B')}</>,
              }))}
              solved={matchDone}
              onAnswered={() => setMatchDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Compte les crochets : deux crochets = deux extrémités = un segment. Un seul crochet = une
                  seule extrémité = une demi-droite. Aucun = une droite.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 3,
          title: 'Lis une notation',
          done: readDone,
          content: (
            <TapQuestion
              above={
                <GeoFigure
                  objects={[{ kind: 'demi-droite', a: A, b: B, nameA: 'A', nameB: 'B' }]}
                  box={BOX}
                  showNotation
                  ariaLabel="Demi-droite d’origine A, notée [AB)"
                />
              }
              prompt={
                <>
                  Que signifie l’écriture <span className="font-mono font-bold">[AB)</span> ?
                </>
              }
              options={[
                'Ça s’arrête en A, et ça continue sans fin du côté de B',
                'Ça s’arrête en A et en B',
                'Ça continue sans fin des deux côtés',
              ]}
              correct={0}
              cols={1}
              requires={['lire-la-notation', 'demi-droite', 'origine']}
              explain="Le crochet devant A dit « extrémité ici » ; la parenthèse après B dit « ça continue ». C’est la demi-droite d’origine A passant par B."
              explainWrong="Relis symbole par symbole : [ ferme du côté de A, ) ouvre du côté de B. Deux crochets auraient donné le segment [AB], deux parenthèses la droite (AB)."
              solved={readDone}
              onAnswered={() => setReadDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu lis les écritures. À l’atelier suivant, c’est toi qui traces
          l’objet demandé.
        </KnowledgeSnapshot>
      }
    />
  );
}
