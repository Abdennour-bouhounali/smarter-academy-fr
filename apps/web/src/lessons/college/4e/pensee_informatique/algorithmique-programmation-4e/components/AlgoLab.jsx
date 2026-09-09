import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import TraceCanvas4e from './TraceCanvas4e';
import ProgramView4e from './ProgramView4e';
import { positionsDesPas } from './pasSource';
import { useDragValue } from '../../../../../common/manip6e';
import {
  executer, executerPasAPas, ecrireInstruction, mod360, arrondi, INSTRUCTION_LABELS,
} from '../../../../../common/turtle/trace4e';

/**
 * AlgoLab — LA MANIPULATION SIGNATURE de la leçon : le premier débogueur.
 *
 * Activity               composer un programme en blocs (réordonner, changer
 *                        un paramètre), puis l'EXÉCUTER, le METTRE EN PAUSE et
 *                        l'AVANCER PAS À PAS.
 * Mathematical objective un programme a un ÉTAT à chaque instant — position,
 *                        cap, variables — et cet état est ce qui explique le
 *                        dessin. Le résultat final n'est qu'un des états.
 * Student action         monter / descendre une instruction, régler sa valeur,
 *                        lancer, mettre en pause, avancer d'un pas, reculer.
 * Controlled variable    l'ordre des instructions et leurs paramètres ; puis le
 *                        RANG d'exécution, qui est la vraie nouveauté de 4e.
 * Mathematical state     le programme et le rang courant. Tout le reste —
 *                        dessin, position, cap, variables, instruction
 *                        surlignée, branche prise — est DÉRIVÉ par
 *                        `executerPasAPas`, jamais stocké en double.
 * Visual consequence     à chaque pas, le tracé s'allonge d'exactement un
 *                        segment (ou d'aucun), la flèche du stylo tourne, les
 *                        variables affichent leur valeur de CET instant, et
 *                        l'instruction en cours s'allume.
 * Expected observation   « le programme s'arrête au milieu, et je vois ce
 *                        qu'il a dans la tête ».
 * Misconception targeted croire qu'un programme n'existe qu'une fois fini —
 *                        d'où l'impossibilité de comprendre pourquoi il se
 *                        trompe, et l'habitude de le relire au hasard.
 *
 * CE QUI N'EST PAS ICI, ET POURQUOI. Le lab n'écrit aucune condition et
 * n'ajoute aucun bloc SI : ce sont les modules 2 et 3. Il AFFICHE en revanche
 * la branche prise si le programme qu'on lui donne en contient un — c'est ce
 * qui permet au module 2 de reprendre le même lab sans le réécrire.
 *
 * JAMAIS FIGÉ. Aucun contrôle n'est désactivé quand l'étape est validée : un
 * laboratoire qui se fige après la bonne réponse cesse d'être un laboratoire
 * (règle « manipulations gelées »). Les seuls boutons désactivés sont ceux
 * dont l'action n'a pas de sens à cet instant (reculer au rang 0, monter la
 * première instruction) — et ils sont visiblement, pas silencieusement, inertes.
 */

/** Vitesse de lecture automatique, en millisecondes par pas. */
const CADENCE = 620;

/** Granularité du réglage d'un bloc — fine : le continu enseigne (§16). */
const PAS_REGLAGE = { AVANCER: 1, TOURNER: 1, REPETER: 1 };

const fr1 = (n) => String(arrondi(n, 1)).replace('.', ',');

/**
 * La RÉGLETTE D'EXÉCUTION — on saisit le curseur et on le fait glisser le long
 * du programme. C'est le geste continu de la leçon : le rang d'exécution est
 * une grandeur qu'on parcourt, et la voir varier sous le doigt est ce qui fait
 * comprendre qu'un programme a un état à CHAQUE instant, pas seulement à la
 * fin. Les boutons « un pas » restent à côté, pour le pas exact.
 */
