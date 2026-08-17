import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Trophy, Target, BookMarked, Zap, ArrowRight, Gift, ClipboardList } from 'lucide-react';
import ModuleLayout from '../../../../../common/components/ModuleLayout';
import MathText from '../../../../../common/components/MathText';
import NumberLine from '../../../../../common/components/NumberLine';
import { useProgress } from '../../../../../common/hooks/useProgress';
import { Feedback, ChoiceGrid, ValidateButton, MissionBrief, NumberField } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { LESSON_CONFIG } from '../lesson.config';
import PartitionShape from '../components/PartitionShape';
import ObjectGroup from '../components/ObjectGroup';
import FractionBuilder from '../components/FractionBuilder';
import { texFrac, fracLineFormat } from '../components/fractionUtils';

/* ═══ PHASE 1 — PROBLÈMES ══════════════════════════════════════════ */
function Question({ item, solved, onSolved }) {
  const [pick, setPick] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [val, setVal] = useState('');
  const [fb, setFb] = useState(null);

  const checkInput = () => {
    const n = parseInt(val, 10);
    if (n === item.answer) {
      onSolved?.();
      setFb(null);
    } else {
      setFb(item.hint);
    }
  };

  return (
    <div className="space-y-3 border-t border-slate-100 pt-4 first:border-0 first:pt-0">
      <p className="text-sm font-semibold text-slate-800 leading-relaxed">
        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800 text-white font-mono text-[10px] font-bold mr-2 align-middle">
          {item.tag}
        </span>
        {item.q}
      </p>

      {item.type === 'mcq' ? (
        <>
          <ChoiceGrid
            options={item.options}
            selected={pick}
            onSelect={setPick}
            revealed={revealed || solved}
            correctIndex={item.correct}
            cols={item.cols || 2}
            renderOption={item.renderOption}
          />
          {!revealed && !solved && (
            <div className="text-center">
              <ValidateButton
                onClick={() => {
                  setRevealed(true);
                  if (pick === item.correct) onSolved?.();
                }}
                disabled={pick === null}
              >
                Valider
              </ValidateButton>
            </div>
          )}
          {revealed && (
            <Feedback tone={pick === item.correct ? 'ok' : 'ko'}>
              {item.explain}
              {pick !== item.correct && (
                <>
                  {' '}
                  <button type="button" onClick={() => { setRevealed(false); setPick(null); }} className="underline font-semibold">
                    Réessayer
                  </button>
                </>
              )}
            </Feedback>
          )}
        </>
      ) : solved ? (
        <Feedback tone="ok">
          <strong>{item.answer}</strong> {item.unit} — {item.explain}
        </Feedback>
      ) : (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={checkInput} ariaLabel={item.q} width="w-28" size="sm" />
            {item.unit && <span className="text-sm font-mono text-slate-500">{item.unit}</span>}
            <ValidateButton onClick={checkInput} disabled={!val}>OK</ValidateButton>
          </div>
          {fb && <Feedback tone="hint">{fb}</Feedback>}
        </>
      )}
    </div>
  );
}

const P1 = [
  { tag: 'ÉTAPE 1', type: 'mcq', cols: 3,
    q: 'Une tablette de 12 carrés est partagée équitablement entre 4 enfants. En combien de parts égales faut-il la couper ?',
    options: ['3', '4', '12'], correct: 1,
    explain: 'On partage entre 4 enfants : il faut 4 parts égales, une par enfant.' },
  { tag: 'ÉTAPE 2', type: 'mcq', cols: 3,
    q: 'Chaque enfant mange sa part, soit 1 part sur 4. Quelle fraction de la tablette a-t-il mangée ?',
    options: ['1/4', '4/1', '1/12'], correct: 0,
    renderOption: (o) => { const [n,d]=o.split('/'); return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>; },
    explain: 'Il a mangé 1 part sur les 4 parts égales : 1/4 de la tablette.' },
  { tag: 'ÉTAPE 3', type: 'input',
    q: 'La tablette a 12 carrés en tout. Combien de carrés un enfant mange-t-il ? (12 ÷ 4, puis × 1)',
    answer: 3, unit: 'carrés',
    hint: '12 carrés partagés en 4 parts égales : 12 ÷ 4 = 3 carrés par part.',
    explain: '12 ÷ 4 = 3 carrés par enfant.' },
];

