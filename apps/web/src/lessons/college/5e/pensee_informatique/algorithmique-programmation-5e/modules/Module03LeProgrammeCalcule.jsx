import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceLab from '../components/TraceLab';
import { avancer, tourner, lit, formule, executer, evalValeur } from '../components/trace';

/**
 * Module 3 — DÉCOUVERTE : le programme ne lit plus seulement, il CALCULE.
 *
 * Le module 2 a posé la variable lue. Ici, l'instruction contient une
 * expression portant sur cette variable — c'est « produire une formule »,
 * l'objectif officiel de 5e, et c'est le même geste qu'en calcul littéral :
 * une lettre tient la place d'un nombre, et l'expression dit ce qu'on en fait.
 *
 * ACTION → CHANGE → OBSERVATION → SENS :
 *   ACTION       glisser `cote` sur un programme dont un côté vaut cote × 2 ;
 *   CHANGE       les deux côtés changent ENSEMBLE, mais pas de la même valeur ;
 *   OBSERVATION  le rectangle grandit sans jamais devenir un carré ;
 *   SENS         la formule fixe une RELATION entre deux longueurs — relation
 *                qu'aucune valeur particulière ne peut casser.
 *
 * Expected observation : « la longueur est toujours le double de la largeur,
 * quelle que soit la valeur que je donne ».
 * Misconception targeted : croire que `cote × 2` est un nombre (donc quelque
 * chose de figé), alors que c'est une façon de calculer un nombre — et que
 * cette façon, elle, ne change pas quand la valeur change.
 *
 * PÉRIMÈTRE : la formule reste un produit et une somme sur UNE variable lue.
 * Aucune variable modifiée en cours de route (4e), aucune condition.
 */

/* Le rectangle dont la longueur est calculée : cote de large, cote × 2 de long. */
const RECTANGLE = [
  avancer(lit('cote')), tourner(90),
  avancer(formule('cote', { fois: 2 })), tourner(90),
  avancer(lit('cote')), tourner(90),
  avancer(formule('cote', { fois: 2 })),
];

