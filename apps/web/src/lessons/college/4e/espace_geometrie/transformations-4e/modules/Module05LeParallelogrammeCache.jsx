import React, { useState } from 'react';
import { Square, GitCompare } from 'lucide-react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ParallelogrammeLab from '../components/ParallelogrammeLab';
import {
  M_PARA, N_PARA, GLISSEMENTS, parallelogrammeDe,
} from '../components/translation4e';

/**
 * Module 5 — MANIPULATION : le quadrilatère que fabrique un glissement.
 *
 * Activity              relier M, N et leurs deux images, et basculer entre
 *                       les deux ordres possibles.
 * Mathematical objective si M’ et N’ sont les images de M et N, alors
 *                       M M’ N’ N est un parallélogramme — parce que [M M’]
 *                       et [N N’] sont, par définition du glissement,
 *                       parallèles et de même longueur.
 * Student action        déplacer M et N ; basculer l'ordre des sommets.
 * Controlled variable   les deux points de départ, et l'ordre de liaison.
 * Mathematical state    (M, N, glissement, ordre) ; les images, le
 *                       quadrilatère et le verdict en sont DÉRIVÉS.
 * Visual consequence    dans l'ordre du tour, le quadrilatère est violet et
 *                       plein ; dans l'ordre croisé, il devient rouge et se
 *                       replie sur lui-même.
 * Expected observation  « ce n'est pas le même quadrilatère selon l'ordre ».
 * Misconception targeted relier « les deux points, puis leurs deux images » —
 *                       ce que suggère la lecture naturelle de l'énoncé, et
 *                       qui donne une figure croisée.
 * Formalization         la règle à l'étape 3, après que l'élève a VU les deux
 *                       ordres et déplacé M et N pour éprouver le verdict.
 *
 * LE CAS APLATI EST ATTEIGNABLE : en amenant N sur la droite qui porte le
 * glissement depuis M, les quatre points s'alignent et il n'y a plus de
 * quadrilatère. Le laboratoire le dit ; c'est un état valide de la
 * manipulation, pas un bug à masquer.
 */
const G = GLISSEMENTS.m5;

