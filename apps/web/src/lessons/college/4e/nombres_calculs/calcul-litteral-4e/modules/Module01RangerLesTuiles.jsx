import React, { useState } from 'react';
import { Layers, Undo2, RotateCcw } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import {
  TileBoard, TileLegend, term, collectLikeTerms, likeTermIndices, isReduced,
  reduceTerms, texTerms, texExpr, ratToNumber,
} from '../../../../../common/algebra4e';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : ranger des tuiles
 * algébriques (common/algebra4e/TileBoard.jsx).
 *
 * Activity              sélectionner une tuile, puis « Regrouper » : toutes
 *                       ses semblables fusionnent en une seule.
 * Mathematical objective réduire une expression, c'est ADDITIONNER LES
 *                       TERMES SEMBLABLES — et rien d'autre. 3x + 2x fait 5x
 *                       parce que trois objets et deux objets du même type
 *                       font cinq objets ; 3x + 2 ne fait rien de plus court.
 * Student action        un tap sur une tuile, un tap sur « Regrouper ».
 * Controlled variable   la liste des termes, et elle seule.
 * Mathematical state    `termes` — détenu ICI, avec son HISTORIQUE. Le
 *                       plateau est un composant contrôlé : il rend un état
 *                       et signale un geste, il n'en détient aucun. C'est ce
 *                       qui rend « Annuler » et « Recommencer » possibles, et
 *                       ce qui immunise la manipulation aux remontages.
 * Visual consequence    les tuiles semblables s'éclairent ensemble ; après le
 *                       regroupement une seule tuile porte le total, et
 *                       l'écriture symbolique sous le plateau suit.
 * Expected observation  « les bleues vont avec les bleues, les grises avec
 *                       les grises — et jamais l'inverse ».
 * Misconception targeted « 3x + 2 = 5x ». Le bouton « Regrouper » ne peut
 *                       PAS produire cette fusion : ce n'est pas interdit par
 *                       un message d'erreur, c'est impossible par
 *                       construction.
 * Formalization         AUCUNE ici : les mots « terme semblable »,
 *                       « coefficient » et « réduire » sont posés au module 2.
 * Transfer              module 3 : réduire devient l'étape finale de tout
 *                       développement.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage.
 */

/** L'expression de départ : deux familles mêlées, volontairement en désordre. */
const DEPART = [term(3, true), term(2), term(-5, true), term(4), term(1, true)];

/** La seconde, qui ne PEUT PAS se réduire à un seul terme. */
const DEPART_B = [term(4, true), term(3)];

