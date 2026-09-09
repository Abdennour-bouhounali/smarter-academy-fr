import React, { useState } from 'react';
import { Gavel } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '@smarter-academy/core';
import { verdict, hypotenuse, coteAngleDroit, fr, arrondi } from '../components/pythagore4e';

/**
 * Module 6 — PRACTICE LAB : décider, puis appliquer.
 *
 * Ce module n'enseigne pas une technique de plus : il fait DÉCIDER. Trois
 * longueurs sont données sans figure fiable — c'est exactement la situation
 * où la réciproque sert, et où un dessin trompeur ne peut pas aider.
 * Les erreurs n'y comptent pas comme preuve (stage `practice_lab`).
 *
 * La réciproque et la contraposée sont deux LECTURES du même calcul :
 * on compare les deux membres, et c'est le résultat de la comparaison qui
 * conclut dans un sens ou dans l'autre. C'est pourquoi elles arrivent
 * ensemble, sur le même outil.
 */
const CAS = [
  { a: 9, b: 12, c: 15, nom: 'Le panneau' },
  { a: 4, b: 5, c: 7, nom: 'La palette' },
  { a: 8, b: 15, c: 17, nom: 'La bâche' },
];

export default function Module06RectangleOuPas() {
  const [testes, setTestes] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const tester = (i) => setTestes((t) => (t.includes(i) ? t : [...t, i]));
  const done1 = testes.length === CAS.length;

  const echelle = coteAngleDroit(5, 1.4); // échelle de 5 m, pied à 1,4 m du mur

  const steps = [
    {
      num: 1,
      title: 'Trois pièces à vérifier',
      subtitle: 'Aucun dessin fiable : seulement trois longueurs. À toi de trancher.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un menuisier veut savoir si ses pièces ont bien un angle droit. Il ne peut pas se fier
            au dessin — seulement aux mesures.
          </p>
          {CAS.map((cas, i) => {
            const v = verdict(cas.a, cas.b, cas.c);
            const vu = testes.includes(i);
            return (
              <div key={cas.nom} className="rounded-2xl border-2 border-slate-200 bg-white p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-slate-700">{cas.nom}</span>
                  <span className="font-mono text-sm text-slate-500">
                    {cas.a} · {cas.b} · {cas.c}
                  </span>
                </div>
                {!vu ? (
                  <button
                    type="button"
                    onClick={() => tester(i)}
                    className="mt-2 min-h-[44px] w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white"
                  >
                    Comparer les deux membres
                  </button>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-center font-mono text-sm tabular-nums">
                      {v.cotes[0]}² + {v.cotes[1]}² = <strong>{v.membreGauche}</strong>
                      <span className="mx-2 text-slate-400">|</span>
                      {v.plusGrand}² = <strong>{v.membreDroit}</strong>
                    </div>
                    <p className={`rounded-lg px-2.5 py-1.5 text-center text-xs font-semibold ${
                      v.rectangle ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'
                    }`}>
                      {v.rectangle ? 'Les deux membres sont ÉGAUX : le triangle est rectangle.'
                        : 'Les deux membres DIFFÈRENT : le triangle n’est pas rectangle.'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
          {done1 && (
            <Feedback tone="ok">
              Deux pièces sur trois ont un angle droit. Le calcul a tranché sans qu’aucun dessin
              ne soit nécessaire.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les deux sens de lecture',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Les deux membres sont égaux. Que peut-on conclure ?"
            options={[
              'Le triangle est rectangle',
              'Le triangle n’est pas rectangle',
              'Le triangle est isocèle',
              'On ne peut pas conclure',
            ]}
            correct={0}
            cols={2}
            requires={['theoreme-pythagore', 'condition-angle-droit']}
            explain="C’est la RÉCIPROQUE du théorème : de l’égalité des carrés, on déduit l’angle droit."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="reciproque"
              variant="new"
              lead="Le théorème se lit dans l’autre sens, et cela porte un nom."
            />
          )}
          {q2 && (
            <TapQuestion
              prompt="Et si les deux membres DIFFÈRENT ?"
              options={[
                'Le triangle n’est pas rectangle',
                'Le triangle est rectangle mais mal mesuré',
                'On ne peut rien conclure',
                'Il faut recommencer le calcul',
              ]}
              correct={0}
              cols={2}
              requires={['reciproque']}
              explain="C’est la CONTRAPOSÉE : si le triangle était rectangle, l’égalité serait vraie. Elle est fausse, donc il ne l’est pas. Tu l’avais déjà vu au module 2 en déplaçant C."
              solved={q3}
              onAnswered={() => setQ3(true)}
            />
          )}
          {q3 && (
            <KnowledgeBrick
              id="contraposee"
              variant="new"
              lead="L’autre conclusion possible du même calcul."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un problème réel',
      subtitle: 'Une échelle de 5 m est posée contre un mur, son pied à 1,4 m du mur.',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le mur est vertical, le sol horizontal : l’angle droit est au pied du mur. L’échelle
            est donc l’hypoténuse.
          </p>
          <NumericQuestion
            prompt="À quelle hauteur l’échelle touche-t-elle le mur ? Donne un résultat au dixième de mètre."
            expected={arrondi(echelle.valeur, 1)}
            parse={parseDec}
            suffix="m"
            requires={['methode-calculer', 'controle-hypotenuse']}
            explain={`L’échelle est l’hypoténuse : h² = 5² − 1,4² = 25 − 1,96 = ${arrondi(echelle.carre, 2)}, donc h ≈ ${fr(arrondi(echelle.valeur, 1), 1)} m.`}
            explainFor={(n) => {
              if (n === 6.4 || (typeof n === 'number' && Math.abs(n - Math.sqrt(25 + 1.96)) < 0.1)) {
                return 'Tu as additionné les carrés. Mais 5 m est l’échelle, donc l’hypoténuse : on soustrait.';
              }
              if (n === 3.6) return 'Tu as soustrait les LONGUEURS (5 − 1,4). Le théorème soustrait les carrés : 25 − 1,96.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Aucun angle droit n’était annoncé dans l’énoncé : c’est le mur vertical et le sol
              horizontal qui le donnent. Repérer l’angle droit est souvent la vraie difficulté.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Rectangle ou pas ?"
      moduleSubtitle="Décider sans figure, puis s’en servir"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'L’atelier du menuisier',
        tone: 'slate',
        body: (
          <>
            Trois pièces, trois séries de mesures, aucun dessin fiable.{' '}
            <strong>Lesquelles ont vraiment un angle droit ?</strong> Les erreurs ne comptent
            pas ici.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <Gavel className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            On calcule les deux membres séparément, puis on les compare. C’est la comparaison
            qui conclut — dans un sens comme dans l’autre.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
