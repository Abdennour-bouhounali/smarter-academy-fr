import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConstructeurEuler from '../components/ConstructeurEuler';
import { NB_PAS, E, ligneEuler, ecartRelatifFinal, parseSigned, fr, affiche } from '../components/expoUtils';

/**
 * Module 2 — DÉCOUVERTE : ce que l'élève a construit reçoit son nom, sa
 * notation, et la raison pour laquelle il n'y en a qu'une.
 *
 * Étape 1  NOMMER LA PROPRIÉTÉ. La règle du jeu s'écrit f′(x) = f(x). Le geste
 *          du module 1 est reformulé en une ligne de mathématiques, et la brique
 *          `propriete-caracteristique` la porte.
 * Étape 2  NOMMER LA FONCTION, et l'UNICITÉ. Deux exigences, une seule
 *          fonction : exp. La brique `exponentielle-definition` arrive APRÈS
 *          que l'élève ait reconstruit l'argument d'unicité.
 * Étape 3  le nombre e, obtenu en poussant la construction jusqu'à x = 1 —
 *          et l'honnêteté sur l'écart : la ligne brisée APPROCHE, elle ne donne pas.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste rappelé → brique
 * `propriete-caracteristique` ; étape 2 argument mené → briques
 * `exponentielle-definition` puis `mem-exp-egale-sa-derivee` ; étape 3 la
 * demande, désormais légitime.
 *
 * MANIPULATION JAMAIS GELÉE : le constructeur de l'étape 1 reste pilotable
 * après validation — l'élève doit pouvoir refaire le geste en lisant la règle
 * qui vient d'être écrite.
 */
