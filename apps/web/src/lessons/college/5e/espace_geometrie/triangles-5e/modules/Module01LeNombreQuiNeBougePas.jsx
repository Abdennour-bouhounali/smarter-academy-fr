import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TriangleLab from '../components/TriangleLab';
import { sommeAngles, triangleAngles, natureDe, fr } from '../components/triangles';

/**
 * Module 1 — DÉCLENCHEUR : le nombre qui ne bouge pas.
 *
 * §6bis — la leçon OUVRE sur la manipulation : l'étape 1 rend le laboratoire,
 * pas une définition. L'élève traîne les sommets et regarde les trois angles
 * changer chacun de leur côté.
 *
 * L'expérience surprenante — celle que le brief demande : les trois angles
 * varient sans arrêt, et pourtant leur SOMME affiche obstinément 180,0°. Ce
 * n'est pas une propriété qu'on annonce : c'est un fait qui résiste à toutes
 * les tentatives de le casser, y compris les formes extrêmes.
 *
 * Le module ne démontre RIEN. La preuve est la découverte du module 2, et la
 * lui prendre la viderait. Ici on installe seulement la conviction — et
 * l'envie de savoir pourquoi.
 *
 * Expected observation : « chaque angle change, mais le total reste 180° ».
 * Misconception targeted : croire que la somme dépend de la forme ou de la
 * taille du triangle (« un grand triangle a de plus grands angles »).
 */
const DEPART = [{ x: 300, y: 130 }, { x: 160, y: 380 }, { x: 560, y: 350 }];

export default function Module01LeNombreQuiNeBougePas() {
  const [tri, setTri] = useState(DEPART);
  const [essais, setEssais] = useState(0);
  const [renonce, setRenonce] = useState(false);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const assez = essais >= 8;
  const angles = triangleAngles(tri);
  const nature = natureDe(tri);

  const bouger = (t) => {
    setTri(t);
    setEssais((n) => n + 1);
  };

  const steps = [
    {
      num: 1,
      title: 'Déforme le triangle autant que tu veux',
      subtitle: 'Traîne les trois sommets. Surveille les trois angles — et surtout leur total.',
      done: renonce,
      content: (kit) => (
        <div className="space-y-3">
          <TriangleLab
            tri={tri}
            onTri={bouger}
            ariaLabel="Un triangle dont on traîne les sommets, avec ses trois angles et leur somme mesurés en direct"
          />
          {!renonce && (
            <>
              {essais < 3 && (
                /* §6ter.3 — une prédiction se recueille SANS verdict. */
                <PredictionChips
                  prompt="avant de tout déformer : à ton avis, que va faire le total des trois angles ?"
                  options={[
                    { id: 'change', label: 'Il va changer avec la forme' },
                    { id: 'fixe', label: 'Il va rester le même' },
                    { id: 'taille', label: 'Il dépendra de la taille' },
                  ]}
                  value={pred}
                  onChange={setPred}
                />
              )}
              <Feedback tone="info">
                Positions essayées : <strong className="tabular-nums">{essais}</strong>. Essaie un
                triangle très <strong>pointu</strong>, un très <strong>aplati</strong>, un{' '}
                <strong>énorme</strong>, un minuscule. Ton but : faire afficher autre chose que
                180°.
              </Feedback>
              {assez && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setRenonce(true); kit.react?.(true); }}
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 transition"
                  >
                    Le total ne change jamais
                  </button>
                </div>
              )}
            </>
          )}
          {renonce && (
            <Feedback tone="ok">
              {pred === 'fixe' ? 'Ta prédiction était la bonne' : 'Et pourtant'} : les trois angles
              changent sans arrêt — <strong>chacun</strong> de son côté — mais leur total reste{' '}
              <strong>bloqué sur 180°</strong>. Ce n’est pas un hasard d’affichage : c’est vrai pour
              tous les triangles du monde.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Même pour les formes extrêmes ?',
      subtitle: 'Reprends le laboratoire : aplatis le triangle le plus possible, puis rends-le minuscule.',
      done: renonce,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Ton triangle est actuellement{' '}
            <strong>
              {nature.equilateral ? 'équilatéral' : nature.isocele ? 'isocèle' : nature.rectangle ? 'rectangle' : nature.obtusangle ? 'obtusangle' : 'quelconque'}
            </strong>, avec des angles de {angles.map((a) => `${fr(a, 0)}°`).join(', ')}. Change-le
            complètement de nature : le total tiendra bon.
          </div>
          <Feedback tone="ok">
            Aucune forme n’y échappe. Un triangle a beau être immense ou minuscule, pointu ou
            aplati, ses trois angles totalisent <strong>toujours 180°</strong>.
          </Feedback>
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que tu viens de constater',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* La brique nomme un fait constaté des dizaines de fois — elle ne
              l'annonce pas, et elle ne le démontre pas encore. */}
          <KnowledgeBrick
            id="somme-angles-triangle"
            variant="new"
            lead={<>Tu as essayé de faire bouger ce total sans y parvenir une seule fois. Voilà ce que cela signifie.</>}
          />
          <TapQuestion
            prompt="Un très grand triangle et un tout petit triangle. Que peut-on dire de la somme de leurs angles ?"
            options={[
              'Elle vaut 180° pour les deux',
              'Elle est plus grande pour le grand triangle',
              'Cela dépend de leur forme',
            ]}
            correct={0}
            cols={3}
            requires={['somme-angles-triangle']}
            explain="La somme ne dépend ni de la taille, ni de la forme : elle vaut 180° pour absolument tous les triangles. Tu l’as vérifié toi-même sur des dizaines de formes."
            explainWrong="Agrandir un triangle allonge ses côtés, mais n’ouvre pas ses angles : les angles restent exactement les mêmes, et leur somme aussi."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une contrainte très forte',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans un triangle, deux angles mesurent 100° et 90°. Est-ce possible ?"
            options={[
              'Non : ils totalisent déjà 190°, c’est trop',
              'Oui : le troisième mesurera −10°',
              'Oui, si le triangle est très grand',
            ]}
            correct={0}
            cols={3}
            requires={['somme-angles-triangle']}
            explain="100 + 90 = 190, ce qui dépasse déjà 180°. Il ne resterait rien pour le troisième angle : un tel triangle ne peut pas exister."
            explainWrong="Un angle ne peut pas être négatif. Comme les trois angles totalisent exactement 180°, deux angles qui dépassent déjà ce total rendent le triangle impossible."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu sais que c’est vrai. Mais <strong>pourquoi</strong> 180, et pas 200 ou 173 ? Le
              module suivant le démontre — avec une paire de ciseaux.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le nombre qui ne bouge pas"
      moduleSubtitle="Un total qui résiste à toutes les déformations"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Essaie de faire changer ce nombre',
        tone: 'violet',
        body: (
          <p>
            Traîne les sommets d’un triangle : ses trois angles changent sans arrêt. Mais un nombre,
            en bas de l’écran, <strong>refuse obstinément de bouger</strong>. À toi d’essayer de le
            prendre en défaut.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
