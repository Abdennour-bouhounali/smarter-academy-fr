import React, { useMemo, useState } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import SecanteLab from '../components/SecanteLab';
import TrierAnglesLab from '../components/TrierAnglesLab';
import {
  droite, configuration, sontAlternesInternes, sontCorrespondants,
} from '../components/angles';
import { fr } from '../../../../../common/geo5e/geo5e';

/**
 * Module 2 — DÉCOUVERTE : situer les angles.
 *
 * Ce module apporte le VOCABULAIRE DE POSITION, et rien d'autre. Aucune
 * égalité n'y est affirmée : les droites y sont volontairement NON parallèles,
 * pour que l'élève ne puisse pas confondre « alternes-internes » (une position)
 * avec « égaux » (une conséquence, qui arrive au module 3 et seulement si les
 * droites sont parallèles).
 *
 * C'est une précaution délibérée contre la confusion la plus tenace du
 * chapitre : croire que « alternes-internes » veut dire « égaux ».
 *
 * Expected observation : « ces deux mots décrivent OÙ sont les angles, pas
 * combien ils mesurent ».
 * Misconception targeted : confondre position et égalité ; croire que deux
 * angles du même croisement peuvent être alternes-internes.
 */
const D1 = droite({ x: 390, y: 165 }, 4);
const D2_OBLIQUE = droite({ x: 390, y: 360 }, 21);   // NON parallèles, exprès
// La MÊME direction que D1 : le parallélisme est ici exact, pas approché
// (angles.js compare des directions, pas des pixels).
const D2_PARALLELE = droite({ x: 390, y: 360 }, 4);
const SEC = droite({ x: 390, y: 262 }, 64);

