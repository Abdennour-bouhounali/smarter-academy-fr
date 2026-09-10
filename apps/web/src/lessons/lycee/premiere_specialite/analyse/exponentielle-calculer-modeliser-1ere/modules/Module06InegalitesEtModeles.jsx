import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import LaboModele from '../components/LaboModele';
import {
  INEQUATIONS, resoudreInequationExp, SITUATIONS, modele, facteurParPas,
  valeurAffichee, parseSigned, fr, arrondi,
} from '../components/reglesExpoUtils';

/**
 * Module 6 — ATELIER : les inéquations (P5), puis la modélisation (P6).
 *
 * Étape 1  LE SENS SE CONSERVE. Le même argument qu'au module 5 — la stricte
 *          croissance — donne un peu plus : elle CONSERVE l'ordre. Le passage
 *          aux exposants ne renverse jamais le sens. Brique
 *          `inegalite-sens-conserve`.
 * Étape 2  LES DEUX MOMENTS. Le sens peut bouger, mais PLUS LOIN : quand on
 *          divise par un nombre négatif, dans la résolution du premier degré.
 *          Le module ne confond pas les deux, et le test vérifie qu'un tel cas
 *          existe et est atteignable (`sensInverseALaDivision`).
 * Étape 3  MODÉLISER. L'élève fait glisser un point de lecture le long d'une
 *          courbe réelle et constate que le QUOTIENT d'un pas au suivant ne
 *          bouge jamais — c'est la règle du quotient en action. Briques
 *          `modele-exponentiel` et `facteur-constant`.
 * Étape 4  la seconde situation, décroissante : le signe de k suffit à trancher.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 rappel du geste du module 5 → brique
 * `inegalite-sens-conserve` ; étape 3 geste → briques `modele-exponentiel` et
 * `facteur-constant` ; étapes 2 et 4 les demandes.
 *
 * MANIPULATION JAMAIS GELÉE : les deux laboratoires restent pilotables après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 4 sur l'étape 3.
 */
