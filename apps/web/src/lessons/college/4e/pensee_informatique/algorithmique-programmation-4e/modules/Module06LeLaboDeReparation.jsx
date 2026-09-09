import React, { useState } from 'react';
import { Bug } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceCanvas4e from '../components/TraceCanvas4e';
import ProgramView4e from '../components/ProgramView4e';
import { BUGS } from '../components/programmes';
import {
  executer, executerPasAPas, premiereDifference, premiereDifferenceVariables, cadre, arrondi,
} from '../../../../../common/turtle/trace4e';

/**
 * Module 6 — PRACTICE LAB : trouver la première instruction fautive.
 *
 * Activity               comparer un programme cassé à ce qu'on attendait, pas
 *                        à pas, jusqu'au PREMIER écart ; nommer l'instruction
 *                        fautive, la corriger, relancer.
 * Mathematical objective l'erreur est à l'endroit du premier écart, et nulle
 *                        part ailleurs : tout ce qui précède a produit
 *                        exactement l'attendu.
 * Student action         parcourir l'exécution des deux programmes côte à côte,
 *                        désigner l'instruction, appliquer la correction.
 * Controlled variable    le rang d'exécution, commun aux deux programmes.
 * Mathematical state     les deux programmes et le rang. Le point de
 *                        divergence est CALCULÉ par `premiereDifference` et
 *                        `premiereDifferenceVariables` — jamais colorié
 *                        d'avance, jamais écrit en dur dans le module.
 * Visual consequence     tant qu'on est avant l'écart, les deux tracés sont
 *                        superposables ; au pas de l'écart, ils se séparent.
 * Expected observation   « avant ce pas, les deux programmes faisaient
 *                        exactement la même chose ».
 * Misconception targeted relire un programme au hasard ; et croire qu'un
 *                        tracé identique prouve que tout va bien — la panne du
 *                        compteur se voit d'abord SUR LA VARIABLE.
 *
 * LES ERREURS N'Y COMPTENT PAS COMME PREUVE (stage `practice_lab`,
 * packages/core/curriculum/lessonStages.js) : c'est un atelier, pas un contrôle.
 *
 * TROIS PANNES, TROIS NATURES — voir `components/programmes.js` :
 *   · l'angle, qui diverge dès le premier virage ;
 *   · le seuil, dont le premier tour est IDENTIQUE (on ne peut donc pas
 *     conclure en regardant le début) ;
 *   · le compteur, dont la VARIABLE diverge un pas avant le dessin.
 * `parcours.test.js` vérifie que chaque pas annoncé ici est bien celui que le
 * moteur calcule.
 */

/** Le diagnostic d'une panne, entièrement calculé — jamais écrit à la main. */
function diagnostiquer(bug) {
  const casse = executer(bug.casse);
  const repare = executer(bug.repare);
  const ecartTrace = premiereDifference(repare, casse);
  const ecartVars = premiereDifferenceVariables(repare, casse);
  // Le premier des deux à diverger est celui qui désigne la panne. Un -1
  // signifie « jamais » : on ne le retient donc pas comme candidat.
  const candidats = [ecartTrace, ecartVars].filter((i) => i >= 0);
  const premier = candidats.length ? Math.min(...candidats) : -1;
  return {
    casse,
    repare,
    // `premiereDifference` indexe les ÉTAPES (0 = après la 1re instruction) ;
    // le pas affiché à l'élève commence à 1 pour la même instruction.
    ecartTrace,
    ecartVars,
    premier,
    pasAffiche: premier >= 0 ? premier + 1 : null,
    // La variable trahit-elle la panne AVANT le dessin ? C'est le fait que le
    // module fait constater sur la troisième panne.
    variableDAbord: ecartVars >= 0 && (ecartTrace < 0 || ecartVars < ecartTrace),
  };
}

const DIAGNOSTICS = BUGS.map((b) => ({ bug: b, ...diagnostiquer(b) }));

