import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  program, step, quantity, valueTable, readTable, toPoints, readCurve, fr, parseDec,
} from '../components/fonctionsUtils';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT (stage `practice_lab`).
 *
 * Il n'INTRODUIT rien : il fait parcourir, sur une seule situation nouvelle,
 * toute la chaîne que les cinq modules précédents ont construite —
 *   dire la dépendance → la règle → le tableau → les points → la lecture.
 * C'est le module où l'élève mène le trajet entier lui-même, au lieu de
 * franchir une marche à la fois.
 *
 * Action → changement → observation → sens :
 *   choisir une durée de location → le tableau puis le graphique se
 *   complètent → « je peux répondre à une question qu'on ne m'a pas posée ».
 *
 * PÉRIMÈTRE : ni f(x), ni « image », ni « antécédent ». Aucune brique neuve —
 * un laboratoire consolide, il n'enseigne pas (LESSON_CONTRACT.md).
 *
 * SÉCURITÉ VISUELLE : le repère contient l'origine, `unitY` est distinct de
 * `unit`, et le tableau défile dans son propre conteneur.
 */

/** « Le club de VTT loue une cabane : 15 € d'ouverture, puis 8 € par jour. » */
const LOCATION = program([
  step('Je multiplie par 8 (le prix d’un jour)', (n) => n * 8),
  step('J’ajoute 15 (l’ouverture)', (n) => n + 15),
]);

const PRIX = quantity({
  id: 'prix',
  label: 'Prix de la location',
  unit: '€',
  rule: (j) => LOCATION.run(j),
});

const JOURS = [0, 1, 2, 3, 4, 5, 6];
const ROWS = valueTable(PRIX, JOURS);

