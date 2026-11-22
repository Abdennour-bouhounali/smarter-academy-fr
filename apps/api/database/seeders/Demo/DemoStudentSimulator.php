<?php

namespace Database\Seeders\Demo;

use App\Domain\Progress\ProgressEngine;
use App\Models\ExerciseAttempt;
use App\Models\HintEvent;
use App\Models\LessonFinalTestAttempt;
use App\Models\PracticeSession;
use App\Models\QuestionAttempt;
use App\Models\StudentLessonProgress;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * Déroule le portrait d'un élève sur un calendrier et écrit ce que trois
 * mois de travail auraient laissé derrière eux.
 *
 * Deux règles gouvernent tout le fichier :
 *
 *  1. ON N'ÉCRIT QUE CE QUE L'APPLICATION ÉCRIRAIT. Une séance de pratique
 *     porte ses compteurs, une tentative de question naît à l'ouverture puis
 *     reçoit sa réponse, un indice demandé laisse un évènement daté, une
 *     preuve d'évaluation entraîne un recalcul de maîtrise.
 *  2. LA MAÎTRISE NE SE DÉCRÈTE PAS. Elle est rejouée preuve après preuve
 *     par ProgressEngine — la porte de production, appelée, jamais recopiée.
 *     Un élève qui échoue trois fois sur un point ne peut donc pas en
 *     ressortir « maîtrisé » : l'arithmétique l'interdit.
 *
 * Le générateur aléatoire est ensemencé par la clé du persona : deux
 * exécutions produisent le même élève.
 */
final class DemoStudentSimulator
{
    private int $seed;

    /** @var array<int, array<string, mixed>> */
    private array $notes = [];

    private array $counters = [
        'sessions' => 0, 'exerciseAttempts' => 0, 'questionAttempts' => 0,
        'correct' => 0, 'incorrect' => 0, 'hints' => 0, 'evidence' => 0,
        'notes' => 0, 'finalTests' => 0, 'lessonsCompleted' => 0, 'lessonsStarted' => 0,
    ];

    public function __construct(
        private readonly DemoContent $content,
        private readonly DemoNotes $noteWriter,
    ) {}

    /** @return array<string, int> les compteurs de ce qui a été écrit */
    public function run(User $student, DemoPersona $persona): array
    {
        $this->seed = crc32($persona->key);
        $this->counters = array_map(fn () => 0, $this->counters);

        $days = $this->studyDays($persona);
        $lessons = $this->lessonPlan($persona);

        // Le parcours avance leçon par leçon : un élève ne travaille pas la
        // leçon 7 avant d'avoir ouvert la leçon 1.
        $dayIndex = 0;
        foreach ($lessons as $position => $plan) {
            $slice = $this->daysFor($days, $position, count($lessons));
            if ($slice === []) {
                continue;
            }
            $this->studyLesson($student, $persona, $plan, $slice);
        }

        $this->noteWriter->write($student, $persona, $this->notes);
        $this->counters['notes'] = count($this->notes);

        $last = end($days) ?: Carbon::now()->subDays($persona->lastSeenDaysAgo);
        $student->forceFill(['last_activity_at' => $last])->save();

        return $this->counters;
    }

    /**
     * Le CALENDRIER de l'élève : des jours réellement travaillés, pas une
     * grille régulière. Week-ends allégés, interruptions du portrait
     * respectées, séances le soir.
     *
     * @return Carbon[]
     */
    private function studyDays(DemoPersona $persona): array
    {
        $start = Carbon::now()->subDays($persona->startedDaysAgo)->startOfDay();
        $end = Carbon::now()->subDays($persona->lastSeenDaysAgo)->startOfDay();
        if ($end->lessThan($start)) {
            $end = $start->copy();
        }

        // Les interruptions du portrait — placées à des moments stables.
        $gaps = [];
        $span = max(1, $start->diffInDays($end));
        foreach ($persona->gapLengths as $i => $length) {
            $at = (int) round($span * (0.3 + 0.35 * $i));
            for ($d = 0; $d < $length; $d++) {
                $gaps[$at + $d] = true;
            }
        }

        $days = [];
        for ($offset = 0; $offset <= $span; $offset++) {
            if (isset($gaps[$offset])) {
                continue;
            }
            $day = $start->copy()->addDays($offset);
            // Vendredi/samedi : le week-end algérien, travaillé plus rarement.
            $weekend = in_array($day->dayOfWeek, [Carbon::FRIDAY, Carbon::SATURDAY], true);
            $chance = $persona->density * ($weekend ? 0.45 : 1.0);
            if ($this->chance($chance)) {
                // Entre 15h et 21h, l'après-midi et le soir.
                $days[] = $day->copy()->setTime(15 + $this->nextInt(0, 6), $this->nextInt(0, 59));
            }
        }

        if ($days === []) {
            $days[] = $end->copy()->setTime(18, 0);
        }

        // Le dernier jour est le « vu pour la dernière fois » du portrait :
        // c'est lui qui fait qu'un élève paraît actif ou décroché aujourd'hui.
        $days[count($days) - 1] = $end->copy()->setTime(17 + $this->nextInt(0, 3), $this->nextInt(0, 59));

        return $days;
    }

