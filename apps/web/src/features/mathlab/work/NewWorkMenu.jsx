import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { MATH_LAB_TOOLS } from '../toolRegistry';
import { mathLabToolPath } from '../mathLabDocument';
import { LAB_SCOPES, commonTools, toolsForScope } from '../labScope';

/**
 * « + عمل جديد » : choisir l'instrument, puis commencer. Les instruments
 * offerts sont ceux du REGISTRE (§5) — jamais une liste écrite à la main,
 * jamais un instrument annoncé mais pas construit.
 *
 * Rangés comme l'accueil (MATH_LAB.md §2.1) : la سبّورة « للجميع », puis
 * chaque مخبر et ses instruments, chaque lien ouvrant l'instrument DANS ce
 * مخبر (`?lab=`). Sur l'accueil d'un مخبر (`scope`), seulement la سبّورة et
 * les instruments de ce مخبر.
 *
 * Le menu s'ouvre SOUS le bouton et se replie au clic ailleurs ou à Échap ;
 * en RTL il s'aligne sur le bord de départ, donc il ne sort jamais de
 * l'écran (`inset-inline-start: 0`, voir mathlabWork.css).
 */
export default function NewWorkMenu({ labRoot, tools = null, scope = null }) {
  const { t } = useTranslation('mathlab');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const available = tools ?? MATH_LAB_TOOLS;
  const groups = [
    { id: 'common', label: t('work.newGroupCommon'), scope: null, tools: commonTools(available) },
    ...(scope ? [scope] : LAB_SCOPES).map((lab) => ({
      id: lab, label: t(`labs.${lab}.name`), scope: lab, tools: toolsForScope(available, lab),
    })),
  ].filter((group) => group.tools.length > 0);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="sa-mlw-menu-anchor">
      <button
        type="button"
        className="sa-mlw-btn sa-mlw-btn--primary"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        data-ml-work-new
      >
        <Plus size={18} aria-hidden="true" /> {t('work.newWork')}
      </button>
      {open && (
        <div className="sa-mlw-menu sa-mlw-menu--wide" role="menu" aria-label={t('work.newWork')} data-ml-work-new-menu>
          {groups.map((group) => (
            <div key={group.id} role="group" aria-labelledby={`mlw-new-${group.id}`} className="sa-mlw-menu__group" data-ml-work-new-group={group.id}>
              <p id={`mlw-new-${group.id}`} className="sa-mlw-menu__grouplabel" role="presentation">{group.label}</p>
              {group.tools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Link
                    key={`${group.id}-${tool.id}`}
                    to={mathLabToolPath(tool, null, labRoot, group.scope)}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    data-ml-work-new-tool={tool.id}
                    data-ml-work-new-lab={group.scope ?? 'common'}
                  >
                    <Icon size={16} aria-hidden="true" /> {t(tool.labelKey)}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
