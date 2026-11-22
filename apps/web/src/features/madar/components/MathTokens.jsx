import { plain } from '../sniper/cards';

/**
 * Une expression de « قنّاص القيم » écrite en DOM (la cible de l'affichage, le
 * bilan) : fractions superposées, racine avec sa barre, exposants. Toujours
 * en `dir="ltr"` ; le texte plat sert aux lecteurs d'écran.
 */
export default function MathTokens({ tokens, className = '' }) {
  if (!tokens) return null;
  return (
    <span className={`inline-flex items-center whitespace-nowrap ${className}`} dir="ltr" role="math" aria-label={plain(tokens)}>
      {tokens.map((t, i) => {
        const key = `${i}-${typeof t === 'string' ? t : JSON.stringify(t)}`;
        if (typeof t === 'string') return <span key={key} className="whitespace-pre">{t}</span>;
        if (t.frac) {
          return (
            <span key={key} className="mx-0.5 inline-flex flex-col items-center align-middle text-[0.72em] leading-none" aria-hidden="true">
              <span className="border-b-2 border-current px-1 pb-0.5">{t.frac[0]}</span>
              <span className="px-1 pt-0.5">{t.frac[1]}</span>
            </span>
          );
        }
        if (t.sqrt) {
          return (
            <span key={key} className="inline-flex items-start" aria-hidden="true">
              <span className="-me-px">√</span>
              <span className="mt-[0.12em] border-t-2 border-current px-0.5 leading-[1.05]">{t.sqrt}</span>
            </span>
          );
        }
        return <sup key={key} className="text-[0.62em]" aria-hidden="true">{t.sup}</sup>;
      })}
    </span>
  );
}
