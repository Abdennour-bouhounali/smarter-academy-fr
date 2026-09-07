import React, { useState, useEffect, useRef } from 'react';
import { ContentModule, TapQuestion, KnowledgeBrick, PredictionChips } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { Feedback } from '../../../../../common/components/LessonUI';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import VirtualCompas from '../components/VirtualCompas';
import { dist } from '../components/constructionsUtils';

/**
 * Module 3 — MANIPULATION : le compas (P3, P5).
 *
 * ACTION          l'élève écarte les branches en tirant la mine, plante la
 *                 pointe ailleurs, puis fait pivoter la mine pour tracer.
 * TRANSFORMATION  l'écartement suit la mine ; déplacer la pointe ne le
 *                 change PAS ; l'arc balayé se dessine derrière la mine.
 * SENS MATH.      le compas ne mesure pas, il CONSERVE. Reporter une
 *                 longueur, c'est transporter un écartement sans le lire.
 * FEEDBACK        aucun nombre à viser : l'élève cale la mine sur le bout du
 *                 segment, et le voit ensuite atterrir ailleurs à l'identique.
 * GÉNÉRALISATION  faire un tour complet donne le cercle : l'ensemble des
 *                 points à écartement constant de la pointe.
 *
 * Aha : la pointe se déplace, l'écartement ne bouge pas. C'est ce qui rend
 * le report possible SANS jamais lire de graduation.
 *
 * Misconception visée : croire qu'il faut d'abord mesurer pour reporter, ou
 * que le compas ne sert qu'à tracer des cercles.
 *
 * ── CE QUE REMPLACE CE MODULE ─────────────────────────────────────────
 * L'ancienne version pilotait un `role="img"` avec un `<input type="range">`
 * et deux boutons `+` / `−` — interdits par la règle projet (jamais de
 * stepper pour une grandeur continue) — et se figeait dès le réglage validé
 * (`disabled={reglageDone}`), ce qu'interdit la règle « une manipulation ne
 * se fige jamais ». L'écartement est désormais la distance entre deux objets
 * que l'élève tient, et rien ne se verrouille.
 *
 * Briques et `requires` inchangés : reporter-au-compas à l'étape 1,
 * cercle-au-compas à l'étape 3.
 */

/* La scène : un segment de référence en haut, dont on reporte la longueur. */
const REF = { a: { x: 46, y: 34 }, b: { x: 154, y: 34 } };
const LONGUEUR = Math.round(dist(REF.a, REF.b));
const CENTRE_DEPART = { x: 96, y: 128 };
/* Tolérance du calage : l'élève cale à la main, pas au micron. */
const TOL = 4;