const P2 = [
  { tag: 'ÉTAPE 1', type: 'mcq', cols: 1,
    q: "Léa a parcouru 3/4 de kilomètre. Sachant que 1 km = 1 000 m, quel est le TOUT que l'on partage ici ?",
    options: ['Les 1 000 mètres du kilomètre', 'Le nombre 3', 'Le nombre 4'], correct: 0,
    explain: "Le tout, c'est le kilomètre entier, soit 1 000 mètres. C'est lui qu'on partage en 4." },
  { tag: 'ÉTAPE 2', type: 'input',
    q: '1 000 m partagés en 4 parts égales : combien de mètres dans 1 part ? (1 000 ÷ 4)',
    answer: 250, unit: 'm',
    hint: '1 000 ÷ 4 = 250.',
    explain: '1 000 ÷ 4 = 250 m par quart.' },
  { tag: 'ÉTAPE 3', type: 'input',
    q: 'Léa a parcouru 3 de ces parts. Quelle distance a-t-elle parcourue, en mètres ?',
    answer: 750, unit: 'm',
    hint: '3 parts de 250 m : 250 × 3.',
    explain: '250 × 3 = 750 m. Et 750 m, ça correspond à 0,75 km — le lien avec les décimaux que tu as vu au module précédent !' },
];

const P3 = [
  { tag: 'ÉTAPE 1', type: 'mcq', cols: 1,
    q: '5 barres de céréales identiques sont partagées équitablement entre 4 amis. Quelle fraction de barre chacun reçoit-il ?',
    options: ['5/4', '4/5', '5/1'], correct: 0,
    renderOption: (o) => { const [n,d]=o.split('/'); return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>; },
    explain: '5 barres partagées entre 4 amis : chacun reçoit 5 ÷ 4 = 5/4 de barre.' },
  { tag: 'ÉTAPE 2', type: 'mcq', cols: 2,
    q: 'Chaque ami reçoit-il plus ou moins d\'une barre entière ?',
    options: ['Moins d\'une barre entière', 'Plus d\'une barre entière'], correct: 1,
    explain: '5/4 = 1 + 1/4 : chacun reçoit une barre entière ET un quart de barre en plus.' },
];

function ProblemesPhase({ onAllDone }) {
  const [p1, setP1] = useState([]);
  const [p2, setP2] = useState([]);
  const [p3, setP3] = useState([]);

  const s1 = p1.length === P1.length;
  const s2 = p2.length === P2.length;
  const s3 = p3.length === P3.length;
  const allDone = s1 && s2 && s3;

  React.useEffect(() => {
    if (allDone) onAllDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone]);

  const mark = (setter, list, i) => setter(list.includes(i) ? list : [...list, i]);

  return (
    <div className="space-y-6">
      <MissionBrief tag="🧠 Problèmes" title="Comprendre, représenter, interpréter — pas seulement calculer.">
        <p>Trois situations réelles, chacune guidée en plusieurs étapes.</p>
      </MissionBrief>

      {[
        { title: 'Problème 1 — La tablette de chocolat', items: P1, done: p1, setter: setP1, s: s1 },
        { title: 'Problème 2 — La distance parcourue', items: P2, done: p2, setter: setP2, s: s2, locked: !s1 },
        { title: 'Problème 3 — Les barres de céréales', items: P3, done: p3, setter: setP3, s: s3, locked: !s2 },
      ].map((prob) => (
        <div key={prob.title} className={`border-2 rounded-2xl p-5 space-y-3 ${prob.s ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'} ${prob.locked ? 'opacity-50' : ''}`}>
          <h3 className="font-space font-bold text-slate-800">{prob.title}</h3>
          {!prob.locked &&
            prob.items.map((item, i) =>
              i === 0 || prob.done.includes(i - 1) ? (
                <Question key={item.q} item={item} solved={prob.done.includes(i)} onSolved={() => mark(prob.setter, prob.done, i)} />
              ) : null
            )}
          {prob.locked && <p className="text-xs font-mono text-slate-400">Termine le problème précédent.</p>}
        </div>
      ))}
    </div>
  );
}

