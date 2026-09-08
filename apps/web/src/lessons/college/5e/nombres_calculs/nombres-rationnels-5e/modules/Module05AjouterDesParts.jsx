import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitBar from '../components/UnitBar';
import FractionInput from '../components/FractionInput';
import {
  frac, agrandir, somme, difference, texte, diagnostiquerSomme, sommeNaive,
} from '../components/rationnels';

/**
 * Module 5 — MANIPULATION : additionner et soustraire.
 *
 * Activity              re-graduer une des deux fractions pour pouvoir enfin
 *                       « poser les parts bout à bout ».
 * Mathematical objective on ne peut réunir que des parts de MÊME taille ; une
 *                       fois la graduation commune atteinte, on additionne les
 *                       numérateurs, et eux seuls.
 * Student action        choisir le facteur de re-graduation, puis lire le total.
 * Visual consequence    les trois barres (les deux termes, puis la somme)
 *                       montrent que les longueurs s'ajoutent.
 * Expected observation  « le dénominateur ne s'additionne pas : il dit la
 *                       taille des parts, pas leur nombre ».
 * Misconception targeted a/b + c/d = (a+c)/(b+d) — l'erreur reine, ici traitée
 *                       en la FAISANT CONSTATER absurde (le résultat serait
 *                       plus petit qu'un des deux termes), pas en l'interdisant.
 *
 * PÉRIMÈTRE : dénominateurs multiples uniquement. somme() et difference()
 * LÈVENT sur un couple quelconque ou sur un résultat négatif, si bien qu'aucun
 * calcul de 4e ne peut apparaître, même par accident de données.
 */
const A = frac(1, 4);
const B = frac(3, 8);

