import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { Feedback } from '../../../../../common/components/LessonUI';
import PlaceValueBoard, { PieceShape } from '../components/PlaceValueBoard';
import { EMPTY_BOARD, boardValue, pieceCount, isTidy } from '../components/boardUtils';
import { formatFr } from '../components/numberUtils';

/**
 * Module 1 — LABORATOIRE : « L'atelier de numération ».
 *
 * Activity: fabriquer un nombre en DÉPLAÇANT des objets — prendre un cube,
 *   une barre, une plaque, un bloc, et le poser dans sa colonne ; puis porter
 *   une pile de dix dans la colonne de gauche.
 * Mathematical objective: un grand nombre n'est pas une suite de chiffres au
 *   hasard — c'est un rangement d'objets par paquets de dix, et la colonne
 *   décide de ce que chaque objet vaut.
 * Student action: un glisser-déposer (ou prendre/poser au clavier). Aucun
 *   bouton `+` / `−` : le nombre change parce que l'objet a bougé.
 * Mathematical state: `board` = { UM, C, D, U }. Le nombre affiché, le compte
 *   d'objets, la pile échangeable et le verdict « rangé au plus court » en
 *   dérivent tous.
 * Expected observation (étape 2, l'aha du module) : la pile de dix disparaît,
 *   un seul objet la remplace à gauche — et LE NOMBRE N'A PAS BOUGÉ. Neuf
 *   objets de moins sur le plateau, exactement la même quantité.
 * Controlled surprise (étape 3) : douze objets peuvent valoir moins que trois.
 *   Un plateau de 12 cubes (12) est plus léger qu'un plateau de 1 bloc,
 *   1 plaque et 1 barre (1 110) — donc « qui a le plus d'objets » ne décide
 *   rien, et « qui a le plus de chiffres » décide tout.
 * Misconception targeted: « le chiffre vaut ce qu'il montre » et « le plus
 *   long / le plus fourni est le plus grand ». Le plateau les contredit tous
 *   les deux par le geste, pas par une phrase.
 * Formalization: seule la brique `longueur-ecriture` est posée, à l'étape 3,
 *   APRÈS que le duel des deux plateaux a été tranché. Les mots
 *   « position », « groupement par dix », « zéro qui tient une place » restent
 *   au module 2 (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: rien ne se fige après validation — on continue de poser, de
 *   retirer, de casser et de vider le plateau à toute étape.
 * Transfer: le module 2 reprend le même plateau pour construire 347 et 1 205,
 *   et le module 4 y déplace un seul chiffre de colonne en colonne.
 *
 * L'ancienne version était un rangement de six étiquettes suivi de deux QCM :
 * l'élève triait des nombres déjà écrits sans jamais toucher à ce qui les
 * rend grands. Le plateau remplace la lecture par la fabrication.
 */

const CIBLE = 234;

/* ── Étape 1 — fabriquer un nombre : le geste avant tout mot. ────────── */
function AtelierLibre({ onBuilt, built }) {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [placed, setPlaced] = useState([]);   // colonnes déjà servies
  const total = boardValue(board);

  const handle = (next, ev) => {
    setBoard(next);
    if (ev.type === 'place') {
      setPlaced((p) => (p.includes(ev.key) ? p : [...p, ev.key]));
    }
    if (!built && boardValue(next) === CIBLE) onBuilt();
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-4 py-3 flex items-baseline justify-between gap-3 flex-wrap">
        <span className="text-sm">Fabrique exactement</span>
        <span className="font-mono font-black text-2xl text-amber-300 tabular-nums">{formatFr(CIBLE)}</span>
      </div>

      <PlaceValueBoard
        board={board}
        onBoard={handle}
        available={['C', 'D', 'U']}
        allowBreak={false}
        note="Prends un objet, pose-le dans sa colonne. Tu peux en retirer autant que tu veux."
      />

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-xs text-slate-500">
          Sortes d'objets posées : <strong className="font-mono">{placed.length}</strong> / 3
        </p>
        <button
          type="button"
          onClick={() => { setBoard(EMPTY_BOARD); }}
          className="min-h-[44px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Vider le plateau
        </button>
      </div>

      {total > 0 && total !== CIBLE && (
        <Feedback tone="hint">
          Ton plateau vaut <strong className="font-mono">{formatFr(total)}</strong>.{' '}
          {total < CIBLE ? 'Il manque encore quelque chose.' : 'Tu es allé trop loin — retire un objet.'}
        </Feedback>
      )}
    </div>
  );
}

/* ── Étape 2 — l'échange : le plateau maigrit, le nombre ne bouge pas. ── */
const DEPART_ECHANGE = { UM: 0, C: 0, D: 0, U: 34 };

