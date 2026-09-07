import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import StructureLab from '../components/StructureLab';

/**
 * Module 1 — LABORATOIRE : « La structure qui tient ».
 *
 * Activity: assembler soi-même la structure d'une situation — combien de
 *   paquets, combien dans chaque paquet — en glissant deux bords de la figure.
 * Mathematical objective: un problème n'est pas un texte à décoder, c'est un
 *   assemblage de quantités. Quand l'assemblage est juste, l'opération se lit
 *   dessus ; personne n'a besoin qu'on lui dise « multiplie ».
 * Student action: attraper le bord droit (le nombre de classes) ou le bord bas
 *   (la taille d'une classe) ; la grille se redessine sous le doigt, le total
 *   suit, sans clic entre le geste et sa conséquence.
 * Mathematical state: {groups, perGroup} ; grille, aire, total, écriture
 *   répétée et écart à la cible en dérivent tous (§28).
 * Expected observation (l'« aha » du module) : 6 paquets de 24 et 24 paquets
 *   de 6 remplissent EXACTEMENT la même surface. La quantité ne dépend pas du
 *   rangement — donc pas non plus de l'ordre des mots dans l'énoncé.
 * Misconception targeted: « l'opération se devine au mot de l'énoncé ». Ici il
 *   n'y a aucun mot-clé : il y a une surface à atteindre.
 * Controlled surprise: en glissant, l'élève passe forcément par des états qui
 *   ratent la cible de peu (5 × 24 = 120, 6 × 25 = 150) — l'écart devient une
 *   information, pas une faute.
 * Formalization: l'écriture 6 × 24 est nommée à l'étape 2, APRÈS le geste ; la
 *   brique « construire-avant-calculer » suit immédiatement l'étape 1.
 * Scaffolding: aucune prise ne se fige après validation (règle projet) ; le
 *   clavier atteint les mêmes états (role="slider", flèches, Début/Fin).
 * Transfer: la même grille sert de modèle « groupes » au module 4, et de
 *   structure GROUPER / PARTAGER au module 6.
 *
 * L'ancienne version était un GroupBuilder piloté par des boutons + / − et
 * verrouillé par un « Valider les 6 classes » : l'élève cliquait six fois sur
 * un bouton, il ne construisait rien. La taille d'un groupe n'était même pas
 * manipulable — donc l'invariance 6 × 24 = 24 × 6 était invisible.
 */

const TARGET = 144;   // 6 classes de 24
const T_GROUPS = 6;
const T_PER = 24;

