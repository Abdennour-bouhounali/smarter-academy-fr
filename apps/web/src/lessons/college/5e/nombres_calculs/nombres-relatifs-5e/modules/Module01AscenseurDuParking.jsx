import React, { useState } from 'react';
import { Building2, ArrowDownToLine } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ElevatorLab from '../components/ElevatorLab';
import { fmt, IMMEUBLE } from '../components/relatifs';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : l'ascenseur du parking
 * (components/ElevatorLab.jsx).
 *
 * Activity              piloter la cabine d'un immeuble qui continue en sous-sol.
 * Mathematical objective les nombres ne s'arrêtent pas à zéro ; le signe dit
 *                       de quel CÔTÉ du zéro on se trouve, pas une opération.
 * Student action        glisser la cabine, ou la piloter au clavier / aux flèches.
 * Controlled variable   la position de la cabine, et elle seule.
 * Mathematical state    l'étage courant, un entier relatif de −3 à 5.
 * Visual consequence    la cabine bouge, l'étage affiché se réécrit, la ligne
 *                       épaisse du sol reste le repère.
 * Expected observation  « en dessous du rez-de-chaussée, les étages repartent
 *                       avec un signe − » ; « −2 et 2 ne sont pas le même étage ».
 * Misconception targeted lire « −3 » comme « 3 » ou comme une soustraction.
 * Formalization         le mot « nombre relatif » n'arrive qu'à l'étape 4,
 *                       après trois manipulations, porté par une KnowledgeBrick.
 * Transfer              module 2 : le même axe, couché, devient la droite graduée.
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage.
 */
const SOUS_SOL = -2;
const HAUT = 4;

