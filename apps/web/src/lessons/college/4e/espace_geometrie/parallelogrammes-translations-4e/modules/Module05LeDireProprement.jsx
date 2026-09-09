import React, { useState } from 'react';
import { PenLine } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — MANIPULATION : la phrase qui justifie.
 *
 * Activity              assembler une justification en choisissant ses trois
 *                       morceaux, puis repérer ce qui manque dans des
 *                       justifications incomplètes.
 * Mathematical objective justifier qu'un quadrilatère est un parallélogramme
 *                       PAR le glissement (P3) — c'est-à-dire nommer le
 *                       glissement, les deux points, et la propriété.
 * Student action        choisir chaque morceau, puis juger des phrases
 *                       toutes faites.
 * Controlled variable   le morceau choisi à chaque emplacement.
 * Mathematical state    les trois choix ; la phrase se recompose en direct.
 * Expected observation  « une figure juste ne suffit pas — il faut dire
 *                       pourquoi ».
 * Misconception targeted « ça se voit sur la figure » comme justification, et
 *                       la conclusion posée sans la propriété qui la porte.
 *
 * POURQUOI DES MORCEAUX À CHOISIR PLUTÔT QU'UN TEXTE À TAPER. La difficulté
 * visée n'est pas la rédaction : c'est de savoir CE QUI DOIT Y FIGURER. En
 * faisant choisir chaque morceau, on met en évidence les trois rôles — et
 * chaque distracteur est une justification réellement rencontrée dans les
 * copies (« ça se voit », « les côtés sont égaux », une conclusion nue).
 */

/* Les trois emplacements de la phrase, et les propositions pour chacun.
   Chaque distracteur encode une erreur réelle. */
const MORCEAUX = [
  {
    id: 'quoi',
    titre: '① Ce que je sais',
    bon: 'Le glissement qui mène A en D mène aussi B en C.',
    options: [
      'Le glissement qui mène A en D mène aussi B en C.',
      'ABCD ressemble à un parallélogramme.',
      'Les points A, B, C et D sont bien placés.',
    ],
    explain:
      'La justification part de ce que l’énoncé DONNE : un glissement, et les deux points qu’il déplace. « Ça ressemble à » n’est pas une donnée.',
  },
  {
    id: 'donc',
    titre: '② Ce que j’en tire',
    bon: 'Donc [AD] et [BC] sont parallèles et de même longueur.',
    options: [
      'Donc [AD] et [BC] sont parallèles et de même longueur.',
      'Donc [AD] et [BC] ont la même longueur.',
      'Donc les quatre côtés ont la même longueur.',
    ],
    explain:
      'Il faut les DEUX propriétés : parallèles ET de même longueur. La longueur seule ne suffit pas — un cerf-volant l’a aussi.',
  },
  {
    id: 'conclusion',
    titre: '③ Ce que je conclus',
    bon: 'Donc ABCD est un parallélogramme.',
    options: [
      'Donc ABCD est un parallélogramme.',
      'Donc ABCD est un losange.',
      'Donc ABCD a ses diagonales de même longueur.',
    ],
    explain:
      'Deux côtés opposés parallèles et de même longueur donnent un parallélogramme — rien de plus. Rien ne dit que les quatre côtés sont égaux (losange), ni que les diagonales le sont (rectangle).',
  },
];

/* Trois justifications d'élèves, chacune amputée d'un rôle différent. */
const COPIES = [
  {
    id: 'copie-vu',
    texte: '« ABCD est un parallélogramme parce que ça se voit sur la figure. »',
    options: [
      'Rien n’est justifié : un dessin ne prouve pas',
      'C’est juste : la figure est correcte',
      'Il manque seulement la longueur des côtés',
      'Il faudrait mesurer les angles',
    ],
    correct: 0,
    explain:
      'Un dessin peut être faux, et même juste il ne démontre rien. Une justification s’appuie sur une donnée et une propriété, jamais sur l’apparence.',
  },
  {
    id: 'copie-nue',
    texte: '« Le glissement mène A en D et B en C. Donc ABCD est un parallélogramme. »',
    options: [
      'Il manque la propriété qui relie les deux',
      'C’est complet : la donnée et la conclusion suffisent',
      'Il manque la mesure du glissement',
      'La conclusion est fausse',
    ],
    correct: 0,
    explain:
      'La conclusion est vraie, mais elle tombe du ciel : il manque la ligne du milieu, celle qui dit que les deux trajets rendent [AD] et [BC] parallèles et de même longueur.',
  },
  {
    id: 'copie-longueur',
    texte: '« [AD] et [BC] ont la même longueur, donc ABCD est un parallélogramme. »',
    options: [
      'Il manque le parallélisme',
      'C’est complet',
      'Il manque le nom du glissement seulement',
      'Il faudrait aussi que AB = DC',
    ],
    correct: 0,
    explain:
      'Deux côtés opposés de même longueur ne suffisent pas. Il faut qu’ils soient AUSSI parallèles — et c’est justement ce que le glissement garantit d’un coup.',
  },
];

