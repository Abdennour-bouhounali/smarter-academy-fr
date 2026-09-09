import React from 'react';
import {
  fr, avecUnite, moyenne, moyenneSimple, ecritureMoyennePonderee, medianeDetail,
  etendue, extremes, comparer, exagerationAxe,
  TRAJETS, BULLETIN, FRATRIES, GROUPE_ROUGE, GROUPE_BLEU, VILLE_ABRITEE, VILLE_EXPOSEE,
  SONDAGE_TRUQUE,
} from './components/stats4e';

/**
 * Connaissances de la leçon « Statistiques » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé, et aucun nombre n'est saisi ici à la main : tous viennent du noyau
 * `stats4e`, si bien qu'une donnée modifiée réécrit la carte au lieu de la
 * démentir.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     trois résumés ne disent pas la même chose (M1)
 *          ↓                    ↓                    ↓
 *     moyenne pondérée      médiane (M3)         étendue (M4)
 *          (M2)                 ↓                    ↓
 *          └────────────→  comparer deux séries (M5, M6)  ←──┘
 *                                 ↓
 *                       mettre en cause un axe (M7)
 *
 * Les trois résumés sont INDÉPENDANTS entre eux : chacun se calcule sans les
 * deux autres. Ce qui les relie est la question posée, et c'est pourquoi la
 * comparaison ne peut venir qu'après les trois — pas parce qu'elle serait plus
 * difficile, mais parce qu'il faut les trois pour constater qu'aucun ne suffit.
 *
 * Ce que cette carte NE contient PAS : la série, l'effectif, le tableau
 * d'effectifs, la fréquence, les deux diagrammes, la moyenne simple. Ce sont
 * les acquis de 5e, listés dans `priorKnowledge` et diagnostiqués au module 0.
 * Elle ne contient pas non plus les quartiles, la boîte à moustaches ni
 * l'écart type : ce sont des objets de 3e puis de 2nde, et `stats4e` ne les
 * exporte même pas.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/** Une série posée sur un axe, avec un repère mis en avant. */
const AxeMini = ({ valeurs, repere, couleur = '#059669', lo, hi }) => {
  const span = hi - lo || 1;
  const x = (v) => 6 + ((v - lo) / span) * 138;
  const vues = new Map();
  return (
    <svg viewBox="0 0 150 46" className="w-full" role="img"
         aria-label={`${valeurs.length} valeurs sur un axe, avec un repère à ${fr(repere)}`}>
      <line x1={6} y1={36} x2={144} y2={36} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={x(repere)} y1={6} x2={x(repere)} y2={40} stroke={couleur} strokeWidth="2.5" strokeDasharray="4 3" />
      {valeurs.map((v, i) => {
        const k = vues.get(v) ?? 0;
        vues.set(v, k + 1);
        return <circle key={i} cx={x(v)} cy={31 - k * 8} r="3.2" fill="#0284c7" stroke="#fff" strokeWidth="1" />;
      })}
    </svg>
  );
};

/** Les trois résumés d'une série, empilés. */
const TroisResumes = ({ serie }) => {
  const d = medianeDetail(serie);
  return (
    <div className="space-y-1 rounded-xl border border-indigo-100 bg-white p-2.5 text-[13px]">
      {[
        ['moyenne', avecUnite(moyenne(serie), serie.unite)],
        ['médiane', avecUnite(d.valeur, serie.unite)],
        ['étendue', avecUnite(etendue(serie), serie.unite)],
      ].map(([nom, valeur]) => (
        <div key={nom} className="flex items-baseline justify-between gap-3">
          <span className="text-xs uppercase tracking-wide text-slate-400">{nom}</span>
          <span className="font-mono font-bold text-slate-700">{valeur}</span>
        </div>
      ))}
    </div>
  );
};

