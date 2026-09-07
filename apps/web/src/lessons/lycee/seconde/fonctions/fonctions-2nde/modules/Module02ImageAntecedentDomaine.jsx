import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import FunctionProbe from '../components/FunctionProbe';
import { GRAPH_RANGE, GRAPH_UNIT, GRAPH_UNIT_Y } from '../components/BoxLab';
import { BOX, antecedentsOf, formatDec } from '../components/fonctionsUtils';

/**
 * Module 2 — DÉCOUVERTE : image, antécédent, ensemble de définition.
 *
 * Activity               la courbe de la boîte, une sonde verticale puis horizontale.
 * Student action         amener la sonde en x = 2 (une image), puis à V = 400
 *                        (deux antécédents) ; nommer ; écrire D_V.
 * Controlled variable    la position de la sonde.
 * Expected observation   « un x → un point, une image » ; « un V → parfois deux
 *                        x » ; « certains x n'ont pas d'image ».
 * Misconception targeted la symétrie image / antécédent ; D_V = ℝ « parce que
 *                        la formule marche partout ».
 * Formalization          notation V(2) = 512, vocabulaire, ensemble de définition ]0 ; 10[.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Les trois mots vivaient dans des `Feedback` de fin d'étape, donc APRÈS
 *   chaque geste mais surtout AVANT rien : la question de l'étape 4 les
 *   exigeait tous les trois sans qu'aucun n'ait été posé en position
 *   d'enseignement. L'ordre est maintenant geste → brique → demande :
 *     étape 1  sonder x = 2      → brique `image-antecedent` (le sens direct)
 *     étape 2  sonder V = 400    → brique `vocab-notation-fx` (l'écriture)
 *     étape 3  rappel des intervalles (acquis du chapitre « Ensembles et
 *              intervalles ») → brique `ensemble-definition`, puis la question
 *     étape 4  les mots ensemble, désormais tous établis
 *   Le titre de l'étape 3 ne nomme plus « ensemble de définition » : un titre
 *   se lit alors que l'étape est encore verrouillée, et annonçait donc le mot
 *   avant tout enseignement.
 *
 * MANIPULATION JAMAIS GELÉE. La sonde restait `disabled` une fois l'étape
 * réussie : l'élève ne pouvait plus rejouer le phénomène qu'il venait de
 * comprendre. Elle reste vivante ; seul le verrou d'ANTÉRIORITÉ demeure,
 * parce qu'une étape garde son ordre.
 */
const PROBE = { f: BOX, range: GRAPH_RANGE, unit: GRAPH_UNIT, unitY: GRAPH_UNIT_Y, xStep: 0.5, yStep: 100, axisLabels: { x: 'x', y: 'V' }, xUnit: ' cm', yUnit: ' cm³', labelEvery: 2 };
const XS400 = antecedentsOf(BOX, 400, GRAPH_RANGE);

