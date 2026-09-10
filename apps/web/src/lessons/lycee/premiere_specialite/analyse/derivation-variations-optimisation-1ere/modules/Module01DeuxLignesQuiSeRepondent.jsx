import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DeuxPanneaux from '../components/DeuxPanneaux';
import { CUBE, etatSonde, aVuLesDeuxBascules, tableauDeSignes, fr } from '../components/variationsUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : deux lignes qui se
 * répondent (components/DeuxPanneaux.jsx).
 *
 * Étape 1  promener la sonde et RELEVER les trois zones : à gauche la pastille
 *          du bas est au-dessus de l'axe et la flèche du haut monte ; au milieu
 *          elle passe en dessous et la flèche descend ; à droite elle repasse
 *          au-dessus. L'objectif ne tombe qu'une fois les TROIS zones visitées
 *          (`aVuLesDeuxBascules`) : c'est la SUITE des relevés qui fait la
 *          découverte, pas un relevé isolé.
 * Étape 2  poser la sonde EXACTEMENT sur une bascule — atteignable parce que
 *          −1 et 1 tombent sur un cran (verrouillé par le test « CIBLE
 *          ATTEIGNABLE »). Là, la pastille du bas est SUR l'axe et la flèche du
 *          haut n'est ni ↗ ni ↘.
 * Étape 3  la question qui compte : les deux basculent-elles au même endroit,
 *          et pourquoi ?
 *
 * CE MODULE NE NOMME RIEN. Ni « le signe de la dérivée donne les variations »,
 * ni « tableau ». Il fait CONSTATER la synchronisation et se termine en
 * DEMANDANT pourquoi les deux basculent ensemble (§6bis.1) — le module 2
 * répondra. Il ne pose donc AUCUNE brique : la première brique de la leçon est
 * posée au module 2, à l'instant où la synchronisation reçoit son nom.
 *
 * DISTINCTION AVEC LA LEÇON AMONT. Dans `derivation-nombre-derive-1ere` M1,
 * l'élève contrôlait h en un point FIXE. Ici h a disparu : c'est le POINT qui
 * se promène, et ce qu'on regarde n'est plus une colonne de pentes mais la
 * réponse d'un panneau à l'autre.
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire reste pilotable une fois l'étape
 * validée : `disabled` ne porte que le verrou d'ANTÉRIORITÉ de l'étape 2 sur
 * l'étape 1. Seuls les `PredictionChips` se figent — une prédiction
 * s'enregistre une fois, avant la révélation.
 */
const { lignes: ZONES } = tableauDeSignes(CUBE);

