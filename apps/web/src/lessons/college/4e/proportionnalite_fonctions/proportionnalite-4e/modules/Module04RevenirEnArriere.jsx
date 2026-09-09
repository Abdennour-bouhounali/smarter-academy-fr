import React, { useState } from 'react';
import { Undo2, AlertTriangle } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EvolutionLab from '../components/EvolutionLab';
import {
  parseDec, eur, pct, coefTexte,
  appliquerEvolution, coefficientSuccessif, tauxSuccessif, tauxRetour, valeurInitiale,
  coefficientMultiplicateur,
} from '../components/prop4e';

/**
 * Module 4 — MANIPULATION : revenir en arrière n'est pas l'évolution opposée.
 *
 * Activity              appliquer une hausse, puis chercher la baisse qui
 *                       ramène EXACTEMENT au prix de départ.
 * Mathematical objective deux évolutions successives se composent par le
 *                       PRODUIT de leurs coefficients ; le retour n'est donc
 *                       pas le taux opposé mais celui dont le coefficient est
 *                       l'inverse.
 * Student action        glisser le taux de la seconde évolution jusqu'à
 *                       retrouver le prix de départ.
 * Controlled variable   le second taux ; la hausse initiale est fixée.
 * Mathematical state    (depart, t1, t2) ; tout le reste est DÉRIVÉ.
 * Visual consequence    la barre finale se compare à celle du départ : elle
 *                       s'aligne exactement, ou pas.
 * Expected observation  « avec −20 % je tombe plus bas que le départ ; il
 *                       faut −16,7 % environ ».
 * Misconception targeted « +20 % puis −20 % revient au départ » — l'erreur
 *                       la plus tenace du niveau, ici CHIFFRÉE.
 * Formalization         la brique `evolutions-successives` arrive après le
 *                       constat, et `valeur-initiale` après la recherche.
 */
/**
 * ATTEIGNABILITÉ (mémoire « cible atteignable sur la grille »). Le curseur
 * avance par points de pourcentage entiers : la baisse qui ramène EXACTEMENT
 * au départ doit donc tomber sur un cran. Avec +20 %, le retour exact vaut
 * −16,666…% — aucun cran ne l'atteint, et l'étape serait IMPOSSIBLE à réussir
 * (les crans voisins donnent 50,40 € et 49,80 €).
 * Avec +25 %, le retour exact vaut −20 %, pile sur un cran. Et le contraste
 * pédagogique est plus net : l'élève croit qu'il faut −25 %, il lui faut −20 %.
 * Un test verrouille cette atteignabilité (`parcours.test.js`).
 */
const DEPART = 40;
const HAUSSE = 0.25;
const APRES_HAUSSE = appliquerEvolution(DEPART, HAUSSE); // 50 €
const RETOUR_EXACT = -0.2;