    /**
     * Jusqu'où l'élève est allé, et à quel niveau d'exercices il a poussé
     * chaque leçon. La dernière leçon touchée reste EN COURS : « aujourd'hui
     * est un jour ordinaire au milieu du parcours ».
     *
     * @return array<int, array{lesson: \App\Models\Lesson, complete: bool, maxLevel: int}>
     */
    private function lessonPlan(DemoPersona $persona): array
    {
        $all = $this->content->lessons->values();
        $reached = max(1, (int) round($all->count() * $persona->reach));
        $plan = [];

        for ($i = 0; $i < $reached; $i++) {
            $isLast = $i === $reached - 1;
            // Un élève solide pousse jusqu'au niveau 4-5 ; un élève en
            // difficulté reste dans les premiers niveaux.
            $ceiling = $persona->accuracy >= 0.8 ? 5 : ($persona->accuracy >= 0.6 ? 4 : 3);
            $plan[] = [
                'lesson' => $all[$i],
                // La leçon en cours n'est pas terminée ; les précédentes le
                // sont, sauf chez l'élève irrégulier qui en laisse en plan.
                'complete' => ! $isLast && ($persona->persistence > 0.45 || $this->chance(0.7)),
                'maxLevel' => $isLast ? max(1, $ceiling - 2) : $ceiling,
            ];
        }

        return $plan;
    }

    /** @return Carbon[] */
    private function daysFor(array $days, int $position, int $total): array
    {
        $per = max(1, (int) floor(count($days) / max(1, $total)));
        $slice = array_slice($days, $position * $per, $per);

        // La dernière leçon récupère tout ce qui reste, pour que l'activité
        // la plus récente porte sur la leçon en cours.
        if ($position === $total - 1) {
            $slice = array_slice($days, $position * $per);
        }

        return $slice;
    }

    /**
     * Une leçon travaillée : les modules se terminent au fil des jours, les
     * séances de pratique s'intercalent, et l'évaluation finale vient
     * couronner — ou non — le parcours.
     */
    private function studyLesson(User $student, DemoPersona $persona, array $plan, array $days): void
    {
        $lesson = $plan['lesson'];
        $modules = $this->content->moduleNumbers[$lesson->id] ?? [];
        if ($modules === []) {
            return;
        }

        $target = $plan['complete'] ? count($modules) : max(1, (int) ceil(count($modules) * (0.3 + 0.4 * $persona->persistence)));
        $done = [];
        $exercises = $this->content->exercisesUpTo($lesson->code, $plan['maxLevel']);
        $exerciseCursor = 0;

        foreach ($days as $i => $day) {
            // Des modules avancent ce jour-là.
            $step = max(1, (int) ceil($target / max(1, count($days))));
            for ($s = 0; $s < $step && count($done) < $target; $s++) {
                $done[] = (string) $modules[count($done)];
            }

            // Et, une fois la leçon entamée, de la pratique.
            if ($exercises !== [] && count($done) >= 2 && $this->chance(0.65)) {
                $batch = array_slice($exercises, $exerciseCursor, $this->nextInt(1, 2));
                if ($batch !== []) {
                    $this->practiceSession($student, $persona, $lesson, $batch, $day);
                    $exerciseCursor = min($exerciseCursor + count($batch), max(0, count($exercises) - 1));
                }
            }
        }

        $lastDay = end($days);
        $completed = count($done) >= count($modules);

        StudentLessonProgress::updateOrCreate(
            ['user_id' => $student->id, 'lesson_id' => $lesson->id],
            [
                'status' => $completed ? StudentLessonProgress::STATUS_COMPLETED : StudentLessonProgress::STATUS_IN_PROGRESS,
                'current_module' => $completed ? end($modules) : $modules[min(count($done), count($modules) - 1)],
                'completed_modules' => $done,
                'last_activity_at' => $lastDay,
                'completed_at' => $completed ? $lastDay : null,
                'completion_mode' => $completed ? StudentLessonProgress::COMPLETION_MODE_PATH : null,
            ]
        );

        $this->counters['lessonsStarted']++;
        if ($completed) {
            $this->counters['lessonsCompleted']++;
            $this->finalTest($student, $persona, $lesson, $lastDay);
        }
    }

