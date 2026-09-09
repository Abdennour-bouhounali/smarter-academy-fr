import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgramLab from '../components/ProgramLab';
import { program, step, valueTable, readTable, fr, parseDec } from '../components/fonctionsUtils';
import { TEMPERATURE } from '../components/situations';

/**
 * Module 3 — MANIPULATION : le tableau de valeurs, et le programme qui
 * l'engendre.
 *
 * Action → changement → observation → sens :
 *   choisir un nombre → le programme se déroule → inscrire le couple →
 *   « le tableau, c'est moi qui le fabrique » → un programme de calcul est
 *   une dépendance qu'on peut rejouer autant de fois qu'on veut.
 *
 * Expected observation : « je peux remplir autant de colonnes que je veux,
 * sans jamais changer la règle ».
 * Misconception targeted : lire un tableau de valeurs en LIGNE (« 4 puis 5
 * puis 6 »), au lieu de le lire en COLONNE (le couple).
 *
 * PÉRIMÈTRE : le déroulé pas à pas remplace f(x) ; le mot « image » n'apparaît
 * nulle part.
 */

/** « Choisis un nombre, multiplie par 3, ajoute 2. » */
const PROG = program([
  step('Je multiplie par 3', (n) => n * 3),
  step('J’ajoute 2', (n) => n + 2),
]);

const CHOIX = [0, 1, 2, 4, 5, 10];

/** Le carnet du four : quelques relevés, engendrés par la règle. */
const CARNET = valueTable(TEMPERATURE, [0, 5, 10, 15, 20]);

export default function Module03LeCarnetDeBord() {
  const [q1, setQ1] = useState(false);

  const [x, setX] = useState(4);
  const [recorded, setRecorded] = useState([]);
  const done2 = recorded.length >= 3;

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const record = (v, react) => {
    if (recorded.some((r) => r.x === v)) return;
    const next = [...recorded, { x: v, y: PROG.run(v) }].sort((a, b) => a.x - b.x);
    setRecorded(next);
    if (next.length >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Le carnet du four',
      subtitle: 'Le cuisinier a noté ses relevés. Lis-y une valeur.',
      done: q1,
      content: (
        <div className="space-y-3">
          {/* Le tableau est POSÉ en position d'enseignement, avant toute
              demande : l'élève le voit avant qu'on lui demande d'y lire. */}
          <KnowledgeBrick
            id="tableau-de-valeurs"
            variant="new"
            lead={<>Les relevés du four se rangent dans un tableau — une colonne par essai.</>}
          />
          <div className="rounded-2xl border-2 border-sky-200 bg-white p-3.5 overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ minWidth: '22rem' }}>
              <tbody>
                <tr>
                  <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                    Durée (min)
                  </th>
                  {CARNET.map((r) => (
                    <td key={r.x} className="px-2 py-1.5 text-center font-mono font-bold tabular-nums text-slate-800">
                      {r.x}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-slate-200">
                  <th scope="row" className="text-left text-xs font-semibold text-slate-500 pr-3 whitespace-nowrap">
                    Température (°C)
                  </th>
                  {CARNET.map((r) => (
                    <td key={r.x} className="px-2 py-1.5 text-center font-mono font-bold tabular-nums text-sky-700">
                      {r.y}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
          <NumericQuestion
            prompt={<>D’après ce carnet, quelle est la température à cœur après <strong>15 minutes</strong> ?</>}
            expected={readTable(CARNET, 15)}
            parse={parseDec}
            suffix="°C"
            requires={['tableau-de-valeurs']}
            explain="On cherche 15 sur la ligne du haut, et on lit juste en dessous : 80 °C. Un tableau de valeurs se lit par colonne."
            explainFor={() =>
              'Un tableau se lit en COLONNE : repère 15 sur la ligne des durées, puis descends d’une case.'
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Fabrique ton propre tableau',
      subtitle: 'Un programme de calcul, et autant de colonnes que tu veux.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Voici un programme : <strong>« Choisis un nombre, multiplie-le par 3, puis ajoute 2. »</strong>{' '}
            Applique-le à trois nombres différents, et inscris chaque résultat.
          </div>
          <ProgramLab
            prog={PROG}
            x={x}
            onX={setX}
            choices={CHOIX}
            recorded={recorded}
            onRecord={(v) => record(v, kit.react)}
          />
          {done2 ? (
            <Feedback tone="ok">
              Ton tableau a <strong>{recorded.length} colonnes</strong>, et tu pourrais en ajouter
              autant que tu veux : la règle, elle, ne change jamais. C’est elle qui{' '}
              <em>engendre</em> le tableau.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Choisis un nombre, regarde le déroulé, puis inscris le couple. Fais-en trois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le programme, mis en mots',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="programme-de-calcul"
            variant="new"
            lead={<>Tu viens d’engendrer un tableau à partir d’une seule règle.</>}
          />
          <NumericQuestion
            prompt={
              <>
                Avec le même programme (multiplier par 3, puis ajouter 2), que donne le nombre{' '}
                <strong>7</strong> ?
              </>
            }
            expected={23}
            parse={parseDec}
            requires={['programme-de-calcul']}
            explain="7 × 3 = 21, puis 21 + 2 = 23."
            explainFor={(n) =>
              n === 27
                ? 'Tu as ajouté 2 d’abord (7 + 2 = 9), puis multiplié par 3. Le programme dit l’inverse : d’abord multiplier, ensuite ajouter.'
                : 'Suis les étapes dans l’ordre : 7 × 3 = 21, puis 21 + 2 = 23.'
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Lire en colonne, pas en ligne',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Dans le carnet du four, que signifie la colonne{' '}
                <strong className="font-mono">10 / {fr(readTable(CARNET, 10))}</strong> ?
              </>
            }
            options={[
              'Après 10 minutes de cuisson, le pain est à 60 °C',
              'Après 60 minutes de cuisson, le pain est à 10 °C',
              'Le pain a gagné 10 °C en 60 minutes',
            ]}
            cols={1}
            correct={0}
            requires={['tableau-de-valeurs', 'en-fonction-de']}
            explain="La ligne du haut porte la grandeur d’entrée — la durée. Une colonne se lit donc « à 10 minutes correspond 60 °C »."
            explainWrong="Les deux lignes ne sont pas interchangeables : celle du haut porte ce qu’on règle (la durée), celle du bas ce qui en dépend (la température)."
            solved={q4}
            onAnswered={() => setQ4(true)}
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
      moduleTitle="Le carnet de bord"
      moduleSubtitle="Ranger et fabriquer une dépendance"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le tableau ne tombe pas du ciel',
        tone: 'indigo',
        body: (
          <p>
            Le cuisinier note ses essais dans un carnet : une colonne par cuisson. Mais un tableau
            peut aussi être <strong>fabriqué</strong> à partir d’une règle — et tu vas en engendrer
            un toi-même.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
