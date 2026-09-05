import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Move } from 'lucide-react';
import { ContentModule, TapQuestion } from '../../../../../common/kit';
import NumberLine from '../../../../../common/components/NumberLine';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { fracLineFormat } from '../components/fractionUtils';

/**
 * Module 8 V2 — reconstruit sur le lesson kit.
 * Les deux manipulations maison (placer un curseur, lire une graduation)
 * pilotent la NumberLine partagée et suivent le même contrat que
 * nombres-decimaux/Module08DroiteGradueeV2 : un seul "Valider", révélation
 * et onSolved inconditionnels, jamais de boucle "Réessayer". Seul le piège
 * final (étape 4) est un vrai QCM — porté sur TapQuestion, avec la droite
 * graduée statique passée via `above`.
 */

/* ─── Placer une fraction (drag) ──────────────────────────────────── */
function PlacerFraction({ den, target, min = 0, max = 1, markers = [], explain, solved, onSolved, react }) {
  const [pos, setPos] = useState(solved ? target : min);
  const [checked, setChecked] = useState(false);
  const step = 1 / den;
  const isRight = Math.round(pos * den) === Math.round(target * den);
  const done = checked || solved;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-sm text-slate-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
        <Move className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
        <span>
          Fais glisser le curseur pour placer <MathText>{`$\\frac{${Math.round(target * den)}}{${den}}$`}</MathText>{' '}
          (flèches du clavier possibles). La valeur reste cachée : à toi d'estimer.
        </span>
      </div>

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
            if (done) return;
            setPos(v);
          }}
          snap={step}
          format={fracLineFormat(den)}
          revealValue={done}
          disabled={done}
          ghost={done && !isRight ? { value: target, label: fracLineFormat(den)(target) } : null}
          ariaLabel={`Place ${fracLineFormat(den)(target)} entre ${min} et ${max}`}
          edgesOnly
          markers={markers}
        />
      </div>

      {!done && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              react(isRight);
              onSolved?.();
            }}
          >
            Valider ma position
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && (
        <Feedback tone="ko">
          Tu as placé le curseur sur <strong className="font-mono">{fracLineFormat(den)(pos)}</strong> (repère vert =
          la bonne position). {explain}
        </Feedback>
      )}
      {/* `solved` (parent's onSolved, fired unconditionally) must never imply "right" — only
          report success when THIS check was actually correct, or on a genuine revisit (solved
          from mount, never checked this session). */}
      {(checked ? isRight : solved) && <Feedback tone="ok">{explain}</Feedback>}
    </div>
  );
}

/* ─── Lire une position (clic) ────────────────────────────────────── */
function LirePosition({ den, target, solved, onSolved, react }) {
  const [tick, setTick] = useState(null);
  const [checked, setChecked] = useState(false);
  const isRight = tick !== null && Math.round(tick * den) === Math.round(target * den);
  const done = checked || solved;

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
            if (done) return;
            setTick(v);
          }}
          ariaLabel={`Clique la graduation ${fracLineFormat(den)(target)}`}
          edgesOnly
        />
      </div>
      <p className="text-sm text-center font-semibold text-slate-700">
        Clique la graduation qui correspond à <MathText>{`$\\frac{${Math.round(target * den)}}{${den}}$`}</MathText>.
      </p>
      {!done && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              setChecked(true);
              react(isRight);
              onSolved?.();
            }}
            disabled={tick === null}
          >
            Valider
          </ValidateButton>
        </div>
      )}
      {checked && !isRight && (
        <Feedback tone="ko">
          Tu as cliqué <strong className="font-mono">{tick !== null ? fracLineFormat(den)(tick) : '—'}</strong>.
          Compte les graduations depuis 0, une par une.
        </Feedback>
      )}
      {(checked ? isRight : solved) && (
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
    'Vrai : 3 est presque 4, donc la fraction est presque un entier de plus',
    'Faux : 3/4 se trouve AVANT 1 sur la droite — regarder les chiffres 3 et 4 séparément ne dit rien',
  ],
  correct: 1,
  explain:
    "3/4 est inférieur à 1 : il en manque un quart pour atteindre 1 entier. Sur la droite, 3/4 est nettement à gauche de 1. Comparer 3 et 4 comme deux nombres isolés ne renseigne pas sur la position de la fraction.",
};

export default function Module08Droite() {
  const [halfDone, setHalfDone] = useState(false);
  const [thirdsDone, setThirdsDone] = useState([]);
  const [quartDone, setQuartDone] = useState(false);
  const [wholeSeen, setWholeSeen] = useState(false);
  const [improperDone, setImproperDone] = useState(false);
  const [piegeDone, setPiegeDone] = useState(false);

  const s1 = halfDone && thirdsDone.length === 2;
  const s2 = quartDone && wholeSeen;
  const s3 = improperDone;
  const s4 = piegeDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="Sur la demi-droite graduée"
      moduleSubtitle="Une fraction est un NOMBRE : elle a une place précise entre 0 et 1."
      estimatedTime="10 min"
      brief={{
        tag: '📏 Nombre',
        title: "3/4 n'est pas qu'un partage : c'est aussi une position.",
        body: (
          <p>
            Chaque fraction a sa place exacte sur la droite graduée, entre les nombres entiers que tu connais
            déjà.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Place des demis, puis des tiers',
          done: s1,
          content: (kit) => (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">
                  Place <MathText>{'$\\frac{1}{2}$'}</MathText> (partage en 2).
                </p>
                <PlacerFraction
                  den={2}
                  target={0.5}
                  solved={halfDone}
                  onSolved={() => setHalfDone(true)}
                  react={kit.react}
                  explain="1/2 est exactement au milieu entre 0 et 1."
                />
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
                        react={kit.react}
                        explain={`${i === 0 ? '1/3' : '2/3'} se trouve à ${i === 0 ? '1' : '2'} graduation${i === 0 ? '' : 's'} de 0, sur un partage en 3.`}
                      />
                    ) : null
                  )}
                </div>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Les quarts, et une découverte : 4/4 = 1',
          done: s2,
          content: (kit) => (
            <div className="space-y-4">
              <LirePosition den={4} target={0.75} solved={quartDone} onSolved={() => setQuartDone(true)} react={kit.react} />

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
          ),
        },
        {
          num: 3,
          title: 'Peut-on dépasser 1 ?',
          done: s3,
          content: (kit) => (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Si <MathText>{'$\\frac{4}{4}$'}</MathText> vaut 1, que devient <MathText>{'$\\frac{5}{4}$'}</MathText>{' '}
                ? Place-la sur cette droite qui va jusqu'à 2.
              </p>
              <PlacerFraction
                den={4}
                target={1.25}
                min={0}
                max={2}
                solved={improperDone}
                onSolved={() => setImproperDone(true)}
                react={kit.react}
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
          ),
        },
        {
          num: 4,
          title: 'Piège : 3/4 dépasse-t-il 1 ?',
          done: s4,
          content: (
            <TapQuestion
              above={
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
              }
              prompt={PIEGE_Q.q}
              options={PIEGE_Q.options}
              correct={PIEGE_Q.correct}
              cols={1}
              explain={PIEGE_Q.explain}
              onAnswered={() => setPiegeDone(true)}
            />
          ),
        },
      ]}
    />
  );
}
