import React, { useRef, useState } from 'react';
import {
  PAS_EULER, NB_PAS, DEPARTS,
  etatDuPas, aimante, pasReussi,
  cadreDe, MARGES, HAUTEUR_CADRE_PX, UNITE_X_PX,
  solutionExacte, fr, affiche,
} from './expoUtils';

/**
 * ConstructeurEuler — l'interaction SIGNATURE : la courbe qui construit sa
 * propre pente.
 *
 * Activity               l'élève ATTRAPE l'extrémité du prochain segment et la
 *                        FAIT GLISSER. La règle du jeu, affichée en permanence :
 *                        la pente du segment vaut la HAUTEUR actuelle. Une aide
 *                        montre où cette règle oblige à aller, et l'aimant ne
 *                        laisse valider que la bonne pente.
 * Mathematical objective exiger « la pente vaut la hauteur » ne laisse presque
 *                        aucune liberté ; ajouter « et je pars de 1 » n'en
 *                        laisse plus AUCUNE.
 * Student action         SAISIR le point et le tirer (règle utilisateur « le
 *                        glisser d'abord ») — jamais un bouton qui pilote un
 *                        point. Un chemin CLAVIER complet double le geste.
 * Controlled variable    l'ordonnée de l'extrémité du segment courant.
 * Mathematical state     { depart, index, hauteurs } ; pentes, cibles, cadre,
 *                        graduations et zone d'aimantation en sont TOUS dérivés
 *                        (components/expoUtils.js).
 * Visual consequence     la ligne brisée s'allonge, segment par segment, et se
 *                        redresse de plus en plus.
 * Expected observation   « je n'ai pas le choix : à chaque pas, un seul endroit
 *                        marche ».
 * Misconception targeted « une courbe qui monte a une pente constante » ;
 *                        « on peut partir d'où l'on veut ».
 *
 * LES NOMBRES SONT DANS LE DOM, jamais en <text> SVG : c'est la parade §6bis.4
 * contre les collisions, ici indispensable puisque les segments se rapprochent
 * du bord haut à mesure que la courbe s'emballe.
 *
 * JAMAIS GELÉ après réussite. `verrouille` ne sert QU'AU verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente : un élève qui vient de comprendre doit pouvoir
 * refaire le geste, et notamment recommencer avec une autre hauteur de départ.
 */
const COURBE = '#4f46e5';
const AIDE = '#94a3b8';
const CIBLE = '#0284c7';
const POINT = '#d97706';
const SOLUTION = '#e11d48';

/**
 * ÉTAT, ET SA FORME EXACTE.
 *   `hauteurs`  les ordonnées des extrémités DÉJÀ POSÉES, sans le départ :
 *               [] au début, [1.25] après un segment, etc. Sa longueur EST le
 *               nombre de segments construits.
 *   `brouillon` l'ordonnée que l'élève est en train de tirer, ou null tant
 *               qu'il n'a pas touché le point.
 * Le composant ne détient aucun état mathématique : il ne fait que rendre
 * celui-là et le renvoyer au module.
 */
