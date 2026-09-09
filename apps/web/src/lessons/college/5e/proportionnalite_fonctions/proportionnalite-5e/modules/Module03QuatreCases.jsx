import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PathTable from '../components/PathTable';
import { CROISSANTS, TISSU } from '../components/situations';
import { fr, pathsToCell, parseDec } from '../components/propUtils';

/**
 * Module 3 — MANIPULATION : le tableau, et les trois chemins vers la case vide.
 *
 * Action → changement → observation → sens :
 *   choisir un chemin → son calcul se déroule → « les trois donnent 12 € »
 *   → un tableau ne s'apprend pas par cœur, il se parcourt.
 *
 * Expected observation : « je peux passer par où je veux, j'arrive au même
 * nombre — autant passer par le plus simple ».
 * Misconception targeted : croire qu'il existe UNE méthode officielle, et
 * appliquer la linéarité additive (« de 4 à 10, j'ajoute 6, donc j'ajoute 6 »).
 *
 * PÉRIMÈTRE : le produit en croix est un objet de 4e ; il n'est ni montré, ni
 * nommé, ni proposé en distracteur.
 */
export default function Module03QuatreCases() {
  const [chosen1, setChosen1] = useState(null);
  const [seen1, setSeen1] = useState([]);
  const done1 = seen1.length >= 2;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const choisir1 = (id, react) => {
    setChosen1(id);
    if (!seen1.includes(id)) {
      const next = [...seen1, id];
      setSeen1(next);
      if (next.length >= 2) react?.(true);
    }
  };

  const p1 = pathsToCell({ x: 4, y: 4.8 }, 10);

  const steps = [
    {
      num: 1,
      title: 'Une case vide, plusieurs chemins',
      subtitle: '4 croissants coûtent 4,80 €. Combien coûtent 10 croissants ? Essaie deux chemins.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PathTable
            situation={CROISSANTS}
            known={{ x: 4, y: 4.8 }}
            target={10}
            chosen={chosen1}
            onChoose={(id) => choisir1(id, kit.react)}
            revealValue={seen1.length > 0}
          />
          {done1 ? (
            <Feedback tone="ok">
              Deux chemins différents, <strong>le même résultat</strong> :{' '}
              <strong className="font-mono">{fr(p1.value)} €</strong>. C’est normal — ils
              décrivent tous la même situation, celle où chaque croissant coûte 1,20 €.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Choisis un chemin : son calcul s’écrit sous le tableau. Puis essaies-en un second.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le piège de l’addition',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Pour passer de 4 à 10 croissants, un élève écrit : « j’ajoute 6, donc j’ajoute 6 € ».
                Il trouve 10,80 €. Où est l’erreur ?
              </>
            }
            options={[
              'Passer de 4 à 10, c’est multiplier par 2,5 — pas ajouter 6',
              'Il a mal fait son addition',
              'Il n’y a pas d’erreur',
            ]}
            cols={1}
            correct={0}
            requires={['proportionnalite', 'coefficient-proportionnalite']}
            explain="Dans une situation proportionnelle, on passe d’une colonne à l’autre en MULTIPLIANT. De 4 à 10, on multiplie par 2,5 ; donc 4,80 × 2,5 = 12 €. Ajouter 6 croissants ajoute 6 × 1,20 = 7,20 €, et non 6 €."
            explainWrong="L’addition 4,80 + 6 est juste, mais elle ne correspond à rien : ajouter 6 croissants coûte 6 × 1,20 = 7,20 €. Le lien entre les deux grandeurs est multiplicatif, jamais « le même nombre ajouté des deux côtés »."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La méthode, écrite une fois pour toutes',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La brique arrive APRÈS que l'élève a parcouru deux chemins et
              rencontré le piège additif : elle range ce qu'il a fait. */}
          <KnowledgeBrick
            id="tableau-proportionnalite"
            variant="new"
            lead={<>Tu viens d’emprunter deux de ces trois chemins.</>}
          />
          <NumericQuestion
            prompt={
              <>
                <strong>6 costumes</strong> demandent <strong>15 m</strong> de tissu. Combien de
                mètres faut-il pour <strong>14 costumes</strong> ?
              </>
            }
            expected={35}
            parse={parseDec}
            suffix="m"
            requires={['tableau-proportionnalite', 'coefficient-proportionnalite']}
            explain="Par l’unité : 15 ÷ 6 = 2,5 m par costume, puis 2,5 × 14 = 35 m. (Par le facteur, on peut aussi passer de 6 à 14 en multipliant par 14 ÷ 6.)"
            explainFor={(n) =>
              n === 23
                ? 'Tu as ajouté 8 (de 6 à 14 costumes) aux 15 m. Mais on multiplie, on n’ajoute pas : chaque costume demande 2,5 m, donc 8 costumes de plus demandent 20 m de plus.'
                : 'Cherche d’abord le tissu d’UN costume : 15 ÷ 6 = 2,5 m. Puis multiplie par 14.'
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Choisir le chemin le plus commode',
      subtitle: 'Les trois marchent toujours. L’un demande moins de calcul.',
      done: q4,
      content: (
        <div className="space-y-3">
          <PathTable
            situation={TISSU}
            known={{ x: 4, y: 10 }}
            target={8}
            chosen="facteur"
            onChoose={() => {}}
            revealValue
          />
          <TapQuestion
            prompt={
              <>
                Pour passer de <strong>4</strong> à <strong>8</strong> costumes, quel chemin
                demande le moins de calcul ?
              </>
            }
            options={[
              'Le facteur : de 4 à 8, on double, donc on double le tissu',
              'L’unité : diviser par 4, puis multiplier par 8',
              'Il faut toujours passer par l’unité',
            ]}
            cols={1}
            correct={0}
            requires={['tableau-proportionnalite']}
            explain="De 4 à 8, le facteur est 2 : il suffit de doubler 10 m pour obtenir 20 m. Les autres chemins donnent le même résultat, mais avec plus d’étapes. Quand le facteur est simple, c’est lui qu’on prend."
            explainWrong="Passer par l’unité marche toujours et donne bien 20 m — mais ici, le facteur saute aux yeux : de 4 à 8, on double. Aucun chemin n’est obligatoire."
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
      moduleTitle="Quatre cases, plusieurs chemins"
      moduleSubtitle="Le tableau de proportionnalité"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Une case vide, et plusieurs façons d’y arriver',
        tone: 'indigo',
        body: (
          <p>
            Quand on range deux grandeurs proportionnelles dans un tableau, trouver une valeur
            manquante devient un petit voyage : par l’unité, par le facteur, ou par le
            coefficient. <strong>Les trois arrivent au même endroit</strong> — à toi de choisir le
            plus court.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
