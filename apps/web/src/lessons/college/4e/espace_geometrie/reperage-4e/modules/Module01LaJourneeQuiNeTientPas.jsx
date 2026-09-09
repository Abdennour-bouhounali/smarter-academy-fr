import React, { useState } from 'react';
import { Thermometer, Ruler } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import GraduationLab from '../components/GraduationLab';
import {
  TEMPERATURES, TEMPERATURES_VALEURS, nuageTemperatures, graduationPour, fr,
} from '../components/reperage4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              choisir la graduation de l'axe vertical pour douze
 *                       relevés de température réels.
 * Mathematical objective un repère n'est pas donné : il se CHOISIT, et le
 *                       choix se juge sur les données.
 * Student action        appuyer sur un pas ; le repère se redessine aussitôt.
 * Controlled variable   le pas de l'axe vertical, et lui seul. Les données ne
 *                       bougent jamais — c'est le regard qu'on change.
 * Mathematical state    les douze valeurs. Graduations, points confondus et
 *                       verdict sont TOUS calculés par `graduationPour`.
 * Visual consequence    les relevés s'empilent, ou l'axe se couvre de traits,
 *                       ou les points quittent les nœuds.
 * Expected observation  « ce n'est pas le repère qui est donné, c'est moi qui
 *                       le choisis — et un mauvais choix rend les données
 *                       illisibles ».
 * Misconception targeted croire qu'une graduation de 1 en 1 convient toujours.
 * Formalization         les trois DÉFAUTS sont nommés ici, parce que l'élève
 *                       vient de les faire arriver. La MÉTHODE de choix, elle,
 *                       attend le module 3.
 *
 * POURQUOI CE JEU DE DONNÉES. Sur ces douze relevés, les quatre verdicts sont
 * atteignables — et un seul pas convient (0,5). Le pas de 1, celui que l'élève
 * croit naturel, échoue : sept relevés au demi-degré ne tombent sur aucune
 * graduation. C'est vérifié par le test de parcours, pas espéré.
 *
 * CONTINUITÉ : le pas choisi est mémorisé et le module 2 lit DANS CE REPÈRE.
 * Déclaré dans `lesson.config.js`.
 */
const PAS_PROPOSES = [0.25, 0.5, 1, 2];
const PAS_DEPART = 2;

