import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import CoordPlane from '../../../../../common/components/CoordPlane';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { affine, square, imageOf, tableOf, formatRule } from '../components/functionUtils';
import { parseDec, formatDec } from '@smarter-academy/core';

/**
 * Module 4 — MANIPULATION : « Du tableau au repère ».
 *
 * Activity: placer un point par ligne du tableau, puis lire le graphique
 *   obtenu avec un curseur.
 * Mathematical objective: un point du graphique EST un couple (x ; f(x)).
 *   Placer les points d'une fonction affine les fait tomber sur une droite ;
 *   ceux du carré, non — l'allure vient de la règle, pas du hasard.
 * Student action: régler le point puis le valider ; puis déplacer le curseur
 *   de lecture.
 * Controlled variable: la position du point (x ; y), au pas de 1.
 * Mathematical state: { placed: {x → y} } comparé à tableOf(RULE, XS).
 * Visual consequence: un point juste s'agrafe et se colore ; un point faux
 *   reste visible et le fantôme montre où il aurait dû aller.
 * Expected observation: « ils sont alignés » pour la droite, « ça se creuse »
 *   pour le carré.
 * Misconception targeted: « les points d'une fonction sont toujours alignés ».
 * Feedback: l'écart entre le point posé et le fantôme est la correction ;
 *   après 3 essais, une échappée place le point restant.
 * Formalization: le mot « représentation graphique » vient après le tracé.
 * Scaffolding: 1er point guidé (cible affichée) → les suivants sans cible →
 *   lecture au curseur sans tableau.
 * Transfer: le module 5 se sert de l'allure pour NOMMER la fonction.
 */

const RULE = affine(2, -1);          // f(x) = 2x − 1
const XS = [-1, 0, 1, 2, 3];
const TARGET = tableOf(RULE, XS);
const RANGE = { xMin: -3, xMax: 5, yMin: -5, yMax: 7 };

const G = square();
const G_RANGE = { xMin: -3, xMax: 3, yMin: -1, yMax: 9 };

