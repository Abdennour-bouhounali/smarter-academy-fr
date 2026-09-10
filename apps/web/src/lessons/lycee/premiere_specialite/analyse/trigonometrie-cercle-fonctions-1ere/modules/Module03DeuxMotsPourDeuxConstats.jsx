import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseReel } from '../components/parseBridge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DerouleurLab from '../components/DerouleurLab';
import { SIN, COS, TAU, sinExact, cosExact, fr, labelPi } from '../components/trigFnUtils';

/**
 * Module 3 — DÉCOUVERTE : les deux constats du module 1 reçoivent leur nom.
 *
 * Étape 1  LA PÉRIODICITÉ. Un tableau à deux colonnes, rempli par le noyau :
 *          x et x + 2π donnent la même valeur, pour les deux fonctions. La
 *          brique `periodicite` est posée APRÈS ce constat, et elle établit
 *          aussi le terme de lexique du même nom.
 * Étape 2  la méthode qui en découle : ramener un réel dans un tour.
 * Étape 3  LA PARITÉ. Le contraste du module 1 est remis sous les yeux, cette
 *          fois chiffré : sin(−x) = −sin x, cos(−x) = cos x.
 * Étape 4  la question qui SÉPARE les deux propriétés — c'est la confusion la
 *          plus fréquente, et elle est traitée frontalement.
 *
 * CONNAISSANCES AVANT LA DEMANDE. L'ordre du source EST la ligne du temps :
 *   étape 1  tableau constaté → brique `periodicite` → demande
 *   étape 2  brique `methode-ramener-dans-un-tour` → demande
 *   étape 3  tableau constaté → briques `parite-sinus-cosinus` puis
 *            `mem-pair-cos-impair-sin` → demande
 *   étape 4  la question de tri, qui n'exige que ce qui précède.
 *
 * MANIPULATION JAMAIS GELÉE : les deux dérouloirs restent pilotables.
 */
const CRANS_TABLE = [2, 6, 8, 12];   // π/6, π/2, 2π/3, π

