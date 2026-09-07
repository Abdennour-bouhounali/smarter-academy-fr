import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlaceValueBoard from '../components/PlaceValueBoard';
import { EMPTY_BOARD, boardValue, pieceCount, isTidy } from '../components/boardUtils';
import { Feedback } from '../../../../../common/components/LessonUI';
import { formatFr, decompose } from '../components/numberUtils';

/**
 * Module 2 — l'atelier continue, et les colonnes prennent un nom.
 *
 * Activity: fabriquer 347 puis 1 205 en déplaçant des objets sur le même
 *   plateau qu'au module 1, puis défaire un groupement (une barre rendue en
 *   dix cubes) jusqu'à n'avoir plus que des cubes.
 * Mathematical objective: l'écriture chiffrée est la LISTE des colonnes, dans
 *   l'ordre — y compris les colonnes vides, qui s'écrivent 0.
 * Student action: le même geste qu'au module 1 (prendre, poser, porter à
 *   gauche, rendre en dix). Aucun stepper : la version précédente pilotait
 *   chaque colonne par des boutons `+` / `−` et l'échange par un bouton
 *   « Échanger » — les blocs ne bougeaient jamais, on incrémentait un
 *   compteur (anti-motif rejeté le 2026-09-06).
 * Mathematical state: `board` = { UM, C, D, U }, comme au module 1.
 * Expected observation (étape 2) : pour 1 205, la colonne des dizaines reste
 *   VIDE — et pourtant il faut écrire quelque chose à cette place, sinon
 *   1 205 se lit 125.
 * Controlled surprise (étape 3) : 50 s'écrit avec deux chiffres et se fabrique
 *   avec cinquante cubes. Deux plateaux très différents, un seul nombre.
 * Misconception targeted: « une colonne vide, on saute » — la cause n°1 des
 *   erreurs d'écriture des grands nombres.
 * Formalization: `position-chiffre`, puis `zero-place`, puis `groupement-dix`,
 *   chacune posée juste après le geste qui lui donne un sens.
 * Scaffolding: le plateau ne se fige jamais, même une fois l'objectif atteint.
 */

/* Le nombre fabriqué se relit comme une somme : c'est le pont entre le
   plateau et l'écriture chiffrée, et il DÉRIVE du nombre, jamais saisi. */
function Reveal({ n }) {
  const parts = decompose(n);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
    >
      <div className="font-mono text-4xl font-extrabold tabular-nums">{formatFr(n)}</div>
      <div className="text-slate-400 text-lg">=</div>
      <div className="font-mono text-lg sm:text-xl font-bold text-amber-300 tabular-nums">
        {parts.map((p) => formatFr(p)).join(' + ')}
      </div>
      <p className="text-xs text-slate-400 pt-1">
        Chaque colonne du plateau devient un morceau de l'écriture du nombre.
      </p>
    </motion.div>
  );
}

/**
 * Un atelier avec un objectif. Le plateau reste vivant après la réussite
 * (règle projet : une manipulation ne se fige jamais).
 *
 * @param {number}   target
 * @param {function} [goal]  (board) => bool — défaut : la valeur cible, rangée au plus court
 */
function AtelierCible({ target, start = EMPTY_BOARD, available, allowBreak = true, goal, onReach, note, hint }) {
  const [board, setBoard] = useState(start);
  const total = boardValue(board);
  const ok = goal ? goal(board) : total === target && isTidy(board);

  const handle = (next) => {
    setBoard(next);
    if (goal ? goal(next) : boardValue(next) === target && isTidy(next)) onReach?.(next);
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-4 py-3 flex items-baseline justify-between gap-3 flex-wrap">
        <span className="text-sm">{note}</span>
        <span className="font-mono font-black text-2xl text-amber-300 tabular-nums">{formatFr(target)}</span>
      </div>

      <PlaceValueBoard
        board={board}
        onBoard={handle}
        available={available}
        allowBreak={allowBreak}
      />

      <button
        type="button"
        onClick={() => setBoard(start)}
        className="min-h-[44px] px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        Recommencer
      </button>

      {!ok && total === target && (
        <Feedback tone="hint">
          Ton plateau vaut bien <strong className="font-mono">{formatFr(total)}</strong>, mais avec{' '}
          <strong>{pieceCount(board)}</strong> objets. {hint}
        </Feedback>
      )}
    </div>
  );
}

