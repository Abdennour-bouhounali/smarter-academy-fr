import React, { useEffect, useMemo, useRef, useState } from 'react';
import TraceCanvas from './TraceCanvas';
import ProgramView from './ProgramView';
import { executer, cadre, estFermee, ecrireProgramme } from './trace';

/**
 * TraceLab — le laboratoire de la leçon : PRÉVOIR → EXÉCUTER → OBSERVER.
 *
 * ACTION → CHANGE → OBSERVATION → SENS (INTERACTION_PEDAGOGY §6ter.4) :
 *   ACTION       l'élève lance le programme, ou change une valeur d'entrée ;
 *   CHANGE       le tracé se construit instruction par instruction, et la
 *                carte du programme s'allume en même temps que le trait ;
 *   OBSERVATION  la figure obtenue, sa longueur, sa fermeture ;
 *   SENS         « le programme ne décrit pas le dessin, il décrit les GESTES
 *                qui le produisent ».
 *
 * Expected observation : « ce n'est pas moi qui dessine, c'est le programme —
 * et si je change un seul nombre, tout le dessin change. »
 * Misconception targeted : croire qu'un programme décrit une image (« fais un
 * carré ») au lieu d'une suite de gestes ; croire que l'exécution est instantanée
 * et magique, alors qu'elle est une succession d'instructions ordonnées.
 *
 * SÉCURITÉ VISUELLE. Le cadre est calculé sur la figure COMPLÈTE, jamais sur
 * la portion déjà tracée : sans cela, le dessin se redimensionnerait à chaque
 * instruction et l'élève verrait la figure « respirer » au lieu de se
 * construire. C'est le même piège que le décalage proportionnel des SVG.
 *
 * PROGRESSION NON BLOQUANTE. Le laboratoire ne se fige JAMAIS après validation
 * (`frozen_manipulation_bug_class`) : `termine` sert à annoncer la réussite,
 * pas à désactiver les commandes. L'élève peut rejouer, changer, recommencer.
 */
export default function TraceLab({
  programme,
  env = {},
  onEnv = null,           // (nom, valeur) => void — présent = l'entrée est réglable
  entrees = [],           // [{ nom, label, min, max, pas, unite }]
  hauteur = 260,
  montrerLongueurs = false,
  montrerProgramme = true,
  titreProgramme = 'Le programme',
  vitesse = 260,          // ms par instruction
  onFin = null,           // (resultat) => void, appelé à la fin d'une exécution
  bilan = null,           // (resultat) => ReactNode — lecture personnalisée
  autoExecuter = false,   // relancer tout seul quand une entrée change
  cadreImpose = null,
}) {
  const resultat = useMemo(() => executer(programme, { env }), [programme, env]);

  // Le cadre vient de la figure ENTIÈRE : le dessin se construit dedans, il ne
  // se redimensionne pas à chaque trait. Le useMemo est INCONDITIONNEL — le
  // placer derrière un `??` casserait l'ordre des hooks au premier rendu où
  // `cadreImpose` change de nature.
  const cadreCalcule = useMemo(() => cadre(resultat), [resultat]);
  const c = cadreImpose ?? cadreCalcule;

  const [pas, setPas] = useState(0);          // instructions déjà exécutées
  const [enCours, setEnCours] = useState(false);
  const timer = useRef(null);
  const total = resultat.etapes.length;

  const arreter = () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    setEnCours(false);
  };

  // Un changement de programme ou d'entrée remet la feuille à blanc : le
  // tracé affiché correspond TOUJOURS au programme affiché (jamais un dessin
  // périmé sous un programme neuf — c'est un mensonge visuel).
  useEffect(() => {
    arreter();
    setPas(autoExecuter ? total : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programme, JSON.stringify(env), autoExecuter, total]);

  useEffect(() => () => arreter(), []);

  const lancer = () => {
    arreter();
    setPas(0);
    setEnCours(true);
    let i = 0;
    timer.current = setInterval(() => {
      i += 1;
      setPas(i);
      if (i >= total) {
        arreter();
        onFin?.(resultat);
      }
    }, vitesse);
  };

  const toutMontrer = () => { arreter(); setPas(total); onFin?.(resultat); };

  // Nombre de SEGMENTS correspondant aux `pas` instructions exécutées : une
  // instruction TOURNER n'ajoute pas de trait, l'index ne peut donc pas être
  // celui du pas.
  const segmentsVisibles = resultat.etapes.slice(0, pas).filter((e) => e.segment).length;
  const etapeCourante = pas > 0 ? resultat.etapes[pas - 1] : null;
  const fini = pas >= total && total > 0;

  return (
    <div className="space-y-3">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] gap-3 items-start">
        <TraceCanvas
          resultat={resultat}
          cadreImpose={c}
          jusqua={segmentsVisibles}
          hauteur={hauteur}
          montrerLongueurs={montrerLongueurs && fini}
        />

        <div className="space-y-3">
          {montrerProgramme && (
            <ProgramView
              programme={programme}
              env={env}
              titre={titreProgramme}
              actif={enCours && etapeCourante ? { srcIndex: etapeCourante.srcIndex, corpsIndex: etapeCourante.corpsIndex } : null}
            />
          )}

          {/* Les entrées : la variable est RÉGLABLE, et le dessin suit. */}
          {entrees.length > 0 && onEnv && (
            <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-3 space-y-2.5">
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.14em] text-violet-700">
                Les entrées du programme
              </p>
              {entrees.map((e) => (
                <div key={e.nom} className="space-y-1">
                  <label htmlFor={`in-${e.nom}`} className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-mono font-bold text-violet-800">{e.nom}</span>
                    <output className="font-mono text-lg font-black tabular-nums text-violet-900">
                      {env[e.nom]}{e.unite ?? ''}
                    </output>
                  </label>
                  <input
                    id={`in-${e.nom}`}
                    type="range"
                    min={e.min} max={e.max} step={e.pas ?? 1}
                    value={env[e.nom]}
                    onChange={(ev) => onEnv(e.nom, Number(ev.target.value))}
                    className="w-full h-11 accent-violet-600 cursor-pointer"
                    aria-label={e.label ?? `valeur de ${e.nom}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={lancer}
          className="min-h-[44px] px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          ▶ Exécuter le programme
        </button>
        <button
          type="button"
          onClick={toutMontrer}
          className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white hover:border-indigo-400 text-slate-700 font-bold text-sm"
        >
          ⏭ Tout de suite
        </button>
        <button
          type="button"
          onClick={() => { arreter(); setPas(0); }}
          className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white hover:border-slate-400 text-slate-700 font-bold text-sm"
        >
          ↺ Effacer la feuille
        </button>
        <span className="text-xs font-mono text-slate-500 tabular-nums" aria-live="polite">
          {pas} / {total} instruction{total > 1 ? 's' : ''}
        </span>
      </div>

      {fini && (bilan
        ? bilan(resultat)
        : (
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900">
            <strong>{resultat.segments.length}</strong> trait{resultat.segments.length > 1 ? 's' : ''} tracé{resultat.segments.length > 1 ? 's' : ''},{' '}
            <strong>{resultat.longueur}</strong> pas de crayon en tout.{' '}
            {estFermee(resultat)
              ? 'Le stylo est revenu exactement à son point de départ : la figure est fermée.'
              : 'Le stylo ne s’est pas retrouvé à son point de départ : la figure reste ouverte.'}
          </div>
        ))}

      <p className="sr-only">{ecrireProgramme(programme)}</p>
    </div>
  );
}
