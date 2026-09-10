import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import MidpointLab from '../components/MidpointLab';
import { VecName } from '../components/VectorScene';
import { sub, norm } from '../components/vecteurUtils';
import { SCENES, RANGE, equal, normText, formatVec, formatNum, midpoint, vec, dist, parseDecSigned } from '../components/vecteurUtils';

/**
 * Module 6 — MANIPULATION : mesurer un vecteur.
 *
 * Activity              lire la norme dans l'escalier (Pythagore) ; calculer
 *                       une distance ; placer un milieu.
 * Mathematical objective ‖u‖ = √(x² + y²) dans une base orthonormée ;
 *                       AB = ‖AB‖ ; I milieu ⟺ AI = IB ⟺ coordonnées moyennes.
 * Student action        régler u jusqu'à (3 ; 4) puis (6 ; 8) ; déplacer I.
 * Controlled variable   u, puis I.
 * Visual consequence    l'escalier = un triangle rectangle dont la flèche est
 *                       l'hypoténuse ; le calcul écrit dessous ; deux flèches
 *                       AI, IB qui deviennent égales.
 * Expected observation  « la longueur, c'est Pythagore sur les deux marches » ;
 *                       « doubler le vecteur double la longueur ».
 * Misconception targeted ‖u‖ = x + y ; oublier la racine ; milieu = (B − A)/2.
 */
const { u: U, origin: O } = SCENES.norme;
const U2 = { x: 6, y: 8 };
const A2 = { x: -1, y: 2 };
const B2 = { x: 3, y: -1 };
const { A: A3, B: B3 } = SCENES.milieu;
const M3 = midpoint(A3, B3);
const C4 = { x: 2, y: -3 };
const D4 = { x: -4, y: 1 };

function NormReadout({ v }) {
  const n = normText(v);
  return (
    <p className="text-sm flex flex-wrap items-center gap-2 font-mono tabular-nums" aria-live="polite">
      <span className="px-3 py-1 rounded-lg bg-cyan-100 text-cyan-900 font-bold">‖<VecName>u</VecName>‖² = {n.squares}</span>
      <span className="px-3 py-1 rounded-lg bg-cyan-600 text-white font-bold">‖<VecName>u</VecName>‖ = {n.exact}{n.approx ? ` ≈ ${n.approx}` : ''}</span>
    </p>
  );
}

