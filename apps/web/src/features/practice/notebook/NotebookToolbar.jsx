import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bold, Italic, Underline, Heading2, List, ListOrdered, Palette, Highlighter,
  Radical, Undo2, Redo2, Eye, PenLine, Ellipsis, AArrowUp, AArrowDown,
} from 'lucide-react';

/**
 * Les outils du cahier — ceux d'un élève, pas d'un traitement de texte.
 *
 * Une rangée principale (gras, italique, souligné, listes, couleurs) toujours
 * visible ; une rangée secondaire (titre, taille, formule, annuler/rétablir,
 * aperçu) repliée derrière « ⋯ » sur téléphone et dépliée dès 640px. Les
 * nuanciers s'ouvrent EN RANGÉE dans la fenêtre, jamais en menu flottant :
 * rien ne peut passer sous le cahier ni sortir de l'écran.
 *
 * Chaque bouton : 44px, `title` + `aria-label`, état actif visible
 * (`aria-pressed`), utilisable au clavier et au doigt.
 */
const TEXT_COLORS = [
  { id: 'default', value: '#1e293b' },
  { id: 'red', value: '#dc2626' },
  { id: 'blue', value: '#2563eb' },
  { id: 'green', value: '#059669' },
  { id: 'purple', value: '#7c3aed' },
  { id: 'orange', value: '#ea580c' },
];
const HIGHLIGHTS = [
  { id: 'yellow', value: '#fef08a' },
  { id: 'green', value: '#bbf7d0' },
  { id: 'blue', value: '#bfdbfe' },
  { id: 'pink', value: '#fbcfe8' },
];

function Tool({ label, onClick, pressed, disabled, children, className = '' }) {
  return (
    <button
      type="button"
      className={`sa-nb-tool ${className}`}
      title={label}
      aria-label={label}
      aria-pressed={pressed === undefined ? undefined : pressed}
      disabled={disabled}
      // onMouseDown + preventDefault : le clic ne doit pas voler la sélection
      // de l'éditeur, sinon la commande s'applique à rien.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function NotebookToolbar({ exec, state, preview, onTogglePreview, disabled }) {
  const { t } = useTranslation('student');
  const [palette, setPalette] = useState(null); // 'color' | 'highlight' | null
  const [more, setMore] = useState(false);
  const tb = (key) => t(`notebook.toolbar.${key}`);

  const togglePalette = (which) => setPalette((p) => (p === which ? null : which));
  const pick = (cmd, value) => {
    exec(cmd, value);
    setPalette(null);
  };

  const icon = { size: 20, strokeWidth: 2.25, 'aria-hidden': true };
  const off = disabled || preview;

  return (
    <div className="sa-nb-toolbar" role="toolbar" aria-label={tb('label')} data-more={more}>
      {palette === 'color' && (
        <div className="sa-nb-palette" role="group" aria-label={tb('textColor')}>
          {TEXT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="sa-nb-swatch"
              title={tb(`colors.${c.id}`)}
              aria-label={tb(`colors.${c.id}`)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick('foreColor', c.value)}
            >
              <span style={{ background: c.value }} />
            </button>
          ))}
        </div>
      )}
      {palette === 'highlight' && (
        <div className="sa-nb-palette" role="group" aria-label={tb('highlight')}>
          {HIGHLIGHTS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="sa-nb-swatch"
              title={tb(`highlights.${c.id}`)}
              aria-label={tb(`highlights.${c.id}`)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick('hiliteColor', c.value)}
            >
              <span style={{ background: c.value }} />
            </button>
          ))}
          <button
            type="button"
            className="sa-nb-swatch sa-nb-swatch--none"
            title={tb('noColor')}
            aria-label={tb('noColor')}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick('hiliteColor', 'transparent')}
          >
            <span />
          </button>
        </div>
      )}

      <div className="sa-nb-tools-row">
        <Tool label={tb('bold')} pressed={!!state.bold} disabled={off} onClick={() => exec('bold')}><Bold {...icon} /></Tool>
        <Tool label={tb('italic')} pressed={!!state.italic} disabled={off} onClick={() => exec('italic')}><Italic {...icon} /></Tool>
        <Tool label={tb('underline')} pressed={!!state.underline} disabled={off} onClick={() => exec('underline')}><Underline {...icon} /></Tool>
        <span className="sa-nb-sep" aria-hidden="true" />
        <Tool label={tb('bullets')} pressed={!!state.ul} disabled={off} onClick={() => exec('insertUnorderedList')}><List {...icon} /></Tool>
        <Tool label={tb('numbered')} pressed={!!state.ol} disabled={off} onClick={() => exec('insertOrderedList')}><ListOrdered {...icon} /></Tool>
        <span className="sa-nb-sep" aria-hidden="true" />
        <button
          type="button"
          className="sa-nb-tool"
          title={tb('textColor')}
          aria-label={tb('textColor')}
          aria-expanded={palette === 'color'}
          disabled={off}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => togglePalette('color')}
        >
          <Palette {...icon} />
        </button>
        <button
          type="button"
          className="sa-nb-tool"
          title={tb('highlight')}
          aria-label={tb('highlight')}
          aria-expanded={palette === 'highlight'}
          disabled={off}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => togglePalette('highlight')}
        >
          <Highlighter {...icon} />
        </button>

        <button
          type="button"
          className="sa-nb-tool sa-nb-more"
          title={more ? tb('lessTools') : tb('moreTools')}
          aria-label={more ? tb('lessTools') : tb('moreTools')}
          aria-expanded={more}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setMore((m) => !m)}
        >
          <Ellipsis {...icon} />
        </button>

        <div className="sa-nb-tools-row sa-nb-tools-secondary">
          <span className="sa-nb-sep" aria-hidden="true" />
          <Tool label={tb('heading')} pressed={!!state.heading} disabled={off} onClick={() => exec('formatBlock', state.heading ? 'p' : 'h2')}><Heading2 {...icon} /></Tool>
          <Tool label={tb('bigger')} disabled={off} onClick={() => exec('fontSizeStep', 1)}><AArrowUp {...icon} /></Tool>
          <Tool label={tb('smaller')} disabled={off} onClick={() => exec('fontSizeStep', -1)}><AArrowDown {...icon} /></Tool>
          <Tool label={`${tb('math')} — ${t('notebook.window.mathHint')}`} disabled={off} onClick={() => exec('insertMath')}><Radical {...icon} /></Tool>
          <span className="sa-nb-sep" aria-hidden="true" />
          <Tool label={tb('undo')} disabled={off} onClick={() => exec('undo')}><Undo2 {...icon} /></Tool>
          <Tool label={tb('redo')} disabled={off} onClick={() => exec('redo')}><Redo2 {...icon} /></Tool>
          <span className="sa-nb-sep" aria-hidden="true" />
          <Tool label={preview ? tb('write') : tb('preview')} pressed={preview} disabled={disabled} onClick={onTogglePreview}>
            {preview ? <PenLine {...icon} /> : <Eye {...icon} />}
          </Tool>
        </div>
      </div>
    </div>
  );
}
