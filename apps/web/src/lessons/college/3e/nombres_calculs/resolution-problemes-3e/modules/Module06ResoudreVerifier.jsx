import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProblemText from '../components/ProblemText';
import SolutionStrip from '../components/SolutionStrip';
import CheckStrip from '../components/CheckStrip';
import {
  lin, equation, nextValidSteps, formatEquation, solveLinear,
} from '../components/problemUtils';
import { AGES } from '../components/problemsData';

/**
 * Module 6 — FORMALISATION : « Résoudre et vérifier ».
 *
 * Activity: choisir, à chaque tour, l'étape qui garde l'équation équivalente
 *   — puis remettre la valeur trouvée dans l'HISTOIRE, pas dans la dernière
 *   ligne du calcul.
 * Mathematical objective: établir qu'une résolution est une suite d'étapes
 *   qui conservent l'ensemble des solutions, et que vérifier c'est recalculer
 *   les quantités de l'énoncé avec la valeur trouvée pour retrouver la donnée
 *   de départ.
 * Student action: taper une des trois cartes d'étape (trois tours) ; puis
 *   taper « Remettre la valeur dans l'histoire ».
 * Controlled variable: l'équation courante — le dernier maillon de la chaîne.
 * Mathematical state: `picked`, la liste des étapes retenues ; chaque carte
 *   valable vient de `nextValidSteps(eq)` (aucune étape écrite à la main), les
 *   distracteurs sont des opérations à un seul côté ou sur un seul terme.
 * Visual consequence: la chaîne CalcChain grandit d'une ligne à chaque bon
 *   choix ; un distracteur affiche en rose l'équation qu'on obtiendrait et sa
 *   solution changée, sans entrer dans la chaîne.
 * Expected observation: après « − 13 des deux côtés » puis « ÷ 2 des deux
 *   côtés », x est isolé et vaut 11 — et « diviser 35 par 2 » aurait donné
 *   17,5, une autre équation.
 * Misconception targeted: n° 5 du catalogue — vérifier dans la dernière ligne
 *   (« 2x = 22, 2 × 11 = 22, c'est bon ») au lieu de vérifier dans l'histoire ;
 *   et les opérations à un seul côté.
 * Feedback: le refus quantifie ce qui change (la solution passe de 11 à …) ;
 *   la bande de vérification affiche les cinq quantités recalculées.
 * Formalization: étape 4, le carnet à cinq onglets — nommé APRÈS les gestes
 *   des modules 2 à 6.
 * Scaffolding: trois cartes par tour, jamais bloquantes ; après 3 refus, la
 *   suite complète est révélée et l'étape se termine quand même.
 * Transfer: le module 7 enchaîne la résolution complète ; le boss e8 rejoue
 *   la première étape de 4x + 8 = 40, e9 la vérification.
 */

/* ── La chaîne du problème « Tom et Léa » ─────────────────────────── */
// L'équation brute vient de l'histoire : (x + 5) + (x + 8) = 35.
const RAW = equation(lin(2, 13), lin(0, 35));
const SOL = solveLinear(RAW).x; // 11
const MAX_REFUS = 3;

/**
 * Trois tours. À chaque tour, la carte valable est LUE dans le modèle
 * (`nextValidSteps`) ; les deux distracteurs encodent les pièges enseignés.
 */
const ROUNDS = [
  {
    id: 'r1',
    eq: RAW,
    valid: 'sub-b',
    traps: [
      {
        id: 't1-div35',
        label: 'Diviser 35 par 2',
        eq: equation(lin(2, 13), lin(0, 17.5)),
        why: 'on ne touche qu’au membre de droite, et seulement à une partie de la gauche : l’égalité est cassée.',
      },
      {
        id: 't1-gauche',
        label: 'Retirer 13 à gauche seulement',
        eq: equation(lin(2, 0), lin(0, 35)),
        why: 'on obtiendrait 2x = 35, dont la solution est 17,5 : ce n’est plus le même problème.',
      },
    ],
  },
  {
    id: 'r2',
    eq: equation(lin(2, 0), lin(0, 22)),
    valid: 'div-a',
    traps: [
      {
        id: 't2-moins2',
        label: 'Retirer 2 des deux côtés',
        eq: equation(lin(2, -2), lin(0, 20)),
        why: 'le 2 de 2x n’est pas ajouté à x, il le multiplie : on ne peut pas le retirer, il faut partager.',
      },
      {
        id: 't2-x22',
        label: 'Écrire directement x = 22',
        eq: equation(lin(1, 0), lin(0, 22)),
        why: 'c’est effacer le 2 au lieu de partager : 2 × 22 = 44, pas 22.',
      },
    ],
  },
];

