import React, { useState } from 'react';
import { Compass, MoveHorizontal, Ruler } from 'lucide-react';
import { ContentModule, BatchChoiceQuestion, TapQuestion } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VectorLab from '../components/VectorLab';
import {
  RANGE, attributesOf, formatVec, opposite,
} from '../components/vectorUtils';

/**
 * Module 2 — DÉCOUVERTE : isoler les trois attributs.
 *
 * Activity              comparer une flèche de référence à trois variantes.
 * Mathematical objective séparer direction, sens et longueur — trois choses
 *                       qu'on confond spontanément.
 * Student action        régler une variante et lire le tableau des trois
 *                       attributs.
 * Controlled variable   une composante à la fois.
 * Mathematical state    deux vecteurs et le triplet renvoyé par `attributesOf`.
 * Visual consequence    trois voyants, allumés indépendamment.
 * Expected observation  « on peut avoir la même direction sans le même sens ».
 * Misconception ciblée   croire que « direction » englobe le sens — la langue
 *                       courante dit « dans l'autre direction » pour un
 *                       demi-tour, ce que la géométrie appelle un autre SENS.
 * Feedback              chaque attribut est jugé séparément.
 * Formalization         l'étape 3 nomme le vecteur opposé.
 */
const REF = { dx: 3, dy: 2 };
const ORIGINE = { x: -4, y: -2 };

