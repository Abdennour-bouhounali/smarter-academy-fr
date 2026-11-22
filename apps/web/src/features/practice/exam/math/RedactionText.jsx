import RichText from '../../RichText';

/**
 * Une rédaction ENREGISTRÉE, relue ligne par ligne, de gauche à droite : les
 * formules `$…$` rendues par KaTeX (RichText).
 */
export default function RedactionText({ text, className = '' }) {
  if (!text) return null;
  return (
    <div className={`space-y-0.5 ${className}`} data-redaction>
      {text.split('\n').map((line, i) => <p key={i}><RichText>{line}</RichText></p>)}
    </div>
  );
}
