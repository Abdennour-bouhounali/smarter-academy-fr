import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CAS_VARIATION, differences, variationSense, fr } from '../components/suitesUtils';

/**
 * Module 5 — ATELIER : le sens de variation (P6).
 *
 * Étape 1  le comparateur : l'élève passe d'un cas à l'autre au cliquet et lit
 *          la colonne des écarts, dont le signe s'allume. Le sens se DÉDUIT du
 *          signe, il ne se devine pas sur l'allure. → brique
 *          `sens-variation-suite`.
 * Étape 2  le piège central, en deux temps : une raison entre 0 et 1 fait
 *          DESCENDRE une suite géométrique, et un premier terme négatif
 *          renverse le sens d'une raison plus grande que 1. Les deux cas sont
 *          atteignables dans le comparateur — c'est un test.
 *          → brique `regle-variation-geometrique`, puis `mem-sens-de-variation`.
 * Étape 3  le tri des six cas.
 * Étape 4  la question de méthode : que faire quand on hésite ?
 *
 * TOUS LES SENS AFFICHÉS SONT DÉRIVÉS de `variationSense` sur les termes ; le
 * sens ANNONCÉ par chaque cas est comparé au sens calculé dans
 * `suitesUtils.test.js`. Une étiquette fausse n'atteint pas l'élève.
 *
 * MANIPULATION JAMAIS GELÉE : le comparateur reste pilotable après validation.
 */
