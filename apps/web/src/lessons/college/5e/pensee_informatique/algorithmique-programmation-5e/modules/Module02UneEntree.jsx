import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceLab from '../components/TraceLab';
import { avancer, tourner, lit, executer } from '../components/trace';

/**
 * Module 2 — DÉCOUVERTE : la variable, et l'entrée du programme.
 *
 * Le module 1 s'est terminé sur un manque : pour changer la taille du carré,
 * il faut corriger le nombre à quatre endroits. Ce module ne définit pas
 * « variable » en ouverture — il fait VIVRE le manque une dernière fois
 * (étape 1 : quatre corrections à la main), puis donne l'outil qui le supprime
 * (étape 2 : un seul curseur, quatre instructions qui le lisent).
 *
 * ACTION → CHANGE → OBSERVATION → SENS :
 *   ACTION       glisser le curseur `cote` ;
 *   CHANGE       les quatre instructions AVANCER affichent la nouvelle valeur
 *                EN MÊME TEMPS, et le carré change de taille ;
 *   OBSERVATION  le texte du programme, lui, n'a pas bougé d'un caractère ;
 *   SENS         le programme ne contient pas la valeur : il contient le NOM
 *                d'un endroit où aller la chercher.
 *
 * Expected observation : « le programme est resté le même mot pour mot, et
 * pourtant il trace maintenant un autre carré ».
 * Misconception targeted : croire que la variable est « une case où le nombre
 * est caché », donc un simple synonyme du nombre — alors qu'elle est un lien :
 * une seule valeur, lue à plusieurs endroits, à chaque exécution.
 *
 * PÉRIMÈTRE 5e : la variable est LUE, jamais écrite en cours de programme.
 * Aucune affectation répétée, aucun compteur — c'est la matière de la 4e.
 */

/* Le programme du module 1, avec son 50 écrit quatre fois. */
const EN_DUR = [
  avancer(50), tourner(90), avancer(50), tourner(90),
  avancer(50), tourner(90), avancer(50),
];

/* Le même programme, où les quatre longueurs LISENT la variable `cote`. */
const AVEC_VARIABLE = [
  avancer(lit('cote')), tourner(90), avancer(lit('cote')), tourner(90),
  avancer(lit('cote')), tourner(90), avancer(lit('cote')),
];

