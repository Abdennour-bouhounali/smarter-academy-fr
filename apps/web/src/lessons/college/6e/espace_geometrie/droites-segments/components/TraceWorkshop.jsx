import React, { useState } from 'react';
import { Eye, RotateCcw } from 'lucide-react';
import GeoFigure from './GeoFigure';
import { KINDS, KIND_LABEL, notationOf, describeObj } from './droitesUtils';

/**
 * TraceWorkshop — construire l'objet demandé à partir de points donnés.
 *
 * ACTION          l'élève choisit deux points parmi ceux du plan, puis le
 *                 type d'objet, et trace.
 * TRANSFORMATION  la figure apparaît avec ses vraies extrémités et flèches.
 * SENS MATH.      construire, c'est décider deux choses : PAR OÙ ça passe, et
 *                 JUSQU'OÙ ça va.
 *
 * VALIDATION SÉMANTIQUE (playbook §17) : on compare le triplet
 * {kind, points choisis} à la consigne — jamais la géométrie du tracé pixel
 * par pixel. Un objet correct reste correct quel que soit l'ordre de
 * sélection quand la consigne le permet.
 */
export default function TraceWorkshop({
  spec,            // { kind, from, through, label }  — from = origine imposée si demi-droite
  points,          // [{ name, x, y }]
  box,
  done,
  onSolved,
  react,
  maxTries = 3,
}) {
  const [picked, setPicked] = useState([]);
  const [kind, setKind] = useState(null);
  const [drawn, setDrawn] = useState(null);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState(null);

  const byName = (n) => points.find((p) => p.name === n);

  /** L'objet attendu, construit à partir de la consigne. */
  const expected = {
    kind: spec.kind,
    a: byName(spec.from),
    b: byName(spec.through),
    nameA: spec.from,
    nameB: spec.through,
  };

  const togglePoint = (name) => {
    if (done || revealed || drawn) return;
    setError(null);
    setPicked((p) => (p.includes(name) ? p.filter((n) => n !== name) : p.length < 2 ? [...p, name] : p));
  };

  const trace = () => {
    if (done || revealed || picked.length !== 2 || !kind) return;
    const [n1, n2] = picked;
    // Une demi-droite est ORIENTÉE : son origine doit être le premier point.
    const orderMatters = kind === 'demi-droite';
    const samePoints = orderMatters
      ? n1 === spec.from && n2 === spec.through
      : (n1 === spec.from && n2 === spec.through) || (n1 === spec.through && n2 === spec.from);
    const ok = kind === spec.kind && samePoints;

    const obj = { kind, a: byName(n1), b: byName(n2), nameA: n1, nameB: n2 };
    setDrawn(obj);

    if (ok) {
      react(true);
      onSolved();
      return;
    }
    react(false);
    setTries((t) => t + 1);
    setError(
      kind !== spec.kind
        ? `Tu as tracé ${describeObj(obj, n1, n2)}, mais on demandait ${KIND_LABEL[spec.kind]}.`
        : orderMatters && n1 !== spec.from
          ? `L’origine doit être ${spec.from} : une demi-droite part de son origine. Tu es parti de ${n1}.`
          : `Ce ne sont pas les bons points : on demandait de passer par ${spec.from} et ${spec.through}.`
    );
  };

  const reset = () => {
    setPicked([]);
    setKind(null);
    setDrawn(null);
    setError(null);
  };

  const shown = revealed ? expected : drawn;
  const chip = 'min-h-[44px] px-3.5 rounded-xl border-2 font-bold text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40';

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
        {spec.label}
      </div>

      <GeoFigure
        objects={shown ? [shown] : []}
        points={points.map((p) => ({
          ...p,
          color: picked.includes(p.name) ? '#4f46e5' : '#94a3b8',
          r: picked.includes(p.name) ? 7 : 5,
        }))}
        box={box}
        showNotation={!!shown}
        ariaLabel={shown ? describeObj(shown, shown.nameA, shown.nameB) : 'Plan de points, rien de tracé'}
      />

      {!done && !revealed && (
        <>
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
              1. Choisis deux points {spec.kind === 'demi-droite' && '(l’origine en premier)'}
            </p>
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Choisir les points">
              {points.map((p) => {
                const idx = picked.indexOf(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    disabled={!!drawn}
                    aria-pressed={idx >= 0}
                    onClick={() => togglePoint(p.name)}
                    className={`${chip} ${idx >= 0 ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-indigo-400'}`}
                  >
                    {p.name}
                    {idx >= 0 && <span className="ml-1 text-xs opacity-80">({idx + 1})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wide text-slate-500">2. Choisis le type</p>
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Choisir le type d’objet">
              {KINDS.map((k) => (
                <button
                  key={k}
                  type="button"
                  disabled={!!drawn}
                  aria-pressed={kind === k}
                  onClick={() => { setKind(k); setError(null); }}
                  className={`${chip} ${kind === k ? 'bg-purple-600 border-purple-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-purple-400'}`}
                >
                  {KIND_LABEL[k]}{' '}
                  <span className="font-mono text-xs opacity-80">{notationOf({ kind: k }, 'A', 'B')}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {drawn ? (
              <button type="button" onClick={reset} className={`${chip} flex-1 bg-white border-slate-300 text-slate-700`}>
                <RotateCcw className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
                Effacer et recommencer
              </button>
            ) : (
              <button
                type="button"
                onClick={trace}
                disabled={picked.length !== 2 || !kind}
                className={`${chip} flex-1 bg-purple-600 border-purple-700 text-white`}
              >
                Tracer
              </button>
            )}
          </div>
        </>
      )}

      {error && !done && !revealed && (
        <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      {(done || revealed) && (
        <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {revealed && <strong>Pas grave, on te le montre. </strong>}
          On demandait <strong>{describeObj(expected, spec.from, spec.through)}</strong>
          {spec.kind === 'demi-droite' && <> — d’origine {spec.from}</>}.
        </div>
      )}

      {tries >= maxTries && !done && !revealed && (
        <button
          type="button"
          onClick={() => { setRevealed(true); onSolved(); }}
          className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
          Je ne trouve pas — montre-moi
        </button>
      )}
    </div>
  );
}
