import React, { useState } from 'react';
import { motion } from 'framer-motion';
import NumberLine from '../../../../../common/components/NumberLine';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ChoiceGrid, ValidateButton, StepCard, MissionBrief } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { fracLineFormat } from '../components/fractionUtils';

/* ─── Placer une fraction (drag) ──────────────────────────────────── */
function PlacerFraction({ den, target, min = 0, max = 1, solved, onSolved, explain, markers = [] }) {
  const [pos, setPos] = useState(min);
  const [checked, setChecked] = useState(false);
  const step = 1 / den;
  const isRight = Math.round(pos * den) === Math.round(target * den);

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={min}
          max={max}
          step={step}
          labelEvery={1}
          height={190}
          mode="place"
          value={pos}
          onChange={(v) => {
            if (solved) return;
            setPos(v);
            setChecked(false);
          }}
          snap={step}
          format={fracLineFormat(den)}
          revealValue={solved || checked}
          disabled={solved}
          ghost={solved || (checked && !isRight) ? { value: target, label: fracLineFormat(den)(target) } : null}
          ariaLabel={`Place ${fracLineFormat(den)(target)} entre ${min} et ${max}`}
          edgesOnly
          markers={markers}
        />
      </div>
      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (isRight) onSolved?.();
            }}
          >
            Valider ma position
          </ValidateButton>
        </div>
      )}
      {checked && !isRight && <Feedback tone="ko">{explain}</Feedback>}
      {solved && <Feedback tone="ok">{explain}</Feedback>}
    </div>
  );
}

