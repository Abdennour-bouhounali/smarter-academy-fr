import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TreeExplorer from '../components/TreeExplorer';
import PartitionStrip from '../components/PartitionStrip';
import { TOTALES, FOURNISSEURS, FOURNISSEURS_TOTAL, fournisseursTable } from '../data';
import { ratValue, totalProbability, pathsTo, fr } from '../components/condUtils';

/**
 * Module 5 — PRACTICE LAB : LA FORMULE DES PROBABILITÉS TOTALES (P5).
 *
 * C'EST L'APPORT PROPRE DE LA PREMIÈRE, et il est absent du programme de 2de.
 * La 2de additionne des chemins parce qu'on lui dit de le faire. La Première
 * demande POURQUOI c'est licite, et la réponse est une condition vérifiable :
 * les cas doivent PARTITIONNER l'univers.
 *
 * COMMENT LA FORMULE EST DÉCOUVERTE, ET NON ÉNONCÉE. L'étape 1 ne montre pas
 * l'écriture : elle montre la BANDE DES 10 000 COMPOSANTS découpée par les
 * trois fournisseurs (components/PartitionStrip.jsx), avec la portion
 * défectueuse de chaque part. L'élève CONSTATE que les trois morceaux
 * défectueux recouvrent exactement les 370 pièces, sans trou ni chevauchement —
 * puis répond à la question « peut-on toujours faire cela ? » sur un
 * contre-exemple où les cas se chevauchent. Ce n'est qu'à l'étape 3, une fois
 * la condition comprise, que la ligne P(B) = Σ P(Aᵢ) × P_Aᵢ(B) est posée : elle
 * RÉSUME un geste déjà fait, elle ne l'introduit pas.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  voir les chemins recouvrir la bande → (la partition est déjà
 *            posée au module 4 ; on l'emploie)
 *   étape 2  le contre-exemple → brique `moyenne-nest-pas-la-somme-ponderee`
 *   étape 3  l'écriture → brique `probabilites-totales`, puis
 *            `methode-probabilites-totales`
 *   étape 4  application sur une situation neuve → brique
 *            `mem-partition-puis-somme`
 *
 * LA FIGURE N'EST JAMAIS FIGÉE : la bande et l'arbre restent explorables après
 * chaque validation.
 */
const T1 = TOTALES[0];
const T2 = TOTALES[1];
const T3 = TOTALES[2];
const TREE1 = T1.tree();
const TABLE1 = fournisseursTable();
const FIRST_LABELS = Object.fromEntries(FOURNISSEURS.map((f) => [f.id, f.label]));
const PATHS1 = pathsTo(TREE1, 'defectueux');
const TOTALE1 = totalProbability(TREE1, 'defectueux').total;

/** Les parts de la bande, dérivées des données — jamais recopiées. */
const PARTS = FOURNISSEURS.map((f, i) => ({
  id: f.id,
  label: f.label,
  count: f.count,
  hit: f.defectueux,
  color: ['#4f46e5', '#0284c7', '#c026d3'][i],
}));

