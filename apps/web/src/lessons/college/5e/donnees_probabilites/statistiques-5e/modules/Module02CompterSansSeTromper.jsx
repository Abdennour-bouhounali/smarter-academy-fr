import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DatasetLab from '../components/DatasetLab';
import { datasetInit, tableau, controle } from '../components/statistiques';

/**
 * Module 2 — DÉCOUVERTE : l'effectif, et le contrôle qui va avec.
 *
 * Le module 1 a laissé l'élève avec une liste rangée. Ici il REMPLIT le
 * tableau lui-même, case par case, et découvre que la somme des effectifs
 * doit retomber sur le nombre d'élèves — un contrôle qu'il peut faire seul,
 * sans corrigé.
 *
 * Expected observation : « si mes cases ne totalisent pas 12, j'ai oublié
 * quelqu'un ou compté quelqu'un deux fois ».
 * Misconception targeted : confondre la VALEUR (2 livres) et l'EFFECTIF
 * (4 élèves) — l'erreur la plus tenace de tout le chapitre.
 */
export default function Module02CompterSansSeTromper() {
  const [data, setData] = useState(() => datasetInit());
  const [e2, setE2] = useState(false);
  const [e5, setE5] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const lignes = tableau(data);
  const ctrl = controle(data);

  const steps = [
    {
      num: 1,
      title: 'Compte les cases toi-même',
      subtitle: 'Le tableau attend deux nombres. Va les chercher dans la liste.',
      done: e2 && e5,
      content: (
        <div className="space-y-3">
          <DatasetLab
            data={data}
            onData={setData}
            actions={['trier']}
            ariaLabel="La liste triable et son tableau d’effectifs"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <NumericQuestion
              prompt={<>Combien d’élèves ont lu <strong>2 livres</strong> ?</>}
              expected={4}
              suffix="élèves"
              requires={['lire-tableau']}
              explain="Inès, Malo, Lina et Yanis : 4 élèves. Trier « par nombre de livres » les met côte à côte."
              explainFor={(n) =>
                n === 2
                  ? 'Tu as répondu 2 — mais 2 est le nombre de LIVRES, pas le nombre d’élèves. La question demande combien d’élèves ont donné cette réponse.'
                  : 'Trie la liste par nombre de livres, puis compte les étiquettes qui portent un 2.'
              }
              solved={e2}
              onAnswered={() => setE2(true)}
            />
            <NumericQuestion
              prompt={<>Combien d’élèves ont lu <strong>5 livres</strong> ?</>}
              expected={1}
              suffix="élève"
              requires={['lire-tableau']}
              explain="Noé, et lui seul : 1 élève."
              explainFor={(n) =>
                n === 5
                  ? 'Tu as répondu 5 — c’est le nombre de livres de Noé, pas le nombre d’élèves qui en ont lu 5. Ils ne sont qu’un.'
                  : 'Cherche dans la liste les étiquettes qui portent un 5.'
              }
              solved={e5}
              onAnswered={() => setE5(true)}
            />
          </div>
          {e2 && e5 && (
            <Feedback tone="ok">
              Ces deux nombres, 4 et 1, ne comptent pas des livres : ils comptent des{' '}
              <strong>élèves</strong>. C’est exactement ce que remplit la ligne du tableau.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le mot juste',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="effectif"
            variant="new"
            lead={<>Tu viens de compter des élèves pour chaque réponse. Ce nombre-là porte un nom, et il ne se confond jamais avec la réponse elle-même.</>}
          />
          <TapQuestion
            prompt={<>Dans notre tableau, l’effectif de la valeur <strong className="font-mono">3</strong> vaut 3. Que compte ce nombre ?</>}
            options={[
              '3 élèves ont lu 3 livres',
              '3 livres ont été lus en tout',
              'Le 3ᵉ élève de la liste',
              '3 est la valeur la plus fréquente',
            ]}
            correct={0}
            cols={1}
            requires={['effectif']}
            explain="Sarah, Camille et Léa ont chacune lu 3 livres : l’effectif de la valeur 3 est 3. Ici valeur et effectif tombent sur le même chiffre — pure coïncidence, et c’est justement le piège."
            explainWrong="Un effectif compte toujours des INDIVIDUS. Que le nombre 3 apparaisse des deux côtés est un hasard : pour la valeur 2, l’effectif est 4."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le contrôle qui ne trompe pas',
      subtitle: 'Une addition suffit à savoir si ton tableau est juste.',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 space-y-2">
            <p className="text-sm text-slate-700">
              Additionne les effectifs de ton tableau :
            </p>
            <div className="rounded-lg border-2 border-violet-300 bg-white px-3 py-2 text-center">
              <span className="font-mono text-base font-black tabular-nums text-violet-800">
                {lignes.map((l) => l.effectif).join(' + ')} = {ctrl.sommeEffectifs}
              </span>
            </div>
            <p className="text-sm text-slate-700">
              …et compare au nombre d’élèves interrogés :{' '}
              <strong className="font-mono">{ctrl.total}</strong>.{' '}
              {ctrl.effectifsOk
                ? 'Les deux tombent pareil : rien n’a été oublié.'
                : 'Les deux ne tombent pas pareil.'}
            </p>
          </div>
          {/* La brique vient AVANT la question qui l'exige : l'élève vient
              de faire l'addition de contrôle à la main, la méthode nomme ce
              geste, et la question la met alors à l'épreuve. */}
          <KnowledgeBrick
            id="tableau-effectifs"
            variant="new"
            lead={<>Tu viens de faire cette vérification à la main. C’est elle qui complète la méthode, et qui te rend indépendant d’un corrigé.</>}
          />
          <TapQuestion
            prompt="Un camarade remplit son tableau et trouve une somme d’effectifs de 11, alors qu’il a interrogé 12 élèves. Que s’est-il passé ?"
            options={[
              'Il a oublié un élève',
              'Il s’est trompé de calcul de moyenne',
              'C’est normal, la somme ne fait jamais le total',
              'Un élève a lu 0 livre, donc il ne compte pas',
            ]}
            correct={0}
            cols={1}
            requires={['effectif', 'tableau-effectifs']}
            explain="La somme des effectifs vaut toujours l’effectif total. Un écart de 1 signale un élève oublié — ou compté dans la mauvaise colonne."
            explainWrong="Un élève qui a lu 0 livre compte quand même : il a répondu, il fait partie des 12. C’est d’ailleurs Hugo, et il a bien sa place dans la colonne 0."
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Compter sans se tromper"
      moduleSubtitle="Des élèves, pas des livres"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Deux nombres dans la même case, et il ne faut pas les confondre',
        tone: 'indigo',
        body: (
          <p>
            «&nbsp;<strong>4</strong> élèves ont lu <strong>2</strong> livres&nbsp;» : deux
            nombres dans une seule phrase, et ils ne comptent pas la même chose. Ce module te
            fait remplir le tableau case par case, et te donne le contrôle qui dit tout seul si
            tu t’es trompé.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
