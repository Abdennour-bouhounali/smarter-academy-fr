import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import ParametreLab, { T_MIN, T_MAX } from '../components/ParametreLab';
import {
  ORIENTATION_DEPART, droiteNom, pointDeParametre, lignesParametriques,
  parseSigned, fr, frVec3, v3,
} from '../components/planUtils';

/**
 * Module 4 — MANIPULATION : « Le paramètre qui parcourt » (P5).
 *
 * L'IDÉE QUE LE MODULE FAIT PRODUIRE : le paramètre n'est pas une lettre de
 * plus, c'est la POSITION le long de la droite. L'élève attrape un curseur et
 * le fait courir ; les trois coordonnées bougent ensemble, toujours du même
 * multiple de la direction.
 *
 * CONNAISSANCES AVANT LA DEMANDE :
 *   étape 1  faire courir le curseur, lire les trois coordonnées bouger
 *            ensemble → brique `representation-parametrique` (id du LEXIQUE)
 *            → puis les questions.
 *   étape 2  écrire les trois lignes d'une AUTRE droite
 *            → brique `methode-ecrire-parametrique` → puis la question.
 *   étape 3  le piège : deux coordonnées qui s'accordent ne suffisent pas.
 *
 * ATTEIGNABILITÉ. Les cibles du module sont t = 0, t = 0,5 et t = 1. Le cran
 * du curseur vaut un quart : les trois tombent EXACTEMENT dessus, et un test le
 * vérifie (components/ParametreLab.test.js). Le curseur dépasse en outre des
 * deux côtés, ce qui montre que la droite ne s'arrête pas — le dépassement est
 * mesuré à 34-46 unités d'écran, contre 135-183 pour le segment lui-même.
 *
 * LE GLISSER EST LE GESTE. Le curseur se saisit SUR LA DROITE, pas au bouton :
 * on ne « choisit » pas un point puis on l'avance aux flèches, on le tire.
 * Les boutons − / + et le clavier restent des chemins de secours complets.
 *
 * MANIPULATION JAMAIS GELÉE : `disabled` ne porte que l'antériorité.
 */

/** La droite de l'étape 1 : la grande diagonale, dont le milieu est le centre
 *  exact de la boîte — une cible remarquable et vérifiable. */
const D1 = droiteNom('A', 'G');
const MILIEU_D1 = pointDeParametre(D1, 0.5);
const LIGNES_D1 = lignesParametriques(D1);

/** La droite de l'étape 2 : une autre diagonale, dont une coordonnée DÉCROÎT.
 *  C'est ce signe moins que l'élève oublie de recopier. */
const D2 = droiteNom('B', 'H');
const LIGNES_D2 = lignesParametriques(D2);

/** La droite de l'étape 3 : son directeur a une coordonnée NULLE. La ligne
 *  « z = 0 + 0t » est celle qu'on omet, et l'omettre change tout. */
const D3 = droiteNom('A', 'C');
const LIGNES_D3 = lignesParametriques(D3);

/** Le point-piège : deux coordonnées s'accordent, la troisième non. CALCULÉ,
 *  et son refus est vérifié par un test. */
const PIEGE_D3 = v3(1, 1, 1);

