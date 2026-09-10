import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import BancDeCartes from '../components/BancDeCartes';
import { assemblage, confronter, CONTRE_EXEMPLE, fr } from '../components/reglesUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : l'usine à dérivées
 * (components/BancDeCartes.jsx).
 *
 * PAS DE COURBE. La leçon amont porte trois laboratoires « courbe + curseur » ;
 * l'objet d'ici est SYMBOLIQUE. Un quatrième repère ne serait qu'un décor.
 *
 * Étape 1  emboîter deux cartes par « + », retourner, constater que la
 *          prédiction naïve COLLE. On ne conclut rien encore.
 * Étape 2  la même chose avec un coefficient devant : ça colle encore.
 * Étape 3  le « × » : la prédiction naïve TOMBE À CÔTÉ, et l'écart est
 *          éclatant (12 contre 4 en x = 2, et il grandit avec x).
 * Étape 4  la question qui ouvre la leçon : que faut-il à la place ?
 *
 * Le module ne donne PAS (uv)′ = u′v + uv′ — c'est le module 3. Il fait
 * CONSTATER l'échec et se termine en DEMANDANT (§6bis.1).
 *
 * CONNAISSANCES AVANT LA DEMANDE. Ordre geste → observation → brique →
 * demande : les étapes 1 à 3 sont des gestes et des constats ; la brique
 * `derivation-ne-se-distribue-pas` est posée à la fin de l'étape 3, APRÈS que
 * les trois assemblages ont été retournés, et AVANT les questions qui l'exigent.
 *
 * MANIPULATION JAMAIS GELÉE : les trois bancs restent pilotables après
 * validation. `disabled` ne porte que le verrou d'ANTÉRIORITÉ. Seuls les
 * `PredictionChips` se figent — une prédiction s'enregistre une fois.
 */
