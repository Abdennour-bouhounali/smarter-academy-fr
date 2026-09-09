import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { BOITE_CHOCOLATS, perimetrePrisme, fmtLong } from '../components/espace5e';

/**
 * Module 6 — LABORATOIRE : des dimensions au carton, et retour.
 *
 * Transfert, pas répétition. Les contextes sont neufs (une commande de
 * cartons, un prisme à base carrée jamais manipulé jusqu'ici) et l'élève doit
 * choisir lui-même la représentation utile à chaque question : les vues pour
 * identifier, le patron pour fabriquer, les dimensions pour commander.
 *
 * PÉRIMÈTRE : on commande des CARTONS (des surfaces à découper), jamais des
 * contenances — le volume est un objet de 4e.
 */
export default function Module06LAtelierDEmballage() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Combien de pièces par carton ?',
      subtitle: 'L’atelier doit découper les bonnes pièces pour chaque emballage.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="dimensions-solide"
            variant="new"
            lead={<>Une commande de carton se résume à quelques grandeurs — tout le reste s’en déduit.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque emballage, combien de pièces le carton comporte-t-il en tout ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'Cylindre',
                options: ['3 pièces', '2 pièces', '6 pièces'],
                correct: 0,
                correction: 'Deux disques et une bande : 3 pièces.',
              },
              {
                id: 'r2',
                label: 'Prisme droit à base triangulaire',
                options: ['4 pièces', '5 pièces', '6 pièces'],
                correct: 1,
                correction: 'Deux triangles et trois rectangles : 5 pièces.',
              },
              {
                id: 'r3',
                label: 'Prisme droit à base carrée',
                options: ['5 pièces', '6 pièces', '8 pièces'],
                correct: 1,
                correction: 'Deux carrés et quatre rectangles : 6 pièces.',
              },
            ]}
            requires={['patron-prisme', 'patron-cylindre', 'dimensions-solide']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Toujours la même structure : <strong>deux bases</strong>, plus{' '}
                  <strong>une pièce par côté</strong> de la base — et pour le cylindre, dont la
                  base n’a pas de côtés, une seule bande qui en fait le tour.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Compte toujours ainsi : <strong>2 bases</strong>, puis{' '}
                  <strong>un rectangle par côté</strong> de la base. Le cylindre est le cas
                  limite : une seule bande remplace tous les rectangles.
                </Feedback>
              )
            }
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'La longueur de la bande d’un prisme',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3.5 text-sm text-slate-700">
            La boîte de chocolats a une base <strong>triangulaire</strong> dont les trois côtés
            mesurent <strong>{fmtLong(BOITE_CHOCOLATS.base[0])}</strong>. Si l’on découpe sa bande
            d’un seul tenant, quelle longueur doit-elle avoir ?
          </div>
          <NumericQuestion
            prompt="Longueur de la bande, d’un seul tenant :"
            expected={perimetrePrisme(BOITE_CHOCOLATS)}
            parse={parseDec}
            display={fmtLong(perimetrePrisme(BOITE_CHOCOLATS))}
            requires={['patron-prisme', 'perimetre']}
            explainFor={(n) =>
              n === BOITE_CHOCOLATS.base[0]
                ? 'C’est la longueur d’UN seul côté. La bande fait le tour de la base : il faut la somme des trois côtés.'
                : n === BOITE_CHOCOLATS.hauteur
                ? 'C’est la hauteur du prisme, donc la hauteur de la bande — pas sa longueur.'
                : null
            }
            explain={`La bande fait le tour de la base : c’est le périmètre du triangle, soit ${BOITE_CHOCOLATS.base.join(' + ')} = ${fmtLong(perimetrePrisme(BOITE_CHOCOLATS))}.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              Exactement la même idée que pour le cylindre : la bande fait{' '}
              <strong>le tour de la base</strong>. Pour un polygone, ce tour est la somme des
              côtés ; pour un disque, c’est 2 × π × rayon.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Identifier un carton reçu',
      done: q3,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                L’atelier reçoit trois cartons à plat. De quel solide chacun est-il le patron ?
              </p>
            }
            rows={[
              {
                id: 's1',
                label: '2 disques et 1 rectangle',
                options: ['un cylindre', 'un prisme', 'un pavé droit'],
                correct: 0,
                correction: 'Deux disques comme bases : c’est un cylindre.',
              },
              {
                id: 's2',
                label: '2 triangles et 3 rectangles',
                options: ['un cylindre', 'un prisme à base triangulaire', 'un pavé droit'],
                correct: 1,
                correction: 'Deux bases triangulaires et un rectangle par côté : c’est un prisme droit à base triangulaire.',
              },
              {
                id: 's3',
                label: '2 carrés et 4 rectangles',
                options: ['un cylindre', 'un prisme à base triangulaire', 'un prisme à base carrée'],
                correct: 2,
                correction: 'Deux bases carrées et quatre rectangles : c’est un prisme droit à base carrée.',
              },
            ]}
            requires={['patron-prisme', 'patron-cylindre', 'associer-vues']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le patron se lit comme une fiche d’identité : <strong>la base</strong> donne le
                  nom du solide, et le nombre de rectangles confirme combien de côtés elle a.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Regarde d’abord les <strong>deux pièces identiques</strong>{' '}
                  : ce sont les bases, et elles donnent le nom du solide.
                </Feedback>
              )
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && <KnowledgeBrick id="mem-trois-vues" variant="new" compact />}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’atelier d’emballage"
      moduleSubtitle="Des dimensions au carton, et du carton au solide"
      estimatedTime="8 min"
      brief={{
        tag: 'Entraînement',
        title: 'Commander, découper, reconnaître',
        tone: 'amber',
        body: (
          <p>
            Tu sais lire un solide et le déplier. Reste à faire le trajet dans les{' '}
            <strong>deux sens</strong> : des dimensions au carton pour commander, et du carton au
            solide pour reconnaître ce qu’on reçoit.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