export default function Module06LaCabaneDuClub() {
  const [q1, setQ1] = useState(false);
  const [j, setJ] = useState(0);
  const [vus, setVus] = useState([]);
  const done2 = vus.length >= 4;
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const choisir = (v, react) => {
    setJ(v);
    if (!vus.includes(v)) {
      const next = [...vus, v];
      setVus(next);
      if (next.length >= 4) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Qui commande, ici ?',
      subtitle: 'Avant tout calcul : repère la grandeur d’entrée.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Le club de VTT loue une cabane pour ses sorties. Le gardien demande{' '}
            <strong>15 € d’ouverture</strong>, puis <strong>8 € par jour</strong> de location.
          </div>
          <TapQuestion
            prompt="Comment dit-on correctement la dépendance de cette situation ?"
            options={[
              'Le prix de la location en fonction du nombre de jours',
              'Le nombre de jours en fonction du prix de la location',
            ]}
            cols={1}
            correct={0}
            requires={['en-fonction-de', 'dependance']}
            explain="C’est le club qui décide combien de jours il loue ; le prix en découle. Ce qui dépend se dit en premier."
            explainWrong="Le club ne choisit pas le prix pour en déduire une durée : il choisit la durée, et le gardien annonce le prix."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Déroule la règle, remplis le tableau',
      subtitle: 'Choisis au moins quatre durées et regarde le prix se construire.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {JOURS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => choisir(d, kit.react)}
                aria-pressed={j === d}
                className={`min-h-[44px] min-w-[44px] px-3 rounded-xl border-2 text-sm font-bold tabular-nums transition-colors ${
                  j === d
                    ? 'border-amber-600 bg-amber-600 text-white'
                    : vus.includes(d)
                      ? 'border-amber-300 bg-amber-100 text-amber-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-amber-400'
                }`}
              >
                {d} j
              </button>
            ))}
          </div>

          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Le déroulé pour {j} jour{j > 1 ? 's' : ''}
            </p>
            <ol className="space-y-1.5">
              {LOCATION.trace(j).map((s, i, arr) => (
                <li
                  key={s.label}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 ${
                    i === arr.length - 1 ? 'bg-amber-50 border-2 border-amber-300' : 'bg-slate-50'
                  }`}
                >
                  <span className="text-sm text-slate-700">{s.label}</span>
                  <span className="font-mono text-base font-black tabular-nums text-slate-800">
                    {fr(s.value)}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border-2 border-amber-200 bg-white p-3.5 overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ minWidth: '24rem' }}>
              <tbody>
                <tr>
                  <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                    Jours
                  </th>
                  {ROWS.map((r) => (
                    <td key={r.x} className="px-2 py-1.5 text-center font-mono font-bold tabular-nums text-slate-800">
                      {r.x}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-slate-200">
                  <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                    Prix (€)
                  </th>
                  {ROWS.map((r) => (
                    <td
                      key={r.x}
                      className={`px-2 py-1.5 text-center font-mono font-bold tabular-nums ${
                        vus.includes(r.x) ? 'text-amber-700' : 'text-slate-300'
                      }`}
                    >
                      {vus.includes(r.x) ? fr(r.y) : '·'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {done2 ? (
            <Feedback tone="ok">
              Ton tableau se remplit à mesure que tu déroules la règle. Remarque la colonne{' '}
              <strong className="font-mono">0 jour → {fr(readTable(ROWS, 0))} €</strong> : même sans
              louer un seul jour, l’ouverture est due.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche quatre durées différentes. Que vaut le prix pour <strong>0 jour</strong> ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Place les points, lis le dessin',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 7, yMin: 0, yMax: 70 }}
              unit={40}
              unitY={3.4}
              xStep={1}
              yStep={10}
              points={toPoints(ROWS, '#d97706', 'cab')}
              curves={[{ id: 'loc', points: ROWS, tone: 'amber', label: 'prix' }]}
              axisLabels={{ x: 'jours', y: '€' }}
              ariaLabel="Repère : le prix de la location en fonction du nombre de jours"
              caption={false}
            />
          </div>
          <NumericQuestion
            prompt={<>D’après ce graphique, combien coûte une location de <strong>4 jours</strong> ?</>}
            expected={readCurve(ROWS, 4)}
            parse={parseDec}
            suffix="€"
            requires={['lire-graphique', 'couple-point']}
            explain="On part de 4 sur l’axe des jours, on monte jusqu’à la courbe, et on lit 47 € sur l’axe vertical. Le tableau donne la même valeur."
            explainFor={() =>
              'Repère 4 sur l’axe horizontal, monte jusqu’à la courbe, puis lis la valeur à gauche.'
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'La question qu’on ne t’a pas posée',
      subtitle: 'Le club dispose de 55 €. Combien de jours peut-il louer ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Avec <strong>55 €</strong>, combien de jours entiers le club peut-il louer la
                cabane ?
              </>
            }
            options={['5 jours', '4 jours', '6 jours', '7 jours']}
            cols={4}
            correct={0}
            requires={['lire-graphique', 'tableau-de-valeurs']}
            explain="5 jours coûtent 55 € exactement — le tableau le donne, et sur le graphique le point (5 ; 55) est bien sur la courbe. 6 jours coûteraient 63 €, c’est trop."
            explainWrong="Regarde la colonne du tableau ou suis la courbe : 4 jours coûtent 47 € (il resterait de l’argent), et 6 jours 63 € (c’est trop cher). 5 jours tombent juste à 55 €."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu viens de faire le trajet <strong>dans l’autre sens</strong> : partir du prix pour
              retrouver la durée. C’est possible ici parce que le prix ne fait que monter — une
              seule durée donne 55 €.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La cabane du club"
      moduleSubtitle="Une situation entière, menée de bout en bout"
      estimatedTime="10 min"
      brief={{
        tag: 'Labo',
        title: 'Tout le trajet, d’un seul coup',
        tone: 'amber',
        body: (
          <p>
            Cette fois, personne ne découpe le travail pour toi. Une situation nouvelle, et la
            chaîne entière à mener : <strong>dire la dépendance</strong>, dérouler la règle,
            remplir le tableau, placer les points, puis <strong>répondre</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
