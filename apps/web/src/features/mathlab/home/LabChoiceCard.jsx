import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { LAB_META } from './labMeta';

/** Au-delà, la rangée d'icônes s'arrête sur « +N » : la carte reste une carte. */
const MAX_ICONS = 8;

/**
 * UN des deux choix de l'accueil : مخبر المتوسط ou مخبر الثانوي.
 *
 * Toute la carte est le lien (comme ToolCard) : icône du مخبر, nom, les
 * classes qu'il couvre, une phrase, et la RANGÉE des instruments qu'on y
 * trouvera — l'élève voit ce qu'il choisit avant de choisir. Les icônes sont
 * décoratives ; leur nom complet est dans `aria-label` du lien.
 */
export default function LabChoiceCard({ scope, to, tools, onChoose }) {
  const { t } = useTranslation('mathlab');
  const { icon: LabIcon } = LAB_META[scope];
  const shown = tools.slice(0, MAX_ICONS);
  const rest = tools.length - shown.length;
  const names = tools.map((tool) => t(tool.labelKey)).join('، ');

  return (
    <Link
      to={to}
      onClick={onChoose}
      className={`sa-ml-labcard sa-ml-labcard--${scope} group`}
      data-ml-lab-choice={scope}
      aria-label={`${t(`labs.${scope}.name`)} — ${t(`labs.${scope}.grades`)}. ${names}`}
    >
      <span className="sa-ml-labcard__head">
        <span className="sa-ml-labcard__icon"><LabIcon size={26} aria-hidden="true" /></span>
        <span className="min-w-0">
          <span className="sa-ml-labcard__name">{t(`labs.${scope}.name`)}</span>
          <span className="sa-ml-labcard__grades">{t(`labs.${scope}.grades`)}</span>
        </span>
      </span>
      <span className="sa-ml-labcard__body">{t(`labs.${scope}.description`)}</span>
      <span className="sa-ml-labcard__tools" aria-hidden="true">
        {shown.map((tool) => {
          const Icon = tool.icon;

          return (
            <span key={tool.id} className="sa-ml-labcard__tool" title={t(tool.labelKey)} data-ml-lab-choice-tool={tool.id}>
              <Icon size={16} />
            </span>
          );
        })}
        {rest > 0 && <span className="sa-ml-labcard__more" dir="ltr">{`+${rest}`}</span>}
      </span>
      <span className="sa-ml-labcard__foot">
        <span className="sa-ml-labcard__count">{t('labs.toolCount', { count: tools.length })}</span>
        <span className="sa-ml-labcard__cta">
          {t('labs.enter')}
          <ArrowForward size={15} aria-hidden="true" />
        </span>
      </span>
    </Link>
  );
}
