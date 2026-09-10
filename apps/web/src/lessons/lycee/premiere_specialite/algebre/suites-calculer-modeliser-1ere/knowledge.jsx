import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Suites : calculer et modéliser » — SOURCE UNIQUE
 * (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit ICI et
 * nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 *
 * VISUELS EN DOM, jamais en <text> SVG. Le sujet est un CHEMIN puis un
 * ESCALIER DE COLONNES : des rectangles étiquetés restent lisibles à toute
 * taille, là où des étiquettes SVG posées près de colonnes qui grandissent
 * finiraient par se chevaucher. C'est la règle §6bis.4 appliquée avant
 * d'avoir le défaut.
 */

/** Un chemin de rangs, en DOM : la marche, ou le saut par-dessus. */
function Chemin({ jusqua = 4, saut = false }) {
  const cases = Array.from({ length: jusqua + 1 }, (_, i) => i);
  return (
    <div className="relative py-3">
      {saut && (
        <div className="mb-1 text-center text-xs font-bold text-violet-700" aria-hidden="true">
          ⤻ un seul geste
        </div>
      )}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {cases.map((i) => (
          <React.Fragment key={i}>
            {i > 0 && !saut && (
              <span className="shrink-0 font-mono text-[13px] font-bold text-emerald-600">→</span>
            )}
            {i > 0 && saut && i < jusqua && (
              <span className="shrink-0 font-mono text-[13px] text-slate-300">·</span>
            )}
            <span
              className={`shrink-0 rounded-lg border px-2 py-1 text-center font-mono text-[13px] ${
                saut && i > 0 && i < jusqua
                  ? 'border-slate-200 bg-slate-50 text-slate-400'
                  : 'border-violet-200 bg-violet-50 text-violet-900'
              }`}
            >
              rang {i}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * Un escalier de colonnes, en DOM. La hauteur d'une colonne est une hauteur
 * CSS calculée depuis la valeur — le nombre lui-même reste écrit sous la
 * colonne, dans le DOM, pas posé dans le dessin.
 */
function Colonnes({ list, apparie = false }) {
  const max = Math.max(...list, 1);
  const nb = list.length;
  const partenaire = (i) => nb - 1 - i;
  const teintes = ['bg-emerald-400', 'bg-sky-400', 'bg-amber-400', 'bg-violet-400'];
  return (
    <div className="flex items-end justify-center gap-1.5 overflow-x-auto py-1">
      {list.map((v, i) => {
        const idxPaire = Math.min(i, partenaire(i));
        const centrale = apparie && i === partenaire(i);
        return (
          <div key={i} className="flex shrink-0 flex-col items-center gap-1">
            <div
              className={`w-7 rounded-t ${
                apparie ? (centrale ? 'bg-slate-400' : teintes[idxPaire % teintes.length]) : 'bg-slate-300'
              }`}
              style={{ height: `${8 + (v / max) * 56}px` }}
              aria-hidden="true"
            />
            <span className="font-mono text-[13px] font-bold tabular-nums text-slate-800">{v}</span>
            <span className="font-mono text-[13px] text-slate-400">n° {i}</span>
          </div>
        );
      })}
    </div>
  );
}

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'cout-du-pas-a-pas',
        type: 'concepts',
        title: 'Dérouler coûte, et le coût est évitable',
        summary:
          'Une définition de proche en proche oblige à faire tous les pas : pour le rang 30, il faut trente calculs. Une écriture qui part du rang donne le terme d’un seul coup.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div>
              <div className="mb-1 text-xs font-semibold text-emerald-800">de proche en proche : on marche</div>
              <Chemin jusqua={4} />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-violet-800">à partir du rang : on saute</div>
              <Chemin jusqua={4} saut />
            </div>
            <p>
              Les deux arrivent au <strong>même nombre</strong>. Ce qui change, c’est le nombre de
              calculs : trente d’un côté, un seul de l’autre.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Ce n’est pas une question de rapidité pour la rapidité : au rang 300 ou 3 000, la
              marche n’est plus faisable à la main du tout. Il faut donc une écriture qui n’en
              dépende pas.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le compteur de clics qui montait.</div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'terme-rang-arithmetique',
        type: 'regles',
        title: 'Le terme de rang n d’une suite arithmétique',
        summary:
          'Pour aller du rang 0 au rang n, on ajoute n fois la raison. D’où u(n) = u(0) + n × r, valable pour tout rang.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$u(n) = u(0) + n \\times r$$'}</MathText>
            </div>
            <p>
              Du rang 0 au rang 30, il y a <strong>30 pas</strong>, donc 30 fois la raison ajoutée.
              Avec u(0) = 5 et r = 3 : u(30) = 5 + 30 × 3 = <strong>95</strong>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le facteur est <strong>n</strong>, pas n + 1 : le rang 30 est atteint en 30 pas, même
              si la liste contient 31 cases. Compter les CASES au lieu des PAS ajoute une raison de
              trop.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trente marches remplacées par une ligne.</div>
          </div>
        ),
      },
      {
        id: 'raison-negative-meme-formule',
        type: 'regles',
        title: 'Une raison négative ne change pas la formule',
        summary:
          'Si r est négatif, u(n) = u(0) + n × r fonctionne à l’identique : c’est le signe de r qui fait descendre, pas un calcul différent.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 font-mono text-sm">
              u(0) = 100, r = −4<br />
              u(15) = 100 + 15 × (−4) = 100 − 60 = <strong>40</strong>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Écrire « 100 − 15 × 4 » donne le bon résultat, mais écrire « 100 + 15 × 4 = 160 » est
              l’erreur qui guette : le signe de la raison entre DANS la multiplication.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'terme-rang-geometrique',
        type: 'regles',
        title: 'Le terme de rang n d’une suite géométrique',
        summary:
          'Pour aller du rang 0 au rang n, on multiplie n fois par la raison. D’où u(n) = u(0) × q élevé à la puissance n.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$u(n) = u(0) \\times q^{\\,n}$$'}</MathText>
            </div>
            <p>
              n multiplications identiques, c’est exactement ce qu’écrit une puissance d’exposant n.
              Avec u(0) = 3 et q = 2 : u(10) = 3 × 2¹⁰ = 3 × 1 024 = <strong>3 072</strong>.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              u(0) × qⁿ n’est <strong>pas</strong> (u(0) × q)ⁿ : on n’élève que la raison. Et ce
              n’est pas non plus u(0) × q × n — multiplier n fois n’est pas multiplier par n.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les dix flèches « × 2 » repliées sur un exposant.</div>
          </div>
        ),
      },
      {
        id: 'mem-les-deux-sauts',
        type: 'memoriser',
        title: '⭐ Les deux écritures directes',
        summary: 'u(n) = u(0) + n × r pour l’une · u(n) = u(0) × qⁿ pour l’autre.',
        body: (
          <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
            <div className="text-lg font-black text-rose-700">u(n) = u(0) + n × r</div>
            <div className="text-lg font-black text-rose-700">u(n) = u(0) × qⁿ</div>
            <p className="text-xs text-rose-700">
              on ajoute n fois · on multiplie n fois — dans les deux cas, n pas depuis le rang 0
            </p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'appariement-de-gauss',
        type: 'concepts',
        title: 'Apparier le premier et le dernier',
        summary:
          'Dans une suite arithmétique, le premier + le dernier vaut autant que le deuxième + l’avant-dernier, et ainsi de suite : toutes les paires ont la même hauteur.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <Colonnes list={[5, 8, 11, 14, 17, 20]} apparie />
            <p>
              5 + 20 = 25, 8 + 17 = 25, 11 + 14 = 25. Ce n’est pas une coïncidence : en avançant
              d’un cran à gauche on <em>ajoute</em> la raison, et en reculant d’un cran à droite on
              la <em>retranche</em>. Les deux mouvements se compensent exactement.
            </p>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              Six colonnes donnent donc trois paires à 25 : la somme vaut 3 × 25 = <strong>75</strong>,
              sans additionner six nombres.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les colonnes appariées deux à deux, toutes de même hauteur totale.</div>
          </div>
        ),
      },
      {
        id: 'colonne-centrale-impaire',
        type: 'regles',
        title: 'Quand une colonne reste seule',
        summary:
          'Si le nombre de colonnes est impair, celle du milieu n’a pas de partenaire — et elle vaut exactement la moitié d’une paire. La division par 2 reste juste.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <Colonnes list={[5, 8, 11, 14, 17, 20, 23]} apparie />
            <p>
              Sept colonnes : trois paires à 28, et la colonne du milieu qui vaut{' '}
              <strong>14</strong> — soit exactement 28 ÷ 2. Le total fait 3 × 28 + 14 ={' '}
              <strong>98</strong>, ce que donne aussi 7 × 28 ÷ 2.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              On n’a donc pas besoin de traiter le cas impair à part : la formule vaut dans les deux
              cas, précisément parce que la colonne seule est une demi-paire.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-somme-arithmetique',
        type: 'memoriser',
        title: '⭐ La somme d’une suite arithmétique',
        summary:
          'Somme = (nombre de termes) × (premier + dernier) ÷ 2. De u(0) à u(n), le nombre de termes vaut n + 1.',
        body: (
          <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
            <div className="text-lg font-black text-rose-700">
              S = (nb de termes) × (premier + dernier) ÷ 2
            </div>
            <div className="font-mono text-sm text-rose-700">de u(0) à u(n) : nb de termes = n + 1</div>
            <p className="text-xs text-rose-700">
              le piège n’est jamais la formule, c’est le COMPTE des termes
            </p>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'telescopage',
        type: 'concepts',
        title: 'Le télescopage : S − qS',
        summary:
          'Multiplier la somme par la raison la décale d’un cran. En retranchant, tout le milieu s’annule et il ne reste que deux termes.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="overflow-x-auto rounded-xl border border-rose-100 bg-white p-3 font-mono text-xs leading-relaxed">
              S&nbsp;&nbsp;&nbsp;= 1 + 2 + 4 + 8 + 16<br />
              2S&nbsp;&nbsp;=&nbsp;&nbsp;&nbsp;&nbsp; 2 + 4 + 8 + 16 + 32<br />
              <span className="text-rose-700">S − 2S = 1 − 32</span>
            </div>
            <p>
              La deuxième ligne est la première <strong>décalée d’un cran</strong> : chaque terme du
              milieu apparaît dans les deux, et disparaît. Il ne survit que le premier terme de S et
              le dernier de qS.
            </p>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              Ici S − 2S = −S = 1 − 32 = −31, donc S = <strong>31</strong> — et l’on vérifie :
              1 + 2 + 4 + 8 + 16 = 31.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux lignes décalées, et tout le milieu barré.</div>
          </div>
        ),
      },
      {
        id: 'mem-somme-geometrique',
        type: 'memoriser',
        title: '⭐ La somme d’une suite géométrique',
        summary:
          'Pour q différent de 1 : S = u(0) × (1 − q^(n+1)) ÷ (1 − q). Et si q vaut 1, tous les termes sont égaux : S = (n + 1) × u(0).',
        body: (
          <div className="space-y-2 rounded-xl border-2 border-rose-200 bg-rose-50 p-5 text-center">
            <MathText>{'$$S = u(0) \\times \\dfrac{1 - q^{\\,n+1}}{1 - q}$$'}</MathText>
            <p className="text-xs text-rose-700">
              l’exposant est n + 1, le nombre de termes — jamais n
            </p>
            <div className="font-mono text-sm text-rose-700">si q = 1 : S = (n + 1) × u(0)</div>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'choisir-le-modele',
        type: 'methodes',
        title: 'Choisir le modèle à partir de l’énoncé',
        summary:
          'Un montant fixe ajouté à chaque étape donne une suite arithmétique ; un pourcentage appliqué à chaque étape donne une suite géométrique de raison 1 + t ou 1 − t.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-900">
                « on verse 60 € chaque mois » → on AJOUTE 60 : arithmétique, raison 60
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-rose-900">
                « la ville perd 4 % chaque année » → on MULTIPLIE par 1 − 0,04 = 0,96 :
                géométrique, raison 0,96
              </div>
            </div>
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer l’état de départ : c’est u(0).</li>
              <li>Repérer ce qui se répète : un montant, ou un pourcentage.</li>
              <li>Un montant ⟹ raison additive · un pourcentage ⟹ raison multiplicative.</li>
              <li>Dire explicitement ce que compte le rang : des mois, des années, des jours.</li>
            </ol>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « perdre 4 % » n’est pas « perdre 4 » : la ville perd 480 habitants la première année,
              puis moins ensuite, parce que le pourcentage porte sur ce qui reste.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois énoncés et les trois raisons qu’ils dictent.</div>
          </div>
        ),
      },
      {
        id: 'interpreter-le-modele',
        type: 'methodes',
        title: 'Faire parler le modèle',
        summary:
          'Un modèle sert à répondre : à quel rang franchit-on un seuil, combien vaut le total accumulé, et la réponse a-t-elle un sens dans la situation ?',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <strong>Franchir un seuil</strong> — chercher le premier rang où u(n) dépasse (ou
                passe sous) la valeur visée. On calcule des termes, on ne devine pas.
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <strong>Total accumulé</strong> — c’est une SOMME de termes, pas un terme. Le solde
                d’un compte et le total versé sont deux nombres différents.
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <strong>Revenir à la situation</strong> — 9 784,47 habitants n’existent pas : on
                arrondit, et l’on dit ce que le nombre signifie.
              </div>
            </div>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le modèle est une hypothèse, pas la réalité : « 4 % chaque année » suppose que le taux
              ne change pas. Une réponse s’accompagne toujours de ce qu’elle suppose.
            </div>
          </div>
        ),
      },
    ],
  },
};
