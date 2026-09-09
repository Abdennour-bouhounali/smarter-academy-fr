import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  PROBLEME_FINAL, ETAPES, verifierDansLHistoire, plausible, fr,
} from '../components/raisonnement4e';

/**
 * Module 6 — PRACTICE LAB : l'enquête complète, du texte à la phrase.
 *
 * Ce module n'enseigne pas une technique de plus : il ENCHAÎNE les sept temps
 * sur un problème unique, celui-là même dont l'élève a trié les données au
 * module 2 et dessiné le schéma au module 3. Les erreurs n'y comptent pas
 * comme preuve (stage `practice_lab`).
 *
 * Ce qui reste NEUF ici, et qui n'a été fait nulle part ailleurs :
 *   — le calcul mené jusqu'au bout, sur un résultat qui NE TOMBE PAS ROND ;
 *   — la vérification DANS L'HISTOIRE (`verifierDansLHistoire`), qui remet la
 *     valeur trouvée dans l'énoncé de départ au lieu de refaire la dernière
 *     ligne ;
 *   — la phrase-réponse, qui force trois contrôles d'un coup.
 *
 * Le résultat 12,40 € est délibérément non rond : c'est ce qui rend la
 * vérification indispensable, et c'est aussi le piège du niveau (« ça ne tombe
 * pas juste, donc je me suis trompé »).
 */
const F = PROBLEME_FINAL.solution;   // 12,4 — jamais réécrit à la main
const TOTAL = 74;
const ECART = 4;
const NB_PARTS = 5;
const SURPLUS = 12;
const RESTE = TOTAL - SURPLUS;

