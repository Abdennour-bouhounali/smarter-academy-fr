import React, { useState } from 'react';
import { Table2, Sparkles } from 'lucide-react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import MachineLab from '../components/MachineLab';
import { programme, trace, frRat, programmeTexte } from '../components/fonctions4e';

/**
 * Module 2 — DÉCOUVERTE : la chaîne ne tient pas à une valeur.
 *
 * Activity              nourrir la MÊME chaîne de plusieurs nombres à la
 *                       fois — dont 0 et des négatifs — et voir la colonne
 *                       des sorties se remplir toute seule.
 * Mathematical objective un programme est une RÈGLE, pas un calcul isolé :
 *                       il répond à toutes les entrées de la même façon, et
 *                       une même entrée redonne toujours la même sortie.
 * Student action        cocher les nombres à faire entrer ; déplier la
 *                       descente détaillée d'une ligne.
 * Controlled variable   l'ensemble des entrées essayées.
 * Mathematical state    (prog, entrées). La colonne des sorties est calculée
 *                       par `tableau` — aucune valeur écrite à la main.
 * Visual consequence    la ligne apparaît à l'instant, avec sa sortie exacte.
 * Expected observation  « la chaîne ne se fatigue pas : elle répond à tout,
 *                       même à 0, même aux négatifs ».
 * Misconception targeted croire qu'un programme « ne marche » que sur les
 *                       nombres avec lesquels on l'a vu tourner ; croire
 *                       qu'une sortie non entière est une erreur.
 * Formalization         la brique `meme-chaine-toutes-entrees` arrive après
 *                       le constat. La FORMULE n'est toujours pas nommée :
 *                       c'est le module suivant.
 *
 * DIFFÉRENCE AVEC LE MODULE 1 : là-bas, UNE valeur descendait la chaîne et
 * la remontait. Ici, plusieurs à la fois — et le tableau apparaît comme
 * résultat, pas comme point de départ.
 */

/** La chaîne du module : « ×4 puis −5 ». Une soustraction pour que les
 *  entrées petites donnent des sorties NÉGATIVES — le tableau doit contenir
 *  autre chose que des nombres qui montent gentiment. */
const CHAINE = programme(['×', 4], ['−', 5]);
/** Une seconde chaîne, avec une division : ses sorties ne tombent PAS juste. */
const CHAINE_FRACTION = programme(['÷', 3], ['+', 1]);