export default function Module05LeParallelogrammeCache() {
  const [M, setM] = useState(M_PARA);
  const [N, setN] = useState(N_PARA);
  const [ordre, setOrdre] = useState('tour');
  const [vuCroise, setVuCroise] = useState(false);
  const [bouges, setBouges] = useState(0);
  const [pred, setPred] = useState(null);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const q = parallelogrammeDe(M, N, G);
  const done1 = vuCroise && ordre === 'tour';
  const done2 = bouges >= 3;

  const bougerM = (p) => { setM(p); setBouges((n) => n + 1); };
  const bougerN = (p) => { setN(p); setBouges((n) => n + 1); };

  const lab = (montrerDiagonales = false) => (
    <ParallelogrammeLab
      M={M} onM={bougerM}
      N={N} onN={bougerN}
      g={G}
      ordre={ordre}
      montrerDiagonales={montrerDiagonales}
      ariaLabel="Le quadrilatère du glissement"
    />
  );

  const bascule = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setOrdre('tour')}
        aria-pressed={ordre === 'tour'}
        className={`min-h-[44px] rounded-xl border-2 px-4 text-sm font-bold ${
          ordre === 'tour'
            ? 'border-purple-700 bg-purple-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-purple-400'
        }`}
      >
        Relier M · M’ · N’ · N
      </button>
      <button
        type="button"
        onClick={() => { setOrdre('croise'); setVuCroise(true); }}
        aria-pressed={ordre === 'croise'}
        className={`min-h-[44px] rounded-xl border-2 px-4 text-sm font-bold ${
          ordre === 'croise'
            ? 'border-rose-700 bg-rose-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 hover:border-rose-400'
        }`}
      >
        Relier M · N · M’ · N’
      </button>
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Deux ordres, deux figures',
      subtitle: 'Deux points et leurs deux images. Essaie les deux façons de les relier.',
      done: done1,
      content: (
        <div className="space-y-3">
          <PredictionChips
            prompt="Quatre points, deux façons de les relier. Penses-tu obtenir la même figure ?"
            options={[
              { id: 'meme', label: 'Oui, ce sont les mêmes points' },
              { id: 'differente', label: 'Non, l’ordre change la figure' },
            ]}
            value={pred}
            onChange={setPred}
          />
          {bascule}
          {lab()}
          {!vuCroise && (
            <Feedback tone="info">
              Appuie sur « Relier M · N · M’ · N’ » pour voir l’autre ordre.
            </Feedback>
          )}
          {vuCroise && ordre === 'croise' && (
            <Feedback tone="info">
              Ce quadrilatère est <strong>croisé</strong> : ses côtés se coupent au lieu de faire
              le tour. Reviens à l’ordre M · M’ · N’ · N pour continuer.
            </Feedback>
          )}
          {done1 && (
            <Feedback tone="ok">
              Les mêmes quatre points, et pourtant deux figures. C’est l’ordre qui fait le
              quadrilatère.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Bouge M et N',
      subtitle: 'Trois positions différentes : le verdict tient-il toujours ?',
      done: done2,
      content: (
        <div className="space-y-3">
          {lab()}
          {!done2 && (
            <Feedback tone="info">
              Déplace encore {3 - bouges} fois M ou N. Essaie même de les mettre dans le
              prolongement de la flèche orange, et regarde ce qui se passe.
            </Feedback>
          )}
          {done2 && !q.aplati && (
            <Feedback tone="ok">
              Où que tu poses M et N, les deux côtés [M M’] et [N N’] restent parallèles et de
              même longueur — puisque ce sont deux fois le <strong>même glissement</strong>.
            </Feedback>
          )}
          {done2 && q.aplati && (
            <Feedback tone="info">
              Tu as trouvé le cas limite : M, N et le glissement sont alignés, et les quatre
              points tombent sur une même droite. Il n’y a plus de quadrilatère du tout —
              écarte N de la flèche pour le retrouver.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Quel quadrilatère ?',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Dans le quadrilatère M M’ N’ N, les côtés [M M’] et [N N’] sont parallèles et de même longueur. Quelle figure obtient-on ?"
            options={[
              'Un parallélogramme',
              'Un carré, forcément',
              'Un rectangle, forcément',
              'On ne peut rien dire de plus',
            ]}
            correct={0}
            cols={1}
            requires={['parallelogramme', 'droites-paralleles', 'quadrilatere', 'translation']}
            explain="Un quadrilatère dont deux côtés opposés sont parallèles et de même longueur est un parallélogramme — c’est la propriété vue en 6e. Un carré ou un rectangle demanderaient en plus des angles droits, que rien ici n’impose : déplace M et tu obtiendras des angles quelconques."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <KnowledgeBrick
              id="translation-parallelogramme"
              variant="new"
              lead="Le glissement fabrique une figure que tu connais depuis la 6e."
            />
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Dans l’autre sens',
      done: q4,
      content: (
        <div className="space-y-3">
          {lab(true)}
          <TapQuestion
            prompt="Sur un exercice, on te dit : « MM’N’N est un parallélogramme ». Que peux-tu en déduire ?"
            options={[
              'Le glissement qui mène de M à M’ mène aussi de N à N’',
              'M et N sont confondus',
              'Le glissement mène de M à N',
              'Rien : un parallélogramme ne dit rien d’un glissement',
            ]}
            correct={0}
            cols={1}
            requires={['translation-parallelogramme', 'diagonale', 'milieu-segment']}
            explain="Dans un parallélogramme, les côtés opposés [M M’] et [N N’] sont parallèles et de même longueur, et ils vont dans le même sens : c’est exactement la définition d’un même glissement. La propriété marche donc dans les deux sens, et c’est ce qui la rend utile en exercice."
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
          {q4 && (
            <Feedback tone="info">
              Tu sais construire, mesurer et reconnaître. Dernier atelier : trois figures, trois
              copies, et une seule question — quel geste a été fait ?
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
      moduleTitle="Le parallélogramme caché"
      moduleSubtitle="Quatre points, deux ordres, une seule bonne figure"
      estimatedTime="10 min"
      brief={{
        tag: '🎬 Mission 05',
        title: 'Deux points et leurs copies',
        tone: 'indigo',
        body: (
          <>
            Deux points M et N glissent en même temps. Leurs quatre positions forment un
            quadrilatère — <strong>mais dans quel ordre faut-il les relier ?</strong>
          </>
        ),
      }}
      intro={
        <div className="flex items-start gap-3 rounded-2xl border border-purple-100 bg-purple-50/60 p-3.5">
          <Square className="mt-0.5 h-5 w-5 shrink-0 text-purple-600" aria-hidden="true" />
          <p className="text-sm text-purple-900">
            Les deux boutons changent l’ordre de liaison.{' '}
            <GitCompare className="inline h-4 w-4" aria-hidden="true" /> M et N restent
            saisissables : essaie plusieurs positions.
          </p>
        </div>
      }
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
