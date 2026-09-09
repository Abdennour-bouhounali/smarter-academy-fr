import React, { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { TileBoard, TileLegend, term } from '../../../../../common/algebra4e';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import EnqueteLab from '../components/EnqueteLab';
import { etapesProgramme } from '../components/raisonnement4e';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE de la leçon.
 *
 * Activity              faire tourner un programme de calcul sur les nombres
 *                       que l'élève choisit, et les verser au tableau.
 * Mathematical objective des essais, même nombreux, ne prouvent rien ; seule
 *                       la lettre traite tous les nombres à la fois.
 * Student action        taper un nombre, lancer, recommencer — un grand, un
 *                       zéro, un négatif.
 * Controlled variable   le nombre de départ, et lui seul.
 * Mathematical state    la liste des essais, détenue ici ; les quatre valeurs
 *                       de chaque ligne viennent de `etapesProgramme`.
 * Visual consequence    les trois premières colonnes changent d'une ligne à
 *                       l'autre, la dernière non ; le verdict, calculé par
 *                       `tester()`, refuse de conclure.
 * Expected observation  « je n'arrive pas à le mettre en défaut… mais
 *                       POURQUOI ? »
 * Misconception targeted « ça marche sur mes cinq exemples, donc c'est
 *                       prouvé ».
 * Formalization         le mot « conjecture » est posé à l'étape 2, parce
 *                       qu'il faut nommer ce qu'on vient d'écrire ; la preuve
 *                       par la lettre arrive à l'étape 3, quand le manque est
 *                       installé. Le tri des données, le schéma, l'estimation,
 *                       les stratégies et le contre-exemple appartiennent aux
 *                       modules suivants.
 *
 * LE SYSTÈME NE DONNE JAMAIS LA RÉPONSE. Aucun texte de ce module n'écrit
 * « c'est toujours 6 parce que… » avant que l'élève n'ait construit lui-même
 * la conjecture — et le verdict du laboratoire ne dit jamais « prouvée ».
 *
 * CONTINUITÉ : aucune (`continuity: null`). Voir lesson.config.js.
 */
const ATTENDU = 6;

/** L'expression du programme, en tuiles : 2n + 6 − 2n. */
const TUILES = [term(2, true), term(6, false), term(-2, true)];

export default function Module01ProgrammeMystere() {
  const [essais, setEssais] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [sel, setSel] = useState(null);
  const [q3, setQ3] = useState(false);

  // Le tableau est une PREUVE À CONVICTION, pas une note : on garde tous les
  // essais, y compris deux fois le même nombre — l'élève doit pouvoir refaire
  // exactement le même geste et voir la même chose.
  const ajouter = (n) => setEssais((e) => [...e, n]);

  const distincts = new Set(essais).size;
  const done1 = distincts >= 4;

  // Les valeurs intermédiaires bougent-elles vraiment d'un essai à l'autre ?
  // C'est ce que l'élève doit VOIR, donc on le vérifie sur ses propres essais
  // plutôt que de l'affirmer.
  const intermediaires = new Set(essais.map((n) => etapesProgramme(n)[2].valeur));

  const lab = (
    <EnqueteLab
      essais={essais}
      onEssai={ajouter}
      onVider={() => setEssais([])}
    />
  );

  const steps = [
    {
      num: 1,
      title: 'Fais tourner le programme sur tes propres nombres',
      subtitle: 'Choisis-en quatre différents. Prends-en un grand, un tout petit, pourquoi pas un négatif.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avant d’essayer : d’après toi, la dernière colonne va-t-elle changer d’un nombre à l’autre ?"
            options={[
              { id: 'change', label: 'Oui, elle changera' },
              { id: 'fixe', label: 'Non, elle sera toujours pareille' },
              { id: 'parfois', label: 'Ça dépendra du nombre' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {lab}
          {!done1 && essais.length > 0 && (
            <Feedback tone="info">
              {distincts} nombre{distincts > 1 ? 's' : ''} différent{distincts > 1 ? 's' : ''} essayé
              {distincts > 1 ? 's' : ''}. Essaies-en {4 - distincts} de plus, et prends-en un très
              éloigné des autres.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Regarde les colonnes du milieu : elles prennent {intermediaires.size} valeur
              {intermediaires.size > 1 ? 's' : ''} différente{intermediaires.size > 1 ? 's' : ''} sur
              tes essais. La dernière, elle, n’a pas bougé une seule fois.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Écris ce que tu as observé',
      done: q2,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Tes essais racontent tous la même chose. Quelle phrase résume le mieux ce que tu as
            vu — sans dire plus que ce que tu as vu ?
          </p>
          {lab}
          <TapQuestion
            prompt="Laquelle de ces phrases est fidèle à tes essais ?"
            options={[
              `Sur tous mes essais, le programme a donné ${ATTENDU}.`,
              `Le programme donne ${ATTENDU} parce que je l’ai démontré.`,
              'Le programme donne un résultat différent à chaque fois.',
              'Le programme ne fonctionne que pour les nombres positifs.',
            ]}
            correct={0}
            cols={1}
            requires={['programme-de-calcul']}
            explain={`C’est exactement ce que tu as fait : tu as ESSAYÉ, et tu as observé ${ATTENDU} à chaque fois. Tu n’as encore rien démontré, et tu n’as pas non plus vu de résultat différent.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="conjecture"
              variant="new"
              lead="Cette phrase-là porte un nom, et le nom dit précisément où tu en es."
            />
          )}
          {q2 && (
            <KnowledgeBrick
              id="essais-ne-prouvent-pas"
              variant="new"
              lead="Et voilà pourquoi le tableau, lui, refuse toujours de conclure."
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Traiter tous les nombres d’un seul coup',
      done: q3,
      content: (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Tu ne pourras jamais essayer tous les nombres : il y en a une infinité. Alors on
            change de méthode. On appelle <strong className="font-mono">n</strong> le nombre de
            départ — <em>n’importe lequel</em> — et on suit les quatre consignes avec lui.
          </p>

          <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-3">
            <table className="w-full min-w-[280px] text-sm">
              <tbody>
                {[
                  ['Choisis un nombre', 'n'],
                  ['Ajoute 3', 'n + 3'],
                  ['Multiplie par 2', '2 × (n + 3) = 2n + 6'],
                  ['Retire le double du nombre de départ', '2n + 6 − 2n'],
                ].map(([consigne, ecriture]) => (
                  <tr key={consigne} className="border-t border-slate-100 first:border-t-0">
                    <td className="py-1.5 pr-3 text-slate-600">{consigne}</td>
                    <td className="py-1.5 text-right font-mono font-bold text-slate-800">{ecriture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-slate-700">
            Il reste à ranger <span className="font-mono font-bold">2n + 6 − 2n</span>. Touche une
            tuile : ses semblables s’éclairent.
          </p>
          <TileBoard
            terms={TUILES}
            selected={sel}
            onSelect={(i) => setSel((s) => (s === i ? null : i))}
            label="L’expression du programme"
          />
          <TileLegend />

          <TapQuestion
            prompt="Que reste-t-il quand on regroupe les tuiles semblables de 2n + 6 − 2n ?"
            options={['6', '2n + 6', '6n', '0']}
            correct={0}
            cols={4}
            requires={['distributivite-simple', 'conjecture']}
            explain={`Les deux tuiles en n se retirent l’une l’autre : 2n − 2n = 0. Il ne reste que les ${ATTENDU} unités. Et comme n représentait N’IMPORTE QUEL nombre, cela vaut pour tous à la fois — ce qu’aucun essai ne pouvait établir.`}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="preuve-par-la-lettre"
              variant="new"
              lead="Ce que tes essais ne pouvaient pas faire, une seule lettre vient de le faire."
            />
          )}
          {q3 && (
            <Feedback tone="info">
              Une question reste ouverte : et si une affirmation était fausse ? Combien d’essais
              faudrait-il alors pour s’en apercevoir ? C’est le module 5.
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
      moduleTitle="Le programme mystère"
      moduleSubtitle="Essaie tout ce que tu veux : tu ne le prendras pas en défaut"
      estimatedTime="14 min"
      brief={{
        tag: '🎬 Mission 01',
        title: 'Un programme qui résiste',
        tone: 'indigo',
        body: (
          <>
            Quatre consignes, un nombre de départ au choix. Essaie de trouver un nombre qui
            fasse sortir le programme de sa routine. <strong>Bonne chance.</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
          <Search className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" aria-hidden="true" />
          <p className="text-sm text-indigo-900">
            <Sparkles className="inline h-4 w-4" aria-hidden="true" /> Chaque essai s’ajoute au
            tableau. Surveille les colonnes du milieu, et surtout celle de droite.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
