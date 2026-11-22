import { useMemo } from 'react';
import { renderNoteHtml } from './noteContent';
import './notebook.css';

/**
 * Une note ENREGISTRÉE, prête à lire : désinfectée, mathématiques dessinées.
 *
 * Seul point du dépôt où le contenu d'une note passe par innerHTML — et il
 * ne reçoit jamais la chaîne de la base telle quelle : `renderNoteHtml` la
 * réduit d'abord à la liste blanche de l'éditeur, puis dessine les `$…$`.
 * Les anciennes notes en texte brut passent par le même chemin (mises en
 * paragraphes), donc un seul composant sert les deux formats.
 */
export default function NotebookContent({ content, className = '' }) {
  const html = useMemo(() => renderNoteHtml(content ?? ''), [content]);

  // eslint-disable-next-line react/no-danger
  return <div className={`sa-nb-content ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
