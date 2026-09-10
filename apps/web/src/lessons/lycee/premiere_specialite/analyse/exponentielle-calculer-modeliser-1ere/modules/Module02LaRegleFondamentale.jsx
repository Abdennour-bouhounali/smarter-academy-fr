import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DoubleAxe from '../components/DoubleAxe';
import { valeurAffichee, parLaSomme, parseSigned, piegesSomme } from '../components/reglesExpoUtils';

/**
 * Module 2 — DÉCOUVERTE : ce que les deux afficheurs répétaient reçoit son
 * énoncé, et sa parenté avec les puissances.
 *
 * Étape 1  ÉCRIRE CE QU'ON A VU. La coïncidence des deux afficheurs s'écrit en
 *          une égalité. La brique `relation-fondamentale-exp` la porte, APRÈS
 *          que l'élève ait choisi la bonne écriture.
 * Étape 2  LA PARENTÉ. Ce n'est pas une loi neuve : c'est celle des puissances,
 *          déjà connue depuis la 4e. Cela vaut mieux qu'une formule de plus.
 * Étape 3  S'EN SERVIR, dans les deux sens. Un produit devient une somme, et
 *          réciproquement.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste rappelé → briques
 * `relation-fondamentale-exp` puis `mem-somme-devient-produit` ; étapes 2 et 3
 * les demandes, désormais légitimes.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 1 reste pilotable après
 * validation — l'élève doit pouvoir refaire le geste en lisant l'égalité qui
 * vient d'être écrite.
 */
