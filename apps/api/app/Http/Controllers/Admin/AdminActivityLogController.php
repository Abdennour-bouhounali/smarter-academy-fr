<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;

class AdminActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = AdminActivityLog::with('admin:id,first_name,last_name,email');

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($entity = $request->query('entityType')) {
            $query->where('entity_type', $entity);
        }

        $logs = $query->latest()->paginate(min((int) $request->query('perPage', 50), 100));

        return response()->json([
            'success' => true,
            'logs' => $logs->through(fn (AdminActivityLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'entityType' => $log->entity_type,
                'entityId' => $log->entity_id,
                'before' => $log->before,
                'after' => $log->after,
                'admin' => trim(($log->admin?->first_name ?? '').' '.($log->admin?->last_name ?? '')) ?: $log->admin?->email,
                'createdAt' => $log->created_at,
            ]),
        ]);
    }
}