export default function Module03LeProgrammeCalcule() {
  const [q1, setQ1] = useState(false);
  const [cote, setCote] = useState(40);
  const [essais, setEssais] = useState(() => new Set());
  const vuRelation = essais.size >= 3;
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const majCote = (_, v) => {
    setCote(v);
    setEssais((s) => new Set(s).add(v));
  };

  const steps = [
    {
      num: 1,
      title: 'Une instruction qui contient un calcul',
      subtitle: 'Regarde la troisième instruction du programme.',
      done: q1,
      content: (
        <div className="space-y-3">
          <TraceLab
            programme={RECTANGLE}
            env={{ cote: 40 }}
            hauteur={230}
            titreProgramme="Le programme du rectangle"
            montrerLongueurs
            autoExecuter
            bilan={() => null}
          />
          <TapQuestion
            prompt={<>Avec <span className="font-mono font-bold">cote = 40</span>, de combien avance KIWI quand il rencontre l’instruction <span className="font-mono font-bold">AVANCER de cote × 2</span> ?</>}
            options={['80', '40', '42', '2']}
            correct={0}
            cols={4}
            requires={['variable-informatique', 'entree-programme']}
            explain="Le programme lit d’abord cote, qui vaut 40, puis effectue le calcul 40 × 2 = 80. Il avance donc de 80."
            explainWrong="L’instruction ne dit pas « avance de cote », mais « avance de cote × 2 ». Le programme va donc chercher la valeur de cote (40), puis la multiplie par 2 avant d’avancer."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une seule entrée, deux longueurs liées',
      subtitle: 'Change cote, et regarde les DEUX dimensions du rectangle.',
      done: vuRelation,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={RECTANGLE}
            env={{ cote }}
            entrees={[{ nom: 'cote', label: 'largeur du rectangle', min: 20, max: 70, pas: 5 }]}
            onEnv={(n, v) => { majCote(n, v); if (essais.size === 2) kit.react(true); }}
            autoExecuter
            montrerLongueurs
            hauteur={230}
            titreProgramme="Une entrée, deux dimensions"
            bilan={() => null}
          />
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 px-3 py-2.5 text-center">
            <div className="text-xs uppercase tracking-wide text-sky-700">Ce que le programme calcule</div>
            <div className="font-mono text-base font-black text-sky-900 tabular-nums">
              largeur = {cote} &nbsp;·&nbsp; longueur = {cote} × 2 = {evalValeur(formule('cote', { fois: 2 }), { cote })}
            </div>
          </div>
          {vuRelation ? (
            <>
              <Feedback tone="ok">
                Le rectangle grandit, rétrécit — mais il ne devient <strong>jamais</strong> un carré.
                La longueur reste le double de la largeur, quelle que soit la valeur choisie. Ce
                n’est pas une coïncidence : c’est la formule qui l’impose.
              </Feedback>
              <KnowledgeBrick
                id="formule-programme"
                variant="new"
                lead={<>Ce qui tient les deux dimensions ensemble, ce n’est aucun des nombres que tu as essayés.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Fais glisser <strong className="font-mono">cote</strong> sur au moins{' '}
              <strong>trois valeurs</strong>. Question à garder en tête : le rectangle peut-il
              devenir un carré ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Prédire une sortie',
      subtitle: 'Le programme est écrit. À toi de dire ce qu’il va produire.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 space-y-1.5">
            <p className="text-sm text-slate-700">On pose <strong className="font-mono">cote = 25</strong>, et KIWI exécute :</p>
            <p className="font-mono text-sm font-bold text-sky-900">
              AVANCER de cote × 2 &nbsp;·&nbsp; TOURNER de 90° &nbsp;·&nbsp; AVANCER de cote + 10
            </p>
          </div>
          {/* `expected` (et non `answer`) ; NumericQuestion n'a pas d'`explainWrong` :
              le feedback ciblé passe par `explainFor`, qui nomme l'erreur réellement
              commise au lieu de répéter la règle (§23). */}
          <NumericQuestion
            prompt="Quelle est la longueur du SECOND trait ?"
            expected={35}
            suffix="pas"
            requires={['formule-programme', 'variable-informatique']}
            explain="Le second trait vaut cote + 10. Le programme lit cote (25), puis ajoute 10 : 25 + 10 = 35."
            explainFor={(n) =>
              n === 50
                ? 'Tu as calculé le PREMIER trait : cote × 2 = 50. Le second porte l’autre formule, cote + 10.'
                : n === 25
                  ? 'C’est la valeur de cote elle-même. Mais l’instruction dit « AVANCER de cote + 10 » : il reste 10 à ajouter.'
                  : n === 35 + 50
                    ? 'Tu as additionné les deux traits. La question ne porte que sur le second : cote + 10.'
                    : null
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Pourquoi écrire une formule',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un programme trace un rectangle deux fois plus long que large. Pourquoi écrire « cote × 2 » plutôt que le nombre 80 ?"
            options={[
              'Parce que la relation « deux fois plus long » reste vraie pour toutes les valeurs de cote',
              'Parce que × 2 est plus rapide à calculer pour l’ordinateur',
              'Parce que 80 est un nombre trop grand pour une instruction',
              'Parce qu’on ne peut pas écrire de nombre dans une instruction',
            ]}
            correct={0}
            cols={1}
            requires={['formule-programme', 'entree-programme']}
            explain="Écrire 80 fige une seule figure. Écrire cote × 2 fige la RELATION entre les deux dimensions, et laisse la taille libre : le programme trace alors tous les rectangles de cette forme."
            explainWrong="Ce n’est pas une question de vitesse ni de taille des nombres : un nombre écrit en dur est parfaitement valable. Ce qu’il ne sait pas faire, c’est SUIVRE la valeur d’entrée quand elle change."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu sais maintenant donner une entrée à un programme et lui faire calculer. Il reste un
              défaut : pour un rectangle, tu écris déjà sept instructions. Pour une figure à douze
              côtés, il en faudrait vingt-quatre…
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
      moduleTitle="Le programme calcule"
      moduleSubtitle="Une formule dans l’instruction : la relation devient plus forte que les nombres"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Et si l’instruction contenait un calcul ?',
        tone: 'indigo',
        body: (
          <p>
            KIWI sait lire une valeur. Il peut aussi la <strong>calculer</strong> : une instruction
            n’est pas obligée de porter un nombre tout prêt, elle peut porter une opération. C’est
            ce qui permet de lier deux longueurs pour toujours.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
