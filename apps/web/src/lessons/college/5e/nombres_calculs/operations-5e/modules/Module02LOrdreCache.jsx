import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExpressionLab from '../components/ExpressionLab';

/**
 * Module 2 — DÉCOUVERTE : d'où vient la convention.
 *
 * Le module 1 a laissé l'élève avec un problème ouvert : sans parenthèses, un
 * calcul est ambigu. Ce module ne donne pas la règle en premier — il fait
 * CHOISIR à l'élève laquelle des deux lectures raconte la situation, sur trois
 * scénarios concrets où la réponse est vérifiable sans convention. Les trois
 * fois, c'est le produit qui doit passer d'abord ; le mot « priorité » n'arrive
 * qu'après ce constat répété.
 *
 * Expected observation : « à chaque fois, le produit forme un bloc — c'est un
 * paquet, une rangée, un lot — et un bloc se compte avant d'être ajouté ».
 * Misconception targeted : croire que la convention est arbitraire, donc
 * oubliable ; ou la mémoriser comme « toujours de gauche à droite ».
 */
const CINE = { nums: [4, 2, 9], ops: ['+', '×'] };   // 4 € de bus + 2 places à 9 €

export default function Module02LOrdreCache() {
  const [q1, setQ1] = useState(false);
  const [paren2, setParen2] = useState(null);
  const [vuBloc, setVuBloc] = useState(false);
  const done2 = vuBloc;
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const poser2 = (p, react) => {
    setParen2(p);
    if (p && p.to !== null && p.from === 1 && p.to === 2 && !vuBloc) {
      setVuBloc(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'La sortie au cinéma',
      subtitle: 'Une situation où l’on peut vérifier le bon total sans aucune règle.',
      done: q1,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Le trajet en bus coûte <strong>4 €</strong> pour tout le groupe. Ensuite,{' '}
            <strong>2 places</strong> de cinéma à <strong>9 €</strong> chacune. Le caissier écrit
            le total sur un papier : <strong className="font-mono">4 + 2 × 9</strong>.
          </div>
          <TapQuestion
            prompt="Combien la sortie coûte-t-elle réellement ? Compte l’argent, pas le calcul."
            options={['22 €', '54 €', '15 €', '18 €']}
            correct={0}
            cols={4}
            /* Volontairement AVANT toute brique : cette question ne demande
               aucune notion de la leçon, seulement de compter de l'argent avec
               les opérations de 6e. C'est elle qui fournira la référence (22 €)
               dont la convention aura ensuite à rendre compte. */
            requires={['calcul-numerique', 'tables-multiplication']}
            explain="4 € de bus, puis 2 × 9 = 18 € de places : 4 + 18 = 22 €. Le total réel est 22 €."
            explainWrong="54 € reviendrait à payer le bus 4 € pour chacune des… non : ce serait faire (4 + 2) × 9, comme si les six unités étaient toutes des places à 9 €. Or seules 2 places sont achetées."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="info">
              Retiens ce nombre : <strong>22</strong>. La bonne lecture de{' '}
              <strong className="font-mono">4 + 2 × 9</strong> est donc celle qui donne 22 — et
              c’est la situation qui l’a décidé, pas une règle apprise.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Entoure le morceau qui forme un bloc',
      subtitle: 'Pose la parenthèse autour de ce qui, dans la vraie vie, se compte ensemble.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <ExpressionLab
            expr={CINE}
            paren={paren2}
            onParen={(p) => poser2(p, kit.react)}
            resultLabel="Le papier donne"
            ariaLabel="Calcul 4 + 2 × 9 — entoure le bloc"
          />
          {done2 ? (
            <Feedback tone="ok">
              <strong className="font-mono">2 × 9</strong> forme un bloc : c’est{' '}
              <em>le prix des places</em>, une seule quantité. On le compte d’abord (18 €), puis on
              lui ajoute le bus. Et voici l’essentiel : la parenthèse a donné <strong>22</strong>,
              exactement comme si on n’en avait mis <strong>aucune</strong>. La lecture sans
              parenthèses fait déjà passer le produit d’abord.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Lequel des deux morceaux désigne une seule quantité réelle : « 4 + 2 », ou
              « 2 × 9 » ? Entoure celui-là.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Toujours le produit ?',
      subtitle: 'Trois autres situations. Vérifie si le produit passe encore en premier.',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque situation, quel morceau faut-il calculer <strong>en premier</strong> ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: '3 cahiers à 2 € et 1 stylo à 5 € : 5 + 3 × 2',
                options: ['5 + 3', '3 × 2'],
                correct: 1,
                correction: '3 × 2 = 6 € de cahiers, puis + 5 € : 11 €.',
              },
              {
                id: 'r2',
                label: '20 bonbons dont on retire 4 sachets de 3 : 20 − 4 × 3',
                options: ['20 − 4', '4 × 3'],
                correct: 1,
                correction: '4 × 3 = 12 bonbons retirés, puis 20 − 12 : 8.',
              },
              {
                id: 'r3',
                label: '36 billes partagées en 4, plus 2 offertes : 2 + 36 ÷ 4',
                options: ['2 + 36', '36 ÷ 4'],
                correct: 1,
                correction: '36 ÷ 4 = 9 billes chacun, puis + 2 : 11.',
              },
            ]}
            /* Toujours avant la brique des priorités : l'élève tranche par le
               SENS de chaque situation, pas par une règle qu'il n'a pas encore. */
            requires={['calcul-numerique', 'tables-multiplication']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Trois fois sur trois, c’est <strong>la multiplication ou la division</strong> qui
                  se calcule d’abord. Et ce n’est pas un hasard : un produit ou un quotient décrit
                  <strong> une quantité</strong> (le prix des cahiers, les bonbons retirés, la part
                  de chacun). Cette quantité doit exister avant qu’on puisse l’ajouter ou la
                  retirer.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Pour chaque ligne, demande-toi : quel morceau désigne{' '}
                  <strong>une seule quantité de la situation</strong> ? Le prix total des cahiers,
                  c’est 3 × 2. Ce bloc-là se compte avant d’être ajouté au stylo.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'La convention',
      done: q4,
      content: (
        <div className="space-y-3">
          {/* Quatre situations viennent de donner la même réponse : le mot
              « priorité » nomme maintenant quelque chose que l'élève a
              constaté quatre fois, au lieu d'ouvrir le module. */}
          <KnowledgeBrick
            id="priorites"
            variant="new"
            lead={<>Quatre situations, une seule et même réponse : le produit — ou le quotient — passe devant. Les mathématiciens en ont fait une convention, valable partout dans le monde.</>}
          />
          <KnowledgeBrick id="mem-priorites" variant="new" compact />
          <TapQuestion
            prompt={<>Combien vaut <span className="font-mono font-bold">5 + 4 × 3 − 2</span> ?</>}
            options={['15', '25', '17', '11']}
            correct={0}
            cols={4}
            requires={['priorites', 'parentheses']}
            explain="Le produit d’abord : 4 × 3 = 12. Puis de gauche à droite : 5 + 12 = 17, et 17 − 2 = 15."
            explainWrong="25 correspond à une lecture de gauche à droite : 5 + 4 = 9, 9 × 3 = 27, 27 − 2 = 25. C’est justement ce que la convention interdit : le produit 4 × 3 forme un bloc qui se calcule avant les additions et les soustractions."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="L’ordre caché"
      moduleSubtitle="Pourquoi la convention n’est pas un caprice"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Qui décide, quand personne n’écrit de parenthèses ?',
        tone: 'violet',
        body: (
          <p>
            Tu as vu qu’un calcul sans parenthèses est ambigu. Pourtant, tout le monde tombe
            d’accord sur <strong className="font-mono">4 + 2 × 9</strong>. Pourquoi ? Parce que la
            règle choisie n’a pas été tirée au sort : elle vient de{' '}
            <strong>ce que les calculs racontent</strong>.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
