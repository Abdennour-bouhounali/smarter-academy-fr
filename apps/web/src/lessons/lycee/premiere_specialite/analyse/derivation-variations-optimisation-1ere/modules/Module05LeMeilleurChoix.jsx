import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TableauVariations from '../components/TableauVariations';
import DeuxPanneaux from '../components/DeuxPanneaux';
import { BOITE, BENEFICE, extremums, maximumSurLeDomaine, parseSigned, fr } from '../components/variationsUtils';

/**
 * Module 5 — ATELIER : le tableau au service d'une question concrète.
 *
 * Étape 1  LA BOÎTE. On découpe un carré de côté x aux quatre coins d'un carton
 *          de 12 cm et l'on relève les bords : V(x) = x(12 − 2x)². L'élève
 *          promène la sonde pour SENTIR qu'il existe un meilleur découpage —
 *          trop petit, la boîte est plate ; trop grand, elle est étroite —
 *          avant de le calculer. Tout est ENTIER : V(2) = 128 cm³ exactement.
 * Étape 2  la méthode, posée sur ce qu'on vient de faire →
 *          brique `methode-optimiser-avec-la-derivee`.
 * Étape 3  LE PIÈGE. Sur B(x) = −2x³ + 30x² − 96x, la dérivée s'annule DEUX
 *          fois ; en x = 2 c'est le PIRE point (B = −88), en x = 8 le meilleur
 *          (B = 128). Annuler la dérivée ne désigne donc pas le meilleur choix
 *          → briques `regle-annuler-ne-suffit-pas-optimisation` puis
 *          `mem-lire-la-reponse-dans-le-tableau`.
 *
 * TOUS LES NOMBRES SONT VÉRIFIÉS PAR BALAYAGE dans le test : « maximum 128 cm³
 * pour x = 2 », « le pire point vaut −88 », « la forme développée coïncide avec
 * la forme factorisée ». Un module d'optimisation qui affirmerait un optimum
 * faux serait indétectable autrement.
 *
 * MANIPULATION JAMAIS GELÉE : la sonde et les tableaux restent pilotables.
 */
const OPT_BOITE = BOITE.optimum;
const MAX_BEN = extremums(BENEFICE).find((e) => e.kind === 'maximum');
const MIN_BEN = extremums(BENEFICE).find((e) => e.kind === 'minimum');
const MEILLEUR_BEN = maximumSurLeDomaine(BENEFICE);

