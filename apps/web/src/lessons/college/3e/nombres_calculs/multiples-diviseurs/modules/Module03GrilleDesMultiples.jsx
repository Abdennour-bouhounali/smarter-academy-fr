import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberGrid from '../components/NumberGrid';
import { multiplesUpTo, digitSum, divisibleByCriterion } from '../components/divisibilityUtils';

/**
 * Module 3 — DÉCOUVERTE : « La grille des multiples ».
 *
 * Activity: colorier les multiples de 2 puis de 3 sur la grille 1 → 50
 *   rangée par 10, et lire le MOTIF que forment les cases peintes.
 * Mathematical objective: faire émerger les critères usuels — pour 2, 5 et
 *   10 les multiples s'alignent en COLONNES (le dernier chiffre décide) ;
 *   pour 3 et 9 ils tombent en DIAGONALES (le dernier chiffre ne décide de
 *   rien, c'est la somme des chiffres).
 * Student action: taper les cases multiples, puis « continuer le motif ».
 * Controlled variable: l'ensemble `painted` des cases coloriées.
 * Mathematical state: painted ⊆ {1…50}, et le nombre de la dernière case
 *   touchée (pour la lecture de la somme des chiffres).
 * Visual consequence: les colonnes s'allument pour 2 ; pour 3, les cases
 *   descendent en escalier et la somme des chiffres s'affiche à chaque tap.
 * Expected observation: « pour 3, les derniers chiffres sont 3, 6, 9, 2, 5,
 *   8, 1, 4, 7, 0 : tous ! Ce n'est donc pas le dernier chiffre. »
 * Misconception targeted: #8 (« divisible par 3 ⇔ dernier chiffre 3, 6 ou 9 »).
 * Feedback: le nombre de cases correctes restantes est chiffré ; une case
 *   qui n'est pas un multiple ne se colorie pas et la lecture de sa somme
 *   des chiffres explique pourquoi.
 * Formalization: étape 4, un lot de 4 grands nombres où seule la règle
 *   marche — la grille ne va pas jusqu'à 4 725.
 * Scaffolding: 5 cases à la main puis un bouton « continuer le motif » qui
 *   remplit la suite (le motif est le but, pas 25 taps).
 * Transfer: le crible du module 5 réutilise la même grille.
 */

const LIMIT = 50;
const M2 = multiplesUpTo(2, LIMIT);
const M3 = multiplesUpTo(3, LIMIT);
const M5 = multiplesUpTo(5, LIMIT);
const M10 = multiplesUpTo(10, LIMIT);

