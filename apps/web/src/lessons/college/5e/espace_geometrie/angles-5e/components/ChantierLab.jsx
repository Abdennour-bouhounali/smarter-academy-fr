import React from 'react';
import GeoScene, { Dot, Seg } from '../../../../../common/geo5e/GeoScene';
import AngleArc from '../../../../../common/geo5e/AngleArc';
import { clipLine, fr, lineInter, rad } from '../../../../../common/geo5e/geo5e';
import { droite, pointsDe, configuration, sontAlternesInternes } from './angles';

const W = 720;
const H = 240;          // la FENÊTRE : volontairement basse et large
const HREV = 280;       // la vue révélée, dézoomée

/**
 * Les trois chantiers du module 5.
 *
 * `ecart` est l'écart RÉEL entre les deux rails, en degrés. Tout le reste — les
 * deux angles mesurés, le verdict, le point de rencontre — en découle par le
 * calcul. On ne peut donc pas déclarer « parallèles » un chantier dont les
 * rails se croisent : `paralleles` est DÉRIVÉ, pas saisi.
 */
const BRUTS = [
  { id: 'c1', nom: 'Chantier A', ecart: 0, secante: 58 },
  { id: 'c2', nom: 'Chantier B', ecart: 2, secante: 64 },
  { id: 'c3', nom: 'Chantier C', ecart: 0, secante: 73 },
];

export const CHANTIERS = BRUTS.map((c) => ({ ...c, paralleles: c.ecart === 0 }));

/**
 * ChantierLab — une fenêtre sur deux rails, deux angles mesurables, un verdict.
 *
 * Le dispositif porte toute la réciproque : l'élève ne voit qu'un morceau et
 * doit pourtant conclure. Tant qu'il n'a pas tranché, la vue reste bornée ;
 * après, le rideau se lève et montre ce que la fenêtre cachait.
 *
 * Les deux angles marqués sont de VRAIS alternes-internes, choisis par le
 * prédicat testé — pas deux arcs posés à la main.
 */
