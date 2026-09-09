import React from 'react';
import {
  INSTRUCTION_LABELS, ecrireValeur, ecrireTest, estLecture, evalValeur,
} from '../../../../../common/turtle/trace4e';

/**
 * ProgramView4e — le programme, tel que l'élève le lit en 4e.
 *
 * Activity               afficher un programme instruction par instruction, en
 *                        montrant laquelle s'exécute et, dans un choix, quelle
 *                        BRANCHE a été prise.
 * Mathematical objective rendre lisible une structure qui n'est plus une simple
 *                        suite : un bloc peut n'exécuter qu'une PARTIE de ce
 *                        qui est écrit.
 * Student action         aucune : composant de présentation pure.
 * Expected observation   « tout est écrit, mais tout n'est pas exécuté ».
 * Misconception targeted croire qu'un SI exécute ses deux branches, l'une puis
 *                        l'autre — l'erreur la plus fréquente du niveau.
 *
 * CE QUE LA 4e AJOUTE À LA VUE DE 5e :
 *  1. la carte SI, qui contient DEUX blocs (« alors » et « sinon ») visiblement
 *     côte à côte, avec la valeur du test au moment où on le rencontre ;
 *  2. la carte METTRE (affectation), qui montre le nom à gauche, la flèche, et
 *     la valeur calculée à droite — une variable qu'on ÉCRIT ne ressemble pas à
 *     une variable qu'on lit ;
 *  3. `branchePrise` : la branche réellement exécutée est mise en avant et
 *     l'autre s'éteint, sans jamais disparaître (l'élève doit voir ce qui n'a
 *     PAS été fait, sinon le choix ne se comprend pas).
 *
 * Rien n'est deviné ici : `branchePrise` vient du moteur (`branche` d'un pas de
 * `executerPasAPas`), jamais d'une évaluation refaite dans la vue — une
 * seconde évaluation pourrait diverger de celle qui a produit le dessin, et la
 * leçon mentirait.
 */

/** Une valeur affichée : nombre en dur, ou nom de variable avec sa valeur lue. */
function Valeur({ valeur, env, unite = '' }) {
  if (!estLecture(valeur)) {
    return <span className="font-mono font-black tabular-nums">{valeur}{unite}</span>;
  }
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono font-black text-violet-700">{ecrireValeur(valeur)}</span>
      <span className="rounded-md bg-violet-100 px-1.5 py-0.5 font-mono text-xs font-bold text-violet-800 tabular-nums">
        = {evalValeur(valeur, env)}{unite}
      </span>
    </span>
  );
}

/** Une instruction simple : avancer, tourner, lever, baisser, mettre. */
function Carte({ noeud, env, actif, atone }) {
  const meta = INSTRUCTION_LABELS[noeud.kind];
  const base = 'rounded-xl border-2 px-3 py-2 flex items-center gap-2.5 text-sm transition-colors';
  const ton = actif
    ? 'border-amber-400 bg-amber-50 text-amber-900'
    : atone
      ? 'border-slate-200 bg-slate-50 text-slate-400'
      : 'border-slate-200 bg-white text-slate-700';

  return (
    <div className={`${base} ${ton}`} data-instruction={noeud.kind}>
      <span aria-hidden="true" className="text-base leading-none">{meta.icon}</span>
      <span className="font-mono text-xs font-bold uppercase tracking-wide">{meta.label}</span>
      {noeud.kind === 'AVANCER' && (
        <span className="ml-auto"><Valeur valeur={noeud.valeur} env={env} /></span>
      )}
      {noeud.kind === 'TOURNER' && (
        <span className="ml-auto"><Valeur valeur={noeud.valeur} env={env} unite="°" /></span>
      )}
      {noeud.kind === 'AFFECTER' && (
        <span className="ml-auto inline-flex items-baseline gap-1.5">
          <span className="font-mono text-sm font-black text-purple-700">{noeud.nom}</span>
          <span aria-hidden="true" className="text-purple-400">←</span>
          <Valeur valeur={noeud.valeur} env={env} />
        </span>
      )}
    </div>
  );
}