export default function Module02LaRegleFondamentale() {
  const [a, setA] = useState(1.5);
  const [b, setB] = useState(-0.5);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  // Le couple de l'épreuve d'application : 3 + 2, dont les pièges sont calculés
  // et prouvés distincts par le test (section 9).
  const pieges = piegesSomme(3, 2);

  const steps = [
    {
      num: 1,
      title: 'Écris ce que tu as constaté',
      subtitle:
        'Reprends les curseurs si tu veux : les deux grands nombres restent égaux. Comment cette égalité s’écrit-elle, une fois pour toutes ?',
      done: q1,
      content: (
        <div className="space-y-3">
          <DoubleAxe a={a} b={b} onChangeA={setA} onChangeB={setB} />
          <TapQuestion
            prompt="« Additionner deux exposants revient à multiplier les deux valeurs correspondantes. » Comment cela s’écrit-il ?"
            options={[
              'e^(a+b) = e^a × e^b',
              'e^(a+b) = e^a + e^b',
              'e^(a+b) = e^(a×b)',
              'e^(a+b) = a × b',
            ]}
            correct={0}
            cols={2}
            requires={['exponentielle', 'exposant', 'notation-fx']}
            explain="À gauche l’exposant est la SOMME a + b — c’est ce que fait l’axe du haut ; à droite les deux valeurs se MULTIPLIENT — c’est ce que fait l’axe du bas. L’égalité dit que les deux chemins mènent au même nombre, et le laboratoire l’a montré à chaque cran."
            explainWrong="Vérifie sur ton laboratoire avec a = 1 et b = 1 : e^2 vaut environ 7,39, alors que e + e ne fait qu’environ 5,44. L’addition des valeurs ne marche pas. Et e^(a×b) donnerait e^1 = e, ce qui n’est pas non plus ce que l’afficheur montre."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <>
              <Feedback tone="ok">
                Une seule égalité, valable pour tous les nombres a et b — y compris négatifs, comme
                tu l’as vu à l’étape 3 du module précédent.
              </Feedback>
              <KnowledgeBrick
                id="relation-fondamentale-exp"
                variant="new"
                lead={<>Ce que les deux afficheurs répétaient sans jamais se contredire, écrit une fois pour toutes.</>}
              />
              <KnowledgeBrick
                id="mem-somme-devient-produit"
                variant="new"
                lead={<>La seule relation de cette leçon à retenir par cœur : les autres s’en déduisent.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce n’est pas une loi neuve',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-violet-900">Une parenté à reconnaître</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-center">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-[13px] text-slate-500">depuis la 4<sup>e</sup></div>
                <MathText>{'$a^{m} \\times a^{n} = a^{m+n}$'}</MathText>
              </div>
              <div className="rounded-lg border-2 border-violet-300 bg-violet-50 px-3 py-2">
                <div className="text-[13px] text-violet-700">aujourd’hui</div>
                <MathText>{'$e^{a} \\times e^{b} = e^{a+b}$'}</MathText>
              </div>
            </div>
            <p>
              Les deux lignes disent la même chose, avec la même base des deux côtés d’un produit.
            </p>
          </div>
          <TapQuestion
            prompt="Pourquoi cette ressemblance avec la règle des puissances n’est-elle pas une coïncidence ?"
            options={[
              'Parce que e^x se comporte comme une puissance : e est la base, x est l’exposant',
              'Parce que toutes les fonctions vérifient cette égalité',
              'Parce que e vaut environ 2,718, et que 2,718 est un nombre entier',
              'Parce que l’égalité n’est vraie que pour des exposants entiers',
            ]}
            correct={0}
            cols={1}
            requires={['relation-fondamentale-exp', 'puissance', 'exposant', 'regles-puissances']}
            explain="La notation e^x n’est pas un hasard d’écriture : elle dit que e joue le rôle de la base et x celui de l’exposant. La nouveauté de la Première est que x peut désormais être N’IMPORTE QUEL nombre — 0,25, −1,5 — et pas seulement un entier."
            explainWrong="Non : la plupart des fonctions ne vérifient rien de tel. Prends f(x) = x² : f(1 + 1) = 4, alors que f(1) × f(1) = 1. La propriété est spécifique — et elle vient de ce que e^x EST une puissance de base e."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="ok">
              C’est une bonne nouvelle : tu ne mémorises rien de neuf, tu retrouves une loi que tu
              appliques depuis la 4<sup>e</sup>, sur une base nouvelle.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'S’en servir dans les deux sens',
      subtitle:
        'La règle sert autant à REGROUPER un produit en une seule exponentielle qu’à SÉPARER une exponentielle en un produit.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-violet-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p>
              <strong>Regrouper :</strong> e² × e⁵ = e^(2+5) = e⁷. Un seul symbole au lieu de deux.
            </p>
            <p>
              <strong>Séparer :</strong> e⁷ = e² × e⁵, ou e³ × e⁴, ou e⁶ × e¹ — au choix, selon ce
              qui arrange le calcul.
            </p>
          </div>
          <NumericQuestion
            prompt={<>On écrit <strong>e³ × e²</strong> sous la forme d’une seule exponentielle e^n. Que vaut n ?</>}
            expected={pieges.bon}
            parse={(raw) => parseSigned(raw, parseDec)}
            display="5"
            requires={['relation-fondamentale-exp', 'mem-somme-devient-produit']}
            explain="On additionne les exposants : 3 + 2 = 5, donc e³ × e² = e⁵. La règle ne demande aucun calcul de valeur — seulement une addition."
            explainFor={(n) =>
              n === pieges.produitDesExposants
                ? 'Tu as multiplié les exposants entre eux : 3 × 2 = 6. Mais la règle transforme un PRODUIT de valeurs en une SOMME d’exposants — elle ne multiplie pas les exposants.'
                : n === pieges.differenceDesExposants
                ? 'Tu les as soustraits : 3 − 2 = 1. La soustraction correspond à un QUOTIENT, pas à un produit — c’est le module suivant.'
                : n === pieges.exposantInchange
                ? 'Tu as gardé le premier exposant seul. Le second facteur, e², n’est pas neutre : seul e⁰ = 1 le serait.'
                : null
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              e³ × e² = e⁵, et sa valeur est {valeurAffichee(parLaSomme(3, 2))}. Remarque qu’on n’a
              jamais eu besoin de calculer e³ ni e² séparément : c’est tout l’intérêt de la règle.
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
      moduleTitle="La règle fondamentale"
      moduleSubtitle="Une seule ligne, et une vieille connaissance"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Ce que tu as constaté a un énoncé',
        tone: 'indigo',
        body: (
          <p>
            Les deux afficheurs n’ont jamais divergé, quel que soit le couple. Voici comment cela
            s’écrit — et pourquoi ce n’est pas une formule de plus, mais une loi que tu connais
            déjà.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          <strong>Et si l’on recule ?</strong> Tu as vu qu’un curseur négatif faisait repartir la
          longueur en arrière. Que devient alors la valeur ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