    /**
     * Une séance de pratique complète : la séance, ses exercices, ses
     * questions, leurs reprises, les indices demandés et les preuves
     * d'apprentissage qui en découlent.
     */
    private function practiceSession(User $student, DemoPersona $persona, $lesson, array $exercises, Carbon $day): void
    {
        $level = $exercises[0]['level'];
        $at = $day->copy();

        $session = PracticeSession::create([
            'session_id' => (string) Str::uuid(),
            'user_id' => $student->id,
            'lesson_id' => $lesson->id,
            'level' => $level,
            'status' => 'completed',
            'started_at' => $at,
            'created_at' => $at,
            'updated_at' => $at,
        ]);
        $this->counters['sessions']++;

        $answered = 0;
        $correct = 0;
        $exercisesDone = 0;

        foreach ($exercises as $exercise) {
            $exerciseStart = $at->copy();
            $attempt = ExerciseAttempt::create([
                'practice_session_id' => $session->id,
                'exercise_id' => $exercise['id'],
                'level' => $exercise['level'],
                'status' => 'completed',
                'started_at' => $exerciseStart,
                'created_at' => $exerciseStart,
                'updated_at' => $exerciseStart,
            ]);
            $this->counters['exerciseAttempts']++;

            foreach ($exercise['questions'] as $question) {
                [$tries, $gotIt] = $this->answerQuestion(
                    $student, $persona, $attempt, $exercise, $question, $at, $lesson
                );
                $answered += $tries;
                $correct += $gotIt ? 1 : 0;
                $at = $at->copy()->addSeconds($this->nextInt(40, 150) * $tries);
            }

            $attempt->forceFill(['completed_at' => $at, 'updated_at' => $at])->save();
            $exercisesDone++;
        }

        $session->forceFill([
            'exercises_completed' => $exercisesDone,
            'questions_answered' => $answered,
            'correct_count' => $correct,
            'completed_at' => $at,
            'updated_at' => $at,
        ])->save();
    }

    /**
     * Une question, avec ses reprises. Renvoie [nombre de tentatives,
     * finalement réussie].
     *
     * C'est ici que « l'apprentissage » se voit : un élève persévérant
     * retente et finit souvent par trouver ; un élève en difficulté épuise
     * ses tentatives sur les points qui lui résistent.
     */
    private function answerQuestion(User $student, DemoPersona $persona, ExerciseAttempt $attempt, array $exercise, array $question, Carbon $at, $lesson): array
    {
        $primary = $question['learningPoints'][0]['code'] ?? null;
        // Un point de faiblesse déclaré du portrait fait chuter la réussite.
        $weak = $primary !== null && in_array($primary, $persona->weakPoints, true);
        $base = $weak ? $persona->accuracy * 0.42 : $persona->accuracy;
        // Les niveaux élevés sont plus durs.
        $base *= 1.0 - 0.06 * ($exercise['level'] - 1);

        $maxTries = $weak ? 3 : 2;
        $tries = 0;
        $gotIt = false;
        $when = $at->copy();

        while ($tries < $maxTries && ! $gotIt) {
            $tries++;
            // Chaque reprise progresse un peu : on apprend en retentant.
            $chance = min(0.95, $base + 0.15 * ($tries - 1));
            $gotIt = $this->chance($chance);

            $hints = 0;
            if (! $gotIt || $this->chance(0.12 * $persona->hintAppetite)) {
                $hints = min($question['hints'], $this->nextInt(0, $persona->hintAppetite));
            }

            $misconception = null;
            if (! $gotIt && $question['misconceptions'] !== []) {
                $misconception = $question['misconceptions'][$this->nextInt(0, count($question['misconceptions']) - 1)];
            }

            $row = QuestionAttempt::create([
                'exercise_attempt_id' => $attempt->id,
                'user_id' => $student->id,
                'question_id' => $question['id'],
                'attempt_uuid' => (string) Str::uuid(),
                'submitted_answer' => ['choice' => $gotIt ? 'B' : 'A'],
                'normalized_answer' => $gotIt ? 'B' : 'A',
                'outcome' => $gotIt ? 'correct' : 'incorrect',
                'hints_used' => $hints,
                'misconception_id' => $misconception,
                'attempt_number' => $tries,
                'started_at' => $when,
                'submitted_at' => $when->copy()->addSeconds($this->nextInt(25, 120)),
                'created_at' => $when,
                'updated_at' => $when,
            ]);
            $this->counters['questionAttempts']++;
            $this->counters[$gotIt ? 'correct' : 'incorrect']++;

            for ($h = 1; $h <= $hints; $h++) {
                HintEvent::create([
                    'question_attempt_id' => $row->id,
                    'hint_index' => $h,
                    'hint_type' => ['look', 'direction', 'strategy'][$h - 1] ?? 'strategy',
                    'requested_at' => $when->copy()->addSeconds(10 * $h),
                    'created_at' => $when,
                    'updated_at' => $when,
                ]);
                $this->counters['hints']++;
            }

            // La preuve d'apprentissage : la source que le moteur de maîtrise
            // consomme. Une par tentative, comme en production.
            $this->recordEvidence($student, $lesson, $exercise, $question, $gotIt, $hints, $misconception, $when);

            // Une erreur marquante alimente le cahier.
            if (! $gotIt && $misconception !== null) {
                $this->notes[] = [
                    'lesson' => $lesson,
                    'learningPointCode' => $primary,
                    'exerciseId' => $exercise['id'],
                    'questionId' => $question['id'],
                    'misconception' => $misconception,
                    'at' => $when,
                ];
            }

            $when = $when->copy()->addSeconds($this->nextInt(60, 200));

            if (! $gotIt && ! $this->chance($persona->persistence)) {
                break; // il abandonne cette question
            }
        }

        return [$tries, $gotIt];
    }

