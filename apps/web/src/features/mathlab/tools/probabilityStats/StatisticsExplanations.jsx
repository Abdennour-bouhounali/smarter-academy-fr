import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LabDisclosure } from '../../shared/LabKit.jsx';
import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';
import { statFrames } from './statsFrames.js';
import { MAX_SUBSTITUTION_TERMS } from './descriptiveStats.js';

/**
 * Un indicateur CALCULÉ AU TABLEAU : son lecteur (collé en haut de la zone
 * qui défile), puis le tableau qui se construit frame par frame
 * (statsFrames.js). Monté seulement quand son pli est ouvert ; une nouvelle
 * série ramène à l'énoncé (« x̄ = ? »).
 */
function Derivation({ kind, values, stats, seriesKey }) {
  const { t } = useTranslation('mathlab');
  const board = useMemo(() => statFrames(kind, values, stats), [kind, values, stats]);
  const player = useStepReveal(board ? board.frames.length : 0, { resetKey: `${kind}|${seriesKey}` });
  const practice = useBoardPractice(board?.frames ?? [], player, `${kind}|${seriesKey}`);
  if (!board) return null;

  return (
    <div className="sa-ml-ps__derivation" data-ml-ps-explain-derivation={kind}>
      <StepPlayer player={player} {...practice.player} sticky progress={boardProgress(board.frames, player.cursor)} dataAttr="data-ml-ps-explain-step" />
      <MathBoard
        {...practice.board}
        frames={board.frames}
        cursor={player.cursor}
        problem={board.problem}
        label={t(`tools.probabilityStats.explain.${kind === 'variance' ? 'varianceOnly' : kind}Title`)}
        dataAttr="data-ml-ps-explain-board"
      />
    </div>
  );
}

/**
 * « كيف تُحسب المؤشّرات؟ » — un pli par indicateur, FERMÉ à l'ouverture :
 * explorer d'abord, comprendre à la demande.
 *
 * Choix (exigence 2026-09-30, « ne pas forcer le pas à pas là où il nuit ») :
 * la grille des indicateurs (StatisticsSummary), le graphique et le tableau
 * restent LIVE — c'est la lecture instantanée de la série que l'élève
 * modifie, l'exploration. Ce qui ENSEIGNE, c'est ici : chaque pli dit en une
 * phrase ce que l'indicateur mesure, puis le calcul se construit au tableau
 * avec les nombres de LA série, opération par opération, le résultat en
 * dernier. L'élève qui a déjà lu x̄ dans la grille voit ici d'où il vient.
 */
export default function StatisticsExplanations({ values, stats, shown = null }) {
  const { t } = useTranslation('mathlab');
  const seriesKey = useMemo(() => values.join(';'), [values]);
  if (stats.n === 0) return null;
  const k = (key) => `tools.probabilityStats.explain.${key}`;
  const derivation = (kind) => <Derivation kind={kind} values={values} stats={stats} seriesKey={seriesKey} />;
  // `shown` : les plis de ce مخبر (scope.js) — au collège, ni quartiles ni variance.
  const show = (kind) => !shown || shown.includes(kind);

  return (
    <section className="sa-ml-ps__explanations" aria-labelledby="ml-ps-explain-heading" data-ml-ps-explanations>
      <h3 id="ml-ps-explain-heading" className="sa-ml-ps__heading">{t(k('heading'))}</h3>
      {show('mean') && (
      <LabDisclosure kind="rule" title={t(k('meanTitle'))} dataAttr="data-ml-ps-explain-mean">
        <p>{t(k('meanWhy'))}</p>
        {derivation('mean')}
      </LabDisclosure>
      )}
      {show('median') && (
      <LabDisclosure kind="rule" title={t(k('medianTitle'))} dataAttr="data-ml-ps-explain-median">
        <p>{t(k(stats.n % 2 === 1 ? 'medianWhyOdd' : 'medianWhyEven'))}</p>
        {derivation('median')}
      </LabDisclosure>
      )}
      {show('mode') && (
      <LabDisclosure kind="rule" title={t(k('modeTitle'))} dataAttr="data-ml-ps-explain-mode">
        <p>{t(k('modeWhy'))}</p>
        <p>
          {stats.modes.kind === 'none' && t(k('modeNone'))}
          {stats.modes.kind === 'values' && stats.modes.values.length > 1 && t(k('modeSeveral'), { count: stats.modes.count })}
          {stats.modes.kind === 'values' && stats.modes.values.length === 1 && t(k('modeOne'), { count: stats.modes.count })}
        </p>
      </LabDisclosure>
      )}
      {show('quartiles') && (
      <LabDisclosure kind="rule" title={t(k('quartilesTitle'))} dataAttr="data-ml-ps-explain-quartiles">
        <p>{t(k('quartilesWhy'))}</p>
        {derivation('quartiles')}
        <p className="sa-ml-ps__hint">{t(k('quartilesConvention'))}</p>
      </LabDisclosure>
      )}
      {show('range') && (
      <LabDisclosure kind="rule" title={t(k('rangeTitle'))} dataAttr="data-ml-ps-explain-range">
        <p>{t(k('rangeWhy'))}</p>
        {derivation('range')}
      </LabDisclosure>
      )}
      {show('variance') && (
      <LabDisclosure kind="rule" title={t(k('varianceOnlyTitle'))} dataAttr="data-ml-ps-explain-variance">
        <p>{t(k('varianceWhy'))}</p>
        {derivation('variance')}
        <p className="sa-ml-ps__hint">{t(k('population'))}</p>
        {stats.n > MAX_SUBSTITUTION_TERMS && <p className="sa-ml-ps__hint">{t(k('tooLongToWrite'))}</p>}
      </LabDisclosure>
      )}
      {show('sd') && (
      <LabDisclosure kind="rule" title={t(k('sdTitle'))} dataAttr="data-ml-ps-explain-sd">
        <p>{t(k('sdWhy'))}</p>
        {derivation('sd')}
      </LabDisclosure>
      )}
    </section>
  );
}
