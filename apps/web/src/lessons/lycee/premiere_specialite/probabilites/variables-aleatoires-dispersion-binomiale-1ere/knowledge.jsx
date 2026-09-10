import React from 'react';
import MathText from '../../../../common/components/MathText';

/**
 * Connaissances de « Variables aléatoires : dispersion et loi binomiale » —
 * SOURCE UNIQUE (docs/architecture/KNOWLEDGE_MAP.md). Le texte d'une brique vit
 * ICI et nulle part ailleurs ; les modules la posent par son id, au moment où le
 * geste vient de lui donner du sens.
 *
 * TROIS IDS SONT IMPOSÉS PAR LE LEXIQUE D'AUDIT (scripts/audit/lexicon.json) :
 * `ecart-type`, `schema-bernoulli` et `loi-binomiale`. L'audit ne relie un mot
 * du lexique à sa brique que par l'ÉGALITÉ des identifiants ; une brique nommée
 * `l-ecart-type` ou `bernoulli` n'établirait rien, et chaque emploi du mot
 * remonterait en « employé avant d'être posé ». Voir la règle
 * [[lexicon-term-above-level]].
 *
 * PÉRIMÈTRE : aucune brique ne redéfinit la loi de probabilité, son tableau ni
 * l'espérance — ce sont des PRÉREQUIS, établis par la leçon amont et mesurés au
 * module 0. Aucune brique ne parle de loi normale ni d'intervalle de
 * fluctuation : c'est la Terminale, et une brique posée ici la lui volerait.
 */

/**
 * Deux nuages, la MÊME ligne centrale, des largeurs opposées. Les nombres ne
 * sont pas dans le SVG : la figure ne porte que des positions.
 */
const MiniDeuxNuages = () => {
  const W = 200;
  const centre = 100;
  const ligne = (y, dxs, couleur) => (
    <g>
      <line x1="10" y1={y} x2={W - 10} y2={y} stroke="#e2e8f0" strokeWidth="1.5" />
      {dxs.map((dx, i) => (
        <circle key={i} cx={centre + dx} cy={y} r="3" fill={couleur} opacity="0.75" />
      ))}
      <line x1={centre} y1={y - 9} x2={centre} y2={y + 9} stroke="#0f172a" strokeWidth="2" />
    </g>
  );
  return (
    <svg viewBox="0 0 200 74" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 200 }}>
      {ligne(20, [-9, -5, -2, 0, 2, 5, 9, -7, 7, 3], '#0f766e')}
      {ligne(54, [-78, -76, -74, -72, -70, -68, -66, 84, 82, -64], '#be123c')}
    </svg>
  );
};

/** La règle des écarts : chaque valeur, son écart signé, et le carré qui l'écrase. */
const MiniCarres = () => (
  <svg viewBox="0 0 210 62" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 210 }}>
    <line x1="12" y1="34" x2="198" y2="34" stroke="#cbd5e1" strokeWidth="1.5" />
    <line x1="105" y1="14" x2="105" y2="50" stroke="#0f172a" strokeWidth="2" />
    {/* Les écarts, l'un négatif l'autre positif : ils s'annulent. */}
    <line x1="45" y1="34" x2="105" y2="34" stroke="#be123c" strokeWidth="3" />
    <line x1="105" y1="34" x2="165" y2="34" stroke="#0f766e" strokeWidth="3" />
    {/* Leurs carrés, tous deux positifs : ils s'ajoutent. */}
    <rect x="45" y="8" width="16" height="16" fill="#be123c" opacity="0.35" />
    <rect x="149" y="8" width="16" height="16" fill="#0f766e" opacity="0.35" />
    <circle cx="45" cy="34" r="3.5" fill="#be123c" />
    <circle cx="165" cy="34" r="3.5" fill="#0f766e" />
  </svg>
);