export default function Module02LaSecanteEtSesHuitAngles() {
  const [sec, setSec] = useState(SEC);
  const [vu, setVu] = useState(false);
  const [scoreTri, setScoreTri] = useState(null);
  const [q3, setQ3] = useState(false);

  // La bascule du module : la MÊME position d'angles, sur deux figures dont
  // l'une seulement est parallèle. C'est elle qui montre que le nom décrit une
  // POSITION, et que l'égalité, elle, dépend du parallélisme.
  const [paralleles, setParalleles] = useState(false);
  const d2 = paralleles ? D2_PARALLELE : D2_OBLIQUE;

  const config = useMemo(() => configuration(D1, d2, sec), [d2, sec]);

  // Les paires canoniques, LUES sur la configuration — jamais codées en dur.
  const paireAlt = useMemo(() => {
    const x = config.angles.find((a) => a.sommet === 'A' && a.interieur);
    const y = config.angles.find((a) => sontAlternesInternes(x, a));
    return [x.id, y.id];
  }, [config]);

  const paireCorr = useMemo(() => {
    const x = config.angles.find((a) => a.sommet === 'A');
    const y = config.angles.find((a) => sontCorrespondants(x, a));
    return [x.id, y.id];
  }, [config]);

  const [quelle, setQuelle] = useState('alt');
  const paire = quelle === 'alt' ? paireAlt : paireCorr;

  // Les deux mesures RÉELLEMENT affichées, lues sur la configuration courante :
  // le texte du feedback ne peut donc pas contredire la figure.
  const mesures = paire.map((id) => config.angles.find((a) => a.id === id).mesure);
  const egaux = Math.abs(mesures[0] - mesures[1]) < 0.6;

  const steps = [
    {
      num: 1,
      title: 'Huit angles autour de deux points',
      subtitle: 'Fais pivoter la sécante et regarde les huit mesures suivre.',
      done: vu,
      content: (kit) => (
        <div className="space-y-3">
          <SecanteLab
            d1={D1}
            d2={d2}
            s={sec}
            onS={(v) => { setSec(v); if (!vu) { setVu(true); kit.react?.(true); } }}
            montrer="tous"
            montrerEcart={false}
            montrerMarquesParalleles={false}
            ariaLabel="Deux droites coupées par une sécante, et les huit angles formés"
          />
          {vu ? (
            <Feedback tone="ok">
              Huit angles : <strong>quatre autour de A</strong>, quatre autour de B. Ils changent
              tous quand tu inclines la sécante — mais ils restent toujours{' '}
              <strong>huit</strong>, et autour de chaque point ils font <strong>360°</strong> en tout.
            </Feedback>
          ) : (
            <Feedback tone="info">
              Traîne la poignée orange pour incliner la sécante. Observe : combien d’angles y a-t-il
              autour de chaque point de croisement ?
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'Deux positions qui ont un nom',
      subtitle: 'Regarde où se placent les deux angles mis en couleur.',
      done: vu,
      content: (
        <div className="space-y-3">
          <div className="flex gap-2 justify-center">
            {[
              { id: 'alt', label: 'Alternes-internes', c: 'violet' },
              { id: 'corr', label: 'Correspondants', c: 'sky' },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setQuelle(o.id)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
                  quelle === o.id
                    ? o.c === 'violet'
                      ? 'border-violet-500 bg-violet-600 text-white'
                      : 'border-sky-500 bg-sky-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* La seconde bascule : la MÊME paire d'angles, sur deux figures.
              L'élève voit que le NOM ne change pas, mais que l'égalité, elle,
              n'apparaît que dans un seul des deux cas. */}
          <div className="flex gap-2 justify-center">
            {[
              { id: false, label: '∦ non parallèles' },
              { id: true, label: '∥ parallèles' },
            ].map((o) => (
              <button
                key={String(o.id)}
                type="button"
                onClick={() => setParalleles(o.id)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition ${
                  paralleles === o.id
                    ? 'border-emerald-500 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          <SecanteLab
            d1={D1}
            d2={d2}
            s={sec}
            onS={setSec}
            montrer="paire"
            paire={paire}
            couleurPaire={quelle === 'alt' ? '#7c3aed' : '#0ea5e9'}
            montrerEcart={false}
            montrerMarquesParalleles={paralleles}
            ariaLabel={quelle === 'alt' ? 'Deux angles alternes-internes' : 'Deux angles correspondants'}
          />

          {quelle === 'alt' ? (
            <KnowledgeBrick
              id="angles-alternes-internes"
              variant="new"
              lead={<>Les deux angles en couleur sont tous deux <em>entre</em> les droites, et de part et d’autre de la sécante. Cette position-là porte un nom.</>}
            />
          ) : (
            <KnowledgeBrick
              id="angles-correspondants"
              variant="new"
              lead={<>Ces deux-là occupent la <em>même case</em> à chacun des deux croisements : en haut à droite ici, en haut à droite là-bas.</>}
            />
          )}

          {/* LE POINT CRUCIAL du module : le NOM ne change pas d'une figure à
              l'autre, mais l'égalité, elle, n'apparaît que si les droites sont
              parallèles. Les mesures citées sont lues sur la figure. */}
          {egaux ? (
            <Feedback tone="ok">
              Ici les deux angles sont <strong>égaux</strong> ({fr(mesures[0], 0)}° tous les deux) —
              parce que les droites sont parallèles. Repasse en{' '}
              <strong>« non parallèles »</strong> : ils porteront{' '}
              <em>toujours le même nom</em>, mais leurs mesures se sépareront.
            </Feedback>
          ) : (
            <Feedback tone="ko">
              <strong>Regarde leurs mesures : {fr(mesures[0], 0)}° et {fr(mesures[1], 0)}° — elles
              sont différentes !</strong> Et pourtant ces deux angles portent bien le nom
              ci-dessus : ces mots décrivent seulement <strong>où</strong> se trouvent les angles,
              jamais combien ils mesurent.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 3,
      title: 'Sais-tu les reconnaître ?',
      done: scoreTri !== null && scoreTri >= 4,
      content: (kit) => (
        <div className="space-y-3">
          <TrierAnglesLab
            onFini={(n) => { setScoreTri(n); kit.react?.(n >= 4); }}
            ariaLabel="Classer des paires d’angles : alternes-internes, correspondants, ou ni l’un ni l’autre"
          />
          {scoreTri !== null && (
            scoreTri >= 4 ? (
              <Feedback tone="ok">
                {scoreTri} sur 5. Tu situes les angles sans hésiter — c’est exactement ce qu’il
                fallait avant de parler de leurs mesures.
              </Feedback>
            ) : (
              <Feedback tone="ko">
                {scoreTri} sur 5. Deux repères sûrs : les <strong>alternes-internes</strong> forment
                un <strong>Z</strong> (tous deux entre les droites, de part et d’autre de la
                sécante) ; les <strong>correspondants</strong> forment un <strong>F</strong> (même
                case aux deux croisements). Et dans les deux cas, il en faut{' '}
                <strong>un à chaque croisement</strong>.
              </Feedback>
            )
          )}
        </div>
      ),
    },
    {
      num: 4,
      title: 'Position n’est pas égalité',
      done: q3,
      content: (
        <div className="space-y-3">
          <TapQuestion
            prompt="Deux angles sont alternes-internes. Sont-ils forcément égaux ?"
            options={[
              'Non : seulement si les deux droites sont parallèles',
              'Oui, toujours : c’est la définition',
              'Non, jamais',
            ]}
            correct={0}
            cols={1}
            requires={['angles-alternes-internes']}
            explain="« Alternes-internes » ne dit que la POSITION. Tu l’as vu en basculant : le nom des deux angles ne change pas d’une figure à l’autre, mais leurs mesures ne se rejoignent que dans le cas parallèle. L’égalité est donc une conséquence du parallélisme, pas de la position."
            explainWrong="Reviens à l’étape 2 et repasse en « non parallèles » : les deux angles portent toujours le même nom, et pourtant leurs mesures diffèrent. Ce qui manque alors, c’est le parallélisme des deux droites."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
          {q3 && (
            <Feedback tone="info">
              Tu as entrevu la réponse en basculant. Le module suivant l’installe pour de bon :{' '}
              <strong>à quelle condition exacte ces angles deviennent-ils égaux</strong>, et
              qu’est-ce que cela permet ?
            </Feedback>
          )}
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="La sécante et ses huit angles"
      moduleSubtitle="Savoir où sont les angles, avant de parler de leur mesure"
      estimatedTime="12 min"
      brief={{
        tag: 'Découverte',
        title: 'Huit angles, deux noms à retenir',
        tone: 'indigo',
        body: (
          <p>
            La sécante a fait apparaître huit angles. Avant de s’en servir, il faut savoir{' '}
            <strong>les situer</strong> : deux positions particulières vont revenir sans cesse dans
            toute la géométrie.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
