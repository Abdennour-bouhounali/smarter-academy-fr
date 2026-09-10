<?php

namespace App\Domain\Progress\Support;

/**
 * Pure composition of the student's learning profile — takes plain arrays,
 * touches no Eloquent (same pattern as Diagnostic\Support\ProfileBuilder).
 *
 * The profile keeps INITIAL KNOWLEDGE (the diagnostic's completed
 * profile_summary — a frozen baseline snapshot) strictly separate from
 * CURRENT MASTERY (the live learning-point rollup fed by lesson assessment
 * evidence). They are different measurements at different times against
 * different vocabularies (diagnostic skills vs. learning points), so the
 * profile presents both rather than merging them into one number — that's
 * what lets "the student didn't know this initially" be distinguished from
 * "the student learned this during the course."
 */
class LearningProfileBuilder
{
    /**
     * @param  array<int, array{grade: string, completedAt: ?string, profile: array}>  $diagnosticBaselines
     *                                                                                                       One entry per grade with a completed diagnostic — the session's
     *                                                                                                       persisted profile_summary, verbatim.
     * @param  array<int, array{learningPointCode: string, learningPointTitle: string, lessonCode: string, lessonTitle: string, chapterCode: string, gradeCode: string, status: string, confidence: float, attempts: int, correctCount: int, lastEvidenceAt: ?string, diagnosticSkillId: ?string}>  $masteryRows
     * @return array{initialKnowledge: array, currentMastery: array}
     */
    public static function build(array $diagnosticBaselines, array $masteryRows): array
    {
        $byGrade = [];
        foreach ($masteryRows as $row) {
            $gradeCode = $row['gradeCode'];
            $lessonCode = $row['lessonCode'];

            $byGrade[$gradeCode] ??= ['grade' => $gradeCode, 'lessons' => []];
            $byGrade[$gradeCode]['lessons'][$lessonCode] ??= [
                'lesson' => $lessonCode,
                'title' => $row['lessonTitle'],
                'chapter' => $row['chapterCode'],
                'learningPoints' => [],
            ];

            $byGrade[$gradeCode]['lessons'][$lessonCode]['learningPoints'][] = [
                'code' => $row['learningPointCode'],
                'title' => $row['learningPointTitle'],
                'status' => $row['status'],
                'confidence' => $row['confidence'],
                'attempts' => $row['attempts'],
                'correctCount' => $row['correctCount'],
                'lastEvidenceAt' => $row['lastEvidenceAt'],
                // Advisory link into the diagnostic's skill vocabulary, when a
                // verified correspondence exists — lets a client show "the
                // diagnostic also looked at this" without conflating the two.
                'diagnosticSkillId' => $row['diagnosticSkillId'],
            ];
        }

        return [
            'initialKnowledge' => array_map(fn ($baseline) => [
                'source' => 'diagnostic',
                'grade' => $baseline['grade'],
                'completedAt' => $baseline['completedAt'],
                'profile' => $baseline['profile'],
            ], $diagnosticBaselines),
            'currentMastery' => array_values(array_map(function ($grade) {
                $grade['lessons'] = array_values($grade['lessons']);

                return $grade;
            }, $byGrade)),
        ];
    }
}
