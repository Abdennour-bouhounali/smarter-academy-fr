import React, { useState } from 'react';
import { ArrowDownWideNarrow, Divide } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EchelleLab from '../components/EchelleLab';
import { valeurExacte } from '../components/puissances4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : descendre l'échelle
 * des puissances sous l'exposant zéro (components/EchelleLab.jsx).
 *
 * Activity              choisir, barreau après barreau, la valeur qui
 *                       continue la descente — d'abord en base 10, puis en
 *                       base 2 pour vérifier que ce n'est pas une propriété
 *                       du seul nombre 10.
 * Mathematical objective l'exposant négatif n'est pas une convention : c'est
 *                       la seule façon de continuer une descente où l'on
 *                       DIVISE par la base à chaque cran. 10⁰ = 1 puis
 *                       10⁻¹ = 0,1 s'imposent.
 * Student action        choisir la valeur du barreau suivant parmi trois.
 * Controlled variable   un barreau à la fois, celui du bas.
 * Mathematical state    l'exposant atteint — détenu ICI ; le laboratoire
 *                       n'en garde rien, donc la manipulation est rejouable.
 * Visual consequence    la colonne « Rapport » reste verte tant que le
 *                       rapport avec le barreau du dessus vaut la base.
 * Expected observation  « je divise toujours par 10, et ça ne s'arrête pas
 *                       à 1 » — puis, en base 2, « la même chose se produit,
 *                       ce n'était donc pas une histoire de zéros ».
 * Misconception targeted « 10⁻² est un nombre négatif ». La colonne ne
 *                       change jamais de côté : elle rapetisse.
 * Formalization         AUCUNE : le mot « exposant négatif » et la règle
 *                       a⁻ⁿ = 1/aⁿ sont posés au module 2.
 * Transfer              module 4 : la même échelle sert à écrire les petits
 *                       nombres en notation scientifique.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage.
 */

/**
 * L'écriture attendue pour un barreau : « 100 » ou « 1/10 ».
 * Séparée des choix, pour que la bonne réponse ne soit pas identifiable par
 * sa POSITION — un laboratoire dont la solution est toujours le premier
 * bouton s'apprend par la place, pas par les mathématiques.
 */
const bonneValeur = (base, exp) => {
  const v = valeurExacte(base, exp);
  return v.d === 1 ? String(v.n) : `1/${v.d}`;
};

/**
 * Les trois choix d'un barreau, dans un ordre STABLE mais non trivial :
 *   — la bonne valeur ;
 *   — son opposée, le piège du signe (« 10⁻¹ = −10 ») ;
 *   — la valeur obtenue en RETIRANT la base au lieu de diviser par elle.
 *
 * L'ordre dépend de l'exposant (et non du hasard) : il reste identique d'un
 * rendu à l'autre — indispensable, puisqu'un ordre retiré au hasard à chaque
 * rendu ferait sauter les boutons sous le doigt de l'élève (§16bis) — sans
 * pour autant placer la solution toujours au même endroit.
 */
const choixPour = (base, exp) => {
  const prev = valeurExacte(base, exp + 1);
  const prevVal = prev.n / prev.d;
  const v = valeurExacte(base, exp);
  const options = [
    bonneValeur(base, exp),
    v.d === 1 ? `−${v.n}` : `−1/${v.d}`,
    String(Math.round((prevVal - base) * 1000) / 1000),
  ];
  const uniques = [...new Set(options)];
  // Rotation déterministe : la bonne réponse change de place d'un barreau à
  // l'autre, mais ne bouge jamais pour un barreau donné.
  const decalage = ((exp % uniques.length) + uniques.length) % uniques.length;
  return [...uniques.slice(decalage), ...uniques.slice(0, decalage)];
};

const BASE_A = 10;
const BASE_B = 2;
const EXP_MAX = 3;
const EXP_MIN = -2;

