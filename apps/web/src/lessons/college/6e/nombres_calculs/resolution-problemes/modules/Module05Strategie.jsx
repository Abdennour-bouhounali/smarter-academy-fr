import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 5 — manipulation, reconstruit sur le lesson kit.
 *
 * Il n'y a pas UNE seule bonne stratégie : comparer plusieurs approches
 * valables, plutôt que d'en imposer une.
 */

/* ─── Étape 1 : deux stratégies, un même problème ────────────────── */
const BOTH_Q = {
  q: 'Une classe de 27 élèves doit être répartie en groupes de 4 pour un jeu. Léa dessine 27 ronds et les entoure par paquets de 4. Nathan calcule directement 27 ÷ 4. Les deux méthodes peuvent-elles fonctionner ?',
  options: ['Oui, les deux mènent à la bonne réponse', 'Non, une seule est correcte'],
  correct: 0,
  explain: "Les deux fonctionnent : 6 groupes complets, 3 élèves restants. Le dessin de Léa rend la situation concrète ; le calcul de Nathan est plus rapide. Aucune des deux n'est « la seule bonne méthode ».",
};

const COMPARE_Q = {
  q: 'Pour un très grand nombre (par exemple 4 827 élèves), quelle méthode reste la plus PRATIQUE ?',
  options: ['Le dessin, un rond par élève', 'Le calcul direct'],
  correct: 1,
  explain: "Dessiner 4 827 ronds serait très long et source d'erreurs. Le calcul devient plus efficace quand les nombres grandissent — mais le dessin reste précieux pour COMPRENDRE une situation nouvelle.",
};

/* ─── Étape 2 : choix ouvert de stratégie (plusieurs réponses valables) ─ */
const STRATEGIES = [
  { key: 'calcul', label: '🧮 Calcul direct', good: true },
  { key: 'schema', label: '🧱 Schéma / manipulation', good: true },
  { key: 'tableau', label: '📊 Tableau', good: false },
  { key: 'droite', label: '📏 Droite graduée', good: false },
];

