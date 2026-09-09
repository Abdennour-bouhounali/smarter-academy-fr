import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 2 — DÉCOUVERTE : « en fonction de ».
 *
 * Le module 1 a fait CONSTATER qu'une grandeur commande et que d'autres
 * suivent. Il manquait la phrase pour le dire. Ce module la construit — et
 * surtout, il fait éprouver que cette phrase est ORIENTÉE : la retourner
 * change son sens, et devient faux dans la plupart des situations.
 *
 * Action → changement → observation → sens :
 *   choisir l'ordre des deux grandeurs → la phrase se compose sous les yeux
 *   → « dit comme ça, c'est absurde » → l'ordre porte le sens.
 *
 * Expected observation : « on ne peut pas dire "la durée en fonction de la
 * couleur" : ce n'est pas la couleur qu'on règle ».
 * Misconception targeted : croire que « en fonction de » relie deux grandeurs
 * symétriquement, comme « et ».
 *
 * PÉRIMÈTRE : ni f(x), ni « image », ni « antécédent ».
 */

/** Le composeur de phrase : l'élève choisit qui suit et qui commande. */
function PhraseBuilder({ a, b, ordre, onOrdre }) {
  const [suit, commande] = ordre === 'ab' ? [a, b] : [b, a];
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-3.5 space-y-2.5">
        <p className="text-sm text-center text-slate-700">
          <strong className="text-violet-800">{suit}</strong>{' '}
          <span className="text-violet-600 font-semibold">en fonction de</span>{' '}
          <strong className="text-violet-800">{commande}</strong>
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-center">
          <div className="rounded-lg bg-white px-2 py-1.5 text-slate-600 border border-violet-200">
            ce qui <strong>suit</strong>
          </div>
          <div className="rounded-lg bg-white px-2 py-1.5 text-slate-600 border border-violet-200">
            ce qu’on <strong>règle</strong>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOrdre(ordre === 'ab' ? 'ba' : 'ab')}
        className="w-full min-h-[44px] rounded-xl border-2 border-violet-300 bg-white px-3 py-2 text-sm font-bold text-violet-700 hover:bg-violet-50 transition"
      >
        ↔ Inverser les deux grandeurs
      </button>
    </div>
  );
}

export default function Module02QuiCommandeQui() {
  const [ordre, setOrdre] = useState('ab');
  const [inverse, setInverse] = useState(false);
  const done1 = inverse;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const changer = (o, react) => {
    setOrdre(o);
    if (!inverse) {
      setInverse(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Compose la phrase',
      subtitle: 'Inverse les deux grandeurs, et lis à voix haute ce que ça donne.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-slate-200 bg-white p-3.5 text-sm text-slate-700">
            On veut décrire le four d’une seule phrase, avec les deux grandeurs :{' '}
            <strong>la couleur de la croûte</strong> et <strong>la durée de cuisson</strong>.
          </div>
          <PhraseBuilder
            a="la couleur de la croûte"
            b="la durée de cuisson"
            ordre={ordre}
            onOrdre={(o) => changer(o, kit.react)}
          />
          {done1 ? (
            <Feedback tone={ordre === 'ab' ? 'ok' : 'ko'}>
              {ordre === 'ab' ? (
                <>
                  <strong>C’est la bonne phrase.</strong> On règle la durée, la couleur suit : « la
                  couleur de la croûte en fonction de la durée de cuisson ».
                </>
              ) : (
                <>
                  Relis : « la durée en fonction de la couleur » voudrait dire qu’on{' '}
                  <em>choisit la couleur</em> et que le four en déduit la durée. Or le four n’a
                  qu’une molette — celle du temps.
                </>
              )}
            </Feedback>
          ) : (
            <Feedback tone="info">
              Appuie sur « Inverser ». Les deux phrases veulent-elles dire la même chose ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La phrase, et son ordre',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Le geste d'inversion vient de montrer que l'ordre porte le sens :
              la brique peut maintenant l'énoncer. */}
          <KnowledgeBrick
            id="en-fonction-de"
            variant="new"
            lead={<>Tu viens de voir que retourner la phrase la rend fausse.</>}
          />
          <KnowledgeBrick id="mem-en-fonction-de" variant="new" compact />
          <TapQuestion
            prompt={
              <>
                Le prix payé à la boulangerie dépend du nombre de croissants achetés. Comment le
                dit-on ?
              </>
            }
            options={[
              'Le prix en fonction du nombre de croissants',
              'Le nombre de croissants en fonction du prix',
            ]}
            cols={1}
            correct={0}
            requires={['en-fonction-de', 'dependance']}
            explain="On choisit le nombre de croissants, et le prix suit. Ce qui dépend se dit en premier : « le prix en fonction du nombre de croissants »."
            explainWrong="C’est l’inverse : à la boulangerie, tu ne choisis pas le prix pour en déduire le nombre de croissants. Tu choisis les croissants, et la caisse annonce le prix."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quatre situations de la journée',
      subtitle: 'Pour chacune, laquelle des deux grandeurs commande ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Dans chaque situation, quelle est la grandeur qu’on <strong>règle</strong> — celle
                dont l’autre dépend ?
              </p>
            }
            rows={[
              {
                id: 'douche',
                label: 'La quantité d’eau consommée et la durée de la douche',
                options: ['la durée', 'la quantité d’eau'],
                correct: 0,
                correction:
                  'On décide combien de temps on reste sous la douche ; l’eau consommée en découle. Donc : la quantité d’eau en fonction de la durée.',
              },
              {
                id: 'sortie',
                label: 'Le coût total de la sortie et le nombre d’élèves inscrits',
                options: ['le nombre d’élèves', 'le coût total'],
                correct: 0,
                correction:
                  'C’est le nombre d’inscrits qui fixe le coût : le coût total en fonction du nombre d’élèves.',
              },
              {
                id: 'plante',
                label: 'La hauteur de la plante et le nombre de semaines depuis le semis',
                options: ['le nombre de semaines', 'la hauteur'],
                correct: 0,
                correction:
                  'Le temps passe et la plante grandit : la hauteur en fonction du nombre de semaines.',
              },
              {
                id: 'four',
                label: 'La température du pain et la durée de cuisson',
                options: ['la durée de cuisson', 'la température'],
                correct: 0,
                correction:
                  'C’est la molette du four qu’on règle : la température en fonction de la durée.',
              },
            ]}
            requires={['en-fonction-de', 'dependance']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Quatre fois, la grandeur qui commande est celle que{' '}
                  <strong>quelqu’un décide</strong> : une durée, un nombre d’inscrits, un temps qui
                  passe. L’autre suit toute seule.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Pose-toi à chaque fois la question :{' '}
                  <strong>laquelle des deux puis-je choisir directement ?</strong> C’est celle-là
                  qui commande.
                </Feedback>
              )
            }
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
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Qui commande qui ?"
      moduleSubtitle="Une phrase qui ne se retourne pas"
      estimatedTime="10 min"
      brief={{
        tag: 'Découverte',
        title: 'Une phrase pour dire la dépendance',
        tone: 'indigo',
        body: (
          <p>
            Tu as vu qu’une grandeur commande et que d’autres suivent. Les mathématiciens le disent
            en quatre mots : <strong>« en fonction de »</strong>. Mais l’ordre compte — et le
            vérifier est plus instructif que l’apprendre.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
