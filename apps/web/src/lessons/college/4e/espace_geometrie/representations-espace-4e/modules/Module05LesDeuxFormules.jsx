import React, { useState } from 'react';
import { PenLine } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { parseDec } from '@smarter-academy/core';
import {
  aireBaseCarree, aireDisque, volumePyramide, volumeCone, volumePrisme, volumeCylindre,
  arrondi, fr, vol,
} from '../components/espace4e';

/**
 * Module 5 — FORMALISATION : deux écritures, une seule idée.
 *
 * Activity              comparer les deux calculs terme à terme, sur des
 *                       solides de même hauteur, puis les appliquer.
 * Mathematical objective V = B × h ÷ 3 pour la pyramide comme pour le cône ;
 *                       seule l'aire de base B change de forme.
 * Student action        lire le tableau de comparaison, puis calculer.
 * Mathematical state    toutes les valeurs affichées viennent du noyau : le
 *                       tableau ne peut pas contredire les modules précédents.
 * Misconception targeted oublier le tiers (chiffré ici), et confondre l'aire
 *                       de la base avec le volume.
 * Formalization         c'est LE module d'écriture — les trois briques du
 *                       niveau y sont posées, mais seulement maintenant : les
 *                       lettres B et h désignent des grandeurs nommées au
 *                       module 2 et mesurées depuis.
 *
 * La comparaison porte sur une MÊME hauteur (9 cm) et deux bases dont les
 * aires sont volontairement proches, pour que l'attention se porte sur la
 * structure du calcul et non sur l'écart des nombres.
 */
const HAUTEUR = 9;
const COTE = 6;   // base carrée : aire 36 cm²
const RAYON = 3;  // base ronde : aire ≈ 28,3 cm²