export default function ConstructeurEuler({
  depart,
  onChangeDepart = null,
  hauteurs,
  brouillon = null,
  onChangeHauteur,
  onValider = null,
  montrerAide = true,
  montrerSolution = false,
  verrouille = false,
  ariaLabel = null,
}) {
  const svgRef = useRef(null);
  const glisse = useRef(false);
  /**
   * LA DERNIÈRE POSITION RÉELLEMENT POSÉE, hors du cycle de rendu.
   *
   * `finDuGlisser` s'exécute dans la closure du DERNIER RENDU : si le pointeur
   * bouge puis se relève dans la même image, `brouillon` y vaut encore la
   * valeur précédente, et un élève qui lâche le point pile sur la cible voit
   * son pas refusé. La ref, elle, est écrite de façon synchrone à chaque
   * mouvement : c'est elle qui fait foi au relâchement.
   */
  const dernierY = useRef(null);
  const [attrape, setAttrape] = useState(false);

  const cadre = cadreDe(depart);
  const { range, graduation, unitX, unitY } = cadre;

  const largeurVB = MARGES.left + MARGES.right + UNITE_X_PX;
  const hauteurVB = MARGES.top + MARGES.bottom + HAUTEUR_CADRE_PX;

  const toSvg = (x, y) => ({
    x: MARGES.left + (x - range.xMin) * unitX,
    y: MARGES.top + (range.yMax - y) * unitY,
  });
  const yDepuisSvg = (sy) => range.yMax - (sy - MARGES.top) / unitY;

  // L'index du pas en cours : le premier qui n'est pas encore posé.
  const index = hauteurs.length;
  const fini = index >= NB_PAS;
  const etat = fini ? null : etatDuPas(depart, index);

  // La ligne déjà construite : le départ imposé, puis chaque extrémité posée.
  const construits = [{ x: 0, y: depart }, ...hauteurs.map((y, k) => ({ x: affiche((k + 1) * PAS_EULER), y }))];

  /** La position brute du doigt, convertie puis aimantée sur la cible. */
  const poserDepuisPointeur = (clientY) => {
    if (verrouille || fini || !etat) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sy = ((clientY - rect.top) / rect.height) * hauteurVB;
    const brut = yDepuisSvg(sy);
    // On borne AVANT d'aimanter : un doigt qui sort du cadre ne doit pas
    // produire une ordonnée hors repère, ni faire disparaître le point.
    const borne = Math.max(range.yMin, Math.min(range.yMax, brut));
    const pose = aimante(borne, etat);
    dernierY.current = pose;
    onChangeHauteur(pose);
  };

  const onPointerDown = (e) => {
    if (verrouille || fini) return;
    glisse.current = true;
    setAttrape(true);
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* pointeur déjà relâché — sans conséquence */
    }
    poserDepuisPointeur(e.clientY);
  };

  const onPointerMove = (e) => {
    if (!glisse.current) return;
    poserDepuisPointeur(e.clientY);
  };

  const finDuGlisser = (e) => {
    if (!glisse.current) return;
    glisse.current = false;
    setAttrape(false);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* idem */
    }
    // Le pas ne se valide qu'au RELÂCHEMENT : pendant le glisser, l'élève doit
    // pouvoir traverser la cible sans que l'étape se ferme sous son doigt.
    const pose = dernierY.current ?? hauteurEnCours(brouillon, etat);
    dernierY.current = null;
    if (etat && pasReussi(pose, etat)) onValider?.();
  };

  /**
   * LE CHEMIN CLAVIER, obligatoire et complet (règle du glisser, condition 2).
   * Le pas de flèche est la demi-bande d'aimantation : trois appuis suffisent
   * donc toujours à entrer dans la zone depuis n'importe où dans le cadre, et
   * aucun appui ne peut sauter par-dessus la cible.
   */
  const onKeyDown = (e) => {
    if (verrouille || fini || !etat) return;
    const cran = etat.tolerance;
    const y = hauteurEnCours(brouillon, etat);
    const moves = {
      ArrowUp: y + cran,
      ArrowRight: y + cran,
      ArrowDown: y - cran,
      ArrowLeft: y - cran,
      Home: range.yMin,
      End: range.yMax,
      PageUp: range.yMax,
      PageDown: range.yMin,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const borne = Math.max(range.yMin, Math.min(range.yMax, moves[e.key]));
    const pose = aimante(borne, etat);
    dernierY.current = pose;
    onChangeHauteur(pose);
    if (pasReussi(pose, etat)) onValider?.();
  };

  // ── Le décor, entièrement dérivé du cadre ──
  const lignes = [];
  for (let v = range.yMin; v <= range.yMax + 1e-9; v += graduation) {
    const a = toSvg(range.xMin, v);
    const b = toSvg(range.xMax, v);
    lignes.push(<line key={`gy${v}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth="1" />);
  }
  for (let k = 0; k <= NB_PAS; k += 1) {
    const x = affiche(k * PAS_EULER);
    const a = toSvg(x, range.yMin);
    const b = toSvg(x, range.yMax);
    lignes.push(<line key={`gx${x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#e2e8f0" strokeWidth="1" />);
  }

  const polyligne = construits.map((p) => { const s = toSvg(p.x, p.y); return `${s.x},${s.y}`; }).join(' ');

  // La courbe cherchée, tracée seulement quand le module la révèle.
  const solution = [];
  if (montrerSolution) {
    const f = solutionExacte(depart);
    for (let i = 0; i <= 80; i += 1) {
      const x = range.xMin + ((range.xMax - range.xMin) * i) / 80;
      const y = f(x);
      if (y <= range.yMax) { const s = toSvg(x, y); solution.push(`${s.x},${s.y}`); }
    }
  }

  const yCourant = etat ? hauteurEnCours(brouillon, etat) : null;
  const juste = etat ? pasReussi(yCourant, etat) : false;

  const label =
    ariaLabel ??
    (fini
      ? `Construction terminée depuis la hauteur ${fr(depart)}. Hauteur atteinte ${fr(affiche(hauteurs.at(-1)))}.`
      : `Segment ${index + 1} sur ${NB_PAS}. Hauteur de départ du segment ${fr(affiche(etat.de.y))}, ` +
        `donc pente imposée ${fr(affiche(etat.pente))}. Extrémité actuellement à la hauteur ${fr(affiche(yCourant))}. ` +
        `Flèches haut et bas pour la déplacer.`);

  return (
    <div className="space-y-3">
      {/* LA RÈGLE DU JEU, affichée en permanence : c'est elle qui rend le geste
          possible. Elle est en DOM, donc lisible au lecteur d'écran. */}
      <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 px-3 py-2 text-center">
        <div className="text-[13px] font-semibold text-indigo-900">La règle du jeu</div>
        <div className="text-base font-black text-indigo-800">la pente du prochain segment = la hauteur actuelle</div>
      </div>

      {onChangeDepart && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir la hauteur de départ">
          <span className="text-[13px] font-semibold text-slate-600">Hauteur de départ :</span>
          {DEPARTS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChangeDepart(d)}
              aria-pressed={d === depart}
              className={
                'min-w-[56px] h-11 px-3 rounded-lg text-sm font-bold border-2 transition ' +
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
                (d === depart
                  ? 'bg-indigo-600 border-indigo-700 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50')
              }
            >
              {fr(d)}
            </button>
          ))}
        </div>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${largeurVB} ${hauteurVB}`}
        className="w-full h-auto max-h-[430px] touch-none select-none rounded-xl border border-slate-200 bg-white"
        role="group"
        aria-label={label}
        tabIndex={verrouille || fini ? -1 : 0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finDuGlisser}
        onPointerCancel={finDuGlisser}
        style={{ cursor: verrouille || fini ? 'default' : attrape ? 'grabbing' : 'grab' }}
      >
        <g pointerEvents="none">
          {lignes}
          {/* Les axes */}
          <line {...seg(toSvg(range.xMin, range.yMin), toSvg(range.xMax, range.yMin))} stroke="#334155" strokeWidth="1.5" />
          <line {...seg(toSvg(range.xMin, range.yMin), toSvg(range.xMin, range.yMax))} stroke="#334155" strokeWidth="1.5" />

          {/* Les graduations, seules valeurs écrites dans le SVG : elles sont
              fixes, espacées d'au moins 26 px, et ne peuvent pas se chevaucher. */}
          {graduationsY(range, graduation).map((v) => {
            const s = toSvg(range.xMin, v);
            return (
              <text key={`ty${v}`} x={s.x - 8} y={s.y + 4} textAnchor="end" fontSize="11" fill="#64748b" fontFamily="ui-monospace, monospace">
                {fr(affiche(v))}
              </text>
            );
          })}
          {Array.from({ length: NB_PAS + 1 }, (_, k) => affiche(k * PAS_EULER)).map((x) => {
            const s = toSvg(x, range.yMin);
            return (
              <text key={`tx${x}`} x={s.x} y={s.y + 18} textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="ui-monospace, monospace">
                {fr(x)}
              </text>
            );
          })}

          {/* La courbe cherchée, révélée par le module quand il est temps. */}
          {montrerSolution && solution.length > 1 && (
            <polyline points={solution.join(' ')} fill="none" stroke={SOLUTION} strokeWidth="2" strokeDasharray="5 4" opacity="0.85" />
          )}

          {/* L'AIDE : où la règle oblige à aller. Une bande, et non un simple
              point, parce que c'est la BANDE qui est réellement acceptée — la
              montrer, c'est dire la vérité sur ce que le geste demande. */}
          {montrerAide && etat && !verrouille && (
            <>
              <rect
                x={toSvg(etat.vers.x, 0).x - 9}
                y={toSvg(etat.vers.x, etat.vers.y + etat.tolerance).y}
                width={18}
                height={Math.max(2, toSvg(0, etat.vers.y - etat.tolerance).y - toSvg(0, etat.vers.y + etat.tolerance).y)}
                rx="6"
                fill={CIBLE}
                opacity="0.16"
              />
              <line
                {...seg(toSvg(etat.de.x, etat.de.y), toSvg(etat.vers.x, etat.vers.y))}
                stroke={AIDE}
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle {...pt(toSvg(etat.vers.x, etat.vers.y))} r="4" fill="none" stroke={CIBLE} strokeWidth="2" />
            </>
          )}

          {/* La ligne brisée déjà construite. */}
          {construits.length > 1 && (
            <polyline points={polyligne} fill="none" stroke={COURBE} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Le segment en cours, tiré par l'élève. */}
          {etat && (
            <line
              {...seg(toSvg(etat.de.x, etat.de.y), toSvg(etat.vers.x, yCourant))}
              stroke={juste ? COURBE : POINT}
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {construits.map((p, k) => (
            <circle key={`p${k}`} {...pt(toSvg(p.x, p.y))} r="4.5" fill={COURBE} />
          ))}
        </g>

        {/* LA POIGNÉE — le point que l'élève SAISIT. Peinte en dernier, mais
            sans capter le pointeur : la zone tactile est le SVG entier, ce qui
            évite d'exiger du doigt qu'il tombe sur un disque de 7 px. */}
        {etat && !verrouille && (
          <g pointerEvents="none">
            <circle {...pt(toSvg(etat.vers.x, yCourant))} r="13" fill={juste ? COURBE : POINT} opacity="0.16" />
            <circle
              {...pt(toSvg(etat.vers.x, yCourant))}
              r="7.5"
              fill={juste ? COURBE : POINT}
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </g>
        )}
      </svg>

      {/* Les nombres du pas courant, en DOM. « Hauteur » et « pente » restent
          côte à côte : c'est ce qui empêche de les dissocier. */}
      {etat ? (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
            <div className="text-[13px] text-slate-500">hauteur actuelle</div>
            <div className="font-mono font-bold tabular-nums text-slate-900">{fr(affiche(etat.de.y))}</div>
          </div>
          <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 px-2 py-2">
            <div className="text-[13px] text-indigo-700">pente imposée</div>
            <div className="font-mono font-black tabular-nums text-indigo-900">{fr(affiche(etat.pente))}</div>
          </div>
          <div className={'rounded-lg border-2 px-2 py-2 ' + (juste ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50')}>
            <div className={'text-[13px] ' + (juste ? 'text-emerald-700' : 'text-amber-700')}>ton extrémité</div>
            <div className={'font-mono font-black tabular-nums ' + (juste ? 'text-emerald-900' : 'text-amber-900')}>
              {fr(affiche(yCourant))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-center">
          <div className="text-[13px] text-emerald-700">construction terminée — hauteur atteinte en 1</div>
          <div className="font-mono font-black tabular-nums text-emerald-900">{fr(affiche(hauteurs.at(-1)))}</div>
        </div>
      )}

      {/* La bande d'avancement : combien de segments sont posés. */}
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <span className="font-semibold text-slate-600">Segments posés :</span>
        {Array.from({ length: NB_PAS }, (_, k) => (
          <span
            key={k}
            className={
              'inline-flex items-center justify-center w-7 h-7 rounded-lg border font-mono font-bold ' +
              (k < index
                ? 'bg-indigo-600 border-indigo-700 text-white'
                : k === index
                ? 'bg-white border-indigo-400 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-400')
            }
          >
            {k + 1}
          </span>
        ))}
        {!fini && (
          <span className="text-slate-500">
            — attrape le point et fais-le glisser (ou flèches ↑ ↓)
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Aides de rendu, sans mathématiques : tout le calcul vit dans expoUtils ── */

const seg = (a, b) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
const pt = (a) => ({ cx: a.x, cy: a.y });

/** Les graduations réellement écrites : au plus une sur deux si elles sont serrées. */
function graduationsY(range, graduation) {
  const out = [];
  for (let v = range.yMin; v <= range.yMax + 1e-9; v += graduation) out.push(affiche(v));
  return out.length > 9 ? out.filter((_, i) => i % 2 === 0) : out;
}

/**
 * La hauteur de l'extrémité en cours de tirage. Tant que l'élève n'a rien
 * touché (`brouillon` vaut null), elle vaut la hauteur de DÉPART du segment :
 * le point apparaît donc au bout d'un segment HORIZONTAL, et c'est exactement
 * l'état « pente nulle » que la règle interdit — l'élève voit tout de suite
 * qu'il a quelque chose à faire.
 */
function hauteurEnCours(brouillon, etat) {
  return typeof brouillon === 'number' ? brouillon : etat.de.y;
}
