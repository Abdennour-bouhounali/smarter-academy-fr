import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PlotTable from '../components/PlotTable';
import { F4, F4_XS, imageOf } from '../components/fonctionsUtils';

/**
 * Module 4 — MANIPULATION : du tableau à la courbe.
 *
 * Activity               placer soi-même les six points (x ; f(x)) de
 *                        f(x) = x² − 3, puis tracer la courbe à travers eux.
 * Expected observation   « le point de la ligne x = 3 est en (3 ; 6), pas en
 *                        (6 ; 3) » ; « la courbe continue entre les points ».
 * Misconception targeted (y ; x) ; « la courbe s'arrête aux points du tableau ».
 * Formalization          M(x ; y) ∈ C_f ⟺ y = f(x).
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Poser les six points EST la méthode : la brique `methode-tracer-courbe`
 *   arrive donc au bout du geste, pas avant. Puis :
 *     étape 1  six points placés → briques `methode-tracer-courbe` et
 *              `courbe-representative` (l'équivalence, une fois la courbe vue)
 *     étape 2  brique `methode-tester-point` → le test M(1,5 ; −0,75)
 *     étape 3  la même méthode, avec le piège de l'ordre des coordonnées
 *     étape 4  brique `mem-point-sur-courbe`, puis la lecture des deux sens
 *   Le repérage (abscisse, ordonnée, coordonnées) est un acquis de 6e déclaré
 *   en `priorKnowledge` et diagnostiqué au module 0.
 *
 * MANIPULATION JAMAIS GELÉE. Le plan restait `disabled` une fois les six
 * points placés : l'élève ne pouvait plus déplacer un point pour vérifier ce
 * qu'il venait de comprendre. Il reste vivant — seul `showCurve` dépend encore
 * de la réussite, parce que la courbe est la RÉCOMPENSE du geste.
 */
const RANGE = { xMin: -3, xMax: 4, yMin: -4, yMax: 7 };