/** L'arbre de trois épreuves : les chemins à deux succès sont mis en avant. */
const MiniArbre = () => {
  const noeud = (x, y) => <circle cx={x} cy={y} r="3" fill="#0f172a" />;
  const br = (x1, y1, x2, y2, fort) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fort ? '#7c3aed' : '#cbd5e1'} strokeWidth={fort ? 2.2 : 1.2} />
  );
  return (
    <svg viewBox="0 0 168 108" aria-hidden="true" className="select-none w-full h-auto" style={{ maxWidth: 168 }}>
      {br(14, 54, 62, 26, true)}
      {br(14, 54, 62, 82, true)}
      {br(62, 26, 116, 12, true)}
      {br(62, 26, 116, 40, true)}
      {br(62, 82, 116, 68, true)}
      {br(62, 82, 116, 96, false)}
      {[[116, 12], [116, 40], [116, 68], [116, 96]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={i === 3 ? '#cbd5e1' : '#7c3aed'} />
      ))}
      {noeud(14, 54)}{noeud(62, 26)}{noeud(62, 82)}
    </svg>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {
    1: [
      {
        id: 'meme-moyenne-pas-meme-jeu',
        type: 'concepts',
        title: 'La moyenne à long terme ne décrit pas un jeu à elle seule',
        summary:
          'Deux situations peuvent avoir exactement la même moyenne à long terme et être totalement différentes : l’une donne presque toujours le même résultat, l’autre presque jamais.',
        visual: <MiniDeuxNuages />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Les deux jeux paient <strong>2 € par partie en moyenne</strong>, exactement le même
              nombre. Mais l’un paie entre 1 € et 3 € à chaque coup, l’autre ne paie rien neuf
              fois sur dix. Un joueur qui ne regarde que la moyenne ne peut pas les distinguer.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              « Deux situations de même moyenne se ressemblent » est faux, et c’est l’erreur qui
              coûte le plus cher : c’est exactement celle qu’on fait devant deux placements, deux
              trajets ou deux traitements de même résultat moyen.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux nuages de points, même ligne centrale, largeurs opposées.</div>
          </div>
        ),
      },
      {
        id: 'dispersion-autour-de-la-moyenne',
        type: 'concepts',
        title: 'Ce qui les distingue : l’étalement autour de la moyenne',
        summary:
          'Ce qui sépare les deux jeux, c’est l’ampleur avec laquelle les résultats s’éloignent de la moyenne. Il faut donc un second nombre, qui mesure cet éloignement.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Le premier nombre dit <em>où</em> les résultats se rassemblent. Le second devra dire{' '}
              <em>à quel point</em> ils s’en éloignent : petit quand tous les résultats se serrent
              autour de la moyenne, grand quand ils partent loin.
            </p>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              Deux nombres, deux questions différentes : « autour de quoi ? » et « à quelle
              distance ? ». Aucun des deux ne remplace l’autre.
            </div>
          </div>
        ),
      },
    ],
    2: [
      {
        id: 'ecart-a-l-esperance',
        type: 'concepts',
        title: 'Les écarts s’annulent — il faut les carrés',
        summary:
          'La somme des écarts à l’espérance, pondérée par les probabilités, vaut TOUJOURS zéro : les écarts négatifs compensent exactement les positifs. Élever au carré supprime les signes.',
        visual: <MiniCarres />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$\\sum p_i \\,(x_i - E(X)) = 0 \\quad \\text{toujours}$$'}</MathText>
            </div>
            <p>
              Ce n’est pas une coïncidence des données : c’est la définition même de l’espérance,
              qui est le point d’équilibre. Un indicateur bâti sur la somme des écarts vaudrait donc
              zéro pour <strong>tous</strong> les jeux, et n’en distinguerait aucun.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Prendre la valeur absolue marcherait aussi, mais elle se dérive mal et se manipule
              mal en calcul : c’est le carré qui a été retenu.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les deux écarts opposés qui s’annulent, et leurs deux carrés qui s’ajoutent.</div>
          </div>
        ),
      },
      {
        id: 'variance',
        type: 'vocabulaire',
        title: 'La variance V(X)',
        summary:
          'La variance de X est la moyenne des carrés des écarts à l’espérance : chaque écart au carré, pesé par la probabilité de sa valeur, le tout additionné.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-violet-100 bg-white p-3 text-center">
              <MathText>{'$$V(X) = \\sum p_i \\,\\bigl(x_i - E(X)\\bigr)^2$$'}</MathText>
            </div>
            <p>
              Sur le jeu régulier : 0,4 × (1 − 2)² + 0,2 × (2 − 2)² + 0,4 × (3 − 2)² ={' '}
              <strong>0,8</strong>. Sur le jeu à gros lot :
              0,9 × (0 − 2)² + 0,1 × (20 − 2)² = 3,6 + 32,4 = <strong>36</strong>. Quarante-cinq
              fois plus, pour la même moyenne.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              V(X) n’est jamais négative : c’est une somme de carrés multipliés par des
              probabilités. Un résultat négatif signale toujours une erreur de calcul.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : la colonne des carrés d’écarts qui se remplit case après case.</div>
          </div>
        ),
      },
      {
        id: 'methode-calculer-variance',
        type: 'methodes',
        title: 'Calculer une variance',
        summary:
          'Espérance d’abord, puis pour chaque valeur : l’écart, son carré, multiplié par la probabilité. On additionne les contributions.',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Calculer E(X) — sans elle, aucun écart n’a de sens.</li>
              <li>Pour chaque valeur : l’écart xᵢ − E(X), avec son signe.</li>
              <li>Élever chaque écart au carré : les signes disparaissent.</li>
              <li>Multiplier chaque carré par SA probabilité, puis additionner.</li>
              <li>Contrôler : le résultat est positif ou nul, et il vaut 0 seulement si la variable ne prend qu’une valeur.</li>
            </ol>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              Une valeur rare mais très éloignée peut peser plus que toutes les autres réunies :
              sur le jeu à gros lot, l’unique valeur à 20 € apporte 32,4 des 36.
            </div>
          </div>
        ),
      },
    ],
    3: [
      {
        id: 'variance-en-unite-carree',
        type: 'concepts',
        title: 'La variance n’est pas dans l’unité des valeurs',
        summary:
          'Comme on a élevé des euros au carré, la variance s’exprime en euros carrés — une unité qui ne se compare à aucun gain. Elle classe correctement, mais elle ne se lit pas.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Écrire les mêmes gains en centimes multiplie toutes les valeurs par 100 — et la
              variance par <strong>10 000</strong>. Le nombre change du tout au tout sans que le
              jeu ait changé : il dépend de l’unité choisie d’une façon qui le rend illisible.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Dire « ce jeu a une dispersion de 36 » ne veut rien dire tant qu’on n’a pas dit
              36 <em>quoi</em>. Et 36 euros carrés ne se compare à aucun gain de la table.
            </div>
          </div>
        ),
      },
      {
        id: 'ecart-type',
        type: 'vocabulaire',
        title: 'L’écart type σ(X)',
        summary:
          'L’écart type est la racine carrée de la variance. La racine défait le carré : le nombre revient dans l’unité des valeurs, et se compare directement aux gains.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-sky-100 bg-white p-3 text-center">
              <MathText>{'$$\\sigma(X) = \\sqrt{V(X)}$$'}</MathText>
            </div>
            <p>
              Jeu régulier : σ = √0,8 ≈ <strong>0,89 €</strong>. Jeu à gros lot : σ = √36 ={' '}
              <strong>6 €</strong> exactement. Deux montants en euros, qu’on peut enfin poser à
              côté des 2 € de moyenne : le premier jeu s’écarte de moins d’un euro, le second de
              six.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              σ n’est pas l’écart entre le plus grand et le plus petit gain (ce serait 20 € pour le
              second jeu). C’est un écart <em>typique</em>, pesé par les probabilités.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : le nombre en euros carrés qui redevient un nombre en euros.</div>
          </div>
        ),
      },
      {
        id: 'mem-variance-ecart-type',
        type: 'memoriser',
        title: '⭐ V(X) = Σ pᵢ(xᵢ − E(X))² et σ(X) = √V(X)',
        summary: 'Les carrés des écarts pesés par leurs probabilités, puis la racine pour revenir dans l’unité.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">V(X) = Σ pᵢ(xᵢ − E(X))²</div>
            <div className="text-xl font-black text-rose-700">σ(X) = √V(X)</div>
            <p className="text-xs text-rose-700">la variance classe · l’écart type se lit, dans l’unité des valeurs</p>
          </div>
        ),
      },
    ],
    4: [
      {
        id: 'schema-bernoulli',
        type: 'vocabulaire',
        title: 'Épreuve de Bernoulli et schéma de Bernoulli',
        summary:
          'Une épreuve de Bernoulli est une expérience à DEUX issues seulement : succès (probabilité p) ou échec (probabilité 1 − p). Un schéma de Bernoulli est la répétition de n épreuves identiques et indépendantes.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-emerald-100 bg-white p-3 text-center">
              <MathText>{'$$P(\\text{succès}) = p \\qquad P(\\text{échec}) = 1 - p$$'}</MathText>
            </div>
            <p>
              « Succès » est une ÉTIQUETTE, pas un jugement : on peut appeler succès le fait
              qu’une ampoule soit défectueuse. Ce qui compte est d’avoir choisi laquelle des deux
              issues on compte, et de ne plus en changer.
            </p>
            <p>
              Trois conditions font un schéma de Bernoulli, et il suffit qu’une seule tombe pour
              que tout tombe : <strong>deux issues</strong> à chaque épreuve, un nombre{' '}
              <strong>n fixé d’avance</strong> de répétitions, et des épreuves{' '}
              <strong>indépendantes</strong> — chacune se déroule comme si les autres n’avaient
              pas eu lieu.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Un tirage SANS remise casse l’indépendance : chaque tirage change la composition de
              l’urne, donc la probabilité du suivant.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : l’arbre où chaque nœud n’a que deux branches, et toujours les mêmes poids.</div>
          </div>
        ),
      },
      {
        id: 'compter-les-succes',
        type: 'concepts',
        title: 'La variable qui compte les succès',
        summary:
          'Sur n épreuves répétées, on s’intéresse au NOMBRE de succès. Il vaut entre 0 et n, et plusieurs chemins de l’arbre donnent le même nombre.',
        visual: <MiniArbre />,
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              Un chemin de l’arbre décrit un déroulement complet — quelles épreuves ont réussi,
              dans quel ordre. Le nombre de succès, lui, oublie l’ordre : « réussi, raté, réussi »
              et « raté, réussi, réussi » donnent tous deux <strong>2</strong>.
            </p>
            <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">
              C’est précisément ce regroupement qui fera apparaître un facteur de comptage dans la
              formule : plusieurs chemins, une seule valeur.
            </div>
          </div>
        ),
      },
    ],
    5: [
      {
        id: 'coefficient-binomial',
        type: 'vocabulaire',
        title: 'Le coefficient binomial C(n, k)',
        summary:
          'C(n, k) compte les chemins de l’arbre qui portent exactement k succès sur n épreuves. C’est un nombre entier, et il se lit dans le triangle de Pascal.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$\\binom{n}{k} = \\text{nombre de chemins à } k \\text{ succès sur } n \\text{ épreuves}$$'}</MathText>
            </div>
            <p>
              Pour n = 5, la ligne complète vaut 1, 5, 10, 10, 5, 1 : un seul chemin ne donne aucun
              succès, cinq en donnent un, dix en donnent deux… La ligne est{' '}
              <strong>symétrique</strong>, parce que choisir les 2 épreuves réussies revient à
              choisir les 3 ratées.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              C(n, k) n’est pas une probabilité : c’est un nombre de chemins, donc un entier, et il
              dépasse largement 1.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les dix chemins de l’arbre qui portent deux succès sur cinq.</div>
          </div>
        ),
      },
      {
        id: 'loi-binomiale',
        type: 'formules',
        title: 'La loi binomiale',
        summary:
          'Si X compte les succès d’un schéma de Bernoulli à n épreuves de probabilité p, alors P(X = k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ. On note que X suit la loi binomiale de paramètres n et p.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$P(X = k) = \\binom{n}{k}\\, p^{k} \\,(1-p)^{\\,n-k}$$'}</MathText>
            </div>
            <p>
              Les trois facteurs se lisent sur l’arbre : <strong>combien de chemins</strong>{' '}
              donnent k succès, ce que <strong>coûtent les k succès</strong> le long d’un chemin,
              et ce que <strong>coûtent les n − k échecs</strong>. Un chemin, puis tous les chemins.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Oublier le coefficient est l’erreur la plus fréquente : sans lui, on ne calcule la
              probabilité que d’UN chemin, pas de l’événement entier.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois facteurs posés côte à côte, chacun avec sa raison d’être.</div>
          </div>
        ),
      },
      {
        id: 'passer-au-complementaire',
        type: 'methodes',
        title: '« Au moins un » : passer au complémentaire',
        summary:
          'Pour « au moins un succès », on ne additionne pas n termes : on calcule 1 moins la probabilité d’aucun succès. Un seul calcul au lieu de n.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-rose-100 bg-white p-3 text-center">
              <MathText>{'$$P(X \\geqslant 1) = 1 - P(X = 0) = 1 - (1-p)^{n}$$'}</MathText>
            </div>
            <p>
              L’événement contraire de « au moins un » est « aucun » — pas « exactement un », et
              pas « au plus un ». C’est le seul événement dont la probabilité se calcule en un
              terme, d’où l’intérêt du détour.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Confondre le contraire de « au moins 1 » avec « exactement 0 » est juste ; le
              confondre avec « au plus 1 » ou avec « au moins 2 » est l’erreur classique.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-loi-binomiale',
        type: 'memoriser',
        title: '⭐ P(X = k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ',
        summary: 'Le nombre de chemins, puis le coût des succès, puis le coût des échecs.',
        body: (
          <div className="bg-rose-50 rounded-xl border-2 border-rose-200 p-5 text-center space-y-2">
            <div className="text-xl font-black text-rose-700">P(X = k) = C(n,k) × pᵏ × (1−p)ⁿ⁻ᵏ</div>
            <p className="text-xs text-rose-700">chemins × succès × échecs — et « au moins un » se fait par 1 − P(X = 0)</p>
          </div>
        ),
      },
    ],
    6: [
      {
        id: 'modeliser-par-une-variable',
        type: 'methodes',
        title: 'Traduire une situation en variable aléatoire',
        summary:
          'Modéliser, c’est répondre à trois questions dans l’ordre : que compte-t-on ? combien de fois l’épreuve est-elle répétée ? quelle est la probabilité d’un succès ?',
        body: (
          <div className="space-y-2 text-sm text-slate-700">
            <ol className="list-decimal list-inside space-y-1">
              <li>Repérer l’épreuve élémentaire, et vérifier qu’elle n’a que deux issues.</li>
              <li>Choisir ce qu’on appelle <strong>succès</strong> — celui dont on compte les occurrences.</li>
              <li>Compter les répétitions : c’est n, et il doit être fixé d’avance.</li>
              <li>Lire la probabilité d’un succès sur UNE épreuve : c’est p.</li>
              <li>Vérifier l’indépendance, puis écrire la phrase : « X compte … , et suit la loi binomiale de paramètres n et p ».</li>
            </ol>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Le piège de p : un énoncé donne parfois une proportion sur l’ensemble (« 30 % des
              pièces »), qui est bien la probabilité sur UNE épreuve — et parfois un effectif
              attendu (« 3 pièces sur 10 en moyenne »), qui est n × p, pas p.
            </div>
            <div className="text-xs text-slate-400 italic">📍 Souvenir : les trois cases n, p et « ce que compte X », remplies avant tout calcul.</div>
          </div>
        ),
      },
      {
        id: 'esperance-variance-binomiale',
        type: 'formules',
        title: 'E(X) = np et V(X) = np(1 − p)',
        summary:
          'Pour une variable qui suit la loi binomiale de paramètres n et p, l’espérance et la variance se lisent directement sur les paramètres, sans passer par le tableau.',
        body: (
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-xl border border-amber-100 bg-white p-3 text-center">
              <MathText>{'$$E(X) = np \\qquad V(X) = np(1-p) \\qquad \\sigma(X) = \\sqrt{np(1-p)}$$'}</MathText>
            </div>
            <p>
              Sur cinq prélèvements à 0,4 : E(X) = 5 × 0,4 = <strong>2</strong> défauts attendus,
              V(X) = 5 × 0,4 × 0,6 = <strong>1,2</strong>. Ces formules ne remplacent pas la
              définition — elles en sont un raccourci, valable uniquement pour la loi binomiale.
            </p>
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700">
              Appliquer E(X) = np à une variable qui ne compte pas des succès répétés n’a aucun
              sens : il faut d’abord avoir reconnu la situation.
            </div>
          </div>
        ),
      },
    ],
  },
};
