import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Target, BookMarked, Zap, ArrowRight, CheckCircle2, AlertTriangle, XCircle, Search } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import RoundPicker from '../components/RoundPicker';
import EstimateInput from '../components/EstimateInput';
import ArrayGrid from '../components/ArrayGrid';
import { formatFr, classifyPlausibility } from '../components/estimationUtils';
import { parseFr } from '@smarter-academy/core';

/* ═══ LES 7 ÉPREUVES ═══════════════════════════════════════════════ */
const CATS = [
  { key: 'plausible', label: 'Plausible', Icon: CheckCircle2, rightCls: 'bg-emerald-50 border-emerald-400 text-emerald-800' },
  { key: 'suspect', label: 'Suspect', Icon: AlertTriangle, rightCls: 'bg-amber-50 border-amber-400 text-amber-800' },
  { key: 'impossible', label: 'Impossible', Icon: XCircle, rightCls: 'bg-rose-50 border-rose-400 text-rose-800' },
];

function DetectiveMini({ calc, proposed, estimate, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correct = classifyPlausibility(estimate, proposed);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="font-mono font-bold text-lg text-slate-800">{calc} = {formatFr(proposed)}</span>
      </div>
      <p className="text-xs font-mono text-slate-400">Estimation : ≈ {formatFr(estimate)}</p>
      <div className="flex gap-2 flex-wrap">
        {CATS.map(({ key, label, Icon, rightCls }) => {
          const isSel = pick === key;
          const isRightBtn = revealed && key === correct;
          const isWrongBtn = revealed && isSel && key !== correct;
          const cls = isRightBtn ? rightCls : isWrongBtn ? 'bg-rose-50 border-rose-400 text-rose-700' : isSel ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400';
          return (
            <button key={key} type="button" disabled={revealed || solved} onClick={() => { setPick(key); setRevealed(false); }} aria-pressed={isSel}
              className={`px-3 py-2.5 rounded-xl border-2 font-mono text-xs font-bold min-h-[44px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${cls}`}>
              <Icon className="inline w-3.5 h-3.5 mr-1" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
      {!solved && (
        <div className="text-center">
          <ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved(); }} disabled={pick === null} tone="amber">Valider</ValidateButton>
        </div>
      )}
      {revealed && <Feedback tone={pick === correct ? 'ok' : 'ko'}>La bonne réponse est « {CATS.find((c) => c.key === correct).label} ».</Feedback>}
    </div>
  );
}

const EPREUVES = [
  {
    id: 'eval-01', skill: 'arrondir', title: 'Épreuve 1',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P2'] },
    render: ({ solved, onSolved }) => <RoundPicker value={286} step={10} solved={solved} onSolved={onSolved} />,
  },
  {
    id: 'eval-02', skill: 'somme', title: 'Épreuve 2', prompt: <>Estime <strong className="font-mono">412 + 289</strong>.</>,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P3'] },
    render: ({ solved, onSolved }) => (
      <EstimateInput acceptMin={650} acceptMax={750} exact={701} solved={solved} onSolved={onSolved} hint="412 ≈ 400 ou 410, 289 ≈ 300 ou 290 : le total tourne autour de 700." />
    ),
  },
  {
    id: 'eval-03', skill: 'difference', title: 'Épreuve 3', prompt: <>Estime <strong className="font-mono">905 − 396</strong>.</>,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P3'] },
    render: ({ solved, onSolved }) => (
      <EstimateInput acceptMin={450} acceptMax={550} exact={509} solved={solved} onSolved={onSolved} hint="900 − 400 = 500." />
    ),
  },
  {
    id: 'eval-04', skill: 'produit', title: 'Épreuve 4', prompt: <>Estime <strong className="font-mono">31 × 39</strong>, en imaginant le rectangle.</>,
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P3'] },
    render: ({ solved, onSolved }) => (
      <div className="space-y-3">
        <ArrayGrid rows={30} cols={40} tone="amber" caption="30 × 40 = 1 200" />
        <EstimateInput acceptMin={1000} acceptMax={1400} exact={1209} solved={solved} onSolved={onSolved} hint="31 ≈ 30 et 39 ≈ 40 : 30 × 40 = 1 200." />
      </div>
    ),
  },
  {
    id: 'eval-05', skill: 'detective', title: 'Épreuve 5',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P4'] },
    render: ({ solved, onSolved }) => <DetectiveMini calc="298 + 512" proposed={1810} estimate={800} solved={solved} onSolved={onSolved} />,
  },
  {
    id: 'eval-06', skill: 'precision', title: 'Épreuve 6',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P5'] },
    render: ({ solved, onSolved }) => {
      const [pick, setPick] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const correct = 1;
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Environ combien d'élèves dans ce collège de 612 élèves, arrondi pour en parler facilement ?</p>
          <ChoiceGrid options={['≈ 60', '≈ 600', '≈ 6 000']} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={3} />
          {!revealed && <div className="text-center"><ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved(); }} disabled={pick === null} tone="amber">Valider</ValidateButton></div>}
          {revealed && <Feedback tone={pick === correct ? 'ok' : 'ko'}>612 ≈ 600.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'eval-07', skill: 'problemes', title: 'Épreuve 7 — Problème final',
    assessment: { enabled: true, type: 'assessment', learningPointIds: ['6e_ordre-grandeur-estimation_P1'] },
    prompt: <>Une salle vend <strong className="font-mono">197 billets</strong> à <strong className="font-mono">15 €</strong>. La caisse annonce un total de <strong className="font-mono">2 955 €</strong>.</>,
    render: ({ solved, onSolved }) => {
      const [est, setEst] = useState('');
      const [estOk, setEstOk] = useState(false);
      const [pick, setPick] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const correct = 0;

      const checkEst = () => {
        const n = parseFr(est);
        if (!Number.isNaN(n) && n >= 2700 && n <= 3300) setEstOk(true);
      };

      return (
        <div className="space-y-4">
          {!estOk ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-700">Estime d'abord le total, avant de juger l'annonce de la caisse.</p>
              <div className="flex items-center gap-2 justify-center">
                <NumberField value={est} onChange={setEst} onEnter={checkEst} ariaLabel="Estimation" placeholder="≈ ?" width="w-32" />
                <ValidateButton onClick={checkEst} disabled={!est} tone="amber">Valider</ValidateButton>
              </div>
              <p className="text-xs text-center text-slate-400">Indice : 197 ≈ 200, et 200 × 15 = 3 000.</p>
            </div>
          ) : (
            <>
              <Feedback tone="ok">Bonne estimation : ≈ 3 000 €.</Feedback>
              <p className="text-sm font-semibold text-slate-700">La caisse annonce 2 955 €. Est-ce cohérent avec ton estimation ?</p>
              <ChoiceGrid
                options={['Oui : 2 955 € est très proche de 3 000 €, le résultat est plausible', 'Non : il faut refaire tout le calcul']}
                selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={1}
              />
              {!revealed && (
                <div className="text-center">
                  <ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved(); }} disabled={pick === null} tone="amber">Valider</ValidateButton>
                </div>
              )}
              {revealed && <Feedback tone={pick === correct ? 'ok' : 'ko'}>197 × 15 = 2 955 exactement : cohérent avec l'estimation de 3 000 €.</Feedback>}
            </>
          )}
        </div>
      );
    },
  },
];

