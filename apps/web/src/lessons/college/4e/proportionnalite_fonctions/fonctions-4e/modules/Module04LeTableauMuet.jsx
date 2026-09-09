import React, { useState } from 'react';
import { Search, ShieldQuestion } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TesteurDeFormule from '../components/TesteurDeFormule';
import {
  programme, tableau, testerFormule, frRat,
} from '../components/fonctions4e';
import { expr } from '../../../../../common/algebra4e';

/**
 * Module 4 — MANIPULATION : d'un tableau vers la règle qui l'explique.
 *
 * Activity              essayer des écritures candidates sur un tableau dont
 *                       la machine est CACHÉE, et lire le rapport qu'elles
 *                       produisent — couple par couple.
 * Mathematical objective une candidate ne se juge pas sur un couple mais sur
 *                       TOUS. Deux couples suffisent à la proposer ; les
 *                       autres la confirment ou la réfutent.
 * Student action        sélectionner une candidate ; en essayer une autre ;
 *                       revenir sur une éliminée pour comprendre pourquoi.
 * Controlled variable   la candidate.
 * Mathematical state    (couples, candidate). Le rapport — accord, total, et
 *                       la liste NOMMÉE des couples qui démentent — est
 *                       calculé par `testerFormule`, jamais rédigé.
 * Visual consequence    chaque colonne du tableau reçoit sa marque ✓ ou ✗.
 * Expected observation  « celle-là colle deux fois sur quatre — et ça ne
 *                       suffit pas ».
 * Misconception targeted valider une règle sur le premier couple venu. Le
 *                       piège est TENDU : au second tableau, deux candidates
 *                       collent chacune sur exactement deux couples.
 * Formalization         la brique `du-tableau-a-la-formule` arrive après que
 *                       l'élève a lui-même éliminé une candidate d'accord
 *                       partiel.
 *
 * DIFFÉRENCE AVEC LE MODULE 3 : là-bas, la chaîne était VISIBLE et l'écriture
 * se lisait dessus. Ici il n'y a plus de chaîne : seulement des couples. Et
 * le second tableau n'en cache aucune — dire qu'aucune écriture de ce type ne
 * l'explique est une RÉPONSE, pas un échec.
 */

/** Le premier tableau : une vraie chaîne le produit, mais elle est cachée. */
const CACHEE = programme(['×', 3], ['+', 2]);
const TABLE_1 = tableau(CACHEE, [1, 2, 4, 7]);

const CANDIDATES_1 = [
  { id: 'c5x', a: 5, b: 0 },
  { id: 'c4x1', a: 4, b: 1 },
  { id: 'c3x2', a: 3, b: 2 },
  { id: 'c2x4', a: 2, b: 4 },
];

/**
 * Le second tableau n'est produit par AUCUNE écriture de ce type — et c'est
 * délibéré : `formuleDepuisTableau` rend `null`, ce qui est une réponse
 * mathématique. Deux candidates y collent sur exactement DEUX couples sur
 * quatre : c'est le piège de l'accord partiel, tendu pour de bon.
 */
const TABLE_2 = [
  { x: 0, y: 1 },
  { x: 1, y: 2 },
  { x: 2, y: 5 },
  { x: 3, y: 10 },
];

const CANDIDATES_2 = [
  { id: 'd1x1', a: 1, b: 1 },
  { id: 'd3x1', a: 3, b: 1 },
  { id: 'd2x1', a: 2, b: 1 },
  { id: 'd4x2', a: 4, b: -2 },
];

/**
 * Le troisième tableau — celui que l'élève déchiffre SANS liste de candidates.
 * Il est produit par une chaîne réelle, et les valeurs affichées comme la
 * réponse attendue en sont DÉRIVÉES : le module ne peut pas afficher un
 * tableau et attendre un nombre qui ne lui correspondrait pas.
 */
const CACHEE_3 = programme(['×', 4], ['+', 3]);
const TABLE_3 = tableau(CACHEE_3, [1, 2, 3, 5]).map((c) => ({
  x: Number(frRat(c.x)),
  y: Number(frRat(c.y)),
}));
const SORTIE_10 = Number(frRat(tableau(CACHEE_3, [10])[0].y));

