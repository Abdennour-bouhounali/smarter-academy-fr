<?php

namespace App\Domain\Diagnostic\Grades;

use App\Domain\Diagnostic\Contracts\GradeDiagnosticProvider;

/**
 * The 6e competency graph and question bank — the reference implementation
 * of GradeDiagnosticProvider. Every skill and starting point below traces
 * back to the 9 lessons actually available for 6e today (verified against
 * packages/core/curriculum/coursesData.js and each lesson's lesson.config.js
 * `skills[]`), not an invented generic test. See
 * docs/architecture/DIAGNOSTIC_6E.md for how this graph was derived and how
 * to build the equivalent provider for 5e.
 *
 * 13 skills across 4 dependency tiers:
 *   Tier 0 (no prerequisites) — number sense foundations
 *   Tier 1 — comparison, fractions, decimals, the four operations
 *   Tier 2 — fraction-of-a-quantity, division/remainder, measurement
 *   Tier 3 — estimation and integrative problem-solving
 *
 * Only two lessons are `tier: 'free'` in the catalogue today
 * (nombres-entiers, longueurs) — the diagnostic itself is not tier-gated
 * (assessing what a student knows shouldn't require a subscription), but
 * the *recommended lesson* it sends them to may itself be premium-gated by
 * the existing LessonCard/isLessonUnlocked machinery, unchanged.
 */
class SixiemeDiagnosticProvider implements GradeDiagnosticProvider
{
    public function grade(): string
    {
        return '6e';
    }

    public function skills(): array
    {
        return self::SKILLS;
    }

    public function questions(): array
    {
        return self::QUESTIONS;
    }

    public function startingPointFor(string $skillId): array
    {
        return self::STARTING_POINTS[$skillId] ?? self::STARTING_POINTS['nombres.lecture-ecriture'];
    }

    private const LESSON_PATHS = [
        'nombres-entiers' => '/courses/college/6e/nombres_calculs/nombres-entiers',
        'fractions' => '/courses/college/6e/nombres_calculs/fractions',
        'nombres-decimaux' => '/courses/college/6e/nombres_calculs/nombres-decimaux',
        'quatre-operations' => '/courses/college/6e/nombres_calculs/quatre-operations',
        'ordre-grandeur-estimation' => '/courses/college/6e/nombres_calculs/ordre-grandeur-estimation',
        'resolution-problemes' => '/courses/college/6e/nombres_calculs/resolution-problemes',
        'longueurs' => '/courses/college/6e/grandeurs_mesures/longueurs',
    ];

