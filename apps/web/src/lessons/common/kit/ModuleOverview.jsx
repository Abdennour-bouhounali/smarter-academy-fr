import { useTranslation } from 'react-i18next';
import MathLabel from '../components/MathLabel';

/**
 * La PAGE D'ENTRÉE d'un module présenté (وضع القسم) : avant la mission, le
 * laboratoire ou la première étape, la classe lit CLAIREMENT de quel محور il
 * s'agit et ce qu'on va y apprendre — en quelques points.
 *
 *   المحور 2
 *   معارف — قواسم عدد طبيعي
 *   تعريفان لنفس الفكرة
 *   ماذا سنتعلّم في هذا المحور؟
 *     ١ التعريف الأول: بالباقي
 *     ٢ التعريف الثاني: بالجداء
 *     …
 *
 * Les points viennent de `objectives` (ContentModule) ; sans eux, des TITRES
 * des étapes — le module n'a rien à écrire de plus pour être couvert. Un
 * objectif peut être une phrase ou une question (« لماذا … ؟ »).
 * Rendu seulement quand le module est présenté : la page d'élève ne le porte pas.
 */
export default function ModuleOverview({ number, title, subtitle, estimatedTime, points = [], heading }) {
  const { t } = useTranslation('lesson');
  const items = points.filter(Boolean);
  return (
    <section className="sa-classroom-overview" data-classroom-overview>
      <p className="sa-classroom-overview__eyebrow">{t('classroom.overview.module', { number })}</p>
      <h2 className="sa-classroom-overview__title"><MathLabel>{title}</MathLabel></h2>
      {subtitle && <p className="sa-classroom-overview__subtitle"><MathLabel>{subtitle}</MathLabel></p>}
      {items.length > 0 && (
        <div className="sa-classroom-overview__learn">
          <h3 className="sa-classroom-overview__learn-title">{heading || t('classroom.overview.learn')}</h3>
          <ol className="sa-classroom-overview__points">
            {items.map((p, i) => (
              <li key={i} className="sa-classroom-overview__point" data-classroom-overview-point>
                <span className="sa-classroom-overview__bullet" aria-hidden="true">{i + 1}</span>
                <span><MathLabel>{p}</MathLabel></span>
              </li>
            ))}
          </ol>
        </div>
      )}
      {estimatedTime && <p className="sa-classroom-overview__time">{t('classroom.overview.time', { time: estimatedTime })}</p>}
    </section>
  );
}
