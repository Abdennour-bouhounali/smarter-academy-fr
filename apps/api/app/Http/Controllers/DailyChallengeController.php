<?php

namespace App\Http\Controllers;

use App\Domain\DailyChallenge\ChallengeException;
use App\Domain\DailyChallenge\DailyChallengeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * « التحدّي اليومي » côté élève. L'élève est toujours `$request->user()` ;
 * une tentative se résout par son uuid ET son propriétaire (404 sinon).
 *
 * Aucun champ de score, de temps, de justesse ou de série n'est lu dans une
 * requête : le client envoie une position et une réponse brute.
 */
class DailyChallengeController extends Controller
{
    public function __construct(private DailyChallengeService $challenges) {}

    /** GET /daily-challenge — l'écran du jour (génère le défi une fois). */
    public function today(Request $request): JsonResponse
    {
        return response()->json(['success' => true] + $this->challenges->today($request->user()));
    }

    /** POST /daily-challenge/start — ouvre ou retrouve LA tentative du jour. */
    public function start(Request $request): JsonResponse
    {
        try {
            $attempt = $this->challenges->start($request->user());
        } catch (ChallengeException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true] + $this->challenges->state($attempt));
    }

    /** GET /daily-challenge/attempts/{uuid} — reprise après rechargement. */
    public function show(Request $request, string $uuid): JsonResponse
    {
        try {
            $attempt = $this->challenges->owned($request->user(), $uuid);
        } catch (ChallengeException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true] + $this->challenges->state($attempt));
    }

    /** POST /daily-challenge/attempts/{uuid}/next — sert la question suivante. */
    public function next(Request $request, string $uuid): JsonResponse
    {
        try {
            $attempt = $this->challenges->owned($request->user(), $uuid);
            $question = $this->challenges->next($attempt);
        } catch (ChallengeException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, 'question' => $question, 'attempt' => $this->challenges->attemptSummary($attempt->fresh())]);
    }

    /** POST /daily-challenge/attempts/{uuid}/answers — {position, answer}. */
    public function answer(Request $request, string $uuid): JsonResponse
    {
        $data = $request->validate([
            'position' => 'required|integer|min:1|max:20',
            'answer' => 'present|nullable|array',
        ]);

        try {
            $attempt = $this->challenges->owned($request->user(), $uuid);
            $result = $this->challenges->answer($request->user(), $attempt, (int) $data['position'], $data['answer']);
        } catch (ChallengeException $e) {
            return self::refuse($e);
        }

        $payload = ['success' => true] + $result;
        if ($result['attempt']['status'] !== 'in_progress') {
            $payload['completion'] = $this->completion($request, $uuid);
        }

        return response()->json($payload, $result['duplicate'] ? 200 : 201);
    }

    /** POST /daily-challenge/attempts/{uuid}/complete — idempotent. */
    public function complete(Request $request, string $uuid): JsonResponse
    {
        try {
            $attempt = $this->challenges->owned($request->user(), $uuid);
            $this->challenges->complete($attempt);
        } catch (ChallengeException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true, 'completion' => $this->completion($request, $uuid)]);
    }

    /** GET /daily-challenge/history */
    public function history(Request $request): JsonResponse
    {
        $days = (int) ($request->validate(['days' => 'nullable|integer|min:7|max:60'])['days'] ?? 30);

        return response()->json(['success' => true] + $this->challenges->history($request->user(), $days));
    }

    /** GET /daily-challenge/attempts/{uuid}/review — une tentative close. */
    public function review(Request $request, string $uuid): JsonResponse
    {
        try {
            $attempt = $this->challenges->owned($request->user(), $uuid);
            $review = $this->challenges->review($attempt);
        } catch (ChallengeException $e) {
            return self::refuse($e);
        }

        return response()->json(['success' => true] + $review);
    }

    /** L'écran de fin : la tentative, la série, le rang (s'il est montrable), la suite. */
    private function completion(Request $request, string $uuid): array
    {
        $user = $request->user();
        $attempt = $this->challenges->owned($user, $uuid);
        $ctx = $this->challenges->context($user);
        $date = $attempt->challenge_date->format('Y-m-d');
        $competition = $attempt->scope_type === $ctx['scopeType'] && $attempt->scope_id === $ctx['scopeId']
            ? $this->challenges->competitionView($ctx, $user, $date)
            : null;
        $summary = $this->challenges->attemptSummary($attempt);
        // Le rang n'est pas montré quand l'enseignant ne l'a pas ouvert.
        if (($competition['myRank'] ?? null) === null) {
            $summary['rankBefore'] = null;
            $summary['rankAfter'] = null;
        }

        return [
            'attempt' => $summary,
            'streak' => $this->challenges->streak($user, $date),
            'competition' => $competition,
            'insights' => $this->challenges->insights($attempt),
        ];
    }

    public static function refuse(ChallengeException $e): JsonResponse
    {
        return response()->json(['success' => false, 'reason' => $e->reason, 'message' => $e->getMessage()], $e->status());
    }
}
