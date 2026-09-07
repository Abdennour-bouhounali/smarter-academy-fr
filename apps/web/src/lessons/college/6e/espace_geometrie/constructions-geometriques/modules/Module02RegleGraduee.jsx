import React, { useState, useEffect, useRef } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VirtualRegle from '../components/VirtualRegle';

/**
 * Module 2 — MANIPULATION : la règle graduée (P1, P4).
 *
 * ACTION          l'élève fait GLISSER la règle sous un trait qui, lui, ne
 *                 bouge pas ; puis il tire les extrémités du trait.
 * TRANSFORMATION  les deux graduations lues changent en direct ; l'écart
 *                 affiché, lui, ne change pas tant que le trait est intact.
 * SENS MATH.      une longueur est une DIFFÉRENCE de graduations, pas la
 *                 graduation d'arrivée. Le trait mesure la même chose, qu'il
 *                 parte de 0 ou de 3.
 * FEEDBACK        aucun verdict pendant le geste : les trois nombres sont
 *                 affichés, l'élève lit l'invariant lui-même.
 * GÉNÉRALISATION  aligner sur 0 n'est pas une règle magique : c'est le seul
 *                 placement où la soustraction devient invisible.
 *
 * Aha : on peut déplacer la règle autant qu'on veut, l'écart ne bouge pas.
 * C'est cet invariant — et non une consigne — qui définit la longueur.
 *
 * Misconception visée : le piège du zéro. Lire « 8 » parce que l'extrémité
 * tombe sur 8, alors que le trait commençait à 1.
 *
 * ── CE QUE REMPLACE CE MODULE ─────────────────────────────────────────
 * L'ancienne version dessinait une `RulerStrip` figée (segment de 1 à 8) et
 * posait un `NumericQuestion` dessus : l'élève lisait une image et tapait un
 * nombre. Le décalage était une donnée de l'énoncé ; il est désormais une
 * grandeur que l'élève produit de sa main.
 *
 * Les briques et leurs `requires` sont inchangés : mesurer-difference se pose
 * toujours à l'étape 1, tracer-longueur à l'étape 3.
 */