export default function Module03DeuxMotsPourDeuxConstats() {
  const [cran1, setCran1] = useState(0);
  const [vus1, setVus1] = useState([0]);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [cran3, setCran3] = useState(0);
  const [vus3, setVus3] = useState([0]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const visiter = (v, vus, setVus, setCran) => {
    setCran(v);
    if (!vus.includes(v)) setVus([...vus, v]);
  };

  const PAS_RAD = Math.PI / 12;

  const steps = [
    {
      num: 1,
      title: 'Le premier constat : ajouter un tour ne change rien',
      subtitle:
        'Voici, calculées, les valeurs en x et en x + 2π. Compare les deux colonnes — puis vérifie sur le dérouloir.',
      done: q1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white">
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-2 py-2 text-left">x</th>
                  <th className="px-2 py-2">sin x</th>
                  <th className="px-2 py-2">sin(x + 2π)</th>
                  <th className="px-2 py-2">cos x</th>
                  <th className="px-2 py-2">cos(x + 2π)</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {CRANS_TABLE.map((n) => {
                  const t = n * PAS_RAD;
                  return (
                    <tr key={n} className="border-t">
                      <th className="px-2 py-1.5 text-left font-sans font-semibold">{labelPi(t)}</th>
                      <td className="px-2 py-1.5">{fr(sinExact(t))}</td>
                      <td className="px-2 py-1.5 bg-emerald-50 font-bold">{fr(sinExact(t + TAU))}</td>
                      <td className="px-2 py-1.5">{fr(cosExact(t))}</td>
                      <td className="px-2 py-1.5 bg-emerald-50 font-bold">{fr(cosExact(t + TAU))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <DerouleurLab fn={SIN} cran={cran1} visites={vus1} onChangeCran={(v) => visiter(v, vus1, setVus1, setCran1)} />
          <KnowledgeBrick
            id="periodicite"
            variant="new"
            establishes={['periodicite']}
            lead={<>Les colonnes vertes sont identiques aux blanches. Ce phénomène porte un nom.</>}
          />
          <TapQuestion
            prompt="Quelle est la plus PETITE longueur dont il faut avancer pour que la courbe se répète à l’identique ?"
            options={['2π', 'π', 'π/2', '4π']}
            correct={0}
            cols={4}
            requires={['periodicite', 'reel-au-dela-du-tour']}
            explain="2π est un tour complet : c’est exactement ce qu’il faut pour revenir au même point du cercle. 4π convient aussi (deux tours), mais ce n’est pas le plus petit."
            explainWrong="Vérifie avec un demi-tour : sin(π/2) = 1 alors que sin(π/2 + π) = −1. Un demi-tour ne suffit donc pas. Il faut un tour ENTIER, soit 2π."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'S’en servir : ramener un réel dans un tour',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-ramener-dans-un-tour"
            variant="new"
            lead={<>Puisque ajouter un tour ne change rien, on peut en RETRANCHER autant qu’on veut.</>}
          />
          <NumericQuestion
            prompt={<>Que vaut <strong>cos(9π/4)</strong> ? (Réponds par une valeur décimale arrondie au centième.)</>}
            expected={(n) => Math.abs(n - Math.SQRT2 / 2) < 0.02}
            parse={parseReel}
            display="0,71"
            requires={['periodicite', 'methode-ramener-dans-un-tour', 'valeurs-remarquables']}
            explain="9π/4 − 2π = 9π/4 − 8π/4 = π/4. Donc cos(9π/4) = cos(π/4) = √2/2 ≈ 0,71."
            explainFor={(n) =>
              Math.abs(n - 0.5) < 0.02
                ? 'C’est cos(π/3). Ici il faut d’abord retrancher un tour : 9π/4 − 8π/4 = π/4, et cos(π/4) ≈ 0,71.'
                : Math.abs(n + Math.SQRT2 / 2) < 0.02
                ? 'Le bon nombre, mais le signe est à revoir : π/4 est dans le premier quart de tour, où l’abscisse est positive.'
                : null
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le second constat : changer de sens',
      subtitle:
        'Cette fois on compare x et −x. Regarde bien : les deux fonctions ne réagissent PAS de la même façon.',
      done: q3,
      content: (kit) => (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-xl border border-sky-100 bg-white">
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-600">
                  <th className="px-2 py-2 text-left">x</th>
                  <th className="px-2 py-2">sin x</th>
                  <th className="px-2 py-2">sin(−x)</th>
                  <th className="px-2 py-2">cos x</th>
                  <th className="px-2 py-2">cos(−x)</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {CRANS_TABLE.map((n) => {
                  const t = n * PAS_RAD;
                  return (
                    <tr key={n} className="border-t">
                      <th className="px-2 py-1.5 text-left font-sans font-semibold">{labelPi(t)}</th>
                      <td className="px-2 py-1.5">{fr(sinExact(t))}</td>
                      <td className="px-2 py-1.5 bg-emerald-50 font-bold">{fr(sinExact(-t))}</td>
                      <td className="px-2 py-1.5">{fr(cosExact(t))}</td>
                      <td className="px-2 py-1.5 bg-indigo-50 font-bold">{fr(cosExact(-t))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Feedback tone="info">
            Colonne verte : les valeurs sont <strong>opposées</strong> à celles de sin x. Colonne
            bleue : elles sont <strong>identiques</strong> à celles de cos x. Vérifie-le en
            enroulant à l’envers.
          </Feedback>
          <DerouleurLab
            fn={COS}
            cran={cran3}
            visites={vus3}
            fantome={SIN}
            onChangeCran={(v) => visiter(v, vus3, setVus3, setCran3)}
            label="Dérouler le cercle — le cosinus, avec le sinus en fantôme"
          />
          <KnowledgeBrick
            id="parite-sinus-cosinus"
            variant="new"
            lead={<>Ces deux comportements portent chacun un nom. Les voici.</>}
          />
          <KnowledgeBrick id="mem-pair-cos-impair-sin" variant="new" />
          <TapQuestion
            prompt="On sait que sin(π/3) ≈ 0,87. Que vaut sin(−π/3) ?"
            options={['≈ −0,87', '≈ 0,87', '≈ 0,5', '≈ −0,5']}
            correct={0}
            cols={4}
            requires={['parite-sinus-cosinus', 'mem-pair-cos-impair-sin']}
            explain="Le sinus est impair : sin(−x) = −sin x. Donc sin(−π/3) = −sin(π/3) ≈ −0,87. C’est le COSINUS qui aurait gardé sa valeur."
            explainWrong="Attention à ne pas échanger les deux règles. C’est cos(−x) qui vaut cos x ; sin(−x), lui, change de signe. Enroule −π/3 sur le dérouloir : le point est SOUS l’axe horizontal, donc sa hauteur est négative."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ne pas confondre les deux',
      done: q4,
      content: (
        <BatchChoiceQuestion
          intro={<p>Pour chaque égalité, dis de quelle propriété il s’agit.</p>}
          rows={[
            { id: 'r1', label: 'cos(x + 2π) = cos x', options: ['la périodicité', 'la parité'], correct: 0, correction: 'On AJOUTE un tour : c’est la périodicité.' },
            { id: 'r2', label: 'cos(−x) = cos x', options: ['la parité', 'la périodicité'], correct: 0, correction: 'On change le SIGNE du réel : c’est la parité. Le cosinus est pair.' },
            { id: 'r3', label: 'sin(−x) = −sin x', options: ['la parité', 'la périodicité'], correct: 0, correction: 'Encore le signe du réel : c’est la parité. Le sinus est impair.' },
            { id: 'r4', label: 'sin(x + 4π) = sin x', options: ['la périodicité', 'la parité'], correct: 0, correction: 'On ajoute DEUX tours : c’est toujours la périodicité.' },
          ]}
          requires={['periodicite', 'parite-sinus-cosinus']}
          feedback={({ allRight }) =>
            allRight ? (
              <>Le repère est simple : si l’on <strong>ajoute</strong> un nombre entier de tours, c’est la périodicité ; si l’on <strong>change le signe</strong> de x, c’est la parité.</>
            ) : (
              <>Regarde ce qu’on fait à x. « x + 2π » : on ajoute un tour → périodicité. « −x » : on change le sens du parcours → parité.</>
            )
          }
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Deux mots pour deux constats"
      moduleSubtitle="Ce que tu as vu au module 1 porte enfin son nom"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Répéter, et retourner',
        tone: 'indigo',
        body: (
          <p>
            Au module 1, tu as vu la trace refaire la même forme au tour suivant, et se retourner
            quand on tourne à l’envers. Deux phénomènes, deux noms. Les voici — et surtout, voici
            ce qui les distingue.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Il reste à étudier la forme.</strong> Tu sais que la courbe se répète et comment
          elle se retourne. Mais dans un seul tour, que fait-elle exactement — où monte-t-elle, où
          descend-elle ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
