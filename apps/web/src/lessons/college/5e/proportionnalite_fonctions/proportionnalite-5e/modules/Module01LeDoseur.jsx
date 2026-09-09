import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import DoseurLab, { DoublingReadout } from '../components/DoseurLab';
import { SIROP, PISCINE, BANC } from '../components/situations';
import { fr, eur, doublingRatio, isProportional } from '../components/propUtils';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : le doseur
 * (components/DoseurLab.jsx).
 *
 * Activity               régler une entrée et voir deux situations réagir
 *                        côte à côte, puis les départager en doublant.
 * Mathematical objective deux grandeurs peuvent varier ensemble sans que la
 *                        situation soit proportionnelle ; le test qui tranche
 *                        est le DOUBLEMENT, pas le sens de variation.
 * Student action         glisser le curseur, puis appuyer sur « Doubler ».
 * Controlled variable    l'entrée, et elle seule — les deux règles sont fixes.
 * Mathematical state     un entier n ; toutes les sorties sont calculées par
 *                        `rule.apply(n)`, jamais écrites à la main.
 * Visual consequence     les deux barres se redessinent et les deux nombres
 *                        se réécrivent à l'instant, sans clic de validation.
 * Expected observation   « les deux montent… mais quand je double, une seule
 *                        double ».
 * Misconception targeted « si ça augmente quand j'augmente, c'est
 *                        proportionnel ».
 * Formalization          le mot « proportionnalité » n'arrive qu'à l'étape 3,
 *                        après deux manipulations, porté par une brique. Le
 *                        COEFFICIENT est délibérément laissé au module 2 :
 *                        ici, l'élève découvre seulement qu'il existe un test.
 * Transfer               module 2 : et si on divisait chaque sortie par son
 *                        entrée ?
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur comme une invitation, jamais comme un péage. Le labo reste
 * REJOUABLE après validation — aucun `disabled` lié à `done`.
 */
