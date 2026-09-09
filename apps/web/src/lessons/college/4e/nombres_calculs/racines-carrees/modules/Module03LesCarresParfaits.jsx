import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { carresParfaits, estCarreParfait } from '../components/racines4e';

/**
 * Module 3 — MANIPULATION : les carrés parfaits, construits puis sus.
 *
 * Activity              trier des nombres selon qu'ils forment un carré ou
 *                       non, en s'appuyant sur la table qu'on vient de bâtir.
 * Mathematical objective connaître les carrés de 1 à 12 n'est pas du
 *                       bachotage : c'est ce qui rend l'encadrement possible
 *                       au module suivant. La table est donc construite ICI,
 *                       et immédiatement mise au travail.
 * Expected observation  « les écarts entre carrés parfaits grandissent » —
 *                       ce qui prépare l'idée que la plupart des nombres
 *                       tombent entre deux d'entre eux.
 * Misconception targeted croire qu'un nombre « rond » (comme 20 ou 50) est
 *                       forcément un carré parfait.
 *
 * Ce module doit précéder le 4 : on ne peut pas encadrer √50 sans savoir que
 * 49 et 64 sont les carrés parfaits qui l'entourent.
 */
const TABLE = carresParfaits(144).slice(1);   // 1² à 12²

export default function Module03LesCarresParfaits() {
  const [devoiles, setDevoiles] = useState([]);
  const tableFaite = devoiles.length >= 6;
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Construis la table',
      subtitle: 'Touche six cartes pour découvrir leur carré. Regarde comment les écarts évoluent.',
      done: tableFaite,
      content: (kit) => (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {TABLE.map(({ racine: r, carre: c }) => {
              const vu = devoiles.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    if (vu) return;
                    const next = [...devoiles, r];
                    setDevoiles(next);
                    if (next.length === 6) kit.react(true);
                  }}
                  aria-pressed={vu}
                  className={`min-h-[64px] rounded-xl border-2 p-2 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    vu ? 'border-sky-400 bg-sky-50' : 'border-slate-300 bg-white hover:border-sky-400'
                  }`}
                >
                  <div className="font-mono text-xs text-slate-500">{r}²</div>
                  <div className={`font-mono text-lg font-black tabular-nums ${vu ? 'text-sky-700' : 'text-slate-300'}`}>
                    {vu ? c : '?'}
                  </div>
                  {vu && r > 1 && devoiles.includes(r - 1) && (
                    <div className="text-[11px] text-emerald-600">+{c - (r - 1) * (r - 1)}</div>
                  )}
                </button>
              );
            })}
          </div>
          {tableFaite ? (
            <Feedback tone="ok">
              Ces nombres — 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144 — sont exactement ceux
              qui forment un carré plein. Remarque que l’écart entre deux d’entre eux{' '}
              <strong>grandit</strong> : 3, puis 5, puis 7, puis 9… Plus on monte, plus les trous
              entre eux sont larges — et c’est dans ces trous que tombent la plupart des nombres.
              Découvre les autres cartes si tu veux la table complète.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche les cartes dans l’ordre pour voir apparaître l’écart entre deux carrés
              consécutifs.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Carré parfait ou non ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="carres-parfaits-4e"
            variant="new"
            lead={<>Les nombres que tu viens de découvrir portent un nom, et ce sont eux qu’il faut avoir en tête pour la suite.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque nombre, dis s’il forme un carré plein.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: <span className="font-mono text-base font-bold">121</span>,
                options: ['oui', 'non'],
                correct: 0,
                correction: '11 × 11 = 121',
              },
              {
                id: 'r2',
                label: <span className="font-mono text-base font-bold">50</span>,
                options: ['oui', 'non'],
                correct: 1,
                correction: 'entre 49 (7²) et 64 (8²) — rien entre les deux',
              },
              {
                id: 'r3',
                label: <span className="font-mono text-base font-bold">100</span>,
                options: ['oui', 'non'],
                correct: 0,
                correction: '10 × 10 = 100',
              },
              {
                id: 'r4',
                label: <span className="font-mono text-base font-bold">20</span>,
                options: ['oui', 'non'],
                correct: 1,
                correction: 'entre 16 (4²) et 25 (5²)',
              },
            ]}
            requires={['carres-parfaits-4e']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm text-emerald-700">
                  Exactement. Un nombre <strong>rond</strong> comme 20 ou 50 n’a aucune raison
                  d’être un carré parfait : c’est la table qui décide, pas l’allure du nombre.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  Le réflexe : cherche dans la table. 121 et 100 y sont (11² et 10²). 20 et 50 n’y
                  sont pas — ils tombent <strong>entre</strong> deux carrés parfaits.
                </p>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Lire la table à l’envers',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Combien vaut <MathText>{'$\\sqrt{144}$'}</MathText> ?</span>}
            options={['12', '72', '14', '11']}
            correct={0}
            cols={4}
            requires={['carres-parfaits-4e', 'racine-carree']}
            explain="144 est dans la table : c’est 12². Donc √144 = 12. Connaître la table permet de répondre sans aucun calcul."
            explainWrong="Vérifie toujours en remettant au carré : 12 × 12 = 144 ✓, alors que 11 × 11 = 121 et 14 × 14 = 196. (72 serait la moitié.)"
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Les carrés parfaits"
      moduleSubtitle="Douze nombres qui servent tout le temps"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Les nombres qui tombent juste',
        tone: 'indigo',
        body: (
          <p>
            Tu as vu que peu de nombres forment un carré plein. Dressons la liste : elle est courte,
            elle sert <strong>tout le temps</strong>, et c’est elle qui permettra de traiter tous
            les autres nombres.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
