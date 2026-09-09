import React, { useMemo } from 'react';
import { patronPyramide, patronSeReferme, arrondi, fr } from './espace4e';

/**
 * PatronLab — les quatre triangles rabattus, et la longueur qu'on se trompe
 * de prendre.
 *
 * Activity              choisir la longueur donnée aux quatre triangles
 *                       latéraux, puis les rabattre un par un autour du carré
 *                       de base et tenter de refermer la pyramide.
 * Mathematical objective la hauteur d'une face latérale — l'apothème — n'est
 *                       ni la hauteur de la pyramide, ni son arête latérale.
 *                       C'est elle, et elle seule, qui fait se refermer le
 *                       patron.
 * Student action        choisir une longueur candidate, poser les triangles,
 *                       refermer.
 * Controlled variable   la longueur proposée pour les triangles ; le côté de
 *                       la base et la hauteur de la pyramide sont fixés par le
 *                       module.
 * Mathematical state    `patronPyramide(cote, hauteur)` fournit les pièces et
 *                       le CADRE ; `patronSeReferme` juge la proposition par
 *                       une condition mathématique, jamais à l'œil.
 * Visual consequence    avec la bonne longueur, les quatre pointes se
 *                       rejoignent ; avec la hauteur, les triangles sont trop
 *                       courts et le solide reste ouvert.
 * Expected observation  « le patron ne se referme qu'avec la longueur du
 *                       milieu — ni la plus petite, ni la plus grande ».
 * Misconception targeted prendre la hauteur de la pyramide comme hauteur des
 *                       faces.
 *
 * SÉCURITÉ VISUELLE : le viewBox est DÉRIVÉ de `patron.cadre`, que le noyau
 * calcule et qu'un test vérifie contenir toutes les pièces — pour toutes les
 * dimensions atteignables. Le cadre est de plus élargi à la plus grande des
 * longueurs candidates, afin qu'un patron ERRONÉ (triangles trop longs) ne
 * déborde pas non plus. Aucune mesure n'est écrite dans le SVG.
 *
 * REJOUABLE : on peut changer de longueur candidate et recommencer à tout
 * moment ; rien n'est jamais figé par l'avancement.
 */
export const MARGE = 1.2;

/**
 * Les pièces du patron avec une longueur de triangle IMPOSÉE — c'est ce que
 * l'élève construit quand il se trompe. Exporté pour le test.
 */
export function patronAvec(cote, longueur) {
  const c = cote;
  const a = longueur;
  return {
    base: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: c, y: c }, { x: 0, y: c }],
    triangles: [
      { id: 'bas', sommets: [{ x: 0, y: 0 }, { x: c, y: 0 }, { x: c / 2, y: -a }] },
      { id: 'droite', sommets: [{ x: c, y: 0 }, { x: c, y: c }, { x: c + a, y: c / 2 }] },
      { id: 'haut', sommets: [{ x: c, y: c }, { x: 0, y: c }, { x: c / 2, y: c + a }] },
      { id: 'gauche', sommets: [{ x: 0, y: c }, { x: 0, y: 0 }, { x: -a, y: c / 2 }] },
    ],
  };
}

/** Le cadre qui contient le patron pour la PLUS GRANDE longueur candidate. */
export function cadreDe(cote, longueurMax) {
  const a = longueurMax;
  return {
    minX: -a - MARGE,
    maxX: cote + a + MARGE,
    minY: -a - MARGE,
    maxY: cote + a + MARGE,
  };
}

const ORDRE = ['bas', 'droite', 'haut', 'gauche'];
const NOMS = { bas: 'en bas', droite: 'à droite', haut: 'en haut', gauche: 'à gauche' };

/**
 * TOLÉRANCE — elle vient de l'appelant, jamais d'ici.
 *
 * Le module propose des longueurs ARRONDIES (c'est ce que l'élève lit), et la
 * bonne candidate diffère donc de l'apothème exact de quelques millionièmes.
 * Avec une tolérance codée en dur plus fine que cet arrondi, le labo déclarait
 * « le solide reste ouvert : il aurait fallu 7,21 cm » alors que l'élève VENAIT
 * de choisir 7,21 cm — la manipulation contredisait son propre verdict.
 * Défaut trouvé au navigateur, corrigé en faisant juger le labo avec la MÊME
 * tolérance que celle qui a servi à composer les candidates.
 */
