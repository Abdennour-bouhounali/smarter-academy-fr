import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion , KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import MathText from '../../../../../common/components/MathText';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ReducedLab from '../components/ReducedLab';
import PredictionChips from '../components/PredictionChips';
import { lineFromSlopeIntercept, intersection, intersectionInFrame, frameFor, fracCoupleText, parseDec, formatDec } from '../components/droitesUtils';

/**
 * Module 4 — MANIPULATION : le point d'intersection.
 *
 * Activity               (d₁) : y = 0,5x + 2 figée ; (d₂) : y = m₂x + p₂ réglable ;
 *                        trois cadres (±6, ±15, ±40).
 * Student action         déplacer I en réglant (d₂), le faire SORTIR du cadre,
 *                        le retrouver en dézoomant ; puis résoudre le système
 *                        à la main pour un cas précis.
 * Controlled variable    m₂, p₂, puis le cadre.
 * Mathematical state     (m₂, p₂) ; I = solution exacte du système (Cramer),
 *                        DÉRIVÉE — jamais lue sur le dessin.
 * Visual consequence     I glisse le long de (d₁) ; il disparaît du cadre mais
 *                        ses coordonnées restent affichées (« hors du cadre »)
 *                        et réapparaissent au dézoom.
 * Expected observation   « deux droites qui ne se coupent pas SUR LE DESSIN se
 *                        coupent quand même — plus loin » ; « I vérifie les
 *                        DEUX équations : x est la solution de m₁x + p₁ = m₂x + p₂ ».
 * Misconception targeted « pas d'intersection visible ⇒ parallèles » ;
 *                        résoudre m₁x + p₁ = m₂x + p₂ en oubliant de
 *                        déplacer le terme en x ou de diviser.
 * Formalization          la méthode « intersection = système », pied de module.
 */
const D1 = { m: 0.5, p: 2 };
const SYS = { m: -1, p: -1 }; // y = −x − 1 : I(−2 ; 1)

