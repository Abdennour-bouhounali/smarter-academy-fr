import React, { useCallback, useRef, useState } from 'react';
import {
  CUBE, NIVEAUX, DEMI_CADRE, RAYON_POIGNEE, PAS_ROT, SEUIL_TRANCHE,
  ecran, sommetsEcran, coinsPlanEcran, poigneeSous, niveauLePlusProche, hauteurLaPlusProche,
  orientationApresGlisser, orientationApresTouche, hauteurApparentePlan,
  rotateSolid, visibleEdges, visibleVertices,
  verdictLabo, droiteDuLabo,
  POSITION_DROITE_PLAN, POINTS_COMMUNS, LABEL_DROITE_PLAN,
  equationCartesienne, fr, frVec3, v3,
} from './planUtils';

/**
 * DroitePlanLab — LA manipulation signature : « La droite qui traverse, ou pas ».
 *
 * Activity               une boîte qu'on ATTRAPE et qu'on tourne au doigt, un
 *                        PLAN qu'on fait monter au doigt, et une DROITE dont on
 *                        saisit les deux bouts pour la faire basculer.
 * Mathematical objective une droite et un plan n'ont que TROIS positions, et un
 *                        seul nombre les départage — le produit scalaire du
 *                        vecteur directeur par le vecteur normal.
 * Student action         glisser sur la figure pour la tourner ; saisir le plan
 *                        pour le monter ; saisir un bout de la droite pour la
 *                        faire pivoter.
 * Controlled variable    trois entiers, (p, q, h), chacun dans {0 ; 1 ; 2}.
 * Mathematical state     { p, q, h } et l'orientation. La droite, le plan, le
 *                        produit scalaire, le nombre de points communs et le
 *                        point de percée en sont TOUS dérivés — rien n'est
 *                        stocké deux fois, donc rien ne peut se contredire.
 * Visual consequence     la droite bascule, le plan monte ; le point de percée
 *                        apparaît, disparaît, et la droite finit couchée dans
 *                        le plan.
 * Expected observation   « il n'y a que trois réponses : 1, 0, ou une infinité —
 *                        et le produit tombe à zéro juste avant les deux
 *                        dernières ».
 * Misconception targeted « produit nul donc parallèle » (il peut être contenue) ;
 *                        « le dessin montre où elle perce » (la perspective
 *                        ment) ; « il y a d'autres positions possibles ».
 * Formalization          aucune ici. Le module 1 fait CONSTATER les trois
 *                        positions et DEMANDE ce qui les distingue ; le module 2
 *                        pose le vecteur normal et le critère complet.
 *
 * ─── LE GLISSER, ET POURQUOI IL EST OBLIGATOIRE ICI ───────────────────────
 * Un élève à qui l'on donnerait des boutons « + / − » pour la hauteur du plan
 * pilote un chiffre, pas un plan. Ici, il ATTRAPE le plan et le monte ; il
 * ATTRAPE un bout de la droite et le fait basculer. Trois pièges payés, et ce
 * qui les évite :
 *  1. `setPointerCapture` dans `onPointerDown`. Sans lui, le premier
 *     `pointermove` sort de la figure et le glisser se fige au premier pixel.
 *  2. LE GLISSER D'UN OBJET ET LA ROTATION DE LA BOÎTE PARTAGENT LE MÊME GESTE.
 *     Ce qui les départage n'est pas une modalité mais le POINT DE DÉPART :
 *     si le doigt se pose sur une poignée ou sur le plan, il déplace cet objet ;
 *     s'il se pose ailleurs, il tourne la boîte. La décision est prise UNE FOIS,
 *     au `pointerdown`, et ne change plus pendant le geste — sans quoi le doigt
 *     changerait de fonction en cours de route.
 *  3. L'AIMANTATION EST CE QUI SAUVE L'ATTEIGNABILITÉ. Un doigt ne vise pas au
 *     pixel, et le cas « contenue dans le plan » exige une COÏNCIDENCE EXACTE
 *     (produit nul ET point appartenant au plan). `niveauLePlusProche` et
 *     `hauteurLaPlusProche` aimantent sur les trois crans entiers : la position
 *     est donc atteignable au doigt, ce qu'un test prouve en rejouant le chemin.
 *
 * ─── LE CLAVIER EST UN CHEMIN COMPLET ─────────────────────────────────────
 * La figure est focusable (`tabIndex=0`, `role="application"`) : flèches pour
 * tourner, Home/End et PageUp/PageDown pour les bornes. Les trois cliquets
 * (P, Q, plan) sont AUSSI des groupes de boutons DOM sous la figure — un élève
 * au clavier ou au lecteur d'écran agit là, sans avoir à viser une pastille.
 *
 * ─── LES NOMBRES SONT DANS LE DOM, JAMAIS EN <text> SVG ───────────────────
 * Le produit scalaire, les coordonnées, le nombre de points communs et
 * l'équation du plan se lisent dans le DOM sous la figure. Le SVG ne porte que
 * des traits, des surfaces et des pastilles — deux objets peuvent alors se
 * rapprocher autant qu'ils veulent sans jamais rendre un nombre illisible.
 *
 * ─── JAMAIS GELÉ APRÈS RÉUSSITE ──────────────────────────────────────────
 * `disabled` ne sert qu'au verrou d'ANTÉRIORITÉ d'une étape sur la précédente.
 * Un élève qui vient de comprendre doit pouvoir refaire basculer la droite.
 */

