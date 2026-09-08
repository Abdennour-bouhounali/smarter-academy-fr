import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitBar from '../components/UnitBar';
import FractionInput from '../components/FractionInput';
import {
  frac, agrandir, comparer, texte, memeNombre, denominateurCommun,
} from '../components/rationnels';

/**
 * Module 4 — MANIPULATION : comparer, une fois la graduation commune trouvée.
 *
 * Activity              re-graduer une fraction jusqu'à ce que les deux barres
 *                       aient des parts de MÊME taille, puis lire laquelle est
 *                       la plus longue.
 * Mathematical objective on ne compare des fractions qu'à graduation égale ;
 *                        le numérateur tranche alors seul.
 * Student action        choisir par combien re-graduer la première fraction.
 * Visual consequence    les parts de la barre du haut se subdivisent jusqu'à
 *                       coïncider avec celles du bas ; la comparaison devient
 *                       lisible d'un coup d'œil.
 * Expected observation  « tant que les parts n'ont pas la même taille, comparer
 *                       les numérateurs ne veut rien dire ».
 * Misconception targeted comparer directement les numérateurs (ou les
 *                        dénominateurs) sans re-graduer ; et croire qu'un grand
 *                        dénominateur fait un grand nombre.
 *
 * PÉRIMÈTRE : dénominateurs multiples uniquement. denominateurCommun() LÈVE
 * pour un couple quelconque, si bien qu'aucune donnée hors programme ne peut
 * atteindre l'écran.
 */
const A = frac(2, 3);
const B = frac(7, 12);

