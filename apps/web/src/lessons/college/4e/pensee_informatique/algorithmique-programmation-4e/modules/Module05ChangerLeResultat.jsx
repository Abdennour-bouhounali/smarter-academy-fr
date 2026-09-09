import React, { useState } from 'react';
import { Wrench } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TraceCanvas4e from '../components/TraceCanvas4e';
import ProgramView4e from '../components/ProgramView4e';
import { PROGRAMME_A_MODIFIER } from '../components/programmes';
import { executer, estFermee, makeRepeat, avancer, tourner } from '../../../../../common/turtle/trace4e';

/**
 * Module 5 — MANIPULATION : modifier un programme existant.
 *
 * Activity               changer UNE valeur d'un programme livré pour obtenir
 *                        une figure imposée — l'hexagone régulier fermé.
 * Mathematical objective on ne réécrit pas un programme pour changer son
 *                        résultat : on identifie la valeur dont ce résultat
 *                        dépend, et on ne touche qu'à elle.
 * Student action         faire glisser le nombre de tours, puis l'angle, et
 *                        observer laquelle des deux ferme la figure DEMANDÉE.
 * Controlled variable    le nombre de tours et l'angle du virage.
 * Mathematical state     ces deux nombres ; fermeture et forme sont mesurées
 *                        par le moteur (`estFermee`), jamais annoncées.
 * Visual consequence     la figure se referme ou non, et le compteur de côtés
 *                        change avec elle.
 * Expected observation   « deux réglages ferment la figure, un seul donne la
 *                        figure demandée ».
 * Misconception targeted croire que « ça se referme » suffit — le piège du
 *                        module : passer l'angle à 72° ferme un PENTAGONE, ce
 *                        qui satisfait l'œil mais pas la consigne.
 *
 * POURQUOI UN PIÈGE PLUTÔT QU'UNE CIBLE UNIQUE. Modifier un programme, c'est
 * d'abord dire précisément ce qu'on veut. Un exercice à solution unique
 * laisserait croire que « la figure se referme » est le critère ; ici, deux
 * réglages ferment, et seul l'un des deux répond à la demande.
 */
const MIN_TOURS = 3;
const MAX_TOURS = 10;
const ANGLES = [45, 60, 72, 90];

