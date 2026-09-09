import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — LABORATOIRE DE PRATIQUE : comparer sans calculer.
 *
 * Activity              placer des objets réels sur une échelle logarithmique
 *                       et lire l'écart en puissances de 10.
 * Mathematical objective un ordre de grandeur suffit à comparer deux nombres
 *                       très différents ; chaque cran d'exposant vaut un
 *                       facteur 10, donc l'écart se LIT au lieu de se
 *                       calculer.
 * Expected observation  « deux crans d'écart, c'est 100 fois — pas 2 fois ».
 * Misconception targeted lire un écart d'exposants comme un écart additif
 *                       (« 10⁶ est deux fois plus grand que 10³ »).
 *
 * TRANSFERT : les objets sont réels et n'ont jamais servi dans les modules
 * précédents.
 */
const OBJETS = [
  { id: 'atome', label: 'Un atome', valeur: '10⁻¹⁰ m', exp: -10 },
  { id: 'virus', label: 'Un virus', valeur: '10⁻⁷ m', exp: -7 },
  { id: 'cheveu', label: 'Un cheveu (épaisseur)', valeur: '10⁻⁴ m', exp: -4 },
  { id: 'humain', label: 'Un humain', valeur: '10⁰ m', exp: 0 },
  { id: 'everest', label: 'L’Everest', valeur: '10⁴ m', exp: 4 },
  { id: 'terre', label: 'La Terre (diamètre)', valeur: '10⁷ m', exp: 7 },
];

export default function Module05OrdresDeGrandeur() {
  const [vus, setVus] = useState([]);
  const explore = vus.length >= 3;
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const EXP_MIN = -10;
  const EXP_MAX = 7;

  const steps = [
    {
      num: 1,
      title: 'L’échelle du monde',
      subtitle: 'Chaque cran vaut 10 fois plus. Touche trois objets pour voir où ils tombent.',
      done: explore,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
            {/* L'échelle est une pile de lignes du DOM : aucune coordonnée
                calculée, donc rien ne peut se chevaucher (§17bis). */}
            <div className="space-y-1.5">
              {OBJETS.map((o) => {
                const vu = vus.includes(o.id);
                // La longueur de la barre encode l'exposant — c'est bien
                // l'information mathématique, pas une décoration.
                const largeur = ((o.exp - EXP_MIN) / (EXP_MAX - EXP_MIN)) * 100;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      if (vu) return;
                      const next = [...vus, o.id];
                      setVus(next);
                      if (next.length === 3) kit.react(true);
                    }}
                    aria-pressed={vu}
                    className={`flex w-full items-center gap-2 rounded-lg border-2 p-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      vu ? 'border-indigo-300 bg-indigo-50/60' : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <span className="w-36 shrink-0 truncate text-xs font-semibold text-slate-700 sm:w-44">
                      {o.label}
                    </span>
                    <span className="relative h-4 flex-1 overflow-hidden rounded bg-slate-100">
                      <span
                        className={`absolute inset-y-0 left-0 rounded ${vu ? 'bg-indigo-500' : 'bg-slate-300'}`}
                        style={{ width: `${Math.max(largeur, 2)}%` }}
                      />
                    </span>
                    <span className="w-16 shrink-0 text-right font-mono text-xs font-bold text-slate-600">
                      {o.valeur}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {explore ? (
            <Feedback tone="ok">
              Entre un atome (10⁻¹⁰ m) et la Terre (10⁷ m), il y a <strong>17 crans</strong>. Chaque
              cran vaut un facteur <strong>10</strong> — donc la Terre n’est pas « 17 fois » plus
              grande qu’un atome, elle l’est 10¹⁷ fois. C’est précisément pour cela qu’on compare des{' '}
              <strong>ordres de grandeur</strong> plutôt que des nombres.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche trois objets. Regarde bien l’exposant à droite : c’est lui qui décide de la
              longueur de la barre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Combien de fois plus grand ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="ordre-de-grandeur-4e"
            variant="new"
            lead={<>Chaque cran de ton échelle valait un facteur 10. C’est ce qui permet de comparer deux nombres sans jamais les calculer.</>}
          />
          <TapQuestion
            prompt="Un cheveu mesure 10⁻⁴ m d’épaisseur, un virus 10⁻⁷ m. Combien de fois le cheveu est-il plus épais ?"
            options={['3 fois', '1000 fois', '10 fois', '100 fois']}
            correct={1}
            cols={4}
            requires={['ordre-de-grandeur-4e']}
            explain="Trois crans d’écart entre −4 et −7, et chaque cran vaut 10 : le rapport est 10³ = 1000. L’écart des exposants (3) n’est PAS le rapport (1000)."
            explainWrong="C’est le piège central : un écart de 3 entre les exposants ne veut pas dire « 3 fois plus », mais 10³ fois plus — soit 1000. Chaque cran multiplie par 10."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Comparer deux écritures scientifiques',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Deux nombres : 3,2 × 10⁵ et 9,1 × 10³. Combien de fois le premier est-il plus grand, en puissance de 10 ? (donne juste l’exposant)"
            expected={2}
            requires={['ordre-de-grandeur-4e', 'notation-scientifique']}
            explain="On compare d’abord les exposants : 5 contre 3, soit 2 crans d’écart, donc environ 10² = 100 fois. Le coefficient 9,1 est plus grand que 3,2, mais cela ne compense jamais deux puissances de 10."
            explainFor={(n) =>
              n === 100
                ? "C’est bien le rapport (100), mais la question demandait l’EXPOSANT : 100 = 10², donc 2."
                : "Regarde d’abord les exposants — 5 et 3 — et non les coefficients : un plus grand coefficient ne rattrape jamais une puissance de 10 de retard. L’écart vaut 5 − 3 = 2."
            }
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
      moduleTitle="Ordres de grandeur"
      moduleSubtitle="Comparer sans calculer"
      estimatedTime="10 min"
      brief={{
        tag: 'Entraînement',
        title: 'De l’atome à la planète',
        tone: 'amber',
        body: (
          <p>
            Comment comparer la taille d’un atome et celle de la Terre, quand aucun des deux nombres
            ne tient sur une ligne ? On ne les compare pas : on compare leurs{' '}
            <strong>ordres de grandeur</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