/* ─── Lire une position (clic) ────────────────────────────────────── */
function LirePosition({ den, target, solved, onSolved }) {
  const [tick, setTick] = useState(null);
  const [checked, setChecked] = useState(false);
  const isRight = tick !== null && Math.round(tick * den) === Math.round(target * den);

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={0}
          max={1}
          step={1 / den}
          labelEvery={1}
          height={170}
          mode="read"
          format={fracLineFormat(den)}
          selectedValue={tick}
          onTickClick={(v) => {
            if (solved) return;
            setTick(v);
            setChecked(false);
          }}
          ariaLabel={`Clique la graduation ${fracLineFormat(den)(target)}`}
          edgesOnly
        />
      </div>
      <p className="text-sm text-center font-semibold text-slate-700">
        Clique la graduation qui correspond à <MathText>{`$\\frac{${Math.round(target * den)}}{${den}}$`}</MathText>.
      </p>
      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              if (isRight) onSolved?.();
            }}
            disabled={tick === null}
          >
            Valider
          </ValidateButton>
        </div>
      )}
      {checked && !isRight && <Feedback tone="hint">Compte les graduations depuis 0, une par une.</Feedback>}
      {solved && (
        <Feedback tone="ok">
          <MathText>{`$\\frac{${Math.round(target * den)}}{${den}}$`}</MathText> est bien à la position trouvée.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Misconception : 3/4 > 1 ? ──────────────────────────────────── */
const PIEGE_Q = {
  q: '« 3/4 est plus grand que 1, car 3 est presque 4. » Vrai ou faux ?',
  options: [
    "Vrai : 3 est presque 4, donc la fraction est presque un entier de plus",
    'Faux : 3/4 se trouve AVANT 1 sur la droite — regarder les chiffres 3 et 4 séparément ne dit rien',
  ],
  correct: 1,
  explain:
    "3/4 est inférieur à 1 : il en manque un quart pour atteindre 1 entier. Sur la droite, 3/4 est nettement à gauche de 1. Comparer 3 et 4 comme deux nombres isolés ne renseigne pas sur la position de la fraction.",
};

export default function Module08Droite() {
  const navLinks = getNavLinks(8);
  const [halfDone, setHalfDone] = useState(false);
  const [thirdsDone, setThirdsDone] = useState([]);
  const [quartDone, setQuartDone] = useState(false);
  const [wholeSeen, setWholeSeen] = useState(false);
  const [improperDone, setImproperDone] = useState(false);
  const [piegePick, setPiegePick] = useState(null);
  const [piegeRevealed, setPiegeRevealed] = useState(false);

  const s1 = halfDone && thirdsDone.length === 2;
  const s2 = quartDone && wholeSeen;
  const s3 = improperDone;
  const s4 = piegeRevealed && piegePick === PIEGE_Q.correct;
  const allDone = s1 && s2 && s3 && s4;

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="Sur la demi-droite graduée"
      moduleSubtitle="Une fraction est un NOMBRE : elle a une place précise entre 0 et 1."
      moduleNumber={8}
      estimatedTime="10 min"
      prevLink={navLinks.prevLink}
      nextLink={allDone ? navLinks.nextLink : undefined}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <MissionBrief tag="📏 Nombre" title="3/4 n'est pas qu'un partage : c'est aussi une position.">
          <p>
            Chaque fraction a sa place exacte sur la droite graduée, entre les nombres entiers que tu connais
            déjà.
          </p>
        </MissionBrief>

        {/* Étape 1 */}
        <StepCard num={1} title="Place des demis, puis des tiers" done={s1}>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Place <MathText>{'$\\frac{1}{2}$'}</MathText> (partage en 2).
              </p>
              <PlacerFraction den={2} target={0.5} solved={halfDone} onSolved={() => setHalfDone(true)} explain="1/2 est exactement au milieu entre 0 et 1." />
            </div>

            {halfDone && (
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <p className="text-sm font-semibold text-slate-700">
                  Maintenant, place <MathText>{'$\\frac{1}{3}$'}</MathText> puis{' '}
                  <MathText>{'$\\frac{2}{3}$'}</MathText> (partage en 3).
                </p>
                {[1 / 3, 2 / 3].map((t, i) =>
                  i === 0 || thirdsDone.includes(i - 1) ? (
                    <PlacerFraction
                      key={t}
                      den={3}
                      target={t}
                      solved={thirdsDone.includes(i)}
                      onSolved={() => setThirdsDone((d) => (d.includes(i) ? d : [...d, i]))}
                      explain={`${i === 0 ? '1/3' : '2/3'} se trouve à ${i === 0 ? '1' : '2'} graduation${i === 0 ? '' : 's'} de 0, sur un partage en 3.`}
                    />
                  ) : null
                )}
              </div>
            )}
          </div>
        </StepCard>

        {/* Étape 2 */}
        <StepCard num={2} title="Les quarts, et une découverte : 4/4 = 1" done={s2} locked={!s1}>
          <div className="space-y-4">
            <LirePosition den={4} target={0.75} solved={quartDone} onSolved={() => setQuartDone(true)} />

            {quartDone && !wholeSeen && (
              <div className="text-center">
                <ValidateButton onClick={() => setWholeSeen(true)} tone="indigo">
                  Que vaut la 4ᵉ graduation ?
                </ValidateButton>
              </div>
            )}

            {wholeSeen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                  <NumberLine
                    min={0}
                    max={1}
                    step={0.25}
                    labelEvery={1}
                    height={150}
                    format={fracLineFormat(4)}
                    markers={[{ value: 1, label: '4/4 = 1', color: '#7c3aed' }]}
                    ariaLabel="4 quarts atteignent exactement 1"
                  />
                </div>
                <Feedback tone="info">
                  <MathText>{'$\\frac{4}{4}$'}</MathText> tombe exactement sur 1 : quand on a pris TOUTES les
                  parts, on a repris l'unité entière. C'est pour cela que <MathText>{'$\\frac{4}{4} = 1$'}</MathText>.
                </Feedback>
              </motion.div>
            )}
          </div>
        </StepCard>

        {/* Étape 3 */}
        <StepCard num={3} title="Peut-on dépasser 1 ?" done={s3} locked={!s2}>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Si <MathText>{'$\\frac{4}{4}$'}</MathText> vaut 1, que devient <MathText>{'$\\frac{5}{4}$'}</MathText> ?
              Place-la sur cette droite qui va jusqu'à 2.
            </p>
            <PlacerFraction
              den={4}
              target={1.25}
              min={0}
              max={2}
              solved={improperDone}
              onSolved={() => setImproperDone(true)}
              explain="5/4, c'est 4/4 (= 1 unité entière) plus 1/4 en plus : 5/4 = 1 + 1/4."
              markers={[{ value: 1, label: '1', color: '#059669' }]}
            />
            {improperDone && (
              <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1">
                <div className="text-2xl font-mono font-extrabold text-amber-300">
                  <MathText>{'$\\frac{5}{4} = 1 + \\frac{1}{4}$'}</MathText>
                </div>
                <p className="text-xs text-slate-400 pt-1">
                  Une fraction n'est pas obligée d'être inférieure à 1 : c'est simplement un nombre, situé où le
                  partage l'amène.
                </p>
              </div>
            )}
          </div>
        </StepCard>

        {/* Étape 4 */}
        <StepCard num={4} title="Piège : 3/4 dépasse-t-il 1 ?" done={s4} locked={!s3}>
          <div className="space-y-4">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
              <NumberLine
                min={0}
                max={1.25}
                step={0.25}
                labelEvery={1}
                height={150}
                format={fracLineFormat(4)}
                markers={[
                  { value: 0.75, label: '3/4', color: '#dc2626' },
                  { value: 1, label: '1', color: '#059669' },
                ]}
                ariaLabel="3/4 et 1 sur la même droite"
              />
            </div>
            <p className="text-sm font-semibold text-slate-700">{PIEGE_Q.q}</p>
            <ChoiceGrid options={PIEGE_Q.options} selected={piegePick} onSelect={setPiegePick} revealed={piegeRevealed} correctIndex={PIEGE_Q.correct} cols={1} />
            {!piegeRevealed && (
              <div className="text-center">
                <ValidateButton
                  onClick={() => {
                    setPiegeRevealed(true);
                    if (piegePick === PIEGE_Q.correct) {
                      /* déjà pris en compte dans s4 */
                    }
                  }}
                  disabled={piegePick === null}
                >
                  Valider
                </ValidateButton>
              </div>
            )}
            {piegeRevealed && (
              <Feedback tone={piegePick === PIEGE_Q.correct ? 'ok' : 'ko'}>
                {PIEGE_Q.explain}
                {piegePick !== PIEGE_Q.correct && (
                  <>
                    {' '}
                    <button
                      type="button"
                      onClick={() => {
                        setPiegeRevealed(false);
                        setPiegePick(null);
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
      </div>
    </ModuleLayout>
  );
}
