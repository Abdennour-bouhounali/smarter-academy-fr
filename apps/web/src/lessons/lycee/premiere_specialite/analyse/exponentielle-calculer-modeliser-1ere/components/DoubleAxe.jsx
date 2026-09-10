import React, { useRef, useState } from 'react';
import {
  EXPO_MIN, EXPO_MAX, PAS_EXPO,
  aimanteExposant, etatDoubleAxe,
  MARGES, LARGEUR_AXE_PX, HAUTEUR_CADRE_PX, Y_AXE_EXPOSANTS, Y_AXE_VALEURS,
  positionExposantPx, graduationsExposants,
  valeurAffichee, fr,
} from './reglesExpoUtils';

/**
 * DoubleAxe — l'interaction SIGNATURE : « la règle qui transforme la somme en
 * produit ».
 *
 * Activity               DEUX AXES SUPERPOSÉS, alignés verticalement. En haut
 *                        l'axe des EXPOSANTS, où l'élève ATTRAPE deux curseurs
 *                        a et b et les FAIT GLISSER. En bas l'axe des VALEURS
 *                        de e^x, gradué de sorte qu'une même longueur y
 *                        représente toujours la même MULTIPLICATION. Quand a et
 *                        b s'additionnent en haut, les deux longueurs se
 *                        composent en bas — et les valeurs se multiplient.
 * Mathematical objective e^(a+b) = e^a × e^b. L'exponentielle TRANSPORTE
 *                        l'addition sur la multiplication : elle traduit entre
 *                        deux mondes, elle n'applique pas une formule.
 * Student action         SAISIR un curseur et le tirer (règle utilisateur « le
 *                        glisser d'abord ») — jamais un bouton qui pilote un
 *                        point. Un chemin CLAVIER complet double le geste.
 * Controlled variable    les deux exposants a et b, aimantés au cran.
 * Mathematical state     { a, b } ; valeurs, longueurs, positions, afficheurs
 *                        en sont TOUS dérivés (components/reglesExpoUtils.js).
 * Visual consequence     la longueur composée du bas se déplace, et les deux
 *                        afficheurs — e^(a+b) et e^a × e^b — restent égaux.
 * Expected observation   « quoi que je fasse, les deux nombres sont les mêmes ».
 * Misconception targeted « e^(a+b) = e^a + e^b » ; « e^(−a) = −e^a » ;
 *                        « un exposant négatif rend le nombre négatif ».
 *
 * LES DEUX AFFICHEURS SONT LA PROMESSE DE LA LEÇON. Ils passent tous deux par
 * `valeurAffichee`, et le test balaie la grille ENTIÈRE (17 × 17) pour prouver
 * qu'ils rendent la MÊME CHAÎNE : un écart de flottant visible ruinerait la
 * découverte. Les flottants bruts, eux, diffèrent sur 119 couples — c'est
 * précisément pourquoi l'affichage fait foi.
 *
 * LES NOMBRES SONT DANS LE DOM, jamais en <text> SVG (parade §6bis.4) : les
 * deux curseurs peuvent se superposer exactement, et deux étiquettes posées
 * dans le SVG s'y chevaucheraient.
 *
 * JAMAIS GELÉ après réussite. `verrouille` ne sert QU'AU verrou d'ANTÉRIORITÉ
 * d'une étape sur la précédente. La forme `curseurActif={done ? null : 'a'}`
 * serait le même défaut sous un autre nom, et n'existe pas ici.
 */
const COULEUR_A = '#4f46e5';
const COULEUR_B = '#0891b2';
const COULEUR_SOMME = '#e11d48';
const AXE = '#334155';
const GRILLE = '#e2e8f0';

const LARGEUR_VB = MARGES.left + MARGES.right + LARGEUR_AXE_PX;
const HAUTEUR_VB = HAUTEUR_CADRE_PX;

