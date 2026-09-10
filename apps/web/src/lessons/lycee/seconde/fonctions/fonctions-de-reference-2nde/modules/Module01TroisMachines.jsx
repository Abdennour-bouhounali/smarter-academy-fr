import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ThreeMachines from '../components/ThreeMachines';
import PlotTable from '../components/PlotTable';
import { formatDec, SQUARE, SQUARE_RANGE, imageOf } from '../components/referenceUtils';

/** Les sept abscisses du tracé : toutes donnent une image entière dans la fenêtre. */
const PLOT_XS = [-3, -2, -1, 0, 1, 2, 3];

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : trois machines, une
 * sonde (components/ThreeMachines.jsx pour le bloc d'activité).
 *
 * Step 1  nourrir : ≥ 5 entrées dont un négatif et 0 → « 1/0 refusé ».
 * Step 2  le jumeau : x et −x → même carré, même valeur absolue, inverses opposés.
 * Step 3  près de 0, loin de 0 : 0,1 et 100 (saisie libre) → 1/x et x² explosent.
 * Step 4  TRACER : l'élève place lui-même les sept points de x² (PlotTable,
 *         copié de fonctions-2nde), puis la courbe est tracée à travers eux.
 *         Sans cette étape, « construire un tableau de valeurs » et
 *         « représenter graphiquement » étaient seulement DÉCLENCHÉS : les
 *         abscisses venaient du composant et les images étaient calculées.
 * Step 5  quelle machine refuse quoi.
 * Les courbes apparaissent après six entrées.
 *
 * CONNAISSANCES AVANT LA DEMANDE (docs/architecture/KNOWLEDGE_DEPENDENCY.md).
 *   Les quatre connaissances du module ne vivaient que dans les `Feedback` de
 *   fin d'étape et dans l'« À retenir » du pied : aucune n'était posée en
 *   position d'enseignement, et « tableau de valeurs » — exigé par le test
 *   final — n'apparaissait nulle part dans la leçon. L'ordre est maintenant
 *   geste → brique → demande :
 *     étape 1  nourrir les trois machines  → brique `trois-references`
 *     étape 2  l'entrée et son opposé      → brique `regle-symetrie-entrees`
 *     étape 3  0,1 puis 100                → briques `regle-pres-loin-zero`
 *                                            puis `methode-tableau-tracer`
 *     étape 4  la question d'origine, désormais légitime (`requires`)
 *
 * MANIPULATION JAMAIS GELÉE. Le laboratoire restait `disabled` dès l'étape
 * réussie : l'élève ne pouvait plus renourrir les machines qu'il venait de
 * comprendre. Il reste vivant ; seul le verrou d'ANTÉRIORITÉ (`!done1`,
 * `!done2`) demeure, parce qu'une étape garde son ordre. La prédiction de
 * l'étape 1, elle, se fige : elle s'enregistre une fois, avant la révélation.
 */
