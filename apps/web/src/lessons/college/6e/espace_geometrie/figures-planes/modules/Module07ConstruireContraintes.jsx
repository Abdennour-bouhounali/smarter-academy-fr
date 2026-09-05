import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hammer, Eye } from 'lucide-react';
import { ContentModule } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeLab from '../components/ShapeLab';
import { checkConstraints, shapeName } from '../components/figuresUtils';

/**
 * Module 7 — PRACTICE LAB : construire sous contraintes (P10).
 *
 * Objectif : produire, et non plus reconnaître. On donne la LISTE des
 * propriétés ; l'élève fabrique une figure qui les vérifie toutes.
 *
 * Aha : il ne suffit pas d'obtenir « à peu près » la bonne allure — chaque
 * contrainte est vérifiée séparément, et il faut les satisfaire TOUTES en
 * même temps.
 *
 * Politique formative : le contrôle liste chaque contrainte avec son état,
 * donc l'élève voit toujours LAQUELLE manque encore. Échappatoire après 3
 * demandes d'indice — jamais de blocage.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 230 };

// Départ : un quadrilatère franchement de travers — aucune propriété
// remarquable, donc rien n'est validé d'avance.
const DEPART_QUAD = [{ x: 80, y: 60 }, { x: 210, y: 70 }, { x: 220, y: 175 }, { x: 70, y: 165 }];

/**
 * Le chantier 1 (rectangle) et le chantier 2 (carré) exigent tous deux des
 * angles droits EXACTS. Les obtenir en déplaçant quatre sommets libres est
 * hors de portée à la souris : on donne donc à l'élève un rectangle-outil
 * dont il règle la largeur et la hauteur, ce qui garde les angles droits par
 * construction et laisse le vrai travail — satisfaire les contraintes — à sa
 * charge.
 */
function rectFrom(w, h) {
  const cx = 140;
  const cy = 115;
  return [
    { x: cx - w / 2, y: cy - h / 2 },
    { x: cx + w / 2, y: cy - h / 2 },
    { x: cx + w / 2, y: cy + h / 2 },
    { x: cx - w / 2, y: cy + h / 2 },
  ];
}

const CHANTIERS = [
  {
    id: 'ch1',
    startW: 120,
    startH: 120,
    // 122 × 120 satisfaisait la consigne à la lettre tout en ressemblant à un
    // carré : on exige un allongement VISIBLE (≥ 25 px d'écart), le même
    // seuil que la mission « rectangle » du module 3.
    minSideGap: 25,
    label: 'Construis un RECTANGLE : 4 angles droits, mais pas 4 côtés égaux.',
    required: ['angles-droits'],
    forbidden: ['cotes-egaux'],
    solution: [{ x: 60, y: 65 }, { x: 230, y: 65 }, { x: 230, y: 165 }, { x: 60, y: 165 }],
    hint: 'Les angles droits sont déjà garantis. Il suffit que la largeur et la hauteur soient DIFFÉRENTES.',
  },
  {
    id: 'ch2',
    startW: 190,
    startH: 100,
    label: 'Construis un CARRÉ : 4 angles droits ET 4 côtés égaux.',
    required: ['angles-droits', 'cotes-egaux'],
    forbidden: [],
    solution: [{ x: 85, y: 50 }, { x: 205, y: 50 }, { x: 205, y: 170 }, { x: 85, y: 170 }],
    hint: 'Règle la largeur et la hauteur sur la MÊME valeur : les quatre côtés deviendront égaux.',
  },
];

