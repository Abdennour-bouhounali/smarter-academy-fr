import React, { useState } from 'react';
import { Scale } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConjectureLab from '../components/ConjectureLab';
import {
  CONJECTURES, chercherContreExemple, etapesPreuveConsecutifs, sommeTroisConsecutifs,
} from '../components/raisonnement4e';

/**
 * Module 5 — MANIPULATION : la dissymétrie entre prouver et réfuter.
 *
 * Activity              éprouver TROIS affirmations sur ses propres nombres :
 *                       une qui résiste à tout, une qui tombe au premier essai
 *                       pair, une qui ne tombe que sur deux valeurs.
 * Mathematical objective aucun nombre d'essais réussis ne prouve ; un seul
 *                       essai raté réfute, définitivement.
 * Student action        choisir ses entiers et lancer le test ; puis mener la
 *                       preuve littérale de l'affirmation qui résiste.
 * Controlled variable   la liste des valeurs testées, par conjecture.
 * Mathematical state    les trois conjectures viennent de `CONJECTURES` ; les
 *                       verdicts sont ceux de `tester()`, jamais rédigés ici.
 * Visual consequence    sur la vraie, le compteur monte et le verdict ne
 *                       change pas ; sur les fausses, un seul ✗ bascule tout.
 * Expected observation  « il m'a fallu vingt essais pour ne rien prouver, et
 *                       un seul pour tout casser ».
 * Misconception targeted la symétrie fausse — croire qu'il faut plusieurs
 *                       contre-exemples pour réfuter, et que beaucoup
 *                       d'exemples finissent par prouver.
 *
 * Le TRANSFERT est dans la troisième conjecture : « le carré d'un nombre est
 * toujours plus grand que ce nombre » est fausse, mais ses seuls
 * contre-exemples sont 0 et 1. Un élève qui n'essaie que des « nombres pour de
 * vrai » ne la mettra jamais en défaut — la leçon est là.
 */
const VRAIE = CONJECTURES.sommeMultipleDe3;
const FAUSSE = CONJECTURES.sommeToujoursPaire;
const PIEGE = CONJECTURES.carrePlusGrand;

/** Les contre-exemples sont CHERCHÉS, jamais recopiés. */
const CE_FAUSSE = chercherContreExemple(FAUSSE, 1, 50);
const CE_PIEGE = chercherContreExemple(PIEGE, 0, 50);

const N_PREUVE = 7;
const PREUVE = etapesPreuveConsecutifs(N_PREUVE);

