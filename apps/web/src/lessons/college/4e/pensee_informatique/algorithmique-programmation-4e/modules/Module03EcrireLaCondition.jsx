import React, { useState } from 'react';
import { Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceCanvas4e from '../components/TraceCanvas4e';
import ProgramView4e from '../components/ProgramView4e';
import {
  programmeGardeFou, SEUIL_GARDE_FOU, ESSAIS_GARDE_FOU,
} from '../components/programmes';
import { executer, COMPARATEURS } from '../../../../../common/turtle/trace4e';

/**
 * Module 3 — MANIPULATION : écrire la condition, et la vérifier à sa borne.
 *
 * Activity               composer soi-même le test d'un bloc de choix — ce
 *                        qu'on teste, comment on compare, à quoi on compare —
 *                        puis l'essayer sur trois valeurs choisies.
 * Mathematical objective une condition n'est ni vraie ni fausse en soi : elle
 *                        le devient pour une valeur. Deux conditions voisines
 *                        ne se distinguent que sur UNE valeur — la borne.
 * Student action         choisir le comparateur, puis lancer les trois essais.
 * Controlled variable    le comparateur, et la valeur d'essai.
 * Mathematical state     l'opérateur choisi et la valeur essayée ; la figure et
 *                        le verdict sont DÉRIVÉS par le moteur.
 * Visual consequence     la figure devient grande ou petite ; le tableau des
 *                        trois essais se remplit et la ligne du seuil se
 *                        détache.
 * Expected observation   « 49 et 51 ne les séparent pas ; 50 si ».
 * Misconception targeted croire que « > » et « ⩾ » sont interchangeables, et
 *                        tester une condition sur une valeur confortable.
 *
 * POURQUOI TROIS ESSAIS ET PAS UN. Un seul essai « qui marche » ne prouve
 * rien : les deux comparateurs candidats donnent le même résultat partout sauf
 * en 50. Le module fait donc constater l'insuffisance avant d'énoncer la règle
 * — l'élève essaie 51, croit avoir tranché, et découvre que non.
 */
const OPS = ['>', '>=', '=', '≠'];

export default function Module03EcrireLaCondition() {
  const [op, setOp] = useState('>');
  const [essais, setEssais] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const programme = programmeGardeFou(op, SEUIL_GARDE_FOU);

  const essayer = (v) => setEssais((liste) => (liste.includes(v) ? liste : [...liste, v]));

  // La manipulation est réussie quand les TROIS valeurs ont été essayées :
  // c'est le seul jeu d'essais qui puisse séparer deux comparateurs voisins.
  const done1 = ESSAIS_GARDE_FOU.every((v) => essais.includes(v));

  const lignes = ESSAIS_GARDE_FOU.map((v) => {
    const r = executer(programme, { env: { valeur: v } });
    const s = r.segments[0];
    return {
      valeur: v,
      essaye: essais.includes(v),
      cote: Math.round(Math.hypot(s.x2 - s.x1, s.y2 - s.y1)),
      branche: s.branche,
    };
  });

  const derniere = essais.length ? essais[essais.length - 1] : ESSAIS_GARDE_FOU[0];
  const apercu = executer(programme, { env: { valeur: derniere } });

  const lab = (
    <section role="group" aria-label="L’atelier de la condition" className="space-y-2.5 rounded-2xl border-2 border-sky-200 bg-sky-50/40 p-3">
      {/* ── Composer le test ──────────────────────────────────────────── */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Compose le test
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-lg bg-violet-100 px-3 py-2 font-mono text-sm font-black text-violet-800">
            valeur
          </span>
          <span className="flex flex-wrap gap-1.5">
            {OPS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOp(o)}
                aria-pressed={op === o}
                aria-label={`Comparateur : ${COMPARATEURS[o].aria}`}
                className={`min-h-[44px] min-w-[44px] rounded-lg border-2 font-mono text-base font-black transition-colors ${
                  op === o
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-sky-300 bg-white text-sky-700 hover:bg-sky-50'
                }`}
              >
                {COMPARATEURS[o].label}
              </button>
            ))}
          </span>
          <span className="rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-black text-slate-800">
            {SEUIL_GARDE_FOU}
          </span>
        </div>
      </div>

      <ProgramView4e programme={programme} env={{ valeur: derniere }} compact titre="Le programme du garde-fou" />

      <TraceCanvas4e
        resultat={apercu}
        hauteur={170}
        montrerStylo={false}
        teinterBranches
        titre={`la figure obtenue pour valeur = ${derniere}`}
      />

      {/* ── Les trois essais ──────────────────────────────────────────── */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
          Essaie ces trois valeurs
        </p>
        <div className="flex flex-wrap gap-2">
          {ESSAIS_GARDE_FOU.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => essayer(v)}
              className={`min-h-[44px] grow rounded-xl border-2 px-3 font-mono text-sm font-black transition-colors ${
                essais.includes(v)
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              valeur = {v}
            </button>
          ))}
        </div>
        {essais.length > 0 && (
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-1 text-left">valeur</th>
                  <th className="pb-1 text-right">le test</th>
                  <th className="pb-1 text-right">branche</th>
                  <th className="pb-1 text-right">côté</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {lignes.filter((l) => l.essaye).map((l) => (
                  <tr key={l.valeur} className={`border-t border-slate-100 ${l.valeur === SEUIL_GARDE_FOU ? 'bg-amber-50' : ''}`}>
                    <td className="py-1 text-slate-600">{l.valeur}</td>
                    <td className={`py-1 text-right font-bold ${l.branche === 'alors' ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {l.branche === 'alors' ? 'vrai' : 'faux'}
                    </td>
                    <td className="py-1 text-right text-slate-600">{l.branche}</td>
                    <td className="py-1 text-right font-bold text-slate-900">{l.cote}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );

  const steps = [
    {
      num: 1,
      title: 'Un garde-fou à régler',
      subtitle: 'Le programme doit tracer un GRAND carré à partir de 50, et un petit en dessous.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Pour « à partir de 50 », quel comparateur choisirais-tu ?"
            options={[
              { id: 'sup', label: 'valeur > 50' },
              { id: 'supeq', label: 'valeur ⩾ 50' },
              { id: 'pareil', label: 'Les deux reviennent au même' },
              { id: 'sais-pas', label: 'Je ne sais pas encore' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              Essaie les trois valeurs proposées avec ton comparateur, puis change-le et
              recommence. {essais.length}/3 essayées.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Regarde bien : avec « &gt; » comme avec « ⩾ », les valeurs 49 et 51 donnent la même
              chose. Une seule ligne du tableau les sépare.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La seule valeur qui tranche',
      done: q2,
      content: (
        <div className="space-y-3">
          {lab}
          <TapQuestion
            prompt="Sur quelle valeur « valeur > 50 » et « valeur ⩾ 50 » ne donnent-elles PAS le même résultat ?"
            options={['Sur 50 exactement', 'Sur 49', 'Sur 51', 'Sur aucune : elles sont identiques']}
            correct={0}
            cols={2}
            requires={['si-alors-sinon']}
            explain="Pour 49, les deux tests sont faux ; pour 51, les deux sont vrais. En 50, « > 50 » est faux et « ⩾ 50 » est vrai : c’est la seule valeur qui les distingue."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="condition-test"
              variant="new"
              lead="Ce que tu viens de composer a une forme précise, en trois morceaux."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le bon comparateur',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Le cahier des charges dit : « grand carré À PARTIR DE 50 ». Quel test écrire ?"
            options={['valeur ⩾ 50', 'valeur > 50', 'valeur = 50', 'valeur ≠ 50']}
            correct={0}
            cols={4}
            requires={['condition-test']}
            explain="« À partir de 50 » inclut 50 lui-même. Le test « valeur > 50 » exclurait exactement cette valeur : le garde-fou se déclencherait un cran trop tard."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="valeur-frontiere"
              variant="new"
              lead="D’où la seule façon fiable de vérifier une condition."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Vérifier une condition, pour de bon',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un camarade a écrit un test avec un seuil de 100 et l’a essayé avec 250. Que penser de son essai ?"
            options={[
              'Insuffisant : il faut aussi essayer 99, 100 et 101',
              'Suffisant : le test a bien fonctionné',
              'Inutile : un seul essai ne sert jamais à rien',
              'Faux : on ne teste jamais une valeur au-dessus du seuil',
            ]}
            correct={0}
            cols={1}
            requires={['valeur-frontiere']}
            explain="250 est très loin du seuil : tous les comparateurs « plus grand » y répondent pareil. C’est autour de 100 que les tests se séparent."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Jusqu’ici, la valeur testée était donnée une fois pour toutes. Et si elle CHANGEAIT
              pendant l’exécution ? C’est le module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Écrire la condition"
      moduleSubtitle="Presque juste, c’est faux"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Le garde-fou',
        tone: 'indigo',
        body: (
          <>
            Le programme doit tracer un grand carré <strong>à partir de 50</strong>, et un petit
            en dessous. À toi d’écrire le test — puis de prouver qu’il est juste.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            Trois valeurs d’essai t’attendent : 49, 50 et 51. Elles n’ont pas été choisies au
            hasard.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