export default function Module02Construire() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [pred, setPred] = useState(null);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Construire les nombres"
      moduleSubtitle="Le même plateau qu'au module 1 — et cette fois, chaque colonne prend un nom."
      estimatedTime="12 min"
      brief={{
        tag: '🧱 Atelier',
        title: "Avant d'écrire un nombre, on le fabrique.",
        body: (
          <>
            <p>
              Tu retrouves les quatre sortes d'objets. Regarde bien : chaque forme est faite de dix
              formes plus petites.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                ['🟩', '1 cube', '= 1 unité'],
                ['🟦', '1 barre', '= 10 cubes'],
                ['🟪', '1 plaque', '= 10 barres'],
                ['🟧', '1 bloc', '= 10 plaques'],
              ].map(([e, t, s]) => (
                <div key={t} className="bg-white/10 rounded-xl p-2.5 text-center">
                  <div className="text-xl" aria-hidden="true">{e}</div>
                  <div className="text-xs font-bold text-white">{t}</div>
                  <div className="text-[10px] font-mono text-slate-300">{s}</div>
                </div>
              ))}
            </div>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Fabrique 347, avec le moins d’objets possible',
          subtitle: 'Plusieurs plateaux valent 347 — un seul est rangé au plus court.',
          done: s1,
          content: (kit) => (
            <>
              <AtelierCible
                target={347}
                available={['C', 'D', 'U']}
                note="Fabrique exactement"
                hint="Porte les piles de dix dans la colonne de gauche."
                onReach={() => { if (!s1) kit.react(true); setS1(true); }}
              />
              {s1 && (
                <div className="space-y-3 mt-4">
                  <Feedback tone="ok">
                    <strong>3 plaques</strong>, <strong>4 barres</strong> et <strong>7 cubes</strong> —
                    et l'écriture les reprend dans le même ordre, de la plus grosse à la plus petite.
                  </Feedback>
                  <Reveal n={347} />
                  {/* Le nombre vient d'être fabriqué : c'est ici, et pas
                      avant, que « position » veut dire quelque chose. */}
                  <KnowledgeBrick
                    id="position-chiffre"
                    variant="new"
                    lead="Tes 3 plaques, 4 barres et 7 cubes se sont rangés dans cet ordre-là, et pas dans un autre."
                  />
                </div>
              )}
            </>
          ),
        },
        {
          num: 2,
          title: 'Fabrique maintenant 1 205',
          subtitle: 'Attention : une colonne va rester vide.',
          done: s2,
          content: (kit) => (
            <>
              <AtelierCible
                target={1205}
                note="Fabrique exactement"
                hint="Porte les piles de dix dans la colonne de gauche."
                onReach={() => { if (!s2) kit.react(true); setS2(true); }}
              />
              {s2 && (
                <div className="space-y-3 mt-4">
                  <Feedback tone="ok">
                    1 bloc, 2 plaques, <strong>aucune barre</strong> et 5 cubes. La colonne des dizaines
                    est vide — mais si on ne l'écrit pas, il reste « 125 », et ce n'est plus le même nombre.
                  </Feedback>
                  <Reveal n={1205} />
                  {/* La colonne vide vient d'apparaître dans la manipulation :
                      le zéro se nomme maintenant, pas dans un explain. */}
                  <KnowledgeBrick
                    id="zero-place"
                    variant="new"
                    lead="Tu n'as posé aucune barre — et pourtant il a bien fallu écrire quelque chose à cette place."
                  />
                </div>
              )}
            </>
          ),
        },
        {
          num: 3,
          title: 'Défaire le rangement : 50 en cubes seulement',
          subtitle: 'Reprends chaque barre et rends-la en dix cubes, jusqu’au bout.',
          done: s3,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="cinquante rendu entièrement en cubes, ça fera…"
                options={[
                  { id: '5', label: '5 cubes' },
                  { id: '50', label: '50 cubes' },
                  { id: '500', label: '500 cubes' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={s3}
              />

              <AtelierCible
                target={50}
                start={{ UM: 0, C: 0, D: 5, U: 0 }}
                available={['D', 'U']}
                note="Montre ce nombre uniquement en cubes"
                hint="Rends chaque barre en dix cubes."
                goal={(b) => (b.U || 0) === 50 && (b.D || 0) === 0}
                onReach={() => { if (!s3) kit.react(true); setS3(true); }}
              />

              {s3 && (
                <>
                  <Feedback tone="ok">
                    {pred === '50' ? 'Ta prédiction tenait : ' : pred ? 'Ta prédiction annonçait autre chose : ' : ''}
                    <strong className="font-mono">50 cubes</strong> et{' '}
                    <strong className="font-mono">5 barres</strong>, c'est la même quantité — mais l'une se
                    lit d'un coup d'œil et l'autre demande de compter. C'est pour ça qu'on range par dix.
                  </Feedback>
                  {/* Le geste d'échange (10 → 1) vient d'être fait dans les
                      deux sens : c'est le moment de le nommer. */}
                  <KnowledgeBrick
                    id="groupement-dix"
                    variant="new"
                    lead="C'est cet échange que tu viens de faire, puis de défaire."
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>La suite.</strong> Tu sais fabriquer un nombre et le ranger par paquets. Au
          module suivant, tu apprends à le lire — même quand il est très long.
        </KnowledgeSnapshot>
      }
    />
  );
}
