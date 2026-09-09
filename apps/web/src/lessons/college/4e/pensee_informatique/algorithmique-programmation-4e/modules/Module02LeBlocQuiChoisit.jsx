import React, { useState } from 'react';
import { GitBranch } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import AlgoLab from '../components/AlgoLab';
import { PROGRAMME_CHOIX, ENTREES_CHOIX } from '../components/programmes';
import { executer } from '../../../../../common/turtle/trace4e';

/**
 * Module 2 — DÉCOUVERTE : l'instruction qui choisit.
 *
 * Activity               exécuter le MÊME programme avec deux entrées, et
 *                        suivre pas à pas le chemin qu'il prend dans chaque cas.
 * Mathematical objective un bloc « si… alors… sinon » n'exécute qu'UNE de ses
 *                        deux branches ; laquelle dépend de la valeur testée.
 * Student action         basculer l'entrée n, puis parcourir l'exécution.
 * Controlled variable    la valeur de n, de part et d'autre du seuil 4.
 * Mathematical state     le programme (fixe) et n. La branche prise est celle
 *                        que le MOTEUR annonce (`branche` d'un pas), jamais une
 *                        seconde évaluation faite dans l'interface.
 * Visual consequence     la branche prise s'allume, l'autre s'éteint en portant
 *                        « non exécuté » ; les traits changent de couleur selon
 *                        la branche qui les a produits.
 * Expected observation   « le programme n'a pas fait tout ce qui est écrit ».
 * Misconception targeted croire que les deux branches s'exécutent l'une après
 *                        l'autre — l'erreur la plus fréquente du niveau.
 *
 * POURQUOI LA FIGURE RESTE UN CARRÉ dans les deux cas : si la forme changeait
 * aussi, l'élève pourrait attribuer la différence à autre chose qu'au choix.
 * Seule la TAILLE des côtés change, et elle vient de la seule branche prise.
 *
 * CONTINUITÉ : le programme du module 1 est celui dans lequel on a glissé ce
 * bloc — c'est le même carré, à qui l'on donne le pouvoir de choisir.
 */
