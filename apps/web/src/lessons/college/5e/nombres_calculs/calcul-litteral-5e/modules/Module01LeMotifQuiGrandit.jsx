import React, { useState } from 'react';
import { LayoutGrid, MoveRight } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PatternLab from '../components/PatternLab';
import {
  MOTIF_SIGNATURE, ETAPE_HORS_DESSIN, ETAPE_TRES_LOIN,
  valeur, ecartConstant, parseEntier,
} from '../components/litteral';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le motif qui grandit
 * (components/PatternLab.jsx).
 *
 * Activity              construire un escalier de carreaux étape par étape.
 * Mathematical objective quand une régularité se répète, compter chaque cas
 *                       devient impossible — il faut une RECETTE qui réponde
 *                       pour tous les cas à la fois.
 * Student action        toucher « étape suivante » (et « précédente » : on peut
 *                       toujours revenir).
 * Controlled variable   le numéro de l'étape, et lui seul.
 * Visual consequence    la figure grandit, le compte se réécrit, et le tableau
 *                       étape → nombre se remplit tout seul.
 * Expected observation  « d'une étape à l'autre, j'ajoute toujours 2 » — puis
 *                       « donc je peux prévoir l'étape 20 sans la dessiner ».
 * Misconception targeted croire qu'une lettre est une étiquette arbitraire.
 *                       Ici la lettre n'apparaît même pas : le module va
 *                       jusqu'à la FORMULE en toutes lettres (« 2 × numéro de
 *                       l'étape + 1 »), et laisse au module 2 le soin de la
 *                       remplacer par une lettre — à la seule place où elle a
 *                       un sens.
 * Formalization         « régularité » et « formule » n'arrivent qu'à l'étape 4,
 *                       après trois manipulations, portées par des
 *                       KnowledgeBricks.
 * Transfer              module 2 : comment écrire cette recette plus court ?
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage. La
 * manipulation reste REJOUABLE après validation — aucun `disabled` lié à `done`.
 */
const MAX_LAB = 6;
const ECART = ecartConstant(MOTIF_SIGNATURE);

