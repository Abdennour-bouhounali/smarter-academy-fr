import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import CrossTableView from '../../../../../common/stats/CrossTableView';
import { formatPercent } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { lyceeTable } from '../data';

/**
 * Module 3 — DÉCOUVERTE : P_A(B) ≠ P_B(A), l'erreur d'inversion.
 *
 * L'élève BASCULE lui-même la condition et voit le tableau changer de
 * dénominateur (highlight ligne ↔ colonne) : 150/200 = 75 % contre
 * 150/450 ≈ 33 %. Même numérateur, deux univers.
 *
 * On ne se contente pas du contre-exemple scolaire : le pas de côté vers
 * un exemple de la vie réelle (le test d'alcoolémie, les accidents) est ce
 * qui rend l'erreur mémorable — c'est aussi le pont vers la leçon « Tests
 * diagnostiques », sans en faire le travail.
 */
const T = lyceeTable();

export default function Module03NeJamaisRetournerLaCondition() {
  const [sens, setSens] = useState('interne');   // 'interne' | 'club'
  const [seen, setSeen] = useState(() => new Set(['interne']));
  const [q2, setQ2] = useState(false);

  const done1 = seen.size >= 2;
  const done2 = q2;

  const flip = (next, react) => {
    setSens(next);
    const s = new Set(seen); s.add(next); setSeen(s);
    if (!done1 && s.size >= 2) react?.(true);
  };

  const isInterne = sens === 'interne';

  const steps = [
    {
      num: 1,
      title: 'Bascule la condition',
      subtitle: 'Le numérateur ne bouge pas : 150 élèves. Regarde le dénominateur, lui, changer de camp.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir le sens du conditionnement">
            <button type="button" onClick={() => flip('interne', kit.react)} aria-pressed={isInterne}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                isInterne ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300'}`}>
              Sachant qu’il est interne, la probabilité d’être en club
            </button>
            <button type="button" onClick={() => flip('club', kit.react)} aria-pressed={!isInterne}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${
                !isInterne ? 'border-sky-500 bg-sky-50 text-sky-800' : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300'}`}>
              Sachant qu’il est en club, la probabilité d’être interne
            </button>
          </div>

          <CrossTableView
            table={T} rowsTitle="Régime" colsTitle="Sport"
            highlight={isInterne ? { axis: 'row', key: 'interne' } : { axis: 'col', key: 'club' }}
            caption={isInterne
              ? 'Univers restreint aux 200 internes (ligne mise en évidence)'
              : 'Univers restreint aux 450 élèves en club (colonne mise en évidence)'}
          />

          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-4">
            <div className="text-center">
              <MathText>{isInterne
                ? '$$P_{\\text{interne}}(\\text{club}) = \\frac{150}{200} = 0{,}75$$'
                : '$$P_{\\text{club}}(\\text{interne}) = \\frac{150}{450} \\approx 0{,}33$$'}</MathText>
            </div>
          </div>

          {done1 ? (
            <Feedback tone="ok">
              Trois quarts des internes sont en club, mais seul un tiers des élèves en club sont internes.
              <strong> {formatPercent(0.75, 0)} contre {formatPercent(150 / 450, 0)}</strong> — et pourtant les
              150 élèves du numérateur sont exactement les mêmes. Échanger les rôles de la condition et de
              l’événement, c’est changer d’univers : les deux nombres n’ont aucune raison d’être égaux.
            </Feedback>
          ) : null}
          {/* La bascule vient de montrer les deux nombres côte à côte : on peut
              maintenant poser la règle, puis le moyen de la retenir — avant la
              question de l'étape 2, qui l'exige sur un exemple hors du lycée. */}
          {done1 && (
            <KnowledgeBrick
              id="inversion"
              variant="new"
              lead={<>Tu viens de basculer la condition et d’obtenir <strong>75 %</strong> puis <strong>33 %</strong> avec les mêmes 150 élèves au numérateur. Voilà la règle que ce basculement vient de démontrer.</>}
            />
          )}
          {done1 && (
            <KnowledgeBrick
              id="mem-indice"
              variant="new"
              compact
              lead={<>Et le repère pour ne plus jamais se tromper de sens, en regardant simplement où est écrit l’indice.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">Essaie l’autre sens du conditionnement pour comparer.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’erreur d’inversion, hors du lycée',
      done: done2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
            « <strong>La plupart des accidents graves ont lieu à moins de 15 km du domicile.</strong> Donc
            s’éloigner de chez soi est plus sûr. »
          </div>
          <TapQuestion
            prompt="Pourquoi ce raisonnement est-il faux ?"
            options={[
              'Il confond P(près de chez soi | accident) et P(accident | près de chez soi)',
              'Les statistiques citées sont inventées',
              'Il faudrait connaître le nombre total d’accidents',
              'Le raisonnement est juste',
            ]}
            correct={0} cols={1}
            requires={['inversion', 'mem-indice', 'notation-sachant', 'univers-restreint', 'probabilite']}
            explain="La statistique porte sur l’univers des ACCIDENTS : parmi eux, beaucoup sont proches du domicile. Mais la question du risque porte sur l’univers des TRAJETS : la plupart des trajets sont eux aussi proches du domicile. On a inversé la condition — exactement ce que tu viens de faire avec les internes et les clubs."
            explainWrong="Le problème n’est pas la fiabilité des chiffres : c’est le sens du conditionnement. Un pourcentage calculé parmi les accidents ne dit rien du risque par trajet."
            solved={done2} onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Ne jamais retourner la condition" moduleSubtitle="P_A(B) et P_B(A) sont deux questions" estimatedTime="14 min"
      brief={{
        tag: 'Découverte', title: 'Même numérateur, deux réponses', tone: 'sky',
        body: <p>Échanger la condition et l’événement semble anodin. C’est pourtant l’erreur de raisonnement la plus répandue avec les probabilités — et tu vas la voir en direct.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Retenu.</strong> <MathText>{'$P_A(B) \\neq P_B(A)$'}</MathText> en général : l’indice change,
          donc l’univers change. Module suivant : le lien avec les fréquences conditionnelles vues en
          statistiques.
        </KnowledgeSnapshot>
      )}
    />
  );
}