export default function Module04RevenirEnArriere() {
  const [t2, setT2] = useState(-0.2);
  const [pred, setPred] = useState(null);
  const [essais, setEssais] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const noter = (t) => {
    setT2(t);
    setEssais((e) => (e.some((x) => Math.abs(x - t) < 0.01) ? e : [...e, t]));
  };

  const final = appliquerEvolution(APRES_HAUSSE, t2);
  const revenu = Math.abs(final - DEPART) < 0.005;
  // A-t-il essayé le piège (−25 %, le taux opposé) avant de trouver le vrai retour ?
  const aEssayeLePiege = essais.some((t) => Math.abs(t + HAUSSE) < 0.005);
  const done1 = revenu && essais.length >= 2;

  const steps = [
    {
      num: 1,
      title: 'Retrouve le prix de départ',
      subtitle: `Un vélo à ${eur(DEPART)} augmente de ${pct(HAUSSE)} : il coûte ${eur(APRES_HAUSSE)}. Fais-le redescendre à ${eur(DEPART)}.`,
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt={`Quelle baisse ramènera exactement à ${eur(DEPART)} ?`}
            options={[
              { id: 'exact', label: '−25 %' },
              { id: 'moins', label: 'Un peu moins de 25 %' },
              { id: 'plus', label: 'Un peu plus de 25 %' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <EvolutionLab
            depart={APRES_HAUSSE}
            taux={t2}
            onTaux={noter}
            min={-0.4}
            max={0}
            libelleDepart={`Après ${pct(HAUSSE)}`}
            libelleArrivee="Après la baisse"
          />
          <div className="rounded-xl bg-slate-900 px-3 py-2.5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Prix de départ à retrouver
            </p>
            <p className="font-mono text-xl font-black tabular-nums text-white">{eur(DEPART)}</p>
            <p className={`mt-1 text-sm font-semibold ${revenu ? 'text-emerald-300' : 'text-amber-300'}`}>
              Tu es à {eur(final)}
              {revenu ? ' — exactement au départ.' : final < DEPART ? ' : trop bas.' : ' : trop haut.'}
            </p>
          </div>
          {aEssayeLePiege && !revenu && (
            <Feedback tone="ko">
              Avec {pct(-HAUSSE)}, on tombe à {eur(appliquerEvolution(APRES_HAUSSE, -HAUSSE))} : les
              25 % sont pris sur {eur(APRES_HAUSSE)}, pas sur {eur(DEPART)}. Continue à glisser.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Il fallait exactement {pct(RETOUR_EXACT)}, et non {pct(-HAUSSE)} : la baisse se
              calcule sur le prix ACTUEL ({eur(APRES_HAUSSE)}), plus élevé que celui du départ.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi les deux ne s’annulent pas',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
            <p className="text-center font-mono text-sm tabular-nums text-slate-700">
              {eur(DEPART)} <span className="text-indigo-600">{coefTexte(coefficientMultiplicateur(HAUSSE))}</span>{' '}
              = {eur(APRES_HAUSSE)} <span className="text-indigo-600">{coefTexte(coefficientMultiplicateur(-HAUSSE))}</span>{' '}
              = {eur(appliquerEvolution(APRES_HAUSSE, -HAUSSE))}
            </p>
            <p className="mt-2 text-center text-sm font-bold text-slate-900">
              {coefTexte(coefficientMultiplicateur(HAUSSE))} puis {coefTexte(coefficientMultiplicateur(-HAUSSE))} ={' '}
              {coefTexte(coefficientSuccessif([HAUSSE, -HAUSSE]))}
            </p>
          </div>
          <TapQuestion
            prompt={`Appliquer ${pct(HAUSSE)} puis ${pct(-HAUSSE)}, cela revient à multiplier par ${coefTexte(coefficientSuccessif([HAUSSE, -HAUSSE])).slice(1)}. Que peut-on en conclure ?`}
            options={[
              `Le prix final est plus bas que le prix de départ, de ${pct(tauxSuccessif([HAUSSE, -HAUSSE]))}`,
              'Le prix final est égal au prix de départ',
              'Le prix final est plus haut, de 4 %',
              'On ne peut pas conclure sans connaître le prix',
            ]}
            correct={0}
            cols={1}
            requires={['coefficient-multiplicateur']}
            explain={`${coefTexte(coefficientMultiplicateur(HAUSSE)).slice(1)} × ${coefTexte(coefficientMultiplicateur(-HAUSSE)).slice(1)} = ${coefTexte(coefficientSuccessif([HAUSSE, -HAUSSE])).slice(1)}, plus petit que 1 : quel que soit le prix de départ, il en reste moins qu’au début.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="evolutions-successives"
              variant="new"
              lead="Deux évolutions à la suite : tu viens de voir comment elles se combinent."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Retrouver le prix d’avant',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Après une remise de 20 %, une paire de chaussures est affichée à 48 €.
            Quel était son prix avant la remise ?
          </p>
          <NumericQuestion
            prompt="Prix avant la remise, en euros"
            expected={valeurInitiale(48, coefficientMultiplicateur(-0.2))}
            parse={parseDec}
            suffix="€"
            requires={['coefficient-multiplicateur', 'evolutions-successives']}
            explain="48 est ce qui reste après ×0,8. On remonte en divisant : 48 ÷ 0,8 = 60 €. Vérification : 60 × 0,8 = 48."
            explainFor={(n) => {
              if (n === 57.6) return 'Tu as appliqué la remise une seconde fois (48 × 0,8). Pour remonter, il faut DIVISER par 0,8.';
              if (n === 58 || n === 57 || n === 68) return 'Ajouter 20 % à 48 donne 57,60 € — mais les 20 % avaient été pris sur le prix d’AVANT, plus élevé. On divise par 0,8 : 60 €.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="valeur-initiale"
              variant="new"
              lead="Remonter le temps, c’est faire l’opération inverse."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le réflexe à garder',
      done: q4,
      content: (
        <TapQuestion
          prompt="Un prix baisse de 30 %, puis remonte de 30 %. Que peut-on dire du prix final ?"
          options={[
            'Il est plus bas que le prix de départ',
            'Il est égal au prix de départ',
            'Il est plus haut que le prix de départ',
            'Cela dépend du prix de départ',
          ]}
          correct={0}
          cols={1}
          requires={['evolutions-successives', 'coefficient-multiplicateur']}
          explain={`0,7 × 1,3 = 0,91, soit moins que 1 : il manque ${pct(tauxSuccessif([-0.3, 0.3]))}. La hausse porte sur un prix déjà diminué, donc elle rapporte moins que ce que la baisse avait retiré — et c’est vrai QUEL QUE SOIT le prix de départ.`}
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Revenir en arrière"
      moduleSubtitle="La baisse qui annule une hausse n’est pas celle qu’on croit"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Le vélo qui ne revient pas à son prix',
        tone: 'amber',
        body: (
          <>
            Un vélo augmente de 20 %, puis le magasin annonce « −20 %, retour au prix
            d’origine ». <strong>Est-ce vrai ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5">
          <Undo2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="text-sm text-amber-900">
            <AlertTriangle className="inline h-4 w-4" aria-hidden="true" /> Glisse la baisse
            jusqu’à retomber exactement sur le prix de départ. Note bien la valeur qu’il faut.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
