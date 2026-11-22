import { kidGeometry, SKINS, HAIRS, OUTFITS, SCARVES } from './kidFigure.js';

/**
 * UN ENFANT DESSINÉ (11–13 ans) — un `<g>` SVG posé dans la scène par `cx`, `top` (sommet du crâne) et `foot` (le sol).
 *
 * Dessiné en code, jamais généré (root CLAUDE.md) : l'enfant RÉAGIT — il grandit sous le doigt, change d'humeur quand
 * la phrase devient vraie, porte « ? » tant que sa taille est inconnue — et sa hauteur EST la mesure (la géométrie est
 * dans ./kidFigure.js, testée : le sommet du crâne est `top`, les semelles touchent `foot`). Sweat à capuche, cheveux
 * (courts ou bouclés) ou un foulard (`hairStyle: 'hijab'` — foulard drapé sur les épaules, bandeau au front, épingle ;
 * dessiné pour la plateforme algérienne, 2026-10-14), et sur demande une tunique longue sur un pantalon large (`tunic`) ;
 * visage avec des yeux à reflet, joues, sourire ; une ombre au sol. Aucune coiffure n'est imposée par défaut : le foulard
 * et la tunique ne viennent que si on les demande (le dessin des personnages pour la France est une décision ouverte du
 * propriétaire, plan §7, 7). Les couleurs viennent d'ensembles inventés (`OUTFITS`).
 *
 * Props : `cx`, `top`, `foot` ; `skin`, `hair`, `outfit` (clés de SKINS / HAIRS / OUTFITS), `hairStyle`, `mood`
 * ('happy' | 'neutral' | 'wonder' | 'proud'), `scarf` (clé de SCARVES, la couleur du foulard) et `tunic` (tunique longue ; jamais par défaut), `unknown` + `mark` (le badge sur la poitrine), `dim` (atténué),
 * `shadow`, et les attributs `data-*` passés au groupe.
 */
