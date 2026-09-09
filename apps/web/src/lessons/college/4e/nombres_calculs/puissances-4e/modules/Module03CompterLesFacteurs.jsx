import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FacteursLab from '../components/FacteursLab';
import { diagnostiquerProduit, diagnostiquerQuotient, pow } from '../components/puissances4e';

/**
 * Module 3 — MANIPULATION : les trois règles, lues sur le compte des facteurs.
 *
 * Activity              régler les deux exposants d'un produit puis d'un
 *                       quotient, et compter les pastilles.
 * Mathematical objective aᵐ × aⁿ = aᵐ⁺ⁿ et aᵐ ÷ aⁿ = aᵐ⁻ⁿ ne sont pas des
 *                       formules à retenir : ce sont des COMPTES. Deux
 *                       paquets bout à bout s'additionnent ; des facteurs
 *                       communs se simplifient et laissent la différence.
 * Expected observation  « je n'ai jamais besoin de calculer la valeur » —
 *                       et, en poussant le quotient, « quand j'enlève plus
 *                       de facteurs qu'il n'y en a, j'obtiens un exposant
 *                       négatif », ce qui raccorde au module 2.
 * Misconception targeted « aᵐ × aⁿ = aᵐˣⁿ » (multiplier les exposants), et
 *                       « 2³ × 3² = 6⁵ » (mélanger deux bases).
 *
 * Le module 2 était nécessaire avant celui-ci : sans l'exposant négatif, le
 * quotient 10² ÷ 10⁵ n'aurait pas de réponse écrivable.
 */
