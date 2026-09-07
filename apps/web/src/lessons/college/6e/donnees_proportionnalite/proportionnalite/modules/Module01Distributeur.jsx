import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coins } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import StretchLab from '../components/StretchLab';
import { CREPES, BARQUE } from '../components/kermesseData';
import { applyRule, formatDec } from '../components/proportionUtils';

/**
 * Module 1 — LABORATOIRE : « la grandeur qu'on tire, et l'autre qui suit ».
 *
 * Activity: l'élève SAISIT la barre des jetons et l'étire ; la barre des
 *   crêpes se redessine en même temps, sans clic entre le geste et l'effet.
 * Mathematical objective: identifier les deux grandeurs qui varient ensemble
 *   (LP P3) et faire naître le constat « quand l'une double, l'autre double »
 *   (LP P1), sans qu'aucun mot savant soit prononcé.
 * Student action: un glissement continu — le geste EST la transformation.
 * Mathematical state: un seul nombre, la quantité tirée. Tout le reste
 *   (longueurs, nombres, repères, écart) en dérive par `applyRule`.
 * Expected observation: 2 → 6 ; on tire 2 vers 4, l'autre passe à 12. Le
 *   coefficient n'est pas annoncé : il ÉMERGE du geste, parce que la barre du
 *   bas reste toujours le même multiple de celle du haut.
 * Controlled surprise (étape 3) : la barque. MÊME geste, et cette fois la
 *   barre du bas refuse de doubler — un fantôme rouge marque l'endroit où
 *   elle serait si elle suivait. C'est le contre-exemple qui définit la
 *   notion, et il est produit par la règle affine, pas écrit à la main.
 *
 * REFONTE DU 2026-09-07 (« deep WOW »). L'ancienne version proposait cinq
 * boutons de quantité (1, 2, 3, 5, 10) : l'élève CHOISISSAIT une valeur dans
 * une liste, il ne tirait rien. Entre 2 et 4 il n'y avait rien — donc rien à
 * voir. Ici la quantité est continue : le rapport tient à CHAQUE pixel, et
 * c'est cette permanence-là qui est la proportionnalité.
 *
 * RÈGLE PROJET : le laboratoire n'est jamais figé après validation d'une
 * étape (pas de `disabled` sur `StretchLab`) — l'élève peut continuer à
 * explorer, y compris pendant qu'il répond.
 *
 * CONTRAT « connaissances avant la demande » : ce module ne nomme PAS la
 * proportionnalité ni le coefficient ; il pose `deux-grandeurs` puis
 * `double-double`, et les questions ne requièrent que cela. Les mots savants
 * appartiennent au module 2, où le × constant est TROUVÉ.
 */
const PRIX = (n) => applyRule(CREPES.rule, n);
const BARQUE_PRIX = (n) => applyRule(BARQUE.rule, n);