export default function PatronLab({
  cote, hauteur, longueur, longueurMax, tolerance = 1e-3, posees, onPoser, onRecommencer,
}) {
  const juste = patronPyramide(cote, hauteur);
  const pieces = useMemo(() => patronAvec(cote, longueur), [cote, longueur]);
  const cadre = useMemo(() => cadreDe(cote, longueurMax), [cote, longueurMax]);

  const referme = patronSeReferme(cote, hauteur, longueur, tolerance);
  const toutes = posees.length === 4;

  const w = cadre.maxX - cadre.minX;
  const h = cadre.maxY - cadre.minY;
  const viewBox = `${cadre.minX} ${-cadre.maxY} ${w} ${h}`;
  const t = w / 60; // épaisseur de trait, à l'échelle du cadre
  const pt = (q) => `${q.x},${-q.y}`;

  return (
    <div className="space-y-3" role="group" aria-label="Patron de la pyramide à construire">
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-2">
        <svg
          viewBox={viewBox}
          className="mx-auto w-full max-w-[320px]"
          role="img"
          aria-label={`Patron en construction : ${posees.length} triangle(s) posé(s) sur 4, autour d’un carré de ${cote} cm de côté`}
        >
          {/* Le carré de base, toujours là. */}
          <polygon points={pieces.base.map(pt).join(' ')} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.14 * t} />

          {/* Les emplacements libres, en pointillé — la cible du geste. */}
          {pieces.triangles.map((tri) =>
            posees.includes(tri.id) ? null : (
              <polygon
                key={`vide-${tri.id}`}
                points={tri.sommets.map(pt).join(' ')}
                fill="transparent"
                stroke="#cbd5e1"
                strokeWidth={0.1 * t}
                strokeDasharray={`${0.3 * t} ${0.25 * t}`}
              />
            )
          )}

          {/* Les triangles posés. */}
          {pieces.triangles.map((tri) =>
            posees.includes(tri.id) ? (
              <polygon
                key={tri.id}
                points={tri.sommets.map(pt).join(' ')}
                fill={referme ? '#38bdf8' : '#fbbf24'}
                fillOpacity={0.3}
                stroke={referme ? '#0369a1' : '#b45309'}
                strokeWidth={0.14 * t}
              />
            ) : null
          )}
        </svg>
      </div>

      {/* Les quatre boutons de pose — DOM, tactiles, ≥ 44 px. */}
      <div className="grid grid-cols-2 gap-2">
        {ORDRE.map((id) => {
          const pose = posees.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onPoser(id)}
              disabled={pose}
              className={`min-h-[44px] rounded-xl border-2 px-3 py-2 text-sm font-bold ${
                pose
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300'
              }`}
            >
              {pose ? `✓ triangle ${NOMS[id]}` : `poser ${NOMS[id]}`}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Longueur donnée aux triangles : <strong className="font-mono">{fr(arrondi(longueur, 2), 2)} cm</strong>
        </p>
        <button
          type="button"
          onClick={onRecommencer}
          className="min-h-[44px] rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
        >
          ↺ Recommencer
        </button>
      </div>

      {/* LE VERDICT — jugé par le noyau, pas à l'œil. */}
      {toutes && (
        <p
          data-patron-verdict={referme ? 'ferme' : 'ouvert'}
          className={`rounded-xl px-3 py-2.5 text-center text-sm font-semibold ${
            referme ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
          }`}
        >
          {referme
            ? `Les quatre pointes se rejoignent exactement : le patron se referme sur une pyramide de ${cote} cm de côté et ${hauteur} cm de haut.`
            : `Les quatre pointes ne se rejoignent pas : avec ${fr(arrondi(longueur, 2), 2)} cm, le solide reste ouvert. Il aurait fallu ${fr(arrondi(juste.apotheme, 2), 2)} cm.`}
        </p>
      )}
    </div>
  );
}
