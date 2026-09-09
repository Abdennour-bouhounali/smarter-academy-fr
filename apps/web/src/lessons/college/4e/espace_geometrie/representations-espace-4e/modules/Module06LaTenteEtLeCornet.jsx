import React, { useState } from 'react';
import { Tent } from 'lucide-react';
import { ContentModule, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '@smarter-academy/core';
import {
  PROBLEMES, aireBaseCarree, aireDisque, volumePyramide, arrondi, fr, vol,
} from '../components/espace4e';

/**
 * Module 6 — PRACTICE LAB : sortir la formule des exercices.
 *
 * Les trois situations sont celles de `PROBLEMES` (components/espace4e.js), et
 * chacune est VÉRIFIÉE par `espace4e.test.js` : la bonne réponse comme le
 * piège. Ce module ne recalcule rien à la main — il branche `calcul()` sur la
 * valeur attendue et `piege()` sur le retour ciblé, si bien qu'aucun nombre
 * montré à l'élève ne peut diverger du noyau.
 *
 * Les trois erreurs visées, une par problème :
 *   1. la tente  → oublier le tiers (on calcule le prisme) ;
 *   2. le cornet → oublier le tiers sur une base ronde (on calcule le
 *                  cylindre), et confondre l'aire de base avec le volume ;
 *   3. le toit   → croire que doubler la hauteur quadruple le volume, parce
 *                  qu'on croit que la base double aussi.
 *
 * Les erreurs ne comptent pas comme preuve ici (stage `practice_lab`) : c'est
 * l'atelier, pas l'examen.
 */
const P = Object.fromEntries(PROBLEMES.map((p) => [p.id, p]));

export default function Module06LaTenteEtLeCornet() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const tente = P.tente;
  const cornet = P.cornet;
  const toit = P.toit;

  const vTente = arrondi(tente.calcul(), 2);
  const vTentePiege = arrondi(tente.piege(), 2);
  const vCornet = Math.round(cornet.calcul());
  const vCornetPiege = Math.round(cornet.piege());
  const rapportToit = toit.calcul();
  const vToitAvant = volumePyramide(aireBaseCarree(8), 3);
  const vToitApres = volumePyramide(aireBaseCarree(8), 6);

  const Enonce = ({ p, children }) => (
    <div className="rounded-2xl border-2 border-rose-100 bg-rose-50/50 p-3.5">
      <p className="text-xs font-bold uppercase tracking-wide text-rose-700">{p.titre}</p>
      <p className="mt-1 text-sm text-slate-800">{p.enonce}</p>
      {children}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'La tente',
      done: q1,
      content: (
        <div className="space-y-3">
          <Enonce p={tente} />
          <p className="text-sm text-slate-700">
            La tente a la forme d’une pyramide. L’aire de sa base vaut 3 × 3 ={' '}
            <strong>{fr(aireBaseCarree(3), 0)} m²</strong>.
          </p>
          <NumericQuestion
            prompt={`${tente.question} Donne un résultat au dixième de m³.`}
            expected={vTente}
            parse={parseDec}
            suffix="m³"
            requires={['volume-pyramide', 'aire']}
            explain={`${fr(aireBaseCarree(3), 0)} × ${fr(2.4, 1)} = ${fr(arrondi(aireBaseCarree(3) * 2.4, 1), 1)}, puis ÷ 3 = ${fr(vTente, 1)} m³.`}
            explainFor={(n) => {
              if (n === vTentePiege) return tente.piegeTexte;
              if (n === 9) return '9 m² est l’aire de la base : une aire, pas un volume. Il faut encore multiplier par la hauteur, puis diviser par 3.';
              if (n === 7.2 * 3) return 'Tu as multiplié au lieu de diviser par 3. La pyramide contient MOINS que le prisme, jamais plus.';
              return null;
            }}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <Feedback tone="ok">
              {fr(vTente, 1)} m³ d’air. Sans le tiers, on aurait annoncé {fr(vTentePiege, 1)} m³ —
              trois fois trop.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le cornet',
      done: q2,
      content: (
        <div className="space-y-3">
          <Enonce p={cornet} />
          <p className="text-sm text-slate-700">
            Le cornet a la forme d’un cône. L’aire de son disque de base vaut π × 3 × 3, soit
            environ <strong>{fr(arrondi(aireDisque(3), 1), 1)} cm²</strong>.
          </p>
          <NumericQuestion
            prompt={cornet.question}
            expected={vCornet}
            parse={parseDec}
            suffix="cm³"
            requires={['volume-cone', 'arrondi']}
            explain={`${fr(arrondi(aireDisque(3), 1), 1)} × 12 ÷ 3 ≈ ${vCornet} cm³.`}
            explainFor={(n) => {
              if (n === vCornetPiege) return cornet.piegeTexte;
              if (n === 28) return '28 cm² est l’aire du disque de base : une aire, pas un volume.';
              if (n === 36) return 'Tu as multiplié 3 × 12. Mais B est une AIRE : π × 3 × 3, pas le rayon.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="ok">
              Environ {vCornet} cm³. Le calcul est le même que pour la tente : seule la première
              ligne a changé.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le toit : on double la hauteur',
      done: q3,
      content: (
        <div className="space-y-3">
          <Enonce p={toit} />
          <p className="text-sm text-slate-700">
            Attention : c’est la hauteur qui double, pas le côté de la base. Le carré du dessous
            reste le même.
          </p>
          <NumericQuestion
            prompt={toit.question}
            expected={rapportToit}
            parse={parseDec}
            requires={['volume-pyramide']}
            explain={`Avant : ${fr(vToitAvant, 0)} m³. Après : ${fr(vToitApres, 0)} m³. Le volume est donc multiplié par ${fr(rapportToit, 0)} — la hauteur intervient UNE seule fois dans le calcul.`}
            explainFor={(n) => {
              if (n === 4) return toit.piegeTexte;
              if (n === 8) return 'Par 8, ce serait si les TROIS dimensions doublaient. Ici, seule la hauteur double.';
              if (n === 1) return 'Le volume change bien : il passe de ' + fr(vToitAvant, 0) + ' à ' + fr(vToitApres, 0) + ' m³.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="methode-probleme-volume"
              variant="new"
              lead="Les trois problèmes suivaient le même chemin. Le voici."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et si c’était le côté de la base qui doublait ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le même toit, de <strong>8 m</strong> de côté et <strong>3 m</strong> de haut. Cette
            fois on garde la hauteur et on double le CÔTÉ de la base : il passe à 16 m.
          </p>
          <NumericQuestion
            prompt="Par combien le volume est-il multiplié ?"
            expected={volumePyramide(aireBaseCarree(16), 3) / volumePyramide(aireBaseCarree(8), 3)}
            parse={parseDec}
            requires={['methode-probleme-volume', 'aire']}
            explain="Le côté intervient DEUX fois dans l’aire de la base : 16 × 16 est quatre fois plus grand que 8 × 8. Le volume est donc multiplié par 4."
            explainFor={(n) => {
              if (n === 2) return 'Par 2, ce serait pour la hauteur, qui n’intervient qu’une fois. Le côté de la base, lui, intervient deux fois.';
              if (n === 8) return 'Par 8, ce serait si les trois dimensions doublaient. Ici la hauteur ne change pas.';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Doubler la hauteur double le volume ; doubler le côté de la base le multiplie par
              quatre. Ce n’est pas une règle à retenir, c’est une conséquence du calcul : compte
              combien de fois chaque longueur y apparaît.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="La tente et le cornet"
      moduleSubtitle="Trois situations réelles, trois pièges différents"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'L’atelier',
        tone: 'slate',
        body: (
          <>
            Une tente, un cornet, un toit qu’on modifie. Les erreurs ne comptent pas ici :{' '}
            <strong>c’est l’endroit où l’on se trompe exprès</strong> pour comprendre pourquoi.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <Tent className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Toujours dans le même ordre : quel solide ? quelle base, quelle hauteur ? l’aire de la
            base ? puis la formule.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