/* ─── Étape 1 : assembler la structure jusqu'à ce qu'elle tienne ─── */
function AssemblerLab({ onReach, reached }) {
  const [groups, setGroups] = useState(3);
  const [perGroup, setPerGroup] = useState(10);
  // Les rangements différents déjà rencontrés qui donnent 144 : c'est la
  // trace de la surprise, pas un score.
  const [rangements, setRangements] = useState([]);

  const total = groups * perGroup;

  const change = (g, p) => {
    setGroups(g);
    setPerGroup(p);
    const t = g * p;
    if (t === TARGET) {
      setRangements((r) => (r.some(([a]) => a === g) ? r : [...r, [g, p]]));
      onReach?.(g, p);
    }
  };

  const ecart = total - TARGET;

  return (
    <div className="space-y-3">
      <StructureLab
        groups={groups}
        perGroup={perGroup}
        onGroups={(g) => change(g, perGroup)}
        onPerGroup={(p) => change(groups, p)}
        maxGroups={12}
        maxPerGroup={30}
        target={TARGET}
        unit="élève"
        packLabel="classe"
      />

      {/* L'écart est une information, jamais un verdict. */}
      <Feedback tone={total === TARGET ? 'ok' : 'info'}>
        {total === TARGET ? (
          <>
            Ta structure <strong>tient</strong> : {groups} × {perGroup} = <strong className="font-mono">144</strong>.
            {rangements.length >= 2 && (
              <> Et tu l'as déjà obtenue de <strong>{rangements.length} façons différentes</strong> — même surface,
              même quantité, rangement différent.</>
            )}
          </>
        ) : ecart > 0 ? (
          <>Il y a <strong>{ecart} élève{ecart > 1 ? 's' : ''} de trop</strong> : ta jauge a dépassé le
          repère. Reprends une prise — continue à essayer.</>
        ) : (
          <>Il manque <strong>{-ecart} élève{-ecart > 1 ? 's' : ''}</strong> : ta jauge n'a pas encore
          atteint le repère. Continue à essayer.</>
        )}
      </Feedback>

      {rangements.length > 0 && (
        <ul className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1">
          {rangements.map(([g, p]) => (
            <li key={g} className="text-xs font-mono text-slate-600">
              {g} classes × {p} élèves = 144
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Étape 2 : ce que le geste vient d'écrire ────────────────────── */
const OP_Q = {
  q: 'Tu viens d’empiler des paquets identiques jusqu’à remplir la surface. Quelle écriture décrit exactement ce que tu as construit ?',
  options: ['6 × 24', '6 + 24', '24 ÷ 6', '6 − 24'],
  correct: 0,
  explain:
    "Répéter un même paquet, c'est une multiplication : 6 classes de 24, c'est 6 × 24 = 144. Tu ne l'as pas deviné dans l'énoncé — tu l'as construit, et l'écriture ne fait que décrire ta grille.",
  explainWrong:
    "Regarde ta grille : chaque colonne est un paquet complet, et toutes les colonnes sont identiques. Ce n'est ni une réunion de deux quantités différentes, ni un partage.",
};

export default function Module01Mission() {
  const [pred, setPred] = useState(null);
  const [reached, setReached] = useState([]);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  const s1 = reached.length >= 1;

  const onReach = (g, p) =>
    setReached((r) => (r.some(([a]) => a === g) ? r : [...r, [g, p]]));

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Mission : Le problème mystère"
      moduleSubtitle="Avant de chercher une opération, assemble la situation. Elle se montrera toute seule."
      estimatedTime="7 min"
      brief={{
        tag: '📋 Mission 01',
        title: 'Une sortie scolaire se prépare.',
        tone: 'slate',
        body: (
          <>
            <p>
              6 classes participent, chacune avec 24 élèves. Un bus a 50 places.{' '}
              <strong className="text-white">Combien de personnes doivent être transportées ?</strong>
            </p>
            <p className="text-xs">Ne cherche pas d'opération : attrape les bords de la grille et construis la situation.</p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Assemble la situation',
          subtitle: 'Deux bords à glisser : le nombre de classes, la taille d’une classe.',
          done: s1,
          content: (kit) => (
            <div className="space-y-4">
              <PredictionChips
                prompt="y a-t-il UNE seule façon de remplir la surface de 144 élèves ?"
                options={[
                  { id: 'une', label: 'Une seule' },
                  { id: 'plusieurs', label: 'Plusieurs' },
                  { id: 'sais-pas', label: 'Je ne sais pas' },
                ]}
                value={pred}
                onChange={setPred}
                disabled={s1}
              />
              <AssemblerLab
                reached={reached}
                onReach={(g, p) => { onReach(g, p); kit.react?.(true); }}
              />
              {s1 && (
                <Feedback tone="ok">
                  {pred === 'plusieurs'
                    ? 'Ta prédiction tenait : '
                    : pred ? 'Ta prédiction disait autre chose : '
                    : ''}
                  la même quantité se range de plusieurs façons — 6 paquets de 24, 8 de 18, 12 de 12.
                  Ce qui ne change jamais, c'est le nombre d'élèves à transporter.
                </Feedback>
              )}
              {/* La méthode est nommée à l'instant où elle vient d'être
                  employée — la grille est encore à l'écran. */}
              {s1 && (
                <KnowledgeBrick
                  id="construire-avant-calculer"
                  variant="new"
                  lead="Tu n’as cherché aucune opération : tu as posé la situation, et elle s’est montrée toute seule."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Nomme ce que tu as construit',
          done: s2,
          content: (
            <TapQuestion
              prompt={OP_Q.q}
              requires={['construire-avant-calculer']}
              options={OP_Q.options}
              correct={OP_Q.correct}
              cols={2}
              explain={OP_Q.explain}
              explainWrong={OP_Q.explainWrong}
              solved={s2}
              onAnswered={() => setS2(true)}
            />
          ),
        },
        {
          num: 3,
          title: 'Va plus loin que le calcul',
          done: s3,
          content: (
            <div className="space-y-4">
              <NumericQuestion
                prompt="Chaque bus a 50 places. Combien de bus faut-il prévoir pour les 144 personnes ?"
                suffix="bus"
                expected={3}
                requires={['construire-avant-calculer']}
                explain="144 ÷ 50 = 2 reste 44 : deux bus ne suffisent pas (2 × 50 = 100 < 144), il en faut un troisième pour les 44 personnes restantes — même s'il n'est pas rempli."
                explainFor={(n) =>
                  n === 2 || n === 2.88
                    ? "2 bus n'offrent que 2 × 50 = 100 places : c'est insuffisant pour 144 personnes. Il faut un bus de plus."
                    : 'Chaque bus accueille 50 personnes. Compare 144 aux multiples de 50 : 50, 100, 150…'
                }
                solved={s3}
                onAnswered={() => setS3(true)}
              />
              {s3 && (
                <KnowledgeBrick
                  id="interpreter-le-resultat"
                  variant="new"
                  lead="Le calcul disait 2 et il en fallait 3 : c'est la situation qui a tranché."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>La suite.</strong> Tu sais construire une situation. On va voir maintenant
          pourquoi deux histoires très différentes peuvent donner le même calcul.
        </KnowledgeSnapshot>
      }
    />
  );
}