export default function ChantierLab({ chantier, revele, reponse, onRepondre }) {
  const y1 = 74;
  const y2 = 166;
  const d1 = droite({ x: W / 2, y: y1 }, 0);
  const d2 = droite({ x: W / 2, y: y2 }, -chantier.ecart);
  const s = droite({ x: W / 2, y: (y1 + y2) / 2 }, chantier.secante);

  let config = null;
  try {
    config = configuration(d1, d2, s);
  } catch {
    config = null;
  }

  const couple = config
    ? (() => {
      for (const x of config.angles) {
        for (const y of config.angles) if (sontAlternesInternes(x, y)) return [x, y];
      }
      return null;
    })()
    : null;

  const juste = reponse === chantier.paralleles;

  const trace = (d, h) => {
    const [a, b] = pointsDe(d, 4000);
    return clipLine(a, b, W, h, 4);
  };
  const [a1, b1] = trace(d1, H);
  const [a2, b2] = trace(d2, H);
  const [as, bs] = trace(s, H);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden bg-white ${
      revele ? (juste ? 'border-emerald-300' : 'border-orange-300') : 'border-purple-200'
    }`}>
      <div className="px-4 py-2 bg-purple-50 border-b-2 border-purple-100 flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-bold text-purple-900">{chantier.nom}</span>
        <span className="text-xs text-slate-500">
          {revele ? 'vue élargie' : 'ce que tu vois depuis le chantier'}
        </span>
      </div>

      <GeoScene
        width={W} height={H}
        labels={[]}
        obstacles={[]}
        ariaLabel={`${chantier.nom} : deux rails coupés par une traverse, avec deux angles mesurés`}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Seg a={a1} b={b1} color="#334155" w={4} />
        <Seg a={a2} b={b2} color="#334155" w={4} />
        <Seg a={as} b={bs} color="#0ea5e9" w={2.5} dash="9 6" />
        {couple && couple.map((a, i) => (
          <AngleArc
            key={a.id}
            a={a.a} b={a.P} c={a.c}
            r={34} color={i === 0 ? '#7c3aed' : '#f59e0b'} showValue
          />
        ))}
        {config && (
          <>
            <Dot p={config.A} color="#334155" r={5} />
            <Dot p={config.B} color="#334155" r={5} />
          </>
        )}
      </GeoScene>

      {!revele ? (
        <div className="px-4 py-3 bg-slate-50 border-t-2 border-slate-100 space-y-2">
          <p className="text-sm text-slate-700 text-center">
            D’après ces deux angles, ces rails se rejoindront-ils un jour ?
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => onRepondre(true)}
              className="rounded-xl border-2 border-emerald-200 bg-white px-4 py-2 text-sm font-bold text-emerald-800 hover:border-emerald-400 transition"
            >
              ∥ Parallèles — jamais
            </button>
            <button
              type="button"
              onClick={() => onRepondre(false)}
              className="rounded-xl border-2 border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800 hover:border-orange-400 transition"
            >
              ✕ Ils se croiseront
            </button>
          </div>
        </div>
      ) : (
        <>
          <VueElargie chantier={chantier} />
          <div className={`px-4 py-3 border-t-2 text-sm ${juste ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-orange-200 bg-orange-50 text-orange-900'}`}>
            {chantier.paralleles ? (
              <>
                Les deux angles étaient <strong>égaux</strong>
                {couple ? ` (${fr(couple[0].mesure, 1)}° des deux côtés)` : ''} : les rails sont bel
                et bien <strong>parallèles</strong>, et ne se rencontrent jamais.
                {!juste && ' Tu avais annoncé le contraire — l’égalité des angles suffisait pourtant à conclure.'}
              </>
            ) : (
              <>
                Les deux angles différaient de <strong>{fr(chantier.ecart, 1)}°</strong> — presque
                rien à l’œil, et pourtant décisif : les rails <strong>se rejoignent</strong> hors de
                la fenêtre.
                {!juste && ' Un écart, même minuscule, interdit le parallélisme.'}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/** La vue élargie : on recule assez pour que la rencontre entre dans le cadre. */
function VueElargie({ chantier }) {
  const cx = W / 2;
  const cy = HREV / 2;
  const zoom = chantier.paralleles ? 6 : 22;

  const a1 = { x: 40, y: cy - 44 };
  const a2 = { x: 40, y: cy + 44 };
  const vers = (p) => ({ x: cx + (p.x - cx) / zoom, y: cy + (p.y - cy) / zoom });
  const pt = (anc, dir, t) => ({
    x: anc.x + Math.cos(rad(dir)) * t,
    y: anc.y + Math.sin(rad(dir)) * t,
  });

  const [p1, q1] = clipLine(vers(pt(a1, 0, -6000)), vers(pt(a1, 0, 60000)), W, HREV, 4);
  const [p2, q2] = clipLine(vers(pt(a2, -chantier.ecart, -6000)), vers(pt(a2, -chantier.ecart, 60000)), W, HREV, 4);

  const inter = chantier.paralleles ? null : lineInter(
    pt(a1, 0, 0), pt(a1, 0, 100),
    pt(a2, -chantier.ecart, 0), pt(a2, -chantier.ecart, 100),
  );
  const ie = inter ? vers(inter) : null;
  const visible = ie && ie.x > 6 && ie.x < W - 6 && ie.y > 6 && ie.y < HREV - 6;

  return (
    <GeoScene
      width={W} height={HREV}
      labels={visible ? [{ id: 'X', text: 'ils se rejoignent ici', anchor: ie, color: '#dc2626', size: 16 }] : []}
      obstacles={visible ? [{ x: ie.x - 15, y: ie.y - 15, w: 30, h: 30 }] : []}
      ariaLabel={chantier.paralleles
        ? 'Vue élargie : les rails restent à écart constant'
        : 'Vue élargie : les rails finissent par se rejoindre'}
    >
      <rect x={0} y={0} width={W} height={HREV} fill="#f8fafc" data-visual-role="decor" />
      <Seg a={p1} b={q1} color="#334155" w={3} />
      <Seg a={p2} b={q2} color="#334155" w={3} />
      {visible && (
        <>
          <circle cx={ie.x} cy={ie.y} r={22} fill="none" stroke="#dc2626" strokeWidth={2.5} strokeDasharray="6 5" data-visual-role="decor" />
          <Dot p={ie} color="#dc2626" r={7} />
        </>
      )}
    </GeoScene>
  );
}

export { W as CHANTIER_W, H as CHANTIER_H };
