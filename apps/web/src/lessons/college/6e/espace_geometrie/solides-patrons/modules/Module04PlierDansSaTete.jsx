import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PatronGrid from '../components/PatronGrid';
import FoldLab from '../components/FoldLab';
import {
  gridFromArt, foldsIntoCube, patronHint,
  PATRON_CROIX, PATRON_IMPOSSIBLE, PATRON_BANDE,
} from '../components/solidesUtils';

/**
 * Module 4 — MANIPULATION : prédire puis vérifier (P8, P9).
 *
 * Objectif : construire mentalement le pliage AVANT de le vérifier. C'est
 * la compétence visée par le programme — se représenter le solide sans
 * l'avoir sous les yeux.
 *
 * Aha : un patron impossible ne se repère pas à sa forme, mais au fait que
 * deux cases tomberaient sur la même face — laissant une autre à découvert.
 *
 * Misconception visée : croire que « 6 cases collées » suffit. La bande de
 * six et le bloc 2×3 en sont les contre-exemples classiques.
 *
 * Politique formative : la prédiction est révélée par le SIMULATEUR, pas par
 * une réponse écrite d'avance — et `onAnswered` est inconditionnel.
 *
 * Depuis la refonte des manipulations : une fois la prédiction posée, l'élève
 * ne lit plus un verdict, il REPLIE le patron de sa main (FoldLab) et voit
 * soit la boîte se fermer, soit deux cases se chevaucher. Le simulateur ne
 * dit plus « impossible » — il le MONTRE.
 */
const PATRONS = [
  {
    id: 'p1',
    grid: PATRON_CROIX,
    label: 'Patron 1',
  },
  {
    id: 'p2',
    grid: PATRON_IMPOSSIBLE,
    label: 'Patron 2',
  },
  {
    id: 'p3',
    grid: gridFromArt(['##..', '.###', '...#']),
    label: 'Patron 3',
  },
  {
    id: 'p4',
    grid: PATRON_BANDE,
    label: 'Patron 4',
  },
];

/** Une prédiction : on répond, puis le simulateur tranche sous les yeux. */
function Prediction({ patron, done, onDone }) {
  const [answered, setAnswered] = useState(false);
  // Le taux de pliage de CE patron : disponible dès que la prédiction est
  // posée, et jamais figé ensuite (règle projet du 2026-09-06).
  const [t, setT] = useState(0);
  const result = foldsIntoCube(patron.grid);
  const revele = answered || done;

  return (
    <div className="space-y-3">
      <TapQuestion
        above={
          <div className="space-y-2">
            <PatronGrid
              grid={patron.grid}
              readOnly
              showVerdict={answered || done}
              cellSize={38}
              ariaLabel={`${patron.label}, à examiner`}
            />
          </div>
        }
        prompt={`${patron.label} : en le pliant, obtiendra-t-on un cube ?`}
        options={['Oui, il se replie en cube', 'Non, il est impossible']}
        correct={result.ok ? 0 : 1}
        cols={2}
        requires={['patron-solide', 'face-solide', 'onze-patrons']}
        explain={
          result.ok
            ? 'Ce patron se replie bien : les 6 cases deviennent les 6 faces, sans superposition.'
            : patronHint(result)
        }
        explainWrong={
          result.ok
            ? 'Regarde le verdict sous la grille : le pliage fonctionne. Six cases connexes ne suffisent pas — mais ici, elles se replient bien.'
            : `${patronHint(result)} Six cases collées ne suffisent donc pas : encore faut-il qu’elles se replient sans se chevaucher.`
        }
        solved={done}
        onAnswered={() => { setAnswered(true); if (!done) onDone(); }}
      />

      {/* La vérification n'est pas une phrase : c'est le geste. L'élève
          replie lui-même et regarde ce qui se passe. */}
      {revele && (
        <div className="space-y-2">
          <p className="text-sm text-slate-600">
            Vérifie toi-même : replie {patron.label.toLowerCase()} jusqu’au bout.
          </p>
          <FoldLab
            grid={patron.grid}
            t={t}
            onTChange={setT}
            cell={30}
            ariaLabel={`${patron.label} : replie-le pour vérifier ta prédiction`}
          />
          {t >= 0.98 && (
            <Feedback tone={result.ok ? 'ok' : 'ko'}>
              {result.ok
                ? 'La boîte s’est refermée : les 6 cases sont devenues les 6 faces.'
                : `${patronHint(result)} Les cases en rouge sont celles qui n’ont plus de place.`}
            </Feedback>
          )}
        </div>
      )}
    </div>
  );
}

export default function Module04PlierDansSaTete() {
  const [done, setDone] = useState([]);
  const [ruleDone, setRuleDone] = useState(false);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Plier dans sa tête"
      moduleSubtitle="Prédis d’abord, vérifie ensuite."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 04',
        title: 'Imagine le pliage avant de le voir.',
        body: (
          <p>
            Pour chaque patron, décide s’il donnera un cube. Le verdict s’affiche <strong>après</strong> ta
            réponse — c’est ta prédiction qui compte.
          </p>
        ),
      }}
      steps={[
        ...PATRONS.map((p, i) => ({
          num: i + 1,
          title: `${p.label} — se replie-t-il ?`,
          done: done.includes(p.id),
          content: <Prediction patron={p} done={done.includes(p.id)} onDone={() => mark(p.id)} />,
        })),
        {
          num: PATRONS.length + 1,
          title: 'Comment repérer un pliage qui échoue ?',
          done: ruleDone,
          content: (
            <div className="space-y-5">
              {/* Les quatre prédictions viennent d'être vérifiées par le
                  simulateur : le critère se pose ici, avant qu'on le demande
                  — il ne vivait auparavant que dans l'`explain`. */}
              <KnowledgeBrick
                id="patron-impossible"
                variant="new"
                lead="Regarde ce qu’avaient en commun les patrons que le simulateur a refusés."
              />
              <TapQuestion
                prompt="Qu’est-ce qui rend un patron de 6 cases impossible à replier en cube ?"
                options={[
                  'Deux cases tomberaient sur la même face, en laissant une autre à découvert',
                  'Il a trop de cases',
                  'Sa forme n’est pas une croix',
                ]}
                correct={0}
                cols={1}
                requires={['patron-impossible', 'patron-solide', 'face-solide']}
                explain="Un cube a exactement 6 faces : il faut donc que les 6 cases occupent 6 faces DIFFÉRENTES. Deux cases sur la même face, et il en manque forcément une ailleurs."
                explainWrong="Le nombre de cases est bon (6), et la croix n’est qu’un patron parmi onze. Le vrai critère est la superposition au pliage."
                solved={ruleDone}
                onAnswered={() => setRuleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu sais déplier, plier, et refuser un pliage impossible. Le
          module suivant rassemble tes comptes en une fiche.
        </KnowledgeSnapshot>
      }
    />
  );
}
