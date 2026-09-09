import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { parseDec } from '@smarter-academy/core';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AlgoLab from '../components/AlgoLab';
import { PROGRAMME_SPIRALE, PROGRAMME_COMPTEUR } from '../components/programmes';
import { executerPasAPas, executer } from '../../../../../common/turtle/trace4e';

/**
 * Module 4 — MANIPULATION : la variable qu'on ÉCRIT.
 *
 * Activity               exécuter pas à pas une spirale dont le côté est une
 *                        variable, et regarder cette variable changer.
 * Mathematical objective une affectation placée dans une boucle s'applique à
 *                        chaque tour : la variable ÉVOLUE, et la même
 *                        instruction ne fait plus la même chose.
 * Student action         parcourir l'exécution et relever la valeur de i aux
 *                        différents tours.
 * Controlled variable    le rang d'exécution — c'est lui qui fait défiler i.
 * Mathematical state     le programme (fixe) et le rang. Les valeurs de i sont
 *                        celles que le moteur porte dans `env`, jamais
 *                        recalculées par l'interface.
 * Visual consequence     la pastille « i = … » change de valeur en cours de
 *                        route, et les côtés tracés s'allongent.
 * Expected observation   « un seul AVANCER écrit, et pourtant six longueurs ».
 * Misconception targeted lire « i ← i + 20 » comme une équation impossible ;
 *                        et croire qu'une variable garde la valeur qu'on lui a
 *                        vue la première fois.
 *
 * POURQUOI DEUX PROGRAMMES. La spirale montre une variable qui MESURE (un
 * côté). Le compteur du pentagone montre une variable qui COMPTE (des tours) :
 * elle ne se voit nulle part dans le dessin, et pourtant elle existe. Sans le
 * second, l'élève associerait « variable qui évolue » à « longueur qui
 * grandit », ce qui est un cas particulier.
 */