export default function DoubleAxe({
  a,
  b,
  onChangeA,
  onChangeB,
  montrerSomme = true,
  montrerProduit = true,
  verrouille = false,
  ariaLabel = null,
}) {
  const svgRef = useRef(null);
  /**
   * Le curseur actuellement saisi, hors du cycle de rendu. `finDuGlisser`
   * s'exécute dans la closure du DERNIER rendu ; une ref est donc la seule
   * source fiable pendant un glisser (défaut établi par la leçon amont).
   */
  const saisi = useRef(null);
  const [attrape, setAttrape] = useState(null);
  /** Le curseur que le clavier pilote ; le glisser le met à jour aussi. */
  const [focus, setFocus] = useState('a');

  const etat = etatDoubleAxe(a, b);

  const xPx = (v) => positionExposantPx(v);

  /** L'exposant que désigne une position horizontale de pointeur, aimanté. */
  const exposantDepuisPointeur = (clientX) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const px = ((clientX - rect.left) / rect.width) * LARGEUR_VB;
    const brut = EXPO_MIN + (px - MARGES.left) / (LARGEUR_AXE_PX / (EXPO_MAX - EXPO_MIN));
    return aimanteExposant(brut);
  };

  /**
   * QUEL CURSEUR LE DOIGT ATTRAPE : le PLUS PROCHE en abscisse. Les deux
   * curseurs peuvent se superposer exactement (a = b) ; on départage alors par
   * un ordre fixe, de sorte que le geste reste prévisible plutôt qu'aléatoire.
   */
  const curseurLePlusProche = (v) => {
    const da = Math.abs(v - a);
    const db = Math.abs(v - b);
    if (da === db) return focus;
    return da < db ? 'a' : 'b';
  };

  const poser = (quel, v) => {
    if (quel === 'a') onChangeA?.(v);
    else onChangeB?.(v);
  };

  const onPointerDown = (e) => {
    if (verrouille) return;
    const v = exposantDepuisPointeur(e.clientX);
    if (v === null) return;
    const quel = curseurLePlusProche(v);
    saisi.current = quel;
    setAttrape(quel);
    setFocus(quel);
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* pointeur déjà relâché — sans conséquence */
    }
    poser(quel, v);
  };

  const onPointerMove = (e) => {
    if (verrouille || !saisi.current) return;
    const v = exposantDepuisPointeur(e.clientX);
    if (v === null) return;
    poser(saisi.current, v);
  };

  const finDuGlisser = (e) => {
    if (!saisi.current) return;
    saisi.current = null;
    setAttrape(null);
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      /* idem */
    }
  };

  /**
   * LE CHEMIN CLAVIER, obligatoire et complet (règle du glisser, condition 2).
   * Tab entre dans le cadre, ↑/↓ choisit le curseur piloté, ←/→ le déplace d'un
   * cran, Home/End l'envoient aux bornes. Aucun appui ne peut sauter par-dessus
   * un cran : le pas de flèche EST le pas d'aimantation.
   */
  const onKeyDown = (e) => {
    if (verrouille) return;
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFocus((f) => (f === 'a' ? 'b' : 'a'));
      return;
    }
    const courant = focus === 'a' ? a : b;
    const moves = {
      ArrowRight: courant + PAS_EXPO,
      ArrowLeft: courant - PAS_EXPO,
      PageUp: courant + 4 * PAS_EXPO,
      PageDown: courant - 4 * PAS_EXPO,
      Home: EXPO_MIN,
      End: EXPO_MAX,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    poser(focus, aimanteExposant(moves[e.key]));
  };

  // ── Le décor, entièrement dérivé du modèle ──
  const graduations = graduationsExposants();

  const label =
    ariaLabel ??
    `Deux axes superposés. En haut les exposants : a vaut ${fr(a)}, b vaut ${fr(b)}, ` +
      `leur somme vaut ${fr(etat.somme)}. En bas les valeurs : e puissance a vaut ${valeurAffichee(etat.valeurA)}, ` +
      `e puissance b vaut ${valeurAffichee(etat.valeurB)}, et leur produit vaut ${valeurAffichee(etat.parLeProduit)}. ` +
      `Curseur piloté au clavier : ${focus}. Flèches haut et bas pour changer de curseur, ` +
      `flèches gauche et droite pour le déplacer.`;

  return (
    <div className="space-y-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${LARGEUR_VB} ${HAUTEUR_VB}`}
        className="w-full h-auto touch-none select-none rounded-xl border border-slate-200 bg-white"
        role="group"
        aria-label={label}
        tabIndex={verrouille ? -1 : 0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finDuGlisser}
        onPointerCancel={finDuGlisser}
        style={{ cursor: verrouille ? 'default' : attrape ? 'grabbing' : 'grab' }}
      >
        <g pointerEvents="none">
          {/* Les traits d'alignement vertical : ce sont EUX qui disent que les
              deux axes parlent du même x. Sans eux, la superposition ne se
              lirait pas. */}
          {graduations.map((v) => (
            <line
              key={`al${v}`}
              x1={xPx(v)}
              y1={Y_AXE_EXPOSANTS}
              x2={xPx(v)}
              y2={Y_AXE_VALEURS}
              stroke={GRILLE}
              strokeWidth="1"
            />
          ))}

          {/* ── L'AXE DU HAUT : les exposants, monde ADDITIF ── */}
          <line x1={MARGES.left} y1={Y_AXE_EXPOSANTS} x2={MARGES.left + LARGEUR_AXE_PX} y2={Y_AXE_EXPOSANTS} stroke={AXE} strokeWidth="1.5" />
          {graduations.map((v) => (
            <g key={`gh${v}`}>
              <line x1={xPx(v)} y1={Y_AXE_EXPOSANTS - 5} x2={xPx(v)} y2={Y_AXE_EXPOSANTS + 5} stroke={AXE} strokeWidth="1.5" />
              <text x={xPx(v)} y={Y_AXE_EXPOSANTS + 20} textAnchor="middle" fontSize="12" fill="#64748b" fontFamily="ui-monospace, monospace">
                {fr(v)}
              </text>
            </g>
          ))}

          {/* Les deux longueurs du haut, posées BOUT À BOUT depuis 0 : c'est
              l'ADDITION rendue visible. */}
          {montrerSomme && (
            <>
              <line x1={xPx(0)} y1={Y_AXE_EXPOSANTS - 16} x2={xPx(a)} y2={Y_AXE_EXPOSANTS - 16} stroke={COULEUR_A} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
              <line x1={xPx(a)} y1={Y_AXE_EXPOSANTS - 26} x2={xPx(etat.sommeDessinee)} y2={Y_AXE_EXPOSANTS - 26} stroke={COULEUR_B} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
              <line x1={xPx(0)} y1={Y_AXE_EXPOSANTS - 36} x2={xPx(etat.sommeDessinee)} y2={Y_AXE_EXPOSANTS - 36} stroke={COULEUR_SOMME} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            </>
          )}

          {/* ── L'AXE DU BAS : les valeurs de e^x, monde MULTIPLICATIF ──
              La position d'une valeur y est celle de son exposant : une même
              longueur y représente donc toujours la même multiplication. */}
          <line x1={MARGES.left} y1={Y_AXE_VALEURS} x2={MARGES.left + LARGEUR_AXE_PX} y2={Y_AXE_VALEURS} stroke={AXE} strokeWidth="1.5" />
          {graduations.map((v) => (
            <g key={`gb${v}`}>
              <line x1={xPx(v)} y1={Y_AXE_VALEURS - 5} x2={xPx(v)} y2={Y_AXE_VALEURS + 5} stroke={AXE} strokeWidth="1.5" />
              <text x={xPx(v)} y={Y_AXE_VALEURS + 20} textAnchor="middle" fontSize="11" fill="#64748b" fontFamily="ui-monospace, monospace">
                {etiquetteValeur(v)}
              </text>
            </g>
          ))}

          {/* Les deux longueurs du bas, mêmes longueurs qu'en haut, posées bout
              à bout : la COMPOSITION des deux facteurs. */}
          {montrerProduit && (
            <>
              <line x1={xPx(0)} y1={Y_AXE_VALEURS + 30} x2={xPx(a)} y2={Y_AXE_VALEURS + 30} stroke={COULEUR_A} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
              <line x1={xPx(a)} y1={Y_AXE_VALEURS + 40} x2={xPx(etat.sommeDessinee)} y2={Y_AXE_VALEURS + 40} stroke={COULEUR_B} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
              <line x1={xPx(0)} y1={Y_AXE_VALEURS + 50} x2={xPx(etat.sommeDessinee)} y2={Y_AXE_VALEURS + 50} stroke={COULEUR_SOMME} strokeWidth="4" strokeLinecap="round" opacity="0.9" />
            </>
          )}

          {/* Le repère de l'unité : e^0 = 1, l'origine des deux mondes. */}
          <line x1={xPx(0)} y1={Y_AXE_EXPOSANTS - 5} x2={xPx(0)} y2={Y_AXE_VALEURS + 5} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" />
        </g>

        {/* LES DEUX POIGNÉES. La zone tactile est le SVG entier : le doigt
            n'a pas à tomber sur un disque de 7 px, il attrape le curseur le
            plus proche. Un cran mesure 26,25 px en viewBox, soit 18,8 px sur la
            largeur utile d'un téléphone de 375 px — au-dessus du plancher de
            14 px, mesuré par `largeurPrehensionEcranPx` et borné par un test. */}
        <g pointerEvents="none">
          <Poignee x={xPx(a)} y={Y_AXE_EXPOSANTS} couleur={COULEUR_A} nom="a" actif={focus === 'a'} saisi={attrape === 'a'} />
          <Poignee x={xPx(b)} y={Y_AXE_EXPOSANTS} couleur={COULEUR_B} nom="b" actif={focus === 'b'} saisi={attrape === 'b'} decale />
          {/* Le repère de la somme, sur les deux axes à la fois. */}
          {montrerSomme && (
            <>
              <circle cx={xPx(etat.sommeDessinee)} cy={Y_AXE_EXPOSANTS} r="5" fill="none" stroke={COULEUR_SOMME} strokeWidth="2.5" />
              <circle cx={xPx(etat.sommeDessinee)} cy={Y_AXE_VALEURS} r="5" fill={COULEUR_SOMME} />
            </>
          )}
        </g>
      </svg>

      {/* LES ÉTIQUETTES DES CURSEURS, EN DOM : a et b peuvent se superposer
          exactement, et deux noms posés dans le SVG s'y chevaucheraient. */}
      <div className="flex flex-wrap items-center gap-3 text-[13px]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COULEUR_A }} aria-hidden="true" />
          <strong>a</strong> = {fr(a)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full" style={{ background: COULEUR_B }} aria-hidden="true" />
          <strong>b</strong> = {fr(b)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block w-4 h-1 rounded" style={{ background: COULEUR_SOMME }} aria-hidden="true" />
          a + b = <strong>{fr(etat.somme)}</strong>
        </span>
        {!verrouille && (
          <span className="text-slate-500">— attrape un curseur et fais-le glisser (ou ↑ ↓ pour choisir, ← → pour déplacer)</span>
        )}
      </div>

      {etat.horsCadre && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
          La somme <strong>{fr(etat.somme)}</strong> sort du cadre dessiné, qui s’arrête à{' '}
          {fr(EXPO_MAX)}. Les nombres ci-dessous restent exacts ; seule la longueur rouge est
          coupée au bord.
        </div>
      )}

      {/* LES DEUX AFFICHEURS, CÔTE À CÔTE. C'est cette disposition qui fait la
          découverte : ils portent TOUJOURS la même valeur. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50 px-3 py-2.5 text-center">
          <div className="text-[13px] text-indigo-700">
            j’additionne les exposants, puis j’exponentie : e<sup>{fr(a)} + {fr(b)}</sup> = e<sup>{fr(etat.somme)}</sup>
          </div>
          <div className="font-mono font-black tabular-nums text-lg text-indigo-900" data-testid="afficheur-somme">
            {valeurAffichee(etat.parLaSomme)}
          </div>
        </div>
        <div className="rounded-xl border-2 border-cyan-300 bg-cyan-50 px-3 py-2.5 text-center">
          <div className="text-[13px] text-cyan-700">
            j’exponentie chacun, puis je multiplie : e<sup>{fr(a)}</sup> × e<sup>{fr(b)}</sup>
          </div>
          <div className="font-mono font-black tabular-nums text-lg text-cyan-900" data-testid="afficheur-produit">
            {valeurAffichee(etat.parLeProduit)}
          </div>
        </div>
      </div>

      {/* Le détail des deux facteurs, pour que le produit du bas soit lisible. */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px]" style={{ color: COULEUR_A }}>
            e<sup>{fr(a)}</sup>
          </div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{valeurAffichee(etat.valeurA)}</div>
          <div className="text-[13px] text-slate-500">{etat.valeurA < 1 ? 'plus petit que 1 : multiplier par lui DIMINUE' : 'plus grand que 1 : multiplier par lui AUGMENTE'}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-2 py-2">
          <div className="text-[13px]" style={{ color: COULEUR_B }}>
            e<sup>{fr(b)}</sup>
          </div>
          <div className="font-mono font-bold tabular-nums text-slate-900">{valeurAffichee(etat.valeurB)}</div>
          <div className="text-[13px] text-slate-500">{etat.valeurB < 1 ? 'plus petit que 1 : multiplier par lui DIMINUE' : 'plus grand que 1 : multiplier par lui AUGMENTE'}</div>
        </div>
      </div>
    </div>
  );
}

