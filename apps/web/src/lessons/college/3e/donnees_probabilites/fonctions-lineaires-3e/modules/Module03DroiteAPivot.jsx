import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import AffineExplorer from '../../../../../common/components/AffineExplorer';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { image, tableOf, formatLinear } from '../components/linearUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 3 — MANIPULATION SIGNATURE : « La droite à pivot ».
 *
 * Activity: régler le coefficient et regarder la droite tourner.
 * Mathematical objective: faire VOIR que a commande l'inclinaison et que
 *   l'origine est un point fixe — « pas de terme constant » cesse d'être une
 *   phrase pour devenir une observation.
 * Student action: glisser le réglage de a, ou l'avancer pas à pas (− / +).
 * Controlled variable: a, seul paramètre de la fonction (b est verrouillé à 0
 *   par `showB={false}` : le réglage n'existe même pas à l'écran).
 * Mathematical state: { a } — la droite, l'escalier, l'expression et le
 *   tableau en dérivent tous ; rien ne peut se contredire.
 * Visual consequence: la droite pivote autour de (0 ; 0), qui ne bouge jamais ;
 *   l'escalier +1 → +a se redessine ; a négatif retourne la pente.
 * Expected observation: « le point O reste sur la droite quoi qu'il arrive ».
 * Misconception targeted: « changer a déplace la droite » (elle tourne, elle
 *   ne glisse pas) et « une droite qui descend n'est pas linéaire ».
 * Feedback: la prédiction de l'étape 2 est confrontée à la manipulation ; le
 *   compteur d'états visités quantifie ce qui reste à explorer.
 * Formalization: l'invariant est nommé à l'étape 2, par une brique, dès que
 *   les trois régimes ont été vus — pas dans le pied de module.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   « droite passant par l'origine » et la lecture de l'escalier vivaient dans
 *   des `explain` et dans le `footer`. Désormais :
 *     étape 1  prédiction — elle ne SUPPOSE rien, elle engage
 *     étape 2  les trois inclinaisons explorées → briques `droite-par-origine`
 *              et `pivot-autour-origine`
 *     étape 3  la question « pourquoi ? » devient légitime
 *     étape 4  brique `lire-a-sur-la-droite` AVANT la lecture, avec un essai
 *              sur un escalier qui avance de 1, puis la lecture piégée (run 2)
 *   Le mot « pente » a disparu des libellés de manipulation : il n'était posé
 *   nulle part, et « inclinaison » dit la même chose sans dette.
 * Scaffolding: a > 0 (TRY) → a < 0 puis |a| < 1 (EXPLORE) → lecture (CHALLENGE).
 * Transfer: le module 4 remonte du graphique au coefficient.
 */

const RANGE = { xMin: -5, xMax: 5, yMin: -6, yMax: 6 };
const READ_A = 1.5;

