import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import IssuesLab from '../components/IssuesLab';
import { EVENEMENTS_DE } from '../components/probabilites';

/**
 * Module 3 — DÉCOUVERTE : l'événement, décrit par les issues qui le réalisent.
 *
 * C'est LE geste du programme de 5e, et il est fait à la main : on donne une
 * phrase en français, l'élève coche les faces qui la réalisent. Le module
 * diagnostique la sélection RÉELLEMENT posée (§23) au lieu de répéter la
 * consigne — il nomme la face en trop ou la face manquante.
 *
 * Les deux cas extrêmes (aucune face, toutes les faces) sont rencontrés ici
 * comme des sélections possibles, bien avant d'être nommés « impossible » et
 * « certain » au module 7 — l'élève les FAIT avant de les lire.
 *
 * Expected observation : « une phrase en français se traduit toujours par une
 * liste de faces ; parfois la liste est vide, parfois elle contient tout ».
 * Misconception targeted : oublier une face aux frontières (« plus de 4 »
 * inclut-il 4 ?) ; et croire qu'un événement « impossible » n'a pas de sens.
 *
 * Toujours aucun quotient : on compte des faces, on ne divise pas encore.
 */
const A_DECRIRE = [
  { ev: EVENEMENTS_DE.pair, aide: 'Un nombre pair est un nombre qui se partage en deux parts égales.' },
  { ev: EVENEMENTS_DE.plusDe4, aide: '« Plus de 4 » veut dire strictement plus grand que 4 : 4 lui-même ne compte pas.' },
];