export default function Module05LeDireProprement() {
  const [choix, setChoix] = useState({});
  const [copiesVues, setCopiesVues] = useState([]);
  const [q3, setQ3] = useState(false);

  const complet = MORCEAUX.every((m) => choix[m.id] === m.bon);
  const done2 = copiesVues.length === COPIES.length;

  const steps = [
    {
      num: 1,
      title: 'Assemble la justification',
      subtitle: 'Trois emplacements, trois choix. Un seul jeu donne une justification qui tient.',
      done: complet,
      content: (
        <div className="space-y-3">
          {MORCEAUX.map((m) => {
            const pris = choix[m.id];
            const juste = pris === m.bon;
            return (
              <div key={m.id} data-morceau={m.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3">
                <div className="text-xs font-black uppercase tracking-wide text-slate-500">{m.titre}</div>
                <div className="mt-2 space-y-1.5">
                  {m.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setChoix((c) => ({ ...c, [m.id]: o }))}
                      className={`min-h-[44px] w-full rounded-xl border-2 px-3 py-2 text-left text-sm transition-colors ${
                        pris === o
                          ? (o === m.bon
                            ? 'border-emerald-400 bg-emerald-50 font-semibold text-emerald-900'
                            : 'border-rose-300 bg-rose-50 text-rose-900')
                          : 'border-slate-200 bg-white text-slate-700 hover:border-purple-400'
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                {pris && !juste && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">
                    {m.explain}
                  </p>
                )}
              </div>
            );
          })}
          {complet && (
            <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-3.5">
              <p className="text-sm italic text-purple-900">
                « {MORCEAUX.map((m) => m.bon).join(' ')} »
              </p>
            </div>
          )}
          {complet && (
            <Feedback tone="ok">
              Trois morceaux, trois rôles. Aucun n’est décoratif : retire-en un, et la
              justification ne tient plus.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois copies à corriger',
      subtitle: 'Chacune a l’air convaincante. Chacune a un trou.',
      done: done2,
      content: (
        <div className="space-y-3">
          {COPIES.map((c) => (
            <div key={c.id} className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
              <p className="text-sm italic text-slate-700">{c.texte}</p>
              <div className="mt-2">
                <TapQuestion
                  prompt="Qu’est-ce qui manque ?"
                  options={c.options}
                  correct={c.correct}
                  cols={1}
                  requires={['deux-trajets-un-glissement', 'caracterisations']}
                  explain={c.explain}
                  solved={copiesVues.includes(c.id)}
                  onAnswered={() => setCopiesVues((v) => (v.includes(c.id) ? v : [...v, c.id]))}
                />
              </div>
            </div>
          ))}
          {done2 && (
            <Feedback tone="ok">
              Trois trous différents : l’apparence prise pour une preuve, la propriété absente,
              et une condition sur deux. Ce sont les trois erreurs qu’on retrouve partout.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qu’une justification doit contenir',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pour justifier qu’un quadrilatère est un parallélogramme par un glissement, que faut-il dire ?"
            options={[
              'Quel glissement, quels deux points il déplace, et quelle propriété conclut',
              'Seulement que c’est un glissement',
              'Seulement le résultat : c’est un parallélogramme',
              'Qu’on l’a vérifié sur la figure',
            ]}
            correct={0}
            cols={1}
            requires={['deux-trajets-un-glissement', 'ordre-des-sommets']}
            explain="Les trois morceaux ensemble : sans le glissement nommé on ne sait pas de quoi on parle ; sans les deux points, quels côtés deviennent parallèles ; sans la propriété, on affirme sans prouver."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="justifier-par-le-glissement"
              variant="new"
              lead="Voilà la phrase, et les trois raisons pour lesquelles chacun de ses morceaux compte."
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
      moduleTitle="Le dire proprement"
      moduleSubtitle="Une figure juste ne suffit pas"
      estimatedTime="7 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'La phrase qui prouve',
        tone: 'indigo',
        body: (
          <>
            Tu sais construire, et tu sais pourquoi ça marche. Reste le plus difficile :{' '}
            <strong>l’écrire de façon que ce soit une preuve</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Trois emplacements à remplir. Chaque mauvais choix est une phrase qu’on lit vraiment
            dans les copies — et le message t’expliquera pourquoi elle ne tient pas.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