export default function Module03CompterLesFacteurs() {
  // Étape 1 — le produit.
  const [m1, setM1] = useState(3);
  const [n1, setN1] = useState(2);
  const [essais1, setEssais1] = useState(0);
  const done1 = essais1 >= 3;

  // Étape 2 — le quotient, poussé jusqu'à l'exposant négatif.
  const [m2, setM2] = useState(5);
  const [n2, setN2] = useState(2);
  const [vuNegatif, setVuNegatif] = useState(false);

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);
  const [q6, setQ6] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le produit : deux paquets bout à bout',
      subtitle: 'Change les deux exposants et compte les pastilles du résultat.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <FacteursLab
            base={2}
            op="×"
            m={m1}
            n={n1}
            onM={(v) => {
              setM1(v);
              const e = essais1 + 1;
              setEssais1(e);
              if (e === 3) kit.react(true);
            }}
            onN={(v) => {
              setN1(v);
              const e = essais1 + 1;
              setEssais1(e);
              if (e === 3) kit.react(true);
            }}
          />
          {done1 ? (
            <Feedback tone="ok">
              À chaque fois, le résultat compte <strong>{m1} + {n1} = {m1 + n1}</strong> facteurs. Mettre
              deux paquets bout à bout, c’est <strong>additionner</strong> leurs effectifs — jamais les
              multiplier. Tu n’as pas eu besoin de calculer une seule valeur.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie encore deux ou trois réglages. Compte les pastilles de chaque rangée, puis
              celles du résultat.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le quotient : les facteurs qui s’annulent',
      subtitle: 'Même laboratoire, mais on divise. Descends le 1ᵉʳ exposant sous le second — que se passe-t-il ?',
      done: vuNegatif,
      content: (kit) => (
        <div className="space-y-3">
          <FacteursLab
            base={2}
            op="÷"
            m={m2}
            n={n2}
            onM={(v) => {
              setM2(v);
              if (v - n2 < 0 && !vuNegatif) {
                setVuNegatif(true);
                kit.react(true);
              }
            }}
            onN={(v) => {
              setN2(v);
              if (m2 - v < 0 && !vuNegatif) {
                setVuNegatif(true);
                kit.react(true);
              }
            }}
          />
          {vuNegatif ? (
            <Feedback tone="ok">
              Quand on enlève <strong>plus</strong> de facteurs qu’il n’y en a, l’exposant devient{' '}
              <strong>négatif</strong> — et tu sais déjà ce que ça veut dire : il reste une division.
              La règle « on soustrait les exposants » ne connaît donc aucune exception, même quand le
              résultat passe sous zéro.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Les pastilles grises barrées sont celles qui se simplifient. Essaie de rendre le 1ᵉʳ
              exposant <strong>plus petit</strong> que le second.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Applique sans le laboratoire',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regles-puissances"
            variant="new"
            lead={<>Tu viens de compter des facteurs pour un produit puis pour un quotient. Ces deux comptes s’écrivent en deux règles — plus une troisième, du même genre.</>}
          />
          <NumericQuestion
            prompt="10⁴ × 10⁷ = 10 puissance combien ?"
            expected={11}
            requires={['regles-puissances']}
            explain="Quatre facteurs 10 puis sept autres : onze en tout. D’où 10¹¹."
            explainFor={(n) => {
              const code = diagnostiquerProduit(pow(10, 4), pow(10, 7), n);
              if (code === 'exposants-multiplies') {
                return "Tu as multiplié les exposants (4 × 7 = 28). Mais mettre deux paquets bout à bout ADDITIONNE leurs effectifs : 4 + 7 = 11. Les pastilles le montraient.";
              }
              if (code === 'a-soustrait') {
                return "Tu as soustrait : c’est la règle du QUOTIENT. Ici il s’agit d’un produit, donc on additionne.";
              }
              return "On additionne les exposants : 4 + 7 = 11.";
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un quotient qui descend sous zéro',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="10³ ÷ 10⁸ = 10 puissance combien ? (tape un nombre négatif si besoin, avec le signe −)"
            expected={-5}
            parse={(s) => {
              // parseFr refuse les négatifs (memory: parsefr_rejects_negatives) et
              // parseDec refuse le vrai moins U+2212 : cette leçon a besoin des
              // deux, puisque la réponse EST un exposant négatif.
              const t = String(s).replace(/−/g, '-').replace(/[\s  ]/g, '').replace(',', '.');
              const n = Number(t);
              return Number.isFinite(n) ? n : NaN;
            }}
            display="−5"
            requires={['regles-puissances', 'exposant-negatif']}
            explain="On soustrait : 3 − 8 = −5, donc 10⁻⁵. Il manquait cinq facteurs, ce qui laisse une division — exactement ce que le laboratoire montrait."
            explainFor={(n) => {
              const code = diagnostiquerQuotient(pow(10, 3), pow(10, 8), n);
              if (code === 'sens-inverse') {
                return "Tu as calculé 8 − 3. L’ordre compte : c’est l’exposant du NUMÉRATEUR moins celui du dénominateur, donc 3 − 8 = −5.";
              }
              if (code === 'a-additionne') {
                return "Tu as additionné : c’est la règle du produit. Pour un quotient, les facteurs communs se simplifient, donc on soustrait.";
              }
              return "On soustrait les exposants : 3 − 8 = −5. Un exposant négatif n’est pas un problème, c’est une division.";
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'La puissance d’une puissance',
      subtitle: 'Un paquet de facteurs, pris plusieurs fois.',
      done: q5,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/40 p-3 text-sm text-slate-700">
            <p className="mb-2">
              <strong className="font-mono">(2³)⁴</strong> veut dire : le paquet{' '}
              <strong className="font-mono">2³</strong> — trois facteurs — pris{' '}
              <strong>quatre fois</strong>.
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className="flex gap-1 rounded-lg border border-sky-200 bg-white px-1.5 py-1">
                  {[0, 1, 2].map((j) => (
                    <span
                      key={j}
                      className="inline-flex h-7 min-w-[26px] items-center justify-center rounded border-2 border-sky-300 bg-sky-50 text-xs font-bold text-sky-800"
                    >
                      2
                    </span>
                  ))}
                </span>
              ))}
            </div>
            <p className="mt-2 text-slate-600">
              Quatre paquets de trois : <strong>3 × 4 = 12</strong> facteurs en tout.
            </p>
          </div>
          <NumericQuestion
            prompt="(10⁵)³ = 10 puissance combien ?"
            expected={15}
            requires={['regles-puissances']}
            explain="Le paquet de cinq facteurs, pris trois fois : 5 × 3 = 15 facteurs. D’où 10¹⁵. Ici on MULTIPLIE bien les exposants — parce qu’on répète un paquet, on ne met pas deux paquets bout à bout."
            explainFor={(n) =>
              n === 8
                ? "Tu as additionné : c’est la règle du PRODUIT (deux paquets côte à côte). Ici un même paquet est répété trois fois, ce qui multiplie son effectif : 5 × 3 = 15."
                : "Compte : un paquet de 5 facteurs, répété 3 fois, donne 5 × 3 = 15 facteurs."
            }
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
        </div>
      ),
    },
    {
      num: 6,
      title: 'Le piège des deux bases',
      done: q6,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Peut-on simplifier 2³ × 3² avec la règle des exposants ?"
            options={[
              'Oui : 6⁵, en multipliant les bases et en additionnant les exposants',
              'Non : les bases sont différentes, aucune règle ne s’applique — on calcule 8 × 9 = 72',
              'Oui : 2⁵, en gardant la première base',
              'Oui : 6⁶, en multipliant tout',
            ]}
            correct={1}
            cols={1}
            requires={['regles-puissances']}
            explain="La règle compte des facteurs IDENTIQUES : trois facteurs 2 et deux facteurs 3 ne se regroupent pas. Il n’y a rien à simplifier, seulement à calculer : 8 × 9 = 72."
            explainWrong="Vérifie : 6⁵ vaut 7776, alors que 2³ × 3² = 8 × 9 = 72. La règle exige la MÊME base des deux côtés — sinon les pastilles ne portent pas le même nombre et on ne peut pas les compter ensemble."
            solved={q6}
            onAnswered={() => setQ6(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Compter les facteurs"
      moduleSubtitle="Trois règles qui se comptent au lieu de s’apprendre"
      estimatedTime="13 min"
      brief={{
        tag: 'Manipulation',
        title: 'Ne calcule pas — compte',
        tone: 'indigo',
        body: (
          <p>
            10⁴ × 10⁷ fait un nombre à douze chiffres, impossible à poser. Pourtant la réponse
            s’obtient <strong>sans aucun calcul</strong> : il suffit de compter des facteurs.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
