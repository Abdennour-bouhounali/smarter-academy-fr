import React, { useState } from 'react';
import { ContentModule, TapQuestion, PredictionChips, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import { VecName } from '../components/VectorScene';
import {
  SCENES, RANGE, equal, isZero, opposite, describeMove, formatVec, diagnose, DIAGNOSIS_TEXT,
} from '../components/vecteurUtils';

/**
 * Module 2 — DÉCOUVERTE : le même vecteur, partout où on le pose.
 *
 * Activity              promener une flèche sans changer son déplacement ;
 *                       la réduire à rien ; construire son opposé.
 * Mathematical objective un vecteur est le même objet où qu'on le dessine
 *                       (représentants, égalité) ; le vecteur nul ; l'opposé.
 * Student action        régler l'origine (mode 'move'), puis les composantes.
 * Controlled variable   une seule à chaque étape.
 * Mathematical state    une origine et un vecteur ; les flèches posées.
 * Visual consequence    la flèche voyage identique à elle-même ; un anneau
 *                       quand elle est nulle ; la flèche retournée.
 * Expected observation  « c'est toujours la même flèche ».
 * Misconception targeted croire que déplacer la flèche la change.
 * Formalization         notation u→ et AB→, représentant, égalité, 0→, −u→.
 *                       Les coordonnées restent en mots (« 3 vers la droite »).
 * Transfer              module 3 : deux nombres pour tout dire.
 */
const U = SCENES.u;
const START = { x: -5, y: -4 };
const TROP_PRES = 2;

export default function Module02LeMemeVecteur() {
  const [pred, setPred] = useState(null);
  const [origin, setOrigin] = useState(START);
  const [posed, setPosed] = useState([]);
  const [tropPres, setTropPres] = useState(false);
  const done1 = posed.length >= 3;

  const [v2, setV2] = useState({ x: 2, y: -1 });
  const done2 = isZero(v2);

  const [v3, setV3] = useState({ x: 1, y: 2 });
  const done3 = equal(v3, opposite(U));
  const why3 = diagnose(opposite(U), v3);

  const [q4, setQ4] = useState(false);

  const poser = (react) => {
    const proche = posed.some((p) => Math.hypot(p.x - origin.x, p.y - origin.y) < TROP_PRES);
    if (proche) { setTropPres(true); return; }
    setTropPres(false);
    setPosed((p) => [...p, { ...origin }]);
    react(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Promène la flèche',
      subtitle: 'Tu ne peux déplacer que son point de départ. Pose-la à trois endroits différents.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <PredictionChips
            prompt="Si je déplace cette flèche sans changer son déplacement, est-ce toujours le même vecteur ?"
            options={[{ id: 'oui', label: 'Oui, le même' }, { id: 'non', label: 'Non, il change' }, { id: 'depend', label: 'Seulement si elle reste parallèle à elle-même' }]}
            value={pred}
            onChange={setPred}
            disabled={done1}
          />
          <VectorLab
            origin={origin}
            vector={U}
            onOriginChange={setOrigin}
            mode="move"
            range={RANGE}
            names={{ origin: 'A', tip: 'B', vector: 'u' }}
            ghosts={posed.map((p, i) => ({ origin: p, vector: U, name: `${i + 1}` }))}
            showCoords={false}
            ariaLabel={`Flèche u partant de ${formatVec(origin)}, déplacement ${describeMove(U)}`}
          />
          <p className="text-sm text-slate-700" aria-live="polite">
            Déplacement : <strong>{describeMove(U)}</strong> — inchangé depuis le début.
          </p>
          {!done1 && (
            <button
              type="button"
              onClick={() => poser(kit.react)}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold min-h-[44px]"
            >
              Poser la flèche ici ({posed.length}/3)
            </button>
          )}
          {done1 ? (
            <Feedback tone="ok">
              {pred === 'oui' ? 'Ta prédiction : le même. Exact' : pred === 'non' ? 'Ta prédiction : il change. La figure te contredit' : pred === 'depend' ? 'Ta prédiction : si elle reste parallèle. C’est bien ce qui se passe ici — et c’est la définition' : 'Regarde'} :
              trois flèches, <strong>rigoureusement identiques</strong> — même direction, même sens,
              même longueur. Elles représentent le <strong>même vecteur</strong>, noté{' '}
              <VecName>u</VecName>. Chaque flèche en est un <strong>représentant</strong>.
            </Feedback>
          ) : null}
          {/* Les trois flèches posées viennent de montrer, en le voyant, que
              le déplacement ne change pas quand on le promène : l'égalité et
              le vocabulaire de représentant ont ici un sens concret. */}
          {done1 && (
            <KnowledgeBrick
              id="egalite-vecteurs"
              variant="new"
              lead={<>Tu viens de promener la même flèche à trois endroits sans jamais changer son déplacement.</>}
            />
          )}
          {done1 && (
            <KnowledgeBrick
              id="vocab-representant"
              variant="new"
              compact
              lead={<>Chacune des trois flèches que tu viens de poser en est un exemple.</>}
            />
          )}
          {!done1 && (
            <Feedback tone="info">
              Flèche en {formatVec(origin)}.
              {tropPres ? ' Trop près d’une flèche déjà posée : éloigne-toi pour bien voir les deux.' : ' Pose-la, puis déplace-la ailleurs.'}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Fais disparaître la flèche',
      subtitle: 'Cette fois, tu règles le déplacement. Réduis-le jusqu’à ce qu’il n’y ait plus de flèche.',
      done: done2,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={{ x: 1, y: 1 }}
            vector={v2}
            onVectorChange={(nv) => { setV2(nv); if (isZero(nv)) kit.react(true); }}
            mode="build"
            range={RANGE}
            names={{ origin: 'A', tip: 'A′', vector: 'AA′' }}
            showCoords={false}
            ariaLabel={`Flèche de A à A′, déplacement ${describeMove(v2)}`}
          />
          <p className="text-sm text-slate-700" aria-live="polite">Déplacement : <strong>{describeMove(v2)}</strong>.</p>
          {done2 ? (
            <Feedback tone="ok">
              A′ est revenu sur A : la flèche est devenue un point (l’anneau). Ce déplacement qui ne
              déplace rien est le <strong>vecteur nul</strong>, noté <VecName>0</VecName>. Pour tout
              point A, <VecName>AA</VecName> = <VecName>0</VecName>.
            </Feedback>
          ) : null}
          {/* A′ vient de revenir sur A sous les yeux de l'élève : le vecteur
              nul est ce point-flèche qu'il vient d'obtenir. */}
          {done2 && (
            <KnowledgeBrick
              id="vecteur-nul"
              variant="new"
              lead={<>Tu viens de réduire le déplacement jusqu’à ce que A′ revienne exactement sur A.</>}
            />
          )}
          {!done2 && (
            <Feedback tone="info">Amène les deux réglages à 0.</Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Construis le retour',
      subtitle: 'La flèche grise est u. Règle la flèche violette pour qu’elle soit le trajet inverse.',
      done: done3,
      content: (kit) => (
        <div className="space-y-3">
          <VectorLab
            origin={{ x: 3, y: 3 }}
            vector={v3}
            onVectorChange={(nv) => { setV3(nv); if (equal(nv, opposite(U))) kit.react(true); }}
            mode="build"
            range={RANGE}
            names={{ origin: 'B', tip: 'A', vector: 'BA' }}
            ghosts={[{ origin: { x: -4, y: 0 }, vector: U, name: 'u' }]}
            showCoords={false}
            ariaLabel={`Flèche de B à A, déplacement ${describeMove(v3)}`}
          />
          <p className="text-sm text-slate-700" aria-live="polite">Déplacement : <strong>{describeMove(v3)}</strong>.</p>
          {done3 ? (
            <Feedback tone="ok">
              {describeMove(opposite(U))} : même direction et même longueur que <VecName>u</VecName>,
              sens contraire. C’est le <strong>vecteur opposé</strong>, noté −<VecName>u</VecName>.
              Et pour deux points, <VecName>BA</VecName> = −<VecName>AB</VecName>.
            </Feedback>
          ) : null}
          {/* La flèche violette vient d'être construite comme le retour
              exact de u : l'opposé est ce que l'élève tient déjà sous les
              yeux, pas une définition à mémoriser à froid. */}
          {done3 && (
            <KnowledgeBrick
              id="regle-vecteur-oppose"
              variant="new"
              lead={<>Tu viens de construire le trajet <strong>retour</strong> de u.</>}
            />
          )}
          {!done3 && (
            <Feedback tone="info">
              {equal(v3, U) ? 'Tu as reconstruit u lui-même : le retour va dans l’autre sens.' : (DIAGNOSIS_TEXT[why3] ?? 'Continue.')}
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Combien de représentants ?',
      done: q4,
      content: (
        <TapQuestion
          prompt="Un vecteur non nul est donné. Combien de flèches peuvent le représenter ?"
          options={[
            'Une infinité : une par point de départ possible.',
            'Une seule : celle qui part de l’origine du repère.',
            'Deux : l’aller et le retour.',
            'Autant que de cases du sol, mais pas plus.',
          ]}
          correct={0}
          cols={1}
          requires={['egalite-vecteurs', 'vocab-representant', 'vecteur-nul', 'regle-vecteur-oppose']}
          explain="Choisis n’importe quel point de départ, trace le déplacement : tu obtiens un représentant du même vecteur. Il y en a donc une infinité — et le retour, lui, représente un AUTRE vecteur, l’opposé."
          explainWrong="Tu viens de poser trois flèches identiques à trois endroits, et tu aurais pu continuer indéfiniment : chaque point de départ donne un représentant."
          solved={q4}
          onAnswered={() => setQ4(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Le même vecteur"
      moduleSubtitle="Une flèche qui voyage sans changer"
      estimatedTime="8 min"
      brief={{
        tag: 'Découverte',
        title: 'Un objet qui n’a pas d’adresse',
        tone: 'violet',
        body: (
          <p>
            La recette du robot s’appelle maintenant un <strong>vecteur</strong>. Ici, tu ne peux pas
            la modifier : seulement l’endroit d’où part la flèche. Regarde ce qui reste identique.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