export default function Module02PlusieursEntrees() {
  const [entrees, setEntrees] = useState([2]);
  const [ouverte, setOuverte] = useState(null);
  const [entreesF, setEntreesF] = useState([1, 2]);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);
  const [q5, setQ5] = useState(false);

  // Étape 1 — au moins cinq entrées, dont zéro et un négatif : c'est le
  // balayage qui prouve que la règle vaut partout.
  const done1 = entrees.length >= 5 && entrees.includes(0) && entrees.some((v) => v < 0);
  const done2 = entreesF.length >= 3;

  const steps = [
    {
      num: 1,
      title: 'Nourris la chaîne',
      subtitle: 'Choisis plusieurs nombres — n’oublie ni 0 ni les négatifs.',
      done: done1,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Une nouvelle chaîne : {programmeTexte(CHAINE)}. Coche les nombres que tu veux lui
            donner, et regarde la ligne du bas se remplir.
          </p>
          <MachineLab
            prog={CHAINE}
            entrees={entrees}
            onEntrees={setEntrees}
            ouverte={ouverte}
            onOuvrir={setOuverte}
          />
          {!done1 && (
            <Feedback tone="info">
              Il te faut au moins cinq nombres, dont <strong>0</strong> et au moins un{' '}
              <strong>négatif</strong> : ce sont eux qui montrent que la chaîne ne fait pas
              d’exception.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              La même chaîne a répondu à tous. Pour 0, elle rend{' '}
              {frRat(trace(CHAINE, 0).arrivee)} — la sortie n’a aucune obligation d’être positive.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quand la sortie ne tombe pas juste',
      subtitle: 'Une chaîne avec une division : essaie plusieurs entrées.',
      done: done2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Celle-ci fait {programmeTexte(CHAINE_FRACTION)}. Coche au moins trois nombres.
          </p>
          <MachineLab
            prog={CHAINE_FRACTION}
            entrees={entreesF}
            onEntrees={setEntreesF}
            candidats={[0, 1, 2, 3, 5, 6, 10, -2]}
          />
          {done2 && (
            <Feedback tone="info">
              Pour 1, la chaîne rend <strong>{frRat(trace(CHAINE_FRACTION, 1).arrivee)}</strong> et
              non « environ 1,33 ». La fraction est la valeur <strong>exacte</strong> : c’est elle
              qu’on garde tant qu’on n’a pas besoin d’un arrondi.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Ce que le tableau prouve',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="On refait entrer un nombre qu’on avait déjà essayé. Que rend la chaîne ?"
            options={[
              'La même sortie qu’avant, toujours',
              'Une sortie différente, car la chaîne a déjà servi',
              'Cela dépend des autres nombres du tableau',
              'Rien : un nombre ne peut entrer qu’une fois',
            ]}
            correct={0}
            cols={1}
            requires={['meme-entree-meme-sortie', 'programme-de-calcul']}
            explain="Une chaîne est une règle : elle ne se souvient pas des nombres qu’on lui a donnés, et elle traite chacun de la même façon. C’est pour cela qu’on peut la résumer une fois pour toutes."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="meme-chaine-toutes-entrees"
              variant="new"
              lead="Ce que tu viens de vérifier sur une dizaine de nombres vaut pour tous."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Sans regarder le tableau',
      done: q4,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La chaîne {programmeTexte(CHAINE)} n’a jamais reçu le nombre <strong>7</strong>.
            Que va-t-elle rendre ?
          </p>
          <NumericQuestion
            prompt="La sortie pour 7"
            expected={23}
            requires={['meme-chaine-toutes-entrees']}
            explain={`7 × 4 = 28, puis 28 − 5 = ${frRat(trace(CHAINE, 7).arrivee)}. On n’a pas eu besoin de l’essayer : la règle suffisait.`}
            explainFor={(n) => {
              if (n === 8) return 'Tu as soustrait 5 d’abord (7 − 5 = 2), puis multiplié par 4. L’ordre des étapes fait partie de la chaîne.';
              if (n === 33) return 'Tu as ajouté 5 au lieu de le soustraire : la case dit « − 5 ».';
              return null;
            }}
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
    {
      num: 5,
      title: 'La question qui vient',
      done: q5,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Le tableau grandit à chaque nombre coché. Comment dire la chaîne EN ENTIER, une bonne fois, sans écrire de tableau du tout ?"
            options={[
              'En écrivant ce qu’on fait à un nombre quelconque, avec une lettre à sa place',
              'En cochant tous les nombres possibles',
              'En donnant la première et la dernière sortie',
              'C’est impossible : il faut toujours un tableau',
            ]}
            correct={0}
            cols={1}
            requires={['meme-chaine-toutes-entrees', 'en-fonction-de']}
            explain="Un tableau ne dit que les nombres qu’on a essayés. Une lettre, elle, veut dire « n’importe lequel » — c’est ce qui permet de tenir toute la chaîne sur une ligne. On le fait au module suivant."
            solved={q5}
            onAnswered={() => setQ5(true)}
          />
          {q5 && (
            <Feedback tone="info">
              C’est exactement ce que la 4e ajoute à la 5e : l’écriture qui tient toute la machine.
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
      moduleTitle="Plusieurs entrées d’un coup"
      moduleSubtitle="La même chaîne, pour tous les nombres"
      estimatedTime="9 min"
      brief={{
        tag: '🎬 Mission 02',
        title: 'Une règle, pas un calcul',
        tone: 'indigo',
        body: (
          <>
            Au module précédent, un nombre descendait la chaîne. Ici, tu vas lui en donner dix à la
            fois — <strong>y compris 0 et des négatifs</strong> — et voir si elle fait des
            exceptions.
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3.5">
          <Table2 className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" aria-hidden="true" />
          <p className="text-sm text-violet-900">
            Coche, décoche, recommence. <Sparkles className="inline h-4 w-4" aria-hidden="true" />{' '}
            Le tableau n’est pas donné : c’est toi qui le fabriques, un nombre à la fois.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