    private const SKILLS = [
        'nombres.lecture-ecriture' => [
            'label' => 'Lire, écrire et décomposer les nombres entiers',
            'tier' => 0,
            'importance' => 'critical',
            'prerequisites' => [],
            'lessonId' => 'nombres-entiers',
            'moduleNumber' => 3,
        ],
        'nombres.valeur-position' => [
            'label' => 'Comprendre la valeur de position de chaque chiffre',
            'tier' => 0,
            'importance' => 'critical',
            'prerequisites' => [],
            'lessonId' => 'nombres-entiers',
            'moduleNumber' => 4,
        ],
        'nombres.comparaison-rangement' => [
            'label' => 'Comparer et ranger des nombres entiers et décimaux',
            'tier' => 1,
            'importance' => 'critical',
            'prerequisites' => ['nombres.valeur-position'],
            'lessonId' => 'nombres-entiers',
            'moduleNumber' => 6,
        ],
        'nombres.droite-graduee' => [
            'label' => 'Repérer un nombre sur une droite graduée',
            'tier' => 1,
            'importance' => 'standard',
            'prerequisites' => ['nombres.valeur-position'],
            'lessonId' => 'nombres-entiers',
            'moduleNumber' => 8,
        ],
        'fractions.sens' => [
            'label' => "Comprendre le sens d'une fraction",
            'tier' => 1,
            'importance' => 'critical',
            'prerequisites' => ['nombres.lecture-ecriture'],
            'lessonId' => 'fractions',
            'moduleNumber' => 2,
        ],
        'decimaux.ecriture-virgule' => [
            'label' => 'Écritures décimales et écritures équivalentes',
            'tier' => 1,
            'importance' => 'critical',
            'prerequisites' => ['nombres.valeur-position'],
            'lessonId' => 'nombres-decimaux',
            'moduleNumber' => 4,
        ],
        'operations.sens-technique' => [
            'label' => 'Sens des quatre opérations et techniques posées',
            'tier' => 1,
            'importance' => 'critical',
            'prerequisites' => ['nombres.valeur-position'],
            'lessonId' => 'quatre-operations',
            'moduleNumber' => 2,
        ],
        'fractions.quantite-quotient' => [
            'label' => "Fraction d'une quantité et fraction-quotient",
            'tier' => 2,
            'importance' => 'standard',
            'prerequisites' => ['fractions.sens'],
            'lessonId' => 'fractions',
            'moduleNumber' => 5,
        ],
        'operations.division-reste' => [
            'label' => 'Division euclidienne et interprétation du reste',
            'tier' => 2,
            'importance' => 'standard',
            'prerequisites' => ['operations.sens-technique'],
            'lessonId' => 'quatre-operations',
            'moduleNumber' => 5,
        ],
        'mesures.conversions' => [
            'label' => 'Convertir des unités de longueur, masse et contenance',
            'tier' => 2,
            'importance' => 'standard',
            'prerequisites' => ['decimaux.ecriture-virgule'],
            'lessonId' => 'longueurs',
            'moduleNumber' => 4,
        ],
        'mesures.perimetre' => [
            'label' => "Calculer le périmètre d'un polygone",
            'tier' => 2,
            'importance' => 'standard',
            'prerequisites' => ['mesures.conversions', 'operations.sens-technique'],
            'lessonId' => 'longueurs',
            'moduleNumber' => 6,
        ],
        'estimation.ordre-grandeur' => [
            'label' => 'Estimer, arrondir et trouver un ordre de grandeur',
            'tier' => 3,
            'importance' => 'standard',
            'prerequisites' => ['operations.sens-technique', 'nombres.comparaison-rangement'],
            'lessonId' => 'ordre-grandeur-estimation',
            'moduleNumber' => 2,
        ],
        'problemes.resolution' => [
            'label' => 'Résoudre et communiquer la réponse à un problème',
            'tier' => 3,
            'importance' => 'standard',
            'prerequisites' => ['operations.division-reste', 'fractions.quantite-quotient', 'estimation.ordre-grandeur'],
            'lessonId' => 'resolution-problemes',
            'moduleNumber' => 2,
        ],
    ];

    private const STARTING_POINTS = [
        'nombres.lecture-ecriture' => ['lessonId' => 'nombres-entiers', 'lessonPath' => self::LESSON_PATHS['nombres-entiers'], 'moduleNumber' => 3, 'moduleTitle' => 'Lire et écrire les nombres'],
        'nombres.valeur-position' => ['lessonId' => 'nombres-entiers', 'lessonPath' => self::LESSON_PATHS['nombres-entiers'], 'moduleNumber' => 4, 'moduleTitle' => 'La valeur de chaque chiffre'],
        'nombres.comparaison-rangement' => ['lessonId' => 'nombres-entiers', 'lessonPath' => self::LESSON_PATHS['nombres-entiers'], 'moduleNumber' => 6, 'moduleTitle' => 'Comparer les nombres'],
        'nombres.droite-graduee' => ['lessonId' => 'nombres-entiers', 'lessonPath' => self::LESSON_PATHS['nombres-entiers'], 'moduleNumber' => 8, 'moduleTitle' => 'La demi-droite graduée'],
        'fractions.sens' => ['lessonId' => 'fractions', 'lessonPath' => self::LESSON_PATHS['fractions'], 'moduleNumber' => 2, 'moduleTitle' => 'Construire une fraction'],
        'decimaux.ecriture-virgule' => ['lessonId' => 'nombres-decimaux', 'lessonPath' => self::LESSON_PATHS['nombres-decimaux'], 'moduleNumber' => 4, 'moduleTitle' => "Passer à l'écriture à virgule"],
        'operations.sens-technique' => ['lessonId' => 'quatre-operations', 'lessonPath' => self::LESSON_PATHS['quatre-operations'], 'moduleNumber' => 2, 'moduleTitle' => 'Additionner : réunir et augmenter'],
        'fractions.quantite-quotient' => ['lessonId' => 'fractions', 'lessonPath' => self::LESSON_PATHS['fractions'], 'moduleNumber' => 5, 'moduleTitle' => "Fraction d'une quantité"],
        'operations.division-reste' => ['lessonId' => 'quatre-operations', 'lessonPath' => self::LESSON_PATHS['quatre-operations'], 'moduleNumber' => 5, 'moduleTitle' => 'Diviser : partager et regrouper'],
        'mesures.conversions' => ['lessonId' => 'longueurs', 'lessonPath' => self::LESSON_PATHS['longueurs'], 'moduleNumber' => 4, 'moduleTitle' => 'Convertir'],
        'mesures.perimetre' => ['lessonId' => 'longueurs', 'lessonPath' => self::LESSON_PATHS['longueurs'], 'moduleNumber' => 6, 'moduleTitle' => 'Périmètres'],
        'estimation.ordre-grandeur' => ['lessonId' => 'ordre-grandeur-estimation', 'lessonPath' => self::LESSON_PATHS['ordre-grandeur-estimation'], 'moduleNumber' => 2, 'moduleTitle' => 'Estimer avant de calculer'],
        'problemes.resolution' => ['lessonId' => 'resolution-problemes', 'lessonPath' => self::LESSON_PATHS['resolution-problemes'], 'moduleNumber' => 2, 'moduleTitle' => 'Comprendre la situation'],
    ];

