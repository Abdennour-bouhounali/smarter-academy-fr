import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { formatFr, calcText } from '../components/estimationUtils';

/**
 * Module 1 — déclencheur, reconstruit sur le lesson kit.
 *
 * Le réflexe visé : juger un résultat SANS recalculer. Trois temps :
 * constat à l'œil → estimation rapide (remplacer chaque nombre par son
 * nombre ami) → conclusion. Politique formative du kit : un tap = la
 * réponse, correction toujours montrée, jamais bloquant.
 */
const CALC = { a: 398, b: 205, op: '+', wrong: 1203, correct: 603 };

/* ─── Étape 1 : le constat ────────────────────────────────────────── */
const CONSTAT_Q = {
  q: 'Un élève a calculé 398 + 205 et trouve 1 203. Sans reprendre le calcul en détail, que penses-tu de ce résultat ?',
  options: [
    "Il a sûrement raison, 1 203 est un grand nombre pour une addition de grands nombres",
    'Quelque chose ne va pas : ce résultat semble bien trop grand pour cette addition',
  ],
  correct: 1,
  explain:
    "398 et 205 sont deux nombres à 3 chiffres : leur somme ne peut pas dépasser 999 + 999 = 1998, mais surtout, elle devrait être proche de 600. 1 203, c'est presque le double de ce qu'on attend.",
};

/* ─── Étape 2 : estimer pour trancher ─────────────────────────────── */
const AMIS = [
  {
    id: 'a',
    intro: <>D'abord, remplace <strong className="font-mono">398</strong> par un nombre ami facile à calculer.</>,
    options: ['400', '390', '300'],
    correct: 0,
    explain: '398 est tout près de 400, et 400 est très simple pour un calcul mental. 390 est proche mais moins simple ; 300 est trop loin.',
  },
  {
    id: 'b',
    intro: <>Maintenant, remplace <strong className="font-mono">205</strong>.</>,
    options: ['200', '210', '300'],
    correct: 0,
    explain: '205 est tout près de 200, le nombre ami idéal. 300 est bien trop loin : l\'estimation serait faussée.',
  },
];

function EstimationRapide({ answered, onAnswered }) {
  const bothAnswered = AMIS.every((q) => answered.includes(q.id));

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-600">
        Remplace chaque nombre par un « nombre ami » facile à calculer.
      </p>

      {AMIS.map((q, i) =>
        i === 0 || answered.includes(AMIS[i - 1].id) ? (
          <div key={q.id} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
            <TapQuestion
              prompt={q.intro}
              requires={['valeur-position']}
              options={q.options}
              correct={q.correct}
              cols={3}
              explain={q.explain}
              solved={answered.includes(q.id)}
              onAnswered={() => onAnswered(q.id)}
            />
          </div>
        ) : null
      )}

      {bothAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Ton estimation</div>
          <div className="font-mono text-2xl font-extrabold text-amber-300">400 + 200 = 600</div>
          <p className="text-sm text-slate-300">On s'attend donc à un résultat proche de 600.</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 3 : conclusion ────────────────────────────────────────── */
const CONCLUSION_Q = {
  q: 'Avec cette estimation (≈ 600), que peux-tu conclure sur 1 203 ?',
  options: [
    "1 203 est cohérent avec 600, l'élève a sûrement raison",
    "1 203 est bien trop loin de 600 : le résultat de l'élève est impossible, il y a une erreur",
  ],
  correct: 1,
  explain:
    "La vraie réponse est 603 — très proche de notre estimation de 600. 1 203 est presque le double : impossible pour cette addition. L'élève a sans doute ajouté un chiffre en trop quelque part.",
};

export default function Module01Mission() {
  const [constatDone, setConstatDone] = useState(false);
  const [amisAnswered, setAmisAnswered] = useState([]);
  const [concDone, setConcDone] = useState(false);

  const s1 = constatDone;
  const s2 = AMIS.every((q) => amisAnswered.includes(q.id));
  const s3 = concDone;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : Le résultat impossible"
      moduleSubtitle="398 + 205 = 1 203 ? Développe le réflexe qui permet de le voir avant même de recalculer."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Un camarade vient de terminer un calcul.',
        body: (
          <>
            <div className="bg-white/10 rounded-xl p-4 text-center font-mono text-2xl font-bold text-white mt-2">
              {calcText(CALC.a, CALC.b, CALC.op)} = {formatFr(CALC.wrong)}
            </div>
            <p className="pt-2">
              Peux-tu savoir, <strong className="text-white">sans reprendre tout le calcul</strong>, si ce
              résultat est plausible ?
            </p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: "Un premier constat, à l'œil",
          done: s1,
          content: (
            <TapQuestion
              prompt={CONSTAT_Q.q}
              requires={['calcul-numerique']}
              options={CONSTAT_Q.options}
              correct={CONSTAT_Q.correct}
              cols={1}
              explain={CONSTAT_Q.explain}
              solved={constatDone}
              onAnswered={() => setConstatDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Estime, pour être sûr',
          done: s2,
          content: (
            <EstimationRapide
              answered={amisAnswered}
              onAnswered={(id) => setAmisAnswered((a) => (a.includes(id) ? a : [...a, id]))}
            />
          ),
        },
        {
          num: 3,
          title: 'Ta conclusion',
          done: s3,
          content: (
            <div className="space-y-4">
              <TapQuestion
                prompt={CONCLUSION_Q.q}
                requires={['calcul-numerique']}
                options={CONCLUSION_Q.options}
                correct={CONCLUSION_Q.correct}
                cols={1}
                explain={CONCLUSION_Q.explain}
                solved={concDone}
                onAnswered={() => setConcDone(true)}
              />
              {/* La notion est nommée après que l'élève s'en est servi :
                  il vient de rejeter un résultat sans le recalculer. */}
              {s3 && (
                <KnowledgeBrick
                  id="ordre-de-grandeur"
                  variant="new"
                  lead="Tu viens de juger un résultat sans reposer l'addition. Voici ce que tu as utilisé."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Le réflexe est là. On va maintenant le rendre fiable, en
          apprenant à choisir les nombres qui remplacent les vrais.
        </KnowledgeSnapshot>
      }
    />
  );
}