export default function Module06EnqueteComplete() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [verifie, setVerifie] = useState(false);
  const [q4, setQ4] = useState(false);

  // Le contrôle est CALCULÉ par le noyau, sur les contrôles déclarés dans
  // PROBLEME_FINAL : la leçon ne peut pas afficher un « vert » de complaisance.
  const controle = verifierDansLHistoire(F, PROBLEME_FINAL.controles);
  const possible = plausible(F, PROBLEME_FINAL.contraintes);

  const steps = [
    {
      num: 1,
      title: 'Calculer',
      subtitle: 'Le schéma du module 3 disait quoi faire. Fais-le.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-rose-50/60 p-3.5">
            <p className="text-sm text-rose-900">{PROBLEME_FINAL.enonce}</p>
            <p className="mt-2 text-sm font-bold text-rose-950">{PROBLEME_FINAL.question}</p>
          </div>
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 text-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Ce que le schéma avait établi
            </p>
            <p className="mt-1 text-slate-700">
              {NB_PARTS} parts égales, plus {SURPLUS} € de différences. On retire les {SURPLUS} €,
              il reste <strong>{RESTE} €</strong> à partager en {NB_PARTS}.
            </p>
          </div>
          <NumericQuestion
            prompt={`Combien coûte un filet ? (${RESTE} € partagés en ${NB_PARTS})`}
            expected={F}
            parse={parseDec}
            suffix="€"
            requires={['representer', 'estimer-avant']}
            explain={`${RESTE} ÷ ${NB_PARTS} = ${fr(F)}. Le résultat ne tombe pas rond, et c’est parfaitement normal : ${fr(F)} € est un prix comme un autre.`}
            explainFor={(n) => {
              if (n === TOTAL / NB_PARTS) return `Tu as partagé les ${TOTAL} € directement. Il fallait d’abord retirer les ${SURPLUS} € de différences, sinon les ${NB_PARTS} parts ne sont pas égales.`;
              if (n === 12) return `Presque : tu as ramené le résultat à un entier. ${RESTE} ÷ ${NB_PARTS} ne tombe pas juste, et rien n’oblige un prix à le faire.`;
              if (n === F + ECART) return `C’est le prix d’un BALLON. La question porte sur le filet — relis-la.`;
              return null;
            }}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="info">
              Un résultat qui ne tombe pas rond n’est pas un résultat suspect. Ce qu’il faut,
              c’est le vérifier — et pas en refaisant la division.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le résultat est-il seulement possible ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Avant toute vérification : ${fr(F)} € est-il un prix possible pour un filet, dans cette histoire ?`}
            options={[
              `Oui : c’est positif, et bien inférieur aux ${TOTAL} € de la commande`,
              `Non : un prix doit être un nombre entier d’euros`,
              `Non : c’est trop peu pour un filet`,
              `On ne peut pas le dire sans refaire le calcul`,
            ]}
            correct={0}
            cols={1}
            requires={['controler-le-sens', 'estimer-avant']}
            explain={`Le contrôle de possibilité se fait sans calcul : un prix est positif, et il ne peut pas dépasser le total de la commande. ${fr(F)} € passe ces deux tests${possible.ok ? '' : ` (${possible.raisons.join(', ')})`}. Et un prix à virgule est parfaitement ordinaire.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              Ce contrôle-là est rapide et il élimine beaucoup d’erreurs. Mais il ne dit pas que
              le résultat est JUSTE — seulement qu’il n’est pas absurde.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Vérifier dans l’histoire',
      subtitle: 'Pas dans la dernière ligne : dans l’énoncé de départ.',
      done: verifie,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Refaire la division ne servirait à rien : si elle était fausse, elle le serait encore.
            On remet donc {fr(F)} € dans l’énoncé et on regarde si tout retombe juste.
          </p>
          {!verifie ? (
            <button
              type="button"
              onClick={() => setVerifie(true)}
              className="min-h-[44px] w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white hover:bg-rose-700"
            >
              Remettre {fr(F)} € dans l’énoncé
            </button>
          ) : (
            <div className="space-y-1.5 rounded-2xl border-2 border-slate-200 bg-white p-3">
              {controle.details.map((d) => (
                <div
                  key={d.libelle}
                  className={`flex flex-wrap items-baseline justify-between gap-2 rounded-xl px-3 py-2 text-sm ${
                    d.ok ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'
                  }`}
                >
                  <span className="font-semibold">{d.libelle}</span>
                  <span className="font-mono tabular-nums">
                    on trouve {fr(d.obtenu)} · l’énoncé dit {fr(d.attendu)}
                  </span>
                </div>
              ))}
              <p className={`rounded-xl px-3 py-2 text-center text-sm font-bold ${
                controle.ok ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
              }`}>
                {controle.ok
                  ? 'Tout retombe sur l’énoncé : le résultat tient.'
                  : 'Une ligne ne retombe pas : il y a une erreur en amont.'}
              </p>
            </div>
          )}
          {verifie && (
            <KnowledgeBrick
              id="verifier-dans-l-histoire"
              variant="new"
              lead="C’est ce retour à l’énoncé qui vérifie vraiment — et lui seul."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Expliquer',
      subtitle: `Le dernier des ${ETAPES.length} temps, et le plus souvent oublié.`,
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Laquelle de ces réponses est complète ?"
            options={[
              `Un filet coûte ${fr(F)} €.`,
              `${fr(F)}`,
              `${fr(F)} €`,
              `Le résultat de la division est ${fr(F)}.`,
            ]}
            correct={0}
            cols={1}
            requires={['verifier-dans-l-histoire', 'donnees-utiles']}
            explain="Une réponse dit DE QUOI on parle, QUELLE valeur et QUELLE unité. Un nombre nu ne répond à rien, et « le résultat de la division » parle du calcul, pas du problème."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="phrase-reponse"
              variant="new"
              lead="La phrase qui transforme un nombre en réponse."
            />
          )}
          {q4 && (
            <Feedback tone="ok">
              Les {ETAPES.length} temps sont bouclés, dans l’ordre : {ETAPES.map((e) => e.titre).join(' · ')}.
              C’est ce chemin-là que la mission finale te demandera de refaire, seul.
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
      moduleTitle="L’enquête complète"
      moduleSubtitle="Du texte à la phrase, sans sauter d’étape"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'La commande du club',
        tone: 'slate',
        body: (
          <>
            Le problème du module 2, mené jusqu’au bout. <strong>Le résultat ne tombera pas
            rond</strong> — et ce n’est pas une erreur. Ici, les erreurs ne comptent pas.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Calculer, contrôler que c’est possible, vérifier dans l’énoncé, puis écrire une
            phrase. Les quatre derniers temps, dans cet ordre.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
