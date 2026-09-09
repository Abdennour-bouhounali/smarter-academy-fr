import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import InfoSorter from '../../../../../common/components/InfoSorter';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { PROBLEME_FINAL, ETAPES } from '../components/raisonnement4e';

/**
 * Module 2 — DÉCOUVERTE : lire un énoncé pour de bon.
 *
 * Activity              glisser chaque information de l'énoncé dans le bac
 *                       « utile » ou le bac « inutile ».
 * Mathematical objective une donnée n'est utile que si elle sert à répondre à
 *                       LA question ; un énoncé en contient d'autres.
 * Student action        un glisser-déposer par carte (le tap reste possible,
 *                       et c'est aussi le chemin clavier).
 * Controlled variable   l'affectation de chaque carte.
 * Mathematical state    l'énoncé vient de `PROBLEME_FINAL` — mêmes phrases que
 *                       le module 6, y compris ses deux données inutiles, qui
 *                       existent DANS LE NOYAU pour cela.
 * Visual consequence    la correction s'affiche carte par carte, et le tri
 *                       juste est montré même si l'élève s'est trompé.
 * Expected observation  « trois informations servent, deux ne servent à
 *                       rien — et pourtant elles sont écrites ».
 * Misconception targeted croire que si un nombre figure dans l'énoncé, il faut
 *                       s'en servir.
 *
 * POLITIQUE FORMATIVE : `formative` fait avancer l'étape dès la première
 * vérification, juste ou fausse, et la correction reste à l'écran. Rien ne
 * bloque, rien ne boucle sur « réessaie ».
 *
 * Ce module ne résout PAS le problème : il l'ouvre. Le schéma et l'estimation
 * sont au module 3, le calcul et la vérification au module 6.
 */
const CARTES = [
  { id: 'c1', text: 'Le club achète 3 ballons.', useful: true },
  { id: 'c2', text: 'Le club achète 2 filets.', useful: true },
  { id: 'c3', text: 'Le tout coûte 74 €.', useful: true },
  { id: 'c4', text: 'Un ballon coûte 4 € de plus qu’un filet.', useful: true },
  { id: 'c5', text: `Le club compte ${28} adhérents.`, useful: false },
  { id: 'c6', text: 'La commande est arrivée en trois jours.', useful: false },
];

const NB_INUTILES = CARTES.filter((c) => !c.useful).length;

export default function Module02Enonce() {
  const [trie, setTrie] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Range les informations de l’énoncé',
      subtitle: 'Deux bacs : celles qui servent à répondre, et les autres.',
      done: trie,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/60 p-3.5">
            <p className="text-sm text-violet-900">{PROBLEME_FINAL.enonce}</p>
            <p className="mt-1 text-sm text-violet-900">
              Le club compte 28 adhérents et la commande est arrivée en trois jours.
            </p>
            <p className="mt-2 text-sm font-bold text-violet-950">{PROBLEME_FINAL.question}</p>
          </div>
          <InfoSorter items={CARTES} formative solved={trie} onSolved={() => setTrie(true)} />
          {trie && (
            <Feedback tone="ok">
              {NB_INUTILES} informations sur {CARTES.length} ne changent rien à la réponse. Elles
              sont pourtant écrites noir sur blanc : un énoncé raconte, il ne se contente pas de
              lister ce qu’il faut.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le test qui tranche',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Comment décider si une information sert ?"
            options={[
              'Se demander : si je l’enlève, la réponse change-t-elle ?',
              'Vérifier si c’est un nombre : les nombres servent toujours',
              'La garder si elle est écrite avant la question',
              'Les utiliser toutes, pour ne rien oublier',
            ]}
            correct={0}
            cols={1}
            requires={['programme-de-calcul']}
            explain="Le nombre d’adhérents est bien un nombre, et il ne sert à rien ici. Le seul test qui marche est celui du retrait : ce qui ne change pas la réponse n’est pas une donnée du problème."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="donnees-utiles"
              variant="new"
              lead="Le geste que tu viens de faire porte un nom, et il ouvre toute résolution."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Où en es-tu du travail ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Trier les informations n’est pas encore résoudre. C’est le deuxième temps d’une
            résolution, et il y en a {ETAPES.length} en tout.
          </p>
          <KnowledgeBrick
            id="sept-temps"
            variant="new"
            lead="Voici la route complète — tu viens d’en parcourir les deux premiers temps."
          />
          <TapQuestion
            prompt={`Après « ${ETAPES[0].titre} » et « ${ETAPES[1].titre} », quel est le temps suivant ?`}
            options={ETAPES.slice(2, 6).map((e) => e.titre)}
            correct={0}
            cols={4}
            requires={['sept-temps']}
            explain={`${ETAPES[2].titre} : ${ETAPES[2].question} On ne choisit pas une stratégie avant d’avoir vu la situation — et un schéma la rend visible. C’est le module suivant.`}
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
      moduleTitle="Ce que l’énoncé raconte"
      moduleSubtitle="Toutes les informations ne servent pas"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Le dossier du club',
        tone: 'indigo',
        body: (
          <>
            Un club sportif fait une commande. L’énoncé donne six informations —{' '}
            <strong>toutes ne servent pas à répondre.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Relis la question avant de ranger la première carte : c’est elle qui décide de ce qui
            sert.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
