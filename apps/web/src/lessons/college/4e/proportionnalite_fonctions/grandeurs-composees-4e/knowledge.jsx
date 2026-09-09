import React from 'react';
import { fr, GRANDEURS, kmhVersMs, relation, CYCLISTE, texteDuree } from './components/grandeurs4e';

/**
 * Connaissances de la leçon « Grandeurs composées » (4e) — SOURCE UNIQUE.
 *
 * Chaque module déclare ce qu'il APPORTE à la carte ; la carte que voit
 * l'élève est la réduction cumulative des modules validés
 * (docs/architecture/KNOWLEDGE_MAP.md). Aucun module n'écrit son propre
 * résumé.
 *
 * LA DÉPENDANCE RÉELLE — c'est elle qui décide de l'ordre des modules :
 *
 *     trois grandeurs liées (M1)
 *          ↓                        ↘
 *     quotient / produit (M2)     lire une formule (M5)
 *          ↓
 *     le débit (M3)  ────→  la même structure ailleurs
 *          ↓
 *     changer d'unité par le sens (M4)
 *
 * Le changement d'unité dépend de M2 : on ne peut convertir « des kilomètres
 * par heure » que si l'on sait que l'unité est une PHRASE. La lecture de la
 * formule (M5) ne dépend, elle, que de M1 : elle est placée après parce
 * qu'elle CONCLUT en écrivant ce qui a été vécu, pas parce qu'elle
 * dépendrait du débit.
 *
 * Ce que cette carte NE contient PAS : le calcul de la vitesse moyenne, son
 * mémo, et le coefficient de proportionnalité. Ce sont les acquis de 5e,
 * listés dans `priorKnowledge` et diagnostiqués au module 0. Elle ne contient
 * pas non plus les fonctions linéaires ou affines, ni k²/k³ : objets de 3e.
 */

/* ══ Petits visuels partagés ══════════════════════════════════════════ */

/** Les trois cadrans liés, figés sur l'état de départ du tableau de bord. */
const TroisCadrans = () => {
  const r = relation({ distance: CYCLISTE.distance, duree: CYCLISTE.duree });
  return (
    <div className="space-y-1 rounded-xl border border-indigo-100 bg-white p-2.5 text-[13px]">
      {[
        ['distance', `${fr(r.distance)} km`],
        ['durée', texteDuree(r.duree)],
        ['vitesse', `${fr(r.vitesse)} km/h`],
      ].map(([nom, valeur]) => (
        <div key={nom} className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] uppercase tracking-wide text-slate-400">{nom}</span>
          <span className="font-mono text-slate-700">{valeur}</span>
        </div>
      ))}
      <p className="pt-1 text-center font-mono text-[13px] text-indigo-700">
        deux données ⇒ la troisième
      </p>
    </div>
  );
};

/** Les cinq unités, rangées par famille. */
const DeuxFamilles = () => (
  <div className="grid grid-cols-2 gap-2 rounded-xl border border-violet-100 bg-white p-2.5 text-[13px]">
    <div>
      <p className="font-bold text-indigo-800">« par »</p>
      {['vitesse', 'debit', 'masseVolumique'].map((id) => (
        <p key={id} className="font-mono text-slate-700">{GRANDEURS[id].symbole}</p>
      ))}
    </div>
    <div>
      <p className="font-bold text-violet-800">« fois »</p>
      {['energie', 'travail'].map((id) => (
        <p key={id} className="font-mono text-slate-700">{GRANDEURS[id].symbole}</p>
      ))}
    </div>
  </div>
);

/** La même structure, trois fois. */
const MemeStructure = () => (
  <div className="space-y-1 rounded-xl border border-sky-100 bg-white p-2.5 font-mono text-[13px]">
    {[
      ['distance ÷ durée', 'km/h'],
      ['volume ÷ durée', 'L/min'],
      ['masse ÷ volume', 'g/cm³'],
    ].map(([calcul, unite]) => (
      <div key={unite} className="flex items-baseline justify-between gap-3">
        <span className="text-slate-600">{calcul}</span>
        <span className="font-bold text-sky-800">{unite}</span>
      </div>
    ))}
  </div>
);

/** Le raisonnement de conversion, sur 36 km/h. */
const Conversion = () => {
  const { valeur, etapes } = kmhVersMs(36);
  return (
    <div className="space-y-1 rounded-xl border border-emerald-100 bg-white p-2.5 font-mono text-[13px]">
      <p className="text-slate-600">36 km = {fr(etapes.metres)} m</p>
      <p className="text-slate-600">1 h = {fr(etapes.secondes)} s</p>
      <p className="font-bold text-emerald-800">
        {fr(etapes.metres)} ÷ {fr(etapes.secondes)} = {fr(valeur)} m/s
      </p>
    </div>
  );
};