export default function Module04LeCompteurQuiGrandit() {
  const [releves, setReleves] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const pas = executerPasAPas(PROGRAMME_SPIRALE);

  // On relève la VALEUR DE i affichée au pas courant. Compter les valeurs
  // DISTINCTES, et non les clics, est ce qui rend le jalon honnête : parcourir
  // la réglette sans regarder ne le franchit pas.
  const relever = (rang) => {
    const v = pas[Math.min(rang, pas.length - 1)]?.env?.i;
    if (v == null) return;
    setReleves((liste) => (liste.includes(v) ? liste : [...liste, v]));
  };

  const [rangCourant, setRangCourant] = useState(0);
  const done1 = releves.length >= 3;

  const final = executer(PROGRAMME_COMPTEUR);

  const lab = (
    <div className="space-y-2">
      <AlgoLab
        programme={PROGRAMME_SPIRALE}
        onRang={setRangCourant}
        titre="La spirale et son compteur"
      />
      <button
        type="button"
        onClick={() => relever(rangCourant)}
        className="min-h-[44px] w-full rounded-xl bg-purple-600 px-3 py-2 text-sm font-bold text-white hover:bg-purple-700"
      >
        Relever la valeur de i à ce pas
      </button>
      {releves.length > 0 && (
        <div className="rounded-xl border-2 border-purple-200 bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-purple-500">
            Les valeurs de i que tu as relevées
          </p>
          <p className="mt-1 font-mono text-base font-black tabular-nums text-purple-900">
            {[...releves].sort((a, b) => a - b).join(' · ')}
          </p>
        </div>
      )}
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Un seul AVANCER, six longueurs',
      subtitle: 'Parcours l’exécution et relève la valeur de i à trois moments différents.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Ce programme n’écrit qu’une seule instruction AVANCER. Que va-t-il tracer ?"
            options={[
              { id: 'carre', label: 'Un carré : tous les côtés égaux' },
              { id: 'spirale', label: 'Des côtés de longueurs différentes' },
              { id: 'trait', label: 'Un seul trait' },
              { id: 'sais-pas', label: 'Je ne sais pas encore' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && (
            <Feedback tone="info">
              Avance dans l’exécution, puis appuie sur « Relever ». Cherche des moments où i n’a
              pas la même valeur. {releves.length}/3 relevées.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Le programme est resté le même du début à la fin. C’est la variable i qui a changé
              — et l’instruction AVANCER, elle, a simplement lu ce qu’il y avait dedans.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que « i ← i + 20 » veut dire',
      done: q2,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-purple-200 bg-white p-3 text-center">
            <p className="font-mono text-lg font-black text-purple-900">METTRE i + 20 DANS i</p>
            <p className="mt-1 text-sm text-slate-600">i ← i + 20</p>
          </div>
          <TapQuestion
            prompt="i vaut 40. Après l’instruction « i ← i + 20 », combien vaut i ?"
            options={['60', '40', 'Rien : c’est impossible', '20']}
            correct={0}
            cols={4}
            requires={['variable-informatique']}
            explain="On calcule d’abord i + 20 avec l’ANCIENNE valeur : 40 + 20 = 60. Puis on range 60 dans i. Ce n’est pas une équation — c’est un ordre : « i reçoit ce qu’il valait, plus 20 »."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="affectation"
              variant="new"
              lead="Cette flèche est la vraie nouveauté du niveau."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le compteur de tours',
      subtitle: 'Une autre variable : celle qui compte, et qu’aucun trait ne montre.',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Ce programme trace un pentagone. Une variable i part de 0 et gagne 1 à chaque tour —
            elle ne sert à aucun tracé, elle ne fait que compter.
          </p>
          <AlgoLab programme={PROGRAMME_COMPTEUR} titre="Le compteur de tours" />
          <NumericQuestion
            prompt="Une fois le programme terminé, combien vaut i ?"
            expected={final.env.i}
            parse={parseDec}
            requires={['affectation', 'repeter-n-fois']}
            explain={`i part de 0, et gagne 1 à chacun des 5 tours de la boucle : il vaut ${final.env.i} à la fin. C’est exactement le nombre de côtés tracés.`}
            explainFor={(n) => {
              if (n === 0) return 'C’est la valeur de DÉPART. L’affectation dans la boucle l’a fait changer cinq fois depuis.';
              if (n === 6) return 'La boucle fait 5 tours, donc 5 additions. Compte les tours, pas les valeurs affichées.';
              if (n === 1) return 'i gagne 1 à CHAQUE tour, et il y en a 5 : les additions s’accumulent, elles ne se remplacent pas.';
              return null;
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="compteur"
              variant="new"
              lead="Voilà pourquoi lire un programme ne suffit plus à savoir ce qu’il fait."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'La même instruction, deux résultats',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans la spirale, l’instruction « AVANCER de i » est écrite UNE fois. Pourquoi trace-t-elle des côtés de longueurs différentes ?"
            options={[
              'Parce que i n’a pas la même valeur d’un tour à l’autre',
              'Parce que le stylo se fatigue',
              'Parce que la boucle allonge le trait à chaque tour',
              'Parce que l’instruction est écrite plusieurs fois en réalité',
            ]}
            correct={0}
            cols={1}
            requires={['compteur', 'pas-a-pas']}
            explain="L’instruction ne change pas ; ce qu’elle LIT change. Pour savoir ce que fait sa troisième exécution, il faut savoir ce que valait i à ce moment-là — et seul le pas-à-pas le dit."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu sais maintenant lire un programme qui choisit et qui compte. Au module suivant,
              on t’en donne un à MODIFIER pour obtenir une figure précise.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le compteur qui grandit"
      moduleSubtitle="Une variable qu’on écrit, pas seulement qu’on lit"
      estimatedTime="12 min"
      brief={{
        tag: '🎬 Mission 04',
        title: 'Un seul AVANCER',
        tone: 'indigo',
        body: (
          <>
            Ce programme n’écrit qu’une seule instruction pour avancer. Pourtant, aucun de ses
            côtés n’a la même longueur. <strong>Où est passée la différence ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Garde un œil sur la pastille violette « i = … » pendant que tu parcours l’exécution :
            elle ne reste pas immobile.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={4} />}
    />
  );
}