export default function Module02LeBlocQuiChoisit() {
  const [n, setN] = useState(ENTREES_CHOIX[0]);
  const [vus, setVus] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const choisirN = (v) => {
    setN(v);
    setVus((liste) => (liste.includes(v) ? liste : [...liste, v]));
  };

  const done1 = vus.length >= 2;
  const resultat = executer(PROGRAMME_CHOIX, { env: { n } });
  const cote = Math.round(Math.hypot(
    resultat.segments[0].x2 - resultat.segments[0].x1,
    resultat.segments[0].y2 - resultat.segments[0].y1,
  ));
  const branche = resultat.segments[0].branche;

  const lab = (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-violet-200 bg-white p-2.5">
        <span className="text-sm font-bold text-slate-600">L’entrée du programme :</span>
        {ENTREES_CHOIX.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => choisirN(v)}
            aria-pressed={n === v}
            className={`min-h-[44px] rounded-xl border-2 px-4 font-mono text-sm font-black transition-colors ${
              n === v
                ? 'border-violet-600 bg-violet-600 text-white'
                : 'border-violet-300 bg-white text-violet-700 hover:bg-violet-50'
            }`}
          >
            n = {v}
          </button>
        ))}
      </div>
      <AlgoLab
        programme={PROGRAMME_CHOIX}
        env={{ n }}
        teinterBranches
        titre="Le programme qui choisit"
      />
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Le même programme, deux entrées',
      subtitle: 'Bascule entre n = 3 et n = 7, puis parcours l’exécution dans chaque cas.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Le programme contient DEUX instructions AVANCER, l’une de 70, l’autre de 35. Que va-t-il tracer ?"
            options={[
              { id: 'les-deux', label: 'Les deux : des côtés de 70 et de 35' },
              { id: 'une', label: 'Une seule des deux, à chaque tour' },
              { id: 'somme', label: 'Des côtés de 105 (70 + 35)' },
              { id: 'sais-pas', label: 'Je ne sais pas encore' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          <div className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm">
            <span className="text-slate-500">Avec </span>
            <span className="font-mono font-black text-violet-700">n = {n}</span>
            <span className="text-slate-500"> : le test « n &gt; 4 » est </span>
            <strong className={branche === 'alors' ? 'text-emerald-700' : 'text-rose-700'}>
              {branche === 'alors' ? 'vrai' : 'faux'}
            </strong>
            <span className="text-slate-500">, la branche « {branche} » est prise, </span>
            <span className="text-slate-500">et les côtés mesurent </span>
            <strong className="font-mono text-slate-900">{cote}</strong>.
          </div>
          {!done1 && (
            <Feedback tone="info">
              Essaie les deux entrées, et regarde à chaque fois quelle branche porte l’étiquette
              « chemin suivi ».
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Le programme n’a pas changé d’une virgule. Ce sont les entrées qui diffèrent — et
              une branche différente s’est exécutée à chaque fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Combien d’instructions ont vraiment été exécutées ?',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le corps de la boucle contient un bloc de choix (avec ses deux AVANCER) et un
            TOURNER. Compte les pas de l’exécution.
          </p>
          {lab}
          <TapQuestion
            prompt="La boucle fait 4 tours. Combien de pas compte l’exécution complète ?"
            options={['8 pas', '12 pas', '4 pas', '16 pas']}
            correct={0}
            cols={4}
            requires={['pas-a-pas']}
            explain="À chaque tour, le programme exécute UN seul AVANCER — celui de la branche prise — puis le TOURNER : 2 pas par tour, donc 8 en tout. Les 4 AVANCER de la branche non prise n’ont jamais été exécutés."
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="si-alors-sinon"
              variant="new"
              lead="Le bloc que tu viens de voir choisir porte un nom, et une règle stricte."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Prévoir sans exécuter',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Avec ce même programme, on donne maintenant n = 4. Quelle branche sera prise ?"
            options={[
              'La branche « sinon » : côtés de 35',
              'La branche « alors » : côtés de 70',
              'Les deux, l’une après l’autre',
              'Aucune : le programme s’arrête',
            ]}
            correct={0}
            cols={1}
            requires={['si-alors-sinon']}
            explain="Le test est « n > 4 ». Pour n = 4, il est faux : 4 n’est pas strictement plus grand que 4. C’est donc la branche « sinon » qui s’exécute."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Remarque le mot « strictement » : n = 4 est exactement la valeur du seuil, et c’est
              là que la réponse se joue. On y reviendra.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Un programme, plusieurs chemins',
      done: q4,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Pour être sûr qu’un programme contenant un bloc de choix est correct, que faut-il faire ?"
            options={[
              'L’essayer avec une valeur qui prend « alors », et une qui prend « sinon »',
              'L’essayer une seule fois : s’il marche, il marche',
              'Le lire de haut en bas sans l’exécuter',
              'Compter le nombre d’instructions écrites',
            ]}
            correct={0}
            cols={1}
            requires={['si-alors-sinon', 'prevoir-executer']}
            explain="Un essai ne teste qu’UN chemin. L’autre branche peut contenir une erreur qu’aucune exécution n’a encore rencontrée."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <KnowledgeBrick
              id="chemin-programme"
              variant="new"
              lead="Voilà ce que deux entrées viennent de te montrer."
            />
          )}
          {q4 && (
            <Feedback tone="info">
              Jusqu’ici, la condition t’était donnée. Au module suivant, c’est toi qui l’écris —
              et tu découvriras qu’une condition presque juste est fausse.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le bloc qui choisit"
      moduleSubtitle="Tout est écrit, mais tout n’est pas exécuté"
      estimatedTime="11 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Deux entrées, deux figures',
        tone: 'indigo',
        body: (
          <>
            On a glissé un bloc dans ton programme du module précédent. Le voici avec deux
            entrées différentes. <strong>Le programme n’a pas changé — la figure, si.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Dans le programme écrit, surveille les deux blocs verts et roses : l’un porte
            « chemin suivi », l’autre « non exécuté ». Ce n’est jamais le même.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