export default function Module06MesurerUnVecteur() {
  const [v1, setV1] = useState({ x: 2, y: 1 });
  const [seen, setSeen] = useState(() => new Set());
  const done1 = seen.has('a') && seen.has('b');

  const [q2, setQ2] = useState(false);
  const [bPoint, setBPoint] = useState({ x: 2, y: 3 });
  const [probeSeen, setProbeSeen] = useState(() => new Set());
  const [probed, setProbed] = useState(false);

  const [I, setI] = useState({ x: 1, y: -3 });
  const done3 = equal(vec(A3, I), vec(I, B3));

  const [q4, setQ4] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'La longueur sort de l’escalier',
      subtitle: 'Règle u = (3 ; 4) et lis sa longueur. Puis double-le : (6 ; 8).',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={O}
            vector={v1}
            onVectorChange={(nv) => {
              setV1(nv);
              const key = equal(nv, U) ? 'a' : equal(nv, U2) ? 'b' : null;
              if (key && !seen.has(key)) { const s = new Set(seen); s.add(key); setSeen(s); kit.react(true); }
            }}
            mode="build"
            range={RANGE}
            names={{ origin: 'A', tip: 'B', vector: 'u' }}
            escalier
            showWords={false}
            ariaLabel={`Flèche u depuis A, coordonnées ${formatVec(v1)}`}
          />
          <NormReadout v={v1} />
          {done1 ? (
            <Feedback tone="ok">
              L’escalier est un triangle rectangle et la flèche en est l’hypoténuse : Pythagore donne{' '}
              ‖<VecName>u</VecName>‖ = √(3² + 4²) = 5, puis √(6² + 8²) = 10. Doubler le vecteur{' '}
              <strong>double</strong> la longueur (pas ×4). Cette formule marche parce que la base est{' '}
              <strong>orthonormée</strong> : axes perpendiculaires, même unité.
            </Feedback>
          ) : null}
          {/* Le calcul vient de se réécrire deux fois sous les yeux de
              l'élève, pour (3;4) puis (6;8) : la méthode est ce résultat. */}
          {done1 && (
            <KnowledgeBrick
              id="methode-calcul-norme"
              variant="new"
              lead={<>Tu viens de lire l’escalier de u = (3 ; 4), puis de (6 ; 8).</>}
            />
          )}
          {done1 && (
            <KnowledgeBrick
              id="vocab-norme"
              variant="new"
              compact
              lead={<>Le nombre que tu viens de calculer deux fois porte un nom.</>}
            />
          )}
          {done1 && (
            <KnowledgeBrick
              id="formule-norme"
              variant="new"
              compact
              lead={<>La même règle, écrite en formule.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">{seen.has('a') ? 'Maintenant (6 ; 8).' : 'D’abord (3 ; 4).'} Regarde le calcul se réécrire à chaque réglage — y compris quand la racine ne tombe pas juste.</Feedback>
          )}
        </div>
      ),
    },
    {
      // Le pas « la distance AB EST la norme du vecteur AB » était ANNONCÉ par
      // ce sous-titre, puis éprouvé par la question qui suivait : l'élève
      // vérifiait une identification qu'on venait de lui donner. Il la
      // CONSTATE désormais — il déplace B, et les deux nombres (la distance
      // mesurée, la norme calculée) restent égaux quoi qu'il fasse.
      num: 2,
      title: 'Deux nombres qui ne se séparent jamais',
      subtitle: 'Déplace B où tu veux. À gauche : la distance de A à B. À droite : la longueur de la flèche AB. Compare.',
      done: probed,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={A2}
            vector={sub(bPoint, A2)}
            onVectorChange={(nv) => {
              const nb = { x: A2.x + nv.x, y: A2.y + nv.y };
              setBPoint(nb);
              const seenNext = new Set(probeSeen);
              seenNext.add(`${nb.x},${nb.y}`);
              setProbeSeen(seenNext);
              if (seenNext.size >= 3 && !probed) { setProbed(true); kit.react(true); }
            }}
            mode="build"
            range={RANGE}
            names={{ origin: 'A', tip: 'B', vector: 'AB' }}
            escalier
            showWords={false}
            ariaLabel={`Point B en ${formatVec(bPoint)}, flèche AB depuis A`}
          />
          <p className="text-sm flex flex-wrap items-center gap-2 font-mono tabular-nums" aria-live="polite">
            <span className="px-3 py-1 rounded-lg bg-violet-100 text-violet-900 font-bold" data-distance={dist(A2, bPoint)}>
              distance AB = {formatNum(dist(A2, bPoint))}
            </span>
            <span className="px-3 py-1 rounded-lg bg-cyan-600 text-white font-bold" data-norme={norm(sub(bPoint, A2))}>
              ‖<VecName>AB</VecName>‖ = {formatNum(norm(sub(bPoint, A2)))}
            </span>
          </p>
          {probed ? (
            <>
              <Feedback tone="ok">
                Trois positions de B, et les deux nombres n’ont jamais différé. Ce n’est pas une
                coïncidence : la flèche <VecName>AB</VecName> a justement pour longueur l’écart entre
                A et B. <strong>Mesurer une distance et calculer une norme sont le même geste</strong> —
                et c’est pourquoi la formule de la norme donne aussi la distance.
              </Feedback>
              <KnowledgeBrick
                id="vocab-norme"
                variant="rappel"
                compact
                lead={<>Tu viens de le vérifier trois fois : AB = ‖<VecName>AB</VecName>‖.</>}
              />
            </>
          ) : (
            <Feedback tone="info">
              Déplace B encore {3 - probeSeen.size} fois et surveille les deux étiquettes.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'La distance entre deux points',
      subtitle: `A ${formatVec(A2)} et B ${formatVec(B2)}. À toi de la calculer, sans la lire.`,
      done: q2,
      content: (
        <NumericQuestion
          prompt="Combien vaut AB ?"
          expected={dist(A2, B2)}
          parse={parseDecSigned}
          display={formatNum(dist(A2, B2))}
          width="w-24"
          requires={['methode-calcul-norme', 'vocab-norme', 'regle-coordonnees']}
          explain={`AB = (3 − (−1) ; −1 − 2) = (4 ; −3), donc AB = √(4² + (−3)²) = √(16 + 9) = √25 = 5.`}
          explainFor={(n) => (n === 25
            ? '25 est AB², la somme des carrés. Il reste la racine : √25 = 5.'
            : n === 7 ? '7 est 4 + 3, la somme des marches. Une longueur ne s’ajoute pas ainsi : c’est √(4² + 3²) = 5.'
              : n === 1 ? '1 serait 4 − 3. Les carrés s’AJOUTENT : 16 + 9 = 25, et √25 = 5.' : null)}
          solved={q2}
          onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Place le milieu',
      subtitle: `A ${formatVec(A3)}, B ${formatVec(B3)}. Déplace I jusqu’à ce que AI et IB soient le même vecteur.`,
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <MidpointLab A={A3} B={B3} I={I} onI={(p) => { setI(p); if (equal(vec(A3, p), vec(p, B3))) kit.react(true); }} range={RANGE} />
          {done3 ? (
            <Feedback tone="ok">
              I {formatVec(M3)} : <VecName>AI</VecName> = <VecName>IB</VecName>, chacun vaut la moitié de{' '}
              <VecName>AB</VecName>. Ses coordonnées sont les <strong>moyennes</strong> de celles de A et B :
              ({formatNum(A3.x)} + {formatNum(B3.x)}) ÷ 2 = {formatNum(M3.x)} et ({formatNum(A3.y)} + {formatNum(B3.y)}) ÷ 2 = {formatNum(M3.y)}.
            </Feedback>
          ) : null}
          {/* I vient d'être amené à la position où AI = IB : le milieu est
              ce point que l'élève a lui-même trouvé par tâtonnement. */}
          {done3 && (
            <KnowledgeBrick
              id="methode-milieu"
              variant="new"
              lead={<>Tu viens de déplacer I jusqu’à ce que <VecName>AI</VecName> et <VecName>IB</VecName> deviennent le même vecteur.</>}
            />
          )}
          {done3 && (
            <KnowledgeBrick
              id="formule-milieu"
              variant="new"
              compact
              lead={<>La même règle, écrite en formule.</>}
            />
          )}
          {!done3 && (
            <Feedback tone="info">Le point I peut se poser au demi-carreau. Les deux flèches doivent avoir les mêmes coordonnées.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 5,
      title: 'Sans la figure',
      done: q4,
      content: (
        <TapQuestion
          prompt={`Quel est le milieu de [CD], avec C ${formatVec(C4)} et D ${formatVec(D4)} ?`}
          options={[formatVec(midpoint(C4, D4)), '(−3 ; 2)', '(−2 ; −2)', '(3 ; −2)']}
          correct={0}
          cols={2}
          requires={['methode-milieu', 'formule-milieu']}
          explain="Moyenne des abscisses : (2 + (−4)) ÷ 2 = −1 ; moyenne des ordonnées : (−3 + 1) ÷ 2 = −1. Le milieu est (−1 ; −1)."
          explainWrong="(−3 ; 2) est la moitié du vecteur CD, pas un point : le milieu s’obtient avec la SOMME des coordonnées divisée par 2, soit (−1 ; −1)."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Mesurer un vecteur"
      moduleSubtitle="Norme, distance, milieu"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Combien mesure la flèche ?',
        tone: 'cyan',
        body: (
          <p>
            Jusqu’ici, on comptait des cases. Mais la flèche (3 ; 2) ne mesure ni 3, ni 2, ni 5 cases.
            Sa longueur se cache dans l’escalier.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
