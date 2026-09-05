import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion } from '../../../../../common/kit';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExpressionBuilder from '../components/ExpressionBuilder';
import { TROTTINETTE as T, RESERVOIR as R } from '../components/situationsData';
import { evaluate, parseTokens, sameFunction, formatDec } from '../components/modelUtils';

/**
 * Module 5 — FORMALISATION : « Modéliser, c'est traduire ».
 *
 * Activity: assembler par cartes l'expression du prix de la trottinette, puis
 *   celle du réservoir ; nommer chaque paramètre dans le contexte ; lire le
 *   cycle de modélisation ; trier des affirmations.
 * Mathematical objective: traduire une situation en expression littérale (et
 *   en fonction), interpréter chaque nombre de l'expression (0,15 = prix par
 *   minute, 1 = déblocage, 60 = volume initial, −5 = débit) ; formaliser le
 *   cycle situation → grandeurs → variable → relation → représentation →
 *   calcul → interprétation → vérification.
 * Student action: toucher des cartes, vérifier ; répondre.
 * Mathematical state: `tokens` ; l'expression est PARSÉE (parseTokens) et
 *   comparée à la cible sur plusieurs valeurs (sameFunction) — deux ordres
 *   équivalents sont acceptés.
 * Misconception targeted: lire 0,15 comme « le prix » ; écrire t + 1 ;
 *   confondre f(t) et t.
 */

const MAX_ATTEMPTS = 3;
const TARGET_T = (t) => evaluate(T.model, t);
const TARGET_R = (t) => evaluate(R.model, t);

function useBuilder(target, variable, solution) {
  const [tokens, setTokens] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [msg, setMsg] = useState(null);
  const tap = (c) => { if (!done) { setTokens((t) => [...t, c]); setMsg(null); } };
  const back = () => { if (!done) { setTokens((t) => t.slice(0, -1)); setMsg(null); } };
  const check = (react) => {
    const fn = parseTokens(tokens, variable);
    const ok = sameFunction(fn, target);
    const n = attempts + 1;
    react?.(ok);
    if (ok) { setDone(true); setMsg({ tone: 'ok' }); return; }
    if (n >= MAX_ATTEMPTS) { setTokens(solution); setDone(true); setMsg({ tone: 'info', revealed: true }); return; }
    setAttempts(n);
    setMsg({ tone: 'ko', malformed: fn === null, left: MAX_ATTEMPTS - n, sample: fn ? { x: 10, got: fn(10), want: target(10) } : null });
  };
  return { tokens, tap, back, check, done, msg };
}

