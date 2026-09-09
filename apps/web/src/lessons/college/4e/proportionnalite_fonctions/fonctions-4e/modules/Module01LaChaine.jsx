import React, { useState } from 'react';
import { Link2, ArrowUpDown } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProgrammeLab from '../components/ProgrammeLab';
import {
  programme, trace, inverser, remonter, frRat, programmeTexte, raisonNonInversible,
} from '../components/fonctions4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              faire descendre un nombre le long d'une chaîne de
 *                       cases, case par case, puis attraper la sortie et
 *                       remonter jusqu'à l'entrée.
 * Mathematical objective un programme de calcul est une CHAÎNE ORIENTÉE. On
 *                       la descend, et — parce qu'elle est orientée — on peut
 *                       aussi la remonter : l'ordre se retourne ET chaque
 *                       opération se défait.
 * Student action        glisser l'entrée cran par cran ; basculer le sens de
 *                       parcours ; essayer la chaîne « × 0 ».
 * Controlled variable   l'entrée, et le sens. Les étapes sont fixes.
 * Mathematical state    (prog, x, sens). Chaque valeur intermédiaire, la
 *                       chaîne inverse et le verdict de l'aller-retour sont
 *                       DÉRIVÉS par `trace` et `inverser`.
 * Visual consequence    chaque case affiche la valeur qui en sort ; en
 *                       remontée, les cases se renversent et leurs opérations
 *                       changent de nature sous les yeux.
 * Expected observation  « ce n'est pas la même chaîne écrite à l'envers —
 *                       l'ORDRE aussi s'est retourné ».
 * Misconception targeted remonter sans retourner l'ordre (« ÷3 puis −2 ») ;
 *                       croire qu'un programme est une recette à sens unique.
 * Feedback              on cite les nombres que l'élève vient de produire.
 * Formalization         « programme de calcul » est un ACQUIS de 5e, rappelé
 *                       ici ; la FORMULE (M3), le tableau muet (M4), le
 *                       graphique (M5) et la modélisation (M6) attendent.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur, comme une invitation, jamais comme un péage.
 */

/** La chaîne du module : « ×3 puis +2 ». Deux étapes, assez pour que
 *  l'ORDRE compte, assez peu pour qu'on la tienne en tête. */
const CHAINE = programme(['×', 3], ['+', 2]);
/** Le contre-exemple : une case « ×0 » écrase toutes les entrées. */
const CHAINE_ZERO = programme(['×', 0], ['+', 2]);

const X_DEPART = 4;
const SORTIE_DEPART = trace(CHAINE, X_DEPART).arrivee; // 14
/** La sortie de l'étape 4 : 7 entre, 23 sort. */
const SORTIE_SEPT = trace(CHAINE, 7).arrivee;

