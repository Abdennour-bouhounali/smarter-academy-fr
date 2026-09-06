import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Move, ZoomIn } from 'lucide-react';
import { ContentModule, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import { Feedback, ValidateButton, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatDec, texDec, parseDec, frameDec, decEquals } from '../components/decimalUtils';

/**
 * Module 8 V2 — reconstruit sur le lesson kit.
 * Toutes les interactions restent des manipulations maison pilotant une
 * NumberLine (lire une position, placer un curseur, encadrer) : ce ne sont
 * pas de simples QCM. Contrat kit respecté partout : un seul "Valider",
 * révélation et onSolved inconditionnels, jamais de "Réessayer".
 */
function LirePosition({ min, max, step, labelEvery, target, explain, solved, onSolved, react }) {
  const [val, setVal] = useState('');
  const [checked, setChecked] = useState(false);
  const n = parseDec(val);
  const isRight = !Number.isNaN(n) && decEquals(n, target);

  const check = () => {
    if (val === '') return;
    setChecked(true);
    react(isRight);
    onSolved?.();
  };

  const done = checked || solved;

  return (
    <div className="space-y-3">
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={min} max={max} step={step} labelEvery={labelEvery}
          format={(v) => formatDec(v)}
          markers={[{ value: target, label: done ? formatDec(target) : '?', color: '#dc2626' }]}
          ariaLabel={`Droite graduée de ${formatDec(min)} à ${formatDec(max)} avec un point à identifier`}
        />
      </div>

      {!done ? (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-slate-700">Quel nombre est repéré ?</span>
          <NumberField value={val} onChange={setVal} onEnter={check} ariaLabel="Nombre repéré par le point" width="w-32" size="sm" placeholder="0,0" />
          <ValidateButton onClick={check} disabled={!val}>OK</ValidateButton>
        </div>
      ) : (
        // `solved` (the parent's onSolved) flips true the instant `check()` runs, even for a
        // wrong answer — it must never override the correctness of what the student just
        // typed. Only `checked` (this component's own "I just answered" flag) may fall back
        // to a bare "solved" reading, for a genuine revisit where `val` is back at ''.
        <Feedback tone={checked ? (isRight ? 'ok' : 'ko') : 'ok'}>
          {checked && !isRight && (
            <>Ta réponse : <strong className="font-mono">{val}</strong>. </>
          )}
          Le point repère <strong className="font-mono">{formatDec(target)}</strong>. {explain}
        </Feedback>
      )}
    </div>
  );
}

function PlacerNombre({ min, max, step, labelEvery, target, explain, solved, onSolved, react }) {
  const [pos, setPos] = useState(solved ? target : min);
  const [checked, setChecked] = useState(false);
  const isRight = decEquals(pos, target);
  const done = checked || solved;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-sm text-slate-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
        <Move className="w-4 h-4 mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
        <span>
          Fais glisser le curseur pour placer <strong className="font-mono">{formatDec(target)}</strong> (flèches
          du clavier possibles). La valeur reste cachée : à toi d'estimer.
        </span>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
        <NumberLine
          min={min} max={max} step={step} labelEvery={labelEvery} height={190}
          mode="place"
          value={pos}
          onChange={(v) => { if (done) return; setPos(v); }}
          snap={step}
          format={(v) => formatDec(v)}
          revealValue={done}
          disabled={done}
          ghost={done && !isRight ? { value: target, label: formatDec(target) } : null}
          ariaLabel={`Place ${formatDec(target)} entre ${formatDec(min)} et ${formatDec(max)}`}
        />
      </div>

      {!done && (
        <ValidateButton onClick={() => { setChecked(true); react(isRight); onSolved?.(); }} tone="indigo">
          Valider ma position
        </ValidateButton>
      )}

      {checked && !isRight && (
        <Feedback tone="ko">
          Tu as placé le curseur sur <strong className="font-mono">{formatDec(pos)}</strong> (repère vert = la bonne
          position). {explain}
        </Feedback>
      )}
      {/* `solved` alone (parent's onSolved, fired unconditionally) must never imply "right" —
          only report success when THIS check was actually correct, or on a genuine revisit
          (solved from mount, never checked this session). */}
      {(checked ? isRight : solved) && <Feedback tone="ok">Position exacte ! {explain}</Feedback>}
    </div>
  );
}