export default function Module03DecrireUnEvenement() {
  const [sel0, setSel0] = useState([]);
  const [sel1, setSel1] = useState([]);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const sels = [sel0, sel1];
  const setters = [setSel0, setSel1];

  /* Une sélection est juste quand elle contient exactement les faces qui
     réalisent l'événement — ni plus, ni moins. */
  const juste = (i) => {
    const attendu = A_DECRIRE[i].ev.realisent.map(String).sort();
    const obtenu = [...sels[i]].sort();
    return attendu.length === obtenu.length && attendu.every((v, k) => v === obtenu[k]);
  };

  /* Diagnostic : ce qui est EN TROP et ce qui MANQUE, nommément. */
  const diagnostic = (i) => {
    const attendu = A_DECRIRE[i].ev.realisent.map(String);
    const enTrop = sels[i].filter((s) => !attendu.includes(s));
    const manquant = attendu.filter((a) => !sels[i].includes(a));
    return { enTrop, manquant };
  };

  const done1 = juste(0) && juste(1);

  const steps = [
    {
      num: 1,
      title: 'Traduis la phrase en faces',
      subtitle: 'Coche les faces qui réalisent l’événement — celles-là et pas d’autres.',
      done: done1,
      content: (
        <div className="space-y-4">
          {A_DECRIRE.map((item, i) => {
            const { enTrop, manquant } = diagnostic(i);
            const ok = juste(i);
            return (
              <div key={item.ev.id} className="space-y-2">
                <IssuesLab
                  experience="de"
                  selection={sels[i]}
                  onSelection={setters[i]}
                  intitule={<>Événement : «&nbsp;<strong>{item.ev.label}</strong>&nbsp;»</>}
                  ariaLabel={`Faces réalisant : ${item.ev.label}`}
                />
                {ok ? (
                  <Feedback tone="ok">
                    Exactement : «&nbsp;{item.ev.label}&nbsp;» est réalisé par{' '}
                    <strong className="font-mono">{item.ev.realisent.join(' ; ')}</strong>, et par
                    ces faces seulement.
                  </Feedback>
                ) : sels[i].length > 0 ? (
                  /* Diagnostic de la sélection posée, jamais « Incorrect. » */
                  <Feedback tone="ko">
                    {enTrop.length > 0 && (
                      <>
                        Tu as coché <strong className="font-mono">{enTrop.join(', ')}</strong> —
                        mais {enTrop.length > 1 ? 'ces faces ne réalisent pas' : 'cette face ne réalise pas'}{' '}
                        «&nbsp;{item.ev.label}&nbsp;».{' '}
                      </>
                    )}
                    {manquant.length > 0 && (
                      <>
                        Il manque <strong className="font-mono">{manquant.join(', ')}</strong>.{' '}
                      </>
                    )}
                    {item.aide}
                  </Feedback>
                ) : (
                  <Feedback tone="info">
                    Passe les six faces en revue une par une, et demande-toi pour chacune :
                    est-ce que celle-ci réalise «&nbsp;{item.ev.label}&nbsp;» ?
                  </Feedback>
                )}
              </div>
            );
          })}
          {done1 && (
            <KnowledgeBrick
              id="evenement"
              variant="new"
              lead={<>Ce que tu viens de faire deux fois — passer d’une phrase à une liste de faces — est la définition même de ce mot.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Combien de faces ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque événement, combien de faces du dé le réalisent ?
              </p>
            }
            rows={[
              {
                id: 'v1',
                label: '« Obtenir un multiple de 3 »',
                options: ['1 face', '2 faces', '3 faces'],
                correct: 1,
                correction: 'Les multiples de 3 parmi 1…6 sont 3 et 6 : deux faces.',
              },
              {
                id: 'v2',
                label: '« Obtenir au moins 5 »',
                options: ['1 face', '2 faces', '3 faces'],
                correct: 1,
                correction: '« Au moins 5 » inclut 5 : les faces 5 et 6, donc deux faces.',
              },
              {
                id: 'v3',
                label: '« Obtenir un nombre inférieur à 3 »',
                options: ['1 face', '2 faces', '3 faces'],
                correct: 1,
                correction: '« Inférieur à 3 » n’inclut pas 3 : les faces 1 et 2, donc deux faces.',
              },
              {
                id: 'v4',
                label: '« Obtenir 7 »',
                options: ['Aucune face', '1 face', '6 faces'],
                correct: 0,
                correction: 'Aucune face du dé ne porte 7 : la liste des issues qui le réalisent est vide.',
              },
            ]}
            requires={['evenement', 'issue']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Attention aux mots des frontières : «&nbsp;<strong>au moins 5</strong>&nbsp;»
                  garde le 5, «&nbsp;<strong>inférieur à 3</strong>&nbsp;» rejette le 3. Un seul
                  mot déplace la liste d’une face.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Le piège est presque toujours à la frontière : « au
                  moins 5 » comprend le 5, « plus de 5 » ne le comprend pas. Écris les six faces
                  et barre celles qui ne conviennent pas.
                </Feedback>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Deux événements bizarres',
      subtitle: 'L’un n’a aucune face, l’autre les a toutes.',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={
              <>
                Compare «&nbsp;<strong>obtenir 7</strong>&nbsp;» (aucune face) et
                «&nbsp;<strong>obtenir moins de 7</strong>&nbsp;» (les six faces). Que peut-on
                en dire ?
              </>
            }
            options={[
              'Le premier ne se produira jamais, le second se produira toujours',
              'Les deux sont impossibles',
              'Aucun des deux n’est un événement',
              'Le second est impossible car 7 n’existe pas sur le dé',
            ]}
            correct={0}
            cols={1}
            requires={['evenement', 'issue']}
            explain="Un événement que rien ne réalise ne peut jamais se produire. Un événement que TOUTES les issues réalisent se produit à chaque lancer, quoi qu’il arrive. Ce sont bien des événements — les deux cas extrêmes."
            explainWrong="« Obtenir moins de 7 » est réalisé par 1, 2, 3, 4, 5 et 6 — c’est-à-dire par tout ce que le dé peut donner. Il se produit donc à coup sûr, à chaque lancer."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Tu sais maintenant décrire n’importe quel événement par ses faces, et les compter.
              Avant de transformer ce comptage en nombre, il reste une question à régler :{' '}
              <strong>ces faces ont-elles vraiment toutes la même chance&nbsp;?</strong>
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Décrire un événement"
      moduleSubtitle="D’une phrase en français à une liste de faces"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: '« Faire un nombre pair », c’est quelles faces ?',
        tone: 'amber',
        body: (
          <p>
            Une phrase toute simple — «&nbsp;faire un nombre pair&nbsp;» — désigne en réalité
            plusieurs faces du dé. Ce module te fait <strong>traduire des phrases en listes de
            faces</strong> : c’est ce qui permettra bientôt de compter, puis de mesurer.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
