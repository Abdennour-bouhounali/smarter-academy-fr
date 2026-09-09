import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VueMystere from '../components/VueMystere';

/**
 * Module 3 — MANIPULATION : les trois vues, ensemble, déterminent le solide.
 *
 * Le module 1 a montré le manque (une vue ne suffit pas). Ici l'élève
 * découvre le remède du dessin technique : trois projections qui, prises
 * ENSEMBLE, ne laissent plus d'ambiguïté.
 *
 * Le geste : révéler les vues une à une et s'arrêter dès qu'on peut conclure.
 * Ce n'est pas un habillage — c'est exactement la démarche du lecteur de plan,
 * et elle rend sensible que la vue de dessus est ici la vue décisive.
 *
 * Misconception targeted (M6) : conclure d'une seule vue. Le module l'empêche
 * structurellement : tant que la vue décisive n'est pas ouverte, les deux
 * emballages restent indiscernables — et le composant le montre.
 */
const ORDRE = ['face', 'cote', 'dessus'];

export default function Module03LireLesTroisVues() {
  const [ouvertes, setOuvertes] = useState(['face']);
  const [conclu, setConclu] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const toutesOuvertes = ouvertes.length === ORDRE.length;

  const ouvrir = (react) => {
    const suivante = ORDRE[ouvertes.length];
    if (!suivante) return;
    const next = [...ouvertes, suivante];
    setOuvertes(next);
    if (next.includes('dessus') && !conclu) { setConclu(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Ouvre les vues une à une',
      subtitle: 'Arrête-toi dès que tu peux dire lequel des deux cartons c’est.',
      done: conclu,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-3.5 text-sm text-slate-700">
            Le plan d’atelier d’un carton donne <strong>trois vues</strong>. Ouvre-les dans
            l’ordre et regarde à partir de quand les deux emballages cessent de se ressembler.
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-center text-xs font-semibold text-slate-500">🍫 Boîte de chocolats</p>
              <VueMystere solide="prisme" vues={ouvertes} highlight="dessus" />
            </div>
            <div className="space-y-1">
              <p className="text-center text-xs font-semibold text-slate-500">🍵 Boîte de thé</p>
              <VueMystere solide="cylindre" vues={ouvertes} highlight="dessus" />
            </div>
          </div>

          {!toutesOuvertes && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => ouvrir(kit.react)}
                className="min-h-[44px] rounded-xl border-2 border-emerald-500 bg-emerald-500 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Ouvrir la vue {ORDRE[ouvertes.length] === 'cote' ? 'de côté' : 'de dessus'}
              </button>
            </div>
          )}

          {conclu ? (
            <Feedback tone="ok">
              C’est la <strong>vue de dessus</strong> qui tranche : un <strong>triangle</strong>{' '}
              pour la boîte de chocolats, un <strong>disque</strong> pour la boîte de thé. Les deux
              premières vues, elles, étaient identiques — la troisième était nécessaire.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Pour l’instant les deux colonnes montrent la <strong>même chose</strong> : impossible
              de conclure. Ouvre la vue suivante.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois vues, un seul solide',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="trois-vues"
            variant="new"
            lead={<>C’est la raison pour laquelle un plan d’atelier en donne toujours trois, et pas une.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque solide, quelle est sa <strong>vue de dessus</strong> ?
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: 'Un cylindre',
                options: ['un disque', 'un rectangle', 'un triangle'],
                correct: 0,
                correction: 'Vu de dessus, on regarde sa base : c’est un disque.',
              },
              {
                id: 'r2',
                label: 'Un prisme droit à base triangulaire',
                options: ['un rectangle', 'un triangle', 'un disque'],
                correct: 1,
                correction: 'Vu de dessus, on regarde sa base : c’est un triangle.',
              },
              {
                id: 'r3',
                label: 'Un pavé droit',
                options: ['un disque', 'un triangle', 'un rectangle'],
                correct: 2,
                correction: 'Vu de dessus, sa base est un rectangle.',
              },
            ]}
            requires={['trois-vues', 'vue']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  La vue de dessus montre la <strong>base</strong> du solide — c’est pour cela
                  qu’elle distingue si bien un prisme d’un cylindre.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Pour chaque ligne, demande-toi : si je regarde ce solide{' '}
                  <strong>d’en haut</strong>, quelle forme est-ce que je vois ? C’est sa base.
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
      title: 'La méthode du lecteur de plan',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="associer-vues"
            variant="new"
            lead={<>Voici, dans l’ordre, ce que tu viens de faire.</>}
          />
          <TapQuestion
            prompt="Un plan montre : de face un rectangle, de côté un rectangle, de dessus un disque. De quel solide s’agit-il ?"
            options={[
              'Un cylindre',
              'Un pavé droit',
              'Un prisme droit à base triangulaire',
              'Impossible à dire avec trois vues',
            ]}
            correct={0}
            cols={2}
            requires={['associer-vues', 'trois-vues', 'solide-usuel']}
            explain="La vue de dessus est un disque : la base est un disque, c’est donc un cylindre. Les deux autres vues confirment — un cylindre vu de face ou de côté donne bien un rectangle."
            explainWrong="Trois vues suffisent justement à conclure : c’est leur raison d’être. Ici la vue de dessus montre un disque, donc la base est un disque — c’est un cylindre. Un pavé donnerait un rectangle de dessus, un prisme triangulaire un triangle."
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
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Lire les trois vues"
      moduleSubtitle="Ce qu’une seule image ne peut pas dire, trois le disent"
      estimatedTime="9 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le plan de l’atelier',
        tone: 'indigo',
        body: (
          <p>
            Un fabricant ne travaille pas sur une photo : il travaille sur un plan à{' '}
            <strong>trois vues</strong>. Découvre laquelle, ici, est la vue décisive.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={3} />}
    />
  );
}
