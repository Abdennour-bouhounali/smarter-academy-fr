import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DiceDetector from '../components/DiceDetector';

/**
 * Module 4 — MANIPULATION : le modèle contre la réalité.
 *
 * Jusqu'ici le modèle était donné et vrai. Ici l'élève doit DÉCIDER si
 * l'hypothèse d'équiprobabilité tient. La loi des grands nombres change
 * alors de rôle : de description du hasard, elle devient un instrument de
 * mesure — c'est la seule chose qui permette de dire qu'un dé est pipé.
 *
 * Le verdict n'est acquis qu'après une accusation JUSTE sur une grande
 * série (≥ 300) : réussir sur 30 lancers relève de la chance (61 % mesurés,
 * cf. DiceDetector) et ne prouverait pas la compétence visée.
 */
export default function Module04LeModeleEstIlBon() {
  const [verdict, setVerdict] = useState(null);
  const [q2, setQ2] = useState(false);

  const done1 = Boolean(verdict?.correct && verdict.n >= 300);
  const done2 = q2;

  const handleVerdict = (v, react) => {
    setVerdict(v);
    if (!done1 && v.correct && v.n >= 300) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Un de ces trois dés est pipé',
      subtitle: 'Commence par 30 lancers. Si tu hésites, ce n’est pas toi : c’est la série qui est trop courte.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DiceDetector onVerdict={(v) => handleVerdict(v, kit.react)} />
          {done1 ? (
            <Feedback tone="ok">
              Trouvé — sur <strong>{verdict.n.toLocaleString('fr-FR')}</strong> lancers, l’écart ne pouvait plus
              passer pour de la fluctuation. Le dé B donne un 6 dans <strong>25 %</strong> des cas au lieu de
              16,7 % : sur 30 lancers cela ne se voit pas, sur 3 000 c’est indiscutable. La loi des grands
              nombres devient ici un <strong>instrument de mesure</strong> : elle permet de confronter une
              hypothèse aux données.
            </Feedback>
          ) : null}
          {/* Le verdict vient d'être obtenu sur une longue série : les deux
              notions qui l'ont rendu possible — l'hypothèse d'équiprobabilité,
              et la méthode qui vient de servir à la juger — se nomment ici. */}
          {done1 && (
            <>
              <KnowledgeBrick
                id="modele-realite"
                variant="new"
                compact
                lead={<>Le dé B « équilibré » ne l’était pas : l’équiprobabilité que tu supposais n’était qu’une hypothèse, et les lancers viennent de la mettre en défaut.</>}
              />
              <KnowledgeBrick
                id="methode-tester-modele"
                variant="new"
                lead={<>Ce que tu viens de faire — prévoir la fréquence du modèle, lancer beaucoup, comparer — c’est la méthode pour mettre n’importe quel modèle à l’épreuve.</>}
              />
            </>
          )}
          {!done1 && verdict && !verdict.correct ? (
            <Feedback tone="warn">
              Ce dé-là était équilibré. Sur {verdict.n.toLocaleString('fr-FR')} lancers, l’écart que tu as vu
              venait de la fluctuation, pas d’un truquage. Relance avec une série plus longue.
            </Feedback>
          ) : !done1 && verdict && verdict.correct ? (
            <Feedback tone="info">
              Bien vu — mais sur {verdict.n.toLocaleString('fr-FR')} lancers seulement, tu pouvais tomber juste
              par chance. Refais l’essai sur 300 ou 3 000 lancers pour que ce soit une <strong>preuve</strong>.
            </Feedback>
          ) : !done1 ? (
            <Feedback tone="info">Lance les dés, puis accuse celui que tu soupçonnes.</Feedback>
          ) : null}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Modèle et réalité',
      done: done2,
      content: (
        <TapQuestion
          prompt="« Ce dé est équilibré : chaque face a une probabilité 1/6. » Cette phrase est…"
          options={[
            'Une hypothèse de modèle, que les données peuvent contredire',
            'Une vérité mathématique valable pour tout dé',
            'Le résultat d’un calcul de probabilité',
            'Une conséquence de la loi des grands nombres',
          ]}
          correct={0} cols={1}
          requires={['modele-realite', 'methode-tester-modele', 'equiprobable', 'probabilite']}
          explain="L’équiprobabilité est une HYPOTHÈSE qu’on pose sur un objet réel, en général parce que rien ne distingue ses faces. Le dé B vient de montrer qu’elle peut être fausse. Les mathématiques calculent les conséquences du modèle ; c’est l’expérience — donc de longues séries — qui juge si le modèle décrit bien l’objet."
          explainWrong="Aucun théorème ne garantit qu’un dé réel est équilibré : c’est une hypothèse sur le monde, que seule une longue série de lancers permet de mettre à l’épreuve."
          solved={done2} onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(4)} moduleNumber={4}
      moduleTitle="Le modèle est-il bon ?" moduleSubtitle="Quand l’équiprobabilité est une hypothèse fausse" estimatedTime="12 min"
      brief={{
        tag: 'Manipulation', title: 'Trois dés, un tricheur', tone: 'emerald',
        body: <p>On a toujours supposé le dé équilibré. Mais un dé réel n’a aucune obligation de l’être. Comment le prouver ? En lançant — beaucoup.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Retenu.</strong> L’équiprobabilité est une <strong>hypothèse du modèle</strong>, pas une vérité.
          Une longue série permet de la confronter aux données ; une série courte ne prouve rien.
          Module suivant : faire faire les lancers par un programme.
        </KnowledgeSnapshot>
      )}
    />
  );
}
