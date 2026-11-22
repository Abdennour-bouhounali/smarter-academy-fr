import { useEffect, useId, useRef } from 'react';

/**
 * Le panneau de PRÉDICTION d'un labo joué dans le lecteur de mission (pilote 2026-11-07, étendu 2026-11-08) : même place que les
 * questions du labo (la colonne, sans voile), deux réponses d'un toucher. La prédiction est GRATUITE (le terrain répond) et compte
 * pour l'étoile « توقّعاتك كانت صحيحة ». `attr` : préfixe des attributs de test (`data-<attr>-predict`, `data-<attr>-predict-say`) —
 * « tb » pour team-builder, « fp » pour factor-pairs.
 *
 * Accessibilité (revue ECC 2026-11-10, leçon tawzif-khawass-judhur) : à son montage le panneau met le FOCUS sur sa question (un labo qui pose
 * deux prédictions monte un panneau par prédiction : `key`) ; la question nomme le panneau (`aria-labelledby`) ; `step` / `of` affichent
 * « 1 من 2 » ; une réponse peut porter son nom pour un lecteur d'écran (`aria`). Contraste : bord amber-600 et l'anneau de focus indigo-600.
 */
export default function PredictTray({ title, prompt, options, onSay, attr = 'tb', step, of }) {
  const root = { [`data-${attr}-predict`]: '' };
  const id = useId();
  const promptRef = useRef(null);
  // un tour plus tard : à l'ouverture d'une manche, le lecteur (intro, puce de manche) rend encore le focus à son bouton juste après le montage
  useEffect(() => {
    const timer = setTimeout(() => promptRef.current?.focus({ preventScroll: true }), 150);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div {...root}>
      <div role="dialog" aria-labelledby={`${id}-p`} aria-describedby={`${id}-t`} className="w-full space-y-4 rounded-[1.75rem] bg-white p-6 shadow-2xl ring-4 ring-amber-200">
        <p id={`${id}-t`} className="flex items-center justify-between gap-2 text-sm font-black uppercase tracking-wide text-amber-800">
          <span><span aria-hidden="true">🔮 </span>{title}</span>
          {step && of > 1 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs" data-predict-step>{`${step} من ${of}`}</span>}
        </p>
        <p id={`${id}-p`} ref={promptRef} tabIndex={-1} className="text-xl font-black leading-relaxed text-slate-900 outline-none">{prompt}</p>
        <div className="grid gap-3">
          {options.map((o) => {
            const say = { [`data-${attr}-predict-say`]: o.says };
            return (
              <button key={o.says} type="button" onClick={() => onSay(o.says)} {...say} aria-label={o.aria}
                className="min-h-[56px] rounded-2xl border-2 border-amber-600 bg-amber-50 px-4 text-start text-lg font-black text-amber-950 shadow-[0_3px_0_0_#FCD34D] hover:border-amber-700 active:translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2">
                {o.text}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
