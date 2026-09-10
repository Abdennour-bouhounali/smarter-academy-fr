import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DeplieurDePuissance from '../components/DeplieurDePuissance';
import { deplie, piegesPuissance, parseSigned, fr } from '../components/reglesExpoUtils';

/**
 * Module 4 — MANIPULATION : (e^a)^n = e^(na), obtenue en DÉPLIANT le produit.
 *
 * Étape 1  DÉPLIER SUR a = 2. L'élève règle le nombre de copies et voit les
 *          exposants s'empiler en une somme. Sur a = 2, n = 3, la somme fait 6
 *          et le piège 8 — ils se séparent visiblement.
 * Étape 2  ÉNONCER. n fois le même exposant, c'est n × cet exposant : la brique
 *          `exp-puissance` arrive APRÈS que le dépliage l'ait montré.
 * Étape 3  CHANGER a, y compris en négatif : la règle tient aussi quand
 *          l'exposant est négatif, et le résultat reste strictement positif.
 * Étape 4  l'application chiffrée, avec le piège confronté nommément.
 *
 * L'EXCEPTION HONNÊTE. Le cliquet permet a = 2 avec n = 2, où la bonne réponse
 * (4) et le piège (4) coïncident. Le composant le DIT dans cet état, et le
 * module ne DEMANDE jamais ce couple : le test `reglesExpoUtils.test.js`,
 * section 9, verrouille les deux parades.
 *
 * CONNAISSANCES AVANT LA DEMANDE : étape 1 geste → étape 2 énoncé → briques
 * `exp-puissance` puis `mem-puissance-multiplie` ; étapes 3 et 4 les demandes.
 *
 * MANIPULATION JAMAIS GELÉE : les deux dépliquers restent pilotables après
 * validation. Seul demeure le verrou d'ANTÉRIORITÉ de l'étape 3 sur l'étape 1.
 */
