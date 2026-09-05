import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RectangleArray from '../components/RectangleArray';
import { layoutRows, normalizePair, hasPair } from '../components/divisibilityUtils';

/**
 * Module 1 — DÉCLENCHEUR : « Les 36 chaises ».
 *
 * Activity: ranger 36 chaises en rangées égales pour la fête du collège, en
 *   commençant par une prédiction sur 5 rangées.
 * Mathematical objective: faire NAÎTRE le besoin des mots « multiple » et
 *   « diviseur » à partir d'un reste qui gêne — 5 ne divise pas 36 parce
 *   qu'une chaise reste seule ; 4 divise 36 parce que rien ne dépasse.
 * Student action: prédire, puis régler le nombre de rangées et garder les
 *   paires qui tombent juste.
 * Controlled variable: le nombre de rangées r.
 * Mathematical state: (36, r) → layoutRows ; les paires gardées.
 * Visual consequence: la 36ᵉ chaise pend seule dans le bac rouge sous le
 *   rectangle 5 × 7 ; en 6 rangées, le bac est vide.
 * Expected observation: certains nombres de rangées « marchent », d'autres
 *   non — et ceux qui marchent donnent une écriture 36 = r × q.
 * Misconception targeted: #2 (« un diviseur, c'est quand ça se divise même
 *   avec un reste ») et #1 (confusion de direction multiple/diviseur).
 * Feedback: le bac « reste » est la conséquence ; la correction du lot
 *   montre les deux phrases côte à côte avec le même rectangle.
 * Formalization: étape 4 — les mots « multiple » et « diviseur » sont posés
 *   sur le rectangle déjà construit, jamais avant.
 * Scaffolding: SHOW (prédiction), TRY (36 avec deux paires suffisent),
 *   puis 37, qui ne donne QUE le bâton.
 * Transfer: module 2, la liste infinie des multiples face à la liste finie
 *   des diviseurs.
 */

const N = 36;
const STICK = 37;
const L5 = layoutRows(N, 5);