export default function Module01AscenseurDuParking() {
  // Étape 1 — descendre sous le sol.
  const [etage1, setEtage1] = useState(0);
  const [pred1, setPred1] = useState(null);
  const [vus, setVus] = useState(() => new Set([0]));
  const done1 = vus.has(SOUS_SOL);

  // Étape 2 — atteindre un étage nommé, des deux côtés.
  const [etage2, setEtage2] = useState(0);
  const [atteints, setAtteints] = useState(() => new Set());
  const done2 = atteints.has(HAUT) && atteints.has(IMMEUBLE.min);

  // Étape 3 — deux étages, même chiffre, pas le même endroit.
  const [etage3, setEtage3] = useState(3);
  const [paire, setPaire] = useState(() => new Set());
  const done3 = paire.has(3) && paire.has(-3);

  const [q4, setQ4] = useState(false);

  const bouger1 = (e, react) => {
    setEtage1(e);
    const next = new Set(vus); next.add(e); setVus(next);
    if (!done1 && e === SOUS_SOL) react?.(true);
  };

  const bouger2 = (e, react) => {
    setEtage2(e);
    if (e === HAUT || e === IMMEUBLE.min) {
      const next = new Set(atteints); next.add(e); setAtteints(next);
      if (next.has(HAUT) && next.has(IMMEUBLE.min)) react?.(true);
    }
  };

  const bouger3 = (e, react) => {
    setEtage3(e);
    if (e === 3 || e === -3) {
      const next = new Set(paire); next.add(e); setPaire(next);
      if (next.has(3) && next.has(-3)) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Descends sous le rez-de-chaussée',
      subtitle: 'Glisse la cabine, ou utilise les flèches. Le trait épais, c’est le sol.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <ElevatorLab
            value={etage1}
            onChange={(e) => bouger1(e, kit.react)}
            target={done1 ? null : SOUS_SOL}
            ariaLabel={`Ascenseur — cabine à l’étage ${fmt(etage1)}`}
          />
          <PredictionChips
            prompt="Quand la cabine descend au deuxième sous-sol, quel numéro l’écran va-t-il afficher ?"
            options={[
              { id: 'deux', label: '2' },
              { id: 'moins', label: '−2' },
              { id: 'rien', label: 'Rien : il n’y a pas d’étage' },
            ]}
            value={pred1}
            onChange={setPred1}
            disabled={done1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'moins' ? 'Ta prédiction était la bonne' : 'Regarde l’écran'} : l’étage
              s’écrit <strong>{fmt(SOUS_SOL)}</strong>. Sous le rez-de-chaussée, les étages ne
              s’arrêtent pas — ils repartent, et on les distingue de ceux du dessus par un{' '}
              <strong>signe −</strong>. Le rez-de-chaussée, lui, est le <strong>zéro</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              La cible est l’anneau ambre, sous le trait du sol. Descends jusque-là.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Va tout en haut, puis tout en bas',
      subtitle: `Atteins la terrasse (${fmt(HAUT)}), puis le local technique (${fmt(IMMEUBLE.min)}).`,
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <ElevatorLab
            value={etage2}
            onChange={(e) => bouger2(e, kit.react)}
            target={done2 ? null : (atteints.has(HAUT) ? IMMEUBLE.min : HAUT)}
            ariaLabel={`Ascenseur — cabine à l’étage ${fmt(etage2)}`}
          />
          {done2 ? (
            <Feedback tone="ok">
              Tu as parcouru tout l’immeuble : de <strong>{fmt(IMMEUBLE.min)}</strong> à{' '}
              <strong>{fmt(IMMEUBLE.max)}</strong>, en passant par <strong>0</strong>. Les étages
              au-dessus du sol s’écrivent sans signe, ceux du dessous avec un{' '}
              <strong>−</strong>, et le zéro sépare les deux.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {atteints.has(HAUT)
                ? `Terrasse atteinte. Maintenant, descends jusqu’au local technique (${fmt(IMMEUBLE.min)}).`
                : `Commence par monter à la terrasse (${fmt(HAUT)}).`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le 3 et le −3 sont-ils au même endroit ?',
      subtitle: 'Arrête-toi à l’étage 3, puis à l’étage −3. Compare ce que tu vois.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <ElevatorLab
            value={etage3}
            onChange={(e) => bouger3(e, kit.react)}
            target={done3 ? null : (paire.has(3) ? -3 : 3)}
            ariaLabel={`Ascenseur — cabine à l’étage ${fmt(etage3)}`}
          />
          {done3 ? (
            <Feedback tone="ok">
              Deux étages différents, pourtant le même chiffre 3. Ils sont à la{' '}
              <strong>même distance du sol</strong> — trois étages — mais{' '}
              <strong>de part et d’autre</strong>. Ce qui les distingue n’est pas le chiffre :
              c’est le côté du zéro, et c’est exactement ce que dit le signe.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {paire.has(3)
                ? 'Étage 3 vu. Descends maintenant à l’étage −3.'
                : 'Monte d’abord à l’étage 3.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce que le signe raconte',
      done: q4,
      content: (
        <div className="space-y-3">
          {/* Les trois manipulations viennent de montrer que le nombre affiché
              repère une POSITION par rapport au sol, et que le signe en donne
              le côté : c'est l'instant où le mot a un sens, avant la question
              qui l'exige. */}
          <KnowledgeBrick
            id="nombre-relatif"
            variant="new"
            lead={<>Tu viens de descendre sous le zéro, de parcourir tout l’immeuble, et de voir que <strong>3</strong> et <strong>{fmt(-3)}</strong> sont deux étages différents. Ces nombres-là portent un nom.</>}
          />
          <TapQuestion
            prompt={`Dans l’immeuble, que signifie l’étage ${fmt(-3)} ?`}
            options={[
              'Trois étages au-dessous du rez-de-chaussée',
              'Trois étages au-dessus du rez-de-chaussée',
              'Qu’il faut retirer 3 à quelque chose',
              'Qu’il n’y a pas d’étage à cet endroit',
            ]}
            correct={0}
            cols={1}
            requires={['nombre-relatif']}
            explain={`Le signe − ne demande aucun calcul : il indique le CÔTÉ du zéro. ${fmt(-3)} est donc trois étages sous le rez-de-chaussée, et 3 trois étages au-dessus.`}
            explainWrong="Souviens-toi de la cabine : quand elle est passée sous le trait épais du sol, l’écran a affiché un signe −. Il dit où l’on est, pas ce qu’il faut soustraire."
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="L’ascenseur du parking"
      moduleSubtitle="Quand les nombres ne s’arrêtent pas à zéro"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un immeuble qui descend',
        tone: 'indigo',
        body: (
          <p>
            Cet immeuble a des bureaux, une terrasse — et trois niveaux de parking{' '}
            <strong>sous</strong> le rez-de-chaussée. L’ascenseur doit bien afficher quelque chose
            quand il descend. Commence par l’y emmener.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Building2, t: 'Le sol', d: 'Le trait épais : le rez-de-chaussée, c’est le zéro.', c: 'text-slate-700' },
            { icon: ArrowDownToLine, t: 'La cabine', d: 'Glisse-la, ou utilise les flèches ▲ ▼.', c: 'text-indigo-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
