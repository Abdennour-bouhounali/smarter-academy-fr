import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Ruler, Scissors } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatDec } from '../components/decimalUtils';

const RUBAN = 3.7;

/* ─── Étape 1 : les entiers ne suffisent plus ────────────────────── */
const CONSTAT = {
  q: "Le ruban est plus long que 3 m et plus court que 4 m. Quelle est sa longueur ?",
  options: [
    'Il mesure 3 m',
    'Il mesure 4 m',
    "Aucun nombre entier ne convient : sa longueur est entre 3 et 4",
    'On ne peut pas mesurer ce ruban',
  ],
  correct: 2,
  explain:
    "Ni 3 ni 4 ne conviennent : le ruban dépasse 3 m sans atteindre 4 m. Il nous manque des nombres pour décrire ce qui se passe ENTRE deux entiers. C'est exactement le rôle des nombres décimaux.",
};

/* ─── Étape 2 : découper l'intervalle ────────────────────────────── */
const DECOUPES = [
  { parts: 1, label: 'Pas de découpe' },
  { parts: 2, label: 'En 2' },
  { parts: 5, label: 'En 5' },
  { parts: 10, label: 'En 10' },
];

const NB_GRADUATIONS = {
  q: "En partageant l'intervalle de 3 à 4 en 10 parts égales, combien de NOUVELLES graduations apparaissent entre 3 et 4 ?",
  options: ['9', '10', '11', '100'],
  correct: 0,
  explain:
    "10 parts égales, cela crée 9 graduations intermédiaires entre 3 et 4 (les bornes 3 et 4 existaient déjà). Chacune vaut un dixième d'unité.",
};

/* ─── Étape 4 : un autre contexte ────────────────────────────────── */
const BOUTEILLE = {
  q: "Une bouteille contient plus d'1 L mais moins de 2 L. Laquelle de ces contenances est possible ?",
  options: ['1,5 L', '2,5 L', '0,5 L', '12 L'],
  correct: 0,
  explain:
    '1,5 L se situe bien entre 1 L et 2 L : c\'est une contenance possible. 0,5 L est inférieur à 1 L, 2,5 L et 12 L dépassent 2 L.',
};

