import React, { useState } from 'react';
import { Table2, TrendingDown } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TableLab from '../components/TableLab';
import { fmt, multiplier } from '../components/operations';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : prolonger une colonne
 * de la table de multiplication (components/TableLab.jsx).
 *
 * Activity              compléter, case par case, la colonne de −3 puis de 4,
 *                       en descendant sous le zéro.
 * Mathematical objective la règle des signes n'est pas une convention : c'est
 *                       la SEULE façon de prolonger la table sans casser sa
 *                       régularité.
 * Student action        choisir la valeur de la case suivante parmi trois.
 * Controlled variable   une seule case à la fois, celle du bas.
 * Mathematical state    la colonne révélée, et l'écart entre cases voisines.
 * Visual consequence    l'écart s'affiche à droite, en vert s'il est constant,
 *                       en rouge s'il ne l'est plus.
 * Expected observation  « l'écart reste +3, donc sous le zéro la case DOIT
 *                       être positive » — puis, avec la colonne de 4, « ici
 *                       l'écart est −4, donc la case doit être négative ».
 * Misconception targeted « − × − = − », par analogie avec « − + − = − ».
 * Formalization         la règle des signes n'est PAS énoncée ici : elle est
 *                       posée au module 2, une fois la table complète.
 * Transfer              module 2 : les quatre cas, écrits.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage.
 */
const LIGNE_A = -3;      // colonne dont les cases négatives deviennent POSITIVES
const LIGNE_B = 4;       // colonne dont les cases négatives restent NÉGATIVES
const K_MAX = 3;
const K_MIN = -3;

/** Trois choix : la bonne valeur, son opposée, et la somme (piège classique). */
const choixPour = (ligne, k) => {
  const bon = multiplier(ligne, k);
  const set = [bon, -bon, ligne + k];
  return [...new Set(set)].sort((a, b) => a - b);
};