export default function Module01LeMotifQuiGrandit() {
  // Étape 1 — construire les premières étapes.
  const [etape1, setEtape1] = useState(1);
  const [maxVu, setMaxVu] = useState(1);
  const [pred1, setPred1] = useState(null);
  const done1 = maxVu >= 4;

  // Étape 2 — repérer l'ajout constant.
  const [etape2, setEtape2] = useState(1);
  const [vues2, setVues2] = useState(() => new Set([1]));
  const done2 = vues2.size >= 3;

  // Étape 3 — l'étape qu'on ne peut pas dessiner.
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const avancer1 = (k, react) => {
    setEtape1(k);
    if (k > maxVu) {
      setMaxVu(k);
      if (k >= 4 && maxVu < 4) react?.(true);
    }
  };

  const avancer2 = (k, react) => {
    setEtape2(k);
    const next = new Set(vues2);
    next.add(k);
    setVues2(next);
    if (next.size >= 3 && vues2.size < 3) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Construis les premières étapes',
      subtitle: 'Avance d’étape en étape et regarde le tableau se remplir tout seul.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PatternLab
            motif={MOTIF_SIGNATURE}
            etape={etape1}
            onEtape={(k) => avancer1(k, kit.react)}
            maxEtape={MAX_LAB}
            ariaLabel="Motif de carreaux — avance d’étape en étape"
          />
          <PredictionChips
            prompt="avant d’avancer : penses-tu que le nombre de carreaux augmente toujours de la même façon ?"
            options={[
              { id: 'meme', label: 'Oui, toujours pareil' },
              { id: 'variable', label: 'Non, l’ajout change à chaque fois' },
              { id: 'sais-pas', label: 'Je ne sais pas' },
            ]}
            value={pred1}
            onChange={setPred1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'meme' ? 'Ta prédiction était la bonne' : 'Regarde le tableau'} : 3, puis
              5, puis 7, puis 9. Le nombre de carreaux ne saute pas au hasard —{' '}
              <strong>il augmente toujours de la même quantité</strong>. C’est ce qui va rendre la
              suite prévisible.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tu es à l’étape {etape1}. Continue jusqu’à l’étape 4, et surveille la colonne des
              carreaux.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'De combien augmente-t-il, exactement ?',
      subtitle: 'Une colonne s’est ajoutée au tableau. Visite au moins trois étapes et lis-la.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <PatternLab
            motif={MOTIF_SIGNATURE}
            etape={etape2}
            onEtape={(k) => avancer2(k, kit.react)}
            maxEtape={MAX_LAB}
            montrerEcart
            ariaLabel="Motif de carreaux — repère l’ajout constant"
          />
          {done2 ? (
            <Feedback tone="ok">
              <strong>+ {ECART} à chaque étape</strong>, sans exception. Et à l’étape 1, il y avait
              déjà <strong>{MOTIF_SIGNATURE.compte(1)} carreaux</strong>. Ces deux nombres — ce
              qu’on ajoute, et ce qui était là au départ — suffisent à décrire tout le motif.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {vues2.size} étape{vues2.size > 1 ? 's' : ''} visitée{vues2.size > 1 ? 's' : ''} sur 3.
              La colonne « On ajoute » donne-t-elle toujours le même nombre ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: `Combien de carreaux à l’étape ${ETAPE_HORS_DESSIN} ?`,
      subtitle: 'Le laboratoire s’arrête à l’étape 6. Il va falloir trouver autrement.',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-3.5 text-sm text-slate-700">
            Tu ne peux plus dessiner : l’étape {ETAPE_HORS_DESSIN} compterait des dizaines de
            carreaux, et personne ne va les compter un par un. Mais tu sais deux choses : on part
            de <strong>{MOTIF_SIGNATURE.compte(1)}</strong> à l’étape 1, et on ajoute{' '}
            <strong>{ECART}</strong> à chaque étape suivante.
          </div>
          <NumericQuestion
            prompt={<>Combien de carreaux compte l’étape <strong>{ETAPE_HORS_DESSIN}</strong> ?</>}
            expected={valeur(MOTIF_SIGNATURE.regle, ETAPE_HORS_DESSIN)}
            parse={parseEntier}
            display={String(valeur(MOTIF_SIGNATURE.regle, ETAPE_HORS_DESSIN))}
            requires={['calcul-numerique']}
            explain={`De l’étape 1 à l’étape ${ETAPE_HORS_DESSIN}, il y a ${ETAPE_HORS_DESSIN - 1} ajouts de ${ECART}, soit ${(ETAPE_HORS_DESSIN - 1) * ECART}. En partant de ${MOTIF_SIGNATURE.compte(1)} : ${MOTIF_SIGNATURE.compte(1)} + ${(ETAPE_HORS_DESSIN - 1) * ECART} = ${valeur(MOTIF_SIGNATURE.regle, ETAPE_HORS_DESSIN)}. Autre chemin, plus court : ${ECART} × ${ETAPE_HORS_DESSIN} + 1.`}
            explainFor={(rep) => {
              if (rep === ECART * ETAPE_HORS_DESSIN) return `Tu as calculé ${ECART} × ${ETAPE_HORS_DESSIN} = ${ECART * ETAPE_HORS_DESSIN}, mais tu as oublié le carreau qui était déjà là au départ. Il faut ajouter 1 : ${valeur(MOTIF_SIGNATURE.regle, ETAPE_HORS_DESSIN)}.`;
              if (rep === ETAPE_HORS_DESSIN + 2) return `Tu as ajouté ${ECART} une seule fois. Or on ajoute ${ECART} à CHAQUE étape, et il y a ${ETAPE_HORS_DESSIN - 1} passages d’une étape à la suivante.`;
              return `Deux façons : partir de ${MOTIF_SIGNATURE.compte(1)} et ajouter ${ECART} un total de ${ETAPE_HORS_DESSIN - 1} fois, ou plus court : ${ECART} × ${ETAPE_HORS_DESSIN} + 1 = ${valeur(MOTIF_SIGNATURE.regle, ETAPE_HORS_DESSIN)}.`;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Une recette pour toutes les étapes',
      done: q4,
      content: (
        <div className="space-y-3">
          {/* Trois manipulations viennent de montrer que l'ajout est constant,
              qu'un point de départ existe, et que compter jusqu'à l'étape 20
              est absurde. C'est l'instant où le mot « formule » a un sens —
              avant la question qui l'exige. La LETTRE, elle, est laissée au
              module 2 : ici la recette s'écrit encore en toutes lettres. */}
          <KnowledgeBrick
            id="regularite"
            variant="new"
            lead={<>Tu as trouvé l’étape {ETAPE_HORS_DESSIN} sans rien dessiner. Ce qui te l’a permis porte un nom.</>}
          />
          <KnowledgeBrick
            id="formule"
            variant="new"
            lead={<>Et la manière courte d’écrire ce raisonnement, une bonne fois pour toutes, en porte un autre.</>}
          />
          <NumericQuestion
            prompt={<>Applique la recette <span className="font-mono font-bold">2 × (numéro de l’étape) + 1</span> à l’étape <strong>{ETAPE_TRES_LOIN}</strong>.</>}
            expected={valeur(MOTIF_SIGNATURE.regle, ETAPE_TRES_LOIN)}
            parse={parseEntier}
            display={String(valeur(MOTIF_SIGNATURE.regle, ETAPE_TRES_LOIN))}
            requires={['formule', 'regularite']}
            explain={`2 × ${ETAPE_TRES_LOIN} + 1 = ${valeur(MOTIF_SIGNATURE.regle, ETAPE_TRES_LOIN)}. Une seule ligne de calcul remplace ${ETAPE_TRES_LOIN} dessins — c’est exactement ce qu’on demande à une formule.`}
            explainFor={(rep) => {
              if (rep === 2 * ETAPE_TRES_LOIN) return 'Tu as bien fait 2 × 100 = 200, mais il reste le + 1 de la recette. Le résultat est 201.';
              if (rep === 102) return 'Tu as ajouté 2 au lieu de multiplier par 2. La recette dit « 2 × le numéro », donc 2 × 100 = 200, puis + 1.';
              return `2 × ${ETAPE_TRES_LOIN} = ${2 * ETAPE_TRES_LOIN}, puis + 1 : ${valeur(MOTIF_SIGNATURE.regle, ETAPE_TRES_LOIN)}.`;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Cette recette fonctionne pour <strong>n’importe quelle étape</strong>. Écrire
              « numéro de l’étape » à chaque fois est pourtant bien long… Il existe une façon
              beaucoup plus courte de le dire, et c’est tout l’objet du module suivant.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Le motif qui grandit"
      moduleSubtitle="Quand dessiner ne suffit plus"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un escalier de carreaux',
        tone: 'indigo',
        body: (
          <p>
            Voici un motif qui grandit d’étape en étape. Construis-le, regarde-le se remplir — puis
            réponds à une question qui va tout changer :{' '}
            <strong>combien de carreaux à l’étape {ETAPE_HORS_DESSIN} ?</strong>
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: LayoutGrid, t: 'Le motif', d: 'À chaque étape, des carreaux s’ajoutent.', c: 'text-violet-600' },
            { icon: MoveRight, t: 'Ton geste', d: 'Avance — et reviens en arrière autant que tu veux.', c: 'text-slate-700' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
