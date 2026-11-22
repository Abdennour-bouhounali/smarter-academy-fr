<?php

namespace App\Domain\ClassSession;

use App\Models\Classroom;
use App\Models\ClassroomMembership;
use App\Models\ClassSeating;
use App\Models\ClassSession;
use App\Models\ClassSessionAnswer;
use App\Models\ClassTest;
use App\Models\User;
use Carbon\Carbon;
use DomainException;
use Illuminate\Support\Facades\DB;

/**
 * « حصّة القسم » — la séance en classe (CLASS_SESSION.md).
 *
 * Trois règles tenues ICI :
 *  1. le test PAR DÉFAUT d'une leçon est un fichier du dépôt, jamais écrasé : la copie d'un enseignant vit à côté, et la
 *     supprimer rend le défaut ;
 *  2. une séance ne nomme que des élèves ACTIFS de la classe ;
 *  3. rien de tout cela n'est une preuve d'apprentissage : aucune écriture dans learning_evidence ni dans la progression.
 */
class ClassSessionService
{
    public const KINDS = ['choice', 'truefalse', 'number'];

    /** Le test par défaut d'une leçon (start, end, pool), ou null quand la leçon n'en a pas. */
    public function defaultTest(string $lessonCode): ?array
    {
        if (! preg_match('/^[a-z0-9][a-z0-9-]{1,118}$/', $lessonCode)) {
            return null;
        }
        $matches = glob(rtrim(config('class_session.content_path'), '/')."/*/{$lessonCode}.json") ?: [];
        if ($matches === []) {
            return null;
        }
        $data = json_decode((string) file_get_contents($matches[0]), true);
        if (! is_array($data)) {
            return null;
        }

        return [
            'version' => (int) ($data['version'] ?? 1),
            'start' => array_values($data['start'] ?? []),
            'end' => array_values($data['end'] ?? []),
            'pool' => array_values($data['pool'] ?? []),
        ];
    }

    public function testFor(User $teacher, string $lessonCode): array
    {
        $mine = ClassTest::where('teacher_id', $teacher->id)->where('lesson_code', $lessonCode)->first();

        return [
            'lessonCode' => $lessonCode,
            'default' => $this->defaultTest($lessonCode),
            'mine' => $mine ? ['start' => $mine->questions['start'] ?? [], 'end' => $mine->questions['end'] ?? [], 'updatedAt' => $mine->updated_at?->toIso8601String()] : null,
        ];
    }

    /** Enregistre la copie de l'enseignant (les deux moments). Chaque question est remise en forme, jamais crue sur parole. */
    public function saveTest(User $teacher, string $lessonCode, array $start, array $end): array
    {
        $questions = ['start' => $this->cleanQuestions($start), 'end' => $this->cleanQuestions($end)];
        if ($questions['start'] === [] && $questions['end'] === []) {
            throw new DomainException('empty_test');
        }
        ClassTest::updateOrCreate(
            ['teacher_id' => $teacher->id, 'lesson_code' => $lessonCode],
            ['questions' => $questions, 'base_version' => $this->defaultTest($lessonCode)['version'] ?? null],
        );

        return $this->testFor($teacher, $lessonCode);
    }

    public function resetTest(User $teacher, string $lessonCode): array
    {
        ClassTest::where('teacher_id', $teacher->id)->where('lesson_code', $lessonCode)->delete();

        return $this->testFor($teacher, $lessonCode);
    }

    /** @return list<array<string, mixed>> */
    private function cleanQuestions(array $questions): array
    {
        $out = [];
        $seen = [];
        foreach (array_slice(array_values($questions), 0, (int) config('class_session.max_questions')) as $q) {
            if (! is_array($q)) {
                throw new DomainException('invalid_question');
            }
            $id = (string) ($q['id'] ?? '');
            $kind = (string) ($q['kind'] ?? '');
            $text = trim((string) ($q['text'] ?? ''));
            if (! preg_match('/^[A-Za-z0-9_-]{1,40}$/', $id) || isset($seen[$id]) || ! in_array($kind, self::KINDS, true) || $text === '' || mb_strlen($text) > 600) {
                throw new DomainException('invalid_question');
            }
            $seen[$id] = true;
            $clean = ['id' => $id, 'kind' => $kind, 'text' => $text, 'source' => ($q['source'] ?? 'platform') === 'teacher' ? 'teacher' : 'platform'];
            if (isset($q['item']) && is_string($q['item']) && preg_match('/^[a-z0-9.]{3,40}$/', $q['item'])) {
                $clean['item'] = $q['item'];
            }
            if ($kind === 'choice') {
                $options = array_values(array_map(fn ($o) => trim((string) $o), is_array($q['options'] ?? null) ? $q['options'] : []));
                $answer = $q['answer'] ?? null;
                if (count($options) < 2 || count($options) > 6 || in_array('', $options, true) || max(array_map('mb_strlen', $options)) > 200 || ! is_int($answer) || $answer < 0 || $answer >= count($options)) {
                    throw new DomainException('invalid_question');
                }
                $clean['options'] = $options;
                $clean['answer'] = $answer;
            } elseif ($kind === 'truefalse') {
                if (! is_bool($q['answer'] ?? null)) {
                    throw new DomainException('invalid_question');
                }
                $clean['answer'] = $q['answer'];
            } else {
                if (! is_numeric($q['answer'] ?? null)) {
                    throw new DomainException('invalid_question');
                }
                $clean['answer'] = $q['answer'] + 0;
            }
            foreach (['teaser' => 'is_bool', 'pairOf' => 'is_string'] as $key => $check) {
                if (isset($q[$key]) && $check($q[$key])) {
                    $clean[$key] = $key === 'pairOf' ? mb_substr($q[$key], 0, 40) : $q[$key];
                }
            }
            $out[] = $clean;
        }

        return $out;
    }