export default function Module03Compas() {
  /* Chaque étape porte DEUX acquis distincts : le geste et son
     interprétation. Ils sont suivis séparément pour qu'aucun ne fige
     l'autre — et parce que l'audit de connaissances ne lit que le littéral
     `steps` : questions et briques doivent donc vivre ici, jamais dans un
     sous-composant (docs/architecture/KNOWLEDGE_DEPENDENCY.md). */
  const [ecarte, setEcarte] = useState(false);
  const [reporte, setReporte] = useState(false);
  const [qReportDone, setQReportDone] = useState(false);
  const [tourne, setTourne] = useState(false);
  const [qCercleDone, setQCercleDone] = useState(false);

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(3)}
      moduleNumber={3}
      moduleTitle="Le compas"
      moduleSubtitle="Un écartement qui se conserve."
      estimatedTime="12 min"
      brief={{
        tag: '📋 Mission 03',
        title: 'Reporter une longueur sans jamais la lire.',
        body: (
          <p>
            Attrape la <strong>mine</strong> du compas et écarte-la jusqu’au bout du segment bleu.
            Puis déplace la <strong>pointe</strong> — et regarde ce que devient l’écartement.
          </p>
        ),
      }}
      steps={[
        {
          num: 1,
          title: 'Écarte le compas sur le segment',
          subtitle: 'Tire la mine jusqu’à ce que l’écartement couvre le segment bleu.',
          done: ecarte,
          content: (kit) => (
            <div className="space-y-4">
              {/* Jamais figé : l'élève continue d'ouvrir et de refermer. */}
              <ReglageLab
                acquis={ecarte}
                onAjuste={() => { kit.react?.(true); setEcarte(true); }}
              />
              {ecarte && (
                <KnowledgeBrick
                  id="reporter-au-compas"
                  variant="new"
                  lead="Ce réglage que tu viens de faire à la main est la première moitié d’un geste complet."
                />
              )}
            </div>
          ),
        },
        {
          num: 2,
          title: 'Plante la pointe ailleurs',
          subtitle: 'Sans toucher à la mine. L’écartement va-t-il suivre ?',
          done: reporte && qReportDone,
          content: (kit) => (
            <div className="space-y-4">
              <ReportLab
                onAssez={(n) => { if (!reporte) { kit.react?.(true); setReporte(true); } }}
                acquis={reporte}
              />
              <TapQuestion
                prompt="Sans toucher à l’écartement, on pointe le compas ailleurs. Quelle est la longueur reportée ?"
                options={[
                  'Exactement la même qu’au départ',
                  'Une longueur un peu différente',
                  'Impossible à savoir sans mesurer',
                ]}
                correct={0}
                cols={1}
                requires={['reporter-au-compas', 'instrument-garantit']}
                explain="C’est tout l’intérêt du compas : tant qu’on n’y touche pas, l’écartement est conservé. La longueur reportée est exactement la même — tu viens de le vérifier en déplaçant la pointe."
                explainWrong="Le compas ne se déforme pas en se déplaçant. C’est ce qui en fait l’instrument du REPORT — plus fiable que la lecture d’une graduation."
                solved={qReportDone}
                onAnswered={() => setQReportDone(true)}
              />
            </div>
          ),
        },
        {
          num: 3,
          title: 'Fais un tour complet',
          done: tourne && qCercleDone,
          content: (kit) => (
            <div className="space-y-4">
              <CercleLab
                onFerme={() => { if (!tourne) { kit.react?.(true); setTourne(true); } }}
                acquis={tourne}
              />
              <TapQuestion
                prompt="Pourquoi le compas trace-t-il naturellement un cercle ?"
                options={[
                  'Parce que tous les points tracés sont à la même distance du centre',
                  'Parce qu’il tourne',
                  'Parce que la mine est ronde',
                ]}
                correct={0}
                cols={1}
                requires={['reporter-au-compas']}
                explain="Le cercle EST l’ensemble des points à une même distance du centre. Le compas, qui conserve l’écartement, le dessine donc par construction."
                explainWrong="Ce n’est pas la rotation en elle-même : c’est le fait que l’écartement — donc la distance au centre — ne change jamais. Change l’écartement en cours de route, et le tracé cesse d’être un cercle."
                solved={qCercleDone}
                onAnswered={() => setQCercleDone(true)}
              />
              {qCercleDone && (
                <KnowledgeBrick
                  id="cercle-au-compas"
                  variant="new"
                  lead="Tracer un cercle et reporter une longueur sont donc le même geste."
                />
              )}
            </div>
          ),
        },
      ]}
      footer={
        <KnowledgeSnapshot moduleNumber={3}>
          <strong>La suite.</strong> Longueurs exactes, longueurs reportées : il te manque encore
          l’angle droit. C’est l’équerre, au module suivant.
        </KnowledgeSnapshot>
      }
    />
  );
}

/* ── Étape 1 — écarter les branches ────────────────────────────────────
   L'élève ne vise aucun nombre : il cale l'ouverture sur un objet. La
   longueur du segment n'est jamais annoncée — c'est tout l'intérêt. */
function ReglageLab({ acquis, onAjuste }) {
  const [centre, setCentre] = useState(CENTRE_DEPART);
  const [rayon, setRayon] = useState(30);
  const [angle, setAngle] = useState(-40);
  const [pred, setPred] = useState(null);

  const ajuste = Math.abs(rayon - LONGUEUR) <= TOL;
  const cb = useRef(onAjuste);
  cb.current = onAjuste;
  useEffect(() => { if (ajuste) cb.current(); }, [ajuste]);

  return (
    <div className="space-y-4">
      <PredictionChips
        prompt="pour reporter la longueur du segment ailleurs, que faut-il faire d’abord ?"
        options={[
          { id: 'mesurer', label: 'La mesurer à la règle' },
          { id: 'ecarter', label: 'Écarter le compas dessus' },
          { id: 'oeil', label: 'L’estimer à l’œil' },
        ]}
        value={pred}
        onChange={setPred}
        disabled={acquis}
      />

      <VirtualCompas
        centre={centre}
        onCentreChange={setCentre}
        rayon={rayon}
        onRayonChange={setRayon}
        angleDeg={angle}
        onAngleChange={setAngle}
        reference={REF}
        ariaLabel="Compas à écarter sur la longueur du segment bleu"
      />

      <Feedback tone={ajuste ? 'ok' : 'info'}>
        {ajuste ? (
          <>
            L’écartement couvre exactement le segment. Remarque ce que tu n’as{' '}
            <strong>pas</strong> fait : lire un nombre. La longueur est maintenant{' '}
            <em>portée par l’instrument</em>.
          </>
        ) : (
          <>
            Attrape la mine (le rond violet) et éloigne-la de la pointe jusqu’à ce que
            l’ouverture couvre le segment bleu.
          </>
        )}
      </Feedback>
    </div>
  );
}

/* ── Étape 2 — la surprise contrôlée ───────────────────────────────────
   L'élève déplace la POINTE. L'écartement ne bouge pas d'un pixel : la
   longueur a voyagé sans avoir jamais été lue. C'est l'expérience qui le
   dit, pas un texte. */
