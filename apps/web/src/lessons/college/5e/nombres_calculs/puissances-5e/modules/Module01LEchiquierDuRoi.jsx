import React, { useState } from 'react';
import { Grid3x3, ChevronsRight } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DoublingLab from '../components/DoublingLab';
import { grainsCase, produitEcrit, ecrirePuissance, CASES_MAX } from '../components/puissances';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : l'échiquier du roi
 * (components/DoublingLab.jsx).
 *
 * Activity              avancer case après case sur un échiquier où le nombre
 *                       de grains double à chaque pas.
 * Mathematical objective quand un même facteur se répète, écrire le produit en
 *                       entier devient impraticable — d'où le besoin d'une
 *                       écriture qui dise QUEL facteur et COMBIEN DE FOIS.
 * Student action        toucher « case suivante » (et « précédente » : on peut
 *                       toujours revenir).
 * Controlled variable   le numéro de la case, et lui seul.
 * Visual consequence    l'échiquier se remplit, le compte de grains se réécrit,
 *                       et surtout la ligne du calcul écrit S'ALLONGE jusqu'à
 *                       déborder de son cadre.
 * Expected observation  « c'est toujours le même facteur 2 ; seul le NOMBRE DE
 *                       FOIS change » puis « écrire tout ça est absurde ».
 * Misconception targeted lire une future notation 2⁸ comme « 2 × 8 ». Ici,
 *                       l'élève a d'abord VU les huit facteurs alignés.
 * Formalization         le mot n'arrive qu'à l'étape 4, après trois
 *                       manipulations, porté par une KnowledgeBrick. Le SENS
 *                       exact de l'exposant est délibérément laissé au module
 *                       2, qui garde ainsi sa découverte.
 * Transfer              module 2 : que compte au juste le nombre du haut ?
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage. La
 * manipulation reste REJOUABLE après validation — aucun `disabled` lié à `done`.
 */
const CASE_DEBORDE = 10;