/** Le nombre de couples qu'une candidate explique — calculé, jamais écrit. */
const accordDe = (c, couples) => testerFormule(expr(c.a, c.b), couples).accord;

export default function Module04LeTableauMuet() {
  const [choisie1, setChoisie1] = useState(null);
  const [essayees1, setEssayees1] = useState([]);
  const [choisie2, setChoisie2] = useState(null);
  const [essayees2, setEssayees2] = useState([]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const essayer = (setChoisie, setEssayees) => (i) => {
    setChoisie(i);
    if (i != null) setEssayees((liste) => (liste.includes(i) ? liste : [...liste, i]));
  };

  // Étape 1 : au moins deux candidates essayées, ET la bonne trouvée.
  const bonne1 = CANDIDATES_1.findIndex((c) => accordDe(c, TABLE_1) === TABLE_1.length);
  const done1 = essayees1.length >= 2 && essayees1.includes(bonne1);
  // Étape 2 : les quatre candidates essayées — aucune ne convient, et c'est
  // en les ayant TOUTES vues échouer qu'on a le droit de le conclure.
  const done2 = essayees2.length >= CANDIDATES_2.length;

  const steps = [
    {
      num: 1,
      title: 'Un tableau, sans sa machine',
      subtitle: 'Quatre couples. Quelle écriture les explique tous ?',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Cette fois, la chaîne est cachée. On ne voit que ce qu’elle a rendu. Essaie les
            écritures proposées : le testeur te dira, pour chacune, quels couples la démentent.
          </p>
          <TesteurDeFormule
            couples={TABLE_1}
            candidates={CANDIDATES_1}
            choisie={choisie1}
            onChoisir={(i) => {
              essayer(setChoisie1, setEssayees1)(i);
              if (i === bonne1) kit.react?.(true);
            }}
          />
          {done1 && (
            <Feedback tone="ok">
              Une seule explique les quatre couples. Les autres tombaient juste{' '}
              <strong>une fois</strong> — et une fois ne prouve rien.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le piège de l’accord partiel',
      subtitle: 'Un autre tableau. Essaie les QUATRE candidates, sans en sauter une.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Regarde bien les rapports : plusieurs candidates collent{' '}
            <strong>sur deux couples</strong>. Avant de conclure quoi que ce soit, essaie-les
            toutes.
          </p>
          <TesteurDeFormule
            couples={TABLE_2}
            candidates={CANDIDATES_2}
            choisie={choisie2}
            onChoisir={(i) => {
              essayer(setChoisie2, setEssayees2)(i);
              kit.react?.(true);
            }}
          />
          {!done2 && (
            <Feedback tone="info">
              {essayees2.length} candidate{essayees2.length > 1 ? 's' : ''} sur{' '}
              {CANDIDATES_2.length} essayée{essayees2.length > 1 ? 's' : ''}.
            </Feedback>
          )}
          {done2 && (
            <Feedback tone="info">
              Aucune ne convient. Deux d’entre elles collaient pourtant sur la moitié du tableau —
              c’est exactement pourquoi il fallait continuer.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qu’il faut en conclure',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Une candidate colle sur deux couples du tableau, et pas sur les deux autres. Que vaut-elle ?"
            options={[
              'Rien : elle est fausse, car une règle doit expliquer TOUS les couples',
              'La moitié : elle est vraie une fois sur deux',
              'Elle est bonne pour la partie du tableau où elle colle',
              'Il faudrait un cinquième couple pour trancher',
            ]}
            correct={0}
            cols={1}
            requires={['formule-qui-resume']}
            explain={`Une écriture prétend dire ce que la machine fait pour TOUT nombre. Un seul couple qui la dément la réfute. Ici, ${frRat(TABLE_2[2].x)} → ${frRat(TABLE_2[2].y)} et ${frRat(TABLE_2[3].x)} → ${frRat(TABLE_2[3].y)} ne suivent aucune des candidates proposées.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="du-tableau-a-la-formule"
              variant="new"
              lead="Voici la marche à suivre — et pourquoi la dernière étape est la plus importante."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le second tableau, honnêtement',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Aucune des quatre candidates n’explique le second tableau. Que faut-il en dire ?"
            options={[
              'Qu’aucune écriture de ce type ne l’explique : c’est une réponse, pas un échec',
              'Qu’on a mal calculé quelque part',
              'Que le tableau est faux',
              'Qu’il faut choisir la candidate la moins mauvaise',
            ]}
            correct={0}
            cols={1}
            requires={['du-tableau-a-la-formule']}
            explain={`Regarde comment la sortie augmente : de ${frRat(TABLE_2[0].y)} à ${frRat(TABLE_2[1].y)}, puis à ${frRat(TABLE_2[2].y)}, puis à ${frRat(TABLE_2[3].y)}. Les sauts ne sont pas égaux, alors qu’une écriture de la forme « un nombre fois l’entrée, plus un nombre » donne toujours des sauts égaux. Tous les tableaux ne cachent donc pas une telle écriture, et le dire est mathématiquement correct.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'À toi de retrouver la règle',
      subtitle: 'Un tableau tout neuf, et cette fois sans liste de candidates.',
      done: q5,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums">
                <tbody>
                  <tr className="border-b border-slate-100">
                    <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      entrée
                    </th>
                    {TABLE_3.map((c) => (
                      <td key={`x${c.x}`} className="px-2 py-1.5 text-right font-mono font-bold text-slate-700">
                        {c.x}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className="py-1.5 pr-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      sortie
                    </th>
                    {TABLE_3.map((c) => (
                      <td key={`y${c.x}`} className="px-2 py-1.5 text-right font-mono font-black text-emerald-800">
                        {c.y}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-sm text-slate-700">
            Quand l’entrée augmente de 1, la sortie augmente toujours de la même quantité.
            Cette quantité, c’est le nombre devant l’entrée.
          </p>
          <NumericQuestion
            prompt="Que rend cette machine pour l’entrée 10 ?"
            expected={SORTIE_10}
            requires={['du-tableau-a-la-formule']}
            explain={`De 1 à 2, la sortie passe de ${TABLE_3[0].y} à ${TABLE_3[1].y} : +4 à chaque fois. L’écriture est donc « 4 fois l’entrée, plus quelque chose » — et pour retomber sur ${TABLE_3[0].y} quand l’entrée vaut 1, il faut ajouter 3. Pour 10 : 4 × 10 + 3 = ${SORTIE_10}. Contrôle sur un autre couple : 4 × ${TABLE_3[3].x} + 3 = ${TABLE_3[3].y}.`}
            explainFor={(n) => {
              if (n === 40) return 'Tu as trouvé le bon nombre devant l’entrée, mais tu as oublié ce qu’on ajoute ensuite. Vérifie sur le couple 1 → 7.';
              if (n === 70) return 'Tu as multiplié la sortie de 1 par 10. La machine ne fonctionne pas ainsi : elle applique la même règle à chaque entrée, elle ne met pas les sorties à l’échelle.';
              return null;
            }}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              Tu sais maintenant passer du tableau à l’écriture. Il reste un troisième visage à la
              même dépendance : le <strong>dessin</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le tableau muet"
      moduleSubtitle="Des couples, et aucune machine pour les expliquer"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'La machine est cachée',
        tone: 'indigo',
        body: (
          <>
            Jusqu’ici tu voyais la chaîne. Cette fois, on ne te donne que ses résultats. Sauras-tu
            retrouver la règle — et surtout, <strong>refuser celles qui ne marchent qu’à moitié ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            <ShieldQuestion className="inline h-4 w-4" aria-hidden="true" /> Essaie une écriture,
            lis le rapport, essaie la suivante. Le testeur ne dit jamais « faux » tout court : il{' '}
            <strong>nomme</strong> les couples qui te démentent.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