export default function Module01TroisMachines() {
  const [x, setX] = useState(2);
  const [tested, setTested] = useState([2]);
  const [pred, setPred] = useState(null);
  const [q4, setQ4] = useState(false);
  const [placed, setPlaced] = useState({});
  const [activeX, setActiveX] = useState(PLOT_XS[0]);
  const [moves, setMoves] = useState({});
  const allPlaced = PLOT_XS.every((x) => placed[x] && placed[x].x === x && placed[x].y === imageOf(SQUARE, x));
  const has = (p) => tested.some(p);
  const done1 = tested.length >= 5 && has((t) => t < 0) && tested.includes(0);
  const twin = tested.find((t) => t !== 0 && tested.includes(-t));
  const done2 = done1 && twin !== undefined;
  const done3 = done2 && has((t) => t !== 0 && Math.abs(t) <= 0.25) && has((t) => Math.abs(t) >= 10);

  const feed = (v, react) => {
    setX(v);
    if (tested.includes(v)) return;
    const next = [...tested, v];
    setTested(next);
    const nHas = (p) => next.some(p);
    const nDone1 = next.length >= 5 && nHas((t) => t < 0) && next.includes(0);
    const nTwin = next.find((t) => t !== 0 && next.includes(-t)) !== undefined;
    const nDone3 = nHas((t) => t !== 0 && Math.abs(t) <= 0.25) && nHas((t) => Math.abs(t) >= 10);
    if (!done1 && nDone1) react?.(true);
    else if (done1 && !done2 && nTwin) react?.(true);
    else if (done2 && !done3 && nDone3) react?.(true);
  };
  const lab = (kit, disabled) => <ThreeMachines x={x} onChange={(v) => feed(v, kit.react)} tested={tested} showCurves={tested.length >= 6} disabled={disabled} />;

  const steps = [
    {
      num: 1, title: 'Nourris les trois machines', subtitle: 'Touche des entrées : au moins cinq, dont un nombre négatif et 0. Compare les trois sorties.', done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="avec l’entrée −3, quelle machine donne un nombre négatif ?" options={[{ id: 'sq', label: 'x²' }, { id: 'inv', label: '1/x' }, { id: 'abs', label: '|x|' }, { id: 'none', label: 'Aucune' }]} value={pred} onChange={setPred} disabled={done1} />
          {lab(kit, false)}
          {done1 ? (
            <>
              <Feedback tone="ok">
                {pred === 'inv' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Regarde'} : avec −3, seul <strong>1/x</strong> donne un négatif (−1/3) ; x² donne 9 et |x| donne 3. Et avec 0, la machine 1/x <strong>refuse</strong> : on ne divise pas par zéro. Même entrée, trois comportements.
              </Feedback>
              <KnowledgeBrick
                id="trois-references"
                variant="new"
                lead="Ces trois machines, tu viens de les nourrir avec les mêmes nombres. Elles ont un nom — et une seule d’entre elles refuse une entrée."
              />
            </>
          ) : (
            <Feedback tone="info">{tested.length} entrée{tested.length > 1 ? 's' : ''}. {!has((t) => t < 0) ? 'Essaie un négatif. ' : ''}{!tested.includes(0) ? 'Essaie 0.' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2, title: 'Le jumeau', subtitle: 'Nourris les machines avec un nombre, puis avec son opposé (3 et −3, par exemple).', done: done2,
      content: (kit) => (
        <div className="space-y-3">
          {lab(kit, !done1)}
          {done2 ? (
            <>
              <Feedback tone="ok">
                {formatDec(Math.abs(twin))} et {formatDec(-Math.abs(twin))} : <strong>même carré</strong> ({formatDec(twin * twin)}), <strong>même valeur absolue</strong> ({formatDec(Math.abs(twin))}), mais des <strong>inverses opposés</strong> ({formatDec(1 / Math.abs(twin))} et {formatDec(-1 / Math.abs(twin))}).
                Sur le repère, les points de x² et de |x| se font face de part et d’autre de l’axe vertical ; ceux de 1/x se font face à travers l’origine.
              </Feedback>
              <KnowledgeBrick
                id="regle-symetrie-entrees"
                variant="new"
                lead="Ce que ta paire d’opposés vient de produire, écrit une fois pour toutes."
              />
            </>
          ) : (
            <Feedback tone="info">Une paire d’opposés, non nulle. Observe les trois lignes de sortie.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3, title: 'Près de zéro, loin de zéro', subtitle: 'Tape tes propres nombres : un tout petit (0,1 ou 0,25) et un grand (10, 100).', done: done3,
      content: (kit) => (
        <div className="space-y-3">
          {lab(kit, !done2)}
          {done3 ? (
            <>
              <Feedback tone="ok">
                Près de 0, <strong>1/x explose</strong> (1/0,1 = 10, 1/0,01 = 100) pendant que x² s’écrase (0,01). Loin de 0, c’est <strong>x² qui explose</strong> (100² = 10 000) pendant que 1/x s’écrase (0,01). |x| suit l’entrée sans surprise. Trois courbes, trois caractères — les modules suivants les nomment.
              </Feedback>
              <KnowledgeBrick
                id="regle-pres-loin-zero"
                variant="new"
                lead="Le tout petit nombre et le grand nombre que tu viens de taper : voilà ce qu’ils ont montré."
              />
            </>
          ) : (
            <Feedback tone="info">{!has((t) => t !== 0 && Math.abs(t) <= 0.25) ? 'Un petit nombre, entre 0 et 0,25. ' : ''}{!has((t) => Math.abs(t) >= 10) ? 'Puis un grand nombre, 10 ou plus.' : ''}</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4, title: 'À toi de tracer la parabole',
      subtitle: 'Choisis une ligne du tableau, place le point à la bonne position, recommence. La courbe viendra ensuite.',
      done: allPlaced,
      content: (kit) => (
        <div className="space-y-3">
          <PlotTable
            f={SQUARE} xs={PLOT_XS} range={SQUARE_RANGE}
            placed={placed} active={activeX} onActive={setActiveX}
            moves={moves}
            onPlace={(x, pt) => {
              setPlaced((prev) => ({ ...prev, [x]: pt }));
              setMoves((m) => ({ ...m, [x]: (m[x] ?? 0) + 1 }));
            }}
            onEscape={(x) => setPlaced((prev) => ({ ...prev, [x]: { x, y: imageOf(SQUARE, x) } }))}
            showCurve={allPlaced}
          />
          {allPlaced ? (
            <>
              <Feedback tone="ok">
                Sept points posés à la main, et la courbe passe exactement par eux : une
                <strong> parabole</strong>. Elle ne s’arrête pas à tes points — elle continue entre
                eux et au-delà, parce que x² se calcule pour TOUT nombre.
              </Feedback>
              <KnowledgeBrick
                id="methode-tableau-tracer"
                variant="new"
                lead="Tu viens de le faire à la main : voilà la méthode, dans l’ordre où tu l’as suivie."
              />
            </>
          ) : (
            <Feedback tone="info">
              L’abscisse du point est la valeur de x de la ligne choisie ; son ordonnée est l’image,
              c’est-à-dire x². Place les sept points.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5, title: 'Qui refuse quoi ?', done: q4,
      content: (
        <TapQuestion prompt="Une seule des trois machines refuse une entrée. Laquelle, et pour quelle entrée ?"
          options={['1/x refuse 0 : on ne divise pas par zéro', 'x² refuse les nombres négatifs', '|x| refuse les nombres négatifs', 'Aucune : toutes acceptent tous les nombres']}
          correct={0} cols={1} requires={['fonction', 'image', 'trois-references']}
          explain="Diviser par 0 n’a pas de sens : 0 n’a pas d’image par x ↦ 1/x. Les deux autres acceptent tout nombre : (−3)² = 9 et |−3| = 3 existent."
          explainWrong="Tu l’as vu en tapant 0 : seule la machine 1/x a affiché « refusé ». Un carré ou une valeur absolue de nombre négatif existe toujours (et n’est pas négatif)."
          solved={q4} onAnswered={() => setQ4(true)} />
      ),
    },
  ];

  return (
    <ContentModule ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Trois machines, une sonde" moduleSubtitle="Le même nombre, trois destins" estimatedTime="14 min"
      brief={{ tag: 'Déclencheur', title: 'x², 1/x, |x|', tone: 'indigo', body: <p>Trois machines calculent chacune leur sortie pour la même entrée x. Les sorties deviennent des points sur un même repère. Nourris-les, compare, cherche les surprises.</p> }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Les noms.</strong> Ces trois machines sont les <strong>fonctions de référence</strong> de la Seconde : la fonction carré, la fonction inverse, la fonction valeur absolue. Leurs courbes ont un nom aussi — module suivant, la parabole.
        </KnowledgeSnapshot>
      }
    />
  );
}