/* ═══ PHASE 2 — BOSS FINAL ═════════════════════════════════════════ */
const EPREUVES = [
  {
    id: 'e1', skill: 'construire', title: 'Épreuve 1',
    render: ({ solved, onSolved }) => {
      const [cells, setCells] = useState([]);
      const target = 3, den = 5;
      const ok = cells.length === target;
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Colorie <MathText>{`$${texFrac(target, den)}$`}</MathText> de ce trésor partagé en {den} parts.</p>
          <PartitionShape shape="bar" parts={den} cells={cells} onToggle={(i) => !solved && setCells((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i].sort((a,b)=>a-b)))} tone="amber" size="md" />
          {!solved && <div className="text-center"><ValidateButton onClick={() => ok && onSolved()} disabled={!ok} tone="amber">Valider</ValidateButton></div>}
          {solved && <Feedback tone="ok">3 parts sur 5, bien coloriées.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'e2', skill: 'lire', title: 'Épreuve 2',
    render: ({ solved, onSolved }) => {
      const [pick, setPick] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const correct = 1;
      return (
        <div className="space-y-3">
          <PartitionShape shape="circle" parts={6} shaded={5} tone="violet" size="sm" />
          <p className="text-sm font-semibold text-slate-700">Quelle fraction ce disque représente-t-il ?</p>
          <ChoiceGrid options={['1/6', '5/6', '6/5']} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={3}
            renderOption={(o) => { const [n,d]=o.split('/'); return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>; }} />
          {!revealed && <div className="text-center"><ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved(); }} disabled={pick === null} tone="amber">Valider</ValidateButton></div>}
          {revealed && <Feedback tone={pick === correct ? 'ok' : 'ko'}>5 parts coloriées sur 6 : 5/6.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'e3', skill: 'vocabulaire', title: 'Épreuve 3',
    render: ({ solved, onSolved }) => {
      const [pick, setPick] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const correct = 1;
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Dans <MathText>{'$\\frac{2}{7}$'}</MathText>, que représente le 7 ?
          </p>
          <ChoiceGrid options={['Les parts prises', "Le nombre total de parts égales", 'Un résultat de calcul']} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={1} />
          {!revealed && <div className="text-center"><ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved(); }} disabled={pick === null} tone="amber">Valider</ValidateButton></div>}
          {revealed && <Feedback tone={pick === correct ? 'ok' : 'ko'}>Le 7 est le dénominateur : le nombre total de parts égales.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'e4', skill: 'quantite', title: 'Épreuve 4',
    render: ({ solved, onSolved }) => {
      const [sel, setSel] = useState([]);
      const ok = sel.length === 2;
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Sélectionne <MathText>{'$\\frac{2}{3}$'}</MathText> de ces 15 pièces d'or.</p>
          <ObjectGroup total={15} groups={3} selectedSet={sel} onToggleGroup={(g) => !solved && setSel((p) => (p.includes(g) ? p.filter((x) => x !== g) : p.length < 2 ? [...p, g].sort() : p))} emoji="🪙" tone="amber" />
          {!solved && <div className="text-center"><ValidateButton onClick={() => ok && onSolved()} disabled={!ok} tone="amber">Valider</ValidateButton></div>}
          {solved && <Feedback tone="ok">15 ÷ 3 = 5, puis 5 × 2 = 10 pièces.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'e5', skill: 'quotient', title: 'Épreuve 5',
    render: ({ solved, onSolved }) => {
      const [pick, setPick] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const correct = 0;
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">3 gâteaux identiques sont partagés entre 5 personnes. Quelle part reçoit chacune ?</p>
          <ChoiceGrid options={['3/5', '5/3', '3 × 5']} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={3}
            renderOption={(o) => (o.includes('/') ? (() => { const [n,d]=o.split('/'); return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>; })() : o)} />
          {!revealed && <div className="text-center"><ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved(); }} disabled={pick === null} tone="amber">Valider</ValidateButton></div>}
          {revealed && <Feedback tone={pick === correct ? 'ok' : 'ko'}>3 ÷ 5 = 3/5 : chacun reçoit 3/5 de gâteau.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'e6', skill: 'droite', title: 'Épreuve 6',
    render: ({ solved, onSolved }) => {
      const [pos, setPos] = useState(0);
      const [checked, setChecked] = useState(false);
      const target = 0.6;
      const ok = Math.round(pos * 5) === Math.round(target * 5);
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">Place <MathText>{'$\\frac{3}{5}$'}</MathText> sur la demi-droite.</p>
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-2">
            <NumberLine min={0} max={1} step={0.2} labelEvery={1} height={180} mode="place" value={pos}
              onChange={(v) => { if (!solved) { setPos(v); setChecked(false); } }} snap={0.2} format={fracLineFormat(5)}
              revealValue={solved || checked} disabled={solved}
              ghost={solved || (checked && !ok) ? { value: target, label: '3/5' } : null}
              ariaLabel="Place 3/5 entre 0 et 1" edgesOnly />
          </div>
          {!solved && <div className="text-center"><ValidateButton onClick={() => { setChecked(true); if (ok) onSolved(); }} tone="amber">Valider</ValidateButton></div>}
          {checked && <Feedback tone={ok ? 'ok' : 'ko'}>3/5 est à 3 graduations de 0, sur un partage en 5.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'e7', skill: 'equivalence', title: 'Épreuve 7',
    render: ({ solved, onSolved }) => {
      const [pick, setPick] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const correct = 1;
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <PartitionShape shape="bar" parts={2} shaded={1} tone="sky" size="sm" />
            <PartitionShape shape="bar" parts={6} shaded={3} tone="sky" size="sm" />
          </div>
          <p className="text-sm text-slate-700">Ces deux figures représentent-elles la même quantité ?</p>
          <ChoiceGrid options={['Non, 1/2 ≠ 3/6', 'Oui : 1/2 = 3/6, même surface coloriée']} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={correct} cols={1} />
          {!revealed && <div className="text-center"><ValidateButton onClick={() => { setRevealed(true); if (pick === correct) onSolved(); }} disabled={pick === null} tone="amber">Valider</ValidateButton></div>}
          {revealed && <Feedback tone={pick === correct ? 'ok' : 'ko'}>La moitié d'une barre coupée en 6 parts égales occupe 3 parts : 1/2 = 3/6.</Feedback>}
        </div>
      );
    },
  },
  {
    id: 'e8', skill: 'decimales', title: 'Épreuve 8',
    render: ({ solved, onSolved }) => {
      const [num, setNum] = useState('');
      const [den, setDen] = useState(null);
      const [checked, setChecked] = useState(false);
      const isRight = parseInt(num, 10) === 75 && den === 100;
      return (
        <div className="space-y-4">
          {/* Ancre visuelle */}
          <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3">
            <span className="text-2xl font-black font-mono text-slate-800">0,75</span>
            <span className="text-slate-400">=</span>
            <span className="text-sm text-slate-600">75 <strong>centièmes</strong> → dénominateur = <strong>100</strong></span>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Numérateur — champ texte direct */}
            <div className="text-center space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Numérateur</div>
              <input
                type="number"
                min={0}
                max={100}
                value={num}
                disabled={solved}
                onChange={(e) => { setNum(e.target.value); setChecked(false); }}
                aria-label="Numérateur"
                className="w-20 text-center font-mono font-extrabold text-2xl tabular-nums border-2 border-slate-200 rounded-xl px-2 py-2 focus:outline-none focus:border-blue-400 disabled:opacity-40"
              />
            </div>

            <div className="h-0.5 w-12 bg-slate-800 rounded-full mt-4" aria-hidden="true" />

            {/* Dénominateur — boutons */}
            <div className="text-center space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Dénominateur</div>
              <div className="flex gap-1.5">
                {[10, 100].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={solved}
                    onClick={() => { setDen(d); setChecked(false); }}
                    aria-pressed={den === d}
                    className={`px-3 py-2 rounded-lg border-2 font-mono text-sm font-bold min-h-[40px] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      den === d ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-400'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aperçu */}
          {(num !== '' || den) && (
            <div className="text-center text-2xl text-slate-800">
              <MathText>{`$\\frac{${num || '?'}}{${den || '?'}}$`}</MathText>
            </div>
          )}

          {!solved && (
            <div className="text-center">
              <ValidateButton
                onClick={() => { setChecked(true); if (isRight) onSolved(); }}
                disabled={num === '' || den === null}
                tone="amber"
              >
                Valider ma fraction
              </ValidateButton>
            </div>
          )}
          {checked && !isRight && (
            <Feedback tone="hint">0,75 se lit « 75 centièmes » : numérateur = 75, dénominateur = 100.</Feedback>
          )}
          {solved && (
            <Feedback tone="ok">0,75 = 75/100 : le dénominateur est une puissance de 10.</Feedback>
          )}
        </div>
      );
    },
    prompt: <>Écris <strong className="font-mono">0,75</strong> sous forme de fraction décimale.</>,
  },
  {
    id: 'e9', skill: 'problemes', title: 'Épreuve 9',
    render: ({ solved, onSolved }) => {
      const [val, setVal] = useState('');
      const [fb, setFb] = useState(null);
      const check = () => {
        if (parseInt(val, 10) === 12) { onSolved(); setFb(null); }
        else setFb('20 billes ÷ 5 groupes = 4 par groupe, puis 4 × 3 = 12.');
      };
      return (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            20 billes sont réparties en 5 groupes égaux. Combien de billes y a-t-il dans <MathText>{'$\\frac{3}{5}$'}</MathText> de ce total ?
          </p>
          {solved ? (
            <Feedback tone="ok">20 ÷ 5 = 4, puis 4 × 3 = 12 billes.</Feedback>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <NumberField value={val} onChange={(v) => { setVal(v); setFb(null); }} onEnter={check} ariaLabel="Réponse" width="w-24" size="sm" />
                <ValidateButton onClick={check} disabled={!val} tone="amber">OK</ValidateButton>
              </div>
              {fb && <Feedback tone="hint">{fb}</Feedback>}
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

/* ═══ COMPÉTENCES SUIVIES ══════════════════════════════════════════ */
const SKILLS = {
  construire: { label: 'Construire une fraction', module: 2 },
  lire: { label: 'Lire une fraction', module: 4 },
  vocabulaire: { label: 'Numérateur / dénominateur', module: 3 },
  quantite: { label: "Fraction d'une quantité", module: 5 },
  quotient: { label: 'Fraction comme quotient', module: 6 },
  droite: { label: 'Droite graduée', module: 8 },
  equivalence: { label: 'Fractions équivalentes', module: 4 },
  decimales: { label: 'Fractions décimales', module: 9 },
  problemes: { label: 'Problèmes', module: 10 },
};

function ProfilMaitrise({ misses }) {
  const META = {
    ok: { dot: '🟢', label: 'Maîtrisé', tone: 'border-emerald-200 bg-emerald-50' },
    mid: { dot: '🟡', label: 'À renforcer', tone: 'border-amber-200 bg-amber-50' },
  };
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
  const BRANCHES = [
    { title: 'PARTAGE', body: <><MathText>{'$\\frac{3}{4}$'}</MathText> = 3 parts parmi 4 parts égales</>, tone: 'bg-blue-50 border-blue-200' },
    { title: 'ÉCRITURE', body: <MathText>{'$\\frac{3}{4}$'}</MathText>, tone: 'bg-indigo-50 border-indigo-200' },
    { title: 'VOCABULAIRE', body: '3 = numérateur, 4 = dénominateur', tone: 'bg-sky-50 border-sky-200' },
    { title: 'NOMBRE', body: '3/4 a une position, comme tout nombre', tone: 'bg-violet-50 border-violet-200' },
    { title: 'QUOTIENT', body: <><MathText>{'$\\frac{3}{4} = 3 \\div 4$'}</MathText></>, tone: 'bg-amber-50 border-amber-200' },
    { title: 'DROITE GRADUÉE', body: '3/4 est entre 0 et 1', tone: 'bg-rose-50 border-rose-200' },
    { title: 'FRACTION DÉCIMALE', body: <><MathText>{'$\\frac{3}{10} = 0{,}3$'}</MathText></>, tone: 'bg-emerald-50 border-emerald-200' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-3">
        <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">Le concept central</div>
        <div className="text-4xl font-space font-extrabold">FRACTION</div>
        <p className="text-sm text-slate-300">une quantité née d'un partage, qui peut se lire de sept façons.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BRANCHES.map((b) => (
          <div key={b.title} className={`rounded-xl border-2 px-4 py-3 ${b.tone}`}>
            <div className="font-mono font-extrabold text-xs tracking-wider text-slate-700">{b.title}</div>
            <div className="text-sm mt-1 text-slate-800">{b.body}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-3">
        <h3 className="font-space font-bold text-slate-800 text-sm">3/4, sous tous ses angles</h3>
        <PartitionShape shape="bar" parts={4} shaded={3} tone="amber" size="md" />
        <div className="text-center font-mono font-bold text-slate-800 bg-slate-100 rounded-xl py-2.5">
          <MathText>{'$\\frac{3}{4} = 3 \\div 4 = 0{,}75$'}</MathText>
        </div>
      </div>

      <Feedback tone="info">
        Rappel du lien avec les décimaux (vu au module 9) : dès que le dénominateur est 10, 100 ou 1 000, la
        fraction s'écrit directement avec une virgule.
      </Feedback>
    </div>
  );
}

/* ═══ FLASH RETOUR ══════════════════════════════════════════════════ */
const FLASH = [
  { q: 'Cette figure a 5 parts égales, 2 sont coloriées. Quelle fraction ?', shape: { shape: 'bar', parts: 5, shaded: 2, tone: 'sky' },
    options: ['2/5', '5/2', '3/5'], correct: 0, explain: '2 parts coloriées sur 5 : 2/5.' },
  { q: 'Dans 5/8, que représente le 5 ?', options: ['Le nombre de parts prises (numérateur)', 'Le nombre total de parts (dénominateur)'], correct: 0,
    explain: 'Le 5 est le numérateur : les parts prises.' },
  { q: 'Dans 5/8, que représente le 8 ?', options: ['Le nombre de parts prises (numérateur)', 'Le nombre total de parts égales (dénominateur)'], correct: 1,
    explain: 'Le 8 est le dénominateur : le partage total.' },
  { q: 'Que vaut 3 ÷ 4, sous forme de fraction ?', options: ['3/4', '4/3', '3 × 4'], correct: 0,
    explain: 'Partager 3 par 4 donne 3/4.' },
  { q: 'Quelle écriture décimale correspond à 1/2 ?', options: ['0,5', '0,2', '1,2'], correct: 0,
    explain: '1/2 = 5/10 = 0,5.' },
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
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          {score === FLASH.length ? 'Score parfait !' : `${FLASH.length - score} question(s) à revoir dans ton profil.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>Question {idx + 1} / {FLASH.length}</span>
        <span className="text-emerald-600 font-bold">{score} ✓</span>
      </div>
      <div className="bg-slate-800 text-white rounded-xl p-5 text-sm font-semibold leading-relaxed space-y-3">
        {q.q}
        {q.shape && (
          <div className="bg-white/10 rounded-xl p-3">
            <PartitionShape {...q.shape} size="sm" />
          </div>
        )}
      </div>
      <ChoiceGrid options={q.options} selected={pick} onSelect={setPick} revealed={revealed} correctIndex={q.correct} cols={q.options.length === 3 ? 3 : 1}
        renderOption={(o) => (o.includes('/') ? (() => { const [n,d]=o.split('/'); return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>; })() : o)} />
      {!revealed && (
        <ValidateButton onClick={() => { setRevealed(true); if (pick === q.correct) setScore((s) => s + 1); }} disabled={pick === null} tone="slate">
          Valider
        </ValidateButton>
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
  { id: 'partage', emoji: '🏅', label: 'Maître du partage', test: (s) => (s.quotient ?? 0) === 0 },
  { id: 'constructeur', emoji: '🏅', label: 'Constructeur de fractions', test: (s) => (s.construire ?? 0) === 0 },
  { id: 'decodeur', emoji: '🏅', label: 'Décodeur du numérateur', test: (s) => (s.vocabulaire ?? 0) === 0 },
  { id: 'explorateur', emoji: '🏅', label: 'Explorateur de la droite graduée', test: (s) => (s.droite ?? 0) === 0 },
  { id: 'detective', emoji: '🏅', label: 'Détective des fractions', test: (s) => (s.equivalence ?? 0) === 0 && (s.decimales ?? 0) === 0 },
];

/* ═══ MODULE ═══════════════════════════════════════════════════════ */
const PHASES = [
  { key: 'problemes', label: 'Problèmes', Icon: ClipboardList },
  { key: 'boss', label: 'Boss final', Icon: Trophy },
  { key: 'profil', label: 'Mon profil', Icon: Target },
  { key: 'synthese', label: 'Synthèse', Icon: BookMarked },
  { key: 'flash', label: 'Flash retour', Icon: Zap },
];

export default function Module10BossFinal() {
  const navLinks = getNavLinks(10);
  const { xp, awardXP } = useProgress(MODULE_CTX.lessonId);

  const [phase, setPhase] = useState('problemes');
  const [problemesDone, setProblemesDone] = useState(false);
  const [done, setDone] = useState([]);
  const [misses, setMisses] = useState({});
  const [flashScore, setFlashScore] = useState(0);
  const [flashDone, setFlashDone] = useState(false);

  const bossDone = done.length === EPREUVES.length;
  const allDone = problemesDone && bossDone && flashDone;

  const solveEpreuve = (ep) => {
    if (done.includes(ep.id)) return;
    setDone((d) => (d.includes(ep.id) ? d : [...d, ep.id]));
    awardXP({ moduleId: '10', exerciseId: ep.id, amount: 20 });
  };

  const badgesGagnes = BADGES.filter((b) => b.test(misses));
  const masterBadge = allDone && badgesGagnes.length === BADGES.length && flashScore === FLASH.length;

  const phaseUnlocked = (key) => {
    if (key === 'problemes') return true;
    if (key === 'boss') return problemesDone;
    return bossDone;
  };

  return (
    <ModuleLayout
      {...MODULE_CTX}
      moduleTitle="🏆 La Mission du Partage"
      moduleSubtitle="Problèmes, boss final, profil de maîtrise, synthèse et flash retour."
      moduleNumber={10}
      estimatedTime="20 min"
      xp={xp}
      prevLink={navLinks.prevLink}
      nextLink={navLinks.nextLink}
      isCompleted={allDone}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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
          {phase === 'problemes' && (
            <motion.div key="problemes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <ProblemesPhase onAllDone={() => setProblemesDone(true)} />
              {problemesDone && (
                <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl p-6 text-center space-y-3">
                  <Gift className="w-10 h-10 mx-auto text-amber-300" aria-hidden="true" />
                  <div className="text-xl font-space font-extrabold">Problèmes résolus !</div>
                  <button type="button" onClick={() => setPhase('boss')} className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-mono text-xs font-bold min-h-[44px]">
                    Passer au boss final <ArrowRight className="inline w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === 'boss' && (
            <motion.div key="boss" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <MissionBrief tag="🏆 Boss final" title="Neuf épreuves. Personne ne te dira laquelle utiliser." tone="amber">
                <p>Construire, lire, partager, quotient, droite graduée, équivalence, décimales : à toi de choisir la bonne compétence à chaque fois.</p>
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
                  <div className="text-2xl font-space font-extrabold">{masterBadge ? 'Maître des fractions !' : 'Leçon terminée !'}</div>
                  <p className="text-indigo-100 text-sm leading-relaxed max-w-lg mx-auto">
                    Une fraction représente une quantité née d'un partage. Tu peux la construire, la nommer, la
                    voir comme un nombre, comme un quotient, la placer sur une droite — et la relier aux
                    décimaux que tu connaissais déjà.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                    {['Partager', 'Nommer', 'Placer', 'Relier'].map((v) => (
                      <div key={v} className="bg-white/15 rounded-xl py-2 text-sm font-bold">✓ {v}</div>
                    ))}
                  </div>
                  {masterBadge && (
                    <div className="inline-flex items-center gap-2 bg-amber-400 text-amber-950 font-bold text-sm px-4 py-2 rounded-full mt-2">
                      🏆 Badge « Maître des fractions » débloqué
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