export default function Module02UneEntree() {
  const [q1, setQ1] = useState(false);
  const [cote, setCote] = useState(50);
  const [essais, setEssais] = useState(() => new Set());
  // Trois tailles différentes essayées : la famille de figures se constate,
  // elle ne se raconte pas.
  const vuFamille = essais.size >= 3;
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const majCote = (_, v) => {
    setCote(v);
    setEssais((s) => new Set(s).add(v));
  };

  const steps = [
    {
      num: 1,
      title: 'Quatre fois le même nombre',
      subtitle: 'Le programme du carré, tel que tu l’as laissé au module précédent.',
      done: q1,
      content: (
        <div className="space-y-3">
          <TraceLab
            programme={EN_DUR}
            hauteur={230}
            titreProgramme="Le carré de 50, écrit en dur"
            autoExecuter
            bilan={() => null}
          />
          <TapQuestion
            prompt="Pour transformer ce programme en carré de côté 80, combien de nombres faut-il corriger ?"
            options={['4', '1', '2', '7']}
            correct={0}
            cols={4}
            requires={['instruction-parametree']}
            explain="Le 50 apparaît dans les quatre instructions AVANCER : il faut donc le corriger quatre fois. Les 90° des virages, eux, ne changent pas — un carré reste un carré."
            explainWrong="Compte les instructions AVANCER dans le programme : il y en a quatre, et chacune porte son propre 50. Aucune ne « suit » les autres : ce sont quatre nombres indépendants."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="info">
              Quatre corrections, et le risque d’en oublier une. Imagine un dessin de trente traits.
              Il faudrait pouvoir écrire la taille <strong>une seule fois</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une seule valeur, quatre lectures',
      subtitle: 'Le nombre sort du programme. À sa place : un nom.',
      done: vuFamille,
      content: (kit) => (
        <div className="space-y-3">
          <TraceLab
            programme={AVEC_VARIABLE}
            env={{ cote }}
            entrees={[{ nom: 'cote', label: 'longueur du côté', min: 20, max: 110, pas: 5 }]}
            onEnv={(n, v) => { majCote(n, v); if (essais.size === 2) kit.react(true); }}
            autoExecuter
            hauteur={230}
            titreProgramme="Le même programme, avec une entrée"
            bilan={() => null}
          />
          {vuFamille ? (
            <>
              <Feedback tone="ok">
                Le texte du programme n’a pas changé d’un seul caractère — et pourtant il vient de
                tracer {essais.size} carrés différents. Les quatre instructions{' '}
                <strong className="font-mono">AVANCER de cote</strong> vont toutes lire{' '}
                <strong>la même valeur</strong>, à l’endroit où tu l’as posée.
              </Feedback>
              <KnowledgeBrick
                id="variable-informatique"
                variant="new"
                lead={<>Ce nom que les quatre instructions vont consulter porte un nom, justement.</>}
              />
              <KnowledgeBrick
                id="entree-programme"
                variant="new"
                lead={<>Et la valeur que tu règles avant de lancer le programme porte, elle aussi, un nom.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Fais glisser <strong className="font-mono">cote</strong> et regarde les quatre
              instructions AVANCER en même temps que la figure. Essaie{' '}
              <strong>au moins trois tailles</strong> différentes.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que la variable change vraiment',
      subtitle: 'Trois affirmations. Une seule décrit ce que tu viens de voir.',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque affirmation, dis si elle est vraie ou fausse.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'Quand je change cote, le texte du programme change aussi.',
                options: ['Vrai', 'Faux'],
                correct: 1,
                correction:
                  'Faux : le programme reste écrit exactement pareil. C’est la valeur rangée dans cote qui change, pas le programme.',
              },
              {
                id: 'r2',
                label: 'Les quatre instructions AVANCER lisent la même valeur.',
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction:
                  'Vrai : elles portent toutes le nom cote, et vont donc toutes chercher au même endroit. C’est ce qui garantit que les quatre côtés restent égaux.',
              },
              {
                id: 'r3',
                label: 'Avec ce programme, je peux tracer un carré de n’importe quelle taille.',
                options: ['Vrai', 'Faux'],
                correct: 0,
                correction:
                  'Vrai : un seul programme suffit pour toute la famille des carrés. C’est ce qui le rend réutilisable.',
              },
            ]}
            requires={['variable-informatique', 'entree-programme']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Exactement. Un programme avec une entrée ne trace pas UNE figure : il trace toute
                  une <strong>famille</strong> de figures. C’est le même programme qui te donne le
                  carré de 20 et celui de 110.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Reviens au laboratoire de l’étape 2 : fais glisser le
                  curseur en gardant les yeux sur le <strong>texte</strong> du programme. C’est lui
                  qui ne bouge pas — et c’est toute la question.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Lire la valeur au bon moment',
      subtitle: 'Une entrée, une sortie.',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            On pose <strong className="font-mono">cote = 35</strong>, puis on lance le programme{' '}
            <strong className="font-mono">AVANCER de cote · TOURNER de 90° · AVANCER de cote</strong>.
          </div>
          <TapQuestion
            prompt="Quelle est la longueur totale tracée par KIWI ?"
            options={['70', '35', '105', '90']}
            correct={0}
            cols={4}
            requires={['variable-informatique', 'entree-programme']}
            explain="Les deux instructions AVANCER lisent chacune cote, qui vaut 35 : 35 + 35 = 70. Le TOURNER, lui, ne trace rien — il oriente le stylo."
            explainWrong="Chaque AVANCER lit la valeur de cote, c’est-à-dire 35 — et il y a deux AVANCER. Le virage ne laisse aucun trait : tourner sur place n’allonge pas le trajet."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Une entrée (<span className="font-mono">cote = 35</span>), un programme inchangé, une
              sortie (deux traits de 35). Et si l’on voulait que le second trait soit{' '}
              <strong>deux fois plus long</strong> que le premier, sans ajouter une seconde entrée ?
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
      moduleTitle="Une entrée pour le programme"
      moduleSubtitle="Sortir la valeur du programme pour n’avoir plus qu’un endroit à changer"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Un programme, tous les carrés',
        tone: 'indigo',
        body: (
          <p>
            Tu as laissé KIWI avec un problème : pour changer la taille de la figure, il faut
            corriger le même nombre à quatre endroits. Les programmeurs ont résolu cela il y a
            longtemps — en sortant la valeur du programme.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