const CIBLE = 4.37;
const NIVEAUX = [
  { unit: 1, title: 'Entre quels nombres ENTIERS se trouve 4,37 ?', hint: "Regarde la partie entière : 4. Le nombre est donc entre 4 et l'entier suivant.", lineStep: 0.1, labelEvery: 5 },
  { unit: 0.1, title: 'Entre quels DIXIÈMES se trouve 4,37 ?', hint: 'Les dixièmes ronds autour de 4,37 sont 4,3 et 4,4 (soit 4,30 et 4,40).', lineStep: 0.01, labelEvery: 5 },
];

function EncadrementStep({ niveau, solved, onSolved, react }) {
  const [low, setLow] = useState('');
  const [high, setHigh] = useState('');
  const [checked, setChecked] = useState(false);
  const [e0, e1] = frameDec(CIBLE, niveau.unit);

  const isRight =
    !Number.isNaN(parseDec(low)) && !Number.isNaN(parseDec(high)) &&
    decEquals(parseDec(low), e0) && decEquals(parseDec(high), e1);

  const done = checked || solved;

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-slate-700">{niveau.title}</p>

      <div className="flex items-center justify-center gap-2 flex-wrap">
        {done ? (
          // `solved` alone must never imply "right" — see PlacerNombre's note above.
          <div className={`font-mono font-extrabold text-lg sm:text-xl ${(checked ? isRight : solved) ? 'text-emerald-700' : 'text-rose-700'}`}>
            <MathText>{`$${texDec(e0)} < ${texDec(CIBLE)} < ${texDec(e1)}$`}</MathText>
          </div>
        ) : (
          <>
            <NumberField value={low} onChange={setLow} ariaLabel="Borne inférieure" width="w-24" size="sm" />
            <span className="font-mono font-bold text-xl text-slate-500">&lt;</span>
            <span className="font-mono font-extrabold text-xl text-slate-800 tabular-nums px-2">{formatDec(CIBLE)}</span>
            <span className="font-mono font-bold text-xl text-slate-500">&lt;</span>
            <NumberField value={high} onChange={setHigh} ariaLabel="Borne supérieure" width="w-24" size="sm" />
          </>
        )}
      </div>

      {!done && (
        <div className="text-center">
          <ValidateButton onClick={() => { setChecked(true); react(isRight); onSolved?.(); }} disabled={!low || !high}>
            Valider l'encadrement
          </ValidateButton>
        </div>
      )}

      {checked && !isRight && (
        <Feedback tone="ko">
          Ta réponse : <strong className="font-mono">{low || '?'} &lt; {formatDec(CIBLE)} &lt; {high || '?'}</strong>.
          Bonne réponse : <strong className="font-mono">{formatDec(e0)} &lt; {formatDec(CIBLE)} &lt; {formatDec(e1)}</strong>.{' '}
          {niveau.hint}
        </Feedback>
      )}

      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border-2 border-slate-200 rounded-2xl p-2">
          <NumberLine
            min={e0} max={e1} step={niveau.lineStep} labelEvery={niveau.labelEvery} height={150}
            format={(v) => formatDec(v)}
            markers={[{ value: CIBLE, label: formatDec(CIBLE), color: '#7c3aed' }]}
            ariaLabel={`4,37 encadré entre ${formatDec(e0)} et ${formatDec(e1)}`}
          />
        </motion.div>
      )}
    </div>
  );
}

