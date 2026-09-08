import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RectangleLab from '../components/RectangleLab';
import { divise, diviseurs, sommeChiffres } from '../components/operations';

/**
 * Module 3 — DÉCOUVERTE : multiples et diviseurs.
 *
 * Activity              ranger 24 carreaux en rectangle plein, en essayant
 *                       toutes les largeurs.
 * Mathematical objective un diviseur de n est une largeur pour laquelle le
 *                       rectangle est plein — autrement dit une division sans
 *                       reste, autrement dit un facteur de n.
 * Student action        choisir la largeur.
 * Visual consequence    la dernière rangée est pleine (vert) ou trouée, et le
 *                       reste est compté.
 * Expected observation  « certaines largeurs marchent, d'autres non — et
 *                       celles qui marchent vont par PAIRES : 4 va avec 6 ».
 * Misconception targeted confondre multiple et diviseur, et croire qu'il faut
 *                       poser la division pour savoir.
 *
 * PÉRIMÈTRE 5e : on reconnaît multiples et diviseurs, et on utilise les
 * critères de divisibilité. Le PGCD, le PPCM et les nombres premiers sont des
 * objets de 3e et n'apparaissent pas (lesson.config.js 3 exclude).
 */
const N = 24;

export default function Module06MultiplesEtDiviseurs() {
  const [largeur, setLargeur] = useState(5);
  const [trouves, setTrouves] = useState(() => new Set());
  const done1 = trouves.size >= 4;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const essayer = (L, react) => {
    setLargeur(L);
    if (divise(L, N)) {
      const next = new Set(trouves);
      next.add(L);
      setTrouves(next);
      if (next.size >= 4 && trouves.size < 4) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Range 24 carreaux en rectangle plein',
      subtitle: 'Toutes les largeurs ne marchent pas. Trouves-en au moins quatre qui donnent un rectangle complet.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <RectangleLab
            n={N}
            largeur={largeur}
            onLargeur={(L) => essayer(L, kit.react)}
            maxLargeur={12}
            ariaLabel="Ranger 24 carreaux en rectangle"
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Largeurs qui marchent</span>
            {[...trouves].sort((a, b) => a - b).map((L) => (
              <span
                key={L}
                className="px-3 py-1.5 rounded-lg bg-amber-50 border-2 border-amber-200 font-mono font-bold text-amber-800 tabular-nums"
              >
                {L}
              </span>
            ))}
            {trouves.size === 0 && <span className="text-xs text-slate-400">aucune pour l’instant</span>}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Les largeurs qui marchent pour 24 sont{' '}
              <strong className="font-mono">{diviseurs(N).join(' · ')}</strong>. Remarque qu’elles
              vont par <strong>paires</strong> : 4 va avec 6 (4 × 6 = 24), 3 avec 8, 2 avec 12. Un
              rectangle plein, c’est toujours <strong>deux nombres qui se multiplient</strong> pour
              donner 24.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {trouves.size} largeur{trouves.size > 1 ? 's' : ''} trouvée{trouves.size > 1 ? 's' : ''} sur 4.
              Quand la dernière rangée est trouée, essaie une autre largeur.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux mots pour une seule égalité',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="multiple-diviseur"
            variant="new"
            lead={<>Tu as trouvé que 4 et 6 vont ensemble, parce que 4 × 6 = 24. Cette égalité se raconte de deux façons, et chacune a son mot.</>}
          />
          <TapQuestion
            prompt="Sachant que 7 × 9 = 63, laquelle de ces phrases est vraie ?"
            options={[
              '7 est un diviseur de 63, et 63 est un multiple de 7',
              '63 est un diviseur de 7, et 7 est un multiple de 63',
              '7 et 63 sont tous les deux des multiples de 9',
              '9 est un multiple de 63',
            ]}
            correct={0}
            cols={1}
            requires={['multiple-diviseur']}
            explain="7 × 9 = 63 : le petit nombre divise le grand. 7 est donc un diviseur de 63, et 63 — qui est dans la table de 7 — est un multiple de 7. La même chose vaut pour 9."
            explainWrong="Attention au sens des deux mots : le DIVISEUR est le nombre par lequel on divise (le plus petit, ici 7 ou 9) ; le MULTIPLE est le résultat de la table (le plus grand, ici 63). 63 ne peut pas diviser 7 : il est bien trop grand."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Répondre sans poser la division',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="criteres-divisibilite"
            variant="new"
            lead={<>Pour 24 tu pouvais essayer toutes les largeurs. Pour 738, ce serait très long. Il existe des raccourcis qui ne demandent que de regarder les chiffres.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque nombre, dis s’il est un multiple du diviseur indiqué — sans poser la
                division.
              </p>
            }
            rows={[
              {
                id: 'd1',
                label: '414 est-il un multiple de 9 ?',
                options: ['Oui', 'Non'],
                correct: 0,
                correction: `4 + 1 + 4 = ${sommeChiffres(414)}, qui est dans la table de 9. Donc oui.`,
              },
              {
                id: 'd2',
                label: '235 est-il un multiple de 3 ?',
                options: ['Oui', 'Non'],
                correct: 1,
                correction: `2 + 3 + 5 = ${sommeChiffres(235)}, qui n’est pas dans la table de 3. Donc non. (235 est bien un multiple de 5.)`,
              },
              {
                id: 'd3',
                label: '1 250 est-il un multiple de 10 ?',
                options: ['Oui', 'Non'],
                correct: 0,
                correction: 'Son chiffre des unités est 0 : c’est bien un multiple de 10.',
              },
            ]}
            requires={['criteres-divisibilite', 'multiple-diviseur']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Trois réponses sans poser une seule division. Les critères ne remplacent pas la
                  division — ils disent simplement <strong>si elle va tomber juste</strong>, ce qui
                  suffit très souvent.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Rappel des deux familles de critères : pour{' '}
                  <strong>2, 5 et 10</strong>, on regarde le <strong>dernier chiffre</strong> ; pour{' '}
                  <strong>3 et 9</strong>, on additionne <strong>tous les chiffres</strong>.
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
      title: 'À quoi ça sert vraiment',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un professeur veut répartir 30 élèves en équipes ayant toutes le même nombre d’élèves, sans laisser personne de côté. Quelle taille d’équipe est IMPOSSIBLE ?"
            options={['4 élèves', '5 élèves', '6 élèves', '3 élèves']}
            correct={0}
            cols={4}
            requires={['multiple-diviseur', 'criteres-divisibilite']}
            explain="Il faut que la taille d’équipe soit un diviseur de 30. Les diviseurs de 30 sont 1, 2, 3, 5, 6, 10, 15 et 30. 4 n’en fait pas partie : 30 ÷ 4 laisse un reste de 2, donc deux élèves resteraient sans équipe."
            explainWrong="Reprends le rectangle : peut-on ranger 30 carreaux en rangées pleines de cette largeur ? Avec 5, oui (6 rangées). Avec 6, oui (5 rangées). Avec 3, oui (10 rangées). Avec 4, la dernière rangée reste trouée."
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Multiples et diviseurs"
      moduleSubtitle="Quand la division tombe juste"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: '24 carreaux à ranger',
        tone: 'amber',
        body: (
          <p>
            On te donne <strong>24 carreaux</strong> et on te demande d’en faire un rectangle
            <strong> parfaitement plein</strong>. Certaines largeurs marchent, d’autres laissent une
            rangée trouée. Trouve lesquelles — et surtout, comprends{' '}
            <strong>pourquoi</strong> ce sont celles-là.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
