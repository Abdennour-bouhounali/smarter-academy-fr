<?php

namespace App\Http\Controllers\School;

use App\Domain\School\SchoolReportService;
use App\Models\School;
use App\Models\SchoolReportSnapshot;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * « التقارير », côté directeur (SCHOOL_ADMIN_SPACE.md §7, phase 5) : générer
 * (figer), lister, relire, supprimer. Impression et export CSV : le client,
 * à partir de la même charge utile.
 */
class SchoolReportController extends SchoolController
{
    public function __construct(private SchoolReportService $reports) {}

    public function index(Request $request)
    {
        return $this->withSchool($request, fn (School $school) => ['reports' => $this->reports->list($school)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(SchoolReportSnapshot::TYPES)],
            'scope' => ['nullable', 'string', 'max:32'],
            'termId' => ['nullable', 'integer'],
        ]);

        return $this->withSchool($request, function (School $school) use ($request, $data) {
            $snapshot = $this->reports->generate($request->user(), $school, $data['type'], $data['scope'] ?? null, $data['termId'] ?? null);

            return response()->json(['success' => true, 'report' => SchoolReportService::full($snapshot, $school)], 201);
        });
    }

    public function show(Request $request, int $id)
    {
        return $this->withSchool($request, fn (School $school) => [
            'report' => SchoolReportService::full($this->reports->find($school, $id), $school),
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        return $this->withSchool($request, function (School $school) use ($request, $id) {
            $this->reports->delete($request->user(), $school, $id);

            return ['reports' => $this->reports->list($school)];
        });
    }
}
