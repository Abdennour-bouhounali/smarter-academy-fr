import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SignCountLab from '../components/SignCountLab';
import { fmt, fmtParen, produit, parseRelatif, compterNegatifs } from '../components/operations';

/**
 * Module 3 — MANIPULATION : la parité décide du signe.
 *
 * L'élève retourne le signe des facteurs un par un et voit le signe du produit
 * basculer avec la PARITÉ du compteur, tandis que la valeur absolue ne bouge
 * jamais. Le module isole ainsi le signe comme seule variable — c'est ce qui
 * rend la généralisation à n facteurs évidente, sans appliquer la règle deux
 * par deux.
 *
 * Validation : l'élève doit avoir vu les DEUX parités. Une seule ne montre rien.
 *
 * Ce que ce module ne fait PAS : la division (M4), les priorités (M5).
 */
const DEPART = [-2, 3, -5, 1];

export default function Module03PlusieursFacteurs() {
  const [facteurs, setFacteurs] = useState(DEPART);
  const [pred, setPred] = useState(null);
  const [paritesVues, setParitesVues] = useState(() => new Set([compterNegatifs(DEPART) % 2]));
  const done1 = paritesVues.size >= 2;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const basculer = (i, react) => {
    const next = facteurs.map((f, j) => (j === i ? -f : f));
    setFacteurs(next);
    const p = compterNegatifs(next) % 2;
    const vues = new Set(paritesVues); vues.add(p); setParitesVues(vues);
    if (!done1 && vues.size >= 2) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Retourne les signes, observe le produit',
      subtitle: 'Clique sur un facteur pour changer son signe. Obtiens un nombre pair, puis impair, de facteurs négatifs.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SignCountLab facteurs={facteurs} onToggle={(i) => basculer(i, kit.react)} />
          <PredictionChips
            prompt="Si tu changes le signe d’UN seul facteur, que devient le signe du produit ?"
            options={[
              { id: 'inchange', label: 'Il ne change pas' },
              { id: 'bascule', label: 'Il bascule' },
              { id: 'depend', label: 'Ça dépend du facteur choisi' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'bascule' ? 'Ta prédiction était la bonne' : 'Voilà ce qui se passe'} : changer
              un seul signe fait basculer la <strong>parité</strong> du compteur, donc le signe du
              produit — et la <strong>valeur</strong>, elle, ne bouge jamais. Peu importe{' '}
              <em>quel</em> facteur tu retournes : seul leur <strong>nombre</strong> compte.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tu as vu {paritesVues.size} parité sur 2. Change un signe pour obtenir l’autre cas.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Prévoir le signe sans calculer',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* La bascule vient d'être provoquée quatre fois : on peut nommer
              la parité avant la question qui l'exige. */}
          <KnowledgeBrick
            id="parite-facteurs"
            variant="new"
            lead={<>Tu viens de faire basculer le signe en changeant un seul facteur, sans jamais toucher à la valeur. La règle tient en un mot.</>}
          />
          <KnowledgeBrick
            id="mem-parite"
            variant="new"
            compact
            lead={<>La phrase à retenir.</>}
          />
          <TapQuestion
            prompt={`Sans calculer : quel est le signe de ${fmt(-2)} × ${fmtParen(-4)} × ${fmtParen(-1)} × ${fmtParen(-3)} ?`}
            options={[
              'Positif : il y a 4 facteurs négatifs, c’est pair',
              'Négatif : tous les facteurs sont négatifs',
              'Négatif : il y a plus de deux facteurs négatifs',
              'On ne peut pas le savoir sans calculer',
            ]}
            correct={0}
            cols={1}
            requires={['parite-facteurs', 'regle-des-signes']}
            explain={`Quatre facteurs négatifs, et 4 est pair : le produit est positif (il vaut ${produit([-2, -4, -1, -3])}). Ce n’est pas « tous négatifs » qui compte, c’est la parité de leur nombre.`}
            explainWrong="Attention : « tous les facteurs sont négatifs » ne dit rien à soi seul. Trois facteurs négatifs donneraient un produit négatif, quatre un produit positif — seule la parité tranche."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Calcule un produit de trois facteurs',
      done: q3,
      content: (
        <NumericQuestion
          prompt={`Combien fait ${fmt(-2)} × ${fmtParen(5)} × ${fmtParen(-3)} ?`}
          expected={produit([-2, 5, -3])}
          parse={parseRelatif}
          display={fmt(produit([-2, 5, -3]))}
          requires={['parite-facteurs', 'regle-des-signes']}
          explain={`Les valeurs d’abord : 2 × 5 × 3 = 30. Le signe ensuite : deux facteurs négatifs, c’est pair, donc positif. Résultat : ${fmt(produit([-2, 5, -3]))}.`}
          explainFor={(n) => (n === -30
            ? <>La valeur est juste, mais il y a <strong>deux</strong> facteurs négatifs — un nombre pair — donc le produit est positif.</>
            : n === 0
              ? <>Aucun facteur n’est nul ici : le produit ne peut pas valoir 0.</>
              : null)}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Plusieurs facteurs"
      moduleSubtitle="Compter suffit"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Quatre facteurs, un seul compteur',
        tone: 'indigo',
        body: (
          <p>
            Avec trois ou quatre facteurs, appliquer la règle deux par deux devient long. Il existe
            un raccourci — et tu vas le trouver en retournant des signes.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
