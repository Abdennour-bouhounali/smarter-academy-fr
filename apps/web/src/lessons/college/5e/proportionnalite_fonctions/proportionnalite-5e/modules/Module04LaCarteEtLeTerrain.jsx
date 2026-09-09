import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ScaleLab from '../components/ScaleLab';
import { scale, cmToKm, cmToM, fr, parseDec } from '../components/propUtils';

/**
 * Module 4 — MANIPULATION : l'échelle.
 *
 * Action → changement → observation → sens :
 *   allonger le segment sur la carte → la distance réelle se réécrit →
 *   « le rapport entre les deux ne bouge jamais » → une échelle est un
 *   coefficient qu'on ne cherche pas, on l'applique.
 *
 * Expected observation : « 1 cm de plus sur la carte, c'est toujours la même
 * distance de plus sur le terrain ».
 * Misconception targeted : confondre le coefficient d'échelle (×25 000, qui
 * donne des CENTIMÈTRES) avec la conversion d'unité (÷100 000 pour les km).
 * Les deux opérations sont délibérément séparées à l'écran.
 */
const CARTE = scale(25000);

export default function Module04LaCarteEtLeTerrain() {
  const [cm1, setCm1] = useState(2);
  const [vu1, setVu1] = useState(false);
  const done1 = vu1;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const bouger1 = (v, react) => {
    setCm1(v);
    if (v !== 2 && !vu1) {
      setVu1(true);
      react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Mesure sur la carte',
      subtitle: 'Fais glisser la règle : la distance réelle suit.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-violet-200 bg-violet-50 p-3.5 text-sm text-slate-700">
            Pour la sortie, on étudie la carte du parc. En bas, une mention :{' '}
            <strong className="font-mono">échelle 1/25 000</strong>. Elle veut dire que{' '}
            <strong>1 cm sur la carte représente 25 000 cm en vrai</strong>.
          </div>
          <ScaleLab
            scale={CARTE}
            cm={cm1}
            onCm={(v) => bouger1(v, kit.react)}
            maxCm={10}
            unit="km"
            convert={cmToKm}
          />
          {done1 ? (
            <Feedback tone="ok">
              <strong className="font-mono">{fr(cm1)} cm</strong> sur la carte, c’est{' '}
              <strong className="font-mono">{fr(cmToKm(CARTE.toReal(cm1)))} km</strong> sur le
              terrain. Double la mesure sur la carte, et la distance réelle double aussi : c’est
              bien une situation proportionnelle.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Glisse la règle. Que vaut 1 cm ? Et 4 cm ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Le coefficient est déjà donné',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="echelle"
            variant="new"
            lead={<>Le nombre écrit sous la carte, c’est le coefficient — tu n’as pas eu à le chercher.</>}
          />
          <TapQuestion
            prompt={
              <>
                Sur cette carte au <strong className="font-mono">1/25 000</strong>, on mesure{' '}
                <strong>6 cm</strong> entre l’entrée et le lac. Quelle est la distance réelle ?
              </>
            }
            options={['1,5 km', '150 km', '15 km', '0,15 km']}
            cols={4}
            correct={0}
            requires={['echelle', 'coefficient-proportionnalite']}
            explain="6 × 25 000 = 150 000 cm. On convertit ensuite : 150 000 cm = 1 500 m = 1,5 km. Deux opérations distinctes — d’abord l’échelle, ensuite l’unité."
            explainWrong="150 km serait la réponse si on s’arrêtait aux 150 000 sans regarder l’unité : le résultat de la multiplication est en CENTIMÈTRES. 150 000 cm font 1,5 km — la longueur d’une promenade, pas d’un voyage."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Dans l’autre sens',
      subtitle: 'On connaît le terrain, on cherche la carte.',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={
              <>
                Le stade mesure <strong>100 m</strong> de long. Sur un plan au{' '}
                <strong className="font-mono">1/2 000</strong>, quelle sera sa longueur ?
              </>
            }
            expected={5}
            parse={parseDec}
            suffix="cm"
            requires={['echelle', 'coefficient-proportionnalite']}
            explain="100 m = 10 000 cm. Pour aller du terrain vers la carte, on DIVISE par 2 000 : 10 000 ÷ 2 000 = 5 cm."
            explainFor={(n) =>
              n === 0.05
                ? 'Tu as divisé les 100 m par 2 000 sans les convertir d’abord. L’échelle compare des centimètres à des centimètres : 100 m font 10 000 cm.'
                : 'Convertis d’abord en centimètres (100 m = 10 000 cm), puis divise par 2 000 pour revenir sur la carte.'
            }
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Lire une échelle',
      done: q4,
      content: (
        <div className="space-y-3">
          <ScaleLab
            scale={scale(200)}
            cm={4}
            onCm={() => {}}
            maxCm={10}
            unit="m"
            convert={cmToM}
          />
          <TapQuestion
            prompt={
              <>
                Sur un plan de la salle des fêtes, l’échelle est{' '}
                <strong className="font-mono">1/200</strong>. Que signifie ce nombre ?
              </>
            }
            options={[
              '1 cm sur le plan représente 200 cm en vrai, soit 2 m',
              'Le plan est 200 fois plus grand que la salle',
              'La salle mesure 200 m',
            ]}
            cols={1}
            correct={0}
            requires={['echelle']}
            explain="Une échelle 1/200 réduit : 1 cm sur le plan vaut 200 cm en vrai, c’est-à-dire 2 m. Un plan est toujours plus petit que ce qu’il représente."
            explainWrong="C’est l’inverse : le plan est 200 fois plus PETIT que la salle. C’est bien pour cela qu’il tient sur une feuille."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="La carte et le terrain"
      moduleSubtitle="Un coefficient qu’on ne choisit pas"
      estimatedTime="11 min"
      brief={{
        tag: 'Manipulation',
        title: 'Le coefficient est écrit sur la carte',
        tone: 'indigo',
        body: (
          <p>
            Jusqu’ici, tu cherchais le coefficient dans un tableau. Sur une carte, il est{' '}
            <strong>donné d’avance</strong> : c’est l’échelle. Reste à savoir dans quel sens
            l’utiliser — et à ne pas oublier les unités.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
