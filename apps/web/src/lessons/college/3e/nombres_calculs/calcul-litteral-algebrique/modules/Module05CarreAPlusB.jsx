import React, { useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import ValueTable from '../../../../../common/components/ValueTable';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AlgebraRect from '../components/AlgebraRect';
import SlideCutToggle from '../components/SlideCutToggle';

/**
 * Module 5 — MANIPULATION : « Le carré de côté a + b ».
 *
 * Activity: prédire (a + b)², puis découper le carré de côté a + b et
 *   compter ses QUATRE morceaux, enfin vérifier les trois identités au
 *   tableau de valeurs et par le glissement a² − b².
 * Mathematical objective: établir les trois identités remarquables comme des
 *   DÉCOUPAGES d'aire, pas comme des formules à retenir.
 * Student action: taper la prédiction, séparer les deux côtés du carré,
 *   toucher les quatre morceaux, regrouper les deux ab, tester des valeurs,
 *   basculer la découpe glissante.
 * Controlled variable: les côtés séparés, les morceaux comptés, les valeurs
 *   testées, l'état 0/1 du glissement.
 * Mathematical state: le carré symbolique (buildSquareLayout) et l'ensemble
 *   des valeurs testées ; les quatre pièces a², ab, ab, b² en dérivent.
 * Visual consequence: tant que les deux ab ne sont pas comptés, deux
 *   rectangles restent GRIS — l'erreur « a² + b² » a littéralement la forme
 *   de deux trous dans le carré.
 * Expected observation: le carré de côté a + b est fait de quatre morceaux,
 *   et a² + b² n'en couvre que deux ; pour a = 3, b = 2, 25 contre 13.
 * Misconception targeted: « (a + b)² = a² + b² » (#3) et « a² − b² =
 *   (a − b)² » (traité par le glissement).
 * Feedback: le compteur « n / 4 morceaux » quantifie l'écart ; le tableau
 *   colore en rose la colonne a² + b².
 * Formalization: les trois identités vivent dans `knowledge.jsx` ; des
 *   <KnowledgeBrick> les posent APRÈS le découpage (étape 2), APRÈS le
 *   glissement (étape 4) et APRÈS le verdict de la dernière question. L'étape
 *   1 reste une PRÉDICTION : elle n'exige rien de ce qu'elle fait découvrir
 *   (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 * Scaffolding: après 3 tentatives sans succès, « Je ne trouve pas —
 *   montre-moi » compte tout et signale la révélation.
 * Transfer: étape 4, écrire (a − b)² sans dessin, une fois le glissement vu.
 */
const SQUARE_IDS = ['r0c0', 'r0c1', 'r1c0', 'r1c1'];

function EscapeHatch({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-[44px] px-4 rounded-xl border-2 border-slate-300 bg-white text-sm font-bold text-slate-700 hover:border-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      Je ne trouve pas — montre-moi
    </button>
  );
}

export default function Module05CarreAPlusB() {
  const [predicted, setPredicted] = useState(false);
  const [splitA, setSplitA] = useState(false);
  const [splitB, setSplitB] = useState(false);
  const [counted, setCounted] = useState([]);
  const [merged, setMerged] = useState(false);
  const [tries, setTries] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [tested, setTested] = useState(() => new Set());
  const [slide, setSlide] = useState(0);
  const [slid, setSlid] = useState(false);
  const [minusDone, setMinusDone] = useState(false);

  const done1 = predicted;
  const done2 = counted.length === 4 && merged;
  const done3 = tested.size >= 2;
  const done4 = slid && minusDone;

  const reveal = () => {
    setSplitA(true);
    setSplitB(true);
    setCounted(SQUARE_IDS);
    setRevealed(true);
  };

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Le carré de côté a + b"
      moduleSubtitle="(a + b)² n’est pas a² + b² : il manque deux rectangles. Va les chercher."
      estimatedTime="10 min"
      brief={{
        tag: '🟪 Mission 05',
        title: 'Maya agrandit sa terrasse carrée de b mètres.',
        tone: 'violet',
        body: (
          <p>
            La terrasse mesurait <strong className="font-mono">a</strong> de côté ; elle en mesure
            maintenant <strong className="font-mono">a + b</strong>. Quelle aire ? Prédis d’abord —
            puis découpe et compte.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Ta prédiction, avant de découper',
          subtitle: 'Réponds à l’instinct : on vérifiera juste après.',
          done: done1,
          content: (
            <TapQuestion
              prompt={
                <>
                  Selon toi, que vaut <MathText>{'$(a + b)^{2}$'}</MathText> ?
                </>
              }
              options={['$a^{2} + b^{2}$', '$a^{2} + 2ab + b^{2}$', '$2a + 2b$', '$a^{2} + ab + b^{2}$']}
              renderOption={(o) => <MathText>{o}</MathText>}
              optionLabel={(i) => ['a² + b²', 'a² + 2ab + b²', '2a + 2b', 'a² + ab + b²'][i]}
              correctionLabel="a² + 2ab + b²"
              cols={2}
              correct={1}
              explain={
                <>
                  Élever au carré, c’est calculer l’aire d’un carré de côté{' '}
                  <MathText>{'$a + b$'}</MathText>. On va le découper : tu verras qu’il contient{' '}
                  <strong>quatre</strong> morceaux, pas deux.
                </>
              }
              explainWrong={
                <>
                  <MathText>{'$a^{2} + b^{2}$'}</MathText> est l’erreur la plus répandue de tout le
                  collège — et elle a une forme : deux morceaux du carré resteront gris. Découpe le
                  carré ci-dessous et compte toi-même.
                </>
              }
              requires={['developper']}
              solved={done1}
              onAnswered={() => setPredicted(true)}
            />
          ),
        },
        {
          num: 2,
          title: 'Découpe le carré de côté a + b',
          subtitle: 'Sépare les deux côtés, compte les quatre morceaux, regroupe.',
          done: done2,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Le grand carré a pour côté <MathText>{'$a + b$'}</MathText> dans les deux directions.
                Sépare-les tous les deux, puis touche chaque morceau pour compter son aire.
              </p>
              <AlgebraRect
                mode="square"
                splitA={splitA}
                splitB={splitB}
                onSplit={(side) => { if (side === 'a') setSplitA(true); else setSplitB(true); }}
                counted={counted}
                onCount={(id) => {
                  if (counted.includes(id)) return;
                  const next = [...counted, id];
                  setCounted(next);
                  if (next.length === 4) kit.react(true);
                  else setTries((t) => t + 1);
                }}
                merged={merged}
                onMerge={() => { setMerged(true); kit.react(true); }}
                hint={splitA && splitB && counted.length > 0 && counted.length < 4}
              />
              {!done2 && (!splitA || !splitB) && (
                <Feedback tone="info">
                  Tant qu’un côté n’est pas séparé, on ne voit pas les traits de coupe. Sépare{' '}
                  <MathText>{'$a + b$'}</MathText> dans les <strong>deux</strong> directions.
                </Feedback>
              )}
              {!done2 && splitA && splitB && counted.length < 4 && (
                <Feedback tone="info">
                  {4 - counted.length} morceau{4 - counted.length > 1 ? 'x' : ''} encore gris.
                  {counted.length === 2 && counted.includes('r0c0') && counted.includes('r1c1')
                    ? ' Tu as compté a² et b² : c’est exactement la prédiction « a² + b² ». Les deux rectangles ab dorment encore dans les coins.'
                    : ''}
                </Feedback>
              )}
              {!done2 && counted.length === 4 && !merged && (
                <Feedback tone="info">
                  Quatre morceaux comptés. Deux d’entre eux sont des rectangles{' '}
                  <MathText>{'$a \\times b$'}</MathText> identiques : regroupe-les pour finir
                  l’écriture.
                </Feedback>
              )}
              {!done2 && tries >= 3 && counted.length < 4 && (
                <EscapeHatch onClick={() => { reveal(); kit.react(false); }} />
              )}
              {done2 && (
                <>
                  <Feedback tone="ok">
                    Quatre morceaux : <MathText>{'$a^{2}$'}</MathText>, deux fois{' '}
                    <MathText>{'$ab$'}</MathText>, et <MathText>{'$b^{2}$'}</MathText>. Donc{' '}
                    <MathText>{'$(a + b)^{2} = a^{2} + 2ab + b^{2}$'}</MathText>. Les deux rectangles{' '}
                    <MathText>{'$ab$'}</MathText> sont exactement ce qui manque à{' '}
                    <MathText>{'$a^{2} + b^{2}$'}</MathText>.
                    {revealed && ' (Les morceaux t’ont été montrés — refais le geste mentalement.)'}
                  </Feedback>
                  <KnowledgeBrick
                    id="carre-somme"
                    variant="new"
                    lead="Les deux coins que tu as failli oublier sont exactement l’écart entre ta prédiction et la vérité."
                  />
                  <KnowledgeBrick
                    id="identite-remarquable"
                    variant="new"
                    compact
                    lead="Ce découpage revient si souvent qu’il porte un nom de famille."
                  />
                </>
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Vérifier avec des nombres',
          subtitle: 'a = 3 et b = 2 : teste au moins deux valeurs.',
          done: done3,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Posons <MathText>{'$b = 2$'}</MathText> et faisons varier{' '}
                <MathText>{'$a$'}</MathText>. Trois colonnes : le carré, la prédiction fausse, et
                l’identité. Touche des valeurs de a.
              </p>
              <ValueTable
                columns={[
                  { id: 'carre', label: <MathText>{'$(a+2)^{2}$'}</MathText>, fn: (a) => (a + 2) ** 2 },
                  { id: 'faux', label: <MathText>{'$a^{2}+2^{2}$'}</MathText>, fn: (a) => a ** 2 + 4 },
                  { id: 'juste', label: <MathText>{'$a^{2}+4a+4$'}</MathText>, fn: (a) => a ** 2 + 4 * a + 4 },
                ]}
                xs={[0, 1, 3, 5, 10]}
                tested={tested}
                onTest={(v) => {
                  const next = new Set(tested);
                  next.add(v);
                  setTested(next);
                  if (next.size >= 2 && tested.size < 2) kit.react(true);
                }}
                variable="a"
                caption="Une ligne rose : au moins une colonne s’écarte des autres."
              />
              {!done3 && (
                <Feedback tone="info">
                  {tested.size === 0
                    ? 'Aucune valeur testée : commence par a = 3 (la terrasse de Maya).'
                    : `${tested.size} valeur testée sur 2 — continue, une seule ne prouverait rien.`}
                </Feedback>
              )}
              {done3 && (
                <Feedback tone="ok">
                  Pour <MathText>{'$a = 3$'}</MathText> : le carré vaut{' '}
                  <strong className="font-mono">25</strong>, l’identité aussi — mais{' '}
                  <MathText>{'$a^{2} + b^{2}$'}</MathText> ne donne que{' '}
                  <strong className="font-mono">13</strong>. Il manque{' '}
                  <strong className="font-mono">12</strong>, soit exactement{' '}
                  <MathText>{'$2ab = 2 \\times 3 \\times 2$'}</MathText> : les deux rectangles oubliés.
                  {tested.has(0) && ' (Seul a = 0 met tout le monde d’accord — une valeur ne prouve rien.)'}
                </Feedback>
              )}
            </div>
          ),
        },
        {
          num: 4,
          title: 'Les deux autres identités',
          subtitle: 'Fais glisser le morceau, puis écris (a − b)².',
          done: done4,
          content: (kit) => (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Et si on <em>retire</em> un carré de côté b au carré de côté a ? Regarde ce que devient
                la figure quand on découpe le long du trait rouge et qu’on fait glisser le morceau.
              </p>
              <SlideCutToggle
                state={slide}
                onToggle={() => {
                  const next = slide === 0 ? 1 : 0;
                  setSlide(next);
                  if (next === 1 && !slid) { setSlid(true); kit.react(true); }
                }}
              />
              {!slid && (
                <Feedback tone="info">
                  Touche « Faire glisser le morceau » : rien n’est ajouté ni enlevé, seule la forme
                  change. C’est la preuve visuelle de la troisième identité.
                </Feedback>
              )}
              {slid && (
                <KnowledgeBrick
                  id="difference-carres"
                  variant="new"
                  lead="Rien n’a été ajouté ni enlevé : le même morceau, posé ailleurs, forme maintenant un rectangle."
                />
              )}
              <TapQuestion
                prompt={
                  <>
                    Dernière identité : que vaut <MathText>{'$(a - b)^{2}$'}</MathText> ?
                  </>
                }
                options={[
                  '$a^{2} - b^{2}$',
                  '$a^{2} - 2ab + b^{2}$',
                  '$a^{2} + 2ab - b^{2}$',
                  '$a^{2} - ab + b^{2}$',
                ]}
                renderOption={(o) => <MathText>{o}</MathText>}
                optionLabel={(i) => ['a² − b²', 'a² − 2ab + b²', 'a² + 2ab − b²', 'a² − ab + b²'][i]}
                correctionLabel="a² − 2ab + b²"
                cols={2}
                correct={1}
                explain={
                  <>
                    C’est <MathText>{'$(a + (-b))^{2}$'}</MathText> : le même découpage, avec{' '}
                    <MathText>{'$-b$'}</MathText> à la place de <MathText>{'$b$'}</MathText>. Les deux
                    rectangles deviennent <MathText>{'$-ab$'}</MathText> chacun, et{' '}
                    <MathText>{'$(-b)^{2} = +b^{2}$'}</MathText>. Test avec a = 5, b = 2 :{' '}
                    <MathText>{'$3^{2} = 9$'}</MathText> et{' '}
                    <MathText>{'$25 - 20 + 4 = 9$'}</MathText>.
                  </>
                }
                explainWrong={
                  <>
                    <MathText>{'$a^{2} - b^{2}$'}</MathText> est ce que tu viens de voir glisser : c’est{' '}
                    <MathText>{'$(a + b)(a - b)$'}</MathText>, un rectangle, pas un carré. Avec a = 5 et
                    b = 2 : <MathText>{'$(5-2)^{2} = 9$'}</MathText> alors que{' '}
                    <MathText>{'$25 - 4 = 21$'}</MathText>. Le terme{' '}
                    <MathText>{'$-2ab$'}</MathText> est indispensable.
                  </>
                }
                requires={['carre-somme', 'difference-carres', 'signe-parenthese']}
                solved={minusDone}
                onAnswered={() => setMinusDone(true)}
              />
              {done4 && (
                <>
                  <KnowledgeBrick
                    id="carre-difference"
                    variant="new"
                    compact
                    lead="Tu viens de le trouver : c’est le même carré, avec −b à la place de b."
                  />
                  <KnowledgeBrick
                    id="mem-trois-identites"
                    variant="new"
                    compact
                    lead="Les trois découpages, côte à côte."
                  />
                </>
              )}
            </div>
          ),
        },
      ]}
      footer={(
        <KnowledgeSnapshot moduleNumber={5}>
          <strong>La suite.</strong> Tu as lu ces trois découpages du produit vers la somme. Au
          module suivant, on les lit dans l’autre sens : de la somme vers le produit.
        </KnowledgeSnapshot>
      )}
    />
  );
}
