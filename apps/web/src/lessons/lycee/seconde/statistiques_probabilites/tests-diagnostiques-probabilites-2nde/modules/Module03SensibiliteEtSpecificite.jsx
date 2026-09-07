import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { REFERENCE, scenario } from '../data';

/**
 * Module 3 — DÉCOUVERTE : sensibilité et spécificité.
 *
 * Le point crucial, et il prépare tout le module 4 : ces deux indicateurs
 * se calculent en divisant par une COLONNE du tableau (les atteints, les
 * sains) — c'est-à-dire en conditionnant par l'ÉTAT DE SANTÉ, une chose
 * qu'on ne connaît jamais quand on reçoit son résultat. Ce sont des qualités
 * du test, mesurées en laboratoire sur des personnes dont on sait déjà si
 * elles sont atteintes.
 *
 * D'où la question du module suivant, qui divise par une LIGNE.
 */
const S = scenario(REFERENCE);

export default function Module03SensibiliteEtSpecificite() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'La sensibilité : voit-on les malades ?',
      done: q1,
      content: (
        <div className="space-y-3">
          {/* Les quatre cases sont nommées depuis le module 2 : on peut donner
              maintenant les deux quotients qui mesurent le test, avant la
              première question qui en demande un. */}
          <KnowledgeBrick
            id="sensibilite-specificite"
            variant="new"
            lead={<>Tu sais nommer les quatre cases. On peut maintenant les diviser — et chaque division se fait dans une <strong>colonne</strong> du tableau.</>}
          />
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 space-y-2">
            <p className="text-sm text-slate-700">
              Ici, on se place <strong>parmi les personnes atteintes</strong> et on regarde combien le test
              repère : {S.truePositive} sur {S.ill}.
            </p>
          </div>
          <NumericQuestion
            requires={['sensibilite-specificite', 'vocabulaire-cases', 'quotient', 'pourcentage']}
            prompt={`Le test détecte ${S.truePositive} personnes parmi les ${S.ill} personnes atteintes. Quelle est sa sensibilité ? (en %)`}
            expected={(n) => Math.abs(n - S.sensitivity * 100) < 0.3}
            parse={parseDec}
            display="99 %"
            suffix="%"
            explain={`${S.truePositive} ÷ ${S.ill} = 0,99, soit 99 %. La sensibilité se calcule dans la colonne des personnes ATTEINTES.`}
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'La spécificité : laisse-t-on tranquilles les gens sains ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 space-y-2">
            <div className="text-center">
              <MathText>{'$$\\text{spécificité} = P_{\\text{sain}}(\\text{test }-) = \\frac{VN}{VN + FP}$$'}</MathText>
            </div>
            <p className="text-sm text-slate-700">
              Cette fois on se place <strong>parmi les personnes saines</strong> :
              {' '}{S.trueNegative.toLocaleString('fr-FR')} sur {S.healthy.toLocaleString('fr-FR')}.
            </p>
          </div>
          <NumericQuestion
            requires={['sensibilite-specificite', 'vocabulaire-cases', 'quotient', 'pourcentage']}
            prompt={`Le test déclare négatives ${S.trueNegative.toLocaleString('fr-FR')} des ${S.healthy.toLocaleString('fr-FR')} personnes saines. Quelle est sa spécificité ? (en %)`}
            expected={(n) => Math.abs(n - S.specificity * 100) < 0.3}
            parse={parseDec}
            display="95 %"
            suffix="%"
            explain={`${S.trueNegative.toLocaleString('fr-FR')} ÷ ${S.healthy.toLocaleString('fr-FR')} = 0,95, soit 95 %. Les 5 % restants sont les ${S.falsePositive} faux positifs.`}
            explainFor={(n) => (Math.abs(n - 5) < 0.5
              ? 'Les 5 % sont le taux d’ERREUR sur les personnes saines. La spécificité est le complément : la part de personnes saines correctement déclarées négatives.'
              : null)}
            solved={q2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que ces deux nombres supposent connu',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Pour calculer la sensibilité, il a fallu savoir <strong>qui était atteint</strong>. Pour la
            spécificité, savoir <strong>qui était sain</strong>.
          </div>
          <TapQuestion
            requires={['sensibilite-specificite']}
            prompt="Quand une personne reçoit son résultat de test, que connaît-elle déjà ?"
            options={[
              'Uniquement le résultat du test, pas son état de santé',
              'Son état de santé, mais pas le résultat',
              'Les deux',
              'Ni l’un ni l’autre',
            ]}
            correct={0} cols={1}
            explain="C’est tout le problème. Sensibilité et spécificité conditionnent par l’ÉTAT DE SANTÉ — une information dont la personne testée ne dispose justement pas. Sa question à elle part du résultat du test : c’est le conditionnement inverse, et c’est l’objet du module suivant."
            explainWrong="La personne lit « positif » ou « négatif » sur sa feuille : elle connaît le résultat du test, et cherche à en déduire son état de santé."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Sensibilité et spécificité" moduleSubtitle="Deux qualités mesurées sur les colonnes" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'Mesurer la qualité d’un test', tone: 'sky',
        body: <p>Deux nombres résument un test : sa capacité à repérer les malades, et sa capacité à ne pas alarmer les gens sains. Tous deux se calculent… en sachant déjà qui est malade.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Retenu.</strong> <strong>Sensibilité</strong> = P<sub>atteint</sub>(test +),
          <strong> spécificité</strong> = P<sub>sain</sub>(test −). Les deux conditionnent par l’état de
          santé. Module suivant : la question inverse, celle de la personne testée.
        </KnowledgeSnapshot>
      )}
    />
  );
}
