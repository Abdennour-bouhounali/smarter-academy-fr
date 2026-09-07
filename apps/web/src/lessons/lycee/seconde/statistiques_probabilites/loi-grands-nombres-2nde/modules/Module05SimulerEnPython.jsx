import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { parseDec } from '@smarter-academy/core';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PYTHON_SCRIPT, SPREADSHEET_FORMULA } from '../data';

/**
 * Module 5 — ATELIER : lire un programme de simulation (LP9).
 *
 * Le programme n'est pas exécuté : l'objectif est de RECONNAÎTRE dans le
 * code les objets de la leçon (la répétition, le succès, la fréquence) et
 * de prévoir son affichage. C'est aussi l'occasion du dernier piège utile :
 * `succes / n` est une fréquence, `succes` un effectif.
 *
 * Le script est affiché tel quel dans un <pre> — pas de coloration
 * syntaxique à charger : la lisibilité vient de la brièveté du code.
 */
export default function Module05SimulerEnPython() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Que compte ce programme ?',
      subtitle: 'Lis-le sans l’exécuter.',
      done: q1,
      content: (
        <div className="space-y-3">
          <pre className="rounded-xl border-2 border-slate-200 bg-slate-900 text-slate-100 p-4 text-sm overflow-x-auto">
            <code>{PYTHON_SCRIPT}</code>
          </pre>
          {/* Le script est sous les yeux : la boucle, le test et la division
              finale s'y montrent avant que la première question n'en parle.
              « boucle » revient du programme scolaire de 6e — simple rappel,
              au point d'emploi. */}
          <KnowledgeBrick
            id="lire-simulation"
            variant="rappel"
            establishes={['boucle']}
            lead={<>Dans ce script, trois lignes font tout : <code>for i in range(n)</code> répète — c’est une <strong>boucle</strong>, déjà croisée en 6e —, <code>if de == 6</code> compte, <code>succes / n</code> divise.</>}
          />
          <TapQuestion
            prompt="Que représente la variable succes à la fin de la boucle ?"
            options={[
              'Le nombre de fois où le dé a donné 6',
              'La fréquence des 6',
              'Le nombre de lancers effectués',
              'La probabilité d’obtenir 6',
            ]}
            correct={0} cols={1}
            requires={['lire-simulation', 'boucle', 'effectif']}
            explain="succes est incrémenté d’une unité chaque fois que le dé vaut 6 : c’est un EFFECTIF (un nombre entier de lancers gagnants). Le nombre de lancers, lui, est n = 10 000. La fréquence n’apparaît qu’à la dernière ligne, quand on divise."
            explainWrong="Relis la ligne « succes = succes + 1 » : elle ajoute 1 à chaque 6 obtenu. C’est donc un comptage, pas un quotient."
            solved={q1} onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Qu’affiche la dernière ligne ?',
      done: q2,
      content: (
        <TapQuestion
          prompt="print(succes / n) affiche un nombre. Duquel s’approchera-t-il très probablement ?"
          options={['≈ 0,167', '≈ 1 667', '≈ 6', '≈ 0,5']}
          correct={0} cols={4}
          requires={['lire-simulation', 'loi-grands-nombres', 'frequence-observee', 'probabilite']}
          explain="succes / n est la fréquence observée des 6 sur 10 000 lancers : d’après la loi des grands nombres, elle sera très proche de 1/6 ≈ 0,167. Le nombre 1 667 serait l’effectif attendu (succes seul), pas la fréquence."
          explainWrong="On divise l’effectif des 6 par le nombre de lancers : le résultat est une fréquence, donc un nombre entre 0 et 1, proche de la probabilité 1/6."
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le même calcul au tableur',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-slate-200 bg-white p-4 space-y-2">
            <p className="text-sm text-slate-700">
              10 000 lancers ont été simulés dans la colonne A (avec <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">=ALEA.ENTRE.BORNES(1;6)</code>).
              La fréquence des 6 s’obtient alors ainsi :
            </p>
            <pre className="rounded-lg bg-slate-100 px-3 py-2 text-sm overflow-x-auto"><code>{SPREADSHEET_FORMULA}</code></pre>
          </div>
          <NumericQuestion
            prompt="Une simulation de 10 000 lancers a compté 1 702 fois la face 6. Quelle est la fréquence observée, en pourcentage ? (arrondis au dixième)"
            expected={(n) => Math.abs(n - 17.02) < 0.06}
            // parseFr (le défaut) n'accepte QUE des entiers : sans parseDec,
            // « 17,0 » — la réponse demandée — serait refusée.
            parse={parseDec}
            display="17,0 %"
            suffix="%"
            requires={['lire-simulation', 'frequence-observee', 'arrondi', 'quotient']}
            explain="1 702 ÷ 10 000 = 0,1702, soit 17,0 %. C’est proche de 16,7 % — l’écart restant est la fluctuation, qui ne disparaît jamais complètement."
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Simuler avec un programme" moduleSubtitle="Lire un script, prévoir son affichage" estimatedTime="8 min"
      brief={{
        tag: 'Atelier', title: 'Dix mille lancers en une seconde', tone: 'rose',
        body: <p>Personne ne lance un dé 10 000 fois à la main. Un programme de six lignes le fait — encore faut-il savoir ce qu’il compte.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Retenu.</strong> Dans un script de simulation on retrouve toujours les mêmes objets : la
          <strong> répétition</strong> (la boucle), le <strong>succès</strong> (le test), et la
          <strong> fréquence</strong> (la division finale). Place à la mission finale.
        </KnowledgeSnapshot>
      )}
    />
  );
}
