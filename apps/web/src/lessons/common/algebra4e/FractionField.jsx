import React, { useState } from 'react';
import { Feedback, ValidateButton } from '../components/LessonUI';
import { useKit } from '../kit';
import FractionView from './FractionView';
import { rat, ratEq } from './exprCore';

/**
 * FractionField — saisir une fraction RELATIVE, jamais en texte brut.
 *
 * Une fraction se compose de deux nombres empilés autour d'une barre. Un
 * champ texte unique obligerait l'élève à taper « 3/4 », c'est-à-dire à
 * écrire une division là où on veut qu'il pense « trois parts sur quatre »,
 * et ouvrirait la porte à toutes les saisies invalides. Deux champs
 * numériques disposés COMME la fraction règlent les deux problèmes et
 * gardent le clavier numérique sur mobile.
 *
 * Ce composant généralise le `FractionInput` de la 5e (positif seulement)
 * au rationnel RELATIF que la 4e enseigne : un bouton de signe, séparé des
 * chiffres, plutôt qu'un moins à taper — l'élève choisit un signe, il ne
 * saisit pas une syntaxe.
 *
 * Politique de question du kit (LESSON_INTEGRATION_GUIDE §6), appliquée par
 * construction et impossible à contourner depuis un module :
 *   — une validation = la réponse, révélation immédiate ;
 *   — `onAnswered(isCorrect)` est TOUJOURS appelé, jamais conditionné à la
 *     justesse : l'élève n'est jamais bloqué ;
 *   — en cas d'erreur, sa réponse, la bonne réponse et l'explication ciblée
 *     s'affichent — pas de boucle « Réessayer ».
 *
 * `expected` accepte toute écriture ÉGALE (3/4 comme 6/8), sauf quand
 * `formeIrreductible` est demandée : c'est ce qui permet à un module
 * « simplifie » d'exiger la forme la plus simple sans changer de composant.
 */
export default function FractionField({
  prompt,
  above,
  expected,                    // rationnel {n, d} attendu
  formeIrreductible = false,   // exiger l'écriture la plus simple
  allowNegative = true,
  explain,
  explainFor,                  // ({n, d}) => ReactNode — retour ciblé
  requires,                    // string[] — contrat d'audit, sans effet runtime
  solved = false,
  onAnswered,                  // (isCorrect, {n, d}) => void — inconditionnel
}) {
  const { react } = useKit();
  const [num, setNum] = useState('');
  const [den, setDen] = useState('');
  const [neg, setNeg] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [saisie, setSaisie] = useState(null);

  const done = revealed || solved;

  const check = () => {
    const n = parseInt(num, 10);
    const d = parseInt(den, 10);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return;
    const signed = { n: neg ? -n : n, d };
    // La forme irréductible se juge sur l'ÉCRITURE, l'égalité sur la VALEUR.
    const reduced = rat(signed.n, signed.d);
    const ok = formeIrreductible
      ? reduced.n === signed.n && reduced.d === signed.d && ratEq(reduced, expected)
      : ratEq(reduced, expected);
    setSaisie(signed);
    setWasCorrect(ok);
    setRevealed(true);
    react(ok);
    onAnswered?.(ok, signed);
  };

  const champ = (value, onChange, aria) => (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
      onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
      aria-label={aria}
      className="h-11 w-16 rounded-lg border-2 border-slate-300 text-center font-mono text-lg font-bold text-slate-800 focus:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    />
  );

  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm font-semibold text-slate-700">{prompt}</p>}
      {typeof above === 'function' ? above(done) : above}

      {!done ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {allowNegative && (
            <button
              type="button"
              onClick={() => setNeg((v) => !v)}
              aria-pressed={neg}
              aria-label={neg ? 'Nombre négatif — appuyer pour le rendre positif' : 'Nombre positif — appuyer pour le rendre négatif'}
              className={`min-h-[44px] min-w-[52px] rounded-xl border-2 text-xl font-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                neg
                  ? 'border-rose-500 bg-rose-500 text-white'
                  : 'border-slate-300 bg-white text-slate-500 hover:border-slate-500'
              }`}
            >
              {neg ? '−' : '+'}
            </button>
          )}

          {/* Les deux champs empilés autour de la barre : la disposition dit
              déjà ce qu'est un numérateur et ce qu'est un dénominateur. */}
          <div className="flex flex-col items-center gap-1">
            {champ(num, setNum, 'Numérateur — le nombre de parts prises')}
            <span className="w-16 border-t-[3px] border-slate-800" aria-hidden="true" />
            {champ(den, setDen, 'Dénominateur — en combien de parts on a coupé')}
          </div>

          <ValidateButton onClick={check} disabled={num === '' || den === '' || den === '0'}>
            OK
          </ValidateButton>
        </div>
      ) : (
        <Feedback tone={revealed && !wasCorrect ? 'ko' : 'ok'}>
          {revealed && !wasCorrect && saisie && (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              Ta réponse : <FractionView value={saisie} size="sm" tone="rose" />. Bonne réponse :
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            {' '}<FractionView value={expected} size="sm" tone="emerald" showIntegerAsFraction={false} />{' — '}
          </span>
          {revealed && !wasCorrect && explainFor && saisie ? explainFor(saisie) : explain}
        </Feedback>
      )}
    </div>
  );
}
