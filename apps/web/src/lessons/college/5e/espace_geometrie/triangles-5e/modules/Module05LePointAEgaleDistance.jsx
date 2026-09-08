import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MediatriceLab from '../components/MediatriceLab';

/**
 * Module 5 — MANIPULATION : le point à égale distance.
 *
 * Le module 4 s'est terminé sur l'idée « l'ensemble des points à égale
 * distance ». On l'applique ici à DEUX sommets à la fois — ce qui donne la
 * médiatrice — puis à trois, ce qui ne devrait pas marcher… et qui marche.
 *
 * LE SUSPENSE EST CONSTRUIT : on montre d'abord une médiatrice, puis deux (qui
 * se coupent, banal : deux droites non parallèles se coupent toujours), et
 * c'est seulement la TROISIÈME qui est surprenante — rien ne l'obligeait à
 * passer par ce point-là. L'élève est invité à essayer de la faire rater.
 *
 * Expected observation : « les trois médiatrices passent toujours par le même
 * point, et ce point est à égale distance des trois sommets ».
 * Misconception targeted : croire que le centre du cercle circonscrit est
 * toujours à l'intérieur du triangle (faux pour un triangle obtusangle).
 */
const DEPART = [{ x: 300, y: 130 }, { x: 180, y: 380 }, { x: 540, y: 340 }];

export default function Module05LePointAEgaleDistance() {
  const [tri, setTri] = useState(DEPART);
  const [nb, setNb] = useState(1);
  const [essais, setEssais] = useState(0);
  const [renonce, setRenonce] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const troisVues = nb >= 3;
  const assez = essais >= 6;

  const steps = [
    {
      num: 1,
      title: 'Une médiatrice, puis deux, puis trois',
      subtitle: 'Révèle-les une par une. La troisième n’avait aucune raison de coopérer.',
      done: troisVues,
      content: (kit) => (
        <div className="space-y-3">
          <MediatriceLab
            tri={tri}
            onTri={setTri}
            nbMediatrices={nb}
            ariaLabel="Un triangle et ses médiatrices, révélées une par une"
          />
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => {
                const suivant = Math.min(3, nb + 1);
                setNb(suivant);
                if (suivant === 3 && !troisVues) kit.react?.(true);
              }}
              disabled={nb >= 3}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition disabled:opacity-40"
            >
              {nb >= 3 ? '✓ les trois sont là' : `▶ Ajouter la ${nb === 1 ? '2ᵉ' : '3ᵉ'} médiatrice`}
            </button>
            <button
              type="button"
              onClick={() => setNb(1)}
              className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition"
            >
              ↺ Recommencer
            </button>
          </div>
          {troisVues ? (
            <Feedback tone="ok">
              Les deux premières médiatrices se coupent — normal, deux droites non parallèles se
              croisent toujours. Mais rien n’obligeait la <strong>troisième</strong> à passer{' '}
              <em>exactement</em> par ce point-là. Et pourtant elle y passe.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Une médiatrice est la droite qui coupe un côté <strong>en son milieu</strong> et{' '}
              <strong>perpendiculairement</strong>. Les petits traits sur les demi-côtés montrent
              qu’ils ont bien la même longueur.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Essaie de faire rater le rendez-vous',
      subtitle: 'Déforme le triangle. Les trois médiatrices vont-elles finir par se manquer ?',
      done: renonce,
      content: (kit) => (
        <div className="space-y-3">
          <MediatriceLab
            tri={tri}
            onTri={(t) => { setTri(t); setEssais((n) => n + 1); }}
            nbMediatrices={3}
            montrerRayons
            ariaLabel="Un triangle déformable dont les trois médiatrices restent concourantes"
          />
          {renonce ? (
            <Feedback tone="ok">
              Impossible de les séparer. Et le tableau de bord donne la raison : le point commun est
              à <strong>la même distance des trois sommets</strong>. Un point sur la médiatrice de
              [AB] est à égale distance de A et B ; s’il est aussi sur celle de [BC], il est à égale
              distance de B et C. Il l’est donc des trois — et la troisième médiatrice, qui
              rassemble les points à égale distance de A et C, ne peut que passer par lui.
            </Feedback>
          ) : (
            <>
              <Feedback tone="info">
                Positions essayées : <strong className="tabular-nums">{essais}</strong>. Surveille
                les trois distances en bas : que remarques-tu ?
              </Feedback>
              {assez && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setRenonce(true); kit.react?.(true); }}
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 transition"
                  >
                    Elles se croisent toujours au même point
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le cercle qui passe par les trois sommets',
      done: q3,
      content: (
        <div className="space-y-3">
          <MediatriceLab
            tri={tri}
            onTri={setTri}
            nbMediatrices={3}
            montrerCercle
            montrerRayons
            ariaLabel="Le cercle circonscrit passe par les trois sommets du triangle"
          />
          <KnowledgeBrick
            id="mediatrices-cercle-circonscrit"
            variant="new"
            lead={<>Un point à égale distance des trois sommets, c’est exactement le centre d’un cercle qui passe par les trois.</>}
          />
          <TapQuestion
            prompt="Pourquoi le point de concours des médiatrices est-il le centre d’un cercle passant par A, B et C ?"
            options={[
              'Parce qu’il est à la même distance des trois sommets',
              'Parce qu’il est au centre du triangle',
              'Parce que les médiatrices sont perpendiculaires',
            ]}
            correct={0}
            cols={1}
            requires={['mediatrices-cercle-circonscrit']}
            explain="Un cercle rassemble les points situés à une même distance de son centre. Comme O est à égale distance de A, B et C, le cercle de centre O passant par A passe forcément aussi par B et par C."
            explainWrong="Ce n’est pas une question de « centre » au sens du milieu : c’est la propriété d’ÉGALE DISTANCE qui fait tout. Le rayon vaut OA = OB = OC, donc le cercle attrape les trois sommets."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Toujours à l’intérieur ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3.5 text-sm text-slate-700">
            Reviens au laboratoire ci-dessus et fabrique un triangle très <strong>aplati</strong>,
            avec un angle largement obtus. Regarde où part le point O.
          </div>
          <TapQuestion
            prompt="Le centre du cercle circonscrit est-il toujours à l’intérieur du triangle ?"
            options={[
              'Non : il sort du triangle quand un angle dépasse 90°',
              'Oui, toujours',
              'Oui, sauf pour les triangles équilatéraux',
            ]}
            correct={0}
            cols={1}
            requires={['mediatrices-cercle-circonscrit']}
            explain="Dans un triangle obtusangle, le centre se trouve à l’EXTÉRIEUR. (Dans un triangle rectangle, il tombe pile sur le milieu du plus grand côté.) Le cercle, lui, passe toujours par les trois sommets."
            explainWrong="Essaie dans le laboratoire : en aplatissant le triangle, tu verras le point O franchir un côté et sortir. Rien n’oblige un point à égale distance des trois sommets à rester dedans."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Les médiatrices partent des <strong>côtés</strong>. Le module suivant s’intéresse aux
              droites qui partent des <strong>sommets</strong> — et à deux d’entre elles qu’on
              confond tout le temps.
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
      moduleTitle="Le point à égale distance"
      moduleSubtitle="Trois droites qui n’avaient aucune raison de se rencontrer"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Un rendez-vous que rien n’imposait',
        tone: 'indigo',
        body: (
          <p>
            Deux droites qui se croisent, c’est banal. Mais qu’une <strong>troisième</strong> passe
            exactement par le même point, cela demande une explication. Et cette explication donne
            un cercle.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