function AtelierEchange({ onDone, done }) {
  const [board, setBoard] = useState(DEPART_ECHANGE);
  const [trace, setTrace] = useState([]);
  const [minCount, setMinCount] = useState(pieceCount(DEPART_ECHANGE));
  const total = boardValue(board);

  const handle = (next, ev) => {
    setBoard(next);
    setMinCount((m) => Math.min(m, pieceCount(next)));
    if (ev.type === 'exchange' || ev.type === 'break') {
      setTrace((t) => [
        ...t,
        {
          kind: ev.type,
          before: pieceCount(board),
          after: pieceCount(next),
          value: boardValue(next),
          same: boardValue(next) === boardValue(board),
        },
      ]);
    }
    if (!done && isTidy(next) && boardValue(next) === 34) onDone();
  };

  return (
    <div className="space-y-3">
      <PlaceValueBoard
        board={board}
        onBoard={handle}
        available={['C', 'D', 'U']}
        note="Trente-quatre cubes. Range-les avec le moins d'objets possible."
      />

      <button
        type="button"
        onClick={() => { setBoard(DEPART_ECHANGE); setTrace([]); setMinCount(pieceCount(DEPART_ECHANGE)); }}
        className="min-h-[44px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Remettre les 34 cubes
      </button>

      {/* Le journal ne juge pas : il met côte à côte le nombre d'objets et la
          valeur, et c'est la colonne « valeur » qui ne bouge jamais. */}
      <AnimatePresence>
        {trace.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <table className="w-full text-xs font-mono border-separate border-spacing-y-1">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="text-left font-bold">geste</th>
                  <th className="text-right font-bold">objets</th>
                  <th className="text-right font-bold">valeur</th>
                </tr>
              </thead>
              <tbody>
                {trace.slice(-5).map((t, i) => (
                  <tr key={i} className="bg-white">
                    <td className="rounded-l-lg px-2 py-1.5 text-slate-600">
                      {t.kind === 'exchange' ? 'dix portés à gauche' : 'un rendu en dix'}
                    </td>
                    <td className="px-2 py-1.5 text-right text-slate-500 tabular-nums">
                      {t.before} → {t.after}
                    </td>
                    <td className={`rounded-r-lg px-2 py-1.5 text-right font-bold tabular-nums ${t.same ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatFr(t.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      <Feedback tone={total === 34 && isTidy(board) ? 'ok' : 'info'}>
        {total === 34 && isTidy(board) ? (
          <>
            <strong className="font-mono">3 barres et 4 cubes</strong> : {minCount} objets au lieu de 34,
            et toujours <strong className="font-mono">34</strong>. Le plateau a maigri de{' '}
            <strong>{34 - minCount}</strong> objets sans rien perdre.
          </>
        ) : (
          <>
            Plateau : <strong className="font-mono">{formatFr(total)}</strong> avec{' '}
            <strong>{pieceCount(board)}</strong> objets. Regarde bien la colonne « valeur » du journal.
          </>
        )}
      </Feedback>
    </div>
  );
}

/* ── Étape 3 — la surprise : douze objets valent moins que trois. ────── */
const DUEL = [
  { id: 'a', label: 'Plateau A', board: { UM: 0, C: 0, D: 0, U: 12 } },
  { id: 'b', label: 'Plateau B', board: { UM: 1, C: 1, D: 1, U: 0 } },
];

function DuelPlateaux() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {DUEL.map((d) => (
        <div key={d.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">{d.label}</div>
          <div className="flex flex-wrap items-end gap-1 min-h-[40px]">
            {['UM', 'C', 'D', 'U'].flatMap((k) =>
              Array.from({ length: d.board[k] || 0 }, (_, i) => (
                <span key={`${k}${i}`} className="inline-flex"><PieceShape k={k} size="sm" /></span>
              )),
            )}
          </div>
          <div className="text-xs font-mono text-slate-500">
            {pieceCount(d.board)} objets
          </div>
          <div className="font-mono font-black text-2xl text-slate-800 tabular-nums">
            {formatFr(boardValue(d.board))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Module01Mission() {
  const [built, setBuilt] = useState(false);
  const [pred, setPred] = useState(null);
  const [echangeDone, setEchangeDone] = useState(false);
  const [duelDone, setDuelDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Atelier : fabriquer un nombre"
      moduleSubtitle="Des cubes, des barres, des plaques. Le nombre change parce que tu déplaces un objet."
      estimatedTime="8 min"
      brief={{
        tag: '🧱 Mission 01',
        title: 'Un nombre, ça se fabrique.',
        tone: 'slate',
        body: (
          <>
            <p>
              Sur l'établi : des <strong className="text-white">cubes</strong>, des{' '}
              <strong className="text-white">barres</strong> de dix cubes, des{' '}
              <strong className="text-white">plaques</strong> de dix barres.
            </p>
            <p className="text-xs">
              Prends-en un, pose-le dans sa colonne, et regarde le nombre en bas. Rien à valider.
            </p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Fabrique ${formatFr(CIBLE)}`,
          subtitle: 'Le nombre en bas se réécrit à chaque objet posé.',
          done: built,
          content: (kit) => (
            <div className="space-y-4">
              <AtelierLibre
                built={built}
                onBuilt={() => { setBuilt(true); kit.react?.(true); }}
              />
              {built && (
                <Feedback tone="ok">
                  <strong className="font-mono">{formatFr(CIBLE)}</strong> : 2 plaques, 3 barres et 4 cubes.
                  Le même objet ne vaut pas la même chose selon la colonne où tu l'as posé — un cube vaut 1,
                  une barre en vaut dix, une plaque en vaut cent.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Trente-quatre cubes, et beaucoup trop d’objets',
          subtitle: "Quand dix cubes se sont accumulés, porte la pile dans la colonne de gauche.",
          done: echangeDone,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="quand tu porteras dix cubes dans la colonne des barres, le NOMBRE va…"
                options={[
                  { id: 'baisse', label: 'diminuer' },
                  { id: 'pareil', label: 'rester le même' },
                  { id: 'monte', label: 'augmenter' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={echangeDone}
              />
              <AtelierEchange
                done={echangeDone}
                onDone={() => { setEchangeDone(true); kit.react?.(true); }}
              />
              {echangeDone && (
                <Feedback tone="ok">
                  {pred === 'pareil'
                    ? 'Ta prédiction tenait. '
                    : pred ? 'Ta prédiction annonçait autre chose. ' : ''}
                  Dix cubes portés à gauche deviennent une barre : le plateau perd neuf objets et la
                  valeur reste <strong className="font-mono">34</strong>. C'est un échange, pas une perte —
                  et c'est ce qui permet d'écrire trente-quatre avec deux chiffres seulement.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Deux plateaux, un vainqueur',
          subtitle: "Compte d'abord les objets… puis lis les nombres.",
          done: duelDone,
          content: (
            <div className="space-y-4">
              <DuelPlateaux />
              {/* Question déclencheur : elle se répond en LISANT les deux
                  plateaux que l'élève vient de voir, sans aucun acquis de la
                  leçon — d'où `requires={[]}`. */}
              <TapQuestion
                prompt="Le plateau A porte 12 objets, le plateau B seulement 3. Lequel représente la plus grande quantité ?"
                options={['Le plateau A (12 objets)', 'Le plateau B (3 objets)', 'Ils sont égaux']}
                correct={1}
                cols={3}
                requires={[]}
                explain={
                  <>
                    Le plateau B, et de très loin : <strong className="font-mono">1 110</strong> contre{' '}
                    <strong className="font-mono">12</strong>. Le nombre d'objets ne dit rien —
                    ce qui compte, c'est la colonne dans laquelle chaque objet est posé.
                  </>
                }
                explainWrong={
                  <>
                    On est tenté de compter les objets, mais un bloc posé tout à gauche vaut mille cubes.
                    B vaut <strong className="font-mono">1 110</strong>, A vaut{' '}
                    <strong className="font-mono">12</strong>.
                  </>
                }
                onAnswered={() => setDuelDone(true)}
              />
              {duelDone && (
                <div className="space-y-3">
                  <Feedback tone="info">
                    Regarde les deux écritures : <strong className="font-mono">12</strong> a deux chiffres,{' '}
                    <strong className="font-mono">1 110</strong> en a quatre. Le plateau qui atteint les
                    colonnes de gauche est celui qui gagne — et c'est exactement ce que la longueur de
                    l'écriture raconte.
                  </Feedback>
                  {/* La brique arrive APRÈS le duel : « compter les chiffres »
                      cesse d'être une astuce et devient la lecture d'un
                      plateau que l'élève a fabriqué lui-même. */}
                  <KnowledgeBrick
                    id="longueur-ecriture"
                    variant="new"
                    lead="Ce que le plateau B vient de te montrer se dit en une règle."
                  />
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais fabriquer un nombre et échanger dix objets contre un.
          Au module suivant, tu donnes un nom à chaque colonne — et tu découvres ce qui s'écrit
          quand une colonne reste vide.
        </KnowledgeSnapshot>
      }
    />
  );
}
