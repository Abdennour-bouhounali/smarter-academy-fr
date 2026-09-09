import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { diagnostiquerScientifique } from '../components/puissances4e';

/**
 * Module 4 — FORMALISATION : la notation scientifique.
 *
 * Activity              faire glisser la virgule d'un nombre et voir
 *                       l'exposant compenser exactement le déplacement — le
 *                       nombre affiché ne change JAMAIS de valeur.
 * Mathematical objective a × 10ⁿ avec 1 ≤ a < 10. La contrainte sur `a`
 *                       n'est pas un caprice : c'est elle qui rend
 *                       l'écriture UNIQUE, donc comparable.
 * Student action        déplacer la virgule d'un rang, à gauche ou à droite.
 * Controlled variable   la position de la virgule, seule.
 * Visual consequence    le couple (coefficient, exposant) change, la valeur
 *                       reconstituée reste identique — et un bandeau dit si
 *                       l'écriture courante est scientifique.
 * Expected observation  « il n'y a qu'une seule position qui donne une
 *                       écriture scientifique ».
 * Misconception targeted « 45 × 10³ est une écriture scientifique ».
 *
 * Ce module EXIGE le module 2 : sans exposant négatif, on ne pourrait pas
 * écrire 0,00072.
 */

/** Le nombre à mettre en forme, et toutes ses écritures a × 10ⁿ. */
const NOMBRE = 45000;

const ecritures = (x) => {
  const out = [];
  for (let e = 0; e <= 6; e += 1) {
    out.push({ coefficient: x / 10 ** e, exposant: e });
  }
  return out;
};