function shuffleFor(round, validCard) {
  // Ordre fixe et déterministe : la carte valable n'est pas toujours la première.
  return round.id === 'r1'
    ? [round.traps[0], validCard, round.traps[1]]
    : [round.traps[0], round.traps[1], validCard];
}

export default function Module06ResoudreVerifier() {
  const [picked, setPicked] = useState([]); // les étapes retenues
  const [rejected, setRejected] = useState(null);
  const [refus, setRefus] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [verifDone, setVerifDone] = useState(false);

  const roundIdx = picked.length;
  const round = ROUNDS[roundIdx] || null;
  const currentEq = roundIdx === 0 ? RAW : picked[picked.length - 1].eq;
  const validCard = round
    ? { ...nextValidSteps(currentEq).find((s) => s.id === round.valid), valid: true }
    : null;
  const offered = round && !revealed ? shuffleFor(round, validCard) : [];

  const stripDone = picked.length === ROUNDS.length || revealed;
  const finalEq = picked.length ? picked[picked.length - 1].eq : RAW;

  const pick = (card, react) => {
    if (card.valid) {
      setPicked((p) => [...p, { label: card.label, eq: card.eq }]);
      setRejected(null);
      react(true);
      return;
    }
    const n = refus + 1;
    setRefus(n);
    setRejected(card);
    react(false);
    if (n >= MAX_REFUS) setRevealed(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Résoudre et vérifier"
      moduleSubtitle="Choisis chaque étape valable, puis remets ta valeur dans l’histoire — pas dans la dernière ligne."
      estimatedTime="10 min"
      brief={{
        tag: '🧩 Mission 06',
        title: 'L’équation est écrite. Reste à la dérouler — sans la casser.',
        body: (
          <p>
            Tu ne vas pas inventer les étapes : tu vas les <strong>choisir</strong>. Puis tu feras le geste
            que presque tout le monde oublie — revenir à l’histoire pour vérifier que la valeur trouvée y
            colle vraiment.
          </p>
        ),
      }}
      intro={<ProblemText fragments={AGES.fragments} title="Énoncé — Tom et Léa" />}
      steps={[
        {
          num: 1,
          title: 'Déroule la résolution',
          subtitle: 'À chaque tour, une seule des trois cartes garde l’équilibre.',
          done: stripDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-700">
                Avec <MathText>{'$x$'}</MathText> = âge de Tom, l’histoire donne{' '}
                <MathText>{'$(x + 5) + (x + 8) = 35$'}</MathText>, qui se réduit en{' '}
                <MathText>{`$${formatEquation(RAW)}$`}</MathText>. À toi de l’amener jusqu’à{' '}
                <MathText>{'$x = \\ldots$'}</MathText>.
              </p>
              <SolutionStrip
                startEq={RAW}
                startLabel="L’équation du problème"
                steps={revealed && picked.length < ROUNDS.length ? completeChain(picked) : picked}
                offered={offered}
                onPick={(c) => pick(c, kit.react)}
                rejected={rejected}
                disabled={stripDone}
              />
              {!stripDone && (
                <Feedback tone="info">
                  Tour {roundIdx + 1} sur {ROUNDS.length}. Une étape est valable quand elle agit{' '}
                  <strong>des deux côtés</strong> du signe <MathText>{'$=$'}</MathText> — sinon la balance
                  penche et les solutions changent.
                  {refus > 0 && ` ${refus} carte${refus > 1 ? 's' : ''} refusée${refus > 1 ? 's' : ''} sur ${MAX_REFUS}.`}
                </Feedback>
              )}
              {revealed && picked.length < ROUNDS.length && (
                <Feedback tone="info">
                  Voici la suite complète : <MathText>{'$2x + 13 = 35$'}</MathText>, puis{' '}
                  <MathText>{'$-13$'}</MathText> des deux côtés donne <MathText>{'$2x = 22$'}</MathText>,
                  puis <MathText>{'$\\div 2$'}</MathText> des deux côtés donne{' '}
                  <MathText>{'$x = 11$'}</MathText>. Chaque ligne a exactement les mêmes solutions que la
                  précédente.
                </Feedback>
              )}
              {picked.length === ROUNDS.length && (
                <Feedback tone="ok">
                  <MathText>{`$${formatEquation(finalEq)}$`}</MathText> — x est isolé. Deux étapes, et
                  aucune n’a changé l’ensemble des solutions : 11 était déjà la solution de{' '}
                  <MathText>{'$2x + 13 = 35$'}</MathText>. Résoudre, c’est enchaîner des équations{' '}
                  <strong>équivalentes</strong> jusqu’à ce que x soit seul.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Remets la valeur dans l’histoire',
          subtitle: 'x = 11. Est-ce que l’énoncé retombe sur ses pieds ?',
          done: checked,
          content: (kit) => (
            <div className="space-y-3">
              <CheckStrip
                problem={AGES}
                choiceId="tom"
                x={SOL}
                checkId="somme5"
                target={AGES.equation.right.b}
                unit="ans"
                checked={checked}
                onCheck={() => {
                  setChecked(true);
                  kit.react(true);
                }}
              />
              {!checked && (
                <Feedback tone="info">
                  Cinq quantités attendent leur valeur. Touche le bouton : chacune se recalcule avec x = 11,
                  et la dernière ligne se confronte à la donnée de l’énoncé (35 ans).
                </Feedback>
              )}
              {checked && (
                <Feedback tone="ok">
                  Tom a <strong>11 ans</strong>, Léa <strong>14 ans</strong>. Dans 5 ans : 16 et 19, dont la
                  somme fait <strong className="font-mono">35</strong> — exactement la donnée de l’énoncé.
                  La valeur trouvée ne se contente pas de satisfaire un calcul : elle{' '}
                  <strong>raconte une histoire cohérente</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Quelle vérification prouve quelque chose ?',
          subtitle: 'Trois élèves disent avoir vérifié. Un seul a vraiment vérifié.',
          done: verifDone,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-700">
                  Chaque élève a trouvé <MathText>{'$x = 11$'}</MathText>. Sa vérification prouve-t-elle que
                  la réponse est bonne ?
                </p>
              }
              rows={[
                {
                  id: 'derniere-ligne',
                  label: (
                    <span>
                      « J’avais <MathText>{'$2x = 22$'}</MathText>, et <MathText>{'$2 \\times 11 = 22$'}</MathText> : c’est bon. »
                    </span>
                  ),
                  options: ['Ça prouve', 'Ça ne prouve rien'],
                  correct: 1,
                  correction:
                    'Cette ligne vérifie le DERNIER calcul, pas le problème. Si l’erreur était plus haut (par exemple 2x + 13 écrit au lieu de 2x + 3), elle passerait inaperçue.',
                },
                {
                  id: 'histoire',
                  label: (
                    <span>
                      « Tom 11, Léa 14 ; dans 5 ans 16 et 19 ; <MathText>{'$16 + 19 = 35$'}</MathText>, comme dans l’énoncé. »
                    </span>
                  ),
                  options: ['Ça prouve', 'Ça ne prouve rien'],
                  correct: 0,
                  correction:
                    'C’est LA vérification : on repart de l’énoncé, on recalcule ses quantités, on retombe sur sa donnée (35).',
                },
                {
                  id: 'equation-depart',
                  label: (
                    <span>
                      « Je remplace dans <MathText>{'$2x + 13 = 35$'}</MathText> : <MathText>{'$2 \\times 11 + 13 = 35$'}</MathText>. »
                    </span>
                  ),
                  options: ['Ça prouve', 'Ça ne prouve rien'],
                  correct: 0,
                  correction:
                    'Correct aussi : l’équation de DÉPART est la traduction de l’histoire, donc la substituer y revient. Ce qui ne prouve rien, c’est de substituer dans une ligne obtenue en cours de route.',
                },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {nCorrect}/{total}. La règle : on vérifie dans l’<strong>énoncé</strong> ou dans
                  l’équation de <strong>départ</strong> — jamais dans une ligne qu’on vient d’écrire. Une
                  ligne intermédiaire est vraie <em>parce qu’on l’a fabriquée</em> ; elle ne peut pas
                  témoigner contre elle-même.
                </Feedback>
              )}
              solved={verifDone}
              onAnswered={() => setVerifDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Le carnet de modélisation',
          subtitle: 'Cinq onglets. Tu viens de remplir les quatre premiers.',
          done: verifDone,
          content: () => <Carnet ticked={4} />,
        },
      ]}
      footer={
        <Feedback tone="ok">
          Vérifier, c’est remettre la valeur dans l’histoire — pas dans la dernière ligne. Onglets{' '}
          <strong>Résoudre</strong> et <strong>Vérifier</strong> du carnet : remplis. Au module 7, tu feras
          le parcours complet, de l’énoncé jusqu’à la phrase de réponse.
        </Feedback>
      }
    />
  );
}

/** Complète la chaîne quand l'élève a épuisé ses essais (révélation). */
function completeChain(picked) {
  const out = [...picked];
  let eq = out.length ? out[out.length - 1].eq : RAW;
  while (out.length < ROUNDS.length) {
    const step = nextValidSteps(eq).find((s) => s.id === ROUNDS[out.length].valid);
    if (!step) break;
    out.push({ label: step.label, eq: step.eq });
    eq = step.eq;
  }
  return out;
}

/* ── Le carnet à cinq onglets — l'objet porté par toute la leçon ──── */
const TABS = [
  {
    id: 'lire',
    emoji: '🔎',
    title: 'Lire',
    body: 'Trier les données utiles, repérer la question, noter les contraintes (entier ? positif ?).',
    module: 2,
  },
  {
    id: 'inconnue',
    emoji: '🎯',
    title: 'Inconnue',
    body: 'Nommer x une quantité dont les autres dépendent, puis les réécrire toutes avec x.',
    module: 3,
  },
  {
    id: 'equation',
    emoji: '🟰',
    title: 'Équation',
    body: 'Dire la même quantité deux fois : membre de gauche = membre de droite.',
    module: 4,
  },
  {
    id: 'resoudre',
    emoji: '🧩',
    title: 'Résoudre',
    body: 'Enchaîner des étapes qui agissent des deux côtés, jusqu’à isoler x.',
    module: 6,
  },
  {
    id: 'verifier',
    emoji: '✔️',
    title: 'Vérifier · Répondre',
    body: 'Remettre la valeur dans l’histoire, interpréter le résultat, écrire une phrase avec l’unité.',
    module: 7,
  },
];

function Carnet({ ticked = 5 }) {
  const [open, setOpen] = useState('lire');
  const current = TABS.find((t) => t.id === open) || TABS[0];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-purple-200 bg-purple-50 p-3.5 space-y-1.5 text-sm text-slate-700">
        <p>
          <strong>Le carnet de modélisation</strong> : cinq gestes, toujours les mêmes, quel que soit
          l’énoncé. Touche un onglet pour relire ce qu’il contient.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Onglets du carnet de modélisation">
        {TABS.map((t, i) => {
          const done = i < ticked;
          const active = open === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setOpen(t.id)}
              aria-pressed={active}
              aria-label={`Onglet ${t.title}${done ? ', rempli' : ', à venir'}`}
              className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 ${
                active
                  ? 'border-purple-700 bg-purple-600 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-purple-400'
              }`}
            >
              <span aria-hidden="true" className="mr-1">{t.emoji}</span>
              {t.title}
              {done && (
                <CheckCircle2
                  className={`inline w-3.5 h-3.5 ml-1 ${active ? 'text-white' : 'text-emerald-600'}`}
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 space-y-1.5" aria-live="polite">
        <p className="text-sm font-bold text-slate-800">
          <span aria-hidden="true" className="mr-1">{current.emoji}</span>
          {current.title}
        </p>
        <p className="text-sm text-slate-700 leading-relaxed">{current.body}</p>
        <p className="text-xs text-slate-400 font-mono">Module {current.module}</p>
      </div>

      <p className="text-center text-xs text-slate-500">
        {ticked} onglet{ticked > 1 ? 's' : ''} sur {TABS.length} rempli{ticked > 1 ? 's' : ''}
        {ticked < TABS.length ? ' — le dernier t’attend au module 7.' : '.'}
      </p>
    </div>
  );
}

export { Carnet, TABS };