export default function Module05MonteOuDescend() {
  const [idx, setIdx] = useState(0);
  const [vus, setVus] = useState([0]);
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const done1 = vus.length >= 3 && q1;
  // L'étape 2 exige d'avoir VU les deux cas qui renversent l'intuition.
  const iDemi = CAS_VARIATION.findIndex((c) => c.id === 'v-geo-demi');
  const iNeg = CAS_VARIATION.findIndex((c) => c.id === 'v-geo-u0-neg');
  const done2 = vus.includes(iDemi) && vus.includes(iNeg) && q2;

  const aller = (v, react) => {
    if (v < 0 || v >= CAS_VARIATION.length) return;
    setIdx(v);
    if (vus.includes(v)) return;
    const suivant = [...vus, v];
    setVus(suivant);
    if (!done1 && suivant.length >= 3 && q1) react?.(true);
    else if (!done2 && suivant.includes(iDemi) && suivant.includes(iNeg) && q2) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Le signe de l’écart, et rien d’autre',
      subtitle:
        'Passe d’un cas à l’autre et lis la colonne des écarts. Visite au moins trois cas.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <Comparateur cas={CAS_VARIATION[idx]} idx={idx} total={CAS_VARIATION.length} onAller={(v) => aller(v, kit.react)} />
          <TapQuestion
            prompt="Qu’est-ce qui décide qu’une suite monte ou descend ?"
            options={[
              'Le SIGNE de l’écart u(n+1) − u(n) : positif partout elle monte, négatif partout elle descend',
              'Le signe du premier terme',
              'Le fait que l’on ajoute (elle monte) ou que l’on multiplie (elle monte aussi)',
              'La taille du premier terme',
            ]}
            correct={0}
            cols={1}
            requires={['suite-arithmetique', 'methode-trouver-la-raison']}
            explain="Le comparateur le montre à chaque cas : c’est le signe des écarts qui tranche, et lui seul. Un premier terme énorme n’empêche pas une suite de descendre, et un premier terme négatif ne l’empêche pas de monter."
            explainWrong="Regarde le cas u(0) = 20 avec raison −5 : le premier terme est grand et positif, et pourtant la suite descend. Et le cas u(0) = 64 avec raison 0,5 : on multiplie, et pourtant elle descend aussi."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {done1 ? (
            <>
              <Feedback tone="ok">
                Une seule chose à regarder : le signe des écarts. Pour une suite arithmétique, cet
                écart EST la raison — son signe suffit donc à tout dire.
              </Feedback>
              <KnowledgeBrick
                id="sens-variation-suite"
                variant="new"
                lead={<>La règle du sens, en une ligne. Repasse les cas en la lisant.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Cas visités : {vus.length} sur 3 — et la question à répondre.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Multiplier ne veut pas dire monter',
      subtitle:
        'Va voir les deux cas géométriques qui renversent l’intuition : celui de raison 0,5 et celui dont le premier terme est négatif.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="une suite géométrique de raison 2 monte-t-elle toujours ?"
            options={[
              { id: 'oui', label: 'Oui, on multiplie donc ça grandit' },
              { id: 'depend', label: 'Ça dépend du premier terme' },
              { id: 'jamais', label: 'Non, jamais' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done2}
          />
          <Comparateur
            cas={CAS_VARIATION[idx]}
            idx={idx}
            total={CAS_VARIATION.length}
            onAller={(v) => aller(v, kit.react)}
            disabled={!done1}
          />
          <TapQuestion
            prompt="Une suite géométrique de premier terme −3 et de raison 2 : que fait-elle ?"
            options={[
              'Elle descend : −3, −6, −12, −24 — l’écart est négatif à chaque pas',
              'Elle monte, puisque la raison est plus grande que 1',
              'Elle est constante',
              'Elle monte puis descend',
            ]}
            correct={0}
            cols={1}
            requires={['suite-geometrique', 'sens-variation-suite']}
            explain="Multiplier par 2 un nombre négatif l’éloigne de zéro VERS LE BAS. La raison seule ne décide pas : il faut aussi le signe du premier terme. En cas de doute, l’écart tranche — ici il vaut −3, puis −6, puis −12."
            explainWrong="Compare avec le cas u(0) = 3 et raison 2, qui monte : même raison, sens opposé. Ce qui a changé, c’est le signe du premier terme."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {done2 ? (
            <>
              <Feedback tone="ok">
                {pred === 'depend' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Voilà ce qu’il en est'} :
                deux fois « on multiplie » et deux fois une suite qui descend — une fois parce que
                la raison est entre 0 et 1, une fois parce que le premier terme est négatif.
              </Feedback>
              <KnowledgeBrick
                id="regle-variation-geometrique"
                variant="new"
                lead={<>Les deux cas qui prennent tout le monde à revers, notés ensemble.</>}
              />
              <KnowledgeBrick
                id="mem-sens-de-variation"
                variant="new"
                lead={<>Et le réflexe qui ne trompe jamais.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Va voir <strong>{CAS_VARIATION[iDemi].label}</strong> et{' '}
              <strong>{CAS_VARIATION[iNeg].label}</strong> dans le comparateur, puis réponds.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trancher les six cas',
      done: q3,
      content: (
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Pour chaque suite, donne son sens de variation. Le comparateur reste ouvert au-dessus
              si tu veux vérifier.
            </p>
          }
          rows={CAS_VARIATION.map((c) => ({
            id: c.id,
            label: c.label,
            options: ['croissante', 'décroissante', 'constante'],
            correct: c.attendu === 'croissante' ? 0 : c.attendu === 'decroissante' ? 1 : 2,
          }))}
          requires={['sens-variation-suite', 'regle-variation-geometrique', 'mem-sens-de-variation']}
          feedback={({ allRight, nCorrect, total }) => (
            <div className="space-y-2 text-sm">
              {allRight ? (
                <>Le signe de l’écart a répondu six fois sur six, sans qu’il faille tracer quoi que ce soit.</>
              ) : (
                <>
                  {nCorrect} sur {total}. Le réflexe : écris les deux premiers écarts, et regarde
                  leur signe.
                </>
              )}
              <div className="rounded-lg bg-slate-50 p-2 font-mono text-[13px]">
                {CAS_VARIATION.map((c) => (
                  <div key={c.id}>
                    {c.label} → {c.list.map(fr).join(', ')} → <strong>{motSens(variationSense(c.list).sens)}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Le réflexe en cas de doute',
      done: q4,
      content: (
        <TapQuestion
          prompt="Tu hésites sur le sens d’une suite. Que fais-tu ?"
          options={[
            'Je calcule u(n+1) − u(n) et je regarde son signe',
            'Je regarde si la raison est plus grande que 1',
            'Je compare le dernier terme au premier',
            'Je trace la courbe',
          ]}
          correct={0}
          cols={1}
          requires={['mem-sens-de-variation', 'sens-variation-suite']}
          explain="L’écart entre deux termes consécutifs répond dans TOUS les cas : arithmétique ou géométrique, premier terme positif ou négatif. Comparer la raison à 1 ne marche que si le premier terme est positif — et l’oublier est l’erreur la plus fréquente du chapitre."
          explainWrong="Comparer le dernier terme au premier ne dit rien du chemin : une suite pourrait monter puis descendre. Et « raison plus grande que 1 » a échoué à l’étape 2, sur le cas u(0) = −3."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Monte ou descend ?"
      moduleSubtitle="Le signe de l’écart tranche — même quand l’intuition dit le contraire"
      estimatedTime="11 min"
      brief={{
        tag: 'Atelier',
        title: 'Une seule chose à regarder',
        tone: 'indigo',
        body: (
          <p>
            Six suites, six sens de variation à trancher. Une seule mesure suffit à répondre à
            chaque fois — et elle survit aux deux cas où l’intuition se trompe.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Dernière étape.</strong> Tu sais générer, reconnaître, démontrer et décrire le
          sens. Reste à choisir la bonne famille devant une situation réelle.
        </KnowledgeSnapshot>
      }
    />
  );
}

const motSens = (s) =>
  ({ croissante: 'croissante', decroissante: 'décroissante', constante: 'constante', ni: 'ni l’un ni l’autre' })[s];

/* ── Le comparateur : un cas au cliquet, ses écarts en colonne ──────── */
function Comparateur({ cas, idx, total, onAller, disabled = false }) {
  const ecarts = differences(cas.list);
  const sens = variationSense(cas.list).sens;
  const btn =
    'min-w-[44px] h-11 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 '
    + 'text-sm font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  const ton = { croissante: 'emerald', decroissante: 'rose', constante: 'slate', ni: 'slate' }[sens];
  const cadre = {
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    rose: 'border-rose-300 bg-rose-50 text-rose-900',
    slate: 'border-slate-300 bg-slate-50 text-slate-800',
  }[ton];

  return (
    <div className="space-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Changer de cas">
        <button type="button" className={btn} onClick={() => onAller(idx - 1)} disabled={disabled || idx <= 0} aria-label="Cas précédent">
          ←
        </button>
        <span className="rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold tabular-nums text-white">
          cas {fr(idx + 1)} / {fr(total)}
        </span>
        <button type="button" className={btn} onClick={() => onAller(idx + 1)} disabled={disabled || idx >= total - 1} aria-label="Cas suivant">
          →
        </button>
        <span className="text-sm font-bold text-slate-800">{cas.label}</span>
      </div>

      {/* Les termes, puis les écarts alignés dessous. Tout en DOM. */}
      <div className="overflow-x-auto">
        <div className="flex items-start gap-1.5 pb-1">
          {cas.list.map((v, i) => (
            <div key={i} className="shrink-0 text-center">
              <div className="rounded-lg border-2 border-slate-300 bg-slate-50 px-2.5 py-1.5 font-mono text-base font-black tabular-nums text-slate-900">
                {fr(v)}
              </div>
              <div className="mt-0.5 font-mono text-[13px] text-slate-500">rang {fr(i)}</div>
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5" aria-live="polite">
          {ecarts.map((e, i) => (
            <span
              key={i}
              className={`rounded-lg border px-2 py-1 font-mono text-[13px] font-bold tabular-nums ${
                e > 0
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : e < 0
                  ? 'border-rose-300 bg-rose-50 text-rose-900'
                  : 'border-slate-300 bg-slate-50 text-slate-700'
              }`}
            >
              écart {fr(i)}→{fr(i + 1)} : {e > 0 ? '+' : ''}{fr(e)}
            </span>
          ))}
        </div>
      </div>

      <div className={`rounded-xl border-2 px-3 py-2 text-center text-sm font-bold ${cadre}`}>
        tous les écarts sont {sens === 'croissante' ? 'positifs' : sens === 'decroissante' ? 'négatifs' : 'nuls'} →
        la suite est <strong>{motSens(sens)}</strong>
      </div>
    </div>
  );
}
