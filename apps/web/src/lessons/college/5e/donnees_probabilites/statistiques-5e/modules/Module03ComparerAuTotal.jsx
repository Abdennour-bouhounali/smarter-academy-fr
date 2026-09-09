import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DatasetLab from '../components/DatasetLab';
import { datasetInit, tableau, fr } from '../components/statistiques';

/**
 * Module 3 — DÉCOUVERTE : pourquoi un effectif seul ne suffit pas.
 *
 * La découverte se fait par CONFRONTATION de deux enquêtes : « 4 élèves ont
 * lu 2 livres » dans une classe de 12, et « 4 élèves » dans un collège de 300.
 * Le même effectif, deux situations sans rapport. L'élève constate qu'il lui
 * manque une information — le total — et invente le besoin du quotient avant
 * qu'on le lui donne.
 *
 * Expected observation : « un effectif ne veut rien dire tant que je ne sais
 * pas sur combien ; c'est la comparaison au total qui rend deux enquêtes
 * comparables ».
 * Misconception targeted : croire qu'un effectif plus grand signifie « plus
 * fréquent » indépendamment de la population.
 */
const AUTRE = { effectif: 4, total: 300 };

export default function Module03ComparerAuTotal() {
  const [data, setData] = useState(() => datasetInit());
  const [q1, setQ1] = useState(false);
  const [f2, setF2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const lignes = tableau(data);
  const ligne2 = lignes.find((l) => l.valeur === 2);

  const steps = [
    {
      num: 1,
      title: 'Deux enquêtes, le même 4',
      subtitle: 'Dans laquelle des deux « lire 2 livres » est-il le plus courant ?',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-center space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">Notre classe</div>
              <div className="font-mono text-2xl font-black tabular-nums text-amber-900">4</div>
              <div className="text-xs text-slate-600">élèves ont lu 2 livres</div>
              <div className="text-xs font-semibold text-slate-500">sur 12 élèves interrogés</div>
            </div>
            <div className="rounded-xl border-2 border-slate-300 bg-slate-50 p-3 text-center space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-700">Tout le collège</div>
              <div className="font-mono text-2xl font-black tabular-nums text-slate-800">{AUTRE.effectif}</div>
              <div className="text-xs text-slate-600">élèves ont lu 2 livres</div>
              <div className="text-xs font-semibold text-slate-500">sur {AUTRE.total} élèves interrogés</div>
            </div>
          </div>
          <TapQuestion
            prompt="Le même effectif, 4, des deux côtés. Dans quel groupe « avoir lu 2 livres » est-il le plus courant ?"
            options={[
              'Dans la classe de 12',
              'Dans le collège de 300',
              'C’est pareil : 4 égale 4',
              'On ne peut pas savoir',
            ]}
            correct={0}
            cols={2}
            /* Rien de la leçon n'est requis : c'est du bon sens de 6e sur les
               parts d'un tout, et c'est lui qui va FAIRE NAÎTRE la fréquence. */
            requires={['fraction-part']}
            explain="4 élèves sur 12, c’est un tiers du groupe. 4 élèves sur 300, c’est à peine plus de 1 %. Le même effectif ne pèse pas du tout pareil selon le total."
            explainWrong="Le nombre 4 est identique, mais il ne se rapporte pas au même ensemble. 4 personnes dans une classe de 12, c’est beaucoup ; 4 personnes dans un collège de 300, c’est très peu."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="info">
              Pour comparer, tu as fait quelque chose sans le dire : tu as rapporté l’effectif au{' '}
              <strong>total</strong>. Ce geste a un nom, et une écriture.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écris ce que tu viens de faire',
      subtitle: 'Mets par écrit la comparaison que tu viens de faire.',
      done: f2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="frequence"
            variant="new"
            lead={<>Comparer un effectif à son total, c’est exactement ce que tu as fait pour départager les deux enquêtes.</>}
          />
          <NumericQuestion
            prompt={<>Quelle part de la classe a lu 2 livres, en pourcentage ? (arrondis au dixième)</>}
            expected={(n) => Math.abs(n - 33.3) < 0.15}
            display="33,3 %"
            suffix="%"
            parse={(s) => {
              const v = Number(String(s).replace(',', '.').replace(/\s|%/g, ''));
              return Number.isFinite(v) ? v : null;
            }}
            requires={['frequence']}
            explain="4 ÷ 12 = 0,333… soit environ 33,3 %. Un tiers de la classe."
            explainFor={(n) =>
              n === 4
                ? 'Tu as redonné l’effectif. La fréquence demande de le DIVISER par le total : 4 ÷ 12.'
                : n === 12
                  ? 'Tu as donné le total. Ce qu’on cherche, c’est la part : 4 ÷ 12.'
                  : 'Divise l’effectif par l’effectif total : 4 ÷ 12 ≈ 0,333, soit 33,3 %.'
            }
            solved={f2}
            onAnswered={() => setF2(true)}
          />
          {f2 && (
            <Feedback tone="ok">
              Et dans le collège de 300 : 4 ÷ 300 ≈ <strong>1,3 %</strong>. Voilà pourquoi les
              deux situations n’ont rien à voir, alors que l’effectif était le même.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Toutes les fréquences de l’enquête',
      subtitle: 'La ligne complète apparaît. Vérifie qu’elle boucle.',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Les fréquences apparaissent MAINTENANT dans le laboratoire :
              elles n'existaient pas avant que la brique ne les pose. */}
          <DatasetLab
            data={data}
            onData={setData}
            actions={['trier']}
            montrerFrequences
            ariaLabel="Tableau des effectifs et des fréquences"
          />
          <TapQuestion
            prompt="Additionne toutes les fréquences du tableau. Que doit-on trouver ?"
            options={['1 (soit 100 %)', '12', '0', 'Cela dépend de l’enquête']}
            correct={0}
            cols={2}
            requires={['frequence']}
            explain="Chaque élève est compté dans exactement une colonne. Toutes les parts réunies refont donc le groupe entier : 1/12 + 3/12 + 4/12 + 3/12 + 1/12 = 12/12 = 1, soit 100 %."
            explainWrong="12 est l’effectif total, pas la somme des fréquences. Les fréquences sont des PARTS : mises bout à bout, elles refont un tout, c’est-à-dire 1."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && <KnowledgeBrick id="mem-frequences" variant="new" compact />}
        </div>
      ),
    },
    {
      num: 4,
      title: 'À toi de juger',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Dans une classe A, 6 élèves sur 24 font du sport en club. Dans une classe B,
                5 élèves sur 15. Quelle classe est la plus sportive ?
              </>
            }
            options={[
              'La classe B',
              'La classe A',
              'Elles sont à égalité',
              'La classe A, parce que 6 > 5',
            ]}
            correct={0}
            cols={2}
            requires={['frequence']}
            explain="A : 6/24 = 25 %. B : 5/15 = 33,3 %. La classe B est plus sportive, alors qu’elle compte MOINS de sportifs en nombre."
            explainWrong="6 est plus grand que 5, mais 24 est bien plus grand que 15. En parts : 6/24 = un quart, 5/15 = un tiers. Un tiers est plus qu’un quart."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Tu sais maintenant compter ({ligne2 ? ligne2.effectif : 4} élèves) et comparer (
              {ligne2 ? fr(ligne2.pourcentage, 1) : '33,3'} %). Il reste à{' '}
              <strong>voir</strong> : c’est le travail du prochain module.
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
      moduleTitle="Comparer au total"
      moduleSubtitle="Pourquoi « 4 élèves » ne veut rien dire tout seul"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: '4 élèves, est-ce beaucoup ?',
        tone: 'amber',
        body: (
          <p>
            Quatre élèves ont lu deux livres. Est-ce beaucoup&nbsp;? Impossible de répondre —{' '}
            <strong>sur combien</strong>&nbsp;? Ce module met deux enquêtes côte à côte avec le
            même effectif et des totaux très différents, et te fait inventer le nombre qui permet
            enfin de les comparer.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
