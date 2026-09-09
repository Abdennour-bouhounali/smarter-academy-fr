import React, { useState } from 'react';
import { PenLine, Equal } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FormuleLab from '../components/FormuleLab';
import {
  programme, trace, formuleTex, memeFormule, frRat, programmeTexte,
} from '../components/fonctions4e';

/**
 * Module 3 — MANIPULATION : la machine, dite en une ligne.
 *
 * Activity              assembler l'écriture terme à terme — le nombre devant
 *                       l'entrée, puis celui qu'on ajoute — et la confronter
 *                       à la chaîne sur TOUTES les entrées d'un coup.
 * Mathematical objective une formule n'est pas une écriture de plus : c'est
 *                       la chaîne entière, dite une fois pour toutes. Elle
 *                       doit s'accorder avec la machine pour toute entrée.
 * Student action        régler les deux nombres de l'écriture.
 * Controlled variable   a et b. La chaîne est fixe.
 * Mathematical state    (prog, a, b). L'accord, et surtout les entrées qui
 *                       DÉMENTENT, sont calculés par `testerFormule`.
 * Visual consequence    la barre d'accord se remplit ; les entrées qui
 *                       démentent sont nommées, avec les deux valeurs.
 * Expected observation  « ça marche pour 0 mais pas pour 2 : ce n'est donc
 *                       pas la bonne écriture ».
 * Misconception targeted valider une écriture sur une seule entrée ; croire
 *                       que « ajouter 2 puis multiplier par 3 » s'écrit
 *                       3x + 2 (l'ordre !) ; croire que deux chaînes
 *                       différentes ne peuvent pas avoir la même formule.
 * Formalization         la brique `formule-qui-resume` arrive quand l'accord
 *                       est total ; `deux-chaines-une-formule` à l'étape 4,
 *                       une fois le contre-exemple manipulé.
 *
 * PÉRIMÈTRE : on écrit « 3x + 2 » — du calcul littéral de 4e, une EXPRESSION.
 * On ne la nomme pas, on ne l'évalue pas sous une notation fonctionnelle :
 * c'est la 3e.
 */

/** La chaîne à résumer : « ×5 puis +3 ». */
const CHAINE = programme(['×', 5], ['+', 3]);
/** La même chaîne dans l'autre ordre — le piège de l'étape 3. */
const CHAINE_INVERSEE = programme(['+', 3], ['×', 5]);
/** Deux chaînes différentes, une seule formule — l'étape 4. */
const DOUBLE_TRIPLE = programme(['×', 2], ['×', 3]);
const SIX = programme(['×', 6]);

const sansEspaces = (tex) => tex.replace(/\\,\s*/g, '');

