import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowForward } from '../../../components/common/DirectionalIcons';
import { mathLabToolPath, mathLabBasePath } from '../mathLabDocument';
import { useWorkspaceBase } from '../../learning/learningViewer';
import { toolCapabilities } from '../labScope';
import { Lock, Users } from 'lucide-react';

/**
 * La carte d'un instrument DISPONIBLE : nom, ce qu'on y fait, et UN geste —
 * ouvrir un document neuf. Toute la carte est le lien : pas de zone morte
 * sous le doigt.
 *
 * `scope` : l’atelier dont la carte fait partie. Le lien l'emporte (`?lab=`),
 * et la description est celle que l'instrument déclare pour cet atelier
 * (`capabilities[scope].descriptionKey`) quand elle diffère — traceur de courbes
 * ne promet pas la tangente au collège.
 *
 * `variant="wide"` : le tableau, outil commun, en tête de l'accueil — une
 * carte couchée, avec sa pastille « Commun ».
 */
export default function ToolCard({ tool, locked = false, scope = null, variant = 'default' }) {
  const { t } = useTranslation('mathlab');
  const { t: ta } = useTranslation('access');
  const Icon = tool.icon;
  const root = mathLabBasePath(useWorkspaceBase());
  const descriptionKey = toolCapabilities(tool, scope)?.descriptionKey ?? tool.descriptionKey;
  const wide = variant === 'wide';

  return (
    <Link
      to={mathLabToolPath(tool, null, root, scope)}
      className={`group flex rounded-2xl border-2 border-slate-200 bg-white p-5 transition-colors hover:border-blue-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${wide ? 'sa-ml-card--wide flex-col gap-3 sm:flex-row sm:items-center sm:gap-5' : 'flex-col gap-3'}`}
      data-ml-tool-card={tool.id}
      data-ml-tool-scope={scope ?? 'common'}
      data-ml-tool-locked={locked ? 'true' : undefined}
      aria-label={locked ? `${t(tool.labelKey)} — ${ta('feature.lockedLabel')}` : undefined}
    >
      <span className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center justify-center rounded-xl bg-nav-accent-soft text-nav-accent ${wide ? 'h-14 w-14' : 'h-12 w-12'}`}>
          <Icon size={wide ? 28 : 24} aria-hidden="true" />
        </span>
        {locked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-inter text-[11px] font-bold text-amber-800">
            <Lock size={11} aria-hidden="true" /> {ta('feature.badgePremium')}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-space font-bold text-lg text-slate-900">{t(tool.labelKey)}</span>
          {wide && (
            <span className="sa-ml-common-badge" data-ml-common-badge>
              <Users size={12} aria-hidden="true" /> {t('labs.commonBadge')}
            </span>
          )}
        </span>
        <span className="block font-inter text-sm text-slate-500 mt-1">{t(descriptionKey)}</span>
      </span>
      <span className={`inline-flex items-center gap-1.5 font-mono-jetbrains text-xs font-bold text-nav-accent group-hover:text-nav-accent ${wide ? 'sm:flex-none' : 'mt-auto'}`}>
        {t(tool.newLabelKey)}
        <ArrowForward size={14} aria-hidden="true" />
      </span>
    </Link>
  );
}
