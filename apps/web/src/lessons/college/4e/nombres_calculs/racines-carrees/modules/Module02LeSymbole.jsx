import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { diagnostiquerRacine } from '../components/racines4e';

/**
 * Module 2 — DÉCOUVERTE : le nom, le symbole, et ce que l'opération refuse.
 *
 * Ce que le module 1 a laissé ouvert : on SAIT chercher le côté d'un carré
 * d'aire donnée, on n'a pas de nom pour cette opération ni de façon de
 * l'écrire. C'est ici que « racine carrée » et √ sont posés — et nulle part
 * avant.
 *
 * Ce que ce module NE fait PAS : ni table des carrés parfaits (M3), ni
 * encadrement (M4). Ici les nombres tombent toujours juste, pour que
 * l'attention porte sur le SENS et la NOTATION.
 */
export default function Module02LeSymbole() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le nom de ce que tu cherchais',
      subtitle: 'Chercher le côté d’un carré d’aire donnée : cette opération a un nom et un symbole.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="racine-carree"
            variant="new"
            lead={<>Tu cherchais, pour un nombre de carreaux, le côté du carré correspondant. C’est une opération à part entière — voici comment on l’écrit.</>}
          />
          <NumericQuestion
            prompt={<span>Combien vaut <MathText>{'$\\sqrt{64}$'}</MathText> ?</span>}
            expected={8}
            requires={['racine-carree']}
            explain="√64 = 8, parce que 8 × 8 = 64. Autrement dit : un carré d’aire 64 a un côté de 8."
            explainFor={(n) => {
              const code = diagnostiquerRacine(64, n);
              if (code === 'a-pris-la-moitie') {
                return "Tu as pris la moitié de 64. Or 32 × 32 = 1024, pas 64. La racine n’est pas la moitié — c’est le nombre qui, multiplié PAR LUI-MÊME, redonne 64.";
              }
              if (code === 'a-redonne-l-aire') {
                return "Tu as redonné l’aire. On cherche le CÔTÉ du carré dont l’aire vaut 64.";
              }
              if (code === 'trop-grand') {
                return `${n} est trop grand : ${n} × ${n} dépasse 64. Essaie un peu plus petit.`;
              }
              if (code === 'trop-petit') {
                return `${n} est trop petit : ${n} × ${n} n’atteint pas 64. Essaie un peu plus grand.`;
              }
              return "Cherche le nombre qui, multiplié par lui-même, donne 64 : c’est 8.";
            }}
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Ce que la racine refuse',
      subtitle: 'Toutes les demandes n’ont pas de réponse.',
      done: q2,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chacune, dis si l’écriture désigne un nombre <strong>existant</strong> ou non.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: <MathText>{'$\\sqrt{0}$'}</MathText>,
                options: ['existe', 'n’existe pas'],
                correct: 0,
                correction: '√0 = 0, car 0 × 0 = 0',
              },
              {
                id: 'r2',
                label: <MathText>{'$\\sqrt{-16}$'}</MathText>,
                options: ['existe', 'n’existe pas'],
                correct: 1,
                correction: 'aucun nombre multiplié par lui-même ne donne −16',
              },
              {
                id: 'r3',
                label: <MathText>{'$\\sqrt{100}$'}</MathText>,
                options: ['existe', 'n’existe pas'],
                correct: 0,
                correction: '√100 = 10',
              },
            ]}
            requires={['racine-carree', 'regle-des-signes']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm text-emerald-700">
                  Exactement. Un nombre <strong>négatif</strong> n’a pas de racine carrée : un carré
                  est toujours positif, puisqu’un nombre multiplié par lui-même a forcément deux
                  facteurs de même signe.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  Souviens-toi de la règle des signes : 4 × 4 = 16 et (−4) × (−4) = 16 aussi. Aucun
                  nombre ne peut donner −16 en se multipliant par lui-même — donc √(−16) n’existe
                  pas. En revanche √0 = 0 sans difficulté.
                </p>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Le piège de la moitié',
      done: q3,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="mem-pas-la-moitie"
            variant="new"
            lead={<>Une confusion revient sans cesse, et un seul test suffit à s’en protéger.</>}
          />
          <TapQuestion
            prompt={<span>Nabil affirme que <MathText>{'$\\sqrt{100} = 50$'}</MathText>. Comment lui montrer son erreur ?</span>}
            options={[
              'En calculant 50 × 50 : on trouve 2500, et non 100',
              'En lui disant que la racine est toujours plus petite',
              'En divisant 100 par 50',
              'Il a raison : 50 est la moitié de 100',
            ]}
            correct={0}
            cols={1}
            requires={['mem-pas-la-moitie', 'racine-carree']}
            explain="Le test qui tranche toujours : remets ta réponse au carré. 50 × 50 = 2500, très loin de 100. La bonne réponse est 10, car 10 × 10 = 100."
            explainWrong="La vraie protection contre cette erreur n’est pas une règle à retenir, c’est une VÉRIFICATION : multiplie ta réponse par elle-même et regarde si tu retombes sur le nombre de départ."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le symbole √"
      moduleSubtitle="Nommer l’opération inverse du carré"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Une opération qui remonte',
        tone: 'indigo',
        body: (
          <p>
            Tu sais maintenant chercher le côté d’un carré dont on connaît l’aire. Cette opération
            est assez importante pour avoir <strong>son propre symbole</strong> — et quelques
            règles bien à elle.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
