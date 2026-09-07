import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ShapeLab from '../components/ShapeLab';
import { shapeName, sideLengths, classifyQuad, propertiesOf } from '../components/figuresUtils';

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
 *
 * ── LE LABORATOIRE (§6bis) ────────────────────────────────────────────
 * L'étape 2 ne se contente plus d'AFFICHER les mesures du faux carré : elle
 * met le sommet D entre les mains de l'élève. Il tire, et il voit le nom de
 * la figure changer tout seul — « quadrilatère quelconque » puis « carré »
 * puis à nouveau quelconque — avec le codage des côtés égaux et les marques
 * d'angle droit qui s'allument et s'éteignent d'eux-mêmes.
 *
 * Ce qui ENSEIGNE ici, c'est l'INVARIANT : la figure ne redevient un carré
 * que pour une position précise du sommet, et le nom suit les mesures, pas
 * l'apparence. L'élève ne peut pas « tricher » : `classify` recalcule tout à
 * partir des seuls sommets.
 */
const BOX = { xMin: 0, yMin: 0, xMax: 300, yMax: 220 };

// A : vrai carré. B : 8 px d'écart sur un côté — invisible, mais réel.
// Le texte de correction DÉRIVE les longueurs (max / min) au lieu d'indexer
// un côté : un index codé en dur affichait « 130 contre 130 » parce que le
// côté long est le n° 2, pas le n° 1.
const VRAI = [{ x: 60, y: 50 }, { x: 190, y: 50 }, { x: 190, y: 180 }, { x: 60, y: 180 }];
const FAUX = [{ x: 60, y: 50 }, { x: 190, y: 50 }, { x: 198, y: 180 }, { x: 60, y: 180 }];

export default function Module01FauxCarre() {
  const [predictDone, setPredictDone] = useState(false);
  const [measureDone, setMeasureDone] = useState(false);
  const [ruleDone, setRuleDone] = useState(false);

  /* Le laboratoire : l'élève déforme le FAUX carré. Le sommet D (index 2)
     est le seul mobile — les trois autres tiennent la figure, sans quoi
     « réparer » le carré relèverait du hasard. */
  const [pts, setPts] = useState(FAUX);
  /* Les noms de figure réellement traversés : c'est la trace de
     l'exploration, et elle prouve que le nom a changé sous ses doigts. */
  const [vus, setVus] = useState([shapeName(FAUX)]);
  const estCarre = classifyQuad(pts) === 'carre';

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
          title: 'Répare le faux carré',
          subtitle: 'Attrape le sommet D et déplace-le. Le nom change tout seul.',
          done: measureDone,
          content: (kit) => (
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
                Voici la <strong>figure B</strong>, celle qui n’était pas un carré. Tire son sommet{' '}
                <strong>D</strong> jusqu’à ce qu’elle en devienne un.
              </div>

              {/* LE laboratoire : on saisit le sommet lui-même. Le nom, le
                  codage des côtés égaux et les marques d'angle droit sont
                  tous DÉRIVÉS des sommets — la figure ne peut pas mentir.
                  Jamais figé : même réparée, elle reste déformable. */}
              <ShapeLab
                points={pts}
                onPointsChange={(next) => {
                  setPts(next);
                  const nom = shapeName(next);
                  setVus((v) => (v.includes(nom) ? v : [...v, nom]));
                  if (!measureDone && classifyQuad(next) === 'carre') {
                    kit.react(true);
                    setMeasureDone(true);
                  }
                }}
                box={BOX}
                // Seul D bouge : les trois autres sommets tiennent la figure.
                lockedIndices={[0, 1, 3]}
                // Sans aimantation, retomber sur le carré exact serait un jeu
                // d'adresse : la tolérance est serrée pour que deux côtés
                // « égaux » affichent le même nombre (figuresUtils, TOL).
                snapEqualSides
                snapRightAngle
                showLengths
                showName
                showProperties
                ariaLabel={`Figure B à réparer — actuellement : ${shapeName(pts)}`}
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm text-slate-600">
                Noms traversés :{' '}
                <strong className="font-mono">{vus.join(' → ')}</strong>
              </div>

              <Feedback tone={estCarre ? 'ok' : 'info'}>
                {estCarre ? (
                  <>
                    C’est maintenant un <strong>carré</strong> : les quatre côtés affichent le même
                    nombre et les quatre angles droits sont marqués. Continue à tirer D — tu vas le
                    lui faire reperdre aussitôt.
                  </>
                ) : (
                  <>
                    Pour l’instant : <strong>{shapeName(pts)}</strong>. Les côtés ne sont pas tous
                    égaux, ou un angle n’est pas droit — regarde les nombres, pas l’allure.
                  </>
                )}
              </Feedback>

              {measureDone && (
                <>
                  <Feedback tone="ok">
                    Le nom a changé <em>tout seul</em>, sans que personne ne rebaptise la figure :
                    il suit les <strong>mesures</strong>. Un écart de quelques unités, invisible à
                    l’œil, suffisait à lui retirer son titre de carré.
                  </Feedback>
                  <KnowledgeBrick
                    id="propriete-decide"
                    variant="new"
                    lead="Deux figures identiques à l’œil, et un seul verdict après mesure — tu viens de faire basculer ce verdict à la main."
                  />
                </>
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
