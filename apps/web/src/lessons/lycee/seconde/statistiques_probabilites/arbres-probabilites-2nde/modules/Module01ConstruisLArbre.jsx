import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import TreeBuilder from '../components/TreeBuilder';

/**
 * Module 1 — DÉCLENCHEUR, et l'interaction SIGNATURE : construire l'arbre
 * (components/TreeBuilder.jsx).
 *
 * L'arbre n'apparaît jamais tout fait. L'élève pose les étapes et découvre
 * qu'on ne peut pas accrocher le tirage de la bille avant le choix du sac —
 * la structure de l'arbre EST la chronologie de l'expérience.
 *
 * Ce que ce module ne fait PAS : porter les poids sur les branches (M2),
 * multiplier (M3), additionner les chemins (M4). Ici, uniquement la
 * STRUCTURE : des étapes, des embranchements, quatre issues.
 */
export default function Module01ConstruisLArbre() {
  const [built, setBuilt] = useState(false);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Pose les étapes de l’expérience',
      subtitle: 'Deux sacs, une bille. Quelle est la première chose qui se passe ?',
      done: built,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Avant de commencer : combien de résultats différents cette expérience peut-elle donner ?"
            options={[
              { id: 'deux', label: '2 : rouge ou bleue' },
              { id: 'quatre', label: '4 : le sac et la couleur' },
            ]}
            value={pred} onChange={setPred} disabled={built}
          />
          <TreeBuilder onComplete={() => { setBuilt(true); kit.react?.(true); }} />
          {built && (
            <Feedback tone="ok">
              L’arbre a <strong>deux niveaux</strong> parce que l’expérience a deux temps, et
              <strong> quatre chemins</strong> parce qu’il y a deux sacs possibles × deux couleurs possibles.
              Tu as aussi vu qu’on ne peut pas accrocher la bille avant le sac : l’arbre n’est pas un dessin
              décoratif, c’est la <strong>chronologie de l’expérience</strong>.
              {pred === 'deux' && ' Le résultat final n’a que deux couleurs, mais on peut y arriver par quatre routes différentes — et c’est ce qui va tout changer.'}
            </Feedback>
          )}
          {/* L'arbre vient d'être posé à la main, dans l'ordre imposé par
              l'expérience : on peut maintenant nommer ce qu'on a construit,
              avant la question de l'étape 2 qui interroge cet ordre. */}
          {built && (
            <KnowledgeBrick
              id="arbre-structure"
              variant="new"
              lead={<>Tu viens de poser toi-même les deux étages et les quatre bouts de l’arbre — et de buter sur l’ordre. Ce que tu as construit a un nom.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Pourquoi cet ordre ?',
      done: q2,
      content: (
        <TapQuestion
          prompt="Pourquoi le choix du sac est-il forcément au premier niveau de l’arbre ?"
          options={[
            'Parce que la couleur tirée dépend du sac choisi, et pas l’inverse',
            'Parce que le sac A est plus gros que le sac B',
            'Parce qu’on écrit toujours les lettres avant les couleurs',
            'C’est arbitraire : les deux ordres se valent',
          ]}
          correct={0} cols={1}
          requires={['arbre-structure', 'experience-aleatoire', 'issue-evenement']}
          explain="L’arbre suit l’ordre dans lequel l’expérience se déroule. Le sac détermine la composition dans laquelle on tire : la couleur dépend du sac. Ce n’est ni une convention d’écriture ni une question de taille."
          explainWrong="Regarde ce qui dépend de quoi : une fois le sac choisi, les chances d’obtenir une rouge changent. C’est cette dépendance qui fixe l’ordre des niveaux."
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(1)} moduleNumber={1}
      moduleTitle="Construis l’arbre toi-même" moduleSubtitle="La structure avant les nombres" estimatedTime="14 min"
      brief={{
        tag: 'Déclencheur', title: 'Deux sacs, une bille', tone: 'indigo',
        body: <p>On tire d’abord un sac, puis une bille dedans. Personne ne va te donner l’arbre : tu vas le poser toi-même, étape par étape.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          <strong>Ce que tu viens de voir.</strong> Un <strong>arbre pondéré</strong> représente une expérience
          à plusieurs étapes : un niveau par étape, un chemin par issue possible. Module suivant : ce que
          pèsent réellement les branches.
        </KnowledgeSnapshot>
      )}
    />
  );
}