    // ───────────────────────────── le plan de la classe ─────────────────────────────

    public function seatingOf(Classroom $classroom): ?array
    {
        return ClassSeating::where('classroom_id', $classroom->id)->value('layout');
    }

    /** Le plan : des places (élève ACTIF de la classe, rangée, colonne, équipe), des équipes en nombre libre, le genre pour l'accord des phrases. */
    public function saveSeating(User $teacher, Classroom $classroom, array $layout): array
    {
        $members = $this->activeStudentIds($classroom);
        $seats = [];
        $taken = [];
        foreach (array_slice(array_values($layout['seats'] ?? []), 0, (int) config('class_session.max_seats')) as $seat) {
            $student = (int) ($seat['student'] ?? 0);
            if (! in_array($student, $members, true) || isset($taken[$student])) {
                continue; // un élève parti de la classe, ou placé deux fois : la place est ignorée, jamais une erreur
            }
            $taken[$student] = true;
            $clean = ['student' => $student, 'r' => max(0, min(19, (int) ($seat['r'] ?? 0))), 'c' => max(0, min(19, (int) ($seat['c'] ?? 0)))];
            if (isset($seat['team']) && is_string($seat['team']) && preg_match('/^[A-Za-z0-9_-]{1,40}$/', $seat['team'])) {
                $clean['team'] = $seat['team'];
            }
            $seats[] = $clean;
        }
        $teams = null;
        if (is_array($layout['teams'] ?? null) && $layout['teams'] !== []) {
            $teams = [];
            foreach (array_slice(array_values($layout['teams']), 0, (int) config('class_session.max_teams')) as $team) {
                $id = (string) ($team['id'] ?? '');
                $name = trim((string) ($team['name'] ?? ''));
                if (preg_match('/^[A-Za-z0-9_-]{1,40}$/', $id) && $name !== '' && mb_strlen($name) <= 40) {
                    $teams[] = ['id' => $id, 'name' => $name];
                }
            }
        }
        $names = [];
        foreach ((array) ($layout['teamNames'] ?? []) as $key => $name) {
            if (is_string($key) && preg_match('/^[A-Za-z0-9_-]{1,40}$/', $key) && is_string($name) && trim($name) !== '' && mb_strlen($name) <= 40) {
                $names[$key] = trim($name);
            }
        }
        $genders = [];
        foreach ((array) ($layout['genders'] ?? []) as $student => $g) {
            if (in_array((int) $student, $members, true) && in_array($g, ['f', 'm'], true)) {
                $genders[(int) $student] = $g;
            }
        }
        $clean = ['cols' => max(1, min(12, (int) ($layout['cols'] ?? 6))), 'seats' => $seats, 'teams' => $teams, 'teamNames' => (object) $names, 'genders' => (object) $genders];
        ClassSeating::updateOrCreate(['classroom_id' => $classroom->id], ['layout' => $clean, 'updated_by' => $teacher->id]);

        return $this->seatingOf($classroom);
    }

    // ───────────────────────────── les séances ─────────────────────────────

