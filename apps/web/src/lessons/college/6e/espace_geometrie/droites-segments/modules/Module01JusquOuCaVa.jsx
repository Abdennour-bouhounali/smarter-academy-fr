import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExtentPuller from '../components/ExtentPuller';

/**
 * Module 1 — TRIGGER.
 *
 * Objectif : découvrir, par le geste, que deux traits d'apparence identique
 * ne se comportent pas pareil quand on tire dessus. Aucun vocabulaire n'est
 * donné avant que la différence n'ait été RESSENTIE.
 *
 * Aha : ce qui distingue ces objets, ce n'est ni leur longueur ni leur
 * direction — c'est jusqu'où ils vont.
 *
 * Misconception visée : « une droite, c'est un segment très long ». Non : un
 * segment, même très long, a un bout ; une droite n'en a pas.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 320, yMax: 170 };

const SEG0 = { kind: 'segment', a: { x: 70, y: 110 }, b: { x: 200, y: 70 } };
const DRO0 = { kind: 'droite', a: { x: 70, y: 110 }, b: { x: 200, y: 70 } };

export default function Module01JusquOuCaVa() {
  const [seg, setSeg] = useState(SEG0);
  const [dro, setDro] = useState(DRO0);
  const [pred, setPred] = useState(null);
  const [segDone, setSegDone] = useState(false);
  const [droDone, setDroDone] = useState(false);
  const [diffDone, setDiffDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Jusqu’où ça va ?"
      moduleSubtitle="Tire sur les bouts du trait : certains s’arrêtent, d’autres non."
      estimatedTime="9 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Deux traits qui se ressemblent… mais pas tant que ça.',
        body: (
          <p>
            Tire sur le bout de chacun (glisse-le, ou utilise le bouton <strong>Prolonger</strong>). Observe
            ce qui se passe quand tu arrives au bord.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Tire sur le premier trait',
          subtitle: 'Va jusqu’au bord de la vue.',
          done: segDone,
          content: (kit) => (
            <div className="space-y-2">
              {/* Prédiction SANS verdict (§6ter.3) : c'est le geste qui
                  répond, jamais un texte de correction. */}
              <PredictionChips
                prompt="en tirant sur le bout, jusqu’où ce trait va-t-il aller ?"
                options={[
                  { id: 'bute', label: 'Il va buter' },
                  { id: 'infini', label: 'Il continuera toujours' },
                ]}
                value={pred}
                onChange={setPred}
              />
              {/* JAMAIS `disabled` : le trait reste tirable après validation —
                  c'est en re-tirant que l'élève confirme que ça bute VRAIMENT
                  (règle projet du 2026-09-06). */}
              <ExtentPuller
                obj={seg}
                onObjChange={setSeg}
                baseBox={BOX}
                pullable="b"
                onBlocked={() => {
                  if (segDone) return;
                  kit.react(true);
                  setSegDone(true);
                }}
                ariaLabel="Premier trait : tire sur son bout"
              />
              {segDone && (
                <>
                  <Feedback tone="ok">
                    Ce trait <strong>s’arrête</strong>. Il a deux bouts, et on ne peut pas aller au-delà.
                  </Feedback>
                  {/* Le geste vient de donner son sens au mot : on le pose ici,
                      pas dans un explain (docs/architecture/KNOWLEDGE_DEPENDENCY.md). */}
                  <KnowledgeBrick
                    id="segment"
                    variant="new"
                    lead="Le trait que tu viens de tirer, et qui a buté sur ses deux bouts."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Tire sur le second trait',
          subtitle: 'Le même geste, un résultat différent.',
          done: droDone,
          content: (kit) => (
            <div className="space-y-2">
              <ExtentPuller
                obj={dro}
                onObjChange={setDro}
                baseBox={BOX}
                pullable="b"
                onExtended={() => {
                  if (droDone) return;
                  kit.react(true);
                  setDroDone(true);
                }}
                ariaLabel="Second trait : tire sur son bout"
              />
              {droDone && (
                <>
                  <Feedback tone="ok">
                    Celui-ci ne s’arrête jamais : on recule la vue, il continue encore. Il n’a{' '}
                    <strong>aucun bout</strong>.
                  </Feedback>
                  <KnowledgeBrick
                    id="droite"
                    variant="new"
                    lead="Le trait qui continuait toujours, quelle que soit la vue."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Qu’est-ce qui les différencie vraiment ?',
          done: diffDone,
          content: (
            <div className="space-y-5">
              {/* Le mot « étendue » est employé par la question et par son
                  explain : il doit exister AVANT, et il est ici la conclusion
                  des deux gestes des étapes 1 et 2. */}
              <KnowledgeBrick
                id="etendue"
                variant="new"
                lead="Deux traits, même départ, même direction — et pourtant ils ne vont pas aussi loin."
              />
              <TapQuestion
                prompt="Ces deux traits partent des mêmes points et vont dans la même direction. Alors, qu’est-ce qui les distingue ?"
                options={[
                  'Jusqu’où ils vont : l’un s’arrête, l’autre non',
                  'Leur longueur : la droite est simplement plus longue',
                  'Leur épaisseur',
                ]}
                correct={0}
                cols={1}
                requires={['etendue', 'segment', 'droite']}
                explain="La seule différence est l’étendue : le segment a deux bouts, la droite n’en a aucun. Ce n’est pas une question de longueur."
                explainWrong="Attention au piège : une droite n’est pas « un segment très long ». Même un segment de 10 km a deux bouts ; une droite n’en a aucun, quelle que soit la vue."
                solved={diffDone}
                onAnswered={() => setDiffDone(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Deux bouts, aucun bout… et s’il n’en avait qu’un seul&nbsp;?
        </KnowledgeSnapshot>
      }
    />
  );
}