export default function Module01ChaisesDeLaFete() {
  const [predicted, setPredicted] = useState(false);

  const [rows, setRows] = useState(5);
  const [stamped, setStamped] = useState([]);

  const [rows37, setRows37] = useState(2);
  const [tried37, setTried37] = useState(() => new Set([2]));
  const [revealed37, setRevealed37] = useState(false);

  const [batchDone, setBatchDone] = useState(false);

  const done2 = stamped.length >= 2;
  const done3 = tried37.size >= 4 || revealed37;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Les 36 chaises"
      moduleSubtitle="36 chaises à ranger en rangées égales. Une chaise seule change tout."
      estimatedTime="8 min"
      brief={{
        tag: '🪑 Mission 01',
        title: 'La fête du collège commence par un problème de chaises.',
        body: (
          <p>
            36 chaises, à ranger en rangées <strong>toutes égales</strong> devant la scène. Toutes les
            dispositions ne marchent pas. Trouve celles qui marchent — et regarde ce qui coince pour
            les autres.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Prédis avant de ranger',
          done: predicted,
          content: (
            <TapQuestion
              prompt="36 chaises en 5 rangées égales : est-ce que ça tombe juste ?"
              options={['Oui, ça tombe juste', 'Non, il restera des chaises', 'Impossible à savoir sans essayer']}
              correct={1}
              cols={1}
              solved={predicted}
              onAnswered={() => setPredicted(true)}
              explain={
                <>
                  5 × {L5.perRow} = {5 * L5.perRow}, et il faut 36 : il reste{' '}
                  <strong>{L5.remainder} chaise</strong>. On va la voir à l’étape suivante.
                </>
              }
            />
          ),
        },
        {
          num: 2,
          title: 'Range les chaises et garde deux dispositions qui marchent',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Change le nombre de rangées et regarde le bac rouge. Garde <strong>deux</strong>{' '}
                dispositions où il ne reste aucune chaise.
              </p>
              <RectangleArray
                n={N}
                rows={rows}
                onRowsChange={setRows}
                stamped={stamped}
                onStamp={(p) => {
                  if (hasPair(stamped, p)) return;
                  setStamped([...stamped, normalizePair(p)].sort((a, b) => a[0] - b[0]));
                  kit.react(true);
                }}
                ariaLabel="Les 36 chaises de la fête"
              />
              {!done2 && (
                <Feedback tone="info">
                  {stamped.length === 0
                    ? 'Aucune disposition gardée. Essaie 5 rangées, puis 6 : compare les deux bacs rouges.'
                    : `Une disposition gardée sur deux. Trouve-en encore ${2 - stamped.length}.`}
                </Feedback>
              )}
              {done2 && (
                <Feedback tone="ok">
                  Quand le bac « reste » est vide, on peut écrire 36 comme un produit :{' '}
                  <strong className="font-mono">
                    {stamped.map(([a, b]) => `${a} × ${b}`).join(' et ')}
                  </strong>
                  . Quand il ne l’est pas — 5 rangées — aucune écriture de ce genre n’existe.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Et avec 37 chaises ?',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Une chaise de plus est arrivée : 37. Essaie <strong>au moins 4</strong> dispositions
                en <strong>plusieurs rangées</strong> et regarde le bac rouge à chaque fois.
              </p>
              <RectangleArray
                n={STICK}
                rows={rows37}
                onRowsChange={(r) => {
                  setRows37(r);
                  setTried37((t) => new Set([...t, r]));
                }}
                stamped={[]}
                showCard={false}
                disabled={revealed37}
                ariaLabel="Les 37 chaises"
              />
              {!done3 && (
                <Feedback tone="info">
                  {tried37.size} disposition{tried37.size > 1 ? 's' : ''} essayée
                  {tried37.size > 1 ? 's' : ''} sur 4. Dès qu’il y a plus d’une rangée, il reste
                  toujours quelque chose dans le bac — tu l’as remarqué ?
                </Feedback>
              )}
              {!done3 && tried37.size >= 3 && (
                <button
                  type="button"
                  onClick={() => {
                    setRevealed37(true);
                    kit.react(false);
                  }}
                  className="w-full min-h-[48px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold hover:border-sky-500"
                >
                  Je ne trouve pas — montre-moi
                </button>
              )}
              {done3 && (
                <Feedback tone="ok">
                  Aucune disposition ne marche, sauf une seule rangée de 37 — le <strong>bâton</strong>.
                  37 est un nombre qui refuse tous les rectangles. On lui donnera un nom au module 4.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Les deux mots, posés sur ton rectangle',
          done: batchDone,
          content: (
            <div className="space-y-3">
              <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-1.5">
                <p className="text-xs font-mono uppercase tracking-wide text-indigo-600">
                  Le rectangle 4 × 9 se lit deux fois
                </p>
                <p className="text-sm text-indigo-900">
                  36 = 4 × 9. On dit que <strong>36 est un multiple de 4</strong> (36 chaises rangées
                  en paquets de 4, sans reste) et que <strong>4 est un diviseur de 36</strong> (4
                  rangées, sans reste).
                </p>
                <p className="text-sm text-indigo-900">
                  Le <strong>multiple</strong>, c’est le grand nombre — le nombre de carreaux. Le{' '}
                  <strong>diviseur</strong>, c’est le petit — le nombre de rangées.
                </p>
              </div>

              <BatchChoiceQuestion
                intro={
                  <p className="text-sm text-slate-600">
                    Avec 36 = 4 × 9 sous les yeux : vrai ou faux ?
                  </p>
                }
                rows={[
                  { id: 'r1', label: '36 est un multiple de 4', options: ['Vrai', 'Faux'], correct: 0, correction: '36 = 4 × 9 : oui.' },
                  { id: 'r2', label: '4 est un diviseur de 36', options: ['Vrai', 'Faux'], correct: 0, correction: '4 rangées, reste 0 : oui.' },
                  { id: 'r3', label: '4 est un multiple de 36', options: ['Vrai', 'Faux'], correct: 1, correction: 'On ne peut pas faire 4 avec des paquets de 36.' },
                ]}
                solved={batchDone}
                onAnswered={() => setBatchDone(true)}
                feedback={({ allRight }) => (
                  <Feedback tone={allRight ? 'ok' : 'ko'}>
                    Les deux premières phrases décrivent <strong>le même rectangle</strong>, lu dans
                    les deux sens. La troisième inverse les rôles : 4 est trop petit pour être un
                    multiple de 36 — un multiple de 36 vaut au moins 36.
                  </Feedback>
                )}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Retiens le geste : <strong>reste 0 = diviseur</strong>. Au module suivant, on compare deux
          listes qui n’ont pas du tout la même longueur.
        </Feedback>
      }
    />
  );
}
