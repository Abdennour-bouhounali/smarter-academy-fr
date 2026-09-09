import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DatasetLab from '../components/DatasetLab';
import { datasetInit, tableau, fr } from '../components/statistiques';

/**
 * Module 5 — MANIPULATION : choisir la représentation.
 *
 * Les deux dessins sont désormais disponibles ; le module fait découvrir
 * qu'ils ne répondent PAS à la même question. On ne choisit donc pas un
 * graphique par goût, mais d'après ce qu'on veut faire voir.
 *
 * La construction du diagramme circulaire passe par un calcul d'angle —
 * fréquence × 360° — qui est une pure situation de proportionnalité de 5e,
 * et le module la traite comme telle.
 *
 * Expected observation : « les barres me font comparer des hauteurs entre
 * elles ; le camembert me fait comparer chaque part au tout ».
 * Misconception targeted : croire que le camembert est « joli mais
 * équivalent » ; et calculer l'angle à partir de l'effectif brut (4 × 360)
 * au lieu de la fréquence.
 */
export default function Module05BarresOuCamembert() {
  const [data, setData] = useState(() => datasetInit());
  const [vue, setVue] = useState('secteurs');
  const [a1, setA1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const lignes = tableau(data);
  const l2 = lignes.find((l) => l.valeur === 2);

  const steps = [
    {
      num: 1,
      title: 'Découpe le disque',
      subtitle: 'Le tour complet représente les 12 élèves. Quelle part revient à « 2 livres » ?',
      done: a1,
      content: (
        <div className="space-y-3">
          {/* La manipulation ouvre le module : l'élève bascule entre les deux
              dessins des mêmes données avant qu'on lui parle d'angles. */}
          <DatasetLab
            data={data}
            onData={setData}
            vue={vue}
            onVue={setVue}
            actions={['representation', 'trier']}
            montrerFrequences
            ariaLabel="Les mêmes données en barres et en secteurs"
          />
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm text-slate-700">
            Le disque entier vaut <strong>360°</strong> et représente les{' '}
            <strong>{data.length} élèves</strong>. Les 4 élèves qui ont lu 2 livres occupent donc
            une part proportionnelle du tour.
          </div>
          <NumericQuestion
            prompt={<>Quel angle doit mesurer le secteur de « 2 livres » ?</>}
            expected={120}
            suffix="°"
            requires={['frequence', 'fraction-part']}
            explain="4 élèves sur 12, c’est un tiers du groupe : 4/12 × 360° = 120°. Un tiers du tour."
            explainFor={(n) =>
              n === 4
                ? 'Tu as donné l’effectif. Il faut le transformer en part du tour : 4/12 × 360°.'
                : n === 1440
                  ? 'Tu as fait 4 × 360. Mais 4 n’est pas une part : c’est 4 élèves SUR 12. La part est 4/12, et 4/12 × 360° = 120°.'
                  : n === 30
                    ? 'Tu as divisé 360 par 12 : c’est l’angle d’UN SEUL élève. Ils sont 4, donc 4 × 30° = 120°.'
                    : 'Calcule d’abord la fréquence (4 ÷ 12 = un tiers), puis applique-la au tour complet : × 360°.'
            }
            solved={a1}
            onAnswered={() => setA1(true)}
          />
          {a1 && (
            <>
              <Feedback tone="ok">
                Vérification : le secteur affiché mesure bien{' '}
                <strong className="font-mono">{l2 ? fr(l2.angle, 1) : '120'}°</strong>. Et la
                somme de tous les secteurs fait 360° — comme la somme des fréquences fait 1.
              </Feedback>
              <KnowledgeBrick
                id="diagramme-circulaire"
                variant="new"
                lead={<>C’est une proportionnalité : ce que le total est à la population, 360° l’est au disque.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Chaque dessin sa question',
      done: q2,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque question, quel graphique répond le plus directement ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'Est-ce que plus de la moitié de la classe a lu au moins 2 livres ?',
                options: ['Barres', 'Secteurs'],
                correct: 1,
                correction: 'C’est une question de PART du tout : on regarde si les secteurs concernés dépassent la moitié du disque.',
              },
              {
                id: 'r2',
                label: 'Combien d’élèves de plus ont lu 2 livres plutôt que 3 ?',
                options: ['Barres', 'Secteurs'],
                correct: 0,
                correction: 'C’est un écart d’effectifs : deux hauteurs se comparent d’un coup d’œil, 4 contre 3.',
              },
              {
                id: 'r3',
                label: 'Quelle réponse a été donnée le plus souvent ?',
                options: ['Barres', 'Secteurs'],
                correct: 0,
                correction: 'La barre la plus haute se repère immédiatement ; sur le disque, comparer deux secteurs voisins est plus difficile.',
              },
              {
                id: 'r4',
                label: 'Quelle proportion de la classe n’a lu aucun livre ?',
                options: ['Barres', 'Secteurs'],
                correct: 1,
                correction: 'Une proportion du groupe entier : le secteur montre directement la part, ici une toute petite tranche.',
              },
            ]}
            requires={['diagramme-barres', 'diagramme-circulaire']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  La règle se dégage toute seule : dès que la question contient «&nbsp;part&nbsp;»,
                  «&nbsp;proportion&nbsp;» ou «&nbsp;moitié du groupe&nbsp;», c’est le disque. Dès
                  qu’elle compare deux quantités entre elles, ce sont les barres.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Relis chaque question et demande-toi : est-ce que je
                  compare <strong>deux réponses entre elles</strong> (barres), ou{' '}
                  <strong>une réponse au groupe entier</strong> (secteurs) ?
                </Feedback>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && <KnowledgeBrick id="choisir-representation" variant="new" />}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège du camembert',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Un journal publie un camembert des ventes de trois magasins, où les trois
                secteurs totalisent <strong>140 %</strong>. Que peut-on en conclure ?
              </>
            }
            options={[
              'Le graphique est faux : les parts d’un tout font toujours 100 %',
              'Un magasin a vendu plus que prévu',
              'C’est normal quand il y a trois magasins',
              'Il faut diviser chaque part par 3',
            ]}
            correct={0}
            cols={1}
            requires={['diagramme-circulaire', 'mem-frequences']}
            explain="Un diagramme circulaire représente des parts d’un même tout : leur somme vaut le tout, donc 100 % — jamais plus. 140 % signale une erreur, ou des catégories qui se chevauchent (un client compté deux fois)."
            explainWrong="La somme des parts d’un tout ne dépend pas du nombre de catégories : deux ou trente, elle vaut toujours 100 %. Dépasser 100 % est le signe sûr d’une erreur."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Tu sais compter, comparer et représenter. Il te manque encore un nombre : celui qui{' '}
              <strong>résume toute la série d’un coup</strong>.
            </Feedback>
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
      moduleTitle="Barres ou camembert ?"
      moduleSubtitle="Deux dessins, deux questions différentes"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le même tableau, deux images',
        tone: 'indigo',
        body: (
          <p>
            Barres ou camembert&nbsp;? Ce n’est pas une question de goût. Chacun des deux
            répond bien à une question, et mal à l’autre. Ce module te fait construire le
            disque — un vrai calcul d’angle — puis choisir le bon dessin selon ce qu’on veut
            faire voir.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