export default function Module04LeParametreQuiParcourt() {
  const [o1, setO1] = useState(ORIENTATION_DEPART);
  const [t1, setT1] = useState(0);
  const [pred, setPred] = useState(null);
  const [visites, setVisites] = useState(() => new Set([0]));
  const [q1, setQ1] = useState(false);

  const [o2, setO2] = useState(ORIENTATION_DEPART);
  const [t2, setT2] = useState(0);
  const [q2, setQ2] = useState(false);

  const [o3, setO3] = useState(ORIENTATION_DEPART);
  const [t3, setT3] = useState(0);
  const [q3a, setQ3a] = useState(false);
  const [q3b, setQ3b] = useState(false);

  // A-t-il vu le curseur SORTIR du segment, des deux côtés ?
  const sorti = [...visites].some((t) => t < 0) && [...visites].some((t) => t > 1);
  const done1 = sorti && q1;
  const done2 = q2;
  const done3 = q3a && q3b;

  const bouger1 = (t, react) => {
    setT1(t);
    if (visites.has(t)) return;
    const suivant = new Set(visites);
    suivant.add(t);
    setVisites(suivant);
    react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Fais courir le point sur la droite',
      subtitle:
        'Attrape le point orange et tire-le le long de la droite. Sous la figure, un nombre et trois coordonnées. Va jusqu’au bout, des deux côtés.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="en tirant le point orange au-delà des deux pastilles rouges, que va-t-il se passer ?"
            options={[
              { id: 'arret', label: 'Il va s’arrêter : la droite se termine là' },
              { id: 'continue', label: 'Il va continuer : la droite se prolonge' },
              { id: 'saute', label: 'Il va revenir de l’autre côté' },
            ]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            La droite {D1.nom} est la grande diagonale de la boîte. Les deux pastilles rouges sont
            les points {D1.a} et {D1.b}, qui la définissent. Le point orange, lui, se{' '}
            <strong>promène</strong> : attrape-le et tire-le.
          </div>
          <ParametreLab
            orientation={o1}
            onOrientation={setO1}
            droite={D1}
            t={t1}
            onT={(t) => bouger1(t, kit.react)}
          />
          <div className="flex flex-wrap gap-2 text-[13px]">
            <span className={`px-2.5 py-1 rounded-lg font-semibold ${[...visites].some((t) => t < 0) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              {[...visites].some((t) => t < 0) ? '✓' : '○'} avant la première pastille
            </span>
            <span className={`px-2.5 py-1 rounded-lg font-semibold ${[...visites].some((t) => t > 1) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
              {[...visites].some((t) => t > 1) ? '✓' : '○'} après la seconde
            </span>
          </div>
          {!sorti && (
            <Feedback tone="info">
              Tire le point orange <strong>au-delà</strong> des deux pastilles rouges, d’un côté
              puis de l’autre — jusqu’à {fr(T_MIN)} et jusqu’à {fr(T_MAX)}. Le trait gris pointillé
              te montre où il peut aller.
            </Feedback>
          )}
          {sorti && (
            <>
              <Feedback tone="ok">
                {pred === 'continue' ? 'Ta prédiction tenait' : pred ? 'Ta prédiction ne tenait pas' : 'Le constat'} :
                la droite <strong>ne s’arrête pas</strong> aux deux points qui la définissent. Ces
                deux points ne sont là que pour dire d’où l’on part et dans quelle direction on va.
                Le nombre orange, lui, dit <strong>de combien</strong> on a avancé.
              </Feedback>
              <KnowledgeBrick
                id="representation-parametrique"
                variant="new"
                lead={<>Ce que le nombre orange est, et ce que les trois lignes disent. Refais courir le point en lisant.</>}
              />
              <NumericQuestion
                prompt={
                  <>
                    Place le point orange <strong>au centre exact de la boîte</strong>, en{' '}
                    <span className="font-mono">{frVec3(MILIEU_D1)}</span>. Quelle valeur le nombre
                    orange affiche-t-il alors ?
                  </>
                }
                expected={0.5}
                parse={parseSigned}
                display={fr(0.5)}
                requires={['representation-parametrique']}
                explain={`Le centre de la boîte est à mi-chemin entre ${D1.a} et ${D1.b} : on a avancé d’une DEMI fois la direction, donc le paramètre vaut ${fr(0.5)}. Les trois coordonnées valent alors ${frVec3(MILIEU_D1)}, chacune la moitié du chemin.`}
                explainFor={(n) => (
                  n === 1
                    ? `${fr(1)} amène au point ${D1.b}, tout au bout : on a avancé d’une fois ENTIÈRE la direction. Le centre est à mi-chemin.`
                    : n === 0
                    ? `${fr(0)} laisse le point sur ${D1.a}, le départ. Il n’a pas encore avancé du tout.`
                    : null
                )}
                solved={q1}
                onAnswered={() => setQ1(true)}
              />
            </>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Trois lignes, pas deux',
      subtitle:
        'Une autre diagonale, dont une coordonnée diminue quand les autres augmentent. Fais courir le point et lis les trois lignes en même temps.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            La droite {D2.nom} part de {D2.a} {frVec3(D2.A)} et va vers {D2.b}. Son vecteur
            directeur vaut <strong className="font-mono">{frVec3(D2.u)}</strong> : une de ses
            coordonnées est <strong>négative</strong>. Regarde ce que cela fait pendant que tu tires
            le point.
          </div>
          <ParametreLab
            orientation={o2}
            onOrientation={setO2}
            droite={D2}
            t={t2}
            onT={setT2}
            disabled={!done1}
          />
          <KnowledgeBrick
            id="methode-ecrire-parametrique"
            variant="new"
            lead={<>Comment écrire ces trois lignes soi-même, en quatre gestes. Vérifie chacun sur la figure.</>}
          />
          <TapQuestion
            prompt={`La droite ${D2.nom} passe par ${D2.a} ${frVec3(D2.A)} et a pour vecteur directeur ${frVec3(D2.u)}. Quelle est sa représentation paramétrique ?`}
            options={[
              LIGNES_D2.map((l) => l.texte).join(' ; '),
              lignesParametriques(D1).map((l) => l.texte).join(' ; '),
              lignesParametriques(droiteNom('H', 'B')).map((l) => l.texte).join(' ; '),
              lignesParametriques(D3).map((l) => l.texte).join(' ; '),
            ]}
            correct={0}
            cols={1}
            requires={['representation-parametrique', 'methode-ecrire-parametrique', 'coordonnees-vecteur-espace']}
            explain={`Chaque ligne prend la coordonnée du point de départ, puis lui ajoute le paramètre fois la coordonnée du vecteur directeur. Pour x : ${fr(D2.A.x)} et ${fr(D2.u.x)} donnent « ${LIGNES_D2[0].texte} ». Le signe moins ne s’oublie pas : sans lui, on décrirait une autre droite.`}
            explainWrong={`Vérifie en remplaçant t par 0 : tu dois retrouver le point de départ ${frVec3(D2.A)}. Puis t par 1 : tu dois retrouver ${frVec3(pointDeParametre(D2, 1))}, c’est-à-dire ${D2.b}. Une seule des quatre écritures passe les deux vérifications.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'La ligne qu’on oublie',
      subtitle:
        'Cette droite reste à la même hauteur : sa troisième ligne a un coefficient nul. Fais-la courir, et regarde ce que la troisième coordonnée fait.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <ParametreLab
            orientation={o3}
            onOrientation={setO3}
            droite={D3}
            t={t3}
            onT={setT3}
            disabled={!done2}
          />
          <TapQuestion
            prompt={`Un élève écrit la représentation de ${D3.nom} en deux lignes seulement : « ${LIGNES_D3[0].texte} ; ${LIGNES_D3[1].texte} ». Qu’a-t-il perdu ?`}
            options={[
              `L’information que la droite reste à la hauteur ${fr(D3.A.z)} : sans la troisième ligne, tous les points de hauteur quelconque conviendraient`,
              'Rien : la troisième ligne ne sert à rien puisque son coefficient est nul',
              'Le point de départ, qu’il faut réécrire à la fin',
              'Le sens de parcours de la droite',
            ]}
            correct={0}
            cols={1}
            requires={['representation-parametrique', 'methode-ecrire-parametrique']}
            explain={`« ${LIGNES_D3[2].texte} » n’est pas une ligne vide : elle dit que la troisième coordonnée vaut ${fr(D3.A.z)} POUR TOUT t. La supprimer laisserait cette coordonnée libre, et l’on décrirait alors un plan entier au lieu d’une droite.`}
            explainWrong="Fais courir le point et surveille la troisième coordonnée : elle ne bouge pas, mais elle a une valeur, et cette valeur est une contrainte. Un coefficient nul n’est pas une absence d’information — c’est l’information « cela ne change pas »."
            solved={q3a}
            onAnswered={() => setQ3a(true)}
          />
          {q3a && (
            <TapQuestion
              prompt={`Le point ${frVec3(PIEGE_D3)} appartient-il à la droite ${D3.nom} ?`}
              options={[
                `Non : les deux premières lignes donnent bien t = ${fr(0.5)}, mais la troisième refuse — elle impose une hauteur de ${fr(D3.A.z)}`,
                `Oui : les deux premières coordonnées s’accordent avec t = ${fr(0.5)}`,
                'Oui : ce point est le centre de la boîte, il est sur toutes les diagonales',
                'On ne peut pas le savoir sans faire courir le curseur jusque-là',
              ]}
              correct={0}
              cols={1}
              requires={['methode-ecrire-parametrique', 'representation-parametrique']}
              explain={`Le MÊME t doit convenir aux TROIS lignes. Ici x et y donnent tous deux ${fr(0.5)}, mais la troisième ligne impose ${fr(D3.A.z)} quel que soit t, et le point a pour hauteur ${fr(PIEGE_D3.z)}. Deux accords sur trois valent un refus.`}
              explainWrong={`Fais courir le curseur : à t = ${fr(0.5)} il atteint ${frVec3(pointDeParametre(D3, 0.5))}, et non ${frVec3(PIEGE_D3)}. Aucun t ne peut relever la troisième coordonnée, puisque son coefficient est nul.`}
              solved={q3b}
              onAnswered={() => setQ3b(true)}
            />
          )}
          {done3 && (
            <Feedback tone="ok">
              Tu sais écrire une droite de l’espace, et vérifier qu’un point y est. Il reste
              l’autre objet : le plan. Il se décrit lui aussi en une écriture — mais avec{' '}
              <strong>une seule</strong> ligne, pas trois.
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(4)}
      moduleNumber={4}
      moduleTitle="Le paramètre qui parcourt"
      moduleSubtitle="Un point de départ, une direction, et un curseur qu’on tire"
      estimatedTime="10 min"
      brief={{
        tag: 'Manipulation',
        title: 'Comment écrire une droite qu’on ne peut pas dessiner ?',
        tone: 'indigo',
        body: (
          <p>
            Deux points suffisent à la définir, mais elle ne s’arrête pas à eux. Attrape le point
            orange, tire-le, et regarde jusqu’où il va.
          </p>
        ),
      }}
      steps={steps}
      footer={
        <KnowledgeSnapshot moduleNumber={4}>
          <strong>Ce qui vient.</strong> Une droite tient en trois lignes. Un plan, lui, tient en
          une seule — et ses trois premiers coefficients ne sont pas des nombres quelconques.
        </KnowledgeSnapshot>
      }
    />
  );
}