export default function Module01Distributeur() {
  /* Étape 1 — le laboratoire libre. */
  const [qty, setQty] = useState(2);
  const [pred, setPred] = useState(null);
  const [reach, setReach] = useState({ lo: false, hi: false }); // les deux extrêmes atteints
  const [span, setSpan] = useState({ min: 2, max: 2 });         // l'amplitude parcourue

  /* Étape 3 — le doublement, vécu et non prédit dans un QCM. */
  const [dblQty, setDblQty] = useState(2);
  const [dblSeen, setDblSeen] = useState(false);

  /* Étape 4 — la barque : le même geste, un autre comportement. */
  const [barqueQty, setBarqueQty] = useState(1);
  const [barqueSeen, setBarqueSeen] = useState(false);

  const [grandeursDone, setGrandeursDone] = useState(false);
  const [nomDone, setNomDone] = useState(false);

  // L'étape 1 est franchie quand l'élève a réellement PARCOURU la course :
  // touché un petit nombre, touché un grand. Un seul clic ne suffit pas.
  const explored = reach.lo && reach.hi && span.max - span.min >= 5;

  const onStretch = (v) => {
    setQty(v);
    setReach((r) => ({ lo: r.lo || v <= 2, hi: r.hi || v >= 9 }));
    setSpan((s) => ({ min: Math.min(s.min, v), max: Math.max(s.max, v) }));
  };

  // Le doublement se constate sur la figure : l'élève amène la barre à 4 après
  // l'avoir vue à 2 — la mesure de départ reste marquée par un repère.
  const dblDouble = dblQty === 4;

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le distributeur de crêpes"
      moduleSubtitle="Tire la barre des jetons. Regarde ce que fait l’autre."
      estimatedTime="9 min"
      brief={{
        tag: '⚖️ Mission 01',
        title: 'La kermesse ouvre. Le distributeur, lui, ne parle pas.',
        body: (
          <p>
            Aucune règle affichée, aucune explication : <strong className="text-white">tire</strong> la
            quantité de jetons, regarde la seconde barre, et déduis comment la machine fonctionne.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Tire la barre des jetons',
          subtitle: 'La seconde barre suit tout de suite : rien à valider.',
          done: explored,
          content: (kit) => (
            <div className="space-y-4">
              <StretchLab
                rule={CREPES.rule}
                min={1}
                max={10}
                step={1}
                value={qty}
                onChange={(v) => {
                  onStretch(v);
                  if (!explored) kit.react?.(true);
                }}
                xLabel="Jetons"
                yLabel="Crêpes"
                readout={
                  <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                    <p className="font-mono text-sm text-slate-800">
                      <strong>{formatDec(qty)}</strong> jeton{qty > 1 ? 's' : ''} →{' '}
                      <strong>{formatDec(PRIX(qty))}</strong> crêpe{PRIX(qty) > 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Va jusqu’au bout de la piste, puis reviens tout au début.
                    </p>
                  </div>
                }
              />
              <PredictionChips
                prompt="quand la barre du haut sera deux fois plus longue, celle du bas sera…"
                options={[
                  { id: 'plus2', label: 'plus longue de 2' },
                  { id: 'double', label: 'deux fois plus longue' },
                  { id: 'pareil', label: 'presque pareille' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={explored}
              />
              {explored && (
                <>
                  <Feedback tone="ok">
                    Deux barres, et deux seulement, ont bougé sous ton doigt. Elles ne bougent jamais
                    l’une sans l’autre — et jamais n’importe comment : la verte est restée{' '}
                    <strong>toujours trois fois</strong> la bleue, du début à la fin de la piste.
                  </Feedback>
                  <KnowledgeBrick
                    id="deux-grandeurs"
                    variant="new"
                    lead="Deux choses bougeaient sur cet écran, et pas trois."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Qu’est-ce qui varie ?',
          done: grandeursDone,
          content: (
            <TapQuestion
              prompt="Dans cette situation, quelles sont les DEUX quantités qui varient ensemble ?"
              options={[
                'Le nombre de jetons et le nombre de crêpes',
                'Le nombre de crêpes et la taille du stand',
                'Le nombre de jetons et le temps d’attente',
              ]}
              correct={0}
              cols={1}
              explain="Deux grandeurs varient ensemble : les jetons qu’on donne et les crêpes qu’on reçoit. Repérer CE QUI varie avec QUOI est toujours la première chose à faire."
              requires={['deux-grandeurs']}
              solved={grandeursDone}
              onAnswered={() => setGrandeursDone(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Amène la barre exactement au double',
          subtitle: 'Le trait gris marque là où tu étais. Double-le.',
          done: dblSeen,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Départ : <strong className="font-mono">2 jetons → {PRIX(2)} crêpes</strong>. Tire
                maintenant jusqu’à <strong>4 jetons</strong>, le double — et surveille la barre verte.
              </p>
              <StretchLab
                rule={CREPES.rule}
                min={1}
                max={10}
                step={1}
                value={dblQty}
                onChange={(v) => {
                  setDblQty(v);
                  if (v === 4 && !dblSeen) { setDblSeen(true); kit.react?.(true); }
                }}
                xLabel="Jetons"
                yLabel="Crêpes"
                ticks={[2]}
                readout={
                  <div
                    className={`rounded-xl border-2 px-3 py-2.5 text-center ${
                      dblDouble ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p className="font-mono text-sm text-slate-800">
                      2 → {PRIX(2)} &nbsp;·&nbsp; {formatDec(dblQty)} → {formatDec(PRIX(dblQty))}
                    </p>
                    {dblDouble && (
                      <p className="text-xs font-bold text-emerald-700 mt-0.5">
                        Double de jetons, double de crêpes : {PRIX(2)} × 2 = {PRIX(4)}.
                      </p>
                    )}
                  </div>
                }
              />
              {dblSeen && (
                <>
                  <Feedback tone="ok">
                    {pred === 'double'
                      ? 'Ta prédiction tenait : '
                      : pred
                      ? 'Ta prédiction disait autre chose, et pourtant : '
                      : ''}
                    en doublant les jetons, tu as doublé les crêpes — pas ajouté 2. Et ce n’est pas
                    propre à 2 : refais-le depuis 3, depuis 5, la barre verte double à chaque fois.
                  </Feedback>
                  <KnowledgeBrick
                    id="double-double"
                    variant="new"
                    lead="Ton geste vient de le montrer — et il le montrerait pour n’importe quelle quantité."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'La barque ne suit pas',
          subtitle: 'Même geste, une autre machine. Regarde bien.',
          done: barqueSeen,
          content: (kit) => (
            <div className="space-y-3">
              <div className="bg-slate-900 text-white rounded-2xl px-4 py-3">
                <p className="text-sm font-semibold">{BARQUE.title}</p>
                <p className="text-xs text-slate-300 mt-1">{BARQUE.context}</p>
              </div>
              <p className="text-sm text-slate-600">
                Tire le nombre de personnes de <strong>1</strong> à <strong>2</strong>. Le trait rouge
                montre où le prix serait s’il suivait comme les crêpes.
              </p>
              <StretchLab
                rule={BARQUE.rule}
                min={1}
                max={6}
                step={1}
                value={barqueQty}
                onChange={(v) => {
                  setBarqueQty(v);
                  if (v >= 2 && !barqueSeen) { setBarqueSeen(true); kit.react?.(true); }
                }}
                xLabel="Personnes"
                yLabel="Prix"
                yUnit="€"
                ticks={[1]}
                showGhost
                readout={
                  <div className="rounded-xl border-2 border-slate-200 bg-slate-50 px-3 py-2.5 text-center space-y-0.5">
                    <p className="font-mono text-sm text-slate-800">
                      1 personne → {BARQUE_PRIX(1)} € &nbsp;·&nbsp; {formatDec(barqueQty)} →{' '}
                      {formatDec(BARQUE_PRIX(barqueQty))} €
                    </p>
                    {barqueQty > 1 && (
                      <p className="text-xs font-bold text-rose-700">
                        Si le prix suivait : {formatDec(BARQUE_PRIX(1) * barqueQty)} €. Il manque{' '}
                        {formatDec(BARQUE_PRIX(1) * barqueQty - BARQUE_PRIX(barqueQty))} €.
                      </p>
                    )}
                  </div>
                }
              />
              {barqueSeen && (
                <Feedback tone="info">
                  Ici la barre du bas grandit aussi — mais elle refuse de doubler. Deux grandeurs
                  peuvent monter ensemble sans se suivre exactement. Le distributeur de crêpes, lui,
                  suivait à la lettre : c’est cette différence-là que la leçon va creuser.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 5,
          title: 'Jusqu’où va cette régularité ?',
          done: nomDone,
          content: (
            <div className="space-y-3">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-center font-mono text-sm text-slate-700 space-y-0.5">
                <p>2 jetons → {PRIX(2)} crêpes</p>
                <p>4 jetons → {PRIX(4)} crêpes</p>
              </div>
              <TapQuestion
                prompt="Et si on prenait la MOITIÉ des jetons — 1 au lieu de 2 ?"
                options={[`${PRIX(1)} crêpes, la moitié de ${PRIX(2)}`, `${PRIX(2) - 1} crêpes, une de moins`, `${PRIX(2)} crêpes, comme avant`]}
                correct={0}
                cols={1}
                explain={`${PRIX(1)} crêpes : la machine suit dans les deux sens. Moitié de jetons, moitié de crêpes — exactement comme double donnait double.`}
                explainWrong={`Enlever un jeton n’enlève pas une crêpe. Passer de 2 jetons à 1, c’est prendre la moitié : on obtient la moitié des crêpes, soit ${PRIX(1)}.`}
                requires={['double-double', 'deux-grandeurs']}
                solved={nomDone}
                onAnswered={() => setNomDone(true)}
              />
              {nomDone && (
                <Feedback tone="info">
                  Dans les deux sens, la machine suit exactement. Il reste à découvrir <strong>comment</strong>{' '}
                  elle calcule — et ce qu’on trouvera là mérite un nom.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={1}>
            <strong>La suite.</strong> Tu connais le comportement de la machine. Au prochain module, tu
            trouves l'opération exacte qui le produit — et elle porte un nom.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Coins className="w-6 h-6 mx-auto text-indigo-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Deux grandeurs, une machine, et un comportement régulier.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