function ReglettePas({ rang, dernier, onRang, segmentsParPas }) {
  const drag = useDragValue({
    value: rang,
    onChange: onRang,
    min: 0,
    max: Math.max(0, dernier),
    step: 1,
    axis: 'x',
    ariaLabel: 'Rang d’exécution du programme',
    valueText: (v) => `pas ${v} sur ${dernier}`,
  });
  const ratio = dernier > 0 ? rang / dernier : 0;
  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        Fais glisser pour parcourir l’exécution
      </p>
      <div
        {...drag.frameProps}
        className="relative h-11 cursor-pointer rounded-lg bg-slate-100"
      >
        {/* Un repère par pas : l'élève voit combien d'instructions seront
            exécutées, ce que le programme écrit ne dit pas. */}
        {Array.from({ length: dernier + 1 }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`absolute top-1/2 h-2.5 w-[3px] -translate-y-1/2 rounded-full ${
              segmentsParPas[i] ? 'bg-indigo-300' : 'bg-slate-300'
            }`}
            style={{ left: `calc(${dernier > 0 ? (i / dernier) * 100 : 0}% - 1.5px)` }}
          />
        ))}
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-indigo-400"
          style={{ left: 0, width: `${ratio * 100}%` }}
        />
        <span
          {...drag.handleProps}
          {...drag.a11yProps}
          className="absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-700 bg-indigo-600 shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
          style={{ left: `${ratio * 100}%`, touchAction: 'none' }}
        />
      </div>
    </div>
  );
}

/**
 * Le réglage d'un paramètre : on saisit la barre elle-même. Pas de `+`/`−`
 * (règle projet du 2026-09-06) — la valeur se voit VARIER, ce qui est
 * exactement ce qu'un paramètre d'instruction doit apprendre.
 */
function RegletteValeur({ valeur, min, max, step, onValeur, ariaLabel, unite }) {
  const drag = useDragValue({
    value: valeur, onChange: onValeur, min, max, step, axis: 'x',
    ariaLabel, valueText: (v) => `${v}${unite}`,
  });
  const ratio = max > min ? (valeur - min) / (max - min) : 0;
  return (
    <div {...drag.frameProps} className="relative h-11 min-w-[140px] grow cursor-pointer rounded-lg bg-slate-100">
      <span
        aria-hidden="true"
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-indigo-400"
        style={{ left: 0, width: `${ratio * 100}%` }}
      />
      <span
        {...drag.handleProps}
        {...drag.a11yProps}
        className="absolute top-1/2 flex h-9 min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-indigo-700 bg-white px-2 font-mono text-xs font-black tabular-nums text-indigo-800 shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
        style={{ left: `${ratio * 100}%`, touchAction: 'none' }}
      >
        {valeur}{unite}
      </span>
    </div>
  );
}