export default function Module05LeMeilleurChoix() {
  const [x1, setX1] = useState(0.5);
  const [vus1, setVus1] = useState([0.5]);
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [x3, setX3] = useState(BENEFICE.domain.xMin);
  const [q3, setQ3] = useState(false);
  const [q3b, setQ3b] = useState(false);

  // Sentir l'optimum : il faut avoir essayé un découpage TROP PETIT, le bon, et
  // un TROP GRAND. La cible x = 2 tombe exactement sur un cran de la sonde
  // (verrouillé par le test « CIBLE ATTEIGNABLE »).
  const aEssaye = (test) => vus1.some(test);
  const senti = aEssaye((v) => v > 0 && v < 2) && aEssaye((v) => Math.abs(v - 2) < 1e-9) && aEssaye((v) => v > 2 && v < 6);
  const done1 = senti && q1;
  const done2 = q2;
  const done3 = q3 && q3b;

  const bouger1 = (v, react) => {
    setX1(v);
    if (vus1.includes(v)) return;
    const suivant = [...vus1, v];
    setVus1(suivant);
    const dejaSenti = senti;
    const maintenant = suivant.some((u) => u > 0 && u < 2) && suivant.some((u) => Math.abs(u - 2) < 1e-9) && suivant.some((u) => u > 2 && u < 6);
    if (!dejaSenti && maintenant) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'La boîte la plus grande possible',
      subtitle:
        'On découpe un carré de côté x aux quatre coins d’un carton carré de 12 cm, puis on relève les bords. Le volume vaut V(x) = x(12 − 2x)². Fais glisser la sonde : essaie un petit découpage, un grand, et cherche entre les deux.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-rose-100 bg-white p-4 text-sm text-slate-700 space-y-1">
            <p>
              Le fond de la boîte est un carré de côté <strong>12 − 2x</strong> (on retire x de
              chaque côté) et sa hauteur vaut <strong>x</strong>.
            </p>
            <p className="text-xs text-slate-500">
              Le découpage n’a de sens que pour 0 &lt; x &lt; 6 : au-delà, il ne resterait plus de fond.
            </p>
          </div>
          <PredictionChips
            prompt="quel découpage donne la plus grande boîte ?"
            options={[
              { id: 'petit', label: 'Le plus petit possible : on garde un grand fond' },
              { id: 'milieu', label: 'Un découpage intermédiaire' },
              { id: 'grand', label: 'Le plus grand possible : la boîte est très haute' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={senti}
          />
          <DeuxPanneaux fn={BOITE} x={x1} onChangeX={(v) => bouger1(v, kit.react)} visites={vus1} montrerBandes={senti} />
          {senti ? (
            <>
              <Feedback tone="ok">
                {pred === 'milieu' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde le panneau du haut'} :
                un découpage trop petit donne une boîte plate, un découpage trop grand une boîte
                étroite. Entre les deux, le volume passe par un sommet — et c’est exactement là
                que la courbe du bas traverse l’axe.
              </Feedback>
              <NumericQuestion
                prompt={<>Quel est le <strong>volume</strong> de la plus grande boîte, en cm³ ?</>}
                expected={OPT_BOITE.y}
                parse={(raw) => parseSigned(raw, parseDec)}
                display={fr(OPT_BOITE.y)}
                requires={['methode-extremum-par-le-signe', 'signe-derivee-donne-sens']}
                explain={`V′(x) = 12x² − 96x + 144 = 12(x − 2)(x − 6). Sur ]0 ; 6[, seul x = 2 annule V′, et V′ y passe de + à − : c’est bien le sommet. V(2) = 2 × (12 − 4)² = 2 × 64 = ${fr(OPT_BOITE.y)} cm³.`}
                explainFor={(n) =>
                  n === 2
                    ? 'C’est le CÔTÉ découpé, en cm — la valeur de x. Le volume, lui, vaut V(2) = 2 × 8² = 128 cm³.'
                    : n === 144
                    ? 'C’est le carré du fond quand on ne découpe rien (12² = 144), pas un volume.'
                    : n === 108
                    ? 'C’est V(3) = 3 × 6² = 108 cm³ : un volume atteignable, mais pas le plus grand.'
                    : null
                }
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
            </>
          ) : (
            <Feedback tone="info">
              Essaie un découpage plus petit que 2, puis exactement 2, puis plus grand — et compare
              les volumes affichés.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La méthode, en quatre gestes',
      subtitle: 'Ce que tu viens de faire à la main s’écrit toujours de la même façon.',
      done: done2,
      content: (
        <div className="space-y-3">
          <TableauVariations fn={BOITE} montrerExtremums />
          <KnowledgeBrick
            id="methode-optimiser-avec-la-derivee"
            variant="new"
            lead={<>Les quatre gestes que tu viens d’enchaîner sur la boîte.</>}
          />
          <TapQuestion
            prompt="Dans un problème de ce type, par quoi commence-t-on TOUJOURS ?"
            options={[
              'Par nommer la variable, dire sur quel intervalle elle a un sens, et écrire la grandeur à optimiser comme une fonction de cette variable',
              'Par dériver l’énoncé',
              'Par essayer plusieurs valeurs jusqu’à trouver la meilleure',
              'Par tracer la courbe à la calculatrice et lire le sommet',
            ]}
            correct={0}
            cols={1}
            requires={['methode-optimiser-avec-la-derivee', 'fonction', 'intervalle']}
            explain="On ne peut dériver que ce qui est déjà écrit comme une fonction. Le premier geste est donc de mettre la grandeur EN FONCTION d’une variable, et de dire où cette variable a un sens : pour la boîte, 0 < x < 6."
            explainWrong="On ne dérive pas un énoncé, on dérive une fonction — encore faut-il l’avoir écrite. Et essayer des valeurs ou lire un sommet à l’écran ne DÉMONTRE rien : ça suggère."
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège du bénéfice',
      subtitle:
        'Une entreprise produit x centaines d’articles, avec 0 ⩽ x ⩽ 10. Son bénéfice, en centaines d’euros, vaut B(x) = −2x³ + 30x² − 96x. Sa dérivée B′(x) = −6(x − 2)(x − 8) s’annule DEUX fois.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <DeuxPanneaux fn={BENEFICE} x={x3} onChangeX={setX3} montrerBandes disabled={!done2} />
          <TableauVariations fn={BENEFICE} montrerExtremums={q3} />
          <NumericQuestion
            prompt={
              <>
                Combien de centaines d’articles faut-il produire pour que le bénéfice soit le plus
                grand possible ? Donne la valeur de <strong>x</strong>.
              </>
            }
            expected={MEILLEUR_BEN.x}
            parse={(raw) => parseSigned(raw, parseDec)}
            display={fr(MEILLEUR_BEN.x)}
            requires={['methode-optimiser-avec-la-derivee', 'methode-extremum-par-le-signe']}
            explain={`B′ s’annule en 2 et en 8. En x = 2, B′ passe de − à + : c’est un creux, et B(2) = ${fr(MIN_BEN.y)} — le PIRE point. En x = 8, B′ passe de + à − : c’est le sommet, et B(8) = ${fr(MAX_BEN.y)}. Les bornes valent B(0) = 0 et B(10) = 40, donc moins. La réponse est x = 8.`}
            explainFor={(n) =>
              n === 2
                ? 'C’est bien un zéro de B′ — mais le tableau montre que le signe y passe de − à + : c’est le fond du creux, B(2) = −88. Le sommet est l’autre zéro.'
                : n === 10
                ? 'C’est la borne de droite : B(10) = 40, ce qui est mieux que le creux, mais bien moins que 128.'
                : null
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                Deux zéros, deux natures opposées : {fr(MIN_BEN.y)} en x = {fr(MIN_BEN.x)} et{' '}
                {fr(MAX_BEN.y)} en x = {fr(MAX_BEN.x)}. Résoudre « dérivée = 0 » donne des
                candidats ; c’est le tableau qui désigne le bon.
              </Feedback>
              <KnowledgeBrick
                id="regle-annuler-ne-suffit-pas-optimisation"
                variant="new"
                lead={<>La réserve à garder, même quand on a bien dérivé. Repromène la sonde sur les deux zéros en la lisant.</>}
              />
              <KnowledgeBrick
                id="mem-lire-la-reponse-dans-le-tableau"
                variant="new"
                lead={<>Et la forme courte de toute la démarche.</>}
              />
              <TapQuestion
                prompt="Que faut-il répondre à la question posée par l’énoncé ?"
                options={[
                  'Qu’il faut produire 800 articles, pour un bénéfice de 12 800 €',
                  'Qu’il faut produire 8 articles, pour un bénéfice de 128 €',
                  'Que le bénéfice maximal vaut 8',
                  'Qu’il faut produire 200 articles',
                ]}
                correct={0}
                cols={1}
                requires={['mem-lire-la-reponse-dans-le-tableau', 'methode-optimiser-avec-la-derivee']}
                explain="x compte des CENTAINES d’articles et B des CENTAINES d’euros : x = 8 signifie 800 articles, et B(8) = 128 signifie 12 800 €. Répondre « 8 » sans revenir aux unités de l’énoncé, c’est laisser le travail à moitié fait."
                explainWrong="Relis les unités : x est en centaines d’articles, B en centaines d’euros. Et 200 articles correspondrait à x = 2, c’est-à-dire au creux."
                solved={q3b}
                onAnswered={() => setQ3b(true)}
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le meilleur choix"
      moduleSubtitle="Modéliser, dériver, lire le tableau, répondre"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'À quoi ça sert, un tableau ?',
        tone: 'indigo',
        body: (
          <p>
            À répondre à des questions du genre « quelle est la plus grande boîte possible ? » ou
            « combien faut-il produire ? ». Le tableau ne décrit pas seulement une courbe : il
            désigne un choix.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Et maintenant ?</strong> Tu sais lire un signe, remplir un tableau et en tirer
          un choix. La mission finale met les trois à l’épreuve.
        </KnowledgeSnapshot>
      }
    />
  );
}
