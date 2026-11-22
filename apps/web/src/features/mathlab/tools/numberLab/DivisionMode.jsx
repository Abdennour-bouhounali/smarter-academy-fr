import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import MathText from '../../../../lessons/common/components/MathText.jsx';
import { LabDisclosure, ExamplePicker, LabMessage } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import CheckedInput from './CheckedInput.jsx';
import {
  divisionLayout, divisionReadings, readDivisionOperand, DIVISION_EXAMPLES, randomDivision,
} from './euclideanDivision.js';
import { divisionFrames, divisionDrawStage, divisionProblem } from './divisionFrames.js';

/**
 * القسمة الإقليدية — a = b × q + r, 0 ≤ r < b.
 *
 * La division se CONSTRUIT au tableau (MathBoard, frames de `divisionFrames.js`),
 * déroulée par le lecteur partagé : a et b désignés → combien de rzam de b
 * tiennent dans a (q) → ce qui reste (r) → l'égalité, pièce par pièce → la
 * condition `0 ≤ r < b`, DERNIER pas. Ni q ni r ne sont écrits avant leur pas.
 *
 * Le dessin est HONNÊTE : il représente exactement a unités
 * (`divisionLayout`, testé) et SUIT le curseur — les a cubes en vrac, puis
 * groupés par b quand q tombe, puis le reste en orange quand r tombe. Petit
 * a : des cubes qu'on compte ; grand a : un ruban à l'échelle, coupé tous les b.
 *
 * Le mode « العمليات » garde sa lecture de la division (partage/groupement
 * sur des jetons) ; celui-ci est la division EUCLIDIENNE du programme de 4AM.
 */