export default function Module05ContreExemple() {
  const [vraies, setVraies] = useState([]);
  const [fausses, setFausses] = useState([]);
  const [pieges, setPieges] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = vraies.length >= 5;
  const done2 = fausses.some((n) => !FAUSSE.predicat(n));

  const steps = [
    {
      num: 1,
      title: 'Une affirmation qui résiste',
      subtitle: 'Prends cinq entiers, les plus variés possible. Essaie de la mettre en défaut.',
      done: done1,
      content: (
        <div className="space-y-3">
          <ConjectureLab
            conj={VRAIE}
            valeurs={vraies}
            onTester={(n) => setVraies((v) => [...v, n])}
            onVider={() => setVraies([])}
            suggestions={[1, 8, 25, 100]}
            label="Banc d’essai — la somme de trois consécutifs"
          />
          {vraies.length > 0 && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Le détail du dernier essai
              </p>
              {(() => {
                const n = vraies[vraies.length - 1];
                const s = sommeTroisConsecutifs(n);
                return (
                  <p className="mt-1 font-mono tabular-nums text-slate-800">
                    {n} + {n + 1} + {n + 2} = {s} = 3 × {s / 3}
                  </p>
                );
              })()}
            </div>
          )}
          {done1 && (
            <Feedback tone="info">
              {vraies.length} essais, aucun raté — et le verdict n’a pas bougé d’un mot. C’est
              exactement ce qui doit se passer : le tableau ne peut pas conclure.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une affirmation qui tombe',
      subtitle: 'Même objet, autre affirmation. Combien d’essais te faudra-t-il ?',
      done: done2,
      content: (
        <div className="space-y-3">
          <ConjectureLab
            conj={FAUSSE}
            valeurs={fausses}
            onTester={(n) => setFausses((v) => [...v, n])}
            onVider={() => setFausses([])}
            suggestions={[1, 3, 5, 6]}
            label="Banc d’essai — la somme est-elle toujours paire ?"
          />
          {!done2 && fausses.length > 0 && (
            <Feedback tone="info">
              Toujours pas de faille. Essaie un entier <strong>pair</strong> — par exemple{' '}
              {CE_FAUSSE}.
            </Feedback>
          )}
          {done2 && (
            <Feedback tone="ok">
              Un seul essai raté, et c’est terminé : l’affirmation est fausse, sans appel. Il n’en
              faut pas un deuxième.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Pourquoi les deux gestes ne se ressemblent pas',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Combien de contre-exemples faut-il pour affirmer qu’une conjecture est fausse ?"
            options={[
              'Un seul suffit',
              'Au moins trois, pour être sûr',
              'Autant que d’essais réussis',
              'On ne peut jamais l’affirmer'
            ]}
            correct={0}
            cols={2}
            requires={['essais-ne-prouvent-pas']}
            explain="« Toujours » exige tous les cas ; « pas toujours » n’en exige qu’un. C’est pour cela que réfuter est facile et que prouver est difficile — les deux ne se ressemblent pas du tout."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="contre-exemple"
              variant="new"
              lead="Le nombre qui a fait basculer le verdict porte un nom."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le piège du contre-exemple qui se cache',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Une troisième affirmation, sur un autre objet. Attention : elle est fausse, mais ses
            contre-exemples sont très peu nombreux. Cherche bien.
          </p>
          <ConjectureLab
            conj={PIEGE}
            valeurs={pieges}
            onTester={(n) => setPieges((v) => [...v, n])}
            onVider={() => setPieges([])}
            suggestions={[2, 5, 10, 0]}
            label="Banc d’essai — le carré est-il toujours plus grand ?"
          />
          <TapQuestion
            prompt="Quel entier met cette affirmation en défaut ?"
            options={[`${CE_PIEGE}`, '7', '100', 'Aucun : elle est vraie']}
            correct={0}
            cols={4}
            requires={['contre-exemple']}
            explain={`${CE_PIEGE} × ${CE_PIEGE} = ${CE_PIEGE * CE_PIEGE}, qui n’est pas plus grand que ${CE_PIEGE}. Il existe un second contre-exemple, tout aussi discret. Chercher un contre-exemple, c’est explorer les cas qu’on n’essaie jamais spontanément : 0, 1, les négatifs.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'Et maintenant, prouve celle qui résiste',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Retour à la première affirmation. Tes essais ne l’ont pas prouvée — la lettre, elle,
            va le faire. On appelle <span className="font-mono font-bold">n</span> le plus petit
            des trois entiers.
          </p>
          <div className="overflow-x-auto rounded-2xl border-2 border-purple-200 bg-white p-3">
            <table className="w-full min-w-[280px] text-sm">
              <tbody>
                {PREUVE.map((e, i) => (
                  <tr key={e.forme} className="border-t border-slate-100 first:border-t-0">
                    <td className="py-1.5 pr-3 text-slate-500">
                      {['les trois entiers', 'on réduit', 'on factorise'][i]}
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-800">
                      {i === 0 ? 'n + (n+1) + (n+2)' : e.texte}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <NumericQuestion
            prompt={`Par quel nombre la somme ${PREUVE[2].texte} est-elle forcément divisible, quel que soit n ?`}
            expected={3}
            parse={parseDec}
            requires={['factoriser', 'preuve-par-la-lettre', 'contre-exemple']}
            explain={`La forme factorisée est 3 × (n + 1) : c’est un produit dont l’un des facteurs est 3, donc un multiple de 3 — pour TOUT entier n. Aucun essai n’était nécessaire, et aucun contre-exemple ne peut exister.`}
            explainFor={(n) => {
              if (n === 2) return 'La somme n’est pas toujours paire — tu l’as réfuté toi-même à l’étape 2.';
              if (n === N_PREUVE + 1) return `${N_PREUVE + 1} est le nombre du milieu POUR CE CAS-LÀ. La forme 3 × (n + 1) montre que le facteur constant, celui qui vaut pour tous les n, est 3.`;
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="mem-prouver-refuter"
              variant="new"
              lead="Deux affirmations sur le même objet, deux issues opposées — et deux gestes à ne jamais confondre."
            />
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le contre-exemple"
      moduleSubtitle="Réfuter est facile, prouver ne l’est pas"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Trois affirmations',
        tone: 'indigo',
        body: (
          <>
            Trois phrases qui ont l’air vraies. Deux ne le sont pas.{' '}
            <strong>À toi de trouver lesquelles, et comment.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <Scale className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Compte tes essais à chaque fois. Le nombre qu’il t’a fallu pour réfuter, et celui qu’il
            t’aurait fallu pour prouver, ne se ressemblent pas.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
