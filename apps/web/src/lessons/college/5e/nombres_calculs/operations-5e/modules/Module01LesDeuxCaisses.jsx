import React, { useState } from 'react';
import { Receipt, MousePointerClick } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ExpressionLab from '../components/ExpressionLab';
import { TICKET, evalExpr, fr } from '../components/operations';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : les deux caisses
 * (components/ExpressionLab.jsx).
 *
 * Activity              poser une parenthèse sur un ticket de caisse et voir
 *                       le total se réécrire.
 * Mathematical objective un calcul n'est pas une phrase qu'on lit de gauche à
 *                       droite : il a une STRUCTURE, et la parenthèse la désigne.
 * Student action        toucher deux nombres pour ouvrir et fermer la parenthèse.
 * Controlled variable   la parenthèse posée, et elle seule — les nombres et les
 *                       opérateurs ne changent JAMAIS.
 * Mathematical state    un intervalle de termes { from, to }, ou rien.
 * Visual consequence    les termes concernés passent en ambre, les parenthèses
 *                       apparaissent, le total se réécrit à l'instant.
 * Expected observation  « les mêmes nombres, le même ordre — et pourtant deux
 *                       résultats » ; « la parenthèse autour du produit ne
 *                       change rien, elle rend juste visible ».
 * Misconception targeted lire un calcul de gauche à droite comme une phrase.
 * Formalization         les mots « structure » et « parenthèses » n'arrivent
 *                       qu'à l'étape 4, après trois manipulations, portés par
 *                       des KnowledgeBricks. La convention des priorités est
 *                       délibérément LAISSÉE au module 2 : ici, l'élève
 *                       découvre seulement qu'il FAUT une convention.
 * Transfer              module 2 : que se passe-t-il quand personne ne pose de
 *                       parenthèse ?
 *
 * §6bis / règle M1 : l'étape 1 REND la manipulation ; la prédiction vit à
 * l'intérieur de l'étape comme une invitation, jamais comme un péage. La
 * manipulation reste REJOUABLE après validation — aucun `disabled` lié à `done`.
 */
const VINGT = 20;
const QUATORZE = 14;

