import React from 'react';
import { coordsDansRepere, vecNom, produitEspace, fr, frVec3 } from './espaceUtils';

/**
 * ScalaireEspace — le calcul du produit scalaire, TERME PAR TERME, dans le DOM.
 *
 * POURQUOI UN TABLEAU ET NON UNE FIGURE. La promesse du module 4 est que la
 * formule du plan reçoit UN TERME DE PLUS, et rien d'autre. Ce qu'il faut donc
 * rendre visible, ce n'est pas une géométrie — c'est une COLONNE qui s'ajoute à
 * deux colonnes déjà connues. Un dessin de deux vecteurs dans un cube ne
 * montrerait pas cela ; un tableau à trois colonnes, si, et il le montre à
 * l'endroit exact où l'élève doit regarder.
 *
 * Rien n'est écrit à la main : les six coordonnées et les trois produits sont
 * dérivés des deux couples de sommets, et le total est `produitEspace` — la
 * même fonction que celle dont les tests vérifient qu'elle rend un ENTIER exact.
 *
 * `montrerTroisieme={false}` masque la troisième colonne : c'est l'état
 * « comme au plan », celui dont le module part avant d'ajouter le terme.
 */
export default function ScalaireEspace({
  u: [ua, ub],
  v: [va, vb],
  montrerTroisieme = true,
  montrerTotal = true,
}) {
  const u = coordsDansRepere(vecNom(ua, ub));
  const v = coordsDansRepere(vecNom(va, vb));
  const termes = [
    { cle: 'x', a: u.x, b: v.x, label: 'abscisse × abscisse' },
    { cle: 'y', a: u.y, b: v.y, label: 'ordonnée × ordonnée' },
    { cle: 'z', a: u.z, b: v.z, label: 'cote × cote' },
  ];
  const visibles = montrerTroisieme ? termes : termes.slice(0, 2);
  const total = montrerTroisieme
    ? produitEspace(u, v)
    : visibles.reduce((s, t) => s + t.a * t.b, 0);

  return (
    <div className="space-y-2" data-testid="scalaire-espace">
      <div className="flex flex-wrap gap-3 text-[13px]">
        <span>
          <strong className="font-mono">{ua}{ub}</strong>{' '}
          <span className="font-mono">{frVec3(u)}</span>
        </span>
        <span>
          <strong className="font-mono">{va}{vb}</strong>{' '}
          <span className="font-mono">{frVec3(v)}</span>
        </span>
      </div>

      <div className={`grid gap-2 ${montrerTroisieme ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {visibles.map((t, i) => (
          <div
            key={t.cle}
            className={`rounded-xl border-2 px-2 py-2 text-center ${
              i === 2 ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'
            }`}
            data-testid={`terme-${t.cle}`}
          >
            <div className="text-[13px] text-slate-600">{t.label}</div>
            <div className="font-mono text-[13px] text-slate-500 mt-0.5">
              {fr(t.a)} × {fr(t.b)}
            </div>
            <div className={`font-mono text-xl font-black tabular-nums mt-0.5 ${
              i === 2 ? 'text-emerald-800' : 'text-slate-800'
            }`}>
              {fr(t.a * t.b)}
            </div>
          </div>
        ))}
      </div>

      {montrerTotal && (
        <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3 text-center">
          <div className="text-[13px] font-semibold text-emerald-800">
            {montrerTroisieme
              ? 'la somme des trois produits'
              : 'la somme des deux premiers produits seulement'}
          </div>
          {/* Un terme négatif est PARENTHÉSÉ : « 1 + −1 + 0 » se lit mal et
              donne l'impression d'une faute de frappe. */}
          <div className="font-mono text-xs text-emerald-700 mt-0.5">
            {visibles
              .map((t) => (t.a * t.b < 0 ? `(${fr(t.a * t.b)})` : fr(t.a * t.b)))
              .join(' + ')}
          </div>
          <div className="font-mono text-3xl font-black tabular-nums text-emerald-900 mt-1">
            {fr(total)}
          </div>
        </div>
      )}
    </div>
  );
}
