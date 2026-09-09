import React, { useState } from 'react';
import { Droplets, RotateCcw } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { useLabState } from '../../../../../common/hooks/useLabState';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import RemplissageLab from '../components/RemplissageLab';
import { aireBaseCarree, volumePyramide, volumePrisme, vol, fr } from '../components/espace4e';
import { LESSON_CONFIG } from '../lesson.config';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              verser une pyramide dans un prisme de même base et
 *                       même hauteur, jusqu'à le remplir ; recommencer avec
 *                       d'autres dimensions.
 * Mathematical objective le volume d'une pyramide est le TIERS de celui du
 *                       prisme jumeau — et ce nombre ne dépend de rien.
 * Student action        régler la base et la hauteur, tourner les solides,
 *                       verser.
 * Controlled variable   le côté de la base et la hauteur, COMMUNS aux deux
 *                       solides par construction.
 * Mathematical state    { cote, hauteur, verses } ; volumes et jauge calculés.
 * Visual consequence    la jauge monte d'un tiers par versement et se remplit
 *                       exactement au troisième.
 * Expected observation  « il en faut trois, et ça ne change pas ».
 * Misconception targeted « une pyramide, c'est la moitié » ; ou croire que le
 *                       rapport dépend de la forme de la base.
 * Formalization         la formule est écrite au module 5 ; ici on COMPTE.
 *
 * CONTINUITÉ : les dimensions réglées ici reviennent au module 2, où l'on
 * mesure la même pyramide. Déclaré dans `lesson.config.js`.
 */
export default function Module01TroisVersements() {
  const memo = useLabState(LESSON_CONFIG.id, 'solide', { cote: 8, hauteur: 9 });
  const [cote, setCote] = useState(memo.value.cote ?? 8);
  const [hauteur, setHauteur] = useState(memo.value.hauteur ?? 9);
  const [verses, setVerses] = useState(0);
  const [yaw, setYaw] = useState(28);
  const [pitch, setPitch] = useState(16);
  const [remplissages, setRemplissages] = useState([]);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const aireBase = aireBaseCarree(cote);
  const vPyr = volumePyramide(aireBase, hauteur);
  const vPri = volumePrisme(aireBase, hauteur);

  const verser = () => {
    const n = verses + 1;
    setVerses(n);
    if (n * vPyr >= vPri - 1e-9) {
      setRemplissages((r) =>
        r.some((x) => x.cote === cote && x.hauteur === hauteur) ? r : [...r, { cote, hauteur, n }]
      );
    }
  };

  // Changer une dimension vide le récipient : les deux solides doivent rester
  // jumeaux, et un remplissage partiel n'aurait plus de sens.
  const regler = (setter) => (v) => { setter(v); setVerses(0); memo.save({ cote, hauteur, [setter === setCote ? 'cote' : 'hauteur']: v }); };

  const done1 = remplissages.length >= 1;
  const done2 = remplissages.length >= 2;

  const lab = (
    <RemplissageLab
      cote={cote} hauteur={hauteur}
      onCote={regler(setCote)} onHauteur={regler(setHauteur)}
      verses={verses} onVerser={verser} onVider={() => setVerses(0)}
      yaw={yaw} pitch={pitch} onYaw={setYaw} onPitch={setPitch}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Remplis le prisme',
      subtitle: 'Les deux récipients ont la même base et la même hauteur. Verse jusqu’à ce que le prisme soit plein.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Combien de pyramides faudra-t-il pour remplir le prisme ?"
            options={[
              { id: 'deux', label: '2' },
              { id: 'trois', label: '3' },
              { id: 'quatre', label: '4' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {done1 && (
            <Feedback tone="ok">
              Trois versements exactement, et pas une goutte de trop. Est-ce un hasard lié à ces
              dimensions ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Change les dimensions, recompte',
      subtitle: 'Règle une autre base ou une autre hauteur, puis remplis à nouveau.',
      done: done2,
      content: (
        <div className="space-y-3">
          {lab}
          {remplissages.length > 0 && (
            <div className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-1 text-left">base</th>
                    <th className="pb-1 text-right">hauteur</th>
                    <th className="pb-1 text-right">versements</th>
                  </tr>
                </thead>
                <tbody>
                  {remplissages.map((r, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="py-1 text-slate-600">{r.cote} cm de côté</td>
                      <td className="py-1 text-right text-slate-600">{r.hauteur} cm</td>
                      <td className="py-1 text-right font-black text-slate-900">{r.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {done2 && (
            <Feedback tone="ok">
              Toujours trois. Le nombre ne dépend ni de la base, ni de la hauteur — c’est une
              propriété de la FORME, pas des mesures.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que trois versements veulent dire',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Si trois pyramides remplissent exactement le prisme, que vaut le volume d’une pyramide ?"
            options={[
              'Le tiers de celui du prisme',
              'Le triple de celui du prisme',
              'La moitié de celui du prisme',
              'Le même que celui du prisme',
            ]}
            correct={0}
            cols={1}
            requires={['pave-droit', 'aire']}
            explain={`Trois contenus identiques remplissent le prisme : chacun en occupe donc le tiers. Ici, ${vol(vPyr)} contre ${vol(vPri)}.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="tiers-pyramide"
              variant="new"
              lead="Ce que tu viens de compter deux fois de suite est une règle générale."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Et si la base était ronde ?',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Un cône et un cylindre ont la même base ronde et la même hauteur. Combien de cônes pour remplir le cylindre ?"
            options={['3', '2', '4', 'Cela dépend du rayon']}
            correct={0}
            cols={4}
            requires={['tiers-pyramide']}
            explain="Le même tiers. Ce qui compte, c’est que le solide soit POINTU — qu’il se resserre régulièrement jusqu’à sa pointe — pas la forme de sa base."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Une question reste ouverte : dans une pyramide, quelle longueur est la « hauteur » ?
              Il y en a trois candidates. C’est le module suivant.
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
      moduleTitle="Trois versements"
      moduleSubtitle="Deux récipients jumeaux, et un rapport qui ne bouge pas"
      estimatedTime="13 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Deux récipients, même base, même hauteur',
        tone: 'indigo',
        body: (
          <>
            L’un est un prisme, l’autre une pyramide. Ils ont exactement la même base et la même
            hauteur. <strong>Contiennent-ils la même chose ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Droplets className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            <RotateCcw className="inline h-4 w-4" aria-hidden="true" /> Tu peux faire tourner les
            deux solides pour les regarder sous tous les angles, puis verser.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
