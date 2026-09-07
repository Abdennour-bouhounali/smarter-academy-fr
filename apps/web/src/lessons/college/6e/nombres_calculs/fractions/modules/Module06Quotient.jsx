import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { Feedback, ValidateButton } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import PartitionShape from '../components/PartitionShape';
import ShareOutLab from '../components/ShareOutLab';

/**
 * Module 6 V2 — reconstruit sur le lesson kit.
 * Étape 1 : manipulation maison (3 pizzas partagées entre 4 personnes) —
 *   n'importe quelle 1 part parmi 4 est valide par pizza, donc déjà
 *   formative par construction (aucune notion de "faux" à corriger) ;
 *   garde son mécanisme bespoke via `content: (kit) => …`, appelle
 *   `kit.react(true)` et `onSolved()` inconditionnellement à la validation.
 * Étape 2 : labo d'abord (MotifLab sur ShareOutLab) — l'élève tire le nombre
 *   de convives et voit toutes les pizzas se recouper ensemble, architecture
 *   reprise de CommonCutLab (3e) ; le QCM de transfert (MOTIF_Q → TapQuestion)
 *   n'apparaît qu'ensuite.
 * Étape 3 : les 2 situations partage/regroupement (SITUATIONS) → une seule
 *   BatchChoiceQuestion à 2 lignes, correction automatique à la 2e réponse.
 * Étape 4 : erreur à corriger (ERREUR) → TapQuestion.
 */

