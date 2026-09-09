import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PolygonLab from '../components/PolygonLab';
import { angleExterieur, nomPolygone } from '../components/trace';

/**
 * Module 5 — MANIPULATION : la boucle rencontre la géométrie.
 *
 * C'est le cœur mathématique de la leçon, et le seul endroit où la
 * programmation SERT le raisonnement au lieu d'être son objet (exigence du
 * brief : « la programmation doit servir le raisonnement mathématique »).
 *
 * LA DÉCOUVERTE N'EST PAS ÉNONCÉE. L'élève dispose de deux réglages
 * indépendants — n (tours de boucle) et l'angle — et d'un verdict permanent
 * « fermée / ouverte ». Pour chaque n, une seule valeur d'angle ferme la
 * figure. En cherchant pour n = 4, puis 3, puis 6, il constate lui-même que
 * n × angle vaut toujours 360. La règle est ensuite NOMMÉE, pas révélée.
 *
 * ACTION → CHANGE → OBSERVATION → SENS :
 *   ACTION       régler l'angle jusqu'à fermer la figure, pour trois valeurs de n ;
 *   CHANGE       le tracé se referme, le verdict passe au vert ;
 *   OBSERVATION  n × angle = 360° dans les trois cas, jamais autre chose ;
 *   SENS         parcourir le contour d'une figure, c'est faire UN TOUR
 *                COMPLET ; n virages égaux se partagent donc 360°.
 *
 * Expected observation : « quand j'augmente le nombre de côtés, l'angle qui
 * ferme diminue — et leur produit ne bouge pas ».
 * Misconception targeted : tourner de l'angle qu'on VOIT au sommet de la
 * figure (60° pour le triangle équilatéral). Le laboratoire rend l'erreur
 * visible : avec 60°, on obtient un hexagone, pas un triangle.
 *
 * PÉRIMÈTRE 5e : on utilise « un tour complet = 360° » et la division — pas la
 * somme des angles d'un polygone quelconque, ni la formule (n−2) × 180°, qui
 * ne sont pas au programme de 5e.
 */