    /**
     * Écrit la preuve ET fait avancer la maîtrise — par la PORTE DE
     * PRODUCTION (ProgressEngine), jamais par une valeur choisie à la main ni
     * par une copie de la formule. Le jeu de démonstration obéit donc au
     * moteur de la version courante, classification des reprises comprise.
     */
    private function recordEvidence(User $student, $lesson, array $exercise, array $question, bool $isCorrect, int $hints, ?string $misconception, Carbon $when): void
    {
        app(ProgressEngine::class)->recordEvidence($student, $lesson->code, [
            'attemptId' => (string) Str::uuid(),
            'exerciseCode' => $exercise['id'],
            'questionId' => $question['id'],
            'assessmentType' => ProgressEngine::SOURCE_PRACTICE,
            'outcome' => $isCorrect ? 'correct' : 'incorrect',
            'learningPointRefs' => array_map(
                fn ($lp) => ['code' => $lp['code'], 'role' => $lp['role'] ?? 'primary'],
                $question['learningPoints'],
            ),
            'level' => $exercise['level'],
            'difficulty' => $exercise['level'],
            'hintsUsed' => $hints,
            'misconceptionId' => $misconception,
            'evaluatedBy' => 'server',
            'answer' => ['choice' => $isCorrect ? 'B' : 'A'],
            'submittedAt' => $when,
        ]);
        $this->counters['evidence']++;
    }

    /** Le test final d'une leçon terminée — un score cohérent avec le portrait. */
    private function finalTest(User $student, DemoPersona $persona, $lesson, Carbon $at): void
    {
        $total = $this->nextInt(4, 6);
        $score = 0;
        $answers = [];
        for ($i = 1; $i <= $total; $i++) {
            $ok = $this->chance(min(0.95, $persona->accuracy + 0.08));
            $score += $ok ? 1 : 0;
            $answers[] = ['questionId' => 'final-q'.$i, 'isCorrect' => $ok];
        }

        LessonFinalTestAttempt::updateOrCreate(
            ['user_id' => $student->id, 'lesson_id' => $lesson->id],
            ['score' => $score, 'total_questions' => $total, 'answers' => $answers, 'submitted_at' => $at]
        );
        $this->counters['finalTests']++;
    }

    /* ---- générateur déterministe (xorshift), pour un jeu reproductible ---- */

    private function nextInt(int $min, int $max): int
    {
        if ($max <= $min) {
            return $min;
        }
        $this->seed ^= ($this->seed << 13) & 0xFFFFFFFF;
        $this->seed ^= ($this->seed >> 17);
        $this->seed ^= ($this->seed << 5) & 0xFFFFFFFF;
        $this->seed &= 0xFFFFFFFF;

        return $min + ($this->seed % ($max - $min + 1));
    }

    private function chance(float $probability): bool
    {
        return $this->nextInt(0, 9999) < (int) round(max(0.0, min(1.0, $probability)) * 10000);
    }
}
