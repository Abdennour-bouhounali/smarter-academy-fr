import React, { useMemo, useState } from 'react';
import GeoScene, { Seg, dotObstacles, segObstacles } from '../../../../../common/geo5e/GeoScene';
import AngleArc from '../../../../../common/geo5e/AngleArc';
import { clipLine } from '../../../../../common/geo5e/geo5e';
import {
  droite, configuration, pointsDe,
  sontAlternesInternes, sontCorrespondants,
} from './angles';

const W = 400;
const H = 250;

/**
 * TrierAnglesLab — cinq figures, une question : comment sont placés ces deux
 * angles ?
 *
 * LES BONNES RÉPONSES SONT CALCULÉES, pas saisies. Chaque figure fournit une
 * paire d'angles, et la réponse attendue est décidée par les prédicats de
 * angles.js. Impossible, donc, d'écrire une correction qui contredirait la
 * figure — et si les prédicats changeaient, l'exercice suivrait.
 *
 * Les cinq cas sont choisis pour couvrir les confusions réelles : une paire
 * alterne-EXTERNE et une paire du MÊME sommet sont proposées, et toutes deux
 * relèvent de « ni l'un ni l'autre ».
 */
const CAS = [
  { id: 'c1', d2dir: 0, secDir: 58, pick: (angles) => {
    const x = angles.find((a) => a.sommet === 'A' && a.interieur);
    return [x, angles.find((a) => sontAlternesInternes(x, a))];
  } },
  { id: 'c2', d2dir: 0, secDir: 72, pick: (angles) => {
    const x = angles.find((a) => a.sommet === 'A');
    return [x, angles.find((a) => sontCorrespondants(x, a))];
  } },
  // Deux angles du MÊME croisement : ni alternes-internes, ni correspondants.
  { id: 'c3', d2dir: 0, secDir: 50, pick: (angles) => {
    const x = angles.find((a) => a.sommet === 'A');
    return [x, angles.find((a) => a.sommet === 'A' && a.id !== x.id && a.cote !== x.cote)];
  } },
  // Alternes-EXTERNES : le piège du « alternes, donc alternes-internes ».
  { id: 'c4', d2dir: 0, secDir: 66, pick: (angles) => {
    const x = angles.find((a) => a.sommet === 'A' && !a.interieur);
    return [x, angles.find((a) => a.sommet === 'B' && !a.interieur && a.cote !== x.cote)];
  } },
  { id: 'c5', d2dir: 0, secDir: 41, pick: (angles) => {
    const x = angles.find((a) => a.sommet === 'B' && a.interieur);
    return [x, angles.find((a) => sontAlternesInternes(x, a))];
  } },
];

const OPTIONS = [
  { id: 'alt', label: 'Alternes-internes' },
  { id: 'corr', label: 'Correspondants' },
  { id: 'ni', label: 'Ni l’un ni l’autre' },
];

export default function TrierAnglesLab({ onFini, ariaLabel }) {
  const [reponses, setReponses] = useState({});
  const [valide, setValide] = useState(false);

  const cas = useMemo(() => CAS.map((c) => {
    const cfg = configuration(
      droite({ x: 200, y: 85 }, 0),
      droite({ x: 200, y: 175 }, c.d2dir),
      droite({ x: 200, y: 130 }, c.secDir),
    );
    const [x, y] = c.pick(cfg.angles);
    // La vérité vient des prédicats, jamais d'une étiquette écrite à la main.
    const attendu = sontAlternesInternes(x, y) ? 'alt'
      : sontCorrespondants(x, y) ? 'corr'
        : 'ni';
    return { ...c, cfg, paire: [x, y], attendu };
  }), []);

  const tout = cas.every((c) => reponses[c.id]);
  const score = cas.filter((c) => reponses[c.id] === c.attendu).length;

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        {cas.map((c, i) => {
          const rep = reponses[c.id];
          const juste = valide && rep === c.attendu;
          const faux = valide && rep && rep !== c.attendu;
          return (
            <div
              key={c.id}
              className={`rounded-2xl border-2 overflow-hidden ${
                juste ? 'border-emerald-300' : faux ? 'border-rose-300' : 'border-slate-200'
              }`}
            >
              <FigurePaire cfg={c.cfg} paire={c.paire} ariaLabel={`Figure ${i + 1}`} />
              <div className="p-2.5 space-y-1.5 bg-white">
                <div className="flex flex-wrap gap-1.5">
                  {OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setReponses((r) => ({ ...r, [c.id]: o.id }))}
                      className={`rounded-lg border-2 px-2.5 py-1 text-xs font-bold transition ${
                        rep === o.id
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                {valide && rep && (
                  <p className={`text-xs ${juste ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {juste
                      ? '✓ ' + OPTIONS.find((o) => o.id === c.attendu).label
                      : `La bonne réponse : ${OPTIONS.find((o) => o.id === c.attendu).label}. ${EXPLIQUE[c.attendu]}`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Jamais désactivé : cliquer trop tôt DIT ce qui manque. */}
      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            if (!tout) return;
            setValide(true);
            onFini?.(cas.filter((c) => reponses[c.id] === c.attendu).length);
          }}
          className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
            tout ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'border-2 border-indigo-200 bg-white text-indigo-700'
          }`}
        >
          {valide ? `${score} / 5` : tout ? 'Vérifier mes réponses' : `Réponds aux 5 figures (${Object.keys(reponses).length}/5)`}
        </button>
      </div>
    </div>
  );
}

const EXPLIQUE = {
  alt: 'Tous deux entre les droites, de part et d’autre de la sécante : c’est un Z.',
  corr: 'Même case aux deux croisements : c’est un F.',
  ni: 'Il faut un angle à CHAQUE croisement, et tous deux entre les droites (alternes-internes) ou dans la même case (correspondants).',
};

/** Une figure de l'exercice : deux droites, une sécante, une paire marquée. */
function FigurePaire({ cfg, paire, ariaLabel }) {
  const t = (d) => {
    const [a, b] = pointsDe(d, 600);
    return clipLine(a, b, W, H, 6);
  };
  const [a1, b1] = t(cfg.d1);
  const [a2, b2] = t(cfg.d2);
  const [as, bs] = t(cfg.s);
  return (
    <GeoScene
      width={W} height={H}
      labels={[
        { id: 'A', text: 'A', anchor: cfg.A, color: '#0f172a', priority: true, size: 15 },
        { id: 'B', text: 'B', anchor: cfg.B, color: '#0f172a', priority: true, size: 15 },
      ]}
      obstacles={[
        ...dotObstacles([cfg.A, cfg.B], 14),
        ...segObstacles(a1, b1), ...segObstacles(a2, b2), ...segObstacles(as, bs),
      ]}
      ariaLabel={ariaLabel}
    >
      <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
      <Seg a={as} b={bs} color="#f59e0b" w={2.5} />
      <Seg a={a1} b={b1} color="#334155" w={3} />
      <Seg a={a2} b={b2} color="#334155" w={3} />
      {paire.map((x) => (
        <AngleArc
          key={x.id} a={x.a} b={x.P} c={x.c}
          r={34} color="#7c3aed" width={3.5} showValue={false}
        />
      ))}
      <circle cx={cfg.A.x} cy={cfg.A.y} r={5} fill="#0f172a" stroke="#fff" strokeWidth={2} />
      <circle cx={cfg.B.x} cy={cfg.B.y} r={5} fill="#0f172a" stroke="#fff" strokeWidth={2} />
    </GeoScene>
  );
}