export default function Module05LaFormuleDesProbabilitesTotales() {
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [lit, setLit] = useState([]);
  const [focusPart, setFocusPart] = useState(null);

  const toggle = (id) => setLit((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const steps = [
    {
      num: 1,
      title: 'Les chemins découpent la population',
      subtitle:
        'Voici les 10 000 composants en une seule bande, partagée entre les trois fournisseurs. Clique une part pour l’isoler et voir sa portion défectueuse.',
      done: q1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Si on met bout à bout les composants défectueux des trois fournisseurs, penses-tu retrouver EXACTEMENT tous les défectueux de l’atelier ?"
            options={[
              { id: 'exact', label: 'Oui, exactement : ni trou ni doublon' },
              { id: 'moins', label: 'Non, il en manquera' },
              { id: 'plus', label: 'Non, certains seront comptés deux fois' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={q1}
          />
          <PartitionStrip
            total={FOURNISSEURS_TOTAL}
            parts={PARTS}
            focus={focusPart}
            onFocus={setFocusPart}
            hitLabel="défectueux"
          />
          <NumericQuestion
            prompt={
              <>
                Additionne les composants défectueux des trois parts. Combien l’atelier en
                compte-t-il en tout ?
              </>
            }
            expected={TABLE1.colTotals.defectueux}
            display={String(TABLE1.colTotals.defectueux)}
            requires={['partition', 'somme-chemins', 'effectif']}
            explain={`${FOURNISSEURS.map((f) => f.defectueux).join(' + ')} = ${TABLE1.colTotals.defectueux}. Chaque composant appartient à un fournisseur et à un seul : en additionnant les trois portions, on recouvre tous les défectueux, sans en compter aucun deux fois.`}
            explainFor={(n) =>
              n === FOURNISSEURS[1].defectueux
                ? `C’est la portion du fournisseur 2 seule. Il faut y ajouter celles des deux autres : ${FOURNISSEURS.map((f) => f.defectueux).join(' + ')} = ${TABLE1.colTotals.defectueux}.`
                : `On additionne les trois portions colorées : ${FOURNISSEURS.map((f) => f.defectueux).join(' + ')} = ${TABLE1.colTotals.defectueux}.`
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="ok">
              {pred === 'exact' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde la bande'} :
              les trois portions recouvrent les {TABLE1.colTotals.defectueux} composants
              défectueux, exactement. Aucun composant n’est laissé de côté — il vient forcément d’un
              fournisseur — et aucun n’est compté deux fois — il n’en vient que d’un. C’est cette
              double garantie qui autorise l’addition.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand l’addition devient fausse',
      subtitle:
        'Deux façons de se tromper : découper la population sur des cas qui se chevauchent, ou oublier de peser les taux.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3 space-y-2 text-sm text-rose-900">
            <p className="font-bold">Un découpage qui n’en est pas un</p>
            <p className="text-xs">
              Dans un lycée, on veut la part d’élèves boursiers. On propose de découper les élèves
              en « ceux qui font du sport » et « ceux qui font de la musique ». Certains font les
              deux, d’autres ni l’un ni l’autre.
            </p>
          </div>
          <TapQuestion
            prompt="Pourquoi ce découpage interdit-il d’additionner les deux chemins ?"
            options={[
              'Parce que ces deux cas ne recouvrent pas tous les élèves, et que ceux qui font les deux seraient comptés deux fois',
              'Parce que le sport et la musique n’ont rien à voir avec les bourses',
              'Parce qu’il faudrait au moins trois cas pour additionner',
              'Parce qu’on ne connaît pas le nombre exact d’élèves',
            ]}
            correct={0}
            cols={1}
            requires={['partition', 'arbre-instrument']}
            explain="Il manque les élèves qui ne font ni l’un ni l’autre — ils échapperaient au calcul — et ceux qui font les deux apparaîtraient dans les deux chemins. Additionner suppose un recouvrement complet SANS chevauchement, et c’est exactement ce que les trois fournisseurs garantissaient."
            explainWrong="Le lien entre les cas et l’événement n’entre pas en jeu : ce qui compte est que chaque élève tombe dans un cas, et dans un seul. Ici, certains tombent dans deux, d’autres dans aucun."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <Feedback tone="ok">
                Second piège, plus discret : même sur un bon découpage, faire la MOYENNE des taux
                ({FOURNISSEURS.map((f) => f.taux).join(', ')}) donnerait {T1.moyennePiege}, contre{' '}
                {T1.display} en réalité. La moyenne suppose que les trois parts ont le même poids —
                or l’une en fait {FOURNISSEURS[0].part} à elle seule.
              </Feedback>
              <KnowledgeBrick
                id="moyenne-nest-pas-la-somme-ponderee"
                variant="new"
                lead={<>L’erreur la plus fréquente, une fois le découpage correct : oublier de peser.</>}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Écrire le geste en une ligne',
      subtitle:
        'Tu viens de le faire trois fois. Voici l’écriture qui le résume — avec sa condition d’emploi.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-rose-200 bg-white p-4 space-y-3">
            <p className="text-sm text-slate-700">
              Les trois chemins, écrits l’un sous l’autre, puis additionnés :
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm tabular-nums font-mono">
                <tbody>
                  {PATHS1.map((p) => (
                    <tr key={p.firstId} className="border-t border-slate-100">
                      <td className="px-2 py-1 text-left text-slate-600">{FIRST_LABELS[p.firstId]}</td>
                      <td className="px-2 py-1 text-right">
                        {fr(ratValue(p.p1), 2)} × {fr(ratValue(p.p2), 2)}
                      </td>
                      <td className="px-2 py-1 text-right">= {fr(ratValue(p.product), 3)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-rose-300 font-black text-rose-800">
                    <td className="px-2 py-1.5 text-left">total</td>
                    <td className="px-2 py-1.5" />
                    <td className="px-2 py-1.5 text-right">
                      = {fr(ratValue(TOTALE1), 3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-center">
              <MathText>{'$$P(B) = P(A_1)\\times P_{A_1}(B) + P(A_2)\\times P_{A_2}(B) + P(A_3)\\times P_{A_3}(B)$$'}</MathText>
            </div>
          </div>
          <KnowledgeBrick
            id="probabilites-totales"
            variant="new"
            lead={<>Cette ligne porte un nom, et elle vient avec une condition qu’on ne saute jamais.</>}
          />
          <TapQuestion
            prompt="Cette écriture est-elle toujours valable, quels que soient les cas A₁, A₂, A₃ ?"
            options={[
              'Non : elle exige que les cas partitionnent l’univers — chaque individu dans un cas et un seul',
              'Oui : c’est une identité algébrique, elle ne dépend pas de la situation',
              'Oui, à condition qu’il y ait exactement trois cas',
              'Non : elle exige que les trois cas aient le même poids',
            ]}
            correct={0}
            cols={1}
            requires={['probabilites-totales', 'partition']}
            explain="Sans recouvrement complet, des individus échappent au calcul ; avec chevauchement, d’autres sont comptés deux fois. Le nombre de cas est libre — deux pour le dépistage, trois pour les fournisseurs — et leurs poids n’ont aucune raison d’être égaux : c’est justement pour cela qu’on les multiplie."
            explainWrong="Elle n’est pas une identité algébrique : elle traduit un DÉCOUPAGE de la population. Change le découpage pour des cas qui se chevauchent, et la somme cesse de valoir P(B)."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="methode-probabilites-totales"
              variant="new"
              lead={<>Cinq gestes, dont un contrôle qui attrape la plupart des erreurs de calcul.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Sur une situation neuve',
      subtitle: `${T2.context} ${T2.question}`,
      done: q4,
      content: (
        <div className="space-y-3">
          <TreeExplorer
            tree={T2.tree()}
            firstLabels={{ A1: 'Atelier 1', A2: 'Atelier 2', A3: 'Atelier 3' }}
            labels={{ retard: 'retard', heure: 'à l’heure' }}
            event="retard"
            litPaths={lit}
            onPathClick={toggle}
            levelLabels={['atelier d’expédition', 'arrivée du colis']}
            showTotal={q4}
          />
          <NumericQuestion
            prompt={<>{T2.question} (en %, sans le signe)</>}
            expected={ratValue(T2.expected) * 100}
            parse={parseDec}
            display="10,5"
            suffix="%"
            requires={['probabilites-totales', 'methode-probabilites-totales', 'partition']}
            explain={T2.explain}
            explainFor={(n) =>
              n === 13.3 || n === 13.33
                ? `C’est la moyenne des trois taux. Chacun doit être pesé par la part de son atelier : ${T2.display} en tenant compte des poids.`
                : n === 40
                  ? 'Tu as additionné les trois taux (5 + 10 + 25). Il faut d’abord multiplier chacun par le poids de son atelier.'
                  : `0,50 × 0,05 + 0,30 × 0,10 + 0,20 × 0,25 = ${T2.display}. Contrôle : le résultat doit tomber entre le plus petit taux (5 %) et le plus grand (25 %).`
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <>
              <Feedback tone="ok">
                {T2.display}, et le contrôle passe : le résultat est bien encadré par 5 % et 25 %.
                La moyenne des trois taux aurait donné {T2.moyennePiege} — au-dessus du vrai, parce
                qu’elle donnerait à l’atelier le moins fiable le même poids qu’aux deux autres.
              </Feedback>
              <KnowledgeBrick
                id="mem-partition-puis-somme"
                variant="new"
                lead={<>Ce qu’il faut retenir de ce module, en une ligne et une condition.</>}
              />
            </>
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
      moduleTitle="La formule des probabilités totales"
      moduleSubtitle="Pourquoi on a le droit d’additionner ces chemins-là — et pas n’importe lesquels"
      estimatedTime="12 min"
      brief={{
        tag: 'Atelier',
        title: 'Un découpage sans trou ni doublon',
        tone: 'indigo',
        body: (
          <p>
            Tu as additionné trois chemins au module précédent. Reste à savoir pourquoi c’était
            légitime — et quand cela cesse de l’être. La réponse tient dans la façon dont les
            chemins découpent la population, et elle s’écrit ensuite en une seule ligne.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>Ce que tu viens d’établir.</strong> Quand les cas partitionnent l’univers,
          P(B) est la somme des P(Aᵢ) × P<sub>Aᵢ</sub>(B). Sans partition, la somme ne veut rien
          dire ; avec, elle donne le résultat exact — que {T3.title.toLowerCase()} confirme aussi :{' '}
          {T3.display} de tests positifs. Prochaine étape : la mission finale.
        </KnowledgeSnapshot>
      }
    />
  );
}
