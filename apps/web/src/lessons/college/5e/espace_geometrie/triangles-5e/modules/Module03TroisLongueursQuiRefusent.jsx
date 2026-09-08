import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FermetureLab from '../components/FermetureLab';
import { diagnostiquerCotes, fr } from '../components/triangles';

/**
 * Module 3 — DÉCOUVERTE : trois longueurs qui refusent.
 *
 * Les angles sont sous contrainte (M1-M2) ; les côtés le sont aussi. Ce module
 * ne donne pas la règle : il donne un curseur. L'élève allonge le grand côté
 * jusqu'à ce que le triangle refuse de se fermer, et cherche à la main OÙ se
 * situe exactement la frontière.
 *
 * §6bis — l'étape 1 rend le laboratoire, pas une définition.
 *
 * LE CAS D'ÉGALITÉ EST LE CŒUR DU MODULE. À 12 = 5 + 7, la figure est plate :
 * c'est un segment, pas un triangle. L'élève doit rencontrer ce cas limite
 * lui-même, sinon il retiendra « inférieur ou égal » — l'erreur classique.
 *
 * Expected observation : « quand le grand côté dépasse la somme des deux
 * autres, ils n'arrivent plus à se rejoindre ».
 * Misconception targeted : croire que trois longueurs quelconques forment
 * toujours un triangle ; et accepter le cas d'égalité.
 */
export default function Module03TroisLongueursQuiRefusent() {
  const [grand, setGrand] = useState(9);
  const [vuImpossible, setVuImpossible] = useState(false);
  const [vuPlat, setVuPlat] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const P1 = 5;
  const P2 = 7;
  const diag = diagnostiquerCotes(P1, P2, grand);

  const bouger = (v, react) => {
    setGrand(v);
    const d = diagnostiquerCotes(P1, P2, v);
    if (!d.possible && d.raison === 'trop-court' && !vuImpossible) {
      setVuImpossible(true);
      react?.(true);
    }
    if (Math.abs(v - (P1 + P2)) < 0.05 && !vuPlat) setVuPlat(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Allonge le grand côté jusqu’à ce que ça casse',
      subtitle: 'Deux côtés mesurent 5 et 7. Fais grandir le troisième et regarde ce qui arrive.',
      done: vuImpossible,
      content: (kit) => (
        <div className="space-y-3">
          <FermetureLab
            a={P1} b={P2} c={grand}
            ariaLabel="Trois barres articulées qui tentent de former un triangle ; le grand côté s’allonge"
          />
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-600 shrink-0">3ᵉ côté :</span>
            <input
              type="range"
              min={3} max={16} step={0.5}
              value={grand}
              onChange={(e) => bouger(Number(e.target.value), kit.react)}
              className="w-full accent-sky-600"
              aria-label="Longueur du troisième côté"
            />
            <span className="font-mono text-base font-black tabular-nums text-sky-700 shrink-0 w-12 text-right">
              {fr(grand, 1)}
            </span>
          </div>
          {vuImpossible ? (
            <Feedback tone="ok">
              Passé une certaine longueur, les deux côtés courts sont{' '}
              <strong>trop courts pour se rejoindre</strong> : ils ont beau se coucher l’un vers
              l’autre au maximum, il reste un trou. Le triangle ne peut pas exister.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Fais glisser le curseur vers la droite. À partir de quelle longueur le triangle
              refuse-t-il de se fermer ? Le laboratoire te dit à chaque fois ce qui se passe.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le cas limite : exactement 12',
      subtitle: 'Place le curseur sur 12, c’est-à-dire 5 + 7. Que vois-tu ?',
      done: vuPlat,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-sky-200 bg-sky-50 p-3.5 text-sm text-slate-700">
            Reviens au curseur et pose-le pile sur <strong>12</strong>. Les deux côtés se touchent
            enfin… mais regarde bien la figure obtenue.
          </div>
          {vuPlat ? (
            <Feedback tone="ok">
              Les trois points sont <strong>alignés</strong> : la figure est complètement plate.
              C’est un <strong>segment</strong>, pas un triangle — il n’a ni surface, ni angles.
              Le cas d’égalité est donc <strong>exclu</strong> lui aussi.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Place le curseur exactement sur 12 pour voir ce cas particulier.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La règle',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="inegalite-triangulaire"
            variant="new"
            lead={<>Tu as trouvé la frontière toi-même : elle se situe exactement à 5 + 7 = 12, et ce cas-là est déjà de trop.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque triplet de longueurs, dis si un triangle est possible.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: '3 cm, 4 cm, 6 cm',
                options: ['Possible', 'Impossible'],
                correct: 0,
                correction: '6 < 3 + 4 = 7 : le triangle se ferme.',
              },
              {
                id: 'r2',
                label: '2 cm, 3 cm, 8 cm',
                options: ['Impossible', 'Possible'],
                correct: 0,
                correction: '8 > 2 + 3 = 5 : les deux petits côtés ne peuvent pas se rejoindre.',
              },
              {
                id: 'r3',
                label: '4 cm, 6 cm, 10 cm',
                options: ['Impossible', 'Possible'],
                correct: 0,
                correction: '10 = 4 + 6 exactement : la figure est plate, c’est un segment. Le cas d’égalité est exclu.',
              },
              {
                id: 'r4',
                label: '7 cm, 7 cm, 7 cm',
                options: ['Possible', 'Impossible'],
                correct: 0,
                correction: '7 < 7 + 7 = 14 : c’est le triangle équilatéral.',
              },
            ]}
            requires={['inegalite-triangulaire']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  Le réflexe est bon : repère le <strong>plus grand</strong> côté, additionne les
                  deux autres, et compare. Il faut du <strong>strictement inférieur</strong>.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Procède toujours dans le même ordre : quel est le plus
                  grand côté ? Combien font les deux autres ensemble ? Et n’oublie pas que{' '}
                  <strong>l’égalité ne suffit pas</strong> — elle donne un segment.
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
      title: 'Une seule comparaison suffit-elle ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pour vérifier que trois longueurs forment un triangle, combien de comparaisons faut-il faire ?"
            options={[
              'Une seule : celle qui concerne le plus grand côté',
              'Trois : une pour chaque côté',
              'Deux : n’importe lesquelles',
            ]}
            correct={0}
            cols={1}
            requires={['inegalite-triangulaire']}
            explain="Si le plus grand côté est déjà inférieur à la somme des deux autres, les deux autres comparaisons sont automatiquement vraies : un petit côté est forcément inférieur à une somme qui contient le grand. Vérifier le plus grand suffit donc."
            explainWrong="Les trois comparaisons ne sont pas indépendantes : dès que la plus exigeante — celle du plus grand côté — est satisfaite, les deux autres le sont aussi. Une seule vérification bien choisie suffit."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu sais maintenant <strong>quelles</strong> longueurs ferment. Le module suivant les
              construit pour de bon — à la règle et au compas.
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
      moduleTitle="Trois longueurs qui refusent"
      moduleSubtitle="Où se situe exactement la frontière ?"
      estimatedTime="12 min"
      brief={{
        tag: 'Découverte',
        title: 'Toutes les longueurs ne se valent pas',
        tone: 'indigo',
        body: (
          <p>
            On peut donner trois longueurs à un menuisier et le voir revenir bredouille : certaines
            barres <strong>refusent de fermer</strong>. Allonge le troisième côté, et trouve à
            partir d’où cela casse.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