function ChoixOuvert({ react, solved, onSolved }) {
  const [picks, setPicks] = useState([]);
  const [checked, setChecked] = useState(false);

  const toggle = (key) => {
    if (solved) return;
    setChecked(false);
    setPicks((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  };

  const isRight = picks.length > 0 && picks.every((k) => STRATEGIES.find((s) => s.key === k)?.good) && picks.some((k) => STRATEGIES.find((s) => s.key === k)?.good);

  const submit = () => {
    setChecked(true);
    react(isRight);
    onSolved?.();
  };

  const showTone = (s) => {
    const isSel = solved ? STRATEGIES.filter((x) => x.good).some((x) => x.key === s.key) : picks.includes(s.key);
    if (checked || solved) {
      if (s.good) return 'bg-emerald-50 border-emerald-400 text-emerald-800';
      if (isSel) return 'bg-rose-50 border-rose-400 text-rose-700';
      return 'bg-white border-slate-200 text-slate-400';
    }
    return isSel ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400';
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Nouvelle situation : « 18 crayons doivent être rangés dans des trousses de 3. Combien de trousses
        faut-il ? » Quelle(s) stratégie(s) te semblent efficaces ICI ? (plusieurs réponses sont valables — touche
        toutes celles qui conviennent)
      </p>
      <div className="flex gap-2 flex-wrap">
        {STRATEGIES.map((s) => (
          <button
            key={s.key}
            type="button"
            disabled={solved || checked}
            onClick={() => toggle(s.key)}
            aria-pressed={picks.includes(s.key)}
            className={`px-4 py-3 rounded-xl border-2 text-sm font-medium min-h-[48px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${showTone(s)}`}
          >
            {(checked || solved) && s.good && <CheckCircle2 className="inline w-4 h-4 mr-1" aria-hidden="true" />}
            {s.label}
          </button>
        ))}
      </div>
      {!solved && !checked && (
        <div className="text-center">
          <ValidateButton onClick={submit} disabled={picks.length === 0}>Valider</ValidateButton>
        </div>
      )}
      {(checked || solved) && (
        <Feedback tone={isRight || solved ? 'ok' : 'ko'}>
          Le calcul direct (18 ÷ 3 = 6) et le schéma / manipulation (former des groupes de 3) fonctionnent tous
          les deux très bien ici. Le tableau et la droite graduée sont moins adaptés à ce type de partage.
        </Feedback>
      )}
    </div>
  );
}

/* ─── Étape 3 : pourquoi plusieurs stratégies ────────────────────── */
const WHY_Q = {
  q: "Pourquoi est-il utile de connaître plusieurs stratégies plutôt qu'une seule méthode imposée ?",
  options: [
    "Parce que certaines situations se comprennent mieux avec un dessin, d'autres se résolvent plus vite avec un calcul — la meilleure stratégie dépend de la situation",
    "Parce qu'il faut toujours utiliser la méthode la plus compliquée possible",
    "Ça n'a pas vraiment d'importance, toutes les méthodes se valent toujours",
  ],
  correct: 0,
  explain: "Exactement. Un bon résolveur de problèmes choisit sa stratégie selon la situation, pas par habitude. Cette flexibilité est plus importante qu'une procédure unique apprise par cœur.",
};

function DeuxMethodes({ solved, onAllAnswered }) {
  const [bothDone, setBothDone] = useState(false);

  return (
    <div className="space-y-5">
      <TapQuestion
        prompt={BOTH_Q.q}
        requires={['choisir-un-modele']}
        options={BOTH_Q.options}
        correct={BOTH_Q.correct}
        cols={1}
        explain={BOTH_Q.explain}
        solved={bothDone || solved}
        onAnswered={() => setBothDone(true)}
      />

      {(bothDone || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <TapQuestion
            prompt={COMPARE_Q.q}
            requires={['choisir-un-modele']}
            options={COMPARE_Q.options}
            correct={COMPARE_Q.correct}
            cols={1}
            explain={COMPARE_Q.explain}
            solved={solved}
            onAnswered={onAllAnswered}
          />
        </div>
      )}
    </div>
  );
}

export default function Module05Strategie() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Choisir une stratégie"
      moduleSubtitle="Plusieurs chemins peuvent être valables : comparer, pas imposer."
      estimatedTime="7 min"
      brief={{
        tag: '🧠 Stratégie',
        title: 'La question n\'est pas « quelle opération ? » mais « comment chercher ? ».',
        body: <p>Il existe souvent plusieurs bonnes façons d'aborder un même problème.</p>,
      }}
      steps={[
        {
          num: 1,
          title: 'Deux élèves, deux méthodes',
          done: s1,
          content: (
            <div className="space-y-5">
              <DeuxMethodes solved={s1} onAllAnswered={() => setS1(true)} />
              {/* Les deux méthodes viennent d'être comparées sur un petit
                  nombre puis sur un grand : le critère est maintenant clair. */}
              {s1 && (
                <KnowledgeBrick
                  id="plusieurs-strategies"
                  variant="new"
                  lead="Léa dessinait, Nathan calculait — et pour 4 827 élèves, l'un des deux a lâché."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À toi de choisir',
          done: s2,
          content: (kit) => <ChoixOuvert react={kit.react} solved={s2} onSolved={() => setS2(true)} />,
        },
        {
          num: 3,
          title: 'Pourquoi plusieurs stratégies ?',
          done: s3,
          content: (
            <TapQuestion
              prompt={WHY_Q.q}
              requires={['plusieurs-strategies']}
              options={WHY_Q.options}
              correct={WHY_Q.correct}
              cols={1}
              explain={WHY_Q.explain}
              solved={s3}
              onAnswered={() => setS3(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Assez d'entraînement à vide : six problèmes, sans étiquette,
          sans indication d'opération.
        </KnowledgeSnapshot>
      }
    />
  );
}