function Epreuve({ epreuve, index, solved, onSolved }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-2xl p-5 space-y-3 ${solved ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="font-space font-bold text-slate-800">{epreuve.title}</h3>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 text-white">{index + 1} / {EPREUVES.length}</span>
      </div>
      {epreuve.prompt && <p className="text-sm text-slate-700">{epreuve.prompt}</p>}
      {epreuve.render({ solved, onSolved })}
    </motion.div>
  );
}

/* ═══ PROFIL ═══════════════════════════════════════════════════════ */
const SKILLS = {
  arrondir: { label: 'Arrondir', module: 3 },
  somme: { label: "Ordre de grandeur d'une somme", module: 4 },
  difference: { label: "Ordre de grandeur d'une différence", module: 5 },
  produit: { label: "Ordre de grandeur d'un produit", module: 6 },
  detective: { label: 'Détecter une erreur', module: 7 },
  precision: { label: 'Choisir la précision', module: 9 },
  problemes: { label: 'Problèmes', module: 8 },
};

function ProfilMaitrise({ misses }) {
  const META = { ok: { dot: '🟢', label: 'Maîtrisé', tone: 'border-emerald-200 bg-emerald-50' }, mid: { dot: '🟡', label: 'À renforcer', tone: 'border-amber-200 bg-amber-50' } };
  return (
    <div className="space-y-3">
      {Object.entries(SKILLS).map(([key, skill]) => {
        const m = misses[key] ?? 0;
        const lvl = m === 0 ? 'ok' : 'mid';
        const meta = META[lvl];
        const target = LESSON_CONFIG.modules.find((mm) => mm.number === skill.module);
        return (
          <div key={key} className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 flex-wrap ${meta.tone}`}>
            <div className="flex items-center gap-3">
              <span className="text-lg" aria-hidden="true">{meta.dot}</span>
              <div>
                <div className="font-space font-bold text-slate-800 text-sm">{skill.label}</div>
                <div className="text-xs text-slate-600">{meta.label}</div>
              </div>
            </div>
            {lvl !== 'ok' && target && (
              <Link to={target.path} className="text-xs font-mono font-bold px-3 py-2 rounded-lg bg-white border-2 border-slate-300 text-slate-700 hover:border-slate-500 transition-colors">
                Revoir le module {skill.module} <ArrowRight className="inline w-3 h-3" aria-hidden="true" />
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══ SYNTHÈSE ═════════════════════════════════════════════════════ */
function Synthese() {
  const STEPS = [
    { label: 'Nombre compliqué', v: '198 + 302' },
    { label: 'Je simplifie', v: '198 → 200, 302 → 300' },
    { label: "J'estime", v: '200 + 300 ≈ 500' },
    { label: 'Je calcule', v: '198 + 302 = 500' },
    { label: 'Je contrôle', v: '500 est cohérent avec 500 ✓' },
  ];
  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le réflexe à automatiser</div>
        <div className="text-2xl sm:text-3xl font-space font-extrabold">ESTIMER → CALCULER → VÉRIFIER</div>
      </div>

      <div className="space-y-2">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-xl px-4 py-3">
            <span className="w-7 h-7 rounded-full bg-slate-800 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">{i + 1}</span>
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">{s.label}</div>
              <div className="font-mono font-bold text-slate-800">{s.v}</div>
            </div>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        Une estimation n'est jamais une preuve d'exactitude — c'est un CONTRÔLE. Elle permet de repérer les
        erreurs grossières avant même de vérifier le détail du calcul.
      </Feedback>
    </div>
  );
}

/* ═══ FLASH RETOUR ══════════════════════════════════════════════════ */
const FLASH = [
  { q: 'Estime 198 + 301.', options: ['≈ 500', '≈ 50', '≈ 5 000'], correct: 0, explain: '200 + 300 = 500.' },
  { q: 'Estime 49 × 20.', options: ['≈ 100', '≈ 1 000', '≈ 10 000'], correct: 1, explain: '50 × 20 = 1 000.' },
  { q: 'Est-il plausible que 399 + 402 = 2 000 ?', options: ['Oui', 'Non : on attend environ 800'], correct: 1, explain: '400 + 400 = 800, très loin de 2 000.' },
  { q: 'Pour 48 × 9, le résultat est plus proche de…', options: ['50', '500'], correct: 1, explain: '50 × 9 ≈ 450, donc plus proche de 500 que de 50.' },
  { q: "Pourquoi estimer APRÈS avoir calculé exactement ?", options: ['Pour vérifier que le résultat est cohérent, et repérer une erreur éventuelle', "Ça ne sert à rien après le calcul"], correct: 0, explain: "L'estimation contrôle le résultat exact : si les deux sont très différents, il y a sûrement une erreur." },
];

function FlashRetour({ onDone, score, setScore }) {
  const [idx, setIdx] = useState(0);
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const q = FLASH[idx];

  const next = () => {
    if (idx < FLASH.length - 1) { setIdx((i) => i + 1); setPick(null); setRevealed(false); }
    else { setFinished(true); onDone(); }
  };

  if (finished) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-5xl" aria-hidden="true">{score === 5 ? '🏆' : score >= 4 ? '🥈' : '📚'}</div>
        <div className="text-2xl font-space font-extrabold text-slate-800">{score} / {FLASH.length}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Question {idx + 1} / {FLASH.length}</span>
        <span className="text-emerald-600 font-bold">{score} ✓</span>
      </div>
      <div className="bg-slate-800 text-white rounded-xl p-5 text-sm font-semibold leading-relaxed">{q.q}</div>
      <ChoiceGrid options={q.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={q.correct} cols={q.options.length === 3 ? 3 : 1} />
      {!revealed && (
        <ValidateButton onClick={() => { setRevealed(true); if (pick === q.correct) setScore((s) => s + 1); }} disabled={pick === null} tone="slate">Valider</ValidateButton>
      )}
      {revealed && (
        <>
          <Feedback tone={pick === q.correct ? 'ok' : 'ko'}>{q.explain}</Feedback>
          <button type="button" onClick={next} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm min-h-[48px]">
            {idx < FLASH.length - 1 ? 'Question suivante →' : 'Voir mon score →'}
          </button>
        </>
      )}
    </div>
  );
}

/* ═══ BADGES ═══════════════════════════════════════════════════════ */
const BADGES = [
  { id: 'lynx', emoji: '🏅', label: 'Œil de lynx', test: (s) => (s.detective ?? 0) === 0 },
  { id: 'malin', emoji: '🏅', label: 'Estimateur malin', test: (s) => (s.somme ?? 0) === 0 && (s.difference ?? 0) === 0 },
  { id: 'detective', emoji: '🏅', label: 'Détective des erreurs', test: (s) => (s.detective ?? 0) === 0 },
  { id: 'grandeur', emoji: '🏅', label: "Maître de l'ordre de grandeur", test: (s) => (s.produit ?? 0) === 0 },
];

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
const PHASES = [
  { key: 'boss', label: 'Boss final', Icon: Trophy },
  { key: 'profil', label: 'Mon profil', Icon: Target },
  { key: 'synthese', label: 'Synthèse', Icon: BookMarked },
  { key: 'flash', label: 'Flash retour', Icon: Zap },
];

export default function Module10BossFinal() {
  const navLinks = getNavLinks(10);
  const { xp, awardXP } = useProgress(MODULE_CTX.lessonId);

  const [phase, setPhase] = useState('boss');
  const [done, setDone] = useState([]);
  const [misses, setMisses] = useState({});
  const [flashScore, setFlashScore] = useState(0);
  const [flashDone, setFlashDone] = useState(false);

  const bossDone = done.length === EPREUVES.length;
  const allDone = bossDone && flashDone;

  const solveEpreuve = (ep) => {
    if (done.includes(ep.id)) return;
    setDone((d) => (d.includes(ep.id) ? d : [...d, ep.id]));
    awardXP({ moduleId: '10', exerciseId: ep.id, amount: 20 });
  };

  const badgesGagnes = BADGES.filter((b) => b.test(misses));
  const masterBadge = allDone && badgesGagnes.length === BADGES.length && flashScore === FLASH.length;

  const phaseUnlocked = (key) => (key === 'boss' ? true : bossDone);

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 Détective des résultats"
      moduleSubtitle="Boss final, profil de maîtrise, synthèse et flash retour."
      moduleNumber={10}
      estimatedTime="18 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PHASES.map(({ key, label, Icon }) => {
            const unlocked = phaseUnlocked(key);
            return (
              <button key={key} type="button" disabled={!unlocked} onClick={() => setPhase(key)}
                className={`px-3 py-2.5 rounded-xl font-mono text-xs font-bold transition-all min-h-[48px] flex items-center justify-center gap-1.5 ${
                  phase === key ? 'bg-slate-900 text-white' : unlocked ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                }`}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {phase === 'boss' && (
            <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <MissionBrief tag="🏆 Boss final" title="Mission : détective des résultats." tone="amber">
                <p>Sept épreuves. Personne ne te dira quelle compétence utiliser à chaque fois.</p>
              </MissionBrief>

              <div className="flex items-center gap-2 flex-wrap">
                {EPREUVES.map((e, i) => (
                  <span key={e.id} className={`w-8 h-8 rounded-lg font-mono text-xs font-bold flex items-center justify-center ${done.includes(e.id) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    {done.includes(e.id) ? '✓' : i + 1}
                  </span>
                ))}
              </div>

              {EPREUVES.map((ep, i) =>
                i === 0 || done.includes(EPREUVES[i - 1].id) ? (
                  <Epreuve key={ep.id} epreuve={ep} index={i} solved={done.includes(ep.id)} onSolved={() => solveEpreuve(ep)} />
                ) : null
              )}

              {bossDone && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-6 text-center space-y-3">
                  <div className="text-5xl" aria-hidden="true">🏆</div>
                  <div className="text-2xl font-space font-extrabold">Mission accomplie !</div>
                  <button type="button" onClick={() => setPhase('profil')} className="px-5 py-2.5 rounded-xl bg-white text-amber-700 font-mono text-xs font-bold min-h-[44px]">
                    Voir mon profil <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === 'profil' && (
            <motion.div key="profil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-space font-extrabold text-slate-900">Ton profil de maîtrise</h2>
                <p className="text-sm text-slate-500">Ce que tu maîtrises, et ce qui mérite un second passage.</p>
              </div>
              <ProfilMaitrise misses={misses} />
              {badgesGagnes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {badgesGagnes.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-3">
                      <span className="text-xl" aria-hidden="true">{b.emoji}</span>
                      <span className="text-sm font-bold text-amber-900">{b.label}</span>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => setPhase('synthese')} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl min-h-[48px]">
                Passer à la synthèse →
              </button>
            </motion.div>
          )}

          {phase === 'synthese' && (
            <motion.div key="synthese" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <Synthese />
              <button type="button" onClick={() => setPhase('flash')} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl min-h-[48px]">
                Je passe au Flash retour →
              </button>
            </motion.div>
          )}

          {phase === 'flash' && (
            <motion.div key="flash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 space-y-4">
                <h2 className="text-lg font-space font-bold text-slate-800">⚡ Flash retour — 5 questions</h2>
                <FlashRetour score={flashScore} setScore={setFlashScore} onDone={() => { setFlashDone(true); awardXP({ moduleId: '10', exerciseId: 'flash', amount: 30 }); }} />
              </div>

              {flashDone && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-8 text-center space-y-3">
                  <div className="text-5xl" aria-hidden="true">{masterBadge ? '🏆' : '🎓'}</div>
                  <div className="text-2xl font-space font-extrabold">{masterBadge ? 'Contrôleur de résultats !' : 'Leçon terminée !'}</div>
                  <p className="text-indigo-100 text-sm leading-relaxed max-w-lg mx-auto">
                    Tu as maintenant le réflexe : estimer avant de calculer, et contrôler après. C'est ce qui te
                    permettra de repérer tes propres erreurs, dans toutes les leçons à venir.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {['Estimer', 'Arrondir', 'Détecter', 'Contrôler'].map((v) => (
                      <div key={v} className="bg-white/15 rounded-xl py-2 text-sm font-bold">✓ {v}</div>
                    ))}
                  </div>
                  {masterBadge && (
                    <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-2">
                      🏆 Badge « Contrôleur de résultats » débloqué
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModuleLayout>
  );
}