/** Les trois lectures de l'égalité. */
const TroisLectures = () => (
  <div className="space-y-1 rounded-xl border border-purple-100 bg-white p-2.5 text-center font-mono text-sm">
    <p className="font-black text-purple-900">d = v × t</p>
    <p className="text-slate-600">v = d ÷ t</p>
    <p className="text-slate-600">t = d ÷ v</p>
  </div>
);

export const LESSON_KNOWLEDGE = {
  modules: {

    /* M1 — Ce qu'on vient de VIVRE : trois grandeurs qui ne peuvent pas
       bouger indépendamment. Aucun vocabulaire n'est encore posé. */
    1: [
      {
        id: 'trois-grandeurs-liees',
        type: 'concepts',
        title: 'Trois grandeurs, une seule relation',
        summary:
          'Distance, durée et vitesse ne sont pas trois nombres libres : en connaître deux suffit à obtenir le troisième. La réponse à « si je double » dépend donc de ce qu’on tient fixe.',
        visual: <TroisCadrans />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Une vitesse n’est pas un nombre isolé : c’est <strong>deux grandeurs tenues
              ensemble</strong>, une distance et une durée. On ne peut pas changer l’une sans que
              quelque chose d’autre change aussi.
            </p>
            <p className="text-sm text-slate-700">
              D’où la question qui n’a pas <em>une</em> réponse : doubler la distance{' '}
              <strong>à durée fixée</strong> double la vitesse ; doubler la durée{' '}
              <strong>à distance fixée</strong> la divise par deux. Tant qu’on n’a pas dit ce
              qu’on garde fixe, la question est incomplète.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              {fr(CYCLISTE.distance)} km en {texteDuree(CYCLISTE.duree)}, cela fait{' '}
              {fr(CYCLISTE.vitesse)} km/h. Le même trajet en deux fois plus de temps ne ferait
              plus que {fr(relation({ distance: CYCLISTE.distance, duree: CYCLISTE.duree * 2 }).vitesse)} km/h.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le cadran qui s’allumait en orange, celui qu’on n’avait pas réglé.
            </div>
          </div>
        ),
      },
    ],

    /* M2 — Le vocabulaire, posé APRÈS le tri qui l'a rendu nécessaire. */
    2: [
      {
        id: 'grandeur-quotient',
        type: 'concepts',
        title: 'Grandeur quotient, grandeur produit',
        summary:
          'Une grandeur quotient divise une grandeur par une autre et se lit « par » (km/h, L/min, g/cm³). Une grandeur produit les multiplie et se lit « fois » (kWh, ouvriers·jours).',
        visual: <DeuxFamilles />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-violet-200 bg-white p-3 text-center text-sm">
              <p className="font-black text-indigo-800">km/h → « {GRANDEURS.vitesse.lecture} »</p>
              <p className="font-black text-violet-800">kWh → « {GRANDEURS.energie.lecture} »</p>
            </div>
            <p className="text-sm text-slate-700">
              Une unité composée n’est pas un symbole à reconnaître : c’est une{' '}
              <strong>phrase</strong>. Pour savoir dans quelle famille elle est, on la{' '}
              <strong>dit à voix haute</strong>.
            </p>
            <p className="text-sm text-slate-700">
              Le symbole seul ne suffit pas : <strong>ouvriers·jours</strong> n’a pas de barre et
              n’est pourtant pas une division ; <strong>g/cm³</strong> en a une et en est bien
              une.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              Attention : deux grandeurs quotient ne s’additionnent pas. 30 km/h puis 60 km/h,
              cela ne fait pas 90 km/h — il faut repasser par les distances et les durées.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les cinq étiquettes, et les deux bacs.
            </div>
          </div>
        ),
      },
    ],

    /* M3 — La même structure, transportée. Ce n'est pas une notion de plus. */
    3: [
      {
        id: 'debit',
        type: 'formules',
        title: 'Le débit',
        summary:
          'Un débit est un volume par unité de temps : volume = débit × durée, exactement comme distance = vitesse × durée.',
        visual: <MemeStructure />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-sky-200 bg-white p-3 text-center">
              <p className="font-mono text-base font-black text-sky-700">
                volume = débit × durée
              </p>
              <p className="font-mono text-sm text-slate-600">
                débit = volume ÷ durée
              </p>
            </div>
            <p className="text-sm text-slate-700">
              Ce n’est <strong>pas une notion de plus</strong>. C’est la même structure que la
              vitesse, posée sur d’autres grandeurs — et le calcul se fait de la même façon.
            </p>
            <p className="text-sm text-slate-700">
              La <strong>masse volumique</strong> suit le même modèle : une masse divisée par un
              volume, en g/cm³. Le fer vaut 7,8 g/cm³ ; un centimètre cube de fer pèse 7,8 g.
            </p>
            <div className="rounded-xl bg-slate-50 p-2.5 text-sm text-slate-600">
              300 L à 12 L/min demandent 300 ÷ 12 = 25 min. Même division que 60 km à 30 km/h.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : le réservoir qui montait, et le volume qu’on ne réglait jamais.
            </div>
          </div>
        ),
      },
    ],

    /* M4 — Changer d'unité par le sens, et le raccourci qui en découle. */
    4: [
      {
        id: 'changer-unite',
        type: 'methodes',
        title: 'Changer l’unité d’une vitesse',
        summary:
          'On dit ce que l’unité signifie : 1 km/h, c’est 1000 m parcourus en 3600 s. Le « ÷ 3,6 » est le résultat de ce raisonnement, pas une règle à croire.',
        visual: <Conversion />,
        body: (
          <div className="space-y-3">
            <div className="rounded-xl border-2 border-emerald-200 bg-white p-3 text-center font-mono text-sm">
              <p className="text-slate-600">36 km/h = 36 000 m en 3600 s</p>
              <p className="font-black text-emerald-800">36 000 ÷ 3600 = 10 m/s</p>
            </div>
            <p className="text-sm text-slate-700">
              Deux étapes seulement : combien de <strong>mètres</strong>, en combien de{' '}
              <strong>secondes</strong>. Puis on divise.
            </p>
            <p className="text-sm text-slate-700">
              Le sens dit aussi <strong>dans quel sens aller</strong> : en m/s le nombre est
              toujours <strong>plus petit</strong>, parce qu’une seconde est bien plus courte
              qu’une heure. Si le nombre grandit, on s’est trompé de sens.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur classique : multiplier par 3,6 en allant de km/h vers m/s. 90 km/h ne font
              pas 324 m/s — cela irait plus vite que le son.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : les quatre lignes qui se dévoilaient, et la dernière qui redonnait la
              troisième.
            </div>
          </div>
        ),
      },
      {
        id: 'mem-conversion',
        type: 'memoriser',
        title: 'Trois repères de vitesse',
        summary: '3,6 km/h → 1 m/s · 36 km/h → 10 m/s · 90 km/h → 25 m/s',
        body: (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2 font-mono text-sm">
              {[3.6, 36, 90].map((v) => (
                <div key={v} className="rounded-lg border border-slate-200 bg-white p-2 text-center">
                  <div className="text-slate-600">{fr(v)} km/h</div>
                  <div className="font-bold text-emerald-800">{fr(kmhVersMs(v).valeur)} m/s</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              Le réflexe : en m/s, on divise par 3,6 ; en km/h, on multiplie par 3,6. Et on
              vérifie que le nombre a bougé dans le bon sens.
            </p>
          </div>
        ),
      },
    ],

    /* M5 — Une seule égalité, lue dans trois sens. */
    5: [
      {
        id: 'lire-une-formule',
        type: 'regles',
        title: 'Lire une formule dans les trois sens',
        summary:
          'd = v × t se retourne en v = d ÷ t et t = d ÷ v. Ce qui décide de l’écriture, c’est la grandeur qu’on cherche.',
        visual: <TroisLectures />,
        body: (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Ce ne sont pas trois formules à retenir, mais <strong>une seule égalité</strong>{' '}
              lue de trois façons. On choisit celle dont le membre de gauche est ce qu’on
              cherche.
            </p>
            <p className="text-sm text-slate-700">
              La <strong>vérification</strong> tranche toujours : on remultiplie. Si{' '}
              <span className="font-mono">v × t</span> ne redonne pas la distance, la division a
              été faite à l’envers.
            </p>
            <div className="rounded-xl bg-amber-50 p-2.5 text-sm text-amber-900">
              L’erreur de sens : écrire t = v ÷ d. Les unités le disent — km/h divisé par des km
              ne donne pas des heures.
            </div>
            <div className="text-xs text-slate-400 italic">
              📍 Souvenir : la ligne de formule qui se réécrivait quand tu changeais d’inconnue.
            </div>
          </div>
        ),
      },
    ],
  },
};
