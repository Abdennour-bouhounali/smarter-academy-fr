import React, { useState } from 'react';
import { ListOrdered } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { demonstration, verifierOrdre, DEMONSTRATIONS } from '../components/paral4e';

/**
 * Module 6 — PRACTICE LAB : rédiger une démonstration.
 *
 * Ce module n'enseigne pas une technique de plus : il fait RÉDIGER. Les
 * maillons d'une démonstration sont donnés en désordre, et c'est l'élève qui
 * reconstitue la chaîne — donnée, propriété, conclusion. Les erreurs n'y
 * comptent pas comme preuve (stage `practice_lab`).
 *
 * TROIS SITUATIONS, dans l'ordre où elles deviennent difficiles :
 *   `construction`   — du glissement au parallélogramme (le sens direct) ;
 *   `reconnaissance` — du parallélogramme au glissement (le sens inverse,
 *                      qui surprend toujours) ;
 *   `chainee`        — deux conclusions à la file, où la première sert de
 *                      donnée à la seconde. C'est le vrai exercice de 4e.
 *
 * POURQUOI REMETTRE EN ORDRE PLUTÔT QUE CHOISIR UNE RÉPONSE. La difficulté
 * d'une démonstration n'est pas de savoir ce qui est vrai — c'est de savoir
 * dans quel ORDRE les vérités s'enchaînent, et laquelle sert de raison à
 * laquelle. Un QCM ne peut pas mesurer cela ; un ordre à reconstituer, oui.
 *
 * Le désordre est FIXE et non aléatoire : un tirage au sort donnerait
 * parfois l'ordre déjà juste, et l'exercice serait vide.
 */

/** L'ordre dans lequel les maillons sont proposés — jamais le bon. */
const DESORDRE = {
  construction: [2, 0, 1],
  reconnaissance: [1, 2, 0],
  chainee: [2, 1, 0],
};

const NOM_ROLE = {
  donnee: 'la donnée',
  propriete: 'la propriété',
  conclusion: 'la conclusion',
};

function ChaineARemettre({ nom, onReussi, reussi }) {
  const d = demonstration(nom);
  const propose = DESORDRE[nom].map((i) => d.maillons[i]);
  const [ordre, setOrdre] = useState([]);

  const restants = propose.filter((m) => !ordre.includes(m.id));
  const verdict = ordre.length === 3 ? verifierOrdre(nom, ordre) : null;

  const poser = (id) => {
    const suite = [...ordre, id];
    setOrdre(suite);
    if (suite.length === 3 && verifierOrdre(nom, suite).juste) onReussi();
  };

  return (
    <div className="space-y-2.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5">
      <p className="text-sm font-bold text-slate-700">{d.titre}</p>
      <p className="text-sm text-slate-600">{d.enonce}</p>

      {/* Ce qui est déjà posé. */}
      {ordre.length > 0 && (
        <ol className="space-y-1.5">
          {ordre.map((id, i) => {
            const m = d.maillons.find((x) => x.id === id);
            const bonEndroit = m.ordre === i + 1;
            return (
              <li
                key={id}
                data-maillon={id}
                className={`rounded-xl border-2 p-2.5 text-sm ${
                  bonEndroit ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : 'border-rose-300 bg-rose-50 text-rose-900'
                }`}
              >
                <span className="mr-1 font-black">{i + 1}.</span>{m.texte}
              </li>
            );
          })}
        </ol>
      )}

      {/* Ce qui reste à poser. */}
      {restants.length > 0 && (
        <div className="space-y-1.5">
          {restants.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => poser(m.id)}
              className="min-h-[44px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-rose-400"
            >
              {m.texte}
            </button>
          ))}
        </div>
      )}

      {verdict && !verdict.juste && (
        <>
          <p className="rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
            La ligne {verdict.premierFaux + 1} n’est pas à sa place : à cet endroit, il faut{' '}
            {NOM_ROLE[d.maillons[verdict.premierFaux].role]}. Une démonstration part toujours de
            ce qu’on SAIT, passe par ce que le cours DIT, et finit par ce qu’on en DÉDUIT.
          </p>
          <button
            type="button"
            onClick={() => setOrdre([])}
            className="min-h-[44px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600"
          >
            ↺ Recommencer cette démonstration
          </button>
        </>
      )}

      {reussi && (
        <p className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-900">
          La chaîne tient : on sait, or le cours dit, donc on conclut.
        </p>
      )}
    </div>
  );
}

