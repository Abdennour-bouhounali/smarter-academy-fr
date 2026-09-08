import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import UnitBar from '../components/UnitBar';
import FractionInput from '../components/FractionInput';
import { frac, agrandir, memeNombre, texte } from '../components/rationnels';

/**
 * Module 2 — DÉCOUVERTE : pourquoi la position n'avait pas bougé.
 *
 * Activity              couper chaque part en deux, trois, quatre… et
 *                       surveiller la longueur remplie de la barre.
 * Mathematical objective multiplier les DEUX termes par un même nombre ne
 *                       change pas le nombre désigné.
 * Student action        choisir le facteur de découpage.
 * Visual consequence    la barre du bas se subdivise ; le trait de fin reste
 *                       aligné avec celui de la barre du haut.
 * Expected observation  « le nombre de parts et la taille des parts changent
 *                       ensemble, en sens inverse — donc la longueur ne bouge
 *                       pas ».
 * Misconception targeted ne multiplier qu'un seul des deux termes, et croire
 *                       qu'on obtient encore le même nombre.
 *
 * Le module 1 a fait CONSTATER que 3/4 et 6/8 tombent au même endroit ; celui-ci
 * en donne la raison et en fait une méthode reproductible.
 */
const BASE = frac(3, 4);

export default function Module02DeuxEcrituresUnNombre() {
  const [k, setK] = useState(1);
  const [essais, setEssais] = useState(() => new Set([1]));
  const done1 = essais.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const couper = (v, react) => {
    setK(v);
    const next = new Set(essais);
    next.add(v);
    setEssais(next);
    if (next.size >= 3 && essais.size < 3) react?.(true);
  };

  const courante = agrandir(BASE, k);

  const steps = [
    {
      num: 1,
      title: 'Coupe chaque part en deux, puis en trois…',
      subtitle: 'La barre du haut ne change jamais. Essaie au moins trois découpages sur celle du bas et surveille le trait de fin.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            <UnitBar num={BASE.num} den={BASE.den} label={texte(BASE)} couleur="indigo" />
            <UnitBar num={courante.num} den={courante.den} label={texte(courante)} couleur="emerald" />
          </div>
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir par combien couper chaque part">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => couper(v, kit.react)}
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
              À chaque découpage, les deux barres <strong>s’arrêtent au même endroit</strong>. C’est
              logique : en coupant chaque part en {k > 1 ? k : 2}, on obtient{' '}
              <strong>{k > 1 ? k : 2} fois plus de parts</strong>, mais elles sont{' '}
              <strong>{k > 1 ? k : 2} fois plus fines</strong>. Les deux changements se compensent
              exactement — la longueur, elle, ne bouge pas.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {essais.size} découpage{essais.size > 1 ? 's' : ''} essayé{essais.size > 1 ? 's' : ''} sur 3.
              Le trait de fin de la barre verte bouge-t-il ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La règle qui se cachait derrière',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="fractions-egales"
            variant="new"
            lead={<>Tu viens de fabriquer plusieurs écritures d’un seul et même nombre, sans jamais changer la longueur. Voici la règle que ton geste applique.</>}
          />
          <KnowledgeBrick id="mem-deux-termes" variant="new" compact />
          <TapQuestion
            prompt="Laquelle de ces fractions n’est PAS égale à 2/5 ?"
            options={['2/10', '4/10', '6/15', '8/20']}
            correct={0}
            cols={4}
            requires={['fractions-egales', 'mem-deux-termes']}
            explain="4/10, 6/15 et 8/20 s’obtiennent en multipliant les DEUX termes de 2/5 par 2, 3 et 4. Pour 2/10, seul le dénominateur a été multiplié : le numérateur est resté à 2, donc le nombre a changé (2/10 vaut la moitié de 2/5)."
            explainWrong="Vérifie à chaque fois le geste fait EN HAUT et celui fait EN BAS : ils doivent être identiques. Dans 2/10, le bas a été multiplié par 2 mais pas le haut — c’est exactement l’erreur que la règle interdit."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Complète l’écriture manquante',
      subtitle: 'Écris la fraction demandée avec les deux champs.',
      done: q3,
      content: (
        <div className="space-y-3">
          <FractionInput
            prompt={<>Écris <span className="font-mono font-bold">3/4</span> avec un dénominateur de <strong>12</strong>.</>}
            expected={frac(9, 12)}
            formeExacte
            requires={['fractions-egales']}
            explain="Pour passer de 4 à 12, on multiplie par 3. Il faut donc multiplier AUSSI le numérateur par 3 : 3 × 3 = 9. On obtient 9/12."
            explainFor={(rep) => {
              if (rep.den === 12 && rep.num === 3) return 'Tu as bien mis 12 en bas, mais tu as laissé le 3 en haut. Le dénominateur a été multiplié par 3 : le numérateur doit l’être aussi, ce qui donne 9/12.';
              if (memeNombre(rep, frac(3, 4))) return `${texte(rep)} désigne bien le même nombre que 3/4 — mais on demandait précisément l’écriture avec 12 en bas, c’est-à-dire 9/12.`;
              return 'De 4 à 12, on multiplie par 3. Le même ×3 s’applique au numérateur : 3 × 3 = 9, donc 9/12.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Repère les écritures d’un même nombre',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Ces couples désignent-ils <strong>le même nombre</strong> ?
              </p>
            }
            rows={[
              { id: 'p1', label: '1/2 et 5/10', options: ['Le même', 'Différents'], correct: 0, correction: '1/2, en multipliant les deux termes par 5, donne 5/10. Le même nombre.' },
              { id: 'p2', label: '2/3 et 4/9', options: ['Le même', 'Différents'], correct: 1, correction: 'Le bas a été multiplié par 3 (3 → 9) mais le haut seulement par 2. 2/3 s’écrirait 6/9.' },
              { id: 'p3', label: '5/6 et 15/18', options: ['Le même', 'Différents'], correct: 0, correction: 'Les deux termes ont été multipliés par 3 : 5 × 3 = 15 et 6 × 3 = 18. Le même nombre.' },
            ]}
            requires={['fractions-egales', 'mem-deux-termes']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le réflexe est en place : on regarde <strong>par combien le bas a été multiplié</strong>,
                  et on vérifie que le haut l’a été <strong>par le même nombre</strong>.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. La méthode ne change jamais : cherche par combien on passe
                  d’un dénominateur à l’autre, puis vérifie que les numérateurs sont multipliés{' '}
                  <strong>par ce même nombre</strong>. Si les deux nombres diffèrent, les fractions
                  diffèrent.
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Deux écritures, un seul nombre"
      moduleSubtitle="Pourquoi le point n’avait pas bougé"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Le mystère du curseur immobile',
        tone: 'violet',
        body: (
          <p>
            Au module précédent, tu as changé le découpage et le point est resté{' '}
            <strong>exactement au même endroit</strong>, tout en changeant de nom. Ce n’était pas
            un hasard. Découvre pourquoi — et apprends à fabriquer toi-même autant d’écritures que
            tu veux.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
