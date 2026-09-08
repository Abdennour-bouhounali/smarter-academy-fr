import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitBar from '../components/UnitBar';
import FractionInput from '../components/FractionInput';
import {
  frac, reduire, diviseursCommuns, simplifier, estSimplifiee, memeNombre, texte,
} from '../components/rationnels';

/**
 * Module 3 — DÉCOUVERTE : le geste inverse.
 *
 * Activity              regrouper les parts d'une barre par 2, 3, 6… et voir
 *                       l'écriture se simplifier sans que la longueur bouge.
 * Mathematical objective diviser les deux termes par un diviseur commun donne
 *                       le même nombre, écrit plus simplement.
 * Student action        choisir le regroupement.
 * Visual consequence    les parts fusionnent ; un regroupement impossible est
 *                       refusé et DIT pourquoi (le nombre ne divise pas les deux).
 * Expected observation  « je peux regrouper tant qu'un même nombre divise le
 *                       haut et le bas — après, je suis bloqué ».
 * Misconception targeted diviser un seul terme ; ou croire qu'on a changé le
 *                       nombre en le simplifiant.
 *
 * PÉRIMÈTRE : on dit « simplifier au maximum », jamais « irréductible » — la
 * fraction irréductible et le PGCD sont des objets de 3e (lesson.config.js).
 */
const DEPART = frac(12, 18);

