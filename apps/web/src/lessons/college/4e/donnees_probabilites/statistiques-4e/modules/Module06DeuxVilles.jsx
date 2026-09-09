import React, { useState } from 'react';
import { CloudSun, Wind } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ComparaisonLab, { LIGNES } from '../components/ComparaisonLab';
import {
  VILLE_ABRITEE, VILLE_EXPOSEE, GROUPE_ROUGE, GROUPE_BLEU,
  moyenne, mediane, etendue, extremes, comparer, avecUnite,
} from '../components/stats4e';

/**
 * Module 6 — MANIPULATION : la paire MIROIR, et la conclusion qu'elle seule
 * autorise.
 *
 * Activity              rejouer exactement le geste du module 5 sur une autre
 *                       paire, construite pour donner la réponse INVERSE.
 * Mathematical objective aucun résumé n'est « le bon ». Celui qui sauvait la
 *                       comparaison précédente est ici totalement aveugle, et
 *                       c'est le troisième qui parle. Le choix dépend de la
 *                       QUESTION, jamais de la série.
 * Student action        révéler chaque ligne du tableau.
 * Controlled variable   l'ensemble des lignes dévoilées.
 * Mathematical state    les deux séries ; le verdict vient de `comparer`.
 * Visual consequence    les deux premières lignes affichent « aucun » écart,
 *                       la troisième un écart considérable.
 * Expected observation  « c'est exactement l'inverse de la fois d'avant ».
 * Misconception targeted « la médiane est le meilleur résumé » — la conclusion
 *                       naturelle du module 5, que cette paire démolit.
 * Formalization         la brique `choisir-indicateur` arrive une fois les
 *                       deux paires confrontées ; la carte mémo des trois
 *                       résumés ferme le module.
 *
 * POURQUOI CE MODULE EXISTE. Sans lui, la leçon enseignerait une PRÉFÉRENCE
 * (« prends la médiane ») au lieu d'un CHOIX. C'est le seul module dont la
 * justification est entièrement pédagogique : mathématiquement, il ne fait que
 * refaire le module 5 sur d'autres nombres — et c'est précisément le point.
 */