export default function Module02UneSeuleCourbePossible() {
  const [hauteurs, setHauteurs] = useState([]);
  const [brouillon, setBrouillon] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = q2;
  const done3 = q3;

  const ecart = ecartRelatifFinal();
  const bout = ligneEuler(1).at(-1).y;

  const steps = [
    {
      num: 1,
      title: 'La règle du jeu s’écrit en une ligne',
      subtitle:
        'Reprends la construction si tu veux : à chaque point, la pente valait la hauteur. En notation de dérivée, cela donne une seule égalité.',
      done: done1,
      content: (
        <div className="space-y-3">
          <ConstructeurEuler
            depart={1}
            hauteurs={hauteurs}
            brouillon={brouillon}
            onChangeHauteur={setBrouillon}
            onValider={() => {
              setHauteurs([...hauteurs, brouillon]);
              setBrouillon(null);
            }}
          />
          <TapQuestion
            prompt="« En chaque point, la pente de la courbe est égale à l’ordonnée du point. » Comment cela s’écrit-il avec la notation de la dérivée ?"
            options={[
              'f′(x) = f(x) pour tout x',
              'f′(x) = x pour tout x',
              'f(x) = x pour tout x',
              'f′(x) = 0 pour tout x',
            ]}
            correct={0}
            cols={2}
            requires={['nombre-derive', 'derive-coefficient-directeur', 'notation-fx']}
            explain="La pente en x s’écrit f′(x) ; l’ordonnée en x s’écrit f(x). Dire que les deux sont égales, c’est écrire f′(x) = f(x), et cela pour TOUT x — c’est bien ce que tu as respecté à chaque segment."
            explainWrong="Attention à ne pas confondre : f′(x) = x dirait que la pente vaut l’ABSCISSE, alors que la règle parlait de la hauteur, c’est-à-dire de l’ordonnée f(x). Et f′(x) = 0 décrirait une courbe plate."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Une seule égalité, valable partout. Et remarque ce qu’elle a d’inhabituel : elle
                relie la fonction à sa propre dérivée, au lieu de donner une formule de calcul.
              </Feedback>
              <KnowledgeBrick
                id="propriete-caracteristique"
                variant="new"
                lead={<>Ce que ton geste respectait à chaque segment, écrit une fois pour toutes.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux exigences, une seule fonction',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-violet-900">Ce que le module 1 a montré</p>
            <p>
              Avec la seule exigence f′ = f, la construction marchait depuis <em>n’importe quelle</em>{' '}
              hauteur de départ : il existe donc une fonction par départ, et elles sont toutes
              différentes.
            </p>
            <p>
              Ajouter <strong>f(0) = 1</strong> revient à choisir le départ. Il n’en reste alors
              qu’une seule — et c’est elle que l’on nomme.
            </p>
          </div>
          <TapQuestion
            prompt="Deux fonctions vérifient toutes les deux f′ = f, mais l’une vaut 1 en 0 et l’autre vaut 2 en 0. Que peut-on dire ?"
            options={[
              'Ce sont deux fonctions différentes : leurs courbes ne se rejoignent jamais',
              'Ce sont les mêmes : la condition en 0 ne change rien',
              'La seconde n’existe pas : seule f(0) = 1 est possible',
              'Elles se croisent une fois, puis se séparent',
            ]}
            correct={0}
            cols={1}
            requires={['propriete-caracteristique', 'fonction']}
            explain="Tu les as construites toutes les deux au module 1, et elles n’avaient aucun point commun : partant de hauteurs différentes, elles gardent des hauteurs différentes à chaque pas. C’est exactement pour cela que la condition en 0 sert à en désigner UNE."
            explainWrong="Reviens à ta construction : depuis 1 et depuis 2, les hauteurs successives n’ont jamais coïncidé. La condition en 0 ne décore pas la définition, elle la rend unique."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                D’où une définition qui tient en deux lignes, et qui désigne une fonction et une
                seule.
              </Feedback>
              <KnowledgeBrick
                id="exponentielle-definition"
                variant="new"
                lead={<>Voici son nom et sa notation. Ta courbe construite en portait déjà toute l’allure.</>}
              />
              <KnowledgeBrick
                id="mem-exp-egale-sa-derivee"
                variant="new"
                lead={<>Les deux lignes à ne plus jamais séparer.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le nombre e',
      subtitle: 'La valeur de cette fonction en 1 est un nombre célèbre. Ta construction l’a approché.',
      done: done3,
      content: (
        <div className="space-y-3">
          <ConstructeurEuler
            depart={1}
            hauteurs={ligneEuler(1).slice(1).map((p) => p.y)}
            montrerAide={false}
            montrerSolution
            onChangeHauteur={() => {}}
            verrouille
            ariaLabel="La ligne brisée construite depuis 1, et en pointillés la fonction exponentielle qu’elle approche."
          />
          <div className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              Ta ligne brisée atteint <strong>{fr(affiche(bout))}</strong> en x = 1. La vraie
              valeur est <strong>{fr(affiche(E))}</strong> : l’écart est d’environ{' '}
              <strong>{fr(Math.round(ecart * 10) / 10)} %</strong>.
            </p>
            <p>
              La construction <strong>s’approche</strong> de la courbe cherchée, elle ne la donne
              pas : entre deux points, tes segments sont droits alors que la courbe se redresse
              déjà. Des pas plus fins réduiraient l’écart autant qu’on veut.
            </p>
            <div className="text-center">
              <MathText>{'$$e = \\exp(1) \\approx 2{,}718$$'}</MathText>
            </div>
          </div>
          <NumericQuestion
            prompt={<>Avec la notation e^x, que vaut <strong>e^0</strong> ?</>}
            expected={1}
            parse={(raw) => parseSigned(raw, parseDec)}
            display="1"
            requires={['exponentielle-definition', 'mem-exp-egale-sa-derivee']}
            explain="e^0 = exp(0) = 1 : c’est la seconde des deux exigences de la définition, celle qui a permis de choisir une courbe parmi toutes celles construites."
            explainFor={(n) =>
              n === 0
                ? 'Non : c’est justement la valeur que cette fonction ne prend JAMAIS. exp(0) vaut 1 — c’est le point de départ imposé.'
                : Math.abs(n - E) < 0.02
                ? 'Ça, c’est e — c’est-à-dire exp(1), la valeur en 1. En 0, la fonction vaut 1.'
                : null
            }
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <Feedback tone="ok">
              exp(0) = 1 et exp(1) = e. Deux valeurs à connaître, et la première est une moitié de
              la définition elle-même.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Une seule courbe possible"
      moduleSubtitle="La propriété qui la définit, et le nom qu’elle porte"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Ce que tu as construit a un nom',
        tone: 'indigo',
        body: (
          <p>
            Tu as constaté que deux exigences ne laissaient qu’une seule courbe possible. Voici
            comment on l’écrit, comment on la nomme, et pourquoi l’unicité n’est pas une
            coïncidence.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Reste une question.</strong> Ta courbe semblait ne jamais toucher l’axe. Est-ce
          une impression de dessin, ou une certitude ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
