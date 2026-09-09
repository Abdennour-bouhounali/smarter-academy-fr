import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RatioLab from '../components/RatioLab';
import { SIROP, PISCINE, TISSU } from '../components/situations';
import { fr, ratioColumn, parseDec } from '../components/propUtils';

/**
 * Module 2 — DÉCOUVERTE : le coefficient.
 *
 * Le module 1 a laissé l'élève avec un test (« est-ce que ça double ? ») qui
 * marche mais qui ne DONNE rien : il tranche, il ne calcule pas. Ce module
 * fait apparaître le nombre lui-même, en faisant dévoiler à l'élève un
 * rapport après l'autre, sur les deux situations qu'il connaît déjà.
 *
 * Action → changement → observation → sens :
 *   toucher une colonne → son rapport s'inscrit → « c'est encore 0,15 »
 *   → ce nombre-là est la situation.
 *
 * Expected observation : « sur le sirop je retombe toujours sur le même
 * nombre ; sur la piscine, jamais deux fois le même ».
 * Misconception targeted : chercher « le coefficient » d'une situation qui
 * n'en a pas — et croire qu'un coefficient est forcément un entier.
 */
const INPUTS = [2, 4, 6, 10];

export default function Module02LeNombreQuiNeBougePas() {
  const [rev1, setRev1] = useState([]);
  const done1 = rev1.length >= 3;

  const [rev2, setRev2] = useState([]);
  const done2 = rev2.length >= 3;

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const push = (setter, list) => (x, react) => {
    if (list.includes(x)) return;
    const next = [...list, x];
    setter(next);
    if (next.length >= 3) react?.(true);
  };

  const col1 = ratioColumn(SIROP, INPUTS);

  const steps = [
    {
      num: 1,
      title: 'Divise chaque sortie par son entrée',
      subtitle: 'Sur le sirop. Dévoile trois colonnes, et compare ce que tu obtiens.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <RatioLab
            rule={SIROP}
            inputs={INPUTS}
            revealed={rev1}
            onReveal={(x) => push(setRev1, rev1)(x, kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              Trois colonnes, <strong>trois fois le même nombre</strong> :{' '}
              <strong className="font-mono">{fr(col1.value)}</strong>. Ce n’est pas un hasard —
              c’est la dose de sirop d’<em>un seul</em> verre, et chaque verre reçoit la même.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche un « ? » : il calcule <strong className="font-mono">sortie ÷ entrée</strong>{' '}
              pour cette colonne. Fais-en trois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et sur la piscine ?',
      subtitle: 'La même opération, sur la situation qui ne doublait pas.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <RatioLab
            rule={PISCINE}
            inputs={INPUTS}
            revealed={rev2}
            onReveal={(x) => push(setRev2, rev2)(x, kit.react)}
          />
          {done2 ? (
            <Feedback tone="ok">
              Cette fois, les rapports <strong>ne tombent jamais deux fois sur le même nombre</strong>.
              La piscine n’a donc aucun nombre unique qui la résume : elle n’est pas
              proportionnelle, et le calcul le montre — pas seulement le doublement.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Dévoile trois colonnes ici aussi. Obtiens-tu le même nombre à chaque fois ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le nombre a un nom',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Deux manipulations viennent de produire le constat : le mot
              arrive maintenant, et il nomme quelque chose de déjà vu. */}
          <KnowledgeBrick
            id="coefficient-proportionnalite"
            variant="new"
            lead={<>Le nombre que tu retrouvais à chaque colonne du sirop porte un nom.</>}
          />
          <KnowledgeBrick id="mem-coefficient" variant="new" compact />
          <NumericQuestion
            prompt={
              <>
                Il faut <strong>2,5 m</strong> de tissu par costume. Quel est le coefficient de
                proportionnalité qui fait passer du nombre de costumes au tissu ?
              </>
            }
            expected={2.5}
            parse={parseDec}
            suffix="m par costume"
            requires={['coefficient-proportionnalite']}
            explain="Le coefficient est la sortie pour UNE entrée : 2,5 m pour 1 costume. On le retrouve à chaque colonne, par exemple 10 m ÷ 4 costumes = 2,5."
            explainFor={(n) =>
              n === 25
                ? '2,5 et 25 ne sont pas le même nombre : attention à la virgule. Pour 1 costume, il faut 2,5 m.'
                : 'Le coefficient de proportionnalité se lit sur UNE unité : le tissu qu’il faut pour un seul costume, soit 2,5 m.'
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Dans les deux sens',
      subtitle: 'Le coefficient de proportionnalité sert à monter… et à redescendre.',
      done: q4,
      content: (
        <div className="space-y-3">
          <RatioLab rule={TISSU} inputs={[1, 4, 6]} revealed={[1, 4, 6]} onReveal={() => {}} />
          <TapQuestion
            prompt={
              <>
                Il reste <strong>15 m</strong> de tissu. Combien de costumes peut-on tailler
                dedans ?
              </>
            }
            options={['6 costumes', '37,5 costumes', '12,5 costumes', '17,5 costumes']}
            cols={4}
            correct={0}
            requires={['coefficient-proportionnalite']}
            explain="Pour remonter de la sortie vers l’entrée, on DIVISE par le coefficient : 15 ÷ 2,5 = 6 costumes."
            explainWrong="37,5 vient d’une multiplication (15 × 2,5). Mais on connaît le tissu et on cherche les costumes : c’est le trajet inverse, donc une division."
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
      moduleTitle="Le nombre qui ne bouge pas"
      moduleSubtitle="Un seul nombre résume toute une situation"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Le test dit oui ou non. Mais quel est le nombre ?',
        tone: 'indigo',
        body: (
          <p>
            Doubler permet de <strong>trancher</strong>, pas de <strong>calculer</strong>. Pour
            trouver n’importe quelle valeur, il faut mettre la main sur le nombre qui fait passer
            d’une grandeur à l’autre. Il est déjà là, caché dans le tableau du sirop.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