export default function Module04LePointDIntersection() {
  const [val, setVal] = useState({ m: -1, p: -1 });
  const [halfSpan, setHalfSpan] = useState(6);
  const [pred1, setPred1] = useState(null);
  const [escaped, setEscaped] = useState(false);
  const [found, setFound] = useState(false);
  const [qx, setQx] = useState(false);
  const [qy, setQy] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const done1 = escaped && found;

  const L1 = lineFromSlopeIntercept(D1.m, D1.p);
  const I = intersection(L1, lineFromSlopeIntercept(val.m, val.p));
  const inSmall = intersectionInFrame(I, frameFor(6).range);
  const inCurrent = intersectionInFrame(I, frameFor(halfSpan).range);

  const change1 = (next) => {
    setVal(next);
    const nextI = intersection(L1, lineFromSlopeIntercept(next.m, next.p));
    if (nextI && !intersectionInFrame(nextI, frameFor(6).range)) setEscaped(true);
  };
  const zoom1 = (h, react) => {
    setHalfSpan(h);
    if (escaped && I && intersectionInFrame(I, frameFor(h).range) && !inSmall && !found) { setFound(true); react?.(true); }
  };

  const steps = [
    {
      num: 1,
      title: 'Fais sortir I du cadre, puis retrouve-le',
      subtitle: 'Règle (d₂) pour que le point commun quitte le cadre ±6 (les équations le connaissent encore). Puis dézoome pour le voir.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips prompt="si deux droites ne se coupent pas dans le cadre du dessin, alors…"
            options={[{ id: 'par', label: 'Elles sont parallèles' }, { id: 'loin', label: 'Elles se coupent peut-être plus loin' }, { id: 'jamais', label: 'Elles ne se coupent jamais' }]}
            value={pred1} onChange={setPred1} disabled={done1} />
          <ReducedLab d1={D1} value={val} onChange={change1} halfSpan={halfSpan} onHalfSpan={(h) => zoom1(h, kit.react)} />
          {done1 ? (
            <>
              <Feedback tone="ok">
              {pred1 === 'loin' ? 'Ta prédiction était la bonne' : pred1 ? 'Ta prédiction ne tenait pas' : 'Regarde'} : I {fracCoupleText(I)} existait <strong>hors du cadre</strong> — les
              droites étaient sécantes, pas parallèles. Le dessin a des bords ; les équations n’en ont pas. Seul le calcul (ou m₁ = m₂) permet de conclure « parallèles ».
              </Feedback>
              {/* Le cadre vient de mentir à l'élève : c'est le moment d'établir
                  ce que la lecture graphique peut, et ne peut pas, prouver. */}
              <KnowledgeBrick
                id="methode-interpretation-graphique"
                variant="new"
                lead="Tu viens de voir un point commun disparaître du dessin sans cesser d’exister."
              />
            </>
          ) : (
            <Feedback tone="info">
              {!escaped ? (I ? `I ${fracCoupleText(I)} est dans le cadre. Rapproche m₂ de 0,5 (sans l’atteindre) ou éloigne p₂ : I file le long de (d₁).` : 'Parallèles : aucun point commun. Remets m₂ ≠ 0,5.')
                : inCurrent ? 'I est de nouveau dans le cadre ? Alors dézoome après l’avoir fait sortir de ±6.' : `I ${I ? fracCoupleText(I) : ''} est hors du cadre. Change de cadre (±15 ou ±40) pour le voir.`}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Résous le système',
      subtitle: '(d₁) : y = 0,5x + 2 et (d₂) : y = −x − 1. Le point commun vérifie les deux équations à la fois.',
      done: qx && qy,
      content: (
        <div className="space-y-4">
          <ReducedLab d1={D1} value={SYS} onChange={() => {}} disabled />
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
            En I, les deux ordonnées sont égales : <MathText>{'$0{,}5x + 2 = -x - 1$'}</MathText>. Une seule inconnue, une seule équation.
          </div>
          {/* Le point commun est ici DEMANDÉ par le calcul : la notion de système
              et la marche à suivre se posent avant les deux questions. */}
          <KnowledgeBrick
            id="point-intersection-systeme"
            variant="new"
            lead="Ce que tu t’apprêtes à calculer porte un nom : c’est la solution d’un système."
          />
          <KnowledgeBrick
            id="methode-resoudre-systeme"
            variant="new"
            lead="Deux étapes, toujours les mêmes."
          />
          <KnowledgeBrick
            id="formule-abscisse-intersection"
            variant="new"
            lead="Et l’égalité par laquelle tout commence."
          />
          <NumericQuestion
            prompt="Résous 0,5x + 2 = −x − 1. Abscisse x de I ?"
            expected={-2}
            parse={parseDec}
            display={formatDec(-2)}
            explain={<span>0,5x + x = −1 − 2 ⟺ 1,5x = −3 ⟺ x = −3 ÷ 1,5 = <strong>−2</strong>.</span>}
            explainFor={(n) => (n === 2 ? 'Signe : 0,5x + x = −1 − 2 donne 1,5x = −3, donc x = −2 (négatif).'
              : n === -3 ? 'Tu as oublié de diviser : 1,5x = −3 n’est pas x = −3. x = −3 ÷ 1,5 = −2.'
              : n === -6 || n === 6 ? 'Il faut diviser −3 par 1,5, pas le multiplier par 2 : −3 ÷ 1,5 = −2.'
              : n === -1 ? 'Rassemble d’abord les x d’un côté : 0,5x + x = 1,5x, et les nombres de l’autre : −1 − 2 = −3.'
              : 'Rassemble : 0,5x + x = −1 − 2, soit 1,5x = −3, d’où x = −2.')}
            requires={['point-intersection-systeme', 'methode-resoudre-systeme', 'formule-abscisse-intersection']}
            solved={qx}
            onAnswered={() => setQx(true)}
          />
          {qx && (
            <NumericQuestion
              prompt="Ordonnée y de I ? (remplace x = −2 dans l’une des deux équations)"
              expected={1}
              parse={parseDec}
              display={formatDec(1)}
              explain={<span>y = 0,5 × (−2) + 2 = 1, et l’autre équation confirme : y = −(−2) − 1 = 1. I(−2 ; 1) — le point que le dessin montre.</span>}
              explainFor={(n) => (n === -3 ? 'Tu as remplacé x par 2 : avec x = −2, y = −(−2) − 1 = 2 − 1 = 1.'
                : n === 3 ? 'Vérifie le signe : 0,5 × (−2) = −1, donc y = −1 + 2 = 1.'
                : 'Remplace x = −2 : y = 0,5 × (−2) + 2 = 1. L’autre équation doit donner la même chose : −(−2) − 1 = 1.')}
              requires={['point-intersection-systeme', 'methode-resoudre-systeme']}
              solved={qy}
              onAnswered={() => setQy(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le système n’a pas de solution',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="regle-nombre-solutions"
            variant="new"
            lead="Un système peut n’avoir aucune solution, ou en avoir une infinité — et cela se lit comme une position relative."
          />
          <TapQuestion
          prompt={<span>On cherche le point commun de <MathText>{'$y = 0{,}5x + 2$'}</MathText> et <MathText>{'$y = 0{,}5x - 1$'}</MathText>. L’équation <MathText>{'$0{,}5x + 2 = 0{,}5x - 1$'}</MathText> donne <MathText>{'$2 = -1$'}</MathText>. Que conclure ?</span>}
          options={[
            'Aucune solution : les droites sont strictement parallèles.',
            'Je me suis trompé dans le calcul.',
            'Une infinité de solutions : les droites sont confondues.',
            'x = 0 : les droites se coupent sur l’axe des ordonnées.',
          ]}
          correct={0}
          cols={1}
          explain="Une égalité fausse (2 = −1) signifie qu’aucun x ne convient : les droites n’ont aucun point commun. Cohérent avec m₁ = m₂ = 0,5 et p₁ ≠ p₂. Une égalité toujours vraie (0 = 0) signifierait au contraire des droites confondues."
          explainWrong="Le calcul est juste : 0,5x s’élimine des deux côtés et il reste 2 = −1, faux pour tout x. Aucun point commun, donc strictement parallèles — le système « traduit » la position relative."
          requires={['point-intersection-systeme', 'regle-nombre-solutions']}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Combien de solutions ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-intersection-systeme"
            variant="new"
            lead="La phrase à garder de tout ce module."
          />
          <BatchChoiceQuestion
          intro={<p className="text-sm text-slate-700">Sans résoudre entièrement : combien de couples (x ; y) vérifient les deux équations ?</p>}
          rows={[
            { id: 's1', label: 'y = 2x + 1 et y = −3x + 6', options: ['0', '1', 'une infinité'], correct: 1, correction: 'm différents : un point commun' },
            { id: 's2', label: 'y = 4x − 2 et 8x − 2y − 4 = 0', options: ['0', '1', 'une infinité'], correct: 2, correction: 'même droite' },
            { id: 's3', label: 'y = −x + 5 et x + y + 3 = 0', options: ['0', '1', 'une infinité'], correct: 0, correction: 'y = −x − 3 : parallèle distincte' },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'ko'}>
              {allRight ? 'Trois sur trois.' : `${nCorrect} sur ${total}.`} 1 solution ⟺ sécantes ; 0 ⟺ strictement parallèles ; une infinité ⟺ confondues. Le nombre de solutions du
              système EST la position relative.
            </Feedback>
          )}
          requires={['regle-nombre-solutions', 'point-intersection-systeme', 'mem-intersection-systeme']}
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
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le point d’intersection"
      moduleSubtitle="Le point commun vérifie les deux équations : c’est la solution d’un système"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Où, exactement ?',
        tone: 'emerald',
        body: (
          <p>
            Le point I appartient aux deux droites : ses coordonnées vérifient <strong>les deux équations</strong>. Les nombres affichés sous le repère sont
            calculés, pas lus — ils restent justes même quand I sort du dessin.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          Tu sais décider, et tu sais calculer. Module suivant : des trajectoires, des routes, des points nommés — les mêmes outils, sans les curseurs.
        </KnowledgeSnapshot>
      }
    />
  );
}