export default function Module03DireLaMachine() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  // L'étape 1 est validée quand l'écriture assemblée est la bonne — c'est-à-
  // dire quand elle s'accorde avec la chaîne partout, pas quand deux boutons
  // ont été cliqués.
  const done1 = a === 5 && b === 3;

  const steps = [
    {
      num: 1,
      title: 'Assemble l’écriture',
      subtitle: 'Deux nombres à régler, et une épreuve qui porte sur toutes les entrées à la fois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La chaîne fait {programmeTexte(CHAINE)}. On veut la dire <strong>en une ligne</strong>,
            en écrivant ce qu’elle fait à un nombre quelconque — appelons-le{' '}
            <MathText>{'$x$'}</MathText>.
          </p>
          <FormuleLab
            prog={CHAINE}
            a={a}
            b={b}
            onA={(v) => { setA(v); if (v === 5 && b === 3) kit.react?.(true); }}
            onB={(v) => { setB(v); if (a === 5 && v === 3) kit.react?.(true); }}
          />
          {done1 && (
            <Feedback tone="ok">
              Accord partout. <MathText>{`$${sansEspaces(formuleTex(CHAINE))}$`}</MathText> dit la
              même chose que la chaîne — pour n’importe quel nombre, y compris ceux qu’on n’a pas
              essayés.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi il faut tout vérifier',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Une écriture candidate donne le bon résultat pour l’entrée 1, mais pas pour l’entrée 5. Que peut-on en conclure ?"
            options={[
              'Elle est fausse : une formule doit convenir à TOUTES les entrées',
              'Elle est à moitié vraie',
              'Elle est vraie pour les petits nombres',
              'Il faut essayer une entrée de plus pour décider',
            ]}
            correct={0}
            cols={1}
            requires={['meme-chaine-toutes-entrees']}
            explain="Une formule prétend dire la machine en entier. Une seule entrée qui la dément suffit à la réfuter — c’est ce que la barre d’accord montrait quand elle refusait de se remplir."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="formule-qui-resume"
              variant="new"
              lead="Ce que tu viens d’assembler a un statut particulier."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'L’ordre, encore lui',
      subtitle: 'Une chaîne où les deux étapes sont échangées.',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Voici l’autre chaîne : {programmeTexte(CHAINE_INVERSEE)}. Elle emploie les mêmes
            nombres, dans l’autre ordre.
          </p>
          <TapQuestion
            prompt={`Comment s’écrit « ${programmeTexte(CHAINE_INVERSEE)} » ?`}
            options={[
              sansEspaces(formuleTex(CHAINE_INVERSEE)),
              sansEspaces(formuleTex(CHAINE)),
              '5x + 15',
              'x + 15',
            ]}
            correct={0}
            cols={4}
            requires={['formule-qui-resume']}
            explain={`On ajoute 3 d’abord, donc c’est le résultat de « x + 3 » qu’on multiplie par 5 : le 3 est multiplié lui aussi, et donne 15. Contrôle sur 2 : cette chaîne rend ${frRat(trace(CHAINE_INVERSEE, 2).arrivee)}, tandis que ${programmeTexte(CHAINE)} rend ${frRat(trace(CHAINE, 2).arrivee)}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Deux machines, une écriture',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            {[DOUBLE_TRIPLE, SIX].map((prog, i) => (
              <div key={i} className="rounded-xl border-2 border-slate-200 bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">machine {i + 1}</p>
                <p className="font-mono text-sm font-bold text-slate-700">{programmeTexte(prog)}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  3 → {frRat(trace(prog, 3).arrivee)} · 7 → {frRat(trace(prog, 7).arrivee)}
                </p>
              </div>
            ))}
          </div>
          <TapQuestion
            prompt="Ces deux machines sont construites différemment. Que peut-on dire de ce qu’elles font ?"
            options={[
              'Elles font exactement la même chose : leur formule est la même',
              'Elles ne coïncident que sur les nombres essayés',
              'La première donne toujours plus que la seconde',
              'On ne peut pas comparer deux machines sans tableau complet',
            ]}
            correct={0}
            cols={1}
            requires={['formule-qui-resume']}
            explain={`Les deux se résument par ${sansEspaces(formuleTex(SIX))}. Comparer deux tableaux ne décide que des entrées essayées ; comparer deux formules décide pour toutes les entrées d’un coup.`}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="deux-chaines-une-formule"
              variant="new"
              lead="Ce constat mérite d’être retenu : c’est ce qui fait de la formule un outil de décision."
            />
          )}
          {q4 && memeFormule(DOUBLE_TRIPLE, SIX) && (
            <Feedback tone="ok">
              Vérifié : les deux écritures sont identiques, donc les deux machines aussi — pour
              tout nombre, sans exception.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'Servir de la formule',
      subtitle: 'Une écriture bien faite répond sans qu’on redescende la chaîne.',
      done: q5,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La chaîne {programmeTexte(CHAINE)} se résume par{' '}
            <MathText>{`$${sansEspaces(formuleTex(CHAINE))}$`}</MathText>. Que rend-elle pour 12 ?
          </p>
          <NumericQuestion
            prompt="La sortie pour 12"
            expected={63}
            requires={['formule-qui-resume']}
            explain={`On remplace la lettre par 12 : 5 × 12 = 60, puis 60 + 3 = ${frRat(trace(CHAINE, 12).arrivee)}. La formule fait le même travail que la chaîne, en une ligne.`}
            explainFor={(n) => {
              if (n === 75) return 'Tu as ajouté 3 d’abord (12 + 3 = 15), puis multiplié par 5. L’écriture 5x + 3 dit de multiplier d’abord.';
              if (n === 60) return 'Tu t’es arrêté au « 5 × 12 ». Il reste le « + 3 ».';
              return null;
            }}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              Une question reste ouverte : et si on ne te donnait <strong>que</strong> le tableau,
              sans la chaîne ? Saurais-tu retrouver l’écriture ? C’est la suite.
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
      moduleTitle="Dire la machine en une ligne"
      moduleSubtitle="Une écriture qui tient toute la chaîne"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 03',
        title: 'Toute la chaîne, sur une ligne',
        tone: 'indigo',
        body: (
          <>
            Raconter les étapes une par une, c’est long. Il existe une écriture qui les tient{' '}
            <strong>toutes</strong>, et qui vaut pour n’importe quel nombre d’entrée. À toi de
            l’assembler.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-3.5">
          <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" aria-hidden="true" />
          <p className="text-sm text-sky-900">
            <Equal className="inline h-4 w-4" aria-hidden="true" /> Règle les deux nombres, puis
            regarde la barre : elle ne se remplit que si ton écriture s’accorde avec la chaîne{' '}
            <strong>partout</strong>.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