export default function Module06InegalitesEtModeles() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [t3, setT3] = useState(0);
  const [vus3, setVus3] = useState([0]);
  const [q4, setQ4] = useState(false);
  const [t5, setT5] = useState(0);
  const [q5, setQ5] = useState(false);

  const croissance = SITUATIONS[0];
  const decroissance = SITUATIONS[1];

  const ineqFacile = INEQUATIONS[1];   // e^{2x+1} < e^{x+4}, borne 3, sens <
  const ineqDure = INEQUATIONS[2];     // e^{-x} < e^{x-4}, borne 2, sens >
  const resFacile = resoudreInequationExp(ineqFacile);
  const resDure = resoudreInequationExp(ineqDure);

  // Trois instants lus : un seul ne montrerait pas que le facteur est constant.
  const done3 = vus3.length >= 3;

  const noter3 = (v, react) => {
    setT3(v);
    if (vus3.includes(v)) return;
    const suivant = [...vus3, v];
    setVus3(suivant);
    if (!done3 && suivant.length >= 3) react?.(true);
  };

  const fCroissance = modele(croissance.A, croissance.k);
  const facteurCroissance = facteurParPas(croissance.k);
  const facteurDecroissance = facteurParPas(decroissance.k);

  const steps = [
    {
      num: 1,
      title: 'Le même argument, pour une inégalité',
      subtitle:
        'Au module précédent, la stricte croissance a donné « deux hauteurs égales, deux exposants égaux ». Elle donne davantage.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-amber-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              Une fonction strictement croissante range les nombres dans le <strong>même
              ordre</strong> : le plus petit exposant donne toujours la plus petite valeur. C’est
              exactement ce que montrait le laboratoire — quand M était à gauche de N, sa hauteur
              était plus basse.
            </p>
          </div>
          <TapQuestion
            prompt="On sait que e^u < e^v. Que peut-on écrire sur u et v ?"
            options={[
              'u < v : le sens se conserve',
              'u > v : le sens s’inverse',
              'u < v ou u > v, on ne peut pas trancher',
              'u = v',
            ]}
            correct={0}
            cols={2}
            requires={['exp-strictement-croissante', 'egalite-des-exposants', 'variations']}
            explain="Une fonction croissante conserve l’ordre : si la valeur de gauche est la plus petite, c’est que son exposant l’était aussi. Le sens ne change donc pas au passage aux exposants."
            explainWrong="Le sens ne s’inverserait que pour une fonction DÉCROISSANTE. Or celle-ci monte partout, sans exception — sa dérivée est elle-même, et elle est strictement positive."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                Voilà tout ce qu’il faut pour résoudre : on égale ou l’on compare les exposants, et
                l’on retombe sur une inéquation du premier degré.
              </Feedback>
              <KnowledgeBrick
                id="inegalite-sens-conserve"
                variant="new"
                lead={<>Le sens ne bouge pas au passage aux exposants — et l’on verra tout de suite où il peut bouger.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux moments à ne pas confondre',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 space-y-1.5">
              <div className="font-semibold">Un cas simple</div>
              <MathText>{`$${ineqFacile.enonce}$`}</MathText>
              <p className="text-[13px]">
                Exposants : 2x + 1 &lt; x + 4, donc x &lt; {fr(resFacile.borne)}. Le sens n’a bougé
                à aucun moment.
              </p>
              <p className="text-[13px] font-mono">S = ]−∞ ; {fr(resFacile.borne)}[</p>
            </div>
            <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 text-sm text-rose-900 space-y-1.5">
              <div className="font-semibold">Un cas où le sens bouge</div>
              <MathText>{`$${ineqDure.enonce}$`}</MathText>
              <p className="text-[13px]">
                Exposants : −x &lt; x − 4, donc −2x &lt; −4. En divisant par −2, <strong>le sens
                s’inverse</strong> : x &gt; {fr(resDure.borne)}.
              </p>
              <p className="text-[13px] font-mono">S = ]{fr(resDure.borne)} ; +∞[</p>
            </div>
          </div>
          <TapQuestion
            prompt="Dans le second cas, à quel moment précis le sens de l’inégalité s’est-il inversé ?"
            options={[
              'À la division par −2, une règle du premier degré — jamais au passage aux exposants',
              'Au passage aux exposants, parce que l’un d’eux était négatif',
              'Au passage aux exposants, parce que la fonction change de sens du côté négatif',
              'Il ne s’est pas inversé : les deux ensembles de solutions se valent',
            ]}
            correct={0}
            cols={1}
            requires={['inegalite-sens-conserve', 'methode-resoudre-inequation', 'intervalle-crochets']}
            explain="Deux étapes bien distinctes. La première — passer des valeurs aux exposants — est autorisée par la stricte croissance et conserve TOUJOURS le sens. La seconde — résoudre l’inéquation du premier degré — obéit aux règles de la 2de, et diviser par un nombre négatif y renverse le sens."
            explainWrong="La fonction ne change jamais de sens : elle est strictement croissante sur ℝ tout entier, du côté négatif comme du côté positif. Le renversement vient de la division par −2, et de rien d’autre."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="ok">
              Retenir la frontière : l’exponentielle ne renverse jamais rien. Ce qui renverse, c’est
              une multiplication ou une division par un nombre négatif — une règle que tu appliques
              depuis la 2<sup>de</sup>.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une croissance réelle',
      subtitle:
        'Une culture de bactéries. Attrape le point de lecture et promène-le le long du temps : surveille la colonne de droite.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <LaboModele situation={croissance} t={t3} onChangeT={(v) => noter3(v, kit.react)} />
          {done3 ? (
            <>
              <Feedback tone="ok">
                La valeur change à chaque pas — {fr(arrondi(fCroissance(0), 2))}, puis{' '}
                {fr(arrondi(fCroissance(1), 2))}, puis {fr(arrondi(fCroissance(2), 2))} — mais le
                quotient d’un pas au suivant, lui, ne bouge pas d’un millième :{' '}
                <strong>{valeurAffichee(facteurCroissance)}</strong> à chaque fois. Ce n’est pas une
                coïncidence : c’est la règle du quotient, appliquée à f(t+1)/f(t).
              </Feedback>
              <div className="rounded-xl border border-amber-100 bg-white p-3 text-center text-sm text-slate-700">
                <MathText>{'$$\\dfrac{f(t+1)}{f(t)} = \\dfrac{A\\,e^{k(t+1)}}{A\\,e^{kt}} = e^{k(t+1) - kt} = e^{k}$$'}</MathText>
              </div>
              <KnowledgeBrick
                id="modele-exponentiel"
                variant="new"
                lead={<>La forme du modèle, et ce que son écriture donne directement.</>}
              />
              <KnowledgeBrick
                id="facteur-constant"
                variant="new"
                lead={<>Ce que la colonne de droite répétait sans jamais varier.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Instants lus : {vus3.length} sur 3. Déplace le point d’un pas et compare le quotient
              affiché à celui d’avant.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une décroissance, et le signe qui décide',
      subtitle:
        'Un café qui refroidit. La même forme, un seul nombre changé de signe — et tout le comportement bascule.',
      done: q4,
      content: (
        <div className="space-y-3">
          <LaboModele situation={decroissance} t={t5} onChangeT={setT5} verrouille={!done3} />
          <TapQuestion
            prompt={`Ici k vaut ${fr(decroissance.k)}, et le facteur d’une minute à la suivante vaut environ ${valeurAffichee(facteurDecroissance)}. Que peut-on affirmer sur le long terme ?`}
            options={[
              'La grandeur diminue sans fin, en se rapprochant de 0 sans jamais l’atteindre',
              'Elle diminue jusqu’à atteindre 0, puis devient négative',
              'Elle diminue, puis finit par remonter',
              'Elle atteint 0 exactement au bout de 20 minutes',
            ]}
            correct={0}
            cols={1}
            requires={['modele-exponentiel', 'facteur-constant', 'exp-strictement-positive']}
            explain={`Multiplier sans fin par un facteur compris entre 0 et 1 fait diminuer, mais ne fait jamais atteindre 0 : le résultat reste strictement positif, comme toute valeur de cette fonction. Au bout de ${decroissance.tMax} minutes, il reste encore ${fr(arrondi(modele(decroissance.A, decroissance.k)(decroissance.tMax), 2))} — petit, mais pas nul.`}
            explainWrong="Le facteur est strictement compris entre 0 et 1 : multiplier par lui diminue toujours, mais ne peut jamais donner 0 ni un nombre négatif. Regarde la courbe se coller à l’axe sans jamais le franchir."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Deux situations, deux comportements — et une seule différence dans l’écriture : le
              SIGNE de k. Rien d’autre à retenir pour trancher le sens.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'Lire A sur une situation',
      done: q5,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Une population est modélisée par f(t) = 45 × e^(0,2t), avec t en années. Combien vaut-elle au départ, c’est-à-dire pour t = 0 ?</>}
            expected={45}
            parse={(raw) => parseSigned(raw, parseDec)}
            display="45"
            requires={['modele-exponentiel', 'exponentielle-definition']}
            explain="En t = 0, l’exposant vaut 0 et e⁰ = 1. Il reste donc 45 × 1 = 45. Dans un modèle A·e^(kt), le nombre A se lit directement : c’est la valeur de départ."
            explainFor={(n) =>
              n === 0
                ? 'Non : e⁰ ne vaut pas 0, mais 1. Cette fonction ne prend jamais la valeur 0.'
                : n === 0.2 || n === 9
                ? 'Le nombre 0,2 gouverne la VITESSE de l’évolution, pas la valeur de départ. Celle-ci est le facteur placé devant, ici 45.'
                : null
            }
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="ok">
              Les deux nombres d’un modèle se lisent sans calcul : <strong>A</strong> est la valeur
              de départ, et le <strong>signe de k</strong> donne le sens. Le reste est du calcul avec
              les quatre relations de cette leçon.
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
      moduleTitle="Inégalités et modèles"
      moduleSubtitle="Le sens qui se conserve, et le facteur qui ne bouge pas"
      estimatedTime="8 min"
      brief={{
        tag: 'Atelier',
        title: 'Du symbole à la situation',
        tone: 'indigo',
        body: (
          <p>
            Le même argument qu’au module précédent règle les inégalités — à condition de ne pas
            confondre deux moments. Puis deux situations réelles, où tout se joue sur le signe d’un
            seul nombre.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>Tout est en place.</strong> Quatre relations pour transformer, un argument pour
          résoudre, une forme pour modéliser. Dix épreuves t’attendent.
        </KnowledgeSnapshot>
      }
    />
  );
}
