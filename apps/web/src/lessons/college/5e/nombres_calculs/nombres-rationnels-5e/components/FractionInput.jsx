import React, { useState } from 'react';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { useKit } from '../../../../../common/kit';
import { frac, memeNombre, texte, parseEntier } from './rationnels';

/**
 * FractionInput — saisir une fraction, jamais en texte brut.
 *
 * Une fraction se compose de DEUX nombres, empilés autour d'une barre. Un
 * champ texte unique obligerait l'élève à taper « 3/4 », c'est-à-dire à écrire
 * une division là où on veut qu'il pense « trois parts sur quatre » — et
 * ouvrirait la porte à toutes les saisies invalides. Deux champs numériques
 * disposés comme la fraction elle-même règlent les deux problèmes à la fois,
 * et gardent le clavier numérique sur mobile.
 *
 * Politique de question du kit (LESSON_INTEGRATION_GUIDE §6), appliquée ici
 * comme dans les trois composants de question :
 *   — une validation = la réponse : révélation immédiate ;
 *   — `onAnswered(isCorrect)` est TOUJOURS appelé, jamais conditionné à la
 *     justesse — l'élève n'est jamais bloqué ;
 *   — en cas d'erreur, sa réponse, la bonne réponse et l'explication ciblée
 *     sont affichées.
 *
 * `expected` accepte toute écriture ÉGALE à la fraction attendue (3/4 et 6/8
 * sont acceptés tous les deux), sauf si `formeExacte` est demandée — c'est ce
 * qui permet au module « simplifier » d'exiger la forme la plus simple.
 */
export default function FractionInput({
  prompt,
  above,
  expected,               // { num, den }
  formeExacte = false,    // exiger exactement cette écriture-là
  explain,
  explainFor,             // ({num, den}) => ReactNode — retour ciblé
  requires,               // string[] — contrat d'audit, sans effet runtime
  solved = false,
  onAnswered,             // (isCorrect, {num, den}) => void — inconditionnel
}) {
  const { react } = useKit();
  const [n, setN] = useState('');
  const [d, setD] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [saisie, setSaisie] = useState(null);

  const done = revealed || solved;

  const check = () => {
    const num = parseEntier(n);
    const den = parseEntier(d);
    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return;
    const rep = { num, den };
    const ok = formeExacte
      ? num === expected.num && den === expected.den
      : memeNombre(rep, expected);
    setSaisie(rep);
    setWasCorrect(ok);
    setRevealed(true);
    react(ok);
    onAnswered?.(ok, rep);
  };

  const champ = (value, onChange, aria) => (
    <input
      type="text"
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
      onKeyDown={(e) => { if (e.key === 'Enter') check(); }}
      aria-label={aria}
      className="w-16 h-11 text-center rounded-lg border-2 border-slate-300 font-mono text-lg font-bold text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-indigo-500"
    />
  );

  return (
    <div className="space-y-3">
      {prompt && <p className="text-sm font-semibold text-slate-700">{prompt}</p>}
      {typeof above === 'function' ? above(done) : above}

      {!done ? (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* Les deux champs empilés autour de la barre : la disposition dit
              déjà ce qu'est un numérateur et ce qu'est un dénominateur. */}
          <div className="flex flex-col items-center gap-1">
            {champ(n, setN, 'Numérateur — le nombre de parts prises')}
            <span className="w-16 border-t-[3px] border-slate-800" />
            {champ(d, setD, 'Dénominateur — en combien de parts on a coupé')}
          </div>
          <ValidateButton onClick={check} disabled={n === '' || d === ''}>
            OK
          </ValidateButton>
        </div>
      ) : (
        <Feedback tone={revealed && !wasCorrect ? 'ko' : 'ok'}>
          {revealed && !wasCorrect && saisie && (
            <>
              Ta réponse : <strong className="font-mono">{texte(saisie)}</strong>. Bonne réponse :{' '}
            </>
          )}
          <strong className="font-mono">{texte(expected)}</strong>
          {' — '}
          {revealed && !wasCorrect && explainFor && saisie ? explainFor(saisie) : explain}
        </Feedback>
      )}
    </div>
  );
}
