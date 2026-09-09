import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — FORMALISATION : traduire un énoncé en équation.
 *
 * Activity              construire l'équation phrase par phrase : nommer
 *                       l'inconnue, traduire chaque information, écrire
 *                       l'égalité — avant tout calcul.
 * Mathematical objective la difficulté d'un problème n'est pas la
 *                       résolution, c'est la TRADUCTION. Une équation juste
 *                       se résout mécaniquement ; une équation fausse se
 *                       résout tout aussi mécaniquement, et donne une
 *                       réponse fausse sans prévenir.
 * Expected observation  « si je ne dis pas ce que x représente, je ne sais
 *                       plus quoi répondre à la fin ».
 * Misconception targeted traduire « 3 de plus que x » par 3x ; et répondre
 *                       « x = 4 » à une question qui demandait un prix.
 *
 * L'étape 1 fait construire l'équation SANS la résoudre : la séparation des
 * deux tâches est le contenu du module.
 */
export default function Module05EcrireLEquation() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Nommer avant tout',
      subtitle: 'Le premier geste n’est pas un calcul : c’est une phrase.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-3 text-sm text-slate-700">
            « Marc a <strong>3 ans de plus</strong> que Léa. À eux deux, ils ont{' '}
            <strong>27 ans</strong>. Quel âge a Léa ? »
          </div>
          <KnowledgeBrick
            id="modeliser-par-une-equation"
            variant="new"
            lead={<>Avant d’écrire la moindre équation, il faut décider ce que la lettre va désigner — et le dire.</>}
          />
          <TapQuestion
            prompt="On pose « x = l’âge de Léa ». Comment s’écrit alors l’âge de Marc ?"
            options={[
              <MathText key="a">{'$3x$'}</MathText>,
              <MathText key="b">{'$x + 3$'}</MathText>,
              <MathText key="c">{'$x - 3$'}</MathText>,
              <MathText key="d">{'$27 - 3$'}</MathText>,
            ]}
            correct={1}
            cols={4}
            optionLabel={(i) => ['3x', 'x + 3', 'x − 3', '27 − 3'][i]}
            requires={['modeliser-par-une-equation']}
            explain="« 3 de plus que » veut dire qu’on AJOUTE 3 : l’âge de Marc est x + 3. (3x voudrait dire « trois fois l’âge de Léa », ce qui n’est pas dit.)"
            explainWrong="Attention au piège de langue : « 3 de plus » est une addition, « 3 fois plus » serait une multiplication. Ce ne sont pas les mêmes mots, ni les mêmes écritures."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écrire l’égalité',
      subtitle: 'Quelle information du texte devient le signe égal ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Avec x pour Léa et x + 3 pour Marc, quelle équation traduit « à eux deux, ils ont 27 ans » ?"
            options={[
              <MathText key="a">{'$x + (x + 3) = 27$'}</MathText>,
              <MathText key="b">{'$x \\times (x + 3) = 27$'}</MathText>,
              <MathText key="c">{'$x + 3 = 27$'}</MathText>,
              <MathText key="d">{'$x = 27 + 3$'}</MathText>,
            ]}
            correct={0}
            cols={2}
            optionLabel={(i) => ['x + (x + 3) = 27', 'x × (x + 3) = 27', 'x + 3 = 27', 'x = 27 + 3'][i]}
            requires={['modeliser-par-une-equation']}
            explain="« À eux deux » signifie qu’on ajoute les deux âges : x + (x + 3) = 27. En réduisant, cela donne 2x + 3 = 27 — une équation que tu sais résoudre."
            explainWrong="x + 3 = 27 ne parle que de Marc et oublie Léa. Il faut RÉUNIR les deux âges dans le membre de gauche : c’est ce que dit « à eux deux »."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Résoudre, puis répondre',
      subtitle: 'La solution de l’équation n’est pas toujours la réponse à la question.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-700">
            <div>x + (x + 3) = 27</div>
            <div className="text-slate-500">on réduit</div>
            <div>2x + 3 = 27</div>
            <div className="text-emerald-600">− 3 des deux côtés</div>
            <div>2x = 24</div>
            <div className="text-emerald-600">÷ 2 des deux côtés</div>
            <div className="font-bold text-amber-700">x = 12</div>
          </div>
          <NumericQuestion
            prompt="La question demandait l’âge de MARC. Quel est-il ?"
            expected={15}
            requires={['modeliser-par-une-equation']}
            explain="x = 12 est l’âge de LÉA — c’est ce qu’on avait décidé au départ. Marc a x + 3 = 15 ans. Vérification : 12 + 15 = 27 ✓ et Marc a bien 3 ans de plus."
            explainFor={(n) =>
              n === 12
                ? "12 est bien la solution de l’équation — mais c’est l’âge de LÉA, puisqu’on avait posé « x = l’âge de Léa ». La question portait sur Marc : x + 3 = 15."
                : "Reprends ce que x désignait : l’âge de Léa, soit 12 ans. Marc en a 3 de plus."
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un résultat qui n’a pas de sens',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="controler-le-sens"
            variant="new"
            lead={<>Une équation se résout toujours, même quand elle traduit mal le problème. D’où un dernier contrôle.</>}
          />
          <TapQuestion
            prompt="Pour un problème de partage de billes entre amis, un élève trouve x = 4,5. Que doit-il en penser ?"
            options={[
              'Que sa réponse est bonne : le calcul est juste',
              'Qu’il doit arrondir à 5 billes',
              'Qu’il a sans doute mal traduit l’énoncé : un nombre de billes est entier',
              'Que le problème n’a pas de solution',
            ]}
            correct={2}
            cols={1}
            requires={['controler-le-sens']}
            explain="Le calcul peut être parfaitement exact et la traduction fausse. Un nombre de billes ne peut pas valoir 4,5 : c’est l’ÉQUATION qu’il faut relire, pas le calcul. Arrondir cacherait l’erreur au lieu de la corriger."
            explainWrong="Un résultat correct au calcul près peut être absurde dans la situation. Deux contrôles à faire à la fin : la solution vérifie-t-elle l’équation, et a-t-elle un sens dans le problème ?"
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Écrire l’équation"
      moduleSubtitle="Traduire avant de résoudre"
      estimatedTime="12 min"
      brief={{
        tag: 'Formalisation',
        title: 'Le plus dur n’est pas de résoudre',
        tone: 'indigo',
        body: (
          <p>
            Tu sais résoudre <MathText>{'$ax + b = c$'}</MathText>. Dans un problème, personne ne te
            donnera cette équation : il faudra l’<strong>écrire toi-même</strong> à partir d’un
            texte. C’est là que tout se joue.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