export default function Module06TroisLignesQuiProuvent() {
  const [faites, setFaites] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const marquer = (nom) => setFaites((f) => (f.includes(nom) ? f : [...f, nom]));
  const done1 = faites.includes('construction') && faites.includes('reconnaissance');
  const done3 = faites.includes('chainee');

  const steps = [
    {
      num: 1,
      title: 'Remets les deux premières démonstrations en ordre',
      subtitle: 'Une donnée, une propriété, une conclusion. Appuie sur les lignes dans le bon ordre.',
      done: done1,
      content: (
        <div className="space-y-3">
          {['construction', 'reconnaissance'].map((nom) => (
            <ChaineARemettre
              key={nom}
              nom={nom}
              reussi={faites.includes(nom)}
              onReussi={() => marquer(nom)}
            />
          ))}
          {done1 && (
            <Feedback tone="ok">
              Les deux sens marchent : d’un glissement on tire un parallélogramme, et d’un
              parallélogramme on retrouve le glissement qui le referme.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La ligne qu’on oublie',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans une démonstration, quelle ligne est la plus souvent oubliée — et la seule qui prouve ?"
            options={[
              'La propriété : ce que le cours dit',
              'La donnée : ce que l’énoncé dit',
              'La conclusion : ce qu’on déduit',
              'Aucune : les trois se valent',
            ]}
            correct={0}
            cols={1}
            requires={['justifier-par-le-glissement']}
            explain="Sans la propriété, on passe de la donnée à la conclusion sans dire POURQUOI : le raisonnement a l’air juste, mais il ne démontre rien. C’est exactement ce que tu as corrigé au module précédent."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="trois-lignes-de-preuve"
              variant="new"
              lead="Tu viens de reconstituer deux chaînes. Voilà leur structure, une fois pour toutes."
            />
          )}
          {q2 && (
            <TapQuestion
              prompt="Par quel mot commence, le plus souvent, la ligne de la propriété ?"
              options={['Or…', 'On sait que…', 'Donc…', 'Peut-être que…']}
              correct={0}
              cols={2}
              requires={['trois-lignes-de-preuve']}
              explain="« On sait que » ouvre la donnée, « Or » introduit la propriété du cours, « Donc » amène la conclusion. Ces trois mots sont le squelette visible de toute démonstration."
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La démonstration en deux temps',
      subtitle: 'Ici, la conclusion du premier raisonnement devient la donnée du second.',
      done: done3,
      content: (
        <div className="space-y-3">
          <ChaineARemettre
            nom="chainee"
            reussi={faites.includes('chainee')}
            onReussi={() => marquer('chainee')}
          />
          {done3 && (
            <Feedback tone="ok">
              C’est le vrai exercice de 4e : on ne s’arrête pas au parallélogramme, on s’en sert
              pour obtenir autre chose — ici l’égalité de deux longueurs.
            </Feedback>
          )}
          {done3 && (
            <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-3.5 text-sm text-rose-900">
              <p className="font-semibold">Le réflexe à garder :</p>
              <p className="mt-1">
                quand un énoncé parle d’un glissement, cherche les deux points qu’il déplace —
                ils te donnent un parallélogramme, et le parallélogramme te donne tout le reste
                (côtés égaux, côtés parallèles, diagonales de même milieu).
              </p>
            </div>
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
      moduleTitle="Trois lignes qui prouvent"
      moduleSubtitle="Une donnée, une propriété, une conclusion"
      estimatedTime="8 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'L’ordre des raisons',
        tone: 'slate',
        body: (
          <>
            {Object.keys(DEMONSTRATIONS).length} démonstrations, données en désordre.{' '}
            <strong>À toi de remettre les raisons dans l’ordre.</strong> Les erreurs ne comptent
            pas ici.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <ListOrdered className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Appuie sur les lignes dans l’ordre où tu les écrirais. Si l’ordre ne tient pas, on te
            dira quelle ligne pose problème — et pourquoi.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