export default function Module01LUsineADerivees() {
  const [g1, setG1] = useState('carre');
  const [d1, setD1] = useState('cube');
  const [ret1, setRet1] = useState(false);

  const [k2, setK2] = useState(3);
  const [ret2, setRet2] = useState(false);

  const [pred, setPred] = useState(null);
  const [x3, setX3] = useState(2);
  const [ret3, setRet3] = useState(false);

  const [q4, setQ4] = useState(false);

  const done1 = ret1;
  const done2 = ret2;
  const done3 = ret3;
  const done4 = q4;

  // Le contre-exemple de l'étape 3, dérivé du modèle — jamais écrit à la main.
  const asm3 = assemblage(CONTRE_EXEMPLE);
  const c3 = confronter(asm3, x3);

  const steps = [
    {
      num: 1,
      title: 'Emboîter, retourner',
      subtitle:
        'Chaque carte porte sa pente au dos. Emboîte deux cartes par un « + », puis retourne l’assemblage : le banc applique le geste naïf — retourner chaque carte et recoller pareil — et le compare à la pente vraiment mesurée.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <BancDeCartes
            gauche={g1}
            droite={d1}
            op="somme"
            x={2}
            onChangeGauche={setG1}
            onChangeDroite={setD1}
            operateursDisponibles={['somme']}
            retourne={ret1}
            onRetourner={() => {
              if (!ret1) kit.react?.(true);
              setRet1(true);
            }}
          />
          {done1 && (
            <Feedback tone="ok">
              Les deux nombres <strong>coïncident</strong>. Change les cartes, retourne encore :
              ça continue de coller. Le « + » se laisse traverser.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et si un nombre multiplie ?',
      subtitle:
        'Même banc, mais la première carte est multipliée par un nombre. Le geste naïf garde ce nombre devant. Retourne, et regarde.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <BancDeCartes
            gauche="carre"
            droite="identite"
            op="somme"
            k={k2}
            x={2}
            onChangeK={setK2}
            coefficients={[2, 3, 5, -4]}
            operateursDisponibles={['somme']}
            retourne={ret2}
            onRetourner={() => {
              if (!ret2) kit.react?.(true);
              setRet2(true);
            }}
            disabled={!done1}
          />
          {done2 && (
            <Feedback tone="ok">
              Ça colle encore, quel que soit le nombre choisi — même négatif. Un nombre qui
              multiplie <strong>traverse</strong> le retournement : il reste devant, inchangé.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le « × » entre deux cartes',
      subtitle:
        'Cette fois les deux cartes sont multipliées l’une par l’autre : x² × x, c’est-à-dire x³. Prédis d’abord, retourne ensuite.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="le geste naïf va-t-il encore coller pour un « × » ?"
            options={[
              { id: 'colle', label: 'Oui, comme pour le « + »' },
              { id: 'rate', label: 'Non, les deux nombres vont différer' },
              { id: 'presque', label: 'Presque : un petit écart d’arrondi' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done3}
          />
          <BancDeCartes
            gauche="carre"
            droite="identite"
            op="produit"
            x={x3}
            onChangeX={setX3}
            operateursDisponibles={['produit']}
            retourne={ret3}
            onRetourner={() => {
              if (!ret3) kit.react?.(true);
              setRet3(true);
            }}
            disabled={!done2}
          />
          {done3 ? (
            <>
              <Feedback tone="ko">
                {pred === 'rate' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde les deux nombres'} :
                en x = 2, le geste naïf annonce <strong>4</strong> alors que la pente mesurée
                vaut <strong>12</strong>. Trois fois plus. Et en x = {fr(x3)}, l’écart vaut{' '}
                <strong>{fr(c3.ecart)}</strong> — déplace le point de mesure : plus tu avances,
                plus la faute grandit. Ce n’est pas un arrondi.
              </Feedback>
              <KnowledgeBrick
                id="derivation-ne-se-distribue-pas"
                variant="new"
                lead={<>Ce que les trois assemblages viennent de montrer, en une phrase. Retourne-les encore en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              x² × x se simplifie en x³ : tu connais déjà sa pente en 2. Retourne l’assemblage et
              compare-la à ce que le geste naïf annonce.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Que faut-il à la place ?',
      done: done4,
      content: (
        <TapQuestion
          prompt="Le geste naïf traverse le « + » et le « × un nombre », mais pas le « × » entre deux fonctions. Qu’est-ce que cela impose ?"
          options={[
            'Qu’un produit de deux fonctions exige sa PROPRE règle, à établir — le geste naïf n’en est pas une',
            'Que l’on ne peut pas dériver un produit du tout',
            'Que le résultat mesuré est faux : c’est l’appareil de mesure qui se trompe',
            'Qu’il faut multiplier le résultat naïf par 3, une fois pour toutes',
          ]}
          correct={0}
          cols={1}
          requires={['derivation-ne-se-distribue-pas']}
          explain="x² × x se dérive bien : sa pente existe et vaut 3x². Ce qui échoue, c’est le GESTE — recoller les deux dos avec le même symbole. Il faut donc découvrir la bonne façon de les recoller."
          explainWrong="La pente existe et se mesure : x³ a bien une pente en chaque point. Et le facteur 3 n’a rien d’universel — il vient de ce couple précis de cartes. Change les cartes et l’écart change."
          solved={done4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’usine à dérivées"
      moduleSubtitle="Des cartes qui portent leur pente au dos, et un geste qui ne passe pas partout"
      estimatedTime="10 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Retourner l’assemblage',
        tone: 'indigo',
        body: (
          <p>
            Repasser par le taux à chaque fois serait interminable. On voudrait un geste
            mécanique : assembler des fonctions comme des cartes, et retourner l’assemblage.
            Reste à savoir si ce geste tient — pour toutes les façons d’assembler.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Deux chantiers.</strong> D’abord le dos des cartes elles-mêmes : d’où sortent
          2x, 3x², −1/x² ? Module suivant. Puis la bonne façon de recoller un produit : module 3.
        </KnowledgeSnapshot>
      }
    />
  );
}
