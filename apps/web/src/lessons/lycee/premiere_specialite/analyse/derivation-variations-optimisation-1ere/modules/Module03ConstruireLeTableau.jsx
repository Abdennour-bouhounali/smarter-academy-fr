import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TableauVariations from '../components/TableauVariations';
import DeuxPanneaux from '../components/DeuxPanneaux';
import { CUBE, tableauDeSignes, extremums, parseSigned, fr } from '../components/variationsUtils';

/**
 * Module 3 — MANIPULATION : remplir le tableau, sans jamais regarder la courbe.
 *
 * Étape 1  le premier geste de la méthode : RÉSOUDRE f′(x) = 0. C'est cette
 *          équation qui découpe l'intervalle, et rien d'autre.
 * Étape 2  remplir la ligne du SIGNE, intervalle par intervalle. La ligne des
 *          flèches suit les CHOIX de l'élève (TableauVariations `aRemplir`) :
 *          un signe faux produit une flèche fausse, visiblement. C'est là que
 *          la méthode se pose → briques `methode-construire-tableau-depuis-derivee`
 *          et `regle-ligne-derivee-au-dessus`.
 * Étape 3  lire l'extremum DANS le tableau : sa valeur, et l'endroit où elle
 *          est atteinte — deux nombres distincts. → briques
 *          `methode-extremum-par-le-signe` et `mem-plus-moins-maximum`.
 *
 * AUCUNE LIGNE DU TABLEAU N'EST ÉCRITE À LA MAIN : bornes, valeurs, flèches et
 * extremums sont dérivés du modèle (components/variationsUtils.js).
 *
 * MANIPULATION JAMAIS GELÉE : le tableau reste modifiable une fois juste — on
 * veut pouvoir refaire le geste, et même poser un signe faux pour voir ce que
 * ça donne.
 */
const { lignes: LIGNES } = tableauDeSignes(CUBE);
const VRAI = LIGNES.map((l) => l.sign);
const MAX = extremums(CUBE).find((e) => e.kind === 'maximum');

