import React from 'react';
import { telescopage, fr } from './sommesUtils';

/**
 * TelescopeLab — l'instrument du module 5 : la somme qui se télescope.
 *
 * Activity               la somme S est écrite en ligne, terme par terme.
 *                        L'élève déclenche trois gestes successifs : écrire qS
 *                        (la même ligne, chaque terme multiplié par q), la
 *                        DÉCALER d'un cran pour aligner les termes égaux, puis
 *                        RETRANCHER — et voir tout le milieu s'annuler.
 * Mathematical objective multiplier une somme géométrique par sa raison la
 *                        décale d'un cran ; la soustraction ne laisse alors que
 *                        deux termes, et l'on résout en S.
 * Student action         avancer d'une étape à la fois, et revenir en arrière
 *                        autant qu'on veut.
 * Controlled variable    l'étape du télescopage (0 à 3), et la suite examinée.
 * Mathematical state     { u0, q, n, etape } ; les deux lignes, les termes
 *                        annulés et le reste en sont DÉRIVÉS (`telescopage`).
 * Visual consequence     la seconde ligne glisse d'une case vers la droite, les
 *                        colonnes en vis-à-vis se barrent, et deux termes
 *                        restent seuls.
 * Expected observation   « ils sont tous là deux fois sauf les deux du bout —
 *                        donc tout disparaît ».
 * Misconception targeted « on ne peut additionner une suite géométrique qu’en
 *                        écrivant tous les termes » ; « on peut apparier comme
 *                        pour l’autre famille » (les paires ne sont pas égales,
 *                        et l'instrument le montre en première étape).
 *
 * SÉCURITÉ DE MISE EN PAGE. Les deux lignes défilent horizontalement dans leur
 * propre conteneur ; les nombres sont dans le DOM. Six termes au plus (test) :
 * au-delà, la ligne décalée ne tiendrait plus à 375 px même en défilement
 * confortable.
 *
 * JAMAIS GELÉ après réussite : `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ,
 * et l'élève peut toujours remonter et redescendre les étapes.
 */
export default function TelescopeLab({ u0, q, n, etape, onChangeEtape, disabled = false }) {
  const t = telescopage(u0, q, n);
  const largeur = 'w-16';

  const btn =
    'min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-sm font-bold disabled:opacity-40 '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 '
    + 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50';
  const btnFort =
    'min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  /** Une case de ligne : sa valeur, barrée quand elle s'annule. */
  const Case = ({ v, barre, fort }) => (
    <span
      className={`inline-flex ${largeur} shrink-0 items-center justify-center rounded border px-1 py-1 font-mono text-[13px] font-bold tabular-nums
        ${barre ? 'border-slate-200 bg-slate-50 text-slate-300 line-through' : fort ? 'border-rose-400 bg-rose-50 text-rose-900' : 'border-slate-300 bg-white text-slate-800'}`}
    >
      {fr(Math.round(v * 10000) / 10000)}
    </span>
  );
  const Vide = () => <span className={`inline-block ${largeur} shrink-0`} aria-hidden="true" />;

  const decale = etape >= 2;
  const barre = etape >= 3;

  return (
    <div className="space-y-3 rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3">
      <div className="text-[13px] font-semibold text-rose-900">
        u(0) = {fr(u0)}, raison {fr(q)} — on veut S = u(0) + … + u({fr(n)})
      </div>

      {/* ── Les deux lignes ─────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-xl border border-rose-200 bg-white p-3">
        <div className="min-w-max space-y-1.5">
          <div className="flex items-center gap-1">
            <span className="w-14 shrink-0 font-mono text-[13px] font-bold text-slate-600">S =</span>
            {t.ligneS.map((v, i) => (
              <Case
                key={i}
                v={v}
                barre={barre && i > 0}
                fort={barre && i === 0}
              />
            ))}
            {decale && <Vide />}
          </div>

          {etape >= 1 ? (
            <div className="flex items-center gap-1">
              <span className="w-14 shrink-0 font-mono text-[13px] font-bold text-slate-600">
                {fr(q)}S =
              </span>
              {decale && <Vide />}
              {t.ligneQS.map((v, i) => (
                <Case
                  key={i}
                  v={v}
                  barre={barre && i < t.ligneQS.length - 1}
                  fort={barre && i === t.ligneQS.length - 1}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="w-14 shrink-0 font-mono text-[13px] text-slate-400">?</span>
              <span className="text-[13px] text-slate-500">
                multiplie chaque terme par {fr(q)} pour voir la seconde ligne
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Le verdict, en DOM ──────────────────────────────────────────── */}
      {etape >= 3 && (
        <div className="rounded-xl border-2 border-rose-300 bg-white p-3" aria-live="polite">
          <p className="font-mono text-sm text-slate-800">
            S − {fr(q)}S = {fr(t.debut)} {t.fin < 0 ? '−' : '+'}{' '}
            {fr(Math.abs(Math.round(t.fin * 10000) / 10000))}
          </p>
          <p className="mt-1 text-[13px] text-slate-700">
            <strong>{fr(t.annules)}</strong> terme{t.annules > 1 ? 's' : ''} du milieu se
            {t.annules > 1 ? ' sont' : ' est'} annulé{t.annules > 1 ? 's' : ''} : chacun apparaît
            dans les deux lignes. Il ne reste que le premier terme de S et le dernier de {fr(q)}S.
          </p>
        </div>
      )}

      {/* ── Le pilotage : une étape à la fois, dans les deux sens ───────── */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Étapes du télescopage">
        <button
          type="button"
          className={btn}
          onClick={() => onChangeEtape?.(etape - 1)}
          disabled={disabled || etape <= 0}
        >
          ← revenir
        </button>
        <button
          type="button"
          className={btnFort}
          onClick={() => onChangeEtape?.(etape + 1)}
          disabled={disabled || etape >= 3}
        >
          {etape === 0 && `écrire ${fr(q)}S →`}
          {etape === 1 && 'décaler d’un cran →'}
          {etape === 2 && 'retrancher →'}
          {etape >= 3 && 'terminé'}
        </button>
        <span className="text-[13px] text-slate-600">étape {fr(etape)} sur 3</span>
      </div>
    </div>
  );
}
