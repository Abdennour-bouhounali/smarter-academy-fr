import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Star, Copy, Trash2, EllipsisVertical, PencilLine, FileText, TriangleAlert,
} from 'lucide-react';
import { getMathLabTool } from '../toolRegistry';
import { mathLabToolPath } from '../mathLabDocument';
import { workLabScope } from '../labScope';
import WorkPreview from './WorkPreview';
import { timeAgo } from '../../practice/notebook/space/noteMeta';

/**
 * UN travail dans « أعمالي ». La même carte sert la grille et la liste : une
 * seule structure, deux mises en page (`data-view`), pour qu'un geste corrigé
 * le soit dans les deux (§13).
 *
 * Ce qu'elle dit, dans cet ordre : ce que c'est (l'aperçu), comment ça
 * s'appelle, avec QUEL instrument, et QUAND. Les gestes de rangement vivent
 * dans le menu « ⋮ » — jamais cinq boutons sur chaque carte (§17).
 *
 * Un document dont l'instrument n'est plus au registre reste VISIBLE mais ne
 * s'ouvre pas : on ne fait pas disparaître le travail d'un élève parce qu'un
 * outil a été retiré.
 *
 * ── Les crochets de recette ──────────────────────────────────────────────
 * La carte porte `data-ml-work` (l'atelier) ET `data-ml-doc` (historique).
 * Le second, avec `data-ml-doc-open` et `data-ml-doc-delete`, est ce par
 * quoi les scripts de recette de TOUS les instruments (mathlab.mjs,
 * mathlab-grapher.mjs, mathlab-geometry3d.mjs…) désignent « le document
 * n° N » après l'avoir enregistré. Il survit au remplacement de
 * `DocumentList` par l'atelier : c'est le nom juste pour « un document », et
 * le renommer aurait cassé cinq scripts de recette sans rien apporter.
 *
 * @param {(action: 'rename'|'duplicate'|'favorite'|'delete', work: object) => void} onAction
 */
export default function WorkCard({ work, view = 'grid', selected = false, selectionMode = false, onToggleSelect, onAction, labRoot }) {
  const { t } = useTranslation('mathlab');
  const c = (key, opts) => t(`work.card.${key}`, opts);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const tool = getMathLabTool(work.tool);
  const Icon = tool?.icon ?? FileText;
  const toolName = tool ? t(tool.labelKey) : work.tool;
  const title = work.title || t('untitled');
  const to = tool ? mathLabToolPath(tool, work.id, labRoot) : null;
  // Le مخبر où le travail est né (son résumé), ou celui de son instrument.
  const lab = workLabScope(work, tool);
  const titleId = `mlw-${work.id}-title`;

  // Le menu se ferme au clic ailleurs et à Échap — sans piéger le focus,
  // comme celui du cahier (NoteCard).
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDown = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const act = (action) => {
    setMenuOpen(false);
    onAction?.(action, work);
  };

  return (
    <article
      className="sa-mlw-card"
      data-view={view}
      data-selected={selected}
      data-favorite={work.isFavorite || undefined}
      data-ml-work={work.id}
      data-ml-doc={work.id}
      aria-labelledby={titleId}
    >
      {/* La case à cocher : toujours dans le DOM (le lecteur d'écran la
          trouve), visible dès qu'on sélectionne ou qu'on survole. */}
      <label className="sa-mlw-check-label" data-armed={selectionMode || selected || undefined}>
        <input
          type="checkbox"
          className="sa-mlw-check"
          checked={selected}
          onChange={() => onToggleSelect?.(work)}
          aria-label={c('select', { title })}
          data-ml-work-check
        />
      </label>

      {/* L'aperçu — et c'est lui qui ouvre : la plus grande cible de la carte. */}
      {to ? (
        <Link to={to} className="sa-mlw-preview" tabIndex={-1} aria-hidden="true" data-ml-work-preview>
          <WorkPreview work={work} icon={Icon} />
        </Link>
      ) : (
        <span className="sa-mlw-preview" aria-hidden="true" data-ml-work-preview>
          <WorkPreview work={work} icon={Icon} />
        </span>
      )}

      <div className="sa-mlw-body">
        <h3 id={titleId} className="sa-mlw-title">
          {to ? (
            <Link to={to} aria-label={t('openDocument', { title })} data-ml-work-open data-ml-doc-open>{title}</Link>
          ) : (
            <span data-ml-work-orphan>{title}</span>
          )}
        </h3>

        <p className="sa-mlw-meta">
          <span className="sa-mlw-tool"><Icon size={13} aria-hidden="true" /> {toolName}</span>
          {lab && (
            <span className={`sa-ml-scope-badge sa-ml-scope-badge--${lab}`} data-ml-work-lab-badge={lab}>
              {t(`labs.${lab}.short`)}
            </span>
          )}
          {work.updatedAt && (
            <time dateTime={work.updatedAt} title={work.updatedAt} className="sa-mlw-time">
              {c('modified', { when: timeAgo(work.updatedAt) })}
            </time>
          )}
        </p>

        {!tool && (
          <p className="sa-mlw-orphan">
            <TriangleAlert size={13} aria-hidden="true" /> {c('unknownTool')}
          </p>
        )}
      </div>

      <div className="sa-mlw-actions">
        <button
          type="button"
          className="sa-mlw-btn sa-mlw-btn--icon"
          aria-pressed={work.isFavorite === true}
          aria-label={work.isFavorite ? c('unfavorite') : c('favorite')}
          title={work.isFavorite ? c('unfavorite') : c('favorite')}
          onClick={() => act('favorite')}
          data-ml-work-favorite
        >
          <Star size={17} aria-hidden="true" fill={work.isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div ref={menuRef} className="sa-mlw-menu-anchor">
          <button
            type="button"
            className="sa-mlw-btn sa-mlw-btn--icon"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={c('menu', { title })}
            title={c('menu', { title })}
            onClick={() => setMenuOpen((o) => !o)}
            data-ml-work-menu
          >
            <EllipsisVertical size={18} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div className="sa-mlw-menu" role="menu" aria-label={c('menu', { title })} data-ml-work-menu-panel>
              {to && (
                <Link to={to} role="menuitem" data-ml-work-menu-open>
                  <PencilLine size={16} aria-hidden="true" /> {c('open')}
                </Link>
              )}
              <button type="button" role="menuitem" onClick={() => act('rename')} data-ml-work-rename>
                <PencilLine size={16} aria-hidden="true" /> {c('rename')}
              </button>
              <button type="button" role="menuitem" onClick={() => act('duplicate')} data-ml-work-duplicate>
                <Copy size={16} aria-hidden="true" /> {c('duplicate')}
              </button>
              <button type="button" role="menuitem" onClick={() => act('favorite')}>
                <Star size={16} aria-hidden="true" fill={work.isFavorite ? 'currentColor' : 'none'} />
                {' '}{work.isFavorite ? c('unfavorite') : c('favorite')}
              </button>
              <button type="button" role="menuitem" data-danger onClick={() => act('delete')} data-ml-work-delete data-ml-doc-delete>
                <Trash2 size={16} aria-hidden="true" /> {c('delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
