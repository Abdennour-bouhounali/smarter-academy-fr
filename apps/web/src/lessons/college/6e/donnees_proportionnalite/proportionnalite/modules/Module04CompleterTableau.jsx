import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Table2 } from 'lucide-react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ProportionTable from '../components/ProportionTable';
import ArrowReader from '../components/ArrowReader';
import { CREPES } from '../components/kermesseData';
import { applyRule, ratioAt, parseDec, formatDec } from '../components/proportionUtils';

/**
 * Module 4 — MANIPULATION : compléter un tableau, case par case.
 *
 * L'élève remplit un tableau de proportionnalité dont les cases sont
 * volontairement choisies pour appeler des chemins DIFFÉRENTS :
 *
 *   x = 1  → passage par l'unité (division)  ← la case clé, demandée en 1er
 *   x = 6  → multiplication depuis 3 (×2) ou depuis l'unité
 *   x = 10 → multiplication depuis l'unité (le plus rapide)
 *   x = 9  → linéarité additive : 9 = 6 + 3, donc y(9) = y(6) + y(3)
 *
 * Aucune méthode n'est imposée : après chaque case, le module MONTRE les
 * chemins possibles, et la dernière étape fait remarquer qu'ils donnent tous
 * la même réponse. C'est ce qui prépare le module 5 (choisir), sans encore
 * demander de choisir.
 *
 * ÉTAPE 1 — LE LABO D'ABORD (règle projet du 2026-09-05, INTERACTION_PEDAGOGY
 * §6bis). Avant de demander une seule valeur, l'élève TRAÎNE une flèche sur
 * le tableau et découvre par le geste les deux lectures qu'il devra ensuite
 * employer : vers le bas le même × 3 partout, sur le côté un facteur qui
 * dépend des colonnes et qui agit sur les DEUX lignes à la fois. Les chemins
 * de l'étape 3 ne tombent donc plus du ciel — ils ont été vus bouger.
 */
const K = ratioAt(CREPES.rule, 1); // 3
const Y = (x) => applyRule(CREPES.rule, x);

const CELLS = [
  { x: 1, hint: "Une seule crêpe : on DIVISE le prix de 3 crêpes par 3. C'est le passage par l'unité." },
  { x: 6, hint: '6 crêpes, c’est 2 fois 3 crêpes : on double le prix de 3 crêpes.' },
  { x: 10, hint: 'Une fois l’unité connue, 10 crêpes coûtent 10 fois le prix d’une seule.' },
  { x: 9, hint: '9 = 6 + 3 : on peut additionner deux prix déjà trouvés.' },
];

