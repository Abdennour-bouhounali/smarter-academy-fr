import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import NumberLine from '../../../../../common/components/NumberLine';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RectangleArray from '../components/RectangleArray';
import { multiplesUpTo, divisors, divisorPairs, isDivisor, isMultiple } from '../components/divisibilityUtils';

/**
 * Module 2 — DÉCOUVERTE : « Deux lectures du même produit ».
 *
 * Activity: parcourir la droite graduée de 4 en 4 (les tables de 4 de la
 *   fête), puis regarder la carte des diviseurs de 12 déjà remplie.
 * Mathematical objective: opposer deux listes qui n'ont pas la même nature —
 *   les multiples d'un nombre forment une liste INFINIE (des sauts réguliers
 *   qui ne s'arrêtent jamais), ses diviseurs une liste FINIE, appariée.
 * Student action: taper les graduations multiples de 4, dans l'ordre.
 * Controlled variable: la graduation touchée.
 * Mathematical state: l'ensemble des multiples touchés (`hits`) et des
 *   erreurs (`misses`), sur la droite 0–40 de pas 2.
 * Visual consequence: un repère violet se pose sur chaque multiple trouvé ;
 *   la flèche de la demi-droite rappelle que ça continue au-delà de 40.
 * Expected observation: les sauts sont réguliers, et il en reste toujours
 *   après le dernier ; alors que les diviseurs de 12 tiennent en six jetons.
 * Misconception targeted: #1 (direction multiple/diviseur) et #5 (« un
 *   multiple commun, c'est la somme »), préparé ici par la régularité des
 *   sauts.
 * Feedback: une graduation qui n'est pas un multiple reste grise et le
 *   message dit pourquoi (« 14 n'est pas dans la table de 4 ») ; jamais de
 *   blocage.
 * Formalization: la phrase « multiple = on peut l'atteindre en sautant ;
 *   diviseur = il tient un nombre entier de fois dedans ».
 * Scaffolding: les 3 premiers multiples sont pré-posés en repères ; après 3
 *   erreurs, l'échappatoire pose les multiples restants.
 * Transfer: module 3, la grille où les multiples dessinent un motif.
 */

const LINE_MAX = 40;
const STEP_K = 4;
const MULTIPLES_4 = multiplesUpTo(STEP_K, LINE_MAX); // 4 … 40
const TARGET_HITS = 6;
const N_CARD = 12;
const PAIRS_12 = divisorPairs(N_CARD);