/* ── Aides de rendu, sans mathématiques ── */

/**
 * Une poignée. `decale` remonte légèrement la seconde pour qu'elles restent
 * distinguables quand a = b — leur superposition est un état ATTEIGNABLE, et
 * elle doit rester lisible.
 */
function Poignee({ x, y, couleur, nom, actif, saisi, decale = false }) {
  const cy = y + (decale ? -9 : 9);
  return (
    <g>
      <circle cx={x} cy={cy} r="14" fill={couleur} opacity={saisi ? 0.28 : 0.14} />
      <circle cx={x} cy={cy} r="8" fill={couleur} stroke="#ffffff" strokeWidth="2.5" />
      {actif && <circle cx={x} cy={cy} r="12" fill="none" stroke={couleur} strokeWidth="2" />}
      <text x={x} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff" fontFamily="ui-sans-serif, system-ui">
        {nom}
      </text>
    </g>
  );
}

/**
 * L'étiquette d'une graduation de l'axe des VALEURS. Seuls des exposants
 * ENTIERS sont gradués, donc les étiquettes sont courtes : 1, e, e², et les
 * inverses. Elles ne peuvent pas se chevaucher — l'écart mesure 105 px en
 * viewBox, borné par un test.
 */
function etiquetteValeur(v) {
  if (v === 0) return '1';
  if (v === 1) return 'e';
  if (v === -1) return '1/e';
  if (v > 0) return `e${exposantUnicode(v)}`;
  return `1/e${exposantUnicode(-v)}`;
}

const CHIFFRES = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
const exposantUnicode = (n) => String(n).split('').map((c) => (CHIFFRES[Number(c)] ?? c)).join('');
