import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import MathText from '../../../../../common/components/MathText';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import CircleLab from '../components/CircleLab';
import { pointOf, fr } from '../components/trigoUtils';

/**
 * Module 1 — l'identité fondamentale, DÉCOUVERTE et non annoncée.
 *
 * Activité               promener le point et lire cos² + sin² à chaque position
 * Geste de l'élève       tourner, dans quatre positions très différentes
 * Observation attendue   la somme ne bouge pas : elle vaut 1, toujours
 * Obstacle visé          « encore une formule à retenir » — non : c'est
 *                        Pythagore, sur un triangle d'hypoténuse 1.
 */
export default function Module01PythagoreSurLeCercle() {
  const [t, setT] = useState(0.9);
  const [seen, setSeen] = useState([]);
  const [pred, setPred] = useState(null);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const quadrant = (v) => Math.floor(v / (Math.PI / 2)) % 4;
  const done1 = seen.length >= 4;
  const p = pointOf(t);
  const sum = p.x * p.x + p.y * p.y;

  const move = (v, react) => {
    setT(v);
    const q = quadrant(v);
    if (!seen.includes(q)) {
      const next = [...seen, q];
      setSeen(next);
      if (next.length === 4) react?.(true);
    }
  };

  const steps = [
    {
      num: 1,
      title: 'Une somme qui ne bouge jamais',
      subtitle: 'Promène le point dans les quatre quarts de tour. Le bandeau affiche cos²t + sin²t : regarde ce nombre.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="cos²t + sin²t va-t-il changer quand le point tourne ?"
            options={[{ id: 'non', label: 'Non, il reste constant' }, { id: 'oui', label: 'Oui, il varie' }, { id: 'zero', label: 'Il s’annule parfois' }]}
            value={pred} onChange={setPred} disabled={done1}
          />
          <CircleLab t={t} onChange={(v) => move(v, kit.react)} label="cos² + sin²" />
          <div className="rounded-xl border-2 border-amber-200 bg-amber-50 px-3 py-2 text-center font-mono text-sm text-amber-900">
            cos²t + sin²t = {fr(p.x)}² + {fr(p.y)}² = <strong data-testid="sum-value">{fr(sum, 3)}</strong>
          </div>
          {done1 ? (
            <>
              <Feedback tone="ok">
                {pred === 'non' ? 'Ta prédiction tenait' : 'Le bandeau est formel'} : la somme vaut
                <strong> 1</strong> partout, dans les quatre quarts de tour. Ce n’est pas une coïncidence —
                regarde le triangle rectangle sous le point : ses deux côtés mesurent |cos t| et |sin t|,
                et son hypoténuse est le <strong>rayon</strong>, donc 1.
              </Feedback>
              <KnowledgeBrick
                id="identite-fondamentale"
                variant="new"
                lead={<>Ce que tu viens de lire quatre fois de suite est une identité — vraie pour tout réel t, et déjà connue de toi sous un autre nom.</>}
              />
            </>
          ) : (
            <Feedback tone="info">Quarts de tour visités : {seen.length} sur 4.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'D’où vient cette identité ?',
      done: q2,
      content: () => (
        <div className="space-y-3">
          <TapQuestion
            prompt={<span>Pourquoi <MathText>{'$\\cos^2 t + \\sin^2 t = 1$'}</MathText> est-il vrai pour tout t ?</span>}
            options={[
              'C’est Pythagore : les côtés valent |cos t| et |sin t|, l’hypoténuse est le rayon 1',
              'C’est une convention de la trigonométrie',
              'Parce que cos t et sin t sont toujours positifs',
              'Parce que cos t + sin t = 1',
            ]}
            correct={0} cols={1}
            requires={['identite-fondamentale', 'triangle-rectangle', 'hypotenuse']}
            explain="Sous chaque point du cercle se cache un triangle rectangle : ses côtés de l’angle droit sont les deux projections, son hypoténuse est le rayon. Pythagore donne donc cos²t + sin²t = 1² = 1."
            explainWrong="Ce n’est ni une convention ni une somme simple : cos t + sin t ne vaut PAS 1 (essaie t = 0 : 1 + 0 = 1, mais t = π/4 donne 1,41). Ce sont bien les CARRÉS qui s’additionnent, par Pythagore."
            solved={q2} onAnswered={() => setQ2(true)}
          />
          {q2 && (
            <KnowledgeBrick
              id="mem-pythagore-deguise"
              variant="new"
              lead={<>Une identité de plus à retenir ? Non : une identité de moins, puisque tu la connais déjà.</>}
            />
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Retrouver une coordonnée',
      done: q3,
      content: () => (
        <div className="space-y-3">
          <KnowledgeBrick
            id="methode-retrouver-coordonnee"
            variant="new"
            lead={<>L’identité sert à quelque chose : elle permet de retrouver une coordonnée quand on connaît l’autre.</>}
          />
          <NumericQuestion
            prompt="On sait que cos t = 0,6 et que le point est au-dessus de l’axe horizontal. Combien vaut sin t ?"
            expected={0.8} suffix=""
            parse={(raw) => { const n = Number(String(raw).replace(',', '.')); return Number.isFinite(n) ? n : NaN; }}
            requires={['identite-fondamentale', 'methode-retrouver-coordonnee']}
            explain="sin²t = 1 − cos²t = 1 − 0,36 = 0,64, donc sin t = 0,8 ou −0,8. Le point étant AU-DESSUS de l’axe horizontal, son ordonnée est positive : sin t = 0,8."
            explainFor={(n) => (Math.abs(n + 0.8) < 0.01 ? 'La valeur absolue est juste, mais le signe non : le point est au-dessus de l’axe, donc son ordonnée est POSITIVE.'
              : Math.abs(n - 0.64) < 0.01 ? '0,64 est sin²t, pas sin t : il reste à prendre la racine carrée.'
              : Math.abs(n - 0.4) < 0.01 ? 'Tu as calculé 1 − 0,6. L’identité porte sur les CARRÉS : 1 − 0,6² = 1 − 0,36 = 0,64.'
              : 'sin²t = 1 − cos²t = 0,64, donc sin t = 0,8 (positif car le point est au-dessus de l’axe).')}
            solved={q3} onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Pourquoi « au-dessus » compte',
      done: q4,
      content: () => (
        <TapQuestion
          prompt={<span>Si on sait seulement que <MathText>{'$\\cos t = 0{,}6$'}</MathText>, combien de valeurs sin t peut-il prendre ?</span>}
          options={[
            'Deux : 0,8 et −0,8, selon que le point est au-dessus ou en dessous',
            'Une seule : 0,8',
            'Une infinité',
            'Aucune : il manque l’angle',
          ]}
          correct={0} cols={2}
          requires={['methode-retrouver-coordonnee', 'identite-fondamentale']}
          explain="Deux points du cercle ont pour abscisse 0,6 : l’un au-dessus de l’axe horizontal, l’autre en dessous. Ils sont symétriques, et leurs ordonnées sont opposées. L’identité donne la valeur absolue, jamais le signe — il faut une information de plus."
          explainWrong="L’identité donne sin²t, donc DEUX valeurs opposées possibles. C’est exactement ce qui fera qu’une équation trigonométrique aura, elle aussi, deux solutions par tour."
          solved={q4} onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(1)}
      moduleNumber={1}
      moduleTitle="Pythagore sur le cercle"
      moduleSubtitle="Un triangle rectangle caché sous chaque point"
      estimatedTime="18 min"
      brief={{
        tag: '📐 Mission 01',
        title: 'Une identité que tu connais déjà, sous un autre nom.',
        tone: 'indigo',
        body: <p>Promène le point et surveille un seul nombre : cos²t + sin²t. S’il ne bouge pas, c’est qu’il y a une raison — et elle date de la 4e.</p>,
      }}
      steps={steps}
      footer={(
        <KnowledgeSnapshot moduleNumber={1}>
          Une identité vraie pour tout t, et qui laisse un signe indéterminé. Au module suivant :
          que se passe-t-il quand on ADDITIONNE deux angles ?
        </KnowledgeSnapshot>
      )}
    />
  );
}
