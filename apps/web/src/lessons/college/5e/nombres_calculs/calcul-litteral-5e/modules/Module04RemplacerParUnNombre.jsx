import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SubstitutionLab from '../components/SubstitutionLab';
import {
  expr, ecrire, ecrireAvecFois, valeur, diagnostiquerSubstitution, parseEntier,
} from '../components/litteral';

/**
 * Module 4 — MANIPULATION : remplacer la lettre par un nombre.
 *
 * Mathematical objective substituer, c'est remettre le signe × là où il était
 *                       caché, remplacer la lettre, puis appliquer les
 *                       priorités déjà connues (leçon « Opérations », 5e).
 * Misconception targeted trois erreurs distinctes, chacune diagnostiquée par
 *                       son nom via components/litteral.js :
 *                       — coller le coefficient et la valeur (3n, n = 4 → 34) ;
 *                       — oublier la partie constante ;
 *                       — ajouter au lieu de multiplier.
 *
 * Le laboratoire affiche l'étape intermédiaire « 3 × 4 + 2 » AVANT le résultat :
 * c'est cette étape qui rend la concaténation visiblement absurde, plutôt
 * qu'une interdiction énoncée.
 */
const E1 = expr(3, 2);   // 3n + 2
const E2 = expr(5, 0);   // 5n
const E3 = expr(4, 7);   // 4n + 7

export default function Module04RemplacerParUnNombre() {
  const [n, setN] = useState(0);
  const [testees, setTestees] = useState(() => new Set([0]));
  const done1 = testees.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const tester = (v, react) => {
    setN(v);
    const next = new Set(testees);
    next.add(v);
    setTestees(next);
    if (next.size >= 3 && testees.size < 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Regarde l’étape du milieu',
      subtitle: 'Le laboratoire montre toujours le calcul AVANT de le faire. Essaie trois valeurs.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <SubstitutionLab
            e={E1}
            n={n}
            onN={(v) => tester(v, kit.react)}
            valeurs={[0, 1, 2, 4, 6, 10]}
            ariaLabel="Choisir la valeur de la lettre"
          />
          {done1 ? (
            <Feedback tone="ok">
              L’étape du milieu est la clé. Avec n = 4, l’expression{' '}
              <strong className="font-mono">{ecrire(E1)}</strong> devient{' '}
              <strong className="font-mono">3 × 4 + 2</strong> — et non « 34 + 2 ». Le signe × est
              caché dans l’écriture, mais il est bel et bien là :{' '}
              <strong className="font-mono">3n</strong> veut dire{' '}
              <strong className="font-mono">3 × n</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {testees.size} valeur{testees.size > 1 ? 's' : ''} essayée{testees.size > 1 ? 's' : ''} sur 3.
              Lis bien la ligne « Je remplace » avant la ligne « Je calcule ».
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La méthode en trois temps',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="substituer"
            variant="new"
            lead={<>Tu viens de voir l’étape que presque tout le monde saute — et c’est en la sautant qu’on se trompe.</>}
          />
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">{ecrire(E2)}</span> quand n = 6 ?</>}
            expected={valeur(E2, 6)}
            parse={parseEntier}
            display={String(valeur(E2, 6))}
            requires={['substituer', 'calcul-litteral']}
            explain={`${ecrire(E2)} veut dire ${ecrireAvecFois(E2)}. On remplace : 5 × 6 = ${valeur(E2, 6)}.`}
            explainFor={(rep) => {
              const d = diagnostiquerSubstitution(E2, 6, rep);
              if (d === 'colle') return 'Tu as écrit les deux chiffres à la suite : 56. Mais 5n ne veut pas dire « 5 puis n » — le signe × est simplement caché. Il faut faire 5 × 6 = 30.';
              if (d === 'ajoute') return 'Tu as calculé 5 + 6 = 11. L’écriture 5n signifie une MULTIPLICATION : 5 × 6 = 30.';
              return `${ecrire(E2)} signifie 5 × n. Avec n = 6 : 5 × 6 = ${valeur(E2, 6)}.`;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Avec une partie fixe',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">{ecrire(E3)}</span> quand n = 3 ?</>}
            expected={valeur(E3, 3)}
            parse={parseEntier}
            display={String(valeur(E3, 3))}
            requires={['substituer']}
            explain={`On remplace : ${ecrireAvecFois(E3)} devient 4 × 3 + 7. Les priorités s’appliquent, comme toujours : le produit d’abord (12), puis l’addition : ${valeur(E3, 3)}.`}
            explainFor={(rep) => {
              const d = diagnostiquerSubstitution(E3, 3, rep);
              if (d === 'colle') return 'Tu as collé le 4 et le 3 pour faire 43. L’écriture 4n cache un signe × : il faut calculer 4 × 3 = 12, puis ajouter 7.';
              if (d === 'oubli-constante') return 'Tu as bien calculé 4 × 3 = 12, mais tu as oublié le + 7 de l’expression. Le résultat complet est 19.';
              if (rep === 40) return 'Tu as sans doute fait (4 + 7) × 3 ou 4 × (3 + 7). Les priorités s’appliquent : le produit 4 × 3 se fait AVANT l’addition du 7.';
              return `4 × 3 = 12, puis 12 + 7 = ${valeur(E3, 3)}.`;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'La même expression, plusieurs valeurs',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour l’expression <strong className="font-mono">{ecrire(E1)}</strong>, quelle est la
                valeur dans chaque cas ?
              </p>
            }
            /* Les trois options d'une même ligne doivent rester DISTINCTES :
               deux valeurs identiques rendraient la question insoluble. Le
               test components/litteral.test.js le verrouille sur les valeurs
               utilisées ici, et vérifie en prime qu'aucun entier ne fait
               coïncider la bonne réponse avec le distracteur « somme ». */
            rows={[0, 2, 5].map((v) => ({
              id: `v${v}`,
              label: `n = ${v}`,
              options: [
                String(valeur(E1, v)),        // 3v + 2 — la bonne
                String(3 * v),                // l'oubli de la partie fixe
                String(3 + v + 2),            // l'addition au lieu du produit
              ],
              correct: 0,
              correction: `3 × ${v} + 2 = ${valeur(E1, v)}.`,
            }))}
            requires={['substituer']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Une seule expression, trois résultats — et le cas <strong>n = 0</strong> est
                  instructif : il ne reste que la partie fixe, 2. C’est la preuve que le + 2 ne
                  dépend pas du tout de n.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Procède toujours en trois temps : rétablis le signe ×
                  caché, remplace la lettre, puis applique les priorités —{' '}
                  <strong>le produit avant l’addition</strong>.
                </Feedback>
              )
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Remplacer par un nombre"
      moduleSubtitle="L’étape que tout le monde saute"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le signe × caché',
        tone: 'indigo',
        body: (
          <p>
            Écrire <strong className="font-mono">3n</strong> plutôt que{' '}
            <strong className="font-mono">3 × n</strong> fait gagner de la place — mais c’est aussi
            la source de l’erreur la plus fréquente de tout le chapitre. Voici comment ne jamais y
            tomber.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