export default function Module01Mission() {
  const navLinks = getNavLinks(1);

  const [constatPick, setConstatPick] = useState(null);
  const [constatRevealed, setConstatRevealed] = useState(false);

  const [parts, setParts] = useState(1);
  const [gradPick, setGradPick] = useState(null);
  const [gradRevealed, setGradRevealed] = useState(false);

  const [tick, setTick] = useState(null);
  const [tickChecked, setTickChecked] = useState(false);

  const [boutPick, setBoutPick] = useState(null);
  const [boutRevealed, setBoutRevealed] = useState(false);

  const s1 = constatRevealed && constatPick === CONSTAT.correct;
  const s2 = parts === 10 && gradRevealed && gradPick === NB_GRADUATIONS.correct;
  const s3 = tickChecked && tick === RUBAN;
  const s4 = boutRevealed && boutPick === BOUTEILLE.correct;
  const allDone = s1 && s2 && s3 && s4;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Mission : Entre deux nombres"
      moduleSubtitle="Quand les nombres entiers ne suffisent plus pour dire une quantité."
      moduleNumber={1}
      estimatedTime="8 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📋 Mission 01" title="Tu travailles à l'atelier de mesure du collège.">
          <p>
            On te demande de mesurer un ruban. Tu poses ton mètre… et le ruban s'arrête entre deux graduations.
          </p>
          <p className="text-white font-semibold">
            Comment exprimer précisément une quantité située entre deux nombres entiers ?
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Le problème du ruban" done={s1}>
          <div className="space-y-4">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Ruler className="w-4 h-4 text-indigo-500" aria-hidden="true" />
                Le ruban posé le long du mètre
              </div>
              {/* Le ruban dépasse visiblement 3 sans atteindre 4 */}
              <div className="relative pt-2">
                <div className="h-6 bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-r-md" style={{ width: '70%' }}>
                  <span className="sr-only">Ruban s'arrêtant entre 3 et 4 mètres</span>
                </div>
                <div className="mt-1">
                  <NumberLine
                    min={0}
                    max={5}
                    step={1}
                    labelEvery={1}
                    height={120}
                    format={(v) => formatDec(v)}
                    ariaLabel="Mètre gradué de 0 à 5, en mètres"
                  />
                </div>
              </div>
            </div>

            <p className="text-sm font-semibold text-slate-700">{CONSTAT.q}</p>
            <ChoiceGrid
              options={CONSTAT.options}
              selected={constatPick}
              onSelect={setConstatPick}
              revealed={constatRevealed}
              correctIndex={CONSTAT.correct}
              cols={1}
            />
            {!constatRevealed && (
              <ValidateButton onClick={() => setConstatRevealed(true)} disabled={constatPick === null}>
                Valider
              </ValidateButton>
            )}
            {constatRevealed && (
              <Feedback tone={constatPick === CONSTAT.correct ? 'ok' : 'ko'}>
                {CONSTAT.explain}
                {constatPick !== CONSTAT.correct && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setConstatRevealed(false);
                        setConstatPick(null);
                      }}
                      className="underline font-semibold"
                    >
                      Réessayer
                    </button>
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard
          num={2}
          title="Et si on découpait l'intervalle ?"
          subtitle="Zoome entre 3 et 4, puis partage cet intervalle en parts égales."
          done={s2}
          locked={!s1}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DECOUPES.map((d) => (
                <button
                  key={d.parts}
                  type="button"
                  onClick={() => {
                    setParts(d.parts);
                    setGradRevealed(false);
                    setGradPick(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    parts === d.parts
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-400'
                  }`}
                >
                  <Scissors className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  {d.label}
                </button>
              ))}
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
              <NumberLine
                min={3}
                max={4}
                step={1 / parts}
                labelEvery={parts === 10 ? 5 : 1}
                height={150}
                format={(v) => formatDec(v)}
                ariaLabel={`Intervalle de 3 à 4 partagé en ${parts} part(s)`}
              />
            </div>

            {parts < 10 && (
              <Feedback tone="info">
                {parts === 1
                  ? "Sans découpe, impossible de dire où s'arrête le ruban : il n'y a aucun repère entre 3 et 4."
                  : `Avec ${parts} parts, on gagne des repères… mais le ruban tombe encore entre deux graduations. Essaie un découpage plus fin.`}
              </Feedback>
            )}

            {parts === 10 && (
              <>
                <Feedback tone="ok">
                  Avec 10 parts égales, chaque graduation vaut <strong>un dixième d'unité</strong>. On peut enfin
                  nommer les positions intermédiaires !
                </Feedback>
                <p className="text-sm font-semibold text-slate-700">{NB_GRADUATIONS.q}</p>
                <ChoiceGrid
                  options={NB_GRADUATIONS.options}
                  selected={gradPick}
                  onSelect={setGradPick}
                  revealed={gradRevealed}
                  correctIndex={NB_GRADUATIONS.correct}
                  cols={4}
                />
                {!gradRevealed && (
                  <ValidateButton onClick={() => setGradRevealed(true)} disabled={gradPick === null}>
                    Valider
                  </ValidateButton>
                )}
                {gradRevealed && (
                  <Feedback tone={gradPick === NB_GRADUATIONS.correct ? 'ok' : 'ko'}>
                    {NB_GRADUATIONS.explain}
                    {gradPick !== NB_GRADUATIONS.correct && (
                      <>
                        {' '}
                        <button
                          type="button"
                          onClick={() => {
                            setGradRevealed(false);
                            setGradPick(null);
                          }}
                          className="underline font-semibold"
                        >
                          Réessayer
                        </button>
                      </>
                    )}
                  </Feedback>
                )}
              </>
            )}
          </div>
        </StepCard>

        {/* Étape 3 */}
        <StepCard
          num={3}
          title="Nomme la position du ruban"
          subtitle="Les nouvelles graduations portent enfin un nom."
          done={s3}
          locked={!s2}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9].map((v) => (
                <motion.div
                  key={v}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (v - 3.1) * 0.6 }}
                  className="rounded-lg bg-indigo-50 border border-indigo-200 py-1.5 text-center font-mono font-bold text-indigo-800 text-sm"
                >
                  {formatDec(v)}
                </motion.div>
              ))}
            </div>

            <p className="text-sm font-semibold text-slate-700">
              Le ruban s'arrête à la 7<sup>e</sup> graduation après 3. Clique dessus.
            </p>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
              <NumberLine
                min={3}
                max={4}
                step={0.1}
                labelEvery={5}
                height={160}
                mode="read"
                format={(v) => formatDec(v)}
                selectedValue={tick}
                onTickClick={(v) => {
                  if (s3) return;
                  setTick(v);
                  setTickChecked(false);
                }}
                ariaLabel="Clique sur la graduation correspondant au ruban"
              />
            </div>

            {!s3 && (
              <ValidateButton onClick={() => setTickChecked(true)} disabled={tick === null}>
                Valider ma graduation
              </ValidateButton>
            )}

            {tickChecked && (
              <Feedback tone={s3 ? 'ok' : 'ko'}>
                {s3 ? (
                  <>
                    Le ruban mesure <strong className="font-mono">3,7 m</strong> : 3 mètres entiers et 7 dixièmes
                    de mètre. Ce nombre n'est ni 3 ni 4 — c'est un <strong>nombre décimal</strong>.
                  </>
                ) : (
                  <>
                    Tu as cliqué sur <strong className="font-mono">{formatDec(tick)}</strong>. Compte à nouveau les
                    graduations depuis 3 : il en faut 7.
                  </>
                )}
              </Feedback>
            )}
          </div>
        </StepCard>

        {/* Étape 4 */}
        <StepCard num={4} title="Un autre cas concret" done={s4} locked={!s3}>
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-sky-50 border-2 border-sky-200 rounded-2xl p-4">
              <span className="text-3xl" aria-hidden="true">🧴</span>
              <p className="text-sm text-sky-900">
                Une bouteille contient <strong>plus d'1 L</strong> mais <strong>moins de 2 L</strong>.
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-700">{BOUTEILLE.q}</p>
            <ChoiceGrid
              options={BOUTEILLE.options}
              selected={boutPick}
              onSelect={setBoutPick}
              revealed={boutRevealed}
              correctIndex={BOUTEILLE.correct}
              cols={4}
            />
            {!boutRevealed && (
              <ValidateButton onClick={() => setBoutRevealed(true)} disabled={boutPick === null}>
                Valider
              </ValidateButton>
            )}
            {boutRevealed && (
              <Feedback tone={s4 ? 'ok' : 'ko'}>
                {BOUTEILLE.explain}
                {!s4 && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setBoutRevealed(false);
                        setBoutPick(null);
                      }}
                      className="underline font-semibold"
                    >
                      Réessayer
                    </button>
                  </>
                )}
              </Feedback>
            )}

            {s4 && (
              <Feedback tone="info">
                Longueurs, contenances, masses, prix, durées : partout, on a besoin de nombres situés{' '}
                <strong>entre les entiers</strong>. Dans le module suivant, tu vas découper l'unité de tes propres
                mains pour comprendre d'où viennent ces nombres.
              </Feedback>
            )}
          </div>
        </StepCard>
      </div>
    </ModuleLayout>
  );
}
