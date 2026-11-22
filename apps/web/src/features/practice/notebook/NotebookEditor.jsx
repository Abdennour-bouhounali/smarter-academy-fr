import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { isEmptyContent, plainTextToHtml, sanitizeHtml } from './noteContent';

/**
 * La page du cahier où l'élève écrit : un `contentEditable`, rien de plus.
 *
 * Pourquoi pas un éditeur tiers : le besoin est celui d'un cahier — gras,
 * listes, une couleur, une formule en clair — et `document.execCommand`
 * le couvre dans tous les navigateurs que sert la plateforme, sans ajouter
 * une dépendance de plusieurs centaines de kilo-octets au paquet initial.
 * Le HTML qu'il produit n'est jamais pris pour acquis : `sanitizeHtml` le
 * réduit à la liste blanche à l'entrée (collage), à l'enregistrement et au
 * rendu.
 *
 * L'éditeur est NON CONTRÔLÉ : React ne réécrit pas innerHTML à chaque
 * rendu (ce qui perdrait le curseur). Le parent lit le HTML par `onChange`
 * et ne le réinjecte que par `setHtml` (effacer, restaurer un brouillon).
 */
const NotebookEditor = forwardRef(function NotebookEditor({
  initialHtml, onChange, onStateChange, placeholder, ariaLabel, ariaDescribedBy, disabled = false,
}, ref) {
  const el = useRef(null);
  const [empty, setEmpty] = useState(true);

  const readState = useCallback(() => {
    if (typeof document === 'undefined' || !el.current) return;
    const sel = document.getSelection();
    if (!sel?.anchorNode || !el.current.contains(sel.anchorNode)) return;
    const q = (cmd) => {
      try { return document.queryCommandState(cmd); } catch { return false; }
    };
    let block = '';
    try { block = String(document.queryCommandValue('formatBlock') || '').toLowerCase(); } catch { /* ignoré */ }
    onStateChange?.({
      bold: q('bold'),
      italic: q('italic'),
      underline: q('underline'),
      ul: q('insertUnorderedList'),
      ol: q('insertOrderedList'),
      heading: /^h[1-3]$/.test(block),
    });
  }, [onStateChange]);

  const emit = useCallback(() => {
    if (!el.current) return;
    const html = el.current.innerHTML;
    setEmpty(isEmptyContent(html));
    onChange?.(html);
  }, [onChange]);

  const setHtml = useCallback((html) => {
    if (!el.current) return;
    el.current.innerHTML = html && !isEmptyContent(html) ? html : '<p><br></p>';
    setEmpty(isEmptyContent(el.current.innerHTML));
  }, []);

  const placeCaretAtEnd = useCallback(() => {
    if (!el.current) return;
    el.current.focus();
    const range = document.createRange();
    range.selectNodeContents(el.current);
    range.collapse(false);
    const sel = document.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  const exec = useCallback((cmd, value = null) => {
    if (!el.current || disabled) return;
    el.current.focus();

    if (cmd === 'insertMath') {
      // « $ $ » autour de la sélection, ou une paire vide avec le curseur
      // dedans : la formule s'écrit en clair, elle sera dessinée au rendu.
      // Dans un <span dir="ltr"> : une formule brute posée dans un paragraphe
      // arabe se lit sinon dans le désordre (le bidi réordonne « = », « ( »,
      // les chiffres). Le rendu, lui, isole déjà chaque formule en LTR.
      const sel = document.getSelection();
      const selected = (sel?.toString() ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
      document.execCommand('insertHTML', false, `<span dir="ltr">$${selected}$</span>&nbsp;`);
      // Le curseur est après l'espace ; sans sélection, on le ramène entre
      // les deux « $ » pour que l'élève tape directement sa formule.
      const s = document.getSelection();
      if (!selected && s?.rangeCount) {
        const r = s.getRangeAt(0);
        const node = r.startContainer;
        const span = node.nodeType === Node.TEXT_NODE ? node.previousSibling : node.childNodes[r.startOffset - 1]?.previousSibling;
        if (span?.tagName === 'SPAN' && span.firstChild) {
          const inside = document.createRange();
          inside.setStart(span.firstChild, span.firstChild.length - 1);
          inside.collapse(true);
          s.removeAllRanges();
          s.addRange(inside);
        }
      }
      emit();
      return;
    }

    if (cmd === 'fontSizeStep') {
      // execCommand ne connaît que 1..7 ; on lit la taille courante et on
      // avance d'un cran, bornes comprises. 3 = taille normale.
      let current = 3;
      try { current = Number(document.queryCommandValue('fontSize')) || 3; } catch { /* ignoré */ }
      const next = Math.min(7, Math.max(1, current + value));
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('fontSize', false, String(next));
      emit();
      readState();
      return;
    }

    // Couleurs en `style` plutôt qu'en <font> : c'est ce que la liste
    // blanche conserve tel quel.
    document.execCommand('styleWithCSS', false, cmd === 'foreColor' || cmd === 'hiliteColor');
    document.execCommand(cmd, false, value);
    emit();
    readState();
  }, [disabled, emit, readState]);

  useImperativeHandle(ref, () => ({
    setHtml,
    getHtml: () => el.current?.innerHTML ?? '',
    focus: placeCaretAtEnd,
    exec,
  }), [setHtml, placeCaretAtEnd, exec]);

  // Contenu initial — et seulement lui : les changements suivants passent
  // par la ref, jamais par un nouveau rendu.
  useEffect(() => {
    setHtml(initialHtml ?? '');
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch { /* ignoré */ }
  }, [initialHtml, setHtml]);

  useEffect(() => {
    document.addEventListener('selectionchange', readState);

    return () => document.removeEventListener('selectionchange', readState);
  }, [readState]);

  const onPaste = (e) => {
    // Un collage arrive avec les styles de sa source (Word, une page web…) :
    // on ne garde que ce que le cahier sait écrire lui-même.
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    const clean = html ? sanitizeHtml(html) : plainTextToHtml(text);
    document.execCommand('insertHTML', false, clean);
    emit();
  };

  const onKeyDown = (e) => {
    // Raccourcis du cahier, les mêmes qu'ailleurs : Ctrl/⌘ + B, I, U.
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const key = e.key.toLowerCase();
    if (key === 'b') { e.preventDefault(); exec('bold'); }
    if (key === 'i') { e.preventDefault(); exec('italic'); }
    if (key === 'u') { e.preventDefault(); exec('underline'); }
  };

  return (
    <div
      ref={el}
      className="sa-nb-editor"
      contentEditable={!disabled}
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-empty={empty}
      data-placeholder={placeholder}
      spellCheck
      onInput={emit}
      onBlur={emit}
      onPaste={onPaste}
      onKeyDown={onKeyDown}
      onKeyUp={readState}
      onMouseUp={readState}
    />
  );
});

export default NotebookEditor;
