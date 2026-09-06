import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ThalesLab from '../components/ThalesLab';
import { FIGURES, fourthProportional, roundTenth, coherenceCheck } from '../components/thalesUtils';

/**
 * Module 4 — MANIPULATION : calculer une longueur.
 *
 * Activity              choisir les deux rapports utiles, puis calculer.
 * Mathematical objective utiliser l'égalité des rapports comme une
 *                       proportionnalité : produit en croix.
 * Student action        sélectionner la paire de rapports, puis répondre.
 * Misconception ciblée   choisir une paire qui contient deux inconnues ; et
 *                       inverser le produit en croix (le résultat devient plus
 *                       grand alors qu'il s'agit d'une réduction). Le contrôle
 *                       de cohérence est enseigné comme un réflexe.
 * Scaffolding           un cas « triangle » exact, puis un cas « papillon ».
 */
export default function Module04CalculerUneLongueur() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const mn = fourthProportional({ a: 3, b: 9, c: null, d: 12 });   // 4

  const steps = [
    {
      num: 1,
      title: 'Choisir les bons rapports',
      subtitle: 'Une paire ne sert que si elle contient trois longueurs connues.',
      done: q1,
      content: (
        <div className="space-y-3">
          <ThalesLab figure={FIGURES.triangle} k={0.33} mode="parallel" disabled
            showRatios={false}
            ariaLabel="Configuration de Thalès pour l’énoncé" />
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              (MN) est parallèle à (BC). On connaît <strong>AM = 3 cm</strong>,{' '}
              <strong>AB = 9 cm</strong> et <strong>BC = 12 cm</strong>. On cherche MN.
            </p>
          </div>
          <TapQuestion
            prompt="Quelle égalité de rapports permet de trouver MN ?"
            options={[
              '$\\frac{AM}{AB} = \\frac{MN}{BC}$',
              '$\\frac{AN}{AC} = \\frac{MN}{BC}$',
              '$\\frac{AM}{AB} = \\frac{AN}{AC}$',
              '$\\frac{AB}{AM} = \\frac{BC}{MN}$',
            ]}
            renderOption={(o) => <MathText>{o}</MathText>}
            optionLabel={(i) => ['AM/AB = MN/BC', 'AN/AC = MN/BC', 'AM/AB = AN/AC', 'AB/AM = BC/MN'][i]}
            correctionLabel="AM/AB = MN/BC"
            correct={0}
            cols={2}
            explain="Cette paire contient AM, AB et BC — trois longueurs connues — et MN, l’inconnue. Les deux autres paires font intervenir AN et AC, dont on ne sait rien : elles ne permettent aucun calcul."
            explainWrong="Vérifie ce que contient chaque paire : il faut TROIS longueurs connues et une seule inconnue. AN et AC ne sont pas données ici."
            requires={['theoreme-thales', 'configuration-thales']}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le produit en croix',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-calculer-longueur"
            variant="new"
            compact
            lead="Tu viens de choisir la bonne égalité. Voici la marche complète, une fois pour toutes."
          />
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3 text-center">
            <MathText>{'$\\frac{3}{9} = \\frac{MN}{12}$'}</MathText>
          </div>
          <NumericQuestion
            prompt="Combien mesure MN ?"
            suffix="cm"
            expected={mn}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display={String(mn)}
            width="w-24"
            explain="Produit en croix : MN = (3 × 12) ÷ 9 = 36 ÷ 9 = 4 cm. Contrôle : le rapport vaut 1/3, donc MN doit être trois fois plus court que BC — 4 cm contre 12 cm, c’est cohérent."
            explainFor={(n) => (n === 36
              ? 'Tu as inversé le produit en croix : (9 × 12) ÷ 3 = 36 cm, soit plus LONG que BC alors que MN est le petit segment. Le contrôle de cohérence rattrape cette erreur.'
              : n === 9 ? 'Tu as soustrait 12 − 3. Thalès porte sur des rapports, pas sur des différences.' : null)}
            requires={['methode-calculer-longueur', 'theoreme-thales']}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un cas papillon',
      subtitle: 'La même méthode, configuration retournée.',
      done: q3,
      content: (
        <div className="space-y-3">
          <ThalesLab figure={FIGURES.triangle} k={-0.5} mode="parallel" disabled
            showRatios={false} allowPapillon
            ariaLabel="Configuration papillon pour l’énoncé" />
          <div className="rounded-xl bg-slate-50 border-2 border-slate-200 p-3">
            <p className="text-sm text-slate-700">
              Dans cette configuration papillon, (MN) est parallèle à (BC). On a{' '}
              <strong>AM = 4 cm</strong>, <strong>AB = 10 cm</strong> et{' '}
              <strong>BC = 15 cm</strong>.
            </p>
          </div>
          <NumericQuestion
            prompt="Combien mesure MN ?"
            suffix="cm"
            expected={6}
            parse={(s) => Number(String(s).replace(',', '.'))}
            display="6"
            width="w-24"
            explain="Exactement la même méthode : MN = (4 × 15) ÷ 10 = 6 cm. Que la configuration soit un triangle ou un papillon ne change rien aux rapports."
            explainFor={(n) => (n === 37.5
              ? 'Produit en croix inversé : (10 × 15) ÷ 4 = 37,5 cm, bien plus long que BC. Le rapport vaut 0,4 : MN doit être plus COURT que BC.'
              : null)}
            requires={['methode-calculer-longueur', 'theoreme-thales']}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
            {q3 && (
              <KnowledgeBrick
                id="mem-controle-rapport"
                variant="new"
                compact
                lead="Un réflexe de relecture, qui rattrape l’erreur la plus fréquente."
              />
            )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Calculer une longueur"
      moduleSubtitle="Choisir la bonne paire, puis le produit en croix"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le théorème au travail',
        tone: 'violet',
        body: (
          <p>
            Trois rapports égaux, cela fait plusieurs égalités possibles. Une seule est utile :
            celle où <strong>une seule longueur est inconnue</strong>.
          </p>
        ),
      }}
      intro={
        <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3 flex gap-3 items-start">
          <Calculator className="w-5 h-5 text-violet-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Méthode : vérifier le parallélisme · écrire les trois rapports · garder la paire à une
            seule inconnue · produit en croix · <strong>vérifier que le résultat a du sens</strong>.
          </p>
        </div>
      }
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>La suite.</strong> Tu sais calculer une longueur. Et si le parallélisme était
          justement la question ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