export default function KidFigure({
  cx, top, foot, skin = 'light', hair = 'brown', outfit = 'blue', hairStyle = 'short', mood = 'happy',
  scarf = 'rose', tunic = false, unknown = false, mark = '?', dim = false, shadow = true, ...rest
}) {
  const g = kidGeometry({ cx, top, foot });
  const { u, head, hs, drop } = g;
  const S = SKINS[skin] ?? SKINS.light;
  const hc = HAIRS[hair] ?? HAIRS.brown;
  const O = OUTFITS[outfit] ?? OUTFITS.blue;
  const X = (dx) => cx + dx * u; // le corps
  const T = (dy) => top + (dy + drop) * u; // le tronc et les bras, descendus sous la tête agrandie
  const HX = (dx) => cx + dx * hs * u; // la tête et les cheveux
  const HY = (dy) => top + dy * hs * u;
  const sw = (w) => Math.max(0.6, w * u);
  const hijab = hairStyle === 'hijab';
  const SC = SCARVES[scarf] ?? SCARVES.rose;
  // une tunique longue (jusqu'à mi-cuisse) sur un pantalon large : seulement sur demande, jamais déduite de la coiffure
  const long = Boolean(tunic);
  const hemTop = long ? 61.2 : 46.8;
  const hemBot = long ? 64.6 : 50.2;
  const flare = long ? 12.2 : 10.5;
  const legOut = long ? 9 : 8.1;
  const legSplit = g.waistY + 7 * u;
  const arms = (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${X(s * 10.6)} ${T(20.4)} Q${X(s * 14)} ${T(30)} ${X(s * 13.4)} ${T(44.4)} L${X(s * 9.3)} ${T(44.8)} Q${X(s * 9.5)} ${T(32)} ${X(s * 9.4)} ${T(25)} Z`} fill={O.top} />
          <rect x={s < 0 ? X(-13.5) : X(9.3)} y={T(43.2)} width={4.2 * u} height={2.3 * u} rx={1 * u} fill={O.topDark} />
          <ellipse cx={X(s * 11.4)} cy={T(47.4)} rx={2.2 * u} ry={2.5 * u} fill={S.skin} />
        </g>
      ))}
    </g>
  );

  return (
    <g opacity={dim ? 0.55 : 1} {...rest}>
      {shadow && <ellipse cx={cx} cy={foot - 0.3 * u} rx={12.5 * u} ry={1.8 * u} fill="#1E1B4B" opacity={0.1} />}

      {/* derrière : la capuche */}
      {!hijab && (
        <path d={`M${X(-8.2)} ${T(18.6)} Q${X(-8.6)} ${T(12.6)} ${X(0)} ${T(12.2)} Q${X(8.6)} ${T(12.6)} ${X(8.2)} ${T(18.6)} Z`} fill={O.topDark} />
      )}

      {/* le pantalon : les hanches d'un bloc, puis deux jambes ; les ourlets ; les chaussures */}
      <path
        d={`M${X(-8.8)} ${g.waistY} L${X(8.8)} ${g.waistY} L${X(8.5)} ${legSplit} L${X(legOut)} ${g.shoeTop} L${X(0.7)} ${g.shoeTop} L${X(0.4)} ${legSplit} Q${cx} ${legSplit - 1.4 * u} ${X(-0.4)} ${legSplit} L${X(-0.7)} ${g.shoeTop} L${X(-legOut)} ${g.shoeTop} L${X(-8.5)} ${legSplit} Z`}
        fill={O.pants}
      />
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s < 0 ? X(-8.3) : X(1)} y={g.shoeTop - 2.3 * u} width={7.3 * u} height={2.3 * u} rx={0.5 * u} fill="#FFFFFF" opacity={0.16} />
          <path d={`M${X(s * 4.6)} ${legSplit + 2 * u} L${X(s * 4.5)} ${g.kneeY + 4 * u}`} stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={sw(0.5)} />
          <path d={`M${X(s * 0.4)} ${foot - 4.8 * u} Q${X(s * 0.4)} ${foot - 5.7 * u} ${X(s * 3.2)} ${foot - 5.7 * u} L${X(s * 7.4)} ${foot - 5.7 * u} Q${X(s * 10.9)} ${foot - 5.1 * u} ${X(s * 10.7)} ${foot - 1.4 * u} L${X(s * 0.4)} ${foot - 1.4 * u} Z`} fill={O.shoes} />
          <rect x={s < 0 ? X(-10.9) : X(0.3)} y={foot - 1.8 * u} width={10.6 * u} height={1.8 * u} rx={0.9 * u} fill="#FFFFFF" />
          <line x1={X(s * 3.4)} x2={X(s * 5.8)} y1={foot - 4.4 * u} y2={foot - 4.4 * u} stroke="#FFFFFF" strokeWidth={sw(0.55)} strokeLinecap="round" />
          <line x1={X(s * 3.8)} x2={X(s * 6.2)} y1={foot - 3.3 * u} y2={foot - 3.3 * u} stroke="#FFFFFF" strokeWidth={sw(0.55)} strokeLinecap="round" />
        </g>
      ))}

      {!long && arms}

      {/* le haut : sweat à capuche, ou tunique longue — corps, bande du bas, poche ou broderie */}
      <path
        d={`M${X(-4.4)} ${T(16.4)} Q${X(-10.2)} ${T(16.6)} ${X(-11.1)} ${T(21)} L${X(-flare)} ${T(hemTop + 0.2)} Q${X(-flare)} ${T(hemBot)} ${X(-flare + 3.1)} ${T(hemBot)} L${X(flare - 3.1)} ${T(hemBot)} Q${X(flare)} ${T(hemBot)} ${X(flare)} ${T(hemTop + 0.2)} L${X(11.1)} ${T(21)} Q${X(10.2)} ${T(16.6)} ${X(4.4)} ${T(16.4)} Q${X(0)} ${T(19.6)} ${X(-4.4)} ${T(16.4)} Z`}
        fill={O.top}
      />
      <path d={`M${X(-flare)} ${T(hemTop)} L${X(flare)} ${T(hemTop)} L${X(flare)} ${T(hemTop + 0.2)} Q${X(flare)} ${T(hemBot)} ${X(flare - 3.1)} ${T(hemBot)} L${X(-flare + 3.1)} ${T(hemBot)} Q${X(-flare)} ${T(hemBot)} ${X(-flare)} ${T(hemTop + 0.2)} Z`} fill={O.topDark} />
      {long ? (
        <g data-kid-tunic>
          <line x1={cx} x2={cx} y1={T(27)} y2={T(hemTop)} stroke={O.topDark} strokeWidth={sw(0.5)} opacity={0.55} />
          {[30, 34, 38].map((dy) => <circle key={dy} cx={cx} cy={T(dy)} r={0.6 * u} fill={O.trim} />)}
          <line x1={X(-flare + 0.6)} x2={X(flare - 0.6)} y1={T(hemTop - 1.4)} y2={T(hemTop - 1.4)} stroke={O.trim} strokeWidth={sw(0.6)} strokeDasharray={`${1.2 * u} ${0.9 * u}`} />
        </g>
      ) : (
        <path d={`M${X(-6.2)} ${T(36.4)} Q${X(0)} ${T(35.6)} ${X(6.2)} ${T(36.4)} L${X(7.3)} ${T(45)} L${X(-7.3)} ${T(45)} Z`} fill={O.topDark} opacity={0.7} />
      )}
      {[-1, 1].map((s) => (
        <path key={s} d={`M${X(s * 9.4)} ${T(24)} Q${X(s * 9.9)} ${T(30)} ${X(s * 9.3)} ${T(36)}`} fill="none" stroke={O.topDark} strokeWidth={sw(0.5)} opacity={0.6} />
      ))}

      {long && arms}

      {/* le cou, l'encolure de la capuche et ses cordons (un hijab couvre l'encolure) */}
      {!hijab && (
        <>
          <rect x={cx - g.neck.w / 2} y={g.neck.y} width={g.neck.w} height={T(17.4) - g.neck.y} fill={S.shade} />
          <path d={`M${X(-6)} ${T(16)} Q${X(0)} ${T(23.4)} ${X(6)} ${T(16)}`} fill="none" stroke={O.topDark} strokeWidth={sw(1.9)} strokeLinecap="round" />
          {[-1, 1].map((s) => (
            <g key={s}>
              <line x1={X(s * 1.7)} x2={X(s * 1.9)} y1={T(19.6)} y2={T(27.6)} stroke={O.trim} strokeWidth={sw(0.6)} strokeLinecap="round" />
              <circle cx={X(s * 1.9)} cy={T(28)} r={0.65 * u} fill={O.trim} />
            </g>
          ))}
        </>
      )}

      {/* le foulard : il couvre la tête, les oreilles, le cou et les épaules, et tombe en pointe arrondie sur la poitrine ;
          son sommet EST le sommet du crâne (la taille ne triche pas) */}
      {hijab && (
        <g data-kid-hijab>
          <path
            d={`M${cx} ${top} C${HX(-5.6)} ${top} ${HX(-8.9)} ${HY(3.2)} ${HX(-8.9)} ${HY(9.5)} C${HX(-9)} ${HY(13.5)} ${X(-9.4)} ${T(15)} ${X(-10.6)} ${T(19.5)} Q${X(-11.2)} ${T(25.5)} ${X(-6.4)} ${T(29)} Q${cx} ${T(32.4)} ${X(6.4)} ${T(29)} Q${X(11.2)} ${T(25.5)} ${X(10.6)} ${T(19.5)} C${X(9.4)} ${T(15)} ${HX(9)} ${HY(13.5)} ${HX(8.9)} ${HY(9.5)} C${HX(8.9)} ${HY(3.2)} ${HX(5.6)} ${top} ${cx} ${top} Z`}
            fill={SC.main}
          />
          {/* les plis : sous le menton, puis sur l'épaule */}
          <path d={`M${HX(-6.3)} ${HY(14.6)} Q${cx} ${T(24)} ${HX(6.3)} ${HY(14.6)}`} fill="none" stroke={SC.dark} strokeWidth={sw(0.7)} strokeLinecap="round" />
          <path d={`M${X(-9.4)} ${T(20.5)} Q${X(-7)} ${T(26)} ${X(-3)} ${T(28.6)}`} fill="none" stroke={SC.dark} strokeWidth={sw(0.55)} strokeLinecap="round" opacity={0.8} />
          <path d={`M${X(9.4)} ${T(20.5)} Q${X(7.4)} ${T(24.5)} ${X(4.6)} ${T(26.6)}`} fill="none" stroke={SC.dark} strokeWidth={sw(0.55)} strokeLinecap="round" opacity={0.8} />
          {/* l'épingle */}
          <circle cx={X(5.4)} cy={T(21.4)} r={0.75 * u} fill="#FFFFFF" stroke={SC.dark} strokeWidth={sw(0.3)} />
        </g>
      )}

      {/* la tête et les oreilles */}
      {!hijab && [-1, 1].map((s) => <ellipse key={s} cx={HX(s * 6.8)} cy={head.cy + 0.9 * hs * u} rx={1.5 * hs * u} ry={1.9 * hs * u} fill={S.skin} />)}
      {hijab ? (
        <>
          <ellipse cx={cx} cy={head.cy + 1 * hs * u} rx={6 * hs * u} ry={6.9 * hs * u} fill={S.skin} />
          <ellipse cx={cx} cy={head.cy + 1 * hs * u} rx={6 * hs * u} ry={6.9 * hs * u} fill="none" stroke={SC.dark} strokeWidth={sw(0.8)} />
          {/* le bandeau (sous-foulard) au front */}
          <path d={`M${HX(-5.7)} ${HY(7.4)} Q${cx} ${HY(0.9)} ${HX(5.7)} ${HY(7.4)} Q${cx} ${HY(3.6)} ${HX(-5.7)} ${HY(7.4)} Z`} fill={SC.inner} stroke={SC.dark} strokeWidth={sw(0.55)} />
        </>
      ) : (
        <ellipse cx={cx} cy={head.cy} rx={head.rx} ry={head.ry} fill={S.skin} />
      )}

      {/* les cheveux de devant */}
      {hairStyle === 'short' && (
        <path d={`M${HX(-7.1)} ${HY(9)} C${HX(-7.7)} ${HY(1.6)} ${HX(-3.1)} ${top} ${cx} ${top} C${HX(3.1)} ${top} ${HX(7.7)} ${HY(1.6)} ${HX(7.1)} ${HY(9)} L${HX(6.3)} ${HY(6.8)} Q${HX(3.4)} ${HY(4.2)} ${HX(0.6)} ${HY(5.2)} Q${HX(-2.4)} ${HY(3.6)} ${HX(-4.6)} ${HY(5.6)} Q${HX(-6)} ${HY(6.3)} ${HX(-6.4)} ${HY(7.6)} Z`} fill={hc} />
      )}
      {hairStyle === 'curly' && (
        <g fill={hc}>
          <path d={`M${HX(-7.2)} ${HY(8.6)} C${HX(-7.8)} ${HY(1.8)} ${HX(-3.1)} ${top} ${cx} ${top} C${HX(3.1)} ${top} ${HX(7.8)} ${HY(1.8)} ${HX(7.2)} ${HY(8.6)} Q${HX(4)} ${HY(4.6)} ${cx} ${HY(5.4)} Q${HX(-4)} ${HY(4.6)} ${HX(-7.2)} ${HY(8.6)} Z`} />
          {[-5.6, -2.9, 0, 2.9, 5.6].map((dx) => <circle key={dx} cx={HX(dx)} cy={HY(5 + Math.abs(dx) * 0.12)} r={1.9 * hs * u} />)}
        </g>
      )}

      <Face g={g} S={S} hc={hijab ? '#3B2A20' : hc} mood={mood} />

      {/* l'inconnue : un badge « ? » sur la poitrine */}
      {unknown && mark && (
        <g data-kid-unknown>
          <circle cx={cx} cy={T(31)} r={4.5 * u} fill="#FFFFFF" opacity={0.95} />
          <text x={cx} y={T(31) + 2.5 * u} textAnchor="middle" fontSize={Math.max(10, 7.2 * u)} fontWeight={900} fill={O.topDark}>{mark}</text>
        </g>
      )}
    </g>
  );
}

function Face({ g, S, hc, mood }) {
  const { cx, hs } = g;
  const u = g.u * hs;
  const X = (dx) => cx + dx * u;
  const ey = g.eyeY;
  const my = g.mouthY;
  const sw = (w) => Math.max(0.5, w * u);
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s}>
          <path d={`M${X(s * 1.3)} ${ey - 2.6 * u} Q${X(s * 2.6)} ${ey - 3.4 * u} ${X(s * 3.9)} ${ey - 2.5 * u}`} fill="none" stroke={hc} strokeWidth={sw(0.6)} strokeLinecap="round" />
          <ellipse cx={X(s * 2.6)} cy={ey} rx={1.45 * u} ry={mood === 'proud' ? 0.7 * u : 1.7 * u} fill="#FFFFFF" />
          {mood !== 'proud' && <circle cx={X(s * 2.6)} cy={ey + 0.2 * u} r={1.12 * u} fill="#2B1B12" />}
          {mood !== 'proud' && <circle cx={X(s * 2.6) + 0.38 * u} cy={ey - 0.3 * u} r={0.4 * u} fill="#FFFFFF" />}
          {mood === 'proud' && <path d={`M${X(s * 2.6) - 1.3 * u} ${ey + 0.3 * u} Q${X(s * 2.6)} ${ey - 1 * u} ${X(s * 2.6) + 1.3 * u} ${ey + 0.3 * u}`} fill="none" stroke="#2B1B12" strokeWidth={sw(0.55)} strokeLinecap="round" />}
          <circle cx={X(s * 4.4)} cy={ey + 2.5 * u} r={1.15 * u} fill={S.blush} opacity={0.55} />
        </g>
      ))}
      <path d={`M${X(-0.2)} ${ey + 1.4 * u} Q${X(0.5)} ${ey + 2.3 * u} ${X(-0.1)} ${ey + 2.7 * u}`} fill="none" stroke={S.shade} strokeWidth={sw(0.5)} strokeLinecap="round" />
      {mood === 'wonder' && <ellipse cx={cx} cy={my + 0.4 * u} rx={1 * u} ry={1.3 * u} fill="#9F1239" />}
      {mood === 'neutral' && <path d={`M${X(-1.5)} ${my} Q${cx} ${my + 0.8 * u} ${X(1.5)} ${my}`} fill="none" stroke="#9F1239" strokeWidth={sw(0.6)} strokeLinecap="round" />}
      {(mood === 'happy' || mood === 'proud') && (
        <g>
          <path d={`M${X(-2.1)} ${my - 0.3 * u} Q${cx} ${my + 0.1 * u} ${X(2.1)} ${my - 0.3 * u} Q${cx} ${my + 3.1 * u} ${X(-2.1)} ${my - 0.3 * u} Z`} fill="#9F1239" />
          <path d={`M${X(-1.6)} ${my - 0.1 * u} Q${cx} ${my + 0.3 * u} ${X(1.6)} ${my - 0.1 * u} L${X(1.4)} ${my + 0.6 * u} Q${cx} ${my + 0.9 * u} ${X(-1.4)} ${my + 0.6 * u} Z`} fill="#FFFFFF" />
        </g>
      )}
    </g>
  );
}
