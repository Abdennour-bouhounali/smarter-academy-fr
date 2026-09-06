import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TestBench from '../components/TestBench';
import ProportionTable from '../components/ProportionTable';
import { BANC_ESSAI, BARQUE } from '../components/kermesseData';
import { buildRows, applyRule } from '../components/proportionUtils';

/**
 * Module 3 — MANIPULATION SIGNATURE : le banc d'essai.
 *
 * Le cœur de la leçon, et la réponse explicite à la demande « ne pas faire
 * une simple QCM de classement » : l'élève TESTE chaque situation. Il
 * prédit ce que donne le double, la machine calcule, et il voit son
 * hypothèse tenir ou casser AVANT de trancher.
 *
 * Trois situations, choisies pour couvrir les trois cas que les élèves
 * confondent :
 *   1. CREPES  — proportionnelle : la prédiction tombe juste.
 *   2. BARQUE  — affine : une part fixe de 5 € qui ne double jamais. C'est
 *      le contre-exemple canonique du programme.
 *   3. AGE     — « augmente ensemble » sans être proportionnel du tout :
 *      détruit l'idée fausse « quand l'un monte, l'autre monte → c'est
 *      proportionnel ».
 *
 * Le module se termine sur la relation double/triple/moitié appliquée à la
 * situation proportionnelle (LP P7), pour que le test devienne un outil de
 * calcul et pas seulement de diagnostic.
 */
const BARQUE_ROWS = buildRows(BARQUE.rule, [1, 2, 4]);

export default function Module03BancEssai() {
  const [tested, setTested] = useState([]);
  const [pourquoiDone, setPourquoiDone] = useState(false);
  const [tripleDone, setTripleDone] = useState(false);

  const allTested = tested.length === BANC_ESSAI.length;
  const current = BANC_ESSAI[Math.min(tested.length, BANC_ESSAI.length - 1)];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le banc d’essai"
      moduleSubtitle="Teste une situation : double la quantité et vois si le prix suit."
      estimatedTime="14 min"
      brief={{
        tag: '⚖️ Mission 03',
        title: 'Toutes les situations ne se ressemblent pas. Prouve-le.',
        body: (
          <p>
            Pour chaque situation : tu prédis ce que donne le double, la machine répond, et tu décides. Une
            prédiction fausse n'est pas une erreur — c'est souvent là qu'on comprend.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: `Teste les situations (${tested.length}/${BANC_ESSAI.length})`,
          done: allTested,
          content: (kit) => (
            <div className="space-y-4">
              {BANC_ESSAI.slice(0, tested.length).map((s) => (
                <div key={s.id} className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 text-sm">
                  <span className="font-semibold text-slate-800">{s.title}</span>{' '}
                  <span className="text-slate-600">
                    — testée : {s.rule.kind === 'proportional' ? 'proportionnelle' : 'pas proportionnelle'}.
                  </span>
                </div>
              ))}
              {!allTested && (
                <TestBench
                  key={current.id}
                  situation={current}
                  react={kit.react}
                  onTested={() => setTested((t) => [...t, current.id])}
                />
              )}
              {allTested && (
                <Feedback tone="ok">
                  Trois situations, trois comportements. Seule la première double quand la quantité double :
                  c'est la seule proportionnelle.
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Pourquoi la barque résiste',
          done: pourquoiDone,
          content: (
            <div className="space-y-3">
              <ProportionTable
                xLabel="Personnes"
                yLabel="Prix"
                unit="€"
                columns={BARQUE_ROWS}
                caption="La barque : 5 € de location + 2 € par personne"
              />
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 text-center font-mono text-xs text-slate-600 space-y-0.5">
                <p>1 personne → 5 + 2 = {applyRule(BARQUE.rule, 1)} €</p>
                <p>2 personnes → 5 + 4 = {applyRule(BARQUE.rule, 2)} €</p>
                <p>4 personnes → 5 + 8 = {applyRule(BARQUE.rule, 4)} €</p>
              </div>
              <TapQuestion
                prompt="Pourquoi le prix de la barque ne double-t-il pas quand le nombre de personnes double ?"
                options={[
                  'Parce que les 5 € de location sont payés une seule fois, quel que soit le nombre de personnes',
                  'Parce que le prix par personne change à chaque fois',
                  'Parce que la barque a une taille limitée',
                ]}
                correct={0}
                cols={1}
                explain={`Les 2 € par personne, eux, doublent bien. Mais les 5 € de location sont fixes : on ne les paie qu’une fois. C’est cette part FIXE qui casse la proportionnalité — ${applyRule(BARQUE.rule, 2)} € au lieu des ${2 * applyRule(BARQUE.rule, 1)} € qu’il faudrait pour un doublement.`}
                explainWrong={`Le prix par personne ne change pas : c’est bien 2 € à chaque fois. Ce qui coince, c’est le forfait de 5 € payé une seule fois — il ne double jamais.`}
                requires={['proportionnalite', 'double-double', 'calcul-numerique']}
                solved={pourquoiDone}
                onAnswered={() => setPourquoiDone(true)}
              />
              {pourquoiDone && (
                <KnowledgeBrick
                  id="part-fixe"
                  variant="new"
                  lead="Tu as mis le doigt sur le coupable : ces 5 € qu’on ne paie qu’une fois."
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Double, triple, moitié',
          done: tripleDone,
          content: (
            <div className="space-y-3">
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-3 text-center">
                <p className="font-mono text-sm text-slate-700">Au stand de crêpes : 4 crêpes → 12 €</p>
              </div>
              {/* Le raccourci est POSÉ avant qu'on demande de l'appliquer : il
                  ne vivait auparavant que dans l'explication d'après-réponse. */}
              <KnowledgeBrick
                id="double-triple-moitie"
                variant="new"
                lead="Le banc d’essai vient de garantir que cette situation-ci est proportionnelle. Voilà ce que cela autorise."
              />
              <TapQuestion
                prompt="Combien coûtent 12 crêpes (le triple de 4) ?"
                options={['20 €', '36 €', '15 €']}
                correct={1}
                cols={3}
                explain="12 crêpes, c’est 3 fois 4 crêpes : le prix est donc 3 fois 12 €, soit 36 €. Dans une situation proportionnelle, triple d’un côté = triple de l’autre."
                explainWrong="On triple la quantité, donc on triple le prix : 12 × 3 = 36 €. (Ajouter 8 € ou 3 € ne marche que si la situation n’était PAS proportionnelle.)"
                requires={['double-triple-moitie', 'tables-multiplication']}
                solved={tripleDone}
                onAnswered={() => setTripleDone(true)}
              />
              {tripleDone && (
                <Feedback tone="info">
                  Ces raccourcis — double, triple, moitié — ne fonctionnent QUE dans une situation
                  proportionnelle. C'est bien pour ça qu'il faut la tester d'abord.
                </Feedback>
              )}
            </div>
          ),
        },
      ]}
      footer={
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <KnowledgeSnapshot moduleNumber={3}>
            <strong>La suite.</strong> Tu sais distinguer les situations et utiliser les raccourcis quand
            ils sont permis. Au prochain module, un tableau à compléter case par case.
          </KnowledgeSnapshot>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-2">
            <FlaskConical className="w-6 h-6 mx-auto text-emerald-400" aria-hidden="true" />
            <p className="text-sm text-slate-300">
              Teste d'abord, calcule ensuite.
            </p>
          </div>
        </motion.div>
      }
    />
  );
}
