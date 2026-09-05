import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Route } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { strategiesFor, parseDec, formatDec } from '../components/proportionUtils';

/**
 * Module 5 — FORMALISATION : choisir, et savoir POURQUOI.
 *
 * Les stratégies existent depuis le module 4 ; ici l'élève apprend à
 * sélectionner la plus économique selon les nombres en présence. Le « À
 * retenir » de la leçon se construit à partir de ce tri.
 *
 * Les trois cas travaillés sont choisis pour que la réponse « la plus
 * rapide » soit indiscutable :
 *   · 4 → 20 €, chercher 8   : ×2 évident, l'unité est un détour ;
 *   · 6 → 42 €, chercher 1   : c'est LE cas du passage par l'unité ;
 *   · 5 → 15 €, chercher 7   : ni multiple ni diviseur → l'unité s'impose.
 *
 * Les listes de stratégies affichées viennent de `strategiesFor` : ce que
 * l'élève lit est calculé, jamais recopié — impossible d'afficher un chemin
 * qui n'aboutirait pas au bon résultat.
 */
const CAS = [
  {
    id: 'c1',
    prompt: '4 places de manège coûtent 20 €. Combien coûtent 8 places ?',
    xKnown: 4, yKnown: 20, xTarget: 8,
    best: 'multiplier',
    why: '8 est le double de 4 : doubler le prix est immédiat, sans calculer le prix d’une place.',
  },
  {
    id: 'c2',
    prompt: '6 barbes à papa coûtent 42 €. Combien coûte 1 barbe à papa ?',
    xKnown: 6, yKnown: 42, xTarget: 1,
    best: 'diviser',
    why: 'On cherche justement la valeur de l’unité : une seule division suffit.',
  },
  {
    id: 'c3',
    prompt: '5 tickets coûtent 15 €. Combien coûtent 7 tickets ?',
    xKnown: 5, yKnown: 15, xTarget: 7,
    best: 'unite',
    why: '7 n’est ni un multiple ni un diviseur de 5 : on passe par le prix d’un ticket, puis on multiplie par 7.',
  },
];