    /**
     * Question shape:
     *   skillId, representation, difficulty (1-4), prompt, and
     *   representation-specific fields (choices/correct, or correct.value,
     *   etc). `misconceptions` maps a specific wrong answer to a
     *   misconception id; `verifies` marks a question as the deliberate
     *   second check for a misconception surfaced elsewhere, in a different
     *   context/representation (§5/§7 of the brief).
     */
    private const QUESTIONS = [
        // ── nombres.lecture-ecriture ────────────────────────────────────
        'ne-01' => [
            'skillId' => 'nombres.lecture-ecriture', 'representation' => 'choice', 'difficulty' => 1,
            'prompt' => 'Comment écrit-on « trois mille deux cent quarante » en chiffres ?',
            'choices' => [
                ['id' => 'a', 'label' => '3 240'],
                ['id' => 'b', 'label' => '3 000 240'],
                ['id' => 'c', 'label' => '3 204'],
                ['id' => 'd', 'label' => '3 024'],
            ],
            'correct' => ['choiceId' => 'a'],
            'misconceptions' => ['b' => 'groupement-mots-litteral'],
        ],
        'ne-02' => [
            'skillId' => 'nombres.lecture-ecriture', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Quel nombre correspond à cette décomposition : 5 000 + 300 + 20 + 7 ?',
            'correct' => ['value' => 5327, 'tolerance' => 0.5],
        ],
        'ne-03' => [
            'skillId' => 'nombres.lecture-ecriture', 'representation' => 'choice', 'difficulty' => 2,
            'prompt' => 'Dans le nombre 48 213, que représente le chiffre 8 ?',
            'choices' => [
                ['id' => 'a', 'label' => '8 unités'],
                ['id' => 'b', 'label' => '8 dizaines'],
                ['id' => 'c', 'label' => '8 milliers'],
                ['id' => 'd', 'label' => '8 centaines'],
            ],
            'correct' => ['choiceId' => 'c'],
            'misconceptions' => ['a' => 'chiffre-vs-nombre'],
        ],
        'ne-04' => [
            'skillId' => 'nombres.lecture-ecriture', 'representation' => 'numeric', 'difficulty' => 4,
            'prompt' => 'Écris en chiffres le nombre : quatre-vingt-douze mille sept.',
            'correct' => ['value' => 92007, 'tolerance' => 0.5],
            'misconceptions' => [['value' => 927, 'id' => 'omission-des-zeros']],
        ],

        // ── nombres.valeur-position ─────────────────────────────────────
        'nvp-01' => [
            'skillId' => 'nombres.valeur-position', 'representation' => 'choice', 'difficulty' => 1,
            'prompt' => 'Dans 5 274, quel chiffre est le chiffre des centaines ?',
            'choices' => [
                ['id' => 'a', 'label' => '5'],
                ['id' => 'b', 'label' => '2'],
                ['id' => 'c', 'label' => '7'],
                ['id' => 'd', 'label' => '4'],
            ],
            'correct' => ['choiceId' => 'b'],
        ],
        'nvp-02' => [
            'skillId' => 'nombres.valeur-position', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Quelle est la valeur du chiffre 6 dans le nombre 3 621 ? (Réponds par un nombre, par exemple 600)',
            'correct' => ['value' => 600, 'tolerance' => 0.5],
            'misconceptions' => [['value' => 6, 'id' => 'chiffre-vs-nombre']],
        ],
        'nvp-03' => [
            'skillId' => 'nombres.valeur-position', 'representation' => 'choice', 'difficulty' => 3,
            'prompt' => 'On échange le chiffre des dizaines et le chiffre des unités du nombre 4 758. Quel nombre obtient-on ?',
            'choices' => [
                ['id' => 'a', 'label' => '4 785'],
                ['id' => 'b', 'label' => '4 587'],
                ['id' => 'c', 'label' => '4 758'],
                ['id' => 'd', 'label' => '8 754'],
            ],
            'correct' => ['choiceId' => 'a'],
        ],
        'nvp-04' => [
            'skillId' => 'nombres.valeur-position', 'representation' => 'numeric', 'difficulty' => 4,
            'prompt' => 'Quel est le plus grand nombre à 4 chiffres différents que l’on peut former avec 3, 0, 8 et 5 ?',
            'correct' => ['value' => 8530, 'tolerance' => 0.5],
        ],

        // ── nombres.comparaison-rangement ───────────────────────────────
        'ncr-01' => [
            'skillId' => 'nombres.comparaison-rangement', 'representation' => 'choice', 'difficulty' => 2,
            'prompt' => 'Quel est le plus grand nombre : 2,45 ou 2,5 ?',
            'choices' => [
                ['id' => 'a', 'label' => '2,45'],
                ['id' => 'b', 'label' => '2,5'],
                ['id' => 'c', 'label' => 'Ils sont égaux'],
            ],
            'correct' => ['choiceId' => 'b'],
            'misconceptions' => ['a' => 'plus-de-chiffres-plus-grand'],
        ],
        'ncr-02' => [
            'skillId' => 'nombres.comparaison-rangement', 'representation' => 'ordering', 'difficulty' => 2,
            'prompt' => 'Range ces nombres du plus petit au plus grand.',
            'items' => [
                ['id' => 'i1', 'label' => '4 802'],
                ['id' => 'i2', 'label' => '4 280'],
                ['id' => 'i3', 'label' => '4 820'],
                ['id' => 'i4', 'label' => '4 208'],
            ],
            'correct' => ['sequence' => ['i4', 'i2', 'i1', 'i3']],
        ],
        'ncr-03' => [
            'skillId' => 'nombres.comparaison-rangement', 'representation' => 'choice', 'difficulty' => 3,
            'prompt' => 'Quel est le plus petit nombre : 0,75 ; 0,08 ; ou 0,8 ?',
            'choices' => [
                ['id' => 'a', 'label' => '0,75'],
                ['id' => 'b', 'label' => '0,08'],
                ['id' => 'c', 'label' => '0,8'],
            ],
            'correct' => ['choiceId' => 'b'],
            'misconceptions' => ['c' => 'plus-de-chiffres-plus-grand'],
            'verifies' => 'plus-de-chiffres-plus-grand',
        ],
        'ncr-04' => [
            'skillId' => 'nombres.comparaison-rangement', 'representation' => 'ordering', 'difficulty' => 4,
            'prompt' => 'Range ces nombres décimaux du plus petit au plus grand.',
            'items' => [
                ['id' => 'i1', 'label' => '3,05'],
                ['id' => 'i2', 'label' => '3,5'],
                ['id' => 'i3', 'label' => '3,45'],
                ['id' => 'i4', 'label' => '3,405'],
            ],
            'correct' => ['sequence' => ['i1', 'i4', 'i3', 'i2']],
        ],

        // ── nombres.droite-graduee ───────────────────────────────────────
        'ndg-01' => [
            'skillId' => 'nombres.droite-graduee', 'representation' => 'numberline', 'difficulty' => 1,
            'prompt' => 'Place le nombre 7 sur la demi-droite graduée.',
            'numberLine' => ['min' => 0, 'max' => 10, 'step' => 1],
            'correct' => ['value' => 7, 'tolerance' => 0.4],
        ],
        'ndg-02' => [
            'skillId' => 'nombres.droite-graduee', 'representation' => 'numberline', 'difficulty' => 2,
            'prompt' => 'Place le nombre 340 sur la demi-droite graduée.',
            'numberLine' => ['min' => 0, 'max' => 1000, 'step' => 100],
            'correct' => ['value' => 340, 'tolerance' => 30],
        ],
        'ndg-03' => [
            'skillId' => 'nombres.droite-graduee', 'representation' => 'choice', 'difficulty' => 3,
            'prompt' => "Sur une demi-droite graduée, l'écart entre 40 et 50 est partagé en 5 parts égales. Quel est le pas entre deux graduations ?",
            'choices' => [
                ['id' => 'a', 'label' => '1'],
                ['id' => 'b', 'label' => '2'],
                ['id' => 'c', 'label' => '5'],
                ['id' => 'd', 'label' => '10'],
            ],
            'correct' => ['choiceId' => 'b'],
        ],
        'ndg-04' => [
            'skillId' => 'nombres.droite-graduee', 'representation' => 'numberline', 'difficulty' => 3,
            'prompt' => 'Place le nombre 2,3 sur la demi-droite graduée.',
            'numberLine' => ['min' => 2, 'max' => 3, 'step' => 0.1],
            'correct' => ['value' => 2.3, 'tolerance' => 0.08],
        ],

        // ── fractions.sens ────────────────────────────────────────────────
        'frs-01' => [
            'skillId' => 'fractions.sens', 'representation' => 'choice', 'difficulty' => 1,
            'prompt' => 'Une pizza est coupée en 4 parts égales. Léo mange 3 parts. Quelle fraction de la pizza a-t-il mangée ?',
            'choices' => [
                ['id' => 'a', 'label' => '3/4'],
                ['id' => 'b', 'label' => '4/3'],
                ['id' => 'c', 'label' => '1/4'],
                ['id' => 'd', 'label' => '3'],
            ],
            'correct' => ['choiceId' => 'a'],
            'misconceptions' => ['b' => 'numerateur-denominateur-inverses'],
        ],
        'frs-02' => [
            'skillId' => 'fractions.sens', 'representation' => 'choice', 'difficulty' => 2,
            'prompt' => 'Quelle fraction est la plus grande : 1/4 ou 1/8 ?',
            'choices' => [
                ['id' => 'a', 'label' => '1/4'],
                ['id' => 'b', 'label' => '1/8'],
                ['id' => 'c', 'label' => 'Elles sont égales'],
            ],
            'correct' => ['choiceId' => 'a'],
            'misconceptions' => ['b' => 'plus-grand-denominateur-plus-grande-fraction'],
        ],
        'frs-03' => [
            'skillId' => 'fractions.sens', 'representation' => 'choice', 'difficulty' => 3,
            'prompt' => 'Léa partage une tablette de chocolat en 3 parts égales et en mange 1 part. Noah partage la même tablette en 6 parts égales et en mange 1 part. Qui a mangé le plus de chocolat ?',
            'choices' => [
                ['id' => 'a', 'label' => 'Léa'],
                ['id' => 'b', 'label' => 'Noah'],
                ['id' => 'c', 'label' => 'Ils ont mangé la même quantité'],
            ],
            'correct' => ['choiceId' => 'a'],
            'misconceptions' => ['b' => 'plus-grand-denominateur-plus-grande-fraction'],
            'verifies' => 'plus-grand-denominateur-plus-grande-fraction',
        ],
        'frs-04' => [
            'skillId' => 'fractions.sens', 'representation' => 'fraction', 'difficulty' => 2,
            'prompt' => 'Un gâteau est partagé en 6 parts égales. Tu en manges 5 parts. Quelle fraction du gâteau as-tu mangée ?',
            'correct' => ['numerator' => 5, 'denominator' => 6],
        ],

        // ── decimaux.ecriture-virgule ─────────────────────────────────────
        'dev-01' => [
            'skillId' => 'decimaux.ecriture-virgule', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Écris 37/10 en écriture à virgule (par exemple : 1,2).',
            'correct' => ['value' => 3.7, 'tolerance' => 0.01],
            'misconceptions' => [['value' => 0.37, 'id' => 'virgule-mal-placee']],
        ],
        'dev-02' => [
            'skillId' => 'decimaux.ecriture-virgule', 'representation' => 'choice', 'difficulty' => 1,
            'prompt' => 'Laquelle de ces écritures est égale à 3,5 ?',
            'choices' => [
                ['id' => 'a', 'label' => '3,50'],
                ['id' => 'b', 'label' => '3,05'],
                ['id' => 'c', 'label' => '3,005'],
                ['id' => 'd', 'label' => '35'],
            ],
            'correct' => ['choiceId' => 'a'],
            'misconceptions' => ['b' => 'confond-dixiemes-centiemes'],
        ],
        'dev-03' => [
            'skillId' => 'decimaux.ecriture-virgule', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'Écris « 8 centièmes » en écriture à virgule (nombre entre 0 et 1).',
            'correct' => ['value' => 0.08, 'tolerance' => 0.005],
            'misconceptions' => [['value' => 0.8, 'id' => 'confond-dixiemes-centiemes']],
            'verifies' => 'confond-dixiemes-centiemes',
        ],
        'dev-04' => [
            'skillId' => 'decimaux.ecriture-virgule', 'representation' => 'choice', 'difficulty' => 2,
            'prompt' => 'Quelle fraction décimale correspond à 0,4 ?',
            'choices' => [
                ['id' => 'a', 'label' => '4/10'],
                ['id' => 'b', 'label' => '4/100'],
                ['id' => 'c', 'label' => '4/1000'],
                ['id' => 'd', 'label' => '40/1'],
            ],
            'correct' => ['choiceId' => 'a'],
            'misconceptions' => ['b' => 'confond-dixiemes-centiemes'],
        ],

        // ── operations.sens-technique ───────────────────────────────────
        'ost-01' => [
            'skillId' => 'operations.sens-technique', 'representation' => 'choice', 'difficulty' => 1,
            'prompt' => 'Un magasin avait 128 stylos. Il en vend 45. Combien lui en reste-t-il ?',
            'choices' => [
                ['id' => 'a', 'label' => '173'],
                ['id' => 'b', 'label' => '83'],
                ['id' => 'c', 'label' => '93'],
                ['id' => 'd', 'label' => '87'],
            ],
            'correct' => ['choiceId' => 'b'],
            'misconceptions' => ['a' => 'operation-inversee'],
        ],
        'ost-02' => [
            'skillId' => 'operations.sens-technique', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => '4 restaurants livrent chacun 27 repas. Combien de repas au total ?',
            'correct' => ['value' => 108, 'tolerance' => 0.5],
        ],
        'ost-03' => [
            'skillId' => 'operations.sens-technique', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Calcule : 356 + 478.',
            'correct' => ['value' => 834, 'tolerance' => 0.5],
        ],
        'ost-04' => [
            'skillId' => 'operations.sens-technique', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'Calcule : 604 − 278.',
            'correct' => ['value' => 326, 'tolerance' => 0.5],
        ],

        // ── fractions.quantite-quotient ─────────────────────────────────
        'fqq-01' => [
            'skillId' => 'fractions.quantite-quotient', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Calcule les 2/3 de 15 bonbons.',
            'correct' => ['value' => 10, 'tolerance' => 0.5],
        ],
        'fqq-02' => [
            'skillId' => 'fractions.quantite-quotient', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => "Dans une classe de 24 élèves, les 3/4 sont venus à pied. Combien d'élèves sont venus à pied ?",
            'correct' => ['value' => 18, 'tolerance' => 0.5],
        ],
        'fqq-03' => [
            'skillId' => 'fractions.quantite-quotient', 'representation' => 'choice', 'difficulty' => 2,
            'prompt' => '3 amis se partagent équitablement 5 crêpes. Quelle fraction de crêpe chaque ami reçoit-il ?',
            'choices' => [
                ['id' => 'a', 'label' => '5/3'],
                ['id' => 'b', 'label' => '3/5'],
                ['id' => 'c', 'label' => '5'],
                ['id' => 'd', 'label' => '3'],
            ],
            'correct' => ['choiceId' => 'a'],
            'misconceptions' => ['b' => 'numerateur-denominateur-inverses'],
        ],

        // ── operations.division-reste ────────────────────────────────────
        'odr-01' => [
            'skillId' => 'operations.division-reste', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => '27 élèves partent en sortie. Chaque voiture transporte au maximum 5 élèves. Combien de voitures faut-il au minimum ?',
            'correct' => ['value' => 6, 'tolerance' => 0.5],
            'misconceptions' => [['value' => 5, 'id' => 'reste-ignore']],
        ],
        'odr-02' => [
            'skillId' => 'operations.division-reste', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Effectue la division euclidienne de 53 par 8. Donne le quotient.',
            'correct' => ['value' => 6, 'tolerance' => 0.5],
        ],
        'odr-03' => [
            'skillId' => 'operations.division-reste', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'Effectue la division euclidienne de 53 par 8. Donne le reste.',
            'correct' => ['value' => 5, 'tolerance' => 0.5],
        ],
        'odr-04' => [
            'skillId' => 'operations.division-reste', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'On partage 34 images entre 6 albums, à parts égales. Combien d’images resteront non rangées ?',
            'correct' => ['value' => 4, 'tolerance' => 0.5],
        ],

        // ── mesures.conversions ───────────────────────────────────────────
        'mco-01' => [
            'skillId' => 'mesures.conversions', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Convertis 3,5 m en cm.',
            'correct' => ['value' => 350, 'tolerance' => 0.5],
            'misconceptions' => [['value' => 35, 'id' => 'sens-conversion-inverse']],
        ],
        'mco-02' => [
            'skillId' => 'mesures.conversions', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Convertis 250 g en kg.',
            'correct' => ['value' => 0.25, 'tolerance' => 0.005],
            'misconceptions' => [['value' => 2.5, 'id' => 'sens-conversion-inverse']],
        ],
        'mco-03' => [
            'skillId' => 'mesures.conversions', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'Convertis 1,2 L en cL.',
            'correct' => ['value' => 120, 'tolerance' => 0.5],
        ],
        'mco-04' => [
            'skillId' => 'mesures.conversions', 'representation' => 'choice', 'difficulty' => 1,
            'prompt' => "Quelle est l'unité la plus adaptée pour mesurer la masse d'un cartable ?",
            'choices' => [
                ['id' => 'a', 'label' => 'mg'],
                ['id' => 'b', 'label' => 'g'],
                ['id' => 'c', 'label' => 'kg'],
                ['id' => 'd', 'label' => 't'],
            ],
            'correct' => ['choiceId' => 'c'],
        ],

        // ── mesures.perimetre ─────────────────────────────────────────────
        'mpe-01' => [
            'skillId' => 'mesures.perimetre', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Un rectangle mesure 8 cm de longueur et 5 cm de largeur. Quel est son périmètre (en cm) ?',
            'correct' => ['value' => 26, 'tolerance' => 0.5],
        ],
        'mpe-02' => [
            'skillId' => 'mesures.perimetre', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Un carré a un côté de 7 cm. Quel est son périmètre (en cm) ?',
            'correct' => ['value' => 28, 'tolerance' => 0.5],
            'misconceptions' => [['value' => 49, 'id' => 'perimetre-aire-confondus']],
        ],
        'mpe-03' => [
            'skillId' => 'mesures.perimetre', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'Un terrain rectangulaire mesure 25 m sur 12 m. Quel est son périmètre (en m) ?',
            'correct' => ['value' => 74, 'tolerance' => 0.5],
        ],

        // ── estimation.ordre-grandeur ───────────────────────────────────
        'eog-01' => [
            'skillId' => 'estimation.ordre-grandeur', 'representation' => 'choice', 'difficulty' => 2,
            'prompt' => "Sans calculer précisément, quel est l'ordre de grandeur de 398 + 205 ?",
            'choices' => [
                ['id' => 'a', 'label' => '60'],
                ['id' => 'b', 'label' => '600'],
                ['id' => 'c', 'label' => '6 000'],
                ['id' => 'd', 'label' => '1 200'],
            ],
            'correct' => ['choiceId' => 'b'],
        ],
        'eog-02' => [
            'skillId' => 'estimation.ordre-grandeur', 'representation' => 'choice', 'difficulty' => 2,
            'prompt' => 'Un élève calcule 49 × 21 et trouve 1 029. Ce résultat est-il plausible ?',
            'choices' => [
                ['id' => 'a', 'label' => 'Oui, c’est plausible'],
                ['id' => 'b', 'label' => 'Non, c’est trop petit'],
                ['id' => 'c', 'label' => 'Non, c’est trop grand'],
            ],
            'correct' => ['choiceId' => 'a'],
        ],
        'eog-03' => [
            'skillId' => 'estimation.ordre-grandeur', 'representation' => 'choice', 'difficulty' => 3,
            'prompt' => 'Un élève calcule 398 + 205 et trouve 1 203. Ce résultat est-il plausible ?',
            'choices' => [
                ['id' => 'a', 'label' => 'Oui, c’est plausible'],
                ['id' => 'b', 'label' => 'Non, c’est trop grand'],
                ['id' => 'c', 'label' => 'Non, c’est trop petit'],
            ],
            'correct' => ['choiceId' => 'b'],
            'misconceptions' => ['a' => 'ne-verifie-pas-la-coherence'],
        ],
        'eog-04' => [
            'skillId' => 'estimation.ordre-grandeur', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'Arrondis 4 672 à la centaine la plus proche.',
            'correct' => ['value' => 4700, 'tolerance' => 0.5],
        ],

        // ── problemes.resolution ──────────────────────────────────────────
        'prb-01' => [
            'skillId' => 'problemes.resolution', 'representation' => 'classification', 'difficulty' => 2,
            'prompt' => 'Léa a 15 € et veut acheter le plus de cahiers possible, à 2 € pièce. Quelles informations sont utiles pour résoudre ce problème ?',
            'items' => [
                ['id' => 'prix', 'text' => "Le prix d'un cahier est 2 €", 'useful' => true],
                ['id' => 'argent', 'text' => 'Léa a 15 €', 'useful' => true],
                ['id' => 'couleur', 'text' => 'Les cahiers sont de couleur bleue', 'useful' => false],
                ['id' => 'jour', 'text' => 'Léa fait ses courses un samedi', 'useful' => false],
            ],
            'correct' => ['assignments' => ['prix' => 'useful', 'argent' => 'useful', 'couleur' => 'not_useful', 'jour' => 'not_useful']],
        ],
        'prb-02' => [
            'skillId' => 'problemes.resolution', 'representation' => 'numeric', 'difficulty' => 2,
            'prompt' => 'Léa a 15 € et achète des cahiers à 2 € pièce. Combien de cahiers peut-elle acheter au maximum ?',
            'correct' => ['value' => 7, 'tolerance' => 0.5],
        ],
        'prb-03' => [
            'skillId' => 'problemes.resolution', 'representation' => 'numeric', 'difficulty' => 3,
            'prompt' => 'Un bus transporte au maximum 32 passagers. Pour un voyage scolaire de 140 élèves, combien de bus faut-il réserver au minimum ?',
            'correct' => ['value' => 5, 'tolerance' => 0.5],
            'misconceptions' => [['value' => 4, 'id' => 'reste-ignore']],
        ],
        'prb-04' => [
            'skillId' => 'problemes.resolution', 'representation' => 'ordering', 'difficulty' => 3,
            'prompt' => 'Range les étapes de la résolution de problème dans le bon ordre.',
            'items' => [
                ['id' => 's1', 'label' => 'Comprendre ce que demande le problème'],
                ['id' => 's2', 'label' => 'Extraire les informations utiles'],
                ['id' => 's3', 'label' => "Choisir l'opération adaptée"],
                ['id' => 's4', 'label' => 'Calculer'],
                ['id' => 's5', 'label' => 'Vérifier que le résultat est cohérent'],
            ],
            'correct' => ['sequence' => ['s1', 's2', 's3', 's4', 's5']],
        ],
    ];
}