export default function Module04DuTableauAuRepere() {
  const [cur, setCur] = useState({ x: -1, y: 0 });
  const [placed, setPlaced] = useState([]);       // [{x, y}] validés
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [wrong, setWrong] = useState(null);       // dernier essai faux

  const [cursorX, setCursorX] = useState(2);
  const [readDone, setReadDone] = useState(false);
  const [shapeDone, setShapeDone] = useState(false);
  const [alignDone, setAlignDone] = useState(false);

  const nextTarget = TARGET.find((t) => !placed.some((p) => p.x === t.x)) ?? null;
  const done1 = placed.length === TARGET.length || revealed;

  const validate = (kit) => {
    if (done1 || !nextTarget) return;
    const ok = cur.x === nextTarget.x && cur.y === nextTarget.y;
    if (ok) {
      setPlaced((prev) => [...prev, { x: cur.x, y: cur.y }]);
      setWrong(null);
      kit.react(true);
    } else {
      setWrong({ ...cur });
      setTries((t) => t + 1);
      kit.react(false);
    }
  };

  const revealAll = (kit) => {
    setPlaced(TARGET.map((t) => ({ ...t })));
    setRevealed(true);
    setWrong(null);
    kit.react(false);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Du tableau au repère"
      moduleSubtitle="Chaque ligne du tableau devient un point. Les points dessinent la fonction."
      estimatedTime="11 min"
      brief={{
        tag: '📍 Mission 04',
        title: 'Une ligne, un point',
        tone: 'indigo',
        body: (
          <p>
            Le tableau de <MathText>{'$f(x) = 2x - 1$'}</MathText> est rempli. Place chaque
            couple dans le repère et regarde ce que les points dessinent.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Place les cinq points',
          subtitle: 'Déplace le point, puis valide.',
          done: done1,
          content: (kit) => (
            <div className="space-y-3">
              {/* Le tableau reste sous les yeux : c'est LUI qu'on transporte. */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Tableau de valeurs de f</caption>
                  <tbody>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600">x</th>
                      {TARGET.map((t) => (
                        <td key={`x${t.x}`}
                          className={`px-2 text-center font-mono tabular-nums ${nextTarget?.x === t.x ? 'bg-amber-100 rounded font-bold' : ''}`}>
                          {formatDec(t.x)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <th scope="row" className="text-left pr-2 font-semibold text-slate-600">f(x)</th>
                      {TARGET.map((t) => (
                        <td key={`y${t.x}`}
                          className={`px-2 text-center font-mono tabular-nums ${nextTarget?.x === t.x ? 'bg-amber-100 rounded font-bold' : ''}`}>
                          {formatDec(t.y)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              <CoordPlane
                range={RANGE}
                unit={30}
                step={1}
                points={[
                  ...placed.map((p) => ({ id: `p${p.x}`, x: p.x, y: p.y, color: '#059669' })),
                  ...(done1 ? [] : [{ id: 'M', name: 'M', x: cur.x, y: cur.y, color: '#4f46e5' }]),
                ]}
                draggableId={done1 ? null : 'M'}
                onPointChange={(p) => { setCur(p); setWrong(null); }}
                target={!done1 && nextTarget && placed.length === 0 ? nextTarget : null}
                ghost={wrong && nextTarget ? { ...nextTarget, label: 'ici' } : null}
                functions={done1 ? [{ id: 'f', a: RULE.a, b: RULE.b, tone: 'emerald', dashed: true }] : []}
                ariaLabel="Repère : place le point du tableau"
                caption={!done1}
              />

              {!done1 && (
                <>
                  <button
                    type="button"
                    onClick={() => validate(kit)}
                    className="w-full min-h-[48px] rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-blue-500"
                    style={{ touchAction: 'manipulation' }}
                  >
                    Poser le point
                  </button>
                  <Feedback tone={wrong ? 'ko' : 'info'}>
                    {wrong ? (
                      <>
                        Tu as posé ({formatDec(wrong.x)} ; {formatDec(wrong.y)}). Le tableau
                        demande ({formatDec(nextTarget.x)} ; {formatDec(nextTarget.y)}) : le
                        premier nombre est l’antécédent, le second son image.
                      </>
                    ) : (
                      <>
                        Il reste <strong>{TARGET.length - placed.length}</strong> point
                        {TARGET.length - placed.length > 1 ? 's' : ''} à placer. Colonne
                        surlignée : x = {formatDec(nextTarget?.x ?? 0)}.
                      </>
                    )}
                  </Feedback>
                  {tries >= 3 && (
                    <button
                      type="button"
                      onClick={() => revealAll(kit)}
                      className="w-full min-h-[44px] rounded-xl border-2 border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                      style={{ touchAction: 'manipulation' }}
                    >
                      Je ne trouve pas — montre-moi les points
                    </button>
                  )}
                </>
              )}

              {done1 && (
                <Feedback tone={revealed ? 'info' : 'ok'}>
                  {revealed ? 'On te les montre : ' : 'Les cinq points sont posés. '}
                  ils sont <strong>alignés</strong>. Cette droite est la{' '}
                  <strong>représentation graphique</strong> de f.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Lire sans calculer',
          subtitle: 'Déplace le curseur et lis la valeur sur la droite.',
          done: readDone,
          content: (kit) => (
            <div className="space-y-3">
              <CoordPlane
                range={RANGE}
                unit={30}
                functions={[{ id: 'f', a: RULE.a, b: RULE.b, tone: 'indigo', label: 'f' }]}
                cursor={{ x: cursorX, onChange: setCursorX }}
                xStep={1}
                ariaLabel="Repère : déplace le curseur pour lire f(x)"
              />
              <NumericQuestion
                prompt={<>Place le curseur sur <MathText>{'$x = 4$'}</MathText> et lis : que vaut <MathText>{'$f(4)$'}</MathText> ?</>}
                expected={imageOf(RULE, 4)}
                parse={parseDec}
                display={formatDec(imageOf(RULE, 4))}
                explain="Sur la droite, au-dessus de 4, on lit 7. Et par le calcul : 2 × 4 − 1 = 7. Le graphique et la règle disent la même chose."
                explainFor={(n) => {
                  if (n === 4) return 'Tu as relu l’abscisse. On demande l’ORDONNÉE du point, c’est-à-dire la hauteur.';
                  if (n === 8) return 'Tu as multiplié par 2 sans enlever 1.';
                  return null;
                }}
                solved={readDone}
                onAnswered={(ok) => { setReadDone(true); kit.react(ok); }}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Toujours une droite ?',
          subtitle: 'Voici les points d’une autre machine : celle qui met au carré.',
          done: shapeDone,
          content: (
            <TapQuestion
              prompt="Ces points sont-ils alignés ?"
              above={
                <CoordPlane
                  range={G_RANGE}
                  unit={30}
                  points={tableOf(G, [-3, -2, -1, 0, 1, 2, 3]).map((p) => ({
                    id: `g${p.x}`, x: p.x, y: p.y, color: '#e11d48',
                  }))}
                  ariaLabel="Repère : les points de la fonction carré"
                  caption={false}
                />
              }
              options={[
                'Non — ils dessinent une courbe qui se creuse',
                'Oui, comme tout à l’heure',
                'Oui, mais la droite est penchée autrement',
              ]}
              correct={0}
              cols={1}
              explain="Les points de x² ne sont pas alignés : la sortie augmente de plus en plus vite. L’allure du graphique dépend de la RÈGLE — toutes les fonctions ne donnent pas une droite."
              explainWrong="Regarde les hauteurs : 1, 0, 1, 4, 9. Les écarts ne sont pas constants, donc les points ne peuvent pas être alignés."
              solved={shapeDone}
              onAnswered={() => setShapeDone(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Qu’est-ce qu’un point du graphique ?',
          done: alignDone,
          content: (
            <TapQuestion
              prompt={<>Le point de coordonnées <MathText>{'$(3 \\; ; \\; 5)$'}</MathText> est sur la courbe de f. Que peut-on affirmer ?</>}
              options={[
                'f(3) = 5 : 5 est l’image de 3',
                'f(5) = 3 : 3 est l’image de 5',
                'f(3) = f(5)',
                'La fonction vaut 3 et 5 en même temps',
              ]}
              correct={0}
              cols={1}
              explain="Un point de la courbe se lit (antécédent ; image). L’abscisse est ce qu’on entre, l’ordonnée ce qui sort : f(3) = 5."
              explainWrong="L’abscisse vient toujours en premier, et c’est elle qu’on entre dans la fonction."
              solved={alignDone}
              onAnswered={() => setAlignDone(true)}
            />
          ),
        },
      ]}
      footer={
        <Feedback tone="info">
          Tableau, règle et graphique décrivent <strong>la même fonction</strong>. Au module
          suivant, l’allure du graphique va servir à lui donner son nom.
        </Feedback>
      }
    />
  );
}
