import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 6 — LABORATOIRE DE PRATIQUE : tester une égalité.
 *
 * Activity              choisir une valeur de x et voir les deux membres se
 *                       calculer côte à côte, pour une égalité VRAIE et une
 *                       égalité FAUSSE.
 * Mathematical objective un contre-exemple SUFFIT à démolir une égalité ;
 *                       aucune valeur particulière ne suffit à la prouver.
 *                       C'est la différence entre vérifier et démontrer — et
 *                       c'est ce qui donne sa raison d'être au calcul
 *                       littéral appris dans les modules précédents.
 * Expected observation  « la fausse égalité tombe dès le premier essai ; la
 *                       vraie tient à chaque essai, mais je ne les aurai
 *                       jamais tous essayés ».
 * Misconception targeted « ça marche pour x = 2, donc c'est vrai » — et son
 *                       symétrique, « ça marche pour x = 0, donc c'est vrai »
 *                       (le zéro masque justement beaucoup d'erreurs).
 *
 * TRANSFERT : les deux égalités testées ne sont reprises d'aucun module.
 */
const VALEURS = [0, 1, 2, 5, 10];

/** L'égalité VRAIE : 2(x + 3) = 2x + 6. */
const vraieG = (x) => 2 * (x + 3);
const vraieD = (x) => 2 * x + 6;

/** L'égalité FAUSSE : 4(x + 1) = 4x + 1 — le second terme non distribué. */
const fausseG = (x) => 4 * (x + 1);
const fausseD = (x) => 4 * x + 1;

export default function Module06TesterUneEgalite() {
  const [essaisV, setEssaisV] = useState([]);
  const [essaisF, setEssaisF] = useState([]);
  const doneV = essaisV.length >= 3;
  const doneF = essaisF.length >= 1;
  const [q3, setQ3] = useState(false);

  const Table = ({ essais, g, d, ecriture }) => (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4">
      <p className="mb-2 text-center text-base font-bold text-slate-800">
        <MathText>{ecriture}</MathText>
      </p>
      {essais.length === 0 ? (
        <p className="text-center text-sm italic text-slate-400">
          Choisis une valeur de x ci-dessous.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-600">
                <th scope="col" className="p-1.5 text-left font-semibold">x</th>
                <th scope="col" className="p-1.5 text-right font-semibold">membre de gauche</th>
                <th scope="col" className="p-1.5 text-right font-semibold">membre de droite</th>
                <th scope="col" className="p-1.5 text-center font-semibold">?</th>
              </tr>
            </thead>
            <tbody>
              {essais.map((x) => {
                const a = g(x);
                const b = d(x);
                return (
                  <tr key={x} className={`border-t border-slate-200 ${a === b ? '' : 'bg-rose-50'}`}>
                    <th scope="row" className="p-1.5 text-left font-bold tabular-nums text-slate-700">{x}</th>
                    <td className="p-1.5 text-right tabular-nums text-slate-700">{a}</td>
                    <td className="p-1.5 text-right tabular-nums text-slate-700">{b}</td>
                    <td className={`p-1.5 text-center text-base font-black ${a === b ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {a === b ? '=' : '≠'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const Boutons = ({ essais, onEssai }) => (
    <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Valeurs de x à tester">
      {VALEURS.map((x) => (
        <button
          key={x}
          type="button"
          disabled={essais.includes(x)}
          onClick={() => onEssai(x)}
          className="min-h-[44px] min-w-[52px] rounded-xl border-2 border-slate-300 bg-white text-base font-bold tabular-nums text-slate-700 hover:border-rose-400 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          x = {x}
        </button>
      ))}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Une égalité qui tient',
      subtitle: 'Teste trois valeurs différentes. Les deux membres tombent-ils toujours pareil ?',
      done: doneV,
      content: (kit) => (
        <div className="space-y-3">
          <Table essais={essaisV} g={vraieG} d={vraieD} ecriture={'$2(x + 3) = 2x + 6$'} />
          <Boutons
            essais={essaisV}
            onEssai={(x) => {
              const next = [...essaisV, x];
              setEssaisV(next);
              if (next.length === 3) kit.react(true);
            }}
          />
          {doneV ? (
            <Feedback tone="ok">
              À chaque essai, les deux colonnes donnent le même nombre. Mais attention :{' '}
              <strong>cela ne prouve rien</strong>. Tu as testé trois valeurs, il en existe une
              infinité. Ce qui prouve cette égalité, c’est le <strong>développement</strong> :
              2(x + 3) = 2x + 6 par distributivité, pour toute valeur de x. Continue d’essayer si tu
              veux — mais c’est le calcul littéral qui tranche, pas les essais.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie plusieurs valeurs, dont x = 0 : il donne souvent des résultats trompeurs.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Une égalité qui tombe',
      subtitle: 'Un seul essai suffit-il à la faire tomber ?',
      done: doneF,
      content: (kit) => (
        <div className="space-y-3">
          <Table essais={essaisF} g={fausseG} d={fausseD} ecriture={'$4(x + 1) = 4x + 1$'} />
          <Boutons
            essais={essaisF}
            onEssai={(x) => {
              const next = [...essaisF, x];
              setEssaisF(next);
              if (next.length === 1) kit.react(true);
            }}
          />
          {doneF ? (
            <Feedback tone="ok">
              Une seule valeur qui ne marche pas, et c’est réglé : l’égalité est{' '}
              <strong>fausse</strong>. On appelle cela un <strong>contre-exemple</strong>. Ici
              l’erreur est visible : le 4 n’a pas été distribué sur le 1 — il fallait écrire{' '}
              <MathText>{'$4x + 4$'}</MathText>.
              {essaisF.includes(0) && (
                <>
                  {' '}Et remarque que <strong>x = 0</strong> donnait 4 contre 1 : même le zéro
                  suffisait ici, mais ce n’est pas toujours le cas.
                </>
              )}
            </Feedback>
          ) : (
            <Feedback tone="info">
              Choisis une valeur, n’importe laquelle.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Vérifier ou démontrer ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="tester-une-egalite"
            variant="new"
            lead={<>Un essai a suffi pour la seconde égalité, alors que trois n’ont rien prouvé pour la première. Ce n’est pas un hasard.</>}
          />
          <TapQuestion
            prompt="Léa teste l’égalité 5(x − 2) = 5x − 10 pour x = 3 : les deux membres valent 5. Que peut-elle en conclure ?"
            options={[
              'Rien de définitif : l’égalité pourrait échouer pour une autre valeur — il faut développer pour en être sûr',
              'Que l’égalité est vraie pour toutes les valeurs de x',
              'Que l’égalité est vraie uniquement pour x = 3',
              'Que l’égalité est fausse',
            ]}
            correct={0}
            cols={1}
            requires={['tester-une-egalite', 'distributivite-simple']}
            explain="Un essai réussi ne prouve rien : il faudrait les vérifier tous, et il y en a une infinité. En développant, 5(x − 2) = 5x − 10 — l’égalité est effectivement vraie, mais c’est le CALCUL qui le démontre, pas l’essai."
            explainWrong="Attention à la dissymétrie : un contre-exemple suffit pour prouver qu’une égalité est FAUSSE, mais aucun exemple ne suffit à prouver qu’elle est VRAIE. Seul le calcul littéral le fait."
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
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Tester une égalité"
      moduleSubtitle="Un contre-exemple suffit — un exemple, jamais"
      estimatedTime="8 min"
      brief={{
        tag: 'Entraînement',
        title: 'Comment savoir si c’est vrai ?',
        tone: 'amber',
        body: (
          <p>
            Devant une égalité comme <MathText>{'$4(x + 1) = 4x + 1$'}</MathText>, le premier
            réflexe est de <strong>tester une valeur</strong>. C’est utile — mais il faut savoir
            exactement ce que ce test prouve, et ce qu’il ne prouve pas.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