export default function Module05Traduire() {
  const b1 = useBuilder(TARGET_T, 't', ['1', '+', '0,15', '×', 't']);
  const b2 = useBuilder(TARGET_R, 't', ['60', '−', '5', '×', 't']);
  const [paramsDone, setParamsDone] = useState(false);
  const [fnDone, setFnDone] = useState(false);
  const [cycleDone, setCycleDone] = useState(false);

  const builder = (b, cards, lhs, kit, unit) => (
    <div className="space-y-3">
      <ExpressionBuilder cards={cards} tokens={b.tokens} onTap={b.tap} onBackspace={b.back} lhs={lhs} disabled={b.done} />
      {!b.done && <ValidateButton onClick={() => b.check(kit.react)} disabled={b.tokens.length === 0} tone="indigo">Vérifier mon expression</ValidateButton>}
      {b.msg?.tone === 'ko' && (
        <Feedback tone="ko">
          {b.msg.malformed ? 'L’expression est mal formée (un opérateur en trop ou manquant).' : <>Pour t = 10, ton expression donne <strong>{formatDec(b.msg.sample.got)}</strong> {unit} ; la situation donne <strong>{formatDec(b.msg.sample.want)}</strong> {unit}.</>}{' '}
          Encore {b.msg.left} essai{b.msg.left > 1 ? 's' : ''}.
        </Feedback>
      )}
      {b.msg?.revealed && <Feedback tone="info">Pas grave, on te la montre : l’expression correcte est écrite ci-dessus.</Feedback>}
    </div>
  );

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Modéliser, c’est traduire"
      moduleSubtitle="Construis l’expression par cartes, nomme ses paramètres — et le cycle complet."
      estimatedTime="9 min"
      brief={{
        tag: '🔤 Mission 05',
        title: 'Écrire la règle',
        tone: 'violet',
        body: (
          <p>
            « 1 € de déblocage, puis 0,15 € par minute. » Tu sais ce que ça vaut pour 5, 10, 35 minutes. Écris
            maintenant la règle pour <em>n’importe quelle</em> durée t, avec des cartes.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'La trottinette, en lettres',
          subtitle: 'Assemble : prix = … (t est la durée en minutes).',
          done: b1.done,
          content: (kit) => (
            <div className="space-y-3">
              {builder(b1, ['1', '0,15', 't', '+', '×', '60', '−'], 'prix', kit, '€')}
              {b1.done && (
                <Feedback tone="ok">
                  <MathText>{'$\\text{prix} = 0{,}15 \\times t + 1$'}</MathText> — ou 1 + 0,15 × t, c’est la même fonction. L’expression dit tout en une ligne :
                  ce qu’on paie quelle que soit la durée.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Que dit chaque nombre ?',
          subtitle: 'Un paramètre a toujours un sens dans la situation.',
          done: paramsDone,
          content: (
            <BatchChoiceQuestion
              intro={<p className="text-sm text-slate-700">Dans <MathText>{'$\\text{prix} = 0{,}15 \\times t + 1$'}</MathText> :</p>}
              rows={[
                { id: 'a', label: '0,15 représente…', options: ['le prix d’une minute', 'le prix du trajet', 'le déblocage'], correct: 0, correction: 'Ce qui s’ajoute pour chaque minute.' },
                { id: 'b', label: '1 représente…', options: ['le déblocage, payé même pour 0 min', 'la première minute', 'le nombre de trajets'], correct: 0, correction: 'La part fixe : f(0) = 1.' },
                { id: 'c', label: 't représente…', options: ['la durée, qu’on choisit', 'le prix', 'le tarif'], correct: 0, correction: 'La variable.' },
                { id: 'd', label: 'Pour la trottinette, la fonction f : t ↦ 0,15t + 1 est…', options: ['affine', 'linéaire', 'ni l’une ni l’autre'], correct: 0, correction: 'a = 0,15 et b = 1 ≠ 0.' },
              ]}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} Un modèle se lit : le coefficient est un taux (par minute, par km, par personne), la
                  part fixe est ce qu’on paie pour 0. Écrit comme fonction, prix = f(t) avec f(t) = 0,15t + 1.
                </Feedback>
              )}
              solved={paramsDone}
              onAnswered={() => setParamsDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Le réservoir, en lettres',
          subtitle: '60 L au départ, −5 L par minute. Assemble : volume = …',
          done: b2.done && fnDone,
          content: (kit) => (
            <div className="space-y-3">
              {builder(b2, ['60', '5', 't', '−', '+', '×', '12'], 'volume', kit, 'L')}
              {b2.done && (
                <TapQuestion
                  prompt="Avec g(t) = 60 − 5t, que représente g(8) ?"
                  options={['Le volume restant après 8 minutes : 20 L', 'Le temps pour vider 8 L', 'La vitesse de vidage']}
                  correct={0}
                  cols={1}
                  explain="g(8) = 60 − 40 = 20 : l’image de 8 est le volume à la minute 8. Écrire le modèle comme une fonction permet de parler de g(8), de g(12) = 0, de l’antécédent de 30 (t = 6)…"
                  solved={fnDone}
                  onAnswered={() => setFnDone(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'À retenir : le cycle',
          subtitle: 'Ce que tu fais depuis le module 1, en une boucle.',
          done: cycleDone,
          content: (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 space-y-2 text-sm text-slate-800">
                <p className="font-bold text-violet-900">Modéliser, c’est traduire une situation en mathématiques pour raisonner dessus.</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li><strong>Situation</strong> : trier les informations utiles.</li>
                  <li><strong>Grandeurs</strong> : nommer la variable et ce qui en dépend.</li>
                  <li><strong>Relation</strong> : la règle d’accord avec toutes les données (proportionnelle, affine, en carré… ou aucune).</li>
                  <li><strong>Représentation</strong> : tableau, graphique, expression / fonction — selon la question.</li>
                  <li><strong>Calcul</strong> : prévoir, résoudre.</li>
                  <li><strong>Interprétation</strong> : revenir à la situation, avec les unités.</li>
                  <li><strong>Vérification</strong> : cohérence, ordre de grandeur, limites du modèle.</li>
                </ol>
              </div>
              <TapQuestion
                prompt="Un modèle donne « 6,25 » pour un trajet de 35 min. Quelle étape du cycle manque encore ?"
                options={['L’interprétation : 6,25 €, à comparer au prix réel', 'Le calcul : il faut recommencer', 'Rien : 6,25 est la réponse']}
                correct={0}
                cols={1}
                explain="Un nombre nu n’est pas une réponse. 6,25 est un prix en euros, à confronter au ticket — et à douter si l’application affiche autre chose."
                solved={cycleDone}
                onAnswered={() => setCycleDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          L’expression littérale est la forme la plus compacte d’un modèle : un nombre par paramètre, chacun avec son sens.
          Le module suivant fait travailler la fin du cycle — prévoir, interpréter, douter.
        </Feedback>
      }
    />
  );
}