/** Le bloc SI : le test, puis les deux branches, dont une seule s'exécutera. */
function CarteSi({ noeud, env, srcIndex, corpsIndex = null, actif, branchePrise }) {
  const estActif = actif?.srcIndex === srcIndex && actif?.corpsIndex === corpsIndex;
  const bloc = (nom, instructions, couleur) => {
    // La branche prise reste vive ; l'autre s'éteint mais reste LISIBLE :
    // comprendre un choix, c'est voir aussi ce qui n'a pas été fait.
    const prise = branchePrise === nom;
    const eteinte = branchePrise != null && !prise;
    return (
      <div
        className={`rounded-xl border-2 p-2 space-y-1.5 ${
          prise ? `${couleur.vif} ring-2 ring-offset-1 ${couleur.ring}` : eteinte ? 'border-slate-200 bg-slate-50/70' : couleur.calme
        }`}
        data-branche={nom}
        data-prise={prise ? 'oui' : 'non'}
      >
        <div className="flex items-center gap-1.5 px-0.5">
          <span className={`font-mono text-[11px] font-black uppercase tracking-wide ${eteinte ? 'text-slate-400' : couleur.texte}`}>
            {nom === 'alors' ? 'alors' : 'sinon'}
          </span>
          {prise && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800">
              chemin suivi
            </span>
          )}
          {eteinte && (
            <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-500">
              non exécuté
            </span>
          )}
        </div>
        {instructions.length === 0 ? (
          <p className="px-1 text-xs italic text-slate-400">rien à faire</p>
        ) : (
          <ol className="space-y-1.5">
            {instructions.map((b, j) => (
              <li key={j}>
                <Carte
                  noeud={b}
                  env={env}
                  actif={estActif && actif?.branche === nom && actif?.brancheIndex === j}
                  atone={eteinte}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span aria-hidden="true">🔀</span>
        <span className="font-mono text-xs font-bold uppercase tracking-wide text-sky-800">Si</span>
        <span className="rounded-lg bg-white px-2 py-1 font-mono text-sm font-black text-sky-900">
          {ecrireTest(noeud.test)}
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {bloc('alors', noeud.alors, {
          vif: 'border-emerald-400 bg-emerald-50', calme: 'border-emerald-200 bg-white',
          ring: 'ring-emerald-200', texte: 'text-emerald-700',
        })}
        {bloc('sinon', noeud.sinon, {
          vif: 'border-rose-400 bg-rose-50', calme: 'border-rose-200 bg-white',
          ring: 'ring-rose-200', texte: 'text-rose-700',
        })}
      </div>
    </div>
  );
}

/**
 * @param {Array} programme
 * @param {object} env             les variables au moment affiché
 * @param {object|null} actif      { srcIndex, corpsIndex, branche } — l'instruction en cours
 * @param {string|null} branchePrise 'alors' | 'sinon' — VENANT DU MOTEUR
 * @param {boolean} compact        masque le décompte d'instructions d'une boucle
 */
export default function ProgramView4e({
  programme,
  env = {},
  actif = null,
  branchePrise = null,
  compact = false,
  titre = 'Le programme',
}) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
      {titre && (
        <p className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">{titre}</p>
      )}
      <ol className="space-y-1.5" aria-label={titre ?? 'Le programme'}>
        {programme.map((noeud, i) => {
          if (noeud.kind === 'SI') {
            return (
              <li key={i}>
                <CarteSi
                  noeud={noeud}
                  env={env}
                  srcIndex={i}
                  actif={actif}
                  branchePrise={actif?.srcIndex === i && actif?.corpsIndex == null ? actif.branche : branchePrise}
                />
              </li>
            );
          }
          if (noeud.kind !== 'REPETER') {
            return (
              <li key={i}>
                <Carte
                  noeud={noeud}
                  env={env}
                  actif={actif?.srcIndex === i && actif?.corpsIndex == null}
                />
              </li>
            );
          }
          const fois = evalValeur(noeud.fois, env);
          const executees = noeud.corps.reduce(
            // Un SI dans la boucle n'exécute qu'une de ses deux branches : le
            // décompte le dit, sinon le nombre affiché serait faux dès qu'un
            // choix entre dans le corps.
            (n, b) => n + (b.kind === 'SI' ? Math.max(b.alors.length, b.sinon.length) : 1),
            0,
          );
          return (
            <li key={i}>
              <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-2 space-y-1.5">
                <div className="flex items-center gap-2 px-1">
                  <span aria-hidden="true">🔁</span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wide text-purple-800">
                    Répéter
                  </span>
                  <span className="font-mono text-sm font-black text-purple-900">
                    <Valeur valeur={noeud.fois} env={env} />
                  </span>
                  <span className="text-xs font-semibold text-purple-700">fois</span>
                </div>
                {/* Le corps est visiblement DEDANS : décalé, sur son propre fond. */}
                <ol className="space-y-1.5 border-l-[3px] border-purple-300 pl-2.5">
                  {noeud.corps.map((b, j) => (
                    <li key={j}>
                      {b.kind === 'SI' ? (
                        <CarteSi
                          noeud={b}
                          env={env}
                          srcIndex={i}
                          corpsIndex={j}
                          actif={actif}
                          branchePrise={actif?.srcIndex === i && actif?.corpsIndex === j ? actif.branche : branchePrise}
                        />
                      ) : (
                        <Carte
                          noeud={b}
                          env={env}
                          actif={actif?.srcIndex === i && actif?.corpsIndex === j && actif?.branche == null}
                        />
                      )}
                    </li>
                  ))}
                </ol>
                {!compact && (
                  <p className="px-1 text-[11px] text-purple-700">
                    au plus <strong>{fois * executees}</strong> instructions exécutées,
                    écrites en <strong>{noeud.corps.length}</strong>.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