export default function Module03DroiteAPivot() {
  const [a, setA] = useState(1);
  const [seen, setSeen] = useState(() => new Set(['1']));
  const [predicted, setPredicted] = useState(false);
  const [originDone, setOriginDone] = useState(false);
  const [readDone, setReadDone] = useState(false);
  const [stairDone, setStairDone] = useState(false);

  // On veut que l'élève ait vu les trois régimes : pente forte, pente douce,
  // pente négative. Le `done` porte sur la mathématique explorée, pas sur le
  // fait d'avoir touché le curseur.
  const kinds = new Set();
  for (const v of seen) {
    const n = Number(v);
    if (n < 0) kinds.add('neg');
    else if (n > 0 && n < 1) kinds.add('doux');
    else if (n >= 2) kinds.add('fort');
  }
  const missing = ['fort', 'doux', 'neg'].filter((k) => !kinds.has(k));
  const done3 = missing.length === 0;

  const change = ({ a: next }, kit) => {
    setA(next);
    setSeen((prev) => {
      const s = new Set(prev);
      s.add(String(next));
      return s;
    });
    if (next !== a) kit.react(true);
  };

  const LABELS = {
    fort: 'une inclinaison forte (a ≥ 2)',
    doux: 'une inclinaison douce (0 < a < 1)',
    neg: 'un coefficient négatif (a < 0)',
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="La droite à pivot"
      moduleSubtitle="Fais tourner la droite : un point ne bouge jamais."
      estimatedTime="10 min"
      brief={{
        tag: '🎯 Mission 03',
        title: 'Fais tourner la droite',
        tone: 'indigo',
        body: (
          <p>
            Une seule commande : le coefficient. Règle-le et observe ce qui bouge —
            et surtout ce qui ne bouge pas.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis avant de toucher',
          done: predicted,
          content: (
            <TapQuestion
              prompt="Si tu augmentes le coefficient a, que va faire la droite ?"
              options={[
                'Elle va se redresser, en tournant autour de l’origine',
                'Elle va monter tout entière, sans tourner',
                'Elle va se déplacer vers la droite',
                'Elle ne changera pas',
              ]}
              correct={0}
              cols={1}
              requires={['coefficient', 'mem-zero-donne-zero', 'origine-repere']}
              explain="Elle tourne. Comme f(0) = a × 0 = 0 quel que soit a, le point (0 ; 0) appartient toujours à la droite : il sert de pivot."
              explainWrong="Tu vas pouvoir le vérifier juste en dessous — regarde bien le point O pendant que tu règles a."
              solved={predicted}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Explore les trois régimes',
          subtitle: 'Une inclinaison forte, une inclinaison douce, un coefficient négatif.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <AffineExplorer
                a={a}
                showB={false}
                onChange={(v) => change(v, kit)}
                aRange={{ min: -3, max: 3, step: 0.5 }}
                range={RANGE}
                showStaircase
                showIntercept={false}
                points={[{ id: 'O', name: 'O', x: 0, y: 0, color: '#e11d48' }]}
              />
              <Feedback tone={done3 ? 'ok' : 'info'}>
                {done3 ? (
                  <>
                    Tu as vu les trois cas. À chaque fois, la droite est passée par{' '}
                    <strong>O</strong> — le point rouge n’a jamais bougé.
                  </>
                ) : (
                  <>
                    Il te reste à essayer <strong>{missing.map((k) => LABELS[k]).join(', ')}</strong>.
                  </>
                )}
              </Feedback>
              {done3 && (
                <>
                  <KnowledgeBrick
                    id="droite-par-origine"
                    variant="new"
                    lead="Les points d’une fonction linéaire ne se dispersent pas : ils s’alignent, et toujours de la même façon."
                  />
                  <KnowledgeBrick
                    id="pivot-autour-origine"
                    variant="new"
                    lead="Et le point rouge que tu as surveillé pendant toute la manipulation explique ce qui vient de se passer."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Le point qui ne bouge jamais',
          done: originDone,
          content: (
            <TapQuestion
              prompt="Pourquoi la droite passe-t-elle par l’origine, quel que soit a ?"
              options={[
                'Parce que f(0) = a × 0 = 0 pour tout a',
                'Parce que les droites passent toutes par l’origine',
                'Parce que le repère est centré',
                'C’est un hasard qui dépend des valeurs choisies',
              ]}
              correct={0}
              cols={1}
              requires={['droite-par-origine', 'mem-zero-donne-zero', 'notation-fx']}
              explain="Multiplier 0 par n’importe quoi donne 0. Donc l’image de 0 est toujours 0, et le point (0 ; 0) est sur toutes les droites d’équation f(x) = ax."
              explainWrong="Une droite quelconque ne passe pas par l’origine : il suffit d’en tracer une au hasard. Ici, c’est le fait que RIEN ne s’ajoute après le « × a » qui l’impose."
              solved={originDone}
              onAnswered={() => setOriginDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Lis le coefficient sur la droite',
          subtitle: 'Un escalier, deux nombres : ce qu’on avance, ce qu’on monte.',
          done: stairDone && readDone,
          content: (kit) => (
            <div className="space-y-3">
              <KnowledgeBrick
                id="lire-a-sur-la-droite"
                variant="new"
                lead="Tu as vu l’escalier vert se redessiner à chaque réglage. Il sert aussi à faire l’inverse : lire a sur une droite déjà tracée."
              >
                <NumericQuestion
                  prompt="Sur une droite, un escalier avance de 1 et monte de 4. Quel est son coefficient ?"
                  expected={4}
                  parse={parseDec}
                  display="4"
                  requires={['lire-a-sur-la-droite', 'coefficient']}
                  explain="L’escalier avance de 1, donc la montée EST le coefficient : a = 4 ÷ 1 = 4."
                  explainFor={(n) => {
                    if (n === 5) return 'Tu as additionné l’avancée et la montée. Le coefficient est un quotient : 4 ÷ 1.';
                    if (n === 0.25) return 'Tu as divisé l’avancée par la montée. C’est la montée ÷ l’avancée.';
                    return null;
                  }}
                  solved={stairDone}
                  onAnswered={(ok) => { setStairDone(true); kit.react(ok); }}
                />
              </KnowledgeBrick>

              <CoordPlane
                range={RANGE}
                unit={30}
                functions={[{ id: 'f', a: READ_A, b: 0, tone: 'indigo', label: 'f' }]}
                staircase={{ from: { x: 0, y: 0 }, a: READ_A, run: 2 }}
                points={[{ id: 'O', name: 'O', x: 0, y: 0, color: '#e11d48' }]}
                ariaLabel="Repère : lire le coefficient sur l’escalier"
                caption={false}
              />
              <TapQuestion
                prompt="Et ici ? Regarde bien de combien l’escalier avance."
                options={['1,5', '2', '3', '0,5']}
                correct={0}
                cols={2}
                requires={['lire-a-sur-la-droite', 'coefficient']}
                explain="L’escalier avance de 2 et monte de 3 : a = 3 ÷ 2 = 1,5. Le coefficient est toujours la montée divisée par l’avancée."
                explainWrong="Attention : l’escalier dessiné avance de 2, pas de 1. Divise la montée par l’avancée."
                solved={readDone}
                onAnswered={(ok) => { setReadDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Tu sais aller du coefficient à la droite. Au module
          suivant, on remonte dans l’autre sens — d’une trace de la fonction jusqu’à
          <MathText>{' $a$'}</MathText>.
        </KnowledgeSnapshot>
      )}
    />
  );
}
