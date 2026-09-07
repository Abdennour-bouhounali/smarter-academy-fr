import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  fmt, ecrire, evaluer, evaluerDeGaucheADroite, parseRelatif, EXPRESSIONS,
} from '../components/operations';

/**
 * Module 5 — LABORATOIRE D'ENTRAÎNEMENT : enchaîner les quatre opérations.
 *
 * Le module ne rappelle pas « attention aux priorités » : il fait CALCULER la
 * même expression des deux façons et laisse l'écart parler. Chaque expression
 * de EXPRESSIONS est choisie pour que les deux ordres donnent des résultats
 * DIFFÉRENTS — invariant verrouillé par operations.test.js, sans quoi la
 * démonstration ne démontrerait rien.
 *
 * Les erreurs ici ne comptent jamais comme preuve de maîtrise (practice_lab).
 */
const X1 = EXPRESSIONS[0].jetons;
const X2 = EXPRESSIONS[1].jetons;
const X3 = EXPRESSIONS[2].jetons;

export default function Module05EnchainerLesOperations() {
  const [pred, setPred] = useState(null);
  const [montre, setMontre] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le même calcul, deux résultats',
      subtitle: 'Compare ce que donne l’ordre des priorités et ce que donne un calcul de gauche à droite.',
      done: montre,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-center">
            <div className="text-lg sm:text-xl font-black tabular-nums text-slate-800">
              {ecrire(X1)}
            </div>
          </div>
          <PredictionChips
            prompt="À ton avis, l’ordre dans lequel on calcule change-t-il le résultat ?"
            options={[
              { id: 'non', label: 'Non, le résultat est le même' },
              { id: 'oui', label: 'Oui, il change' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={montre}
          />
          {!montre && (
            <button
              type="button"
              onClick={() => { setMontre(true); kit.react(true); }}
              className="min-h-[44px] px-4 rounded-xl border-2 border-rose-300 bg-white text-sm font-semibold text-rose-700 hover:border-rose-500"
            >
              Calculer des deux façons
            </button>
          )}
          {montre && (
            <>
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-700">En respectant les priorités</div>
                  <div className="text-xs text-slate-600 mt-1">4 × ({fmt(-2)}) = {fmt(-8)}, puis {fmt(-3)} + ({fmt(-8)})</div>
                  <div className="text-2xl font-black tabular-nums text-emerald-700 mt-1">{fmt(evaluer(X1))}</div>
                </div>
                <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-3">
                  <div className="text-[11px] uppercase tracking-wide text-rose-700">De gauche à droite</div>
                  <div className="text-xs text-slate-600 mt-1">{fmt(-3)} + 4 = 1, puis 1 × ({fmt(-2)})</div>
                  <div className="text-2xl font-black tabular-nums text-rose-700 mt-1">{fmt(evaluerDeGaucheADroite(X1))}</div>
                </div>
              </div>
              <Feedback tone="ok">
                {pred === 'oui' ? 'Ta prédiction était la bonne' : 'Regarde les deux cases'} :{' '}
                <strong>{fmt(evaluer(X1))}</strong> contre <strong>{fmt(evaluerDeGaucheADroite(X1))}</strong>.
                L’ordre n’est pas une question de présentation — il <strong>change la valeur</strong>.
                Un seul des deux est juste : celui qui calcule la multiplication d’abord.
              </Feedback>
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'À ton tour',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* L'écart entre les deux résultats vient d'être constaté : la règle
              peut être écrite, puis appliquée. */}
          <KnowledgeBrick
            id="priorites-relatifs"
            variant="new"
            lead={<>Tu viens de voir deux résultats pour un même calcul. Un seul ordre est le bon.</>}
          />
          <NumericQuestion
            prompt={`Combien fait ${ecrire(X2)} ?`}
            expected={evaluer(X2)}
            parse={parseRelatif}
            display={fmt(evaluer(X2))}
            requires={['priorites-relatifs', 'quotient-relatifs']}
            explain={`On calcule d’abord la division : 12 ÷ (${fmt(-4)}) = ${fmt(-3)}. Puis 5 − (${fmt(-3)}) = 5 + 3 = ${fmt(evaluer(X2))}.`}
            explainFor={(n) => (n === evaluerDeGaucheADroite(X2)
              ? <>C’est le résultat qu’on obtient <strong>de gauche à droite</strong> (5 − 12 d’abord). La division passe avant la soustraction.</>
              : n === 2
                ? <>Attention au signe : retirer un nombre négatif revient à ajouter son opposé.</>
                : null)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Prévoir le signe avant de calculer',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="controle-du-signe"
            variant="new"
            lead={<>Une habitude qui repère l’erreur avant qu’elle ne coûte : décider du signe attendu d’abord.</>}
          />
          <TapQuestion
            prompt={`Dans ${ecrire(X3)}, quel est le signe du PRODUIT à calculer en premier, et le résultat final ?`}
            options={[
              `Le produit est positif (12), et le résultat vaut ${fmt(evaluer(X3))}`,
              `Le produit est négatif (${fmt(-12)}), et le résultat vaut ${fmt(-20)}`,
              `Le produit est positif (12), et le résultat vaut ${fmt(evaluerDeGaucheADroite(X3))}`,
              'On ne peut pas prévoir le signe sans tout calculer',
            ]}
            correct={0}
            cols={1}
            requires={['priorites-relatifs', 'controle-du-signe', 'parite-facteurs']}
            explain={`(${fmt(-3)}) × (${fmt(-4)}) a deux facteurs négatifs : le produit est positif, il vaut 12. Ensuite ${fmt(-8)} + 12 = ${fmt(evaluer(X3))}. La troisième réponse est ce que donnerait un calcul de gauche à droite.`}
            explainWrong="Deux facteurs négatifs donnent un produit positif — c’est la parité, vue au module 3. Et la multiplication se calcule avant l’addition, même quand elle est écrite après."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Enchaîner les opérations"
      moduleSubtitle="L’ordre change le résultat"
      estimatedTime="12 min"
      brief={{
        tag: 'Entraînement',
        title: 'Quatre opérations, un seul ordre juste',
        tone: 'slate',
        body: (
          <p>
            Quand un calcul mêle addition, soustraction, multiplication et division, l’ordre dans
            lequel on s’y prend n’est pas libre. Voici pourquoi.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