export default function Module05LesDeuxFormules() {
  const [pred, setPred] = useState(null);
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const bCarree = aireBaseCarree(COTE);
  const bRonde = aireDisque(RAYON);
  const vPyr = volumePyramide(bCarree, HAUTEUR);
  const vCon = volumeCone(RAYON, HAUTEUR);
  const vPrisme = volumePrisme(bCarree, HAUTEUR);
  const vCylindre = volumeCylindre(RAYON, HAUTEUR);

  const LIGNES = [
    { nom: 'aire de la base', carre: `${COTE} × ${COTE} = ${fr(bCarree, 0)} cm²`, rond: `π × ${RAYON} × ${RAYON} ≈ ${fr(arrondi(bRonde, 1), 1)} cm²` },
    { nom: 'hauteur', carre: `${HAUTEUR} cm`, rond: `${HAUTEUR} cm` },
    { nom: 'base × hauteur', carre: `${fr(arrondi(bCarree * HAUTEUR, 1), 1)} cm³`, rond: `≈ ${fr(arrondi(bRonde * HAUTEUR, 1), 1)} cm³` },
    { nom: 'puis ÷ 3', carre: vol(vPyr, 'cm', 1), rond: `≈ ${vol(vCon, 'cm', 1)}`, fort: true },
  ];

  const steps = [
    {
      num: 1,
      title: 'Deux calculs, côte à côte',
      subtitle: `Une pyramide à base carrée de ${COTE} cm de côté, et un cône de rayon ${RAYON} cm. Tous deux ont ${HAUTEUR} cm de hauteur.`,
      done: q1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Les deux calculs vont-ils se ressembler ?"
            options={[
              { id: 'oui', label: 'Oui, sauf la première ligne' },
              { id: 'non', label: 'Non, ils n’ont rien à voir' },
              { id: 'idem', label: 'Ils donneront le même résultat' },
            ]}
            value={pred}
            onChange={setPred}
          />
          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-1.5 text-left font-semibold">étape</th>
                  <th className="pb-1.5 text-right font-semibold">pyramide (base carrée)</th>
                  <th className="pb-1.5 text-right font-semibold">cône (base ronde)</th>
                </tr>
              </thead>
              <tbody>
                {LIGNES.map((l) => (
                  <tr key={l.nom} className="border-t border-slate-100">
                    <td className="py-1.5 pr-2 text-slate-600">{l.nom}</td>
                    <td className={`py-1.5 text-right font-mono tabular-nums ${l.fort ? 'font-black text-purple-800' : 'text-slate-700'}`}>{l.carre}</td>
                    <td className={`py-1.5 text-right font-mono tabular-nums ${l.fort ? 'font-black text-purple-800' : 'text-slate-700'}`}>{l.rond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <TapQuestion
            prompt="Qu’est-ce qui change entre les deux colonnes ?"
            options={[
              'Seulement la façon de calculer l’aire de la base',
              'Tout : ce sont deux formules sans rapport',
              'La division par 3, qui ne concerne que la pyramide',
              'La hauteur, qui se mesure autrement sur un cône',
            ]}
            correct={0}
            cols={1}
            requires={['tiers-pyramide', 'base-et-hauteur', 'cone-de-revolution', 'aire']}
            explain="Les trois dernières lignes sont identiques mot pour mot. Seule la première diffère : côté × côté d’un côté, π × rayon × rayon de l’autre."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écrire la formule',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="On note B l’aire de la base et h la hauteur. Quel calcul donne le volume d’une pyramide ?"
            options={['B × h ÷ 3', 'B × h', 'B + h ÷ 3', 'B × h × 3']}
            correct={0}
            cols={2}
            requires={['tiers-pyramide', 'base-et-hauteur']}
            explain={`B × h est le volume du prisme jumeau — ici ${vol(vPrisme, 'cm', 0)}. La pyramide n’en contient que le tiers : ${vol(vPyr, 'cm', 0)}.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <>
              <KnowledgeBrick
                id="volume-pyramide"
                variant="new"
                lead="La règle comptée au module 1 s’écrit enfin."
              />
              <KnowledgeBrick
                id="volume-cone"
                variant="new"
                lead="Et la même, avec l’aire du disque à la place de celle du carré."
              />
              <KnowledgeBrick
                id="le-tiers-a-retenir"
                variant="new"
                lead="Quatre solides, une seule chose à retenir."
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Applique-la à la pyramide',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Une pyramide a une base carrée de <strong>{COTE} cm</strong> de côté et une hauteur de{' '}
            <strong>{HAUTEUR} cm</strong>.
          </p>
          <NumericQuestion
            prompt="Quel est son volume ?"
            expected={vPyr}
            parse={parseDec}
            suffix="cm³"
            requires={['volume-pyramide']}
            explain={`L’aire de la base vaut ${COTE} × ${COTE} = ${fr(bCarree, 0)} cm². Puis ${fr(bCarree, 0)} × ${HAUTEUR} = ${fr(bCarree * HAUTEUR, 0)}, et ${fr(bCarree * HAUTEUR, 0)} ÷ 3 = ${fr(vPyr, 0)} cm³.`}
            explainFor={(n) => {
              if (n === vPrisme) return `${fr(vPrisme, 0)} cm³ est le volume du PRISME de même base et même hauteur. Il reste à diviser par 3.`;
              if (n === bCarree) return `${fr(bCarree, 0)} cm² est l’AIRE de la base, pas un volume : il faut encore multiplier par la hauteur, puis diviser par 3.`;
              if (n === COTE * HAUTEUR) return `${fr(COTE * HAUTEUR, 0)} vient de ${COTE} × ${HAUTEUR}. Mais B est une AIRE : ${COTE} × ${COTE}, pas ${COTE}.`;
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Puis au cône',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un cône a un rayon de <strong>{RAYON} cm</strong> et une hauteur de{' '}
            <strong>{HAUTEUR} cm</strong>. L’aire de son disque de base vaut environ{' '}
            <strong>{fr(arrondi(bRonde, 1), 1)} cm²</strong>.
          </p>
          <NumericQuestion
            prompt="Quel est son volume, arrondi au cm³ ?"
            expected={Math.round(vCon)}
            parse={parseDec}
            suffix="cm³"
            requires={['volume-cone', 'arrondi']}
            explain={`${fr(arrondi(bRonde, 1), 1)} × ${HAUTEUR} ÷ 3 ≈ ${Math.round(vCon)} cm³. Exactement la même suite d’opérations que pour la pyramide.`}
            explainFor={(n) => {
              if (n === Math.round(vCylindre)) return `${Math.round(vCylindre)} cm³ est le volume du CYLINDRE de même base et même hauteur. Le cône n’en contient que le tiers.`;
              if (n === Math.round(bRonde)) return `${Math.round(bRonde)} cm² est l’aire du disque de base : une aire, pas un volume.`;
              if (n === Math.round(volumeCone(RAYON * 2, HAUTEUR))) return `Attention : ${RAYON} cm est le RAYON. Tu as sans doute pris ce nombre pour un diamètre.`;
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="ok">
              Deux solides, deux bases, un seul calcul. Il ne reste plus qu’à le sortir des
              exercices : au module suivant, ce sont une tente, un cornet et un toit.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Les deux formules"
      moduleSubtitle="Base carrée ou base ronde : le même tiers"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Deux écritures, une seule idée',
        tone: 'slate',
        body: (
          <>
            Tu as compté le tiers, nommé la base et la hauteur, fabriqué le cône. Il est temps{' '}
            <strong>de l’écrire</strong> — et tu verras qu’il n’y a qu’une formule, pas deux.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Regarde le tableau ligne par ligne : trois lignes sur quatre sont identiques dans les
            deux colonnes.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
