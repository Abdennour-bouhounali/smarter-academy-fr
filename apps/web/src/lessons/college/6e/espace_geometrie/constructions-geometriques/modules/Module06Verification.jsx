import React, { useState } from 'react';
import { ContentModule, BatchChoiceQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { ERREURS, INSTRUMENTS, INSTRUMENTS_LIST } from '../components/constructionsUtils';

/**
 * Module 6 — PRACTICE LAB : diagnostiquer une construction (P10, P11).
 *
 * Objectif : vérifier une figure, c'est reprendre ses propriétés une à une —
 * et quand l'une manque, savoir quel instrument l'aurait garantie.
 *
 * Aha : une erreur de construction se DIAGNOSTIQUE. « C'est raté » ne suffit
 * pas ; il faut dire quelle propriété est fausse, et avec quoi la corriger.
 *
 * Misconception visée : croire qu'une figure « presque juste » est juste, ou
 * ne pas savoir relier un défaut à l'instrument qui l'aurait évité.
 */
export default function Module06Verification() {
  const [diagDone, setDiagDone] = useState(false);
  const [verifDone, setVerifDone] = useState(false);
  const [presqueDone, setPresqueDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="L’atelier de vérification"
      moduleSubtitle="Trouve l’erreur, nomme l’instrument qui l’aurait évitée."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 06',
        title: 'Trois figures ratées, trois causes différentes.',
        body: (
          <p>
            Pour chacune, dis quel instrument aurait garanti la propriété manquante.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Diagnostique chaque erreur',
          done: diagDone,
          content: (
            <BatchChoiceQuestion
              requires={['instrument-garantit', 'mem-trois-garanties', 'angle-droit']}
              intro={
                <div className="space-y-2">
                  {ERREURS.map((e, i) => (
                    <div key={e.id} className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-2.5">
                      <span className="font-mono text-xs text-rose-500 mr-2">Figure {i + 1}</span>
                      <span className="text-sm text-rose-900">{e.figure}</span>
                    </div>
                  ))}
                  <p className="text-sm text-slate-600">
                    Quel instrument aurait évité chaque défaut ?
                  </p>
                </div>
              }
              rows={ERREURS.map((e, i) => ({
                id: e.id,
                label: <span className="font-semibold">Figure {i + 1}</span>,
                options: INSTRUMENTS_LIST.map((x) => x.nom),
                correct: INSTRUMENTS_LIST.findIndex((x) => x.id === e.instrument),
                correction: <>{INSTRUMENTS[e.instrument].nom}</>,
              }))}
              solved={diagDone}
              onAnswered={() => setDiagDone(true)}
              feedback={({ allRight, nCorrect, total }) => (
                <Feedback tone={allRight ? 'ok' : 'ko'}>
                  {!allRight && (
                    <>
                      {nCorrect} / {total} corrects — les bonnes réponses sont en vert.{' '}
                    </>
                  )}
                  Chaque défaut correspond à une propriété non garantie : longueur → règle ou compas, angle
                  droit → équerre, distance constante au centre → compas.
                </Feedback>
              )}
            />
          ),
        },
        {
          num: 2,
          title: 'Comment vérifier une construction ?',
          done: verifDone,
          content: (
            <div className="space-y-5">
              {/* Le diagnostic vient d'être fait figure par figure : on en
                  tire la méthode générale, avant de la demander. */}
              <KnowledgeBrick
                id="verifier-figure"
                variant="new"
                lead="Tu viens de faire, pour trois figures, ce qu’on appelle vérifier."
              />
              <TapQuestion
                prompt="On te demande de vérifier qu’une figure est bien un rectangle. Que fais-tu ?"
                options={[
                  'Je contrôle ses 4 angles droits à l’équerre et l’égalité des côtés opposés à la règle',
                  'Je regarde si elle ressemble à un rectangle',
                  'Je remesure un seul côté',
                ]}
                correct={0}
                cols={1}
                requires={['verifier-figure', 'figures-planes-usuelles', 'angle-droit']}
                explain="Vérifier, c’est reprendre CHAQUE propriété de la définition, avec l’instrument qui la garantit. Un seul contrôle ne suffit jamais."
                explainWrong="L’allure ne prouve rien — c’est ce que la leçon « Figures planes » a montré. Et un seul côté mesuré laisse trois côtés et quatre angles non vérifiés."
                solved={verifDone}
                onAnswered={() => setVerifDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Une figure « presque juste »',
          done: presqueDone,
          content: (
            <div className="space-y-5">
              {/* La règle du « tout ou rien » ne vivait que dans l'`explain` :
                  on la pose avant la question qu'elle sert à trancher. */}
              <KnowledgeBrick
                id="presque-nest-pas-juste"
                variant="new"
                lead="Une dernière chose avant de trancher le cas suivant."
              />
              <TapQuestion
                prompt="Un élève rend un « carré » dont les côtés mesurent 5 cm, 5 cm, 5 cm et 5,3 cm. Que faut-il dire ?"
                options={[
                  'Ce n’est pas un carré : la propriété « 4 côtés égaux » n’est pas vérifiée',
                  'C’est un carré, l’écart est minime',
                  'C’est un carré si les angles sont droits',
                ]}
                correct={0}
                cols={1}
                requires={['presque-nest-pas-juste', 'verifier-figure', 'figures-planes-usuelles']}
                explain="Une propriété est vérifiée ou ne l’est pas. 5,3 ≠ 5 : cette figure a bien 4 angles droits, c’est donc un rectangle — mais pas un carré."
                explainWrong="En géométrie, « presque » n’existe pas. Avec 4 angles droits mais des côtés inégaux, la figure est un rectangle, pas un carré."
                solved={presqueDone}
                onAnswered={() => setPresqueDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Ta carte est complète. La mission finale ne demandera rien de
          neuf : dix épreuves sur exactement ce que tu viens de construire.
        </KnowledgeSnapshot>
      }
    />
  );
}
