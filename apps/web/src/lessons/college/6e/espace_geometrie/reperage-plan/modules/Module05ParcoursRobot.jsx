import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RobotPath from '../components/RobotPath';
import {
  makeGrid, formatCoords, samePoint, displacement, describeDisplacement,
} from '../components/reperageUtils';

/**
 * Module 5 — MANIPULATION : se déplacer dans un quadrillage (P6).
 *
 * Objectif : relier un DÉPLACEMENT (« 4 pas à droite puis 3 vers le haut »)
 * et un COUPLE de nombres. Ce sont deux façons de dire la même chose.
 *
 * Aha : le programme le plus court a exactement autant de pas que la SOMME
 * des deux écarts — jamais leur produit.
 *
 * Misconception visée : « 2 pas et 3 pas, ça fait 6 » (multiplication), et
 * l'oubli d'une des deux composantes.
 */
const GRID = makeGrid({ cols: 7, rows: 6, step: 38 });

const RUNS = [
  {
    id: 'run1',
    start: { col: 0, row: 0 },
    flag: { col: 4, row: 3 },
    allowedSteps: ['R', 'U'],
    brief: 'Le robot part de l’origine. Deux touches seulement : → et ↑.',
  },
  {
    id: 'run2',
    start: { col: 6, row: 5 },
    flag: { col: 2, row: 2 },
    allowedSteps: ['R', 'U', 'L', 'D'],
    brief: 'Cette fois il faut redescendre et revenir vers la gauche.',
  },
];

/** Une mission robot : programme, lancement, verdict sur l'objectif réel. */
function RobotMission({ run, done, onDone, react }) {
  const [program, setProgram] = useState([]);
  const [landed, setLanded] = useState(null);

  const d = displacement(run.start, run.flag);

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">{run.brief}</p>

      <RobotPath
        grid={GRID}
        start={run.start}
        flag={run.flag}
        program={program}
        onProgramChange={(p) => {
          setProgram(p);
          setLanded(null);
        }}
        onRunComplete={(node) => {
          // Appelé depuis un effet du composant, jamais depuis un updater.
          setLanded(node);
          const ok = samePoint(node, run.flag);
          react(ok);
          if (ok) onDone();
        }}
        allowedSteps={run.allowedSteps}
      />

      {done && (
        <Feedback tone="ok">
          Le robot atteint le drapeau en <strong className="font-mono">{d.total} pas</strong> au minimum :{' '}
          {describeDisplacement(run.start, run.flag)}. C’est la <strong>somme</strong> des deux écarts —{' '}
          {d.horizontal} + {d.vertical} = {d.total}.
        </Feedback>
      )}

      {/* Le programme reste modifiable après la réussite (règle projet du
          2026-09-06) : essayer un chemin plus long, ou plus court, est la
          meilleure façon de voir que le MINIMUM ne dépend que des deux
          écarts. Le retour suit donc le dernier atterrissage réel. */}
      {landed && !samePoint(landed, run.flag) && (
        <Feedback tone={done ? 'info' : 'ko'}>
          Le robot s’est arrêté en <strong className="font-mono">{formatCoords(landed)}</strong>, pas sur le
          drapeau. Modifie ton programme et relance — le robot ne se casse pas.
        </Feedback>
      )}

      {done && landed && samePoint(landed, run.flag) && program.length > d.total && (
        <Feedback tone="info">
          Ce programme fait <strong className="font-mono">{program.length} pas</strong> et arrive
          quand même au drapeau : un détour est possible, mais{' '}
          <strong className="font-mono">{d.total}</strong> reste le minimum.
        </Feedback>
      )}
    </div>
  );
}

export default function Module05ParcoursRobot() {
  const [runsDone, setRunsDone] = useState([]);
  const [countDone, setCountDone] = useState(false);
  const mark = (id) => setRunsDone((r) => (r.includes(id) ? r : [...r, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le parcours du robot"
      moduleSubtitle="Combien de pas à droite, combien vers le haut ?"
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 05',
        title: 'Programme le robot pour qu’il atteigne le drapeau.',
        body: (
          <p>
            Empile des pas, puis lance le robot. S’il rate, il s’arrête là où ton programme le mène : tu vois
            aussitôt ce qu’il manque.
          </p>
        ),
      }}
      steps={[
        // La PREMIÈRE mission est une étape littérale : elle porte la brique du
        // module, que l'audit ne voit que dans un `steps` littéral.
        {
          num: 1,
          title: `Mission 1 — du départ ${formatCoords(RUNS[0].start)} au drapeau ${formatCoords(RUNS[0].flag)}`,
          done: runsDone.includes(RUNS[0].id),
          content: (kit) => (
            <div className="space-y-5">
              <RobotMission
                run={RUNS[0]}
                done={runsDone.includes(RUNS[0].id)}
                onDone={() => mark(RUNS[0].id)}
                react={kit.react}
              />

              {/* Le robot vient d'atteindre le drapeau : le nombre de pas qu'il
                  a fallu se compte sous les yeux de l'élève. La règle se pose
                  là, avant la question de la dernière étape. */}
              {runsDone.includes(RUNS[0].id) && (
                <KnowledgeBrick
                  id="deplacement-somme"
                  variant="new"
                  lead="Compte les pas de ton programme : ce sont les deux écarts, mis bout à bout."
                />
              )}
            </div>
          ),
        },
        ...RUNS.slice(1).map((r, i) => ({
          num: i + 2,
          title: `Mission ${i + 2} — du départ ${formatCoords(r.start)} au drapeau ${formatCoords(r.flag)}`,
          done: runsDone.includes(r.id),
          content: (kit) => (
            <RobotMission
              run={r}
              done={runsDone.includes(r.id)}
              onDone={() => mark(r.id)}
              react={kit.react}
            />
          ),
        })),
        {
          num: RUNS.length + 1,
          title: 'Combien de pas au total ?',
          done: countDone,
          content: (
            <TapQuestion
              prompt={
                <>
                  Un robot part de <span className="font-mono">(0 ; 0)</span> et doit rejoindre{' '}
                  <span className="font-mono">(2 ; 3)</span>. Combien de pas lui faut-il, au minimum ?
                </>
              }
              options={['5 pas', '6 pas', '3 pas']}
              correct={0}
              cols={3}
              requires={['deplacement-somme', 'coordonnees']}
              explain="2 pas horizontalement + 3 pas verticalement = 5 pas. On ADDITIONNE les deux écarts."
              explainWrong="Attention : 6 pas, ce serait 2 × 3 — on multiplie au lieu d’additionner. Et 3 pas, ce serait n’oublier qu’un seul des deux déplacements."
              solved={countDone}
              onAnswered={() => setCountDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Un déplacement et un couple de nombres disent la même chose. Il
          reste une confusion à lever : celle du nœud et de la case.
        </KnowledgeSnapshot>
      }
    />
  );
}