export default function Module04CompleterTableau() {
  const [found, setFound] = useState([]);
  const [chemDone, setChemDone] = useState(false);
  // Le labo d'ouverture : la flèche, et les lectures DISTINCTES déjà posées.
  const [arrow, setArrow] = useState({ dir: 'down', from: 0, to: 0 });
  // La flèche est montée SUR la colonne 0 : cette lecture-là est déjà à
  // l'écran, elle compte donc dès le départ. Sans cela, l'élève qui glisse
  // de la 1re à la 3e colonne aurait bel et bien vu deux lectures verticales
  // distinctes sans que la seconde soit comptée.
  const [seen, setSeen] = useState(['d0']);   // clés de lecture visitées

  const step = found.length;
  const current = CELLS[Math.min(step, CELLS.length - 1)];
  const allFound = found.length === CELLS.length;

  /* JALON DE COMPLÉTION SUR GESTE CONTINU — on ne compte pas des pixels, on
     compte des LECTURES CLAIREMENT DISTINCTES : au moins deux colonnes
     différentes vues à la verticale (c'est ce qui prouve que le × 3 ne
     bouge pas) ET au moins une lecture horizontale (le facteur qui, lui,
     dépend des colonnes). Un seul glissement ne peut donc pas valider
     l'étape par accident. */
  const downSeen = seen.filter((k) => k.startsWith('d')).length;
  const acrossSeen = seen.filter((k) => k.startsWith('a')).length;
  const labDone = downSeen >= 2 && acrossSeen >= 1;

  const columns = [
    { x: 3, y: Y(3) },
    ...CELLS.map((c) => ({ x: c.x, y: found.includes(c.x) ? Y(c.x) : null })),
  ].sort((a, b) => a.x - b.x);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Compléter le tableau"
      moduleSubtitle="Quatre cases vides, plusieurs chemins pour les remplir."
      estimatedTime="13 min"
      brief={{
        tag: '⚖️ Mission 04',
        title: 'Le tarif du stand est affiché… en partie.',
        body: (
          <p>
            L'an dernier, le tarif complet avait été affiché : apprends d'abord à le LIRE dans ses deux sens.
            Cette année, une seule colonne est connue — 3 crêpes coûtent {Y(3)} €. À toi de compléter les
            autres, et de remarquer qu'il y a souvent plus d'un chemin pour y arriver.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Traîne la flèche sur le tableau',
          subtitle: 'Deux façons de le lire — trouve-les toutes les deux.',
          done: labDone,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Voici le tarif <strong>complet</strong> de l'an dernier. Attrape la flèche :{' '}
                <strong>dans une colonne</strong> elle
                descend d'une grandeur à l'autre ; <strong>entre les deux lignes</strong> elle se couche et
                relie deux colonnes.
              </p>
              <ArrowReader
                rule={CREPES.rule}
                xs={[1, 3, 6, 9]}
                xLabel="Crêpes"
                yLabel="Prix"
                yUnit="€"
                arrow={arrow}
                onArrowChange={(a) => {
                  setArrow(a);
                  const key = a.dir === 'down' ? `d${a.from}` : `a${a.from}`;
                  setSeen((prev) => {
                    if (prev.includes(key)) return prev;
                    kit.react?.(true);
                    return [...prev, key];
                  });
                }}
                caption="Tarif de l’an dernier — la flèche lit à ta place"
              />
              {!labDone ? (
                <Feedback tone="info">
                  {downSeen < 2
                    ? 'Pose la flèche vers le bas dans une autre colonne : le nombre change-t-il ?'
                    : "Maintenant fais passer la flèche ENTRE les deux lignes : elle se couche, et lit dans l'autre sens."}
                </Feedback>
              ) : (
                <Feedback tone="ok">
                  Deux lectures, deux nombres différents. Vers le bas c'est <strong>toujours × {K}</strong>,
                  quelle que soit la colonne. Sur le côté, le facteur dépend des colonnes choisies — mais il
                  agit sur les DEUX lignes en même temps. Garde la flèche sous la main : elle sert pour la
                  suite.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: `Complète les cases (${found.length}/${CELLS.length})`,
          done: allFound,
          content: (kit) => (
            <div className="space-y-3">
              <ProportionTable
                xLabel="Crêpes"
                yLabel="Prix"
                unit="€"
                columns={columns}
                solvedIndexes={columns.map((c, i) => (found.includes(c.x) ? i : -1)).filter((i) => i >= 0)}
                caption="Tarif du stand de crêpes"
              />
              {/* Le passage par l'unité est la première case demandée : la
                  méthode est posée avant la demande, pas dans un `hint`
                  d'après-réponse. */}
              <KnowledgeBrick
                id="passage-unite"
                variant="new"
                lead="Une seule colonne est connue. Il existe un chemin qui ouvre toutes les autres."
              />
              {!allFound ? (
                <NumericQuestion
                  key={current.x}
                  prompt={`Combien coûtent ${current.x} crêpe${current.x > 1 ? 's' : ''} ?`}
                  suffix="€"
                  expected={Y(current.x)}
                  parse={parseDec}
                  display={formatDec(Y(current.x))}
                  explain={
                    <>
                      {current.x} × {K} = <strong>{formatDec(Y(current.x))} €</strong>. {current.hint}
                    </>
                  }
                  explainFor={(n) =>
                    n === current.x + Y(3)
                      ? `Tu as additionné au lieu de multiplier. Chaque crêpe coûte ${K} € : ${current.x} × ${K} = ${formatDec(Y(current.x))} €.`
                      : `${current.hint} Le calcul : ${current.x} × ${K} = ${formatDec(Y(current.x))} €.`
                  }
                  requires={['passage-unite', 'coefficient-proportionnalite', 'tables-multiplication']}
                  solved={false}
                  onAnswered={() => {
                    setFound((f) => [...f, current.x]);
                    kit.react(true);
                  }}
                />
              ) : (
                <Feedback tone="ok">
                  Tableau complet. Chaque case pouvait s'obtenir de plusieurs façons — et toutes donnent le
                  même prix.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Plusieurs chemins, une seule réponse',
          done: chemDone,
          content: (
            <div className="space-y-3">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 space-y-2.5">
                <p className="text-sm font-semibold text-slate-700 text-center">
                  Trois façons de trouver le prix de 9 crêpes
                </p>
                {[
                  { id: 'unite', label: "Par l'unité", calc: `1 crêpe → ${K} €, donc 9 × ${K} = ${formatDec(Y(9))} €` },
                  { id: 'mult', label: 'Par multiplication', calc: `9 = 3 × 3, donc ${Y(3)} × 3 = ${formatDec(Y(9))} €` },
                  { id: 'add', label: 'Par addition', calc: `9 = 6 + 3, donc ${Y(6)} + ${Y(3)} = ${formatDec(Y(9))} €` },
                ].map((s) => (
                  <div key={s.id} className="rounded-xl border-2 border-slate-200 bg-slate-50 p-2.5">
                    <p className="text-xs font-bold text-slate-600">{s.label}</p>
                    <p className="font-mono text-sm text-slate-800">{s.calc}</p>
                  </div>
                ))}
              </div>
              <TapQuestion
                prompt="Que remarques-tu à propos de ces trois chemins ?"
                options={[
                  'Ils donnent le même résultat : on peut choisir celui qu’on préfère',
                  'Seul le passage par l’unité est correct',
                  'Ils donnent des résultats différents selon la méthode',
                ]}
                correct={0}
                cols={1}
                explain={`Les trois donnent ${formatDec(Y(9))} €. Dans une situation proportionnelle, il n’y a pas UNE bonne méthode : il y a celle qui va le plus vite avec les nombres qu’on a.`}
                requires={['passage-unite', 'double-triple-moitie']}
                solved={chemDone}
                onAnswered={() => setChemDone(true)}
              />
              {chemDone && (
                <KnowledgeBrick
                  id="chemins-equivalents"
                  variant="new"
                  lead="Trois calculs différents, un seul prix : ce n’est pas un hasard."
                />
              )}
              {chemDone && (
                <ProportionTable
                  xLabel="Crêpes"
                  yLabel="Prix"
                  unit="€"
                  columns={[1, 3, 6, 9, 10].map((x) => ({ x, y: Y(x) }))}
                  coefficient={K}
                  horizontalHint={{ from: 3, to: 6, factor: 2 }}
                  caption="Le tableau complet, avec ses deux lectures"
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={4}>
            <strong>La suite.</strong> Tu disposes de plusieurs chemins. Au prochain module, tu apprends à
            reconnaître d'un coup d'œil lequel sera le plus court.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <Table2 className="w-6 h-6 mx-auto text-violet-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Un tableau se lit dans deux sens : vers le bas, et sur le côté.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
