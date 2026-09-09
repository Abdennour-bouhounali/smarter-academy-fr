import React, { useState } from 'react';
import GeoScene, { Handle, Dot, Seg, Poly, dotObstacles } from '../../../../../common/geo5e/GeoScene';
import {
  quatriemeSommet, glissementEntre, etatQuad, surLaGrille, midpoint, dist,
  TOL_DEFI, fr, arrondi,
} from './paral4e';

/**
 * ConstructeurLab — la manipulation SIGNATURE de la leçon
 * (INTERACTION_PEDAGOGY §6bis).
 *
 * Activity              placer trois points, et voir le quatrième arriver
 *                       tout seul, posé par le glissement.
 * Mathematical objective un même glissement mène A en D et B en C ; le
 *                       quadrilatère ABCD est alors un parallélogramme, et
 *                       c'est le glissement qui le prouve.
 * Student action        faire glisser A, B ou D. En mode défi, placer C
 *                       soi-même, à la bonne place.
 * Controlled variable   la position des trois sommets libres — et elle
 *                       seule. C n'est JAMAIS saisissable hors du défi :
 *                       il est le RÉSULTAT, pas une donnée.
 * Mathematical state    les trois points. C, les quatre témoins, les
 *                       diagonales et leur milieu commun sont TOUS mesurés
 *                       sur ces points par `etatQuad`.
 * Visual consequence    le quadrilatère se redessine, les deux trajets se
 *                       redessinent, et les quatre témoins s'allument ou
 *                       s'éteignent en direct.
 * Expected observation  « je ne place pas C, je le laisse arriver ».
 * Misconception targeted croire qu'on reconnaît un parallélogramme à son
 *                       allure. Ici, on le reconnaît à sa CAUSE.
 *
 * POURQUOI C N'EST PAS SAISISSABLE. Si l'élève pouvait traîner C, il
 * fabriquerait des quadrilatères quelconques et la leçon deviendrait « fais
 * en sorte que ça ait l'air d'un parallélogramme ». En le rendant dépendant,
 * on rend le message inévitable : le glissement décide, pas l'œil. Le mode
 * défi inverse exprès la charge — et c'est là qu'il prend son sens.
 *
 * SÉCURITÉ VISUELLE. Le viewBox est DÉRIVÉ du contenu — les quatre sommets,
 * les deux trajets, les diagonales, avec marge. Un cadre fixe laisserait C
 * sortir de l'écran dès que D s'éloigne de A : c'est exactement le défaut
 * qui a mordu `pythagore-4e`, et un test de `parcours.test.js` reproduit ce
 * calcul sur toutes les positions atteignables pour le verrouiller.
 *
 * Les mesures sont affichées HORS du SVG, dans leur propre grille DOM :
 * elles ne peuvent donc ni se chevaucher ni sortir du cadre, quel que soit
 * le nombre de chiffres.
 *
 * REJOUABLE : aucun `disabled` lié à l'avancement. Le labo reste vivant
 * après la validation de l'étape.
 */

/** Le rayon de la cible tactile, en unités de viewBox.
 *  MESURÉ, pas deviné : le cadre dérivé fait ~620 unités de large et le SVG
 *  occupe ~375 px sur un téléphone, donc une unité vaut ~0,60 px ; 68 unités
 *  font ~41 px de rayon, soit une cible de plus de 44 px de diamètre. */
const HIT_R = 68;

const COULEUR = {
  quad: '#7c3aed',
  trajet: '#0891b2',
  diagonale: '#94a3b8',
  poignee: '#b45309',
  cible: '#16a34a',
};

