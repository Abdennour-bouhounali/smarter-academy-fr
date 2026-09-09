import React, { useMemo } from 'react';
import {
  SAC, EVENEMENTS_SAC, probabilite, fraction, pct,
  contraire, intersection, reunion, compteNaifReunion, estImpossible, estCertain,
} from './proba4e';

/**
 * SacLab — le sac dont les billes ont DEUX caractères (couleur et taille).
 *
 * Activity              activer un filtre (couleur) et/ou un second (taille),
 *                       et voir quelles billes restent allumées.
 * Mathematical objective un événement est un ENSEMBLE D'ISSUES. Le contraire
 *                       est ce qui reste éteint ; l'intersection ce qui est
 *                       allumé par les DEUX filtres ; la réunion ce qui est
 *                       allumé par AU MOINS UN — et certaines billes seraient
 *                       comptées deux fois si l'on additionnait.
 * Student action        toucher un filtre, choisir le mode (ET / OU / contraire).
 * Controlled variable   les filtres actifs et le mode.
 * Mathematical state    deux événements et un mode ; l'ensemble des billes
 *                       retenues est CALCULÉ par le noyau.
 * Visual consequence    chaque bille s'allume, s'éteint, ou se marque d'un
 *                       double liseré quand elle appartient aux deux.
 * Expected observation  « rouge OU grande, ça ne fait pas 4 + 4 = 8 : deux
 *                       billes sont dans les deux, elles ne comptent qu'une
 *                       fois ».
 * Misconception targeted additionner les effectifs de deux événements qui se
 *                       chevauchent — le comptage naïf donnerait ici 8/8,
 *                       c'est-à-dire « certain », alors que deux billes
 *                       restent visiblement éteintes.
 *
 * SÉCURITÉ VISUELLE : les billes sont des éléments DOM en grille, pas du
 * texte SVG. Elles ne peuvent ni déborder ni se chevaucher, quel que soit
 * leur nombre.
 */

/** Une bille : allumée, éteinte, ou dans les deux ensembles. */
function Bille({ issue, dedans, dansLesDeux }) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-full text-xs font-black transition-all ${
        dedans ? 'text-white shadow-sm' : 'text-slate-300'
      } ${dansLesDeux ? 'ring-4 ring-offset-1 ring-slate-900' : ''}`}
      style={{
        background: dedans ? issue.hex : '#f1f5f9',
        border: dedans ? 'none' : '2px dashed #cbd5e1',
      }}
      title={`${issue.label} — ${issue.couleur}, ${issue.taille}`}
    >
      {issue.label}
    </div>
  );
}

export default function SacLab({
  filtreA = 'rouge',
  filtreB = null,
  mode = 'simple',        // 'simple' | 'contraire' | 'et' | 'ou'
  onFiltreA,
  onFiltreB,
  onMode,
  montrerComptage = false,
  sac = SAC,
}) {
  const A = EVENEMENTS_SAC[filtreA];
  const B = filtreB ? EVENEMENTS_SAC[filtreB] : null;

  const retenu = useMemo(() => {
    if (mode === 'contraire') return contraire(A);
    if (mode === 'et' && B) return intersection(A, B);
    if (mode === 'ou' && B) return reunion(A, B);
    return A;
  }, [mode, A, B, sac]);

  // `evenement.issues` est un tableau d'IDENTIFIANTS d'issues, pas d'objets.
  const idsRetenus = new Set(retenu.issues);
  const idsDeux = B ? new Set(intersection(A, B).issues) : new Set();
  const p = probabilite(retenu);
  const naif = B ? compteNaifReunion(A, B) : null;

  const FILTRES = [
    { id: 'rouge', label: 'rouge' },
    { id: 'bleue', label: 'bleue' },
    { id: 'verte', label: 'verte' },
    { id: 'grande', label: 'grande' },
    { id: 'petite', label: 'petite' },
  ];

  const libelle = mode === 'contraire' ? `pas ${A.label ?? filtreA}`
    : mode === 'et' && B ? `${filtreA} ET ${filtreB}`
    : mode === 'ou' && B ? `${filtreA} OU ${filtreB}`
    : filtreA;

  return (
    <div className="space-y-4" role="group" aria-label="Sac de billes : filtrer les issues">
      {/* ── Les billes ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
        <div className="flex flex-wrap justify-center gap-2">
          {sac.issues.map((issue) => (
            <Bille
              key={issue.id}
              issue={issue}
              dedans={idsRetenus.has(issue.id)}
              dansLesDeux={(mode === 'et' || mode === 'ou') && idsDeux.has(issue.id)}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-600">
            « {libelle} » : <strong>{retenu.issues.length}</strong> bille
            {retenu.issues.length > 1 ? 's' : ''} sur {sac.issues.length}
          </span>
          <span className="font-mono text-lg font-black tabular-nums text-slate-900">
            {fraction(p)}
          </span>
        </div>
        {estImpossible(retenu) && (
          <p className="mt-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-center text-xs font-semibold text-slate-600">
            Aucune bille : cet événement est impossible, sa probabilité vaut 0.
          </p>
        )}
        {estCertain(retenu) && (
          <p className="mt-2 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-center text-xs font-semibold text-emerald-800">
            Toutes les billes : cet événement est certain, sa probabilité vaut 1.
          </p>
        )}
      </div>

      {/* ── Le comptage naïf, quand il y a chevauchement ────────────── */}
      {montrerComptage && mode === 'ou' && B && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
          <p>
            En additionnant les deux effectifs : {A.issues.length} + {B.issues.length} ={' '}
            <strong>{naif}</strong> billes… alors que le sac n’en contient que{' '}
            {sac.issues.length}, et que <strong>{retenu.issues.length}</strong> sont allumées.
          </p>
          {idsDeux.size > 0 && (
            <p className="mt-1.5">
              Les {idsDeux.size} bille{idsDeux.size > 1 ? 's' : ''} cerclée
              {idsDeux.size > 1 ? 's' : ''} de noir {idsDeux.size > 1 ? 'ont' : 'a'} été
              compté{idsDeux.size > 1 ? 'es' : 'e'} <strong>deux fois</strong>.
            </p>
          )}
        </div>
      )}

      {/* ── Les filtres ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {FILTRES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFiltreA?.(f.id)}
              aria-pressed={filtreA === f.id}
              className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${
                filtreA === f.id ? 'border-indigo-500 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {onMode && (
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'simple', label: 'tel quel' },
              { id: 'contraire', label: 'son contraire' },
              ...(onFiltreB ? [{ id: 'et', label: 'ET' }, { id: 'ou', label: 'OU' }] : []),
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onMode(m.id)}
                aria-pressed={mode === m.id}
                className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-sm font-bold transition-colors ${
                  mode === m.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}

        {onFiltreB && (mode === 'et' || mode === 'ou') && (
          <div className="flex flex-wrap gap-2">
            <span className="self-center text-xs font-semibold text-slate-500">second filtre :</span>
            {FILTRES.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onFiltreB(f.id)}
                aria-pressed={filtreB === f.id}
                className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-sm font-semibold transition-colors ${
                  filtreB === f.id ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