/* ─── Étape 1 : 3 pizzas pour 4 personnes ────────────────────────── */
function PartageQuotient({ solved, onSolved, react }) {
  const [picks, setPicks] = useState([null, null, null]);
  const allPicked = picks.every((p) => p !== null);

  const toggle = (pizzaIdx, cellIdx) => {
    if (solved) return;
    setPicks((prev) => {
      const next = [...prev];
      next[pizzaIdx] = next[pizzaIdx] === cellIdx ? null : cellIdx;
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        3 pizzas identiques sont partagées équitablement entre 4 personnes. Chaque pizza est déjà coupée en 4
        parts. Sur <strong>chacune des 3 pizzas</strong>, tape la part qui te revient.
      </p>

      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((p) => (
          <div key={p} className="space-y-1.5">
            <div className="text-[10px] font-mono text-slate-400 text-center uppercase">Pizza {p + 1}</div>
            <PartitionShape
              shape="circle"
              parts={4}
              cells={picks[p] === null ? [] : [picks[p]]}
              onToggle={(i) => toggle(p, i)}
              tone="rose"
              size="sm"
            />
          </div>
        ))}
      </div>

      <p className="text-center text-sm font-mono text-slate-500">
        {picks.filter((p) => p !== null).length} / 3 parts prises (une par pizza)
      </p>

      {!solved && (
        <div className="text-center">
          <ValidateButton
            onClick={() => {
              if (!allPicked) return;
              react(true);
              onSolved?.();
            }}
            disabled={!allPicked}
            tone="amber"
          >
            Valider ma part
          </ValidateButton>
        </div>
      )}

      {solved && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <Feedback tone="ok">
            Tu as reçu 1 part sur chacune des 3 pizzas : au total,{' '}
            <strong>3 quarts de pizza</strong>, soit <MathText>{'$\\frac{3}{4}$'}</MathText> de pizza.
          </Feedback>
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-center space-y-1">
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
              Partager 3 pizzas entre 4 personnes
            </div>
            <div className="text-3xl font-mono font-extrabold text-amber-300">
              <MathText>{'$3 \\div 4 = \\frac{3}{4}$'}</MathText>
            </div>
            <p className="text-xs text-slate-400 pt-1">
              Une fraction, c'est aussi le résultat d'un partage : le numérateur compte ce qu'on partage, le
              dénominateur compte entre combien de personnes.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ─── Étape 2 : le motif se répète ─────────────────────────────────
   Trois dessins côte à côte MONTRENT le motif ; ils ne le font pas vivre.
   Ici l'élève tire lui-même le nombre de convives et voit toutes les pizzas
   se recouper d'un coup : c'est le nombre du BAS qui commande la découpe, et
   ça se constate au lieu de se lire. Architecture reprise de CommonCutLab
   (3e) — une prise re-découpe plusieurs figures, l'écriture est dérivée —
   sans sa mathématique (aucun dénominateur commun ici). */
function MotifLab({ solved, onSolved, react }) {
  const [pies, setPies] = useState(1);
  const [people, setPeople] = useState(2);
  const [seen, setSeen] = useState([]);

  // Les trois écritures à faire apparaître soi-même. Toutes ont un numérateur
  // et un dénominateur d'entiers positifs simples — rien au-delà de la 6e.
  const CIBLES = [
    { a: 1, b: 3 },
    { a: 2, b: 3 },
    { a: 3, b: 5 },
  ];
  const cur = CIBLES.find((c, i) => !seen.includes(i)) ?? null;
  const matches = cur && pies === cur.a && people === cur.b;
  const allSeen = seen.length === CIBLES.length;

  const validate = () => {
    react(!!matches);
    if (matches) {
      const next = [...seen, CIBLES.indexOf(cur)];
      setSeen(next);
      if (next.length === CIBLES.length) onSolved?.();
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-center">
        {cur ? (
          <div className="text-sm text-slate-700">
            Mets sur la table de quoi obtenir{' '}
            <MathText>{`$\\frac{${cur.a}}{${cur.b}}$`}</MathText> de pizza par personne.
            <span className="block text-xs text-slate-500 mt-1">
              Écriture {seen.length + 1} sur {CIBLES.length}
            </span>
          </div>
        ) : (
          <div className="text-sm text-slate-700">
            Les trois écritures sont sorties du même geste — la table reste à toi.
          </div>
        )}
      </div>

      <ShareOutLab
        pies={pies}
        people={people}
        onPies={setPies}
        onPeople={setPeople}
        minPies={1}
        maxPies={4}
        minPeople={2}
        maxPeople={8}
        caption="Tire la piste des personnes : toutes les pizzas se recoupent en même temps. Tire celle des pizzas : la découpe, elle, ne change pas."
      />

      {cur && (
        <div className="text-center">
          <ValidateButton onClick={validate} tone="amber">
            C'est ma table
          </ValidateButton>
        </div>
      )}

      {seen.length > 0 && !allSeen && (
        <Feedback tone="ok">
          Trouvé. Remarque qui a fait quoi : le nombre de <strong>personnes</strong> a coupé les
          pizzas, le nombre de <strong>pizzas</strong> a dit combien de parts tu emportes.
        </Feedback>
      )}

      {allSeen && (
        <Feedback tone="ok">
          Dans les trois cas, tu as écrit <em>pizzas sur personnes</em> : le nombre qui découpe va
          en bas, celui qui compte ce qu'on partage va en haut. Partager 3 pizzas entre 5
          personnes, c'est <MathText>{'$3 \\div 5 = \\frac{3}{5}$'}</MathText> — et le partage
          lui-même a produit la fraction.
        </Feedback>
      )}

      {solved && !allSeen && (
        <Feedback tone="info">
          Tu avais déjà trouvé les trois écritures : la table reste manipulable pour en essayer
          d'autres.
        </Feedback>
      )}
    </div>
  );
}

const MOTIF_Q = {
  q: 'En suivant le même principe, que vaut 2 ÷ 3 ?',
  options: ['2/3', '3/2', '1/3', '5'],
  correct: 0,
  explain: 'Partager 2 objets identiques entre 3 personnes : chacune reçoit 2/3. Donc 2 ÷ 3 = 2/3.',
};

const renderFractionOption = (o) => {
  if (!o.includes('/')) return o;
  const [n, d] = o.split('/');
  return <MathText>{`$\\frac{${n}}{${d}}$`}</MathText>;
};

/* ─── Étape 3 : partage ou regroupement ? ────────────────────────── */
const SITUATIONS = [
  {
    id: 'partage',
    text: '12 crayons partagés équitablement entre 3 élèves : combien chacun reçoit-il ?',
    options: ['Partage (on distribue équitablement)', 'Regroupement (on compte des paquets)'],
    correct: 0,
    explain: "On distribue 12 crayons ENTRE 3 personnes : chacune reçoit 4 crayons. C'est un partage.",
  },
  {
    id: 'regroupement',
    text: '12 crayons rangés par paquets de 3 : combien de paquets peut-on former ?',
    options: ['Partage (on distribue équitablement)', 'Regroupement (on compte des paquets)'],
    correct: 1,
    explain: "On ne distribue à personne : on compte combien de paquets de 3 tiennent dans 12. C'est un regroupement (12 ÷ 3 = 4 paquets).",
  },
];

const SITUATION_OPTION_LABELS = ['Partage', 'Regroupement'];

/* ─── Étape 4 : erreur à corriger ─────────────────────────────────── */
const ERREUR = {
  claim: '« 3/4 veut dire que je divise 3 objets en 4 groupes. »',
  options: [
    "C'est correct : diviser en groupes et partager, c'est pareil.",
    "C'est inexact : 3/4 vient du partage de 3 TOUT ENTIERS (3 pizzas) entre 4 personnes — on ne divise pas « 3 objets », on partage une quantité de 3 unités.",
  ],
  correct: 1,
  explain:
    "La nuance compte : on ne coupe pas « le nombre 3 » en 4 morceaux. On partage 3 unités identiques (3 pizzas entières) entre 4 personnes, et chaque personne reçoit 3/4 d'une pizza. Le résultat du partage EST la fraction — ce n'est pas un regroupement de 3 objets.",
};

export default function Module06Quotient() {
  const [s1, setS1] = useState(false);
  const [motifDone, setMotifDone] = useState(false);
  const [s2, setS2] = useState(false);
  const [s3, setS3] = useState(false);
  const [s4, setS4] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(6)}
      moduleNumber={6}
      moduleTitle="Fraction et quotient"
      moduleSubtitle="3 pizzas, 4 personnes : pourquoi le partage lui-même produit une fraction."
      estimatedTime="10 min"
      brief={{
        tag: '🍕 Partage',
        title: 'Une fraction peut être le RÉSULTAT d\'un partage.',
        body: (
          <>
            <Users className="w-5 h-5 text-amber-300 inline mr-1" aria-hidden="true" />
            <p className="inline">
              Tu connais déjà la division. Tu vas découvrir que, quand le partage ne tombe pas juste, son résultat
              est justement... une fraction.
            </p>
          </>
        ),
      }}
      steps={[
        {
          num: 1,
          title: '3 pizzas pour 4 personnes',
          done: s1,
          content: (kit) => (
            <div className="space-y-5">
              <PartageQuotient solved={s1} onSolved={() => setS1(true)} react={kit.react} />
              {/* Le partage vient d'être effectué part par part : c'est
                  l'instant où « 3 ÷ 4 » et « 3/4 » deviennent le même objet. */}
              {s1 && (
                <KnowledgeBrick
                  id="fraction-quotient"
                  variant="new"
                  lead="Tu viens de distribuer 3 pizzas à 4 convives — et chacun est reparti avec la même fraction."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Le même motif se répète',
          done: s2,
          content: (kit) => (
            <div className="space-y-4">
              {/* Le labo d'abord : le motif se CONSTATE en tirant les pistes,
                  et la question de transfert ne vient qu'après (§6bis). */}
              <MotifLab
                solved={motifDone}
                react={kit.react}
                onSolved={() => setMotifDone(true)}
              />

              {motifDone && (
                <TapQuestion
                  prompt={MOTIF_Q.q}
                  options={MOTIF_Q.options}
                  correct={MOTIF_Q.correct}
                  cols={4}
                  renderOption={renderFractionOption}
                  explain={MOTIF_Q.explain}
                  requires={['fraction-quotient']}
                  solved={s2}
                  onAnswered={() => setS2(true)}
                />
              )}
            </div>
          ),
        },
        {
          num: 3,
          title: 'Partage ou regroupement ?',
          done: s3,
          content: (
            <BatchChoiceQuestion
              intro={
                <p className="text-sm text-slate-600">
                  Le signe ÷ cache deux situations différentes. Identifie laquelle est en jeu ici.
                </p>
              }
              rows={SITUATIONS.map((s) => ({
                id: s.id,
                label: <span className="text-sm font-semibold text-slate-700">{s.text}</span>,
                options: SITUATION_OPTION_LABELS,
                correct: s.correct,
                correction: s.explain,
              }))}
              feedback={() => (
                <Feedback tone="info">
                  Une fraction apparaît quand un <strong>partage</strong> ne tombe pas juste : 12 crayons entre 3
                  élèves donne 4 (entier), mais 3 pizzas entre 4 personnes donne 3/4 (fraction). Le regroupement,
                  lui, ne produit jamais de fraction : on compte des paquets entiers.
                </Feedback>
              )}
              requires={['fraction-quotient', 'part-egale']}
              solved={s3}
              onAnswered={() => setS3(true)}
            />
          ),
        },
        {
          num: 4,
          title: 'Corrige le raisonnement',
          done: s4,
          content: (
            <div className="space-y-4 border-2 border-amber-200 bg-amber-50/50 rounded-2xl p-4">
              <div className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider">
                Raisonnement d'élève à examiner
              </div>
              <p className="text-base font-semibold text-slate-800 italic">{ERREUR.claim}</p>
              <TapQuestion
                options={ERREUR.options}
                correct={ERREUR.correct}
                cols={1}
                explain={ERREUR.explain}
                requires={['fraction-quotient', 'numerateur', 'denominateur']}
                solved={s4}
                onAnswered={() => setS4(true)}
              />
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={6}>
          <strong>La suite.</strong> Tu connais les deux sens d’une fraction. On va maintenant
          reconnaître celles qu’on croise tous les jours.
        </KnowledgeSnapshot>
      }
    />
  );
}