export default function Module01DescendreLEchelle() {
  const [pred, setPred] = useState(null);

  const [expA, setExpA] = useState(1);        // révélé jusqu'à 10^1
  const [errA, setErrA] = useState(null);
  const doneA = expA <= EXP_MIN;

  const [expB, setExpB] = useState(1);
  const [errB, setErrB] = useState(null);
  const doneB = expB <= EXP_MIN;

  const [q3, setQ3] = useState(false);

  const choisir = (base, exp, setExp, setErr, react) => (valeur) => {
    if (valeur === bonneValeur(base, exp)) {
      setErr(null);
      setExp(exp);
      react?.(true);
    } else {
      setErr(valeur);
      react?.(false);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Descends l’échelle des puissances de 10',
      subtitle: 'Le haut est déjà rempli. Choisis la valeur qui continue la descente, barreau après barreau.',
      done: doneA,
      content: (kit) => (
        <div className="space-y-3">
          <EchelleLab
            base={BASE_A}
            expMax={EXP_MAX}
            expMin={EXP_MIN}
            atteint={expA}
            choix={doneA ? [] : choixPour(BASE_A, expA - 1)}
            onChoisir={choisir(BASE_A, expA - 1, setExpA, setErrA, kit.react)}
            erreur={errA}
          />
          <PredictionChips
            prompt="Avant de passer sous le 1 : à ton avis, que vaudra 10⁻¹ ?"
            options={[
              { id: 'petit', label: '0,1' },
              { id: 'negatif', label: '−10' },
              { id: 'zero', label: '0' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={doneA}
          />
          {doneA ? (
            <Feedback tone="ok">
              {pred === 'petit' ? 'Ta prédiction tenait' : 'Regarde la colonne « Rapport »'} : d’un
              barreau au suivant, on <strong>divise toujours par 10</strong>. Cette division ne
              s’arrête pas au 1 — après 1 vient <strong>0,1</strong>, puis 0,01. Les nombres
              deviennent minuscules, mais restent <strong>positifs</strong> : diviser par 10 ne fait
              jamais passer de l’autre côté de zéro.
            </Feedback>
          ) : errA !== null ? (
            <Feedback tone="warn">
              Avec {errA}, le rapport avec le barreau du dessus ne vaut plus 10 : la descente perd sa
              régularité. Chaque cran <strong>divise</strong> par 10 — il ne retire pas 10.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Observe la colonne de droite : que fait-on pour passer d’un barreau au suivant ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et si la base n’est pas 10 ?',
      subtitle: 'Même exercice avec les puissances de 2. La descente se comporte-t-elle pareil ?',
      done: doneB,
      content: (kit) => (
        <div className="space-y-3">
          <EchelleLab
            base={BASE_B}
            expMax={EXP_MAX}
            expMin={EXP_MIN}
            atteint={expB}
            choix={doneB ? [] : choixPour(BASE_B, expB - 1)}
            onChoisir={choisir(BASE_B, expB - 1, setExpB, setErrB, kit.react)}
            erreur={errB}
            montrerDecimal={false}
          />
          {doneB ? (
            <Feedback tone="ok">
              Exactement la même chose, en divisant par 2 : 8, 4, 2, puis <strong>1</strong>, puis{' '}
              <strong>1/2</strong>, puis 1/4. Ce n’était donc pas une propriété des zéros du nombre
              10 — c’est la <strong>structure même</strong> des puissances. Et remarque que 2⁰ vaut 1,
              comme 10⁰ : toute base donne 1 à l’exposant 0.
            </Feedback>
          ) : errB !== null ? (
            <Feedback tone="warn">
              Avec {errB}, le rapport n’est plus 2. Attention : ici on divise par <strong>2</strong>,
              pas par 10.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cette fois la base est 2. Que devient le rapport entre deux barreaux ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que la descente impose',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Deux échelles viennent d'être descendues, rapport à l'appui :
              on peut nommer la régularité avant la question qui l'exige. */}
          <KnowledgeBrick
            id="descente-des-exposants"
            variant="new"
            lead={<>Tu viens de descendre deux échelles de bases différentes en gardant le même geste à chaque barreau. Ce geste décide de tout ce qui suit.</>}
          />
          <TapQuestion
            prompt="Pourquoi 10⁻¹ vaut-il 0,1, et non −10 ?"
            options={[
              'Parce que c’est la seule valeur qui garde la division par 10 à chaque cran',
              'Parce que les mathématiciens ont choisi cette convention',
              'Parce qu’un signe « − » devant l’exposant rend le nombre négatif',
              'Parce qu’on ne peut pas écrire de puissance sous le zéro',
            ]}
            correct={0}
            cols={1}
            requires={['descente-des-exposants']}
            explain="L’échelle descend en divisant par 10 : …, 100, 10, 1, puis nécessairement 0,1. Toute autre valeur briserait un rapport qui vaut pour toute l’échelle. La règle n’est pas décidée — elle est imposée."
            explainWrong="Le signe « − » porte sur l’EXPOSANT, pas sur le nombre : il signale une division, donc un nombre plus petit. Et rien ne s’arrête au zéro — tu viens de descendre plus bas, deux fois."
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Descendre l’échelle"
      moduleSubtitle="Quand la régularité décide à ta place"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'L’échelle ne s’arrête pas à 1',
        tone: 'indigo',
        body: (
          <p>
            Tu connais 10¹, 10², 10³ depuis la 5e. Mais que se passe-t-il si on{' '}
            <strong>descend</strong> l’échelle au lieu de la monter — et qu’on ne s’arrête pas au
            barreau 1 ?
          </p>
        ),
      }}
      intro={
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: ArrowDownWideNarrow, t: 'L’échelle', d: 'Le haut est rempli : ce sont les puissances que tu connais.', c: 'text-indigo-600' },
            { icon: Divide, t: 'Le rapport', d: 'La dernière colonne : ce qu’on fait pour descendre d’un barreau.', c: 'text-emerald-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`mb-1 h-5 w-5 ${c}`} aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-800">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