export default function Module03ConstruireLeTableau() {
  const [q1, setQ1] = useState(false);
  const [choix, setChoix] = useState({});
  const [rempli, setRempli] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = q1;
  const done2 = rempli;
  const done3 = q3;

  const choisir = (i, s, react) => {
    const suivant = { ...choix, [i]: s };
    setChoix(suivant);
    if (!rempli && VRAI.every((v, k) => suivant[k] === v)) {
      setRempli(true);
      react?.(true);
    }
  };

  const justes = VRAI.filter((v, k) => choix[k] === v).length;

  const steps = [
    {
      num: 1,
      title: 'Premier geste : annuler la dérivée',
      subtitle:
        'On étudie f(x) = x³ − 3x sur [−2 ; 2], et sa dérivée f′(x) = 3x² − 3. Avant tout tableau, il faut savoir où l’intervalle se coupe.',
      done: done1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-slate-800">Résoudre f′(x) = 0 :</p>
            <p className="font-mono">3x² − 3 = 0 ⟺ 3(x² − 1) = 0 ⟺ x² = 1</p>
            <p>Un carré vaut 1 pour deux nombres opposés. L’équation a donc deux solutions.</p>
          </div>
          <TapQuestion
            prompt="Quelles sont les solutions de 3x² − 3 = 0 ?"
            options={['x = −1 et x = 1', 'x = 3 seulement', 'x = 0 et x = 3', 'Aucune solution']}
            correct={0}
            cols={2}
            requires={['derivees-usuelles', 'methode-construire-tableau']}
            explain="x² = 1 donne x = −1 ou x = 1. Ces deux valeurs découpent [−2 ; 2] en trois morceaux : [−2 ; −1], [−1 ; 1] et [1 ; 2]. Sur chacun, le signe de f′ ne changera plus."
            explainWrong="On ne résout pas 3x² − 3 = 0 en cherchant où 3x vaut 3 : il faut isoler x², qui vaut alors 1. Or 1 a DEUX racines carrées opposées."
            solved={done1}
            onAnswered={() => setQ1(true)}
          />
          {done1 && (
            <Feedback tone="ok">
              Deux solutions, donc trois morceaux. C’est le découpage du tableau — et il vient de
              l’équation, pas d’un coup d’œil à la courbe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Remplir la ligne du signe',
      subtitle:
        'Pour chaque morceau, choisis le signe de f′. Un point d’essai suffit : f′(−1,5) = 3,75, f′(0) = −3, f′(1,5) = 3,75. La ligne des flèches se déduit de TES choix — regarde-la changer.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <TableauVariations
            fn={CUBE}
            aRemplir
            choix={choix}
            onChoisir={(i, s) => choisir(i, s, kit.react)}
            disabled={!done1}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                + puis − puis + : la courbe monte, descend, remonte. Tu n’as pas regardé une seule
                fois la courbe de f — seulement le signe de sa dérivée.
              </Feedback>
              <KnowledgeBrick
                id="methode-construire-tableau-depuis-derivee"
                variant="new"
                lead={<>Les quatre gestes que tu viens d’enchaîner, dans l’ordre. Refais le tableau en les lisant.</>}
              />
              <KnowledgeBrick
                id="regle-ligne-derivee-au-dessus"
                variant="new"
                lead={<>Et la raison pour laquelle la ligne du signe se place AU-DESSUS.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Morceaux justes : {justes} sur {VRAI.length}. Essaie un point à l’intérieur de chaque
              morceau et calcule f′ dessus.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Lire le retournement',
      subtitle:
        'Le tableau est rempli. Il ne reste qu’à le lire — et à ne pas confondre l’endroit avec la valeur.',
      done: done3,
      content: (
        <div className="space-y-3">
          <TableauVariations fn={CUBE} montrerExtremums={done3} />
          <NumericQuestion
            prompt={
              <>
                Dans ce tableau, f′ passe de <strong>+</strong> à <strong>−</strong> en un point.
                Quelle est la <strong>valeur</strong> que f y atteint ?
              </>
            }
            expected={MAX.y}
            parse={(raw) => parseSigned(raw, parseDec)}
            display={fr(MAX.y)}
            requires={['methode-construire-tableau-depuis-derivee', 'signe-derivee-donne-sens', 'maximum-minimum', 'extremum']}
            explain={`Le passage de + à − a lieu en x = ${fr(MAX.x)}, et la valeur atteinte est f(${fr(MAX.x)}) = ${fr(MAX.y)}. L’endroit et la valeur sont deux nombres différents.`}
            explainFor={(n) =>
              n === MAX.x
                ? 'C’est l’ENDROIT où le retournement a lieu, pas la valeur atteinte. Lis la ligne du bas du tableau : elle vaut 2 à cet endroit.'
                : n === -2
                ? 'C’est la valeur atteinte à l’autre retournement, celui où f′ passe de − à + (en x = 1).'
                : null
            }
            solved={done3}
            onAnswered={() => setQ3(true)}
          />
          {done3 && (
            <>
              <Feedback tone="ok">
                Le tableau porte les deux informations, dans deux lignes différentes : l’endroit sur
                la ligne des x, la valeur sur la ligne des variations.
              </Feedback>
              <KnowledgeBrick
                id="methode-extremum-par-le-signe"
                variant="new"
                lead={<>Comment reconnaître, dans un tableau, ce qui se retourne et dans quel sens.</>}
              />
              <KnowledgeBrick
                id="mem-plus-moins-maximum"
                variant="new"
                lead={<>La forme courte à garder en tête.</>}
              />
              <DeuxPanneaux fn={CUBE} x={MAX.x} onChangeX={() => {}} montrerBandes disabled />
              <Feedback tone="info">
                Vérification : la figure du module 1 dit exactement la même chose que ce tableau. Le
                tableau est simplement la version qui tient sur une ligne de copie.
              </Feedback>
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
      moduleTitle="Construire le tableau"
      moduleSubtitle="Quatre gestes, et jamais un coup d’œil à la courbe"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Remplir sans regarder',
        tone: 'indigo',
        body: (
          <p>
            Depuis la 2de, tu sais lire un tableau et le construire à partir d’une courbe. Voici
            comment le construire à partir de la seule dérivée — c’est-à-dire même quand on n’a
            pas la courbe sous les yeux.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et maintenant ?</strong> Un tableau, ce n’est pas toujours ↗ ↘ ↗. Le module
          suivant enchaîne trois cas différents — dont un où la dérivée ne s’annule jamais.
        </KnowledgeSnapshot>
      }
    />
  );
}