export default function Module04DuTableauALaCourbe() {
  const [placed, setPlaced] = useState({});
  const [moves, setMoves] = useState({});
  const [active, setActive] = useState(F4_XS[0]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const isOk = (x) => placed[x] && placed[x].x === x && placed[x].y === imageOf(F4, x);
  const done1 = F4_XS.every(isOk);

  const place = (x, p, react) => {
    setPlaced((prev) => ({ ...prev, [x]: p }));
    setMoves((m) => ({ ...m, [x]: (m[x] ?? 0) + 1 }));
    if (p.x === x && p.y === imageOf(F4, x)) {
      react?.(true);
      const next = F4_XS.find((v) => v !== x && !(placed[v] && placed[v].x === v && placed[v].y === imageOf(F4, v)));
      if (next != null) setActive(next);
    }
  };
  const escape = (x, react) => place(x, { x, y: imageOf(F4, x) }, react);

  const steps = [
    {
      num: 1,
      title: 'Place les six points',
      subtitle: 'Choisis une ligne du tableau, puis déplace le point (glisser, ou flèches du clavier) jusqu’en (x ; f(x)).',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PlotTable f={F4} xs={F4_XS} range={RANGE} placed={placed} moves={moves} active={active} onActive={setActive}
            onPlace={(x, p) => place(x, p, kit.react)} onEscape={(x) => escape(x, kit.react)} showCurve={done1} />
          {done1 && (
            <>
              <KnowledgeBrick
                id="methode-tracer-courbe"
                variant="new"
                compact
                lead={<>C’est exactement ce que tu viens de faire, six fois de suite.</>}
              />
              <KnowledgeBrick
                id="courbe-representative"
                variant="new"
                lead={<>La courbe passe par tes six points — et continue entre eux : f(1,5), f(2,7), f(−0,3) existent aussi. Elle porte donc bien plus que le tableau.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Entre deux points du tableau',
      done: q2,
      content: (
        <div className="space-y-3">
        <KnowledgeBrick
          id="methode-tester-point"
          variant="new"
          lead={<>1,5 n’est dans aucune ligne du tableau. Faut-il replacer un point pour savoir si M y est ? Non : l’équivalence ci-dessus suffit.</>}
        />
        <TapQuestion
          prompt={<span>Le point M(1,5 ; −0,75) est-il sur la courbe de <MathText>{'$f(x) = x^2 - 3$'}</MathText> ?</span>}
          requires={['methode-tester-point', 'courbe-representative', 'methode-calculer-image', 'abscisse', 'ordonnee']}
          options={['Oui : f(1,5) = 1,5² − 3 = −0,75, l’ordonnée est bien l’image de l’abscisse', 'Non : 1,5 n’est pas dans le tableau', 'Non : −0,75 n’est pas un nombre entier', 'On ne peut pas le savoir sans le placer']}
          correct={0} cols={1}
          explain="Le test ne demande ni tableau ni dessin : on calcule l’image de l’abscisse. f(1,5) = 2,25 − 3 = −0,75, égale à l’ordonnée : M est sur la courbe."
          explainWrong="La courbe ne s’arrête pas aux points du tableau : tout x a une image. Calcule f(1,5) = 1,5² − 3 = −0,75 ; c’est l’ordonnée de M, donc M est sur la courbe."
          solved={q2} onAnswered={() => setQ2(true)}
        />
        </div>
      ),
    },
    {
      num: 3,
      title: '(6 ; 3) ou (3 ; 6) ?',
      done: q3,
      content: (
        <TapQuestion
          prompt="Le point N(6 ; 3) est-il sur la courbe de f ?"
          requires={['methode-tester-point', 'courbe-representative', 'coordonnees', 'abscisse', 'ordonnee']}
          options={['Non : f(6) = 33 ≠ 3. C’est (3 ; 6) qui est sur la courbe, car f(3) = 6', 'Oui : 3 et 6 sont dans le tableau', 'Oui : f(3) = 6', 'Non : 6 dépasse le tableau']}
          correct={0} cols={1}
          explain="L’ordre des coordonnées compte : (6 ; 3) a pour abscisse 6, et f(6) = 36 − 3 = 33, pas 3. Le point du tableau est (3 ; 6) : abscisse 3, image 6."
          explainWrong="Dans (6 ; 3), l’abscisse est 6. On teste f(6) = 33 ≠ 3 : N n’est pas sur la courbe. Tu penses au point (3 ; 6) — abscisse 3, image 6 — qui, lui, y est."
          solved={q3} onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Lire sur la courbe',
      done: q4,
      content: (
        <div className="space-y-3">
        <KnowledgeBrick
          id="mem-point-sur-courbe"
          variant="new"
          compact
          lead={<>Deux fois de suite, le même réflexe a tranché. À garder.</>}
        />
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Avec la courbe (et l’expression pour vérifier) :</p>}
          requires={['mem-point-sur-courbe', 'courbe-representative', 'image-antecedent', 'methode-lire-image-graphique', 'methode-lire-antecedents-graphique']}
          rows={[
            { id: 'r1', label: 'f(2,5) = ?', options: ['3,25', '2,5', '−0,5'], correct: 0, correction: '2,5² − 3 = 6,25 − 3' },
            { id: 'r2', label: 'Antécédents de 1 ?', options: ['−2 et 2', '2 seulement', '4'], correct: 0, correction: 'la courbe coupe y = 1 deux fois' },
            { id: 'r3', label: 'f(0) = ?', options: ['−3', '0', '3'], correct: 0, correction: 'le point le plus bas' },
            { id: 'r4', label: 'Antécédents de −5 ?', options: ['aucun', '−2', '2'], correct: 0, correction: 'la courbe ne descend pas sous −3' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Une image se lit en montant de l’abscisse jusqu’à la courbe ; les antécédents en partant de l’ordonnée vers la courbe — et il peut n’y en avoir aucun.
            </Feedback>
          )}
          solved={q4} onAnswered={() => setQ4(true)}
        />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Du tableau à la courbe"
      moduleSubtitle="Six points à placer, une courbe à travers, et un test qui ne trompe pas"
      estimatedTime="9 min"
      brief={{ tag: 'Manipulation', title: 'f(x) = x² − 3, six lignes de tableau', tone: 'emerald', body: <p>Chaque ligne du tableau est un point : x en abscisse, f(x) en ordonnée. Place-les — puis la courbe passera par tous.</p> }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          Situation, tableau, courbe, expression : tu as maintenant vu les quatre. Module suivant : passer de l’un à l’autre, et choisir le bon.
        </KnowledgeSnapshot>
      }
    />
  );
}
