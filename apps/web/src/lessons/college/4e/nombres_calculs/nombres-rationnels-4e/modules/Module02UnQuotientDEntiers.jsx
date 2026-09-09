import React, { useState } from 'react';
import { ContentModule, TapQuestion, BatchChoiceQuestion, KnowledgeBrick } from '../../../../../common/kit';
import { KnowledgeSnapshot } from '../../../../../common/knowledge';
import { FractionView } from '../../../../../common/algebra4e';
import { MODULE_CTX, getNavLinks } from '../moduleContext';
import { q } from '../components/rationnels4e';

/**
 * Module 2 — DÉCOUVERTE : le nombre est nommé, et le signe trouve sa place.
 *
 * Ce que le module 1 a laissé ouvert : on sait TESTER une égalité, on n'a pas
 * encore dit ce qu'est l'objet testé. C'est ici que « nombre rationnel » et la
 * place du signe sont posés — et nulle part avant, puisque la manipulation
 * devait précéder le mot.
 *
 * Ce que ce module NE fait PAS : aucun calcul. L'addition attend le module 3,
 * qui a d'abord besoin du dénominateur commun.
 */
export default function Module02UnQuotientDEntiers() {
  const [q1, setQ1] = useState(false);
  const [q2, setQ2] = useState(false);
  const [q3, setQ3] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Le nom de ce que tu manipules',
      subtitle: 'Tu testes des égalités depuis tout à l’heure — voici ce que sont ces nombres.',
      done: q1,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="nombre-rationnel"
            variant="new"
            lead={<>Les quatre nombres que tu réglais étaient des entiers, et la fraction qu’ils formaient était, elle aussi, un nombre à part entière.</>}
          />
          <TapQuestion
            prompt="Parmi ces nombres, lequel n’est PAS un nombre rationnel ?"
            options={[
              'Un nombre dont on ne peut écrire le quotient d’aucune façon',
              <span key="a" className="inline-flex items-center gap-1">
                <FractionView value={q(-2, 5)} size="sm" tone="violet" />
              </span>,
              '7',
              '0',
            ]}
            correct={0}
            cols={2}
            requires={['nombre-rationnel']}
            correctionLabel="Un nombre qu’aucun quotient d’entiers ne peut écrire"
            explain="Un rationnel est un quotient de deux entiers relatifs. −2/5 en est un, 7 aussi (c’est 7/1), et 0 aussi (c’est 0/1). Un nombre qui ne s’écrit comme le quotient d’aucun couple d’entiers n’en est donc pas un."
            explainWrong="Attention : un entier EST un rationnel — il suffit de l’écrire sur 1. Et un signe négatif n’empêche rien, puisque le programme parle d’entiers RELATIFS."
            solved={q1}
            onAnswered={() => setQ1(true)}
          />
        </div>
      ),
    },
    {
      num: 2,
      title: 'Où se met le signe',
      subtitle: 'Trois écritures, un seul nombre — ou pas.',
      done: q2,
      content: (
        <div className="space-y-3">
          <KnowledgeBrick
            id="signe-de-la-fraction"
            variant="new"
            lead={<>Une fraction est un quotient. Le signe d’un quotient, tu le connais déjà : c’est la règle des signes.</>}
          />
          <BatchChoiceQuestion
            intro={
              <p className="text-sm text-slate-700">
                Pour chaque écriture, dis si elle désigne un nombre <strong>positif</strong> ou{' '}
                <strong>négatif</strong>.
              </p>
            }
            rows={[
              {
                id: 'r1',
                label: <FractionView value={{ n: -3, d: 4 }} size="sm" tone="slate" />,
                options: ['positif', 'négatif'],
                correct: 1,
                correction: 'un seul signe − : le quotient est négatif',
              },
              {
                id: 'r2',
                label: <span className="font-mono text-sm">3 ÷ (−4)</span>,
                options: ['positif', 'négatif'],
                correct: 1,
                correction: 'signes contraires : négatif — c’est le même nombre que −3/4',
              },
              {
                id: 'r3',
                label: <span className="font-mono text-sm">(−3) ÷ (−4)</span>,
                options: ['positif', 'négatif'],
                correct: 0,
                correction: 'deux signes − : le quotient est positif',
              },
            ]}
            requires={['signe-de-la-fraction', 'regle-des-signes']}
            feedback={({ allRight }) =>
              allRight ? (
                <p className="text-sm text-emerald-700">
                  Exactement. Les deux premières écritures désignent le <strong>même nombre</strong> :
                  on le note −3/4, avec un seul signe, devant la barre.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  Le signe d’une fraction est celui d’un <strong>quotient</strong> : un seul signe −
                  donne un nombre négatif, deux signes − donnent un nombre positif. On écrit ensuite
                  le résultat avec un seul signe, devant la barre.
                </p>
              )
            }
            solved={q2}
            onAnswered={() => setQ2(true)}
          />
        </div>
      ),
    },
    {
      num: 3,
      title: 'Une infinité d’écritures, un seul nombre',
      done: q3,
      content: (
        <div className="space-y-3">
          <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-3">
            <p className="mb-2 text-sm text-slate-700">
              Ces quatre écritures désignent toutes le même nombre :
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[{ n: 2, d: 3 }, { n: 4, d: 6 }, { n: 6, d: 9 }, { n: 20, d: 30 }].map((f, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="font-black text-emerald-600">=</span>}
                  <FractionView value={f} size="md" tone="violet" />
                </React.Fragment>
              ))}
            </div>
          </div>
          <TapQuestion
            prompt={
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Comment vérifier, sans simplifier, que
                <FractionView value={{ n: 6, d: 9 }} size="sm" tone="indigo" />
                <span>et</span>
                <FractionView value={{ n: 20, d: 30 }} size="sm" tone="violet" />
                <span>sont égales ?</span>
              </span>
            }
            options={[
              'En comparant 6 × 30 et 9 × 20 : les deux valent 180',
              'En comparant 6 + 30 et 9 + 20 : les deux valent 36 et 29',
              'En regardant si les numérateurs se ressemblent',
              'C’est impossible sans les simplifier',
            ]}
            correct={0}
            cols={1}
            requires={['produits-en-croix', 'nombre-rationnel']}
            explain="Les produits en croix : 6 × 30 = 180 et 9 × 20 = 180. Égaux, donc les fractions le sont — et on n’a eu besoin ni de simplifier, ni de chercher une graduation commune."
            explainWrong="Une addition ne teste rien : ce qui conserve une fraction, c’est de multiplier ses deux termes par un même nombre. Le test doit donc être multiplicatif lui aussi."
            solved={q3}
            onAnswered={() => setQ3(true)}
          />
        </div>
      ),
    },
  ];

  return (
    <ContentModule
      ctx={MODULE_CTX}
      navLinks={getNavLinks(2)}
      moduleNumber={2}
      moduleTitle="Un quotient d’entiers"
      moduleSubtitle="Le nombre rationnel, et la place de son signe"
      estimatedTime="11 min"
      brief={{
        tag: 'Découverte',
        title: 'Ces nombres ont un nom',
        tone: 'indigo',
        body: (
          <p>
            Tu viens de tester des égalités entre fractions. Mais qu’est-ce qu’une fraction, au
            juste, quand on la regarde comme un <strong>nombre</strong> — et que devient son signe
            quand il y en a un ?
          </p>
        ),
      }}
      steps={steps}
      footer={<KnowledgeSnapshot moduleNumber={2} />}
    />
  );
}