export default function Module01LesDeuxCaisses() {
  // Étape 1 — obtenir 20 : la caisse qui additionne d'abord.
  const [paren1, setParen1] = useState(null);
  const [vu20, setVu20] = useState(false);
  const done1 = vu20;
  const [pred1, setPred1] = useState(null);

  // Étape 2 — obtenir 14 : l'autre caisse.
  const [paren2, setParen2] = useState({ from: 0, to: 1 });
  const [vu14, setVu14] = useState(false);
  const done2 = vu14;

  // Étape 3 — un calcul plus long : trouver DEUX totaux différents.
  const LONG = { nums: [10, 2, 3], ops: ['−', '×'] };
  const [paren3, setParen3] = useState(null);
  const [totaux, setTotaux] = useState(() => new Set([evalExpr(LONG, null)]));
  const done3 = totaux.size >= 2;

  const [q4, setQ4] = useState(false);

  const poser1 = (p, react) => {
    setParen1(p);
    if (p && p.to !== null && evalExpr(TICKET, p) === VINGT && !vu20) {
      setVu20(true);
      react?.(true);
    }
  };

  const poser2 = (p, react) => {
    setParen2(p);
    if (evalExpr(TICKET, p && p.to !== null ? p : null) === QUATORZE && !vu14) {
      setVu14(true);
      react?.(true);
    }
  };

  const poser3 = (p, react) => {
    setParen3(p);
    const valide = p && p.to !== null ? p : null;
    const v = evalExpr(LONG, valide);
    const next = new Set(totaux);
    next.add(v);
    setTotaux(next);
    if (next.size >= 2 && totaux.size < 2) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Fais afficher 20 à la caisse',
      subtitle: 'Touche deux nombres pour poser une parenthèse autour d’eux. Le total se met à jour tout seul.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <ExpressionLab
            expr={TICKET}
            paren={paren1}
            onParen={(p) => poser1(p, kit.react)}
            resultLabel="La caisse affiche"
            ariaLabel="Ticket 2 + 3 × 4 — pose une parenthèse"
          />
          <PredictionChips
            prompt="penses-tu qu’une parenthèse peut changer le total, alors que les nombres restent les mêmes ?"
            options={[
              { id: 'oui', label: 'Oui, le total peut changer' },
              { id: 'non', label: 'Non, les nombres sont les mêmes' },
              { id: 'sais-pas', label: 'Je ne sais pas' },
            ]}
            value={pred1}
            onChange={setPred1}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred1 === 'oui' ? 'Ta prédiction était la bonne' : 'Tu viens de le voir'} : la caisse
              affiche <strong>20</strong>. Pourtant, aucun nombre n’a bougé — ni le 2, ni le 3, ni
              le 4, ni les signes. Ce qui a changé, c’est <strong>ce qu’on calcule d’abord</strong>.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cherche la parenthèse qui fait afficher 20. Indice : quel calcul faudrait-il faire en
              premier pour que le résultat soit aussi grand ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'L’autre caisse affiche 14',
      subtitle: 'Trouve maintenant une écriture qui donne 14. Tu peux enlever la parenthèse en touchant un de ses nombres.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <ExpressionLab
            expr={TICKET}
            paren={paren2}
            onParen={(p) => poser2(p, kit.react)}
            resultLabel="La caisse affiche"
            ariaLabel="Ticket 2 + 3 × 4 — trouve 14"
          />
          {done2 ? (
            <Feedback tone="ok">
              <strong>14</strong>, cette fois. Deux caisses, un seul ticket, deux totaux — et
              chacune est cohérente avec elle-même. Remarque quelque chose d’étonnant : mettre la
              parenthèse autour de <strong className="font-mono">3 × 4</strong> donne{' '}
              <strong>le même résultat</strong> que ne rien mettre du tout. Cette parenthèse-là ne
              change rien : elle rend simplement visible ce qui se passait déjà.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Essaie d’entourer <strong className="font-mono">3 × 4</strong> — ou d’enlever toute
              parenthèse. Les deux mènent au même endroit.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Un autre ticket : combien de totaux différents ?',
      subtitle: 'Sur 10 − 2 × 3, essaie toutes les parenthèses possibles. Combien de résultats différents peux-tu obtenir ?',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <ExpressionLab
            expr={LONG}
            paren={paren3}
            onParen={(p) => poser3(p, kit.react)}
            resultLabel="Ce ticket vaut"
            ariaLabel="Ticket 10 − 2 × 3 — essaie les parenthèses"
          />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-500">Totaux trouvés</span>
            {[...totaux].sort((a, b) => a - b).map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 border-2 border-emerald-200 font-mono font-bold text-emerald-800 tabular-nums"
              >
                {fr(t)}
              </span>
            ))}
          </div>
          {done3 ? (
            <Feedback tone="ok">
              Deux totaux : <strong>4</strong> et <strong>24</strong>. Le même ticket peut donc
              valoir 4 chez un commerçant et 24 chez un autre — c’est intenable. Il faut que{' '}
              <strong>tout le monde lise un calcul de la même façon</strong>, même quand personne
              n’a écrit de parenthèses.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Tu as trouvé {totaux.size} total{totaux.size > 1 ? 'aux' : ''} pour l’instant. Essaie
              une autre parenthèse — ou enlève celle qui est posée.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Ce que la parenthèse raconte',
      done: q4,
      content: (
        <div className="space-y-3">
          {/* Les trois manipulations viennent de montrer que le total dépend de
              ce qu'on calcule d'abord, et que la parenthèse le désigne : c'est
              l'instant où les deux mots ont un sens, avant la question qui les
              exige. La CONVENTION, elle, est laissée au module 2. */}
          <KnowledgeBrick
            id="structure-calcul"
            variant="new"
            lead={<>Tu viens d’obtenir <strong>20</strong>, puis <strong>14</strong>, avec exactement les mêmes nombres. Ce que tu as changé porte un nom.</>}
          />
          <KnowledgeBrick
            id="parentheses"
            variant="new"
            lead={<>Et l’outil qui t’a permis de choisir la structure, c’est celui que tu as posé du doigt.</>}
          />
          <TapQuestion
            prompt="Sur le ticket 2 + 3 × 4, pourquoi les deux caisses n’affichent-elles pas le même total ?"
            options={[
              'Parce qu’elles ne calculent pas le même morceau en premier',
              'Parce que l’une s’est trompée dans ses tables',
              'Parce qu’elles n’ont pas les mêmes nombres',
              'Parce que la multiplication n’est pas exacte',
            ]}
            correct={0}
            cols={1}
            requires={['structure-calcul', 'parentheses']}
            explain="Les nombres et les signes sont identiques des deux côtés. La seule différence est la structure : commencer par 2 + 3 donne 20, commencer par 3 × 4 donne 14."
            explainWrong="Regarde à nouveau les deux tickets : rien n’a changé dans les nombres. Une seule chose a bougé — la place de la parenthèse, c’est-à-dire le morceau qu’on calcule en premier."
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
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Les deux caisses"
      moduleSubtitle="Le même ticket, deux totaux"
      estimatedTime="11 min"
      brief={{
        tag: 'Déclencheur',
        title: 'Un ticket, deux totaux',
        tone: 'indigo',
        body: (
          <p>
            Deux commerçants tapent le même ticket : <strong className="font-mono">2 + 3 × 4</strong>.
            L’un annonce 20 €, l’autre 14 €. Les deux sont sûrs d’eux. Avant de décider qui a
            raison, comprends d’abord <strong>comment un même calcul peut donner deux résultats</strong>.
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: Receipt, t: 'Le ticket', d: 'Les nombres ne changent jamais : 2, 3 et 4.', c: 'text-slate-700' },
            { icon: MousePointerClick, t: 'Ton geste', d: 'Touche deux nombres pour les entourer d’une parenthèse.', c: 'text-indigo-600' },
          ].map(({ icon: Icon, t, d, c }) => (
            <div key={t} className="rounded-xl border-2 border-slate-200 bg-white p-3">
              <Icon className={`w-5 h-5 mb-1 ${c}`} aria-hidden="true" />
              <p className="font-semibold text-slate-800 text-sm">{t}</p>
              <p className="text-xs text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={1} />}
    />
  );
}