export default function Module03GrilleDesMultiples() {
  /* Étape 1 — multiples de 2 */
  const [p2, setP2] = useState(() => new Set());
  const [miss2, setMiss2] = useState(null);
  const [cont2, setCont2] = useState(false);

  /* Étape 2 — colonnes de 5 et 10 */
  const [colDone, setColDone] = useState(false);

  /* Étape 3 — multiples de 3 */
  const [p3, setP3] = useState(() => new Set());
  const [last3, setLast3] = useState(null);
  const [cont3, setCont3] = useState(false);

  const [batchDone, setBatchDone] = useState(false);

  const done1 = p2.size >= 5 && cont2;
  const done3 = p3.size >= 5 && cont3;

  const toggle = (k, mult, painted, setPainted, setLast, react) => {
    setLast?.(k);
    if (k % mult === 0) {
      if (painted.has(k)) return;
      setPainted(new Set([...painted, k]));
      react?.(true);
    } else {
      setMiss2(mult === 2 ? k : null);
      react?.(false);
    }
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="La grille des multiples"
      moduleSubtitle="Colonnes ou diagonales : le motif dit quel critère utiliser."
      estimatedTime="9 min"
      brief={{
        tag: '🎟️ Mission 03',
        title: 'Les tickets de tombola sont numérotés de 1 à 50.',
        body: (
          <p>
            On veut repérer d’un coup d’œil ceux qui se partagent en paquets égaux. Colorie les
            multiples et regarde le <strong>dessin</strong> qu’ils forment sur la grille.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Colorie les multiples de 2',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Touche <strong>5 tickets</strong> divisibles par 2, puis fais continuer le motif.
              </p>
              <NumberGrid
                limit={LIMIT}
                painted={p2}
                onToggle={(k) => toggle(k, 2, p2, setP2, null, kit.react)}
                disabled={done1}
                tone="cyan"
                ariaLabel="Grille 1 à 50 : colorie les multiples de 2"
              />
              {!done1 && p2.size < 5 && (
                <Feedback tone="info">
                  <strong>{p2.size}</strong> / 5 cases coloriées.
                  {miss2 !== null && (
                    <>
                      {' '}<strong className="font-mono">{miss2}</strong> ne s’est pas colorié :{' '}
                      {miss2} ÷ 2 laisse un reste de 1.
                    </>
                  )}
                </Feedback>
              )}
              {!done1 && p2.size >= 5 && (
                <button
                  type="button"
                  onClick={() => {
                    setP2(new Set(M2));
                    setCont2(true);
                    kit.react(true);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-cyan-500 bg-cyan-600 text-white font-bold hover:bg-cyan-700"
                >
                  Continuer le motif jusqu’à 50
                </button>
              )}
              {done1 && (
                <Feedback tone="ok">
                  Cinq <strong>colonnes pleines</strong> : 2, 4, 6, 8 et 10. Tous les multiples de 2 se
                  terminent par 0, 2, 4, 6 ou 8 — le <strong>dernier chiffre</strong> suffit à décider.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Et pour 5 et 10 ?',
          done: colDone,
          content: (
            <div className="space-y-3">
              <NumberGrid
                limit={LIMIT}
                painted={new Set(M5)}
                highlight={new Set(M10)}
                tone="cyan"
                ariaLabel="Multiples de 5 coloriés, multiples de 10 entourés"
              />
              <p className="text-xs text-slate-500 text-center">
                En couleur : les multiples de 5. Entourés d’ambre : les multiples de 10.
              </p>
              <TapQuestion
                prompt="Combien de colonnes les multiples de 5 occupent-ils, et lesquelles ?"
                options={[
                  'Deux colonnes : celles des 5 et des 10',
                  'Cinq colonnes, réparties partout',
                  'Une seule colonne : celle des 10',
                  'Aucune colonne : ils sont en diagonale',
                ]}
                correct={0}
                cols={1}
                solved={colDone}
                onAnswered={() => setColDone(true)}
                explain={
                  <>
                    Les multiples de 5 se terminent par <strong>0 ou 5</strong> : deux colonnes. Les
                    multiples de 10 n’occupent que la colonne du <strong>0</strong> — c’est pour cela
                    que tout multiple de 10 est aussi multiple de 5, mais pas l’inverse.
                  </>
                }
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Maintenant les multiples de 3',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Même geste : <strong>5 cases</strong> divisibles par 3. Regarde bien la somme des
                chiffres qui s’affiche sous la grille à chaque case touchée.
              </p>
              <NumberGrid
                limit={LIMIT}
                painted={p3}
                onToggle={(k) => toggle(k, 3, p3, setP3, setLast3, kit.react)}
                lastTapped={last3}
                readout="digitSum"
                disabled={done3}
                tone="cyan"
                ariaLabel="Grille 1 à 50 : colorie les multiples de 3"
              />
              {!done3 && p3.size < 5 && (
                <Feedback tone="info">
                  <strong>{p3.size}</strong> / 5 cases coloriées.
                  {last3 !== null && last3 % 3 !== 0 && (
                    <>
                      {' '}<strong className="font-mono">{last3}</strong> ne s’est pas colorié : la
                      somme de ses chiffres vaut <strong>{digitSum(last3)}</strong>, qui n’est pas dans
                      la table de 3.
                    </>
                  )}
                </Feedback>
              )}
              {!done3 && p3.size >= 5 && (
                <button
                  type="button"
                  onClick={() => {
                    setP3(new Set(M3));
                    setCont3(true);
                    kit.react(true);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-cyan-500 bg-cyan-600 text-white font-bold hover:bg-cyan-700"
                >
                  Continuer le motif jusqu’à 50
                </button>
              )}
              {done3 && (
                <div className="space-y-2">
                  <Feedback tone="ok">
                    Aucune colonne : des <strong>diagonales</strong>. Les derniers chiffres des
                    multiples de 3 sont 3, 6, 9, 2, 5, 8, 1, 4, 7, 0 — <strong>tous</strong> ! Le
                    dernier chiffre ne dit donc rien.
                  </Feedback>
                  <div className="rounded-2xl border-2 border-cyan-200 bg-cyan-50 p-4 space-y-1.5">
                    <p className="text-xs font-mono uppercase tracking-wide text-cyan-600">
                      Les critères de divisibilité
                    </p>
                    <p className="text-sm text-cyan-900">
                      <strong>Par 2, 5, 10 :</strong> regarde le <strong>dernier chiffre</strong> (0, 2,
                      4, 6, 8 · 0 ou 5 · 0).
                    </p>
                    <p className="text-sm text-cyan-900">
                      <strong>Par 3 et 9 :</strong> additionne <strong>tous les chiffres</strong>. Si la
                      somme est dans la table de 3 (ou de 9), le nombre l’est aussi. 4 725 → 4 + 7 + 2 +
                      5 = {digitSum(4725)}, et {digitSum(4725)} est dans la table de 9.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Des nombres trop grands pour la grille',
          done: batchDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  La grille s’arrête à 50 — ces numéros de lot, non. Pour chacun, dis par quoi il est
                  divisible.
                </p>
              }
              rows={[
                {
                  id: 'n2346', label: '2 346', options: ['Par 2 et par 3', 'Par 5 seulement', 'Par 9 et par 10'],
                  correct: 0, correction: 'Finit par 6 → par 2 ; 2+3+4+6 = 15 → par 3.',
                },
                {
                  id: 'n4725', label: '4 725', options: ['Par 5 seulement', 'Par 3, 5 et 9', 'Par 2, 5 et 10'],
                  correct: 1, correction: 'Finit par 5 → par 5 ; somme 18 → par 3 ET par 9.',
                },
                {
                  id: 'n1080', label: '1 080', options: ['Par 2 et 5 seulement', 'Par 3 seulement', 'Par 2, 3, 5, 9 et 10'],
                  correct: 2, correction: 'Finit par 0 → par 2, 5, 10 ; somme 9 → par 3 et 9.',
                },
                {
                  id: 'n731', label: '731', options: ['Par 3', 'Par aucun des cinq', 'Par 9'],
                  correct: 1, correction: 'Impair, ne finit ni par 0 ni par 5, somme 11.',
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
                  Le piège de <strong className="font-mono">4 725</strong> : il se termine par 5, donc
                  beaucoup s’arrêtent à « par 5 ». Mais 4 + 7 + 2 + 5 = {digitSum(4725)}, et{' '}
                  {digitSum(4725)} est dans la table de 3 <em>et</em> de 9 — donc 4 725 est aussi
                  divisible par 3 et par 9{divisibleByCriterion(4725, 2) ? '' : ', mais pas par 2 : il est impair'}.
                </Feedback>
              )}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Un critère, ce n’est pas une astuce : c’est une façon de voir la divisibilité sans poser la
          division. Au module suivant, on repart des rectangles pour trouver TOUS les diviseurs.
        </Feedback>
      }
    />
  );
}
