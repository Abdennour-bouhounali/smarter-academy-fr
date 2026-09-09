import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { SIROP, PISCINE } from '../components/situations';
import { fr } from '../components/propUtils';

/**
 * Module 6 — MANIPULATION : la représentation graphique.
 *
 * C'EST LA NOUVEAUTÉ DE LA 5e. En 6e, le graphique de la proportionnalité est
 * explicitement HORS PROGRAMME ; c'est ici qu'il entre, et c'est pour cela que
 * ce module fait placer les points à la main plutôt que de les montrer.
 *
 * Action → changement → observation → sens :
 *   placer un point de plus → il tombe (ou non) dans l'alignement →
 *   « les deux séries sont alignées ! » → alors l'alignement ne suffit pas :
 *   ce qui décide, c'est le passage par l'origine.
 *
 * Expected observation : « la piscine aussi fait une droite — mais elle ne
 * part pas de zéro ».
 * Misconception targeted : « des points alignés ⇒ proportionnel ». C'est la
 * raison pour laquelle la situation à base est tracée ELLE AUSSI : si on ne
 * montrait qu'une courbe non alignée, l'élève retiendrait le mauvais critère.
 *
 * PÉRIMÈTRE : ni équation de droite, ni fonction linéaire, ni coefficient
 * directeur (3e). On lit un dessin, on ne l'écrit pas.
 *
 * SÉCURITÉ VISUELLE : `unitY` distinct de `unit` (des euros et des litres
 * n'ont pas le même ordre de grandeur), et le cadre contient toujours
 * l'origine — sans quoi le critère du module serait invisible.
 */

/** Les couples que l'élève place, calculés par les règles — jamais écrits. */
const XS = [0, 2, 4, 6, 8];