export default function Module02DirectionSensLongueur() {
  const [v, setV] = useState({ dx: 3, dy: 2 });
  const [seen, setSeen] = useState(new Set());
  const a = attributesOf(REF, v);

  /* On veut que l'élève PRODUISE les trois cas intéressants. */
  const record = (nv) => {
    const at = attributesOf(REF, nv);
    let bucket = null;
    if (at.direction && !at.sens) bucket = 'oppose';
    else if (at.direction && at.sens && !at.longueur) bucket = 'longueur';
    else if (!at.direction) bucket = 'autreDirection';
    if (bucket) setSeen((s) => (s.has(bucket) ? s : new Set([...s, bucket])));
  };
  const done1 = seen.size >= 3;

  const [batch, setBatch] = useState(false);
  const [q3, setQ3] = useState(false);

  const Lamp = ({ on, label }) => (
    <div className={`flex-1 min-w-[110px] rounded-xl border-2 p-2 text-center ${
      on ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'
    }`}>
      <p className="text-xs font-semibold text-slate-600">{label}</p>
      <p className={`text-sm font-bold ${on ? 'text-emerald-700' : 'text-slate-500'}`}>
        {on ? 'identique' : 'différent'}
      </p>
    </div>
  );

  const steps = [
    {
      num: 1,
      title: 'Trois façons de différer',
      subtitle: 'Obtiens tour à tour : le sens contraire, une autre longueur, une autre direction.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            La flèche grise est la référence {formatVec(REF)}. Règle la tienne et regarde les trois
            voyants : ils jugent chacun <strong>un seul</strong> attribut.
          </p>
          <VectorLab
            origin={ORIGINE}
            vector={v}
            onVectorChange={(nv) => {
              setV(nv);
              record(nv);
              if (seen.size >= 2) kit.react(true);
            }}
            mode="build"
            range={RANGE}
            ghosts={[{ origin: ORIGINE, vector: REF, label: 'référence' }]}
            showImage={false}
            disabled={done1}
            ariaLabel="Compare ta flèche à la flèche de référence"
          />
          <div className="flex gap-2 flex-wrap">
            <Lamp on={a.direction} label="Direction" />
            <Lamp on={a.sens} label="Sens" />
            <Lamp on={a.longueur} label="Longueur" />
          </div>
          {done1 ? (
            <Feedback tone="ok">
              Tu as produit les trois cas. Le plus surprenant :{' '}
              <strong>{formatVec(opposite(REF))}</strong> a la <em>même direction</em> que la
              référence et la <em>même longueur</em> — seul le sens change. En géométrie,
              « direction » désigne la droite suivie, pas le côté vers lequel on va.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Cas trouvés : {seen.size} sur 3. À obtenir : le sens contraire (essaie{' '}
              {formatVec(opposite(REF))}), une longueur différente dans le même sens, et une autre
              direction.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Quatre comparaisons',
      subtitle: 'Toujours par rapport à la référence (3 ; 2).',
      done: batch,
      content: (
        <BatchChoiceQuestion
          intro={
            <p className="text-sm text-slate-700">
              Pour chaque déplacement, dis ce qui le distingue de la référence {formatVec(REF)}.
            </p>
          }
          rows={[
            {
              id: 'c1', label: '(−3 ; −2)',
              options: ['Sens contraire', 'Autre direction', 'Autre longueur'],
              correct: 0,
              correction: 'Même droite suivie et même longueur, mais on la parcourt à l’envers : c’est le vecteur opposé.',
            },
            {
              id: 'c2', label: '(6 ; 4)',
              options: ['Autre longueur, même sens', 'Sens contraire', 'Autre direction'],
              correct: 0,
              correction: '(6 ; 4) c’est deux fois (3 ; 2) : même direction, même sens, mais deux fois plus long.',
            },
            {
              id: 'c3', label: '(2 ; 3)',
              options: ['Autre direction', 'Sens contraire', 'Identique'],
              correct: 0,
              correction: 'Les composantes sont échangées : la droite suivie n’est plus la même. Attention, (3 ; 2) et (2 ; 3) sont deux déplacements différents.',
            },
            {
              id: 'c4', label: '(3 ; 2)',
              options: ['Identique', 'Sens contraire', 'Autre longueur'],
              correct: 0,
              correction: 'Mêmes composantes : c’est exactement le même déplacement, où qu’on le dessine.',
            },
          ]}
          feedback={({ allRight, nCorrect, total }) => (
            <Feedback tone={allRight ? 'ok' : 'info'}>
              {allRight
                ? 'Tu distingues bien les trois attributs — y compris le piège des composantes échangées.'
                : `${nCorrect} sur ${total}. Compare toujours dans l’ordre : même droite ? même côté ? même longueur ?`}
            </Feedback>
          )}
          solved={batch}
          onAnswered={() => setBatch(true)}
        />
      ),
    },
    {
      num: 3,
      title: 'Le déplacement opposé',
      done: q3,
      content: (
        <TapQuestion
          prompt="Un drone se déplace de (5 ; −1). Quel déplacement le ramène exactement à son point de départ ?"
          options={['(−5 ; 1)', '(5 ; 1)', '(−5 ; −1)', '(1 ; −5)']}
          correct={0}
          cols={4}
          explain="Pour revenir, il faut refaire le trajet à l’envers : chaque composante change de signe. (5 ; −1) puis (−5 ; 1) ramène bien au point de départ, car les deux se compensent."
          explainWrong="Il faut changer le signe des DEUX composantes. En n’en changeant qu’une, on obtient une autre direction, et le drone n’est pas revenu chez lui."
          solved={q3}
          onAnswered={() => setQ3(true)}
        />
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Direction, sens, longueur"
      moduleSubtitle="Trois attributs, jugés séparément"
      estimatedTime="9 min"
      brief={{
        tag: 'Découverte',
        title: 'Décomposer un déplacement',
        tone: 'sky',
        body: (
          <p>
            Un trajet, ce n’est pas une seule information mais <strong>trois</strong>. Tant qu’on ne
            les sépare pas, on confond « aller dans l’autre sens » et « aller ailleurs ».
          </p>
        ),
      }}
      intro={
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: Compass, t: 'Direction', d: 'La droite que l’on suit.', c: 'text-sky-600' },
            { icon: MoveHorizontal, t: 'Sens', d: 'De quel côté on la parcourt.', c: 'text-violet-600' },
            { icon: Ruler, t: 'Longueur', d: 'De combien on avance.', c: 'text-emerald-600' },
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
      footer={
        <Feedback tone="ok">
          <strong>Retenons.</strong> Deux déplacements sont identiques s’ils ont la même direction,
          le même sens et la même longueur. Le déplacement <strong>opposé</strong> garde la
          direction et la longueur, mais inverse le sens : ses deux composantes changent de signe.
        </Feedback>
      }
    />
  );
}
