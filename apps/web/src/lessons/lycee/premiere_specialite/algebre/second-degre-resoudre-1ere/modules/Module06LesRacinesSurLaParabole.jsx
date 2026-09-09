import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TrinomePlot from '../components/TrinomePlot';
import { discriminant, roots, vertex, fr, trinomeText } from '../components/quadUtils';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : lire Δ sur un dessin (P5).
 *
 * Étape 1  trois dessins, trois signes de Δ, aucun calcul. C'est la boucle
 *          fermée du module 1 : ce que l'élève avait VU, il sait maintenant le
 *          NOMMER.
 * Étape 2  le sens inverse : Δ connu, prédire le dessin.
 * Étape 3  la conception erronée du sommet. Le point le plus bas de la courbe
 *          n'est PAS une racine, sauf quand Δ = 0. Sur x² − 3x + 2, le sommet
 *          est en (1,5 ; −0,25) alors que les racines valent 1 et 2 : l'élève
 *          voit les trois points distincts.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 lecture → brique `racines-et-parabole`.
 *
 * PÉRIMÈTRE : on compte des points d'intersection. On ne dit RIEN du signe du
 * trinôme sur un intervalle, ni d'une inéquation — leçon voisine.
 */
export default function Module06LesRacinesSurLaParabole() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  // Deux racines, tourné vers le bas : −x² + 4x − 3, racines 1 et 3.
  const DEUX = { id: 'g1', a: -1, b: 4, c: -3 };
  // Aucune racine, entièrement au-dessus : x² − 4x + 7, sommet (2 ; 3).
  const AUCUNE = { id: 'g2', a: 1, b: -4, c: 7 };
  // Le sommet n'est pas une racine : x² − 3x + 2, sommet (1,5 ; −0,25).
  const SOMMET = { id: 'g3', a: 1, b: -3, c: 2 };

  const vS = vertex(SOMMET.a, SOMMET.b, SOMMET.c);
  const rS = roots(SOMMET.a, SOMMET.b, SOMMET.c);

  const steps = [
    {
      num: 1,
      title: 'Compter les points, conclure sur Δ',
      subtitle: 'Aucun calcul : regarde combien de fois la courbe rencontre l’axe horizontal.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-[13px] font-semibold text-slate-700 text-center">
                Courbe A — {trinomeText(DEUX.a, DEUX.b, DEUX.c)}
              </div>
              <TrinomePlot trinome={DEUX} montrerSommet={false} unit={30} />
            </div>
            <div className="space-y-1">
              <div className="text-[13px] font-semibold text-slate-700 text-center">
                Courbe B — {trinomeText(AUCUNE.a, AUCUNE.b, AUCUNE.c)}
              </div>
              <TrinomePlot trinome={AUCUNE} montrerSommet={false} unit={30} />
            </div>
          </div>
          <TapQuestion
            prompt="Que peut-on dire du signe de Δ pour chacune de ces deux courbes ?"
            options={[
              'A : Δ > 0 (deux points sur l’axe) — B : Δ < 0 (aucun point sur l’axe)',
              'A : Δ < 0 — B : Δ > 0',
              'Les deux ont Δ > 0 : elles ont chacune une forme de courbe complète',
              'On ne peut rien dire sans calculer Δ pour chacune',
            ]}
            correct={0}
            cols={1}
            requires={['points-axe-abscisses', 'un-nombre-predit', 'discriminant']}
            explain={`A traverse l’axe en deux points, donc deux racines et Δ > 0 (Δ = ${fr(discriminant(DEUX.a, DEUX.b, DEUX.c))}). B reste entièrement au-dessus, donc aucune racine et Δ < 0 (Δ = ${fr(discriminant(AUCUNE.a, AUCUNE.b, AUCUNE.c))}). Le dessin suffit.`}
            explainWrong="Compte les points de rencontre avec l’axe horizontal, pas l’orientation de la courbe. A en a deux, B n’en a aucun — et c’est exactement ce que dit le signe de Δ."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                A est tournée vers le bas (a &lt; 0) et B vers le haut (a &gt; 0) : cela n’a rien à
                voir avec le nombre de racines. C’est <strong>le nombre de points sur l’axe</strong>{' '}
                qui donne le signe de Δ, jamais l’orientation.
              </Feedback>
              <KnowledgeBrick
                id="racines-et-parabole"
                variant="new"
                lead={<>La correspondance que tu viens d’utiliser, dans les deux sens.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et dans l’autre sens',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="On sait qu’une expression du second degré a un discriminant nul. À quoi ressemble sa courbe ?"
            options={[
              'Elle touche l’axe horizontal en un seul point, sans le traverser — et ce point est son sommet',
              'Elle traverse l’axe horizontal en un seul point',
              'Elle est confondue avec l’axe horizontal',
              'Elle ne rencontre pas l’axe horizontal',
            ]}
            correct={0}
            cols={1}
            requires={['racines-et-parabole', 'trois-cas-selon-delta']}
            explain="Δ = 0 : une seule racine, donc un seul point commun. La courbe s’appuie sur l’axe puis repart du même côté — elle ne le traverse pas. Ce point de contact est le point le plus bas (ou le plus haut) de la courbe."
            explainWrong="« Traverser » suppose de passer d’un côté à l’autre, ce qui exige deux points. Avec Δ = 0 la courbe touche et repart du même côté. Et elle ne peut jamais être confondue avec une droite : son terme en x² l’en empêche."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="ok">
              C’est exactement l’instant que tu as atteint au module 1, à la hauteur où les deux
              points ne faisaient plus qu’un.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le sommet n’est pas une racine',
      subtitle: `Voici la courbe de ${trinomeText(SOMMET.a, SOMMET.b, SOMMET.c)}. Trois points sont marqués : deux en rouge sur l’axe, un en orange plus bas.`,
      done: q3a && q3b,
      content: (
        <div className="space-y-3">
          <TrinomePlot trinome={SOMMET} />
          <TapQuestion
            prompt={`Le point le plus bas de cette courbe est en (${fr(vS.x)} ; ${fr(vS.y)}). Est-ce une racine ?`}
            options={[
              `Non : son ordonnée vaut ${fr(vS.y)}, qui n’est pas nulle. Les racines sont ${fr(rS[0])} et ${fr(rS[1])}, sur l’axe`,
              `Oui : ${fr(vS.x)} est une racine, puisque c’est le point le plus bas`,
              'Oui, c’est même la seule racine',
              'On ne peut pas le savoir sans calculer Δ',
            ]}
            correct={0}
            cols={1}
            requires={['racine-trinome', 'racines-et-parabole']}
            explain={`Une racine est l’abscisse d’un point posé SUR l’axe, donc d’ordonnée nulle. Le point le plus bas a pour ordonnée ${fr(vS.y)} : il est sous l’axe, ce n’est pas une racine. Vérification : en x = ${fr(vS.x)}, l’expression vaut ${fr(vS.y)} et non 0.`}
            explainWrong={`« Le plus bas » et « sur l’axe » sont deux choses différentes. Ici le point le plus bas est SOUS l’axe (ordonnée ${fr(vS.y)}), et la courbe traverse l’axe de part et d’autre, en ${fr(rS[0])} et ${fr(rS[1])}.`}
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          <TapQuestion
            prompt="Dans quel cas le point le plus bas d’une courbe tournée vers le haut EST-il une racine ?"
            options={[
              'Quand Δ = 0 : le point de contact est alors posé exactement sur l’axe',
              'Jamais : le point le plus bas est toujours sous l’axe',
              'Toujours, dès que la courbe rencontre l’axe',
              'Quand Δ < 0',
            ]}
            correct={0}
            cols={1}
            requires={['racines-et-parabole', 'trois-cas-selon-delta']}
            explain="Δ = 0 est précisément le cas où la courbe touche l’axe en un point unique, et ce point est son sommet. Dans les deux autres cas, le point le plus bas est strictement sous l’axe (Δ > 0) ou strictement au-dessus (Δ < 0)."
            explainWrong="Avec Δ > 0 la courbe traverse : son point le plus bas est SOUS l’axe, entre les deux racines. Avec Δ < 0 elle ne le rencontre pas du tout. Reste le cas Δ = 0."
            solved={q3b}
            onAnswered={() => setQ3b(true)}
          />
          {q3a && q3b && (
            <Feedback tone="ok">
              Trois points, trois rôles : deux racines sur l’axe, un sommet ailleurs. Ils ne se
              confondent que dans le cas Δ = 0 — celui de la fusion.
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
      moduleTitle="Les racines sur la parabole"
      moduleSubtitle="Compter des points, et lire le signe de Δ sans calculer"
      estimatedTime="8 min"
      brief={{
        tag: 'Entraînement',
        title: 'Le dessin répond aussi',
        tone: 'indigo',
        body: (
          <p>
            Tout ce que Δ annonce se voit sur la courbe, et tout ce que la courbe montre se lit
            dans le signe de Δ. C’est la boucle refermée depuis le premier module.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tout est en place.</strong> Calculer Δ, résoudre dans les trois cas, factoriser,
          lire une courbe : la mission finale te demande les quatre.
        </KnowledgeSnapshot>
      }
    />
  );
}
