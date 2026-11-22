import { useTranslation } from 'react-i18next';
import FractionShape from './FractionShape.jsx';
import { commonDenominatorStory } from './commonDenominatorStory.js';

/**
 * « توحيد المقامات » — la figure du pas « PPCM des dénominateurs ».
 *
 * Les deux fractions, dans le modèle choisi par l'élève (barre, disque ou
 * droite), chacune avec SES coupes en trait plein et les coupes du PPCM en
 * pointillé : on voit que 12 parts « tombent juste » sur les tiers (chaque
 * tiers = 4 parts) ET sur les quarts (chaque quart = 3 parts). Dessous, les
 * multiples de chaque dénominateur, le premier commun entouré : c'est le plus
 * petit nombre de parts qui convient aux deux découpages.
 */
export default function CommonDenominatorFigure({ left, right, model }) {
  const { t } = useTranslation('mathlab');
  const story = commonDenominatorStory(left?.d, right?.d);
  if (!story) return null;
  const K = 'tools.numberLab.steps.fractions.common';
  const L = story.denominator;
  const drawable = L <= 120;

  return (
    <figure className="sa-ml-nb__common" data-ml-nb-common-denominator={L}>
      <figcaption className="sa-ml-nb__common-title">
        <strong>{t(`${K}.title`)}</strong>
        <span>{t(`${K}.intro`)}</span>
      </figcaption>

      {/* Dans l'ordre de l'opération, de GAUCHE à DROITE : 1/3 puis 1/4. */}
      <div className="sa-ml-nb__common-shapes" dir="ltr">
        {[['left', left, 'primary'], ['right', right, 'secondary']].map(([key, frac, tone]) => (
          <div key={key} className="sa-ml-nb__common-shape" data-ml-nb-common-side={key}>
            <FractionShape
              frac={frac}
              model={model}
              tone={tone}
              grid={drawable ? L : null}
              width={model === 'circle' ? 150 : 300}
              showLabel
            />
            <p className="sa-ml-nb__common-note" dir="rtl">
              {t(`${K}.eachPart`, { count: story[key].factor })}
              {story[key].factor > 1 && (
                // La formule hors de la phrase arabe : isolée LTR, jamais réordonnée.
                <bdi dir="ltr" className="sa-ml-nb__common-formula">{` ${frac.d} × ${story[key].factor} = ${L}`}</bdi>
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="sa-ml-nb__common-multiples" dir="ltr">
        {['left', 'right'].map((key) => (
          <p key={key} className="sa-ml-nb__common-row">
            <span className="sa-ml-nb__common-label" dir="rtl">{t(`${K}.multiplesOf`, { d: story[key].d })}</span>
            {story[key].multiples.map((m, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <span key={index} className={`sa-ml-nb__common-multiple${m === L ? ' is-common' : ''}`}>{m}</span>
            ))}
          </p>
        ))}
      </div>

      <p className="sa-ml-nb__common-conclusion">
        {t(`${K}.conclusion`, { a: story.left.d, b: story.right.d, total: L })}
        {!drawable && ` ${t(`${K}.tooMany`)}`}
      </p>
    </figure>
  );
}