/** Un atelier de réparation : les deux tracés, la réglette, le verdict. */
function Atelier({ entree, repare, onReparer }) {
  const { bug, casse, premier, pasAffiche, ecartTrace, ecartVars, variableDAbord } = entree;
  const [rang, setRang] = useState(0);

  const programme = repare ? bug.repare : bug.casse;
  const pasCasse = executerPasAPas(bug.casse);
  const pasBon = executerPasAPas(bug.repare);
  const pasCourants = repare ? pasBon : pasCasse;
  const dernier = Math.max(pasCasse.length, pasBon.length) - 1;
  const r = Math.min(rang, pasCourants.length - 1);

  // Les deux figures partagent le MÊME cadre : sans cela, deux tracés de
  // tailles différentes paraîtraient superposables et la comparaison mentirait.
  const commun = (() => {
    const a = cadre(casse);
    const b = cadre(entree.repare);
    return {
      minX: Math.min(a.minX, b.minX), maxX: Math.max(a.maxX, b.maxX),
      minY: Math.min(a.minY, b.minY), maxY: Math.max(a.maxY, b.maxY),
      largeur: Math.max(1, Math.max(a.maxX, b.maxX) - Math.min(a.minX, b.minX)),
      hauteur: Math.max(1, Math.max(a.maxY, b.maxY) - Math.min(a.minY, b.minY)),
    };
  })();

  const avant = r > 0 && r < pasAffiche;
  const iBon = pasBon[Math.min(r, pasBon.length - 1)]?.env?.i;
  const iCasse = pasCasse[Math.min(r, pasCasse.length - 1)]?.env?.i;
  // Le programme UTILISE-T-IL une variable ? La question ne se pose pas au pas
  // courant mais sur toute l'exécution : au pas 0, aucune affectation n'a
  // encore eu lieu et `env` est vide. Sans cela, le bandeau des variables
  // apparaîtrait au milieu du parcours — et l'élève ne verrait jamais le
  // passage « pas encore définie » → « vaut 20 », qui EST l'affectation.
  const suitUneVariable = pasBon.some((p) => p.env?.i != null) || pasCasse.some((p) => p.env?.i != null);

  return (
    <section role="group" aria-label={`Réparation : ${bug.nom}`} className="space-y-2.5 rounded-2xl border-2 border-rose-200 bg-rose-50/40 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-bold text-slate-800">{bug.nom}</h4>
        <span className="text-xs text-slate-500">attendu : {bug.attendu}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <p className="text-center text-[11px] font-bold uppercase tracking-wide text-emerald-600">
            Ce qu’on attendait
          </p>
          <TraceCanvas4e
            resultat={entree.repare}
            segments={pasBon[Math.min(r, pasBon.length - 1)].segmentsJusquIci}
            stylo={pasBon[Math.min(r, pasBon.length - 1)].pos}
            cadreImpose={commun}
            hauteur={150}
            fond="uni"
            titre="le tracé attendu, à ce pas"
          />
        </div>
        <div className="space-y-1">
          <p className="text-center text-[11px] font-bold uppercase tracking-wide text-rose-600">
            {repare ? 'Après ta réparation' : 'Ce que le programme fait'}
          </p>
          <TraceCanvas4e
            resultat={repare ? entree.repare : casse}
            segments={pasCourants[r].segmentsJusquIci}
            stylo={pasCourants[r].pos}
            cadreImpose={commun}
            hauteur={150}
            fond="uni"
            titre="le tracé obtenu, à ce pas"
          />
        </div>
      </div>

      {/* La réglette commune : c'est elle qui fait constater où ça diverge. */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5">
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400" htmlFor={`rang-${bug.id}`}>
          Avance pas à pas dans les deux programmes
        </label>
        <input
          id={`rang-${bug.id}`}
          type="range"
          min={0}
          max={dernier}
          value={r}
          onChange={(e) => setRang(Number(e.target.value))}
          className="sa-slider mt-1.5 w-full accent-rose-600"
        />
        <p className="mt-1 font-mono text-sm font-black tabular-nums text-slate-900">
          pas {r} / {dernier}
        </p>
        {/* Les variables des DEUX programmes, quand il y en a : c'est ce qui
            rend visible la panne du compteur avant que le dessin ne bouge. */}
        {suitUneVariable && (
          <p className="mt-1 font-mono text-sm tabular-nums text-purple-800">
            i attendu = <strong>{iBon ?? '—'}</strong>
            <span className="mx-2 text-slate-300">|</span>
            i obtenu = <strong className={iBon !== iCasse && !repare ? 'text-rose-700' : ''}>{(repare ? iBon : iCasse) ?? '—'}</strong>
          </p>
        )}
        {!repare && avant && (
          <p className="mt-1 text-xs font-semibold text-emerald-700">
            Jusqu’ici, les deux programmes ont fait exactement la même chose.
          </p>
        )}
        {!repare && pasAffiche != null && r >= pasAffiche && (
          <p className="mt-1 text-xs font-semibold text-rose-700">
            Les deux se sont séparés au pas {pasAffiche}
            {variableDAbord ? ' — et c’est la VARIABLE qui a divergé la première.' : '.'}
          </p>
        )}
      </div>

      <ProgramView4e programme={programme} compact titre={repare ? 'Le programme réparé' : 'Le programme, tel qu’il est écrit'} />

      {!repare ? (
        <button
          type="button"
          onClick={onReparer}
          className="min-h-[44px] w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700"
        >
          Corriger : mettre <span className="font-mono">{bug.correction}</span> dans l’instruction {bug.instruction}
        </button>
      ) : (
        <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
          Réparé. Les deux tracés ne se séparent plus à aucun pas
          {ecartTrace < 0 && ecartVars < 0 ? '.' : '.'}
        </div>
      )}
    </section>
  );
}

export default function Module06LeLaboDeReparation() {
  const [repares, setRepares] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const reparer = (id) => setRepares((liste) => (liste.includes(id) ? liste : [...liste, id]));
  const done1 = repares.length === DIAGNOSTICS.length;

  const compteur = DIAGNOSTICS.find((d) => d.bug.id === 'compteur');
  const seuil = DIAGNOSTICS.find((d) => d.bug.id === 'seuil');

  const steps = [
    {
      num: 1,
      title: 'Trois programmes cassés',
      subtitle: 'Pour chacun : avance pas à pas jusqu’au premier écart, puis corrige.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Ici, les erreurs ne comptent pas. Prends le temps de faire glisser la réglette avant
            de corriger : c’est le geste qui compte, pas la vitesse.
          </p>
          {DIAGNOSTICS.map((d) => (
            <Atelier
              key={d.bug.id}
              entree={d}
              repare={repares.includes(d.bug.id)}
              onReparer={() => reparer(d.bug.id)}
            />
          ))}
          {!done1 && (
            <Feedback tone="info">
              {repares.length}/3 réparés. Pour chaque programme, cherche le premier pas où les
              deux tracés — ou les deux valeurs de i — cessent d’être identiques.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Trois pannes, trois natures : un angle faux, un seuil faux, un compteur qui
              n’avance pas. Aucune ne se voyait en relisant le programme de haut en bas.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le premier tour était identique',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Dans « {seuil.bug.nom} », les deux programmes tracent le même premier côté. Ils ne se
            séparent qu’au pas {seuil.pasAffiche}.
          </p>
          <TapQuestion
            prompt="Que peut-on en conclure sur la façon de chercher un bug ?"
            options={[
              'Regarder le début ne suffit pas : il faut exécuter jusqu’au premier écart',
              'Un programme faux se trompe forcément dès le début',
              'Il faut relire toutes les instructions dans l’ordre',
              'Il faut changer une valeur au hasard et voir',
            ]}
            correct={0}
            cols={1}
            requires={['deboguer', 'pas-a-pas']}
            explain="Une condition dont le seuil est faux d’une unité peut donner le bon résultat pendant plusieurs tours, puis se tromper. Seule l’exécution pas à pas trouve l’endroit exact."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand la variable trahit avant le dessin',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Dans « {compteur.bug.nom} », les valeurs de i diffèrent dès le pas{' '}
            <strong>{compteur.ecartVars + 1}</strong>, alors que les deux tracés sont encore
            identiques — ils ne se séparent qu’au pas{' '}
            <strong>{compteur.ecartTrace + 1}</strong>.
          </p>
          <TapQuestion
            prompt="Pourquoi faut-il surveiller les variables et pas seulement le tracé ?"
            options={[
              'Parce qu’une variable peut être fausse avant que le dessin ne le montre',
              'Parce que le tracé est toujours juste',
              'Parce que les variables ne servent qu’à décorer',
              'Parce qu’un dessin faux vient toujours d’une variable',
            ]}
            correct={0}
            cols={1}
            requires={['compteur', 'pas-a-pas']}
            explain="Le compteur a cessé d’avancer un pas avant que le côté suivant ne soit tracé. Qui ne regarde que le dessin cherche l’erreur un pas trop loin — et souvent au mauvais endroit."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="premier-ecart"
              variant="new"
              lead="Voilà la méthode complète, celle qui vaut aussi pour les variables."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le labo de réparation"
      moduleSubtitle="Le premier écart désigne la faute"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'Trois pannes à trouver',
        tone: 'slate',
        body: (
          <>
            Trois programmes ne font pas ce qu’on leur demandait. Pour chacun, trouve{' '}
            <strong>le premier pas où ça dérape</strong>. Les erreurs ne comptent pas ici.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <Bug className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Les deux tracés sont dessinés dans le même cadre et avancent ensemble. Tant qu’ils se
            superposent, tout va bien — la faute est là où ils se séparent.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