export default function Module02DeuxLectures() {
  const [hits, setHits] = useState([]);
  const [misses, setMisses] = useState([]);
  const [revealed, setRevealed] = useState(false);

  const [infiniDone, setInfiniDone] = useState(false);
  const [countDone, setCountDone] = useState(false);
  const [batchDone, setBatchDone] = useState(false);

  const done1 = hits.length >= TARGET_HITS || revealed;

  const shownHits = revealed ? MULTIPLES_4.slice(0, TARGET_HITS) : hits;
  const markers = [
    ...shownHits.map((v) => ({ value: v, label: String(v), color: '#7c3aed' })),
    ...misses.map((v) => ({ value: v, label: '✗', color: '#94a3b8' })),
  ];

  const tap = (v, react) => {
    if (done1) return;
    if (v === 0) return;
    if (isMultiple(v, STEP_K)) {
      if (hits.includes(v)) return;
      setHits([...hits, v]);
      react?.(true);
    } else {
      if (misses.includes(v)) return;
      setMisses([...misses, v]);
      react?.(false);
    }
  };

  const lastMiss = misses[misses.length - 1];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Deux lectures du même produit"
      moduleSubtitle="Les multiples ne s’arrêtent jamais. Les diviseurs, si."
      estimatedTime="9 min"
      brief={{
        tag: '📏 Mission 02',
        title: 'Des tables de 4 pour le repas — et une liste qui, elle, s’arrête.',
        body: (
          <p>
            Les tables de la fête accueillent 4 personnes chacune. Combien d’invités peut-on asseoir
            exactement ? Puis on regardera l’autre liste, celle des diviseurs — et sa longueur va te
            surprendre.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Saute de 4 en 4 sur la droite',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Touche les nombres d’invités que l’on peut asseoir <strong>exactement</strong> avec
                des tables de 4. Trouve-en {TARGET_HITS}.
              </p>
              <NumberLine
                min={0}
                max={LINE_MAX}
                step={2}
                labelEvery={2}
                mode={done1 ? 'static' : 'read'}
                onTickClick={(v) => tap(v, kit.react)}
                selectedValue={shownHits[shownHits.length - 1] ?? null}
                markers={markers}
                disabled={done1}
                height={190}
                ariaLabel="Droite graduée de 0 à 40 : touche les multiples de 4"
              />
              {!done1 && (
                <Feedback tone="info">
                  <strong>{hits.length}</strong> / {TARGET_HITS} trouvés
                  {lastMiss !== undefined && (
                    <>
                      {' '}— <strong className="font-mono">{lastMiss}</strong> n’en est pas un :{' '}
                      {lastMiss} ÷ 4 ne tombe pas juste (il reste {lastMiss % STEP_K}).
                    </>
                  )}
                </Feedback>
              )}
              {!done1 && misses.length >= 3 && (
                <button
                  type="button"
                  onClick={() => {
                    setRevealed(true);
                    kit.react(false);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold hover:border-sky-500"
                >
                  Je ne trouve pas — montre-moi les multiples de 4
                </button>
              )}
              {done1 && (
                <Feedback tone="ok">
                  Les <strong>multiples de 4</strong> sont des sauts réguliers :{' '}
                  <span className="font-mono">{MULTIPLES_4.join(' · ')}</span> … et la flèche de la
                  droite continue. Après 40 viennent 44, 48, 52 — <strong>sans jamais s’arrêter</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Alors, le plus grand ?',
          done: infiniDone,
          content: (
            <TapQuestion
              prompt="Quel est le plus GRAND multiple de 4 ?"
              options={['40', '400', '4 × 4 = 16', 'Il n’y en a pas']}
              correct={3}
              cols={2}
              solved={infiniDone}
              onAnswered={() => setInfiniDone(true)}
              explain={
                <>
                  Quel que soit le multiple que tu proposes, il suffit d’ajouter 4 pour en obtenir un
                  plus grand. La liste des multiples d’un nombre est <strong>infinie</strong> — c’est
                  pour cela qu’on ne peut pas « tous les écrire ».
                </>
              }
            />
          ),
        },
        {
          num: 3,
          title: 'L’autre liste : les diviseurs de 12',
          done: countDone,
          content: (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici les rectangles de 12, tous déjà trouvés. Compte les nombres de la carte
                d’identité.
              </p>
              <RectangleArray
                n={N_CARD}
                rows={3}
                onRowsChange={() => {}}
                stamped={PAIRS_12}
                disabled
                maxChip={6}
                ariaLabel="Les rectangles de 12, en lecture seule"
              />
              <TapQuestion
                prompt="Combien 12 a-t-il de diviseurs ?"
                options={['3', '6', '12', 'Une infinité']}
                correct={1}
                cols={2}
                solved={countDone}
                onAnswered={() => setCountDone(true)}
                explain={
                  <>
                    <span className="font-mono">{divisors(N_CARD).join(' · ')}</span> — six, pas un de
                    plus. Ils vont par paires ({PAIRS_12.map(([a, b]) => `${a} × ${b}`).join(', ')}), et
                    aucun ne dépasse 12. Une liste de diviseurs est toujours{' '}
                    <strong>finie</strong>.
                  </>
                }
              />
            </div>
          ),
        },
        {
          num: 4,
          title: 'Multiple de 12, diviseur de 12, ou ni l’un ni l’autre ?',
          done: batchDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Pour chaque nombre, dis quel est son rapport avec <strong>12</strong>.
                </p>
              }
              rows={[
                {
                  id: 'n48', label: '48', options: ['Multiple de 12', 'Diviseur de 12', 'Ni l’un ni l’autre'],
                  correct: 0, correction: '48 = 12 × 4.',
                },
                {
                  id: 'n6', label: '6', options: ['Multiple de 12', 'Diviseur de 12', 'Ni l’un ni l’autre'],
                  correct: 1, correction: '12 = 6 × 2, donc 6 divise 12.',
                },
                {
                  id: 'n100', label: '100', options: ['Multiple de 12', 'Diviseur de 12', 'Ni l’un ni l’autre'],
                  correct: 2, correction: '100 ÷ 12 laisse un reste de 4.',
                },
                {
                  id: 'n9', label: '9', options: ['Multiple de 12', 'Diviseur de 12', 'Ni l’un ni l’autre'],
                  correct: 2, correction: '9 ne divise pas 12, et 9 < 12 donc n’en est pas un multiple.',
                },
              ]}
              solved={batchDone}
              onAnswered={() => setBatchDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} correctes.{' '}
                    </>
                  )}
                  Un <strong>multiple</strong> de 12 est au moins aussi grand que 12 (48 = 12 × 4) ; un{' '}
                  <strong>diviseur</strong> de 12 est au plus égal à 12 (6, car 6 × 2 = 12). 100 et 9
                  ne sont ni l’un ni l’autre :{' '}
                  {isDivisor(9, N_CARD) ? '' : '12 ÷ 9 ne tombe pas juste'}, et 100 ÷ 12 non plus.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Une liste infinie d’un côté, une liste finie et appariée de l’autre : deux lectures du même
          produit. Au module suivant, les multiples se rangent en motifs sur une grille.
        </Feedback>
      }
    />
  );
}
