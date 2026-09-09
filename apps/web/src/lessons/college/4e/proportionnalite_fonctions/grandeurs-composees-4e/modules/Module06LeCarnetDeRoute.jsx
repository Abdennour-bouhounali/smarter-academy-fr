import React, { useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { parseDec } from '@smarter-academy/core';
import { ContentModule, TapQuestion, NumericQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { fr, relation, debitRelation, kmhVersMs, texteDuree } from '../components/grandeurs4e';

/**
 * Module 6 — PRACTICE LAB : trois situations réelles où l'élève CHOISIT.
 *
 * Ce module n'enseigne rien de neuf : il fait reconnaître la structure. Les
 * trois situations appellent trois gestes différents — trouver une durée,
 * trouver un volume par un débit, changer d'unité — et aucun énoncé ne dit
 * lequel. Les erreurs n'y comptent pas comme preuve (stage `practice_lab`) :
 * c'est l'endroit où l'on a le droit de se tromper.
 *
 * Aucune valeur n'est réutilisée des modules précédents : ni le cycliste, ni
 * le réservoir de 300 L, ni les 36 et 90 km/h. C'est du TRANSFERT.
 */

// Situation 1 — un TGV : on cherche la vitesse à partir de deux données.
const TGV = relation({ distance: 300, duree: 1.5 });
// Situation 2 — une piscine : le débit, dans son sens « durée ».
const PISCINE = { volume: 4500, debit: 25 };
// Situation 3 — un panneau routier, à traduire en m/s.
const PANNEAU = 72;

export default function Module06LeCarnetDeRoute() {
  const [q1, setQ1] = useState(false);
  const [q1b, setQ1b] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const dureePiscine = debitRelation({ volume: PISCINE.volume, debit: PISCINE.debit }).duree;
  const panneau = kmhVersMs(PANNEAU);

  const steps = [
    {
      num: 1,
      title: 'Le train de 13 h 40',
      subtitle: `Un TGV parcourt ${fr(TGV.distance)} km en ${texteDuree(TGV.duree)}.`,
      done: q1 && q1b,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Que faut-il calculer pour connaître sa vitesse ?"
            options={[
              'La distance divisée par la durée',
              'La durée divisée par la distance',
              'La distance multipliée par la durée',
              'La somme de la distance et de la durée',
            ]}
            correct={0}
            cols={1}
            requires={['lire-une-formule', 'trois-grandeurs-liees']}
            explain="La vitesse est une grandeur quotient : des kilomètres par heure, donc des kilomètres DIVISÉS par des heures."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <NumericQuestion
              prompt="Quelle est sa vitesse, en km/h ?"
              expected={TGV.vitesse}
              parse={parseDec}
              suffix="km/h"
              requires={['lire-une-formule']}
              explain={`${fr(TGV.distance)} ÷ ${fr(TGV.duree)} = ${fr(TGV.vitesse)} km/h. Vérification : ${fr(TGV.vitesse)} × ${fr(TGV.duree)} = ${fr(TGV.distance)}.`}
              explainFor={(n) => {
                if (n === 450) return 'Tu as multiplié. La vitesse se lit « des kilomètres PAR heure » : c’est une division.';
                if (n === 150) return 'Tu as divisé par 2 au lieu de 1,5. La durée est 1 h 30 min, soit 1,5 h — pas 2 h.';
                return null;
              }}
              solved={q1b}
              onAnswered={() => setQ1b(true)}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La piscine municipale',
      subtitle: `Un bassin de ${fr(PISCINE.volume)} L se remplit à ${fr(PISCINE.debit)} L/min.`,
      done: q2,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt="Combien de minutes faut-il pour le remplir ?"
            expected={dureePiscine}
            parse={parseDec}
            suffix="min"
            requires={['debit']}
            explain={`${fr(PISCINE.volume)} ÷ ${fr(PISCINE.debit)} = ${fr(dureePiscine)} min, soit ${texteDuree(dureePiscine / 60)}. Même division que pour le train : on connaît le total et le « par unité », on cherche le nombre d’unités.`}
            explainFor={(n) => {
              if (n === 112500) return 'Tu as multiplié. Le volume est déjà donné ; c’est la durée qui manque, donc on divise.';
              if (n === 180 / 60) return 'Attention à l’unité demandée : la question porte sur des MINUTES, pas des heures.';
              return null;
            }}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              {fr(dureePiscine)} min, c’est {texteDuree(dureePiscine / 60)}. Un débit ne dit rien
              de plus qu’une vitesse : combien il y en a pour une unité de temps.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le panneau et le piéton',
      subtitle: `Un panneau limite la vitesse à ${fr(PANNEAU)} km/h.`,
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Un piéton veut savoir quelle distance une voiture parcourt pendant la seconde où il
            traverse.
          </p>
          <NumericQuestion
            prompt={`${fr(PANNEAU)} km/h, cela fait combien de mètres par seconde ?`}
            expected={panneau.valeur}
            parse={parseDec}
            suffix="m/s"
            requires={['changer-unite']}
            explain={`${fr(PANNEAU)} km = ${fr(panneau.etapes.metres)} m, parcourus en ${fr(panneau.etapes.secondes)} s : ${fr(panneau.etapes.metres)} ÷ ${fr(panneau.etapes.secondes)} = ${fr(panneau.valeur)} m/s. Une voiture franchit donc ${fr(panneau.valeur)} m dans une seconde.`}
            explainFor={(n) => {
              if (n === 259.2) return 'Tu as multiplié par 3,6. En passant aux m/s, le nombre doit RÉTRÉCIR : une seconde est bien plus courte qu’une heure.';
              if (n === 72000) return 'C’est le nombre de mètres parcourus en une HEURE. Il reste à le partager entre les 3600 secondes de cette heure.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="ok">
              Trois situations, trois gestes. Aucun énoncé ne t’a dit lequel choisir : c’est
              exactement ce qu’on te demandera.
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
      moduleTitle="Le carnet de route"
      moduleSubtitle="Trois situations, et c’est toi qui reconnais la structure"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 06',
        title: 'Personne ne te dira quoi diviser par quoi',
        tone: 'slate',
        body: (
          <>
            Un train, une piscine, un panneau routier. À toi de repérer ce que chaque situation
            demande. <strong>Les erreurs ne comptent pas ici.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 p-3.5">
          <NotebookPen className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" aria-hidden="true" />
          <p className="text-sm text-rose-900">
            Avant de calculer, dis l’unité à voix haute : elle contient déjà l’opération. « Des
            kilomètres par heure » veut dire des kilomètres divisés par des heures.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={6} />}
    />
  );
}
