import React, { useState } from 'react';
import { ContentModule, TapQuestion, NumericQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { Feedback } from '../../../../../common/components/LessonUI';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import {
  puissance, ecrirePuissance, produitEcrit, dixPuissanceEcrit, GRANDEURS, parseEntier,
} from '../components/puissances';

/**
 * Module 5 — MANIPULATION : les puissances de 10.
 *
 * Activity              faire varier l'exposant de 10 et compter les zéros qui
 *                       apparaissent.
 * Mathematical objective 10ⁿ s'écrit « 1 suivi de n zéros » — parce que chaque
 *                       facteur 10 ajoute un rang.
 * Student action        choisir l'exposant.
 * Visual consequence    le nombre s'allonge d'un zéro par cran, en face du
 *                       produit écrit qui s'allonge d'un facteur.
 * Expected observation  « il y a exactement autant de zéros que de facteurs 10 ».
 * Misconception targeted compter le 1 du début comme un zéro, ou confondre
 *                       l'exposant avec le nombre de chiffres.
 *
 * PÉRIMÈTRE : exposants POSITIFS uniquement. Ni exposant négatif, ni écriture
 * scientifique — objets de 4e (lesson.config.js § exclude). Le noyau lève sur
 * un exposant négatif, la manipulation ne peut donc pas en produire.
 */
const EXPOSANTS = [1, 2, 3, 4, 5, 6];

export default function Module05LesPuissancesDeDix() {
  const [e, setE] = useState(1);
  const [vus, setVus] = useState(() => new Set([1]));
  const done1 = vus.size >= 4;

  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);
  const [q4, setQ4] = useState(false);

  const choisir = (v, react) => {
    setE(v);
    const next = new Set(vus);
    next.add(v);
    setVus(next);
    if (next.size >= 4 && vus.size < 4) react?.(true);
  };

  const steps = [
    {
      num: 1,
      title: 'Compte les zéros',
      subtitle: 'Change l’exposant et regarde le nombre de zéros. Essaie au moins quatre exposants.',
      done: done1,
      content: (kit) => (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Choisir l’exposant">
              {EXPOSANTS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => choisir(v, kit.react)}
                  aria-pressed={v === e}
                  data-exposant={v}
                  className={[
                    'min-h-[44px] min-w-[52px] rounded-xl border-2 font-mono font-bold tabular-nums transition-colors',
                    v === e
                      ? 'border-emerald-500 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400',
                  ].join(' ')}
                >
                  {ecrirePuissance(10, v)}
                </button>
              ))}
            </div>

            {/* Les trois écritures en regard, chacune dans sa cellule : rien
                n'est posé sur un dessin, donc rien ne peut se chevaucher. */}
            <div className="space-y-2">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-center overflow-x-auto">
                <div className="text-[11px] uppercase tracking-wide text-slate-500">Les facteurs</div>
                <div className="font-mono text-sm text-slate-700 whitespace-nowrap">{produitEcrit(10, e)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 px-3 py-2 text-center">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-700">Facteurs 10</div>
                  <output className="font-mono text-2xl font-black text-emerald-800" data-facteurs={String(e)}>{e}</output>
                </div>
                <div className="rounded-xl bg-emerald-50 border-2 border-emerald-200 px-3 py-2 text-center">
                  <div className="text-[11px] uppercase tracking-wide text-emerald-700">Zéros</div>
                  <output className="font-mono text-2xl font-black text-emerald-800" data-zeros={String(e)}>{e}</output>
                </div>
              </div>
              <div className="rounded-xl bg-slate-900 px-3 py-2.5 text-center overflow-x-auto">
                <output className="font-mono text-2xl font-black text-emerald-300 whitespace-nowrap" data-valeur={String(puissance(10, e))}>
                  {dixPuissanceEcrit(e)}
                </output>
              </div>
            </div>
          </div>
          {done1 ? (
            <Feedback tone="ok">
              À chaque fois, le nombre de <strong>zéros</strong> est exactement le nombre de{' '}
              <strong>facteurs 10</strong>. Ce n’est pas une coïncidence : chaque fois qu’on
              multiplie par 10, tous les chiffres se décalent d’un rang — et un zéro apparaît
              derrière. C’est le décalage de la virgule que tu connais depuis la 6e.
            </Feedback>
          ) : (
            <Feedback tone="info">
              {vus.size} exposant{vus.size > 1 ? 's' : ''} essayé{vus.size > 1 ? 's' : ''} sur 4.
              Compare bien les deux compteurs.
            </Feedback>
          )}
        </div>
      ),
    },
    {
      num: 2,
      title: 'La règle en une phrase',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="puissance-de-dix"
            variant="new"
            lead={<>Tu viens de constater quatre fois la même chose. Elle mérite une phrase courte.</>}
          />
          <TapQuestion
            prompt={<>Combien de zéros comporte <span className="font-mono font-bold">{ecrirePuissance(10, 5)}</span> ?</>}
            options={['5 zéros', '4 zéros', '6 zéros', '10 zéros']}
            correct={0}
            cols={4}
            requires={['puissance-de-dix', 'exposant']}
            explain={`${ecrirePuissance(10, 5)} = ${dixPuissanceEcrit(5)} : cinq facteurs 10, donc cinq zéros. Le nombre s’écrit avec 6 CHIFFRES, mais 5 zéros — c’est le piège.`}
            explainWrong={`L’exposant compte les FACTEURS, et chaque facteur 10 ajoute un zéro : cinq facteurs, cinq zéros. Attention à ne pas compter le 1 du début comme un zéro : ${dixPuissanceEcrit(5)} a six chiffres mais cinq zéros.`}
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Écrire une grande quantité',
      done: q3,
      content: (
        <div className="space-y-3">
          <NumericQuestion
            prompt={<>Un million s’écrit <span className="font-mono font-bold">1 000 000</span>. Quel est l’exposant de 10 qui lui correspond ?</>}
            expected={6}
            parse={parseEntier}
            display="6"
            requires={['puissance-de-dix']}
            explain={`Un million a six zéros, donc six facteurs 10 : c’est ${ecrirePuissance(10, 6)}.`}
            explainFor={(rep) => {
              if (rep === 7) return 'Tu as sans doute compté les chiffres (il y en a 7) au lieu des zéros (il y en a 6). L’exposant compte les ZÉROS, pas les chiffres.';
              if (rep === 1000000) return 'On demande l’EXPOSANT, pas la valeur. Le nombre s’écrit 10 exposant 6, parce qu’il porte six zéros.';
              return 'Compte les zéros de 1 000 000 : il y en a six. L’exposant est donc 6.';
            }}
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
    {
      num: 4,
      title: 'Des grandeurs réelles',
      done: q4,
      content: (
        <div className="space-y-3">
          <BatchChoiceQuestion
            intro={<p className="text-sm text-slate-700">Quelle puissance de 10 correspond à chaque grandeur ?</p>}
            rows={GRANDEURS.map((g, i) => ({
              id: `g${i}`,
              label: `${g.nom} : ${puissance(10, g.exposant).toLocaleString('fr-FR')}`,
              options: [
                ecrirePuissance(10, g.exposant - 1),
                ecrirePuissance(10, g.exposant),
                ecrirePuissance(10, g.exposant + 1),
              ],
              correct: 1,
              correction: `${puissance(10, g.exposant).toLocaleString('fr-FR')} porte ${g.exposant} zéros, donc ${ecrirePuissance(10, g.exposant)}.`,
            }))}
            requires={['puissance-de-dix']}
            feedback={({ allRight, nCorrect, total }) =>
              allRight ? (
                <Feedback tone="ok">
                  La méthode est toujours la même, et elle tient en trois mots :{' '}
                  <strong>compte les zéros</strong>. C’est ce qui rend les grands nombres
                  manipulables sans les écrire en entier.
                </Feedback>
              ) : (
                <Feedback tone="ko">
                  {nCorrect} sur {total}. Écris le nombre, puis compte les zéros derrière le 1 —
                  et rien d’autre. Le chiffre 1 du début ne compte pas.
                </Feedback>
              )
            }
            solved={q4}
            onAnswered={() => setQ4(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(5)}
      moduleNumber={5}
      moduleTitle="Les puissances de dix"
      moduleSubtitle="Compter les zéros, c’est compter les facteurs"
      estimatedTime="9 min"
      brief={{
        tag: 'Manipulation',
        title: 'Un, suivi de beaucoup de zéros',
        tone: 'indigo',
        body: (
          <p>
            Parmi toutes les puissances, celles de <strong>10</strong> sont les plus utiles : elles
            servent à écrire les très grands nombres sans les recopier en entier. Fais varier
            l’exposant, et compte.
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={5} />}
    />
  );
}
