<?php

namespace App\Http\Controllers;

use App\Domain\Progress\Explain\MasteryExplainer;
use App\Models\LearningPoint;
use Illuminate\Http\Request;

/**
 * « Pourquoi suis-je considéré comme maîtrisant ce point ? » — pour l'élève,
 * sur SES points seulement (le jeton décide de qui). Assemblé à la demande
 * depuis l'état canonique et les dernières preuves ; rien n'est stocké.
 */
class LearningPointExplanationController extends Controller
{
    public function __construct(private MasteryExplainer $explainer) {}

    public function show(Request $request, string $code)
    {
        $point = LearningPoint::where('code', $code)->first();
        if ($point === null) {
            abort(404);
        }

        return response()->json([
            'success' => true,
            'explanation' => $this->explainer->explain($request->user()->id, $point),
        ]);
    }
}
