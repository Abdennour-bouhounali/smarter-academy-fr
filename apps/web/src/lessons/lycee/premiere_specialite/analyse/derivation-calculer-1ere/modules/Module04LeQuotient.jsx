import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ConfrontationPente from '../components/ConfrontationPente';
import { quotient, parseSigned, POINTS_LAB } from '../components/reglesUtils';

/**
 * Module 4 — MANIPULATION : le quotient.
 *
 * Étape 1  la candidate plausible « u′ ÷ v′ » est confrontée à la pente
 *          mesurée sur x ÷ x². Le verdict est plus dur que pour le produit :
 *          ce n'est pas l'ordre de grandeur qui rate, c'est le SIGNE. La
 *          candidate annonce une montée là où la fonction descend.
 * Étape 2  la règle est posée, puis VÉRIFIÉE numériquement au même point.
 * Étape 3  le rôle du moins et de l'ordre : échanger les deux termes du
 *          numérateur donne l'opposé.
 *
 * Le point de mesure reste réglable APRÈS validation : c'est la manipulation,
 * elle ne se gèle pas.
 *
 * CONNAISSANCES AVANT LA DEMANDE : le geste (étape 1) précède la brique
 * `regle-quotient` (fin d'étape 2), qui précède les demandes de l'étape 3.
 */
export default function Module04LeQuotient() {
  const [pred, setPred] = useState(null);
  const [x1, setX1] = useState(2);
  const [mesure1, setMesure1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = mesure1;
  const done2 = q2;
  const done3 = q3;

  // x ÷ x², c'est-à-dire 1/x : une fonction dont on connaît DÉJÀ la pente
  // (module 2, −1/x²). Le contre-exemple est donc vérifiable par l'élève.
  const q = quotient({ haut: 'identite', bas: 'carre' });

  const steps = [
    {
      num: 1,
      title: 'Diviser les dos ?',
      subtitle:
        'La fraction x ÷ x², c’est 1/x — dont tu connais déjà la pente. Une candidate plausible : diviser les dos, u′ ÷ v′. Prédis, puis mesure.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="u′ ÷ v′ va-t-il donner la bonne pente ?"
            options={[
              { id: 'oui', label: 'Oui, la division se comporte comme la somme' },
              { id: 'grandeur', label: 'Non : le nombre sera faux' },
              { id: 'signe', label: 'Non : même le signe sera faux' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <ConfrontationPente
            titre="La fraction assemblée (c’est 1/x, dont tu connais la pente : −1/x²)"
            expression="f(x) = x ÷ x²"
            objet={q}
            labelNaif="u′ ÷ v′ = 1 ÷ 2x"
            labelJuste="mesurée sur la courbe, sans aucune règle"
            x={x1}
            points={POINTS_LAB}
            onChangeX={setX1}
            mesure={mesure1}
            onMesurer={() => {
              if (!mesure1) kit.react?.(true);
              setMesure1(true);
            }}
          />
          {done1 && (
            <Feedback tone="ko">
              {pred === 'signe' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde les deux nombres'} :
              en x = 2, la candidate annonce <strong>+0,25</strong> quand la pente vaut{' '}
              <strong>−0,25</strong>. Elle prétend que la courbe MONTE là où elle descend. Change
              le point : le désaccord de signe tient partout.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La règle, et sa vérification',
      subtitle:
        'La bonne écriture ressemble à celle du produit — deux termes — mais avec un moins, et un carré au dénominateur.',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-100 bg-white p-4 text-sm text-slate-700 space-y-2">
            <p className="font-mono text-center text-[15px]">(u ÷ v)′ = (u′·v − u·v′) ÷ v²</p>
            <p>
              Sur u = x et v = x² : u′v = 1 × x² = x², et uv′ = x × 2x = 2x². Le numérateur vaut
              donc x² − 2x² = −x², et le dénominateur (x²)² = x⁴.
            </p>
          </div>
          <NumericQuestion
            prompt={<>Que vaut alors cette expression en <strong>x = 2</strong> ? (numérateur −x², dénominateur x⁴)</>}
            expected={-0.25}
            parse={parseSigned(parseDec)}
            display="−0,25"
            requires={['regle-produit', 'derivees-usuelles']}
            explain="−x² en x = 2 vaut −4, et x⁴ vaut 16. Donc −4 ÷ 16 = −0,25 : exactement la pente mesurée. La règle tient."
            explainFor={(n) =>
              n === 0.25
                ? 'Le bon nombre, mais tu as perdu le moins du numérateur : x² − 2x² = −x², qui est négatif.'
                : n === -4
                ? 'C’est le numérateur seul. Il reste à le diviser par x⁴ = 16.'
                : null
            }
            solved={done2}
            onAnswered={() => setQ2(true)}
          />
          {done2 && (
            <>
              <Feedback tone="ok">
                <strong>−0,25</strong> : la règle redonne la pente mesurée, signe compris. Et
                −x² ÷ x⁴ se simplifie en −1/x², le dos de la carte 1/x. Tout se recoupe.
              </Feedback>
              <KnowledgeBrick
                id="regle-quotient"
                variant="new"
                lead={<>La règle que tu viens de vérifier, avec ce qui la rend fragile.</>}
              />
              <KnowledgeBrick
                id="mem-quotient"
                variant="new"
                lead={<>La forme courte.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le moins n’est pas décoratif',
      done: done3,
      content: (
        <TapQuestion
          prompt="Un élève écrit (u/v)′ = (u·v′ − u′·v) ÷ v² : il a échangé les deux termes du numérateur. Que produit cette erreur ?"
          options={[
            'Le résultat OPPOSÉ : la pente change de signe, donc la courbe semble monter quand elle descend',
            'Rien du tout : une soustraction se lit dans les deux sens',
            'Un résultat deux fois trop grand',
            'Une division par zéro',
          ]}
          correct={0}
          cols={1}
          requires={['regle-quotient', 'mem-quotient']}
          explain="Échanger les deux termes d’une soustraction donne l’opposé : a − b et b − a. Sur x ÷ x² en x = 2, on obtiendrait +0,25 au lieu de −0,25 — l’erreur exacte que la candidate du début commettait déjà."
          explainWrong="Une soustraction n’est pas commutative : 3 − 5 et 5 − 3 ne sont pas égaux, ils sont opposés. Le dénominateur v², lui, ne change pas — il est le même dans les deux écritures."
          solved={done3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le quotient"
      moduleSubtitle="Là où l’erreur ne se trompe plus seulement de nombre, mais de sens"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Une fraction sur le banc',
        tone: 'indigo',
        body: (
          <p>
            Après le « + » et le « × », le « ÷ ». La candidate évidente est encore une fois
            fausse — mais cette fois l’erreur est plus grave qu’un mauvais nombre : elle annonce
            le mauvais sens.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Reste une forme.</strong> Une parenthèse élevée à une puissance : (3x − 2)⁴.
          Ni somme, ni produit, ni fraction. Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