export default function Module05LaFigureQuiSeReferme() {
  // Étape 1 — le carré : n fixé à 4, seul l'angle bouge.
  const [angle1, setAngle1] = useState(60);
  const ferme1 = angle1 === 90;
  const [trouve1, setTrouve1] = useState(false);

  // Étape 2 — n libre : trois fermetures à trouver.
  const [n2, setN2] = useState(3);
  const [angle2, setAngle2] = useState(90);
  const [fermes, setFermes] = useState(() => new Set());
  const vuTrois = fermes.size >= 3;

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const majAngle1 = (v) => {
    setAngle1(v);
    if (v === 90) setTrouve1(true);
  };
  const majN2 = (v) => {
    setN2(v);
    if (angle2 === angleExterieur(v)) setFermes((s) => new Set(s).add(v));
  };
  const majAngle2 = (v) => {
    setAngle2(v);
    if (v === angleExterieur(n2)) setFermes((s) => new Set(s).add(n2));
  };

  const steps = [
    {
      num: 1,
      title: 'Referme le carré',
      subtitle: 'Quatre tours de boucle. Trouve le virage qui ramène KIWI à son point de départ.',
      done: trouve1,
      content: (kit) => (
        <div className="space-y-3">
          <PolygonLab
            n={4}
            angle={angle1}
            cote={60}
            onAngle={(v) => { const avant = angle1 === 90; majAngle1(v); if (!avant && v === 90) kit.react(true); }}
            hauteur={280}
          />
          {trouve1 ? (
            <Feedback tone="ok">
              <strong>90°.</strong> Quatre virages de 90° — et le stylo revient exactement d’où il
              part. Note bien ce calcul : <strong className="font-mono">4 × 90 = 360</strong>.
              Garde-le en tête pour l’étape suivante.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais glisser l’angle. Le verdict, sous le dessin, te dit à chaque instant si la figure
              est fermée. Un seul réglage y parvient.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Referme trois figures différentes',
      subtitle: 'Cette fois, tu règles aussi le nombre de côtés. Trouve l’angle pour trois valeurs de n.',
      done: vuTrois,
      content: (kit) => (
        <div className="space-y-3">
          <PolygonLab
            n={n2}
            angle={angle2}
            cote={50}
            onN={majN2}
            onAngle={(v) => { const avant = fermes.size; majAngle2(v); if (v === angleExterieur(n2) && avant < 3) kit.react(true); }}
            hauteur={290}
          />
          <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400 mb-2">
              Tes figures fermées
            </p>
            {fermes.size === 0 ? (
              <p className="text-sm text-slate-500">
                Aucune pour l’instant. Choisis un nombre de côtés, puis cherche son angle.
              </p>
            ) : (
              <ul className="space-y-1 text-sm">
                {[...fermes].sort((a, b) => a - b).map((n) => (
                  <li key={n} className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      n = {n}
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="font-mono font-bold text-slate-700 tabular-nums">
                      angle = {angleExterieur(n)}°
                    </span>
                    <span className="text-slate-400">→</span>
                    <span className="font-mono font-bold text-indigo-700 tabular-nums">
                      {n} × {angleExterieur(n)} = {n * angleExterieur(n)}
                    </span>
                    <span className="text-xs text-slate-500">({nomPolygone(n)})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {vuTrois ? (
            <Feedback tone="ok">
              Regarde la dernière colonne de ton tableau : <strong>360 à chaque fois</strong>. Trois
              figures différentes, trois angles différents — et un seul produit.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Referme <strong>trois figures</strong> ayant des nombres de côtés différents. À chaque
              réussite, la ligne s’ajoute au tableau : c’est lui qui contient la règle.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La règle que tu viens de trouver',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans les trois cas, qu’est-ce qui restait constant ?"
            options={[
              'Le produit du nombre de côtés par l’angle : il valait toujours 360',
              'La somme du nombre de côtés et de l’angle',
              'L’angle lui-même, toujours identique',
              'La longueur totale du tracé',
            ]}
            correct={0}
            cols={1}
            requires={['repeter-n-fois']}
            explain="4 × 90 = 360, 3 × 120 = 360, 6 × 60 = 360… Le nombre de virages multiplié par leur angle donne toujours un tour complet."
            explainWrong="Relis ton tableau de l’étape 2 : l’angle change à chaque ligne (90°, 120°, 60°…), et la somme n + angle aussi. Seule la dernière colonne — le produit — reste au même nombre."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="angle-exterieur"
              variant="new"
              lead={<>Ce 360 n’est pas un hasard de réglage : c’est le tour complet que le stylo doit faire pour revenir dans sa direction de départ.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Calculer l’angle sans chercher',
      subtitle: 'Maintenant, tu peux prévoir au lieu de tâtonner.',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Quel angle faut-il pour tracer un polygone régulier à 9 côtés ?"
            expected={40}
            suffix="degrés"
            requires={['angle-exterieur', 'repeter-n-fois']}
            explain="360 ÷ 9 = 40. Le programme est donc RÉPÉTER 9 fois [ AVANCER · TOURNER de 40° ]."
            explainFor={(n) =>
              n === 9
                ? 'Tu as redonné le nombre de côtés. C’est l’angle qui est demandé : il vaut 360 ÷ 9.'
                : n === 20
                  ? 'C’est l’angle du sommet de la figure, pas celui du virage. Le stylo, lui, enjambe le coin : il tourne de 360 ÷ 9 = 40°.'
                  : n === 3240
                    ? 'Tu as multiplié au lieu de diviser : les 360° doivent être PARTAGÉS entre les 9 virages.'
                    : null
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'Le piège de l’angle qu’on voit',
      subtitle: 'Une erreur classique — que ton laboratoire sait démentir.',
      done: q5,
      content: (
        <div className="space-y-3">
          {/* Le mémo est POSÉ AVANT le lot qui l'exige : l'étape 4 vient de faire
              calculer 360 ÷ 9, la brique fige le réflexe, et les trois lignes qui
              suivent le mettent à l'épreuve sur le piège de l'angle du sommet. */}
          <KnowledgeBrick
            id="mem-360-sur-n"
            variant="new"
            compact
            lead={<>Tu viens de calculer l’angle au lieu de le chercher. De quoi ne plus jamais tâtonner devant une figure régulière.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque figure régulière, quel angle faut-il écrire dans le TOURNER de la
                boucle ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'Un triangle équilatéral (3 côtés)',
                options: ['120°', '60°'],
                correct: 0,
                correction:
                  '360 ÷ 3 = 120°. L’angle de 60° est celui qu’on lit AU SOMMET du triangle — le stylo, lui, enjambe le coin et tourne de 120°.',
              },
              {
                id: 'r2',
                label: 'Un hexagone régulier (6 côtés)',
                options: ['60°', '120°'],
                correct: 0,
                correction: '360 ÷ 6 = 60°. (120° est ici l’angle du sommet de l’hexagone.)',
              },
              {
                id: 'r3',
                label: 'Un octogone régulier (8 côtés)',
                options: ['45°', '135°'],
                correct: 0,
                correction: '360 ÷ 8 = 45°. (135° est l’angle du sommet de l’octogone.)',
              },
            ]}
            requires={['angle-exterieur', 'mem-360-sur-n']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Trois fois, tu as choisi l’angle du <strong>virage</strong> et non celui du{' '}
                  <strong>sommet</strong>. C’est exactement la confusion qui fait rater ces
                  figures : le stylo ne suit pas le coin, il l’enjambe.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Le réflexe sûr : calcule <strong>360 ÷ n</strong> et ne
                  regarde pas la figure. Pour vérifier, multiplie ta réponse par n — tu dois
                  retrouver 360.
                </Feedback>
              )
            }
            solved={q5}
            onAnswered={() => setQ5(true)}
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
      moduleTitle="La figure qui se referme"
      moduleSubtitle="Deux réglages, et une seule combinaison qui ferme le tracé"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Pourquoi tes figures restent ouvertes',
        tone: 'indigo',
        body: (
          <p>
            Ta boucle sait répéter autant de fois que tu veux. Pourtant, presque toutes tes figures
            restent ouvertes. Il existe, pour chaque nombre de côtés, <strong>un seul</strong> angle
            qui referme le tracé — et tu vas trouver la règle qui le donne, sans avoir à la chercher
            deux fois.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
