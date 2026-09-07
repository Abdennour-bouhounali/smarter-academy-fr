import React, { useState } from 'react';
import { ContentModule, NumericQuestion, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NumberLineLab from '../components/NumberLineLab';
import { fmt, fmtParen, ajouter, parseRelatif } from '../components/relatifs';

/**
 * Module 4 — MANIPULATION : additionner, c'est se déplacer.
 *
 * L'élève ne reçoit aucune règle de signes. Il place un départ, choisit un pas
 * (positif ou négatif), et VOIT l'arc de déplacement l'emmener à droite ou à
 * gauche. Le sens du déplacement est la conséquence visible du signe du pas —
 * c'est l'observation que le module organise, et que la brique nomme ensuite.
 *
 * Ce que ce module ne fait PAS : la soustraction (M5), le produit (4e).
 */
const PAS_CHOICES = [-5, -3, -1, 1, 3, 5];
const DEPART_1 = 3;

export default function Module04SeDeplacerSurLaDroite() {
  // Étape 1 — le laboratoire : un départ, un pas, un arc.
  const [depart, setDepart] = useState(DEPART_1);
  const [pas, setPas] = useState(null);
  const [pred1, setPred1] = useState(null);
  const [essais, setEssais] = useState(() => new Set());
  // On valide quand l'élève a essayé un pas NÉGATIF et un pas POSITIF : le
  // sens ne se comprend qu'en comparant les deux.
  const done1 = [...essais].some((p) => p < 0) && [...essais].some((p) => p > 0);

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const arrivee = pas === null ? depart : ajouter(depart, pas);

  const choisirPas = (p, react) => {
    setPas(p);
    const next = new Set(essais); next.add(p); setEssais(next);
    if (!done1 && [...next].some((x) => x < 0) && [...next].some((x) => x > 0)) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Choisis un pas, regarde où tu arrives',
      subtitle: 'Glisse le départ, puis choisis un pas. Essaie un pas positif ET un pas négatif.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <NumberLineLab
            min={-10} max={10}
            value={depart}
            onChange={(n) => { setDepart(n); setPas(null); }}
            marks={pas === null ? [] : [{ at: arrivee, label: `arrivée ${fmt(arrivee)}`, color: '#059669' }]}
            jump={pas === null ? null : { from: depart, to: arrivee, label: `+ ${fmtParen(pas)}` }}
            ariaLabel={`Droite graduée — départ ${fmt(depart)}${pas === null ? '' : `, arrivée ${fmt(arrivee)}`}`}
          />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir le pas">
            {PAS_CHOICES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => choisirPas(p, kit.react)}
                aria-pressed={pas === p}
                className={[
                  'min-h-[44px] px-3 rounded-xl border-2 text-sm font-bold tabular-nums',
                  pas === p
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400',
                ].join(' ')}
              >
                + {fmtParen(p)}
              </button>
            ))}
          </div>
          <PredictionChips
            prompt="Avant d’essayer un pas négatif : dans quel sens la flèche va-t-elle partir ?"
            options={[
              { id: 'droite', label: 'Vers la droite' },
              { id: 'gauche', label: 'Vers la gauche' },
              { id: 'depend', label: 'Ça dépend du départ' },
            ]}
            value={pred1}
            onChange={setPred1}
            disabled={done1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'gauche' ? 'Ta prédiction était juste' : 'Voilà ce qui se passe'} : le signe
              du pas décide du <strong>sens</strong>, et le départ n’y change rien. Ajouter un{' '}
              <strong>positif</strong> emmène <strong>vers la droite</strong>, ajouter un{' '}
              <strong>négatif</strong> emmène <strong>vers la gauche</strong>. La longueur du saut,
              elle, est la distance à zéro du pas.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {essais.size === 0
                ? 'Choisis un premier pas et observe la flèche.'
                : [...essais].some((p) => p < 0)
                  ? 'Tu as essayé un pas négatif. Essaie maintenant un pas positif.'
                  : 'Tu as essayé un pas positif. Essaie maintenant un pas négatif.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Calcule une arrivée',
      done: q2,
      content: (
        <div className="space-y-3">
          {/* Le déplacement vient d'être fait dans les deux sens : on peut
              nommer l'opération avant de demander de la calculer. */}
          <KnowledgeBrick
            id="addition-deplacement"
            variant="new"
            lead={<>Ce que tu viens de faire — partir d’un nombre et sauter d’un certain nombre de graduations — est une <strong>addition</strong>.</>}
          />
          <NumericQuestion
            prompt={`Combien fait 3 + ${fmtParen(-8)} ?`}
            above={
              <NumberLineLab
                min={-10} max={10}
                value={null}
                marks={[{ at: 3, label: 'départ', color: '#4f46e5' }]}
                ariaLabel="Droite graduée — départ sur 3"
              />
            }
            expected={ajouter(3, -8)}
            parse={parseRelatif}
            display={fmt(ajouter(3, -8))}
            requires={['addition-deplacement', 'droite-relatifs']}
            explain={`On part de 3 et on saute 8 graduations vers la gauche (le pas est négatif) : on arrive sur ${fmt(ajouter(3, -8))}.`}
            explainFor={(n) => (n === 11
              ? <>Tu as ajouté les distances à zéro. Mais le pas est <strong>négatif</strong> : il fait reculer, pas avancer.</>
              : n === 5
                ? <>Attention : 8 − 3 donnerait 5, mais on part <strong>de 3</strong> et on retire 8 — on dépasse le zéro.</>
                : null)}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quand on part d’un négatif',
      done: q3,
      content: (
        <NumericQuestion
          prompt={`Combien fait ${fmt(-6)} + ${fmtParen(4)} ?`}
          above={
            <NumberLineLab
              min={-10} max={6}
              value={null}
              marks={[{ at: -6, label: 'départ', color: '#e11d48' }]}
              ariaLabel="Droite graduée — départ sur −6"
            />
          }
          expected={ajouter(-6, 4)}
          parse={parseRelatif}
          display={fmt(ajouter(-6, 4))}
          requires={['addition-deplacement', 'droite-relatifs']}
          explain={`On part de ${fmt(-6)} et on avance de 4 graduations vers la droite : on arrive sur ${fmt(ajouter(-6, 4))}. On se rapproche de zéro sans l’atteindre.`}
          explainFor={(n) => (n === -10
            ? <>Le pas est <strong>positif</strong> : il fait avancer vers la droite, donc se rapprocher du zéro.</>
            : n === 10 || n === 2
              ? <>Attention au point de départ : on part de {fmt(-6)}, à gauche du zéro, pas de 6.</>
              : null)}
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
    {
      num: 4,
      title: 'Le signe du résultat, sans calculer',
      done: q4,
      content: (
        <TapQuestion
          prompt={`Sans poser le calcul : le résultat de ${fmt(-9)} + ${fmtParen(4)} est-il positif ou négatif ?`}
          options={[
            `Négatif : on part de loin à gauche et on n’avance que de 4`,
            `Positif : on ajoute un nombre positif`,
            `Nul : les deux se compensent`,
            `On ne peut pas le savoir sans calculer`,
          ]}
          correct={0}
          cols={1}
          requires={['addition-deplacement', 'ordre-relatifs', 'distance-a-zero']}
          explain={`${fmt(-9)} est à 9 graduations à gauche du zéro. Avancer de 4 ne suffit pas à le franchir : on s’arrête sur ${fmt(ajouter(-9, 4))}, encore négatif. Comparer les deux distances à zéro suffit à prévoir le signe.`}
          explainWrong="Ajouter un positif rapproche du zéro, mais ne fait pas forcément changer de côté : tout dépend de la distance qui restait à parcourir."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Se déplacer sur la droite"
      moduleSubtitle="Additionner, c’est bouger"
      estimatedTime="12 min"
      brief={{
        tag: 'Manipulation',
        title: 'Un départ, un pas, une arrivée',
        tone: 'slate',
        body: (
          <p>
            Additionner un nombre relatif, ce n’est pas « faire un calcul » : c’est{' '}
            <strong>partir d’un endroit et se déplacer</strong>. Le signe du nombre ajouté dit dans
            quel sens on part. Essaie.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
