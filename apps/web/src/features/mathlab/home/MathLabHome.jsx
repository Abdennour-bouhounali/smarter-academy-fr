import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PencilRuler } from 'lucide-react';
import { ArrowBack } from '../../../components/common/DirectionalIcons';
import { useDocumentMeta } from '../../../hooks/useDocumentMeta';
import { MATH_LAB_TOOLS, PLANNED_MATH_LAB_TOOLS } from '../toolRegistry';
import { mathLabBasePath } from '../mathLabDocument';
import { useWorkspaceBase } from '../../learning/learningViewer';
import { LAB_SCOPES, commonTools, labHomePath, readLabScopeParam, rememberLabScope, toolsForScope } from '../labScope';
import ToolCard from './ToolCard';
import LabChoiceCard from './LabChoiceCard';
import { LAB_META } from './labMeta';
import MyWorkSpace from '../work/MyWorkSpace';
import NewWorkMenu from '../work/NewWorkMenu';
import QuotaMeter from '../../../components/access/QuotaMeter';
import { useFeatureAccess } from '../../../hooks/useFeatureAccess';
import { DOCUMENTS_FEATURE, featureState, isToolVisible, toolFeatureKey } from '../../access/featureAccess';
import '../mathlab.css';
import '../work/mathlabWork.css';
// La confirmation de suppression et la feuille de filtres sont celles du
// cahier (ConfirmDialog, `.sa-ns-sheet`) ; leurs styles vivent dans la
// feuille de « Mon cahier ».
import '../../practice/notebook/space/notebookSpace.css';

/**
 * L'accueil du مختبر الرياضيات (/espace/atelier), et celui de chacun de ses
 * deux مخابر (/espace/atelier?lab=moyen · ?lab=secondaire).
 *
 * ── L'architecture d'information (MATH_LAB.md §2.1) ──────────────────────
 *
 *   /atelier            la سبّورة (commune à tous), puis DEUX choix clairs —
 *                       مخبر المتوسط · مخبر الثانوي — puis « أعمالي »
 *   /atelier?lab=moyen  les instruments de ce مخبر seulement, la سبّورة
 *                       toujours à portée, et « أعمالي » filtré sur ce مخبر
 *
 * Un مخبر n'est PAS une route de plus : c'est un paramètre d'URL que la page
 * lit. Les instruments, leurs routes et leurs documents restent uniques —
 * c'est ce qu'ils MONTRENT qui change (labScope.js).
 *
 * Même cadre que les autres pages de l'espace (`.sa-page`), même en-tête
 * (sur-titre, titre, sous-titre). « أعمالي » garde sa place sous les
 * instruments : on ouvre un instrument, puis on revient à ce qu'on y a fait.
 */
export default function MathLabHome() {
  const { search } = useLocation();
  const scope = readLabScopeParam(search);

  return scope ? <LabHome key={scope} scope={scope} /> : <LabLanding />;
}

/** Ce que la page lit du serveur : les instruments visibles, et lesquels sont fermés. */
function useLabAccess() {
  // « الوصول والحدود » : lu, jamais décidé ici. Un instrument coupé par
  // l'administration disparaît ; un instrument fermé au palier reste montré,
  // avec son cadenas — sa page explique pourquoi.
  const { summary } = useFeatureAccess();
  const tools = MATH_LAB_TOOLS.filter((tool) => isToolVisible(summary, tool.id));
  const isLocked = (tool) => !featureState(summary, toolFeatureKey(tool.id)).allowed;
  const documents = featureState(summary, DOCUMENTS_FEATURE);

  return { tools, isLocked, documents };
}

