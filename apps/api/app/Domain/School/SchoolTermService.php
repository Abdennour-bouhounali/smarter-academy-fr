<?php

namespace App\Domain\School;

use App\Domain\Admin\ActivityLogger;
use App\Models\School;
use App\Models\SchoolTerm;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Les trois trimestres (« الفصول ») d'une année d'un établissement — les
 * rapports de fin de trimestre s'y rapporteront (SCHOOL_ADMIN_SPACE.md §7).
 *
 * Une année se règle d'un bloc : trois trimestres, dans l'ordre, sans
 * chevauchement, chacun commençant avant de finir.
 */
class SchoolTermService
{
    public function __construct(private ActivityLogger $logger) {}

    /** @return array<int, array{id: int, term: int, startsOn: string, endsOn: string}> */
    public function list(School $school, string $academicYear): array
    {
        return SchoolTerm::where('school_id', $school->id)
            ->where('academic_year', $academicYear)
            ->orderBy('term')
            ->get()
            ->map(fn (SchoolTerm $t) => [
                'id' => $t->id,
                'term' => $t->term,
                'startsOn' => $t->starts_on->format('Y-m-d'),
                'endsOn' => $t->ends_on->format('Y-m-d'),
            ])
            ->all();
    }

    /**
     * @param  array<int, array{term: int, startsOn: string, endsOn: string}>  $terms
     *
     * @throws SchoolException
     */
    public function replace(User $director, School $school, string $academicYear, array $terms): array
    {
        usort($terms, fn ($a, $b) => (int) $a['term'] <=> (int) $b['term']);
        if (array_map(fn ($t) => (int) $t['term'], $terms) !== [1, 2, 3]) {
            throw new SchoolException(SchoolException::INVALID_TERMS, 'Il faut les trois trimestres.');
        }

        $previousEnd = null;
        foreach ($terms as $t) {
            $start = Carbon::parse($t['startsOn']);
            $end = Carbon::parse($t['endsOn']);
            if ($start->gte($end) || ($previousEnd !== null && $start->lte($previousEnd))) {
                throw new SchoolException(SchoolException::INVALID_TERMS, 'Trimestres dans le désordre ou qui se chevauchent.');
            }
            $previousEnd = $end;
        }

        DB::transaction(function () use ($director, $school, $academicYear, $terms) {
            SchoolTerm::where('school_id', $school->id)->where('academic_year', $academicYear)->delete();
            foreach ($terms as $t) {
                $row = new SchoolTerm([
                    'academic_year' => $academicYear,
                    'term' => (int) $t['term'],
                    'starts_on' => $t['startsOn'],
                    'ends_on' => $t['endsOn'],
                ]);
                $row->school_id = $school->id;
                $row->save();
            }

            $this->logger->log($director, ActivityLogger::SCHOOL_TERMS_UPDATED, 'school', $school->id, null, [
                'academicYear' => $academicYear,
            ]);
        });

        return $this->list($school, $academicYear);
    }
}
