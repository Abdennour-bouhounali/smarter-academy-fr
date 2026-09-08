import React, { useState } from 'react';
import { ContentModule, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { decoupeProduit, fr, mul, parseDecimalFr } from '../components/operations';

/**
 * Module 5 — MANIPULATION : découper un calcul pour le faire de tête.
 *
 * Activity              couper un rectangle de 17 × 6 en deux morceaux et
 *                       constater que l'aire totale ne bouge pas.
 * Mathematical objective un produit se décompose en somme de produits ; c'est
 *                       ce qui rend le calcul en ligne possible.
 * Student action        choisir OÙ couper le rectangle.
 * Visual consequence    les deux morceaux se colorent, leurs aires s'affichent,
 *                       et leur somme reste égale au produit de départ.
 * Expected observation  « où que je coupe, la somme des deux morceaux redonne
 *                       toujours le même total » — l'invariant.
 * Misconception targeted croire qu'on « change » le calcul en le décomposant,
 *                       donc ne pas oser le faire.
 *
 * PÉRIMÈTRE — cette propriété est vue NUMÉRIQUEMENT, sur des nombres. Elle
 * n'est jamais écrite avec des lettres, et le mot « distributivité » n'est pas
 * employé : la forme algébrique est un objet officiel de 4e (voir
 * lesson.config.js 5 exclude). Ici, on « découpe » et on « regroupe ».
 */
const A = 17;
const B = 6;

/** Le rectangle coupé — DOM en flux, aucune coordonnée : rien ne peut se chevaucher. */
function RectangleCoupe({ a, b, b1 }) {
  const d = decoupeProduit(a, b, b1);
  const pct = (b1 / b) * 100;
  return (
    <div className="space-y-2">
      <div className="flex rounded-xl overflow-hidden border-2 border-slate-300 h-20 sm:h-24">
        <div
          className="bg-emerald-400/70 flex items-center justify-center min-w-0"
          style={{ width: `${pct}%` }}
        >
          <span className="font-mono text-xs sm:text-sm font-black text-emerald-950 px-1 truncate">
            {a} × {d.b1}
          </span>
        </div>
        <div
          className="bg-sky-400/70 flex items-center justify-center min-w-0 border-l-2 border-white"
          style={{ width: `${100 - pct}%` }}
        >
          <span className="font-mono text-xs sm:text-sm font-black text-sky-950 px-1 truncate">
            {a} × {d.b2}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 py-1.5">
          <div className="text-[11px] text-emerald-700">morceau 1</div>
          <div className="font-mono font-black text-emerald-800 tabular-nums">{fr(mul(a, d.b1))}</div>
        </div>
        <div className="rounded-lg bg-sky-50 border border-sky-200 py-1.5">
          <div className="text-[11px] text-sky-700">morceau 2</div>
          <div className="font-mono font-black text-sky-800 tabular-nums">{fr(mul(a, d.b2))}</div>
        </div>
        <div className="rounded-lg bg-slate-100 border-2 border-slate-300 py-1.5">
          <div className="text-[11px] text-slate-600">total</div>
          <output className="font-mono font-black text-slate-900 tabular-nums" data-total={String(d.droite)}>
            {fr(d.droite)}
          </output>
        </div>
      </div>
    </div>
  );
}

export default function Module04LeCalculMalin() {
  const [coupe, setCoupe] = useState(3);
  const [essais, setEssais] = useState(() => new Set([3]));
  const done1 = essais.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const couper = (b1, react) => {
    setCoupe(b1);
    const next = new Set(essais);
    next.add(b1);
    setEssais(next);
    if (next.size >= 3 && essais.size < 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Coupe le rectangle où tu veux',
      subtitle: 'Ce rectangle contient 17 × 6 carreaux. Essaie au moins trois coupes différentes et surveille le total.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <RectangleCoupe a={A} b={B} b1={coupe} />
          <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir où couper">
            {Array.from({ length: B - 1 }, (_, i) => i + 1).map((b1) => (
              <button
                key={b1}
                type="button"
                onClick={() => couper(b1, kit.react)}
                aria-pressed={b1 === coupe}
                data-coupe={b1}
                className={[
                  'min-h-[44px] min-w-[44px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                  b1 === coupe
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400',
                ].join(' ')}
              >
                {b1}
              </button>
            ))}
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Tu as coupé à {essais.size} endroits différents, et le total est resté{' '}
              <strong className="font-mono">102</strong> à chaque fois. C’est logique : couper le
              rectangle ne retire aucun carreau. On a seulement <strong>rangé autrement</strong> —
              et deux petits produits sont bien plus faciles à faire de tête qu’un grand.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie une autre coupe. Que devient le total ? ({essais.size} coupe
              {essais.size > 1 ? 's' : ''} essayée{essais.size > 1 ? 's' : ''} sur 3.)
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Choisis le découpage le plus commode',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="decouper-calcul"
            variant="new"
            lead={<>Tu viens de couper le même rectangle de trois façons sans jamais changer son aire. C’est cela, le calcul malin.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque calcul, quel découpage permet de le faire <strong>de tête</strong> ?
              </p>
            }
            rows={[
              {
                id: 'c1',
                label: '25 × 12',
                options: ['25 × 10 + 25 × 2', '25 × 6 + 25 × 6', '25 × 11 + 25'],
                correct: 0,
                correction: '250 + 50 = 300. Couper sur 10 est le plus simple : multiplier par 10 est immédiat.',
              },
              {
                id: 'c2',
                label: '4 × 37 × 25',
                options: ['(4 × 37) × 25', '(4 × 25) × 37', '4 × (37 × 25)'],
                correct: 1,
                correction: '4 × 25 = 100, puis 100 × 37 = 3 700. On regroupe ce qui fait un nombre rond.',
              },
              {
                id: 'c3',
                label: '19 × 8',
                options: ['20 × 8 − 8', '19 × 4 + 19 × 4', '10 × 8 + 9 × 8'],
                correct: 0,
                correction: '160 − 8 = 152. On complète à 20, plus facile, puis on retire le paquet en trop.',
              },
            ]}
            requires={['decouper-calcul']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Tous les découpages proposés donnent le bon résultat — la question n’était pas
                  « lequel est juste », mais <strong>lequel est commode</strong>. On coupe toujours
                  vers un nombre rond : 10, 20, 100.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Attention : toutes ces écritures sont mathématiquement
                  justes. Ce qu’on cherche, c’est celle qui fait apparaître un{' '}
                  <strong>nombre rond</strong> — × 10, × 20 ou × 100 — car c’est le seul type de
                  produit qu’on fait vraiment de tête.
                </Feedback>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'À toi, de tête',
      subtitle: 'Découpe mentalement, puis donne le résultat.',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">102 × 7</span> ?</>}
            expected={714}
            parse={parseDecimalFr}
            display="714"
            requires={['decouper-calcul']}
            explain="On découpe 102 en 100 + 2 : 100 × 7 = 700 et 2 × 7 = 14, donc 700 + 14 = 714."
            explainFor={(n) => {
              if (n === 700) return 'Tu as bien fait 100 × 7 = 700, mais il reste le second morceau : 2 × 7 = 14. Le total est 700 + 14 = 714.';
              if (n === 7014) return 'Attention : on ajoute les deux morceaux, on ne les écrit pas à la suite. 700 + 14 = 714.';
              return 'Découpe 102 en 100 + 2 : 700 + 14 = 714.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un calcul avec des décimaux',
      subtitle: 'Le même geste marche exactement pareil avec une virgule.',
      done: q4,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">2,5 × 8</span> ?</>}
            expected={20}
            parse={parseDecimalFr}
            display="20"
            requires={['decouper-calcul']}
            explain="On découpe le 8 en 4 + 4 : 2,5 × 4 = 10, donc 2,5 × 8 = 10 + 10 = 20. (Ou : 2,5 × 8, c’est quatre paires de 2,5 + 2,5 = 5, soit 4 × 5 = 20.)"
            explainFor={(n) => {
              if (n === 2 || n === 2.5) return 'Il s’agit d’une multiplication : huit paquets de 2,5. Deux paquets font 5, donc huit paquets font 20.';
              if (n === 16.5 || n === 16) return 'La virgule change le résultat : 2,5 c’est 2 et demi, pas 2. Huit fois « deux et demi » vaut 8 × 2 = 16 plus 8 × 0,5 = 4, soit 20.';
              return 'Découpe : 2,5 × 8 = 2,5 × 4 + 2,5 × 4 = 10 + 10 = 20.';
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
      moduleTitle="Le calcul malin"
      moduleSubtitle="Découper pour calculer de tête"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: '17 × 6, sans poser l’opération',
        tone: 'emerald',
        body: (
          <p>
            Poser une multiplication prend du temps, et une retenue oubliée fausse tout. Il existe
            une autre voie : <strong>couper le calcul en morceaux faciles</strong>. Reste à
            vérifier que couper ne change pas le résultat — c’est ce que tu vas faire.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