    /** Enregistre une séance terminée. Idempotent sur `uuid` : un envoi rejoué après une coupure ne double rien. */
    public function storeSession(User $teacher, Classroom $classroom, array $data): ClassSession
    {
        $existing = ClassSession::where('uuid', $data['uuid'])->first();
        if ($existing) {
            if ($existing->classroom_id !== $classroom->id) {
                throw new DomainException('uuid_taken');
            }

            return $existing;
        }
        $members = $this->activeStudentIds($classroom);
        $answers = array_values($data['answers']);
        foreach ($answers as $a) {
            if (isset($a['studentId']) && ! in_array((int) $a['studentId'], $members, true)) {
                throw new DomainException('not_a_member');
            }
        }
        $right = count(array_filter($answers, fn ($a) => (bool) $a['correct']));
        $total = count($answers);
        $given = is_array($data['summary'] ?? null) ? $data['summary'] : [];
        // le bilan chiffré est RECALCULÉ ici ; ce que l'écran a composé (équipes, كفاءات à revoir) est gardé tel quel, borné
        $items = [];
        foreach ($answers as $a) {
            $item = $a['item'] ?? null;
            if (! is_string($item) || ! preg_match('/^[a-z0-9.]{3,40}$/', $item)) {
                continue;
            }
            $items[$item] ??= ['item' => $item, 'right' => 0, 'total' => 0];
            $items[$item]['total']++;
            $items[$item]['right'] += $a['correct'] ? 1 : 0;
        }
        $summary = [
            'right' => $right, 'total' => $total, 'percent' => $total ? (int) round($right / $total * 100) : null,
            'items' => array_values($items), // par كفاءة, recalculé : c'est ce qui permet le « avant / après » de la classe
            'revise' => array_values(array_filter(array_slice((array) ($given['revise'] ?? []), 0, 12), fn ($i) => is_string($i) && preg_match('/^[a-z0-9.]{3,40}$/', $i))),
            'teams' => array_values(array_map(fn ($t) => ['id' => (string) ($t['id'] ?? ''), 'name' => mb_substr((string) ($t['name'] ?? ''), 0, 40), 'right' => (int) ($t['right'] ?? 0), 'total' => (int) ($t['total'] ?? 0)], array_slice((array) ($given['teams'] ?? []), 0, (int) config('class_session.max_teams')))),
        ];

        return DB::transaction(function () use ($teacher, $classroom, $data, $answers, $summary, $members) {
            $session = ClassSession::create([
                'uuid' => $data['uuid'], 'classroom_id' => $classroom->id, 'teacher_id' => $teacher->id, 'lesson_code' => $data['lessonCode'], 'moment' => $data['moment'],
                'started_at' => isset($data['startedAt']) ? Carbon::createFromTimestampMs((int) $data['startedAt']) : null,
                'finished_at' => isset($data['finishedAt']) ? Carbon::createFromTimestampMs((int) $data['finishedAt']) : now(),
                'absent' => array_values(array_intersect(array_map('intval', (array) ($data['absent'] ?? [])), $members)),
                'summary' => $summary,
            ]);
            foreach ($answers as $i => $a) {
                ClassSessionAnswer::create([
                    'class_session_id' => $session->id, 'position' => $i + 1, 'question_id' => (string) $a['questionId'], 'item' => $a['item'] ?? null,
                    'student_id' => isset($a['studentId']) ? (int) $a['studentId'] : null, 'team_id' => $a['teamId'] ?? null, 'correct' => (bool) $a['correct'],
                    'picked_by' => in_array($a['pickedBy'] ?? 'order', ['order', 'teacher', 'fair'], true) ? $a['pickedBy'] : 'order', 'ms' => isset($a['ms']) ? max(0, (int) $a['ms']) : null,
                ]);
            }

            return $session;
        });
    }

    /** Les dernières séances de la classe (bilans), et les tours de parole récents de chaque élève (pour le choix équitable). */
    public function recent(Classroom $classroom, ?string $lessonCode = null): array
    {
        $sessions = ClassSession::where('classroom_id', $classroom->id)
            ->when($lessonCode, fn ($q) => $q->where('lesson_code', $lessonCode))
            ->orderByDesc('finished_at')->limit(20)->get();
        $since = now()->subDays((int) config('class_session.turns_days'));
        $turns = DB::table('class_session_answers as a')->join('class_sessions as s', 's.id', '=', 'a.class_session_id')
            ->where('s.classroom_id', $classroom->id)->where('s.finished_at', '>=', $since)->whereNotNull('a.student_id')
            ->whereIn('a.student_id', $this->activeStudentIds($classroom))
            ->groupBy('a.student_id')->selectRaw('a.student_id, count(*) as n')->pluck('n', 'a.student_id');

        return [
            'sessions' => $sessions->map(fn (ClassSession $s) => $this->present($s))->all(),
            'turns' => (object) $turns->map(fn ($n) => (int) $n)->all(),
        ];
    }

    public function present(ClassSession $s): array
    {
        return ['uuid' => $s->uuid, 'lessonCode' => $s->lesson_code, 'moment' => $s->moment, 'finishedAt' => $s->finished_at?->toIso8601String(), 'summary' => $s->summary];
    }

    /** @return list<int> */
    private function activeStudentIds(Classroom $classroom): array
    {
        return ClassroomMembership::where('classroom_id', $classroom->id)->active()->pluck('student_id')->map(fn ($id) => (int) $id)->all();
    }
}
