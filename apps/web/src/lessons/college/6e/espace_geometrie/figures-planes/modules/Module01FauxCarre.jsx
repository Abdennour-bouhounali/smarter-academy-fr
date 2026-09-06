import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeLab from '../components/ShapeLab';
import { shapeName, sideLengths, classifyQuad } from '../components/figuresUtils';

/**
 * Module 1 — TRIGGER (conflit cognitif).
 *
 * Objectif : casser « ça ressemble à un carré, donc c'en est un ». Deux
 * figures paraissent identiques ; en affichant les mesures, l'une se révèle
 * n'être qu'un quadrilatère quelconque.
 *
 * Aha : l'œil ne décide pas. Ce sont les mesures — côtés et angles — qui
 * décident du nom d'une figure.
 *
 * Misconception visée : nommer une figure d'après son allure. C'est LE
 * réflexe à casser avant tout vocabulaire.
 *
 * Honnêteté du dispositif : les deux verdicts viennent de `classifyQuad`.
 * Le « faux carré » n'est pas déclaré faux — il l'est, et on peut le vérifier.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 220 };

// A : vrai carré. B : 8 px d'écart sur un côté — invisible, mais réel.
// Le texte de correction DÉRIVE les longueurs (max / min) au lieu d'indexer
// un côté : un index codé en dur affichait « 130 contre 130 » parce que le
// côté long est le n° 2, pas le n° 1.
const VRAI = [{ x: 60, y: 50 }, { x: 190, y: 50 }, { x: 190, y: 180 }, { x: 60, y: 180 }];
const FAUX = [{ x: 60, y: 50 }, { x: 190, y: 50 }, { x: 198, y: 180 }, { x: 60, y: 180 }];

export default function Module01FauxCarre() {
  const [revealed, setRevealed] = useState(false);
  const [predictDone, setPredictDone] = useState(false);
  const [measureDone, setMeasureDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le faux carré"
      moduleSubtitle="Cette figure ressemble à un carré. Mesure-la."
      estimatedTime="8 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Deux figures. Une seule est un carré.',
        body: (
          <p>
            Regarde-les bien, puis fais ta prédiction. Ensuite, on affichera les mesures — et on verra qui
            avait raison.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Laquelle est un vrai carré ?',
          subtitle: 'À l’œil, pour l’instant.',
          done: predictDone,
          content: (
            <TapQuestion
              above={
                <div className="grid sm:grid-cols-2 gap-3">
                  {[['Figure A', VRAI], ['Figure B', FAUX]].map(([label, pts]) => (
                    <div key={label} className="space-y-1">
                      <p className="text-xs font-mono text-center text-slate-500">{label}</p>
                      <ShapeLab
                        points={pts}
                        box={BOX}
                        draggable={false}
                        showName={false}
                        showProperties={false}
                        ariaLabel={`${label}, à examiner`}
                      />
                    </div>
                  ))}
                </div>
              }
              prompt="À ton avis, laquelle de ces deux figures est réellement un carré ?"
              options={['La figure A', 'La figure B', 'Les deux']}
              correct={0}
              cols={3}
              explain="C’est la figure A. La B a un côté plus long de 8 : sur un dessin, ça ne se voit pas — mais ça suffit à ce qu’elle ne soit pas un carré."
              explainWrong="Impossible de trancher à l’œil : c’est exactement le piège. Affichons les mesures à l’étape suivante."
              requires={[]}
              solved={predictDone}
              onAnswered={() => setPredictDone(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Affiche les mesures',
          done: measureDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                {[['Figure A', VRAI], ['Figure B', FAUX]].map(([label, pts]) => (
                  <div key={label} className="space-y-1">
                    <p className="text-xs font-mono text-center text-slate-500">{label}</p>
                    <ShapeLab
                      points={pts}
                      box={BOX}
                      draggable={false}
                      showName={revealed}
                      showProperties={revealed}
                      showLengths={revealed}
                      ariaLabel={`${label} : ${revealed ? shapeName(pts) : 'mesures masquées'}`}
                    />
                  </div>
                ))}
              </div>

              {!measureDone && (
                <button
                  type="button"
                  onClick={() => {
                    if (!revealed) { setRevealed(true); return; }
                    kit.react(true);
                    setMeasureDone(true);
                  }}
                  className="w-full min-h-[44px] rounded-xl bg-indigo-600 text-white font-bold text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  {revealed ? 'J’ai vu la différence' : '🔍 Afficher les longueurs des côtés'}
                </button>
              )}

              {measureDone && (
                <KnowledgeBrick
                  id="propriete-decide"
                  variant="new"
                  lead="Deux figures identiques à l’œil, et un seul verdict après mesure."
                />
              )}

              {revealed && (
                <Feedback tone={measureDone ? 'ok' : 'info'}>
                  La figure A a ses quatre côtés égaux et ses quatre angles droits : c’est un{' '}
                  <strong>carré</strong>. La figure B, elle, a un côté de{' '}
                  <strong className="font-mono">{Math.round(Math.max(...sideLengths(FAUX)))}</strong> contre{' '}
                  <strong className="font-mono">{Math.round(Math.min(...sideLengths(FAUX)))}</strong> : ce n’est qu’un{' '}
                  <strong>{shapeName(FAUX)}</strong>.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Qu’est-ce qui décide, alors ?',
          done: ruleDone,
          content: (
            <TapQuestion
              prompt="Pour affirmer qu’une figure est un carré, sur quoi faut-il se fonder ?"
              options={[
                'Sur ses propriétés mesurées : côtés et angles',
                'Sur son allure générale sur le dessin',
                'Sur sa taille',
              ]}
              correct={0}
              cols={1}
              requires={['propriete-decide']}
              explain="Une figure porte un nom parce qu’elle vérifie des propriétés précises — jamais parce qu’elle « fait penser à ». C’est tout le programme de cette leçon."
              explainWrong="La figure B ressemblait parfaitement à un carré, et n’en était pas un. L’allure ne prouve rien : seules les mesures décident."
              solved={ruleDone}
              onAnswered={() => setRuleDone(true)}
            />
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Reste à savoir <em>quelles</em> mesures regarder — et comment on
          les appelle.
        </KnowledgeSnapshot>
      }
    />
  );
}
