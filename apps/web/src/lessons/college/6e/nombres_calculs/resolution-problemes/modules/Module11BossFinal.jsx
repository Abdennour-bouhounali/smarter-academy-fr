import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Target, BookMarked, Zap, ArrowRight, Bus } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import InfoSorter from '../../../../../common/components/InfoSorter';
import AnswerBuilder from '../../../../../common/components/AnswerBuilder';
import CalcChain from '../../../../../common/components/CalcChain';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import { parseFr, parseDec } from '@smarter-academy/core';

/* ═══ PHASE 1 — LA GRANDE MISSION ══════════════════════════════════ */
const STAGE_INFO = [
  { text: '6 classes participent à la sortie.', useful: true },
  { text: 'Chaque classe compte 24 élèves.', useful: true },
  { text: "Un billet d'entrée coûte 4,50 €.", useful: true },
  { text: 'Chaque bus accueille 50 personnes.', useful: false },
  { text: 'Le trajet dure 45 minutes.', useful: false },
];

function BossMission({ misses, bumpMiss, onAllDone }) {
  const [stage, setStage] = useState(0);

  // Stage 1 — extraire
  const [sortDone, setSortDone] = useState(false);
  // Stage 2 — total élèves
  const [eleves, setEleves] = useState('');
  const [elevesFb, setElevesFb] = useState(null);
  const [elevesOk, setElevesOk] = useState(false);
  // Stage 3 — coût billets (décimal)
  const [cout, setCout] = useState('');
  const [coutFb, setCoutFb] = useState(null);
  const [coutOk, setCoutOk] = useState(false);
  // Stage 4 — fraction
  const [photo, setPhoto] = useState('');
  const [photoFb, setPhotoFb] = useState(null);
  const [photoOk, setPhotoOk] = useState(false);
  // Stage 5 — estimation + coût option
  const [estOption, setEstOption] = useState('');
  const [estOptionOk, setEstOptionOk] = useState(false);
  const [coutOption, setCoutOption] = useState('');
  const [coutOptionFb, setCoutOptionFb] = useState(null);
  const [coutOptionOk, setCoutOptionOk] = useState(false);
  // Stage 6 — bus
  const [bus, setBus] = useState('');
  const [busFb, setBusFb] = useState(null);
  const [busOk, setBusOk] = useState(false);
  // Stage 7 — réponse finale
  const [finalOk, setFinalOk] = useState(false);

  const advance = () => setStage((s) => s + 1);

  return (
    <div className="space-y-6">
      <MissionBrief tag="🏆 La Grande Mission" title="Organiser la sortie scolaire de fin d'année." tone="amber">
        <p>Toutes les compétences de la leçon, dans une seule histoire continue. Personne ne te dira quel calcul faire à chaque étape.</p>
      </MissionBrief>

      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} className={`w-7 h-7 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center ${i < stage ? 'bg-emerald-500 text-white' : i === stage ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-400'}`}>
            {i < stage ? '✓' : i + 1}
          </span>
        ))}
      </div>

      {/* STAGE 1 — extraire */}
      {stage >= 0 && (
        <div className={`border-2 rounded-2xl p-5 space-y-3 ${stage > 0 ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
          <h3 className="font-space font-bold text-slate-800">Étape 1 — Extraire les informations utiles</h3>
          <p className="text-sm text-slate-700">Question : quel est le coût total des billets d'entrée pour tous les élèves ?</p>
          <InfoSorter items={STAGE_INFO} solved={stage > 0} onSolved={() => { setSortDone(true); }} />
          {sortDone && stage === 0 && (
            <div className="text-center">
              <ValidateButton onClick={advance} tone="amber">Continuer <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" /></ValidateButton>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2 — total élèves */}
      {stage >= 1 && (
        <div className={`border-2 rounded-2xl p-5 space-y-3 ${stage > 1 ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
          <h3 className="font-space font-bold text-slate-800">Étape 2 — Combien d'élèves en tout ?</h3>
          {elevesOk ? (
            <Feedback tone="ok">6 × 24 = 144 élèves.</Feedback>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <NumberField value={eleves} onChange={(v) => { setEleves(v); setElevesFb(null); }} ariaLabel="Nombre d'élèves" placeholder="?" width="w-28" />
              <ValidateButton onClick={() => { if (parseFr(eleves) === 144) setElevesOk(true); else { setElevesFb('6 classes de 24 élèves : 6 × 24.'); bumpMiss('modeliser'); } }} disabled={!eleves} tone="amber">OK</ValidateButton>
            </div>
          )}
          {elevesFb && <Feedback tone="hint">{elevesFb}</Feedback>}
          {elevesOk && stage === 1 && (
            <div className="text-center">
              <ValidateButton onClick={advance} tone="amber">Continuer <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" /></ValidateButton>
            </div>
          )}
        </div>
      )}

      {/* STAGE 3 — coût billets (décimal) */}
      {stage >= 2 && (
        <div className={`border-2 rounded-2xl p-5 space-y-3 ${stage > 2 ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
          <h3 className="font-space font-bold text-slate-800">Étape 3 — Le coût total des billets</h3>
          <p className="text-sm text-slate-700">144 élèves, billet à 4,50 € chacun. Coût total ?</p>
          {coutOk ? (
            <Feedback tone="ok">144 × 4,50 = 648 €.</Feedback>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <NumberField value={cout} onChange={(v) => { setCout(v); setCoutFb(null); }} ariaLabel="Coût des billets" placeholder="?" width="w-32" />
              <span className="text-sm font-mono text-slate-500">€</span>
              <ValidateButton onClick={() => { const n = parseDec(cout); if (n === 648) setCoutOk(true); else { setCoutFb('144 × 4,50 : pense à 144 × 4 puis 144 × 0,50.'); bumpMiss('uneEtape'); } }} disabled={!cout} tone="amber">OK</ValidateButton>
            </div>
          )}
          {coutFb && <Feedback tone="hint">{coutFb}</Feedback>}
          {coutOk && stage === 2 && (
            <div className="text-center">
              <ValidateButton onClick={advance} tone="amber">Continuer <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" /></ValidateButton>
            </div>
          )}
        </div>
      )}

      {/* STAGE 4 — fraction */}
      {stage >= 3 && (
        <div className={`border-2 rounded-2xl p-5 space-y-3 ${stage > 3 ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
          <h3 className="font-space font-bold text-slate-800">Étape 4 — L'option atelier photo</h3>
          <p className="text-sm text-slate-700">1/4 des 144 élèves choisissent l'option photo. Combien d'élèves cela représente-t-il ?</p>
          {photoOk ? (
            <Feedback tone="ok">144 ÷ 4 = 36 élèves.</Feedback>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <NumberField value={photo} onChange={(v) => { setPhoto(v); setPhotoFb(null); }} ariaLabel="Élèves option photo" placeholder="?" width="w-28" />
              <ValidateButton onClick={() => { if (parseFr(photo) === 36) setPhotoOk(true); else { setPhotoFb('1/4 de 144, c\'est 144 partagé en 4 parts égales.'); bumpMiss('modeliser'); } }} disabled={!photo} tone="amber">OK</ValidateButton>
            </div>
          )}
          {photoFb && <Feedback tone="hint">{photoFb}</Feedback>}
          {photoOk && stage === 3 && (
            <div className="text-center">
              <ValidateButton onClick={advance} tone="amber">Continuer <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" /></ValidateButton>
            </div>
          )}
        </div>
      )}

      {/* STAGE 5 — estimer puis calculer l'option */}
      {stage >= 4 && (
        <div className={`border-2 rounded-2xl p-5 space-y-3 ${stage > 4 ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
          <h3 className="font-space font-bold text-slate-800">Étape 5 — Estimer, puis calculer</h3>
          <p className="text-sm text-slate-700">L'option photo coûte 2 € par élève, pour 36 élèves. Avant de calculer, estime le coût.</p>
          {!estOptionOk ? (
            <div className="flex items-center gap-2 justify-center">
              <NumberField value={estOption} onChange={setEstOption} ariaLabel="Estimation" placeholder="≈ ?" width="w-28" />
              <ValidateButton onClick={() => { const n = parseFr(estOption); if (!Number.isNaN(n) && n >= 60 && n <= 85) setEstOptionOk(true); }} disabled={!estOption} tone="amber">Valider</ValidateButton>
            </div>
          ) : !coutOptionOk ? (
            <div className="space-y-2">
              <Feedback tone="ok">Bonne estimation (≈ 70 €).</Feedback>
              <p className="text-sm text-slate-700">Calcule maintenant le coût exact de l'option photo.</p>
              <div className="flex items-center gap-2 justify-center">
                <NumberField value={coutOption} onChange={(v) => { setCoutOption(v); setCoutOptionFb(null); }} ariaLabel="Coût option photo" placeholder="?" width="w-28" />
                <span className="text-sm font-mono text-slate-500">€</span>
                <ValidateButton onClick={() => { if (parseFr(coutOption) === 72) setCoutOptionOk(true); else { setCoutOptionFb('36 élèves × 2 €.'); bumpMiss('estimerVerifier'); } }} disabled={!coutOption} tone="amber">OK</ValidateButton>
              </div>
              {coutOptionFb && <Feedback tone="hint">{coutOptionFb}</Feedback>}
            </div>
          ) : (
            <>
              <Feedback tone="ok">36 × 2 = 72 €, cohérent avec l'estimation de 70 €.</Feedback>
              <CalcChain steps={[
                { label: 'Billets', expr: '144 × 4,50 €', value: '648 €' },
                { label: 'Option photo', expr: '36 × 2 €', value: '72 €' },
                { label: 'Budget total', expr: '648 + 72', value: '720 €', tone: 'emerald' },
              ]} />
            </>
          )}
          {coutOptionOk && stage === 4 && (
            <div className="text-center">
              <ValidateButton onClick={advance} tone="amber">Continuer <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" /></ValidateButton>
            </div>
          )}
        </div>
      )}

      {/* STAGE 6 — bus (l'info devient utile !) */}
      {stage >= 5 && (
        <div className={`border-2 rounded-2xl p-5 space-y-3 ${stage > 5 ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
          <h3 className="font-space font-bold text-slate-800 flex items-center gap-2"><Bus className="w-4 h-4" aria-hidden="true" /> Étape 6 — Le transport</h3>
          <p className="text-sm text-slate-700">
            Souviens-toi : chaque bus accueille 50 personnes (l'information écartée à l'étape 1 !). Combien de bus faut-il pour 144 élèves ?
          </p>
          {busOk ? (
            <Feedback tone="ok">144 ÷ 50 = 2 reste 44 : il faut 3 bus, même si le dernier n'est pas rempli.</Feedback>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <NumberField value={bus} onChange={(v) => { setBus(v); setBusFb(null); }} ariaLabel="Nombre de bus" placeholder="?" width="w-24" />
              <span className="text-sm font-mono text-slate-500">bus</span>
              <ValidateButton onClick={() => { if (parseFr(bus) === 3) setBusOk(true); else { setBusFb('2 bus ne suffisent que pour 100 personnes. Il en faut un de plus.'); bumpMiss('extraire'); } }} disabled={!bus} tone="amber">OK</ValidateButton>
            </div>
          )}
          {busFb && <Feedback tone="hint">{busFb}</Feedback>}
          {busOk && stage === 5 && (
            <div className="space-y-2">
              <Feedback tone="info">
                L'information sur les bus, écartée à l'étape 1, est redevenue utile ici : une information n'est
                « inutile » que pour UNE question précise, pas pour toujours.
              </Feedback>
              <div className="text-center">
                <ValidateButton onClick={advance} tone="amber">Continuer <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" /></ValidateButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 7 — réponse finale */}
      {stage >= 6 && (
        <div className={`border-2 rounded-2xl p-5 space-y-3 ${finalOk ? 'border-emerald-300 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/20'}`}>
          <h3 className="font-space font-bold text-slate-800">Étape 7 — Communique le budget total</h3>
          <AnswerBuilder
            value={720}
            unitOptions={['€', 'élèves', 'bus']}
            correctUnit="€"
            sentenceOptions={['720', 'Le budget total de la sortie est de 720 €.', 'Il y a 720 élèves.']}
            correctSentenceIndex={1}
            solved={finalOk}
            onSolved={() => { setFinalOk(true); onAllDone(); }}
            hint="Le budget total, c'est billets + option photo."
          />
        </div>
      )}
    </div>
  );
}

/* ═══ PROFIL ═══════════════════════════════════════════════════════ */
const SKILLS = {
  comprendre: { label: 'Comprendre la situation', module: 2 },
  extraire: { label: 'Extraire les informations', module: 3 },
  modeliser: { label: 'Modéliser', module: 4 },
  strategie: { label: 'Choisir une stratégie', module: 5 },
  uneEtape: { label: 'Problèmes à une étape', module: 6 },
  plusieursEtapes: { label: 'Problèmes à plusieurs étapes', module: 7 },
  estimerVerifier: { label: 'Estimer et vérifier', module: 8 },
  communiquer: { label: 'Communiquer une réponse', module: 9 },
  detective: { label: 'Détective des erreurs', module: 10 },
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

/* ═══ SYNTHÈSE ══════════════════════════════════════════════════════ */
function Synthese() {
  const STEPS = [
    'JE COMPRENDS', 'JE REPÈRE LES DONNÉES', 'JE MODÉLISE', 'JE CHOISIS UNE STRATÉGIE',
    'JE CALCULE', "J'ESTIME", 'JE VÉRIFIE', 'JE COMMUNIQUE',
  ];
  const [open, setOpen] = useState(null);
  const EXAMPLES = {
    'JE COMPRENDS': "Qu'est-ce qui se passe dans cette situation ? (pas encore de calcul)",
    'JE REPÈRE LES DONNÉES': 'Quelles informations sont utiles ? Lesquelles sont inutiles ?',
    'JE MODÉLISE': 'Groupes, schéma en barres, tableau, droite graduée…',
    'JE CHOISIS UNE STRATÉGIE': 'Calcul direct, dessin, manipulation — plusieurs chemins valables.',
    'JE CALCULE': 'Chaque résultat intermédiaire doit être nommé.',
    "J'ESTIME": 'À peu près combien devrait-on trouver ?',
    'JE VÉRIFIE': 'Le résultat exact est-il cohérent avec l\'estimation ?',
    'JE COMMUNIQUE': 'Résultat + unité + phrase qui répond à la question.',
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">La méthode Smarter Academy</div>
        <div className="text-xl sm:text-2xl font-space font-extrabold">PROBLÈME → JE MAÎTRISE</div>
        <p className="text-xs text-slate-400">Touche une étape pour voir un exemple.</p>
      </div>

      <div className="space-y-1.5">
        {STEPS.map((s) => (
          <div key={s}>
            <button
              type="button"
              onClick={() => setOpen(open === s ? null : s)}
              className="w-full text-left px-4 py-3 rounded-xl border-2 border-slate-200 bg-white hover:border-indigo-400 font-mono font-bold text-sm text-slate-800 transition-all min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {s}
            </button>
            <AnimatePresence>
              {open === s && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 py-2 text-xs text-slate-500 italic">
                  {EXAMPLES[s]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <Feedback tone="info">
        Le point de départ n'est jamais « quelle opération ? ». C'est toujours « qu'est-ce qui se passe dans
        cette situation ? ».
      </Feedback>
    </div>
  );
}

/* ═══ FLASH RETOUR ══════════════════════════════════════════════════ */
const FLASH = [
  { q: '« Il reste 12 places. » Cette phrase implique-t-elle forcément une soustraction ?', options: ['Oui, toujours', 'Non : il faut comprendre toute la situation pour le savoir'], correct: 1, explain: 'Aucun mot isolé ne détermine une opération : c\'est la situation complète qui compte.' },
  { q: '« Une classe possède plusieurs boîtes de crayons. Combien en a-t-elle ? » Que répondre ?', options: ['Inventer un nombre plausible', 'Il manque une information'], correct: 1, explain: 'Sans le nombre de boîtes et de crayons par boîte, aucun calcul n\'est possible.' },
  { q: 'Un élève écrit seulement « 157 » comme réponse finale. Est-ce suffisant ?', options: ['Oui', 'Non : il faut le résultat, l\'unité, et une phrase'], correct: 1, explain: 'Une réponse complète répond clairement à la question posée.' },
  { q: 'Léa dessine pour résoudre un problème, Nathan calcule directement. Qui a raison ?', options: ['Seulement Léa', 'Seulement Nathan', 'Les deux peuvent avoir raison'], correct: 2, explain: 'Plusieurs stratégies peuvent être valables pour un même problème.' },
  { q: 'Avant un calcul, à quoi sert une estimation ?', options: ['À remplacer le calcul exact', 'À prévoir un ordre de grandeur, puis à contrôler le résultat'], correct: 1, explain: 'Estimer prépare et contrôle, mais ne remplace jamais le calcul exact.' },
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
      <ChoiceGrid options={q.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={q.correct} cols={1} />
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
  { id: 'donnees', emoji: '🏅', label: 'Détective des données', test: (s) => (s.extraire ?? 0) === 0 },
  { id: 'modeles', emoji: '🏅', label: 'Constructeur de modèles', test: (s) => (s.modeliser ?? 0) === 0 },
  { id: 'strategie', emoji: '🏅', label: 'Stratège', test: (s) => (s.strategie ?? 0) === 0 },
  { id: 'verificateur', emoji: '🏅', label: 'Vérificateur', test: (s) => (s.estimerVerifier ?? 0) === 0 },
];

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
const PHASES = [
  { key: 'boss', label: 'La Grande Mission', Icon: Trophy },
  { key: 'profil', label: 'Mon profil', Icon: Target },
  { key: 'synthese', label: 'Synthèse', Icon: BookMarked },
  { key: 'flash', label: 'Flash retour', Icon: Zap },
];

export default function Module11BossFinal() {
  const navLinks = getNavLinks(11);
  const { xp, awardXP } = useProgress(MODULE_CTX.lessonId);

  const [phase, setPhase] = useState('boss');
  const [bossDone, setBossDone] = useState(false);
  const [misses, setMisses] = useState({});
  const [flashScore, setFlashScore] = useState(0);
  const [flashDone, setFlashDone] = useState(false);

  const allDone = bossDone && flashDone;

  const bumpMiss = (skill) => setMisses((m) => ({ ...m, [skill]: (m[skill] || 0) + 1 }));

  const onBossAllDone = () => {
    if (!bossDone) { setBossDone(true); awardXP({ moduleId: '11', exerciseId: 'boss', amount: 60 }); }
  };

  const badgesGagnes = BADGES.filter((b) => b.test(misses));
  const masterBadge = allDone && badgesGagnes.length === BADGES.length && flashScore === FLASH.length;
  const phaseUnlocked = (key) => (key === 'boss' ? true : bossDone);

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 La Grande Mission"
      moduleSubtitle="Boss final, profil de maîtrise, synthèse et flash retour."
      moduleNumber={11}
      estimatedTime="20 min"
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
                className={`px-3 py-2.5 rounded-xl font-mono text-[11px] font-bold transition-all min-h-[48px] flex items-center justify-center gap-1.5 ${
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
            <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BossMission misses={misses} bumpMiss={bumpMiss} onAllDone={onBossAllDone} />
              {bossDone && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl p-6 text-center space-y-3">
                  <div className="text-5xl" aria-hidden="true">🏆</div>
                  <div className="text-2xl font-space font-extrabold">Sortie organisée avec succès !</div>
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
                <FlashRetour score={flashScore} setScore={setFlashScore} onDone={() => { setFlashDone(true); awardXP({ moduleId: '11', exerciseId: 'flash', amount: 30 }); }} />
              </div>

              {flashDone && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-8 text-center space-y-3">
                  <div className="text-5xl" aria-hidden="true">{masterBadge ? '🏆' : '🎓'}</div>
                  <div className="text-2xl font-space font-extrabold">{masterBadge ? 'Problem Solver !' : 'Leçon terminée !'}</div>
                  <p className="text-indigo-100 text-sm leading-relaxed max-w-lg mx-auto">
                    Tu ne cherches plus une opération au hasard : tu comprends une situation, tu la modélises, tu
                    choisis une stratégie, tu calcules, tu estimes, tu vérifies, et tu communiques une réponse
                    claire.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {['Comprendre', 'Modéliser', 'Vérifier', 'Communiquer'].map((v) => (
                      <div key={v} className="bg-white/15 rounded-xl py-2 text-sm font-bold">✓ {v}</div>
                    ))}
                  </div>
                  {masterBadge && (
                    <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-2">
                      🏆 Badge « Problem Solver » débloqué
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
