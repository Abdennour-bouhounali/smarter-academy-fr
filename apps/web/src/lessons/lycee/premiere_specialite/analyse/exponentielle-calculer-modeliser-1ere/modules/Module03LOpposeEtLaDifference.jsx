import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DoubleAxe from '../components/DoubleAxe';
import { valeurAffichee, REGLE_PAR_ID, parseSigned, fr } from '../components/reglesExpoUtils';

/**
 * Module 3 — DÉCOUVERTE : l'opposé donne l'inverse, la différence donne le
 * quotient. AUCUNE des deux n'est admise : toutes deux se DÉDUISENT de la
 * relation fondamentale, et la déduction est le contenu du module.
 *
 * Étape 1  LE COUPLE QUI S'ANNULE. L'élève amène a et b sur deux valeurs
 *          opposées — a = 1 et b = −1 — et voit la longueur composée revenir
 *          exactement sur 1. Deux nombres dont le produit vaut 1 : l'inverse.
 * Étape 2  LA DÉDUCTION, écrite. e^a × e^(−a) = e^0 = 1, donc e^(−a) = 1/e^a.
 *          Brique `exp-oppose-inverse`, et le piège « e^(−a) = −e^a » confronté.
 * Étape 3  LA DIFFÉRENCE, qui n'est que la première règle appliquée à a + (−b).
 *          Brique `exp-difference-quotient`, puis la brique à mémoriser.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → étape 2 déduction menée →
 * briques `exp-oppose-inverse` ; étape 3 déduction menée → briques
 * `exp-difference-quotient` et `mem-oppose-et-difference`.
 *
 * MANIPULATION JAMAIS GELÉE : le laboratoire de l'étape 1 reste pilotable après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 3 sur l'étape 1.
 */