const C_ARETE = '#334155';
const C_PLAN = '#0ea5e9';
const C_DROITE = '#e11d48';
const C_PERCEE = '#f59e0b';
const C_NORMAL = '#7c3aed';

const TON = {
  [POSITION_DROITE_PLAN.secante]: {
    bord: 'border-sky-300', fond: 'bg-sky-50', texte: 'text-sky-900', puce: 'text-sky-700',
  },
  [POSITION_DROITE_PLAN.parallele]: {
    bord: 'border-emerald-300', fond: 'bg-emerald-50', texte: 'text-emerald-900', puce: 'text-emerald-700',
  },
  [POSITION_DROITE_PLAN.contenue]: {
    bord: 'border-rose-300', fond: 'bg-rose-50', texte: 'text-rose-900', puce: 'text-rose-700',
  },
};

export default function DroitePlanLab({
  orientation,
  onOrientation,
  etat,
  onEtat,
  /** Ce que la légende DOM affiche : 'points' (le seul compteur),
   *  'calcul' (le compteur ET le produit scalaire), 'complet' (tout). */
  montrer = 'calcul',
  /** Affiche la flèche du vecteur normal sortant du plan. */
  montrerNormal = false,
  disabled = false,
  ariaLabel,
}) {
  const svgRef = useRef(null);
  // Ce que le doigt a saisi AU POSER, et qui ne change plus de tout le geste.
  const geste = useRef({ quoi: null, x0: 0, y0: 0, o0: null });
  const [saisi, setSaisi] = useState(null);

  const v = verdictLabo(etat);
  const tourne = rotateSolid(CUBE, orientation);
  const { visible, hidden } = visibleEdges(tourne);
  const vus = visibleVertices(tourne);
  const S = sommetsEcran(orientation);
  const coinsPlan = coinsPlanEcran(orientation, etat.h);

  const droite = droiteDuLabo(etat);
  const [EP, EQ] = ecran(orientation, [droite.A, droite.B]);
  const [EM] = v.MSurSegment ? ecran(orientation, [v.M]) : [null];
  // LA FLÈCHE DU NORMAL part du centre du plan et monte d'une DEMI-arête.
  // Une arête entière ferait sortir la pointe du cadre à h = 2 : le balayage
  // de sécurité ne couvre que la boîte et le plan, et une flèche montant à
  // z = 3 franchirait le bord. Le test de mise en page balaie explicitement
  // ce bout de flèche, aux trois hauteurs.
  const [ENbase, ENbout] = ecran(orientation, [
    v3(1, 1, etat.h), v3(1, 1, etat.h + 0.5),
  ]);

  const ton = TON[v.position];

  /** Un point du client vers les unités du viewBox — la seule conversion. */
  const versCadre = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - r.left) / r.width) * (2 * DEMI_CADRE),
      y: ((e.clientY - r.top) / r.height) * (2 * DEMI_CADRE),
    };
  }, []);

  const prendre = (e) => {
    if (disabled) return;
    // SANS CECI, LE GLISSER SE FIGE AU PREMIER PIXEL.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const quoi = poigneeSous(orientation, etat, versCadre(e));
    geste.current = { quoi, x0: e.clientX, y0: e.clientY, o0: orientation };
    setSaisi(quoi ?? 'boite');
  };

  const bouger = (e) => {
    if (disabled || !saisi) return;
    const { quoi } = geste.current;
    if (quoi === null) {
      // Rien n'était sous le doigt au poser : le geste tourne la boîte.
      const dx = e.clientX - geste.current.x0;
      const dy = e.clientY - geste.current.y0;
      onOrientation?.(orientationApresGlisser(geste.current.o0, dx, dy));
      return;
    }
    const P = versCadre(e);
    if (quoi === 'plan') {
      const h = hauteurLaPlusProche(orientation, P);
      if (h !== etat.h) onEtat?.({ ...etat, h });
      return;
    }
    const niveau = niveauLePlusProche(orientation, quoi, P);
    const cle = quoi === 'P' ? 'p' : 'q';
    if (niveau !== etat[cle]) onEtat?.({ ...etat, [cle]: niveau });
  };

  const lacher = (e) => {
    if (disabled) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    geste.current.quoi = null;
    setSaisi(null);
  };

  const auClavier = (e) => {
    if (disabled) return;
    const suivant = orientationApresTouche(orientation, e.key);
    if (!suivant) return;
    e.preventDefault();
    onOrientation?.(suivant);
  };

  const arete = ([i, j], cachee) => (
    <line
      key={`${i}-${j}-${cachee ? 'h' : 'v'}`}
      x1={S[i].x} y1={S[i].y} x2={S[j].x} y2={S[j].y}
      stroke={C_ARETE} strokeWidth={cachee ? 1.4 : 2}
      strokeDasharray={cachee ? '6 4' : undefined}
      opacity={cachee ? 0.3 : 0.85}
      strokeLinecap="round"
    />
  );

  const btn = 'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 '
    + 'disabled:opacity-40 text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

  const btnCran = (actif) => 'w-11 h-11 rounded-lg border-2 font-mono font-bold text-base '
    + 'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-40 '
    + (actif ? 'border-rose-500 bg-rose-100 text-rose-900' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100');

  const cliquet = (titre, cle, couleur, aria) => (
    <div className="space-y-1">
      <div className="text-[13px] font-semibold" style={{ color: couleur }}>{titre}</div>
      <div className="flex gap-1.5" role="group" aria-label={aria}>
        {NIVEAUX.map((n) => (
          <button
            key={n} type="button" disabled={disabled}
            className={btnCran(etat[cle] === n)}
            aria-pressed={etat[cle] === n}
            aria-label={`${aria} : hauteur ${n}`}
            onClick={() => onEtat?.({ ...etat, [cle]: n })}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  const platCourant = hauteurApparentePlan(orientation, etat.h) < SEUIL_TRANCHE;

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${2 * DEMI_CADRE} ${2 * DEMI_CADRE}`}
        className={`w-full max-w-[340px] mx-auto bg-white rounded-xl border-2 border-slate-200 touch-none select-none ${
          disabled ? 'opacity-60' : saisi ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        role="application"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled || undefined}
        onPointerDown={prendre}
        onPointerMove={bouger}
        onPointerUp={lacher}
        onPointerCancel={lacher}
        onKeyDown={auClavier}
        aria-label={
          ariaLabel
          ?? `La boîte ABCDEFGH, vue sous une rotation horizontale de ${fr(orientation.yaw)} degrés `
            + `et une inclinaison de ${fr(orientation.pitch)} degrés. Le plan est à la hauteur `
            + `${fr(etat.h)}, la droite va du point ${frVec3(droite.A)} au point ${frVec3(droite.B)}. `
            + `Ils ont ${POINTS_COMMUNS[v.position]} point${v.position === POSITION_DROITE_PLAN.secante ? '' : 's'} `
            + `commun${v.position === POSITION_DROITE_PLAN.secante ? '' : 's'} : elle est ${LABEL_DROITE_PLAN[v.position]}. `
            + 'Glisse sur le plan pour le monter, sur un bout de la droite pour la faire basculer, '
            + 'ailleurs pour tourner la boîte.'
        }
      >
        <g style={{ pointerEvents: 'none' }}>
          {/* Les arêtes cachées d'abord : elles passent DERRIÈRE le plan. */}
          {hidden.map((e) => arete(e, true))}

          {/* LE PLAN. Un quadrilatère semi-transparent : il doit laisser voir
              la droite qui le traverse, sans quoi le point de percée serait
              masqué exactement quand il compte. */}
          <polygon
            points={coinsPlan.map((P) => `${P.x},${P.y}`).join(' ')}
            fill={C_PLAN} fillOpacity={0.22}
            stroke={C_PLAN} strokeWidth={saisi === 'plan' ? 3.5 : 2.4}
            strokeLinejoin="round"
          />

          {/* Le vecteur normal, quand un module le demande. */}
          {montrerNormal && (
            <g>
              <line x1={ENbase.x} y1={ENbase.y} x2={ENbout.x} y2={ENbout.y}
                stroke={C_NORMAL} strokeWidth={3} strokeLinecap="round" />
              <circle cx={ENbout.x} cy={ENbout.y} r={4.5} fill={C_NORMAL} />
            </g>
          )}

          {visible.map((e) => arete(e, false))}

          {/* LA DROITE, tracée d'un bout à l'autre du cube. */}
          <line x1={EP.x} y1={EP.y} x2={EQ.x} y2={EQ.y}
            stroke={C_DROITE} strokeWidth={4} strokeLinecap="round" />

          {/* LE POINT DE PERCÉE, quand il tombe sur le morceau dessiné. */}
          {EM && (
            <circle cx={EM.x} cy={EM.y} r={RAYON_POIGNEE - 1}
              fill={C_PERCEE} stroke="#fff" strokeWidth={3} />
          )}

          {/* Les huit sommets, en petit : ils repèrent la boîte sans encombrer. */}
          {S.map((P, i) => (
            <circle key={`v${i}`} cx={P.x} cy={P.y} r={3}
              fill={vus.has(i) ? '#64748b' : '#cbd5e1'} opacity={vus.has(i) ? 1 : 0.6} />
          ))}

          {/* LES DEUX POIGNÉES DE LA DROITE. Elles sont dessinées EN DERNIER
              pour rester saisissables à l'œil quoi qu'il y ait dessous. */}
          {[{ id: 'P', E: EP }, { id: 'Q', E: EQ }].map(({ id, E }) => (
            <circle key={id} cx={E.x} cy={E.y}
              r={saisi === id ? RAYON_POIGNEE + 2 : RAYON_POIGNEE}
              fill={C_DROITE} stroke="#fff" strokeWidth={3} />
          ))}
        </g>
      </svg>

      {/* L'AVERTISSEMENT DE LISIBILITÉ. La plage de rotation exclut par
          construction les vues où le plan s'écrase (test de balayage), mais le
          message reste : il apprend à l'élève que le dessin dépend de l'angle,
          ce qui est la thèse de la leçon. */}
      {platCourant && (
        <p className="text-[13px] text-amber-700 text-center">
          Sous cet angle, le plan se voit presque par la tranche — tourne la boîte pour mieux le voir.
        </p>
      )}

      {/* LES TROIS CLIQUETS, chemin clavier complet et secours de la souris.
          Le glisser reste le geste principal ; ceux-ci ne sont jamais le seul
          chemin. */}
      <div className="grid grid-cols-3 gap-2">
        {cliquet('bout P', 'p', C_DROITE, 'Hauteur du bout P de la droite')}
        {cliquet('bout Q', 'q', C_DROITE, 'Hauteur du bout Q de la droite')}
        {cliquet('le plan', 'h', C_PLAN, 'Hauteur du plan')}
      </div>

      <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Tourner la boîte">
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Tourner la boîte de ${PAS_ROT} degrés vers la gauche`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowLeft'))}>↺</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Tourner la boîte de ${PAS_ROT} degrés vers la droite`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowRight'))}>↻</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Redresser la boîte de ${PAS_ROT} degrés`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowDown'))}>⤓</button>
        <button type="button" className={btn} disabled={disabled}
          aria-label={`Plonger sur la boîte de ${PAS_ROT} degrés`}
          onClick={() => onOrientation?.(orientationApresTouche(orientation, 'ArrowUp'))}>⤒</button>
        <span className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono font-bold tabular-nums text-[13px]">
          {fr(orientation.yaw)}° / {fr(orientation.pitch)}°
        </span>
        <span className="text-[13px] text-slate-500">
          attrape le plan, la droite, ou la boîte elle-même
        </span>
      </div>

      {/* LA LÉGENDE DOM — TOUS les nombres vivent ici, jamais dans le SVG. */}
      <div aria-live="polite" className="space-y-2">
        <div className={`rounded-xl border-2 p-3 ${ton.bord} ${ton.fond}`} data-testid="verdict-labo">
          <div className="flex items-baseline justify-between gap-2 flex-wrap">
            <span className={`text-[13px] font-semibold ${ton.texte}`}>points communs</span>
            <span className={`font-mono text-2xl font-black tabular-nums ${ton.puce}`}
              data-testid="points-communs">
              {POINTS_COMMUNS[v.position]}
            </span>
          </div>
          <p className={`text-[13px] mt-1 ${ton.texte}`}>
            La droite est <strong>{LABEL_DROITE_PLAN[v.position]}</strong>.
          </p>
          {v.position === POSITION_DROITE_PLAN.secante && !v.MSurSegment && (
            <p className={`text-xs mt-1 ${ton.texte}`}>
              Elle le perce <strong>en dehors du morceau dessiné</strong> : la droite comme le plan
              continuent au-delà de la boîte. Il y a bien un point commun, et un seul.
            </p>
          )}
        </div>

        {montrer !== 'points' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-3" data-testid="cadre-produit">
              <div className="text-[13px] font-semibold text-indigo-900">
                direction de la droite × direction perpendiculaire au plan
              </div>
              <div className="font-mono text-xs text-indigo-700 mt-1">
                {frVec3(droite.u)} · {frVec3(v.plan.n)}
              </div>
              <div className="font-mono text-2xl font-black tabular-nums text-indigo-800 mt-0.5"
                data-testid="produit-scalaire">
                {fr(v.un)}
              </div>
            </div>
            <div className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3" data-testid="cadre-appartenance">
              <div className="text-[13px] font-semibold text-slate-800">
                le bout P de la droite est-il dans le plan ?
              </div>
              <div className="font-mono text-xs text-slate-600 mt-1">
                P {frVec3(droite.A)} · plan {equationCartesienne(v.plan)}
              </div>
              <div className="font-mono text-lg font-black text-slate-800 mt-0.5"
                data-testid="appartenance">
                {v.aPointDansPlan ? 'oui' : 'non'}
              </div>
            </div>
          </div>
        )}

        {montrer === 'complet' && (
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 text-[13px] text-amber-900"
            data-testid="cadre-percee">
            {v.M
              ? <>Le point commun est <strong className="font-mono">{frVec3(v.M)}</strong>
                {v.MSurSegment ? ' — la pastille orange sur la figure.' : ', hors du morceau dessiné.'}</>
              : <>Aucun point commun à afficher : il n’y en a {v.position === POSITION_DROITE_PLAN.parallele ? 'aucun' : 'une infinité'}.</>}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Un petit tableau DOM qui affiche un verdict de position droite/plan pour une
 * configuration FIXE du cube — employé par les modules 2, 6 et 7, où l'élève ne
 * pilote plus la droite mais lit un cas donné.
 *
 * Il ne dessine RIEN : les figures de ces modules-là passent par le
 * laboratoire lui-même, qui tourne. Ce composant ne porte que des nombres,
 * donc il ne peut pas mentir sur une position relative.
 */
export function CarteVerdict({ titre, lignes, tone = 'slate' }) {
  const teintes = {
    slate: 'border-slate-200 bg-slate-50 text-slate-800',
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
  };
  return (
    <div className={`rounded-xl border-2 p-3 ${teintes[tone] ?? teintes.slate}`}>
      {titre && <div className="text-[13px] font-semibold mb-1.5">{titre}</div>}
      <dl className="space-y-1">
        {lignes.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 text-[13px]">
            <dt className="opacity-80">{l.label}</dt>
            <dd className="font-mono font-bold tabular-nums text-right">{l.valeur}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
