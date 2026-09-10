import { Fragment } from 'react';
import MathText from '../../lessons/common/components/MathText';

/**
 * Le rendu d'un texte de contenu d'exercice : gras Markdown + mathématiques.
 *
 * Pourquoi ce composant existe plutôt qu'un élargissement de `MathText` :
 * celui-ci se limite volontairement à KaTeX, et son en-tête dit explicitement
 * « pour le gras, utilisez <strong> dans le JSX ». C'est le bon contrat quand
 * l'auteur écrit du JSX — mais le contenu de pratique est de la DONNÉE : un
 * fichier JSON ne peut pas contenir de balise. Il lui faut donc une marque, et
 * `**` est celle que les auteurs du dépôt écrivent déjà partout.
 *
 * MathText n'est pas modifié : 132 leçons en dépendent, et leur besoin est
 * exactement celui qu'il sert.
 */
export default function RichText({ children, className }) {
  if (typeof children !== 'string') return null;

  // Découpe sur **gras** en laissant les segments mathématiques intacts :
  // MathText reçoit chaque morceau et s'occupe des $…$ qu'il contient.
  const parts = children.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={i} className="font-bold text-slate-900">
              <MathText>{part.slice(2, -2)}</MathText>
            </strong>
          );
        }

        return <Fragment key={i}>{part ? <MathText>{part}</MathText> : null}</Fragment>;
      })}
    </span>
  );
}
