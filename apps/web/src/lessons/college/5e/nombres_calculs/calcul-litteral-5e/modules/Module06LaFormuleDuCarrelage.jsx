import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { CARRELAGE, ecrire, valeur, parseEntier } from '../components/litteral';

/**
 * Module 6 — LABORATOIRE D'ENTRAÎNEMENT : produire une formule, puis l'appliquer.
 *
 * Transfert, pas répétition : jusqu'ici les formules étaient FOURNIES. Ici,
 * l'élève doit en PRODUIRE une à partir d'une situation qu'il compte lui-même,
 * la vérifier sur un cas déjà connu, puis l'appliquer à un cas hors de portée
 * du comptage. C'est le cycle complet du chapitre, en une seule situation.
 *
 * La vérification sur un cas connu n'est pas une formalité : c'est la seule
 * chose qui permet à l'élève de savoir seul si sa formule est bonne, et le
 * module en fait une étape à part entière.
 *
 * Toutes les valeurs viennent de components/litteral.js, et un test vérifie
 * que la figure décrite compte bien ce que la formule annonce.
 */
const R = CARRELAGE.regle;   // 4n + 4

/** La bordure autour d'un carré — DOM en flux, aucune coordonnée calculée. */
function Bordure({ n }) {
  const cote = n + 2;
  const px = Math.max(14, Math.round(160 / cote));
  return (
    <div className="overflow-x-auto flex justify-center">
      <div
        className="grid gap-[2px] w-max"
        style={{ gridTemplateColumns: `repeat(${cote}, ${px}px)` }}
        role="img"
        aria-label={`Un bassin carré de côté ${n}, entouré de ${CARRELAGE.compte(n)} carreaux`}
      >
        {Array.from({ length: cote * cote }, (_, i) => {
          const ligne = Math.floor(i / cote);
          const col = i % cote;
          const bord = ligne === 0 || ligne === cote - 1 || col === 0 || col === cote - 1;
          return (
            <div
              key={i}
              style={{ width: px, height: px }}
              className={`rounded-[2px] ${bord ? 'bg-rose-500' : 'bg-sky-200'}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function Module06LaFormuleDuCarrelage() {
  const [n, setN] = useState(1);
  const [comptes, setComptes] = useState(() => new Set([1]));
  const done1 = comptes.size >= 3;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const changer = (v, react) => {
    setN(v);
    const next = new Set(comptes);
    next.add(v);
    setComptes(next);
    if (next.size >= 3 && comptes.size < 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Compte les carreaux de la bordure',
      subtitle: 'Un bassin carré, entouré d’une rangée de carreaux. Change la taille du bassin au moins trois fois.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir le côté du bassin">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => changer(v, kit.react)}
                  aria-pressed={v === n}
                  data-cote={v}
                  className={[
                    'min-h-[44px] min-w-[48px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                    v === n
                      ? 'border-rose-500 bg-rose-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-rose-400',
                  ].join(' ')}
                >
                  {v}
                </button>
              ))}
            </div>
            <Bordure n={n} />
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-lg bg-sky-50 border border-sky-200 py-1.5">
                <div className="text-[11px] text-sky-700">côté du bassin</div>
                <div className="font-mono font-black text-sky-800 tabular-nums">{n}</div>
              </div>
              <div className="rounded-lg bg-rose-50 border-2 border-rose-200 py-1.5">
                <div className="text-[11px] text-rose-700">carreaux de bordure</div>
                <output className="font-mono text-xl font-black text-rose-800 tabular-nums" data-bordure={String(CARRELAGE.compte(n))}>
                  {CARRELAGE.compte(n)}
                </output>
              </div>
            </div>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Côté 1 → 8 carreaux ; côté 2 → 12 ; côté 3 → 16. À chaque fois que le bassin grandit
              d’une unité, il faut <strong>4 carreaux de plus</strong> — un par côté. Et il y a
              toujours les <strong>4 carreaux des coins</strong> en supplément.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {comptes.size} taille{comptes.size > 1 ? 's' : ''} essayée{comptes.size > 1 ? 's' : ''} sur 3.
              De combien le nombre de carreaux augmente-t-il à chaque fois ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écris la formule',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="produire-formule"
            variant="new"
            lead={<>Tu as compté trois cas et repéré ce qui se répète. Il ne reste qu’à écrire la recette — et surtout à la vérifier.</>}
          />
          <TapQuestion
            prompt={<>Quelle formule donne le nombre de carreaux de bordure pour un bassin de côté <span className="font-mono font-bold">n</span> ?</>}
            options={[
              ecrire(R),
              ecrire({ a: 4, b: 0 }),
              ecrire({ a: 1, b: 4 }),
              ecrire({ a: 8, b: 0 }),
            ]}
            correct={0}
            cols={2}
            requires={['produire-formule', 'ecrire-expression']}
            explain={`Quatre carreaux s’ajoutent par unité de côté (${ecrire({ a: 4, b: 0 })}), plus les quatre coins qui sont toujours là : ${ecrire(R)}. Vérification sur le côté 3 : 4 × 3 + 4 = ${valeur(R, 3)}, et on avait bien compté ${CARRELAGE.compte(3)}. ✓`}
            explainWrong={`${ecrire({ a: 4, b: 0 })} oublierait les quatre coins : pour le côté 1, cela donnerait 4 carreaux alors qu’on en a compté 8. Vérifie toujours ta formule sur un cas que tu as compté toi-même — c’est ainsi qu’on repère l’oubli.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Vérifie-la sur un cas connu',
      subtitle: 'L’étape qu’il ne faut jamais sauter.',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Applique <span className="font-mono font-bold">{ecrire(R)}</span> au bassin de côté <strong>5</strong>. Combien de carreaux ?</>}
            expected={valeur(R, 5)}
            parse={parseEntier}
            display={String(valeur(R, 5))}
            requires={['produire-formule', 'substituer']}
            explain={`4 × 5 + 4 = ${valeur(R, 5)}. Et si tu comptes les carreaux rouges sur le dessin du côté 5, tu en trouves exactement ${CARRELAGE.compte(5)}. La formule est confirmée.`}
            explainFor={(rep) => {
              if (rep === 20) return 'Tu as calculé 4 × 5 = 20, mais tu as oublié le + 4 des coins. Le total est 24.';
              if (rep === 45) return 'Tu as collé le 4 et le 5. L’écriture 4n cache un signe × : il faut faire 4 × 5 = 20, puis ajouter 4.';
              return `4 × 5 = 20, puis 20 + 4 = ${valeur(R, 5)}.`;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le grand bassin',
      subtitle: 'Impossible à dessiner — et pourtant immédiat.',
      done: q4,
      content: (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-rose-200 bg-rose-50 p-3.5 text-sm text-slate-700">
            Un hôtel commande un bassin carré de <strong>30 carreaux de côté</strong>. Le carreleur
            doit savoir combien de carreaux de bordure commander.
          </div>
          <NumericQuestion
            prompt="Combien de carreaux de bordure faut-il ?"
            expected={valeur(R, 30)}
            parse={parseEntier}
            display={String(valeur(R, 30))}
            suffix="carreaux"
            requires={['produire-formule', 'substituer']}
            explain={`4 × 30 + 4 = ${valeur(R, 30)}. Dessiner ce bassin aurait demandé de compter plus de mille cases ; la formule répond en une ligne.`}
            explainFor={(rep) => {
              if (rep === 120) return 'Tu as calculé 4 × 30 = 120 sans ajouter les quatre coins. Le total est 124.';
              if (rep === 900) return 'Tu as calculé l’AIRE du bassin (30 × 30). La question porte sur la bordure, c’est-à-dire le contour : 4 × 30 + 4 = 124.';
              return `4 × 30 = 120, puis + 4 : ${valeur(R, 30)}.`;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Voilà tout l’intérêt du calcul littéral : une formule écrite{' '}
              <strong>une seule fois</strong>, à partir de trois petits cas comptés à la main,
              répond ensuite pour <strong>n’importe quelle taille</strong> — y compris celles qu’on
              ne pourrait jamais dessiner.
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
      moduleTitle="La formule du carrelage"
      moduleSubtitle="Produire une formule, la vérifier, l’appliquer"
      estimatedTime="10 min"
      brief={{
        tag: 'Entraînement',
        title: 'Combien de carreaux autour du bassin ?',
        tone: 'amber',
        body: (
          <p>
            Cette fois, <strong>personne ne te donne la formule</strong>. Tu vas compter quelques
            cas, en tirer une recette, la vérifier — puis t’en servir pour un bassin que tu ne
            pourrais jamais dessiner.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