export default function Module01LEchiquierDuRoi() {
  // Étape 1 — avancer jusqu'à ce que la ligne déborde.
  const [case1, setCase1] = useState(1);
  const [maxAtteint, setMaxAtteint] = useState(1);
  const [pred1, setPred1] = useState(null);
  const done1 = maxAtteint >= CASE_DEBORDE;

  // Étape 2 — comparer deux cases : le facteur ne change pas, le compte si.
  const [case2, setCase2] = useState(4);
  const [vues, setVues] = useState(() => new Set([4]));
  const done2 = vues.size >= 3;

  // Étape 3 — aller au bout de l'échiquier.
  const [case3, setCase3] = useState(1);
  const [bout, setBout] = useState(false);
  const done3 = bout;

  const [q4, setQ4] = useState(false);

  const avancer1 = (k, react) => {
    setCase1(k);
    if (k > maxAtteint) {
      setMaxAtteint(k);
      if (k >= CASE_DEBORDE && maxAtteint < CASE_DEBORDE) react?.(true);
    }
  };

  const avancer2 = (k, react) => {
    setCase2(k);
    const next = new Set(vues);
    next.add(k);
    setVues(next);
    if (next.size >= 3 && vues.size < 3) react?.(true);
  };

  const avancer3 = (k, react) => {
    setCase3(k);
    if (k >= CASES_MAX && !bout) { setBout(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Avance sur l’échiquier',
      subtitle: 'Un grain sur la première case, le double à chaque case suivante. Surveille la ligne noire du calcul.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DoublingLab
            cases={case1}
            onCases={(k) => avancer1(k, kit.react)}
            ariaLabel="Échiquier — avance de case en case"
          />
          <PredictionChips
            prompt="à ton avis, jusqu’où la ligne du calcul écrit va-t-elle tenir dans l’écran ?"
            options={[
              { id: 'toujours', label: 'Elle tiendra toujours' },
              { id: 'dix', label: 'Elle débordera vers la case 10' },
              { id: 'jamais', label: 'Elle débordera dès la case 3' },
            ]}
            value={pred1}
            onChange={setPred1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'dix' ? 'Ta prédiction était la bonne' : 'Tu l’as vu'} : à la case{' '}
              {CASE_DEBORDE}, la ligne <strong>ne tient plus</strong>. Et pourtant, regarde ce
              qu’elle contient : <strong>toujours le même facteur 2</strong>, recopié encore et
              encore. Seul <strong>le nombre de fois</strong> change d’une case à l’autre.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Continue d’avancer. Tu es à la case {case1} — que devient la ligne du calcul ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Qu’est-ce qui change d’une case à l’autre ?',
      subtitle: 'Compare au moins trois cases différentes, et regarde bien la ligne du calcul.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <DoublingLab
            cases={case2}
            onCases={(k) => avancer2(k, kit.react)}
            ariaLabel="Échiquier — compare plusieurs cases"
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Cases visitées</span>
            {[...vues].sort((a, b) => a - b).map((k) => (
              <span
                key={k}
                className="px-3 py-1.5 rounded-lg bg-amber-50 border-2 border-amber-200 font-mono font-bold text-amber-800 tabular-nums"
              >
                {k}
              </span>
            ))}
          </div>
          {done2 ? (
            <Feedback tone="ok">
              Dans toutes ces lignes, le facteur est <strong>toujours 2</strong> — jamais 3, jamais
              7. Ce qui distingue une case d’une autre, c’est uniquement{' '}
              <strong>le nombre de 2 écrits</strong>. Deux informations suffiraient donc à décrire
              n’importe quelle case : <em>quel facteur</em>, et <em>combien de fois</em>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {vues.size} case{vues.size > 1 ? 's' : ''} visitée{vues.size > 1 ? 's' : ''} sur 3.
              Le facteur qui se répète change-t-il d’une case à l’autre ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Va jusqu’au bout',
      subtitle: `Atteins la case ${CASES_MAX}. Combien de 2 faudrait-il écrire ?`,
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <DoublingLab
            cases={case3}
            onCases={(k) => avancer3(k, kit.react)}
            ariaLabel="Échiquier — atteins la dernière case"
          />
          {done3 ? (
            <Feedback tone="ok">
              <strong>{grainsCase(CASES_MAX).toLocaleString('fr-FR')} grains</strong> sur cette
              seule case — et il aurait fallu écrire <strong>{CASES_MAX - 1} fois le facteur 2</strong>{' '}
              pour l’obtenir. L’échiquier de la légende compte 64 cases : personne n’écrira jamais
              ce calcul en entier. Il faut une autre écriture.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tu es à la case {case3}. Continue jusqu’à la {CASES_MAX}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'L’écriture qui remplace la ligne',
      done: q4,
      content: (
        <div className="space-y-3">
          {/* Trois manipulations viennent de montrer que le facteur ne change
              jamais, que seul son NOMBRE varie, et qu'écrire la liste est
              impraticable. C'est l'instant où le raccourci a un sens — avant
              la question qui l'exige. Le SENS EXACT de l'exposant, lui, est
              laissé au module 2. */}
          <KnowledgeBrick
            id="puissance"
            variant="new"
            lead={<>Tu as vu la ligne déborder, alors qu’elle ne contenait qu’une seule information répétée. Les mathématiciens ont inventé une écriture pour cela.</>}
          />
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-3 text-center space-y-1">
            <div className="text-xs uppercase tracking-wide text-amber-700">La case 6, dans les deux écritures</div>
            <div className="font-mono text-sm text-slate-700">{produitEcrit(2, 5)}</div>
            <div className="text-slate-400 text-xs">c’est-à-dire</div>
            <div className="font-mono text-2xl font-black text-amber-800">{ecrirePuissance(2, 5)}</div>
          </div>
          <TapQuestion
            prompt={<>Comment s’écrit en court le calcul <span className="font-mono font-bold">{produitEcrit(3, 4)}</span> ?</>}
            options={[
              ecrirePuissance(3, 4),
              ecrirePuissance(4, 3),
              '3 × 4',
              '12',
            ]}
            correct={0}
            cols={4}
            requires={['puissance']}
            explain={`Le facteur qui se répète est 3, et il apparaît 4 fois : on écrit donc ${ecrirePuissance(3, 4)}. En bas le facteur, en haut le nombre de fois.`}
            explainWrong={`Attention à ne pas intervertir : ${ecrirePuissance(4, 3)} voudrait dire « quatre répété trois fois », ce qui n’est pas le calcul proposé. Ici, c'est bien le 3 qui est écrit quatre fois.`}
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’échiquier du roi"
      moduleSubtitle="Quand écrire le calcul devient impossible"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un grain, puis le double',
        tone: 'amber',
        body: (
          <p>
            Un sage demande au roi une récompense modeste : <strong>un grain de riz</strong> sur la
            première case de l’échiquier, <strong>le double</strong> sur la suivante, et ainsi de
            suite. Le roi accepte en riant. Avance case après case, et regarde ce qui arrive au
            calcul écrit.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Grid3x3, t: 'L’échiquier', d: 'Chaque case porte le double de la précédente.', c: 'text-amber-600' },
            { icon: ChevronsRight, t: 'Ton geste', d: 'Avance — et reviens en arrière autant que tu veux.', c: 'text-slate-700' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
