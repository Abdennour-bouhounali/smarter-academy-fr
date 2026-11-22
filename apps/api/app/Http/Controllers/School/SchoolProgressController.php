<?php

namespace App\Http\Controllers\School;

use App\Domain\School\SchoolProgressService;
use App\Models\School;
use Illuminate\Http\Request;

/**
 * Le SUIVI, côté directeur (SCHOOL_ADMIN_SPACE.md §7, phase 4) : la carte des
 * الكفاءات d'un niveau, classe par classe (des effectifs, jamais une moyenne),
 * et le dossier d'un élève (le même que celui de son وليّ).
 */
class SchoolProgressController extends SchoolController
{
    public function __construct(private SchoolProgressService $progress) {}

    public function learningMap(Request $request)
    {
        return $this->withSchool($request, function (School $school) use ($request) {
            $grades = $this->progress->grades($school);
            $grade = (string) $request->query('grade', '');
            if (! in_array($grade, $grades, true)) {
                $grade = $grades[0] ?? '';
            }

            return [
                'grades' => $grades,
                'map' => $grade !== '' ? $this->progress->learningMap($school, $grade) : null,
            ];
        });
    }

    public function studentFile(Request $request, int $studentId)
    {
        return $this->withSchool($request, fn (School $school) => $this->progress->studentFile($school, $studentId));
    }
}