export default function AlgoLab({
  programme,
  onProgramme = null,      // si fourni, le programme est MODIFIABLE
  onRang = null,           // notifié de CHAQUE rang effectivement affiché
  env = {},
  depart = { x: 0, y: 0, cap: 0 },
  bornes = { AVANCER: [10, 120], TOURNER: [15, 180], REPETER: [2, 12] },
  titre = 'Le laboratoire du programme',
  hauteur = 260,
  montrerVariables = true,
  teinterBranches = false,
}) {
  const [rang, setRang] = useState(0);
  const [enLecture, setEnLecture] = useState(false);
  const minuteur = useRef(null);

  // TOUT est dérivé de (programme, env, depart). Deux sources de vérité pour
  // le même dessin, c'est deux dessins qui finissent par diverger.
  const resultat = useMemo(() => executer(programme, { env, depart }), [programme, env, depart]);
  const pas = useMemo(() => executerPasAPas(programme, { env, depart }), [programme, env, depart]);
  const positions = useMemo(() => positionsDesPas(programme, pas), [programme, pas]);

  const dernier = pas.length - 1;
  const rangSur = Math.min(rang, dernier);
  const etat = pas[rangSur];
  const position = positions[rangSur] ?? null;

  // Le module qui accueille le lab a besoin de savoir quels pas ont été
  // RÉELLEMENT regardés — « avoir exécuté » ne prouve rien, « s'être arrêté en
  // chemin » est le geste de la leçon. On notifie donc chaque rang affiché,
  // quelle que soit la commande qui y a mené (réglette, bouton, lecture).
  useEffect(() => {
    if (onRang) onRang(rangSur);
  }, [rangSur]); // eslint-disable-line react-hooks/exhaustive-deps

  // Le programme a changé sous nos pieds (l'élève a réordonné) : on revient au
  // départ plutôt que de garder un rang qui ne désigne plus la même chose.
  useEffect(() => {
    setRang(0);
    setEnLecture(false);
  }, [programme]);

  // Lecture automatique. Elle s'arrête d'elle-même à la fin : l'élève n'a
  // jamais à « rattraper » un programme qui tourne dans le vide.
  useEffect(() => {
    if (!enLecture) return undefined;
    if (rangSur >= dernier) {
      setEnLecture(false);
      return undefined;
    }
    minuteur.current = setTimeout(() => setRang((r) => Math.min(r + 1, dernier)), CADENCE);
    return () => clearTimeout(minuteur.current);
  }, [enLecture, rangSur, dernier]);

  const modifiable = typeof onProgramme === 'function';

  const deplacer = (i, sens) => {
    const j = i + sens;
    if (j < 0 || j >= programme.length) return;
    const copie = [...programme];
    [copie[i], copie[j]] = [copie[j], copie[i]];
    onProgramme(copie);
  };

  const regler = (i, valeur) => {
    const noeud = programme[i];
    const champ = noeud.kind === 'REPETER' ? 'fois' : 'valeur';
    if (!Number.isFinite(Number(noeud[champ]))) return; // une valeur lue ne se règle pas ici
    if (valeur === noeud[champ]) return;
    const copie = [...programme];
    copie[i] = { ...noeud, [champ]: valeur };
    onProgramme(copie);
  };

  // Quels pas font apparaître un trait ? La réglette le montre, et l'élève
  // découvre ainsi que TOURNER, LEVER et METTRE sont des pas eux aussi —
  // l'exécution compte des instructions, pas des segments.
  const segmentsParPas = useMemo(() => pas.map((e) => !!e.segment), [pas]);

  // LES VARIABLES AFFICHÉES SONT CELLES DE TOUT LE PROGRAMME, pas seulement
  // celles déjà définies au pas courant. Sinon le bandeau apparaîtrait au
  // milieu de l'exécution, et l'élève ne verrait jamais le passage
  // « pas encore définie » → « vaut 20 » : c'est pourtant exactement ce que
  // fait une affectation. Une variable pas encore écrite affiche « — ».
  const nomsVariables = useMemo(() => {
    const noms = new Set();
    pas.forEach((e) => Object.keys(e.env ?? {}).forEach((n) => noms.add(n)));
    return [...noms];
  }, [pas]);

  const boutonRond = 'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 font-bold transition-colors';

  return (
    <section
      role="group"
      aria-label={titre}
      className="space-y-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 p-3"
    >
      <TraceCanvas4e
        resultat={resultat}
        segments={etat.segmentsJusquIci}
        stylo={etat.pos}
        hauteur={hauteur}
        teinterBranches={teinterBranches}
        titre="Le tracé, à ce pas"
      />

      {/* ── L'ÉTAT, en clair et dans le DOM ─────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Pas</p>
          <p className="font-mono text-base font-black tabular-nums text-slate-900">
            {rangSur} <span className="text-sm font-bold text-slate-400">/ {dernier}</span>
          </p>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Position</p>
          <p className="font-mono text-base font-black tabular-nums text-slate-900">
            ({fr1(etat.pos.x)} ; {fr1(etat.pos.y)})
          </p>
        </div>
        <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Cap</p>
          <p className="font-mono text-base font-black tabular-nums text-slate-900">
            {fr1(mod360(etat.pos.cap))}°
          </p>
        </div>
      </div>

      {/* ── LES VARIABLES, à cet instant ─────────────────────────────── */}
      {montrerVariables && nomsVariables.length > 0 && (
        <div className="rounded-xl border-2 border-purple-200 bg-white px-3 py-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-purple-500">
            Les variables, à ce pas
          </p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {nomsVariables.map((nom) => {
              const definie = etat.env[nom] != null;
              return (
                <li
                  key={nom}
                  className={`rounded-lg px-2.5 py-1 font-mono text-sm font-black tabular-nums ${
                    definie ? 'bg-purple-50 text-purple-900' : 'bg-slate-100 text-slate-400'
                  }`}
                  data-variable={nom}
                >
                  {nom} = {definie ? fr1(etat.env[nom]) : '—'}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── CE QUE LE PAS COURANT VIENT DE FAIRE ─────────────────────── */}
      <p
        className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
        data-pas-courant={rangSur}
      >
        {rangSur === 0 ? (
          <>Au départ, avant la première instruction. Appuie sur ▶ ou avance d’un pas.</>
        ) : (
          <>
            <strong>Pas {rangSur}</strong> —{' '}
            <span className="font-mono">
              {position && position.corpsIndex != null
                ? ecrireInstruction(programme[position.srcIndex].corps[position.corpsIndex])
                : position
                  ? ecrireInstruction(programme[position.srcIndex])
                  : '—'}
            </span>
            {etat.tour != null && programme[etat.srcIndex]?.kind === 'REPETER' && (
              <span className="ml-2 rounded-md bg-purple-100 px-1.5 py-0.5 text-xs font-bold text-purple-800">
                tour {etat.tour + 1}
              </span>
            )}
            {etat.branche && (
              <span className={`ml-2 rounded-md px-1.5 py-0.5 text-xs font-bold ${
                etat.branche === 'alors' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                branche « {etat.branche} »
              </span>
            )}
          </>
        )}
      </p>

      {/* ── LA RÉGLETTE : le geste continu de la leçon ───────────────── */}
      <ReglettePas
        rang={rangSur}
        dernier={dernier}
        segmentsParPas={segmentsParPas}
        onRang={(v) => { setEnLecture(false); setRang(v); }}
      />

      {/* ── LES COMMANDES DU PAS À PAS ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => { setEnLecture(false); setRang(0); }}
          className={`${boutonRond} border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50`}
          aria-label="Revenir au départ"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => { setEnLecture(false); setRang((r) => Math.max(0, Math.min(r, dernier) - 1)); }}
          disabled={rangSur === 0}
          className={`${boutonRond} border-slate-300 bg-white px-3 text-slate-700 hover:bg-slate-50 disabled:opacity-40`}
          aria-label="Reculer d’un pas"
        >
          <SkipBack className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (enLecture) { setEnLecture(false); return; }
            if (rangSur >= dernier) setRang(0);
            setEnLecture(true);
          }}
          className={`${boutonRond} grow border-indigo-600 bg-indigo-600 px-4 text-white hover:bg-indigo-700`}
          aria-label={enLecture ? 'Mettre en pause' : 'Exécuter le programme'}
        >
          {enLecture ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          <span className="ml-2 text-sm">{enLecture ? 'Pause' : 'Exécuter'}</span>
        </button>
        <button
          type="button"
          onClick={() => { setEnLecture(false); setRang((r) => Math.min(Math.min(r, dernier) + 1, dernier)); }}
          disabled={rangSur >= dernier}
          className={`${boutonRond} border-amber-500 bg-amber-500 px-3 text-white hover:bg-amber-600 disabled:opacity-40`}
          aria-label="Avancer d’un pas"
        >
          <SkipForward className="h-4 w-4" aria-hidden="true" />
          <span className="ml-1.5 text-sm">Un pas</span>
        </button>
      </div>

      {/* ── LE PROGRAMME, ÉCRIT ET SURLIGNÉ ──────────────────────────── */}
      <ProgramView4e
        programme={programme}
        env={etat.env}
        actif={position}
        compact
        titre="Le programme"
      />

      {/* ── LE RÉGLAGE DES BLOCS (facultatif) ────────────────────────── */}
      {modifiable && (
        <div className="space-y-1.5 rounded-2xl border-2 border-slate-200 bg-white p-2.5">
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-slate-400">
            Régler les blocs
          </p>
          {programme.map((noeud, i) => {
            const champ = noeud.kind === 'REPETER' ? 'fois' : 'valeur';
            const reglable = Number.isFinite(Number(noeud[champ]));
            const [min, max] = bornes[noeud.kind] ?? [0, 999];
            const unite = noeud.kind === 'TOURNER' ? '°' : '';
            return (
              <div key={i} className="space-y-1.5 rounded-xl bg-slate-50 px-2 py-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-auto font-mono text-xs font-bold text-slate-600">
                    {ecrireInstruction(noeud)}
                  </span>
                  {/* L'ORDRE se change en montant / descendant le bloc : c'est
                      un objet DISCRET qu'on range, pas une grandeur continue. */}
                  <button
                    type="button" onClick={() => deplacer(i, -1)} disabled={i === 0}
                    className={`${boutonRond} border-slate-300 bg-white px-2 text-slate-700 disabled:opacity-30`}
                    aria-label={`Monter l’instruction ${i + 1}`}
                  >
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button" onClick={() => deplacer(i, 1)} disabled={i === programme.length - 1}
                    className={`${boutonRond} border-slate-300 bg-white px-2 text-slate-700 disabled:opacity-30`}
                    aria-label={`Descendre l’instruction ${i + 1}`}
                  >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {reglable && (
                  <RegletteValeur
                    valeur={Number(noeud[champ])}
                    min={min}
                    max={max}
                    step={PAS_REGLAGE[noeud.kind] ?? 1}
                    unite={unite}
                    ariaLabel={`Valeur de l’instruction ${i + 1} : ${INSTRUCTION_LABELS[noeud.kind].label}`}
                    onValeur={(v) => regler(i, v)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