export default function Module02ImageAntecedentDomaine() {
  const [x, setX] = useState(4);
  const [seen2, setSeen2] = useState(false);
  const [yv, setYv] = useState(200);
  const [seen400, setSeen400] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Amène la sonde en x = 2',
      subtitle: 'Glisse la sonde, ou avance-la d’un cran. Lis ce que la courbe répond.',
      done: seen2,
      content: (kit) => (
        <div className="space-y-3">
          <FunctionProbe {...PROBE} mode="x" value={x} onChange={(v) => { setX(v); if (v === 2 && !seen2) { setSeen2(true); kit.react(true); } }} />
          {seen2 ? (
            <>
              <KnowledgeBrick
                id="image-antecedent"
                variant="new"
                lead={<>Pour x = 2, la sonde ne rencontre la courbe qu’<strong>une seule fois</strong>, à 512. Bascule-la à l’horizontale (étape suivante) : tu verras qu’elle peut, elle, rencontrer la courbe deux fois.</>}
              />
              <KnowledgeBrick
                id="methode-lire-image-graphique"
                variant="new"
                compact
                lead={<>Le trajet que la sonde vient de faire, en trois temps.</>}
              />
            </>
          ) : (
            <Feedback tone="info">La sonde est en x = {formatDec(x)}. Vise x = 2.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quelles découpes donnent 400 cm³ ?',
      subtitle: 'La sonde est maintenant horizontale : une valeur de V. Amène-la à 400.',
      done: seen400,
      content: (kit) => (
        <div className="space-y-3">
          <FunctionProbe {...PROBE} mode="y" value={yv} onChange={(v) => { setYv(v); if (v === 400 && !seen400) { setSeen400(true); kit.react(true); } }} disabled={!seen2} />
          {seen400 ? (
            <>
              <KnowledgeBrick
                id="methode-lire-antecedents-graphique"
                variant="new"
                compact
                lead={<>
                  Deux points : V vaut 400 pour x ≈ {formatDec(Math.round(XS400[0] * 10) / 10)} <em>et</em> pour x ≈ {formatDec(Math.round(XS400[1] * 10) / 10)}. Remonte la sonde à 600 : la courbe n’y est jamais.
                </>}
              />
              <KnowledgeBrick
                id="vocab-notation-fx"
                variant="new"
                lead={<>Dire « le nombre qui sort quand on entre 2 » à chaque fois serait long. Voici l’écriture des mathématiciens.</>}
              />
            </>
          ) : (
            <Feedback tone="info">V = {formatDec(yv)} pour l’instant. Vise 400.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quelles découpes ont une image ?',
      subtitle: 'Certaines valeurs de x ne donnent aucune boîte : elles n’ont donc rien à lire sur la courbe.',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="rappel-intervalle"
            variant="rappel"
            compact
            lead={<>Tu as écrit des intervalles au chapitre « Ensembles et intervalles ». C’est exactement l’outil qu’il faut pour dire quelles découpes existent.</>}
          />
          <KnowledgeBrick
            id="ensemble-definition"
            variant="new"
            lead={<>À x = 0 comme à x = 10, le bandeau du module 1 disait « pas de boîte » : ces découpes n’ont pas d’image. L’ensemble de celles qui en ont une porte un nom.</>}
          >
            <TapQuestion
              prompt={<span>Écris <MathText>{'$D_V$'}</MathText>, l’ensemble de définition de V, avec un intervalle.</span>}
              options={[']0 ; 10[', '[0 ; 10]', 'ℝ (tous les nombres)', '[0 ; 20]']}
              correct={0} cols={2}
              requires={['ensemble-definition', 'fonction-dependance', 'intervalle', 'intervalle-crochets', 'ensemble-reels']}
              explain="La boîte existe pour 0 < x < 10 : les bornes n’ont pas d’image (pas de boîte), donc les crochets sont tournés vers l’extérieur : ]0 ; 10[. Une fonction ne se lit que sur son ensemble de définition."
              explainWrong="À x = 0 et x = 10, le bandeau du module 1 disait « pas de boîte » : ces valeurs n’ont pas d’image, on les exclut avec des crochets ouverts. Et au-delà de 10 il n’y a plus de feuille. D_V = ]0 ; 10[."
              solved={q3} onAnswered={() => setQ3(true)}
            />
          </KnowledgeBrick>
        </div>
      ),
    },
    {
      num: 4,
      title: 'Les mots justes',
      done: q4,
      content: (
        <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Image ou antécédent ? Réponds pour chaque ligne.</p>}
          rows={[
            { id: 'r1', label: 'V(3) = 588 : 588 est…', options: ['l’image de 3', 'un antécédent de 3'], correct: 0, correction: 'on part de 3, on obtient 588 : 588 est l’image' },
            { id: 'r2', label: 'V(x) = 400 a deux solutions : ce sont…', options: ['deux antécédents de 400', 'deux images de 400'], correct: 0, correction: 'on part de 400, on remonte vers x' },
            { id: 'r3', label: 'V(12) existe-t-il ?', options: ['non : 12 ∉ D_V', 'oui, en prolongeant la courbe'], correct: 0, correction: 'aucune boîte pour x = 12' },
            { id: 'r4', label: 'Combien d’images possède le nombre 3 ?', options: ['une seule', 'deux'], correct: 0, correction: 'une découpe, un volume' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Quatre sur quatre.' : `${nCorrect} sur ${total}.`} On part de x pour trouver <strong>l’image</strong> f(x) (unique) ; on part de y pour trouver ses <strong>antécédents</strong> (0, 1, 2… valeurs de x). Hors de l’ensemble de définition, pas d’image du tout.
            </Feedback>
          )}
          requires={['image-antecedent', 'vocab-notation-fx', 'ensemble-definition', 'appartient']}
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(2)} moduleNumber={2}
      moduleTitle="Image, antécédent, ensemble de définition"
      moduleSubtitle="Une sonde sur la courbe de la boîte, et les mots pour dire ce qu’elle lit"
      estimatedTime="9 min"
      brief={{ tag: 'Découverte', title: 'La courbe connaît toutes les boîtes', tone: 'violet', body: <p>Le module 1 a tracé la courbe de la fonction V. Elle porte toutes les boîtes possibles : une sonde suffit pour les interroger — dans un sens, puis dans l’autre.</p> }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={2}>
          La courbe répond, mais approximativement (« x ≈ 1,3 »). Pour une valeur exacte, il faut la <strong>règle de calcul</strong> qui fabrique chaque volume. Module suivant : la formule, et le tableau de valeurs.
        </KnowledgeSnapshot>
      }
    />
  );
}