/** Le calcul d'une moyenne pondérée, écrit comme au tableau. */
const CalculPondere = () => (
  <div className="overflow-x-auto rounded-xl border border-violet-100 bg-white p-2.5">
    <p className="whitespace-nowrap font-mono text-[13px] text-slate-700">
      {ecritureMoyennePonderee(BULLETIN)}
    </p>
    <p className="mt-1 text-xs text-slate-500">
      sans les coefficients on trouverait {fr(moyenneSimple(BULLETIN))}
    </p>
  </div>
);

/** Le partage en deux moitiés, avec les deux valeurs centrales. */
const Partage = () => {
  const d = medianeDetail(TRAJETS);
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-2.5">
      <div className="flex flex-wrap justify-center gap-1 font-mono text-[13px]">
        {d.triee.map((v, i) => (
          <span
            key={i}
            className={`rounded px-1.5 py-0.5 ${
              d.rangs.includes(i + 1)
                ? 'bg-emerald-600 font-bold text-white'
                : i + 1 < d.rangs[0] ? 'bg-sky-50 text-sky-700' : 'bg-violet-50 text-violet-700'
            }`}
          >
            {v}
          </span>
        ))}
      </div>
      <p className="mt-1.5 text-center font-mono text-[13px] text-emerald-800">
        ({d.encadrantes[0]} + {d.encadrantes[1]}) ÷ 2 = {fr(d.valeur)}
      </p>
    </div>
  );
};

/** Les deux extrêmes et la longueur qui les sépare. */
const Bouts = () => {
  const ex = extremes(VILLE_EXPOSEE);
  return (
    <div className="rounded-xl border border-sky-100 bg-white p-2.5">
      <svg viewBox="0 0 150 34" className="w-full" role="img"
           aria-label={`De ${ex.min} à ${ex.max} : une longueur de ${etendue(VILLE_EXPOSEE)}`}>
        <line x1={10} y1={24} x2={140} y2={24} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={10} y1={14} x2={140} y2={14} stroke="#4f46e5" strokeWidth="2.5" />
        <line x1={10} y1={8} x2={10} y2={20} stroke="#4f46e5" strokeWidth="2.5" />
        <line x1={140} y1={8} x2={140} y2={20} stroke="#4f46e5" strokeWidth="2.5" />
      </svg>
      <div className="flex justify-between font-mono text-xs text-slate-600">
        <span>{ex.min} {VILLE_EXPOSEE.unite}</span>
        <span className="font-bold text-indigo-700">{ex.max} − {ex.min} = {etendue(VILLE_EXPOSEE)}</span>
        <span>{ex.max} {VILLE_EXPOSEE.unite}</span>
      </div>
    </div>
  );
};

/** Les deux paires miroir, et ce que chacune laisse voir. */
const DeuxPaires = () => {
  const p1 = comparer(GROUPE_ROUGE, GROUPE_BLEU);
  const p2 = comparer(VILLE_ABRITEE, VILLE_EXPOSEE);
  return (
    <div className="space-y-1.5 rounded-xl border border-purple-100 bg-white p-2.5 text-[13px]">
      {[[GROUPE_ROUGE, GROUPE_BLEU, p1], [VILLE_ABRITEE, VILLE_EXPOSEE, p2]].map(([a, b, p]) => (
        <div key={a.id} className="rounded-lg bg-slate-50 px-2 py-1.5">
          <p className="text-xs font-semibold text-slate-600">{a.nom} / {b.nom}</p>
          <p className="font-mono text-xs text-slate-500">
            aveugles : {p.neSeparentPas.join(', ')} · parle : <strong className="text-purple-700">{p.separent.join(', ')}</strong>
          </p>
        </div>
      ))}
    </div>
  );
};

