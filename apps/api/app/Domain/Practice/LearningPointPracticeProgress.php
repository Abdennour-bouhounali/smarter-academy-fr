<?php

namespace App\Domain\Practice;

use App\Models\ExerciseAttempt;
use App\Models\Lesson;
use App\Models\QuestionAttempt;
use App\Models\User;

/**
 * L'AVANCEMENT d'un élève dans la banque de pratique, par point
 * d'apprentissage — ce que le lecteur d'exercices affiche sous le nom du
 * point : « 3 / 8 تمارين · 27 / 64 سؤالًا ».
 *
 * Ce n'est PAS la maîtrise : la maîtrise (Mastery V2) vit dans
 * `student_learning_point_progress` et n'est pas recalculée ici. Ceci compte
 * seulement ce qui a été FAIT, à partir des tables qui le tiennent déjà :
 *  - un exercice appartient à un point quand au moins une de ses questions a
 *    ce point pour point PRINCIPAL (le contenu, lu par ExerciseRepository —
 *    la même source que les compteurs de niveaux) ;
 *  - le total de questions d'un point est la somme des questions RÉELLES de
 *    ses exercices (les exercices n'ont pas tous le même nombre de questions :
 *    4 + 6 + 3 = 13, jamais 3 × un nombre fixe) ;
 *  - un exercice est terminé quand une `exercise_attempts` de l'élève, dans
 *    une séance de cette leçon, est `completed` ;
 *  - une question est répondue quand une `question_attempts` de l'élève sur
 *    cette question a un `submitted_at` — juste ou fausse : répondre est
 *    l'activité, la justesse est l'affaire de la maîtrise.
 */
class LearningPointPracticeProgress
{
    public function __construct(private ExerciseRepository $exercises) {}

    /**
     * @return array<string, array{exercises: int, exercisesCompleted: int, questions: int, questionsAnswered: int}>
     */
    public function forLesson(User $user, Lesson $lesson): array
    {
        $contents = [];
        foreach ($this->exercises->allIdsFor($lesson->code) as $id) {
            $exercise = $this->exercises->find($lesson->code, $id);
            if (is_array($exercise)) {
                $contents[$id] = $exercise;
            }
        }

        $completed = ExerciseAttempt::query()
            ->join('practice_sessions', 'practice_sessions.id', '=', 'exercise_attempts.practice_session_id')
            ->where('practice_sessions.user_id', $user->id)
            ->where('practice_sessions.lesson_id', $lesson->id)
            ->where('exercise_attempts.status', 'completed')
            ->distinct()->pluck('exercise_attempts.exercise_id')->all();

        $answered = QuestionAttempt::query()
            ->join('exercise_attempts', 'exercise_attempts.id', '=', 'question_attempts.exercise_attempt_id')
            ->join('practice_sessions', 'practice_sessions.id', '=', 'exercise_attempts.practice_session_id')
            ->where('practice_sessions.user_id', $user->id)
            ->where('practice_sessions.lesson_id', $lesson->id)
            ->whereNotNull('question_attempts.submitted_at')
            ->selectRaw("DISTINCT CONCAT(exercise_attempts.exercise_id, '#', question_attempts.question_id) as k")
            ->pluck('k')->all();

        return self::tally($contents, $completed, $answered);
    }

    /**
     * Le calcul, pur (testé sans base).
     *
     * @param  array<string, array>  $exercises  id → contenu (avec `questions`)
     * @param  string[]  $completedExerciseIds
     * @param  string[]  $answeredKeys  « exerciseId#questionId »
     * @return array<string, array{exercises: int, exercisesCompleted: int, questions: int, questionsAnswered: int}>
     */
    public static function tally(array $exercises, array $completedExerciseIds, array $answeredKeys): array
    {
        $completed = array_flip($completedExerciseIds);
        $answered = array_flip($answeredKeys);
        $out = [];

        foreach ($exercises as $id => $exercise) {
            $questions = $exercise['questions'] ?? [];
            $points = [];
            foreach ($questions as $q) {
                foreach ($q['learningPoints'] ?? [] as $lp) {
                    if (($lp['role'] ?? null) === 'primary' && isset($lp['code'])) {
                        $points[$lp['code']] = true;
                    }
                }
            }

            $answeredHere = 0;
            foreach ($questions as $q) {
                if (isset($answered[$id.'#'.($q['id'] ?? '')])) {
                    $answeredHere++;
                }
            }

            foreach (array_keys($points) as $code) {
                $row = $out[$code] ?? ['exercises' => 0, 'exercisesCompleted' => 0, 'questions' => 0, 'questionsAnswered' => 0];
                $row['exercises']++;
                $row['exercisesCompleted'] += isset($completed[$id]) ? 1 : 0;
                $row['questions'] += count($questions);
                $row['questionsAnswered'] += $answeredHere;
                $out[$code] = $row;
            }
        }

        return $out;
    }
}