function Chantier({ chantier, done, onDone, react }) {
  // L'élève règle une LARGEUR et une HAUTEUR : les angles droits sont donc
  // exacts par construction, et tout son travail porte sur les contraintes
  // de longueur — ce que le chantier demande réellement.
  // Départ : un CARRÉ (120 × 120). Le chantier 1 (rectangle non carré) doit
  // donc l'allonger, le chantier 2 (carré) part d'un rectangle à égaliser —
  // dans les deux cas, il y a quelque chose à construire. Un départ déjà
  // conforme validerait la mission avant le moindre geste.
  const [w, setW] = useState(chantier.startW);
  const [h, setH] = useState(chantier.startH);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const pts = rectFrom(w, h);
  const shown = revealed ? chantier.solution : pts;
  const { detail, ok } = checkConstraints(shown, chantier.required);
  // Les contraintes NÉGATIVES (« pas 4 côtés égaux ») comptent aussi.
  const forbidden = checkConstraints(shown, chantier.forbidden).detail;
  const forbiddenOk = forbidden.every((f) => !f.ok);
  const success = ok && forbiddenOk;

  /** Applique une nouvelle dimension et teste la réussite hors updater. */
  const setDim = (nextW, nextH) => {
    if (done || revealed) return;
    const cw = Math.max(40, Math.min(230, nextW));
    const ch = Math.max(40, Math.min(190, nextH));
    setW(cw);
    setH(ch);
    const next = rectFrom(cw, ch);
    const r = checkConstraints(next, chantier.required);
    const f = checkConstraints(next, chantier.forbidden).detail;
    const gapOk = !chantier.minSideGap || Math.abs(cw - ch) >= chantier.minSideGap;
    if (r.ok && f.every((x) => !x.ok) && gapOk) { react(true); onDone(); }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
        {chantier.label}
      </div>

      <ShapeLab
        points={shown}
        box={BOX}
        draggable={false}
        showLengths
        showProperties={false}
        ariaLabel={`Figure en construction — actuellement : ${shapeName(shown)}`}
      />

      {!done && !revealed && (
        <div className="grid sm:grid-cols-2 gap-3">
          <DimControl
            label="Largeur"
            value={Math.round(w)}
            onChange={(v) => setDim(v, h)}
            min={40}
            max={230}
          />
          <DimControl
            label="Hauteur"
            value={Math.round(h)}
            onChange={(v) => setDim(w, v)}
            min={40}
            max={190}
          />
        </div>
      )}

      {/* Le contrôle, contrainte par contrainte : l'élève voit ce qui manque */}
      <div className="space-y-1.5">
        {detail.map((d) => (
          <div
            key={d.id}
            className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
              d.ok ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
            }`}
          >
            <span aria-hidden="true">{d.ok ? '✓' : '○'}</span>
            {d.label}
          </div>
        ))}
        {forbidden.map((f) => {
          // « Pas 4 côtés égaux » ne suffit pas : l'écart doit se VOIR.
          const visible = !chantier.minSideGap || Math.abs(w - h) >= chantier.minSideGap;
          const satisfait = !f.ok && visible;
          return (
            <div
              key={f.id}
              className={`rounded-xl border-2 px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                satisfait ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <span aria-hidden="true">{satisfait ? '✓' : '○'}</span>
              Largeur et hauteur nettement différentes
              {!satisfait && chantier.minSideGap && (
                <span className="ml-auto font-mono text-[11px]">
                  écart {Math.abs(Math.round(w - h))} / {chantier.minSideGap}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {(done || revealed) && (
        <Feedback tone={revealed ? 'info' : 'ok'}>
          {revealed && <strong>Pas grave, on te le montre. </strong>}
          Toutes les contraintes sont vérifiées en même temps : la figure est bien un{' '}
          <strong>{shapeName(shown)}</strong>.
        </Feedback>
      )}

      {!done && !revealed && !success && tries >= 1 && (
        <Feedback tone="info">{chantier.hint}</Feedback>
      )}

      {!done && !revealed && (
        <button type="button" onClick={() => setTries((t) => t + 1)} className="min-h-[44px] inline-flex items-center px-1 text-xs font-mono text-slate-500 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded">
          Un indice ?
        </button>
      )}

      {tries >= 3 && !done && !revealed && (
        <button
          type="button"
          onClick={() => { setRevealed(true); onDone(); }}
          className="w-full min-h-[44px] rounded-xl border-2 border-sky-300 bg-sky-50 text-sky-800 font-bold text-sm hover:bg-sky-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Eye className="w-4 h-4 inline mr-1.5" aria-hidden="true" />
          Je ne trouve pas — montre-moi
        </button>
      )}
    </div>
  );
}

/**
 * Réglage d'une dimension : boutons ± (pas de 5), curseur, et flèches du
 * clavier. Trois chemins pour la même action — aucun n'est réservé au
 * pointeur (playbook §10.1).
 */
function DimControl({ label, value, onChange, min, max }) {
  const btn = 'min-h-[44px] min-w-[44px] rounded-xl border-2 border-slate-300 bg-white font-mono font-bold text-slate-700 hover:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-wide text-slate-500">{label}</span>
        <span className="font-mono font-extrabold text-indigo-900 tabular-nums">{value}</span>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className={btn} onClick={() => onChange(value - 5)} aria-label={`Diminuer la ${label.toLowerCase()}`}>
          −
        </button>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-indigo-600"
          aria-label={`${label} : ${value}`}
        />
        <button type="button" className={btn} onClick={() => onChange(value + 5)} aria-label={`Augmenter la ${label.toLowerCase()}`}>
          +
        </button>
      </div>
    </div>
  );
}

export default function Module07ConstruireContraintes() {
  const [done, setDone] = useState([]);
  const mark = (id) => setDone((d) => (d.includes(id) ? d : [...d, id]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Construire sous contraintes"
      moduleSubtitle="On te donne les propriétés : fabrique la figure."
      estimatedTime="10 min"
      brief={{
        tag: '📋 Mission 07',
        title: 'Cette fois, c’est toi qui fabriques.',
        body: (
          <p>
            Les angles droits sont garantis par l’outil : à toi de régler la{' '}
            <strong>largeur</strong> et la <strong>hauteur</strong> pour allumer{' '}
            <strong>toutes</strong> les contraintes en même temps.
          </p>
        ),
      }}
      steps={CHANTIERS.map((c, i) => ({
        num: i + 1,
        title: `Chantier ${i + 1}`,
        done: done.includes(c.id),
        content: (kit) => (
          <Chantier chantier={c} done={done.includes(c.id)} onDone={() => mark(c.id)} react={kit.react} />
        ),
      }))}
      footer={
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2"
        >
          <Hammer className="w-6 h-6 mx-auto text-cyan-400" aria-hidden="true" />
          <p className="text-sm text-slate-300">
            Construire une figure, c’est satisfaire <strong className="text-white">toutes</strong> ses
            propriétés à la fois. Une seule contrainte oubliée, et ce n’est plus la bonne figure.
          </p>
        </motion.div>
      }
    />
  );
}