export default function Module04QuiEstLePlusGrand() {
  const [k, setK] = useState(1);
  const done1 = agrandir(A, k).den === B.den;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const regradue = agrandir(A, k);

  const choisir = (v, react) => {
    setK(v);
    if (agrandir(A, v).den === B.den && !done1) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Mets les deux barres sur la même graduation',
      subtitle: 'On veut savoir qui est le plus grand entre 2/3 et 7/12. Re-gradue la barre du haut jusqu’à ce que ses parts aient la même taille que celles du bas.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            <UnitBar num={regradue.num} den={regradue.den} label={texte(regradue)} couleur="indigo" />
            <UnitBar num={B.num} den={B.den} label={texte(B)} couleur="amber" />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir par combien re-graduer">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => choisir(v, kit.react)}
                aria-pressed={v === k}
                data-multiplie={v}
                className={[
                  'min-h-[44px] min-w-[52px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                  v === k
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400',
                ].join(' ')}
              >
                ×{v}
              </button>
            ))}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Les deux barres sont maintenant coupées en <strong>douzièmes</strong> :{' '}
              <strong className="font-mono">2/3 = 8/12</strong>. Et là, tout devient simple —{' '}
              <strong>8 douzièmes contre 7 douzièmes</strong>, les parts ont la même taille, il
              suffit de les compter. Donc <strong className="font-mono">2/3 &gt; 7/12</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Pour l’instant, les parts du haut et du bas n’ont pas la même taille : comparer les
              numérateurs ne voudrait rien dire. Par combien faut-il multiplier 3 pour obtenir 12 ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La méthode, et le piège',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="graduation-commune"
            variant="new"
            lead={<>Tu viens de faire le geste qui rend toute comparaison possible : amener les deux nombres sur une graduation commune.</>}
          />
          <KnowledgeBrick
            id="comparer-fractions"
            variant="new"
            lead={<>Une fois les parts de même taille, la comparaison ne demande plus qu’un comptage.</>}
          />
          <TapQuestion
            prompt={<>Qui est le plus grand : <span className="font-mono font-bold">1/3</span> ou <span className="font-mono font-bold">1/8</span> ?</>}
            options={[
              '1/3, car couper en 3 donne des parts plus grosses qu’en 8',
              '1/8, car 8 est plus grand que 3',
              'Ils sont égaux, car les deux numérateurs valent 1',
              'On ne peut pas comparer : les dénominateurs sont différents',
            ]}
            correct={0}
            cols={1}
            requires={['comparer-fractions', 'fraction-nombre']}
            explain="Une part sur 3, c’est un tiers du gâteau ; une part sur 8, c’est un huitième — bien plus petit. À numérateur égal, plus le dénominateur est grand, plus les parts sont fines, donc plus le nombre est PETIT. Ainsi 1/8 < 1/3."
            explainWrong="C’est le piège le plus fréquent des fractions : le dénominateur ne compte pas des parts, il dit leur TAILLE. Un grand dénominateur signifie des parts minuscules. Imagine un gâteau partagé entre 3 personnes ou entre 8 : dans quel cas ta part est-elle la plus grosse ?"
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Réécris pour pouvoir comparer',
      subtitle: 'On veut comparer 3/4 et 11/16.',
      done: q3,
      content: (
        <div className="space-y-3">
          <FractionInput
            prompt={<>Réécris <span className="font-mono font-bold">3/4</span> avec le même dénominateur que <span className="font-mono font-bold">11/16</span>.</>}
            expected={frac(12, 16)}
            formeExacte
            requires={['graduation-commune', 'fractions-egales']}
            explain="16 est un multiple de 4 (16 = 4 × 4). On multiplie donc les deux termes de 3/4 par 4 : 12/16. Et comme 12 > 11, on conclut que 3/4 > 11/16."
            explainFor={(rep) => {
              if (rep.den === 16 && rep.num === 3) return 'Tu as bien mis 16 en bas, mais le haut doit suivre le même ×4 : 3 × 4 = 12, donc 12/16.';
              if (memeNombre(rep, frac(3, 4))) return `${texte(rep)} est bien égal à 3/4, mais on demandait l’écriture en SEIZIÈMES, la seule qui permette de comparer avec 11/16 : c’est 12/16.`;
              return 'De 4 à 16, on multiplie par 4 — donc en haut aussi : 3 × 4 = 12, soit 12/16.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Quatre comparaisons',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Dans chaque couple, quelle fraction est <strong>la plus grande</strong> ?
              </p>
            }
            rows={[
              { id: 'c1', label: '5/9 ou 7/9 ?', options: ['5/9', '7/9'], correct: 1, correction: 'Même graduation : 7 neuvièmes est plus que 5 neuvièmes.' },
              { id: 'c2', label: '1/2 ou 3/8 ?', options: ['1/2', '3/8'], correct: 0, correction: '1/2 = 4/8, et 4 huitièmes est plus que 3 huitièmes.' },
              { id: 'c3', label: '2/5 ou 2/7 ?', options: ['2/5', '2/7'], correct: 0, correction: 'Même numérateur : les cinquièmes sont plus gros que les septièmes, donc 2/5 > 2/7.' },
              { id: 'c4', label: '5/6 ou 9/12 ?', options: ['5/6', '9/12'], correct: 0, correction: '5/6 = 10/12, et 10 douzièmes est plus que 9 douzièmes.' },
            ]}
            requires={['comparer-fractions', 'graduation-commune']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Tu as utilisé les deux outils au bon moment : la <strong>graduation commune</strong>{' '}
                  quand les dénominateurs diffèrent, et le raisonnement sur la{' '}
                  <strong>taille des parts</strong> quand ce sont les numérateurs qui sont égaux.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Deux cas seulement : si un dénominateur est multiple de
                  l’autre, <strong>re-gradue</strong> puis compare les numérateurs. Si les
                  numérateurs sont égaux, souviens-toi que le <strong>plus grand dénominateur donne
                  le plus petit nombre</strong>.
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
      moduleTitle="Qui est le plus grand ?"
      moduleSubtitle="Comparer demande d’abord une graduation commune"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: '2/3 ou 7/12 ?',
        tone: 'emerald',
        body: (
          <p>
            Impossible de répondre d’un coup d’œil : les parts n’ont pas la même taille. Comparer
            des huitièmes à des tiers, c’est comme comparer des centimètres à des mètres — il faut
            d’abord <strong>ramener les deux nombres à la même unité</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
