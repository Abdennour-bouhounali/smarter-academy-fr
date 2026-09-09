import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AireLab from '../components/AireLab';

/**
 * Module 4 — MANIPULATION : la double distributivité.
 *
 * Activity              régler les deux dimensions d'un rectangle dont les
 *                       DEUX côtés sont des sommes, et compter les morceaux.
 * Mathematical objective (a + b)(c + d) donne QUATRE produits, un par
 *                       morceau. Le nombre de morceaux n'est pas une règle à
 *                       mémoriser : c'est ce que produit un découpage en
 *                       deux dans chaque direction.
 * Expected observation  « couper les deux côtés fait quatre morceaux, pas
 *                       deux » — et « les deux morceaux du milieu se
 *                       ressemblent, ils se regroupent ».
 * Misconception targeted « (x + 3)(x + 2) = x² + 6 » : ne multiplier que les
 *                       premiers termes entre eux et les seconds entre eux.
 *                       Les deux morceaux manquants sont visibles à l'écran.
 *
 * Le terme en x² apparaît nécessairement au tableau. Il n'est PAS un objet
 * d'étude de 4e (pas d'identités remarquables, pas d'équations du second
 * degré) : la leçon l'écrit, le nomme « le carré », et s'arrête là.
 */
export default function Module04CouperLesDeuxCotes() {
  const [b, setB] = useState(2);
  const [d, setD] = useState(3);
  const [essais, setEssais] = useState(0);
  const explore = essais >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const compter = (kit) => {
    const n = essais + 1;
    setEssais(n);
    if (n === 3) kit.react(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Coupe les deux côtés',
      subtitle: 'Cette fois, la hauteur ET la largeur sont des sommes. Combien de morceaux obtiens-tu ?',
      done: explore,
      content: (kit) => (
        <div className="space-y-3">
          <AireLab
            mode="double"
            b={b}
            d={d}
            onB={(v) => { setB(v); compter(kit); }}
            onD={(v) => { setD(v); compter(kit); }}
          />
          {explore ? (
            <Feedback tone="ok">
              <strong>Quatre</strong> morceaux, toujours — un découpage en deux dans chaque
              direction en produit forcément quatre. Et regarde les deux morceaux en diagonale :
              ils contiennent tous deux des <strong>x</strong>, ce sont des termes semblables. Ils
              se regroupent : <MathText>{`$${b}x + ${d}x = ${b + d}x$`}</MathText>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Change les deux constantes et compte les morceaux à chaque fois. Que vaut chacun ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Développe un produit de deux sommes',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="double-distributivite"
            variant="new"
            lead={<>Quatre morceaux, donc quatre produits : chaque terme de la première parenthèse rencontre chaque terme de la seconde.</>}
          />
          <TapQuestion
            prompt={<span>Développe et réduis <MathText>{'$(x + 4)(x + 3)$'}</MathText></span>}
            options={[
              <MathText key="a">{'$x^2 + 12$'}</MathText>,
              <MathText key="b">{'$x^2 + 7x + 12$'}</MathText>,
              <MathText key="c">{'$x^2 + 7x$'}</MathText>,
              <MathText key="d">{'$2x + 7$'}</MathText>,
            ]}
            correct={1}
            cols={2}
            requires={['double-distributivite', 'termes-semblables']}
            correctionLabel="x² + 7x + 12"
            explain="Les quatre produits : x × x = x², x × 3 = 3x, 4 × x = 4x, 4 × 3 = 12. On réduit ensuite les deux termes semblables : 3x + 4x = 7x. Résultat : x² + 7x + 12."
            explainWrong="x² + 12 ne garde que les deux morceaux des coins et oublie les deux du milieu — ceux qui contiennent les x. Sur la figure, ce sont deux rectangles bien visibles, ils ont une aire."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Compte les morceaux',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <span>
                Dans le développement de <MathText>{'$(x + 5)(x + 2)$'}</MathText>, quel est le
                coefficient de x après réduction ?
              </span>
            }
            expected={7}
            requires={['double-distributivite', 'termes-semblables']}
            explain="Les deux morceaux du milieu valent 2x et 5x : ensemble, 7x. (Le résultat complet est x² + 7x + 10.)"
            explainFor={(n) =>
              n === 10
                ? "10 est le produit des deux constantes (5 × 2) : c’est le nombre seul du résultat, pas le coefficient de x. Celui-ci vient des deux morceaux du milieu, 5x et 2x."
                : "Les deux morceaux en diagonale donnent x × 2 = 2x et 5 × x = 5x. Leur somme donne 7x."
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Couper les deux côtés"
      moduleSubtitle="Deux sommes, quatre morceaux"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Et si les deux côtés se coupent ?',
        tone: 'indigo',
        body: (
          <p>
            Tu sais développer quand <strong>un</strong> côté est une somme. Que se passe-t-il si
            les <strong>deux</strong> le sont ? Le rectangle va te le dire mieux qu’une formule.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