export default function Module03RemonterLaMachine() {
  const [f, setF] = useState(DEPART);
  const [refuse, setRefuse] = useState(null);
  const done1 = estSimplifiee(f);

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const regrouper = (k, react) => {
    const r = reduire(f, k);
    if (r === null) {
      // L'erreur est une manipulation : on la laisse se produire et on la NOMME.
      setRefuse(k);
      react?.(false);
      return;
    }
    setRefuse(null);
    setF(r);
    if (estSimplifiee(r) && !estSimplifiee(f)) react?.(true);
  };

  const communs = diviseursCommuns(f).filter((d) => d > 1);

  const steps = [
    {
      num: 1,
      title: 'Regroupe les parts jusqu’à ne plus pouvoir',
      subtitle: 'Choisis par combien regrouper. La longueur remplie ne doit jamais changer.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            <UnitBar num={DEPART.num} den={DEPART.den} label={texte(DEPART)} couleur="amber" />
            <UnitBar num={f.num} den={f.den} label={texte(f)} couleur="emerald" />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Regrouper les parts">
            {[2, 3, 4, 5, 6].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => regrouper(k, kit.react)}
                data-regroupe={k}
                className="min-h-[44px] min-w-[52px] rounded-xl border-2 border-slate-200 bg-white font-mono font-bold text-slate-700 tabular-nums hover:border-sky-400 transition-colors"
              >
                ÷{k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setF(DEPART); setRefuse(null); }}
              className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:border-sky-400"
            >
              ↺ Recommencer
            </button>
          </div>
          {refuse !== null ? (
            <Feedback tone="ko">
              Impossible de regrouper <strong className="font-mono">{texte(f)}</strong> par{' '}
              <strong>{refuse}</strong> : {refuse} ne divise pas{' '}
              {f.num % refuse !== 0 ? <>le numérateur {f.num}</> : <>le dénominateur {f.den}</>}. Pour
              regrouper, il faut un nombre qui divise <strong>les deux termes</strong> à la fois.
              {communs.length > 0 && (
                <> Ici, tu peux encore essayer : <strong className="font-mono">{communs.join(', ')}</strong>.</>
              )}
            </Feedback>
          ) : done1 ? (
            <Feedback tone="ok">
              <strong className="font-mono">{texte(f)}</strong> — et il n’y a plus rien à regrouper :
              aucun nombre (à part 1) ne divise à la fois {f.num} et {f.den}. La barre verte
              s’arrête pourtant toujours au même endroit que la barre ambre : c’est{' '}
              <strong>le même nombre</strong>, écrit avec les plus petits nombres possibles.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tu es sur <strong className="font-mono">{texte(f)}</strong>. Cherche un nombre qui
              divise à la fois {f.num} et {f.den}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le geste, et sa limite',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="simplifier"
            variant="new"
            lead={<>Tu viens de remonter la machine du module précédent : au lieu de couper les parts, tu les as regroupées — et le nombre n’a pas changé.</>}
          />
          <TapQuestion
            prompt={<>Pourquoi ne peut-on pas simplifier <span className="font-mono font-bold">7/9</span> ?</>}
            options={[
              'Parce qu’aucun nombre, à part 1, ne divise à la fois 7 et 9',
              'Parce que 7 est plus petit que 9',
              'Parce que 7 et 9 sont impairs',
              'Parce qu’on ne simplifie que les fractions plus grandes que 1',
            ]}
            correct={0}
            cols={1}
            requires={['simplifier']}
            explain="Simplifier demande un diviseur commun. Les diviseurs de 7 sont 1 et 7 ; ceux de 9 sont 1, 3 et 9. Le seul commun est 1, qui ne change rien : 7/9 est déjà simplifiée au maximum."
            explainWrong="Ce n’est pas une question de taille ni de parité : 9/15 est fait de deux impairs et se simplifie pourtant en 3/5 (par 3). Ce qui compte est l’existence d’un nombre qui divise LES DEUX termes."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'À toi de simplifier',
      subtitle: 'Donne l’écriture la plus simple.',
      done: q3,
      content: (
        <div className="space-y-3">
          <FractionInput
            prompt={<>Simplifie <span className="font-mono font-bold">24/36</span> au maximum.</>}
            expected={simplifier(frac(24, 36))}
            formeExacte
            requires={['simplifier', 'fractions-egales']}
            explain="Les diviseurs communs de 24 et 36 sont 1, 2, 3, 4, 6 et 12. En divisant les deux termes par 12 : 24 ÷ 12 = 2 et 36 ÷ 12 = 3. La fraction la plus simple est 2/3."
            explainFor={(rep) => {
              if (memeNombre(rep, frac(2, 3)) && !(rep.num === 2 && rep.den === 3)) {
                return `${texte(rep)} est bien le même nombre, mais on peut encore regrouper : continue jusqu’à ce qu’aucun nombre autre que 1 ne divise les deux termes. Tu arriveras à 2/3.`;
              }
              return 'Divise les deux termes par 12 (leur plus grand diviseur commun) : 24 ÷ 12 = 2, 36 ÷ 12 = 3, donc 2/3. Tu peux aussi y aller en plusieurs étapes : ÷2, ÷2, puis ÷3.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Déjà au maximum, ou pas ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Ces fractions sont-elles <strong>déjà simplifiées au maximum</strong> ?
              </p>
            }
            rows={[
              { id: 's1', label: '5/8', options: ['Au maximum', 'Simplifiable'], correct: 0, correction: 'Les diviseurs de 5 sont 1 et 5 ; 5 ne divise pas 8. Rien à regrouper.' },
              { id: 's2', label: '9/15', options: ['Au maximum', 'Simplifiable'], correct: 1, correction: '3 divise 9 et 15 : 9/15 = 3/5.' },
              { id: 's3', label: '14/21', options: ['Au maximum', 'Simplifiable'], correct: 1, correction: '7 divise 14 et 21 : 14/21 = 2/3.' },
            ]}
            requires={['simplifier']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  La question à se poser est toujours la même : <strong>existe-t-il un nombre qui
                  divise le haut ET le bas ?</strong> Commence par les petits — 2, 3, 5, 7 — c’est
                  presque toujours suffisant.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Passe les petits nombres en revue : 2 divise-t-il les deux
                  termes ? Et 3 ? Et 5 ? Et 7 ? Si aucun ne marche, la fraction est au maximum.
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Remonter la machine"
      moduleSubtitle="Regrouper les parts au lieu de les couper"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Et dans l’autre sens ?',
        tone: 'indigo',
        body: (
          <p>
            Tu sais fabriquer des écritures de plus en plus compliquées d’un même nombre. La
            question intéressante est l’inverse : partant de{' '}
            <strong className="font-mono">12/18</strong>, jusqu’où peut-on{' '}
            <strong>remonter</strong> vers l’écriture la plus simple ?
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