export default function Module06DeuxVilles() {
  const [devoiles, setDevoiles] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const paireVilles = comparer(VILLE_ABRITEE, VILLE_EXPOSEE);
  const paireGroupes = comparer(GROUPE_ROUGE, GROUPE_BLEU);
  const done1 = devoiles.length === LIGNES.length;

  const basculer = (cle) =>
    setDevoiles((d) => (d.includes(cle) ? d.filter((x) => x !== cle) : [...d, cle]));

  const lab = (
    <ComparaisonLab
      serieA={VILLE_ABRITEE}
      serieB={VILLE_EXPOSEE}
      devoiles={devoiles}
      onDevoiler={basculer}
      couleurs={{ a: 'emerald', b: 'violet' }}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Refais exactement le même geste',
      subtitle: 'Deux villes, neuf jours de relevés à midi. Dévoile les trois lignes.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Deux villes ont relevé leur température de midi pendant neuf jours. Même tableau, même
            geste que la fois précédente.
          </p>
          <PredictionChips
            prompt={`La fois d’avant, la médiane était le seul résumé à séparer les deux séries. Ici, penses-tu qu’elle va encore trancher ?`}
            options={[
              { id: 'oui', label: 'Oui, comme la fois d’avant' },
              { id: 'non', label: 'Non, un autre parlera' },
              { id: 'aucun', label: 'Aucun ne les séparera' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {done1 && (
            <Feedback tone="ok">
              C’est l’inverse exact : cette fois la médiane est <strong>muette</strong> (
              {avecUnite(mediane(VILLE_ABRITEE), VILLE_ABRITEE.unite)} des deux côtés), la moyenne
              aussi, et seule l’étendue parle —{' '}
              {avecUnite(etendue(VILLE_ABRITEE), VILLE_ABRITEE.unite)} contre{' '}
              {avecUnite(etendue(VILLE_EXPOSEE), VILLE_EXPOSEE.unite)}.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Les deux paires, côte à côte',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th scope="col" className="px-3 py-2 text-left">Comparaison</th>
                  <th scope="col" className="px-3 py-2 text-left">Résumés aveugles</th>
                  <th scope="col" className="px-3 py-2 text-left">Résumé qui parle</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Rouge / Bleu (module 5)', paireGroupes],
                  ['Val-Serein / Mont-Venteux', paireVilles],
                ].map(([nom, p]) => (
                  <tr key={nom} className="border-b border-slate-100 last:border-0">
                    <th scope="row" className="px-3 py-2 text-left font-semibold text-slate-600">{nom}</th>
                    <td className="px-3 py-2 text-slate-400">{p.neSeparentPas.join(', ')}</td>
                    <td className="px-3 py-2 font-bold text-rose-700">{p.separent.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TapQuestion
            prompt="Ces deux comparaisons prises ensemble démontrent quoi ?"
            options={[
              'Aucun des trois résumés n’est meilleur que les autres',
              'La médiane est le résumé le plus fiable',
              'L’étendue est le résumé le plus fiable',
              'Il faut toujours calculer les trois avant de conclure quoi que ce soit',
            ]}
            correct={0}
            cols={1}
            requires={['comparer-series', 'mediane-stat', 'etendue']}
            explain="Chaque résumé est aveugle là où un autre voit. La médiane sauvait la première comparaison et ne voit rien de la seconde ; l’étendue fait exactement l’inverse. Il n’y a donc pas de « meilleur » : il y a une question posée, et un résumé qui y répond."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="choisir-indicateur"
              variant="new"
              lead="Voilà ce que les deux paires, prises ensemble, permettent enfin de dire."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'À toi de choisir',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt={`Tu dois choisir une des deux villes pour organiser une sortie en plein air, et tu veux éviter les mauvaises surprises. Quel résumé regardes-tu ?`}
            options={[
              'L’étendue : elle dit si les températures sont régulières ou très variables',
              'La moyenne : elle dit s’il fait chaud',
              'La médiane : elle dit la température typique',
              'Peu importe : les trois donnent la même information',
            ]}
            correct={0}
            cols={1}
            requires={['choisir-indicateur', 'etendue']}
            explain={`La question porte sur la RÉGULARITÉ, pas sur le niveau. Or la moyenne et la médiane valent ${avecUnite(moyenne(VILLE_ABRITEE), VILLE_ABRITEE.unite)} dans les deux villes : elles ne peuvent pas répondre. À ${VILLE_EXPOSEE.nom}, la température est descendue à ${avecUnite(extremes(VILLE_EXPOSEE).min, VILLE_EXPOSEE.unite)} un jour et montée à ${avecUnite(extremes(VILLE_EXPOSEE).max, VILLE_EXPOSEE.unite)} un autre — c’est l’étendue qui le dit.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="mem-trois-indicateurs"
              variant="new"
              lead="Trois résumés, trois formules, trois questions : autant les avoir en tête."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Reste un dernier piège, et il n’est pas dans les nombres : il est dans le DESSIN
              qu’on en fait. C’est le module suivant.
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
      moduleTitle="Deux villes, un seul milieu"
      moduleSubtitle="La paire miroir, et la fin de l’idée qu’un résumé serait « le bon »"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'Val-Serein et Mont-Venteux',
        tone: 'indigo',
        body: (
          <>
            Au module précédent, un seul des trois résumés distinguait les deux groupes. Voici deux
            villes qui ont la même moyenne <em>et</em> le même milieu.{' '}
            <strong>Qu’est-ce qui les sépare, alors ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <CloudSun className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Même tableau, même geste, résultat opposé.{' '}
            <Wind className="inline h-4 w-4" aria-hidden="true" /> Deux comparaisons suffisent à
            démolir l’idée qu’un des trois nombres serait meilleur que les autres.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