export default function ConstructeurLab({
  A, B, D, onA, onB, onD,
  mode = 'construire',            // 'construire' | 'defi'
  Cpropose = null,                // en mode défi : le point posé par l'élève
  onCpropose = null,
  montrerTrajets = true,
  montrerDiagonales = false,
  montrerTemoins = true,
  aimanter = false,
}) {
  const [drag, setDrag] = useState(null);

  const Cjuste = quatriemeSommet(A, B, D);
  const defi = mode === 'defi';
  // En mode défi, la figure montre le point de l'ÉLÈVE : c'est sa figure à
  // lui qu'on juge, pas la nôtre. Tant qu'il n'a rien posé, il n'y a pas de
  // quadrilatère — et c'est bien le problème qu'on lui donne.
  const C = defi ? Cpropose : Cjuste;
  const quad = C ? [A, B, C, D] : null;
  const etat = quad ? etatQuad(quad) : null;

  const gAD = glissementEntre(A, D);
  const gBC = C ? glissementEntre(B, C) : null;
  const ecartDefi = defi && Cpropose ? dist(Cpropose, Cjuste) : null;
  const gagne = ecartDefi != null && ecartDefi <= TOL_DEFI;

  /* LE CADRE SE DÉDUIT DU CONTENU (§17bis), il ne se devine pas.

     LA MARGE VAUT hitR, PAS MOINS. Chaque poignée porte un disque tactile
     INVISIBLE de `HIT_R` unités de rayon ; avec une marge plus petite, ce
     disque dépasse le viewBox pour un sommet posé au bord, le SVG déborde de
     la colonne, et l'audit de mise en page le voit (« déborde : Sommet A »).
     C'est le défaut qu'a attrapé la suite navigateur : la marge de 40 était
     dimensionnée pour ce qui SE VOIT, alors que c'est ce qui SE TOUCHE qui
     déborde. */
  const MARGE = HIT_R + 6;
  const points = [A, B, D, Cjuste, ...(C ? [C] : [])];
  const minX = Math.min(...points.map((p) => p.x)) - MARGE;
  const maxX = Math.max(...points.map((p) => p.x)) + MARGE;
  const minY = Math.min(...points.map((p) => p.y)) - MARGE;
  const maxY = Math.max(...points.map((p) => p.y)) + MARGE;
  /* Un cadre trop plat ou trop étroit rendrait la figure illisible et les
     poignées trop petites : on impose une taille MINIMALE, en gardant le
     contenu centré pour que la figure ne saute pas pendant le glissement. */
  const MIN = 380;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const w = Math.max(MIN, maxX - minX);
  const h = Math.max(MIN, maxY - minY);
  const vue = { x: cx - w / 2, y: cy - h / 2, w, h };

  /** Point de la scène → point du cadre mesuré. */
  const d = (p) => ({ x: p.x - vue.x, y: p.y - vue.y });

  const placer = (p) => {
    if (!p || !drag) return;
    const scene = { x: p.x + vue.x, y: p.y + vue.y };
    const pt = aimanter ? surLaGrille(scene) : {
      x: Math.max(30, Math.min(900, scene.x)),
      y: Math.max(30, Math.min(700, scene.y)),
    };
    if (drag === 'A') onA?.(pt);
    else if (drag === 'B') onB?.(pt);
    else if (drag === 'D') onD?.(pt);
    else if (drag === 'C') onCpropose?.(pt);
  };

  // `setPointerCapture` n'est PAS optionnel : sans lui, le glissement se fige
  // au premier pixel dès que le pointeur quitte la poignée (piège documenté,
  // rencontré sur les labos geo5e).
  const prendre = (nom) => (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag(nom);
  };

  const clavier = (nom, courant) => (e) => {
    const pas = aimanter ? 20 : 12;
    const map = { ArrowLeft: [-pas, 0], ArrowRight: [pas, 0], ArrowUp: [0, -pas], ArrowDown: [0, pas] };
    const v = map[e.key];
    if (!v) return;
    e.preventDefault();
    const pt = { x: courant.x + v[0], y: courant.y + v[1] };
    const final = aimanter ? surLaGrille(pt) : pt;
    if (nom === 'A') onA?.(final);
    else if (nom === 'B') onB?.(final);
    else if (nom === 'D') onD?.(final);
    else if (nom === 'C') onCpropose?.(final);
  };

  const etiquettes = [
    { id: 'A', text: 'A', anchor: d(A), color: '#0f172a', size: 17, priority: true },
    { id: 'B', text: 'B', anchor: d(B), color: '#0f172a', size: 17, priority: true },
    { id: 'D', text: 'D', anchor: d(D), color: '#0f172a', size: 17, priority: true },
  ];
  if (C) etiquettes.push({ id: 'C', text: 'C', anchor: d(C), color: '#0f172a', size: 17, priority: true });

  return (
    <div className="space-y-3" role="group" aria-label={defi
      ? 'Défi : replacer le sommet manquant du parallélogramme'
      : 'Construction du quatrième sommet par un glissement'}>
      <GeoScene
        width={vue.w}
        height={vue.h}
        ariaLabel={defi
          ? 'Trois sommets A, B et D, et un sommet C à replacer'
          : 'Quadrilatère ABCD construit par le glissement qui mène A en D'}
        onPointerMove={(p) => placer(p)}
        onPointerUp={() => setDrag(null)}
        labels={etiquettes}
        obstacles={dotObstacles([d(A), d(B), d(D), ...(C ? [d(C)] : [])], 16)}
      >
        {/* Le quadrilatère, quand il existe. */}
        {quad && (
          <Poly
            pts={quad.map(d)}
            fill={etat?.parallelogramme ? COULEUR.quad : '#94a3b8'}
            fillOpacity={0.12}
            stroke={etat?.parallelogramme ? COULEUR.quad : '#64748b'}
            w={3}
          />
        )}

        {/* Les diagonales et leur milieu commun — la propriété de 5e, revue. */}
        {montrerDiagonales && quad && (
          <>
            <Seg a={d(A)} b={d(C)} color={COULEUR.diagonale} w={2} dash="6 5" />
            <Seg a={d(B)} b={d(D)} color={COULEUR.diagonale} w={2} dash="6 5" />
            <Dot p={d(midpoint(A, C))} color="#dc2626" r={6} />
          </>
        )}

        {/* LES DEUX TRAJETS — le cœur de la leçon. Ils sont dessinés en
            gras : ce sont eux qu'il faut voir, pas les côtés. */}
        {montrerTrajets && (
          <>
            <Seg a={d(A)} b={d(D)} color={COULEUR.trajet} w={5} />
            {C && <Seg a={d(B)} b={d(C)} color={COULEUR.trajet} w={5} />}
          </>
        )}

        {/* En mode défi : la cible n'est PAS montrée, mais on montre le
            trajet attendu depuis B en pointillé une fois gagné, pour que la
            réussite se voie et se comprenne. */}
        {defi && gagne && (
          <Seg a={d(B)} b={d(Cjuste)} color={COULEUR.cible} w={3} dash="5 4" />
        )}

        {/* Les sommets libres. */}
        <Handle p={d(A)} color={COULEUR.poignee} r={11} hitR={HIT_R} dragging={drag === 'A'}
                label="Sommet A — fais-le glisser" onPointerDown={prendre('A')} onKeyDown={clavier('A', A)} />
        <Handle p={d(B)} color={COULEUR.poignee} r={11} hitR={HIT_R} dragging={drag === 'B'}
                label="Sommet B — fais-le glisser" onPointerDown={prendre('B')} onKeyDown={clavier('B', B)} />
        <Handle p={d(D)} color={COULEUR.poignee} r={11} hitR={HIT_R} dragging={drag === 'D'}
                label="Sommet D — fais-le glisser" onPointerDown={prendre('D')} onKeyDown={clavier('D', D)} />

        {/* C : point CALCULÉ en construction, poignée en défi. */}
        {!defi && C && <Dot p={d(C)} color={COULEUR.quad} r={9} />}
        {defi && Cpropose && (
          <Handle p={d(Cpropose)} color={gagne ? COULEUR.cible : '#dc2626'} r={11} hitR={HIT_R}
                  dragging={drag === 'C'} label="Sommet C — place-le au bon endroit"
                  onPointerDown={prendre('C')} onKeyDown={clavier('C', Cpropose)} />
        )}
      </GeoScene>

      {/* En mode défi, le bouton qui pose le point la première fois. */}
      {defi && !Cpropose && (
        <button
          type="button"
          onClick={() => onCpropose?.(surLaGrille({ x: (A.x + B.x + D.x) / 3, y: (A.y + B.y + D.y) / 3 }))}
          className="min-h-[44px] w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700"
        >
          Poser le point C, puis le déplacer
        </button>
      )}

      {/* LES DEUX TRAJETS, CHIFFRÉS — dans le DOM, jamais en texte SVG. */}
      {montrerTrajets && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'ad', titre: 'trajet de A vers D', g: gAD },
            { id: 'bc', titre: 'trajet de B vers C', g: gBC },
          ].map((t) => (
            <div key={t.id} className="rounded-xl border-2 border-cyan-200 bg-cyan-50/60 p-2 text-center">
              <div className="text-xs font-semibold text-cyan-800">{t.titre}</div>
              <div className="font-mono text-base font-black tabular-nums text-cyan-900">
                {t.g ? `${fr(arrondi(t.g.longueur, 1), 1)}` : '—'}
              </div>
              <div className="text-[11px] text-cyan-700">
                {t.g ? `direction ${fr(arrondi(t.g.directionDeg, 0), 0)}°` : 'C n’est pas encore placé'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LES QUATRE TÉMOINS, calculés sur les points dessinés. */}
      {montrerTemoins && etat && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(etat.temoins).map(([cle, t]) => (
            <div
              key={cle}
              data-temoin={cle}
              data-ok={t.ok ? 'oui' : 'non'}
              className={`rounded-xl border-2 p-2 text-center ${
                t.ok ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className={`font-mono text-sm font-black ${t.ok ? 'text-emerald-800' : 'text-slate-400'}`}>
                {t.ok ? '✓ ' : ''}{t.label}
              </div>
              <div className="text-[11px] text-slate-500">
                {t.ok ? 'vérifié' : `il s’en faut de ${fr(arrondi(t.ecart, 1), 1)}${t.unite}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Les diagonales, chiffrées. */}
      {montrerDiagonales && etat && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-[11px] font-semibold text-slate-500">diagonale [AC]</div>
              <div className="font-mono text-base font-black text-slate-900">{fr(arrondi(etat.diagonales.AC, 0), 0)}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">diagonale [BD]</div>
              <div className="font-mono text-base font-black text-slate-900">{fr(arrondi(etat.diagonales.BD, 0), 0)}</div>
            </div>
          </div>
          <p className={`mt-2 rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold ${
            etat.diagonales.commun ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-50 text-slate-600'
          }`}>
            {etat.diagonales.commun
              ? 'Les deux diagonales ont le MÊME milieu — le point rouge.'
              : `Les milieux sont distants de ${fr(arrondi(etat.diagonales.ecartMilieux, 0), 0)}.`}
          </p>
        </div>
      )}

      {/* Le verdict global, en une phrase. */}
      {etat && !defi && (
        <div className={`rounded-2xl border-2 p-3 text-center ${
          etat.parallelogramme ? 'border-violet-300 bg-violet-50' : 'border-amber-300 bg-amber-50'
        }`}>
          <p className={`text-sm font-bold ${etat.parallelogramme ? 'text-violet-900' : 'text-amber-900'}`}>
            {etat.parallelogramme
              ? 'ABCD est un parallélogramme.'
              : 'ABCD n’est pas un parallélogramme.'}
          </p>
        </div>
      )}

      {/* Le retour du défi : la DISTANCE, jamais l'aimantation. */}
      {defi && Cpropose && (
        <div
          data-defi={gagne ? 'gagne' : 'en-cours'}
          className={`rounded-2xl border-2 p-3 text-center ${
            gagne ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'
          }`}
        >
          <p className={`text-sm font-bold ${gagne ? 'text-emerald-900' : 'text-amber-900'}`}>
            {gagne
              ? 'C’est exactement là. Le trajet de B vers C est le même que celui de A vers D.'
              : `Pas encore : ton point est à ${fr(arrondi(ecartDefi, 0), 0)} de la bonne place.`}
          </p>
          {!gagne && (
            <p className="mt-1 text-xs text-amber-800">
              Reporte le trajet de A vers D en partant de B — la même longueur, la même direction,
              le même sens.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export { HIT_R };