export default function Module06LaLigneDroite() {
  // Étape 1 — placer les points du sirop, un à un.
  const [placed, setPlaced] = useState([]);
  const done1 = placed.length >= XS.length;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const placer = (x, react) => {
    if (placed.includes(x)) return;
    const next = [...placed, x];
    setPlaced(next);
    react?.(true);
  };

  const siropPoints = placed
    .slice()
    .sort((a, b) => a - b)
    .map((x) => ({ id: `s${x}`, x, y: SIROP.apply(x), color: '#4f46e5' }));

  const steps = [
    {
      num: 1,
      title: 'Place les points du sirop',
      subtitle: 'Chaque couple (verres ; litres) devient un point du repère.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            On reprend le sirop : <strong>0,15 L par verre</strong>. Place les cinq couples, et
            regarde la forme qui apparaît.
          </div>

          <div className="flex flex-wrap gap-2">
            {XS.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => placer(x, kit.react)}
                disabled={placed.includes(x)}
                className={`min-h-[44px] px-3 rounded-xl border-2 text-sm font-bold transition-colors ${
                  placed.includes(x)
                    ? 'border-indigo-300 bg-indigo-100 text-indigo-400'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
                }`}
              >
                ({x} ; {fr(SIROP.apply(x))})
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 9, yMin: 0, yMax: 1.4 }}
              unit={30}
              unitY={150}
              xStep={1}
              yStep={0.2}
              points={siropPoints}
              axisLabels={{ x: 'verres', y: 'litres' }}
              ariaLabel="Repère : le sirop en fonction du nombre de verres"
              caption={false}
            />
          </div>

          {done1 ? (
            <Feedback tone="ok">
              Les cinq points sont <strong>alignés</strong>, et la droite qui les porte part du
              coin en bas à gauche, le point <strong>(0 ; 0)</strong> — on l’appelle{' '}
              <strong>l’origine du repère</strong>. C’est logique : 0 verre, c’est 0 litre de
              sirop.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Touche les couples un à un. Où tombe celui de <strong>0 verre</strong> ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Et la piscine ?',
      subtitle: 'La situation qui ne doublait pas. Regarde bien avant de répondre.',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 9, yMin: 0, yMax: 40 }}
              unit={30}
              unitY={5}
              xStep={1}
              yStep={5}
              points={XS.map((x) => ({
                id: `p${x}`,
                x,
                y: PISCINE.apply(x),
                color: '#e11d48',
              }))}
              axisLabels={{ x: 'entrées', y: '€' }}
              ariaLabel="Repère : la dépense à la piscine en fonction du nombre d’entrées"
              caption={false}
            />
          </div>
          <TapQuestion
            prompt="Les points de la piscine sont-ils alignés ?"
            options={[
              'Oui, ils sont alignés — mais la droite ne part pas de (0 ; 0)',
              'Non, ils ne sont pas alignés',
            ]}
            cols={1}
            correct={0}
            requires={['proportionnalite', 'grandeurs-liees']}
            explain="Ils sont bien alignés : chaque entrée ajoute toujours 2 €. Mais la droite démarre à 20 € pour 0 entrée — le prix de la carte. Elle ne passe donc pas par l’origine."
            explainWrong="Regarde de près : les points forment bien une droite, parce que chaque entrée coûte le même prix. C’est justement pour cela que « alignés » ne suffit pas à conclure."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Les deux conditions',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* L'élève vient de voir DEUX séries alignées : la brique peut
              maintenant énoncer le critère complet sans être une règle tombée
              du ciel. */}
          <KnowledgeBrick
            id="graphique-proportionnalite"
            variant="new"
            lead={<>Tes deux dessins sont alignés. Un seul est proportionnel — la différence est au point de départ.</>}
          />
          <TapQuestion
            prompt="À quoi reconnaît-on une situation de proportionnalité sur un graphique ?"
            options={[
              'Les points sont alignés ET la droite passe par l’origine',
              'Les points sont alignés',
              'La courbe monte',
            ]}
            cols={1}
            correct={0}
            requires={['graphique-proportionnalite']}
            explain="Les deux conditions sont nécessaires. La piscine remplit la première mais pas la seconde : elle n’est pas proportionnelle."
            explainWrong="L’alignement seul ne suffit pas — la piscine est alignée et n’est pourtant pas proportionnelle. Il faut aussi que la droite passe par le point (0 ; 0)."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Lire le coefficient sur le dessin',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <CoordPlane
              range={{ xMin: 0, xMax: 6, yMin: 0, yMax: 15 }}
              unit={40}
              unitY={16}
              xStep={1}
              yStep={3}
              points={[1, 2, 3, 4, 5].map((x) => ({
                id: `c${x}`,
                x,
                y: 2.5 * x,
                color: '#059669',
              }))}
              axisLabels={{ x: 'costumes', y: 'm' }}
              ariaLabel="Repère : le tissu en fonction du nombre de costumes"
              caption={false}
            />
          </div>
          <TapQuestion
            prompt={
              <>
                Cette droite passe par l’origine. Quel est le coefficient de proportionnalité de
                la situation ?
              </>
            }
            options={['2,5 m par costume', '5 m par costume', '1 m par costume', '12,5 m par costume']}
            cols={2}
            correct={0}
            requires={['graphique-proportionnalite', 'coefficient-proportionnalite']}
            explain="Il suffit de lire la valeur pour UNE unité : à 1 costume correspond 2,5 m. Le coefficient se lit donc directement sur le graphique."
            explainWrong="12,5 m est la valeur atteinte pour 5 costumes, pas pour 1. Le coefficient est toujours la valeur pour une seule unité : 12,5 ÷ 5 = 2,5."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La ligne droite"
      moduleSubtitle="Reconnaître la proportionnalité sur un graphique"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Ça se voit — mais pas à ce qu’on croit',
        tone: 'indigo',
        body: (
          <p>
            Range les couples d’une situation dans un repère, et une forme apparaît. Beaucoup
            d’élèves retiennent « alignés, donc proportionnel ». <strong>Place les points</strong>{' '}
            des deux situations de la fête, et tu verras pourquoi ce n’est pas suffisant.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
