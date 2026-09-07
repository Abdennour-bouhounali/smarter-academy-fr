import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { formatPercent, nestedProportion } from '../../../../../common/stats';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import NestedShares from '../components/NestedShares';

/**
 * Module 3 — DÉCOUVERTE : une proportion de proportion.
 *
 * Le piège visé est double : additionner (60 % + 25 % = 85 %) ou prendre le
 * plus petit des deux (25 %). La manipulation (NestedShares) règle les DEUX
 * pourcentages et affiche, à chaque changement, l'effectif réel du
 * sous-groupe et sa part du TOUT — de sorte que 60 % puis 25 % se voit valoir
 * 15 %, jamais 85 %.
 *
 * La règle « on multiplie » est énoncée au pied du module, après que l'élève
 * l'a constatée sur trois réglages.
 */
export default function Module03UnPourcentageDePourcentage() {
  const [outer, setOuter] = useState(0.6);
  const [inner, setInner] = useState(0.25);
  const [seen, setSeen] = useState(() => new Set(['0.6|0.25']));
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const done1 = seen.size >= 3;

  const change = (o, i, react) => {
    setOuter(o); setInner(i);
    const next = new Set(seen); next.add(`${o}|${i}`); setSeen(next);
    if (!done1 && next.size >= 3) react?.(true);
  };

  const combined = nestedProportion(outer, inner);

  const steps = [
    {
      num: 1,
      title: 'Emboîte deux parts',
      subtitle: 'Règle la part des demi-pensionnaires, puis la part des internes PARMI eux. Trois réglages.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="60 % des élèves sont demi-pensionnaires ; 25 % d’entre eux sont internes. Quelle part des élèves du lycée sont internes ?"
            options={[
              { id: '85', label: '85 % (60 + 25)' },
              { id: '35', label: '35 % (60 − 25)' },
              { id: '25', label: '25 %' },
              { id: '15', label: 'Moins de 25 %' },
            ]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <NestedShares
            total={800} outer={outer} inner={inner}
            onChange={(o, i) => change(o, i, kit.react)}
          />
          {done1 ? (
            <Feedback tone="ok">
              {pred === '15' ? 'Ta prédiction tenait.' : pred ? 'La barre a tranché.' : 'Regarde la barre.'}{' '}
              Le sous-groupe est toujours <strong>plus petit que chacun</strong> des deux groupes : on prend une part
              <em> d’une part déjà réduite</em>. 60 % puis 25 % donne {formatPercent(0.15, 0)} du lycée —
              {' '}<strong>0,60 × 0,25 = 0,15</strong>. On <strong>multiplie</strong>, on n’additionne jamais.
            </Feedback>
          ) : null}
          {/* La barre vient de montrer, sur trois réglages, que le sous-groupe
              reste plus petit que chacun des deux groupes : la règle « on
              multiplie » se dit maintenant, avant que l'étape 2 ne demande à
              quel tout le produit se rapporte. */}
          {done1 && (
            <KnowledgeBrick
              id="proportion-de-proportion"
              variant="new"
              lead={<>Tu viens de régler trois emboîtements, et jamais la petite barre n’a dépassé la grande. C’est que les deux parts se <strong>multiplient</strong>.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">
              Réglages essayés : {seen.size} sur 3. Actuellement {formatPercent(outer, 0)} puis {formatPercent(inner, 0)} →
              {' '}<strong>{formatPercent(combined, 2)}</strong> du lycée.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'À quel tout se rapporte le résultat ?',
      done: q2,
      content: (
        <TapQuestion
          prompt="Dans un lycée, 40 % des élèves sont en seconde, et 15 % de ces secondes font du latin. Que représentent les 6 % obtenus par 0,40 × 0,15 ?"
          options={[
            'La part des latinistes parmi TOUS les élèves du lycée',
            'La part des latinistes parmi les élèves de seconde',
            'La part des élèves de seconde parmi les latinistes',
            'Le nombre de latinistes',
          ]}
          correct={0} cols={1}
          requires={['proportion-de-proportion', 'proportion-reference', 'vocab-part-tout', 'pourcentage']}
          explain="Le produit de deux proportions emboîtées se rapporte au tout de la PREMIÈRE : 6 % de tous les élèves du lycée sont des secondes latinistes. Parmi les secondes seuls, ils sont 15 %."
          explainWrong="15 % est déjà la part parmi les secondes. En multipliant par 0,40, on ramène cette part au lycée entier : 6 % de tous les élèves."
          solved={q2} onAnswered={() => setQ2(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Deux remises l’une après l’autre',
      done: q3,
      content: (
        <div className="space-y-3">
        {/* Le même emboîtement, mais sur des prix : ce qu'on garde après une
            remise est lui-même une part. On le pose avant de le faire calculer. */}
        <KnowledgeBrick
          id="methode-remises-successives"
          variant="new"
          compact
          lead={<>Une remise laisse une <strong>part du prix</strong> — et la remise suivante s’emboîte dedans, exactement comme les internes dans les demi-pensionnaires.</>}
        />
        <NumericQuestion
          prompt="Un manteau coûte 200 €. Le magasin annonce −30 %, puis −20 % de plus sur le prix déjà réduit. Quel est le prix final, en euros ?"
          requires={['methode-remises-successives', 'proportion-de-proportion', 'proportion-reference', 'pourcentage']}
          above={(revealed) => (
            <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-center">
              <MathText>{'$$200 \\times 0{,}70 \\times 0{,}80$$'}</MathText>
              {revealed && <p className="text-xs text-sky-700 mt-1">200 × 0,70 = 140, puis 140 × 0,80 = 112</p>}
            </div>
          )}
          expected={112} suffix="€"
          explain="−30 % laisse 70 % du prix, −20 % laisse 80 % du reste : 200 × 0,70 × 0,80 = 112 €. La remise totale est de 44 %, pas de 50 %."
          explainFor={(n) => (n === 100
            ? '−30 % puis −20 % ne fait pas −50 % : la seconde remise porte sur 140 €, pas sur 200 €. 200 × 0,7 × 0,8 = 112 €.'
            : n === 140
              ? 'C’est le prix après la PREMIÈRE remise seulement. Il reste à retirer 20 % de 140 : 140 × 0,80 = 112 €.'
              : 'Chaque remise s’applique au prix courant : 200 × 0,70 = 140, puis 140 × 0,80 = 112 €.')}
          solved={q3} onAnswered={() => setQ3(true)}
        />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX} navLinks={getNavLinks(3)} moduleNumber={3}
      moduleTitle="Un pourcentage de pourcentage" moduleSubtitle="Les parts emboîtées se multiplient" estimatedTime="11 min"
      brief={{
        tag: 'Découverte', title: '60 % puis 25 %, ça fait 15 %', tone: 'sky',
        body: <p>Quand une part se découpe à son tour, le second pourcentage ne porte pas sur le tout de départ : il porte sur ce qui reste. Règle les deux et regarde le sous-groupe.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>Attention au module suivant.</strong> Jusqu’ici, tous les « % » décrivaient un <em>état</em> :
          une part d’un tout. Il en existe d’autres qui décrivent un <em>changement</em> — et ils ne se lisent pas pareil.
        </KnowledgeSnapshot>
      )}
    />
  );
}