const CIBLES = [
  { x: 70, y: 150 },
  { x: 200, y: 96 },
  { x: 152, y: 156 },
];

function ReportLab({ acquis, onAssez }) {
  // Le compas arrive DÉJÀ réglé sur la longueur du segment : on ne rejoue
  // pas l'étape 1, on éprouve la conservation.
  const [centre, setCentre] = useState(CIBLES[0]);
  const [rayon, setRayon] = useState(LONGUEUR);
  const [angle, setAngle] = useState(0);
  const [vus, setVus] = useState([]);

  // Les positions de pointe distinctes déjà visitées : c'est le balayage qui
  // établit l'invariant, pas un seul déplacement.
  const noteCentre = (c) => {
    setCentre(c);
    setVus((v) => {
      const key = `${Math.round(c.x / 40)}-${Math.round(c.y / 40)}`;
      return v.includes(key) ? v : [...v, key];
    });
  };

  const assez = vus.length >= 3;
  const conserve = Math.abs(rayon - LONGUEUR) <= TOL;
  const cb = useRef(onAssez);
  cb.current = onAssez;
  useEffect(() => { if (assez) cb.current(vus.length); }, [assez, vus.length]);

  const mine = {
    x: centre.x + rayon * Math.cos((angle * Math.PI) / 180),
    y: centre.y + rayon * Math.sin((angle * Math.PI) / 180),
  };

  return (
    <div className="space-y-3">
      <VirtualCompas
        centre={centre}
        onCentreChange={noteCentre}
        rayon={rayon}
        onRayonChange={setRayon}
        angleDeg={angle}
        onAngleChange={setAngle}
        reference={REF}
        marks={conserve ? [{ ...mine, label: 'C' }] : []}
        ariaLabel="Compas réglé ; déplace la pointe pour reporter la longueur ailleurs"
      />

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-center text-sm text-slate-600">
        Endroits où tu as planté la pointe :{' '}
        <strong className="font-mono">{vus.length}</strong>
        {!assez && ' — plante-la encore ailleurs.'}
      </div>

      {assez && (
        <Feedback tone="ok">
          La pointe a changé de place {vus.length} fois, et l’écartement affiché n’a pas bougé.
          C’est cela, <strong>reporter</strong> : la longueur voyage avec l’instrument, sans qu’aucun
          nombre n’ait été lu. Un point C posé au bout de la mine est donc à la même distance de sa
          pointe que B l’est de A.
        </Feedback>
      )}
    </div>
  );
}

/* ── Étape 3 — le tour complet ─────────────────────────────────────────
   L'élève fait pivoter la mine et le cumul des degrés balayés se remplit.
   Le cercle n'est pas montré : il est PRODUIT par le geste, et il apparaît
   comme la trace de tous les points à écartement constant. */
function CercleLab({ acquis, onFerme }) {
  const [centre, setCentre] = useState({ x: 160, y: 105 });
  const [rayon, setRayon] = useState(58);
  const [angle, setAngle] = useState(0);
  const [swept, setSwept] = useState(0);
  const lastAngle = useRef(0);

  const pivote = (a) => {
    // Le cumul suit les degrés réellement parcourus, dans les deux sens :
    // on peut donc « revenir en arrière » et effacer son arc.
    let delta = a - lastAngle.current;
    while (delta > 180) delta -= 360;
    while (delta < -180) delta += 360;
    lastAngle.current = a;
    setAngle(a);
    setSwept((s) => Math.max(0, Math.min(360, s + delta)));
  };

  // Changer l'écartement en cours de route efface l'arc : un cercle n'a
  // qu'un seul rayon, et le laisser se déformer serait mathématiquement faux.
  const setR = (r) => {
    if (Math.abs(r - rayon) > 0.5) setSwept(0);
    setRayon(r);
  };

  const ferme = swept >= 359;
  const cb = useRef(onFerme);
  cb.current = onFerme;
  useEffect(() => { if (ferme) cb.current(); }, [ferme]);

  return (
    <div className="space-y-3">
      <VirtualCompas
        centre={centre}
        onCentreChange={setCentre}
        rayon={rayon}
        onRayonChange={setR}
        angleDeg={angle}
        onAngleChange={pivote}
        sweptDeg={swept}
        ariaLabel={`Fais tourner la mine autour de la pointe ; arc balayé ${Math.round(swept)} degrés`}
      />

      <Feedback tone={ferme ? 'ok' : 'info'}>
        {ferme ? (
          <>
            Tour complet. Chacun des points que la mine a laissés derrière elle était à{' '}
            <strong>la même distance</strong> de la pointe — parce que l’écartement n’a pas changé.
            C’est exactement ce qu’est un cercle.
          </>
        ) : (
          <>
            Fais tourner la mine autour de la pointe. Si tu modifies l’écartement en route, le tracé
            repart de zéro : un cercle n’a qu’un seul rayon.
          </>
        )}
      </Feedback>
    </div>
  );
}