export default function Module08DroiteGraduee() {
  const [lu, setLu] = useState(false);
  const [place07, setPlace07] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [place034, setPlace034] = useState(false);
  const [place037, setPlace037] = useState(false);
  const [niveaux, setNiveaux] = useState([]);

  const s1 = lu && place07;
  const s2 = zoomed && place034 && place037;
  const s3 = niveaux.length === NIVEAUX.length;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(8)}
      moduleNumber={8}
      moduleTitle="La droite graduée"
      moduleSubtitle="Zoom après zoom : chaque décimale gagnée, c'est un cran de précision en plus."
      estimatedTime="14 min"
      brief={{
        tag: '📏 Repérage',
        title: 'Chaque nombre décimal a UNE place précise sur la droite.',
        body: (
          <p>
            Entre 0 et 1, il y a les dixièmes. Entre deux dixièmes, il y a les centièmes. Et ainsi de suite : la
            droite se laisse zoomer à l'infini.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Entre 0 et 1 : les dixièmes',
          done: s1,
          content: (kit) => (
            <div className="space-y-6">
              <LirePosition min={0} max={1} step={0.1} labelEvery={5} target={0.3} explain="C'est la 3e graduation après 0 : 3 dixièmes, soit 0,3." solved={lu} onSolved={() => setLu(true)} react={kit.react} />
              {lu && (
                <PlacerNombre min={0} max={1} step={0.1} labelEvery={5} target={0.7} explain="0,7 = 7 dixièmes : il faut avancer de 7 graduations à partir de 0." solved={place07} onSolved={() => setPlace07(true)} react={kit.react} />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Zoom : et entre 0,3 et 0,4 ?',
          subtitle: "Il n'y a pas de « trou » entre deux dixièmes — il suffit de regarder de plus près.",
          done: s2,
          content: (kit) => (
            <div className="space-y-5">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
                <NumberLine
                  min={0} max={1} step={0.1} labelEvery={5} height={150}
                  format={(v) => formatDec(v)}
                  markers={zoomed ? [{ value: 0.3, label: '0,3', color: '#7c3aed' }, { value: 0.4, label: '0,4', color: '#7c3aed' }] : []}
                  ariaLabel="Droite graduée de 0 à 1"
                />
              </div>

              {!zoomed ? (
                <ValidateButton onClick={() => setZoomed(true)} tone="indigo">
                  <ZoomIn className="inline w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                  Zoomer entre 0,3 et 0,4
                </ValidateButton>
              ) : (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <Feedback tone="info">
                    On a agrandi l'intervalle <strong className="font-mono">0,3 — 0,4</strong> et on l'a partagé à
                    son tour en 10 parts égales. Chaque nouvelle graduation vaut{' '}
                    <strong className="font-mono">0,01</strong> : un <strong>centième</strong>.
                  </Feedback>

                  <PlacerNombre min={0.3} max={0.4} step={0.01} labelEvery={5} target={0.34} explain="0,34 = 0,30 + 4 centièmes : quatre graduations après 0,3." solved={place034} onSolved={() => setPlace034(true)} react={kit.react} />

                  {place034 && (
                    <PlacerNombre min={0.3} max={0.4} step={0.01} labelEvery={5} target={0.37} explain="0,37 = 0,30 + 7 centièmes : sept graduations après 0,3, tout près de 0,4." solved={place037} onSolved={() => setPlace037(true)} react={kit.react} />
                  )}

                  {s2 && (
                    <KnowledgeBrick
                      id="zoom-droite"
                      variant="new"
                      lead="Tu viens de placer deux nombres là où il n'y avait, tout à l'heure, qu'un seul trait."
                    />
                  )}
                </motion.div>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Entre quels repères se trouve 4,37 ?',
          subtitle: "D'abord deux entiers, puis deux repères plus serrés : de plus en plus précis.",
          done: s3,
          content: (kit) => (
            <div className="space-y-8">
              {/* Deux saisies vont demander deux bornes : la méthode et le mot
                  sont posés avant, jamais dans le feedback qui suit. */}
              <KnowledgeBrick
                id="encadrer-decimal"
                variant="new"
                lead="Coincer un nombre entre deux repères a un nom, et une manière de faire."
              />
              {NIVEAUX.map((niveau, i) =>
                i === 0 || niveaux.includes(i - 1) ? (
                  <div key={niveau.unit} className="space-y-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                    <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                      Précision {i + 1} / {NIVEAUX.length}
                    </div>
                    <EncadrementStep niveau={niveau} solved={niveaux.includes(i)} onSolved={() => setNiveaux((d) => (d.includes(i) ? d : [...d, i]))} react={kit.react} />
                  </div>
                ) : null
              )}

              {s3 && (
                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2 text-center">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Deux encadrements du même nombre</div>
                  {NIVEAUX.map((n) => {
                    const [lo, hi] = frameDec(CIBLE, n.unit);
                    return (
                      <div key={n.unit} className="font-mono text-base sm:text-lg font-bold text-amber-300">
                        <MathText>{`$${texDec(lo)} < ${texDec(CIBLE)} < ${texDec(hi)}$`}</MathText>
                      </div>
                    );
                  })}
                  <p className="text-xs text-slate-400 pt-1">
                    Plus l'intervalle est petit, plus on sait précisément où se trouve le nombre.
                  </p>
                </div>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={8}>
          <strong>La suite.</strong> Tu sais placer et encadrer un décimal. Au module suivant, tu
          n'as plus besoin de la valeur exacte : savoir « à peu près » suffit, et protège des
          erreurs.
        </KnowledgeSnapshot>
      }
    />
  );
}
