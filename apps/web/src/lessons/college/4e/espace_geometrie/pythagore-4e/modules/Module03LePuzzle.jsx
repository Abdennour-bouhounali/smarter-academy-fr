import React, { useState } from 'react';
import { Puzzle } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PuzzleLab from '../components/PuzzleLab';
import { puzzlePreuve, arrondi, fr } from '../components/pythagore4e';

/**
 * Module 3 — MANIPULATION : le carré de l'hypoténuse APPARAÎT.
 *
 * Activity              poser quatre copies du triangle dans un cadre carré.
 * Mathematical objective (a + b)² = 4 × (ab/2) + c², donc a² + b² = c².
 *                       L'élève ne lit pas l'identité : il la fabrique, et le
 *                       carré du milieu est le trou que les pièces laissent.
 * Student action        poser chaque pièce dans un coin ; régler a et b.
 * Controlled variable   les dimensions du triangle, et l'ordre des poses.
 * Mathematical state    la liste des pièces posées ; tout le reste calculé.
 * Visual consequence    le trou se referme, puis se révèle comme un carré
 *                       incliné dont le côté est annoncé.
 * Expected observation  « le trou du milieu est un carré, et son côté n'est
 *                       ni a, ni b, ni a + b ».
 * Misconception targeted croire que le grand carré est « les deux petits mis
 *                       bout à bout ».
 * Formalization         c'est ICI que le théorème est énoncé et écrit, une
 *                       fois que l'élève a produit la figure qui le prouve.
 */
export default function Module03LePuzzle() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [posees, setPosees] = useState([]);
  const [dimsVues, setDimsVues] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const z = puzzlePreuve(a, b);
  const complet = posees.length === 4;

  const poser = (i) => {
    const suite = [...posees, i];
    setPosees(suite);
    if (suite.length === 4) setDimsVues((v) => (v.some((d) => d.a === a && d.b === b) ? v : [...v, { a, b }]));
  };
  const changerDim = (setter) => (valeur) => {
    setter(valeur);
    setPosees([]); // changer le triangle vide le cadre : les pièces ne collent plus
  };

  const done1 = complet;
  const done3 = dimsVues.length >= 2;

  const lab = (
    <PuzzleLab
      a={a} b={b}
      onA={changerDim(setA)} onB={changerDim(setB)}
      posees={posees} onPoser={poser}
      onRecommencer={() => setPosees([])}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Pose les quatre triangles',
      subtitle: 'Le cadre a pour côté a + b. Place une copie du triangle dans chaque coin.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Les quatre pièces sont des copies EXACTES de ton triangle rectangle. Regarde ce
            qu’elles laissent au milieu.
          </p>
          {lab}
          {complet && (
            <Feedback tone="ok">
              Le trou du milieu est un carré — incliné, mais un carré. Son côté vaut{' '}
              <strong>{fr(arrondi(z.cote, 2))}</strong>, c’est-à-dire exactement l’hypoténuse de
              ton triangle.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le côté du trou',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Le carré du milieu a pour côté…"
            options={[
              'l’hypoténuse du triangle',
              'la somme a + b',
              'le côté a',
              'la moitié du cadre',
            ]}
            correct={0}
            cols={2}
            requires={['hypotenuse', 'egalite-des-aires']}
            explain="Chaque côté du trou est l’hypoténuse d’une des quatre pièces : les quatre triangles se touchent par leur plus grand côté. C’est pourquoi le trou n’est pas droit — il est incliné."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Compte les aires',
      done: q3 && done3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-3.5 text-center font-mono text-sm">
            <div className="text-slate-600">
              cadre = 4 triangles + trou
            </div>
            <div className="mt-1 font-black text-sky-900">
              {(a + b) ** 2} = {arrondi(4 * (a * b) / 2, 1)} + {arrondi(z.carreIncline.aire, 1)}
            </div>
          </div>
          <NumericQuestion
            prompt={`Les quatre triangles occupent ${arrondi(4 * (a * b) / 2, 1)}. Quelle est l’aire du trou du milieu ?`}
            expected={arrondi(z.carreIncline.aire, 1)}
            requires={['egalite-des-aires']}
            explain={`Le cadre vaut ${(a + b) ** 2}, les quatre triangles ${arrondi(4 * (a * b) / 2, 1)} : il reste ${arrondi(z.carreIncline.aire, 1)} pour le trou. Et ${arrondi(z.carreIncline.aire, 1)} = ${a}² + ${b}².`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <p className="text-sm text-slate-700">
                Change maintenant les dimensions du triangle et refais le puzzle : le trou change,
                mais il reste toujours le carré de l’hypoténuse.
              </p>
              {lab}
            </>
          )}
          {done3 && q3 && (
            <Feedback tone="ok">
              Deux triangles différents, le même résultat : l’aire du trou vaut toujours
              a² + b², et c’est le carré de l’hypoténuse.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le théorème',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="theoreme-pythagore"
            variant="new"
            lead="Tu viens de le fabriquer avec quatre pièces. Voici son énoncé."
          />
          <TapQuestion
            prompt="Dans un triangle rectangle de côtés 6 et 8, que vaut le carré de l’hypoténuse ?"
            options={['100', '14', '48', '196']}
            correct={0}
            cols={4}
            requires={['theoreme-pythagore']}
            explain="6² + 8² = 36 + 64 = 100. (14 serait 6 + 8 : la relation porte sur les CARRÉS, jamais sur les longueurs.)"
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le puzzle"
      moduleSubtitle="Quatre pièces, et un carré qui apparaît"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Un cadre, quatre triangles, un trou',
        tone: 'indigo',
        body: (
          <>
            Range quatre copies de ton triangle dans un cadre carré. Ce qu’elles laissent au
            milieu <strong>n’est pas un hasard</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Puzzle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Touche un emplacement en pointillé pour y poser une pièce. Quand les quatre sont
            placées, mesure le trou.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