export default function Module05AjouterDesParts() {
  const [k, setK] = useState(1);
  const done1 = agrandir(A, k).den === B.den;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const regradue = agrandir(A, k);
  const total = somme(A, B);
  const naive = sommeNaive(A, B);

  const choisir = (v, react) => {
    setK(v);
    if (agrandir(A, v).den === B.den && !done1) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Rends les parts comparables',
      subtitle: 'On veut ajouter 1/4 et 3/8. Impossible tant que les parts n’ont pas la même taille : re-gradue la première.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            <UnitBar num={regradue.num} den={regradue.den} label={texte(regradue)} couleur="indigo" />
            <UnitBar num={B.num} den={B.den} label={texte(B)} couleur="emerald" />
            {done1 && (
              <>
                <div className="border-t-2 border-dashed border-slate-300 pt-3" />
                <UnitBar num={total.num} den={total.den} label={texte(total)} couleur="amber" />
              </>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir par combien re-graduer">
            {[1, 2, 3, 4].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => choisir(v, kit.react)}
                aria-pressed={v === k}
                data-multiplie={v}
                className={[
                  'min-h-[44px] min-w-[52px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                  v === k
                    ? 'border-indigo-500 bg-indigo-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400',
                ].join(' ')}
              >
                ×{v}
              </button>
            ))}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Les deux fractions sont maintenant en <strong>huitièmes</strong> :{' '}
              <strong className="font-mono">1/4 = 2/8</strong>. Il ne reste plus qu’à compter les
              parts : <strong className="font-mono">2/8 + 3/8 = 5/8</strong>. Le dénominateur, lui,
              <strong> ne bouge pas</strong> — il dit la taille des parts, et cette taille est
              justement ce qu’on vient d’égaliser.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Les parts bleues et les parts vertes n’ont pas la même taille : on ne peut pas encore
              les réunir. Par combien faut-il multiplier 4 pour obtenir 8 ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi on n’additionne jamais les dénominateurs',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="additionner-fractions"
            variant="new"
            lead={<>Tu viens de réunir des parts, après les avoir rendues comparables. C’est toute la méthode.</>}
          />
          <KnowledgeBrick id="mem-meme-graduation" variant="new" compact />
          <TapQuestion
            prompt={<>Un élève écrit <span className="font-mono font-bold">1/4 + 3/8 = {texte(naive)}</span>. Comment voir tout de suite que c’est faux, sans calculer ?</>}
            options={[
              `Parce que ${texte(naive)} est plus PETIT que 3/8 : on a ajouté quelque chose, le résultat doit augmenter`,
              'Parce qu’il aurait fallu multiplier les dénominateurs',
              'Parce que 4 et 12 ne sont pas des multiples de 8',
              'Parce qu’on ne peut pas additionner des fractions différentes',
            ]}
            correct={0}
            cols={1}
            requires={['additionner-fractions', 'comparer-fractions']}
            explain={`4/12 vaut 1/3, soit environ 0,33 — c’est moins que 3/8 (0,375), alors qu’on vient d’AJOUTER 1/4 par-dessus. Une addition ne peut pas faire diminuer : le résultat est forcément faux. Le bon résultat est ${texte(total)}.`}
            explainWrong={`Le contrôle le plus rapide n’est pas de refaire le calcul, c’est de regarder la TAILLE du résultat : une somme doit être plus grande que chacun de ses deux termes. Ici ${texte(naive)} est plus petit que 3/8 — c’est impossible. En additionnant les dénominateurs, on a changé la taille des parts en cours de route.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'À toi d’additionner',
      done: q3,
      content: (
        <div className="space-y-3">
          <FractionInput
            prompt={<>Combien vaut <span className="font-mono font-bold">2/3 + 5/12</span> ?</>}
            expected={somme(frac(2, 3), frac(5, 12))}
            requires={['additionner-fractions', 'graduation-commune']}
            explain="12 est un multiple de 3 : on réécrit 2/3 = 8/12. Puis on compte les parts : 8/12 + 5/12 = 13/12. Le résultat dépasse 1, ce qui est normal — 2/3 et 5/12 font ensemble un peu plus d’une unité."
            explainFor={(rep) => {
              const diag = diagnostiquerSomme(frac(2, 3), frac(5, 12), rep);
              if (diag === 'somme-des-deux') return 'Tu as additionné les numérateurs ENTRE EUX et les dénominateurs ENTRE EUX. Le dénominateur n’est pas une quantité à ajouter : il dit la taille des parts. Réécris d’abord 2/3 en douzièmes (8/12), puis additionne seulement les numérateurs.';
              if (diag === 'oubli-regraduation') return 'Tu as bien gardé le dénominateur 12, mais tu as additionné 2 et 5 sans réécrire 2/3 en douzièmes. Or 2/3 vaut 8 douzièmes, pas 2 : la somme est 8/12 + 5/12 = 13/12.';
              return 'Réécris 2/3 en douzièmes (×4 en haut et en bas) : 8/12. Puis 8/12 + 5/12 = 13/12.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et la soustraction ?',
      subtitle: 'Exactement le même geste.',
      done: q4,
      content: (
        <div className="space-y-3">
          <FractionInput
            prompt={<>Combien vaut <span className="font-mono font-bold">3/4 − 3/8</span> ?</>}
            expected={difference(frac(3, 4), frac(3, 8))}
            requires={['additionner-fractions', 'graduation-commune']}
            explain="Même méthode : 3/4 = 6/8, puis on retire les parts. 6/8 − 3/8 = 3/8."
            explainFor={(rep) => {
              if (rep.num === 0) return 'Attention : 3/4 et 3/8 ont le même numérateur mais pas la même taille de parts, donc ils ne sont pas égaux. Réécris d’abord 3/4 en huitièmes : c’est 6/8, pas 3/8.';
              if (rep.den === 4 && rep.num === 0) return 'Réécris 3/4 en huitièmes (6/8) avant de retirer 3/8.';
              return 'Comme pour l’addition : mets les deux nombres en huitièmes (3/4 = 6/8), puis retire les numérateurs : 6 − 3 = 3, donc 3/8.';
            }}
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
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Ajouter des parts"
      moduleSubtitle="On ne réunit que des parts de même taille"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: '1/4 de tarte, puis 3/8 de plus',
        tone: 'indigo',
        body: (
          <p>
            Tu as un quart de tarte, on t’en donne trois huitièmes. Combien en as-tu ? Impossible de
            répondre en l’état : <strong>les parts n’ont pas la même taille</strong>. Comme pour
            comparer, il va falloir les rendre comparables d’abord.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