function StrategyList({ xKnown, yKnown, xTarget }) {
  const strategies = strategiesFor(xKnown, yKnown, xTarget);
  return (
    <div className="space-y-2">
      {strategies.map((s) => (
        <div key={s.id} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-2.5">
          <p className="text-xs font-bold text-slate-600">{s.label}</p>
          {s.steps.map((line) => (
            <p key={line} className="font-mono text-xs text-slate-800">{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Module05ChoisirStrategie() {
  const [done, setDone] = useState([]);
  const [verifDone, setVerifDone] = useState(false);

  const idx = Math.min(done.length, CAS.length - 1);
  const cas = CAS[idx];
  const allDone = done.length === CAS.length;
  const result = strategiesFor(cas.xKnown, cas.yKnown, cas.xTarget)[0].result;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Choisir sa stratégie"
      moduleSubtitle="Unité, multiplication, division, addition : la plus rapide dépend des nombres."
      estimatedTime="12 min"
      brief={{
        tag: '⚖️ Mission 05',
        title: 'Toutes les méthodes marchent. Certaines vont trois fois plus vite.',
        body: (
          <p>
            À chaque situation, regarde d'abord les nombres : y a-t-il un double ? un diviseur évident ?
            Sinon, l'unité est toujours là.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Trouve la valeur (${done.length}/${CAS.length})`,
          done: allDone,
          content: (kit) => (
            <div className="space-y-3">
              {done.length > 0 && (
                <div className="space-y-1.5">
                  {CAS.slice(0, done.length).map((c) => (
                    <div key={c.id} className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-2.5 text-xs text-slate-700">
                      <strong>{c.prompt}</strong>{' '}
                      {formatDec(strategiesFor(c.xKnown, c.yKnown, c.xTarget)[0].result)} € — {c.why}
                    </div>
                  ))}
                </div>
              )}
              {!allDone && (
                <div className="space-y-3">
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-3">
                    <p className="text-sm text-slate-700">{cas.prompt}</p>
                  </div>
                  <NumericQuestion
                    key={cas.id}
                    prompt="Ta réponse :"
                    suffix="€"
                    expected={result}
                    parse={parseDec}
                    display={formatDec(result)}
                    explain={
                      <>
                        <strong>{formatDec(result)} €</strong>. {cas.why}
                      </>
                    }
                    explainFor={() => cas.why}
                    solved={false}
                    onAnswered={() => {
                      setDone((d) => [...d, cas.id]);
                      kit.react(true);
                    }}
                  />
                  <details className="rounded-xl border-2 border-slate-200 bg-slate-50 p-3">
                    <summary className="text-xs font-semibold text-slate-600 cursor-pointer min-h-[24px]">
                      Voir les chemins possibles
                    </summary>
                    <div className="mt-2">
                      <StrategyList xKnown={cas.xKnown} yKnown={cas.yKnown} xTarget={cas.xTarget} />
                    </div>
                  </details>
                </div>
              )}
              {allDone && (
                <Feedback tone="ok">
                  Trois situations, trois stratégies gagnantes différentes. Ce ne sont pas les méthodes qui
                  changent — ce sont les nombres.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Vérifier son résultat',
          done: verifDone,
          content: (
            <div className="space-y-3">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3">
                <p className="text-sm text-slate-700">
                  Un élève calcule : « 5 tickets coûtent 15 €, donc 7 tickets coûtent{' '}
                  <strong>17 €</strong> ».
                </p>
              </div>
              <TapQuestion
                prompt="Comment repérer, sans refaire tout le calcul, que ce résultat est faux ?"
                options={[
                  'En vérifiant que le prix d’un ticket serait alors incohérent : 17 ÷ 7 ne donne pas 3 €',
                  'On ne peut pas le savoir sans tout recalculer',
                  'Parce que 17 est un nombre impair',
                ]}
                correct={0}
                cols={1}
                explain="Un ticket coûte 15 ÷ 5 = 3 €. Sept tickets doivent donc coûter 7 × 3 = 21 €, pas 17 €. L’élève a ajouté 2 (la différence 7 − 5) au lieu de multiplier : c’est l’erreur classique. Vérifier revient à contrôler que le coefficient est resté le même."
                explainWrong="La parité n’a rien à voir. La vérification utile : un ticket coûte 3 €, donc 7 tickets coûtent 21 €. L’élève a ajouté 2 € au lieu d’appliquer le coefficient."
                solved={verifDone}
                onAnswered={() => setVerifDone(true)}
              />
              {verifDone && (
                <NumericQuestion
                  prompt="Pour confirmer : combien coûtent réellement 7 tickets ?"
                  suffix="€"
                  expected={21}
                  parse={parseDec}
                  display={formatDec(21)}
                  explain={<>15 ÷ 5 = 3 € le ticket, puis 3 × 7 = <strong>21 €</strong>.</>}
                  explainFor={(n) =>
                    n === 17
                      ? 'C’est justement la réponse fausse : on ne passe pas de 5 à 7 en ajoutant 2 au prix. On multiplie le prix unitaire par 7.'
                      : 'Passe par l’unité : 15 ÷ 5 = 3 €, puis 3 × 7.'
                  }
                  solved={false}
                  onAnswered={() => {}}
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl p-5 text-center space-y-1">
            <p className="text-xs uppercase tracking-wide text-amber-100 font-mono font-bold">À retenir</p>
            <p className="font-mono font-extrabold text-sm sm:text-base">Un multiple ? → multiplie</p>
            <p className="font-mono font-extrabold text-sm sm:text-base">Un diviseur ? → divise</p>
            <p className="font-mono font-extrabold text-sm sm:text-base">Ni l’un ni l’autre ? → passe par 1</p>
          </div>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Route className="w-6 h-6 mx-auto text-amber-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Regarde les nombres AVANT de calculer : c'est ce coup d'œil qui distingue une résolution rapide
              d'un long détour.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
