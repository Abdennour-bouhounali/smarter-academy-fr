import React from 'react';
import GeoScene, { Dot, Seg } from '../../../../../common/geo5e/GeoScene';
import AngleArc from '../../../../../common/geo5e/AngleArc';
import { clipLine } from '../../../../../common/geo5e/geo5e';
import { droite, pointsDe, configuration } from './angles';

const W = 720;
const H = 360;

/**
 * Les trois configurations du module 6.
 *
 * LA RÉPONSE EST DÉDUITE, PAS SAISIE. Chaque cas déclare l'angle connu et le
 * type de chemin ; la valeur attendue s'en déduit (`egal` → la même mesure,
 * `supplementaire` → 180 moins). L'arc dessiné et le nombre attendu viennent
 * du même calcul : on ne peut pas afficher 118° et attendre 62°.
 *
 * Le `piege` est la valeur qu'obtient l'élève qui s'arrête à la première
 * relation au lieu d'enchaîner — l'erreur que le module vise.
 */
const BRUTS = [
  {
    id: 'ch1',
    titre: 'Le pont',
    connu: 118,
    secante: 62,
    chemin: 'supplementaire',
    question: 'Combien mesure l’angle orange ?',
  },
  {
    id: 'ch2',
    titre: 'La charpente',
    connu: 47,
    secante: 47,
    chemin: 'supplementaire',
    question: 'Combien mesure l’angle orange ?',
  },
  {
    id: 'ch3',
    titre: 'L’escalier',
    connu: 73,
    secante: 107,
    chemin: 'egal',
    question: 'Combien mesure l’angle orange ?',
  },
];

export const ENCHAINEMENTS = BRUTS.map((b) => {
  const reponse = b.chemin === 'egal' ? b.connu : 180 - b.connu;
  const piege = b.chemin === 'egal' ? 180 - b.connu : b.connu;
  return {
    ...b,
    reponse,
    piege,
    explication: b.chemin === 'egal'
      ? `Deux étapes : l’angle correspondant de l’angle violet vaut ${b.connu}° (les droites sont parallèles), et son opposé par le sommet vaut lui aussi ${b.connu}°. L’angle orange mesure donc ${reponse}°.`
      : `Deux étapes : l’alterne-interne de l’angle violet vaut ${b.connu}° (les droites sont parallèles) ; l’angle orange lui est adjacent, il complète l’angle plat. Donc 180 − ${b.connu} = ${reponse}°.`,
    explicationPiege: b.chemin === 'egal'
      ? `${piege}° serait juste si l’angle orange était ADJACENT à l’angle violet. Ici il lui est relié par deux égalités successives : il vaut donc la même mesure, ${reponse}°.`
      : `${piege}° est la mesure de l’angle intermédiaire, pas celle de l’angle orange. Il reste une étape : l’angle orange est adjacent à celui-là, d’où 180 − ${piege} = ${reponse}°.`,
  };
});

/**
 * EnchainerLab — la figure d'une configuration à relais.
 *
 * Deux angles sont marqués : le connu (violet) et le cherché (orange). Tant
 * que l'élève n'a pas répondu, la valeur du cherché s'affiche « ? » — sinon la
 * figure donnerait la réponse.
 */
export default function EnchainerLab({ cas, resolu }) {
  const y1 = 105;
  const y2 = 262;
  const d1 = droite({ x: W / 2, y: y1 }, 0);
  const d2 = droite({ x: W / 2, y: y2 }, 0);      // PARALLÈLES : l'hypothèse
  const s = droite({ x: W / 2, y: (y1 + y2) / 2 }, cas.secante);

  let config = null;
  try {
    config = configuration(d1, d2, s);
  } catch {
    config = null;
  }

  /** L'angle du sommet dont la mesure est la plus proche d'une cible. */
  const auSommet = (som) => (config ? config.angles.filter((a) => a.sommet === som) : []);
  const proche = (liste, cible) => (liste.length
    ? liste.reduce((best, a) => (Math.abs(a.mesure - cible) < Math.abs(best.mesure - cible) ? a : best), liste[0])
    : null);

  const connu = proche(auSommet('A'), cas.connu);
  const cherche = proche(auSommet('B'), cas.reponse);

  const trace = (d) => {
    const [a, b] = pointsDe(d, 2000);
    return clipLine(a, b, W, H, 6);
  };
  const [a1, b1] = trace(d1);
  const [a2, b2] = trace(d2);
  const [as, bs] = trace(s);

  return (
    <div className="rounded-2xl border-2 border-rose-200 bg-white overflow-hidden">
      <div className="px-4 py-2 bg-rose-50 border-b-2 border-rose-100">
        <span className="text-sm font-bold text-rose-900">{cas.titre}</span>
      </div>
      <GeoScene
        width={W} height={H}
        labels={[]}
        obstacles={[]}
        ariaLabel={`${cas.titre} : deux droites parallèles coupées par une sécante, un angle connu et un angle à trouver`}
      >
        <rect x={0} y={0} width={W} height={H} fill="#fefefe" data-visual-role="decor" />
        <Seg a={a1} b={b1} color="#334155" w={3.5} />
        <Seg a={a2} b={b2} color="#334155" w={3.5} />
        <Seg a={as} b={bs} color="#0ea5e9" w={2.5} dash="9 6" />

        {connu && <AngleArc a={connu.a} b={connu.P} c={connu.c} r={42} color="#7c3aed" showValue />}
        {cherche && (
          <AngleArc
            a={cherche.a} b={cherche.P} c={cherche.c}
            r={42} color="#f59e0b"
            showValue
            value={resolu ? undefined : '?'}
          />
        )}
        {config && (
          <>
            <Dot p={config.A} color="#334155" r={5} />
            <Dot p={config.B} color="#334155" r={5} />
          </>
        )}
      </GeoScene>
    </div>
  );
}

export { W as ENCH_W, H as ENCH_H };