export default function Module01DeuxLignesQuiSeRepondent() {
  const [x1, setX1] = useState(CUBE.domain.xMin);
  const [vus1, setVus1] = useState([CUBE.domain.xMin]);
  const [pred, setPred] = useState(null);
  // Le figeage de la PRÉDICTION porte son propre nom : une prédiction
  // s'enregistre une fois, avant la révélation (§9). Il ne gèle QUE la
  // prédiction — jamais le laboratoire, qui reste pilotable ensuite.
  const [predFigee, setPredFigee] = useState(false);
  const [x2, setX2] = useState(CUBE.domain.xMin);
  const [surZero, setSurZero] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = aVuLesDeuxBascules(CUBE, vus1);
  const done2 = surZero;
  const done3 = q3;

  const bouger1 = (v, react) => {
    setX1(v);
    if (vus1.includes(v)) return;
    const suivant = [...vus1, v];
    setVus1(suivant);
    if (!done1 && aVuLesDeuxBascules(CUBE, suivant)) react?.(true);
  };

  const bouger2 = (v, react) => {
    setX2(v);
    // La cible est un ZÉRO EXACT de f′, et le pas de la sonde garantit qu'on
    // peut s'y poser au cran près : la consigne est donc réalisable.
    if (!surZero && CUBE.zeros.some((z) => Math.abs(z - v) < 1e-9)) {
      setSurZero(true);
      react?.(true);
    }
  };

  // Combien des trois zones de signe l'élève a-t-il déjà relevées ?
  const zonesVues = ZONES.filter((l) => vus1.some((v) => v > l.from - 1e-9 && v < l.to + 1e-9 && Math.sign(CUBE.fPrime(v)) === l.sign)).length;

  const e2 = etatSonde(CUBE, x2);

  const steps = [
    {
      num: 1,
      title: 'Une sonde, deux panneaux',
      subtitle:
        'La même sonde traverse les deux panneaux. Attrape-la — dans le panneau du haut ou dans celui du bas, c’est la même — et fais-la glisser de la gauche vers la droite. Relève à chaque fois où se trouve la pastille du bas et dans quel sens pointe la flèche du haut. Traverse les trois zones.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DeuxPanneaux
            fn={CUBE}
            x={x1}
            onChangeX={(v) => bouger1(v, kit.react)}
            visites={vus1}
            montrerBandes={false}
          />
          {done1 ? (
            <Feedback tone="ok">
              Trois zones, trois relevés concordants. À gauche de <strong>−1</strong> la pastille du
              bas est au-dessus de l’axe et la flèche du haut monte. Entre <strong>−1</strong> et{' '}
              <strong>1</strong> la pastille passe en dessous et la flèche descend. À droite
              de <strong>1</strong> elle repasse au-dessus, et la flèche remonte. Les deux
              changent aux mêmes endroits.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Zones relevées : {zonesVues} sur {ZONES.length}. Il en reste à traverser — la sonde
              doit passer de part et d’autre des deux endroits où la courbe du bas coupe l’axe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pose la sonde sur une bascule',
      subtitle:
        'Fais glisser la sonde jusqu’à l’endroit exact où la courbe du BAS coupe l’axe — elle s’aimante sur les crans, tu ne peux pas le manquer. Regarde alors la flèche du haut, et l’allure de la courbe du haut à cet endroit.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="quand la pastille du bas est exactement SUR l’axe, que fait la courbe du haut ?"
            options={[
              { id: 'monte', label: 'Elle continue de monter' },
              { id: 'plat', label: 'Elle est un instant plate, au moment de se retourner' },
              { id: 'coupe', label: 'Elle coupe l’axe des abscisses elle aussi' },
            ]}
            value={pred}
            onChange={(v) => { setPred(v); setPredFigee(true); }}
            disabled={predFigee}
          />
          <DeuxPanneaux
            fn={CUBE}
            x={x2}
            onChangeX={(v) => bouger2(v, kit.react)}
            montrerBandes={done2}
            disabled={!done1}
          />
          {done2 ? (
            <Feedback tone="ok">
              {pred === 'plat' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde les deux panneaux'} :
              en x = {fr(e2.x)} la pastille du bas est <strong>{e2.position}</strong>, et en haut la
              courbe est un instant <strong>plate</strong> — elle vient de finir de monter et
              s’apprête à descendre. Les bandes de couleur sont maintenant peintes : elles viennent
              du panneau <strong>du bas</strong>, et pourtant elles découpent aussi le haut.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cherche l’endroit où la courbe du bas croise l’axe — il y en a deux. Chaque cran de la
              sonde peut s’y poser exactement.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Pourquoi les deux basculent-elles ensemble ?',
      done: done3,
      content: (
        <div className="space-y-3">
          <DeuxPanneaux fn={CUBE} x={-1} onChangeX={() => {}} montrerBandes disabled />
          <TapQuestion
            prompt="Les deux panneaux ne changent jamais l’un sans l’autre. Quelle explication rend cela inévitable, plutôt qu’une coïncidence de dessin ?"
            options={[
              'La courbe du bas donne, en chaque x, la PENTE de la courbe du haut : une pente positive fait forcément monter, une pente négative fait forcément descendre',
              'Les deux courbes ont été tracées avec la même échelle, ce qui les fait changer ensemble',
              'La courbe du bas est la courbe du haut décalée vers le bas',
              'C’est une propriété particulière de cette fonction-là, qui ne se reproduit pas ailleurs',
            ]}
            correct={0}
            cols={1}
            requires={['nombre-derive', 'derive-coefficient-directeur', 'pente']}
            explain="La courbe du bas est celle de f′, et f′(x) est la pente de la tangente en x — c’est ce que la leçon précédente a établi. Une pente positive fait monter la courbe, une pente négative la fait descendre : la synchronisation n’est donc pas une coïncidence, c’est une conséquence. Le module suivant en fait une règle, et lui ajoute une réserve."
            explainWrong="Ce n’est ni une affaire d’échelle ni un décalage : la courbe du bas ne ressemble pas du tout à celle du haut. Souviens-toi de ce que vaut f′(x) : c’est la pente de la tangente en x. Une pente, ça dit dans quel sens on monte."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Deux lignes qui se répondent"
      moduleSubtitle="Une sonde, deux panneaux, et des bascules qui tombent au même endroit"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Que se passe-t-il en haut quand la ligne du bas traverse l’axe ?',
        tone: 'indigo',
        body: (
          <p>
            Deux panneaux superposés, alignés sur le même axe des abscisses : en haut une fonction,
            en bas sa dérivée. Une seule sonde les traverse : attrape-la et fais-la glisser, puis
            regarde ce que l’une fait pendant que l’autre change.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La question qui reste.</strong> Tu as constaté que le signe du bas et le sens de
          marche du haut basculent ensemble. Le module suivant en fait une règle utilisable — et
          montre qu’une dérivée qui s’annule ne suffit pas toujours à retourner la courbe.
        </KnowledgeSnapshot>
      }
    />
  );
}
