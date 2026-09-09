import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IssuesLab from '../components/IssuesLab';
import { EXPERIENCES, nombreIssues } from '../components/probabilites';

/**
 * Module 2 — DÉCOUVERTE : les issues.
 *
 * L'élève COCHE lui-même tous les résultats possibles du dé. Le module ne
 * valide pas « la bonne liste » : il fait apparaître les deux façons de se
 * tromper — en oublier, ou compter deux fois la même chose — et c'est de là
 * que sortent les deux règles d'une bonne énumération.
 *
 * Expected observation : « une liste d'issues doit être complète et sans
 * doublon, sinon je ne pourrai jamais compter correctement ».
 * Misconception targeted : prendre une DESCRIPTION (« un nombre pair ») pour
 * une issue ; et croire que le sac de billes a 3 issues (les couleurs) alors
 * qu'il en a 6 (les billes) — piège préparé ici, résolu au module 4.
 *
 * Toujours AUCUN quotient, aucune fraction de probabilité.
 */
export default function Module02ToutCeQuiPeutArriver() {
  const [selection, setSelection] = useState([]);
  const [q1, setQ1] = useState(false);
  const [n2, setN2] = useState(false);
  const [q3, setQ3] = useState(false);

  const toutesCochees = selection.length === 6;

  const steps = [
    {
      num: 1,
      title: 'Coche tout ce que le dé peut donner',
      subtitle: 'Sans en oublier un seul — et sans en inventer.',
      done: q1,
      content: (
        <div className="space-y-3">
          {/* La manipulation ouvre le module. */}
          <IssuesLab
            experience="de"
            selection={selection}
            onSelection={setSelection}
            intitule={<>Coche <strong>tous</strong> les résultats possibles d’un lancer de dé à 6 faces.</>}
          />
          {toutesCochees && (
            <Feedback tone="ok">
              Six cases cochées, et pas une de plus : le dé ne peut donner ni 0, ni 7, ni « pile ».
            </Feedback>
          )}
          <TapQuestion
            prompt="Combien de résultats possibles un lancer de dé à 6 faces a-t-il ?"
            options={['6', '2', '12', 'Une infinité']}
            correct={0}
            cols={4}
            requires={[]}
            explain="Exactement 6 : les faces 1, 2, 3, 4, 5 et 6. Un lancer donne toujours une seule de ces six faces."
            explainWrong="Compte les faces du dé : elles sont six, et chaque lancer en donne exactement une."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <KnowledgeBrick
              id="issue"
              variant="new"
              lead={<>La liste que tu viens de cocher a un nom, et les deux règles que tu as respectées sans y penser sont ce qui la rend utilisable.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'D’autres dispositifs',
      subtitle: 'Compte les issues de chacun.',
      done: n2,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 text-center space-y-1">
              <div className="text-2xl" aria-hidden>🪙</div>
              <div className="text-sm font-semibold text-slate-700">Une pièce</div>
              <div className="text-xs text-slate-500">
                {nombreIssues(EXPERIENCES.piece)} issues : Pile, Face
              </div>
            </div>
            <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 text-center space-y-1">
              <div className="text-2xl" aria-hidden>🎒</div>
              <div className="text-sm font-semibold text-slate-700">
                Un sac de {EXPERIENCES.urne.billes.length} billes
              </div>
              <div className="text-xs text-slate-500">
                On tire une bille sans regarder
              </div>
            </div>
          </div>
          <NumericQuestion
            prompt={
              <>
                Dans le sac, il y a <strong>3 billes rouges, 2 bleues et 1 verte</strong>, toutes
                de même taille. Combien y a-t-il d’issues, c’est-à-dire de billes qu’on peut
                tirer ?
              </>
            }
            expected={6}
            suffix="issues"
            requires={['issue']}
            explain="Six billes dans le sac, donc six tirages possibles. Chaque bille est un résultat à part entière, même si trois d’entre elles ont la même couleur."
            explainFor={(n) =>
              n === 3
                ? 'Tu as compté les COULEURS (rouge, bleu, vert). Mais on tire une bille, pas une couleur : les trois billes rouges sont trois issues différentes, même si elles se ressemblent.'
                : 'Compte les billes présentes dans le sac : 3 + 2 + 1.'
            }
            solved={n2}
            onAnswered={() => setN2(true)}
          />
          {n2 && (
            <Feedback tone="info">
              Retiens bien ce sac : les billes sont six, les couleurs sont trois. Cette
              différence va devenir très importante dans deux modules.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qui n’est pas une issue',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<>Parmi ces quatre propositions, laquelle n’est <strong>pas</strong> une issue du lancer de dé ?</>}
            options={[
              '« Obtenir un nombre pair »',
              '« Obtenir 3 »',
              '« Obtenir 6 »',
              '« Obtenir 1 »',
            ]}
            correct={0}
            cols={2}
            requires={['issue']}
            explain="« Obtenir un nombre pair » regroupe trois issues (2, 4 et 6) : c’est une description, pas un résultat. Une issue est toujours un résultat unique et précis."
            explainWrong="3, 6 et 1 sont des faces du dé : ce sont bien des issues. « Un nombre pair » n’est pas une face — c’est une façon de parler de plusieurs faces à la fois."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              «&nbsp;Obtenir un nombre pair&nbsp;» n’est donc pas une issue — mais ce n’est pas
              rien pour autant. C’est autre chose, qui porte aussi un nom, et c’est le sujet du
              module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Tout ce qui peut arriver"
      moduleSubtitle="La liste qu’on connaît d’avance"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Ce que tu sais déjà, avant même de lancer',
        tone: 'indigo',
        body: (
          <p>
            Tu ne peux pas prédire le résultat, mais tu peux écrire la liste complète de ce qui
            peut arriver. Cette liste est le premier outil de toute la leçon — et elle doit
            respecter deux règles : <strong>rien d’oublié, rien en double</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