export default function Module01RangerLesTuiles() {
  const [pred, setPred] = useState(null);

  // Étape 1 — l'état ET son historique : « Annuler » exige de garder le passé,
  // pas de recalculer un inverse (brief §7).
  const [histA, setHistA] = useState([DEPART]);
  const [selA, setSelA] = useState(null);
  const termesA = histA[histA.length - 1];
  const doneA = isReduced(termesA);

  // Étape 2 — la fusion impossible.
  const [selB, setSelB] = useState(null);
  const [essaiB, setEssaiB] = useState(0);
  const doneB = essaiB >= 2;

  const [q3, setQ3] = useState(false);

  const semblablesA = selA === null ? [] : likeTermIndices(termesA, selA);
  const peutRegrouper = semblablesA.length > 1;

  const regrouper = (react) => {
    if (selA === null || !peutRegrouper) return;
    const next = collectLikeTerms(termesA, selA);
    setHistA([...histA, next]);
    setSelA(null);
    react?.(true);
  };

  const Bouton = ({ onClick, disabled, icon: Icon, children, tone = 'slate' }) => {
    const TONES = {
      blue: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',
      slate: 'border-slate-300 bg-white text-slate-600 hover:border-slate-500',
    };
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 px-3.5 text-sm font-bold transition-colors disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${TONES[tone]}`}
      >
        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
        {children}
      </button>
    );
  };

  const steps = [
    {
      num: 1,
      title: 'Range les tuiles',
      subtitle: 'Sélectionne une tuile : ses semblables s’éclairent. Regroupe-les, jusqu’à ce qu’il n’y ait plus rien à ranger.',
      done: doneA,
      content: (kit) => (
        <div className="space-y-3">
          <TileLegend />

          <TileBoard
            terms={termesA}
            selected={selA}
            onSelect={setSelA}
            label="Ton expression"
          />

          {/* L'écriture symbolique DÉRIVE du même état que les tuiles — jamais
              un second état tenu à la main (CLAUDE.md §8). */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-center">
            <MathText>{`$${texTerms(termesA)}$`}</MathText>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Bouton
              onClick={() => regrouper(kit.react)}
              disabled={!peutRegrouper}
              icon={Layers}
              tone="blue"
            >
              Regrouper
            </Bouton>
            <Bouton
              onClick={() => { setHistA(histA.slice(0, -1)); setSelA(null); }}
              disabled={histA.length <= 1}
              icon={Undo2}
            >
              Annuler
            </Bouton>
            <Bouton
              onClick={() => { setHistA([DEPART]); setSelA(null); }}
              disabled={histA.length <= 1}
              icon={RotateCcw}
            >
              Recommencer
            </Bouton>
          </div>

          {doneA ? (
            <Feedback tone="ok">
              {pred === 'deux' ? 'Ta prédiction tenait' : 'Regarde ce qu’il reste'} : il ne reste
              plus que <strong>deux</strong> tuiles —{' '}
              <MathText>{`$${texExpr(reduceTerms(termesA))}$`}</MathText>. On ne peut pas aller plus
              loin, parce que les tuiles bleues et les tuiles grises ne sont{' '}
              <strong>pas les mêmes objets</strong>. L’expression est déjà dans sa forme la plus
              courte. Tu peux recommencer et ranger dans un autre ordre : le résultat sera le même.
            </Feedback>
          ) : selA !== null && !peutRegrouper ? (
            <Feedback tone="info">
              Cette tuile n’a plus de semblable : il n’y a rien à regrouper avec elle. Choisis-en une
              autre.
            </Feedback>
          ) : selA !== null ? (
            <Feedback tone="info">
              {semblablesA.length} tuiles sont éclairées : ce sont celles de{' '}
              <strong>même nature</strong> que ta sélection. Appuie sur « Regrouper ».
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche une tuile pour voir ses semblables s’éclairer.
            </Feedback>
          )}

          <PredictionChips
            prompt="Avant de finir : combien de tuiles resteront-ils à la fin, d’après toi ?"
            options={[
              { id: 'une', label: 'Une seule' },
              { id: 'deux', label: 'Deux' },
              { id: 'cinq', label: 'Les cinq' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={doneA}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Essaie de regrouper celles-ci',
      subtitle: 'Quatre tuiles x et trois tuiles unité. Tente de tout réunir en une seule.',
      done: doneB,
      content: (kit) => (
        <div className="space-y-3">
          <TileBoard
            terms={DEPART_B}
            selected={selB}
            onSelect={(i) => {
              setSelB(i);
              const n = essaiB + 1;
              setEssaiB(n);
              if (n === 2) kit.react(true);
            }}
            label="Peut-on faire plus court ?"
          />
          {doneB ? (
            <Feedback tone="ok">
              Quelle que soit la tuile choisie, elle n’a <strong>aucune semblable</strong> : il n’y a
              rien à regrouper. <MathText>{'$4x + 3$'}</MathText> est déjà terminé — ce n’est pas
              une expression « à finir », c’est un résultat. Écrire 7x serait faux : pour x = 10, la
              vraie valeur est 43, pas 70.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche une tuile, puis l’autre. Regarde si quelque chose s’éclaire à côté.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que les tuiles imposent',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Deux plateaux viennent d'être rangés, dont un qui refusait de se
              réduire : on peut nommer le constat avant la question. */}
          <KnowledgeBrick
            id="ce-qui-se-regroupe"
            variant="new"
            lead={<>Tu viens de ranger un plateau jusqu’au bout, puis d’en rencontrer un qui refusait d’aller plus loin. La différence entre les deux a une raison.</>}
          />
          <TapQuestion
            prompt={<span>Pourquoi <MathText>{'$3x + 2$'}</MathText> ne peut-il pas s’écrire <MathText>{'$5x$'}</MathText> ?</span>}
            options={[
              'Parce que les x et les unités ne sont pas des objets de même nature',
              'Parce qu’il faudrait d’abord connaître la valeur de x',
              'Parce qu’on ne peut jamais additionner dans une expression avec une lettre',
              'Parce que 3 + 2 ne fait pas 5',
            ]}
            correct={0}
            cols={1}
            requires={['ce-qui-se-regroupe']}
            explain="Une tuile x et une tuile unité ne comptent pas la même chose : les réunir n’a pas plus de sens que d’additionner des pommes et des kilomètres. Vérification : pour x = 10, 3x + 2 vaut 32, alors que 5x vaudrait 50."
            explainWrong="Ce n’est pas une question de valeur de x : l’expression 3x + 2 est correcte et complète telle quelle, pour TOUTE valeur de x. Et les x entre eux, eux, s’additionnent très bien — c’est ce que tu viens de faire."
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Ranger les tuiles"
      moduleSubtitle="Ce qui se regroupe, et ce qui refuse"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un sac d’objets à trier',
        tone: 'indigo',
        body: (
          <p>
            Une expression littérale, c’est un <strong>sac d’objets</strong>. Certains se rangent
            ensemble, d’autres non — et c’est le rangement lui-même qui va te dire pourquoi.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