export default function Module03LOpposeEtLaDifference() {
  const [a1, setA1] = useState(1);
  const [b1, setB1] = useState(0);
  const [vuOppose, setVuOppose] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [a4, setA4] = useState(2);
  const [b4, setB4] = useState(-1);
  const [q5, setQ5] = useState(false);

  const done1 = vuOppose;

  const viser1 = (na, nb, react) => {
    setA1(na);
    setB1(nb);
    // La cible : deux exposants opposés et non nuls, donc une somme nulle.
    if (!vuOppose && na !== 0 && Math.abs(na + nb) < 1e-9) {
      setVuOppose(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Trouve un couple qui ramène la longueur à son point de départ',
      subtitle:
        'Fais glisser a et b pour que la longueur composée du bas revienne exactement sur 1 — sans mettre les deux curseurs sur 0.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DoubleAxe
            a={a1}
            b={b1}
            onChangeA={(v) => viser1(v, b1, kit.react)}
            onChangeB={(v) => viser1(a1, v, kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              Tu as trouvé : a = {fr(a1)} et b = {fr(b1)}, deux exposants <strong>opposés</strong>.
              Leur somme vaut 0, et en bas la longueur composée revient exactement sur 1. Or les
              deux valeurs, elles, ne valent pas 1 : {valeurAffichee(Math.exp(a1))} et{' '}
              {valeurAffichee(Math.exp(b1))}. Deux nombres différents de 1, dont le produit vaut 1 —
              tu connais ce lien.
            </Feedback>
          ) : (
            <Feedback tone="info">
              a vaut {fr(a1)}, b vaut {fr(b1)}, leur somme vaut {fr(a1 + b1)}. Cherche une somme
              nulle avec deux curseurs qui ne sont pas tous les deux sur 0.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux nombres dont le produit vaut 1',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-semibold text-sky-900">La déduction, en trois lignes</p>
            <div className="text-center">
              <MathText>{'$$e^{a} \\times e^{-a} = e^{a + (-a)} = e^{0} = 1$$'}</MathText>
            </div>
            <p>
              La première ligne n’est que la règle du module précédent, appliquée au couple (a ; −a).
              La dernière donne un produit égal à 1.
            </p>
          </div>
          <TapQuestion
            prompt="On sait que e^a × e^(−a) = 1. Qu’est-ce que cela dit de e^(−a) ?"
            options={[
              'C’est l’inverse de e^a, c’est-à-dire 1 / e^a',
              'C’est l’opposé de e^a, c’est-à-dire −e^a',
              'C’est e^a lui-même',
              'C’est 0, puisque a et −a se compensent',
            ]}
            correct={0}
            cols={2}
            requires={['relation-fondamentale-exp', 'inverse-nombre', 'exp-strictement-positive']}
            explain="Deux nombres dont le produit vaut 1 sont l’inverse l’un de l’autre : c’est la définition même de l’inverse. Donc e^(−a) = 1/e^a."
            explainWrong="Un nombre et son opposé ont toujours un produit NÉGATIF : ici cela donnerait −(e^a)², jamais 1. Et cette fonction ne prend que des valeurs strictement positives : e^(−a) ne peut donc être ni négatif, ni nul."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Vérification sur ton laboratoire : e^(−1) vaut {valeurAffichee(Math.exp(-1))}, et
                1 / e vaut la même chose. Petit, mais bel et bien positif.
              </Feedback>
              <KnowledgeBrick
                id="exp-oppose-inverse"
                variant="new"
                lead={<>Un exposant opposé retourne la valeur — il ne change jamais son signe.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Et la différence ?',
      subtitle: 'a − b, c’est a + (−b). Rien de neuf n’est nécessaire.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <div className="text-center">
              <MathText>{'$$e^{a-b} = e^{a + (-b)} = e^{a} \\times e^{-b} = e^{a} \\times \\dfrac{1}{e^{b}}$$'}</MathText>
            </div>
            <p>
              Trois égalités, et aucune n’a rien exigé de neuf : la première réécrit la soustraction,
              la deuxième applique la règle fondamentale, la troisième celle de l’exposant opposé.
            </p>
          </div>
          <TapQuestion
            prompt="Multiplier par 1/e^b, c’est…"
            options={[
              'diviser par e^b : donc e^(a−b) = e^a / e^b',
              'soustraire e^b : donc e^(a−b) = e^a − e^b',
              'ajouter e^b : donc e^(a−b) = e^a + e^b',
              'élever à la puissance b',
            ]}
            correct={0}
            cols={1}
            requires={['exp-oppose-inverse', 'quotient', 'inverse-nombre']}
            explain="Multiplier par l’inverse d’un nombre, c’est diviser par ce nombre — la règle vaut depuis la classe de 4e. La différence des exposants correspond donc à un quotient de valeurs."
            explainWrong="Attention à ne pas transporter la soustraction telle quelle : e^(a−b) n’est pas e^a − e^b. Avec a = 2 et b = 1, le premier vaut e ≈ 2,718 et le second environ 4,67. Ce sont deux nombres bien différents."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <>
              <Feedback tone="ok">
                Quatre relations en tout, dont <strong>une seule</strong> a vraiment été admise. Les
                trois autres se déduisent en deux lignes — et cela vaut mieux que quatre formules à
                mémoriser séparément.
              </Feedback>
              <KnowledgeBrick
                id="exp-difference-quotient"
                variant="new"
                lead={<>La différence des exposants, et le quotient qu’elle produit.</>}
              />
              <KnowledgeBrick
                id="mem-oppose-et-difference"
                variant="new"
                lead={<>Les deux relations du jour, côte à côte.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Lis-le sur les axes',
      subtitle:
        'Amène a sur 2 et b sur −1 : en haut, 2 + (−1) = 1. En bas, la longueur avance puis RECULE. C’est une division.',
      done: q5,
      content: (
        <div className="space-y-3">
          <DoubleAxe
            a={a4}
            b={b4}
            onChangeA={setA4}
            onChangeB={setB4}
            verrouille={!done1}
          />
          <NumericQuestion
            prompt={<>Écris <strong>e⁵ / e²</strong> sous la forme d’une seule exponentielle e^n. Que vaut n ?</>}
            expected={3}
            parse={(raw) => parseSigned(raw, parseDec)}
            display="3"
            requires={['exp-difference-quotient', 'mem-oppose-et-difference']}
            explain="On soustrait les exposants : 5 − 2 = 3, donc e⁵ / e² = e³. Comme pour le produit, aucune valeur n’a besoin d’être calculée."
            explainFor={(n) =>
              n === 7
                ? 'Tu as additionné : 5 + 2 = 7. L’addition correspond au PRODUIT ; ici il s’agit d’un quotient, donc d’une soustraction.'
                : n === 2.5
                ? 'Tu as divisé les exposants entre eux : 5 ÷ 2 = 2,5. La règle transforme un quotient de valeurs en une DIFFÉRENCE d’exposants, pas en un quotient d’exposants.'
                : null
            }
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="ok">
              e⁵ / e² = e³ ≈ {valeurAffichee(REGLE_PAR_ID.difference.gauche(5, 2))}. Et si l’on
              inversait — e² / e⁵ — on trouverait e^(−3), un nombre inférieur à 1 mais toujours
              strictement positif.
            </Feedback>
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
      moduleTitle="L’opposé, et la différence"
      moduleSubtitle="Deux relations de plus, et pas une de neuve"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Tout sort de la même ligne',
        tone: 'indigo',
        body: (
          <p>
            Tu as vu un curseur négatif faire <strong>reculer</strong> la longueur du bas. Ce recul
            a un nom, et il se déduit — sans rien admettre de plus — de la règle du module
            précédent.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Et si l’on répétait ?</strong> Multiplier e^a par lui-même, encore et encore :
          que devient l’exposant ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
