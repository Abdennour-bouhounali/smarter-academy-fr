import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ContentModule, NumericQuestion, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import CalcChain from '../../../../../common/components/CalcChain';
import { DragTray } from '../../../../../common/manip6e';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';

/**
 * Module 7 — practice lab, reconstruit sur le lesson kit.
 *
 * Construire une chaîne de calcul : chaque résultat intermédiaire doit être
 * NOMMÉ, pas seulement trouvé. Corrige un bug de la version précédente : une
 * réponse fausse aux étapes intermédiaires n'affichait aucun retour — ici,
 * NumericQuestion explique systématiquement.
 */

/* ─── Étape 1 : construire la chaîne, guidé ──────────────────────── */
function ChaineGuidee({ solved, onSolved }) {
  const [step1Ok, setStep1Ok] = useState(false);
  const [nameOk, setNameOk] = useState(false);
  const [step2Ok, setStep2Ok] = useState(false);

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Une école achète 8 boîtes de crayons. Chaque boîte contient 24 crayons. L'école distribue ensuite 35
        crayons. Combien de crayons reste-t-il ?
      </p>

      <NumericQuestion
        prompt="Première chose à trouver : combien de crayons ont été achetés en tout ?"
        requires={['structures-de-problemes']}
        expected={192}
        explain="8 × 24 = 192 crayons achetés."
        explainFor={() => 'Multiplie le nombre de boîtes par le nombre de crayons par boîte.'}
        solved={step1Ok || solved}
        onAnswered={() => setStep1Ok(true)}
      />

      {(step1Ok || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <TapQuestion
            prompt="Que représente ce nombre, 192 ?"
            requires={['structures-de-problemes']}
            options={['Le nombre total de crayons achetés', 'Le nombre de crayons distribués', 'Le nombre de boîtes']}
            correct={0}
            cols={1}
            explain="192 est un résultat INTERMÉDIAIRE : le nombre total de crayons achetés — pas encore la réponse finale."
            solved={nameOk || solved}
            onAnswered={() => setNameOk(true)}
          />
        </div>
      )}

      {(nameOk || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            prompt="Maintenant, utilise ce résultat : combien de crayons reste-t-il après la distribution ?"
            requires={['structures-de-problemes']}
            expected={157}
            explain="192 − 35 = 157 crayons restants."
            explainFor={() => 'Retire les 35 crayons distribués du total acheté (192).'}
            solved={step2Ok || solved}
            onAnswered={() => {
              setStep2Ok(true);
              onSolved?.();
            }}
          />
        </div>
      )}

      {(step2Ok || solved) && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
          <CalcChain
            steps={[
              { label: 'Crayons achetés', expr: '8 boîtes × 24 crayons', value: '192 crayons' },
              { label: 'Crayons restants', expr: '192 − 35 distribués', value: '157 crayons' },
            ]}
          />
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : deuxième problème, plus autonome ─────────────────── */
function ChaineAutonome({ solved, onSolved }) {
  const [step1Ok, setStep1Ok] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-700 bg-white border-2 border-slate-200 rounded-xl p-3">
        Une salle de cinéma a 12 rangées de 15 sièges. Lors d'une séance, 138 sièges sont occupés. Combien de
        sièges restent libres ?
      </p>
      <p className="text-xs text-slate-500">Trouve d'abord un résultat intermédiaire, puis la réponse finale — sans aide cette fois.</p>

      <NumericQuestion
        requires={['resultat-intermediaire']}
        expected={180}
        explain="12 × 15 = 180 sièges au total."
        explainFor={() => 'Multiplie le nombre de rangées par le nombre de sièges par rangée.'}
        solved={step1Ok || solved}
        onAnswered={() => setStep1Ok(true)}
      />

      {(step1Ok || solved) && (
        <div className="border-t border-slate-100 pt-4">
          <NumericQuestion
            requires={['resultat-intermediaire']}
            expected={42}
            explain="180 − 138 = 42 sièges libres."
            explainFor={() => 'Retire les 138 sièges occupés du total (180).'}
            solved={solved}
            onAnswered={() => onSolved?.()}
          />
        </div>
      )}

      {solved && (
        <CalcChain steps={[
          { label: 'Sièges au total', expr: '12 rangées × 15 sièges', value: '180 sièges' },
          { label: 'Sièges libres', expr: '180 − 138 occupés', value: '42 sièges' },
        ]} />
      )}
    </div>
  );
}

/* ─── Étape 3 : remettre les étapes dans l'ordre ─────────────────── */
const ORDER_STEPS = [
  { id: 'a', text: 'Comprendre : on cherche combien de billets restent à vendre.' },
  { id: 'b', text: 'Calculer le nombre total de places : 15 rangées × 20 places = 300.' },
  { id: 'c', text: 'Calculer les places restantes : 300 − 214 vendues = 86.' },
  { id: 'd', text: 'Répondre : il reste 86 billets à vendre.' },
];
const CORRECT_ORDER = ['a', 'b', 'c', 'd'];

/**
 * La chaîne se CONSTRUIT en déposant chaque maillon à sa place.
 *
 * Activity: prendre une étape de raisonnement et la POSER dans le maillon 1, 2,
 *   3 ou 4 de la chaîne.
 * Mathematical objective: un problème à plusieurs étapes est un enchaînement
 *   ORDONNÉ — chaque maillon consomme le résultat du précédent.
 * Student action: glisser une étiquette de la réserve vers un maillon (au doigt,
 *   à la souris) ou, au clavier, l'activer puis activer le maillon voulu.
 * Mathematical state: `slots`, un tableau de 4 cases. L'ordre affiché, le
 *   verdict et le diagnostic en dérivent.
 * Expected observation: on ne peut pas calculer le total des places après avoir
 *   soustrait les places vendues — le maillon suivant n'aurait rien à consommer.
 * Misconception targeted: « l'ordre des calculs est arbitraire ».
 *
 * Le geste précédent (taper une étiquette pour l'empiler) plaçait les étapes
 * dans l'ordre où on les touchait : impossible de corriger le maillon 2 sans
 * défaire les suivants, et surtout ce n'était pas le geste de la chose — on
 * RANGE des étapes dans des cases, on ne les empile pas. DragTray fournit le
 * glisser-déposer complet, avec le chemin clavier et le clic de secours.
 */
function RemettreOrdre({ react, solved, onSolved }) {
  // Une case par maillon ; null = maillon vide.
  const [slots, setSlots] = useState([null, null, null, null]);
  const [checked, setChecked] = useState(false);

  const placed = slots.filter(Boolean);
  const full = placed.length === ORDER_STEPS.length;
  const isRight = full && CORRECT_ORDER.every((id, i) => slots[i] === id);

  /* RÈGLE PROJET (2026-09-06) : la construction ne se fige jamais après la
     validation — l'élève doit pouvoir sortir un maillon et le replacer. */
  const drop = (stepId, zoneId) => {
    const idx = Number(zoneId);
    setChecked(false);
    setSlots((prev) => {
      const next = [...prev];
      // Une étape déjà posée ailleurs quitte son ancienne case : on ne peut pas
      // avoir deux fois le même maillon dans la chaîne.
      const from = next.indexOf(stepId);
      if (from >= 0) next[from] = null;
      next[idx] = stepId;
      return next;
    });
  };

  const removeAt = (zoneId) => {
    const idx = Number(zoneId);
    setChecked(false);
    setSlots((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  const verify = () => {
    setChecked(true);
    react(isRight);
    onSolved?.();
  };

  const sources = ORDER_STEPS.filter((st) => !slots.includes(st.id)).map((st) => ({
    id: st.id,
    label: st.text,
    node: <span className="block max-w-[15rem] text-left text-sm text-slate-700">{st.text}</span>,
  }));

  const zones = slots.map((id, i) => {
    const st = id ? ORDER_STEPS.find((x) => x.id === id) : null;
    const bad = checked && id !== CORRECT_ORDER[i];
    return {
      id: String(i),
      label: `Maillon ${i + 1}`,
      node: st ? (
        <span
          className={`block text-left text-xs leading-snug px-1 ${
            bad ? 'text-rose-700' : checked ? 'text-emerald-800' : 'text-slate-700'
          }`}
        >
          {st.text}
        </span>
      ) : (
        <span className="text-[11px] text-slate-400 italic">à remplir</span>
      ),
    };
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Voici les étapes (mélangées) de la résolution d'un problème sur la vente de billets.{' '}
        <strong>Fais glisser</strong> chaque étape dans le maillon qui lui revient — ou, au clavier, active
        l'étape puis le maillon.
      </p>

      <DragTray
        sources={sources}
        zones={zones}
        onDrop={drop}
        onRemove={removeAt}
        sourcesLabel="Étapes à ranger"
        zonesLabel="Ta chaîne de calcul"
      />

      {checked && !isRight && (
        <Feedback tone="ko">
          Cet ordre n'est pas encore le bon. Repère les maillons en rouge : l'enchaînement va toujours de
          Comprendre → Calculer l'intermédiaire → Calculer le final → Répondre. Sors un maillon et repose-le.
        </Feedback>
      )}

      <div className="text-center">
        <ValidateButton onClick={verify} disabled={!full}>
          {solved ? 'Revérifier ma chaîne' : 'Vérifier ma chaîne'}
        </ValidateButton>
      </div>

      {solved && (!checked || isRight) && (
        <Feedback tone="ok">
          Comprendre → Calculer l'intermédiaire → Calculer le final → Répondre : c'est toujours cet
          enchaînement. Tu peux sortir un maillon et le reposer autant de fois que tu veux.
        </Feedback>
      )}
    </div>
  );
}

export default function Module07PlusieursEtapes() {
  const [s1, setS1] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(7)}
      moduleNumber={7}
      moduleTitle="Problèmes à plusieurs étapes"
      moduleSubtitle="Construire une chaîne de calcul, étape par étape — chaque résultat intermédiaire doit être nommé."
      estimatedTime="9 min"
      brief={{
        tag: '🔗 Chaîne',
        title: 'Une situation qui évolue en plusieurs temps.',
        body: (
          <p>
            Un résultat intermédiaire n'est pas la réponse finale — mais sans lui, impossible d'avancer. Chaque
            étape doit être comprise, pas seulement calculée.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Construis la chaîne, étape par étape',
          done: s1,
          content: (
            <div className="space-y-5">
              <ChaineGuidee solved={s1} onSolved={() => setS1(true)} />
              {/* Le 192 vient d'être trouvé, nommé, puis utilisé : c'est
                  exactement l'instant où le mot prend son sens. */}
              {s1 && (
                <KnowledgeBrick
                  id="resultat-intermediaire"
                  variant="new"
                  lead="Le 192 que tu as dû trouver — et qui n'était pas la réponse."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'À toi, plus autonome',
          done: s2,
          content: <ChaineAutonome solved={s2} onSolved={() => setS2(true)} />,
        },
        {
          num: 3,
          title: 'Remets les étapes dans l\'ordre',
          done: s3,
          content: (kit) => (
            <div className="space-y-5">
              <RemettreOrdre react={kit.react} solved={s3} onSolved={() => setS3(true)} />
              {s3 && (
                <KnowledgeBrick
                  id="chaine-de-calcul"
                  variant="new"
                  lead="L'ordre que tu viens de reconstituer, maillon par maillon."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={7}>
          <strong>La suite.</strong> Une chaîne de calcul peut dérailler sans qu'on s'en aperçoive.
          On va apprendre à s'en rendre compte tout seul.
        </KnowledgeSnapshot>
      }
    />
  );
}