export default function Module05ChangerLeResultat() {
  const [tours, setTours] = useState(PROGRAMME_A_MODIFIER[0].fois);
  const [angle, setAngle] = useState(PROGRAMME_A_MODIFIER[0].corps[1].valeur);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const programme = [makeRepeat(tours, [avancer(50), tourner(angle)])];
  const resultat = executer(programme);
  const fermee = estFermee(resultat);
  const hexagone = fermee && tours === 6;

  // Le jalon est la CIBLE, pas la fermeture : c'est ce qui interdit de valider
  // avec le pentagone. Une fois atteint, le lab reste entièrement manipulable.
  const done1 = hexagone;

  const glissiere = (label, valeur, min, max, onChange, unite = '') => (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
        <span className="font-mono text-base font-black tabular-nums text-slate-900">{valeur}{unite}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {Array.from({ length: max - min + 1 }, (_, k) => min + k).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={valeur === v}
            className={`min-h-[44px] min-w-[44px] rounded-lg border-2 font-mono text-sm font-black transition-colors ${
              valeur === v
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  const lab = (
    <section role="group" aria-label="L’atelier de modification" className="space-y-2.5 rounded-2xl border-2 border-emerald-200 bg-emerald-50/40 p-3">
      <TraceCanvas4e
        resultat={resultat}
        hauteur={200}
        montrerStylo={false}
        titre={`la figure obtenue : ${resultat.segments.length} côtés`}
      />
      <div
        className={`rounded-xl border-2 px-3 py-2 text-sm font-semibold ${
          hexagone
            ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
            : fermee
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-rose-300 bg-rose-50 text-rose-800'
        }`}
      >
        {hexagone
          ? `Fermée, et à 6 côtés : c’est l’hexagone régulier demandé.`
          : fermee
            ? `Fermée — mais à ${resultat.segments.length} côtés, pas 6. Ce n’est pas la figure demandée.`
            : `Pas fermée : le stylo a tourné de ${resultat.rotationTotale}° en tout, il en faudrait 360.`}
      </div>
      <ProgramView4e programme={programme} compact titre="Le programme, tel qu’il est maintenant" />
      <div className="grid gap-2 sm:grid-cols-2">
        {glissiere('Nombre de tours', tours, MIN_TOURS, MAX_TOURS, setTours)}
        <div className="rounded-xl border-2 border-slate-200 bg-white p-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Angle du virage</span>
            <span className="font-mono text-base font-black tabular-nums text-slate-900">{angle}°</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {ANGLES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAngle(a)}
                aria-pressed={angle === a}
                className={`min-h-[44px] grow rounded-lg border-2 font-mono text-sm font-black transition-colors ${
                  angle === a
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {a}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const steps = [
    {
      num: 1,
      title: 'Obtenir un hexagone régulier fermé',
      subtitle: 'Le programme livré trace 5 côtés avec des virages de 60°, et ne se referme pas.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Pour fermer cette figure en hexagone, combien de valeurs faut-il changer dans le programme ?"
            options={[
              { id: 'une', label: 'Une seule' },
              { id: 'deux', label: 'Deux' },
              { id: 'tout', label: 'Il faut le réécrire entièrement' },
              { id: 'sais-pas', label: 'Je ne sais pas encore' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              L’angle est déjà celui d’un hexagone (360 ÷ 6 = 60). Cherche ce qui manque
              vraiment.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Une seule valeur a changé : le nombre de tours, passé de 5 à 6. L’angle, lui,
              était juste depuis le début. Tu peux continuer à essayer les autres réglages.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Fermée ne veut pas dire juste',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Remets 5 tours et essaie 72° : la figure se referme aussi. Pourtant, ce n’est pas la
            réponse.
          </p>
          {lab}
          <TapQuestion
            prompt="Avec 5 tours et des virages de 72°, la figure se referme. Pourquoi n’est-ce pas la bonne modification ?"
            options={[
              'Parce que c’est un pentagone : on demandait 6 côtés',
              'Parce qu’elle n’est pas vraiment fermée',
              'Parce que 72 n’est pas un diviseur de 360',
              'Parce qu’on ne doit jamais changer l’angle',
            ]}
            correct={0}
            cols={1}
            requires={['angle-exterieur']}
            explain="5 × 72 = 360 : la figure se referme, mais avec 5 côtés. La consigne demandait un hexagone. « Ça se referme » n’est pas le critère — la figure DEMANDÉE l’est."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="modifier-programme"
              variant="new"
              lead="D’où la méthode, en quatre temps."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trouver la bonne valeur du premier coup',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un programme trace un carré de côté 40. On veut le même carré, deux fois plus grand. Que modifier ?"
            options={[
              'La valeur du AVANCER, en la passant à 80',
              'Le nombre de tours, en le passant à 8',
              'L’angle, en le passant à 45°',
              'Il faut réécrire le programme',
            ]}
            correct={0}
            cols={1}
            requires={['modifier-programme']}
            explain="La taille dépend de la longueur des côtés, donc du AVANCER. Doubler le nombre de tours ou diviser l’angle changerait la FORME, pas la taille."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Modifier suppose que le programme est juste au départ. Au module suivant, il ne
              l’est pas : trois programmes sont cassés, et il faut trouver où.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Changer le résultat"
      moduleSubtitle="Une valeur, pas tout le programme"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Un hexagone est demandé',
        tone: 'indigo',
        body: (
          <>
            Voici un programme qui ne se referme pas. On te demande un{' '}
            <strong>hexagone régulier</strong>. Touche au minimum d’instructions.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3.5">
          <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <p className="text-sm text-emerald-900">
            Deux réglages ferment la figure. Un seul donne celle qu’on demande — c’est toute la
            différence entre « ça marche » et « c’est juste ».
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