export default function Module04LaPuissance() {
  const [n1, setN1] = useState(2);
  const [vus1, setVus1] = useState([]);
  const [q2, setQ2] = useState(false);
  const [a3, setA3] = useState(-1);
  const [n3, setN3] = useState(4);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  // Trois valeurs de n explorées : une seule ne montrerait pas la loi.
  const done1 = vus1.length >= 3;

  const noter1 = (v, react) => {
    setN1(v);
    if (vus1.includes(v)) return;
    const suivant = [...vus1, v];
    setVus1(suivant);
    if (!done1 && suivant.length >= 3) react?.(true);
  };

  const pieges = piegesPuissance(2, 3);
  const troisCopies = deplie(2, 3);

  const steps = [
    {
      num: 1,
      title: 'Déplie le produit',
      subtitle:
        'On part de e² et on le multiplie par lui-même plusieurs fois. Change le nombre de copies et regarde la somme des exposants se construire.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DeplieurDePuissance a={2} n={n1} onChangeN={(v) => noter1(v, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              À chaque copie ajoutée, un 2 de plus dans la somme. Avec {vus1.length} réglages
              essayés, la loi se lit sans effort : la somme vaut toujours{' '}
              <strong>le nombre de copies multiplié par l’exposant</strong>. Additionner n fois le
              même nombre, c’est le multiplier par n — depuis toujours.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Réglages essayés : {vus1.length} sur 3. Change le nombre de copies et compare la somme
              obtenue au nombre de cases posées.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La loi, en une ligne',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Élever e^a à la puissance n, c’est le multiplier n fois par lui-même. Que devient alors l’exposant ?"
            options={[
              'Il est multiplié par n : (e^a)^n = e^(na)',
              'Il est élevé à la puissance n : (e^a)^n = e^(aⁿ)',
              'Il ne change pas : (e^a)^n = e^a',
              'Il est augmenté de n : (e^a)^n = e^(a+n)',
            ]}
            correct={0}
            cols={1}
            requires={['relation-fondamentale-exp', 'puissance', 'exposant']}
            explain="Le dépliage l’a montré terme à terme : n copies donnent n exposants identiques, dont la somme vaut n × a. Sur e² avec 3 copies, la somme fait 2 + 2 + 2 = 6, et non 2³ = 8."
            explainWrong="Compte les cases du dépliage : sur e² avec 3 copies, la somme est 2 + 2 + 2, donc 6. L’écriture e^(2³) donnerait 8, et l’on ne voit nulle part d’où viendrait cette huitième unité."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                (e²)³ = e⁶ ≈ {fr(Math.round(troisCopies.valeur))}, et non e⁸. L’écart entre les deux
                réponses n’est pas un détail : e⁸ est plus de sept fois plus grand.
              </Feedback>
              <KnowledgeBrick
                id="exp-puissance"
                variant="new"
                lead={<>Ce que le dépliage a montré case par case, énoncé une fois pour toutes.</>}
              />
              <KnowledgeBrick
                id="mem-puissance-multiplie"
                variant="new"
                lead={<>Multiplier l’exposant, jamais l’élever.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La loi tient-elle avec un exposant négatif ?',
      subtitle:
        'Reprends le dépliage, cette fois sur e^(−1). Rien ne change dans le raisonnement : ce sont toujours des copies qu’on additionne.',
      done: q3,
      content: (
        <div className="space-y-3">
          <DeplieurDePuissance a={a3} n={n3} onChangeN={setN3} verrouille={!done1} />
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choisir l’exposant de départ">
            <span className="text-[13px] font-semibold text-slate-600">Exposant de départ a :</span>
            {[-1, 0.5, 3].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setA3(v)}
                disabled={!done1}
                aria-pressed={v === a3}
                className={
                  'min-w-[56px] h-11 px-3 rounded-lg text-sm font-bold border-2 transition ' +
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ' +
                  'disabled:opacity-50 disabled:cursor-not-allowed ' +
                  (v === a3
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50')
                }
              >
                {fr(v)}
              </button>
            ))}
          </div>
          <TapQuestion
            prompt="Sur e^(−1) avec 4 copies, la somme des exposants vaut −4. Que peut-on dire de (e^(−1))⁴ = e^(−4) ?"
            options={[
              'C’est un nombre strictement positif, plus petit que 1',
              'C’est un nombre négatif, puisque l’exposant l’est',
              'C’est 0, car les copies se compensent',
              'Cela n’existe pas : on ne peut pas élever un nombre négatif à une puissance',
            ]}
            correct={0}
            cols={1}
            requires={['exp-puissance', 'exp-oppose-inverse', 'exp-strictement-positive']}
            explain="L’exposant est négatif, donc la valeur est l’inverse de e⁴ : environ 0,018. Petit, mais strictement positif — comme toute valeur de cette fonction. Remarque au passage que e^(−1) lui-même n’est pas un nombre négatif : c’est environ 0,368."
            explainWrong="Un exposant négatif ne rend pas la valeur négative : il la retourne. C’est exactement ce que dit la relation e^(−a) = 1/e^a, posée au module précédent. Le résultat reste au-dessus de zéro, aussi petit soit-il."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              La loi ne fait aucune différence entre exposants positifs et négatifs : elle
              additionne des copies, quel que soit leur signe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'À toi',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Écris <strong>(e²)³</strong> sous la forme d’une seule exponentielle e^n. Que vaut n ?</>}
            expected={pieges.bon}
            parse={(raw) => parseSigned(raw, parseDec)}
            display="6"
            requires={['exp-puissance', 'mem-puissance-multiplie']}
            explain="On multiplie l’exposant par la puissance : 2 × 3 = 6, donc (e²)³ = e⁶. Le dépliage le confirme : 2 + 2 + 2 = 6."
            explainFor={(n) =>
              n === pieges.exposantALaPuissance
                ? 'Tu as élevé l’exposant à la puissance : 2³ = 8. Or le dépliage donne 2 + 2 + 2, c’est-à-dire trois fois 2 — et non 2 multiplié par lui-même trois fois.'
                : n === pieges.sommeAvecN
                ? 'Tu as additionné : 2 + 3 = 5. L’addition correspond à un PRODUIT de deux exponentielles différentes, pas à une puissance.'
                : n === pieges.exposantInchange
                ? 'Tu as gardé l’exposant seul. La puissance 3 n’est pas neutre : elle demande trois copies, donc trois fois l’exposant.'
                : null
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Quatre relations, toutes issues de la même ligne : la somme donne un produit,
              l’opposé donne l’inverse, la différence donne un quotient, et la puissance multiplie
              l’exposant. Il est temps de s’en servir pour RÉSOUDRE.
            </Feedback>
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
      moduleTitle="La puissance"
      moduleSubtitle="n copies, n exposants, une seule somme"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Déplier avant d’énoncer',
        tone: 'indigo',
        body: (
          <p>
            (e^a)^n n’a pas besoin d’être admis. Déplie le produit en toutes ses copies, applique la
            règle que tu connais déjà à chaque multiplication, et la loi apparaîtra d’elle-même.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Passons à l’action.</strong> Quatre relations pour transformer. Que faut-il de
          plus pour RÉSOUDRE une équation ? Module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}
