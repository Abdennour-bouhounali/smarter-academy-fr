import StepPlayer from '../../shared/StepPlayer.jsx';
import useStepReveal from '../../shared/useStepReveal.js';
import MathBoard from '../../shared/mathBoard/MathBoard.jsx';
import useBoardPractice from '../../shared/mathBoard/useBoardPractice.js';
import { boardProgress } from '../../shared/mathBoard/frames.js';

/**
 * « من الصيغة المنشورة إلى الصيغة النموذجية » — la complétion du carré, au
 * tableau, frame par frame (`canonicalSteps.js` → `shared/mathBoard`).
 *
 * Ce qui reste VIVANT : la courbe et le champ d'équation. L'équation tapée
 * déplace la conique tout de suite (§7 dans les deux sens), et le champ
 * redevient le miroir de la conique dès qu'on la tire. Ce qui se DÉROULE :
 * le passage d'une forme à l'autre, qui n'était jusqu'ici jamais montré.
 *
 * `derivation.source` (la saisie de l'élève) est la clé : une autre équation,
 * c'est une autre question, et le tableau revient à l'énoncé. Un frame futur
 * n'est jamais rendu (MathBoard tranche par `cursor`).
 */
export default function ConicDerivation({ derivation, t }) {
  const { frames, problem, source } = derivation;
  const player = useStepReveal(frames.length, { resetKey: source });
  // « تدرّب بنفسك » : l'élève désigne lui-même les termes à regrouper / compléter.
  const practice = useBoardPractice(frames, player, source);

  return (
    <section
      className="sa-ml-cn__section sa-ml-cn__derivation"
      aria-label={t('tools.conics.derivation.title')}
      data-ml-cn-derivation={player.phase}
    >
      <StepPlayer
        {...practice.player}
        player={player}
        sticky
        dataAttr="data-ml-cn-step"
        title={t('tools.conics.derivation.title')}
        progress={boardProgress(frames, player.cursor)}
      />
      {player.cursor === 0 && (
        <p className="sa-ml-cn__note" data-ml-cn-derivation-intro>{t('tools.conics.derivation.intro')}</p>
      )}
      <MathBoard
        {...practice.board}
        frames={frames}
        cursor={player.cursor}
        problem={problem}
        label={t('tools.conics.derivation.title')}
        dataAttr="data-ml-cn-board"
      />
    </section>
  );
}
