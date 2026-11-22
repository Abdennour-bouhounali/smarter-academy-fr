import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { NotebookPen } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { useNotebook } from './NotebookProvider';
import { escapeHtml } from './noteContent';
import './notebook.css';

/**
 * « أضف إلى كرّاسي » — le pont EXPLICITE entre la carte des connaissances et
 * le cahier.
 *
 * La carte reste la représentation de la plateforme ; le cahier, celle de
 * l'élève. Rien ne passe de l'une à l'autre tout seul : c'est un geste, et
 * ce qu'il dépose (titre + résumé de la connaissance) est un DÉPART que
 * l'élève raccourcit, réécrit ou efface. La carte, elle, n'est jamais
 * modifiée par le cahier.
 *
 * Le contexte est la position courante (leçon, module, point) telle que la
 * coquille l'a publiée ; à défaut, la leçon de la carte. `sourceId` garde la
 * trace de la connaissance — côté client, pour le rendu ; le serveur ne
 * reçoit que les codes de leçon/module/point.
 *
 * @param {object} item         un item de LESSON_KNOWLEDGE ({ id, title, summary, type })
 * @param {string} [lessonCode] repli quand aucune position n'est publiée
 * @param {string} [categoryLabel] libellé arabe de la catégorie, pour l'étiquette
 */
export default function AddToNotebookButton({ item, lessonCode = null, categoryLabel = null, className = '' }) {
  const { t } = useTranslation('student');
  const { token } = useContext(AuthContext);
  const { location, openNotebook } = useNotebook();

  if (!token || !item?.title) return null;

  const add = () => {
    const label = [t('notebook.window.fromKnowledgeMap'), categoryLabel].filter(Boolean).join(' · ');
    const starterHtml = [
      '<section data-nb="knowledge">',
      `<p data-nb="label">${escapeHtml(label)}</p>`,
      `<p><strong>${escapeHtml(item.title)}</strong></p>`,
      item.summary ? `<p>${escapeHtml(item.summary)}</p>` : '',
      '</section>',
    ].join('');

    openNotebook({
      context: { ...(location ?? { lessonCode }), sourceType: 'knowledge_item', sourceId: item.id },
      starterHtml,
    });
  };

  return (
    <button
      type="button"
      className={`sa-nb-add ${className}`}
      onClick={add}
      aria-haspopup="dialog"
      title={t('notebook.window.addToNotebook')}
      data-nb-add={item.id}
    >
      <NotebookPen size={16} aria-hidden="true" />
      {t('notebook.window.addToNotebook')}
    </button>
  );
}
