import React, { useState } from 'react';
import { Users, Eye } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ComparaisonLab, { LIGNES } from '../components/ComparaisonLab';
import {
  GROUPE_ROUGE, GROUPE_BLEU, moyenne, mediane, etendue, avecUnite,
} from '../components/stats4e';

/**
 * Module 5 — MANIPULATION : comparer deux séries que la moyenne ne sépare pas.
 *
 * Activity              dévoiler un résumé après l'autre sur deux groupes, et
 *                       constater lesquels sont muets.
 * Mathematical objective comparer, ce n'est pas désigner la meilleure : c'est
 *                       dire quel résumé SÉPARE les deux séries et lequel est
 *                       aveugle. Ici DEUX des trois sont aveugles.
 * Student action        révéler chaque ligne du tableau, dans l'ordre voulu.
 * Controlled variable   l'ensemble des lignes dévoilées.
 * Mathematical state    les deux séries ; le verdict vient de `comparer`,
 *                       jamais d'une phrase saisie ici.
 * Visual consequence    la ligne se remplit, et affiche « aucun » écart ou un
 *                       écart chiffré.
 * Expected observation  « la moyenne ET l'étendue disent la même chose sur les
 *                       deux, et pourtant les nuages n'ont rien à voir ».
 * Misconception targeted « même moyenne, donc même résultat » — c'est
 *                       exactement ce que la donnée dément.
 * Formalization         la brique `comparer-series` arrive une fois les trois
 *                       lignes dévoilées et la surprise consommée.
 *
 * CE QUE CE MODULE LAISSE AU SUIVANT : la conclusion « la médiane est le bon
 * résumé » est ici la conclusion NATURELLE, et elle est FAUSSE. Le module 6 la
 * démonte avec la paire miroir. Refermer la question ici enseignerait une
 * préférence au lieu d'un choix.
 */
export default function Module05DeuxGroupes() {
  const [devoiles, setDevoiles] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = devoiles.length === LIGNES.length;

  const basculer = (cle) =>
    setDevoiles((d) => (d.includes(cle) ? d.filter((x) => x !== cle) : [...d, cle]));

  const lab = (
    <ComparaisonLab
      serieA={GROUPE_ROUGE}
      serieB={GROUPE_BLEU}
      devoiles={devoiles}
      onDevoiler={basculer}
      couleurs={{ a: 'rose', b: 'sky' }}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Dévoile les trois lignes du tableau',
      subtitle: 'Deux groupes de neuf élèves au même contrôle. Touche chaque bouton pour découvrir un résumé.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Deux groupes ont passé le même contrôle. Regarde d’abord les deux nuages : ils n’ont
            visiblement pas la même allure. Puis dévoile les résumés, <strong>un par un</strong>.
          </p>
          <PredictionChips
            prompt="Avant de dévoiler : combien des trois résumés vont, selon toi, distinguer ces deux groupes ?"
            options={[
              { id: 'trois', label: 'Les trois' },
              { id: 'deux', label: 'Deux' },
              { id: 'un', label: 'Un seul' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {done1 && (
            <Feedback tone="ok">
              Deux lignes sur trois affichent « aucun » écart. Même moyenne (
              {avecUnite(moyenne(GROUPE_ROUGE), GROUPE_ROUGE.unite)}), même étendue (
              {avecUnite(etendue(GROUPE_ROUGE), GROUPE_ROUGE.unite)}) — et pourtant les deux
              nuages n’ont rien à voir.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Que peut-on affirmer de ces deux groupes ?',
      done: q2,
      content: (
        <div className="space-y-3">
          {lab}
          <TapQuestion
            prompt="Les deux groupes ont la même moyenne. Quelle conclusion est correcte ?"
            options={[
              'Ils ont le même total de points, mais ils sont répartis autrement',
              'Ils ont exactement les mêmes notes',
              'Le groupe Rouge a mieux réussi, puisqu’il a la même moyenne',
              'La moyenne a été mal calculée sur l’un des deux',
            ]}
            correct={0}
            cols={1}
            requires={['moyenne', 'indicateur-stat']}
            explain={`Même moyenne veut dire même total pour un même effectif — rien de plus. Rouge a trois notes très basses et six hautes ; Bleu se tient groupé autour de ${avecUnite(mediane(GROUPE_BLEU), GROUPE_BLEU.unite)}. La moyenne ne fait aucune différence entre ces deux profils.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le seul résumé qui parle',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Sur ces deux groupes, quel résumé fait apparaître une différence ?`}
            options={[
              'La médiane, plus haute chez Rouge',
              'La moyenne, plus haute chez Rouge',
              'L’étendue, plus grande chez Bleu',
              'Aucun des trois',
            ]}
            correct={0}
            cols={1}
            requires={['mediane-stat', 'etendue', 'indicateur-stat']}
            explain={`La médiane de Rouge vaut ${avecUnite(mediane(GROUPE_ROUGE), GROUPE_ROUGE.unite)} contre ${avecUnite(mediane(GROUPE_BLEU), GROUPE_BLEU.unite)} chez Bleu : la moitié haute de Rouge dépasse celle de Bleu. La moyenne et l’étendue, elles, donnent exactement le même nombre des deux côtés.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="comparer-series"
              variant="new"
              lead="Ce que tu viens de faire ligne par ligne est la méthode complète."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Tentant d’en conclure « la médiane est le meilleur des trois ». Le module suivant
              présente deux séries qu’elle est <strong>incapable</strong> de distinguer.
            </Feedback>
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
      moduleTitle="Deux groupes, une seule moyenne"
      moduleSubtitle="Quand deux résumés sur trois ne voient rien"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Rouge contre Bleu',
        tone: 'indigo',
        body: (
          <>
            Deux groupes, le même contrôle, la même moyenne. Le professeur en conclut qu’ils se
            valent. <strong>Les deux nuages de points disent-ils la même chose ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <Users className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Regarde d’abord les deux nuages. <Eye className="inline h-4 w-4" aria-hidden="true" />{' '}
            Puis dévoile les résumés un à un : deux d’entre eux vont te surprendre.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
