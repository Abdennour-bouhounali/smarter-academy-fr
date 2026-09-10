<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Admin\AnalyticsService;
use App\Domain\Admin\DashboardService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboard,
        private AnalyticsService $analytics,
    ) {}

    public function index()
    {
        return response()->json([
            'success' => true,
            'dashboard' => $this->dashboard->overview(),
        ]);
    }

    public function platform(Request $request)
    {
        return response()->json([
            'success' => true,
            'analytics' => $this->analytics->platform($request->query('from'), $request->query('to')),
        ]);
    }

    public function learning(Request $request)
    {
        return response()->json([
            'success' => true,
            'analytics' => $this->analytics->learning($request->query('from'), $request->query('to')),
        ]);
    }

    public function content(Request $request)
    {
        return response()->json([
            'success' => true,
            'analytics' => $this->analytics->content($request->query()),
        ]);
    }

    public function learningPoints(Request $request)
    {
        return response()->json([
            'success' => true,
            'analytics' => $this->analytics->learningPoints([
                'lesson' => $request->query('lesson'),
                'search' => $request->query('search'),
                'onlyExposed' => $request->boolean('onlyExposed'),
            ]),
        ]);
    }
}