export default function Module04EcrireLImmense() {
  const [i, setI] = useState(0);
  const [trouve, setTrouve] = useState(false);
  const liste = ecritures(NOMBRE);
  const cur = liste[i];
  const estSci = diagnostiquerScientifique(cur.coefficient) === 'ok';

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  /** Écriture française d'un décimal, sans notation exponentielle anglaise. */
  const fr = (v) => {
    const s = String(Math.round(v * 1e9) / 1e9);
    return s.replace('.', ',');
  };

  const steps = [
    {
      num: 1,
      title: 'Déplace la virgule',
      subtitle: 'Toutes ces écritures désignent le même nombre. Une seule respecte la règle affichée sous le nombre — trouve-la.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Le nombre de départ : {fr(NOMBRE)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black">
              <span className="tabular-nums text-indigo-700">{fr(cur.coefficient)}</span>
              <span className="text-slate-400">×</span>
              <span className="tabular-nums text-violet-700">
                10<sup>{cur.exposant}</sup>
              </span>
            </div>
            <p className="mt-1 text-center text-xs text-slate-500">
              soit {fr(cur.coefficient * 10 ** cur.exposant)} — la valeur ne change jamais
            </p>

            <div
              className={`mt-3 rounded-xl border-2 p-2 text-center text-sm font-semibold ${
                estSci
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 bg-slate-50 text-slate-600'
              }`}
            >
              {estSci
                ? 'Écriture scientifique : le coefficient est bien entre 1 et 10.'
                : cur.coefficient >= 10
                ? `Le coefficient (${fr(cur.coefficient)}) est trop grand : il doit être inférieur à 10.`
                : `Le coefficient (${fr(cur.coefficient)}) est trop petit : il doit valoir au moins 1.`}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                aria-label="Déplacer la virgule vers la droite"
                disabled={i <= 0}
                onClick={() => setI(i - 1)}
                className="min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-4 font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                ← virgule
              </button>
              <button
                type="button"
                aria-label="Déplacer la virgule vers la gauche"
                disabled={i >= liste.length - 1}
                onClick={() => {
                  const n = i + 1;
                  setI(n);
                  if (diagnostiquerScientifique(liste[n].coefficient) === 'ok' && !trouve) {
                    setTrouve(true);
                    kit.react(true);
                  }
                }}
                className="min-h-[44px] rounded-xl border-2 border-slate-300 bg-white px-4 font-bold text-slate-600 hover:border-slate-500 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                virgule →
              </button>
            </div>
          </div>

          {trouve ? (
            <Feedback tone="ok">
              <strong>4,5 × 10⁴</strong> : un seul chiffre non nul avant la virgule. Chaque rang dont
              la virgule recule est <strong>compensé</strong> par un exposant de plus — c’est pour
              cela que la valeur ne bouge pas. Et surtout : parmi toutes ces écritures, il n’y en a{' '}
              <strong>qu’une seule</strong> qui respecte la contrainte. C’est ce qui rend deux
              nombres comparables d’un coup d’œil. Continue à déplacer la virgule pour t’en
              convaincre.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Le coefficient doit finir <strong>entre 1 et 10</strong> : un seul chiffre non nul
              avant la virgule.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écris un grand nombre',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="notation-scientifique"
            variant="new"
            lead={<>Tu viens de trouver l’unique écriture où le coefficient tombe entre 1 et 10. C’est celle que tout le monde utilise, et elle a un nom.</>}
          />
          <NumericQuestion
            prompt="La distance Terre–Soleil vaut environ 150 000 000 km. Écrite en notation scientifique, quel est l’EXPOSANT de 10 ?"
            expected={8}
            requires={['notation-scientifique']}
            explain="150 000 000 = 1,5 × 10⁸. La virgule recule de 8 rangs pour venir se placer après le 1."
            explainFor={(n) =>
              n === 9
                ? "Attention à ne pas confondre le nombre de zéros (8) avec le nombre de chiffres (9). L’exposant compte les rangs dont la virgule recule : de 150 000 000 à 1,5, il y en a 8."
                : "Place la virgule après le premier chiffre non nul : 1,5. Compte ensuite les rangs parcourus — il y en a 8."
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Écris un tout petit nombre',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Un virus mesure environ 0,00000012 m. En notation scientifique, quel est l’exposant de 10 ? (utilise le signe − si besoin)"
            expected={-7}
            parse={(s) => {
              // parseFr refuse les négatifs et parseDec refuse le vrai moins
              // U+2212 : la réponse attendue étant négative, il faut les deux.
              const t = String(s).replace(/−/g, '-').replace(/[\s  ]/g, '').replace(',', '.');
              const n = Number(t);
              return Number.isFinite(n) ? n : NaN;
            }}
            display="−7"
            requires={['notation-scientifique', 'exposant-negatif']}
            explain="0,00000012 = 1,2 × 10⁻⁷. Cette fois la virgule avance vers la droite : l’exposant est négatif."
            explainFor={(n) =>
              n === 7
                ? "Le bon nombre de rangs, mais le mauvais signe : ici on part d’un nombre PLUS PETIT que 1, donc la virgule avance vers la droite et l’exposant est négatif."
                : "Amène la virgule après le premier chiffre non nul (le 1) : elle traverse 7 rangs vers la droite, d’où 10⁻⁷."
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Est-ce bien scientifique ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Laquelle de ces écritures est une notation scientifique ?"
            options={['0,82 × 10⁵', '82 × 10³', '8,2 × 10⁴', 'Les trois, elles valent le même nombre']}
            correct={2}
            cols={2}
            requires={['notation-scientifique']}
            explain="Les trois valent bien 82 000, mais une seule est scientifique : 8,2 × 10⁴, dont le coefficient est entre 1 et 10. 82 est trop grand, 0,82 est trop petit."
            explainWrong="Désigner le bon nombre ne suffit pas : la notation scientifique impose 1 ≤ a < 10 — un seul chiffre non nul avant la virgule. C’est cette contrainte qui rend l’écriture unique."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Écrire l’immense et l’infime"
      moduleSubtitle="Une écriture unique pour tous les nombres"
      estimatedTime="12 min"
      brief={{
        tag: 'Formalisation',
        title: 'Sans compter les zéros',
        tone: 'indigo',
        body: (
          <p>
            La masse du Soleil s’écrit avec 30 zéros, celle d’un atome avec 26 zéros après la
            virgule. Personne ne les compte : on utilise une écriture qui{' '}
            <strong>range les zéros dans l’exposant</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