export default function Module01LaChaine() {
  // ── État mathématique unique du labo ──────────────────────────────
  const [x, setX] = useState(X_DEPART);
  const [sens, setSens] = useState('descente');
  const [xZero, setXZero] = useState(4);

  const [pred, setPred] = useState(null);
  const [vus, setVus] = useState([X_DEPART]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  const voir = (v) => {
    setX(v);
    setVus((liste) => (liste.includes(v) ? liste : [...liste, v]));
  };

  // Étape 1 — trois entrées différentes descendues.
  const done1 = vus.length >= 3;
  // Étape 2 — la chaîne a été remontée au moins une fois.
  const [remonte, setRemonte] = useState(false);
  const changerSens = (s) => {
    setSens(s);
    if (s === 'remontee') setRemonte(true);
  };
  const done2 = remonte;

  const lab = (
    <ProgrammeLab
      prog={CHAINE}
      x={x}
      onX={voir}
      min={-10}
      max={20}
      sens={sens}
      onSens={changerSens}
    />
  );

  const inverse = inverser(CHAINE);

  const steps = [
    {
      num: 1,
      title: 'Fais descendre un nombre',
      subtitle: 'Glisse l’entrée, et regarde le nombre traverser les cases une à une.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Une chaîne de deux cases : {programmeTexte(CHAINE)}. Fais entrer{' '}
            <strong>trois nombres différents</strong> et regarde ce qui sort de chaque case — pas
            seulement le résultat final.
          </p>
          <PredictionChips
            prompt="Avant de glisser : si le nombre qui entre double, la sortie double-t-elle aussi ?"
            options={[
              { id: 'oui', label: 'Oui, elle double' },
              { id: 'non', label: 'Non, pas tout à fait' },
              { id: 'depend', label: 'Ça dépend du nombre' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {vus.length > 0 && vus.length < 3 && (
            <Feedback tone="info">
              {vus.length} nombre{vus.length > 1 ? 's' : ''} essayé{vus.length > 1 ? 's' : ''}.
              Glisse l’entrée pour en essayer {3 - vus.length} de plus — et essaie donc 0, ou un
              nombre négatif.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              La chaîne ne change pas : c’est toujours {programmeTexte(CHAINE)}. Seul le nombre qui
              y entre change.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Maintenant, remonte-la',
      subtitle: 'Attrape la sortie et tire-la vers le haut : la chaîne se retourne.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            On connaît la sortie, on cherche l’entrée. Appuie sur{' '}
            <strong>« Remonter la chaîne »</strong> et observe ce que deviennent les cases.
          </p>
          <ProgrammeLab
            prog={CHAINE}
            x={x}
            onX={voir}
            min={-10}
            max={20}
            sens={sens}
            onSens={(s) => {
              changerSens(s);
              if (s === 'remontee') kit.react?.(true);
            }}
          />
          {done2 && (
            <Feedback tone="ok">
              Regarde bien : ce n’est pas la chaîne écrite à l’envers. En descendant on fait «{' '}
              {CHAINE.map((e) => `${e.op}${frRat(e.val)}`).join(' puis ')} », en remontant on fait
              « {inverse.map((e) => `${e.op}${frRat(e.val)}`).join(' puis ')} ». L’<strong>ordre</strong>{' '}
              aussi s’est retourné.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce qui a changé en remontant',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Pour remonter « ${programmeTexte(CHAINE)} », que fait-on ?`}
            options={[
              'On soustrait 2, PUIS on divise par 3',
              'On divise par 3, PUIS on soustrait 2',
              'On multiplie par 3, PUIS on soustrait 2',
              'On soustrait 2, PUIS on multiplie par 3',
            ]}
            correct={0}
            cols={1}
            requires={['programme-de-calcul']}
            explain={`Deux choses se retournent en même temps : chaque opération devient son contraire (× devient ÷, + devient −) ET l’ordre s’inverse. La dernière étape faite est la première à défaire. Essaie l’autre ordre sur 14 : ÷3 puis −2 donnerait ${frRat(trace(programme(['÷', 3], ['−', 2]), SORTIE_DEPART).arrivee)}, et non ${X_DEPART}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="chaine-orientee"
              variant="new"
              lead="Ce que tu viens de descendre puis de remonter porte un nom précis."
            />
          )}
          {q3 && (
            <KnowledgeBrick
              id="remonter-la-chaine"
              variant="new"
              lead="Et le geste du retour a sa propre règle."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Vérifie toi-même',
      subtitle: 'Une sortie, et une seule entrée possible.',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La chaîne {programmeTexte(CHAINE)} a rendu <strong>{frRat(SORTIE_SEPT)}</strong>.
            Remonte-la : quel nombre était entré ?
          </p>
          <NumericQuestion
            prompt="Le nombre qui était entré"
            expected={7}
            requires={['programme-de-calcul']}
            explain={`On remonte, en défaisant la DERNIÈRE étape d’abord : ${frRat(SORTIE_SEPT)} − 2 = ${frRat(trace(inverse.slice(0, 1), SORTIE_SEPT).arrivee)}, puis ${frRat(trace(inverse.slice(0, 1), SORTIE_SEPT).arrivee)} ÷ 3 = ${frRat(remonter(CHAINE, SORTIE_SEPT))}. Contrôle : on redescend ${frRat(remonter(CHAINE, SORTIE_SEPT))} et on retombe sur ${frRat(SORTIE_SEPT)}.`}
            explainFor={(n) => {
              if (n === 65) return 'Tu as descendu la chaîne au lieu de la remonter : 21 × 3 + 2 = 65. Ici on part de la SORTIE.';
              if (n === 21) return 'Tu as fait la première marche (− 2) et tu t’es arrêté. Il reste à défaire le « × 3 », donc à diviser par 3.';
              if (n === 5) return 'Tu as divisé par 3 d’abord, puis soustrait 2. L’ordre se retourne aussi : on défait d’abord la DERNIÈRE opération faite, le « + 2 ».';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'Une chaîne qui ne se remonte pas',
      subtitle: 'Change la première case pour « × 0 » et essaie.',
      done: q5,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Voici la même chaîne, mais sa première case multiplie par <strong>0</strong>. Fais
            entrer plusieurs nombres, et regarde la sortie.
          </p>
          <ProgrammeLab
            prog={CHAINE_ZERO}
            x={xZero}
            onX={setXZero}
            min={-10}
            max={20}
            sens="descente"
            labelSens={false}
          />
          <TapQuestion
            prompt="Pourquoi ne peut-on pas remonter cette chaîne-là ?"
            options={[
              'Parce que toutes les entrées donnent la même sortie : elle ne dit plus d’où on vient',
              'Parce que 0 est un nombre trop petit',
              'Parce qu’il y a une multiplication dans la chaîne',
              'Parce que la sortie est négative',
            ]}
            correct={0}
            cols={1}
            requires={['remonter-la-chaine']}
            explain={`Essaie 4, puis 9, puis −7 : la sortie vaut ${frRat(trace(CHAINE_ZERO, 4).arrivee)} à chaque fois. En partant de ${frRat(trace(CHAINE_ZERO, 4).arrivee)}, on ne peut pas dire par où on est passé — c’est la seule étape qu’on ne sait pas défaire.`}
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              Une question reste ouverte : cette chaîne de deux cases, peut-on la dire{' '}
              <strong>d’un seul trait</strong>, sans raconter les étapes ? C’est la suite.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="La chaîne"
      moduleSubtitle="On la descend, puis on la remonte — et l’ordre se retourne"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Un nombre entre, un nombre sort',
        tone: 'indigo',
        body: (
          <>
            En 5e, tu exécutais des programmes de calcul. Cette fois, tu vas les prendre{' '}
            <strong>à rebours</strong> : partir de ce qui sort pour retrouver ce qui était entré.
            Toutes les chaînes le permettent-elles ?
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            Glisse, observe, recommence. <ArrowUpDown className="inline h-4 w-4" aria-hidden="true" />{' '}
            Puis retourne la chaîne et regarde ce que chaque case devient.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
