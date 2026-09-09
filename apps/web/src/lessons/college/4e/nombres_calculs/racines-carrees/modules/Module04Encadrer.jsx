import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EncadrementLab from '../components/EncadrementLab';
import { encadrement, verifierEncadrement } from '../components/racines4e';

/**
 * Module 4 — MANIPULATION : encadrer une racine entre deux entiers.
 *
 * Activity              déplacer un entier d'essai jusqu'à ce que son carré
 *                       et le suivant encadrent le nombre cible.
 * Mathematical objective encadrer √n, c'est trouver les deux carrés parfaits
 *                       qui entourent n. On ne compare JAMAIS des racines
 *                       (qu'on ne sait pas calculer) mais des CARRÉS.
 * Expected observation  « je n'ai jamais eu besoin de calculer √50 pour
 *                       savoir qu'elle est entre 7 et 8 ».
 * Misconception targeted encadrer par des entiers non consécutifs (« entre 7
 *                       et 9 »), ce qui est vrai mais lâche ; et croire qu'un
 *                       nombre entre 49 et 64 a une racine décimale simple.
 *
 * Le module 3 était nécessaire avant celui-ci : sans la table des carrés
 * parfaits, la recherche des deux bornes serait un tâtonnement aveugle.
 */
export default function Module04Encadrer() {
  const [k, setK] = useState(5);
  const [trouve, setTrouve] = useState(false);
  const CIBLE = 50;

  const [k2, setK2] = useState(9);
  const [trouve2, setTrouve2] = useState(false);
  const CIBLE2 = 110;

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Coince √50',
      subtitle: '50 n’est pas un carré parfait. Trouve les deux entiers consécutifs entre lesquels sa racine se trouve.',
      done: trouve,
      content: (kit) => (
        <div className="space-y-3">
          <EncadrementLab
            n={CIBLE}
            k={k}
            onK={(v) => {
              setK(v);
              const e = encadrement(CIBLE);
              if (v === e.bas && !trouve) {
                setTrouve(true);
                kit.react(true);
              }
            }}
          />
          {trouve ? (
            <Feedback tone="ok">
              <MathText>{'$49 < 50 < 64$'}</MathText>, c’est-à-dire{' '}
              <MathText>{'$7^2 < 50 < 8^2$'}</MathText> — donc{' '}
              <strong><MathText>{'$7 < \\sqrt{50} < 8$'}</MathText></strong>.
              <br />
              Remarque ce que tu n’as <strong>pas</strong> eu à faire : calculer √50. Tu as comparé
              des <strong>carrés</strong>, que tu connais, au lieu de comparer des racines, que tu
              ne sais pas calculer.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cherche le carré parfait juste <strong>en dessous</strong> de 50. Les deux bornes
              doivent être des entiers qui se suivent.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un nombre plus grand',
      subtitle: 'Même méthode, avec 110. Les carrés parfaits sont plus espacés là-haut.',
      done: trouve2,
      content: (kit) => (
        <div className="space-y-3">
          <EncadrementLab
            n={CIBLE2}
            k={k2}
            onK={(v) => {
              setK2(v);
              const e = encadrement(CIBLE2);
              if (v === e.bas && !trouve2) {
                setTrouve2(true);
                kit.react(true);
              }
            }}
          />
          {trouve2 ? (
            <Feedback tone="ok">
              <MathText>{'$100 < 110 < 121$'}</MathText>, donc{' '}
              <strong><MathText>{'$10 < \\sqrt{110} < 11$'}</MathText></strong>. Ici l’intervalle
              entre les deux carrés parfaits est large (21 nombres) : c’est pourquoi tant de
              nombres n’ont pas de racine entière.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Quels sont les deux carrés parfaits qui entourent 110 ? Pense à la table.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Encadre seul',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="encadrer-une-racine"
            variant="new"
            lead={<>Tu viens de coincer deux racines sans jamais en calculer une seule. La méthode se résume en une phrase.</>}
          />
          <NumericQuestion
            prompt={
              <span>
                Entre quels entiers consécutifs se trouve <MathText>{'$\\sqrt{30}$'}</MathText> ?
                Donne le plus PETIT des deux.
              </span>
            }
            expected={5}
            requires={['encadrer-une-racine', 'carres-parfaits-4e']}
            explain="25 < 30 < 36, c’est-à-dire 5² < 30 < 6². Donc 5 < √30 < 6."
            explainFor={(n) => {
              const code = verifierEncadrement(30, n, n + 1);
              if (code === 'faux' && n * n > 30) {
                return `${n}² = ${n * n} dépasse déjà 30 : cherche plus bas. Le carré parfait juste sous 30 est 25.`;
              }
              if (code === 'faux') {
                return `${n}² = ${n * n} est trop loin sous 30 : le carré parfait juste en dessous de 30 est 25, donc la borne basse est 5.`;
              }
              return "Cherche les deux carrés parfaits qui entourent 30 : ce sont 25 (5²) et 36 (6²).";
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un encadrement inutilement large',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Sarah écrit <MathText>{'$7 < \\sqrt{50} < 9$'}</MathText>. Que peut-on en dire ?</span>}
            options={[
              'C’est faux : √50 n’est pas dans cet intervalle',
              'C’est vrai, mais ce n’est pas l’encadrement demandé : les deux entiers doivent se suivre',
              'C’est le meilleur encadrement possible',
              'C’est faux : on ne peut pas encadrer une racine',
            ]}
            correct={1}
            cols={1}
            requires={['encadrer-une-racine']}
            explain="√50 vaut environ 7,07 : elle est bien entre 7 et 9, donc l’affirmation est VRAIE. Mais on demande les deux entiers CONSÉCUTIFS — 7 et 8 — parce qu’ils situent le nombre bien plus précisément."
            explainWrong="Attention : ce n’est pas faux. C’est simplement trop lâche. Dire « entre 7 et 9 » ne ment pas, mais dire « entre 7 et 8 » apporte plus d’information — et c’est ce qu’on appelle encadrer."
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
      moduleTitle="Encadrer"
      moduleSubtitle="Situer une racine sans la calculer"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Et quand ça ne tombe pas juste ?',
        tone: 'indigo',
        body: (
          <p>
            La plupart des nombres ne sont pas des carrés parfaits : leur racine n’est pas un
            entier. On ne peut donc pas l’écrire exactement — mais on peut toujours dire{' '}
            <strong>entre quels entiers</strong> elle se trouve.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
