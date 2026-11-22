import RichText from '../../RichText';

/**
 * Une rédaction ENREGISTRÉE, relue ligne par ligne : chaque ligne en sens
 * arabe, les formules `$…$` rendues par KaTeX et isolées en LTR (RichText).
 */
export default function RedactionText({ text, className = '' }) {
  if (!text) return null;
  return (
    <div dir="rtl" className={`space-y-0.5 ${className}`} data-redaction>
      {text.split('\n').map((line, i) => <p key={i}><RichText>{line}</RichText></p>)}
    </div>
  );
}