function LabLanding() {
  const { t } = useTranslation('mathlab');
  useDocumentMeta(t('metaTitle'), t('metaDescription'));
  const labRoot = mathLabBasePath(useWorkspaceBase());
  const { tools, isLocked, documents } = useLabAccess();
  const shared = commonTools(tools);

  return (
    <div className="sa-page py-8 sm:py-10" data-ml-home data-ml-home-view="landing">
      <div className="mb-8">
        <p className="font-mono-jetbrains text-blue-500 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5">
          <PencilRuler size={13} aria-hidden="true" /> {t('eyebrow')}
        </p>
        <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">{t('title')}</h1>
        <p className="font-inter text-slate-500 text-sm mt-1">{t('subtitle')}</p>
        <p className="font-mono-jetbrains text-slate-400 text-xs mt-2" dir="rtl">{t('cycle')}</p>
      </div>

      {shared.length > 0 && (
        <section className="mb-8" aria-labelledby="ml-common-heading" data-ml-common-tools>
          <h2 id="ml-common-heading" className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">{t('labs.commonHeading')}</h2>
          <div className="grid gap-4">
            {shared.map((tool) => (
              <ToolCard key={tool.id} tool={tool} variant="wide" locked={isLocked(tool)} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-8" aria-labelledby="ml-labs-heading" data-ml-lab-choices>
        <h2 id="ml-labs-heading" className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-1">{t('labs.heading')}</h2>
        <p className="font-inter text-slate-500 text-xs mb-3">{t('labs.hint')}</p>
        <div className="sa-ml-labs">
          {LAB_SCOPES.map((scope) => (
            <LabChoiceCard
              key={scope}
              scope={scope}
              to={labHomePath(labRoot, scope)}
              tools={toolsForScope(tools, scope)}
              onChoose={() => rememberLabScope(scope)}
            />
          ))}
        </div>
      </section>

      {PLANNED_MATH_LAB_TOOLS.length > 0 && (
        <section className="mb-8" aria-labelledby="ml-planned-heading">
          <h2 id="ml-planned-heading" className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-1">{t('plannedHeading')}</h2>
          <p className="font-inter text-slate-500 text-xs mb-3">{t('plannedHint')}</p>
          <ul className="sa-ml-planned" data-ml-planned>
            {PLANNED_MATH_LAB_TOOLS.map((tool) => {
              const Icon = tool.icon;

              return (
                <li key={tool.id} className="sa-ml-planned__item" aria-disabled="true">
                  <Icon size={15} aria-hidden="true" />
                  <span>{t(tool.labelKey)}</span>
                  <span className="sa-ml-planned__badge">{t('comingSoon')}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <WorkSection labRoot={labRoot} tools={tools} documents={documents} />
    </div>
  );
}

/**
 * L'accueil d'UN مخبر : ses instruments seulement. Un instrument partagé
 * (راسم الدوال, الجبر…) y figure une fois, ouvert dans ce مخبر — c'est lui
 * qui décide alors de ce qu'il montre (`capabilities`).
 */
function LabHome({ scope }) {
  const { t } = useTranslation('mathlab');
  const name = t(`labs.${scope}.name`);
  useDocumentMeta(`${name} — ${t('metaTitle')}`, t(`labs.${scope}.description`));
  const labRoot = mathLabBasePath(useWorkspaceBase());
  const { tools, isLocked, documents } = useLabAccess();
  const labTools = toolsForScope(tools, scope);
  const shared = commonTools(tools);
  const { icon: LabIcon } = LAB_META[scope];

  // Entrer dans un مخبر, c'est le choisir : le prochain instrument partagé
  // ouvert sans `?lab=` (un lien nu) s'ouvrira ici.
  useEffect(() => { rememberLabScope(scope); }, [scope]);

  return (
    <div className={`sa-page py-8 sm:py-10 sa-ml-labpage sa-ml-labpage--${scope}`} data-ml-home data-ml-home-view="lab" data-ml-lab={scope}>
      <Link to={labRoot} className="sa-ml-labpage__back" data-ml-lab-back>
        <ArrowBack size={15} aria-hidden="true" /> {t('labs.backToLab')}
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono-jetbrains text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5 sa-ml-labpage__eyebrow">
            <LabIcon size={13} aria-hidden="true" /> {t('eyebrow')} · {t(`labs.${scope}.grades`)}
          </p>
          <h1 className="font-space font-bold text-2xl sm:text-3xl text-slate-900">{name}</h1>
          <p className="font-inter text-slate-500 text-sm mt-1 max-w-2xl">{t(`labs.${scope}.description`)}</p>
        </div>
        <LabSwitch current={scope} labRoot={labRoot} />
      </div>

      <section className="mb-8" aria-labelledby="ml-tools-heading">
        <h2 id="ml-tools-heading" className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">{t(`labs.${scope}.toolsHeading`)}</h2>
        <div className="sa-ml-cards" data-ml-lab-tools={scope}>
          {labTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} scope={scope} locked={isLocked(tool)} />
          ))}
        </div>
      </section>

      {shared.length > 0 && (
        <section className="mb-8" aria-labelledby="ml-common-heading" data-ml-common-tools>
          <h2 id="ml-common-heading" className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-3">{t('labs.commonHeading')}</h2>
          <div className="grid gap-4">
            {shared.map((tool) => (
              <ToolCard key={tool.id} tool={tool} variant="wide" locked={isLocked(tool)} />
            ))}
          </div>
        </section>
      )}

      <WorkSection labRoot={labRoot} tools={tools} documents={documents} scope={scope} />
    </div>
  );
}

/** Passer d'un مخبر à l'autre sans repasser par l'accueil : deux onglets-liens. */
function LabSwitch({ current, labRoot }) {
  const { t } = useTranslation('mathlab');

  return (
    <nav className="sa-ml-labswitch" aria-label={t('labs.switchLabel')} data-ml-lab-switch>
      {LAB_SCOPES.map((scope) => {
        const { icon: Icon } = LAB_META[scope];
        const active = scope === current;

        return (
          <Link
            key={scope}
            to={labHomePath(labRoot, scope)}
            className={`sa-ml-labswitch__item sa-ml-labswitch__item--${scope}`}
            aria-current={active ? 'page' : undefined}
            data-ml-lab-switch-item={scope}
          >
            <Icon size={15} aria-hidden="true" />
            {t(`labs.${scope}.short`)}
          </Link>
        );
      })}
    </nav>
  );
}

function WorkSection({ labRoot, tools, documents, scope = null }) {
  const { t } = useTranslation('mathlab');

  return (
    <section aria-labelledby="ml-work-heading" data-tour="mathlab.works">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
        <div>
          <h2 id="ml-work-heading" className="font-space font-bold text-slate-400 text-xs uppercase tracking-widest mb-1">{t('myWork')}</h2>
          <p className="font-inter text-slate-500 text-xs">{scope ? t('labs.myWorkHint', { name: t(`labs.${scope}.name`) }) : t('myWorkHint')}</p>
          {documents.quota && <QuotaMeter quota={documents.quota} className="mt-2" />}
        </div>
        <NewWorkMenu labRoot={labRoot} tools={tools} scope={scope} />
      </div>
      <MyWorkSpace labRoot={labRoot} initialLab={scope ?? 'all'} />
    </section>
  );
}