export default function DivisionMode({ state, onChange, compact }) {
  const { t } = useTranslation('mathlab');
  const { a, b } = state;
  const board = useMemo(() => divisionFrames(a, b), [a, b]);
  const layout = useMemo(() => divisionLayout(a, b), [a, b]);
  const division = board?.division ?? null;
  const readings = useMemo(() => divisionReadings(division), [division]);
  const frames = board?.frames ?? [];
  const player = useStepReveal(frames.length, { resetKey: `${a}|${b}` });
  const stage = divisionDrawStage(frames, player.cursor);
  const practice = useBoardPractice(frames, player, `${a}|${b}`);
  const done = player.done && frames.length > 0;
  const K = 'tools.numberLab.division';

  const examples = DIVISION_EXAMPLES.map((example) => ({ ...example, label: `${example.a} ÷ ${example.b}` }));
  const activeExample = DIVISION_EXAMPLES.find((example) => example.a === a && example.b === b)?.id ?? null;

  return (
    <div className="sa-ml-nb__mode sa-ml-nb__mode--division" data-ml-nb-division>
      <h3 className="sa-ml-nb__heading">{t(`${K}.title`)}</h3>
      <p className="sa-ml-nb__hint"><MathText>{t(`${K}.intro`)}</MathText></p>

      <div className="sa-ml-nb__row sa-ml-nb__row--wrap">
        <CheckedInput
          value={a}
          onValue={(next) => onChange({ a: next })}
          read={(raw) => readDivisionOperand(raw, 'dividend')}
          errorText={(code) => t(`${K}.errors.${code}`)}
          label={t(`${K}.dividend`)}
          dataAttr="data-ml-nb-division-a"
        />
        <CheckedInput
          value={b}
          onValue={(next) => onChange({ b: next })}
          read={(raw) => readDivisionOperand(raw, 'divisor')}
          errorText={(code) => t(`${K}.errors.${code}`)}
          label={t(`${K}.divisor`)}
          dataAttr="data-ml-nb-division-b"
        />
      </div>

      <ExamplePicker
        examples={examples}
        activeId={activeExample}
        onPick={(id) => {
          const example = DIVISION_EXAMPLES.find((e) => e.id === id);
          if (example) onChange({ a: example.a, b: example.b });
        }}
        onRandom={() => onChange(randomDivision())}
        dataAttr="data-ml-nb-division-example"
      />

      {division && (
        <>
          <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(frames, player.cursor)} dataAttr="data-ml-nb-step" />

          {/* « D'un seul regard » (MATH_LAB §3.5) : le dessin AU-DESSUS du tableau
              qui le calcule — les paquets et le pas courant dans le même regard. */}
          <div className="sa-ml-nb__duo" dir="ltr">
            <div className="sa-ml-nb__duo-figure" dir="rtl">
              <DivisionDrawing layout={layout} division={division} compact={compact} stage={stage} />
            </div>
            <div className="sa-ml-nb__board sa-ml-nb__duo-board" dir="rtl" {...(done ? { 'data-ml-nb-division-result': '', 'data-q': division.q, 'data-r': division.r } : {})}>
              <MathBoard {...practice.board} frames={frames} cursor={player.cursor} problem={divisionProblem(a, b)} dataAttr="data-ml-nb-division-frame" />
            </div>
          </div>

          {/* Après le dernier pas : la vérification, et les deux lectures. */}
          {done && (
            <div className="sa-ml-nb__division-after" data-ml-nb-division-after>
              {division.exact && <LabMessage tone="success">{t(`${K}.exact`)}</LabMessage>}
              <p className="sa-ml-nb__muted">
                {t(`${K}.check`)}{' '}
                <MathText>{`$${b} \\times ${division.q} + ${division.r} = ${division.check.product} + ${division.r} = ${division.check.sum}$`}</MathText>
              </p>
              {/* L'erreur classique : une égalité juste qui n'est pas LA division. */}
              {division.q >= 1 && (
                <p className="sa-ml-nb__callout">
                  <MathText>
                    {t(`${K}.notEuclid`, { a, b, q: division.q - 1, r: division.r + b })}
                  </MathText>
                </p>
              )}
              {readings && (
                <LabDisclosure kind="rule" title={t(`${K}.readingsTitle`)} dataAttr="data-ml-nb-division-readings">
                  <p>{t(`${K}.sharing`, { a, b, q: readings.sharing.each, r: readings.sharing.left })}</p>
                  <p>{t(`${K}.grouping`, { a, b, q: readings.grouping.packs, r: readings.grouping.left })}</p>
                </LabDisclosure>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * LE DESSIN : a unités, ni plus ni moins — et il SUIT le tableau (`stage`) :
 *   0  les a unités en vrac (l'énoncé : on ne sait encore rien) ;
 *   1  groupées par b (q vient de tomber) — le reste encore neutre ;
 *   2  le reste en orange (r vient de tomber).
 * Les paquets alternent deux verts. L'étiquette lue par un lecteur d'écran
 * suit le même rythme : elle ne dit ni q ni r avant leur pas.
 */
function DivisionDrawing({ layout, division, compact, stage = 2 }) {
  const { t } = useTranslation('mathlab');
  const K = 'tools.numberLab.division';
  if (!layout) return null;
  const label = stage >= 2
    ? t(`${K}.blocksLabel`, { a: division.a, b: division.b, q: division.q, r: division.r })
    : stage === 1
      ? t('tools.numberLab.steps.division.drawingGroups', { a: division.a, b: division.b, q: division.q })
      : t('tools.numberLab.steps.division.drawingLoose', { a: division.a });
  const restClass = stage >= 2 ? 'is-remainder' : 'is-loose';

  if (layout.kind === 'blocks') {
    return (
      <figure className="sa-ml-nb__division-drawing" data-ml-nb-division-drawing="blocks" data-ml-nb-division-stage={stage}>
        <div className="sa-ml-nb__blocks" role="img" aria-label={label}>
          {stage === 0 ? (
            <span className="sa-ml-nb__block-group is-loose">
              {Array.from({ length: layout.total }, (_, i) => <span key={i} className="sa-ml-nb__block" />)}
            </span>
          ) : (
            <>
              {layout.groups.map((group) => (
                <span key={group.index} className={`sa-ml-nb__block-group is-tone${group.index % 2}`} data-ml-nb-block-group>
                  {Array.from({ length: group.size }, (_, i) => <span key={i} className="sa-ml-nb__block" />)}
                </span>
              ))}
              {layout.remainder.size > 0 && (
                <span className={`sa-ml-nb__block-group ${restClass}`} {...(stage >= 2 ? { 'data-ml-nb-block-remainder': '' } : {})}>
                  {Array.from({ length: layout.remainder.size }, (_, i) => <span key={i} className="sa-ml-nb__block" />)}
                </span>
              )}
            </>
          )}
        </div>
        <Legend b={division.b} stage={stage} />
      </figure>
    );
  }

  // Le ruban : à l'échelle de a, coupé tous les b.
  const W = compact ? 320 : 560;
  const H = 34;
  const scale = W / Math.max(1, layout.total);
  const minRemainder = 3;
  const tiny = layout.remainder.size > 0 && layout.remainder.size * scale < minRemainder;

  return (
    <figure className="sa-ml-nb__division-drawing" data-ml-nb-division-drawing="bars" data-ml-nb-division-stage={stage}>
      <svg viewBox={`0 0 ${W} ${H + 4}`} width="100%" role="img" aria-label={label} style={{ direction: 'ltr' }}>
        {stage === 0 ? (
          <rect x={0} y={2} width={W} height={H} className="sa-ml-nb__bar-group is-loose" />
        ) : (
          <>
            {layout.groups.map((group) => (
              <rect
                key={group.index}
                x={group.start * scale}
                y={2}
                width={Math.max(0.5, group.size * scale)}
                height={H}
                className={`sa-ml-nb__bar-group is-tone${layout.compressed ? 0 : group.index % 2}`}
              />
            ))}
            {layout.remainder.size > 0 && (
              <rect
                x={Math.min(W - minRemainder, layout.remainder.start * scale)}
                y={2}
                width={Math.max(minRemainder, layout.remainder.size * scale)}
                height={H}
                className={`sa-ml-nb__bar-group ${restClass}`}
              />
            )}
          </>
        )}
      </svg>
      <p className="sa-ml-nb__muted">
        {layout.compressed && stage >= 1
          ? t(`${K}.compressedNote`, { q: division.q })
          : t(`${K}.barsNote`, { a: division.a, b: division.b })}
      </p>
      {tiny && stage >= 2 && <p className="sa-ml-nb__muted">{t(`${K}.tinyRemainder`)}</p>}
      <Legend b={division.b} stage={stage} />
    </figure>
  );
}

function Legend({ b, stage }) {
  const { t } = useTranslation('mathlab');
  if (stage === 0) return null;

  return (
    <figcaption className="sa-ml-nb__ribbon-legend">
      <span><i className="sa-ml-nb__swatch is-rest" aria-hidden="true" />{t('tools.numberLab.division.legendGroup', { b })}</span>
      {stage >= 2 && <span><i className="sa-ml-nb__swatch is-cut" aria-hidden="true" />{t('tools.numberLab.division.legendRemainder')}</span>}
    </figcaption>
  );
}
