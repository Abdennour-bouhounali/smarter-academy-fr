import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartageLab from '../components/PartageLab';
import DatasetLab from '../components/DatasetLab';
import { ENQUETE, datasetInit, partageEquitable, fr } from '../components/statistiques';

/**
 * Module 6 — MANIPULATION : la moyenne, découverte avant d'être formalisée.
 *
 * Consigne explicite du cahier des charges : « la moyenne doit être découverte
 * avant d'être formalisée ». Le module l'applique à la lettre. L'élève :
 *   1. voit douze piles inégales et les redistribue à la main ;
 *   2. lit lui-même la hauteur commune obtenue (2,08) ;
 *   3. retrouve ce nombre par un calcul (25 ÷ 12) ;
 *   4. et SEULEMENT ALORS reçoit le mot « moyenne » et la formule.
 *
 * Expected observation : « peu importe comment je redistribue, la hauteur
 * commune est toujours la même — parce que le total, lui, ne change pas ».
 * Misconception targeted : diviser par le nombre de VALEURS DIFFÉRENTES (5)
 * au lieu du nombre d'individus (12) ; et croire que la moyenne est
 * forcément une valeur de la série.
 */
export default function Module06LePartageEquitable() {
  const [data, setData] = useState(() => datasetInit());
  const [aPartage, setAPartage] = useState(false);
  const [n1, setN1] = useState(false);
  const [n2, setN2] = useState(false);
  const [q3, setQ3] = useState(false);

  const base = datasetInit();
  const { totalLivres, nb, part } = partageEquitable(base);

  const steps = [
    {
      num: 1,
      title: 'Mets tout en commun, puis repartage',
      subtitle: 'Douze piles très inégales. Que se passe-t-il si chacun reçoit la même chose ?',
      done: aPartage && n1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3 text-sm text-slate-700">
            Chaque pile, c’est les livres d’un élève. Noé en a 5, Hugo aucun. Rassemble tous les
            livres et redistribue-les <strong>équitablement</strong> : combien chacun
            recevrait-il&nbsp;?
          </div>

          {/* La manipulation ouvre le module et produit LE nombre. */}
          <PartageLab
            valeurs={ENQUETE.bruts.map(([, v]) => v)}
            prenoms={ENQUETE.bruts.map(([p]) => p)}
            onPartage={() => setAPartage(true)}
          />

          {aPartage && (
            <NumericQuestion
              prompt={<>Retrouve ce nombre par le calcul. Combien de livres en tout, et pour combien d’élèves ?</>}
              expected={(n) => Math.abs(n - part) < 0.02}
              display={fr(part)}
              suffix="livres par élève"
              parse={(s) => {
                const v = Number(String(s).replace(',', '.').replace(/\s/g, ''));
                return Number.isFinite(v) ? v : null;
              }}
              requires={['division-partage']}
              explain={`Il y a ${totalLivres} livres en tout, pour ${nb} élèves : ${totalLivres} ÷ ${nb} ≈ ${fr(part)}. C’est exactement la hauteur commune que tu viens d’obtenir.`}
              explainFor={(n) =>
                Math.abs(n - totalLivres / 5) < 0.02
                  ? `Tu as divisé par 5 — le nombre de valeurs DIFFÉRENTES (0, 1, 2, 3, 5). Mais on partage entre des ÉLÈVES, et ils sont ${nb}.`
                  : n === totalLivres
                    ? 'C’est le total des livres. Il reste à le partager entre les 12 élèves.'
                    : `Additionne d’abord tous les livres (${totalLivres}), puis divise par le nombre d’élèves (${nb}).`
              }
              solved={n1}
              onAnswered={() => setN1(true)}
            />
          )}

          {n1 && (
            <Feedback tone="ok">
              Deux chemins, un seul nombre : le partage à la main et la division{' '}
              <strong className="font-mono">{totalLivres} ÷ {nb}</strong> donnent tous les deux{' '}
              <strong className="font-mono">{fr(part)}</strong>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le nom de ce nombre',
      done: n2,
      content: (
        <div className="space-y-3">
          {/* Le mot arrive APRÈS que le nombre a été obtenu deux fois. */}
          <KnowledgeBrick
            id="moyenne"
            variant="new"
            lead={<>Le nombre que tu viens d’obtenir en redistribuant les livres porte un nom que tu connais déjà — et tu sais maintenant ce qu’il fabrique.</>}
          />
          <KnowledgeBrick id="mem-moyenne" variant="new" compact />
          <NumericQuestion
            prompt={
              <>
                Une autre classe donne les réponses suivantes :{' '}
                <span className="font-mono font-bold">1 ; 4 ; 4 ; 2 ; 4</span>. Quelle est leur
                moyenne ?
              </>
            }
            expected={3}
            suffix="livres"
            requires={['moyenne', 'mem-moyenne']}
            explain="1 + 4 + 4 + 2 + 4 = 15, et il y a 5 élèves : 15 ÷ 5 = 3."
            explainFor={(n) =>
              n === 5
                ? 'Tu as divisé par 3 — le nombre de valeurs différentes (1, 2, 4). Le dénominateur est le nombre d’ÉLÈVES, ici 5.'
                : n === 15
                  ? 'C’est la somme des valeurs. Il reste à diviser par le nombre d’élèves : 15 ÷ 5.'
                  : 'Additionne les cinq réponses, puis divise par 5.'
            }
            solved={n2}
            onAnswered={() => setN2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un nombre que personne n’a donné',
      done: q3,
      content: (
        <div className="space-y-3">
          <DatasetLab
            data={data}
            onData={setData}
            montrerMoyenne
            montrerFrequences
            ariaLabel="Le jeu de données avec sa moyenne"
          />
          <TapQuestion
            prompt={
              <>
                La moyenne de notre enquête vaut <strong className="font-mono">{fr(part)}</strong>.
                Combien d’élèves ont lu exactement {fr(part)} livre ?
              </>
            }
            options={['Aucun', 'Quatre', 'Un seul', 'Douze']}
            correct={0}
            cols={4}
            requires={['moyenne']}
            explain="Personne : on ne lit pas 2,08 livre. La moyenne est un nombre CALCULÉ qui résume la série — elle n’a pas à figurer parmi les réponses."
            explainWrong="Regarde la liste : les réponses sont 0, 1, 2, 3 et 5. Aucune ne vaut 2,08. La moyenne n’est pas une réponse d’élève, c’est un résumé de toutes les réponses."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Essaie maintenant, dans le laboratoire, d’<strong>ajouter un élève qui a lu 12
              livres</strong> : un seul élève suffit à faire bondir la moyenne. Ce que ça
              raconte est le sujet du dernier module.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Le partage équitable"
      moduleSubtitle="Un seul nombre pour résumer douze réponses"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Et si tout le monde en avait autant ?',
        tone: 'indigo',
        body: (
          <p>
            Noé a lu cinq livres, Hugo aucun. Mets tous les livres en tas, redistribue-les
            équitablement, et regarde la hauteur à laquelle les piles s’arrêtent. Ce nombre-là,
            tu l’auras <strong>trouvé avant qu’on te le nomme</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
