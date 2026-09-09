import React, { useState } from 'react';
import { Gauge } from 'lucide-react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SacLab from '../components/SacLab';
import { EVENEMENTS_SAC, probabilite, fraction, estImpossible, estCertain } from '../components/proba4e';

/**
 * Module 5 — MANIPULATION : les deux bornes de l'échelle.
 *
 * Activity              chercher, dans le sac, un événement qui n'arrive
 *                       JAMAIS et un qui arrive TOUJOURS.
 * Mathematical objective un événement sans aucune issue est impossible (P =
 *                       0) ; un événement qui contient toutes les issues est
 *                       certain (P = 1). Les deux bornes de l'échelle de 5e
 *                       reçoivent ici leur description ensembliste.
 * Student action        choisir des filtres jusqu'à éteindre toutes les
 *                       billes, puis jusqu'à toutes les allumer.
 * Controlled variable   l'événement observé.
 * Mathematical state    l'événement ; les verdicts sont CALCULÉS.
 * Visual consequence    toutes les billes en pointillé, ou toutes allumées.
 * Expected observation  « P = 0 quand il ne reste rien ; P = 1 quand il ne
 *                       manque rien ».
 * Misconception targeted croire qu'un événement rare est « impossible ».
 *                       Ici, impossible a un sens précis : AUCUNE issue.
 *
 * Le sac ne contient aucune bille noire : « la bille est noire » est donc
 * l'événement impossible, et « la bille est colorée » l'événement certain.
 * Les deux sont dans le noyau (`EVENEMENTS_SAC`), calculés, pas écrits.
 */
export default function Module05DuJamaisAuToujours() {
  const [filtre, setFiltre] = useState('rouge');
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const noire = EVENEMENTS_SAC.noire;
  const coloree = EVENEMENTS_SAC.coloree;

  const steps = [
    {
      num: 1,
      title: 'Un événement qui n’arrive jamais',
      done: q1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le sac ne contient que des billes rouges, bleues et vertes. Que se passe-t-il si on
            demande « la bille est noire » ?
          </p>
          <SacLab filtreA={filtre} mode="simple" onFiltreA={setFiltre} />
          <TapQuestion
            prompt="Aucune bille du sac n’est noire. Quelle est la probabilité de tirer une bille noire ?"
            options={['0', '1', 'Impossible à calculer', '1/8']}
            correct={0}
            cols={4}
            requires={['probabilite', 'echelle-probabilite']}
            explain={`Aucune issue ne convient : ${fraction(probabilite(noire))} sur 8. Une probabilité nulle décrit un événement qui ne peut pas se produire.`}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
          {q1 && (
            <KnowledgeBrick
              id="impossible-certain"
              variant="new"
              lead="Les deux bouts de l’échelle que tu connais depuis la 5e ont maintenant une description exacte."
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Un événement qui arrive toujours',
      done: q2,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Toutes les billes du sac ont une couleur. Quelle est la probabilité de tirer une bille colorée ?"
            options={['1', '0', '8', '1/8']}
            correct={0}
            cols={4}
            requires={['impossible-certain']}
            explain={`Toutes les issues conviennent : ${fraction(probabilite(coloree))}. Une probabilité égale à 1 décrit un événement certain.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <Feedback tone="info">
              Remarque : « noire » et « colorée » sont contraires l’un de l’autre — et
              0 + 1 = 1, comme au module 3.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Rare n’est pas impossible',
      done: q3,
      content: (
        <TapQuestion
          prompt="Dans un sac de 1 000 billes, une seule est dorée. Que peut-on dire de l’événement « tirer la dorée » ?"
          options={[
            'Il est très peu probable, mais possible',
            'Il est impossible',
            'Il est certain à long terme',
            'Sa probabilité est nulle',
          ]}
          correct={0}
          cols={1}
          requires={['impossible-certain', 'probabilite']}
          explain="Sa probabilité vaut 1/1000 : c’est petit, mais ce n’est pas zéro. Impossible a un sens précis — AUCUNE issue ne convient — et ce n’est pas le cas ici."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Du jamais au toujours"
      moduleSubtitle="Les deux bornes de l’échelle, décrites par les issues"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Zéro et un',
        tone: 'indigo',
        body: (
          <>
            Tu connais l’échelle des probabilités depuis la 5e. Ses deux extrémités ont une
            description très simple : <strong>aucune issue, ou toutes les issues</strong>.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <Gauge className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Regarde le sac et demande-toi, avant de répondre : combien de billes cet événement
            retient-il ? Zéro ? Toutes ?
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