export default function Module01LeDoseur() {
  // Étape 1 — le sirop seul : établir que « ça monte », et sentir le rythme.
  const [n1, setN1] = useState(4);
  const [vu1, setVu1] = useState(false);
  const [pred1, setPred1] = useState(null);
  const done1 = vu1;

  // Étape 2 — les deux ensemble : la comparaison EST le sujet.
  const [n2, setN2] = useState(4);
  const [double2, setDouble2] = useState(false);
  const done2 = double2;

  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  /** L'étape 1 est atteinte dès que l'élève a bougé le doseur pour de bon. */
  const poser1 = (v, react) => {
    setN1(v);
    if (v !== 4 && !vu1) {
      setVu1(true);
      react?.(true);
    }
  };

  /**
   * L'étape 2 n'est validée que par un VRAI doublement : il faut que l'élève
   * ait atteint une entrée paire depuis sa moitié. On mémorise donc le fait
   * d'avoir doublé, pas la valeur courante — la comparaison reste visible et
   * rejouable ensuite.
   */
  const poser2 = (v, react) => {
    if (v === 2 * n2 && !double2) {
      setDouble2(true);
      react?.(true);
    }
    setN2(v);
  };

  const steps = [
    {
      num: 1,
      title: 'Dose le sirop',
      subtitle: 'Fais varier le nombre de verres, et regarde la quantité de sirop suivre.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <DoseurLab
            rules={[SIROP]}
            n={n1}
            onN={(v) => poser1(v, kit.react)}
            inputLabel="verres"
            min={1}
            max={12}
          />
          {/* §6ter.3 — prédiction SANS verdict : c'est la manipulation qui
              répondra, pas un feedback. Elle n'est jamais un péage. */}
          <PredictionChips
            prompt="pour 8 verres, il faudra…"
            options={[
              { id: 'moins', label: 'moins de 1 L' },
              { id: 'environ', label: 'environ 1,2 L' },
              { id: 'plus', label: 'plus de 3 L' },
            ]}
            value={pred1}
            onChange={setPred1}
          />
          {done1 ? (
            <Feedback tone="ok">
              Le sirop suit les verres : <strong className="font-mono">{n1} verres</strong> →{' '}
              <strong className="font-mono">{fr(SIROP.apply(n1))} L</strong>. Chaque verre ajoute
              toujours la même dose.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Glisse le curseur. Combien de sirop pour 1 verre ? Pour 10 ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux situations, une seule commande',
      subtitle: 'La piscine monte elle aussi. Double l’entrée, et regarde ce que font les deux.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Pour la sortie de fin d’année, on prépare le sirop <em>et</em> on paie la piscine. La
            carte du collège coûte <strong>20 €</strong> une fois pour toutes, puis chaque entrée
            coûte <strong>2 €</strong>.
          </div>
          <DoseurLab
            rules={[SIROP, PISCINE]}
            n={n2}
            onN={(v) => poser2(v, kit.react)}
            inputLabel="verres / entrées"
            min={1}
            max={12}
          />
          {done2 ? (
            <>
              <DoublingReadout rules={[SIROP, PISCINE]} n={Math.max(1, Math.floor(n2 / 2))} />
              <Feedback tone="ok">
                Les deux montent — mais <strong>une seule double</strong>. Le sirop double parce que
                chaque verre apporte la même dose. La piscine ne double pas : la carte, elle, ne se
                paie qu’<em>une seule fois</em>.
              </Feedback>
            </>
          ) : (
            <Feedback tone="info">
              Appuie sur <strong>« Doubler l’entrée »</strong>. Est-ce que les deux nombres doublent
              aussi ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le test qui tranche',
      done: q3,
      content: (
        <div className="space-y-3">
          {/* Le geste vient d'être fait deux fois : le mot peut maintenant le
              nommer (§6 « manipuler puis nommer »). */}
          <KnowledgeBrick
            id="grandeurs-liees"
            variant="new"
            lead={<>Tu viens de le voir : « ça monte quand je monte » ne suffit pas à décider.</>}
          />
          <KnowledgeBrick
            id="proportionnalite"
            variant="new"
            lead={<>La situation qui double quand on double porte un nom.</>}
          />
          <TapQuestion
            prompt={
              <>
                Un plombier facture <strong>40 €</strong> de déplacement, puis{' '}
                <strong>30 €</strong> par heure. Le prix est-il proportionnel à la durée ?
              </>
            }
            options={[
              'Non : 2 h ne coûtent pas le double d’1 h',
              'Oui : plus c’est long, plus c’est cher',
            ]}
            cols={1}
            correct={0}
            requires={['proportionnalite', 'grandeurs-liees']}
            explain="1 h coûte 40 + 30 = 70 €, et 2 h coûtent 40 + 60 = 100 €. Or le double de 70 serait 140. Le déplacement se paie une seule fois : c’est exactement la carte de la piscine."
            explainWrong="« Plus c’est long, plus c’est cher » est vrai — mais c’est justement ce qui ne suffit pas. Le sirop ET la piscine montaient tous les deux ; seul le doublement les a départagés."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Le banc d’essai',
      subtitle: 'Quatre situations de la fête. Laquelle n’est PAS proportionnelle ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans laquelle de ces situations la sortie ne double-t-elle PAS quand l’entrée double ?"
            options={BANC.map((r) => `${r.emoji} ${r.label}`)}
            correct={BANC.findIndex((r) => !isProportional(r) && r.id === 'car')}
            cols={2}
            requires={['proportionnalite']}
            /* Le visuel montre les valeurs CALCULÉES par les règles : ce que
               l'élève lit ici ne peut pas contredire la correction. */
            above={(revealed) =>
              revealed ? (
                <div className="grid sm:grid-cols-2 gap-2">
                  {BANC.map((r) => {
                    const q = doublingRatio(r, 4);
                    const ok = q === 2;
                    return (
                      <div
                        key={r.id}
                        className={`rounded-xl border-2 px-3 py-2 space-y-0.5 ${
                          ok ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-600">
                          <span aria-hidden="true">{r.emoji}</span> {r.label}
                        </div>
                        <div className="font-mono text-sm font-bold tabular-nums text-slate-800">
                          4 → {r.money ? eur(r.apply(4)) : fr(r.apply(4))} &nbsp;·&nbsp; 8 →{' '}
                          {r.money ? eur(r.apply(8)) : fr(r.apply(8))}
                        </div>
                        <div className={`text-xs font-bold ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {q === null ? 'indéfini' : `× ${fr(q)}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null
            }
            explain="Le car est loué pour la journée : 240 € que l’on soit 4 ou 8. La sortie ne bouge pas du tout — elle est donc encore plus loin de doubler. Les croissants, le tissu et le prix par unité, eux, doublent bien."
            explainWrong="Regarde le tableau : pour l’âge, 4 ans de plus donne 16 ans et 8 ans de plus donne 20 ans — ce n’est pas le double non plus. Mais la question demande la situation où la sortie ne bouge même pas : c’est le car."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Attention : l’âge non plus n’est pas proportionnel — <strong>ajouter</strong> n’est
              pas <strong>multiplier</strong>. Deux des quatre situations seulement le sont.
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
      moduleTitle="Le doseur"
      moduleSubtitle="Deux situations qui montent, une seule qui double"
      estimatedTime="12 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Qu’est-ce qui change vraiment ?',
        tone: 'indigo',
        body: (
          <p>
            La fête de fin d’année se prépare : du sirop à doser, une piscine à payer. Les deux
            dépenses <strong>montent</strong> quand le groupe grandit. Pourtant, une seule des deux
            se comporte comme tu l’attends. <strong>Double l’entrée</strong>, et regarde.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
