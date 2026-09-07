import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProofOrder from '../components/ProofOrder';
import { parseDec, lcm } from '../components/arithUtils';

/**
 * Module 5 — PRACTICE LAB : « Démontrer ».
 * Remettre en ordre la preuve « la somme de deux multiples de 7 est un
 * multiple de 7 » ; prouver que la somme de trois entiers consécutifs est
 * multiple de 3 ; déjouer une fausse preuve (exemples) ; un problème de
 * rendez-vous.
 */
const PROOF = [
  { id: 'l1', text: 'Soit $a$ et $b$ deux multiples de 7.', plain: 'Soit a et b deux multiples de 7' },
  { id: 'l2', text: 'Alors il existe des entiers $k$ et $k\'$ tels que $a = 7k$ et $b = 7k\'$.', plain: 'Alors a = 7k et b = 7k’' },
  { id: 'l3', text: 'Donc $a + b = 7k + 7k\' = 7(k + k\')$.', plain: 'Donc a + b = 7(k + k’)' },
  { id: 'l4', text: 'Or $k + k\'$ est un entier.', plain: 'Or k + k’ est un entier' },
  { id: 'l5', text: 'Donc $a + b$ est un multiple de 7.', plain: 'Donc a + b est un multiple de 7' },
];
const ORDER = ['l3', 'l5', 'l1', 'l4', 'l2'];

export default function Module05Demontrer() {
  const [proofDone, setProofDone] = useState(false);
  const [consecDone, setConsecDone] = useState(false);
  const [falseDone, setFalseDone] = useState(false);
  const [rdvDone, setRdvDone] = useState(false);
  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(5)} moduleNumber={5}
      moduleTitle="Démontrer"
      moduleSubtitle="Remets une démonstration en ordre, prouve que le carré d’un impair est impair, et déjoue une fausse preuve."
      estimatedTime="10 min"
      brief={{ tag: '🧠 Mission 06', title: 'Une démonstration arithmétique : hypothèse écrite avec une lettre, transformation, conclusion.', tone: 'indigo', body: <p>Quatre exercices : ordonner, prouver, critiquer, résoudre.</p> }}
      steps={[
        {
          num: 1, title: 'Remets la preuve en ordre', subtitle: '« La somme de deux multiples de 7 est un multiple de 7. »', done: proofDone,
          content: (
            <div className="space-y-3">
              <ProofOrder lines={PROOF} order={ORDER} onDone={() => setProofDone(true)} solved={proofDone} />
              {/* La preuve remise en ordre EST la méthode : la nommer avant
                  de la réutiliser à l'étape 2. */}
              {proofDone && (
                <KnowledgeBrick
                  id="methode-demonstration-arithmetique"
                  variant="new"
                  lead={<>Tu viens de remettre en ordre : écrire l’hypothèse avec une lettre, transformer, vérifier que le facteur restant est un entier, conclure par la définition.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 2, title: 'Trois entiers consécutifs', done: consecDone,
          content: <TapQuestion prompt={<>La somme de trois entiers consécutifs <MathText>{'$n + (n+1) + (n+2)$'}</MathText> vaut :</>}
            options={['$3n + 3 = 3(n + 1)$ : toujours un multiple de 3', '$3n + 3$ : parfois multiple de 3', '$n^{3} + 3$', '$3n$ : multiple de 3 seulement si n l’est']}
            renderOption={(o) => <MathText>{o}</MathText>} optionLabel={(i) => ['3(n + 1), toujours multiple de 3', '3n + 3, parfois', 'n³ + 3', '3n, seulement si n l’est'][i]} cols={2} correct={0}
            requires={['methode-demonstration-arithmetique']}
            explain="n + (n + 1) + (n + 2) = 3n + 3 = 3(n + 1), et n + 1 est un entier : la somme est un multiple de 3, quel que soit n. (Elle vaut même 3 × le nombre du milieu.)"
            explainWrong="Additionne : 3n + 3. Factorise par 3 : 3(n + 1). Comme n + 1 est entier, c’est 3 × (un entier) — un multiple de 3, toujours."
            solved={consecDone} onAnswered={() => setConsecDone(true)} />,
        },
        {
          num: 3, title: 'La fausse preuve', done: falseDone,
          content: (
            <div className="space-y-3">
              <TapQuestion prompt="Léa écrit : « n² + n + 1 est toujours impair, car pour n = 1, 2, 3, 4 on trouve 3, 7, 13, 21 — tous impairs. » Que penser de sa preuve ?" options={['Sa conclusion est juste, mais sa preuve ne l’est pas : quatre exemples ne couvrent pas tous les entiers', 'Sa preuve est correcte', 'Sa conclusion est fausse : n = 2 donne 7, qui est impair']} cols={1} correct={0}
                requires={['methode-demonstration-arithmetique']}
                explain="La conclusion se démontre : n² + n = n(n + 1) est le produit de deux entiers consécutifs, donc pair ; pair + 1 = impair. Quatre exemples ne prouvent rien — mais ici ils ne trompent pas, contrairement au polynôme d’Euler n² + n + 41, premier pour n = 0 à 39 et composé pour n = 40."
                explainWrong="Ses quatre résultats sont bien impairs, donc sa conclusion tient — mais des exemples ne sont pas une preuve. La preuve : n(n + 1) est pair (deux consécutifs), donc n(n + 1) + 1 est impair."
                solved={falseDone} onAnswered={() => setFalseDone(true)} />
              {/* Le piège de Léa vient de montrer la limite des exemples ;
                  la règle générale se pose maintenant, avant l'étape 4. */}
              {falseDone && (
                <KnowledgeBrick
                  id="regle-exemples-pas-preuve"
                  variant="new"
                  lead={<>La conclusion de Léa était juste, sa preuve non : des exemples, même nombreux, ne sont jamais une démonstration.</>}
                />
              )}
              {falseDone && (
                <KnowledgeBrick
                  id="mem-conclure-par-definition"
                  variant="new"
                  compact
                  lead={<>⭐ Retiens : faire apparaître « p × un entier », puis le dire — c’est ce qui conclut une démonstration arithmétique.</>}
                />
              )}
            </div>
          ),
        },
        {
          num: 4, title: 'Le rendez-vous du club', subtitle: 'Un club se réunit tous les 8 jours, un autre tous les 12 jours. Ils se réunissent ensemble aujourd’hui.', done: rdvDone,
          content: <NumericQuestion prompt="Dans combien de jours se réuniront-ils de nouveau ensemble ?" expected={lcm(8, 12)} parse={parseDec} suffix="jours"
            requires={['ppcm']}
            explain="Il faut un multiple commun de 8 et 12 : 24 est le plus petit (24 = 8 × 3 = 12 × 2). Le suivant sera 48."
            explainFor={(v) => (v === 96 ? '96 = 8 × 12 est bien un rendez-vous, mais pas le PREMIER : 24 l’est déjà.' : v === 20 ? '20 est la somme 8 + 12, pas un multiple commun : 20 n’est ni multiple de 8 ni de 12.' : v === 4 ? '4 est le PGCD (le plus grand diviseur commun) ; ici on cherche un multiple commun : 24.' : 'Les multiples de 8 : 8, 16, 24… ceux de 12 : 12, 24… Le premier commun est 24.')}
            solved={rdvDone} onAnswered={() => setRdvDone(true)} />,
        },
      ]}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
