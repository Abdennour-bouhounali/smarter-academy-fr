import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AireLab from '../components/AireLab';

/**
 * Module 3 — MANIPULATION : la distributivité, lue sur l'aire d'un rectangle.
 *
 * Activity              régler la hauteur et la largeur d'un rectangle dont
 *                       un côté est une somme, et lire son aire de deux
 *                       façons.
 * Mathematical objective k(a + b) = ka + kb n'est pas une règle à retenir :
 *                       c'est le constat que la MÊME aire se calcule de deux
 *                       façons. Le facteur multiplie chaque morceau parce
 *                       que chaque morceau a bien cette hauteur.
 * Expected observation  « je peux couper où je veux, l'aire ne change pas » —
 *                       et « le morceau de droite existe, il a une aire ».
 * Misconception targeted « 3(x + 2) = 3x + 2 » : oublier de distribuer sur le
 *                       second terme. Le morceau oublié est littéralement
 *                       visible, avec son aire écrite dedans.
 *
 * Le module 2 était nécessaire avant celui-ci : tout développement se termine
 * par une réduction, et il fallait d'abord savoir réduire.
 */
export default function Module03LAireQuiDeveloppe() {
  const [k, setK] = useState(3);
  const [b, setB] = useState(2);
  const [essais, setEssais] = useState(0);
  const explore = essais >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const compter = (kit) => {
    const n = essais + 1;
    setEssais(n);
    if (n === 3) kit.react(true);
  };

  const steps = [
    {
      num: 1,
      title: 'La même aire, deux calculs',
      subtitle: 'Change la hauteur et la largeur. Regarde les deux écritures sous le rectangle.',
      done: explore,
      content: (kit) => (
        <div className="space-y-3">
          <AireLab
            mode="simple"
            k={k}
            b={b}
            onK={(v) => { setK(v); compter(kit); }}
            onB={(v) => { setB(v); compter(kit); }}
          />
          {explore ? (
            <Feedback tone="ok">
              À chaque réglage, les deux écritures donnent la même aire :{' '}
              <MathText>{`$${k}(x + ${b}) = ${k === 1 ? 'x' : `${k}x`} + ${k * b}$`}</MathText>. Ce
              n’est pas une règle qu’on décide : c’est <strong>une seule aire</strong>, calculée
              d’un bloc ou morceau par morceau. Et remarque bien : le morceau de droite vaut{' '}
              <strong>{k} × {b} = {k * b}</strong>, pas {b} — il a lui aussi la hauteur {k}.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie deux ou trois réglages. Compare l’écriture avec parenthèses et l’écriture en
              deux morceaux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Développe sans la figure',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="distributivite-simple"
            variant="new"
            lead={<>Les deux écritures que tu viens de comparer sont toujours égales, pour n’importe quelle hauteur et n’importe quelle largeur. C’est une règle générale.</>}
          />
          <TapQuestion
            prompt={<span>Développe <MathText>{'$5(x + 4)$'}</MathText></span>}
            options={[
              <MathText key="a">{'$5x + 4$'}</MathText>,
              <MathText key="b">{'$5x + 20$'}</MathText>,
              <MathText key="c">{'$5x + 9$'}</MathText>,
              <MathText key="d">{'$9x$'}</MathText>,
            ]}
            correct={1}
            cols={4}
            requires={['distributivite-simple']}
            correctionLabel="5x + 20"
            explain="Le 5 multiplie les DEUX termes : 5 × x = 5x et 5 × 4 = 20. Sur la figure, le second morceau mesurerait 5 de haut sur 4 de large, donc 20."
            explainWrong="C’est l’erreur la plus fréquente : oublier de multiplier le second terme. 5x + 4 correspondrait à un rectangle dont le morceau de droite n’aurait qu’une hauteur de 1 — alors qu’il a la même hauteur que l’autre."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand le facteur est négatif',
      subtitle: 'Le signe se distribue lui aussi — sur les deux termes.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Développe <MathText>{'$-2(x - 5)$'}</MathText></span>}
            options={[
              <MathText key="a">{'$-2x - 10$'}</MathText>,
              <MathText key="b">{'$-2x + 10$'}</MathText>,
              <MathText key="c">{'$-2x - 5$'}</MathText>,
              <MathText key="d">{'$2x + 10$'}</MathText>,
            ]}
            correct={1}
            cols={2}
            requires={['distributivite-simple', 'regle-des-signes']}
            correctionLabel="−2x + 10"
            explain="−2 × x = −2x, et −2 × (−5) = +10 : deux facteurs négatifs donnent un produit positif. Le second terme change donc de signe."
            explainWrong="Attention au second produit : −2 × (−5) fait +10, pas −10. C’est la règle des signes, exactement comme sur les nombres."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Développer puis réduire',
      subtitle: 'Un développement se termine toujours par un rangement.',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <span>
                Développe et réduis <MathText>{'$3(x + 2) + 4x$'}</MathText>. Quel est le
                coefficient de x dans le résultat ?
              </span>
            }
            expected={7}
            requires={['distributivite-simple', 'termes-semblables']}
            explain="3(x + 2) = 3x + 6, puis on ajoute 4x : 3x + 4x = 7x, et le 6 reste seul. Le résultat est 7x + 6."
            explainFor={(n) =>
              n === 3
                ? "Tu t’es arrêté au développement : il reste à REGROUPER les termes semblables, 3x et 4x, ce qui donne 7x."
                : "Développe d’abord la parenthèse (3x + 6), puis regroupe les x : 3x + 4x = 7x."
            }
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
      moduleTitle="L’aire qui développe"
      moduleSubtitle="Une aire, deux façons de la calculer"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Couper un rectangle',
        tone: 'indigo',
        body: (
          <p>
            Un rectangle dont un côté est une <strong>somme</strong> peut se calculer d’un bloc, ou
            morceau par morceau. Les deux doivent donner la même chose — et c’est de là que va
            sortir toute la règle.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
