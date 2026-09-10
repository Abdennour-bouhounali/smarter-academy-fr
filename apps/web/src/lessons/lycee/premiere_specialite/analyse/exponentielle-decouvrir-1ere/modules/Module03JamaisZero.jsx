import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConstructeurZero from '../components/ConstructeurZero';
import { EXP, fr, affiche } from '../components/expoUtils';

/**
 * Module 3 — DÉCOUVERTE : où la courbe vit, et où elle ne va jamais.
 *
 * Étape 1  L'ENSEMBLE DE DÉFINITION. La construction ne rencontre jamais
 *          d'obstacle : à chaque point la règle fournit une pente, donc de quoi
 *          continuer. Rien n'est interdit — l'ensemble de définition est ℝ.
 * Étape 2  LE RAISONNEMENT PAR L'ABSURDE, MANIPULÉ. L'élève tente de construire
 *          en partant de la hauteur ZÉRO : la pente vaut 0, le segment est plat,
 *          la hauteur reste nulle, et cela indéfiniment. Il obtient la fonction
 *          nulle — qui ne vaut pas 1 en 0. La contradiction est VUE, pas récitée.
 * Étape 3  la conclusion : exp(x) > 0 pour tout x, et la brique qui le fixe.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 constat → brique `exp-definie-sur-r` ;
 * étape 2 geste (la construction qui ne décolle pas) → brique
 * `exp-strictement-positive` ; étape 3 la demande, puis `mem-exp-jamais-nulle`.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 2 reste pilotable après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 2 sur l'étape 1.
 */
export default function Module03JamaisZero() {
  const [q1, setQ1] = useState(false);
  const [essais, setEssais] = useState(0);
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  // L'objectif de l'étape 2 : avoir TENTÉ la construction depuis zéro assez de
  // fois pour constater que rien ne bouge jamais. Quatre tentatives, autant que
  // de segments : l'élève voit la ligne rester plate sur toute la largeur.
  const done2 = essais >= 4;
  const done3 = q3;

  const steps = [
    {
      num: 1,
      title: 'Où cette fonction est-elle définie ?',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              Repense à la construction. À chaque point atteint, la règle donnait une pente — et
              une pente suffit toujours pour tracer le segment suivant. Rien ne l’arrêtait, ni vers
              la droite, ni vers la gauche.
            </p>
            <p>
              Compare avec deux fonctions que tu connais : la fonction inverse refuse 0, et la
              fonction racine carrée refuse les nombres strictement négatifs. Ici, rien n’est
              refusé.
            </p>
          </div>
          <TapQuestion
            prompt="Quel est l’ensemble de définition de la fonction exponentielle ?"
            options={[
              'ℝ tout entier : aucune valeur n’est interdite',
              '[0 ; +∞[ : seulement les nombres positifs',
              'ℝ privé de 0, comme la fonction inverse',
              '[1 ; +∞[, puisqu’elle vaut 1 en 0',
            ]}
            correct={0}
            cols={1}
            requires={['ensemble-definition', 'ensemble-reels', 'intervalle']}
            explain="Rien n’interdit de poursuivre la construction dans un sens ou dans l’autre : la règle fournit une pente en tout point. L’ensemble de définition est donc ℝ."
            explainWrong="Ne confonds pas l’ensemble de DÉPART avec l’ensemble des valeurs ATTEINTES. L’exponentielle accepte tous les nombres réels en entrée — c’est ce qu’elle rend qui sera bientôt restreint."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <>
              <Feedback tone="ok">
                Définie partout : c’est déjà une propriété rare, et elle vient directement de la
                règle de construction.
              </Feedback>
              <KnowledgeBrick
                id="exp-definie-sur-r"
                variant="new"
                lead={<>Le premier des trois renseignements que la règle donne à elle seule.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Essaie de partir de zéro',
      subtitle:
        'Cette fois la hauteur de départ est 0. Attrape le point et tire-le : la règle impose une pente égale à la hauteur… qui vaut 0. Fais les quatre segments et regarde ce qui se passe.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <ConstructeurZero
            essais={essais}
            onEssai={() => {
              const suivant = essais + 1;
              setEssais(suivant);
              if (!done2 && suivant >= 4) kit.react?.(true);
            }}
            verrouille={!done1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                Rien ne décolle, et rien ne pouvait décoller : une hauteur nulle impose une pente
                nulle, donc un segment plat, donc encore une hauteur nulle. La courbe obtenue est
                la fonction constamment nulle — elle vérifie bien f′ = f, mais elle vaut{' '}
                <strong>0</strong> en 0, pas 1.
              </Feedback>
              <Feedback tone="info">
                Voilà l’argument complet. Si la fonction cherchée valait 0 <em>quelque part</em>,
                le même raisonnement s’appliquerait à partir de ce point : plate là, donc plate
                partout, donc nulle en 0. Or elle vaut 1 en 0. C’est contradictoire — donc elle ne
                s’annule <strong>nulle part</strong>.
              </Feedback>
              <KnowledgeBrick
                id="exp-strictement-positive"
                variant="new"
                lead={<>Le raisonnement que ta tentative vient de rendre visible, écrit en entier.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Segments tentés : {essais} sur 4. Tire le point aussi haut que tu veux : la règle le
              ramènera toujours à la même hauteur.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Donc le signe est décidé',
      done: done3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Que peut-on affirmer du signe de exp(x), pour un nombre x quelconque ?"
            options={[
              'exp(x) > 0 pour tout x : la courbe reste au-dessus de l’axe sans jamais le toucher',
              'exp(x) ⩾ 0, avec une valeur nulle en un point',
              'exp(x) > 0 seulement pour x positif ; pour x négatif elle passe en dessous',
              'On ne peut rien affirmer sans calculer exp(x) point par point',
            ]}
            correct={0}
            cols={1}
            requires={['exp-strictement-positive', 'exp-definie-sur-r']}
            explain="Elle vaut 1 en 0, donc elle est strictement positive quelque part ; et elle ne peut jamais valoir 0. Elle ne peut donc pas non plus devenir négative : pour passer d’une valeur positive à une valeur négative, il faudrait bien traverser 0. Elle reste strictement positive partout."
            explainWrong="Regarde ta tentative de l’étape 2 : atteindre la valeur 0 forcerait la courbe à être plate depuis toujours, ce qui contredit exp(0) = 1. Et pour devenir négative, il faudrait d’abord passer par 0 — donc c’est également exclu, y compris très à gauche."
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <>
              <Feedback tone="ok">
                Très à gauche, la fonction devient minuscule — exp(−5) vaut environ{' '}
                <strong>{fr(affiche(EXP.f(-5)))}</strong> — mais elle reste strictement positive.
                Se rapprocher de l’axe n’est pas le toucher.
              </Feedback>
              <KnowledgeBrick
                id="mem-exp-jamais-nulle"
                variant="new"
                lead={<>Une seule chose à retenir de ce module.</>}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Elle ne touche jamais l’axe"
      moduleSubtitle="Où elle vit, et où elle ne va jamais"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Une impression, ou une certitude ?',
        tone: 'indigo',
        body: (
          <p>
            Ta courbe semblait rester au-dessus de l’axe. Un dessin ne prouve rien — mais la règle
            de construction, elle, permet de trancher. Il suffit d’essayer de la prendre en défaut.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et maintenant ?</strong> On sait qu’elle est toujours strictement positive. Or
          sa dérivée, c’est elle-même… Module suivant : ce que cela impose au sens de marche.
        </KnowledgeSnapshot>
      }
    />
  );
}
