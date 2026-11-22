<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Identity\PersonName;
use App\Domain\School\SchoolException;
use App\Domain\School\SchoolLicenceService;
use App\Domain\School\SchoolService;
use App\Http\Controllers\Controller;
use App\Models\Classroom;
use App\Models\School;
use App\Models\SchoolLicence;
use App\Models\SchoolTeacher;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * « Établissements » — l'administration crée les établissements et en nomme
 * le directeur (SCHOOL_ADMIN_SPACE.md §5).
 */
class AdminSchoolController extends Controller
{
    public function __construct(
        private SchoolService $schools,
        private SchoolLicenceService $licences,
    ) {}

    /**
     * Activer une licence (D1) : des sièges, une fin éventuelle, une note.
     * Le paiement se fait hors de la plateforme ; en activer une nouvelle
     * annule la précédente.
     */
    public function grantLicence(Request $request, int $id)
    {
        $school = $this->find($id);
        $data = $request->validate([
            'studentSeats' => ['required', 'integer', 'min:1', 'max:100000'],
            'endsAt' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->licences->grant($request->user(), $school, (int) $data['studentSeats'],
                isset($data['endsAt']) ? Carbon::parse($data['endsAt'])->endOfDay() : null, $data['note'] ?? null);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, ...$this->detail($school)], 201);
    }

    public function licenceStatus(Request $request, int $id)
    {
        $school = $this->find($id);
        $data = $request->validate(['status' => ['required', Rule::in(SchoolLicence::STATUSES)]]);

        try {
            $this->licences->setStatus($request->user(), $school, $data['status']);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, ...$this->detail($school)]);
    }

    public function index(Request $request)
    {
        $rows = $this->schools->list($request->query());

        return response()->json([
            'success' => true,
            'schools' => $rows->through(fn (School $s) => SchoolService::serialize($s)),
            'counts' => [
                'all' => School::count(),
                'active' => School::where('status', School::STATUS_ACTIVE)->count(),
                'suspended' => School::where('status', School::STATUS_SUSPENDED)->count(),
            ],
        ]);
    }

    public function show(int $id)
    {
        $school = $this->find($id);

        return response()->json(['success' => true, ...$this->detail($school)]);
    }

    public function store(Request $request)
    {
        $school = $this->schools->create($request->user(), $this->validated($request));

        return response()->json(['success' => true, ...$this->detail($school)], 201);
    }

    public function update(Request $request, int $id)
    {
        $school = $this->find($id);
        $school = $this->schools->update($request->user(), $school, $this->validated($request, $school, partial: true));

        return response()->json(['success' => true, ...$this->detail($school)]);
    }

    public function status(Request $request, int $id)
    {
        $school = $this->find($id);
        $data = $request->validate(['status' => ['required', Rule::in(School::STATUSES)]]);

        try {
            $school = $this->schools->setStatus($request->user(), $school, $data['status']);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, ...$this->detail($school)]);
    }

    /**
     * Le mot de passe n'existe en clair que dans CETTE réponse : `no-store`,
     * et l'interface l'affiche une fois.
     */
    public function appointDirector(Request $request, int $id)
    {
        $school = $this->find($id);
        PersonName::normalizeRequest($request);
        $data = $request->validate([
            ...PersonName::rules(),
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        try {
            ['director' => $director, 'password' => $password] = $this->schools->appointDirector($request->user(), $school, $data);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json([
            'success' => true,
            'director' => [
                'id' => $director->id,
                'firstName' => $director->first_name,
                'lastName' => $director->last_name,
                'email' => $director->email,
            ],
            'password' => $password,
        ], 201)->header('Cache-Control', 'no-store');
    }

    public function revokeDirector(Request $request, int $id)
    {
        $school = $this->find($id);

        try {
            $this->schools->revokeDirector($request->user(), $school);
        } catch (SchoolException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, ...$this->detail($school->fresh())]);
    }

    private function find(int $id): School
    {
        return School::findOrFail($id);
    }

    /** @return array<string, mixed> */
    private function detail(School $school): array
    {
        $school->load('activeDirector.user:id,first_name,last_name,email')->loadCount('classrooms');

        return [
            'school' => SchoolService::serialize($school),
            'counts' => [
                'classes' => Classroom::where('school_id', $school->id)->where('status', Classroom::STATUS_ACTIVE)->count(),
                'teachers' => SchoolTeacher::where('school_id', $school->id)->where('status', SchoolTeacher::STATUS_ACTIVE)->count(),
            ],
            'licence' => $this->licences->current($school),
        ];
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?School $school = null, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'min:2', 'max:255'],
            'wilaya' => ['sometimes', 'nullable', 'string', 'max:64'],
            'commune' => ['sometimes', 'nullable', 'string', 'max:96'],
            'code' => ['sometimes', 'nullable', 'string', 'max:32', Rule::unique('schools', 'code')->ignore($school?->id)],
            'currentAcademicYear' => ['sometimes', 'nullable', 'string', 'regex:/^\d{4}-\d{4}$/'],
        ]);
    }

    /** Un refus MÉTIER : 422, avec le motif clos. */
    public static function refuse(SchoolException $e)
    {
        return response()->json([
            'success' => false,
            'reason' => $e->reason,
            'message' => $e->getMessage(),
        ], 422);
    }
}