/** Le même écart, sur deux axes différents. */
const DeuxAxes = () => {
  const { basse, haute } = SONDAGE_TRUQUE;
  const truque = exagerationAxe({ basse, haute, depart: 45 });
  const barres = (depart) => {
    const plage = haute - depart;
    return [basse, haute].map((v) => Math.max(3, ((v - depart) / plage) * 40));
  };
  const [a0, b0] = barres(0);
  const [a1, b1] = barres(45);
  return (
    <div className="rounded-xl border border-amber-100 bg-white p-2.5">
      <div className="flex justify-around">
        {[[a0, b0, 'depuis 0', '#059669'], [a1, b1, 'depuis 45', '#dc2626']].map(([ha, hb, nom, c]) => (
          <div key={nom} className="text-center">
            <svg viewBox="0 0 60 50" className="w-16" role="img" aria-label={`Diagramme ${nom}`}>
              <rect x={10} y={46 - ha} width={16} height={ha} fill="#0ea5e9" rx="2" />
              <rect x={34} y={46 - hb} width={16} height={hb} fill="#e11d48" rx="2" />
              <line x1={4} y1={46} x2={56} y2={46} stroke={c} strokeWidth="2" />
            </svg>
            <p className="text-xs font-semibold" style={{ color: c }}>{nom}</p>
          </div>
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-xs text-slate-600">
        {basse} contre {haute} dans les deux cas — écart grossi × {fr(truque.facteur)} à droite
      </p>
    </div>
  );
};

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Ce qu'on vient de VOIR : trois résumés qui ne réagissent pas de la
       même façon. Aucun des trois n'est encore calculé ni même nommé
       complètement : c'est le CONSTAT qui est acquis, pas la méthode. */
    1: [
      {
        id: 'indicateur-stat',
        type: 'concepts',
        title: 'Trois résumés, trois questions',
        summary:
          'Un seul nombre ne résume pas une série. Moyenne, médiane et étendue répondent à des questions différentes — la preuve : déplacer une même donnée en fait bouger certains et pas les autres.',
        visual: <TroisResumes serie={TRAJETS} />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Un nombre qui résume une série s’appelle un <strong>indicateur</strong>. Il n’y en a
              pas un qui serait « le bon » : il y en a trois, et chacun regarde autre chose.
            </p>
            <div className="space-y-1.5 rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              <p><strong>La moyenne</strong> répond à « si on partageait tout également ? ».</p>
              <p><strong>La médiane</strong> répond à « quelle valeur coupe le groupe en deux ? ».</p>
              <p><strong>L’étendue</strong> répond à « les valeurs sont-elles serrées ou éparpillées ? ».</p>
            </div>
            <p className="text-sm text-slate-700">
              Le piège le plus répandu : croire que <strong>la moyenne, c’est le milieu</strong>.
              Sur les douze trajets de l’observatoire, la moyenne vaut{' '}
              {avecUnite(moyenne(TRAJETS), TRAJETS.unite)} et huit élèves sur douze sont en dessous.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : la pastille tirée jusqu’au bout de l’axe, et le repère vert qui ne
              bougeait pas d’un millimètre.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Le premier des trois résumés à être CALCULÉ. On part de la moyenne
       de 5e, dont la moyenne pondérée est l'extension. */
    2: [
      {
        id: 'moyenne-ponderee',
        type: 'formules',
        title: 'La moyenne pondérée',
        summary:
          'Chaque valeur compte autant de fois que son coefficient. On multiplie chaque valeur par son coefficient, on additionne, et on divise par la SOMME DES COEFFICIENTS.',
        visual: <CalculPondere />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-center">
              <span className="font-mono text-base font-black text-violet-700">
                (c₁ × v₁ + c₂ × v₂ + …) ÷ (c₁ + c₂ + …)
              </span>
            </div>
            <p className="text-sm text-slate-700">
              La moyenne de 5e en est le <strong>cas particulier</strong> : quand tous les
              coefficients valent 1, on retombe exactement dessus. Il n’y a donc pas deux moyennes
              à retenir, mais une seule.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur qui coûte le plus cher : diviser par le nombre de <strong>lignes</strong> au
              lieu de la somme des coefficients. Sur les fratries, il y a{' '}
              {FRATRIES.items.length} lignes mais 25 élèves — l’erreur donnerait {fr(2.2)} frères
              et sœurs au lieu de {fr(moyenne(FRATRIES))}.
            </div>
            <p className="text-sm text-slate-700">
              Le coefficient n’est pas toujours choisi par un professeur : sur un tableau
              d’effectifs, c’est le <strong>nombre d’individus</strong> qui portent cette valeur.
              Le calcul, lui, est le même.
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : les quatre curseurs du bulletin, et la moyenne qui franchissait 12.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — Le deuxième résumé, trouvé par le geste avant d'être nommé. */
    3: [
      {
        id: 'mediane-stat',
        type: 'concepts',
        title: 'La médiane',
        summary:
          'La valeur qui partage la série RANGÉE en deux moitiés de même effectif : autant de valeurs en dessous qu’au-dessus.',
        visual: <Partage />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Première chose à faire, toujours : <strong>ranger la série</strong> du plus petit au
              plus grand. Sans cela, la valeur « du milieu de la liste » n’a aucun sens.
            </p>
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-sm">
              <p className="font-bold text-emerald-800">Effectif impair</p>
              <p className="text-slate-600">La médiane est la valeur du milieu, une vraie donnée de la série.</p>
              <p className="mt-2 font-bold text-emerald-800">Effectif pair</p>
              <p className="text-slate-600">
                Il y a deux valeurs centrales : la médiane est leur demi-somme, et elle peut
                n’appartenir à personne.
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Sur les douze trajets, la médiane vaut{' '}
              {avecUnite(medianeDetail(TRAJETS).valeur, TRAJETS.unite)} : c’est la demi-somme de{' '}
              {medianeDetail(TRAJETS).encadrantes[0]} et {medianeDetail(TRAJETS).encadrantes[1]},
              et <strong>ce n’est le trajet d’aucun élève</strong>. Chercher la médiane dans la
              liste serait donc perdu d’avance.
            </div>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : la coupure déplacée jusqu’à 6 d’un côté et 6 de l’autre.
            </div>
          </div>
        ),
      },
      {
        id: 'mediane-partage',
        type: 'methodes',
        title: 'Ce que la médiane permet de dire',
        summary:
          'La moitié du groupe est en dessous, la moitié au-dessus. C’est une phrase sur le GROUPE, pas sur un individu.',
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Dire « la médiane des trajets vaut {fr(medianeDetail(TRAJETS).valeur)} minutes », c’est
              dire que <strong>la moitié des élèves mettent moins de {fr(medianeDetail(TRAJETS).valeur)} minutes</strong>{' '}
              et l’autre moitié davantage. Rien de plus, rien de moins.
            </p>
            <p className="text-sm text-slate-700">
              Elle ne dit <strong>pas</strong> combien de temps met « un élève typique », ni combien
              de temps met la classe en tout. Ces deux questions-là appellent d’autres nombres.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              Pourquoi on la choisit souvent : une seule valeur très à part suffit à déplacer la
              moyenne, alors qu’elle laisse la médiane où elle est. Quand une série contient un
              extrême, la médiane décrit mieux le gros du groupe.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Le troisième résumé, celui qui ne regarde que les deux bouts. */
    4: [
      {
        id: 'etendue',
        type: 'formules',
        title: 'L’étendue',
        summary:
          'La différence entre la plus grande et la plus petite valeur. Elle mesure l’écartement de la série, pas sa position.',
        visual: <Bouts />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center">
              <span className="font-mono text-lg font-black text-sky-700">
                étendue = valeur maximale − valeur minimale
              </span>
            </div>
            <p className="text-sm text-slate-700">
              Elle est <strong>toujours positive ou nulle</strong>, et elle est nulle exactement
              quand toutes les valeurs sont égales.
            </p>
            <p className="text-sm text-slate-700">
              Elle ne regarde que <strong>les deux bouts</strong>. Déplacer une valeur intérieure,
              même beaucoup, ne la change pas d’un millième — c’est ce qui la rend utile (elle
              répond à « jusqu’où ça va ? ») et limitée (elle ne dit rien de ce qui se passe entre
              les deux).
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              À ne pas confondre avec « la plus grande valeur ». À{' '}
              {VILLE_EXPOSEE.nom}, le maximum est de{' '}
              {avecUnite(extremes(VILLE_EXPOSEE).max, VILLE_EXPOSEE.unite)} mais l’étendue vaut{' '}
              {avecUnite(etendue(VILLE_EXPOSEE), VILLE_EXPOSEE.unite)} : c’est une longueur, pas
              une position.
            </div>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : l’axe qui se rétractait sur les deux extrêmes.
            </div>
          </div>
        ),
      },
    ],

    /* M5 — La première des deux paires miroir. */
    5: [
      {
        id: 'comparer-series',
        type: 'methodes',
        title: 'Comparer deux séries',
        summary:
          'On ne cherche pas « la meilleure » : on regarde quel indicateur les SÉPARE, et lequel est aveugle. Un indicateur qui donne le même nombre ne prouve pas que les deux séries se ressemblent.',
        visual: <DeuxPaires />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Deux séries peuvent avoir <strong>exactement la même moyenne</strong> et n’avoir rien
              à voir. Rouge et Bleu ont la même moyenne (
              {avecUnite(moyenne(GROUPE_ROUGE), GROUPE_ROUGE.unite)}) <em>et</em> la même étendue (
              {avecUnite(etendue(GROUPE_ROUGE), GROUPE_ROUGE.unite)}) : deux indicateurs sur trois
              sont muets, et seule la médiane les distingue.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              La méthode : calculer les <strong>trois</strong> indicateurs des deux séries, les
              poser côte à côte, et dire ce que chacun montre — ou ne montre pas.
            </div>
            <p className="text-sm text-slate-700">
              Une comparaison honnête ne conclut jamais « A est meilleure que B ». Elle dit « la
              moyenne ne les distingue pas ; en revanche la médiane de A est plus haute, donc la
              moitié haute de A dépasse celle de B ».
            </p>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : les deux lignes du tableau qui affichaient « aucun » écart.
            </div>
          </div>
        ),
      },
    ],

    /* M6 — La paire miroir, et la conclusion qu'elle seule autorise. */
    6: [
      {
        id: 'choisir-indicateur',
        type: 'methodes',
        title: 'Choisir selon la QUESTION',
        summary:
          'Aucun indicateur n’est meilleur que les autres. Le bon dépend de la question posée — jamais de la série.',
        body: (
          <div className="space-y-3">
            <div className="space-y-1.5 rounded-xl border-2 border-rose-200 bg-white p-3 text-sm">
              <p><strong>« Combien en tout, partagé également ? »</strong> → la moyenne.</p>
              <p><strong>« Quelle valeur coupe le groupe en deux ? »</strong> → la médiane.</p>
              <p><strong>« Est-ce régulier ou très variable ? »</strong> → l’étendue.</p>
              <p><strong>« Une valeur à part fausse-t-elle le résumé ? »</strong> → la médiane, que l’extrême ne déplace pas.</p>
            </div>
            <p className="text-sm text-slate-700">
              Les deux villes le prouvent en miroir : c’est <strong>la médiane</strong> qui sauvait
              la comparaison des deux groupes, et c’est elle qui est aveugle ici — Val-Serein et
              Mont-Venteux ont la même moyenne <em>et</em> la même médiane (
              {avecUnite(moyenne(VILLE_ABRITEE), VILLE_ABRITEE.unite)}), et seule l’étendue les
              sépare ({avecUnite(etendue(VILLE_ABRITEE), VILLE_ABRITEE.unite)} contre{' '}
              {avecUnite(etendue(VILLE_EXPOSEE), VILLE_EXPOSEE.unite)}).
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Conclusion à ne pas tirer : « la médiane est le bon indicateur ». Deux paires
              construites en miroir suffisent à la démentir. Chaque indicateur voit ce que les
              autres ne voient pas.
            </div>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : les deux villes qui avaient les mêmes deux premiers nombres.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-trois-indicateurs',
        type: 'memoriser',
        title: 'Les trois indicateurs, en une ligne chacun',
        summary:
          'Moyenne = somme ÷ effectif · Médiane = valeur du milieu de la série rangée · Étendue = max − min',
        body: (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                ['Moyenne', 'somme ÷ effectif', 'le partage égal', 'text-amber-700'],
                ['Médiane', 'milieu du rangement', 'la coupe en deux', 'text-emerald-700'],
                ['Étendue', 'max − min', 'l’écartement', 'text-indigo-700'],
              ].map(([nom, formule, role, teinte]) => (
                <div key={nom} className="rounded-lg border border-slate-200 bg-white p-2 text-center">
                  <div className={`text-sm font-black ${teinte}`}>{nom}</div>
                  <div className="font-mono text-xs text-slate-700">{formule}</div>
                  <div className="text-xs text-slate-400">{role}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Le réflexe avant tout calcul : <strong>ranger la série</strong>. La médiane et
              l’étendue en dépendent, la moyenne non — mais le rangement ne coûte rien.
            </p>
          </div>
        ),
      },
    ],

    /* M7 — Ce que la 5e ne pouvait pas faire : mettre le dessin en cause. */
    7: [
      {
        id: 'axe-tronque',
        type: 'regles',
        title: 'Un axe qui ne part pas de zéro',
        summary:
          'L’œil compare les hauteurs dessinées. Quand l’axe ne démarre pas à zéro, ces hauteurs ne sont plus dans le rapport des valeurs, et l’écart paraît bien plus grand qu’il n’est.',
        visual: <DeuxAxes />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              En 5e, on apprenait à <strong>lire</strong> un diagramme. En 4e, on apprend à le{' '}
              <strong>mettre en cause</strong> : le premier réflexe devant un graphique en barres
              est de regarder <strong>où démarre l’axe</strong>.
            </p>
            <div className="rounded-xl border-2 border-amber-200 bg-white p-3 text-sm">
              <p className="text-slate-600">Un sondage à {SONDAGE_TRUQUE.basse} % contre {SONDAGE_TRUQUE.haute} %,
              c’est un rapport réel de {fr(exagerationAxe({ basse: SONDAGE_TRUQUE.basse, haute: SONDAGE_TRUQUE.haute, depart: 0 }).rapportReel)}.</p>
              <p className="mt-1 font-bold text-amber-800">
                Sur un axe démarrant à 45, l’écart dessiné paraît{' '}
                {fr(exagerationAxe({ basse: SONDAGE_TRUQUE.basse, haute: SONDAGE_TRUQUE.haute, depart: 45 }).facteur)} fois
                plus grand qu’il ne l’est.
              </p>
            </div>
            <p className="text-sm text-slate-700">
              Les valeurs elles-mêmes ne changent <strong>jamais</strong>. C’est le seul dessin qui
              ment — et il ment d’autant plus que le départ s’approche de la barre la plus basse.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              La seule échelle qui ne trompe pas est celle qui <strong>part de zéro</strong>.
              Ce n’est pas une tolérance choisie, c’est la définition : le facteur d’exagération
              vaut alors exactement 1.
            </div>
            <div className="text-xs italic text-slate-400">
              📍 Souvenir : le curseur du départ d’axe, et les mêmes deux nombres sous deux dessins
              opposés.
            </div>
          </div>
        ),
      },
    ],
  },
};