export default function Module02RegleGraduee() {
  /* Le trait vit dans la SCÈNE (graduations absolues) ; la règle glisse
     sous lui. Départ volontairement décalé : le trait ne commence pas à 0,
     et c'est le premier constat de la leçon. */
  const [offset, setOffset] = useState(0);
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(8);
  /* Les décalages distincts déjà essayés : c'est le balayage qui prouve
     l'invariant, pas une seule position. */
  const [offsetsVus, setOffsetsVus] = useState([0]);
  const [pred, setPred] = useState(null);
  const [zeroDone, setZeroDone] = useState(false);
  const [mesureDone, setMesureDone] = useState(false);
  const [tracerDone, setTracerDone] = useState(false);

  const noteOffset = (o) => {
    setOffset(o);
    setOffsetsVus((v) => (v.includes(o) ? v : [...v, o]));
  };

  const longueur = to - from;
  const lireFrom = from - offset;
  const lireTo = to - offset;
  /* L'étape est acquise quand l'élève a vu le trait lu depuis au moins trois
     positions différentes de la règle : l'invariant a alors été observé, pas
     deviné. */
  const balaye = offsetsVus.length >= 3;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La règle graduée"
      moduleSubtitle="Fais glisser la règle : le trait, lui, ne bouge pas."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 02',
        title: 'La graduation 0 n’est pas au bord de la règle.',
        body: (
          <p>
            Attrape la règle et fais-la coulisser sous le trait bleu. Surveille les{' '}
            <strong>trois nombres</strong> : deux vont changer, un non.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Fais glisser la règle sous le trait',
          subtitle: 'Le trait ne bouge pas. Que devient sa mesure ?',
          done: zeroDone,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="si tu fais glisser la règle sans toucher au trait, que devient sa longueur ?"
                options={[
                  { id: 'grandit', label: 'Elle grandit' },
                  { id: 'change', label: 'Elle change' },
                  { id: 'pareil', label: 'Elle reste la même' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={zeroDone}
              />

              {/* Jamais figé : l'élève continue d'explorer après validation. */}
              <VirtualRegle
                offset={offset}
                onOffsetChange={(o) => {
                  noteOffset(o);
                  if (!zeroDone && offsetsVus.length + 1 >= 3) { kit.react?.(true); setZeroDone(true); }
                }}
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
                ariaLabel="Règle graduée à faire coulisser sous le trait bleu"
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm text-slate-600">
                Positions de règle essayées :{' '}
                <strong className="font-mono">{offsetsVus.length}</strong>
                {!balaye && ' — bouge-la encore.'}
              </div>

              {zeroDone && (
                <Feedback tone="ok">
                  {pred === 'pareil'
                    ? 'Ta prédiction tenait. '
                    : pred
                      ? 'Ta prédiction annonçait un changement, et pourtant : '
                      : ''}
                  la règle a bougé, le trait non — et l’<strong>écart</strong> est resté à{' '}
                  <strong className="font-mono">{longueur}</strong>. Les deux graduations lues
                  changent ensemble, leur différence jamais. Tire maintenant une extrémité du
                  trait : là, l’écart bouge.
                </Feedback>
              )}

              {/* La brique se pose APRÈS le constat, comme avant. */}
              {zeroDone && (
                <KnowledgeBrick
                  id="mesurer-difference"
                  variant="new"
                  lead="Tu viens de lire le même trait depuis plusieurs positions de règle : c’est l’écart qui ne bougeait pas."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Alors pourquoi aligner sur 0 ?',
          done: mesureDone,
          content: (
            <div className="space-y-4">
              <NumericQuestion
                above={
                  <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                    Un camarade pose son trait de la graduation{' '}
                    <strong className="font-mono">3</strong> à la graduation{' '}
                    <strong className="font-mono">11</strong>, puis annonce « il mesure 11 ».
                  </div>
                }
                prompt="Quelle est la vraie longueur de son trait ?"
                suffix="unités"
                expected={8}
                requires={['mesurer-difference']}
                explain="11 − 3 = 8. Il a lu la graduation d’arrivée au lieu de l’écart — exactement ce que ta règle qui glisse rendait visible."
                explainFor={(n) =>
                  n === 11
                    ? 'C’est justement son erreur : 11 est la graduation d’arrivée, pas la longueur. Le trait ne partait pas de 0.'
                    : n === 14
                      ? 'On soustrait les graduations, on ne les additionne pas : 11 − 3 = 8.'
                      : 'La longueur est la différence des deux graduations : 11 − 3 = 8.'
                }
                solved={mesureDone}
                onAnswered={() => setMesureDone(true)}
              />
              {mesureDone && (
                <Feedback tone="ok">
                  Aligner sur <strong className="font-mono">0</strong> n’est donc pas une règle
                  magique : c’est le seul placement où la soustraction devient invisible, puisque
                  l’écart vaut alors directement la graduation lue.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Tracer une longueur donnée',
          subtitle: 'L’inverse du geste précédent : produire l’écart au lieu de le lire.',
          done: tracerDone,
          content: (kit) => (
            <div className="space-y-4">
              {/* Mesurer et tracer ne sont pas le même geste : la marche à
                  suivre se pose avant qu'on demande de la reconnaître. */}
              <KnowledgeBrick
                id="tracer-longueur"
                variant="new"
                lead="Tu sais lire une longueur. En voici l’inverse : la produire."
              />

              {/* Même instrument, but inverse : l'écart est imposé, c'est
                  l'élève qui doit l'obtenir en tirant une extrémité. */}
              <TracerLab
                onDone={() => { kit.react?.(true); setTracerDone(true); }}
                done={tracerDone}
              />

              <TapQuestion
                prompt="On demande de tracer un segment [AB] de 7 cm. Quelle est la bonne marche à suivre ?"
                options={[
                  'Placer A sur le 0, marquer un point au 7, puis relier à la règle',
                  'Tracer un trait « à peu près » de 7 cm',
                  'Tracer un trait, puis le mesurer et l’ajuster',
                ]}
                correct={0}
                cols={1}
                requires={['tracer-longueur', 'mesurer-difference', 'notation-segment']}
                explain="On place d’abord les deux points aux bonnes graduations, puis on trace. Le tracé vient APRÈS la mesure — jamais l’inverse."
                explainWrong="Tracer puis ajuster fait perdre l’exactitude à chaque retouche. On repère les points d’abord, on relie ensuite."
                solved={tracerDone}
                onAnswered={() => setTracerDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> La règle sait mesurer et tracer. Mais comment transporter une
          longueur qu’on ne connaît même pas ? C’est le travail du compas.
        </KnowledgeSnapshot>
      }
    />
  );
}

/**
 * TracerLab — produire un écart imposé, règle volontairement décalée.
 *
 * L'élève doit obtenir un trait de 6 unités alors que la règle ne commence
 * pas à 0 : il ne peut donc pas se contenter de « poser sur le 6 ». C'est la
 * situation exacte que la brique `tracer-longueur` décrit, rendue jouable.
 */
const CIBLE = 6;

function TracerLab({ onDone, done }) {
  // La règle part décalée de 2 : lire « 6 » à l'arrivée donnerait 4, pas 6.
  const [offset, setOffset] = useState(2);
  const [from, setFrom] = useState(3);
  const [to, setTo] = useState(7);

  const longueur = to - from;
  const juste = longueur === CIBLE;

  // Le succès se déclare dès que l'écart demandé est atteint — dans un effet,
  // jamais pendant le rendu. La manipulation, elle, ne se fige pas.
  const doneCb = useRef(onDone);
  doneCb.current = onDone;
  useEffect(() => {
    if (juste && !done) doneCb.current();
  }, [juste, done]);

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-center text-sm text-indigo-900">
        Objectif : un trait de <strong className="font-mono">{CIBLE}</strong> unités. Attention, la
        règle est décalée.
      </div>
      <VirtualRegle
        offset={offset}
        onOffsetChange={setOffset}
        from={from}
        to={to}
        onFromChange={setFrom}
        onToChange={setTo}
        ariaLabel={`Tracer un trait de ${CIBLE} unités ; longueur actuelle ${longueur}`}
      />
      <Feedback tone={juste ? 'ok' : 'info'}>
        {juste ? (
          <>
            Trait de <strong className="font-mono">{CIBLE}</strong> obtenu — et il ne partait pas
            de 0. Tu as construit un <em>écart</em>, pas posé une extrémité sur un nombre.
          </>
        ) : (
          <>
            Écart actuel : <strong className="font-mono">{longueur}</strong>. Tire une extrémité du
            trait jusqu’à obtenir {CIBLE}.
          </>
        )}
      </Feedback>
    </div>
  );
}
