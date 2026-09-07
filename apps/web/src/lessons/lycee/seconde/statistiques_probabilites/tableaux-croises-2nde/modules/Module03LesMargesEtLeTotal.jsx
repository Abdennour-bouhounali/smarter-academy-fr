import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { CrossTableView, crossTable } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ELEVES, CLASSES, ACTIVITES } from '../data';

/**
 * Module 3 — DÉCOUVERTE : les effectifs marginaux et le total général.
 *
 * L'idée à installer : une marge répond à une question sur UN SEUL caractère
 * (« combien de judokas, toutes classes confondues ? »), une case à une
 * question sur les DEUX. Et le total général tombe deux fois — par les lignes
 * et par les colonnes — ce qui fournit une vérification gratuite.
 *
 * Le module met en évidence la surbrillance de CrossTableView pour que
 * l'élève voie la ligne ou la colonne dont on parle.
 */
const T = crossTable(ELEVES, 'activite', 'classe', ACTIVITES, CLASSES);

export default function Module03LesMargesEtLeTotal() {
  const [highlight, setHighlight] = useState(null);
  const [seen, setSeen] = useState(() => new Set());
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = seen.size >= 3;
  const done2 = q2;
  const done3 = q3;

  const show = (h, key, react) => {
    setHighlight(h);
    const next = new Set(seen); next.add(key); setSeen(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Éclairer une marge',
      subtitle: 'Chaque bouton met en évidence la ligne, la colonne ou le total dont on parle. Essaie les trois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Ce qu’on éclaire">
            {[
              { key: 'row', h: { axis: 'row', key: 'judo' }, l: 'Les judokas (toutes classes)' },
              { key: 'col', h: { axis: 'col', key: '2de C' }, l: 'La 2de C (toutes activités)' },
              { key: 'total', h: { axis: 'total' }, l: 'Le total général' },
            ].map((o) => (
              <button key={o.key} type="button" aria-pressed={seen.has(o.key) && highlight === o.h}
                onClick={() => show(o.h, o.key, kit.react)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  JSON.stringify(highlight) === JSON.stringify(o.h)
                    ? 'bg-sky-600 border-sky-700 text-white' : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                }`}>
                {o.l}
              </button>
            ))}
          </div>
          <CrossTableView table={T} highlight={highlight}
            rowsTitle="Activité" colsTitle="Classe"
            caption="Les 60 élèves du club" />
          {done1 ? (
            <Feedback tone="ok">
              Un total de <strong>ligne</strong> répond à une question sur l’activité seule
              (15 judokas, toutes classes confondues) ; un total de <strong>colonne</strong> à une question sur
              la classe seule (26 élèves en 2de C). Ce sont les <strong>effectifs marginaux</strong> — ils vivent
              dans la marge du tableau. Le coin en bas à droite est le <strong>total général</strong> : 60.
              {' '}<span className="text-slate-500">Continue à éclairer ce que tu veux.</span>
            </Feedback>
          ) : null}
          {/* Les trois mises en évidence viennent de séparer la ligne, la
              colonne et le coin : on peut les nommer avant que l'étape 2 ne
              demande d'en faire la double somme. */}
          {done1 && (
            <KnowledgeBrick
              id="effectifs-marginaux"
              variant="new"
              lead={<>Tu viens d’éclairer une ligne entière, une colonne entière, puis le coin. Ces trois nombres vivent dans la <strong>marge</strong> du tableau.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">Mises en évidence essayées : {seen.size} sur 3.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La vérification gratuite',
      done: done2,
      content: (
        <NumericQuestion
          prompt="Additionne les quatre totaux de lignes (15 + 19 + 13 + 13), puis les trois totaux de colonnes (14 + 20 + 26). Que trouves-tu dans les deux cas ?"
          expected={60}
          requires={['effectifs-marginaux', 'tableau-croise', 'effectif']}
          explain="Les deux sommes valent 60. C’est inévitable : chaque élève est compté une fois dans sa ligne et une fois dans sa colonne. Cette double lecture du total général est une vérification GRATUITE — si les deux sommes diffèrent, il y a une erreur de comptage."
          explainFor={() => 'Les deux sommes doivent donner le même nombre, l’effectif total : 15 + 19 + 13 + 13 = 60 et 14 + 20 + 26 = 60.'}
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Marge ou case ?',
      done: done3,
      content: (
        <div className="space-y-3">
          {/* La double somme vient de tomber juste : le critère de lecture
              peut être fixé avant qu'on demande de l'appliquer. */}
          <KnowledgeBrick
            id="mem-case-marge"
            variant="new"
            compact
            lead={<>Tu as maintenant les deux endroits où lire : le bord, et l’intérieur. Voici comment la question te dit lequel choisir.</>}
          />
        <TapQuestion
          prompt="« Combien d’élèves de 2de B font de la danse ? » Où lit-on la réponse ?"
          options={[
            'Dans la case qui croise la ligne « danse » et la colonne « 2de B » : 6 élèves',
            'Dans le total de la ligne danse : 19 élèves',
            'Dans le total de la colonne 2de B : 20 élèves',
            'Dans le total général : 60 élèves',
          ]}
          correct={0} cols={1}
          requires={['mem-case-marge', 'effectifs-marginaux', 'tableau-croise']}
          explain="La question porte sur les DEUX caractères à la fois : c’est une case, pas une marge. Les 19 danseurs et les 20 élèves de 2de B répondent à des questions à un seul caractère."
          explainWrong="Une marge ne renseigne que sur un caractère. Dès que la question en croise deux (« de 2de B » ET « danse »), la réponse est à l’intersection."
          solved={done3} onAnswered={() => setQ3(true)}
        />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Les marges et le total" moduleSubtitle="Un caractère, ou les deux ?" estimatedTime="13 min"
      brief={{
        tag: 'Découverte', title: 'Ce que disent les bords', tone: 'sky',
        body: <p>Les totaux de lignes et de colonnes ne sont pas de simples contrôles : ils répondent aux questions portant sur un seul caractère. Et leur double somme vérifie le tableau gratuitement.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Des questions plus fines.</strong> « Au judo OU à la danse », « pas en 2de B » : ces phrases
          demandent de combiner plusieurs cases. Module suivant : les traduire en filtres.
        </KnowledgeSnapshot>
      )}
    />
  );
}