export default function Module01ProlongerLaTable() {
  const [predA, setPredA] = useState(null);

  // Étape 1 — la colonne de −3.
  const [kA, setKA] = useState(0);        // cases révélées jusqu'à k = kA (inclus)
  const [errA, setErrA] = useState(null);
  const doneA = kA <= K_MIN;

  // Étape 2 — la colonne de 4.
  const [kB, setKB] = useState(0);
  const [errB, setErrB] = useState(null);
  const doneB = kB <= K_MIN;

  const [q3, setQ3] = useState(false);

  const choisir = (ligne, k, setK, setErr, react) => (valeur) => {
    if (valeur === multiplier(ligne, k)) {
      setErr(null);
      setK(k);
      react?.(true);
    } else {
      setErr(valeur);
      react?.(false);
    }
  };

  const kCourantA = kA - 1;
  const kCourantB = kB - 1;

  const steps = [
    {
      num: 1,
      title: `Prolonge la colonne de ${fmt(LIGNE_A)}`,
      subtitle: 'Le haut est déjà rempli. Choisis la valeur qui continue la colonne, case après case.',
      done: doneA,
      content: (kit) => (
        <div className="space-y-3">
          <TableLab
            ligne={LIGNE_A}
            kMax={K_MAX} kMin={K_MIN}
            remplisJusqua={kA}
            choix={doneA ? [] : choixPour(LIGNE_A, kCourantA)}
            onChoisir={choisir(LIGNE_A, kCourantA, setKA, setErrA, kit.react)}
            erreur={errA}
          />
          <PredictionChips
            prompt={`Avant d’aller sous le zéro : à ton avis, que vaudra ${fmt(LIGNE_A)} × ${fmt(-1)} ?`}
            options={[
              { id: 'neg', label: fmt(-3) },
              { id: 'pos', label: '3' },
              { id: 'zero', label: '0' },
            ]}
            value={predA}
            onChange={setPredA}
            disabled={doneA}
          />
          {doneA ? (
            <Feedback tone="ok">
              {predA === 'pos' ? 'Ta prédiction tenait' : 'Regarde la colonne d’écarts'} : d’une case
              à la suivante, on ajoute toujours <strong>3</strong>. Cet écart ne change pas au
              passage du zéro — alors <strong>{fmt(LIGNE_A)} × {fmt(-1)} vaut 3</strong>, et{' '}
              {fmt(LIGNE_A)} × {fmt(-3)} vaut 9. Multiplier deux nombres négatifs donne un résultat{' '}
              <strong>positif</strong>, non par convention, mais parce que c’est la seule valeur qui
              ne casse pas la table.
            </Feedback>
          ) : errA !== null ? (
            <Feedback tone="warn">
              Avec {fmt(errA)}, l’écart avec la case du dessus ne vaut plus 3 : la colonne perd sa
              régularité. Regarde la colonne « Écart » et cherche la valeur qui la garde constante.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Observe la colonne « Écart » : combien ajoute-t-on à chaque descente d’une case ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: `Et maintenant, la colonne de ${fmt(LIGNE_B)}`,
      subtitle: 'Même exercice, mais la ligne est positive cette fois. L’écart va-t-il dans le même sens ?',
      done: doneB,
      content: (kit) => (
        <div className="space-y-3">
          <TableLab
            ligne={LIGNE_B}
            kMax={K_MAX} kMin={K_MIN}
            remplisJusqua={kB}
            choix={doneB ? [] : choixPour(LIGNE_B, kCourantB)}
            onChoisir={choisir(LIGNE_B, kCourantB, setKB, setErrB, kit.react)}
            erreur={errB}
          />
          {doneB ? (
            <Feedback tone="ok">
              Ici l’écart vaut <strong>{fmt(-4)}</strong> : en descendant, on <em>retire</em> 4 à
              chaque fois. Sous le zéro, la colonne devient donc <strong>négative</strong> —{' '}
              {fmt(LIGNE_B)} × {fmt(-3)} = {fmt(multiplier(LIGNE_B, -3))}. Les deux colonnes suivent
              la même logique et donnent pourtant des signes opposés : tout dépend du{' '}
              <strong>signe de la ligne</strong>.
            </Feedback>
          ) : errB !== null ? (
            <Feedback tone="warn">
              Avec {fmt(errB)}, l’écart n’est plus constant. Attention : cette colonne{' '}
              <strong>descend</strong>, contrairement à la précédente.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cette fois la ligne est positive. Regarde bien le sens de l’écart avant de choisir.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que la table impose',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Les deux colonnes viennent d'être prolongées, écart à l'appui :
              on peut nommer la régularité avant la question qui l'exige. */}
          <KnowledgeBrick
            id="regularite-table"
            variant="new"
            lead={<>Tu viens de prolonger deux colonnes en gardant leur écart constant, et d’obtenir des signes opposés. Ce qui t’a guidé porte un nom.</>}
          />
          <TapQuestion
            prompt={`Pourquoi ${fmt(-3)} × ${fmt(-1)} vaut-il 3, et non ${fmt(-3)} ?`}
            options={[
              'Parce que c’est la seule valeur qui garde l’écart de la colonne constant',
              'Parce que c’est une convention que les mathématiciens ont choisie',
              'Parce que deux signes − s’annulent toujours à l’écrit',
              'Parce qu’on ne peut pas écrire de résultat négatif ici',
            ]}
            correct={0}
            cols={1}
            requires={['regularite-table']}
            explain="La colonne descend de 3 en 3 : …, −6, −3, 0, puis nécessairement 3. Toute autre valeur briserait la régularité qui vaut pour toute la table. La règle n’est pas décidée — elle est imposée."
            explainWrong="Ce n’est pas une convention arbitraire, et deux signes ne « s’annulent » pas par magie d’écriture : c’est la régularité de la table, que tu viens de suivre case après case, qui force cette valeur."
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
      moduleTitle="Prolonger la table"
      moduleSubtitle="Quand la régularité décide à ta place"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'La table ne s’arrête pas à zéro',
        tone: 'indigo',
        body: (
          <p>
            Tu connais la table de multiplication depuis longtemps — mais seulement pour les nombres
            positifs. Que se passe-t-il si on la <strong>prolonge sous le zéro</strong> ? À toi de
            la continuer.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Table2, t: 'La colonne', d: 'Le haut est rempli : ce sont les produits que tu connais.', c: 'text-indigo-600' },
            { icon: TrendingDown, t: 'L’écart', d: 'La 3ᵉ colonne : ce qu’on ajoute d’une case à la suivante.', c: 'text-emerald-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