export default function Module01LaJourneeQuiNeTientPas() {
  const memo = useLabState(LESSON_CONFIG.id, 'temperatures', { pasY: PAS_DEPART });
  const [pasY, setPasY] = useState(memo.value.pasY ?? PAS_DEPART);
  const [essayes, setEssayes] = useState([PAS_DEPART]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const etude = graduationPour(TEMPERATURES_VALEURS, { budget: 26, pas: PAS_PROPOSES });

  const choisir = (p) => {
    setPasY(p);
    memo.save({ pasY: p });
    setEssayes((e) => (e.includes(p) ? e : [...e, p]));
  };

  // L'étape est franchie quand l'élève a VÉCU les trois défauts et trouvé la
  // réponse — pas quand il a cliqué au hasard sur le bon.
  const done1 = essayes.length >= 3 && essayes.includes(0.5);

  const lab = (
    <GraduationLab
      donnees={nuageTemperatures()}
      pasX={2}
      pasProposes={PAS_PROPOSES}
      pasY={pasY}
      onPasY={choisir}
      budget={26}
      labelX="heure"
      labelY="°C"
      uniteY="°C"
      ariaLabel="Choisir la graduation de l’axe des températures"
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Règle l’axe des températures',
      subtitle: 'Douze relevés d’une journée de mars. Essaie les quatre graduations : une seule convient.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avec une graduation de 2 °C, les douze relevés vont-ils tous apparaître ?"
            options={[
              { id: 'tous', label: 'Oui, les douze' },
              { id: 'moins', label: 'Non, il y en aura moins' },
              { id: 'sais-pas', label: 'Impossible à dire' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              {essayes.length} graduation{essayes.length > 1 ? 's' : ''} essayée
              {essayes.length > 1 ? 's' : ''}. Essaie-les toutes : chacune échoue d’une façon
              différente, sauf une.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Une seule graduation garde les douze relevés distincts sans rendre l’axe
              incomptable : {fr(0.5, 1)} °C. Les données n’ont pas changé — c’est le repère qui a
              changé.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce qu’un mauvais pas coûte',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Avec une graduation de 2 °C, l’axe ne portait que{' '}
            {etude.candidats.find((c) => c.pas === 2).graduations} traits — c’était très lisible.
            Et pourtant ce choix est mauvais.
          </p>
          {lab}
          <TapQuestion
            prompt="Pourquoi une graduation de 2 °C ne convient-elle pas, alors que l’axe est court et clair ?"
            options={[
              'Des relevés différents tombent sur le même point : on en perd',
              'L’axe a trop de graduations pour être lu',
              'Les températures négatives ne peuvent pas être représentées',
              'Il faudrait un axe horizontal plus long',
            ]}
            correct={0}
            cols={1}
            requires={['echelle-graduation', 'coordonnees']}
            explain="Un axe lisible ne suffit pas : encore faut-il qu’il soit FIDÈLE. À 2 °C, plusieurs paires de relevés se confondent, et la donnée est perdue — pas seulement mal affichée."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="repere-choisi"
              variant="new"
              lead="Ce que tu viens de faire n’était pas une lecture : c’était un choix."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Trois façons de se tromper',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Chacune des trois graduations refusées l’a été pour une raison différente. C’est
            important : les remèdes sont opposés.
          </p>
          <div className="overflow-x-auto rounded-xl border-2 border-slate-200 bg-white p-3">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-1 text-left">pas</th>
                  <th className="pb-1 text-right">graduations</th>
                  <th className="pb-1 text-left ps-3">verdict</th>
                </tr>
              </thead>
              <tbody>
                {etude.candidats.map((c) => (
                  <tr key={c.pas} className="border-t border-slate-100">
                    <td className="py-1 font-mono font-bold text-slate-700">{fr(c.pas, 2)} °C</td>
                    <td className="py-1 text-right font-mono text-slate-600">{c.graduations}</td>
                    <td className={`py-1 ps-3 text-sm font-semibold ${
                      c.ok ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {c.ok ? 'adaptée' : c.raison}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TapQuestion
            prompt="Avec une graduation de 1 °C, aucun relevé n’était confondu et l’axe était court. Quel était alors le problème ?"
            options={[
              'Les relevés au demi-degré ne tombaient sur aucune graduation',
              'Il y avait trop de graduations',
              'Deux relevés se confondaient',
              'Il n’y avait aucun problème',
            ]}
            correct={0}
            cols={1}
            requires={['repere-choisi']}
            explain="Un thermomètre donne des demi-degrés. Avec un pas de 1, sept relevés tombent entre deux traits : on ne peut ni les poser ni les lire exactement. C’est un troisième défaut, distinct des deux autres."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="trois-defauts"
              variant="new"
              lead="Trois défauts, trois remèdes — et deux d’entre eux vont dans des sens opposés."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Une question reste ouverte : dans le repère que tu viens de régler, un point posé
              entre deux traits, ça se lit comment ? C’est le module suivant.
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
      moduleTitle="La journée qui ne tient pas"
      moduleSubtitle="Ce n’est pas le repère qui est donné, c’est toi qui le choisis"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Douze relevés, un repère qui ne va pas',
        tone: 'indigo',
        body: (
          <>
            Une station météo a relevé la température toutes les deux heures, de −3 à 7,5 °C.
            Le repère proposé écrase la moitié des mesures.{' '}
            <strong>Quelle graduation choisir ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Thermometer className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            <Ruler className="inline h-4 w-4" aria-hidden="true" /> Les {TEMPERATURES.length} relevés
            ne changent jamais. Le seul réglage est ce que vaut UNE graduation verticale — et il
            change tout.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
